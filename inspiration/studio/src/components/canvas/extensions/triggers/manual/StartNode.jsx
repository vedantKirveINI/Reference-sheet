import React, { forwardRef, useImperativeHandle } from "react";

const StartNode = forwardRef(({ data, variables }, ref) => {
  useImperativeHandle(ref, () => ({
    getData: () => {
      return data || {};
    },
  }));

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 13, color: "#64748b" }}>
        This workflow starts when manually triggered.
      </p>
    </div>
  );
});

export default StartNode;
