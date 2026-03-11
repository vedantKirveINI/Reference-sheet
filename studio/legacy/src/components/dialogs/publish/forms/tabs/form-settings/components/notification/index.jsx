import FormSwitch from "../switchAccordian";
import classes from "./notification-settings.module.css";

const SWITCH_IDS = {
  NEW_RESPONSE_NOTIFICATION: "newResponseNotification",
  ENABLE_AUTOMATED_RESPONSE: "enableAutomatedResponse",
  SEND_RESPONSE_COPY: "sendResponseCopy",
};

const NotificationSettings = ({ settings, onSettingsChange }) => {
  return (
    <div
      className={classes.notificationSettingsContainer}
      data-testid="notification-settings-container"
    >
      <FormSwitch
        id={SWITCH_IDS.NEW_RESPONSE_NOTIFICATION}
        label="New Response Notification"
        isChecked={settings.newResponseNotification}
        onChange={onSettingsChange(SWITCH_IDS.NEW_RESPONSE_NOTIFICATION)}
      />

      <FormSwitch
        id={SWITCH_IDS.ENABLE_AUTOMATED_RESPONSE}
        label="Enable Automated Response Emails for Responders"
        description="Set an automated response email for form responders when they successfully submit their form."
        isChecked={settings.enableAutomatedResponse}
        onChange={onSettingsChange(SWITCH_IDS.ENABLE_AUTOMATED_RESPONSE)}
      />

      <FormSwitch
        id={SWITCH_IDS.SEND_RESPONSE_COPY}
        label="Send a copy of the response to the responder"
        description="A copy of the response is sent to the responder on the email provided."
        isChecked={settings.sendResponseCopy}
        onChange={onSettingsChange(SWITCH_IDS.SEND_RESPONSE_COPY)}
      />
    </div>
  );
};

export default NotificationSettings;
