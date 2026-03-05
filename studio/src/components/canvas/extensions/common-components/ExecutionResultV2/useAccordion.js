import { useRef, useEffect, useState, useCallback } from "react";

const useAccordion = ({
  padding = "",
  defaultOpen = true,
  forceOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const accordionRef = useRef(null);
  const contentRef = useRef(null);
  const isInitialMount = useRef(true);
  const prevForceOpen = useRef(forceOpen);

  const handleAccordionToggle = useCallback(
    (e) => {
      e?.stopPropagation();

      if (accordionRef.current) {
        const contentEl = contentRef.current;
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen) {
          const startHeight = 0;
          const initialEndHeight = contentEl.scrollHeight;

          if (padding) {
            contentEl.style.padding = padding;
          }

          const anim = contentEl.animate(
            [
              { height: `${startHeight}px` },
              { height: `${initialEndHeight}px` },
            ],
            { duration: 300, easing: "ease-in-out" }
          );

          anim.onfinish = () => {
            // Set height to auto to allow natural expansion as children open
            contentEl.style.height = "auto";
          };
        } else {
          const startHeight = contentEl.scrollHeight;
          const endHeight = 0;

          const anim = contentEl.animate(
            [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
            { duration: 300, easing: "ease-in-out" }
          );

          anim.onfinish = () => {
            contentEl.style.height = "0px";
            if (padding) {
              contentEl.style.padding = "0px";
            }
          };
        }
      }
    },
    [isOpen, padding]
  );

  // Handle forceOpen prop - when it becomes true, open the accordion
  useEffect(() => {
    if (forceOpen && !prevForceOpen.current && !isOpen) {
      setIsOpen(true);
      // Trigger the animation
      if (accordionRef.current && contentRef.current) {
        const contentEl = contentRef.current;
        const startHeight = 0;
        const initialEndHeight = contentEl.scrollHeight;

        if (padding) {
          contentEl.style.padding = padding;
        }

        const anim = contentEl.animate(
          [{ height: `${startHeight}px` }, { height: `${initialEndHeight}px` }],
          { duration: 300, easing: "ease-in-out" }
        );

        anim.onfinish = () => {
          // Set height to auto to allow natural expansion as children open
          contentEl.style.height = "auto";
        };
      }
    }
    prevForceOpen.current = forceOpen;
  }, [forceOpen, isOpen, padding]);

  useEffect(() => {
    if (isInitialMount.current && !defaultOpen) {
      handleAccordionToggle();
    }
    isInitialMount.current = false;
  }, [defaultOpen, handleAccordionToggle]);

  return {
    isOpen,
    accordionRef,
    contentRef,
    handleAccordionToggle,
  };
};

export default useAccordion;
