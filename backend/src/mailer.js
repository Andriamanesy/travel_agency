const nodemailer = require('nodemailer');

function createTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('Configuration SMTP incomplète ou invalide.');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
    });
}

async function sendMail(message) {
    const from = process.env.SMTP_FROM || 'no-reply@travel-agency.local';

    // Si la configuration SMTP est incomplète, ne pas empêcher le flux
    // d'inscription pendant le développement : journaliser le message
    // et retourner une promesse résolue. En production, configurez
    // correctement `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` et `SMTP_FROM`.
    try {
        const transport = createTransport();
        return transport.sendMail({ from, ...message });
    } catch (err) {
        console.warn('[SMTP] Configuration manquante ou invalide :', err.message);
        console.log('[SMTP-FALLBACK] Mail envoyé en mode journalisation :', JSON.stringify({ from, ...message }, null, 2));
        return Promise.resolve({ fallback: true });
    }
}

function verificationContent(link) {
    const subject = 'Confirmez votre adresse e-mail – Travel Agency';
    let html = `<p>Bienvenue sur Travel Agency.</p><p><a href="${link}">Confirmer mon adresse e-mail</a></p>`;
    let text = `Bienvenue sur Travel Agency. Confirmez votre adresse e-mail : ${link}`;
    try {
        const template = require('fs').readFileSync(require('path').join(__dirname, '../templates/verification_email.html'), 'utf8');
        html = template.replace(/{{VERIFY_LINK}}/g, link);
    } catch (err) {
        // fallback to simple html
    }
    return { subject, text, html };
}

function resetContent(link) {
    const subject = 'Réinitialisation de votre mot de passe – Travel Agency';
    let html = `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${link}">Réinitialiser mon mot de passe</a></p>`;
    let text = `Réinitialisez votre mot de passe Travel Agency : ${link}`;
    try {
        const template = require('fs').readFileSync(require('path').join(__dirname, '../templates/reset_password_email.html'), 'utf8');
        html = template.replace(/{{RESET_LINK}}/g, link);
    } catch (err) {
        // fallback
    }
    return { subject, text, html };
}

function sendVerificationEmail(to, link) {
    return sendMail({ to, ...verificationContent(link) });
}

function sendPasswordResetEmail(to, link) {
    return sendMail({ to, ...resetContent(link) });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
