import { useMemo } from "react";
// import Label from "oute-ds-label";
// import ODSIcon from "oute-ds-icon";
import { ODSLabel as Label, ODSIcon } from "@src/module/ods";
import CopyContent from "../../../CopyContent";
import DataSection from "../DataSection";
import startCase from "lodash/startCase";

import styles from "./styles.module.css";
import useAccordion from "../../useAccordion";

const keysHiddenInBody = ["sheet_name", "table_name", "view_name"];

const formatValue = (value) => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") {
    if (value.length > 24) {
      return `${value.slice(0, 21)}…`;
    }
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} item${value.length !== 1 ? "s" : ""}`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `${keys.length} field${keys.length !== 1 ? "s" : ""}`;
  }

  return String(value);
};

function DataCluster({ label, payload, isOutput = false }) {
  const entries = useMemo(() => Object.entries(payload || {}), [payload]);

  const bodyEntries = useMemo(() => {
    return isOutput
      ? entries
      : entries.filter(([key]) => !keysHiddenInBody.includes(key));
  }, [isOutput, entries]);

  const { isOpen, accordionRef, contentRef, handleAccordionToggle } =
    useAccordion({ defaultOpen: isOutput });

  if (entries.length === 0) {
    return (
      <section className={`${styles.cluster} ${styles.emptyCluster}`}>
        <header className={styles.clusterHeader}>
          <Label variant="uppercase" className={styles.clusterLabel}>
            {label}
          </Label>
        </header>
        <p className={styles.emptyState}>No data available.</p>
      </section>
    );
  }

  return (
    <section
      className={`${styles.cluster} ${!isOpen ? styles.clusterCollapsed : ""}`}
      ref={accordionRef}
    >
      <header className={styles.clusterHeader} onClick={handleAccordionToggle}>
        <Label variant="uppercase" className={styles.clusterLabel}>
          {label}
        </Label>

        <div className={styles.clusterHeaderActions}>
          <span className={styles.copyAnchor}>
            <CopyContent data={JSON.stringify(payload, null, 2)} />
          </span>
          <span
            className={`${styles.cheveronIcon} 
            ${isOpen ? styles.cheveronIconExpanded : ""}
            `}
          >
            <ODSIcon outeIconName="OUTEExpandMoreIcon" />
          </span>
        </div>
      </header>

      <div className={styles.clusterContent} ref={contentRef}>
        {!isOutput && (
          <div className={`${styles.clusterSummary}`}>
            {entries.slice(0, 4).map(([key, value]) => (
              <div key={key} className={styles.summaryTile}>
                <span className={styles.summaryKey}>{startCase(key)}</span>
                <span className={styles.summaryValue}>
                  {formatValue(value)}
                </span>
              </div>
            ))}

            {entries.length > 4 && (
              <div className={styles.summaryTileMuted}>
                +{entries.length - 4} more
              </div>
            )}
          </div>
        )}

        <div className={`${styles.clusterBody}`}>
          {bodyEntries.map(([key, value]) => (
            <DataSection key={key} label={key} value={value} depth={0} />
          ))}

          {bodyEntries.length === 0 && (
            <p className={styles.emptyState}>No data to display.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default DataCluster;
