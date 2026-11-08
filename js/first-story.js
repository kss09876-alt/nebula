// One continuous exhibition. Visuals, sound, and interactions are supplied by the renderer.
export const FIRST_IDS = ['g001', 'c001', 'c002', 'c003'];
export const FIRST_STORY_REV = 'daily-wanderer-2';

const STORIES = {
  ko: {
    title: '우리는 우주의 방랑자',
    subtitle: "오늘의 한순간에서 우주를 지나, 다시 일상으로",
    summary: "한 사람의 오늘에서 성운과 별, 몸의 물질을 지나 다시 일상으로 돌아오는 아홉 장면의 연속 서사.",
    artist: 'NEBULA',
    period: '상시 전시',
    playText: "가까운 하루에서 출발해 오래된 우주의 물질을 따라갑니다.",
    playHow: "이야기를 천천히 따라가며 빛을 상상하거나 잠시 머물고, 원한다면 사라지는 흔적을 남겨 보세요. 참여하지 않고 읽기만 해도 괜찮습니다.",
    scenes: [
      {
        id: "today",
        eyebrow: "01 · 오늘의 한순간",
        title: "가까운 곳에서 시작합니다",
        paragraphs: [
          "오늘, 한 사람이 물 한 잔을 곁에 두고 잠시 머뭅니다. 컵 가장자리에 빛이 닿고, 멀리서 생활의 작은 소리가 들립니다. 별다른 일이 없어도 하루는 흘러갑니다.",
          "당신의 오늘은 이 장면과 달라도 괜찮습니다. 지금 당신을 둘러싼 빛과 고요 속에서 한 가지를 묻습니다. 이렇게 가까운 물질은 먼 우주와 어떤 이야기를 나누고 있을까요?"
        ],
        interaction: null
      },
      {
        id: "nebula",
        eyebrow: "02 · 먼 구름을 향해",
        title: "NEBULA, 성운이라는 이름",
        paragraphs: [
          "그 물음을 따라 아주 먼 곳을 바라봅니다. NEBULA는 성운, 곧 우주에 펼쳐진 기체와 먼지의 거대한 구름을 뜻합니다. 눈에 보이는 별들 사이에도 이런 구름이 있습니다.",
          "어떤 성운에서는 새로운 별이 태어나고, 어떤 성운은 수명을 다한 별이 남긴 잔해입니다. 시작과 끝이 한 하늘에 놓인 듯한 이 구름에, 잠시 마음을 기울여 보세요."
        ],
        interaction: "tilt"
      },
      {
        id: "gravity",
        eyebrow: "03 · 서로 가까이",
        title: "흩어진 것이 모일 때",
        paragraphs: [
          "그 구름의 일부에서는 중력이 흩어진 기체와 먼지를 서로 끌어당깁니다. 물질이 모여 더 빽빽해지고, 수축하는 중심부는 점점 뜨거워집니다.",
          "아직 빛나는 별은 아니지만, 멀리 떨어져 있던 것들이 가까워지고 있습니다. 흩어진 빛을 마음속에 천천히 모으며 그 오랜 시간을 상상해 보세요."
        ],
        interaction: "gather"
      },
      {
        id: "star",
        eyebrow: "04 · 빛이 태어나는 시간",
        title: "하나의 별이 밝아집니다",
        paragraphs: [
          "중심이 충분히 뜨겁고 조밀해지면 수소 원자핵이 합쳐져 헬륨이 되는 핵융합이 시작됩니다. 그때 나오는 에너지로 새 별은 빛납니다.",
          "별이 우리처럼 숨을 쉬는 것은 아닙니다. 원한다면 한 번의 숨을 따라, 어둠 속에서 시작되는 빛을 가만히 상상해 보세요. 그 빛이 태어나기까지는 긴 시간이 걸렸습니다."
        ],
        interaction: "breath"
      },
      {
        id: "elements",
        eyebrow: "05 · 오래된 재료",
        title: "먼 별이 남긴 것",
        paragraphs: [
          "우리 몸의 탄소와 산소, 철을 비롯한 많은 원소는 이전 세대의 별에서 만들어졌고, 여러 과정을 거쳐 우주로 퍼졌습니다. 그 오래된 물질이 오늘의 우리에게 닿은 것입니다.",
          "모든 재료가 별에서 만들어진 것은 아닙니다. 수소와 헬륨의 대부분은 초기 우주에서 생겨났습니다. 한 번의 숨에도 아주 오래된 물질의 역사가 깃들어 있습니다."
        ],
        interaction: null
      },
      {
        id: "home",
        eyebrow: "06 · 움직이는 집",
        title: "우리가 머무는 지구도",
        paragraphs: [
          "이 오랜 물질을 품은 지구는 스스로 돌고, 태양 주위를 돕니다. 몸이 머문 자리가 고요하게 느껴지는 지금도 우리가 사는 집은 우주를 움직이고 있습니다.",
          "그 위에서 한 사람은 물을 마시고, 누군가는 창밖을 바라봅니다. 서로 다른 하루들이 같은 움직임을 타고 이어집니다. 처음의 작은 장면도 이 여정의 바깥에 있지 않습니다."
        ],
        interaction: null
      },
      {
        id: "pause",
        eyebrow: "07 · 잠시 머물기",
        title: "서두르지 않아도 되는 순간",
        paragraphs: [
          "여기서 잠시 멈추기를 선택해도 좋습니다. 무언가를 이루거나 특별한 기분이 되어야 하는 시간은 아닙니다. 그저 지금의 하루가 당신 곁에 있다는 것을 느껴 보세요.",
          "우리에게 닿은 시간은 너무 길고, 한 사람의 하루는 짧습니다. 그렇다고 이 순간이 작아지는 것은 아닙니다. 잠시 머문 뒤 바로 지나가도 괜찮습니다."
        ],
        interaction: "pause"
      },
      {
        id: "trace",
        eyebrow: "08 · 나만의 표시",
        title: "잠깐 머문 자리에",
        paragraphs: [
          "원한다면 이 순간을 위해 작은 흔적 하나를 남겨 보세요. 그것은 답을 적는 일도, 누군가에게 보여 주어야 하는 기록도 아닙니다. 당신만의 조용한 표시입니다.",
          "흔적은 지금 이 화면에만 잠시 머물며 전송되거나 저장되지 않습니다. 아무것도 남기지 않아도 괜찮습니다. 보이지 않는 머무름도 이 이야기의 한 부분입니다."
        ],
        interaction: "trace"
      },
      {
        id: "wanderer",
        eyebrow: "09 · 다시 오늘로",
        title: "우리는 우주의 방랑자",
        paragraphs: [
          "이제 처음의 일상으로 돌아갑니다. 물 한 모금, 다음에 바라볼 풍경, 또는 당신이 이어 갈 평범한 순간이 기다립니다. 지구는 그 사이에도 움직이고 있습니다.",
          "우리는 그런 우리를 우주의 방랑자라고 불러 봅니다. 이것은 과학적 분류가 아니라, 익숙한 오늘을 조금 다른 눈으로 바라보자는 초대입니다. 당신의 다음 순간은 이미 우주 안에 있습니다."
        ],
        interaction: null
      }
    ],
    ui: {
      home: '전시 목록으로',
      back: '돌아가기',
      soundOn: '소리 켜기',
      soundOff: '소리 끄기',
      motionLabel: '화면 움직임',
      motionSystem: '기기 설정 따르기',
      motionOn: '움직임 켜기',
      motionOff: '움직임 줄이기',
      progressLabel: '여정 진행',
      scrollCue: '아래로 천천히 이어집니다',
      start: '여정 시작하기',
      chapterPrefix: '장면',
      gatherButton: '빛 모으기',
      gatherAgain: '다시 모으기',
      gatherHint: '빛을 모으며 별의 시작을 상상해 보세요.',
      gathered: '흩어진 빛이 하나로 모였습니다.',
      traceLabel: '나의 작은 흔적',
      traceHint: '원하는 곳을 누르거나 버튼으로 흔적을 남겨 보세요.',
      traceAdd: '흔적 남기기',
      traceReset: '흔적 지우기',
      traceCount: '{n}개의 흔적',
      traceDone: '지금 이 화면에 작은 흔적을 남겼습니다.',
      quiet: '참여하지 않고 조용히 읽어도 괜찮습니다.',
      afterword: '여정을 마치며',
      sources: '이야기의 과학적 바탕',
      sourcesNote: "성운과 별, 우리 몸을 이루는 원소의 기원에 관한 과학적 배경은 아래 NASA 자료를 참고했습니다.",
      creativeNote: '화면의 시각 표현과 소리는 예술적 창작입니다. 실제 망원경 사진, 물리적으로 정확한 시뮬레이션, 우주 현장에서 녹음한 소리가 아닙니다.',
      next: '계속 걷기',
      readingOnly: '읽기만 하기',
      startLabel: '첫 전시 시작',
      privacyNote: "흔적은 현재 화면에만 일시적으로 머물며, 전송되거나 저장되지 않습니다.",
    },
    references: [
      { title: 'NASA Space Place · 성운이란 무엇일까요?', url: 'https://spaceplace.nasa.gov/nebula/' },
      { title: 'NASA · 우리는 어떻게 별의 물질로 이루어져 있을까요? 전문가에게 묻다, 58화', url: 'https://www.nasa.gov/general/how-are-we-made-of-star-stuff-we-asked-a-nasa-expert-episode-58/' }
    ]
  },
  en: {
    title: 'We Are Wanderers of the Universe',
    subtitle: "From a moment today, through the universe, and back to everyday life",
    summary: "Nine continuous scenes begin with one person’s day, follow nebulae, stars, and the material in our bodies, and return to everyday life.",
    artist: 'NEBULA',
    period: 'Ongoing exhibition',
    playText: "Begin with a familiar day and follow the ancient material of the universe.",
    playHow: "Follow the story at your own pace. Imagine the light, pause, or leave a temporary trace if you wish. You can also simply read.",
    scenes: [
      {
        id: "today",
        eyebrow: "01 · A moment today",
        title: "Beginning close to home",
        paragraphs: [
          "Today, a person lingers beside a glass of water. Light touches the rim; the small sounds of life drift in from a distance. Even when nothing remarkable happens, the day goes on.",
          "Your day need not look like this one. Amid the light and quiet around you now, a question arises: what story connects the material so close at hand to the distant universe?"
        ],
        interaction: null
      },
      {
        id: "nebula",
        eyebrow: "02 · Toward a distant cloud",
        title: "NEBULA: a cloud among the stars",
        paragraphs: [
          "Following that question, we look far away. NEBULA means a nebula: an enormous cloud of gas and dust spread through space. Clouds like these lie among the stars we see.",
          "Some nebulae are places where new stars form; others are the remnants of stars that have reached the end of their lives. If you wish, incline your attention toward a cloud where beginnings and endings seem to share a sky."
        ],
        interaction: "tilt"
      },
      {
        id: "gravity",
        eyebrow: "03 · Drawing closer",
        title: "When scattered matter gathers",
        paragraphs: [
          "In some parts of that cloud, gravity draws scattered gas and dust together. Matter grows denser, and its contracting core becomes hotter.",
          "There is not yet a shining star, but things once far apart are coming closer. Imagine gathering the scattered light, and the long time this process takes."
        ],
        interaction: "gather"
      },
      {
        id: "star",
        eyebrow: "04 · A beginning of light",
        title: "A star begins to shine",
        paragraphs: [
          "When the core becomes hot and dense enough, nuclear fusion begins: hydrogen nuclei join to make helium. The energy released allows a new star to shine.",
          "A star does not breathe as we do. If you wish, follow one breath and imagine light beginning in the dark. It took a long time for that light to be born."
        ],
        interaction: "breath"
      },
      {
        id: "elements",
        eyebrow: "05 · Ancient material",
        title: "What earlier stars left behind",
        paragraphs: [
          "Many elements in our bodies, including carbon, oxygen, and iron, were made in earlier generations of stars and released into space through different processes. That ancient material has reached us today.",
          "Not all of our material was made in stars. Most hydrogen and helium formed in the early universe. Even a single breath carries a very old material history."
        ],
        interaction: null
      },
      {
        id: "home",
        eyebrow: "06 · A home in motion",
        title: "Earth moves, too",
        paragraphs: [
          "Earth holds this ancient material as it rotates and orbits the Sun. Even when the place where you rest feels still, our home is moving through space.",
          "Here, one person drinks water; someone else looks out of a window. Different days continue together in the same motion. The small scene where we began is part of this journey, too."
        ],
        interaction: null
      },
      {
        id: "pause",
        eyebrow: "07 · A moment to stay",
        title: "There is no need to hurry",
        paragraphs: [
          "You can choose to pause here. This is not a time when you must accomplish something or feel a particular way. Simply notice that your day is here with you.",
          "The time that has reached us is immense, and one person’s day is brief. That does not make this moment small. You can stay awhile or continue right on."
        ],
        interaction: "pause"
      },
      {
        id: "trace",
        eyebrow: "08 · A private mark",
        title: "Where we linger",
        paragraphs: [
          "If you wish, leave a small trace for this moment. It is not an answer to write down or a record you must show anyone. It is a quiet mark of your own.",
          "The trace stays only temporarily on this screen; it is neither transmitted nor saved. You can leave nothing at all. An unseen moment of attention is part of this story, too."
        ],
        interaction: "trace"
      },
      {
        id: "wanderer",
        eyebrow: "09 · Back to today",
        title: "We Are Wanderers of the Universe",
        paragraphs: [
          "Now we return to the everyday. A sip of water, the next view, or an ordinary moment of your own awaits. All the while, Earth keeps moving.",
          "We call ourselves wanderers of the universe. This is not a scientific category, but an invitation to see a familiar day a little differently. Your next moment is already within the universe."
        ],
        interaction: null
      }
    ],
    ui: {
      home: 'All exhibitions',
      back: 'Go back',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
      motionLabel: 'Screen motion',
      motionSystem: 'Use device preference',
      motionOn: 'Enable motion',
      motionOff: 'Reduce motion',
      progressLabel: 'Journey progress',
      scrollCue: 'Scroll gently to continue',
      start: 'Begin the journey',
      chapterPrefix: 'Scene',
      gatherButton: 'Gather light',
      gatherAgain: 'Gather again',
      gatherHint: 'Gather the light and imagine a star beginning.',
      gathered: 'The scattered light has gathered into one.',
      traceLabel: 'My small trace',
      traceHint: 'Choose a spot or use the button to leave a trace.',
      traceAdd: 'Leave a trace',
      traceReset: 'Clear traces',
      traceCount: '{n} traces',
      traceDone: 'You have left a small trace on this screen.',
      quiet: 'You can simply read quietly, without interacting.',
      afterword: 'At the journey’s end',
      sources: 'The science behind the story',
      sourcesNote: "The scientific background on nebulae, stars, and the origins of elements in our bodies draws on the NASA resources below.",
      creativeNote: 'The visuals and sound are artistic creations, not actual telescope images, physically accurate simulations, or sounds recorded in space.',
      next: 'Keep walking',
      readingOnly: 'Just read',
      startLabel: 'Begin the first exhibition',
      privacyNote: "Traces stay only temporarily on the current screen; they are neither transmitted nor saved.",
    },
    references: [
      { title: 'NASA Space Place · What Is a Nebula?', url: 'https://spaceplace.nasa.gov/nebula/' },
      { title: 'NASA · How Are We Made of Star Stuff? We Asked a NASA Expert: Episode 58', url: 'https://www.nasa.gov/general/how-are-we-made-of-star-stuff-we-asked-a-nasa-expert-episode-58/' }
    ]
  },
  zh: {
    title: '我们是宇宙的漫游者',
    subtitle: "从今天的一刻出发，穿过宇宙，再回到日常",
    summary: "九个连贯的场景从一个人的今天出发，经过星云、恒星与身体的物质，再回到日常。",
    artist: 'NEBULA',
    period: '常设展览',
    playText: "从身边的一天出发，追寻宇宙中古老的物质。",
    playHow: "按照自己的节奏跟随故事。你可以想象光、稍作停留，或留下一点短暂的痕迹；只阅读也很好。",
    scenes: [
      {
        id: "today",
        eyebrow: "01 · 今天的一刻",
        title: "从身边开始",
        paragraphs: [
          "今天，有个人在一杯水旁稍作停留。光落在杯沿，远处传来细微的生活声响。即使没有什么特别的事发生，一天也仍在流淌。",
          "你的今天不必和这个画面一样。在此刻环绕着你的光与安静中，我们问一个问题：近在身边的物质，和遥远的宇宙有着怎样的故事？"
        ],
        interaction: null
      },
      {
        id: "nebula",
        eyebrow: "02 · 望向遥远的云",
        title: "NEBULA，名为星云",
        paragraphs: [
          "循着这个问题，我们望向远方。NEBULA意为星云，是散布在宇宙中、由气体和尘埃组成的巨大云团。我们看见的恒星之间，也有这样的云。",
          "有些星云孕育新的恒星，有些则是恒星走到生命尽头后留下的遗迹。开始与结束仿佛同在一片天空；不妨将心意轻轻倾向这片云。"
        ],
        interaction: "tilt"
      },
      {
        id: "gravity",
        eyebrow: "03 · 彼此靠近",
        title: "当散落的物质聚拢",
        paragraphs: [
          "在云团的某些区域，引力将散落的气体和尘埃拉向彼此。物质逐渐变得稠密，收缩的中心也越来越热。",
          "此时还没有发光的恒星，曾经相距遥远的物质却正在靠近。试着在心中慢慢聚拢散落的光，想象这段漫长的时光。"
        ],
        interaction: "gather"
      },
      {
        id: "star",
        eyebrow: "04 · 光的开始",
        title: "一颗恒星开始发光",
        paragraphs: [
          "当中心变得足够炽热、稠密，核聚变开始：氢原子核结合成氦，并释放能量，让新生的恒星发出光芒。",
          "恒星不像我们一样呼吸。如果愿意，可以随一次呼吸，静静想象黑暗中初生的光。那道光的诞生经历了漫长的时间。"
        ],
        interaction: "breath"
      },
      {
        id: "elements",
        eyebrow: "05 · 古老的物质",
        title: "更早的恒星留下了什么",
        paragraphs: [
          "我们身体里的碳、氧、铁等许多元素，形成于更早世代的恒星，并经过不同的过程被释放到宇宙中。这些古老的物质，就这样抵达了今天的我们。",
          "并非所有材料都由恒星制造。大部分氢和氦形成于早期宇宙。即使是一次呼吸，也承载着物质极其古老的历史。"
        ],
        interaction: null
      },
      {
        id: "home",
        eyebrow: "06 · 移动的家",
        title: "地球也在前行",
        paragraphs: [
          "地球承载着这些古老的物质，一边自转，一边围绕太阳公转。即使此刻身体所在的地方感觉安静，我们的家仍在宇宙中运动。",
          "在这里，一个人喝水，另一个人望向窗外。各不相同的日子，随着同样的运动继续向前。开头那个小小的画面，也在这段旅程之中。"
        ],
        interaction: null
      },
      {
        id: "pause",
        eyebrow: "07 · 稍作停留",
        title: "不必着急的一刻",
        paragraphs: [
          "你可以选择在这里停一停。此刻不需要完成什么，也不必有某种特别的心情。只需觉察，今天正陪伴在你身边。",
          "抵达我们的时间无比漫长，一个人的一天却很短。但这并不会让此刻变得渺小。你可以稍作停留，也可以直接继续。"
        ],
        interaction: "pause"
      },
      {
        id: "trace",
        eyebrow: "08 · 私人的记号",
        title: "在短暂停留的地方",
        paragraphs: [
          "如果愿意，可以为这一刻留下一点痕迹。它不是要写出的答案，也不是必须给别人看的记录，只属于你自己的一枚安静记号。",
          "痕迹只暂时留在当前画面上，不会被传输或保存。什么都不留下也很好。没有留下可见痕迹的片刻凝望，也是这个故事的一部分。"
        ],
        interaction: "trace"
      },
      {
        id: "wanderer",
        eyebrow: "09 · 回到今天",
        title: "我们是宇宙的漫游者",
        paragraphs: [
          "现在，我们回到日常。一口水、接下来看到的风景，或你将继续度过的平凡一刻，正等待着你。而地球仍在运动。",
          "我们试着称自己为宇宙的漫游者。这不是科学分类，而是一份邀请：用稍有不同的眼光看看熟悉的今天。你的下一个时刻，已在宇宙之中。"
        ],
        interaction: null
      }
    ],
    ui: {
      home: '返回展览列表',
      back: '返回',
      soundOn: '开启声音',
      soundOff: '关闭声音',
      motionLabel: '画面动态',
      motionSystem: '跟随设备设置',
      motionOn: '开启动效',
      motionOff: '减少动态效果',
      progressLabel: '旅程进度',
      scrollCue: '慢慢向下，继续旅程',
      start: '开始旅程',
      chapterPrefix: '场景',
      gatherButton: '聚拢光点',
      gatherAgain: '再次聚拢',
      gatherHint: '聚拢光点，想象一颗恒星的开始。',
      gathered: '散落的光点已汇聚在一起。',
      traceLabel: '我的小小痕迹',
      traceHint: '点击想留下痕迹的位置，或使用按钮。',
      traceAdd: '留下痕迹',
      traceReset: '清除痕迹',
      traceCount: '{n}处痕迹',
      traceDone: '你在当前屏幕上留下了一点痕迹。',
      quiet: '不参与互动，安静阅读也很好。',
      afterword: '旅程尾声',
      sources: '故事的科学依据',
      sourcesNote: "有关星云、恒星和人体元素起源的科学背景，参考了以下NASA资料。",
      creativeNote: '画面与声音均为艺术创作，并非真实的望远镜影像、物理上精确的模拟，也不是在宇宙现场录制的声音。',
      next: '继续前行',
      readingOnly: '只阅读',
      startLabel: '开始第一场展览',
      privacyNote: "痕迹只暂时留在当前画面上，不会被传输或保存。",
    },
    references: [
      { title: 'NASA Space Place · 什么是星云？', url: 'https://spaceplace.nasa.gov/nebula/' },
      { title: 'NASA · 我们如何由恒星物质构成？NASA专家解答，第58集', url: 'https://www.nasa.gov/general/how-are-we-made-of-star-stuff-we-asked-a-nasa-expert-episode-58/' }
    ]
  },
  ja: {
    title: '私たちは宇宙の旅人',
    subtitle: "今日のひとときから宇宙をたどり、ふたたび日常へ",
    summary: "ある人の今日から星雲、星、体の物質をたどり、日常へ戻る九つの場面からなる連続した物語。",
    artist: 'NEBULA',
    period: '常設展示',
    playText: "身近な一日から出発し、宇宙の古い物質をたどります。",
    playHow: "自分のペースで物語をたどり、光を想像したり、少し留まったり。よければ一時的なしるしを残せます。読むだけでもかまいません。",
    scenes: [
      {
        id: "today",
        eyebrow: "01 · 今日のひととき",
        title: "身近なところから",
        paragraphs: [
          "今日、ある人が一杯の水のそばでひとときを過ごしています。グラスの縁に光が触れ、遠くから小さな生活の音が聞こえます。特別なことがなくても、一日は流れていきます。",
          "あなたの今日がこの場面と違っていてもかまいません。今、あなたを包む光と静けさの中で、一つ問いかけます。こんなに身近な物質は、遠い宇宙とどんな物語を分かち合っているのでしょう。"
        ],
        interaction: null
      },
      {
        id: "nebula",
        eyebrow: "02 · 遠い雲へ",
        title: "NEBULA、星雲という名前",
        paragraphs: [
          "その問いに導かれて、遠くを見つめます。NEBULAは星雲、つまり宇宙に広がるガスとちりの巨大な雲を意味します。見える星々のあいだにも、このような雲があります。",
          "新しい星が生まれる星雲もあれば、一生を終えた星が残したものもあります。はじまりと終わりが同じ空にあるような雲へ、少し心を傾けてみてください。"
        ],
        interaction: "tilt"
      },
      {
        id: "gravity",
        eyebrow: "03 · 互いに近づく",
        title: "散らばったものが集まるとき",
        paragraphs: [
          "雲の一部では、重力が散らばるガスとちりを引き寄せます。物質が集まって密になり、収縮する中心部はしだいに熱くなります。",
          "まだ輝く星ではありませんが、離れていたものが近づいています。散らばる光を心の中でゆっくり集めながら、長い時間を想像してみてください。"
        ],
        interaction: "gather"
      },
      {
        id: "star",
        eyebrow: "04 · 光のはじまり",
        title: "ひとつの星が輝きはじめる",
        paragraphs: [
          "中心が十分に熱く、密になると、水素の原子核が結びついてヘリウムになる核融合がはじまります。そこで放たれるエネルギーによって、新しい星は輝きます。",
          "星は私たちのように呼吸するわけではありません。よければ一度の呼吸に合わせて、暗闇に生まれる光を静かに想像してみてください。その光の誕生には長い時間がかかりました。"
        ],
        interaction: "breath"
      },
      {
        id: "elements",
        eyebrow: "05 · 古い材料",
        title: "以前の星が残したもの",
        paragraphs: [
          "私たちの体の炭素や酸素、鉄など多くの元素は以前の世代の星でつくられ、さまざまな過程を経て宇宙へ放たれました。その古い物質が、今日の私たちに届いたのです。",
          "すべての材料が星でつくられたわけではありません。水素とヘリウムの大半は初期の宇宙で生まれました。ひと息にも、とても古い物質の歴史が宿っています。"
        ],
        interaction: null
      },
      {
        id: "home",
        eyebrow: "06 · 動きつづける家",
        title: "私たちの地球も",
        paragraphs: [
          "この古い物質を抱く地球は、自転しながら太陽のまわりを公転しています。体のある場所が静かに感じられる今も、私たちの家は宇宙を動いています。",
          "その上で、ある人は水を飲み、別の人は窓の外を眺めます。それぞれ異なる一日が、同じ動きに乗って続いています。最初の小さな場面も、この旅の中にあります。"
        ],
        interaction: null
      },
      {
        id: "pause",
        eyebrow: "07 · ひととき留まる",
        title: "急がなくていい時間",
        paragraphs: [
          "ここで少し立ち止まることを選んでもかまいません。何かを成し遂げたり、特別な気持ちになったりしなければならない時間ではありません。ただ、今日という日がそばにあることを感じてみてください。",
          "私たちに届いた時間はとても長く、一人の一日は短いものです。けれども、だからといってこの瞬間が小さくなるわけではありません。少し留まっても、そのまま進んでもかまいません。"
        ],
        interaction: "pause"
      },
      {
        id: "trace",
        eyebrow: "08 · 自分だけのしるし",
        title: "ひととき留まった場所に",
        paragraphs: [
          "よければ、この瞬間のために小さなしるしを残してみてください。答えを書くことでも、誰かに見せなければならない記録でもありません。あなただけの静かなしるしです。",
          "しるしは今の画面に一時的に留まるだけで、送信も保存もされません。何も残さなくてもかまいません。目に見えないひとときのまなざしも、この物語の一部です。"
        ],
        interaction: "trace"
      },
      {
        id: "wanderer",
        eyebrow: "09 · ふたたび今日へ",
        title: "私たちは宇宙の旅人",
        paragraphs: [
          "さあ、日常へ戻ります。一口の水、次に見る景色、あるいはあなたがこれから過ごす何気ないひとときが待っています。そのあいだも地球は動いています。",
          "そんな私たちを宇宙の旅人と呼んでみます。これは科学上の分類ではなく、なじみ深い今日を少し違う目で見つめるための招待です。あなたの次の瞬間も、すでに宇宙の中にあります。"
        ],
        interaction: null
      }
    ],
    ui: {
      home: '展示一覧へ',
      back: '戻る',
      soundOn: '音をオンにする',
      soundOff: '音をオフにする',
      motionLabel: '画面の動き',
      motionSystem: '端末の設定に合わせる',
      motionOn: '動きをオンにする',
      motionOff: '動きを減らす',
      progressLabel: '旅の進み具合',
      scrollCue: 'ゆっくり下へ、物語は続きます',
      start: '旅をはじめる',
      chapterPrefix: '場面',
      gatherButton: '光を集める',
      gatherAgain: 'もう一度集める',
      gatherHint: '光を集めて、星のはじまりを想像してみてください。',
      gathered: '散らばった光がひとつに集まりました。',
      traceLabel: '私の小さなしるし',
      traceHint: '好きな場所を押すか、ボタンでしるしを残せます。',
      traceAdd: 'しるしを残す',
      traceReset: 'しるしを消す',
      traceCount: '{n}個のしるし',
      traceDone: '今の画面に、小さなしるしを残しました。',
      quiet: '操作せず、静かに読むだけでもかまいません。',
      afterword: '旅の終わりに',
      sources: '物語の科学的な背景',
      sourcesNote: "星雲、星、体をつくる元素の起源についての科学的な背景は、以下のNASA資料を参考にしています。",
      creativeNote: '画面の表現と音は芸術的な創作です。実際の望遠鏡画像、物理的に正確なシミュレーション、宇宙で収録された音ではありません。',
      next: '歩みをつづける',
      readingOnly: '読むだけにする',
      startLabel: '最初の展示をはじめる',
      privacyNote: "しるしは現在の画面に一時的に留まるだけで、送信も保存もされません。",
    },
    references: [
      { title: 'NASA Space Place · 星雲とは？', url: 'https://spaceplace.nasa.gov/nebula/' },
      { title: 'NASA · 私たちはどのように星の物質でできているのか？ NASAの専門家に聞く、第58回', url: 'https://www.nasa.gov/general/how-are-we-made-of-star-stuff-we-asked-a-nasa-expert-episode-58/' }
    ]
  }
};

function languageKey(language) {
  const key = String(language || 'ko').toLowerCase().split(/[-_]/)[0];
  return Object.prototype.hasOwnProperty.call(STORIES, key) ? key : 'ko';
}

// Return independent data snapshots so consumers cannot alter another view's copy.
export function getFirstStory(language = 'ko') {
  const story = STORIES[languageKey(language)];
  return {
    ...story,
    scenes: story.scenes.map((scene) => ({ ...scene, paragraphs: [...scene.paragraphs] })),
    ui: { ...story.ui },
    references: story.references.map((reference) => ({ ...reference }))
  };
}

export function getFirstCell(language = 'ko') {
  const story = getFirstStory(language);
  return {
    id: 'g001',
    order: 1,
    status: 'open',
    title: story.title,
    subtitle: story.subtitle,
    summary: story.summary,
    artist: story.artist,
    period: story.period,
    color: '#a8cfc4',
    fx: 'stars',
    planet: 'gas',
    url: 'first.html',
    singleJourney: true,
    aliases: [...FIRST_IDS],
    storyRevision: FIRST_STORY_REV
  };
}

export function getFirstBlocks(language = 'ko') {
  const story = getFirstStory(language);
  return [
    {
      cell_id: 'g001',
      order: 1,
      type: 'cover',
      title: story.title,
      subtitle: story.subtitle,
      body: `${story.subtitle}\n\n${story.scenes[0].paragraphs.join('\n')}`
    },
    ...story.scenes.slice(1).map((scene, index) => ({
      cell_id: 'g001',
      order: index + 2,
      type: 'text',
      title: scene.title,
      body: scene.paragraphs.join('\n')
    })),
    {
      cell_id: 'g001',
      order: story.scenes.length + 1,
      type: 'end',
      title: story.ui.home,
      body: ''
    }
  ];
}
