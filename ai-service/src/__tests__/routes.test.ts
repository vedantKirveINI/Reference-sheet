jest.mock('../db', () => {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };
  return { __esModule: true, default: mockPool };
});

jest.mock('../data-query', () => ({
  getTableSchema: jest.fn().mockResolvedValue([
    { id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name', dbFieldType: 'text', isPrimary: true, options: null },
    { id: 2, name: 'Status', type: 'SCQ', dbFieldName: 'fld_status', dbFieldType: 'text', isPrimary: false, options: null },
  ]),
  getAllAccessibleBases: jest.fn().mockResolvedValue([
    { id: 'base1', name: 'Test Base', tables: [{ id: 'tbl1', name: 'Table1', fields: [{ id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name' }] }] },
  ]),
  queryTableData: jest.fn().mockResolvedValue({ fields: [], records: [{ Name: 'Test' }] }),
  createRecord: jest.fn().mockResolvedValue({ id: 'new_rec' }),
  updateRecord: jest.fn().mockResolvedValue(undefined),
  deleteRecord: jest.fn().mockResolvedValue(undefined),
  summarizeTableData: jest.fn().mockResolvedValue({ results: [{ result: 10 }], summary: 'COUNT: 10' }),
  bulkUpdateRecords: jest.fn().mockResolvedValue({ updatedCount: 5 }),
  bulkDeleteRecords: jest.fn().mockResolvedValue({ deletedCount: 3 }),
}));

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: async function* () {
              yield { choices: [{ delta: { content: 'Hello!' } }] };
            },
          }),
        },
      },
    })),
  };
});

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn().mockReturnValue('mock-id-123'),
}));

import express from 'express';
import request from 'supertest';
import { createRouter } from '../routes';
import pool from '../db';

function makeToken(payload: Record<string, any> = { user_id: 'user1' }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `${header}.${body}.sig`;
}

let app: express.Express;

beforeEach(() => {
  jest.clearAllMocks();
  app = express();
  app.use(express.json());
  app.use('/', createRouter());
});

describe('Auth middleware', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/conversations');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('returns 401 for invalid token format', async () => {
    const res = await request(app)
      .get('/conversations')
      .set('token', 'invalidtoken');
    expect(res.status).toBe(401);
  });

  it('authenticates with valid token', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .get('/conversations')
      .set('token', makeToken());
    expect(res.status).toBe(200);
  });

  it('extracts user_id from token', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'c1', user_id: 'user1', title: 'Test' }] });
    const res = await request(app)
      .get('/conversations')
      .set('token', makeToken({ user_id: 'user1' }));
    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('user_id'),
      ['user1']
    );
  });

  it('supports sub claim for user ID', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .get('/conversations')
      .set('token', makeToken({ sub: 'user_sub' }));
    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['user_sub']);
  });
});

describe('GET /conversations', () => {
  it('returns conversations for the authenticated user', async () => {
    const conversations = [
      { id: 'c1', user_id: 'user1', title: 'Conv 1' },
      { id: 'c2', user_id: 'user1', title: 'Conv 2' },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: conversations });

    const res = await request(app)
      .get('/conversations')
      .set('token', makeToken());

    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(2);
  });

  it('returns 500 on database error', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .get('/conversations')
      .set('token', makeToken());
    expect(res.status).toBe(500);
  });
});

describe('POST /conversations', () => {
  it('creates a new conversation', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 'mock-id-123', user_id: 'user1', title: 'New Conv' }],
    });

    const res = await request(app)
      .post('/conversations')
      .set('token', makeToken())
      .send({ title: 'New Conv', baseId: 'base1', tableId: 'tbl1', viewId: 'view1' });

    expect(res.status).toBe(200);
    expect(res.body.conversation).toBeDefined();
  });

  it('uses default title when not provided', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 'mock-id-123', title: 'New Conversation' }],
    });

    await request(app)
      .post('/conversations')
      .set('token', makeToken())
      .send({});

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT'),
      expect.arrayContaining(['New Conversation'])
    );
  });
});

describe('GET /conversations/:id', () => {
  it('returns conversation with messages', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: 'c1', user_id: 'user1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'm1', role: 'user', content: 'Hello' }] });

    const res = await request(app)
      .get('/conversations/c1')
      .set('token', makeToken());

    expect(res.status).toBe(200);
    expect(res.body.conversation).toBeDefined();
    expect(res.body.messages).toHaveLength(1);
  });

  it('returns 404 for non-existent conversation', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .get('/conversations/nonexistent')
      .set('token', makeToken());
    expect(res.status).toBe(404);
  });
});

describe('DELETE /conversations/:id', () => {
  it('deletes conversation and related data', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }], rowCount: 1 });

    const res = await request(app)
      .delete('/conversations/c1')
      .set('token', makeToken());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM ai_messages'),
      ['c1']
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM ai_approved_contexts'),
      ['c1']
    );
  });

  it('returns 404 if conversation not found', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/conversations/nonexistent')
      .set('token', makeToken());
    expect(res.status).toBe(404);
  });
});

describe('GET /conversations/:id/messages', () => {
  it('returns messages for a conversation', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 'm1', role: 'user', content: 'Hi' },
        { id: 'm2', role: 'assistant', content: 'Hello' },
      ],
    });

    const res = await request(app)
      .get('/conversations/c1/messages')
      .set('token', makeToken());

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(2);
  });
});

describe('POST /conversations/:id/messages/:messageId/feedback', () => {
  it('saves valid feedback', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const res = await request(app)
      .post('/conversations/c1/messages/m1/feedback')
      .set('token', makeToken())
      .send({ feedback: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects invalid feedback value', async () => {
    const res = await request(app)
      .post('/conversations/c1/messages/m1/feedback')
      .set('token', makeToken())
      .send({ feedback: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('rejects missing feedback', async () => {
    const res = await request(app)
      .post('/conversations/c1/messages/m1/feedback')
      .set('token', makeToken())
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /context/bases', () => {
  it('returns all accessible bases', async () => {
    const { getAllAccessibleBases } = require('../data-query');
    const res = await request(app)
      .get('/context/bases')
      .set('token', makeToken());

    expect(res.status).toBe(200);
    expect(res.body.bases).toBeDefined();
    expect(getAllAccessibleBases).toHaveBeenCalled();
  });
});

describe('POST /conversations/:id/approve-context', () => {
  it('approves context for a conversation', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/conversations/c1/approve-context')
      .set('token', makeToken())
      .send({ baseId: 'base2', tableId: 'tbl2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ai_approved_contexts'),
      expect.arrayContaining(['c1', 'base2'])
    );
  });
});

describe('POST /conversations/:id/view-state-response', () => {
  it('accepts view state response', async () => {
    const res = await request(app)
      .post('/conversations/c1/view-state-response')
      .set('token', makeToken())
      .send({ requestId: 'vsr-123', viewState: { filters: {} } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /conversations/:id/chat', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/conversations/c1/chat')
      .set('token', makeToken())
      .send({ content: 'Hello' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Missing required fields');
  });

  it('returns 404 when conversation not found', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/conversations/c1/chat')
      .set('token', makeToken())
      .send({ content: 'Hello', baseId: 'base1', tableId: 'tbl1', viewId: 'view1' });

    expect(res.status).toBe(404);
  });
});
