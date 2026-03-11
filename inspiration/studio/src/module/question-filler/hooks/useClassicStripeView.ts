import { useEffect, useRef, useMemo } from "react";
import { ViewPort } from "@src/module/constants";

interface UseClassicStripeViewProps {
  stripePaymentQuestionId: string | null | undefined;
  pipeline: any[];
  shouldShowStripe: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
  viewPort?: ViewPort;
}

interface UseClassicStripeViewReturn {
  stripeComponentRef: React.RefObject<HTMLDivElement>;
  stripePlaceholderRef: React.RefObject<HTMLDivElement>;
  stripeQuestionIndex: number;
}

/**
 * Custom hook to handle Stripe payment question UI positioning and height synchronization
 * Manages the positioning of Stripe component outside the map and syncs its dimensions with placeholder
 */
export const useClassicStripeView = ({
  stripePaymentQuestionId,
  pipeline,
  shouldShowStripe,
  parentRef,
  viewPort,
}: UseClassicStripeViewProps): UseClassicStripeViewReturn => {
  const stripeComponentRef = useRef<HTMLDivElement>(null);
  const stripePlaceholderRef = useRef<HTMLDivElement>(null);

  // Find Stripe question index in pipeline
  const stripeQuestionIndex = useMemo(() => {
    if (!stripePaymentQuestionId || !pipeline) return -1;
    const pipelineValue = pipeline.find(
      (q) => q?.qId === stripePaymentQuestionId
    );
    if (!pipelineValue) return null;
    return pipelineValue?.index;
  }, [stripePaymentQuestionId, pipeline]);

  // ResizeObserver for dynamic height synchronization and position calculation
  useEffect(() => {
    if (!stripePaymentQuestionId) return;
    if (!stripeComponentRef.current || !stripePlaceholderRef.current) return;

    const updateHeightAndPosition = () => {
      // Only update if Stripe should be shown
      if (!shouldShowStripe) {
        return;
      }

      const stripeRect = stripeComponentRef.current?.getBoundingClientRect();
      const placeholderRect =
        stripePlaceholderRef.current?.getBoundingClientRect();
      const parentRect = parentRef.current?.getBoundingClientRect();

      if (stripeRect && placeholderRect && parentRect) {
        // Sync height from Stripe component to placeholder
        const height = stripeRect.height;
        if (stripePlaceholderRef.current && height > 0) {
          const placeholder = stripePlaceholderRef.current;

          // Ensure display properties are set for flex container
          placeholder.style.setProperty("display", "block", "important");
          placeholder.style.setProperty(
            "box-sizing",
            "border-box",
            "important"
          );
          placeholder.style.setProperty("flex-shrink", "0", "important");
          placeholder.style.setProperty("flex-grow", "0", "important");

          // Remove all height constraints
          placeholder.style.setProperty("min-height", "0", "important");
          placeholder.style.setProperty("max-height", "none", "important");
          placeholder.style.setProperty("overflow", "visible", "important");

          // Temporarily remove transition to ensure immediate update
          const originalTransition = placeholder.style.transition;
          placeholder.style.transition = "none";

          // Set explicit height with !important to override any CSS
          placeholder.style.setProperty("height", `${height}px`, "important");

          // Force multiple reflows to ensure the change is reflected
          void placeholder.offsetHeight;
          void placeholder.offsetWidth;
          void placeholder.getBoundingClientRect();

          // Restore transition after a brief moment for smooth future updates
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (placeholder) {
                placeholder.style.transition =
                  originalTransition || "height 0.2s ease-in-out";
              }
            });
          });
        }

        // Sync width from placeholder to Stripe component
        const width = placeholderRect.width;
        if (stripeComponentRef.current && width > 0) {
          stripeComponentRef.current.style.width = `${width}px`;
        }

        // Calculate and set position
        const top =
          placeholderRect.top - parentRect.top + parentRef.current.scrollTop;
        const left = placeholderRect.left - parentRect.left;
        if (stripeComponentRef.current) {
          stripeComponentRef.current.style.top = `${top}px`;
          stripeComponentRef.current.style.left = `${left}px`;
        }
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      // Only update if the Stripe component is the one that resized
      const stripeEntry = entries.find(
        (entry) => entry.target === stripeComponentRef.current
      );
      if (stripeEntry) {
        // Use double RAF to ensure update happens after all layout calculations
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            updateHeightAndPosition();
          });
        });
      }
    });

    // Only observe the Stripe component, not the placeholder
    // This prevents circular updates
    if (stripeComponentRef.current) {
      resizeObserver.observe(stripeComponentRef.current);
    }

    // Initial sync
    const timeoutId = setTimeout(() => {
      updateHeightAndPosition();
    }, 100);

    // Update on scroll
    const handleScroll = () => {
      updateHeightAndPosition();
    };
    if (parentRef.current) {
      parentRef.current.addEventListener("scroll", handleScroll);
    }

    // Update on window resize
    window.addEventListener("resize", updateHeightAndPosition);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
      if (parentRef.current) {
        parentRef.current.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", updateHeightAndPosition);
    };
  }, [
    stripePaymentQuestionId,
    stripeQuestionIndex,
    pipeline,
    shouldShowStripe,
    parentRef,
    viewPort,
  ]);

  return {
    stripeComponentRef,
    stripePlaceholderRef,
    stripeQuestionIndex,
  };
};
