import { fileURLToPath } from 'node:url'
import { openDatabase, seedDatabase } from '../src/lib/db.js'

const db = openDatabase(fileURLToPath(new URL('../data/tasks.sqlite', import.meta.url)))
seedDatabase(db)
db.close()
process.stdout.write('Restored the two demo accounts and ten tasks. Existing sessions are signed out.\n')
