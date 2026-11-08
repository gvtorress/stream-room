import { useEffect, useState } from 'react'
import type { HealthResponse } from '@stream-room/shared'

function App() {
  const [status, setStatus] = useState<'Checking' | 'Online' | 'Offline'>(
    'Checking',
  )

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error('Health request failed')
        }

        const body: HealthResponse = await response.json()
        setStatus(body.status === 'ok' ? 'Online' : 'Offline')
      } catch {
        setStatus('Offline')
      }
    }

    void checkHealth()
  }, [])

  return (
    <main>
      <p role="status">Server status: {status}</p>
    </main>
  )
}

export default App
