# Analyse du besoin : Gestion du patrimoine de l'État

## 1. Contexte
L'État possède de nombreux biens (bâtiments, terrains, véhicules, matériel informatique, mobilier). Leur suivi est souvent fait sur papier ou sur des tableurs dispersés : pertes d'information, doublons, absence de traçabilité, difficulté à connaître la valeur réelle du patrimoine.

## 2. Problématique
Comment centraliser, suivre et sécuriser la gestion des biens de l'État grâce à une solution numérique fiable et accessible ?

## 3. Objectifs
- Centraliser l'inventaire de tous les biens
- Suivre l'affectation des biens aux ministères et services
- Tracer l'historique de chaque bien (mouvements, maintenance, cession)
- Produire des rapports et statistiques pour la prise de décision

## 4. Acteurs
| Acteur | Rôle |
|---|---|
| Administrateur | Gère les utilisateurs, les rôles et les paramètres |
| Gestionnaire du patrimoine | Enregistre, modifie et suit les biens |
| Agent de service | Consulte les biens de son service, signale une panne |
| Auditeur / Contrôleur | Consulte l'ensemble et les rapports (lecture seule) |

## 5. Besoins fonctionnels
### Authentification et utilisateurs (auth-service)
- Se connecter / se déconnecter
- Gérer les comptes et les rôles (admin, gestionnaire, agent, auditeur)

### Gestion des biens (patrimoine-service)
- Ajouter, modifier, consulter, supprimer un bien
- Gérer les catégories (immobilier, véhicule, informatique, mobilier)
- Rechercher et filtrer les biens (catégorie, état, localisation)
- Changer l'état d'un bien (neuf, bon, usé, hors service, cédé)

### Affectations et mouvements (affectation-service)
- Affecter un bien à un service ou ministère
- Transférer un bien d'un service à un autre
- Consulter l'historique des mouvements d'un bien
- Déclarer la réforme ou la cession d'un bien

### Rapports
- Tableau de bord : nombre de biens, valeur totale, répartition par catégorie
- Export de l'inventaire (PDF ou CSV)

## 6. Besoins non fonctionnels
- Sécurité : authentification, droits selon le rôle
- Traçabilité : toute modification est historisée
- Disponibilité : application accessible en ligne
- Maintenabilité : architecture micro-services conteneurisée (Docker)
- Ergonomie : interface simple et responsive

## 7. Règles de gestion
- Un bien appartient à une seule catégorie
- Un bien est affecté à un seul service à la fois
- Un bien cédé ou réformé ne peut plus être affecté
- Chaque affectation conserve sa date et son auteur
- Seuls l'administrateur et le gestionnaire peuvent créer ou modifier un bien

## 8. Périmètre du projet
Inclus : tout ce qui est listé ci-dessus.
Exclus (évolutions futures) : comptabilité détaillée, amortissement, application mobile.
