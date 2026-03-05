import { QuestionType } from "@oute/oute-ds.core.constants";
import { getSettingsConfig, SettingsCardType, CardConfig } from "../config";
import { SettingsCard } from "./SettingsCard";
import { FieldRenderer } from "../fields/FieldRenderer";

interface SettingsWorkspaceProps {
  question: any;
  onChange: (changes: any) => void;
  setQuestion: (question: Record<string, any>) => void;
  mode?: string;
  viewPort?: any;
  variables?: any;
  isMultiQuestionType?: boolean;
  workspaceId?: any;
}

export const SettingsWorkspace = ({
  question,
  onChange,
  setQuestion,
  mode,
  viewPort,
  variables,
  isMultiQuestionType,
  workspaceId,
}: SettingsWorkspaceProps) => {
  const questionType = question?.type as QuestionType;
  const config = getSettingsConfig(questionType);
  const settings = question?.settings || {};

  if (!config) {
    return (
      <div className="p-6 text-center text-[#757575] text-sm" data-testid="settings-workspace-empty">
        No settings available for this question type.
      </div>
    );
  }

  const updateSettings = (key: string, value: any) => {
    onChange({ settings: { ...settings, [key]: value } });
  };

  const renderCard = (cardConfig: CardConfig) => {
    const visibleFields = cardConfig.fields.filter((field) => {
      if (field.condition) {
        return field.condition(settings, question);
      }
      return true;
    });

    if (visibleFields.length === 0 && !cardConfig.disabled) {
      return null;
    }

    const summaryBadge = cardConfig.getSummary
      ? cardConfig.getSummary(settings, question)
      : undefined;

    return (
      <SettingsCard
        key={cardConfig.type}
        type={cardConfig.type}
        title={cardConfig.title}
        defaultExpanded={cardConfig.defaultExpanded}
        summaryBadge={summaryBadge}
        disabled={cardConfig.disabled}
        disabledMessage={cardConfig.disabledMessage}
        testId={`settings-card-${cardConfig.type}`}
      >
        <FieldRenderer
          fields={visibleFields}
          question={question}
          settings={settings}
          onChange={onChange}
          updateSettings={updateSettings}
          setQuestion={setQuestion}
          mode={mode}
          viewPort={viewPort}
          variables={variables}
          isMultiQuestionType={isMultiQuestionType}
          workspaceId={workspaceId}
        />
      </SettingsCard>
    );
  };

  return (
    <div className="flex flex-col gap-1 py-2" data-testid="settings-workspace">
      {config.cards.map(renderCard)}
    </div>
  );
};

export default SettingsWorkspace;
