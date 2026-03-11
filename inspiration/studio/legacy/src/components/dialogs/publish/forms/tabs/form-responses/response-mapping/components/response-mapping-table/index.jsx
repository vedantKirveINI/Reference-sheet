import React, { useRef } from "react";
import MappingRow from "../mapping-row";
import { useResponseMapping } from "../../hooks/use-response-mapping";
import classes from "./index.module.css";

const ResponseMappingTable = ({
  questions = [],
  mappings = [],
  onChange,
  dataTestId = "response-mapping-table",
}) => {
  const tableRef = useRef(null);
  const { columnNames, handleUpdateRow, handleAddRow, handleDeleteRow } =
    useResponseMapping({ mappings, onChange });

  return (
    <div className={classes.container} data-testid={dataTestId}>
      <div className={classes.tableHeader}>
        <div className={classes.headerCell}>Name</div>
        {/* <div className={classes.headerCell}>Type</div> */}
        <div className={classes.headerCell}>Value</div>
        <div className={classes.headerCell}></div>
      </div>

      <div ref={tableRef} className={classes.tableBody}>
        {mappings.map((row, index) => (
          <MappingRow
            key={index}
            row={row}
            rowIndex={index}
            questions={questions}
            onUpdate={handleUpdateRow}
            onDelete={handleDeleteRow}
            columnNames={columnNames}
            dataTestId={`${dataTestId}-row`}
          />
        ))}
      </div>

      <div className={classes.actions}>
        <button
          type="button"
          onClick={(e) => {
            handleAddRow(e);
            setTimeout(() => {
              tableRef.current.scrollTo({
                top: tableRef.current.scrollHeight,
                behavior: "smooth",
              });
            }, 100);
          }}
          className={classes.addButton}
          data-testid={`${dataTestId}-add-row`}
        >
          <span>+</span>
          <span>Add Row</span>
        </button>
      </div>
    </div>
  );
};

export default ResponseMappingTable;
