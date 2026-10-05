import type { DatabaseSync } from 'node:sqlite'
import type { FastifyInstance } from 'fastify'
import { findAccount, listAccounts } from '../lib/accounts.js'
import { createSession, deleteSession, readSession, sessionCookie } from '../lib/session.js'

export async function sessionRoutes(app: FastifyInstance, db: DatabaseSync) {
  app.get('/api/demo/accounts', async () => ({ accounts: listAccounts(db) }))
  app.get('/api/session', async (request) => ({ session: readSession(db, request) }))

  app.post<{ Body: { userId: string } }>('/api/demo/login', {
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        additionalProperties: false,
        properties: { userId: { type: 'string', minLength: 1, maxLength: 80 } },
      },
    },
  }, async (request, reply) => {
    const user = findAccount(db, request.body.userId)
    if (!user) return reply.code(400).send({ message: 'Choose one of the demo accounts.' })
    deleteSession(db, request)
    const token = createSession(db, user.id)
    reply.setCookie(sessionCookie, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: request.protocol === 'https',
      maxAge: 8 * 60 * 60,
    })
    return { session: { user } }
  })

  app.post('/api/logout', async (request, reply) => {
    deleteSession(db, request)
    reply.clearCookie(sessionCookie, { path: '/' })
    return reply.code(204).send()
  })
}
