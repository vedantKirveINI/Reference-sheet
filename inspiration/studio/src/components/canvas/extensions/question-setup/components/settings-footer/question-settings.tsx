import { QuestionType } from "@oute/oute-ds.core.constants";
import { ODSAccordion, ODSLabel, ODSIcon } from "@src/module/ods";
import { GeneralSettings } from "./components/general-settings";
import { ValidationSettings } from "./components/validation-settings";
import { SettingsWorkspace } from "./v2/components/SettingsWorkspace";
import { getContainerStyles, accordionStyle, getSeparatorStyles,  } from "./styles";

const USE_SETTINGS_V2 = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_SETTINGS_V2 === "true");

const questionsWithoutValidationSettings = [
  QuestionType.CONNECTION,
  QuestionType.QUOTE,
  QuestionType.WELCOME,
  QuestionType.ENDING,
  QuestionType.KEY_VALUE_TABLE,
  QuestionType.TEXT_PREVIEW,
  QuestionType.LOADING,
  QuestionType.PDF_VIEWER,
  QuestionType.RATING,
];

export type QuestionSettingsProps = {
  hideImagePicker?: boolean;
  setShowImagePicker?: any;
  question: any;
  mode?: string;
  viewPort?: any;
  variables?: any;
  onChange?: any;
  isMultiQuestionType?: boolean;
  workspaceId: any;
  setQuestion: (question: Record<string, any>) => void;
  useV2Settings?: boolean;
};

export function QuestionSettings(props: QuestionSettingsProps) {
  const {
    viewPort,
    question,
    onChange,
    mode,
    variables,
    isMultiQuestionType = false,
    workspaceId,
    setQuestion,
    useV2Settings = USE_SETTINGS_V2,
  } = props;

  if (useV2Settings) {
    return (
      <SettingsWorkspace
        question={question}
        onChange={onChange}
        setQuestion={setQuestion}
        mode={mode}
        viewPort={viewPort}
        variables={variables}
        isMultiQuestionType={isMultiQuestionType}
        workspaceId={workspaceId}
      />
    );
  }

  const hasValidationSettings = questionsWithoutValidationSettings.includes(
    question?.type
  );

  const AccordionTitle = ({ text }: { text: string }) => (
    <ODSLabel
      variant="body1"
      style={{ fontWeight: "bold", letterSpacing: "1.25px" }}
    >
      {text}
    </ODSLabel>
  );

  const AccordionExpandIcon = (
    <ODSIcon
      outeIconName="OUTEChevronRightIcon"
      outeIconProps={{
        sx: {
          color: "#607D8B",
          width: "1.25em",
          height: "1.25em",
        },
      }}
    />
  );

  return (
    <div style={getContainerStyles()} key={question?._id}>
      <ODSAccordion
        defaultExpanded
        title={<AccordionTitle text="ESSENTIALS" />}
        content={
          <GeneralSettings
            question={question}
            onChange={onChange}
            viewPort={viewPort}
            mode={mode}
            variables={variables}
            isMultiQuestionType={isMultiQuestionType}
            workspaceId={workspaceId}
            setQuestion={setQuestion}
          />
        }
        style={accordionStyle.container}
        summaryProps={{
          sx: accordionStyle.summary,
          expandIcon: AccordionExpandIcon,
        }}
        data-testid="question-settings-general-accordion"
      />

      {!hasValidationSettings && <div style={getSeparatorStyles()}></div>}

      {!hasValidationSettings && (
        <ODSAccordion
          title={<AccordionTitle text="RULES & VALIDATION" />}
          content={
            <ValidationSettings
              question={question}
              onChange={onChange}
              setQuestion={setQuestion}
            />
          }
          style={accordionStyle.container}
          summaryProps={{
            sx: accordionStyle.summary,
            expandIcon: AccordionExpandIcon,
          }}
          data-testid="question-settings-advanced-accordion"
        />
      )}
    </div>
  );
}
