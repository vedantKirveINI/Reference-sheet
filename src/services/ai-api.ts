const AI_BASE = '/ai-api';

function getToken(): string {
  return (window as any).accessToken || import.meta.env.VITE_AUTH_TOKEN || '';
}

async function aiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${AI_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'token': getToken(),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  return res.json();
}

export interface AIConversation {
  id: number;
  user_id: string;
  title: string;
  current_base_id: string | null;
  current_table_id: string | null;
  current_view_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  action_type: string | null;
  action_payload: any;
  created_at: string;
}

export interface SSEEvent {
  type: 'token' | 'action' | 'consent_request' | 'done' | 'error' | 'thinking' | 'title_update' | 'view_state_request';
  content?: string;
  actionType?: string;
  payload?: any;
  baseId?: string;
  baseName?: string;
  tableId?: string;
  tableName?: string;
  reason?: string;
  error?: string;
  tool?: string;
  message?: string;
  title?: string;
  requestId?: string;
}

export async function submitFeedback(conversationId: number, messageId: number, feedback: 'up' | 'down'): Promise<void> {
  await aiRequest(`/conversations/${conversationId}/messages/${messageId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
}

export async function listConversations(): Promise<AIConversation[]> {
  const res = await aiRequest('/conversations');
  return res.conversations || [];
}

export async function createConversation(data: { title?: string; baseId?: string; tableId?: string; viewId?: string }): Promise<AIConversation> {
  const res = await aiRequest('/conversations', { method: 'POST', body: JSON.stringify(data) });
  return res.conversation;
}

export async function getConversation(id: number): Promise<{ conversation: AIConversation; messages: AIMessage[] }> {
  return aiRequest(`/conversations/${id}`);
}

export async function deleteConversation(id: number): Promise<void> {
  return aiRequest(`/conversations/${id}`, { method: 'DELETE' });
}

export async function approveContext(conversationId: number, data: { baseId: string; tableId?: string }): Promise<void> {
  return aiRequest(`/conversations/${conversationId}/approve-context`, { method: 'POST', body: JSON.stringify(data) });
}

export async function respondViewState(conversationId: number, requestId: string, viewState: any): Promise<void> {
  await aiRequest(`/conversations/${conversationId}/view-state-response`, {
    method: 'POST',
    body: JSON.stringify({ requestId, viewState }),
  });
}

export function sendChatMessage(
  conversationId: number,
  data: { content: string; baseId: string; tableId: string; viewId: string; viewState?: any },
  onEvent: (event: SSEEvent) => void,
  onError: (error: Error) => void,
): AbortController {
  const controller = new AbortController();

  fetch(`${AI_BASE}/conversations/${conversationId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': getToken(),
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok) {
      onError(new Error(`Chat error: ${response.status}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('No response body'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6));
            onEvent(eventData);
          } catch {}
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') {
      onError(err);
    }
  });

  return controller;
}
