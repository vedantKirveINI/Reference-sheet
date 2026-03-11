import React, { forwardRef } from "react";
// import loaderImage from "./asset/loader.gif";

interface LoadingProps {
  question?: any;
  onMount?: () => void;
}

export const Loading = forwardRef(({ onMount }: LoadingProps, ref: any) => {
  // const backgroundImageUrl = loaderImage;
  // question?.settings?.backgroundImageUrl || loaderImage;

  React.useEffect(() => {
    if (onMount) {
      onMount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        // backgroundImage: `url(${backgroundImageUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: "2em",
        cursor: "default",
      }}
    ></div>
  );
});
