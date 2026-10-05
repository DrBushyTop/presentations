import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import type { FastifyInstance } from 'fastify'
import { createApp } from './app.js'
import { openDatabase } from './lib/db.js'
import type { Task } from './shared/contracts.js'

let app: FastifyInstance

beforeEach(async () => {
  const db = openDatabase(':memory:')
  app = await createApp(db)
  app.addHook('onClose', async () => db.close())
})

afterEach(async () => {
  mock.timers.reset()
  await app.close()
})

async function signIn(userId: string, cookie?: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/demo/login',
    payload: { userId },
    headers: cookie ? { cookie } : {},
  })
  assert.equal(response.statusCode, 200)
  const session = response.cookies.find((c) => c.name === 'no_slop_session')
  assert.ok(session, 'login sets the session cookie')
  assert.equal(session.httpOnly, true)
  return `${session.name}=${session.value}`
}

async function taskIds(cookie: string, query = '') {
  const response = await app.inject({ url: '/api/tasks' + query, headers: { cookie } })
  assert.equal(response.statusCode, 200, response.body)
  return (response.json().tasks as Task[]).map((task) => task.id)
}

describe('sign-in', () => {
  it('lists the two demo accounts', async () => {
    const response = await app.inject({ url: '/api/demo/accounts' })
    assert.deepEqual(response.json().accounts, [
      { id: 'alex', name: 'Alex Rivera', teamId: 'team-a', teamName: 'Team A' },
      { id: 'blair', name: 'Blair Chen', teamId: 'team-b', teamName: 'Team B' },
    ])
  })

  it('rejects unknown accounts', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/demo/login', payload: { userId: 'mallory' } })
    assert.equal(response.statusCode, 400)
    assert.equal(response.cookies.length, 0)
  })

  it('reports the signed-in user, and no session without a cookie', async () => {
    assert.equal((await app.inject({ url: '/api/session' })).json().session, null)
    const cookie = await signIn('blair')
    const response = await app.inject({ url: '/api/session', headers: { cookie } })
    assert.equal(response.json().session.user.name, 'Blair Chen')
  })
})

describe('task list', () => {
  it('requires a session', async () => {
    const response = await app.inject({ url: '/api/tasks' })
    assert.equal(response.statusCode, 401)
    assert.equal(response.json().message, 'Sign in to view your team tasks.')
  })

  it("returns exactly the signed-in team's tasks", async () => {
    assert.deepEqual(await taskIds(await signIn('alex')), ['A-101', 'A-102', 'A-103', 'A-104', 'A-105'])
    assert.deepEqual(await taskIds(await signIn('blair')), ['B-201', 'B-202', 'B-203', 'B-204', 'B-205'])
  })

  it('ignores a forged team in the query string', async () => {
    const alex = await signIn('alex')
    assert.deepEqual(await taskIds(alex, '?teamId=team-b'), ['A-101', 'A-102', 'A-103', 'A-104', 'A-105'])
    assert.deepEqual(await taskIds(alex, '?teamId=team-b&status=open'), ['A-101', 'A-103', 'A-104'])
  })

  it('filters by status', async () => {
    const alex = await signIn('alex')
    assert.deepEqual(await taskIds(alex, '?status=open'), ['A-101', 'A-103', 'A-104'])
    assert.deepEqual(await taskIds(alex, '?status=done'), ['A-102', 'A-105'])
    const invalid = await app.inject({ url: '/api/tasks?status=archived', headers: { cookie: alex } })
    assert.equal(invalid.statusCode, 400)
  })

  it('has no export route in the baseline', async () => {
    const alex = await signIn('alex')
    for (const url of ['/api/tasks/export', '/api/tasks.csv', '/api/export']) {
      assert.equal((await app.inject({ url, headers: { cookie: alex } })).statusCode, 404, url)
    }
  })
})

describe('session lifecycle', () => {
  it('signs out and invalidates the old cookie', async () => {
    const alex = await signIn('alex')
    const logout = await app.inject({ method: 'POST', url: '/api/logout', headers: { cookie: alex } })
    assert.equal(logout.statusCode, 204)
    assert.equal((await app.inject({ url: '/api/tasks', headers: { cookie: alex } })).statusCode, 401)
  })

  it('switching account ends the previous session', async () => {
    const alex = await signIn('alex')
    const blair = await signIn('blair', alex)
    assert.deepEqual(await taskIds(blair), ['B-201', 'B-202', 'B-203', 'B-204', 'B-205'])
    assert.equal((await app.inject({ url: '/api/tasks', headers: { cookie: alex } })).statusCode, 401)
  })

  it('expires sessions after eight hours', async () => {
    mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 9, 3, 9) })
    const alex = await signIn('alex')
    mock.timers.tick(8 * 60 * 60 * 1000 - 1000)
    assert.deepEqual(await taskIds(alex), ['A-101', 'A-102', 'A-103', 'A-104', 'A-105'])
    mock.timers.tick(1000)
    assert.equal((await app.inject({ url: '/api/tasks', headers: { cookie: alex } })).statusCode, 401)
  })
})
