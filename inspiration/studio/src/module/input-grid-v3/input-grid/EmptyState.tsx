import { Plus, FileJson, Upload, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GridMode } from './types';

interface EmptyStateProps {
  mode: GridMode;
  onAddField: () => void;
  readOnly?: boolean;
}

export function EmptyState({ mode, onAddField, readOnly = false }: EmptyStateProps) {
  const isSchema = mode === 'schema';

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        {isSchema ? (
          <FileJson className="w-7 h-7 text-primary" />
        ) : (
          <Settings2 className="w-7 h-7 text-primary" />
        )}
      </div>
      
      <h3 className="text-base font-semibold text-foreground mb-1">
        {isSchema ? 'Define your data structure' : 'Start adding fields'}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-5 max-w-[260px]">
        {isSchema 
          ? 'Add typed fields to build your schema, or import existing data.' 
          : 'Add key-value pairs to store your data.'}
      </p>

      {!readOnly && (
        <div className="flex flex-col items-center gap-3">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onAddField();
            }} 
            size="sm" 
            data-testid="empty-state-add-button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Field
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px w-8 bg-border" />
            <span>or</span>
            <div className="h-px w-8 bg-border" />
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Upload className="w-3.5 h-3.5" />
            <span>Drag & drop a JSON or CSV file</span>
          </div>
        </div>
      )}
    </div>
  );
}

