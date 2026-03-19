import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  MessageSquare,
  Scissors,
  WrapText,
  MoveHorizontal,
  Check,
  Sparkles,
  Zap,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { TextWrapMode } from '@/types';
import { ColorPalettePicker } from './ColorPalettePicker';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  checked?: boolean;
  submenuItems?: ContextMenuItem[];
  submenuContent?: React.ReactNode;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

function SubmenuFlyout({
  item,
  triggerRect,
  parentMenuRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  item: ContextMenuItem;
  triggerRect: DOMRect;
  parentMenuRect: DOMRect;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flyoutRef.current) return;
    const el = flyoutRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Position to the right of the parent menu by default
    let left = parentMenuRect.right + 2;
    let top = triggerRect.top;

    // If overflows right, flip to the left side
    if (left + rect.width > vw) {
      left = parentMenuRect.left - rect.width - 2;
    }
    // If still overflows left, clamp
    if (left < 4) left = 4;

    // If overflows bottom, shift up
    if (top + rect.height > vh) {
      top = vh - rect.height - 4;
    }
    if (top < 4) top = 4;

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  });

  const renderContent = () => {
    if (item.submenuContent) {
      return React.isValidElement(item.submenuContent)
        ? React.cloneElement(item.submenuContent as React.ReactElement<any>, { onClose })
        : item.submenuContent;
    }
    if (item.submenuItems) {
      return item.submenuItems.map((sub, i) => {
        if (sub.separator) {
          return <div key={i} className="border-t border-border my-1" />;
        }
        return (
          <button
            key={i}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors
              ${sub.disabled ? 'text-muted-foreground cursor-default' : sub.destructive ? 'text-destructive hover:bg-destructive/10' : 'text-popover-foreground hover:bg-accent'}
            `}
            onClick={() => {
              if (sub.disabled) return;
              sub.onClick();
              onClose();
            }}
            disabled={sub.disabled}
          >
            <span className="flex items-center gap-2.5 flex-1">
              {sub.checked !== undefined ? (
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  {sub.checked ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              ) : null}
              {sub.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{sub.icon}</span>}
              <span className="truncate">{sub.label}</span>
            </span>
          </button>
        );
      });
    }
    return null;
  };

  return createPortal(
    <div
      ref={flyoutRef}
      data-submenu-flyout
      className="fixed z-[10000] min-w-[180px] bg-popover border border-border rounded-lg shadow-lg py-1"
      style={{ left: -9999, top: -9999 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {renderContent()}
    </div>,
    document.body
  );
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const startCloseTimer = useCallback(() => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenSubmenuIndex(null);
      setTriggerRect(null);
    }, 150);
  }, [cancelCloseTimer]);

  useEffect(() => {
    return () => cancelCloseTimer();
  }, [cancelCloseTimer]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is inside the menu or any flyout submenu
      if (menuRef.current && menuRef.current.contains(target)) return;
      // Check if click is inside a flyout (portaled to body)
      const flyouts = document.querySelectorAll('[data-submenu-flyout]');
      for (const flyout of flyouts) {
        if (flyout.contains(target)) return;
      }
      onClose();
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

  const hasSubmenu = (item: ContextMenuItem) => !!(item.submenuItems || item.submenuContent);

  const menuRect = menuRef.current?.getBoundingClientRect();

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] max-h-[calc(100vh-8px)] overflow-y-auto bg-popover border border-border rounded-lg shadow-lg py-1"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="border-t border-border my-1" />;
        }
        const isSubmenu = hasSubmenu(item);
        return (
          <React.Fragment key={index}>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors
                ${item.disabled ? 'text-muted-foreground cursor-default' : item.destructive ? 'text-destructive hover:bg-destructive/10' : 'text-popover-foreground hover:bg-accent'}
                ${isSubmenu && openSubmenuIndex === index ? 'bg-accent' : ''}
              `}
              onMouseEnter={(e) => {
                cancelCloseTimer();
                if (isSubmenu) {
                  setOpenSubmenuIndex(index);
                  setTriggerRect(e.currentTarget.getBoundingClientRect());
                } else {
                  setOpenSubmenuIndex(null);
                  setTriggerRect(null);
                }
              }}
              onMouseLeave={() => {
                if (isSubmenu) startCloseTimer();
              }}
              onClick={() => {
                if (item.disabled || isSubmenu) return;
                item.onClick();
                onClose();
              }}
              disabled={item.disabled}
            >
              <span className="flex items-center gap-2.5 flex-1">
                {item.checked !== undefined ? (
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {item.checked ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                ) : null}
                {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
              {isSubmenu ? (
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              ) : item.shortcut ? (
                <span className="ml-3 text-[11px] text-muted-foreground tabular-nums tracking-wide">
                  {item.shortcut}
                </span>
              ) : null}
            </button>
            {isSubmenu && openSubmenuIndex === index && triggerRect && menuRect && (
              <SubmenuFlyout
                item={item}
                triggerRect={triggerRect}
                parentMenuRect={menuRect}
                onClose={onClose}
                onMouseEnter={cancelCloseTimer}
                onMouseLeave={startCloseTimer}
              />
            )}
          </React.Fragment>
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
  onEnrichAll?: () => void;
  isEnrichmentColumn?: boolean;
  t?: TFunction;
}): ContextMenuItem[] {
  const currentWrap = params.currentTextWrapMode ?? TextWrapMode.Clip;
  const t = params.t;
  const items: ContextMenuItem[] = [
    { label: t ? t('grid:header.editField') : 'Edit field', icon: <Pencil className="h-4 w-4" />, onClick: () => params.onEditField?.() },
    // Duplicate field option intentionally hidden for now.
    // { label: t ? t('common:duplicate') + ' ' + t('common:fields.fieldName').toLowerCase() : 'Duplicate field', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateColumn?.() },
    { label: t ? t('grid:header.insertLeft') : 'Insert field before', icon: <ArrowLeft className="h-4 w-4" />, onClick: () => params.onInsertBefore?.() },
    { label: t ? t('grid:header.insertRight') : 'Insert field after', icon: <ArrowRight className="h-4 w-4" />, onClick: () => params.onInsertAfter?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('grid:header.sortAscending') : 'Sort A → Z', icon: <ArrowUpAZ className="h-4 w-4" />, onClick: () => params.onSortAsc?.() },
    { label: t ? t('grid:header.sortDescending') : 'Sort Z → A', icon: <ArrowDownAZ className="h-4 w-4" />, onClick: () => params.onSortDesc?.() },
    { label: t ? t('common:filter') : 'Filter by this field', icon: <Filter className="h-4 w-4" />, onClick: () => params.onFilterByColumn?.() },
    { label: t ? t('common:records.askAi') : 'Ask AI about this field', icon: <Sparkles className="h-4 w-4" />, onClick: () => params.onAskAboutField?.() },
    { label: '', onClick: () => {}, separator: true },

    { label: params.isFrozen ? (t ? t('grid:header.unfreezeColumns') : 'Unfreeze column') : (t ? t('grid:header.freezeColumn') : 'Freeze up to this column'), icon: <Lock className="h-4 w-4" />, onClick: () => params.onFreezeColumn?.() },
    { label: t ? t('grid:header.hideField') : 'Hide field', icon: <EyeOff className="h-4 w-4" />, onClick: () => params.onHideColumn?.() },
    { label: '', onClick: () => {}, separator: true },

    {
      label: 'Text wrapping',
      icon: <WrapText className="h-4 w-4" />,
      onClick: () => {},
      submenuItems: [
        { label: t ? t('common:hide') + ' text' : 'Clip text', icon: <Scissors className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Clip), checked: currentWrap === TextWrapMode.Clip },
        { label: t ? t('common:show') + ' text' : 'Wrap text', icon: <WrapText className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Wrap), checked: currentWrap === TextWrapMode.Wrap },
        { label: 'Overflow text', icon: <MoveHorizontal className="h-4 w-4" />, onClick: () => params.onSetTextWrap?.(TextWrapMode.Overflow), checked: currentWrap === TextWrapMode.Overflow },
      ],
    },
    { label: '', onClick: () => {}, separator: true },

    ...(params.isEnrichmentColumn ? [
      { label: 'Enrich all records', icon: <Zap className="h-4 w-4" />, onClick: () => params.onEnrichAll?.() },
      { label: '', onClick: () => {}, separator: true },
    ] : []),

    {
      label: t ? t('grid:header.setColumnColor') : 'Column color',
      icon: <Palette className="h-4 w-4" />,
      onClick: () => {},
      submenuContent: (
        <ColorPalettePicker
          currentColor={params.currentColumnColor ?? null}
          onSelect={(color) => { params.onSetColumnColor?.(color); }}
          closeOnSelect
        />
      ),
    },
    { label: '', onClick: () => {}, separator: true },

    { label: t ? t('grid:header.deleteField') : 'Delete field', icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteColumn?.(), destructive: true },
  ];

  if (params.onGroupByColumn) {
    items.splice(
      7,
      0,
      { label: t ? t('common:group') : 'Group by this field', icon: <Layers className="h-4 w-4" />, onClick: () => params.onGroupByColumn?.() },
    );
  }

  return items;
}

export function getRecordMenuItems(params: {
  rowIndex: number;
  isMultipleSelected: boolean;
  onExpandRecord?: () => void;
  onAddComment?: () => void;
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
    { label: t ? t('grid:contextMenu.addComment') : 'Add comment', icon: <MessageSquare className="h-4 w-4" />, onClick: () => params.onAddComment?.(), disabled: params.isMultipleSelected },
    // Duplicate row option intentionally hidden from context menu for now.
    // { label: t ? t('grid:contextMenu.duplicateRow') : 'Duplicate row', icon: <Copy className="h-4 w-4" />, onClick: () => params.onDuplicateRow?.(), disabled: params.isMultipleSelected },
    { label: '', onClick: () => {}, separator: true },

    { label: params.isMultipleSelected ? (t ? t('grid:contextMenu.deleteSelectedRows') : 'Delete rows') : (t ? t('grid:contextMenu.deleteRow') : 'Delete row'), icon: <Trash2 className="h-4 w-4" />, onClick: () => params.onDeleteRows?.(), destructive: true },
  ];
}
