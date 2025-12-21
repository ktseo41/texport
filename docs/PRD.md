# Webpage Text Extractor Documentation

## Purpose

The **Webpage Text Extractor** is a Chrome Extension designed to simplify the process of extracting textual content from web pages. It provides a visual interface for users to select specific DOM elements, navigate the document hierarchy, and export the content directly as a `.txt` file. This is particularly useful for developers, data researchers, or anyone needing to quickly grab clean text from complex layouts.

## Key Features

- **Visual Highlighting**: A transparent blue overlay that identifies the currently focused element.
- **Character Counter**: Real-time display of the character count (including whitespace) for the selected area.
- **Hierarchy Navigation**: Use `ArrowUp` to select the parent element and `ArrowDown` to drill back down to the target leaf element.
- **Direct Export**: One-click download of selected text as a file.
- **Clean Interface**: Toggle simple on/off states via the extension popup.

## File Structure

- `manifest.json`: Extension metadata and permission configuration (Manifest V3).
- `popup.html` / `popup.js`: The user interface and logic for the extension's control menu.
- `content.js`: Core logic running on the webpage to handle mouse events, keyboard navigation, and UI overlays.
- `content.css`: Styles for the visual overlay and character count label.
- `service_worker.js`: Background script handling the asynchronous file download process.

---

## Code Reference (Function Roles)

### `content.js`

The heart of the extension's interaction.

- `createOverlay()`: Initializes and appends the selection overlay and label to the document body.
- `removeOverlay()`: Cleans up the overlay elements when the extension is deactivated.
- `updateOverlay(el)`: Calculates the position and dimensions of the target element `el` and updates the overlay's CSS and character count label.
- `handleMouseMove(e)`: Detects the element under the cursor and updates the `hoveredElement` state.
- `handleKeyDown(e)`: Standardizes keyboard shortcuts:
  - `ArrowUp`: Focuses the parent of the currently selected element.
  - `ArrowDown`: Focuses the child leading back to the original hovered element.
  - `Escape`: Deactivates the extraction mode.
- `handleClick(e)`: Captures the `innerText` of the focused element and sends a `download_text` message to the service worker.
- `toggleActive(state)`: Sets up or removes event listeners and changes the cursor style based on whether the extraction mode is enabled.

### `service_worker.js`

Handles background tasks that require specific Chrome APIs.

- `chrome.runtime.onMessage.addListener`: Listens for the `download_text` action.
- `chrome.downloads.download`: Converts the provided text into a Data URL (via `FileReader` and `Blob`) and triggers the browser's download manager.

### `popup.js`

Controls the extension's state from the toolbar.

- `updateUI(isEnabled)`: Updates the button text and styling based on the current activation state.
- `toggleBtn.addEventListener('click')`: Toggles the state in `chrome.storage.local` and notifies the active tab's content script to enable or disable features.

---

## Installation & Development

1. Load the root directory via `chrome://extensions/` using the **Load unpacked** button in Developer Mode.
2. Ensure you have the following permissions enabled in Chrome: `downloads`, `storage`, and `activeTab`.
