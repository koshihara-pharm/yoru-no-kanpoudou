// なつめ君を動かす（まばたき、呼吸、髪のゆれ、口、うなずきなど）。くわしくは docs/19。
// 動かす部品は lib/mesh-avatar.js（mesh-avatar。MIT ライセンス）。人形のデータは avatar/natsume/。
// 読みこめたら、「待つ」の絵のかわりに、動く人形を出す。読みこめないとき（古い端末など）は、いままでどおり絵のまま。
// 「動きを減らす」設定の端末と、?noavatar をつけたときは、動かさない。
//
// せりふとの合わせ方（app.js からは window.NATSUME_ACT を呼ぶだけ）:
// - せりふの文字が出ている間だけ、口がゆっくり動く。文字が出おわると、口も止まる（声は出ない）
// - せりふの中の言葉で、しぐさを決める（下の RULES）。その言葉を「言う」ところで、しぐさが出る
// - 台本（data.js）のせりふに <nod> や [emotion:happy] と書けば、そこで、そのしぐさ・気持ちになる（AvatarScript と同じ書き方。画面には出ない）
//   しぐさ: nod うなずく / tilt 首をかしげる / think 考える / giggle くすっと笑う / surprise おどろく / shy 照れる / no 首をふる / wink ウィンク / greet あいさつ
//   気持ち: happy / sad / angry / surprised / relaxed / neutral
import { createMeshAvatar } from "./lib/mesh-avatar.js";

// ---------- 調整するところ ----------
const TUNE = {
  yomuMs: 130,      // 口が動く速さ（開く・すぼめるの1回あたり、ミリ秒。大きくすると、ゆっくり）
  sukunakutomoMs: 520, // 短いせりふでも、口はこれだけは動かす（文字が出おわったら、口も止まる）
  kuchi: 0.4,       // 口の開けぐあい（0〜1。0.5 がふつう。もの静かな人なので、少し小さめ）
  aidaMs: 1300,     // しぐさと、しぐさの間を、これだけはあける
  unazukiMs: 3200,  // 答えを選んだときの「うん」は、前のしぐさからこれだけあいていたら出す
  tsutsukiMs: 3000  // 画面をつついたときの反応は、これだけあける
};
// せりふの言葉 → しぐさ（上から見て、はじめに合ったものを使う）。cls はせりふの種類（app.js の speak の2つめ）
const RULES = [
  { cls: "tame" },                                                         // 悩みを言う前のため。動かない
  { re: /^[…。、\s]+$/, motion: "think", silent: true },                   // 「……」だけ。考える
  { re: /いらっしゃい|また、ようすを/, emotion: "relaxed", motion: "greet" },
  { re: /ふふ/, emotion: "happy", motion: "giggle" },
  { re: /待ってください|あれ。|おかしいな/, emotion: "surprised", motion: "surprise" },
  { re: /すみません|外しました|負けです|ちがいましたか/, emotion: "sad", motion: "shy" },
  { re: /やっぱり|そうですよね|見えています|見えました|そこです|たしかに/, emotion: "happy", motion: "nod" },
  { re: /ありませんか|ますか。|ですか。|でしたか|でしょうか|[？?]/, motion: "tilt" },
  { re: /なるほど|そうですか|かまいません|十分です|いいんです|ください。/, emotion: "relaxed", motion: "nod" }
];

const scene = document.getElementById("scene");
const canvas = document.getElementById("avatar");
const q = new URLSearchParams(location.search);
const calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const TAG = /<([a-z]+)>|\[emotion:([a-z]+)\]/g;
const STOP = /[、。…！？!?\s「」（）・]/;

const line = document.getElementById("line");
let avatar = null, lastMotion = 0, lastFace = null, mouthTimer = null, endTalk = null;

function play(id, force) {
  const now = performance.now();
  if (!avatar || (!force && now - lastMotion < TUNE.aidaMs)) return;
  lastMotion = now;
  avatar.play(id);
}
function hush() {
  clearInterval(mouthTimer); mouthTimer = null;
  if (avatar) { avatar.setVoiceLevel(0); avatar.setSpeaking(false); }
}

// せりふ（タグつきのまま）を、文字と、合図（どの文字でどのしぐさ）に分ける
function parse(raw, cls) {
  const cues = [];
  let emotion = null, text = "", last = 0, m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(raw))) {
    text += raw.slice(last, m.index); last = m.index + m[0].length;
    if (m[1]) cues.push({ at: text.length, motion: m[1], force: true });
    else if (!text.length) emotion = m[2];
    else cues.push({ at: text.length, emotion: m[2] });
  }
  text += raw.slice(last);
  let silent = false;
  if (!cues.length && !emotion) {
    for (const r of RULES) {
      if (r.cls && r.cls !== cls) continue;
      const hit = r.re ? r.re.exec(text) : { index: 0 };
      if (!hit) continue;
      if (r.motion) cues.push({ at: hit.index, motion: r.motion });
      emotion = r.emotion || null; silent = !!r.silent;
      break;
    }
  }
  return { text: text, cues: cues, emotion: emotion, silent: silent };
}

const ACT = {
  // せりふが出はじめた
  say: function (raw, cls) {
    if (!avatar) return;
    hush();
    const p = parse(String(raw || ""), cls);
    avatar.setEmotion(p.emotion, { playMotion: false });
    // j: いま画面に出ている文字の数。合図は、その文字が出たところで出す
    const fire = function (j) {
      while (p.cues.length && p.cues[0].at <= j) {
        const c = p.cues.shift();
        if (c.motion) play(c.motion, c.force);
        if (c.emotion) avatar.setEmotion(c.emotion, { playMotion: false });
      }
    };
    fire(0);
    endTalk = function () { fire(Infinity); };
    if (p.silent || !p.text.length) return;
    // 口は、文字が出ている間だけ動かす（全部の文字は「言わ」ない。ゆっくり、ぱく、ぱく）
    const t0 = performance.now();
    let k = 0, endAt = Infinity;
    endTalk = function () { fire(Infinity); endAt = Math.max(performance.now(), t0 + TUNE.sukunakutomoMs); };
    avatar.setSpeaking(true);
    const beatMouth = function () {
      if (performance.now() >= endAt) { hush(); return; }
      // はじめの1回は、まだ前のせりふが画面に残っているので、数えない
      const j = k === 0 ? 0 : Math.min(line ? line.textContent.length : p.text.length, p.text.length);
      fire(j);
      const ch = p.text[j - 1] || "";
      avatar.setVoiceLevel(endAt === Infinity && STOP.test(ch) ? 0 : (k % 2 ? 0.35 : 0.95));
      k++;
    };
    beatMouth();
    mouthTimer = setInterval(beatMouth, TUNE.yomuMs);
  },
  // せりふの文字が、出おわった（押して、一度に出したときも）
  said: function () {
    if (endTalk) { const f = endTalk; endTalk = null; f(); }
  },
  // 表情の絵が切りかわった（null 待つ / think 見る / hit 当たり / miss 外れ）
  face: function (name) {
    const prev = lastFace; lastFace = name || null;
    if (name === "think" || name === "hit" || name === "miss") { hush(); return; }
    if (prev === "miss") setTimeout(function () { play("shy", true); }, 200);       // 外したあと、照れながら戻る
    else if (prev === "hit") setTimeout(function () { play("nod", true); }, 200);   // 当てたあと、うなずいて戻る
  },
  // 遊ぶ人が、答えを選んだ
  answered: function () {
    if (performance.now() - lastMotion > TUNE.unazukiMs) play("nod");
  },
  // 遊ぶ人が、画面をつついた
  nudged: function () {
    if (performance.now() - lastMotion > TUNE.tsutsukiMs) play(Math.random() < 0.5 ? "wink" : "tilt");
  }
};

async function start() {
  if (!canvas || calm || q.has("noavatar")) return;
  const BASE = "avatar/natsume/";
  const rig = await (await fetch(BASE + "rig.json")).json();
  avatar = await createMeshAvatar(canvas, { rig: rig, assetsBase: BASE + "built/", padTop: 0, padSide: 0 });
  avatar.setAutoIdle(true);    // まばたきや、小さなしぐさ
  avatar.setAutoMotion(false); // 大きなしぐさは、せりふに合わせて出す
  avatar.setTalkGain(0.5);     // しゃべるときの頭のゆれは、ひかえめに
  avatar.setLipSync({ openness: TUNE.kuchi });
  window.NATSUME = avatar;     // 確かめる用
  window.NATSUME_ACT = ACT;
  scene.classList.add("live");
}

start().catch(function (e) { console.warn("なつめ君を動かせなかったので、絵のまま進めます:", e); });
