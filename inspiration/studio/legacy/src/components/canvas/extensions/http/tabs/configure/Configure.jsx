import React, { useCallback, useEffect, useState } from "react";
// import ODSTab from "oute-ds-tab";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import Accordion from "oute-ds-accordion";
import { ODSLabel as Label, ODSIcon as Icon, ODSAccordion as Accordion } from "@src/module/ods";
import {
  addIndices,
  removeIndicesStartingFromIndex,
} from "../../../extension-utils";
import { checkAuthorization, checkBody, checkEmptyFields } from "../../utils";
import { RequestAuthType, RequestBodyType } from "../../../../classes";
import { AUTH, BODY, HEADER, PARAMS } from "../../constant";

const Configure = ({
  httpConfigureData = [],
  setValidTabIndices = () => {},
  setErrorMessages,
  showPanel = {
    [BODY]: true,
    [PARAMS]: true,
    [HEADER]: true,
    [AUTH]: true,
  },
}) => {
  const [panelsWithError, setPanelsWithError] = useState([]);

  const [expandedPanels, setExpandedPanels] = useState(() => {
    // Find the first panel that should be shown
    const firstPanel = httpConfigureData.find((item) => showPanel[item.label]);
    return firstPanel ? [firstPanel.label] : [];
  });

  const handleAccordionChange = (label) => {
    setExpandedPanels((prev) => {
      // If the clicked panel is already expanded, collapse it
      if (prev.includes(label)) {
        return prev.filter((l) => l !== label);
      } else {
        // Otherwise, open the clicked panel and close any others
        return [label];
      }
    });
  };

  const validateConfigureTab = useCallback(() => {
    let errorMessages = [];
    let panelsWithError = [];
    const [bodyConfig, queryParamsConfig, headersConfig, authConfig] =
      httpConfigureData;

    // Validation for empty params fields
    if (showPanel[PARAMS]) {
      const queryParamsGridData =
        queryParamsConfig?.panelComponentProps?.queryParams || [];
      const errorMessage = checkEmptyFields(queryParamsGridData, PARAMS);

      if (errorMessage) {
        panelsWithError = [...panelsWithError, PARAMS];
        errorMessages = [...errorMessages, errorMessage];
      }
    }

    if (showPanel[HEADER]) {
      // Validation for empty header fields
      const headersGridData = headersConfig?.panelComponentProps?.headers || [];
      const errorMessage = checkEmptyFields(headersGridData, HEADER);

      if (errorMessage) {
        panelsWithError = [...panelsWithError, HEADER];
        errorMessages = [...errorMessages, errorMessage];
      }
    }

    if (showPanel[AUTH]) {
      const authProps = authConfig?.panelComponentProps;
      const authType = authProps?.authorizationType?.id;
      const authData =
        authType === RequestAuthType.BASIC.id
          ? authProps?.basicAuthData
          : authType === RequestAuthType.BEARER.id
            ? authProps?.bearerAuth
            : null;

      if (authData) {
        const errorMessage = checkAuthorization(authData);
        if (errorMessage) {
          panelsWithError = [...panelsWithError, AUTH];
          errorMessages = [...errorMessages, errorMessage];
        }
      }
    }

    if (showPanel[BODY]) {
      const bodyProps = bodyConfig?.panelComponentProps;
      const bodyType = bodyProps?.bodyType;
      let bodyData = null;
      if (bodyType === RequestBodyType.X_WWW_FORM_URL_ENCODED) {
        bodyData = bodyProps?.urlencodedGridData;
      } else if (bodyType === RequestBodyType.FORM_DATA) {
        bodyData = bodyProps?.formGridData;
      }

      if (bodyData && bodyData.length !== 0) {
        const bodyErrorMessages = checkBody(bodyData);

        if (bodyErrorMessages.length > 0) {
          panelsWithError.push(BODY);
          errorMessages = [...errorMessages, ...bodyErrorMessages];
        }
      }
    }

    if (errorMessages.length) {
      setValidTabIndices((prev) => removeIndicesStartingFromIndex(prev, 1));
      setErrorMessages((prev) => {
        return { ...prev, 1: errorMessages };
      });
      setPanelsWithError(panelsWithError);
    } else {
      setErrorMessages((prev) => {
        return { ...prev, 1: [] };
      });
      setValidTabIndices((prev) => addIndices(prev, [1]));
      setPanelsWithError([]);
    }
  }, [httpConfigureData, setErrorMessages, setValidTabIndices, showPanel]);

  useEffect(() => {
    validateConfigureTab();
  }, [validateConfigureTab]);

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {httpConfigureData
        .filter(({ label }) => showPanel[label])
        .map(({ label, panelComponent: Panel, panelComponentProps }) => (
          <Accordion
            data-testid={`http-configure-${label?.toLowerCase()}-section`}
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
                {panelsWithError.includes(label) && (
                  <Icon
                    outeIconName="OUTEWarningIcon"
                    outeIconProps={{
                      sx: {
                        color: "#EF4444",
                      },
                    }}
                  />
                )}
              </div>
            }
            content={<Panel {...panelComponentProps} />}
            key={`configure-accordion-${label}`}
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
                background: "#fff",
                height: "max-content !important",
                margin: "0 !important",
              },
              padding: "0.5rem",
              borderColor: " #CFD8DC",
              borderRadius: "0px !important",
            }}
            expanded={expandedPanels.includes(label)}
            onChange={() => handleAccordionChange(label)}
          />
        ))}
    </div>
  );
};

export default Configure;
