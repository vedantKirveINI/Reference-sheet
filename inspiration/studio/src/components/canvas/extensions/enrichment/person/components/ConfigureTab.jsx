import React from "react";
import { User, Building2, Linkedin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const ConfigureTab = ({ state, variables }) => {
  const {
    fullName,
    updateFullName,
    domain,
    updateDomain,
    linkedinUrl,
    updateLinkedinUrl,
    validation,
    touched,
    touchField,
    configureFields,
  } = state;

  const showFullNameError = touched.fullName && validation.touchedErrors?.fullName;
  const showDomainError = touched.domain && validation.touchedErrors?.domain;

  const getFieldIcon = (key) => {
    switch (key) {
      case "fullName":
        return <User className="w-4 h-4 text-gray-500" />;
      case "domain":
        return <Building2 className="w-4 h-4 text-gray-500" />;
      case "linkedinUrl":
        return <Linkedin className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getFieldValue = (key) => {
    switch (key) {
      case "fullName":
        return fullName;
      case "domain":
        return domain;
      case "linkedinUrl":
        return linkedinUrl;
      default:
        return null;
    }
  };

  const getFieldUpdater = (key) => {
    switch (key) {
      case "fullName":
        return updateFullName;
      case "domain":
        return updateDomain;
      case "linkedinUrl":
        return updateLinkedinUrl;
      default:
        return () => { };
    }
  };

  const getFieldError = (key) => {
    if (key === "fullName") return showFullNameError;
    if (key === "domain") return showDomainError;
    return false;
  };

  const getFieldErrorMessage = (key) => {
    if (key === "fullName") return validation.touchedErrors?.fullName;
    if (key === "domain") return validation.touchedErrors?.domain;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-[#7c3aed]/5 rounded-xl p-4 border border-[#8B5CF6]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">Person Enrichment</h3>
            <p className="text-xs text-gray-600 mt-1">
              Provide the person's full name and company domain to retrieve detailed information about them.
              Optionally add their LinkedIn URL for more accurate results.
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
                        : "border-gray-200 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/10"
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
                <strong>Tip:</strong> For best results, use the exact company domain (e.g., "acme.com")
                rather than a full URL. The LinkedIn URL is optional but helps ensure accurate matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
