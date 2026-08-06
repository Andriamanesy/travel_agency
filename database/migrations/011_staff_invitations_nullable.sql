-- Migration 011 : rendre la colonne user_id nullable pour les invitations en attente.
ALTER TABLE staff_invitations
    ALTER COLUMN user_id DROP NOT NULL;
