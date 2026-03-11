import classes from "../../AgentComposer.module.css";
// import { FormulaBar } from "oute-ds-formula-bar";
// import ODSLabel from "oute-ds-label";
// import Accordion from "oute-ds-accordion";
import { ODSFormulaBar as FormulaBar, ODSLabel, ODSAccordion as Accordion } from "@src/module/ods";
const SenderDetails = ({
  data,
  variables,
  onChange = () => {},
  toggleExpanded = () => {},
  isExpanded,
}) => {
  return (
    <Accordion
      data-testid="sender-details-accordion"
      expanded={isExpanded === "SENDER_DETAILS"}
      title={
        <div>
          <ODSLabel variant="capital">Sender Details</ODSLabel>
          <ODSLabel variant="body2" color="#607D8B">
            Provide details about your company to create engaging email tailored
            to the outreach objective
          </ODSLabel>
        </div>
      }
      content={
        <div className={classes["main-container"]}>
          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1" required>
              Sender&apos;s Company Name
            </ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="Company name here"
              variables={variables}
              defaultInputContent={data?.companyName?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("companyName", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "sender-company-name" },
              }}
            />
          </div>

          <div>
            <ODSLabel variant="body1" required>
              Email Objective
            </ODSLabel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <ODSLabel variant="body2" color="#607D8B">
                Defines the goal of the outreach
              </ODSLabel>
              <FormulaBar
                wrapContent={true}
                placeholder="e.g. to request a backlink, propose a guest post, article)"
                variables={variables}
                defaultInputContent={data?.emailObjective?.blocks || []}
                onInputContentChanged={(content) => {
                  onChange("emailObjective", {
                    type: "fx",
                    blocks: content,
                  });
                }}
                slotProps={{
                  container: { "data-testid": "email-objective" },
                }}
              />
            </div>
          </div>

          <div>
            <ODSLabel variant="body1" required>
              Add Business Context
            </ODSLabel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <ODSLabel variant="body2" color="#607D8B">
                Tell us about your business to help us tailor our responses.
              </ODSLabel>

              <FormulaBar
                placeholder="Your business context here"
                variables={variables}
                defaultInputContent={data?.description?.blocks || []}
                onInputContentChanged={(content) => {
                  onChange("description", {
                    type: "fx",
                    blocks: content,
                  });
                }}
                slotProps={{
                  container: { "data-testid": "business-context" },
                }}
                wrapContent={true}
              />
            </div>
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">Sender Additional Info</ODSLabel>
            <FormulaBar
              placeholder="Enter additonal information"
              variables={variables}
              defaultInputContent={data?.sender_additional_info?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("sender_additional_info", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "sender-additional-info" },
              }}
              wrapContent={true}
            />
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">Tone</ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="The tone of your outreach. e.g. Professional, Friendly, etc."
              variables={variables}
              defaultInputContent={data?.tone?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("tone", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "sender-tone" },
              }}
            />
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">Email Length</ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="Enter email length. e.g. 150"
              variables={variables}
              defaultInputContent={data?.email_length?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("email_length", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "email-length" },
              }}
            />
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">Sender Email</ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="Enter sender email here"
              variables={variables}
              defaultInputContent={data?.sender_email?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("sender_email", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "sender-email" },
              }}
            />
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">Sender Name</ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="Enter sender name here"
              variables={variables}
              defaultInputContent={data?.sender_name?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("sender_name", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "sender-name" },
              }}
            />
          </div>
        </div>
      }
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
        border: "0px solid #CFD8DC",
        borderRadius: "0px !important",
      }}
      onChange={toggleExpanded}
    />
  );
};

export default SenderDetails;
