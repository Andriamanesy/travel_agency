# 🌍 TravelMS — Livraison finale

TravelMS est une plateforme de gestion de voyages désormais livrée avec un frontend React moderne, typé et déployable en conteneur. La refonte remplace le client legacy par l'application unique située dans `frontend-react/`.

## Bilan d’architecture

### Stack finale

- **Frontend :** React 18+, Vite, TypeScript, Tailwind CSS, React Router.
- **Données et état :** TanStack Query, Zustand, React Hook Form et Zod.
- **Backend :** Node.js / Express, API sécurisée JWT avec refresh cookie `HttpOnly`.
- **Infrastructure :** Docker Compose, Nginx et PostgreSQL.

### Architecture applicative

Le frontend adopte une organisation **Feature-Driven** sous [`frontend-react/`](frontend-react/) : chaque domaine réunit ses pages, composants, hooks, services HTTP, schémas Zod et types. Les composants de layout et feedback restent transverses ; TanStack Query est l’unique source de vérité pour les données API et Zustand ne conserve que l’état de session et d’interface.

### Réseau et déploiement

```text
Internet → Nginx hôte :80 → React Docker / Nginx :127.0.0.1:8080
                              └→ /api → Node.js / Express → PostgreSQL
```

Nginx hôte proxyfie l’origine publique vers le conteneur React ; celui-ci sert la SPA et route `/api` et `/uploads` vers le backend. Les URL legacy `.html` restent disponibles via des redirections de compatibilité 301.

## Fonctionnalités livrées

- Authentification JWT / cookie `HttpOnly`, restauration de session, modal et toasts de bienvenue premium.
- Catalogue, filtres, détails d’offres et redirections des parcours historiques.
- Tunnel de réservation avec coordonnées client pré-remplies depuis la session.
- Espace client : profil, réservations à venir, historique et annulation selon les règles métier.
- Back-office Admin : indicateurs, alertes, réservations, catalogue, destinations et accès utilisateurs.
- Navigation et accueil adaptés en temps réel au rôle Client ou Administrateur.

## Exploitation

### Développement local

```bash
cd frontend-react
npm install
npm run dev
```

Pour démarrer la pile conteneurisée complète depuis la racine du dépôt :

```bash
./devops/scripts/start.sh
```

### Production

```bash
./devops/scripts/deploy.sh
```

Le dernier état du frontend historique est conservé par le tag Git **`legacy-frontend-v1.0`**, pour consultation ou rollback ciblé. La documentation technique détaillée est disponible dans [`frontend-react/docs/ARCHITECTURE.md`](frontend-react/docs/ARCHITECTURE.md).
