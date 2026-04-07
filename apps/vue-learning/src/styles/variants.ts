// Tất cả Tailwind variant strings tập trung ở đây
// Component chỉ import tên — không còn thấy class strings lẫn lộn trong template
import type { RequestStatus, RequestPriority } from '../types'

export const statusBadge: Record<RequestStatus, string> = {
  open:        'bg-blue-100  text-blue-700  ring-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 ring-amber-200',
  done:        'bg-green-100 text-green-700 ring-green-200',
}

export const statusLabel: Record<RequestStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  done:        'Done',
}

export const priorityBorder: Record<RequestPriority, string> = {
  high:   'border-l-red-500',
  medium: 'border-l-amber-400',
  low:    'border-l-gray-300',
}

export const priorityBadge: Record<RequestPriority, string> = {
  high:   'bg-red-50   text-red-700',
  medium: 'bg-amber-50 text-amber-700',
  low:    'bg-gray-50  text-gray-500',
}

export const priorityBadgeDetail: Record<RequestPriority, string> = {
  high:   'bg-red-50   text-red-700   ring-red-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  low:    'bg-gray-50  text-gray-600  ring-gray-200',
}

export const priorityLabel: Record<RequestPriority, string> = {
  high:   'High',
  medium: 'Medium',
  low:    'Low',
}
