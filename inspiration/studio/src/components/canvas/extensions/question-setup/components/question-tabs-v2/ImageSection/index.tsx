import { useState, useCallback, useEffect } from "react";
import { Mode } from "@src/module/constants";
import ImagePreview from "./ImagePreview";
import ImagePositionSelector from "./ImagePositionSelector";
import ImageFitSelector from "./ImageFitSelector";
// import MobileFocalPoint from "./MobileFocalPoint";
import AltTextSection from "./AltTextSection";
import { UnsplashTab, GalleryTab, UploadTab } from "./sources";
// import { AIGenerateTab } from "./sources"; // Generate AI with image - commented out for now
import RenderLoadersJsonImages from "@src/module/image-picker/components/images/renderLoadersJsonImages";
import {
  PillTabs,
  PillTabsList,
  PillTabsTrigger,
  PillTabsContent,
} from "@/components/ui/pill-tabs";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

interface ImageSectionProps {
  augmentor: any;
  onChange: (augmentor: any) => void;
  mode?: string;
  workspaceId?: string;
  isLoadingQuestionType?: boolean;
  openReplaceSection?: boolean;
}

const ImageSection = ({
  augmentor,
  onChange,
  mode,
  workspaceId,
  isLoadingQuestionType,
  openReplaceSection,
}: ImageSectionProps) => {
  const [activeSourceTab, setActiveSourceTab] = useState("unsplash");
  const [showReplaceSection, setShowReplaceSection] = useState(false);

  useEffect(() => {
    if (openReplaceSection) setShowReplaceSection(true);
  }, [openReplaceSection]);

  const imageUrl = augmentor?.url || "";
  const opacity = augmentor?.opacity ?? 100;
  const position = augmentor?.alignment?.cardDesktop || "right";
  const objectFit = augmentor?.objectFit || "cover";
  const altText = augmentor?.altText || "";

  const isClassicMode = mode === Mode.CLASSIC;

  const updateAugmentor = useCallback((updates: Partial<typeof augmentor>) => {
    const updatedAugmentor = {
      ...augmentor,
      ...updates,
      alignment: {
        ...(augmentor?.alignment || {}),
        ...(updates.alignment || {}),
      },
      focalPoint: updates.focalPoint !== undefined 
        ? updates.focalPoint 
        : (augmentor?.focalPoint || { x: 50, y: 50 }),
      altText: updates.altText !== undefined 
        ? updates.altText 
        : (augmentor?.altText || ""),
    };
    onChange(updatedAugmentor);
  }, [augmentor, onChange]);

  const handleSelectImage = useCallback((url: string) => {
    const currentPosition = augmentor?.alignment?.cardDesktop || "right";
    const safePosition = isClassicMode && currentPosition === "background" ? "right" : currentPosition;
    
    updateAugmentor({
      url,
      alignment: {
        ...(augmentor?.alignment || {}),
        cardDesktop: safePosition,
        classicDesktop: safePosition === "background" ? "right" : safePosition,
      },
      objectFit: augmentor?.objectFit || "cover",
      opacity: augmentor?.opacity ?? 100,
    });
  }, [augmentor, isClassicMode, updateAugmentor]);

  const handleRemoveImage = useCallback(() => {
    updateAugmentor({ url: "", opacity: 100 });
  }, [updateAugmentor]);

  const handlePositionChange = useCallback((newPosition: string) => {
    updateAugmentor({
      alignment: {
        ...(augmentor?.alignment || {}),
        cardDesktop: newPosition,
        classicDesktop: newPosition === "background" ? "right" : newPosition,
      },
    });
  }, [augmentor, updateAugmentor]);

  const handleFitChange = useCallback((newFit: string) => {
    updateAugmentor({ objectFit: newFit });
  }, [updateAugmentor]);

  const handleOpacityChange = useCallback((newOpacity: number) => {
    updateAugmentor({ opacity: newOpacity });
  }, [updateAugmentor]);

  const handleAltTextChange = useCallback((newAltText: string) => {
    updateAugmentor({ altText: newAltText });
  }, [updateAugmentor]);

  const handleReplace = useCallback(() => {
    setShowReplaceSection(true);
  }, []);

  const handleSelectImageForReplace = useCallback(
    (url: string) => {
      handleSelectImage(url);
      setShowReplaceSection(false);
    },
    [handleSelectImage]
  );

  const showSourceTabs = !imageUrl || isLoadingQuestionType || showReplaceSection;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Image</span>
      </div>

      {showSourceTabs ? (
        <>
          {isLoadingQuestionType ? (
            <RenderLoadersJsonImages 
              onSelect={handleSelectImage} 
              selectedImage={imageUrl}
            />
          ) : (
            <>
              {showReplaceSection && imageUrl && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Choose new image</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setShowReplaceSection(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <PillTabs value={activeSourceTab} onValueChange={setActiveSourceTab}>
                <PillTabsList size="sm" className="w-full flex-wrap">
                  <PillTabsTrigger value="unsplash" size="sm">
                    <icons.search className="size-3.5" />
                    Unsplash
                  </PillTabsTrigger>
                  <PillTabsTrigger value="gallery" size="sm">
                    <icons.image className="size-3.5" />
                    Gallery
                  </PillTabsTrigger>
                  <PillTabsTrigger value="upload" size="sm">
                    <icons.upload className="size-3.5" />
                    Upload
                  </PillTabsTrigger>
                </PillTabsList>

                <PillTabsContent value="unsplash">
                  <UnsplashTab
                    onSelectImage={showReplaceSection ? handleSelectImageForReplace : handleSelectImage}
                    workspaceId={workspaceId}
                  />
                </PillTabsContent>
                <PillTabsContent value="gallery">
                  <GalleryTab
                    onSelectImage={showReplaceSection ? handleSelectImageForReplace : handleSelectImage}
                    workspaceId={workspaceId}
                  />
                </PillTabsContent>
                <PillTabsContent value="upload">
                  <UploadTab
                    onSelectImage={showReplaceSection ? handleSelectImageForReplace : handleSelectImage}
                    workspaceId={workspaceId}
                  />
                </PillTabsContent>
              </PillTabs>
            </>
          )}
        </>
      ) : (
        <>
          <ImagePreview
            imageUrl={imageUrl}
            opacity={opacity}
            onImageChange={(url) => updateAugmentor({ url })}
            onOpacityChange={handleOpacityChange}
            onRemove={handleRemoveImage}
            onReplace={handleReplace}
          />

          <ImagePositionSelector
            position={position}
            onChange={handlePositionChange}
            mode={mode}
          />

          <ImageFitSelector
            fit={objectFit}
            onChange={handleFitChange}
            disabled={position === "background"}
          />

          {/* Mobile focal point - commented out. To restore: uncomment import, add focalPoint and handleFocalPointChange, then this block.
          <MobileFocalPoint imageUrl={imageUrl} focalPoint={...} onChange={...} />
          */}

          <AltTextSection
            altText={altText}
            onChange={handleAltTextChange}
          />
        </>
      )}
    </div>
  );
};

export default ImageSection;
