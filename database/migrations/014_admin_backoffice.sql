-- Phase 1 Back-Office : contenus, marketing, avis et exploitation.
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE, excerpt TEXT, content TEXT NOT NULL DEFAULT '',
  cover_image TEXT, author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}', status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  published_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title VARCHAR(255) NOT NULL, subtitle TEXT,
  image_url TEXT, cta_label VARCHAR(80), cta_url TEXT, display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), code VARCHAR(64) NOT NULL UNIQUE,
  discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0), valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ, max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0), uses_count INTEGER NOT NULL DEFAULT 0,
  circuit_id UUID REFERENCES circuits(id) ON DELETE SET NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT coupons_validity_chk CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until > valid_from),
  CONSTRAINT coupons_percent_chk CHECK (discount_type <> 'percent' OR discount_value <= 100)
);
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  circuit_id UUID REFERENCES circuits(id) ON DELETE SET NULL, rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL, status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_response TEXT, responded_by UUID REFERENCES users(id) ON DELETE SET NULL, responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY, value JSONB NOT NULL, updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_notes TEXT, ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS banners_active_idx ON banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS coupons_active_validity_idx ON coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_admin_created_idx ON bookings(created_at DESC);
INSERT INTO permissions (code, name, description) VALUES
 ('content:manage','content:manage','Gérer le contenu éditorial'),('marketing:manage','marketing:manage','Gérer les campagnes marketing'),('reviews:manage','reviews:manage','Modérer les avis'),('bookings:export','bookings:export','Exporter les réservations') ON CONFLICT (code) DO NOTHING;
INSERT INTO role_permissions SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='admin' ON CONFLICT DO NOTHING;
