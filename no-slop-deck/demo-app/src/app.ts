import Fastify, { LogController } from 'fastify'
import cookie from '@fastify/cookie'
import staticFiles from '@fastify/static'
import { fileURLToPath } from 'node:url'
import type { DatabaseSync } from 'node:sqlite'
import { sessionRoutes } from './routes/session.js'
import { taskRoutes } from './routes/tasks.js'

export async function createApp(db: DatabaseSync, options: { logger?: boolean; serveClient?: boolean } = {}) {
  const app = Fastify({
    logger: options.logger ?? false,
    logController: new LogController({ disableRequestLogging: true }),
  })
  await app.register(cookie)
  await sessionRoutes(app, db)
  await taskRoutes(app, db)

  if (options.serveClient) {
    await app.register(staticFiles, { root: fileURLToPath(new URL('../client/', import.meta.url)) })
  }
  return app
}
