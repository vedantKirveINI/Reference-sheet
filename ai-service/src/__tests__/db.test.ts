describe('db module', () => {
  let originalPool: any;
  let Pool: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    Pool = jest.fn(() => ({
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
    }));
    jest.doMock('pg', () => ({ Pool }));
  });

  it('creates a Pool with expected configuration', () => {
    require('../db');
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })
    );
  });

  it('registers an error handler on the pool', () => {
    const pool = require('../db').default;
    expect(pool.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('exports a pool instance as default', () => {
    const pool = require('../db').default;
    expect(pool).toBeDefined();
    expect(pool.query).toBeDefined();
  });

  it('error handler logs to console.error', () => {
    const pool = require('../db').default;
    const errorHandler = pool.on.mock.calls.find((c: any[]) => c[0] === 'error')?.[1];
    expect(errorHandler).toBeDefined();
    const spy = jest.spyOn(console, 'error').mockImplementation();
    errorHandler(new Error('test'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
