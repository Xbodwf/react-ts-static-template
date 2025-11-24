# Static Build Plugins Documentation

This project includes custom Vite plugins to enable opening the built HTML file directly (double-click) without a web server.

## Plugins

### HTML Post-Build

Removes module-related attributes and fixes paths in the built HTML file.

**Features:**
- Removes `type="module"` scripts
- Removes `modulepreload` links
- Removes `nomodule` and `crossorigin` attributes
- Adds proper base path to all asset references using `combinePath()`

**Path Combination Logic:**
The plugin includes a `combinePath()` function similar to C#'s `Path.Combine`:
- Handles leading/trailing slashes properly
- Prevents double slashes
- Works with multiple path segments

Example:
```typescript
combinePath('.', '/assets/logo.png') // Result: './assets/logo.png'
combinePath('./', 'assets/', '/logo.png') // Result: './assets/logo.png'
```

### Path Conversion

Converts absolute paths in CSS, JSX, and TSX files to relative paths during the build.

**Features:**
- Converts `/assets/...` to `./assets/...` in JavaScript bundles
- Converts `url(/assets/...)` to `url(./assets/...)` in CSS files
- Converts `@import "/..."` to `@import "./..."` in CSS files
- Skips external URLs (http://, https://, //)

**Supported File Types:**
- CSS files (`.css`)
- JavaScript/TypeScript compiled output (`.js`, `.jsx`, `.tsx`)

**Asset Extensions Detected:**
- Images: png, jpg, jpeg, gif, svg, webp, ico
- Fonts: woff, woff2, ttf, eot
- Media: mp3, mp4, webm
- Documents: pdf

## Usage

Both plugins are configured in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '.',
  plugins: [
    react(),
    legacy({ /* ... */ }),
    absoluteToRelativePathPlugin('.'),
    htmlPostBuildPlugin('.')
  ],
})
```

## Build Process

1. Run `npm run build` or `pnpm build`
2. The plugins will automatically:
   - Convert all absolute paths to relative
   - Remove module-related attributes
   - Fix asset references with proper base path
3. Open `dist/index.html` directly in your browser (double-click)

## Notes

- The `base` parameter should be set to `'.'` for local file access
- External URLs (starting with `http://` or `https://`) are never modified
- Protocol-relative URLs (starting with `//`) are also preserved
