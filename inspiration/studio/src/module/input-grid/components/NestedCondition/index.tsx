
import React from "react";
import { ODSSwitch as Switch } from "@src/module/ods";

import RowCondition from "./RowCondition";
import { getContainerStyles, getTableStyles, switchContainer } from "./styles";
import { getCurrIndex, updateFieldValue } from "../../utils/fieldOperation";
import { NON_PRIMITIVES } from "../../constants/type";
function NestedForm({
  data = [],
  rootValue = [],
  nestedLevel,
  prevIndex,
  onChange,
  variables,
  isParentMap = false,
}: any) {
  const dataLength = (data || []).length;

  return (
    <div style={getContainerStyles({ nestedLevel })}>
      {nestedLevel > 0 ? (
        <div style={switchContainer}>
          <Switch
            data-testid={`map_${prevIndex ? prevIndex : 0}_${nestedLevel}`}
            labelText="MAP"
            checked={isParentMap}
            labelProps={{ variant: "subtitle1" }}
            onChange={(val) => {
              updateFieldValue({
                rootValue,
                updatedValue: val.target.checked,
                currIndex: prevIndex,
                fieldName: "isMap",
              });

              onChange({ updatedRootValue: rootValue });
            }}
          />
        </div>
      ) : (
        ""
      )}

      <div style={getTableStyles({ nestedLevel })}>
        {(data || []).map((ele: any, i: number) => {
          const currIndex = getCurrIndex({ prevIndex, index: i });
          const isPrevNp =
            i > 0 && NON_PRIMITIVES.includes(data[i - 1].type?.toLowerCase());

          const commonProps = {
            data: ele,
            onChange,
            currIndex,
            rootValue,
            variables,
            isParentMap,
            isPrevNonPrimitive: isPrevNp,
            hasOneElement: dataLength === 1,
            isLastChild: dataLength === i + 1,
          };

          if (NON_PRIMITIVES.includes(ele.type) && !isParentMap) {
            return (
              <div key={ele?.id}>
                <RowCondition {...commonProps} showAddIcon={!ele?.isMap} />
                <NestedForm
                  data={ele?.config}
                  prevIndex={currIndex}
                  rootValue={rootValue}
                  variables={variables}
                  nestedLevel={nestedLevel + 1}
                  onChange={onChange}
                  isParentMap={ele?.isMap}
                />
              </div>
            );
          }

          return <RowCondition key={ele?.id} {...commonProps} />;
        })}
      </div>
    </div>
  );
}

export default NestedForm;
