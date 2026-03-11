import React, { useEffect, useState, useCallback, useContext } from "react";
import { ICStudioContext } from "../ICStudioContext";
import { useSearchParams } from "react-router-dom";
import { decodeParameters } from "../utils/utils";
import {
  ASSET_KEY,
  EVENT_TYPE_KEY,
  HOST_KEY,
  PARENT_KEY,
  PROJECT_KEY,
  QUERY_KEY,
  WORKSPACE_KEY,
} from "../constants/keys";
import { serverConfig } from "@src/module/ods";
import { Button } from "@/components/ui/button";

const MissingContextScreen = () => {
  const landingUrl = serverConfig.WC_LANDING_URL || "#";
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-muted-foreground max-w-md">
        Open this studio from the platform with a workspace and asset. The
        required context is missing from the URL.
      </p>
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = landingUrl;
        }}
      >
        Go to platform
      </Button>
    </div>
  );
};

const AuthRoute = ({ component: Component, ...componentProps }) => {
  const {
    updateAssetId,
    updateWorkspaceId,
    updateParentId,
    updateProjectId,
    updateEventType,
    setHost,
    isEmbedMode,
  } = useContext(ICStudioContext);
  const [searchParams] = useSearchParams();
  const [w, setW] = useState(null);
  const [pj, setPj] = useState(null);
  const [pr, setPr] = useState(null);
  const [a, setA] = useState(null);
  const [t, setT] = useState(null);
  const [valid, setValid] = useState(false);
  const [hasQueryParam, setHasQueryParam] = useState(true);

  const validateSession = useCallback(() => {
    setValid(false);
    updateWorkspaceId(w);
    updateProjectId(pj);
    updateParentId(pr);
    updateAssetId(a);
    if (t) {
      updateEventType(t);
    }
    setValid(true);
  }, [
    a,
    pj,
    pr,
    t,
    updateAssetId,
    updateEventType,
    updateParentId,
    updateProjectId,
    updateWorkspaceId,
    w,
  ]);

  useEffect(() => {
    const queryParam = searchParams.get(QUERY_KEY);
    if (!queryParam) {
      setHasQueryParam(false);
      setValid(false);
      return;
    }
    setHasQueryParam(true);
    try {
      const params = decodeParameters(queryParam);
      const host = searchParams.get(HOST_KEY);
      if (host) {
        setHost(host);
      }
      setW(params[WORKSPACE_KEY]);
      setPj(params[PROJECT_KEY]);
      setPr(params[PARENT_KEY]);
      setA(params[ASSET_KEY]);
      setT(params[EVENT_TYPE_KEY]);
    } catch {
      setHasQueryParam(false);
      setValid(false);
    }
  }, [searchParams, setHost]);

  useEffect(() => {
    if (hasQueryParam && (w !== undefined || a !== undefined)) {
      validateSession();
    }
  }, [validateSession, hasQueryParam, w, a]);

  if (isEmbedMode) {
    return <Component {...componentProps} />;
  }

  if (!hasQueryParam) {
    return <MissingContextScreen />;
  }
  return <>{valid && <Component {...componentProps} />}</>;
};
export default AuthRoute;
