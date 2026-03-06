import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FormRow from "./FormRow";
import ThemePreviewBlock from "./ThemePreviewBlock";
import ColorPickerField from "./ColorPickerField";
import SizeSelector from "./SizeSelector";
import BorderRadiusSelector from "./BorderRadiusSelector";
import { icons } from "@/components/icons";

const FONT_FAMILY_OPTIONS = [
  "Helvetica Neue",
  "Georgia",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "EB Garamond",
  "Merriweather",
  "Noto Serif",
  "Archivo",
  "Nunito",
  "Poppins",
];

function buttonCornersToBorderRadius(buttonCorners) {
  if (buttonCorners === "circular" || buttonCorners === "pill") return "9999px";
  if (buttonCorners === "square") return "0px";
  return "8px";
}

function borderRadiusToCorners(br) {
  if (!br) return "rounded";
  const v = String(br).toLowerCase();
  if (v === "9999px" || v === "50%" || v.includes("9999")) return "circular";
  if (v === "0" || v === "0px") return "square";
  return "rounded";
}

const LegacyStyleThemeForm = ({ theme, onChange }) => {
  const fileInputRef = useRef(null);
  const styles = theme?.styles || {};
  const name = theme?.name ?? "Custom Theme";

  const updateStyles = (partial) => {
    onChange?.({ ...theme, name: theme?.name, styles: { ...styles, ...partial } });
  };

  const updateName = (newName) => {
    onChange?.({ ...theme, name: newName, styles: { ...theme?.styles } });
  };

  const handleFontFamilyChange = (fontFamily) => {
    updateStyles({ fontFamily });
  };

  const handleQuestionSizeChange = (size) => {
    updateStyles({ questionSize: size });
  };

  const handleButtonCornersChange = (borderRadius) => {
    const buttonCorners = borderRadiusToCorners(borderRadius);
    updateStyles({ buttonCorners });
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateStyles({ backgroundImage: event.target.result || "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackgroundImage = () => {
    updateStyles({ backgroundImage: "" });
  };

  const TrashIcon = icons.trash2;
  const borderRadiusValue = buttonCornersToBorderRadius(styles.buttonCorners);

  return (
    <div className="space-y-5 overflow-y-auto pb-4 px-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Preview</label>
        <div className="w-full min-w-0">
          <ThemePreviewBlock theme={theme} />
        </div>
      </div>
      <FormRow label="Theme Name">
        <Input
          value={name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="Theme name"
          className="w-full rounded-xl"
        />
      </FormRow>

      <FormRow label="Font Family">
        <Select
          value={styles.fontFamily || "Helvetica Neue"}
          onValueChange={handleFontFamilyChange}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {FONT_FAMILY_OPTIONS.map((font) => (
              <SelectItem key={font} value={font} className="rounded-lg">
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      <FormRow label="Question Size">
        <SizeSelector
          value={styles.questionSize || "M"}
          onChange={handleQuestionSizeChange}
        />
      </FormRow>

      <FormRow label="Button Corners">
        <BorderRadiusSelector
          value={borderRadiusValue}
          onChange={handleButtonCornersChange}
        />
      </FormRow>

      <FormRow label="Questions">
        <ColorPickerField
          value={styles.questions || "#263238"}
          onChange={(v) => updateStyles({ questions: v, description: v })}
        />
      </FormRow>

      <FormRow label="Buttons">
        <ColorPickerField
          value={styles.buttons || "#000000"}
          onChange={(v) => updateStyles({ buttons: v })}
        />
      </FormRow>

      <FormRow label="Button Text">
        <ColorPickerField
          value={styles.buttonText || "#FFFFFF"}
          onChange={(v) => updateStyles({ buttonText: v })}
        />
      </FormRow>

      <FormRow label="Background Color">
        <ColorPickerField
          value={styles.backgroundColor || "#FFFFFF"}
          onChange={(v) => updateStyles({ backgroundColor: v })}
        />
      </FormRow>

      <FormRow label="Background Image">
        {styles.backgroundImage ? (
          <div className="space-y-2">
            <div
              className="relative rounded-xl overflow-hidden border h-28 bg-muted/50"
              style={{
                backgroundImage: `url(${styles.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveBackgroundImage}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                {TrashIcon ? <TrashIcon className="size-4" /> : null}
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed"
          >
            Upload image
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundImageChange}
          className="hidden"
        />
      </FormRow>
    </div>
  );
};

export default LegacyStyleThemeForm;
