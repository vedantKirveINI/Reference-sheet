import React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const RenderMenuItem = ({ menu, index, onClose, useRadix = true }) => {
  const isDestructive = menu.destructive || menu.variant === "destructive";

  // For programmatic menus (useRadix=false), render plain HTML elements
  if (!useRadix) {
    if (menu.subMenu?.length > 0) {
      return (
        <React.Fragment key={menu.id || index}>
          <div className="relative">
            <div className={cn(
              "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
              isDestructive && "text-destructive"
            )}>
              {menu.leftAdornment && <span className="mr-2">{menu.leftAdornment}</span>}
              {menu.name}
              <span className="ml-auto text-xs">›</span>
            </div>
            {/* Submenu would need additional implementation */}
          </div>
          {menu.divider && <div className="-mx-1 my-1 h-px bg-border" />}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={menu.id || index}>
        <div
          className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            menu.disabled && "pointer-events-none opacity-50",
            isDestructive && "text-red-600 focus:text-red-600 focus:bg-red-50"
          )}
          onClick={() => {
            if (!menu.disabled) {
              if (menu.onClick) menu.onClick();
              if (onClose) onClose(null, "menuItemClick");
            }
          }}
          data-testid="ods-context-menu-item"
        >
          {menu.leftAdornment && (
            <span className="mr-2 flex items-center justify-center flex-shrink-0">
              {React.isValidElement(menu.leftAdornment) 
                ? React.cloneElement(menu.leftAdornment, {
                    className: cn(
                      "w-4 h-4",
                      isDestructive ? "text-red-500" : "text-gray-500",
                      menu.leftAdornment.props?.className
                    )
                  })
                : typeof menu.leftAdornment === "object" && menu.leftAdornment?.type
                ? React.createElement(menu.leftAdornment.type, {
                    ...menu.leftAdornment.props,
                    className: cn(
                      "w-4 h-4", 
                      isDestructive ? "text-red-500" : "text-gray-500",
                      menu.leftAdornment.props?.className
                    )
                  })
                : menu.leftAdornment
              }
            </span>
          )}
          <span className="flex-1 min-w-0">
            {typeof menu.name === "string" 
              ? menu.name 
              : React.isValidElement(menu.name)
              ? menu.name
              : menu.name
            }
          </span>
        </div>
        {menu.divider && <div className="-mx-1 my-1 h-px bg-border" />}
      </React.Fragment>
    );
  }

  // For regular context menus, use Radix components
  if (menu.subMenu?.length > 0) {
    return (
      <React.Fragment key={menu.id || index}>
        <ContextMenuSub>
          <ContextMenuSubTrigger className={cn(isDestructive && "text-destructive")}>
            {menu.leftAdornment && (
              <span className="mr-2 flex items-center justify-center">
                {React.isValidElement(menu.leftAdornment) 
                  ? React.cloneElement(menu.leftAdornment, {
                      className: cn(
                        "w-4 h-4",
                        menu.leftAdornment.props?.className
                      )
                    })
                  : typeof menu.leftAdornment === "object" && menu.leftAdornment?.type
                  ? React.createElement(menu.leftAdornment.type, {
                      ...menu.leftAdornment.props,
                      className: cn("w-4 h-4", menu.leftAdornment.props?.className)
                    })
                  : menu.leftAdornment
                }
              </span>
            )}
            {menu.name}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {menu.subMenu.map((subMenu, subIndex) => (
              <RenderMenuItem key={subMenu.id || subIndex} menu={subMenu} index={subIndex} onClose={onClose} useRadix={true} />
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        {menu.divider && <ContextMenuSeparator />}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment key={menu.id || index}>
      <ContextMenuItem
        disabled={menu.disabled}
        className={cn(
          "flex items-center cursor-pointer",
          isDestructive && "text-red-600 focus:text-red-600 focus:bg-red-50"
        )}
        onClick={() => {
          if (menu.onClick) menu.onClick();
          if (onClose) onClose(null, "menuItemClick");
        }}
        data-testid="ods-context-menu-item"
      >
        {menu.leftAdornment && (
          <span className="mr-2 flex items-center justify-center flex-shrink-0">
            {React.isValidElement(menu.leftAdornment) 
              ? React.cloneElement(menu.leftAdornment, {
                  className: cn(
                    "w-4 h-4",
                    isDestructive ? "text-red-500" : "text-gray-500",
                    menu.leftAdornment.props?.className
                  )
                })
              : menu.leftAdornment
            }
          </span>
        )}
        <span className="flex-1 min-w-0">
          {typeof menu.name === "string" 
            ? menu.name 
            : React.isValidElement(menu.name)
            ? menu.name
            : menu.name
          }
        </span>
      </ContextMenuItem>
      {menu.divider && <ContextMenuSeparator />}
    </React.Fragment>
  );
};

const ProgrammaticMenu = ({ menus, coordinates, onClose }) => {
  const menuRef = React.useRef(null);
  
  // Calculate adjusted position based on viewport boundaries
  const getAdjustedCoordinates = React.useCallback(() => {
    if (!coordinates) return coordinates;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimate menu dimensions (min-w-[8rem] = 128px, typical height ~150-200px)
    // We'll refine this after first render
    const estimatedMenuWidth = 180; // Conservative estimate
    const estimatedMenuHeight = menus ? menus.length * 36 + 16 : 200; // ~36px per item + padding
    
    let adjustedLeft = coordinates.left;
    let adjustedTop = coordinates.top;

    // Check if menu would go off right edge
    // When near right edge, position menu to the left, aligned with right edge of trigger
    if (coordinates.left + estimatedMenuWidth > viewportWidth - 8) {
      // For sidebar context menus, coordinates.left is typically the left edge of the avatar
      // We want to position menu to the left, aligned with the right edge of the trigger
      // Estimate trigger width (avatar is typically ~42px = 2.625rem)
      const triggerWidth = 42;
      adjustedLeft = coordinates.left + triggerWidth - estimatedMenuWidth;
      
      // Ensure menu doesn't go off left edge
      if (adjustedLeft < 8) {
        adjustedLeft = 8; // Small margin from left edge
      }
    }

    // Check if menu would go off bottom edge
    if (coordinates.top + estimatedMenuHeight > viewportHeight - 8) {
      // Position menu above the trigger point
      adjustedTop = coordinates.top - estimatedMenuHeight;
      
      // Ensure menu doesn't go off top edge
      if (adjustedTop < 8) {
        adjustedTop = 8; // Small margin from top edge
      }
    }

    return { left: adjustedLeft, top: adjustedTop };
  }, [coordinates, menus]);

  const [adjustedCoordinates, setAdjustedCoordinates] = React.useState(() => getAdjustedCoordinates());

  // Refine position after menu is rendered and we can measure actual size
  React.useEffect(() => {
    if (!menuRef.current || !coordinates) return;

    const refinePosition = () => {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let finalLeft = adjustedCoordinates.left;
      let finalTop = adjustedCoordinates.top;

      // Refine horizontal position based on actual width
      if (menuRect.right > viewportWidth - 8) {
        finalLeft = viewportWidth - menuRect.width - 8;
        if (finalLeft < 8) finalLeft = 8;
      }

      // Refine vertical position based on actual height
      if (menuRect.bottom > viewportHeight - 8) {
        finalTop = viewportHeight - menuRect.height - 8;
        if (finalTop < 8) finalTop = 8;
      }

      // Only update if position changed significantly (avoid infinite loops)
      if (Math.abs(finalLeft - adjustedCoordinates.left) > 1 || 
          Math.abs(finalTop - adjustedCoordinates.top) > 1) {
        setAdjustedCoordinates({ left: finalLeft, top: finalTop });
      }
    };

    // Small delay to ensure menu is rendered
    const timeoutId = setTimeout(refinePosition, 10);

    return () => clearTimeout(timeoutId);
  }, [coordinates, adjustedCoordinates]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (onClose) onClose(null, "close");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (onClose) onClose(null, "close");
      }
    };

    // Use a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!coordinates) return null;

  // Use adjusted coordinates if available, otherwise use original
  const finalCoordinates = adjustedCoordinates || coordinates;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 w-56 overflow-hidden rounded-md border border-gray-200 bg-popover p-1 text-popover-foreground shadow-lg"
      style={{ left: finalCoordinates.left, top: finalCoordinates.top }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      {menus?.map((menu, index) => (
        <RenderMenuItem key={menu.id || index} menu={menu} index={index} onClose={onClose} useRadix={false} />
      ))}
    </div>,
    document.body
  );
};

const ODSContextMenu = ({
  show = true,
  menus,
  anchorEl,
  coordinates,
  anchorOrigin = { vertical: "center", horizontal: "right" },
  onClose,
  children,
  className,
  ...props
}) => {
  if (!show) return null;

  if (anchorEl || coordinates) {
    let menuCoordinates = coordinates;
    if (anchorEl && !coordinates) {
      const rect = anchorEl.getBoundingClientRect();
      menuCoordinates = {
        left: rect.left + (anchorOrigin.horizontal === "right" ? rect.width : anchorOrigin.horizontal === "center" ? rect.width / 2 : 0),
        top: rect.top + (anchorOrigin.vertical === "bottom" ? rect.height : anchorOrigin.vertical === "center" ? rect.height / 2 : 0),
      };
    }
    return <ProgrammaticMenu menus={menus} coordinates={menuCoordinates} onClose={onClose} />;
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={cn(className)}>
        {menus?.map((menu, index) => (
          <RenderMenuItem key={menu.id || index} menu={menu} index={index} onClose={onClose} />
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ODSContextMenu;
