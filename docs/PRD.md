# Webpage Text Extractor Documentation

## Purpose

The **Webpage Text Extractor (Texport)** is a Chrome Extension designed to simplify the process of extracting textual content from web pages. It provides a visual interface for users to select specific DOM elements, navigate the document hierarchy, and export the content directly. This tool is ideal for developers, researchers, and content creators who need to quickly grab clean text from complex web layouts.

## Motivation (Why I built this?)

Existing webpage text extraction methods had several limitations:

- **Limitations of URL-based conversion tools**: They often fail to fetch text from sites with SPA (Single Page Application) structures or bot protection logic.
- **Inconvenience of "Select All" copy**: Using `Ctrl+A` to copy everything includes too much unnecessary text like ads, menus, and footers, making it difficult to clean up.
- **Tedious manual work**: Manually copying HTML from DevTools and using HTML-to-Markdown converters is a very cumbersome process.

I developed this tool to solve these frustrations and to **"instantly extract only the clean text from the specific area I want."**

## Limitations

While Texport offers precision, it has some known limitations:

- **Scattered Content**: Extracting text spread across multiple separate sections requires repeated manual actions for each part.
- **Viewport Boundary Issues**: When an element extends beyond the current viewport, it can be difficult to visualize the exact boundaries (start/end) of the selection.
- **Designed for Manual Precision**: As a human-driven tool, it is not suitable for large-scale automated data scraping across hundreds of pages.

## Key Features

- **Visual Metadata & Feedback**: Displays the HTML tag name and character count of the hovered element. Includes a "pulse" animation when navigating between elements and a "Copied!" notification.
- **Hierarchy Navigation**: Use `ArrowUp` to select the parent element and `ArrowDown` to drill back down to child elements.
- **Flexible Export Actions**:
  - **Download**: Save the selected text directly as a `.txt` file (filename auto-generated from document title).
  - **Copy**: Copy the selected text to the clipboard.
  - **Ask**: Displays a context menu on click, allowing the user to choose between Download and Copy.
- **Keyboard Shortcuts**:
  - `Ctrl + Shift + X` (Windows/Linux) or `Cmd + Shift + X` (macOS) to toggle extraction mode.
  - `ArrowUp` / `ArrowDown` for hierarchy navigation.
  - `Esc` to deactivate extraction mode or cancel the "Ask" menu.
  - Customizable shortcuts via `chrome://extensions/shortcuts` (link available in popup).
- **Visual Indicators**:
  - **Badge**: Shows "ON" badge when extraction mode is active.
  - **Crosshair Cursor**: Changes cursor to crosshair when active for precise element selection.
  - **Scroll Tracking**: Overlay follows the selected element on scroll.
- **Sleek Interface**: A modern popup UI with real-time status updates, action selection, and a shortcut guide.

## File Structure

- `manifest.json`: Manifest V3 configuration for permissions (`downloads`, `storage`, `activeTab`), keyboard commands, and project icons.
- `popup.html` / `popup.ts`: Modern UI for toggling the extension and selecting the default click action. Synchronizes state across tabs.
- `content.ts`: Core interaction logic using a modular class-based architecture.
- `content.css`: Styling for the selection overlay, "Ask" mode menu, animations (pulse), and feedback labels.
- `service_worker.ts`: Background script for handling downloads, keyboard shortcut commands, and badge management.
- `icons/`: Project icons in 16x16, 48x48, and 128x128 sizes.

---

## Code Reference (Class-Based Architecture)

### `content.ts`

The content script is organized into three main classes:

#### `OverlayManager`

Handles the visual overlay that highlights selected elements.

- `create()`: Creates the overlay and label elements.
- `remove()`: Removes the overlay from the DOM.
- `update(el, isActive)`: Updates position/size and populates the label with tag name and character count.
- `updateLabelPosition(rect)`: Positions the label to stay within viewport bounds.
- `triggerPulse()`: Visual flash animation to confirm a change in focus.
- `showCopiedFeedback(el)`: Shows "Copied!" feedback in the overlay.

#### `ActionMenuManager`

Manages the context menu for "Ask" mode.

- `show(x, y)`: Creates and positions the context menu for action selection.
- `positionMenu(x, y)`: Adjusts menu position to stay within viewport.
- `remove()`: Cleans up the context menu from the DOM.
- `isActive()`: Returns whether the menu is currently visible.

#### `TextExporter`

Main controller class that orchestrates the extension's behavior.

- `initialize()`: Sets up message listeners and storage change handlers.
- `toggle(state)`: Activates/deactivates extraction mode.
- `addEventListeners()` / `removeEventListeners()`: Manages event handlers.
- `handleMouseMove(e)`: Tracks hovered elements.
- `handleKeyDown(e)`: Handles `Esc` and navigation keys.
- `navigateUp(e)` / `navigateDown(e)`: DOM hierarchy navigation.
- `handleClick(e)`: Executes action based on `clickAction` setting.
- `handleCopy()`: Copies text to clipboard.
- `handleDownload()`: Triggers file download via background script.

### `popup.ts`

- `chrome.storage.onChanged`: Listens for state changes to update the popup UI in real-time.
- `updateUI(enabled)`: Updates the toggle button's appearance and text based on the current state.
- `updateBadge(enabled)`: Sets badge text ("ON" / "") and color.
- `updateActionUI(action)`: Updates the active state of the Download/Copy/Ask buttons.
- `parseShortcut(shortcut)`: Parses Chrome shortcut format into readable key labels.

### `service_worker.ts`

- Handles `download_text` message to trigger file downloads.
- Listens for `toggle-activation` command to toggle state via keyboard shortcut.
- Manages badge updates for immediate visual feedback.

---

## Changelog

### Version 1.3.0 (Dec 26, 2025)

- **refactor**: Migrated codebase from JavaScript to **TypeScript** for improved type safety.
- **refactor**: Introduced **class-based architecture** (`OverlayManager`, `ActionMenuManager`, `TextExporter`) for better modularity and maintainability.
- **feat**: Added **scroll tracking** - overlay follows selected element on scroll.
- **feat**: Auto-generates **filename from document title** for downloads.
- **docs**: Updated PRD to reflect TypeScript migration and new architecture.

### Version 1.2.0 (Dec 23, 2025)

- **feat**: Added **"Ask" mode**, providing a context menu on click to choose between Copy and Download.
- **feat**: Added project icons (16, 48, 128) and integrated them into the manifest and UI.
- **feat**: Redesigned **Popup UI** with a professional aesthetic and added a keyboard shortcut guide.
- **feat**: Implemented real-time popup synchronization via `chrome.storage.onChanged`.
- **feat**: Added "Copied!" feedback in the overlay for better user confirmation.
- **feat**: Added **badge indicator** showing "ON" when extraction mode is active.
- **feat**: Added **crosshair cursor** when extraction mode is active.
- **feat**: Added link to customize keyboard shortcuts in popup.
- **fix**: Improved hierarchy navigation logic and overlay positioning.
- **fix**: Enhanced cleanup routines for the action menu and event listeners on deactivation.

### Version 1.1.0 (Dec 22, 2025)

- **feat**: Added "Copy to Clipboard" option in popup settings.
- **feat**: Enhanced overlay with HTML tag name display and pulse animation for better hierarchy navigation feedback.
- **feat**: Implemented keyboard shortcuts for quick activation (e.g., `Cmd + Shift + X`).
- **fix**: Fixed focus persistence issues when activating from the popup.

---

## Installation & Development

1. Load the root directory via `chrome://extensions/` using the **Load unpacked** button in Developer Mode.
2. Ensure you have the following permissions enabled in Chrome: `downloads`, `storage`, and `activeTab`.
3. For development, use `pnpm watch` to enable continuous building.
