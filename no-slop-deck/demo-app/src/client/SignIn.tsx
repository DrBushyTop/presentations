import { useState } from 'react'
import type { DemoAccount, Session } from '../shared/contracts.js'
import { api } from './api.js'
import { Avatar, TeamLabel } from './team.js'

interface SignInProps {
  accounts: DemoAccount[]
  notice: string | null
  onSignedIn: (session: Session) => void
}

export function SignIn({ accounts, notice, onSignedIn }: SignInProps) {
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signIn(userId: string) {
    setPending(userId)
    setError(null)
    try {
      onSignedIn(await api.login(userId))
    } catch (failure) {
      setError((failure as Error).message)
      setPending(null)
    }
  }

  return (
    <main className="signin">
      <div className="signin-panel">
        <span className="logo">Docket</span>
        <h1>Sign in</h1>
        <p className="muted">Pick a demo account. There is no password. You only see your own team's tasks.</p>
        {notice && <p className="callout" role="status">{notice}</p>}
        <ul className="account-list" aria-label="Demo accounts">
          {accounts.map((account) => (
            <li key={account.id}>
              <button className="account-option" disabled={pending !== null} onClick={() => void signIn(account.id)}>
                <Avatar name={account.name} teamId={account.teamId} />
                <span className="account-option-name">{account.name}</span>
                <TeamLabel teamId={account.teamId} teamName={account.teamName} />
                <span className="account-option-action">{pending === account.id ? 'Signing in…' : 'Sign in'}</span>
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="alert" role="alert">{error}</p>}
      </div>
    </main>
  )
}
