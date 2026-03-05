import { useEffect, useState, useRef } from "react";
import { ODSLabel, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { cn } from "@/lib/utils";

interface DefaultValueFxProps {
  settings?: any;
  variables?: any;
  onChange?: (key: any, val: any) => void;
  style?: any;
  isReadOnly?: boolean;
  label?: string;
  placeholder?: string;
  dataTestid?: string;
  hideLabel?: boolean;
}

const DefaultValueFx = ({
  settings,
  variables,
  onChange,
  style,
  isReadOnly = false,
  label = "Default Value",
  placeholder = "Enter default value",
  dataTestid,
  hideLabel = false,
}: DefaultValueFxProps) => {
  const [content, setContent] = useState(settings?.defaultValue?.blocks || []);
  const isInitializedRef = useRef(false);

  // Sync content state when settings prop changes (e.g., when reopening the node)
  useEffect(() => {
    const newBlocks = settings?.defaultValue?.blocks || [];
    setContent(newBlocks);
  }, [settings?.defaultValue?.blocks]);

  // Only call onChange after user interaction, not on initial mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    onChange?.("defaultValue", {
      type: "fx",
      blocks: content,
    });
  }, [content]);

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-[0.85em]",
        typeof style?.containerStyle === "string" && style.containerStyle
      )}
      data-testid={dataTestid || "default-value-fx-container"}
    >
      {!hideLabel && <ODSLabel variant="body1">{label}</ODSLabel>}
      <FormulaBar
        wrapContent
        isReadOnly={isReadOnly}
        placeholder={placeholder}
        hideInputBorders={false}
        defaultInputContent={content}
        onInputContentChanged={(content) => {
          setContent(content);
        }}
        variables={variables}
        slotProps={{
          container: {
            className: cn(
              "min-h-[2.75rem] max-h-[200px] overflow-auto",
              typeof style?.fxStyle === "string" && style.fxStyle
            ),
          },
        }}
      />
    </div>
  );
};

export default DefaultValueFx;
