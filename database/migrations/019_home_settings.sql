CREATE TABLE IF NOT EXISTS home_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO home_settings(key, value) VALUES
  ('hero', '{"title":"Explorez le Monde avec Nous","subtitle":"Des circuits sur-mesure d''exception","ctaText":"Découvrir nos circuits","ctaLink":"/circuits","bgImageUrl":null}'::jsonb),
  ('features', '[{"icon":"Compass","title":"Circuits sur-mesure","description":"Des itinéraires pensés autour de vos envies."},{"icon":"ShieldCheck","title":"Voyagez sereinement","description":"Une équipe locale attentive à chaque détail."},{"icon":"HeartHandshake","title":"Expériences authentiques","description":"Des rencontres et des adresses qui ont du sens."},{"icon":"Sparkles","title":"Service premium","description":"Un accompagnement personnalisé avant, pendant et après votre voyage."}]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Les agents peuvent gérer la landing, tout en restant limités aux permissions
-- marketing/contenu contrôlées par RBAC.
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code = 'content:manage'
WHERE r.code = 'agent'
ON CONFLICT DO NOTHING;
