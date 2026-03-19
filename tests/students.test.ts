import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStudents } from '../src/data/students.js'

beforeEach(() => {
  resetStudents()
})

// ─── GET /students ───────────────────────────────────────────────────────────

describe('GET /students', () => {
  it('doit renvoyer 200 et la structure paginée', async () => {
    const res = await app.request('/students')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta).toBeDefined()
  })

  it('doit renvoyer les 5 étudiants initiaux par défaut', async () => {
    const res = await app.request('/students')
    const body = await res.json()
    expect(body.data).toHaveLength(5)
    expect(body.meta.total).toBe(5)
  })

  it('doit gérer la pagination (limit=2)', async () => {
    const res = await app.request('/students?limit=2')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(2)
    expect(body.meta.page).toBe(1)
    expect(body.meta.totalPages).toBe(3)
  })

  it('doit gérer la pagination (page=3)', async () => {
    const res = await app.request('/students?page=3&limit=2')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.meta.page).toBe(3)
  })

  it('doit renvoyer 400 pour des paramètres de pagination invalides', async () => {
    const res = await app.request('/students?page=-1')
    expect(res.status).toBe(400)
  })

  it('doit trier les étudiants par note (desc)', async () => {
    const res = await app.request('/students?sort=grade&order=desc')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data[0].firstName).toBe('Clara') // Grade 18
    expect(body.data[1].firstName).toBe('Alice') // Grade 16.5
  })

  it('doit trier les étudiants par prénom (asc)', async () => {
    const res = await app.request('/students?sort=firstName&order=asc')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data[0].firstName).toBe('Alice')
    expect(body.data[1].firstName).toBe('Bob')
  })

  it('doit renvoyer 400 pour un paramètre de tri non autorisé', async () => {
    const res = await app.request('/students?sort=unknownData')
    expect(res.status).toBe(400)
  })
})

// ─── GET /students/:id ───────────────────────────────────────────────────────

describe('GET /students/:id', () => {
  it('doit renvoyer 200 et l\'étudiant correspondant pour un ID valide', async () => {
    const res = await app.request('/students/1')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(1)
    expect(body.firstName).toBe('Alice')
  })

  it('doit renvoyer 404 pour un ID inexistant', async () => {
    const res = await app.request('/students/999')
    expect(res.status).toBe(404)
  })

  it('doit renvoyer 400 pour un ID invalide (non numérique)', async () => {
    const res = await app.request('/students/abc')
    expect(res.status).toBe(400)
  })
})

// ─── POST /students ──────────────────────────────────────────────────────────

describe('POST /students', () => {
  const validStudent = {
    firstName: 'Lena',
    lastName: 'Petit',
    email: 'lena.petit@edu.fr',
    grade: 15,
    field: 'physique',
  }

  it('doit renvoyer 201 et l\'étudiant créé avec un ID pour des données valides', async () => {
    const res = await app.request('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validStudent),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBeDefined()
    expect(body.email).toBe(validStudent.email)
  })

  it('doit renvoyer 400 si un champ obligatoire est manquant', async () => {
    const res = await app.request('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Lena', lastName: 'Petit', email: 'lena.petit@edu.fr' }),
    })
    expect(res.status).toBe(400)
  })

  it('doit renvoyer 400 si la note est invalide (> 20)', async () => {
    const res = await app.request('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validStudent, grade: 25 }),
    })
    expect(res.status).toBe(400)
  })

  it('doit renvoyer 409 si l\'email est déjà utilisé', async () => {
    const res = await app.request('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validStudent, email: 'alice.martin@edu.fr' }),
    })
    expect(res.status).toBe(409)
  })
})

// ─── PUT /students/:id ───────────────────────────────────────────────────────

describe('PUT /students/:id', () => {
  it('doit renvoyer 200 et l\'étudiant mis à jour', async () => {
    const res = await app.request('/students/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Alicia',
        lastName: 'Martin',
        email: 'alicia.martin@edu.fr',
        grade: 17,
        field: 'informatique',
      }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.firstName).toBe('Alicia')
    expect(body.grade).toBe(17)
  })

  it('doit renvoyer 404 pour un ID inexistant', async () => {
    const res = await app.request('/students/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@edu.fr',
        grade: 10,
        field: 'chimie',
      }),
    })
    expect(res.status).toBe(404)
  })
})

// ─── DELETE /students/:id ────────────────────────────────────────────────────

describe('DELETE /students/:id', () => {
  it('doit renvoyer 200 et un message de confirmation pour un ID valide', async () => {
    const res = await app.request('/students/1', { method: 'DELETE' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBeDefined()
  })

  it('doit renvoyer 404 pour un ID inexistant', async () => {
    const res = await app.request('/students/999', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})

// ─── GET /students/stats ─────────────────────────────────────────────────────

describe('GET /students/stats', () => {
  it('doit renvoyer 200 avec totalStudents, averageGrade, studentsByField et bestStudent', async () => {
    const res = await app.request('/students/stats')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.totalStudents).toBe(5)
    expect(typeof body.averageGrade).toBe('number')
    expect(body.studentsByField).toBeDefined()
    expect(body.bestStudent).toBeDefined()
    expect(body.bestStudent.firstName).toBe('Clara')
  })
})

// ─── GET /students/search ────────────────────────────────────────────────────

describe('GET /students/search', () => {
  it('doit renvoyer 200 et les étudiants correspondant au terme', async () => {
    const res = await app.request('/students/search?q=alice')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].firstName).toBe('Alice')
  })

  it('doit renvoyer 400 si le paramètre q est absent', async () => {
    const res = await app.request('/students/search')
    expect(res.status).toBe(400)
  })

  it('doit renvoyer les résultats de façon insensible à la casse', async () => {
    const res = await app.request('/students/search?q=ALICE')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
  })
})
