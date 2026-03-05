import classes from "../../AgentComposer.module.css";
// import { FormulaBar } from "@src/module/ods";
// import { ODSLabel } from "@src/module/ods";
// import Accordion from "oute-ds-accordion";
import { ODSFormulaBar as FormulaBar, ODSLabel, ODSAccordion as Accordion } from "@src/module/ods";
const RecipientDetails = ({
  data,
  variables,
  onChange = () => {},
  isExpanded,
  toggleExpanded = () => {},
}) => {
  return (
    <Accordion
      data-testid="recipient-details-accordion"
      onChange={toggleExpanded}
      expanded={isExpanded === "RECIPIENT_DETAILS"}
      title={
        <div>
          <ODSLabel variant="capital">Recipient Details</ODSLabel>
          <ODSLabel variant="body2" color="#607D8B">
            Provides detailed information about the recipient.
          </ODSLabel>
        </div>
      }
      content={
        <div className={classes["main-container"]}>
          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1" required>
              Recipient Email
            </ODSLabel>
            <FormulaBar
              wrapContent={true}
              placeholder="Email here"
              variables={variables}
              defaultInputContent={data?.recipientEmail?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("recipientEmail", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "recipient-email" },
              }}
            />
          </div>
          <div>
            <ODSLabel variant="body1">Recipient Name</ODSLabel>
            <div className={classes["sub-container"]}>
              <ODSLabel variant="body2" color="#607D8B">
                Defines the goal of the outreach
              </ODSLabel>
              <FormulaBar
                wrapContent={true}
                placeholder="Name here"
                variables={variables}
                defaultInputContent={data?.recipientName?.blocks || []}
                onInputContentChanged={(content) => {
                  onChange("recipientName", {
                    type: "fx",
                    blocks: content,
                  });
                }}
                slotProps={{
                  container: { "data-testid": "recipient-name" },
                }}
              />
            </div>
          </div>

          <div>
            <ODSLabel variant="body1" required>
              Recipient Context
            </ODSLabel>
            <div className={classes["sub-container"]}>
              <ODSLabel variant="body2" color="#607D8B">
                Detailed information about the recipient’s background, role,
                interests that describes their company. This helps to
                personalize the message.
              </ODSLabel>

              <FormulaBar
                placeholder="Your business context here"
                variables={variables}
                defaultInputContent={data?.recipientDescription?.blocks || []}
                onInputContentChanged={(content) => {
                  onChange("recipientDescription", {
                    type: "fx",
                    blocks: content,
                  });
                }}
                slotProps={{
                  container: { "data-testid": "recipient-context" },
                }}
                wrapContent={true}
              />
            </div>
          </div>

          <div className={classes["sub-container"]}>
            <ODSLabel variant="body1">
              Recipient Additional Information
            </ODSLabel>
            <FormulaBar
              placeholder="Enter additional information here"
              variables={variables}
              defaultInputContent={data?.receiver_additional_info?.blocks || []}
              onInputContentChanged={(content) => {
                onChange("receiver_additional_info", {
                  type: "fx",
                  blocks: content,
                });
              }}
              slotProps={{
                container: { "data-testid": "recipient-additional-info" },
              }}
              wrapContent={true}
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
      style={{
        border: "0.75px solid #CFD8DC",
        borderRadius: "0px !important",
      }}
    />
  );
};

export default RecipientDetails;
