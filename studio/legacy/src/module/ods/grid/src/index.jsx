import React, { forwardRef, useState } from "react";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "./oute-ag-grid.css";
import "oute-tokens/dist/tokens.css";
import { CustomAggrid } from './styles.jsx';

import CellTextEditor from './cell-editors/CellTextEditor.jsx';
import CellAutocompleteEditor from './cell-editors/CellAutocompleteEditor.jsx';
import CellFxEditor from './cell-editors/CellFxEditor.jsx';
import CellNumberInputEditor from './cell-editors/CellNumberEditor.jsx';

import FxCellRenderer from './cell-renderers/FxCellRenderer.jsx';
import ExpandCollapseRenderer from './cell-renderers/expand-collapse-renderer/index.jsx';

export { FxCellRenderer };
export { ExpandCollapseRenderer };

const defaultComponents = {
  "ods-cell-text-editor": CellTextEditor,
  "ods-cell-autocomplete-editor": CellAutocompleteEditor,
  "ods-cell-fx-editor": CellFxEditor,
  "ods-cell-number-editor": CellNumberInputEditor,
};

const ODSGrid = forwardRef(
  (
    {
      minHeightWhenNoRowData: mhwnrd = "9.375rem",
      defaultColDef = {},
      style = {},
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [minHeightWhenNoRowData, setMinHeightWhenNoRowData] =
      useState(mhwnrd);

    const onRowDataUpdated = (params) => {
      if (params.api) {
        params.api.getDisplayedRowCount() === 0
          ? setMinHeightWhenNoRowData(mhwnrd)
          : setMinHeightWhenNoRowData("unset");
        props?.onRowDataUpdated && props.onRowDataUpdated(params);
      }
    };

    return (
      <div className={`ag-theme-alpine ${variant}`} style={style}>
        <CustomAggrid
          ref={ref}
          domLayout="autoHeight"
          stopEditingWhenCellsLoseFocus
          animateRows
          singleClickEdit
          minHeightWhenNoRowData={minHeightWhenNoRowData}
          {...props}
          components={{ ...defaultComponents, ...props?.components }}
          rowStyle={{
            transition: "all 0.25s",
            ...props?.rowStyle,
          }}
          defaultColDef={{
            suppressMovable: true,
            ...defaultColDef,
          }}
          onRowDataUpdated={onRowDataUpdated}
        />
      </div>
    );
  }
);

export default ODSGrid;
