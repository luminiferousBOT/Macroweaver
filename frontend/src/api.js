// VITE_API_BASE_URL is set in Vercel. During local dev, it falls back to localhost.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export async function fetchDefaults() {
  const res = await fetch(`${API_BASE}/defaults`)
  if (!res.ok) throw new Error('Failed to load baseline data')
  return res.json()
}

export async function runSimulation(policies) {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policies),
  })
  if (!res.ok) throw new Error('Simulation failed')
  return res.json()
}

export async function runComparison(policyA, policyB) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policy_a: policyA, policy_b: policyB }),
  })
  if (!res.ok) throw new Error('Comparison failed')
  return res.json()
}
