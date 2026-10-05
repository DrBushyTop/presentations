import { useEffect, useState } from 'react'
import type { DemoAccount, Session, Task, TaskStatus } from '../shared/contracts.js'
import { AccountMenu } from './AccountMenu.js'
import { api, ApiError } from './api.js'
import { TeamLabel, teamNameFromId } from './team.js'

type View = 'all' | TaskStatus
const views: { value: View; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
]

type Load =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; tasks: Task[] }

interface TaskListProps {
  session: Session
  accounts: DemoAccount[]
  onSessionChange: (session: Session | null, reason?: string) => void
}

function viewFromUrl(): View {
  const status = new URLSearchParams(window.location.search).get('status')
  return status === 'open' || status === 'done' ? status : 'all'
}

export function TaskList({ session, accounts, onSessionChange }: TaskListProps) {
  const { user } = session
  const [view, setView] = useState<View>(viewFromUrl)
  const [load, setLoad] = useState<Load>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoad({ kind: 'loading' })
    api.tasks(view === 'all' ? undefined : view, controller.signal)
      .then((tasks) => setLoad({ kind: 'ready', tasks }))
      .catch((error: Error) => {
        if (controller.signal.aborted) return
        if (error instanceof ApiError && error.status === 401) {
          onSessionChange(null, 'Your session ended. Sign in again to see your tasks.')
        } else {
          setLoad({ kind: 'error', message: error.message })
        }
      })
    return () => controller.abort()
  }, [view, attempt, onSessionChange])

  function chooseView(next: View) {
    const url = new URL(window.location.href)
    if (next === 'all') url.searchParams.delete('status')
    else url.searchParams.set('status', next)
    window.history.replaceState(null, '', url)
    setView(next)
  }

  const viewWord = view === 'all' ? '' : view + ' '
  const summary = load.kind === 'ready'
    ? `${load.tasks.length} ${viewWord}${load.tasks.length === 1 ? 'task' : 'tasks'}`
    : load.kind === 'loading' ? 'Loading…' : ''

  return (
    <>
      <header className="appbar">
        <div className="appbar-start">
          <span className="logo">Docket</span>
          <span className="appbar-divider" aria-hidden="true" />
          <TeamLabel teamId={user.teamId} teamName={user.teamName} />
        </div>
        <AccountMenu session={session} accounts={accounts} onSessionChange={onSessionChange} />
      </header>

      <main className="page">
        <div className="page-head">
          <h1>{user.teamName} tasks</h1>
          <p className="muted" aria-live="polite">{summary}</p>
        </div>

        <div className="tabs" role="group" aria-label="Filter by status">
          {views.map((option) => (
            <button
              key={option.value}
              className="tab"
              aria-pressed={view === option.value}
              onClick={() => chooseView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <table className="tasks" aria-busy={load.kind === 'loading'}>
          <thead>
            <tr>
              <th scope="col" className="col-id">ID</th>
              <th scope="col">Title</th>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-team">Team</th>
            </tr>
          </thead>
          <tbody>
            {load.kind === 'loading' && [0, 1, 2].map((row) => (
              <tr key={row} className="row-loading" aria-hidden="true">
                <td><span className="skeleton" style={{ width: 44 }} /></td>
                <td><span className="skeleton" style={{ width: `${55 - row * 12}%` }} /></td>
                <td><span className="skeleton" style={{ width: 56 }} /></td>
                <td><span className="skeleton" style={{ width: 64 }} /></td>
              </tr>
            ))}
            {load.kind === 'error' && (
              <tr>
                <td colSpan={4}>
                  <div className="alert" role="alert">
                    <p>Could not load tasks. {load.message}</p>
                    <button className="button" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
                  </div>
                </td>
              </tr>
            )}
            {load.kind === 'ready' && load.tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">No {viewWord}tasks for {user.teamName}.</td>
              </tr>
            )}
            {load.kind === 'ready' && load.tasks.map((task) => (
              <tr key={task.id} data-status={task.status}>
                <td className="col-id">{task.id}</td>
                <td className="task-title">{task.title}</td>
                <td className="col-status">
                  <span className="badge" data-status={task.status}>{task.status === 'open' ? 'Open' : 'Done'}</span>
                </td>
                <td className="col-team">
                  <TeamLabel teamId={task.teamId} teamName={teamNameFromId(task.teamId)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}
