import React, { forwardRef } from "react";

const ComponentRenderer = forwardRef(
  ({ component: Component, ...props }, ref) => {
    return <Component ref={ref} {...props} />;
  }
);

export default ComponentRenderer;
