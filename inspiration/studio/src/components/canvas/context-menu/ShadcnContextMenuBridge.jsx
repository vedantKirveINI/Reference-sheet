import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  Copy,
  Play,
  Unlink,
  Plus,
  AlignJustify,
  StickyNote,
  FileText,
  User,
  Gift,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  OUTEEditIcon: Edit3,
  OUTETrashIcon: Trash2,
  OUTECopyIcon: Copy,
  OUTEPlayIcon: Play,
  OUTEAddIcon: Plus,
  OUTEDocumentIcon: StickyNote,
  OUTERuleIcon: FileText,
  OUTEPersonIcon: User,
  OUTEHandshakeIcon: Gift,
  OUTELogoutIcon: LogOut,
};

function getIconInfo(leftAdornment) {
  if (!leftAdornment) return { type: null };
  
  const props = leftAdornment?.props;
  if (!props) return { type: "element", element: leftAdornment };
  
  if (props.outeIconName && ICON_MAP[props.outeIconName]) {
    return { type: "lucide", icon: ICON_MAP[props.outeIconName] };
  }
  
  if (props.imageProps?.src) {
    return { type: "image", src: props.imageProps.src, style: props.imageProps.style };
  }
  
  return { type: "element", element: leftAdornment };
}

function useCollisionDetection(show, initialPosition, menuRef) {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const lastInitialRef = useRef({ left: 0, top: 0 });
  
  useEffect(() => {
    if (!show) return;
    
    const left = initialPosition?.left ?? 0;
    const top = initialPosition?.top ?? 0;
    
    if (lastInitialRef.current.left === left && lastInitialRef.current.top === top) {
      return;
    }
    lastInitialRef.current = { left, top };
    
    const checkPosition = () => {
      const menu = menuRef.current;
      if (!menu) {
        setPosition({ left, top });
        return;
      }
      
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newLeft = left;
      let newTop = top;
      
      if (newLeft + rect.width > viewportWidth - 8) {
        newLeft = viewportWidth - rect.width - 8;
      }
      if (newLeft < 8) newLeft = 8;
      
      if (newTop + rect.height > viewportHeight - 8) {
        newTop = viewportHeight - rect.height - 8;
      }
      if (newTop < 8) newTop = 8;
      
      setPosition({ left: newLeft, top: newTop });
    };
    
    requestAnimationFrame(checkPosition);
  }, [show, initialPosition?.left, initialPosition?.top, menuRef]);
  
  return position;
}

function MenuItem({ item, onClose }) {
  const isDanger = item.danger || item.sx?.color === "#d32f2f" || item.id === "delete-node" || item.id === "logout";
  const isDisabled = item.disabled;

  const renderIcon = () => {
    if (item.icon) {
      const IconComponent = item.icon;
      return (
        <IconComponent
          className={cn("w-4 h-4 shrink-0", isDanger ? "text-red-500" : "text-gray-500")}
        />
      );
    }
    
    const iconInfo = getIconInfo(item.leftAdornment);
    
    if (iconInfo.type === "lucide") {
      const IconComponent = iconInfo.icon;
      return (
        <IconComponent
          className={cn("w-4 h-4 shrink-0", isDanger ? "text-red-500" : "text-gray-500")}
        />
      );
    }
    
    if (iconInfo.type === "image") {
      return (
        <img
          src={iconInfo.src}
          alt=""
          className="w-5 h-5 shrink-0 object-contain"
          style={iconInfo.style}
        />
      );
    }
    
    if (iconInfo.type === "element") {
      return (
        <span className="w-5 h-5 shrink-0 flex items-center justify-center [&>*]:w-full [&>*]:h-full">
          {iconInfo.element}
        </span>
      );
    }
    
    return null;
  };

  return (
    <button
      onClick={() => {
        if (isDisabled) return;
        item.onClick?.();
        onClose?.();
      }}
      disabled={isDisabled}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
        "hover:bg-gray-100 transition-colors",
        isDanger && "text-red-600 hover:bg-red-50",
        isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      {renderIcon()}
      <span className="flex-1">{item.name}</span>
      {item.shortcut && (
        <span className="ml-auto text-xs text-gray-400 pl-4">{item.shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-gray-200 my-1" />;
}

export function ShadcnContextMenuBridge({
  show,
  menus = [],
  coordinates,
  onClose,
}) {
  const menuRef = useRef(null);
  const ignoreNextContextMenuRef = useRef(false);
  const position = useCollisionDetection(show, coordinates || { left: 0, top: 0 }, menuRef);
  
  useEffect(() => {
    if (show) {
      ignoreNextContextMenuRef.current = true;
    }
  }, [show]);
  
  const handleOverlayClick = (e) => {
    onClose?.();
  };
  
  const handleOverlayContextMenu = (e) => {
    e.preventDefault();
    if (ignoreNextContextMenuRef.current) {
      ignoreNextContextMenuRef.current = false;
      return;
    }
    onClose?.();
  };
  
  if (!show || !coordinates) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <div
            className="fixed inset-0 z-[1000]"
            onClick={handleOverlayClick}
            onContextMenu={handleOverlayContextMenu}
          />
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[1001]"
            style={{
              left: position.left,
              top: position.top,
            }}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] overflow-hidden">
              {menus.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <MenuItem item={item} onClose={onClose} />
                  {item.divider && <MenuDivider />}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShadcnContextMenuBridge;
