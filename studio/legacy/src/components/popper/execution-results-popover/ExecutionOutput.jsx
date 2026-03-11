import React from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
import styles from "./ExecutionResults.module.css";
// import JsonViewer from "oute-ds-json-viewer";
import { ODSAccordion as Accordion, ODSLabel as Label, JsonViewer } from "@src/module/ods";

const ExecutionOutput = ({ data, defaultExpanded }) => {
  return (
    <Accordion
      title={<Label variant="capital">Output</Label>}
      summaryProps={{
        sx: { background: "none" },
      }}
      defaultExpanded={defaultExpanded}
      sx={{ border: "none", padding: "0 2rem" }}
      content={
        <div className={styles.executionOutput}>
          {data && typeof data === "object" ? (
            <JsonViewer data={data} />
          ) : (
            <pre>{data ? JSON.stringify(data, null, 2) : "No output"}</pre>
          )}
        </div>
      }
    />
  );
};
export default ExecutionOutput;
