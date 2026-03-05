import TinyCommand from "../../../assets/icon/tiny-command";
import TinyLogo from "../../../assets/icon/tiny-logo";
import { getDesktopLogoContainerStyles, getDesktopLogoStyles, getDesktopLogoTextStyles, getMobileLogoContainerStyles, getMobileLogoStyles,  } from "../syles";
import { ViewPort } from "@src/module/constants";
interface BrandComponentProps {
  theme?: any;
  viewPort?: any;
}

export const BrandComponent = ({ theme, viewPort }: BrandComponentProps) => {
  return viewPort === ViewPort.DESKTOP ? (
    <div style={getDesktopLogoContainerStyles()}>
      <span
        style={getDesktopLogoTextStyles({
          theme,
        })}
      >
        Made with ♥ on
      </span>

      <TinyCommand fill={theme.buttonTextColor} style={getDesktopLogoStyles()} />
    </div>
  ) : (
    <div style={getMobileLogoContainerStyles()}>
      <TinyLogo fill={theme.buttonTextColor} style={getMobileLogoStyles()} />
    </div>
  );
};
