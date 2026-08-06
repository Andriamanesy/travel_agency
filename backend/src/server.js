const http = require('http');
const url = require('url');
const crypto = require('crypto');
const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/travelms'
});

// Fonction utilitaire pour hacher le mot de passe (Module natif crypto)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === storedHash;
}

// Fonction pour parser le corps d'une requête JSON
function parseJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

// Configuration des en-têtes CORS et réponse JSON
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

// Fonction utilitaire pour récupérer l'utilisateur à partir du header Authorization
async function getUserByToken(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    const result = await pool.query('SELECT * FROM users WHERE session_token = $1', [token]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

// Création du serveur HTTP natif
const server = http.createServer(async (req, res) => {
    // Gestion des requêtes preflight CORS (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    try {
        // --- ROUTE : Inscription (Version 1.0) ---
        if (pathname === '/api/auth/register' && method === 'POST') {
            const { name, email, password } = await parseJSONBody(req);
            if (!name || !email || !password) {
                return sendResponse(res, 400, { error: 'Tous les champs sont obligatoires.' });
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            const { salt, hash } = hashPassword(password);

            const query = `
                INSERT INTO users (name, email, password_hash, salt, verification_token)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, email, is_verified
            `;
            const values = [name, email, hash, salt, verificationToken];
            const result = await pool.query(query, values);

            console.log(`[Email de vérification] Lien : http://localhost/verify-email.html?token=${verificationToken}`);

            return sendResponse(res, 201, {
                message: 'Inscription réussie. Veuillez vérifier votre e-mail.',
                user: result.rows[0]
            });
        }

        // --- ROUTE : Connexion (Version 1.0) ---
        if (pathname === '/api/auth/login' && method === 'POST') {
            const { email, password } = await parseJSONBody(req);
            if (!email || !password) {
                return sendResponse(res, 400, { error: 'Email et mot de passe requis.' });
            }

            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }

            const user = result.rows[0];
            const isValid = verifyPassword(password, user.salt, user.password_hash);

            if (!isValid) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }

            // Génération et stockage du token de session en base de données
            const sessionToken = crypto.randomBytes(32).toString('hex');
            await pool.query('UPDATE users SET session_token = $1 WHERE id = $2', [sessionToken, user.id]);

            return sendResponse(res, 200, {
                message: 'Connexion réussie.',
                token: sessionToken,
                user: { id: user.id, name: user.name, email: user.email, is_verified: user.is_verified }
            });
        }

        // --- ROUTE : Vérification d'e-mail (Version 1.5) ---
        if (pathname === '/api/auth/verify' && method === 'GET') {
            const token = parsedUrl.query.token;
            if (!token) {
                return sendResponse(res, 400, { error: 'Token manquant.' });
            }

            const result = await pool.query(
                'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
                [token]
            );

            if (result.rowCount === 0) {
                return sendResponse(res, 400, { error: 'Token invalide ou expiré.' });
            }

            return sendResponse(res, 200, { message: 'E-mail vérifié avec succès.' });
        }

        // --- ROUTE : Mot de passe oublié (Version 1.4) ---
        if (pathname === '/api/auth/forgot-password' && method === 'POST') {
            const { email } = await parseJSONBody(req);
            if (!email) {
                return sendResponse(res, 400, { error: 'Email requis.' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 3600000); // 1 heure

            const result = await pool.query(
                'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id',
                [resetToken, expires, email]
            );

            if (result.rowCount > 0) {
                console.log(`[Réinitialisation MDP] Lien : http://localhost/reset-password.html?token=${resetToken}`);
            }

            return sendResponse(res, 200, { message: 'Si cet e-mail existe, un lien de réinitialisation a été envoyé.' });
        }

        // --- ROUTE : Changement de mot de passe (Version 1.3) ---
        if (pathname === '/api/auth/change-password' && method === 'PUT') {
            const user = await getUserByToken(req);
            if (!user) {
                return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            }

            const { currentPassword, newPassword } = await parseJSONBody(req);
            if (!currentPassword || !newPassword) {
                return sendResponse(res, 400, { error: 'Ancien et nouveau mots de passe requis.' });
            }

            const isValid = verifyPassword(currentPassword, user.salt, user.password_hash);
            if (!isValid) {
                return sendResponse(res, 400, { error: 'L\'ancien mot de passe est incorrect.' });
            }

            const { salt, hash } = hashPassword(newPassword);
            await pool.query(
                'UPDATE users SET password_hash = $1, salt = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                [hash, salt, user.id]
            );

            return sendResponse(res, 200, { message: 'Mot de passe mis à jour avec succès.' });
        }

        // --- ROUTE : Profil (Version 1.1 - GET & Version 1.2 - PUT) ---
        if (pathname === '/api/profile') {
            const user = await getUserByToken(req);
            if (!user) {
                return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            }

            if (method === 'GET') {
                return sendResponse(res, 200, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    is_verified: user.is_verified
                });
            }

            if (method === 'PUT') {
                const { name, email } = await parseJSONBody(req);
                if (!name || !email) {
                    return sendResponse(res, 400, { error: 'Nom et email requis.' });
                }

                const result = await pool.query(
                    'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email',
                    [name, email, user.id]
                );

                return sendResponse(res, 200, {
                    message: 'Profil mis à jour avec succès.',
                    user: result.rows[0]
                });
            }
        }

        // Route par défaut (404 Not Found)
        sendResponse(res, 404, { error: 'Route introuvable.' });

    } catch (err) {
        console.error(err);
        sendResponse(res, 500, { error: 'Erreur interne du serveur.' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur Node.js natif démarré sur le port ${PORT}`);
});