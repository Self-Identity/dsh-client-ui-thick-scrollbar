# dsh-client-ui-thick-scrollbar

[![npm](https://img.shields.io/npm/v/dsh-client-ui-thick-scrollbar.svg)](https://www.npmjs.com/package/dsh-client-ui-thick-scrollbar)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Global scrollbar thickness tuner for the DeepSeek Harness client: widen every scrollbar and adjust the width from the plugin page.

全局加粗 DSH 客户端滚动条，宽度可在插件页调节（4–20px，默认 8px）。

[中文](#中文) · [English](#english)

---

## 中文

### 功能

DSH 主题用一组 body 级 CSS 变量绘制所有滚动条：

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

本插件把 `--dsh-scrollbar-width` 写成 `<body>` 的内联自定义属性，因此会话区、侧边栏、菜单、弹窗等所有使用官方滚动条样式的位置会一起加粗；关闭插件时移除内联属性，立即恢复官方宽度。插件不替换官方样式表，也不改官方组件。

### 安装

1. 客户端左侧 **插件** 页 → **添加插件**；
2. 填 `dsh-client-ui-thick-scrollbar@1.0.0`（或选择本地源码目录）；
3. **安装** → **立即启用**；若提示「改动在下次启动生效」，重启客户端；
4. 卡片显示 **已启用 / 已挂载** 即生效。

### 调节宽度

1. 插件页 → **已安装插件** → 打开本插件；
2. 在描述与行列表之间是 **滚动条宽度** 配置卡片；
3. 选择预设（6 / 8 / 10 / 12 px），或在 **自定义宽度** 里输入 4–20 的整数；
4. **保存** 立即生效，**恢复默认** 回到 8px。

配置文案跟随客户端语言。

### 存储

当前键：

```text
dsh-client-ui-thick-scrollbar.settings.v1
```

从旧包名 `dsh-client-ui-scrollbar-tuner` 升级时，会读取旧键并在首次加载时迁移到新键，不需要重新设置宽度。配置存在渲染进程的 `localStorage`，重启客户端后保留；清除站点存储会回到默认 8px。

### 范围与限制

- 加粗的是滚动条轨道宽度（滑块与轨道一起变宽），沿用官方主题的滑块颜色、圆角与 hover 变色。
- 横向滚动条使用同一个变量，因此一起变粗。
- 组件显式隐藏自己的滚动条时（例如标签条的 `scrollbar-width: none`）仍保持隐藏。
- 插件只改一个 CSS 变量：没有 Host 服务、没有网络请求、不写文件。

### 兼容性

目标客户端 **0.2.1-rc.2**。插件只依赖主题的 `--dsh-scrollbar-width` 约定；如果客户端后续改掉这个变量名，插件会静默失效，不会破坏界面。

### 开发

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
```

---

## English

### What it does

The shipped DSH theme paints every scrollbar from two body-level custom properties:

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

This plugin writes the chosen width as an inline custom property on `<body>`. Conversation panes, the sidebar, menus and dialogs thicken together; disabling the plugin removes the inline property and the shipped width returns. It does not replace the shipped stylesheet or patch official components.

### Install

1. Open **Plugins** in the client sidebar, then **Add plugin**.
2. Enter `dsh-client-ui-thick-scrollbar@1.0.0` (or choose the local source directory).
3. **Install**, then **Enable now**; restart the client if it says the change takes effect on the next start.
4. The card must read **Enabled / Mounted**.

### Adjust the width

1. Plugins → **Installed plugins** → open this plugin.
2. The **Scrollbar width** card sits between the description and the row list.
3. Pick a preset (6 / 8 / 10 / 12 px) or type a custom value from 4 to 20.
4. **Save** applies immediately; **Restore default** returns to 8px.

All visible copy follows the client language.

### Storage

Current key:

```text
dsh-client-ui-thick-scrollbar.settings.v1
```

When upgrading from the old package name `dsh-client-ui-scrollbar-tuner`, the plugin reads the legacy key once and migrates the value, so the saved width is preserved. Settings live in the renderer's `localStorage`; clearing site storage resets the width to 8px.

### Scope and limits

- The track and thumb widen together; the shipped thumb color, pill radius and hover color are kept.
- Horizontal scrollbars use the same variable and widen too.
- Components that hide their own scrollbar stay hidden by design.
- The plugin only changes a CSS variable: no host service, no network, no files.

### Compatibility

Target client **0.2.1-rc.2**. The plugin depends only on the theme's `--dsh-scrollbar-width` contract; if a future client renames it the plugin goes inert instead of breaking the layout.

### Development

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
```

---

## License

MIT. See [LICENSE](./LICENSE).

Not affiliated with DeepSeek. 与 DeepSeek 官方无隶属关系。
