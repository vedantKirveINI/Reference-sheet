import React, { useCallback, useEffect, useState } from "react";
import Accordion from "oute-ds-accordion";
import Label from "oute-ds-label";
import { DB_CONNECTION_ERRORS } from "../../../../../utils/errorEnums";
import styles from "../../FindAllRecord.module.css";

const Configure = ({
  configureTabData = [],
  setValidTabIndices = () => {},
  setErrorMessages = () => {},
}) => {
  const [expandedPanels, setExpandedPanels] = useState([
    configureTabData[0]?.label || "",
  ]);

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

  const handleAccordionChange = (panelLabel) => {
    setExpandedPanels((prev) => (prev === panelLabel ? "" : panelLabel));
  };

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
      <div className={styles.container} data-testid="refine-data-note">
        <div className={styles.box}>
          <span className={styles.textBold}>Note: </span>{" "}
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
                  maxHeight: "35vh",
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
                padding: "0rem 1.5rem !important",
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
