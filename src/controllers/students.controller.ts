import type { Context } from 'hono'
import { students, getNextId, type Student } from '../data/students.js'
import { validateStudent, VALID_FIELDS } from '../utils/validation.js'

export class StudentController {
  static async getStats(c: Context) {
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
  }

  static async search(c: Context) {
    const q = c.req.query('q')
    if (!q || q.trim() === '') {
      return c.json({ error: 'Le paramètre q est obligatoire et ne peut pas être vide' }, 400)
    }
    const term = q.toLowerCase()
    const results = students.filter(
      (s) => s.firstName.toLowerCase().includes(term) || s.lastName.toLowerCase().includes(term),
    )
    return c.json(results)
  }

  static async getAll(c: Context) {
    const results = [...students]

    const sort = c.req.query('sort')
    const order = c.req.query('order') || 'asc'

    if (sort) {
      if (!['id', 'firstName', 'lastName', 'grade'].includes(sort)) {
        return c.json({ error: 'Paramètre de tri invalide' }, 400)
      }
      results.sort((a, b) => {
        const valA = a[sort as keyof Student]
        const valB = b[sort as keyof Student]

        if (typeof valA === 'string' && typeof valB === 'string') {
          return order.toLowerCase() === 'desc'
            ? valB.localeCompare(valA)
            : valA.localeCompare(valB)
        }

        return order.toLowerCase() === 'desc'
          ? (valB as number) - (valA as number)
          : (valA as number) - (valB as number)
      })
    }

    const pageStr = c.req.query('page')
    const limitStr = c.req.query('limit')
    const page = parseInt(pageStr || '1', 10)
    const limit = parseInt(limitStr || '10', 10)

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return c.json({ error: 'Paramètres de pagination invalides' }, 400)
    }

    const start = (page - 1) * limit
    const paginatedResults = results.slice(start, start + limit)

    return c.json({
      data: paginatedResults,
      meta: {
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
      },
    })
  }

  static async getById(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
    }
    const student = students.find((s) => s.id === id)
    if (!student) {
      return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
    }
    return c.json(student)
  }

  static async create(c: Context) {
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
  }

  static async update(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
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
  }

  static async delete(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
    }
    const index = students.findIndex((s) => s.id === id)
    if (index === -1) {
      return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
    }
    students.splice(index, 1)
    return c.json({ message: `Étudiant avec l'ID ${id} supprimé avec succès` })
  }
}
