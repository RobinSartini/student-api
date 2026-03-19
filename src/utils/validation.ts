import { students, type Student } from '../data/students.js'

export const VALID_FIELDS = ['informatique', 'mathématiques', 'physique', 'chimie']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ValidationError {
  error: string
  status: 400 | 409
}

export function validateStudent(body: Partial<Student>, excludeId: number | null = null): ValidationError | null {
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
