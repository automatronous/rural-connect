import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import caseRoutes from './routes/cases.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──
app.use(cors())
app.use(express.json())

// ── API Routes ──
app.use('/api', authRoutes)
app.use('/api', caseRoutes)

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Serve frontend build in production ──
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// All non-API routes → index.html (React Router handles them)
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`✅ RuralCareConnect running on http://localhost:${PORT}`)
})

