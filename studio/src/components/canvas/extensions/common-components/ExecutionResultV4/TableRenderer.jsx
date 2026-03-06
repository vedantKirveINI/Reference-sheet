import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const TableRenderer = ({ data, searchQuery = "", accentColor = "#3b82f6" }) => {
  const tableData = useMemo(() => {
    if (!data) return { headers: [], rows: [] };

    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data.Items && Array.isArray(data.Items)) {
      items = data.Items;
    } else if (data.records && Array.isArray(data.records)) {
      items = data.records;
    } else if (data.rows && Array.isArray(data.rows)) {
      items = data.rows;
    } else if (data.data && Array.isArray(data.data)) {
      items = data.data;
    } else {
      items = [data];
    }

    if (items.length === 0) {
      return { headers: [], rows: [] };
    }

    const allKeys = new Set();
    items.forEach((item) => {
      if (item && typeof item === "object") {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    const headers = Array.from(allKeys);

    const rows = items.map((item, index) => {
      if (!item || typeof item !== "object") {
        return { _index: index, _value: item };
      }
      return { _index: index, ...item };
    });

    return { headers, rows };
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;

    const query = searchQuery.toLowerCase();
    return tableData.rows.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [tableData.rows, searchQuery]);

  const formatCellValue = (value) => {
    if (value === null) return <span className={styles.nullCell}>null</span>;
    if (value === undefined) return <span className={styles.nullCell}>-</span>;
    if (typeof value === "boolean") {
      return (
        <span className={cn(styles.booleanCell, value ? styles.trueCell : styles.falseCell)}>
          {String(value)}
        </span>
      );
    }
    if (typeof value === "object") {
      return (
        <span className={styles.objectCell} title={JSON.stringify(value)}>
          {JSON.stringify(value).slice(0, 50)}...
        </span>
      );
    }
    return String(value);
  };

  if (tableData.headers.length === 0) {
    return (
      <div className={styles.emptyTable}>
        <span>No tabular data available</span>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable} style={{ "--accent-color": accentColor }}>
          <thead>
            <tr>
              <th className={styles.indexHeader}>#</th>
              {tableData.headers.map((header) => (
                <th key={header} className={styles.tableHeader}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr key={row._index ?? idx} className={styles.tableRow}>
                <td className={styles.indexCell}>{row._index + 1}</td>
                {tableData.headers.map((header) => (
                  <td key={header} className={styles.tableCell}>
                    {formatCellValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <span>
          {filteredRows.length} of {tableData.rows.length} rows
          {searchQuery && " (filtered)"}
        </span>
      </div>
    </div>
  );
};

export default TableRenderer;
