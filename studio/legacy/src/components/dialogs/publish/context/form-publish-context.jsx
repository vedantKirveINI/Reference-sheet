import { createContext, useCallback, useMemo, useState } from "react";
import { DEFAULT_EMBED_MODE, EMBED_MODES } from "../constants";

const FormPublishContext = createContext({});

export const FormPublishProvider = ({ children, initialAssetDetails }) => {
  const { customDomainData: initialCustomDomainData, ...rest } =
    initialAssetDetails || {};

  const [assetDetails, setAssetDetails] = useState(rest);

  // Store custom domain data separately in context
  const [customDomainData, setCustomDomainData] = useState(
    initialCustomDomainData || { domainList: [], customUrls: [] },
  );
  const [embedMode, setEmbedMode] = useState(DEFAULT_EMBED_MODE);
  const [embedSettings, setEmbedSettings] = useState({
    width: { value: "400", unit: "px" },
    height: { value: "100", unit: "%" },
    buttonText: "Click here!",
    buttonColor: "#212121",
    fontSize: "16",
    roundedCorners: "16",
    changeToTextLink: false,
    sliderPosition: "right",
    callout: "Confused? Tell us what you need",
    backgroundTransparency: "100",
    fullscreenMobile: true,
    hideHeaders: false,
  });

  const setEmbedModeWithConstraints = useCallback((newMode) => {
    setEmbedMode(newMode);

    if (newMode === EMBED_MODES.FULL_PAGE) {
      setEmbedSettings((prev) => ({
        ...prev,
        width: { value: "100", unit: "%" },
        height: { value: "100", unit: "%" },
      }));
    }
  }, []);

  const isAssetPublished = useMemo(() => {
    return !!assetDetails?.asset?.published_info;
  }, [assetDetails]);

  const value = {
    embedMode,
    setEmbedMode: setEmbedModeWithConstraints,
    embedSettings,
    setEmbedSettings,
    assetDetails,
    setAssetDetails,
    isAssetPublished,
    customDomainData,
    setCustomDomainData,
  };

  return (
    <FormPublishContext.Provider value={value}>
      {children}
    </FormPublishContext.Provider>
  );
};

export default FormPublishContext;
