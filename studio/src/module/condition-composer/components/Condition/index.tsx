import { ODSAutocomplete, ODSIcon } from "@src/module/ods";
import React, { useCallback, useEffect, useState } from "react";

// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
import { setValueByAccessor, deleteChildByAccessor,  } from "../../utils/fieldOperations";
import { getOperatorsBySchema } from "../../utils/getOption";
import ConditionField from "../ConditionField";

import { deleteIconStyles, conditionRowStyles, conditionSelectorStyles, conditionContentStyles, conditionContainerStyles,  } from "./styles";
import ValueField from "./component/ValueField";
import FieldSelect from "./component/FieldSelect";
import OperatorSelect from "./component/OperatorSelect";
const OPERATOR_VALUES = ["is empty", "is not empty"];

const Condition = (props: any) => {
  const {
    index,
    data,
    condition,
    collector,
    schema,
    rootValues,
    onChangeHandler,
    variables,
    dataTestId,
  } = props;

  const { id, key, operator, nested_key } = data || {};

  const [opertorOptions, setOperatorOptions] = useState([]);

  const onFieldChangeHandler = useCallback(
    ({ property, newValue }) => {
      const newObj = { ...rootValues };
      setValueByAccessor({
        rootObj: newObj,
        accessor: collector,
        newValue,
        property,
      });

      onChangeHandler(newObj);
    },
    [collector, onChangeHandler, rootValues]
  );

  useEffect(() => {
    if (key) {
      const options = getOperatorsBySchema({
        schema,
        colName: key,
        nestedKey: nested_key,
      });

      setOperatorOptions(options);
    }
  }, [key, schema, nested_key]);

  return (
    <div style={conditionContainerStyles} data-testid={dataTestId}>
      <ConditionField
        index={index}
        condition={condition}
        collector={collector}
        rootValues={rootValues}
        onChangeHandler={onChangeHandler}
        dataTestId={dataTestId}
      />

      <div style={conditionRowStyles}>
        <div style={conditionContentStyles}>
          <div style={conditionSelectorStyles}>
            <FieldSelect
              data={data}
              schema={schema}
              onFieldChangeHandler={onFieldChangeHandler}
            />

            <OperatorSelect
              data={data}
              opertorOptions={opertorOptions}
              onFieldChangeHandler={onFieldChangeHandler}
            />
          </div>

          {!OPERATOR_VALUES.includes(operator?.value) && (
            <ValueField
              key={`${id}_${key}`}
              data={data}
              variables={variables}
              schema={schema}
              colKey={key}
              onFieldChangeHandler={onFieldChangeHandler}
            />
          )}
        </div>

        <div
          style={deleteIconStyles()}
          role="presentation"
          onClick={() => {
            const newObj = { ...rootValues };
            deleteChildByAccessor(newObj, collector);

            onChangeHandler(newObj);
          }}
          data-testid={`${dataTestId}-delete`}
        >
          <ODSIcon
            outeIconName="OUTETrashIcon"
            outeIconProps={{
              style: {
                width: "1.25rem",
                height: "1.25rem",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Condition;
