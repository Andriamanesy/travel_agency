/* Catalogue métier et tunnel de réservation (Phase 3).
 * Ce module est indépendant du serveur HTTP afin de conserver les routes
 * métier lisibles et testables malgré l'architecture Node native existante.
 */
const fs = require('fs/promises');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

function httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function pageParams(query) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 12));
    return { page, limit, offset: (page - 1) * limit };
}

function string(value, label, { required = true, max = 500 } = {}) {
    const output = typeof value === 'string' ? value.trim() : '';
    if (required && !output) throw httpError(400, `${label} est requis.`);
    if (output.length > max) throw httpError(400, `${label} est trop long.`);
    return output;
}

function number(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
    const output = Number(value);
    if (!Number.isFinite(output) || output < min || output > max || (integer && !Number.isInteger(output))) {
        throw httpError(400, `${label} est invalide.`);
    }
    return output;
}

function bool(value, defaultValue = true) {
    if (value === undefined) return defaultValue;
    return value === true || value === 'true' || value === 1 || value === '1';
}

function isUuid(value) {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function bookingOptions(value) {
    const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    if (Object.values(input).some(item => typeof item !== 'boolean')) throw httpError(400, 'Les options de réservation sont invalides.');
    return {
        cancellation_protection: input.cancellation_protection === true,
        airport_transfer: input.airport_transfer === true
    };
}

function bookingContact(body, user) {
    const name = typeof body.contact_name === 'string' ? body.contact_name.trim() : user.name;
    const email = typeof body.contact_email === 'string' ? body.contact_email.trim().toLowerCase() : user.email;
    const phone = typeof body.contact_phone === 'string' ? body.contact_phone.trim() : (user.phone || '');
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length > 50) {
        throw httpError(400, 'Les coordonnées de contact sont invalides.');
    }
    return { name, email, phone };
}

function canManage(auth, entity) {
    const permissions = auth?.permissions || [];
    if (permissions.includes('settings:manage')) return true;
    return entity === 'circuits'
        ? permissions.includes('circuits:manage')
        : entity === 'destinations'
            ? permissions.includes('destinations:manage')
            : false;
}

function adminGuard(req, entity, getUserByToken) {
    return getUserByToken(req).then(user => {
        if (!user || !canManage(req.auth, entity)) throw httpError(403, 'Permission insuffisante.');
        return user;
    });
}

function catalogConfig(entity) {
    return {
        categories: {
            table: 'categories', id: 'id', order: 'name ASC',
            fields: ['name', 'slug', 'description'], search: ['name', 'description'],
            payload(body, slugify) {
                const name = string(body.name, 'Le nom', { max: 100 });
                return { name, slug: string(body.slug || slugify(name), 'Le slug', { max: 100 }), description: string(body.description, 'La description', { required: false, max: 5000 }) };
            }
        },
        circuits: {
            table: 'circuits', id: 'id', order: 'created_at DESC',
            fields: ['destination_id', 'title', 'description', 'price', 'duration_days', 'capacity', 'cover_image', 'is_active'], search: ['title', 'description'],
            payload(body) {
                if (!isUuid(body.destination_id)) throw httpError(400, 'La destination est invalide.');
                return { destination_id: body.destination_id, title: string(body.title, 'Le titre', { max: 255 }), description: string(body.description, 'La description', { max: 10000 }), price: number(body.price, 'Le prix', { max: 10000000 }), duration_days: number(body.duration_days, 'La durée', { min: 1, max: 365, integer: true }), capacity: number(body.capacity ?? 50, 'La capacité', { min: 1, max: 10000, integer: true }), cover_image: string(body.cover_image, 'L’image de couverture', { required: false, max: 512 }), is_active: bool(body.is_active) };
            }
        },
        hotels: {
            table: 'hotels', id: 'id', order: 'created_at DESC',
            fields: ['destination_id', 'name', 'address', 'price_per_night', 'rating', 'cover_image', 'is_active'], search: ['name', 'address'],
            payload(body) {
                if (!isUuid(body.destination_id)) throw httpError(400, 'La destination est invalide.');
                return { destination_id: body.destination_id, name: string(body.name, 'Le nom', { max: 255 }), address: string(body.address, 'L’adresse', { max: 500 }), price_per_night: number(body.price_per_night, 'Le prix par nuit', { max: 10000000 }), rating: body.rating === '' || body.rating === undefined ? null : number(body.rating, 'La note', { min: 0, max: 5 }), cover_image: string(body.cover_image, 'L’image de couverture', { required: false, max: 512 }), is_active: bool(body.is_active) };
            }
        },
        guides: {
            table: 'guides', id: 'id', order: 'name ASC',
            fields: ['name', 'email', 'phone', 'bio', 'avatar_url', 'is_active'], search: ['name', 'bio'],
            payload(body) {
                const email = string(body.email, 'L’e-mail', { max: 254 }).toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, 'L’e-mail du guide est invalide.');
                return { name: string(body.name, 'Le nom', { max: 150 }), email, phone: string(body.phone, 'Le téléphone', { required: false, max: 50 }), bio: string(body.bio, 'La biographie', { required: false, max: 10000 }), avatar_url: string(body.avatar_url, 'La photo', { required: false, max: 512 }), is_active: bool(body.is_active) };
            }
        }
    }[entity];
}

async function listEntity(pool, entity, query) {
    const config = catalogConfig(entity);
    const { page, limit, offset } = pageParams(query);
    const clauses = entity === 'categories' ? ['TRUE'] : ['is_active = TRUE'];
    const values = [];
    const q = typeof query.q === 'string' ? query.q.trim() : '';
    if (q) {
        values.push(`%${q}%`);
        clauses.push(`(${config.search.map(field => `${field} ILIKE $${values.length}`).join(' OR ')})`);
    }
    if (query.destination_id && ['circuits', 'hotels'].includes(entity)) {
        if (!isUuid(query.destination_id)) throw httpError(400, 'Destination invalide.');
        values.push(query.destination_id);
        clauses.push(`destination_id = $${values.length}`);
    }
    const where = clauses.join(' AND ');
    const count = await pool.query(`SELECT COUNT(*)::int AS count FROM ${config.table} WHERE ${where}`, values);
    values.push(limit, offset);
    const rows = await pool.query(`SELECT * FROM ${config.table} WHERE ${where} ORDER BY ${config.order} LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
    return { [entity]: rows.rows, pagination: { page, limit, total: count.rows[0].count, pages: Math.ceil(count.rows[0].count / limit) } };
}

async function destinationDetails(pool, id) {
    const destination = await pool.query(`SELECT d.*, c.id AS category_id, c.name AS category_name, c.slug AS category_slug
        FROM destinations d LEFT JOIN categories c ON c.id=d.category_id WHERE d.id=$1 AND d.is_active=TRUE`, [id]);
    if (!destination.rows[0]) return null;
    const [gallery, circuits, hotels] = await Promise.all([
        pool.query('SELECT id, image_url, created_at FROM destination_images WHERE destination_id=$1 ORDER BY created_at', [id]),
        pool.query('SELECT id,title,description,price,duration_days,cover_image FROM circuits WHERE destination_id=$1 AND is_active=TRUE ORDER BY created_at DESC', [id]),
        pool.query('SELECT id,name,address,price_per_night,rating,cover_image FROM hotels WHERE destination_id=$1 AND is_active=TRUE ORDER BY rating DESC NULLS LAST', [id])
    ]);
    return { ...destination.rows[0], image_url: destination.rows[0].cover_image, gallery: gallery.rows, circuits: circuits.rows, hotels: hotels.rows };
}

async function details(pool, entity, id) {
    if (entity === 'destinations') return destinationDetails(pool, id);
    const config = catalogConfig(entity);
    const result = await pool.query(`SELECT * FROM ${config.table} WHERE id=$1${entity === 'categories' ? '' : ' AND is_active=TRUE'}`, [id]);
    const item = result.rows[0];
    if (!item) return null;
    if (entity === 'circuits') {
        const [gallery, destination, hotels] = await Promise.all([
            pool.query('SELECT id,image_url,created_at FROM circuit_images WHERE circuit_id=$1 ORDER BY created_at', [id]),
            pool.query('SELECT id,title,location,cover_image FROM destinations WHERE id=$1', [item.destination_id]),
            pool.query('SELECT id,name,address,price_per_night,rating,cover_image FROM hotels WHERE destination_id=$1 AND is_active=TRUE', [item.destination_id])
        ]);
        return { ...item, gallery: gallery.rows, destination: destination.rows[0] || null, hotels: hotels.rows };
    }
    if (entity === 'hotels') {
        const destination = await pool.query('SELECT id,title,location,cover_image FROM destinations WHERE id=$1', [item.destination_id]);
        return { ...item, destination: destination.rows[0] || null };
    }
    return item;
}

async function mutateEntity({ pool, entity, method, id, body, slugify }) {
    const config = catalogConfig(entity);
    const payload = config.payload(body, slugify);
    const values = config.fields.map(field => payload[field]);
    if (method === 'POST') {
        const result = await pool.query(`INSERT INTO ${config.table} (${config.fields.join(',')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(',')}) RETURNING *`, values);
        const item = result.rows[0];
        if (entity === 'circuits') await syncCircuitGallery(pool, item.id, body.gallery_urls);
        return item;
    }
    const assignments = config.fields.map((field, index) => `${field}=$${index + 1}`);
    assignments.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    const result = await pool.query(`UPDATE ${config.table} SET ${assignments.join(',')} WHERE id=$${values.length} RETURNING *`, values);
    if (!result.rows[0]) throw httpError(404, 'Élément introuvable.');
    const item = result.rows[0];
    if (entity === 'circuits') await syncCircuitGallery(pool, item.id, body.gallery_urls);
    return item;
}

async function syncCircuitGallery(pool, circuitId, rawUrls) {
    if (rawUrls === undefined || String(rawUrls).trim() === '') return;
    const urls = Array.isArray(rawUrls) ? rawUrls : String(rawUrls).split(/[\n,]/);
    const clean = [...new Set(urls.map(url => String(url).trim()).filter(Boolean))];
    if (clean.some(url => url.length > 512)) throw httpError(400, 'Une URL de galerie est trop longue.');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM circuit_images WHERE circuit_id=$1', [circuitId]);
        for (const imageUrl of clean) await client.query('INSERT INTO circuit_images (circuit_id,image_url) VALUES ($1,$2)', [circuitId, imageUrl]);
        await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}

function localMediaPath(url, folder) {
    const prefix = `/uploads/${folder}/`;
    if (typeof url !== 'string' || !url.startsWith(prefix)) return null;
    return path.join(UPLOAD_DIR, folder, path.basename(url));
}

async function cleanupMedia(urls, folder) {
    await Promise.all(urls.map(url => localMediaPath(url, folder)).filter(Boolean).map(file => fs.unlink(file).catch(error => {
        if (error.code !== 'ENOENT') console.warn('[Catalogue] Nettoyage média impossible :', error.message);
    })));
}

async function createBooking({ pool, req, body, getUserByToken, sendBookingConfirmationEmail }) {
    const user = await getUserByToken(req);
    if (!user) throw httpError(401, 'Connexion requise pour réserver.');
    const circuitId = body.circuit_id || null;
    const destinationId = body.destination_id || null;
    if ((circuitId && destinationId) || (!circuitId && !destinationId) || (circuitId && !isUuid(circuitId)) || (destinationId && !isUuid(destinationId))) {
        throw httpError(400, 'Sélectionnez un circuit ou une destination.');
    }
    if (!isDate(body.start_date) || !isDate(body.end_date) || body.end_date <= body.start_date) throw httpError(400, 'Les dates de réservation sont invalides.');
    const participants = number(body.participants_count, 'Le nombre de participants', { min: 1, max: 50, integer: true });
    const options = bookingOptions(body.options);
    const contact = bookingContact(body, user);
    const client = await pool.connect();
    let booking;
    let label;
    try {
        await client.query('BEGIN');
        const target = circuitId
            ? await client.query('SELECT id,title,price,destination_id,capacity FROM circuits WHERE id=$1 AND is_active=TRUE FOR UPDATE', [circuitId])
            : await client.query('SELECT id,title,price,capacity FROM destinations WHERE id=$1 AND is_active=TRUE FOR UPDATE', [destinationId]);
        if (!target.rows[0]) throw httpError(409, 'Cette offre n’est plus disponible.');
        const reserved = await client.query(
            `SELECT COALESCE(SUM(participants_count),0)::int AS count FROM bookings
             WHERE ${circuitId ? 'circuit_id' : 'destination_id'}=$1
               AND status IN ('pending','confirmed')
               AND start_date < $3::date AND end_date > $2::date`,
            [circuitId || destinationId, body.start_date, body.end_date]
        );
        if (reserved.rows[0].count + participants > target.rows[0].capacity) {
            throw httpError(409, 'Il ne reste pas assez de places disponibles pour ces dates.');
        }
        const optionTotal = (options.cancellation_protection ? 35 * participants : 0) + (options.airport_transfer ? 50 : 0);
        const total = Math.round((Number(target.rows[0].price) * participants + optionTotal) * 100) / 100;
        const result = await client.query(`INSERT INTO bookings (user_id,circuit_id,destination_id,start_date,end_date,participants_count,total_price,contact_name,contact_email,contact_phone,booking_options)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [user.id, circuitId, destinationId, body.start_date, body.end_date, participants, total, contact.name, contact.email, contact.phone, JSON.stringify(options)]);
        booking = result.rows[0];
        label = target.rows[0].title;
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
    try { await sendBookingConfirmationEmail(user.email, { ...booking, offer_title: label, customer_name: user.name }); } catch (error) { console.error('[SMTP] Confirmation réservation impossible :', error.message); }
    return booking;
}

async function handleCatalogRequest(context) {
    const { pathname, method, parsedUrl, req, pool, sendResponse, parseJSONBody, getUserByToken, slugify, sendBookingConfirmationEmail } = context;
    const publicMatch = pathname.match(/^\/api\/(categories|circuits|hotels|guides)(?:\/([^/]+))?$/);
    if (publicMatch && ['GET'].includes(method)) {
        const [, entity, id] = publicMatch;
        const output = id ? await details(pool, entity, id) : await listEntity(pool, entity, parsedUrl.query);
        if (!output) return sendResponse(context.res, 404, { error: 'Élément introuvable.' }), true;
        sendResponse(context.res, 200, id ? { [entity.slice(0, -1)]: output } : output);
        return true;
    }
    const destinationMatch = pathname.match(/^\/api\/destinations\/([0-9a-f-]{36})$/i);
    if (destinationMatch && method === 'GET') {
        const output = await details(pool, 'destinations', destinationMatch[1]);
        if (!output) sendResponse(context.res, 404, { error: 'Destination introuvable.' });
        else sendResponse(context.res, 200, { destination: output });
        return true;
    }
    if (pathname === '/api/bookings' && method === 'POST') {
        const booking = await createBooking({ pool, req, body: await parseJSONBody(req), getUserByToken, sendBookingConfirmationEmail });
        sendResponse(context.res, 201, { message: 'Réservation enregistrée. Une confirmation vous a été envoyée.', booking });
        return true;
    }
    if (pathname === '/api/bookings/me' && method === 'GET') {
        const user = await getUserByToken(req);
        if (!user) throw httpError(401, 'Connexion requise.');
        const bookings = await pool.query(`SELECT b.*, COALESCE(c.title,d.title) AS offer_title FROM bookings b
            LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id
            WHERE b.user_id=$1 ORDER BY b.created_at DESC`, [user.id]);
        sendResponse(context.res, 200, { bookings: bookings.rows });
        return true;
    }
    const adminMatch = pathname.match(/^\/api\/admin\/(categories|circuits|hotels|guides)(?:\/([^/]+))?$/);
    if (adminMatch) {
        const [, entity, id] = adminMatch;
        await adminGuard(req, entity, getUserByToken);
        if (method === 'GET') {
            const config = catalogConfig(entity);
            const rows = await pool.query(`SELECT * FROM ${config.table} ORDER BY ${config.order}`);
            sendResponse(context.res, 200, { [entity]: rows.rows });
            return true;
        }
        if (method === 'POST' && !id) {
            const item = await mutateEntity({ pool, entity, method, body: await parseJSONBody(req), slugify });
            sendResponse(context.res, 201, { [entity.slice(0, -1)]: item });
            return true;
        }
        if (method === 'PUT' && id) {
            const item = await mutateEntity({ pool, entity, method, id, body: await parseJSONBody(req), slugify });
            sendResponse(context.res, 200, { [entity.slice(0, -1)]: item });
            return true;
        }
        if (method === 'DELETE' && id) {
            const config = catalogConfig(entity);
            let media = [];
            if (entity === 'circuits') {
                const images = await pool.query('SELECT cover_image FROM circuits WHERE id=$1 UNION ALL SELECT image_url FROM circuit_images WHERE circuit_id=$1', [id]);
                media = images.rows.map(row => row.cover_image || row.image_url);
            } else if (entity === 'hotels') {
                const images = await pool.query('SELECT cover_image FROM hotels WHERE id=$1', [id]);
                media = images.rows.map(row => row.cover_image);
            } else if (entity === 'guides') {
                const images = await pool.query('SELECT avatar_url FROM guides WHERE id=$1', [id]);
                media = images.rows.map(row => row.avatar_url);
            }
            const result = await pool.query(`DELETE FROM ${config.table} WHERE id=$1 RETURNING id`, [id]);
            if (!result.rows[0]) throw httpError(404, 'Élément introuvable.');
            if (entity === 'circuits') await cleanupMedia(media, 'circuits');
            if (entity === 'hotels') await cleanupMedia(media, 'destinations');
            if (entity === 'guides') await cleanupMedia(media, 'guides');
            sendResponse(context.res, 200, { message: 'Élément supprimé.' });
            return true;
        }
    }
    if (pathname === '/api/admin/bookings' && method === 'GET') {
        await adminGuard(req, 'categories', getUserByToken);
        const rows = await pool.query(`SELECT b.*, u.name AS customer_name, u.email AS customer_email, COALESCE(c.title,d.title) AS offer_title FROM bookings b
            JOIN users u ON u.id=b.user_id LEFT JOIN circuits c ON c.id=b.circuit_id LEFT JOIN destinations d ON d.id=b.destination_id ORDER BY b.created_at DESC`);
        sendResponse(context.res, 200, { bookings: rows.rows });
        return true;
    }
    const bookingAdmin = pathname.match(/^\/api\/admin\/bookings\/([0-9a-f-]{36})$/i);
    if (bookingAdmin && method === 'PUT') {
        await adminGuard(req, 'categories', getUserByToken);
        const { status } = await parseJSONBody(req);
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) throw httpError(400, 'Statut invalide.');
        const result = await pool.query('UPDATE bookings SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, bookingAdmin[1]]);
        if (!result.rows[0]) throw httpError(404, 'Réservation introuvable.');
        sendResponse(context.res, 200, { booking: result.rows[0] });
        return true;
    }
    return false;
}

module.exports = { handleCatalogRequest };
