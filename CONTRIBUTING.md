# Contributing to YT Focus

First off, thank you for considering contributing to **YT Focus**! It's people like you that make open-source tools awesome for students and learners worldwide.

---

## 🛠️ Development Setup

No build steps, compilers, or heavy toolchains are required. YT Focus is built with pure vanilla JavaScript, HTML, and CSS.

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/Yashbarod/yt-focus.git
   cd yt-focus
   ```

2. **Load into your Chromium browser:**
   - Go to `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load unpacked** and select the cloned folder.

3. **Make your changes:**
   - Edit [`content.js`](content.js) for DOM manipulation and filtering logic.
   - Edit [`popup.html`](popup.html) / [`popup.js`](popup.js) for the popup interface.
   - Click the **↻ (Reload)** icon on `chrome://extensions/` to test your changes.

---

## 📋 Pull Request Process

1. Create a descriptive branch name:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. Ensure your changes follow clean, standard JavaScript practices.
3. Verify that changes do not introduce performance regressions or memory leaks on YouTube.
4. Update [`README.md`](README.md) if you are adding new features or modifying user controls.
5. Push to your fork and submit a Pull Request with a clear summary of what was changed and why.

---

## 🐞 Reporting Bugs

Please open an issue on GitHub with:
- A clear description of the bug.
- Your browser name and version (e.g. Brave 1.70, Chrome 130).
- The YouTube URL where the bug occurred.
- Screenshots or console errors (if any).

Thank you for helping keep study sessions distraction-free!
