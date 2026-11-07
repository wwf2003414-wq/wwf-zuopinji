/* ============================================================
   作品数据 —— 只需要改这个文件就能更新作品集
   ------------------------------------------------------------
   type:   "audio" 或 "video"
   src:    音频/视频文件路径，例如 "assets/media/xxx.mp3"
           音频留空时会播放自动生成的示例音
   embed:  视频外链播放器地址（B 站 / YouTube 嵌入链接），优先于 src
           B 站示例：https://player.bilibili.com/player.html?bvid=BV1xxxxxxx&autoplay=0
   cover:  封面图路径（可选），例如 "assets/images/xxx.jpg"
   featured: true 的那一条会显示在列表上方的大卡片里
   ============================================================ */
window.WORKS = [
  {
    id: "rust-harbor",
    type: "audio",
    title: "锈港 · 主题曲",
    subtitle: "独立游戏《示例项目》标题画面音乐",
    date: "2026-09-12",
    duration: "0:24",
    desc: "工业废墟里的一段旋律：低频铁皮共振打底，钢琴和弦乐慢慢浮上来。占位描述，换成你的创作思路。",
    src: "",
    cover: "",
    featured: true,
    demo: { root: 45, scale: [0, 3, 7, 10, 12, 15], bpm: 84, wave: "triangle" }
  },
  {
    id: "night-rain",
    type: "audio",
    title: "夜雨巡逻",
    subtitle: "环境音设计 · 城市雨夜",
    date: "2026-06-03",
    duration: "0:20",
    desc: "",
    src: "",
    demo: { root: 50, scale: [0, 2, 5, 7, 9, 12], bpm: 70, wave: "sine" }
  },
  {
    id: "short-film",
    type: "video",
    title: "《回声》短片声音设计",
    subtitle: "毕业短片 · 声音设计与混音",
    date: "2025-12-20",
    duration: "6:40",
    desc: "",
    embed: "",
    src: "",
    cover: ""
  },
  {
    id: "signal-lost",
    type: "audio",
    title: "失联信号",
    subtitle: "电子 · 节奏型配乐",
    date: "2025-08-17",
    duration: "0:18",
    desc: "",
    src: "",
    demo: { root: 52, scale: [0, 3, 5, 7, 10, 12], bpm: 120, wave: "sawtooth" }
  },
  {
    id: "trailer-cut",
    type: "video",
    title: "游戏 PV 剪辑与配乐",
    subtitle: "剪辑 · 音乐 · 音效",
    date: "2025-04-02",
    duration: "1:32",
    desc: "",
    embed: "",
    src: ""
  },
  {
    id: "voice-reel",
    type: "audio",
    title: "配音与对白处理合集",
    subtitle: "降噪 · 对白剪辑 · 空间处理",
    date: "2024-11-09",
    duration: "0:22",
    desc: "",
    src: "",
    demo: { root: 48, scale: [0, 4, 7, 11, 12, 16], bpm: 96, wave: "square" }
  }
];
