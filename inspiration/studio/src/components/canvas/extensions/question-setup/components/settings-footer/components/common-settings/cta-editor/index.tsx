
import { Editor } from "@src/module/editor";
import { styles } from "./styles";
import { useQuestionContext } from "@oute/oute-ds.core.contexts";
import { ODSLabel } from "@src/module/ods";
import {
  removeTagsFromString,
  SETTINGS_INPUT_NAMES,
  DEFAULT_QUESTION_CONFIG,
} from "@oute/oute-ds.core.constants";

interface CTAEditorViewProps {
  style?: Record<string, unknown>;
  question: any;
  onQuestionChange: (partial: Record<string, unknown>) => void;
  settingsInputToFocus?: string | null;
  hideLabel?: boolean;
}

const CTAEditorView = ({
  style = {},
  question,
  onQuestionChange,
  settingsInputToFocus = null,
  hideLabel = false,
}: CTAEditorViewProps) => (
  <div
    style={styles.getInputWrapperContainerStyle({})}
    data-testid="cta-editor-root"
  >
    {!hideLabel && <ODSLabel variant="body1">Button Label</ODSLabel>}
    <div
      style={styles.container(style)}
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

const CTAEditorFromContext = ({
  style = {},
  hideLabel = false,
}: {
  style?: Record<string, unknown>;
  hideLabel?: boolean;
}) => {
  const { question, onQuestionChange, settingsInputToFocus } =
    useQuestionContext();
  return (
    <CTAEditorView
      style={style}
      question={question}
      onQuestionChange={onQuestionChange}
      settingsInputToFocus={settingsInputToFocus}
      hideLabel={hideLabel}
    />
  );
};

interface CTAEditorProps {
  style?: Record<string, unknown>;
  question?: any;
  onQuestionChange?: (partial: Record<string, unknown>) => void;
  settingsInputToFocus?: string | null;
  hideLabel?: boolean;
}

const CTAEditor = ({
  style = {},
  question: questionProp,
  onQuestionChange: onQuestionChangeProp,
  settingsInputToFocus: settingsInputToFocusProp,
  hideLabel = false,
}: CTAEditorProps) => {
  if (questionProp != null && onQuestionChangeProp != null) {
    return (
      <CTAEditorView
        style={style}
        question={questionProp}
        onQuestionChange={onQuestionChangeProp}
        settingsInputToFocus={settingsInputToFocusProp ?? null}
        hideLabel={hideLabel}
      />
    );
  }
  return <CTAEditorFromContext style={style} hideLabel={hideLabel} />;
};

export default CTAEditor;
export { CTAEditorView };
