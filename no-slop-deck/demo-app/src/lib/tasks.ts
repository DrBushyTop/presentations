import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import type { Task, TaskStatus } from '../shared/contracts.js'

export interface TaskFilter {
  teamId?: string
  status?: TaskStatus
}

export function findTasks(db: DatabaseSync, filter: TaskFilter = {}): Task[] {
  const conditions: string[] = []
  const values: SQLInputValue[] = []
  if (filter.teamId !== undefined) {
    conditions.push('team_id = ?')
    values.push(filter.teamId)
  }
  if (filter.status !== undefined) {
    conditions.push('status = ?')
    values.push(filter.status)
  }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  return db.prepare('SELECT id, team_id AS teamId, title, status FROM tasks' + where + ' ORDER BY id').all(...values) as unknown as Task[]
}
