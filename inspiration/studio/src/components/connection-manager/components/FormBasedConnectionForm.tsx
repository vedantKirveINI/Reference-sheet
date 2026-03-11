import { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthType } from "../types";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import { canvasSDKServices } from "@/components/canvas/services/canvasSDKServices";
import { Mode, ViewPort } from "@src/module/constants";

const DEFAULT_THEME = {
  name: "Default Theme",
  styles: {
    fontFamily: "Helvetica Neue",
    questionSize: "M",
    buttonCorners: "rounded",
    textAlignment: "center",
    questions: "#263238",
    description: "#263238",
    answer: "#263238",
    buttons: "#000000",
    buttonText: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
  },
};

interface FormBasedConnectionFormProps {
  authType: AuthType;
  integrationName?: string;
  authorizationConfig?: {
    authorization_type?: string;
    authorization_id?: string;
    configs?: Array<{ key: string; value: any }>;
    [key: string]: any;
  };
  resourceIds?: {
    _id?: string;
    parentId?: string;
    projectId?: string;
    workspaceId?: string;
    assetId?: string;
    canvasId?: string;
  };
  onSubmit: (name: string, credentials: Record<string, string>) => Promise<void>;
  onSubmitCustom?: (name: string, formData: { state: Record<string, any>; flow: any }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function getConfigObjectByKey(configs: Array<{ key: string; value: any }> | undefined, key: string): any {
  if (!configs || !key) return null;
  const config = configs.find((c) => c?.key === key);
  return config?.value ?? null;
}

function getFormID(authorizationConfig: FormBasedConnectionFormProps["authorizationConfig"]): string | null {
  if (!authorizationConfig) return null;
  const authType = authorizationConfig.authorization_type;
  const configs = authorizationConfig.configs;

  if (authType === "custom") {
    return getConfigObjectByKey(configs, "form_id");
  }

  return null;
}

interface DynamicAuthFormProps {
  formId: string;
  resourceIds?: FormBasedConnectionFormProps["resourceIds"];
  onSubmit: (answers: Record<string, any>, flowData: any) => void;
}

const DynamicAuthForm = forwardRef<{ onSubmit: () => Promise<void> }, DynamicAuthFormProps>(
  ({ formId, resourceIds, onSubmit }, ref) => {
    const fillerRef = useRef<any>();
    const [flow, setFlow] = useState<Record<string, any>>({});
    const [result, setResult] = useState<any>({});
    const [taskGraph, setTaskGraph] = useState<any[]>([]);
    const [formResourceIds, setFormResourceIds] = useState({
      assetId: formId,
      projectId: resourceIds?.projectId || "",
      workspaceId: resourceIds?.workspaceId || "",
      parentId: resourceIds?.parentId || "",
      canvasId: "",
      _id: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isFormLoaded = Object.keys(flow).length > 0;

    useEffect(() => {
      const fetchForm = async () => {
        if (!formId) {
          setError("Form is not configured for this authorization");
          setIsLoading(false);
          return;
        }

        try {
          const response = await canvasSDKServices.getPublishedByAsset({
            asset_id: formId,
          });
          
          const { result: fetchedResult, result: { flow: fetchedFlow = {}, task_graph = [] } = {} } = response || {};
          const canvasId = fetchedResult?.canvas_id;
          
          setFormResourceIds((prev) => ({
            ...prev,
            canvasId: canvasId || "",
          }));
          setResult(fetchedResult);
          setFlow(fetchedFlow);
          setTaskGraph(task_graph);
          setIsLoading(false);
        } catch (err) {
          console.error("[DynamicAuthForm] Failed to fetch form:", err);
          setError("Failed to load authorization form");
          setIsLoading(false);
        }
      };

      fetchForm();
    }, [formId]);

    useImperativeHandle(ref, () => ({
      onSubmit: async () => {
        if (fillerRef.current?.onSubmit) {
          await fillerRef.current.onSubmit();
        }
      },
    }), []);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-slate-500">
          Loading authorization form...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8 text-red-500">
          {error}
        </div>
      );
    }

    if (!isFormLoaded) {
      return (
        <div className="flex items-center justify-center py-8 text-slate-500">
          No form configuration found
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto" style={{ fontSize: "12px" }}>
        <QuestionFiller
          ref={fillerRef}
          key="custom-auth-form"
          mode={Mode.CLASSIC}
          taskGraph={taskGraph}
          questions={flow}
          viewPort={ViewPort.MOBILE}
          variables={{}}
          resourceIds={formResourceIds}
          showFooter={false}
          hideQuestionIndex={true}
          theme={DEFAULT_THEME}
          onSuccess={async (answers: Record<string, any>) => {
            onSubmit(answers, { ...result, id: result?._id });
          }}
          showEndingScreen={false}
        />
      </div>
    );
  }
);

DynamicAuthForm.displayName = "DynamicAuthForm";

export function FormBasedConnectionForm({
  authType,
  integrationName,
  authorizationConfig,
  resourceIds,
  onSubmit,
  onSubmitCustom,
  onCancel,
  isLoading,
}: FormBasedConnectionFormProps) {
  const serviceName = integrationName || "this service";
  const dynamicFormRef = useRef<{ onSubmit: () => Promise<void> } | null>(null);
  
  const [connectionName, setConnectionName] = useState(() => {
    const now = new Date();
    const timestamp = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${serviceName} - ${timestamp}`;
  });

  const [credentials, setCredentials] = useState<Record<string, string>>({
    apiKey: "",
    username: "",
    password: "",
  });

  const updateCredential = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!connectionName.trim()) return;
    
    if (authType === "custom" && dynamicFormRef.current) {
      await dynamicFormRef.current.onSubmit();
    } else {
      await onSubmit(connectionName, credentials);
    }
  }, [connectionName, credentials, onSubmit, authType]);

  const handleCustomFormSubmit = useCallback(async (answers: Record<string, any>, flowData: any) => {
    if (onSubmitCustom) {
      await onSubmitCustom(connectionName, { state: answers, flow: flowData });
    }
  }, [connectionName, onSubmitCustom]);

  const getTitle = () => {
    switch (authType) {
      case "api-key":
        return `Add ${serviceName} API Key`;
      case "basic":
        return `Connect to ${serviceName}`;
      case "custom":
        return `Configure ${serviceName}`;
      default:
        return `Configure ${serviceName}`;
    }
  };

  const getIcon = () => {
    if (authType === "custom") {
      return <Settings className="w-5 h-5 text-slate-600" />;
    }
    return <Key className="w-5 h-5 text-slate-600" />;
  };

  const isFormValid = () => {
    if (!connectionName.trim()) return false;
    if (authType === "api-key") return !!credentials.apiKey.trim();
    if (authType === "basic") return !!credentials.username.trim() && !!credentials.password.trim();
    if (authType === "custom") return true;
    return true;
  };

  const formId = authType === "custom" ? getFormID(authorizationConfig) : null;

  console.log("[DEBUG FormBasedConnectionForm] Rendering with:", {
    authType,
    formId,
    authorizationConfig,
    resourceIds,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-base font-semibold text-slate-900">
            {getTitle()}
          </h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-hidden">
        <div className="space-y-2 flex-shrink-0">
          <Label htmlFor="connection-name" className="text-sm font-medium">
            Connection Name<span className="text-red-500">*</span>
          </Label>
          <Input
            id="connection-name"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="Enter a name for this connection"
            className="h-10"
          />
        </div>

        {authType === "api-key" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              API Key<span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              value={credentials.apiKey}
              onChange={(e) => updateCredential("apiKey", e.target.value)}
              placeholder="Enter your API key"
              className="h-10 font-mono"
            />
            <p className="text-xs text-slate-500">
              Your API key will be stored securely and used for authentication.
            </p>
          </div>
        )}

        {authType === "basic" && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Username<span className="text-red-500">*</span>
              </Label>
              <Input
                value={credentials.username}
                onChange={(e) => updateCredential("username", e.target.value)}
                placeholder="Enter username"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Password<span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => updateCredential("password", e.target.value)}
                placeholder="Enter password"
                className="h-10"
              />
            </div>
          </>
        )}

        {authType === "custom" && formId && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <DynamicAuthForm
              ref={dynamicFormRef}
              formId={formId}
              resourceIds={resourceIds}
              onSubmit={handleCustomFormSubmit}
            />
          </div>
        )}

        {authType === "custom" && !formId && (
          <div className="flex items-center justify-center py-8 text-amber-600 text-sm">
            Custom authorization form is not configured for this integration.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto flex-shrink-0">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || isLoading}
          className="flex-1"
        >
          {isLoading ? "Saving..." : "Save Connection"}
        </Button>
      </div>
    </motion.div>
  );
}
