// hooks/useCrossAppLogout.js
import { useEffect } from "react";

export default function useCrossAppLogout({ onLogout = () => {}, hubOrigin }) {
  useEffect(() => {
    if (!hubOrigin) return;
    // Create iframe only once
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${hubOrigin}/hub/`;
    iframe.id = "logout-iframe";
    iframe.onload = () => {
    };
    document.body.appendChild(iframe);

    // Listen for logout signal from hub iframe
    const handleMessage = (event) => {
      if (event.origin !== hubOrigin) return;
      if (event.data === "logout") {
        onLogout?.(); // Your app's logout logic
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.removeChild(iframe);
    };
  }, [onLogout]);
}
