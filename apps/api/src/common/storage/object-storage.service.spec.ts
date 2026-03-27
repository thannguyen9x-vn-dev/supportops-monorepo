import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { ObjectStorageService } from './object-storage.service';

describe('ObjectStorageService', () => {
  let configService: { get: jest.Mock };
  let service: ObjectStorageService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'app.fileSigningSecret') return 'test-secret';
        if (key === 'app.filePublicBaseUrl') return 'http://localhost:8081/storage';
        if (key === 'app.port') return 8081;
        return defaultValue;
      }),
    };

    service = new ObjectStorageService(configService as unknown as ConfigService);
  });

  it('createTemporaryReadUrlFromUrl appends signature query params', () => {
    const expiresInSeconds = 120;
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const result = service.createTemporaryReadUrlFromUrl('http://localhost:8081/storage/uploads/a.txt', expiresInSeconds);

    const expires = Math.floor(now / 1000) + expiresInSeconds;
    const signature = createHmac('sha256', 'test-secret')
      .update(`http://localhost:8081/storage/uploads/a.txt|${expires}`)
      .digest('hex');

    expect(result).toContain(`expires=${expires}`);
    expect(result).toContain(`sig=${signature}`);
  });

  it('createTemporaryReadUrlFromUrl uses & when url already has query', () => {
    const result = service.createTemporaryReadUrlFromUrl('http://localhost:8081/storage/uploads/a.txt?download=1', 60);
    expect(result).toContain('&expires=');
    expect(result).toContain('&sig=');
  });
});
