import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

const HARDCODED_QUERY_PARAM =
  "eyJ3IjoiNjQwNmRlMWYtNDEwNS00YmNjLWIxOGUtYzRkZGNiYzZjN2VkIiwiYSI6ImEyNTQ2ODJjLTJmYzktNDI0MC05YzkxLTJhZjhjODM4ZTBjZSIsInQiOm51bGx9";

const AuthRoute = ({ component: Component, ...componentProps }) => {
  const {
    updateAssetId,
    updateWorkspaceId,
    updateParentId,
    updateProjectId,
    updateEventType,
    setHost,
  } = useContext(ICStudioContext);
  const navigate = useNavigate();
  // const { w, pj, pr, a } = useParams();
  const [searchParams] = useSearchParams();
  const [w, setW] = useState(null);
  const [pj, setPj] = useState(null);
  const [pr, setPr] = useState(null);
  const [a, setA] = useState(null);
  const [t, setT] = useState(null);

  const [valid, setValid] = useState(false);

  const validateSession = useCallback(async () => {
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
    const queryParam = searchParams.get(QUERY_KEY) || HARDCODED_QUERY_PARAM;
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
  }, [searchParams, setW, setPj, setPr, setA, setT, navigate, setHost]);
  useEffect(() => {
    validateSession();
  }, [validateSession]);
  return <>{valid && <Component {...componentProps} />}</>;
};
export default AuthRoute;
