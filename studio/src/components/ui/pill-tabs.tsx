import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const PillTabs = TabsPrimitive.Root;

const PillTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "p-1 gap-0.5",
    md: "p-1.5 gap-1",
    lg: "p-2 gap-1.5",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-xl border",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}
      {...props}
    />
  );
});
PillTabsList.displayName = "PillTabsList";

const PillTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "px-3 py-2 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-1.5",
    lg: "px-5 py-2.5 text-sm gap-2",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "text-zinc-500 hover:text-zinc-700 hover:bg-black/[0.06]",
        "data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
PillTabsTrigger.displayName = "PillTabsTrigger";

const PillTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
PillTabsContent.displayName = "PillTabsContent";

export { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent };
