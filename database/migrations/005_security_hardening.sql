-- Phase 1/2 : compatibilité du modèle RBAC demandé et protections de données.
ALTER TABLE roles ADD COLUMN IF NOT EXISTS name VARCHAR(30);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS name VARCHAR(100);
UPDATE roles SET name = code WHERE name IS NULL;
UPDATE permissions SET name = code WHERE name IS NULL;
ALTER TABLE roles ALTER COLUMN name SET NOT NULL;
ALTER TABLE permissions ALTER COLUMN name SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_uidx ON roles(name);
CREATE UNIQUE INDEX IF NOT EXISTS permissions_name_uidx ON permissions(name);

-- Accélère les recherches d'identité et le nettoyage des jetons expirés.
CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));
CREATE INDEX IF NOT EXISTS password_reset_tokens_expiry_idx ON password_reset_tokens (expires_at) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS email_verification_tokens_expiry_idx ON email_verification_tokens (expires_at) WHERE used_at IS NULL;

-- Les nouveaux mots de passe utilisent bcrypt. `salt` reste non sensible et
-- permet d'exécuter une migration progressive des anciens comptes PBKDF2.
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash (cost 12)';
