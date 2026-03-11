import { useState, useCallback } from "react";
import classes from "./index.module.css";
// import ODSLabel from "oute-ds-label";
// import ODSSwitch from "oute-ds-switch";
// import ODSTextField from "oute-ds-text-field";
// import ODSTooltip from "oute-ds-tooltip";
// import ODSIcon from "oute-ds-icon";
import { ODSLabel, ODSSwitch, ODSTextField, ODSTooltip, ODSIcon } from "@src/module/ods";
import InfoLabel from "./info-label";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { validateRedirectUrl } from "../../utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export const NewResponses = ({ settings, onSettingsChange, userData }) => {
  const [urlError, setUrlError] = useState("");

  function isoUtcToDateTimeLocal(isoString) {
    if (!isoString) return "";

    try {
      const timezone = userData?.timezone || dayjs.tz.guess();
      const dt = dayjs(isoString).tz(timezone);
      return dt.format("YYYY-MM-DDTHH:mm");
    } catch (error) {
      console.error("Error converting ISO date to datetime-local:", error);
      return "";
    }
  }

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
    <div className={classes["new-responses-container"]}>
      <InfoLabel settings={settings} userData={userData} />

      <div className={classes["close-date-container"]}>
        <div className={classes["close-date-info"]}>
          <ODSLabel
            variant="h6"
            children="Set Closing Date"
            className={classes["close-date-label"]}
            onClick={() => {
              onSettingsChange({
                is_close_at_enabled: !settings?.is_close_at_enabled,
              });
            }}
          />
          <ODSSwitch
            variant="black"
            checked={settings?.is_close_at_enabled}
            onChange={() => {
              onSettingsChange({
                is_close_at_enabled: !settings?.is_close_at_enabled,
              });
            }}
            className={classes["close-date-switch"]}
            inputProps={{ "data-testid": "closing-date-switch" }}
            size="small"
          />
        </div>
        {settings?.is_close_at_enabled && (
          <div
            className={classes["close-date-form-content"]}
            data-testid="closing-date-content"
          >
            <div className={classes["input-group"]}>
              <ODSLabel variant="body2" children="Date and Time" />
              <input
                data-testid="closing-date-input"
                type="datetime-local"
                value={isoUtcToDateTimeLocal(settings?.close_at)}
                onChange={(e) => {
                  const localValue = e.target.value; // "2025-01-10T14:30"
                  const userTZ = userData?.timezone || dayjs.tz.guess(); // e.g. "Asia/Kolkata"

                  const finalISO = dayjs.tz(localValue, userTZ).format();

                  onSettingsChange({ close_at: finalISO });
                }}
                min={dayjs().tz(userData?.timezone).format("YYYY-MM-DDTHH:mm")} // min = now, local datetime truncated to minutes
                style={{ width: "200px", padding: "0.25rem" }}
                className={classes["date-time-input"]}
              />
            </div>
          </div>
        )}
      </div>

      <div className={classes["cookie-consent-container"]}>
        <ODSLabel
          variant="h6"
          className={classes["cookie-consent-label"]}
          onClick={() => {
            onSettingsChange({
              is_cookie_consent_enabled: !settings?.is_cookie_consent_enabled,
            });
          }}
        >
          Cookie Consent
        </ODSLabel>
        <ODSSwitch
          variant="black"
          checked={settings?.is_cookie_consent_enabled}
          onChange={() => {
            onSettingsChange({
              is_cookie_consent_enabled: !settings?.is_cookie_consent_enabled,
            });
          }}
          className={classes["cookie-consent-switch"]}
          inputProps={{ "data-testid": "cookie-consent-switch" }}
          size="small"
        />
      </div>

      <div className={classes["response-limit-container"]}>
        <div className={classes["response-limit-info"]}>
          <ODSLabel
            variant="h6"
            children="Set Response limit"
            className={classes["response-limit-label"]}
            onClick={() => {
              onSettingsChange({
                is_max_responses_enabled: !settings?.is_max_responses_enabled,
              });
            }}
          />
          <ODSSwitch
            variant="black"
            checked={settings?.is_max_responses_enabled}
            onChange={() => {
              if (settings?.is_max_responses_enabled) {
                onSettingsChange({
                  is_max_responses_enabled: false,
                  max_responses: null,
                });
              } else {
                onSettingsChange({
                  is_max_responses_enabled: true,
                });
              }
            }}
            inputProps={{ "data-testid": "response-limit-switch" }}
            className={classes["response-limit-switch"]}
            size="small"
          />
        </div>
        {settings?.is_max_responses_enabled && (
          <div
            data-testid="response-limit-content"
            className={classes["response-limit-form-content"]}
          >
            <div className={classes["input-group"]}>
              <ODSLabel
                variant="body2"
                children="Max Responses"
                className={classes["input-label"]}
              />
              <ODSTextField
                type="number"
                className="black"
                value={settings?.max_responses}
                onChange={(e) => {
                  onSettingsChange({ max_responses: parseInt(e.target.value) });
                }}
                placeholder="250"
                inputProps={{ "data-testid": "response-limit-input" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    width: "13.25rem",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={classes["redirect-url-container"]}>
        <div className={classes["redirect-url-header"]}>
          <div className={classes["redirect-url-title-group"]}>
            <ODSLabel variant="h6" className={classes["redirect-url-label"]}>
              Redirect After Submission
            </ODSLabel>
            <ODSTooltip
              title="After users submit your form, they will be automatically redirected to the URL you provide. Leave empty to show the default thank you message."
              placement="top"
            >
              <ODSIcon
                outeIconName="OUTEInfoIcon"
                outeIconProps={{
                  sx: {
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#607D8B",
                    cursor: "help",
                  },
                }}
              />
            </ODSTooltip>
          </div>
        </div>

        <div className={classes["redirect-url-input-container"]}>
          <ODSTextField
            type="url"
            className="black"
            value={settings?.redirect_url || ""}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com/thank-you"
            inputProps={{
              "data-testid": "redirect-url-input",
            }}
            error={!!urlError}
            helperText={
              urlError || "Leave empty to show default thank you message"
            }
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                width: "100%",
              },
            }}
          />
        </div>

        {settings?.redirect_url && !urlError && (
          <div className={classes["redirect-url-preview"]}>
            <ODSIcon
              outeIconName="CheckIcon"
              outeIconProps={{
                sx: {
                  color: "#4CAF50",
                  height: "1.25rem",
                  width: "1.25rem",
                },
              }}
            />
            <ODSLabel variant="body2" sx={{ color: "#546E7A" }}>
              Users will be redirected to:{" "}
              <span className={classes["redirect-url-preview-link"]}>
                {settings.redirect_url}
              </span>
            </ODSLabel>
          </div>
        )}

        {!settings?.redirect_url && (
          <div className={classes["redirect-url-default-info"]}>
            <ODSIcon
              outeIconName="OUTEInfoIcon"
              outeIconProps={{
                sx: {
                  color: "#1976D2",
                  height: "1.25rem",
                  width: "1.25rem",
                },
              }}
            />
            <ODSLabel variant="body2" sx={{ color: "#546E7A" }}>
              If no URL is provided, users will see a default "Thank you"
              message after submission.
            </ODSLabel>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewResponses;
