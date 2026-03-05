import React from "react";
// import DataTraversal from "./DataTraversal";
// import Accordion from "oute-ds-accordion";
// import { ODSLabel as Label } from '@src/module/ods';
import { ODSAccordion as Accordion, ODSLabel as Label } from "@src/module/ods";
import styles from "./CommonExecutionResult.module.css";
import DataRenderer from "./data-renderer/DataRenderer";
import CopyContent from "./CopyContent";

const CommonExecutionResult = ({ inputs, outputs, node }) => {
  return (
    <div className={styles.container}>
      <div>
        <Accordion
          content={
            <div style={{ padding: "0.5rem" }}>
              <DataRenderer
                data={inputs?.response || inputs}
                objectAsContainers={false}
              />
            </div>
          }
          title={
            <div className={styles.label_container}>
              <Label variant="capitalize" className={styles.label}>
                INPUTS
              </Label>
              <CopyContent data={JSON.stringify(inputs?.response || inputs)} />
            </div>
          }
        />
      </div>
      <div>
        <Accordion
          defaultExpanded
          content={
            <div style={{ padding: "0.5rem" }}>
              <DataRenderer
                data={outputs?.response || outputs}
                objectAsContainers={
                  !node?.isRecord && node.type !== "Integration"
                }
                isRecord={node?.isRecord}
              />
            </div>
          }
          title={
            <div className={styles.label_container}>
              <Label variant="capitalize" className={styles.label}>
                OUTPUT
              </Label>
              <CopyContent
                data={JSON.stringify(outputs?.response || outputs)}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CommonExecutionResult;
