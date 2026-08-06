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
    const from = process.env.SMTP_FROM;
    if (!from) {
        throw new Error('SMTP_FROM doit être configurée.');
    }
    return createTransport().sendMail({ from, ...message });
}

function verificationContent(link) {
    return {
        subject: 'Confirmez votre adresse e-mail – Travel Agency',
        text: `Bienvenue sur Travel Agency. Confirmez votre adresse e-mail : ${link}`,
        html: `<p>Bienvenue sur Travel Agency.</p><p><a href="${link}">Confirmer mon adresse e-mail</a></p>`
    };
}

function resetContent(link) {
    return {
        subject: 'Réinitialisation de votre mot de passe – Travel Agency',
        text: `Réinitialisez votre mot de passe Travel Agency : ${link}`,
        html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${link}">Réinitialiser mon mot de passe</a></p>`
    };
}

function sendVerificationEmail(to, link) {
    return sendMail({ to, ...verificationContent(link) });
}

function sendPasswordResetEmail(to, link) {
    return sendMail({ to, ...resetContent(link) });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
