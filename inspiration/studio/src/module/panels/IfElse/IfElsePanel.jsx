import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GitBranch, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DrawerShell,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "../../index";
import ConditionGroup from "./ConditionGroup";

const generateId = () => `c${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const IfElsePanel = ({
  isOpen,
  onClose,
  data = {},
  onChange,
  availableFields = [],
  availableNodes = [],
}) => {
  const [localData, setLocalData] = useState(() => ({
    ifConditions: data?.ifConditions || [],
    elseEnabled: data?.elseEnabled ?? false,
    ifJumpTo: data?.ifJumpTo || "",
    elseJumpTo: data?.elseJumpTo || "",
  }));

  const [elseOpen, setElseOpen] = useState(localData.elseEnabled);

  const updateData = useCallback((updates) => {
    setLocalData((prev) => {
      const newData = { ...prev, ...updates };
      return newData;
    });
  }, []);

  const handleConditionChange = useCallback((conditionId, updates) => {
    setLocalData((prev) => ({
      ...prev,
      ifConditions: prev.ifConditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const handleConditionDelete = useCallback((conditionId) => {
    setLocalData((prev) => ({
      ...prev,
      ifConditions: prev.ifConditions.filter((c) => c.id !== conditionId),
    }));
  }, []);

  const handleAddCondition = useCallback(() => {
    const newCondition = {
      id: generateId(),
      field: availableFields[0] || "",
      operator: "equals",
      value: "",
      logic: "and",
    };
    setLocalData((prev) => ({
      ...prev,
      ifConditions: [...prev.ifConditions, newCondition],
    }));
  }, [availableFields]);

  const handleLogicToggle = useCallback((conditionId) => {
    setLocalData((prev) => ({
      ...prev,
      ifConditions: prev.ifConditions.map((c) =>
        c.id === conditionId
          ? { ...c, logic: c.logic === "and" ? "or" : "and" }
          : c
      ),
    }));
  }, []);

  const handleElseToggle = useCallback((enabled) => {
    updateData({ elseEnabled: enabled });
    setElseOpen(enabled);
  }, [updateData]);

  const handleSave = useCallback(() => {
    onChange?.(localData);
    onClose?.();
  }, [localData, onChange, onClose]);

  const conditionCount = localData.ifConditions.length;

  return (
    <DrawerShell open={isOpen} onClose={onClose} width="420px">
      <DrawerHeader
        title="If-Else Branch"
        subtitle={
          conditionCount > 0
            ? `${conditionCount} condition${conditionCount > 1 ? "s" : ""}`
            : "Configure branching logic"
        }
        onClose={onClose}
      />

      <DrawerBody padding="p-0">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#1C3693" }}
              >
                <span className="text-white text-sm font-bold">IF</span>
              </div>
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
              >
                If Conditions
              </h3>
            </div>

            <ConditionGroup
              conditions={localData.ifConditions}
              availableFields={availableFields}
              onConditionChange={handleConditionChange}
              onConditionDelete={handleConditionDelete}
              onAddCondition={handleAddCondition}
              onLogicToggle={handleLogicToggle}
            />

            <div className="pt-2">
              <Label
                className="text-sm text-gray-600 mb-2 block"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                Then jump to
              </Label>
              <Select
                value={localData.ifJumpTo || ""}
                onValueChange={(value) => updateData({ ifJumpTo: value })}
              >
                <SelectTrigger
                  className="w-full h-10 border-gray-200"
                  data-testid="if-jump-to-select"
                >
                  <SelectValue placeholder="Select node..." />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          <Collapsible open={elseOpen} onOpenChange={setElseOpen}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    localData.elseEnabled ? "bg-gray-700" : "bg-gray-300"
                  )}
                >
                  <span className="text-white text-xs font-bold">ELSE</span>
                </div>
                <h3
                  className={cn(
                    "font-semibold",
                    localData.elseEnabled ? "text-gray-900" : "text-gray-400"
                  )}
                  style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
                >
                  Else Branch
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={localData.elseEnabled}
                  onCheckedChange={handleElseToggle}
                  data-testid="else-toggle"
                />
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-transform",
                      !localData.elseEnabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!localData.elseEnabled}
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        elseOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent className="pt-4">
              {localData.elseEnabled && (
                <div>
                  <Label
                    className="text-sm text-gray-600 mb-2 block"
                    style={{ fontFamily: "Archivo, sans-serif" }}
                  >
                    Then jump to
                  </Label>
                  <Select
                    value={localData.elseJumpTo || ""}
                    onValueChange={(value) => updateData({ elseJumpTo: value })}
                  >
                    <SelectTrigger
                      className="w-full h-10 border-gray-200"
                      data-testid="else-jump-to-select"
                    >
                      <SelectValue placeholder="Select node..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNodes.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DrawerBody>

      <DrawerFooter>
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1"
          style={{ backgroundColor: "#1C3693" }}
          data-testid="save-button"
        >
          Save Conditions
        </Button>
      </DrawerFooter>
    </DrawerShell>
  );
};

export default IfElsePanel;
