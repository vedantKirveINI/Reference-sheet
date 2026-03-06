import React, { useState } from "react";

const AddButton = ({
  value,
  levels,
  setShowSearchPopper,
  setActiveLevelIndex,
  fetchData,
}) => {
  const [plusLoading, setPlusLoading] = useState(false);

  if (value) return null;
  return (
    <div
      onClick={async () => {
        setPlusLoading(true);
        await fetchData(levels?.length);
        setPlusLoading(false);
        setActiveLevelIndex(levels?.length);
        setShowSearchPopper(true);
      }}
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      {levels?.length ? <div>&nbsp; /</div> : ""}
      {plusLoading ? (
        "Loading..."
      ) : (
        <img
          style={{
            cursor: "pointer",
            height: 30,
            width: 30,
          }}
          src="https://www.shutterstock.com/image-illustration/3d-illustration-cartoon-blue-circle-600nw-1968384838.jpg"
        />
      )}
    </div>
  );
};

export default AddButton;
