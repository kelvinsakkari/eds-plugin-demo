# Collection Block

The Collection block is based on the [USWDS Collection component](https://designsystem.digital.gov/components/collection/) and displays a compact list of multiple related items like articles, events, or documents.

## Features

- **Two modes**: Static (fixed list) or Dynamic (query-based)
- **USWDS variants**: Default, thumbnail/media, calendar, headings-only, condensed
- **Rich metadata**: Supports dates, authors, tags, and descriptions
- **Responsive design**: Adapts to mobile and desktop layouts

## Usage Modes

### Mode 1: Static (Fixed List)

Provide a list of items directly in the block. Each row is one item.

| Collection |
|------------|
| [Article Title](https://example.com/article) |
| This is the description of the article. |

| Collection |
|------------|
| [First Article](https://example.com/first) |
| Description of the first article. |
| [Second Article](https://example.com/second) |
| Description of the second article. |

### Mode 2: Dynamic (Query-Based)

Provide a source URL to a query index. The block will fetch and display items automatically.

| Collection |
|------------|
| source | /news/query-index.json |
| limit | 6 |

With filtering:

| Collection |
|------------|
| source | /news/query-index.json |
| limit | 4 |
| category | press-release |
| tag | featured |

## Configuration Options

| Key | Description | Default |
|-----|-------------|---------|
| `source` | URL to query index (enables dynamic mode) | - |
| `limit` | Maximum number of items to display | 6 |
| `category` | Filter by category field | - |
| `tag` | Filter by tag (checks if tags field contains value) | - |
| `filter` | Generic filter in `field:value` format | - |
| `sortBy` | Sort field: `date`, `releaseDate`, or `title` | `date` |

## Variants

Use block variants by adding them in parentheses:

| Variant | Description |
|---------|-------------|
| `Collection` | Default with descriptions and meta information |
| `Collection (thumbnail)` or `Collection (media)` | Shows thumbnail images |
| `Collection (calendar)` | Shows calendar-style date display |
| `Collection (headings-only)` | Compact list with just headings |
| `Collection (condensed)` | Reduced spacing between items |

### Combining Variants

- `Collection (thumbnail condensed)` - Thumbnails with condensed spacing
- `Collection (headings-only condensed)` - Minimal compact list

## Examples

### Default Collection (Static)

| Collection |
|------------|
| [Understanding Your Benefits](/resources/benefits) |
| Learn about the benefits available to service members and their families. |
| [Training Opportunities](/resources/training) |
| Explore professional development and training programs. |

### Collection with Thumbnails (Dynamic)

| Collection (thumbnail) |
|------------------------|
| source | /news/query-index.json |
| limit | 3 |

### Calendar Display (Dynamic)

| Collection (calendar) |
|-----------------------|
| source | /events/query-index.json |
| limit | 5 |

### Headings Only (Static)

| Collection (headings-only) |
|---------------------------|
| [The eight principles of mobile-friendliness](https://digital.gov/guides/mobile-principles/) |
| [The USWDS maturity model](https://designsystem.digital.gov/maturity-model/) |
| [A news item on our own site](/news/latest-update) |

### Condensed with Category Filter

| Collection (condensed) |
|------------------------|
| source | /news/query-index.json |
| limit | 10 |
| category | announcements |

## Expected Query Index Fields

For dynamic mode, the query index should include these fields:

| Field | Description |
|-------|-------------|
| `path` | URL path to the article |
| `title` | Article title |
| `description` | Short description |
| `image` | Thumbnail image URL (for thumbnail variant) |
| `releaseDate` or `date` | Publication date (Unix timestamp) |
| `author` | Author name |
| `tags` | Comma-separated tags |
| `category` | Category for filtering |

## Accessibility

- Uses semantic `<ul>` and `<li>` elements for screen reader enumeration
- Heading levels can be adjusted in the CSS if needed for page outline
- External links include `rel="noopener noreferrer"` and visual indicator
- Meta information uses `aria-label` for context

## Styling

The block uses CSS custom properties from your project:
- `--body-font-family` - Body text
- `--heading-font-family` - Headings
- `--link-color` - Link color
- `--link-hover-color` - Link hover color

