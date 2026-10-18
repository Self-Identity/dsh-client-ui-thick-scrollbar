# dsh-client-ui-thick-scrollbar

Global scrollbar thickness tuner for the DeepSeek Harness client: widen every scrollbar and adjust the width from the plugin page. 全局加粗 DSH 客户端滚动条，可在插件页调节宽度。

- Package name: `dsh-client-ui-thick-scrollbar`
- Display name: 滚动条加粗 / **Thick Scrollbars**
- Version: 1.0.0
- GitHub repository: [Yan-X-X/dsh-client-ui-scrollbar-tuner](https://github.com/Yan-X-X/dsh-client-ui-scrollbar-tuner) (the repository keeps its original name; only the package name changed)

[中文](#中文) · [English](#english)

---

## 中文

### 功能

DSH 主题插件用一组 body 级 CSS 变量绘制所有滚动条：

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

本插件把 `--dsh-scrollbar-width` 写成 `<body>` 的内联自定义属性，因此会话区、侧边栏、菜单、弹窗等所有使用官方滚动条样式的位置会一起加粗；关闭插件时移除内联属性，立即恢复官方 5px。插件不替换官方样式表，不改官方组件。

### 安装

1. 打开客户端左侧 **插件** 页。
2. 点 **添加插件**，填入源码目录绝对路径：

   ```text
   F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar
   ```

3. 安装后点 **立即启用**；若提示「改动在下次启动生效」，重启客户端。
4. 卡片显示 **已启用 / 已挂载** 即生效。

> 不要把插件源码或 junction 放进 `F:\DSH-Official\plugins`：客户端更新会递归清理该目录并跟随链接删除目标。源码只放在 `F:\plugins-for-dsh\<包名>`。
> 本机也可以用 `node F:\plugins-for-dsh\_tools\wire-profile.cjs` 把 desktop profile 接到源码目录。

### 调节宽度

1. 插件页 → **已安装插件** → 打开 `dsh-client-ui-thick-scrollbar` 的详情页。
2. 在描述与行列表之间会看到 **滚动条宽度 / Scrollbar width** 配置卡片。
3. 选择常用宽度（6 / 8 / 10 / 12 px），或在 **自定义宽度 / Custom width** 输入 4–20 之间的整数。
4. 点 **保存 / Save** 立即生效；点 **恢复默认 / Restore default** 回到 8px。

配置文案跟随客户端语言切换：中文界面显示中文，英文界面显示英文。

### 存储与迁移

当前存储键：

```text
dsh-client-ui-thick-scrollbar.settings.v1
```

从旧包名 `dsh-client-ui-scrollbar-tuner` 升级时，会读取旧键并在首次加载时迁移到新键，不需要重新设置宽度。配置存在当前客户端渲染进程的 `localStorage`，重启客户端后保留；换浏览器或清除站点存储会回到默认 8px。

### 范围与限制

- 加粗的是滚动条轨道宽度（滑块与轨道一起变宽），沿用官方主题的滑块颜色、圆角和 hover 变色。
- 横向滚动条也使用同一个变量，因此一起变粗。
- 个别组件显式隐藏了自己的滚动条（例如标签条使用 `scrollbar-width: none`），仍保持隐藏；这是组件自身行为。
- 插件只改 CSS 变量，不注册 Host 服务，不联网，不写文件。

### 升级与恢复

- 源码永久位置：`F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar`
- 不要在 `F:\DSH-Official\plugins` 里创建源码或 junction。
- 客户端升级后若插件显示 `missing`：先检查 desktop profile 的 `dependencies` / `dsh.profile.bundles`，再运行：

  ```bat
  F:\plugins-for-dsh\_tools\rescue.cmd -From git
  F:\plugins-for-dsh\_tools\rescue.cmd -From "<最近快照 zip>"
  ```

### 已验证 / 未验证

已验证：

- `cordis.patch.yml` / `package.json` 通过 `check-bundle.mjs`：problem=0，warning=0；
- `lib/index.js`、`lib/client.js` 通过 `node --check`；
- `tools/smoke.mjs` 覆盖默认值、存储恢复与夹取、旧存储键迁移、样式注入、配置卡片注册、中英文字典键集合、表单渲染、重置写回与卸载清理。

未验证：

- 新包名 `dsh-client-ui-thick-scrollbar` 尚未在桌面 GUI 里重新安装并肉眼确认；需要重新启用后确认。
- 未做高 DPI / 多显示器逐像素比对。

### 开发与测试

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
node "C:\Users\Yan\.dsh\skills\dsh-plugin-authoring\scripts\check-bundle.mjs" "F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar"
```

---

## English

### What it does

The shipped DSH theme paints every scrollbar from two body-level custom properties:

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

This plugin writes the chosen width as an inline custom property on `<body>`. Conversation panes, the sidebar, menus and dialogs therefore thicken together; disabling the plugin removes the inline property and the shipped 5px width returns. It does not replace the shipped stylesheet or patch official components.

### Install

1. Open **Plugins** in the DSH client sidebar.
2. Choose **Add plugin** and enter the absolute source path:

   ```text
   F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar
   ```

3. Install, then choose **Enable now**; restart the client if it says the change takes effect on the next start.
4. The card must read **Enabled / Mounted**.

> Never put plugin sources or junctions in `F:\DSH-Official\plugins`: the client updater recursively cleans that folder and follows links into their targets. Keep sources under `F:\plugins-for-dsh\<package>`.
> On this machine you can also run `node F:\plugins-for-dsh\_tools\wire-profile.cjs` to wire the desktop profile to the source home.

### Adjust the width

1. Plugins → **Installed plugins** → open `dsh-client-ui-thick-scrollbar`.
2. The **Scrollbar width / 滚动条宽度** card appears between the description and the row list.
3. Pick a preset (6 / 8 / 10 / 12 px) or type a custom value from 4 to 20.
4. Choose **Save / 保存** to apply immediately, or **Restore default / 恢复默认** to return to 8px.

All visible copy follows the client language: Chinese in a Chinese UI, English in an English UI.

### Storage and migration

Current storage key:

```text
dsh-client-ui-thick-scrollbar.settings.v1
```

When upgrading from the old package name `dsh-client-ui-scrollbar-tuner`, the plugin reads the legacy key once and migrates the value to the new key, so the saved width is preserved. Settings live in the renderer's `localStorage` and survive restarts; clearing site storage resets the width to 8px.

### Scope and limits

- The track and thumb widen together; the shipped thumb color, pill radius and hover color are kept.
- Horizontal scrollbars use the same variable and widen too.
- Components that hide their own scrollbar (for example a tab strip using `scrollbar-width: none`) stay hidden by design.
- The plugin only changes a CSS variable: no Host service, no network, no files.

### Upgrade and recovery

- Source home: `F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar`
- Never create sources or junctions under `F:\DSH-Official\plugins`.
- If the plugin shows `missing` after a client upgrade, first check the desktop profile's `dependencies` / `dsh.profile.bundles`, then run:

  ```bat
  F:\plugins-for-dsh\_tools\rescue.cmd -From git
  F:\plugins-for-dsh\_tools\rescue.cmd -From "<latest snapshot zip>"
  ```

### Verified / not verified

Verified:

- `cordis.patch.yml` / `package.json` pass `check-bundle.mjs`: problem=0, warning=0;
- `lib/index.js` and `lib/client.js` pass `node --check`;
- `tools/smoke.mjs` covers defaults, restore/clamp, legacy-key migration, style injection, config-card registration, zh/en dictionary key parity, form rendering, reset write-back and teardown cleanup.

Not verified:

- The new package name has not yet been reinstalled and visually confirmed in the desktop GUI; re-enable it and check once.
- High-DPI / multi-monitor pixel comparison is not covered.

### Development

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
node "C:\Users\Yan\.dsh\skills\dsh-plugin-authoring\scripts\check-bundle.mjs" "F:\plugins-for-dsh\dsh-client-ui-thick-scrollbar"
```

---

## License

MIT. See [LICENSE](./LICENSE).
