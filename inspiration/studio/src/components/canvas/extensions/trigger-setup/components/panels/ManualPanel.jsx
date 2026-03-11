import React from "react";
import { Play, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import InputGridV3 from "@src/module/input-grid-v3";

const ManualPanel = ({ state, variables }) => {
  const { inputSchema, setInputSchema } = state;

  const handleSchemaChange = (data) => {
    setInputSchema(data?.value || data?.schema || data || []);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">
            When to use Manual Trigger
          </Label>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2 ml-6">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>Testing workflows before deploying automated triggers</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>One-time or ad-hoc data processing tasks</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>Workflows called from external systems via API</span>
          </li>
        </ul>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <Label className="text-sm font-medium">Input Schema (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Define the expected input parameters for this workflow. These will be
          available as variables in subsequent nodes.
        </p>
        <InputGridV3
          initialValue={inputSchema || []}
          onGridDataChange={handleSchemaChange}
          isValueMode={false}
        />
      </div>

      <div className="bg-muted/30 rounded-xl p-4">
        <h5 className="font-medium text-sm mb-2">How to run this workflow</h5>
        <ol className="text-sm text-muted-foreground space-y-2">
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">
              1
            </span>
            <span>Save your workflow configuration</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">
              2
            </span>
            <span>Click the "Run" button in the canvas toolbar</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">
              3
            </span>
            <span>Provide any required input parameters</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ManualPanel;
