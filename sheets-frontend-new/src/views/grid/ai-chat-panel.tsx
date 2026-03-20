import { useState, useRef, useEffect, useCallback } from 'react';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { useConditionalColorStore } from '@/stores/conditional-color-store';
import { type FilterRule } from '@/views/grid/filter-modal';
import { type SortRule } from '@/views/grid/sort-modal';
import { type GroupRule } from '@/views/grid/group-modal';
import { type IColumn } from '@/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, User, X, Plus, MessageSquare, Trash2,
  ChevronLeft, ChevronRight, Check, Shield, Filter, ArrowUpDown, ArrowUp, Square,
  Layers, Palette, Loader2, GripHorizontal,
  Copy, RotateCcw, ThumbsUp, ThumbsDown, PanelRight, PanelBottom,
  Database, Pencil, Code, Search, XCircle, Table2, Upload, FileText,
} from 'lucide-react';

interface AIChatPanelProps {
  baseId: string;
  tableId: string;
  viewId: string;
  tableName?: string;
  viewName?: string;
  onFilterApply?: (rules: FilterRule[]) => void;
  onSortApply?: (rules: SortRule[]) => void;
  onGroupApply?: (rules: GroupRule[]) => void;
  columns?: IColumn[];
  currentFilters?: FilterRule[];
  currentSorts?: SortRule[];
  currentGroups?: GroupRule[];
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatElapsed(startedAt: number, completedAt?: number): string {
  const end = completedAt || Date.now();
  const secs = (end - startedAt) / 1000;
  return secs < 10 ? `${secs.toFixed(1)}s` : `${Math.round(secs)}s`;
}

// ─── TinyAvatar ────────────────────────────────────────────────────

function TinyAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #369B7D, #4FDB95)',
      }}
    >
      <Sparkles className="text-white" style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={2} />
    </div>
  );
}

// ─── MarkdownContent (Step 3: polished rendering) ──────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-xl border border-border/50">
            <table className="w-full text-[13px] border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/60">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3.5 py-2 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wider border-b border-border">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3.5 py-2.5 border-b border-border/30 text-foreground/70 text-[13px]">{children}</td>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-[1.75]">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 ml-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 last:mb-0 space-y-1.5">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39A380]/40 shrink-0 mt-[10px]" />
            <span className="flex-1">{children}</span>
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-[#39A380] font-medium hover:text-[#39A380]/80 underline underline-offset-3 decoration-[#39A380]/30 hover:decoration-[#39A380]/60 transition-colors">
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const match = className?.match(/language-(\w+)/);
          const language = match ? match[1] : null;
          const isBlock = !!language;
          if (isBlock) {
            return (
              <div className="my-3 rounded-xl overflow-hidden border border-border/50">
                {language && (
                  <div className="px-4 py-1.5 bg-muted/80 border-b border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{language}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="p-1 rounded hover:bg-background/60 text-muted-foreground/50 hover:text-foreground transition-colors"
                      title="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <pre className="bg-muted/50 text-foreground p-4 text-[13px] leading-relaxed overflow-x-auto font-mono">
                  <code>{children}</code>
                </pre>
              </div>
            );
          }
          return <code className="bg-[#39A380]/[0.07] text-[#39A380] px-1.5 py-0.5 rounded-md text-[13px] font-mono font-medium">{children}</code>;
        },
        h1: ({ children }) => <h1 className="text-[17px] font-semibold mb-3 mt-5 first:mt-0 tracking-tight text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[15px] font-semibold mb-2 mt-4 pb-1.5 border-b border-border/40 tracking-tight text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[14px] font-semibold mb-1.5 mt-3 tracking-tight text-foreground">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-[3px] border-[#39A380]/40 pl-4 py-1 my-3 bg-[#39A380]/[0.03] rounded-r-lg">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── MessageActions ────────────────────────────────────────────────

function MessageActions({
  content,
  messageId: _messageId,
  feedback,
  onRetry,
  onFeedback,
}: {
  content: string;
  messageId: string;
  feedback?: 'up' | 'down' | null;
  onRetry: () => void;
  onFeedback: (f: 'up' | 'down') => void;
}) {
  void _messageId;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="p-1 rounded-md hover:bg-foreground/[0.06] text-muted-foreground/50 hover:text-foreground transition-colors"
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-[#39A380]" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={onRetry}
        className="p-1 rounded-md hover:bg-foreground/[0.06] text-muted-foreground/50 hover:text-foreground transition-colors"
        title="Retry"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onFeedback('up')}
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === 'up' ? 'text-[#39A380] bg-[#39A380]/10' : 'text-muted-foreground/50 hover:text-foreground hover:bg-foreground/[0.06]'
        )}
        title="Helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onFeedback('down')}
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === 'down' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground/50 hover:text-foreground hover:bg-foreground/[0.06]'
        )}
        title="Not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── ActionPreview ─────────────────────────────────────────────────

function ActionPreview({ actionType, payload, columns }: { actionType: string; payload: any; columns?: IColumn[] }) {
  const getFieldName = (fieldId: string) => {
    const col = columns?.find((c) => c.fieldDbName === fieldId || c.id === fieldId);
    return col?.name || fieldId;
  };

  let text = '';
  switch (actionType) {
    case 'apply_filter': {
      const conditions = payload?.filterSet?.conditions || payload?.conditions || [];
      text = conditions.map((c: any) => `${getFieldName(c.fieldId || c.fieldDbName)} ${c.operator} "${c.value}"`).join(` ${payload?.filterSet?.conjunction || 'and'} `);
      break;
    }
    case 'add_filter_condition': {
      const c = payload?.condition || payload;
      text = `Add: ${getFieldName(c.fieldId || c.fieldDbName)} ${c.operator} "${c.value}"`;
      break;
    }
    case 'remove_filter_condition': {
      const c = payload?.condition || payload;
      text = `Remove: ${getFieldName(c.fieldId || c.fieldDbName)} ${c.operator} "${c.value}"`;
      break;
    }
    case 'apply_sort': {
      const sorts = payload?.sorts || [payload];
      text = sorts.map((s: any) => `${getFieldName(s.fieldId || s.fieldDbName)} ${s.direction || 'asc'}`).join(', ');
      break;
    }
    case 'add_sort': {
      text = `Add: ${getFieldName(payload.fieldId || payload.fieldDbName)} ${payload.direction || 'asc'}`;
      break;
    }
    case 'remove_sort': {
      text = `Remove sort on ${getFieldName(payload.fieldId || payload.fieldDbName)}`;
      break;
    }
    case 'apply_group_by': {
      const groups = payload?.groups || [payload];
      text = groups.map((g: any) => getFieldName(g.fieldId || g.fieldDbName)).join(', ');
      break;
    }
    case 'apply_conditional_color': {
      text = `Color rows ${payload.color} when ${getFieldName(payload.fieldId || payload.fieldDbName)} ${payload.operator} "${payload.value}"`;
      break;
    }
    case 'clear_filter': text = 'Remove all filters'; break;
    case 'clear_sort': text = 'Remove all sorting'; break;
    case 'clear_group_by': text = 'Remove grouping'; break;
    case 'clear_conditional_color': text = 'Remove conditional coloring'; break;
    case 'create_record': text = 'Create a new record'; break;
    case 'update_record': text = 'Update record'; break;
    case 'delete_record': text = 'Delete record'; break;
    case 'generate_formula': text = payload?.formula || 'Formula'; break;
    case 'create_table': text = payload?.tableName || 'New table'; break;
    case 'preview_extracted_table': text = `${payload?.fields?.length || 0} fields, ${payload?.records?.length || 0} records`; break;
    default: text = actionType;
  }

  return <p className="text-[11px] text-foreground/60 mt-1 leading-relaxed">{text}</p>;
}

// ─── Action metadata ───────────────────────────────────────────────

const ACTION_META: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
  apply_filter: { icon: Filter, label: 'Apply Filter', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  add_filter_condition: { icon: Filter, label: 'Add Filter', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  remove_filter_condition: { icon: XCircle, label: 'Remove Filter', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  clear_filter: { icon: XCircle, label: 'Clear Filters', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  apply_sort: { icon: ArrowUpDown, label: 'Apply Sort', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  add_sort: { icon: ArrowUpDown, label: 'Add Sort', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  remove_sort: { icon: XCircle, label: 'Remove Sort', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  clear_sort: { icon: XCircle, label: 'Clear Sorts', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  apply_group_by: { icon: Layers, label: 'Group By', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  clear_group_by: { icon: XCircle, label: 'Clear Grouping', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  apply_conditional_color: { icon: Palette, label: 'Conditional Color', color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
  clear_conditional_color: { icon: XCircle, label: 'Clear Colors', color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
  create_record: { icon: Plus, label: 'Create Record', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  update_record: { icon: Pencil, label: 'Update Record', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  delete_record: { icon: Trash2, label: 'Delete Record', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
  create_table: { icon: Table2, label: 'Create Table', color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' },
  preview_extracted_table: { icon: FileText, label: 'Extracted Table', color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' },
};

// ─── Welcome suggestions ───────────────────────────────────────────

const SUGGESTIONS = [
  { icon: Search, label: 'Query data', prompt: 'Show me all records in this table' },
  { icon: Filter, label: 'Filter view', prompt: 'Filter to show only active items' },
  { icon: ArrowUpDown, label: 'Sort data', prompt: 'Sort by date, newest first' },
  { icon: Layers, label: 'Group records', prompt: 'Group records by status' },
  { icon: Palette, label: 'Color rows', prompt: 'Highlight high priority rows in red' },
  { icon: Plus, label: 'Create record', prompt: 'Create a new record' },
];

// ─── ThinkingBlock (Step 10) ───────────────────────────────────────

function ThinkingBlock({
  steps,
  isStreaming,
}: {
  steps: { tool: string; message: string; status: 'running' | 'done'; startedAt: number; completedAt?: number }[];
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const allDone = steps.every(s => s.status === 'done');
  const lastStep = steps[steps.length - 1];
  const teaser = lastStep?.message || '';

  // Auto-expand when streaming, allow collapse when done
  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  if (steps.length === 0) return null;

  // Collapsed state
  if (!expanded && allDone) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-start gap-2.5 py-2.5 px-3.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] hover:bg-foreground/[0.05] transition-colors text-left"
      >
        <Sparkles className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <span className="text-[13px] text-foreground/70 line-clamp-1">{teaser}</span>
          <span className="text-[11px] text-muted-foreground/50 mt-0.5 block">
            {steps.length} step{steps.length !== 1 ? 's' : ''} completed
          </span>
        </div>
        <ChevronRight className="size-3.5 text-muted-foreground/30 shrink-0 mt-1" />
      </button>
    );
  }

  // Expanded state
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] overflow-hidden"
    >
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-foreground/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-muted-foreground/50" />
          <span className="text-[12px] font-medium text-foreground/60">
            {allDone ? 'Completed' : 'Working...'}
          </span>
        </div>
        {allDone && (
          <button onClick={() => setExpanded(false)} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors">
            Hide
          </button>
        )}
      </div>
      <div className="px-3.5 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {steps.map((step, i) => {
            const isRunning = step.status === 'running';
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-5 h-5 flex items-center justify-center relative">
                  {isRunning ? (
                    <>
                      {isLast && <div className="absolute w-5 h-5 rounded-full bg-[#39A380]/10 animate-ping [animation-duration:2s]" />}
                      <Loader2 className="w-3.5 h-3.5 text-[#39A380] animate-spin" />
                    </>
                  ) : (
                    <Check className="w-3.5 h-3.5 text-[#39A380]/60" />
                  )}
                </div>
                <span className={cn(
                  "text-[13px] flex-1 truncate",
                  isRunning ? 'text-foreground/80' : 'text-foreground/50'
                )}>
                  {step.message}
                </span>
                <span className="text-[10px] text-muted-foreground/40 tabular-nums font-mono shrink-0">
                  {formatElapsed(step.startedAt, step.completedAt)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export function AIChatPanel({
  baseId, tableId, viewId, tableName, viewName,
  onFilterApply, onSortApply, onGroupApply,
  columns, currentFilters, currentSorts, currentGroups,
}: AIChatPanelProps) {
  const {
    isOpen, setIsOpen,
    conversations, currentConversationId,
    messages, streamingContent, isStreaming,
    pendingActions, consentRequests,
    thinkingMessage, toolSteps,
    panelLayout, contextPrefill,
    showConversationList, setShowConversationList,
    setViewStateGetter, setPanelLayout, setContextPrefill,
    loadConversations, createNewConversation,
    selectConversation, deleteConversation,
    sendMessage, abortCurrentStream,
    approveContext, markActionApplied, markActionUndone,
    retryLastMessage, submitFeedback,
  } = useAIChatStore();

  const { addColorRule } = useConditionalColorStore();

  const [input, setInput] = useState('');
  const [panelHeight, setPanelHeight] = useState(400);
  const [panelWidth, setPanelWidth] = useState(420);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const dragStartHeight = useRef(0);
  const dragStartWidth = useRef(0);

  const isBottom = panelLayout === 'bottom';

  // View state getter for AI service
  const setViewStateGetterCb = useCallback(() => {
    setViewStateGetter(() => () => ({
      filters: currentFilters || [],
      sorts: currentSorts || [],
      groups: currentGroups || [],
      colorRules: useConditionalColorStore.getState().rules,
    }));
  }, [currentFilters, currentSorts, currentGroups, setViewStateGetter]);

  useEffect(() => { setViewStateGetterCb(); }, [setViewStateGetterCb]);

  // Keyboard shortcut: Cmd/Ctrl+J
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

  // Load conversations on open
  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen, loadConversations]);

  // Context prefill
  useEffect(() => {
    if (contextPrefill) {
      setInput(contextPrefill);
      setContextPrefill('');
      inputRef.current?.focus();
    }
  }, [contextPrefill, setContextPrefill]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, toolSteps, pendingActions]);

  // Copy handler
  const handleCopy = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 1500);
  };

  // ─── File upload ─────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|pdf|png|jpg|jpeg|webp|xlsx)$/i)) {
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const aiBaseUrl = import.meta.env.REACT_APP_AI_SERVICE_URL ||
        (import.meta.env.REACT_APP_API_BASE_URL ?
          import.meta.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '').replace(':3000', ':3001')
          : 'http://localhost:3001');

      const resp = await fetch(`${aiBaseUrl}/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, base64Data: base64 }),
      });
      const { fileId } = await resp.json();

      const viewState = {
        filters: currentFilters || [],
        sorts: currentSorts || [],
        groups: currentGroups || [],
      };
      await sendMessage(`I've uploaded a file: ${file.name}`, baseId, tableId, viewId, viewState, fileId);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Send message ────────────────────────────────────────────────

  const handleSend = (overrideContent?: string) => {
    const content = overrideContent || input.trim();
    if (!content || isStreaming) return;
    const viewState = {
      filters: currentFilters || [],
      sorts: currentSorts || [],
      groups: currentGroups || [],
    };
    sendMessage(content, baseId, tableId, viewId, viewState);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  // ─── Apply action ────────────────────────────────────────────────

  const handleApplyAction = (actionId: string, actionType: string, payload: any) => {
    const previousState: any = {};

    switch (actionType) {
      case 'apply_filter': {
        previousState.filters = currentFilters || [];
        const conditions = payload?.filterSet?.conditions || payload?.conditions || [];
        const rules: FilterRule[] = conditions.map((c: any) => ({
          fieldId: c.fieldId || c.fieldDbName,
          operator: c.operator,
          value: c.value,
        }));
        onFilterApply?.(rules);
        break;
      }
      case 'add_filter_condition': {
        previousState.filters = currentFilters || [];
        const c = payload?.condition || payload;
        const newFilters = [...(currentFilters || []), {
          fieldId: c.fieldId || c.fieldDbName,
          operator: c.operator,
          value: c.value,
        }];
        onFilterApply?.(newFilters);
        break;
      }
      case 'remove_filter_condition': {
        previousState.filters = currentFilters || [];
        const c = payload?.condition || payload;
        const filtered = (currentFilters || []).filter(f =>
          !(f.fieldId === (c.fieldId || c.fieldDbName) && f.operator === c.operator && f.value === c.value)
        );
        onFilterApply?.(filtered);
        break;
      }
      case 'clear_filter': {
        previousState.filters = currentFilters || [];
        onFilterApply?.([]);
        break;
      }
      case 'apply_sort': {
        previousState.sorts = currentSorts || [];
        const sorts = payload?.sorts || [payload];
        const rules: SortRule[] = sorts.map((s: any) => ({
          fieldId: s.fieldId || s.fieldDbName,
          direction: s.direction || 'asc',
        }));
        onSortApply?.(rules);
        break;
      }
      case 'add_sort': {
        previousState.sorts = currentSorts || [];
        const newSorts = [...(currentSorts || []), {
          fieldId: payload.fieldId || payload.fieldDbName,
          direction: payload.direction || 'asc',
        }];
        onSortApply?.(newSorts);
        break;
      }
      case 'remove_sort': {
        previousState.sorts = currentSorts || [];
        const sortFiltered = (currentSorts || []).filter(s =>
          s.fieldId !== (payload.fieldId || payload.fieldDbName)
        );
        onSortApply?.(sortFiltered);
        break;
      }
      case 'clear_sort': {
        previousState.sorts = currentSorts || [];
        onSortApply?.([]);
        break;
      }
      case 'apply_group_by': {
        previousState.groups = currentGroups || [];
        const groups = payload?.groups || [payload];
        const rules: GroupRule[] = groups.map((g: any) => ({
          fieldId: g.fieldId || g.fieldDbName,
          direction: g.direction || 'asc',
        }));
        onGroupApply?.(rules);
        break;
      }
      case 'clear_group_by': {
        previousState.groups = currentGroups || [];
        onGroupApply?.([]);
        break;
      }
      case 'apply_conditional_color': {
        addColorRule({
          fieldId: payload.fieldId || payload.fieldDbName,
          operator: payload.operator,
          value: payload.value,
          color: payload.color,
        });
        break;
      }
      case 'clear_conditional_color': {
        break;
      }
      case 'create_table':
      case 'preview_extracted_table': {
        break;
      }
    }
    markActionApplied(actionId, previousState);
  };

  const handleUndoAction = (actionId: string) => {
    const prev = markActionUndone(actionId);
    if (!prev) return;
    if (prev.filters) onFilterApply?.(prev.filters);
    if (prev.sorts) onSortApply?.(prev.sorts);
    if (prev.groups) onGroupApply?.(prev.groups);
  };

  // ─── Drag resize ─────────────────────────────────────────────────

  const handleDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartX.current = e.clientX;
    dragStartHeight.current = panelHeight;
    dragStartWidth.current = panelWidth;
  };

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

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "fixed z-50 bg-background/95 backdrop-blur-xl border shadow-2xl flex flex-col animate-in duration-200",
        isBottom
          ? 'bottom-0 left-0 right-0 border-t slide-in-from-bottom'
          : 'top-0 right-0 bottom-0 border-l slide-in-from-right'
      )}
      style={isBottom ? { height: `${panelHeight}px` } : { width: `${panelWidth}px` }}
    >
      {/* Resize handle */}
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 shrink-0 bg-background/80">
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
            onClick={() => setPanelLayout(panelLayout === 'bottom' ? 'side' : 'bottom')}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={panelLayout === 'bottom' ? 'Switch to side panel' : 'Switch to bottom panel'}
          >
            {panelLayout === 'bottom' ? <PanelRight className="h-4 w-4" /> : <PanelBottom className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { createNewConversation(baseId, tableId, viewId).catch(() => {}); }}
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

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* Conversation sidebar (Step 11: slide-in + time-ago) */}
        <AnimatePresence>
          {showConversationList && (
            <motion.div
              initial={{ x: -240, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -240, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="w-60 border-r border-border flex flex-col shrink-0 bg-background absolute inset-y-0 left-0 z-20"
              style={{ top: isBottom ? '2.5rem' : '3rem' }}
            >
              <div className="px-3 py-2.5 border-b border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Conversations</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="px-3 py-8 text-center text-xs text-muted-foreground/60">
                    No conversations yet — start chatting!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors group rounded-lg mx-1 my-0.5",
                        conv.id === currentConversationId && 'bg-muted shadow-sm'
                      )}
                      onClick={() => selectConversation(conv.id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{conv.title}</div>
                        <div className="text-[10px] text-muted-foreground/50">
                          {formatTimeAgo(conv.updated_at)}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages + Composer */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Welcome state (Step 8: animated with suggestion pills) */}
            {messages.length === 0 && !streamingContent && !thinkingMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="mb-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#369B7D]/80 to-[#4FDB95] flex items-center justify-center shadow-lg shadow-[#39A380]/25">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                    TINYTable AI
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-[340px] leading-relaxed">
                    Your intelligent data assistant. Ask questions, apply filters, create records, and more.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="flex flex-col gap-2 w-full max-w-[300px]"
                >
                  {SUGGESTIONS.map((suggestion, i) => (
                    <motion.div
                      key={suggestion.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                    >
                      <button
                        onClick={() => handleSend(suggestion.prompt)}
                        className="w-full flex items-center gap-3 h-11 rounded-xl text-[13px] font-normal border border-border/60 hover:border-foreground/15 hover:bg-foreground/[0.03] transition-all duration-200 text-foreground/80 hover:text-foreground px-4"
                      >
                        <suggestion.icon className="size-4 text-muted-foreground/60" strokeWidth={1.5} />
                        {suggestion.label}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[10px] text-muted-foreground/40 mt-6"
                >
                  Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">⌘J</kbd> to toggle
                </motion.p>
              </div>
            )}

            {/* Messages (Steps 5+6: right-align user, animations) */}
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isError = msg.action_type === 'error';
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn("flex gap-3 min-w-0", isUser && "flex-row-reverse")}
                  >
                    {!isUser && (
                      isError ? (
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                        </div>
                      ) : (
                        <TinyAvatar />
                      )
                    )}
                    <div className={cn(
                      "max-w-[80%]",
                      !isUser && !isError && "group/msg"
                    )}>
                      <div
                        className={cn(
                          "text-[13px] leading-[1.7]",
                          isUser
                            ? 'bg-foreground/90 text-background px-4 py-3 rounded-[20px] rounded-tr-lg'
                            : isError
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-xl rounded-bl-sm shadow-sm border border-red-200 dark:border-red-800/50 px-3.5 py-2.5'
                              : 'bg-muted/40 rounded-xl rounded-bl-sm px-3.5 py-2.5'
                        )}
                      >
                        {isUser ? msg.content : <MarkdownContent content={msg.content} />}
                      </div>
                      {isError && (
                        <button
                          onClick={() => retryLastMessage(baseId, tableId, viewId)}
                          className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          disabled={isStreaming}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </button>
                      )}
                      {!isUser && !isError && (
                        <MessageActions
                          content={msg.content}
                          messageId={msg.id}
                          feedback={(msg as any).feedback}
                          onRetry={() => retryLastMessage(baseId, tableId, viewId)}
                          onFeedback={(f) => submitFeedback(msg.id, f)}
                        />
                      )}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Streaming content (Step 7: cursor) */}
            {streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 justify-start"
              >
                <TinyAvatar />
                <div className="max-w-[80%] bg-muted/40 rounded-xl rounded-bl-sm px-3.5 py-2.5 text-[13px] leading-[1.7]">
                  <MarkdownContent content={streamingContent} />
                  <span className="inline-block w-[2px] h-[18px] bg-foreground/40 animate-pulse ml-0.5 align-middle rounded-full" />
                </div>
              </motion.div>
            )}

            {/* Thinking block (Step 10: expandable with timing) */}
            {toolSteps.length > 0 && (
              <div className="flex gap-3 justify-start">
                <TinyAvatar />
                <div className="max-w-[80%] flex-1">
                  <ThinkingBlock steps={toolSteps} isStreaming={isStreaming} />
                </div>
              </div>
            )}

            {/* Bouncing dots (Step 4) */}
            {isStreaming && !streamingContent && !thinkingMessage && toolSteps.length === 0 && (
              <div className="flex gap-3 justify-start">
                <TinyAvatar />
                <div className="flex items-center gap-1.5 py-3 px-3.5">
                  <div className="w-2 h-2 rounded-full bg-foreground/20 animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 rounded-full bg-foreground/20 animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-foreground/20 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Consent requests */}
            {consentRequests.map((cr, i) => (
              <div key={`consent-${i}`} className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5} />
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 max-w-[80%] shadow-sm">
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

            {/* Pending actions (Step 12: hover-reveal + animations) */}
            <AnimatePresence initial={false}>
              {pendingActions.map((action) => {
                if (action.actionType === 'generate_formula') {
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 shrink-0" />
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 max-w-[80%] shadow-sm">
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
                    </motion.div>
                  );
                }

                const meta = ACTION_META[action.actionType] || {
                  icon: Sparkles, label: action.actionType, color: 'text-foreground', bgColor: 'bg-muted border-border',
                };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 justify-start group/action"
                  >
                    <div className="w-8 shrink-0" />
                    <div className={`rounded-xl border px-4 py-3 max-w-[80%] shadow-sm ${meta.bgColor}`}>
                      <div className={`flex items-center gap-2 text-xs font-medium mb-1.5 ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {meta.label}
                      </div>
                      <ActionPreview actionType={action.actionType} payload={action.payload} columns={columns} />
                      {action.applied ? (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-green-600 bg-green-50 dark:bg-green-950/30 rounded-md px-2 py-1 border border-green-200/50 dark:border-green-800/50">
                            <Check className="h-3 w-3" />
                            <span>Applied</span>
                          </div>
                          {action.previousState && (
                            <button
                              onClick={() => handleUndoAction(action.id)}
                              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Undo
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 opacity-0 group-hover/action:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleApplyAction(action.id, action.actionType, action.payload)}
                            className={cn(
                              "text-[11px] px-3 py-1 rounded-md text-white transition-colors",
                              action.actionType.includes('filter') ? 'bg-blue-600 hover:bg-blue-700' :
                              action.actionType.includes('sort') ? 'bg-amber-600 hover:bg-amber-700' :
                              action.actionType === 'apply_group_by' ? 'bg-purple-600 hover:bg-purple-700' :
                              action.actionType.includes('color') ? 'bg-pink-600 hover:bg-pink-700' :
                              action.actionType === 'create_record' ? 'bg-green-600 hover:bg-green-700' :
                              action.actionType === 'delete_record' ? 'bg-red-600 hover:bg-red-700' :
                              'bg-foreground/80 hover:bg-foreground/90'
                            )}
                          >
                            {['apply_filter', 'apply_sort', 'apply_group_by', 'add_filter_condition', 'remove_filter_condition', 'add_sort', 'remove_sort'].includes(action.actionType) ? 'Apply to view'
                              : action.actionType === 'create_table' ? 'View Table'
                              : action.actionType === 'preview_extracted_table' ? 'Confirm'
                              : 'Apply'}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Composer (Step 7: auto-expanding textarea + morphing button) */}
          <div className="border-t border-border/60 px-4 py-3 shrink-0 bg-background/80">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.png,.jpg,.jpeg,.webp,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background shadow-sm px-3 py-2 transition-all duration-200 focus-within:border-foreground/20 focus-within:shadow-md">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || isUploading}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
                title="Upload document"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isStreaming ? 'AI is responding...' : 'Ask about your data...'}
                disabled={isStreaming}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] text-foreground placeholder:text-muted-foreground/50 py-1.5 min-h-[36px] max-h-[160px] disabled:opacity-50"
              />
              <button
                onClick={() => isStreaming ? abortCurrentStream() : handleSend()}
                disabled={!isStreaming && !input.trim()}
                className={cn(
                  "size-8 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0 mb-0.5",
                  isStreaming
                    ? "bg-foreground/[0.06] text-foreground hover:bg-foreground/10"
                    : input.trim()
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-foreground/[0.06] text-foreground/30"
                )}
              >
                {isStreaming ? (
                  <Square className="size-3.5" />
                ) : (
                  <ArrowUp className="size-4" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
