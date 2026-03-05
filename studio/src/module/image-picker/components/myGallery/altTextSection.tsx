import { ODSLabel } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import { getAltTextContainerStyles } from "./styles";
export const AltTextSection = ({ altText, onTextFieldChange }: any) => {
  return (
    <div
      style={getAltTextContainerStyles()}
      data-testid="question-augmentor-alt-text-root"
    >
      <ODSLabel
        children="Alt Text"
        style={{ fontSize: "1.125rem", color: "#000" }}
      />
      <ODSTextField
        fullWidth={true}
        placeholder="Enter Text here"
        multiline
        minRows={10}
        maxRows={10}
        value={altText}
        onChange={onTextFieldChange}
        style={{
          padding: "0.625rem",
        }}
      />
    </div>
  );
};
