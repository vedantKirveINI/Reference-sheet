import React from "react";
// import CodeBlock from "oute-ds-code-block";
import { ODSCodeBlock as CodeBlock } from "../../index.js";
/**
 *
 * config = {
 *  type: section | header | description | code
 *  direction: <type = section> row | column (default: column)
 *  allowDownload: <type = code> shows download icon to download code
 *  dowloadFilename: <type = code> downloaded filename (default: "code.txt")
 *  value: <type = header | description | code> content of the section
 *  childs: <type = section> array of sections
 * }
 *
 */
const DynamicSection = ({ config }) => {
  const renderChild = (config) => {
    switch (config?.type) {
      case "header":
        return (
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              ...config?.style,
              opacity: config.disabled ? 0.5 : 1,
              pointerEvents: config.disabled ? "none" : "auto",
            }}
          >
            {config.value}
          </div>
        );
      case "description":
        return (
          <div
            style={{
              fontSize: "1rem",
              ...config?.style,
              opacity: config.disabled ? 0.5 : 1,
              pointerEvents: config.disabled ? "none" : "auto",
            }}
          >
            {config.value}
          </div>
        );
      case "code":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              ...config?.style,
            }}
          >
            <CodeBlock
              allowDownload={config.allowDownload || false}
              dowloadFilename={config.dowloadFilename || "code"}
              disabled={config.disabled || false}
            >
              {config.value}
            </CodeBlock>
          </div>
        );
      case "section":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: config.direction || "column",
              gap: "1rem",
              opacity: config.disabled ? 0.5 : 1,
              pointerEvents: config.disabled ? "none" : "auto",
            }}
          >
            {config.childs.map((subChild, index) => (
              <div key={index}>{renderChild(subChild)}</div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderChild(config)}</>;
};

export default DynamicSection;
