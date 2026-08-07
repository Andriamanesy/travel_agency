const http = require('http');
const url = require('url');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

function loadEnvFile() {
    const envFilePath = path.join(__dirname, '../../database/.env.db');
    try {
        const raw = fs.readFileSync(envFilePath, 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const separatorIndex = trimmed.indexOf('=');
            if (separatorIndex === -1) continue;
            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('[Env] Impossible de charger le fichier database/.env.db:', error.message);
        }
    }
}

loadEnvFile();
// Formidable v3 expose sa fonction de création sous un export nommé.
const { formidable } = require('formidable');
const { Pool } = require('pg');
const { sendVerificationEmail, sendPasswordResetEmail, sendBookingConfirmationEmail, sendStaffInvitationEmail } = require('./mailer');
const { handleCatalogRequest } = require('./catalog');
const { handleAdminBackoffice } = require('./admin-backoffice');
const { handleAdminRbac } = require('./admin-rbac');
const { handleLandingApi } = require('./landing');
const { writeAudit } = require('./audit');

const UPLOAD_DIR = path.join(__dirname, '../public', 'uploads');
const USER_UPLOAD_DIR = path.join(UPLOAD_DIR, 'users');
const DESTINATION_UPLOAD_DIR = path.join(UPLOAD_DIR, 'destinations');
const CIRCUIT_UPLOAD_DIR = path.join(UPLOAD_DIR, 'circuits');
const BANNER_UPLOAD_DIR = path.join(UPLOAD_DIR, 'banners');
const GUIDE_UPLOAD_DIR = path.join(UPLOAD_DIR, 'guides');
const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (typeof fetch !== 'function') {
    throw new Error('Le runtime Node.js doit supporter fetch() (Node 18+).');
}

const PASSWORD_MIN_LENGTH = 12;
const {
    loadAuthorization,
    signAccessToken,
    authenticate,
    requireAuth,
    issueRefreshToken,
    revokeAll,
    hash,
    checkPermission,
    checkRole,
    ownerCheck,
    createAuthorizationGuard
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
    process.env.DB_HOST
        ? {
              host: process.env.DB_HOST || 'localhost',
              user: process.env.DB_USER || process.env.POSTGRES_USER || 'travel_user',
              password: String(process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'travel_password'),
              database: process.env.DB_NAME || process.env.POSTGRES_DB || 'travel_db',
              port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
              ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
          }
        : { connectionString: process.env.DATABASE_URL }
);

const publicAppOrigin = (() => {
    const raw = process.env.PUBLIC_APP_URL;
    if (!raw) return null;
    try {
        return new URL(raw).origin;
    } catch {
        return null;
    }
})();

function getCorsOrigin(origin) {
    if (process.env.NODE_ENV !== 'production') {
        return origin || '*';
    }

    if (!origin || !publicAppOrigin) {
        return null;
    }

    return origin === publicAppOrigin ? origin : null;
}

function newEmailToken() {
    return crypto.randomBytes(32).toString('base64url');
}

async function createVerificationToken(client, userId) {
    const token = newEmailToken();
    await client.query(
        'DELETE FROM email_verification_tokens WHERE user_id = $1 AND used_at IS NULL',
        [userId]
    );
    await client.query(
        `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '24 hours')`,
        [userId, hash(token)]
    );
    return token;
}

async function createPasswordResetToken(client, userId) {
    const token = newEmailToken();
    await client.query(
        'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL',
        [userId]
    );
    await client.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour')`,
        [userId, hash(token)]
    );
    return token;
}

// Création du dossier de stockage des photos sur le serveur (s'il n'existe pas)

async function ensureDirectory(dir) {
    await fs.promises.mkdir(dir, { recursive: true });
}

async function ensureUploadDir() {
    await ensureDirectory(UPLOAD_DIR);
}

async function ensureMediaDirectories() {
    await Promise.all([
        ensureDirectory(USER_UPLOAD_DIR),
        ensureDirectory(DESTINATION_UPLOAD_DIR),
        ensureDirectory(CIRCUIT_UPLOAD_DIR),
        ensureDirectory(BANNER_UPLOAD_DIR),
        ensureDirectory(GUIDE_UPLOAD_DIR)
    ]);
}

async function ensureDestinationUploadDir() {
    await ensureDirectory(DESTINATION_UPLOAD_DIR);
}

function sanitizeFileName(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 180);
}

function buildDestinationFileName(destinationId, originalName) {
    const ext = path.extname(originalName) || '.jpg';
    const baseName = sanitizeFileName(path.basename(originalName, ext));
    // Millisecondes : plusieurs fichiers portant le même nom peuvent être
    // envoyés durant la même seconde sans s'écraser.
    const timestamp = Date.now();
    return `dest_${destinationId}_${timestamp}_${baseName}${ext}`;
}

function destinationStoragePath(imageUrl) {
    const prefix = '/uploads/destinations/';
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith(prefix)) return null;
    const fileName = path.basename(imageUrl);
    return path.join(DESTINATION_UPLOAD_DIR, fileName);
}

function userStoragePath(imageUrl) {
    if (typeof imageUrl !== 'string') return null;
    const isCurrentPath = imageUrl.startsWith('/uploads/users/');
    const isLegacyPath = imageUrl.startsWith('/uploads/avatars/');
    if (!isCurrentPath && !isLegacyPath) return null;
    // Les anciens avatars étaient enregistrés à la racine uploads malgré leur
    // URL /avatars. Cette branche permet leur nettoyage sans exposer de chemin.
    const baseDir = isLegacyPath ? UPLOAD_DIR : USER_UPLOAD_DIR;
    return path.join(baseDir, path.basename(imageUrl));
}

function toFileArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

async function moveFileToDestinationDir(srcFilePath, destFileName) {
    const destPath = path.join(DESTINATION_UPLOAD_DIR, destFileName);
    await fs.promises.rename(srcFilePath, destPath);
    return destPath;
}

async function cleanupUploadedPaths(paths) {
    await Promise.all(paths.map(async (filePath) => {
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('[Upload] Échec du nettoyage du fichier :', filePath, error.message);
            }
        }
    }));
}

function parseMultipartForm(form, req) {
    return new Promise((resolve, reject) => {
        form.parse(req, (error, fields, files) => {
            if (error) return reject(error);
            resolve({ fields, files });
        });
    });
}

async function getDestinationGallery(destinationId) {
    const { rows } = await pool.query(
        `SELECT id, image_url, created_at FROM destination_images WHERE destination_id = $1 ORDER BY created_at ASC`,
        [destinationId]
    );
    return rows;
}

async function getDestinationById(id) {
    const { rows } = await pool.query('SELECT * FROM destinations WHERE id = $1', [id]);
    const destination = rows[0] || null;
    if (!destination) return null;
    const gallery = await getDestinationGallery(destination.id);
    return {
        ...destination,
        cover_image: destination.cover_image || destination.image_url || '',
        image_url: destination.cover_image || destination.image_url || '',
        gallery
    };
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

// bcrypt inclut le sel dans le hash : aucune donnée secrète complémentaire
// ne doit être stockée séparément. Le champ salt historique est conservé
// temporairement pour la compatibilité des bases déjà créées.
async function hashPassword(password) {
    return { salt: '', hash: await bcrypt.hash(password, 12) };
}

async function verifyPassword(password, salt, storedHash) {
    if (typeof storedHash !== 'string') return false;
    if (storedHash.startsWith('$2')) return bcrypt.compare(password, storedHash);
    // Migration progressive des anciens hashes PBKDF2.
    const legacy = crypto.pbkdf2Sync(password, salt || '', 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(storedHash));
}

function validatePassword(password, label = 'Le mot de passe') {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
        return `${label} doit contenir entre ${PASSWORD_MIN_LENGTH} et 128 caractères.`;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) {
        return `${label} doit contenir une minuscule, une majuscule, un chiffre et un caractère spécial.`;
    }
    return null;
}

function validateEmail(email) {
    return typeof email === 'string'
        && email.length <= 254
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function slugify(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value !== 'string') return false;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

function validateDestinationPayload(body, isUpdate = false) {
    const raw = Object.fromEntries(Object.entries(body).map(([key, value]) => [key, firstValue(value)]));
    const price = raw.price === undefined || raw.price === null || raw.price === ''
        ? NaN
        : Number(raw.price);

    const payload = {
        title: raw.title?.trim?.() || '',
        description: raw.description?.trim?.() || '',
        price,
        location: raw.location?.trim?.() || '',
        cover_image: raw.cover_image?.trim?.() || '',
        is_active: raw.is_active === undefined ? true : parseBoolean(raw.is_active),
        category_id: raw.category_id === undefined || raw.category_id === '' ? null : Number(raw.category_id)
    };

    const errors = [];
    if (!payload.title) errors.push('Le titre de la destination est requis.');
    if (!payload.location) errors.push('Le lieu de la destination est requis.');
    if (!payload.description) errors.push('La description est requise.');
    if (!payload.cover_image && !raw.has_cover_upload) errors.push('Une image de couverture ou son URL est requise.');
    if (Number.isNaN(payload.price)) {
        errors.push('Le prix est invalide.');
    }
    if (payload.category_id !== null && (!Number.isInteger(payload.category_id) || payload.category_id < 1)) {
        errors.push('La catégorie est invalide.');
    }

    if (errors.length > 0) {
        const error = new Error(errors.join(' '));
        error.statusCode = 400;
        throw error;
    }

    return payload;
}

function isUuid(value) {
    return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
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
    const allowedOrigin = getCorsOrigin(res._origin);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...extraHeaders
    });
    res.end(JSON.stringify(data));
    // Les handlers modulaires renvoient cette valeur au routeur principal :
    // elle indique que la requête a été traitée et empêche le fallback 404.
    return true;
}

// Récupération sécurisée de l'utilisateur par token
async function getUserByToken(req) {
    try { await authenticate(pool, req); } catch { return null; }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.auth.id]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

// Création du serveur HTTP natif
const server = http.createServer(async (req, res) => {
    res._origin = req.headers.origin || null;

    // Gestion des requêtes preflight CORS (OPTIONS)
    if (req.method === 'OPTIONS') {
        const origin = getCorsOrigin(req.headers.origin);
        if (!origin) {
            res.writeHead(403);
            res.end();
            return;
        }
        res.writeHead(204, {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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
            const uploadBase = path.join(__dirname, '../public', 'uploads');
            const filePath = path.normalize(path.join(__dirname, '../public', pathname));
            const relativePath = path.relative(uploadBase, filePath);
            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('Accès refusé');
                return;
            }

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

        // /healthz sert les sondes internes Docker ; /api/healthz traverse le
        // reverse-proxy public et permet de vérifier l'intégralité du chemin
        // Nginx hôte → frontend React → backend.
        if ((pathname === '/healthz' || pathname === '/api/healthz') && method === 'GET') {
            await pool.query('SELECT 1');
            return sendResponse(res, 200, { status: 'ok' });
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

        if (await handleCatalogRequest({
            pathname,
            method,
            parsedUrl,
            req,
            res,
            pool,
            sendResponse,
            parseJSONBody,
            getUserByToken,
            slugify,
            sendBookingConfirmationEmail
        })) return;

        if (await handleLandingApi({
            pathname, method, req, res, pool, sendResponse, parseJSONBody, getUserByToken
        })) return;

        if (await handleAdminRbac({
            pathname, method, parsedUrl, req, res, pool, sendResponse, parseJSONBody, getUserByToken
        })) return;

        if (await handleAdminBackoffice({
            pathname,
            method,
            parsedUrl,
            req,
            res,
            pool,
            sendResponse,
            parseJSONBody,
            getUserByToken
        })) return;

        // --- ROUTE : Liste publique des destinations ---
        if (pathname === '/api/destinations' && method === 'GET') {
            const page = Number(parsedUrl.query.page) >= 1 ? Number(parsedUrl.query.page) : 1;
            const limit = Number(parsedUrl.query.limit) >= 1 && Number(parsedUrl.query.limit) <= 100 ? Number(parsedUrl.query.limit) : 12;
            const sort = ['price_asc', 'price_desc', 'created_at_asc', 'created_at_desc'].includes(parsedUrl.query.sort)
                ? parsedUrl.query.sort
                : 'created_at_desc';

            const orderBy = {
                price_asc: 'd.price ASC',
                price_desc: 'd.price DESC',
                created_at_asc: 'd.created_at ASC',
                created_at_desc: 'd.created_at DESC'
            }[sort];

            const offset = (page - 1) * limit;
            const search = typeof parsedUrl.query.q === 'string' ? parsedUrl.query.q.trim() : '';
            const categoryId = Number.parseInt(parsedUrl.query.category_id, 10);
            const filters = ['d.is_active = TRUE'];
            const values = [];
            if (search) {
                values.push(`%${search}%`);
                filters.push(`(d.title ILIKE $${values.length} OR d.description ILIKE $${values.length} OR d.location ILIKE $${values.length})`);
            }
            if (Number.isInteger(categoryId) && categoryId > 0) {
                values.push(categoryId);
                filters.push(`d.category_id = $${values.length}`);
            }
            const where = filters.join(' AND ');
            const totalResult = await pool.query(`SELECT COUNT(*)::int AS count FROM destinations d WHERE ${where}`, values);
            values.push(limit, offset);
            const { rows } = await pool.query(
                `SELECT d.id, d.title, d.description, d.price, d.location, d.cover_image, d.created_at,
                        d.category_id, c.name AS category_name, c.slug AS category_slug
                 FROM destinations d LEFT JOIN categories c ON c.id=d.category_id
                 WHERE ${where}
                 ORDER BY ${orderBy}
                 LIMIT $${values.length - 1} OFFSET $${values.length}`,
                values
            );
            return sendResponse(res, 200, {
                destinations: rows.map(destination => ({
                    ...destination,
                    image_url: destination.cover_image
                })),
                pagination: {
                    page,
                    limit,
                    total: totalResult.rows[0].count,
                    pages: Math.ceil(totalResult.rows[0].count / limit),
                    sort
                }
            });
        }

        const publicDestinationMatch = pathname.match(/^\/api\/destinations\/([0-9a-fA-F-]{36})$/);
        if (publicDestinationMatch && method === 'GET') {
            const destination = await getDestinationById(publicDestinationMatch[1]);
            if (!destination || !destination.is_active) {
                return sendResponse(res, 404, { error: 'Destination introuvable.' });
            }
            return sendResponse(res, 200, { destination });
        }

        // --- ROUTE : Inscription ---
        if (pathname === '/api/register' && method === 'POST') {
            const { name, email, password, invitation_token: invitationToken } = await parseJSONBody(req);
            if (typeof name !== 'string' || name.trim().length > 100 || !validateEmail(email) || !password) {
                return sendResponse(res, 400, { error: 'Tous les champs sont obligatoires.' });
            }
            const passwordError = validatePassword(password);
            if (passwordError) {
                return sendResponse(res, 400, { error: passwordError });
            }

            const cleanEmail = email.toLowerCase().trim();
            const { salt, hash: passwordHash } = await hashPassword(password);
            
            const client = await pool.connect();
            let transactionOpen = false;
            try {
                await client.query('BEGIN');
                transactionOpen = true;
                const result = await client.query(
                    `INSERT INTO users (name, email, password_hash, salt)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id, name, email, is_verified`,
                    [name.trim(), cleanEmail, passwordHash, salt]
                );
                const user = result.rows[0];
                let assignedRole = 'client';

                if (invitationToken) {
                    const invitation = await client.query(
                        `SELECT id, role_code FROM staff_invitations
                         WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
                         FOR UPDATE`,
                        [hash(invitationToken)]
                    );

                    if (invitation.rowCount === 0) {
                        await client.query('ROLLBACK');
                        return sendResponse(res, 400, { error: 'Lien d’invitation invalide ou expiré.' });
                    }

                    assignedRole = invitation.rows[0].role_code || 'agent';
                    await client.query('UPDATE staff_invitations SET accepted_at = CURRENT_TIMESTAMP, user_id = $1 WHERE id = $2', [user.id, invitation.rows[0].id]);
                }

                await client.query('DELETE FROM user_roles WHERE user_id = $1', [user.id]);
                await client.query(`INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE code = $2 ON CONFLICT DO NOTHING`, [user.id, assignedRole]);
                await client.query(`UPDATE users SET role_id = (SELECT id FROM roles WHERE code=$1) WHERE id=$2`, [assignedRole, user.id]);
                await client.query('UPDATE users SET authz_version=authz_version+1 WHERE id=$1', [user.id]);
                const verificationToken = await createVerificationToken(client, user.id);
                await client.query('COMMIT');
                transactionOpen = false;

                try {
                    await sendVerificationEmail(
                        user.email,
                        buildPublicLink('/verify-email.html', verificationToken)
                    );
                } catch (mailError) {
                    console.error('[AUTH] Échec d’envoi de l’e-mail de vérification :', {
                        email: user.email,
                        error: mailError?.message,
                        stack: mailError?.stack,
                        smtpHost: process.env.SMTP_HOST,
                        smtpPort: process.env.SMTP_PORT
                    });
                }

                return sendResponse(res, 201, {
                    message: 'Inscription réussie. Veuillez vérifier votre e-mail.',
                    user,
                    role: assignedRole
                });
            } catch (dbErr) {
                if (transactionOpen) {
                    await client.query('ROLLBACK');
                }
                if (dbErr.code === '23505') {
                    return sendResponse(res, 400, { error: 'Cet e-mail est déjà utilisé.' });
                }
                throw dbErr;
            } finally {
                client.release();
            }
        }

        // --- ROUTE : Connexion ---
        if (pathname === '/api/login' && method === 'POST') {
            const { email, password, remember = true } = await parseJSONBody(req);
            if (!validateEmail(email) || typeof password !== 'string' || !password) {
                return sendResponse(res, 400, { error: 'Email et mot de passe requis.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
            if (result.rows.length === 0) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }

            const user = result.rows[0];
            const isValid = await verifyPassword(password, user.salt, user.password_hash);

            if (!isValid) {
                return sendResponse(res, 401, { error: 'Identifiants invalides.' });
            }
            if (!user.is_verified) {
                return sendResponse(res, 403, { error: 'Veuillez vérifier votre e-mail avant de vous connecter.' });
            }

            const auth = await loadAuthorization(pool, user.id);
            const sessionToken = signAccessToken(auth);
            const refreshToken = await issueRefreshToken(pool, user.id);

            const rememberCookie = remember === false ? '' : '; Max-Age=604800';
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
                    is_verified: user.is_verified,
                    roles: auth.roles,
                    role: auth.roles[0] || null,
                    role_id: user.role_id
                }
            }, { 'Set-Cookie': `travelms_refresh=${refreshToken}; HttpOnly; Path=/api${rememberCookie}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}` });
        }

        // --- ROUTE : Vérification d'e-mail ---
        if (pathname === '/api/verify' && method === 'GET') {
            const token = parsedUrl.query.token;
            if (!token) {
                return sendResponse(res, 400, { error: 'Token manquant.' });
            }

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const result = await client.query(
                    `SELECT id, user_id FROM email_verification_tokens
                     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
                     FOR UPDATE`,
                    [hash(token)]
                );
                if (result.rowCount === 0) {
                    // Un lien consommé ne doit pas ressembler à un échec. Le
                    // hash est conservé avec used_at précisément pour pouvoir
                    // donner ce retour clair sans conserver le secret en clair.
                    const previous = await client.query(
                        `SELECT u.is_verified
                         FROM email_verification_tokens t
                         JOIN users u ON u.id = t.user_id
                         WHERE t.token_hash = $1
                         ORDER BY t.created_at DESC
                         LIMIT 1`,
                        [hash(token)]
                    );
                    await client.query('ROLLBACK');
                    if (previous.rows[0]?.is_verified) {
                        return sendResponse(res, 200, {
                            status: 'already_verified',
                            message: 'Cette adresse e-mail est déjà vérifiée. Vous pouvez vous connecter.'
                        });
                    }
                    return sendResponse(res, 400, { error: 'Token invalide ou expiré.' });
                }
                await client.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [result.rows[0].user_id]);
                await client.query('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [result.rows[0].id]);
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

            return sendResponse(res, 200, {
                status: 'verified',
                message: 'E-mail vérifié avec succès. Votre compte est prêt.'
            });
        }

        // --- ROUTE : Renvoyer l'e-mail de vérification ---
        if (pathname === '/api/resend-verification' && method === 'POST') {
            const { email } = await parseJSONBody(req);
            if (!validateEmail(email)) {
                return sendResponse(res, 400, { error: 'Veuillez renseigner une adresse e-mail valide.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const client = await pool.connect();
            let verificationToken;
            try {
                await client.query('BEGIN');
                const result = await client.query(
                    'SELECT id, is_verified FROM users WHERE email = $1 FOR UPDATE',
                    [cleanEmail]
                );
                if (result.rowCount > 0 && !result.rows[0].is_verified) {
                    verificationToken = await createVerificationToken(client, result.rows[0].id);
                }
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

            if (verificationToken) {
                try {
                    await sendVerificationEmail(
                        cleanEmail,
                        buildPublicLink('/verify-email.html', verificationToken)
                    );
                } catch (error) {
                    console.error('[SMTP] Renvoi de vérification impossible :', {
                        email: cleanEmail,
                        error: error?.message,
                        stack: error?.stack,
                        smtpHost: process.env.SMTP_HOST,
                        smtpPort: process.env.SMTP_PORT
                    });
                }
            }

            // Même réponse pour les comptes inconnus ou déjà validés afin de ne pas exposer les comptes existants.
            return sendResponse(res, 200, {
                message: 'Si un compte non vérifié correspond à cette adresse, un nouvel e-mail de vérification vient d’être envoyé.'
            });
        }

        // --- ROUTE : Mot de passe oublié ---
        if (pathname === '/api/forgot-password' && method === 'POST') {
            const { email } = await parseJSONBody(req);
            if (!validateEmail(email)) {
                return sendResponse(res, 400, { error: 'Email requis.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const client = await pool.connect();
            let resetToken;
            try {
                await client.query('BEGIN');
                const result = await client.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
                if (result.rowCount > 0) {
                    resetToken = await createPasswordResetToken(client, result.rows[0].id);
                }
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

            if (resetToken) {
                try {
                    await sendPasswordResetEmail(
                        cleanEmail,
                        buildPublicLink('/reset-password.html', resetToken)
                    );
                } catch (error) {
                    console.error('[SMTP] Envoi de réinitialisation impossible :', error.message);
                }
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

            const { salt, hash: passwordHash } = await hashPassword(password);
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const tokenResult = await client.query(
                    `SELECT id, user_id FROM password_reset_tokens
                     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
                     FOR UPDATE`,
                    [hash(token)]
                );
                if (tokenResult.rowCount === 0) {
                    await client.query('ROLLBACK');
                    return sendResponse(res, 400, { error: 'Le lien de réinitialisation est invalide ou expiré.' });
                }
                const userId = tokenResult.rows[0].user_id;
                await client.query(
                    `UPDATE users
                     SET password_hash = $1, salt = $2, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3`,
                    [passwordHash, salt, userId]
                );
                await client.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [tokenResult.rows[0].id]);
                await revokeAll(client, userId);
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

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
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['users:read:any'] })(req);
            const { rows } = await pool.query(`SELECT u.id,u.name,u.email,u.is_verified,u.is_active,COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL),'{}') roles FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id GROUP BY u.id ORDER BY u.created_at DESC`);
            return sendResponse(res, 200, { users: rows });
        }

        if (pathname === '/api/admin/invitations' && method === 'POST') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['users:invite'] })(req);
            const { email, role } = await parseJSONBody(req);
            if (!validateEmail(email) || !['agent'].includes(role || '')) {
                return sendResponse(res, 400, { error: 'Adresse e-mail et rôle valides requis.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const existingUser = await pool.query('SELECT id FROM users WHERE email=$1', [cleanEmail]);
            if (existingUser.rows[0]) {
                return sendResponse(res, 409, { error: 'Un compte existe déjà avec cette adresse e-mail.' });
            }

            const token = newEmailToken();
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(
                    `INSERT INTO staff_invitations (email, role_code, token_hash, expires_at, invited_by)
                     VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '7 days', $4)`,
                    [cleanEmail, role, hash(token), user.id]
                );
                await writeAudit(pool, {
                    actorId: user.id,
                    action: 'staff.invitation.created',
                    entityType: 'staff_invitation',
                    metadata: { email: cleanEmail, role }
                });
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

            const publicLink = buildPublicLink('/register.html', token);
            await sendStaffInvitationEmail(cleanEmail, publicLink);
            return sendResponse(res, 200, { message: `Invitation envoyée à ${cleanEmail}.` });
        }

        if (pathname === '/api/admin/destinations' && method === 'GET') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['destinations:manage'] })(req);
            const { rows } = await pool.query(`SELECT id, title, description, price, location, cover_image, is_active, created_at, updated_at FROM destinations ORDER BY created_at DESC`);
            return sendResponse(res, 200, { destinations: rows.map(destination => ({
                ...destination,
                image_url: destination.cover_image
            })) });
        }

        if (pathname === '/api/admin/destinations' && method === 'POST') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['destinations:manage'] })(req);
            await ensureUploadDir();
            await ensureDestinationUploadDir();

            const form = formidable({
                uploadDir: DESTINATION_UPLOAD_DIR,
                keepExtensions: true,
                multiples: true,
                maxFileSize: 5 * 1024 * 1024,
                filter: ({ mimetype }) => !mimetype || ALLOWED_IMAGE_MIMETYPES.includes(mimetype)
            });

            const { fields, files } = await parseMultipartForm(form, req);
            const coverFile = toFileArray(files.cover_image)[0];
            const galleryFiles = toFileArray(files.gallery);

            const payload = validateDestinationPayload({
                title: fields.title,
                description: fields.description,
                price: fields.price,
                location: fields.location,
                cover_image: fields.cover_image || fields.image_url,
                category_id: fields.category_id,
                is_active: fields.is_active,
                has_cover_upload: Boolean(coverFile)
            });

            const client = await pool.connect();
            const movedFiles = [];
            let coverImageUrl = payload.cover_image;

            try {
                await client.query('BEGIN');
                const { rows } = await client.query(
                    `INSERT INTO destinations
                        (title, description, price, location, cover_image, is_active, category_id)
                     VALUES ($1,$2,$3,$4,$5,$6,$7)
                     RETURNING id, title, description, price, location, cover_image, is_active, category_id, created_at, updated_at`,
                    [payload.title, payload.description, payload.price, payload.location, coverImageUrl, payload.is_active, payload.category_id]
                );
                const destination = rows[0];

                if (coverFile) {
                    const fileName = buildDestinationFileName(destination.id, coverFile.originalFilename || coverFile.newFilename || 'cover.jpg');
                    const destPath = await moveFileToDestinationDir(coverFile.filepath, fileName);
                    movedFiles.push(destPath);
                    coverImageUrl = `/uploads/destinations/${fileName}`;
                    await client.query('UPDATE destinations SET cover_image=$1 WHERE id=$2', [coverImageUrl, destination.id]);
                }

                const gallery = [];
                for (let i = 0; i < galleryFiles.length; i += 1) {
                    const galleryFile = galleryFiles[i];
                    if (!galleryFile || !galleryFile.filepath) continue;
                    const fileName = buildDestinationFileName(destination.id, galleryFile.originalFilename || galleryFile.newFilename || `gallery-${i}.jpg`);
                    const destPath = await moveFileToDestinationDir(galleryFile.filepath, fileName);
                    movedFiles.push(destPath);
                    const imageUrl = `/uploads/destinations/${fileName}`;
                    const result = await client.query(
                        `INSERT INTO destination_images (destination_id, image_url)
                         VALUES ($1,$2)
                         RETURNING id, image_url, created_at`,
                        [destination.id, imageUrl]
                    );
                    gallery.push(result.rows[0]);
                }

                await client.query('COMMIT');
                return sendResponse(res, 201, {
                    destination: {
                        ...destination,
                        cover_image: coverImageUrl,
                        image_url: coverImageUrl,
                        gallery
                    }
                });
            } catch (error) {
                await client.query('ROLLBACK');
                await cleanupUploadedPaths(movedFiles);
                if (coverFile) {
                    await removeFileIfExists(coverFile.filepath);
                }
                if (Array.isArray(galleryFiles)) {
                    for (const file of galleryFiles) {
                        if (file?.filepath) await removeFileIfExists(file.filepath);
                    }
                }
                throw error;
            } finally {
                client.release();
            }
        }

        const adminDestinationMatch = pathname.match(/^\/api\/admin\/destinations\/([0-9a-fA-F-]{36})$/);
        if (adminDestinationMatch && method === 'PUT') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['destinations:manage'] })(req);
            const destinationId = adminDestinationMatch[1];
            await ensureUploadDir();
            await ensureDestinationUploadDir();

            const form = formidable({
                uploadDir: DESTINATION_UPLOAD_DIR,
                keepExtensions: true,
                multiples: true,
                maxFileSize: 5 * 1024 * 1024,
                filter: ({ mimetype }) => !mimetype || ALLOWED_IMAGE_MIMETYPES.includes(mimetype)
            });

            const { fields, files } = await parseMultipartForm(form, req);
            const coverFile = toFileArray(files.cover_image)[0];
            const galleryFiles = toFileArray(files.gallery);

            const payload = validateDestinationPayload({
                title: fields.title,
                description: fields.description,
                price: fields.price,
                location: fields.location,
                cover_image: fields.cover_image || fields.image_url,
                category_id: fields.category_id,
                is_active: fields.is_active,
                has_cover_upload: Boolean(coverFile)
            });

            const client = await pool.connect();
            const movedFiles = [];

            try {
                await client.query('BEGIN');
                const current = await client.query('SELECT cover_image FROM destinations WHERE id = $1', [destinationId]);
                if (current.rowCount === 0) {
                    await client.query('ROLLBACK');
                    return sendResponse(res, 404, { error: 'Destination introuvable.' });
                }

                let coverImageUrl = payload.cover_image || current.rows[0].cover_image;
                let oldCoverPath = null;
                let oldGalleryPaths = [];
                if (coverFile) {
                    const fileName = buildDestinationFileName(destinationId, coverFile.originalFilename || coverFile.newFilename || 'cover.jpg');
                    const destPath = await moveFileToDestinationDir(coverFile.filepath, fileName);
                    movedFiles.push(destPath);
                    coverImageUrl = `/uploads/destinations/${fileName}`;
                    oldCoverPath = destinationStoragePath(current.rows[0].cover_image);
                }

                if (parseBoolean(firstValue(fields.replace_gallery))) {
                    const previousGallery = await client.query(
                        'SELECT image_url FROM destination_images WHERE destination_id=$1',
                        [destinationId]
                    );
                    oldGalleryPaths = previousGallery.rows
                        .map(row => destinationStoragePath(row.image_url))
                        .filter(Boolean);
                    await client.query('DELETE FROM destination_images WHERE destination_id=$1', [destinationId]);
                }

                const result = await client.query(
                    `UPDATE destinations SET
                        title=$1, description=$2, price=$3, location=$4, cover_image=$5,
                        is_active=$6, category_id=$7, updated_at=CURRENT_TIMESTAMP
                     WHERE id=$8
                     RETURNING id, title, description, price, location, cover_image, is_active, category_id, created_at, updated_at`,
                    [payload.title, payload.description, payload.price, payload.location, coverImageUrl, payload.is_active, payload.category_id, destinationId]
                );

                const gallery = [];
                for (let i = 0; i < galleryFiles.length; i += 1) {
                    const galleryFile = galleryFiles[i];
                    if (!galleryFile || !galleryFile.filepath) continue;
                    const fileName = buildDestinationFileName(destinationId, galleryFile.originalFilename || galleryFile.newFilename || `gallery-${i}.jpg`);
                    const destPath = await moveFileToDestinationDir(galleryFile.filepath, fileName);
                    movedFiles.push(destPath);
                    const imageUrl = `/uploads/destinations/${fileName}`;
                    const insertResult = await client.query(
                        `INSERT INTO destination_images (destination_id, image_url)
                         VALUES ($1,$2)
                         RETURNING id, image_url, created_at`,
                        [destinationId, imageUrl]
                    );
                    gallery.push(insertResult.rows[0]);
                }

                await client.query('COMMIT');
                // Après le commit uniquement : une erreur SQL ne doit jamais
                // faire disparaître la couverture actuellement publiée.
                await Promise.all([oldCoverPath, ...oldGalleryPaths].filter(Boolean).map(removeFileIfExists));
                return sendResponse(res, 200, {
                    destination: {
                        ...result.rows[0],
                        image_url: coverImageUrl,
                        gallery
                    }
                });
            } catch (error) {
                await client.query('ROLLBACK');
                await cleanupUploadedPaths(movedFiles);
                if (coverFile) {
                    await removeFileIfExists(coverFile.filepath);
                }
                if (Array.isArray(galleryFiles)) {
                    for (const file of galleryFiles) {
                        if (file?.filepath) await removeFileIfExists(file.filepath);
                    }
                }
                throw error;
            } finally {
                client.release();
            }
        }

        if (adminDestinationMatch && method === 'DELETE') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['destinations:manage'] })(req);
            const destinationId = adminDestinationMatch[1];
            const client = await pool.connect();
            let filePaths = [];
            try {
                await client.query('BEGIN');
                const destination = await client.query('SELECT cover_image FROM destinations WHERE id=$1 FOR UPDATE', [destinationId]);
                if (destination.rowCount === 0) {
                    await client.query('ROLLBACK');
                    return sendResponse(res, 404, { error: 'Destination introuvable.' });
                }
                const gallery = await client.query('SELECT image_url FROM destination_images WHERE destination_id=$1', [destinationId]);
                filePaths = [destination.rows[0].cover_image, ...gallery.rows.map(row => row.image_url)]
                    .map(destinationStoragePath)
                    .filter(Boolean);
                await client.query('DELETE FROM destinations WHERE id=$1', [destinationId]);
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
            // Les entrées sont supprimées en cascade; le nettoyage disque est
            // volontairement best-effort afin qu'un verrou fichier n'annule pas le CRUD.
            await Promise.all(filePaths.map(removeFileIfExists));
            return sendResponse(res, 200, { message: 'Destination supprimée.' });
        }

        const roleMatch = pathname.match(/^\/api\/admin\/users\/([0-9a-f-]+)\/roles?$/i);
        if (roleMatch && method === 'PUT') {
            const user = await getUserByToken(req);
            if (!user) return sendResponse(res, 401, { error: 'Accès non autorisé.' });
            await createAuthorizationGuard({ roles: ['admin'], permissions: ['users:update:any'] })(req);
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
                await client.query(`UPDATE users SET role_id = (SELECT id FROM roles WHERE code=$1), authz_version=authz_version+1 WHERE id=$2`, [roles[0], targetId]);
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

            const isValid = await verifyPassword(currentPassword, user.salt, user.password_hash);
            if (!isValid) {
                return sendResponse(res, 400, { error: 'L\'ancien mot de passe est incorrect.' });
            }

            const { salt, hash } = await hashPassword(newPassword);
            await pool.query(
                'UPDATE users SET password_hash = $1, salt = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                [hash, salt, user.id]
            );
            // Un changement de mot de passe invalide immédiatement tous les
            // access/refresh tokens émis avant cette opération.
            await revokeAll(pool, user.id);

            return sendResponse(res, 200, { message: 'Mot de passe mis à jour. Veuillez vous reconnecter.' });
        }

        // --- ROUTE : MISE À JOUR COMPLETE DU PROFIL ET DE L'IMAGE (/api/profile/update) ---
        if (pathname === '/api/profile/update' && method === 'POST') {
            let uploadedFile;
            try {
                const user = await getUserByToken(req);
                if (!user) {
                    return sendResponse(res, 401, { success: false, error: 'Accès non autorisé. Token invalide.' });
                }

                // Garantit les quatre répertoires montés dans le volume Docker.
                await ensureMediaDirectories();

                const form = formidable({
                    uploadDir: USER_UPLOAD_DIR,
                    keepExtensions: true,
                    maxFileSize: 5 * 1024 * 1024,
                    filter: ({ mimetype }) => !mimetype || ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype),
                    filename: (name, ext, part) => {
                        const extension = {
                            'image/jpeg': '.jpg',
                            'image/png': '.png',
                            'image/webp': '.webp'
                        }[part.mimetype] || '';
                        const original = part.originalFilename || name || 'avatar';
                        const base = sanitizeFileName(path.basename(original, path.extname(original))) || 'avatar';
                        return `user_${user.id}_${Date.now()}_${base}${extension}`;
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
                    avatarUrl = `/uploads/users/${uploadedFile.newFilename}`;
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
                if (uploadedFile) {
                    const oldAvatarPath = userStoragePath(user.avatar_url);
                    if (oldAvatarPath) await removeFileIfExists(oldAvatarPath);
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
                    is_verified: user.is_verified,
                    roles: req.auth.roles,
                    role: req.auth.roles[0] || null,
                    role_id: user.role_id
                });
            }

            if (method === 'PUT') {
                const { name, email } = await parseJSONBody(req);
                if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100 || !validateEmail(email)) {
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
        return sendResponse(res, 404, { error: 'Route introuvable.' });

    } catch (err) {
        console.error('[Erreur Interne]', err);
        // Une réponse a pu être écrite par un handler avant qu'une erreur
        // asynchrone ne remonte. Ne jamais tenter d'écrire une seconde fois.
        if (res.headersSent || res.writableEnded) return;
        const statusCode = err.statusCode || 500;
        const errorMessage = [400, 401, 403, 404, 409].includes(statusCode)
            ? err.message
            : 'Erreur interne du serveur.';
        sendResponse(res, statusCode, { error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
async function bootstrapAdmin() {
    // Crée la structure du volume média dès le démarrage, même avant le
    // premier téléversement.
    await ensureMediaDirectories();
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
    await pool.query(`UPDATE users SET role_id=(SELECT id FROM roles WHERE code='admin') WHERE id=$1`, [userId]);
    await revokeAll(pool, userId);
    console.log('[RBAC] Administrateur initial configuré.');
}

bootstrapAdmin()
    .then(() => server.listen(PORT, () => console.log(`Serveur Node.js natif démarré sur le port ${PORT}`)))
    .catch(error => { console.error('[RBAC] Initialisation impossible:', error); process.exit(1); });
