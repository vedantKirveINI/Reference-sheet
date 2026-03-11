import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import classes from "./TinyGPTAnalyzer.module.css";
import InfoDisplay from "../common-components/InfoDisplay";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSCheckbox } from "@src/module/ods";
import TINYGPT_ANALYZER_NODE, {
  ANALYSIS_FOCUS,
  DATA_TYPES_SPECIFICATION,
  FREQUENCY_OF_ANALYSIS,
  REPORTING_FORMAT,
  VISUALIZATION_PREFERENCE,
} from "./constant";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";

const TinyGPTAnalyzer = forwardRef(({ data = {}, onSave = () => {} }, ref) => {
  const [dataTypeSpecification, setDataTypeSpecification] = useState(
    data.dataTypeSpecification || DATA_TYPES_SPECIFICATION.TEXT
  );
  const [analysisFocus, setAnalysisFocus] = useState(
    data.analysisFocus || ANALYSIS_FOCUS.SENTIMENT_ANALYSIS
  );
  const [visualizationPreference, setVisualizationPreference] = useState(
    data.visualizationPreference || VISUALIZATION_PREFERENCE.GRAPH
  );
  const [comparativeAnalysisOptions, setComparativeAnalysisOptions] = useState(
    data.comparativeAnalysisOptions || false
  );
  const [confidentialitySettings, setConfidentialitySettings] = useState(
    data.confidentialitySettings || false
  );
  const [reportingFormat, setReportingFormat] = useState(
    data.reportingFormat || REPORTING_FORMAT.PDF
  );
  const [frequencyOfAnalysis, setFrequencyOfAnalysis] = useState(
    data.frequencyOfAnalysis || FREQUENCY_OF_ANALYSIS.REAL_TIME
  );

  const [validTabIndices, setValidTabIndices] = useState([0]);

  const tabs = useMemo(
    () => [
      {
        label: "Configure",
        panelComponent: Configure,
        panelComponentProps: {
          dataTypeSpecification,
          setDataTypeSpecification,
          analysisFocus,
          setAnalysisFocus,
          visualizationPreference,
          setVisualizationPreference,
          comparativeAnalysisOptions,
          setComparativeAnalysisOptions,
          confidentialitySettings,
          setConfidentialitySettings,
          reportingFormat,
          setReportingFormat,
          frequencyOfAnalysis,
          setFrequencyOfAnalysis,
        },
      },
    ],
    [
      analysisFocus,
      comparativeAnalysisOptions,
      confidentialitySettings,
      dataTypeSpecification,
      frequencyOfAnalysis,
      reportingFormat,
      visualizationPreference,
    ]
  );
  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          dataTypeSpecification,
          analysisFocus,
          visualizationPreference,
          comparativeAnalysisOptions,
          confidentialitySettings,
          reportingFormat,
          frequencyOfAnalysis,
        };
      },
    }),
    [
      analysisFocus,
      comparativeAnalysisOptions,
      confidentialitySettings,
      dataTypeSpecification,
      frequencyOfAnalysis,
      reportingFormat,
      visualizationPreference,
    ]
  );
  return (
    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: TINYGPT_ANALYZER_NODE.dark,
        light: TINYGPT_ANALYZER_NODE.light,
        foreground: TINYGPT_ANALYZER_NODE.foreground,
      }}
      hasTestTab={TINYGPT_ANALYZER_NODE.hasTestModule}
      validTabIndices={validTabIndices}
      onSave={onSave}
      showCommonActionFooter={true}
      validateTabs={true}
    />
  );
});
export default TinyGPTAnalyzer;
