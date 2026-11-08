import { useEffect, useState } from 'react'
import { socket } from './socket'

const PING_TIMEOUT_MS = 5000

export function useRealtimeStatus() {
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

  return { realtimeStatus, pingResponse }
}
