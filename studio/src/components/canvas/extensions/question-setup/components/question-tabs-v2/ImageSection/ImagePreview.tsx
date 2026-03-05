import { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { imageStyles } from "./styles";
import { Crop, RefreshCw, Trash2, X, Check } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImagePreviewProps {
  imageUrl: string;
  opacity: number;
  onImageChange: (url: string) => void;
  onOpacityChange: (opacity: number) => void;
  onRemove: () => void;
  onReplace: () => void;
}

const ImagePreview = ({
  imageUrl,
  opacity,
  onImageChange,
  onOpacityChange,
  onRemove,
  onReplace,
}: ImagePreviewProps) => {
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !imageUrl) return;

    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onImageChange(croppedImage);
      setShowCropper(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (showCropper) {
    return (
      <div style={imageStyles.previewContainer}>
        <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "#1F2937", borderRadius: "0.375rem", overflow: "hidden" }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div style={imageStyles.sliderContainer}>
          <div style={imageStyles.sliderLabel}>
            <span style={imageStyles.sliderLabelText}>Zoom</span>
            <span style={imageStyles.sliderValue}>{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={imageStyles.slider}
            data-testid="crop-zoom-slider"
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            style={imageStyles.controlButton}
            onClick={handleCancelCrop}
          >
            <X size={14} />
            Cancel
          </button>
          <button
            type="button"
            style={{ ...imageStyles.controlButton, backgroundColor: "#2563EB", color: "#FFFFFF", border: "none" }}
            onClick={handleSaveCrop}
            data-testid="crop-save-btn"
          >
            <Check size={14} />
            Apply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={imageStyles.previewContainer}>
      <div style={imageStyles.previewImage}>
        <img
          src={imageUrl}
          alt="Selected image"
          style={{ ...imageStyles.previewImageElement, opacity: opacity / 100 }}
          data-testid="image-preview"
        />
      </div>

      <div style={imageStyles.previewControls}>
        <button
          type="button"
          style={imageStyles.controlButton}
          onClick={() => setShowCropper(true)}
          data-testid="crop-btn"
        >
          <Crop size={14} />
          Crop
        </button>
        <button
          type="button"
          style={imageStyles.controlButton}
          onClick={onReplace}
          data-testid="replace-btn"
        >
          <RefreshCw size={14} />
          Replace
        </button>
        <button
          type="button"
          style={imageStyles.removeButton}
          onClick={onRemove}
          data-testid="remove-btn"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>

      <div style={imageStyles.sliderContainer}>
        <div style={imageStyles.sliderLabel}>
          <span style={imageStyles.sliderLabelText}>Transparency</span>
          <span style={imageStyles.sliderValue}>{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onOpacityChange(parseInt(e.target.value, 10))}
          style={imageStyles.slider}
          data-testid="opacity-slider"
        />
      </div>
    </div>
  );
};

async function getCroppedImg(imageSrc: string, pixelCrop: CropArea): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(imageSrc);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export default ImagePreview;
