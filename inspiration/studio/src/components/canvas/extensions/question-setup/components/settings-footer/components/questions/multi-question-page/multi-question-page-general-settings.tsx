import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
interface MultiQuestionPageSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const MultiQuestionPageSettings = ({
  question,
  onChange = () => {},
  mode,
  variables = {},
  disableQuestionAlignment,
}: MultiQuestionPageSettingsProps) => {
  const settings = question?.settings || {};
  const questions = question?.questions || {};
  const onAlignmentChange = (key: string, value: any) => {
    const updatedSettings = { ...settings, [key]: value };

    const updatedQuestions = Object.fromEntries(
      Object.entries(questions).map(([questionKey, questionValue]: any) => [
        questionKey,
        {
          ...(questionValue || {}),
          settings: { ...questionValue.settings, [key]: value },
        },
      ])
    );

    onChange({
      settings: updatedSettings,
      questions: updatedQuestions,
    });
  };

  return (
    <>
      <div style={styles.container}>
        <QuestionAlignment
          settings={settings}
          onChange={onAlignmentChange}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <CTAEditor />
      </div>
    </>
  );
};

export default MultiQuestionPageSettings;
