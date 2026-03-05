/**
 * @deprecated Use SheetOrderByV2 instead.
 * This component uses legacy ODS components and will be removed in a future version.
 * SheetOrderByV2 provides the same functionality with modern SHADCN/Tailwind styling.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./SheetOrderBy.module.css";
// import { ODSAutocomplete } from '@src/module/ods';
// import { ODSButton } from '@src/module/ods';
// import { ODSIcon } from '@src/module/ods';
import { ODSAutocomplete, ODSButton, ODSIcon } from "@src/module/ods";

const options = ["ASCENDING", "DESCENDING"];

const SheetOrderBy = ({
  schema = [],
  orderByRowData = [],
  onChange = () => {},
}) => {
  const [rows, setRows] = useState([]);
  const hasInitialized = useRef(false);

  const initializeData = useCallback(() => {
    // Start with just one empty row by default if no data is provided
    if (orderByRowData.length > 0) {
      setRows(orderByRowData);
    } else {
      // Create just one empty row by default
      setRows([
        {
          column: "",
          order: options[0],
          checked: true,
          fieldId: "",
          dbFieldName: "",
          type: "",
        },
      ]);
    }
  }, [orderByRowData]);

  const generateOrderByClause = useCallback((rowData) => {
    let clause = "ORDER BY";

    rowData?.forEach((row, index) => {
      if (row?.column && row?.order) {
        if (index !== 0) {
          clause += ",";
        }
        clause += ` ${row.column} ${row.order}`;
      }
    });

    return rowData.length > 0 ? clause : "";
  }, []);

  const updateColumn = (index, value) => {
    const updated = [...rows];
    const selectedField = schema.find((field) => field.name === value);

    if (selectedField) {
      updated[index] = {
        ...updated[index],
        column: value,
        fieldId: selectedField.id,
        dbFieldName: selectedField.dbFieldName,
        type: selectedField.type,
      };
    } else {
      updated[index] = {
        ...updated[index],
        column: value,
      };
    }

    setRows(updated);
  };

  const updateSortOrder = (index, value) => {
    const updated = [...rows];
    updated[index].order = value;
    setRows(updated);
  };

  const getFilteredColumnOptions = (currentIndex) => {
    const selectedColumns = rows
      .map((row, idx) => (idx !== currentIndex ? row.column : null))
      .filter(Boolean);

    return schema
      .map((field) => field.name)
      .filter((name) => !selectedColumns.includes(name));
  };

  const addNewRow = () => {
    setRows([
      ...rows,
      {
        column: "",
        order: options[0],
        checked: true,
        fieldId: "",
        dbFieldName: "",
        type: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) {
      // If it's the last row, just clear it instead of removing
      const updated = [...rows];
      updated[0] = {
        column: "",
        order: options[0],
        checked: true,
        fieldId: "",
        dbFieldName: "",
        type: "",
      };
      setRows(updated);
    } else {
      // Remove the row
      const updated = [...rows];
      updated.splice(index, 1);
      setRows(updated);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current && schema.length) {
      initializeData();
      hasInitialized.current = true;
    }
  }, [schema, initializeData]);

  useEffect(() => {
    const validRows = rows.filter((row) => row.column);
    const orderByClause = generateOrderByClause(validRows);
    onChange(validRows, orderByClause);
  }, [generateOrderByClause, onChange, rows]);

  return (
    <div className={styles.sortContainer} data-testid="sort-by-section">
      {rows.map((row, index) => (
        <div key={index} className={styles.sortRow}>
          <ODSAutocomplete
            variant="black"
            fullWidth
            value={row.column || null}
            onChange={(_, value) => updateColumn(index, value)}
            options={getFilteredColumnOptions(index)}
            textFieldProps={{
              "data-testid": `sort-field-${index}`,
              placeholder: "Select a field",
            }}
            isOptionEqualToValue={(opt, val) => opt === val}
            getOptionLabel={(opt) => opt}
            noOptionsText="No columns to sort"
          />

          <ODSAutocomplete
            variant="black"
            textFieldProps={{
              "data-testid": `sort-order-${index}`,
            }}
            value={row.order}
            onChange={(_, value) => updateSortOrder(index, value)}
            options={options}
            isOptionEqualToValue={(opt, val) => opt === val}
            getOptionLabel={(opt) => opt}
          />

          <ODSIcon
            onClick={() => removeRow(index)}
            outeIconName="OUTETrashIcon"
            buttonProps={{
              "data-testid": `delete-sort-${index}`,
            }}
            outeIconProps={{
              sx: {
                width: "1.25rem",
                height: "1.25rem",
                cursor: "pointer",
              },
            }}
          />
        </div>
      ))}

      <div className={styles.addButtonContainer}>
        <ODSButton
          variant={"black-text"}
          label={"ADD SORT"}
          onClick={addNewRow}
          size="large"
          data-testid="add-sort-button"
          startIcon={
            <ODSIcon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                sx: {
                  color: "#212121",
                },
              }}
            />
          }
        />
      </div>
    </div>
  );
};

export default SheetOrderBy;
