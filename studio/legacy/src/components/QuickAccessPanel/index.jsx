import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import styles from "./styles.module.css";
import QuickAccessPanelCategory from "./QuickAccessPanelCategory";
import {
  getRecentNodes,
  addRecentNode,
} from "../../../../../components/common/core/search/utils/recentNodes";

const QuickAccessPanel = ({ onNodeClick, searchConfig = [], canvasRef }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [recentNodes, setRecentNodes] = useState([]);
  const [maxHeight, setMaxHeight] = useState(null);
  const panelRef = useRef(null);

  // Load recent nodes on mount
  useEffect(() => {
    const recent = getRecentNodes();
    setRecentNodes(recent);
  }, []);

  // Extract commonly used nodes from searchConfig
  const commonNodes = useMemo(() => {
    const nodeMap = {
      Core: [],
      Tools: [],
      Logic: [],
      Data: [],
    };

    // Define node matching criteria based on actual node names and types
    const coreMatches = {
      names: ["Agent", "Response Node", "End"],
      types: ["AGENT_WORKFLOW", "SUCCESS_SETUP_TYPE", "END"],
    };

    const toolsMatches = {
      names: ["Tiny Search", "Guardrails", "MCP"],
      types: ["TINY_SEARCH", "GUARDRAILS", "MCP"],
    };

    const logicMatches = {
      names: ["If Else", "While", "Human in the loop"],
      types: ["IF_ELSE", "IF_ELSE_V2", "WHILE", "HITL"],
    };

    const dataMatches = {
      names: ["Transformer"],
      types: ["TRANSFORMER", "TRANSFORM"],
    };

    const isNodeMatch = (node, matches) => {
      const nodeName = node.name || "";
      const nodeType = node.type || "";

      return (
        matches.names.some((name) =>
          nodeName.toLowerCase().includes(name.toLowerCase()),
        ) ||
        matches.types.some((type) =>
          nodeType.toUpperCase().includes(type.toUpperCase()),
        )
      );
    };

    searchConfig.forEach((category) => {
      if (!category.components) return;

      category.components.forEach((node) => {
        // Check Core nodes
        if (isNodeMatch(node, coreMatches)) {
          if (
            !nodeMap.Core.find(
              (n) => n.type === node.type && n.name === node.name,
            )
          ) {
            nodeMap.Core.push(node);
          }
        }
        // Check Tools nodes
        else if (isNodeMatch(node, toolsMatches)) {
          if (
            !nodeMap.Tools.find(
              (n) => n.type === node.type && n.name === node.name,
            )
          ) {
            nodeMap.Tools.push(node);
          }
        }
        // Check Logic nodes
        else if (isNodeMatch(node, logicMatches)) {
          if (
            !nodeMap.Logic.find(
              (n) => n.type === node.type && n.name === node.name,
            )
          ) {
            nodeMap.Logic.push(node);
          }
        }
        // Check Data nodes
        else if (isNodeMatch(node, dataMatches)) {
          if (
            !nodeMap.Data.find(
              (n) => n.type === node.type && n.name === node.name,
            )
          ) {
            nodeMap.Data.push(node);
          }
        }
      });
    });

    return nodeMap;
  }, [searchConfig]);

  // Calculate available space to avoid overlaps
  useEffect(() => {
    const calculateMaxHeight = () => {
      if (!panelRef.current) return;

      const viewportHeight = window.innerHeight;

      // Header: top: 1rem, height: 4.5rem, plus 1.5rem spacing = 7rem from top
      const headerBottom = 1 + 4.5 + 1.5; // 7rem
      const headerBottomPx = headerBottom * 16; // Convert to pixels (assuming 1rem = 16px)

      // BottomCtaContainer: bottom: 1.5rem, height: 4.5rem, plus 1.5rem spacing = 7.5rem from bottom
      const bottomCtaTop = viewportHeight - (1.5 + 4.5 + 1.5) * 16;

      // TroubleShootCard: bottom: 1.5rem, left: 1.5rem, width: 20rem (~320px)
      // Check if we're in the left area where it might overlap
      const troubleShootCard = document.querySelector(
        '[data-testid="trouble-shoot-card"]',
      );
      let troubleShootCardTop = viewportHeight;

      if (troubleShootCard) {
        const rect = troubleShootCard.getBoundingClientRect();
        // If the card is visible and on the left side, account for it
        // QuickAccessPanel is at left: 1.5rem (~24px), width: 280px, so ends at ~304px
        if (rect.left < 400 && rect.top < viewportHeight) {
          troubleShootCardTop = rect.top - 1.5 * 16; // Add 1.5rem spacing
        }
      }

      // Calculate the minimum available space
      const availableHeight = Math.min(
        viewportHeight - headerBottomPx - 1.5 * 16, // Space from header
        bottomCtaTop - headerBottomPx - 1.5 * 16, // Space from bottom CTA
        troubleShootCardTop - headerBottomPx - 1.5 * 16, // Space from trouble shoot card
      );

      // Set a minimum height and maximum height
      const calculatedMaxHeight = Math.max(300, Math.min(availableHeight, 600));
      setMaxHeight(calculatedMaxHeight);
    };

    calculateMaxHeight();

    // Recalculate on resize
    window.addEventListener("resize", calculateMaxHeight);
    // Recalculate when trouble shoot card might appear/disappear
    const observer = new MutationObserver(calculateMaxHeight);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(calculateMaxHeight);
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", calculateMaxHeight);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    async (node) => {
      // Add to recent nodes
      addRecentNode(node);
      const updated = getRecentNodes();
      setRecentNodes(updated);

      // Call the node click handler
      if (onNodeClick) {
        await onNodeClick(node, { openDialog: true, autoLink: true });
      }
    },
    [onNodeClick],
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Filter out empty categories
  const categoriesWithNodes = useMemo(() => {
    return Object.entries(commonNodes).filter(([, nodes]) => nodes.length > 0);
  }, [commonNodes]);

  const hasAnyNodes = recentNodes.length > 0 || categoriesWithNodes.length > 0;

  const panelClassName = `${styles.quick_access_panel} ${
    !isExpanded ? styles.collapsed : ""
  }`.trim();

  return (
    <div
      ref={panelRef}
      className={panelClassName}
      data-testid="quick-access-panel"
      data-component="QuickAccessPanel"
      style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
    >
      {isExpanded && (
        <>
          <button
            className={styles.toggle_button}
            onClick={toggleExpanded}
            data-testid="quick-access-toggle"
            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            <Icon
              outeIconName="OUTEChevronLeftIcon"
              outeIconProps={{
                sx: {
                  transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  width: "1.25rem",
                  height: "1.25rem",
                },
              }}
            />
          </button>

          {hasAnyNodes ? (
            <div className={styles.panel_content}>
              <div className={styles.panel_header}>
                <h3 className={styles.panel_title}>Quick Access</h3>
              </div>

              <div className={styles.panel_body}>
                {recentNodes.length > 0 && (
                  <QuickAccessPanelCategory
                    label="Recent"
                    nodes={recentNodes}
                    onNodeClick={handleNodeClick}
                  />
                )}

                {categoriesWithNodes.map(([categoryLabel, nodes]) => (
                  <QuickAccessPanelCategory
                    key={categoryLabel}
                    label={categoryLabel}
                    nodes={nodes}
                    onNodeClick={handleNodeClick}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.panel_content}>
              <div className={styles.panel_header}>
                <h3 className={styles.panel_title}>Quick Access</h3>
              </div>
              <div className={styles.panel_body}>
                <div className={styles.empty_state}>
                  <p className={styles.empty_state_text}>
                    No quick access nodes available
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isExpanded && (
        <button
          className={styles.collapsed_tab}
          onClick={toggleExpanded}
          data-testid="collapsed-panel-tab"
          aria-label="Expand Quick Access panel"
        >
          <Icon
            outeIconName="OUTEChevronRightIcon"
            outeIconProps={{
              sx: {
                width: "1rem",
                height: "1rem",
                color: "#1a1a1a",
              },
            }}
          />
          <span className={styles.collapsed_tab_text}>Quick Access</span>
        </button>
      )}
    </div>
  );
};

export default QuickAccessPanel;
