import { createHash } from 'crypto';
import { UserController } from './user.controller';

describe('UserController', () => {
  const service = {
    getMe: jest.fn(),
    listTenantUsers: jest.fn(),
    updateMe: jest.fn(),
    changePassword: jest.fn(),
    getPreferences: jest.fn(),
    listMySessions: jest.fn(),
    revokeMySession: jest.fn(),
    updatePreferences: jest.fn(),
    uploadAvatar: jest.fn(),
    updateTenantUserRole: jest.fn(),
    updateTenantUserDepartment: jest.fn(),
    inviteTenantUser: jest.fn(),
    deactivateTenantUser: jest.fn(),
    reactivateTenantUser: jest.fn(),
  };

  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(service as any);
  });

  it('getMe delegates to service', async () => {
    service.getMe.mockResolvedValue({ id: 'u1' });

    await controller.getMe('t1', 'u1');

    expect(service.getMe).toHaveBeenCalledWith('t1', 'u1');
  });

  it('listMySessions hashes refresh token from cookie', async () => {
    service.listMySessions.mockResolvedValue([]);

    await controller.listMySessions('t1', 'u1', { headers: { cookie: 'supportops_refresh_token=abc' } } as any);

    const expectedHash = createHash('sha256').update('abc').digest('hex');
    expect(service.listMySessions).toHaveBeenCalledWith('t1', 'u1', expectedHash);
  });

  it('revokeMySession clears cookies when current session is revoked', async () => {
    service.revokeMySession.mockResolvedValue({ revokedCurrent: true });
    const response = { clearCookie: jest.fn() };

    await controller.revokeMySession(
      't1',
      'u1',
      'session-1',
      { headers: { cookie: 'supportops_refresh_token=abc' } } as any,
      response as any,
    );

    expect(service.revokeMySession).toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledTimes(3);
  });

  it('changePasswordAlias calls same service method as changePassword', async () => {
    await controller.changePasswordAlias('t1', 'u1', { currentPassword: 'x', newPassword: 'y', confirmPassword: 'y' });
    expect(service.changePassword).toHaveBeenCalledWith('t1', 'u1', { currentPassword: 'x', newPassword: 'y', confirmPassword: 'y' });
  });
});
