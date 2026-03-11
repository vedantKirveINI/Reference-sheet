import React from "react";
import { SimpleInputGrid } from "@/components/studio/SimpleInputGrid";

export function HeadersTab({ headers = [], onChange }) {
  return (
    <div className="space-y-4">
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >
        Add custom headers to include with your request.
      </p>
      <SimpleInputGrid
        value={headers}
        onChange={onChange}
        showType={true}
        showDescription={false}
        placeholder={{ key: "Header name", value: "Header value" }}
      />
    </div>
  );
}

export default HeadersTab;
