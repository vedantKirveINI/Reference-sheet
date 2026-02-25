import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

let aiApi: typeof import('../ai-api');

beforeEach(async () => {
  vi.resetModules();
  mockFetch.mockReset();
  (window as any).accessToken = 'test-token';
  aiApi = await import('../ai-api');
});

afterEach(() => {
  (window as any).accessToken = undefined;
});

function mockJsonResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

function mockErrorResponse(status: number) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'Error' }),
  });
}

describe('ai-api.ts - listConversations', () => {
  it('fetches conversations from /ai-api/conversations', async () => {
    const conversations = [
      { id: 'conv-1', user_id: 'u1', title: 'Test', current_base_id: null, current_table_id: null, current_view_id: null, created_at: '2025-01-01', updated_at: '2025-01-01' },
    ];
    mockFetch.mockReturnValue(mockJsonResponse({ conversations }));
    const result = await aiApi.listConversations();
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations', expect.objectContaining({
      headers: expect.objectContaining({ 'Content-Type': 'application/json', token: 'test-token' }),
    }));
    expect(result).toEqual(conversations);
  });

  it('returns empty array when no conversations', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    const result = await aiApi.listConversations();
    expect(result).toEqual([]);
  });

  it('throws on error response', async () => {
    mockFetch.mockReturnValue(mockErrorResponse(500));
    await expect(aiApi.listConversations()).rejects.toThrow('AI API error: 500');
  });
});

describe('ai-api.ts - createConversation', () => {
  it('creates a conversation via POST', async () => {
    const conversation = { id: 'conv-2', user_id: 'u1', title: 'New Chat', current_base_id: 'base-1', current_table_id: null, current_view_id: null, created_at: '2025-01-01', updated_at: '2025-01-01' };
    mockFetch.mockReturnValue(mockJsonResponse({ conversation }));
    const result = await aiApi.createConversation({ title: 'New Chat', baseId: 'base-1' });
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New Chat', baseId: 'base-1' }),
    }));
    expect(result).toEqual(conversation);
  });

  it('throws on 400 error', async () => {
    mockFetch.mockReturnValue(mockErrorResponse(400));
    await expect(aiApi.createConversation({ title: 'Bad' })).rejects.toThrow('AI API error: 400');
  });
});

describe('ai-api.ts - getConversation', () => {
  it('fetches a specific conversation', async () => {
    const data = { conversation: { id: 'conv-1' }, messages: [{ id: 'msg-1', role: 'user', content: 'hi' }] };
    mockFetch.mockReturnValue(mockJsonResponse(data));
    const result = await aiApi.getConversation('conv-1');
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1', expect.any(Object));
    expect(result).toEqual(data);
  });

  it('throws on 404', async () => {
    mockFetch.mockReturnValue(mockErrorResponse(404));
    await expect(aiApi.getConversation('nonexistent')).rejects.toThrow('AI API error: 404');
  });
});

describe('ai-api.ts - deleteConversation', () => {
  it('deletes a conversation via DELETE', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    await aiApi.deleteConversation('conv-1');
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1', expect.objectContaining({
      method: 'DELETE',
    }));
  });
});

describe('ai-api.ts - approveContext', () => {
  it('sends POST to approve-context endpoint', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    await aiApi.approveContext('conv-1', { baseId: 'base-1', tableId: 'table-1' });
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1/approve-context', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ baseId: 'base-1', tableId: 'table-1' }),
    }));
  });
});

describe('ai-api.ts - respondViewState', () => {
  it('sends POST to view-state-response endpoint', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    const viewState = { filter: null, sort: null };
    await aiApi.respondViewState('conv-1', 'req-1', viewState);
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1/view-state-response', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ requestId: 'req-1', viewState }),
    }));
  });
});

describe('ai-api.ts - submitFeedback', () => {
  it('sends POST feedback to message endpoint', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    await aiApi.submitFeedback('conv-1', 'msg-1', 'up');
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1/messages/msg-1/feedback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ feedback: 'up' }),
    }));
  });

  it('sends down feedback', async () => {
    mockFetch.mockReturnValue(mockJsonResponse({}));
    await aiApi.submitFeedback('conv-1', 'msg-1', 'down');
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1/messages/msg-1/feedback', expect.objectContaining({
      body: JSON.stringify({ feedback: 'down' }),
    }));
  });
});

describe('ai-api.ts - sendChatMessage', () => {
  it('returns an AbortController', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const onEvent = vi.fn();
    const onError = vi.fn();
    const controller = aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    expect(controller).toBeInstanceOf(AbortController);
  });

  it('sends POST to chat endpoint with correct headers', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    expect(mockFetch).toHaveBeenCalledWith('/ai-api/conversations/conv-1/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: 'test-token' },
      body: JSON.stringify({ content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1' }),
    }));
  });

  it('calls onError on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, body: null });
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    await new Promise(r => setTimeout(r, 50));
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls onError when no response body', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, body: null });
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    await new Promise(r => setTimeout(r, 50));
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'No response body' }));
  });

  it('parses SSE events from stream', async () => {
    const events = [
      'data: {"type":"token","content":"Hello"}\n',
      'data: {"type":"done"}\n',
    ];
    const encoder = new TextEncoder();
    let readerDone = false;
    let callCount = 0;
    const mockReader = {
      read: vi.fn(() => {
        if (callCount < events.length) {
          const chunk = encoder.encode(events[callCount]);
          callCount++;
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };
    mockFetch.mockResolvedValue({ ok: true, status: 200, body: { getReader: () => mockReader } });
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    await new Promise(r => setTimeout(r, 100));
    expect(onEvent).toHaveBeenCalledWith({ type: 'token', content: 'Hello' });
    expect(onEvent).toHaveBeenCalledWith({ type: 'done' });
  });

  it('does not call onError on abort', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);
    const onEvent = vi.fn();
    const onError = vi.fn();
    const controller = aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    controller.abort();
    await new Promise(r => setTimeout(r, 50));
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError on non-abort fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
    }, onEvent, onError);
    await new Promise(r => setTimeout(r, 50));
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network failure' }));
  });

  it('includes viewState in request body when provided', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const viewState = { filter: { conjunction: 'and', filterSet: [] } };
    aiApi.sendChatMessage('conv-1', {
      content: 'test', baseId: 'b', tableId: 't', viewId: 'v', viewState,
    }, vi.fn(), vi.fn());
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      body: JSON.stringify({ content: 'test', baseId: 'b', tableId: 't', viewId: 'v', viewState }),
    }));
  });

  it('handles malformed SSE data gracefully', async () => {
    const encoder = new TextEncoder();
    let callCount = 0;
    const chunks = [
      'data: not-json\n',
      'data: {"type":"done"}\n',
    ];
    const mockReader = {
      read: vi.fn(() => {
        if (callCount < chunks.length) {
          const chunk = encoder.encode(chunks[callCount]);
          callCount++;
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };
    mockFetch.mockResolvedValue({ ok: true, status: 200, body: { getReader: () => mockReader } });
    const onEvent = vi.fn();
    const onError = vi.fn();
    aiApi.sendChatMessage('conv-1', {
      content: 'Hello', baseId: 'b', tableId: 't', viewId: 'v',
    }, onEvent, onError);
    await new Promise(r => setTimeout(r, 100));
    expect(onEvent).toHaveBeenCalledWith({ type: 'done' });
    expect(onError).not.toHaveBeenCalled();
  });
});

describe('ai-api.ts - token handling', () => {
  it('uses window.accessToken for auth', async () => {
    (window as any).accessToken = 'my-token';
    vi.resetModules();
    aiApi = await import('../ai-api');
    mockFetch.mockReturnValue(mockJsonResponse({ conversations: [] }));
    await aiApi.listConversations();
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ token: 'my-token' }),
    }));
  });
});
