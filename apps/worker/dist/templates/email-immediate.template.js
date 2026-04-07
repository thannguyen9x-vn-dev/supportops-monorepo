"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildImmediateSubject = buildImmediateSubject;
exports.buildImmediateHtml = buildImmediateHtml;
function buildImmediateSubject(eventType, payload) {
    const requestCode = String(payload.requestCode ?? payload.requestId ?? 'request');
    return `[SupportOps] ${eventType} — ${requestCode}`;
}
function buildImmediateHtml(eventType, payload) {
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
//# sourceMappingURL=email-immediate.template.js.map