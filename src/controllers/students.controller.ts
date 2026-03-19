import type { Context } from 'hono'
import { StudentService } from '../services/students.service.js'
import type { Student } from '../data/students.js'

export class StudentController {
  static async getStats(c: Context) {
    const stats = StudentService.getStats()
    return c.json(stats)
  }

  static async search(c: Context) {
    const q = c.req.query('q')
    if (!q || q.trim() === '') {
      return c.json({ error: 'Le paramètre q est obligatoire et ne peut pas être vide' }, 400)
    }
    const results = StudentService.search(q.toLowerCase())
    return c.json(results)
  }

  static async getAll(c: Context) {
    const sort = c.req.query('sort')
    const order = c.req.query('order') || 'asc'
    
    if (sort && !['id', 'firstName', 'lastName', 'grade'].includes(sort)) {
      return c.json({ error: 'Paramètre de tri invalide' }, 400)
    }

    const pageStr = c.req.query('page')
    const limitStr = c.req.query('limit')
    const page = parseInt(pageStr || '1', 10)
    const limit = parseInt(limitStr || '10', 10)

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return c.json({ error: 'Paramètres de pagination invalides' }, 400)
    }

    const result = StudentService.getAll(page, limit, sort, order)
    return c.json(result)
  }

  static async getById(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
    }
    
    const student = StudentService.getById(id)
    if (!student) {
      return c.json({ error: `Étudiant avec l'ID ${id} introuvable` }, 404)
    }
    return c.json(student)
  }

  static async create(c: Context) {
    const body = await c.req.json<Partial<Student>>()
    const result = StudentService.create(body)
    
    if (result.error) {
      return c.json({ error: result.error.error }, result.error.status as 400 | 404 | 409)
    }
    return c.json(result.data, 201)
  }

  static async update(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
    }

    const body = await c.req.json<Partial<Student>>()
    const result = StudentService.update(id, body)
    
    if (result.error) {
      return c.json({ error: result.error.error }, result.error.status as 400 | 404 | 409)
    }
    return c.json(result.data)
  }

  static async delete(c: Context) {
    const idStr = c.req.param('id') || ''
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return c.json({ error: 'L\'ID doit être un nombre valide' }, 400)
    }

    const result = StudentService.delete(id)
    if (result.error) {
      return c.json({ error: result.error.error }, result.error.status as 400 | 404 | 409)
    }
    
    return c.json({ message: `Étudiant avec l'ID ${id} supprimé avec succès` })
  }
}
