import React, { forwardRef, useImperativeHandle, useState, useCallback } from "react";

export const FormulaBar = forwardRef(({
  displayFunctionsFor,
  tableColumns,
  defaultInputContent,
  placeholder,
  onInputContentChanged,
  wrapContent,
  slotProps,
  ...props
}: any, ref: any) => {
  const [content, setContent] = useState(() => {
    if (Array.isArray(defaultInputContent)) {
      return defaultInputContent.map((b: any) => b.text || b.value || "").join("");
    }
    return "";
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    const blocks = text ? [{ type: "text", text }] : [];
    onInputContentChanged?.(blocks, text);
  }, [onInputContentChanged]);

  useImperativeHandle(ref, () => ({
    getContent: () => content,
  }));

  const containerProps = slotProps?.container || {};
  const { style: containerStyle, ...restContainerProps } = containerProps;

  return (
    <div
      className="border border-[#d1d5db] rounded-md overflow-hidden"
      style={containerStyle}
      {...restContainerProps}
    >
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder || "Enter expression"}
        className="w-full h-full p-2 text-sm font-mono border-none outline-none resize-none bg-transparent"
      />
    </div>
  );
});

FormulaBar.displayName = "FormulaBar";
