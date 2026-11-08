// Device-specific interaction copy; the narrative itself remains shared.
const COPY = {
  ko: {
    desktopMode: 'DESKTOP · 마우스와 키보드로 걷는 여정', mobileMode: 'MOBILE · 손끝과 움직임으로 걷는 여정',
    switchMobile: '휴대폰 전시 보기', switchDesktop: '데스크톱 전시 보기',
    sensorTitle: '손에 든 기기가 이야기에 반응합니다', sensorIntro: '원한다면 움직임을 켜고 기울이기, 가볍게 흔들기, 화면 엎기를 이용할 수 있습니다. 사용하지 않아도 전부 관람할 수 있습니다.',
    sensorOn: '움직임 센서 켜기', sensorOff: '움직임 센서 끄기', sensorLoading: '기기 권한을 확인하고 있습니다.',
    sensorEnabled: '움직임 사용을 허용했습니다. 실제 지원 범위는 기기마다 다를 수 있습니다.', sensorDisabled: '움직임을 사용하지 않습니다. 터치와 버튼으로도 참여할 수 있습니다.',
    sensorDenied: '권한을 허용하지 않았거나 사용할 수 없습니다. 터치와 버튼으로 계속하세요.', sensorUnsupported: '이 기기에서는 움직임 센서를 사용할 수 없습니다. 터치와 버튼으로 계속하세요.',
    sensorCalm: '움직임 줄이기가 켜져 있습니다. 터치와 버튼을 이용하거나 설정을 변경하세요.', sensorPaused: '화면이 가려져 센서가 잠시 멈췄습니다.', sensorPrivacy: '움직임 정보는 이 화면에서만 사용하며 저장하거나 전송하지 않습니다. 위치와 카메라는 사용하지 않습니다.',
    tiltDesktop: '마우스를 움직이거나 이 공간을 선택하고 방향키를 눌러 성운의 빛을 움직여 보세요.', tiltMobile: '움직임을 켠 뒤 휴대폰을 천천히 기울여 보세요. 이 공간을 가볍게 눌러도 됩니다.',
    tiltSurface: '움직일 수 있는 성운의 빛', tiltReset: '빛을 가운데로', tiltResult: '빛의 자리가 바뀌었습니다.',
    gatherDesktop: '버튼을 누르거나 초점을 둔 뒤 Enter 또는 Space를 눌러 흩어진 빛을 모아 보세요.', gatherMobile: '움직임을 켰다면 휴대폰을 가볍게 흔들거나 아래 버튼을 눌러 빛을 모아 보세요.',
    gatherAction: '빛 모으기', gatherAgain: '다시 모으기', gatherDone: '흩어진 빛이 잠시 한곳으로 모였습니다.',
    breathDesktop: '버튼을 누르거나 Enter 또는 Space로 빛을 한 번 더 넓혀 보세요.', breathMobile: '원한다면 마이크를 켜고 가볍게 소리나 입김을 보내 보세요. 버튼으로도 같은 반응을 만들 수 있습니다.',
    micOn: '마이크 켜기', micOff: '마이크 끄기', micEnabled: '마이크가 켜졌습니다. 가벼운 소리나 입김에 빛이 반응합니다.', micDisabled: '마이크는 꺼져 있습니다.',
    micDenied: '마이크를 사용할 수 없습니다. 아래 버튼으로 같은 장면을 볼 수 있습니다.', micPaused: '화면을 가리거나 이 장면을 떠나 마이크를 껐습니다. 다시 켜려면 버튼을 누르세요.',
    micPrivacy: '입력 소리는 기기에서만 순간적으로 분석하며 녹음·저장·전송하지 않습니다. 화면을 가리거나 이 장면을 떠나면 마이크를 끕니다.',
    pulse: '빛을 넓히기', pulseDone: '빛이 천천히 퍼져 나갑니다.',
    pauseDesktop: '버튼을 누르거나 Enter 또는 Space로 잠시 풍경을 고요하게 할 수 있습니다.', pauseMobile: '움직임을 켰다면 휴대폰 화면을 잠시 엎어 두거나 버튼을 눌러 고요한 풍경을 만나세요.',
    pauseAction: '잠시 고요하게', resumeAction: '빛 다시 흐르게', pauseOn: '잠시 고요하게 머무릅니다.', pauseOff: '빛이 다시 천천히 흐릅니다.',
    traceDesktop: '마우스로 자리를 선택하거나 버튼과 키보드로 작은 점을 남겨 보세요.', traceMobile: '손끝으로 원하는 자리를 누르거나 버튼으로 작은 점을 남겨 보세요.'
  },
  en: {
    desktopMode: 'DESKTOP · A journey with mouse and keyboard', mobileMode: 'MOBILE · A journey through touch and movement',
    switchMobile: 'Open mobile exhibition', switchDesktop: 'Open desktop exhibition',
    sensorTitle: 'The device in your hand can respond', sensorIntro: 'If you wish, enable movement to tilt, gently shake, or turn your screen face down. The whole exhibition remains readable without it.',
    sensorOn: 'Enable motion sensors', sensorOff: 'Disable motion sensors', sensorLoading: 'Checking device permissions.', sensorEnabled: 'Motion permission is enabled. Available sensors vary by device.', sensorDisabled: 'Motion is off. You can also use touch and buttons.', sensorDenied: 'Motion permission was denied or is unavailable. Continue with touch and buttons.', sensorUnsupported: 'Motion sensors are unavailable on this device. Continue with touch and buttons.', sensorCalm: 'Reduced motion is on. Use touch and buttons, or change the motion setting.', sensorPaused: 'Sensors paused while the screen is hidden.', sensorPrivacy: 'Motion data is used only on this screen, never stored or transmitted. No camera or location is used.',
    tiltDesktop: 'Move your mouse, or focus this space and use the arrow keys to move the light in the nebula.', tiltMobile: 'Enable motion, then gently tilt your phone. You can also tap this space.', tiltSurface: 'Moveable light in the nebula', tiltReset: 'Center the light', tiltResult: 'The light has moved.',
    gatherDesktop: 'Press the button, or focus it and press Enter or Space, to gather the scattered light.', gatherMobile: 'With motion enabled, gently shake your phone or press the button to gather the light.', gatherAction: 'Gather the light', gatherAgain: 'Gather again', gatherDone: 'The scattered light briefly gathers in one place.',
    breathDesktop: 'Press the button, Enter, or Space to let the light spread a little further.', breathMobile: 'If you wish, enable the microphone and offer a little sound or breath. The button creates the same response.',
    micOn: 'Enable microphone', micOff: 'Turn off microphone', micEnabled: 'Microphone on. A gentle sound or breath makes the light respond.', micDisabled: 'Microphone off.', micDenied: 'The microphone is unavailable. The button gives the same experience.', micPaused: 'The microphone stopped when the screen was hidden or you left this scene. Press the button to enable it again.', micPrivacy: 'Input is analysed momentarily on this device, never recorded, saved, or transmitted. The microphone stops when you leave this scene or hide the screen.',
    pulse: 'Let the light expand', pulseDone: 'The light spreads gently outward.', pauseDesktop: 'Press the button, Enter, or Space to make the scene quiet for a moment.', pauseMobile: 'With motion enabled, rest your phone face down or press the button to find a quiet moment.', pauseAction: 'Make it quiet', resumeAction: 'Let the light flow', pauseOn: 'A moment of quiet.', pauseOff: 'The light begins to flow again.',
    traceDesktop: 'Choose a place with your mouse, or use the buttons and keyboard to leave small points.', traceMobile: 'Touch a place with your fingertip, or use the button to leave small points.'
  },
  zh: {
    desktopMode: '桌面版 · 使用鼠标与键盘的旅程', mobileMode: '移动版 · 使用触摸与动作的旅程', switchMobile: '查看移动版展览', switchDesktop: '查看桌面版展览',
    sensorTitle: '手中的设备可以回应你', sensorIntro: '如你愿意，可以启用动作，通过倾斜、轻晃或将屏幕朝下参与。不启用也可以完整阅读展览。', sensorOn: '启用动作传感器', sensorOff: '关闭动作传感器', sensorLoading: '正在检查设备权限。', sensorEnabled: '已允许动作感应。实际支持的传感器因设备而异。', sensorDisabled: '动作感应已关闭。也可以通过触摸和按钮参与。', sensorDenied: '权限未获允许或不可用，请继续使用触摸与按钮。', sensorUnsupported: '设备不支持动作感应，请继续使用触摸与按钮。', sensorCalm: '已开启减少动态效果，请使用触摸和按钮或修改设置。', sensorPaused: '屏幕隐藏时，传感器已暂停。', sensorPrivacy: '动作数据仅在此屏幕使用，不保存、不传输。不使用位置或摄像头。',
    tiltDesktop: '移动鼠标，或选中此区域并使用方向键，移动星云中的光。', tiltMobile: '启用动作后，轻轻倾斜手机，也可以轻触此区域。', tiltSurface: '可移动的星云之光', tiltReset: '将光移回中央', tiltResult: '光的位置改变了。', gatherDesktop: '点击按钮，或聚焦后按 Enter / 空格，聚拢散开的光。', gatherMobile: '启用动作后轻轻摇动手机，或按下按钮聚拢光。', gatherAction: '聚拢光', gatherAgain: '再次聚拢', gatherDone: '散开的光短暂聚在一起。',
    breathDesktop: '按下按钮、Enter 或空格，让光再向外延伸一点。', breathMobile: '如你愿意，可以启用麦克风，轻轻发声或吹气。按钮也能产生相同反应。', micOn: '启用麦克风', micOff: '关闭麦克风', micEnabled: '麦克风已启用。轻声或吹气会让光作出回应。', micDisabled: '麦克风已关闭。', micDenied: '麦克风不可用，可使用按钮体验相同的场景。', micPaused: '屏幕隐藏或离开此场景时麦克风已关闭。如需再次启用，请按按钮。', micPrivacy: '输入声音只在设备上瞬时分析，不录音、不保存、不传输。隐藏屏幕或离开此场景会关闭麦克风。', pulse: '让光扩散', pulseDone: '光缓缓向外扩散。',
    pauseDesktop: '按按钮、Enter 或空格，让画面短暂安静。', pauseMobile: '启用动作后将手机屏幕朝下，或按按钮，体验一刻安静。', pauseAction: '安静片刻', resumeAction: '让光继续流动', pauseOn: '此刻，静静停留。', pauseOff: '光再次缓缓流动。', traceDesktop: '用鼠标选择位置，或使用按钮与键盘留下小点。', traceMobile: '用指尖轻触位置，或使用按钮留下小点。'
  },
  ja: {
    desktopMode: 'デスクトップ · マウスとキーボードで歩く旅', mobileMode: 'モバイル · 指先と動きで歩く旅', switchMobile: 'モバイル展示を見る', switchDesktop: 'デスクトップ展示を見る',
    sensorTitle: '手の中の端末が物語に応えます', sensorIntro: '希望すれば動きを有効にし、傾ける・軽く振る・画面を下に伏せることで参加できます。使わなくても最後まで読めます。', sensorOn: '動きのセンサーを有効にする', sensorOff: '動きのセンサーをオフにする', sensorLoading: '端末の権限を確認しています。', sensorEnabled: '動きの使用を許可しました。対応するセンサーは端末によって異なります。', sensorDisabled: '動きはオフです。タッチやボタンでも参加できます。', sensorDenied: '権限が許可されないか使用できません。タッチやボタンで続けてください。', sensorUnsupported: 'この端末では動きのセンサーを使用できません。タッチやボタンで続けてください。', sensorCalm: '動きを減らす設定が有効です。タッチやボタンを使うか設定を変更してください。', sensorPaused: '画面が隠れている間、センサーは一時停止しています。', sensorPrivacy: '動きの情報はこの画面内でのみ使用し、保存・送信しません。位置情報とカメラは使用しません。',
    tiltDesktop: 'マウスを動かすか、この領域を選んで矢印キーを押し、星雲の光を動かしてください。', tiltMobile: '動きを有効にしてからスマートフォンをゆっくり傾けてください。この領域へのタップでも動かせます。', tiltSurface: '動かせる星雲の光', tiltReset: '光を中央へ', tiltResult: '光の位置が変わりました。', gatherDesktop: 'ボタンを押すか、フォーカスして Enter または Space を押し、散らばる光を集めましょう。', gatherMobile: '動きが有効なら端末を軽く振るか、ボタンを押して光を集めましょう。', gatherAction: '光を集める', gatherAgain: 'もう一度集める', gatherDone: '散らばる光が一瞬ひとつに集まりました。',
    breathDesktop: 'ボタン、Enter、Space で光をもう少し広げてみましょう。', breathMobile: '希望すればマイクを有効にして、やさしく声や息を送れます。ボタンでも同じ反応を楽しめます。', micOn: 'マイクを有効にする', micOff: 'マイクをオフにする', micEnabled: 'マイクがオンです。小さな声や息に光が反応します。', micDisabled: 'マイクはオフです。', micDenied: 'マイクを使用できません。ボタンで同じ体験ができます。', micPaused: '画面が隠れたか場面を離れたためマイクを停止しました。再度使うにはボタンを押してください。', micPrivacy: '入力音は端末内で一時的に分析するだけで、録音・保存・送信しません。画面が隠れた時やこの場面を離れた時に停止します。', pulse: '光を広げる', pulseDone: '光がゆっくり外へ広がります。',
    pauseDesktop: 'ボタン、Enter、Space で風景を少し静かにできます。', pauseMobile: '動きが有効なら画面を下に伏せるか、ボタンを押して静かな時間を過ごしてください。', pauseAction: '静かなひととき', resumeAction: '光を再び流す', pauseOn: 'しばらく静けさの中に。', pauseOff: '光が再びゆっくり流れます。', traceDesktop: 'マウスで場所を選ぶか、ボタンとキーボードで小さな点を残してください。', traceMobile: '指先で好きな場所に触れるか、ボタンで小さな点を残してください。'
  }
};
export function getDeviceCopy(language) { return COPY[language] || COPY.ko; }

const APP_HOW = {
  ko: '터치로 따라가고, 원하면 기울이기·가벼운 흔들기·엎기와 마이크로 참여합니다. 권한 없이도 끝까지 볼 수 있습니다.',
  en: 'Follow by touch, or opt in to tilt, gently shake, turn the phone face down, and use the microphone. You can visit without granting permissions.',
  zh: '用触摸跟随故事；如愿意，可选择倾斜、轻晃、屏幕朝下以及麦克风参与。不授予权限也可完整观看。',
  ja: 'タッチで物語をたどり、希望すれば傾ける・軽く振る・伏せる動きやマイクで参加できます。権限を許可しなくても最後まで見られます。'
};
export function getAppExperienceCopy(language) { return APP_HOW[language] || APP_HOW.ko; }
