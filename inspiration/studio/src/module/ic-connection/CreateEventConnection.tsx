import React from "react";

export interface CreateEventConnectionProps {
  parent_id: string;
  workspace_id: string;
  onUpdate?: () => void;
}

export function CreateEventConnection({
  parent_id,
  workspace_id,
  onUpdate,
}: CreateEventConnectionProps) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Create Event Connection</p>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Connection setup component placeholder
      </p>
    </div>
  );
}

export default CreateEventConnection;
