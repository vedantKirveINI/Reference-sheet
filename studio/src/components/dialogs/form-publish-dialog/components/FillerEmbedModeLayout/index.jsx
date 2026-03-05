import React, { forwardRef } from "react";
import { EMBED_MODES } from "../../../publish/constants";
import {
  FullPagePreview,
  PopoverPreview,
  PopupPreview,
  SideTabPreview,
  SliderPreview,
  StandardPreview,
} from "./preview-modes";
import { IFramePreviewWrapper } from "./preview-modes/IframePreviewWrapper";

function FillerEmbedModeLayout({ properties = {}, embedMode, viewPort }, ref) {
  const previewModeComponents = {
    [EMBED_MODES.FULL_PAGE]: FullPagePreview,
    [EMBED_MODES.STANDARD]: StandardPreview,
    [EMBED_MODES.POPUP]: PopupPreview,
    [EMBED_MODES.SLIDER]: SliderPreview,
    [EMBED_MODES.POPOVER]: PopoverPreview,
    [EMBED_MODES.SIDE_TAB]: SideTabPreview,
  };

  // Get the appropriate preview component
  const PreviewComponent = previewModeComponents[embedMode] || StandardPreview;

  if (!PreviewComponent) {
    return null;
  }

  return (
    <IFramePreviewWrapper ref={ref}>
      <PreviewComponent properties={properties} viewPort={viewPort} />
    </IFramePreviewWrapper>
  );
}

export default forwardRef(FillerEmbedModeLayout);
