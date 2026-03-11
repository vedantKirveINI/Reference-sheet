import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";

import TINYGPT_TRANSLATOR_NODE, {
  CONTEXT_PRESERVATION_LEVEL,
  FORMALITY_LEVEL_ADJUSTMENT,
  OUTPUT_FORMAT,
  SOURCE_LANGUAGE,
} from "./constant";

const TinyGPTTranslator = forwardRef(
  ({ data = {}, onSave = () => {} }, ref) => {
    const [sourceLanguage, setSourceLanguage] = useState(
      data?.sourceLanguage || SOURCE_LANGUAGE.ENGLISH
    );
    const [contextPreservationLevel, setContextPreservationLevel] = useState(
      data?.contextPreservationLevel || CONTEXT_PRESERVATION_LEVEL.DIRECT
    );
    const [formalityLevelAdjustment, setFormalityLevelAdjustment] = useState(
      data?.formalityLevelAdjustment || FORMALITY_LEVEL_ADJUSTMENT.LOW
    );
    const [industryJargonPreservation, setIndustryJargonPreservation] =
      useState(data?.industryJargonPreservation || "");
    const [qualityAssuranceOptions, setQualityAssuranceOptions] = useState(
      data?.qualityAssuranceOptions || false
    );
    const [outputFormat, setOutputFormat] = useState(
      data?.outputFormat || OUTPUT_FORMAT.PLAIN_TEXT
    );

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            sourceLanguage,
            setSourceLanguage,
            contextPreservationLevel,
            setContextPreservationLevel,
            formalityLevelAdjustment,
            setFormalityLevelAdjustment,
            industryJargonPreservation,
            setIndustryJargonPreservation,
            qualityAssuranceOptions,
            setQualityAssuranceOptions,
            outputFormat,
            setOutputFormat,
          },
        },
      ];
    }, [
      sourceLanguage,
      contextPreservationLevel,
      formalityLevelAdjustment,
      industryJargonPreservation,
      qualityAssuranceOptions,
      outputFormat,
    ]);
    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            sourceLanguage,
            contextPreservationLevel,
            formalityLevelAdjustment,
            industryJargonPreservation,
            qualityAssuranceOptions,
            outputFormat,
          };
        },
      }),
      [
        sourceLanguage,
        contextPreservationLevel,
        formalityLevelAdjustment,
        industryJargonPreservation,
        qualityAssuranceOptions,
        outputFormat,
      ]
    );

    return (
      // <section
      //   className={classes["tiny-gpt-translator-container"]}
      //   data-testid="tiny-gpt-translator-container"
      // >
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-language-selection-container"
      //   >
      //     <InfoDisplay
      //       title="Source and Target Language Selection"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSAutocomplete
      //       sx={{
      //         width: "100%",
      //       }}
      //       searchable={false}
      //       options={Object.values(SOURCE_LANGUAGE)}
      //       placeholder="Select"
      //       value={sourceLanguage}
      //       onChange={(e, newValue) => {
      //         setSourceLanguage(newValue);
      //       }}
      //       data-testid="tiny-gpt-translator-language-selection-autocomplete"
      //     />
      //   </div>
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-context-preservation-container"
      //   >
      //     <InfoDisplay
      //       title="Context Preservation Level"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSAutocomplete
      //       sx={{
      //         width: "100%",
      //       }}
      //       searchable={false}
      //       options={Object.values(CONTEXT_PRESERVATION_LEVEL)}
      //       placeholder="Select"
      //       value={contextPreservationLevel}
      //       onChange={(e, newValue) => {
      //         setContextPreservationLevel(newValue);
      //       }}
      //       data-testid="tiny-gpt-translator-context-preservation-autocomplete"
      //     />
      //   </div>
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-formality-container"
      //   >
      //     <InfoDisplay
      //       title="Formality Level Adjustment"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSAutocomplete
      //       sx={{
      //         width: "100%",
      //       }}
      //       searchable={false}
      //       options={Object.values(FORMALITY_LEVEL_ADJUSTMENT)}
      //       placeholder="Select"
      //       value={formalityLevelAdjustment}
      //       onChange={(e, newValue) => {
      //         setFormalityLevelAdjustment(newValue);
      //       }}
      //       data-testid="tiny-gpt-translator-formality-autocomplete"
      //     />
      //   </div>
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-industry-jargon-container"
      //   >
      //     <InfoDisplay
      //       title="Industry Jargon Preservation"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSTextField
      //       value={industryJargonPreservation}
      //       onChange={(e) => setIndustryJargonPreservation(e.target.value)}
      //       placeholder="Enter details.."
      //       multiline
      //       rows={4}
      //       maxRows={4}
      //       sx={{
      //         width: "100%",
      //         borderRadius: "12px",
      //         border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
      //         background: "var(--white, #FFF)",
      //         boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
      //         "& .MuiInputBase-input": {
      //           padding: "5px",
      //           color: "#263238",
      //           fontSize: "16px",
      //           fontStyle: "normal",
      //           fontWeight: 400,
      //           lineHeight: "24px",
      //           letterSpacing: "0.5px",
      //         },
      //       }}
      //       data-testid="tiny-gpt-translator-industry-jargon-text-field"
      //     />
      //   </div>
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-quality-assurance-container"
      //   >
      //     <InfoDisplay
      //       title="Quality Assurance Options"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSCheckbox
      //       checked={qualityAssuranceOptions}
      //       onChange={(event) => setQualityAssuranceOptions(event.target.checked)}
      //       data-testid="tiny-gpt-translator-quality-assurance-checkbox"
      //     />
      //   </div>
      //   <div
      //     className={classes["info-display-container"]}
      //     data-testid="tiny-gpt-translator-output-format-container"
      //   >
      //     <InfoDisplay
      //       title="Output Format Selection"
      //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
      //     />
      //     <ODSAutocomplete
      //       sx={{
      //         width: "100%",
      //       }}
      //       searchable={false}
      //       options={Object.values(OUTPUT_FORMAT)}
      //       placeholder="Select"
      //       value={outputFormat}
      //       onChange={(e, newValue) => {
      //         setOutputFormat(newValue);
      //       }}
      //       data-testid="tiny-gpt-translator-output-format-autocomplete"
      //     />
      //   </div>
      // </section>

      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_TRANSLATOR_NODE.dark,
          light: TINYGPT_TRANSLATOR_NODE.light,
          foreground: TINYGPT_TRANSLATOR_NODE.foreground,
        }}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);
export default TinyGPTTranslator;
