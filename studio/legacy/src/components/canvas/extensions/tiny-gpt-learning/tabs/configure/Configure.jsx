import React from "react";
import classes from "../../TinyGPTLearning.module.css";

import InfoDisplay from "../../../common-components/InfoDisplay";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSCheckbox } from "@src/module/ods";
import {
  CONTENT_DEPTH_SPECIFICATION,
  LEARNING_STYLE,
  ASSESSMENT_FREQUENCY_SETTINGS,
  PACING_OPTIONS,
} from "../../constant";

const Configure = ({
  learningStyle,
  setLearningStyle,
  pacingOption,
  setPacingOption,
  contentDepthSpecification,
  setContentDepthSpecification,
  assessmentFrequency,
  setAssessmentFrequency,
  isInteractiveElementsInclusion,
  setIsInteractiveElementsInclusion,
  activeCertificationOptions,
  setActiveCertificationOptions,
}) => {
  return (
    <section
      className={classes["tiny-gpt-learning-container"]}
      data-testid="tiny-gpt-learning-container"
    >
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-learning-style-container"
      >
        <InfoDisplay
          title="Learning Style Selectiont"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(LEARNING_STYLE)}
          placeholder="Select"
          value={learningStyle}
          onChange={(e, newValue) => {
            setLearningStyle(newValue);
          }}
          data-testid="tiny-gpt-learning-learning-style-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-pacing-option-container"
      >
        <InfoDisplay
          title="Pacing Options"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(PACING_OPTIONS)}
          placeholder="Select"
          value={pacingOption}
          onChange={(e, newValue) => {
            setPacingOption(newValue);
          }}
          data-testid="tiny-gpt-learning-pacing-option-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-content-depth-specification-container"
      >
        <InfoDisplay
          title="Content Depth Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(CONTENT_DEPTH_SPECIFICATION)}
          placeholder="Select"
          value={contentDepthSpecification}
          onChange={(e, newValue) => {
            setContentDepthSpecification(newValue);
          }}
          data-testid="tiny-gpt-learning-content-depth-specification-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-assessment-frequency-settings-container"
      >
        <InfoDisplay
          title="Assessment Frequency Settings"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(ASSESSMENT_FREQUENCY_SETTINGS)}
          placeholder="Select"
          value={assessmentFrequency}
          onChange={(e, newValue) => {
            setAssessmentFrequency(newValue);
          }}
          data-testid="tiny-gpt-learning-assessment-frequency-settings-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-interactive-elements-inclusion-container"
      >
        <InfoDisplay
          title="Interactive Elements Inclusion"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={isInteractiveElementsInclusion}
          onChange={(event) =>
            setIsInteractiveElementsInclusion(event.target.checked)
          }
          data-testid="tiny-gpt-learning-interactive-elements-inclusion-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-learning-certification-options-container"
      >
        <InfoDisplay
          title="Certification Options"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={activeCertificationOptions}
          onChange={(event) =>
            setActiveCertificationOptions(event.target.checked)
          }
          data-testid="tiny-gpt-learning-certification-options-checkbox"
        />
      </div>
    </section>
  );
};

export default Configure;
