import React, { forwardRef, useImperativeHandle } from "react";

import { BREAK_TYPE } from "../constants/types";
import classes from "./Break.module.css";
import TabContainer from "../common-components/TabContainer";
import BREAK_NODE from "./constant";

const Break = forwardRef(({ onSave }, ref) => {
  // const [label, setLabel] = useState(data.label || BREAK_TYPE);

  const Configure = () => {
    return <></>;
  };

  const tabs = [
    {
      label: "Configure",
      panelComponent: Configure,
      panelComponentProps: {},
    },
  ];

  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        return {
          type: BREAK_TYPE,
          // label,
        };
      },
    };
  }, []);

  return (
    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: BREAK_NODE.dark,
        light: BREAK_NODE.light,
        foreground: BREAK_NODE.foreground,
      }}
      hasTestTab={BREAK_NODE.hasTestModule}
      // errorMessages={errorMessages}
      validTabIndices={[0]}
      onSave={onSave}
      showCommonActionFooter={true}
      validateTabs={true}
    />
  );
});

export default Break;
