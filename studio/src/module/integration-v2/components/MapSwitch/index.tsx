import { CSSProperties } from "react";
import { Switch } from "@/components/ui/switch";
import { optionContainer, optionTitle } from "./styles";

export const MapSwitch = ({
  title,
  styles,
  checked,
  onChange,
}: {
  title: string;
  styles?: CSSProperties;
  checked?: boolean;
  onChange?: (event: { target: { checked: boolean } }) => void;
}) => {
  return (
    <div style={optionContainer(styles)}>
      <Switch
        checked={checked}
        onCheckedChange={(value: boolean) => {
          onChange?.({ target: { checked: value } });
        }}
      />
      <div style={optionTitle()}>{title}</div>
    </div>
  );
};
