import React, { useEffect, useRef } from "react";
// import { executeScroll } from "oute-ds-utils";
import { executeScroll } from "@src/module/ods";

import classes from "./TerminalPanel.module.css";

const TerminalPanel = ({ logData }) => {
  const scrollRef = useRef();
  useEffect(() => {
    if (logData?.length > 0) {
      executeScroll(scrollRef.current);
    }
  }, [logData?.length]);

  return logData.length > 0 ? (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "150px 1fr",
        padding: "0.5rem",
      }}
      data-testid="terminal-panel"
    >
      {logData.map(({ timestamp, message = "" }, index) => (
        <React.Fragment key={index}>
          <div>{timestamp}</div>
          <div
            style={{ overflow: "auto" }}
            ref={index === logData?.length - 1 ? scrollRef : null}
          >
            {message}
          </div>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <div className={classes["zero-screen"]}>
      Once you run this module logs will be shown here.
    </div>
  );
};

export default TerminalPanel;
