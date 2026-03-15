import { Router } from 'express'
import { createCase, getAllCases, getCaseById } from '../store.js'

const router = Router()

// POST /api/patient-case
router.post('/patient-case', (req, res) => {
  const {
    patientName, age, gender, village, symptoms, severityLevel,
    ashaWorkerId, ashaWorkerName,
  } = req.body

  // Basic validation
  if (!patientName || !age || !gender || !village || !symptoms || !severityLevel) {
    return res.status(400).json({ error: 'All required fields must be provided.' })
  }

  const record = createCase({
    patientName,
    age: Number(age),
    gender,
    village,
    symptoms,          // string or array
    severityLevel,     // 'Low' | 'Medium' | 'High'
    ashaWorkerId,
    ashaWorkerName,
  })

  res.status(201).json({ message: 'Case submitted successfully.', case: record })
})

// GET /api/cases
router.get('/cases', (_req, res) => {
  const cases = getAllCases()
  res.json({ cases })
})

// GET /api/cases/:id  (bonus — for detail view)
router.get('/cases/:id', (req, res) => {
  const record = getCaseById(req.params.id)
  if (!record) return res.status(404).json({ error: 'Case not found.' })
  res.json({ case: record })
})

export default router
