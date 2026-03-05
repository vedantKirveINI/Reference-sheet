import { ODSButton, ODSLabel } from "@src/module/ods";
import { styles } from "./styles";

export type NullScreenProps = {
  onButtonClick?: () => void;
  labelText?: string;
  imageSrc?: string;
  buttonLabel?: string;
  subLabelText?: string;
};

export const NullScreen = ({
  onButtonClick,
  labelText,
  imageSrc,
  buttonLabel,
  subLabelText,
}: NullScreenProps) => {
  return (
    <div
      style={styles.getContainerStyles()}
      data-testid="null-screen-container"
    >
      <img src={imageSrc} alt="Empty screen" data-testid="null-screen-image" />
      <div style={styles.labelWrapper}>
        <ODSLabel variant="h5" data-testid="null-screen-label">
          {labelText}
        </ODSLabel>

        {subLabelText && (
          <ODSLabel
            variant="h6"
            color={"#607D8B"}
            data-testid="null-screen-sub-label"
          >
            {subLabelText}
          </ODSLabel>
        )}
      </div>

      {buttonLabel && (
        <ODSButton
          label={buttonLabel}
          variant="black"
          size="medium"
          onClick={onButtonClick}
          data-testid="null-screen-button"
        />
      )}
    </div>
  );
};
