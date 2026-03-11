import React, { useEffect } from "react";
import { ODSLabel } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { isEmpty } from "lodash";
import CTAEditor from "../../common-settings/cta-editor";

interface IQuestionsGridSettingsProps {
  question: any;
  viewPort: string;
  mode: string;
  onChange: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const QuestionsGridGeneralSettings = ({
  question,
  viewPort,
  mode,
  onChange,
  variables = {},
  disableQuestionAlignment,
}: IQuestionsGridSettingsProps) => {
  const settings = question?.settings;

  let curlCommand = settings?.curlCommand;
  let label = settings?.label;
  let id = settings?.id;

  useEffect(() => {
    onChange({
      settings: {
        ...settings,
        errors: {
          ...question?.errors,
          curlCommandError: isEmpty(curlCommand)
            ? "Please provide API cUrl"
            : "",
          labelError: !label ? "Please provide Label Accessor" : "",
          idError: !id ? "Please provide ID Accessor" : "",
        },
      },
    });
  }, [curlCommand, label, id]);

  const updateSettings = (key: string, value: any) => {
    onChange?.({
      settings: {
        ...settings,
        [key]: value,
        errors: {
          ...question?.errors,
          curlCommandError: isEmpty(curlCommand)
            ? "Please provide API cUrl"
            : "",
          labelError: !label ? "Please provide Label Accessor" : "",
          idError: !id ? "Please provide ID Accessor" : "",
        },
      },
    });
  };

  return (
    <div style={styles.container} data-testid="autocomplete-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <CTAEditor />
        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-curl-command"
        >
          {/* <DefaultValueFx
              label={`cURL Command*`}
              settings={
                settings?.curlCommand
                  ? { defaultValue: { blocks: settings?.curlCommand?.blocks } }
                  : {}
              }
              variables={variables}
              onChange={(key, value) => {
                updateSettings("curlCommand", value);
              }}
              placeholder="Enter cURL Command"
              dataTestid="settings-autocomplete-curl-command-container"
            /> */}
          <ODSLabel variant="body1">Use Case</ODSLabel>
          <ODSTextField
            value={settings?.useCase || ""}
            placeholder="Only Sheet or Menu"
            onChange={(e) => {
              updateSettings("useCase", e.target.value);
            }}
            
            inputProps={{
              sx: styles.getInputStyle(),
              "data-testid": "settings-autocomplete-optionsPath",
            }}
          />
          {settings?.errors?.curlCommandError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-autocomplete-curl-command-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.curlCommandError}
            </ODSLabel>
          )}
        </div>

        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-optionsPath"
        >
          <ODSLabel variant="body1">Options Path (Only 1 level)</ODSLabel>
          <ODSTextField
            value={settings?.optionsPath || ""}
            placeholder="eg. results"
            onChange={(e) => {
              updateSettings("optionsPath", e.target.value);
            }}
            
            inputProps={{
              sx: styles.getInputStyle(),
              "data-testid": "settings-autocomplete-optionsPath",
            }}
          />
        </div>
      </div>
      <div style={styles.wrapperContainer}>
        <SwitchOption
          key="map-objects-items"
          title="Map All Object Items"
          styles={{
            width: "100%",
          }}
          checked={settings?.mapAllObjectsItems}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("mapAllObjectsItems", event.target.checked);
          }}
        />
        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-id-accessor"
        >
          <ODSLabel variant="body1">Add ID Accessor*</ODSLabel>
          <ODSTextField
            value={settings?.id || ""}
            placeholder="ID Accessor"
            onChange={(e) => {
              updateSettings("id", e.target.value);
            }}
            
            inputProps={{
              sx: styles.getInputStyle(),
              "data-testid": "settings-autocomplete-id-accessor",
            }}
            required
          />
          {settings?.errors?.idError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-autocomplete-id-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.idError}
            </ODSLabel>
          )}
        </div>

        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-label-accessor"
        >
          <ODSLabel variant="body1">Add Label Accessor*</ODSLabel>
          <ODSTextField
            value={settings?.label || ""}
            placeholder="Label Accessor"
            onChange={(e) => {
              updateSettings("label", e.target.value);
            }}
            
            inputProps={{
              sx: styles.getInputStyle(),
              "data-testid": "settings-autocomplete-label-accessor",
            }}
            required
          />
          {settings?.errors?.labelError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-autocomplete-label-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.labelError}
            </ODSLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsGridGeneralSettings;
