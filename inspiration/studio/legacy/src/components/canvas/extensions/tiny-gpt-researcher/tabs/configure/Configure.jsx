import React from "react";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";
import InfoDisplay from "../../../common-components/InfoDisplay";
import classes from "../../TinyGPTResearcher.module.css";
import RadioGroupSection from "../../../common-components/RadioGroupSection";
import CheckboxGroupSection from "../../../common-components/CheckboxGroupSection";
import {
  DEPTH_OF_SEARCH,
  FACT_CHECK_LEVEL,
  OUTPUT_FORMAT,
  SOURCE_PREFERENCE,
  UPDATE_FREQUENCY,
} from "../../constant";

const Configure = ({
  topicSpecification,
  setTopicSpecification,
  depthOfResearch,
  setDepthOfResearch,
  sourcePreference,
  outputFormat,
  setOutputFormat,
  updateFrequency,
  setUpdateFrequency,
  factCheckLevel,
  setFactCheckLevel,
  sourcePreferenceRef,
}) => {
  return (
    <section className={classes["tiny-gpt-researcher-container"]}>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-researcher-topic-specification-container"
      >
        <InfoDisplay
          title="Topic Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
          data-testid="tiny-gpt-researcher-topic-specification"
        />
        <ODSTextField
          value={topicSpecification}
          onChange={(e) => setTopicSpecification(e.target.value)}
          placeholder="Enter topic specification"
          multiline
          minRows={4}
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
          data-testid="tiny-gpt-researcher-topic-specification-input"
        />
      </div>
      <RadioGroupSection
        title="Depth of Research"
        description="Choose the level of depth for your research."
        options={DEPTH_OF_SEARCH}
        value={depthOfResearch}
        onValueChange={(value) => setDepthOfResearch(value)}
        dataTestId="tiny-gpt-researcher-depth-of-research"
      />
      <CheckboxGroupSection
        ref={sourcePreferenceRef}
        defaultSelectedOptions={sourcePreference?.preferences || []}
        defaultOtherContent={sourcePreference?.otherContent || ""}
        title="Source Preference"
        description="Select your preferred sources for the research."
        options={SOURCE_PREFERENCE}
      />
      {/* <RadioGroupSection
    title="Source Preference"
    description="Select your preferred sources for the research."
    options={SOURCE_PREFERENCE}
    value={sourcePreference}
    onValueChange={(value) => setSourcePreference(value)}
  /> */}
      <RadioGroupSection
        title="Output Format"
        description="Choose the format of the research output."
        options={OUTPUT_FORMAT}
        value={outputFormat}
        onValueChange={(value) => setOutputFormat(value)}
        dataTestId="tiny-gpt-researcher-output-format"
      />
      <RadioGroupSection
        title="Update Frequency"
        description="Choose how often the research data should be updated."
        options={UPDATE_FREQUENCY}
        value={updateFrequency}
        onValueChange={(value) => setUpdateFrequency(value)}
        dataTestId="tiny-gpt-researcher-update-frequency"
      />
      <RadioGroupSection
        title="Fact Check Level"
        description="Select the desired level of fact-checking."
        options={FACT_CHECK_LEVEL}
        value={factCheckLevel}
        onValueChange={(value) => setFactCheckLevel(value)}
        dataTestId="tiny-gpt-researcher-fact-check-level"
      />
    </section>
  );
};

export default Configure;
