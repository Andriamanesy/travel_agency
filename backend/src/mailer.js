const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function createTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('Configuration SMTP incomplète ou invalide.');
    }

    const options = {
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true'
    };
    // MailHog et certains relais internes n'utilisent pas d'authentification.
    if (user && pass) options.auth = { user, pass };
    return nodemailer.createTransport(options);
}

async function sendMail(message) {
    const from = process.env.SMTP_FROM || 'no-reply@travel-agency.local';

    try {
        const transport = createTransport();
        const result = await transport.sendMail({ from, ...message });
        console.log('[SMTP] E-mail envoyé avec succès :', {
            to: message.to,
            subject: message.subject,
            messageId: result?.messageId
        });
        return result;
    } catch (err) {
        console.error('[SMTP] Échec de l’envoi du mail :', {
            to: message.to,
            subject: message.subject,
            error: err?.message,
            stack: err?.stack,
            smtpHost: process.env.SMTP_HOST,
            smtpPort: process.env.SMTP_PORT,
            smtpSecure: process.env.SMTP_SECURE,
            hasAuth: Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD)
        });
        console.log('[SMTP-FALLBACK] Mail non envoyé. Vérifiez la configuration SMTP.');
        return Promise.resolve({ fallback: true, error: err?.message });
    }
}

function verificationContent(link) {
    const subject = 'Confirmez votre adresse e-mail – Travel Agency';
    const text = [
        'Bienvenue chez Travel Agency.',
        '',
        'Confirmez votre adresse e-mail pour activer votre espace personnel et sécuriser votre compte.',
        `Confirmer mon adresse e-mail : ${link}`,
        '',
        'Ce lien est personnel et utilisable une seule fois. Si vous n’avez pas créé de compte, ignorez cet e-mail.'
    ].join('\n');
    const html = renderTemplate('verification_email.html', 'VERIFY_LINK', link, verificationFallback(link));
    return { subject, text, html };
}

function resetContent(link) {
    const subject = 'Réinitialisation de votre mot de passe – Travel Agency';
    const text = [
        'Demande de réinitialisation de mot de passe.',
        '',
        'Utilisez le lien ci-dessous pour choisir un nouveau mot de passe pour votre compte Travel Agency.',
        `Choisir un nouveau mot de passe : ${link}`,
        '',
        'Ce lien expire dans 1 heure et ne peut être utilisé qu’une seule fois. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.'
    ].join('\n');
    const html = renderTemplate('reset_password_email.html', 'RESET_LINK', link, resetFallback(link));
    return { subject, text, html };
}

function invitationContent(link) {
    const subject = 'Invitation TravelMS – Votre espace collaborateur';
    const text = [
        'Bonjour,',
        '',
        'Vous avez été invité à rejoindre TravelMS en tant qu’agent.',
        `Créer votre compte et finaliser votre accès : ${link}`,
        '',
        'Ce lien est personnel et expire dans 7 jours. Si vous n’êtes pas à l’origine de cette invitation, ignorez cet e-mail.'
    ].join('\n');
    return {
        subject,
        text,
        html: emailShell({
            eyebrow: 'INVITATION COLLABORATEUR',
            title: 'Activez votre accès agent',
            message: 'Vous avez été invité à rejoindre TravelMS en tant qu’agent. Utilisez le bouton ci-dessous pour créer votre compte et accéder à votre espace de travail.',
            action: 'Créer mon compte',
            link,
            accent: '#7c3aed',
            notice: '<strong>Sécurité :</strong> ce lien est personnel, utilisable une seule fois et expire dans 7 jours.'
        })
    };
}

function renderTemplate(filename, placeholder, link, fallback) {
    try {
        return fs
            .readFileSync(path.join(__dirname, '../templates', filename), 'utf8')
            .replace(new RegExp(`{{${placeholder}}}`, 'g'), link);
    } catch (err) {
        // Un incident de packaging ne doit jamais renvoyer un e-mail minimaliste.
        console.warn(`[SMTP] Modèle ${filename} indisponible :`, err.message);
        return fallback;
    }
}

function emailShell({ eyebrow, title, message, action, link, notice, accent = '#2563eb' }) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b"><div style="padding:32px 12px"><div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,.12)"><div style="padding:27px 36px;background:#0f172a;color:#fff;font-size:24px;font-weight:700">✈ Travel Agency</div><div style="padding:36px"><p style="margin:0;color:${accent};font-size:12px;font-weight:700;letter-spacing:1.5px">${eyebrow}</p><h1 style="font-size:26px;margin:10px 0 16px">${title}</h1><p style="line-height:1.65">${message}</p><p style="margin:28px 0;text-align:center"><a href="${link}" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;padding:15px 24px;border-radius:10px;font-weight:700">${action}</a></p><div style="background:#f8fafc;border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.5">${notice}</div><p style="font-size:12px;line-height:1.5;word-break:break-all;color:#475569">Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :<br><a href="${link}">${link}</a></p></div><div style="padding:22px 36px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center">© 2026 Travel Agency</div></div></div></body></html>`;
}

function verificationFallback(link) {
    return emailShell({
        eyebrow: 'BIENVENUE À BORD',
        title: 'Activez votre compte',
        message: 'Merci de rejoindre Travel Agency. Confirmez votre adresse e-mail pour activer votre espace personnel et sécuriser votre compte.',
        action: 'Confirmer mon adresse e-mail',
        link,
        notice: '<strong>Conseil sécurité :</strong> ce lien est personnel et utilisable une seule fois. Si vous n’avez pas créé de compte, ignorez cet e-mail.'
    });
}

function resetFallback(link) {
    return emailShell({
        eyebrow: 'SÉCURITÉ DU COMPTE',
        title: 'Réinitialisez votre mot de passe',
        message: 'Une demande de réinitialisation vient d’être effectuée pour votre compte Travel Agency. Utilisez le bouton ci-dessous pour choisir un nouveau mot de passe.',
        action: 'Choisir un nouveau mot de passe',
        link,
        accent: '#ea580c',
        notice: '<strong>Important :</strong> ce lien expire dans <strong>1 heure</strong> et ne peut être utilisé qu’une seule fois. Vous n’êtes pas à l’origine de cette demande ? Ignorez cet e-mail.'
    });
}

function bookingConfirmationContent(booking) {
    const subject = `Réservation reçue – ${booking.offer_title} | Travel Agency`;
    const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(booking.total_price));
    const details = `${booking.offer_title} · du ${booking.start_date} au ${booking.end_date} · ${booking.participants_count} participant${booking.participants_count > 1 ? 's' : ''}`;
    const text = [
        `Bonjour ${booking.customer_name || ''},`,
        '',
        'Votre demande de réservation a bien été reçue.',
        details,
        `Montant total : ${amount}`,
        '',
        'Statut : en attente de confirmation. Notre équipe vous recontactera prochainement.'
    ].join('\n');
    const html = emailShell({
        eyebrow: 'RÉSERVATION REÇUE',
        title: 'Votre voyage se prépare',
        message: `Bonjour ${booking.customer_name || ''}, votre demande de réservation a bien été enregistrée.`,
        action: 'Voir mes réservations',
        link: `${process.env.PUBLIC_APP_URL || 'http://localhost:8080'}/dashboard.html`,
        notice: `<strong>${booking.offer_title}</strong><br>Du ${booking.start_date} au ${booking.end_date} · ${booking.participants_count} participant${booking.participants_count > 1 ? 's' : ''}<br><strong>Montant total : ${amount}</strong><br><br>Votre réservation est <strong>en attente de confirmation</strong>.`,
        accent: '#0f766e'
    });
    return { subject, text, html };
}

function sendVerificationEmail(to, link) {
    return sendMail({ to, ...verificationContent(link) });
}

function sendPasswordResetEmail(to, link) {
    return sendMail({ to, ...resetContent(link) });
}

function sendStaffInvitationEmail(to, link) {
    return sendMail({ to, ...invitationContent(link) });
}

function sendBookingConfirmationEmail(to, booking) {
    return sendMail({ to, ...bookingConfirmationContent(booking) });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendBookingConfirmationEmail, sendStaffInvitationEmail };
