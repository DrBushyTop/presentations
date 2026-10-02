import type { DatabaseSync } from 'node:sqlite'
import type { DemoAccount } from '../shared/contracts.js'

const accountColumns = 'users.id, users.name, users.team_id AS teamId, teams.name AS teamName'

export function listAccounts(db: DatabaseSync): DemoAccount[] {
  return db.prepare('SELECT ' + accountColumns + ' FROM users JOIN teams ON teams.id = users.team_id ORDER BY users.id').all() as unknown as DemoAccount[]
}

export function findAccount(db: DatabaseSync, id: string): DemoAccount | undefined {
  return db.prepare('SELECT ' + accountColumns + ' FROM users JOIN teams ON teams.id = users.team_id WHERE users.id = ?').get(id) as unknown as DemoAccount | undefined
}
