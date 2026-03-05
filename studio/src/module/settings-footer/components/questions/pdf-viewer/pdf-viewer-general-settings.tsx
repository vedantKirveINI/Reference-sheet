import React from "react";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";

interface PdfViewerSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const PdfViewerSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: PdfViewerSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="pdf-viewer-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <CTAEditor />
        <SwitchOption
          key="show-toolbar-required"
          variant="black"
          title="Show Toolbar"
          styles={{ width: "100%" }}
          checked={settings?.showToolbar}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("showToolbar", event.target.checked);
          }}
          dataTestId="show-toolbar"
        />
      </div>
    </div>
  );
};

export default PdfViewerSettings;
