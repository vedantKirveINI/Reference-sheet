import React from "react";
import { SimpleInputGrid } from "@/components/studio/SimpleInputGrid";

export function ParamsTab({ params = [], onChange }) {
  return (
    <div className="space-y-4">
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >
        Query parameters will be appended to your URL.
      </p>
      <SimpleInputGrid
        value={params}
        onChange={onChange}
        showType={true}
        showDescription={false}
        placeholder={{ key: "Parameter name", value: "Parameter value" }}
      />
    </div>
  );
}

export default ParamsTab;
