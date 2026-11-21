# Patrimoine Togo - Gestion du patrimoine de l'État

Plateforme web de gestion des biens de l'État togolais : inventaire, affectations aux ministères, suivi de la maintenance et validation des biens proposés par les agents.

> Projet pédagogique réalisé dans le cadre de la formation en développement informatique. Les données sont des **données de démonstration** et le site est **non officiel**.

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture](#3-architecture)
4. [Technologies](#4-technologies)
5. [Structure du projet](#5-structure-du-projet)
6. [Installation et lancement](#6-installation-et-lancement)
7. [Variables d'environnement](#7-variables-denvironnement)
8. [Rôles et comptes de démonstration](#8-rôles-et-comptes-de-démonstration)
9. [Documentation de l'API](#9-documentation-de-lapi)
10. [Conception](#10-conception)
11. [Tests manuels](#11-tests-manuels)
12. [Conventions et normalisation](#12-conventions-et-normalisation)
13. [Déploiement](#13-déploiement)
14. [Auteure](#14-auteure)

## 1. Contexte et objectifs

Le suivi des biens de l'État (bâtiments, véhicules, matériel informatique, mobilier, équipements) est souvent dispersé : pertes d'information, doublons, absence de traçabilité.

**Objectifs :**
- centraliser l'inventaire de tous les biens ;
- suivre l'affectation des biens aux ministères et services ;
- tracer l'historique de chaque bien (mouvements, pannes, réforme, cession) ;
- fournir des statistiques pour la prise de décision ;
- contrôler l'enregistrement des biens par un circuit de validation.

L'analyse détaillée du besoin se trouve dans [`docs/01-analyse-du-besoin.md`](docs/01-analyse-du-besoin.md).

## 2. Fonctionnalités

| Domaine | Fonctionnalités |
|---|---|
| Authentification | connexion, création de compte (rôle agent), déconnexion, deux espaces de connexion séparés (utilisateur et administrateur) |
| Inventaire | liste paginée, recherche, filtres (catégorie, état, statut), ajout, modification, suppression |
| Validation | un agent propose un bien, l'administrateur l'approuve (le bien entre dans l'inventaire) ou le rejette avec un motif |
| Affectations | affecter un bien à un ministère, le transférer, consulter son historique |
| Sorties | réforme ou cession d'un bien (il ne peut plus être affecté) |
| Maintenance | signalement des pannes et suivi de leur traitement |
| Tableau de bord | nombre de biens, valeur totale, répartition par catégorie, pannes par mois, derniers mouvements |
| Sécurité | droits par rôle contrôlés par le site **et** par le serveur |

**Règles de gestion principales :**
- un bien appartient à une seule catégorie ;
- un bien est affecté à un seul service à la fois (l'ancienne affectation est clôturée lors d'un transfert) ;
- un bien réformé ou cédé ne peut plus être affecté ;
- un bien proposé par un agent n'est enregistré qu'après approbation de l'administrateur ;
- le code d'inventaire est unique.

## 3. Architecture

L'application suit une **architecture micro-services** conteneurisée avec Docker. Le navigateur ne parle qu'à un point d'entrée unique (le gateway nginx).


## 6. Installation et lancement

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (moteur démarré)
- [Git](https://git-scm.com/)
- Pour le développement du frontend seulement : [Node.js](https://nodejs.org/) 22 ou plus

### Lancement complet avec Docker

```bash
git clone https://github.com/Francoise97/gestion-patrimoine-etat.git
cd gestion-patrimoine-etat
docker compose up --build -d
```

La première construction prend plusieurs minutes. Au démarrage, chaque service Laravel crée ses tables (migrations) et ses données de départ (seeders) automatiquement.

| Accès | Adresse |
|---|---|
| Site | http://localhost:5173 |
| API (via le gateway) | http://localhost:8080/api |

> Si un service a été recréé, redémarrer le gateway pour qu'il retrouve les nouvelles adresses : `docker compose restart gateway`.

Arrêt : `docker compose down` (les données sont conservées dans le volume `pgdata`).

### Développement du frontend

```bash
docker compose up -d postgres auth-service patrimoine-service affectation-service gateway
docker compose stop frontend
cd frontend
npm install
npm run dev
```

Le serveur Vite redirige `/api` vers le gateway (`http://127.0.0.1:8080`).

### Vérification du code

```bash
cd frontend
npm run lint
```

## 7. Variables d'environnement

Définies dans `docker-compose.yml` :

| Variable | Service | Rôle |
|---|---|---|
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT` | services Laravel | connexion à PostgreSQL |
| `DB_DATABASE` | services Laravel | `auth_db`, `patrimoine_db` ou `affectation_db` |
| `DB_USERNAME`, `DB_PASSWORD` | services Laravel | identifiants PostgreSQL |
| `AUTH_SERVICE_URL` | patrimoine, affectation | adresse d'auth-service (validation du jeton) |
| `PATRIMOINE_SERVICE_URL` | affectation | adresse de patrimoine-service |
| `API_URL` | frontend | adresse du gateway pour le proxy de Vite |

> Les mots de passe du `docker-compose.yml` sont des valeurs de démonstration : en production, ils doivent être remplacés et stockés dans des variables secrètes.

## 8. Rôles et comptes de démonstration

| Rôle | Droits |
|---|---|
| `admin` | tout gérer, valider ou rejeter les demandes, créer des utilisateurs |
| `gestionnaire` | gérer les biens, les affectations et la maintenance |
| `agent` | consulter l'inventaire, proposer un bien, signaler une panne |
| `auditeur` | consulter en lecture seule |

| Compte | Identifiant | Mot de passe | Espace de connexion |
|---|---|---|---|
| Administrateur | `admin@patrimoine.gov` | `Admin@1234` | `/admin/login` |
| Agent | créer un compte | au choix (8 caractères minimum) | `/login` |

> Compte de démonstration : à changer avant toute mise en production.

## 9. Documentation de l'API

Toutes les routes passent par le gateway (`http://localhost:8080`) et, sauf l'inscription et la connexion, exigent l'en-tête `Authorization: Bearer <jeton>`.

### Authentification (`/api/auth`)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | crée un compte (rôle agent) |
| POST | `/api/auth/login` | public | retourne l'utilisateur et le jeton |
| POST | `/api/auth/logout` | connecté | annule le jeton |
| GET | `/api/auth/me` | connecté | profil de l'utilisateur |
| GET / POST | `/api/auth/users` | admin | liste et création d'utilisateurs |

### Patrimoine

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/categories` | connecté | liste des catégories |
| POST / PUT / DELETE | `/api/categories` | admin, gestionnaire | gestion des catégories |
| GET | `/api/biens` | connecté | liste paginée (`search`, `categorie_id`, `etat`, `statut`, `page`) |
| GET | `/api/biens/{id}` | connecté | détail d'un bien |
| GET | `/api/biens/stats` | connecté | statistiques du tableau de bord |
| POST / PUT / DELETE | `/api/biens` | admin, gestionnaire | gestion des biens |
| GET | `/api/demandes` | connecté | demandes (toutes pour l'admin, les siennes sinon) |
| POST | `/api/demandes` | agent, gestionnaire | propose un bien |
| GET | `/api/demandes/compte` | admin | nombre de demandes en attente |
| POST | `/api/demandes/{id}/approuver` | admin | approuve et crée le bien |
| POST | `/api/demandes/{id}/rejeter` | admin | rejette (motif facultatif) |

### Affectations

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| GET | `/api/affectations` | connecté | liste (`bien_id`, `service_id`, `en_cours`) |
| POST | `/api/affectations` | admin, gestionnaire | affecte ou transfère un bien |
| GET | `/api/affectations/courantes` | connecté | affectations en cours |
| GET | `/api/affectations/stats` | connecté | pannes par mois, derniers mouvements |
| GET / POST | `/api/affectations/services` | connecté / admin, gestionnaire | ministères et services |
| GET | `/api/affectations/bien/{id}/historique` | connecté | historique d'un bien |
| POST | `/api/affectations/bien/{id}/sortie` | admin, gestionnaire | réforme ou cession (`statut` : `reforme` ou `cede`) |
| GET / POST | `/api/affectations/maintenances` | connecté | pannes (tout utilisateur peut en signaler) |
| PUT | `/api/affectations/maintenances/{id}` | admin, gestionnaire | change le statut d'une panne |

**Codes de réponse :** `200` succès, `201` créé, `401` non authentifié, `403` rôle insuffisant, `404` introuvable, `422` données invalides ou règle de gestion non respectée.

## 10. Conception

Les documents de conception sont dans [`docs/`](docs/) :

- [Analyse du besoin](docs/01-analyse-du-besoin.md)
- Diagramme de cas d'utilisation : `docs/uml/01-cas-utilisation`
- Diagramme de classes : `docs/uml/02-diagramme-classes`
- Diagramme de séquence (affectation d'un bien) : `docs/uml/03-sequence-affectation`
- Diagramme de déploiement : `docs/uml/04-deploiement`

Chaque diagramme existe en source PlantUML (`.puml`) et en image (`.png`).

## 11. Tests manuels

1. Se connecter sur `/admin/login` avec le compte administrateur : le tableau de bord s'affiche.
2. Créer un compte sur `/login`, puis proposer un bien dans **Proposer un bien** : la demande est « En attente ».
3. Sur `/validation` (administrateur), approuver la demande : le bien apparaît dans l'**Inventaire**.
4. Affecter le bien à un ministère, puis le transférer : l'historique montre deux lignes, dont une clôturée.
5. Réformer le bien, puis tenter de l'affecter : le serveur refuse (`422`).
6. Avec un compte agent, ouvrir `/validation` : redirection vers le tableau de bord, et l'API répond `403`.

## 12. Conventions et normalisation

**Git**
- branche principale : `main` ;
- messages de commit au format [Conventional Commits](https://www.conventionalcommits.org/fr/) : `feat:`, `fix:`, `docs:`, `refactor:` ;
- un commit par étape terminée.

**Code**
- PHP : PSR-12, modèles au singulier (`Bien`), contrôleurs suffixés `Controller` ;
- JavaScript : composants React en `PascalCase`, fonctions et variables en `camelCase`, contrôle par `oxlint` ;
- API REST : ressources au pluriel, réponses en JSON, codes HTTP normalisés ;
- base de données : tables au pluriel en minuscules, clés étrangères suffixées `_id`.

**Documentation** : README normalisé (ce document), conception en UML, commentaires en français pour les règles de gestion.

## 13. Déploiement

Lien de la plateforme hébergée : **à compléter**.

## 14. Auteure

**Françoise FOLLY-ADJON** - [@Francoise97](https://github.com/Francoise97)