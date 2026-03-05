import { lazy, Suspense, useCallback, useRef } from "react";
import { ODSIcon, ODSPopper } from "@src/module/ods";
import { createUUID } from "../../utils";
import { TPictureValue } from "../../types";
import { getCrossIconStyles, getPictureOptionGroupStyles, getPictureOptionStyles,  } from "../../styles";
import { ImageCard } from "../image-card";
import { PictureLabelEditor } from "../picture-label-editor";
import { getCharacterByIndex } from "@oute/oute-ds.core.constants/constants";
import { useImageClickPopper } from "../../hooks/useImageClickPopper";
const ImagePicker = lazy(() =>
  import("@oute/oute-ds.atom.image-picker").then((m) => ({
    default: m.ImagePicker,
  }))
);

interface PictureCreatorProps {
  onChange: any;
  theme: any;
  options?: any;
  boxesPerRow?: number;
  settings?: any;
  workspaceId?: string;
}

export const PictureCreator = ({
  onChange,
  theme,
  options = [],
  boxesPerRow,
  settings = {
    questionAlignment: "flex-start",
  },
  workspaceId = "",
}: PictureCreatorProps) => {
  const selectedImageID = useRef<string | null>(null);
  const {
    popperOpen,
    anchorEl,
    popperContentRef,
    handleImageClick,
    handleClosePopper,
  } = useImageClickPopper();

  const onAddOption = useCallback(() => {
    const id = createUUID();
    onChange("options", [...options, { id: id, label: "", imgSrc: "" }]);
  }, [onChange, options]);

  const onOptionChangeHandler = useCallback(
    (newValue: TPictureValue) => {
      onChange(
        "options",
        options.map((option) => {
          if (option.id === newValue.id) {
            return newValue;
          }
          return option;
        })
      );
    },
    [options, onChange]
  );

  const onImageClickHandler = useCallback(
    (e: any, selectedOption: TPictureValue) => {
      selectedImageID.current = selectedOption.id;
      handleImageClick(e);
    },
    [handleImageClick]
  );

  const handleDelete = ({ id }): void => {
    const newOptions = options.filter((option) => option.id !== id);
    onChange("options", newOptions);
  };

  const onImageSelect = useCallback(
    (value: any) => {
      if (!selectedImageID.current || !value.url) return;
      onChange(
        "options",
        options.map((option) => {
          if (option.id === selectedImageID.current) {
            return { ...option, imgSrc: value.url };
          }
          return option;
        })
      );
      selectedImageID.current = null;
    },
    [onChange, options]
  );

  return (
    <div
      style={getPictureOptionGroupStyles({
        alignment: settings?.questionAlignment,
      })}
      data-testid="picture-option-group"
    >
      {options.map((option, index) => {
        const isSelected = settings?.defaultValue?.some(
          (val) => val?.id === option?.id
        );

        return (
          <div
            key={option.id}
            style={getPictureOptionStyles({ isSelected, theme })}
            data-testid={`picture-option-${index}`}
          >
            <ImageCard
              imgSrc={option.imgSrc}
              onImageClick={(e) => {
                onImageClickHandler(e, option);
              }}
            />
            <PictureLabelEditor
              icon={getCharacterByIndex(index)}
              isEditable={true}
              label={option.label}
              onLabelChange={(value) => {
                onOptionChangeHandler({
                  ...option,
                  label: value,
                });
              }}
              theme={theme}
              onEnterKey={onAddOption}
            />
            <div
              className="picture-option-delete-icon"
              style={getCrossIconStyles()}
              onClick={() => {
                handleDelete({ id: option.id });
              }}
              data-testid={`picture-option-delete-icon-${index}`}
            >
              <ODSIcon
                outeIconName={"OUTECloseIcon"}
                outeIconProps={{
                  "data-testid": "picture-option-delete-icon",
                  style: { color: "#000", height: "1rem", width: "1rem" },
                }}
              />
            </div>
          </div>
        );
      })}
      <div
        style={getPictureOptionStyles({ isSelected: false, theme })}
        onClick={onAddOption}
        data-testid="picture-option-add"
      >
        <ImageCard
          icon={
            <ODSIcon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                "data-testid": "picture-option-add-icon",
                style: {
                  color: "#010E50",
                },
              }}
            />
          }
        />
        <PictureLabelEditor
          label="Add Choice"
          icon={
            <ODSIcon
              outeIconName="OUTEEnterIcon"
              outeIconProps={{
                "data-testid": "picture-option-enter-icon",
                style: {
                  color: "#5e5d5d",
                  height: "1.25rem",
                  width: "1.25rem",
                },
              }}
            />
          }
          theme={theme}
        />
      </div>
      <ODSPopper
        open={popperOpen}
        anchorEl={anchorEl}
        placement="left"
        onClose={handleClosePopper}
        style={{
          display: "flex",
          width: "50em",
          height: "40em",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <div
          ref={popperContentRef}
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ImagePicker
              hideEditButton
              hideRecallButton
              isLoadingQuestionType={false}
              onClose={() => {
                // handleClosePopper();
              }}
              onChange={onImageSelect}
              workspaceId={workspaceId}
            />
          </Suspense>
        </div>
      </ODSPopper>
    </div>
  );
};
