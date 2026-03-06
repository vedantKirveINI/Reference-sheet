import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  parseActions,
  cleanContent,
  ACTION_CONFIG,
} from "@/components/canvas-assistant/useCanvasAssistantChat";

const markdownComponents = {
  p: ({ children }) => (
    <p className="m-0 mb-2 last:mb-0 text-[13px] leading-[1.55]">{children}</p>
  ),
  h1: ({ children }) => (
    <h3 className="text-[13px] font-bold text-slate-900 mt-2.5 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="text-[13px] font-bold text-slate-900 mt-2.5 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h3 className="text-[13px] font-bold text-slate-900 mt-2.5 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="my-1 ml-4 last:mb-0 list-disc">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 ml-4 last:mb-0 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="mb-0.5 leading-[1.45] [&::marker]:text-slate-500">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-600">{children}</em>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-[rgba(28,54,147,0.08)] text-[#1C3693] px-1 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    ) : (
      <pre className="bg-slate-800 text-slate-200 p-2 rounded-lg text-[11.5px] font-mono overflow-x-auto my-1.5 leading-relaxed">
        <code>{children}</code>
      </pre>
    ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#1C3693] underline underline-offset-1 hover:text-[#152b7a]"
    >
      {children}
    </a>
  ),
};

const ERROR_PATTERNS = [
  /sorry.*(?:trouble|couldn't|unable)/i,
  /wasn't able to (?:generate|process|complete)/i,
  /couldn't.*generate/i,
  /something went wrong/i,
  /(?:please try again|try again later)/i,
  /failed to (?:generate|process|create)/i,
];

const NODE_STEP_ICON_MAP = {
  trigger: "⚡",
  schedule: "🕐",
  email: "📧",
  slack: "💬",
  http: "🌐",
  ai: "🤖",
  summarize: "📝",
  fetch: "📥",
  send: "📤",
  filter: "🔍",
  transform: "🔄",
  condition: "🔀",
  delay: "⏳",
  webhook: "🪝",
};

function getStepIcon(text) {
  const lower = (text || "").toLowerCase();
  for (const [key, icon] of Object.entries(NODE_STEP_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return "▸";
}

function detectMessageType(msg) {
  if (msg.role === "user") return "user";
  if (msg.hasFlowPreview) return "plan";
  if (msg.isClarificationAnswer) return "user";
  const content = msg.content || "";
  if (ERROR_PATTERNS.some((p) => p.test(content))) return "error";
  return "assistant";
}

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const AssistantAvatar = () => (
  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1C3693] to-[#4f6ce8] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="white" />
    </svg>
  </div>
);

const FloatingCopyButton = ({ msgId, content, onCopy, copiedId }) => {
  if (!content || msgId === "welcome") return null;
  const isCopied = copiedId === msgId;
  return (
    <button
      type="button"
      className={cn(
        "absolute -top-3 -right-2 z-10",
        "flex items-center justify-center w-7 h-7 rounded-lg",
        "bg-white shadow-md border border-black/[0.08]",
        "opacity-0 group-hover:opacity-100",
        "transition-all duration-200",
        isCopied ? "text-emerald-500" : "text-slate-400 hover:text-slate-600 hover:shadow-lg",
      )}
      onClick={() => onCopy(msgId, content)}
      title={isCopied ? "Copied!" : "Copy message"}
    >
      {isCopied ? (
        <icons.check className="w-4 h-4" />
      ) : (
        <icons.copy className="w-4 h-4" />
      )}
    </button>
  );
};

const GuidedSetupOffer = ({ nodeKeys, onStartGuide, onDismiss }) => {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div className="mt-2 rounded-xl border border-[#1C3693]/15 bg-gradient-to-r from-[#1C3693]/[0.04] to-transparent p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#1C3693]/10 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="#1C3693" />
          </svg>
        </div>
        <span className="text-[12px] font-semibold text-[#1C3693]">
          Want me to walk you through setting up each step?
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
        I'll guide you through configuring each node — one at a time. Takes about 2 minutes.
      </p>
      <div className="flex items-center gap-2 pl-7">
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onStartGuide?.(nodeKeys);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
            "bg-[#1C3693] text-white text-[12px] font-semibold",
            "hover:bg-[#162d7a] active:bg-[#112266]",
            "transition-colors shadow-sm",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="currentColor" />
          </svg>
          Guide me
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          I've got it
        </button>
      </div>
    </div>
  );
};

const TinyAIMessage = ({
  msg,
  onAction,
  onCopy,
  onBuildFlow,
  copiedId,
  pendingFlow,
  onStartGuidedSetup,
  consumedReplaceMessageIds,
}) => {
  const isUser = msg.role === "user";
  const messageType = detectMessageType(msg);

  const accentClass =
    messageType === "error"
      ? "border-l-[3px] border-l-red-400"
      : messageType === "plan"
        ? "border-l-[3px] border-l-[#1C3693]"
        : "";

  if (messageType === "plan") {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-2 min-w-0 justify-start"
      >
        <AssistantAvatar />
        <div
          className={cn(
            "group relative max-w-[90%] min-w-0 text-[12px] leading-snug break-words",
            "rounded-island-sm shadow-island border border-black/[0.06]",
            "bg-gradient-to-br from-white to-[#f8f9ff]",
            "overflow-visible",
          )}
        >
          <div className="px-3 pt-2.5 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[11px] font-semibold text-[#1C3693] uppercase tracking-wide">
                {msg.planKind === "form" ? "Form Plan" : "Workflow Plan"}
              </span>
            </div>
            <div className="[&>*]:my-0 min-w-0 overflow-hidden break-words text-slate-700">
              <ReactMarkdown components={{
                ...markdownComponents,
                li: ({ children }) => {
                  const text = typeof children === "string" ? children : (Array.isArray(children) ? children.map(c => typeof c === "string" ? c : c?.props?.children || "").join("") : "");
                  const icon = getStepIcon(text);
                  return (
                    <li className="mb-1 leading-[1.45] flex items-start gap-1.5 list-none">
                      <span className="text-[12px] mt-[1px] shrink-0">{icon}</span>
                      <span>{children}</span>
                    </li>
                  );
                },
                ol: ({ children }) => <ol className="my-1 ml-0 last:mb-0 space-y-0.5">{children}</ol>,
                ul: ({ children }) => <ul className="my-1 ml-0 last:mb-0 space-y-0.5">{children}</ul>,
              }}>
                {cleanContent(msg.content)}
              </ReactMarkdown>
            </div>
          </div>

          {pendingFlow && (
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5",
                "bg-gradient-to-r from-[#1C3693] to-[#3b5de7]",
                "text-white text-[13px] font-semibold",
                "hover:from-[#152b7a] hover:to-[#2a4cc7]",
                "transition-all",
                "border-t border-[#1C3693]/20",
              )}
              onClick={onBuildFlow}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="currentColor" />
              </svg>
              {msg.ctaLabel || (msg.planKind === "form" ? "Build this form" : "Build this flow")}
            </button>
          )}

          <FloatingCopyButton
            msgId={msg.id}
            content={msg.content}
            onCopy={onCopy}
            copiedId={copiedId}
          />
        </div>
      </motion.div>
    );
  }

  if (messageType === "error") {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-2 min-w-0 justify-start"
      >
        <AssistantAvatar />
        <div
          className={cn(
            "group relative max-w-[85%] min-w-0 px-3 py-2 text-[12px] leading-snug break-words",
            "rounded-island-sm shadow-island-sm border border-red-200/60",
            "bg-red-50/80 text-slate-700",
          )}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-red-500 shrink-0">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Error</span>
          </div>
          <div className="[&>*]:my-0 min-w-0 overflow-hidden break-words">
            <ReactMarkdown components={markdownComponents}>
              {cleanContent(msg.content)}
            </ReactMarkdown>
          </div>
          <FloatingCopyButton
            msgId={msg.id}
            content={msg.content}
            onCopy={onCopy}
            copiedId={copiedId}
          />
        </div>
      </motion.div>
    );
  }

  if (isUser) {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex min-w-0 justify-end"
      >
        <div
          className={cn(
            "group relative max-w-[85%] min-w-0 px-3 py-2 text-[12px] leading-snug break-words",
            "rounded-island-sm shadow-island-sm",
            "bg-gradient-to-br from-[#1C3693] to-[#2a4cc7] text-white border border-[#1C3693]/30",
          )}
        >
          {msg.content}
          <FloatingCopyButton
            msgId={msg.id}
            content={msg.content}
            onCopy={onCopy}
            copiedId={copiedId}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-2 min-w-0 justify-start"
    >
      <AssistantAvatar />
      <div
        className={cn(
          "group relative max-w-[85%] min-w-0 px-3 py-2 text-[12px] leading-snug break-words",
          "rounded-island-sm shadow-island-sm border border-black/[0.04]",
          "bg-surface-base text-slate-800",
        )}
      >
        {!msg.content || msg.content.trim() === "" ? (
          <div className="flex items-center gap-1 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <div className="[&>*]:my-0 min-w-0 overflow-hidden break-words">
            <ReactMarkdown components={markdownComponents}>
              {cleanContent(msg.content)}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && msg.content && parseActions(msg.content).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {parseActions(msg.content).map((action, idx) => {
              const config =
                ACTION_CONFIG[action.type] || {
                  label: action.type,
                  icon: "⚡",
                };
              const label =
                action.type === "add_node" && action.param
                  ? `Add ${action.param}`
                  : config.label;
              const isOneShotConfirmOrCancel =
                action.type === "confirm_replace_form" ||
                action.type === "cancel_replace_form" ||
                action.type?.startsWith("confirm_") ||
                action.type?.startsWith("cancel_");
              const isDisabled =
                isOneShotConfirmOrCancel && consumedReplaceMessageIds?.has?.(msg.id);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1",
                    "rounded-island-sm shadow-island-sm",
                    "border border-black/[0.04] bg-surface-base",
                    "text-[#1C3693] text-[11px] font-medium",
                    "hover:shadow-island hover:border-black/[0.08]",
                    "transition-all",
                    isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  onClick={() => !isDisabled && onAction(action, msg?.id)}
                >
                  <span>{config.icon}</span> {label}
                </button>
              );
            })}
          </div>
        )}

        {msg.guidedSetupOffer && msg.guidedSetupNodeKeys?.length > 0 && (
          <GuidedSetupOffer
            nodeKeys={msg.guidedSetupNodeKeys}
            onStartGuide={onStartGuidedSetup}
          />
        )}

        <FloatingCopyButton
          msgId={msg.id}
          content={msg.content}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      </div>
    </motion.div>
  );
};

export default TinyAIMessage;
