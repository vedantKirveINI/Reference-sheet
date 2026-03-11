import React, { useCallback, useRef } from "react";
import { ODSLabel } from "../../index.js";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const ODSBreadcrumbs = ({
  breadcrumbs = [],
  enableNavigation = true,
  variant = "body1",
  maxItems = 2,
  ...props
}) => {
  const menuAchorRef = useRef();
  const clickHandler = useCallback(
    (e, b) => {
      e.preventDefault();
      b?.onClick && b.onClick(e);
      enableNavigation &&
        b?.navigateToPath &&
        window.history.pushState({}, "", b?.navigateToPath);
    },
    [enableNavigation]
  );

  const getLabel = (b, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return (
      <ODSLabel
        key={`label_${b.label}_${index}`}
        className={cn(
          "w-auto max-w-full",
          enableNavigation ? "cursor-pointer" : "cursor-default"
        )}
        ref={index === breadcrumbs.length - 1 ? menuAchorRef : null}
        variant={variant}
        onClick={(e) => clickHandler(e, b)}
        style={{
          color: isLast ? "rgb(38, 50, 56)" : "rgb(96, 125, 139)",
        }}
      >
        {b?.label}
      </ODSLabel>
    );
  };

  return (
    <Breadcrumb maxItems={maxItems} {...props}>
      {breadcrumbs?.map((b, index) => {
        const isLast = index === breadcrumbs.length - 1;
        if (enableNavigation && !isLast) {
          return (
            <BreadcrumbItem key={`item_${b.label}_${index}`}>
              <BreadcrumbLink
                href="#"
                onClick={(e) => clickHandler(e, b)}
                className="hover:text-foreground"
              >
                {getLabel(b, index)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        } else {
          return (
            <BreadcrumbItem key={`item_${b.label}_${index}`}>
              {isLast ? (
                <BreadcrumbPage>{getLabel(b, index)}</BreadcrumbPage>
              ) : (
                getLabel(b, index)
              )}
            </BreadcrumbItem>
          );
        }
      })}
    </Breadcrumb>
  );
};

export default ODSBreadcrumbs;
