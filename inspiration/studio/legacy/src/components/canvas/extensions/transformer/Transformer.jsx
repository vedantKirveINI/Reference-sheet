import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Configure from "./tabs/configure/configure";
import TabContainer from "../common-components/TabContainer";

import TRANSFORMER_NODE from "./constant";

const Transformer = forwardRef(
  ({ data = {}, variables, onSave = () => {} }, ref) => {
    const [fxContent, setFxContent] = useState(data.content);

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
      // <div className={classes["transformer-container"]}>
      //   <TextField
      //     label="Label"
      //     placeholder="Enter Node Label"
      //     value={label}
      //     onChange={(e) => setLabel(e.target.value)}
      //   />
      //   <FormulaBar
      //     variables={variables}
      //     wrapContent
      //     placeholder="e.g. Variable 1 = 12345"
      //     defaultInputContent={fxContent?.blocks || []}
      //     onInputContentChanged={(blocks) =>
      //       setFxContent({ type: "fx", blocks })
      //     }
      //   />
      // </div>

      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: TRANSFORMER_NODE.dark,
          light: TRANSFORMER_NODE.light,
          foreground: TRANSFORMER_NODE.foreground,
        }}
        onSave={onSave}
        validTabIndices={[0]}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default Transformer;
