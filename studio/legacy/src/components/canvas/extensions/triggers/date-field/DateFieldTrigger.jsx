import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import SheetsAutocomplete from "../../sheet/common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../sheet/common-components/SubSheetsAutocomplete";
import useSheet from "../../common-hooks/useSheet";
import { DateFieldSelector } from "./components/index.js";
import TimingRulesList from "./components/TimingRulesList.jsx";
import DateFieldSummaryCard from "./components/DateFieldSummaryCard.jsx";
import { createDefaultTimingRule } from "./constants.js";
import styles from "./components/DateFieldTrigger.module.css";
import { SHEET_ERRORS } from "../../../utils/errorEnums";
import hookNRunServices from "../../../services/hookAndRunServices";
import sheetSDKServices from "../../../services/sheetSDKServices";
import { convertStreamPayloadRules } from "./utils/covert-stream-payload-rules";

const DateFieldTrigger = forwardRef(
  ({ data, parentId = "", workspaceId = "", assetId }, ref) => {
    const [errorMessages, setErrorMessages] = useState([]);
    const [dateField, setDateField] = useState(data?.dateField || null);
    const [timingRules, setTimingRules] = useState(
      data?.timingRules || [createDefaultTimingRule({ index: 0 })]
    );

    const {
      sheet,
      table,
      sheetList,
      tableList,
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

    const prevTableIdRef = useRef(data?.subSheet?.id || data?.table?.id);

    useEffect(() => {
      const currentTableId = table?.id;
      if (currentTableId && currentTableId !== prevTableIdRef.current) {
        setDateField(null);
        prevTableIdRef.current = currentTableId;
      } else if (currentTableId) {
        prevTableIdRef.current = currentTableId;
      }
    }, [table?.id]);

    const handleDateFieldChange = useCallback((dateField) => {
      setDateField(dateField);
    }, []);

    const handleAddRule = useCallback(() => {
      setTimingRules((prev) => [
        ...prev,
        createDefaultTimingRule({ index: prev.length }),
      ]);
    }, []);

    const handleRemoveRule = useCallback((ruleId) => {
      setTimingRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    }, []);

    const handleUpdateRule = useCallback((ruleId, updates) => {
      setTimingRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      );
    }, []);

    const validateData = useCallback(() => {
      const errors = [];

      if (!sheet) {
        errors.push(SHEET_ERRORS.SHEET_MISSING);
      }
      if (!table) {
        errors.push(SHEET_ERRORS.TABLE_MISSING);
      }
      if (!dateField) {
        errors.push(SHEET_ERRORS.DATE_FIELD_MISSING);
      }
      if (!timingRules || timingRules.length === 0) {
        errors.push(SHEET_ERRORS.AT_LEAST_ONE_TIMING_RULE_REQUIRED);
      }

      timingRules?.forEach((rule, index) => {
        if (
          rule.timing !== "on" &&
          (!rule.offsetValue || rule.offsetValue < 1)
        ) {
          errors.push(`Rule ${index + 1}: Offset value must be at least 1`);
        }
      });

      setErrorMessages(errors);
      return errors;
    }, [sheet, table, dateField, timingRules]);

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

    const upsertDateFieldStream = useCallback(
      async ({ nodeData, webhookUrl }) => {
        const { subSheet, timingRules, dateField } = nodeData || {};

        const payload = {
          where: {
            id: data?.streamId,
            tableId: subSheet?.id,
            webhookUrl,
          },
          data: {
            webhookUrl,
            triggerType: "TIME_BASED",
            tableId: subSheet?.id,
            linkedAssetId: assetId,
            triggerConfig: convertStreamPayloadRules(timingRules, dateField),
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

    useImperativeHandle(
      ref,
      () => ({
        getData: async () => {
          const errors = validateData();

          const nodeData = {
            asset: sheet,
            subSheet: table,
            dateField: dateField,
            timingRules: timingRules,
            fields: table?.fields,
          };

          if (errors.length > 0) {
            return nodeData;
          }

          const { subSheet } = nodeData || {};

          const webhookPayload = {
            watch_enabled: true,
            identifier: subSheet?.id,
            published_asset_id: assetId,
            event_src: "TC_SHEET",
            event_type: "DATE_FIELD_SCHEDULER",
          };

          const { webhook_url: webhookUrl } =
            await getWebhookUrl(webhookPayload);

          const streamResponse = await upsertDateFieldStream({
            nodeData: nodeData,
            webhookUrl,
          });

          return {
            ...nodeData,
            streamId: streamResponse?.id, //
          };
        },
        validateData: () => errorMessages,
      }),
      [
        assetId,
        dateField,
        errorMessages,
        getWebhookUrl,
        sheet,
        table,
        timingRules,
        upsertDateFieldStream,
        validateData,
      ]
    );

    return (
      <div className={styles.container}>
        <SheetsAutocomplete
          sheet={sheet}
          onChange={onSheetChangeHandler}
          sheets={sheetList}
          createSheet={createSheet}
          getSheetList={getSheetList}
          label="Select Sheet"
          description="Select the sheet containing the date field to monitor."
          autocompleteProps={{
            fullWidth: true,
          }}
        />

        <SubSheetsAutocomplete
          subSheets={tableList}
          table={table}
          onChange={onTableChangeHandler}
          disabled={!sheet}
          searchable={true}
          label="Select Table"
          description="Select the table in the sheet where you want to monitor records."
          autocompleteProps={{
            fullWidth: true,
          }}
        />

        <DateFieldSelector
          table={table}
          dateField={dateField}
          onDateFieldChange={handleDateFieldChange}
        />

        <TimingRulesList
          rules={timingRules}
          onAddRule={handleAddRule}
          onRemoveRule={handleRemoveRule}
          onUpdateRule={handleUpdateRule}
        />

        <DateFieldSummaryCard
          dateField={dateField}
          table={table}
          timingRules={timingRules}
        />
      </div>
    );
  }
);

export default DateFieldTrigger;
