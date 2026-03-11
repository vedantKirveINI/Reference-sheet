import { useMemo, useRef, useEffect, useState } from "react";
import styles from "./styles.module.css";
// import ODSIcon from "oute-ds-icon";
import { ODSIcon } from "@src/module/ods";
import CopyContent from "../../../CopyContent";
import useAccordion from "../../useAccordion";

function SectionBody({
  value,
  label,
  nestedEntries,
  depth,
  forceChildrenOpen,
}) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className={styles.emptyState}>No records</p>;
    }

    return value.map((item, index) => (
      <DataSection
        key={`${label}-${index}`}
        label={`Item ${index + 1}`}
        value={item}
        depth={depth + 1}
        forceOpen={forceChildrenOpen}
      />
    ));
  }

  if (nestedEntries.length === 0) {
    return <p className={styles.emptyState}>No fields</p>;
  }

  return nestedEntries.map(([nestedKey, nestedValue]) => (
    <DataSection
      key={nestedKey}
      label={nestedKey}
      value={nestedValue}
      depth={depth + 1}
      forceOpen={forceChildrenOpen}
    />
  ));
}

function DataSection({ label, value, depth = 0, forceOpen = false }) {
  const isPrimitive =
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  const [forceChildrenOpen, setForceChildrenOpen] = useState(false);

  const { isOpen, accordionRef, contentRef, handleAccordionToggle } =
    useAccordion({ padding: "0 1.1rem 1.1rem", forceOpen });

  // Track previous open state to detect when parent opens
  const prevIsOpen = useRef(isOpen);

  const nestedEntries = useMemo(() => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [];
    }

    return Object.entries(value);
  }, [value]);

  useEffect(() => {
    // When accordion transitions from closed to open, force children to open
    if (isOpen && !prevIsOpen.current) {
      setForceChildrenOpen(true);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  if (isPrimitive) {
    return (
      <article className={styles.section}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{label}</span>
          <span className={styles.copyTrigger}>
            <CopyContent data={value} />
          </span>
        </header>
        <p className={styles.sectionPrimitive}>{String(value)}</p>
      </article>
    );
  }

  return (
    <div
      className={`${styles.section} ${styles.sectionInteractive} ${!isOpen ? styles.sectionCollapsed : ""}`}
      ref={accordionRef}
    >
      <summary
        className={styles.sectionSummary}
        onClick={handleAccordionToggle}
      >
        <span
          className={`${styles.summaryIcon} ${isOpen ? styles.summaryIconExpanded : styles.summaryIconCollapsed}`}
        >
          <ODSIcon outeIconName="OUTEExpandMoreIcon" />
        </span>

        <span className={styles.sectionLabel}>
          {label}{" "}
          <span className={styles.sectionMeta}>
            {Array.isArray(value)
              ? `(${value.length})`
              : `(${nestedEntries.length} field${nestedEntries.length !== 1 ? "s" : ""})`}
          </span>
        </span>

        <span className={styles.copyTrigger}>
          <CopyContent data={JSON.stringify(value, null, 2)} />
        </span>
      </summary>

      <div className={styles.sectionContent} ref={contentRef}>
        <SectionBody
          value={value}
          label={label}
          nestedEntries={nestedEntries}
          depth={depth}
          forceChildrenOpen={forceChildrenOpen || forceOpen}
        />
      </div>
    </div>
  );
}

export default DataSection;
