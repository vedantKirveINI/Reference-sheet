import { useMemo } from "react";
import classes from "./ConnectionInfoDisplay.module.css";
// import ODSIcon from "oute-ds-icon";
// import ODSLabel from "oute-ds-label";
import { ODSIcon, ODSLabel } from "@src/module/ods";
import { extractScopes } from "./utils";
import { AUTH_TYPES } from "../../../../../utils/constants";

const ConnectionInfoDisplay = ({ authorization }) => {
  const scopes = useMemo(() => {
    return extractScopes(authorization);
  }, [authorization]);

  const authType = authorization?.authorization_type || "";
  const description = authorization?.authorization?.description || "";

  const getAuthTypeLabel = (type) => {
    const typeMap = {
      [AUTH_TYPES.OAUTH2_AUTHORIZATION_CODE]: "OAuth 2.0",
      [AUTH_TYPES.BASIC]: "Basic Authentication",
      [AUTH_TYPES.APIKEY]: "API Key",
      [AUTH_TYPES.CUSTOM]: "Custom Authentication",
    };
    return typeMap[type] || type;
  };

  return (
    <div
      className={classes["connection-info-display"]}
      data-testid="connection-info-display"
    >
      {/* Permissions Section */}
      <div className={classes["section"]}>
        <div className={classes["section-header"]}>
          <ODSIcon
            outeIconName="OUTELockIcon"
            outeIconProps={{
              sx: {
                width: "1.25rem",
                height: "1.25rem",
                fill: "var(--grey-darken-2, #546e7a)",
              },
            }}
            data-testid="permissions-icon"
          />
          <ODSLabel
            variant="sub-heading-1"
            className={classes["section-title"]}
            data-testid="permissions-title"
          >
            What permissions are requested?
          </ODSLabel>
        </div>
        {scopes.length > 0 ? (
          <div className={classes["scopes-list"]} data-testid="scopes-list">
            {scopes.map((scope, index) => (
              <div
                key={index}
                className={classes["scope-badge"]}
                data-testid={`scope-item-${index}`}
              >
                {scope}
              </div>
            ))}
          </div>
        ) : (
          <p
            className={classes["empty-state-text"]}
            data-testid="no-permissions-text"
          >
            No specific permissions required
          </p>
        )}
      </div>

      {/* About Connection Section */}
      {(authType || description) && (
        <div className={classes["section"]}>
          <div className={classes["section-header"]}>
            <ODSIcon
              outeIconName="OUTEInfoIcon"
              outeIconProps={{
                sx: {
                  width: "1.25rem",
                  height: "1.25rem",
                  fill: "var(--grey-darken-2, #546e7a)",
                },
              }}
              data-testid="about-icon"
            />
            <ODSLabel
              variant="sub-heading-1"
              className={classes["section-title"]}
              data-testid="about-title"
            >
              About this connection
            </ODSLabel>
          </div>
          {authType && (
            <div
              className={classes["auth-type-badge"]}
              data-testid="auth-type-badge"
            >
              {getAuthTypeLabel(authType)}
            </div>
          )}
          {description && (
            <p
              className={classes["description-text"]}
              data-testid="connection-description"
            >
              {description}
            </p>
          )}
          {!description && (
            <p
              className={classes["empty-state-text"]}
              data-testid="no-description-text"
            >
              This connection uses OAuth 2.0 to securely authenticate with the
              service provider. You&apos;ll be redirected to authorize access,
              and your credentials will be stored securely.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionInfoDisplay;
