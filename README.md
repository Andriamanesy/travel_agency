Exactement, vous avez tout à fait raison ! Si on reste strictement sur la règle du "sans framework", Express n'a pas sa place dans la stack. Le backend doit reposer uniquement sur le module natif `http` de Node.js.

Voici le `README.md` corrigé et mis à jour :

```markdown
# 🌍 TravelMS (Travel Management System)

Plateforme professionnelle de gestion de voyages conçue de manière incrémentale, sans l'utilisation de frameworks, pour maîtriser l'ensemble de la chaîne technique (de l'infrastructure système au code applicatif).

---

## 🏗️ Architecture Technique

L'infrastructure repose sur un environnement virtualisé et conteneurisé de bout en bout :

```text
Windows
└── VMware (Ubuntu Server)
      └── Docker Compose
            ├── Nginx (Reverse Proxy & Static Server)
            ├── Frontend React (Vite, TypeScript, Nginx)
            ├── Backend (Node.js natif)
            └── PostgreSQL (Base de données relationnelle)

```

### Stack Technologique

* **Infrastructure :** VMware, Ubuntu Server, Docker, Docker Compose
* **Web Server & Reverse Proxy :** Nginx
* **Frontend :** React, Vite, TypeScript, TanStack Query, React Hook Form, Zod et Tailwind CSS
* **Backend :** Node.js (Modules natifs, ex: `http`)
* **Base de données :** PostgreSQL

---

## 🗺️ Feuille de Route (Roadmap & Versions)

Le projet évolue à travers des versions progressives, simulant le cycle de vie d'un produit logiciel en entreprise.

### Phase 1 : Gestion des Utilisateurs & Sécurité

* **Version 1.0 — Authentification** : Modules d'inscription, connexion et déconnexion.
* **Version 1.1 — Profil** : Affichage des informations utilisateur.
* **Version 1.2 — Modification du profil** : Mise à jour des données personnelles.
* **Version 1.3 — Mot de passe** : Fonctionnalité de changement de mot de passe.
* **Version 1.4 — Récupération** : Gestion du mot de passe oublié (simulation d'e-mail).
* **Version 1.5 — Vérification** : Processus de validation par e-mail.

### Phase 2 : Contrôle d'Accès & Rôles

* **Version 2.0 — RBAC (Role-Based Access Control)** : Gestion des rôles distincts (**Admin**, **Agent**, **Client**) avec des permissions granulaires.

### Phase 3 : Catalogue Métier & CRUD

* **Version 3.0 — Destinations** : CRUD complet (Créer, Lire, Mettre à jour, Supprimer, Lister).
* **Version 3.1 — Catégories** : Gestion des catégories de voyage.
* **Version 3.2 — Circuits touristiques** : Gestion des circuits.
* **Version 3.3 — Hôtels** : Gestion du parc hôtelier.
* **Version 3.4 — Guides** : Gestion des accompagnateurs.
* **Version 3.5 — Réservations** : Implémentation du tunnel de réservation.

### Phase 4 : Recherche, Filtres & Performance

* **Version 4.0 — Moteur de recherche** : Recherche globale sur les destinations, circuits et hôtels.
* **Version 4.1 — Filtres avancés** : Filtrage par prix, pays, durée et type.
* **Version 4.2 — Pagination** : Optimisation de l'affichage des grands volumes de données.

### Phase 5 : Fonctionnalités Avancées & Exploitation

* **Version 5.0 — Upload de fichiers** : Gestion des images pour les destinations, hôtels et profils.
* **Version 6.0 — Dashboard** : Statistiques et indicateurs clés de performance (KPIs) pour les réservations et utilisateurs.
* **Version 7.0 — Journal d'audit (Logs)** : Traçabilité complète des actions critiques (connexions, modifications, suppressions).
* **Version 8.0 — Paramétrage global** : Gestion multilingue, devises, fuseaux horaires et personnalisation.
* **Version 9.0 — Documentation API** : Documentation technique de chaque endpoint (`GET`, `POST`, `PUT`, `DELETE`).
* **Version 10.0 — Production & DevOps** : Conteneurisation finale, automatisation par scripts shell et stratégies de sauvegarde.

---

## 📋 Backlog Produit (Epics)

Le projet est structuré selon les epics métiers suivants :

* **Epic 1 — Authentification :** Inscription, Connexion, Profil, Récupération de mot de passe, Vérification e-mail.
* **Epic 2 — Administration :** Gestion des utilisateurs, Rôles, Permissions, Journal d'activité (Logs).
* **Epic 3 — Catalogue :** Destinations, Circuits, Hôtels, Guides, Médias/Images, Catégories.
* **Epic 4 — Réservations :** Tunnel de commande, Modification, Annulation, Historique client.
* **Epic 5 — Recherche & Ergonomie :** Moteur de recherche, Filtres multicritères, Tris, Pagination.
* **Epic 6 — Infrastructure & DevOps :** Docker, Nginx, Stratégie de backup/restore, Monitoring.

---

## 🚀 Guide de Démarrage Rapide

### Prérequis

* Ubuntu Server (via VMware)
* Docker & Docker Compose installés

### Déploiement et Gestion

Le projet intègre une boîte à outils DevOps dans le dossier `devops/scripts/` :

Le frontend déployé est exclusivement `frontend-react/` : le service Docker `frontend` compile ce dossier puis sert son bundle via Nginx. La racine `/` est servie directement comme entrée SPA (sans redirection) ; les anciennes URL en `.html` sont uniquement conservées comme redirections de compatibilité. En production, Docker publie le frontend sur `127.0.0.1:8080` par défaut pour ne pas concurrencer le port 80 ; le Nginx hôte doit utiliser [`devops/nginx/travel-agency.conf`](devops/nginx/travel-agency.conf) pour proxyfier toute l'origine publique. Définissez `PUBLIC_APP_URL` avec cette origine (par exemple `http://192.168.88.226`) avant un déploiement afin que les liens e-mail restent sur cette même origine.

Le déploiement attend désormais la sonde Docker du frontend pendant 60 secondes au maximum. Cela évite un faux échec juste après `compose up`, lorsque l'HTTP répond déjà mais que Docker affiche encore l'état transitoire `starting`.

### Validation de production

Sur le serveur, vérifiez que `.env` contient `PUBLIC_APP_URL=http://192.168.88.226` et `FRONTEND_PORT=8080`, puis installez le reverse proxy `devops/nginx/travel-agency.conf` dans Nginx hôte avant de lancer le déploiement. Après `./devops/scripts/deploy.sh`, exécutez `bash ./devops/scripts/production-verify.sh`. Ce contrôle non destructif vérifie le chemin complet Nginx hôte → React Docker → API, l'absence de redirection à la racine et une redirection legacy. Les scénarios avec authentification doivent ensuite être joués avec des comptes de recette.

L'ancien client statique `frontend/` est décommissionné : il n'est plus référencé par Docker Compose ni par les scripts de déploiement. Il peut être retiré du dépôt dans une suppression dédiée une fois l'archive de rollback validée.

### Back-office

Les pages `/admin/catalog/circuits` et `/admin/bookings` sont réservées au rôle `admin`, côté interface et API. Elles permettent respectivement de créer, modifier ou archiver des circuits (période, prix, capacité et images) et de filtrer l'ensemble des réservations avant de modifier leur statut.

* **Démarrer l'application :**
```bash
./devops/scripts/start.sh

```


* **Déployer les mises à jour (Git pull + Build) :**
```bash
./devops/scripts/deploy.sh

```


* **Vérifier l'état de santé des services :**
```bash
./devops/scripts/healthcheck.sh

```


* **Sauvegarder la base de données :**
```bash
./devops/scripts/backup.sh

```
