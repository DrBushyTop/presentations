/** Initials for an avatar, e.g. "Alex Rivera" -> "AR". */
export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase()
}

export function Avatar({ name, teamId }: { name: string; teamId: string }) {
  return <span className="avatar" data-team={teamId} aria-hidden="true">{initials(name)}</span>
}

export function TeamLabel({ teamId, teamName }: { teamId: string; teamName: string }) {
  return (
    <span className="team-label" data-team={teamId}>
      <span className="team-dot" aria-hidden="true" />
      {teamName}
    </span>
  )
}

/** Display name for a team id when only the id is known, e.g. "team-b" -> "Team B". */
export function teamNameFromId(teamId: string) {
  return 'Team ' + teamId.replace(/^team-/, '').toUpperCase()
}

export function Chevron() {
  return (
    <svg className="chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
