// import { ODSLabel } from "@src/module/ods";
import { ODSLabel } from "@src/module/ods";
import ScrollableTextField from "../../../components/scrollable-text-field";
import { formatTimeBasedTriggerDescription, formatSheetTriggerDescription, formatFormTriggerDescription,  } from "../../../utils/trigger-utils";
import { WEBHOOK_TYPE, TIME_BASED_TRIGGER, INPUT_SETUP_TYPE, SHEET_TRIGGER, FORM_TRIGGER, INTEGRATION_TYPE,  } from "../../../../../../canvas/extensions";

import classes from "../index.module.css";
const TriggerContent = ({
  triggerNodes = [],
  assetDetails = {},
  isPublished = false,
}) => {
  if (triggerNodes.length === 0) {
    return (
      <ODSLabel
        variant="body2"
        style={{ color: "#607D8B" }}
        data-testid="no-trigger-message"
      >
        No trigger configured. Workflow can be run manually.
      </ODSLabel>
    );
  }

  return triggerNodes.map((node, index) => {
    const nodeType = node?.type || node?.data?.type;
    const nodeSubType = node?.subType || node?.data?.subType;
    // Handle both camelCase (goData) and snake_case (go_data) formats
    const goData =
      node?.data?.goData ||
      node?.data?.go_data ||
      node?.goData ||
      node?.go_data ||
      {};

    if (nodeType === WEBHOOK_TYPE) {
      // For webhook triggers, use published_info.details if available
      // Otherwise fallback to node data or show default message
      const publishedUrl =
        assetDetails?.asset?.published_info?.details?.asset?.url;
      const publishedCurl =
        assetDetails?.asset?.published_info?.details?.asset?.curl;
      const webhookUrl =
        publishedUrl ||
        goData?.webhookData?.webhook_url ||
        goData?.webhookData?.webhookUrl ||
        goData?.webhook_url ||
        goData?.webhookUrl;

      // If published, use published URL and cURL
      if (isPublished && (publishedUrl || publishedCurl)) {
        return (
          <div
            key={index}
            data-testid="webhook-trigger-section"
            className={classes.webhookFieldsContainer}
          >
            {publishedUrl && (
              <ScrollableTextField
                label="Published URL"
                value={publishedUrl}
                dataTestId="webhook-url"
              />
            )}
            {publishedCurl && (
              <ScrollableTextField
                label="cURL"
                value={publishedCurl}
                dataTestId="webhook-curl"
              />
            )}
          </div>
        );
      }

      // If not published but has webhook URL from node, show it
      if (webhookUrl) {
        const curlCommand = `curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -d '{"key":"value"}'`;
        return (
          <div
            key={index}
            data-testid="webhook-trigger-section"
            className={classes.webhookFieldsContainer}
          >
            <ScrollableTextField
              label="Webhook URL"
              value={webhookUrl}
              dataTestId="webhook-url"
            />
            <ScrollableTextField
              label="cURL"
              value={curlCommand}
              dataTestId="webhook-curl"
            />
          </div>
        );
      }

      // Default: not published and no webhook URL
      return (
        <div
          key={index}
          data-testid="webhook-trigger-section"
          className={classes.webhookFieldsContainer}
        >
          <ODSLabel
            variant="body2"
            style={{ color: "#607D8B" }}
            data-testid="webhook-not-configured"
          >
            Webhook not configured. Publish the workflow to get webhook URL and
            cURL command.
          </ODSLabel>
        </div>
      );
    }

    if (nodeType === TIME_BASED_TRIGGER) {
      const description = formatTimeBasedTriggerDescription(goData);
      return (
        <div
          key={index}
          className={classes.triggerContent}
          data-testid="time-based-trigger-section"
        >
          <ODSLabel
            variant="body1"
            style={{
              color: "#263238",
              fontWeight: 500,
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            data-testid="time-based-trigger-description"
          >
            {description || "Time-based trigger configured"}
          </ODSLabel>
        </div>
      );
    }

    if (nodeType === SHEET_TRIGGER) {
      const description = formatSheetTriggerDescription(goData);
      return (
        <div
          key={index}
          className={classes.triggerContent}
          data-testid="sheet-trigger-section"
        >
          <ODSLabel
            variant="body1"
            style={{
              color: "#263238",
              fontWeight: 500,
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            data-testid="sheet-trigger-description"
          >
            {description || "Sheet trigger configured"}
          </ODSLabel>
        </div>
      );
    }

    if (nodeType === FORM_TRIGGER) {
      const description = formatFormTriggerDescription(goData);
      return (
        <div
          key={index}
          className={classes.triggerContent}
          data-testid="form-trigger-section"
        >
          <ODSLabel
            variant="body1"
            style={{
              color: "#263238",
              fontWeight: 500,
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            data-testid="form-trigger-description"
          >
            {description || "Form trigger configured"}
          </ODSLabel>
        </div>
      );
    }

    if (nodeType === INPUT_SETUP_TYPE) {
      return (
        <div
          key={index}
          className={classes.triggerContent}
          data-testid="input-setup-trigger-section"
        >
          <ODSLabel
            variant="body1"
            style={{
              color: "#263238",
              fontWeight: 500,
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            data-testid="input-setup-trigger-description"
          >
            Manual trigger - Run workflow manually
          </ODSLabel>
        </div>
      );
    }

    // Handle app-based triggers (Integration type with TRIGGER_SETUP subType)
    if (nodeType === INTEGRATION_TYPE && nodeSubType === "TRIGGER_SETUP") {
      const triggerName = node?.name || node?.data?.name || "";
      const description = triggerName
        ? `App-based trigger: ${triggerName}`
        : "App-based trigger configured";
      return (
        <div
          key={index}
          className={classes.triggerContent}
          data-testid="app-based-trigger-section"
        >
          <ODSLabel
            variant="body1"
            style={{
              color: "#263238",
              fontWeight: 500,
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            data-testid="app-based-trigger-description"
          >
            {description}
          </ODSLabel>
        </div>
      );
    }

    return null;
  });
};

export default TriggerContent;
