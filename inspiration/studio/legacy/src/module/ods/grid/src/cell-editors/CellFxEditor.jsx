import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
  useRef,
} from "react";
// import { FormulaBar } from "oute-ds-formula-bar";
import { FormulaBar } from "../../../index.jsx";

const CellFxEditor = (props, ref) => {
  const [value, setValue] = useState(props?.value);

  const tempRef = useRef();

  const onInputContentChangedHandler = (content, textContent) => {
    setValue(content);
    props?.onInputContentChanged &&
      props.onInputContentChanged(content, textContent);
  };

  useEffect(() => {
    if (tempRef.current) {
      tempRef.current.focus(true);
    }
  }, [tempRef]);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      },
    };
  }, [value]);

  return (
    <div style={{ width: "100%", height: "100%" }} tabIndex={1}>
      <FormulaBar
        defaultInputContent={value}
        onInputContentChanged={onInputContentChangedHandler}
        // style={{ borderRadius: 0 }}
        hideBorders
        ref={tempRef}
        variables={props?.variables}
        // popperProps={{ className: "ag-custom-component-popup" }}
        wrapContent={props?.wrapContent || false}
      />
    </div>
  );
};

export default forwardRef(CellFxEditor);
