import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should call $connect on module init', async () => {
    const connectMock = jest.fn().mockResolvedValue(undefined);
    const service = {
      $connect: connectMock,
      onModuleInit: PrismaService.prototype.onModuleInit,
    } as unknown as PrismaService;

    await service.onModuleInit();
    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});
