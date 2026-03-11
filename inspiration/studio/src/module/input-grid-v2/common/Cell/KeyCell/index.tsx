
import { useEffect, useRef, useState } from "react";

import KeyEditor from "../../Editor/KeyEditor";
import KeyRenderer from "../../Renderer/KeyRenderer";
import { disabledContainer, getContainerStyles, disabledCell } from "./styles";
const getKey = ({ value, parentType, isValueMode, index }) => {
  if (parentType === "Array" && isValueMode) {
    return `${index}`;
  }

  if (value?.displayKeyName) {
    return value.displayKeyName;
  }

  if (value?.label) {
    return value.label;
  }

  return value?.key;
};

function KeyCell({
  value,
  onChange,
  isKeyDisabled = false,
  isValueMode = false,
  index,
  parentType,
  dataTestId,
  hideColumnType = false,
  variant = "black",
  newChildIndex,
  readOnly = false,
  disableKeyEditing = false,
  allowQuestionDataType = false,
}) {
  const [showEditor, setShowEditor] = useState(false);
  const keyRef = useRef(null);

  useEffect(() => {
    if (
      keyRef &&
      newChildIndex === index &&
      parentType !== "Array" &&
      !disableKeyEditing
    ) {
      keyRef.current.focus();
    }
  }, [index, newChildIndex]);

  if (isKeyDisabled) {
    return <div style={disabledContainer}></div>;
  }

  return (
    <div
      tabIndex={disableKeyEditing ? -1 : 0}
      style={{
        ...getContainerStyles({
          showEditor,
          disable:
            (parentType === "Array" && isValueMode) ||
            readOnly ||
            disableKeyEditing,
        }),
        ...(disableKeyEditing ? disabledCell : {}),
      }}
      onClick={() => {
        if (
          (parentType === "Array" && isValueMode) ||
          readOnly ||
          disableKeyEditing
        )
          return;
        setShowEditor(true);
      }}
      onFocus={() => {
        if (disableKeyEditing) return;
        keyRef.current.click();
      }}
      role="presentation"
      ref={keyRef}
      data-testid={`${dataTestId}-key-input`}
    >
      {showEditor ? (
        <KeyEditor
          value={value?.key || ""}
          onChange={(value) => {
            onChange({ key: "key", value });
          }}
          onBlur={() => {
            setShowEditor(false);
          }}
          variant={variant}
        />
      ) : (
        <KeyRenderer
          value={getKey({ value, parentType, isValueMode, index })}
          hideColumnType={hideColumnType}
          type={value?.type}
          icon={value?.icon}
          alias={value?.alias}
          allowQuestionDataType={allowQuestionDataType}
        />
      )}
    </div>
  );
}

export default KeyCell;
