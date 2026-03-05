import { useState, useEffect, useCallback, useRef } from "react";
import localforage from "localforage";

const DRAFT_STORE_NAME = "workflow-drafts";
const BROADCAST_CHANNEL_NAME = "draft-sync";

const draftStore = localforage.createInstance({
  name: DRAFT_STORE_NAME,
  storeName: "drafts",
});

export function useDraftStore(assetId) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      
      channelRef.current.onmessage = (event) => {
        if (event.data.type === "DRAFT_UPDATED" && event.data.assetId === assetId) {
          loadDraft();
        }
        if (event.data.type === "DRAFT_DELETED" && event.data.assetId === assetId) {
          setDraft(null);
        }
      };
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [assetId]);

  const loadDraft = useCallback(async () => {
    if (!assetId) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const storedDraft = await draftStore.getItem(assetId);
      setDraft(storedDraft);
      setError(null);
      return storedDraft;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const saveDraft = useCallback(async (canvasState) => {
    if (!assetId) return;

    try {
      const draftData = {
        assetId,
        canvasState,
        nodeCount: canvasState?.nodes?.length || 0,
        updatedAt: Date.now(),
        changeHash: generateChangeHash(canvasState),
      };

      await draftStore.setItem(assetId, draftData);
      setDraft(draftData);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "DRAFT_UPDATED",
          assetId,
        });
      }

      return draftData;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [assetId]);

  const deleteDraft = useCallback(async () => {
    if (!assetId) return;

    try {
      await draftStore.removeItem(assetId);
      setDraft(null);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "DRAFT_DELETED",
          assetId,
        });
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [assetId]);

  const hasDraft = useCallback(() => {
    return draft !== null && draft.canvasState !== null;
  }, [draft]);

  return {
    draft,
    loading,
    error,
    saveDraft,
    deleteDraft,
    loadDraft,
    hasDraft,
  };
}

function generateChangeHash(canvasState) {
  if (!canvasState) return null;
  const str = JSON.stringify({
    nodeCount: canvasState?.nodes?.length || 0,
    nodeIds: canvasState?.nodes?.map(n => n.id).sort() || [],
  });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export default useDraftStore;
