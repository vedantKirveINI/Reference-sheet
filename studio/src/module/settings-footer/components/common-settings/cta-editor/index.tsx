
import { Editor } from "@src/module/editor";
import { styles } from "./styles";
import { useQuestionContext } from "@oute/oute-ds.core.contexts";
import { ODSLabel } from "@src/module/ods";
import { removeTagsFromString, SETTINGS_INPUT_NAMES, DEFAULT_QUESTION_CONFIG,  } from "@oute/oute-ds.core.constants";
const CTAEditor = ({ style = {}, disabled = false }: any) => {
  const { question, onQuestionChange, settingsInputToFocus } =
    useQuestionContext();
  return (
    <div
      style={styles.getInputWrapperContainerStyle({})}
      data-testid="cta-editor-root"
    >
      <ODSLabel variant="body1">Button Label</ODSLabel>
      <div 
        style={styles.container({ style, disabled })}
        className="focus-within:outline focus-within:outline-2 focus-within:outline-[#212121] focus-within:border-transparent hover:[&:not(:focus-within)]:border-[#212121]"
      >
        <Editor
          editable={true}
          value={question?.buttonLabel}
          selectAllOnFocus
          placeholder={DEFAULT_QUESTION_CONFIG[question?.type]?.buttonLabel}
          enableSingleLineEditing={true}
          onChange={(_newlabel) => {
            onQuestionChange({ buttonLabel: _newlabel });
          }}
          autoFocus={settingsInputToFocus === SETTINGS_INPUT_NAMES.CTA_EDITOR}
          style={{ width: "100%", minWidth: "10px", cursor: "text" }}
          maxLength={25}
          testId={`cta-text-inline-editor`}
        />
        <span data-testid="cta-text-inline-editor-counter">
          {removeTagsFromString(question?.buttonLabel)?.length}
          /25
        </span>
      </div>
    </div>
  );
};

export default CTAEditor;
