import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import cloneDeep from "lodash/cloneDeep";

import TRIGGER_SETUP_NODE from "./constant";
import Setup from "./setup/Setup";

import CommonDrawer from "../common-components/CommonDrawer";
import {
  INTEGRATION_TYPE,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
  TIME_BASED_TRIGGER,
  TRIGGER_SETUP_TYPE,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
} from "../constants/types";
import START_NODE from "../start/constant";
import TIME_BASED_TRIGGER_NODE from "../time-based-trigger/constant";
import WEBHOOK_NODE from "../webhook/constant";
import SHEET_TRIGGER_NODE from "../sheet/trigger/constant";
import DATE_FIELD_TRIGGER_NODE from "./date-field/constant";
import FORM_TRIGGER_NODE from "./form/constants";

const TriggerDrawer = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      assetId,
      variables,
      userData,
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref,
  ) => {
    console.log("assetId", assetId);
    const data = cloneDeep(savedData);

    const [loading, setLoading] = useState(false);
    const drawerRef = useRef();
    const commonDrawerRef = useRef();

    const saveHandler = useCallback(
      async (openNodeAfterCreate = true, shouldUpdateTitle = false) => {
        let _data = await ref.current?.getData();
        let nodeIcon = TRIGGER_SETUP_NODE._src;
        let name = TRIGGER_SETUP_NODE.name;
        switch (_data?.triggerType) {
          case INPUT_SETUP_TYPE:
            nodeIcon = START_NODE._src;
            name = START_NODE.name;
            _data.goData = {};
            break;
          case TIME_BASED_TRIGGER:
            nodeIcon = TIME_BASED_TRIGGER_NODE._src;
            name = TIME_BASED_TRIGGER_NODE.name;
            break;
          case WEBHOOK_TYPE:
            nodeIcon = WEBHOOK_NODE._src;
            name = WEBHOOK_NODE.name;
            break;
          case SHEET_TRIGGER:
            nodeIcon = SHEET_TRIGGER_NODE._src;
            name = SHEET_TRIGGER_NODE.name;
            break;
          case SHEET_DATE_FIELD_TRIGGER:
            nodeIcon = DATE_FIELD_TRIGGER_NODE._src;
            name = DATE_FIELD_TRIGGER_NODE.name;
            break;
          case FORM_TRIGGER:
            nodeIcon = FORM_TRIGGER_NODE._src;
            name = FORM_TRIGGER_NODE.name;
            break;
          case INTEGRATION_TYPE: {
            nodeIcon = _data?.integration?.meta?.thumbnail;
            if (_data?.event?.name || _data?.integration?.name) {
              name = _data?.event?.name || _data?.integration?.name;
            }
            break;
          }
          default:
            nodeIcon = TRIGGER_SETUP_NODE._src;
            name = nodeData?.name || TRIGGER_SETUP_NODE.name;
        }
        onSave(
          _data?.goData,
          {
            errors: _data?.errors,
            _src: nodeIcon || TRIGGER_SETUP_NODE._src,
            type: _data?.triggerType || TRIGGER_SETUP_TYPE, //dangerous but needed in this case
            subType: _data?.triggerType ? TRIGGER_SETUP_TYPE : null,
            name,
          },
          openNodeAfterCreate,
        );

        if (shouldUpdateTitle) {
          setTimeout(() => {
            commonDrawerRef.current?.updateTitle({
              name,
              icon: nodeIcon || TRIGGER_SETUP_NODE._src,
              foreground: nodeData?.foreground || TRIGGER_SETUP_NODE.foreground,
              background: nodeData?.background || TRIGGER_SETUP_NODE.background,
              hoverDescription: nodeData?.hoverDescription,
            });
          }, 100);
        }
      },
      [
        nodeData?.name,
        nodeData?.icon,
        nodeData?.foreground,
        nodeData?.background,
        nodeData?.hoverDescription,
        onSave,
        ref,
        commonDrawerRef,
      ],
    );

    const closeHandler = useCallback(
      async (e, reason) => {
        try {
          setLoading(true);
          if (ref.current?.beforeTabChange) {
            await ref.current?.beforeTabChange();
          }
          await saveHandler(false);
          onDiscard(e, reason);
        } finally {
          setLoading(false);
        }
      },
      [onDiscard, ref, saveHandler],
    );

    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        commonDrawerRef={commonDrawerRef}
        onSave={saveHandler}
        title={{
          name: nodeData?.name || TRIGGER_SETUP_NODE.name,
          icon: nodeData?._src || TRIGGER_SETUP_NODE._src,
          foreground: nodeData?.foreground || TRIGGER_SETUP_NODE.foreground,
          background: nodeData?.background || TRIGGER_SETUP_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        showTitleEditButton={false}
        loading={loading}
        node={TRIGGER_SETUP_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onClose={closeHandler}
      >
        <Setup
          ref={ref}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          assetId={assetId}
          variables={variables}
          nodeData={nodeData}
          userData={userData}
          onSave={saveHandler}
          onClose={closeHandler}
        />
      </CommonDrawer>
    );
  },
);

export default TriggerDrawer;
