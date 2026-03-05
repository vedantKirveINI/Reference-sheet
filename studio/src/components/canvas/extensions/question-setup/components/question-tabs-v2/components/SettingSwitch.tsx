import * as React from "react";
import { Switch } from "@/components/ui/switch";

interface SettingSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  dataTestId?: string;
}

const SettingSwitch = ({
  label,
  description,
  checked,
  onChange,
  dataTestId,
}: SettingSwitchProps) => {
  return (
    <div
      className="flex justify-between items-center min-h-[2.5rem]"
      data-testid={dataTestId}
    >
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
            {description}
          </div>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default SettingSwitch;
