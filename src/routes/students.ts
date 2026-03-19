import { Hono } from 'hono'
import { students, getNextId, type Student } from '../data/students.js'

const router = new Hono()

const VALID_FIELDS = ['informatique', 'mathématiques', 'physique', 'chimie']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ValidationError {
  error: string
  status: 400 | 409
}

function validateStudent(body: Partial<Student>, excludeId: number | null = null): ValidationError | null {
  const { firstName, lastName, email, grade, field } = body

  if (!firstName || !lastName || !email || grade === undefined || grade === null || !field) {
    return { error: 'Tous les champs sont obligatoires (firstName, lastName, email, grade, field)', status: 400 }
  }
  if (typeof firstName !== 'string' || firstName.trim().length < 2) {
    return { error: 'firstName doit contenir au moins 2 caractères', status: 400 }
  }
  if (typeof lastName !== 'string' || lastName.trim().length < 2) {
    return { error: 'lastName doit contenir au moins 2 caractères', status: 400 }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Format email invalide', status: 400 }
  }
  if (typeof grade !== 'number' || grade < 0 || grade > 20) {
    return { error: 'grade doit être un nombre entre 0 et 20', status: 400 }
  }
  if (!VALID_FIELDS.includes(field)) {
    return { error: `field doit être l'une des valeurs : ${VALID_FIELDS.join(', ')}`, status: 400 }
  }

  const duplicate = students.find((s) => s.email === email && s.id !== excludeId)
  if (duplicate) {
    return { error: 'Cet email est déjà utilisé par un autre étudiant', status: 409 }
  }

  return null
}

// GET /students/stats — déclaré avant /:id
router.get('/stats', (c) => {
  if (students.length === 0) {
    return c.json({ totalStudents: 0, averageGrade: 0, studentsByField: {}, bestStudent: null })
  }

  const totalStudents = students.length
  const averageGrade =
    Math.round((students.reduce((acc, s) => acc + s.grade, 0) / totalStudents) * 100) / 100
  const studentsByField = VALID_FIELDS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = students.filter((s) => s.field === f).length
    return acc
  }, {})
  const bestStudent = students.reduce((best, s) => (s.grade > best.grade ? s : best), students[0])

  return c.json({ totalStudents, averageGrade, studentsByField, bestStudent })
})

// GET /students/search?q=... — déclaré avant /:id
router.get('/search', (c) => {
  const q = c.req.query('q')
  if (!q || q.trim() === '') {
    return c.json({ error: 'Le paramètre q est obligatoire et ne peut pas être vide' }, 400)
  }
  const term = q.toLowerCase()
  const results = students.filter(
    (s) => s.firstName.toLowerCase().includes(term) || s.lastName.toLowerCase().includes(term),
  )
  return c.json(results)
})

// GET /students
router.get('/', (c) => {
  return c.json(students)
})

// GET /students/:id
router.get('/:id', (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
  }
  const student = students.find((s) => s.id === id)
  if (!student) {
    return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
  }
  return c.json(student)
})

// POST /students
router.post('/', async (c) => {
  const body = await c.req.json<Partial<Student>>()
  const validationError = validateStudent(body)
  if (validationError) {
    return c.json({ error: validationError.error }, validationError.status)
  }

  const { firstName, lastName, email, grade, field } = body as Student
  const newStudent: Student = {
    id: getNextId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    grade,
    field,
  }
  students.push(newStudent)
  return c.json(newStudent, 201)
})

// PUT /students/:id
router.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
  }
  const index = students.findIndex((s) => s.id === id)
  if (index === -1) {
    return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
  }

  const body = await c.req.json<Partial<Student>>()
  const validationError = validateStudent(body, id)
  if (validationError) {
    return c.json({ error: validationError.error }, validationError.status)
  }

  const { firstName, lastName, email, grade, field } = body as Student
  students[index] = { id, firstName: firstName.trim(), lastName: lastName.trim(), email, grade, field }
  return c.json(students[index])
})

// DELETE /students/:id
router.delete('/:id', (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
  }
  const index = students.findIndex((s) => s.id === id)
  if (index === -1) {
    return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
  }
  students.splice(index, 1)
  return c.json({ message: `Étudiant avec l'ID ${id} supprimé avec succès` })
})

export default router
