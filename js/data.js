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
  /* ---------- 下载简历（「关于我」照片下方的按钮） ----------
     src 留空：按钮可以点，但只提示「简历更新中」
     放好 PDF 后填上路径，例如 src: "assets/王炜锋-简历.pdf"，按钮就会直接下载 */
  resume: { src: "", filename: "王炜锋-简历.pdf", meta: "PDF · 一页" },
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

  /* ---------- 数字人：声音对比 ----------
     clips 里每一条是一段音频：kind 为 "real"（真人）或 "ai"（AI 生成），label 是按钮上的字 */
  voices: [
    {
      id: "spk-a",
      speaker: "说话人 A",
      account: "交易员cool",
      text: "先听她历史口播里的一段原声，再听 AI 用克隆声音念一段全新的文案：「对于本周大黄的前瞻啊，我可以用一句话来概括，这是一场多头趋势下的高位换手周……」",
      clips: [
        { kind: "real", label: "本人原声", src: "assets/media/cool-real.mp3", duration: "0:30" },
        { kind: "ai", label: "AI 生成", src: "assets/media/cool-ai.mp3", duration: "0:30" }
      ]
    },
    {
      id: "spk-b",
      speaker: "说话人 B",
      account: "Jimmy的美金日记",
      text: "先听 Jimmy 历史口播里的一段原声，再听 AI 用克隆声音念一段全新的文案：「最近大家都在问我，美元现在还能不能拿，那今天我们就简单聊一下……」",
      clips: [
        { kind: "real", label: "本人原声", src: "assets/media/jimmy-real-1.mp3", duration: "0:30" },
        { kind: "ai", label: "AI 生成", src: "assets/media/jimmy-ai.mp3", duration: "0:23" }
      ]
    }
  ],

  /* ---------- 数字人短视频产出流程（网页上是可点击的分步面板） ----------
     每一步：
       panel:   操作面板截图（中间大图），填 src 即可，例如 "assets/images/step3-panel.png"
                没有操作界面的步骤改成文字：{ type: "text", label: "标题", points: [["小标题", "说明"], ...] }
       results: 这一步的效果（右边），可以放多个，会出现切换按钮
                type: "video"（填 embed 或 src） / "image"（填 src） / "audio"（填 src） */
  pipeline: [
    {
      title: "素材采集",
      short: "素材采集",
      tools: ["自研采集 skill", "抖音 / 小红书 / Instagram", "本人授权"],
      desc: "以「交易员cool」为例。用自研的采集 skill，从说话人在抖音、小红书、Instagram 上的历史视频里批量取出音频，攒够约 60 分钟口播素材。本地 WebUI 里也能直接贴抖音主页链接、扫码登录后一键下载。所有说话人都经过本人授权。",
      panel: { id: "p1-panel", label: "WebUI · 从抖音主页下载", src: "assets/images/webui-collect.jpg" },
      results: [{ id: "p1-raw", type: "audio", label: "历史视频原声（含背景音乐）", src: "assets/media/cool-raw-bgm.mp3" }]
    },
    {
      title: "人声分离与转写",
      short: "分离转写",
      tools: ["Demucs 人声分离", "Whisper 转写", "逐句质检"],
      desc: "去掉背景音乐只留人声，再切片、转写成文字并逐句质检，整理成干净的训练语料。WebUI 里一个按钮自动跑完：去伴奏挑选 → 切片 → 转录 → 特征提取 → 训练。",
      panel: { id: "p2-panel", label: "WebUI · 训练说话人（一键预处理）", src: "assets/images/webui-train.jpg" },
      results: [
        { id: "p2-before", type: "audio", label: "分离前", src: "assets/media/cool-raw-bgm.mp3" },
        { id: "p2-after", type: "audio", label: "纯人声", src: "assets/media/cool-vocals.mp3" }
      ]
    },
    {
      title: "声音克隆 LoRA",
      short: "声音 LoRA",
      tools: ["IndexTTS 2.5", "LoRA 微调"],
      desc: "在 IndexTTS 2.5 上做 LoRA 微调，训练完自动登记成可选的说话人模型。cool 的模型能直接念任何新文案，配音中文字错率 3.4%。",
      panel: { id: "p3-panel", label: "WebUI · 已训练的说话人模型", src: "assets/images/webui-speakers.jpg" },
      results: [{ id: "p3-gen", type: "audio", label: "LoRA 念新文案", src: "assets/media/cool-ai.mp3" }]
    },
    {
      title: "听感调优",
      short: "听感调优",
      tools: ["情感控制", "语速 / 停顿", "本地 WebUI"],
      desc: "从音高、语速、停顿、音色对比原声和生成音频，反复调整情感权重和语速参数，沉淀出「口播」「闲聊」等场景预设。还做了「真人开头 + AI」模式：前 10 秒保留真人原声，后面无缝接 AI 念的文案。整套工具封装成本地 WebUI，可以离线部署。",
      panel: { id: "p4-panel", label: "WebUI · 文本配音参数", src: "assets/images/webui-tts.jpg" },
      results: [
        { id: "p4-opening", type: "audio", label: "前 10 秒真人 + 后面 AI", src: "assets/media/cool-opening-ai.mp3" },
        { id: "p4-ai", type: "audio", label: "纯 AI 段", src: "assets/media/cool-ai.mp3" }
      ]
    },
    {
      title: "唇周 LoRA 训练",
      short: "唇周 LoRA",
      tools: ["局部训练", "口型同步"],
      desc: "单独训练嘴部区域的 LoRA，让口型跟上语音，面部看起来更真实。这一步没有操作界面，右边是从口播片段和成片里截出来的嘴部特写。",
      panel: {
        type: "text", label: "局部拆解：看哪里",
        points: [
          ["开合幅度", "嘴型张合跟着字音走，不是一直同一个幅度地开合。"],
          ["闭唇音", "b / p / m 这类音要先闭嘴再张开，最容易露馅。"],
          ["唇齿细节", "说话时牙齿和舌头的露出要自然，不糊成一片。"],
          ["和画面衔接", "嘴部区域和脸、下巴的过渡没有明显边界。"]
        ]
      },
      results: [
        { id: "lip-1028", type: "video", label: "口播片段 · 嘴部", src: "assets/media/lip-1028.mp4" },
        { id: "lip-final", type: "video", label: "成片 · 嘴部", src: "assets/media/lip-final.mp4" }
      ]
    },
    {
      title: "数字人驱动",
      short: "数字人驱动",
      tools: ["数字人驱动"],
      desc: "用克隆的声音驱动数字人，生成整段口播画面。这里是还没剪辑的原始口播片段。",
      panel: {
        type: "text", label: "这一步做了什么",
        points: [
          ["输入", "第 3、4 步生成的 cool 配音。"],
          ["输出", "整段口播画面，口型来自第 5 步的唇周模型。"],
          ["右边视频", "未加字幕和卡片的原始口播，约 1 分钟。"]
        ]
      },
      results: [{ id: "dh-clip", type: "video", label: "口播片段（未剪辑）", src: "assets/media/cool-1028.mp4", cover: "assets/media/cool-1028.jpg" }]
    },
    {
      title: "自动化剪辑与发布",
      short: "剪辑发布",
      tools: ["自研剪辑 skill", "字幕", "数据卡片", "B-roll"],
      desc: "自研剪辑 skill 串起自动粗剪、字幕、AI 配音和 B-roll。两个账号的后期剪辑全部由这条流程产出。右边是 cool 11 月 6 日发布的成片。",
      panel: {
        type: "text", label: "成片里加了什么",
        points: [
          ["粗剪", "自动去掉停顿和口误，保留节奏。"],
          ["字幕", "逐句字幕，关键数字高亮。"],
          ["数据卡片", "金价、非农等数据做成卡片穿插在口播中。"],
          ["B-roll", "按文案内容插入辅助画面。"]
        ]
      },
      results: [{ id: "dh-final", type: "video", label: "成片（11 月 6 日发布）", src: "assets/media/cool-final.mp4", cover: "assets/media/cool-final.jpg" }]
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
