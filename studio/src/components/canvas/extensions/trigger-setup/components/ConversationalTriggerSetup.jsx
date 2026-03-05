import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Link2,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Table,
  Clock,
  FileText,
  Webhook,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRIGGER_TYPES, TRIGGER_ICON_SRC } from "../constants";
import { INTEGRATION_TYPE } from "../../constants/types";
import {
  getTriggerTheme,
  getTriggerIcon,
  getTriggerColors,
} from "../triggerThemeRegistry";
import useSheet from "../../common-hooks/useSheet";
import assetSDKServices from "../../../services/assetSDKServices";
import { DateFieldSourcePicker } from "./source-pickers";
import { canvasSDKServices } from "../../../services/canvasSDKServices";
import { ConnectionManager } from "@/components/connection-manager";
import { useLegacyAuthorizeAdapter } from "@/components/connection-manager/adapters";

const VALID_QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "MCQ",
  "SCQ",
  "PHONE_NUMBER",
  "ZIP_CODE",
  "DROP_DOWN",
  "DROP_DOWN_STATIC",
  "YES_NO",
  "RANKING",
  "EMAIL",
  "AUTHORIZATION",
  "QUESTION_FX",
  "DATE",
  "CURRENCY",
  "KEY_VALUE_TABLE",
  "NUMBER",
  "FILE_PICKER",
  "TIME",
  "SIGNATURE",
  "ADDRESS",
  "AUTOCOMPLETE",
  "PICTURE",
  "RATING",
  "SLIDER",
  "OPINION_SCALE",
  "TERMS_OF_USE",
];

const FALLBACK_INTEGRATIONS = [
  {
    _id: "slack",
    name: "Slack",
    meta: {
      thumbnail: "https://cdn-v1.tinycommand.com/integrations/slack.svg",
    },
    color: "#4A154B",
    events: [
      {
        _id: "new_message",
        name: "New Message",
        description: "Triggers when a new message is posted",
        annotation: "TRIGGER",
      },
      {
        _id: "reaction_added",
        name: "Reaction Added",
        description: "Triggers when a reaction is added",
        annotation: "TRIGGER",
      },
    ],
  },
  {
    _id: "stripe",
    name: "Stripe",
    meta: {
      thumbnail: "https://cdn-v1.tinycommand.com/integrations/stripe.svg",
    },
    color: "#635BFF",
    events: [
      {
        _id: "payment_received",
        name: "Payment Received",
        description: "Triggers when a payment is successful",
        annotation: "TRIGGER",
      },
      {
        _id: "subscription_created",
        name: "Subscription Created",
        description: "Triggers when a new subscription starts",
        annotation: "TRIGGER",
      },
    ],
  },
  {
    _id: "github",
    name: "GitHub",
    meta: {
      thumbnail: "https://cdn-v1.tinycommand.com/integrations/github.svg",
    },
    color: "#24292E",
    events: [
      {
        _id: "push",
        name: "Push",
        description: "Triggers on code push to repository",
        annotation: "TRIGGER",
      },
      {
        _id: "pull_request",
        name: "Pull Request",
        description: "Triggers on pull request events",
        annotation: "TRIGGER",
      },
    ],
  },
  {
    _id: "hubspot",
    name: "HubSpot",
    meta: {
      thumbnail: "https://cdn-v1.tinycommand.com/integrations/hubspot.svg",
    },
    color: "#FF7A59",
    events: [
      {
        _id: "contact_created",
        name: "Contact Created",
        description: "Triggers when a new contact is added",
        annotation: "TRIGGER",
      },
      {
        _id: "deal_won",
        name: "Deal Won",
        description: "Triggers when a deal is closed won",
        annotation: "TRIGGER",
      },
    ],
  },
];

const TRIGGER_OPTIONS = [
  {
    id: TRIGGER_TYPES.APP_BASED,
    label: "When something happens in a connected app",
    description: "Listen for events from apps like Slack, Stripe, GitHub",
    iconSrc: TRIGGER_ICON_SRC[INTEGRATION_TYPE],
  },
  {
    id: TRIGGER_TYPES.FORM,
    label: "When someone interacts with a form",
    description: "Trigger on form submission or abandonment",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.FORM],
  },
  {
    id: TRIGGER_TYPES.SHEET,
    label: "When data changes in a spreadsheet",
    description: "Trigger when rows are created, updated, or deleted",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.SHEET],
  },
  {
    id: TRIGGER_TYPES.DATE_FIELD,
    label: "Date Field Trigger",
    description: "Trigger based on a date in your data",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.DATE_FIELD],
  },
  {
    id: TRIGGER_TYPES.WEBHOOK,
    label: "When I receive data from another app",
    description: "Trigger via HTTP webhook from external services",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.WEBHOOK],
  },
  {
    id: TRIGGER_TYPES.TIME_BASED,
    label: "On a schedule",
    description: "Run at specific times or intervals",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.TIME_BASED],
  },
  {
    id: TRIGGER_TYPES.MANUAL,
    label: "When I manually run this workflow",
    description: "Start the workflow on demand with a click",
    iconSrc: TRIGGER_ICON_SRC[TRIGGER_TYPES.MANUAL],
  },
];

const FORM_EVENTS = [
  {
    id: "submit",
    label: "Form is submitted",
    description: "When a user completes and submits the form",
  },
  {
    id: "abandoned",
    label: "Form is abandoned",
    description: "When a user leaves without submitting",
  },
];

const SHEET_EVENTS = [
  {
    id: "row_created",
    label: "A record is created",
    description: "When a new row is added",
  },
  {
    id: "row_updated",
    label: "A record is updated",
    description: "When an existing row changes",
  },
  {
    id: "row_deleted",
    label: "A record is deleted",
    description: "When a row is removed",
  },
];

const COLUMN_FILTER_OPTIONS = [
  { id: "all", label: "Any column changes" },
  { id: "specific", label: "Specific column(s) change" },
];

const FormInlineConfig = ({ state, workspaceId }) => {
  const { formConnection, setFormConnection, updateState } = state;
  const formEvent = state.formEvent || "submit";
  const [formList, setFormList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [formSelectOpen, setFormSelectOpen] = useState(false);

  const theme = getTriggerTheme(TRIGGER_TYPES.FORM);
  const colors = theme.colors;

  React.useEffect(() => {
    if (!loading && formList.length > 0 && !formConnection) {
      const timeoutId = setTimeout(() => {
        setFormSelectOpen(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, formList.length, formConnection]);

  useEffect(() => {
    const fetchForms = async () => {
      if (!workspaceId) return;
      try {
        setLoading(true);
        const response = await assetSDKServices.getFlatList({
          workspace_id: workspaceId,
          annotation: "FC",
          published_only: true,
          sort_by: "edited_at",
          sort_type: "desc",
        });
        if (response?.result) {
          setFormList(response.result);
        }
      } catch (error) {
        setFormList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [workspaceId]);

  const fetchFormFields = async (form) => {
    try {
      setLoadingFields(true);
      const query = { asset_id: form.asset_id || form._id };
      const res = await canvasSDKServices.getPublishedByAsset(query);
      const formData = res?.result?.flow ?? {};

      const fields = Object.entries(formData)
        .filter(([id, node]) => {
          const nodeType = node?.type;
          return (
            nodeType &&
            VALID_QUESTION_TYPES.includes(nodeType) &&
            nodeType !== "WELCOME" &&
            nodeType !== "ENDING"
          );
        })
        .map(([id, node]) => ({
          id,
          type: node?.type,
          name:
            node.config?.name || node.config?.title || node.config?.label || id,
          key: node.config?.key || id,
        }));
      return fields;
    } catch (error) {
      return [];
    } finally {
      setLoadingFields(false);
    }
  };

  const handleFormSelect = async (formId) => {
    const form = formList.find((f) => (f._id || f.asset_id) === formId);
    if (form) {
      const fields = await fetchFormFields(form);
      setFormConnection({
        ...form,
        name: form.name || form.title,
        id: form._id || form.asset_id,
        fields,
      });
    }
  };

  const handleEventChange = (eventId) => {
    updateState({ formEvent: eventId });
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-2">Loading forms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Which form?
        </label>
        {formList.length === 0 ? (
          <div
            className="p-3 rounded-lg border border-dashed text-center"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm text-muted-foreground">No forms found</p>
          </div>
        ) : (
          <Select
            value={formConnection?.id || ""}
            onValueChange={handleFormSelect}
            disabled={loadingFields}
            open={formSelectOpen}
            onOpenChange={setFormSelectOpen}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a form" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {formList.map((form) => (
                <SelectItem
                  key={form._id || form.asset_id}
                  value={form._id || form.asset_id}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className="w-4 h-4"
                      style={{ color: colors.primary }}
                    />
                    {form.name || form.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {loadingFields && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading form fields...
          </div>
        )}
      </div>

      {formConnection && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            When should it trigger?
          </label>
          <div className="space-y-2">
            {FORM_EVENTS.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventChange(event.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  formEvent === event.id
                    ? "border-2 shadow-sm"
                    : "border-border hover:border-muted-foreground/50",
                )}
                style={{
                  borderColor:
                    formEvent === event.id ? colors.primary : undefined,
                  backgroundColor:
                    formEvent === event.id ? `${colors.primary}08` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{event.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  {formEvent === event.id && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: colors.primary }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SheetInlineConfig = ({ state, workspaceId }) => {
  const {
    sheetConnection,
    setSheetConnection,
    sheetEventTypes = [],
    toggleSheetEventType,
    updateState,
  } = state;
  const columnFilter = state.columnFilter || "all";
  const selectedColumns = state.selectedColumns || [];
  const [sheetSelectOpen, setSheetSelectOpen] = useState(false);

  const theme = getTriggerTheme(TRIGGER_TYPES.SHEET);
  const colors = theme.colors;

  const {
    sheet,
    table,
    sheetList,
    tableList,
    onSheetChangeHandler,
    onTableChangeHandler,
    sheetLoading,
    tableLoading,
  } = useSheet({
    data: sheetConnection
      ? { asset: sheetConnection.sheet, subSheet: sheetConnection.table }
      : {},
    workspaceId,
    isViewRequired: false,
    isFieldRequired: true,
  });

  useEffect(() => {
    if (sheet && table) {
      setSheetConnection({
        sheet,
        table,
        name: sheet.name,
        columns: table.fields || [],
      });
    }
  }, [sheet, table, setSheetConnection]);

  React.useEffect(() => {
    if (!sheetLoading && sheetList.length > 0 && !sheet) {
      const timeoutId = setTimeout(() => {
        setSheetSelectOpen(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [sheetLoading, sheetList.length, sheet]);

  const handleSheetChange = (sheetId) => {
    const selectedSheet = sheetList.find((s) => s._id === sheetId);
    if (selectedSheet) {
      onSheetChangeHandler(null, selectedSheet);
    }
  };

  const handleTableChange = (tableId) => {
    const selectedTable = tableList.find((t) => t.id === tableId);
    if (selectedTable) {
      onTableChangeHandler(null, selectedTable);
    }
  };

  const handleEventToggle = (eventId) => {
    toggleSheetEventType(eventId);
  };

  const handleColumnFilterChange = (filterId) => {
    updateState({ columnFilter: filterId });
    if (filterId === "all") {
      updateState({ selectedColumns: [] });
    }
  };

  const handleColumnToggle = (columnId) => {
    const newColumns = selectedColumns.includes(columnId)
      ? selectedColumns.filter((c) => c !== columnId)
      : [...selectedColumns, columnId];
    updateState({ selectedColumns: newColumns });
  };

  const availableColumns = sheetConnection?.columns || table?.fields || [];

  if (sheetLoading && sheetList.length === 0) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-2">Loading sheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Which spreadsheet?
        </label>
        {sheetList.length === 0 ? (
          <div
            className="p-3 rounded-lg border border-dashed text-center"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm text-muted-foreground">No sheets found</p>
          </div>
        ) : (
          <Select
            value={sheet?._id || ""}
            onValueChange={handleSheetChange}
            open={sheetSelectOpen}
            onOpenChange={setSheetSelectOpen}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a spreadsheet" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {sheetList.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  <div className="flex items-center gap-2">
                    <Table
                      className="w-4 h-4"
                      style={{ color: colors.primary }}
                    />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {sheet && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Which table?
          </label>
          {tableLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading tables...
            </div>
          ) : tableList.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No tables found
            </p>
          ) : (
            <Select value={table?.id || ""} onValueChange={handleTableChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                {tableList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {sheetConnection?.table && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              When should it trigger?
            </label>
            <p className="text-xs text-muted-foreground">Select one or more events</p>
            <div className="space-y-2">
              {SHEET_EVENTS.map((event) => {
                const isSelected = sheetEventTypes.includes(event.id);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleEventToggle(event.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-2 shadow-sm"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                    style={{
                      borderColor: isSelected ? colors.primary : undefined,
                      backgroundColor: isSelected ? `${colors.primary}08` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check
                          className="w-4 h-4"
                          style={{ color: colors.primary }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column filter UI not shown: not configured in backend yet. Uncomment when backend supports "which columns should trigger". */}
          {/* {sheetEventTypes.includes("row_updated") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Which columns should trigger this?
              </label>
              <div className="space-y-2">
                {COLUMN_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleColumnFilterChange(option.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      columnFilter === option.id
                        ? "border-2 shadow-sm"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                    style={{
                      borderColor:
                        columnFilter === option.id ? colors.primary : undefined,
                      backgroundColor:
                        columnFilter === option.id
                          ? `${colors.primary}08`
                          : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{option.label}</p>
                      {columnFilter === option.id && (
                        <Check
                          className="w-4 h-4"
                          style={{ color: colors.primary }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {columnFilter === "specific" && availableColumns.length > 0 && (
                <div className="space-y-2 mt-3">
                  <label className="text-xs text-muted-foreground">
                    Select columns:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColumns.map((col) => {
                      const colId = col.id || col.key || col.name;
                      const isSelected = selectedColumns.includes(colId);
                      return (
                        <button
                          key={colId}
                          onClick={() => handleColumnToggle(colId)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            isSelected
                              ? "border-transparent text-white"
                              : "border-border bg-background hover:border-muted-foreground/50",
                          )}
                          style={{
                            backgroundColor: isSelected
                              ? colors.primary
                              : undefined,
                          }}
                        >
                          {col.name || col.label || colId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )} */}
        </>
      )}
    </div>
  );
};

const POPULAR_APP_IDS = [
  "slack",
  "stripe",
  "github",
  "hubspot",
  "notion",
  "google_sheets",
  "salesforce",
  "zapier",
];

const AppBasedInlineConfig = ({
  state,
  integrations: propsIntegrations = [],
  integrationsLoading = false,
  resourceIds = {},
  onNavigateToConfigure,
}) => {
  const {
    integration,
    setIntegration,
    integrationEvent,
    setIntegrationEvent,
    integrationConnection,
    setIntegrationConnection,
    integrationEventData,
    setIntegrationEventData,
    setIntegrationConfigureData,
  } = state;

  const [searchQuery, setSearchQuery] = useState("");
  const [showAllApps, setShowAllApps] = useState(false);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [eventDataError, setEventDataError] = useState(null);
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!integration && !integrationsLoading) {
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [integration, integrationsLoading]);

  const availableIntegrations =
    propsIntegrations?.length > 0 ? propsIntegrations : FALLBACK_INTEGRATIONS;

  const popularApps = useMemo(() => {
    const filtered = availableIntegrations.filter((int) =>
      POPULAR_APP_IDS.includes(int._id),
    );
    return filtered.length > 0
      ? filtered.slice(0, 8)
      : availableIntegrations.slice(0, 8);
  }, [availableIntegrations]);

  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return availableIntegrations.filter((int) =>
      int.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableIntegrations, searchQuery]);

  // Resolve integration from list when current ref has no events (e.g. stale or minimal object)
  const integrationWithEvents = useMemo(() => {
    if (!integration) return null;
    if (integration.events?.length > 0) return integration;
    const id = integration._id ?? integration.id;
    if (!id) return integration;
    const fromList = availableIntegrations.find(
      (i) => i._id === id || i.id === id,
    );
    return fromList ?? integration;
  }, [integration, availableIntegrations]);

  const triggerEvents = useMemo(() => {
    const events = integrationWithEvents?.events;
    if (!events?.length) return [];
    const withAnnotation = events.filter(
      (e) => (e.annotation ?? "").toUpperCase() === "TRIGGER",
    );
    return withAnnotation.length > 0 ? withAnnotation : events;
  }, [integrationWithEvents]);

  const isEventSelected = useCallback(
    (event) => {
      if (!integrationEvent) return false;
      return (
        (event._id != null && event._id === integrationEvent._id) ||
        (event.id != null && event.id === integrationEvent.id)
      );
    },
    [integrationEvent],
  );

  const connectionNodeData = useMemo(() => {
    if (!integrationEventData?.flow) return null;
    const flowValues = Object.values(integrationEventData.flow);
    return flowValues[0] || null;
  }, [integrationEventData]);

  // Key under which connection config is stored in configure state. Must match AppBasedPanel/Integration:
  // Integration receives flow = removeFirstKeyValuePair(eventData.flow), so its first node key is the second key in the full flow.
  const connectionNodeKeyForState = useMemo(() => {
    const flowKeys = Object.keys(integrationEventData?.flow || {});
    return flowKeys[0]
  }, [integrationEventData?.flow]);

  const handleConnectionChange = useCallback(
    ({ connection, refreshedConfigs, connectionNodeKey: payloadNodeKey }) => {
      if (connection) {
        setIntegrationConnection({
          id: connection._id || connection.id,
          name: connection.name,
          status: "connected",
          configs: connection.configs,
          refreshedConfigs,
          ...connection,
        });
        console.log("[AppBasedInlineConfig] connectionNodeKeyForState",payloadNodeKey, connectionNodeKeyForState);
        const nodeKey = payloadNodeKey ?? connectionNodeKeyForState;
        const responseConfig =
          refreshedConfigs || connection?.configs || connection?.refreshedConfigs || {};
        if (setIntegrationConfigureData) {
          setIntegrationConfigureData((prev) => ({
            ...prev,
            type: prev?.type || "INTEGRATION_TRIGGER",
            state: {
              ...(prev?.state || {}),
              [nodeKey]: {
                response: { ...responseConfig },
              },
            },
            flow: prev?.flow ?? integrationEventData ?? {},
            configs: prev?.configs ?? {},
          }));
        }
      } else {
        setIntegrationConnection(null);
      }
    },
    [
      setIntegrationConnection,
      setIntegrationConfigureData,
      connectionNodeKeyForState,
      integrationEventData,
    ],
  );


  const stableAdapterResourceIds = useMemo(
    () => ({
      ...resourceIds,
      _id: integrationEventData?._id,
      canvasId: integrationEventData?.canvas_id,
    }),
    [resourceIds, integrationEventData?._id, integrationEventData?.canvas_id],
  );

  const adapter = useLegacyAuthorizeAdapter({
    connectionNodeData,
    resourceIds: stableAdapterResourceIds,
    nodeData: integration,
    assetName: integration?.name || "",
    selectedConnection: integrationConnection,
    onConnectionChange: handleConnectionChange,
  });

  const fetchEventDataFn = useCallback(async () => {
    if (!integrationEvent?._id) return;

    try {
      setLoadingEventData(true);
      setEventDataError(null);
      const response = await canvasSDKServices.getPublishedByAsset({
        asset_id: integrationEvent._id,
        include_project_variable: true,
      });
      if (response?.result) {
        setIntegrationEventData({
          ...response.result,
          flow: response.result.flow || {},
          taskGraph: response.result.task_graph || [],
          annotation: response.result.annotation,
          projectVariables: response.result.project_variable || {},
        });
      }
    } catch (error) {
      console.error("Failed to fetch event data:", error);
      setEventDataError("Failed to load configuration. Please try again.");
    } finally {
      setLoadingEventData(false);
    }
  }, [integrationEvent?._id, setIntegrationEventData]);

  useEffect(() => {
    fetchEventDataFn();
  }, [fetchEventDataFn]);

  // Seed integrationConfigureData with connection config when we have connection + eventData (legacy: setConfigureData with connection + state[nodeKey].response).
  // Ensures Configure tab has connection state when user selects a connection or when reopening a saved node.
  useEffect(() => {
    if (
      !integrationConnection ||
      !integrationEventData?.flow ||
      !setIntegrationConfigureData
    )
      return;
    const nodeKey = connectionNodeKeyForState;
    const connectionConfig =
      integrationConnection?.refreshedConfigs ||
      integrationConnection?.configs ||
      {};
    setIntegrationConfigureData((prev) => {
      const existingResponse = prev?.state?.[nodeKey]?.response ?? {};
      const merged = { ...existingResponse, ...connectionConfig };
      return {
        ...prev,
        type: prev?.type || "INTEGRATION_TRIGGER",
        state: {
          ...(prev?.state || {}),
          [nodeKey]: {
            response: Object.keys(merged).length > 0 ? merged : existingResponse,
          },
        },
        flow: prev?.flow ?? integrationEventData,
        configs: prev?.configs ?? {},
      };
    });
  }, [
    integrationConnection?.id,
    integrationEventData?.flow,
    connectionNodeKeyForState,
    setIntegrationConfigureData,
  ]);

  const handleSelectIntegration = (int) => {
    setIntegration(int);
    setIntegrationEvent(null);
    setIntegrationConnection(null);
    setSearchQuery("");
    setShowAllApps(false);
  };

  const handleSelectEvent = (event) => {
    setIntegrationEvent(event);
    setIntegrationConnection(null);
  };

  const handleChangeApp = (e) => {
    e?.stopPropagation?.();
    setIntegration(null);
    setIntegrationEvent(null);
    setIntegrationConnection(null);
    setIntegrationEventData?.(null);
  };

  // Go back to popular apps selection (same as Change app) so user can pick app then event again
  const handleChangeEvent = (e) => {
    e?.stopPropagation?.();
    setIntegration(null);
    setIntegrationEvent(null);
    setIntegrationConnection(null);
    setIntegrationEventData?.(null);
  };

  const handleContinueToConfigure = () => {
    if (onNavigateToConfigure) {
      onNavigateToConfigure();
    }
  };

  const handleConnectionSelect = useCallback(
    async (connection) => {
      try {
        await adapter.onSelect(connection);
        if (onNavigateToConfigure) {
          onNavigateToConfigure();
        }
      } catch (error) {
        console.error("Failed to select connection:", error);
      }
    },
    [adapter.onSelect, onNavigateToConfigure],
  );

  if (!integration) {
    if (integrationsLoading) {
      return (
        <div className="space-y-3 mt-4">
          <Skeleton className="h-9 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="min-w-0 max-w-full box-border space-y-3 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            className="pl-10 bg-background h-9"
          />
        </div>

        {searchQuery.trim() ? (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredIntegrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No apps found
              </p>
            ) : (
              filteredIntegrations.map((int) => (
                <button
                  key={int._id}
                  onClick={() => handleSelectIntegration(int)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5 transition-all bg-background"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${int.color || "#6366F1"}15` }}
                  >
                    <img
                      src={int.meta?.thumbnail || int.icon}
                      alt={int.name}
                      className="w-5 h-5"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{int.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="min-w-0 max-w-full box-border overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                Popular apps
              </label>
              {availableIntegrations.length > 8 && (
                <button
                  onClick={() => setShowAllApps(!showAllApps)}
                  className="text-xs text-[#6366F1] hover:underline"
                >
                  {showAllApps
                    ? "Show less"
                    : `View all (${availableIntegrations.length})`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pb-1 max-w-full">
              {(showAllApps ? availableIntegrations : popularApps).map(
                (int) => (
                  <button
                    key={int._id}
                    onClick={() => handleSelectIntegration(int)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5 transition-all bg-background shrink-0"
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${int.color || "#6366F1"}15` }}
                    >
                      <img
                        src={int.meta?.thumbnail || int.icon}
                        alt={int.name}
                        className="w-4 h-4"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {int.name}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!integrationEvent) {
    return (
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2 p-2.5 bg-[#6366F1]/5 rounded-lg border border-[#6366F1]/20">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${integration.color || "#6366F1"}15` }}
          >
            <img
              src={integration.meta?.thumbnail || integration.icon}
              alt={integration.name}
              className="w-4 h-4"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <span className="text-sm font-medium flex-1">{integration.name}</span>
          <button
            type="button"
            onClick={handleChangeApp}
            className="text-xs text-[#6366F1] hover:underline"
          >
            Change
          </button>
        </div>

        <label className="text-sm font-medium text-foreground">
          What triggers the workflow?
        </label>
        <div className="space-y-2 min-h-[8rem] max-h-[50vh] overflow-y-auto">
          {triggerEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No trigger events found for this app. Try choosing another app or
              refresh the page.
            </p>
          ) : (
            triggerEvents.map((event) => (
              <button
                key={event._id ?? event.id}
                type="button"
                onClick={() => handleSelectEvent(event)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm bg-background",
                  isEventSelected(event)
                    ? "ring-2 ring-[#6366F1] border-[#6366F1] bg-[#6366F1]/10"
                    : "border-border hover:border-[#6366F1]/50",
                )}
              >
                <p className="font-medium text-sm">{event.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.description || "Trigger event"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <div
        role="button"
        tabIndex={0}
        onClick={handleChangeEvent}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleChangeEvent(e);
          }
        }}
        className="flex items-center gap-2 p-2.5 bg-[#6366F1]/5 rounded-lg border border-[#6366F1]/20 cursor-pointer hover:bg-[#6366F1]/10 transition-colors"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${integration.color || "#6366F1"}15` }}
        >
          <img
            src={integration.meta?.thumbnail || integration.icon}
            alt={integration.name}
            className="w-4 h-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{integration.name}</span>
          <p className="text-xs text-muted-foreground truncate">
            {integrationEvent.name}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleChangeEvent(e);
          }}
          className="text-xs text-[#6366F1] hover:underline shrink-0"
        >
          Change
        </button>
      </div>

      {/* Single "What triggers the workflow?" list with clear selected state */}
      {triggerEvents.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            What triggers the workflow?
          </label>
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{integrationEvent.name}</span>
          </p>
          <div className="space-y-2 min-h-[4rem] max-h-[40vh] overflow-y-auto">
            {triggerEvents.map((event) => (
              <button
                key={event._id ?? event.id}
                type="button"
                onClick={() => {
                  setIntegrationEvent(event);
                  setIntegrationConnection(null);
                  setIntegrationEventData?.(null);
                }}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm bg-background",
                  isEventSelected(event)
                    ? "ring-2 ring-[#6366F1] border-[#6366F1] bg-[#6366F1]/10"
                    : "border-border hover:border-[#6366F1]/50",
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

      {loadingEventData || (adapter.loading && !adapter.hasInitiallyLoaded) ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading connection options...
          </span>
        </div>
      ) : eventDataError ? (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-medium">Failed to load configuration</p>
          </div>
          <p className="text-xs text-red-500">{eventDataError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEventDataFn}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : connectionNodeData ? (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Connect your account
          </label>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <ConnectionManager
              authType={adapter.authType}
              integrationName={adapter.integrationName}
              integrationIcon={adapter.integrationIcon}
              authorizationConfig={adapter.connectionConfig}
              resourceIds={adapter.resourceIds}
              connections={adapter.connections}
              selectedConnection={adapter.selectedConnection}
              onConnectionSelect={handleConnectionSelect}
              onFetchConnections={adapter.refreshConnections}
              onCreateOAuthConnection={adapter.onCreateOAuthConnection}
              onCreateFormConnection={adapter.onCreateFormConnection}
              onCreateCustomConnection={adapter.onCreateCustomConnection}
              onDeleteConnection={adapter.onDelete}
              onEditConnection={(conn) =>
                adapter.onEdit(conn._id || conn.id, conn.name)
              }
              disabled={adapter.isCreatingConnection}
              className="max-h-[50vh] overflow-y-auto"
            />
          </div>

          {adapter.selectedConnection && (
            <Button
              onClick={handleContinueToConfigure}
              className="w-full bg-[#6366F1] hover:bg-[#5558DD] text-white"
            >
              Continue to Configure
            </Button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-center space-y-3">
          <p className="text-sm text-amber-700">
            Unable to load connection options for this trigger event.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEventDataFn}
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

const TriggerCard = ({
  option,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  children,
}) => {
  const theme = getTriggerTheme(option.id);
  const colors = theme.colors;
  const IconComponent = option.icon;
  const iconSrc = option.iconSrc;

  return (
    <div
      className={cn(
        "min-w-0 max-w-full box-border rounded-xl border transition-all overflow-hidden",
        isSelected
          ? "border-2 shadow-sm"
          : "border-border hover:border-muted-foreground/30",
      )}
      style={{
        borderColor: isSelected ? colors.primary : undefined,
        backgroundColor: isSelected ? `${colors.primary}03` : undefined,
      }}
    >
      <button onClick={onSelect} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isSelected ? colors.primary : colors.light,
            }}
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt={option.label}
                className="w-5 h-5"
                style={{
                  filter: isSelected ? "brightness(0) invert(1)" : "none",
                }}
              />
            ) : IconComponent ? (
              <IconComponent
                className="w-5 h-5"
                style={{ color: isSelected ? "#fff" : colors.primary }}
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4
                className="font-medium text-sm"
                style={{ color: isSelected ? colors.text : undefined }}
              >
                {option.label}
              </h4>
              {isSelected && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {option.description}
            </p>
          </div>
        </div>
      </button>

      {isSelected && children && (
        <div
          className="min-w-0 max-w-full box-border px-4 pb-4 border-t"
          style={{ borderColor: `${colors.primary}20` }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const ManualInlineConfig = () => {
  const theme = getTriggerTheme(TRIGGER_TYPES.MANUAL);
  const colors = theme.colors;

  return (
    <div
      className="mt-4 p-3 rounded-lg border"
      style={{
        borderColor: colors.border,
        backgroundColor: `${colors.primary}05`,
      }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" style={{ color: colors.primary }} />
        <p className="text-sm text-foreground">
          This workflow runs on demand when you click "Run"
        </p>
      </div>
    </div>
  );
};

const ScheduleNavigateConfig = ({ onNavigate }) => {
  const theme = getTriggerTheme(TRIGGER_TYPES.TIME_BASED);
  const colors = theme.colors;

  return (
    <div className="mt-4">
      <Button
        onClick={onNavigate}
        className="w-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Clock className="w-4 h-4 mr-2" />
        Configure Schedule
      </Button>
    </div>
  );
};

const WebhookNavigateConfig = ({ onNavigate }) => {
  const theme = getTriggerTheme(TRIGGER_TYPES.WEBHOOK);
  const colors = theme.colors;

  return (
    <div className="mt-4">
      <Button
        onClick={onNavigate}
        className="w-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Webhook className="w-4 h-4 mr-2" />
        Configure Webhook
      </Button>
    </div>
  );
};

const ConversationalTriggerSetup = ({
  state,
  integrations = [],
  integrationsLoading = false,
  workspaceId,
  assetId,
  projectId,
  parentId,
  onTriggerSelect,
  onNavigateToConfigure,
}) => {
  const { triggerType } = state;

  const resourceIds = useMemo(
    () => ({
      workspaceId,
      assetId,
      projectId,
      parentId,
    }),
    [workspaceId, assetId, projectId, parentId],
  );

  const handleTriggerSelect = (id) => {
    if (onTriggerSelect) {
      onTriggerSelect(id);
    } else {
      state.startFromScratch(id);
    }
  };

  const handleNavigateToConfigure = () => {
    if (onNavigateToConfigure) {
      onNavigateToConfigure();
    }
  };

  return (
    <div className="min-w-0 max-w-full box-border space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1C3693" }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            What should start this workflow?
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose how your workflow gets triggered
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {TRIGGER_OPTIONS.map((option) => (
          <TriggerCard
            key={option.id}
            option={option}
            isSelected={triggerType === option.id}
            onSelect={() => handleTriggerSelect(option.id)}
          >
            {option.id === TRIGGER_TYPES.MANUAL &&
              triggerType === TRIGGER_TYPES.MANUAL && <ManualInlineConfig />}
            {option.id === TRIGGER_TYPES.TIME_BASED &&
              triggerType === TRIGGER_TYPES.TIME_BASED && (
                <ScheduleNavigateConfig
                  onNavigate={handleNavigateToConfigure}
                />
              )}
            {option.id === TRIGGER_TYPES.WEBHOOK &&
              triggerType === TRIGGER_TYPES.WEBHOOK && (
                <WebhookNavigateConfig onNavigate={handleNavigateToConfigure} />
              )}
            {option.id === TRIGGER_TYPES.FORM &&
              triggerType === TRIGGER_TYPES.FORM && (
                <FormInlineConfig state={state} workspaceId={workspaceId} />
              )}
            {option.id === TRIGGER_TYPES.SHEET &&
              triggerType === TRIGGER_TYPES.SHEET && (
                <SheetInlineConfig state={state} workspaceId={workspaceId} />
              )}
            {option.id === TRIGGER_TYPES.DATE_FIELD &&
              triggerType === TRIGGER_TYPES.DATE_FIELD && (
                <DateFieldSourcePicker state={state} workspaceId={workspaceId} />
              )}
            {option.id === TRIGGER_TYPES.APP_BASED &&
              triggerType === TRIGGER_TYPES.APP_BASED && (
                <AppBasedInlineConfig
                  state={state}
                  integrations={integrations}
                  integrationsLoading={integrationsLoading}
                  resourceIds={resourceIds}
                  onNavigateToConfigure={handleNavigateToConfigure}
                />
              )}
          </TriggerCard>
        ))}
      </div>
    </div>
  );
};

export default ConversationalTriggerSetup;
