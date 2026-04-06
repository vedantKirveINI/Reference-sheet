import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (adjustedCount: number) => void;
  onUpgrade: () => void;
  /** Total items (rows/queries) the user wants to process */
  totalItems: number;
  /** Credits per item */
  costPerItem: number;
  /** Current credit balance */
  balance: number;
  /** Label for what's being processed (e.g., "rows", "records", "searches") */
  itemLabel?: string;
  /** Action type label (e.g., "Company Enrichment", "Business Discovery") */
  actionLabel: string;
}

function formatCompact(value: number) {
  if (value < 1_000) return String(value);
  if (value < 100_000) return value.toLocaleString();
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  const k = value / 1_000;
  return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
}

export function CreditCostDialog({
  open,
  onOpenChange,
  onConfirm,
  onUpgrade,
  totalItems,
  costPerItem,
  balance,
  itemLabel = 'rows',
  actionLabel,
}: CreditCostDialogProps) {
  const maxAffordable = costPerItem > 0 ? Math.floor(balance / costPerItem) : totalItems;
  const canAffordAll = maxAffordable >= totalItems;
  const [adjustedCount, setAdjustedCount] = useState(
    canAffordAll ? totalItems : Math.min(maxAffordable, totalItems),
  );

  const totalCost = adjustedCount * costPerItem;
  const remainingAfter = balance - totalCost;
  const remainingPct = balance > 0 ? Math.max(0, Math.min(100, (remainingAfter / balance) * 100)) : 0;

  const progressColor =
    remainingPct < 25
      ? '[&_[data-slot=progress-indicator]]:bg-destructive'
      : remainingPct < 50
        ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
        : '[&_[data-slot=progress-indicator]]:bg-primary';

  const isValid = adjustedCount > 0 && adjustedCount <= Math.min(maxAffordable, totalItems);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Credit Usage Estimate
          </DialogTitle>
          <DialogDescription>
            {actionLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cost breakdown */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost per {itemLabel.replace(/s$/, '')}</span>
              <span className="font-medium">{costPerItem} credits</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total {itemLabel}</span>
              <span className="font-medium">{totalItems.toLocaleString()}</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex justify-between text-sm">
              <span className="font-medium">Total cost</span>
              <span className="font-bold text-primary">{formatCompact(totalCost)} credits</span>
            </div>
          </div>

          {/* Insufficient credits warning + auto-fix */}
          {!canAffordAll && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    Not enough credits for all {totalItems} {itemLabel}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    You can process up to {maxAffordable.toLocaleString()} {itemLabel} with your current balance.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Process:</span>
                <Input
                  type="number"
                  min={1}
                  max={Math.min(maxAffordable, totalItems)}
                  value={adjustedCount}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(Number(e.target.value), Math.min(maxAffordable, totalItems)));
                    setAdjustedCount(val);
                  }}
                  className="h-8 w-24 text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  of {totalItems.toLocaleString()} {itemLabel}
                </span>
              </div>
            </div>
          )}

          {/* Balance after */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Balance after</span>
              <span className="tabular-nums">{formatCompact(Math.max(0, remainingAfter))} remaining</span>
            </div>
            <Progress
              value={remainingPct}
              className={cn('h-1.5 bg-white/20 dark:bg-white/10', progressColor)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!canAffordAll && (
            <Button variant="secondary" onClick={onUpgrade}>
              Upgrade Plan
            </Button>
          )}
          <Button
            onClick={() => onConfirm(adjustedCount)}
            disabled={!isValid}
          >
            {canAffordAll
              ? `Continue (${formatCompact(totalCost)} credits)`
              : `Process ${adjustedCount.toLocaleString()} ${itemLabel} (${formatCompact(totalCost)} credits)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
