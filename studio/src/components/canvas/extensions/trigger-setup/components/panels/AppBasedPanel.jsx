import React, { forwardRef, useCallback, useMemo } from "react";
import { CheckCircle2, Settings, Info, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Integration } from "@src/module/integration-v2";
import { THEME } from "../../constants";
import { getMergedVariables } from "../../../integration-node/utils/get-merged-variables";
import { variableSDKServices } from "@oute/oute-ds.common.core.utils";
import { sanitizeInitialPipeline } from "../../../integration-node/utils";

const removeFirstKeyValuePair = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  const entries = Object.entries(obj);
  if (entries.length <= 1) return {};
  return Object.fromEntries(entries.slice(1));
};

const TRIGGER_THEME = {
  background: "#1C3693",
  foreground: "#FFFFFF",
  dark: "#152961",
  light: "#4B6DD4",
};

const AppBasedPanel = forwardRef(
  (
    { state, variables = {}, resourceIds = {}, onConfigureDone = () => {} },
    ref,
  ) => {
    const {
      integration,
      integrationEvent,
      integrationConnection,
      integrationEventData,
      integrationConfigureData,
      setIntegrationConfigureData,
    } = state;

    const eventData = integrationEventData;
    const flow = useMemo(() => {
      if (!eventData?.flow) return {};
      return removeFirstKeyValuePair(eventData.flow);
    }, [eventData?.flow]);

    const projectVariables = eventData?.projectVariables || {};

    // Legacy: getInitialAnswers = () => configureData?.state; state is keyed by node id (same keys as flow passed to Integration).
    // Integration receives flow = removeFirstKeyValuePair(eventData.flow), so first node key is eventData.flow keys [1].
    const getInitialAnswers = useCallback(() => {
      const raw =
        integrationConfigureData?.state ?? state.state ?? {};
      const flowKeys = eventData?.flow ? Object.keys(eventData.flow) : [];
      const reserved = new Set(["pipeline", "parentId", "projectId", "workspaceId", "assetId", "token"]);
      const normalized = {};
      for (const [key, value] of Object.entries(raw)) {
        if (reserved.has(key)) continue;
        if (value != null && typeof value === "object" && "response" in value) {
          normalized[key] = value;
        } else {
          normalized[key] = { response: value ?? {} };
        }
      }
      // Connection node is the first node in the flow that Integration sees (second key in full flow)
      const connectionNodeKey = flowKeys[1] ?? flowKeys[0];
      if (flowKeys.length > 0 && connectionNodeKey && !normalized[connectionNodeKey]) {
        const fromState = integrationConfigureData?.state?.[connectionNodeKey] ?? raw[connectionNodeKey];
        if (fromState != null) {
          normalized[connectionNodeKey] =
            fromState?.response != null ? fromState : { response: fromState };
        } else if (integrationConnection) {
          const connectionConfig =
            integrationConnection?.refreshedConfigs ||
            integrationConnection?.configs ||
            {};
          normalized[connectionNodeKey] = { response: { ...connectionConfig } };
        }
      }
      return normalized;
    }, [integrationConfigureData, state.state, eventData?.flow, integrationConnection]);

    if (process.env.NODE_ENV === "development") {
      console.log("[AppBasedPanel] render", {
        hasIntegration: !!integration,
        hasEvent: !!integrationEvent,
        hasConnection: !!integrationConnection,
        hasEventData: !!eventData,
        hasEventDataFlow: !!eventData?.flow,
        flowNodeCount: Object.keys(flow).length,
        hasConfigureData: !!integrationConfigureData,
        pipelineFromConfigure: integrationConfigureData?.state?.pipeline != null,
      });
    }

    const onSuccess = useCallback(
      async (answers, pipeline, configs) => {
        const allVariables = getMergedVariables(projectVariables, variables);
        const allVariablesState =
          await variableSDKServices.transformedToState(allVariables);
        let allVariablesStateResult = structuredClone(
          allVariablesState?.result || {},
        );

        delete allVariablesStateResult[resourceIds?.assetId];
        delete allVariablesStateResult[resourceIds?.projectId];
        delete answers[resourceIds?.projectId];
        delete answers[resourceIds?.assetId];

        const configuredData = {
          type: "INTEGRATION_TRIGGER",
          state: {
            ...answers,
            pipeline,
            parentId: resourceIds?.parentId,
            projectId: resourceIds?.projectId,
            workspaceId: resourceIds?.workspaceId,
            assetId: resourceIds?.assetId,
            token: window.accessToken,
            ...(allVariablesStateResult || {}),
          },
          flow: { ...eventData, id: eventData?._id },
          configs,
        };

        setIntegrationConfigureData?.(configuredData);
        onConfigureDone(configuredData);
      },
      [
        eventData,
        projectVariables,
        resourceIds,
        variables,
        setIntegrationConfigureData,
        onConfigureDone,
      ],
    );

    const onAnswerChange = useCallback(
      (answers) => {
        if (setIntegrationConfigureData) {
          setIntegrationConfigureData((prev) => ({
            ...prev,
            state: { ...(prev?.state || {}), ...answers },
          }));
        }
      },
      [setIntegrationConfigureData],
    );

    if (!integration || !integrationEvent || !integrationConnection) {
      return (
        <div className="p-6">
          <div className="rounded-xl p-6 text-center bg-amber-50 border border-amber-200">
            <Info className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="font-semibold text-amber-900 mb-2">
              Setup Incomplete
            </h4>
            <p className="text-sm text-amber-700">
              Please go back to the Choose Trigger tab to select an app, event,
              and connect your account.
            </p>
          </div>
        </div>
      );
    }

    if (!eventData) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">
            Loading configuration...
          </span>
        </div>
      );
    }

    const integrationIcon = integration.meta?.thumbnail || integration.icon;
    const integrationColor = integration.color || "#6366F1";
    const hasConfigurableFlow = Object.keys(flow).length > 0;

    return (
      <div className="flex flex-col h-full">
        <div className="pb-4 border-b border-border">
          <div className="p-3 rounded-xl border border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${integrationColor}15` }}
              >
                <img
                  src={integrationIcon}
                  alt={integration.name}
                  className="w-5 h-5"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {integration.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {integrationEvent.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {hasConfigurableFlow ? (
          <div className="flex-1 min-h-0 overflow-auto">
            <Integration
              nodeTheme={TRIGGER_THEME}
              theme={THEME}
              initialAnswers={getInitialAnswers()}
              initialPipeline={sanitizeInitialPipeline(
                integrationConfigureData?.state?.pipeline,
                flow,
              )}
              allNodes={flow}
              annotation={eventData?.annotation}
              onSuccess={onSuccess}
              variables={variables}
              workspaceId={resourceIds?.workspaceId}
              projectId={resourceIds?.projectId}
              assetId={resourceIds?.assetId}
              canvasId={resourceIds?.canvasId}
              _id={resourceIds?._id}
              configs={integrationConfigureData?.configs}
              onAnswerUpdate={onAnswerChange}
            />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">
                Trigger Configuration
              </Label>
            </div>

            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  No additional configuration required. Your workflow will
                  trigger automatically when the "{integrationEvent.name}" event
                  occurs in {integration.name}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

AppBasedPanel.displayName = "AppBasedPanel";

export default AppBasedPanel;
