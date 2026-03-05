import React, { useState } from "react";
import { motion } from "framer-motion";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { hasPatternContent } from "../../hooks/useMatchPatternState";
import { THEME, MATCH_PATTERN_TEMPLATES } from "../../constant";
import { icons } from "@/components/icons";

const WHEN_TO_USE = [
  "Route workflow by regex match or no match",
  "Validate email, phone, URL, or custom formats",
  "Extract text with capture groups",
  "Branch when pattern is found or not",
];

const FLAG_TOOLTIPS = {
  globalMatch:
    "Find all matches in the text. If off, only the first match is used.",
  caseSensitive: "Match exact letter case (e.g. 'A' is not 'a').",
  multiline:
    "^ and $ match the start and end of each line, not just the whole text.",
  singleline: "The dot (.) can match newline characters.",
  continueIfNoMatch:
    "When the pattern doesn't match, continue the workflow instead of stopping.",
};

const TEMPLATE_ICONS = {
  email: icons.mail,
  "phone-us": icons.smartphone,
  url: icons.globe,
  digits: icons.type,
  word: icons.type,
};

const getPatternPrimitiveValue = (pattern) => {
  const block = pattern?.blocks?.[0];
  return block?.value ?? block?.text ?? "";
};

const Configure = ({
  globalMatch,
  caseSensitive,
  multiline,
  singleline,
  continueExecutionIfNoMatch,
  variables,
  pattern,
  setPattern,
  text,
  setText,
  selectedTemplateId,
  setSelectedTemplateId,
  setGlobalMatch,
  setCaseSensitive,
  setMultiline,
  setSingleline,
  setContinueExecutionIfNoMatch,
}) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const hasPattern = hasPatternContent(pattern);
  const patternValue = getPatternPrimitiveValue(pattern);
  const detectedTemplateId =
    !patternValue && !hasPattern
      ? null
      : MATCH_PATTERN_TEMPLATES.find((t) => t.pattern === patternValue)?.id ??
        (hasPattern ? "scratch" : null);
  const effectiveSelectedId = selectedTemplateId ?? detectedTemplateId;

  const applyTemplate = (template) => {
    if (template.id === "scratch") {
      setSelectedTemplateId("scratch");
      return;
    }
    setSelectedTemplateId(template.id);
    setPattern({
      type: "fx",
      blocks: [{ type: "PRIMITIVES", value: template.pattern }],
    });
    if (template.sampleText) {
      setText({
        type: "fx",
        blocks: [{ type: "PRIMITIVES", value: template.sampleText }],
      });
    }
  };

  const OptionRow = ({ id, label, checked, onCheckedChange, tooltipKey }) => (
    <div className="flex items-center justify-start gap-3 min-w-0">
      <Switch
        id={id}
        data-testid={`${id}-switch`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0 data-[state=checked]:bg-[var(--match-pattern-accent)]"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-1 cursor-help min-w-0">
            <Label htmlFor={id} className="text-sm cursor-pointer truncate">
              {label}
            </Label>
            <icons.helpCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          {FLAG_TOOLTIPS[tooltipKey]}
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const isFromScratch =
    effectiveSelectedId === "scratch" || effectiveSelectedId === null;

  return (
    <TooltipProvider>
      <div
        className="box-border h-full flex flex-col gap-6 overflow-y-auto p-5"
        style={{
          ["--match-pattern-accent"]: THEME.accentColor,
          ["--match-pattern-accent-border"]: `${THEME.accentColor}33`,
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <icons.sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              When to use
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {WHEN_TO_USE.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <icons.check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <icons.layoutTemplate className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Template
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              key="scratch"
              type="button"
              onClick={() => applyTemplate({ id: "scratch" })}
              className={cn(
                "relative p-3 rounded-lg border-2 text-left transition-all min-w-0",
                isFromScratch
                  ? "border-[var(--match-pattern-accent)] bg-[var(--match-pattern-accent)]/5"
                  : "border-border hover:border-[var(--match-pattern-accent)]/50 hover:bg-[var(--match-pattern-accent)]/5"
              )}
            >
              <div className="flex items-start gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    backgroundColor: THEME.iconBg,
                    color: THEME.iconColor,
                  }}
                >
                  <icons.braces className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-medium text-xs text-foreground truncate">
                    Start from scratch
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 break-words">
                    Type your own pattern below
                  </div>
                </div>
              </div>
              {isFromScratch && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center size-5 pointer-events-none shrink-0"
                  style={{ color: THEME.accentColor }}
                >
                  <icons.check className="w-4 h-4 shrink-0" />
                </div>
              )}
            </motion.button>
            {MATCH_PATTERN_TEMPLATES.map((template) => {
              const Icon = TEMPLATE_ICONS[template.id] || icons.type;
              const isSelected = effectiveSelectedId === template.id;
              return (
                <motion.button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={cn(
                    "relative p-3 rounded-lg border-2 text-left transition-all min-w-0",
                    isSelected
                      ? "border-[var(--match-pattern-accent)] bg-[var(--match-pattern-accent)]/5"
                      : "border-border hover:border-[var(--match-pattern-accent)]/50 hover:bg-[var(--match-pattern-accent)]/5"
                  )}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: THEME.iconBg,
                        color: THEME.iconColor,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium text-xs text-foreground truncate">
                        {template.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 break-words">
                        {template.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center size-5 pointer-events-none shrink-0"
                      style={{ color: THEME.accentColor }}
                    >
                      <icons.check className="w-4 h-4 shrink-0" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
          <CollapsibleTrigger
            className={cn(
              "flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:bg-muted/50",
              optionsOpen && "bg-muted/30"
            )}
            style={
              optionsOpen
                ? { borderColor: "var(--match-pattern-accent-border)" }
                : undefined
            }
          >
            <icons.settings className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Regex options</span>
            <icons.chevronDown
              className={cn(
                "w-4 h-4 shrink-0 transition-transform duration-200 ease-out",
                optionsOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200 ease-out pt-2"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              <OptionRow
                id="global-match"
                label="Global Match"
                checked={globalMatch}
                onCheckedChange={setGlobalMatch}
                tooltipKey="globalMatch"
              />
              <OptionRow
                id="case-sensitive"
                label="Case Sensitive"
                checked={caseSensitive}
                onCheckedChange={setCaseSensitive}
                tooltipKey="caseSensitive"
              />
              <OptionRow
                id="multiline"
                label="Multiline"
                checked={multiline}
                onCheckedChange={setMultiline}
                tooltipKey="multiline"
              />
              <OptionRow
                id="singleline"
                label="Singleline"
                checked={singleline}
                onCheckedChange={setSingleline}
                tooltipKey="singleline"
              />
              <div className="col-span-2">
                <OptionRow
                  id="continue-execution"
                  label="Continue the execution of the route even if the module finds no matches"
                  checked={continueExecutionIfNoMatch}
                  onCheckedChange={setContinueExecutionIfNoMatch}
                  tooltipKey="continueIfNoMatch"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-col gap-3">
          <FormulaBar
            wrapContent={true}
            inputMode="formula"
            variables={variables}
            placeholder="Pattern"
            defaultInputContent={pattern?.blocks || []}
            onInputContentChanged={(blocks) => setPattern({ type: "fx", blocks })}
            slotProps={{
              container: {
                "data-testid": "pattern-input",
                className: "min-h-[2.5rem]",
              },
            }}
          />
          <FormulaBar
            wrapContent={true}
            inputMode="formula"
            variables={variables}
            placeholder="Text"
            defaultInputContent={text?.blocks || []}
            onInputContentChanged={(blocks) => setText({ type: "fx", blocks })}
            slotProps={{
              container: {
                "data-testid": "text-input",
                className: "min-h-[2.5rem]",
              },
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Configure;
