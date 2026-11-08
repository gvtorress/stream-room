import { useEffect, useState } from 'react'
import type { HealthResponse } from '@stream-room/shared'

function isHealthResponse(body: unknown): body is HealthResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    body.status === 'ok'
  )
}

function App() {
  const [status, setStatus] = useState<'Checking' | 'Online' | 'Offline'>(
    'Checking',
  )

  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Health request failed')
        }

        const body: unknown = await response.json()
        const online = isHealthResponse(body)

        if (!controller.signal.aborted) {
          setStatus(online ? 'Online' : 'Offline')
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus('Offline')
        }
      }
    }

    void checkHealth()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <p role="status">Server status: {status}</p>
    </main>
  )
}

export default App
