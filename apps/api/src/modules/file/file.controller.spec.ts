import { FileController } from './file.controller';

describe('FileController', () => {
  const service = {
    uploadFiles: jest.fn(),
    deleteFile: jest.fn(),
    getAccessUrl: jest.fn(),
  };

  let controller: FileController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new FileController(service as any);
  });

  it('uploadFiles forwards tenant, user and files to service', async () => {
    service.uploadFiles.mockResolvedValue({ files: [{ id: 'f1' }] });

    const files = [{ originalname: 'a.png' }] as any;
    const result = await controller.uploadFiles('t1', 'u1', files);

    expect(service.uploadFiles).toHaveBeenCalledWith('t1', 'u1', files);
    expect(result.files[0]?.id).toBe('f1');
  });

  it('uploadFiles uses empty list when files is undefined', async () => {
    service.uploadFiles.mockResolvedValue({ files: [] });

    await controller.uploadFiles('t1', 'u1', undefined);

    expect(service.uploadFiles).toHaveBeenCalledWith('t1', 'u1', []);
  });

  it('deleteFile delegates to service', async () => {
    await controller.deleteFile('t1', 'f1');
    expect(service.deleteFile).toHaveBeenCalledWith('t1', 'f1');
  });

  it('getAccessUrl applies default expiry when omitted', () => {
    service.getAccessUrl.mockReturnValue({ url: 'signed', expiresAt: 'x' });

    controller.getAccessUrl('http://files/x', undefined);

    expect(service.getAccessUrl).toHaveBeenCalledWith('http://files/x', 300);
  });
});
