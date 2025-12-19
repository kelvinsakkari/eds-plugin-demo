# DVIDS Sidekick Plugins

Custom AEM Edge Delivery Services (EDS) Sidekick plugins for integrating with the Defense Visual Information Distribution Service (DVIDS) API. These plugins allow content authors to search, preview, and import military media directly from DVIDS into their documents.

## Overview

| Plugin | Description | Use Case |
|--------|-------------|----------|
| **DVIDS Images** | Search and copy DVIDS images to clipboard | Adding military photos to documents |
| **DVIDS Articles** | Import DVIDS news articles with metadata | Creating news pages from DVIDS content |

## Installation

These plugins are configured in the Sidekick `config.json`:

```json
{
  "plugins": [
    {
      "id": "dvids-search",
      "title": "DVIDS Images",
      "url": "/tools/sidekick/dvids/dvids-popover.html",
      "isPalette": true,
      "paletteRect": "right: 0; top: 0; bottom: 0; width: 380px;",
      "environments": ["edit"],
      "pinned": true
    },
    {
      "id": "dvids-articles",
      "title": "DVIDS Articles",
      "url": "/tools/sidekick/dvids/dvids-articles-popover.html",
      "isPalette": true,
      "paletteRect": "right: 0; top: 0; bottom: 0; width: 420px;",
      "environments": ["edit"],
      "pinned": true
    }
  ]
}
```

---

## DVIDS Images Plugin

### Files
- `dvids-popover.html` - Plugin UI
- `dvids-popover.js` - Plugin logic

### Features

- **Keyword Search** - Search DVIDS image library by keywords (e.g., "F-15", "training", "tank")
- **Filters**
  - Aspect ratio (Landscape, Portrait, Square)
  - Military branch (Army, Navy, Air Force, Marines, Coast Guard, Joint, Civilian)
  - Sort order (Date, Published, Updated, Relevance)
- **Pagination** - Navigate through search results
- **One-Click Copy** - Click an image to copy it to your clipboard
- **Smart Resizing** - Automatically resizes large images to stay under clipboard size limits (4MB)
- **Alt Text Dialog** - After copying, displays a dialog with the image's description/caption for accessibility

### Usage

1. Open the Sidekick while editing a document
2. Click **DVIDS Images** to open the palette
3. Enter search keywords and apply filters
4. Click **Search**
5. Click any image thumbnail to:
   - Copy the full-resolution image to your clipboard
   - View the alt text dialog with the image description
6. Paste the image into your document (`Ctrl+V` / `Cmd+V`)
7. Copy the alt text if needed for accessibility

### Technical Details

- Uses DVIDS Search API (`https://api.dvidshub.net/search`)
- Uses DVIDS Asset API (`https://api.dvidshub.net/asset`) for full-resolution images
- Images are copied as PNG via the Clipboard API
- Large images are progressively downscaled if they exceed 4MB

---

## DVIDS Articles Plugin

### Files
- `dvids-articles-popover.html` - Plugin UI  
- `dvids-articles-popover.js` - Plugin logic

### Features

- **Article Search** - Search DVIDS news articles by keywords
- **Filters**
  - Military branch (Army, Navy, Air Force, Marines, Coast Guard, Space Force, National Guard, Joint)
  - Sort order (Date, Published, Updated, Relevance)
  - Sort direction (Newest, Oldest)
- **Article Preview** - Click to preview full article details before importing
- **Formatted Export** - Copies article as Word-compatible HTML with:
  - Title and body content
  - Embedded hero image (base64 encoded)
  - Metadata table for EDS import

### Usage

1. Open the Sidekick while editing a document
2. Click **DVIDS Articles** to open the palette
3. Enter search keywords and apply filters
4. Click **Search**
5. Click an article to open the preview dialog showing:
   - Title
   - Date, branch, author, unit
   - Featured image
   - Body preview
   - Metadata block preview
6. Click **Copy Article to Clipboard**
7. Open a blank Word document
8. Paste (`Ctrl+V` / `Cmd+V`)
9. Save and upload to SharePoint for EDS import

### Metadata Table

The copied article includes a formatted metadata table compatible with EDS document import:

| Field | Description |
|-------|-------------|
| Title | Article headline |
| Description | Article summary |
| Image | Featured image |
| Release Date | Publication date (MM/DD/YYYY) |
| Dateline | Location (City, State/Country) |
| Author | Article credit |
| Tags | Keywords |
| Branch | Military branch |
| Category | Set to "news" |
| Template | Set to "article" |

### Technical Details

- Searches DVIDS for `type: news` content
- Fetches full article data via Asset API
- Extracts and embeds full-resolution images as base64
- Generates Word-compatible HTML with explicit table styling
- Strips duplicate datelines from article body

---

## API Information

Both plugins use the [DVIDS Public API](https://api.dvidshub.net/):

- **Search Endpoint**: `https://api.dvidshub.net/search`
- **Asset Endpoint**: `https://api.dvidshub.net/asset`
- **Authentication**: API key (included in plugins) - you should sign up for your own (free) DVIDS API account because the key in the codebase is my own and it requires that you set domains in an allowlist. 

> ⚠️ **Production Note**: For production deployments, consider proxying API requests through a backend service to protect the API key.

### Rate Limits

Refer to DVIDS API documentation for current rate limits and usage policies.

---

## Browser Compatibility

These plugins require modern browser features:
- Clipboard API (`navigator.clipboard.write`)
- Canvas API for image processing
- Fetch API for network requests
- ES6+ JavaScript

Tested in:
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)

---

## Troubleshooting

### Images not copying
- Ensure the browser window/tab has focus
- Check browser console for clipboard permission errors
- Verify the image URL is accessible (CORS)

### Articles not loading
- Check network connectivity
- Verify API key is valid
- Check browser console for API errors

### Alt text dialog not appearing
- Dialog appears only after successful image copy
- Check console for any JavaScript errors

### Word not formatting correctly
- Ensure pasting into a **blank** Word document
- Use `Paste Special > HTML` if regular paste doesn't work
- Check that tables have borders enabled in Word

---

## Development

### Local Testing

1. Start a local server in the project root
2. Open the plugin HTML files directly in a browser
3. Use browser developer tools to debug

### Modifying Plugins

- UI styling: Edit the `<style>` section in the HTML files
- Search logic: Modify `buildSearchUrl()` function
- Copy behavior: Modify `onSelect()` or `copyArticleToClipboard()` functions
- Metadata fields: Update `generateArticleHtml()` function

---

## License

These plugins are part of the Military EDS project. See the project LICENSE file for details.

