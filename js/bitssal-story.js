// N-003 · 빛쌀 — 순이의 이야기 (가상의 인물, 전시 문안)
// 순이와 가족은 실제 인물이 아니다. 진실화해위원회 기록에 남은 시대 상황을 바탕으로 만든 이야기이며,
// 실제 희생자·유족의 증언이 아니다. 폭력 장면은 그리지 않고, 기다리는 사람의 자리에서만 말한다.
// 장면별로: who(때·나이), html(본문). 장면 구성·제목은 bitssal-scenes.js

const ko = {
  note: '순이와 가족은 실제 인물이 아닙니다. 진실화해위원회 기록에 남은 시대를 바탕으로 만든 가상의 이야기(전시 문안)이며, 실제 희생자나 유족의 증언이 아닙니다.',
  label: '순이의 이야기',
  prologue: [{ who: '2026년 · 순이, 아흔 살', html: '<p>올해 나는 아흔 살이다. 손주가 묻는다. 할머니는 왜 7월이면 밥을 한 그릇 더 푸느냐고.</p><p>그 이야기를 하려면, 여든 해 전 대구의 쌀 한 톨에서 시작해야 한다.</p>' }],
  life: [{ who: '1946년 봄 · 순이, 열 살', html: '<p>우리 집은 대구역 뒤 골목에 있었다. 일본에서 돌아온 작은아버지네까지 합치면 밥상에 앉는 식구가 열이었다.</p><p>어머니는 새벽마다 쌀을 씻었다. 방직공장에 다니던 큰오빠의 도시락은 쌀밥이 반, 보리가 반. 오빠는 늘 제 밥을 한 숟갈 덜어 내 그릇에 얹어 주었다.</p>' }],
  hunger: [{ who: '1946년 여름', html: '<p>여름에 콜레라가 돌았다. 길이 막히자 쌀 장수가 오지 않았고, 비는 그칠 줄 몰랐다.</p><p>쌀독 바닥이 긁히는 소리를 나는 지금도 기억한다. 어머니는 쌀 한 줌에 물을 한 솥 붓고 죽을 쑤었다. 나는 숟가락 위의 쌀알을 셌다. 아홉, 열. 열하나는 없었다.</p>' }],
  demand: [{ who: '1946년 10월 1일 아침', html: '<p>오빠가 공장 사람들과 나서며 말했다. “쌀 달라고 하러 간다.”</p><p>그 말이 이상하게 무섭지 않았다. 배고픈 사람이 밥을 달라는 건 당연한 일이었으니까. 나는 골목 끝까지 따라가다 어머니 손에 붙들렸다. 오빠는 뒤돌아 손을 한 번 흔들었다.</p>' }],
  street: [{ who: '1946년 10월 1일 밤', html: '<p>밤이 되자 역 쪽에서 큰일이 났다는 말이 골목을 돌았다. 어머니는 대문을 걸고, 등잔도 켜지 않은 채 앉아 있었다.</p><p>오빠는 새벽에 돌아왔다. 신발에 흙이 잔뜩 묻어 있었고, 아무 말도 하지 않았다. 그날 오빠가 무엇을 보았는지, 나는 끝내 묻지 못했다.</p>' }],
  spread: [{ who: '1946년 가을', html: '<p>소식은 기차보다 빨랐다. 칠곡 외가에서도, 영천 이모네서도 비슷한 이야기가 들려왔다.</p><p>어른들은 그 일을 그냥 ‘대구 일’이라고만 불렀다. 이름을 붙이는 것조차 조심해야 하는 일이 되었다.</p>' }],
  erased: [{ who: '1947년 겨울', html: '<p>그 뒤로 경찰이 몇 번이나 집에 와서 오빠를 찾았다. 오빠는 한동안 이 집 저 집을 옮겨 다니며 지냈다.</p><p>동네 사람들은 오빠 이름을 부를 때 목소리를 낮추기 시작했다. 오빠가 한 일은, 쌀을 달라고 걸어간 것뿐이었는데.</p>' }],
  boundary: [{ who: '1950년 여름 · 순이, 열네 살', html: '<p>전쟁이 났다. 지난해 오빠는 “도장 하나만 찍으면 앞으로 괜찮다”는 말을 듣고 보도연맹에 이름을 올렸다.</p><p>7월 어느 아침, 지서에서 잠깐 다녀가라는 부름이 왔다. 오빠는 흰 고무신을 신고 나서며 말했다. “저녁밥 해 놔라.”</p>' }],
  mine: [{ who: '1950년 7월', html: '<p>어머니는 그날 저녁, 밥을 한 그릇 더 퍼 두었다. 밥이 식고, 이튿날이 되고, 장마가 지나도 오빠는 돌아오지 않았다.</p><p>경산 쪽 광산으로 사람들이 실려 갔다는 소문을 들었다. 그러나 그곳에 가 볼 수도, 누구에게 물어볼 수도 없었다.</p>' }],
  truth: [
    { who: '1950년부터', html: '<p>그해부터 어머니는 해마다 7월이면 밥을 한 그릇 더 펐다. 아무도 그 그릇에 숟가락을 대지 않았다. 어머니가 돌아가신 뒤로는 내가 펐다.</p><p>1993년, 신문에 처음으로 경산 이야기가 실렸다. 나는 그 기사를 오려 어머니 사진 앞에 두었다.</p>' },
    { who: '2009년 11월 17일 · 순이, 일흔세 살', html: '<p>진실규명이 결정되던 날, 나는 신원이 확인된 127명의 이름을 몇 번이고 읽었다. 오빠의 이름은 거기 없었다.</p><p>그래도 이제는 소리 내어 오빠 이름을 부를 수 있게 되었다.</p>' },
  ],
  share: [{ who: '1980년 5월 · 순이, 마흔네 살', html: '<p>광주에서 사람들이 주먹밥을 지어 서로 나눴다는 이야기를, 나는 한참 뒤에야 들었다.</p><p>그날 밤 쌀을 씻다가 오래 울었다. 오빠가 달라고 했던 그 쌀이, 거기서는 서로를 살리는 밥이 되었구나 싶어서.</p>' }],
  light: [{ who: '2026년 · 순이, 아흔 살', html: '<p>올해도 7월이면 밥을 한 그릇 더 풀 것이다. 김이 오르는 흰 밥 한 그릇이, 나에게는 오빠가 돌아오는 길을 비추는 빛이다.</p><p>이제 이 이야기를 너에게 건넨다. 한 톨만큼만, 기억해 다오.</p>' }],
};

const en = {
  note: 'Suni and her family are not real people. This is a fictional story (exhibition text) based on the period recorded by the Truth and Reconciliation Commission, not the testimony of actual victims or bereaved families.',
  label: 'Suni’s story',
  prologue: [{ who: '2026 · Suni, age 90', html: '<p>This year I am ninety. My grandchild asks why, every July, Grandma serves one extra bowl of rice.</p><p>To answer, I have to begin with a single grain of rice in Daegu, eighty years ago.</p>' }],
  life: [{ who: 'Spring 1946 · Suni, age 10', html: '<p>Our house was in an alley behind Daegu Station. With my uncle’s family, back from Japan, there were ten of us at the table.</p><p>Every dawn my mother washed the rice. My eldest brother worked at a textile mill; his lunch box was half rice, half barley. He always scooped a spoonful of his own into my bowl.</p>' }],
  hunger: [{ who: 'Summer 1946', html: '<p>That summer cholera spread. The roads were closed, the rice seller stopped coming, and the rain would not stop.</p><p>I still remember the sound of a spoon scraping the bottom of the rice jar. Mother poured a whole pot of water over a handful of rice to make porridge. I counted the grains on my spoon. Nine, ten. There was no eleven.</p>' }],
  demand: [{ who: 'Morning of October 1, 1946', html: '<p>My brother left with the people from the mill. “We’re going to ask for rice,” he said.</p><p>Strangely, it did not frighten me. A hungry person asking for food seemed only natural. I followed him to the end of the alley until Mother caught my hand. He turned back and waved once.</p>' }],
  street: [{ who: 'Night of October 1, 1946', html: '<p>After dark, word went around the alley that something terrible had happened near the station. Mother bolted the gate and sat without lighting the lamp.</p><p>My brother came home at dawn, his shoes caked with mud, and said nothing. I never did ask him what he saw that day.</p>' }],
  spread: [{ who: 'Autumn 1946', html: '<p>The news travelled faster than the trains. Similar stories came from my mother’s family in Chilgok and my aunt in Yeongcheon.</p><p>The grown-ups only called it “the Daegu thing.” Even giving it a name became something to be careful about.</p>' }],
  erased: [{ who: 'Winter 1947', html: '<p>After that, the police came to our house again and again looking for my brother. For a while he moved from house to house.</p><p>People in the neighbourhood began to lower their voices when they said his name. All he had done was walk out to ask for rice.</p>' }],
  boundary: [{ who: 'Summer 1950 · Suni, age 14', html: '<p>The war began. The year before, my brother had been told that “one stamp and you’ll be fine from now on,” and had put his name in the National Guidance Alliance.</p><p>One morning in July, word came from the police box to drop by for a moment. He put on his white rubber shoes and said, “Have supper ready.”</p>' }],
  mine: [{ who: 'July 1950', html: '<p>That evening Mother served one extra bowl of rice. The rice went cold, the next day came, the monsoon passed, and my brother did not come back.</p><p>We heard rumours that people had been taken to a mine near Gyeongsan. But we could not go there, and there was no one we could ask.</p>' }],
  truth: [
    { who: 'From 1950 on', html: '<p>From that year, every July, Mother served one extra bowl of rice. No one ever put a spoon in it. After she died, I served it.</p><p>In 1993 a newspaper wrote about Gyeongsan for the first time. I cut out the article and placed it before her photograph.</p>' },
    { who: 'November 17, 2009 · Suni, age 73', html: '<p>On the day the truth was established, I read the 127 identified names over and over. My brother’s name was not there.</p><p>Still, I could now say his name out loud.</p>' },
  ],
  share: [{ who: 'May 1980 · Suni, age 44', html: '<p>Only much later did I hear that, in Gwangju, people made rice balls and shared them with one another.</p><p>That night I wept for a long time while washing the rice. The rice my brother had asked for had become, there, food that kept people alive.</p>' }],
  light: [{ who: '2026 · Suni, age 90', html: '<p>This July, too, I will serve one extra bowl. To me that steaming bowl of white rice is a light on the road for my brother to come home.</p><p>Now I hand this story to you. Remember it — just one grain’s worth.</p>' }],
};

const zh = {
  note: '顺伊和她的家人并非真实人物。这是根据真实·和解委员会记录中的时代背景创作的虚构故事（展览文案），并非真实遇难者或遗属的证言。',
  label: '顺伊的故事',
  prologue: [{ who: '2026年 · 顺伊，九十岁', html: '<p>今年我九十岁了。孙子问我：奶奶为什么每年七月都要多盛一碗饭？</p><p>要讲这件事，得从八十年前大邱的一粒米说起。</p>' }],
  life: [{ who: '1946年春 · 顺伊，十岁', html: '<p>我家在大邱站后面的小巷里。算上从日本回来的叔叔一家，围着饭桌坐的有十口人。</p><p>母亲每天清晨淘米。在纺织厂做工的大哥，饭盒里一半米饭、一半大麦。他总是从自己碗里拨一勺放进我的碗里。</p>' }],
  hunger: [{ who: '1946年夏', html: '<p>那年夏天霍乱蔓延。路被封了，卖米的人不来了，雨也下个不停。</p><p>米缸底被刮得沙沙响的声音，我到现在还记得。母亲往一把米里倒一整锅水熬粥。我数着勺子上的米粒。九、十。没有第十一粒。</p>' }],
  demand: [{ who: '1946年10月1日早晨', html: '<p>哥哥和厂里的人一起出门，说：“去要米。”</p><p>奇怪的是，我并不害怕。饿了的人要饭吃，是理所当然的事。我跟到巷口，被母亲拉住了手。哥哥回头挥了一下手。</p>' }],
  street: [{ who: '1946年10月1日夜', html: '<p>天黑后，巷子里传开了车站那边出大事的消息。母亲闩上大门，连油灯也没点，就那样坐着。</p><p>哥哥天亮才回来，鞋上沾满了泥，一句话也没说。那天他看到了什么，我始终没能问出口。</p>' }],
  spread: [{ who: '1946年秋', html: '<p>消息比火车还快。漆谷的外婆家、永川的姨妈家，也传来了相似的事。</p><p>大人们只把那件事叫作“大邱的事”。连给它起个名字，都成了要小心的事。</p>' }],
  erased: [{ who: '1947年冬', html: '<p>从那以后，警察好几次来家里找哥哥。哥哥有一阵子在别人家之间辗转躲藏。</p><p>邻居们提到哥哥的名字时，开始压低声音。可他做的，只是走出去要米而已。</p>' }],
  boundary: [{ who: '1950年夏 · 顺伊，十四岁', html: '<p>战争爆发了。前一年，哥哥听人说“只要盖个章，以后就没事了”，便在保导联盟登记了名字。</p><p>七月的一个早晨，派出所来话，让他过去一趟。哥哥穿上白色胶鞋出门，说：“把晚饭做好。”</p>' }],
  mine: [{ who: '1950年7月', html: '<p>那天晚上，母亲多盛了一碗饭。饭凉了，第二天到了，梅雨过去了，哥哥也没有回来。</p><p>我们听说有人被拉到庆山那边的矿山。可我们去不了那里，也没有人可以问。</p>' }],
  truth: [
    { who: '从1950年起', html: '<p>从那年起，每到七月，母亲都会多盛一碗饭。谁也没有动过那碗饭。母亲去世后，就由我来盛。</p><p>1993年，报纸第一次登出了庆山的事。我把那篇报道剪下来，放在母亲的照片前。</p>' },
    { who: '2009年11月17日 · 顺伊，七十三岁', html: '<p>查明真相决定公布的那天，我把已确认身份的127个名字读了一遍又一遍。哥哥的名字不在其中。</p><p>但如今，我终于可以出声叫哥哥的名字了。</p>' },
  ],
  share: [{ who: '1980年5月 · 顺伊，四十四岁', html: '<p>光州的人们做饭团彼此分享的事，我过了很久才听说。</p><p>那天夜里，我一边淘米一边哭了很久。哥哥当年要的那些米，在那里变成了让彼此活下去的饭。</p>' }],
  light: [{ who: '2026年 · 顺伊，九十岁', html: '<p>今年七月，我也会多盛一碗饭。那碗冒着热气的白米饭，对我来说，是照亮哥哥回家之路的光。</p><p>现在，我把这个故事交给你。只要记住一粒米那么多就好。</p>' }],
};

const ja = {
  note: 'スニとその家族は実在の人物ではありません。真実・和解委員会の記録に残る時代をもとに作った架空の物語（展示文案）であり、実際の犠牲者や遺族の証言ではありません。',
  label: 'スニの物語',
  prologue: [{ who: '2026年 · スニ、90歳', html: '<p>今年、わたしは九十歳になった。孫がたずねる。おばあちゃんはどうして七月になるとご飯をもう一杯よそうの、と。</p><p>その話をするには、八十年前の大邱の、一粒の米から始めなければならない。</p>' }],
  life: [{ who: '1946年春 · スニ、10歳', html: '<p>わたしの家は大邱駅の裏の路地にあった。日本から戻った叔父の家族まで合わせると、食卓を囲むのは十人だった。</p><p>母は毎朝、夜明けに米をといだ。紡績工場で働く長兄の弁当は、白米が半分、麦が半分。兄はいつも自分のご飯をひとさじ、わたしの茶碗にのせてくれた。</p>' }],
  hunger: [{ who: '1946年夏', html: '<p>その夏、コレラがはやった。道がふさがれ、米売りは来なくなり、雨はやまなかった。</p><p>米びつの底をこする音を、わたしは今も覚えている。母はひとにぎりの米に鍋いっぱいの水を注いで粥を炊いた。わたしはさじの上の米粒を数えた。九つ、十。十一はなかった。</p>' }],
  demand: [{ who: '1946年10月1日の朝', html: '<p>兄は工場の人たちと出かけながら言った。「米をくれと言いに行く」</p><p>不思議とこわくはなかった。お腹をすかせた人がご飯をくれと言うのは、当たり前のことだったから。路地の端までついて行き、母に手をつかまれた。兄は振り返って、一度だけ手を振った。</p>' }],
  street: [{ who: '1946年10月1日の夜', html: '<p>夜になると、駅のほうで大変なことが起きたといううわさが路地をめぐった。母は門にかんぬきをかけ、灯りもつけずに座っていた。</p><p>兄は明け方に帰ってきた。靴は泥だらけで、何も言わなかった。あの日兄が何を見たのか、わたしはとうとう聞けなかった。</p>' }],
  spread: [{ who: '1946年秋', html: '<p>知らせは汽車より速かった。漆谷の母の実家からも、永川のおばの家からも、似た話が届いた。</p><p>大人たちはそれをただ「大邱のこと」と呼んだ。名前をつけることさえ、気をつけなければならないことになった。</p>' }],
  erased: [{ who: '1947年冬', html: '<p>それから警察が何度も家に来て、兄を探した。兄はしばらく、あちこちの家を転々として暮らした。</p><p>近所の人たちは、兄の名前を呼ぶとき声をひそめるようになった。兄がしたのは、米をくれと歩いて行ったことだけだったのに。</p>' }],
  boundary: [{ who: '1950年夏 · スニ、14歳', html: '<p>戦争が始まった。前の年、兄は「判子ひとつ押せばこの先は大丈夫だ」と言われて、保導連盟に名前を載せていた。</p><p>七月のある朝、駐在所からちょっと寄るようにと呼び出しが来た。兄は白いゴム靴をはいて出かけながら言った。「夕飯、炊いといてくれ」</p>' }],
  mine: [{ who: '1950年7月', html: '<p>その晩、母はご飯をもう一杯よそっておいた。ご飯が冷め、翌日になり、梅雨が明けても、兄は帰ってこなかった。</p><p>慶山のほうの鉱山へ人が連れて行かれたといううわさを聞いた。けれど、そこへ行くことも、誰かにたずねることもできなかった。</p>' }],
  truth: [
    { who: '1950年から', html: '<p>その年から、母は毎年七月になるとご飯をもう一杯よそった。誰もその茶碗にさじをつけなかった。母が亡くなってからは、わたしがよそった。</p><p>1993年、新聞にはじめて慶山の話がのった。わたしはその記事を切り抜いて、母の写真の前に置いた。</p>' },
    { who: '2009年11月17日 · スニ、73歳', html: '<p>真実究明が決定された日、わたしは身元が確認された127人の名前を何度も読んだ。兄の名前はそこになかった。</p><p>それでも今は、声に出して兄の名前を呼べるようになった。</p>' },
  ],
  share: [{ who: '1980年5月 · スニ、44歳', html: '<p>光州で人々がおにぎりを作って分け合ったという話を、わたしはずいぶん後になって聞いた。</p><p>その夜、米をとぎながら長いこと泣いた。兄が求めたあの米が、あそこでは互いを生かすご飯になったのだと思って。</p>' }],
  light: [{ who: '2026年 · スニ、90歳', html: '<p>今年も七月には、ご飯をもう一杯よそうだろう。湯気の立つ白いご飯一杯が、わたしにとっては、兄が帰ってくる道を照らす光だ。</p><p>いま、この物語をあなたに手渡す。一粒ぶんだけ、覚えていてほしい。</p>' }],
};

export const STORY = { ko, en, zh, ja };
