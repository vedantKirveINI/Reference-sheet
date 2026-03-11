import React from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
import styles from "./ExecutionResults.module.css";
// import JsonViewer from "oute-ds-json-viewer";
import { ODSAccordion as Accordion, ODSLabel as Label, JsonViewer } from "@src/module/ods";

const ExecutionInput = ({ data }) => {
  return (
    <Accordion
      title={<Label variant="capital">Input</Label>}
      summaryProps={{
        sx: { background: "none" },
      }}
      sx={{ border: "none", padding: "0 2rem" }}
      content={
        <div className={styles.executionInput}>
          {data && typeof data === "object" ? (
            <JsonViewer data={data} />
          ) : (
            <pre>{data ? JSON.stringify(data, null, 2) : "No input"} </pre>
          )}
        </div>
      }
    />
  );
};

export default ExecutionInput;
