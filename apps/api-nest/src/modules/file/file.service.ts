import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { FileAccessUrlResponseDto } from './dto/file-access-url-response.dto';

@Injectable()
export class FileService {
  private static readonly MIN_EXPIRES_SECONDS = 60;
  private static readonly MAX_EXPIRES_SECONDS = 3600;

  constructor(private readonly objectStorageService: ObjectStorageService) {}

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
