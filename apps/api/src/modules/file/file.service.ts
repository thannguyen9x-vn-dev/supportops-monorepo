import { Injectable, PayloadTooLargeException, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { PrismaService } from '../../prisma/prisma.service';
import { FileAccessUrlResponseDto } from './dto/file-access-url-response.dto';
import { UploadedFileDto, UploadFilesResponseDto } from './dto/upload-files-response.dto';

@Injectable()
export class FileService {
  private static readonly MIN_EXPIRES_SECONDS = 60;
  private static readonly MAX_EXPIRES_SECONDS = 3600;

  constructor(
    private readonly objectStorageService: ObjectStorageService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async uploadFiles(
    tenantId: string,
    userId: string,
    files: UploadedBinaryFile[],
  ): Promise<UploadFilesResponseDto> {
    if (files.length === 0) {
      throw new UnprocessableEntityException('At least one file is required');
    }

    const uploader = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
      select: { id: true },
    });
    if (!uploader) {
      throw new UnprocessableEntityException('Uploader is not active in current tenant');
    }

    const maxFiles = this.configService.get<number>('file.upload.maxFilesPerUpload', 20);
    const maxSize = this.configService.get<number>('file.upload.maxFileSizeBytes', 10485760);
    const allowedMimeTypes = this.configService.get<string[]>('file.upload.allowedMimeTypes', []);

    if (files.length > maxFiles) {
      throw new UnprocessableEntityException(`Maximum ${maxFiles} files allowed per upload`);
    }

    const uploadedFiles: UploadedFileDto[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > maxSize) {
        throw new PayloadTooLargeException(
          `File "${file.originalname}" exceeds maximum size of ${maxSize} bytes`,
        );
      }

      // Validate MIME type
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
        throw new UnprocessableEntityException(
          `File "${file.originalname}" has unsupported type "${file.mimetype}". Allowed types: ${allowedMimeTypes.join(', ')}`,
        );
      }

      // Generate unique object key
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectKey = `uploads/${tenantId}/${timestamp}-${randomStr}-${sanitizedName}`;

      // Upload to storage
      const fileUrl = await this.objectStorageService.uploadPublicObject(objectKey, file.buffer);

      // Save to database
      let uploadedFile: {
        id: string;
        fileName: string;
        fileUrl: string;
        mimeType: string;
        sizeBytes: number;
        createdAt: Date;
      };
      try {
        uploadedFile = await this.prisma.uploadedFile.create({
          data: {
            tenantId,
            uploadedById: userId,
            fileName: file.originalname,
            fileUrl,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientInitializationError) {
          throw new ServiceUnavailableException('Database is unavailable');
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new UnprocessableEntityException('Invalid uploader or attachment relationship');
          }
          if (error.code === 'P2021') {
            throw new ServiceUnavailableException('Database schema is not ready for file upload');
          }
        }
        throw error;
      }

      uploadedFiles.push({
        id: uploadedFile.id,
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        mimeType: uploadedFile.mimeType,
        sizeBytes: uploadedFile.sizeBytes,
        uploadedAt: uploadedFile.createdAt.toISOString(),
      });
    }

    return { files: uploadedFiles };
  }

  async deleteFile(tenantId: string, fileId: string): Promise<void> {
    const file = await this.prisma.uploadedFile.findFirst({
      where: { id: fileId, tenantId },
    });

    if (!file) {
      throw new UnprocessableEntityException('File not found');
    }

    // Delete from storage
    await this.objectStorageService.deleteObjectByUrl(file.fileUrl);

    // Delete from database
    await this.prisma.uploadedFile.delete({
      where: { id: fileId },
    });
  }

  getAccessUrl(url: string, expiresInSeconds = 300): FileAccessUrlResponseDto {
    if (!url?.trim()) {
      throw new UnprocessableEntityException('url is required');
    }

    if (
      expiresInSeconds < FileService.MIN_EXPIRES_SECONDS ||
      expiresInSeconds > FileService.MAX_EXPIRES_SECONDS
    ) {
      throw new UnprocessableEntityException('expiresInSeconds must be between 60 and 3600');
    }

    const signedUrl = this.objectStorageService.createTemporaryReadUrlFromUrl(url, expiresInSeconds);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    return {
      url: signedUrl,
      expiresAt,
    };
  }
}
