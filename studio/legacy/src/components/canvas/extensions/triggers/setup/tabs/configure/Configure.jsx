import React, { forwardRef } from "react";
import {
  INTEGRATION_TYPE,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  TIME_BASED_TRIGGER,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../../../../constants/types";
import StartNode from "../../../manual/StartNode";
import Webhook from "../../../webhook/Webhook";
import TimeBasedTrigger from "../../../time-based/TimeBasedTrigger";
import SheetTrigger from "../../../table/SheetTrigger";
import DateFieldTrigger from "../../../date-field/DateFieldTrigger";
import ConnectionConfigurationSetup from "../../components/ConnectionConfigurationSetup";
import FormTriggerNode from "../../../form/FormTriggerNode";

const Configure = forwardRef(
  (
    {
      data,
      assetId,
      parentId,
      workspaceId,
      triggerType,
      connection,
      eventData,
      variables,
      nodeData,
      configureData,
      userData,
      onConfigureDone = () => {},
    },
    ref
  ) => {
    return (
      <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
        {triggerType === INPUT_SETUP_TYPE && (
          // <StartNode data={data} ref={ref} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            No Configuration Required
          </div>
        )}
        {triggerType === TIME_BASED_TRIGGER && (
          <TimeBasedTrigger data={data} ref={ref} />
        )}
        {triggerType === WEBHOOK_TYPE && (
          <Webhook data={data} assetId={assetId} ref={ref} />
        )}
        {triggerType === SHEET_TRIGGER && (
          <SheetTrigger
            data={data}
            ref={ref}
            parentId={parentId}
            workspaceId={workspaceId}
            assetId={assetId}
          />
        )}
        {triggerType === SHEET_DATE_FIELD_TRIGGER && (
          <DateFieldTrigger
            data={data}
            ref={ref}
            parentId={parentId}
            workspaceId={workspaceId}
            assetId={assetId}
          />
        )}
        {triggerType === FORM_TRIGGER && (
          <FormTriggerNode
            data={data}
            workspaceId={workspaceId}
            userData={userData}
            ref={ref}
          />
        )}
        {triggerType === INTEGRATION_TYPE && connection && (
          <ConnectionConfigurationSetup
            eventData={eventData}
            variables={variables}
            nodeData={nodeData}
            configureData={configureData}
            onConfigureDone={onConfigureDone}
          />
        )}
      </div>
    );
  }
);

export default Configure;
