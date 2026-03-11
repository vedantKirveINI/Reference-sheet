import React from "react";

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

const SafeHTMLRenderer: React.FC<SafeHTMLRendererProps> = ({
  html,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default SafeHTMLRenderer;
