import { useRef } from "react";
import { FormulaBar } from "@src/components/formula-fx/src";
import { cn } from "@/lib/utils";

export type TFormulaCellRendererProps = {
  data?: any[];
  className?: string;
  placeholder?: string;
};

export function FormulaCellRenderer({ data = [], className, placeholder }: TFormulaCellRendererProps) {
  const hasData = data?.length > 0;

  return (
    <div className={cn("overflow-auto flex flex-wrap items-center gap-0.5 min-h-[32px]", className)}>
      {hasData ? (
        data.map((item: any, index: number) => (
          <span
            key={`${index}_${item?.displayValue || item?.value}`}
            style={{
              backgroundColor: item?.background,
              color: item?.foreground,
              padding: item?.type === "PRIMITIVES" ? "0" : "0.25rem",
            }}
            className="rounded text-xs font-normal leading-[1.18rem] text-[#263238] mr-0.5"
          >
            {item?.displayValue || item?.value}
          </span>
        ))
      ) : placeholder ? (
        <span className="text-slate-400 text-sm">{placeholder}</span>
      ) : (
        <span className="text-muted-foreground text-sm">&nbsp;</span>
      )}
    </div>
  );
}

export type TFormulaCellEditorProps = {
  value?: any[];
  variables?: any;
  onInputContentChanged?: (content: any[], textContent?: string) => void;
  wrapContent?: boolean;
  className?: string;
  isReadOnly?: boolean;
  placeholder?: string;
  type?: "any" | "string" | "number" | "boolean" | "int" | "object" | "array";
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
};

export function FormulaCellEditor({
  value = [],
  variables,
  onInputContentChanged,
  wrapContent = false,
  className,
  isReadOnly = false,
  placeholder,
  type = "any",
  onKeyDown,
  rowIndex,
  fieldName,
  onBlur,
  autoFocus,
}: TFormulaCellEditorProps & { rowIndex?: number; fieldName?: string }) {
  const formulaBarRef = useRef<any>(null);

  // Generate unique key for FormulaBar to prevent React from reusing instances across different cells
  const formulaBarKey = rowIndex !== undefined && fieldName !== undefined
    ? `formula-bar-${rowIndex}-${fieldName}`
    : 'undefined';

  if (isReadOnly) {
    return <FormulaCellRenderer data={value} className={className} placeholder={placeholder} />;
  }

  return (
    <div
      ref={formulaBarRef}
      className={cn("w-full min-h-[32px] relative", className)}
      onKeyDown={onKeyDown}
    >
      <FormulaBar
        key={formulaBarKey}
        defaultInputContent={value}
        onInputContentChanged={(content: any[], textContent?: string) => {
          onInputContentChanged?.(content, textContent);
        }}
        onBlur={onBlur}
        autoFocus={autoFocus}
        hideBorders={true}
        variables={variables}
        wrapContent={wrapContent}
        type={type}
        placeholder={placeholder}
        errorType="icon"

      />
    </div>
  );
}

export default FormulaCellEditor;
