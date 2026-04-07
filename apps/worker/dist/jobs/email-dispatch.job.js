"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSendEmail = canSendEmail;
exports.processImmediateEmail = processImmediateEmail;
exports.processDigestEvent = processDigestEvent;
exports.processDigestSend = processDigestSend;
exports.processEmailDigestWorker = processEmailDigestWorker;
const email_digest_template_1 = require("../templates/email-digest.template");
const email_immediate_template_1 = require("../templates/email-immediate.template");
function buildRateLimitKey(userId, requestId) {
    return `email-rate:${userId}:${requestId}`;
}
async function canSendEmail(redis, userId, requestId) {
    const rateKey = buildRateLimitKey(userId, requestId);
    const sentCount = Number((await redis.get(rateKey)) ?? 0);
    if (sentCount >= 5) {
        return false;
    }
    await redis.incr(rateKey);
    await redis.expire(rateKey, 3600);
    return true;
}
async function processImmediateEmail(data, deps) {
    if (!(await canSendEmail(deps.redis, data.userId, data.requestId))) {
        return;
    }
    const subject = (0, email_immediate_template_1.buildImmediateSubject)(data.eventType, data.payload);
    const html = (0, email_immediate_template_1.buildImmediateHtml)(data.eventType, data.payload);
    await deps.mailService.send({
        to: data.to,
        subject,
        html,
    });
}
async function processDigestEvent(data, deps) {
    const bufferKey = `digest:${data.tenantId}:${data.userId}:${data.requestId}`;
    const existing = await deps.redis.get(bufferKey);
    const events = existing ? JSON.parse(existing) : [];
    events.push({
        eventType: data.eventType,
        payload: data.payload,
        at: new Date().toISOString(),
    });
    if (events.length === 1) {
        await deps.redis.set(bufferKey, JSON.stringify(events), { exSeconds: 300 });
        await deps.digestQueue.add('send-digest', {
            userId: data.userId,
            requestId: data.requestId,
            tenantId: data.tenantId,
            to: data.to,
            bufferKey,
        }, {
            delay: 300_000,
            jobId: `digest-${bufferKey}`,
        });
        return;
    }
    await deps.redis.set(bufferKey, JSON.stringify(events), { keepTtl: true });
}
async function processDigestSend(data, deps) {
    const raw = await deps.redis.get(data.bufferKey);
    if (!raw) {
        return;
    }
    const events = JSON.parse(raw);
    if (!(await canSendEmail(deps.redis, data.userId, data.requestId))) {
        return;
    }
    const subject = (0, email_digest_template_1.buildDigestSubject)(events, data.requestId);
    const html = (0, email_digest_template_1.buildDigestHtml)(events, data.requestId, data.tenantId);
    await deps.mailService.send({
        to: data.to,
        subject,
        html,
    });
    await deps.redis.del(data.bufferKey);
}
async function processEmailDigestWorker(job, deps) {
    if (job.name === 'send-digest') {
        await processDigestSend(job.data, deps);
        return;
    }
    await processDigestEvent(job.data, deps);
}
//# sourceMappingURL=email-dispatch.job.js.map