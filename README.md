# REST API Annuaire d'Étudiants - EdTech

[![CI](https://github.com/RobinSartini/student-api/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/RobinSartini/student-api/actions/workflows/ci.yml)

Une API REST robuste pour la gestion d'un annuaire d'étudiants, développée avec **Hono**, **TypeScript**, et testée avec **Vitest**.

## Fonctionnalités et Bonus Implémentés
- Opérations CRUD complètes en mémoire
- **Bonus :** Pagination (`?page=2&limit=5`)
- **Bonus :** Tri dynamique (`?sort=grade&order=desc`)
- Validation stricte des données et gestion d'erreurs
- **Bonus :** 23 Tests automatisés (minimum requis : 15)
- **Bonus :** Couverture de code activée via Vitest (C8)
- Code linté et formaté par ESLint (Flat Config pour TypeScript)
- Pipeline d'intégration continue via GitHub Actions
- **Bonus :** Badge de statut de build (ci-dessus)

## Installation et Démarrage

### Pré-requis
- Node.js version 18.x ou 20.x

### Script recommandés
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (port 3000)
npm start

# Lancer les tests
npm test

# Lancer les tests avec couverture de code
npm run test:coverage

# Lancer le linter
npm run lint
```

## Documentation de l'API

L'API est accessible localement à l'adresse `http://localhost:3000`

### Réponses globales
Toutes les réponses renvoient du JSON. En cas d'erreur métier ou de validation, l'API renvoie le statut HTTP approprié (400, 404, 409) et un objet structuré contenant le message :
```json
{
  "error": "Message d'erreur descriptif"
}
```

---

### `GET /students`
Récupère la liste des étudiants avec support pour la **pagination** et le **tri**.
- **Paramètres Optionnels :**
  - `page` (number, défaut `1`) : Page désirée
  - `limit` (number, défaut `10`) : Nombre d'étudiants par page
  - `sort` (string) : Champ sur lequel trier (`id`, `firstName`, `lastName`, `grade`)
  - `order` (string, `asc` ou `desc`) : Ordre de tri.

**Exemple de Requête :**  
`curl "http://localhost:3000/students?page=1&limit=2&sort=grade&order=desc"`

**Réponse (200 OK) :**
```json
{
  "data": [
    { "id": 3, "firstName": "Clara", "lastName": "Leroy", "email": "clara.leroy@edu.fr", "grade": 18, "field": "physique" },
    { "id": 1, "firstName": "Alice", "lastName": "Martin", "email": "alice.martin@edu.fr", "grade": 16.5, "field": "informatique" }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 2,
    "totalPages": 3
  }
}
```

---

### `GET /students/stats`
Récupère des statistiques globales sur l'académie.

**Réponse (200 OK) :**
```json
{
  "totalStudents": 5,
  "averageGrade": 14,
  "studentsByField": {
    "informatique": 2,
    "mathématiques": 1,
    "physique": 1,
    "chimie": 1
  },
  "bestStudent": {
    "id": 3,
    "firstName": "Clara",
    ...
  }
}
```

---

### `GET /students/search`
Recherche d'étudiants via un terme correspondant soit au prénom, soit au nom (insensible à la casse).
- **Paramètres :**
  - `q` (string, requis) : terme recherché. Exemple : `?q=martin`

**Réponse (200 OK) :**
```json
[
  { "id": 1, "firstName": "Alice", "lastName": "Martin", "email": "alice.martin@edu.fr", "grade": 16.5, "field": "informatique" }
]
```

---

### `GET /students/:id`
Récupère un étudiant spécifique par son ID (auto-incrémenté en back-end).

**Réponse (200 OK) :** Objet étudiant standard.
**Réponse (404 Not Found) :** Si l'étudiant avec cet ID n'existe pas.

---

### `POST /students`
Crée un nouvel étudiant.

**Règles de validation :**
- `firstName`, `lastName` : Inclus et de 2 caractères minimum
- `email` : Format e-mail valide et unique (409 Conflict s'il existe déjà)
- `grade` : Nombre entre 0 et 20
- `field` : Uniquement `informatique`, `mathématiques`, `physique`, ou `chimie`

**Corps de la Requête :**
```json
{
  "firstName": "Jean",
  "lastName": "Reno",
  "email": "jean.reno@edu.fr",
  "grade": 14.5,
  "field": "informatique"
}
```

**Réponse (201 Created) :** Objet de l'étudiant créé avec son `id` assigné.

---

### `PUT /students/:id`
Met à jour entièrement l'étudiant spécifié. Les règles de validation sont identiques à celles de `POST /students`.

**Réponse (200 OK) :** L'objet étudiant modifié.

---

### `DELETE /students/:id`
Supprime définitivement un étudiant du registre en mémoire.

**Réponse (200 OK) :**
```json
{ "message": "Étudiant avec l'ID 1 supprimé avec succès" }
```
