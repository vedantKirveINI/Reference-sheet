import React, { useEffect, useState } from "react";
import { ODSIcon as Icon } from "../../../../index.js";
import classes from "./FxPopper.module.css";
import { arithmeticData } from "../../data/arithmetic-data.js";
import { textData } from "../../data/text-data.js";
import { logicalData } from "../../data/logical-data.js";
import { dateData } from "../../data/date-data.js";
import { arrayData } from "../../data/array-data.js";
import { otherData } from "../../data/other-data.js";
import {
  ARITHMETIC,
  ARRAY,
  DATE_AND_TIME,
  EVALUATE_FX,
  LOGICAL,
  OTHER,
  TABLE_COLUMNS,
  TEXT_AND_BINARY,
  VARIABLES,
} from "../../constants/categories.js";
import { searchAndConsolidate } from "../../utils/search-utils.js";
import AllFxDataBlocks from "../all-fx-data-blocks/index.jsx";
import FilteredFxDataBlocks from "../filtered-fx-data-blocks/index.jsx";
import { cloneDeep } from "lodash";
import { FIELDS } from "../../constants/types.js";
import { filterDataForDisplay } from "../../utils/fx-utils.jsx";
const FxPopover = ({
  searchText = "",
  showVariables = true,
  showArithmetic = true,
  showTextAndBinary = true,
  showLogical = true,
  showDateAndTime = true,
  showArray = true,
  showOther = true,
  tableColumns = [],
  variables = {},
  contentRef = null,
  evaluateFxRef = null,
  displayFunctionsFor = "all",
  isVerbose = false,
  showArrayStructure = false,
  onClose = () => {},
  onDataBlockClick = () => {},
}) => {
  const [allFxDataBlocks, setAllFxDataBlocks] = useState({});
  const [filteredDataBlocks, setFilteredDataBlocks] = useState(null);

  // Helper function to check if filtered data has any content
  const hasContent = (data) => {
    if (!data || typeof data !== "object") return false;

    return Object.keys(data).some((key) => {
      if (Array.isArray(data[key])) {
        return data[key].length > 0;
      }
      return data[key] !== null && data[key] !== undefined;
    });
  };

  useEffect(() => {
    let allFxBlocks = {};

    // Only add EVALUATE_FX if displayFunctionsFor is "all"
    // if (displayFunctionsFor === "all") {
    // as per Vedant's request enabling Evaluate FX for tables and all
    allFxBlocks = {
      ...allFxBlocks,
      [EVALUATE_FX]: contentRef,
    };
    // }

    if (displayFunctionsFor === "tables") {
      allFxBlocks = {
        ...allFxBlocks,
        [TABLE_COLUMNS]: { [FIELDS]: tableColumns },
      };
    }

    // Only add VARIABLES if displayFunctionsFor is "all"
    if (showVariables && displayFunctionsFor === "all") {
      allFxBlocks = {
        ...allFxBlocks,
        [VARIABLES]: variables,
      };
    }

    if (showArithmetic) {
      const filteredArithmetic = filterDataForDisplay(
        arithmeticData,
        displayFunctionsFor
      );
      if (hasContent(filteredArithmetic)) {
        allFxBlocks = {
          ...allFxBlocks,
          [ARITHMETIC]: filteredArithmetic,
        };
      }
    }

    if (showTextAndBinary) {
      const filteredText = filterDataForDisplay(textData, displayFunctionsFor);
      if (hasContent(filteredText)) {
        allFxBlocks = {
          ...allFxBlocks,
          [TEXT_AND_BINARY]: filteredText,
        };
      }
    }

    if (showLogical) {
      const filteredLogical = filterDataForDisplay(
        logicalData,
        displayFunctionsFor
      );
      if (hasContent(filteredLogical)) {
        allFxBlocks = {
          ...allFxBlocks,
          [LOGICAL]: filteredLogical,
        };
      }
    }

    if (showDateAndTime) {
      const filteredDate = filterDataForDisplay(dateData, displayFunctionsFor);
      if (hasContent(filteredDate)) {
        allFxBlocks = {
          ...allFxBlocks,
          [DATE_AND_TIME]: filteredDate,
        };
      }
    }

    if (showArray) {
      const filteredArray = filterDataForDisplay(
        arrayData,
        displayFunctionsFor
      );
      if (hasContent(filteredArray)) {
        allFxBlocks = {
          ...allFxBlocks,
          [ARRAY]: filteredArray,
        };
      }
    }

    if (showOther) {
      const filteredOther = filterDataForDisplay(
        otherData,
        displayFunctionsFor
      );
      if (hasContent(filteredOther)) {
        allFxBlocks = {
          ...allFxBlocks,
          [OTHER]: filteredOther,
        };
      }
    }

    setAllFxDataBlocks({ ...allFxBlocks });
  }, [
    showVariables,
    showArithmetic,
    showTextAndBinary,
    showLogical,
    showDateAndTime,
    showArray,
    showOther,
    contentRef,
    displayFunctionsFor,
  ]);
  useEffect(() => {
    const result = searchAndConsolidate(cloneDeep(allFxDataBlocks), searchText);
    if (
      Object.keys(result).some((key) => {
        return result[key].length > 0;
      })
    ) {
      setFilteredDataBlocks(result);
    } else {
      setFilteredDataBlocks(null);
    }
  }, [searchText, allFxDataBlocks]);
  return (
    <div className={classes["fx-popper-content"]}>
      {!filteredDataBlocks && (
        <AllFxDataBlocks
          allFxDataBlocks={allFxDataBlocks}
          onDataBlockClick={onDataBlockClick}
          displayFunctionsFor={displayFunctionsFor}
          evaluateFxRef={evaluateFxRef}
          isVerbose={isVerbose}
          showArrayStructure={showArrayStructure}
        />
      )}
      {filteredDataBlocks && (
        <FilteredFxDataBlocks
          filteredDataBlocks={filteredDataBlocks}
          onDataBlockClick={(block) => onDataBlockClick(block, searchText)}
          isVerbose={isVerbose}
          showArrayStructure={showArrayStructure}
        />
      )}
      <div className={classes["fx-popper-close"]}>
        <Icon
          outeIconName="OUTECloseIcon"
          outeIconProps={{
            sx: { color: "black", width: "0.5em", height: "0.5em" },
          }}
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default FxPopover;
