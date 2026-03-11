import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const ODSButton = forwardRef(
  (
    {
      label,
      children,
      className,
      toolbarPlacement, // Custom prop - filter out
      disableHover, // Custom prop - filter out
      onLabelChange, // Custom prop - filter out
      testId, // Custom prop - convert to data-testid
      theme, // Custom prop - filter out (if not used)
      state, // Custom prop - "loading" shows spinner and disables
      startIcon, // Custom prop - render before content, not passed to DOM
      endIcon, // Custom prop - render after content, not passed to DOM
      "data-testid": dataTestIdProp, // Extract existing data-testid
      ...props
    },
    ref,
  ) => {
    // Convert testId to data-testid if provided, otherwise use existing or default
    const dataTestId = testId || dataTestIdProp || "ods-button";
    const isLoading = state === "loading";
    const { disabled, ...restProps } = props;

    return (
      <Button
        ref={ref}
        data-testid={dataTestId}
        className={cn("flex items-center gap-2", className)}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        {...restProps}
      >
        {isLoading && <Spinner className="size-4 shrink-0" />}
        {startIcon && !isLoading && <span className="inline-flex shrink-0">{startIcon}</span>}
        {label || children}
        {endIcon && !isLoading && <span className="inline-flex shrink-0">{endIcon}</span>}
      </Button>
    );
  },
);

ODSButton.displayName = "ODSButton";

export default ODSButton;
