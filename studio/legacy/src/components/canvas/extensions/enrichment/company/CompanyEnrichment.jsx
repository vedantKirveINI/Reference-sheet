import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import CommonTestModule from "../../common-components/CommonTestModule";
import COMPANY_ENRICHMENT_NODE from "./constant";
import TabContainer from "../../common-components/TabContainer";

import Configure from "./tabs/Configure";
import cloneDeep from "lodash/cloneDeep";

function CompanyEnrichment(props, ref) {
  const {
    canvasRef,
    annotation,
    data,
    variables,
    onSave,
    nodeData,
    workspaceId,
    parentId,
    projectId,
    assetId,
  } = props;

  const [enrichmentData, setEnrichmentData] = useState(cloneDeep(data || {}));

  const [validTabIndices, setValidTabIndices] = useState([]);
  const [errorMessages, setErrorMessages] = useState({
    0: [],
  });

  const testModuleRef = useRef();

  const tabs = useMemo(() => {
    return [
      {
        label: "CONFIGURE",
        panelComponent: Configure,
        panelComponentProps: {
          variables,
          enrichmentData,
          setValidTabIndices,
          setErrorMessages,
          setEnrichmentData,
        },
      },
      {
        label: "TEST",
        panelComponent: CommonTestModule,
        panelComponentProps: {
          canvasRef,
          annotation,
          ref: testModuleRef,
          go_data: data,
          variables,
          workspaceId: workspaceId,
          parentId: parentId,
          assetId: assetId,
          projectId: projectId,
          node: nodeData || COMPANY_ENRICHMENT_NODE,
          onTestComplete: (output_schema) => {
            // update the enrichment data with the output schema,
            // schema structure is not defined on BE and we need to show structure it in FX
            setEnrichmentData((prev) => ({
              ...prev,
              output: {
                schema: output_schema,
              },
            }));
            setValidTabIndices([0, 1]);
          },
        },
      },
    ];
  }, [
    annotation,
    enrichmentData,
    assetId,
    canvasRef,
    data,
    nodeData,
    parentId,
    projectId,
    variables,
    workspaceId,
  ]);

  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        return enrichmentData;
      },
      getError: () => {
        return errorMessages;
      },
    };
  }, [errorMessages, enrichmentData]);

  return (
    <TabContainer
      tabs={tabs}
      validTabIndices={validTabIndices}
      errorMessages={errorMessages}
      onTest={() => {
        testModuleRef.current?.beginTest();
      }}
      colorPalette={{
        dark: COMPANY_ENRICHMENT_NODE.dark,
        light: COMPANY_ENRICHMENT_NODE.light,
        foreground: COMPANY_ENRICHMENT_NODE.foreground,
      }}
      onSave={onSave}
      hasTestTab={COMPANY_ENRICHMENT_NODE.hasTestModule}
      showCommonActionFooter={true}
      validateTabs={true}
      beforePanelUnmount={() => onSave(true)}
      showBottomBorder={true}
    />
  );
}

export default forwardRef(CompanyEnrichment);
