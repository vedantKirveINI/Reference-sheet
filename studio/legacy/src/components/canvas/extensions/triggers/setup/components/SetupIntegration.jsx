import React, { useMemo } from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import SelectIntegration from "./SelectIntegration";
import SelectTriggerIntegration from "./SelectTriggerIntegration";
import ConnectionSetup from "./ConnectionSetup";
import StepIndicator from "./StepIndicator";
import styles from "./SetupIntegration.module.css";

const SetupIntegration = ({
  integrations = [],
  integration,
  event,
  connection,
  eventData,
  onIntegrationChange = () => {},
  onEventChange = () => {},
  onConnectionChange = () => {},
}) => {
  const currentStep = useMemo(() => {
    if (!integration) return 1;
    if (!event) return 2;
    return 3;
  }, [integration, event]);

  const completedSteps = useMemo(() => {
    const completed = [];
    if (integration) completed.push(1);
    if (event) completed.push(2);
    if (connection?.id) completed.push(3);
    return completed;
  }, [integration, event, connection]);

  const handleBackToStep1 = () => {
    onConnectionChange(null);
    onEventChange(null);
    onIntegrationChange(null);
  };

  const handleBackToStep2 = () => {
    onConnectionChange(null);
    onEventChange(null);
  };

  return (
    <div className={styles.container}>
      <StepIndicator 
        currentStep={currentStep}
        completedSteps={completedSteps}
      />
      
      <div className={styles.stepContent}>
        {currentStep === 1 && integrations?.length > 0 && (
          <SelectIntegration
            integrations={integrations}
            integration={integration}
            onChange={onIntegrationChange}
          />
        )}
        
        {currentStep === 2 && (
          <>
            <button 
              type="button"
              className={styles.backButton}
              onClick={handleBackToStep1}
            >
              <Icon outeIconName="OUTEChevronLeftIcon" style={{ width: 16, height: 16 }} />
              <span>BACK</span>
            </button>
            <SelectTriggerIntegration
              selectedIntegration={integration}
              selectedEvent={event}
              onChange={onEventChange}
            />
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <button 
              type="button"
              className={styles.backButton}
              onClick={handleBackToStep2}
            >
              <Icon outeIconName="OUTEChevronLeftIcon" style={{ width: 16, height: 16 }} />
              <span>BACK</span>
            </button>
            <ConnectionSetup
              connection={connection}
              event={event}
              integration={integration}
              onConnectionChange={onConnectionChange}
              eventData={eventData}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SetupIntegration;
