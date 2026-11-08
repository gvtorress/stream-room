import { useEffect, useState } from 'react'
import type { HealthResponse } from '@stream-room/shared'
import { useRealtimeStatus } from './realtime/use-realtime-status'

function App() {
  const [status, setStatus] = useState<'Checking' | 'Online' | 'Offline'>(
    'Checking',
  )

  const { realtimeStatus, pingResponse } = useRealtimeStatus()

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
      <p role="status">Realtime connection status: {realtimeStatus}</p>
      <p role="status">Ping response: {pingResponse}</p>
    </main>
  )
}

export default App
