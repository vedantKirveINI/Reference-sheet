import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import Configure from "./configure/Configure";

const StartNode = forwardRef(({ data = {}, variables }, ref) => {
  const startNodeRowData = useMemo(() => {
    return data?.inputs ? cloneDeep(data.inputs) : [];
  }, [data?.inputs]);

  const inputGridRef = useRef();

  const getData = useCallback(() => {
    const inputs = inputGridRef?.current?.getValue();
    return {
      inputs,
    };
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getData,
    };
  }, [getData]);

  return (
    <Configure
      inputGridRef={inputGridRef}
      data={startNodeRowData}
      variables={variables}
    />
  );
});

export default StartNode;
