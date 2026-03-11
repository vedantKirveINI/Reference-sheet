import { useMemo } from "react";
import classes from "./index.module.css";
import AppsWorkflows from "../../components/apps-workflows";
// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";
import {
  extractTriggerNodes,
  getNodeSummary,
} from "../../utils/trigger-utils";
import TriggerContent from "./components/trigger-content";

const OverviewTab = ({ nodes = [], assetDetails = {} }) => {
  const triggerNodes = useMemo(() => extractTriggerNodes(nodes), [nodes]);
  const integrationApps = useMemo(
    () => nodes?.filter((node) => node?.type === "Integration") || [],
    [nodes],
  );
  
  const nodeSummary = useMemo(() => getNodeSummary(nodes), [nodes]);
  const isPublished = !!assetDetails?.asset?.published_info;

  return (
    <div className={classes.tabContent} data-testid="workflow-overview-tab">
      <div className={classes.overviewContainer}>
        {/* Trigger Section */}
        <div className={classes.section}>
          <div className={classes.sectionHeader}>
            <ODSLabel
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#263238",
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                marginBottom: 0,
              }}
              data-testid="trigger-section-title"
            >
              Trigger
            </ODSLabel>
            <ODSLabel
              variant="body2"
              sx={{
                fontWeight: 400,
                color: "#607D8B",
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
              }}
              data-testid="trigger-section-description"
            >
              How this workflow is triggered
            </ODSLabel>
          </div>
          <div className={classes.sectionContent}>
            <TriggerContent
              triggerNodes={triggerNodes}
              assetDetails={assetDetails}
              isPublished={isPublished}
            />
          </div>
        </div>

        {/* Apps Section - AppsWorkflows already has its own header */}
        {integrationApps.length > 0 && <AppsWorkflows apps={integrationApps} />}

        {/* Summary Section */}
        <div className={classes.section}>
          <div className={classes.sectionHeader}>
            <ODSLabel
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#263238",
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                marginBottom: "0.25rem",
              }}
              data-testid="summary-section-title"
            >
              Workflow Summary
            </ODSLabel>
            <ODSLabel
              variant="body2"
              sx={{
                fontWeight: 400,
                color: "#607D8B",
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
              }}
              data-testid="summary-section-description"
            >
              Overview of workflow components
            </ODSLabel>
          </div>

          <div className={classes.sectionContent}>
            <div className={classes.summaryGrid}>
              <div className={classes.summaryItem}>
                <ODSLabel
                  variant="body2"
                  sx={{ color: "#607D8B", fontWeight: 400 }}
                >
                  Total Nodes
                </ODSLabel>
                <ODSLabel
                  variant="h6"
                  sx={{ color: "#263238", fontWeight: 600 }}
                >
                  {nodeSummary.total}
                </ODSLabel>
              </div>
              {nodeSummary.http > 0 && (
                <div className={classes.summaryItem}>
                  <ODSLabel
                    variant="body2"
                    sx={{ color: "#607D8B", fontWeight: 400 }}
                  >
                    HTTP Nodes
                  </ODSLabel>
                  <ODSLabel
                    variant="h6"
                    sx={{ color: "#263238", fontWeight: 600 }}
                  >
                    {nodeSummary.http}
                  </ODSLabel>
                </div>
              )}
              {nodeSummary.integration > 0 && (
                <div className={classes.summaryItem}>
                  <ODSLabel
                    variant="body2"
                    sx={{ color: "#607D8B", fontWeight: 400 }}
                  >
                    Integration Nodes
                  </ODSLabel>
                  <ODSLabel
                    variant="h6"
                    sx={{ color: "#263238", fontWeight: 600 }}
                  >
                    {nodeSummary.integration}
                  </ODSLabel>
                </div>
              )}
              {nodeSummary.transformer > 0 && (
                <div className={classes.summaryItem}>
                  <ODSLabel
                    variant="body2"
                    sx={{ color: "#607D8B", fontWeight: 400 }}
                  >
                    Transformer Nodes
                  </ODSLabel>
                  <ODSLabel
                    variant="h6"
                    sx={{ color: "#263238", fontWeight: 600 }}
                  >
                    {nodeSummary.transformer}
                  </ODSLabel>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
