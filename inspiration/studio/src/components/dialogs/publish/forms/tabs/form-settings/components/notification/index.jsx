import FormSwitch from "../switchAccordian";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";

const SWITCH_IDS = {
  NEW_RESPONSE_NOTIFICATION: "newResponseNotification",
  ENABLE_AUTOMATED_RESPONSE: "enableAutomatedResponse",
  SEND_RESPONSE_COPY: "sendResponseCopy",
};

const NotificationSettings = ({ settings = {}, onSettingsChange }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.bell && <icons.bell className="h-4 w-4 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">Email Notifications</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Configure email notifications to stay informed about form submissions and provide automated responses to your users.
          </AlertDescription>
        </div>
      </Alert>

      <Card className="p-4 bg-muted/30 border-border">
        <div className="flex items-start gap-3">
          {icons.mail && <icons.mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-foreground mb-1.5">Notification Flow</h4>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-foreground font-bold">1.</span>
                <span>User submits form → You receive notification email</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-foreground font-bold">2.</span>
                <span>Automated response sent to user (if enabled)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-foreground font-bold">3.</span>
                <span>Response copy sent to user (if enabled)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <FormSwitch
        id={SWITCH_IDS.NEW_RESPONSE_NOTIFICATION}
        label="New Response Notification"
        description="Get notified via email when someone submits a response to your form."
        icon={icons.bell}
        tooltip="You'll receive an email notification immediately when a form is submitted. Perfect for staying on top of new responses."
        isChecked={settings.newResponseNotification || false}
        onChange={(e) => onSettingsChange({ newResponseNotification: e.target.checked })}
        dataTestId="new-response-notification"
      >
        {settings.newResponseNotification && (
          <Card className="p-3 bg-muted/30 border-border mt-3">
            <div className="flex items-start gap-2">
              {icons.info && <icons.info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <p className="text-xs text-muted-foreground">
                Notification emails will be sent to your account email address. You'll receive one email per form submission.
              </p>
            </div>
          </Card>
        )}
      </FormSwitch>

      <FormSwitch
        id={SWITCH_IDS.ENABLE_AUTOMATED_RESPONSE}
        label="Enable Automated Response Emails"
        description="Send an automated confirmation email to form responders immediately after they submit."
        icon={icons.send}
        tooltip="Users receive an automated email confirming their submission. Great for providing instant feedback and setting expectations."
        isChecked={settings.enableAutomatedResponse || false}
        onChange={(e) => onSettingsChange({ enableAutomatedResponse: e.target.checked })}
        dataTestId="enable-automated-response"
      >
        {settings.enableAutomatedResponse && (
          <Card className="p-3 bg-muted/30 border-border mt-3">
            <div className="flex items-start gap-2">
              {icons.checkCircle && <icons.checkCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">Use Cases</p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  <li>• Confirmation for event registrations</li>
                  <li>• Receipt for form submissions</li>
                  <li>• Next steps instructions</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </FormSwitch>

      <FormSwitch
        id={SWITCH_IDS.SEND_RESPONSE_COPY}
        label="Send Response Copy to Responder"
        description="A copy of their submitted response is sent to the responder's email address."
        icon={icons.copy}
        tooltip="Users receive a complete copy of their submission via email. Useful for records, receipts, or confirmation purposes."
        isChecked={settings.sendResponseCopy || false}
        onChange={(e) => onSettingsChange({ sendResponseCopy: e.target.checked })}
        dataTestId="send-response-copy"
      >
        {settings.sendResponseCopy && (
          <Card className="p-3 bg-muted/30 border-border mt-3">
            <div className="flex items-start gap-2">
              {icons.fileText && <icons.fileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <p className="text-xs text-muted-foreground">
                The responder will receive an email containing all their submitted answers. This helps users keep a record of their submission.
              </p>
            </div>
          </Card>
        )}
      </FormSwitch>
    </div>
  );
};

export default NotificationSettings;
