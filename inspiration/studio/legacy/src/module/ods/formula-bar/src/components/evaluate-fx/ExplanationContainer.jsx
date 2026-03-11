import React from "react";
import DataBlock from '../data-block/index.jsx';

const ExplanationContainer = ({ data = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      {data.length > 0 ? (
        data.map((d, index) => (
          <div
            key={`explanation-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "0.5rem",
              background: "#f5f5f5",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <DataBlock block={d} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#212121", flex: 1 }}>
              {d.description}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: "1rem" }}>No functions added.</div>
      )}
    </div>
  );
};

export default ExplanationContainer;
