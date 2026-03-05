import React from "react";

import RadioGroupSection from "../../../common-components/RadioGroupSection";
import InfoDisplay from "../../../common-components/InfoDisplay";
import { CONTENT_TYPE, OUTLINE_STRUCTURE, REVISION_CONTROL, TONE_SELECTION,  } from "../../constant";
// import { ODSTextField } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";

import classes from "../../TinyGPTWriter.module.css";
const Configure = ({
  toneSelection,
  setToneSelection,
  contentType,
  setContentType,
  lengthSpecification,
  setLengthSpecification,
  audienceDefinition,
  setAudienceDefinition,
  outlineStructure,
  setOutlineStructure,
  revisionControl,
  setRevisionControl,
  keywordFocus,
  setKeywordFocus,
  textFieldStyles,
}) => {
  return (
    <section
      className={classes["tiny-gpt-writer-container"]}
      data-testid="tiny-gpt-writer-container"
    >
      <RadioGroupSection
        key={"tone-selection"}
        title="Tone Selection"
        description="Choose the tone of the research."
        options={TONE_SELECTION}
        value={toneSelection}
        onValueChange={(value) => setToneSelection(value)}
        dataTestId="tiny-gpt-writer-tone-selection"
      />
      <RadioGroupSection
        key="content-type"
        title="Content Type"
        description="Choose the content type."
        options={CONTENT_TYPE}
        value={contentType}
        onValueChange={(value) => setContentType(value)}
        dataTestId="tiny-gpt-writer-content-type"
      />
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-writer-length-specification-container"
      >
        <InfoDisplay
          title="Length Specification"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={lengthSpecification}
          onChange={(e) => setLengthSpecification(e.target.value)}
          placeholder="Type your length specification"
          multiline
          rows={4}
          maxRows={4}
          style={{
            ...textFieldStyles,
          }}
          data-testid="tiny-gpt-writer-length-specification-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-writer-audience-definition-container"
      >
        <InfoDisplay
          title="Audience Definition"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={audienceDefinition}
          onChange={(e) => setAudienceDefinition(e.target.value)}
          placeholder="Type your audience definition"
          multiline
          rows={4}
          maxRows={4}
          style={{
            ...textFieldStyles,
          }}
          data-testid="tiny-gpt-writer-audience-definition-field"
        />
      </div>
      <div
        className={classes["info-display-container"]}
        data-testid="tiny-gpt-writer-keyword-focus-container"
      >
        <InfoDisplay
          title="Keyword Focus"
          description="Lorem ipsum dolor sit amet consectetur. Elit tortor tortor aliquet sit. "
        />
        <ODSTextField
          value={keywordFocus}
          onChange={(e) => setKeywordFocus(e.target.value)}
          placeholder="Type your keyword focus"
          multiline
          rows={4}
          maxRows={4}
          style={{
            ...textFieldStyles,
          }}
          data-testid="tiny-gpt-writer-keyword-focus-field"
        />
        <RadioGroupSection
          key="outline-structure"
          title="Outline Structure"
          description="Choose the outline structure."
          options={OUTLINE_STRUCTURE}
          value={outlineStructure}
          onValueChange={(value) => setOutlineStructure(value)}
          dataTestId="tiny-gpt-writer-outline-structure"
        />
        <RadioGroupSection
          key="revision-control"
          title="Revision Control"
          description="Choose the revision control."
          options={REVISION_CONTROL}
          value={revisionControl}
          onValueChange={(value) => setRevisionControl(value)}
          dataTestId="tiny-gpt-writer-revision-control"
        />
      </div>
    </section>
  );
};

export default Configure;
