import React, { forwardRef, useImperativeHandle } from "react";

export const ConditionComposer = forwardRef(({ initialValue, schema, ...props }: any, ref: any) => {
  useImperativeHandle(ref, () => ({
    getCondition: () => initialValue || {},
    getValue: () => initialValue || {},
  }));

  return (
    <div className="p-4 border border-dashed border-[#cfd8dc] rounded-md text-sm text-[#607d8b] text-center">
      Filter Composer
    </div>
  );
});

ConditionComposer.displayName = "ConditionComposer";
