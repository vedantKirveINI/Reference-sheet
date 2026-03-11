/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { FieldConfig, FieldType } from "../config";
import { RequiredToggle } from "./RequiredToggle";
import { CharacterLimitInput } from "./CharacterLimitInput";
import { RegexInput } from "./RegexInput";
import { AccessKeyInput } from "./AccessKeyInput";
import { TooltipTextField } from "./TooltipTextField";
import { MaskResponseToggle } from "./MaskResponseToggle";
import { SwitchField } from "./SwitchField";
import { ButtonLabelInput } from "./ButtonLabelInput";
import { TextCasesDropdown } from "./TextCasesDropdown";
import { QuestionAlignmentDropdown } from "./QuestionAlignmentDropdown";

interface FieldRendererProps {
  fields: FieldConfig[];
  question: any;
  settings: any;
  onChange: (changes: any) => void;
  updateSettings: (key: string, value: any) => void;
  setQuestion: (question: Record<string, any>) => void;
  mode?: string;
  viewPort?: any;
  variables?: any;
  isMultiQuestionType?: boolean;
  workspaceId?: any;
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  row: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  `,
  fullWidth: css`
    grid-column: 1 / -1;
  `,
  fieldWrapper: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  helpText: css`
    font-size: 11px;
    color: #757575;
    margin-top: 2px;
  `,
  placeholder: css`
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    color: #757575;
    font-size: 13px;
    text-align: center;
  `,
};

export const FieldRenderer = ({
  fields,
  question,
  settings,
  onChange,
  updateSettings,
  setQuestion,
  mode,
  viewPort,
  variables,
  isMultiQuestionType,
  workspaceId,
}: FieldRendererProps) => {
  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case FieldType.REQUIRED_TOGGLE:
        return (
          <RequiredToggle
            key={field.type}
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.BUTTON_LABEL:
        return (
          <ButtonLabelInput
            key={field.type}
            value={question?.buttonLabel || ""}
            onChange={(value) => onChange({ buttonLabel: value })}
            placeholder={field.placeholder}
            helpText={field.helpText}
          />
        );

      case FieldType.CHARACTER_LIMIT:
        return (
          <CharacterLimitInput
            key={field.type}
            minChar={settings?.minChar || ""}
            maxChar={settings?.maxChar || ""}
            onChange={onChange}
            settings={settings}
            error={settings?.errors?.charLimitError}
            helpText={field.helpText}
          />
        );

      case FieldType.REGEX:
        return (
          <RegexInput
            key={field.type}
            regex={settings?.regex || ""}
            regexError={settings?.regexErrorMessage || ""}
            onChange={updateSettings}
            helpText={field.helpText}
          />
        );

      case FieldType.ACCESS_KEY:
        return (
          <AccessKeyInput
            key={field.type}
            value={settings?.accessKey || ""}
            onChange={(value) => updateSettings("accessKey", value)}
            helpText={field.helpText}
            placeholder={field.placeholder}
          />
        );

      case FieldType.TOOLTIP_TEXT:
        return (
          <TooltipTextField
            key={field.type}
            value={settings?.toolTipText || ""}
            onChange={(value) => updateSettings("toolTipText", value)}
            placeholder={field.placeholder}
            helpText={field.helpText}
          />
        );

      case FieldType.MASK_RESPONSE:
        return (
          <MaskResponseToggle
            key={field.type}
            checked={settings?.maskResponse || false}
            onChange={(checked) => updateSettings("maskResponse", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.TEXT_CASES:
        return (
          <TextCasesDropdown
            key={field.type}
            value={settings?.textTransformation?.case}
            onChange={(value) => 
              updateSettings("textTransformation", { 
                ...settings?.textTransformation, 
                case: value 
              })
            }
            helpText={field.helpText}
          />
        );

      case FieldType.QUESTION_ALIGNMENT:
        return (
          <QuestionAlignmentDropdown
            key={field.type}
            value={settings?.questionAlignment}
            onChange={(value) => updateSettings("questionAlignment", value)}
            helpText={field.helpText}
          />
        );

      case FieldType.RANDOMIZE:
        return (
          <SwitchField
            key={field.type}
            title="Randomize"
            checked={settings?.randomize || false}
            onChange={(checked) => updateSettings("randomize", checked)}
            helpText={field.helpText}
            disabled={settings?.isAlphabeticallyArranged}
            disabledTooltip="Turn off Arrange Alphabetically to enable"
          />
        );

      case FieldType.ALPHABETIZE:
        return (
          <SwitchField
            key={field.type}
            title="Arrange Alphabetically"
            checked={settings?.isAlphabeticallyArranged || false}
            onChange={(checked) => updateSettings("isAlphabeticallyArranged", checked)}
            helpText={field.helpText}
            disabled={settings?.randomize}
            disabledTooltip="Turn off Randomize to enable"
          />
        );

      case FieldType.VERTICAL_ALIGNMENT:
        return (
          <SwitchField
            key={field.type}
            title="Arrange Options Vertically"
            checked={settings?.isAlignmentVertical || false}
            onChange={(checked) => updateSettings("isAlignmentVertical", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.INCLUDE_OTHER:
        return (
          <SwitchField
            key={field.type}
            title="Include Other"
            checked={settings?.other || false}
            onChange={(checked) => updateSettings("other", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.ALLOW_OTHER_INPUT:
        return (
          <SwitchField
            key={field.type}
            title="Allow Other Input"
            checked={settings?.allowOtherInput || false}
            onChange={(checked) => updateSettings("allowOtherInput", checked)}
            helpText={field.helpText}
            disabled={!settings?.other}
          />
        );

      case FieldType.SOCIAL_SHARE:
        return (
          <SwitchField
            key={field.type}
            title="Social Share Icons"
            checked={settings?.socialShareIcons || false}
            onChange={(checked) => updateSettings("socialShareIcons", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.SUBMIT_ANOTHER:
        return (
          <SwitchField
            key={field.type}
            title="Submit Another Response"
            checked={settings?.submitAnotherResponse || false}
            onChange={(checked) => updateSettings("submitAnotherResponse", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.USE_DATE_PICKER:
        return (
          <SwitchField
            key={field.type}
            title="Use Date Picker"
            checked={settings?.useDatePicker || false}
            onChange={(checked) => updateSettings("useDatePicker", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.INCLUDE_TIME:
        return (
          <SwitchField
            key={field.type}
            title="Include Time"
            checked={settings?.includeTime || false}
            onChange={(checked) => updateSettings("includeTime", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.SEND_RECEIPT:
        return (
          <SwitchField
            key={field.type}
            title="Send Receipt"
            checked={settings?.sendReceipt || false}
            onChange={(checked) => updateSettings("sendReceipt", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.ENABLE_MAP:
        return (
          <SwitchField
            key={field.type}
            title="Enable Map"
            checked={settings?.enableMap || false}
            onChange={(checked) => updateSettings("enableMap", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.IS_ADVANCED_FIELD:
        return (
          <SwitchField
            key={field.type}
            title="Show only in Advanced Settings"
            checked={settings?.isAdvancedField || false}
            onChange={(checked) => updateSettings("isAdvancedField", checked)}
            helpText={field.helpText}
          />
        );

      case FieldType.DEFAULT_VALUE:
      case FieldType.DEFAULT_VALUE_FX:
      case FieldType.SELECTION_TYPE:
      case FieldType.DATE_FORMAT:
      case FieldType.DATE_SEPARATOR:
      case FieldType.DEFAULT_DATE:
      case FieldType.DEFAULT_TIME:
      case FieldType.FILE_TYPES:
      case FieldType.FILE_COUNT:
      case FieldType.MIN_VALUE:
      case FieldType.MAX_VALUE:
      case FieldType.DEFAULT_RATING:
      case FieldType.MAX_RATING:
      case FieldType.RATING_EMOJI:
      case FieldType.CURRENCY:
      case FieldType.AMOUNT:
      case FieldType.STRIPE_CONNECTION:
      case FieldType.REDIRECT_URL:
      case FieldType.PROMOTIONAL_TEXT:
      case FieldType.ADDRESS_FIELDS:
        return (
          <div key={field.type} css={styles.placeholder}>
            {field.label || field.type} - Component to be implemented
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div css={styles.container} data-testid="field-renderer">
      {fields.map(renderField)}
    </div>
  );
};

export default FieldRenderer;
