import React, { useState, useMemo } from "react";
import {
  Play,
  Clock,
  Webhook,
  FileText,
  Table,
  Calendar,
  Plug,
  Zap,
  ArrowRight,
  Search,
  ChevronLeft,
  Link2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TRIGGER_TYPE_OPTIONS,
  TRIGGER_TEMPLATES,
  TRIGGER_TYPES,
  TRIGGER_CATEGORIES,
  TRIGGER_ICON_SRC,
  THEME,
} from "../constants";
import { getTriggerTheme, getTriggerIcon, getTriggerColors } from "../triggerThemeRegistry";
import { FormSourcePicker, SheetSourcePicker, DateFieldSourcePicker } from "./source-pickers";

const FALLBACK_INTEGRATIONS = [
  {
    _id: "slack",
    name: "Slack",
    meta: { thumbnail: "https://cdn-v1.tinycommand.com/integrations/slack.svg" },
    color: "#4A154B",
    events: [
      { _id: "new_message", name: "New Message", description: "Triggers when a new message is posted", annotation: "TRIGGER" },
      { _id: "reaction_added", name: "Reaction Added", description: "Triggers when a reaction is added", annotation: "TRIGGER" },
    ],
  },
  {
    _id: "stripe",
    name: "Stripe",
    meta: { thumbnail: "https://cdn-v1.tinycommand.com/integrations/stripe.svg" },
    color: "#635BFF",
    events: [
      { _id: "payment_received", name: "Payment Received", description: "Triggers when a payment is successful", annotation: "TRIGGER" },
      { _id: "subscription_created", name: "Subscription Created", description: "Triggers when a new subscription starts", annotation: "TRIGGER" },
    ],
  },
  {
    _id: "github",
    name: "GitHub",
    meta: { thumbnail: "https://cdn-v1.tinycommand.com/integrations/github.svg" },
    color: "#24292E",
    events: [
      { _id: "push", name: "Push", description: "Triggers on code push to repository", annotation: "TRIGGER" },
      { _id: "pull_request", name: "Pull Request", description: "Triggers on pull request events", annotation: "TRIGGER" },
    ],
  },
  {
    _id: "hubspot",
    name: "HubSpot",
    meta: { thumbnail: "https://cdn-v1.tinycommand.com/integrations/hubspot.svg" },
    color: "#FF7A59",
    events: [
      { _id: "contact_created", name: "Contact Created", description: "Triggers when a new contact is added", annotation: "TRIGGER" },
      { _id: "deal_won", name: "Deal Won", description: "Triggers when a deal is closed won", annotation: "TRIGGER" },
    ],
  },
];

const getIcon = (iconName) => {
  const icons = {
    Play,
    Clock,
    Webhook,
    FileText,
    Table,
    Calendar,
    Plug,
    Zap,
  };
  return icons[iconName] || Zap;
};

const TriggerTypeCard = ({ option, isSelected, onClick }) => {
  const theme = getTriggerTheme(option.id);
  const iconData = getTriggerIcon(option.id, true);
  const colors = theme.colors;
  // Prefer legacy CDN URL from option._src so each card shows the correct trigger icon
  const imgSrc =
    typeof option._src === "string"
      ? option._src
      : iconData.type === "svg" && typeof iconData.src === "string"
        ? iconData.src
        : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-lg border transition-all text-left group",
        isSelected
          ? "shadow-sm"
          : "border-border hover:border-muted-foreground/30 bg-background"
      )}
      style={{
        borderColor: isSelected ? colors.primary : undefined,
        backgroundColor: isSelected ? colors.bg : undefined,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isSelected ? colors.primary : colors.light,
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={option.name}
              className="w-5 h-5 object-contain"
              style={{
                filter: isSelected ? "brightness(0) invert(1)" : "none",
              }}
            />
          ) : (() => {
            const IconComp = iconData.component;
            return (
              <IconComp
                className="w-4 h-4"
                style={{ color: isSelected ? "#fff" : colors.primary }}
              />
            );
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm leading-tight"
            style={{ color: isSelected ? colors.text : undefined }}
          >
            {option.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {option.description}
          </p>
        </div>
      </div>
      {isSelected && (
        <div
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
};

const TemplateCard = ({ template, onSelect }) => {
  const theme = getTriggerTheme(template.triggerType);
  const iconData = getTriggerIcon(template.triggerType, true);
  const colors = theme.colors;
  const templateImgSrc =
    (TRIGGER_ICON_SRC[template.triggerType] && typeof TRIGGER_ICON_SRC[template.triggerType] === "string")
      ? TRIGGER_ICON_SRC[template.triggerType]
      : iconData.type === "svg" && typeof iconData.src === "string"
        ? iconData.src
        : null;

  return (
    <button
      onClick={() => onSelect(template.id)}
      className="p-2.5 rounded-md border border-border hover:bg-muted/50 transition-all text-left group"
      style={{
        "--hover-border": colors.border,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: colors.light }}
        >
          {templateImgSrc ? (
            <img
              src={templateImgSrc}
              alt={template.name}
              className="w-4 h-4 object-contain"
            />
          ) : (() => {
            const IconComp = iconData.component;
            return (
              <IconComp
                className="w-3.5 h-3.5"
                style={{ color: colors.primary }}
              />
            );
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm text-foreground leading-tight">{template.name}</h5>
          <p className="text-xs text-muted-foreground truncate">
            {template.description}
          </p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

const IntegrationSetupInline = ({ state, integrations: propsIntegrations = [], eventData }) => {
  const {
    integration,
    setIntegration,
    integrationEvent,
    setIntegrationEvent,
    integrationConnection,
    setIntegrationConnection,
  } = state;

  const [searchQuery, setSearchQuery] = useState("");

  const availableIntegrations = propsIntegrations?.length > 0 ? propsIntegrations : FALLBACK_INTEGRATIONS;

  const currentStep = useMemo(() => {
    if (!integration) return 1;
    if (!integrationEvent) return 2;
    if (!integrationConnection) return 3;
    return 4;
  }, [integration, integrationEvent, integrationConnection]);

  const filteredIntegrations = availableIntegrations.filter((int) =>
    int.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerEvents = useMemo(() => {
    if (!integration?.events) return [];
    return integration.events.filter((e) => e.annotation === "TRIGGER");
  }, [integration]);

  const handleSelectIntegration = (int) => {
    setIntegration(int);
    setIntegrationEvent(null);
    setIntegrationConnection(null);
  };

  const handleSelectEvent = (event) => {
    setIntegrationEvent(event);
    setIntegrationConnection(null);
  };

  const handleConnect = () => {
    setIntegrationConnection({ id: "conn_123", status: "connected" });
  };

  const handleBackToApps = () => {
    setIntegration(null);
    setIntegrationEvent(null);
    setIntegrationConnection(null);
  };

  const handleBackToEvents = () => {
    setIntegrationEvent(null);
    setIntegrationConnection(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-4">
      {[
        { label: "App", step: 1 },
        { label: "Event", step: 2 },
        { label: "Connect", step: 3 },
      ].map(({ label, step }, idx) => (
        <React.Fragment key={label}>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              currentStep >= step
                ? "bg-[#6366F1] text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                currentStep >= step ? "bg-white/20" : "bg-muted-foreground/20"
              )}
            >
              {currentStep > step ? <CheckCircle2 className="w-2.5 h-2.5" /> : step}
            </span>
            {label}
          </div>
          {idx < 2 && (
            <div className={cn(
              "w-6 h-0.5 rounded",
              currentStep > step ? "bg-[#6366F1]" : "bg-muted"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#6366F1] flex items-center justify-center">
          <Plug className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium">Connect an App</span>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="pl-10 bg-background"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
            {filteredIntegrations.map((int) => (
              <button
                key={int._id}
                onClick={() => handleSelectIntegration(int)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:shadow-md bg-background",
                  integration?._id === int._id
                    ? "border-[#6366F1] bg-[#6366F1]/5"
                    : "border-border hover:border-[#6366F1]/50"
                )}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${int.color || "#6366F1"}15` }}
                >
                  <img
                    src={int.meta?.thumbnail || int.icon}
                    alt={int.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-center">{int.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && integration && (
        <div className="space-y-3">
          <button
            onClick={handleBackToApps}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Change app
          </button>

          <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${integration.color || "#6366F1"}15` }}
            >
              <img
                src={integration.meta?.thumbnail || integration.icon}
                alt={integration.name}
                className="w-4 h-4"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <span className="text-sm font-medium">{integration.name}</span>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {triggerEvents.map((event) => (
              <button
                key={event._id}
                onClick={() => handleSelectEvent(event)}
                className={cn(
                  "w-full p-3 rounded-xl border-2 transition-all text-left hover:shadow-sm bg-background",
                  integrationEvent?._id === event._id
                    ? "border-[#6366F1] bg-[#6366F1]/5"
                    : "border-border hover:border-[#6366F1]/50"
                )}
              >
                <p className="font-medium text-sm">{event.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.description || "Trigger event"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && integration && integrationEvent && (
        <div className="space-y-3">
          <button
            onClick={handleBackToEvents}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Change event
          </button>

          <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${integration.color || "#6366F1"}15` }}
            >
              <img
                src={integration.meta?.thumbnail || integration.icon}
                alt={integration.name}
                className="w-4 h-4"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <span className="text-sm font-medium">{integration.name}</span>
              <p className="text-xs text-muted-foreground">{integrationEvent.name}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-[#6366F1]/30 bg-background text-center">
            <Link2 className="w-8 h-8 text-[#6366F1]/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              Connect your {integration.name} account to enable this trigger
            </p>
            <Button
              onClick={handleConnect}
              size="sm"
              className="bg-[#6366F1] hover:bg-[#5558DD] text-white"
            >
              <Link2 className="w-3 h-3 mr-1.5" />
              Connect {integration.name}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 4 && integrationConnection && (
        <div className="p-3 rounded-xl border border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${integration?.color || "#6366F1"}15` }}
            >
              <img
                src={integration?.meta?.thumbnail || integration?.icon}
                alt={integration?.name}
                className="w-5 h-5"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-900 text-sm">{integration?.name}</p>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-green-700">{integrationEvent?.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleBackToApps}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TriggerCategorySection = ({ 
  category, 
  triggers, 
  triggerType, 
  onSelect, 
  icon: CategoryIcon,
  gridCols = 3,
  featured = false,
  children 
}) => {
  const categoryColor = category.color;
  const hasSelectedTrigger = triggers.some(t => t.id === triggerType);
  
  return (
    <div 
      className={cn(
        "rounded-xl border p-4 transition-all",
        featured ? "border-2" : "border"
      )}
      style={{ 
        borderColor: featured ? `${categoryColor}30` : `${categoryColor}20`,
        backgroundColor: `${categoryColor}03`
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: categoryColor }}
        >
          <CategoryIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 
            className="text-xs font-bold tracking-wide uppercase"
            style={{ color: categoryColor }}
          >
            {category.sectionTitle || category.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {category.description}
          </p>
        </div>
      </div>
      
      <div className={cn(
        "grid gap-2",
        gridCols === 1 ? "grid-cols-1" : gridCols === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {triggers.map((option) => (
          <TriggerTypeCard
            key={option.id}
            option={option}
            isSelected={triggerType === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
      
      {hasSelectedTrigger && children && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: `${categoryColor}20` }}>
          {children}
        </div>
      )}
    </div>
  );
};

const InitialiseTab = ({ state, integrations = [], eventData, onSelectTemplate, onStartFromScratch, workspaceId }) => {
  const { triggerType, _templateId, _isFromScratch } = state;

  const connectedAppsTriggers = TRIGGER_TYPE_OPTIONS.filter(
    (t) => t.category === TRIGGER_CATEGORIES.CONNECTED_APPS.id
  );
  const tinyFormsTriggers = TRIGGER_TYPE_OPTIONS.filter(
    (t) => t.category === TRIGGER_CATEGORIES.TINY_FORMS.id
  );
  // SPREADSHEETS includes both Sheet (Table) and Date Field triggers; no filter excludes DATE_FIELD
  const spreadsheetsTriggers = TRIGGER_TYPE_OPTIONS.filter(
    (t) => t.category === TRIGGER_CATEGORIES.SPREADSHEETS.id
  );
  const webhooksTriggers = TRIGGER_TYPE_OPTIONS.filter(
    (t) => t.category === TRIGGER_CATEGORIES.WEBHOOKS.id
  );
  const scheduleManualTriggers = TRIGGER_TYPE_OPTIONS.filter(
    (t) => t.category === TRIGGER_CATEGORIES.SCHEDULE_MANUAL.id
  );

  const isAppBased = triggerType === TRIGGER_TYPES.APP_BASED;
  const isForm = triggerType === TRIGGER_TYPES.FORM;
  const isSheet = triggerType === TRIGGER_TYPES.SHEET;
  const isDateField = triggerType === TRIGGER_TYPES.DATE_FIELD;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1C3693" }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Choose Your Trigger
          </h2>
          <p className="text-xs text-muted-foreground">
            Select how your workflow should start
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <TriggerCategorySection
          category={TRIGGER_CATEGORIES.CONNECTED_APPS}
          triggers={connectedAppsTriggers}
          triggerType={triggerType}
          onSelect={onStartFromScratch}
          icon={Plug}
          gridCols={1}
          featured={true}
        >
          {isAppBased && (
            <IntegrationSetupInline state={state} integrations={integrations} eventData={eventData} />
          )}
        </TriggerCategorySection>

        <TriggerCategorySection
          category={TRIGGER_CATEGORIES.TINY_FORMS}
          triggers={tinyFormsTriggers}
          triggerType={triggerType}
          onSelect={onStartFromScratch}
          icon={FileText}
          gridCols={1}
        >
          {isForm && (
            <FormSourcePicker state={state} workspaceId={workspaceId} />
          )}
        </TriggerCategorySection>

        <TriggerCategorySection
          category={TRIGGER_CATEGORIES.SPREADSHEETS}
          triggers={spreadsheetsTriggers}
          triggerType={triggerType}
          onSelect={onStartFromScratch}
          icon={Table}
          gridCols={2}
        >
          {isSheet && (
            <SheetSourcePicker state={state} workspaceId={workspaceId} />
          )}
          {isDateField && (
            <DateFieldSourcePicker state={state} workspaceId={workspaceId} />
          )}
        </TriggerCategorySection>

        <TriggerCategorySection
          category={TRIGGER_CATEGORIES.WEBHOOKS}
          triggers={webhooksTriggers}
          triggerType={triggerType}
          onSelect={onStartFromScratch}
          icon={Webhook}
          gridCols={1}
        />

        <TriggerCategorySection
          category={TRIGGER_CATEGORIES.SCHEDULE_MANUAL}
          triggers={scheduleManualTriggers}
          triggerType={triggerType}
          onSelect={onStartFromScratch}
          icon={Clock}
          gridCols={2}
        />
      </div>

      {!triggerType && (
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Quick Start
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {TRIGGER_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onSelectTemplate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialiseTab;
