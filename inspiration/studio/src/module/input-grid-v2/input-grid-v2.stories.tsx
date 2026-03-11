import InputGridV2 from "./index";

import {
  updated1,
  readOnly,
  newUi,
  withoutTypeColumn,
  arrOfObj,
  json,
  questionDataTypeValue,
} from "./constant/prefilldata";

import { useRef } from "react";
import { variables } from "./constant/variables";

const meta = {
  title: "fds/molecule/input-grid-v2",
  component: InputGridV2,
};

export default meta;

// export const Primary = {
//   args: {
//     label: "input-grid-v2",
//   },
// };

const InputGridV2Template = (args) => {
  const gridRef = useRef(null);
  return (
    <div style={{ height: "500px", width: "800px" }}>
      <InputGridV2
        isValueMode={true}
        variables={variables}
        {...args}
        ref={gridRef}
        onGridDataChange={(e) => {
          // console.log("value >>", e);
        }}
      />

      <button
        onClick={() => {
          gridRef.current.updateGrid(updated1);
        }}
      >
        setData
      </button>
      <button
        onClick={() => {
          const a = gridRef.current.getValue();
        }}
      >
        get Val
      </button>
      <button
        onClick={() => {
          gridRef.current.setJsonData(json);
        }}
      >
        set Json
      </button>
    </div>
  );
};

export const InputGridV2Component = InputGridV2Template.bind({
  label: "input-grid-v2",
});

InputGridV2Component.args = {
  isValueMode: false,
  showFxCell: true,
};

export const InputGridV2NewUi = InputGridV2Template.bind({});
InputGridV2NewUi.args = {
  showHeaders: false,
  allowMapping: false,
  hideBorder: true,
  hideHeaderAndMap: true,
  showFxCell: false,
  readOnly: true,
  initialValue: newUi,
  hideColumnType: true,
};

export const InputGridV2WithoutColumnType = InputGridV2Template.bind({});
InputGridV2WithoutColumnType.args = {
  hideColumnType: true,
  initialValue: withoutTypeColumn,
};

export const InputGridV2WithArrayOfObj = InputGridV2Template.bind({});
InputGridV2WithArrayOfObj.args = {
  initialValue: arrOfObj,
};

export const InputGridV2ReadOnly = InputGridV2Template.bind({});
InputGridV2ReadOnly.args = {
  readOnly: true,
  initialValue: readOnly,
};

export const InputGridV2CustomDataType = InputGridV2Template.bind({});
InputGridV2CustomDataType.args = {
  enableCheckbox: true,
  allowQuestionDataType: true,
  disableDelete: true,
  disableAdd: false,
  disableKeyEditing: true,
  disableTypeEditing: false,
  disableCheckboxSelection: false,
  initialValue: questionDataTypeValue,
  hideColumnType: true,
  // showFxCell: false,
};
