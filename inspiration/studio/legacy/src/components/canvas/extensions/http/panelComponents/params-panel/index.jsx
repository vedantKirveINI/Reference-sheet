import { useCallback, useState, useEffect } from "react";
// import ODSIcon from "oute-ds-icon";
// import ODSTextField from "oute-ds-text-field";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSIcon, ODSTextField, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import classes from "./ParamsPanel.module.css";

const ParamsPanel = ({ queryParams, setQueryParams, variables }) => {
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
    setQueryParams((prev) => {
      const newParams = [
        ...prev,
        {
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        },
      ];
      return newParams;
    });
  }, [setQueryParams]);

  const deleteRow = useCallback(
    (rowIndex) => {
      setQueryParams((prev) => {
        const newParams = [...prev];
        newParams.splice(rowIndex, 1);

        if (newParams.length === 0) {
          newParams.push({
            rowid: crypto.randomUUID(),
            key: "",
            value: { type: "fx", blocks: [] },
            valueStr: "",
          });
        }

        return newParams;
      });
    },
    [setQueryParams]
  );

  const handleKeyChange = (rowIndex, value) => {
    setQueryParams((prev) => {
      const newParams = [...prev];
      newParams[rowIndex] = {
        ...newParams[rowIndex],
        key: value,
      };

      if (rowIndex === newParams.length - 1) {
        newParams.push({
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        });
      }
      return newParams;
    });
  };

  const handleValueChange = (rowIndex, data, dataStr) => {
    setQueryParams((prev) => {
      const newParams = [...prev];
      newParams[rowIndex] = {
        ...newParams[rowIndex],
        value: {
          type: "fx",
          blocks: data,
        },
        valueStr: dataStr,
      };
      if (rowIndex === newParams.length - 1) {
        newParams.push({
          rowid: crypto.randomUUID(),
          key: "",
          value: { type: "fx", blocks: [] },
          valueStr: "",
        });
      }
      return newParams;
    });
  };

  useEffect(() => {
    const hasEmptyRow = queryParams.some((row) => isEmptyRow(row));

    if (queryParams.length === 0 || (queryParams.length > 0 && !hasEmptyRow)) {
      addRow();
    }
  }, []);

  return (
    <div
      className={classes.paramsPanel}
      data-testid="http-configure-params-section"
    >
      <table className={classes.paramsTable}>
        <thead>
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th className={classes.actionColumn}></th>
          </tr>
        </thead>
        <tbody>
          {queryParams.map((param, rowIndex) => (
            <tr key={param.rowid} className={classes.dataRow}>
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
                  value={param.key || ""}
                  hideBorders
                  fullWidth
                  placeholder="Enter key"
                  className="black"
                  sx={{
                    "& .MuiOutlinedInput-root ": {
                      background: "transparent",
                    },
                  }}
                  onChange={(e) => handleKeyChange(rowIndex, e.target.value)}
                  autoFocus={
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.colKey === "key"
                  }
                  inputProps={{
                    "data-testid": `http-configure-param-key-${rowIndex}`,
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
                  defaultInputContent={param.value?.blocks || []}
                  variables={variables}
                  slotProps={{
                    container: {
                      style: {
                        maxHeight: "10rem",
                        overflow: "auto",
                      },
                    },
                    content: {
                      "data-testid": `http-configure-param-value-${rowIndex}`,
                    },
                  }}
                />
              </td>
              <td className={classes.deleteCell}>
                <div className={classes.deleteIconContainer}>
                  {rowIndex === queryParams.length - 1 ? null : (
                    <ODSIcon
                      outeIconName="OUTETrashIcon"
                      onClick={() => deleteRow(rowIndex)}
                      outeIconProps={{
                        "data-testid": `http-configure-param-delete-${rowIndex}`,
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

export default ParamsPanel;
