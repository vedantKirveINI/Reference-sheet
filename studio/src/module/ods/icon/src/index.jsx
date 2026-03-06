import React, { forwardRef } from "react";
import getOuteIconComponent from './oute-icons/index.jsx';
import { getLucideIcon, hasLucideEquivalent } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const ODSIcon = forwardRef(
  (
    {
      outeIconName,
      outeIconProps = {},
      imageProps = {},
      buttonProps = {},
      children,
      onClick,
    },
    ref
  ) => {
    // Try to get Lucide icon first, fall back to custom OUTE icon
    const renderIconContent = () => {
      if (outeIconName) {
        // Check if Lucide equivalent exists
        if (hasLucideEquivalent(outeIconName)) {
          const lucideProps = {
            ref,
            className: cn("pointer-events-none", outeIconProps.className),
            size: outeIconProps.sx?.fontSize || outeIconProps.sx?.width || 24,
            color: outeIconProps.sx?.color || "currentColor",
            style: (outeIconProps.sx || {}),
            ...outeIconProps,
          };
          // Remove sx prop as Lucide doesn't use it
          delete lucideProps.sx;
          return getLucideIcon(outeIconName, lucideProps);
        }
        // Fall back to custom OUTE icon
        const customIconProps = {
          ...outeIconProps,
          ref,
          className: cn("pointer-events-none", outeIconProps.className),
          style: {
            ...(outeIconProps.sx || {}),
            ...outeIconProps.style,
          },
        };
        // Remove sx from custom icon props
        delete customIconProps.sx;
        return getOuteIconComponent(outeIconName, customIconProps);
      }
      if (Object.keys(imageProps).length > 0) {
        return <img {...imageProps} />;
      }
      return children;
    };

    const iconContent = renderIconContent();

    return (
      <>
        {onClick ? (
          <Button
            data-testid="ods-icon"
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn("p-0", buttonProps.className)}
            {...buttonProps}
          >
            {iconContent}
          </Button>
        ) : (
          iconContent
        )}
      </>
    );
  }
);

ODSIcon.displayName = "ODSIcon";

export default ODSIcon;
