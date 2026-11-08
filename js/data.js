/* ============================================================
   作品数据 —— 换作品、填链接只需要改这个文件
   ------------------------------------------------------------
   视频字段（任选其一）：
     embed: 外链播放器地址，优先使用
            B 站：https://player.bilibili.com/player.html?bvid=BV号&autoplay=0
     src:   本地视频文件，例如 "assets/media/ebc.mp4"
   cover:   封面图，例如 "assets/images/ebc.jpg"（可选，不填会自动生成）
   音频字段：
     src:   例如 "assets/media/voice-a-original.wav"
            留空时播放浏览器自动生成的示例音，只用于看效果
   ============================================================ */
window.SITE = {
  /* ---------- AI 创意广告宣传片 ---------- */
  ads: [
    {
      id: "ebc",
      title: "EBC 品牌宣传片",
      client: "EBC Financial Group",
      roles: ["创意策划", "编剧", "分镜", "声音设计"],
      duration: "",
      points: [
        "主导创意策划与脚本编写，完成分镜设计，确定全片叙事结构与镜头节奏。",
        "全片画面均由 AI 生成。",
        "独立完成配乐与音效设计：按音乐节奏规划画面节点，用声音强化情绪与品牌记忆点。"
      ],
      embed: "",
      src: "",
      cover: ""
    },
    {
      id: "ad-2",
      title: "AI 创意广告片（第二支，待补充）",
      client: "",
      roles: ["创意", "AI 生成", "剪辑", "声音设计"],
      duration: "",
      points: ["占位：替换为这支广告片的创意、你的分工和使用的工具。"],
      embed: "",
      src: "",
      cover: ""
    }
  ],

  /* ---------- 数字人：本人原声 vs 声音克隆 LoRA ---------- */
  voices: [
    {
      id: "spk-a",
      speaker: "说话人 A",
      account: "交易员cool",
      text: "占位：填入这段对比音频对应的口播文案。",
      original: { src: "", demo: { root: 45, scale: [0, 3, 7, 10], bpm: 92, wave: "triangle" } },
      lora: { src: "", demo: { root: 45, scale: [0, 3, 7, 12], bpm: 92, wave: "sine" } }
    },
    {
      id: "spk-b",
      speaker: "说话人 B",
      account: "Jimmy的美金日记",
      text: "占位：填入这段对比音频对应的口播文案。",
      original: { src: "", demo: { root: 50, scale: [0, 2, 5, 9], bpm: 100, wave: "triangle" } },
      lora: { src: "", demo: { root: 50, scale: [0, 2, 7, 9], bpm: 100, wave: "sine" } }
    }
  ],

  /* ---------- 数字人短视频产出流程 ----------
     media 里每一项是一个视频/图片位：type 为 "video" 或 "image" */
  pipeline: [
    {
      title: "素材采集",
      tools: ["本人授权"],
      desc: "每位说话人只需要 2 条口播视频。目前训练过 3 位说话人，都经过本人授权。",
      media: []
    },
    {
      title: "人声分离与转写",
      tools: ["人声分离", "Whisper"],
      desc: "去掉背景音只留人声，用 Whisper 转写后逐句质检，整理成干净的训练语料。",
      media: []
    },
    {
      title: "声音克隆 LoRA",
      tools: ["IndexTTS 2.5", "LoRA 微调"],
      desc: "在 IndexTTS 2.5 上搭建 LoRA 训练流程，3.8 分钟完成一位新说话人的训练。",
      media: [{ id: "step-voice-ui", type: "image", label: "训练界面", src: "" }]
    },
    {
      title: "听感调优",
      tools: ["情感控制", "本地 WebUI"],
      desc: "从音高、语速、停顿、音色对比原声和生成音频，反复调整情感与语速参数，沉淀出“口播”“闲聊”等场景预设。整套工具封装成本地 WebUI，可以离线部署。",
      media: []
    },
    {
      title: "唇周 LoRA 训练",
      tools: ["局部训练", "口型同步"],
      desc: "为两个账号的数字人分别训练唇周 LoRA，让口型跟上语音，面部看起来更真实。",
      media: [
        { id: "lip-before", type: "video", label: "训练前", embed: "", src: "" },
        { id: "lip-after", type: "video", label: "训练后", embed: "", src: "" }
      ]
    },
    {
      title: "数字人驱动",
      tools: ["数字人驱动"],
      desc: "用克隆的声音驱动数字人，生成口播画面。",
      media: [{ id: "dh-clip", type: "video", label: "口播片段", embed: "", src: "" }]
    },
    {
      title: "自动化剪辑与发布",
      tools: ["自研剪辑 skill", "字幕", "B-roll"],
      desc: "自研剪辑 skill 串起自动粗剪、字幕、AI 配音和 B-roll。两个账号的后期剪辑全部由这条流程产出。",
      media: [{ id: "dh-final", type: "video", label: "成片", embed: "", src: "" }]
    }
  ],

  /* ---------- 账号成果 ---------- */
  accounts: [
    { name: "交易员cool", from: "6 万", to: "9 万", note: "参与期间粉丝 +50%" },
    { name: "Jimmy的美金日记", from: "", to: "1.1 万", note: "参与期间粉丝增长至 1.1 万" }
  ],

  /* ---------- AI 音乐 ---------- */
  music: [
    { id: "m1", title: "AI 音乐作品一", subtitle: "占位：风格 / 用途", duration: "0:20", src: "", demo: { root: 45, scale: [0, 3, 7, 10, 12, 15], bpm: 84, wave: "triangle" } },
    { id: "m2", title: "AI 音乐作品二", subtitle: "占位：风格 / 用途", duration: "0:18", src: "", demo: { root: 52, scale: [0, 3, 5, 7, 10, 12], bpm: 120, wave: "sawtooth" } },
    { id: "m3", title: "AI 音乐作品三", subtitle: "占位：风格 / 用途", duration: "0:22", src: "", demo: { root: 48, scale: [0, 4, 7, 11, 12, 16], bpm: 96, wave: "square" } }
  ],

  /* ---------- 个人创意视觉短片（非项目） ---------- */
  shorts: [
    { id: "s1", title: "创意视觉短片一", note: "占位：一句话介绍", embed: "", src: "", cover: "" },
    { id: "s2", title: "创意视觉短片二", note: "占位：一句话介绍", embed: "", src: "", cover: "" }
  ]
};
