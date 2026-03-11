import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import AGENT_OUTPUT_NODE from "./constant";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";

const EndNode = forwardRef(
  ({ data = {}, variables = {}, onSave = () => {} }, ref) => {
    const [endNodeRowData, setEndNodeRowData] = useState(
      data?.outputs ? data.outputs : []
    );

    const inputGridRef = useRef();

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
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: AGENT_OUTPUT_NODE.dark,
          light: AGENT_OUTPUT_NODE.light,
          foreground: AGENT_OUTPUT_NODE.foreground,
        }}
        hasTestTab={AGENT_OUTPUT_NODE.hasTestModule}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default EndNode;
