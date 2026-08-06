CREATE TABLE IF NOT EXISTS roles (id SMALLSERIAL PRIMARY KEY, code VARCHAR(30) UNIQUE NOT NULL, label VARCHAR(100) NOT NULL);
CREATE TABLE IF NOT EXISTS permissions (id SMALLSERIAL PRIMARY KEY, code VARCHAR(100) UNIQUE NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS role_permissions (role_id SMALLINT REFERENCES roles(id) ON DELETE CASCADE, permission_id SMALLINT REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY (role_id, permission_id));
CREATE TABLE IF NOT EXISTS user_roles (user_id UUID REFERENCES users(id) ON DELETE CASCADE, role_id SMALLINT REFERENCES roles(id) ON DELETE RESTRICT, PRIMARY KEY (user_id, role_id));
ALTER TABLE users ADD COLUMN IF NOT EXISTS authz_version INTEGER NOT NULL DEFAULT 1, ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE TABLE IF NOT EXISTS refresh_tokens (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash CHAR(64) UNIQUE NOT NULL, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS refresh_tokens_active_idx ON refresh_tokens (user_id, expires_at) WHERE revoked_at IS NULL;

INSERT INTO roles (code, label) VALUES ('admin','Administrateur'), ('agent','Agent'), ('client','Client') ON CONFLICT (code) DO NOTHING;
INSERT INTO permissions (code, description) VALUES
 ('users:read:any','Lire tous les utilisateurs'), ('users:update:any','Modifier tous les utilisateurs'), ('users:delete:any','Supprimer tous les utilisateurs'), ('profiles:read:own','Lire son profil'), ('profiles:update:own','Modifier son profil'), ('circuits:read','Lire les circuits'), ('circuits:manage','Gérer les circuits'), ('destinations:manage','Gérer les destinations'), ('reservations:read:own','Lire ses réservations'), ('reservations:create','Créer une réservation'), ('reservations:read:any','Lire toutes les réservations'), ('reservations:update:assigned','Modifier les réservations attribuées'), ('stats:read','Lire les statistiques'), ('settings:manage','Gérer la configuration') ON CONFLICT (code) DO NOTHING;
INSERT INTO role_permissions SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='admin' ON CONFLICT DO NOTHING;
INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('circuits:read','circuits:manage','destinations:manage','reservations:read:any','reservations:update:assigned') WHERE r.code='agent' ON CONFLICT DO NOTHING;
INSERT INTO role_permissions SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('profiles:read:own','profiles:update:own','circuits:read','reservations:read:own','reservations:create') WHERE r.code='client' ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id,role_id) SELECT u.id,r.id FROM users u JOIN roles r ON r.code='client' WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id=u.id) ON CONFLICT DO NOTHING;
