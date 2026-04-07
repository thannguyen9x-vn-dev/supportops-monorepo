"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDigestSubject = buildDigestSubject;
exports.buildDigestHtml = buildDigestHtml;
function buildDigestSubject(events, requestId) {
    return `[SupportOps] ${events.length} updates on request ${requestId}`;
}
function buildDigestHtml(events, requestId, tenantId) {
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
//# sourceMappingURL=email-digest.template.js.map