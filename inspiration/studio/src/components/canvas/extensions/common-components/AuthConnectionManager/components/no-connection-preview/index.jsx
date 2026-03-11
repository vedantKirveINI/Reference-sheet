import classes from "./index.module.css";
import { ODSIcon, ODSButton } from "@src/module/ods";
const NoConnectionPreview = ({ 
  integrationName = "", 
  integrationIcon = null,
  onAddConnection = null 
}) => {
  const displayName = integrationName || "your app";

  return (
    <div
      className={classes["no-connection-preview-root"]}
      data-testid="no-connection-preview-root"
    >
      <div className={classes["icon-badge"]}>
        {integrationIcon ? (
          <img 
            src={integrationIcon} 
            alt={displayName} 
            className={classes["integration-icon"]}
          />
        ) : (
          <ODSIcon
            outeIconName={"OUTELinkIcon"}
            outeIconProps={{
              sx: {
                width: "1.5rem",
                height: "1.5rem",
                color: "#0066FF",
              },
            }}
            data-testid={"no-connection-icon"}
          />
        )}
      </div>
      
      <div className={classes["preview-content"]}>
        <h3
          className={classes["preview-title"]}
          data-testid="no-connection-preview-title"
        >
          Connect {displayName}
        </h3>
        <p
          className={classes["preview-description"]}
          data-testid="no-connection-preview-description"
        >
          Securely link your account to enable automated workflows
        </p>
      </div>

      {onAddConnection && (
        <ODSButton
          data-testid="add-connection-inline-button"
          label="Add connection"
          variant="contained"
          color="primary"
          onClick={onAddConnection}
          startIcon={
            <ODSIcon
              outeIconName={"OUTEAddIcon"}
              outeIconProps={{
                sx: {
                  color: "#fff",
                  width: "1rem",
                  height: "1rem",
                },
              }}
            />
          }
          style={{
            fontFamily: "Inter",
            fontSize: "0.875rem",
            fontWeight: 500,
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            textTransform: "none",
          }}
        />
      )}
      
      <div className={classes["trust-badges"]}>
        <div className={classes["trust-item"]}>
          <ODSIcon
            outeIconName={"OUTELockIcon"}
            outeIconProps={{
              sx: { width: "0.875rem", height: "0.875rem", color: "#78909c" },
            }}
          />
          <span>Encrypted</span>
        </div>
        <div className={classes["trust-item"]}>
          <ODSIcon
            outeIconName={"OUTEShieldIcon"}
            outeIconProps={{
              sx: { width: "0.875rem", height: "0.875rem", color: "#78909c" },
            }}
          />
          <span>Secure OAuth</span>
        </div>
      </div>
    </div>
  );
};

export default NoConnectionPreview;
