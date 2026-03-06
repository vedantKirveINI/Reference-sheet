import { useEffect, useRef } from "react";
import { ODSAutocomplete } from "@src/module/ods";
import getDataType from "../../../utils/getDataType";

function TypeEditor({
  value,
  onChange,
  variant = "black",
  onBlur,
  allowQuestionDataType,
}) {
  const inputRef = useRef(null);
  const dataType = getDataType({ allowQuestionDataType });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div tabIndex={0} style={{ height: "100%" }} onBlur={onBlur}>
      <ODSAutocomplete
        openOnFocus
        variant={variant}
        value={value}
        fullWidth
        className="min-w-full h-full [&_.MuiInputBase-root]:h-full"
        options={dataType}
        onChange={(e, v) => {
          onChange(e, v);
        }}
        textFieldProps={{
          style: {
            height: "100%",
          },
          inputRef: inputRef,
        }}
        hideBorders
      />
    </div>
  );
}

export default TypeEditor;
