import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';
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
  Sparkles,
  Palette,
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
  colorPicker?: boolean;
  onColorSelect?: (color: string | null) => void;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const COLOR_PALETTE = [
  { name: 'Light Red', value: '#FECACA' },
  { name: 'Light Orange', value: '#FED7AA' },
  { name: 'Light Yellow', value: '#FEF08A' },
  { name: 'Light Green', value: '#BBF7D0' },
  { name: 'Light Teal', value: '#A5F3FC' },
  { name: 'Light Blue', value: '#BFDBFE' },
  { name: 'Light Purple', value: '#DDD6FE' },
  { name: 'Light Pink', value: '#FBCFE8' },
  { name: 'Light Gray', value: '#E5E7EB' },
  { name: 'White', value: '#FFFFFF' },
];

function ColorPalette({ onSelect, onClose, currentColor }: { onSelect: (color: string | null) => void; onClose: () => void; currentColor?: string | null }) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c.value}
            title={c.name}
            className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${currentColor === c.value ? 'border-brand-500 ring-1 ring-brand-500' : 'border-border/60 hover:border-foreground/40'}`}
            style={{ backgroundColor: c.value }}
            onClick={() => { onSelect(c.value); onClose(); }}
          />
        ))}
      </div>
      <button
        className="w-full text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded hover:bg-accent transition-colors"
        onClick={() => { onSelect(null); onClose(); }}
      >
        Clear color
      </button>
    </div>
  );
}

function ColorPickerMenuItem({ item, onClose }: { item: ContextMenuItem; onClose: () => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setShowPicker(true)} onMouseLeave={() => setShowPicker(false)}>
      <button
        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors text-popover-foreground hover:bg-accent"
        onClick={() => setShowPicker(!showPicker)}
      >
        {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        <span className="text-muted-foreground text-xs">▶</span>
      </button>
      {showPicker && (
        <div className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-lg shadow-lg z-[10000]">
          <ColorPalette onSelect={item.onColorSelect!} onClose={onClose} />
        </div>
      )}
    </div>
  );
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
        if (item.colorPicker && item.onColorSelect) {
          return (
            <ColorPickerMenuItem
              key={index}
              item={item}
              onClose={onClose}
            />
          );
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
  onAskAboutField?: () => void;
  t?: TFunction;
}): ContextMenuItem[] {
  const currentWrap = params.currentTextWrapMode ?? TextWrapMode.Clip;
  const t = params.t;
  return [
    { label: t ? t('grid:header.editField') : 'Edit field', icon: <Pencil className="h-4 w-4" />, onClick: () => params.onEditField?.() },
    { label: t ? t('common:duplicate') + ' ' + t('common:fields.fieldName').toLowerCase() : 'Duplicate field', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateColumn?.() },
    { label: t ? t('grid:header.insertLeft') : 'Insert field before', icon: <ArrowLeft className="h-4 w-4" />, onClick: () => params.onInsertBefore?.() },
    { label: t ? t('grid:header.insertRight') : 'Insert field after', icon: <ArrowRight className="h-4 w-4" />, onClick: () => params.onInsertAfter?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('grid:header.sortAscending') : 'Sort A → Z', icon: <ArrowUpAZ className="h-4 w-4" />, onClick: () => params.onSortAsc?.() },
    { label: t ? t('grid:header.sortDescending') : 'Sort Z → A', icon: <ArrowDownAZ className="h-4 w-4" />, onClick: () => params.onSortDesc?.() },
    { label: t ? t('common:filter') : 'Filter by this field', icon: <Filter className="h-4 w-4" />, onClick: () => params.onFilterByColumn?.() },
    { label: t ? t('common:group') : 'Group by this field', icon: <Layers className="h-4 w-4" />, onClick: () => params.onGroupByColumn?.() },
    { label: t ? t('common:records.askAi') : 'Ask AI about this field', icon: <Sparkles className="h-4 w-4" />, onClick: () => params.onAskAboutField?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: params.isFrozen ? (t ? t('grid:header.unfreezeColumns') : 'Unfreeze column') : (t ? t('grid:header.freezeColumn') : 'Freeze up to this column'), icon: <Lock className="h-4 w-4" />, onClick: () => params.onFreezeColumn?.() },
    { label: t ? t('grid:header.hideField') : 'Hide field', icon: <EyeOff className="h-4 w-4" />, onClick: () => params.onHideColumn?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('common:hide') + ' text' : 'Clip text', icon: <Scissors className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Clip), checked: currentWrap === TextWrapMode.Clip },
    { label: t ? t('common:show') + ' text' : 'Wrap text', icon: <WrapText className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Wrap), checked: currentWrap === TextWrapMode.Wrap },
    { label: 'Overflow text', icon: <MoveHorizontal className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Overflow), checked: currentWrap === TextWrapMode.Overflow },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('grid:header.deleteField') : 'Delete field', icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteColumn?.(), destructive: true },
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
  t?: TFunction;
}): ContextMenuItem[] {
  const t = params.t;
  return [
    { label: t ? t('grid:contextMenu.insertRowAbove') : 'Insert row above', icon: <ArrowUp className="h-4 w-4" />, onClick: () => params.onInsertAbove?.() },
    { label: t ? t('grid:contextMenu.insertRowBelow') : 'Insert row below', icon: <ArrowDown className="h-4 w-4" />, onClick: () => params.onInsertBelow?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('grid:contextMenu.expandRow') : 'Expand record', icon: <Maximize2 className="h-4 w-4" />, onClick: () => params.onExpandRecord?.(), disabled: params.isMultipleSelected },
    { label: t ? t('grid:contextMenu.duplicateRow') : 'Duplicate row', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateRow?.(), disabled: params.isMultipleSelected },
    { label: '', onClick: () => {}, separator: true },

    { label: params.isMultipleSelected ? (t ? t('grid:contextMenu.deleteSelectedRows') : 'Delete rows') : (t ? t('grid:contextMenu.deleteRow') : 'Delete row'), icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteRows?.(), destructive: true },
  ];
}

export function getColorMenuItems(params: {
  rowIndex: number;
  colId?: string;
  currentRowColor?: string | null;
  currentCellColor?: string | null;
  onSetRowColor: (color: string | null) => void;
  onSetCellColor?: (color: string | null) => void;
  t?: TFunction;
}): ContextMenuItem[] {
  const t = params.t;
  const items: ContextMenuItem[] = [];

  if (params.colId && params.onSetCellColor) {
    items.push({
      label: t ? t('grid:contextMenu.setCellColor') : 'Set cell color',
      icon: <Palette className="h-4 w-4" />,
      onClick: () => {},
      colorPicker: true,
      onColorSelect: params.onSetCellColor,
    });
  }

  items.push({
    label: t ? t('grid:contextMenu.setRowColor') : 'Set row color',
    icon: <Palette className="h-4 w-4" />,
    onClick: () => {},
    colorPicker: true,
    onColorSelect: params.onSetRowColor,
  });

  return items;
}
