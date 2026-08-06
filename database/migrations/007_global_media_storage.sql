-- Système global de médias : les fichiers restent dans le volume Docker,
-- PostgreSQL ne conserve que leurs chemins publics relatifs.
ALTER TABLE users
    ALTER COLUMN avatar_url TYPE VARCHAR(512);

COMMENT ON COLUMN users.avatar_url IS
    'Chemin relatif du média, ex. /uploads/users/user_<uuid>_<timestamp>_avatar.webp';
COMMENT ON COLUMN destinations.cover_image IS
    'Chemin relatif de couverture, ex. /uploads/destinations/dest_<uuid>_<timestamp>_cover.webp';
COMMENT ON COLUMN destination_images.image_url IS
    'Chemin relatif de galerie dans le volume public uploads';
