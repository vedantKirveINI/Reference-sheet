import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import classes from "./TinyGPTResearcher.module.css";
// import { ODSTextField } from '@src/module/ods';
import { ODSTextField } from "@src/module/ods";
import TINYGPT_RESEARCHER_NODE, {
  DEPTH_OF_SEARCH,
  FACT_CHECK_LEVEL,
  OUTPUT_FORMAT,
  SOURCE_PREFERENCE,
  UPDATE_FREQUENCY,
} from "./constant";
import InfoDisplay from "../common-components/InfoDisplay";
import RadioGroupSection from "../common-components/RadioGroupSection";
import CheckboxGroupSection from "../common-components/CheckboxGroupSection";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";

const TinyGPTResearcher = forwardRef(
  ({ data = {}, onSave = () => {} }, ref) => {
    const [topicSpecification, setTopicSpecification] = useState(
      data?.topicSpecification || ""
    );
    const [depthOfResearch, setDepthOfResearch] = useState(
      data?.depthOfResearch || DEPTH_OF_SEARCH.SURFACE_LEVEL
    );
    const [outputFormat, setOutputFormat] = useState(
      data?.outputFormat || OUTPUT_FORMAT.SUMMARY
    );
    const [updateFrequency, setUpdateFrequency] = useState(
      data?.updateFrequency || UPDATE_FREQUENCY.REALTIME
    );
    const [factCheckLevel, setFactCheckLevel] = useState(
      data?.factCheckLevel || FACT_CHECK_LEVEL.LOW
    );

    const [validTabIndices, setValidTabIndices] = useState([0]);

    const sourcePreference = data?.sourcePreference;

    const sourcePreferenceRef = useRef(null);

    const tabs = [
      {
        label: "Configure",
        panelComponent: Configure,
        panelComponentProps: {
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
        },
      },
    ];

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            topicSpecification,
            depthOfResearch,
            sourcePreference: {
              preferences: sourcePreferenceRef?.current?.selectedOptions,
              otherContent: sourcePreferenceRef?.current?.otherContent,
            },
            outputFormat,
            updateFrequency,
            factCheckLevel,
          };
        },
      }),
      [
        depthOfResearch,
        factCheckLevel,
        outputFormat,
        topicSpecification,
        updateFrequency,
      ]
    );

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_RESEARCHER_NODE.dark,
          light: TINYGPT_RESEARCHER_NODE.light,
          foreground: TINYGPT_RESEARCHER_NODE.foreground,
        }}
        hasTestTab={TINYGPT_RESEARCHER_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default TinyGPTResearcher;
