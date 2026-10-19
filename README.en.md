# dsh-client-ui-thick-scrollbar

[中文](README.md) | [English](README.en.md)

[![npm](https://img.shields.io/npm/v/dsh-client-ui-thick-scrollbar.svg)](https://www.npmjs.com/package/dsh-client-ui-thick-scrollbar)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Global scrollbar thickness tuner for the DeepSeek Harness client: widen every scrollbar and adjust the width from the plugin page.

## What it does

The shipped DSH theme paints every scrollbar from two body-level custom properties:

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

This plugin writes the chosen width as an inline custom property on `<body>`. Conversation panes, the sidebar, menus and dialogs thicken together; disabling the plugin removes the inline property and the shipped width returns. It does not replace the shipped stylesheet or patch official components.

## Install

1. Open **Plugins** in the client sidebar, then **Add plugin**.
2. Enter `dsh-client-ui-thick-scrollbar@1.0.0` (or choose the local source directory).
3. **Install**, then **Enable now**; restart the client if it says the change takes effect on the next start.
4. The card must read **Enabled / Mounted**.

## Adjust the width

1. Plugins → **Installed plugins** → open this plugin.
2. The **Scrollbar width** card sits between the description and the row list.
3. Pick a preset (6 / 8 / 10 / 12 px) or type a custom value from 4 to 20.
4. **Save** applies immediately; **Restore default** returns to 8px.

All visible copy follows the client language.

## Storage

Current key:

```text
dsh-client-ui-thick-scrollbar.settings.v1
```

When upgrading from the old package name `dsh-client-ui-scrollbar-tuner`, the plugin reads the legacy key once and migrates the value, so the saved width is preserved. Settings live in the renderer's `localStorage`; clearing site storage resets the width to 8px.

## Scope and limits

- The track and thumb widen together; the shipped thumb color, pill radius and hover color are kept.
- Horizontal scrollbars use the same variable and widen too.
- Components that hide their own scrollbar stay hidden by design.
- The plugin only changes a CSS variable: no host service, no network, no files.

## Compatibility

Target client **0.2.1-rc.2**. The plugin depends only on the theme's `--dsh-scrollbar-width` contract; if a future client renames it the plugin goes inert instead of breaking the layout.

## Development

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
```

## License

MIT. Not affiliated with DeepSeek.
