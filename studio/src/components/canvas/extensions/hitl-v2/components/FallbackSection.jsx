import React from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TIMEOUT_UNITS } from "../constants";

const FallbackSection = ({ fallback, buttons, onFallbackChange, errors = {} }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <Label className="text-sm font-medium text-gray-900">
            Enable fallback behavior
          </Label>
        </div>
        <Switch
          checked={fallback?.enabled || false}
          onCheckedChange={(checked) =>
            onFallbackChange({
              ...fallback,
              enabled: checked,
            })
          }
        />
      </div>

      <p className="text-xs text-gray-600">
        Fallback behavior determines what happens if a reviewer doesn&apos;t take action
        within a specified time period. This prevents workflows from getting stuck indefinitely.
      </p>

      {fallback?.enabled && (
        <div className="space-y-4 pt-2">
          {/* Timeout Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-900">
                Timeout Duration<span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={fallback?.timeout_duration || 30}
                onChange={(e) =>
                  onFallbackChange({
                    ...fallback,
                    timeout_duration: parseInt(e.target.value) || 1,
                  })
                }
                className={cn(
                  "h-9",
                  errors.timeout_duration ? "border-red-400" : ""
                )}
              />
              {errors.timeout_duration && (
                <p className="text-xs text-red-600">Timeout duration is required</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-900">Time Unit</Label>
              <Select
                value={fallback?.timeout_unit || "minutes"}
                onValueChange={(value) =>
                  onFallbackChange({
                    ...fallback,
                    timeout_unit: value,
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEOUT_UNITS.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fallback Action */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">Fallback Action</Label>
            <RadioGroup
              value={fallback?.action || "auto_trigger"}
              onValueChange={(value) =>
                onFallbackChange({
                  ...fallback,
                  action: value,
                  ...(value === "kill" && { fallback_value: "" }),
                })
              }
            >
              <div className="flex items-start space-x-2 p-3 rounded-lg border border-gray-200 bg-white">
                <RadioGroupItem value="auto_trigger" id="auto_trigger" className="mt-0.5" />
                <div className="flex-1">
                  <Label
                    htmlFor="auto_trigger"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Auto-Trigger with Predefined Button Response
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This will simulate as if a specific button was clicked
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border border-gray-200 bg-white">
                <RadioGroupItem value="kill" id="kill" className="mt-0.5" />
                <div className="flex-1">
                  <Label
                    htmlFor="kill"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Kill the Workflow with Final Status
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ends the flow and shows a kill-screen with error message
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Fallback Button Selection */}
          {fallback?.action === "auto_trigger" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-900">
                Fallback Button<span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Select
                value={fallback?.fallback_value || ""}
                onValueChange={(value) =>
                  onFallbackChange({
                    ...fallback,
                    fallback_value: value,
                  })
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-9",
                    errors.fallback_value ? "border-red-400" : ""
                  )}
                >
                  <SelectValue placeholder="Select a button" />
                </SelectTrigger>
                <SelectContent>
                  {buttons
                    ?.filter((btn) => btn.label && btn.value)
                    ?.map((button, index) => (
                      <SelectItem key={index} value={button.label}>
                        {button.label}
                      </SelectItem>
                    ))}
                  {(!buttons || buttons.filter((btn) => btn.label).length === 0) && (
                    <SelectItem value="" disabled>
                      No valid buttons available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.fallback_value && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Fallback button is required
                </p>
              )}
              <p className="text-xs text-gray-500">
                This button will be automatically triggered after the timeout period
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FallbackSection;
