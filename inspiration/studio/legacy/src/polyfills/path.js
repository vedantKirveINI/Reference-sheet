// Browser polyfill for Node.js 'path' module
// Provides minimal implementation needed by mime-types

export const extname = (filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  
  const lastDot = filePath.lastIndexOf('.');
  const lastSlash = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\')
  );
  
  if (lastDot === -1 || lastDot < lastSlash) {
    return '';
  }
  
  return filePath.slice(lastDot);
};

export default {
  extname,
};


