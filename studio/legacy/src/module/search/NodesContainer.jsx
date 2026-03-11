// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import Button from "oute-ds-button";
import { ODSLabel as Label, ODSIcon as Icon, ODSButton as Button } from "../ods";
import isEmpty from "lodash/isEmpty";
import snakeCase from "lodash/snakeCase";
import styles from "./styles.module.css";
import { useCallback, useEffect, useState } from "react";
import RenderNodes from "./component/RenderNodes";

const NodesContainer = ({
  nodes = [],
  plan = "basic",
  disabledNodes = [],
  onClick = () => {},
  recentNodes = [],
  showSectionHeaders = true,
  sectionRefs,
  focusedSection,
  searchText = "",
  focusedNodeIndex = -1,
  viewMode = "grid",
}) => {
  const [renderNodes, setRenderNodes] = useState(nodes);
  const [eventNodes, setEventNodes] = useState([]);
  const [showBackButton, setShowBackButton] = useState(false);

  const onEventClick = (events) => {
    setEventNodes([events]);
    setRenderNodes([]);
    setShowBackButton(true);
  };

  const onBackClick = useCallback(() => {
    setShowBackButton(false);
    setEventNodes([]);
    setRenderNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    setRenderNodes(nodes);
    setEventNodes([]);
    setShowBackButton(false);
  }, [nodes]);

  let runningIndex = 0;

  return (
    <div className={styles.nodesContainer} data-testid="node-items-container">
      {showBackButton && (
        <Button
          label="Back"
          startIcon={<Icon outeIconName="OUTEChevronLeftIcon" />}
          onClick={onBackClick}
          variant="black-text"
          sx={{ alignSelf: "flex-start", padding: "0 1rem 0 0" }}
        />
      )}

      {recentNodes &&
        recentNodes.length > 0 &&
        !searchText &&
        (() => {
          const isFocused = focusedSection === "section_recent";
          const startIndex = runningIndex;
          runningIndex += recentNodes.length;
          return (
            <div
              key="section_recent"
              className={`${styles.section} ${isFocused ? styles.sectionFocused : ""}`}
              id="section_recent"
              ref={(el) => {
                if (sectionRefs && el) {
                  sectionRefs.current["section_recent"] = el;
                }
              }}
            >
              {showSectionHeaders && (
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>🕐</span>
                  <h3 className={styles.sectionTitle}>Your Recent Nodes</h3>
                  <span className={styles.sectionBadge}>{recentNodes.length}</span>
                </div>
              )}

              <RenderNodes
                components={recentNodes}
                categoryLabel="Recent"
                options={{
                  gridClassName: `${styles.nodeGrid} ${viewMode === 'list' ? styles.listMode : ''} ${viewMode === 'compact' ? styles.compactMode : ''}`,
                  gridTestId: "recent-nodes-grid",
                  testIdPrefix: "recent-node",
                  keyPrefix: "recent",
                }}
                onEventClick={onEventClick}
                onClick={onClick}
                disabledNodes={disabledNodes}
                plan={plan}
                searchText={searchText}
                focusedNodeIndex={focusedNodeIndex}
                startIndex={startIndex}
                viewMode={viewMode}
              />
            </div>
          );
        })()}

      {renderNodes?.map((node, index) => {
        const nodeTestId = snakeCase(node?.label);
        const sectionId = `section_${nodeTestId}`;

        const isFocused = focusedSection === sectionId;

        if (isEmpty(node.components)) return null;

        const startIndex = runningIndex;
        runningIndex += node.components.length;

        return (
          <div
            key={`node-${node.label}-${index}`}
            id={sectionId}
            className={`${styles.section} ${isFocused ? styles.sectionFocused : ""}`}
            data-testid={`node-${nodeTestId}-container`}
            ref={(el) => {
              if (sectionRefs && el) {
                sectionRefs.current[sectionId] = el;
              }
            }}
          >
            {showSectionHeaders && (
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{node.label}</h3>
                <span className={styles.sectionBadge}>{node.components.length}</span>
              </div>
            )}

            <RenderNodes
              components={node.components}
              categoryLabel={node.label}
              options={{
                gridClassName: `${styles.nodeGrid} ${viewMode === 'list' ? styles.listMode : ''} ${viewMode === 'compact' ? styles.compactMode : ''}`,
              }}
              onEventClick={onEventClick}
              onClick={onClick}
              disabledNodes={disabledNodes}
              plan={plan}
              searchText={searchText}
              focusedNodeIndex={focusedNodeIndex}
              startIndex={startIndex}
              viewMode={viewMode}
            />
          </div>
        );
      })}

      {eventNodes?.map((event, index) => {
        return event.components?.map((component, idx) => {
          if (component?.annotation !== "ACTION") return null;
          return (
            <div
              key={`event-${index}-${idx}`}
              className={styles.eventNodesItem}
              onClick={() => onClick(component)}
              data-testid={`node-${idx}`}
            >
              <Icon
                imageProps={{
                  src: component._src,
                  style: { width: "2rem", height: "2rem" },
                  "data-testid": `node-${idx}-icon`,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
                data-testid={`node-${idx}-content`}
              >
                <Label variant="subtitle1" data-testid={`node-${idx}-title`}>
                  {component.name}
                </Label>

                <Label
                  variant="subtitle2"
                  color="#607D8B"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "8rem",
                    overflow: "hidden auto",
                  }}
                  data-testid={`node-${idx}-description`}
                >
                  {component.description}
                </Label>
              </div>
            </div>
          );
        });
      })}
    </div>
  );
};
export default NodesContainer;
