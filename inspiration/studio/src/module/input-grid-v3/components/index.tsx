import { forwardRef, useImperativeHandle, useCallback, useRef, useMemo } from "react";
import { InputGrid, InputGridHandle } from "../input-grid";
import { normalizeInput, wrapOutput } from "../input-grid/utils";
import type { FieldData } from "../input-grid/types";

interface InputGridV3Props {
  initialValue?: any;
  variables?: any;
  readOnly?: boolean;
  onGridDataChange?: (data: any) => void;
  isValueMode?: boolean;
  showNote?: boolean;
  hideHeaderAndMap?: boolean;
  hideColumnType?: boolean;
  variant?: string;
  allowMapping?: boolean;
  showHeaders?: boolean;
  hideBorder?: boolean;
  showFxCell?: boolean;
  valueCellMode?: "formula";
  allowQuestionDataType?: boolean;
  enableCheckbox?: boolean;
  disableDelete?: boolean;
  disableAdd?: boolean;
  disableKeyEditing?: boolean;
  disableTypeEditing?: boolean;
  disableCheckboxSelection?: boolean;
}

function InputGridV3Component(props: InputGridV3Props, ref: any) {
  const {
    initialValue = {},
    variables,
    readOnly = false,
    onGridDataChange,
    isValueMode = false,
    hideColumnType = false,
    valueCellMode = "formula",
    allowQuestionDataType = false,
    disableAdd = false,
    disableDelete = false,
  } = props;

  const gridRef = useRef<InputGridHandle>(null);

  // Normalize initial value to match v3 format
  // Handle both array format and object format from v2
  const getInitialValue = useCallback(() => {
    if (Array.isArray(initialValue)) {
      return initialValue;
    }
    if (initialValue && typeof initialValue === 'object') {
      if (initialValue.schema && Array.isArray(initialValue.schema)) {
        return initialValue.schema;
      }
      if (initialValue.value && Array.isArray(initialValue.value)) {
        return initialValue.value;
      }
      if (Object.keys(initialValue).length === 0) {
        return [];
      }
    }
    return [];
  }, [initialValue]);

  const normalized = useMemo(() => normalizeInput(getInitialValue()), [getInitialValue]);
  const initialFields = normalized.fields;

  const effectiveIsValueMode = normalized.rootIsValueMode || isValueMode;

  const handleChange = useCallback((wrappedFields: FieldData[]) => {
    if (onGridDataChange) {
      // InputGrid already wraps the output, so pass it directly
      onGridDataChange(wrappedFields);
    }
  }, [onGridDataChange]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      if (gridRef.current) {
        const fields = gridRef.current.getFields();
        return wrapOutput(fields, effectiveIsValueMode);
      }
      return wrapOutput(initialFields, effectiveIsValueMode);
    },
    getError: () => ({}),
  }), [initialFields, effectiveIsValueMode]);

  return (
    <InputGrid
      ref={gridRef}
      mode={hideColumnType ? "fields" : "schema"}
      devMode={allowQuestionDataType}
      initialValue={initialFields}
      onChange={handleChange}
      readOnly={readOnly || disableAdd || disableDelete}
      valueCellMode={valueCellMode}
      variables={variables}
    />
  );
}

export default forwardRef(InputGridV3Component);

