import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Pencil } from "lucide-react";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { getSearchTemplateById } from "../constants";
import extensionIcons from "../../../assets/extensions";

const FormSection = ({ title, description, required, error, children }) => (
  <div className="space-y-2">
    <div>
      <Label className="text-sm font-medium text-gray-900">
        {title}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-500" />
        {error}
      </p>
    )}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

const ConfigureTab = ({ state, variables, onEditTemplate }) => {
  const {
    selectedTemplateId,
    searchQuery,
    numberOfResults,
    searchFocus,
    setSearchFocus,
    additionalContext,
    setAdditionalContext,
    validation,
    updateSearchQuery,
    updateNumberOfResults,
    markFieldTouched,
  } = state;

  const template = selectedTemplateId ? getSearchTemplateById(selectedTemplateId) : null;
  const touchedErrors = validation.touchedErrors || {};

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{template.name}</p>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            </div>
            <button
              onClick={onEditTemplate}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
        )}

        <SectionCard title="Search Configuration">
          <FormSection
            title="Search Query"
            description="Enter the text, keyword, or topic you want to search for"
            required
            error={touchedErrors.searchQuery}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., Latest AI trends in healthcare 2024"
              defaultInputContent={searchQuery?.blocks || []}
              hasError={!!touchedErrors.searchQuery}
              onInputContentChanged={(blocks) => {
                updateSearchQuery(blocks);
                markFieldTouched("searchQuery");
              }}
            />
          </FormSection>

          <FormSection
            title="Number of Results"
            description="How many search results would you like? (1-100)"
            required
            error={touchedErrors.numberOfResults}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="10"
              defaultInputContent={numberOfResults?.blocks || []}
              hasError={!!touchedErrors.numberOfResults}
              onInputContentChanged={(blocks) => {
                updateNumberOfResults(blocks);
                markFieldTouched("numberOfResults");
              }}
            />
          </FormSection>

          <FormSection
            title="Search Focus"
            description="What specific aspects should the search focus on?"
          >
            <Textarea
              placeholder="e.g., industry trends, market size, growth projections"
              value={searchFocus}
              onChange={(e) => setSearchFocus(e.target.value)}
              className="min-h-[5rem] rounded-xl border-gray-300 resize-none"
            />
          </FormSection>
        </SectionCard>

        <SectionCard title="Additional Context">
          <FormSection
            title="Context"
            description="Provide any additional context to refine the search results"
          >
            <Textarea
              placeholder="e.g., Focus on B2B SaaS companies in North America, exclude consumer products"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-[6.25rem] rounded-xl border-gray-300 resize-none"
            />
          </FormSection>
        </SectionCard>
      </div>
    </div>
  );
};

export default ConfigureTab;
