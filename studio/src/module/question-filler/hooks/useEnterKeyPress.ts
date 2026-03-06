import { useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";

const useEnterKeyPress = ({ onEnterPress, debounceMs = 300 }) => {
  const isProcessingRef = useRef(false);

  const debouncedEnterPress = useCallback(
    debounce(
      async (event) => {
        if (isProcessingRef.current) {
          return;
        }

        isProcessingRef.current = true;
        try {
          await onEnterPress(event);
        } finally {
          // Reset processing flag after a short delay to lets states gets updated if any
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 100);
        }
      },
      debounceMs,
      { leading: true, trailing: false }
    ),
    [onEnterPress, debounceMs]
  );

  useEffect(() => {
    const handleEnterKeyPress = (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      // Do not trigger next question when Enter is pressed inside country dropdown, dropdown question, or address (country/state) dropdown
      const target = event.target as HTMLElement;
      if (
        target.closest?.("[data-testid=\"country-input-autocomplete\"]") != null ||
        target.closest?.("[data-testid=\"country-input-autocomplete-option\"]") != null ||
        target.closest?.("[data-testid=\"country-picker-search\"]") != null ||
        target.closest?.("[data-testid=\"dropdown-autocomplete\"]") != null ||
        target.closest?.("[data-testid=\"dropdown-autocomplete-option\"]") != null ||
        target.closest?.("[data-testid=\"dropdown-autocomplete-listbox\"]") != null ||
        target.closest?.("[data-testid=\"dropdown-picker-search\"]") != null ||
        target.closest?.("[data-testid=\"address-country-input\"]") != null ||
        target.closest?.("[data-testid=\"address-state-input\"]") != null ||
        target.closest?.("[data-testid=\"address-autocomplete-popover\"]") != null
      ) {
        return;
      }
      // Prevent default behavior and stop propagation to prevent input handlers from interfering
      event.preventDefault();
      event.stopPropagation();
      debouncedEnterPress(event);
    };

    // Use keydown with capture phase to catch events before they reach input handlers
    document.addEventListener("keydown", handleEnterKeyPress, true);

    return () => {
      document.removeEventListener("keydown", handleEnterKeyPress, true);
      // Cancel any pending debounced calls on cleanup
      debouncedEnterPress.cancel();
    };
  }, [debouncedEnterPress]);
};

export default useEnterKeyPress;
