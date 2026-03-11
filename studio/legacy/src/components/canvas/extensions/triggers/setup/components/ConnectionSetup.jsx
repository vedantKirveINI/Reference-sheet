import React from "react";
import AuthConnectionManager from "../../../common-components/AuthConnectionManager";
import { ODSCircularProgress } from "@src/module/ods";

const ConnectionSetup = ({
  onConnectionChange = () => {},
  connection,
  eventData,
  integration,
}) => {
  const integrationName = integration?.name || "";
  
  return (
    <>
      {eventData?.loading ? (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          padding: "2rem",
          width: "100%"
        }}>
          <ODSCircularProgress size={24} />
        </div>
      ) : (
        <AuthConnectionManager
          onConnectionChange={onConnectionChange}
          connectionNodeData={Object.values(eventData?.flow)[0]}
          resourceIds={eventData?.resourceIds}
          selectedConnection={connection}
          variant="inline"
          assetName={integrationName}
          nodeData={integration}
        />
      )}
    </>
  );
};

export default ConnectionSetup;
