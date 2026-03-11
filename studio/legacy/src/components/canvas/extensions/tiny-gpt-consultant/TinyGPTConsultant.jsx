import { forwardRef, useState, useImperativeHandle, useMemo } from "react";
import TINYGPT_CONSULTANT_NODE, {
  CONSULTATION_AREA_SPECIFICATION,
  RECOMMENDATION_DETAIL_LEVEL,
  REPORT_FORMAT_SELECTION,
} from "./constant";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";

const TinyGPTConsultant = forwardRef(
  ({ data = {}, onSave = () => {} }, ref) => {
    const [consultationAreaSpecification, setConsultationAreaSpecification] =
      useState(
        data?.consultationAreaSpecification ||
          CONSULTATION_AREA_SPECIFICATION.BUSINESS_STARTERGY
      );
    const [inputDataDefinition, setInputDataDefinition] = useState(
      data?.inputDataDefinition || ""
    );

    const [recommendationDetailLevel, setRecommendationDetailLevel] = useState(
      data?.recommendationDetailLevel || RECOMMENDATION_DETAIL_LEVEL.BRIEF
    );
    const [riskAssessmentOptions, setRiskAssessmentOptions] = useState(
      data?.riskAssessmentOptions || false
    );
    const [scenarioExplorationFeatures, setScenarioExplorationFeatures] =
      useState(data?.scenarioExplorationFeatures || false);
    const [reportFormatSelection, setReportFormatSelection] = useState(
      data?.reportFormatSelection || REPORT_FORMAT_SELECTION.SLIDE_DECK
    );

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
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
          },
        },
      ];
    }, [
      consultationAreaSpecification,
      inputDataDefinition,
      recommendationDetailLevel,
      reportFormatSelection,
      riskAssessmentOptions,
      scenarioExplorationFeatures,
    ]);
    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            consultationAreaSpecification,
            recommendationDetailLevel,
            riskAssessmentOptions,
            scenarioExplorationFeatures,
            reportFormatSelection,
            inputDataDefinition,
          };
        },
      }),
      [
        consultationAreaSpecification,
        recommendationDetailLevel,
        riskAssessmentOptions,
        scenarioExplorationFeatures,
        reportFormatSelection,
        inputDataDefinition,
      ]
    );
    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_CONSULTANT_NODE.dark,
          light: TINYGPT_CONSULTANT_NODE.light,
          foreground: TINYGPT_CONSULTANT_NODE.foreground,
        }}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);
export default TinyGPTConsultant;
