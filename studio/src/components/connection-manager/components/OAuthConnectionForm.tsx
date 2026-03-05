import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthType } from "../types";

interface OAuthConnectionFormProps {
  authType: AuthType;
  integrationName?: string;
  integrationIcon?: string;
  authorizationConfig?: any;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OAuthConnectionForm({
  integrationName,
  integrationIcon,
  authorizationConfig,
  onSubmit,
  onCancel,
  isLoading,
}: OAuthConnectionFormProps) {
  const serviceName = integrationName || "this service";
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

  const handleSubmit = useCallback(async () => {
    if (!connectionName.trim()) return;
    await onSubmit(connectionName);
  }, [connectionName, onSubmit]);

  const scopes = authorizationConfig?.configs?.find(
    (c: any) => c.key === "scope"
  )?.value?.split(/[\s,]+/).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-[300px]"
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
          {integrationIcon && (
            <img
              src={integrationIcon}
              alt={serviceName}
              className="w-6 h-6 object-contain"
            />
          )}
          <h3 className="text-base font-semibold text-slate-900">
            Connect to {serviceName}
          </h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="connection-name" className="text-sm font-medium">
            Connection Name
          </Label>
          <Input
            id="connection-name"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="Enter a name for this connection"
            className="h-10"
          />
          <p className="text-xs text-slate-500">
            Give this connection a memorable name to identify it later.
          </p>
        </div>

        {scopes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Shield className="w-4 h-4" />
              Permissions Required
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <ul className="space-y-1.5">
                {scopes.slice(0, 5).map((scope: string, index: number) => (
                  <li
                    key={index}
                    className="text-xs text-slate-600 flex items-start gap-2"
                  >
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span className="break-all">{scope}</span>
                  </li>
                ))}
                {scopes.length > 5 && (
                  <li className="text-xs text-slate-400">
                    and {scopes.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
            <p className="text-xs text-slate-500">
              You&apos;ll be redirected to {serviceName} to authorize these permissions.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!connectionName.trim() || isLoading}
          className="flex-1 gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {isLoading ? "Connecting..." : `Connect ${serviceName}`}
        </Button>
      </div>
    </motion.div>
  );
}
