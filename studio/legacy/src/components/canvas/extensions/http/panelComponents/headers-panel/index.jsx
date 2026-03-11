import { useCallback, useState, useEffect } from "react";
// import ODSIcon from "oute-ds-icon";
// import { FormulaBar } from "oute-ds-formula-bar";
// import ODSTextField from "oute-ds-text-field";
import { ODSIcon, ODSFormulaBar as FormulaBar, ODSTextField } from "@src/module/ods";
import debounce from "lodash/debounce";

import classes from "./HeadersPanel.module.css";

const HeadersPanel = ({ headers, setHeaders, variables }) => {
  const [editingCell, setEditingCell] = useState(null);

  // Function to check if a row is empty (no key and no value)
  const isEmptyRow = (row) => {
    return (
      (!row.key || row.key.trim() === "") &&
      (!row.value?.blocks ||
        row.value.blocks.length === 0 ||
        (row.value.blocks.length === 1 && row.value.blocks[0].text === ""))
    );
  };

  const addRow = useCallback(() => {
    setHeaders((prev) => {
      const newHeaders = [
        ...prev,
        {
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        },
      ];

      return newHeaders;
    });
  }, [setHeaders]);

  const deleteRow = useCallback(
    (rowIndex) => {
      setHeaders((prev) => {
        const newHeaders = [...prev];
        newHeaders.splice(rowIndex, 1);

        // If we deleted the last row or all rows, add an empty row
        if (newHeaders.length === 0) {
          newHeaders.push({
            rowid: crypto.randomUUID(),
            key: "",
            value: { type: "fx", blocks: [] },
            valueStr: "",
          });
        }

        return newHeaders;
      });
    },
    [setHeaders]
  );

  const handleKeyChange = (rowIndex, value) => {
    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders[rowIndex] = {
        ...newHeaders[rowIndex],
        key: value,
      };
      if (rowIndex === newHeaders.length - 1) {
        newHeaders.push({
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        });
      }
      return newHeaders;
    });
  };

  const handleValueChange = debounce((rowIndex, data, dataStr) => {
    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders[rowIndex] = {
        ...newHeaders[rowIndex],
        value: {
          type: "fx",
          blocks: data,
        },
        valueStr: dataStr,
      };
      if (rowIndex === newHeaders.length - 1) {
        newHeaders.push({
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        });
      }
      return newHeaders;
    });
  }, 200);

  useEffect(() => {
    const hasEmptyRow = headers.some((row) => isEmptyRow(row));

    if (headers.length === 0 || (headers.length > 0 && !hasEmptyRow)) {
      addRow();
    }
  }, []);

  return (
    <div className={classes.headersPanel}>
      <table className={classes.headersTable}>
        <thead>
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th className={classes.actionColumn}></th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, rowIndex) => (
            <tr key={header.rowid} className={classes.dataRow}>
              <td
                className={classes.keyCell}
                onClick={() => {
                  if (
                    editingCell?.rowIndex !== rowIndex ||
                    editingCell?.colKey !== "key"
                  ) {
                    setEditingCell({ rowIndex, colKey: "key" });
                  }
                }}
              >
                <ODSTextField
                  value={header.key || ""}
                  fullWidth
                  className="black"
                  placeholder="Enter key"
                  sx={{
                    "& .MuiOutlinedInput-root ": {
                      background: "transparent",
                    },
                  }}
                  hideBorders
                  onChange={(e) => handleKeyChange(rowIndex, e.target.value)}
                  autoFocus={
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.colKey === "key"
                  }
                  inputProps={{
                    "data-testid": `http-configure-header-key-${rowIndex}`,
                  }}
                />
              </td>
              <td
                className={classes.valueCell}
                onClick={() => {
                  if (
                    editingCell?.rowIndex !== rowIndex ||
                    editingCell?.colKey !== "value"
                  ) {
                    setEditingCell({ rowIndex, colKey: "value" });
                  }
                }}
              >
                <FormulaBar
                  key={rowIndex}
                  hideBorders
                  onInputContentChanged={(data, dataStr) =>
                    handleValueChange(rowIndex, data, dataStr)
                  }
                  placeholder="Enter value"
                  wrapContent={
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.colKey === "value"
                  }
                  defaultInputContent={header.value?.blocks || []}
                  variables={variables}
                  slotProps={{
                    container: {
                      style: {
                        maxHeight: "10rem",
                        overflow: "auto",
                      },
                    },
                    content: {
                      "data-testid": `http-configure-header-value-${rowIndex}`,
                    },
                  }}
                />
              </td>
              <td className={classes.deleteCell}>
                <div className={classes.deleteIconContainer}>
                  {rowIndex === headers.length - 1 ? null : (
                    <ODSIcon
                      outeIconName="OUTETrashIcon"
                      onClick={() => deleteRow(rowIndex)}
                      outeIconProps={{
                        "data-testid": `http-configure-header-delete-${rowIndex}`,
                        sx: {
                          color: "#212121",
                        },
                      }}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeadersPanel;
