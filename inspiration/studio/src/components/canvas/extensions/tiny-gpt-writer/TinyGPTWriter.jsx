import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import RadioGroupSection from "../common-components/RadioGroupSection";
import TINYGPT_WRITER_NODE, {
  TONE_SELECTION,
  CONTENT_TYPE,
  OUTLINE_STRUCTURE,
  REVISION_CONTROL,
} from "./constant";
import InfoDisplay from "../common-components/InfoDisplay";
// import { ODSTextField } from '@src/module/ods';
import { ODSTextField } from "@src/module/ods";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import classes from "./TinyGPTWriter.module.css";

const textFieldStyles = {
  width: "100%",
  borderRadius: "0.75rem",
  border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
  background: "var(--white, #FFF)",
  boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
  "& .MuiInputBase-input": {
    padding: "0.3125rem",
    color: "#263238",
    fontSize: "1rem",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "1.5rem",
    letterSpacing: "0.03125rem",
  },
};

export const TinyGPTWriter = forwardRef(
  ({ data = {}, onSave = () => { } }, ref) => {
    const [toneSelection, setToneSelection] = useState(
      data?.toneSelection || TONE_SELECTION.FORMAL
    );

    const [contentType, setContentType] = useState(
      data?.contentType || CONTENT_TYPE.ARTICLE
    );

    const [lengthSpecification, setLengthSpecification] = useState(
      data?.lengthSpecification || ""
    );

    const [audienceDefinition, setAudienceDefinition] = useState(
      data?.audienceDefinition || ""
    );

    const [revisionControl, setRevisionControl] = useState(
      data?.revisionControl || REVISION_CONTROL.DRAFT
    );
    const [outlineStructure, setOutlineStructure] = useState(
      data?.outlineStructure || OUTLINE_STRUCTURE.GENERATE_OUTLINE
    );

    const [keywordFocus, setKeywordFocus] = useState(data?.keywordFocus || "");

    const [validTabIndices, setValidTabIndices] = useState([0]);

    const tabs = useMemo(
      () => [
        {
          label: "Configure",
          panelComponent: Configure,
          panelComponentProps: {
            toneSelection,
            setToneSelection,
            contentType,
            setContentType,
            lengthSpecification,
            setLengthSpecification,
            audienceDefinition,
            setAudienceDefinition,
            revisionControl,
            setRevisionControl,
            outlineStructure,
            setOutlineStructure,
            keywordFocus,
            setKeywordFocus,
            textFieldStyles,
          },
        },
      ],
      [
        audienceDefinition,
        contentType,
        keywordFocus,
        lengthSpecification,
        outlineStructure,
        revisionControl,
        toneSelection,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            toneSelection,
            contentType,
            outlineStructure,
            keywordFocus,
            revisionControl,
            lengthSpecification,
            audienceDefinition,
          };
        },
      }),
      [
        audienceDefinition,
        contentType,
        keywordFocus,
        lengthSpecification,
        outlineStructure,
        revisionControl,
        toneSelection,
      ]
    );

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TINYGPT_WRITER_NODE.dark,
          light: TINYGPT_WRITER_NODE.light,
          foreground: TINYGPT_WRITER_NODE.foreground,
        }}
        hasTestTab={TINYGPT_WRITER_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);
