import React from "react";
import ReactJson from "react-json-view";
import { chromeTheme } from './json-viewer-theme-constant.jsx';

const JsonViewer = ({ data, ...props }) => {
  return (
    <ReactJson
      src={data}
      theme={chromeTheme}
      enableClipboard={(copy) =>
        navigator.clipboard.writeText(
          typeof copy === "object"
            ? JSON.stringify(copy?.src, null, 2)
            : copy.src
        )
      }
      quotesOnKeys={false}
      collapseStringsAfterLength={50}
      displayDataTypes={false}
      displayObjectSize={false}
      style={{
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "13px",
        lineHeight: "1.4",
        padding: "4px",
      }}
      collapsed={1}
      name={false}
      {...props}
    />
  );
};

export default JsonViewer;
