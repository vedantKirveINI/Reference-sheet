import React from "react";
import { Clock, CalendarClock, Rewind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WAIT_TYPES, DURATION_UNITS, THEME } from "../constants";

const WaitTypeCard = ({ type, icon: Icon, title, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left w-full",
      isSelected
        ? "border-cyan-500 bg-cyan-50/50"
        : "border-zinc-200 hover:border-zinc-300 bg-white"
    )}
  >
    <div
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
        isSelected ? "bg-cyan-100" : "bg-zinc-100"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5",
          isSelected ? "text-cyan-600" : "text-zinc-500"
        )}
      />
    </div>
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-medium text-sm",
          isSelected ? "text-cyan-700" : "text-zinc-700"
        )}
      >
        {title}
      </span>
      <span className="text-xs text-zinc-500">{description}</span>
    </div>
  </button>
);

const ExcludeWeekendsToggle = ({ excludeWeekends, onToggle }) => (
  <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-zinc-700">Business days only</span>
      <span className="text-xs text-zinc-500">Exclude weekends (Saturday & Sunday)</span>
    </div>
    <Switch
      checked={excludeWeekends}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-cyan-500"
    />
  </div>
);

const ConfigureTab = ({ state }) => {
  const {
    waitType,
    durationValue,
    durationUnit,
    untilDate,
    untilTime,
    beforeValue,
    beforeUnit,
    referenceDate,
    excludeWeekends,
    updateState,
  } = state;

  const getDurationLabel = (value, unit) => {
    const unitInfo = DURATION_UNITS[unit?.toUpperCase()];
    if (!unitInfo) return unit;
    return value === 1 ? unitInfo.singular : unitInfo.label.toLowerCase();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium text-zinc-700">Wait Type</Label>
        <div className="grid grid-cols-1 gap-3">
          <WaitTypeCard
            type={WAIT_TYPES.DURATION}
            icon={Clock}
            title="Wait for Duration"
            description="Pause for a specific amount of time (forward-looking)"
            isSelected={waitType === WAIT_TYPES.DURATION}
            onClick={() => updateState({ waitType: WAIT_TYPES.DURATION })}
          />
          <WaitTypeCard
            type={WAIT_TYPES.UNTIL}
            icon={CalendarClock}
            title="Wait Until"
            description="Pause until a specific date and time"
            isSelected={waitType === WAIT_TYPES.UNTIL}
            onClick={() => updateState({ waitType: WAIT_TYPES.UNTIL })}
          />
          <WaitTypeCard
            type={WAIT_TYPES.UNTIL_BEFORE}
            icon={Rewind}
            title="Wait Until Before"
            description="Pause until X time before a reference date (countdown)"
            isSelected={waitType === WAIT_TYPES.UNTIL_BEFORE}
            onClick={() => updateState({ waitType: WAIT_TYPES.UNTIL_BEFORE })}
          />
        </div>
      </div>

      {waitType === WAIT_TYPES.DURATION && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Configure duration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Amount</Label>
              <Input
                type="number"
                min={1}
                value={durationValue}
                onChange={(e) => updateState({ durationValue: parseInt(e.target.value) || 1 })}
                className="h-10"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Unit</Label>
              <Select
                value={durationUnit}
                onValueChange={(value) => updateState({ durationUnit: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DURATION_UNITS).map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ExcludeWeekendsToggle
            excludeWeekends={excludeWeekends}
            onToggle={(checked) => updateState({ excludeWeekends: checked })}
          />
          <p className="text-xs text-zinc-500">
            The sequence will pause for {durationValue} {getDurationLabel(durationValue, durationUnit)}
            {excludeWeekends ? " (business days)" : ""} before continuing.
          </p>
        </div>
      )}

      {waitType === WAIT_TYPES.UNTIL && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <CalendarClock className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Configure target date/time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Date</Label>
              <Input
                type="date"
                value={untilDate || ""}
                onChange={(e) => updateState({ untilDate: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Time (optional)</Label>
              <Input
                type="time"
                value={untilTime || ""}
                onChange={(e) => updateState({ untilTime: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            The sequence will pause until the specified date{untilTime ? " and time" : ""}.
          </p>
        </div>
      )}

      {waitType === WAIT_TYPES.UNTIL_BEFORE && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Rewind className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Configure countdown</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Time Before</Label>
              <Input
                type="number"
                min={1}
                value={beforeValue}
                onChange={(e) => updateState({ beforeValue: parseInt(e.target.value) || 1 })}
                className="h-10"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Unit</Label>
              <Select
                value={beforeUnit}
                onValueChange={(value) => updateState({ beforeUnit: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DURATION_UNITS).map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Reference Date Field</Label>
            <Input
              type="text"
              placeholder="e.g., {{trigger.expiryDate}} or {{user.subscriptionEnd}}"
              value={referenceDate}
              onChange={(e) => updateState({ referenceDate: e.target.value })}
              className="h-10 font-mono text-sm"
            />
            <p className="text-xs text-zinc-400 mt-1">
              Use a variable from trigger data or previous steps
            </p>
          </div>
          <ExcludeWeekendsToggle
            excludeWeekends={excludeWeekends}
            onToggle={(checked) => updateState({ excludeWeekends: checked })}
          />
          <p className="text-xs text-zinc-500">
            The sequence will pause until {beforeValue} {getDurationLabel(beforeValue, beforeUnit)}
            {excludeWeekends ? " (business days)" : ""} before the reference date.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
