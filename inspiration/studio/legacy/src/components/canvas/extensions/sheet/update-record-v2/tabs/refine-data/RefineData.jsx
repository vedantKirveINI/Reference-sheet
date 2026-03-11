import React, { useEffect, useState } from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
import { ODSAccordion as Accordion, ODSLabel as Label } from "@src/module/ods";
import styles from "../../UpdateRecord.module.css";
import lowerCase from "lodash/lowerCase";
import TableLoader from "../../../common-components/tableLoader";

const RefineData = ({
  refineTabData = [],
  setValidTabIndices,
  loading = false,
}) => {
  const [expandedPanels, setExpandedPanels] = useState(["filter"]);

  const handleAccordionChange = (panelLabel) => {
    setExpandedPanels((prev) => {
      if (prev.includes(panelLabel)) {
        return [];
      }

      return [panelLabel];
    });
  };

  useEffect(() => {
    if (refineTabData.length > 0) {
      setValidTabIndices([0, 1, 2]);
    } else {
      setValidTabIndices([]);
    }
  }, [refineTabData.length, setValidTabIndices]);

  if (loading) {
    return <TableLoader columns={1} />;
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div className={styles["container"]}>
        <div className={styles["box"]} data-testid="refine-data-note">
          <p className={styles["text"]}>
            <span className={styles["text-bold"]}>Note: </span>
            <Label
              variant="body2"
              fontWeight="600"
              style={{ display: "inline" }}
            >
              Filters and sorting can be applied to refine which records are
              updated. Specify conditions (e.g., has, contains) and sort order
              (ascending or descending) to ensure only matching records are
              updated in the desired order. If no filter or sort order is
              applied, a random record will be updated.
            </Label>
          </p>
        </div>
      </div>
      {refineTabData.map(
        ({ label, panelComponent: Panel, panelComponentProps }) => (
          <Accordion
            data-testid={`refine-data-accordion-${label}`}
            title={
              <Label variant="body1" fontWeight="600">
                {label}
              </Label>
            }
            content={
              <div style={{ padding: "1rem", height: "100%" }}>
                <Panel {...panelComponentProps} />
              </div>
            }
            key={`refine-accordion-${label}`}
            summaryProps={{
              sx: {
                background: "transparent !important",
                flexDirection: "row",
                border: "none",
                padding: "1rem 1.5rem !important",
                height: "auto !important",
                "& .MuiAccordionSummary-content": {
                  margin: "0 !important",
                  padding: "0 !important",
                },
              },
            }}
            sx={{
              "&.Mui-expanded": {
                background: "rgba(33, 33, 33, 0.02)",
                height: "max-content !important",
                margin: "0 !important",
              },
              padding: "0.5rem",
              borderColor: " #CFD8DC",
              borderRadius: "0px !important",
            }}
            expanded={expandedPanels.includes(lowerCase(label))}
            onChange={() => handleAccordionChange(lowerCase(label))}
          />
        )
      )}
    </div>
  );
};

export default RefineData;
