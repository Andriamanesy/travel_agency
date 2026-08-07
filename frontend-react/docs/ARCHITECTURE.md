# Architecture front-end React

`frontend-react` est l'unique client web déployé : une application React 18+, Vite et TypeScript, livrée comme une SPA statique par Nginx. Le backend Node/Express et l'API restent inchangés : Nginx proxyfie `/api` et `/uploads` vers eux afin de conserver une seule origine en production.

## Structure cible

```text
frontend-react/
├── public/                         # favicon et assets copiés tels quels au build
├── src/
│   ├── app/                        # composition de l'application et routes
│   ├── features/                   # modules métier isolés
│   │   └── users/
│   │       ├── components/         # UI propre au domaine utilisateur
│   │       ├── hooks/              # queries et mutations React Query
│   │       ├── schemas/            # schémas Zod et types inférés
│   │       ├── services/           # contrats HTTP du domaine
│   │       ├── types.ts            # modèles métier du domaine
│   │       └── pages/              # écrans, si le domaine les possède
│   ├── components/                 # UI transverse (layout, boutons, feedback)
│   ├── hooks/                      # hooks transverses sans logique métier
│   ├── lib/                        # infrastructure : api-client, env, session, query-client
│   ├── routes/                     # gardes, 404 et utilitaires de navigation
│   ├── store/                      # état UI global Zustand, uniquement si nécessaire
│   ├── types/                      # types réellement transverses
│   └── utils/                      # fonctions pures sans React
├── Dockerfile
└── nginx.conf
```

`features` contient tout ce qui évolue ensemble pour un cas métier et ne doit pas importer les détails d'une autre feature. `components` ne contient que des composants réutilisables et sans dépendance métier. `hooks` regroupe les hooks transverses ; les hooks de domaine restent dans leur feature. `services` encapsule l'API, `store` se limite à l'état client global, `types` aux contrats transverses, `utils` aux fonctions pures, et `pages` assemble les composants pour une route.

## Choix de stack

| Besoin | Choix | Règle d'usage |
| --- | --- | --- |
| Routage | React Router 7 | routes déclaratives, garde `ProtectedRoute`, code splitting à introduire pour les grandes pages |
| État serveur | TanStack Query 5 | toute donnée API : query keys stables, invalidation après mutation, jamais dupliquée dans Zustand |
| État local/UI | `useState` / `useReducer`, puis Zustand 5 | uniquement préférences, panneau ouvert, brouillon partagé ; un formulaire reste local à React Hook Form |
| Formulaires | React Hook Form 7 + Zod 4 | le schéma est la source de vérité ; les types sont inférés avec `z.infer` |
| Styling | Tailwind CSS 4 + composants internes | tokens CSS et primitives accessibles avant d'ajouter une bibliothèque de design system |
| Tests | Vitest + Testing Library | tests des formulaires, services mockés et parcours critiques |

## Session et autorisations

Le JWT d'accès n'est jamais persisté dans `localStorage` : il reste en mémoire dans `lib/session.ts`. Au démarrage, `SessionBootstrap` appelle `/api/refresh` avec `credentials: 'include'`; le refresh token est un cookie `HttpOnly`, puis le profil est chargé via `/api/profile`. Zustand persiste uniquement le profil et les rôles utiles à l'interface sous la clé `travelms-session-ui`; l'application reste en état `restoring` jusqu'à la fin de cette vérification.

`ProtectedRoute` attend que la restauration soit terminée avant toute redirection et conserve le chemin complet demandé. `RoleRoute` masque les écrans d'administration aux non-admins et le menu s'adapte aux rôles du JWT. Ces gardes sont une protection UX : le backend reste l'autorité de sécurité et vérifie systématiquement le JWT, les rôles et les permissions sur chaque endpoint.

### Entrée SPA et fin de migration

Nginx sert explicitement `/` et `/index.html` comme le fichier SPA, sans règle de redirection. Cette distinction est importante : `try_files $uri $uri/ /index.html` reconnaissait `/` comme un répertoire, chargeait `index.html`, puis la redirection legacy de ce fichier renvoyait vers `/` — une boucle infinie. Le fallback des deep links est désormais `try_files $uri /index.html`; seules les anciennes URLs `.html` métier sont redirigées vers leurs routes React.

Le service Compose `frontend-react` construit uniquement `frontend-react/`. L'ancien dossier `frontend/` est supprimé ; son dernier état est conservé dans le tag Git `legacy-frontend-v1.0`. `devops/scripts/healthcheck.sh` vérifie aussi que la racine ne retourne pas d'en-tête `Location`.

## Livraison et compatibilité legacy

| Domaine legacy | Route React | État de livraison |
| --- | --- | --- | --- |
| Authentification | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/change-password` | livré : session Zustand, refresh-cookie, modal et toast de bienvenue |
| Catalogue et destinations | `/catalog/:entity`, `/catalog/:entity/:itemId`, `/destinations/*` | livré : consultation, filtres et compatibilité des liens |
| Réservations | `/bookings`, `/bookings/new`, `/booking/:tourId` | livré : tunnel guidé, contacts pré-remplis et suivi client |
| Espace client | `/dashboard`, `/profile` | livré : profil, voyages à venir, historique et annulation conditionnelle |
| Administration | `/admin`, `/admin/*` | livré : tableau de bord, alertes, CRUD catalogue/destinations, réservations et accès |
| Accueil | `/` | livré : contenu personnalisé Client et redirection directe Admin |

Le tunnel circuit réside dans `features/booking` (singulier) afin de séparer sa nouvelle expérience guidée du module historique `features/bookings`, conservé durant la transition pour les réservations destination et leur historique. Les anciens liens `booking.html?tour_id=…` et `booking.html?circuit_id=…` sont redirigés vers `/booking/:tourId` avec leurs paramètres conservés ; les détails catalogue et destination gardent aussi leurs identifiants.

Les options actuellement supportées sont la protection annulation (35 € par voyageur) et le transfert aéroport (50 € par dossier). `features/booking/utils/pricing.ts` ne sert qu'à l'estimation d'interface : `backend/src/catalog.js` recalcule prix, capacité, coordonnées et options dans une transaction. La migration `012_booking_contact_and_options.sql` doit donc être appliquée avec le reste des migrations avant d'exposer le tunnel.

`features/profile` synchronise toute mise à jour réussie avec le store de session et son cache TanStack Query. `features/dashboard` consomme les réservations utilisateur, distingue à venir et historique, et expose l'annulation uniquement pour une demande `pending` dont le départ est futur. Le backend applique la même règle ; les justificatifs restent volontairement indisponibles tant qu'aucun service de facturation n'est implémenté.

Les URL legacy sont redirigées par Nginx vers la SPA ; le tag Git `legacy-frontend-v1.0` est le point de sauvegarde du client historique. Les redirections ne doivent être supprimées qu’après la période de compatibilité définie par l’équipe.

## Déploiement

Le point d'entrée réel du dépôt est `devops/scripts/`. `docker-compose.yml` démarre dans l'ordre PostgreSQL, backend (migrations puis seed de démonstration), puis `frontend-react`. Le build React est multi-stage : Node compile `dist`, Nginx ne reçoit que les fichiers statiques. Le frontend Docker est publié uniquement sur `127.0.0.1:8080` par défaut (`FRONTEND_PORT` permet une surcharge) afin de laisser le port 80 au Nginx hôte. Installez `devops/nginx/travel-agency.conf` sur l'hôte : il proxyfie toute l'origine publique vers ce bundle React. Utiliser `./devops/scripts/start.sh` pour démarrer la pile locale et `./devops/scripts/deploy.sh` pour déployer la branche `main`.

En production, la séquence vérifiable est : Nginx hôte (`:80`) → `127.0.0.1:8080` (Nginx du conteneur React) → `/api` et `/uploads` vers le backend Docker. `devops/scripts/production-verify.sh` couvre les réponses publiques de cette chaîne ; la recette authentifiée reste un contrôle fonctionnel manuel, car elle exige des utilisateurs de test et ne doit jamais embarquer d'identifiants dans les scripts.
