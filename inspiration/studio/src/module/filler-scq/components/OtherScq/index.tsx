import { WrappedEditor } from "@src/module/wrappededitor";
import { CHARACTERS } from "@oute/oute-ds.core.constants";

const OtherScq = ({
  optionsArray,
  disabled,
  theme,
  handleOnChange,
  isOtherSelected,
}) => {
  return (
    <WrappedEditor
      dataTestId={`multi-choice-option-${optionsArray?.length}`}
      onValueChange={() => {}}
      value={"Other"}
      isSelected={isOtherSelected}
      leftIcon={CHARACTERS[optionsArray?.length]}
      disabled={disabled}
      onClick={() => {
        handleOnChange("Other");
      }}
      inputType={"Radio"}
      tabIndex={0}
      customStyle={{
        container: {
          maxWidth: "100%",
        },
      }}
      theme={theme}
      isReadOnly={true}
    />
  );
};

export default OtherScq;
