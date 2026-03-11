import React from "react";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSCheckbox } from "@src/module/ods";
import InfoDisplay from "../../../common-components/InfoDisplay";
import classes from "../../TinyGPTAnalyzer.module.css";
import {
  ANALYSIS_FOCUS,
  DATA_TYPES_SPECIFICATION,
  FREQUENCY_OF_ANALYSIS,
  REPORTING_FORMAT,
  VISUALIZATION_PREFERENCE,
} from "../../constant";

const Configure = ({
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
}) => {
  return (
    <section
      className={classes["tiny-gpt-analyzer-container"]}
      data-testid="tiny-gpt-analyzer-container"
    >
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-data-type-specification-container"
      >
        <InfoDisplay
          title="Data Type Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(DATA_TYPES_SPECIFICATION)}
          placeholder="Select"
          value={dataTypeSpecification}
          onChange={(e, newValue) => {
            setDataTypeSpecification(newValue);
          }}
          data-testid="tiny-gpt-analyzer-data-type-specification-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-analysis-focus-container"
      >
        <InfoDisplay
          title="Analysis Focus"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(ANALYSIS_FOCUS)}
          placeholder="Select"
          value={analysisFocus}
          onChange={(e, newValue) => {
            setAnalysisFocus(newValue);
          }}
          data-testid="tiny-gpt-analyzer-analysis-focus-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-visualization-preference-container"
      >
        <InfoDisplay
          title="Visualization Preferences"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(VISUALIZATION_PREFERENCE)}
          placeholder="Select"
          value={visualizationPreference}
          onChange={(e, newValue) => {
            setVisualizationPreference(newValue);
          }}
          data-testid="tiny-gpt-analyzer-visualization-preference-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-comparative-analysis-options-container"
      >
        <InfoDisplay
          title="Comparative Analysis Options"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={comparativeAnalysisOptions}
          sx={{}}
          onChange={(event) =>
            setComparativeAnalysisOptions(event.target.checked)
          }
          data-testid="tiny-gpt-analyzer-comparative-analysis-options-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-confidentiality-settings-container"
      >
        <InfoDisplay
          title="Confidentiality Settings"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={confidentialitySettings}
          sx={{}}
          onChange={(event) => setConfidentialitySettings(event.target.checked)}
          data-testid="tiny-gpt-analyzer-confidentiality-settings-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-reporting-format-container"
      >
        <InfoDisplay
          title="Reporting Format"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(REPORTING_FORMAT)}
          placeholder="Select"
          value={reportingFormat}
          onChange={(e, newValue) => {
            setReportingFormat(newValue);
          }}
          data-testid="tiny-gpt-analyzer-reporting-format-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-analyzer-frequency-analysis-container"
      >
        <InfoDisplay
          title="Frequency of Analysis"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(FREQUENCY_OF_ANALYSIS)}
          placeholder="Select"
          value={frequencyOfAnalysis}
          onChange={(e, newValue) => {
            setFrequencyOfAnalysis(newValue);
          }}
          data-testid="tiny-gpt-analyzer-frequency-analysis-autocomplete"
        />
      </div>
    </section>
  );
};

export default Configure;
