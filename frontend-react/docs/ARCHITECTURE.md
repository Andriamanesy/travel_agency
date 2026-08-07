# Architecture front-end React

`frontend-react` est une application React 19, Vite et TypeScript, livrée comme une SPA statique par Nginx. Le backend Node et l'API restent inchangés : Nginx proxyfie `/api` et `/uploads` vers eux afin de conserver une seule origine en production.

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

`ProtectedRoute` attend une session authentifiée. `RoleRoute` masque les écrans d'administration aux non-admins et le menu s'adapte aux rôles du JWT. Ces gardes sont une protection UX : le backend reste l'autorité de sécurité et vérifie systématiquement le JWT, les rôles et les permissions sur chaque endpoint.

## Inventaire legacy et plan de migration

| Domaine legacy | Route React | État de parité | Priorité suivante |
| --- | --- | --- | --- |
| Authentification : connexion, inscription, vérification, réinitialisation, changement | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/change-password` | migré ; session Zustand + refresh-cookie consolidés | P0 terminé |
| Destinations | `/destinations`, `/destinations/:destinationId` | lecture et réservation destination migrées | P1 : conserver les paramètres `id` des anciens liens |
| Catalogue | `/catalog/:entity`, `/catalog/:entity/:itemId` | liste et détail migrés | P1 : branche de réservation des circuits |
| Réservations client et administration | `/bookings`, `/bookings/new`, `/booking/:tourId`, `/admin/bookings` | destinations et circuits migrés ; contacts/options sauvegardés, total recalculé côté serveur | P1 terminé |
| Profil et tableau de bord | `/profile`, `/dashboard` | lecture disponible, dashboard simplifié | P2 : édition complète, avatar et préférences |
| Administration : utilisateurs, destinations, catalogue | `/admin/*` | CRUD et invitations présents, désormais réservé aux admins | P2 : découper les pages admin volumineuses et tester les permissions |
| Accueil et internationalisation | `/` | présentation React disponible | P3 : contenu API, recherche réelle et langues du legacy |

Le tunnel circuit réside dans `features/booking` (singulier) afin de séparer sa nouvelle expérience guidée du module historique `features/bookings`, conservé durant la transition pour les réservations destination et leur historique. Les anciens liens `booking.html?tour_id=…` et `booking.html?circuit_id=…` sont redirigés vers `/booking/:tourId` avec leurs paramètres conservés ; les détails catalogue et destination gardent aussi leurs identifiants.

Les options actuellement supportées sont la protection annulation (35 € par voyageur) et le transfert aéroport (50 € par dossier). `features/booking/utils/pricing.ts` ne sert qu'à l'estimation d'interface : `backend/src/catalog.js` recalcule prix, capacité, coordonnées et options dans une transaction. La migration `012_booking_contact_and_options.sql` doit donc être appliquée avec le reste des migrations avant d'exposer le tunnel.

L'ordre recommandé est donc : 1) migrer l'édition du profil puis enrichir le dashboard ; 2) achever i18n, recherche et pagination ; 3) retirer `features/bookings` après recette complète des réservations destination. Chaque étape doit inclure une recette avec les liens issus d'e-mails et un rollback Nginx vérifié.

## Migration incrémentale (Strangler Fig)

1. Stabiliser les contrats API existants et écrire les tests de non-régression les plus critiques côté backend.
2. Migrer un écran verticalement : type + schéma, service, hook Query, composants, page et test. Conserver l'ancienne page jusqu'à la recette de cet écran.
3. Exposer la route React derrière Nginx et ajouter une redirection depuis l'URL HTML historique, avec les paramètres de query conservés quand ils sont utiles.
4. Déployer les deux implémentations durant la recette, suivre les erreurs client/API, puis basculer la route. Supprimer le legacy seulement après un rollback vérifié.
5. Répéter par parcours métier : authentification, catalogue lecture, réservation, administration. Les migrations de base de données restent rétrocompatibles pendant toute la bascule.

Pièges à éviter : dupliquer l'état API dans un store, stocker un secret dans `VITE_*`, perdre les `token` des liens e-mail pendant les redirections, oublier le fallback SPA Nginx, casser les cookies `Secure`/`SameSite` selon l'environnement, et supprimer les pages legacy avant la validation d'un rollback.

## Déploiement

Le point d'entrée réel du dépôt est `devops/scripts/` (il n'existe pas de dossier `deploy/script/`). `docker-compose.yml` démarre dans l'ordre PostgreSQL, les migrations, le backend, puis `frontend-react`. Le build React est multi-stage : Node compile `dist`, Nginx ne reçoit que les fichiers statiques. Utiliser `./devops/scripts/start.sh` pour démarrer localement et `./devops/scripts/deploy.sh` pour une machine de déploiement sur la branche `main`.
