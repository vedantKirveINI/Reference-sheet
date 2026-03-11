import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useCanvasAssistantChat } from "@/components/canvas-assistant/useCanvasAssistantChat";
import TinyAIInput from "./TinyAIInput";
import TinyAIMessage from "./TinyAIMessage";
import TinyAIQuickActions from "./TinyAIQuickActions";
import TinyAISuggestionCard from "./TinyAISuggestionCard";
import TinyAIThinkingBlock from "./TinyAIThinkingBlock";
import TinyAIClarificationCard from "./TinyAIClarificationCard";
import { ESC_HINT } from "./constants";
import { GUIDED_SETUP_EVENT } from "@/components/guided-setup/constants";

const MODE_LABELS = {
  debug: "Debugging mode",
  flow_generation: "Building workflow",
  explain_flow: "Explaining flow",
  health_check: "Health check",
  suggest_next: "Suggesting next step",
};

const TinyAIChatHeader = ({ onClose, chatMode }) => {
  const modeLabel = MODE_LABELS[chatMode] || "Ready to help";
  const dotColor = chatMode ? "bg-amber-400" : "bg-emerald-400";

  return (
  <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.12] bg-white/20 backdrop-blur-sm">
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1C3693] to-[#4f6ce8] flex items-center justify-center shadow-sm">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="white" />
      </svg>
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-[13px] font-semibold text-slate-800 leading-tight">TinyAI</span>
      <span className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
        <span className={cn("w-1.5 h-1.5 rounded-full inline-block transition-colors", dotColor)} />
        {modeLabel}
      </span>
    </div>
    <button
      type="button"
      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      onClick={onClose}
      title="Close"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
  );
};

const TinyAIChat = ({
  onClose,
  getWorkflowContext,
  canvasRef,
  assetId,
  escHintShown,
  pendingFixRequest,
  onFixRequestConsumed,
  lastSuggestion,
  onAddNode,
  onDismissSuggestion,
  onMuteSuggestions,
  saveNodeDataHandler,
  getUserContext,
  canvasType,
}) => {
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleKeyDown,
    handleBuildFlow,
    handleAction,
    handleCopy,
    handleAnswerClarification,
    handleSkipClarification,
    clarificationData,
    pendingFlow,
    consumedReplaceMessageIds,
    copiedId,
    showOnboarding,
    setShowOnboarding,
    messagesEndRef,
    inputRef,
    quickActions,
    streamingId,
    sendSyntheticMessage,
    thinkingSteps,
    chatMode,
  } = useCanvasAssistantChat({
    assetId,
    getWorkflowContext,
    canvasRef,
    saveNodeDataHandler,
    getUserContext,
    canvasType,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pendingFixRequest && !isLoading) {
      sendSyntheticMessage(pendingFixRequest.prompt, pendingFixRequest.mode || "debug");
      onFixRequestConsumed?.();
    }
  }, [pendingFixRequest, isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [thinkingSteps, messages, clarificationData]);

  const handleOnboardingBuild = () => {
    setShowOnboarding(false);
    localStorage.setItem("canvas_assistant_onboarded", "1");
    setInput("Build a workflow that sends a welcome email when a form is submitted");
    inputRef.current?.focus();
  };

  const handleOnboardingShow = () => {
    setShowOnboarding(false);
    localStorage.setItem("canvas_assistant_onboarded", "1");
    sendSyntheticMessage("What can you help me with?", null);
  };

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
    localStorage.setItem("canvas_assistant_onboarded", "1");
  };

  const handleQuickAction = (action) => {
    if (action.isGenerate) {
      setInput("Build a workflow that ");
      inputRef.current?.focus();
      return;
    }
    if (action.isFormula) {
      setInput("Help me write a formula that ");
      inputRef.current?.focus();
      return;
    }
    sendSyntheticMessage(action.label, action.mode || null);
  };

  const handleStartGuidedSetup = useCallback((nodeKeys) => {
    const diagram = canvasRef?.current?.getDiagram?.() || canvasRef?.current;
    if (!diagram || !nodeKeys?.length) return;

    window.dispatchEvent(
      new CustomEvent(GUIDED_SETUP_EVENT, {
        detail: { nodeKeys, diagram },
      })
    );

    onClose?.();
  }, [canvasRef, onClose]);

  const showSuggestionCard = lastSuggestion && lastSuggestion.nodes?.length > 0;

  const currentStreamingId = streamingId.current;
  const nonStreamingMessages = currentStreamingId
    ? messages.filter((m) => m.id !== currentStreamingId)
    : messages;
  const streamingMessage = currentStreamingId
    ? messages.find((m) => m.id === currentStreamingId)
    : null;

  return (
    <div className="flex flex-col w-full min-w-0 min-h-0 flex-1 overflow-hidden">
      <TinyAIChatHeader onClose={onClose} chatMode={chatMode} />

      {showSuggestionCard && (
        <div className="shrink-0 px-3 pt-2 pb-1 border-b border-black/[0.06] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)] z-10 bg-white/20 backdrop-blur-sm">
          <TinyAISuggestionCard
            suggestion={lastSuggestion}
            onNodeAdd={onAddNode}
            onDismiss={onDismissSuggestion}
            onMute={onMuteSuggestions}
          />
        </div>
      )}
      <div
        className={cn(
          "flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto px-4 pt-5 pb-3 flex flex-col gap-3",
        )}
      >
        {nonStreamingMessages.map((msg) => (
          <React.Fragment key={msg.id}>
            {msg.role === "assistant" && msg.thinkingSteps?.length > 0 && (
              <TinyAIThinkingBlock steps={msg.thinkingSteps} defaultCollapsed />
            )}
            <TinyAIMessage
              msg={msg}
              onAction={handleAction}
              onCopy={handleCopy}
              onBuildFlow={handleBuildFlow}
              copiedId={copiedId}
              pendingFlow={pendingFlow}
              onStartGuidedSetup={handleStartGuidedSetup}
              consumedReplaceMessageIds={consumedReplaceMessageIds}
            />
          </React.Fragment>
        ))}
        {thinkingSteps.length > 0 && (
          <TinyAIThinkingBlock steps={thinkingSteps} onStepChange={scrollToBottom} />
        )}
        {streamingMessage && (
          <TinyAIMessage
            key={streamingMessage.id}
            msg={streamingMessage}
            onAction={handleAction}
            onCopy={handleCopy}
            onBuildFlow={handleBuildFlow}
            copiedId={copiedId}
            pendingFlow={pendingFlow}
            onStartGuidedSetup={handleStartGuidedSetup}
            consumedReplaceMessageIds={consumedReplaceMessageIds}
          />
        )}
        {isLoading && !streamingId.current && thinkingSteps.length === 0 && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1C3693] to-[#4f6ce8] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="white" />
              </svg>
            </div>
            <div
              className={cn(
                "px-3 py-2 rounded-island-sm shadow-island-sm",
                "border border-black/[0.04] bg-surface-base",
                "flex gap-1",
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C3693]/50 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C3693]/50 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C3693]/50 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && !showSuggestionCard && !clarificationData && (
        <div className="shrink-0 px-3 pb-2">
          <TinyAIQuickActions
            showOnboarding={showOnboarding}
            quickActions={quickActions}
            onOnboardingBuild={handleOnboardingBuild}
            onOnboardingShow={handleOnboardingShow}
            onOnboardingDismiss={handleOnboardingDismiss}
            onQuickAction={handleQuickAction}
          />
        </div>
      )}

      {clarificationData && (
        <TinyAIClarificationCard
          clarificationData={clarificationData}
          onSubmit={handleAnswerClarification}
          onSkip={handleSkipClarification}
        />
      )}

      <div className="px-3 py-2.5 shrink-0 bg-white/20 backdrop-blur-sm border-t border-white/[0.12] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <TinyAIInput
          inputRef={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          disabled={isLoading}
        />
      </div>

      {!escHintShown && (
        <p className="shrink-0 text-[10px] text-slate-400 px-3 pb-1">{ESC_HINT}</p>
      )}
    </div>
  );
};

export default TinyAIChat;
