import { useState, useRef, useEffect, useCallback } from 'react';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { useConditionalColorStore } from '@/stores/conditional-color-store';
import { updateViewFilter, updateViewSort, updateViewGroupBy } from '@/services/api';
import {
  Sparkles, Bot, User, Send, X, Plus, MessageSquare, Trash2,
  ChevronLeft, ChevronRight, Check, Shield, Filter, ArrowUpDown,
  Layers, Palette, Loader2, StopCircle, GripHorizontal,
} from 'lucide-react';

interface AIChatPanelProps {
  baseId: string;
  tableId: string;
  viewId: string;
}

const ACTION_META: Record<string, { icon: typeof Filter; label: string; color: string; bgColor: string }> = {
  apply_filter: { icon: Filter, label: 'Apply Filter', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  apply_sort: { icon: ArrowUpDown, label: 'Apply Sort', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  apply_group_by: { icon: Layers, label: 'Apply Group', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  apply_conditional_color: { icon: Palette, label: 'Apply Color Rule', color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
};

export function AIChatPanel({ baseId, tableId, viewId }: AIChatPanelProps) {
  const {
    isOpen, setIsOpen,
    conversations, currentConversationId, messages,
    streamingContent, isStreaming,
    pendingActions, consentRequests,
    showConversationList, setShowConversationList,
    loadConversations, selectConversation, deleteConversation,
    sendMessage, abortCurrentStream,
    approveContext, markActionApplied,
  } = useAIChatStore();

  const addColorRule = useConditionalColorStore((s) => s.addRule);

  const [input, setInput] = useState('');
  const [panelHeight, setPanelHeight] = useState(400);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text, baseId, tableId, viewId);
  }, [input, isStreaming, sendMessage, baseId, tableId, viewId]);

  const handleApplyAction = useCallback(async (actionId: string, actionType: string, payload: any) => {
    try {
      switch (actionType) {
        case 'apply_filter':
          await updateViewFilter({ baseId, tableId, viewId, filter: payload });
          break;
        case 'apply_sort':
          await updateViewSort({ baseId, tableId, viewId, sort: payload });
          break;
        case 'apply_group_by':
          await updateViewGroupBy({ baseId, tableId, viewId, groupBy: payload });
          break;
        case 'apply_conditional_color':
          if (payload?.rules && Array.isArray(payload.rules)) {
            payload.rules.forEach((rule: any) => {
              addColorRule({
                id: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                conditions: rule.conditions || [],
                conjunction: rule.conjunction || 'and',
                color: rule.color || 'rgba(59, 130, 246, 0.15)',
                isActive: true,
              });
            });
          }
          break;
      }
      markActionApplied(actionId);
    } catch (err) {
      console.error('Failed to apply action:', err);
    }
  }, [baseId, tableId, viewId, markActionApplied, addColorRule]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    e.preventDefault();
  }, [panelHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - e.clientY;
      const newHeight = Math.max(200, Math.min(window.innerHeight * 0.8, dragStartHeight.current + delta));
      setPanelHeight(newHeight);
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
      style={{ height: `${panelHeight}px` }}
    >
      <div
        className="flex items-center justify-center h-6 cursor-ns-resize hover:bg-muted/50 transition-colors shrink-0 border-b border-border/40"
        onMouseDown={handleDragStart}
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground/40" />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {showConversationList ? <ChevronLeft className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </button>
          <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
          {currentConversationId && (
            <span className="text-[10px] text-muted-foreground/60 bg-muted rounded px-1.5 py-0.5">
              #{currentConversationId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              useAIChatStore.getState().createNewConversation(baseId, tableId, viewId).catch(() => {});
            }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {showConversationList && (
          <div className="w-60 border-r border-border flex flex-col shrink-0 bg-muted/20">
            <div className="px-3 py-2 border-b border-border/40">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversations</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground/60">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors group ${
                      conv.id === currentConversationId ? 'bg-muted' : ''
                    }`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground truncate">
                        {conv.title || `Chat #${conv.id}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bot className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-foreground/80">How can I help?</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[320px]">
                  Ask me to filter, sort, group, or analyze your data. I can also apply conditional colors.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 max-w-md justify-center">
                  {['Filter rows where status is active', 'Sort by date descending', 'Group by category'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-foreground/90 text-background rounded-br-sm'
                      : 'bg-muted text-foreground/80 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ))}

            {streamingContent && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed bg-muted text-foreground/80 rounded-bl-sm">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-3.5 bg-foreground/60 ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="rounded-xl px-3.5 py-2.5 bg-muted">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                </div>
              </div>
            )}

            {consentRequests.map((cr, i) => (
              <div key={`consent-${i}`} className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5} />
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 max-w-[75%]">
                  <div className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Access Request
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 mb-2">
                    AI needs access to <span className="font-medium">{cr.baseName}</span>
                    {cr.tableName && <> / <span className="font-medium">{cr.tableName}</span></>}
                    {cr.reason && <span className="block mt-1 text-amber-600 dark:text-amber-400">{cr.reason}</span>}
                  </div>
                  <button
                    onClick={() => approveContext(cr.baseId, cr.tableId)}
                    className="text-[11px] px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                  >
                    Allow Access
                  </button>
                </div>
              </div>
            ))}

            {pendingActions.map((action) => {
              const meta = ACTION_META[action.actionType] || {
                icon: Sparkles, label: action.actionType, color: 'text-foreground', bgColor: 'bg-muted border-border',
              };
              const Icon = meta.icon;
              return (
                <div key={action.id} className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 shrink-0" />
                  <div className={`rounded-xl border px-3.5 py-2.5 max-w-[80%] ${meta.bgColor}`}>
                    <div className={`flex items-center gap-2 text-xs font-medium mb-1.5 ${meta.color}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {meta.label}
                    </div>
                    <pre className="text-[10px] text-foreground/60 bg-background/50 rounded p-2 mb-2 overflow-x-auto max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                    {action.applied ? (
                      <div className="flex items-center gap-1 text-[11px] text-green-600">
                        <Check className="h-3 w-3" />
                        Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyAction(action.id, action.actionType, action.payload)}
                        className={`text-[11px] px-3 py-1 rounded-md text-white transition-colors ${
                          action.actionType === 'apply_filter' ? 'bg-blue-600 hover:bg-blue-700' :
                          action.actionType === 'apply_sort' ? 'bg-amber-600 hover:bg-amber-700' :
                          action.actionType === 'apply_group_by' ? 'bg-purple-600 hover:bg-purple-700' :
                          action.actionType === 'apply_conditional_color' ? 'bg-pink-600 hover:bg-pink-700' :
                          'bg-foreground/80 hover:bg-foreground/90'
                        }`}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-4 py-3 shrink-0">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-border">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStreaming ? 'AI is responding...' : 'Ask about your data...'}
                disabled={isStreaming}
                className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              {isStreaming ? (
                <button
                  onClick={abortCurrentStream}
                  className="p-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  title="Stop generating"
                >
                  <StopCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-md bg-foreground/90 text-background hover:bg-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
