import React from "react";
import { AlertCircle } from "lucide-react";
import { TRIGGER_TYPES, TRIGGER_TYPE_OPTIONS, THEME } from "../constants";
import ManualPanel from "./panels/ManualPanel";
import TimeBasedPanel from "./panels/TimeBasedPanel";
import WebhookPanel from "./panels/WebhookPanel";
import FormPanel from "./panels/FormPanel";
import SheetPanel from "./panels/SheetPanel";
import DateFieldPanel from "./panels/DateFieldPanel";
import AppBasedPanel from "./panels/AppBasedPanel";

const ConfigureTab = ({ state, variables, webhookUrl, workspaceId, assetId }) => {
  const { triggerType, validation } = state;

  if (!triggerType) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: `${THEME.accentColor}08` }}
        >
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: THEME.accentColor }}
          />
          <h3 className="font-semibold text-foreground mb-2">
            No Trigger Selected
          </h3>
          <p className="text-muted-foreground text-sm">
            Please go back to the Initialise tab and select a trigger type first.
          </p>
        </div>
      </div>
    );
  }

  const currentTrigger = TRIGGER_TYPE_OPTIONS.find((t) => t.id === triggerType);

  const renderPanel = () => {
    switch (triggerType) {
      case TRIGGER_TYPES.MANUAL:
        return <ManualPanel state={state} variables={variables} />;
      case TRIGGER_TYPES.TIME_BASED:
        return <TimeBasedPanel state={state} />;
      case TRIGGER_TYPES.WEBHOOK:
        return <WebhookPanel state={state} variables={variables} webhookUrl={webhookUrl} assetId={assetId} />;
      case TRIGGER_TYPES.FORM:
        return <FormPanel state={state} variables={variables} workspaceId={workspaceId} />;
      case TRIGGER_TYPES.SHEET:
        return <SheetPanel state={state} variables={variables} workspaceId={workspaceId} assetId={assetId} />;
      case TRIGGER_TYPES.DATE_FIELD:
        return <DateFieldPanel state={state} variables={variables} workspaceId={workspaceId} assetId={assetId} />;
      case TRIGGER_TYPES.APP_BASED:
        return <AppBasedPanel state={state} variables={variables} />;
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            Configuration for this trigger type is not yet available.
          </div>
        );
    }
  };

  return (
    <div className="space-y-0">
      {renderPanel()}

      {!validation.isValid && validation.errors.length > 0 && (
        <div className="mx-6 mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <ul className="text-sm text-red-600 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
