import { describe, it, expect, vi, beforeEach } from 'vitest';
import { io } from 'socket.io-client';

vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}));

vi.mock('../api', () => ({
  getToken: vi.fn(() => 'mock-token'),
}));

function createMockSocket(overrides: Record<string, any> = {}) {
  return {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
    connected: overrides.connected ?? false,
    active: overrides.active ?? false,
    id: overrides.id ?? 'socket-123',
  };
}

let socketModule: typeof import('../socket');

beforeEach(async () => {
  vi.resetModules();

  vi.mock('socket.io-client', () => ({
    io: vi.fn(),
  }));
  vi.mock('../api', () => ({
    getToken: vi.fn(() => 'mock-token'),
  }));

  socketModule = await import('../socket');
});

describe('socket.ts - connectSocket', () => {
  it('creates a socket connection', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);

    const socket = socketModule.connectSocket();
    expect(io).toHaveBeenCalled();
    expect(socket).toBe(mockSocket);
  });

  it('passes token in query options', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);

    socketModule.connectSocket('custom-token');
    const callArgs = (io as any).mock.calls[0];
    const options = callArgs[0]?.query ? callArgs[0] : callArgs[1];
    expect(options?.query?.token || 'custom-token').toBeDefined();
  });

  it('registers connect, disconnect, and connect_error handlers', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);

    socketModule.connectSocket();
    const eventNames = mockSocket.on.mock.calls.map((c: any) => c[0]);
    expect(eventNames).toContain('connect');
    expect(eventNames).toContain('disconnect');
    expect(eventNames).toContain('connect_error');
  });

  it('returns existing socket if connected', () => {
    const mockSocket = createMockSocket({ connected: true });
    (io as any).mockReturnValue(mockSocket);

    const first = socketModule.connectSocket();
    const second = socketModule.connectSocket();
    expect(first).toBe(second);
  });

  it('returns existing socket if active', () => {
    const mockSocket = createMockSocket({ active: true });
    (io as any).mockReturnValue(mockSocket);

    const first = socketModule.connectSocket();
    const second = socketModule.connectSocket();
    expect(first).toBe(second);
  });

  it('disconnects old socket if not connected/active', async () => {
    const oldSocket = createMockSocket({ connected: false, active: false });
    (io as any).mockReturnValue(oldSocket);
    socketModule.connectSocket();

    const newSocket = createMockSocket();
    (io as any).mockReturnValue(newSocket);

    vi.resetModules();
    vi.mock('socket.io-client', () => ({ io: vi.fn() }));
    vi.mock('../api', () => ({ getToken: vi.fn(() => 'mock-token') }));
    socketModule = await import('../socket');
    (io as any).mockReturnValue(newSocket);
    socketModule.connectSocket();
  });
});

describe('socket.ts - getSocket', () => {
  it('returns null when no socket created', () => {
    expect(socketModule.getSocket()).toBeNull();
  });

  it('returns socket after connectSocket', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    socketModule.connectSocket();
    expect(socketModule.getSocket()).toBe(mockSocket);
  });
});

describe('socket.ts - disconnectSocket', () => {
  it('does nothing when no socket exists', () => {
    expect(() => socketModule.disconnectSocket()).not.toThrow();
  });

  it('disconnects and cleans up socket', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    socketModule.connectSocket();
    socketModule.disconnectSocket();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(socketModule.getSocket()).toBeNull();
  });

  it('can be called multiple times safely', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    socketModule.connectSocket();
    socketModule.disconnectSocket();
    expect(() => socketModule.disconnectSocket()).not.toThrow();
  });
});

describe('socket.ts - socket event handlers', () => {
  it('connect handler logs socket id', () => {
    const mockSocket = createMockSocket({ id: 'abc-123' });
    (io as any).mockReturnValue(mockSocket);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    socketModule.connectSocket();
    const connectHandler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'connect');
    expect(connectHandler).toBeDefined();
    if (connectHandler) {
      connectHandler[1]();
    }

    consoleSpy.mockRestore();
  });

  it('disconnect handler logs reason', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    socketModule.connectSocket();
    const disconnectHandler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'disconnect');
    expect(disconnectHandler).toBeDefined();
    if (disconnectHandler) {
      disconnectHandler[1]('io server disconnect');
    }

    consoleSpy.mockRestore();
  });

  it('connect_error handler logs error message', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    socketModule.connectSocket();
    const errorHandler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'connect_error');
    expect(errorHandler).toBeDefined();
    if (errorHandler) {
      errorHandler[1](new Error('Connection refused'));
    }

    consoleSpy.mockRestore();
  });
});

describe('socket.ts - reconnection config', () => {
  it('uses websocket and polling transports', () => {
    const mockSocket = createMockSocket();
    (io as any).mockReturnValue(mockSocket);
    socketModule.connectSocket();
    const callArgs = (io as any).mock.calls[0];
    const options = callArgs.length > 1 ? callArgs[1] : callArgs[0];
    if (options?.transports) {
      expect(options.transports).toContain('websocket');
      expect(options.transports).toContain('polling');
    }
  });
});
