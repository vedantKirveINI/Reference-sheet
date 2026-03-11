import { CSSProperties } from "react";

export const imageStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },

  aiButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
    border: "1px solid #DDD6FE",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  suggestionsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    border: "1px solid #E5E7EB",
  },

  suggestionsLabel: {
    fontSize: "0.75rem",
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
  },

  suggestionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.5rem",
  },

  suggestionImage: (isSelected: boolean): CSSProperties => ({
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover" as const,
    borderRadius: "0.375rem",
    cursor: "pointer",
    border: isSelected ? "2px solid #2563EB" : "2px solid transparent",
    transition: "all 0.15s ease",
  }),

  suggestionImagePlaceholder: {
    width: "100%",
    aspectRatio: "1",
    backgroundColor: "#E5E7EB",
    borderRadius: "0.375rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionsRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },

  actionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    padding: "0.5rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  previewContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    border: "1px solid #E5E7EB",
  },

  previewImage: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "16/9",
    borderRadius: "0.375rem",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },

  previewImageElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },

  previewControls: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap" as const,
  },

  controlButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  removeButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#DC2626",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  positionContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },

  positionLabel: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
  },

  positionButtons: {
    display: "flex",
    gap: "0.375rem",
  },

  positionButton: (isSelected: boolean, isDisabled: boolean): CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    padding: "0.5rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: isDisabled ? "#9CA3AF" : isSelected ? "#2563EB" : "#374151",
    backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
    border: isSelected ? "2px solid #2563EB" : "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "all 0.15s ease",
  }),

  fitContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },

  fitLabel: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
  },

  fitButtons: {
    display: "flex",
    gap: "0.375rem",
  },

  fitButton: (isSelected: boolean, isDisabled: boolean): CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    padding: "0.5rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: isDisabled ? "#9CA3AF" : isSelected ? "#2563EB" : "#374151",
    backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
    border: isSelected ? "2px solid #2563EB" : "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "all 0.15s ease",
  }),

  sliderContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },

  sliderLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sliderLabelText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
  },

  sliderValue: {
    fontSize: "0.8125rem",
    color: "#6B7280",
  },

  slider: {
    width: "100%",
    height: "0.5rem",
    borderRadius: "0.25rem",
    backgroundColor: "#E5E7EB",
    appearance: "none" as const,
    cursor: "pointer",
  },

  advancedToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.5rem 0",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#6B7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  },

  advancedContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    paddingLeft: "0.5rem",
  },

  altTextInput: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    resize: "vertical" as const,
    minHeight: "4rem",
  },

  focalPointButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  loadingSpinner: {
    width: "1rem",
    height: "1rem",
    border: "2px solid #E5E7EB",
    borderTop: "2px solid #2563EB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    gap: "0.5rem",
    color: "#6B7280",
    fontSize: "0.875rem",
    textAlign: "center" as const,
  },

  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: "0.75rem",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #E5E7EB",
  },

  modalTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
  },

  modalCloseButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    color: "#6B7280",
  },

  modalTabs: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
  },

  modalTab: (isActive: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: isActive ? "#FFFFFF" : "#374151",
    backgroundColor: isActive ? "#111827" : "#FFFFFF",
    border: isActive ? "none" : "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),

  modalBody: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto" as const,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
  },

  modalCancelButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  modalConfirmButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#FFFFFF",
    backgroundColor: "#18181b",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
  },

  gridImage: (isSelected: boolean): CSSProperties => ({
    width: "100%",
    aspectRatio: "4/3",
    objectFit: "cover" as const,
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: isSelected ? "3px solid #2563EB" : "2px solid transparent",
    transition: "all 0.15s ease",
  }),

  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    border: "1px solid #D1D5DB",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
  },

  uploadZone: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    border: "2px dashed #D1D5DB",
    borderRadius: "0.5rem",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.15s ease",
    gap: "0.75rem",
  },

  uploadZoneActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  aiGenerateContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },

  aiPromptInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    border: "1px solid #D1D5DB",
    borderRadius: "0.5rem",
    minHeight: "5rem",
    resize: "vertical" as const,
  },

  aiStyleOptions: {
    display: "flex",
    gap: "0.5rem",
  },

  aiStyleButton: (isSelected: boolean): CSSProperties => ({
    flex: 1,
    padding: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: isSelected ? "#FFFFFF" : "#374151",
    backgroundColor: isSelected ? "#7C3AED" : "#FFFFFF",
    border: isSelected ? "none" : "1px solid #D1D5DB",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),

  aiGenerateButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#FFFFFF",
    backgroundColor: "#7C3AED",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  aiResultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
    marginTop: "1rem",
  },
};
