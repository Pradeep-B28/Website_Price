// Safe browser storage and share link hash handling
import { encodePick, decodePick, emptyPick } from "./engine/pricing.js";

const KEY_THEME = "wpt-theme";
const KEY_PICK = "wpt-pick";
const KEY_INTRO = "wpt-intro-seen";

export function getTheme() {
  try {
    return localStorage.getItem(KEY_THEME) || "light";
  } catch (err) {
    return "light";
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY_THEME, theme);
  } catch (err) {
    // Graceful fallback when storage is disabled
  }
}

export function getIntroSeen() {
  try {
    return sessionStorage.getItem(KEY_INTRO) === "1";
  } catch (err) {
    return false;
  }
}

export function setIntroSeen() {
  try {
    sessionStorage.setItem(KEY_INTRO, "1");
  } catch (err) {
    // Graceful fallback
  }
}

export function savePick(pick) {
  try {
    if (!pick) {
      localStorage.removeItem(KEY_PICK);
      return;
    }
    const encoded = encodePick(pick);
    localStorage.setItem(KEY_PICK, encoded);
  } catch (err) {
    // Graceful fallback
  }
}

export function clearPick() {
  try {
    localStorage.removeItem(KEY_PICK);
  } catch (err) {
    // Graceful fallback
  }
}

export function getSavedPick() {
  try {
    const raw = localStorage.getItem(KEY_PICK);
    if (!raw) return null;
    return decodePick(raw);
  } catch (err) {
    return null;
  }
}

export function getHashPick() {
  try {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return null;
    const decoded = decodePick(hash);
    if (decoded && decoded.type) {
      // Clear the hash without reloading
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function loadInitialState() {
  // 1. Share hash first
  const hashPick = getHashPick();
  if (hashPick) {
    return { pick: hashPick, fromHash: true };
  }

  // 2. Saved pick second
  const saved = getSavedPick();
  if (saved && saved.type) {
    return { pick: saved, fromHash: false };
  }

  // 3. Fresh pick
  return { pick: emptyPick(), fromHash: false };
}
