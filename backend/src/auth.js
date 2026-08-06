const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const accessSecret = () => process.env.JWT_ACCESS_SECRET || null;
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
async function loadAuthorization(pool, userId) {
    const { rows } = await pool.query(`SELECT u.id,u.is_active,u.authz_version, COALESCE(array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL),'{}') roles, COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL),'{}') permissions FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id LEFT JOIN role_permissions rp ON rp.role_id=r.id LEFT JOIN permissions p ON p.id=rp.permission_id WHERE u.id=$1 GROUP BY u.id`, [userId]);
    return rows[0] || null;
}
function signAccessToken(auth) {
    const secret = accessSecret(); if (!secret) throw new Error('JWT_ACCESS_SECRET manquant.');
    return jwt.sign({ sub: auth.id, roles: auth.roles, permissions: auth.permissions, ver: auth.authz_version, typ: 'access' }, secret, { algorithm: 'HS256', expiresIn: '10m', issuer: 'travelms-api', audience: 'travelms-web', jwtid: crypto.randomUUID() });
}

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

/**
 * Utilisation :
 * await authenticate(pool, req);
 * checkRole('admin', 'agent')(req);
 */
function checkRole(...allowedRoles) {
    return req => {
        const userRoles = req.auth?.roles || [];

        const authorized = userRoles.some(role =>
            allowedRoles.includes(role)
        );

        if (!authorized) {
            throw createHttpError(403, 'Rôle insuffisant.');
        }
    };
}

/**
 * Toutes les permissions fournies doivent être présentes.
 *
 * Utilisation :
 * checkPermission('users:read:any')(req);
 */
function checkPermission(...requiredPermissions) {
    return req => {
        const userPermissions = req.auth?.permissions || [];

        const authorized = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!authorized) {
            throw createHttpError(403, 'Permission insuffisante.');
        }
    };
}

/**
 * ownerResolver doit toujours lire le propriétaire depuis PostgreSQL.
 * Ne jamais utiliser un userId fourni dans req.body comme preuve de propriété.
 *
 * Utilisation :
 * await ownerCheck({
 *   anyPermission: 'reservations:read:any',
 *   ownerResolver: async () => reservation.user_id
 * })(req);
 */
function ownerCheck({ anyPermission, ownerResolver }) {
    return async req => {
        const userPermissions = req.auth?.permissions || [];

        if (anyPermission && userPermissions.includes(anyPermission)) {
            return;
        }

        const ownerId = await ownerResolver(req);

        if (!ownerId || ownerId !== req.auth?.id) {
            throw createHttpError(
                403,
                'Vous ne pouvez accéder qu’à vos propres données.'
            );
        }
    };
}

async function authenticate(pool, req) {
    const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7);
    if (!token) { const e = new Error('Token manquant.'); e.statusCode = 401; throw e; }
    let payload; try { payload = jwt.verify(token, accessSecret(), { algorithms:['HS256'], issuer:'travelms-api', audience:'travelms-web' }); } catch { const e = new Error('Token invalide ou expiré.'); e.statusCode=401; throw e; }
    const auth = await loadAuthorization(pool, payload.sub);
    if (!auth || !auth.is_active || payload.typ !== 'access' || payload.ver !== auth.authz_version) { const e=new Error('Session révoquée.'); e.statusCode=401; throw e; }
    req.auth = auth; return auth;
}
async function issueRefreshToken(pool, userId) { const token=crypto.randomBytes(64).toString('base64url'); await pool.query('INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,CURRENT_TIMESTAMP + INTERVAL \'7 days\')',[userId,hash(token)]); return token; }
async function revokeAll(pool,userId) { await pool.query('UPDATE refresh_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND revoked_at IS NULL',[userId]); await pool.query('UPDATE users SET authz_version=authz_version+1 WHERE id=$1',[userId]); }
module.exports = {
    loadAuthorization,
    signAccessToken,
    authenticate,
    issueRefreshToken,
    revokeAll,
    hash,
    checkRole,
    checkPermission,
    ownerCheck
};
