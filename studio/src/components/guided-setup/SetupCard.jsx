import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Check, Settings, SkipForward, X, AlertCircle, CircleDot } from "lucide-react";
import { getConfigDisplayItems } from "./utils/essentialFields";
import { getNodeSetupStatus, SETUP_STATUS } from "./utils/nodeSetupStatus";

const NodeIconBadge = ({ iconSrc, nodeType }) => {
  const [hasError, setHasError] = React.useState(false);

  if (!iconSrc || hasError) {
    return (
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1C3693]/10 to-[#4f6ce8]/10 flex items-center justify-center border border-[#1C3693]/15">
        <Settings className="w-5 h-5 text-[#1C3693]" />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
      <img
        src={iconSrc}
        alt={nodeType || "Node"}
        className="w-6 h-6"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

const ConfigRow = ({ label, value }) => {
  const truncated = value.length > 80 ? value.substring(0, 77) + "..." : value;
  return (
    <div className="flex items-start gap-2 py-1.5 px-3 rounded-lg bg-zinc-50/80">
      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider min-w-[70px] pt-0.5 flex-shrink-0">
        {label}
      </span>
      <span className="text-[12px] text-zinc-700 font-medium break-words leading-relaxed">
        {truncated}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  if (status === SETUP_STATUS.READY) {
    return (
      <div className="flex items-center gap-1.5 mb-2">
        <Check className="w-3 h-3 text-emerald-500" />
        <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
          Ready to go
        </span>
      </div>
    );
  }
  if (status === SETUP_STATUS.NEEDS_ATTENTION) {
    return (
      <div className="flex items-center gap-1.5 mb-2">
        <AlertCircle className="w-3 h-3 text-amber-500" />
        <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
          Needs your attention
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <CircleDot className="w-3 h-3 text-[#1C3693]" />
      <span className="text-[11px] font-semibold text-[#1C3693] uppercase tracking-wider">
        Not configured yet
      </span>
    </div>
  );
};

const AttentionItems = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-1 mb-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-amber-50/70 border border-amber-100/50"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-[12px] text-amber-700 font-medium">{item}</span>
        </div>
      ))}
    </div>
  );
};

const SetupCard = ({
  node,
  stepNumber,
  totalSteps,
  onConfigure,
  onSkip,
  onDone,
  onExit,
  position,
}) => {
  if (!node) return null;

  const setupStatus = useMemo(
    () => getNodeSetupStatus(node.nodeData),
    [node.nodeData, node.nodeData?.go_data]
  );

  const configItems = getConfigDisplayItems(node.config);
  const hasConfig = configItems.length > 0;
  const isReady = setupStatus.status === SETUP_STATUS.READY;
  const needsAttention = setupStatus.status === SETUP_STATUS.NEEDS_ATTENTION;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-[9999]"
      style={{
        left: position?.x ?? "50%",
        top: position?.y ?? "50%",
        transform: position ? "translate(-50%, 16px)" : "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "w-[400px] bg-white rounded-2xl overflow-hidden",
          "shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
          "border border-zinc-100/80"
        )}
      >
        <div className="relative px-5 pt-5 pb-3">
          <button
            onClick={onExit}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors"
            title="Exit guided setup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 mb-3">
            <NodeIconBadge iconSrc={node.icon} nodeType={node.type} />
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-[#1C3693] uppercase tracking-wider">
                  Step {stepNumber} of {totalSteps}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug truncate">
                {node.friendlyName}
              </h3>
              {node.name !== node.friendlyName && (
                <p className="text-[12px] text-zinc-400 truncate mt-0.5">
                  {node.name}
                </p>
              )}
            </div>
          </div>

          <p className="text-[13px] text-zinc-600 leading-relaxed mb-3">
            {node.guidance}
          </p>

          <StatusBadge status={setupStatus.status} />

          {isReady && hasConfig && (
            <div className="flex flex-col gap-1 mb-3">
              {configItems.map((item) => (
                <ConfigRow key={item.key} label={item.label} value={item.value} />
              ))}
            </div>
          )}

          {!isReady && hasConfig && (
            <div className="mb-2">
              <div className="flex flex-col gap-1 mb-2">
                {configItems.map((item) => (
                  <ConfigRow key={item.key} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          )}

          <AttentionItems items={setupStatus.items} />
        </div>

        <div className="px-5 pb-4 flex items-center gap-2">
          {isReady ? (
            <>
              <button
                onClick={onDone}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "h-10 px-4 rounded-xl",
                  "bg-emerald-600 text-white text-[13px] font-semibold",
                  "hover:bg-emerald-700 active:bg-emerald-800",
                  "transition-colors duration-150",
                  "shadow-sm"
                )}
              >
                <Check className="w-4 h-4" />
                Looks good
              </button>

              <button
                onClick={onConfigure}
                className={cn(
                  "h-10 px-4 rounded-xl",
                  "bg-zinc-100 text-zinc-600 text-[13px] font-semibold",
                  "hover:bg-zinc-200 active:bg-zinc-250",
                  "transition-colors duration-150"
                )}
              >
                Edit
              </button>
            </>
          ) : (
            <button
              onClick={onConfigure}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                "h-10 px-4 rounded-xl",
                "bg-[#1C3693] text-white text-[13px] font-semibold",
                "hover:bg-[#162d7a] active:bg-[#112266]",
                "transition-colors duration-150",
                "shadow-sm"
              )}
            >
              Open Settings
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onSkip}
            className={cn(
              "h-10 px-3 rounded-xl flex items-center gap-1",
              "text-zinc-400 text-[13px] font-medium",
              "hover:text-zinc-600 hover:bg-zinc-50",
              "transition-colors duration-150"
            )}
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SetupCard;
