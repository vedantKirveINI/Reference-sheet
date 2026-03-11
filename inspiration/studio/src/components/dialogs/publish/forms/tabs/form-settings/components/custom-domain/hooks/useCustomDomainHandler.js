import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { serverConfig } from "@src/module/ods";
import domainSDKServices from "../../../../../../../../../sdk-services/domain-sdk-services";
import { getStoredPath, validatePath } from "../utils/customDomainHelpers";
import { REDIRECT_PATHS } from "../../../../../../../../../pages/ic-canvas/constants/constants";
// import { serverConfig } from '@src/module/ods';

const useCustomDomainHandler = ({
  domainList = [],
  customUrls = [],
  isLoading = false,
  assetDetails,
  onRefreshSubdomains,
  onAddNewSubdomain,
  onCustomUrlSaved,
  onCustomUrlDeleted,
}) => {
  const [pathErrors, setPathErrors] = useState({});
  const [collapsedCards, setCollapsedCards] = useState({});
  const [isRotating, setIsRotating] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [isSavingLinkId, setIsSavingLinkId] = useState(null);

  // Tracks local changes: { [linkId]: { data: {...}, status: 'unsaved' | 'saved' | 'modified' } }
  const [localLinkChanges, setLocalLinkChanges] = useState({});

  // Deleted link IDs - to filter out from API data
  const [deletedLinkIds, setDeletedLinkIds] = useState(new Set());

  // Derive API links from customUrls, filtering out deleted ones
  const apiLinks = useMemo(() => {
    if (!Array.isArray(customUrls) || customUrls.length === 0) {
      return [];
    }
    return customUrls
      .filter((urlMapping) => {
        const id = urlMapping._id || urlMapping.id;
        return id && !deletedLinkIds.has(id);
      })
      .map((urlMapping, index) => ({
        id: urlMapping._id || `custom-link-${index}`,
        custom_domain_subdomain: urlMapping.domain || "",
        custom_domain_path: urlMapping.path_prefix || "/",
        _id: urlMapping._id,
      }));
  }, [customUrls, deletedLinkIds]);

  const apiLinkIdsForFilter = useMemo(() => {
    return new Set(apiLinks.map((link) => link.id));
  }, [apiLinks]);

  const customDomainLinks = useMemo(() => {
    const apiLinksWithModifications = apiLinks.map((link) => {
      const localChange = localLinkChanges[link.id];
      if (localChange?.status === "modified") {
        return { ...link, ...localChange.data };
      }
      return link;
    });

    const localOnlyLinks = Object.entries(localLinkChanges)
      .filter(([linkId, change]) => {
        return (
          (change.status === "unsaved" || change.status === "saved") &&
          !apiLinkIdsForFilter.has(linkId)
        );
      })
      .map(([linkId, change]) => ({
        id: linkId,
        ...change.data,
      }));

    return [...apiLinksWithModifications, ...localOnlyLinks];
  }, [apiLinks, localLinkChanges, apiLinkIdsForFilter]);

  const apiLinkIds = useMemo(() => {
    return new Set(apiLinks.map((link) => link.id));
  }, [apiLinks]);

  const linkById = useMemo(() => {
    const map = new Map();

    customDomainLinks.forEach((link) => {
      map.set(link.id, link);
    });
    return map;
  }, [customDomainLinks]);

  const isLinkSaved = (linkId) => {
    const existsInApi = apiLinkIds.has(linkId);
    const localChange = localLinkChanges[linkId];

    // If there are local modifications, the link is not saved
    if (
      localChange?.status === "modified" ||
      localChange?.status === "unsaved"
    ) {
      return false;
    }

    return existsInApi || localChange?.status === "saved";
  };

  const hasLinkChanged = (linkId) => {
    const localChange = localLinkChanges[linkId];
    if (!localChange) return false;

    if (localChange.status === "modified" || localChange.status === "unsaved") {
      if (localChange.status === "unsaved") {
        const hasData =
          localChange.data?.custom_domain_subdomain ||
          localChange.data?.custom_domain_path;
        return !!hasData;
      }
      return true;
    }

    return !apiLinkIds.has(linkId);
  };

  const checkForDuplicateLink = (linkId, domain, path, links) => {
    const normalizedPath = path || "/";
    return links.some(
      (link) =>
        link.id !== linkId &&
        link.custom_domain_subdomain === domain &&
        (link.custom_domain_path || "/") === normalizedPath,
    );
  };

  const handleRefreshClick = () => {
    if (isLoading) return;

    setIsRotating(true);
    onRefreshSubdomains();

    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  const handleAddLink = () => {
    const newLinkId = uuidv4();
    setLocalLinkChanges((prev) => ({
      ...prev,
      [newLinkId]: {
        data: {
          custom_domain_subdomain: "",
          custom_domain_path: "",
        },
        status: "unsaved",
      },
    }));
  };

  const handleRemoveLink = async (linkId) => {
    const urlMapping = customUrls.find(
      (mapping) => mapping._id === linkId || mapping.id === linkId,
    );

    if (urlMapping) {
      const domainIdToDelete = urlMapping._id || urlMapping.id;
      if (!domainIdToDelete) {
        toast.error("Unable to find domain ID for deletion");
        return;
      }

      try {
        await domainSDKServices.deleteDomain({
          domain_id: domainIdToDelete,
        });

        // Update parent customUrls state to remove deleted URL
        if (onCustomUrlDeleted) {
          onCustomUrlDeleted(urlMapping._id || urlMapping.id);
        }

        setDeletedLinkIds((prev) => new Set([...prev, linkId]));
        setLocalLinkChanges((prev) => {
          const next = { ...prev };
          delete next[linkId];
          return next;
        });

        toast.success("Custom URL deleted successfully");
      } catch (deleteError) {
        toast.error(
          deleteError?.result?.message || "Failed to delete domain mapping",
        );
      }
    } else {
      setLocalLinkChanges((prev) => {
        const next = { ...prev };
        delete next[linkId];
        return next;
      });
    }
  };

  const handleToggleCard = (linkId) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [linkId]: !prev[linkId],
    }));
  };

  const handleRevertChanges = (linkId) => {
    const localChange = localLinkChanges[linkId];
    const originalApiLink = linkById.get(linkId);

    if (originalApiLink && apiLinkIds.has(linkId)) {
      setLocalLinkChanges((prev) => {
        const next = { ...prev };
        delete next[linkId];
        return next;
      });
    } else if (localChange) {
      setLocalLinkChanges((prev) => ({
        ...prev,
        [linkId]: {
          data: {
            custom_domain_subdomain: "",
            custom_domain_path: "",
          },
          status: "unsaved",
        },
      }));
    }

    setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
  };

  const handleSaveChanges = async (linkId) => {
    if (isSavingLinkId !== null) {
      return;
    }

    const link = linkById.get(linkId);
    if (!link || !link.custom_domain_subdomain || !assetDetails?.asset?._id) {
      return;
    }

    const linkPath = link.custom_domain_path || "/";
    if (
      checkForDuplicateLink(
        linkId,
        link.custom_domain_subdomain,
        linkPath,
        customDomainLinks,
      )
    ) {
      toast.error(
        "This custom link is already in use. Please use a different domain or path.",
      );
      return;
    }

    const path = link.custom_domain_path || "";
    if (!validatePath(path, linkId, setPathErrors)) {
      if (!path.trim()) {
        toast.error("Path cannot be empty");
      }
      return;
    }

    const trimmedPath = path.trim();
    setIsSavingLinkId(linkId);

    // Check if this is an update to an existing link
    const localChange = localLinkChanges[linkId];
    const isModifiedLink = localChange?.status === "modified";
    const originalApiLink = apiLinks.find((link) => link.id === linkId);
    const domainId =
      isModifiedLink && originalApiLink?._id ? originalApiLink._id : undefined;

    try {
      const payload = {
        workspace_id: assetDetails?.asset?.workspace_id,
        domain: link.custom_domain_subdomain,
        asset_id: assetDetails?.asset?._id,
        path_prefix: trimmedPath,
        // Explicitly set mapping_type to "path"
        mapping_type: "path",
      };

      if (domainId) {
        payload._id = domainId;
      }

      const response = await domainSDKServices.setDomain(payload);

      // localChange already retrieved above
      const isNewLink = localChange?.status === "unsaved";

      // If save response contains the saved URL data, update parent state
      if (response?.status === "success" && response?.result) {
        const savedUrl = response.result;
        // Format saved URL to match customUrls structure (same as findByWorkspace returns)
        const formattedSavedUrl = {
          _id: savedUrl._id,
          domain: savedUrl.domain || link.custom_domain_subdomain,
          path_prefix: savedUrl.path_prefix || trimmedPath,
          asset_id: assetDetails?.asset?._id,
          workspace_id: assetDetails?.asset?.workspace_id,
          ...savedUrl,
        };
        // Update parent customUrls state directly
        if (onCustomUrlSaved) {
          onCustomUrlSaved(formattedSavedUrl);
        }

        setLocalLinkChanges((prev) => {
          const next = { ...prev };
          delete next[linkId];
          return next;
        });
      }

      setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
      toast.success("Domain mapping saved successfully");
    } catch (domainError) {
      const errorMessage =
        domainError?.result?.message || "Failed to save domain mapping";

      toast.error(errorMessage);
    } finally {
      setIsSavingLinkId(null);
    }
  };

  const handlePathBlur = (linkId) => {
    const link = linkById.get(linkId);
    if (!link) return;
    validatePath(link.custom_domain_path || "", linkId, setPathErrors);
  };

  const openAddNewSubdomain = () => {
    const newWindow = window.open(
      `${serverConfig.WC_LANDING_URL}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.ADMIN}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (newWindow && typeof newWindow.focus === "function") {
      newWindow.focus();
    }

    if (onAddNewSubdomain) {
      onAddNewSubdomain();
    }
  };

  const subdomainOptions = useMemo(() => {
    return [
      ...domainList
        .map((domain) => {
          if (!domain) {
            return null;
          }

          if (typeof domain === "string") {
            const trimmed = domain.trim();
            if (!trimmed) {
              return null;
            }

            return {
              label: trimmed,
              value: trimmed,
            };
          }

          const optionValue = domain.domain || "";

          const trimmedValue =
            typeof optionValue === "string" ? optionValue.trim() : optionValue;
          if (!trimmedValue) {
            return null;
          }

          return {
            ...domain,
            label: trimmedValue,
            value: trimmedValue,
          };
        })
        .filter(Boolean),
      {
        label: "+ Add new domain",
        value: "ADD_NEW_DOMAIN",
      },
    ];
  }, [domainList]);

  const hasConfiguredSubdomains = useMemo(() => {
    return subdomainOptions.some(
      (option) => option && option.value !== "ADD_NEW_DOMAIN",
    );
  }, [subdomainOptions]);

  // Helper to update local link changes with new data
  const updateLocalLinkChange = (linkId, updates, preservePath = false) => {
    const isSavedLink = apiLinkIds.has(linkId);
    const currentChange = localLinkChanges[linkId];
    const existingData = currentChange?.data || {};
    const existingLink = linkById.get(linkId);
    const currentData = existingLink || existingData;

    setLocalLinkChanges((prev) => ({
      ...prev,
      [linkId]: {
        data: {
          ...currentData,
          ...updates,
          ...(preservePath && {
            custom_domain_path: currentData.custom_domain_path || "",
          }),
        },
        status: isSavedLink ? "modified" : "unsaved",
      },
    }));
  };

  const handleSubdomainChange = (linkId, event, selectedValue) => {
    if (
      selectedValue === "ADD_NEW_DOMAIN" ||
      (typeof selectedValue === "object" &&
        selectedValue?.value === "ADD_NEW_DOMAIN")
    ) {
      openAddNewSubdomain();
      return;
    }

    const selectedOption =
      typeof selectedValue === "object"
        ? selectedValue
        : subdomainOptions.find((option) => option.value === selectedValue) ||
          {};

    const subdomainValue =
      typeof selectedOption === "object" && selectedOption?.value
        ? selectedOption.value
        : selectedValue;

    updateLocalLinkChange(
      linkId,
      { custom_domain_subdomain: subdomainValue },
      true,
    );
  };

  const handlePathChange = (linkId, e) => {
    const value = e.target.value;
    const pathWithSlash = getStoredPath(value);
    validatePath(pathWithSlash, linkId, setPathErrors);
    updateLocalLinkChange(linkId, { custom_domain_path: pathWithSlash });
  };

  const handleCopyLink = async (linkId, url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch {
    }
  };

  // Check if a link has duplicate domain + path combination
  const isLinkDuplicate = (linkId) => {
    const link = linkById.get(linkId);
    if (!link || !link.custom_domain_subdomain || !link.custom_domain_path) {
      return false;
    }

    const linkPath = link.custom_domain_path || "/";
    return checkForDuplicateLink(
      linkId,
      link.custom_domain_subdomain,
      linkPath,
      customDomainLinks,
    );
  };

  const isDomainInWarningState = (domainOption) => {
    if (!domainOption) return false;

    const verificationStatus = domainOption?.verification_status;

    const isDnsPending =
      verificationStatus === "pending" || verificationStatus === "unverified";

    return isDnsPending;
  };

  const getWarningMessage = (domainOption) => {
    if (!domainOption) return "";

    const verificationStatus = domainOption?.verification_status;
    const sslStatus = domainOption?.ssl_status;

    const issues = [];

    if (
      verificationStatus === "pending" ||
      verificationStatus === "unverified"
    ) {
      issues.push("DNS verification is pending");
    }

    if (sslStatus !== "active" && sslStatus !== "verified") {
      issues.push("SSL certificate is not active");
    }

    if (issues.length === 0) return "";

    return `Domain is not ready: ${issues.join(" and ")}. Please wait for verification to complete.`;
  };

  useEffect(() => {
    setCollapsedCards((prev) => {
      const next = { ...prev };
      let changed = false;

      customDomainLinks.forEach((link) => {
        if (next[link.id] === undefined) {
          next[link.id] = false;
          changed = true;
        }
      });

      Object.keys(next).forEach((id) => {
        if (!linkById.has(id)) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [customDomainLinks]);

  useEffect(() => {
    const apiIds = new Set(
      (customUrls || []).map((item) => item._id || item.id).filter(Boolean),
    );

    setLocalLinkChanges((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((linkId) => {
        if (apiIds.has(linkId)) {
          delete next[linkId];
        }
      });
      return next;
    });

    setDeletedLinkIds((prev) => {
      const cleaned = new Set();
      prev.forEach((deletedId) => {
        // Only keep deleted IDs if they're not in the new customUrls
        if (!apiIds.has(deletedId)) {
          cleaned.add(deletedId);
        }
      });
      return cleaned;
    });
  }, [customUrls]);

  useEffect(() => {
    setPathErrors((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach((id) => {
        if (!linkById.has(id)) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [linkById]);

  return {
    // State
    pathErrors,
    collapsedCards,
    isRotating,
    copiedLinkId,
    isSavingLinkId,
    customDomainLinks,
    subdomainOptions,
    hasConfiguredSubdomains,
    // Helpers
    isLinkSaved,
    hasLinkChanged,
    isLinkDuplicate,
    isDomainInWarningState,
    getWarningMessage,
    // Handlers
    handleRefreshClick,
    handleAddLink,
    handleRemoveLink,
    handleToggleCard,
    handleRevertChanges,
    handleSaveChanges,
    handlePathBlur,
    handleSubdomainChange,
    handlePathChange,
    handleCopyLink,
    openAddNewSubdomain,
  };
};

export default useCustomDomainHandler;
