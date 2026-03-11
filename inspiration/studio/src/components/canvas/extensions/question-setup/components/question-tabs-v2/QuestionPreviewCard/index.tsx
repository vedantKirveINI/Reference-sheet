import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Maximize2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ViewportToggle from "./ViewportToggle";
import PreviewModal from "./PreviewModal";
import { getPreviewValue } from "./getPreviewValue";
import { QuestionRenderer } from "@src/module/question-v2";
import {
  useQuestionContext,
  useCanvasConfigContext,
} from "@oute/oute-ds.core.contexts";
import { Mode, ViewPort, localStorageConstants } from "@src/module/constants";
import { questionHelpers } from "@oute/oute-ds.core.constants";

interface QuestionPreviewCardProps {
  defaultCollapsed?: boolean;
}

const getInitialViewport = (): "desktop" | "mobile" => {
  if (typeof localStorage === "undefined") return "desktop";
  const stored = localStorage.getItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT);
  return stored === ViewPort.MOBILE ? "mobile" : "desktop";
};

const QuestionPreviewCard = ({
  defaultCollapsed = false,
}: QuestionPreviewCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [viewport, setViewportState] = useState<"desktop" | "mobile">(getInitialViewport);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setViewport = useCallback((value: "desktop" | "mobile") => {
    setViewportState(value);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        localStorageConstants.QUESTION_CREATOR_VIEWPORT,
        value === "mobile" ? ViewPort.MOBILE : ViewPort.DESKTOP
      );
    }
  }, []);
  const [previewSelection, setPreviewSelection] = useState<{ response: unknown } | null>(null);

  // Get live data from contexts
  const { question, mode, theme } = useQuestionContext();
  const { variables, workspaceId } = useCanvasConfigContext();

  const isMobile = viewport === "mobile";
  const currentViewPort = isMobile ? ViewPort.MOBILE : ViewPort.DESKTOP;
  const currentMode = mode || Mode.CARD;

  // Calculate background styles using the same helper as QuestionCreator
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
  
  // Reset preview selection when question changes
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

  // Calculate scale factor for compact preview
  const getPreviewScale = () => {
    if (isMobile) {
      return 0.35; // Mobile preview is smaller
    }
    return 0.4; // Desktop preview scale
  };

  // Container dimensions based on viewport
  const getContainerDimensions = () => {
    if (isMobile) {
      return {
        width: 375,
        height: 667,
      };
    }
    return {
      width: 800,
      height: 500,
    };
  };

  const dimensions = getContainerDimensions();
  const scale = getPreviewScale();

  if (!question || !Object.keys(question).length) {
    return null;
  }

  return (
    <>
      <Card className="border-zinc-200 bg-zinc-50/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <>
                <ViewportToggle
                  value={viewport}
                  onChange={setViewport}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-900"
                  onClick={() => setIsModalOpen(true)}
                  title="Expand preview"
                >
                  <Maximize2 size={14} />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-zinc-900"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-center">
                  {/* Scaled preview container - uses position:relative/absolute to contain scaled content */}
                  <div
                    className={cn(
                      "rounded-none border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 relative"
                    )}
                    style={{
                      width: isMobile 
                        ? `${dimensions.width * scale}px` 
                        : "100%",
                      height: `${dimensions.height * scale}px`,
                      maxWidth: isMobile ? "140px" : "320px",
                    }}
                  >
                    {/* Inner container that gets scaled - positioned absolute to not affect parent layout */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
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
                              opacity: (question.augmentor.opacity ?? 100) / 100,
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
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <PreviewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialViewport={viewport}
        onViewportChange={setViewport}
      />
    </>
  );
};

export default QuestionPreviewCard;
