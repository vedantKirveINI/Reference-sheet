// import { ODSCircularProgress } from '@src/module/ods';
import { ODSCircularProgress } from "@src/module/ods";
const SuspenseLoader = ({ message = "", style = {}, size = "1.5rem" }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        top: "6rem",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "white",
        borderRadius: "8px",
        padding: "12px",
        boxSizing: "border-box",
        fontSize: "1rem",
        boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.2)",
        ...style,
      }}
    >
      <ODSCircularProgress size={size} /> {message}
    </div>
  );
};

export default SuspenseLoader;
