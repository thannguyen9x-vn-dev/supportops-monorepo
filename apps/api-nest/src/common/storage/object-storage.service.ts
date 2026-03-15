import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { URL } from 'url';

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly rootDir = join(process.cwd(), 'storage');

  constructor(private readonly configService: ConfigService) {}

  async uploadPublicObject(objectKey: string, content: Buffer): Promise<string> {
    const normalizedKey = this.normalizeObjectKey(objectKey);
    const targetPath = join(this.rootDir, normalizedKey);

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content);

    const publicBaseUrl = this.getPublicBaseUrl();
    return `${publicBaseUrl}/${normalizedKey}`;
  }

  async deleteObjectByUrl(url: string | null | undefined): Promise<void> {
    if (!url) {
      return;
    }

    const objectKey = this.tryExtractObjectKey(url);
    if (!objectKey) {
      return;
    }

    const targetPath = join(this.rootDir, objectKey);
    try {
      await unlink(targetPath);
    } catch {
      this.logger.debug(`Skip deleting missing object: ${objectKey}`);
    }
  }

  createTemporaryReadUrlFromUrl(url: string, expiresInSeconds: number): string {
    const expiresAtEpoch = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signingSecret = this.configService.get<string>('app.fileSigningSecret', 'supportops-dev-signing-secret');
    const signature = createHmac('sha256', signingSecret)
      .update(`${url}|${expiresAtEpoch}`)
      .digest('hex');

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}expires=${expiresAtEpoch}&sig=${signature}`;
  }

  private getPublicBaseUrl(): string {
    const baseUrl = this.configService.get<string>('app.filePublicBaseUrl');
    if (baseUrl && baseUrl.trim().length > 0) {
      return baseUrl.replace(/\/$/, '');
    }

    const port = this.configService.get<number>('app.port', 8081);
    return `http://localhost:${port}/storage`;
  }

  private tryExtractObjectKey(rawUrl: string): string | null {
    try {
      const parsed = new URL(rawUrl);
      const prefix = new URL(this.getPublicBaseUrl()).pathname.replace(/\/$/, '') + '/';
      if (!parsed.pathname.startsWith(prefix)) {
        return null;
      }

      return this.normalizeObjectKey(decodeURIComponent(parsed.pathname.slice(prefix.length)));
    } catch {
      return null;
    }
  }

  private normalizeObjectKey(objectKey: string): string {
    return objectKey
      .replace(/^\/+/, '')
      .replace(/\.\.+/g, '')
      .replace(/\\/g, '/');
  }
}
