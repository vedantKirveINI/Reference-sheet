import { useState, useEffect } from "react";
import Accordion from "oute-ds-accordion";
import Label from "oute-ds-label";

const Configure = ({ configureTabData = [], setValidTabIndices }) => {
  const [expandedPanels, setExpandedPanels] = useState("Data");
  const handleAccordionChange = (panelLabel) => {
    setExpandedPanels((prev) => (prev === panelLabel ? "" : panelLabel));
  };

  useEffect(() => {
    setValidTabIndices(configureTabData.length > 0 ? [0, 1] : []);
  }, [configureTabData.length, setValidTabIndices]);

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
      }}
    >
      {configureTabData
        // .filter(({ label }) => showPanel[label])
        .map(({ label, panelComponent: Panel, panelComponentProps }) => (
          <Accordion
            data-testid={`configure-accordion-${label}`}
            title={
              <Label variant="body1" fontWeight="600">
                {label}
              </Label>
            }
            content={
              <div
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                <Panel {...panelComponentProps} />
              </div>
            }
            key={`configure-accordion-${label}`}
            summaryProps={{
              sx: {
                background: "transparent !important",
                flexDirection: "row",
                border: "none",
                height: "auto !important",
                padding: "0rem 1.5rem !important",

                "& .MuiAccordionSummary-content": {
                  margin: "0 !important",
                  padding: "0 !important",
                },
              },
            }}
            sx={{
              "&.Mui-expanded": {
                height: "max-content !important",
                margin: "0 !important",
                background: "rgba(33, 33, 33, 0.02)",
              },
              padding: "1rem",
              borderColor: " #CFD8DC",
              borderRadius: "0px !important",
            }}
            expanded={expandedPanels === label}
            onChange={() => handleAccordionChange(label)}
          />
        ))}
    </div>
  );
};

export default Configure;
