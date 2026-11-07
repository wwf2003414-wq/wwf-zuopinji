# SISI.NB — 个人作品集

声音与影像作品集网站。纯静态页面（HTML + CSS + JS），不需要安装任何依赖、不需要构建。

## 本地预览

直接双击 `index.html` 用浏览器打开即可。

## 更新内容

| 想改什么 | 改哪里 |
| --- | --- |
| 作品列表（音频 / 视频） | `js/data.js` |
| 名字、简介、经历、工具 | `index.html` 里的「关于」部分 |
| 邮箱和社交链接 | `index.html` 里的「联系」部分 |
| 颜色和字体 | `css/style.css` 顶部的 `:root` 变量 |
| 开屏互动波形 | `js/hero.js` |

### 添加一条作品

在 `js/data.js` 的 `WORKS` 数组里加一项：

```js
{
  id: "my-new-track",          // 唯一英文 id
  type: "audio",               // "audio" 或 "video"
  title: "作品标题",
  subtitle: "一句话说明",
  date: "2026-11-07",
  duration: "3:20",
  desc: "主推卡片里显示的介绍（可选）",
  src: "assets/media/my-new-track.mp3",  // 音频/视频文件
  embed: "",                   // 视频可填 B 站嵌入链接，优先于 src
  cover: "assets/images/my-new-track.jpg", // 封面（可选）
  featured: false              // true = 显示在列表上方的大卡片
}
```

- 音频 `src` 留空时会播放浏览器自动生成的示例音，方便先看效果。
- B 站嵌入链接格式：`https://player.bilibili.com/player.html?bvid=BV号&autoplay=0`
- 媒体文件放进 `assets/media/`，图片放进 `assets/images/`。单个文件建议小于 50MB（GitHub 限制 100MB）；大视频建议传到 B 站后用 `embed`。

## 部署上线（仓库保持私有）

GitHub 免费账号的私有仓库不能用 GitHub Pages，可以用下面任意一个平台，它们都支持私有仓库、免费，且每次 push 后自动更新：

**Vercel**
1. 用 GitHub 账号登录 https://vercel.com
2. Add New → Project → 选择 `sisi-nb` 仓库（第一次需要授权访问私有仓库）
3. Framework Preset 选 **Other**，其他都不用改，点 Deploy

**Netlify**
1. 用 GitHub 账号登录 https://app.netlify.com
2. Add new site → Import an existing project → GitHub → 选择 `sisi-nb`
3. Build command 留空，Publish directory 填 `.`，点 Deploy

**国内访问更快的选择**：腾讯云 EdgeOne Pages、阿里云 OSS 静态托管也都可以直接上传这个文件夹。

## 文件结构

```
index.html          页面结构
css/style.css       样式
js/data.js          作品数据（最常改的文件）
js/hero.js          开屏互动波形
js/player.js        底部音频播放器
js/demo-audio.js    占位作品的示例音生成
js/main.js          列表、筛选、导航、视频弹窗
assets/             图标、图片、媒体文件
```
