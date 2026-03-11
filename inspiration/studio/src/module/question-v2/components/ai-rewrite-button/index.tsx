import Lottie from "lottie-react";
import { ODSTooltip as Tooltip } from '@src/module/ods';
import AiIconLottieData from "../../assets/lottie/ai-generate-icon.lottie.json";
import { toolTipStyles } from "./styles";
import { usePreviousAiQuestions } from "./use-previous-ai-questions";

interface AiRewriteButtonProps {
  questionTitle?: string;
  questionDescription?: string;
  onRewrite: (newTitle: string) => void;
  onLoadToggle: (status: boolean) => void;
  isLoading: boolean;
  type: "title" | "description";
}
export function AiRewriteButton({
  questionTitle,
  questionDescription,
  onRewrite,
  isLoading,
  onLoadToggle,
  type,
}: AiRewriteButtonProps) {
  const { onAiGeneration } = usePreviousAiQuestions({
    questionTitle,
    questionDescription,
    isLoading,
    onLoadToggle,
    onRewrite,
    type,
  });

  return (
    <Tooltip
      title="Rewrite with AI"
      placement="right"
      arrow={false}
      style={{ alignSelf: "center" }}
      slotProps={{
        popper: {
          modifiers: [{ name: "offset", options: { offset: [-20, 25] } }],
        },
        tooltip: { className: "custom-tooltip", sx: toolTipStyles },
      }}
    >
      <div
        onClick={onAiGeneration}
        className="flex items-center justify-center"
        style={{
          cursor: "pointer",
          height: type === "title" ? "2.5em" : "1.75em",
          width: type === "title" ? "2.5em" : "1.75em",
        }}
        data-testid={`ai-rewrite-button-${type}`}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Lottie
          animationData={AiIconLottieData}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      </div>
    </Tooltip>
  );
}
