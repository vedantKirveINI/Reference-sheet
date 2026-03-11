import { cn } from "@/lib/utils";
import { List, Table2, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";

export type DropdownSourceType = "static" | "tinyTable" | "dynamic";

interface DropdownSourceTypeSelectorProps {
  value: DropdownSourceType;
  onChange: (type: DropdownSourceType) => void;
}

const sourceOptions: {
  id: DropdownSourceType;
  label: string;
  description: string;
  icon: typeof List;
}[] = [
  {
    id: "static",
    label: "Manual",
    description: "Define options manually",
    icon: List,
  },
  {
    id: "tinyTable",
    label: "TinyTable",
    description: "Pull from database",
    icon: Table2,
  },
  {
    id: "dynamic",
    label: "Dynamic",
    description: "Use formula or API",
    icon: Zap,
  },
];

const DropdownSourceTypeSelector = ({
  value,
  onChange,
}: DropdownSourceTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Choose where your dropdown options come from.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {sourceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all",
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-indigo-500" : "bg-gray-100"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isSelected ? "text-white" : "text-gray-500"
                  )}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-indigo-700" : "text-gray-700"
                  )}
                >
                  {option.label}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownSourceTypeSelector;
