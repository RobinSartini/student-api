import { students, getNextId, type Student } from '../data/students.js'
import { validateStudent, VALID_FIELDS } from '../utils/validation.js'

export class StudentService {
  static getStats() {
    if (students.length === 0) {
      return { totalStudents: 0, averageGrade: 0, studentsByField: {}, bestStudent: null }
    }

    const totalStudents = students.length
    const averageGrade = Math.round((students.reduce((acc, s) => acc + s.grade, 0) / totalStudents) * 100) / 100
    const studentsByField = VALID_FIELDS.reduce<Record<string, number>>((acc, f) => {
      acc[f] = students.filter((s) => s.field === f).length
      return acc
    }, {})
    const bestStudent = students.reduce((best, s) => (s.grade > best.grade ? s : best), students[0])

    return { totalStudents, averageGrade, studentsByField, bestStudent }
  }

  static search(term: string) {
    return students.filter(
      (s) => s.firstName.toLowerCase().includes(term) || s.lastName.toLowerCase().includes(term),
    )
  }

  static getAll(page: number, limit: number, sort: string | undefined, order: string) {
    const results = [...students]

    if (sort) {
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

    const start = (page - 1) * limit
    const paginatedResults = results.slice(start, start + limit)

    return {
      data: paginatedResults,
      meta: {
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
      },
    }
  }

  static getById(id: number) {
    return students.find((s) => s.id === id) || null
  }

  static create(body: Partial<Student>) {
    const validationError = validateStudent(body)
    if (validationError) return { error: validationError }

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
    return { data: newStudent }
  }

  static update(id: number, body: Partial<Student>) {
    const index = students.findIndex((s) => s.id === id)
    if (index === -1) return { error: { error: `Étudiant avec l'ID ${id} introuvable`, status: 404 } }

    const validationError = validateStudent(body, id)
    if (validationError) return { error: validationError }

    const { firstName, lastName, email, grade, field } = body as Student
    students[index] = { id, firstName: firstName.trim(), lastName: lastName.trim(), email, grade, field }
    return { data: students[index] }
  }

  static delete(id: number) {
    const index = students.findIndex((s) => s.id === id)
    if (index === -1) return { error: { error: `Étudiant avec l'ID ${id} introuvable`, status: 404 } }

    students.splice(index, 1)
    return { success: true }
  }
}
