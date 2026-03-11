import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, Target, Pencil, Check, Plus, FileText } from "lucide-react";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { AGENT_SCOUT_V3_NODE, RESEARCH_CATEGORIES, RESEARCH_POINTS, OUTPUT_TITLES, getScoutTemplateById } from "../constants";

const iconMap = {
  Building2,
  Users,
  TrendingUp,
  Target,
};

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

const ResearchCategoryCard = ({
  category,
  isSelected,
  onToggle,
  selectedResearchPoints,
  onToggleResearchPoint,
}) => {
  const IconComponent = iconMap[category.icon] || Building2;

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-purple-500 bg-purple-50 shadow-sm ring-2 ring-purple-100"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
      )}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex items-start p-4 gap-3">
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200",
              isSelected && "scale-105"
            )}
            style={{ backgroundColor: category.iconBg }}
          >
            <IconComponent size={20} className="text-white" />
          </div>
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
              <Check size={12} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-gray-100">
        <div className="space-y-2.5 mt-2">
          {category.researchPoints.map((pointId) => (
            <label
              key={pointId}
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selectedResearchPoints[pointId] || false}
                onCheckedChange={() => onToggleResearchPoint(pointId)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {RESEARCH_POINTS[pointId] || pointId}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConfigureTab = ({ state, variables, onEditTemplate }) => {
  const {
    selectedTemplateId,
    yourCompanyName,
    yourCompanyDescription,
    yourCompanyIndustry,
    targetCompanyName,
    targetCompanyWebsite,
    selectedCategories,
    selectedResearchPoints,
    additionalContext,
    setAdditionalContext,
    outputTitle,
    customOutputTitle,
    customResearchPoints,
    validation,
    updateYourCompanyName,
    updateYourCompanyDescription,
    updateYourCompanyIndustry,
    updateTargetCompanyName,
    updateTargetCompanyWebsite,
    toggleCategory,
    toggleResearchPoint,
    toggleOutputTitle,
    updateCustomOutputTitle,
    updateCustomResearchPoints,
    markFieldTouched,
  } = state;

  const [showCustomOutputTitle, setShowCustomOutputTitle] = useState(
    customOutputTitle?.blocks?.length > 0
  );
  const [showCustomResearchPoints, setShowCustomResearchPoints] = useState(
    customResearchPoints?.blocks?.length > 0
  );

  const template = selectedTemplateId ? getScoutTemplateById(selectedTemplateId) : null;
  const touchedErrors = validation.touchedErrors || {};

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center">
                <img src={AGENT_SCOUT_V3_NODE._src} alt="Tiny Scout" className="w-4 h-4 brightness-0 invert" />
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

        <SectionCard title="Your Company">
          <FormSection
            title="Company Name"
            description="The name of your company"
            required
            error={touchedErrors.yourCompanyName}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., Acme Inc."
              defaultInputContent={yourCompanyName?.blocks || []}
              hasError={!!touchedErrors.yourCompanyName}
              onInputContentChanged={(blocks) => {
                updateYourCompanyName(blocks);
                markFieldTouched("yourCompanyName");
              }}
            />
          </FormSection>

          <FormSection
            title="What You Do"
            description="Brief description of your company's products or services"
            required
            error={touchedErrors.yourCompanyDescription}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., We provide AI-powered sales tools..."
              defaultInputContent={yourCompanyDescription?.blocks || []}
              hasError={!!touchedErrors.yourCompanyDescription}
              onInputContentChanged={(blocks) => {
                updateYourCompanyDescription(blocks);
                markFieldTouched("yourCompanyDescription");
              }}
              slotProps={{
                container: {
                  className: "min-h-[72px]",
                },
              }}
            />
          </FormSection>

          <FormSection
            title="Industry"
            description="Your company's industry or sector"
            required
            error={touchedErrors.yourCompanyIndustry}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., SaaS, Enterprise Software"
              defaultInputContent={yourCompanyIndustry?.blocks || []}
              hasError={!!touchedErrors.yourCompanyIndustry}
              onInputContentChanged={(blocks) => {
                updateYourCompanyIndustry(blocks);
                markFieldTouched("yourCompanyIndustry");
              }}
            />
          </FormSection>
        </SectionCard>

        <SectionCard title="Target Prospect">
          <FormSection
            title="Company to Research"
            description="The company you want to research"
            required
            error={touchedErrors.targetCompanyName}
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., Target Corp or use {{variable}}"
              defaultInputContent={targetCompanyName?.blocks || []}
              hasError={!!touchedErrors.targetCompanyName}
              onInputContentChanged={(blocks) => {
                updateTargetCompanyName(blocks);
                markFieldTouched("targetCompanyName");
              }}
            />
          </FormSection>

          <FormSection
            title="Company Website"
            description="Optional - helps improve research accuracy"
          >
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="e.g., https://example.com"
              defaultInputContent={targetCompanyWebsite?.blocks || []}
              onInputContentChanged={(blocks) => updateTargetCompanyWebsite(blocks)}
            />
          </FormSection>
        </SectionCard>

        <SectionCard title="Research Focus">
          <p className="text-xs text-gray-500 -mt-2">
            Click to select research areas. Customize specific data points within each category.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RESEARCH_CATEGORIES.map((category) => (
              <ResearchCategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onToggle={(categoryId) => {
                  toggleCategory(categoryId);
                  markFieldTouched("researchFocus");
                }}
                selectedResearchPoints={selectedResearchPoints}
                onToggleResearchPoint={toggleResearchPoint}
              />
            ))}
          </div>
          {touchedErrors.researchFocus && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {touchedErrors.researchFocus}
            </p>
          )}

          {!showCustomResearchPoints && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomResearchPoints(true)}
              className="w-fit"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Custom Research Points
            </Button>
          )}

          {showCustomResearchPoints && (
            <FormSection
              title="Custom Research Points"
              description="Enter additional research points separated by comma"
            >
              <FormulaBar
                variables={variables}
                wrapContent
                placeholder="e.g., Social media presence, Patent portfolio..."
                defaultInputContent={customResearchPoints?.blocks || []}
                onInputContentChanged={(blocks) => updateCustomResearchPoints(blocks)}
              />
            </FormSection>
          )}

          <FormSection
            title="Additional Context"
            description="Any specific instructions or context for the research"
          >
            <Textarea
              placeholder="e.g., Focus on their recent expansion into European markets..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-[80px] rounded-xl"
            />
          </FormSection>
        </SectionCard>

        <SectionCard title="Output Format">
          <p className="text-xs text-gray-500 -mt-2">
            Select how you want the research results to be organized
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(OUTPUT_TITLES).map(([key, label]) => (
              <label
                key={key}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all",
                  outputTitle[key]
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <Checkbox
                  checked={outputTitle[key] || false}
                  onCheckedChange={() => toggleOutputTitle(key)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {!showCustomOutputTitle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomOutputTitle(true)}
              className="w-fit"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Custom Output Titles
            </Button>
          )}

          {showCustomOutputTitle && (
            <FormSection
              title="Custom Output Titles"
              description="Enter additional output titles separated by comma"
            >
              <FormulaBar
                variables={variables}
                wrapContent
                placeholder="e.g., Market opportunity, Strategic fit score..."
                defaultInputContent={customOutputTitle?.blocks || []}
                onInputContentChanged={(blocks) => updateCustomOutputTitle(blocks)}
              />
            </FormSection>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ConfigureTab;
