const { requirePermission } = require('./auth');
const UUID = '[0-9a-f-]{36}';
const fail = (statusCode, message) => Object.assign(new Error(message), { statusCode });

function destinationPayload(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const price = Number(body.price);
  const coverImage = typeof body.cover_image === 'string' ? body.cover_image.trim() : '';
  if (!title || title.length > 255 || !description || !location || !Number.isFinite(price) || price < 0 || coverImage.length > 512) throw fail(400, 'Les informations de destination sont invalides.');
  if (typeof body.is_active !== 'boolean' || typeof body.is_featured !== 'boolean') throw fail(400, 'Les statuts de destination sont invalides.');
  return { title, description, location, price, coverImage, is_active: body.is_active, is_featured: body.is_featured };
}

async function requireCatalogWrite(req, getUserByToken) {
  if (!await getUserByToken(req)) throw fail(401, 'Authentification requise.');
  requirePermission('circuits:write')(req);
}

async function handleLandingApi({ pathname, method, req, res, pool, parseJSONBody, sendResponse, getUserByToken }) {
  if (pathname === '/api/v1/public/destinations/featured' && method === 'GET') {
    const { rows } = await pool.query(`SELECT d.id,d.title,d.description,d.location,d.price,d.cover_image,d.is_featured,COUNT(c.id)::int circuit_count
      FROM destinations d LEFT JOIN circuits c ON c.destination_id=d.id AND c.is_active=TRUE
      WHERE d.is_active=TRUE AND d.is_featured=TRUE GROUP BY d.id ORDER BY d.created_at DESC LIMIT 6`);
    sendResponse(res, 200, { destinations: rows }); return true;
  }
  if (pathname === '/api/v1/public/circuits/featured' && method === 'GET') {
    const { rows } = await pool.query(`SELECT c.id,c.title,c.description,c.price,c.duration_days,c.cover_image,d.id destination_id,d.title destination_title,d.location,
      (SELECT cd.start_date FROM circuit_departures cd WHERE cd.circuit_id=c.id AND cd.status='open' AND cd.start_date >= CURRENT_DATE ORDER BY cd.start_date LIMIT 1) next_departure
      FROM circuits c JOIN destinations d ON d.id=c.destination_id WHERE c.is_active=TRUE AND d.is_active=TRUE
      ORDER BY c.created_at DESC LIMIT 6`);
    sendResponse(res, 200, { circuits: rows }); return true;
  }
  const match = pathname.match(new RegExp(`^/api/v1/admin/destinations(?:/(${UUID}))?$`, 'i'));
  if (!match) return false;
  await requireCatalogWrite(req, getUserByToken); const id = match[1];
  if (method === 'GET' && !id) {
    const { rows } = await pool.query(`SELECT d.id,d.title,d.description,d.location,d.price,d.cover_image,d.is_active,d.is_featured,d.created_at,COUNT(c.id)::int circuit_count FROM destinations d LEFT JOIN circuits c ON c.destination_id=d.id GROUP BY d.id ORDER BY d.created_at DESC`);
    sendResponse(res, 200, { destinations: rows }); return true;
  }
  if (method === 'POST' && !id) {
    const item = destinationPayload(await parseJSONBody(req)); const result = await pool.query(`INSERT INTO destinations(title,description,location,price,cover_image,is_active,is_featured) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [item.title,item.description,item.location,item.price,item.coverImage,item.is_active,item.is_featured]);
    sendResponse(res, 201, { destination: result.rows[0] }); return true;
  }
  if (method === 'PUT' && id) {
    const item = destinationPayload(await parseJSONBody(req)); const result = await pool.query(`UPDATE destinations SET title=$1,description=$2,location=$3,price=$4,cover_image=$5,is_active=$6,is_featured=$7,updated_at=CURRENT_TIMESTAMP WHERE id=$8 RETURNING *`, [item.title,item.description,item.location,item.price,item.coverImage,item.is_active,item.is_featured,id]);
    if (!result.rows[0]) throw fail(404, 'Destination introuvable.'); sendResponse(res, 200, { destination: result.rows[0] }); return true;
  }
  if (method === 'DELETE' && id) { const result = await pool.query('DELETE FROM destinations WHERE id=$1 RETURNING id', [id]); if (!result.rows[0]) throw fail(404, 'Destination introuvable.'); sendResponse(res, 204, {}); return true; }
  throw fail(405, 'Méthode non autorisée.');
}
module.exports = { handleLandingApi };
