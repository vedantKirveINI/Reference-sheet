import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";
import React, { useEffect, useRef, useState } from "react";
import isEmpty from "lodash/isEmpty";
// import { ODSLabel } from '@src/module/ods';
import { ODSLabel } from "@src/module/ods";
import styles from "./SheetRecord.module.css";

const syncGridDataWithFields = ({ initialValue, isValueMode, fields }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  const { [CONFIG_KEY]: records = [], ...rest } = initialValue?.[0] || {};

  const updatedGridStructure = fields.map((field) => {
    const commonProps = {
      key: field?.name,
      id: field?.id,
      fieldId: field?.id,
      fieldFormat: field?.fieldFormat || "", // added this key so that in fx the structure will be display for question data type
    };

    const currData = records.find((record) => {
      return record?.fieldId === field?.id;
    });

    if (currData) {
      return {
        ...currData,
        ...commonProps,
      };
    }

    return {
      ...commonProps,
      type: field?.type,
      isValueMode,
    };
  });

  return [
    {
      id: `${Date.now()}`,
      type: "Object",
      isValueMode,
      ...(rest || {}),
      [CONFIG_KEY]: updatedGridStructure,
    },
  ];
};

function SheetRecordV2({
  fields = [],
  record = [],
  view = {},
  onChange = () => {},
  variables,
  isValueMode = true,
  label,
  enableCheckbox = false,
}) {
  const [gridData, setGridData] = useState(record);
  const [localView, setLocalView] = useState(view);
  const [initialized, setInitialized] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!initialized && !isEmpty(fields)) {
      const updatedGridData = syncGridDataWithFields({
        initialValue: gridData,
        fields,
        isValueMode,
      });

      if (gridRef.current) {
        gridRef.current.updateGrid(updatedGridData);
      }
      setGridData(updatedGridData);
      setInitialized(true);
    }
  }, [record, initialized, fields, gridData, isValueMode]);

  useEffect(() => {
    if (view?.id !== localView?.id) {
      setInitialized(false);
      setLocalView(view);
    }
  }, [view, localView?.id]);

  if (isEmpty(fields)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
        data-testid="no-rows-overlay"
      >
        Please select a view.
      </div>
    );
  }

  return (
    <div className={styles["sheet-record-v2"]}>
      <div className={styles["box"]} data-testid="map-column-note">
        <p className={styles["text"]}>
          <span className={styles["text-bold"]}>Note: </span>{" "}
          <ODSLabel
            variant="body2"
            fontWeight="600"
            style={{ display: "inline" }}
          >
            {label}
          </ODSLabel>
        </p>
      </div>

      <InputGridV3
        variables={variables}
        onGridDataChange={(data) => {
          onChange(data);
        }}
        isValueMode={isValueMode}
        hideHeaderAndMap={true}
        allowQuestionDataType={true}
        enableCheckbox={enableCheckbox}
        disableDelete={true}
        disableAdd={true}
        disableKeyEditing={true}
        disableTypeEditing={true}
        ref={gridRef}
        hideColumnType={true}
      />
    </div>
  );
}

export default SheetRecordV2;
