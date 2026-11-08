import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App'

const { socketMock, listeners } = vi.hoisted(() => {
  const listeners = new Map<string, (message?: string) => void>()
  const socketMock = {
    on: vi.fn((event: string, listener: (message?: string) => void) => {
      listeners.set(event, listener)
    }),
    off: vi.fn((event: string) => {
      listeners.delete(event)
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  }
  return { socketMock, listeners }
})

vi.mock('socket.io-client', () => ({ io: () => socketMock }))

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.clearAllMocks()
  fetchMock.mockReturnValue(new Promise<Response>(() => {}))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  listeners.clear()
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function renderApp() {
  vi.stubGlobal('fetch', fetchMock)
  render(<App />)
}

it('shows Checking while waiting for the health response', () => {
  fetchMock.mockReturnValue(new Promise<Response>(() => {}))
  renderApp()

  expect(screen.getByText('Server status: Checking')).toBeDefined()
  expect(fetchMock).toHaveBeenCalledWith('/api/health')
})

it('shows Online when the API returns status ok', async () => {
  fetchMock.mockResolvedValue(Response.json({ status: 'ok' }))
  renderApp()

  await screen.findByText('Server status: Online')
})

it('shows Offline when the API status is not ok', async () => {
  fetchMock.mockResolvedValue(Response.json({ status: 'error' }))
  renderApp()

  await screen.findByText('Server status: Offline')
})

it('shows Offline when the request fails', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
  renderApp()

  await screen.findByText('Server status: Offline')
})

it('shows Offline for an HTTP error even if the body says ok', async () => {
  fetchMock.mockResolvedValue(Response.json({ status: 'ok' }, { status: 503 }))
  renderApp()

  await screen.findByText('Server status: Offline')
})

it('shows Offline when the response is not valid JSON', async () => {
  fetchMock.mockResolvedValue(new Response('invalid json'))
  renderApp()

  await screen.findByText('Server status: Offline')
})

function receive(event: string, message?: string) {
  act(() => {
    const listener = listeners.get(event)
    if (!listener) throw new Error(`Missing listener for ${event}`)
    listener(message)
  })
}

it('shows Checking while connecting to realtime', () => {
  renderApp()

  expect(screen.getByText('Realtime connection status: Checking')).toBeDefined()
  expect(screen.getByText('Ping response: Checking')).toBeDefined()
  expect(socketMock.connect).toHaveBeenCalledOnce()
  expect(socketMock.emit).not.toHaveBeenCalled()
})

it('sends ping after connecting and displays the pong response', () => {
  vi.useFakeTimers()
  renderApp()
  receive('connect')

  expect(screen.getByText('Realtime connection status: Online')).toBeDefined()
  expect(socketMock.emit).toHaveBeenCalledWith('ping')

  receive('pong', 'pong')
  act(() => vi.advanceTimersByTime(5000))
  expect(screen.getByText('Ping response: pong')).toBeDefined()
})

it('shows no response when pong does not arrive within five seconds', () => {
  vi.useFakeTimers()
  renderApp()
  receive('connect')

  act(() => vi.advanceTimersByTime(5000))

  expect(screen.getByText('Realtime connection status: Online')).toBeDefined()
  expect(screen.getByText('Ping response: no response')).toBeDefined()
})

it('shows Offline and no response when the connection fails', () => {
  renderApp()
  receive('connect_error')

  expect(screen.getByText('Realtime connection status: Offline')).toBeDefined()
  expect(screen.getByText('Ping response: no response')).toBeDefined()
})

it('shows Offline on disconnect and sends another ping on reconnect', () => {
  renderApp()
  receive('connect')
  receive('pong', 'pong')
  receive('disconnect')

  expect(screen.getByText('Realtime connection status: Offline')).toBeDefined()
  expect(screen.getByText('Ping response: no response')).toBeDefined()

  receive('connect')
  expect(socketMock.emit).toHaveBeenCalledTimes(2)
  expect(screen.getByText('Realtime connection status: Online')).toBeDefined()
  expect(screen.getByText('Ping response: Checking')).toBeDefined()
})

it('shows no response for an unexpected pong payload', () => {
  renderApp()
  receive('connect')
  receive('pong', 'unexpected')

  expect(screen.getByText('Ping response: no response')).toBeDefined()
})

it('removes listeners, clears the pending timeout, and disconnects on unmount', () => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', fetchMock)
  const { unmount } = render(<App />)
  receive('connect')

  unmount()

  expect(listeners.size).toBe(0)
  expect(socketMock.off).toHaveBeenCalledTimes(4)
  expect(socketMock.disconnect).toHaveBeenCalledOnce()
  expect(vi.getTimerCount()).toBe(0)
})
