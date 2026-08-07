-- Données de contact et options figées au moment de la réservation.
-- Les valeurs par défaut préservent la compatibilité avec les réservations historiques.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(254),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS booking_options JSONB NOT NULL DEFAULT '{}'::jsonb;
