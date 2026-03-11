import {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
} from "react";
import snakeCase from "lodash/snakeCase";
import { SHEET_ERRORS } from "../../../utils/errorEnums";
import useSheet from "../../common-hooks/useSheet";
import hookNRunServices from "../../../services/hookAndRunServices";
import sheetSDKServices from "../../../services/sheetSDKServices";
import Configure from "./configure/Configure";

const SheetTrigger = forwardRef(
  ({ data, parentId = "", workspaceId = "", assetId }, ref) => {
    const [errorMessages, setErrorMessages] = useState([]);

    const {
      sheet,
      table,
      sheetList,
      tableList,
      eventType,
      onEventTypeChangeHandler,
      onSheetChangeHandler,
      onTableChangeHandler,
      createSheet,
      getSheetList,
    } = useSheet({
      data,
      parentId,
      workspaceId,
      ref,
      isViewRequired: false,
      isFieldRequired: true,
    });

    const validateData = useCallback(() => {
      const errors = [];
      const nodeData = {
        asset: sheet,
        subSheet: table,
        eventType,
        fields: table?.fields,
      };
      if (!nodeData?.asset && !errors.includes(SHEET_ERRORS.SHEET_MISSING)) {
        errors.push(SHEET_ERRORS.SHEET_MISSING);
      }
      if (!nodeData?.subSheet && !errors.includes(SHEET_ERRORS.TABLE_MISSING)) {
        errors.push(SHEET_ERRORS.TABLE_MISSING);
      }

      if (
        !nodeData?.eventType?.length &&
        !errors.includes(SHEET_ERRORS.EVENT_TYPE_MISSING)
      ) {
        errors.push(SHEET_ERRORS.EVENT_TYPE_MISSING);
      }

      setErrorMessages(errors);
      return errors?.length > 0 ? errors : null;
    }, [eventType, sheet, table]);

    const getWebhookUrl = useCallback(async (payload) => {
      const updatedPayload = payload;

      // now webhook id is removed from goData, unique identification is done based on published_asset_id and event_src
      // if (data?.webhookId) {
      //   updatedPayload._id = data.webhookId;
      // }

      const response =
        await hookNRunServices.generateWebhookUrl(updatedPayload);
      const { status = "", result = {} } = response || {};

      if (status === "success") {
        return result;
      }
    }, []);

    const upsertSheetStream = useCallback(
      async ({ nodeData, webhookUrl }) => {
        const { subSheet, eventType } = nodeData || {};

        const payload = {
          where: {
            id: data?.streamId,
            tableId: subSheet?.id,
            webhookUrl,
            linkedAssetId: assetId,
          },
          data: {
            webhookUrl,
            tableId: subSheet?.id,
            linkedAssetId: assetId,
            eventType: eventType.map((event) => snakeCase(event)),
          },
          baseId: sheet?.id,
        };

        const response = await sheetSDKServices.upsertStream(payload);

        if (response?.status === "success") {
          return response?.result;
        }
      },
      [assetId, data?.streamId, sheet?.id]
    );

    useEffect(() => {
      validateData();
    }, [validateData]);

    useImperativeHandle(ref, () => {
      return {
        getData: async () => {
          const nodeData = {
            asset: sheet,
            subSheet: table,
            eventType,
            fields: table?.fields,
          };

          const errors = validateData(nodeData);
          if (errors?.length > 0) {
            return nodeData;
          }
          const { subSheet } = nodeData || {};

          const payload = {
            watch_enabled: true,
            identifier: subSheet?.id,
            published_asset_id: assetId,
            event_src: "TC_SHEET",
            event_type: "SHEET_WATCHER",
          };

          const {
            webhook_url: webhookUrl,
          } = await getWebhookUrl(payload);

          const streamResponse = await upsertSheetStream({
            nodeData: nodeData,
            webhookUrl,
          });

          return {
            ...nodeData,
            streamId: streamResponse?.id,
          };
        },
        getWebhookUrl,
        upsertSheetStream,
        validateData: () => {
          return errorMessages;
        },
      };
    }, [
      getWebhookUrl,
      upsertSheetStream,
      sheet,
      table,
      eventType,
      validateData,
      assetId,
      errorMessages,
    ]);

    return (
      <Configure
        sheet={sheet}
        table={table}
        sheetList={sheetList}
        tableList={tableList}
        eventType={eventType}
        onEventTypeChange={onEventTypeChangeHandler}
        onSheetChange={onSheetChangeHandler}
        onTableChange={onTableChangeHandler}
        createSheet={createSheet}
        getSheetList={getSheetList}
      />
    );
  }
);

export default SheetTrigger;
