import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";

const EscapeStackContext = createContext(null);

// Module-level ref to allow non-React code to check if escape stack has entries
// This is used by canvas keyboard shortcuts to avoid handling Escape when a layer is active
// Note: This assumes a single EscapeStackProvider instance in the app
let globalStackRef = null;

export const hasActiveEscapeLayers = () => {
  // Safely check if the escape stack has any registered layers
  // Returns false if provider is not mounted or no layers are registered
  if (!globalStackRef || !globalStackRef.current) {
    return false;
  }
  const hasLayers = globalStackRef.current.length > 0;
  return hasLayers;
};

export const useEscapeStack = () => {
  const context = useContext(EscapeStackContext);
  if (!context) {
    throw new Error("useEscapeStack must be used within an EscapeStackProvider");
  }
  return context;
};

export const EscapeStackProvider = ({ children }) => {
  const stackRef = useRef([]);
  
  // Sync with module-level ref for global access
  globalStackRef = stackRef;

  const register = useCallback((id, onEscape, priority = 0) => {
    stackRef.current = stackRef.current.filter((layer) => layer.id !== id);
    stackRef.current.push({ id, onEscape, priority, timestamp: Date.now() });
    stackRef.current.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.timestamp - a.timestamp;
    });
  }, []);

  const unregister = useCallback((id) => {
    stackRef.current = stackRef.current.filter((layer) => layer.id !== id);
  }, []);

  const isTopLayer = useCallback((id) => {
    if (stackRef.current.length === 0) return false;
    return stackRef.current[0].id === id;
  }, []);

  const getStackSize = useCallback(() => {
    return stackRef.current.length;
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (stackRef.current.length > 0) {
          const topLayer = stackRef.current[0];
          if (topLayer.onEscape) {
            event.preventDefault();
            event.stopPropagation();
            topLayer.onEscape(event);
          }
        }
      }
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, []);

  const value = {
    register,
    unregister,
    isTopLayer,
    getStackSize,
  };

  return (
    <EscapeStackContext.Provider value={value}>
      {children}
    </EscapeStackContext.Provider>
  );
};

export default EscapeStackContext;
