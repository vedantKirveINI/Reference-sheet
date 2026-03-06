import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

const XIcon = icons.x;

const EmbedAuthBanner = ({ onSignUp }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "10px 20px",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "#f1f5f9",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
      data-testid="embed-auth-banner"
    >
      <span style={{ opacity: 0.9 }}>
        Create a free account to save and publish your work
      </span>
      <Button
        size="sm"
        onClick={onSignUp}
        className="rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-medium px-4 h-7"
      >
        Sign up free
      </Button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Dismiss"
      >
        <XIcon style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  );
};

export default EmbedAuthBanner;
