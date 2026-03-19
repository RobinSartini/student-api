import { Hono } from 'hono'
import { StudentController } from '../controllers/students.controller.js'

const router = new Hono()

// GET /students/stats — déclaré avant /:id
router.get('/stats', StudentController.getStats)

// GET /students/search?q=... — déclaré avant /:id
router.get('/search', StudentController.search)

// GET /students
router.get('/', StudentController.getAll)

// GET /students/:id
router.get('/:id', StudentController.getById)

// POST /students
router.post('/', StudentController.create)

// PUT /students/:id
router.put('/:id', StudentController.update)

// DELETE /students/:id
router.delete('/:id', StudentController.delete)

export default router
