import { IMAGE_SOURCE } from "../../utils/contants";

export const containerStyles = ({ imageSource }) => {
  return {
    position: "relative" as const,
    boxSizing: "border-box" as const,
    padding: `1.25rem 1.5rem 1.25rem 1.5rem`,
    width: "100%",
    display: "flex",
    fontSize: "12px",
    flexDirection: "column" as const,
    height: "100%",
    gap: imageSource === "Unsplash" ? "1.25rem" : "1.5rem",
  };
};
