import React, { useMemo, useState, useCallback } from "react";
import {
  Database,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Download,
  RotateCcw,
  AlertCircle,
  Inbox,
  Shield,
  Key,
  User,
  Globe,
  Wifi,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResultSection from "./ResultSection";
import FieldValueRow from "./FieldValueRow";

const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const maskValue = (value) => {
  if (!value) return null;
  const str = String(value);
  if (str.length <= 4) return "••••";
  return str.slice(0, 2) + "••••" + str.slice(-2);
};

const ConnectionTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  connectionType = "database",
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  
  const accentColor = theme.accentColor || "#0ea5e9";
  const hasError = outputs?.error || outputs?.status === "error" || outputs?.connected === false;
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedInputs = useMemo(() => {
    return inputs?.response || inputs || {};
  }, [inputs]);

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const connectionDetails = useMemo(() => {
    return {
      host: normalizedInputs.host || normalizedInputs.hostname || normalizedInputs.server,
      port: normalizedInputs.port,
      database: normalizedInputs.database || normalizedInputs.db || normalizedInputs.databaseName,
      username: normalizedInputs.username || normalizedInputs.user,
      password: normalizedInputs.password,
      ssl: normalizedInputs.ssl || normalizedInputs.useSsl || normalizedInputs.useSSL,
      connectionString: normalizedInputs.connectionString || normalizedInputs.connection_string,
      authType: normalizedInputs.authType || normalizedInputs.auth_type,
      apiKey: normalizedInputs.apiKey || normalizedInputs.api_key,
      accessToken: normalizedInputs.accessToken || normalizedInputs.access_token,
    };
  }, [normalizedInputs]);

  const connectionStatus = useMemo(() => {
    return {
      connected: normalizedOutputs.connected ?? normalizedOutputs.success ?? !hasError,
      latency: normalizedOutputs.latency || normalizedOutputs.responseTime || normalizedOutputs.ping,
      version: normalizedOutputs.version || normalizedOutputs.serverVersion,
      database: normalizedOutputs.database || normalizedOutputs.currentDatabase,
      permissions: normalizedOutputs.permissions || [],
    };
  }, [normalizedOutputs, hasError]);

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return outputs?.error?.message || outputs?.message || outputs?.error || "Connection failed";
  }, [hasError, outputs]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        connectionDetails: {
          ...connectionDetails,
          password: connectionDetails.password ? "••••••••" : undefined,
          apiKey: connectionDetails.apiKey ? "••••••••" : undefined,
          accessToken: connectionDetails.accessToken ? "••••••••" : undefined,
        },
        status: connectionStatus,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [connectionDetails, connectionStatus, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        connectionDetails: {
          ...connectionDetails,
          password: connectionDetails.password ? "••••••••" : undefined,
          apiKey: connectionDetails.apiKey ? "••••••••" : undefined,
          accessToken: connectionDetails.accessToken ? "••••••••" : undefined,
        },
        status: connectionStatus,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `connection-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [connectionDetails, connectionStatus, timestamp]);

  const hostDisplay = connectionDetails.port 
    ? `${connectionDetails.host}:${connectionDetails.port}` 
    : connectionDetails.host;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          hasError 
            ? "bg-red-50/50 border-red-200/50" 
            : "bg-cyan-50/50 border-cyan-200/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-cyan-100"
            )}
          >
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Wifi className="w-5 h-5 text-cyan-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-cyan-700"
              )}>
                {hasError ? "Connection Failed" : "Connected Successfully"}
              </span>
              {connectionDetails.database && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/60 text-muted-foreground">
                  {connectionDetails.database}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
              {connectionStatus.latency && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wifi className="w-3 h-3" />
                  <span>{connectionStatus.latency}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleCopyAll}
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          {onRerun && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onRerun}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-test
            </Button>
          )}
        </div>
      </div>

      <ResultSection
        icon={Server}
        title="Connection Details"
        subtitle={hostDisplay}
        accentColor={accentColor}
        defaultExpanded={true}
      >
        <div className="space-y-1">
          {hostDisplay && (
            <FieldValueRow
              icon={Globe}
              label="Host"
              value={hostDisplay}
              monospace
            />
          )}
          {connectionDetails.database && (
            <FieldValueRow
              icon={Database}
              label="Database"
              value={connectionDetails.database}
            />
          )}
          {connectionDetails.username && (
            <FieldValueRow
              icon={User}
              label="Username"
              value={connectionDetails.username}
            />
          )}
          {connectionDetails.ssl !== undefined && (
            <FieldValueRow
              icon={Lock}
              label="SSL"
              value={connectionDetails.ssl ? "Enabled" : "Disabled"}
            />
          )}
        </div>
      </ResultSection>

      {(connectionDetails.password || connectionDetails.apiKey || connectionDetails.accessToken) && (
        <ResultSection
          icon={Shield}
          title="Credentials"
          accentColor="#f59e0b"
          defaultExpanded={false}
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowSecrets(!showSecrets);
              }}
            >
              {showSecrets ? "Hide" : "Show"}
            </Button>
          }
        >
          <div className="space-y-1">
            {connectionDetails.password && (
              <FieldValueRow
                icon={Key}
                label="Password"
                value={showSecrets ? connectionDetails.password : maskValue(connectionDetails.password)}
                copyable={showSecrets}
              />
            )}
            {connectionDetails.apiKey && (
              <FieldValueRow
                icon={Key}
                label="API Key"
                value={showSecrets ? connectionDetails.apiKey : maskValue(connectionDetails.apiKey)}
                copyable={showSecrets}
              />
            )}
            {connectionDetails.accessToken && (
              <FieldValueRow
                icon={Key}
                label="Access Token"
                value={showSecrets ? connectionDetails.accessToken : maskValue(connectionDetails.accessToken)}
                copyable={showSecrets}
              />
            )}
          </div>
        </ResultSection>
      )}

      {hasError ? (
        <ResultSection
          icon={AlertCircle}
          title="Error Details"
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 mb-1">
                Connection Failed
              </p>
              <p className="text-sm text-red-600 break-words">
                {errorMessage}
              </p>
              <div className="mt-3 text-xs text-red-600/80">
                <p className="font-medium mb-1">Troubleshooting tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Verify the host and port are correct</li>
                  <li>Check if the database server is running</li>
                  <li>Ensure credentials are valid</li>
                  <li>Check network/firewall settings</li>
                </ul>
              </div>
            </div>
          </div>
        </ResultSection>
      ) : (
        <ResultSection
          icon={CheckCircle2}
          title="Connection Status"
          accentColor="#10b981"
          variant="success"
          defaultExpanded={true}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Connection Established
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Successfully connected to {connectionDetails.database || "the server"}
                </p>
              </div>
            </div>

            {(connectionStatus.version || connectionStatus.latency || connectionStatus.permissions.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {connectionStatus.version && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Server Version</p>
                    <p className="text-sm font-mono text-foreground">{connectionStatus.version}</p>
                  </div>
                )}
                {connectionStatus.latency && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Latency</p>
                    <p className="text-sm font-mono text-foreground">{connectionStatus.latency}ms</p>
                  </div>
                )}
                {connectionStatus.database && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Current Database</p>
                    <p className="text-sm font-mono text-foreground">{connectionStatus.database}</p>
                  </div>
                )}
              </div>
            )}

            {connectionStatus.permissions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {connectionStatus.permissions.map((perm, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-md"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ResultSection>
      )}
    </div>
  );
};

export default ConnectionTestResult;
