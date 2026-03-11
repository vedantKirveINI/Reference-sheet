import React, { useState } from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
import { ODSAccordion as Accordion, ODSLabel as Label } from "@src/module/ods";

const Configure = ({ configureTabData = [] }) => {
  const [expandedPanels, setExpandedPanels] = useState(["Data"]);
  const handleAccordionChange = (label) => {
    setExpandedPanels((prev) => {
      if (prev.includes(label)) {
        // Collapse the panel if it's already expanded
        return prev.filter((l) => l !== label);
      } else {
        // Expand the panel by adding it to the state
        return [...prev, label];
      }
    });
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {configureTabData.map(
        ({ label, panelComponent: Panel, panelComponentProps }) => (
          <Accordion
            data-testid={`configure-accordion-${label}`}
            title={
              <div
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Label
                  sx={{
                    font: "var(--body1)",
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Label>
              </div>
            }
            content={<Panel {...panelComponentProps} />}
            key={`configure-accordion-${label}`}
            sx={{
              "&.Mui-expanded": {
                height: "max-content !important",
                margin: "0 !important",
              },
              borderColor: "#CFD8DC",
              borderRadius: "0px !important",
            }}
            summaryProps={{
              sx: {
                background: "#fff",
                height: "max-content !important",
                border: "none",
                flexDirection: "row",
                padding: "0.5rem 1.5rem !important",
                "&.Mui-expanded": {
                  background: "rgba(33, 33, 33, 0.02)",
                },
              },
            }}
            detailsProps={{
              sx: {
                padding: "1.5rem",
                boxSizing: "border-box",
                height: "max-content",
                border: "none",
                background: "rgba(33, 33, 33, 0.02)",
              },
            }}
            expanded={expandedPanels.includes(label)}
            onChange={() => handleAccordionChange(label)}
          />
        )
      )}
    </div>
  );
};

export default Configure;
