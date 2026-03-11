import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import TINY_SEARCH_NODE from "./constant";
import TabContainer from "../common-components/TabContainer";
import CommonTestModule from "../common-components/CommonTestModule";
import Configure from "./tabs/configure/Configure";

const TinySearch = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      nodeData,
      onSave = () => {},
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const [validTabIndices, setValidTabIndices] = useState([]);
    const [error, setError] = useState({
      0: [],
    });
    const [parentData, setParentData] = useState({
      name: data?.name || nodeData?.name,
      ...(data || {}),
    });

    const changeHandler = useCallback((key, value) => {
      setParentData((prev) => {
        return { ...prev, [key]: value };
      });
    }, []);

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            data: parentData,
            variables,
            setError,
            setValidTabIndices,
            onChange: changeHandler,
          },
        },

        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: parentData,
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            variables,
            node: nodeData || TINY_SEARCH_NODE,
            onTestComplete: (output_schema) => {
              setParentData((prev) => {
                return {
                  ...prev,
                  output: { schema: output_schema },
                };
              });
              setValidTabIndices([0, 1]);
            },
          },
        },
      ];
    }, [
      annotation,
      assetId,
      canvasRef,
      changeHandler,
      error,
      nodeData,
      parentData,
      parentId,
      projectId,
      validTabIndices,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getData: () => parentData,
        getError: () => error,
      }),
      [parentData, error]
    );
    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        tabs={tabs || []}
        colorPalette={{
          dark: TINY_SEARCH_NODE.dark,
          light: TINY_SEARCH_NODE.light,
          foreground: TINY_SEARCH_NODE.foreground,
        }}
        onSave={onSave}
        hasTestTab={TINY_SEARCH_NODE.hasTestModule}
        errorMessages={error}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default TinySearch;
