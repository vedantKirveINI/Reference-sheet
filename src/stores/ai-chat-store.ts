import { create } from 'zustand';
import type { AIConversation, AIMessage, SSEEvent } from '@/services/ai-api';
import * as aiApi from '@/services/ai-api';

type MessageWithFeedback = AIMessage & { feedback?: 'up' | 'down' | null };

interface ConsentRequest {
  baseId: string;
  baseName: string;
  tableId?: string;
  tableName?: string;
  reason?: string;
}

interface PendingAction {
  id: string;
  actionType: string;
  payload: any;
  applied: boolean;
}

interface ToolStep {
  tool: string;
  message: string;
  status: 'running' | 'done';
}

interface AIChatState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  conversations: AIConversation[];
  currentConversationId: number | null;
  messages: MessageWithFeedback[];
  streamingContent: string;
  isStreaming: boolean;

  thinkingMessage: string;
  toolSteps: ToolStep[];
  panelLayout: 'bottom' | 'side';
  contextPrefill: string;
  lastUserMessage: string;

  pendingActions: PendingAction[];
  consentRequests: ConsentRequest[];

  showConversationList: boolean;
  setShowConversationList: (show: boolean) => void;

  setPanelLayout: (layout: 'bottom' | 'side') => void;
  setContextPrefill: (text: string) => void;
  retryLastMessage: (baseId: string, tableId: string, viewId: string) => void;
  submitFeedback: (messageId: number, feedback: 'up' | 'down') => void;

  loadConversations: () => Promise<void>;
  createNewConversation: (baseId: string, tableId: string, viewId: string) => Promise<number>;
  selectConversation: (id: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;

  sendMessage: (content: string, baseId: string, tableId: string, viewId: string) => Promise<void>;
  abortCurrentStream: () => void;

  approveContext: (baseId: string, tableId?: string) => Promise<void>;
  markActionApplied: (actionId: string) => void;

  _abortController: AbortController | null;
}

export const useAIChatStore = create<AIChatState>()((set, get) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),

  conversations: [],
  currentConversationId: null,
  messages: [],
  streamingContent: '',
  isStreaming: false,

  thinkingMessage: '',
  toolSteps: [],
  panelLayout: (localStorage.getItem('ai-panel-layout') as 'bottom' | 'side') || 'bottom',
  contextPrefill: '',
  lastUserMessage: '',

  pendingActions: [],
  consentRequests: [],

  showConversationList: false,
  setShowConversationList: (show) => set({ showConversationList: show }),

  setPanelLayout: (layout) => {
    localStorage.setItem('ai-panel-layout', layout);
    set({ panelLayout: layout });
  },

  setContextPrefill: (text) => set({ contextPrefill: text }),

  retryLastMessage: (baseId, tableId, viewId) => {
    const { lastUserMessage, sendMessage } = get();
    if (lastUserMessage) {
      sendMessage(lastUserMessage, baseId, tableId, viewId);
    }
  },

  submitFeedback: async (messageId, feedback) => {
    const { currentConversationId } = get();
    if (!currentConversationId) return;
    try {
      await aiApi.submitFeedback(currentConversationId, messageId, feedback);
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, feedback } : m
        ),
      }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  },

  _abortController: null,

  loadConversations: async () => {
    try {
      const conversations = await aiApi.listConversations();
      set({ conversations });
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  },

  createNewConversation: async (baseId, tableId, viewId) => {
    try {
      const conv = await aiApi.createConversation({ baseId, tableId, viewId });
      set((s) => ({
        conversations: [conv, ...s.conversations],
        currentConversationId: conv.id,
        messages: [],
        pendingActions: [],
        consentRequests: [],
        streamingContent: '',
        showConversationList: false,
      }));
      return conv.id;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      throw err;
    }
  },

  selectConversation: async (id) => {
    try {
      const data = await aiApi.getConversation(id);
      set({
        currentConversationId: id,
        messages: data.messages,
        pendingActions: [],
        consentRequests: [],
        streamingContent: '',
        showConversationList: false,
      });
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  },

  deleteConversation: async (id) => {
    try {
      await aiApi.deleteConversation(id);
      set((s) => {
        const conversations = s.conversations.filter(c => c.id !== id);
        const isCurrent = s.currentConversationId === id;
        return {
          conversations,
          currentConversationId: isCurrent ? null : s.currentConversationId,
          messages: isCurrent ? [] : s.messages,
          pendingActions: isCurrent ? [] : s.pendingActions,
          consentRequests: isCurrent ? [] : s.consentRequests,
        };
      });
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  },

  sendMessage: async (content, baseId, tableId, viewId) => {
    const state = get();
    let conversationId = state.currentConversationId;

    if (!conversationId) {
      conversationId = await get().createNewConversation(baseId, tableId, viewId);
    }

    const userMessage: MessageWithFeedback = {
      id: Date.now(),
      conversation_id: conversationId,
      role: 'user',
      content,
      action_type: null,
      action_payload: null,
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
      pendingActions: [],
      consentRequests: [],
      thinkingMessage: '',
      toolSteps: [],
      lastUserMessage: content,
    }));

    const abortController = aiApi.sendChatMessage(
      conversationId,
      { content, baseId, tableId, viewId },
      (event: SSEEvent) => {
        switch (event.type) {
          case 'token':
            set((s) => {
              const steps = s.toolSteps.map(step =>
                step.status === 'running' ? { ...step, status: 'done' as const } : step
              );
              return {
                streamingContent: s.streamingContent + (event.content || ''),
                thinkingMessage: '',
                toolSteps: steps,
              };
            });
            break;
          case 'thinking':
            set((s) => {
              const steps = [...s.toolSteps];
              steps.forEach((step, i) => {
                if (step.status === 'running') steps[i] = { ...step, status: 'done' };
              });
              steps.push({ tool: event.tool || '', message: event.message || '', status: 'running' });
              return { toolSteps: steps, thinkingMessage: event.message || '' };
            });
            break;
          case 'title_update':
            if (event.title) {
              set((s) => ({
                conversations: s.conversations.map((c) =>
                  c.id === conversationId ? { ...c, title: event.title! } : c
                ),
              }));
            }
            break;
          case 'action':
            set((s) => ({
              pendingActions: [...s.pendingActions, {
                id: `action-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                actionType: event.actionType || '',
                payload: event.payload || {},
                applied: false,
              }],
            }));
            break;
          case 'consent_request':
            set((s) => ({
              consentRequests: [...s.consentRequests, {
                baseId: event.baseId || '',
                baseName: event.baseName || '',
                tableId: event.tableId,
                tableName: event.tableName,
                reason: event.reason,
              }],
            }));
            break;
          case 'done': {
            const finalContent = get().streamingContent;
            const finalActions = get().pendingActions;
            if (finalContent || finalActions.length > 0) {
              const assistantMessage: MessageWithFeedback = {
                id: Date.now() + 1,
                conversation_id: conversationId!,
                role: 'assistant',
                content: finalContent,
                action_type: finalActions.length > 0 ? finalActions[0].actionType : null,
                action_payload: finalActions.length > 0 ? finalActions[0].payload : null,
                created_at: new Date().toISOString(),
              };
              set((s) => ({
                messages: [...s.messages, assistantMessage],
                isStreaming: false,
                streamingContent: '',
                thinkingMessage: '',
                toolSteps: [],
                _abortController: null,
              }));
            } else {
              set({ isStreaming: false, streamingContent: '', thinkingMessage: '', toolSteps: [], _abortController: null });
            }
            break;
          }
          case 'error':
            set((s) => ({
              messages: [...s.messages, {
                id: Date.now() + 2,
                conversation_id: conversationId!,
                role: 'assistant' as const,
                content: event.error || 'An error occurred. Please try again.',
                action_type: null,
                action_payload: null,
                created_at: new Date().toISOString(),
              }],
              isStreaming: false,
              streamingContent: '',
              thinkingMessage: '',
              toolSteps: [],
              _abortController: null,
            }));
            break;
        }
      },
      (error) => {
        console.error('Chat stream error:', error);
        set((s) => ({
          messages: [...s.messages, {
            id: Date.now() + 3,
            conversation_id: conversationId!,
            role: 'assistant' as const,
            content: 'Connection error. Please try again.',
            action_type: null,
            action_payload: null,
            created_at: new Date().toISOString(),
          }],
          isStreaming: false,
          streamingContent: '',
          thinkingMessage: '',
          _abortController: null,
        }));
      },
    );

    set({ _abortController: abortController });
  },

  abortCurrentStream: () => {
    const { _abortController, streamingContent } = get();
    _abortController?.abort();
    if (streamingContent) {
      const conversationId = get().currentConversationId;
      set((s) => ({
        messages: [...s.messages, {
          id: Date.now(),
          conversation_id: conversationId!,
          role: 'assistant' as const,
          content: streamingContent + ' [stopped]',
          action_type: null,
          action_payload: null,
          created_at: new Date().toISOString(),
        }],
        isStreaming: false,
        streamingContent: '',
        thinkingMessage: '',
        toolSteps: [],
        _abortController: null,
      }));
    } else {
      set({ isStreaming: false, streamingContent: '', thinkingMessage: '', toolSteps: [], _abortController: null });
    }
  },

  approveContext: async (baseId, tableId) => {
    const conversationId = get().currentConversationId;
    if (!conversationId) return;
    await aiApi.approveContext(conversationId, { baseId, tableId });
    set((s) => ({
      consentRequests: s.consentRequests.filter(
        cr => !(cr.baseId === baseId && (!tableId || cr.tableId === tableId))
      ),
    }));
  },

  markActionApplied: (actionId) => {
    set((s) => ({
      pendingActions: s.pendingActions.map(a =>
        a.id === actionId ? { ...a, applied: true } : a
      ),
    }));
  },
}));
