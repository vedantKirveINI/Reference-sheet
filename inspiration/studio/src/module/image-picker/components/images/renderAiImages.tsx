import React, { forwardRef, useImperativeHandle } from "react";
import { getImageContainerStyles, getRowStyles, getColumnStyles,  } from "./styles";
import { RenderImageArray } from "./renderImageArray";
import { renderImages } from "../../services/base-config";
import isEmpty from "lodash/isEmpty";
interface IImageProps {
  onImageSelect?: any;
  loading?: boolean;
  setLoading?: any;
  onClose?: any;
}

type getImagesParams = {
  query: string;
  page?: number;
};

const RenderAiImages = forwardRef(
  ({ onImageSelect, loading, setLoading, onClose }: IImageProps, ref) => {
    const [images, setImages] = React.useState([]);
    const getImages = async (query: string, page?: number) => {
      const fetchedImages = await renderImages.getImagesFromAI({ query, page });
      if (page === 1) {
        setImages(fetchedImages);
      } else {
        setImages((prevImages) => {
          return [...prevImages, ...fetchedImages];
        });
      }
      setLoading(false);
    };

    useImperativeHandle(ref, () => ({
      getImages: (query: string, page?: number) => {
        getImages(query, page);
      },
    }));

    const onImageSelected = (item: any) => {
      onImageSelect(item?.url);
      onClose();
    };

    if (loading) {
      return <div>Loading images...</div>;
    }

    if (isEmpty(images)) {
      return <div>Search for Images</div>;
    }

    return (
      <div
        id="scrollableDivForAi"
        style={getImageContainerStyles}
        data-testid="image-picker-ai-image-container"
      >
        <div style={getRowStyles()}>
          <div style={getColumnStyles()}>
            <RenderImageArray
              images={images?.filter((item, index) => index % 2 === 0)}
              onImageSelect={onImageSelected}
              testIdPrefix="left"
            />
          </div>
          <div style={getColumnStyles()}>
            <RenderImageArray
              images={images?.filter((item, index) => index % 2 !== 0)}
              onImageSelect={onImageSelected}
              testIdPrefix="right"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default RenderAiImages;
