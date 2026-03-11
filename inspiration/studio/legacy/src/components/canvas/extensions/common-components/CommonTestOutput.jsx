import React, { useState } from "react";
// import Accordion from "oute-ds-accordion";
// import Label from "oute-ds-label";
// import Switch from "oute-ds-switch";
import { ODSAccordion as Accordion, ODSLabel as Label, ODSSwitch as Switch } from "@src/module/ods";
import CommonTestResponseModule from "./CommonTestResponseModule";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";
import classes from "./CommonTestOutput.module.css";
const CommonTestOutput = ({
  expanded,
  // onChange,
  output,
  outputSchema,
  responseModule,
  node,
  allowShowSchema = true,
}) => {
  const [viewSchema, setViewSchema] = useState(false);
  return (
    <Accordion
      defaultExpanded={expanded}
      // expanded={expanded === "output"}
      // onChange={onChange}
      sx={{
        "&.Mui-expanded": {
          height: "max-content !important",
          margin: "0 !important",
        },
        borderColor: "#CFD8DC",
        borderRadius: "6px !important",
      }}
      summaryProps={{
        sx: {
          background: "#ECEFF1",
          height: "2.75rem !important",
          border: "none",
          padding: "0.5rem 1.5rem !important",
        },
      }}
      title={
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Label variant="capital">Output</Label>
          <div onClick={(e) => e.stopPropagation()}>
            {allowShowSchema && (
              <Switch
                variant="black"
                size="small"
                labelText="View Schema"
                checked={viewSchema}
                onChange={() => setViewSchema(!viewSchema)}
              />
            )}
          </div>
        </div>
      }
      content={
        <div
          style={{
            padding: "1rem",
            overflow: "auto",
          }}
          className={classes["common-test-output-container"]}
        >
          {output ? (
            viewSchema && allowShowSchema ? (
              <InputGridV2
                initialValue={outputSchema}
                hideHeaderAndMap={true}
                showHeaders={false}
                hideBorder={true}
                hideColumnType={true}
                allowMapping={false}
                showFxCell={false}
                showNote={false}
                readOnly
              />
            ) : responseModule ? (
              responseModule(output.response || output || {}, node)
            ) : (
              <CommonTestResponseModule
                data={output?.response || output || {}}
              />
            )
          ) : (
            <Label>
              Click <strong>TEST</strong> to run your node and see the results
            </Label>
          )}
        </div>
      }
    />
  );
};

export default CommonTestOutput;
