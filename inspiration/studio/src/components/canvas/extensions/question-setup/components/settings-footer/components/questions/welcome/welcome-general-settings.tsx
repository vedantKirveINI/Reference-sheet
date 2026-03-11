import QuestionAlignment from "../../common-settings/alignment";
import CTAEditor from "../../common-settings/cta-editor";
import { styles } from "./styles";
interface WelcomeSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const WelcomeSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: WelcomeSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.wrapperContainer}>
      <QuestionAlignment
        settings={settings}
        onChange={updateSettings}
        mode={mode}
        disabled={disableQuestionAlignment}
      />
      <CTAEditor />
    </div>
  );
};

export default WelcomeSettings;
