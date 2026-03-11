import React from "react";
import InfoDisplay from "../../../common-components/InfoDisplay";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSTextField from "oute-ds-text-field";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSTextField, ODSCheckbox } from "@src/module/ods";
import classes from "../../TinyGPTSummarizer.module.css";
import {
  SUMMARY_LENGTH_SPECIFICATION,
  FORMAT_SELECTION,
  LANGUAGE_SIMPLICITY_LEVEL,
} from "../../constant";

const Configure = ({
  summaryLengthSpecification,
  setSummaryLengthSpecification,
  focusAreasIdentification,
  setFocusAreasIdentification,
  formatSelection,
  setFormatSelection,
  languageSimplicityLevel,
  setLanguageSimplicityLevel,
  inclusionOfQuotesOption,
  setInclusionOfQuotesOption,
  isSourceDocumentUpdated,
  setIsSourceDocumentUpdated,
}) => {
  return (
    <section
      className={classes["tiny-gpt-summarizer-container"]}
      data-testid="tiny-gpt-summarizer-container"
    >
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-summary-length-specification-container"
      >
        <InfoDisplay
          title="Summary Length Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          value={summaryLengthSpecification}
          onChange={(e, newValue) => {
            setSummaryLengthSpecification(newValue);
          }}
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(SUMMARY_LENGTH_SPECIFICATION)}
          placeholder="Select"
          data-testid="tiny-gpt-summarizer-summary-length-specification-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-focus-areas-identification-container"
      >
        <InfoDisplay
          title="Focus Areas Identification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={focusAreasIdentification}
          onChange={(e) => setFocusAreasIdentification(e.target.value)}
          placeholder="Enter details.."
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
          data-testid="tiny-gpt-summarizer-focus-areas-identification-text-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-format-selection-container"
      >
        <InfoDisplay
          title="Format Selection"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          value={formatSelection}
          onChange={(e, newValue) => {
            setFormatSelection(newValue);
          }}
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(FORMAT_SELECTION)}
          placeholder="Select"
          data-testid="tiny-gpt-summarizer-format-selection-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-language-simplicity-level-container"
      >
        <InfoDisplay
          title="Language Simplicity Level"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSAutocomplete
          value={languageSimplicityLevel}
          onChange={(e, newValue) => {
            setLanguageSimplicityLevel(newValue);
          }}
          sx={{
            width: "100%",
          }}
          searchable={false}
          options={Object.values(LANGUAGE_SIMPLICITY_LEVEL)}
          placeholder="Select"
          data-testid="tiny-gpt-summarizer-language-simplicity-level-autocomplete"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-quotes-option-container"
      >
        <InfoDisplay
          title="Inclusion of Quotes Option"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={inclusionOfQuotesOption}
          onChange={(event) => setInclusionOfQuotesOption(event.target.checked)}
          data-testid="tiny-gpt-summarizer-quotes-option-checkbox"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-summarizer-update-options"
      >
        <InfoDisplay
          title="Update Options for Source Document Changes"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSCheckbox
          checked={isSourceDocumentUpdated}
          onChange={(event) => setIsSourceDocumentUpdated(event.target.checked)}
          data-testid="tiny-gpt-summarizer-update-options-checkbox"
        />
      </div>
    </section>
  );
};

export default Configure;
