import { WrappedEditor } from "@src/module/wrappededitor";

const TextScq = ({ theme, value, handleOnChange }) => {
  return (
    <WrappedEditor
      dataTestId={`multi-choice-option-other-input`}
      onValueChange={(text, event) => {
        event?.stopPropagation();
        handleOnChange(text);
      }}
      inputProps={{
        rows: 5,
      }}
      disableAutoResize={true}
      value={value}
      isSelected={true}
      disabled={false}
      inputType={"Radio"}
      tabIndex={0}
      customStyle={{
        container: {
          maxWidth: "100%",
        },
      }}
      theme={theme}
      isReadOnly={false}
      placeholder="Please enter your response"
      autoFocus
    />
  );
};

export default TextScq;
