import { useState, useCallback } from "react";
import classes from "./index.module.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import InfoLabel from "./info-label";
import FormSwitch from "../switchAccordian";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { validateRedirectUrl } from "../../utils";
dayjs.extend(utc);
dayjs.extend(timezone);

export const NewResponses = ({ settings, onSettingsChange, userData }) => {
  const [urlError, setUrlError] = useState("");

  const handleUrlChange = useCallback(
    (event) => {
      const newUrl = event.target.value;
      onSettingsChange({
        redirect_url: newUrl,
      });
      // Clear error on change, will validate on blur
      if (urlError) {
        setUrlError("");
      }
    },
    [onSettingsChange, urlError],
  );

  const handleUrlBlur = useCallback(
    (event) => {
      const url = event.target.value;
      const validation = validateRedirectUrl(url);

      if (!validation.isValid) {
        setUrlError(validation.error);
      } else {
        setUrlError("");
        // Auto-fix the URL if it was fixed (e.g., added https://)
        if (validation.fixedUrl && validation.fixedUrl !== url) {
          onSettingsChange({
            redirect_url: validation.fixedUrl,
          });
        }
      }
    },
    [onSettingsChange],
  );

  return (
    <div className="flex flex-col w-full space-y-4">
      <InfoLabel settings={settings} userData={userData} />

      <FormSwitch
        id="closing-date-switch"
        label="Set Closing Date"
        icon={icons.calendar}
        tooltip="Automatically close your form at a specific date and time. Perfect for event registrations with deadlines."
        isChecked={settings?.is_close_at_enabled}
        onChange={(e) => {
          onSettingsChange({
            is_close_at_enabled: e.target.checked,
          });
        }}
        dataTestId="closing-date"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="closing-date-input"
              className="text-xs text-muted-foreground"
            >
              Date and Time
            </Label>
            <DateTimePicker
              value={settings?.close_at || null}
              onChange={(isoString) => {
                onSettingsChange({ close_at: isoString });
              }}
              placeholder="Select closing date and time"
              userTimezone={userData?.timezone}
              min={dayjs()
                .tz(userData?.timezone || dayjs.tz.guess())
                .format()}
              className="w-full"
              data-testid="closing-date-input"
            />
          </div>
          <Card className="p-3 bg-muted/30 border-border">
            <div className="flex items-start gap-2">
              {icons.calendar && (
                <icons.calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">
                  Use Cases
                </p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  <li>• Event registrations with deadlines</li>
                  <li>• Limited-time campaigns and promotions</li>
                  <li>• Scheduled maintenance periods</li>
                </ul>
              </div>
            </div>
          </Card>
          <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
            {icons.clock && <icons.clock className="h-4 w-4 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <AlertTitle className="text-xs font-semibold">
                Closing Date
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                The form will automatically stop accepting responses at the
                specified date and time. Users will see a "Form Closed" message
                after this time.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </FormSwitch>

      <FormSwitch
        id="cookie-consent-switch"
        label="Cookie Consent"
        icon={icons.checkCircle}
        tooltip="Display a cookie consent banner to comply with GDPR and privacy regulations. Required for forms collecting data from EU users."
        isChecked={settings?.is_cookie_consent_enabled}
        onChange={(e) => {
          onSettingsChange({
            is_cookie_consent_enabled: e.target.checked,
          });
        }}
        dataTestId="cookie-consent"
      >
        <Alert className="bg-muted/50 border-border mt-3 flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
          {icons.checkCircle && (
            <icons.checkCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertTitle className="text-xs font-semibold">
              GDPR Compliance
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              A cookie consent banner will be displayed to users, allowing them
              to accept or decline cookies before submitting the form.
            </AlertDescription>
          </div>
        </Alert>
      </FormSwitch>

      <FormSwitch
        id="response-limit-switch"
        label="Set Response Limit"
        icon={icons.users2}
        tooltip="Limit the total number of responses your form can accept. Once reached, the form will automatically close."
        isChecked={settings?.is_max_responses_enabled}
        onChange={(e) => {
          if (e.target.checked) {
            onSettingsChange({
              is_max_responses_enabled: true,
            });
          } else {
            onSettingsChange({
              is_max_responses_enabled: false,
              max_responses: null,
            });
          }
        }}
        dataTestId="response-limit"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="response-limit-input"
              className="text-xs text-muted-foreground"
            >
              Max Responses
            </Label>
            <Input
              id="response-limit-input"
              type="number"
              value={settings?.max_responses || ""}
              onChange={(e) => {
                const value = e.target.value;
                onSettingsChange({
                  max_responses: value ? parseInt(value) : null,
                });
              }}
              placeholder="250"
              data-testid="response-limit-input"
              className="w-[200px]"
            />
          </div>
          <Card className="p-3 bg-muted/30 border-border">
            <div className="flex items-start gap-2">
              {icons.users2 && (
                <icons.users2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">
                  Use Cases
                </p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  <li>• Limited event capacity (e.g., 100 seats)</li>
                  <li>• Beta testing with limited participants</li>
                  <li>• First-come-first-served promotions</li>
                </ul>
              </div>
            </div>
          </Card>
          <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
            {icons.users2 && (
              <icons.users2 className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertTitle className="text-xs font-semibold">
                Response Limit
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Once the form reaches this number of responses, it will
                automatically stop accepting new submissions. Useful for
                limited-time campaigns or events.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </FormSwitch>

      <div className="flex flex-col gap-4 pt-4 border-t border-border">
        <div className="flex items-start gap-2 w-full">
          {icons.externalLink && (
            <div className="flex items-center justify-center w-5 h-5 rounded-md bg-muted shrink-0 mt-0.5">
              <icons.externalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Label className="text-sm font-semibold text-foreground">
              Redirect After Submission
            </Label>
            <p className="text-sm text-muted-foreground">
              Redirect users to a custom URL after form submission
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            type="url"
            value={settings?.redirect_url || ""}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com/thank-you"
            data-testid="redirect-url-input"
            className={cn(
              "w-full",
              urlError && "border-destructive focus-visible:ring-destructive",
            )}
          />
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          {!urlError && (
            <p className="text-xs text-muted-foreground">
              Leave empty to show default thank you message
            </p>
          )}
        </div>

        {settings?.redirect_url && !urlError && (
          <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
            {icons.checkCircle && (
              <icons.checkCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertTitle className="text-xs font-semibold">
                Redirect Enabled
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Users will be redirected to:{" "}
                <span className="font-medium text-foreground break-all">
                  {settings.redirect_url}
                </span>
              </AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default NewResponses;
