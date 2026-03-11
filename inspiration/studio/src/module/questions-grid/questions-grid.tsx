import React, { useCallback, useEffect } from "react";
import { ODSIcon, ODSAutocomplete } from "@src/module/ods";
import { ODSNumber as Number } from "@src/module/ods";
import { styles } from "./styles";
import { HeaderEditor } from "./components/header-editor";
import { getCurlObj } from "./utils";
export type QuestionsGridProps = {
  onChange: any;
  isCreator: any;
  value: any;
  question: any;
  isAnswered?: boolean;
  theme?: any;
};

export function QuestionsGrid({
  onChange,
  isCreator,
  value = [],
  question,
  isAnswered,
  theme,
}: QuestionsGridProps) {
  const columns = question?.columns || [];

  const handleHeaderNameChange = (index: number, newName: string) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, name: newName } : col
    );
    onChange("columns", updatedColumns);
  };

  const handleAddRow = useCallback(() => {
    onChange([...value, { col1: "", col2: "" }]);
  }, [onChange, value]);

  const handleDeleteRow = (index) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleInputChange = (index, column, val) => {
    const updatedRows = value.map((row, rowIndex) => {
      return rowIndex === index ? { ...row, [column]: val } : row;
    });
    onChange(updatedRows);
  };

  useEffect(() => {
    if (!isCreator && !isAnswered && value?.length === 0) {
      handleAddRow();
    }
  }, [handleAddRow, isAnswered, isCreator, onChange, value?.length]);

  const valueToMap = isCreator ? [{ col1: {}, col2: "" }] : value;

  return (
    <div style={styles.container(theme)} data-testid="questions-grid-container">
      <div style={styles.tableWrapper}>
        <table style={styles.tableContainer} data-testid="questions-grid-table">
          <thead>
            <tr
              style={styles.headerContainer}
              data-testid="questions-grid-header"
            >
              {columns?.map((column, index) => (
                <HeaderEditor
                  key={index}
                  index={index}
                  column={column}
                  handleHeaderNameChange={handleHeaderNameChange}
                  isCreator={isCreator}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {valueToMap?.map((row: any, index) => (
              <tr
                key={index}
                style={styles.rowContainer(index)}
                data-testid="questions-grid-row"
              >
                <td style={{ padding: "10px" }}>
                  <ODSAutocomplete
                    isCreator={isCreator}
                    value={row?.col1}
                    onChange={(obj: any) => {
                      handleInputChange(index, "col1", {
                        ...obj,
                        searchString: obj.searchString,
                      });
                    }}
                    settings={{
                      curlCommand: getCurlObj({
                        searchTerm: row?.col1?.searchString,
                        settings: question?.settings,
                      }),
                      label: question?.settings?.label || "label",
                      id: question?.settings?.id || "id",
                      optionsPath: question?.settings?.optionsPath || "results",
                    }}
                    // settings={{
                    //   curlCommand: {
                    //     type: "fx",
                    //     blocks: [
                    //       {
                    //         type: "PRIMITIVES",
                    //         value: `curl 'https://dummyjson.com/recipes/search?q=${row?.col1?.searchString}'`,
                    //       },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value: "  -H 'sec-ch-ua-platform: \"macOS\"' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value:
                    //       //     "  -H 'Referer: https://emami-web-staging.iipl.io/' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value:
                    //       //     "  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value: "  -H 'accept: application/json' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value:
                    //       //     '  -H \'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"\' \\',
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value:
                    //       //     "  -H 'content-type: application/x-www-form-urlencoded' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value: "  -H 'sec-ch-ua-mobile: ?0' \\",
                    //       // },
                    //       // {
                    //       //   type: "BREAKLINE",
                    //       //   value: "\n",
                    //       // },
                    //       // {
                    //       //   type: "PRIMITIVES",
                    //       //   value: `    --data-raw \'{"params":"query=${row?.col1?.searchString}&filters=cities_mapping.city_13.active%3D1&hitsPerPage=20&page=0&clickAnalytics=true"}\'`,
                    //       // },
                    //     ],
                    //   },
                    //   label: question?.settings?.label || "label",
                    //   id: question?.settings?.id || "id",
                    //   optionsPath: question?.settings?.optionsPath || "results",
                    // }}
                    theme={{}}
                  />
                </td>
                <td style={styles.dataContainer}>
                  <Number
                    value={parseInt(row.col2) || undefined}
                    placeholder={"Eg. 1"}
                    isCreator={isCreator}
                    settings={{}}
                    onChange={(val) => {
                      handleInputChange(index, "col2", val);
                    }}
                    theme={{}}
                    autoFocus={false}
                    isInputValid
                    disabled={isCreator}
                  />
                  <ODSIcon
                    outeIconName="OUTETrashIcon"
                    onClick={() => handleDeleteRow(index)}
                    outeIconProps={{
                      style: styles.trashIconStyle,
                      "data-testid": "question-grid-delete-row-icon",
                    }}
                    buttonProps={{
                      disabled: isCreator,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ODSIcon
        outeIconName="OUTEAddIcon"
        onClick={handleAddRow}
        outeIconProps={{
          style: styles.addRowIconStyle,
          "data-testid": "question-grid-add-row-icon",
        }}
        buttonProps={{
          disabled: isCreator,
        }}
      />
    </div>
  );
}
