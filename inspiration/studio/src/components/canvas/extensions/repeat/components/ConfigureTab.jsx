import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { icons } from "@/components/icons";
import { REPEAT_COUNT_MIN, REPEAT_COUNT_MAX } from "../constants";

const UseCaseItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Icon size={16} className="text-indigo-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const ConfigureTab = ({ state }) => {
  const { repeatCount, updateState } = state;

  return (
    <div className="space-y-6">
      {/* When to use */}
      <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-200">
        <h3 className="text-sm font-medium text-indigo-900 mb-3">When to use</h3>
        <div className="grid grid-cols-2 gap-2">
          <UseCaseItem icon={icons.refreshCw} text="Retry failed API calls" />
          <UseCaseItem icon={icons.layers} text="Paginate through API results" />
          <UseCaseItem icon={icons.sparkles} text="Generate multiple variations" />
          <UseCaseItem icon={icons.alarmClock} text="Poll until a condition is met" />
        </div>
      </div>

      {/* How many times */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-900">How many times?</Label>
          <span className="text-xs text-muted-foreground" title="Allowed range: 1 to 1000">
            ({REPEAT_COUNT_MIN}–{REPEAT_COUNT_MAX})
          </span>
        </div>
        <Input
          type="number"
          value={repeatCount === undefined || repeatCount === "" ? "" : repeatCount}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              updateState({ repeatCount: undefined });
              return;
            }
            const parsed = parseInt(raw, 10);
            updateState({ repeatCount: Number.isNaN(parsed) ? undefined : parsed });
          }}
          className="h-10"
          placeholder={`${REPEAT_COUNT_MIN}–${REPEAT_COUNT_MAX}`}
        />
        <p className="text-xs text-gray-500 -mt-1">
          The loop will run exactly {repeatCount ?? "—"} {repeatCount === 1 ? "time" : "times"}, then continue to Loop End. Values outside {REPEAT_COUNT_MIN}–{REPEAT_COUNT_MAX} will show an error when you save.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-lg bg-zinc-50 p-3">
        <h4 className="text-xs font-medium text-gray-700 mb-1.5">How it works</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Repeat runs the steps between Repeat and Repeat End a fixed number of times. Set the count (e.g. 3), and the loop body executes exactly that many times before continuing. Useful when you know the iteration count in advance.
        </p>
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <h4 className="text-xs font-medium text-amber-900 mb-1">Tip</h4>
        <p className="text-xs text-amber-800">
          Set a max limit to prevent runaway workflows. Combine with a Delay node inside the loop when calling APIs to respect rate limits.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
