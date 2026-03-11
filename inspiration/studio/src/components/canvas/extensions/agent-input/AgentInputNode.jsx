import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import _ from "lodash";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import START_NODE from "./constant";

const AgentInputNode = forwardRef(
  ({ data = {}, variables, onSave = () => {} }, ref) => {
    const startNodeRowData = useMemo(() => {
      return data?.inputs ? _.cloneDeep(data.inputs) : [];
    }, [data?.inputs]);

    const inputGridRef = useRef();

    const getData = useCallback(() => {
      const inputs = inputGridRef?.current?.getData();
      return {
        inputs,
      };
    }, []);

    useImperativeHandle(ref, () => {
      return {
        getData,
      };
    }, [getData]);

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            inputGridRef,
            data: startNodeRowData,
            variables,
          },
        },
      ];
    }, [startNodeRowData, variables]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: START_NODE.dark,
          light: START_NODE.light,
          foreground: START_NODE.foreground,
        }}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
      />
    );
  }
);

export default AgentInputNode;
