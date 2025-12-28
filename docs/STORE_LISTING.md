# Chrome Web Store Listing Information

## Basic Information

**Name:** Texport

**Short Description (132자 이내):**
Smart DOM-navigation text extractor. Visual selection with hierarchy navigation for precise text extraction and export.

**Detailed Description:**

```
Texport - Webpage Text Extractor

Instantly extract clean text from any webpage with visual precision.

🎯 KEY FEATURES
• Visual Element Selection: Hover over any element to see it highlighted with a sleek overlay
• Hierarchy Navigation: Use Arrow Up/Down keys to navigate parent/child elements
• Flexible Export: Copy to clipboard or download as .txt file
• Ask Mode: Choose your action with a context menu on each click
• Keyboard Shortcuts: Ctrl+Shift+X (Cmd+Shift+X on Mac) to toggle

📦 USE CASES
• Researchers extracting article content
• Developers grabbing text for testing
• Content creators collecting material
• Anyone who needs clean text from messy web layouts

🔒 PRIVACY FIRST
• All processing happens locally in your browser
• No data collection or external transmission
• No tracking or analytics
• Open source and transparent

⚠️ DISCLAIMER
Please respect copyright laws when using this extension. Do not use extracted content in ways that violate the original content owner's rights.

---
Built with ❤️ for productivity
```

---

## Category

**Primary Category:** Productivity
**Secondary Category:** Developer Tools (optional)

---

## Permission Justifications

### content_scripts with `<all_urls>`

**Why not `activeTab` only?**

> This extension provides a persistent text extraction experience. When the user toggles "ON" state, the content script must remain active across page navigations within the same tab to maintain the selection overlay and functionality. The `activeTab` permission only grants temporary access upon user gesture (like clicking the extension icon), which would require the user to re-click the icon after every navigation. Our implementation checks the `enabled` state from `chrome.storage.local` and only activates functionality when explicitly enabled by the user, ensuring minimal impact when disabled.

### activeTab

> Required for immediate interaction with the current tab when the user clicks the extension popup or uses a keyboard shortcut. This allows the extension to inject necessary functionality into the active page upon explicit user action.

### downloads

> Required to save extracted text as a `.txt` file. When users choose the "Download" action, the extension uses this permission to create and save a text file to their downloads folder with an auto-generated filename based on the page title.

### storage

> Required to persist user preferences locally, including:
>
> - Activation state (ON/OFF toggle)
> - Click action preference (Copy, Download, or Ask)
>   These settings sync across browser sessions and tabs for a consistent experience. All data is stored locally using `chrome.storage.local` and is never transmitted externally.

---

## Privacy Policy URL

**GitHub Raw URL (Temporary):**
`https://raw.githubusercontent.com/ktseo41/texport/main/docs/PRIVACY_POLICY.md`

**GitHub Pages URL (Recommended):**
`https://ktseo41.github.io/texport/PRIVACY_POLICY.html`

> ⚠️ Note: GitHub Pages 설정 후 실제 URL로 업데이트 필요

---

## Additional Fields

### Official URL

**Not required** - Leave blank or use: `https://github.com/ktseo41/texport`

### Homepage URL

`https://github.com/ktseo41/texport`

### Support URL

`https://github.com/ktseo41/texport/issues`

> 💡 **빠른 출시 팁**: 초기 출시시엔 별도 랜딩페이지 없이 GitHub으로 통일. GitHub Issues를 Support로 사용하면 사용자 피드백 수집과 활성화된 프로젝트 이미지를 동시에 얻을 수 있습니다.

---

## Single Purpose Description

**Required for Chrome Web Store Privacy Section** (1000자 이내)

```
This extension allows users to visually select and extract text content from any webpage.

Users can hover over page elements to see them highlighted, navigate the DOM hierarchy using arrow keys, and export the selected text by copying to clipboard or downloading as a .txt file.

The single purpose is: Precise visual text extraction from web pages.
```

---

## Data Usage Declaration

**Chrome Web Store Privacy Section**

### User Data Collection

**All categories: NO** (모든 항목 체크 해제)

| Category                              | Collected? | Reason                                   |
| ------------------------------------- | ---------- | ---------------------------------------- |
| ☐ Personally identifiable information | **No**     | 이름, 이메일 등 수집하지 않음            |
| ☐ Health information                  | **No**     | 해당 없음                                |
| ☐ Financial and payment information   | **No**     | 해당 없음                                |
| ☐ Authentication information          | **No**     | 로그인 기능 없음                         |
| ☐ Personal communications             | **No**     | 메시지 접근하지 않음                     |
| ☐ Location                            | **No**     | IP, GPS 수집하지 않음                    |
| ☐ Web history                         | **No**     | 방문 기록 저장하지 않음                  |
| ☐ User activity                       | **No**     | 클릭/스크롤 로깅하지 않음                |
| ☐ Website content                     | **No**     | 컨텐츠는 로컬에서만 처리, 외부 전송 없음 |

### Required Certifications

**All three must be checked** (필수 3가지 인증)

- ✅ I do not sell or transfer user data to third parties, outside of the approved use cases
- ✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes

> ✨ **근거**: PRD의 "PRIVACY FIRST" 섹션에 명시된 대로 "All processing happens locally in your browser". 모든 데이터는 사용자의 브라우저 로컬에서만 처리되며, 외부 서버로 전송되지 않습니다.

---

## Screenshots Required

스토어 등록을 위해 다음 스크린샷을 준비하세요 (1280x800 또는 640x400 권장):

1. **선택 오버레이 화면** - 요소 위에 마우스를 올렸을 때 하이라이트되는 모습
2. **Ask 모드 메뉴** - 클릭 시 나타나는 컨텍스트 메뉴
3. **팝업 UI** - 설정 메뉴와 ON/OFF 토글
4. **Copied! 피드백** - 텍스트 복사 후 피드백 표시

---

## Additional Store Assets

| Asset              | Size     | Status      |
| ------------------ | -------- | ----------- |
| Small Promo Tile   | 440x280  | ❌ 필요     |
| Large Promo Tile   | 920x680  | ❌ 선택사항 |
| Marquee Promo Tile | 1400x560 | ❌ 선택사항 |

---

## Promotional Video (Optional)

Chrome 웹 스토어에서는 **YouTube 동영상 링크**를 등록할 수 있습니다.

**권장 내용 (30초~1분):**

1. 확장프로그램 아이콘 클릭 → ON 활성화
2. 웹페이지에서 요소 호버 → 오버레이 하이라이트
3. Arrow Up/Down으로 계층 탐색
4. 클릭하여 텍스트 복사 또는 다운로드
5. "Copied!" 피드백 표시

**팁:** 동영상 하나만으로도 등록 가능하며, 스크린샷보다 사용자에게 더 직관적으로 기능을 보여줄 수 있습니다.

---

## Copyright Notice (Description에 포함)

```
⚠️ RESPONSIBLE USE
This tool is designed for personal productivity. Please ensure compliance with copyright laws and website terms of service when extracting and using content. The developers are not responsible for misuse of extracted content.
```
