import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ColumnNameInput = ({
  value,
  onChange,
  names,
  rowIndex,
  dataTestId
}) => {
  return (
    <div className="flex flex-col gap-1 h-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter column name"
        className={cn(
          "h-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm min-h-[36px]"
        )}
        data-testid={`${dataTestId}-${rowIndex}`}
      />
    </div>
  );
};

export default ColumnNameInput; 