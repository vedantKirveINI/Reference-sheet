
import React, { useCallback } from "react";
import { useImageGallery } from "../../hooks/use-image-gallery";
import Loading from "../loading";
import { getImageContainerStyles, getInfiniteScrollComponentStyles,  } from "../images/styles";
import InfiniteScroll from "react-infinite-scroll-component";
import { imageStyles } from "./styles";
import GalleryImageCard from "../gallery-image-card";
import { NullScreen } from "@src/module/null-screen";
interface IMyGalleryProps {
  workspaceId: string;
  setEditingImage: (isEditing: boolean) => void;
  handleImageChange: (image: any) => void;
  hideEditButton: boolean;
}

const MyGallery = ({
  workspaceId,
  hideEditButton,
  handleImageChange,
  setEditingImage,
}: IMyGalleryProps) => {
  const {
    images,
    isImageGalleryLoading,
    isLastPage,
    fetchImages,
    onDeleteImageHandler,
  } = useImageGallery({ workspace_id: workspaceId });

  const onImageEditHandler = useCallback(
    (url: string) => {
      handleImageChange(url);
      setEditingImage(true);
    },
    [handleImageChange, setEditingImage]
  );

  if (isImageGalleryLoading) {
    return <Loading dataTestId="my-gallery-loader" />;
  }

  // Show no data message when there are no images
  if (!images || images?.length === 0) {
    return (
      <NullScreen
        labelText="No image available at the moment"
        imageSrc={
          "https://cdn-v1.tinycommand.com/1234567890/1753684023335/emptyScreen.svg"
        }
      />
    );
  }

  return (
    <div
      id="scrollableDivForUnsplash"
      style={getImageContainerStyles}
      data-testid="image-picker-my-gallery-image-container"
    >
      <InfiniteScroll
        dataLength={images?.length}
        next={() => {
          fetchImages();
        }}
        style={getInfiniteScrollComponentStyles()}
        height="100%"
        hasMore={!isLastPage}
        scrollableTarget="scrollableDivForUnsplash"
        loader={
          <div style={imageStyles.loaderContainer}>
            <p style={imageStyles.loaderText}>Loading images...</p>
          </div>
        }
      >
        <div
          style={imageStyles.grid}
          data-testid="image-picker-my-gallery-container"
        >
          {images?.map((image, index) => (
            <GalleryImageCard
              key={image._id}
              name={image.name}
              src={image.url}
              onSelect={() => handleImageChange(image.url)}
              onEdit={() => onImageEditHandler(image.url)}
              onDelete={() => onDeleteImageHandler(image._id)}
              hideEditButton={hideEditButton}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default MyGallery;
