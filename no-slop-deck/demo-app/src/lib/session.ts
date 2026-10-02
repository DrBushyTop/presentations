import { randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import type { FastifyRequest } from 'fastify'
import type { DemoAccount, Session } from '../shared/contracts.js'

export const sessionCookie = 'no_slop_session'
const lifetime = 8 * 60 * 60 * 1000

export function createSession(db: DatabaseSync, userId: string) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, Date.now() + lifetime)
  return token
}

export function readSession(db: DatabaseSync, request: FastifyRequest): Session | null {
  const token = request.cookies[sessionCookie]
  if (!token) return null
  const user = db.prepare(`
    SELECT users.id, users.name, users.team_id AS teamId, teams.name AS teamName
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    JOIN teams ON teams.id = users.team_id
    WHERE sessions.token = ? AND sessions.expires_at > ?
  `).get(token, Date.now()) as unknown as DemoAccount | undefined
  return user ? { user } : null
}

export function requireSession(db: DatabaseSync, request: FastifyRequest): Session {
  const session = readSession(db, request)
  if (!session) throw Object.assign(new Error('Sign in to view your team tasks.'), { statusCode: 401 })
  return session
}

export function deleteSession(db: DatabaseSync, request: FastifyRequest) {
  const token = request.cookies[sessionCookie]
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}
