import React, { forwardRef, useImperativeHandle, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { getInfiniteScrollComponentStyles, getImageContainerStyles, getRowStyles, getColumnStyles,  } from "./styles";
import { RenderImageArray } from "./renderImageArray";
import { searchInstance, renderImages } from "../../services/base-config";
import Loading from "../loading";
interface IImageProps {
  onClose?: any;
  handleSaveImage?: any;
}

const RenderUnsplashImages = forwardRef(
  ({ onClose, handleSaveImage }: IImageProps, ref) => {
    const currentPageRef = useRef(0);
    const [images, setImages] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isLastPage, setIsLastPage] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const getImages = async (query: string, page?: number) => {
      if (!isNaN(currentPageRef.current)) {
        currentPageRef.current = page;
      }
      if (page === 1) {
        setImages([]);
        setIsLoading(true);
        setIsLastPage(false);
      }
      setSearchQuery(query);
      const fetchedImages = await renderImages.getImagesFromUnsplash({
        query,
        page,
      });
      setIsLoading(false);

      if (fetchedImages?.length === 0) {
        setIsLastPage(true);
        return;
      }
      setImages((prevImages) => {
        return page === 1 ? fetchedImages : [...prevImages, ...fetchedImages];
      });
    };

    useImperativeHandle(ref, () => ({
      getImages: (query: string, page?: number) => {
        getImages(query, page);
      },
    }));

    const onImageSelected = async (item: any) => {
      // const searchInstanceToDownload = searchInstance();
      // const response = await searchInstanceToDownload.markDownload(item?.id);
      // if (response?.status === "success") {
      handleSaveImage({
        imageUrl: item?.urls?.regular || item?.url, //response?.result?.url,
        imageName: item?.alt_description,
      });
      onClose();
      // }
    };

    if (isLoading) {
      return <Loading dataTestId="unsplash-images-loader" />;
    }
    return (
      <div
        id="scrollableDivForUnsplash"
        style={getImageContainerStyles}
        data-testid="image-picker-unsplash-image-container"
      >
        {searchQuery === "" ? (
          <p
            style={{ color: "grey", textAlign: "center" }}
            data-testid="image-picker-no-search-query"
          >
            Start typing to search for images.
          </p>
        ) : images === undefined || images?.length === 0 ? (
          <p
            style={{ color: "grey", textAlign: "center" }}
            data-testid="unsplash-no-images-found"
          >
            No images found. Try searching with a different keyword.
          </p>
        ) : (
          <InfiniteScroll
            dataLength={images?.length}
            next={() => {
              const nextPage = currentPageRef.current + 1;
              getImages(searchQuery, nextPage);
            }}
            style={getInfiniteScrollComponentStyles()}
            height="100%"
            hasMore={!isLastPage}
            loader={null}
            scrollableTarget="scrollableDivForUnsplash"
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
          </InfiniteScroll>
        )}
      </div>
    );
  }
);

export default RenderUnsplashImages;
