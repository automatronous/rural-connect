// ── In-memory data store ────────────────────────────────────────
// Replace with a real database (MongoDB, PostgreSQL, etc.) later.

const users = [
  { id: 'ASHA-001', username: 'asha',   password: 'asha123',   name: 'Rekha Verma',     role: 'asha'   },
  { id: 'DOC-001',  username: 'doctor', password: 'doctor123', name: 'Dr. Priya Sharma', role: 'doctor' },
]

const cases = new Map()

// ── User helpers ────────────────────────────────────────────────
export function findUser(username, password) {
  return users.find(u => u.username === username && u.password === password) || null
}

export function sanitizeUser(user) {
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

// ── Case helpers ────────────────────────────────────────────────
let caseSeq = 1000

export function createCase(data) {
  const caseId = `CASE-${++caseSeq}`
  const record = {
    caseId,
    ...data,
    submittedAt: new Date().toISOString(),
    // AI placeholder — will be populated once the AI module is integrated
    aiPrediction: null,
    riskScore: null,
  }
  cases.set(caseId, record)
  return record
}

export function getAllCases() {
  return Array.from(cases.values()).sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  )
}

export function getCaseById(caseId) {
  return cases.get(caseId) || null
}
