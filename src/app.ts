import { Hono } from 'hono'
import studentsRouter from './routes/students.js'

const app = new Hono()

app.route('/students', studentsRouter)

app.notFound((c) => {
  return c.json({ error: 'Route introuvable' }, 404)
})

export default app
