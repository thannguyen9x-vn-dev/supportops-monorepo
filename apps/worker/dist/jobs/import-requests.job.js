"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImportRequestsJob = processImportRequestsJob;
const client_1 = require("@prisma/client");
const sync_1 = require("csv-parse/sync");
const exceljs_1 = __importDefault(require("exceljs"));
const IMPORT_PREVIEW_TTL_SECONDS = 3600;
const PRIORITY_SET = new Set([
    client_1.RequestPriority.LOW,
    client_1.RequestPriority.MEDIUM,
    client_1.RequestPriority.HIGH,
    client_1.RequestPriority.URGENT,
]);
const PREVIEW_KEY_PREFIX = 'import:preview:';
const STATUS_KEY_PREFIX = 'import:status:';
async function processImportRequestsJob(data, deps) {
    await setJobStatus(deps.redis, data.jobId, 'processing');
    try {
        if (data.phase === 1) {
            await processPhase1(data, deps);
            return;
        }
        await processPhase2(data, deps);
    }
    catch (error) {
        await setJobStatus(deps.redis, data.jobId, 'failed', toErrorMessage(error));
        throw error;
    }
}
async function processPhase1(data, deps) {
    const fileContent = await deps.minioClient.getObject(data.fileKey);
    const rows = await parseImportRows(fileContent, data.mimeType);
    const { preview } = await buildPreview(rows, data.tenantId, data.userId, deps.prisma);
    const payload = { rows, preview };
    const previewKey = `${PREVIEW_KEY_PREFIX}${data.jobId}`;
    await deps.redis.set(previewKey, JSON.stringify(payload), { exSeconds: IMPORT_PREVIEW_TTL_SECONDS });
    await setJobStatus(deps.redis, data.jobId, 'preview_ready');
}
async function processPhase2(data, deps) {
    const previewKey = `${PREVIEW_KEY_PREFIX}${data.jobId}`;
    const rawPreview = await deps.redis.get(previewKey);
    if (!rawPreview) {
        throw new Error('Import preview has expired. Please upload the file again.');
    }
    const parsedCache = JSON.parse(rawPreview);
    const errorRows = new Set(parsedCache.preview.errorRows.map((item) => item.row));
    const skipRows = new Set(data.skipRowIndices);
    const selectedRows = parsedCache.rows.filter((row) => !errorRows.has(row.rowIndex) && !skipRows.has(row.rowIndex));
    const selectedServiceTypeCodes = [...new Set(selectedRows.map((row) => row.serviceTypeCode))];
    const selectedReporterEmails = [
        ...new Set(selectedRows
            .map((row) => row.reporterEmail)
            .filter((email) => typeof email === 'string' && email.length > 0)),
    ];
    const [serviceTypes, reporters] = await Promise.all([
        selectedServiceTypeCodes.length > 0
            ? deps.prisma.serviceType.findMany({
                where: {
                    tenantId: data.tenantId,
                    code: { in: selectedServiceTypeCodes },
                    isActive: true,
                },
                select: { id: true, code: true },
            })
            : Promise.resolve([]),
        selectedReporterEmails.length > 0
            ? deps.prisma.user.findMany({
                where: {
                    tenantId: data.tenantId,
                    email: { in: selectedReporterEmails },
                    status: client_1.UserStatus.ACTIVE,
                },
                select: { id: true, email: true },
            })
            : Promise.resolve([]),
    ]);
    const serviceTypeMap = new Map(serviceTypes.map((item) => [item.code, item.id]));
    const reporterMap = new Map(reporters.map((item) => [item.email.toLowerCase(), item.id]));
    const additionalErrors = [];
    const createInputs = [];
    for (const row of selectedRows) {
        const serviceTypeId = serviceTypeMap.get(row.serviceTypeCode);
        if (!serviceTypeId) {
            additionalErrors.push({
                row: row.rowIndex,
                field: 'serviceTypeCode',
                message: `serviceTypeCode '${row.serviceTypeCode}' does not exist in tenant`,
            });
            continue;
        }
        const reporterId = row.reporterEmail ? reporterMap.get(row.reporterEmail.toLowerCase()) : data.userId;
        if (!reporterId) {
            additionalErrors.push({
                row: row.rowIndex,
                field: 'reporterEmail',
                message: `reporterEmail '${row.reporterEmail}' is not a member of this tenant`,
            });
            continue;
        }
        createInputs.push({
            tenantId: data.tenantId,
            title: row.title,
            description: row.description ?? '',
            serviceTypeId,
            priority: row.priority ?? client_1.RequestPriority.MEDIUM,
            locationId: row.locationId,
            requesterId: reporterId,
            status: client_1.RequestStatus.SUBMITTED,
            sourceChannel: client_1.SourceChannel.API,
        });
    }
    if (createInputs.length > 0) {
        await deps.prisma.$transaction(async (tx) => {
            await Promise.all(createInputs.map((input) => tx.serviceRequest.create({
                data: input,
            })));
            return true;
        });
    }
    const allErrors = [...parsedCache.preview.errorRows, ...additionalErrors];
    const totalRows = parsedCache.rows.length;
    const created = createInputs.length;
    const failed = totalRows - created;
    await deps.prisma.auditLog.create({
        data: {
            tenantId: data.tenantId,
            entityType: 'BulkImportJob',
            entityId: data.jobId,
            action: 'BULK_IMPORT_COMPLETED',
            actorId: data.userId,
            afterData: {
                totalRows,
                created,
                failed,
                errors: allErrors,
            },
        },
    });
    await deps.prisma.notification.create({
        data: {
            tenantId: data.tenantId,
            userId: data.userId,
            type: client_1.NotificationEventType.BULK_IMPORT_COMPLETED,
            title: 'Import hoàn tất',
            body: `${created} requests đã được tạo, ${failed} lỗi.`,
            metadata: { jobId: data.jobId, created, failed },
        },
    });
    await deps.minioClient.removeObject(data.fileKey);
    await deps.redis.del(previewKey);
    await setJobStatus(deps.redis, data.jobId, 'completed');
}
async function buildPreview(rows, tenantId, importingUserId, prisma) {
    const errorRows = [];
    const errorMap = new Map();
    const pushError = (error) => {
        errorRows.push(error);
        const existing = errorMap.get(error.row) ?? [];
        existing.push(error);
        errorMap.set(error.row, existing);
    };
    for (const row of rows) {
        if (!row.title) {
            pushError({ row: row.rowIndex, field: 'title', message: 'Title is required' });
        }
        if (!row.serviceTypeCode) {
            pushError({ row: row.rowIndex, field: 'serviceTypeCode', message: 'serviceTypeCode is required' });
        }
        if (!row.locationId) {
            pushError({ row: row.rowIndex, field: 'locationId', message: 'locationId is required' });
        }
        if (!row.priority) {
            pushError({
                row: row.rowIndex,
                field: 'priority',
                message: "priority must be one of 'LOW', 'MEDIUM', 'HIGH', 'URGENT'",
            });
        }
    }
    const nonEmptyCodes = [...new Set(rows.map((row) => row.serviceTypeCode).filter((code) => code.length > 0))];
    const nonEmptyEmails = [
        ...new Set(rows.map((row) => row.reporterEmail).filter((email) => typeof email === 'string' && email.length > 0)),
    ];
    const [serviceTypes, reporters] = await Promise.all([
        nonEmptyCodes.length > 0
            ? prisma.serviceType.findMany({
                where: { tenantId, code: { in: nonEmptyCodes }, isActive: true },
                select: { id: true, code: true },
            })
            : Promise.resolve([]),
        nonEmptyEmails.length > 0
            ? prisma.user.findMany({
                where: { tenantId, email: { in: nonEmptyEmails }, status: client_1.UserStatus.ACTIVE },
                select: { id: true, email: true },
            })
            : Promise.resolve([]),
    ]);
    const serviceTypeMap = new Map(serviceTypes.map((item) => [item.code, item.id]));
    const reporterMap = new Map(reporters.map((item) => [item.email.toLowerCase(), item.id]));
    for (const row of rows) {
        if (row.serviceTypeCode && !serviceTypeMap.has(row.serviceTypeCode)) {
            pushError({
                row: row.rowIndex,
                field: 'serviceTypeCode',
                message: `serviceTypeCode '${row.serviceTypeCode}' does not exist in tenant`,
            });
        }
        if (row.reporterEmail && !reporterMap.has(row.reporterEmail.toLowerCase())) {
            pushError({
                row: row.rowIndex,
                field: 'reporterEmail',
                message: `reporterEmail '${row.reporterEmail}' is not a member of this tenant`,
            });
        }
    }
    const seenDuplicateKeys = new Set();
    const firstRowByKey = new Map();
    for (const row of rows) {
        const key = buildDuplicateKey(row.title, row.serviceTypeCode, row.reporterEmail ?? '');
        if (!key) {
            continue;
        }
        const firstIndex = firstRowByKey.get(key);
        if (typeof firstIndex === 'number') {
            if (!seenDuplicateKeys.has(`${key}:${row.rowIndex}`)) {
                pushError({
                    row: row.rowIndex,
                    field: 'title',
                    message: 'Duplicate row within this file',
                });
                seenDuplicateKeys.add(`${key}:${row.rowIndex}`);
            }
            continue;
        }
        firstRowByKey.set(key, row.rowIndex);
    }
    const validRows = rows.filter((row) => !errorMap.has(row.rowIndex));
    const validTitles = [...new Set(validRows.map((row) => row.title))];
    const warningRows = [];
    if (validTitles.length > 0) {
        const recentRequests = await prisma.serviceRequest.findMany({
            where: {
                tenantId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                title: { in: validTitles },
            },
            select: { title: true, serviceTypeId: true, requesterId: true },
        });
        const recentKeySet = new Set(recentRequests.map((item) => buildDuplicateKey(item.title, item.serviceTypeId, item.requesterId)));
        for (const row of validRows) {
            const serviceTypeId = serviceTypeMap.get(row.serviceTypeCode);
            const requesterId = row.reporterEmail ? reporterMap.get(row.reporterEmail.toLowerCase()) : importingUserId;
            if (!serviceTypeId || !requesterId) {
                continue;
            }
            const key = buildDuplicateKey(row.title, serviceTypeId, requesterId);
            if (key && recentKeySet.has(key)) {
                warningRows.push({
                    row: row.rowIndex,
                    type: 'duplicate_recent',
                    message: 'Similar request created in the last 24 hours',
                });
            }
        }
    }
    return {
        preview: {
            totalRows: rows.length,
            validRows: validRows.length,
            errorRows,
            warningRows,
        },
    };
}
async function parseImportRows(fileContent, mimeType) {
    if (isCsvMimeType(mimeType)) {
        return parseCsvRows(fileContent);
    }
    if (isExcelMimeType(mimeType)) {
        return parseExcelRows(fileContent);
    }
    throw new Error(`Unsupported mimeType: ${mimeType}`);
}
function parseCsvRows(fileContent) {
    const records = (0, sync_1.parse)(fileContent.toString('utf8'), {
        bom: true,
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    return records.map((record, index) => toParsedRow(record, index));
}
async function parseExcelRows(fileContent) {
    const workbook = new exceljs_1.default.Workbook();
    const loadInput = Buffer.from(fileContent);
    await workbook.xlsx.load(loadInput);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        return [];
    }
    const headerRow = worksheet.getRow(1);
    const headerMap = new Map();
    headerRow.eachCell((cell, colNumber) => {
        const value = normalizeCellValue(cell.value);
        headerMap.set(colNumber, value);
    });
    const rows = [];
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const sheetRow = worksheet.getRow(rowNumber);
        const rowRecord = {};
        sheetRow.eachCell((cell, colNumber) => {
            const header = headerMap.get(colNumber);
            if (!header) {
                return;
            }
            rowRecord[header] = normalizeCellValue(cell.value);
        });
        const parsedRow = toParsedRow(rowRecord, rowNumber - 2);
        if (isRowCompletelyEmpty(parsedRow)) {
            continue;
        }
        rows.push(parsedRow);
    }
    return rows;
}
function normalizeCellValue(value) {
    if (value === null || typeof value === 'undefined') {
        return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value).trim();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
        return value.text.trim();
    }
    return String(value).trim();
}
function toParsedRow(record, rowIndex) {
    const title = (record.title ?? record.Title ?? '').trim();
    const description = (record.description ?? record.Description ?? '').trim();
    const serviceTypeCode = (record.serviceTypeCode ?? record.ServiceTypeCode ?? '').trim();
    const rawPriority = (record.priority ?? record.Priority ?? '').trim().toUpperCase();
    const locationId = (record.locationId ?? record.LocationId ?? '').trim();
    const reporterEmail = (record.reporterEmail ?? record.ReporterEmail ?? '').trim();
    return {
        rowIndex,
        title,
        description: description.length > 0 ? description : undefined,
        serviceTypeCode,
        priority: parsePriority(rawPriority),
        locationId,
        reporterEmail: reporterEmail.length > 0 ? reporterEmail : undefined,
    };
}
function parsePriority(value) {
    if (!value) {
        return null;
    }
    return PRIORITY_SET.has(value) ? value : null;
}
function isCsvMimeType(mimeType) {
    const normalized = mimeType.toLowerCase();
    return normalized.includes('csv') || normalized === 'text/plain';
}
function isExcelMimeType(mimeType) {
    const normalized = mimeType.toLowerCase();
    return normalized.includes('spreadsheetml') || normalized.includes('excel');
}
function isRowCompletelyEmpty(row) {
    return (row.title.length === 0 &&
        row.serviceTypeCode.length === 0 &&
        row.locationId.length === 0 &&
        !row.priority &&
        (!row.description || row.description.length === 0) &&
        (!row.reporterEmail || row.reporterEmail.length === 0));
}
function buildDuplicateKey(part1, part2, part3) {
    const p1 = part1.trim().toLowerCase();
    const p2 = part2.trim().toLowerCase();
    const p3 = part3.trim().toLowerCase();
    if (!p1 || !p2) {
        return '';
    }
    return `${p1}::${p2}::${p3}`;
}
async function setJobStatus(redis, jobId, status, error) {
    const statusKey = `${STATUS_KEY_PREFIX}${jobId}`;
    const payload = JSON.stringify({
        status,
        ...(error ? { error } : {}),
        updatedAt: new Date().toISOString(),
    });
    await redis.set(statusKey, payload, { exSeconds: IMPORT_PREVIEW_TTL_SECONDS });
}
function toErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
//# sourceMappingURL=import-requests.job.js.map