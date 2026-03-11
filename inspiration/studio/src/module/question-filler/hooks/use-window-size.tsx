import React from "react";

interface IWindowSize {
  width: number | undefined;
  height: number | undefined;
}

const useWindowSize = (): IWindowSize => {
  const [windowSize, setWindowSize] = React.useState<IWindowSize>({
    width: undefined,
    height: undefined,
  });
  React.useEffect(() => {
    const handleWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleWindowSize);
    handleWindowSize();
    return () => {
      window.removeEventListener("resize", handleWindowSize);
    };
  }, []);
  return windowSize;
};

export default useWindowSize;
