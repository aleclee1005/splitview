# SplitView - Multi Panel Browser

Stop switching tabs. SplitView lets you view 2, 3, or 4 websites side by side in a single window — look up references, compare prices, or read documentation without ever leaving your current page.

![SplitView Screenshot](https://raw.githubusercontent.com/aleclee1005/splitview/main/icons/icon128.png)

## Features

- **9 layout options** — side-by-side, stacked, 3-panel, 4-panel, and asymmetric grids
- **Drag-to-resize** panels at any time
- **URL autocomplete** with browser history suggestions in every panel
- **Broadcast bar** — type one question and send it to ALL panels at once
- **Auto-submit** — automatically clicks the send button after broadcasting
- **Presets** — save your favorite URL combinations and reopen in one click

## Installation

### From Chrome Web Store
*(Pending review)*

### Manual (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder

## Usage

1. Click the SplitView icon in your Chrome toolbar
2. Choose a layout or open a saved preset
3. Each panel has its own address bar — type a URL and press Enter
4. Use the **broadcast bar** at the top to send the same message to all panels at once

## Layouts

| ID | Description |
|----|-------------|
| `2h` | 2 panels side by side |
| `2v` | 2 panels stacked vertically |
| `3r` | 1 large left + 2 stacked right |
| `3l` | 2 stacked left + 1 large right |
| `3t` | 2 top + 1 bottom |
| `3b` | 1 top + 2 bottom |
| `4`  | 2×2 grid |
| `4r` | 1 large left + 3 stacked right |
| `4t` | 3 top + 1 bottom |

## Permissions

| Permission | Purpose |
|-----------|---------|
| `storage` | Save panel presets locally |
| `history` | URL autocomplete suggestions |
| `declarativeNetRequest` | Allow websites to load inside iframe panels |
| host permissions (`<all_urls>`) | Broadcast text to panels on any website |

All data stays on your device. Nothing is collected or transmitted externally.

## Privacy

See [Privacy Policy](https://fluffy-puffpuff-4411a9.netlify.app).

## License

MIT — see [LICENSE](LICENSE)
