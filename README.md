# 王炜锋 — AI 视频作品集

作品集包含 AI 创意广告片、拟真数字人和 AI 音乐。个人简介、简历下载与联系方式也在网站上。[查看公开作品集](https://wwf2003414-wq.github.io/wwf-zuopinji/)

## 文件结构

```
index.html          首页、个人简介、简历入口和联系方式
css/                字体声明、页面样式和组件样式
js/
  data.js           广告片、拟真数字人和音乐的作品数据
  main.js           作品渲染、导航和视频弹窗
  player.js         底部音频播放器
  demo-audio.js     示例音频
  fx.js             页面动效
assets/
  documents/        简历 PDF
  images/           个人照片和流程截图
  media/            作品视频、音频和封面
  fonts/            自托管字体
  favicon.svg       网站图标
```

## 更新内容

| 内容 | 更新位置 |
| --- | --- |
| 简介、技能、经历和联系方式 | `index.html` |
| 下载简历 | 替换 `assets/documents/aigc-director-wang-weifeng.pdf`。文件路径或下载文件名有变化时，同步修改 `index.html` 中的简历链接。 |
| 创意广告片 | 在 `js/data.js` 的 `ads` 中改标题、简介、封面与视频。用 `src` 引用仓库内视频，或用 `embed` 填写站外播放器地址。 |
| 拟真数字人 | 在 `js/data.js` 的 `voices`、`pipeline` 和 `accounts` 中维护声音对比、制作流程和账号成果。 |
| AI 音乐 | 在 `js/data.js` 的 `music` 中改曲名、音频地址和时长。 |

## 预览与发布

本地双击 `index.html` 即可预览，网站使用 HTML、CSS 和 JavaScript。GitHub Pages 从 `main` 分支的根目录部署，提交到 `main` 后会自动更新公开网站。[查看部署记录](https://github.com/wwf2003414-wq/wwf-zuopinji/actions)

## 字体

字体文件放在仓库里，国内网络打不开 Google 也能正常显示。中文字体按字符切成约 100 片，浏览器只下载页面上用到的那几片（首次打开约 2 MB，之后走缓存）；所有常用汉字都已包含，以后改文案、加新字不需要重新处理字体。三款字体都是 SIL Open Font License 1.1，可以免费商用和自托管。

## 视觉特效

`js/fx.js` 里的特效移植自 [React Bits](https://reactbits.dev)（MIT + Commons Clause，© David Haz），改写成不依赖 React 的原生 JS，所以网页仍然可以直接双击打开。用法是在 HTML 元素上加属性：

| 属性 / class | 效果 |
| --- | --- |
| `data-rays` | 放映光束背景（LightRays），可加 `data-origin="bottom-center"`、`data-color` |
| `data-decrypt` / `data-decrypt="view"` | 乱码解码浮现（开屏后 / 滚动到时） |
| `data-marquee` | 跑马灯，滚动越快走得越快（ScrollVelocity） |
| `class="spot"` | 鼠标经过时的聚光灯（SpotlightCard） |
| `class="tilt"` | 3D 倾斜 + 反光（TiltedCard） |
| `data-count` | 数字从 0 滚到原值（CountUp） |
