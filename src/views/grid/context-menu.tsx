import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Pencil,
  Copy,
  ArrowLeft,
  ArrowRight,
  ArrowUpAZ,
  ArrowDownAZ,
  Filter,
  Layers,
  Lock,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Scissors,
  WrapText,
  MoveHorizontal,
  Check,
} from 'lucide-react';
import { TextWrapMode } from '@/types';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  checked?: boolean;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = position.x;
    let y = position.y;
    if (x + rect.width > vw) x = vw - rect.width - 4;
    if (y + rect.height > vh) y = vh - rect.height - 4;
    if (x < 0) x = 4;
    if (y < 0) y = 4;
    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
  }, [position]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] bg-popover border border-border rounded-lg shadow-lg py-1"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="border-t border-border my-1" />;
        }
        return (
          <button
            key={index}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors
              ${item.disabled ? 'text-muted-foreground cursor-default' : item.destructive ? 'text-destructive hover:bg-destructive/10' : 'text-popover-foreground hover:bg-accent'}
            `}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
          >
            {item.checked !== undefined ? (
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {item.checked ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
            ) : null}
            {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export interface IColumn {
  name: string;
  [key: string]: any;
}

export function getHeaderMenuItems(params: {
  column: IColumn;
  columnIndex: number;
  onEditField?: () => void;
  onDuplicateColumn?: () => void;
  onInsertBefore?: () => void;
  onInsertAfter?: () => void;
  onSortAsc?: () => void;
  onSortDesc?: () => void;
  onFilterByColumn?: () => void;
  onGroupByColumn?: () => void;
  onHideColumn?: () => void;
  onDeleteColumn?: () => void;
  onFreezeColumn?: () => void;
  isFrozen?: boolean;
  onSetTextWrap?: (mode: TextWrapMode) => void;
  currentTextWrapMode?: TextWrapMode;
}): ContextMenuItem[] {
  const currentWrap = params.currentTextWrapMode ?? TextWrapMode.Clip;
  return [
    // Section 1: Field Editing
    { label: 'Edit field', icon: <Pencil className="h-4 w-4" />, onClick: () => params.onEditField?.() },
    { label: 'Duplicate field', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateColumn?.() },
    { label: 'Insert field before', icon: <ArrowLeft className="h-4 w-4" />, onClick: () => params.onInsertBefore?.() },
    { label: 'Insert field after', icon: <ArrowRight className="h-4 w-4" />, onClick: () => params.onInsertAfter?.() },
    { label: '', onClick: () => {}, separator: true },

    // Section 2: Data Organization
    { label: 'Sort A → Z', icon: <ArrowUpAZ className="h-4 w-4" />, onClick: () => params.onSortAsc?.() },
    { label: 'Sort Z → A', icon: <ArrowDownAZ className="h-4 w-4" />, onClick: () => params.onSortDesc?.() },
    { label: 'Filter by this field', icon: <Filter className="h-4 w-4" />, onClick: () => params.onFilterByColumn?.() },
    { label: 'Group by this field', icon: <Layers className="h-4 w-4" />, onClick: () => params.onGroupByColumn?.() },
    { label: '', onClick: () => {}, separator: true },

    // Section 3: Visibility
    { label: params.isFrozen ? 'Unfreeze column' : 'Freeze up to this column', icon: <Lock className="h-4 w-4" />, onClick: () => params.onFreezeColumn?.() },
    { label: 'Hide field', icon: <EyeOff className="h-4 w-4" />, onClick: () => params.onHideColumn?.() },
    { label: '', onClick: () => {}, separator: true },

    // Section 4: Text Wrap Mode
    { label: 'Clip text', icon: <Scissors className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Clip), checked: currentWrap === TextWrapMode.Clip },
    { label: 'Wrap text', icon: <WrapText className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Wrap), checked: currentWrap === TextWrapMode.Wrap },
    { label: 'Overflow text', icon: <MoveHorizontal className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Overflow), checked: currentWrap === TextWrapMode.Overflow },
    { label: '', onClick: () => {}, separator: true },

    // Section 5: Deletion
    { label: 'Delete field', icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteColumn?.(), destructive: true },
  ];
}

export function getRecordMenuItems(params: {
  rowIndex: number;
  isMultipleSelected: boolean;
  onExpandRecord?: () => void;
  onInsertAbove?: () => void;
  onInsertBelow?: () => void;
  onDuplicateRow?: () => void;
  onDeleteRows?: () => void;
  onCopyRowUrl?: () => void;
}): ContextMenuItem[] {
  return [
    // Section 1: Insert
    { label: 'Insert row above', icon: <ArrowUp className="h-4 w-4" />, onClick: () => params.onInsertAbove?.() },
    { label: 'Insert row below', icon: <ArrowDown className="h-4 w-4" />, onClick: () => params.onInsertBelow?.() },
    { label: '', onClick: () => {}, separator: true },

    // Section 2: Record Operations
    { label: 'Expand record', icon: <Maximize2 className="h-4 w-4" />, onClick: () => params.onExpandRecord?.(), disabled: params.isMultipleSelected },
    { label: 'Duplicate row', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateRow?.(), disabled: params.isMultipleSelected },
    { label: '', onClick: () => {}, separator: true },

    // Section 3: Deletion
    { label: params.isMultipleSelected ? 'Delete rows' : 'Delete row', icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteRows?.(), destructive: true },
  ];
}
