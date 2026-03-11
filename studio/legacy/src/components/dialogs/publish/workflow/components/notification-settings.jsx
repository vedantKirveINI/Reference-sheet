import classes from "./notification-settings.module.css";
// import ODSLabel from "oute-ds-label";
// import ODSIcon from "oute-ds-icon";
// import ODSSwitch from "oute-ds-switch";
import { ODSLabel, ODSIcon, ODSSwitch } from "@src/module/ods";

const NotificationSettings = ({
  notificationEnabled = false,
  onNotificationToggle = () => {},
}) => (
  <div
    className={classes["notification-section"]}
    data-testid="notification-settings"
  >
    <div className={classes["notification-container"]}>
      <div
        className="notification-section-header"
        data-testid="notification-settings-header"
      >
        <ODSLabel
          variant="body1"
          sx={{
            fontWeight: 600,
            color: " #263238",
            lineHeight: "2rem",
          }}
          data-testid="notification-settings-title"
        >
          Notification Settings
        </ODSLabel>
        <ODSLabel
          variant="body2"
          sx={{ fontWeight: 400, color: "#607D8B", lineHeight: "1.25rem" }}
          data-testid="notification-settings-description"
        >
          You will receive notifications on below channels in case of any error
          in workflow
        </ODSLabel>
      </div>

      <div className={classes["notification-section-content"]}>
        <div className={classes["notification-section-item"]}>
          <div className={classes["notification-section-item-header"]}>
            <ODSIcon
              outeIconName="MailIcon"
              outeIconProps={{
                "data-testid": "notification-mail-icon",
                sx: { color: "#5F6368", height: "2rem", width: "2rem" },
              }}
            />

            <div className={classes["notification-section-item-content"]}>
              <ODSLabel
                variant="body1"
                sx={{
                  fontWeight: 400,
                  color: " #263238",
                  lineHeight: "2rem",
                }}
                data-testid="notification-settings-item-header"
              >
                Email Notifications
              </ODSLabel>
              <ODSLabel
                variant="subtitle2"
                sx={{
                  fontWeight: 400,
                  color: "#607D8B",
                  lineHeight: "1.25rem",
                }}
                data-testid="notification-settings-item-description"
              >
                Get notification on registered email address
              </ODSLabel>
            </div>
          </div>

          <ODSSwitch
            variant="black"
            id="notification-email-switch"
            checked={notificationEnabled}
            onChange={onNotificationToggle}
            data-testid="notification-email-switch"
          />
        </div>
      </div>
    </div>
  </div>
);

export default NotificationSettings;
