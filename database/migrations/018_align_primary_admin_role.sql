-- Réconcilie le rôle principal introduit par 016 avec les attributions
-- historiques : l'administration ne doit jamais être masquée par un rôle
-- client arbitrairement choisi dans user_roles.
UPDATE users u
SET role_id = (
  SELECT r.id
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = u.id
  ORDER BY CASE r.code WHEN 'super_admin' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, r.id
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = u.id AND r.code IN ('admin', 'super_admin')
);
