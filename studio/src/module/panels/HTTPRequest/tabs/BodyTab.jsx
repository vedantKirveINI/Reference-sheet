import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CodeEditor } from "@/components/studio/CodeEditor";
import { SimpleInputGrid } from "@/components/studio/SimpleInputGrid";
import { cn } from "@/lib/utils";

const BODY_TYPES = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "form-data", label: "Form Data" },
  { value: "raw", label: "Raw" },
];

export function BodyTab({ body = { type: "none", content: "" }, onChange }) {
  const handleTypeChange = (type) => {
    onChange?.({ ...body, type });
  };

  const handleContentChange = (content) => {
    onChange?.({ ...body, content });
  };

  const handleFormDataChange = (formData) => {
    onChange?.({ ...body, content: formData });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label
          className="text-sm font-medium text-gray-700"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          Body Type
        </Label>
        <RadioGroup
          value={body.type}
          onValueChange={handleTypeChange}
          className="flex flex-wrap gap-3"
        >
          {BODY_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={type.value}
                id={`body-type-${type.value}`}
                className={cn(
                  "border-gray-300",
                  body.type === type.value && "border-[#1C3693] text-[#1C3693]"
                )}
              />
              <Label
                htmlFor={`body-type-${type.value}`}
                className="text-sm text-gray-600 cursor-pointer"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {body.type === "none" && (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          No body content for this request
        </div>
      )}

      {body.type === "json" && (
        <CodeEditor
          value={typeof body.content === "string" ? body.content : ""}
          onChange={handleContentChange}
          language="json"
          placeholder='{\n  "key": "value"\n}'
          maxHeight={300}
        />
      )}

      {body.type === "form-data" && (
        <SimpleInputGrid
          value={Array.isArray(body.content) ? body.content : []}
          onChange={handleFormDataChange}
          showType={true}
          allowFiles={true}
          placeholder={{ key: "Field name", value: "Field value" }}
        />
      )}

      {body.type === "raw" && (
        <CodeEditor
          value={typeof body.content === "string" ? body.content : ""}
          onChange={handleContentChange}
          language="text"
          placeholder="Enter raw body content..."
          maxHeight={300}
          showFormatButton={false}
        />
      )}
    </div>
  );
}

export default BodyTab;
