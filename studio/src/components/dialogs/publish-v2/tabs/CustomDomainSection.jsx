import { useState, useMemo, useCallback } from "react";
import {
  Globe,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Copy,
  RefreshCw,
  AlertCircle,
  Crown,
  ExternalLink,
  Info,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePublish } from "../context";
import { toast } from "sonner";
import { serverConfig } from "@src/module/ods";
import domainSDKServices from "../../../../sdk-services/domain-sdk-services";
import { REDIRECT_PATHS } from "../../../../pages/ic-canvas/constants/constants";

const URL_PATH_REGEX = /^(\/[a-z0-9\-_\/]*)?$/i;

const getDisplayPath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path.slice(1) : path;
};

const getStoredPath = (value) => {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const constructFullUrl = (link) => {
  const subdomain = link?.custom_domain_subdomain || "";
  const path = link?.custom_domain_path || "";
  if (!subdomain) return "";
  let url = `https://${subdomain}`;
  if (path) {
    url += path.startsWith("/") ? path : `/${path}`;
  }
  return url;
};

const validatePath = (value, linkId, setPathErrors) => {
  if (!value || value.trim() === "") {
    setPathErrors((prev) => ({ ...prev, [linkId]: "Path cannot be empty" }));
    return false;
  }
  const trimmedValue = value.trim();
  const pathWithoutSlash = trimmedValue.startsWith("/")
    ? trimmedValue.slice(1)
    : trimmedValue;
  if (!URL_PATH_REGEX.test(trimmedValue)) {
    setPathErrors((prev) => ({
      ...prev,
      [linkId]:
        "Path must contain only letters, numbers, hyphens, and underscores",
    }));
    return false;
  }
  if (pathWithoutSlash.length < 5 || pathWithoutSlash.length > 15) {
    setPathErrors((prev) => ({
      ...prev,
      [linkId]: "Path must be between 5 and 15 characters",
    }));
    return false;
  }
  setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
  return true;
};

const PremiumUserWarning = () => {
  const handleUpgradeClick = () => {
    const baseUrl = serverConfig.WC_LANDING_URL || "";
    window.open(
      `${baseUrl}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.PLANS_AND_BILLING}`,
      "_blank",
    );
  };

  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          Upgrade plan to use custom domain
        </span>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={handleUpgradeClick}
        className="bg-zinc-900 hover:bg-zinc-800 text-white"
      >
        <Crown className="w-4 h-4 mr-2" />
        Upgrade Plan
      </Button>
    </div>
  );
};

const UnpublishedAssetWarning = () => {
  return (
    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-amber-600" />
      <span className="text-sm font-medium text-amber-800">
        Form should be published once to use custom domain
      </span>
    </div>
  );
};

const CustomDomainCard = ({
  link,
  index,
  isCollapsed,
  pathError,
  isSaved,
  isDuplicate,
  isSaving,
  hasChanges,
  subdomainOptions,
  isLoading,
  copiedLinkId,
  isDomainWarning,
  warningMessage,
  onToggle,
  onSubdomainChange,
  onPathChange,
  onPathBlur,
  onSave,
  onRevert,
  onRemove,
  onCopyLink,
}) => {
  const previewUrl = constructFullUrl(link);
  const displayUrl = previewUrl ? previewUrl.replace("https://", "") : "";
  const isLinkConfigured = Boolean(link.custom_domain_subdomain);

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors min-w-0"
        onClick={() => onToggle(link.id)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="font-medium text-zinc-900 truncate">
            Custom URL {index + 1}
          </span>
          {isDuplicate && (
            <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
              Duplicate detected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLinkConfigured && (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave(link.id);
                  }}
                  disabled={isDuplicate || isSaving || isSaved}
                  className="h-8"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
                </Button>
                {hasChanges && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevert(link.id);
                    }}
                    className="h-8"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Revert
                  </Button>
                )}
              </div>
              <div className="w-px h-6 bg-zinc-200" />
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(link.id);
            }}
            className="h-8 w-8 text-zinc-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="border-t border-zinc-200" />
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end min-w-0">
              <div className="space-y-2 min-w-0">
                <Label className="text-sm text-zinc-700">
                  Select Custom Domain <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={link.custom_domain_subdomain || ""}
                    onValueChange={(value) => onSubdomainChange(link.id, value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full min-w-0 h-9 [&>span]:truncate [&>span]:block [&>span]:min-w-0">
                      <SelectValue placeholder="form.example.com" />
                    </SelectTrigger>
                    <SelectContent>
                      {subdomainOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className={
                            option.value === "ADD_NEW_DOMAIN"
                              ? "text-[#1C3693] font-medium"
                              : ""
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="shrink-0">
                          <Info className="w-4 h-4 text-zinc-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Select a domain configured at your organization level
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex h-9 items-center justify-center pb-0.5">
                <span className="text-zinc-500 font-medium text-lg">/</span>
              </div>

              <div className="space-y-2 min-w-0">
                <Label className="text-sm text-zinc-700">
                  Path <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={getDisplayPath(link.custom_domain_path)}
                    onChange={(e) => onPathChange(link.id, e)}
                    onBlur={() => onPathBlur(link.id)}
                    placeholder="Enter path"
                    maxLength={15}
                    className={cn("h-9 flex-1 min-w-0", pathError && "border-red-500")}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="shrink-0">
                          <Info className="w-4 h-4 text-zinc-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional path (e.g: contact-form, survey)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {pathError && <p className="text-sm text-red-500">{pathError}</p>}

            {isDuplicate && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">
                  This custom link is already in use.
                </span>
              </div>
            )}

            {isDomainWarning && !isDuplicate && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">{warningMessage}</span>
              </div>
            )}

            {isLinkConfigured && previewUrl && isSaved && (
              <div className="flex items-center justify-between gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1C3693] hover:underline truncate min-w-0"
                    title={displayUrl}
                  >
                    {displayUrl}
                  </a>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyLink(link.id, previewUrl);
                  }}
                  className="h-8"
                >
                  {copiedLinkId === link.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CustomDomainSection = ({ isPremiumUser }) => {
  const {
    assetDetails,
    isPublished,
    domainList,
    customUrls,
    onRefreshSubdomains,
    onAddNewSubdomain,
    onCustomUrlSaved,
    onCustomUrlDeleted,
    isDomainsLoading,
  } = usePublish();

  const [pathErrors, setPathErrors] = useState({});
  const [collapsedCards, setCollapsedCards] = useState({});
  const [isRotating, setIsRotating] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [isSavingLinkId, setIsSavingLinkId] = useState(null);
  const [localLinkChanges, setLocalLinkChanges] = useState({});
  const [deletedLinkIds, setDeletedLinkIds] = useState(new Set());

  const apiLinks = useMemo(() => {
    if (!Array.isArray(customUrls) || customUrls.length === 0) return [];
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

  const apiLinkIdsForFilter = useMemo(
    () => new Set(apiLinks.map((link) => link.id)),
    [apiLinks],
  );
  const apiLinkIds = useMemo(
    () => new Set(apiLinks.map((link) => link.id)),
    [apiLinks],
  );

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
      .map(([linkId, change]) => ({ id: linkId, ...change.data }));
    return [...apiLinksWithModifications, ...localOnlyLinks];
  }, [apiLinks, localLinkChanges, apiLinkIdsForFilter]);

  const linkById = useMemo(() => {
    const map = new Map();
    customDomainLinks.forEach((link) => map.set(link.id, link));
    return map;
  }, [customDomainLinks]);

  const subdomainOptions = useMemo(() => {
    return [
      ...domainList
        .map((domain) => {
          if (!domain) return null;
          if (typeof domain === "string") {
            const trimmed = domain.trim();
            if (!trimmed) return null;
            return { label: trimmed, value: trimmed };
          }
          const optionValue = domain.domain || "";
          const trimmedValue =
            typeof optionValue === "string" ? optionValue.trim() : optionValue;
          if (!trimmedValue) return null;
          return { ...domain, label: trimmedValue, value: trimmedValue };
        })
        .filter(Boolean),
      { label: "+ Add new domain", value: "ADD_NEW_DOMAIN" },
    ];
  }, [domainList]);

  const isLinkSaved = useCallback(
    (linkId) => {
      const existsInApi = apiLinkIds.has(linkId);
      const localChange = localLinkChanges[linkId];
      if (
        localChange?.status === "modified" ||
        localChange?.status === "unsaved"
      )
        return false;
      return existsInApi || localChange?.status === "saved";
    },
    [apiLinkIds, localLinkChanges],
  );

  const hasLinkChanged = useCallback(
    (linkId) => {
      const localChange = localLinkChanges[linkId];
      if (!localChange) return false;
      if (
        localChange.status === "modified" ||
        localChange.status === "unsaved"
      ) {
        if (localChange.status === "unsaved") {
          const hasData =
            localChange.data?.custom_domain_subdomain ||
            localChange.data?.custom_domain_path;
          return !!hasData;
        }
        return true;
      }
      return !apiLinkIds.has(linkId);
    },
    [localLinkChanges, apiLinkIds],
  );

  const checkForDuplicateLink = useCallback((linkId, domain, path, links) => {
    const normalizedPath = path || "/";
    return links.some(
      (link) =>
        link.id !== linkId &&
        link.custom_domain_subdomain === domain &&
        (link.custom_domain_path || "/") === normalizedPath,
    );
  }, []);

  const isLinkDuplicate = useCallback(
    (linkId) => {
      const link = linkById.get(linkId);
      if (!link || !link.custom_domain_subdomain || !link.custom_domain_path)
        return false;
      const linkPath = link.custom_domain_path || "/";
      return checkForDuplicateLink(
        linkId,
        link.custom_domain_subdomain,
        linkPath,
        customDomainLinks,
      );
    },
    [linkById, customDomainLinks, checkForDuplicateLink],
  );

  const isDomainInWarningState = useCallback((domainOption) => {
    if (!domainOption) return false;
    const verificationStatus = domainOption?.verification_status;
    return (
      verificationStatus === "pending" || verificationStatus === "unverified"
    );
  }, []);

  const getWarningMessage = useCallback((domainOption) => {
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
  }, []);

  const handleRefreshClick = useCallback(() => {
    if (isDomainsLoading) return;
    setIsRotating(true);
    onRefreshSubdomains?.();
    setTimeout(() => setIsRotating(false), 600);
  }, [isDomainsLoading, onRefreshSubdomains]);

  const handleAddLink = useCallback(() => {
    const newLinkId = uuidv4();
    setLocalLinkChanges((prev) => ({
      ...prev,
      [newLinkId]: {
        data: { custom_domain_subdomain: "", custom_domain_path: "" },
        status: "unsaved",
      },
    }));
  }, []);

  const handleRemoveLink = useCallback(
    async (linkId) => {
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
          await domainSDKServices.deleteDomain({ domain_id: domainIdToDelete });
          onCustomUrlDeleted?.(urlMapping._id || urlMapping.id);
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
    },
    [customUrls, onCustomUrlDeleted],
  );

  const handleToggleCard = useCallback((linkId) => {
    setCollapsedCards((prev) => ({ ...prev, [linkId]: !prev[linkId] }));
  }, []);

  const handleRevertChanges = useCallback(
    (linkId) => {
      const localChange = localLinkChanges[linkId];
      if (apiLinkIds.has(linkId)) {
        setLocalLinkChanges((prev) => {
          const next = { ...prev };
          delete next[linkId];
          return next;
        });
      } else if (localChange) {
        setLocalLinkChanges((prev) => ({
          ...prev,
          [linkId]: {
            data: { custom_domain_subdomain: "", custom_domain_path: "" },
            status: "unsaved",
          },
        }));
      }
      setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
    },
    [localLinkChanges, apiLinkIds],
  );

  const handleSaveChanges = useCallback(
    async (linkId) => {
      if (isSavingLinkId !== null) return;
      const link = linkById.get(linkId);
      if (!link || !link.custom_domain_subdomain || !assetDetails?.asset?._id)
        return;
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
        if (!path.trim()) toast.error("Path cannot be empty");
        return;
      }
      const trimmedPath = path.trim();
      setIsSavingLinkId(linkId);
      const localChange = localLinkChanges[linkId];
      const isModifiedLink = localChange?.status === "modified";
      const originalApiLink = apiLinks.find((l) => l.id === linkId);
      const domainId =
        isModifiedLink && originalApiLink?._id
          ? originalApiLink._id
          : undefined;
      try {
        const payload = {
          workspace_id: assetDetails?.asset?.workspace_id,
          domain: link.custom_domain_subdomain,
          asset_id: assetDetails?.asset?._id,
          path_prefix: trimmedPath,
          mapping_type: "path",
        };
        if (domainId) payload._id = domainId;
        const response = await domainSDKServices.setDomain(payload);
        if (response?.status === "success" && response?.result) {
          const savedUrl = response.result;
          const formattedSavedUrl = {
            _id: savedUrl._id,
            domain: savedUrl.domain || link.custom_domain_subdomain,
            path_prefix: savedUrl.path_prefix || trimmedPath,
            asset_id: assetDetails?.asset?._id,
            workspace_id: assetDetails?.asset?.workspace_id,
            ...savedUrl,
          };
          onCustomUrlSaved?.(formattedSavedUrl);
          setLocalLinkChanges((prev) => {
            const next = { ...prev };
            delete next[linkId];
            return next;
          });
        }
        setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
        toast.success("Domain mapping saved successfully");
      } catch (domainError) {
        toast.error(
          domainError?.result?.message || "Failed to save domain mapping",
        );
      } finally {
        setIsSavingLinkId(null);
      }
    },
    [
      isSavingLinkId,
      linkById,
      assetDetails,
      customDomainLinks,
      checkForDuplicateLink,
      localLinkChanges,
      apiLinks,
      onCustomUrlSaved,
    ],
  );

  const handlePathBlur = useCallback(
    (linkId) => {
      const link = linkById.get(linkId);
      if (!link) return;
      validatePath(link.custom_domain_path || "", linkId, setPathErrors);
    },
    [linkById],
  );

  const openAddNewSubdomain = useCallback(() => {
    const newWindow = window.open(
      `${serverConfig.WC_LANDING_URL}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.ADMIN}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (newWindow && typeof newWindow.focus === "function") newWindow.focus();
    onAddNewSubdomain?.();
  }, [onAddNewSubdomain]);

  const updateLocalLinkChange = useCallback(
    (linkId, updates, preservePath = false) => {
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
    },
    [apiLinkIds, localLinkChanges, linkById],
  );

  const handleSubdomainChange = useCallback(
    (linkId, value) => {
      if (value === "ADD_NEW_DOMAIN") {
        openAddNewSubdomain();
        return;
      }
      updateLocalLinkChange(linkId, { custom_domain_subdomain: value }, true);
    },
    [openAddNewSubdomain, updateLocalLinkChange],
  );

  const handlePathChange = useCallback(
    (linkId, e) => {
      const value = e.target.value;
      const pathWithSlash = getStoredPath(value);
      validatePath(pathWithSlash, linkId, setPathErrors);
      updateLocalLinkChange(linkId, { custom_domain_path: pathWithSlash });
    },
    [updateLocalLinkChange],
  );

  const handleCopyLink = useCallback(async (linkId, url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch {}
  }, []);

  if (!isPremiumUser) {
    return (
      <div className="rounded-xl border-2 border-zinc-200 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 text-zinc-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900">Custom Domain</span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            </div>
            <div className="text-sm text-zinc-500 mt-0.5">
              Use your own domain for form URLs
            </div>
          </div>
        </div>
        <PremiumUserWarning />
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="rounded-xl border-2 border-zinc-200 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 text-zinc-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="font-medium text-zinc-900">Custom Domain</span>
            <div className="text-sm text-zinc-500 mt-0.5">
              Use your own domain for form URLs
            </div>
          </div>
        </div>
        <UnpublishedAssetWarning />
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-zinc-200 p-4 space-y-4 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1C3693] text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-medium text-zinc-900">Custom URL</span>
            <div className="text-sm text-zinc-500 mt-0.5">
              Change the path of the link and create custom links
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshClick}
            disabled={isDomainsLoading}
            className={`h-8 w-8 ${isRotating ? "animate-spin" : ""}`}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddLink}>
            <Plus className="w-4 h-4 mr-1" />
            Add Link
          </Button>
        </div>
      </div>

      {customDomainLinks.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
          <p>No custom URLs configured</p>
          <p className="text-sm">
            Click "Add Link" to create your first custom URL
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customDomainLinks.map((link, index) => {
            const selectedDomainOption = subdomainOptions.find(
              (opt) => opt.value === link.custom_domain_subdomain,
            );
            return (
              <CustomDomainCard
                key={link.id}
                link={link}
                index={index}
                isCollapsed={collapsedCards[link.id] || false}
                pathError={pathErrors[link.id]}
                isSaved={isLinkSaved(link.id)}
                isDuplicate={isLinkDuplicate(link.id)}
                isSaving={isSavingLinkId === link.id}
                hasChanges={hasLinkChanged(link.id)}
                subdomainOptions={subdomainOptions}
                isLoading={isDomainsLoading}
                copiedLinkId={copiedLinkId}
                isDomainWarning={
                  selectedDomainOption &&
                  isDomainInWarningState(selectedDomainOption)
                }
                warningMessage={
                  selectedDomainOption
                    ? getWarningMessage(selectedDomainOption)
                    : ""
                }
                onToggle={handleToggleCard}
                onSubdomainChange={handleSubdomainChange}
                onPathChange={handlePathChange}
                onPathBlur={handlePathBlur}
                onSave={handleSaveChanges}
                onRevert={handleRevertChanges}
                onRemove={handleRemoveLink}
                onCopyLink={handleCopyLink}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDomainSection;
