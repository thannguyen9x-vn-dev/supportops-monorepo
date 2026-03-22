"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
function log(level, message, meta) {
    const payload = {
        timestamp: new Date().toISOString(),
        service: 'supportops-worker',
        level,
        message,
        ...(meta ? { meta } : {}),
    };
    if (level === 'ERROR') {
        console.error(JSON.stringify(payload));
        return;
    }
    if (level === 'WARN') {
        console.warn(JSON.stringify(payload));
        return;
    }
    console.log(JSON.stringify(payload));
}
//# sourceMappingURL=logger.js.map