import { useEffect, useState } from 'react'
import type { HealthResponse } from '@stream-room/shared'
import { socket } from './realtime/socket'

const PING_TIMEOUT_MS = 5000

function App() {
  const [status, setStatus] = useState<'Checking' | 'Online' | 'Offline'>(
    'Checking',
  )

  const [realtimeStatus, setRealtimeStatus] = useState<
    'Checking' | 'Online' | 'Offline'
  >('Checking')
  const [pingResponse, setPingResponse] = useState<
    'Checking' | 'pong' | 'no response'
  >('Checking')

  useEffect(() => {
    let pingTimeout: ReturnType<typeof setTimeout> | undefined

    function onConnect() {
      setRealtimeStatus('Online')
      setPingResponse('Checking')
      clearTimeout(pingTimeout)
      pingTimeout = setTimeout(
        () => setPingResponse('no response'),
        PING_TIMEOUT_MS,
      )
      socket.emit('ping')
    }

    function onOffline() {
      clearTimeout(pingTimeout)
      setRealtimeStatus('Offline')
      setPingResponse('no response')
    }

    function onPong(message: string) {
      clearTimeout(pingTimeout)
      setPingResponse(message === 'pong' ? 'pong' : 'no response')
    }

    socket.on('connect', onConnect)
    socket.on('connect_error', onOffline)
    socket.on('disconnect', onOffline)
    socket.on('pong', onPong)
    socket.connect()

    return () => {
      clearTimeout(pingTimeout)
      socket.off('connect', onConnect)
      socket.off('connect_error', onOffline)
      socket.off('disconnect', onOffline)
      socket.off('pong', onPong)
      socket.disconnect()
    }
  }, [])

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
