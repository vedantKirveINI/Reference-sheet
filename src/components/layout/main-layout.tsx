import { useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { SubHeader } from "./sub-header";
import { useUIStore } from "@/stores";
import type { SortRule } from "@/views/grid/sort-modal";
import type { FilterRule } from "@/views/grid/filter-modal";
import type { GroupRule } from "@/views/grid/group-modal";
import type { IColumn } from "@/types";

interface MainLayoutProps {
  children: React.ReactNode;
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  sortCount?: number;
  onSearchChange?: (query: string) => void;
  tables?: Array<{ id: string; name: string }>;
  activeTableId?: string;
  onTableSelect?: (id: string) => void;
  onAddTable?: () => void;
  isAddingTable?: boolean;
  onRenameTable?: (tableId: string, newName: string) => void;
  onDeleteTable?: (tableId: string) => void;
  columns?: IColumn[];
  sortConfig?: SortRule[];
  onSortApply?: (config: SortRule[]) => void;
  filterConfig?: FilterRule[];
  onFilterApply?: (config: FilterRule[]) => void;
  groupConfig?: GroupRule[];
  onGroupApply?: (config: GroupRule[]) => void;
  baseId?: string;
  tableId?: string;
  sheetName?: string;
  onSheetNameChange?: (name: string) => void;
  onAddRow?: () => void;
}

export function MainLayout({ children, onDeleteRows, onDuplicateRow, sortCount, onSearchChange, tables, activeTableId, onTableSelect, onAddTable, isAddingTable, onRenameTable, onDeleteTable, columns, sortConfig, onSortApply, filterConfig, onFilterApply, groupConfig, onGroupApply, baseId, tableId, sheetName, onSheetNameChange, onAddRow }: MainLayoutProps) {
  const { toggleSidebar } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar baseId={baseId} tableId={tableId} tables={tables} activeTableId={activeTableId} onTableSelect={onTableSelect} onAddTable={onAddTable} isAddingTable={isAddingTable} onRenameTable={onRenameTable} onDeleteTable={onDeleteTable} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header sheetName={sheetName} onSheetNameChange={onSheetNameChange} baseId={baseId} tableId={tableId} />
        <SubHeader
          onDeleteRows={onDeleteRows}
          onDuplicateRow={onDuplicateRow}
          sortCount={sortCount}
          onSearchChange={onSearchChange}
          columns={columns}
          sortConfig={sortConfig}
          onSortApply={onSortApply}
          filterConfig={filterConfig}
          onFilterApply={onFilterApply}
          groupConfig={groupConfig}
          onGroupApply={onGroupApply}
          onAddRow={onAddRow}
        />
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
