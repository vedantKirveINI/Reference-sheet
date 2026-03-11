import styled from "styled-components";
import { AgGridReact } from "ag-grid-react";

export const CustomAggrid = styled(AgGridReact)`
  
  .ag-center-cols-viewport {
    min-height: ${(props) => props?.minHeightWhenNoRowData} !important;
  .ag-center-cols-container .ag-row:last-child {
    border-bottom: ${(props) =>
      props.domLayout !== "autoHeight"
        ? ".047rem solid #cfd8dc"
        : "none"} !important;
  }
`;
