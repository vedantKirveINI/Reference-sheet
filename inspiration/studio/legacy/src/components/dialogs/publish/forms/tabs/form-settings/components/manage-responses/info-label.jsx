// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./index.module.css";
import dayjs from "dayjs";

const InfoLabel = ({ settings, userData }) => {
  const timezone = userData?.timezone || dayjs.tz.guess();
  const now = dayjs().tz(timezone);
  const closeAt = settings?.close_at
    ? dayjs(settings.close_at).tz(timezone)
    : null;

  const isClosedByDate =
    settings?.is_close_at_enabled && closeAt ? closeAt.isBefore(now) : false;

  const isClosedByResponses =
    settings?.is_max_responses_enabled &&
    typeof settings.max_responses === "number" &&
    settings.current_responses >= settings.max_responses;

  const isFormAccepting = !isClosedByDate && !isClosedByResponses;

  const getAcceptingMessage = () => {
    const hasDateLimit = settings?.is_close_at_enabled && closeAt;
    const hasMaxResponses =
      settings?.is_max_responses_enabled && settings.max_responses;

    if (!hasDateLimit && !hasMaxResponses) {
      return "Form is accepting new responses";
    }

    let message = "Form is accepting new responses until";

    if (hasDateLimit) {
      message += ` ${closeAt.format("DD-MM-YYYY hh:mm A")}`;
    }

    if (hasDateLimit && hasMaxResponses) {
      message += " or";
    }

    if (hasMaxResponses) {
      message += ` maximum ${settings.max_responses} responses`;
    }

    if (hasDateLimit && hasMaxResponses) {
      message += " (whichever comes first)";
    }

    return message;
  };

  const getClosedMessage = () => {
    if (isClosedByDate && isClosedByResponses) {
      return `Form is closed - reached maximum ${settings.max_responses} responses on ${closeAt.format("DD-MM-YYYY hh:mm A")}`;
    }

    if (isClosedByDate) {
      return `Form is closed - closed on ${closeAt.format("DD-MM-YYYY hh:mm A")}`;
    }

    if (isClosedByResponses) {
      return `Form is closed - reached maximum ${settings.max_responses} responses`;
    }

    return "Form is closed";
  };

  return (
    <div
      className={classes["new-responses-info"]}
      data-testid="new-responses-user-info"
    >
      <Icon
        outeIconName="OUTEInfoIcon"
        outeIconProps={{
          sx: { color: "#FB8C00", height: "1.5rem", width: "1.5rem" },
          "data-testid": "new-responses-user-info-icon",
        }}
      />

      <div>
        <span
          data-testid={"fsmr-new-responses-info-text"}
          className={classes["new-responses-user-info-label"]}
        >
          {isFormAccepting ? getAcceptingMessage() : getClosedMessage()}
        </span>
      </div>
    </div>
  );
};

export default InfoLabel;
