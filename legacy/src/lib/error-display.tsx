import React from "react";

export const Error = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className="text-destructive text-xs mt-1" {...props}>{children}</span>
);
