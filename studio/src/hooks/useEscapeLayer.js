import { useEffect, useCallback, useId, useContext } from "react";
import EscapeStackContext from "../contexts/EscapeStackContext";

const useEscapeLayer = ({ 
  id: customId, 
  onEscape, 
  enabled = true, 
  priority = 0 
}) => {
  const generatedId = useId();
  const id = customId || generatedId;
  
  const escapeStack = useContext(EscapeStackContext);

  const stableOnEscape = useCallback((event) => {
    if (onEscape) {
      onEscape(event);
    }
  }, [onEscape]);

  useEffect(() => {
    if (!escapeStack) {
      return;
    }
    
    if (enabled) {
      escapeStack.register(id, stableOnEscape, priority);
    } else {
      escapeStack.unregister(id);
    }

    return () => {
      escapeStack.unregister(id);
    };
  }, [escapeStack, id, stableOnEscape, enabled, priority]);

  const isTopLayer = escapeStack ? escapeStack.isTopLayer(id) : false;

  return {
    layerId: id,
    isTopLayer,
  };
};

export default useEscapeLayer;
