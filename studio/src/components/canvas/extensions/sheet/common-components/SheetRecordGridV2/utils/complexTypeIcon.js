import { MapPin, Phone } from "lucide-react";

/**
 * Get the icon component for complex field types
 * @param {string} fieldType - The field type to get icon for
 * @returns {React.ComponentType|null} - Icon component or null
 */
export function getComplexTypeIcon(fieldType) {
  const typeUpper = String(fieldType || "").toUpperCase();
  if (typeUpper === "ADDRESS" || typeUpper.includes("ADDRESS")) {
    return MapPin;
  }
  if (typeUpper === "PHONE_NUMBER" || typeUpper === "PHONE" || typeUpper.includes("PHONE")) {
    return Phone;
  }
  return null;
}

