// import ODSLabel from "oute-ds-label";
// import ODSTextField from "oute-ds-text-field";
// import ODSAutocomplete from "oute-ds-autocomplete";
// import ODSIcon from "oute-ds-icon";
// import ODSButton from "oute-ds-button";
// import ODSTooltip from "oute-ds-tooltip";
import { ODSLabel, ODSTextField, ODSAutocomplete, ODSIcon, ODSButton, ODSTooltip } from "@src/module/ods";
import classes from "./index.module.css";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import UnpublishedAssetWarning from "./components/UnpublishedAssetWarning";
import PremiumUserWarning from "./components/PremiumUserWarning";
import useCustomDomainHandler from "./hooks/useCustomDomainHandler";
import { constructFullUrl, getDisplayPath } from "./utils/customDomainHelpers";

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
    <div className={classes.customDomainContainer}>
      <div className={classes.sectionHeader}>
        <div className={classes.sectionHeaderText}>
          <ODSLabel variant="h5" sx={{ fontFamily: "Inter" }}>
            Custom URL
          </ODSLabel>
          <ODSLabel variant="body1" color="#607D8B">
            Change the path of the link and create custom link.
          </ODSLabel>
        </div>
        <ODSButton
          variant="black-outlined"
          onClick={handleAddLink}
          data-testid="custom-domain-add-link"
          startIcon={
            <ODSIcon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                sx: {
                  color: "#212121",
                  width: "1.25rem",
                  height: "1.25rem",
                },
              }}
            />
          }
          label="ADD LINK"
        />
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
                  <div className={classes.cardHeaderText}>
                    <div className={classes.addNewDomainOptionLabel}>
                      <ODSLabel
                        variant="h6"
                        sx={{ fontFamily: "Inter", fontWeight: 500 }}
                      >
                        {`Custom URL ${index + 1}`}
                      </ODSLabel>
                      {isDuplicate && (
                        <div className={classes.duplicateBadge}>
                          <ODSLabel
                            variant="body2"
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              color: "#FB8C00",
                            }}
                          >
                            Duplicate detected
                          </ODSLabel>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={classes.cardHeaderActions}>
                    {isLinkConfigured && (
                      <>
                        <div className={classes.actionButtonGroup}>
                          <ODSButton
                            variant="black-outlined"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSaveChanges(link.id);
                            }}
                            disabled={isDuplicate || isSaving || linkIsSaved}
                            startIcon={
                              <ODSIcon
                                outeIconName="CheckIcon"
                                outeIconProps={{
                                  sx: {
                                    color:
                                      isDuplicate || isSaving || linkIsSaved
                                        ? "#607D8B"
                                        : "#263238",
                                    width: "1rem",
                                    height: "1rem",
                                  },
                                }}
                              />
                            }
                            sx={{
                              fontSize: "0.875rem",
                              padding: "0.375rem 0.75rem",
                              minWidth: "auto",
                              color:
                                isDuplicate || isSaving || linkIsSaved
                                  ? "#607D8B !important"
                                  : "#263238 !important",
                            }}
                            label={
                              isSaving
                                ? "SAVING..."
                                : linkIsSaved
                                  ? "SAVED"
                                  : "SAVE"
                            }
                          />
                          {hasChanges && (
                            <ODSButton
                              variant="black-text"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRevertChanges(link.id);
                              }}
                              data-testid="custom-domain-revert-button"
                              startIcon={
                                <ODSIcon
                                  outeIconName="OUTERestoreIcon"
                                  outeIconProps={{
                                    sx: {
                                      width: "1rem",
                                      height: "1rem",
                                      color: "#212121",
                                    },
                                  }}
                                />
                              }
                              sx={{
                                fontSize: "0.875rem",
                                padding: "0.375rem 0.75rem",
                                minWidth: "auto",
                                color: "#212121 !important",
                              }}
                              label="REVERT"
                            />
                          )}
                        </div>
                        <div className={classes.actionDivider} />
                      </>
                    )}
                    <ODSIcon
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveLink(link.id);
                      }}
                      outeIconName="OUTETrashIcon"
                      outeIconProps={{
                        sx: {
                          width: "1.75rem",
                          height: "1.75rem",
                          color: "#607D8B",
                        },
                      }}
                      buttonProps={{
                        sx: {
                          padding: "0.25rem 0.25rem",
                          "&:hover": {
                            backgroundColor: "#f0eaea",
                            borderRadius: "0.375rem",
                          },
                        },
                        "aria-label": `Remove custom URL ${index + 1}`,
                      }}
                    />

                    <ODSIcon
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleCard(link.id);
                      }}
                      outeIconName={
                        isCardCollapsed
                          ? "OUTEExpandMoreIcon"
                          : "OUTEExpandLessIcon"
                      }
                      outeIconProps={{
                        sx: {
                          width: "1.75rem",
                          height: "1.75rem",
                          color: "#000",
                        },
                      }}
                      buttonProps={{
                        "aria-label": `Toggle custom URL ${index + 1}`,
                      }}
                    />
                  </div>
                </div>

                {!isCardCollapsed && (
                  <>
                    <div className={classes.cardDivider} />
                    <div className={classes.cardContent}>
                      <div className={classes.domainBuilderContainer}>
                        <div className={classes.domainInputGrid}>
                          <div className={classes.domainInputRow}>
                            <div
                              className={`${classes.inputSection} ${classes.inputColumn}`}
                            >
                              <div className={classes.inputLabelRow}>
                                <div className={classes.inputLabelGroup}>
                                  <ODSLabel variant="body1">
                                    Select Custom Domain
                                    <span className={classes.requiredIndicator}>
                                      *
                                    </span>
                                  </ODSLabel>
                                  <ODSTooltip
                                    title="Select a domain configured at your organization level"
                                    placement="top"
                                  >
                                    <ODSIcon
                                      outeIconName="OUTEInfoIcon"
                                      outeIconProps={{
                                        sx: {
                                          marginTop: "0.125rem",
                                          width: "1.25rem",
                                          height: "1.25rem",
                                          color: "#607D8B",
                                        },
                                        className: classes.infoIcon,
                                      }}
                                    />
                                  </ODSTooltip>
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
                                  <ODSIcon
                                    outeIconName="OUTESyncIcon"
                                    outeIconProps={{
                                      sx: {
                                        width: "1.25rem",
                                        height: "1.25rem",
                                        color: isLoading
                                          ? "#B0BEC5"
                                          : "#263238",
                                        transform: isRotating
                                          ? "rotate(-360deg)"
                                          : "rotate(0deg)",
                                        transition: isRotating
                                          ? "transform 1s ease-in-out"
                                          : "none",
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <ODSAutocomplete
                                className="black"
                                options={subdomainOptions}
                                loading={isLoading}
                                value={
                                  subdomainOptions.find(
                                    (opt) =>
                                      opt.value ===
                                      link.custom_domain_subdomain,
                                  ) || null
                                }
                                onChange={(event, newValue) =>
                                  handleSubdomainChange(
                                    link.id,
                                    event,
                                    newValue,
                                  )
                                }
                                getOptionLabel={(option) =>
                                  typeof option === "object"
                                    ? option.label
                                    : option
                                }
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                                renderInput={(params) => (
                                  <ODSTextField
                                    {...params}
                                    className="black"
                                    placeholder="form.example.com"
                                    inputProps={{
                                      ...params.inputProps,
                                      "data-testid":
                                        "custom-domain-subdomain-select-input",
                                    }}
                                  />
                                )}
                                renderOption={(props, option) => {
                                  const { key, ...rest } = props;
                                  const isAddNewOption =
                                    option.value === "ADD_NEW_DOMAIN";
                                  return (
                                    <li
                                      key={key}
                                      {...rest}
                                      className={
                                        isAddNewOption
                                          ? classes.addNewDomainOption
                                          : classes.domainOption
                                      }
                                      data-testid={
                                        isAddNewOption
                                          ? "add-new-subdomain-option"
                                          : "subdomain-option"
                                      }
                                    >
                                      {isAddNewOption ? (
                                        <span
                                          className={
                                            classes.addNewDomainOptionLabel
                                          }
                                        >
                                          {option.label}
                                        </span>
                                      ) : (
                                        <div
                                          className={
                                            classes.domainOptionContent
                                          }
                                        >
                                          <span
                                            className={
                                              classes.domainOptionTitle
                                            }
                                          >
                                            {option.label}
                                          </span>
                                        </div>
                                      )}
                                    </li>
                                  );
                                }}
                                sx={{
                                  width: "100%",
                                }}
                                data-testid="custom-domain-subdomain-select"
                              />
                            </div>

                            <div className={classes.separator}>/</div>

                            <div
                              className={`${classes.inputSection} ${classes.inputColumn}`}
                            >
                              <div className={classes.inputLabelRow}>
                                <div className={classes.inputLabelGroup}>
                                  <ODSLabel variant="body1">
                                    Path
                                    <span className={classes.requiredIndicator}>
                                      *
                                    </span>
                                  </ODSLabel>
                                  <ODSTooltip
                                    title="Additional path (e.g: /contact-form, /survey)"
                                    placement="top"
                                  >
                                    <ODSIcon
                                      outeIconName="OUTEInfoIcon"
                                      outeIconProps={{
                                        sx: {
                                          width: "1.25rem",
                                          height: "1.25rem",
                                          color: "#607D8B",
                                        },
                                        className: classes.infoIcon,
                                      }}
                                    />
                                  </ODSTooltip>
                                </div>
                              </div>
                              <ODSTextField
                                type="text"
                                className="black"
                                value={getDisplayPath(link.custom_domain_path)}
                                onChange={(event) =>
                                  handlePathChange(link.id, event)
                                }
                                onBlur={() => handlePathBlur(link.id)}
                                placeholder="Enter path"
                                inputProps={{
                                  "data-testid": "custom-domain-path-input",
                                  maxLength: 15,
                                }}
                                error={!!pathError}
                              />
                            </div>
                          </div>
                        </div>
                        {pathError && (
                          <div className={classes.pathErrorContainer}>
                            <ODSLabel
                              variant="body2"
                              sx={{
                                color: "#ef4444",
                                fontFamily: "Inter",
                                fontSize: "0.75rem",
                              }}
                            >
                              {pathError}
                            </ODSLabel>
                          </div>
                        )}
                      </div>
                    </div>

                    {isDuplicate && (
                      <div
                        className={classes.duplicateWarningInfo}
                        data-testid="duplicate-warning-info"
                      >
                        <ODSIcon
                          outeIconName="OUTEInfoIcon"
                          outeIconProps={{
                            sx: {
                              color: "#FF5252",
                              height: "1.5rem",
                              width: "1.5rem",
                            },
                            "data-testid": "duplicate-warning-info-icon",
                          }}
                        />
                        <ODSLabel
                          variant="body1"
                          data-testid="duplicate-warning-info-text"
                          sx={{ color: "#FF5252" }}
                        >
                          This custom link is already in use.
                        </ODSLabel>
                      </div>
                    )}

                    {selectedDomainOption &&
                      isDomainInWarningState(selectedDomainOption) && (
                        <div
                          className={classes.domainWarningInfo}
                          data-testid="domain-warning-info"
                        >
                          <ODSIcon
                            outeIconName="OUTEInfoIcon"
                            outeIconProps={{
                              sx: {
                                color: "#FB8C00",
                                height: "1.5rem",
                                width: "1.5rem",
                              },
                              "data-testid": "domain-warning-info-icon",
                            }}
                          />
                          <ODSLabel
                            variant="body1"
                            data-testid="domain-warning-info-text"
                          >
                            {getWarningMessage(selectedDomainOption)}
                          </ODSLabel>
                        </div>
                      )}

                    <div className={classes.previewSection}>
                      <div className={classes.previewLinkBox}>
                        <div className={classes.previewLinkContent}>
                          <ODSLabel
                            color="#607D8B"
                            variant="body2"
                            sx={{ fontFamily: "Inter" }}
                          >
                            Preview link
                          </ODSLabel>
                          <ODSLabel
                            color={displayUrl ? "#212121" : "#607D8B"}
                            variant="body2"
                            sx={{ fontFamily: "Inter" }}
                          >
                            {displayUrl ||
                              "Select a domain and path to generate link"}
                          </ODSLabel>
                        </div>
                        <div className={classes.previewActions}>
                          <ODSButton
                            variant="black-outlined"
                            label={
                              copiedLinkId === link.id ? "Copied" : "Copy URL"
                            }
                            disabled={!displayUrl}
                            onClick={() => handleCopyLink(link.id, previewUrl)}
                            startIcon={
                              <ODSIcon
                                outeIconName={
                                  copiedLinkId === link.id
                                    ? "CheckIcon"
                                    : "OUTECopyContentIcon"
                                }
                                outeIconProps={{
                                  sx: {
                                    width: "1rem",
                                    height: "1rem",
                                    color: "212121",
                                  },
                                }}
                              />
                            }
                          />
                        </div>
                      </div>
                    </div>
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
