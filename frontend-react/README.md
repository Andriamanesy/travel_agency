# TravelMS React

Frontend React 18+, Vite et TypeScript : client web final de TravelMS. Le frontend legacy est retiré de la production et reste archivé dans le tag Git `legacy-frontend-v1.0`.

## Démarrer

```bash
cp .env.example .env
npm install
npm run dev
```

Le serveur API est celui de `../backend` (port 3000 par défaut). En production, laissez `VITE_API_URL` vide lorsque le proxy expose l’API sous `/api` sur le même domaine.

## Déploiement Docker

`docker-compose.yml` construit directement ce dossier pour le service `frontend`. Le Dockerfile compile Vite puis sert uniquement `dist/` via Nginx. Les requêtes `/api` et `/uploads` sont proxyfiées vers le backend, et les routes React sont prises en charge lors d’un accès direct ou d’un rafraîchissement.

Depuis la racine du dépôt :

```bash
./devops/scripts/deploy.sh
```

Après déploiement, l’interface React est disponible à l’URL configurée (par défaut `http://localhost:8080`). Les anciennes URLs d’authentification utilisées dans les e-mails sont redirigées vers les routes React équivalentes.

## Organisation

- `src/app` : composition de l’application et routage.
- `src/features` : modules métier autonomes (API, hooks, composants, pages et types).
- `src/components` : éléments d’interface réutilisables et layouts.
- `src/lib` : client HTTP, configuration, session et TanStack Query.
- `src/routes` : gardes et pages transversales.

## Migration suivie

| Ancien écran HTML legacy | Route React | État |
| --- | --- | --- |
| `index.html` | `/` | déjà migré |
| `login.html` | `/login` | déjà migré |
| `register.html`, `verify-email.html` | `/register`, `/verify-email?token=` | déjà migré |
| `forgot-password.html`, `reset-password.html`, `change-password.html` | `/forgot-password`, `/reset-password?token=`, `/change-password` | déjà migré |
| `dashboard.html` | `/dashboard` | déjà migré |
| `profile.html` | `/profile` | déjà migré (lecture) |
| `destination*.html` | `/destinations`, `/destinations/:id` | déjà migré (lecture) |
| `booking.html` | `/bookings/new?destinationId=:id` | déjà migré |
| `my-bookings.html` | `/bookings` | déjà migré |
| `catalog.html`, `catalog-detail.html` | `/catalog/:entity`, `/catalog/:entity/:id` | déjà migré |
| `admin-bookings.html` | `/admin/bookings` | déjà migré |
| `admin-destinations.html` | `/admin/destinations` | déjà migré |
| `admin-catalog.html` | `/admin/catalog/:entity` | déjà migré |
| `admin.html` | `/admin` | déjà migré |

Toutes les routes métier sont désormais migrées. Les URL HTML historiques sont conservées par Nginx sous forme de redirections 301 ; ne les retirez qu’après la période de compatibilité convenue.
