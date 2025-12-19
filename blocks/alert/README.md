# Alert Block

The Alert block is based on the [USWDS Alert component](https://designsystem.digital.gov/components/alert/) and provides contextual feedback messages for typical user actions.

## Usage

In your document, create an Alert block table with the following structure:

### Standard Alert (with heading)

| Alert |
|-------|
| Alert Heading |
| This is the alert message body text. You can include **bold**, *italic*, and [links](https://example.com). |

### Single-row Alert (no heading)

| Alert |
|-------|
| This is a simple alert message without a heading. |

## Variants

Use block variants by adding them in parentheses after the block name:

### Alert Types

| Block Name | Description | Color |
|------------|-------------|-------|
| `Alert` or `Alert (info)` | Informational message | Cyan |
| `Alert (success)` | Success/confirmation message | Green |
| `Alert (warning)` | Warning message | Yellow |
| `Alert (error)` | Error message | Red |
| `Alert (emergency)` | Emergency alert (dark background) | Dark red |

### Alert Modifiers

| Modifier | Description |
|----------|-------------|
| `slim` | Compact version with smaller padding and icon |
| `no-icon` | Hides the alert icon |

### Combining Variants

You can combine type and modifiers:

- `Alert (success slim)` - Slim success alert
- `Alert (warning no-icon)` - Warning alert without icon
- `Alert (error slim no-icon)` - Slim error alert without icon

## Examples

### Info Alert (default)

| Alert |
|-------|
| Information Available |
| Check out the new features we've added to improve your experience. |

### Success Alert

| Alert (success) |
|-----------------|
| Success |
| Your changes have been saved successfully. |

### Warning Alert (slim)

| Alert (warning slim) |
|----------------------|
| Please note: This action cannot be undone. |

### Error Alert

| Alert (error) |
|---------------|
| Error |
| There was a problem processing your request. Please try again. |

### Emergency Alert

| Alert (emergency) |
|-------------------|
| Emergency Alert |
| This is an emergency notification. Take action immediately. |

## Accessibility

- All alerts use `role="alert"` to announce content to screen readers
- Icons include `aria-hidden="true"` since they are decorative
- Alert text should be clear and actionable
- Use appropriate alert types to convey the severity of the message

## Customization

The alert inherits font families from the project's CSS custom properties:
- `--body-font-family` for body text
- `--heading-font-family` for alert headings

