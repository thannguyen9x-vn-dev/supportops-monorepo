import { NEVER } from 'rxjs';
import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  const service = {
    findAll: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    getUnreadCount: jest.fn(),
    streamForUser: jest.fn(),
  };

  let controller: NotificationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new NotificationController(service as any);
  });

  it('delegates list and read operations', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });
    service.markRead.mockResolvedValue({ id: 'n1', isRead: true });
    service.markAllRead.mockResolvedValue({ count: 1 });

    await controller.findAll('t1', 'u1', { page: 1, size: 20 });
    await controller.markRead('t1', 'u1', 'n1');
    await controller.markAllRead('t1', 'u1');

    expect(service.findAll).toHaveBeenCalledWith('t1', 'u1', { page: 1, size: 20 });
    expect(service.markRead).toHaveBeenCalledWith('t1', 'u1', 'n1');
    expect(service.markAllRead).toHaveBeenCalledWith('t1', 'u1');
  });

  it('delegates unread count and stream operations', async () => {
    service.getUnreadCount.mockResolvedValue(3);
    service.streamForUser.mockReturnValue(NEVER);

    await expect(controller.getUnreadCount('t1', 'u1')).resolves.toEqual({ count: 3 });
    expect(controller.stream('t1', 'u1')).toBe(NEVER);
    expect(service.streamForUser).toHaveBeenCalledWith('t1', 'u1');
  });
});
