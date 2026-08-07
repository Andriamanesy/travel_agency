const { requirePermission } = require('./auth');
const UUID = '[0-9a-f-]{36}';
const fail = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const HOME_DEFAULTS = {
  hero: { title: 'Explorez le Monde avec Nous', subtitle: "Des circuits sur-mesure d'exception", ctaText: 'Découvrir nos circuits', ctaLink: '/circuits', bgImageUrl: null },
  features: [
    { icon: 'Compass', title: 'Circuits sur-mesure', description: 'Des itinéraires pensés autour de vos envies.' },
    { icon: 'ShieldCheck', title: 'Voyagez sereinement', description: 'Une équipe locale attentive à chaque détail.' },
    { icon: 'HeartHandshake', title: 'Expériences authentiques', description: 'Des rencontres et des adresses qui ont du sens.' },
    { icon: 'Sparkles', title: 'Service premium', description: 'Un accompagnement personnalisé avant, pendant et après votre voyage.' },
  ],
};

function homeSettings(rows) {
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return { hero: { ...HOME_DEFAULTS.hero, ...(values.hero && typeof values.hero === 'object' ? values.hero : {}) }, features: Array.isArray(values.features) ? values.features : HOME_DEFAULTS.features };
}

function validateHomeSettings(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Configuration de page d’accueil invalide.');
  const hero = body.hero;
  const features = body.features;
  if (!hero || typeof hero !== 'object' || Array.isArray(hero) || !Array.isArray(features) || features.length < 3 || features.length > 4) throw fail(400, 'Le hero et trois à quatre arguments sont requis.');
  const text = (value, label, max) => { if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw fail(400, `${label} est invalide.`); return value.trim(); };
  const bgImageUrl = hero.bgImageUrl === null || hero.bgImageUrl === '' ? null : text(hero.bgImageUrl, 'L’image du hero', 2000);
  if (bgImageUrl && !/^(https?:\/\/|\/uploads\/)/i.test(bgImageUrl)) throw fail(400, 'L’image du hero doit être une URL HTTPS/HTTP ou un média téléversé.');
  return {
    hero: { title: text(hero.title, 'Le titre', 160), subtitle: text(hero.subtitle, 'Le sous-titre', 500), ctaText: text(hero.ctaText, 'Le libellé CTA', 80), ctaLink: text(hero.ctaLink, 'Le lien CTA', 500), bgImageUrl },
    features: features.map((feature, index) => {
      if (!feature || typeof feature !== 'object' || Array.isArray(feature)) throw fail(400, `Argument ${index + 1} invalide.`);
      return { icon: text(feature.icon, 'L’icône', 80), title: text(feature.title, 'Le titre', 120), description: text(feature.description, 'La description', 500), isActive: feature.isActive !== false };
    }),
  };
}

async function homeContentAccess(req, getUserByToken) {
  if (!await getUserByToken(req)) throw fail(401, 'Authentification requise.');
  const permissions = req.auth?.permissions || [];
  if (!permissions.includes('content:manage') && !permissions.includes('marketing:manage')) throw fail(403, 'Permission insuffisante.');
}

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
  if (pathname === '/api/v1/public/home-settings' && method === 'GET') {
    const { rows } = await pool.query(`SELECT key,value FROM home_settings WHERE key IN ('hero','features')`);
    sendResponse(res, 200, homeSettings(rows)); return true;
  }
  if (pathname === '/api/v1/admin/content/home') {
    await homeContentAccess(req, getUserByToken);
    if (method === 'GET') { const { rows } = await pool.query(`SELECT key,value FROM home_settings WHERE key IN ('hero','features')`); sendResponse(res, 200, homeSettings(rows)); return true; }
    if (method === 'PUT') {
      const settings = validateHomeSettings(await parseJSONBody(req));
      await pool.query(`INSERT INTO home_settings(key,value,updated_at) VALUES('hero',$1,CURRENT_TIMESTAMP),('features',$2,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=CURRENT_TIMESTAMP`, [settings.hero, settings.features]);
      sendResponse(res, 200, settings); return true;
    }
    throw fail(405, 'Méthode non autorisée.');
  }
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
module.exports = { handleLandingApi, homeSettings, validateHomeSettings, HOME_DEFAULTS };
