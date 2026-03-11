import { Alert, AlertDescription } from "@/components/ui/alert";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
    <Alert
      className={cn(
        isFormAccepting
          ? "bg-muted/50 border-border"
          : "bg-destructive/10 border-destructive/20",
        "flex items-center gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0",
      )}
      data-testid="new-responses-user-info"
    >
      {icons.info && (
        <icons.info
          className={cn(
            "h-4 w-4 shrink-0",
            isFormAccepting ? "text-muted-foreground" : "text-destructive",
          )}
          data-testid="new-responses-user-info-icon"
        />
      )}
      <AlertDescription
        data-testid="fsmr-new-responses-info-text"
        className={cn(
          "text-sm !transform-none",
          isFormAccepting ? "text-muted-foreground" : "text-destructive",
        )}
      >
        {isFormAccepting ? getAcceptingMessage() : getClosedMessage()}
      </AlertDescription>
    </Alert>
  );
};

export default InfoLabel;
