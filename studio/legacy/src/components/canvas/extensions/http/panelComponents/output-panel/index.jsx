import React, { useEffect, useRef, useState } from "react";
// import ODSAccordion from "oute-ds-accordion";
// import Button from "oute-ds-button";
// import CircularProgress from "oute-ds-circular-progress";
// import ODSLabel from "oute-ds-label";
import { ODSAccordion, ODSButton as Button, ODSCircularProgress as CircularProgress, ODSLabel } from "@src/module/ods";

import StructurePanel from "./structure-panel";
import TerminalPanel from "./terminal-panel";

import classes from "./OutputPanel.module.css";

const OutputPanel = ({
  structurePanelData,
  terminalPanelData = [],
  setStructurePanelData,
  setTerminalPanelData,
  isRunning,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [running, setRunning] = useState("not_initialized");

  const structurePanelRef = useRef();

  const AccordionHeader = ({ headerName, rightAdornment }) => {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.5rem",
        }}
        data-testid="accordion-header"
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <ODSLabel variant="body1">{headerName}</ODSLabel>
          {running === "started" ? <CircularProgress size={24} /> : null}
        </div>
        {rightAdornment ? rightAdornment : <></>}
      </div>
    );
  };

  useEffect(() => {
    setRunning(isRunning);
    if (isRunning === "started" || isRunning === "failed") {
      setExpanded(false);
    } else if (isRunning === "not_initialized" || isRunning === "success") {
      setExpanded(true);
    }
  }, [isRunning]);
  return (
    <div
      className={classes["output-panel-container"]}
      data-testid="output-panel"
    >
      <ODSAccordion
        title={
          <AccordionHeader
            headerName={"STRUCTURE"}
            rightAdornment={
              <Button
                size="small"
                label="Modify"
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  structurePanelRef?.current?.openJsonEditor();
                }}
              />
            }
          />
        }
        expanded={expanded}
        onChange={() => {
          setExpanded((prevState) => !prevState);
        }}
        content={
          <StructurePanel
            ref={structurePanelRef}
            data={structurePanelData}
            onModifyResponse={(json) => {
              setStructurePanelData(json);
            }}
          />
        }
        data-testid="structure-accordion"
      />
      <ODSAccordion
        title={
          <AccordionHeader
            headerName={"TERMINAL"}
            rightAdornment={
              <Button
                size="small"
                label="Clear"
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  setTerminalPanelData([]);
                }}
              />
            }
          />
        }
        expanded={!expanded}
        onChange={() => {
          setExpanded((prevState) => !prevState);
        }}
        content={<TerminalPanel logData={terminalPanelData} />}
        data-testid="terminal-accordion"
      />
    </div>
  );
};

export default OutputPanel;
