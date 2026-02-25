import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAIChatStore } from '../ai-chat-store';

vi.mock('@/services/ai-api', () => ({
  listConversations: vi.fn(),
  createConversation: vi.fn(),
  getConversation: vi.fn(),
  deleteConversation: vi.fn(),
  sendChatMessage: vi.fn(),
  submitFeedback: vi.fn(),
  approveContext: vi.fn(),
  respondViewState: vi.fn(),
}));

import * as aiApi from '@/services/ai-api';

const mockedAiApi = aiApi as any;

function resetStore() {
  useAIChatStore.setState({
    isOpen: false,
    conversations: [],
    currentConversationId: null,
    messages: [],
    streamingContent: '',
    isStreaming: false,
    thinkingMessage: '',
    toolSteps: [],
    panelLayout: 'bottom',
    contextPrefill: '',
    lastUserMessage: '',
    pendingActions: [],
    consentRequests: [],
    showConversationList: false,
    viewStateGetter: null,
    _abortController: null,
  });
}

describe('useAIChatStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('defaults to false', () => {
      expect(useAIChatStore.getState().isOpen).toBe(false);
    });

    it('setIsOpen toggles', () => {
      useAIChatStore.getState().setIsOpen(true);
      expect(useAIChatStore.getState().isOpen).toBe(true);
      useAIChatStore.getState().setIsOpen(false);
      expect(useAIChatStore.getState().isOpen).toBe(false);
    });
  });

  describe('showConversationList', () => {
    it('defaults to false', () => {
      expect(useAIChatStore.getState().showConversationList).toBe(false);
    });

    it('setShowConversationList sets value', () => {
      useAIChatStore.getState().setShowConversationList(true);
      expect(useAIChatStore.getState().showConversationList).toBe(true);
    });
  });

  describe('viewStateGetter', () => {
    it('defaults to null', () => {
      expect(useAIChatStore.getState().viewStateGetter).toBeNull();
    });

    it('setViewStateGetter sets getter', () => {
      const getter = () => ({ filters: [] });
      useAIChatStore.getState().setViewStateGetter(getter);
      expect(useAIChatStore.getState().viewStateGetter).toBe(getter);
    });

    it('setViewStateGetter null clears', () => {
      useAIChatStore.getState().setViewStateGetter(() => ({}));
      useAIChatStore.getState().setViewStateGetter(null);
      expect(useAIChatStore.getState().viewStateGetter).toBeNull();
    });
  });

  describe('setPanelLayout', () => {
    it('sets layout and persists to localStorage', () => {
      useAIChatStore.getState().setPanelLayout('side');
      expect(useAIChatStore.getState().panelLayout).toBe('side');
      expect(localStorage.getItem('ai-panel-layout')).toBe('side');
    });
  });

  describe('setContextPrefill', () => {
    it('sets text', () => {
      useAIChatStore.getState().setContextPrefill('some context');
      expect(useAIChatStore.getState().contextPrefill).toBe('some context');
    });
  });

  describe('loadConversations', () => {
    it('sets conversations on success', async () => {
      const convos = [{ id: 'c1', title: 'Conv 1' }];
      mockedAiApi.listConversations.mockResolvedValue(convos);
      await useAIChatStore.getState().loadConversations();
      expect(useAIChatStore.getState().conversations).toEqual(convos);
    });

    it('handles error gracefully', async () => {
      mockedAiApi.listConversations.mockRejectedValue(new Error('fail'));
      await useAIChatStore.getState().loadConversations();
      expect(useAIChatStore.getState().conversations).toEqual([]);
    });
  });

  describe('createNewConversation', () => {
    it('creates conversation and sets it as current', async () => {
      const conv = { id: 'c1', title: 'New', baseId: 'b1', tableId: 't1', viewId: 'v1' };
      mockedAiApi.createConversation.mockResolvedValue(conv);
      const id = await useAIChatStore.getState().createNewConversation('b1', 't1', 'v1');
      expect(id).toBe('c1');
      expect(useAIChatStore.getState().currentConversationId).toBe('c1');
      expect(useAIChatStore.getState().conversations).toHaveLength(1);
      expect(useAIChatStore.getState().messages).toEqual([]);
      expect(useAIChatStore.getState().showConversationList).toBe(false);
    });

    it('throws on error', async () => {
      mockedAiApi.createConversation.mockRejectedValue(new Error('fail'));
      await expect(useAIChatStore.getState().createNewConversation('b1', 't1', 'v1')).rejects.toThrow('fail');
    });
  });

  describe('selectConversation', () => {
    it('loads and sets conversation data', async () => {
      const data = {
        messages: [{ id: 'm1', role: 'user', content: 'hi' }],
      };
      mockedAiApi.getConversation.mockResolvedValue(data);
      await useAIChatStore.getState().selectConversation('c1');
      expect(useAIChatStore.getState().currentConversationId).toBe('c1');
      expect(useAIChatStore.getState().messages).toEqual(data.messages);
      expect(useAIChatStore.getState().showConversationList).toBe(false);
    });
  });

  describe('deleteConversation', () => {
    it('removes conversation from list', async () => {
      useAIChatStore.setState({ conversations: [{ id: 'c1' }, { id: 'c2' }] as any });
      mockedAiApi.deleteConversation.mockResolvedValue(undefined);
      await useAIChatStore.getState().deleteConversation('c1');
      expect(useAIChatStore.getState().conversations).toHaveLength(1);
      expect(useAIChatStore.getState().conversations[0].id).toBe('c2');
    });

    it('clears current if deleted conversation is current', async () => {
      useAIChatStore.setState({
        conversations: [{ id: 'c1' }] as any,
        currentConversationId: 'c1',
        messages: [{ id: 'm1' }] as any,
      });
      mockedAiApi.deleteConversation.mockResolvedValue(undefined);
      await useAIChatStore.getState().deleteConversation('c1');
      expect(useAIChatStore.getState().currentConversationId).toBeNull();
      expect(useAIChatStore.getState().messages).toEqual([]);
    });

    it('keeps current if different conversation deleted', async () => {
      useAIChatStore.setState({
        conversations: [{ id: 'c1' }, { id: 'c2' }] as any,
        currentConversationId: 'c1',
        messages: [{ id: 'm1' }] as any,
      });
      mockedAiApi.deleteConversation.mockResolvedValue(undefined);
      await useAIChatStore.getState().deleteConversation('c2');
      expect(useAIChatStore.getState().currentConversationId).toBe('c1');
    });
  });

  describe('submitFeedback', () => {
    it('updates message feedback on success', async () => {
      useAIChatStore.setState({
        currentConversationId: 'c1',
        messages: [{ id: 'm1', role: 'assistant', content: 'hi', feedback: null } as any],
      });
      mockedAiApi.submitFeedback.mockResolvedValue(undefined);
      await useAIChatStore.getState().submitFeedback('m1', 'up');
      expect(useAIChatStore.getState().messages[0].feedback).toBe('up');
    });

    it('does nothing if no current conversation', async () => {
      useAIChatStore.setState({ currentConversationId: null });
      await useAIChatStore.getState().submitFeedback('m1', 'up');
      expect(mockedAiApi.submitFeedback).not.toHaveBeenCalled();
    });
  });

  describe('pendingActions', () => {
    it('markActionApplied marks action as applied', () => {
      useAIChatStore.setState({
        pendingActions: [{ id: 'a1', actionType: 'filter', payload: {}, applied: false }],
      });
      useAIChatStore.getState().markActionApplied('a1', { old: 'state' });
      const action = useAIChatStore.getState().pendingActions[0];
      expect(action.applied).toBe(true);
      expect(action.previousState).toEqual({ old: 'state' });
    });

    it('markActionUndone returns previous state and marks as not applied', () => {
      useAIChatStore.setState({
        pendingActions: [{ id: 'a1', actionType: 'filter', payload: {}, applied: true, previousState: { old: 'state' } }],
      });
      const prev = useAIChatStore.getState().markActionUndone('a1');
      expect(prev).toEqual({ old: 'state' });
      expect(useAIChatStore.getState().pendingActions[0].applied).toBe(false);
    });

    it('markActionUndone returns null for non-existent action', () => {
      const result = useAIChatStore.getState().markActionUndone('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('abortCurrentStream', () => {
    it('aborts controller and finalizes with streaming content', () => {
      const mockAbort = vi.fn();
      useAIChatStore.setState({
        _abortController: { abort: mockAbort } as any,
        streamingContent: 'partial response',
        isStreaming: true,
        currentConversationId: 'c1',
        messages: [],
      });
      useAIChatStore.getState().abortCurrentStream();
      expect(mockAbort).toHaveBeenCalled();
      expect(useAIChatStore.getState().isStreaming).toBe(false);
      const msgs = useAIChatStore.getState().messages;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toContain('[stopped]');
    });

    it('aborts controller with no streaming content', () => {
      const mockAbort = vi.fn();
      useAIChatStore.setState({
        _abortController: { abort: mockAbort } as any,
        streamingContent: '',
        isStreaming: true,
      });
      useAIChatStore.getState().abortCurrentStream();
      expect(mockAbort).toHaveBeenCalled();
      expect(useAIChatStore.getState().isStreaming).toBe(false);
      expect(useAIChatStore.getState().messages).toEqual([]);
    });
  });

  describe('approveContext', () => {
    it('removes matching consent requests', async () => {
      useAIChatStore.setState({
        currentConversationId: 'c1',
        consentRequests: [
          { baseId: 'b1', baseName: 'Base 1' },
          { baseId: 'b2', baseName: 'Base 2' },
        ],
      });
      mockedAiApi.approveContext.mockResolvedValue(undefined);
      await useAIChatStore.getState().approveContext('b1');
      expect(useAIChatStore.getState().consentRequests).toHaveLength(1);
      expect(useAIChatStore.getState().consentRequests[0].baseId).toBe('b2');
    });

    it('does nothing without currentConversationId', async () => {
      useAIChatStore.setState({ currentConversationId: null });
      await useAIChatStore.getState().approveContext('b1');
      expect(mockedAiApi.approveContext).not.toHaveBeenCalled();
    });
  });

  describe('retryLastMessage', () => {
    it('calls sendMessage when lastUserMessage exists', () => {
      useAIChatStore.setState({ lastUserMessage: 'hello again', currentConversationId: 'c1' });
      mockedAiApi.sendChatMessage.mockReturnValue({ abort: vi.fn() });

      useAIChatStore.getState().retryLastMessage('b1', 't1', 'v1');
      expect(mockedAiApi.sendChatMessage).toHaveBeenCalled();
    });

    it('does nothing if lastUserMessage is empty', () => {
      useAIChatStore.setState({ lastUserMessage: '', currentConversationId: 'c1' });
      useAIChatStore.getState().retryLastMessage('b1', 't1', 'v1');
      expect(mockedAiApi.sendChatMessage).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('creates new conversation if none current then sends', async () => {
      const conv = { id: 'c1', title: 'New', baseId: 'b1', tableId: 't1', viewId: 'v1' };
      mockedAiApi.createConversation.mockResolvedValue(conv);
      const controller = { abort: vi.fn() };
      mockedAiApi.sendChatMessage.mockReturnValue(controller);

      await useAIChatStore.getState().sendMessage('hello', 'b1', 't1', 'v1');
      await new Promise((r) => setTimeout(r, 0));
      expect(mockedAiApi.createConversation).toHaveBeenCalled();
      expect(mockedAiApi.sendChatMessage).toHaveBeenCalled();
      expect(useAIChatStore.getState().lastUserMessage).toBe('hello');
    });

    it('adds user message and sets streaming state with existing conversation', async () => {
      useAIChatStore.setState({ currentConversationId: 'c1' });
      const controller = { abort: vi.fn() };
      mockedAiApi.sendChatMessage.mockReturnValue(controller);

      await useAIChatStore.getState().sendMessage('hello', 'b1', 't1', 'v1');
      await new Promise((r) => setTimeout(r, 0));
      const s = useAIChatStore.getState();
      expect(s.messages.length).toBeGreaterThanOrEqual(1);
      expect(s.messages[0].content).toBe('hello');
      expect(s.messages[0].role).toBe('user');
      expect(s.isStreaming).toBe(true);
      expect(s.lastUserMessage).toBe('hello');
    });

    it('stores abort controller', async () => {
      useAIChatStore.setState({ currentConversationId: 'c1' });
      const controller = { abort: vi.fn() };
      mockedAiApi.sendChatMessage.mockReturnValue(controller);

      await useAIChatStore.getState().sendMessage('hello', 'b1', 't1', 'v1');
      await new Promise((r) => setTimeout(r, 0));
      expect(useAIChatStore.getState()._abortController).toBe(controller);
    });

    it('calls sendChatMessage with correct params', async () => {
      useAIChatStore.setState({ currentConversationId: 'c1' });
      mockedAiApi.sendChatMessage.mockReturnValue({ abort: vi.fn() });

      await useAIChatStore.getState().sendMessage('hello', 'b1', 't1', 'v1');
      await new Promise((r) => setTimeout(r, 0));
      expect(mockedAiApi.sendChatMessage).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ content: 'hello', baseId: 'b1', tableId: 't1', viewId: 'v1' }),
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('clears pending actions and consent requests on send', async () => {
      useAIChatStore.setState({
        currentConversationId: 'c1',
        pendingActions: [{ id: 'a1', actionType: 'filter', payload: {}, applied: false }],
        consentRequests: [{ baseId: 'b1', baseName: 'B1' }],
      });
      mockedAiApi.sendChatMessage.mockReturnValue({ abort: vi.fn() });

      await useAIChatStore.getState().sendMessage('hello', 'b1', 't1', 'v1');
      await new Promise((r) => setTimeout(r, 0));
      expect(useAIChatStore.getState().pendingActions).toEqual([]);
      expect(useAIChatStore.getState().consentRequests).toEqual([]);
    });
  });
});
