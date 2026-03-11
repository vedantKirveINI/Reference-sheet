import React from "react";
import classes from './GridDataBlocks.module.css';
import DataBlock from '../data-block/index.jsx';
const GridDataBlocks = ({ dataBlocks = [], onClick = () => {} }) => {
  return (
    <div className={classes["grid-data-blocks"]}>
      {dataBlocks.map((d, idx) => (
        <DataBlock
          key={`gdb-${idx}`}
          block={d}
          onClick={(e, block) => onClick(block)}
        />
      ))}
    </div>
  );
};

export default GridDataBlocks;
