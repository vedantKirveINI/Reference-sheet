import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Database, Terminal, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DatabaseConnectionConfig } from "../types";
import { parseConnectionString, buildConnectionString } from "../utils/parse-connection-string";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../config/databaseConfig";
import type { DatabaseType } from "../config/databaseConfig";
import DBRenderField from "./DBRenderField";

type TestConnectionStatus = "idle" | "testing" | "success" | "error";

interface TestConnectionResult {
  status: TestConnectionStatus;
  message?: string;
}

interface DatabaseConnectionFormProps {
  integrationName?: string;
  databaseType?: DatabaseType | string;
  onSubmit: (config: DatabaseConnectionConfig) => Promise<void>;
  onTestConnection?: (config: DatabaseConnectionConfig) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
  initialConfig?: Partial<DatabaseConnectionConfig>;
  ctaText?: string;
}

type InputMode = "form" | "connection-string";

export function DatabaseConnectionForm({
  integrationName,
  databaseType = DATABASE_TYPES.POSTGRESQL,
  onSubmit,
  onTestConnection,
  onCancel,
  isLoading,
  initialConfig,
  ctaText
}: DatabaseConnectionFormProps) {
  // Get database configuration based on databaseType
  const dbConfig = useMemo(() => {
    const type = databaseType as DatabaseType;
    return DATABASE_CONFIGS[type] || DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL];
  }, [databaseType]);

  const serviceName = integrationName || dbConfig.name;

  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [connectionString, setConnectionString] = useState("");
  const [parseResult, setParseResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [testResult, setTestResult] = useState<TestConnectionResult>({ status: "idle" });

  const [config, setConfig] = useState<DatabaseConnectionConfig>({
    connectionName: initialConfig?.connectionName || `${serviceName} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    host: initialConfig?.host || "",
    port: initialConfig?.port || String(dbConfig.defaultPort),
    databaseName: initialConfig?.databaseName || "",
    schema: dbConfig.supportsSchema
      ? (initialConfig?.schema || dbConfig.defaultSchema || "public")
      : undefined,
    username: initialConfig?.username || "",
    password: initialConfig?.password || "",
    useSSHTunnel: initialConfig?.useSSHTunnel || false,
    sshHost: initialConfig?.sshHost || "",
    sshPort: initialConfig?.sshPort || "22",
    sshUsername: initialConfig?.sshUsername || "",
    sshPrivateKey: initialConfig?.sshPrivateKey || "",
  });


  const updateField = <K extends keyof DatabaseConnectionConfig>(
    field: K,
    value: DatabaseConnectionConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (testResult.status !== "idle") {
      setTestResult({ status: "idle" });
    }
  };

  const handleTestConnection = useCallback(async () => {
    if (!onTestConnection) return;

    setTestResult({ status: "testing" });
    try {
      const result = await onTestConnection(config);
      if (result.success) {
        setTestResult({ status: "success", message: result.message || "Connection successful!" });
      } else {
        setTestResult({ status: "error", message: result.message || "Connection failed" });
      }
    } catch (error: any) {
      setTestResult({
        status: "error",
        message: error?.message || "Connection test failed"
      });
    }
  }, [config, onTestConnection]);

  useEffect(() => {
    if (inputMode === "connection-string" && connectionString) {
      const result = parseConnectionString(connectionString);
      setParseResult(result);
      if (result.isValid) {
        setConfig((prev) => ({
          ...prev,
          ...result.config,
        }));
      }
    } else {
      setParseResult(null);
    }
  }, [connectionString, inputMode]);

  useEffect(() => {
    if (inputMode === "form" && config.host && config.databaseName) {
      const connStr = buildConnectionString(config, databaseType as "mysql" | "postgres");
      setConnectionString(connStr);
    }
  }, [config.host, config.port, config.databaseName, config.username, config.password, config.schema, inputMode]);

  const handleSubmit = useCallback(async () => {
    if (!config.connectionName.trim() || !config.host.trim() || !config.databaseName.trim()) {
      return;
    }
    await onSubmit(config);
  }, [config, onSubmit]);

  const isFormValid = useMemo(() => {
    const baseValid = config.connectionName.trim() && config.host.trim() &&
      config.databaseName.trim() &&
      config.username.trim();

    // Schema is required only for PostgreSQL
    if (dbConfig.supportsSchema) {
      return baseValid && (config.schema?.trim() || false);
    }

    return baseValid;
  }, [config, dbConfig.supportsSchema]);
  const canTestConnection = config.host.trim() && config.databaseName.trim() && config.username.trim() && config.password.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Add {serviceName} Connection
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="connection-name" className="text-sm font-medium">
              Connection Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="connection-name"
              value={config.connectionName}
              onChange={(e) => updateField("connectionName", e.target.value)}
              placeholder="My Production Database"
              className="h-10"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setInputMode("form")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                inputMode === "form"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Database className="w-4 h-4" />
              Fill in details
            </button>
            <button
              type="button"
              onClick={() => setInputMode("connection-string")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                inputMode === "connection-string"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Terminal className="w-4 h-4" />
              Paste connection string
            </button>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === "connection-string" ? (
              <motion.div
                key="connection-string"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium">
                  Connection String
                </Label>
                <Textarea
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder={dbConfig.connectionString}
                  className="font-mono text-sm min-h-[80px]"
                />
                {parseResult && (
                  <div
                    className={cn(
                      "flex items-center gap-2 text-xs p-2 rounded-md",
                      parseResult.isValid
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {parseResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Parsed: {config.host}
                          {config.port && `:${config.port}`} / {config.databaseName}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{parseResult.error}</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form-fields"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-x-5 gap-y-4"
              >
                {dbConfig.formConfig.map((field) => (
                  <DBRenderField
                    key={field.key}
                    fieldConfig={field}
                    config={config}
                    updateField={updateField}
                  />
                ))}
                {/* <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Host<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.host}
                      onChange={(e) => updateField("host", e.target.value)}
                      placeholder="localhost or db.example.com"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Port<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.port}
                      onChange={(e) => updateField("port", e.target.value)}
                      placeholder={String(dbConfig.defaultPort)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className={cn("grid gap-3", dbConfig.supportsSchema ? "grid-cols-2" : "grid-cols-1")}>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Database Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.databaseName}
                      onChange={(e) => updateField("databaseName", e.target.value)}
                      placeholder="my_database"
                      className="h-10"
                    />
                  </div>
                  {dbConfig.supportsSchema && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Schema<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={config.schema || ""}
                        onChange={(e) => updateField("schema", e.target.value)}
                        placeholder={dbConfig.defaultSchema || "public"}
                        className="h-10"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Username<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      placeholder="db_user"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      type="password"
                      value={config.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="••••••••"
                      className="h-10"
                    />
                  </div>
                </div> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* <Collapsible open={sshExpanded} onOpenChange={setSshExpanded}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full py-3 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    SSH Tunnel (Bastion Host)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={config.useSSHTunnel}
                    onCheckedChange={(checked) => {
                      updateField("useSSHTunnel", checked);
                      if (checked) setSshExpanded(true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform",
                      sshExpanded && "rotate-180"
                    )}
                  />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SSH Host</Label>
                    <Input
                      value={config.sshHost}
                      onChange={(e) => updateField("sshHost", e.target.value)}
                      placeholder="bastion.example.com"
                      className="h-10 bg-white"
                      disabled={!config.useSSHTunnel}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SSH Port</Label>
                    <Input
                      value={config.sshPort}
                      onChange={(e) => updateField("sshPort", e.target.value)}
                      placeholder="22"
                      className="h-10 bg-white"
                      disabled={!config.useSSHTunnel}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">SSH Username</Label>
                  <Input
                    value={config.sshUsername}
                    onChange={(e) => updateField("sshUsername", e.target.value)}
                    placeholder="ubuntu"
                    className="h-10 bg-white"
                    disabled={!config.useSSHTunnel}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Private Key (PEM)</Label>
                  <Textarea
                    value={config.sshPrivateKey}
                    onChange={(e) => updateField("sshPrivateKey", e.target.value)}
                    placeholder="-----BEGIN RSA PRIVATE KEY-----"
                    className="font-mono text-xs min-h-[100px] bg-white"
                    disabled={!config.useSSHTunnel}
                  />
                </div>
              </motion.div>
            </CollapsibleContent>
          </Collapsible> */}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 shrink-0 space-y-3">
        <AnimatePresence mode="wait">
          {testResult.status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                testResult.status === "testing" && "bg-blue-50 text-blue-700",
                testResult.status === "success" && "bg-green-50 text-green-700",
                testResult.status === "error" && "bg-red-50 text-red-700"
              )}
            >
              {testResult.status === "testing" && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testing connection...</span>
                </>
              )}
              {testResult.status === "success" && (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{testResult.message}</span>
                </>
              )}
              {testResult.status === "error" && (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>{testResult.message}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Discard
          </Button>
          {onTestConnection && (
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!canTestConnection || isLoading || testResult.status === "testing"}
              className="flex-1"
            >
              {testResult.status === "testing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading || testResult.status === "testing"}
            className="flex-1"
          >
            {isLoading ? "Saving..." : ctaText || "Save Connection"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
