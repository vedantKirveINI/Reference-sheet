import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        contained:
          "bg-[var(--primary-500)] text-white shadow hover:bg-[var(--primary-600)] font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
        outlined:
          "border border-[var(--blue-gray-200)] bg-white shadow-sm hover:bg-[var(--blue-gray-50)] text-[var(--blue-gray-800)] font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
        text:
          "hover:bg-[var(--blue-gray-50)] text-[var(--primary-500)] bg-transparent font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
        black:
          "bg-[#212121] text-white hover:bg-[linear-gradient(0deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.20)_100%),#212121] disabled:bg-[#BABABA] disabled:text-[#6A6A6A] font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
        "black-outlined":
          "border-[0.75px] border-[#212121] bg-white text-[#212121] hover:bg-[rgba(33,33,33,0.20)] disabled:bg-white disabled:text-[#BABABA] disabled:border-[#BABABA] font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
        "black-text":
          "bg-transparent text-[#212121] hover:bg-[rgba(33,33,33,0.20)] disabled:text-[#BABABA] font-semibold tracking-[0.0781rem] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-300)] focus-visible:ring-offset-2",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
        small: "h-[1.75rem] text-[0.75rem] px-[1rem] gap-[1rem]",
        medium: "h-[2.25rem] text-[1rem] px-[1rem] gap-[1rem]",
        large: "h-[2.75rem] text-[1rem] px-[1rem] gap-[1rem] min-w-[7.5rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
