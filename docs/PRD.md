# Webpage Text Extractor Documentation

## Purpose

The **Webpage Text Extractor** is a Chrome Extension designed to simplify the process of extracting textual content from web pages. It provides a visual interface for users to select specific DOM elements, navigate the document hierarchy, and export the content directly as a `.txt` file. This is particularly useful for developers, data researchers, or anyone needing to quickly grab clean text from complex layouts.

## Key Features

- **Visual Metadata & Feedback**: Displays the HTML tag name and character count. Includes a "pulse" animation when navigating between elements.
- **Hierarchy Navigation**: Use `ArrowUp` to select the parent element and `ArrowDown` to drill back down.
- **Flexible Export**: Options to either download the selected text as a file or copy it directly to the clipboard.
- **Keyboard Shortcuts**: Activate extraction mode using configurable Chrome shortcuts or `Alt+Shift+X` (default).
- **Clean Interface**: Toggle simple on/off states and settings via the extension popup.

## File Structure

- `manifest.json`: Configuration for permissions (`downloads`, `storage`, `clipboardWrite`) and keyboard commands.
- `popup.html` / `popup.js`: UI for toggling the extension and choosing the extraction action (Copy vs. Download).
- `content.js`: Core interaction logic, overlay management, and event listeners for mouse/keyboard.
- `content.css`: Styling for the selection overlay, animations (pulse), and informative labels.
- `service_worker.js`: Background script for handling download requests.

---

## Code Reference (Function Roles)

### `content.js`

- `updateOverlay(el)`: Updates position/size and populates the label with the tag name and character count.
- `handleKeyDown(e)`: Handles `ArrowUp`/`ArrowDown` for navigation, `Escape` to close, and triggers visual feedback.
- `triggerPulse()`: Executed during keyboard navigation to provide a visual flash confirming a change in focus.
- `handleClick(e)`: Executes the selected action (Copy or Download) on the focused element's text.
- `toggleActive(state)`: Monitors the active state and sets up/tears down event listeners.

### `popup.js`

- `chrome.storage.local`: Persists the user's preference for "Click Action" (Copy vs. Download) and the enabled state.

---

## Changelog

### Version 1.1 (Dec 22, 2025)

- **feat**: Added "Copy to Clipboard" option in popup settings.
- **feat**: Enhanced overlay with HTML tag name display and pulse animation for better hierarchy navigation feedback.
- **feat**: Implemented keyboard shortcuts for quick activation.
- **fix**: Fixed focus persistence issues when activating from the popup.
- **fix**: Resolved bugs with arrow key navigation and element detection accuracy.
- **fix**: Ensured overlay is properly cleaned up across multiple tabs on deactivation.

## Installation & Development

1. Load the root directory via `chrome://extensions/` using the **Load unpacked** button in Developer Mode.
2. Ensure you have the following permissions enabled in Chrome: `downloads`, `storage`, and `activeTab`.
