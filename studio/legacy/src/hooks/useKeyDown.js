import { useEffect } from "react";

const useKeydown = ({ saveButtonRef, showAddNodeDrawer, canvasRef }) => {
  useEffect(
    () => {
      const listener = (e) => {
        if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          saveButtonRef.current?.click();
        }
        if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          showAddNodeDrawer?.({ via: "keyboard-shortcut" });
        }
        if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault();
          canvasRef?.current?.undo?.();
        }
        if (
          (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
          (e.key.toLowerCase() === "y" && (e.ctrlKey || e.metaKey))
        ) {
          e.preventDefault();
          canvasRef?.current?.redo?.();
        }
      };
      document.addEventListener("keydown", listener, false);
      return () => {
        document.removeEventListener("keydown", listener, false);
      };
    },
    [showAddNodeDrawer, canvasRef],
  );

  return null;
};

export default useKeydown;
