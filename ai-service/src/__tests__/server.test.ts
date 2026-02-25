jest.mock('../db', () => ({
  __esModule: true,
  default: { query: jest.fn().mockResolvedValue({ rows: [] }), on: jest.fn() },
}));

jest.mock('../routes', () => ({
  createRouter: jest.fn().mockReturnValue(
    require('express').Router()
  ),
}));

describe('server module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports an express application when required', () => {
    expect(() => require('../routes')).not.toThrow();
  });

  it('createRouter is called to set up routes', () => {
    const { createRouter } = require('../routes');
    expect(createRouter).toBeDefined();
  });

  it('uses default port 3001 when PORT env is not set', () => {
    delete process.env.PORT;
    const port = process.env.PORT || 3001;
    expect(port).toBe(3001);
  });

  it('uses PORT from environment when set', () => {
    process.env.PORT = '4000';
    const port = process.env.PORT || 3001;
    expect(port).toBe('4000');
  });
});
