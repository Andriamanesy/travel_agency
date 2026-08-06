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
module.exports={loadAuthorization,signAccessToken,authenticate,issueRefreshToken,revokeAll,hash};
