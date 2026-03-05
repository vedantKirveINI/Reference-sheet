import { ODSButton } from '@src/module/ods';
import { ODSIcon } from '@src/module/ods';
import { IMAGE_SOURCE } from "../../utils/contants";

const TopButtons = ({ imageSource, setImageSource, hideRecallButton }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
      }}
      data-testid="image-picker-top-buttons-container"
    >
      <ODSButton
        label={IMAGE_SOURCE.UNSPLASH}
        size="large"
        variant={imageSource === IMAGE_SOURCE.UNSPLASH ? "black" : "black-text"}
        startIcon={
          <ODSIcon
            outeIconName="OUTEUnsplashIcon"
            outeIconProps={{
              "data-testid": "image-picker-unsplash-icon",
              sx: {
                height: "1.125rem",
                width: "1.125rem",
                color: imageSource === IMAGE_SOURCE.UNSPLASH ? "#FFF" : "#000",
              },
            }}
          />
        }
        data-testid="image-picker-unsplash-button"
        onClick={() => setImageSource(IMAGE_SOURCE.UNSPLASH)}
      />
      <ODSButton
        label={IMAGE_SOURCE.MY_GALLERY}
        size="large"
        variant={
          imageSource === IMAGE_SOURCE.MY_GALLERY ? "black" : "black-text"
        }
        startIcon={
          <ODSIcon
            outeIconName="OUTEImageIcon"
            outeIconProps={{
              "data-testid": "image-picker-my-gallery-icon",
              sx: {
                color:
                  imageSource === IMAGE_SOURCE.MY_GALLERY ? "#FFF" : "#000",
              },
            }}
          />
        }
        data-testid="image-picker-my-gallery-button"
        onClick={() => setImageSource(IMAGE_SOURCE.MY_GALLERY)}
      />
      <ODSButton
        label={IMAGE_SOURCE.UPLOAD}
        size="large"
        variant={imageSource === IMAGE_SOURCE.UPLOAD ? "black" : "black-text"}
        startIcon={
          <ODSIcon
            outeIconName="OUTEUploadIcon"
            outeIconProps={{
              "data-testid": "image-picker-upload-icon",
              sx: {
                color: imageSource === IMAGE_SOURCE.UPLOAD ? "#FFF" : "#000",
              },
            }}
          />
        }
        data-testid="image-picker-upload-button"
        onClick={() => setImageSource(IMAGE_SOURCE.UPLOAD)}
      />
      {!hideRecallButton && (
        <ODSButton
          label={IMAGE_SOURCE.RECALL_IMAGE}
          size="large"
          variant={
            imageSource === IMAGE_SOURCE.RECALL_IMAGE ? "black" : "black-text"
          }
          startIcon={
            <ODSIcon
              outeIconName="OUTESyncIcon"
              outeIconProps={{
                "data-testid": "image-picker-recall-image-icon",
                sx: {
                  color:
                    imageSource === IMAGE_SOURCE.RECALL_IMAGE ? "#FFF" : "#000",
                  transform: "rotate(160deg) scaleX(-1)",
                },
              }}
            />
          }
          data-testid="image-picker-recall-button"
          onClick={() => setImageSource(IMAGE_SOURCE.RECALL_IMAGE)}
        />
      )}
    </div>
  );
};

export default TopButtons;
