import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { icons } from "@/components/icons";

const UseCaseItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Icon size={16} className="text-orange-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const ConfigureTab = ({ state, variables }) => {
  const { listSource, setListSource, validation } = state;

  return (
    <div className="space-y-6">
      {/* When to use */}
      <div className="rounded-xl p-4 bg-orange-50 border border-orange-200">
        <h3 className="text-sm font-medium text-orange-900 mb-3">When to use</h3>
        <div className="grid grid-cols-2 gap-2">
          <UseCaseItem icon={icons.mail} text="Email every contact in a list" />
          <UseCaseItem icon={icons.pencil} text="Tag or update multiple records" />
          <UseCaseItem icon={icons.layers} text="Transform data row by row" />
          <UseCaseItem icon={icons.checkCircle} text="Check each item for conditions" />
        </div>
      </div>

      {/* List to loop over */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          List to loop over<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <p className="text-xs text-gray-500 -mt-1">
          Pick a list, and we'll run your steps once for each item. Simple as that.
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          inputMode="formula"
          type="array"
          showFunctions={false}
          placeholder="Pick a list from a previous step, e.g. {{Get Customers.results}}"
          defaultInputContent={listSource?.blocks || []}
          onInputContentChanged={(blocks) => setListSource({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[80px] rounded-xl border border-zinc-300 bg-white",
                !validation.isValid && "border-red-400"
              ),
            },
          }}
        />
        <p className="text-xs text-gray-500">
          Each time the loop runs, you'll get access to the current item from this list
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-lg bg-zinc-50 p-3">
        <h4 className="text-xs font-medium text-gray-700 mb-1.5">How it works</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          For Each takes a list (e.g. customers, orders, or API results) and runs the steps between For Each and For Each End once for every item. Inside the loop, you can use the current item (e.g.{" "}
          <code className="px-1 py-0.5 rounded bg-zinc-200 text-gray-800 font-mono text-[11px]">
            {"{{For Each.currentItem}}"}
          </code>
          ).
        </p>
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <h4 className="text-xs font-medium text-amber-900 mb-1">Tip</h4>
        <p className="text-xs text-amber-800">
          Control loop speed to avoid API rate limits — add a Delay node inside the loop when calling external APIs.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
