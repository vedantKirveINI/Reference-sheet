import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  Calendar,
  CheckSquare,
  Bug,
  Package,
  Plus,
  Loader2,
  Sparkles,
  Table2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TABLE_TEMPLATES, type TableTemplate } from '@/config/table-templates';

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  TrendingUp,
  Calendar,
  CheckSquare,
  Bug,
  Package,
};

interface CreateTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFromTemplate: (template: TableTemplate) => Promise<void>;
  onCreateBlank: (name: string) => Promise<void>;
}

export function CreateTableModal({
  open,
  onOpenChange,
  onCreateFromTemplate,
  onCreateBlank,
}: CreateTableModalProps) {
  const { t } = useTranslation();
  const [customName, setCustomName] = useState('');
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCustomName('');
      setCreatingId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleTemplateClick = async (template: TableTemplate) => {
    if (creatingId) return;
    setCreatingId(template.id);
    try {
      await onCreateFromTemplate(template);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create table from template:', err);
    } finally {
      setCreatingId(null);
    }
  };

  const handleBlankCreate = async () => {
    const name = customName.trim() || 'Untitled Table';
    if (creatingId) return;
    setCreatingId('blank');
    try {
      await onCreateBlank(name);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create blank table:', err);
    } finally {
      setCreatingId(null);
    }
  };

  const isLoading = creatingId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-theme-accent,#39A380)]" />
            Create a new table
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Start from a template or create a blank table
          </p>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Table2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBlankCreate();
                  if (e.key === 'Escape') onOpenChange(false);
                }}
                placeholder="Enter table name..."
                disabled={isLoading}
                className="w-full h-9 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-theme-accent,#39A380)]/40 focus:border-[var(--color-theme-accent,#39A380)] disabled:opacity-50 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleBlankCreate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-md px-3 h-9 text-sm font-medium bg-[var(--color-theme-accent,#39A380)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {creatingId === 'blank' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Create
            </button>
          </div>
        </div>

        <div className="border-t border-border/50">
          <div className="px-6 pt-4 pb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Templates
            </span>
          </div>
          <div className="px-6 pb-6 grid grid-cols-2 gap-2.5">
            {TABLE_TEMPLATES.map((template) => {
              const IconComponent = ICON_MAP[template.icon] || Table2;
              const isThis = creatingId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateClick(template)}
                  disabled={isLoading}
                  className="group relative flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition-all duration-150 hover:border-[var(--color-theme-accent,#39A380)]/50 hover:bg-[var(--color-theme-accent,#39A380)]/5 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-theme-accent,#39A380)]/10 text-[var(--color-theme-accent,#39A380)] group-hover:bg-[var(--color-theme-accent,#39A380)]/20 transition-colors">
                    {isThis ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconComponent className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground leading-tight">
                      {template.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {template.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
