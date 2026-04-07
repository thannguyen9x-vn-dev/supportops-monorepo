export interface DigestEventItem {
  eventType: string;
  payload: Record<string, unknown>;
  at: string;
}

export function buildDigestSubject(events: DigestEventItem[], requestId: string): string {
  return `[SupportOps] ${events.length} updates on request ${requestId}`;
}

export function buildDigestHtml(events: DigestEventItem[], requestId: string, tenantId: string): string {
  const rows = events
    .map((event) => {
      const message = String(event.payload.message ?? event.payload.body ?? event.eventType);
      return `<li><strong>${event.eventType}</strong> — ${message} <em>(${event.at})</em></li>`;
    })
    .join('');

  return [
    `<h3>Digest updates for request ${requestId}</h3>`,
    `<p>Tenant: ${tenantId}</p>`,
    `<ul>${rows}</ul>`,
  ].join('');
}
