import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";
import classes from "./index.module.css";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import UnpublishedAssetWarning from "./components/UnpublishedAssetWarning";
import PremiumUserWarning from "./components/PremiumUserWarning";
import useCustomDomainHandler from "./hooks/useCustomDomainHandler";
import { constructFullUrl, getDisplayPath } from "./utils/customDomainHelpers";

const DomainCombobox = ({
  options = [],
  value,
  onValueChange,
  placeholder = "Select domain...",
  loading = false,
  className,
  disabled,
  "data-testid": dataTestId,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue) => {
    if (selectedValue === "ADD_NEW_DOMAIN") {
      // Handle special case for adding new domain
      onValueChange?.(selectedValue);
      setOpen(false);
      return;
    }
    onValueChange?.(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-9 font-normal min-w-0",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled || loading}
          data-testid={dataTestId}
        >
          {loading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : selectedOption ? (
            <span className="min-w-0 truncate text-left">{selectedOption.label}</span>
          ) : (
            <span className="min-w-0 truncate text-left">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[999999999]" align="start">
        <Command>
          <CommandInput placeholder="Search domain..." />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No domain found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isAddNewOption = option.value === "ADD_NEW_DOMAIN";
                    const isSelected = value === option.value;
                    return (
                      <CommandItem
                        key={String(option.value)}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          "cursor-pointer",
                          isAddNewOption && classes.addNewDomainOption,
                        )}
                        data-testid={
                          isAddNewOption
                            ? "add-new-subdomain-option"
                            : "subdomain-option"
                        }
                      >
                        {!isAddNewOption && (
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        )}
                        {isAddNewOption ? (
                          <span className={classes.addNewDomainOptionLabel}>
                            {option.label}
                          </span>
                        ) : (
                          <div className={classes.domainOptionContent}>
                            <span className={classes.domainOptionTitle}>
                              {option.label}
                            </span>
                          </div>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CustomDomain = ({
  domainList = [],
  onAddNewSubdomain,
  isLoading = false,
  customUrls = [],
  onRefreshSubdomains,
  onCustomUrlSaved,
  onCustomUrlDeleted,
  assetDetails,
  isPremiumUser,
}) => {
  const { isAssetPublished } = useFormPublishContext();

  const {
    pathErrors,
    collapsedCards,
    isRotating,
    copiedLinkId,
    isSavingLinkId,
    customDomainLinks,
    subdomainOptions,
    hasConfiguredSubdomains,
    isLinkSaved,
    hasLinkChanged,
    isLinkDuplicate,
    isDomainInWarningState,
    getWarningMessage,
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
  } = useCustomDomainHandler({
    domainList,
    customUrls,
    isLoading,
    assetDetails,
    onRefreshSubdomains,
    onAddNewSubdomain,
    onCustomUrlSaved,
    onCustomUrlDeleted,
  });

  if (!isPremiumUser) {
    return <PremiumUserWarning />;
  }

  if (!isAssetPublished) {
    return <UnpublishedAssetWarning />;
  }

  return (
    <div className="flex flex-col w-full space-y-4">
      <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.globe && <icons.globe className="h-4 w-4 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">
            Custom Domain URLs
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Create branded form links using your own domain. Custom URLs improve
            brand recognition and make your forms look more professional.
          </AlertDescription>
        </div>
      </Alert>

      <Card className="p-4 bg-muted/30 border-border">
        <div className="flex items-start gap-3">
          {icons.link && (
            <icons.link className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-foreground mb-1.5">
              Benefits
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>
                  Professional branded links (e.g., forms.yourcompany.com)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>Custom paths for different forms or campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>Improved trust and recognition from users</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center pt-2">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-semibold text-foreground">
            Custom URL
          </Label>
          <p className="text-xs text-muted-foreground">
            Change the path of the link and create custom link.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleAddLink}
          data-testid="custom-domain-add-link"
          className="gap-2"
        >
          {icons.add && <icons.add className="w-4 h-4" />}
          ADD LINK
        </Button>
      </div>

      <div className={classes.simpleView}>
        <div className={classes.cardsScrollArea}>
          {customDomainLinks.map((link, index) => {
            const selectedDomainOption = subdomainOptions.find(
              (option) => option?.value === link.custom_domain_subdomain,
            );
            const previewUrl = constructFullUrl(link);
            const displayUrl = previewUrl
              ? previewUrl.replace("https://", "")
              : "";
            const isLinkConfigured = Boolean(link.custom_domain_subdomain);
            const isCardCollapsed = collapsedCards[link.id] || false;
            const pathError = pathErrors[link.id];
            const linkIsSaved = isLinkSaved(link.id);
            const isDuplicate = isLinkDuplicate(link.id);
            const isSaving = isSavingLinkId === link.id;
            const hasChanges = hasLinkChanged(link.id);

            return (
              <div key={link.id} className={classes.customUrlCard}>
                <div
                  className={classes.cardHeader}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleCard(link.id)}
                >
                  <div className={cn(classes.cardHeaderText, "min-w-0 flex-1")}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label className="text-sm font-semibold text-foreground">
                        {`Custom URL ${index + 1}`}
                      </Label>
                      {isDuplicate && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium text-amber-600 border-amber-300"
                        >
                          Duplicate detected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={classes.cardHeaderActions}>
                    {isLinkConfigured && (
                      <>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSaveChanges(link.id);
                            }}
                            disabled={isDuplicate || isSaving || linkIsSaved}
                            className="gap-1.5"
                          >
                            {icons.check && (
                              <icons.check className="w-3.5 h-3.5" />
                            )}
                            {isSaving
                              ? "SAVING..."
                              : linkIsSaved
                                ? "SAVED"
                                : "SAVE"}
                          </Button>
                          {hasChanges && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRevertChanges(link.id);
                              }}
                              data-testid="custom-domain-revert-button"
                              className="gap-1.5"
                            >
                              {icons.rotateCcw && (
                                <icons.rotateCcw className="w-3.5 h-3.5" />
                              )}
                              REVERT
                            </Button>
                          )}
                        </div>
                        <div className={classes.actionDivider} />
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveLink(link.id);
                      }}
                      className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove custom URL ${index + 1}`}
                    >
                      {icons.trash2 && <icons.trash2 className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleCard(link.id);
                      }}
                      className="w-7 h-7 text-foreground"
                      aria-label={`Toggle custom URL ${index + 1}`}
                    >
                      {isCardCollapsed
                        ? icons.chevronDown && (
                            <icons.chevronDown className="w-4 h-4" />
                          )
                        : icons.chevronUp && (
                            <icons.chevronUp className="w-4 h-4" />
                          )}
                    </Button>
                  </div>
                </div>

                {!isCardCollapsed && (
                  <>
                    <div className={classes.cardDivider} />
                    <div className={classes.cardContent}>
                      {!isLinkConfigured && (
                        <Card className="p-3 bg-muted/30 border-border mb-4">
                          <div className="flex items-start gap-2">
                            {icons.info && (
                              <icons.info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-medium text-foreground mb-1">
                                Setup Instructions
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Select a custom domain from your organization
                                and add a path to create a branded form URL. The
                                domain must be configured at the organization
                                level first.
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}
                      <div className={classes.domainBuilderContainer}>
                        <div className={classes.domainInputGrid}>
                          <div className={classes.domainInputRow}>
                            <div
                              className={`${classes.inputSection} ${classes.inputColumn}`}
                            >
                              <div className={classes.inputLabelRow}>
                                <div className={classes.inputLabelGroup}>
                                  <Label className="text-sm text-foreground">
                                    Select Custom Domain
                                    <span className="text-destructive ml-1">
                                      *
                                    </span>
                                  </Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="cursor-help"
                                        >
                                          {icons.info && (
                                            <icons.info className="w-5 h-5 text-muted-foreground mt-0.5" />
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">
                                          Select a domain configured at your
                                          organization level
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={!isLoading && handleRefreshClick}
                                  aria-label="Refresh custom domains"
                                  title="Refresh custom domains"
                                  data-testid="custom-domain-refresh-button"
                                  className={`${classes.refreshButton} ${
                                    isLoading
                                      ? classes.refreshButtonDisabled
                                      : ""
                                  }`}
                                >
                                  {icons.refreshCw && (
                                    <icons.refreshCw
                                      className={cn(
                                        "w-5 h-5",
                                        isLoading
                                          ? "text-muted-foreground/50"
                                          : "text-foreground",
                                        isRotating && "animate-spin",
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                              <DomainCombobox
                                options={subdomainOptions}
                                loading={isLoading}
                                value={link.custom_domain_subdomain}
                                onValueChange={(newValue) => {
                                  const selectedOption = subdomainOptions.find(
                                    (opt) => opt.value === newValue,
                                  );
                                  handleSubdomainChange(
                                    link.id,
                                    { target: { value: newValue } },
                                    selectedOption || newValue,
                                  );
                                }}
                                placeholder="form.example.com"
                                data-testid="custom-domain-subdomain-select"
                              />
                            </div>

                            <div className={classes.separator}>/</div>

                            <div
                              className={`${classes.inputSection} ${classes.inputColumn}`}
                            >
                              <div className={classes.inputLabelRow}>
                                <div className={classes.inputLabelGroup}>
                                  <Label className="text-sm text-foreground">
                                    Path
                                    <span className="text-destructive ml-1">
                                      *
                                    </span>
                                  </Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="cursor-help"
                                        >
                                          {icons.info && (
                                            <icons.info className="w-5 h-5 text-muted-foreground" />
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">
                                          Additional path (e.g: /contact-form,
                                          /survey)
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <Input
                                type="text"
                                value={getDisplayPath(link.custom_domain_path)}
                                onChange={(event) =>
                                  handlePathChange(link.id, event)
                                }
                                onBlur={() => handlePathBlur(link.id)}
                                placeholder="Enter path"
                                data-testid="custom-domain-path-input"
                                maxLength={15}
                                className={cn(
                                  pathError &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />
                              {pathError && (
                                <p className="text-xs text-destructive mt-1">
                                  {pathError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isDuplicate && (
                      <Alert
                        variant="destructive"
                        data-testid="duplicate-warning-info"
                        className="mt-3 flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0"
                      >
                        {icons.alertCircle && (
                          <icons.alertCircle
                            className="h-5 w-5 shrink-0 mt-0.5"
                            data-testid="duplicate-warning-info-icon"
                          />
                        )}
                        <AlertDescription
                          data-testid="duplicate-warning-info-text"
                          className="text-sm flex-1"
                        >
                          This custom link is already in use. Please choose a
                          different path.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedDomainOption &&
                      isDomainInWarningState(selectedDomainOption) && (
                        <Alert
                          className="mt-3 bg-amber-50 border-amber-200 flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0"
                          data-testid="domain-warning-info"
                        >
                          {icons.alertTriangle && (
                            <icons.alertTriangle
                              className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                              data-testid="domain-warning-info-icon"
                            />
                          )}
                          <AlertDescription
                            data-testid="domain-warning-info-text"
                            className="text-sm text-amber-800 flex-1"
                          >
                            {getWarningMessage(selectedDomainOption)}
                          </AlertDescription>
                        </Alert>
                      )}

                    <Card className="p-4 bg-muted/30 border-border">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <Label className="text-xs text-muted-foreground">
                            Preview link
                          </Label>
                          <p
                            className={cn(
                              "text-sm font-medium break-all",
                              displayUrl
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {displayUrl ||
                              "Select a domain and path to generate link"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!displayUrl}
                          onClick={() => handleCopyLink(link.id, previewUrl)}
                          className="gap-1.5 shrink-0"
                        >
                          {copiedLinkId === link.id
                            ? icons.check && <icons.check className="w-4 h-4" />
                            : icons.copy && <icons.copy className="w-4 h-4" />}
                          {copiedLinkId === link.id ? "Copied" : "Copy URL"}
                        </Button>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomDomain;
