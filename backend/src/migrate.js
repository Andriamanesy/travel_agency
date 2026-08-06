const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const migrationsDirectory = path.join(__dirname, '../migrations');
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

async function getMigrations() {
    const entries = await fs.readdir(migrationsDirectory, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && /^\d+_.+\.sql$/.test(entry.name))
        .map(entry => entry.name)
        .sort();
}

async function applyMigrations() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                checksum CHAR(64) NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        for (const version of await getMigrations()) {
            const sql = await fs.readFile(path.join(migrationsDirectory, version), 'utf8');
            const checksum = crypto.createHash('sha256').update(sql).digest('hex');
            const { rows } = await client.query(
                'SELECT checksum FROM schema_migrations WHERE version = $1',
                [version]
            );

            if (rows[0]) {
                if (rows[0].checksum !== checksum) {
                    throw new Error(`La migration ${version} a été modifiée après son application.`);
                }
                console.log(`[Migration] Déjà appliquée : ${version}`);
                continue;
            }

            console.log(`[Migration] Application : ${version}`);
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)',
                    [version, checksum]
                );
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
    } finally {
        client.release();
    }
}

async function main() {
    let failed = false;
    try {
        await applyMigrations();
        console.log('[Migration] Schéma à jour.');
    } catch (error) {
        failed = true;
        console.error('[Migration] Échec :', error);
    } finally {
        await pool.end();
    }

    if (failed) {
        process.exit(1);
    }
}

main();
