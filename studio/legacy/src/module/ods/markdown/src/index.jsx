import React from "react";
import Markdown from "react-markdown";

const ODSMarkdown = ({ children, ...props }) => {
  return <Markdown {...props}>{children}</Markdown>;
};

export default ODSMarkdown;
