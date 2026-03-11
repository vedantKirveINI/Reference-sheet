"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  label?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, label, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        className={className}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {label || children}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }

