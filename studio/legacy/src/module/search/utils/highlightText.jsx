import React from "react";

export const highlightText = (text, searchTerm, highlightClassName = "searchHighlight") => {
  if (!searchTerm || !text || searchTerm.length < 2) {
    return text;
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <mark key={index} className={highlightClassName}>
          {part}
        </mark>
      );
    }
    return part;
  });
};

export default highlightText;
