import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ITableData } from '@/types';
import { GridRenderer } from './canvas/renderer';
import { GRID_THEME } from './canvas/theme';
import { ICellPosition, IScrollState } from './canvas/types';
import { CellEditorOverlay } from './cell-editor-overlay';

interface GridViewProps {
  data: ITableData;
  onCellChange?: (recordId: string, columnId: string, value: any) => void;
}

export function GridView({ data, onCellChange }: GridViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GridRenderer | null>(null);

  const [activeCell, setActiveCell] = useState<ICellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<ICellPosition | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [scrollState, setScrollState] = useState<IScrollState>({ scrollTop: 0, scrollLeft: 0 });
  const [resizing, setResizing] = useState<{ colIndex: number; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new GridRenderer(canvasRef.current, data);
    rendererRef.current = renderer;
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
    rendererRef.current?.setSelectedRows(selectedRows);
  }, [selectedRows]);

  const totalWidth = useMemo(() => {
    const cm = rendererRef.current?.getCoordinateManager();
    if (cm) return cm.getTotalWidth() + GRID_THEME.rowHeaderWidth + GRID_THEME.appendColumnWidth;
    return data.columns.reduce((sum, c) => sum + c.width, 0) + GRID_THEME.rowHeaderWidth + GRID_THEME.appendColumnWidth;
  }, [data, scrollState]);

  const totalHeight = useMemo(() => {
    const cm = rendererRef.current?.getCoordinateManager();
    if (cm) return cm.getTotalHeight() + GRID_THEME.headerHeight + GRID_THEME.appendRowHeight;
    return data.records.length * GRID_THEME.defaultRowHeight + GRID_THEME.headerHeight + GRID_THEME.appendRowHeight;
  }, [data, scrollState]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScroll: IScrollState = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft };
    setScrollState(newScroll);
    rendererRef.current?.setScrollState(newScroll);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth, container.clientHeight);

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
    } else {
      setEditingCell(null);
    }
  }, [editingCell, data.records.length]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth, container.clientHeight);

    if (hit.region === 'cell') {
      setActiveCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
      setEditingCell({ rowIndex: hit.rowIndex, colIndex: hit.colIndex });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cm = renderer.getCoordinateManager();
    const scroll = renderer.getScrollState();
    const container = containerRef.current;
    if (!container || !cm) return;

    const hit = cm.hitTest(x, y, scroll, container.clientWidth, container.clientHeight);

    if (hit.region === 'columnHeader' && hit.isResizeHandle) {
      e.preventDefault();
      e.stopPropagation();
      const colWidths = renderer.getColumnWidths();
      setResizing({ colIndex: hit.colIndex, startX: e.clientX, startWidth: colWidths[hit.colIndex] });
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const scroll = renderer.getScrollState();
    const { headerHeight, defaultRowHeight } = GRID_THEME;

    if (y > headerHeight) {
      const scrolledY = y - headerHeight + scroll.scrollTop;
      const rowIndex = Math.floor(scrolledY / defaultRowHeight);
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
    const totalCols = data.columns.length;
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
          if (nextCol >= totalCols) { nextCol = 0; nextRow = Math.min(totalRows - 1, nextRow + 1); }
        }
        break;
      default: return;
    }

    e.preventDefault();
    setActiveCell({ rowIndex: nextRow, colIndex: nextCol });
  }, [activeCell, editingCell, data.records.length, data.columns.length]);

  const handleCommit = useCallback((value: any) => {
    if (!editingCell) return;
    setEditingCell(null);
    const record = data.records[editingCell.rowIndex];
    const column = data.columns[editingCell.colIndex];
    if (record && column) {
      onCellChange?.(record.id, column.id, value);
    }
  }, [editingCell, data.records, data.columns, onCellChange]);

  const handleCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const editingCellRect = useMemo(() => {
    if (!editingCell || !rendererRef.current) return null;
    const cm = rendererRef.current.getCoordinateManager();
    const scroll = rendererRef.current.getScrollState();
    return cm.getCellRect(editingCell.rowIndex, editingCell.colIndex, scroll);
  }, [editingCell, scrollState]);

  const editingCellData = useMemo(() => {
    if (!editingCell) return null;
    const record = data.records[editingCell.rowIndex];
    const column = data.columns[editingCell.colIndex];
    if (!record || !column) return null;
    const cell = record.cells[column.id];
    if (!cell) return null;
    return { cell, column };
  }, [editingCell, data]);

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
        style={{ cursor: resizing ? 'col-resize' : 'default' }}
      >
        <div style={{ width: totalWidth, height: totalHeight, pointerEvents: 'none' }} />
      </div>
      {editingCell && editingCellRect && editingCellData && (
        <CellEditorOverlay
          cell={editingCellData.cell}
          column={editingCellData.column}
          rect={editingCellRect}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
