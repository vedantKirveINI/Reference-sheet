import React, { useCallback, useState } from "react";
// import { showAlert } from "oute-ds-alert";
// import Button from "oute-ds-button";
// import Label from "oute-ds-label";
// import TextField from "oute-ds-text-field";
// import CodeBlock from "oute-ds-code-block";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";
// import CircularProgress from "oute-ds-circular-progress";
import styles from "./Configure.module.css";
// import InlineEditor from "oute-ds-inline-editor";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { showAlert, ODSButton as Button, ODSLabel as Label, ODSTextField as TextField, ODSCodeBlock as CodeBlock, ODSCircularProgress as CircularProgress, ODSInlineEditor as InlineEditor, ODSIcon as Icon, ODSTooltip as Tooltip } from "@src/module/ods";

const Configure = ({
  setWebhookName,
  webhookName,
  setInputs,
  inputs,
  setIPRestrictions,
  ipRestrictions,
  webhookData,
  setPolling,
  polling,
  pollIntervalId,
  pollTimeoutId,
  beginPolling,
  createWH,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const pollingHandler = useCallback(() => {
    if (polling) {
      setPolling(false);
      if (pollIntervalId) clearInterval(pollIntervalId);
      if (pollTimeoutId) clearTimeout(pollTimeoutId);
      return;
    }
    if (!webhookData?.uuid) {
      showAlert({
        type: "error",
        message: "Please create webhook url first.",
      });
      return;
    }
    beginPolling(webhookData?.uuid);
  }, [
    beginPolling,
    pollIntervalId,
    pollTimeoutId,
    polling,
    setPolling,
    webhookData?.uuid,
  ]);

  const handleSyncClick = useCallback(
    (value) => {
      setIsRotating(true);
      createWH(value);

      setTimeout(() => setIsRotating(false), 1000);
    },
    [createWH]
  );

  const handleChange = useCallback(
    (value) => {
      setIPRestrictions(value);
      handleSyncClick(value);
    },
    [handleSyncClick, setIPRestrictions]
  );

  return (
    <div
      className={styles.container}
      style={{
        display: "grid",
        gridAutoRows: "auto",
        gap: "1rem",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "flex-end",
          gap: "1rem",
          width: "100%",
        }}
      >
        <div className={styles.group}>
          <Label variant="capital">Webhook Name</Label>
          <TextField
            fullWidth
            data-testid="webhook-name"
            value={webhookName}
            className="black"
            required
            onChange={(e) => setWebhookName(e.target.value)}
          />
        </div>
        {!webhookData?.curl ? (
          <Button
            label="GENERATE WEBHOOK URL"
            data-testid="create-webhook"
            disabled={!webhookName}
            onClick={() => createWH(ipRestrictions)}
            variant="black"
            size="large"
          />
        ) : (
          <div
            style={{
              cursor: webhookName ? "pointer" : "not-allowed",
              border: "1px solid #333",
              borderRadius: "4px",
              padding: "0.45rem",
            }}
          >
            <Tooltip
              title={
                !webhookName ? "Webhook name is missing" : "Refresh Webhook URL"
              }
            >
              <Icon
                outeIconName="OUTESyncIcon"
                onClick={() => handleSyncClick(ipRestrictions)}
                outeIconProps={{
                  sx: {
                    color: "#212121",
                    transform: isRotating ? "rotate(-360deg)" : "rotate(0deg)",
                    transition: isRotating
                      ? "transform 1s ease-in-out"
                      : "none",
                  },
                }}
                buttonProps={{
                  "data-testid": "refresh-webhook",
                  disabled: !webhookName,
                  sx: {
                    cursor: webhookName ? "pointer" : "not-allowed",
                  },
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
      <div className={styles.group}>
        <Label variant="capital">ALLOWED IPS</Label>

        <InlineEditor
          value={ipRestrictions}
          fullWidth
          onChange={handleChange}
          textFieldProps={{
            "data-testid": "ip-restrictions-field",
          }}
          placeholder="Please enter whitelist of IP addresses seperated by comma."
          showActionButtons={true}
        />
      </div>
      <div
        style={{
          borderRadius: "6px",
          border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
          padding: "0.5rem",
          display: "grid",
          gridAutoRows: "max-content",
          gap: "0.5rem",
        }}
      >
        <div className={styles.group}>
          <Label variant="capital">Webhook URL</Label>
          <CodeBlock disabled={!webhookData?.webhook_url}>
            {webhookData?.webhook_url ||
              "Click Create Webhook to generate webhook url"}
          </CodeBlock>
        </div>
        <div className={styles.group}>
          <Label variant="capital">Webhook CURL</Label>
          <CodeBlock disabled={!webhookData?.curl} data-testid="webhook-url">
            {webhookData?.curl ||
              "Click Create Webhook to generate webhook curl"}
          </CodeBlock>
        </div>
      </div>
      {webhookData?.uuid && (
        <div style={{ display: "grid", gridAutoRows: "auto", gap: "1rem" }}>
          {polling && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "1rem",
                alignItems: "center",
                borderRadius: "6px",
                border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
                padding: "1rem",
              }}
            >
              <CircularProgress
                sx={{ color: "#212121", width: "1.5rem", height: "1.5rem" }}
              />
              <Label variant="subtitle1">
                Tinycommand is now listening for the data and will determine the
                data structure from the incoming data automatically. <br />
                To initiate this, please send your data sample to the webhook
                address displayed above.
              </Label>
            </div>
          )}
          {!polling && inputs && (
            <InputGridV2
              isValueMode={false}
              initialValue={inputs}
              onGridDataChange={(data) => setInputs(data)}
              hideHeaderAndMap
              showNote={false}
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              padding: "1rem",
            }}
          >
            <Button
              variant={polling ? "contained" : "black-outlined"}
              data-testid={polling ? "stop-button" : "redetermine-data-button"}
              label={polling ? "STOP" : "REDETERMINE DATA STRUCTURE"}
              onClick={pollingHandler}
              color={polling ? "error" : "primary"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Configure;
