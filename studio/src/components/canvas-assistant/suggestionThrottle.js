const SESSION_KEY = "ic_suggest_session";
const MUTED_KEY_PREFIX = "ic_suggest_muted_";

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { shown: 0, dismissed: 0, lastShownAt: 0 };
}

function setSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function recordSuggestionShown() {
  const s = getSession();
  s.shown += 1;
  s.lastShownAt = Date.now();
  setSession(s);
}

export function recordSuggestionDismissed() {
  const s = getSession();
  s.dismissed += 1;
  setSession(s);
}

export function isMutedForAsset(assetId) {
  if (!assetId) return false;
  try {
    return localStorage.getItem(MUTED_KEY_PREFIX + assetId) === "1";
  } catch {
    return false;
  }
}

export function muteForAsset(assetId) {
  if (!assetId) return;
  try {
    localStorage.setItem(MUTED_KEY_PREFIX + assetId, "1");
  } catch {}
}

export function unmuteForAsset(assetId) {
  if (!assetId) return;
  try {
    localStorage.removeItem(MUTED_KEY_PREFIX + assetId);
  } catch {}
}

export function canShowSuggestion(assetId) {
  if (isMutedForAsset(assetId)) return false;
  return true;
}

export function resetSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
