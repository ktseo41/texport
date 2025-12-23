# Webpage Text Extractor Documentation

## Purpose

The **Webpage Text Extractor** is a Chrome Extension designed to simplify the process of extracting textual content from web pages. It provides a visual interface for users to select specific DOM elements, navigate the document hierarchy, and export the content directly. This tool is ideal for developers, researchers, and content creators who need to quickly grab clean text from complex web layouts.

## Key Features

- **Visual Metadata & Feedback**: Displays the HTML tag name and character count of the hovered element. Includes a "pulse" animation when navigating between elements and a "Copied!" notification.
- **Hierarchy Navigation**: Use `ArrowUp` to select the parent element and `ArrowDown` to drill back down to child elements.
- **Flexible Export Actions**:
  - **Download**: Save the selected text directly as a `.txt` file.
  - **Copy**: Copy the selected text to the clipboard.
  - **Ask**: Displays a context menu on click, allowing the user to choose between Download and Copy.
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to toggle extraction mode.
  - `ArrowUp` / `ArrowDown` for hierarchy navigation.
  - `Esc` to deactivate extraction mode or cancel the "Ask" menu.
- **Sleek Interface**: A modern popup UI with real-time status updates, action selection, and a shortcut guide.

## File Structure

- `manifest.json`: Configuration for permissions (`downloads`, `storage`, `clipboardWrite`), keyboard commands, and project icons.
- `popup.html` / `popup.js`: Modern UI for toggling the extension and selecting the default click action. Synchronizes state across tabs.
- `content.js`: Core interaction logic, overlay management, hierarchy navigation, and action menu handling.
- `content.css`: Styling for the selection overlay, "Ask" mode menu, animations (pulse), and feedback labels.
- `service_worker.js`: Background script for handling downloads and managing the extension's enabled state.
- `icons/`: Project icons in 16x16, 48x48, and 128x128 sizes.

---

## Code Reference (Function Roles)

### `content.js`

- `updateOverlay(el)`: Updates position/size and populates the label with the tag name and character count.
- `handleKeyDown(e)`: Handles hierarchy navigation (`ArrowUp`/`ArrowDown`), deactivation (`Esc`), and provides visual feedback.
- `triggerPulse()`: Visual flash animation to confirm a change in focus.
- `handleClick(e)`: Based on the `clickAction` setting:
  - Executes immediate Download or Copy.
  - Or calls `showActionMenu(e, text)` to let the user decide.
- `showActionMenu(x, y, text)`: Creates and positions a context menu for action selection.
- `removeActionMenu()`: Cleans up the context menu from the DOM.
- `performCopy(text)`: Handles clipboard writing and shows "Copied!" feedback in the overlay.
- `performDownload(text)`: Sends a message to the background script to trigger a file download.

### `popup.js`

- `chrome.storage.onChanged`: Listens for state changes to update the popup UI in real-time.
- `updateUI(enabled)`: Updates the toggle button's appearance and text based on the current state.
- `updateActionUI(action)`: Updates the active state of the Download/Copy/Ask buttons.

---

## Changelog

### Version 1.2 (Dec 23, 2025)

- **feat**: Added **"Ask" mode**, providing a context menu on click to choose between Copy and Download.
- **feat**: Added project icons (16, 48, 128) and integrated them into the manifest and UI.
- **feat**: Redesigned **Popup UI** with a professional aesthetic and added a keyboard shortcut guide.
- **feat**: Implemented real-time popup synchronization via `chrome.storage.onChanged`.
- **feat**: Added "Copied!" feedback in the overlay for better user confirmation.
- **fix**: Improved hierarchy navigation logic and overlay positioning.
- **fix**: Enhanced cleanup routines for the action menu and event listeners on deactivation.

### Version 1.1 (Dec 22, 2025)

- **feat**: Added "Copy to Clipboard" option in popup settings.
- **feat**: Enhanced overlay with HTML tag name display and pulse animation for better hierarchy navigation feedback.
- **feat**: Implemented keyboard shortcuts for quick activation.
- **fix**: Fixed focus persistence issues when activating from the popup.

---

## Installation & Development

1. Load the root directory via `chrome://extensions/` using the **Load unpacked** button in Developer Mode.
2. Ensure you have the following permissions enabled in Chrome: `downloads`, `storage`, and `activeTab`.
