// YT Focus — Content Script v2.1
// Full support for Modern YouTube (yt-lockup-view-model, watch page grids, and SPA lazy loading)

let settings = {
  enabled: true,
  filterType: "allowlist", // "allowlist" | "blocklist"
  matchMode: "any",        // "any" | "all"
  preset: "ca",
  keywords: [],
  blockShorts: true,
  redirectShorts: true,
  hideComments: false,
  hideRelated: false
};

let compiledRegexes = [];

// ── Supported Card Tag Types (including YouTube 2024–2026 Lockup architecture) ─
const CARD_TAGS = [
  "yt-lockup-view-model",
  "ytd-rich-item-renderer",
  "ytd-compact-video-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-playlist-renderer",
  "ytd-radio-renderer",
  "ytd-compact-radio-renderer",
  "ytd-compact-playlist-renderer"
];

const CARD_SEL = CARD_TAGS.join(",");
const UNSTAMPED_SEL = CARD_TAGS.map(t => `${t}:not([data-ytfocus])`).join(",");

// ── Regex Helpers ─────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildKeywordRegex(keyword) {
  const kw = (keyword || "").trim();
  if (!kw) return null;
  const escaped = escapeRegex(kw);
  // Word boundaries for letters/digits so "CA" doesn't match "podcast" or "broadcast"
  const prefix = /^\w/.test(kw) ? "\\b" : "";
  const suffix = /\w$/.test(kw) ? "\\b" : "";
  try {
    return new RegExp(`${prefix}${escaped}${suffix}`, "i");
  } catch (e) {
    return new RegExp(escaped, "i");
  }
}

function updateRegexes() {
  compiledRegexes = (settings.keywords || [])
    .map(buildKeywordRegex)
    .filter(Boolean);
}

// ── Dynamic Styles Injection ──────────────────────────────────────────────────
let styleEl = document.getElementById("ytfocus-styles");
if (!styleEl) {
  styleEl = document.createElement("style");
  styleEl.id = "ytfocus-styles";
  (document.head || document.documentElement).appendChild(styleEl);
}

function updateStyles() {
  const rules = [];

  // 1. Shorts blocking
  if (settings.blockShorts) {
    rules.push(`
      ytd-reel-shelf-renderer,
      ytd-reel-item-renderer,
      ytd-rich-section-renderer:has(ytd-reel-shelf-renderer),
      ytd-guide-entry-renderer[ytfocus-shorts],
      ytd-mini-guide-entry-renderer[aria-label="Shorts"],
      ytd-mini-guide-entry-renderer:has([title="Shorts"]),
      a[title="Shorts"],
      ytd-notification-renderer:has(a[href*="/shorts/"]) {
        display: none !important;
      }
    `);
  }

  // 2. Hide comments on watch page
  if (settings.hideComments) {
    rules.push(`
      #comments,
      ytd-comments,
      ytd-item-section-renderer[section-identifier="comment-item-section"] {
        display: none !important;
      }
    `);
  }

  // 3. Hide watch page related / sidebar / below-player recommendations completely
  if (settings.hideRelated) {
    rules.push(`
      #secondary,
      #related,
      ytd-watch-next-secondary-results-renderer,
      ytd-watch-flexy #related,
      ytd-watch-flexy #secondary,
      ytd-watch-flexy ytd-watch-next-secondary-results-renderer,
      #below ytd-watch-next-secondary-results-renderer {
        display: none !important;
      }
    `);
  }

  // 4. Video card filtering (Hides non-matching cards and collapses grid items)
  if (settings.enabled && settings.keywords.length > 0) {
    rules.push(`
      yt-lockup-view-model[data-ytfocus="hide"],
      ytd-rich-item-renderer[data-ytfocus="hide"],
      ytd-rich-item-renderer:has(yt-lockup-view-model[data-ytfocus="hide"]),
      ytd-compact-video-renderer[data-ytfocus="hide"],
      ytd-video-renderer[data-ytfocus="hide"],
      ytd-grid-video-renderer[data-ytfocus="hide"],
      ytd-playlist-renderer[data-ytfocus="hide"],
      ytd-radio-renderer[data-ytfocus="hide"],
      ytd-compact-radio-renderer[data-ytfocus="hide"],
      ytd-compact-playlist-renderer[data-ytfocus="hide"] {
        display: none !important;
      }
    `);
  }

  styleEl.textContent = rules.join("\n");
}

// ── Text Extraction Helpers ───────────────────────────────────────────────────
function getTitle(card) {
  // Check heading / title-specific elements first to avoid "New" or duration badges
  const selectors = [
    "h3 a",
    "h3",
    "#video-title",
    "yt-formatted-string#video-title",
    "span#video-title",
    "a#video-title",
    ".yt-lockup-metadata-view-model__title",
    "[role='heading'] a",
    "[role='heading']",
    "a[href*='/watch'][title]"
  ];

  for (const sel of selectors) {
    const el = card.querySelector(sel);
    if (!el) continue;
    const t = (el.getAttribute("title") || el.getAttribute("aria-label") || el.textContent || "").trim();
    if (t) return t;
  }
  return "";
}

function getChannel(card) {
  const selectors = [
    "#channel-name a",
    "#channel-name yt-formatted-string",
    "ytd-channel-name a",
    "ytd-channel-name yt-formatted-string",
    "yt-formatted-string#byline-text",
    "#byline-text",
    ".yt-lockup-metadata-view-model__metadata-row a",
    ".yt-lockup-metadata-view-model__metadata-row",
    "yt-content-metadata-view-model a",
    "yt-content-metadata-view-model",
    "a[href*='/@']",
    "a[href*='/channel/']"
  ];

  for (const sel of selectors) {
    const el = card.querySelector(sel);
    if (!el) continue;
    const t = (el.getAttribute("title") || el.textContent || "").trim();
    if (t) return t;
  }
  return "";
}

// ── Decision Engine ───────────────────────────────────────────────────────────
function shouldShowCard(title, channel) {
  if (!settings.enabled) return true;
  if (!compiledRegexes.length) return true;

  const combined = `${title} ${channel}`;
  const isMatch = settings.matchMode === "all"
    ? compiledRegexes.every(re => re.test(combined))
    : compiledRegexes.some(re => re.test(combined));

  if (settings.filterType === "blocklist") {
    return !isMatch; // Hide if matches blocked keywords
  } else {
    return isMatch;  // Show if matches allowed keywords
  }
}

// ── Card Stamping ─────────────────────────────────────────────────────────────
function stampCard(card, force = false) {
  if (!force && card.dataset.ytfocus) return;

  const title = getTitle(card);
  if (!title) return; // Wait until title hydrates

  const channel = getChannel(card);
  const show = shouldShowCard(title, channel);
  card.dataset.ytfocus = show ? "show" : "hide";

  // Propagate to parent grid container so the grid layout reflows seamlessly
  const parentRichItem = card.closest("ytd-rich-item-renderer");
  if (parentRichItem && parentRichItem !== card) {
    parentRichItem.dataset.ytfocus = show ? "show" : "hide";
  }
}

function stampAll(force = false) {
  const cards = document.querySelectorAll(CARD_SEL);
  for (let i = 0; i < cards.length; i++) {
    stampCard(cards[i], force);
  }

  // Handle Shorts elements and sidebar items
  if (settings.blockShorts) {
    document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer").forEach(el => {
      const text = (el.textContent || el.getAttribute("aria-label") || "").toLowerCase();
      if (text.includes("shorts")) {
        el.setAttribute("ytfocus-shorts", "");
      }
    });

    // Hide rich section shelf headers when shorts are blocked
    document.querySelectorAll("ytd-reel-shelf-renderer").forEach(shelf => {
      const parentSection = shelf.closest("ytd-rich-section-renderer");
      if (parentSection) parentSection.style.display = "none";
    });
  }
}

// ── Shorts Interception & Redirection ─────────────────────────────────────────
function checkShortsRedirect() {
  if (!settings.blockShorts) return;
  const path = window.location.pathname;
  if (path.startsWith("/shorts/")) {
    const parts = path.split("/shorts/");
    const shortId = parts[1]?.split(/[?&#/]/)[0];
    if (shortId && settings.redirectShorts) {
      window.location.replace(`https://www.youtube.com/watch?v=${shortId}`);
    } else {
      window.location.replace("https://www.youtube.com/");
    }
  }
}

// ── Performance-Optimized Mutation Handling ───────────────────────────────────
let isScheduled = false;
function scheduleStamp() {
  if (isScheduled) return;
  isScheduled = true;
  requestAnimationFrame(() => {
    isScheduled = false;
    stampAll(false);
  });
}

const observer = new MutationObserver(mutations => {
  let needsStamp = false;
  for (let i = 0; i < mutations.length; i++) {
    const added = mutations[i].addedNodes;
    for (let j = 0; j < added.length; j++) {
      const node = added[j];
      if (node.nodeType === 1) { // ELEMENT_NODE
        needsStamp = true;
        break;
      }
    }
    if (needsStamp) break;
  }
  if (needsStamp) {
    scheduleStamp();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

// Fast O(1) scanner for cards that lazy-hydrate after DOM insertion
function scanUnstamped() {
  if (!settings.enabled) return;
  if (document.querySelector(UNSTAMPED_SEL)) {
    scheduleStamp();
  }
}
setInterval(scanUnstamped, 600);

// ── SPA Navigation Listener ───────────────────────────────────────────────────
document.addEventListener("yt-navigate-finish", () => {
  checkShortsRedirect();
  stampAll(true);
  // Staggered passes to catch lazy-loaded watch-next recommendation payloads
  setTimeout(() => stampAll(true), 400);
  setTimeout(() => stampAll(true), 1200);
  setTimeout(() => stampAll(true), 2500);
});

// Check immediately on script injection
checkShortsRedirect();

// ── Multi-Tab Auto-Sync via Storage ───────────────────────────────────────────
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.ytfocus) {
    settings = { ...settings, ...changes.ytfocus.newValue };
    updateRegexes();
    updateStyles();
    stampAll(true);
    checkShortsRedirect();
  }
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "SETTINGS_UPDATED") {
    settings = { ...settings, ...msg.settings };
    updateRegexes();
    updateStyles();
    stampAll(true);
    checkShortsRedirect();
  }
});

// ── Initialization ────────────────────────────────────────────────────────────
chrome.storage.sync.get(["ytfocus"], result => {
  if (result.ytfocus) {
    settings = { ...settings, ...result.ytfocus };
  }
  updateRegexes();
  updateStyles();
  stampAll(true);
});
