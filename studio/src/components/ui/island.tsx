import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const islandVariants = cva(
  "bg-surface-base border border-black/[0.04] transition-all duration-200",
  {
    variants: {
      elevation: {
        flat: "shadow-island-sm",
        base: "shadow-island",
        elevated: "shadow-island-md hover:shadow-island-hover",
        floating: "shadow-island-lg",
        top: "shadow-island-xl",
      },
      rounded: {
        sm: "rounded-island-sm",
        default: "rounded-island",
        lg: "rounded-island-lg",
        xl: "rounded-island-xl",
      },
      glass: {
        true: "bg-surface-elevated backdrop-blur-island",
        false: "",
      },
    },
    defaultVariants: {
      elevation: "base",
      rounded: "default",
      glass: false,
    },
  }
)

export interface IslandProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof islandVariants> {}

export function Island({ 
  className, 
  elevation, 
  rounded, 
  glass, 
  ...props 
}: IslandProps) {
  return (
    <div
      className={cn(islandVariants({ elevation, rounded, glass }), className)}
      {...props}
    />
  )
}

