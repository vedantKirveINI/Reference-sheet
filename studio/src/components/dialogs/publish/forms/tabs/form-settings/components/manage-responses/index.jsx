import ErrorBoundaryLayout from "../../../../../../../error-boundary-layout";
import FormSwitch from "../switchAccordian";
import { NewResponses } from "./new-responses";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";

const SWITCH_IDS = {
  ACCEPT_NEW_RESPONSES: "acceptNewResponses",
  ALLOW_MULTIPLE_SUBMISSIONS: "allowMultipleSubmissions",
  SHOW_FORM_SUMMARY: "showFormSummary",
  AUTO_JUMP_TO_NEXT_QUESTION: "autoJumpToNextQuestion",
  WHATSAPP_HELP_CHATBOT: "whatsAppHelpChatbot",
};

const ManageResponses = ({ settings, onSettingsChange, userData }) => {
  return (
    <div className="flex flex-col w-full space-y-4">
      <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.info && <icons.info className="h-4 w-4 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold leading-normal tracking-normal">Response Management</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed tracking-normal">
            Control how your form accepts and manages responses. Set closing dates, response limits, and redirect URLs to customize the submission experience.
          </AlertDescription>
        </div>
      </Alert>

      <Card className="p-4 bg-muted/30 border-border">
        <div className="flex items-start gap-3">
          {icons.fileText && <icons.fileText className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground mb-1.5 leading-normal tracking-normal">Use Cases</h4>
            <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed tracking-normal">
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span><strong>Events:</strong> Set closing dates for registration deadlines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span><strong>Campaigns:</strong> Limit responses for limited-time offers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span><strong>Testing:</strong> Temporarily close forms during maintenance</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <FormSwitch
        id={SWITCH_IDS.ACCEPT_NEW_RESPONSES}
        label="Accept New Responses"
        description="Enable or disable form submissions. When disabled, users will see a 'Form Closed' message."
        icon={icons.checkCircle}
        isChecked={settings?.accepting_responses}
        onChange={(e) => {
          onSettingsChange({
            accepting_responses: !settings?.accepting_responses,
          });
        }}
        dataTestId="accept-new-responses"
      >
        <ErrorBoundary fallback={<ErrorBoundaryLayout />}>
          <NewResponses
            settings={settings}
            onSettingsChange={onSettingsChange}
            userData={userData}
          />
        </ErrorBoundary>
      </FormSwitch>
    </div>
  );
};

export default ManageResponses;
