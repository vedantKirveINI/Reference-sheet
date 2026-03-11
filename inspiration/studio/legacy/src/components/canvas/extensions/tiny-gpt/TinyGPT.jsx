import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cloneDeep } from "lodash";
import TabContainer from "../common-components/TabContainer";
import TINYGPT_NODE from "./constant";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../common-components/CommonTestModule";

const TinyGPT = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    // const [label, setLabel] = useState(data.label || TINY_GPT_TYPE);
    const [persona, setPersona] = useState(data.persona);
    const [query, setQuery] = useState(data.query);
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [error, setError] = useState({
      0: [],
      1: [],
    });

    const [format, setFormat] = useState(cloneDeep(data?.format) || []);
    // const gridRef = useRef();
    const testModuleRef = useRef();

    const onGridDataChange = (data = []) => {
      setFormat([...data]);
    };

    const getData = useCallback(() => {
      const data = {
        persona,
        query,
        format,
      };
      return data;
    }, [format, persona, query]);

    const tabs = useMemo(
      () => [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            format,
            variables,
            persona,
            setPersona,
            query,
            setQuery,
            onGridDataChange,
            setValidTabIndices,
            setError,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: getData(),
            variables,
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            node: nodeData || TINYGPT_NODE,
            onTestComplete: () => {
              setValidTabIndices([0, 1]);
            },
          },
        },
      ],
      [
        annotation,
        assetId,
        canvasRef,
        format,
        getData,
        nodeData,
        parentId,
        persona,
        projectId,
        query,
        variables,
        workspaceId,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        getData,
        getError: () => error,
      }),
      [getData, error]
    );

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_NODE.dark,
          light: TINYGPT_NODE.light,
          foreground: TINYGPT_NODE.foreground,
        }}
        hasTestTab={TINYGPT_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        onTest={() => {
          testModuleRef?.current.beginTest();
        }}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
        errorMessages={error}
      />
    );
  }
);

export default TinyGPT;
