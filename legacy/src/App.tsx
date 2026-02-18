// // Inspired by Teable's main application component
// import React, { useState, useMemo } from "react";
// import Grid from "./components/Grid";
// import { ITableData, ICell, IGridConfig, IGridTheme, CellType } from "./types";
// import {
//      generateTableData,
//      generateDynamicHeaders,
//      mockBackendHeaders,
// } from "./utils/dataGenerator";

// const defaultTheme: IGridTheme = {
//      cellTextColor: "#333333",
//      cellBackgroundColor: "#ffffff",
//      cellBorderColor: "#e0e0e0",
//      cellHoverColor: "#f5f5f5",
//      cellSelectedColor: "#e3f2fd",
//      cellActiveColor: "#ffffff",
//      fontFamily:
//              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//      fontSize: 13,
//      lineHeight: 20,
// };

// const App: React.FC = () => {
//      const [useBackendHeaders, setUseBackendHeaders] = useState(false);
//      const [data, setData] = useState<ITableData>(() => generateTableData());

//      // Generate data based on header source
//      const tableData = useMemo(() => {
//              if (useBackendHeaders) {
//                      const backendHeaders = mockBackendHeaders();
//                      generateDynamicHeaders(backendHeaders);
//                      // For demo, we'll use the same data generation but with backend column structure
//                      return generateTableData();
//              }
//              return data;
//      }, [useBackendHeaders, data]);

//      const config: IGridConfig = {
//              rowHeight: 32,
//              columnWidth: 120,
//              headerHeight: 40,
//              freezeColumns: 2,
//              virtualScrolling: true,
//              theme: defaultTheme,
//              // Row header configuration - Inspired by Teable
//              rowHeaderWidth: 70, // Width of row header column
//              showRowNumbers: true, // Show row numbers in header
//      };

//      const handleCellChange = (
//              rowIndex: number,
//              columnIndex: number,
//              newValue: ICell,
//      ) => {
//              console.log("App.handleCellChange - Received:", {
//                      rowIndex,
//                      columnIndex,
//                      newValue,
//              });

//              setData((prevData: ITableData) => {
//                      const newData = { ...prevData };
//                      const column = newData.columns[columnIndex];
//                      const record = newData.records[rowIndex];

//                      if (record && column) {
//                              console.log("App.handleCellChange - Updating cell:", {
//                                      recordId: record.id,
//                                      columnId: column.id,
//                                      oldValue: record.cells[column.id],
//                                      newValue,
//                              });
//                              record.cells[column.id] = newValue;
//                      } else {
//                              console.log("App.handleCellChange - Invalid coordinates:", {
//                                      record,
//                                      column,
//                              });
//                      }

//                      return newData;
//              });
//      };

//      const handleCellClick = (rowIndex: number, columnIndex: number) => {
//              if (rowIndex === -1) {
//                      console.log(
//                              `Header clicked: ${tableData.columns[columnIndex]?.name}`,
//                      );
//              } else {
//                      console.log(`Cell clicked: Row ${rowIndex}, Column ${columnIndex}`);
//              }
//      };

//      const handleCellDoubleClick = (rowIndex: number, columnIndex: number) => {
//              console.log(
//                      `Cell double-clicked: Row ${rowIndex}, Column ${columnIndex}`,
//              );
//      };

//      // Add column resize handler - Inspired by Teable's approach
//      const handleColumnResize = (columnIndex: number, newWidth: number) => {
//              console.log(`Column ${columnIndex} resized to ${newWidth}px`);

//              setData((prevData: ITableData) => {
//                      const newData = { ...prevData };
//                      if (newData.columns[columnIndex]) {
//                              newData.columns[columnIndex] = {
//                                      ...newData.columns[columnIndex],
//                                      width: newWidth, // Update the column width
//                              };
//                      }
//                      return newData;
//              });
//      };

//      // Add row height change handler - Similar to column resize
//      const handleRowHeightChange = (rowIndex: number, newHeight: number) => {
//              console.log(`Row ${rowIndex} height changed to ${newHeight}px`);

//              setData((prevData: ITableData) => {
//                      const newData = { ...prevData };
//                      if (newData.rowHeaders[rowIndex]) {
//                              newData.rowHeaders[rowIndex] = {
//                                      ...newData.rowHeaders[rowIndex],
//                                      height: newHeight, // Update the row height in row header
//                              };
//                      }
//                      return newData;
//              });
//      };

//      const regenerateData = () => {
//              setData(generateTableData());
//      };

//      return (
//              <div
//                      style={{
//                              width: "100vw",
//                              height: "100vh",
//                              display: "flex",
//                              flexDirection: "column",
//                      }}
//              >
//                      {/* Header Controls */}
//                      <div
//                              style={{
//                                      padding: "16px",
//                                      borderBottom: "1px solid #e0e0e0",
//                                      backgroundColor: "#f8f9fa",
//                                      display: "flex",
//                                      gap: "16px",
//                                      alignItems: "center",
//                              }}
//                      >
//                              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
//                                      Reference Sheet - String & Number Table
//                              </h1>

//                              <div
//                                      style={{
//                                              display: "flex",
//                                              gap: "12px",
//                                              alignItems: "center",
//                                      }}
//                              >
//                                      <label
//                                              style={{
//                                                      display: "flex",
//                                                      alignItems: "center",
//                                                      gap: "8px",
//                                              }}
//                                      >
//                                              <input
//                                                      type="checkbox"
//                                                      checked={useBackendHeaders}
//                                                      onChange={(
//                                                              e: React.ChangeEvent<HTMLInputElement>,
//                                                      ) => setUseBackendHeaders(e.target.checked)}
//                                              />
//                                              Use Backend Headers
//                                      </label>

//                                      <button
//                                              onClick={regenerateData}
//                                              style={{
//                                                      padding: "8px 16px",
//                                                      backgroundColor: "#007acc",
//                                                      color: "white",
//                                                      border: "none",
//                                                      borderRadius: "4px",
//                                                      cursor: "pointer",
//                                                      fontSize: "14px",
//                                              }}
//                                      >
//                                              Regenerate Data
//                                      </button>
//                              </div>
//                      </div>

//                      {/* Grid Container */}
//                      <div style={{ flex: 1, padding: "16px" }}>
//                              <div
//                                      style={{
//                                              width: "100%",
//                                              height: "100%",
//                                              border: "1px solid #e0e0e0",
//                                              borderRadius: "8px",
//                                              overflow: "hidden",
//                                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                                      }}
//                              >
//                                      <Grid
//                                              data={tableData}
//                                              config={config}
//                                              onCellChange={handleCellChange}
//                                              onCellClick={handleCellClick}
//                                              onCellDoubleClick={handleCellDoubleClick}
//                                              onColumnResize={handleColumnResize}
//                                              onRowHeightChange={handleRowHeightChange}
//                                      />
//                              </div>
//                      </div>

//                      {/* Footer Info */}
//                      <div
//                              style={{
//                                      padding: "12px 16px",
//                                      backgroundColor: "#f8f9fa",
//                                      borderTop: "1px solid #e0e0e0",
//                                      fontSize: "12px",
//                                      color: "#666",
//                                      display: "flex",
//                                      justifyContent: "space-between",
//                              }}
//                      >
//                              <div>
//                                      <strong>Data:</strong> {tableData.records.length} records ×{" "}
//                                      {tableData.columns.length} columns
//                              </div>
//                              <div>
//                                      <strong>Types:</strong>{" "}
//                                      {
//                                              tableData.columns.filter(
//                                                      (c) => c.type === CellType.String,
//                                              ).length
//                                      }{" "}
//                                      String,{" "}
//                                      {
//                                              tableData.columns.filter(
//                                                      (c) => c.type === CellType.Number,
//                                              ).length
//                                      }{" "}
//                                      Number,{" "}
//                                      {
//                                              tableData.columns.filter((c) => c.type === CellType.MCQ)
//                                                      .length
//                                      }{" "}
//                                      MCQ
//                              </div>
//                              <div>
//                                      <strong>Headers:</strong>{" "}
//                                      {useBackendHeaders ? "Backend" : "Generated A-Z"}
//                              </div>
//                      </div>
//              </div>
//      );
// };

// export default App;

import AppRouter from "@/AppRouter";

import "./styles.css";

function App() {
        return <AppRouter />;
}

export default App;
