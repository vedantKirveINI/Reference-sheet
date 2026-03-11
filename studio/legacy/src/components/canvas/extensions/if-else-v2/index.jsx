import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CommonDrawer from "../common-components/CommonDrawer";
import IF_ELSE_NODE_V2 from "./constant";
import { getNodeSrc } from "../extension-utils";
import { cloneDeep } from "lodash";
import TabContainer from "../common-components/TabContainer";
import ComponentRenderer from "../common-components/ComponentRenderer";
import { ADD_SIDEBAR_COMPONENT } from "../../config";
import { useNodeAnimation } from "../common-hooks/useNodeAnimation";
import Configure from "./tabs/configure/Configure";
import END_NODE_V2 from "../end-v2/constants";
import { INTEGRATION_TYPE } from "../constants/types";

const IfElseDialogV2 = forwardRef(
  (
    {
      data,
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      getNodes = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
      onAddJumpTo = () => {},
      getDisabledNodes = () => [],
      linkedNodeDataRef = {},
      searchConfig = [],
      integrationThumbnailMap = {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const {
      scope,
      showingPreviewAnimation,
      hidePreviewAnimation,
      previewOpen,
    } = useNodeAnimation();
    const currentSavedData = cloneDeep(data);
    const [availableNodes, setAvailableNodes] = useState([]);
    const [errorMessages, setErrorMessages] = useState({
      0: [],
    });
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [jumptoActionData, setJumpToActionData] = useState(null);

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: () => <></>,
        },
      ];
    }, []);
    const fetchAvailableNodes = useCallback(async () => {
      const connectableNodes = await getNodes({
        fetchConnectableNodes: true,
        // fetchAllNodes: true,
      });

      for (const node in connectableNodes) {
        let nodeData = connectableNodes[node];
        if (
          nodeData.type === INTEGRATION_TYPE &&
          integrationThumbnailMap[nodeData?.go_data?.flow?.project_id]
        ) {
          nodeData._src =
            integrationThumbnailMap[nodeData?.go_data?.flow?.project_id]._src;
        } else {
          nodeData._src = await getNodeSrc(nodeData);
        }
      }
      setAvailableNodes(connectableNodes);
    }, [getNodes, integrationThumbnailMap]);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let ifElseData = { conditions: ref.current?.getData() };
        // const errors = validateIfElseData(ifElseData);
        onSave(
          ifElseData,
          {
            errors: ifElseData?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    const showSidebar = useCallback(
      (key, statementIndex) => {
        if (drawerRef.current) {
          const disabledNodes = getDisabledNodes();
          const actionToShow = {
            id: "add-node",
            name: "Add Node",
            panel: (
              <ComponentRenderer
                component={ADD_SIDEBAR_COMPONENT.component}
                {...{
                  tabData: searchConfig,
                  disabledNodes,
                  onClick: async (item) => {
                    onAddJumpTo({ ...item, key });
                    ref.current.updateAction(statementIndex, key);
                    setJumpToActionData(null);
                    drawerRef.current.closeSidebarPanel();
                    await fetchAvailableNodes();
                  },
                }}
              />
            ),
          };
          drawerRef.current.openSidebarPanel(actionToShow);
        }
      },
      [fetchAvailableNodes, onAddJumpTo, ref, searchConfig]
    );
    const onSidebarToggleHandler = useCallback(
      (open, id, reason) => {
        if (!open) {
          if (id === "add-node") {
            if (reason) {
              ref.current.updateAction(jumptoActionData?.index, null);
              setJumpToActionData(null);
            }
            saveHandler(true);
          }
          hidePreviewAnimation();
        }
      },
      [hidePreviewAnimation, jumptoActionData?.index, ref, saveHandler]
    );

    const addEndNodeInElse = async (statementIndex) => {
      const newNodeKey = Date.now().toString();
      linkedNodeDataRef.current = { from: nodeData?.key };
      onAddJumpTo({ ...END_NODE_V2, key: newNodeKey }, []);
      ref.current.updateAction(statementIndex, newNodeKey);
      saveHandler(true);
      await fetchAvailableNodes();
    };

    const addJumpToHandler = useCallback(
      (jumpToActionData) => {
        linkedNodeDataRef.current = { from: nodeData?.key };
        showingPreviewAnimation();
        setJumpToActionData(jumpToActionData);
        showSidebar(jumpToActionData.key, jumpToActionData.index);
      },
      [showSidebar, showingPreviewAnimation]
    );

    useEffect(() => {
      fetchAvailableNodes();
    }, [fetchAvailableNodes]);

    useEffect(() => {
      if (!currentSavedData?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [currentSavedData?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        allowContentOverflow={true}
        onClose={(e) => {
          linkedNodeDataRef.current = {};
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || IF_ELSE_NODE_V2.name,
          icon: nodeData?._src || IF_ELSE_NODE_V2._src,
          foreground: nodeData?.foreground || IF_ELSE_NODE_V2.foreground,
          background: nodeData?.background || IF_ELSE_NODE_V2.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={IF_ELSE_NODE_V2}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onSidebarToggle={onSidebarToggleHandler}
      >
        {/* <IfElse
          ref={ref}
          drawerRef={drawerRef}
          data={currentSavedData}
          variables={variables}
          availableNodes={availableNodes}
          onSave={saveHandler}
        /> */}
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            borderBottomLeftRadius: "inherit",
          }}
        >
          <TabContainer
            tabs={tabs || []}
            colorPalette={{
              dark: IF_ELSE_NODE_V2.dark,
              light: IF_ELSE_NODE_V2.light,
              foreground: IF_ELSE_NODE_V2.foreground,
            }}
            hasTestTab={IF_ELSE_NODE_V2.hasTestModule}
            errorMessages={errorMessages}
            validTabIndices={validTabIndices}
            onSave={saveHandler}
            showCommonActionFooter={true}
            validateTabs={true}
          />
          <div
            ref={scope}
            style={{
              position: "absolute",
              top: "0.75px", //"2.78rem",
              bottom: "6rem",
              width: "100%",
              height: "calc(100% - 6rem)",
              background: previewOpen ? "#fff" : "transparent",
            }}
          >
            <Configure
              initialData={data?.conditions || []}
              variables={variables}
              availableNodes={availableNodes}
              ref={ref}
              onAddJumpTo={addJumpToHandler}
              addEndNodeInElse={addEndNodeInElse}
            />
          </div>
        </div>
      </CommonDrawer>
    );
  }
);
export default IfElseDialogV2;
