import { useEffect, useRef, useState } from 'react'
import type { DemoAccount, Session } from '../shared/contracts.js'
import { api } from './api.js'
import { Avatar, Chevron, TeamLabel } from './team.js'

interface AccountMenuProps {
  session: Session
  accounts: DemoAccount[]
  onSessionChange: (session: Session | null) => void
}

export function AccountMenu({ session, accounts, onSessionChange }: AccountMenuProps) {
  const { user } = session
  const menu = useRef<HTMLDetailsElement>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false
        menu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  async function run(key: string, action: () => Promise<Session | null>) {
    setPending(key)
    setError(null)
    try {
      onSessionChange(await action())
    } catch (failure) {
      setError((failure as Error).message)
      setPending(null)
    }
  }

  return (
    <details className="account-menu" ref={menu}>
      <summary aria-label={`Account: ${user.name}, ${user.teamName}`}>
        <Avatar name={user.name} teamId={user.teamId} />
        <span className="account-menu-name">{user.name}</span>
        <Chevron />
      </summary>
      <div className="menu">
        <p className="menu-heading">Switch account</p>
        {accounts.filter((account) => account.id !== user.id).map((account) => (
          <button
            key={account.id}
            className="menu-item"
            disabled={pending !== null}
            onClick={() => void run(account.id, () => api.login(account.id))}
          >
            <Avatar name={account.name} teamId={account.teamId} />
            <span>{pending === account.id ? 'Switching…' : account.name}</span>
            <TeamLabel teamId={account.teamId} teamName={account.teamName} />
          </button>
        ))}
        <hr />
        <button
          className="menu-item"
          disabled={pending !== null}
          onClick={() => void run('logout', () => api.logout().then(() => null))}
        >
          {pending === 'logout' ? 'Signing out…' : 'Sign out'}
        </button>
        {error && <p className="menu-error" role="alert">{error}</p>}
      </div>
    </details>
  )
}
