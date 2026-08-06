-- Migration idempotente pour les volumes PostgreSQL déjà existants.
-- Le script init-db.sql n'est exécuté que lors de la première création du volume.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS preferred_lang VARCHAR(10) DEFAULT 'fr',
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;
