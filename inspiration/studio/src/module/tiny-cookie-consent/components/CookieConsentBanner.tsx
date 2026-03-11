import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTinyCookieConsent } from "../context/TinyCookieConsentContext";

type BannerState = "collapsed" | "expanded";

export function CookieConsentBanner(): JSX.Element | null {
  const { value, acceptAll, rejectAll, setCategories } = useTinyCookieConsent();
  const [state, setState] = React.useState<BannerState>("collapsed");
  const [local, setLocal] = React.useState({
    analytics: value.categories?.analytics ?? false,
    functional: value.categories?.functional ?? false,
    advertising: value.categories?.advertising ?? false,
  });

  React.useEffect(() => {
    setLocal({
      analytics: value.categories?.analytics ?? false,
      functional: value.categories?.functional ?? false,
      advertising: value.categories?.advertising ?? false,
    });
  }, [
    value.categories?.analytics,
    value.categories?.functional,
    value.categories?.advertising,
  ]);

  const saveSelection = React.useCallback(() => {
    setCategories({
      analytics: local.analytics,
      functional: local.functional,
      advertising: local.advertising,
    });
    setState("collapsed");
  }, [local, setCategories]);

  if (value.categories) return null;

  return (
    <div
      style={{ position: "fixed", bottom: 16, left: 16, zIndex: 2147483647 }}
    >
      <AnimatePresence initial={false} mode="wait">
        {state === "collapsed" ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={containerStyle}
          >
            <div style={titleStyle}>We use cookies</div>
            <div style={textStyle}>
              We use necessary cookies to run our site. We also use analytics,
              functional and advertising cookies to personalize content.
            </div>
            <div style={rowStyle}>
              <button style={secondaryButtonStyle} onClick={() => rejectAll()}>
                Reject All
              </button>
              <button style={primaryButtonStyle} onClick={() => acceptAll()}>
                Accept All
              </button>
              <button
                aria-label="Open preferences"
                style={iconButtonStyle}
                onClick={() => setState("expanded")}
              >
                ⋮
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={containerStyle}
          >
            <div style={titleStyle}>Cookie preferences</div>
            <div style={checkboxGroupStyle}>
              <label style={checkboxItemStyle}>
                <input type="checkbox" checked readOnly disabled />
                <span style={checkboxLabelStyle}>
                  Strictly necessary cookies
                </span>
              </label>
              <label style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={local.analytics}
                  onChange={(e) =>
                    setLocal((p) => ({ ...p, analytics: e.target.checked }))
                  }
                />
                <span style={checkboxLabelStyle}>Analytical cookies</span>
              </label>
              <label style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={local.functional}
                  onChange={(e) =>
                    setLocal((p) => ({ ...p, functional: e.target.checked }))
                  }
                />
                <span style={checkboxLabelStyle}>Functional cookies</span>
              </label>
              <label style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={local.advertising}
                  onChange={(e) =>
                    setLocal((p) => ({ ...p, advertising: e.target.checked }))
                  }
                />
                <span style={checkboxLabelStyle}>
                  Advertising/profiling cookies
                </span>
              </label>
            </div>
            <div style={rowStyle}>
              <button
                style={secondaryButtonStyle}
                onClick={() => setState("collapsed")}
              >
                Cancel
              </button>
              <button style={primaryButtonStyle} onClick={saveSelection}>
                Save Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: 360,
  maxWidth: "calc(100vw - 32px)",
  background: "#111",
  color: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 8,
};

const textStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.4,
  color: "#cfcfcf",
  marginBottom: 12,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "flex-end",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #2b6cb0",
  background: "#2b6cb0",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "#fff",
  cursor: "pointer",
};

const iconButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  lineHeight: 1,
};

const checkboxGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};

const checkboxItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const checkboxLabelStyle: React.CSSProperties = {
  fontSize: 14,
};
