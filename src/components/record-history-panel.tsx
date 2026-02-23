import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getRecordHistory } from '@/services/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, History, ArrowRight } from 'lucide-react';

interface HistoryEntry {
  id: number;
  record_id: number;
  field_id: string;
  field_name: string | null;
  before_value: any;
  after_value: any;
  action: 'create' | 'update' | 'delete';
  changed_by: { user_id?: string; name?: string; email?: string } | null;
  changed_at: string;
}

interface RecordHistoryPanelProps {
  baseId: string;
  tableId: string;
  recordId: string;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecordHistoryPanel({ baseId, tableId, recordId }: RecordHistoryPanelProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecordHistory({
        baseId,
        tableId,
        recordId,
        page: pageNum,
        pageSize: 50,
      });
      const data = res?.data?.data || res?.data || {};
      const records = data.records || [];
      setTotalPages(data.totalPages || 1);
      if (append) {
        setEntries(prev => [...prev, ...records]);
      } else {
        setEntries(records);
      }
    } catch (err) {
      console.error('Failed to fetch record history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [baseId, tableId, recordId]);

  useEffect(() => {
    setEntries([]);
    setPage(1);
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  };

  const groupedByTime = entries.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    const date = new Date(entry.changed_at);
    const key = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  if (loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-xs">{t('history.loading')}</span>
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <span className="text-xs text-destructive">{error}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <History className="h-8 w-8 mb-3 opacity-40" />
        <span className="text-sm font-medium">{t('history.noHistory')}</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {Object.entries(groupedByTime).map(([dateKey, dayEntries]) => (
          <div key={dateKey}>
            <div className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">
              {dateKey}
            </div>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <HistoryEntryCard key={entry.id} entry={entry} t={t} />
              ))}
            </div>
          </div>
        ))}

        {page < totalPages && (
          <div className="flex justify-center pt-2 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={loading}
              className="text-xs"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              {t('history.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function HistoryEntryCard({ entry, t }: { entry: HistoryEntry; t: any }) {
  const changedBy = entry.changed_by;
  const userName = changedBy
    ? (changedBy.name || changedBy.email || changedBy.user_id || t('history.unknownUser'))
    : 'System';
  const time = formatTimestamp(entry.changed_at);

  if (entry.action === 'create') {
    if (entry.field_id === '__all__') {
      return (
        <div className="rounded-md border border-border/60 p-2.5 bg-card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {t('history.recordCreated')}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {t('history.by')} {userName}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-border/60 p-2.5 bg-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs">
            <span className="font-medium">{entry.field_name || entry.field_id}</span>
            <span className="text-muted-foreground ml-1">{t('history.fieldCreated')}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 max-w-[200px] truncate">
            {formatValue(entry.after_value)}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          {t('history.by')} {userName}
        </div>
      </div>
    );
  }

  if (entry.action === 'delete') {
    return (
      <div className="rounded-md border border-destructive/30 p-2.5 bg-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-destructive">
            {t('history.recordDeleted')}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {t('history.by')} {userName}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border/60 p-2.5 bg-card">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">
          <span className="font-medium">{entry.field_name || entry.field_id}</span>
          <span className="text-muted-foreground ml-1">{t('history.fieldUpdated')}</span>
        </span>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs flex-wrap">
        <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 max-w-[150px] truncate">
          {formatValue(entry.before_value)}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 max-w-[150px] truncate">
          {formatValue(entry.after_value)}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        {t('history.by')} {userName}
      </div>
    </div>
  );
}
