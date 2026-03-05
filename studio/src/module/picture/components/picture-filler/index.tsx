import { useCallback, useEffect, useState } from "react";
import { ODSIcon } from "@src/module/ods";
import { TPictureValue } from "../../types";
import { getPictureOptionGroupStyles, getPictureOptionStyles,  } from "../../styles";
import { ImageCard } from "../image-card";
import { PictureLabelEditor } from "../picture-label-editor";
import { getCharacterByIndex } from "@oute/oute-ds.core.constants/constants";
interface PictureFillerProps {
  onChange: any;
  theme: any;
  options?: any;
  boxesPerRow?: number;
  settings?: any;
  value: any;
  isAnswered?: boolean;
}

export const PictureFiller = ({
  onChange,
  theme,
  value,
  options = [],
  boxesPerRow,
  settings = {
    questionAlignment: "flex-start",
  },
  isAnswered = false,
}: PictureFillerProps) => {
  const [optionsArray, setOptionsArray] = useState(options);

  const onValueChange = useCallback(
    (newValue: TPictureValue) => {
      const updatedValue = value.some((val) => val.id === newValue.id)
        ? value.filter((opt) => opt.id !== newValue.id)
        : [...value, newValue];
      onChange(updatedValue);
    },
    [onChange, value]
  );

  useEffect(() => {
    if (settings?.defaultValue && !isAnswered) {
      onChange(settings?.defaultValue);
    }
    if (settings?.randomize)
      setOptionsArray(optionsArray.shuffle(optionsArray));
  }, []);

  return (
    <div
      style={getPictureOptionGroupStyles({
        alignment: settings?.questionAlignment,
      })}
      data-testid="picture-option-group"
    >
      {optionsArray.map((option, index) => {
        const isSelected = value?.some((val) => val?.id === option?.id);
        return (
          <div
            key={option.id}
            style={getPictureOptionStyles({ isSelected, theme })}
            data-testid={`picture-option-${index}`}
            onClick={() => {
              onValueChange(option);
            }}
          >
            <ImageCard
              imgSrc={option.imgSrc}
              icon={
                <ODSIcon
                  outeIconName="OUTEImageIcon"
                  outeIconProps={{
                    style: {
                      color: "#010E50",
                      height: "1.5em",
                      width: "1.5em",
                    },
                  }}
                />
              }
            />
            <PictureLabelEditor
              icon={getCharacterByIndex(index)}
              isEditable={false}
              label={option.label}
              theme={theme}
            />
          </div>
        );
      })}
    </div>
  );
};
