import { useState, useEffect, useRef, useMemo } from "react";
import { imageStyles } from "./styles";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { renderImages } from "@src/module/image-picker/services/base-config";
import debounce from "lodash/debounce";

interface AIImageSuggestionsProps {
  questionText: string;
  onSelectImage: (imageUrl: string) => void;
  onBrowseMore: () => void;
  onGenerateCustom: () => void;
}

const AIImageSuggestions = ({
  questionText,
  onSelectImage,
  onBrowseMore,
  onGenerateCustom,
}: AIImageSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const extractKeywords = (text: string): string => {
    const stopWords = ["what", "is", "your", "the", "a", "an", "how", "do", "you", "can", "please", "tell", "me", "about"];
    const words = text
      .toLowerCase()
      .replace(/[?!.,]/g, "")
      .split(" ")
      .filter((word) => word.length > 2 && !stopWords.includes(word));
    return words.slice(0, 3).join(" ") || "abstract background";
  };

  const fetchSuggestions = async (text: string) => {
    if (!text || text.length < 4) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const keywords = extractKeywords(text);
      const images = await renderImages.getImagesFromUnsplash({
        query: keywords,
        page: 1,
      });
      if (isMounted.current) {
        setSuggestions((images || []).slice(0, 4));
      }
    } catch (error) {
      if (isMounted.current) {
        setSuggestions([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const debouncedFetch = useMemo(
    () =>
      debounce((text: string) => {
        if (isMounted.current) {
          fetchSuggestions(text);
        }
      }, 800),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  useEffect(() => {
    if (questionText && questionText.length >= 4) {
      debouncedFetch(questionText);
    } else {
      setSuggestions([]);
    }
  }, [questionText, debouncedFetch]);

  const handleImageClick = (image: any, index: number) => {
    setSelectedIndex(index);
    onSelectImage(image.urls?.regular || image.url);
  };

  return (
    <div style={imageStyles.suggestionsContainer}>
      <div style={imageStyles.suggestionsLabel}>
        <Sparkles size={14} color="#7C3AED" />
        <span>Suggested for your question</span>
      </div>

      {isLoading ? (
        <div style={imageStyles.suggestionsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={imageStyles.suggestionImagePlaceholder}>
              <Loader2 size={16} color="#9CA3AF" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div style={imageStyles.suggestionsGrid}>
          {suggestions.map((image, index) => (
            <img
              key={image.id || index}
              src={image.urls?.small || image.url}
              alt={image.alt_description || "Suggested image"}
              style={imageStyles.suggestionImage(selectedIndex === index)}
              onClick={() => handleImageClick(image, index)}
              data-testid={`ai-suggestion-${index}`}
            />
          ))}
        </div>
      ) : (
        <div style={imageStyles.emptyState}>
          <span>No suggestions available</span>
          <span style={{ fontSize: "0.75rem" }}>Try adding more details to your question</span>
        </div>
      )}

      <div style={imageStyles.actionsRow}>
        <button
          type="button"
          style={imageStyles.actionButton}
          onClick={onBrowseMore}
          data-testid="browse-more-btn"
        >
          <Search size={14} />
          <span>Browse more</span>
        </button>
        <button
          type="button"
          style={{ ...imageStyles.actionButton, color: "#7C3AED", borderColor: "#DDD6FE" }}
          onClick={onGenerateCustom}
          data-testid="generate-custom-btn"
        >
          <Sparkles size={14} />
          <span>Generate with AI</span>
        </button>
      </div>
    </div>
  );
};

export default AIImageSuggestions;
