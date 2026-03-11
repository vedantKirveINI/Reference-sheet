import React from "react";
import { getLogColor } from '../utils/terminalUtils.jsx';
import styles from '../Terminal.module.css';
// import JsonViewer from "oute-ds-json-viewer";
import { JsonViewer } from "../../../index.js";

const TerminalOutput = ({
  history,
  terminalRef,
  handleScroll,
  outputStyle,
}) => {
  return (
    <div
      ref={terminalRef}
      className={styles.terminalOutput}
      onScroll={handleScroll}
      style={outputStyle}
    >
      {history.map((line) => (
        <div
          key={line.id}
          className={
            line.type === "divider" ? styles.logLineDivider : styles.logLine
          }
          style={{
            color: getLogColor(line.type),
          }}
        >
          {line.messageType === "json" && typeof line.content === "object" ? (
            <div>
              {line.timestamp && (
                <span style={{ color: getLogColor(line.type) }}>
                  [{line.timestamp}]{" "}
                </span>
              )}
              <JsonViewer data={line.content} />
            </div>
          ) : (
            line.content
          )}
        </div>
      ))}
    </div>
  );
};

export default TerminalOutput;
