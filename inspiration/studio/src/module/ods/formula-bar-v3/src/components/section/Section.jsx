import React from "react";
import { ODSLabel as Label } from "../../../../index.js";
import classes from "./Section.module.css";
import {
  FIELDS,
  FUNCTIONS,
  GLOBAL_VARIABLES,
  HIDDEN_PARAMS,
  KEYWORDS,
  LOCAL_VARIABLES,
  NODE_VARIABLES,
  OPERATORS,
  QUERY_PARAMS,
  VARIABLES,
} from "../../constants/types.js";
import GridDataBlocks from "./GridDataBlocks.jsx";
import NodeVariableSection from "../node-variable-section/index.jsx";
import TableColumnsSection from "../table-variable-section/index.jsx";
const Section = ({
  data,
  isVerbose = false,
  isFiltered = false,
  showArrayStructure = false,
  onDataBlockClick = () => {},
}) => {
  const handleVariablesAndParams = (data) =>
    onDataBlockClick({
      variableData: data,
      subCategory: data.mode,
      value: data.name,
    });
  return (
    <div className={classes["section"]}>
      {data[FIELDS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <TableColumnsSection
            tableColumns={data[FIELDS]}
            onClick={onDataBlockClick}
          />
        </div>
      )}
      {data[NODE_VARIABLES]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{NODE_VARIABLES}</div>
          <NodeVariableSection
            defaultExpanded={isFiltered}
            nodeVariables={data[NODE_VARIABLES]}
            onClick={onDataBlockClick}
            isVerbose={isVerbose}
            showArrayStructure={showArrayStructure}
          />
        </div>
      )}
      {data[NODE_VARIABLES]?.length === 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{NODE_VARIABLES}</div>
          <div
            style={{
              width: "100%",
              height: "4rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Label variant="body1" color="#a1a1a1">
              No connected nodes found to display <br />
              <b>NODE</b> variables
            </Label>
          </div>
        </div>
      )}
      {data[LOCAL_VARIABLES]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{LOCAL_VARIABLES}</div>
          <GridDataBlocks
            dataBlocks={data[LOCAL_VARIABLES]}
            sourceType={LOCAL_VARIABLES}
            onClick={handleVariablesAndParams}
          />
        </div>
      )}
      {data[GLOBAL_VARIABLES]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{GLOBAL_VARIABLES}</div>
          <GridDataBlocks
            dataBlocks={data[GLOBAL_VARIABLES]}
            sourceType={GLOBAL_VARIABLES}
            onClick={handleVariablesAndParams}
          />
        </div>
      )}
      {data[QUERY_PARAMS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{QUERY_PARAMS}</div>
          <GridDataBlocks
            dataBlocks={data[QUERY_PARAMS]}
            sourceType={QUERY_PARAMS}
            onClick={handleVariablesAndParams}
          />
        </div>
      )}
      {data[HIDDEN_PARAMS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{HIDDEN_PARAMS}</div>
          <GridDataBlocks
            dataBlocks={data[HIDDEN_PARAMS]}
            sourceType={HIDDEN_PARAMS}
            onClick={handleVariablesAndParams}
          />
        </div>
      )}
      {data[VARIABLES]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{VARIABLES}</div>
          <GridDataBlocks
            dataBlocks={data[VARIABLES]}
            onClick={onDataBlockClick}
          />
        </div>
      )}
      {data[FUNCTIONS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{FUNCTIONS}</div>
          <GridDataBlocks
            dataBlocks={data[FUNCTIONS]}
            onClick={onDataBlockClick}
          />
        </div>
      )}
      {data[OPERATORS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{OPERATORS}</div>
          <GridDataBlocks
            dataBlocks={data[OPERATORS]}
            onClick={onDataBlockClick}
          />
        </div>
      )}
      {data[KEYWORDS]?.length > 0 && (
        <div className={classes["section-content"]}>
          <div className={classes["section-title"]}>{KEYWORDS}</div>
          <GridDataBlocks
            dataBlocks={data[KEYWORDS]}
            onClick={onDataBlockClick}
          />
        </div>
      )}
    </div>
  );
};

export default Section;
