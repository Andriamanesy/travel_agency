-- Phase 3 : performances et intégrité du catalogue destination.
-- Le projet emploie déjà des UUID pour les destinations : destination_images
-- référence donc destinations(id) avec le même type, tout en conservant la
-- suppression en cascade demandée.

CREATE INDEX IF NOT EXISTS destinations_public_listing_idx
    ON destinations (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS destination_images_gallery_order_idx
    ON destination_images (destination_id, created_at ASC);

ALTER TABLE destinations
    ADD CONSTRAINT destinations_price_non_negative_chk
    CHECK (price >= 0) NOT VALID;

ALTER TABLE destinations
    VALIDATE CONSTRAINT destinations_price_non_negative_chk;
