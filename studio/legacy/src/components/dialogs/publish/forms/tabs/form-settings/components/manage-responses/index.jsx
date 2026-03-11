import ErrorBoundaryLayout from "../../../../../../../error-boundary-layout";
import FormSwitch from "../switchAccordian";
import classes from "./index.module.css";
import { NewResponses } from "./new-responses";
import { ErrorBoundary } from "react-error-boundary";

const SWITCH_IDS = {
  ACCEPT_NEW_RESPONSES: "acceptNewResponses",
  ALLOW_MULTIPLE_SUBMISSIONS: "allowMultipleSubmissions",
  SHOW_FORM_SUMMARY: "showFormSummary",
  AUTO_JUMP_TO_NEXT_QUESTION: "autoJumpToNextQuestion",
  WHATSAPP_HELP_CHATBOT: "whatsAppHelpChatbot",
};

const ManageResponses = ({ settings, onSettingsChange, userData }) => {
  return (
    <div className={classes.manageResponsesContainer}>
      <FormSwitch
        id={SWITCH_IDS.ACCEPT_NEW_RESPONSES}
        label="Accept New Responses"
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

      {/* <FormSwitch
        id={SWITCH_IDS.ALLOW_MULTIPLE_SUBMISSIONS}
        label="Allow multiple submissions"
        description="Multiple submissions are allowed. If disabled, only one response will be accepted per IP address."
        isChecked={settings.allowMultipleSubmissions}
        onChange={onSettingsChange(SWITCH_IDS.ALLOW_MULTIPLE_SUBMISSIONS)}
      /> */}

      {/* <FormSwitch
        id={SWITCH_IDS.SHOW_FORM_SUMMARY}
        label="Show Form Summary"
        description="Review all your previous answers before submitting the form."
        isChecked={settings.showFormSummary}
        onChange={onSettingsChange(SWITCH_IDS.SHOW_FORM_SUMMARY)}
      /> */}

      {/* <FormSwitch
        id={SWITCH_IDS.AUTO_JUMP_TO_NEXT_QUESTION}
        label="Auto Jump to next Question"
        description="Will automatically move to the next question. Applicable only for Card view forms."
        isChecked={settings.autoJumpToNextQuestion}
        onChange={onSettingsChange(SWITCH_IDS.AUTO_JUMP_TO_NEXT_QUESTION)}
      /> */}

      {/* <FormSwitch
        id={SWITCH_IDS.WHATSAPP_HELP_CHATBOT}
        label="WhatsApp Help Chatbot"
        description="A WhatsApp bot will be added to your form and the responder can easily send a message to the provided phone number."
        isChecked={settings.whatsAppHelpChatbot}
        onChange={onSettingsChange(SWITCH_IDS.WHATSAPP_HELP_CHATBOT)}
      /> */}
    </div>
  );
};

export default ManageResponses;
