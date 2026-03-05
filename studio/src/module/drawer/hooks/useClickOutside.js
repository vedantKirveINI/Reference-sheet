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
        if (!disableSchedule) {
          scheduleHandler(event);
        }
        onClickOutside(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside, delay, disableSchedule]);
}

export default useClickOutside;
