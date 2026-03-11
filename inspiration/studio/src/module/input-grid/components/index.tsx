
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { isEmpty } from "lodash";
import NestedForm from "./NestedCondition";
import TableHeader from "./TableHeader";

import { container } from "./styles";
import { addEmptyField, filterOutput } from "../utils/fieldOperation";
import { DEFAULT_TYPE } from "../constants/type";
function InputGrid(
  { initialValue = [], variables, onChange = () => {} }: any,
  ref
) {
  const [value, setValue] = useState(initialValue);

  const onChangeHandler = useCallback(
    ({ updatedRootValue }) => {
      setValue(() => [...updatedRootValue]);
      onChange([...updatedRootValue]);
    },
    [onChange]
  );

  useEffect(() => {
    if (isEmpty(value)) {
      setValue([
        {
          id: `${Date.now()}`,
          type: DEFAULT_TYPE,
        },
      ]);
    }
  }, [value]);

  useEffect(() => {
    addEmptyField({ initialValue: value });
    setValue([...value]);
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        updateValue: (updatedRootValue: any) => {
          onChangeHandler({ updatedRootValue });
        },
        getValue: () => {
          return filterOutput({ value });
        },
      };
    },
    [onChangeHandler, value]
  );

  return (
    <div style={container}>
      <TableHeader rootValue={value} onChange={onChangeHandler} />

      <NestedForm
        data={value}
        rootValue={value}
        nestedLevel={0}
        variables={variables}
        onChange={onChangeHandler}
      />
    </div>
  );
}

export default forwardRef(InputGrid);
