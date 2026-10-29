// YT Focus — Popup Script v2.0

const PRESETS = {
  ca: {
    keywords: ["CA", "ICAI", "CA Inter", "CA Final", "CA Foundation", "Tax", "GST", "Accounts", "Audit", "Costing", "FM"]
  },
  upsc: {
    keywords: ["UPSC", "IAS", "Current Affairs", "Polity", "Geography", "Economy", "History", "The Hindu"]
  },
  tech: {
    keywords: ["Python", "JavaScript", "TypeScript", "React", "DSA", "LeetCode", "System Design", "Backend", "AI"]
  },
  custom: {
    keywords: []
  }
};

let keywords = [];
let matchMode = "any";
let filterType = "allowlist";
let currentPreset = "ca";

// ── DOM References ────────────────────────────────────────────────────────────
const kwIn           = document.getElementById("kwIn");
const addBtn         = document.getElementById("addBtn");
const pillsWrap      = document.getElementById("pillsWrap");
const emptyMsg       = document.getElementById("emptyMsg");
const kwCount        = document.getElementById("kwCount");
const kwHeading      = document.getElementById("kwHeading");
const masterTog      = document.getElementById("masterTog");
const blockShorts    = document.getElementById("blockShorts");
const redirectShorts = document.getElementById("redirectShorts");
const hideComments   = document.getElementById("hideComments");
const hideRelated    = document.getElementById("hideRelated");
const saveBtn        = document.getElementById("saveBtn");
const resetBtn       = document.getElementById("resetBtn");
const dot            = document.getElementById("dot");
const toast          = document.getElementById("toast");
const mAny           = document.getElementById("mAny");
const mAll           = document.getElementById("mAll");
const modeAllow      = document.getElementById("modeAllow");
const modeBlock      = document.getElementById("modeBlock");
const presetButtons  = document.querySelectorAll(".preset-btn");

// ── Load Settings ─────────────────────────────────────────────────────────────
chrome.storage.sync.get(["ytfocus"], (result) => {
  const s = result.ytfocus || {};
  keywords       = Array.isArray(s.keywords) ? [...s.keywords] : [...PRESETS.ca.keywords];
  matchMode      = s.matchMode || "any";
  filterType     = s.filterType || "allowlist";
  currentPreset  = s.preset || "ca";

  masterTog.checked      = s.enabled !== false;
  blockShorts.checked    = s.blockShorts !== false;
  redirectShorts.checked = s.redirectShorts !== false;
  hideComments.checked   = Boolean(s.hideComments);
  hideRelated.checked    = Boolean(s.hideRelated);

  renderPresets();
  renderFilterMode();
  renderPills();
  renderMatchMode();
  updateDot();
});

// ── Presets Handler ───────────────────────────────────────────────────────────
function renderPresets() {
  presetButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.preset === currentPreset);
  });
}

presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const p = btn.dataset.preset;
    currentPreset = p;
    renderPresets();

    if (p !== "custom" && PRESETS[p]) {
      keywords = [...PRESETS[p].keywords];
      renderPills();
    }
  });
});

// ── Filter Mode (Allowlist vs Blocklist) ───────────────────────────────────────
function renderFilterMode() {
  const isAllow = filterType === "allowlist";
  modeAllow.classList.toggle("active", isAllow);
  modeAllow.classList.toggle("allow", isAllow);
  modeBlock.classList.toggle("active", !isAllow);
  modeBlock.classList.toggle("block", !isAllow);

  kwHeading.textContent = isAllow ? "Allowed Keywords" : "Blocked Keywords";
  emptyMsg.textContent = isAllow
    ? "No keywords — all videos shown"
    : "No keywords — no videos blocked";
}

modeAllow.addEventListener("click", () => {
  filterType = "allowlist";
  renderFilterMode();
});

modeBlock.addEventListener("click", () => {
  filterType = "blocklist";
  renderFilterMode();
});

// ── Pills Rendering ───────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderPills() {
  pillsWrap.querySelectorAll(".pill").forEach(p => p.remove());
  emptyMsg.style.display = keywords.length ? "none" : "inline";
  kwCount.textContent = `${keywords.length} tag${keywords.length === 1 ? '' : 's'}`;

  keywords.forEach((kw, i) => {
    const s = document.createElement("span");
    s.className = "pill";
    s.innerHTML = `${escapeHtml(kw)}<button class="pill-x" data-i="${i}" title="Remove">×</button>`;
    pillsWrap.appendChild(s);
  });
}

pillsWrap.addEventListener("click", (e) => {
  if (e.target.classList.contains("pill-x")) {
    const idx = parseInt(e.target.dataset.i, 10);
    if (!isNaN(idx)) {
      keywords.splice(idx, 1);
      currentPreset = "custom";
      renderPresets();
      renderPills();
    }
  }
});

// ── Add Keyword(s) ────────────────────────────────────────────────────────────
function addKeywords() {
  const inputVal = kwIn.value.trim();
  if (!inputVal) return;

  // Split by comma if user enters comma-separated list
  const entries = inputVal.split(",").map(k => k.trim()).filter(Boolean);
  let changed = false;

  entries.forEach(val => {
    // Avoid exact case-insensitive duplicates
    if (!keywords.some(k => k.toLowerCase() === val.toLowerCase())) {
      keywords.push(val);
      changed = true;
    }
  });

  if (changed) {
    currentPreset = "custom";
    renderPresets();
    renderPills();
  }
  kwIn.value = "";
}

addBtn.addEventListener("click", addKeywords);
kwIn.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addKeywords();
});

// ── Match Mode ────────────────────────────────────────────────────────────────
function renderMatchMode() {
  mAny.classList.toggle("active", matchMode === "any");
  mAll.classList.toggle("active", matchMode === "all");
}

mAny.addEventListener("click", () => {
  matchMode = "any";
  renderMatchMode();
});

mAll.addEventListener("click", () => {
  matchMode = "all";
  renderMatchMode();
});

// ── Master Switch Dot ─────────────────────────────────────────────────────────
function updateDot() {
  dot.classList.toggle("off", !masterTog.checked);
}
masterTog.addEventListener("change", updateDot);

// ── Save Settings ─────────────────────────────────────────────────────────────
saveBtn.addEventListener("click", () => {
  const s = {
    enabled:        masterTog.checked,
    filterType:     filterType,
    matchMode:      matchMode,
    preset:         currentPreset,
    keywords:       keywords,
    blockShorts:    blockShorts.checked,
    redirectShorts: redirectShorts.checked,
    hideComments:   hideComments.checked,
    hideRelated:    hideRelated.checked
  };

  chrome.storage.sync.set({ ytfocus: s }, () => {
    // Also message active tab for immediate fallback response
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "SETTINGS_UPDATED", settings: s }).catch(() => {});
      }
    });
    showToast();
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  const presetKey = currentPreset !== "custom" ? currentPreset : "ca";
  const def = PRESETS[presetKey] || PRESETS.ca;

  if (!confirm(`Reset to default ${presetKey.toUpperCase()} study settings?`)) return;

  keywords = [...def.keywords];
  matchMode = "any";
  filterType = "allowlist";
  currentPreset = presetKey;
  masterTog.checked = true;
  blockShorts.checked = true;
  redirectShorts.checked = true;
  hideComments.checked = false;
  hideRelated.checked = false;

  renderPresets();
  renderFilterMode();
  renderPills();
  renderMatchMode();
  updateDot();
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}
