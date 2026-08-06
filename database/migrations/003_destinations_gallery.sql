-- Migration 003: créations des tables destinations et destination_images
BEGIN;

CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    cover_image VARCHAR(512) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destination_images (
    id SERIAL PRIMARY KEY,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_destination_images_destination_id ON destination_images(destination_id);

COMMIT;
