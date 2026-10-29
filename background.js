// YT Focus — Background Service Worker v2.0
// Initializes default settings and handles version upgrades

const DEFAULT_SETTINGS = {
  enabled: true,
  filterType: "allowlist", // "allowlist" | "blocklist"
  matchMode: "any",        // "any" | "all"
  preset: "ca",            // "ca" | "upsc" | "tech" | "custom"
  keywords: ["CA", "ICAI", "CA Inter", "CA Final", "CA Foundation", "Tax", "GST", "Accounts", "Audit", "Costing", "FM"],
  blockShorts: true,
  redirectShorts: true,    // Converts /shorts/<id> to standard /watch?v=<id> without infinite reels
  hideComments: false,
  hideRelated: false       // Hides watch page recommendations sidebar
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get(["ytfocus"], (result) => {
    if (!result.ytfocus) {
      chrome.storage.sync.set({ ytfocus: DEFAULT_SETTINGS });
    } else {
      // Migrate / merge in any new keys that might not exist in older versions
      const merged = { ...DEFAULT_SETTINGS, ...result.ytfocus };
      chrome.storage.sync.set({ ytfocus: merged });
    }
  });
});
