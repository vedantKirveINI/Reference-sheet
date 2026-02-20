import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ITableData, ROW_HEIGHT_DEFINITIONS } from '@/types';
import { GridRenderer } from './canvas/renderer';
import { GRID_THEME } from './canvas/theme';
import { ICellPosition, IScrollState } from './canvas/types';
import { CellEditorOverlay } from './cell-editor-overlay';
import { ContextMenu, ContextMenuItem } from './context-menu';
import { useGridViewStore } from '@/stores';
import { useUIStore } from '@/stores';
import {
  Pencil, Copy, ClipboardPaste, Plus, Trash2, Expand,
  ArrowUpAZ, ArrowDownZA, Snowflake, EyeOff
} from 'lucide-react';

interface DragState {
  isDragging: boolean;
  dragColIndex: number;
  dragTargetIndex: number;
  dragX: number;
  startX: number;
  startY: number;
  didStartDrag: boolean;
}

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
}

interface GridViewProps {
  data: ITableData;
  onCellChange?: (recordId: string, columnId: string, value: any) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  hiddenColumnIds?: Set<string>;
  onAddRow?: () => void;
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  onExpandRecord?: (recordId: string) => void;
  onRecordUpdate?: (recordId: string, cells: Record<string, any>) => void;
  onInsertRowAbove?: (rowIndex: number) => void;
  onInsertRowBelow?: (rowIndex: number) => void;
  onDeleteColumn?: (columnId: string) => void;
  onDuplicateColumn?: (columnId: string) => void;
  onInsertColumnBefore?: (columnId: string) => void;
  onInsertColumnAfter?: (columnId: string) => void;
  onSortColumn?: (columnId: string, direction: 'asc' | 'desc') => void;
  onFreezeColumn?: (columnId: string) => void;
  onUnfreezeColumns?: () => void;
  onHideColumn?: (columnId: string) => void;
}

export function GridView({
  data, onCellChange, onColumnReorder, hiddenColumnIds, onAddRow,
  onDeleteRows, onDuplicateRow, onExpandRecord,
  onInsertRowAbove, onInsertRowBelow,
  onDeleteColumn, onDuplicateColumn, onInsertColumnBefore, onInsertColumnAfter,
  onSortColumn, onFreezeColumn, onUnfreezeColumns, onHideColumn,
}: GridViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GridRenderer | null>(null);

  const [activeCell, setActiveCell] = useState<ICellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<ICellPosition | null>(null);
  const [scrollState, setScrollState] = useState<IScrollState>({ scrollTop: 0, scrollLeft: 0 });
  const [resizing, setResizing] = useState<{ colIndex: number; startX: number; startWidth: number } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragColIndex: -1,
    dragTargetIndex: -1,
    dragX: 0,
    startX: 0,
    startY: 0,
    didStartDrag: false,
  });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, position: { x: 0, y: 0 }, items: [] });

  const { setSelectedRows: setStoreSelectedRows } = useGridViewStore();
  const { rowHeightLevel, zoomLevel } = useUIStore();
  const zoomScale = zoomLevel / 100;
  const [localSelectedRows, setLocalSelectedRows] = useState<Set<number>>(new Set());

  const setSelectedRows = useCallback((updater: Set<number> | ((prev: Set<number>) => Set<number>)) => {
    if (typeof updater === 'function') {
      setLocalSelectedRows(prev => {
        const next = updater(prev);
        setStoreSelectedRows(next);
        return next;
      });
    } else {
      setLocalSelectedRows(updater);
      setStoreSelectedRows(updater);
    }
  }, [setStoreSelectedRows]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new GridRenderer(canvasRef.current, data);
    rendererRef.current = renderer;
    const initialHeight = ROW_HEIGHT_DEFINITIONS[rowHeightLevel];
    renderer.setRowHeight(initialHeight);
    if (hiddenColumnIds) {
      renderer.setHiddenColumnIds(hiddenColumnIds);
    }
    const container = containerRef.current;
    if (container) {
      renderer.resize(container.clientWidth, container.clientHeight);
    }
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [data]);

  useEffect(() => {
    if (rendererRef.current && hiddenColumnIds) {
      rendererRef.current.setHiddenColumnIds(hiddenColumnIds);
    }
  }, [hiddenColumnIds]);

  useEffect(() => {
    if (rendererRef.current) {
      const height = ROW_HEIGHT_DEFINITIONS[rowHeightLevel];
      rendererRef.current.setRowHeight(height);
    }
  }, [rowHeightLevel]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setZoomScale(zoomScale);
    }
  }, [zoomScale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      if (rendererRef.current) {
        rendererRef.current.resize(container.clientWidth, container.clientHeight);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    rendererRef.current?.setActiveCell(activeCell ? { row: activeCell.rowIndex, col: activeCell.colIndex } : null);
  }, [activeCell]);

  useEffect(() => {
    rendererRef.current?.setSelectedRows(localSelectedRows);
  }, [localSelectedRows]);

  const totalWidth = useMemo(() => {
    const cm = rendererRef.current?.getCoordinateManager();
    const logicalW = cm
      ? cm.getTotalWidth() + GRID_THEME.rowHeaderWidth + GRID_THEME.appendColumnWidth
      : data.columns.reduce((sum, c) => sum + c.width, 0) + GRID_THEME.rowHeaderWidth + GRID_THEME.appendColumnWidth;
    return logicalW * zoomScale;
  }, [data, scrollState, zoomScale]);

  const totalHeight = useMemo(() => {
    const cm = rendererRef.current?.getCoordinateManager();
    const currentRowH = rendererRef.current?.getRowHeight() ?? ROW_HEIGHT_DEFINITIONS[rowHeightLevel];
    const logicalH = cm
      ? cm.getTotalHeight() + GRID_THEME.headerHeight + GRID_THEME.appendRowHeight
      : data.records.length * currentRowH + GRID_THEME.headerHeight + GRID_THEME.appendRowHeight;
    return logicalH * zoomScale;
  }, [data, scrollState, zoomScale, rowHeightLevel]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const newScroll: IScrollState = {
      scrollTop: target.scrollTop / currentZoom,
      scrollLeft: target.scrollLeft / currentZoom,
    };
    setScrollState(newScroll);
    rendererRef.current?.setScrollState(newScroll);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.didStartDrag) return;

    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth / currentZoom, container.clientHeight / currentZoom);

    if (hit.region === 'cell') {
      if (editingCell && editingCell.rowIndex === hit.rowIndex && editingCell.colIndex === hit.colIndex) return;
      setEditingCell(null);
      setActiveCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
    } else if (hit.region === 'rowHeader') {
      setSelectedRows(prev => {
        const next = new Set(prev);
        if (next.has(hit.rowIndex)) next.delete(hit.rowIndex); else next.add(hit.rowIndex);
        return next;
      });
    } else if (hit.region === 'cornerHeader') {
      const totalRows = data.records.length;
      setSelectedRows(prev => {
        if (prev.size === totalRows) return new Set();
        return new Set(Array.from({ length: totalRows }, (_, i) => i));
      });
    } else if (hit.region === 'appendRow') {
      onAddRow?.();
    } else {
      setEditingCell(null);
    }
  }, [editingCell, data.records.length, dragState.didStartDrag, onAddRow, setSelectedRows]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth / currentZoom, container.clientHeight / currentZoom);

    if (hit.region === 'cell') {
      setActiveCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
      setEditingCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
    } else if (hit.region === 'rowHeader') {
      const record = data.records[hit.rowIndex];
      if (record) {
        onExpandRecord?.(record.id);
      }
    }
  }, [data.records, onExpandRecord]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth / currentZoom, container.clientHeight / currentZoom);
    const menuPosition = { x: e.clientX, y: e.clientY };
    const iconSize = 14;

    if (hit.region === 'cell') {
      const record = data.records[hit.rowIndex];
      const column = renderer.getVisibleColumnAtIndex(hit.colIndex);
      const items: ContextMenuItem[] = [
        {
          label: 'Edit cell',
          icon: <Pencil size={iconSize} />,
          onClick: () => {
            setActiveCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
            setEditingCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
          },
        },
        {
          label: 'Copy',
          icon: <Copy size={iconSize} />,
          onClick: () => {
            if (record && column) {
              const cell = record.cells[column.id];
              const text = cell?.displayData ?? '';
              navigator.clipboard.writeText(text);
            }
          },
        },
        {
          label: 'Paste',
          icon: <ClipboardPaste size={iconSize} />,
          onClick: async () => {
            if (record && column) {
              try {
                const text = await navigator.clipboard.readText();
                onCellChange?.(record.id, column.id, text);
              } catch {}
            }
          },
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Insert row above',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertRowAbove?.(hit.rowIndex),
        },
        {
          label: 'Insert row below',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertRowBelow?.(hit.rowIndex),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Delete row',
          icon: <Trash2 size={iconSize} />,
          destructive: true,
          onClick: () => onDeleteRows?.([hit.rowIndex]),
        },
      ];
      setContextMenu({ visible: true, position: menuPosition, items });
    } else if (hit.region === 'rowHeader') {
      const record = data.records[hit.rowIndex];
      const items: ContextMenuItem[] = [
        {
          label: 'Expand record',
          icon: <Expand size={iconSize} />,
          onClick: () => {
            if (record) onExpandRecord?.(record.id);
          },
        },
        {
          label: 'Duplicate row',
          icon: <Copy size={iconSize} />,
          onClick: () => onDuplicateRow?.(hit.rowIndex),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Insert row above',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertRowAbove?.(hit.rowIndex),
        },
        {
          label: 'Insert row below',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertRowBelow?.(hit.rowIndex),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Delete row',
          icon: <Trash2 size={iconSize} />,
          destructive: true,
          onClick: () => onDeleteRows?.([hit.rowIndex]),
        },
      ];
      if (localSelectedRows.size > 1) {
        items.push({
          label: 'Delete selected rows',
          icon: <Trash2 size={iconSize} />,
          destructive: true,
          onClick: () => onDeleteRows?.(Array.from(localSelectedRows)),
        });
      }
      setContextMenu({ visible: true, position: menuPosition, items });
    } else if (hit.region === 'columnHeader') {
      const column = renderer.getVisibleColumnAtIndex(hit.colIndex);
      if (!column) return;
      const frozenCount = renderer.getFrozenColumnCount();
      const items: ContextMenuItem[] = [
        {
          label: 'Edit field',
          icon: <Pencil size={iconSize} />,
          onClick: () => {},
        },
        {
          label: 'Duplicate field',
          icon: <Copy size={iconSize} />,
          onClick: () => onDuplicateColumn?.(column.id),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Sort A → Z',
          icon: <ArrowUpAZ size={iconSize} />,
          onClick: () => onSortColumn?.(column.id, 'asc'),
        },
        {
          label: 'Sort Z → A',
          icon: <ArrowDownZA size={iconSize} />,
          onClick: () => onSortColumn?.(column.id, 'desc'),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Insert field before',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertColumnBefore?.(column.id),
        },
        {
          label: 'Insert field after',
          icon: <Plus size={iconSize} />,
          onClick: () => onInsertColumnAfter?.(column.id),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Freeze up to this field',
          icon: <Snowflake size={iconSize} />,
          onClick: () => {
            rendererRef.current?.setFrozenColumnCount(hit.colIndex + 1);
            onFreezeColumn?.(column.id);
          },
        },
      ];
      if (frozenCount > 0) {
        items.push({
          label: 'Unfreeze fields',
          icon: <Snowflake size={iconSize} />,
          onClick: () => {
            rendererRef.current?.setFrozenColumnCount(0);
            onUnfreezeColumns?.();
          },
        });
      }
      items.push(
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Hide field',
          icon: <EyeOff size={iconSize} />,
          onClick: () => onHideColumn?.(column.id),
        },
        { label: '', separator: true, onClick: () => {} },
        {
          label: 'Delete field',
          icon: <Trash2 size={iconSize} />,
          destructive: true,
          onClick: () => onDeleteColumn?.(column.id),
        },
      );
      setContextMenu({ visible: true, position: menuPosition, items });
    }
  }, [data, localSelectedRows, onCellChange, onInsertRowAbove, onInsertRowBelow, onDeleteRows, onDuplicateRow, onExpandRecord, onDeleteColumn, onDuplicateColumn, onInsertColumnBefore, onInsertColumnAfter, onSortColumn, onFreezeColumn, onUnfreezeColumns, onHideColumn]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth / currentZoom, container.clientHeight / currentZoom);

    if (hit.region === 'columnHeader' && hit.isResizeHandle) {
      e.preventDefault();
      e.stopPropagation();
      const colWidths = renderer.getColumnWidths();
      setResizing({ colIndex: hit.colIndex, startX: e.clientX, startWidth: colWidths[hit.colIndex] });
    } else if (hit.region === 'columnHeader' && !hit.isResizeHandle) {
      setDragState({
        isDragging: false,
        dragColIndex: hit.colIndex,
        dragTargetIndex: hit.colIndex,
        dragX: e.clientX,
        startX: e.clientX,
        startY: e.clientY,
        didStartDrag: false,
      });
    }
  }, []);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(GRID_THEME.minColumnWidth, resizing.startWidth + delta);
      rendererRef.current?.setColumnWidth(resizing.colIndex, newWidth);
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (dragState.dragColIndex < 0) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - dragState.startX);
      const dy = Math.abs(e.clientY - dragState.startY);

      if (!dragState.isDragging && (dx > 5 || dy > 5)) {
        setDragState(prev => ({ ...prev, isDragging: true, didStartDrag: true, dragX: e.clientX }));
        return;
      }

      if (dragState.isDragging) {
        const renderer = rendererRef.current;
        const container = containerRef.current;
        if (!renderer || !container) return;

        const rect = container.getBoundingClientRect();
        const currentZoom = useUIStore.getState().zoomLevel / 100;
        const localX = (e.clientX - rect.left) / currentZoom;
        const cm = renderer.getCoordinateManager();
        const scroll = renderer.getScrollState();
        const visibleCount = renderer.getVisibleColumnCount();

        let targetIndex = dragState.dragColIndex;
        for (let i = 0; i < visibleCount; i++) {
          const colX = cm.getColumnX(i, scroll.scrollLeft);
          const colW = renderer.getVisibleColumnWidths()[i] || 100;
          const mid = colX + colW / 2;
          if (localX < mid) {
            targetIndex = i;
            break;
          }
          targetIndex = i + 1;
        }
        targetIndex = Math.min(targetIndex, visibleCount - 1);
        targetIndex = Math.max(0, targetIndex);

        setDragState(prev => ({ ...prev, dragX: e.clientX, dragTargetIndex: targetIndex }));
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging && dragState.dragColIndex !== dragState.dragTargetIndex) {
        rendererRef.current?.reorderVisibleColumn(dragState.dragColIndex, dragState.dragTargetIndex);
        onColumnReorder?.(dragState.dragColIndex, dragState.dragTargetIndex);
      }
      setTimeout(() => {
        setDragState({
          isDragging: false,
          dragColIndex: -1,
          dragTargetIndex: -1,
          dragX: 0,
          startX: 0,
          startY: 0,
          didStartDrag: false,
        });
      }, 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.dragColIndex, dragState.isDragging, dragState.startX, dragState.startY, dragState.dragTargetIndex, onColumnReorder]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const y = (e.clientY - rect.top) / currentZoom;
    const scroll = renderer.getScrollState();
    const { headerHeight } = GRID_THEME;
    const rowHeight = renderer.getRowHeight();

    if (y > headerHeight) {
      const scrolledY = y - headerHeight + scroll.scrollTop;
      const rowIndex = Math.floor(scrolledY / rowHeight);
      renderer.setHoveredRow(rowIndex < data.records.length ? rowIndex : -1);
    } else {
      renderer.setHoveredRow(-1);
    }
  }, [data.records.length]);

  const handleMouseLeave = useCallback(() => {
    rendererRef.current?.setHoveredRow(-1);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeCell) return;

    if (e.key === 'Enter' && e.shiftKey && !editingCell) {
      e.preventDefault();
      const record = data.records[activeCell.rowIndex];
      if (record) {
        onExpandRecord?.(record.id);
      }
      return;
    }

    if (e.key === 'F2' && !editingCell) {
      e.preventDefault();
      setEditingCell({ rowIndex: activeCell.rowIndex, colIndex: activeCell.colIndex });
      return;
    }

    if (e.key === 'Escape' && editingCell) {
      setEditingCell(null);
      return;
    }

    if (editingCell) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingCell({ rowIndex: activeCell.rowIndex, colIndex: activeCell.colIndex });
      return;
    }

    const totalRows = data.records.length;
    const totalCols = rendererRef.current?.getVisibleColumnCount() ?? data.columns.length;
    let nextRow = activeCell.rowIndex;
    let nextCol = activeCell.colIndex;

    switch (e.key) {
      case 'ArrowUp': nextRow = Math.max(0, nextRow - 1); break;
      case 'ArrowDown': nextRow = Math.min(totalRows - 1, nextRow + 1); break;
      case 'ArrowLeft': nextCol = Math.max(0, nextCol - 1); break;
      case 'ArrowRight': nextCol = Math.min(totalCols - 1, nextCol + 1); break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          nextCol--;
          if (nextCol < 0) { nextCol = totalCols - 1; nextRow = Math.max(0, nextRow - 1); }
        } else {
          nextCol++;
          if (nextCol >= totalCols) {
            if (nextRow >= totalRows - 1) {
              onAddRow?.();
              nextCol = 0;
              nextRow = totalRows;
            } else {
              nextCol = 0;
              nextRow = nextRow + 1;
            }
          }
        }
        break;
      default: return;
    }

    e.preventDefault();
    setActiveCell({ rowIndex: nextRow, colIndex: nextCol });
  }, [activeCell, editingCell, data.records.length, data.columns.length, onAddRow, onExpandRecord]);

  const handleCommit = useCallback((value: any) => {
    if (!editingCell) return;
    setEditingCell(null);
    const renderer = rendererRef.current;
    if (!renderer) return;
    const record = data.records[editingCell.rowIndex];
    const column = renderer.getVisibleColumnAtIndex(editingCell.colIndex);
    if (record && column) {
      onCellChange?.(record.id, column.id, value);
    }
  }, [editingCell, data.records, onCellChange]);

  const handleCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const editingCellRect = useMemo(() => {
    if (!editingCell || !rendererRef.current) return null;
    const cm = rendererRef.current.getCoordinateManager();
    const scroll = rendererRef.current.getScrollState();
    const logicalRect = cm.getCellRect(editingCell.rowIndex, editingCell.colIndex, scroll);
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    return {
      x: logicalRect.x * currentZoom,
      y: logicalRect.y * currentZoom,
      width: logicalRect.width * currentZoom,
      height: logicalRect.height * currentZoom,
    };
  }, [editingCell, scrollState, zoomScale]);

  const editingCellData = useMemo(() => {
    if (!editingCell || !rendererRef.current) return null;
    const record = data.records[editingCell.rowIndex];
    const column = rendererRef.current.getVisibleColumnAtIndex(editingCell.colIndex);
    if (!record || !column) return null;
    const cell = record.cells[column.id];
    if (!cell) return null;
    return { cell, column };
  }, [editingCell, data]);

  const dragGhostStyle = useMemo((): React.CSSProperties | null => {
    if (!dragState.isDragging || !rendererRef.current || !containerRef.current) return null;
    const renderer = rendererRef.current;
    const logicalColW = renderer.getVisibleColumnWidths()[dragState.dragColIndex] || 100;
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const scaledColW = logicalColW * currentZoom;
    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetX = dragState.dragX - containerRect.left - scaledColW / 2;

    return {
      position: 'absolute',
      left: offsetX,
      top: 0,
      width: scaledColW,
      height: GRID_THEME.headerHeight * currentZoom,
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      border: '2px solid rgba(59, 130, 246, 0.4)',
      borderRadius: 4,
      zIndex: 100,
      pointerEvents: 'none' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#3b82f6',
      fontWeight: 500,
    };
  }, [dragState.isDragging, dragState.dragX, dragState.dragColIndex, zoomScale]);

  const dragIndicatorStyle = useMemo((): React.CSSProperties | null => {
    if (!dragState.isDragging || !rendererRef.current || !containerRef.current) return null;
    const renderer = rendererRef.current;
    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const currentZoom = useUIStore.getState().zoomLevel / 100;
    const targetX = cm.getColumnX(dragState.dragTargetIndex, scroll.scrollLeft) * currentZoom;

    return {
      position: 'absolute',
      left: targetX - 1,
      top: 0,
      width: 2,
      height: '100%',
      backgroundColor: '#3b82f6',
      zIndex: 99,
      pointerEvents: 'none' as const,
    };
  }, [dragState.isDragging, dragState.dragTargetIndex, zoomScale]);

  const dragColName = useMemo(() => {
    if (!dragState.isDragging || !rendererRef.current) return '';
    const col = rendererRef.current.getVisibleColumnAtIndex(dragState.dragColIndex);
    return col?.name || '';
  }, [dragState.isDragging, dragState.dragColIndex]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-auto"
        onScroll={handleScroll}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        style={{ cursor: resizing ? 'col-resize' : dragState.isDragging ? 'grabbing' : 'default' }}
      >
        <div style={{ width: totalWidth, height: totalHeight, pointerEvents: 'none' }} />
      </div>
      {dragState.isDragging && dragGhostStyle && (
        <div style={dragGhostStyle}>{dragColName}</div>
      )}
      {dragState.isDragging && dragIndicatorStyle && (
        <div style={dragIndicatorStyle} />
      )}
      {editingCell && editingCellRect && editingCellData && (
        <CellEditorOverlay
          cell={editingCellData.cell}
          column={editingCellData.column}
          rect={editingCellRect}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      )}
      {contextMenu.visible && (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
