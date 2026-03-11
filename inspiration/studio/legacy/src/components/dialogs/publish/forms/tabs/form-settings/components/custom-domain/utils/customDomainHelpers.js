import { URL_PATH_REGEX } from "../constants";

// Helper to strip leading slash for display
const getDisplayPath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path.slice(1) : path;
};

// Helper to ensure path has leading slash for storage
const getStoredPath = (value) => {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const constructFullUrl = (link) => {
  const subdomain = link?.custom_domain_subdomain || "";
  const path = link?.custom_domain_path || "";

  if (!subdomain) return "";

  let url = `https://${subdomain}`;
  if (path) {
    url += path.startsWith("/") ? path : `/${path}`;
  }
  return url;
};

const validatePath = (value, linkId, setPathErrors) => {
  if (!value || value.trim() === "") {
    setPathErrors((prev) => ({
      ...prev,
      [linkId]: "Path cannot be empty",
    }));
    return false;
  }

  const trimmedValue = value.trim();

  // Remove leading slash for length validation (slash is not counted)
  const pathWithoutSlash = trimmedValue.startsWith("/")
    ? trimmedValue.slice(1)
    : trimmedValue;

  // Validate format first (check with leading slash for regex)
  if (!URL_PATH_REGEX.test(trimmedValue)) {
    setPathErrors((prev) => ({
      ...prev,
      [linkId]:
        "Path must contain only letters, numbers, hyphens, and underscores",
    }));
    return false;
  }

  // Validate length (5 to 15 characters) - WITHOUT counting the leading slash
  if (pathWithoutSlash.length < 5 || pathWithoutSlash.length > 15) {
    setPathErrors((prev) => ({
      ...prev,
      [linkId]: "Path must be between 5 and 15 characters",
    }));
    return false;
  }

  // Path is valid
  setPathErrors((prev) => ({ ...prev, [linkId]: "" }));
  return true;
};

export { getDisplayPath, getStoredPath, constructFullUrl, validatePath };
