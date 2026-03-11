import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "../../../index.jsx";
const CellTextEditor = forwardRef(({ editorProps = {}, ...props }, ref) => {
  const editorRef = useRef();
  const [value, setValue] = useState(props?.value);
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
      tabIndex={1} // important - without this the key presses wont be caught
    >
      <ODSTextField
        hideBorders
        value={value}
        inputRef={editorRef}
        size="small"
        fullWidth
        autoFocus
        {...editorProps}
        inputProps={{
          ...props.inputProps,
        }}
        onChange={(e) => {
          setValue(e.target.value);
          props?.onChange && props.onChange(e);
        }}
      />
    </div>
  );
});

export default CellTextEditor;
