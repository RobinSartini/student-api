export interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  grade: number
  field: string
}

const initialStudents: Student[] = [
  { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice.martin@edu.fr', grade: 16.5, field: 'informatique' },
  { id: 2, firstName: 'Bob', lastName: 'Dupont', email: 'bob.dupont@edu.fr', grade: 12.0, field: 'mathématiques' },
  { id: 3, firstName: 'Clara', lastName: 'Leroy', email: 'clara.leroy@edu.fr', grade: 18.0, field: 'physique' },
  { id: 4, firstName: 'David', lastName: 'Moreau', email: 'david.moreau@edu.fr', grade: 9.5, field: 'chimie' },
  { id: 5, firstName: 'Eva', lastName: 'Bernard', email: 'eva.bernard@edu.fr', grade: 14.0, field: 'informatique' },
]

export let students: Student[] = initialStudents.map((s) => ({ ...s }))
let nextId = 6

export function resetStudents(): void {
  students = initialStudents.map((s) => ({ ...s }))
  nextId = 6
}

export function getNextId(): number {
  return nextId++
}
