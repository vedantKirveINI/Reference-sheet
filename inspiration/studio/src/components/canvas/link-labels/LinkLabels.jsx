import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as go from "gojs";

export function LinkLabelEditor({
  linkData,
  position,
  onSave,
  onCancel,
  initialValue = "",
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSave = useCallback(() => {
    onSave(value);
  }, [value, onSave]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSave, onCancel]
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50"
      style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
    >
      <div className="flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter label..."
          className="h-8 w-40 text-sm"
        />
        <button
          onClick={handleSave}
          className="p-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>,
    document.body
  );
}

export function useLinkLabels(diagramRef) {
  const [editingLink, setEditingLink] = useState(null);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

  const startEditing = useCallback(
    (linkData) => {
      const diagram = diagramRef.current?.getDiagram();
      if (!diagram) return;

      const link = diagram.findLinkForData(linkData);
      if (!link) return;

      const midPoint = link.midPoint;
      const viewPoint = diagram.transformDocToView(midPoint);
      const rect = diagram.div.getBoundingClientRect();

      setEditorPosition({
        x: rect.left + viewPoint.x,
        y: rect.top + viewPoint.y,
      });
      setEditingLink(linkData);
    },
    [diagramRef]
  );

  const saveLabel = useCallback(
    (newLabel) => {
      if (!editingLink) return;

      const diagram = diagramRef.current?.getDiagram();
      if (!diagram) return;

      diagram.startTransaction("update link label");
      diagram.model.setDataProperty(editingLink, "label", newLabel);
      diagram.model.setDataProperty(editingLink, "metadata", {
        ...(editingLink.metadata || {}),
        wasRenamed: true,
      });
      diagram.commitTransaction("update link label");

      setEditingLink(null);
    },
    [editingLink, diagramRef]
  );

  const cancelEditing = useCallback(() => {
    setEditingLink(null);
  }, []);

  return {
    editingLink,
    editorPosition,
    startEditing,
    saveLabel,
    cancelEditing,
  };
}

export function createConditionLinkLabel(conditionSummary) {
  if (!conditionSummary) return "";

  if (typeof conditionSummary === "string") {
    return conditionSummary.length > 30
      ? conditionSummary.substring(0, 30) + "..."
      : conditionSummary;
  }

  if (conditionSummary.field && conditionSummary.operator) {
    const value = conditionSummary.value || "";
    const valueStr = typeof value === "object" ? JSON.stringify(value) : String(value);
    const truncatedValue = valueStr.length > 15 ? valueStr.substring(0, 15) + "..." : valueStr;
    return `${conditionSummary.field} ${conditionSummary.operator} ${truncatedValue}`;
  }

  return "";
}

export function ConditionLinkBadge({ condition, onClick, className }) {
  const label = createConditionLinkLabel(condition);

  if (!label) return null;

  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded",
        "text-[11px] font-normal",
        "bg-gray-100 text-gray-500 border border-gray-200",
        className
      )}
    >
      <span className="truncate max-w-[150px]">{label}</span>
    </span>
  );
}

export const LINK_LABEL_STYLES = {
  default: {
    font: "11px Inter, sans-serif",
    stroke: "#6B7280",
    background: "#F3F4F6",
    border: "#D1D5DB",
  },
  condition: {
    font: "11px Inter, sans-serif",
    stroke: "#6B7280",
    background: "#F3F4F6",
    border: "#D1D5DB",
  },
  else: {
    font: "11px Inter, sans-serif",
    stroke: "#9CA3AF",
    background: "#F9FAFB",
    border: "#E5E7EB",
  },
};
