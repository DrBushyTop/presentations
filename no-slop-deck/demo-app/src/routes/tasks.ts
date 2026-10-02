import type { DatabaseSync } from 'node:sqlite'
import type { FastifyInstance } from 'fastify'
import { requireSession } from '../lib/session.js'
import { findTasks } from '../lib/tasks.js'
import type { TaskStatus } from '../shared/contracts.js'

export async function taskRoutes(app: FastifyInstance, db: DatabaseSync) {
  app.get<{ Querystring: { status?: TaskStatus } }>('/api/tasks', {
    schema: {
      querystring: {
        type: 'object',
        properties: { status: { type: 'string', enum: ['open', 'done'] } },
      },
    },
  }, async (request) => {
    const session = requireSession(db, request)
    const tasks = findTasks(db, { teamId: session.user.teamId, status: request.query.status })
    return { tasks }
  })
}
