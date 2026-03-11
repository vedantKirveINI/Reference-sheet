import { useCallback, useEffect, useRef } from "react";
import uatuSDKServices from "../sdk-services/uatu-sdk-services";
import { SUCCESS } from "../constants/keys";
import {
  getGeoData,
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

export const useCanvasUtauEvents = ({ assetDetails = {}, userData = {} }) => {
  const userSessionId = useRef(null);
  const previewTimeRef = useRef(null);
  const geoDataRef = useRef(null);
  const eventsCommonDataRef = useRef(null);

  const initUATU = useCallback(async () => {
    const response = await uatuSDKServices.init();
    if (response?.status === SUCCESS) {
      userSessionId.current = response?.result;
    }
  }, []);

  const onNewEvent = useCallback(async (event, data = {}) => {
    if (event !== UATU_CANVAS) return;

    const commonData = {
      ...eventsCommonDataRef?.current,
      userSessionId: userSessionId.current,
    };

    const eventType = data?.subEvent;

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.USER_LAST_ACTIVE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.USER_LAST_ACTIVE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_START) {
      const geoData = (await getGeoData()) || {};
      geoDataRef.current = geoData;
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_START, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_START,
        timeStamp: new Date().toISOString(),
        userAgent: window?.navigator?.userAgent,
        geoData: geoData,
        screenResolution: `${window?.screen?.width}X${window?.screen?.height}`,
        userId: commonData?.userId,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_START) {
      previewTimeRef.current = Date.now();
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_START, {
        ...data,
        startTime: previewTimeRef.current,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_END) {
      const endTime = Date.now();
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_END, {
        ...data,
        endTime,
        timeSpent: endTime - previewTimeRef.current,
        ...commonData,
      });
      previewTimeRef.current = null;
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_SUCCESS) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_SUCCESS, {
        ...data,
        timeSpend: Date.now() - previewTimeRef.current,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.ASSET_SAVE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.ASSET_SAVE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.ASSET_PUBLISH) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.ASSET_PUBLISH, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FORM_SAVE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FORM_SAVE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FORM_PUBLISH) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FORM_PUBLISH, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.ADD_NODE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.ADD_NODE, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.ADD_NODE,
        timeStamp: new Date().toISOString(),
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.CHAT_WITH_US_CLICK) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.CHAT_WITH_US_CLICK, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.CHAT_WITH_US_CLICK,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION,
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.COPY_FORM_URL) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.COPY_FORM_URL, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.QR_SHARE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.QR_SHARE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.FACEBOOK_SHARE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.FACEBOOK_SHARE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.LINKEDIN_SHARE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.LINKEDIN_SHARE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.X_SHARE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.X_SHARE, {
        ...data,
        ...commonData,
      });
      return;
    }

    if (eventType === UATU_PREDICATE_EVENTS_CANVAS.SEARCH_NODE) {
      uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.SEARCH_NODE, {
        ...data,
        ...commonData,
      });
      return;
    }
  }, []);

  useEffect(() => {
    const handleTabClose = () => {
      try {
        uatuSDKServices.emit(UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_END, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_END,
          exitTime: new Date().toISOString(),
          assetId: assetDetails?.asset_id,
          workspaceId: assetDetails?.workspace_id,
          userSessionId: userSessionId.current,
        });
      } catch (error) {
        console.error("Failed to emit session end event:", error);
      }
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  useEffect(() => {
    if (
      !assetDetails?.asset_id ||
      !assetDetails?.workspace_id ||
      !userData?._id
    )
      return;
    eventsCommonDataRef.current = {
      assetId: assetDetails?.asset_id,
      workspaceId: assetDetails?.workspace_id,
      userId: userData?._id,
    };
  }, [assetDetails?.asset_id, assetDetails?.workspace_id, userData?._id]);

  return {
    initUATU,
    onNewEvent,
  };
};
