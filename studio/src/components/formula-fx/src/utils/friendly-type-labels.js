/**
 * Marketing-friendly type labels
 * Maps technical type names to user-friendly labels
 */

const TYPE_LABEL_MAP = {
  // Core types
  'string': 'Text',
  'text': 'Text',
  'str': 'Text',
  
  // Numbers
  'number': 'Number',
  'int': 'Number',
  'integer': 'Number',
  'float': 'Number',
  'decimal': 'Number',
  'numeric': 'Number',
  
  // Boolean
  'boolean': 'Yes/No',
  'bool': 'Yes/No',
  
  // Date & Time
  'date': 'Date',
  'datetime': 'Date & Time',
  'time': 'Time',
  'timestamp': 'Date & Time',
  
  // Contact info
  'phone': 'Phone',
  'phone_number': 'Phone',
  'phonenumber': 'Phone',
  'email': 'Email',
  'url': 'Link',
  'link': 'Link',
  
  // Collections
  'array': 'List',
  'list': 'List',
  'object': 'Record',
  'record': 'Record',
  'json': 'Data',
  
  // Files
  'file': 'File',
  'image': 'Image',
  'attachment': 'Attachment',
  
  // Currency
  'currency': 'Currency',
  'money': 'Currency',
  
  // Other
  'any': 'Any',
  'unknown': 'Unknown',
  'null': 'Empty',
  'undefined': 'Empty',
};

/**
 * Converts a technical type name to a marketing-friendly label
 * @param {string|any} type - The technical type name
 * @returns {string} - User-friendly label
 */
export const getFriendlyTypeLabel = (type) => {
  // Handle null, undefined, or non-string types safely
  if (!type) return 'Any';
  if (typeof type !== 'string') {
    // Handle arrays or objects gracefully
    if (Array.isArray(type)) return 'List';
    if (typeof type === 'object') return 'Record';
    return 'Any';
  }
  
  const normalizedType = type.toLowerCase().trim();
  
  // Check for exact match first
  if (TYPE_LABEL_MAP[normalizedType]) {
    return TYPE_LABEL_MAP[normalizedType];
  }
  
  // Check for partial matches (e.g., "string[]" should be "List of Text")
  if (normalizedType.endsWith('[]') || normalizedType.startsWith('array<')) {
    const innerType = normalizedType.replace('[]', '').replace('array<', '').replace('>', '');
    const innerLabel = TYPE_LABEL_MAP[innerType] || capitalizeFirst(innerType);
    return `List of ${innerLabel}`;
  }
  
  // Check for common patterns
  if (normalizedType.includes('phone')) return 'Phone';
  if (normalizedType.includes('email')) return 'Email';
  if (normalizedType.includes('date')) return 'Date';
  if (normalizedType.includes('time') && !normalizedType.includes('date')) return 'Time';
  if (normalizedType.includes('url') || normalizedType.includes('link')) return 'Link';
  if (normalizedType.includes('number') || normalizedType.includes('amount')) return 'Number';
  if (normalizedType.includes('currency') || normalizedType.includes('price')) return 'Currency';
  
  // Default: capitalize the first letter
  return capitalizeFirst(type);
};

/**
 * Helper to capitalize first letter
 */
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default getFriendlyTypeLabel;
