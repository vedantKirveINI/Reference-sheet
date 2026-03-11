import { useEffect } from "react";

const useKeydown = ({ saveButtonRef, showAddNodeDrawer, onToggleKeyboardShortcuts, onEmbedSaveAttempt }) => {
  useEffect(
    () => {
      const listener = (e) => {
        if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (onEmbedSaveAttempt) {
            onEmbedSaveAttempt();
            return;
          }
          saveButtonRef.current?.click();
        }
        if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
          const target = e.target;
          const isEditable =
            target?.tagName === "INPUT" ||
            target?.tagName === "TEXTAREA" ||
            target?.isContentEditable === true;
          if (!isEditable && !e.repeat) {
            e.preventDefault();
            showAddNodeDrawer?.({ via: "keyboard-shortcut" });
          }
        }
        if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onToggleKeyboardShortcuts?.();
        }
      };
      document.addEventListener("keydown", listener, false);
      return () => {
        document.removeEventListener("keydown", listener, false);
      };
    },
    [saveButtonRef, showAddNodeDrawer, onToggleKeyboardShortcuts, onEmbedSaveAttempt],
  );

  return null;
};

export default useKeydown;
