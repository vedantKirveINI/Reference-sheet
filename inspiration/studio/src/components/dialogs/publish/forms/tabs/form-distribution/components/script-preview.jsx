import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import {
  generateEmbedScript,
  extractDomainFromUrl,
  BASE_SCRIPT,
} from "../../../../utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ScriptPreview = ({ assetId, mode }) => {
  const { embedMode, embedSettings } = useFormPublishContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const getScriptContent = useCallback(() => {
    const fullUrl = process.env.REACT_APP_FORM_URL;
    const domain = extractDomainFromUrl(fullUrl);
    const divContent = generateEmbedScript(
      embedMode,
      assetId,
      domain,
      mode,
      embedSettings,
    );
    return `${BASE_SCRIPT}
${divContent}`;
  }, [embedMode, assetId, embedSettings, mode]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getScriptContent());
      toast.success("Code copied to clipboard!", {
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to copy code:", err);
      toast.error("Failed to copy code", {
        position: "top-right",
      });
    }
  }, [getScriptContent]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className="w-full space-y-3" data-testid="script-preview">
      {/* Header with description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border">
            {icons.braces && (
              <icons.braces className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Embed Code
            </h4>
            <p className="text-xs text-muted-foreground">
              Copy this code and paste it into your website's HTML
            </p>
          </div>
        </div>
      </div>

      {/* Code Block */}
      <div className="border border-border rounded-lg bg-muted/50 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : "100px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[300px]">
            <div className="p-4 bg-background">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words m-0">
                <code>{getScriptContent()}</code>
              </pre>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                  data-testid="expand-button"
                >
                  {isExpanded ? (
                    <>
                      {icons.chevronUp && (
                        <icons.chevronUp className="w-4 h-4" />
                      )}
                      Collapse
                    </>
                  ) : (
                    <>
                      {icons.chevronDown && (
                        <icons.chevronDown className="w-4 h-4" />
                      )}
                      Expand
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Collapse code view" : "Expand code view"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8 gap-2 text-xs"
                  data-testid="copy-button"
                >
                  {icons.copy && <icons.copy className="w-4 h-4" />}
                  Copy Code
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy embed code to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Helpful Tip */}
      <Card className="p-3 bg-muted/50 border-border">
        <div className="flex items-start gap-2">
          {icons.info && (
            <icons.info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground mb-0.5">
              Quick Tip
            </p>
            <p className="text-xs text-muted-foreground">
              Paste this code anywhere in your website's HTML where you want the
              form to appear. The form will automatically load and display to
              your visitors.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScriptPreview;
