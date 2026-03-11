import React, { useState, useRef, useEffect } from "react";
// import Popover from "oute-ds-popover";
// import ODSAccordion from "oute-ds-accordion";
// import ODSIcon from "oute-ds-icon";
// import ODSLabel from "oute-ds-label";
// import default_theme from "oute-ds-shared-assets";
import { ODSPopover as Popover, ODSAccordion, ODSIcon, ODSLabel, sharedAssets } from "@src/module/ods";
const default_theme = sharedAssets;
import classes from "./index.module.css";

const ErrorWarningPopover = ({
  data,
  onClose = () => {},
  popoverCoordinates,
}) => {
  const [showErrors, setShowErrors] = useState(
    data?.errors?.length > 0 ? true : false,
  );
  const [showWarnings, setShowWarnings] = useState(
    data?.errors?.length > 0 ? false : true,
  );
  const [showErrorsWarningsDialog, setShowErrorsWarningsDialog] =
    useState(false);

  const popoverRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      setShowErrorsWarningsDialog(true);
    }, 100);
  }, []);

  return (
    <>
      <div
        ref={popoverRef}
        style={{
          position: "absolute",
          ...popoverCoordinates,
        }}
      />

      <Popover
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
            },
          },
        }}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: popoverCoordinates?.top,
          left: popoverCoordinates?.left,
        }}
        open={showErrorsWarningsDialog}
        anchorEl={popoverRef.current}
        onClose={onClose}
      >
        <div className={classes["errors-warnings-popover-container"]}>
          {data?.errors?.length > 0 && (
            <div
              style={{
                maxHeight: "calc(100% - 3rem)",
              }}
            >
              <ODSAccordion
                data-testid="errors-accordion"
                title={<ODSLabel variant="h6">{"Errors"}</ODSLabel>}
                sx={{ border: "none" }}
                summaryProps={{
                  sx: {
                    background: "transparent",
                  },
                }}
                expanded={showErrors}
                onChange={() => {
                  setShowWarnings((prevState) => !prevState);
                  setShowErrors((prevState) => !prevState);
                }}
                content={
                  <div className={classes["accordion-content"]}>
                    {data?.errors?.map((error, index) => {
                      return (
                        <div className={classes["errors-list"]} key={index}>
                          <ODSIcon
                            outeIconName="OUTEInfoIcon"
                            outeIconProps={{
                              sx: {
                                color: default_theme.palette?.error?.main,
                              },
                            }}
                          />
                          <ODSLabel
                            variant="body1"
                            color={default_theme.palette?.grey["A100"]}
                          >
                            {error}
                          </ODSLabel>
                        </div>
                      );
                    })}
                  </div>
                }
              />
            </div>
          )}
          {data?.warnings?.length > 0 && (
            <div
              style={{
                maxHeight: "calc(100% - 3rem)",
              }}
            >
              <ODSAccordion
                data-testid="warnings-accordion"
                title={<ODSLabel variant="h6">{"Warnings"}</ODSLabel>}
                sx={{ border: "none" }}
                summaryProps={{
                  sx: {
                    background: "transparent",
                  },
                }}
                expanded={showWarnings}
                onChange={() => {
                  setShowWarnings((prevState) => !prevState);
                  setShowErrors((prevState) => !prevState);
                }}
                content={
                  <div className={classes["accordion-content"]}>
                    {data?.warnings?.map((warning, index) => {
                      return (
                        <div className={classes["warnings-list"]} key={index}>
                          <ODSIcon
                            outeIconName="OUTEWarningIcon"
                            outeIconProps={{
                              sx: {
                                color: "#FB8C00",
                              },
                            }}
                          />
                          <ODSLabel
                            variant="body1"
                            color={default_theme.palette?.grey["A100"]}
                          >
                            {warning}
                          </ODSLabel>
                        </div>
                      );
                    })}
                  </div>
                }
              />
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default ErrorWarningPopover;
