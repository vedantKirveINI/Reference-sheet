import { SocketAuthMiddleware } from '../ws.middleware';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';

jest.mock('../../auth/ws-jwt.guard');

describe('SocketAuthMiddleware', () => {
  let middleware: ReturnType<typeof SocketAuthMiddleware>;

  beforeEach(() => {
    middleware = SocketAuthMiddleware();
    jest.clearAllMocks();
  });

  it('should call next on successful token validation', () => {
    const client = { handshake: { query: { token: 'valid' } }, data: {} };
    const next = jest.fn();

    (WsJwtGuard.validateToken as jest.Mock).mockReturnValue({
      decoded: { sub: 'u1' },
      user_id: 'u1',
    });
    (WsJwtGuard.mergeDataInClientData as jest.Mock).mockImplementation(
      () => {},
    );

    middleware(client, next);

    expect(WsJwtGuard.validateToken).toHaveBeenCalledWith(client);
    expect(WsJwtGuard.mergeDataInClientData).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with error on failed token validation', () => {
    const client = { handshake: { query: {} }, data: {} };
    const next = jest.fn();
    const error = new Error('No token provided');

    (WsJwtGuard.validateToken as jest.Mock).mockImplementation(() => {
      throw error;
    });

    middleware(client, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
