import React, { useState, useRef } from "react";
import { FormulaBarV2 } from "./FormulaBarV2.jsx";

export default {
  title: "ODS/FormulaBarV2",
  component: FormulaBarV2,
  parameters: {
    layout: "centered",
  },
};

const sampleProperties = [
  { name: "Title", label: "Title", type: "text" },
  { name: "Amount", label: "Amount", type: "number" },
  { name: "Reviewed", label: "Reviewed", type: "checkbox" },
  { name: "Due Date", label: "Due Date", type: "date" },
  { name: "Status", label: "Status", type: "select" },
  { name: "Assignee", label: "Assignee", type: "person" },
  { name: "Tasks", label: "Tasks", type: "relation" },
  { name: "Monthly Summary", label: "Monthly Summary", type: "relation" },
  { name: "July 2023 Amount", label: "July 2023 Amount", type: "formula" },
  { name: "October 2023 Amount", label: "October 2023 Amount", type: "formula" },
];

export const Default = () => {
  const [isOpen, setIsOpen] = useState(true);
  const ref = useRef();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open Formula Editor
      </button>
      
      <FormulaBarV2
        ref={ref}
        isOpen={isOpen}
        properties={sampleProperties}
        onClose={() => setIsOpen(false)}
        onSave={(formula, tokens) => {
          console.log("Saved formula:", formula);
          console.log("Tokens:", tokens);
        }}
        onDiscard={() => console.log("Discarded")}
        onValueChange={(value, tokens, validation) => {
          console.log("Value changed:", value);
          console.log("Validation:", validation);
        }}
      />
    </div>
  );
};

export const WithAIPrompt = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open Formula Editor with AI
      </button>
      
      <FormulaBarV2
        isOpen={isOpen}
        properties={sampleProperties}
        showAIPrompt={true}
        aiPromptPlaceholder="Ask AI to write or edit your formula..."
        onClose={() => setIsOpen(false)}
        onSave={(formula) => console.log("Saved:", formula)}
      />
    </div>
  );
};

export const WithDefaultValue = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open with Pre-filled Formula
      </button>
      
      <FormulaBarV2
        isOpen={isOpen}
        properties={sampleProperties}
        defaultValue={`/* Divide the transaction amount by 14 */
if(empty(prop("Amount")),
  0,
  prop("Amount") / 14
)`}
        onClose={() => setIsOpen(false)}
        onSave={(formula) => console.log("Saved:", formula)}
      />
    </div>
  );
};

export const WithErrors = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open with Error Example
      </button>
      
      <FormulaBarV2
        isOpen={isOpen}
        properties={sampleProperties}
        defaultValue="sum(1, 2"
        onClose={() => setIsOpen(false)}
        onSave={(formula) => console.log("Saved:", formula)}
      />
    </div>
  );
};

const samplePreviewData = {
  Title: "Sample Transaction",
  Amount: 250,
  Reviewed: true,
  "Due Date": "2024-01-15",
  Status: "Active",
};

export const DebugMode = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open with Debug Mode
      </button>
      
      <FormulaBarV2
        isOpen={isOpen}
        properties={sampleProperties}
        previewData={samplePreviewData}
        defaultValue={`prop("Amount") * 2 + 100`}
        debugMode={true}
        onClose={() => setIsOpen(false)}
        onSave={(formula) => console.log("Saved:", formula)}
      />
    </div>
  );
};

export const WithPreviewData = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#2eaadc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Open with Preview Data (Amount=250)
      </button>
      
      <FormulaBarV2
        isOpen={isOpen}
        properties={sampleProperties}
        previewData={samplePreviewData}
        defaultValue={`prop("Amount") / 14`}
        onClose={() => setIsOpen(false)}
        onSave={(formula) => console.log("Saved:", formula)}
      />
    </div>
  );
};
