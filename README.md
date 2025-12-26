# Texport (Webpage Text Extractor)

Smart DOM-navigation text extractor and exporter.

## Motivation (Why I built this?)

Existing webpage text extraction methods had several limitations:

- **Limitations of URL-based conversion tools**: They often fail to fetch text from sites with SPA (Single Page Application) structures or bot protection logic.
- **Inconvenience of "Select All" copy**: Using `Ctrl+A` to copy everything includes too much unnecessary text like ads, menus, and footers, making it difficult to clean up.
- **Tedious manual work**: Manually copying HTML from DevTools and using HTML-to-Markdown converters is a very cumbersome process.

I developed this tool to solve these frustrations and to **"instantly extract only the clean text from the specific area I want."**

## Limitations

- **Scattered Content**: requires repeated manual actions for text spread across different parts of a page.
- **Visibility Boundaries**: Hard to visualize the full scope when an element is larger than the viewport.
- **Manual Nature**: Built for precision, not for high-volume automated scraping.

## Key Features

- **Visual Metadata & Feedback**: Real-time display of HTML tag names and character counts.
- **Hierarchy Navigation**: Precise element selection using `↑` / `↓` arrow keys to move between parents and children.
- **Flexible Export**: Support for downloading as `.txt`, copying to clipboard, or selecting an action on click ("Ask" mode).
- **Keyboard Shortcuts**: Quick toggle activation/deactivation via `Cmd/Ctrl + Shift + X`.

## Installation

1. Clone or download this repository.
2. Run `pnpm install` and then `pnpm build`.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer mode".
5. Click "Load unpacked" and select the `dist` folder.

## License

ISC License
