# 🎯 YT Focus — Distraction-Free Study & Feed Filter

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Compatible with](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Brave%20%7C%20Edge%20%7C%20Arc-orange.svg)](#installation)

**YT Focus** is a lightweight, high-performance browser extension designed for students and self-learners (Chartered Accountancy, UPSC, Software Engineering, and competitive exam aspirants). 

It transforms YouTube from an addictive algorithmic rabbit hole into a distraction-free educational workstation by filtering out irrelevant feeds, eliminating Shorts, and keeping your watch page focused solely on the lecture.

---

## ✨ Features

- **🎯 Intelligent Keyword Filtering (Whitelist & Blacklist):**
  - **✓ Whitelist Mode:** Only displays videos matching your study curriculum (e.g., *Accounts, Tax, GST, Audit, Law*). Everything else is hidden.
  - **✕ Blacklist Mode:** Browses normally while filtering out clickbait or distracting topics (*Gaming, Pranks, Vlogs, Reactions*).
  - **Word-Boundary Regex Engine:** Acronyms like `CA`, `AI`, or `TAX` won't trigger false positives on words like *podcast*, *broadcast*, *syntax*, or *mail*.
- **⚡ Complete YouTube Shorts Blocker & Auto-Redirect:**
  - Hides all Shorts shelves, carousel feeds, and navigation links.
  - Automatically redirects any opened `/shorts/<id>` link to the standard player (`/watch?v=<id>`), letting you view reference clips without falling into infinite reel loops.
- **🎬 Watch Page Lecture Mode:**
  - **Hide All Recommendations:** Strips away the recommendations grid beneath or beside the player so your attention remains 100% on the active lecture.
  - **Hide Comments:** Eliminates distracting comment sections below videos.
- **📚 Built-In Exam & Study Presets:**
  - **CA / Commerce:** `CA`, `ICAI`, `CA Inter`, `CA Final`, `Tax`, `GST`, `Accounts`, `Audit`, `Costing`, `FM`
  - **UPSC / Civil Services:** `UPSC`, `IAS`, `Current Affairs`, `Polity`, `Geography`, `Economy`, `History`, `The Hindu`
  - **Coding / Tech:** `Python`, `JavaScript`, `TypeScript`, `React`, `DSA`, `LeetCode`, `System Design`, `AI`
  - **Custom:** Add your own custom subjects with comma-separated batch input.
- **🚀 2024–2026 YouTube UI Compatibility:**
  - Fully compatible with YouTube's Lit/Polymer design system, including `<yt-lockup-view-model>` components and virtual scrolling.
  - Non-destructive DOM hiding ensures YouTube’s polymer scroller never crashes or produces blank layout bugs.
- **🔄 Multi-Tab Instant Auto-Sync:**
  - Built with `chrome.storage.onChanged`. Any setting updated in the popup updates across all open YouTube tabs simultaneously with zero idle CPU overhead.

---

## 🛠️ Installation

Because YT Focus is open-source and respects your privacy, you can install it directly in developer mode on any Chromium-based browser (**Chrome, Brave, Edge, Arc, Opera, Vivaldi**):

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/Yashbarod/yt-focus.git
   ```
   *(or download as a `.zip` file from GitHub and extract it)*.

2. **Open Extensions Page:**
   - Chrome / Brave / Arc: Navigate to `chrome://extensions/` or `brave://extensions/`
   - Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode:**
   - Toggle the **Developer mode** switch in the top-right corner.

4. **Load the Extension:**
   - Click **Load unpacked** in the top-left toolbar.
   - Select the folder containing `manifest.json`.

5. **Pin to Toolbar:**
   - Click the puzzle icon in your browser toolbar and pin **YT Focus** for quick access.

---

## 📁 Project Structure

```text
yt-focus/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js     # Background service worker (defaults & migration)
├── content.js        # Core DOM filter, regex matcher, and mutation observer
├── manifest.json     # Chrome Extension Manifest V3 configuration
├── popup.html        # Clean dark-mode popup dashboard
├── popup.js          # Settings controller & preset manager
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE           # MIT License
└── README.md
```

---

## 🔬 How It Works (Technical Highlights)

- **Manifest V3 Compliant:** Uses lightweight service workers and non-persistent event listeners.
- **Dynamic CSS Rule Injection:** Rather than removing elements with `.remove()` (which breaks YouTube's Polymer virtual scroller), YT Focus injects dynamic CSS rules targeting element data attributes (`[data-ytfocus="hide"]`), allowing smooth reflows.
- **Debounced RAF Engine:** Stamping is synchronized to browser repaints using `requestAnimationFrame`, preventing main-thread lag when infinite-scrolling through hundreds of videos.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! 
Check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

Made with ❤️ by [Yashbarod](https://github.com/Yashbarod) for focused students everywhere.
