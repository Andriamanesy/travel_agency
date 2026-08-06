-- Migration 004 : destination cover image et galerie d'images

ALTER TABLE destinations
    RENAME COLUMN image_url TO cover_image;

ALTER TABLE destinations
    ALTER COLUMN cover_image TYPE VARCHAR(512);

CREATE TABLE IF NOT EXISTS destination_images (
    id SERIAL PRIMARY KEY,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS destination_images_destination_id_idx ON destination_images (destination_id);
