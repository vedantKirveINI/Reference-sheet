import React, { useEffect, useState } from "react";
import { ODSVTab as VTab } from "../../../../index.js";
import Section from "../section/index.jsx";
import EvaluateFx from "../evaluate-fx/index.jsx";
import { EVALUATE_FX } from "../../constants/categories.js";

const AllFxDataBlocks = ({
  allFxDataBlocks,
  onDataBlockClick,
  displayFunctionsFor = "all",
  evaluateFxRef = null,
  isVerbose = false,
  showArrayStructure = false,
}) => {
  const [tab, setTab] = useState([]);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (allFxDataBlocks)
      Object.keys(allFxDataBlocks).forEach((key) => {
        if (key === EVALUATE_FX) {
          setTab((prev) => [
            ...prev,
            {
              label: <div data-testid={`${key}_tab`}>{key}</div>,
              sx: {
                minWidth: "8rem",
                fontSize: "1rem !important",
              },
              panelComponent: EvaluateFx,
              panelComponentProps: {
                contentRef: allFxDataBlocks[key],
                ref: evaluateFxRef,
              },
              iconPosition: "more-options",
            },
          ]);
        } else {
          setTab((prev) => [
            ...prev,
            {
              label: <div data-testid={`${key}_tab`}>{key}</div>,
              sx: {
                minWidth: "8rem",
                fontSize: "1rem !important",
              },
              panelComponent: Section,
              panelComponentProps: {
                data: allFxDataBlocks[key],
                onDataBlockClick,
                isVerbose,
                showArrayStructure,
              },
              iconPosition: "more-options",
            },
          ]);
        }
      });
    setInitialized(true);
  }, [allFxDataBlocks]);
  return (
    initialized &&
    tab?.length > 0 && (
      <VTab
        tabData={tab}
        defaultTabIndex={displayFunctionsFor === "all" ? 1 : 0}
      />
    )
  );
};

export default AllFxDataBlocks;
