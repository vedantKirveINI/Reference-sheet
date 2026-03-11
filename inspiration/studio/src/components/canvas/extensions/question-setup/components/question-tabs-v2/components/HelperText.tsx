import * as React from "react";
import { cn } from "@/lib/utils";

interface HelperTextProps {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}

const HelperText = ({ children, error, className }: HelperTextProps) => {
  if (!children) return null;

  return (
    <p
      className={cn(
        "text-xs mt-1",
        error ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
};

export default HelperText;
