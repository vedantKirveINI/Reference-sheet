import React from "react";
import { Shield, Key, User, Settings, CheckCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { CONNECTION_TYPES } from "../constants";

const getConnectionIcon = (type) => {
  const icons = {
    OAUTH: Shield,
    API_KEY: Key,
    BASIC: User,
    CUSTOM: Settings,
  };
  return icons[type] || Key;
};

const ConfigureTab = ({ state, variables }) => {
  const {
    connectionType,
    setConnectionType,
    connectionName,
    setConnectionName,
    apiKey,
    setApiKey,
    apiKeyHeader,
    setApiKeyHeader,
    username,
    setUsername,
    password,
    setPassword,
    testStatus,
    testConnection,
    validation,
  } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Connection Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {CONNECTION_TYPES.map((type) => {
            const IconComponent = getConnectionIcon(type.id);
            const isSelected = connectionType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setConnectionType(type.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex items-center gap-3",
                  isSelected
                    ? "border-[#F59E0B] bg-[#F59E0B]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: type.color }}
                />
                <div className="text-left">
                  <span className={cn(
                    "text-sm font-medium block",
                    isSelected ? "text-[#F59E0B]" : "text-gray-700"
                  )}>
                    {type.label}
                  </span>
                  <span className="text-xs text-gray-500">{type.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Connection Name<span className="text-red-500">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter a name for this connection"
          defaultInputContent={connectionName?.blocks || []}
          onInputContentChanged={(blocks) => setConnectionName({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                !validation.isValid && validation.errors.includes("Connection name is required") && "border-red-400"
              ),
            },
          }}
        />
      </div>

      {connectionType === "API_KEY" && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              API Key<span className="text-red-500">*</span>
            </Label>
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Enter your API key"
              defaultInputContent={apiKey?.blocks || []}
              onInputContentChanged={(blocks) => setApiKey({ type: "fx", blocks })}
              slotProps={{
                container: {
                  className: cn(
                    "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                    !validation.isValid && validation.errors.includes("API key is required") && "border-red-400"
                  ),
                },
              }}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">Header Name</Label>
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Authorization"
              defaultInputContent={apiKeyHeader?.blocks || []}
              onInputContentChanged={(blocks) => setApiKeyHeader({ type: "fx", blocks })}
              slotProps={{
                container: {
                  className: "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                },
              }}
            />
            <p className="text-sm text-gray-400">
              The header name to use when sending the API key
            </p>
          </div>
        </>
      )}

      {connectionType === "BASIC" && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Username<span className="text-red-500">*</span>
            </Label>
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Enter username"
              defaultInputContent={username?.blocks || []}
              onInputContentChanged={(blocks) => setUsername({ type: "fx", blocks })}
              slotProps={{
                container: {
                  className: cn(
                    "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                    !validation.isValid && validation.errors.includes("Username is required") && "border-red-400"
                  ),
                },
              }}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">Password</Label>
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Enter password"
              defaultInputContent={password?.blocks || []}
              onInputContentChanged={(blocks) => setPassword({ type: "fx", blocks })}
              slotProps={{
                container: {
                  className: "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                },
              }}
            />
          </div>
        </>
      )}

      {connectionType === "OAUTH" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">OAuth 2.0 Setup</h4>
              <p className="text-sm text-blue-700 mt-1">
                OAuth connections require additional configuration. Click the test button to initiate the OAuth flow.
              </p>
            </div>
          </div>
        </div>
      )}

      {connectionType === "CUSTOM" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Custom Headers</h4>
              <p className="text-sm text-amber-700 mt-1">
                Configure custom authentication headers in the HTTP request node.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={testConnection}
          disabled={!validation.isValid || testStatus === "testing"}
          className={cn(
            "w-full h-12 rounded-xl font-medium transition-all",
            testStatus === "success"
              ? "bg-green-600 hover:bg-green-700"
              : testStatus === "error"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-[#F59E0B] hover:bg-[#d97706]"
          )}
        >
          {testStatus === "testing" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : testStatus === "success" ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Connection Successful
            </>
          ) : testStatus === "error" ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Connection Failed
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
        {!validation.isValid && (
          <p className="text-sm text-red-500 mt-2 text-center">
            {validation.errors[0]}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConfigureTab;
