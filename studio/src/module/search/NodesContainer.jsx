import { ODSLabel as Label, ODSIcon as Icon, ODSButton as Button } from "../ods";
import isEmpty from "lodash/isEmpty";
import snakeCase from "lodash/snakeCase";
import styles from "./styles.module.css";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import RenderNodes from "./component/RenderNodes";

const VIRTUALIZATION_THRESHOLD = 50;
const SECTION_HEADER_HEIGHT = 40;
const SECTION_GAP = 24;
const NODE_HEIGHTS = {
  grid: 60,
  list: 56,
  compact: 48,
};
const COLUMNS_BY_MODE = {
  grid: 3,
  list: 1,
  compact: 4,
};
const GRID_GAP = 10;

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
  const listRef = useRef(null);

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

  const { sections, totalNodes } = useMemo(() => {
    const sectionsList = [];
    let total = 0;
    let currentIndex = 0;

    if (recentNodes && recentNodes.length > 0 && !searchText) {
      sectionsList.push({
        id: "section_recent",
        label: "Your Recent Nodes",
        icon: "🕐",
        components: recentNodes,
        startIndex: currentIndex,
        isRecent: true,
      });
      currentIndex += recentNodes.length;
      total += recentNodes.length;
    }

    renderNodes?.forEach((node, index) => {
      if (!isEmpty(node.components)) {
        const sectionId = `section_${snakeCase(node?.label)}`;
        sectionsList.push({
          id: sectionId,
          label: node.label,
          components: node.components,
          startIndex: currentIndex,
          originalIndex: index,
        });
        currentIndex += node.components.length;
        total += node.components.length;
      }
    });

    return { sections: sectionsList, totalNodes: total };
  }, [renderNodes, recentNodes, searchText]);

  const shouldVirtualize = totalNodes >= VIRTUALIZATION_THRESHOLD;

  const getItemSize = useCallback((index) => {
    const section = sections[index];
    if (!section) return 0;

    const nodeCount = section.components?.length || 0;
    const columns = COLUMNS_BY_MODE[viewMode] || 3;
    const nodeHeight = NODE_HEIGHTS[viewMode] || 60;
    const rows = Math.ceil(nodeCount / columns);
    
    const headerHeight = showSectionHeaders ? SECTION_HEADER_HEIGHT : 0;
    const gridHeight = rows * nodeHeight + (rows > 1 ? (rows - 1) * GRID_GAP : 0);
    
    return headerHeight + gridHeight + SECTION_GAP;
  }, [sections, viewMode, showSectionHeaders]);

  useEffect(() => {
    if (!shouldVirtualize || !listRef.current || focusedNodeIndex < 0) return;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionEnd = section.startIndex + section.components.length;
      if (focusedNodeIndex >= section.startIndex && focusedNodeIndex < sectionEnd) {
        listRef.current.scrollToRow({ index: i, align: "smart" });
        break;
      }
    }
  }, [focusedNodeIndex, sections, shouldVirtualize]);

  const SectionRowComponent = useCallback(({ index, style }) => {
    const section = sections[index];
    if (!section) return null;

    const isFocused = focusedSection === section.id;
    const nodeTestId = section.isRecent ? "recent" : snakeCase(section?.label);

    return (
      <div
        style={style}
        key={section.id}
        id={section.id}
        className={`${styles.section} ${isFocused ? styles.sectionFocused : ""}`}
        data-testid={section.isRecent ? undefined : `node-${nodeTestId}-container`}
        ref={(el) => {
          if (sectionRefs && el) {
            sectionRefs.current[section.id] = el;
          }
        }}
      >
        {showSectionHeaders && (
          <div className={styles.sectionHeader}>
            {section.icon && <span className={styles.sectionIcon}>{section.icon}</span>}
            <h3 className={styles.sectionTitle}>{section.label}</h3>
            <span className={styles.sectionBadge}>{section.components.length}</span>
          </div>
        )}

        <RenderNodes
          components={section.components}
          categoryLabel={section.isRecent ? "Recent" : section.label}
          options={{
            gridClassName: `${styles.nodeGrid} ${viewMode === 'list' ? styles.listMode : ''} ${viewMode === 'compact' ? styles.compactMode : ''}`,
            gridTestId: section.isRecent ? "recent-nodes-grid" : undefined,
            testIdPrefix: section.isRecent ? "recent-node" : `node-${section.label?.toLowerCase() || "default"}`,
            keyPrefix: section.isRecent ? "recent" : "component",
          }}
          onEventClick={onEventClick}
          onClick={onClick}
          disabledNodes={disabledNodes}
          plan={plan}
          searchText={searchText}
          focusedNodeIndex={focusedNodeIndex}
          startIndex={section.startIndex}
          viewMode={viewMode}
        />
      </div>
    );
  }, [sections, focusedSection, sectionRefs, showSectionHeaders, viewMode, onClick, disabledNodes, plan, searchText, focusedNodeIndex]);

  const VirtualizedListChild = useCallback(({ height, width }) => {
    if (!height || !width) return null;
    
    return (
      <List
        listRef={listRef}
        rowCount={sections.length}
        rowHeight={getItemSize}
        rowComponent={SectionRowComponent}
        defaultHeight={height}
        overscanCount={2}
        style={{ width, height, overflow: "auto" }}
      />
    );
  }, [sections.length, getItemSize, SectionRowComponent]);

  const NonVirtualizedContent = () => {
    let runningIndex = 0;

    return (
      <>
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
      </>
    );
  };

  return (
    <div className={styles.nodesContainer} data-testid="node-items-container">
      {showBackButton && (
        <Button
          label="Back"
          startIcon={<Icon outeIconName="OUTEChevronLeftIcon" />}
          onClick={onBackClick}
          variant="black-text"
          style={{ alignSelf: "flex-start", padding: "0 1rem 0 0" }}
        />
      )}

      {shouldVirtualize && !showBackButton ? (
        <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
          <AutoSizer ChildComponent={VirtualizedListChild} />
        </div>
      ) : (
        <NonVirtualizedContent />
      )}

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
                  style={{
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
