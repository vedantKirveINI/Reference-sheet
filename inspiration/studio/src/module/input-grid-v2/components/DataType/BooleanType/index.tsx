import { ODSLabel } from "@src/module/ods";
import ValueCell from "../../../common/Cell/ValueCell";

function BooleanType({ value, isValueMode, onChange = () => {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <ODSLabel variant="text">{isValueMode ? "Value" : "Default Value"}</ODSLabel>
      <ValueCell
        value={value}
        onChange={onChange}
        isValueDisabled={false}
        hideBorders={false}
        isValueMode={isValueMode}
        dataTestId="row_0"
      />
    </div>
  );
}

export default BooleanType;
