/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import { useEffect, useState } from "react";
import { ODSLabel, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { styles } from "./styles";

interface DefaultValueFxProps {
  settings?: any;
  variables?: any;
  onChange?: (key: any, val: any) => void;
  style?: any;
  isReadOnly?: boolean;
  label?: string;
  placeholder?: string;
  dataTestid?: string;
}

const DefaultValueFx = ({
  settings,
  variables,
  onChange,
  style = {
    fxStyle: {},
    containerStyle: {},
  },
  isReadOnly = false,
  label = "Default Value",
  placeholder = "Enter default value",
  dataTestid,
}: DefaultValueFxProps) => {
  const [content, setContent] = useState(settings?.defaultValue?.blocks);

  // Used useEffect:  onChange to prevent the formula bar from using the previous settings value during content updates
  useEffect(() => {
    onChange("defaultValue", {
      type: "fx",
      blocks: content,
    });
  }, [content]);

  return (
    <div
      css={styles.container(style?.containerStyle)}
      data-testid={dataTestid || "default-value-fx-container"}
    >
      <ODSLabel variant="body1">{label}</ODSLabel>
      <FormulaBar
        wrapContent
        isReadOnly={isReadOnly}
        placeholder={placeholder}
        hideInputBorders={false}
        defaultInputContent={content}
        onInputContentChanged={(content) => {
          setContent(content); // Removed onChange to prevent the formula bar from using the previous settings value during content updates
        }}
        variables={variables}
        slotProps={{
          container: {
            style: {
              ...styles.fxInputStyle,
              ...style?.fxStyle,
            },
          },
        }}
      />
    </div>
  );
};

export default DefaultValueFx;
