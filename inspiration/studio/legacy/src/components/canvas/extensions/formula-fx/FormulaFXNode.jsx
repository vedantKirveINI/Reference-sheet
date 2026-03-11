import React, { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure";
import FORMULA_FX_NODE from "./constant";

const FormulaFXNode = forwardRef(
  ({ data = {}, variables, onSave = () => {} }, ref) => {
    const [fxContent, setFxContent] = useState(data.content || {});

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            variables,
            fxContent,
            setFxContent,
          },
        },
      ];
    }, [fxContent, variables]);

    useImperativeHandle(ref, () => ({
      getData: () => {
        return {
          content: fxContent,
        };
      },
    }));

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: FORMULA_FX_NODE.dark,
          light: FORMULA_FX_NODE.light,
          foreground: FORMULA_FX_NODE.foreground,
        }}
        onSave={onSave}
        validTabIndices={[0]}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default FormulaFXNode;
