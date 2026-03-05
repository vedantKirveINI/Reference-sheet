import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";
import { getPreviewValue } from "./getPreviewValue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ViewportToggle from "./ViewportToggle";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from "@src/module/question-v2";
import {
  useQuestionContext,
  useCanvasConfigContext,
} from "@src/module/contexts";
import {
  Mode,
  ViewPort,
  questionHelpers,
} from "@src/module/constants";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  initialViewport?: "desktop" | "mobile";
  onViewportChange?: (viewport: "desktop" | "mobile") => void;
}

const PreviewModal = ({
  open,
  onClose,
  initialViewport = "desktop",
  onViewportChange,
}: PreviewModalProps) => {
  const viewport = initialViewport;
  const [previewSelection, setPreviewSelection] = useState<{ response: unknown } | null>(null);

  const handleViewportChange = (newViewport: "desktop" | "mobile") => {
    onViewportChange?.(newViewport);
  };

  // Get live data from contexts
  const { question, mode, theme } = useQuestionContext();
  const { variables, workspaceId } = useCanvasConfigContext();

  const isMobile = viewport === "mobile";
  const currentViewPort = isMobile ? ViewPort.MOBILE : ViewPort.DESKTOP;
  const currentMode = mode || Mode.CARD;

  // Calculate background styles
  const questionBackgroundStyles = useMemo(() => {
    if (!question || !theme) return {};
    return questionHelpers.getQuestionBackgroundStyles(
      theme,
      currentViewPort,
      currentMode,
      question
    );
  }, [theme, currentViewPort, currentMode, question]);

  const isAugmentorBackground =
    currentMode === Mode.CARD &&
    !!question?.augmentor?.url &&
    (currentViewPort === ViewPort.DESKTOP
      ? question?.augmentor?.alignment?.cardDesktop === "background"
      : question?.augmentor?.alignment?.cardMobile === "background");

  // Handlers - track selection in preview for UI updates, but don't persist
  const handlers = useMemo(
    () => ({
      onChange: (value: unknown, options?: unknown) => {
        // In preview, track selection locally for UI updates
        // Ensure Single selection is stored as single value, not array
        const settings = question?.settings as Record<string, unknown> | undefined;
        const selectionType = settings?.selectionType as string | undefined;
        const isMulti =
          selectionType === "Unlimited" ||
          selectionType === "Exact Number" ||
          selectionType === "Range";
        
        if (isMulti) {
          const arr = Array.isArray(value) ? value : value != null && value !== "" ? [value] : [];
          setPreviewSelection({ response: arr });
        } else {
          // Single selection - ensure it's not an array
          const single = Array.isArray(value) ? value?.[0] ?? "" : (value ?? "");
          setPreviewSelection({ response: single });
        }
      },
      onSubmit: () => {},
      onCTAClick: () => {},
      goToTab: () => {},
      showSidebar: () => {},
    }),
    [question?.settings]
  );

  // UI config for the renderer
  const uiConfig = useMemo(
    () => ({
      mode: currentMode,
      viewPort: currentViewPort,
      theme: theme || {},
    }),
    [currentMode, currentViewPort, theme]
  );

  // State config - preview mode, not creator; isAnswering: true so answer section shows
  const stateConfig = useMemo(
    () => ({
      isCreator: false,
      isPreviewMode: true,
      isAnswering: true,
      isAnswered: false,
      answers: {} as Record<string, unknown>,
    }),
    []
  );

  const initialPreviewValue = useMemo(() => getPreviewValue(question), [question]);
  // Use local selection if user has interacted, otherwise use initial value
  const previewValue = previewSelection ?? initialPreviewValue;
  
  // Reset preview selection when question changes or modal closes
  useEffect(() => {
    if (!open) {
      setPreviewSelection(null);
    }
  }, [open]);
  
  useEffect(() => {
    setPreviewSelection(null);
  }, [question?._id]);

  // Canvas config
  const canvasConfig = useMemo(
    () => ({
      workspaceId: workspaceId || "",
    }),
    [workspaceId]
  );

  if (!question || !Object.keys(question).length) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl"
        hideCloseButton
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shrink-0">
          <DialogTitle className="text-base font-semibold tracking-tight text-zinc-900">
            Live Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <ViewportToggle
              value={viewport}
              onChange={handleViewportChange}
              size="default"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex justify-center items-start overflow-auto bg-gradient-to-b from-zinc-100 to-zinc-50 pt-5 px-6 pb-8">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 relative ring-1 ring-zinc-200/80 shadow-xl",
              isMobile ? "w-[375px] h-[667px] rounded-2xl shrink-0" : "w-full max-w-4xl h-full rounded-2xl"
            )}
            style={{
              minHeight: isMobile ? "667px" : "500px",
              ...(isAugmentorBackground
                ? { backgroundColor: theme?.styles?.backgroundColor ?? "#FFFFFF" }
                : questionBackgroundStyles),
            }}
          >
            {isAugmentorBackground && question?.augmentor?.url && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  borderRadius: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
                aria-hidden
              >
                <img
                  src={question.augmentor.url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: (question?.augmentor?.opacity ?? 100) / 100,
                  }}
                />
              </div>
            )}
            {isAugmentorBackground ? (
              <div
                style={{
                  position: "relative" as const,
                  zIndex: 1,
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <QuestionRenderer
                  uiConfig={uiConfig}
                  questionData={question}
                  stateConfig={stateConfig}
                  handlers={handlers}
                  nodeConfig={{}}
                  variables={variables || {}}
                  questionIndex="1"
                  value={previewValue}
                  canvasConfig={canvasConfig}
                />
              </div>
            ) : (
              <QuestionRenderer
                uiConfig={uiConfig}
                questionData={question}
                stateConfig={stateConfig}
                handlers={handlers}
                nodeConfig={{}}
                variables={variables || {}}
                questionIndex="1"
                value={previewValue}
                canvasConfig={canvasConfig}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
