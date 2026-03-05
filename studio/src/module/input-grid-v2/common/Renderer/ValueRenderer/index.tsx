import { ODSLabel as Label } from "@src/module/ods";

import { getCellRender, cellItem, getLabelContainer } from "./styles";
import isEmpty from "lodash/isEmpty";
const DEFAULT_VALUE = "Please enter value";

const INVALID_VALUE = ["", null, undefined];

const getValue = ({ value, readOnly }) => {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (isEmpty(value) && readOnly) {
    return "";
  }

  return value || DEFAULT_VALUE;
};

function ValueRenderer({ value, showFxCell, readOnly = false }): JSX.Element {
  const blocks = value?.blocks ?? [];

  if ((!showFxCell && typeof value !== "object") || isEmpty(value)) {
    return (
      <div style={getLabelContainer({ readOnly })}>
        <Label
          variant="body1"
          color={!INVALID_VALUE.includes(value) ? "#263238" : "#a2a2a2"}
          style={{
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {getValue({ value, readOnly })}
        </Label>
      </div>
    );
  }

  return (
    <div style={getCellRender({ readOnly })}>
      {isEmpty(blocks) ? (
        <Label
          variant="body1"
          color={"#a2a2a2"}
          style={{
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {DEFAULT_VALUE}
        </Label>
      ) : (
        blocks?.map((item, index) => {
          return (
            <span
              style={{
                ...(cellItem),
                flexShrink: 0,
                backgroundColor: item?.background,
                color: item?.foreground,
                padding:
                  item.type === "PRIMITIVES" ? "0rem" : "0.25rem 0.375rem",
                border:
                  item.subCategory === "NODE"
                    ? "0.047em solid #cfd8dc"
                    : "none",
              }}
              key={`${index}_${item?.displayValue || item?.value}`}
            >
              {item?.nodeNumber ? `${item.nodeNumber}. ` : ""}{" "}
              {item?.displayValue || item?.value}
            </span>
          );
        })
      )}
    </div>
  );
}

export default ValueRenderer;
