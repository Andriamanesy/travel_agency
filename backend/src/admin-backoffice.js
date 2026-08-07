const { createAuthorizationGuard } = require('./auth');

const UUID = '[0-9a-f-]{36}';
const resources = {
  posts: {
    table: 'posts', singular: 'post', fields: ['title', 'slug', 'excerpt', 'content', 'cover_image', 'tags', 'status', 'published_at'],
    required: ['title', 'slug'], order: 'created_at DESC'
  },
  banners: {
    table: 'banners', singular: 'banner', fields: ['title', 'subtitle', 'image_url', 'cta_label', 'cta_url', 'display_order', 'is_active', 'starts_at', 'ends_at'],
    required: ['title'], order: 'display_order ASC, created_at DESC'
  },
  coupons: {
    table: 'coupons', singular: 'coupon', fields: ['code', 'discount_type', 'discount_value', 'valid_from', 'valid_until', 'max_uses', 'circuit_id', 'is_active'],
    required: ['code', 'discount_type', 'discount_value'], order: 'created_at DESC'
  },
  reviews: {
    table: 'reviews', singular: 'review', fields: ['rating', 'comment', 'status', 'admin_response', 'responded_by'],
    required: ['rating', 'comment'], order: 'created_at DESC'
  }
};

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isUuid(value) { return typeof value === 'string' && new RegExp(`^${UUID}$`, 'i').test(value); }
function isDateTime(value) { return value === null || value === '' || (typeof value === 'string' && !Number.isNaN(Date.parse(value))); }
function isBoolean(value) { return typeof value === 'boolean'; }
function isPlainObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }

function pageParams(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25));
  return { page, limit, offset: (page - 1) * limit };
}

function validateResource(name, body, { creating = false } = {}) {
  if (!isPlainObject(body)) throw httpError(400, 'Le corps JSON doit être un objet.');
  const config = resources[name];
  const values = {};
  for (const field of config.fields) if (body[field] !== undefined) values[field] = body[field];
  if (creating) for (const field of config.required) if (values[field] === undefined || values[field] === null || values[field] === '') throw httpError(400, `${field} est requis.`);
  if (!Object.keys(values).length) throw httpError(400, 'Aucune donnée à enregistrer.');

  const textRules = { title: 255, slug: 255, excerpt: 5000, content: 100000, cover_image: 2000, subtitle: 5000, image_url: 2000, cta_label: 80, cta_url: 2000, code: 64, comment: 10000, admin_response: 10000 };
  for (const [field, max] of Object.entries(textRules)) {
    if (values[field] !== undefined && values[field] !== null && (typeof values[field] !== 'string' || values[field].trim().length > max)) throw httpError(400, `${field} est invalide.`);
    if (typeof values[field] === 'string') values[field] = values[field].trim();
  }
  if (values.tags !== undefined && (!Array.isArray(values.tags) || values.tags.some(tag => typeof tag !== 'string' || tag.length > 60))) throw httpError(400, 'tags est invalide.');
  if (values.status !== undefined) {
    const allowed = name === 'posts' ? ['draft', 'published', 'scheduled'] : ['pending', 'approved', 'rejected'];
    if (!allowed.includes(values.status)) throw httpError(400, 'status est invalide.');
  }
  if (values.rating !== undefined && (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5)) throw httpError(400, 'rating doit être compris entre 1 et 5.');
  if (values.discount_type !== undefined && !['percent', 'fixed'].includes(values.discount_type)) throw httpError(400, 'discount_type est invalide.');
  if (values.discount_value !== undefined && (!Number.isFinite(Number(values.discount_value)) || Number(values.discount_value) <= 0 || (values.discount_type === 'percent' && Number(values.discount_value) > 100))) throw httpError(400, 'discount_value est invalide.');
  if (values.max_uses !== undefined && values.max_uses !== null && (!Number.isInteger(values.max_uses) || values.max_uses <= 0)) throw httpError(400, 'max_uses est invalide.');
  if (values.display_order !== undefined && (!Number.isInteger(values.display_order) || values.display_order < 0)) throw httpError(400, 'display_order est invalide.');
  for (const field of ['is_active']) if (values[field] !== undefined && !isBoolean(values[field])) throw httpError(400, `${field} est invalide.`);
  for (const field of ['published_at', 'starts_at', 'ends_at', 'valid_from', 'valid_until']) if (values[field] !== undefined && !isDateTime(values[field])) throw httpError(400, `${field} est invalide.`);
  for (const field of ['circuit_id', 'responded_by']) if (values[field] !== undefined && values[field] !== null && !isUuid(values[field])) throw httpError(400, `${field} est invalide.`);
  if (values.admin_response !== undefined && values.admin_response !== null && values.admin_response !== '') values.responded_at = new Date().toISOString();
  return values;
}

function placeholders(fields, start = 1) { return fields.map((_, index) => `$${index + start}`).join(','); }
function makePdf(booking) {
  const safe = value => String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '?');
  const lines = ['TravelMS - Confirmation de reservation', `Reference : ${booking.id}`, `Client : ${booking.customer_name || booking.contact_name || ''}`, `Offre : ${booking.offer_title || ''}`, `Dates : ${booking.start_date} au ${booking.end_date}`, `Participants : ${booking.participants_count}`, `Montant : ${booking.total_price} EUR`, `Statut : ${booking.status}`];
  const stream = ['BT', '/F1 16 Tf', '50 770 Td'];
  lines.forEach((line, index) => { if (index) stream.push('0 -28 Td'); stream.push(`(${safe(line)}) Tj`); });
  stream.push('ET');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>', `<< /Length ${Buffer.byteLength(stream.join('\n'))} >>\nstream\n${stream.join('\n')}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

async function requireAdmin(req, getUserByToken) {
  const user = await getUserByToken(req);
  if (!user) throw httpError(401, 'Authentification requise.');
  await createAuthorizationGuard({ roles: ['admin'] })(req);
  return user;
}

async function listBookings(pool, query) {
  const { page, limit, offset } = pageParams(query);
  const clauses = ['TRUE']; const values = [];
  if (query.status) { if (!['pending', 'confirmed', 'cancelled'].includes(query.status)) throw httpError(400, 'Statut invalide.'); values.push(query.status); clauses.push(`b.status=$${values.length}`); }
  if (query.q && String(query.q).trim()) { values.push(`%${String(query.q).trim()}%`); clauses.push(`(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR COALESCE(c.title,d.title) ILIKE $${values.length})`); }
  const where = clauses.join(' AND ');
  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM bookings b JOIN users u ON u.id=b.user_id LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id WHERE ${where}`, values);
  values.push(limit, offset);
  const rows = await pool.query(`SELECT b.*,u.name AS customer_name,u.email AS customer_email,COALESCE(c.title,d.title) AS offer_title FROM bookings b JOIN users u ON u.id=b.user_id LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id WHERE ${where} ORDER BY b.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  return { bookings: rows.rows, pagination: { page, limit, total: count.rows[0].count, pages: Math.ceil(count.rows[0].count / limit) } };
}

function optionalDate(value, label) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw httpError(400, `${label} est invalide.`);
  return value;
}

function stringList(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim() || item.trim().length > 500)) throw httpError(400, `${label} est invalide.`);
  return value.map(item => item.trim());
}

function circuitPayload(body) {
  if (!isPlainObject(body) || !isUuid(body.destination_id)) throw httpError(400, 'La destination est invalide.');
  const requiredText = (key, label, max) => { if (typeof body[key] !== 'string' || !body[key].trim() || body[key].trim().length > max) throw httpError(400, `${label} est invalide.`); return body[key].trim(); };
  const integer = (source, key, min, max, label) => { const value = Number(source[key]); if (!Number.isFinite(value) || value < min || value > max || !Number.isInteger(value)) throw httpError(400, `${label} est invalide.`); return value; };
  const availableFrom = optionalDate(body.available_from, 'La date de disponibilité'); const availableTo = optionalDate(body.available_to, 'La date de disponibilité');
  if (availableFrom && availableTo && availableTo <= availableFrom) throw httpError(400, 'La fin de disponibilité doit être postérieure au début.');
  if (typeof body.is_active !== 'boolean') throw httpError(400, 'Le statut de publication est invalide.');
  const itineraries = Array.isArray(body.itineraries) ? body.itineraries : [];
  const departures = Array.isArray(body.departures) ? body.departures : [];
  if (itineraries.length > 365 || departures.length > 100) throw httpError(400, 'Trop d’étapes ou de départs.');
  const normalizedItineraries = itineraries.map((item, index) => {
    if (!isPlainObject(item) || !Number.isInteger(item.day_number) || item.day_number !== index + 1) throw httpError(400, 'Les jours de l’itinéraire doivent être consécutifs.');
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title || title.length > 255 || typeof item.description !== 'string' || item.description.length > 10000) throw httpError(400, 'Une étape d’itinéraire est invalide.');
    for (const field of ['accommodation', 'meals']) if (item[field] !== undefined && (typeof item[field] !== 'string' || item[field].length > 255)) throw httpError(400, 'Les informations d’étape sont invalides.');
    return { day_number: item.day_number, title, description: item.description.trim(), accommodation: String(item.accommodation || '').trim(), meals: String(item.meals || '').trim() };
  });
  const normalizedDepartures = departures.map(item => {
    if (!isPlainObject(item)) throw httpError(400, 'Un départ est invalide.'); const startDate = optionalDate(item.start_date, 'La date de départ'); const endDate = optionalDate(item.end_date, 'La date de retour');
    const totalPlaces = integer(item, 'total_places', 1, 10000, 'Le nombre de places'); const reservedPlaces = item.reserved_places === undefined ? 0 : integer(item, 'reserved_places', 0, totalPlaces, 'Le nombre de places réservées');
    if (!startDate || !endDate || endDate <= startDate || !['open', 'closed', 'cancelled'].includes(item.status || 'open')) throw httpError(400, 'Un départ est invalide.');
    return { start_date: startDate, end_date: endDate, total_places: totalPlaces, reserved_places: reservedPlaces, status: item.status || 'open' };
  });
  if (new Set(normalizedDepartures.map(item => item.start_date)).size !== normalizedDepartures.length) throw httpError(400, 'Deux départs ne peuvent pas avoir la même date de début.');
  const price = Number(body.price); if (!Number.isFinite(price) || price < 0 || price > 10000000) throw httpError(400, 'Le prix est invalide.');
  return { destination_id: body.destination_id, title: requiredText('title', 'Le titre', 255), description: requiredText('description', 'La description', 10000), price, duration_days: integer(body, 'duration_days', 1, 365, 'La durée'), capacity: integer(body, 'capacity', 1, 10000, 'La capacité'), available_from: availableFrom, available_to: availableTo, cover_image: typeof body.cover_image === 'string' ? body.cover_image.trim() : '', is_active: body.is_active, gallery_urls: stringList(body.gallery_urls || [], 'La galerie'), inclusions: stringList(body.inclusions || [], 'Les inclusions'), exclusions: stringList(body.exclusions || [], 'Les exclusions'), itineraries: normalizedItineraries, departures: normalizedDepartures };
}

async function circuitDetails(pool, id) {
  const circuit = await pool.query('SELECT * FROM circuits WHERE id=$1', [id]); if (!circuit.rows[0]) return null;
  const [gallery, itineraries, departures] = await Promise.all([pool.query('SELECT image_url FROM circuit_images WHERE circuit_id=$1 ORDER BY created_at', [id]), pool.query('SELECT id,day_number,title,description,accommodation,meals FROM circuit_itineraries WHERE circuit_id=$1 ORDER BY day_number', [id]), pool.query('SELECT id,start_date,end_date,total_places,reserved_places,status FROM circuit_departures WHERE circuit_id=$1 ORDER BY start_date', [id])]);
  return { ...circuit.rows[0], gallery_urls: gallery.rows.map(row => row.image_url), itineraries: itineraries.rows, departures: departures.rows };
}

async function saveCircuit(pool, body, id = null) {
  const payload = circuitPayload(body); const client = await pool.connect();
  try {
    await client.query('BEGIN'); let circuit;
    if (id) {
      const result = await client.query(`UPDATE circuits SET destination_id=$1,title=$2,description=$3,price=$4,duration_days=$5,capacity=$6,available_from=$7,available_to=$8,cover_image=$9,is_active=$10,inclusions=$11,exclusions=$12,updated_at=CURRENT_TIMESTAMP WHERE id=$13 RETURNING *`, [payload.destination_id, payload.title, payload.description, payload.price, payload.duration_days, payload.capacity, payload.available_from, payload.available_to, payload.cover_image, payload.is_active, JSON.stringify(payload.inclusions), JSON.stringify(payload.exclusions), id]);
      if (!result.rows[0]) throw httpError(404, 'Circuit introuvable.'); circuit = result.rows[0];
    } else {
      const result = await client.query(`INSERT INTO circuits(destination_id,title,description,price,duration_days,capacity,available_from,available_to,cover_image,is_active,inclusions,exclusions) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [payload.destination_id, payload.title, payload.description, payload.price, payload.duration_days, payload.capacity, payload.available_from, payload.available_to, payload.cover_image, payload.is_active, JSON.stringify(payload.inclusions), JSON.stringify(payload.exclusions)]); circuit = result.rows[0];
    }
    await Promise.all([client.query('DELETE FROM circuit_images WHERE circuit_id=$1', [circuit.id]), client.query('DELETE FROM circuit_itineraries WHERE circuit_id=$1', [circuit.id]), client.query('DELETE FROM circuit_departures WHERE circuit_id=$1', [circuit.id])]);
    for (const imageUrl of payload.gallery_urls) await client.query('INSERT INTO circuit_images(circuit_id,image_url) VALUES($1,$2)', [circuit.id, imageUrl]);
    for (const item of payload.itineraries) await client.query('INSERT INTO circuit_itineraries(circuit_id,day_number,title,description,accommodation,meals) VALUES($1,$2,$3,$4,$5,$6)', [circuit.id, item.day_number, item.title, item.description, item.accommodation, item.meals]);
    for (const item of payload.departures) await client.query('INSERT INTO circuit_departures(circuit_id,start_date,end_date,total_places,reserved_places,status) VALUES($1,$2,$3,$4,$5,$6)', [circuit.id, item.start_date, item.end_date, item.total_places, item.reserved_places, item.status]);
    await client.query('COMMIT'); return circuitDetails(pool, circuit.id);
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}

async function handleAdminBackoffice(context) {
  const { pathname, method, req, res, pool, parseJSONBody, sendResponse, getUserByToken, parsedUrl } = context;
  if (!pathname.startsWith('/api/v1/admin/')) return false;
  await requireAdmin(req, getUserByToken);

  const circuitRoute = pathname.match(new RegExp(`^/api/v1/admin/circuits(?:/(${UUID}))?$`, 'i'));
  if (circuitRoute) {
    const circuitId = circuitRoute[1];
    if (method === 'GET' && circuitId) { const circuit = await circuitDetails(pool, circuitId); if (!circuit) throw httpError(404, 'Circuit introuvable.'); return sendResponse(res, 200, { circuit }); }
    if (method === 'GET') { const rows = await pool.query('SELECT * FROM circuits ORDER BY created_at DESC'); const circuits = await Promise.all(rows.rows.map(row => circuitDetails(pool, row.id))); return sendResponse(res, 200, { circuits }); }
    if (method === 'POST' && !circuitId) return sendResponse(res, 201, { circuit: await saveCircuit(pool, await parseJSONBody(req)) });
    if (method === 'PUT' && circuitId) return sendResponse(res, 200, { circuit: await saveCircuit(pool, await parseJSONBody(req), circuitId) });
    throw httpError(405, 'Méthode non autorisée.');
  }

  if (pathname === '/api/v1/admin/analytics' && method === 'GET') {
    const [revenue, bookings, customers, popular] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_price) FILTER (WHERE status='confirmed'),0) revenue,COUNT(*) FILTER (WHERE status='cancelled') cancelled,COUNT(*) total FROM bookings`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE created_at >= date_trunc('month',CURRENT_DATE)) AS booking_month,COUNT(*) FILTER (WHERE created_at >= date_trunc('year',CURRENT_DATE)) AS booking_year FROM bookings`),
      pool.query(`SELECT COUNT(*) count FROM users WHERE created_at >= date_trunc('month',CURRENT_DATE)`),
      pool.query(`SELECT COALESCE(c.title,d.title) title,COUNT(*) bookings FROM bookings b LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id GROUP BY 1 ORDER BY 2 DESC LIMIT 5`)
    ]);
    const summary = revenue.rows[0];
    return sendResponse(res, 200, { kpis: { revenue: Number(summary.revenue), bookings_month: Number(bookings.rows[0].booking_month), bookings_year: Number(bookings.rows[0].booking_year), cancellation_rate: Number(summary.total) ? Number(summary.cancelled) / Number(summary.total) : 0, new_customers: Number(customers.rows[0].count), popular_circuits: popular.rows } });
  }

  if (pathname === '/api/v1/admin/bookings' && method === 'GET') return sendResponse(res, 200, await listBookings(pool, parsedUrl.query));
  const booking = pathname.match(new RegExp(`^/api/v1/admin/bookings/(${UUID})(?:/(export))?$`, 'i'));
  if (booking) {
    const bookingId = booking[1];
    if (booking[2] === 'export' && method === 'GET') {
      const result = await pool.query(`SELECT b.*,u.name customer_name,u.email customer_email,COALESCE(c.title,d.title) offer_title FROM bookings b JOIN users u ON u.id=b.user_id LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id WHERE b.id=$1`, [bookingId]);
      if (!result.rows[0]) throw httpError(404, 'Réservation introuvable.');
      const pdf = makePdf(result.rows[0]);
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="reservation-${bookingId}.pdf"`, 'Content-Length': pdf.length }); res.end(pdf); return true;
    }
    if (!booking[2] && method === 'GET') { const row = await pool.query('SELECT * FROM bookings WHERE id=$1', [bookingId]); if (!row.rows[0]) throw httpError(404, 'Réservation introuvable.'); return sendResponse(res, 200, { booking: row.rows[0] }); }
    if (!booking[2] && method === 'PUT') {
      const body = await parseJSONBody(req); const fields = [];
      if (body.status !== undefined) { if (!['pending', 'confirmed', 'cancelled'].includes(body.status)) throw httpError(400, 'Statut invalide.'); fields.push(['status', body.status]); }
      for (const key of ['internal_notes', 'cancellation_reason']) if (body[key] !== undefined) { if (body[key] !== null && (typeof body[key] !== 'string' || body[key].length > 10000)) throw httpError(400, `${key} est invalide.`); fields.push([key, body[key]]); }
      if (!fields.length) throw httpError(400, 'Aucune modification.');
      const set = fields.map(([key], index) => `${key}=$${index + 1}`).concat('updated_at=CURRENT_TIMESTAMP').join(','); const row = await pool.query(`UPDATE bookings SET ${set} WHERE id=$${fields.length + 1} RETURNING *`, [...fields.map(([, value]) => value), bookingId]);
      if (!row.rows[0]) throw httpError(404, 'Réservation introuvable.'); return sendResponse(res, 200, { booking: row.rows[0] });
    }
  }

  if (pathname === '/api/v1/admin/settings') {
    if (method === 'GET') { const rows = await pool.query('SELECT key,value,updated_at,updated_by FROM site_settings ORDER BY key'); return sendResponse(res, 200, { settings: rows.rows }); }
    if (method === 'PUT') { const body = await parseJSONBody(req); if (typeof body.key !== 'string' || !/^[a-z][a-z0-9_.-]{0,99}$/i.test(body.key) || !isPlainObject(body.value)) throw httpError(400, 'Clé ou valeur de configuration invalide.'); const row = await pool.query(`INSERT INTO site_settings(key,value,updated_by) VALUES($1,$2,$3) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=CURRENT_TIMESTAMP RETURNING *`, [body.key, body.value, req.auth.id]); return sendResponse(res, 200, { setting: row.rows[0] }); }
  }

  const match = pathname.match(new RegExp(`^/api/v1/admin/(posts|banners|coupons|reviews)(?:/(${UUID}))?$`, 'i'));
  if (!match) return false;
  const [, name, id] = match; const resource = resources[name];
  if (method === 'GET' && !id) { const rows = await pool.query(`SELECT * FROM ${resource.table} ORDER BY ${resource.order}`); return sendResponse(res, 200, { [name]: rows.rows }); }
  if (method === 'GET' && id) { const row = await pool.query(`SELECT * FROM ${resource.table} WHERE id=$1`, [id]); if (!row.rows[0]) throw httpError(404, 'Élément introuvable.'); return sendResponse(res, 200, { [resource.singular]: row.rows[0] }); }
  if (method === 'POST' && !id) { const values = validateResource(name, await parseJSONBody(req), { creating: true }); if (name === 'posts') values.author_id = req.auth.id; const fields = Object.keys(values); const row = await pool.query(`INSERT INTO ${resource.table}(${fields.join(',')}) VALUES(${placeholders(fields)}) RETURNING *`, fields.map(field => values[field])); return sendResponse(res, 201, { [resource.singular]: row.rows[0] }); }
  if (method === 'PUT' && id) { const values = validateResource(name, await parseJSONBody(req)); const fields = Object.keys(values); const set = fields.map((field, index) => `${field}=$${index + 1}`).concat('updated_at=CURRENT_TIMESTAMP').join(','); const row = await pool.query(`UPDATE ${resource.table} SET ${set} WHERE id=$${fields.length + 1} RETURNING *`, [...fields.map(field => values[field]), id]); if (!row.rows[0]) throw httpError(404, 'Élément introuvable.'); return sendResponse(res, 200, { [resource.singular]: row.rows[0] }); }
  if (method === 'DELETE' && id) { const row = await pool.query(`DELETE FROM ${resource.table} WHERE id=$1 RETURNING id`, [id]); if (!row.rows[0]) throw httpError(404, 'Élément introuvable.'); return sendResponse(res, 204, {}); }
  throw httpError(405, 'Méthode non autorisée.');
}

module.exports = { handleAdminBackoffice, makePdf, validateResource, circuitPayload };
