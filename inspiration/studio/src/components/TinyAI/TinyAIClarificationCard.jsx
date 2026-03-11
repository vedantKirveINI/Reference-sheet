import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";

const OPTION_PATTERNS = [
  /\(e\.g\.\,?\s*([^)]+)\)/i,
  /\(such as\s+([^)]+)\)/i,
  /\(options?:\s*([^)]+)\)/i,
  /\(like\s+([^)]+)\)/i,
];

function extractOptions(question) {
  for (const pattern of OPTION_PATTERNS) {
    const match = question.match(pattern);
    if (match) {
      const raw = match[1];
      const options = raw
        .split(/,\s*|\s+or\s+|\s*\/\s*/)
        .map((o) => o.replace(/^["']|["']$/g, "").replace(/etc\.?$/i, "").trim())
        .filter((o) => o.length > 0 && o.length < 40);
      if (options.length >= 2) {
        return options;
      }
    }
  }
  return null;
}

function cleanQuestion(question) {
  return question
    .replace(/\(e\.g\.\,?\s*[^)]+\)/i, "")
    .replace(/\(such as\s+[^)]+\)/i, "")
    .replace(/\(options?:\s*[^)]+\)/i, "")
    .replace(/\(like\s+[^)]+\)/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getPlacementAfterOption(opts) {
  if (!Array.isArray(opts)) return null;
  return opts.find((o) => /^after\b|after\s+/i.test(o.trim())) ?? null;
}

function isPlacementQuestionWithNodePicker(question, nodeIndex) {
  if (!Array.isArray(nodeIndex) || nodeIndex.length === 0) return false;
  const opts = extractOptions(question);
  if (!opts || opts.length < 2) return false;
  const afterOpt = getPlacementAfterOption(opts);
  const hasAfter = afterOpt != null;
  const hasBeforeEnd = opts.some((o) => /before the end node/i.test(o));
  return hasAfter && hasBeforeEnd;
}

function isWhichNodeQuestion(question, nodeIndex) {
  if (!Array.isArray(nodeIndex) || nodeIndex.length === 0) return false;
  return /which node should i (delete|update)/i.test(question);
}

function getEffectiveOptions(question) {
  const opts = extractOptions(question);
  if (opts && opts.length >= 2) return opts;
  return null;
}

function getNodeOptionValue(node, nodeIndex) {
  if (!node || !Array.isArray(nodeIndex)) return "";
  const idx = nodeIndex.findIndex((n) => n === node || (n.key != null && n.key === node.key) || (n.key == null && n.label === node.label));
  if (idx < 0) return node.key ?? node.id ?? "";
  const n = nodeIndex[idx];
  return String(n.key ?? n.id ?? `node-${idx}`);
}

const PillSelectorMulti = ({ options, selected, onToggle, onOtherClick }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const isSelected = Array.isArray(selected) && selected.includes(option);
      return (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
            "border",
            isSelected
              ? "bg-[#1C3693] text-white border-[#1C3693] shadow-sm"
              : "bg-white/80 text-slate-700 border-slate-200 hover:border-[#1C3693]/40 hover:text-[#1C3693]",
          )}
        >
          {option}
        </button>
      );
    })}
    <button
      type="button"
      onClick={onOtherClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
        "bg-slate-100 text-slate-600 border-slate-300",
        "hover:bg-white/80 hover:text-slate-700 hover:border-slate-200",
      )}
    >
      Other...
    </button>
  </div>
);

const TinyAIClarificationCard = ({ clarificationData, onSubmit, onSkip }) => {
  const { questions } = clarificationData;
  const nodeIndex = clarificationData?.nodeIndex ?? [];
  const hasOptions = useCallback((q) => !!extractOptions(q)?.length, []);

  const [answers, setAnswers] = useState(() => questions.map(() => ""));
  const [selectedOptions, setSelectedOptions] = useState(() =>
    questions.map((q) => (extractOptions(q) ? [] : null)),
  );
  const [customOther, setCustomOther] = useState(() => questions.map(() => ""));
  const [customInputVisible, setCustomInputVisible] = useState(() => questions.map(() => false));
  const [placementAnchorNode, setPlacementAnchorNode] = useState(() => questions.map(() => null));
  const [whichNodeSelection, setWhichNodeSelection] = useState(() => questions.map(() => null));

  const updateAnswer = useCallback((idx, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  const toggleCustomInput = useCallback((idx, show) => {
    setCustomInputVisible((prev) => {
      const next = [...prev];
      next[idx] = show;
      return next;
    });
  }, []);

  const updateCustomOther = useCallback((idx, value) => {
    setCustomOther((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  const togglePillOption = useCallback((idx, option) => {
    setSelectedOptions((prev) => {
      const next = prev.map((arr, i) => (i !== idx ? arr : (arr ?? [])));
      const sel = next[idx] ?? [];
      const nextSel = sel.includes(option) ? sel.filter((o) => o !== option) : [...sel, option];
      next[idx] = nextSel;
      return next;
    });
  }, []);

  const selectPillOption = useCallback((idx, option, afterOpt) => {
    setSelectedOptions((prev) => {
      const next = [...prev];
      next[idx] = [option];
      return next;
    });
    if (afterOpt != null && option !== afterOpt) {
      setPlacementAnchorNode((prev) => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    }
  }, []);

  const updatePlacementAnchor = useCallback((idx, node) => {
    setPlacementAnchorNode((prev) => {
      const next = [...prev];
      next[idx] = node;
      return next;
    });
  }, []);

  const updateWhichNode = useCallback((idx, node) => {
    setWhichNodeSelection((prev) => {
      const next = [...prev];
      next[idx] = node;
      return next;
    });
  }, []);

  const allAnswered = questions.every((q, i) => {
    if (isWhichNodeQuestion(q, nodeIndex)) {
      return whichNodeSelection[i] != null;
    }
    if (isPlacementQuestionWithNodePicker(q, nodeIndex)) {
      const placementOpts = extractOptions(q);
      const afterOpt = getPlacementAfterOption(placementOpts);
      const sel = selectedOptions[i] ?? [];
      const hasAfter = afterOpt != null && sel.includes(afterOpt);
      const custom = (customOther[i] ?? "").trim();

      // If user chose "after" option, require both the option AND a node selection.
      if (hasAfter) return placementAnchorNode[i] != null;

      // Otherwise, allow either a structured option OR a custom "Other" answer.
      return sel.length > 0 || custom.length > 0;
    }
    const opts = getEffectiveOptions(q);
    if (opts) {
      const sel = selectedOptions[i];
      const custom = customOther[i] ?? "";
      return (Array.isArray(sel) && sel.length > 0) || (typeof custom === "string" && custom.trim().length > 0);
    }
    const a = answers[i];
    return a && typeof a === "string" && a.trim().length > 0;
  });

  const getSerializedAnswers = useCallback(() => {
    return questions.map((q, i) => {
      if (isWhichNodeQuestion(q, nodeIndex)) {
        const node = whichNodeSelection[i];
        return node?.label ?? node?.type ?? node?.key ?? "";
      }
      if (isPlacementQuestionWithNodePicker(q, nodeIndex)) {
        const placementOpts = extractOptions(q);
        const afterOpt = getPlacementAfterOption(placementOpts);
        const sel = selectedOptions[i] ?? [];
        const hasAfter = afterOpt != null && sel.includes(afterOpt);
        const custom = (customOther[i] ?? "").trim();

        if (hasAfter && placementAnchorNode[i]) {
          const node = placementAnchorNode[i];
          return `after ${node?.label ?? node?.type ?? node?.key ?? ""}`;
        }

        const parts = [...sel];
        if (custom) parts.push(custom);
        return parts.join(", ");
      }
      const opts = getEffectiveOptions(q);
      if (opts) {
        const sel = selectedOptions[i];
        const custom = (customOther[i] ?? "").trim();
        const parts = [...(Array.isArray(sel) ? sel : []), custom].filter(Boolean);
        return parts.join(", ");
      }
      return answers[i] ?? "";
    });
  }, [questions, nodeIndex, selectedOptions, placementAnchorNode, whichNodeSelection, customOther, answers]);

  const handleSubmit = () => {
    if (allAnswered) {
      onSubmit(getSerializedAnswers());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && allAnswered) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: 20, height: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="shrink-0 px-3 pb-2"
      >
        <div
          className={cn(
            "rounded-island-sm border border-[#1C3693]/20",
            "shadow-island-sm",
            "bg-gradient-to-b from-[#f8f9ff] to-white",
            "p-3 space-y-3",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1C3693]/10 flex items-center justify-center">
              <span className="text-[10px]">?</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700">
              Quick questions
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((question, idx) => {
              const whichNode = isWhichNodeQuestion(question, nodeIndex);
              const placementWithPicker = isPlacementQuestionWithNodePicker(question, nodeIndex);
              const effectiveOpts = getEffectiveOptions(question);

              const label = whichNode
                ? question.replace(/\s*I can see:.*$/i, "").trim()
                : effectiveOpts || placementWithPicker
                  ? cleanQuestion(question)
                  : question;
              const showCustom = customInputVisible[idx];
              const placementOpts = placementWithPicker ? extractOptions(question) : null;
              const afterOpt = placementOpts ? getPlacementAfterOption(placementOpts) : null;
              const showPlacementNodePicker =
                placementWithPicker && afterOpt != null && (selectedOptions[idx] ?? []).includes(afterOpt);

              if (whichNode) {
                return (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700 block leading-snug">
                      {idx + 1}. {label}
                    </label>
                    <select
                      value={getNodeOptionValue(whichNodeSelection[idx], nodeIndex)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const node = nodeIndex.find((n, i) => {
                          const k = n.key ?? n.id ?? `node-${i}`;
                          return String(k) === val;
                        }) ?? null;
                        updateWhichNode(idx, node);
                      }}
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200",
                        "bg-white focus:outline-none focus:ring-1",
                        "focus:ring-[#1C3693]/40 focus:border-[#1C3693]/40",
                      )}
                    >
                      <option value="">Choose a node...</option>
                      {nodeIndex.map((n, i) => {
                        const k = n.key ?? n.id ?? `node-${i}`;
                        const display = n.label ?? n.type ?? n.key ?? "Unnamed";
                        return (
                          <option key={k} value={String(k)}>
                            {display}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              }

              if (placementWithPicker && placementOpts) {
                return (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700 block leading-snug">
                      {idx + 1}. {label}
                    </label>
                    <PillSelectorMulti
                      options={placementOpts}
                      selected={selectedOptions[idx] ?? []}
                      onToggle={(option) => selectPillOption(idx, option, afterOpt)}
                      onOtherClick={() => toggleCustomInput(idx, true)}
                    />
                    {showPlacementNodePicker && (
                      <select
                        value={getNodeOptionValue(placementAnchorNode[idx], nodeIndex)}
                        onChange={(e) => {
                          const val = e.target.value;
                          const node = nodeIndex.find((n, i) => {
                            const k = n.key ?? n.id ?? `node-${i}`;
                            return String(k) === val;
                          }) ?? null;
                          updatePlacementAnchor(idx, node);
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200",
                          "bg-white focus:outline-none focus:ring-1",
                          "focus:ring-[#1C3693]/40 focus:border-[#1C3693]/40",
                        )}
                      >
                        <option value="">Choose which node to insert after...</option>
                        {nodeIndex.map((n, i) => {
                          const k = n.key ?? n.id ?? `node-${i}`;
                          const display = n.label ?? n.type ?? n.key ?? "Unnamed";
                          return (
                            <option key={k} value={String(k)}>
                              {display}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    {showCustom && (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={customOther[idx] ?? ""}
                          onChange={(e) => updateCustomOther(idx, e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your answer..."
                          autoFocus
                          className={cn(
                            "flex-1 px-2.5 py-1.5 text-[12px]",
                            "rounded-lg border border-slate-200",
                            "bg-white focus:outline-none focus:ring-1",
                            "focus:ring-[#1C3693]/40 focus:border-[#1C3693]/40",
                            "placeholder:text-slate-400",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => toggleCustomInput(idx, false)}
                          className="px-2 text-[10px] text-slate-400 hover:text-slate-600"
                          title="Hide custom input"
                        >
                          Hide
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (effectiveOpts) {
                return (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-700 block leading-snug">
                      {idx + 1}. {label}
                    </label>
                    <PillSelectorMulti
                      options={effectiveOpts}
                      selected={selectedOptions[idx] ?? []}
                      onToggle={(option) => togglePillOption(idx, option)}
                      onOtherClick={() => toggleCustomInput(idx, true)}
                    />
                    {showCustom && (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={customOther[idx] ?? ""}
                          onChange={(e) => updateCustomOther(idx, e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your answer..."
                          autoFocus
                          className={cn(
                            "flex-1 px-2.5 py-1.5 text-[12px]",
                            "rounded-lg border border-slate-200",
                            "bg-white focus:outline-none focus:ring-1",
                            "focus:ring-[#1C3693]/40 focus:border-[#1C3693]/40",
                            "placeholder:text-slate-400",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => toggleCustomInput(idx, false)}
                          className="px-2 text-[10px] text-slate-400 hover:text-slate-600"
                          title="Hide custom input"
                        >
                          Hide
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700 block leading-snug">
                    {idx + 1}. {label}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={answers[idx]}
                      onChange={(e) => updateAnswer(idx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer..."
                      autoFocus={idx === 0}
                      className={cn(
                        "flex-1 px-2.5 py-1.5 text-[12px]",
                        "rounded-lg border border-slate-200",
                        "bg-white focus:outline-none focus:ring-1",
                        "focus:ring-[#1C3693]/40 focus:border-[#1C3693]/40",
                        "placeholder:text-slate-400",
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5",
                "rounded-lg shadow-sm",
                "bg-[#1C3693] text-white text-[11px] font-semibold",
                "hover:bg-[#152b7a] transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              <icons.check className="w-3 h-3" />
              Submit
            </button>
            <button
              type="button"
              onClick={onSkip}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5",
                "rounded-lg text-[11px] font-medium",
                "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                "transition-colors",
              )}
            >
              Skip — use defaults
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TinyAIClarificationCard;
