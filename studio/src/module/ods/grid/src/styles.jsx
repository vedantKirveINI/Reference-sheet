import React from "react";
const AgGridReact = () => null;
import styles from "./grid.module.css";
import { cn } from "@/lib/utils";

export const CustomAggrid = React.forwardRef(({ 
  minHeightWhenNoRowData, 
  domLayout, 
  className,
  ...props 
}, ref) => {
  const dynamicStyles = {
    '--min-height-when-no-row-data': minHeightWhenNoRowData || 'unset',
    '--last-row-border': domLayout !== 'autoHeight' ? '.047rem solid #cfd8dc' : 'none',
  };

  return (
    <AgGridReact
      ref={ref}
      domLayout={domLayout}
      className={cn(styles.customAggrid, className)}
      style={dynamicStyles}
      {...props}
    />
  );
});

CustomAggrid.displayName = "CustomAggrid";
