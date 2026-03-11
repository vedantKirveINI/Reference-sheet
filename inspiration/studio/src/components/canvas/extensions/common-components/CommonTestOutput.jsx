import React, { useState } from "react";
// import Accordion from "oute-ds-accordion";
// import { ODSLabel as Label } from '@src/module/ods';
// import { ODSSwitch as Switch } from '@src/module/ods';
import { ODSAccordion as Accordion, ODSLabel as Label, ODSSwitch as Switch } from "@src/module/ods";
import CommonTestResponseModule from "./CommonTestResponseModule";
import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";
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
      className="border border-[#CFD8DC] rounded-md"
      summaryProps={{
        className: "bg-[#ECEFF1] h-11 border-none px-6 py-2",
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
              <InputGridV3
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
