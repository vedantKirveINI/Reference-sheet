// Mock for react-dom/server to prevent browser errors when ag-grid-react tries to import it
// This is a browser-only mock - server-side rendering utilities are not needed in the browser

export const renderToStaticMarkup = () => {
  return '';
};

export const renderToString = () => {
  return '';
};

export default {
  renderToStaticMarkup,
  renderToString,
};

