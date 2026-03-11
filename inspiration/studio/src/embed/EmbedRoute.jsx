import React from "react";
import { useSearchParams } from "react-router-dom";
import { ICStudioContextProvider } from "@/ICStudioContext";
import EmbedStudioWrapper from "@/embed/EmbedStudioWrapper";

const VALID_TYPES = ["form", "workflow", "sequence"];

const EmbedRoute = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  if (!type || !VALID_TYPES.includes(type)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
        <p>Invalid or missing asset type. Expected one of: {VALID_TYPES.join(", ")}</p>
      </div>
    );
  }

  return (
    <ICStudioContextProvider>
      <EmbedStudioWrapper type={type} />
    </ICStudioContextProvider>
  );
};

export default EmbedRoute;
