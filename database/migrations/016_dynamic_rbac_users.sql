-- RBAC dynamique administrable : extension non destructive du RBAC historique.
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS label VARCHAR(255);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS category VARCHAR(100);
UPDATE permissions SET label = COALESCE(label, description, code), category = COALESCE(category, 'Historique');
ALTER TABLE permissions ALTER COLUMN label SET NOT NULL;
ALTER TABLE permissions ALTER COLUMN category SET NOT NULL;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE roles SET name = COALESCE(name, label, code), description = COALESCE(description, label);
ALTER TABLE roles ALTER COLUMN name SET NOT NULL;
UPDATE roles SET is_system = TRUE WHERE code IN ('admin', 'agent', 'client');

-- Le rôle principal est la référence utilisée par le nouveau Back-Office.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id SMALLINT REFERENCES roles(id) ON DELETE RESTRICT;
UPDATE users u SET role_id = ur.role_id
FROM user_roles ur
WHERE ur.user_id = u.id AND u.role_id IS NULL;
UPDATE users SET role_id = (SELECT id FROM roles WHERE code = 'client') WHERE role_id IS NULL;
CREATE INDEX IF NOT EXISTS users_role_id_idx ON users(role_id);

INSERT INTO roles (code, label, name, description, is_system)
VALUES ('super_admin', 'Super administrateur', 'Super administrateur', 'Accès complet au Back-Office', TRUE)
ON CONFLICT (code) DO UPDATE SET is_system = TRUE;

INSERT INTO permissions (code, name, description, label, category) VALUES
  ('circuits:read', 'circuits:read', 'Consulter le catalogue', 'Consulter', 'Catalogue'),
  ('circuits:write', 'circuits:write', 'Créer et modifier le catalogue', 'Créer et modifier', 'Catalogue'),
  ('circuits:delete', 'circuits:delete', 'Supprimer du catalogue', 'Supprimer', 'Catalogue'),
  ('bookings:read', 'bookings:read', 'Consulter les réservations', 'Consulter', 'Réservations'),
  ('bookings:write', 'bookings:write', 'Modifier les réservations', 'Créer et modifier', 'Réservations'),
  ('bookings:cancel', 'bookings:cancel', 'Annuler les réservations', 'Annuler', 'Réservations'),
  ('marketing:manage', 'marketing:manage', 'Gérer les campagnes marketing', 'Gérer le marketing', 'Marketing & Content'),
  ('content:manage', 'content:manage', 'Gérer les contenus', 'Gérer le contenu', 'Marketing & Content'),
  ('reviews:moderate', 'reviews:moderate', 'Modérer les avis', 'Modérer les avis', 'Marketing & Content'),
  ('users:read', 'users:read', 'Consulter les utilisateurs', 'Consulter les utilisateurs', 'Administration & Sécurité'),
  ('users:write', 'users:write', 'Créer et modifier les utilisateurs', 'Créer et modifier les utilisateurs', 'Administration & Sécurité'),
  ('users:delete', 'users:delete', 'Supprimer les utilisateurs', 'Supprimer les utilisateurs', 'Administration & Sécurité'),
  ('roles:manage', 'roles:manage', 'Gérer les rôles et permissions', 'Gérer les rôles', 'Administration & Sécurité')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, label = EXCLUDED.label, category = EXCLUDED.category;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('admin', 'super_admin')
  AND p.code IN ('circuits:read','circuits:write','circuits:delete','bookings:read','bookings:write','bookings:cancel','marketing:manage','content:manage','reviews:moderate','users:read','users:write','users:delete','roles:manage')
ON CONFLICT DO NOTHING;
