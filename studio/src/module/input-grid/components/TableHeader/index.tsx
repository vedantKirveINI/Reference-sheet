import React from "react";
import { flexBoxStyles, colStyles, valueCol, typeCol, addColStyles, deleteColStyles,  } from "./styles";
import AddButton from "../AddButton";

import { DEFAULT_TYPE } from "../../constants/type";
type TableHeaderProps = {
  onChange: (updatedVal: any) => void;
  rootValue: any[];
};

function TableHeader({ onChange, rootValue }: TableHeaderProps) {
  return (
    <div style={flexBoxStyles}>
      <div style={addColStyles}>
        <AddButton
          testId={"header"}
          onClick={() => {
            rootValue.push({ id: `${Date.now()}`, type: DEFAULT_TYPE });
            onChange({ updatedRootValue: rootValue });
          }}
        />
      </div>

      <div style={colStyles}>Key</div>
      <div style={{...colStyles, ...typeCol}}>Type</div>

      <div style={{...colStyles, ...valueCol}}>Value</div>
      <div style={deleteColStyles} />
    </div>
  );
}

export default TableHeader;
