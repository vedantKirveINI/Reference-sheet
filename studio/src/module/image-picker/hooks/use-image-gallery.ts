import { useCallback, useEffect, useRef, useState } from "react";
import imageSDKServices from "../services/image-sdk-services";
import { toast } from "sonner";

interface IImageGalleryProps {
  workspace_id: string;
  limit?: number;
}

interface IImage {
  _id: string;
  state: "ACTIVE";
  name: string;
  user_id: string;
  workspace_id: string;
  url: string;
  [key: string]: unknown;
}

const IMAGES_LIMIT = 10;

export const useImageGallery = ({
  limit = IMAGES_LIMIT,
  workspace_id,
}: IImageGalleryProps) => {
  const [images, setImages] = useState<IImage[]>([]);
  const [isImageGalleryLoading, setIsImageGalleryLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const currentPageRef = useRef(1);
  const isInitialFetching = useRef(true);

  const onDeleteImageHandler = useCallback(
    async (id: string) => {
      try {
        const image = {
          ids: [id],
        };
        const response = await imageSDKServices.delete(image);
        if (response?.status === "success") {
          const newImages = images.filter((image: IImage) => image._id !== id);
          setImages(newImages);
        }
        return response;
      } catch (error: unknown) {
        toast.error("Image Deletion Error", {
          description:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }
    },
    [images]
  );

  const fetchImages = useCallback(async () => {
    if (isLoadingMore) return; // Prevent multiple simultaneous calls

    try {
      setIsLoadingMore(true);
      const result = await imageSDKServices.list({
        workspace_id: workspace_id,
        limit,
        page: currentPageRef.current,
        sort_by: "created_at",
        sort_type: "desc",
      });

      setImages((prevImages) => [...prevImages, ...result?.docs]);
      setIsLastPage(!result?.has_next_page);
      currentPageRef.current++;
    } catch (error: unknown) {
      toast.error("Image Gallery Error", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [workspace_id, limit, isLoadingMore]);

  const getInitialImages = useCallback(async () => {
    try {
      setIsImageGalleryLoading(true);
      await fetchImages();
      if (isInitialFetching.current) {
        setTimeout(() => {
          fetchImages();
          isInitialFetching.current = false;
        }, 0);
      }
    } catch (error: unknown) {
    } finally {
      setIsImageGalleryLoading(false);
    }
  }, [fetchImages]);

  useEffect(() => {
    setTimeout(() => {
      getInitialImages();
    }, 200);
  }, []);

  return {
    images,
    isImageGalleryLoading,
    isLastPage,
    isLoadingMore,
    fetchImages,
    onDeleteImageHandler,
  };
};
