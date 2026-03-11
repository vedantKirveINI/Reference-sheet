import { useRef, useState, useCallback, useEffect } from "react";
// import ButtonGroup from "oute-ds-button-group";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
// import Popover from "oute-ds-popover";
// import { serverConfig } from "oute-ds-utils";
import { ODSButtonGroup as ButtonGroup, ODSButton as Button, ODSIcon as Icon, ODSPopover as Popover, serverConfig } from "@src/module/ods";
import styles from "./index.module.css";
import { REDIRECT_PATHS } from "../../pages/ic-canvas/constants/constants";
import TooltipWrapper from "../tooltip-wrapper";
import { getSheetURL } from "../dialogs/publish/forms/utils";

const FormResponseCTA = ({
  assetId = "",
  assetDetails = {},
  disabled = false,
}) => {
  // State hooks first
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("RESPONSES");
  const [popoverWidth, setPopoverWidth] = useState(0);

  // Ref hooks next
  const chevronButtonRef = useRef();
  const containerRef = useRef();

  // Effect hooks
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Get the width of the container div that wraps the ButtonGroup
      const width = containerRef.current.offsetWidth;
      setPopoverWidth(width);
    }
  }, [isOpen]);

  // Memoized functions with useCallback
  const togglePopper = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const onViewResponses = useCallback(() => {
    const targetUrl = getSheetURL({ assetDetails });
    window.open(targetUrl, "_blank");
  }, [assetDetails]);

  const onAnalytics = useCallback(() => {
    const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.ANALYTICS}&i=${assetDetails?.asset_id}`;
    window.open(targetUrl, "_blank");
  }, [assetDetails?.asset_id]);

  const handleMainButtonClick = useCallback(() => {
    if (disabled) return;

    if (selectedOption === "RESPONSES") {
      onViewResponses();
    } else if (selectedOption === "ANALYTICS") {
      onAnalytics();
    }
  }, [disabled, selectedOption, onViewResponses, onAnalytics]);

  const handleViewResponses = useCallback(() => {
    setIsOpen(false);
    setSelectedOption("RESPONSES");
    onViewResponses();
  }, [onViewResponses]);

  const handleAnalytics = useCallback(() => {
    setIsOpen(false);
    setSelectedOption("ANALYTICS");
    onAnalytics();
  }, [onAnalytics]);

  const handleEscapeKey = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        if (chevronButtonRef.current) {
          chevronButtonRef.current.focus();
        }
      }
    },
    [isOpen],
  );

  const handlePopoverClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Compute button classes
  const mainButtonClasses = `${styles.mainButton} ${disabled ? styles.disabled : ""}`;
  const toggleButtonClasses = `${styles.toggleButton} ${
    isOpen && styles.toggleButtonOpen
  } ${disabled ? styles.disabled : ""}`;
  const responsesButtonClasses = `${styles.dropdownButton} ${
    styles.dropdownButtonHover
  } ${selectedOption === "RESPONSES" ? styles.dropdownButtonSelected : ""}`;
  const analyticsButtonClasses = `${styles.dropdownButton} ${
    styles.dropdownButtonHover
  } ${selectedOption === "ANALYTICS" ? styles.dropdownButtonSelected : ""}`;

  return (
    <>
      <div
        ref={containerRef}
        className={styles.container}
        data-testid="form-responses-cta-container"
      >
        <ButtonGroup>
          <Button
            label={selectedOption}
            variant="black-outlined"
            size="large"
            disabled={disabled}
            onClick={handleMainButtonClick}
            className={mainButtonClasses}
            data-testid="form-responses-cta-main-button"
          />
          <TooltipWrapper
            component={Button}
            title="More options"
            ref={chevronButtonRef}
            variant="black-outlined"
            size="large"
            disabled={disabled}
            disableRipple
            onKeyDown={handleEscapeKey}
            className={toggleButtonClasses}
            data-testid="form-responses-cta-toggle-button"
            startIcon={
              <Icon
                outeIconName="OUTEChevronRightIcon"
                outeIconProps={{
                  className: isOpen ? styles.iconDark : styles.iconLight,
                }}
              />
            }
            onClick={togglePopper}
          />
        </ButtonGroup>
      </div>
      <Popover
        open={isOpen}
        anchorEl={chevronButtonRef.current}
        onClose={handlePopoverClose}
        onKeyDown={handleEscapeKey}
        className={styles.popover}
        data-testid="form-responses-cta-popover"
        sx={{
          "& .MuiPaper-root": {
            width: popoverWidth ? `${popoverWidth}px` : "auto",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div
          className={styles.dropdownContainer}
          data-testid="form-responses-cta-dropdown-container"
        >
          <Button
            onClick={handleViewResponses}
            variant="black-text"
            fullWidth
            size="large"
            className={responsesButtonClasses}
            data-testid="form-responses-cta-responses-button"
          >
            Responses
          </Button>
          <Button
            onClick={handleAnalytics}
            variant="black-text"
            fullWidth
            size="large"
            className={analyticsButtonClasses}
            data-testid="form-responses-cta-analytics-button"
          >
            Analytics
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default FormResponseCTA;
