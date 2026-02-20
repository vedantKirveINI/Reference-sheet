import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";
import { SubHeader } from "./sub-header";

interface MainLayoutProps {
  children: React.ReactNode;
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  sortCount?: number;
  filterCount?: number;
  groupCount?: number;
  onSearchChange?: (query: string) => void;
  tables?: Array<{ id: string; name: string }>;
  activeTableId?: string;
  onTableSelect?: (id: string) => void;
}

export function MainLayout({ children, onDeleteRows, onDuplicateRow, sortCount, filterCount, groupCount, onSearchChange, tables, activeTableId, onTableSelect }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <TabBar tables={tables} activeTableId={activeTableId} onTableSelect={onTableSelect} />
          <SubHeader
            onDeleteRows={onDeleteRows}
            onDuplicateRow={onDuplicateRow}
            sortCount={sortCount}
            filterCount={filterCount}
            groupCount={groupCount}
            onSearchChange={onSearchChange}
          />
          <div className="flex-1 overflow-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
