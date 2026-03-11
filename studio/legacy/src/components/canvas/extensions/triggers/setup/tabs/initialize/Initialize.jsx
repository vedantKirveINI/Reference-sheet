import React, { useCallback, useState, useMemo } from "react";
import { ODSLabel as Label } from "@src/module/ods";
import SelectTrigger from "../../components/SelectTrigger";
import CollapsedTriggerCard from "../../components/CollapsedTriggerCard";
import TriggerSummary from "../../components/TriggerSummary";
import {
  INTEGRATION_TYPE,
  TRIGGER_SETUP_TYPE,
  SHEET_TRIGGER,
  TIME_BASED_TRIGGER,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../../../../constants/types";
import { INPUT_SETUP_TYPE } from "../../../../constants/types";
import { TRIGGER_TYPES } from "../../constants/trigger-types";
import styles from "../../components/SelectTrigger.module.css";

import SetupIntegration from "../../components/SetupIntegration";

const NON_INTEGRATION_TRIGGERS = [
  SHEET_TRIGGER,
  TIME_BASED_TRIGGER,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
];

const Initialize = ({
  triggerType,
  integrations,
  integration,
  event,
  eventData,
  connection,
  nodeData,
  onTriggerChange = () => {},
  onIntegrationChange = () => {},
  onEventChange = () => {},
  onConnectionChange = () => {},
  onClose = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedTrigger = useMemo(() => {
    if (!triggerType || triggerType === TRIGGER_SETUP_TYPE) return null;
    return TRIGGER_TYPES.find((t) => t.type === triggerType) || null;
  }, [triggerType]);

  const hasSelectedTrigger = selectedTrigger !== null;
  const showCards = !hasSelectedTrigger || isExpanded;

  const triggerChangeHandler = useCallback(
    (node) => {
      onTriggerChange(node);
      setIsExpanded(false);
      if (node?.type === INPUT_SETUP_TYPE) {
        onClose();
      }
    },
    [onTriggerChange, onClose]
  );

  const handleChangeClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        <Label variant="body1">Select Trigger</Label>
        {showCards ? (
          <SelectTrigger
            onChange={triggerChangeHandler}
            selectedType={triggerType}
            showCancel={hasSelectedTrigger && isExpanded}
            onCancel={handleCancelClick}
          />
        ) : (
          <CollapsedTriggerCard
            trigger={selectedTrigger}
            onChangeClick={handleChangeClick}
          />
        )}
      </div>
      {triggerType === INTEGRATION_TYPE && (
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <Label variant="body1">Initialisation steps</Label>
          </div>
          <div className={styles.formSectionContent}>
            <SetupIntegration
              integrations={integrations}
              integration={integration}
              event={event}
              connection={connection}
              eventData={eventData}
              onIntegrationChange={onIntegrationChange}
              onEventChange={onEventChange}
              onConnectionChange={onConnectionChange}
            />
          </div>
        </div>
      )}
      {NON_INTEGRATION_TRIGGERS.includes(triggerType) && (
        <TriggerSummary triggerType={triggerType} configureData={nodeData} />
      )}
    </div>
  );
};

export default Initialize;
