import { useMemo } from "react";
import { ODSLabel as Label, ODSIcon } from "@src/module/ods";
import CopyContent from "../../../CopyContent";
import DataSection from "../DataSection";
import styles from "./styles.module.css";
import useAccordion from "../../useAccordion";

function DataCluster({ label, payload, isOutput = false }) {
  const entries = useMemo(() => Object.entries(payload || {}), [payload]);

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
            className={`${styles.cheveronIcon} ${isOpen ? styles.cheveronIconExpanded : ""}`}
          >
            <ODSIcon outeIconName="OUTEExpandMoreIcon" />
          </span>
        </div>
      </header>

      <div className={styles.clusterContent} ref={contentRef}>
        <div className={styles.clusterBody}>
          {entries.map(([key, value]) => (
            <DataSection key={key} label={key} value={value} depth={0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DataCluster;
