import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CANVAS_SHORTCUTS } from "./useCanvasKeyboardShortcuts";

const ShortcutGroup = ({ title, shortcuts, collapsed, onToggle }) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
    >
      {title}
      {collapsed ? (
        <ChevronDown className="w-3.5 h-3.5" />
      ) : (
        <ChevronUp className="w-3.5 h-3.5" />
      )}
    </button>
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3 space-y-1">
            {shortcuts.map((shortcut, index) => (
              <ShortcutRow key={`${shortcut.key}-${shortcut.label}-${index}`} shortcut={shortcut} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ShortcutRow = ({ shortcut }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-gray-700">{shortcut.description}</span>
    <kbd
      className={cn(
        "px-2 py-1 text-xs font-mono rounded-md",
        "bg-gray-100 text-gray-600 border border-gray-200",
        "shadow-sm"
      )}
    >
      {shortcut.label}
    </kbd>
  </div>
);

const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      CANVAS_SHORTCUTS.ARROW_UP,
      CANVAS_SHORTCUTS.ARROW_DOWN,
      CANVAS_SHORTCUTS.ARROW_LEFT,
      CANVAS_SHORTCUTS.ARROW_RIGHT,
      CANVAS_SHORTCUTS.FIND,
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      CANVAS_SHORTCUTS.ENTER,
      CANVAS_SHORTCUTS.DELETE,
      CANVAS_SHORTCUTS.DUPLICATE,
      CANVAS_SHORTCUTS.ESCAPE,
    ],
  },
  {
    title: "History",
    shortcuts: [CANVAS_SHORTCUTS.UNDO, CANVAS_SHORTCUTS.REDO],
  },
  {
    title: "View",
    shortcuts: [
      CANVAS_SHORTCUTS.ZOOM_IN,
      CANVAS_SHORTCUTS.ZOOM_OUT,
      CANVAS_SHORTCUTS.ZOOM_FIT,
      CANVAS_SHORTCUTS.AUTO_ALIGN,
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      CANVAS_SHORTCUTS.ADD_NODE,
      CANVAS_SHORTCUTS.STICKY_NOTE,
    ],
  },
];

export function KeyboardShortcutsPanel({ open, onClose }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

  const toggleGroup = (title) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    if (open) {
      setSearchText("");
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  const filteredGroups = SHORTCUT_GROUPS.map((group) => ({
    ...group,
    shortcuts: group.shortcuts.filter(
      (s) =>
        !searchText ||
        s.description.toLowerCase().includes(searchText.toLowerCase()) ||
        s.label.toLowerCase().includes(searchText.toLowerCase())
    ),
  })).filter((group) => group.shortcuts.length > 0);

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
            className="flex flex-col items-center gap-4 outline-none"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="w-[32rem] max-w-[90vw] bg-white border-[3px] border-black rounded-[1.25rem] shadow-[0_1rem_2rem_-0.25rem_rgba(12,12,13,0.1),0_0.25rem_0.25rem_-0.25rem_rgba(12,12,13,0.05)] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search shortcuts..."
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
                <Keyboard className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm text-gray-700">
                  Keyboard Shortcuts
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No shortcuts found
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <ShortcutGroup
                      key={group.title}
                      title={group.title}
                      shortcuts={group.shortcuts}
                      collapsed={collapsedGroups[group.title]}
                      onToggle={() => toggleGroup(group.title)}
                    />
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">Ctrl+/</kbd> to toggle
                </p>
                <p className="text-xs text-gray-500">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

export function ShortcutHint({ shortcut, className }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono",
        "bg-gray-100 text-gray-600 rounded border border-gray-200",
        className
      )}
    >
      {shortcut}
    </kbd>
  );
}
