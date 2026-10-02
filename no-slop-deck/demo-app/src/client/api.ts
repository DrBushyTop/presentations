import type { DemoAccount, Session, Task, TaskStatus } from '../shared/contracts.js'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { ...init, signal, credentials: 'same-origin' })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError('The server did not respond. Check that it is running.', 0)
  }
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => ({})) as { message?: string }
  if (!response.ok) throw new ApiError(body.message ?? `Request failed with status ${response.status}.`, response.status)
  return body as T
}

export const api = {
  session: (signal?: AbortSignal) =>
    request<{ session: Session | null }>('/api/session', {}, signal).then((body) => body.session),
  accounts: (signal?: AbortSignal) =>
    request<{ accounts: DemoAccount[] }>('/api/demo/accounts', {}, signal).then((body) => body.accounts),
  login: (userId: string) =>
    request<{ session: Session }>('/api/demo/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).then((body) => body.session),
  logout: () => request<void>('/api/logout', { method: 'POST' }),
  tasks: (status: TaskStatus | undefined, signal?: AbortSignal) =>
    request<{ tasks: Task[] }>(status ? `/api/tasks?status=${status}` : '/api/tasks', {}, signal).then((body) => body.tasks),
}
