import { Router } from 'express'
import { findUser, sanitizeUser } from '../store.js'

const router = Router()

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  const user = findUser(username, password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  res.json({ user: sanitizeUser(user) })
})

export default router
