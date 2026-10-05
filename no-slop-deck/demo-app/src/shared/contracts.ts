export type TaskStatus = 'open' | 'done'

export interface Task {
  id: string
  teamId: string
  title: string
  status: TaskStatus
}

export interface DemoAccount {
  id: string
  name: string
  teamId: string
  teamName: string
}

export interface Session {
  user: DemoAccount
}
