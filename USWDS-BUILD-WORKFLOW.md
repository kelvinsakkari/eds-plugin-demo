# USWDS Build Workflow for Edge Delivery Services

## ⚠️ Important: EDS Doesn't Compile SCSS

Edge Delivery Services serves **static files only**. SCSS must be pre-compiled locally and the resulting CSS files must be **committed to the repository**.

---

## 📁 Files That MUST Be Committed

### 1. USWDS Button Styles (Global)
```bash
styles/uswds-buttons.css  ← 10KB, MUST be committed
```

### 2. USWDS Block Styles (Modular)
```bash
blocks/card/card.css      ← 20KB, MUST be committed
blocks/grid/grid.css      ← 24KB, MUST be committed
```

### 3. Source Files (For Development)
```bash
styles/uswds-buttons.scss           ← Source file
styles/uswds/uswds-theme-settings.scss
styles/uswds/uswds-theme-custom.scss
blocks/card/card.scss
blocks/grid/grid.scss
```

---

## 🔄 Development Workflow

### Step 1: Make Changes to SCSS
Edit your source files:
- `styles/uswds-buttons.scss`
- `blocks/card/card.scss`
- `blocks/grid/grid.scss`
- `styles/uswds/uswds-theme-settings.scss` (theme customization)

### Step 2: Compile SCSS to CSS
```bash
# Compile all USWDS assets
npm run build

# Or compile individually:
npm run build:uswds-buttons  # Just buttons
npm run build:uswds-blocks   # Just card & grid blocks
```

### Step 3: Test Locally
Open your local preview and verify the styles work correctly.

### Step 4: Commit Compiled CSS
```bash
# Add the compiled CSS files
git add styles/uswds-buttons.css
git add blocks/card/card.css
git add blocks/grid/grid.css

# Commit with a descriptive message
git commit -m "Update USWDS styles: [describe changes]"

# Push to repository
git push
```

### Step 5: Deploy
EDS will automatically pick up the committed CSS files on your next deployment.

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Forget to Commit Compiled CSS
```bash
# This will NOT work on EDS:
git add styles/uswds-buttons.scss  # ← Source only
git commit -m "Update button styles"
# EDS can't use .scss files!
```

### ✅ DO: Always Commit Both Source and Compiled
```bash
# This WILL work:
git add styles/uswds-buttons.scss  # ← Source (for development)
git add styles/uswds-buttons.css   # ← Compiled (for EDS)
git commit -m "Update button styles"
```

### ❌ DON'T: Add Compiled CSS to .gitignore
```bash
# BAD .gitignore:
styles/uswds-buttons.css  # ← Will break on EDS!
```

### ✅ DO: Only Ignore Source Maps
```bash
# GOOD .gitignore:
*.css.map  # ← Only ignore source maps
```

---

## 📋 Pre-Commit Checklist

Before committing changes that affect USWDS styles:

- [ ] Run `npm run build` to compile SCSS
- [ ] Verify compiled CSS files exist:
  - [ ] `styles/uswds-buttons.css`
  - [ ] `blocks/card/card.css`
  - [ ] `blocks/grid/grid.css`
- [ ] Test locally that styles work
- [ ] Stage compiled CSS files with `git add`
- [ ] Commit with descriptive message
- [ ] Push to repository

---

## 🔧 Build Commands Reference

```bash
# Build everything (buttons + blocks)
npm run build

# Build only button styles
npm run build:uswds-buttons

# Build only modular blocks
npm run build:uswds-blocks

# Watch for changes during development
npm run watch:uswds-blocks

# Build full monolithic USWDS (reference only, not used)
npm run build:uswds
npm run build:uswds-utilities
```

---

## 📊 File Sizes

| File | Size | Purpose | Commit? |
|------|------|---------|---------|
| `uswds-buttons.css` | 10KB | Global button styles | ✅ YES |
| `card.css` | 20KB | Card block styles | ✅ YES |
| `grid.css` | 24KB | Grid block styles | ✅ YES |
| `*.scss` | Various | Source files | ✅ YES |
| `*.css.map` | Various | Source maps (debug) | ❌ NO |
| `uswds-compiled.css` | 448KB | Full USWDS (unused) | ❌ NO |
| `uswds-utilities.css` | 220KB | Utilities only (unused) | ❌ NO |

---

## 🎯 Why This Matters

### How EDS Works
1. Author edits document
2. Document published to `*.aem.page`
3. Browser requests CSS: `https://site.aem.page/styles/uswds-buttons.css`
4. **EDS serves the file directly from Git** (no compilation!)
5. If file is missing → 404 error, no styles

### What Happens If You Don't Commit CSS

```
Browser: GET /styles/uswds-buttons.css
EDS: 404 Not Found (file not in repository)
Result: ❌ No button styles, broken site
```

### What Happens When You Do Commit CSS

```
Browser: GET /styles/uswds-buttons.css
EDS: 200 OK (serves from repository)
Result: ✅ Button styles work perfectly
```

---

## 🔄 Updating USWDS Version

When updating the USWDS npm package:

```bash
# 1. Update USWDS
npm update uswds

# 2. Recompile all CSS
npm run build

# 3. Commit the updated CSS
git add styles/uswds-buttons.css blocks/*/card.css blocks/*/grid.css
git commit -m "Update to USWDS [version]"
git push
```

---

## 🐛 Troubleshooting

### Problem: Styles not appearing on published site

**Check:**
1. Are CSS files committed to repository?
   ```bash
   git ls-files styles/uswds-buttons.css
   # Should show: styles/uswds-buttons.css
   ```

2. Are CSS files on the correct branch?
   ```bash
   git branch  # Check you're on the right branch
   ```

3. Can you access the CSS directly?
   ```
   https://your-site.aem.page/styles/uswds-buttons.css
   # Should return CSS, not 404
   ```

### Problem: Styles work locally but not on EDS

**Cause:** CSS files not committed or not pushed

**Solution:**
```bash
git status  # Check if CSS files are uncommitted
git add styles/uswds-buttons.css blocks/card/card.css blocks/grid/grid.css
git commit -m "Add compiled USWDS CSS"
git push
```

### Problem: Old styles showing on EDS

**Cause:** Browser cache or CDN cache

**Solution:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check file timestamp in git to verify latest version is committed
3. Wait a few minutes for CDN cache to clear

---

## 📝 Team Guidelines

For teams working on this project:

### For Designers/Content Editors
- You don't need to worry about build steps
- Styles are pre-compiled by developers
- Just use the blocks as documented

### For Developers
- **Always compile before committing**
- Run `npm run build` as part of your workflow
- Add a git pre-commit hook (optional but recommended)
- Document any theme changes in commit messages

### Git Pre-Commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check if SCSS files were modified
if git diff --cached --name-only | grep -q "\.scss$"; then
  echo "SCSS files modified, running build..."
  npm run build
  
  # Add compiled CSS files
  git add styles/uswds-buttons.css
  git add blocks/card/card.css
  git add blocks/grid/grid.css
  
  echo "✅ Compiled CSS added to commit"
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📚 Related Documentation

- `USWDS-INTEGRATION.md` - Full integration overview
- `USWDS-BUTTON-INTEGRATION.md` - Button integration specifics
- `MODULAR-USWDS-GUIDE.md` - Modular block approach
- `USWDS-QUICK-REFERENCE.md` - Quick commands

---

**Last Updated:** November 2025  
**Critical:** Always commit compiled CSS files to Git for EDS

