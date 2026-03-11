import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure";
import DELAY_NODE from "./constant";

const Delay = forwardRef(({ data, variables, onSave = () => {} }, ref) => {
  //create Delay related states
  const [delayInMs, setDelayInMs] = useState(
    data?.delayTime
      ? data.delayTime
      : { type: "fx", blocks: [{ type: "PRIMITIVES", value: "1000" }] }
  );

  const tabs = useMemo(() => {
    return [
      {
        label: "CONFIGURE",
        panelComponent: Configure,
        panelComponentProps: {
          delayInMs,
          setDelayInMs,
          variables,
        },
      },
    ];
  }, [delayInMs, variables]);

  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        return {
          delayTime: delayInMs,
        }; //Delay data to be returned from here
      },
    };
  }, [delayInMs]);

  return (
    //   <div className={classes["delay-container"]}>
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
    //     defaultInputContent={delayInMs?.blocks || []}
    //     onInputContentChanged={(blocks) => setDelayInMs({ type: "fx", blocks })}
    //   />
    // </div>

    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: DELAY_NODE.dark,
        light: DELAY_NODE.light,
        foreground: DELAY_NODE.foreground,
      }}
      onSave={onSave}
      validTabIndices={[0]}
      showCommonActionFooter={true}
      validateTabs={false}
    />
  );
});

export default Delay;
