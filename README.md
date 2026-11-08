# 王炜锋 — AI 视频作品集

AIGC 视频作品集网站。纯静态页面（HTML + CSS + JS），不需要安装依赖、不需要构建，双击 `index.html` 就能打开。

## 页面结构

1. **首页**：可互动的波形开屏（鼠标拨动、点击发脉冲）
2. **AI 创意广告片**：两支广告片，大图 + 分工 + 要点
3. **拟真数字人**：关键指标 → 本人原声 vs LoRA 声音对比 → 7 步产出流程（含唇周 LoRA 前后对比）→ 账号成果
4. **更多**：AI 音乐 + 个人创意视觉短片
5. **关于**：照片、简介、专业技能、经历
6. **联系**：邮箱

## 替换内容：只改 `js/data.js`

| 版块 | 字段 | 填什么 |
| --- | --- | --- |
| 广告片 `ads` | `embed` 或 `src`、`cover` | B 站嵌入链接或本地视频；封面图 |
| 声音对比 `voices` | `original.src`、`lora.src`、`text` | 本人原声、LoRA 生成音频、对应文案 |
| 产出流程 `pipeline` | 每一步的 `media` | 过程截图（`type: "image"`）或视频片段（`type: "video"`），可加可删 |
| AI 音乐 `music` | `src`、`title`、`subtitle`、`duration` | 音频文件和信息 |
| 视觉短片 `shorts` | `embed` 或 `src`、`cover`、`note` | 视频和一句话介绍 |

- 没填媒体的位置会显示「待上传」和自动生成的占位封面；没填 `src` 的音频会播放示例音。
- B 站嵌入链接：`https://player.bilibili.com/player.html?bvid=BV号&autoplay=0`
- 文件放进 `assets/media/`（音视频）和 `assets/images/`（图片）。单个文件建议小于 50MB，GitHub 上限是 100MB；大视频建议先传 B 站再用 `embed`。

个人简介、技能、经历、联系方式在 `index.html` 里直接改。

## 部署上线（仓库保持私有）

免费 GitHub 的私有仓库不能用 GitHub Pages，可以用下面的平台，都支持私有仓库，每次 push 后自动更新：

**Vercel**：用 GitHub 登录 https://vercel.com → Add New → Project → 选 `wwf-zuopinji` → Framework Preset 选 Other → Deploy

**Netlify**：用 GitHub 登录 https://app.netlify.com → Add new site → Import from GitHub → 选 `wwf-zuopinji` → Build command 留空，Publish directory 填 `.` → Deploy

## 文件结构

```
index.html          页面结构和个人信息
css/style.css       基础样式（配色、导航、开屏、播放器）
css/components.css  各版块样式（广告片、数字人、音乐、短片）
js/data.js          作品数据（最常改的文件）
js/hero.js          开屏互动波形
js/player.js        底部音频播放器
js/demo-audio.js    占位音频生成
js/main.js          各版块渲染、导航、视频弹窗
assets/             图标、照片、媒体文件
```
