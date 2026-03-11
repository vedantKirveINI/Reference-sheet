import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CANVAS_MODE,
  CANVAS_MODES,
  localStorageConstants,
} from "../module/constants";
import {
  AGENT_WORKFLOW,
  INTEGRATION_TYPE,
} from "../components/canvas/extensions";
import { NODE_TEMPLATES } from "../components/canvas/templates";

import assetSDKServices from "../sdk-services/asset-sdk-services";
import { getSearchConfig, INTEGRATIONS } from "../config/config";
import { MY_AGENTS } from "../components/canvas/config";

export const useSearchConfig = ({ workspaceId = null }) => {
  const [config, setConfig] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const allConfigs = useMemo(() => getSearchConfig(), []);
  const integrationThumbnailMap = useRef({});

  const isDevMode =
    typeof window !== "undefined" &&
    localStorage.getItem(localStorageConstants.DEV_MODE) === "true";

  const getAllConfigsCombined = useCallback(async () => {
    let aiConfig = null;
    let integrationConfig = null;

    const response = await assetSDKServices.getEvents({
      workspace_id: workspaceId,
    });

    if (response.status === "success") {
      if (response.result?.agents?.length) {
        aiConfig = {
          label: MY_AGENTS,
          components: response.result.agents.map((i) => ({
            _src: i?.meta?.thumbnail,
            name: i.name,
            type: AGENT_WORKFLOW,
            template: NODE_TEMPLATES.CIRCLE,
            background: i.meta?.bgColor,
            foreground: i.meta?.fgColor,
            id: i._id,
          })),
        };
      }

      if (response.result?.integrations?.length) {
        const integrationComponents = response.result.integrations.map((i) => {
          integrationThumbnailMap.current[i._id] = {
            _src: i?.meta?.thumbnail,
          };
          return {
            _src: i?.meta?.thumbnail,
            name: i.name,
            type: INTEGRATION_TYPE,
            template: NODE_TEMPLATES.CIRCLE,
            background: i.meta?.bgColor,
            foreground: i.meta?.fgColor,
            id: i._id,
            events: {
              label: i.name,
              components: i.events.map((e) => {
                integrationThumbnailMap.current[e._id] = {
                  _src: e?.meta?.thumbnail,
                };
                return {
                  _src: i?.meta?.thumbnail,
                  name: e.name,
                  description: i.name,
                  type: INTEGRATION_TYPE,
                  template: NODE_TEMPLATES.CIRCLE,
                  background: i.meta?.bgColor,
                  foreground: i.meta?.fgColor,
                  id: e._id,
                  annotation: e.annotation,
                };
              }),
            },
          };
        });
        integrationConfig = {
          label: INTEGRATIONS,
          components: integrationComponents,
        };
      }
    }

    const _allCombinedConfigs = [...allConfigs];

    if (aiConfig) {
      _allCombinedConfigs.splice(
        Math.min(2, _allCombinedConfigs.length),
        0,
        aiConfig
      );
    }

    if (integrationConfig) {
      _allCombinedConfigs.push(integrationConfig);
    }

    return _allCombinedConfigs;
  }, [workspaceId, allConfigs]);

  useEffect(() => {
    const getConfigs = async () => {
      try {
        setLoadingConfig(true);
        const currentMode = CANVAS_MODE();
        const shouldFetchIntegrations = 
          currentMode === CANVAS_MODES.WORKFLOW_CANVAS ||
          currentMode === CANVAS_MODES.WC_CANVAS ||
          currentMode === CANVAS_MODES.TOOL_CANVAS ||
          isDevMode;
        
        if (shouldFetchIntegrations) {
          const _allCombinedConfigs = await getAllConfigsCombined();
          setConfig(_allCombinedConfigs);
        } else {
          setConfig(allConfigs);
        }
      } catch (e) {
      } finally {
        setLoadingConfig(false);
      }
    };

    getConfigs();
  }, [isDevMode, getAllConfigsCombined, allConfigs]);

  return {
    config,
    loadingConfig,
    integrationThumbnailMap: integrationThumbnailMap.current,
  };
};
