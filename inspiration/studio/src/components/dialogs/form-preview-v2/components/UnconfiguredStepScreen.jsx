import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getFriendlyNodeName, getSetupGuidance } from "../utils/previewSafeTransform";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

const NodeIcon = ({ iconSrc, nodeType, className = "w-8 h-8" }) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (!iconSrc || hasError) {
    return <Settings className={cn(className, "text-amber-600")} />;
  }
  
  return (
    <img 
      src={iconSrc} 
      alt={nodeType || "Node icon"}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const NodeTypeIcon = ({ nodeType }) => {
  const iconClass = "w-8 h-8 text-amber-600";
  
  if (nodeType.includes("SHEET") || nodeType.includes("Sheet")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  
  if (nodeType.includes("CREATE") || nodeType.includes("Record")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  if (nodeType.includes("UPDATE")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }
  
  if (nodeType.includes("DELETE")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );
  }
  
  if (nodeType.includes("Integration") || nodeType.includes("HTTP")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  }
  
  if (nodeType.includes("GPT") || nodeType.includes("AI")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  }
  
  if (nodeType.includes("HITL") || nodeType.includes("Approval")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  if (nodeType.includes("EMAIL") || nodeType.includes("SELF_EMAIL")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  
  if (nodeType.includes("IF_ELSE") || nodeType.includes("If Else")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  if (nodeType.includes("TRANSFORMER") || nodeType.includes("Transformer")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
  }
  
  if (nodeType.includes("WEBHOOK")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  
  if (nodeType.includes("TRIGGER") || nodeType.includes("Trigger")) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
};

const ValidationIssueItem = ({ issue }) => {
  const isError = issue.severity === 'error';
  
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
        isError ? "bg-red-100" : "bg-amber-100"
      )}>
        {isError ? (
          <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          isError ? "text-red-700" : "text-amber-700"
        )}>
          {issue.message}
        </p>
        {issue.hint && (
          <p className="text-xs text-zinc-500 mt-0.5">
            {issue.hint}
          </p>
        )}
      </div>
    </div>
  );
};

function getEncouragingHeader(totalErrors, currentIndex) {
  if (totalErrors === 1) {
    return "Almost there! Just one quick thing to wrap up.";
  }
  
  const remaining = totalErrors - currentIndex;
  
  if (currentIndex === 0) {
    return `Almost there! ${totalErrors} quick tweaks and you're all set.`;
  }
  
  if (remaining === 1) {
    return "Final stretch! This is the last one.";
  }
  
  if (remaining === 2) {
    return "You're doing great! Just 2 more to go.";
  }
  
  return `Nice progress! ${remaining} more to polish up.`;
}

function getProgressText(totalErrors, currentIndex) {
  if (totalErrors === 1) {
    return null;
  }
  return `${currentIndex + 1} of ${totalErrors}`;
}

export function UnconfiguredStepScreen({
  nodeInfo,
  totalErrors = 1,
  currentIndex = 0,
  onPrevious,
  onNext,
  onSetupNow,
  onClose,
  embedMode = false,
  requiresAuth = false,
  onRequiresAuth,
}) {
  const friendlyName = getFriendlyNodeName(nodeInfo?.nodeType);
  const guidance = getSetupGuidance(nodeInfo?.nodeType);
  const canNavigate = nodeInfo?.canNavigate !== false && nodeInfo?.nodeKey;
  
  const validation = nodeInfo?.validation;
  const hasValidationIssues = validation?.issues?.length > 0;
  const errorCount = validation?.issues?.filter(i => i.severity === 'error').length || 0;
  
  const showNavigation = totalErrors > 1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalErrors - 1;
  const headerText = getEncouragingHeader(totalErrors, currentIndex);
  const progressText = getProgressText(totalErrors, currentIndex);

  if (embedMode && requiresAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-center h-full px-6"
      >
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden p-8">
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">Account required</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-6">
              This step requires an account. Sign up or log in to configure this integration or connected service.
            </p>
            <div className="space-y-3">
              {onRequiresAuth && (
                <button
                  onClick={onRequiresAuth}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium text-sm",
                    "bg-zinc-900 text-white",
                    "hover:bg-zinc-800 active:bg-zinc-950",
                    "transition-colors duration-150"
                  )}
                >
                  Sign up or log in
                </button>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-medium text-sm",
                  "bg-zinc-100 text-zinc-700",
                  "hover:bg-zinc-200 active:bg-zinc-300",
                  "transition-colors duration-150"
                )}
              >
                I'll do it later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-center h-full px-6"
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 py-10 text-center border-b border-amber-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-5">
              {nodeInfo?.nodeIcon ? (
                <NodeIcon 
                  iconSrc={nodeInfo.nodeIcon} 
                  nodeType={nodeInfo?.nodeType} 
                  className="w-8 h-8"
                />
              ) : (
                <NodeTypeIcon nodeType={nodeInfo?.nodeType || ""} />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">
              {headerText}
            </h2>
            
            {progressText && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 rounded-full mb-3">
                <span className="text-xs font-medium text-amber-700">{progressText}</span>
              </div>
            )}
            
            <p className="text-zinc-600 text-sm leading-relaxed">
              {hasValidationIssues
                ? `Your ${friendlyName.toLowerCase()} needs ${errorCount} ${errorCount === 1 ? "thing" : "things"} to be completed.`
                : `Your ${friendlyName.toLowerCase()} needs a bit of attention before we can continue.`
              }
            </p>
            {embedMode && (
              <p className="text-zinc-500 text-xs leading-relaxed mt-3">
                A few steps need setup before you can preview. Set them up here or configure them in the full editor.
              </p>
            )}
          </div>
          
          <div className="px-8 py-6">
            {hasValidationIssues ? (
              <div className="bg-zinc-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-zinc-800 text-sm">
                    {friendlyName} checklist
                  </h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {validation.issues.map((issue, index) => (
                    <ValidationIssueItem key={index} issue={issue} />
                  ))}
                </div>
                {validation.summary && (
                  <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-200">
                    {validation.summary}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-800 text-sm mb-1">
                      {friendlyName} needs setup
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      {guidance}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {canNavigate ? (
                <button
                  onClick={onSetupNow}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium text-sm",
                    "bg-zinc-900 text-white",
                    "hover:bg-zinc-800 active:bg-zinc-950",
                    "transition-colors duration-150",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Set Up {friendlyName}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium text-sm",
                    "bg-zinc-900 text-white",
                    "hover:bg-zinc-800 active:bg-zinc-950",
                    "transition-colors duration-150",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Go to Canvas
                </button>
              )}
              
              <button
                onClick={onClose}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-medium text-sm",
                  "bg-zinc-100 text-zinc-700",
                  "hover:bg-zinc-200 active:bg-zinc-300",
                  "transition-colors duration-150"
                )}
              >
                I'll do it later
              </button>
            </div>
          </div>
          
          {showNavigation ? (
            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100">
              {embedMode && (
                <p className="text-xs text-zinc-400 text-center mb-3">
                  You can also adjust the theme in the preview header.
                </p>
              )}
              <div className="flex items-center justify-between">
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    hasPrevious 
                      ? "text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300" 
                      : "text-zinc-300 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalErrors }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        i === currentIndex ? "bg-amber-500" : "bg-zinc-300"
                      )}
                    />
                  ))}
                </div>
                
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    hasNext 
                      ? "text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300" 
                      : "text-zinc-300 cursor-not-allowed"
                  )}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 text-center">
                {canNavigate
                  ? "After setup, come back to preview your complete form"
                  : "Look for the unconfigured step in your canvas to complete setup"
                }
              </p>
              {embedMode && (
                <p className="text-xs text-zinc-400 text-center mt-1">
                  You can also adjust the theme in the preview header.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default UnconfiguredStepScreen;
