import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";

import TINYGPT_LEARNING_NODE, {
  CONTENT_DEPTH_SPECIFICATION,
  LEARNING_STYLE,
  ASSESSMENT_FREQUENCY_SETTINGS,
  PACING_OPTIONS,
} from "./constant";

const TinyGPTLearning = forwardRef(({ data = {}, onSave = () => {} }, ref) => {
  const [learningStyle, setLearningStyle] = useState(
    data?.learningStyle || LEARNING_STYLE.VISUAL
  );
  const [pacingOption, setPacingOption] = useState(
    data?.pacingOption || PACING_OPTIONS.SELF_PACED
  );
  const [contentDepthSpecification, setContentDepthSpecification] = useState(
    data?.contentDepthSpecification || CONTENT_DEPTH_SPECIFICATION.BEGINNER
  );
  const [assessmentFrequency, setAssessmentFrequency] = useState(
    data?.assessmentFrequency || ASSESSMENT_FREQUENCY_SETTINGS.OPTION_ONE
  );
  const [isInteractiveElementsInclusion, setIsInteractiveElementsInclusion] =
    useState(data?.isInteractiveElementsInclusion || false);
  const [activeCertificationOptions, setActiveCertificationOptions] = useState(
    data?.activeCertificationOptions || false
  );

  const tabs = useMemo(() => {
    return [
      {
        label: "CONFIGURE",
        panelComponent: Configure,
        panelComponentProps: {
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
        },
      },
    ];
  }, [
    activeCertificationOptions,
    assessmentFrequency,
    contentDepthSpecification,
    isInteractiveElementsInclusion,
    learningStyle,
    pacingOption,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          learningStyle,
          pacingOption,
          contentDepthSpecification,
          assessmentFrequency,
          isInteractiveElementsInclusion,
          activeCertificationOptions,
        };
      },
    }),
    [
      learningStyle,
      pacingOption,
      contentDepthSpecification,
      assessmentFrequency,
      isInteractiveElementsInclusion,
      activeCertificationOptions,
    ]
  );
  return (
    // <section
    //   className={classes["tiny-gpt-learning-container"]}
    //   data-testid="tiny-gpt-learning-container"
    // >
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-learning-style-container"
    //   >
    //     <InfoDisplay
    //       title="Learning Style Selectiont"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(LEARNING_STYLE)}
    //       placeholder="Select"
    //       value={learningStyle}
    //       onChange={(e, newValue) => {
    //         setLearningStyle(newValue);
    //       }}
    //       data-testid="tiny-gpt-learning-learning-style-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-pacing-option-container"
    //   >
    //     <InfoDisplay
    //       title="Pacing Options"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(PACING_OPTIONS)}
    //       placeholder="Select"
    //       value={pacingOption}
    //       onChange={(e, newValue) => {
    //         setPacingOption(newValue);
    //       }}
    //       data-testid="tiny-gpt-learning-pacing-option-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-content-depth-specification-container"
    //   >
    //     <InfoDisplay
    //       title="Content Depth Specification"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(CONTENT_DEPTH_SPECIFICATION)}
    //       placeholder="Select"
    //       value={contentDepthSpecification}
    //       onChange={(e, newValue) => {
    //         setContentDepthSpecification(newValue);
    //       }}
    //       data-testid="tiny-gpt-learning-content-depth-specification-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-assessment-frequency-settings-container"
    //   >
    //     <InfoDisplay
    //       title="Assessment Frequency Settings"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSAutocomplete
    //       sx={{
    //         width: "100%",
    //       }}
    //       searchable={false}
    //       options={Object.values(ASSESSMENT_FREQUENCY_SETTINGS)}
    //       placeholder="Select"
    //       value={assessmentFrequency}
    //       onChange={(e, newValue) => {
    //         setAssessmentFrequency(newValue);
    //       }}
    //       data-testid="tiny-gpt-learning-assessment-frequency-settings-autocomplete"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-interactive-elements-inclusion-container"
    //   >
    //     <InfoDisplay
    //       title="Interactive Elements Inclusion"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSCheckbox
    //       checked={isInteractiveElementsInclusion}
    //       onChange={(event) =>
    //         setIsInteractiveElementsInclusion(event.target.checked)
    //       }
    //       data-testid="tiny-gpt-learning-interactive-elements-inclusion-checkbox"
    //     />
    //   </div>
    //   <div
    //     className={classes["info-display-container"]}
    //     data-testid="tiny-gpt-learning-certification-options-container"
    //   >
    //     <InfoDisplay
    //       title="Certification Options"
    //       description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
    //     />
    //     <ODSCheckbox
    //       checked={activeCertificationOptions}
    //       onChange={(event) =>
    //         setActiveCertificationOptions(event.target.checked)
    //       }
    //       data-testid="tiny-gpt-learning-certification-options-checkbox"
    //     />
    //   </div>
    // </section>
    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: TINYGPT_LEARNING_NODE.dark,
        light: TINYGPT_LEARNING_NODE.light,
        foreground: TINYGPT_LEARNING_NODE.foreground,
      }}
      validTabIndices={[0]}
      onSave={onSave}
      showCommonActionFooter={true}
      validateTabs={true}
    />
  );
});
export default TinyGPTLearning;
