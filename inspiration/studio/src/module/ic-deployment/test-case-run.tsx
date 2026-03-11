import React from "react";

export interface TestCaseRunProps {
  [key: string]: any;
}

export function TestCaseRun(props: TestCaseRunProps) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Test Case Run</p>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Test case run component placeholder
      </p>
    </div>
  );
}

export default TestCaseRun;
