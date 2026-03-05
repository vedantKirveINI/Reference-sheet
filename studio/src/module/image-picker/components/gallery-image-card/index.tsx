
import React, { memo } from "react";
import { galleryImageCardStyles } from "./styles";
import { ODSButton } from "@src/module/ods";
import { useIntersection } from "../../hooks/use-intersection";
interface IGalleryImageCardProps {
  name: string;
  src: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hideEditButton: boolean;
}

const GalleryImageCard = ({
  name,
  src,
  onSelect,
  onEdit,
  onDelete,
  hideEditButton,
}: IGalleryImageCardProps) => {
  const { ref: galleryCardRef, isVisible } = useIntersection({
    rootMargin: "200px",
  });
  return (
    <div style={galleryImageCardStyles.container(src)} ref={galleryCardRef}>
      {isVisible ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "transform", // helps GPU compositing
          }}
        />
      ) : (
        <div className="gallery-card-placeholder">Loading...</div>
      )}

      <div
        className="overlay"
        style={galleryImageCardStyles.overlay}
        data-testid="image-picker-my-gallery-overlay"
      >
        <div style={galleryImageCardStyles.buttons}>
          <ODSButton
            label="Apply"
            onClick={onSelect}
            variant="outlined"
            
            data-testid="image-picker-my-gallery-apply-button"
          />
          {!hideEditButton && (
            <ODSButton
              label="Edit"
              onClick={onEdit}
              variant="outlined"
              
              data-testid="image-picker-my-gallery-edit-button"
            />
          )}
          <ODSButton
            label="Delete"
            onClick={onDelete}
            variant="outlined"
            
            data-testid="image-picker-my-gallery-delete-button"
          />
        </div>
        <div style={galleryImageCardStyles.imageText}>{name}</div>
      </div>
    </div>
  );
};

export default memo(GalleryImageCard);
