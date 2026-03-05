import { useState, useRef, useLayoutEffect } from "react";
import classes from "./apps-workflows.module.css";
// import { ODSLabel } from "@src/module/ods";
// import { ODSButton } from "@src/module/ods";
// import { ODSIcon } from "@src/module/ods";
import { ODSLabel, ODSButton, ODSIcon } from "@src/module/ods";
import AppIconWithLabel from "./app-icon-label";
const AppsWorkflows = ({ apps = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [firstAppHasOverflow, setFirstAppHasOverflow] = useState(false);
  const firstAppLabelRef = useRef(null);
  const visibleCount = 3;

  const visibleApps = expanded ? apps : apps.slice(0, visibleCount);
  const hiddenCount = apps.length - visibleCount;
  const shouldShowCount = !expanded && hiddenCount > 0;
  const shouldShowViewAll = firstAppHasOverflow && !expanded && apps.length > 0;

  useLayoutEffect(() => {
    const checkEllipsis = () => {
      if (firstAppLabelRef.current) {
        const element = firstAppLabelRef.current;
        const isEllipsis =
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight;
        setFirstAppHasOverflow(isEllipsis);
      }
    };

    checkEllipsis();

    window.addEventListener("resize", checkEllipsis);

    return () => {
      window.removeEventListener("resize", checkEllipsis);
    };
  }, [apps, visibleApps]);

  const handleExpandToggle = () => {
    setExpanded(false);
  };

  const handleCountClick = () => {
    setExpanded(true);
  };

  return (
    <div className={classes["apps-section"]} data-testid="apps-section">
      <div className={classes["apps-header"]}>
        <div className={classes["header-label"]}>
          <ODSLabel
            variant="h6"
            style={{
              fontWeight: 700,
              color: "#263238",
              fontSize: "1.125rem",
              lineHeight: "1.5rem",
              marginBottom: 0,
            }}
            data-testid="apps-section-title"
          >
            Apps used in workflow
          </ODSLabel>
          <ODSLabel
            variant="body2"
            style={{
              fontWeight: 400,
              color: "#607D8B",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
            }}
            data-testid="apps-section-description"
          >
            All the apps used in the workflow will be visible here
          </ODSLabel>
        </div>
        {(expanded || shouldShowViewAll) && (
          <ODSButton
            variant="black-text"
            label={expanded ? "VIEW LESS" : "VIEW ALL"}
            size="medium"
            onClick={expanded ? handleExpandToggle : () => setExpanded(true)}
            data-testid="view-all-apps-button"
            endIcon={
              <ODSIcon
                outeIconName={
                  expanded ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"
                }
                outeIconProps={{
                  sx: {
                    color: "#212121",
                  },
                }}
              />
            }
          />
        )}
      </div>
      <div
        className={`${classes["apps-list"]} ${expanded ? classes["apps-list-expanded"] : ""}`}
        data-testid="apps-list"
      >
        {visibleApps.map((app, index) => (
          <AppIconWithLabel
            key={app?.key}
            index={index}
            ref={index === 0 ? firstAppLabelRef : null}
            icon={app?._src}
            name={app?.name}
            title={app?.description}
            backgroundColor={app?.background}
            expanded={false}
          />
        ))}
        {shouldShowCount && (
          <div
            className={classes["count-indicator"]}
            onClick={handleCountClick}
            data-testid="apps-count-indicator"
          >
            <ODSLabel
              variant="body1"
              style={{
                color: "#000000",
                lineHeight: "1.75rem",
                fontWeight: 500,
              }}
            >
              +{hiddenCount}
            </ODSLabel>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppsWorkflows;
