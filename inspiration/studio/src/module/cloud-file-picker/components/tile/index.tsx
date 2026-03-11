
import React, { useState } from "react";
import { getContainerStyle } from "./styles";
const Tile = ({
  index,
  activeLevelIndex,
  level,
  setActiveLevelIndex,
  setShowSearchPopper,
  fetchData,
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{ ...getContainerStyle(), display: "flex", flexDirection: "row", alignItems: "center" }}
      onClick={() => {
        setActiveLevelIndex(index);
        setShowSearchPopper(true);
      }}
      key={index}
    >
      {level?.name}
      {activeLevelIndex === index && !loading ? (
        <img
          onClick={async () => {
            setLoading(true);
            await fetchData(index);
            setLoading(false);
            setActiveLevelIndex(index);
            setShowSearchPopper(true);
          }}
          style={{ height: 15, width: 15, marginLeft: 10, cursor: "pointer" }}
          src="https://cdn-icons-png.flaticon.com/512/61/61225.png"
        />
      ) : null}
      {loading ? "Loading..." : null}
    </div>
  );
};

export default Tile;
