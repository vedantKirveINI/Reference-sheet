import { useEffect } from "react";

function useClickOutside(
  ref,
  onClickOutside,
  delay = 200,
  disableSchedule = false
) {
  useEffect(() => {
    if (!ref.current) return;

    const scheduleHandler = (event) => {
      // Store the target element reference before it might be removed
      const targetElement = event.target;

      setTimeout(() => {
        let elementToClick = targetElement;

        if (elementToClick && document.contains(elementToClick)) {
          elementToClick.click();
        }
      }, delay);
    };

    const appRoot = document.getElementById("root");

    const handleClickOutside = (event) => {
      const isPortalClick = appRoot && !appRoot.contains(event.target);
      const clickedInsideRef = ref?.current?.contains(event.target);

      if (!clickedInsideRef && !isPortalClick) {
        // Schedule the click first, then call onClickOutside
        if (!disableSchedule) scheduleHandler(event);
        onClickOutside(event);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        // Schedule the click first, then call onClickOutside
        if (!disableSchedule) scheduleHandler(event);
        onClickOutside(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [ref, onClickOutside, delay, disableSchedule]);
}

export default useClickOutside;
