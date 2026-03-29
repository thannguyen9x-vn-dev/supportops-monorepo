export function buildImmediateSubject(eventType: string, payload: Record<string, unknown>): string {
  const requestCode = String(payload.requestCode ?? payload.requestId ?? 'request');
  return `[SupportOps] ${eventType} — ${requestCode}`;
}

export function buildImmediateHtml(eventType: string, payload: Record<string, unknown>): string {
  const title = String(payload.title ?? 'SupportOps Notification');
  const message = String(payload.message ?? payload.body ?? 'You have a new update.');
  const requestCode = String(payload.requestCode ?? payload.requestId ?? '-');

  return [
    `<h3>${title}</h3>`,
    `<p><strong>Event:</strong> ${eventType}</p>`,
    `<p><strong>Request:</strong> ${requestCode}</p>`,
    `<p>${message}</p>`,
  ].join('');
}
