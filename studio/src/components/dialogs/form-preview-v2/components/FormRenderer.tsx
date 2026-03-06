import React, { Suspense, useRef, forwardRef, useImperativeHandle, useMemo, useState, useEffect, useCallback } from "react";
import { usePreviewContext } from "../context";
import { Mode, ViewPort, DEVICE_DIMENSIONS } from "../constants";
import { type SubmissionState } from "@src/module/constants";

const QuestionFiller = React.lazy(() =>
  import("@/module/question-filler").then((module) => ({
    default: module.QuestionFiller,
  }))
);

interface FormRendererProps {
  nodes: Record<string, any>;
  theme?: any;
  variables?: Record<string, any>;
  resourceIds?: Record<string, any>;
  onEvent?: (event: any) => void;
  onSuccess?: () => Promise<void>;
  hideBranding?: boolean;
}

export interface FormRendererRef {
  restart: () => void;
}

export const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(
  ({ nodes, theme, variables = {}, resourceIds = {}, onEvent = () => {}, onSuccess, hideBranding = false }, ref) => {
    const { mode, viewport, setResetSubmissionState } = usePreviewContext();
    const fillerRef = useRef<any>(null);
    const [submissionState, setSubmissionState] = useState<SubmissionState>("IDLE");
    const resetRegisteredRef = useRef(false);

    // Register reset function with context so it can be called from header
    const resetSubmissionState = useCallback(() => {
      setSubmissionState("IDLE");
    }, []);

    // Register the reset function with context (only once) — in effect to avoid setState during render
    useEffect(() => {
      if (!resetRegisteredRef.current) {
        setResetSubmissionState(resetSubmissionState);
        resetRegisteredRef.current = true;
      }
    }, [setResetSubmissionState, resetSubmissionState]);

    useImperativeHandle(ref, () => ({
      restart: () => {
        setSubmissionState("IDLE");
        fillerRef.current?.restart?.();
      },
    }));

    const modeValue = mode === Mode.CARD ? "CARD" : mode === Mode.CLASSIC ? "CLASSIC" : "CHAT";
    const viewPortValue = viewport === ViewPort.MOBILE ? "MOBILE" : "DESKTOP";
    
    // Calculate container width for preview mode
    // In mobile preview, use the actual mobile frame width (390px)
    // In desktop preview, let QuestionFiller use window.innerWidth
    const containerWidth = viewport === ViewPort.MOBILE ? DEVICE_DIMENSIONS.MOBILE.width : undefined;

    // Debug logging
    useEffect(() => {
      console.log("[PREVIEW_DEBUG] FormRenderer viewport changed:", {
        viewport,
        viewPortValue,
        containerWidth,
        modeValue,
      });
    }, [viewport, viewPortValue, containerWidth, modeValue]);

    const handleSuccess = async () => {
      console.log("[PREVIEW_DEBUG] FormRenderer handleSuccess called");
      if (onSuccess) {
        await onSuccess();
      }
    };

    const nodeKeys = nodes ? Object.keys(nodes) : [];
    const nodeCount = nodeKeys.length;
    
    const questionFillerKey = useMemo(() => {
      // Include mode and viewport in key so component remounts when they change
      return `${nodeKeys.sort().join(',')}-${modeValue}-${viewPortValue}`;
    }, [nodeKeys.join(','), modeValue, viewPortValue]);
    
    // Reset submission state to IDLE in preview mode when form restarts, nodes change, or mode/viewport changes
    useEffect(() => {
      setSubmissionState("IDLE");
    }, [questionFillerKey]);
    
    if (!nodes || nodeCount === 0) {
      return (
        <div className="flex items-center justify-center h-full text-zinc-400">
          <p>No form content to preview</p>
        </div>
      );
    }
    
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        }
      >
        <QuestionFiller
          key={questionFillerKey}
          ref={fillerRef}
          questions={nodes}
          theme={theme}
          mode={modeValue}
          viewPort={viewPortValue}
          isPreviewMode={true}
          containerWidth={containerWidth}
          variables={variables}
          onEvent={onEvent}
          resourceIds={resourceIds}
          onSuccess={handleSuccess}
          onSubmissionStateChange={(state) => {
            setSubmissionState(state);
          }}
          onRestart={() => {
            setSubmissionState("IDLE");
          }}
          submissionState={submissionState}
          hideBrandingButton={hideBranding}
        />
      </Suspense>
    );
  }
);

FormRenderer.displayName = "FormRenderer";
