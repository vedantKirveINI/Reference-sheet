import { useState, useRef, useEffect, useCallback } from 'react';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { useConditionalColorStore } from '@/stores/conditional-color-store';
import { updateViewFilter, updateViewSort, updateViewGroupBy } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles, User, Send, X, Plus, MessageSquare, Trash2,
  ChevronLeft, Check, Shield, Filter, ArrowUpDown,
  Layers, Palette, Loader2, StopCircle, GripHorizontal,
  Copy, RotateCcw, ThumbsUp, ThumbsDown, PanelRight, PanelBottom,
  Database, Pencil, Code, Search,
} from 'lucide-react';

interface AIChatPanelProps {
  baseId: string;
  tableId: string;
  viewId: string;
  tableName?: string;
  viewName?: string;
}

function TinyAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #369B7D, #4FDB95)',
      }}
    >
      <Sparkles className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2} />
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded-lg border border-border">
            <table className="w-full text-[11px] border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/60">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2.5 py-1.5 text-left font-semibold text-foreground/80 border-b border-border text-[11px]">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2.5 py-1.5 border-b border-border/40 text-foreground/70">{children}</td>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
        ),
        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="text-foreground/80">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <div className="relative my-2">
                <pre className="bg-foreground/5 dark:bg-foreground/10 rounded-lg px-3 py-2 overflow-x-auto text-[11px] font-mono">
                  <code>{children}</code>
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(String(children))}
                  className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-colors"
                  title="Copy"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            );
          }
          return <code className="bg-foreground/5 dark:bg-foreground/10 rounded px-1 py-0.5 text-[11px] font-mono">{children}</code>;
        },
        h1: ({ children }) => <h1 className="text-sm font-bold mb-1.5 text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[13px] font-semibold mb-1 text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xs font-semibold mb-1 text-foreground">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#39A380] pl-3 my-1.5 text-foreground/60 italic">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function MessageActions({
  content,
  messageId: _messageId,
  feedback,
  onRetry,
  onFeedback,
}: {
  content: string;
  messageId: number;
  feedback?: 'up' | 'down' | null;
  onRetry: () => void;
  onFeedback: (f: 'up' | 'down') => void;
}) {
  void _messageId;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="p-1 rounded hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground transition-colors"
        title="Copy"
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </button>
      <button
        onClick={onRetry}
        className="p-1 rounded hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground transition-colors"
        title="Retry"
      >
        <RotateCcw className="h-3 w-3" />
      </button>
      <button
        onClick={() => onFeedback('up')}
        className={`p-1 rounded hover:bg-muted/60 transition-colors ${feedback === 'up' ? 'text-green-500' : 'text-muted-foreground/50 hover:text-foreground'}`}
        title="Good response"
      >
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => onFeedback('down')}
        className={`p-1 rounded hover:bg-muted/60 transition-colors ${feedback === 'down' ? 'text-red-500' : 'text-muted-foreground/50 hover:text-foreground'}`}
        title="Bad response"
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}

function ActionPreview({ actionType, payload }: { actionType: string; payload: any }) {
  const getPreview = () => {
    switch (actionType) {
      case 'apply_filter': {
        const conditions = payload?.conditions || [];
        return `${conditions.length} condition${conditions.length !== 1 ? 's' : ''}: ${conditions.map((c: any) => `${c.fieldId} ${c.operator} ${c.value ?? ''}`).join(', ')}`;
      }
      case 'apply_sort': {
        const sorts = Array.isArray(payload) ? payload : [];
        return sorts.map((s: any) => `${s.fieldId} ${s.order}`).join(', ');
      }
      case 'apply_group_by': {
        const groups = Array.isArray(payload) ? payload : [];
        return `Group by ${groups.map((g: any) => g.fieldId).join(', ')}`;
      }
      case 'apply_conditional_color': {
        const rules = payload?.rules || (Array.isArray(payload) ? payload : []);
        return `${rules.length} color rule${rules.length !== 1 ? 's' : ''}`;
      }
      case 'create_record':
        return `New record with ${Object.keys(payload?.fields || {}).length} fields`;
      case 'update_record':
        return `Update ${Object.keys(payload?.fields || {}).length} fields`;
      case 'delete_record':
        return `Delete record ${payload?.recordId || ''}`;
      case 'generate_formula':
        return payload?.formula || '';
      default:
        return JSON.stringify(payload).substring(0, 100);
    }
  };

  return (
    <div className="text-[11px] text-foreground/60 mb-2 px-2 py-1.5 bg-background/60 rounded-md border border-border/30">
      {getPreview()}
    </div>
  );
}

const ACTION_META: Record<string, { icon: typeof Filter; label: string; color: string; bgColor: string }> = {
  apply_filter: { icon: Filter, label: 'Apply Filter', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  apply_sort: { icon: ArrowUpDown, label: 'Apply Sort', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  apply_group_by: { icon: Layers, label: 'Apply Group', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  apply_conditional_color: { icon: Palette, label: 'Apply Color Rule', color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
  create_record: { icon: Plus, label: 'Create Record', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  update_record: { icon: Pencil, label: 'Update Record', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  delete_record: { icon: Trash2, label: 'Delete Record', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
  generate_formula: { icon: Code, label: 'Formula', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
};

export function AIChatPanel({ baseId, tableId, viewId, tableName, viewName }: AIChatPanelProps) {
  const {
    isOpen, setIsOpen,
    conversations, currentConversationId, messages,
    streamingContent, isStreaming,
    pendingActions, consentRequests,
    showConversationList, setShowConversationList,
    thinkingMessage, panelLayout, setPanelLayout,
    contextPrefill,
    loadConversations, selectConversation, deleteConversation,
    sendMessage, abortCurrentStream,
    approveContext, markActionApplied,
    retryLastMessage, submitFeedback,
  } = useAIChatStore();

  const addColorRule = useConditionalColorStore((s) => s.addRule);

  const [input, setInput] = useState('');
  const [panelHeight, setPanelHeight] = useState(400);
  const [panelWidth, setPanelWidth] = useState(420);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const dragStartHeight = useRef(0);
  const dragStartWidth = useRef(0);

  const isBottom = panelLayout === 'bottom';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, loadConversations]);

  useEffect(() => {
    if (isOpen && contextPrefill) {
      setInput(contextPrefill);
      useAIChatStore.getState().setContextPrefill('');
      inputRef.current?.focus();
    }
  }, [isOpen, contextPrefill]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, thinkingMessage]);

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
    dragStartX.current = e.clientX;
    dragStartHeight.current = panelHeight;
    dragStartWidth.current = panelWidth;
    e.preventDefault();
  }, [panelHeight, panelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      if (isBottom) {
        const delta = dragStartY.current - e.clientY;
        const newHeight = Math.max(200, Math.min(window.innerHeight * 0.8, dragStartHeight.current + delta));
        setPanelHeight(newHeight);
      } else {
        const delta = dragStartX.current - e.clientX;
        const newWidth = Math.max(300, Math.min(window.innerWidth * 0.6, dragStartWidth.current + delta));
        setPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBottom]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 bg-background border shadow-2xl flex flex-col animate-in duration-200 ${
        isBottom
          ? 'bottom-0 left-0 right-0 border-t slide-in-from-bottom'
          : 'top-0 right-0 bottom-0 border-l slide-in-from-right'
      }`}
      style={isBottom
        ? { height: `${panelHeight}px` }
        : { width: `${panelWidth}px` }
      }
    >
      {isBottom ? (
        <div
          className="flex items-center justify-center h-6 cursor-ns-resize hover:bg-muted/50 transition-colors shrink-0 border-b border-border/40"
          onMouseDown={handleDragStart}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground/40" />
        </div>
      ) : (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-muted/50 transition-colors z-10"
          onMouseDown={handleDragStart}
        />
      )}

      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {showConversationList ? <ChevronLeft className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </button>
          <TinyAvatar size={22} />
          <span className="text-sm font-semibold text-foreground">TINYTable AI</span>
          {tableName && (
            <span className="text-[10px] text-muted-foreground/70 bg-muted rounded-full px-2 py-0.5 flex items-center gap-1">
              <Database className="h-2.5 w-2.5" />
              {tableName}{viewName ? ` · ${viewName}` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const next = panelLayout === 'bottom' ? 'side' : 'bottom';
              setPanelLayout(next);
            }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={panelLayout === 'bottom' ? 'Switch to side panel' : 'Switch to bottom panel'}
          >
            {panelLayout === 'bottom' ? <PanelRight className="h-4 w-4" /> : <PanelBottom className="h-4 w-4" />}
          </button>
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
                        {conv.title}
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
            {messages.length === 0 && !streamingContent && !thinkingMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 px-6">
                <TinyAvatar size={48} />
                <h3 className="text-sm font-semibold text-foreground mt-3">TINYTable AI</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[340px]">
                  Your intelligent data assistant. Ask questions, apply filters, create records, and more — all through natural conversation.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-5 max-w-md w-full">
                  {[
                    { icon: Search, label: 'Query data', prompt: `Show me all records in the ${tableName || 'current'} table` },
                    { icon: Filter, label: 'Filter view', prompt: 'Filter to show only active items' },
                    { icon: ArrowUpDown, label: 'Sort data', prompt: 'Sort by date, newest first' },
                    { icon: Layers, label: 'Group records', prompt: 'Group records by status' },
                    { icon: Palette, label: 'Color rows', prompt: 'Highlight high priority rows in red' },
                    { icon: Plus, label: 'Create record', prompt: 'Create a new record with...' },
                  ].map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className="flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg border border-border bg-background hover:bg-muted/60 hover:border-border/80 transition-all text-xs group/btn"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-[#39A380] transition-colors shrink-0" strokeWidth={1.5} />
                      <span className="text-muted-foreground group-hover/btn:text-foreground transition-colors">{label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground/50 mt-4">
                  Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">⌘J</kbd> to toggle
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <TinyAvatar />
                )}
                <div className={msg.role !== 'user' ? 'group max-w-[75%]' : 'max-w-[75%]'}>
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground/90 text-background rounded-br-sm'
                        : 'bg-muted text-foreground/80 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : <MarkdownContent content={msg.content} />}
                  </div>
                  {msg.role !== 'user' && (
                    <MessageActions
                      content={msg.content}
                      messageId={msg.id}
                      feedback={(msg as any).feedback}
                      onRetry={() => retryLastMessage(baseId, tableId, viewId)}
                      onFeedback={(f) => submitFeedback(msg.id, f)}
                    />
                  )}
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
                <TinyAvatar />
                <div className="max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed bg-muted text-foreground/80 rounded-bl-sm">
                  <MarkdownContent content={streamingContent} />
                  <span className="inline-block w-1.5 h-3.5 bg-foreground/60 ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {thinkingMessage && (
              <div className="flex gap-2.5 justify-start">
                <TinyAvatar />
                <div className="rounded-xl px-3.5 py-2.5 bg-muted/60 border border-border/40 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39A380] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39A380] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39A380] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{thinkingMessage}</span>
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && !thinkingMessage && (
              <div className="flex gap-2.5 justify-start">
                <TinyAvatar />
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
              if (action.actionType === 'generate_formula') {
                return (
                  <div key={action.id} className="flex gap-2.5 justify-start">
                    <div className="w-7 shrink-0" />
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 max-w-[80%]">
                      <div className="flex items-center gap-2 text-xs font-medium mb-1.5 text-emerald-600">
                        <Code className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Formula Generated
                      </div>
                      <div className="bg-background/60 rounded-md px-3 py-2 font-mono text-xs text-foreground/80 mb-2 flex items-center justify-between">
                        <code>{action.payload.formula}</code>
                        <button onClick={() => navigator.clipboard.writeText(action.payload.formula)} className="p-1 rounded hover:bg-muted text-muted-foreground/50 hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {action.payload.description && (
                        <p className="text-[10px] text-foreground/50">{action.payload.description}</p>
                      )}
                    </div>
                  </div>
                );
              }

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
                    <ActionPreview actionType={action.actionType} payload={action.payload} />
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
                          action.actionType === 'create_record' ? 'bg-green-600 hover:bg-green-700' :
                          action.actionType === 'delete_record' ? 'bg-red-600 hover:bg-red-700' :
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
