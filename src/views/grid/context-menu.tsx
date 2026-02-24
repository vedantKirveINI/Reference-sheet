import { useEffect, useRef } from 'react';
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
  currentColor?: string | null;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const COLOR_PALETTE = [
  { name: 'Red', value: '#FEE2E2' },
  { name: 'Orange', value: '#FFEDD5' },
  { name: 'Amber', value: '#FEF3C7' },
  { name: 'Green', value: '#DCFCE7' },
  { name: 'Teal', value: '#CCFBF1' },
  { name: 'Blue', value: '#DBEAFE' },
  { name: 'Indigo', value: '#E0E7FF' },
  { name: 'Purple', value: '#EDE9FE' },
  { name: 'Pink', value: '#FCE7F3' },
  { name: 'Gray', value: '#F3F4F6' },
];

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
            <div key={index} className="px-3 py-2">
              <div className="flex items-center gap-1.5 mb-2">
                {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">{item.icon}</span>}
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${item.currentColor === c.value ? 'border-foreground/60 shadow-sm' : 'border-transparent hover:border-foreground/30'}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => { item.onColorSelect!(c.value); onClose(); }}
                  >
                    {item.currentColor === c.value && <Check className="h-3 w-3 text-foreground/70" />}
                  </button>
                ))}
                <button
                  title="Clear color"
                  className={`w-7 h-7 rounded-full border-2 border-dashed transition-all hover:scale-110 flex items-center justify-center ${!item.currentColor ? 'border-foreground/40 text-foreground/50' : 'border-muted-foreground/30 text-muted-foreground/50 hover:border-foreground/40 hover:text-foreground/60'}`}
                  onClick={() => { item.onColorSelect!(null); onClose(); }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
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
  onSetColumnColor?: (color: string | null) => void;
  currentColumnColor?: string | null;
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

    {
      label: t ? t('grid:header.setColumnColor') : 'Column color',
      icon: <Palette className="h-4 w-4" />,
      onClick: () => {},
      colorPicker: true,
      onColorSelect: params.onSetColumnColor,
      currentColor: params.currentColumnColor,
    },
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
      currentColor: params.currentCellColor,
    });
  }

  items.push({
    label: t ? t('grid:contextMenu.setRowColor') : 'Set row color',
    icon: <Palette className="h-4 w-4" />,
    onClick: () => {},
    colorPicker: true,
    onColorSelect: params.onSetRowColor,
    currentColor: params.currentRowColor,
  });

  return items;
}
