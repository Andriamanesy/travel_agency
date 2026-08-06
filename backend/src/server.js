const http = require('http');
const url = require('url');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
// Formidable v3 expose sa fonction de création sous un export nommé.
const { formidable } = require('formidable');
const { Pool } = require('pg');

const PASSWORD_MIN_LENGTH = 6;
const {
    loadAuthorization,
    signAccessToken,
    authenticate,
    issueRefreshToken,
    revokeAll,
    hash,
    checkPermission,
    checkRole,
    ownerCheck
} = require('./auth');

/**
 * Construit les liens envoyés par e-mail à partir de l'URL publique du site.
 * Cette URL doit être configurée dans l'environnement de déploiement, par
 * exemple : https://voyages.example.com
 */
function buildPublicLink(pathname, token) {
    const publicAppUrl = process.env.PUBLIC_APP_URL;
    if (!publicAppUrl) {
        throw new Error('PUBLIC_APP_URL doit être configurée pour générer les liens e-mail.');
    }

    let link;
    try {
        link = new URL(pathname, publicAppUrl.endsWith('/') ? publicAppUrl : `${publicAppUrl}/`);
    } catch {
        throw new Error('PUBLIC_APP_URL doit être une URL absolue valide.');
    }
    link.searchParams.set('token', token);
    return link.toString();
}

// Configuration robuste de la connexion PostgreSQL
const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
              host: process.env.DB_HOST || 'localhost',
              user: process.env.DB_USER || 'travel_user',
              password: process.env.DB_PASSWORD || 'travel_password',
              database: process.env.DB_NAME || 'travel_db',
              port: process.env.DB_PORT || 5432
          }
);

// Création du dossier de stockage des photos sur le serveur (s'il n'existe pas)
const UPLOAD_DIR = path.join(__dirname, '../public', 'uploads', 'avatars');

async function ensureUploadDir() {
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
}

function parseMultipartForm(form, req) {
    return new Promise((resolve, reject) => {
        form.parse(req, (error, fields, files) => {
            if (error) return reject(error);
            resolve({ fields, files });
        });
    });
}

async function removeFileIfExists(filePath) {
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('[Upload] Impossible de supprimer le fichier:', error.message);
        }
    }
}

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,translations';
const COUNTRIES_CACHE_DURATION_MS = 60 * 60 * 1000;
let countriesCache = { countries: null, expiresAt: 0 };

// Le navigateur ne contacte pas directement le service externe : cela évite
// les erreurs CORS et permet de limiter proprement le temps d'attente.
async function getCountries() {
    if (countriesCache.countries && countriesCache.expiresAt > Date.now()) {
        return countriesCache.countries;
    }

    const response = await fetch(REST_COUNTRIES_URL, {
        signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) {
        throw new Error(`RestCountries a répondu ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error('Réponse RestCountries invalide.');
    }
    const countries = [...new Set(payload
        .map(country => country.translations?.fra?.common || country.name?.common)
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr'));

    if (countries.length === 0) {
        throw new Error('Liste de pays invalide.');
    }

    countriesCache = {
        countries,
        expiresAt: Date.now() + COUNTRIES_CACHE_DURATION_MS
    };
    return countries;
}

// Fonction utilitaire pour hacher le mot de passe
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === storedHash;
}

function validatePassword(password, label = 'Le mot de passe') {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return `${label} doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
    }
    return null;
}

function validateBirthdate(birthdate) {
    if (typeof birthdate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
        return 'La date de naissance est obligatoire et doit être au format AAAA-MM-JJ.';
    }

    const [year, month, day] = birthdate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return 'La date de naissance est invalide.';
    }

    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const age = new Date(todayUtc).getUTCFullYear() - year
        - (todayUtc < Date.UTC(new Date(todayUtc).getUTCFullYear(), month - 1, day) ? 1 : 0);

    if (age < 13 || age > 120) {
        return 'Vous devez avoir entre 13 et 120 ans.';
    }
    return null;
}

// Fonction sécurisée pour parser le corps d'une requête JSON
function parseJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                const syntaxError = new Error('Format JSON invalide.');
                syntaxError.statusCode = 400;
                reject(syntaxError);
            }
        });
        req.on('error', () => {
            const netError = new Error('Erreur de lecture des données.');
            netError.statusCode = 400;
            reject(netError);
        });
    });
}

// Configuration des en-têtes CORS et réponse JSON
function sendResponse(res, statusCode, data, extraHeaders = {}) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...extraHeaders
    });
    res.end(JSON.stringify(data));
}

// Récupération sécurisée de l'utilisateur par token
async function getUserByToken(req) {
    try { await authenticate(pool, req); } catch { return null; }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.auth.id]);
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
        // --- 1. SERVICE DES FICHIERS STATIQUES (Pour afficher les images uploadées) ---
        if (pathname.startsWith('/uploads/') && method === 'GET') {
            const filePath = path.join(__dirname, '../public', pathname);
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Fichier non trouvé');
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.webp': 'image/webp'
                };
                res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
                res.end(content);
            });
            return;
        }

        // --- ROUTE : Accueil / Healthcheck ---
        if (pathname === '/' && method === 'GET') {
            return sendResponse(res, 200, { status: 'API Travel Agency en ligne' });
        }

        // --- ROUTE : Liste des pays (proxy RestCountries avec cache) ---
        if (pathname === '/api/countries' && method === 'GET') {
            try {
                return sendResponse(res, 200, { countries: await getCountries() });
            } catch (error) {
                console.warn('[RestCountries]', error.message);
                return sendResponse(res, 503, { error: 'Service de pays temporairement indisponible.' });
            }
        }

        // --- ROUTE : Inscription ---
        if (pathname === '/api/register' && method === 'POST') {
            const { name, email, password } = await parseJSONBody(req);
            if (typeof name !== 'string' || typeof email !== 'string' || !name.trim() || !email.trim() || !password) {
                return sendResponse(res, 400, { error: 'Tous les champs sont obligatoires.' });
            }
            const passwordError = validatePassword(password);
            if (passwordError) {
                return sendResponse(res, 400, { error: passwordError });
            }

            const cleanEmail = email.toLowerCase().trim();
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationLink = buildPublicLink('/verify-email.html', verificationToken);
            const { salt, hash } = hashPassword(password);

            const query = `
                INSERT INTO users (name, email, password_hash, salt, verification_token)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, email, is_verified
            `;
            const values = [name.trim(), cleanEmail, hash, salt, verificationToken];
            
            try {
                const result = await pool.query(query, values);
                await pool.query(`INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE code = 'client' ON CONFLICT DO NOTHING`, [result.rows[0].id]);
                console.log(`[Email de vérification] Lien : ${verificationLink}`);

                return sendResponse(res, 201, {
                    message: 'Inscription réussie. Veuillez vérifier votre e-mail.',
                    user: result.rows[0]
                });
            } catch (dbErr) {
                if (dbErr.code === '23505') {
                    return sendResponse(res, 400, { error: 'Cet e-mail est déjà utilisé.' });
                }
                throw dbErr;
            }
        }

        // --- ROUTE : Connexion ---
        if (pathname === '/api/login' && method === 'POST') {
            const { email, password } = await parseJSONBody(req);
            if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
                return sendResponse(res, 400, { error: 'Email et mot de passe requis.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
            if (result.rows.length === 0) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }

            const user = result.rows[0];
            const isValid = verifyPassword(password, user.salt, user.password_hash);

            if (!isValid) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }
            if (!user.is_verified) {
                return sendResponse(res, 403, { error: 'Veuillez vérifier votre e-mail avant de vous connecter.' });
            }

            const auth = await loadAuthorization(pool, user.id);
            const sessionToken = signAccessToken(auth);
            const refreshToken = await issueRefreshToken(pool, user.id);

            return sendResponse(res, 200, {
                message: 'Connexion réussie.',
                token: sessionToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    birthdate: user.birth_date,
                    gender: user.gender,
                    nationality: user.nationality,
                    country: user.country,
                    city: user.city,
                    postalCode: user.postal_code,
                    address: user.address,
                    preferredLang: user.preferred_lang,
                    avatar_url: user.avatar_url,
                    is_verified: user.is_verified
                }
            }, { 'Set-Cookie': `travelms_refresh=${refreshToken}; HttpOnly; Path=/api; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}` });
        }

        // --- ROUTE : Vérification d'e-mail ---
        if (pathname === '/api/verify' && method === 'GET') {
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

        // --- ROUTE : Mot de passe oublié ---
        if (pathname === '/api/forgot-password' && method === 'POST') {
            const { email } = await parseJSONBody(req);
            if (typeof email !== 'string' || !email.trim()) {
                return sendResponse(res, 400, { error: 'Email requis.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetLink = buildPublicLink('/reset-password.html', resetToken);
            const expires = new Date(Date.now() + 3600000);

            const result = await pool.query(
                'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id',
                [resetToken, expires, cleanEmail]
            );

            if (result.rowCount > 0) {
                console.log(`[Réinitialisation MDP] Lien : ${resetLink}`);
            }

            return sendResponse(res, 200, { message: 'Si cet e-mail existe, un lien de réinitialisation a été envoyé.' });
        }

        // --- ROUTE : Réinitialisation du mot de passe avec token à usage unique ---
        if (pathname === '/api/reset-password' && method === 'POST') {
            const { token, password } = await parseJSONBody(req);
            if (!token || !password) {
                return sendResponse(res, 400, { error: 'Token et nouveau mot de passe requis.' });
            }
            const passwordError = validatePassword(password);
            if (passwordError) {
                return sendResponse(res, 400, { error: passwordError });
            }

            const userResult = await pool.query(
                `SELECT id FROM users
                 WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP`,
                [token]
            );
            if (userResult.rowCount === 0) {
                return sendResponse(res, 400, { error: 'Le lien de réinitialisation est invalide ou expiré.' });
            }

            const { salt, hash } = hashPassword(password);
            await pool.query(
                `UPDATE users
                 SET password_hash = $1, salt = $2, reset_token = NULL,
                     reset_token_expires = NULL, session_token = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [hash, salt, userResult.rows[0].id]
            );
            await revokeAll(pool, userResult.rows[0].id);

            return sendResponse(res, 200, {
                message: 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.'
            });
        }

        // --- ROUTE : Déconnexion et invalidation de la session en base ---
        if (pathname === '/api/logout' && method === 'POST') {
            const user = await getUserByToken(req);
            if (!user) {
                return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            }

            await revokeAll(pool, user.id);
            return sendResponse(res, 200, { message: 'Déconnexion réussie.' }, { 'Set-Cookie': 'travelms_refresh=; HttpOnly; Path=/api; Max-Age=0; SameSite=Lax' });
        }

        if (pathname === '/api/refresh' && method === 'POST') {
            const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('travelms_refresh='))?.slice('travelms_refresh='.length);
            if (!token) return sendResponse(res, 401, { error: 'Refresh token manquant.' });
            const { rows } = await pool.query('SELECT user_id FROM refresh_tokens WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>CURRENT_TIMESTAMP', [hash(token)]);
            if (!rows[0]) return sendResponse(res, 401, { error: 'Refresh token invalide.' });
            await pool.query('UPDATE refresh_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=$1', [hash(token)]);
            const auth = await loadAuthorization(pool, rows[0].user_id);
            if (!auth?.is_active) return sendResponse(res, 401, { error: 'Compte inactif.' });
            const fresh = await issueRefreshToken(pool, auth.id);
            return sendResponse(res, 200, { token: signAccessToken(auth) }, { 'Set-Cookie': `travelms_refresh=${fresh}; HttpOnly; Path=/api; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}` });
        }

        if (pathname === '/api/admin/users' && method === 'GET') {
            const user = await getUserByToken(req);
            if (!user || !req.auth.permissions.includes('users:read:any')) return sendResponse(res, 403, { error: 'Permission insuffisante.' });
            const { rows } = await pool.query(`SELECT u.id,u.name,u.email,u.is_active,COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL),'{}') roles FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id GROUP BY u.id ORDER BY u.created_at DESC`);
            return sendResponse(res, 200, { users: rows });
        }

        const roleMatch = pathname.match(/^\/api\/admin\/users\/([0-9a-f-]+)\/roles$/i);
        if (roleMatch && method === 'PUT') {
            const user = await getUserByToken(req);
            if (!user || !req.auth.permissions.includes('users:update:any')) return sendResponse(res, 403, { error: 'Permission insuffisante.' });
            const { roles } = await parseJSONBody(req);
            if (!Array.isArray(roles) || roles.length === 0 || roles.some(role => !['admin', 'agent', 'client'].includes(role))) {
                return sendResponse(res, 400, { error: 'Liste de rôles invalide.' });
            }
            const targetId = roleMatch[1];
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const target = await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [targetId]);
                if (!target.rows[0]) { await client.query('ROLLBACK'); return sendResponse(res, 404, { error: 'Utilisateur introuvable.' }); }
                await client.query('DELETE FROM user_roles WHERE user_id=$1', [targetId]);
                await client.query(`INSERT INTO user_roles (user_id,role_id) SELECT $1,id FROM roles WHERE code = ANY($2::text[])`, [targetId, roles]);
                await client.query('UPDATE users SET authz_version=authz_version+1 WHERE id=$1', [targetId]);
                await client.query('UPDATE refresh_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND revoked_at IS NULL', [targetId]);
                await client.query('COMMIT');
                return sendResponse(res, 200, { message: 'Rôles mis à jour ; les sessions existantes ont été révoquées.' });
            } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
        }

        // --- ROUTE : Changement de mot de passe ---
        if (pathname === '/api/change-password' && method === 'PUT') {
            const user = await getUserByToken(req);
            if (!user) {
                return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            }

            const { currentPassword, newPassword } = await parseJSONBody(req);
            if (!currentPassword || !newPassword) {
                return sendResponse(res, 400, { error: 'Ancien et nouveau mots de passe requis.' });
            }
            const passwordError = validatePassword(newPassword, 'Le nouveau mot de passe');
            if (passwordError) {
                return sendResponse(res, 400, { error: passwordError });
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

        // --- ROUTE : MISE À JOUR COMPLETE DU PROFIL ET DE L'IMAGE (/api/profile/update) ---
        if (pathname === '/api/profile/update' && method === 'POST') {
            let uploadedFile;
            try {
                const user = await getUserByToken(req);
                if (!user) {
                    return sendResponse(res, 401, { success: false, error: 'Accès non autorisé. Token invalide.' });
                }

                // Garantit le dossier à chaque upload, y compris après un redémarrage.
                await ensureUploadDir();

                const form = formidable({
                    uploadDir: UPLOAD_DIR,
                    keepExtensions: true,
                    maxFileSize: 5 * 1024 * 1024,
                    filter: ({ mimetype }) => !mimetype || ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype),
                    filename: (name, ext, part) => {
                        const extension = {
                            'image/jpeg': '.jpg',
                            'image/png': '.png',
                            'image/webp': '.webp'
                        }[part.mimetype] || '';
                        return `avatar-${user.id}-${Date.now()}${extension}`;
                    }
                });

                const { fields, files } = await parseMultipartForm(form, req);
                const getVal = (field) => Array.isArray(field) ? field[0] : field;

                const name = getVal(fields.name) || user.name;
                const email = (getVal(fields.email) || user.email).toLowerCase().trim();
                if (!name.trim() || !email) {
                    return sendResponse(res, 400, { success: false, error: 'Nom et e-mail sont requis.' });
                }
                const phone = getVal(fields.phone) || null;
                const birthdate = getVal(fields.birthdate) || null;
                const birthdateError = validateBirthdate(birthdate);
                if (birthdateError) {
                    return sendResponse(res, 400, { success: false, error: birthdateError });
                }
                const gender = getVal(fields.gender) || null;
                const nationality = getVal(fields.nationality) || null;
                const country = getVal(fields.country) || null;
                const city = getVal(fields.city) || null;
                const postalCode = getVal(fields.postalCode) || null;
                const address = getVal(fields.address) || null;
                const preferredLang = getVal(fields.preferredLang) || 'fr';

                let avatarUrl = user.avatar_url;
                uploadedFile = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

                if (uploadedFile) {
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(uploadedFile.mimetype)) {
                        await removeFileIfExists(uploadedFile.filepath);
                        return sendResponse(res, 400, { success: false, error: 'Format d’image non autorisé.' });
                    }
                    avatarUrl = `/uploads/avatars/${uploadedFile.newFilename}`;
                }

                const updateQuery = `
                    UPDATE users SET
                        name = $1, email = $2, phone = $3, birth_date = $4, gender = $5,
                        nationality = $6, country = $7, city = $8, postal_code = $9,
                        address = $10, preferred_lang = $11, avatar_url = $12, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $13
                    RETURNING id, name, email, phone, birth_date AS "birthdate", gender,
                        nationality, country, city, postal_code AS "postalCode", address,
                        preferred_lang AS "preferredLang", avatar_url;
                `;
                const values = [
                    name.trim(), email, phone, birthdate, gender, nationality,
                    country, city, postalCode, address, preferredLang, avatarUrl, user.id
                ];
                const result = await pool.query(updateQuery, values);
                const updatedUser = result.rows[0];

                // Supprime l’ancien avatar seulement après la mise à jour SQL réussie.
                if (uploadedFile && user.avatar_url?.startsWith('/uploads/avatars/')) {
                    await removeFileIfExists(path.join(UPLOAD_DIR, path.basename(user.avatar_url)));
                }

                return sendResponse(res, 200, {
                    success: true,
                    message: 'Profil mis à jour avec succès.',
                    user: updatedUser
                });
            } catch (error) {
                // Ne pas masquer la cause dans les logs : code PostgreSQL, erreur Formidable, I/O, etc.
                console.error('[Profile update] Échec de mise à jour:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });

                if (uploadedFile?.filepath) {
                    await removeFileIfExists(uploadedFile.filepath);
                }
                if (error.code === '23505') {
                    return sendResponse(res, 409, { success: false, error: 'Cet e-mail est déjà utilisé.' });
                }
                if (error.code === 'ETOOBIG') {
                    return sendResponse(res, 413, { success: false, error: 'L’image ne doit pas dépasser 5 Mo.' });
                }
                return sendResponse(res, 500, { success: false, error: 'Erreur interne lors de la mise à jour du profil.' });
            }
            return;
        }

        // --- ROUTE : Profil (Ancienne route GET / PUT conservée pour compatibilité) ---
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
                    phone: user.phone,
                    birthdate: user.birth_date,
                    gender: user.gender,
                    nationality: user.nationality,
                    country: user.country,
                    city: user.city,
                    postalCode: user.postal_code,
                    address: user.address,
                    preferredLang: user.preferred_lang,
                    avatar_url: user.avatar_url,
                    is_verified: user.is_verified
                });
            }

            if (method === 'PUT') {
                const { name, email } = await parseJSONBody(req);
                if (!name || !email) {
                    return sendResponse(res, 400, { error: 'Nom et email requis.' });
                }

                const cleanEmail = email.toLowerCase().trim();
                try {
                    const result = await pool.query(
                        'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email',
                        [name.trim(), cleanEmail, user.id]
                    );

                    return sendResponse(res, 200, {
                        message: 'Profil mis à jour avec succès.',
                        user: result.rows[0]
                    });
                } catch (dbErr) {
                    if (dbErr.code === '23505') {
                        return sendResponse(res, 400, { error: 'Cet e-mail est déjà utilisé par un autre compte.' });
                    }
                    throw dbErr;
                }
            }
        }

        // Route par défaut (404 Not Found)
        sendResponse(res, 404, { error: 'Route introuvable.' });

    } catch (err) {
        console.error('[Erreur Interne]', err);
        const statusCode = err.statusCode || 500;
        const errorMessage = statusCode === 400 ? err.message : 'Erreur interne du serveur.';
        sendResponse(res, statusCode, { error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
async function bootstrapAdmin() {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    if (!email) return;
    const result = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!result.rows[0]) {
        console.warn('[RBAC] BOOTSTRAP_ADMIN_EMAIL ne correspond à aucun utilisateur.');
        return;
    }
    const userId = result.rows[0].id;
    await pool.query('DELETE FROM user_roles WHERE user_id=$1', [userId]);
    await pool.query(`INSERT INTO user_roles (user_id,role_id) SELECT $1,id FROM roles WHERE code='admin'`, [userId]);
    await revokeAll(pool, userId);
    console.log('[RBAC] Administrateur initial configuré.');
}

bootstrapAdmin()
    .then(() => server.listen(PORT, () => console.log(`Serveur Node.js natif démarré sur le port ${PORT}`)))
    .catch(error => { console.error('[RBAC] Initialisation impossible:', error); process.exit(1); });
