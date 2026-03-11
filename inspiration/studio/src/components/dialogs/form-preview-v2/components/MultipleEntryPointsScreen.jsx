import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getFriendlyNodeName } from "../utils/canvas/canvasToPreviewFlow";

const QUESTION_TYPE_ICONS = {
  SHORT_TEXT: "Aa",
  LONG_TEXT: "Aa",
  MCQ: "☑",
  SCQ: "◉",
  YES_NO: "Y/N",
  DROP_DOWN: "▾",
  DROP_DOWN_STATIC: "▾",
  EMAIL: "@",
  PHONE_NUMBER: "☎",
  NUMBER: "#",
  DATE: "📅",
  CURRENCY: "$",
  FILE_PICKER: "📎",
  SIGNATURE: "✍",
  RATING: "★",
  SLIDER: "◐",
  WELCOME: "👋",
  ENDING: "✓",
};

function getQuestionIcon(nodeType) {
  return QUESTION_TYPE_ICONS[nodeType] || "?";
}

export function MultipleEntryPointsScreen({ 
  errorNodes = [],
  onClose 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-center h-full px-6"
    >
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-100 overflow-hidden">
          <div className="px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full mb-5">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">
              Multiple Starting Points
            </h2>
            
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
              We found {errorNodes.length} questions that could be the first question. Connect them so there's only one starting point.
            </p>
          </div>
          
          <div className="px-6 pb-6">
            <div className="space-y-2">
              {errorNodes.slice(0, 6).map((node, index) => {
                const nodeKey = typeof node === 'string' ? node : node?.nodeKey;
                const nodeType = typeof node === 'string' ? null : node?.nodeType;
                const nodeName = typeof node === 'string' ? `Question ${index + 1}` : (node?.nodeName || getFriendlyNodeName(nodeType));
                const friendlyType = getFriendlyNodeName(nodeType);
                
                return (
                  <div
                    key={nodeKey || index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      "bg-zinc-50 border border-zinc-100"
                    )}
                  >
                    <div className="flex-shrink-0 w-9 h-9 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-500 text-sm font-medium shadow-sm">
                      {getQuestionIcon(nodeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-700 truncate">
                        {nodeName}
                      </p>
                      {nodeType && (
                        <p className="text-xs text-zinc-400">
                          {friendlyType}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                        No incoming link
                      </span>
                    </div>
                  </div>
                );
              })}
              {errorNodes.length > 6 && (
                <div className="text-center py-2">
                  <span className="text-xs text-zinc-400">
                    +{errorNodes.length - 6} more disconnected questions
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 pb-6">
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
              <ArrowLeft className="w-4 h-4" />
              Go to Canvas
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MultipleEntryPointsScreen;
