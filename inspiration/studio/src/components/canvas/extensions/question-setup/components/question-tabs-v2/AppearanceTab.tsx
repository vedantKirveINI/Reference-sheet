import { Mode, QuestionAlignments, QuestionType } from "@src/module/constants";
import SettingSection from "./components/SettingSection";
import { styles } from "./styles";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import ImageSection from "./ImageSection";
import QuestionPreviewCard from "./QuestionPreviewCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppearanceTabProps {
  question: any;
  onChange: (val: any) => void;
  onImageChange: (val: any) => void;
  mode?: any;
  viewPort?: any;
  workspaceId?: string;
  theme?: any;
  openReplaceSection?: boolean;
}

const AppearanceTab = ({
  question,
  onChange,
  onImageChange,
  mode,
  workspaceId,
  theme,
  openReplaceSection,
}: AppearanceTabProps) => {
  const settings = question?.settings || {};
  const augmentor = question?.augmentor || {};

  const updateSettings = (key: string, value: any) => {
    onChange({ settings: { ...settings, [key]: value } });
  };

  const currentAlignment = settings?.questionAlignment || QuestionAlignments.LEFT;
  const isCardMode = mode === Mode.CARD;
  const isClassicMode = mode === Mode.CLASSIC;
  const isAlignmentSupported = isCardMode || isClassicMode;

  const handleAlignmentChange = (alignment: string) => {
    if (!isAlignmentSupported) return;
    updateSettings("questionAlignment", alignment);
  };

  const alignmentOptions = [
    { value: QuestionAlignments.LEFT, label: "Left", icon: AlignLeft },
    { value: QuestionAlignments.CENTER, label: "Center", icon: AlignCenter },
    { value: (QuestionAlignments as any).RIGHT || "flex-end", label: "Right", icon: AlignRight },
  ];

  return (
    <div style={{ ...styles.container, display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      <div style={{ flexShrink: 0, marginBottom: "0.75rem" }}>
        <QuestionPreviewCard />
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <SettingSection title="Question Alignment">
            <div style={{ ...styles.alignmentButtons, opacity: isAlignmentSupported ? 1 : 0.5 }}>
              {alignmentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentAlignment === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.alignmentButton(isSelected),
                      cursor: isAlignmentSupported ? "pointer" : "not-allowed",
                      flex: 1,
                    }}
                    onClick={() => handleAlignmentChange(option.value)}
                    data-testid={`v2-appearance-align-${option.label.toLowerCase()}`}
                    aria-disabled={!isAlignmentSupported}
                  >
                    <Icon size={18} />
                    <span style={{ marginLeft: "0.375rem", fontSize: "0.875rem" }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
            {!isAlignmentSupported && (
              <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: "0.25rem 0 0 0" }}>
                Only available in Classic and Card modes
              </p>
            )}
          </SettingSection>

          <ImageSection
            augmentor={augmentor}
            onChange={onImageChange}
            mode={mode}
            workspaceId={workspaceId}
            isLoadingQuestionType={question?.type === QuestionType.LOADING}
            openReplaceSection={openReplaceSection}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default AppearanceTab;
