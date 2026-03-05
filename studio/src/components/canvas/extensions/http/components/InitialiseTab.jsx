import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Check, FileCode, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HTTP_TEMPLATES, THEME } from "../constants";
import { parseCurlCommand } from "../utils";

const InitialiseTab = ({
  selectedTemplateId,
  isFromScratch,
  onSelectTemplate,
  onStartFromScratch,
  onCurlImport,
}) => {
  const [curlMode, setCurlMode] = useState(false);
  const [curlInput, setCurlInput] = useState("");
  const [curlError, setCurlError] = useState(null);
  const [parsing, setParsing] = useState(false);

  const handleCurlParse = async () => {
    if (!curlInput.trim()) {
      setCurlError("Please enter a cURL command");
      return;
    }

    setParsing(true);
    setCurlError(null);

    try {
      const parsedData = await parseCurlCommand(curlInput);
      onCurlImport(parsedData);
    } catch (error) {
      setCurlError(error.message || "Failed to parse cURL command");
    } finally {
      setParsing(false);
    }
  };

  const regularTemplates = HTTP_TEMPLATES.filter((t) => !t.isCurlImport);

  if (curlMode) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurlMode(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to templates
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: THEME.iconBg, color: THEME.iconColor }}
            >
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Import cURL Command</h3>
              <p className="text-sm text-muted-foreground">
                Paste your cURL command to auto-configure the request
              </p>
            </div>
          </div>

          <Textarea
            value={curlInput}
            onChange={(e) => {
              setCurlInput(e.target.value);
              setCurlError(null);
            }}
            placeholder={`curl -X POST https://api.example.com/data \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"key": "value"}'`}
            className={cn(
              "min-h-[200px] font-mono text-sm",
              curlError && "border-red-500 focus-visible:ring-red-500"
            )}
          />

          {curlError && (
            <p className="text-sm text-red-500">{curlError}</p>
          )}

          <Button
            onClick={handleCurlParse}
            disabled={parsing || !curlInput.trim()}
            className="w-full"
            style={{
              backgroundColor: THEME.primaryButtonBg,
              color: THEME.primaryButtonText,
            }}
          >
            {parsing ? "Parsing..." : "Import & Configure"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${THEME.accentColor}10 0%, ${THEME.accentColorLight}05 100%)`,
          border: `1px solid ${THEME.accentColor}20`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${THEME.accentColor} 0%, ${THEME.accentColorLight} 100%)`,
            }}
          >
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">HTTP Request</h2>
            <p className="text-muted-foreground leading-relaxed">
              Make API calls to external services, webhooks, or any HTTP endpoint. 
              Configure method, headers, body, and authentication in a few clicks.
            </p>
          </div>
        </div>

        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: THEME.accentColor }}
        />
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            When to use
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Fetch data from REST APIs",
            "Send webhooks to external services",
            "Integrate with third-party platforms",
            "Submit form data programmatically",
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check className="w-4 h-4 text-green-500" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={onStartFromScratch}
          variant="outline"
          className={cn(
            "w-full justify-between h-14 px-5 rounded-xl border-2 transition-all",
            isFromScratch && !selectedTemplateId
              ? "border-[#C800C8] bg-[#C800C8]/5"
              : "border-border hover:border-[#C800C8]/50 hover:bg-[#C800C8]/5"
          )}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5" style={{ color: THEME.accentColor }} />
            <div className="text-left">
              <div className="font-medium">Start from scratch</div>
              <div className="text-xs text-muted-foreground">
                Configure everything manually
              </div>
            </div>
          </div>
          {isFromScratch && !selectedTemplateId && (
            <Check className="w-5 h-5" style={{ color: THEME.accentColor }} />
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">
              or choose a template
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {regularTemplates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplateId === template.id;

            return (
              <motion.button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-[#C800C8] bg-[#C800C8]/5"
                    : "border-border hover:border-[#C800C8]/50 hover:bg-[#C800C8]/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: THEME.iconBg,
                      color: THEME.iconColor,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {template.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {template.description}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4" style={{ color: THEME.accentColor }} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={() => setCurlMode(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-[#C800C8]/50 hover:bg-[#C800C8]/5 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <FileCode className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium text-sm">Import cURL command</div>
              <div className="text-xs text-muted-foreground">
                Paste a cURL to auto-configure
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default InitialiseTab;
