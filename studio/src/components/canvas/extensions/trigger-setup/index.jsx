import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Zap, Settings } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import {
  TRIGGER_SETUP_NODE,
  FORM_TRIGGER_NODE,
  THEME,
  TRIGGER_TYPES,
  TRIGGER_TYPE_OPTIONS,
  TRIGGER_ICON_SRC,
} from "./constants";
import { TRIGGER_SETUP_TYPE, INTEGRATION_TYPE } from "../constants/types";
import { getTriggerTheme } from "./triggerThemeRegistry";
import START_NODE from "../start/constant";
import TIME_BASED_TRIGGER_NODE from "../time-based-trigger/constant";
import WEBHOOK_NODE from "../webhook/constant";
import { useTriggerSetupState } from "./hooks/useTriggerSetupState";
import ConversationalTriggerSetup from "./components/ConversationalTriggerSetup";
import PreviewSentence from "./components/PreviewSentence";
import ManualPanel from "./components/panels/ManualPanel";
import TimeBasedPanel from "./components/panels/TimeBasedPanel";
import WebhookPanel from "./components/panels/WebhookPanel";
import FormPanel from "./components/panels/FormPanel";
import SheetPanel from "./components/panels/SheetPanel";
import DateFieldPanel from "./components/panels/DateFieldPanel";
import AppBasedPanel from "./components/panels/AppBasedPanel";
import assetSDKServices from "../../services/assetSDKServices";
import hookNRunServices from "../../services/hookAndRunServices";
import sheetSDKServices from "../../services/sheetSDKServices";
import { convertStreamPayloadRules } from "./utils/dateFieldStreamPayload";
import { toast } from "sonner";
import snakeCase from "lodash/snakeCase";

// Sheet API expects legacy enum: create_record, update_record, delete_record (snake_case of "Create Record", etc.)
// We use internal ids row_created, row_updated, row_deleted in state and goData.
const SHEET_EVENT_TO_API_ENUM = {
  row_created: "create_record",
  row_updated: "update_record",
  row_deleted: "delete_record",
};

const TABS = {
  CHOOSE: "choose",
  CONFIGURE: "configure",
};

const isSimpleTrigger = (triggerType) => {
  return triggerType === TRIGGER_TYPES.MANUAL;
};

const needsConfigureTab = (triggerType) => {
  return (
    triggerType === TRIGGER_TYPES.TIME_BASED ||
    triggerType === TRIGGER_TYPES.WEBHOOK ||
    triggerType === TRIGGER_TYPES.APP_BASED ||
    triggerType === TRIGGER_TYPES.DATE_FIELD
  );
};

const isComplexTrigger = (triggerType) => {
  return (
    triggerType === TRIGGER_TYPES.SHEET || triggerType === TRIGGER_TYPES.FORM
  );
};

const KNOWN_TRIGGER_TYPE_VALUES = new Set(Object.values(TRIGGER_TYPES));

const resolveNodeTriggerType = (nodeType) => {
  if (!nodeType) return undefined;
  if (nodeType === TRIGGER_SETUP_TYPE) return undefined;
  if (KNOWN_TRIGGER_TYPE_VALUES.has(nodeType)) return nodeType;
  return undefined;
};

const TriggerSetupV3 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      webhookUrl,
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
      onGuidedTabChange,
    },
    ref,
  ) => {
    if (process.env.NODE_ENV === "development" || !assetId) {
      console.log("[TriggerSetup] props", {
        assetId,
        hasAssetId: !!assetId,
        nodeKey: nodeData?.key,
        nodeType: nodeData?.type,
      });
    }
    console.log("nodeData", nodeData);
    const drawerRef = useRef();
    const contentRef = useRef();
    const configPanelRef = useRef();
    const state = useTriggerSetupState({
      ...data,
      triggerType: data.triggerType ?? resolveNodeTriggerType(nodeData?.type),
    });

    const getInitialTab = () => {
      const effectiveTriggerType = data?.triggerType ?? resolveNodeTriggerType(nodeData?.type);
      if (data?.lastActiveTab && data.lastActiveTab !== "test") {
        return data.lastActiveTab;
      }
      if (!effectiveTriggerType) return TABS.CHOOSE;
      if (isSimpleTrigger(effectiveTriggerType)) return TABS.CHOOSE;
      if (needsConfigureTab(effectiveTriggerType)) {
        if (
          effectiveTriggerType === TRIGGER_TYPES.APP_BASED &&
          data.integrationConnection
        ) {
          return TABS.CONFIGURE;
        }
        if (
          effectiveTriggerType === TRIGGER_TYPES.TIME_BASED &&
          data.scheduleType
        ) {
          return TABS.CONFIGURE;
        }
        if (effectiveTriggerType === TRIGGER_TYPES.WEBHOOK) {
          return TABS.CONFIGURE;
        }
        if (
          effectiveTriggerType === TRIGGER_TYPES.DATE_FIELD &&
          data.asset &&
          data.subSheet &&
          data.dateField
        ) {
          return TABS.CONFIGURE;
        }
      }
      return TABS.CHOOSE;
    };

    const [activeTab, setActiveTabState] = useState(getInitialTab);
    const [integrations, setIntegrations] = useState([]);
    const [integrationsLoading, setIntegrationsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    const setActiveTab = useCallback(
      (tab) => {
        setActiveTabState(tab);
        state.setLastActiveTab(tab);
        onGuidedTabChange?.(tab);
      },
      [state, onGuidedTabChange],
    );
    React.useEffect(() => {
      onGuidedTabChange?.(getInitialTab());
    }, []);


    useEffect(() => {
      setIntegrationsLoading(true);
      assetSDKServices
        .getEvents()
        .then((response) => {
          if (response.result?.integrations?.length) {
            const triggerIntegrations = response.result.integrations.filter(
              (integration) =>
                integration.events?.some(
                  (event) => event.annotation === "TRIGGER",
                ),
            );
            setIntegrations(triggerIntegrations);
          }
        })
        .catch(() => {
          setIntegrations([]);
        })
        .finally(() => {
          setIntegrationsLoading(false);
        });
    }, []);

    // Resolve integration/event from legacy integration_id/event_id when integrations load
    useEffect(() => {
      const isAppBased =
        state.triggerType === TRIGGER_TYPES.APP_BASED ||
        state.triggerType === INTEGRATION_TYPE;
      if (!isAppBased || !integrations?.length) return;
      if (state.integration && state.integrationEvent) return;
      const integrationId =
        state.integration_id ?? state.integration?._id ?? state.integration?.id;
      const eventId =
        state.event_id ??
        state.integrationEvent?._id ??
        state.integrationEvent?.id;
      if (!integrationId) return;
      const integration =
        state.integration ??
        integrations.find(
          (i) => i._id === integrationId || i.id === integrationId,
        );
      if (!integration) {
        if (state.integration_id || state.event_id) {
          console.log(
            "[TriggerSetup] APP_BASED legacy resolve: integration not found",
            {
              integration_id: state.integration_id,
              event_id: state.event_id,
              integrationIds: integrations.map((i) => i._id),
            },
          );
        }
        return;
      }
      // Resolve event only from trigger events (annotation === "TRIGGER") so we match
      // what the UI shows and never restore a non-trigger or wrong event
      const triggerEvents =
        integration.events?.filter(
          (e) => (e.annotation ?? "").toUpperCase() === "TRIGGER",
        ) ?? [];
      const eventsToSearch =
        triggerEvents.length > 0 ? triggerEvents : (integration.events ?? []);
      const event =
        state.integrationEvent ??
        eventsToSearch.find((e) => e._id === eventId || e.id === eventId);
      if (!event && eventId) {
        console.log(
          "[TriggerSetup] APP_BASED legacy resolve: event not found",
          {
            event_id: eventId,
            eventIds: eventsToSearch.map((e) => e._id),
          },
        );
      }
      if (integration && (event || !eventId)) {
        state.updateState?.({
          integration,
          integrationEvent: event ?? null,
          integrationConnection: state.integrationConnection ?? null,
        });
        if (
          process.env.NODE_ENV === "development" &&
          (state.integration_id || state.event_id)
        ) {
          console.log(
            "[TriggerSetup] APP_BASED legacy resolve: restored integration and event",
            {
              integrationName: integration.name,
              eventName: event?.name,
            },
          );
        }
      }
    }, [
      integrations,
      state.triggerType,
      state.integration_id,
      state.event_id,
      state.integration,
      state.integrationEvent,
      state.integrationConnection,
      state.updateState,
    ]);

    const getNodeIconSrc = useCallback(() => {
      if (!state.triggerType) return TRIGGER_SETUP_NODE._src;
      switch (state.triggerType) {
        case TRIGGER_TYPES.MANUAL:
          return START_NODE._src;
        case TRIGGER_TYPES.TIME_BASED:
          return TIME_BASED_TRIGGER_NODE._src;
        case TRIGGER_TYPES.WEBHOOK:
          return WEBHOOK_NODE._src;
        case TRIGGER_TYPES.FORM:
          return FORM_TRIGGER_NODE._src;
        case TRIGGER_TYPES.SHEET:
        case TRIGGER_TYPES.DATE_FIELD:
          return (
            TRIGGER_ICON_SRC[state.triggerType] || TRIGGER_SETUP_NODE._src
          );
        case TRIGGER_TYPES.APP_BASED: {
          const integrationIcon =
            state.integration?.meta?.thumbnail || state.integration?.icon;
          return integrationIcon || TRIGGER_SETUP_NODE._src;
        }
        default:
          return TRIGGER_SETUP_NODE._src;
      }
    }, [state.triggerType, state.integration]);

    const getNodeDisplayInfo = useCallback(() => {
      if (!state.triggerType) return {};
      const triggerOption = TRIGGER_TYPE_OPTIONS.find(
        (t) => t.id === state.triggerType,
      );
      // Use legacy node name/icon for form trigger so saved node matches legacy (Form Trigger + form icon)
      const isFormTrigger = state.triggerType === TRIGGER_TYPES.FORM;
      const info = {
        name: isFormTrigger
          ? FORM_TRIGGER_NODE.name
          : triggerOption?.name || "Trigger Setup",
        description: triggerOption?.description || "",
        _src: getNodeIconSrc(),
      };
      if (state.triggerType === TRIGGER_TYPES.APP_BASED && state.integration) {
        info.name = `${state.integration?.name || "App"} Trigger`;
        if (state.integrationEventData?.name) {
          info.description = state.integrationEventData.name;
        }
      }
      return info;
    }, [
      state.triggerType,
      state.integration,
      state.integrationEventData,
      getNodeIconSrc,
    ]);

    // Match legacy exactly: second arg to onSave is { errors, _src, type, subType, name } so canvas persists type/subType
    const buildLegacySavePayload = useCallback(() => {
      let nodeIcon = TRIGGER_SETUP_NODE._src;
      let name = TRIGGER_SETUP_NODE.name;
      switch (state.triggerType) {
        case TRIGGER_TYPES.MANUAL:
          nodeIcon = START_NODE._src;
          name = START_NODE.name;
          break;
        case TRIGGER_TYPES.TIME_BASED:
          nodeIcon = TIME_BASED_TRIGGER_NODE._src;
          name = TIME_BASED_TRIGGER_NODE.name;
          break;
        case TRIGGER_TYPES.WEBHOOK:
          nodeIcon = WEBHOOK_NODE._src;
          name = WEBHOOK_NODE.name;
          break;
        case TRIGGER_TYPES.FORM:
          nodeIcon = FORM_TRIGGER_NODE._src;
          name = FORM_TRIGGER_NODE.name;
          break;
        case TRIGGER_TYPES.SHEET:
          nodeIcon =
            TRIGGER_ICON_SRC[TRIGGER_TYPES.SHEET] || TRIGGER_SETUP_NODE._src;
          name = "Table Trigger";
          break;
        case TRIGGER_TYPES.DATE_FIELD:
          nodeIcon =
            TRIGGER_ICON_SRC[TRIGGER_TYPES.DATE_FIELD] ||
            TRIGGER_SETUP_NODE._src;
          name = "Date Reminder";
          break;
        case TRIGGER_TYPES.APP_BASED:
        case INTEGRATION_TYPE:
          nodeIcon =
            state.integration?.meta?.thumbnail ||
            state.integration?.icon ||
            nodeData?._src ||
            TRIGGER_SETUP_NODE._src;
          name = state.integration?.name
            ? `${state.integration.name} Trigger`
            : nodeData?.name || TRIGGER_SETUP_NODE.name;
          break;
        default:
          name = nodeData?.name || TRIGGER_SETUP_NODE.name;
      }
      const err = state.getError?.();
      const errors = err
        ? [err?.messages?.[0] || "Configuration incomplete"]
        : [];
      return {
        errors,
        _src: nodeIcon || TRIGGER_SETUP_NODE._src,
        type: state.triggerType || TRIGGER_SETUP_TYPE,
        subType: state.triggerType ? TRIGGER_SETUP_TYPE : null,
        name,
      };
    }, [state.triggerType, state.integration, state.getError, nodeData?.name]);

    const buildUpdatedNodeData = useCallback(
      () => buildLegacySavePayload(),
      [buildLegacySavePayload],
    );

    const handleScroll = useCallback((e) => {
      setIsScrolled(e.target.scrollTop > 10);
    }, []);

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.CONFIGURE && !state.triggerType) {
          return;
        }
        if (
          tabId === TABS.CONFIGURE &&
          state.triggerType === TRIGGER_TYPES.APP_BASED
        ) {
          if (
            !state.integration ||
            !state.integrationEvent ||
            !state.integrationConnection
          ) {
            return;
          }
        }
        setActiveTab(tabId);
      },
      [
        state.validation.isValid,
        state.triggerType,
        state.integration,
        state.integrationEvent,
        state.integrationConnection,
      ],
    );

    const registerDateFieldStreamAndGetGoData = useCallback(
      async (goData) => {
        const { asset, subSheet, dateField, timingRules } = goData || {};
        const sheetId = asset?.id ?? asset?._id;
        if (!subSheet?.id || !sheetId) {
          toast.error("Missing sheet or table for date field trigger");
          return { goData, error: "Missing sheet or table" };
        }
        try {
          const webhookPayload = {
            watch_enabled: true,
            identifier: subSheet.id,
            published_asset_id: assetId,
            event_src: "TC_SHEET",
            event_type: "SHEET_DATE_FIELD_TRIGGER",
          };
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.DATE_FIELD,
            phase: "webhook_before",
            webhookPayload: {
              ...webhookPayload,
              published_asset_id: "[redacted]",
            },
          });
          const webhookResponse =
            await hookNRunServices.generateWebhookUrl(webhookPayload);
          const webhookUrl =
            webhookResponse?.status === "success"
              ? webhookResponse?.result?.webhook_url
              : null;
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.DATE_FIELD,
            phase: "webhook_after",
            hasWebhookUrl: !!webhookUrl,
          });
          if (!webhookUrl) {
            console.log("[TriggerSetup] stream registration", {
              triggerType: TRIGGER_TYPES.DATE_FIELD,
              phase: "webhook",
              error: "No webhook URL",
            });
            toast.error("Failed to generate webhook for date field trigger");
            return { goData, error: "No webhook URL" };
          }
          const triggerConfig = convertStreamPayloadRules(
            timingRules || [],
            dateField,
          );
          const streamPayload = {
            where: {
              id: state.streamId || undefined,
              tableId: subSheet.id,
              webhookUrl,
            },
            data: {
              webhookUrl,
              triggerType: "TIME_BASED",
              tableId: subSheet.id,
              linkedAssetId: assetId,
              triggerConfig,
            },
            baseId: sheetId,
          };
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.DATE_FIELD,
            phase: "stream_before",
            streamPayloadKeys: {
              where: Object.keys(streamPayload.where || {}),
              data: Object.keys(streamPayload.data || {}),
              baseId: !!streamPayload.baseId,
            },
          });
          const streamResponse =
            await sheetSDKServices.upsertStream(streamPayload);
          const streamId =
            streamResponse?.status === "success"
              ? streamResponse?.result?.id
              : null;
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.DATE_FIELD,
            phase: "stream_after",
            streamId,
            status: streamResponse?.status,
          });
          if (streamId && state.setStreamId) state.setStreamId(streamId);
          if (streamId == null) {
            console.log("[TriggerSetup] stream registration", {
              triggerType: TRIGGER_TYPES.DATE_FIELD,
              phase: "stream",
              error: "Stream registration failed",
            });
            toast.error("Failed to register date field stream");
            return { goData, error: "Stream registration failed" };
          }
          return { goData: { ...goData, streamId }, error: null };
        } catch (err) {
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.DATE_FIELD,
            phase: "stream",
            error: err?.message,
          });
          toast.error(err?.message || "Date field trigger registration failed");
          return { goData, error: err?.message };
        }
      },
      [assetId, state.streamId, state.setStreamId],
    );

    const registerSheetStreamAndGetGoData = useCallback(
      async (goData) => {
        const { asset, subSheet, eventType } = goData || {};
        const sheetId = asset?.id ?? asset?._id;
        if (!asset || !subSheet?.id || !sheetId) {
          toast.error("Missing sheet or table for sheet trigger");
          return { goData, error: "Missing sheet or table" };
        }
        const eventList = Array.isArray(eventType)
          ? eventType
          : eventType
            ? [eventType]
            : [];
        if (!eventList.length) {
          toast.error("Please select at least one sheet event");
          return { goData, error: "Event type required" };
        }
        try {
          const webhookPayload = {
            watch_enabled: true,
            identifier: subSheet.id,
            published_asset_id: assetId,
            event_src: "TC_SHEET",
            event_type: "SHEET_WATCHER",
          };
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.SHEET,
            phase: "webhook_before",
            webhookPayload: {
              ...webhookPayload,
              published_asset_id: "[redacted]",
            },
          });
          const webhookResponse =
            await hookNRunServices.generateWebhookUrl(webhookPayload);
          const webhookUrl =
            webhookResponse?.status === "success"
              ? webhookResponse?.result?.webhook_url
              : null;
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.SHEET,
            phase: "webhook_after",
            hasWebhookUrl: !!webhookUrl,
          });
          if (!webhookUrl) {
            console.log("[TriggerSetup] stream registration", {
              triggerType: TRIGGER_TYPES.SHEET,
              phase: "webhook",
              error: "No webhook URL",
            });
            toast.error("Failed to generate webhook for sheet trigger");
            return { goData, error: "No webhook URL" };
          }
          const eventTypeForApi = eventList.map(
            (e) => SHEET_EVENT_TO_API_ENUM[e] ?? snakeCase(e),
          );
          const streamPayload = {
            where: {
              id: state.streamId || undefined,
              tableId: subSheet.id,
              webhookUrl,
              linkedAssetId: assetId,
            },
            data: {
              webhookUrl,
              tableId: subSheet.id,
              linkedAssetId: assetId,
              eventType: eventTypeForApi,
            },
            baseId: sheetId,
          };
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.SHEET,
            phase: "stream_before",
            streamPayloadKeys: {
              where: Object.keys(streamPayload.where || {}),
              data: Object.keys(streamPayload.data || {}),
              baseId: !!streamPayload.baseId,
            },
          });
          const streamResponse =
            await sheetSDKServices.upsertStream(streamPayload);
          const streamId =
            streamResponse?.status === "success"
              ? streamResponse?.result?.id
              : null;
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.SHEET,
            phase: "stream_after",
            streamId,
            status: streamResponse?.status,
          });
          if (streamId && state.setStreamId) state.setStreamId(streamId);
          if (streamId == null) {
            console.log("[TriggerSetup] stream registration", {
              triggerType: TRIGGER_TYPES.SHEET,
              phase: "stream",
              error: "Stream registration failed",
            });
            toast.error("Failed to register sheet stream");
            return { goData, error: "Stream registration failed" };
          }
          return { goData: { ...goData, streamId }, error: null };
        } catch (err) {
          console.log("[TriggerSetup] stream registration", {
            triggerType: TRIGGER_TYPES.SHEET,
            phase: "stream",
            error: err?.message,
          });
          toast.error(err?.message || "Sheet trigger registration failed");
          return { goData, error: err?.message };
        }
      },
      [assetId, state.streamId, state.setStreamId],
    );

    /** Returns Promise<goData>. For DATE_FIELD/SHEET runs stream registration first so streamId is set (e.g. on drawer close). */
    const getDataAsync = useCallback(async () => {
      const goData = state.getData();
      if (state.triggerType === TRIGGER_TYPES.DATE_FIELD) {
        if (goData?.streamId) return goData;
        const { goData: goDataWithStream, error } =
          await registerDateFieldStreamAndGetGoData(goData);
        return error ? goData : goDataWithStream;
      }
      if (state.triggerType === TRIGGER_TYPES.SHEET) {
        if (goData?.streamId) return goData;
        const { goData: goDataWithStream, error } =
          await registerSheetStreamAndGetGoData(goData);
        return error ? goData : goDataWithStream;
      }
      return goData;
    }, [
      state.getData,
      state.triggerType,
      registerDateFieldStreamAndGetGoData,
      registerSheetStreamAndGetGoData,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getDataAsync,
        getError: state.getError,
        /** Used by canvas on drawer close so type/subType/name/_src are persisted (legacy shape). */
        getLegacySavePayload: buildLegacySavePayload,
      }),
      [state, buildLegacySavePayload, getDataAsync],
    );

    const handlePrimaryAction = useCallback(() => {
      const doSave = (goData, updated) => {
        const goDataKeys =
          goData && typeof goData === "object" ? Object.keys(goData) : [];
        console.log("[TriggerSetup] onSave", {
          triggerType: state.triggerType,
          goDataKeys,
          streamId: goData?.streamId ?? null,
          updatedNodeData_type: updated?.type,
          updatedNodeData_subType: updated?.subType,
        });
        onSave(goData, updated, false);
      };
      const runSave = async () => {
        const primaryActionLabel =
          typeof getPrimaryActionLabel === "function"
            ? getPrimaryActionLabel()
            : "Save & Close";
        console.log("[TriggerSetup] save entry", {
          triggerType: state.triggerType,
          activeTab,
          primaryActionLabel,
          validationIsValid: state.validation.isValid,
          validationErrors: state.validation.errors ?? [],
        });
        if (activeTab === TABS.CHOOSE) {
          if (isSimpleTrigger(state.triggerType)) {
            console.log(
              "[TriggerSetup] save branch: CHOOSE → simple trigger (Manual), getData + doSave",
            );
            console.log("[TriggerSetup] save flow", {
              triggerType: state.triggerType,
              phase: "getData",
            });
            const goData = state.getData();
            console.log("[TriggerSetup] getData result", {
              triggerType: state.triggerType,
              goDataKeys: Object.keys(goData || {}),
            });
            doSave(goData, buildUpdatedNodeData());
          } else if (needsConfigureTab(state.triggerType)) {
            console.log(
              "[TriggerSetup] save branch: CHOOSE → needs Configure, navigating to CONFIGURE (no save, no API)",
              {
                triggerType: state.triggerType,
              },
            );
            setActiveTab(TABS.CONFIGURE);
          } else if (state.validation.isValid) {
            console.log(
              "[TriggerSetup] save branch: CHOOSE → complex trigger save",
              {
                triggerType: state.triggerType,
              },
            );
            console.log("[TriggerSetup] save flow", {
              triggerType: state.triggerType,
              phase: "getData",
            });
            const goData = state.getData();
            console.log("[TriggerSetup] getData result", {
              triggerType: state.triggerType,
              goDataKeys: Object.keys(goData || {}),
              streamId: goData?.streamId ?? null,
            });
            if (state.triggerType === TRIGGER_TYPES.DATE_FIELD) {
              console.log(
                "[TriggerSetup] CONFIGURE save: calling registerDateFieldStreamAndGetGoData (DATE_FIELD)",
              );
              const { goData: goDataWithStream, error } =
                await registerDateFieldStreamAndGetGoData(goData);
              if (!error) doSave(goDataWithStream, buildUpdatedNodeData());
            } else if (state.triggerType === TRIGGER_TYPES.SHEET) {
              console.log(
                "[TriggerSetup] CONFIGURE save: calling registerSheetStreamAndGetGoData (SHEET)",
              );
              const { goData: goDataWithStream, error } =
                await registerSheetStreamAndGetGoData(goData);
              if (!error) doSave(goDataWithStream, buildUpdatedNodeData());
            } else {
              doSave(goData, buildUpdatedNodeData());
            }
          }
        } else if (activeTab === TABS.CONFIGURE) {
          console.log("[TriggerSetup] save branch: CONFIGURE → saving", {
            triggerType: state.triggerType,
            validationIsValid: state.validation.isValid,
          });
          if (!state.validation.isValid) {
            console.log(
              "[TriggerSetup] save branch: CONFIGURE → validation invalid, save blocked",
              {
                triggerType: state.triggerType,
                validationErrors: state.validation.errors ?? [],
              },
            );
          } else if (state.validation.isValid) {
            console.log("[TriggerSetup] save flow", {
              triggerType: state.triggerType,
              phase: "getData",
            });
            const goData = state.getData();
            console.log("[TriggerSetup] getData result", {
              triggerType: state.triggerType,
              goDataKeys: Object.keys(goData || {}),
              streamId: goData?.streamId ?? null,
            });
            if (state.triggerType === TRIGGER_TYPES.DATE_FIELD) {
              console.log(
                "[TriggerSetup] CONFIGURE save: calling registerDateFieldStreamAndGetGoData (DATE_FIELD)",
              );
              const { goData: goDataWithStream, error } =
                await registerDateFieldStreamAndGetGoData(goData);
              if (!error) doSave(goDataWithStream, buildUpdatedNodeData());
            } else if (state.triggerType === TRIGGER_TYPES.SHEET) {
              console.log(
                "[TriggerSetup] CONFIGURE save: calling registerSheetStreamAndGetGoData (SHEET)",
              );
              const { goData: goDataWithStream, error } =
                await registerSheetStreamAndGetGoData(goData);
              if (!error) doSave(goDataWithStream, buildUpdatedNodeData());
            } else {
              console.log(
                "[TriggerSetup] CONFIGURE save: direct doSave (no stream API)",
                {
                  triggerType: state.triggerType,
                },
              );
              if (state.triggerType === TRIGGER_TYPES.TIME_BASED) {
                console.log(
                  "[TriggerSetup] TIME_BASED save: getData + doSave (no API expected)",
                );
              }
              doSave(goData, buildUpdatedNodeData());
            }
          }
        }
      };
      runSave();
    }, [
      activeTab,
      state.validation.isValid,
      state.triggerType,
      state,
      onSave,
      buildUpdatedNodeData,
      registerDateFieldStreamAndGetGoData,
      registerSheetStreamAndGetGoData,
    ]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.CHOOSE);
      }
    }, [activeTab]);

    const handleNavigateToConfigure = useCallback(() => {
      setActiveTab(TABS.CONFIGURE);
    }, []);

    const tabs = useMemo(() => {
      const baseTabs = [
        { id: TABS.CHOOSE, label: "Choose Trigger", icon: Settings },
      ];

      if (state.triggerType && needsConfigureTab(state.triggerType)) {
        baseTabs.push({
          id: TABS.CONFIGURE,
          label: "Configure",
          icon: Settings,
        });
      }

      return baseTabs;
    }, [state.triggerType]);

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CHOOSE) {
        if (!state.triggerType) return "Continue";
        if (isSimpleTrigger(state.triggerType)) return "Save & Close";
        if (needsConfigureTab(state.triggerType)) return "Continue";
        return "Save & Close";
      }
      if (activeTab === TABS.CONFIGURE) {
        return "Save & Close";
      }
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CHOOSE) {
        if (!state.triggerType) return true;
        if (isSimpleTrigger(state.triggerType)) return false;
        if (needsConfigureTab(state.triggerType)) {
          if (state.triggerType === TRIGGER_TYPES.APP_BASED) {
            return (
              !state.integration ||
              !state.integrationEvent ||
              !state.integrationConnection
            );
          }
          return false;
        }
        return !state.validation.isValid;
      }
      if (activeTab === TABS.CONFIGURE) {
        return !state.validation.isValid;
      }
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CHOOSE) {
        if (!state.triggerType) return "Select how your workflow should start";
        if (isSimpleTrigger(state.triggerType))
          return "Your trigger is ready - click Save to continue";
        if (needsConfigureTab(state.triggerType)) {
          if (state.triggerType === TRIGGER_TYPES.APP_BASED) {
            if (!state.integration) return "Select an app to connect";
            if (!state.integrationEvent)
              return "Select an event that triggers the workflow";
            if (!state.integrationConnection)
              return "Connect your account to continue";
            return "Click Configure to set up the trigger details";
          }
          return "Click Configure to set up the schedule or webhook";
        }
        if (!state.validation.isValid)
          return state.validation.errors?.[0] || "Complete the configuration";
        return "Click Save to continue";
      }
      if (activeTab === TABS.CONFIGURE) {
        if (!state.validation.isValid)
          return state.validation.errors?.[0] || "Complete the configuration";
        return "Configuration complete - click Save to continue";
      }
      return null;
    };

    const renderConfigPanel = () => {
      if (!state.triggerType) return null;

      switch (state.triggerType) {
        case TRIGGER_TYPES.MANUAL:
          return <ManualPanel state={state} variables={variables} />;
        case TRIGGER_TYPES.TIME_BASED:
          return <TimeBasedPanel state={state} />;
        case TRIGGER_TYPES.WEBHOOK:
          return (
            <WebhookPanel
              state={state}
              variables={variables}
              webhookUrl={webhookUrl}
              assetId={assetId}
            />
          );
        case TRIGGER_TYPES.FORM:
          return (
            <FormPanel
              state={state}
              variables={variables}
              workspaceId={workspaceId}
            />
          );
        case TRIGGER_TYPES.SHEET:
          return (
            <SheetPanel
              state={state}
              variables={variables}
              workspaceId={workspaceId}
              assetId={assetId}
            />
          );
        case TRIGGER_TYPES.DATE_FIELD:
          return (
            <DateFieldPanel
              state={state}
              variables={variables}
              workspaceId={workspaceId}
              assetId={assetId}
            />
          );
        case TRIGGER_TYPES.APP_BASED:
          return (
            <AppBasedPanel
              ref={configPanelRef}
              state={state}
              variables={variables}
              resourceIds={{
                workspaceId,
                assetId,
                projectId,
                parentId,
                _id: state.integrationEventData?._id,
                canvasId: state.integrationEventData?.canvas_id,
              }}
              onConfigureDone={(configuredData) => {
                state.setIntegrationConfigureData?.(configuredData);
              }}
            />
          );
        default:
          return null;
      }
    };

    const renderContent = () => {
      if (activeTab === TABS.CONFIGURE) {
        return (
          <div
            ref={contentRef}
            className="flex min-h-0 flex-col overflow-x-hidden overflow-y-auto"
          >
            <div className="min-w-0 flex-1 overflow-x-hidden">
              {renderConfigPanel()}
            </div>
          </div>
        );
      }

      return (
        <div
          ref={contentRef}
          className="flex flex-col h-full min-w-0 max-w-full box-border overflow-x-hidden overflow-y-auto"
          onScroll={handleScroll}
        >
          <ConversationalTriggerSetup
            state={state}
            integrations={integrations}
            integrationsLoading={integrationsLoading}
            workspaceId={workspaceId}
            assetId={assetId}
            projectId={projectId}
            parentId={parentId}
            onNavigateToConfigure={handleNavigateToConfigure}
          />
        </div>
      );
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<Zap className="w-5 h-5" />}
        title={data?.name || nodeData?.name || "Trigger Setup"}
        subtitle="Configure how your workflow starts"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={handlePrimaryAction}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab !== TABS.CHOOSE}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        footerVariant="default"
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState?.({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
        footerPrefix={
          activeTab === TABS.CHOOSE && state.triggerType ? (
            <PreviewSentence
              state={state}
              className={isScrolled ? "sticky bottom-0" : ""}
            />
          ) : null
        }
        contentClassName="min-w-0 max-w-full overflow-x-hidden"
      >
        {renderContent()}
      </WizardDrawer>
    );
  },
);

TriggerSetupV3.displayName = "TriggerSetupV3";

export default TriggerSetupV3;
