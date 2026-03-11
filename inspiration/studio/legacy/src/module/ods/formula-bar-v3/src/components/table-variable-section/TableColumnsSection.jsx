import React from "react";
import styles from "./index.module.css";
import {
  getTypeIcon,
  processTableColumns,
  transformColumnForFormula,
} from "../../utils/table-utils";

const TableColumnsSection = ({
  tableColumns = [],
  onClick = () => {},
  showTypeIcons = false,
  showColumnCount = false,
}) => {
  const activeColumns = processTableColumns(tableColumns);

  const handleColumnClick = (column) => {
    onClick(transformColumnForFormula(column));
  };

  return (
    <div className={styles.container}>
      {showColumnCount && (
        <div className={styles.header}>
          <span className={styles.title}>Table Columns</span>
          <span className={styles.count}>({activeColumns.length})</span>
        </div>
      )}
      <div className={styles.list}>
        {activeColumns.length > 0 ? (
          activeColumns.map((column) => (
            <div
              key={column.id}
              className={styles.columnItem}
              onClick={() => handleColumnClick(column)}
              title={column.description || column.name}
            >
              <div className={styles.columnContent}>
                {showTypeIcons && (
                  <img
                    src={getTypeIcon(column.type)}
                    alt={`${column.type} icon`}
                    className={styles.typeIcon}
                    onError={(e) => {
                      e.target.src = getTypeIcon("FALLBACK");
                    }}
                  />
                )}
                <span className={styles.columnName}>{column.name}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyMessage}>
              No table columns available
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableColumnsSection;
