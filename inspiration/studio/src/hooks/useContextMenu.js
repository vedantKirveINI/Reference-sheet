import { useEffect } from "react";

const useContextMenu = () => {
  useEffect(() => {
    const contextListener = (e) => e.preventDefault();
    window.addEventListener("contextmenu", contextListener);
    return () => {
      window.removeEventListener("contextmenu", contextListener);
    };
  }, []);

  return null;
};

export default useContextMenu;
