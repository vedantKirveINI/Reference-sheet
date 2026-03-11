
import { useEffect, useRef, useState } from "react";
import { debounce, lowerCase } from "lodash";

import ValueEditor from "../../Editor/ValueEditor";
import ValueRenderer from "../../Renderer/ValueRenderer";
import ShowInfo from "../../ShowInfo";
import { disabledContainer, getCellContainer } from "./styles";
import { useInputGridContext } from "../../../context/InputGridContext";
function ValueCell({
  value,
  onChange,
  isValueDisabled = false,
  hideBorders = true,
  isValueMode = false,
  readOnly = false,
  dataTestId,
  variant = "black",
  hideBorder = false,
  newChildIndex = -1,
  index = -1,
  parentType = "",
}) {
  const { variables, showFxCell } = useInputGridContext();

  const valueKey = isValueMode ? "value" : "default";

  const [showEditor, setShowEditor] = useState(false);
  const valueRef = useRef(null);

  const valueToRender = isValueMode
    ? (value?.value ?? value?.default)
    : value?.default;

  const typeValue = lowerCase(value?.type) ?? "string";

  useEffect(() => {
    if (valueRef && newChildIndex === index && parentType === "Array") {
      valueRef.current?.focus();
    }
  }, [index, newChildIndex]);

  if (isValueDisabled) {
    return (
      <div style={disabledContainer}>
        {/* {!readOnly ? (
          <ShowInfo title={`Define the schema for ${value?.type} below`} />
        ) : null} */}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      style={getCellContainer({ hideBorders, showEditor, readOnly })}
      onFocus={() => {
        setShowEditor(true && !readOnly);
      }}
      data-testid={`${dataTestId}-value-input`}
      ref={valueRef}
    >
      {!showEditor ? (
        <ValueRenderer
          value={valueToRender}
          showFxCell={showFxCell}
          readOnly={readOnly}
        />
      ) : (
        <ValueEditor
          value={valueToRender}
          typeValue={typeValue}
          variables={variables}
          onChange={debounce((value) => {
            onChange({ key: valueKey, value });
          }, 400)}
          onBlur={() => {
            setShowEditor(false && !readOnly);
          }}
          variant={variant}
          showFxCell={showFxCell}
          hideBorder={hideBorder}
        />
      )}
    </div>
  );
}

export default ValueCell;
