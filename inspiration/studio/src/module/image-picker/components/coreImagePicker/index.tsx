import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { containerStyles } from "./styles";
import Uploader from "../uploadSection";
import Filters from "../filters";
import RecallImage from "../recallImage";
import MyGallery from "../myGallery";
import { ALIGNEMENT, IMAGE_SOURCE, OBJECTFIT } from "../../utils/contants";
import imageSDKServices from "../../services/image-sdk-services";
import EditImage from "../myGallery/editImage";
import { toast } from "sonner";
import TopButtons from "../topButtons";
import Loading from "../loading";
import RenderLoadersJsonImages from "../images/renderLoadersJsonImages";
import RenderUnsplashImages from "../images/renderUnplashImages";
export type CoreImagePickerProps = {
  onClose?: any;
  onChange?: any;
  isLoadingQuestionType?: boolean;
  initialSearchQuery?: string;
  variables?: any;
  workspaceId?: string;
  val?: any;
  hideRecallButton?: boolean;
  hideEditButton?: boolean;
};

export const CoreImagePicker = forwardRef(
  (
    {
      onClose,
      onChange,
      isLoadingQuestionType,
      initialSearchQuery,
      variables,
      workspaceId,
      val,
      hideRecallButton = true,
      hideEditButton = false,
    }: CoreImagePickerProps,
    ref
  ) => {
    const imageRef = useRef(null);
    const [imageSource, setImageSource] = useState(
      isLoadingQuestionType ? IMAGE_SOURCE.LOADERS_JSON : IMAGE_SOURCE.UNSPLASH
    );
    const [editingImage, setEditingImage] = useState(false);

    useEffect(() => {
      setImageSource(
        isLoadingQuestionType ? IMAGE_SOURCE.LOADERS_JSON : IMAGE_SOURCE.UNSPLASH
      );
    }, [isLoadingQuestionType]);

    const augmentor = val;
    useImperativeHandle(
      ref,
      () => ({
        openImageToolbar: () => {
          setEditingImage(true);
        },
        closeImageToolbar: () => {
          setEditingImage(false);
        },
      }),
      []
    );

    const handleSaveImage = async ({ imageUrl, imageName }) => {
      try {
        let prev = augmentor?.url;
        handleImageChange(imageUrl);
        let newImage = {
          name: imageName || "Image",
          url: imageUrl,
          workspace_id: workspaceId,
        };
        const response = await imageSDKServices.save(newImage);
        if (response?.status !== "success") {
          handleImageChange(prev);
          toast.error("Image Setup Error", {
            description: "Something went wrong while setting up the image",
          });
        }
        return response;
      } catch (error) {
      }
    };

    const handleImageChange = (imageUrl) => {
      const { blocks, ...augmentorWithoutBlocks } = augmentor || {};
      const updatedImage = {
        ...augmentorWithoutBlocks,
        alignment: {
          ...augmentor?.alignment,
          cardDesktop: augmentor?.alignment?.cardDesktop || ALIGNEMENT.RIGHT,
          classicDesktop:
            augmentor?.alignment?.classicDesktop || ALIGNEMENT.RIGHT,
        },
        objectFit: augmentor?.objectFit || OBJECTFIT.COVER,
        url: imageUrl,
      };
      onChange(updatedImage);
    };

    const handleRecallImage = (blocks) => {
      const updatedImage = {
        ...augmentor,
        url: "",
        blocks,
      };
      onChange(updatedImage);
    };

    return (
      <div
        data-testid="image-picker-container"
        style={containerStyles({ imageSource })}
      >
        {!isLoadingQuestionType && (
          <TopButtons
            imageSource={imageSource}
            setImageSource={setImageSource}
            hideRecallButton={hideRecallButton}
          />
        )}
        {imageSource === IMAGE_SOURCE.LOADERS_JSON && (
          <RenderLoadersJsonImages
            onSelect={(url) => {
              onChange({ url });
              onClose();
            }}
            selectedImage={val?.url}
          />
        )}
        {imageSource === IMAGE_SOURCE.UNSPLASH && (
          <>
            <Filters
              imageRef={imageRef}
              initialSearchQuery={initialSearchQuery}
              isLoadingQuestionType={isLoadingQuestionType}
            />
            <RenderUnsplashImages
              ref={imageRef}
              handleSaveImage={({ imageUrl }) => {
                handleImageChange(imageUrl);
              }}
              onClose={onClose}
            />
          </>
        )}
        {imageSource === IMAGE_SOURCE.MY_GALLERY && (
          <MyGallery
            setEditingImage={setEditingImage}
            handleImageChange={handleImageChange}
            hideEditButton={hideEditButton}
            workspaceId={workspaceId}
          />
        )}
        {imageSource === IMAGE_SOURCE.UPLOAD && (
          <Uploader handleSaveImage={handleSaveImage} />
        )}
        {imageSource === IMAGE_SOURCE.RECALL_IMAGE && (
          <RecallImage
            blocks={augmentor?.blocks}
            variables={variables}
            handleRecallImage={handleRecallImage}
          />
        )}
        {editingImage && (
          <EditImage
            augmentor={augmentor}
            onChange={onChange}
            onCloseEditor={() => setEditingImage(false)}
          />
        )}
      </div>
    );
  }
);
