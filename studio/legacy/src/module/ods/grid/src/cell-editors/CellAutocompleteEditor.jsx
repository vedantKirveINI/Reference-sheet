import React, {
  forwardRef,
  useImperativeHandle,
  // useRef,
  useState,
} from "react";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete } from "../../../index.jsx";

const CellAutocompleteEditor = forwardRef(
  ({ editorProps = {}, textFieldProps = {}, ...props }, ref) => {
    // const editorRef = useRef();
    const [value, setValue] = useState(props.value);
    const [inputValue, setInputValue] = useState("");
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
        <ODSAutocomplete
          hideBorders
          openOnFocus={true}
          {...editorProps}
          textFieldProps={{
            size: "small",
            ...textFieldProps,
            fullWidth: true,
            inputProps: {
              style: { width: "100%" },
            },
            autoFocus: true,
          }}
          sx={{ width: "100%", minWidth: "auto", ...editorProps?.sx }}
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            setTimeout(() => {
              props.stopEditing();
            }, 100);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
        />
      </div>
    );
  }
);

export default CellAutocompleteEditor;
