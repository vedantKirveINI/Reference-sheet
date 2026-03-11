import React from "react";
import Section from "../section";

const FilteredFxDataBlocks = ({
  filteredDataBlocks,
  onDataBlockClick = () => {},
  isVerbose = false,
  showArrayStructure = false,
}) => {
  return (
    <Section
      data={filteredDataBlocks}
      onDataBlockClick={onDataBlockClick}
      isVerbose={isVerbose}
      isFiltered={true}
      showArrayStructure={showArrayStructure}
    />
  );
};

export default FilteredFxDataBlocks;
