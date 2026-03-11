import React, { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import * as LucideIcons from "lucide-react";
import { Search, X, Command } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { SEQUENCE_NODE_DESCRIPTIONS, searchSequenceNodes } from "./nodeDescriptions";
import { SEQUENCE_NODE_TYPES, SEQUENCE_NODE_COLORS } from "../constants";

const CATEGORY_ORDER = ["trigger", "action", "flow"];
const CATEGORY_LABELS = {
  trigger: "Triggers",
  action: "Actions",
  flow: "Flow Control",
};

const NodeIcon = ({ iconName, className }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Circle;
  return <Icon className={className} />;
};

const NodeCard = ({ node, isSelected, onClick }) => {
  const colors = SEQUENCE_NODE_COLORS[node.id] || {
    bg: "#F5F5F5",
    border: "#9E9E9E",
    accent: "#616161",
  };

  return (
    <button
      onClick={() => onClick(node)}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-all duration-150",
        "border-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1",
        isSelected
          ? "ring-2 ring-[#1C3693] ring-offset-1 shadow-md"
          : "hover:border-gray-300"
      )}
      style={{
        backgroundColor: colors.bg,
        borderColor: isSelected ? "#1C3693" : colors.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: colors.accent }}
        >
          <NodeIcon iconName={node.icon} className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 text-sm">{node.title}</h4>
            <Badge
              variant="outline"
              className="text-xs capitalize"
              style={{ borderColor: colors.border, color: colors.accent }}
            >
              {node.category}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{node.tagline}</p>
        </div>
      </div>
    </button>
  );
};

export const SequenceCommandPalette = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredNodes = useMemo(() => {
    return searchSequenceNodes(searchQuery).filter(node => !node.hidden);
  }, [searchQuery]);

  const groupedNodes = useMemo(() => {
    const groups = {};
    filteredNodes.forEach((node) => {
      if (!groups[node.category]) {
        groups[node.category] = [];
      }
      groups[node.category].push(node);
    });
    return groups;
  }, [filteredNodes]);

  const flatNodes = useMemo(() => {
    const result = [];
    CATEGORY_ORDER.forEach((category) => {
      if (groupedNodes[category]) {
        result.push(...groupedNodes[category]);
      }
    });
    return result;
  }, [groupedNodes]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatNodes.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatNodes.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatNodes[selectedIndex]) {
            handleNodeSelect(flatNodes[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatNodes, selectedIndex, onClose]
  );

  const handleNodeSelect = useCallback(
    (node) => {
      if (node.isPaired && node.pairedWith) {
        const pairedNode = SEQUENCE_NODE_DESCRIPTIONS[node.pairedWith];
        onAddNode({
          ...node,
          paired: true,
          pairedNodeDescription: pairedNode,
        });
      } else {
        onAddNode(node);
      }
      onClose();
      setSearchQuery("");
    },
    [onAddNode, onClose]
  );

  const handleOpenChange = useCallback(
    (open) => {
      if (!open) {
        onClose();
        setSearchQuery("");
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Add Sequence Node</DialogTitle>
        </VisuallyHidden.Root>

        <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-8"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-3 space-y-4">
            {CATEGORY_ORDER.map((category) => {
              const nodes = groupedNodes[category];
              if (!nodes || nodes.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <div className="space-y-2">
                    {nodes.map((node) => {
                      const nodeIndex = flatNodes.findIndex(
                        (n) => n.id === node.id
                      );
                      return (
                        <NodeCard
                          key={node.id}
                          node={node}
                          isSelected={nodeIndex === selectedIndex}
                          onClick={handleNodeSelect}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {flatNodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No nodes found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SequenceCommandPalette;
