ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS destinations_featured_idx ON destinations(is_featured, is_active, created_at DESC);

-- Les destinations de démonstration restent visibles après le déploiement.
UPDATE destinations SET is_featured = TRUE
WHERE id IN (SELECT id FROM destinations ORDER BY created_at DESC LIMIT 4);
