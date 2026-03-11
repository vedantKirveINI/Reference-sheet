import React, { useEffect, useState } from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
import { ODSAccordion as Accordion, ODSLabel as Label } from "@src/module/ods";
import styles from "../../FindAllRecord.module.css";
import lowerCase from "lodash/lowerCase";

const RefineData = ({ refineTabData = [], setValidTabIndices }) => {
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

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div className={styles.container} data-testid="refine-data-note">
        <div className={styles.box}>
          <span className={styles.textBold}>Note: </span>
          <Label variant="body2" fontWeight="600" style={{ display: "inline" }}>
            Apply filters and sorting to refine which records are found. Only
            the records matching the specified conditions and sort order
            (ascending or descending) will appear in the output.If no filter or
            sort order is applied, all records will be shown.
            <br />
            The limit controls the number of records shown, and the offset
            specifies how many rows to skip By default, the limit is set to 100.
          </Label>
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
