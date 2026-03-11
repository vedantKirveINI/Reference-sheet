import React from "react";
// import ODSAutoComplete from "oute-ds-autocomplete";
// import ODSLabel from "oute-ds-label";

// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSAutocomplete as ODSAutoComplete, ODSLabel, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { RequestAuthType } from "../../../../classes";

import classes from "./AuthPanel.module.css";

const AuthorizationPanel = ({
  variables,
  authorizationOptions,
  authorizationType,
  setAuthorizationType,
  basicAuthData,
  setBasicAuthData,
  bearerAuth,
  setBearerAuth,
}) => {
  return (
    <div
      className={classes["authorization-panel"]}
      data-testid="http-configure-auth-section"
    >
      <div className={classes["auto-complete"]}>
        <ODSAutoComplete
          id="authorization"
          fullWidth
          variant="black"
          options={authorizationOptions}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => {
            return option.id === value.id;
          }}
          textFieldProps={{
            required: true,
            placeholder: "Select Authorization",
          }}
          data-testid="http-configure-auth-type"
          value={authorizationType}
          onChange={(e, value) => {
            setAuthorizationType(value);
          }}
        />
      </div>
      {authorizationType?.id === RequestAuthType.NONE.id && (
        <div className={classes["no-auth"]} data-testid="no-auth">
          <ODSLabel variant="body1">
            This request does not use any authorization.
          </ODSLabel>
        </div>
      )}
      {authorizationType?.id === RequestAuthType.BASIC.id && (
        <div className={classes["basic-auth"]} data-testid="basic-auth">
          <ODSLabel className={classes["auth-label"]} variant="subtitle1">
            Username
          </ODSLabel>
          <FormulaBar
            onInputContentChanged={(fxContent) => {
              setBasicAuthData((prevState) => {
                const userNameIdx = prevState.findIndex(
                  (data) => data.key === "username"
                );
                prevState[userNameIdx].value.blocks = fxContent;
                return [...prevState];
              });
            }}
            defaultInputContent={
              basicAuthData.find((data) => data.key === "username")?.value
                ?.blocks
            }
            variables={variables}
            slotProps={{
              content: {
                "data-testid": "http-configure-auth-basic-username",
              },
            }}
          />
          <ODSLabel className={classes["auth-label"]} variant="subtitle1">
            Password
          </ODSLabel>
          {/* <ODSTextfield
            type="password"
            fullWidth
            InputProps={{
              "data-testid": "password",
            }}
            value={basicAuthData.find((data) => data.key === "password")?.value}
            onChange={(e) => {
              setBasicAuthData((prevState) => {
                const passwordIdx = prevState.findIndex((data) => {
                  return data.key === "password";
                });
                prevState[passwordIdx].value = e.target.value;
                return [...prevState];
              });
            }}
          /> */}
          <FormulaBar
            onInputContentChanged={(fxContent) => {
              setBasicAuthData((prevState) => {
                const passwordIdx = prevState.findIndex((data) => {
                  return data.key === "password";
                });
                prevState[passwordIdx].value.blocks = fxContent;
                return [...prevState];
              });
            }}
            defaultInputContent={
              basicAuthData.find((data) => data.key === "password")?.value
                ?.blocks
            }
            variables={variables}
            slotProps={{
              content: {
                "data-testid": "http-configure-auth-basic-password",
              },
            }}
          />
        </div>
      )}
      {authorizationType?.id === RequestAuthType.BEARER.id && (
        <div className={classes["bearer-auth"]} data-testid="bearer-auth">
          <ODSLabel className={classes["auth-label"]} variant="subtitle1">
            Token
          </ODSLabel>
          <FormulaBar
            onInputContentChanged={(fxContent) => {
              setBearerAuth((prevState) => {
                const tokenIdx = prevState.findIndex(
                  (data) => data.key === "token"
                );
                prevState[tokenIdx].value.blocks = fxContent;
                return [...prevState];
              });
            }}
            defaultInputContent={
              bearerAuth.find((data) => data.key === "token")?.value?.blocks
            }
            variables={variables}
            slotProps={{
              content: {
                "data-testid": "http-configure-auth-bearer-token",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AuthorizationPanel;
