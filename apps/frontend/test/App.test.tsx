import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../src/App'

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
