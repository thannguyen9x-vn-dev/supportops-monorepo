export const DEFAULT_FILE_UPLOAD_CONFIG = {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    maxFiles: 20,
    allowedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
};
