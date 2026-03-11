import React from "react";
import "./ui.css";

const Card = React.forwardRef(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`ext-card ext-card-${variant} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "ExtCard";

const CardHeader = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`ext-card-header ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "ExtCardHeader";

const CardTitle = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`ext-card-title ${className}`.trim()}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "ExtCardTitle";

const CardContent = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`ext-card-content ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "ExtCardContent";

const CardFooter = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`ext-card-footer ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "ExtCardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
