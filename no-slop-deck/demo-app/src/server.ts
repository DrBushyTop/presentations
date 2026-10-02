import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { openDatabase } from './lib/db.js'

const production = process.env.NODE_ENV === 'production'
const databaseUrl = production ? '../../data/tasks.sqlite' : '../data/tasks.sqlite'
const db = openDatabase(fileURLToPath(new URL(databaseUrl, import.meta.url)))
const app = await createApp(db, { logger: true, serveClient: production })
app.addHook('onClose', async () => db.close())

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void app.close().catch((error: unknown) => { app.log.error(error); process.exitCode = 1 }) })
}

try {
  await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 4323) })
} catch (error) {
  app.log.error(error)
  await app.close()
  process.exitCode = 1
}
