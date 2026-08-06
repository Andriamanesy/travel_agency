-- ==========================================
-- 1. EXTENSIONS ET TABLES PRINCIPALES
-- ==========================================

-- Extension pour la génération des identifiants UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (Doit être créée en premier)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    
    -- Nouveaux champs du profil
    phone VARCHAR(50),
    birth_date DATE,
    gender VARCHAR(50),
    nationality VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    address TEXT,
    preferred_lang VARCHAR(10) DEFAULT 'fr',
    avatar_url TEXT,
    
    -- Sécurité & État
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TIMESTAMP,
    session_token TEXT,
    
    -- Horodatages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- S'assure que toutes les colonnes optionnelles existent (migration idempotente)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS preferred_lang VARCHAR(10) DEFAULT 'fr',
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS authz_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;


-- ==========================================
-- 2. TABLES RBAC ET TOKENS
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
    id SMALLSERIAL PRIMARY KEY, 
    code VARCHAR(30) UNIQUE NOT NULL, 
    label VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id SMALLSERIAL PRIMARY KEY, 
    code VARCHAR(100) UNIQUE NOT NULL, 
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id SMALLINT REFERENCES roles(id) ON DELETE CASCADE, 
    permission_id SMALLINT REFERENCES permissions(id) ON DELETE CASCADE, 
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
    role_id SMALLINT REFERENCES roles(id) ON DELETE RESTRICT, 
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    token_hash CHAR(64) UNIQUE NOT NULL, 
    expires_at TIMESTAMPTZ NOT NULL, 
    revoked_at TIMESTAMPTZ, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS refresh_tokens_active_idx ON refresh_tokens (user_id, expires_at) WHERE revoked_at IS NULL;


-- ==========================================
-- 3. DONNÉES INITIALES (SEEDING)
-- ==========================================

INSERT INTO roles (code, label) VALUES 
    ('admin','Administrateur'), 
    ('agent','Agent'), 
    ('client','Client') 
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
    ('users:read:any','Lire tous les utilisateurs'), 
    ('users:update:any','Modifier tous les utilisateurs'), 
    ('users:delete:any','Supprimer tous les utilisateurs'), 
    ('profiles:read:own','Lire son profil'), 
    ('profiles:update:own','Modifier son profil'), 
    ('circuits:read','Lire les circuits'), 
    ('circuits:manage','Gérer les circuits'), 
    ('destinations:manage','Gérer les destinations'), 
    ('reservations:read:own','Lire ses réservations'), 
    ('reservations:create','Créer une réservation'), 
    ('reservations:read:any','Lire toutes les réservations'), 
    ('reservations:update:assigned','Modifier les réservations attribuées'), 
    ('stats:read','Lire les statistiques'), 
    ('settings:manage','Gérer la configuration') 
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions 
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code='admin' 
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions 
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('circuits:read','circuits:manage','destinations:manage','reservations:read:any','reservations:update:assigned') WHERE r.code='agent' 
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions 
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('profiles:read:own','profiles:update:own','circuits:read','reservations:read:own','reservations:create') WHERE r.code='client' 
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u JOIN roles r ON r.code='client' 
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id=u.id) 
ON CONFLICT DO NOTHING;