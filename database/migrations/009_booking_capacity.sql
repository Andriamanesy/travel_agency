-- Capacité disponible : permet de valider les réservations qui se chevauchent.
ALTER TABLE destinations
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 50
    CHECK (capacity > 0 AND capacity <= 10000);

ALTER TABLE circuits
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 50
    CHECK (capacity > 0 AND capacity <= 10000);
