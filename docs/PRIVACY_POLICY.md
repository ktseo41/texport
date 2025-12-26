# Privacy Policy for Texport

**Last Updated:** December 26, 2025

## Overview

Texport ("the Extension") is a Chrome extension that allows users to visually select and extract text from web pages. This Privacy Policy explains how we handle user data.

## Data Collection

**We do not collect, transmit, or store any personal data.** All operations are performed locally within your browser.

### What the Extension Processes

- **Selected Text**: When you select an element on a webpage, the Extension reads the text content of that element for copying or downloading purposes.
- **User Preferences**: Your settings (e.g., activation state, click action preference) are stored locally using Chrome's `chrome.storage.local` API. This data never leaves your device.

### What the Extension Does NOT Do

- Does not send any data to external servers
- Does not collect browsing history
- Does not track user behavior or analytics
- Does not share any information with third parties
- Does not use cookies or similar tracking technologies

## Permissions Used

The Extension requires the following permissions:

| Permission                     | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `activeTab`                    | To interact with the currently active tab when activated |
| `downloads`                    | To save extracted text as a `.txt` file                  |
| `storage`                      | To save your preferences locally                         |
| Content Scripts (`<all_urls>`) | To enable text selection overlay on any webpage          |

## Data Security

Since all data processing occurs locally on your device and no data is transmitted externally, your information remains secure within your browser environment.

## Children's Privacy

This Extension does not knowingly collect any information from children under 13 years of age.

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.

## Contact

If you have any questions about this Privacy Policy, please open an issue on our [GitHub repository](https://github.com/ktseo41/texport).

---

_This extension is open source and its code can be reviewed at any time._
