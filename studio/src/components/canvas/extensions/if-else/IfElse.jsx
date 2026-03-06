import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { GitBranch, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { getNodeSrc } from "../extension-utils";
import { updateIfElseNodeLinks } from "../../utils/canvas-utils";
import { IF_ELSE_NODE, THEME, TABS } from "./constants";
import { getInitialComposerData, useIfElseState } from "./hooks/useIfElseState";
import ConfigureTab from "./components/ConfigureTab";

const IfElse = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      schema,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      open = true,
      onClose = () => {},
      getNodes = () => Promise.resolve([]),
      onUpdateNodeLinks = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
    },
    ref,
  ) => {
    const testModuleRef = useRef();
    const drawerRef = useRef();
    const configureTabRef = useRef();
    const state = useIfElseState(data, open);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);

    // When drawer opens, sync state from the diagram's current node data (source of truth)
    // so we always show the latest saved go_data even if props were stale.
    useEffect(() => {
      if (!open || !nodeData?.key || !canvasRef?.current) return;
      const diagram = canvasRef.current.getDiagram();
      const node = diagram?.findNodeForKey(nodeData.key);
      const freshGoData = node?.data?.go_data;
      if (
        freshGoData &&
        typeof freshGoData === "object" &&
        Object.keys(freshGoData).length > 0
      ) {
        const synced = getInitialComposerData(freshGoData);
        state.updateComposerData(synced);
      }
    }, [open, nodeData?.key]); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally read canvas and state on open

    // Debug: log data passed to IF-Else when drawer opens or data changes
    useEffect(() => {
      if (process.env.NODE_ENV === "development" && open && nodeData?.key) {
        console.log("[IfElse] Drawer open – data (go_data) received", {
          nodeKey: nodeData.key,
          hasData: !!data && typeof data === "object",
          dataKeys: data ? Object.keys(data) : [],
          blocksLength: data?.blocks?.length ?? 0,
          ifDataLength: data?.ifData?.length ?? 0,
          elseDataLength: data?.elseData?.length ?? 0,
          firstBlockHasConditionGroup: !!data?.blocks?.[0]?.conditionGroup,
          firstIfDataHasConditionGroup: !!data?.ifData?.[0]?.conditionGroup,
        });
      }
    }, [open, nodeData?.key, data]);
    const [jumpToNodeOptions, setJumpToNodeOptions] = useState([]);

    const updateJumpTo = async (jumpTo) => {
      const _src = await getNodeSrc(jumpTo, true);
      return { ...jumpTo, _src };
    };

    const loadJumpToNodeOptions = useCallback(async () => {
      try {
        const response = await getNodes({ fetchConnectableNodes: true });
        const options = [];
        for (let i = 0; i < response.length; i++) {
          const option = await updateJumpTo(response[i]);
          options.push(option);
        }
        setJumpToNodeOptions(options);
      } catch (error) {}
    }, [getNodes]);

    useEffect(() => {
      loadJumpToNodeOptions();
    }, [loadJumpToNodeOptions]);

    // Track previous block structure to detect when links actually need updating
    // IMPORTANT: Must be defined before the initial links useEffect so it can be updated there
    const previousBlocksRef = useRef(null);
    // Prevent creating initial links more than once per open (effect re-runs when state identity changes)
    const initialLinksCreatedForNodeKeyRef = useRef(null);

    // Create initial placeholder links when dialog opens (like legacy)
    // This ensures IF and ELSE blocks have placeholder links from the start
    useEffect(() => {
      if (!nodeData?.key || !canvasRef?.current) return;

      if (!open) {
        initialLinksCreatedForNodeKeyRef.current = null;
        return;
      }

      // Small delay to ensure canvas is ready and state is initialized
      const timer = setTimeout(() => {
        try {
          if (process.env.NODE_ENV === "development") {
            console.log("[IfElse] Initial-links effect running", {
              nodeKey: nodeData.key,
              open,
            });
          }

          // Check if node already has links
          const existingLinks = canvasRef.current.findLinksOutOf?.(
            nodeData.key,
          );
          const hasExistingLinks = existingLinks && existingLinks.count > 0;

          // Get current composer data - this should have loaded from go_data
          const currentData = state.getData();
          const blocks = currentData.blocks || state.composerData.blocks || [];
          const ifData = currentData.ifData || state.composerData.ifData || [];
          const elseData =
            currentData.elseData || state.composerData.elseData || [];

          if (process.env.NODE_ENV === "development") {
            console.log("[IfElse] Initial-links state", {
              hasExistingLinks,
              existingLinksCount: existingLinks?.count ?? 0,
              blocksLength: blocks?.length ?? 0,
              ifDataLength: ifData?.length ?? 0,
              elseDataLength: elseData?.length ?? 0,
            });
          }

          // If no existing links, create initial placeholder links (once per open)
          if (!hasExistingLinks) {
            if (initialLinksCreatedForNodeKeyRef.current === nodeData.key) {
              if (process.env.NODE_ENV === "development") {
                console.log(
                  "[IfElse] Initial links already created for this node this session, skipping",
                );
              }
              return;
            }

            // Use current composer data - it should have blocks from go_data conversion
            const initialData = {
              blocks: blocks.length > 0 ? blocks : [],
              ifData: ifData.length > 0 ? ifData : [],
              elseData: elseData.length > 0 ? elseData : [],
            };

            const linksToBeUpdated = updateIfElseNodeLinks(initialData);

            if (process.env.NODE_ENV === "development") {
              console.log("[IfElse] Initial-links result", {
                linksToBeUpdatedLength: linksToBeUpdated?.length ?? 0,
                willCallOnUpdateNodeLinks: !!(
                  linksToBeUpdated?.length > 0 && onUpdateNodeLinks
                ),
              });
            }

            if (linksToBeUpdated && linksToBeUpdated.length > 0) {
              onUpdateNodeLinks(linksToBeUpdated);
              initialLinksCreatedForNodeKeyRef.current = nodeData.key;

              // Persist go_data so the node keeps the block ids and links are not orphaned on reopen.
              // Pass true so the drawer stays open (false would close it).
              onSave(currentData, { errors: state.getError() }, true);

              // CRITICAL: Update previousBlocksRef so handleLinksUpdate knows what exists
              const initialBlockIds = (blocks.length > 0 ? blocks : []).map(
                (b) => ({
                  id: b.id,
                  moveTo: b.moveTo?.key || null,
                }),
              );
              previousBlocksRef.current = initialBlockIds;
            }
          }
        } catch (error) {
          console.error("[IfElse] Error creating initial links:", error);
        }
      }, 200); // Small delay to ensure state is fully initialized

      return () => clearTimeout(timer);
    }, [open, nodeData?.key, canvasRef, state, onUpdateNodeLinks, onSave]);

    const handleLinksUpdate = useCallback(
      (composerData) => {
        const dataForLinks = {
          blocks: composerData.blocks,
          ifData: composerData.ifData,
          elseData: composerData.elseData,
        };

        // Check for changes in:
        // 1. Block structure (blocks added/removed)
        // 2. moveTo changed (node added/removed from a block)
        // 3. conditionStr changed (condition label updated)
        // 4. This is the first update (previousBlocksRef is null)
        const currentBlockState = (composerData.blocks || []).map((b) => ({
          id: b.id,
          moveTo: b.moveTo?.key || null,
          conditionStr: b.conditionStr || "",
        }));
        const previousBlockState = previousBlocksRef.current || [];

        const blockStructureChanged =
          currentBlockState.length !== previousBlockState.length ||
          currentBlockState.some((curr, idx) => {
            const prev = previousBlockState[idx];
            return !prev || curr.id !== prev.id || curr.moveTo !== prev.moveTo;
          });

        // Check if any labels/conditions changed (separate from structure)
        const labelsChanged = currentBlockState.some((curr, idx) => {
          const prev = previousBlockState[idx];
          return prev && curr.conditionStr !== prev.conditionStr;
        });

        // Update ref for next comparison
        previousBlocksRef.current = currentBlockState;

        // Call updateNodeLinks if structure OR labels changed
        if (
          blockStructureChanged ||
          labelsChanged ||
          previousBlockState.length === 0
        ) {
          const linksToBeUpdated = updateIfElseNodeLinks(dataForLinks);
          if (linksToBeUpdated && linksToBeUpdated.length > 0) {
            onUpdateNodeLinks(linksToBeUpdated);
          }
        }
      },
      [onUpdateNodeLinks],
    );

    const handleNodeSelectedFromPalette = useCallback(
      async (newNode, blockContext) => {
        if (!blockContext?.blockId) {
          console.warn(
            "[IfElse] handleNodeSelectedFromPalette called without blockId!",
          );
          return;
        }

        const nodeInfo = {
          key: newNode.key || newNode.data?.key,
          name: newNode.name || newNode.data?.name,
          _src: await getNodeSrc(
            { key: newNode.key || newNode.data?.key },
            true,
          ),
        };

        setJumpToNodeOptions((prev) => {
          if (prev.some((opt) => opt.key === nodeInfo.key)) {
            return prev;
          }
          return [...prev, nodeInfo];
        });

        if (configureTabRef.current?.updateBlockMoveTo) {
          configureTabRef.current.updateBlockMoveTo(
            blockContext.blockId,
            nodeInfo,
          );
        } else {
          console.warn(
            "[IfElse] configureTabRef.updateBlockMoveTo not available",
          );
        }
      },
      [],
    );

    const handleAddNodeWithCallback = useCallback(
      (blockContext) => {
        // Save current If-Else state before opening command palette
        // This ensures conditions are persisted even if another drawer opens
        const ifElseData = state.getData();

        // Save without closing (false = don't close drawer)
        onSave(ifElseData, { errors: state.getError() }, false);

        // NOTE: Don't call onUpdateNodeLinks here!
        // If we call updateIfElseNodeLinks before opening the palette, it will create
        // placeholder links for blocks without targets. Then when a node is selected,
        // createLink() creates ANOTHER link, resulting in duplicate fangs.
        // The links will be properly created after node selection via the callback.

        // Now open command palette
        onAddNode(blockContext, handleNodeSelectedFromPalette);
      },
      [onAddNode, handleNodeSelectedFromPalette, state, onSave],
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state],
    );

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.TEST && !state.validation.isValid) {
          return;
        }
        setActiveTab(tabId);
      },
      [state.validation.isValid],
    );

    const handleSave = useCallback(() => {
      const ifElseData = state.getData();
      if (process.env.NODE_ENV === "development") {
        console.log("[IfElse] handleSave – payload being sent to onSave", {
          blocksLength: ifElseData?.blocks?.length ?? 0,
          ifDataLength: ifElseData?.ifData?.length ?? 0,
          elseDataLength: ifElseData?.elseData?.length ?? 0,
          firstBlockConditionGroup: ifElseData?.blocks?.[0]?.conditionGroup
            ? "present"
            : "missing",
          firstIfDataConditionGroup: ifElseData?.ifData?.[0]?.conditionGroup
            ? "present"
            : "missing",
        });
      }
      onSave(ifElseData, { errors: state.getError() });

      const linksToBeUpdated = updateIfElseNodeLinks(ifElseData);
      if (linksToBeUpdated) {
        onUpdateNodeLinks(linksToBeUpdated);
      }
    }, [state, onSave, onUpdateNodeLinks]);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          if (process.env.NODE_ENV === "development") {
            console.log("[IfElse Test] Switching to Test tab and calling beginTest");
          }
          setActiveTab(TABS.TEST);
          setTimeout(() => {
            testModuleRef.current?.beginTest();
          }, 100);
        }
      } else if (activeTab === TABS.TEST) {
        handleSave();
        onClose();
      }
    }, [activeTab, state.validation.isValid, handleSave, onClose]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestComplete = useCallback(
      (output_schema) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[IfElse Test] handleTestComplete called", {
            hasOutputSchema: !!output_schema,
            outputSchema: output_schema,
          });
        }
        state.setOutputSchema(output_schema);
      },
      [state],
    );

    const tabs = [
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONFIGURE) return "Test Condition";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONFIGURE && !state.validation.isValid) {
        return (
          state.validation.errors[0] ||
          "Complete all condition fields to continue"
        );
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the condition logic";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              ref={configureTabRef}
              state={state}
              variables={variables}
              jumpToNodeOptions={jumpToNodeOptions}
              onAddNode={handleAddNodeWithCallback}
              onLinksChange={handleLinksUpdate}
            />
          );
        case TABS.TEST: {
          const testGoData = state.getData();
          return (
            <CommonTestModuleV3
              ref={testModuleRef}
              canvasRef={canvasRef}
              annotation={annotation}
              go_data={testGoData}
              workspaceId={workspaceId}
              assetId={assetId}
              projectId={projectId}
              parentId={parentId}
              variables={variables}
              node={nodeData || IF_ELSE_NODE}
              onTestComplete={handleTestComplete}
              resultType="json"
              persistTestData={true}
              inputMode="auto"
              useV3Input={true}
              useV4Result={true}
              autoContextualContent={true}
            />
          );
        }
        default:
          return null;
      }
    };

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      handleSave();
      onClose();
    }, [handleSave, onClose]);

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<GitBranch className="w-5 h-5" />}
        title={state.name || "If-Else"}
        subtitle="Route workflow based on conditions"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab === TABS.TEST}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        onSaveAndClose={
          activeTab === TABS.TEST ? handleSaveAndCloseAction : null
        }
        saveAndCloseLabel="Save & Close"
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        {renderContent()}
      </WizardDrawer>
    );
  },
);

IfElse.displayName = "IfElse";

export default IfElse;
