import { MainLayout } from "@/components/layout/main-layout";
import { GridView } from "@/views/grid/grid-view";
import { generateMockTableData } from "@/lib/mock-data";
import { useMemo } from "react";

function App() {
  const tableData = useMemo(() => generateMockTableData(), []);

  return (
    <MainLayout>
      <GridView data={tableData} />
    </MainLayout>
  );
}

export default App;
