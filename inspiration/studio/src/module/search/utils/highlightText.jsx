import React from "react";

const highlightCache = new Map();
const MAX_CACHE_SIZE = 500;

const getCacheKey = (text, searchTerm, highlightClassName) => 
  `${text}|${searchTerm}|${highlightClassName}`;

export const highlightText = (text, searchTerm, highlightClassName = "searchHighlight") => {
  if (!searchTerm || !text || searchTerm.length < 2) {
    return text;
  }

  const cacheKey = getCacheKey(text, searchTerm, highlightClassName);
  
  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey);
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) {
    return text;
  }

  const result = parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <mark key={index} className={highlightClassName}>
          {part}
        </mark>
      );
    }
    return part;
  });

  if (highlightCache.size >= MAX_CACHE_SIZE) {
    const firstKey = highlightCache.keys().next().value;
    highlightCache.delete(firstKey);
  }
  highlightCache.set(cacheKey, result);

  return result;
};

export const clearHighlightCache = () => {
  highlightCache.clear();
};

export default highlightText;
