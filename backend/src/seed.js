/* Jeu de démonstration idempotent. À réserver aux environnements locaux/staging. */
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

if (process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error('Refus du seed : définissez ALLOW_DEMO_SEED=true pour un environnement de démonstration.');
}

const pool = new Pool(process.env.DB_HOST ? {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432), user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), database: process.env.DB_NAME,
} : { connectionString: process.env.DATABASE_URL });

async function user(client, { name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await client.query(`INSERT INTO users(name,email,password_hash,salt,is_verified,is_active)
    VALUES($1,$2,$3,'',TRUE,TRUE) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,is_verified=TRUE,is_active=TRUE
    RETURNING id`, [name, email, passwordHash]);
  const id = result.rows[0].id;
  await client.query('DELETE FROM user_roles WHERE user_id=$1', [id]);
  await client.query(`INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE code=$2`, [id, role]);
  return id;
}

async function destination(client, values) {
  const existing = await client.query('SELECT id FROM destinations WHERE title=$1 ORDER BY created_at LIMIT 1', [values.title]);
  if (existing.rows[0]) { await client.query('UPDATE destinations SET description=$1,price=$2,location=$3,cover_image=$4,is_active=TRUE,updated_at=CURRENT_TIMESTAMP WHERE id=$5', [values.description, values.price, values.location, values.cover, existing.rows[0].id]); return existing.rows[0].id; }
  const result = await client.query('INSERT INTO destinations(title,description,price,location,cover_image,is_active) VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id', [values.title, values.description, values.price, values.location, values.cover]); return result.rows[0].id;
}

async function circuit(client, destinationId, values) {
  const existing = await client.query('SELECT id FROM circuits WHERE title=$1 ORDER BY created_at LIMIT 1', [values.title]);
  const data = [destinationId, values.title, values.description, values.price, values.duration, values.capacity, values.cover, JSON.stringify(values.inclusions), JSON.stringify(values.exclusions)];
  const result = existing.rows[0]
    ? await client.query('UPDATE circuits SET destination_id=$1,title=$2,description=$3,price=$4,duration_days=$5,capacity=$6,cover_image=$7,inclusions=$8,exclusions=$9,is_active=TRUE,updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING id', [...data, existing.rows[0].id])
    : await client.query('INSERT INTO circuits(destination_id,title,description,price,duration_days,capacity,cover_image,inclusions,exclusions,is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE) RETURNING id', data);
  const id = result.rows[0].id;
  await Promise.all(['circuit_images', 'circuit_itineraries', 'circuit_departures'].map(table => client.query(`DELETE FROM ${table} WHERE circuit_id=$1`, [id])));
  for (const image of values.gallery) await client.query('INSERT INTO circuit_images(circuit_id,image_url) VALUES($1,$2)', [id, image]);
  for (const [index, item] of values.itinerary.entries()) await client.query('INSERT INTO circuit_itineraries(circuit_id,day_number,title,description,accommodation,meals) VALUES($1,$2,$3,$4,$5,$6)', [id, index + 1, item.title, item.description, item.accommodation, item.meals]);
  for (const departure of values.departures) await client.query('INSERT INTO circuit_departures(circuit_id,start_date,end_date,total_places,reserved_places,status) VALUES($1,$2,$3,$4,$5,$6)', [id, departure.start, departure.end, departure.total, departure.reserved, departure.status]);
  return id;
}

const image = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const adminId = await user(client, { name: 'Administrateur TravelMS', email: 'admin@travelms.com', password: 'admin123', role: 'admin' });
    const clientId = await user(client, { name: 'Client Démonstration', email: 'client@travelms.com', password: 'user123', role: 'client' });
    const nosyBe = await destination(client, { title: 'Nosy Be', description: 'Île volcanique aux plages préservées.', price: 950, location: 'Madagascar', cover: image('1507525428034-b723cf961d3e') });
    const isalo = await destination(client, { title: 'Massif de l’Isalo', description: 'Canyons, savane et piscines naturelles.', price: 740, location: 'Madagascar', cover: image('1544735716-392fe2489ffa') });
    const baobabs = await destination(client, { title: 'Allée des Baobabs', description: 'Coucher de soleil mythique à l’ouest.', price: 680, location: 'Madagascar', cover: image('1528127269322-539801943592') });
    const circuits = [];
    circuits.push(await circuit(client, nosyBe, { title: 'Échappée marine à Nosy Be', description: 'Sept jours entre lagons, plongée et villages de pêcheurs.', price: 1890, duration: 7, capacity: 12, cover: image('1507525428034-b723cf961d3e'), gallery: [image('1510414842594-a61c69b5ae57'), image('1484291470158-b8f8d608850d')], inclusions: ['Hôtels 4 étoiles', 'Transferts', 'Guide local', 'Petits-déjeuners'], exclusions: ['Vol international', 'Assurances', 'Dépenses personnelles'], itinerary: [{ title: 'Bienvenue à Nosy Be', description: 'Accueil à l’aéroport et installation.', accommodation: 'Lodge Ambatoloaka', meals: 'Dîner' }, { title: 'Excursion à Nosy Komba', description: 'Pirogue et rencontre avec les lémuriens.', accommodation: 'Lodge Ambatoloaka', meals: 'Petit-déjeuner, déjeuner' }, { title: 'Navigation dans les Mitsio', description: 'Journée snorkeling et plage.', accommodation: 'Bateau traditionnel', meals: 'Tous les repas' }], departures: [{ start: '2027-06-10', end: '2027-06-17', total: 12, reserved: 4, status: 'open' }, { start: '2027-08-05', end: '2027-08-12', total: 12, reserved: 0, status: 'open' }] }));
    circuits.push(await circuit(client, isalo, { title: 'Randonnée dans l’Isalo', description: 'Cinq jours de marche douce dans les grands canyons malgaches.', price: 1290, duration: 5, capacity: 10, cover: image('1544735716-392fe2489ffa'), gallery: [image('1469474968028-56623f02e42e'), image('1464822759023-fed622ff2c3b')], inclusions: ['Bivouac équipé', 'Guide de montagne', 'Repas en randonnée'], exclusions: ['Vol international', 'Boissons'], itinerary: [{ title: 'Canyon des Rats', description: 'Première marche dans les formations de grès.', accommodation: 'Camp Isalo', meals: 'Déjeuner, dîner' }, { title: 'Piscine naturelle', description: 'Baignade et découverte de la flore.', accommodation: 'Camp Isalo', meals: 'Tous les repas' }], departures: [{ start: '2027-07-03', end: '2027-07-08', total: 10, reserved: 7, status: 'open' }] }));
    circuits.push(await circuit(client, baobabs, { title: 'Route des Baobabs', description: 'Une immersion photographique entre Morondava et Tsingy.', price: 1490, duration: 6, capacity: 8, cover: image('1528127269322-539801943592'), gallery: [image('1476900543704-4312b7869e30'), image('1500530855697-b586d89ba3ee')], inclusions: ['Véhicule privé', 'Hébergements', 'Guide chauffeur'], exclusions: ['Vol intérieur', 'Visa'], itinerary: [{ title: 'Morondava', description: 'Installation sur la côte ouest.', accommodation: 'Hôtel de charme', meals: 'Dîner' }, { title: 'Coucher de soleil', description: 'Session photo à l’allée des Baobabs.', accommodation: 'Hôtel de charme', meals: 'Petit-déjeuner, dîner' }], departures: [{ start: '2027-09-12', end: '2027-09-18', total: 8, reserved: 8, status: 'closed' }] }));
    await client.query('DELETE FROM bookings WHERE user_id=$1', [clientId]);
    const bookingRows = [
      [circuits[0], '2027-06-10', '2027-06-17', 2, 3780, 'pending', 'Appeler le client pour confirmer le transfert.', null],
      [circuits[1], '2027-07-03', '2027-07-08', 1, 1290, 'confirmed', 'Client fidèle, préférence repas végétarien.', null],
      [circuits[2], '2027-09-12', '2027-09-18', 2, 2980, 'cancelled', 'Annulée à la demande du client.', 'Changement de dates de voyage'],
    ];
    for (const row of bookingRows) await client.query('INSERT INTO bookings(user_id,circuit_id,start_date,end_date,participants_count,total_price,status,contact_name,contact_email,contact_phone,booking_options,internal_notes,cancellation_reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)', [clientId, ...row.slice(0, 6), 'Client Démonstration', 'client@travelms.com', '+261 34 00 000 00', JSON.stringify({ cancellation_protection: false, airport_transfer: true }), row[6], row[7]]);
    await client.query(`INSERT INTO posts(title,slug,excerpt,content,cover_image,author_id,tags,status,published_at) VALUES('Préparer son voyage à Madagascar','preparer-voyage-madagascar','Nos conseils essentiels.','Guide pratique pour organiser un séjour inoubliable à Madagascar.', $1,$2,ARRAY['Conseils','Madagascar'],'published',CURRENT_TIMESTAMP) ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,updated_at=CURRENT_TIMESTAMP`, [image('1464822759023-fed622ff2c3b'), adminId]);
    await client.query(`DELETE FROM banners WHERE title='Saison sèche 2027'; INSERT INTO banners(title,subtitle,image_url,cta_label,cta_url,display_order,is_active) VALUES('Saison sèche 2027','-15% sur nos départs sélectionnés',$1,'Découvrir les circuits','/catalog/circuits',1,TRUE)`, [image('1476900543704-4312b7869e30')]);
    await client.query(`INSERT INTO coupons(code,discount_type,discount_value,valid_from,valid_until,max_uses,is_active) VALUES('SAISONSECHE15','percent',15,'2027-04-01','2027-10-31',100,TRUE) ON CONFLICT(code) DO UPDATE SET discount_value=15,valid_from=EXCLUDED.valid_from,valid_until=EXCLUDED.valid_until,is_active=TRUE`);
    await client.query('DELETE FROM reviews WHERE user_id=$1', [clientId]);
    await client.query(`INSERT INTO reviews(user_id,circuit_id,rating,comment,status,admin_response,responded_by,responded_at) VALUES($1,$2,5,'Une équipe attentive et un voyage exceptionnel.','approved','Merci pour votre confiance !',$3,CURRENT_TIMESTAMP)`, [clientId, circuits[0], adminId]);
    await client.query(`INSERT INTO site_settings(key,value,updated_by) VALUES('general',$1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=CURRENT_TIMESTAMP`, [JSON.stringify({ site_name: 'TravelMS', currency: 'EUR', contact_email: 'contact@travelms.com', cancellation_hours: 48 }), adminId]);
    await client.query('COMMIT'); console.log('[Seed] Données de démonstration prêtes.');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); await pool.end(); }
}
seed().catch(error => { console.error('[Seed] Échec :', error); process.exit(1); });
