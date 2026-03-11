import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
// import ODSNumberInput from "oute-ds-number-input";
// import ODSTextField from "oute-ds-text-field";
import { ODSNumberInput, ODSTextField } from "@src/module/ods";

import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";

import { isStringLengthGreaterThan } from "../extension-utils";

import END_NODE from "./constant";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";

const EndNode = forwardRef(
  ({ data = {}, variables = {}, onSave = () => {} }, ref) => {
    const [endNodeRowData, setEndNodeRowData] = useState(
      data?.outputs ? data.outputs : []
    );

    const inputGridRef = useRef();

    // const [nodeLabel, setNodeLabel] = useState(data?.label || END_NODE.name);

    const [statusCode, setStatusCode] = useState(data?.statusCode || "");

    const tabs = useMemo(
      () => [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            statusCode,
            setStatusCode,
            endNodeRowData,
            variables,
            ref: inputGridRef,
          },
        },
      ],
      [endNodeRowData, statusCode, variables]
    );

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            outputs: inputGridRef.current?.getValue(),
            // label: nodeLabel,
            statusCode,
          };
        },
      };
    }, [statusCode]);

    return (
      // <div
      //   style={{
      //     height: "calc(100% - 0.5rem)",
      //     padding: "0.5rem 0",
      //     boxSizing: "border-box",
      //     display: "flex",
      //     flexDirection: "column",
      //     gap: "1rem",
      //   }}
      // >
      //   {/* <ODSTextField
      //     InputProps={{
      //       "data-testid": "end-node-label",
      //     }}
      //     value={nodeLabel}
      //     onChange={(e) => {
      //       if (isStringLengthGreaterThan(e.target?.value, 64)) return;
      //       setNodeLabel(e.target?.value);
      //     }}
      //   /> */}
      //   <ODSNumberInput
      //     label="Status Code"
      //     placeholder="Enter status code"
      //     value={statusCode}
      //     onChange={(e) => {
      //       setStatusCode(e.target.value);
      //     }}
      //     InputProps={{
      //       "data-testid": "end-node-status-code",
      //     }}
      //     decimalScale={0}
      //     sx={{
      //       width: "100%",
      //     }}
      //   />
      //   <InputGridV2
      //     ref={inputGridRef}
      //     variables={variables}
      //     initialValue={endNodeRowData}
      //     isValueMode
      //   />
      // </div>
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: END_NODE.dark,
          light: END_NODE.light,
          foreground: END_NODE.foreground,
        }}
        hasTestTab={END_NODE.hasTestModule}
        // errorMessages={errorMessages}
        validTabIndices={[0]}
        onSave={onSave}
        // onTest={() => {
        //   testModuleRef?.current.beginTest();
        // }}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default EndNode;
