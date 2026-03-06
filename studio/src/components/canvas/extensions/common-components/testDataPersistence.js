const STORAGE_PREFIX = "ctm_test_";
const MAX_STORED_NODES = 50;
const STORAGE_VERSION = 1;

const getStorageKey = (nodeKey) => `${STORAGE_PREFIX}${nodeKey}`;
const getIndexKey = () => `${STORAGE_PREFIX}index`;

const getStorageIndex = () => {
  try {
    const indexStr = localStorage.getItem(getIndexKey());
    if (indexStr) {
      return JSON.parse(indexStr);
    }
  } catch (e) {
  }
  return { version: STORAGE_VERSION, nodes: [], lastCleanup: Date.now() };
};

const saveStorageIndex = (index) => {
  try {
    localStorage.setItem(getIndexKey(), JSON.stringify(index));
  } catch (e) {
  }
};

const cleanupOldEntries = () => {
  const index = getStorageIndex();
  
  if (index.nodes.length <= MAX_STORED_NODES) return;

  const sortedNodes = [...index.nodes].sort((a, b) => a.lastUsed - b.lastUsed);
  const nodesToRemove = sortedNodes.slice(0, index.nodes.length - MAX_STORED_NODES);

  nodesToRemove.forEach((node) => {
    try {
      localStorage.removeItem(getStorageKey(node.key));
    } catch (e) {
    }
  });

  index.nodes = sortedNodes.slice(index.nodes.length - MAX_STORED_NODES);
  index.lastCleanup = Date.now();
  saveStorageIndex(index);
};

export const saveTestData = (nodeKey, data) => {
  if (!nodeKey || !data) return false;

  try {
    const storageKey = getStorageKey(nodeKey);
    const entry = {
      version: STORAGE_VERSION,
      nodeKey,
      data,
      savedAt: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(entry));

    const index = getStorageIndex();
    const existingIndex = index.nodes.findIndex((n) => n.key === nodeKey);
    
    if (existingIndex >= 0) {
      index.nodes[existingIndex].lastUsed = Date.now();
    } else {
      index.nodes.push({ key: nodeKey, lastUsed: Date.now() });
    }
    
    saveStorageIndex(index);

    if (index.nodes.length > MAX_STORED_NODES) {
      cleanupOldEntries();
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const loadTestData = (nodeKey) => {
  if (!nodeKey) return null;

  try {
    const storageKey = getStorageKey(nodeKey);
    const entryStr = localStorage.getItem(storageKey);
    
    if (!entryStr) return null;

    const entry = JSON.parse(entryStr);

    if (entry.version !== STORAGE_VERSION) {
      localStorage.removeItem(storageKey);
      return null;
    }

    const index = getStorageIndex();
    const existingIndex = index.nodes.findIndex((n) => n.key === nodeKey);
    if (existingIndex >= 0) {
      index.nodes[existingIndex].lastUsed = Date.now();
      saveStorageIndex(index);
    }

    return entry.data;
  } catch (e) {
    return null;
  }
};

export const clearTestData = (nodeKey) => {
  if (!nodeKey) return false;

  try {
    const storageKey = getStorageKey(nodeKey);
    localStorage.removeItem(storageKey);

    const index = getStorageIndex();
    index.nodes = index.nodes.filter((n) => n.key !== nodeKey);
    saveStorageIndex(index);

    return true;
  } catch (e) {
    return false;
  }
};

export const clearAllTestData = () => {
  try {
    const index = getStorageIndex();
    
    index.nodes.forEach((node) => {
      try {
        localStorage.removeItem(getStorageKey(node.key));
      } catch (e) {
      }
    });

    localStorage.removeItem(getIndexKey());
    return true;
  } catch (e) {
    return false;
  }
};

export const hasStoredTestData = (nodeKey) => {
  if (!nodeKey) return false;

  try {
    const storageKey = getStorageKey(nodeKey);
    return localStorage.getItem(storageKey) !== null;
  } catch (e) {
    return false;
  }
};

export const getStorageStats = () => {
  try {
    const index = getStorageIndex();
    return {
      nodeCount: index.nodes.length,
      maxNodes: MAX_STORED_NODES,
      lastCleanup: index.lastCleanup,
    };
  } catch (e) {
    return null;
  }
};

export default {
  saveTestData,
  loadTestData,
  clearTestData,
  clearAllTestData,
  hasStoredTestData,
  getStorageStats,
};
