export const isFlat = (obj) => {
  if (typeof obj !== 'object' || obj === null) return true;
  if (Array.isArray(obj)) return false;
  return Object.values(obj).every(
    val => val === null || val === undefined || ['string', 'number', 'boolean'].includes(typeof val)
  );
};

export const isArrayOfFlatObjects = (data) => {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(item => typeof item === 'object' && item !== null && isFlat(item));
};

export const getDisplayMode = (data) => {
  if (data === null || data === undefined) return 'empty';
  
  if (Array.isArray(data)) {
    if (data.length === 0) return 'empty';
    if (isArrayOfFlatObjects(data)) return 'table';
    return 'tree';
  }
  
  if (typeof data === 'object') {
    if (isFlat(data)) return 'keyvalue';
    return 'tree';
  }
  
  return 'primitive';
};

export const humanizeKey = (key) => {
  if (!key || typeof key !== 'string') return key;
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getTypeLabel = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `Array [${value.length}]`;
  if (typeof value === 'object') return `Object {${Object.keys(value).length}}`;
  return typeof value;
};

export const getTypeColor = (value) => {
  if (value === null || value === undefined) return 'text-muted-foreground';
  if (typeof value === 'string') return 'text-green-600 dark:text-green-400';
  if (typeof value === 'number') return 'text-blue-600 dark:text-blue-400';
  if (typeof value === 'boolean') return 'text-purple-600 dark:text-purple-400';
  if (Array.isArray(value)) return 'text-orange-600 dark:text-orange-400';
  if (typeof value === 'object') return 'text-cyan-600 dark:text-cyan-400';
  return 'text-foreground';
};

/** Check if value is array of non-null objects (any structure) */
export const isArrayOfObjects = (value) => {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((item) => item !== null && typeof item === 'object');
};
