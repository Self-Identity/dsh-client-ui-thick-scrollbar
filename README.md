# dsh-client-ui-scrollbar-tuner

为 DSH 官方桌面端（也是同一套 Web 客户端）**全局加粗滚动条**的极简插件：默认 8px，可在插件页自由调节（4–20px），保存后立即生效并在本机持久化。

## 它做什么

官方主题插件用一组 body 级 CSS 变量绘制所有滚动条：

```css
body { --dsh-scrollbar-width: 5px; }
::-webkit-scrollbar { width: var(--dsh-scrollbar-width); }
```

本插件把 `--dsh-scrollbar-width` 写成 `<body>` 的内联自定义属性（内联优先级高于主题的 body 规则），因此：

- 会话区、侧边栏、菜单、弹窗等**全部使用官方滚动条样式的位置**统一加粗；
- 不改官方组件、不替换样式表、不做选择器覆盖战；
- 关闭插件时移除内联属性，滚动条立即恢复官方 5px。

## 安装（官方桌面端）

1. 打开客户端左侧 **插件** 页。
2. 点 **添加插件**，填入本目录的绝对路径：

   ```text
   F:\DSH-Official-Plugins\dsh-client-ui-scrollbar-tuner
   ```

3. 确认识别出的包名与简介，点 **安装**。
4. 安装完成后点 **立即启用**；若提示「改动在下次启动生效」，重启客户端。
5. 卡片开关显示 **已启用**、状态显示 **已挂载**，即生效。

> 官方桌面端的 profile 由 Electron 管理，只能用插件页安装/启停；不要用 `dsh plugin --profile desktop` 改它。

## 调节滚动条粗细

1. 插件页 → **已安装插件** → 打开本插件（`dsh-client-ui-scrollbar-tuner`）的详情页。
2. 在描述与行列表之间会看到 **滚动条宽度** 配置卡片。
3. 选择常用宽度（6 / 8 / 10 / 12 px），或在 **自定义宽度** 输入 4–20 之间的整数。
4. 点 **保存**，所有滚动条立即变成新宽度；点 **恢复默认** 回到 8px。

配置存在当前客户端渲染进程的 `localStorage`：

```text
dsh-client-ui-scrollbar-tuner.settings.v1
```

- 重启客户端后保留；
- 换浏览器/清除该站点的存储会回到默认 8px；
- 不做跨机器同步。

## 范围与限制

- 加粗的是**滚动条轨道宽度**（滑块与轨道一起变宽），沿用官方主题的滑块颜色、圆角和 hover 变色。
- 横向滚动条也使用同一个变量，因此一起变粗。
- 个别组件若显式隐藏了自己的滚动条（例如标签条使用 `scrollbar-width: none`），仍保持隐藏——这是组件自身行为，本插件不强行改写。
- 插件只改 CSS 变量，不注册 Host 服务，不联网，不写文件。

## 已验证 / 未验证

已验证（本机离线）：

- `package.json` / `cordis.patch.yml` 通过 `check-bundle.mjs`：problem=0，warning=0；
- `lib/index.js`、`lib/client.js` 通过 `node --check`；
- `tools/smoke.mjs` 在 Node VM 中以伪 DOM / 伪 React / 伪 slots+locale 启动浏览器半区，覆盖：默认 8px、存储值恢复与 4–20 夹取、损坏存储回退、样式注入、`plugins.bundle.config` 以包名为 key 注册、中英文字典键集合一致、表单控件与摘要渲染、重置写回存储与 body、卸载清理。

未验证：

- 未在官方桌面端 GUI 里实际安装并肉眼确认滚动条观感（需要用户在插件页安装后确认）；
- 未做多显示器缩放/高 DPI 的逐像素比对；
- 未测试与其它改写 `--dsh-scrollbar-width` 的插件同时启用时的优先级（本插件写入 body 内联属性，通常优先级最高）。

## 卸载

插件页 → 本插件 → 关闭开关或卸载。关闭即移除 body 上的宽度覆盖，滚动条恢复官方 5px；`localStorage` 中的宽度记录会保留，重装后继续使用。

## 升级注意

官方客户端升级会清空 `F:\DSH-Official\plugins` 目录（实测）。**不要**在这个目录里放插件源码，也不要放指向源码的 junction：更新器会递归清理安装目录，并跟随 junction 进入源码目录，2026-10-17 的实际升级就是这样把 4 个插件的源码清空的。

正确做法：插件源码只放在 `F:\DSH-Official-Plugins\<包名>`；插件页「添加插件」时直接填这个源码路径，desktop profile 会记成 `link:F:/DSH-Official-Plugins/<包名>`，更新器只动 `F:\DSH-Official`，碰不到源码。

升级后如果插件页显示 `missing` 或未启用：

1. 确认源码目录仍在 `F:\DSH-Official-Plugins`；
2. 在插件页用上面的源码路径重新添加/启用；
3. 不要重建 junction，也不要把源码复制到 `F:\DSH-Official\plugins`。

## 开发与测试

```powershell
node --check lib/index.js
node --check lib/client.js
node tools/smoke.mjs
node "C:\Users\Yan\.dsh\skills\dsh-plugin-authoring\scripts\check-bundle.mjs" "F:\DSH-Official-Plugins\dsh-client-ui-scrollbar-tuner"
```

## 文件结构

```text
dsh-client-ui-scrollbar-tuner/
├── package.json          # bundle 清单 + dsh.client 浏览器半区声明
├── cordis.patch.yml      # 插入一行，承接 Host 半区与浏览器半区
├── lib/
│   ├── index.js          # Host 半区：空实现
│   └── client.js         # 浏览器半区：宽度应用 + 插件页配置表单
├── locale/{zh,en}.json   # 插件页标题/简介
├── tools/smoke.mjs       # 离线冒烟测试
├── icon.svg
└── README.md
```
