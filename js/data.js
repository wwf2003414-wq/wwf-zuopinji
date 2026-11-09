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

  /* ---------- 数字人短视频产出流程（网页上是可点击的分步面板） ----------
     每一步：
       panel:   操作面板截图（左边大图），填 src 即可，例如 "assets/images/step3-panel.png"
       results: 这一步的效果（右边），可以放多个，会出现切换按钮
                type: "video"（填 embed 或 src） / "image"（填 src） / "audio"（填 src） */
  pipeline: [
    {
      title: "素材采集",
      short: "素材",
      tools: ["本人授权"],
      desc: "每位说话人只需要 2 条口播视频。目前训练过 3 位说话人，都经过本人授权。",
      panel: { id: "p1-panel", label: "素材整理", src: "" },
      results: [{ id: "p1-raw", type: "video", label: "原始口播素材", embed: "", src: "" }]
    },
    {
      title: "人声分离与转写",
      short: "分离转写",
      tools: ["人声分离", "Whisper"],
      desc: "去掉背景音只留人声，用 Whisper 转写后逐句质检，整理成干净的训练语料。",
      panel: { id: "p2-panel", label: "分离 / 转写界面", src: "" },
      results: [
        { id: "p2-before", type: "audio", label: "分离前", src: "" },
        { id: "p2-after", type: "audio", label: "纯人声", src: "" }
      ]
    },
    {
      title: "声音克隆 LoRA",
      short: "声音 LoRA",
      tools: ["IndexTTS 2.5", "LoRA 微调"],
      desc: "在 IndexTTS 2.5 上搭建 LoRA 训练流程，3.8 分钟完成一位新说话人的训练。",
      panel: { id: "p3-panel", label: "训练界面", src: "" },
      results: [{ id: "p3-gen", type: "audio", label: "LoRA 生成试听", src: "" }]
    },
    {
      title: "听感调优",
      short: "听感调优",
      tools: ["情感控制", "本地 WebUI"],
      desc: "从音高、语速、停顿、音色对比原声和生成音频，反复调整情感与语速参数，沉淀出“口播”“闲聊”等场景预设。整套工具封装成本地 WebUI，可以离线部署。",
      panel: { id: "p4-panel", label: "本地 WebUI", src: "" },
      results: [
        { id: "p4-before", type: "audio", label: "调优前", src: "" },
        { id: "p4-after", type: "audio", label: "调优后", src: "" }
      ]
    },
    {
      title: "唇周 LoRA 训练",
      short: "唇周 LoRA",
      tools: ["局部训练", "口型同步"],
      desc: "为两个账号的数字人分别训练唇周 LoRA，让口型跟上语音，面部看起来更真实。",
      panel: { id: "p5-panel", label: "训练界面", src: "" },
      results: [
        { id: "lip-before", type: "video", label: "训练前", embed: "", src: "" },
        { id: "lip-after", type: "video", label: "训练后", embed: "", src: "" }
      ]
    },
    {
      title: "数字人驱动",
      short: "数字人驱动",
      tools: ["数字人驱动"],
      desc: "用克隆的声音驱动数字人，生成口播画面。",
      panel: { id: "p6-panel", label: "驱动界面", src: "" },
      results: [{ id: "dh-clip", type: "video", label: "口播片段", embed: "", src: "" }]
    },
    {
      title: "自动化剪辑与发布",
      short: "剪辑发布",
      tools: ["自研剪辑 skill", "字幕", "B-roll"],
      desc: "自研剪辑 skill 串起自动粗剪、字幕、AI 配音和 B-roll。两个账号的后期剪辑全部由这条流程产出。",
      panel: { id: "p7-panel", label: "剪辑 skill 运行", src: "" },
      results: [{ id: "dh-final", type: "video", label: "成片", embed: "", src: "" }]
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
