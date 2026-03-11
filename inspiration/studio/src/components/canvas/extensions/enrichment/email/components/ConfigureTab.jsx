import React from "react";
import { Building2, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const ConfigureTab = ({ state, variables }) => {
  const { 
    domain,
    updateDomain,
    fullName, 
    updateFullName,
    validation,
    touched,
    touchField,
    configureFields,
  } = state;

  const showDomainError = touched.domain && validation.touchedErrors?.domain;
  const showFullNameError = touched.fullName && validation.touchedErrors?.fullName;

  const getFieldIcon = (key) => {
    switch (key) {
      case "domain":
        return <Building2 className="w-4 h-4 text-gray-500" />;
      case "fullName":
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getFieldValue = (key) => {
    switch (key) {
      case "domain":
        return domain;
      case "fullName":
        return fullName;
      default:
        return null;
    }
  };

  const getFieldUpdater = (key) => {
    switch (key) {
      case "domain":
        return updateDomain;
      case "fullName":
        return updateFullName;
      default:
        return () => {};
    }
  };

  const getFieldError = (key) => {
    if (key === "domain") return showDomainError;
    if (key === "fullName") return showFullNameError;
    return false;
  };

  const getFieldErrorMessage = (key) => {
    if (key === "domain") return validation.touchedErrors?.domain;
    if (key === "fullName") return validation.touchedErrors?.fullName;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#22C55E]/5 to-[#16a34a]/5 rounded-xl p-4 border border-[#22C55E]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">Email Enrichment</h3>
            <p className="text-xs text-gray-600 mt-1">
              Provide the company domain and person's full name to find their email address. 
              The domain helps identify the organization and the name generates accurate email patterns.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {configureFields.map((field) => {
          const fieldValue = getFieldValue(field.key);
          const fieldUpdater = getFieldUpdater(field.key);
          const hasError = getFieldError(field.key);
          const errorMessage = getFieldErrorMessage(field.key);
          const FieldIcon = getFieldIcon(field.key);

          return (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                {FieldIcon}
                <Label className="text-sm font-medium text-gray-900">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
              </div>
              
              <FormulaBar
                variables={variables}
                wrapContent
                placeholder={field.placeholder}
                defaultInputContent={fieldValue?.blocks || []}
                onInputContentChanged={(blocks) => fieldUpdater(blocks)}
                onBlur={() => touchField(field.key)}
                slotProps={{
                  container: {
                    className: cn(
                      "min-h-[60px] rounded-xl border bg-white transition-all",
                      hasError 
                        ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100" 
                        : "border-gray-200 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/10"
                    ),
                  },
                }}
              />
              
              {hasError ? (
                <div className="flex items-center gap-1.5 text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <p className="text-xs">{errorMessage}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 ml-1">{field.description}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-xs font-medium">💡</span>
            </div>
            <div>
              <p className="text-xs text-amber-800">
                <strong>Tip:</strong> Use the company domain (e.g., "acme.com") rather than a full URL. 
                The full name should match exactly how it appears in business communications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
