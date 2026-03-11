import React, { useCallback, useEffect, useState } from "react";
import Accordion from "oute-ds-accordion";
import Label from "oute-ds-label";
import { DB_CONNECTION_ERRORS } from "../../../../../utils/errorEnums";

const Configure = ({
  configureTabData = [],
  setValidTabIndices = () => {},
  setErrorMessages = () => {},
}) => {
  const [expandedPanels, setExpandedPanels] = useState([
    configureTabData[0]?.label || "",
  ]);

  const handleAccordionChange = (panelLabel) => {
    setExpandedPanels((prev) => (prev === panelLabel ? "" : panelLabel));
  };

  const validateData = useCallback(() => {
    const errors = [];
    const [
      {
        panelComponentProps: { record },
      },
    ] = configureTabData;

    if (record) {
      const noRecordChecked = !record?.some((r) => r.checked);

      if (noRecordChecked) {
        errors.push(DB_CONNECTION_ERRORS.SELECT_MIN_ONE_COLUMN);
      }
    }

    setErrorMessages((prev) => ({ ...prev, 1: errors }));
    setValidTabIndices(errors.length === 0 ? [0, 1] : []);
  }, [configureTabData, setErrorMessages, setValidTabIndices]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
      }}
    >
      {configureTabData.map(
        ({ label, panelComponent: Panel, panelComponentProps }) => (
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
                  maxHeight: "55vh",
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
                background: "rgba(33, 33, 33, 0.02)",
                height: "max-content !important",
                margin: "0 !important",
              },
              padding: "1rem",
              borderColor: " #CFD8DC",
              borderRadius: "0px !important",
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
