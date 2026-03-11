import { FC } from "react";
import { getEditorStyles, getPictureOptionIconWrapperStyles } from "./styles";
import { ODSTextField } from "@src/module/ods";
interface PictureLabelEditorProps {
  icon?: any;
  theme?: any;
  label?: string;
  onLabelChange?: any;
  isEditable?: boolean;
  onEnterKey?: any;
}

export const PictureLabelEditor: FC<PictureLabelEditorProps> = ({
  icon,
  theme,
  label,
  onLabelChange = () => {},
  isEditable = false,
  onEnterKey = () => {},
}) => {
  return (
    <div style={getEditorStyles()}>
      <div
        style={getPictureOptionIconWrapperStyles({ theme })}
        data-tesid="picture-label-editor-icon-wrapper"
      >
        {icon}
      </div>
      <ODSTextField
        multiline
        InputProps={{ readOnly: !isEditable }}
        value={label || ""}
        autoFocus={isEditable}
        onChange={(e) => onLabelChange(e.target.value)}
        data-testid="picture-label-editor"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnterKey();
          }
        }}
        placeholder={"Enter label"}
        style={{
          alignSelf: "stretch",
          height: "100%",
          cursor: isEditable ? "text" : "pointer",
          color: theme?.styles?.questionText || "#000",
          padding: 0,
          fontFamily: theme?.styles?.fontFamily || "inherit",
          background: "transparent",
          border: "none",
        }}
      />
    </div>
  );
};
