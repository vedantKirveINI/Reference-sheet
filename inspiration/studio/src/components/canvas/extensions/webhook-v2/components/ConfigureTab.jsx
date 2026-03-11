import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Link, Shield, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { HTTP_METHODS, RESPONSE_TYPES } from "../constants";
import { toast } from "sonner";

const ConfigureTab = ({ state, variables, webhookUrl }) => {
  const { updateState, validation } = state;

  const displayUrl = webhookUrl || state.webhookUrl || "https://your-webhook-url.com/webhook/abc123";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Link className="w-4 h-4" />
          Webhook URL
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 truncate">
            {displayUrl}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyUrl}
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Send requests to this URL to trigger your workflow
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Accepted HTTP Method</Label>
        <div className="flex gap-2 flex-wrap">
          {Object.values(HTTP_METHODS).map((method) => (
            <button
              key={method}
              onClick={() => updateState({ method })}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                state.method === method
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              )}
            >
              {method}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          {state.method === "ANY"
            ? "Accept requests with any HTTP method"
            : `Only accept ${state.method} requests`}
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <FileJson className="w-4 h-4" />
          Expected Payload Schema
        </Label>
        <Textarea
          value={JSON.stringify(state.expectedSchema, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateState({ expectedSchema: parsed });
            } catch {
            }
          }}
          placeholder='{"type": "object", "properties": {}}'
          className="min-h-[7.5rem] font-mono text-sm"
        />
        <p className="text-sm text-gray-500">
          Define the expected structure of incoming requests for documentation
        </p>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="font-medium text-gray-900">Response Configuration</h3>

        <div className="space-y-3">
          <Label className="text-sm text-gray-700">Response Type</Label>
          <Select
            value={state.responseType}
            onValueChange={(value) => updateState({ responseType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select response type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RESPONSE_TYPES).map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm text-gray-700">Response Status Code</Label>
          <Input
            type="number"
            value={state.responseStatus || 200}
            onChange={(e) => updateState({ responseStatus: parseInt(e.target.value, 10) })}
            min={100}
            max={599}
            className="w-32"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm text-gray-700">Response Body</Label>
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder='{"success": true}'
            value={state.responseBody || ""}
            onChange={(val) => updateState({ responseBody: val })}
            slotProps={{
              container: {
                className: "min-h-[5rem] rounded-xl border border-gray-300 bg-white",
              },
            }}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Signature Verification
            </Label>
            <p className="text-sm text-gray-500">
              Verify incoming requests using a signature header
            </p>
          </div>
          <Switch
            checked={state.verifySignature || false}
            onCheckedChange={(checked) => updateState({ verifySignature: checked })}
          />
        </div>

        {state.verifySignature && (
          <div className="space-y-4 pl-4 border-l-2 border-[#8B5CF6]/20">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Signature Header</Label>
              <Input
                value={state.signatureHeader || ""}
                onChange={(e) => updateState({ signatureHeader: e.target.value })}
                placeholder="e.g., X-Signature, X-Hub-Signature-256"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">
                Signature Secret<span className="text-red-500">*</span>
              </Label>
              <FormulaBar
                value={state.signatureSecret || ""}
                onChange={(val) => updateState({ signatureSecret: val })}
                placeholder="Enter your webhook secret"
                variables={variables}
                size="small"
                hideIcon
              />
              {!validation.isValid && state.verifySignature && !state.signatureSecret && (
                <p className="text-sm text-red-500">Signature secret is required</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureTab;
