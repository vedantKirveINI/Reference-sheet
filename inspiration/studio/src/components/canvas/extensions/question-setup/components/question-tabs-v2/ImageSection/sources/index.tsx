import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { icons } from "@/components/icons";
import { renderImages } from "@src/module/image-picker/services/base-config";
import { uploadFile } from "@src/module/image-picker/utils/fileUploadApi";
import imageSDKServices from "@src/module/image-picker/services/image-sdk-services";
import { useImageGallery } from "@src/module/image-picker/hooks/use-image-gallery";
import debounce from "lodash/debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Card } from "@/components/ui/card";

interface TabProps {
  onSelectImage: (url: string) => void;
  workspaceId?: string;
}

export const UnsplashTab = ({ onSelectImage }: TabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchImages = async (query: string, pageNum: number) => {
    const searchTerm = query || "nature background";
    setIsLoading(true);
    try {
      const results = await renderImages.getImagesFromUnsplash({
        query: searchTerm,
        page: pageNum,
      });
      if (!isMounted.current) return;
      if (pageNum === 1) {
        setImages(results || []);
      } else {
        setImages((prev) => [...prev, ...(results || [])]);
      }
    } catch (error) {
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const debouncedFetch = useMemo(
    () =>
      debounce((query: string) => {
        if (!isMounted.current) return;
        setPage(1);
        fetchImages(query, 1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  useEffect(() => {
    fetchImages("nature background", 1);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedFetch(e.target.value);
  };

  const handleImageClick = (image: any) => {
    onSelectImage(image.urls?.regular);
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        placeholder="Search Unsplash for images..."
        value={searchQuery}
        onChange={handleSearchChange}
        data-testid="unsplash-search"
      />

      {isLoading && images.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              className="w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent transition-all cursor-pointer hover:border-primary/50"
              onClick={() => handleImageClick(image)}
              data-testid={`unsplash-image-${image.id}`}
            >
              <img
                src={image.urls?.small}
                alt={image.alt_description || "Unsplash image"}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 0 && !isLoading && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchImages(searchQuery || "nature background", nextPage);
          }}
        >
          Load more
        </Button>
      )}
    </div>
  );
};

export const GalleryTab = ({ onSelectImage, workspaceId }: TabProps) => {
  const { images, isImageGalleryLoading } = useImageGallery({
    workspace_id: workspaceId || "",
  });

  if (isImageGalleryLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <icons.image className="size-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No saved images yet</EmptyTitle>
          <EmptyDescription>Images you use will appear here</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map((image: any) => (
        <button
          key={image._id}
          type="button"
          className="w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent transition-all cursor-pointer hover:border-primary/50"
          onClick={() => onSelectImage(image.url)}
          data-testid={`gallery-image-${image._id}`}
        >
          <img
            src={image.url}
            alt={image.name || "Gallery image"}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export const UploadTab = ({ onSelectImage, workspaceId }: TabProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError("");
    try {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 4) {
        setError("File size must be less than 4MB");
        setIsUploading(false);
        return;
      }
      const allowedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedFormats.includes(file.type)) {
        setError("Only JPEG, PNG, WEBP, and GIF files are allowed");
        setIsUploading(false);
        return;
      }
      // 1. Upload file to get CDN URL (same as original image picker uploadSection)
      const url = await uploadFile(file);
      if (!url) {
        setError("Failed to upload image");
        return;
      }
      // 2. Save to user's gallery via image SDK (same as coreImagePicker handleSaveImage)
      if (workspaceId) {
        const response = await imageSDKServices.save({
          name: file.name || "Image",
          url,
          workspace_id: workspaceId,
        });
        if (response?.status !== "success") {
          setError("Failed to save image to gallery");
          return;
        }
      }
      onSelectImage(url);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
  });

  const handleUrlSubmit = () => {
    const trimmed = urlInput?.trim();
    if (!trimmed) return;
    setError("");
    setIsUploadingUrl(true);
    const img = new window.Image();
    img.onload = async () => {
      try {
        const imageName = trimmed.split("?")[0].split("/").at(-1) || "Image";
        if (workspaceId) {
          const response = await imageSDKServices.save({
            name: imageName,
            url: trimmed,
            workspace_id: workspaceId,
          });
          if (response?.status !== "success") {
            setError("Failed to save image to gallery");
            setIsUploadingUrl(false);
            return;
          }
        }
        onSelectImage(trimmed);
        setUrlInput("");
      } catch (err) {
        setError("Failed to save image to gallery");
      } finally {
        setIsUploadingUrl(false);
      }
    };
    img.onerror = () => {
      setError("Invalid image URL");
      setIsUploadingUrl(false);
    };
    img.src = trimmed;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Upload via URL</Label>
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Paste image URL here..."
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError("");
              }}
              data-testid="url-input"
              disabled={isUploadingUrl}
            />
          </div>
          <Button
            type="button"
            variant="black"
            onClick={handleUrlSubmit}
            disabled={isUploadingUrl}
          >
            {isUploadingUrl ? <Spinner className="size-4" /> : "Add"}
          </Button>
        </div>
      </div>

      <Card
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 p-8 cursor-pointer transition-colors border-2 border-dashed ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        data-testid="upload-dropzone"
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Spinner className="size-8" />
        ) : (
          <>
            <icons.upload className="size-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isDragActive ? "Drop your image here" : "Drag & drop an image, or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WEBP, GIF up to 4MB
            </span>
          </>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const AIGenerateTab = ({ onSelectImage }: TabProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const styles = [
    { id: "photo", label: "Realistic Photo" },
    { id: "illustration", label: "Illustration" },
    { id: "abstract", label: "Abstract" },
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const results = await renderImages.getImagesFromAI({
        query: `${style} style: ${prompt}`,
        page: 1,
      });
      const urls = (results || []).map((img: any) => img.url || img);
      setGeneratedImages(urls.slice(0, 4));
    } catch (error) {
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageClick = (url: string) => {
    onSelectImage(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Describe the image you want</Label>
        <Textarea
          placeholder="e.g., A serene mountain landscape at sunset with warm golden colors..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          data-testid="ai-prompt"
        />
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <div className="flex gap-2">
          {styles.map((s) => (
            <Button
              key={s.id}
              type="button"
              variant={style === s.id ? "default" : "outline"}
              onClick={() => setStyle(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt || isGenerating}
        data-testid="ai-generate-btn"
      >
        {isGenerating ? (
          <>
            <Spinner className="size-4" />
            Generating...
          </>
        ) : (
          <>
            <icons.sparkles className="size-4" />
            Generate Images
          </>
        )}
      </Button>

      {generatedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {generatedImages.map((url, index) => (
            <button
              key={index}
              type="button"
              className="w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent transition-all cursor-pointer hover:border-primary/50"
              onClick={() => handleImageClick(url)}
              data-testid={`ai-result-${index}`}
            >
              <img
                src={url}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

