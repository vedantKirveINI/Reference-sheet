// import Tooltip from "oute-ds-tooltip";
import { ODSTooltip as Tooltip } from "../ods";

const DisabledTooltip = ({ reasons = [], children }) => {
  const formatTooltipContent = () => {
    if (!reasons.length) return "";

    const displayReasons = reasons.slice(0, 3);
    const hasMore = reasons.length > 3;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          whiteSpace: "nowrap",
        }}
        data-testid="node-rules-disabled-tooltip-container"
      >
        {displayReasons.map((reason, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.25rem",
            }}
          >
            <span>•</span>
            <span>{reason}</span>
          </div>
        ))}
        {hasMore && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "0.25rem",
            }}
          >
            ...
          </div>
        )}
      </div>
    );
  };

  return (
    <Tooltip
      title={formatTooltipContent()}
      placement="top"
      disabled={reasons?.length > 0}
      style={{
        display: "grid",
        cursor: reasons?.length > 0 ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </Tooltip>
  );
};

export default DisabledTooltip;
