import React from "react";
import classes from "../../TinyGPTConsultant.module.css";
import InfoDisplay from "../../../common-components/InfoDisplay";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSTextField from "oute-ds-text-field";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSTextField, ODSCheckbox } from "@src/module/ods";
import {
  CONSULTATION_AREA_SPECIFICATION,
  RECOMMENDATION_DETAIL_LEVEL,
  REPORT_FORMAT_SELECTION,
} from "../../constant";

const Configure = ({
  consultationAreaSpecification,
  setConsultationAreaSpecification,
  inputDataDefinition,
  setInputDataDefinition,
  recommendationDetailLevel,
  setRecommendationDetailLevel,
  riskAssessmentOptions,
  setRiskAssessmentOptions,
  scenarioExplorationFeatures,
  setScenarioExplorationFeatures,
  reportFormatSelection,
  setReportFormatSelection,
}) => {
  return (
    <section
      className={classes["tiny-gpt-consultant-container"]}
      data-testid="tiny-gpt-consultant-container"
    >
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-consultation-area-specification-container"
      >
        <InfoDisplay
          title="Consultation Area Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(CONSULTATION_AREA_SPECIFICATION)}
          placeholder="Select"
          value={consultationAreaSpecification}
          onChange={(e, newValue) => {
            setConsultationAreaSpecification(newValue);
          }}
          data-testid="tiny-gpt-consultant-consultation-area-specification-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-input-data-definition-container"
      >
        <InfoDisplay
          title="Input Data Definition"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={inputDataDefinition}
          onChange={(e) => setInputDataDefinition(e.target.value)}
          placeholder="Enter topic specification"
          multiline
          rows={4}
          maxRows={4}
          sx={{
            width: "100%",
            borderRadius: "12px",
            border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
            background: "var(--white, #FFF)",
            boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
            "& .MuiInputBase-input": {
              padding: "5px",
              color: "#263238",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "24px",
              letterSpacing: "0.5px",
            },
          }}
          data-testid="tiny-gpt-consultant-input-data-definition-text-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-recommendation-detail-level-container"
      >
        <InfoDisplay
          title="Recommendation Detail Level"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(RECOMMENDATION_DETAIL_LEVEL)}
          placeholder="Select"
          value={recommendationDetailLevel}
          onChange={(e, newValue) => {
            setRecommendationDetailLevel(newValue);
          }}
          data-testid="tiny-gpt-consultant-recommendation-detail-level-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-risk-assessment-options-container"
      >
        <InfoDisplay
          title="Risk Assessment Options"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={riskAssessmentOptions}
          onChange={(event) => setRiskAssessmentOptions(event.target.checked)}
          data-testid="tiny-gpt-consultant-risk-assessment-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-scenario-exploration-features-container"
      >
        <InfoDisplay
          title="Scenario Exploration Features"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={scenarioExplorationFeatures}
          onChange={(event) =>
            setScenarioExplorationFeatures(event.target.checked)
          }
          data-testid="tiny-gpt-consultant-scenario-exploration-features-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-consultant-report-format-selection-container"
      >
        <InfoDisplay
          title="Reporting Format Selection"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(REPORT_FORMAT_SELECTION)}
          placeholder="Select"
          value={reportFormatSelection}
          onChange={(e, newValue) => {
            setReportFormatSelection(newValue);
          }}
          data-testid="tiny-gpt-consultant-report-format-selection-autocomplete"
        />
      </div>
    </section>
  );
};

export default Configure;
