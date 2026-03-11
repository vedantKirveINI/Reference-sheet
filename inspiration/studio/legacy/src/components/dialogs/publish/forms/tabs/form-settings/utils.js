const DEFAULT_FORM_SETTINGS = {
  accepting_responses: true,
  close_at: null,
  is_close_at_enabled: false,
  is_max_responses_enabled: false,
  max_responses: null,
  remove_branding: false,
};

/**
 * Validates a URL string - only accepts https:// URLs
 * @param {string} url - The URL to validate
 * @returns {Object} - { isValid: boolean, error: string, fixedUrl: string }
 */
export const validateRedirectUrl = (url) => {
  // Empty URL is allowed (optional field)
  if (!url || url.trim() === "") {
    return { isValid: true, error: "", fixedUrl: "" };
  }

  const trimmedUrl = url.trim();

  // Regex to detect double or multiple protocols (e.g., https://https://, http://https://)
  const doubleProtocolRegex = /^(https?:\/\/){2,}/i;
  if (doubleProtocolRegex.test(trimmedUrl)) {
    return {
      isValid: false,
      error: "Invalid URL format. Please remove duplicate protocol (https://)",
      fixedUrl: trimmedUrl,
    };
  }

  // Check if URL starts with http:// (not allowed, only https://)
  if (trimmedUrl.toLowerCase().startsWith("http://")) {
    return {
      isValid: false,
      error: "Only HTTPS URLs are allowed. Please use https://",
      fixedUrl: trimmedUrl,
    };
  }

  // Clean URL: remove any duplicate https:// at the start
  let cleanedUrl = trimmedUrl.replace(/^(https:\/\/)+/i, "https://");

  // Check if URL already starts with https://
  if (cleanedUrl.toLowerCase().startsWith("https://")) {
    try {
      const urlObj = new URL(cleanedUrl);
      // Ensure it's https protocol
      if (urlObj.protocol !== "https:") {
        return {
          isValid: false,
          error: "Only HTTPS URLs are allowed. Please use https://",
          fixedUrl: trimmedUrl,
        };
      }
      return { isValid: true, error: "", fixedUrl: cleanedUrl };
    } catch {
      return {
        isValid: false,
        error: "Please enter a valid HTTPS URL (e.g., https://example.com)",
        fixedUrl: trimmedUrl,
      };
    }
  }

  // If URL doesn't start with protocol, try adding https://
  try {
    const urlWithHttps = `https://${cleanedUrl}`;
    const urlObj = new URL(urlWithHttps);
    // Ensure it's https protocol
    if (urlObj.protocol !== "https:") {
      return {
        isValid: false,
        error: "Only HTTPS URLs are allowed. Please use https://",
        fixedUrl: trimmedUrl,
      };
    }
    return {
      isValid: true,
      error: "",
      fixedUrl: urlWithHttps,
    };
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid HTTPS URL (e.g., https://example.com)",
      fixedUrl: trimmedUrl,
    };
  }
};

export { DEFAULT_FORM_SETTINGS };
