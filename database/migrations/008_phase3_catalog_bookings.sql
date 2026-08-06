-- Phase 3 : catalogue métier et réservations.
-- Les tables historiques utilisent des UUID : les nouvelles relations les
-- conservent afin d'éviter toute rupture de clé étrangère.

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE destinations
    ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS destinations_category_id_idx ON destinations(category_id);

CREATE TABLE IF NOT EXISTS circuits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    cover_image VARCHAR(512) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS circuits_destination_id_idx ON circuits(destination_id);
CREATE INDEX IF NOT EXISTS circuits_public_listing_idx ON circuits(is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS circuit_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS circuit_images_circuit_id_idx ON circuit_images(circuit_id, created_at);

CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    price_per_night NUMERIC(12,2) NOT NULL CHECK (price_per_night >= 0),
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    cover_image VARCHAR(512) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS hotels_destination_id_idx ON hotels(destination_id);

CREATE TABLE IF NOT EXISTS guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    avatar_url VARCHAR(512) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE RESTRICT,
    destination_id UUID REFERENCES destinations(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    participants_count INTEGER NOT NULL CHECK (participants_count > 0 AND participants_count <= 50),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_target_chk CHECK (
        (circuit_id IS NOT NULL AND destination_id IS NULL)
        OR (circuit_id IS NULL AND destination_id IS NOT NULL)
    ),
    CONSTRAINT bookings_dates_chk CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS bookings_user_created_idx ON bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status, created_at DESC);
