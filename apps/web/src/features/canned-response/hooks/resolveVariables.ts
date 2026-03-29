export interface CannedVariableContext {
  requesterName: string;
  requestCode: string;
  assigneeName: string;
}

export function resolveVariables(body: string, context: CannedVariableContext) {
  return body
    .replace(/\{\{requester_name\}\}/g, context.requesterName)
    .replace(/\{\{request_code\}\}/g, context.requestCode)
    .replace(/\{\{assignee_name\}\}/g, context.assigneeName);
}
