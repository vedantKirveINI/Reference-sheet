import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Circle, SkipForward, X } from "lucide-react";
import { NODE_STEP_STATUS } from "./constants";

const VISIBLE_DOTS = 7;
const DOT_SIZES = {
  active: 22,
  near: 14,
  mid: 10,
  far: 7,
};
const CONNECTOR_SIZES = {
  near: 10,
  mid: 6,
  far: 4,
};

function getVisibleRange(currentIndex, totalCount) {
  const half = Math.floor(VISIBLE_DOTS / 2);
  let start = currentIndex - half;
  let end = currentIndex + half;

  if (start < 0) {
    start = 0;
    end = Math.min(VISIBLE_DOTS - 1, totalCount - 1);
  }
  if (end >= totalCount) {
    end = totalCount - 1;
    start = Math.max(0, end - VISIBLE_DOTS + 1);
  }

  return { start, end };
}

function getDotStyle(index, currentIndex, visibleStart, visibleEnd) {
  const distFromActive = Math.abs(index - currentIndex);
  const distFromEdge = Math.min(index - visibleStart, visibleEnd - index);

  let size;
  if (distFromActive === 0) size = DOT_SIZES.active;
  else if (distFromActive === 1) size = DOT_SIZES.near;
  else if (distFromEdge <= 0) size = DOT_SIZES.far;
  else if (distFromActive === 2) size = DOT_SIZES.mid;
  else size = DOT_SIZES.far;

  let opacity = 1;
  if (distFromEdge === 0 && distFromActive > 1) opacity = 0.5;

  return { size, opacity };
}

function getConnectorWidth(index, currentIndex, visibleStart, visibleEnd) {
  const distFromActive = Math.min(
    Math.abs(index - currentIndex),
    Math.abs(index - 1 - currentIndex)
  );
  const distFromEdge = Math.min(index - visibleStart, visibleEnd - index + 1);

  if (distFromActive <= 1) return CONNECTOR_SIZES.near;
  if (distFromEdge <= 1) return CONNECTOR_SIZES.far;
  return CONNECTOR_SIZES.mid;
}

const StepDot = ({ status, index, currentIndex, visibleStart, visibleEnd, onClick, canClick }) => {
  const { size, opacity } = getDotStyle(index, currentIndex, visibleStart, visibleEnd);
  const iconSize = Math.max(size * 0.5, 4);
  const isActive = index === currentIndex;

  return (
    <motion.button
      layout="position"
      onClick={canClick ? () => onClick?.(index) : undefined}
      className={cn(
        "rounded-full flex items-center justify-center shrink-0",
        canClick ? "cursor-pointer" : "cursor-default",
        status === NODE_STEP_STATUS.COMPLETED &&
          "bg-emerald-500 text-white",
        status === NODE_STEP_STATUS.SKIPPED &&
          "bg-amber-100 text-amber-600 border border-amber-200",
        status === NODE_STEP_STATUS.ACTIVE &&
          "bg-[#1C3693] text-white shadow-md ring-3 ring-[#1C3693]/20",
        status === NODE_STEP_STATUS.PENDING &&
          "bg-zinc-100 text-zinc-300 border border-zinc-200"
      )}
      animate={{ width: size, height: size, opacity }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      whileHover={canClick ? { scale: 1.15 } : undefined}
      whileTap={canClick ? { scale: 0.95 } : undefined}
    >
      {status === NODE_STEP_STATUS.COMPLETED && size >= 10 && (
        <Check style={{ width: iconSize, height: iconSize }} strokeWidth={3} />
      )}
      {status === NODE_STEP_STATUS.SKIPPED && size >= 10 && (
        <SkipForward style={{ width: iconSize, height: iconSize }} />
      )}
      {status === NODE_STEP_STATUS.ACTIVE && (
        <motion.div
          className="rounded-full bg-white"
          style={{ width: Math.max(iconSize * 0.6, 3), height: Math.max(iconSize * 0.6, 3) }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {status === NODE_STEP_STATUS.PENDING && size >= 10 && (
        <Circle style={{ width: iconSize, height: iconSize }} />
      )}
    </motion.button>
  );
};

const Connector = ({ completed, index, currentIndex, visibleStart, visibleEnd }) => {
  const width = getConnectorWidth(index, currentIndex, visibleStart, visibleEnd);

  return (
    <motion.div
      layout="position"
      className={cn(
        "h-[2px] rounded-full shrink-0",
        completed ? "bg-emerald-300" : "bg-zinc-200"
      )}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    />
  );
};

const GuidedProgressRail = ({
  nodeQueue,
  stepStatuses,
  currentIndex,
  completedCount,
  skippedCount,
  totalSteps,
  onExit,
  isNodeDrawerOpen = false,
}) => {
  const { start, end } = getVisibleRange(currentIndex, nodeQueue.length);
  const visibleNodes = nodeQueue.slice(start, end + 1);

  const drawerAwareLeft = isNodeDrawerOpen
    ? "calc((100vw - clamp(45rem, calc(45rem + 2vw), 50rem) - 7.25rem) / 2)"
    : "50%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        left: drawerAwareLeft,
        x: "-50%",
      }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        left: { type: "spring", stiffness: 300, damping: 30 },
      }}
      className="fixed bottom-6 z-[9998]"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5",
          "bg-white/95 backdrop-blur-md rounded-2xl",
          "shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]",
          "border border-zinc-100/80"
        )}
      >
        <div className="flex items-center gap-[3px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleNodes.map((node, visualIdx) => {
              const realIdx = start + visualIdx;
              const canClick = realIdx <= currentIndex;
              return (
                <React.Fragment key={node.key}>
                  {visualIdx > 0 && (
                    <Connector
                      completed={
                        stepStatuses[nodeQueue[realIdx - 1]?.key] ===
                        NODE_STEP_STATUS.COMPLETED
                      }
                      index={realIdx}
                      currentIndex={currentIndex}
                      visibleStart={start}
                      visibleEnd={end}
                    />
                  )}
                  <StepDot
                    status={stepStatuses[node.key]}
                    index={realIdx}
                    currentIndex={currentIndex}
                    visibleStart={start}
                    visibleEnd={end}
                    canClick={canClick}
                  />
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="w-px h-4 bg-zinc-200 shrink-0" />

        <span className="text-[11px] font-semibold text-zinc-600 whitespace-nowrap">
          {completedCount + skippedCount}/{totalSteps}
        </span>

        <button
          onClick={onExit}
          className={cn(
            "flex items-center p-1 rounded-md shrink-0",
            "text-zinc-400",
            "hover:text-zinc-600 hover:bg-zinc-50",
            "transition-colors duration-150"
          )}
          title="Exit guided setup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default GuidedProgressRail;
