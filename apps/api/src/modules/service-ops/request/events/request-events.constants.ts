export const REQUEST_EVENTS = {
  CREATED: 'service_ops.request.created',
  ASSIGNED: 'service_ops.request.assigned',
  STATUS_CHANGED: 'service_ops.request.status_changed',
  COMMENT_ADDED: 'service_ops.request.comment_added',
  MENTIONED: 'service_ops.request.mentioned',
  WORK_LOG_ADDED: 'service_ops.request.work_log_added',
  RESOLUTION_SUBMITTED: 'service_ops.request.resolution_submitted',
  RESOLUTION_REOPENED: 'service_ops.request.resolution_reopened',
  SLA_BREACHED: 'service_ops.request.sla_breached',
  ESCALATED: 'service_ops.request.escalated',
} as const;
