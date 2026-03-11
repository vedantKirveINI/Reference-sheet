import React, { useRef } from "react";

// import Accordion from "oute-ds-accordion";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
// import Popover from "oute-ds-popover";
import { ODSAccordion as Accordion, ODSIcon as Icon, ODSLabel as Label, ODSPopover as Popover } from "@src/module/ods";

import ExecutionResult from "./ExecutionResult";

import styles from "./ExecutionResults.module.css";

const ExecutionResultsPopover = ({
  data,
  onClose = () => {},
  popoverCoordinates,
}) => {
  // data = {
  //   ...data,
  //   executions: [
  //     { input: "alam", output: "shaikh" },
  //     { input: "alam", output: { lastname: "khan" } },
  //     { input: "sattu", error: "sattu not defined" },
  //   ],
  // };
  const popoverRef = useRef();
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
              borderRadius: "0.375rem",
            },
          },
        }}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: popoverCoordinates?.top,
          left: popoverCoordinates?.left,
        }}
        open={true}
        anchorEl={popoverRef.current}
        onClose={onClose}
      >
        <div className={styles.container}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem",
              justifyContent: "space-between",
              borderBottom: "0.75px solid #cfd8dc",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Icon
                imageProps={{
                  src: data._src,
                  style: { width: "1.5em", height: "1.5em" },
                }}
              />
              <Label variant="h6">{data.name}</Label>
            </div>
            <Icon
              outeIconName="OUTECloseIcon"
              outeIconProps={{ sx: { color: "#212121" } }}
              onClick={onClose}
            />
          </div>

          {data?._executions?.length === 1 ? (
            <div className={styles.executions} style={{ padding: 0 }}>
              <ExecutionResult execution={data?._executions[0]} />
            </div>
          ) : (
            <div className={styles.executions}>
              {data?._executions?.map((execution, index) => (
                <Accordion
                  key={index}
                  title={
                    <Label variant="capital">{`Execution ${index + 1}`}</Label>
                  }
                  sx={{
                    padding: "0.75rem 1rem",
                    boxSizing: "border-box",
                  }}
                  summaryProps={{
                    sx: { background: "none" },
                  }}
                  content={<ExecutionResult execution={execution} />}
                />
              ))}
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default ExecutionResultsPopover;
