import React, { useRef } from "react";
import classes from "./index.module.css";
import MappingRow from "./components/mapping-row";

const Table = ({
  columns = [],
  data = [],
  style = {},
  onChange,
  dataTestId = "response-mapping-table",
}) => {
  const tableRef = useRef(null);

  const onChangeCell = ({ rowIndex, columnName, value }) => {
    let _data = [...data];
    _data[rowIndex][columnName] = value;
    onChange(_data);
  };

  const handleAddRow = () => {
    onChange([
      ...data,
      {
        type: "STRING",
        key: "",
        description: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    let _data = [...data];
    _data.splice(index, 1);
    onChange(_data);
  };

  return (
    <div style={style} className={classes.container} data-testid={dataTestId}>
      <div className={classes.tableHeader}>
        {columns?.map((item, i) => {
          return (
            <div style={item?.style || {}} className={classes.headerCell}>
              {item?.title}
            </div>
          );
        })}
      </div>

      <div ref={tableRef} className={classes.tableBody}>
        {data.map((row, index) => (
          <MappingRow
            key={index}
            row={row}
            rowIndex={index}
            columns={columns}
            onChangeCell={onChangeCell}
            handleDeleteRow={handleDeleteRow}
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

export default Table;
