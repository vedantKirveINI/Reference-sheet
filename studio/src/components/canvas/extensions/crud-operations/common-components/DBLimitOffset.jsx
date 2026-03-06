import React, { useState } from "react";
import isValidLimit from "../../common-utils/validLimit";
import { ODSLabel, ODSTextField } from "@src/module/ods";
import { DEFAULT_LIMIT } from "../../constants/limit";
const DBLimitOffset = ({
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
      style={{ display: "flex", width: "100%", gap: "1rem", padding: "1rem" }}
    >
      <div style={{ width: "50%" }}>
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
            let value = e.target.value;
            value = value === "" ? DEFAULT_LIMIT : value;

            if (!isValidLimit(value)) return;

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
          style={({
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
          })}
        />
      </div>

      <div style={{ width: "50%" }}>
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
          style={({
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
          })}
        />
      </div>
    </div>
  );
};

export default DBLimitOffset;
