import React from "react";

const ComponentRenderer = ({ component: Component, ...props }) => {
  return <Component {...props} />;
};

export default ComponentRenderer;
