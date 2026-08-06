const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('pg');
const crypto = require('crypto');

// DB pool (recreate same settings as server.js)
const pool = new Pool(
    process.env.DB_HOST
        ? {
              host: process.env.DB_HOST || 'localhost',
              user: process.env.DB_USER || 'travel_user',
              password: process.env.DB_PASSWORD || 'travel_password',
              database: process.env.DB_NAME || 'travel_db',
              port: process.env.DB_PORT || 5432
          }
        : { connectionString: process.env.DATABASE_URL }
);

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const DESTINATION_UPLOAD_DIR = path.join(UPLOAD_DIR, 'destinations');

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
    const timestamp = Math.floor(Date.now() / 1000);
    return `dest_${destinationId}_${timestamp}_${baseName}${ext}`;
}

async function ensureDir(dir) {
    await fs.promises.mkdir(dir, { recursive: true });
}

// Multer storage to temp upload directory; we'll move/rename after DB insert
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureDir(DESTINATION_UPLOAD_DIR);
        cb(null, DESTINATION_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // keep original filename for now
        const safeName = sanitizeFileName(file.originalname) || `upload-${Date.now()}`;
        cb(null, `${Date.now()}_${safeName}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        cb(null, allowed.includes(file.mimetype));
    }
});

// Public endpoints
router.get('/destinations', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT id, title, description, price, location, cover_image, created_at FROM destinations WHERE is_active = TRUE ORDER BY created_at DESC');
        const list = rows.map(d => ({ ...d, image_url: d.cover_image }));
        res.json({ destinations: list });
    } catch (err) { next(err); }
});

router.get('/destinations/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID invalide' });
    try {
        const { rows } = await pool.query('SELECT id, title, description, price, location, cover_image, created_at FROM destinations WHERE id=$1', [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Destination introuvable' });
        const dest = rows[0];
        const images = await pool.query('SELECT id, image_url, created_at FROM destination_images WHERE destination_id=$1 ORDER BY created_at ASC', [id]);
        res.json({ destination: { ...dest, image_url: dest.cover_image, gallery: images.rows } });
    } catch (err) { next(err); }
});

// Admin endpoints: for brevity, simple auth placeholder middleware
function requireAdmin(req, res, next) {
    // Expect a bearer token that when present grants access in this demo.
    const auth = (req.headers.authorization || '').split(' ')[1];
    if (!auth) return res.status(403).json({ error: 'Permission insuffisante.' });
    // In real app, validate JWT and check roles.
    next();
}

router.post('/admin/destinations', requireAdmin, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery' }]), async (req, res, next) => {
    const { title, description, price, location, is_active } = req.body;
    if (!title || !description || !location) return res.status(400).json({ error: 'Champs manquants' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insert = await client.query(
            `INSERT INTO destinations (title, description, price, location, cover_image, is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, title, description, price, location, cover_image, is_active, created_at`,
            [title.trim(), description.trim(), price || 0, location.trim(), '', is_active === 'false' ? false : true]
        );
        const destination = insert.rows[0];

        const movedFiles = [];
        let coverUrl = '';

        // Move cover image and rename
        if (req.files && req.files.cover_image && req.files.cover_image[0]) {
            const file = req.files.cover_image[0];
            const fileName = buildDestinationFileName(destination.id, file.originalname);
            const destPath = path.join(DESTINATION_UPLOAD_DIR, fileName);
            await fs.promises.rename(file.path, destPath);
            movedFiles.push(destPath);
            coverUrl = `/uploads/destinations/${fileName}`;
            await client.query('UPDATE destinations SET cover_image=$1 WHERE id=$2', [coverUrl, destination.id]);
        }

        const galleryRows = [];
        const galleryFiles = (req.files && req.files.gallery) || [];
        for (let i = 0; i < galleryFiles.length; i++) {
            const g = galleryFiles[i];
            const fileName = buildDestinationFileName(destination.id, g.originalname);
            const destPath = path.join(DESTINATION_UPLOAD_DIR, fileName);
            await fs.promises.rename(g.path, destPath);
            movedFiles.push(destPath);
            const imageUrl = `/uploads/destinations/${fileName}`;
            const r = await client.query('INSERT INTO destination_images (destination_id, image_url) VALUES ($1,$2) RETURNING id, image_url, created_at', [destination.id, imageUrl]);
            galleryRows.push(r.rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json({ destination: { ...destination, cover_image: coverUrl, image_url: coverUrl, gallery: galleryRows } });
    } catch (err) {
        await client.query('ROLLBACK');
        // cleanup temp files
        if (req.files) {
            Object.values(req.files).flat().forEach(async f => {
                try { await fs.promises.unlink(f.path); } catch (e) { }
            });
        }
        next(err);
    } finally {
        client.release();
    }
});

// PUT and DELETE omitted for brevity; can be implemented similarly.

module.exports = router;
