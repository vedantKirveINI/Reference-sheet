import { TABLE_COLUMNS } from '../constants/categories.jsx';
import { FIELDS } from '../constants/types.jsx';

// Default icon mapping with CDN URLs - using simple icons that match the design
const DEFAULT_ICON_MAPPING = {
  EMAIL:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/%3E%3Cpolyline points='22,6 12,13 2,6'/%3E%3C/svg%3E",
  SHORT_TEXT:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E",
  LONG_TEXT:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E",
  NUMBER:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='4' y1='9' x2='20' y2='9'/%3E%3Cline x1='4' y1='15' x2='20' y2='15'/%3E%3Cline x1='10' y1='3' x2='8' y2='21'/%3E%3Cline x1='16' y1='3' x2='14' y2='21'/%3E%3C/svg%3E",
  MCQ: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9,11 12,14 22,4'/%3E%3Cpath d='m21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.24 0 2.42.25 3.5.7'/%3E%3C/svg%3E",
  SCQ: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='3' fill='currentColor'/%3E%3C/svg%3E",
  DROP_DOWN:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E",
  TIME: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12,6 12,12 16,14'/%3E%3C/svg%3E",
  DATE: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E",
  DATETIME:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E",
  PHONE_NUMBER:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E",
  ZIP_CODE:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E",
  ADDRESS:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E",
  BOOLEAN:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M8 12h8'/%3E%3Cpath d='M12 8v8'/%3E%3C/svg%3E",
};

// Fallback icon for unknown types
const FALLBACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E";

/**
 * Get type icon URL with fallback support
 * @param {string} type - The field type
 * @returns {string} Icon URL
 */
export const getTypeIcon = (type) => {
  return DEFAULT_ICON_MAPPING[type] || FALLBACK_ICON;
};

/**
 * Format type display name for better readability
 * @param {string} type - The field type (e.g., "SHORT_TEXT")
 * @returns {string} Formatted type name (e.g., "Short Text")
 */
export const formatTypeName = (type) => {
  if (!type) return "";

  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Filter and sort table columns - returns active columns sorted by name
 * @param {Array} columns - Array of column objects
 * @returns {Array} Filtered and sorted columns
 */
export const processTableColumns = (columns = []) => {
  return columns
    .filter((column) => column.status === "active" && !column.deletedTime)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};

/**
 * Transform column data for formula usage
 * @param {Object} column - Column object
 * @returns {Object} Transformed column data for formulas
 */
export const transformColumnForFormula = (column) => {
  return {
    displayValue: column.name,
    category: TABLE_COLUMNS,
    subCategory: FIELDS,
    description: `${column.description ? column.description + " : " : ""} ${
      column.type
    }`,
    args: null,
    returnType: column.type,
    background: "#f1f5f9",
    tableData: column,
  };
};

/**
 * Get unique column types from columns array
 * @param {Array} columns - Array of column objects
 * @returns {Array} Array of unique types with counts
 */
export const getColumnTypes = (columns = []) => {
  const typeMap = new Map();

  columns.forEach((column) => {
    if (column.status === "active" && !column.deletedTime) {
      const type = column.type;
      const current = typeMap.get(type) || {
        type,
        count: 0,
        displayName: formatTypeName(type),
      };
      typeMap.set(type, { ...current, count: current.count + 1 });
    }
  });

  return Array.from(typeMap.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
};

/**
 * Group columns by type
 * @param {Array} columns - Array of column objects
 * @returns {Object} Columns grouped by type
 */
export const groupColumnsByType = (columns = []) => {
  const activeColumns = processTableColumns(columns);

  return activeColumns.reduce((groups, column) => {
    const type = column.type;
    if (!groups[type]) {
      groups[type] = {
        type,
        displayName: formatTypeName(type),
        columns: [],
        count: 0,
      };
    }
    groups[type].columns.push(column);
    groups[type].count++;
    return groups;
  }, {});
};

/**
 * Validate column data
 * @param {Object} column - Column object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateColumn = (column) => {
  const errors = [];

  if (!column.name || column.name.trim() === "") {
    errors.push("Column name is required");
  }

  if (!column.type) {
    errors.push("Column type is required");
  }

  if (!column.dbFieldName) {
    errors.push("Database field name is required");
  }

  if (!column.cellValueType) {
    errors.push("Cell value type is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get column statistics
 * @param {Array} columns - Array of column objects
 * @returns {Object} Statistics about the columns
 */
export const getColumnStatistics = (columns = []) => {
  const activeColumns = processTableColumns(columns);
  const types = getColumnTypes(columns);

  return {
    total: columns.length,
    active: activeColumns.length,
    deleted: columns.filter((col) => col.deletedTime).length,
    inactive: columns.filter((col) => col.status !== "active").length,
    types: types.length,
    mostCommonType:
      types.length > 0
        ? types.reduce((a, b) => (a.count > b.count ? a : b))
        : null,
    typeDistribution: types,
  };
};

// Export constants for external use
export { DEFAULT_ICON_MAPPING, FALLBACK_ICON };
