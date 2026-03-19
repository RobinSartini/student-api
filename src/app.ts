import { Hono } from 'hono'
import { logger } from 'hono/logger'
import studentsRouter from './routes/students.routes.js'

const app = new Hono()

app.use('*', logger())

app.route('/students', studentsRouter)

app.notFound((c) => {
  return c.json({ error: 'Route introuvable' }, 404)
})

export default app
