import { CSSProperties } from "react";

export const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    height: "100%",
    overflowY: "auto" as const,
  },

  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    color: "#6B7280",
    fontSize: "0.875rem",
  },

  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },

  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.25rem",
  },

  sectionDivider: {
    height: "1px",
    backgroundColor: "#E5E7EB",
    margin: "0.5rem 0",
  },

  settingRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },

  settingLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },

  settingDescription: {
    fontSize: "0.75rem",
    color: "#6B7280",
    lineHeight: 1.3,
    marginTop: "0.125rem",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.375rem",
    border: "1px solid #F3F4F6",
  },

  inputRowLabel: {
    color: "#6B7280",
    fontSize: "0.875rem",
    whiteSpace: "nowrap" as const,
  },

  switchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.375rem",
    border: "1px solid #F3F4F6",
    minHeight: "2.5rem",
  },

  switchContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.125rem",
    flex: 1,
  },

  alignmentContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },

  alignmentButtons: {
    display: "flex",
    gap: "0.5rem",
  },

  alignmentButton: (isSelected: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: isSelected ? "2px solid #2563EB" : "1px solid #D1D5DB",
    backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),

  imageUploadContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.375rem",
  },

  imagePreview: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "16/9",
    borderRadius: "0.375rem",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },

  imagePreviewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },

  imageControls: {
    display: "flex",
    gap: "0.5rem",
  },

  controlButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

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

  slider: {
    width: "100%",
    height: "0.5rem",
    borderRadius: "0.25rem",
    backgroundColor: "#E5E7EB",
    appearance: "none" as const,
    cursor: "pointer",
  },

  uploadButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1.5rem",
    border: "2px dashed #D1D5DB",
    borderRadius: "0.375rem",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.15s ease",
    color: "#6B7280",
    fontSize: "0.875rem",
  },
};
