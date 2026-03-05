import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatabaseConnectionConfig } from "../types";
import type { FormFieldConfig } from "../config/databaseConfig";

interface DBRenderFieldProps {
  updateField: (key: string, value: string | number | boolean) => void
  fieldConfig: FormFieldConfig
  config: DatabaseConnectionConfig
}

function DBRenderField({ updateField, fieldConfig, config }: DBRenderFieldProps) {
  const fieldValue = config[fieldConfig.key] || ""
  const placeholder = fieldConfig.description;


  let inputType = "text";
  if (fieldConfig.key === "password") {
    inputType = "password";
  } else if (fieldConfig.type === "INT") {
    inputType = "number";
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {fieldConfig.label}<span className="text-red-500">*</span>
      </Label>
      <Input
        value={fieldValue}
        onChange={(e) => {
          const newValue = fieldConfig.type === "INT" ? parseInt(e.target.value) || "" : e.target.value;
          updateField(fieldConfig.key, newValue);
        }}
        placeholder={placeholder}
        className="h-10"
        type={inputType}
      />
    </div>
  )
}

export default DBRenderField