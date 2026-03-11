import Condition from "../Condition";
import ConditionField from "../ConditionField";
import Header from "./Header";
import { getCollector } from "../../utils/fieldOperations";

import { getContainerGrpStyles, getConditionGrpContainerStyles,  } from "./styles";

// const measuring = {
//   droppable: {
//     strategy: MeasuringStrategy.Always,
//   },
// };

const ConditionGroup = (props: any) => {
  const {
    conditions: { childs = [], condition = "" } = {},
    nestedLevel,
    collector,
    schema,
    rootValues,
    onChangeHandler,
    variables,
    dataTestId = "row",
  } = props;

  if (childs.length === 0 && nestedLevel === 0) return <></>;

  return (
    <div
      style={getConditionGrpContainerStyles({
        nestedLevel,
      })}
    >
      {nestedLevel !== 0 ? (
        <Header
          collector={collector}
          condition={condition}
          schema={schema}
          rootValues={rootValues}
          onChangeHandler={onChangeHandler}
          dataTestId={dataTestId}
        />
      ) : null}

      {childs?.map((child, i) => {
        const newCollector = getCollector(i, collector);

        if (child?.condition) {
          return (
            <div
              key={child?.id}
              style={getContainerGrpStyles()}
              data-testid={`${dataTestId}_${i}`}
            >
              <ConditionField
                index={i}
                condition={condition}
                isGroup
                collector={newCollector}
                rootValues={rootValues}
                onChangeHandler={onChangeHandler}
                dataTestId={`${dataTestId}_${i}`}
              />

              <ConditionGroup
                conditions={child}
                nestedLevel={nestedLevel + 1}
                collector={newCollector}
                schema={schema}
                rootValues={rootValues}
                onChangeHandler={onChangeHandler}
                variables={variables}
                dataTestId={`${dataTestId}_${i}`}
              />
            </div>
          );
        }

        return (
          <Condition
            key={child?.id}
            index={i}
            condition={condition}
            data={child}
            collector={newCollector}
            schema={schema}
            rootValues={rootValues}
            variables={variables}
            onChangeHandler={onChangeHandler}
            dataTestId={`${dataTestId}_${i}`}
          />
        );
      })}
    </div>
  );
};

export default ConditionGroup;
