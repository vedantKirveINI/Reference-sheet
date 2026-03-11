import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function NodeFinder({ open, onClose, nodes, onSelectNode, onOpenNode }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes.slice(0, 20);
    const query = search.toLowerCase();
    return nodes.filter(
      (node) =>
        node.name?.toLowerCase().includes(query) ||
        node.type?.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query)
    );
  }, [nodes, search]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredNodes.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredNodes[selectedIndex]) {
            const node = filteredNodes[selectedIndex];
            onSelectNode(node);
            onOpenNode?.(node);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredNodes, selectedIndex, onSelectNode, onClose]
  );

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-start justify-center pt-[10rem] z-[9999]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(12px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[32rem] max-w-[90vw] bg-white border-[3px] border-black rounded-[1.25rem] shadow-[0_1rem_2rem_-0.25rem_rgba(12,12,13,0.1),0_0.25rem_0.25rem_-0.25rem_rgba(12,12,13,0.05)] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Find nodes"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search nodes by name or type..."
                className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-gray-400"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-sm text-gray-700">
                Find Node
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {filteredNodes.length} {filteredNodes.length === 1 ? 'node' : 'nodes'}
              </span>
            </div>

            <div
              ref={listRef}
              className="max-h-[300px] overflow-y-auto"
            >
              {filteredNodes.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No nodes found
                </div>
              ) : (
                filteredNodes.map((node, index) => (
                  <button
                    key={node.key}
                    onClick={() => {
                      onSelectNode(node);
                      onOpenNode?.(node);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                      "transition-colors duration-75 border-b border-gray-50 last:border-b-0",
                      index === selectedIndex
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {node._src && (
                      <img
                        src={node._src}
                        alt=""
                        className="w-8 h-8 rounded-lg object-contain bg-gray-100 p-1 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {node.name || node.type}
                      </div>
                      {node.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {node.description}
                        </div>
                      )}
                    </div>
                    {node.nodeNumber && (
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                        #{node.nodeNumber}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">Enter</kbd>
                Open node
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">Esc</kbd>
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
