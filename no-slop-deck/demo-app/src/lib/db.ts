import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function openDatabase(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team_id TEXT NOT NULL REFERENCES teams(id)
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id),
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('open', 'done'))
    );
    CREATE INDEX IF NOT EXISTS tasks_by_team ON tasks(team_id);
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );
  `)
  if (!db.prepare('SELECT id FROM teams LIMIT 1').get()) seedDatabase(db)
  return db
}

export function seedDatabase(db: DatabaseSync) {
  db.exec(`
    BEGIN;
    DELETE FROM sessions;
    DELETE FROM tasks;
    DELETE FROM users;
    DELETE FROM teams;
    INSERT INTO teams VALUES ('team-a', 'Team A'), ('team-b', 'Team B');
    INSERT INTO users VALUES
      ('alex', 'Alex Rivera', 'team-a'),
      ('blair', 'Blair Chen', 'team-b');
    INSERT INTO tasks VALUES
      ('A-101', 'team-a', 'Draft Q4 roadmap', 'open'),
      ('A-102', 'team-a', 'Fix login, then retest', 'done'),
      ('A-103', 'team-a', 'Review the "Getting started" guide', 'open'),
      ('A-104', 'team-a', 'Book a venue for the Tampere offsite', 'open'),
      ('A-105', 'team-a', 'Close the September sprint', 'done'),
      ('B-201', 'team-b', 'CANARY: Team B only', 'open'),
      ('B-202', 'team-b', 'Salary review notes', 'done'),
      ('B-203', 'team-b', 'Renew the API gateway certificate', 'open'),
      ('B-204', 'team-b', 'Interview backend contractors', 'open'),
      ('B-205', 'team-b', 'Move the on-call rota to the shared calendar', 'done');
    COMMIT;
  `)
}
