import { useState, useCallback, useRef, useEffect } from "react";

export const useImageClickPopper = () => {
  const [popperOpen, setPopperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const popperContentRef = useRef<HTMLDivElement | null>(null);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    setAnchorEl(target);
    anchorRef.current = target;
    setPopperOpen(true);
  }, []);

  const handleClosePopper = useCallback(() => {
    setPopperOpen(false);
    setAnchorEl(null);
    anchorRef.current = null;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!popperOpen) return;

      const target = event.target as Node;

      // Check if click is inside popper content
      const isInsidePopperContent = popperContentRef.current?.contains(target);

      // Also check if click is on any parent element of the popper content (including the MUI Paper wrapper)
      let isInsidePopperContainer = false;
      if (popperContentRef.current) {
        // Check if target or any of its parents is the popper content or its parent (MUI Paper)
        const popperContentElement = popperContentRef.current;
        const popperPaperElement = popperContentElement.parentElement;

        let currentElement = target as HTMLElement | null;
        while (currentElement) {
          if (
            currentElement === popperContentElement ||
            currentElement === popperPaperElement
          ) {
            isInsidePopperContainer = true;
            break;
          }
          currentElement = currentElement.parentElement;
        }
      }

      // Close only if click is outside popper content and its container
      if (!isInsidePopperContent && !isInsidePopperContainer) {
        handleClosePopper();
      }
    };

    if (popperOpen) {
      // Use a slight delay to ensure the popper is rendered and refs are attached
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popperOpen, handleClosePopper]);

  return {
    popperOpen,
    anchorEl,
    popperContentRef,
    handleImageClick,
    handleClosePopper,
  };
};
