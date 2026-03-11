import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";

import TINYGPT_CREATIVE_NODE, {
  CONTENT_TYPE,
  CREATIVITY_LEVEL_ADJUSTMENT,
  FORMAT_SELECTION,
} from "./constant";

const TinyGPTCreative = forwardRef(({ data = {}, onSave = () => {} }, ref) => {
  const [creativityLevelAdjustment, setCreativityLevelAdjustment] = useState(
    data?.creativityLevelAdjustment || CREATIVITY_LEVEL_ADJUSTMENT.BALANCED
  );
  const [contentType, setContentType] = useState(
    data?.contentType || CONTENT_TYPE.AD_COPY
  );
  const [industryFocus, setIndustryFocus] = useState(data?.industryFocus || "");
  const [brandVoiceDefinition, setBrandVoiceDefinition] = useState(
    data?.brandVoiceDefinition || ""
  );
  const [formatSelection, setFormatSelection] = useState(
    data?.formatSelection || FORMAT_SELECTION.TEXT
  );
  const [iterationFeedbackLoops, setIterationFeedbackLoops] = useState(
    data?.iterationFeedbackLoops || false
  );
  const tabs = useMemo(() => {
    return [
      {
        label: "CONFIGURE",
        panelComponent: Configure,
        panelComponentProps: {
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
        },
      },
    ];
  }, [
    brandVoiceDefinition,
    contentType,
    creativityLevelAdjustment,
    formatSelection,
    industryFocus,
    iterationFeedbackLoops,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          creativityLevelAdjustment,
          contentType,
          industryFocus,
          brandVoiceDefinition,
          formatSelection,
          iterationFeedbackLoops,
        };
      },
    }),
    [
      creativityLevelAdjustment,
      contentType,
      industryFocus,
      brandVoiceDefinition,
      formatSelection,
      iterationFeedbackLoops,
    ]
  );
  return (
    // <section
    //   className={classes["tiny-gpt-creative-container"]}
    //   data-testid="tiny-gpt-creative-container"
    // >
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-creativity-level-adjustment-container"
    //   >
    //     <InfoDisplay
    //       title="Creativity Level Adjustment"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(CREATIVITY_LEVEL_ADJUSTMENT)}
    //       placeholder="Select"
    //       value={creativityLevelAdjustment}
    //       onChange={(e, newValue) => {
    //         setCreativityLevelAdjustment(newValue);
    //       }}
    //       data-testid="tiny-gpt-creative-creativity-level-adjustment-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-content-type-container"
    //   >
    //     <InfoDisplay
    //       title="Content Type"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(CONTENT_TYPE)}
    //       placeholder="Select"
    //       value={contentType}
    //       onChange={(e, newValue) => {
    //         setContentType(newValue);
    //       }}
    //       data-testid="tiny-gpt-creative-content-type-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-industry-focus-container"
    //   >
    //     <InfoDisplay
    //       title="Industry Focus"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSTextField
    //       value={industryFocus}
    //       onChange={(e) => setIndustryFocus(e.target.value)}
    //       placeholder="Enter industry focus"
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
    //       data-testid="tiny-gpt-creative-industry-focus-text-field"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-brand-voice-definition-container"
    //   >
    //     <InfoDisplay
    //       title="Brand Voice Definition"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSTextField
    //       value={brandVoiceDefinition}
    //       onChange={(e) => setBrandVoiceDefinition(e.target.value)}
    //       placeholder="Enter brand voice definition"
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
    //       data-testid="tiny-gpt-creative-brand-voice-definition-text-field"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-format-selection-container"
    //   >
    //     <InfoDisplay
    //       title="Format Selection"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(FORMAT_SELECTION)}
    //       placeholder="Select"
    //       value={formatSelection}
    //       onChange={(e, newValue) => {
    //         setFormatSelection(newValue);
    //       }}
    //       data-testid="tiny-gpt-creative-format-selection-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-creative-iteration-feedback-loops-container"
    //   >
    //     <InfoDisplay
    //       title="Iteration Feedback Loops"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSCheckbox
    //       checked={iterationFeedbackLoops}
    //       onChange={(event) => setIterationFeedbackLoops(event.target.checked)}
    //       data-testid="tiny-gpt-creative-iteration-feedback-loops-checkbox"
    //     />
    //   </div>
    // </section>

    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: TINYGPT_CREATIVE_NODE.dark,
        light: TINYGPT_CREATIVE_NODE.light,
        foreground: TINYGPT_CREATIVE_NODE.foreground,
      }}
      validTabIndices={[0]}
      onSave={onSave}
      showCommonActionFooter={true}
      validateTabs={true}
    />
  );
});
export default TinyGPTCreative;
