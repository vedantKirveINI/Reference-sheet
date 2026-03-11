import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
// import { ODSCircularProgress } from '@src/module/ods';
import { ODSCircularProgress } from "@src/module/ods";

// Safe portal wrapper to handle cleanup errors
const PortalWrapper = ({ children, container }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted || !container) {
    return null;
  }

  try {
    return ReactDOM.createPortal(children, container);
  } catch {
    // If portal creation fails, return null
    return null;
  }
};

export const IFramePreviewWrapper = forwardRef(({ children }, ref) => {
  const iframeRef = useRef(null);
  const [iframeBody, setIframeBody] = useState(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const isMountedRef = useRef(true);
  const portalContainerRef = useRef(null);

  useEffect(() => {
    const currentIframe = iframeRef.current;
    const generateIframe = async () => {
      setIsLoadingScript(true);
      const iframeDoc = iframeRef.current.contentDocument;

      // Clear existing content
      iframeDoc.head.innerHTML = "";
      iframeDoc.body.innerHTML = "";

      // Add base styles
      const style = iframeDoc.createElement("style");
      style.innerHTML = `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: #fff;
          font-family: sans-serif;
        }
        #filler-embed {
          width: 100%;
          height: 100%;
        }
      `;
      iframeDoc.head.appendChild(style);

      // The embed element will be created by the individual preview mode components
      // No need to inject it here

      const script = iframeDoc.createElement("script");
      script.src = "https://form-embed.s3.us-west-2.amazonaws.com/embed.js";
      script.async = true;

      script.onload = () => {
        setIsLoadingScript(false);
      };
      script.onerror = () => {
        setIsLoadingScript(false);
      };
      iframeDoc.body.appendChild(script);

      // Create a dedicated container for React portals
      const portalContainer = iframeDoc.createElement("div");
      portalContainer.id = "react-portal-container";
      portalContainer.style.cssText =
        "width: 100%; height: 100%; position: relative;";
      iframeDoc.body.appendChild(portalContainer);

      portalContainerRef.current = portalContainer;
      setIframeBody(portalContainer);
    };

    if (currentIframe) {
      generateIframe();
    }

    return () => {
      isMountedRef.current = false;

      // Clear portal container reference first
      portalContainerRef.current = null;
      setIframeBody(null);

      if (currentIframe?.contentDocument) {
        try {
          const iframeDoc = currentIframe.contentDocument;
          // Safely clear content without causing DOM errors
          if (iframeDoc.head) {
            iframeDoc.head.innerHTML = "";
          }
          if (iframeDoc.body) {
            iframeDoc.body.innerHTML = "";
          }
        } catch {
          // Silently handle cleanup errors to prevent console spam
          // This can happen when iframe is already unmounted or cross-origin
        }
      }
    };
  }, []);

  // Additional cleanup effect to ensure portal is properly unmounted
  useEffect(() => {
    return () => {
      // Force cleanup of portal container
      if (portalContainerRef.current) {
        try {
          portalContainerRef.current.innerHTML = "";
        } catch {
          // Ignore cleanup errors
        }
        portalContainerRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      restart: async () => {
        if (
          !isMountedRef.current ||
          !iframeRef.current ||
          !iframeRef.current.contentWindow
        ) {
          return;
        }

        try {
          setIsLoadingScript(true);

          // Added delay to ensure all the state's have been updated
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if component is still mounted after delay
          if (!isMountedRef.current) {
            return;
          }

          // Use the script's reload method if available
          if (iframeRef.current.contentWindow?.tinyformsEmbed?.hardReload) {
            iframeRef.current.contentWindow.tinyformsEmbed?.unmountAll();
            iframeRef.current.contentWindow.tinyformsEmbed.hardReload();
          }
        } finally {
          if (isMountedRef.current) {
            setIsLoadingScript(false);
          }
        }
      },
    }),
    [],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "12px",
        }}
        title="filler-preview"
      />
      {iframeBody && portalContainerRef.current && (
        <PortalWrapper container={iframeBody}>{children}</PortalWrapper>
      )}
      {isLoadingScript && (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#666",
            fontSize: "14px",
            zIndex: 3000,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ODSCircularProgress size={60} />
        </div>
      )}
    </div>
  );
});
