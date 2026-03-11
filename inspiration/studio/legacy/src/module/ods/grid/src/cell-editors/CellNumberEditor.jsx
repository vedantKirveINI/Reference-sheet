import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// import ODSNumberInput from "oute-ds-number-input";
import { ODSNumberInput } from "../../../index.jsx";

const CellNumberEditor = forwardRef(({ editorProps = {}, ...props }, ref) => {
  const [value, setValue] = useState(props?.value);
  const numberEditorRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      },
    };
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
      onBlur={() => {
        props.stopEditing();
      }}
      tabIndex={1} // important - without this the key presses wont be caught
    >
      <ODSNumberInput
        hideBorders
        value={value}
        inputRef={numberEditorRef}
        size="small"
        fullWidth
        autoFocus
        {...editorProps}
        onChange={(e) => {
          setValue(e.target.value);
          props?.onChange && props.onChange(e);
        }}
      />
    </div>
  );
});

export default CellNumberEditor;
