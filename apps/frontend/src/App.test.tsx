import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  cleanup()
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

  expect(screen.getByRole('status').textContent).toBe('Server status: Checking')
  expect(fetchMock).toHaveBeenCalledWith('/api/health', {
    signal: expect.any(AbortSignal),
  })
})

it('shows Online when the API returns status ok', async () => {
  fetchMock.mockResolvedValue(Response.json({ status: 'ok' }))
  renderApp()

  await screen.findByText('Server status: Online')
})

it.each([{ status: 'error' }, {}, null, 'ok'])(
  'shows Offline for an unhealthy or unexpected response: %j',
  async (body) => {
    fetchMock.mockResolvedValue(Response.json(body))
    renderApp()

    await screen.findByText('Server status: Offline')
  },
)

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

it('aborts the pending health request when unmounted', () => {
  fetchMock.mockReturnValue(new Promise<Response>(() => {}))
  vi.stubGlobal('fetch', fetchMock)
  const { unmount } = render(<App />)
  const signal = fetchMock.mock.calls[0]?.[1]?.signal

  unmount()

  expect(signal?.aborted).toBe(true)
})
