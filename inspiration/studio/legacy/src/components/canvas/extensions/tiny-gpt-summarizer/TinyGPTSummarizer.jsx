import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import classes from "./TinyGPTSummarizer.module.css";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSTextField from "oute-ds-text-field";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSAutocomplete, ODSTextField, ODSCheckbox } from "@src/module/ods";
import InfoDisplay from "../common-components/InfoDisplay";

import TINYGPT_SUMMARIZER_NODE, {
  FORMAT_SELECTION,
  LANGUAGE_SIMPLICITY_LEVEL,
  SUMMARY_LENGTH_SPECIFICATION,
} from "./constant";

import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";

const TinyGPTSummarizer = forwardRef(
  ({ data = {}, onSave = () => {} }, ref) => {
    const [summaryLengthSpecification, setSummaryLengthSpecification] =
      useState(
        data?.summaryLengthSpecification || SUMMARY_LENGTH_SPECIFICATION.BREIF
      );
    const [focusAreasIdentification, setFocusAreasIdentification] = useState(
      data?.focusAreasIdentification || ""
    );
    const [formatSelection, setFormatSelection] = useState(
      data?.formatSelection || FORMAT_SELECTION.BULLET_POINTS
    );
    const [languageSimplicityLevel, setLanguageSimplicityLevel] = useState(
      data?.languageSimplicityLevel || LANGUAGE_SIMPLICITY_LEVEL.SIMPLE
    );
    const [inclusionOfQuotesOption, setInclusionOfQuotesOption] = useState(
      data?.inclusionOfQuotesOption || false
    );
    const [isSourceDocumentUpdated, setIsSourceDocumentUpdated] = useState(
      data?.isSourceDocumentUpdated || false
    );

    const [validTabIndices, setValidTabIndices] = useState([0]);

    const tabs = useMemo(
      () => [
        {
          label: "Configure",
          panelComponent: Configure,
          panelComponentProps: {
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
          },
        },
      ],
      [
        focusAreasIdentification,
        formatSelection,
        inclusionOfQuotesOption,
        isSourceDocumentUpdated,
        languageSimplicityLevel,
        summaryLengthSpecification,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            summaryLengthSpecification,
            focusAreasIdentification,
            formatSelection,
            languageSimplicityLevel,
            inclusionOfQuotesOption,
            isSourceDocumentUpdated,
          };
        },
      }),
      [
        focusAreasIdentification,
        formatSelection,
        inclusionOfQuotesOption,
        isSourceDocumentUpdated,
        languageSimplicityLevel,
        summaryLengthSpecification,
      ]
    );
    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_SUMMARIZER_NODE.dark,
          light: TINYGPT_SUMMARIZER_NODE.light,
          foreground: TINYGPT_SUMMARIZER_NODE.foreground,
        }}
        hasTestTab={TINYGPT_SUMMARIZER_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);
export default TinyGPTSummarizer;
