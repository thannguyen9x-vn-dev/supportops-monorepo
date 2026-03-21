import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  upload: {
    maxFileSizeBytes: Number.parseInt(process.env.FILE_UPLOAD_MAX_SIZE_BYTES ?? '10485760', 10), // 10MB
    maxFilesPerUpload: Number.parseInt(process.env.FILE_UPLOAD_MAX_FILES ?? '20', 10),
    allowedMimeTypes: (process.env.FILE_UPLOAD_ALLOWED_MIME_TYPES ??
      'image/png,image/jpeg,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).split(',').map(type => type.trim()),
  },
}));
