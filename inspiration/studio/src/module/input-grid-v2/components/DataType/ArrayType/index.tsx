import { ODSLabel } from "@src/module/ods";
import ValueCell from "../../../common/Cell/ValueCell";

function ArrayType({ value, isValueMode, onChange = () => {} }) {
  return (
    <div>
      <ODSLabel variant="text">{isValueMode ? "Value" : "Default Value"}</ODSLabel>
      <ValueCell
        value={value}
        isValueMode={isValueMode}
        onChange={onChange}
        isValueDisabled={false}
        hideBorders={false}
        dataTestId="row_0"
      />
    </div>
  );
}

export default ArrayType;
