import { useCallback, useEffect, useState } from 'react'
import type { DemoAccount, Session } from '../shared/contracts.js'
import { api } from './api.js'
import { SignIn } from './SignIn.js'
import { TaskList } from './TaskList.js'

type Boot =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: Session | null; accounts: DemoAccount[] }

export function App() {
  const [boot, setBoot] = useState<Boot>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([api.session(controller.signal), api.accounts(controller.signal)])
      .then(([session, accounts]) => setBoot({ kind: 'ready', session, accounts }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setBoot({ kind: 'error', message: error.message })
      })
    return () => controller.abort()
  }, [attempt])

  const setSession = useCallback((session: Session | null, reason?: string) => {
    setNotice(reason ?? null)
    setBoot((current) => (current.kind === 'ready' ? { ...current, session } : current))
  }, [])

  return (
    <div className="app">
      {boot.kind === 'loading' && <p className="page-status" role="status">Loading…</p>}
      {boot.kind === 'error' && (
        <div className="page-status">
          <div className="alert" role="alert">
            <p>{boot.message}</p>
            <button className="button" onClick={() => { setBoot({ kind: 'loading' }); setAttempt((n) => n + 1) }}>
              Try again
            </button>
          </div>
        </div>
      )}
      {boot.kind === 'ready' && (boot.session
        ? <TaskList key={boot.session.user.id} session={boot.session} accounts={boot.accounts} onSessionChange={setSession} />
        : <SignIn accounts={boot.accounts} notice={notice} onSignedIn={setSession} />)}
      <footer className="footnote">Demo data. <code>npm run reset</code> restores it and signs everyone out.</footer>
    </div>
  )
}
