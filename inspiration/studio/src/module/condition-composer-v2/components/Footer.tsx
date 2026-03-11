import React from 'react';
import { Plus, FolderPlus, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  onAddCondition: () => void;
  onAddGroup: () => void;
  onClearAll: () => void;
  isEmpty?: boolean;
}

export function Footer({ onAddCondition, onAddGroup, onClearAll, isEmpty = false }: FooterProps) {
  if (isEmpty) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-3">
          <Filter className="w-5 h-5 text-[#22C55E]" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Add conditions to filter your records
        </p>
        <Button
          type="button"
          size="sm"
          onClick={onAddCondition}
          className="h-8 bg-gray-900 hover:bg-gray-800 text-white"
          data-testid="filter-add-condition-btn"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Filter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAddCondition}
        className="h-8 text-xs font-medium text-foreground hover:bg-accent"
        data-testid="filter-add-condition-btn"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Condition
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAddGroup}
        className="h-8 text-xs font-medium text-foreground hover:bg-accent"
        data-testid="filter-add-condition-group-btn"
      >
        <FolderPlus className="h-4 w-4 mr-1.5" />
        Add Group
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-8 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        data-testid="filter-clear-all-btn"
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        Clear All
      </Button>
    </div>
  );
}

export default Footer;
