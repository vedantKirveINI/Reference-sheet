import { useState, useCallback, useRef, useEffect } from "react";

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [menuType, setMenuType] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const openMenu = useCallback((type, data, coords) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    setMenuType(type);
    setMenuData(data);
    setPosition(coords);
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback((delay = 0) => {
    if (delay > 0) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setMenuType(null);
        setMenuData(null);
      }, delay);
    } else {
      setIsOpen(false);
      setMenuType(null);
      setMenuData(null);
    }
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  return {
    isOpen,
    position,
    menuType,
    menuData,
    openMenu,
    closeMenu,
    cancelClose,
  };
}

export const CONTEXT_MENU_TYPES = {
  NODE: "node",
  LINK: "link",
  BACKGROUND: "background",
};

export function createContextMenuHandlers(contextMenuHook, canvasRef) {
  const { openMenu } = contextMenuHook;

  return {
    onNodeContextClicked: (e, node, viewCoords) => {
      openMenu(CONTEXT_MENU_TYPES.NODE, node, {
        x: viewCoords.x,
        y: viewCoords.y,
      });
    },
    onLinkContextClicked: (e, link, viewCoords) => {
      openMenu(CONTEXT_MENU_TYPES.LINK, link.data, {
        x: viewCoords.x,
        y: viewCoords.y,
      });
    },
    onBackgroundContextClicked: (e, viewCoords) => {
      openMenu(CONTEXT_MENU_TYPES.BACKGROUND, null, {
        x: viewCoords.x,
        y: viewCoords.y,
      });
    },
  };
}
