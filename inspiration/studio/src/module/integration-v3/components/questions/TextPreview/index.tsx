import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { QuestionTab } from "@oute/oute-ds.core.constants";

export interface TextPreviewProps {
  onChange?: (value: any) => void;
  isCreator?: boolean;
  theme?: any;
  question?: any;
  answers?: any;
  state?: any;
  goToTab?: (tab: any) => void;
  dataTestId?: string;
}

const removeTagsFromString = (str: string): string => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
};

export function TextPreview({
  isCreator,
  theme,
  question,
  answers = {},
  state = {},
  goToTab = () => {},
  dataTestId,
}: TextPreviewProps) {
  const [value, setValue] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const contentType = question?.settings?.contentType;
  const dynamicContent = question?.settings?.dynamicContent;
  const staticContent = question?.settings?.staticContent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(removeTagsFromString(value));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const safeStringify = (val: any) => {
    try {
      return JSON.stringify(val);
    } catch (error) {
      return "";
    }
  };

  const resolveFX = (_value: any) => {
    try {
      const res = OuteServicesFlowUtility?.resolveValue(
        { ...answers, ...state },
        "",
        _value,
        null
      );
      return res?.value;
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    if (contentType === "Dynamic") {
      const resolvedValue = resolveFX(dynamicContent);
      if (typeof resolvedValue === "string") {
        setValue(resolvedValue);
      } else {
        setValue(safeStringify(resolvedValue));
      }
    } else {
      setValue(staticContent || "");
    }
  }, [contentType, dynamicContent, staticContent, answers, state]);

  const onClickEdit = useCallback(() => {
    if (isCreator && goToTab) {
      goToTab(QuestionTab.DATA);
    }
  }, [goToTab, isCreator]);

  const isDisabled = isCopied || !removeTagsFromString(value);

  if (isCreator) {
    return (
      <div
        className={cn(
          "p-4 rounded-lg border border-dashed border-muted-foreground/30",
          "bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors",
          "text-sm text-muted-foreground"
        )}
        style={{ fontFamily: theme?.styles?.fontFamily || "inherit" }}
        data-testid={dataTestId}
        onClick={onClickEdit}
      >
        <div className="flex items-start gap-2">
          <Edit className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            This is a read-only preview field. Use it to show important instructions, 
            reference information, or personalized messages. Choose between static text 
            or dynamic values pulled from previous answers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "p-4 rounded-lg border border-border/50",
          "bg-muted/30 min-h-[80px]",
          "text-sm leading-relaxed",
          "overflow-y-auto max-h-[300px]",
          "whitespace-pre-wrap break-words"
        )}
        style={{ 
          color: theme?.styles?.buttons,
          fontFamily: theme?.styles?.fontFamily || "inherit" 
        }}
        data-testid={dataTestId}
        dangerouslySetInnerHTML={{ __html: value }}
      />
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={isDisabled}
          className={cn(
            "gap-2 transition-all",
            isCopied && "text-green-600 border-green-200 bg-green-50"
          )}
          data-testid={`${dataTestId}-copy-button`}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default TextPreview;
