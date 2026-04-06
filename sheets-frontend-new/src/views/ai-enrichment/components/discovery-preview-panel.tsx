import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface DiscoveryPreviewPanelProps {
  tableName?: string;
  tableNameError?: boolean;
  onTableNameChange?: (value: string) => void;
  recordCount?: number;
}

export interface DiscoveryPreviewPanelHandle {
  scrollSheetNameIntoView: () => void;
}

export const DiscoveryPreviewPanel = forwardRef<DiscoveryPreviewPanelHandle, DiscoveryPreviewPanelProps>(
  ({ tableName = '', tableNameError = false, onTableNameChange, recordCount = 0 }, ref) => {
    const sheetNameInputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      scrollSheetNameIntoView: () => {
        if (sheetNameInputRef.current) {
          sheetNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sheetNameInputRef.current.focus();
        }
      },
    }));

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border/40 bg-muted/20 px-3.5 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{recordCount}</span> records found.
            Name your sheet below and click <span className="font-semibold">Create Table</span> to save them.
          </p>
        </div>

        <div>
          <label
            htmlFor="discovery-table-name"
            className="block text-xs font-semibold text-foreground mb-1"
          >
            Sheet name <span className="text-destructive">*</span>
          </label>
          <Input
            id="discovery-table-name"
            ref={sheetNameInputRef}
            value={tableName}
            onChange={(e) => onTableNameChange?.(e.target.value)}
            placeholder="e.g. NYC Marketing Agencies"
            className={`h-8 rounded-xl text-xs focus-visible:ring-2 ${
              tableNameError
                ? 'border-destructive focus-visible:ring-destructive/40'
                : 'border-border focus-visible:ring-[#39A380]/30'
            }`}
          />
          {tableNameError ? (
            <p className="mt-1 text-[length:var(--app-font-xs)] text-destructive">
              Sheet name is required to create the sheet.
            </p>
          ) : (
            <p className="mt-1 text-[length:var(--app-font-xs)] text-muted-foreground">
              This will be the name of your new sheet.
            </p>
          )}
        </div>
      </div>
    );
  }
);

DiscoveryPreviewPanel.displayName = 'DiscoveryPreviewPanel';
