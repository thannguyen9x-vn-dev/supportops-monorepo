export type RequestStatus = 'open' | 'in_progress' | 'done'
export type RequestPriority = 'high' | 'medium' | 'low'
export type StatusFilter = RequestStatus | 'all'

export interface Request {
  id: number
  title: string
  status: RequestStatus
  priority: RequestPriority
  assignee: string | null
  created_date: string
  due_date: string
  closed_date: string | null
}
