import React from "react";
import classes from "../../TinyGPTCreative.module.css";
import InfoDisplay from "../../../common-components/InfoDisplay";
import {
  CREATIVITY_LEVEL_ADJUSTMENT,
  CONTENT_TYPE,
  FORMAT_SELECTION,
} from "../../constant";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSTextField from "oute-ds-text-field";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSTextField, ODSCheckbox } from "@src/module/ods";

const Configure = ({
  creativityLevelAdjustment,
  setCreativityLevelAdjustment,
  contentType,
  setContentType,
  industryFocus,
  setIndustryFocus,
  brandVoiceDefinition,
  setBrandVoiceDefinition,
  formatSelection,
  setFormatSelection,
  iterationFeedbackLoops,
  setIterationFeedbackLoops,
}) => {
  return (
    <section
      className={classes["tiny-gpt-creative-container"]}
      data-testid="tiny-gpt-creative-container"
    >
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-creativity-level-adjustment-container"
      >
        <InfoDisplay
          title="Creativity Level Adjustment"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(CREATIVITY_LEVEL_ADJUSTMENT)}
          placeholder="Select"
          value={creativityLevelAdjustment}
          onChange={(e, newValue) => {
            setCreativityLevelAdjustment(newValue);
          }}
          data-testid="tiny-gpt-creative-creativity-level-adjustment-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-content-type-container"
      >
        <InfoDisplay
          title="Content Type"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(CONTENT_TYPE)}
          placeholder="Select"
          value={contentType}
          onChange={(e, newValue) => {
            setContentType(newValue);
          }}
          data-testid="tiny-gpt-creative-content-type-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-industry-focus-container"
      >
        <InfoDisplay
          title="Industry Focus"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={industryFocus}
          onChange={(e) => setIndustryFocus(e.target.value)}
          placeholder="Enter industry focus"
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
          data-testid="tiny-gpt-creative-industry-focus-text-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-brand-voice-definition-container"
      >
        <InfoDisplay
          title="Brand Voice Definition"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={brandVoiceDefinition}
          onChange={(e) => setBrandVoiceDefinition(e.target.value)}
          placeholder="Enter brand voice definition"
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
          data-testid="tiny-gpt-creative-brand-voice-definition-text-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-format-selection-container"
      >
        <InfoDisplay
          title="Format Selection"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(FORMAT_SELECTION)}
          placeholder="Select"
          value={formatSelection}
          onChange={(e, newValue) => {
            setFormatSelection(newValue);
          }}
          data-testid="tiny-gpt-creative-format-selection-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-creative-iteration-feedback-loops-container"
      >
        <InfoDisplay
          title="Iteration Feedback Loops"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={iterationFeedbackLoops}
          onChange={(event) => setIterationFeedbackLoops(event.target.checked)}
          data-testid="tiny-gpt-creative-iteration-feedback-loops-checkbox"
        />
      </div>
    </section>
  );
};

export default Configure;
