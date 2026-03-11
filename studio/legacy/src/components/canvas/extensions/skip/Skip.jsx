import React, { forwardRef, useImperativeHandle } from "react";

import { SKIP_TYPE } from "../constants/types";
import TabContainer from "../common-components/TabContainer";
import SKIP_NODE from "./constant";

const Skip = forwardRef(({ onSave }, ref) => {
  // const [label, setLabel] = useState(data.label || SKIP_TYPE);

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
          type: SKIP_TYPE,
          // label,
        };
      },
    };
  }, []);

  return (
    <TabContainer
      tabs={tabs || []}
      colorPalette={{
        dark: SKIP_NODE.dark,
        light: SKIP_NODE.light,
        foreground: SKIP_NODE.foreground,
      }}
      hasTestTab={SKIP_NODE.hasTestModule}
      // errorMessages={errorMessages}
      validTabIndices={[0]}
      onSave={onSave}
      showCommonActionFooter={true}
      validateTabs={true}
    />
  );
});

export default Skip;
