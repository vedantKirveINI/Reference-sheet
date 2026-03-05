
import { useRef, useState } from "react";
import TypeEditor from "../../Editor/TypeEditor";
import TypeRenderer from "../../Renderer/TypeRenderer";
import { lowerCase, startCase } from "lodash";
import { disableCell } from "./styles";
import { questionDataType } from "../../../constant/questionDataTypeMapping";
import getTypeValue from "../../../utils/getTypeValue";
function TypeCell({
  value,
  onChange,
  readOnly,
  dataTestId,
  variant = "black",
  allowQuestionDataType = false,
  disableTypeEditing = false,
}) {
  const { icon } = value || {};

  const [showEditor, setShowEditor] = useState(false);

  const typeRef = useRef(null);

  const typeValue = getTypeValue({
    alias: value?.alias,
    type: value?.type,
    allowQuestionDataType,
  });

  return (
    <div
      tabIndex={disableTypeEditing ? -1 : 0}
      style={{
        ...(disableTypeEditing ? disableCell : ""),
        height: "100%",
      }}
      onClick={() => {
        if (disableTypeEditing) return;
        setShowEditor(true);
      }}
      onFocus={() => {
        if (disableTypeEditing) return;
        setShowEditor(true);
      }}
      role="presentation"
      data-testid={`${dataTestId}-type-cell`}
      ref={typeRef}
    >
      {showEditor ? (
        <TypeEditor
          value={typeValue}
          allowQuestionDataType={allowQuestionDataType}
          onBlur={() => {
            setShowEditor(false);
          }}
          onChange={(e, value: string) => {
            e.stopPropagation();
            onChange({
              key: "type",
              value,
              isCustom:
                allowQuestionDataType &&
                questionDataType.includes(lowerCase(value)),
            });
            // setShowEditor(false);
          }}
          variant={variant}
        />
      ) : (
        <TypeRenderer
          icon={icon}
          value={typeValue}
          readOnly={readOnly}
          isCustom={allowQuestionDataType}
          disableTypeEditing={disableTypeEditing}
        />
      )}
    </div>
  );
}

export default TypeCell;
