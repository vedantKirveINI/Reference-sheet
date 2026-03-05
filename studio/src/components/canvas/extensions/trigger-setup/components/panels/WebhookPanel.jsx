import React, { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InputGridV3 from "@src/module/input-grid-v3";
import { icons } from "@/components/icons";
import hookNRunServices from "@src/components/canvas/services/hookAndRunServices";
import {
  convertJsonToFields,
  convertFieldsToJson,
  normalizeType,
  createFxValue,
  generateId,
} from "@src/module/input-grid-v3/input-grid/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const POLLING_TIMEOUT_MS = 30000;
const POLLING_INTERVAL_MS = 5000;
const CURL_DEBOUNCE_MS = 400;

function normalizeAllowedIps(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return "";
}

function parseAllowedIpsString(value) {
  const str = normalizeAllowedIps(value);
  if (!str.trim()) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
function isValidIPv4(ip) {
  return typeof ip === "string" && IPV4_REGEX.test(ip.trim());
}

/**
 * Get the top-level fields array from inputs for convertFieldsToJson.
 * Handles both unwrapped (from capture) and wrapped (from grid) formats.
 */
function getFieldsForJson(inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0) return [];
  const first = inputs[0];
  const isWrappedRoot =
    first?.key === "" &&
    (first?.type === "Object" || first?.type === "Array") &&
    Array.isArray(first?.schema);
  return isWrappedRoot ? first.schema : inputs;
}

/**
 * Build a sample CURL string from webhook URL and current data structure (inputs).
 */
function buildCurlFromInputs(url, inputs) {
  if (!url || url.startsWith("Click ")) return null;
  const fields = getFieldsForJson(inputs);
  if (fields.length === 0) return null;
  try {
    const sampleJson = convertFieldsToJson(fields, false);
    const jsonStr = JSON.stringify(sampleJson);
    const escaped = jsonStr.replace(/'/g, "'\\''");
    return `curl -L -X POST ${url} -H 'Content-Type: application/json' -d '${escaped}'`;
  } catch {
    return null;
  }
}

/**
 * Migrate legacy webhook inputs (canvas-utils shape: config, valueStr, lowercase types)
 * to InputGridV3 FieldData shape (schema, default, DataType).
 */
function migrateLegacyInputs(inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0) return inputs;
  return inputs.map((item) => {
    const type = normalizeType(item.type);
    const hasLegacyConfig = Array.isArray(item.config) && !item.schema;
    const schema = hasLegacyConfig
      ? migrateLegacyInputs(item.config)
      : item.schema;
    const isPrimitive = type !== "Object" && type !== "Array";
    const valueStr = item.valueStr ?? (item.value?.blocks?.[0]?.value ?? "");
    const defaultVal =
      item.default ?? (isPrimitive && valueStr !== undefined ? createFxValue(String(valueStr)) : undefined);
    return {
      ...item,
      id: item.id || generateId(),
      type,
      ...(schema !== undefined && { schema }),
      ...(defaultVal !== undefined && { default: defaultVal }),
    };
  });
}

const WebhookPanel = ({ state, variables, webhookUrl, assetId }) => {
  const { updateState, webhookName, allowed_ips, webhookData, inputs } = state;

  const [polling, setPolling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [newIpInput, setNewIpInput] = useState("");
  const [ipError, setIpError] = useState("");
  const [derivedCurl, setDerivedCurl] = useState(null);
  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);
  const curlDebounceRef = useRef(null);

  const allowedIpsList = parseAllowedIpsString(allowed_ips);
  const displayUrl =
    webhookData?.webhook_url ??
    webhookUrl ??
    state.webhookUrl ??
    "Click Generate Webhook URL to create a webhook";

  const handleCopyUrl = () => {
    if (!displayUrl || displayUrl.startsWith("Click ")) return;
    navigator.clipboard.writeText(displayUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  const displayCurl = derivedCurl ?? webhookData?.curl ?? null;

  const handleCopyCurl = () => {
    const toCopy = displayCurl;
    if (!toCopy) return;
    navigator.clipboard.writeText(toCopy);
    toast.success("CURL copied to clipboard");
  };

  const beginPolling = useCallback(
    (uuid) => {
      if (!uuid) return;
      setPolling(true);
      const start = new Date();
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await hookNRunServices.getQueueByStart({
            start,
            "meta.uuid": uuid,
          });
          if (response?.status === "success" && response?.result?.length > 0) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            setPolling(false);
            const first = response.result[0];
            const rawPayload = first?.details || {};
            const fields = convertJsonToFields(rawPayload, false);
            const inputsToSet = fields || [];
            updateState({ inputs: inputsToSet });
            return;
          }
        } catch (err) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
          setPolling(false);
          toast.error(err?.message || "Failed to get data structure");
        }
      }, POLLING_INTERVAL_MS);
      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setPolling(false);
        toast.error(
          `Timeout: No response received within ${POLLING_TIMEOUT_MS / 1000} seconds`,
        );
      }, POLLING_TIMEOUT_MS);
    },
    [updateState],
  );

  const createWebhook = useCallback(
    async (ips) => {
      if (!assetId) {
        toast.error(
          "Asset ID is required to generate webhook. Save the workflow first and try again.",
        );
        return;
      }
      setGenerating(true);
      try {
        const allowedIpsForApi = normalizeAllowedIps(ips ?? allowed_ips);
        const payload = {
          watch_enabled: true,
          published_asset_id: assetId,
          event_src: "CUSTOM",
          event_type: "CUSTOM_WATCHER",
          name: webhookName || "My webhook",
          allowed_ips: allowedIpsForApi,
        };
        const response = await hookNRunServices.generateWebhookUrl(payload);
        if (response?.status === "success" && response?.result) {
          updateState({ webhookData: response.result });
          beginPolling(response.result.uuid);
          toast.success("Webhook URL generated");
        } else {
          const apiMessage =
            response?.result?.message ||
            response?.result?.error ||
            response?.message;
          toast.error(apiMessage || "Failed to generate webhook URL");
        }
      } catch (err) {
        const apiMessage =
          err?.result?.message || err?.result?.error || err?.message;
        toast.error(apiMessage || "Failed to generate webhook URL");
      } finally {
        setGenerating(false);
      }
    },
    [assetId, webhookName, allowed_ips, updateState, beginPolling],
  );

  const handleGenerateClick = useCallback(() => {
    createWebhook(allowed_ips);
  }, [createWebhook, allowed_ips]);

  const handleRefreshClick = useCallback(() => {
    setIsRotating(true);
    createWebhook(allowed_ips);
    setTimeout(() => setIsRotating(false), 1000);
  }, [createWebhook, allowed_ips]);

  const handleStopPolling = useCallback(() => {
    setPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const handleRedetermine = useCallback(() => {
    if (polling) {
      handleStopPolling();
      return;
    }
    if (!webhookData?.uuid) {
      toast.error("Please create webhook URL first.");
      return;
    }
    beginPolling(webhookData.uuid);
  }, [polling, webhookData?.uuid, beginPolling, handleStopPolling]);

  const handleAddIp = useCallback(() => {
    const ip = newIpInput.trim();
    setIpError("");
    if (!ip) return;
    if (!isValidIPv4(ip)) {
      toast.error("Enter a valid IPv4 address (e.g. 192.168.1.1)");
      return;
    }
    if (allowedIpsList.includes(ip)) {
      setIpError("This IP address has already been added.");
      return;
    }
    const next = [...allowedIpsList, ip];
    updateState({ allowed_ips: next.join(", ") });
    setNewIpInput("");
  }, [newIpInput, allowedIpsList, updateState]);

  const handleRemoveIp = useCallback(
    (index) => {
      const next = allowedIpsList.filter((_, i) => i !== index);
      updateState({ allowed_ips: next.join(", ") });
    },
    [allowedIpsList, updateState],
  );

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  // Debounced update of sample CURL whenever data structure (inputs) or URL changes
  useEffect(() => {
    if (curlDebounceRef.current) clearTimeout(curlDebounceRef.current);
    curlDebounceRef.current = setTimeout(() => {
      curlDebounceRef.current = null;
      const url = displayUrl?.startsWith("Click ") ? null : displayUrl;
      if (!url) {
        setDerivedCurl(null);
        return;
      }
      const hasInputs = Array.isArray(inputs) && inputs.length > 0;
      if (!hasInputs) {
        setDerivedCurl(null);
        return;
      }
      const curl = buildCurlFromInputs(url, inputs);
      setDerivedCurl(curl);
    }, CURL_DEBOUNCE_MS);
    return () => {
      if (curlDebounceRef.current) clearTimeout(curlDebounceRef.current);
    };
  }, [inputs, displayUrl]);

  const hasGeneratedUrl = !!webhookData?.curl || !!webhookData?.webhook_url;
  const InfoIcon = icons.info ?? icons.helpCircle;
  const ChevronDownIcon = icons.chevronDown;

  return (
    <div className="min-w-0 p-1 max-w-full overflow-hidden space-y-6">
      <Collapsible defaultOpen={false} className="min-w-0 max-w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between rounded-lg px-4 py-3 h-auto font-medium text-left"
          >
            <span className="flex items-center gap-2">
              {InfoIcon && (
                <InfoIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              How the webhook trigger works
            </span>
            {ChevronDownIcon && (
              <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-70" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Alert className="mt-2 rounded-lg border-border">
            <AlertTitle className="text-sm font-medium">
              Using this trigger
            </AlertTitle>
            <AlertDescription asChild>
              <div className="mt-1 space-y-2 text-sm text-muted-foreground">
                <p>
                  This trigger runs your workflow when another app or service
                  sends an HTTP POST request to your webhook URL.
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Generate the webhook URL below and copy it into your app or
                    service.
                  </li>
                  <li>
                    When your app sends a POST request to that URL, this
                    workflow runs.
                  </li>
                  <li>
                    You can restrict which IPs can call the URL (Allowed IPs).
                    Leave empty to allow any IP.
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="min-w-0 space-y-2">
          <Label className="text-sm font-medium capitalize">Webhook Name</Label>
          <Input
            data-testid="webhook-name"
            value={webhookName ?? ""}
            onChange={(e) => updateState({ webhookName: e.target.value })}
            placeholder="My webhook"
            className="w-full min-w-0 max-w-full h-10"
          />
        </div>
        {!hasGeneratedUrl ? (
          <Button
            data-testid="create-webhook"
            disabled={!webhookName?.trim() || generating}
            onClick={handleGenerateClick}
            className="h-10 shrink-0"
          >
            {generating ? "Generating…" : "Generate Webhook URL"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            data-testid="refresh-webhook"
            disabled={!webhookName?.trim() || generating}
            onClick={handleRefreshClick}
            className={cn("shrink-0 h-10 w-10", isRotating && "animate-spin")}
            title="Refresh Webhook URL"
          >
            {icons.refreshCw && <icons.refreshCw className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <Label className="text-sm font-medium capitalize">Allowed IPs</Label>
        <p className="text-xs text-muted-foreground">
          Add IPs that are allowed to call this webhook. Leave empty to allow
          all.
        </p>
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 gap-2 items-center h-10">
            <Input
              data-testid="ip-restrictions-field"
              value={newIpInput}
              onChange={(e) => {
                setNewIpInput(e.target.value);
                setIpError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIp();
                }
              }}
              placeholder="e.g. 192.168.1.1"
              className={cn(
                "max-w-xs font-mono text-sm h-10",
                ipError && "border-destructive focus-visible:ring-destructive",
              )}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddIp}
              className="h-10 shrink-0"
            >
              Add IP
            </Button>
          </div>
          {ipError && (
            <p className="text-xs text-destructive" role="alert">
              {ipError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          {allowedIpsList.map((ip, index) => (
            <Badge
              key={`${ip}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 font-mono text-xs py-1.5 pr-1"
            >
              {ip}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${ip}`}
                className="h-5 w-5 min-w-5 p-0 rounded hover:opacity-80"
                onClick={() => handleRemoveIp(index)}
              >
                {icons.x && <icons.x className="h-3 w-3" />}
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <Label className="text-sm font-medium">Webhook URL</Label>
        <p className="text-xs text-muted-foreground">
          Use this URL in your app or service to send POST requests and trigger
          this workflow.
        </p>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <pre className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border bg-muted/30 py-2 px-3 font-mono text-sm break-all whitespace-pre-wrap">
            {displayUrl}
          </pre>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyUrl}
            className="shrink-0 h-9 w-9"
            disabled={!displayUrl || displayUrl.startsWith("Click ")}
            title="Copy URL"
          >
            {icons.copy && <icons.copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {displayCurl && (
        <div className="min-w-0 space-y-1">
          <Label className="text-sm font-medium">Sample CURL</Label>
          <p className="text-xs text-muted-foreground">
            Copy and run in your terminal to send a test POST.
          </p>
          <div className="flex min-w-0 gap-2 overflow-hidden">
            <ScrollArea className="min-h-[6rem] max-h-40 w-full rounded-md border border-border bg-muted/30">
              <pre className="py-2 px-3 font-mono text-sm whitespace-pre-wrap break-all">
                {displayCurl}
              </pre>
            </ScrollArea>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCurl}
              className="shrink-0 h-9 w-9"
              title="Copy CURL"
            >
              {icons.copy && <icons.copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {webhookData?.uuid && (
        <div className="min-w-0 max-w-full overflow-hidden space-y-3">
          {polling && (
            <div className="flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/30 py-2 px-3">
              {icons.loader2 && (
                <icons.loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              )}
              <p className="min-w-0 flex-1 break-words text-sm text-muted-foreground">
                Tinycommand is now listening for the data and will determine the
                data structure from the incoming data automatically. To initiate
                this, please send your data sample to the webhook address
                displayed above.
              </p>
            </div>
          )}
          {!polling && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data structure</Label>
              {(!inputs || !Array.isArray(inputs) || inputs.length === 0) && (
                <p className="text-xs text-muted-foreground">
                  No fields detected. Send a request to the webhook or add
                  fields below.
                </p>
              )}
              <InputGridV3
                initialValue={Array.isArray(inputs) ? migrateLegacyInputs(inputs) : []}
                onGridDataChange={(data) => {
                  const nextInputs =
                    data?.value ?? data?.schema ?? data ?? [];
                  updateState({ inputs: nextInputs });
                }}
                isValueMode={false}
                hideHeaderAndMap
                showNote={false}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant={polling ? "destructive" : "outline"}
              data-testid={polling ? "stop-button" : "redetermine-data-button"}
              onClick={handleRedetermine}
            >
              {polling ? "Stop" : "Redetermine data structure"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookPanel;
