import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { DEFAULT_SETTINGS, EMBED_MODES, Mode, ViewPort } from "./constants";
import { getTransformedNodeData, getInitialNodeMapping } from "../publish/forms/utils/formResponses";

const PublishContext = createContext({});

export const PublishProvider = ({ 
  children, 
  initialAssetDetails, 
  onSettingsChange, 
  nodes = [],
  domainList = [],
  customUrls = [],
  onRefreshSubdomains,
  onAddNewSubdomain,
  onCustomUrlSaved,
  onCustomUrlDeleted,
  isDomainsLoading = false,
}) => {
  const [assetDetails, setAssetDetails] = useState(initialAssetDetails || {});
  const [customUrlsState, setCustomUrlsState] = useState(customUrls);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [settings, setSettings] = useState(() => {
    const formSettings = initialAssetDetails?.asset?.settings?.form || {};
    const tracking = initialAssetDetails?.asset?.settings?.tracking || {};
    return {
      ...DEFAULT_SETTINGS,
      isPasswordProtected: !!formSettings.password,
      password: formSettings.password || "",
      isScheduled: !!formSettings.schedule_at,
      scheduleDate: formSettings.schedule_date || formSettings.schedule_at || null,
      scheduleTime: formSettings.schedule_time || null,
      isRespondentLimitEnabled: !!formSettings.is_max_responses_enabled,
      respondentLimit: formSettings.max_responses || 100,
      isAutoCloseEnabled: !!formSettings.is_close_at_enabled,
      autoCloseDate: formSettings.close_date || formSettings.close_at || null,
      autoCloseTime: formSettings.close_time || null,
      removeBranding: !!formSettings.remove_branding,
      customLogo: formSettings.custom_logo || null,
      notifyOnResponse: !!formSettings.notify_on_response,
      notifyEmail: formSettings.notify_email || "",
      gtmId: tracking.gtm_id || "",
      gtmEnabled: !!tracking.gtm_enabled,
      gaId: tracking.ga_id || "",
      gaEnabled: !!tracking.ga_enabled,
      metaPixelId: tracking.meta_pixel_id || "",
      metaPixelEnabled: !!tracking.meta_pixel_enabled,
      collectLocation: !!formSettings.collect_location,
      collectIP: !!formSettings.collect_ip,
    };
  });

  const [mode, setMode] = useState(Mode.CARD);
  const [viewport, setViewport] = useState(ViewPort.DESKTOP);
  const [embedMode, setEmbedMode] = useState(EMBED_MODES.FULL_PAGE);
  const [embedSettings, setEmbedSettings] = useState({
    width: "100%",
    height: "500px",
    buttonText: "Open Form",
    buttonColor: "#1C3693",
    fontSize: 16,
    roundedCorners: 8,
    sliderPosition: "right",
    callout: "",
    textLinkMode: false,
  });

  const questions = useMemo(() => {
    return getTransformedNodeData(nodes || []);
  }, [nodes]);

  const [responseMappings, setResponseMappings] = useState(() => {
    const existingMappings = initialAssetDetails?.meta?.sheet?.mappings;
    if (existingMappings && existingMappings.length > 0) {
      return existingMappings.map(mapping => ({
        name: mapping?.name || "",
        columnType: "question",
        value: mapping?.nodeId?.[0] || "",
        type: mapping?.type,
        id: mapping?.id,
      }));
    }
    const transformedQuestions = getTransformedNodeData(nodes || []);
    return getInitialNodeMapping({ questions: transformedQuestions });
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      onSettingsChange?.(updated);
      return updated;
    });
  }, [onSettingsChange]);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      onSettingsChange?.(updated);
      return updated;
    });
  }, [onSettingsChange]);

  const isPublished = useMemo(() => {
    return !!assetDetails?.asset?.published_info?.published_at;
  }, [assetDetails]);

  const formUrl = useMemo(() => {
    const publishedInfo = assetDetails?.asset?.published_info?.details;
    if (publishedInfo?.url) return publishedInfo.url;
    if (assetDetails?.asset?.slug) {
      return `https://forms.app/${assetDetails.asset.slug}`;
    }
    return "";
  }, [assetDetails]);

  const handleCustomUrlSaved = useCallback((savedUrl) => {
    setCustomUrlsState(prev => {
      const existingIndex = prev.findIndex(url => url._id === savedUrl._id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = savedUrl;
        return updated;
      }
      return [...prev, savedUrl];
    });
    onCustomUrlSaved?.(savedUrl);
  }, [onCustomUrlSaved]);

  const handleCustomUrlDeleted = useCallback((urlId) => {
    setCustomUrlsState(prev => prev.filter(url => (url._id || url.id) !== urlId));
    onCustomUrlDeleted?.(urlId);
  }, [onCustomUrlDeleted]);

  const value = {
    assetDetails,
    setAssetDetails,
    settings,
    updateSetting,
    updateSettings,
    mode,
    setMode,
    viewport,
    setViewport,
    embedMode,
    setEmbedMode,
    embedSettings,
    setEmbedSettings,
    isPublished,
    formUrl,
    isPublishing,
    setIsPublishing,
    publishStatus,
    setPublishStatus,
    questions,
    responseMappings,
    setResponseMappings,
    domainList,
    customUrls: customUrlsState,
    onRefreshSubdomains,
    onAddNewSubdomain,
    onCustomUrlSaved: handleCustomUrlSaved,
    onCustomUrlDeleted: handleCustomUrlDeleted,
    isDomainsLoading,
  };

  return (
    <PublishContext.Provider value={value}>
      {children}
    </PublishContext.Provider>
  );
};

export const usePublish = () => {
  const context = useContext(PublishContext);
  if (!context) {
    throw new Error("usePublish must be used within a PublishProvider");
  }
  return context;
};

export default PublishContext;
