/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import type React from "react";
import { useEffect } from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { isEmpty } from "lodash";
import DefaultValueFx from "../../common-settings/defaultValueFx";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { SettingsTextField } from "../../common-settings/settings-textfield";

interface IAutocompleteSettingsProps {
  question: any;
  viewPort: string;
  mode: string;
  onChange: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const AutocompleteGeneralSettings = ({
  question,
  mode,
  onChange,
  variables = {},
  disableQuestionAlignment,
}: IAutocompleteSettingsProps) => {
  const settings = question?.settings;

  const curlCommand = settings?.curlCommand;
  const label = settings?.label;
  const id = settings?.id;

  useEffect(() => {
    onChange({
      settings: {
        ...settings,
        errors: {
          ...question?.errors,
          curlCommandError: isEmpty(curlCommand)
            ? ERROR_MESSAGE.AUTOCOMPLETE.curlCommandError
            : "",
          labelError: !label ? ERROR_MESSAGE.AUTOCOMPLETE.labelError : "",
          idError: !id ? ERROR_MESSAGE.AUTOCOMPLETE.idError : "",
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
            ? ERROR_MESSAGE.AUTOCOMPLETE.curlCommandError
            : "",
          labelError: !label ? ERROR_MESSAGE.AUTOCOMPLETE.labelError : "",
          idError: !id ? ERROR_MESSAGE.AUTOCOMPLETE.idError : "",
        },
      },
    });
  };

  return (
    <div css={styles.container} data-testid="autocomplete-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <CTAEditor />
        <div
          css={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-curl-command"
        >
          <ODSLabel variant="body1" required>
            cURL Command
          </ODSLabel>
          <DefaultValueFx
            label={""}
            settings={settings}
            variables={variables}
            onChange={(key, value) => {
              updateSettings("curlCommand", value);
            }}
            placeholder="Enter cURL Command"
            dataTestid="settings-autocomplete-curl-command-container"
          />
          {settings?.errors?.curlCommandError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-autocomplete-curl-command-error"
              style={{
                position: "absolute",
                bottom: "-2em",
              }}
            >
              {settings.errors.curlCommandError}
            </ODSLabel>
          )}
        </div>

        <div
          css={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-optionsPath"
        >
          <SettingsTextField
            label="Options Path"
            className="black"
            value={settings?.optionsPath || ""}
            placeholder="eg. response.data"
            onChange={(value) => {
              updateSettings("optionsPath", value);
            }}
            dataTestId="settings-autocomplete-optionsPath"
          />
        </div>
      </div>
      <div css={styles.wrapperContainer}>
        <SwitchOption
          key="map-objects-items"
          variant="black"
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
          css={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-id-accessor"
        >
          <ODSLabel variant="body1" required>
            Add ID Accessor
          </ODSLabel>
          <SettingsTextField
            placeholder="ID Accessor"
            className="black"
            value={settings?.id || ""}
            onChange={(value) => {
              updateSettings("id", value);
            }}
            dataTestId="settings-autocomplete-id-accessor"
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
          css={styles.getInputWrapperContainerStyle()}
          data-testid="settings-autocomplete-label-accessor"
        >
          <ODSLabel variant="body1" required>
            Add Lable Accessor
          </ODSLabel>
          <SettingsTextField
            placeholder="Label Accessor"
            className="black"
            value={settings?.label || ""}
            onChange={(value) => {
              updateSettings("label", value);
            }}
            dataTestId="settings-autocomplete-label-accessor"
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

export default AutocompleteGeneralSettings;
