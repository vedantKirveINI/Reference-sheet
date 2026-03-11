"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface AdvancedLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  labelText?: string
  labelSubText?: string
  leftAdornment?: React.ReactNode
  rightAdornment?: React.ReactNode
  fullWidth?: boolean
  required?: boolean
  showCheckbox?: boolean
  labelProps?: React.ComponentProps<typeof Label> & {
    variant?: string
    fontWeight?: string
    color?: string
  }
  subTextProps?: React.ComponentProps<typeof Label>
  disabled?: boolean
  children?: React.ReactNode
}

const AdvancedLabel = React.forwardRef<HTMLDivElement, AdvancedLabelProps>(
  (
    {
      labelText,
      labelSubText,
      leftAdornment,
      rightAdornment,
      fullWidth = false,
      required = false,
      showCheckbox = false,
      labelProps = {},
      subTextProps = {},
      disabled = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const {
      variant,
      fontWeight,
      color,
      className: labelClassName,
      ...restLabelProps
    } = labelProps

    // Map variant to Tailwind classes
    const getVariantClasses = () => {
      switch (variant) {
        case "h6":
          return "text-base font-semibold"
        case "var(--body2)":
        case "body2":
          return "text-sm font-normal"
        case "subtitle1":
          return "text-sm font-medium"
        case "subtitle2":
          return "text-xs font-medium"
        default:
          return "text-sm font-medium"
      }
    }

    const mainLabelClasses = cn(
      getVariantClasses(),
      fontWeight && `font-${fontWeight}`,
      color && `text-[${color}]`,
      labelClassName
    )

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={style}
        {...props}
      >
        {(showCheckbox || leftAdornment) && (
          <div
            className="flex items-center flex-shrink-0"
            style={{ minWidth: showCheckbox || leftAdornment ? "1.875rem" : 0 }}
          >
            {leftAdornment}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <Label
            className={cn(mainLabelClasses, "truncate")}
            title={labelText || (typeof children === "string" ? children : undefined)}
            {...restLabelProps}
          >
            {labelText || children}
            {required && <sup className="text-red-500 ml-0.5">*</sup>}
          </Label>
          {labelSubText && (
            <Label
              className={cn(
                "text-xs text-gray-600 truncate",
                subTextProps.className
              )}
              title={labelSubText}
              {...subTextProps}
            >
              {labelSubText}
            </Label>
          )}
        </div>
        {rightAdornment && (
          <div className="flex items-center flex-shrink-0">
            {rightAdornment}
          </div>
        )}
      </div>
    )
  }
)
AdvancedLabel.displayName = "AdvancedLabel"

export { AdvancedLabel }

