import React, { useState } from "react";
// import ODSTextField from "oute-ds-text-field";
// import ODSLabel from "oute-ds-label";
import { ODSTextField, ODSLabel } from "@src/module/ods";

const SheetLimitOffset = ({
  offset,
  limit,
  limitOffsetClause = "",
  updateLimitOffsetData = () => {},
}) => {
  const [limitOffsetData, setLimitOffsetData] = useState({
    offset,
    limit,
    limitOffsetClause,
  });

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        gap: "1rem",
      }}
      data-testid="limit-offset-section"
    >
      <div style={{ width: "100%" }}>
        <ODSLabel
          variant="subtitle1"
          fontWeight="600"
          data-testid="limit-label"
        >
          Limit
        </ODSLabel>
        <ODSTextField
          type="number"
          placeholder="Enter limit"
          data-testid="limit-input"
          className="black no-spinner"
          value={limitOffsetData?.limit}
          fullWidth
          onChange={(e) => {
            const value = e.target.value;
            setLimitOffsetData((prev) => {
              const data = {
                ...prev,
                limit: value,
                limitOffsetClause: `LIMIT ${value} ${
                  prev?.offset ? `OFFSET ${prev?.offset}` : ""
                }`,
              };
              updateLimitOffsetData(data);
              return data;
            });
          }}
          sx={{
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& input[type=number]::-webkit-outer-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
          }}
        />
      </div>

      <div style={{ width: "100%" }}>
        <ODSLabel
          variant="subtitle1"
          fontWeight="600"
          data-testid="offset-label"
        >
          Offset
        </ODSLabel>

        <ODSTextField
          type="number"
          placeholder="Enter offset"
          data-testid="offset-input"
          className="black no-spinner"
          value={limitOffsetData?.offset}
          fullWidth
          onChange={(e) => {
            const value = e.target.value;
            setLimitOffsetData((prev) => {
              const data = {
                ...prev,
                offset: value,
                limitOffsetClause: `${
                  prev?.limit ? `LIMIT ${prev?.limit}` : ""
                } OFFSET ${value}`,
              };
              updateLimitOffsetData(data);
              return data;
            });
          }}
          // onWheel={(e) => e.target.blur()}
          sx={{
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& input[type=number]::-webkit-outer-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
          }}
        />
      </div>
    </div>
  );
};

export default SheetLimitOffset;
