import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const PreviewPanel = ({ result, content = [], onFixWithAI = () => {}, compact = false }) => {
  const hasContent = content && content.length > 0;
  const [isFixing, setIsFixing] = useState(false);
  
  if (!hasContent) {
    return null;
  }

  const handleFixClick = async () => {
    setIsFixing(true);
    try {
      await onFixWithAI(result?.error);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-1")}>
      <div className="flex items-center justify-between gap-2 py-1">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">PREVIEW</span>
        {result?.success && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 dark:bg-green-900/30 dark:text-green-400">
            {result.type || "string"}
          </Badge>
        )}
      </div>
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          {result?.success ? (
            <div className="flex flex-col gap-1 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Result:</span>
              <code className="text-sm text-foreground font-mono break-all">
                {typeof result.value === "object"
                  ? JSON.stringify(result.value, null, 2)
                  : String(result.value)}
              </code>
            </div>
          ) : result?.error ? (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <span>{getLucideIcon("AlertTriangle", { size: 16 })}</span>
                <span className="text-sm">{result.error}</span>
              </div>
              <Button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
                onClick={handleFixClick}
                disabled={isFixing}
                size="sm"
              >
                {isFixing ? (
                  <>
                    <Spinner className="size-3" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <span>{getLucideIcon("Sparkles", { size: 14 })}</span>
                    Fix with AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Enter a formula to see the preview
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPanel;
