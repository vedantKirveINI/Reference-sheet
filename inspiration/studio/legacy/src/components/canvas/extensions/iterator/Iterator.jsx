import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import TabContainer from "../common-components/TabContainer";
import ITERATOR_NODE from "./constant";
import Configure from "./tabs/configure/Configure";

const Iterator = forwardRef(
  ({ data = {}, variables, onSave = () => {} }, ref) => {
    const [fxContent, setFxContent] = useState(data.content);
    const tabs = useMemo(
      () => [
        {
          label: "Configure",
          panelComponent: Configure,
          panelComponentProps: {
            fxContent,
            setFxContent,
            variables,
          },
        },
      ],
      [fxContent, variables]
    );

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
          dark: ITERATOR_NODE.dark,
          light: ITERATOR_NODE.light,
          foreground: ITERATOR_NODE.foreground,
        }}
        hasTestTab={ITERATOR_NODE.hasTestModule}
        // errorMessages={errorMessages}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default Iterator;
