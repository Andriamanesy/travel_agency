const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { requirePermission, revokeAll } = require('./auth');

const UUID = '[0-9a-f-]{36}';
const error = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const validEmail = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword = value => typeof value === 'string' && value.length >= 12 && value.length <= 200;

async function authorize(req, getUserByToken, permission) {
  if (!await getUserByToken(req)) throw error(401, 'Authentification requise.');
  requirePermission(permission)(req);
}

async function roleById(pool, id) {
  const result = await pool.query('SELECT id,code,name,description,is_system FROM roles WHERE id=$1', [id]);
  return result.rows[0] || null;
}

async function listRoles(pool) {
  const result = await pool.query(`SELECT r.id,r.code,r.name,r.description,r.is_system,
    COALESCE(json_agg(json_build_object('id',p.id,'code',p.code,'label',p.label,'category',p.category) ORDER BY p.category,p.code) FILTER (WHERE p.id IS NOT NULL), '[]') permissions
    FROM roles r LEFT JOIN role_permissions rp ON rp.role_id=r.id LEFT JOIN permissions p ON p.id=rp.permission_id
    GROUP BY r.id ORDER BY r.is_system DESC,r.name`);
  return result.rows;
}

async function saveRole(pool, body, id) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : null;
  const permissions = Array.isArray(body.permissions) ? [...new Set(body.permissions)] : null;
  if (!name || name.length > 100 || (description && description.length > 5000) || !permissions || permissions.some(code => typeof code !== 'string')) throw error(400, 'Rôle ou permissions invalides.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let role;
    if (id) {
      const found = await client.query('SELECT * FROM roles WHERE id=$1 FOR UPDATE', [id]);
      if (!found.rows[0]) throw error(404, 'Rôle introuvable.');
      if (found.rows[0].is_system) throw error(403, 'Un rôle système ne peut pas être modifié.');
      role = (await client.query('UPDATE roles SET name=$1,label=$1,description=$2 WHERE id=$3 RETURNING id,code,name,description,is_system', [name, description, id])).rows[0];
    } else {
      const code = `custom_${crypto.randomUUID().replaceAll('-', '')}`;
      role = (await client.query('INSERT INTO roles(code,label,name,description,is_system) VALUES($1,$2,$2,$3,FALSE) RETURNING id,code,name,description,is_system', [code, name, description])).rows[0];
    }
    const known = await client.query('SELECT id,code FROM permissions WHERE code = ANY($1::text[])', [permissions]);
    if (known.rowCount !== permissions.length) throw error(400, 'Une permission demandée est inconnue.');
    await client.query('DELETE FROM role_permissions WHERE role_id=$1', [role.id]);
    for (const permission of known.rows) await client.query('INSERT INTO role_permissions(role_id,permission_id) VALUES($1,$2)', [role.id, permission.id]);
    await client.query('COMMIT'); return role;
  } catch (cause) { await client.query('ROLLBACK'); throw cause; } finally { client.release(); }
}

async function userPayload(pool, row) {
  return { ...row, role: await roleById(pool, row.role_id) };
}

async function handleAdminRbac(context) {
  const { pathname, method, req, res, pool, parsedUrl, parseJSONBody, sendResponse, getUserByToken } = context;
  if (!pathname.startsWith('/api/v1/admin/')) return false;
  const rolePath = pathname.match(/^\/api\/v1\/admin\/roles(?:\/(\d+))?$/);
  if (pathname === '/api/v1/admin/roles/permissions' && method === 'GET') {
    await authorize(req, getUserByToken, 'roles:manage');
    const { rows } = await pool.query('SELECT id,code,label,category FROM permissions ORDER BY category,code');
    return sendResponse(res, 200, { permissions: rows });
  }
  if (rolePath) {
    await authorize(req, getUserByToken, 'roles:manage'); const id = rolePath[1] ? Number(rolePath[1]) : null;
    if (method === 'GET' && !id) return sendResponse(res, 200, { roles: await listRoles(pool) });
    if (method === 'POST' && !id) return sendResponse(res, 201, { role: await saveRole(pool, await parseJSONBody(req)) });
    if (method === 'PUT' && id) return sendResponse(res, 200, { role: await saveRole(pool, await parseJSONBody(req), id) });
    if (method === 'DELETE' && id) {
      const role = await roleById(pool, id); if (!role) throw error(404, 'Rôle introuvable.'); if (role.is_system) throw error(403, 'Un rôle système ne peut pas être supprimé.');
      const usage = await pool.query('SELECT 1 FROM users WHERE role_id=$1 LIMIT 1', [id]); if (usage.rowCount) throw error(409, 'Ce rôle est encore attribué à un utilisateur.');
      await pool.query('DELETE FROM roles WHERE id=$1', [id]); return sendResponse(res, 204, {});
    }
    throw error(405, 'Méthode non autorisée.');
  }
  const userPath = pathname.match(new RegExp(`^/api/v1/admin/users(?:/(${UUID})(?:/status)?)?$`, 'i'));
  if (!userPath) return false;
  const id = userPath[1]; const isStatus = pathname.endsWith('/status');
  if (method === 'GET' && !id) {
    await authorize(req, getUserByToken, 'users:read'); const page = Math.max(1, Number(parsedUrl.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(parsedUrl.query.limit) || 20)); const values = []; const clauses = ['TRUE'];
    if (parsedUrl.query.q) { values.push(`%${String(parsedUrl.query.q).trim()}%`); clauses.push(`(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`); }
    if (parsedUrl.query.role_id) { values.push(Number(parsedUrl.query.role_id)); clauses.push(`u.role_id=$${values.length}`); }
    if (parsedUrl.query.status) { if (!['active','banned'].includes(String(parsedUrl.query.status))) throw error(400, 'Statut invalide.'); values.push(parsedUrl.query.status === 'active'); clauses.push(`u.is_active=$${values.length}`); }
    const where = clauses.join(' AND '); const count = await pool.query(`SELECT COUNT(*)::int count FROM users u WHERE ${where}`, values); values.push(limit, (page - 1) * limit);
    const rows = await pool.query(`SELECT u.id,u.name,u.email,u.avatar_url,u.is_verified,u.is_active,u.role_id,u.created_at,r.code role_code,r.name role_name FROM users u LEFT JOIN roles r ON r.id=u.role_id WHERE ${where} ORDER BY u.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
    return sendResponse(res, 200, { users: rows.rows, pagination: { page, limit, total: count.rows[0].count, pages: Math.ceil(count.rows[0].count / limit) } });
  }
  if (method === 'POST' && !id) {
    await authorize(req, getUserByToken, 'users:write'); const body = await parseJSONBody(req); const name = typeof body.name === 'string' ? body.name.trim() : ''; const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!name || name.length > 100 || !validEmail(email) || !validPassword(body.password) || !Number.isInteger(body.role_id) || !await roleById(pool, body.role_id)) throw error(400, 'Nom, e-mail, mot de passe (12 caractères minimum) et rôle valides requis.');
    const salt = crypto.randomBytes(16).toString('hex'); const passwordHash = await bcrypt.hash(`${body.password}${salt}`, 12);
    try { const row = await pool.query('INSERT INTO users(name,email,password_hash,salt,role_id,is_verified) VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id,name,email,avatar_url,is_verified,is_active,role_id,created_at', [name,email,passwordHash,salt,body.role_id]); return sendResponse(res, 201, { user: await userPayload(pool, row.rows[0]) }); } catch (cause) { if (cause.code === '23505') throw error(409, 'Un compte utilise déjà cette adresse e-mail.'); throw cause; }
  }
  if (id && isStatus && method === 'PATCH') {
    await authorize(req, getUserByToken, 'users:write'); const { is_active } = await parseJSONBody(req); if (typeof is_active !== 'boolean') throw error(400, 'Le statut est invalide.'); if (id === req.auth.id && !is_active) throw error(400, 'Vous ne pouvez pas bannir votre propre compte.');
    const row = await pool.query('UPDATE users SET is_active=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING id,name,email,avatar_url,is_verified,is_active,role_id,created_at', [is_active,id]); if (!row.rows[0]) throw error(404, 'Utilisateur introuvable.'); if (!is_active) await revokeAll(pool, id); return sendResponse(res, 200, { user: await userPayload(pool, row.rows[0]) });
  }
  if (id && !isStatus && method === 'PUT') {
    await authorize(req, getUserByToken, 'users:write'); const body = await parseJSONBody(req); const updates = []; const values = [];
    if (body.name !== undefined) { if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) throw error(400, 'Nom invalide.'); values.push(body.name.trim()); updates.push(`name=$${values.length}`); }
    if (body.email !== undefined) { if (!validEmail(body.email)) throw error(400, 'E-mail invalide.'); values.push(body.email.toLowerCase().trim()); updates.push(`email=$${values.length}`); }
    if (body.role_id !== undefined) { if (!Number.isInteger(body.role_id) || !await roleById(pool, body.role_id)) throw error(400, 'Rôle invalide.'); values.push(body.role_id); updates.push(`role_id=$${values.length}`); }
    if (body.password !== undefined) { if (!validPassword(body.password)) throw error(400, 'Le mot de passe doit contenir au moins 12 caractères.'); const salt = crypto.randomBytes(16).toString('hex'); values.push(await bcrypt.hash(`${body.password}${salt}`, 12), salt); updates.push(`password_hash=$${values.length - 1}`, `salt=$${values.length}`); }
    if (!updates.length) throw error(400, 'Aucune modification.'); values.push(id); const row = await pool.query(`UPDATE users SET ${updates.join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=$${values.length} RETURNING id,name,email,avatar_url,is_verified,is_active,role_id,created_at`, values); if (!row.rows[0]) throw error(404, 'Utilisateur introuvable.'); if (body.role_id !== undefined || body.password !== undefined) await revokeAll(pool, id); return sendResponse(res, 200, { user: await userPayload(pool, row.rows[0]) });
  }
  if (id && !isStatus && method === 'DELETE') { await authorize(req, getUserByToken, 'users:delete'); if (id === req.auth.id) throw error(400, 'Vous ne pouvez pas supprimer votre propre compte.'); const row = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]); if (!row.rows[0]) throw error(404, 'Utilisateur introuvable.'); return sendResponse(res, 204, {}); }
  throw error(405, 'Méthode non autorisée.');
}

module.exports = { handleAdminRbac };
