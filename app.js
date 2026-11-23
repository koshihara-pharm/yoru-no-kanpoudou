// 体を当てる占い（試作）の動き。台本と、流れ・数の調整は data.js（flow と tune）。
// 2026-11-22 に作りかえた。桜井さんの原則から入れたもの（docs/11、docs/13）:
// - 遊ぶ人が、先に悩みをひとつ心に決める。なつめは、それを当てにいく
// - 問いと当てを交互に出す（途中にごほうび）。外れたら、問いを足してから、もう一度当てにいく
// - 答えるたびに水晶が澄む（目の前に吊られたごほうび）。どの答えにも、水晶と音が返る（ノーリアクションを排除）
// - 当たった瞬間は、画面を一拍止めてから、光・音・表情（ヒットストップ。悩みの当てがいちばん大きい）
// - 悩みを言う前は、ゆっくり、暗く、ためる。肝心の言葉は一度に出す（ギュッとしてパッと）
// - 外れは短く。待ちは、どこを押しても進む（遅さは罪）
(function () {
  "use strict";

  const D = window.URANAI;
  const TU = D.tune;
  const $ = function (id) { return document.getElementById(id); };
  const q = new URLSearchParams(location.search);
  const FAST = q.has("fast"); // 確かめる用。文字送りと間をなくす
  const CALM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); // 光やゆれを弱める
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, FAST ? 0 : ms); }); };

  // ---------- 音（その場で作る） ----------
  // 当たりの音は、出だしを強く、余韻は短めに
  const SCALE = [523, 587, 659, 784, 880, 988, 1047, 1175, 1319, 1568, 1760];
  const SND = {
    ctx: null, on: true,
    init: function () {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },
    tone: function (f, dur, type, vol, when) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(vol || 0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    },
    tick: function () { this.tone(900, 0.03, "triangle", 0.025); },
    // 札に、朱で丸をつける（筆をおく、小さな音）
    maru: function () { this.tone(190, 0.07, "triangle", 0.07); this.tone(740, 0.05, "triangle", 0.022, 0.015); },
    // 札が、水晶に吸いこまれる（上がっていく音）
    suu: function () {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(1568, t + 0.55);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.62);
    },
    nudge: function () { this.tone(1320, 0.07, "sine", 0.018); },
    // 答えるたびに、少しずつ高くなる（近づいている感じ）
    answer: function (step) {
      const f = SCALE[Math.min(Math.max(step, 1), SCALE.length) - 1];
      this.tone(f, 0.38, "sine", 0.06); this.tone(f * 2, 0.22, "sine", 0.022, 0.03);
    },
    thump: function (v) { this.tone(150, 0.11, "triangle", v); this.tone(75, 0.16, "sine", v); },
    // 当たった瞬間（画面を止めるのと同時）
    impact: function (size) {
      if (size === "l") { this.thump(0.22); this.tone(2093, 0.12, "triangle", 0.1); }
      else if (size === "m") { this.thump(0.15); this.tone(1175, 0.4, "triangle", 0.11); this.tone(1760, 0.42, "sine", 0.07, 0.04); this.tone(2349, 0.45, "sine", 0.04, 0.09); }
      else { this.thump(0.1); this.tone(1319, 0.3, "triangle", 0.09); this.tone(1976, 0.32, "sine", 0.045, 0.04); }
    },
    // 悩みが当たったとき、止めが明けた瞬間に鳴らす
    fanfare: function () {
      const s = this;
      s.thump(0.18);
      [784, 988, 1175, 1568, 1976].forEach(function (f) { s.tone(f, 0.6, "triangle", 0.075); });
      [1568, 1976, 2349, 3136].forEach(function (f, i) { s.tone(f, 0.4, "sine", 0.05, 0.1 + i * 0.07); });
    },
    some: function () { this.tone(988, 0.45, "sine", 0.07); this.tone(1319, 0.3, "sine", 0.03, 0.05); },
    miss: function () { this.tone(150, 0.3, "triangle", 0.12); this.tone(110, 0.4, "sine", 0.09, 0.08); },
    pop: function () { this.tone(1568, 0.16, "triangle", 0.07); this.tone(392, 0.2, "sine", 0.06); },
    reveal: function () { const s = this; [523, 659, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, 1.4, "sine", 0.06, i * 0.11); }); },
    // 悩みを言う前の、低い音。止める関数を返す
    drone: function () {
      if (!this.on || !this.ctx || FAST) return function () {};
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = "sine"; o.frequency.setValueAtTime(82, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 1.2);
      o.connect(g).connect(c.destination); o.start(t);
      return function () {
        const n = c.currentTime;
        try { g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.12); o.stop(n + 0.15); } catch (e) { /* もう止まっている */ }
      };
    }
  };

  // ---------- 鍋の絵 ----------
  // 体質ごとの形は、data.js の types の nabe から読む（mizu 水の量 0〜1 / hi 火の大きさ / naka 鍋の中の色 / kazari かざり）。
  // 体質が増えても、ここは直さなくてよい。かざりの部品は下の KAZARI。新しい部品がほしいときは、ここに足すか、nabe.svg に絵を直接書く
  const KAZARI = {
    // 上にのぼる、赤い湯気（からだきに近い）
    yuge: '<g class="steam" fill="none" stroke="#e8743a" stroke-width="3" stroke-linecap="round"><path d="M44 40 q-6 -9 0 -18"/><path d="M60 38 q6 -10 0 -20"/><path d="M76 40 q-6 -9 0 -18"/></g>',
    // ふたと、わきからもれる湯気
    futa: '<g class="lid"><path d="M22 50 Q60 24 98 50Z" fill="#6a5d54" stroke="#2a211a" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="33" r="5" fill="#8a7a6e" stroke="#2a211a" stroke-width="2"/></g>' +
      '<g class="steam" fill="#f3ecdf"><circle cx="13" cy="50" r="5"/><circle cx="6" cy="42" r="3.5"/><circle cx="107" cy="50" r="5"/><circle cx="114" cy="42" r="3.5"/></g>',
    // ふちからあふれる水
    afure: '<path d="M20 52 Q60 44 100 52 V58 H20Z" fill="#7fc4dc"/><g fill="#7fc4dc"><path d="M14 62 q-4 8 0 12 q4 -4 0 -12Z"/><path d="M106 66 q-4 8 0 12 q4 -4 0 -12Z"/><path d="M10 82 q-3 6 0 9 q3 -3 0 -9Z"/></g>'
  };
  function potSVG(type) {
    const N = D.types[type].nabe || {};
    const water = N.mizu == null ? 0.6 : N.mizu;
    const flame = N.hi == null ? 1 : N.hi;
    const h = 44 * water, y = 100 - h;
    const extra = [].concat(N.kazari || []).map(function (k) { return KAZARI[k] || ""; }).join("") + (N.svg || "");
    return '<svg viewBox="0 0 120 134" role="img" aria-label="' + D.types[type].name + '">' +
      '<path d="M30 104 L24 128 M90 104 L96 128" stroke="#2a211a" stroke-width="4" stroke-linecap="round"/>' +
      '<g class="flame" transform="translate(60 128) scale(' + flame + ') translate(-60 -128)"><path d="M60 100 Q76 114 68 124 Q60 131 52 124 Q44 114 60 100Z" fill="#f08a2a"/><path d="M60 110 Q68 118 64 124 Q60 128 56 124 Q52 118 60 110Z" fill="#ffd35a"/></g>' +
      '<path d="M22 52 H98 V86 Q98 104 80 104 H40 Q22 104 22 86Z" fill="#4a403a" stroke="#2a211a" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect x="27" y="56" width="66" height="44" rx="6" fill="' + (N.naka || "#2a2422") + '"/>' +
      '<rect x="27" y="' + y.toFixed(1) + '" width="66" height="' + h.toFixed(1) + '" rx="5" fill="#7fc4dc"/>' +
      '<rect x="27" y="' + y.toFixed(1) + '" width="66" height="3" fill="#c5e8f3"/>' +
      '<rect x="16" y="47" width="88" height="8" rx="4" fill="#6a5d54" stroke="#2a211a" stroke-width="2.5"/>' +
      '<rect x="8" y="60" width="14" height="8" rx="4" fill="#6a5d54" stroke="#2a211a" stroke-width="2"/><rect x="98" y="60" width="14" height="8" rx="4" fill="#6a5d54" stroke="#2a211a" stroke-width="2"/>' +
      extra + "</svg>";
  }

  // ---------- せりふ ----------
  const T = { typing: false, timer: null, full: "", finish: null, waitTap: null };

  // opt.ms: 文字送りの速さ / opt.quiet: 文字送りの音を出さない / opt.instant: 一度に出す / opt.sub: すぐ下に小さく出す文
  function speak(text, cls, opt) {
    opt = opt || {};
    return new Promise(function (res) {
      $("who").textContent = D.name;
      const el = $("line");
      el.className = "line" + (cls ? " " + cls : "");
      $("sub").textContent = opt.sub || "";
      $("more").hidden = true;
      clearInterval(T.timer);
      T.full = text;
      if (FAST || opt.instant) { el.textContent = text; T.typing = false; T.finish = null; res(); return; }
      let i = 0;
      el.textContent = "";
      T.typing = true;
      T.finish = function () { clearInterval(T.timer); T.typing = false; el.textContent = T.full; T.finish = null; res(); };
      T.timer = setInterval(function () {
        i++;
        el.textContent = T.full.slice(0, i);
        if (!opt.quiet && i % 3 === 0) SND.tick();
        if (i >= T.full.length) T.finish();
      }, opt.ms || TU.mojiMs);
    });
  }

  // 押されるまで待つ（▼ を出す）
  function pause() {
    if (FAST) return Promise.resolve();
    return new Promise(function (res) {
      $("more").hidden = false;
      T.waitTap = function () { T.waitTap = null; $("more").hidden = true; res(); };
    });
  }

  // 少しだけ待つ。押せば、すぐ進む
  function beat(ms) {
    if (FAST) return Promise.resolve();
    return new Promise(function (res) {
      const t = setTimeout(done, ms);
      function done() { clearTimeout(t); T.waitTap = null; res(); }
      T.waitTap = done;
    });
  }

  // どこを押しても、何かが起きる: 文字送り中 → 全文 / 待ち → 次へ / 答えを選ぶところ → 水晶が小さくゆれる
  function tap() {
    if (T.typing && T.finish) { T.finish(); return; }
    if (T.waitTap) { T.waitTap(); return; }
    if (S && !S.done) { pulse(); SND.nudge(); }
  }

  async function say(lines, cls) {
    for (const ln of [].concat(lines)) { await speak(ln, cls); await pause(); }
  }

  // 短いひとこと。読める長さだけ待って、自分で進む（押せば、すぐ進む）
  async function sayShort(text, cls, base) {
    await speak(text, cls || "soft");
    await beat((base || TU.echoMs) + text.length * (TU.mojiYomuMs || 50));
  }

  function choose(options, layout) {
    return new Promise(function (res) {
      const box = $("answers");
      box.innerHTML = "";
      box.className = "answers" + (layout ? " " + layout : "");
      options.forEach(function (o) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn" + (o.cls ? " " + o.cls : "");
        if (o.icon) { b.innerHTML = o.icon; const sp = document.createElement("span"); sp.textContent = o.label; b.append(sp); b.classList.add("with-icon"); }
        else b.textContent = o.label;
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          if (T.typing && T.finish) T.finish();
          box.innerHTML = "";
          res(o);
        });
        box.append(b);
      });
    });
  }

  // ---------- 場面の動き ----------
  const scene = $("scene");
  const stage = $("stage");
  // 場面の名前ごとに、占い師の表情の絵を切りかえる（待つ / 見る / 当たり / 外れ）
  const FACE = { think: "miru", hit: "atari", miss: "hazure" };
  function fx(name) {
    scene.classList.remove("think", "hit", "miss", "stop", "hit-s", "hit-m", "hit-l", "flare");
    scene.dataset.face = FACE[name] || "matsu";
    if (name) { void scene.offsetWidth; scene.classList.add(name); }
  }
  function stamp(text, cls) {
    const s = $("stamp");
    s.className = "stamp" + (cls ? " " + cls : "");
    s.textContent = text;
    void s.offsetWidth;
    s.classList.add("show");
    clearTimeout(stamp.t);
    stamp.t = setTimeout(function () { s.classList.remove("show"); }, 1900); // 動きを弱めているときも、印が残らないように
  }
  function renderDots(el, marks, total) {
    el.innerHTML = "";
    for (let i = 0; i < Math.max(total, marks.length); i++) {
      const d = document.createElement("div");
      d.className = "dot" + (marks[i] ? " " + marks[i] : "") + (i === marks.length - 1 ? " pop" : "");
      el.append(d);
    }
  }

  // 水晶の澄みぐあい（0 くもり 〜 1 澄みきる）。数字は見せない。光と、くもりの濃さで見せる
  function setClear(v) {
    scene.style.setProperty("--clear", String(Math.max(0, Math.min(1, v))));
  }
  // 水晶から、輪がひとつ広がる
  function pulse() {
    const r = $("ring");
    r.classList.remove("go");
    void r.offsetWidth;
    r.classList.add("go");
  }
  // 水晶から、光の粒が飛ぶ
  function sparks(n) {
    if (CALM || FAST) return;
    const box = $("sparks");
    box.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.style.setProperty("--a", Math.round(360 / n * i + Math.random() * 24) + "deg");
      s.style.setProperty("--d", Math.round(80 + Math.random() * 110) + "px");
      s.style.animationDelay = Math.round(Math.random() * 90) + "ms";
      box.append(s);
    }
    clearTimeout(sparks.t);
    sparks.t = setTimeout(function () { box.innerHTML = ""; }, 1400);
  }
  function quake() {
    if (CALM || FAST) return;
    stage.classList.remove("quake");
    void stage.offsetWidth;
    stage.classList.add("quake");
    clearTimeout(quake.t);
    quake.t = setTimeout(function () { stage.classList.remove("quake"); }, 700);
  }

  // 当たりの手応え: 一拍止める → 光・音・表情。size: s 小さな当て / m 体のしるし / l 悩み
  async function hitFx(size) {
    scene.classList.remove("think", "miss", "dim", "hit", "hit-s", "hit-m", "hit-l", "flare");
    scene.dataset.face = "atari";
    scene.classList.add("stop");
    SND.impact(size);
    await sleep(TU.tome[size] * (CALM ? 0.5 : 1));
    scene.classList.remove("stop");
    void scene.offsetWidth;
    scene.classList.add("hit", "hit-" + size);
    stamp("的中", size === "l" ? "big" : size === "s" ? "small" : "");
    if (size === "l") { SND.fanfare(); quake(); sparks(18); }
    else if (size === "m") sparks(7);
  }
  function missFx() {
    scene.classList.remove("dim");
    fx("miss");
    stamp("はずれ", "miss");
    SND.miss();
  }
  function someFx(text) {
    scene.classList.remove("dim");
    fx(null);
    pulse();
    if (text) stamp(text, "small");
    SND.some();
  }

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  // ---------- 占いの状態 ----------
  // 体質の一覧は、data.js の types から読む（数も名前も、ここには書かない。同じ点のときは、types に書いた順）
  const ORDER = Object.keys(D.types);
  // 体の当ての数（flow の ate の n の合計）。印の数は、これに悩みの当て（1〜3回）が足される
  const BODY = D.flow.reduce(function (n, st) { return n + (st.do === "ate" ? (st.n || 1) : 0); }, 0);
  let S = null;

  function reset() {
    S = {
      scores: ORDER.reduce(function (o, t) { o[t] = 0; return o; }, {}),
      profile: {}, shita: {}, phase: "", done: false,
      asked: 0, askedNames: {}, answers: [],      // 問い
      usedGuess: {}, last: null, lastMiss: false, // 体の当て
      marks: [], bodyMarks: [], hitWords: [], guessMissCats: {},
      nayamiUsed: {}, nayamiMissCats: {}, nayamiTries: 0, // 悩みの当て
      nayami: "", nayamiCat: "", nayamiHow: "",   // nayamiHow: atari 当たり / chikai 近い / kiita 教えてもらった / ""
      told: "", toldLabel: "",
      type: null, act: "", rate: 0, lost: false,
      times: { start: performance.now(), firstGuess: 0, end: 0 }
    };
    scene.classList.remove("reveal", "vision", "dim");
    stage.classList.remove("quake");
    fx(null);
    setClear(0);
    $("inBall").innerHTML = "";
    $("sparks").innerHTML = "";
    $("answers").innerHTML = "";
    $("sub").textContent = "";
    $("profile").hidden = true;
    setChip("");
    renderDots($("dots"), [], BODY + 1);
    $("dots").hidden = true;
  }

  function setChip(t) { $("chip").textContent = t; }

  // 点の高い順に並べた体質（同じ点なら ORDER の順）
  function ranked() {
    return ORDER.slice().sort(function (a, b) { return S.scores[b] - S.scores[a] || ORDER.indexOf(a) - ORDER.indexOf(b); });
  }
  function top() { return ranked()[0]; }

  function addW(w) {
    Object.keys(w || {}).forEach(function (t) { if (t in S.scores) S.scores[t] += w[t]; });
  }

  function mainType(o) {
    let best = null;
    Object.keys(o.w).forEach(function (k) { if (best === null || o.w[k] > o.w[best]) best = k; });
    return best;
  }

  function shuffled(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function pickReply(kind) {
    const list = D.replies[kind];
    return list[S.marks.length % list.length];
  }

  function mark(kind, body) {
    S.marks.push(kind);
    if (body) S.bodyMarks.push(kind);
    $("dots").hidden = false;
    renderDots($("dots"), S.marks, BODY + 1);
  }

  function matches(when) {
    return Object.keys(when).every(function (k) { return when[k].indexOf(S.profile[k]) !== -1; });
  }

  const ANS3 = [{ label: "当たり", v: "hit", cls: "yes" }, { label: "ときどき", v: "some" }, { label: "はずれ", v: "miss" }];
  const ANS_N = [{ label: "当たり", v: "hit", cls: "yes" }, { label: "近い", v: "some" }, { label: "はずれ", v: "miss" }];

  // ---------- はじめの札（年齢、性別、体型）。1枚の札の上で、押して選ぶ。当たりやすくするために、裏で使う ----------
  function askProfile() {
    return new Promise(function (res) {
      const P = D.profile, picked = {};
      S.phase = "fuda";
      $("pfTitle").textContent = P.title;
      $("pfLead").textContent = P.lead;
      $("pfNote").textContent = P.note;
      const ok = $("pfOk");
      ok.textContent = P.ok;
      const rowsEl = $("pfRows");
      rowsEl.innerHTML = "";
      const rowEls = {};
      const card = $("pfCard"), sheet = $("profile");
      card.classList.remove("stamped", "go");
      sheet.classList.remove("busy");
      $("pfInJi").textContent = P.seal || "";

      function shown(row) {
        return !row.onlyIf || Object.keys(row.onlyIf).every(function (k) { return picked[k] && picked[k].v === row.onlyIf[k]; });
      }
      function clearRow(id) {
        delete picked[id];
        rowEls[id].classList.remove("picked");
        rowEls[id].querySelectorAll(".pf-chip").forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      }
      function refresh() {
        let done = true;
        P.rows.forEach(function (row) {
          const vis = shown(row);
          rowEls[row.id].hidden = !vis;
          if (!vis) clearRow(row.id);
          else if (!picked[row.id]) done = false;
        });
        ok.disabled = !done;
      }

      P.rows.forEach(function (row) {
        const wrap = document.createElement("div");
        wrap.className = "pf-row";
        const lab = document.createElement("div");
        lab.className = "pf-label";
        lab.textContent = row.label;
        const chips = document.createElement("div");
        chips.className = "pf-chips" + (row.options[0].img || row.options[0].icon ? " icons" : "");
        row.options.forEach(function (o) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pf-chip";
          if (o.img || o.icon) {
            if (o.img) { const im = document.createElement("img"); im.src = o.img; im.alt = ""; b.append(im); }
            else b.innerHTML = o.icon;
            const sp = document.createElement("span"); sp.textContent = o.label; b.append(sp);
          }
          else b.textContent = o.label;
          if (o.label.length >= 6) b.classList.add("long");
          b.setAttribute("aria-pressed", "false");
          b.addEventListener("click", function () {
            if (sheet.classList.contains("busy")) return;
            clearRow(row.id);
            picked[row.id] = o;
            wrap.classList.add("picked");
            b.classList.add("on");
            b.setAttribute("aria-pressed", "true");
            SND.maru();
            refresh();
          });
          chips.append(b);
        });
        wrap.append(lab, chips);
        rowsEl.append(wrap);
        rowEls[row.id] = wrap;
      });
      refresh();

      ok.onclick = async function () {
        if (ok.disabled || sheet.classList.contains("busy")) return;
        sheet.classList.add("busy");
        P.rows.forEach(function (row) {
          const o = picked[row.id];
          S.profile[row.id] = o ? o.v : "";
          if (o && o.w) addW(o.w);
        });
        if (S.profile.sex === "m") S.profile.tsuki = "nai";
        // わたす: なつめのはんこが落ちる → 一拍 → 札が水晶に吸いこまれる → 水晶が返事をする
        if (!FAST) {
          sheet.scrollTop = 0;
          card.classList.add("stamped");
          await sleep(150);
          SND.thump(0.2); quake();
          await sleep(CALM ? 500 : 620);
          if (!CALM) {
            const a = card.getBoundingClientRect(), o = $("orb").getBoundingClientRect();
            card.style.setProperty("--fx", Math.round(o.left + o.width / 2 - (a.left + a.width / 2)) + "px");
            card.style.setProperty("--fy", Math.round(o.top + o.height / 2 - (a.top + a.height / 2)) + "px");
            card.classList.add("go");
            SND.suu();
            await sleep(600);
          }
        }
        sheet.hidden = true;
        sheet.classList.remove("busy");
        card.classList.remove("stamped", "go");
        pulse();
        SND.some();
        res();
      };
      $("profile").hidden = false;
      $("profile").scrollTop = 0;
    });
  }

  // ---------- 問い ----------
  // ひとつ聞く。答えたら、必ず水晶と音が返る。返しのひとことがある答えには、なつめが返す
  async function askScene(sc) {
    S.phase = "toi";
    fx(null);
    scene.classList.add("vision");
    setChip("水晶の中　" + sc.time);
    await speak(sc.text);
    const o = await choose(shuffled(sc.options));
    addW(o.w);
    S.answers.push({ sc: sc, o: o });
    S.askedNames[sc.name] = true;
    S.asked++;
    setClear(S.asked / TU.suishoToi);
    pulse();
    SND.answer(S.asked);
    if (o.echo) await sayShort(o.echo);
    else await sleep(160);
  }

  // 「夏の一日」の場面を、上から順に
  function nextScene() {
    return D.scenes.filter(function (sc) { return !S.askedNames[sc.name]; })[0] || null;
  }

  // その問いが、体質 a と b をどれだけ見分けられるか。a に寄る答えと、b に寄る答えの、両方があるものだけ
  function separation(sc, a, b) {
    let da = 0, db = 0;
    sc.options.forEach(function (o) {
      const wa = o.w[a] || 0, wb = o.w[b] || 0;
      da = Math.max(da, wa - wb);
      db = Math.max(db, wb - wa);
    });
    return da > 0 && db > 0 ? da + db + (sc.src === "draft" ? 0 : 0.25) : 0; // 同じなら、下書きでないほうを先に
  }

  // 手持ち（場面のあまり＋足した問い）から、いまの上位2つの体質を、いちばん見分けやすい問いを選ぶ
  function pickQuestion() {
    const r = ranked(), a = r[0], b = r[1];
    const pool = D.scenes.concat(D.extra || []).filter(function (sc) { return !S.askedNames[sc.name]; });
    let best = null, bestV = -1;
    pool.forEach(function (sc) { const v = separation(sc, a, b); if (v > bestV) { best = sc; bestV = v; } });
    return best;
  }

  // ---------- 体のしるしを当てる ----------
  // big が true のものは、体のしるしを2つ当てる段（size m）で先に使う。鏡がいるもの（check）は、あとまわし
  function nextGuess(t, wantBig) {
    let best = null, bestR = 9;
    D.types[t].guesses.forEach(function (g, i) {
      if (S.usedGuess[t + i]) return;
      const r = g.check ? 2 : (!!g.big === wantBig ? 0 : 1);
      if (r < bestR) { best = { g: g, key: t + i }; bestR = r; }
    });
    return best;
  }

  async function guessOne(size, lead) {
    const t = top();
    if (S.last && t !== S.last && S.lastMiss) { fx(null); await speak(D.replies.switched, "soft"); await pause(); }
    S.last = t;
    for (;;) {
      const c = nextGuess(t, size !== "s");
      if (!c) return;
      S.usedGuess[c.key] = true;
      const g = c.g;
      S.phase = "ate";
      fx("think");
      if (lead) { await speak(D.guessLead, "soft"); await beat(700); }
      else { await speak("……", "think"); await beat(450); }
      lead = false;
      if (!S.times.firstGuess) S.times.firstGuess = performance.now();
      await speak(g.text, "guess");
      const opts = g.check ? ANS3.concat([{ label: "いまは見られない", v: "skip", cls: "quiet" }]) : ANS3;
      const a = await choose(opts, "three");
      if (a.v === "skip") { fx(null); pulse(); SND.nudge(); await sayShort(D.replies.skip); continue; }
      S.scores[t] += a.v === "hit" ? TU.ten.atari : a.v === "some" ? TU.ten.tokidoki : TU.ten.hazure;
      S.lastMiss = a.v === "miss";
      if (a.v === "miss" && g.cat) S.guessMissCats[g.cat] = true;
      if (a.v !== "miss" && g.word) S.hitWords.push({ t: t, word: g.word, big: !!g.big, cat: g.cat || "" });
      if (a.v === "hit") {
        await hitFx(size);
        mark("hit", true);
        await sayShort(pickReply("hit"), "soft", TU.atariMs);
      } else if (a.v === "some") {
        someFx();
        mark("some", true);
        await sayShort(pickReply("some"), "soft", TU.atariMs - 300);
      } else {
        // 外れは短く。なつめが照れて、すぐ次へ
        missFx();
        mark("miss", true);
        await speak(pickReply("miss"), "soft");
        await beat(TU.hazureMs - 300);
      }
      fx(null);
      return;
    }
  }

  // ---------- 心に決めた悩みを当てる（山場） ----------
  // 次に言う悩み。いまの上位の体質の手持ちから。はじめの札に合うものを先に。もう外れた種類は言わない。
  // 体のしるしで「はずれ」だった種類は、あとまわし
  function nextNayami() {
    const r = ranked();
    for (let k = 0; k < r.length; k++) {
      const t = r[k];
      const list = D.types[t].nayami.filter(function (n) {
        return !S.nayamiUsed[t + n.short] && !S.nayamiMissCats[n.cat] && (!n.when || matches(n.when));
      });
      if (!list.length) continue;
      const rank = function (n) { return (n.saki && n.when ? 0 : 1) + (S.guessMissCats[n.cat] ? 2 : 0); };
      let best = list[0];
      list.forEach(function (n) { if (rank(n) < rank(best)) best = n; });
      return { t: t, n: best };
    }
    return null;
  }

  async function guessNayami() {
    S.phase = "nayami";
    fx(null);
    if (D.nayamiIntro && D.nayamiIntro.length) await say(D.nayamiIntro, "soft");
    let lastT = null;
    for (let i = 0; i < TU.nayamiKai; i++) {
      const c = nextNayami();
      if (!c) break;
      if (lastT && c.t !== lastT) await sayShort(D.nayamiSwitched);
      lastT = c.t;
      S.nayamiUsed[c.t + c.n.short] = true;
      S.nayamiTries = i + 1;

      // ためる: 水晶を暗くして、ゆっくり。音は引く
      S.phase = "nayami-tame";
      fx("think");
      scene.classList.add("dim");
      const stopDrone = SND.drone();
      await speak(D.nayamiTame[Math.min(i, D.nayamiTame.length - 1)], "tame", { ms: i === 0 ? TU.tameMojiMs : TU.tameMojiMs * 0.6, quiet: true });
      await beat(i === 0 ? TU.tameMs : TU.tameMs * 0.5);
      stopDrone();

      // 一気に: 肝心の言葉は、一度に出す
      scene.classList.remove("dim");
      scene.classList.add("flare");
      pulse();
      SND.pop();
      S.phase = "nayami";
      await speak(D.nayamiAsk.replace("〈悩み〉", c.n.key), "key", { instant: true, sub: c.n.detail });
      const a = await choose(ANS_N, "three");

      if (a.v === "hit") {
        S.scores[c.t] += TU.ten.nayamiAtari;
        S.nayami = c.n.short; S.nayamiCat = c.n.cat; S.nayamiHow = "atari";
        await hitFx("l");
        mark("hit");
        await speak(D.nayamiHit[0], "guess");
        await beat(TU.atariMs + 500);
        await speak(D.nayamiHit[1], "soft");
        await pause();
        fx(null);
        return;
      }
      if (a.v === "some") {
        S.scores[c.t] += TU.ten.tokidoki;
        S.nayami = c.n.short; S.nayamiCat = c.n.cat; S.nayamiHow = "chikai";
        someFx("近い");
        mark("some");
        await speak(D.nayamiSome, "soft");
        await pause();
        return;
      }
      // 外れ: 短く。問いをひとつ足して、もう一度
      S.scores[c.t] += TU.ten.nayamiHazure;
      S.nayamiMissCats[c.n.cat] = true;
      missFx();
      mark("miss");
      await speak(D.nayamiMiss[Math.min(i, D.nayamiMiss.length - 1)], "soft");
      await beat(TU.hazureMs - 400);
      if (i === TU.nayamiKai - 1) break;
      const sc = pickQuestion();
      if (!sc) continue;
      fx(null);
      await sayShort(D.nayamiMore, "soft", 500);
      await askScene(sc);
      setChip("");
      scene.classList.remove("vision");
    }

    // 3回外した: 負けを認めて、教えてもらう
    S.phase = "oshiete";
    const O = D.oshiete;
    scene.dataset.face = "hazure";
    await speak(O.lose, "soft");
    await pause();
    fx(null);
    await speak(O.ask, "soft");
    const cats = O.cats.filter(function (c) { return !c.notIf || !matches(c.notIf); });
    const picked = await choose(cats, "cats");
    S.told = picked.id;
    S.toldLabel = picked.label;
    if (picked.id !== "iwanai" && picked.id !== "hoka") S.nayamiHow = "kiita";
    pulse();
    SND.some();
    await speak(picked.id === "iwanai" ? O.iwanai : picked.id === "hoka" ? O.hoka : O.got.replace("〈悩み〉", picked.label), "soft");
    await pause();
  }

  // ---------- 鍋を明かす ----------
  async function showNabe() {
    S.phase = "nabe";
    S.type = top();
    const TY = D.types[S.type];
    fx("think");
    await speak("……", "think");
    await beat(700);
    scene.classList.remove("think"); // 目をとじたまま、水晶の中に鍋が見えてくる
    $("inBall").innerHTML = potSVG(S.type);
    setClear(1);
    scene.classList.add("reveal");
    SND.reveal();
    await speak(D.seen, "guess");
    await pause();
    fx(null);

    // 当たったものだけを並べて、「根はひとつ」と言う
    const link = TY.link || {};
    const nCat = S.nayamiHow === "kiita" ? S.told : S.nayamiCat; // 悩みと同じ種類のしるしは、二重に言わない
    const words = S.hitWords.filter(function (h) { return h.t === S.type && !(nCat && h.cat === nCat); })
      .sort(function (x, y) { return (y.big ? 1 : 0) - (x.big ? 1 : 0); }) // 強いしるしを先に
      .slice(0, 2).map(function (h) { return h.word; });
    if (S.nayamiHow === "atari" || S.nayamiHow === "chikai") words.push(S.nayami);
    else if (S.nayamiHow === "kiita" && link[S.told]) words.push(S.toldLabel);
    await speak(words.length >= 2 ? D.rootLead.replace("〈しるし〉", words.map(function (w) { return w + "も"; }).join("、")) : D.rootLeadFew);
    await pause();
    await say(TY.root);

    // 悩みと、この鍋のつながり。つながらないものは、正直に「読めません」と言う
    if ((S.nayamiHow === "atari" || S.nayamiHow === "chikai") && link[S.nayamiCat]) {
      await speak(link[S.nayamiCat]);
      await pause();
    } else if (S.nayamiHow === "kiita") {
      S.linked = !!link[S.told];
      await speak(D.oshiete.linkLead.replace("〈悩み〉", S.toldLabel), "soft");
      await beat(900);
      await speak(link[S.told] || D.oshiete.linkNone);
      await pause();
    }
    await say([TY.reframe].concat(D.praise), "soft");
  }

  // 場面の種明かし: その人の体質に結びついた答えを、いくつか取りあげる
  async function taneakashi() {
    S.phase = "tane";
    const hits = S.answers
      .filter(function (a) { return mainType(a.o) === S.type; })
      .sort(function (a, b) { return b.o.w[S.type] - a.o.w[S.type]; })
      // 舌の答えは点が大きいので、種明かしが舌ばかりにならないように、舌は1つまで
      .filter(function (a) { if (!a.sc.shita) return true; if (taneakashi.shita) return false; taneakashi.shita = true; return true; })
      .slice(0, TU.taneKazu);
    taneakashi.shita = false;
    if (hits.length) {
      await speak(D.tanehead, "soft");
      await pause();
      for (const a of hits) {
        await speak("「" + a.sc.name + "」で、あなたは、" + a.o.tell + "ね。" + D.taneTail.replace("〈EYE〉", a.sc.eye));
        await pause();
      }
    }
    await speak(D.taneClose, "soft");
    await pause();
  }

  // 暮らしの一手
  async function youjou() {
    S.phase = "youjou";
    const TY = D.types[S.type];
    await speak(D.pickPrompt);
    const picks = TY.picks.map(function (p) { return { label: p.label, act: p.act }; }).concat([{ label: D.pickNone, act: "", cls: "quiet" }]);
    const p = await choose(picks);
    pulse();
    SND.answer(6);
    S.act = p.act || TY.fallback;
    await speak(p.act ? D.afterPick : D.afterNone, "soft");
    await pause();
    await speak(S.act + (D.actTail || "。"), "guess");
    await pause();
  }

  // ---------- 流れ（data.js の flow を、上から順に） ----------
  const STEP = {
    kokoro: async function () {
      S.phase = "kokoro";
      const K = D.kokoro;
      await say(K.lines.slice(0, -1), "soft");
      await speak(K.lines[K.lines.length - 1], "soft");
      await choose([{ label: K.button, cls: "yes" }]);
      S.kokoro = true;
      pulse();
      SND.some();
      if (K.after) await sayShort(K.after, "soft", 700);
    },
    hajime: async function () {
      S.phase = "hajime";
      await say(D.introScenes, "soft");
    },
    // 舌を見る。遊ぶ人が鏡で見て、近い図を押す（色 → 形 → 苔）。見られない人は、とばせる
    shita: async function () {
      const Z = D.shita;
      S.phase = "shita";
      fx(null);
      await say(Z.lines.slice(0, -1), "soft");
      await speak(Z.lines[Z.lines.length - 1], "soft");
      const go = await choose([{ label: Z.button, cls: "yes", v: "go" }, { label: Z.skip, cls: "quiet", v: "skip" }]);
      if (go.v === "skip") {
        S.asked += Z.rows.length;
        setClear(S.asked / TU.suishoToi);
        await sayShort(Z.skipLine, "soft");
        return;
      }
      for (const row of Z.rows) {
        setChip(Z.chip + "　" + row.label);
        await speak(row.ask);
        const opts = row.options.map(function (o) {
          return { label: o.label, icon: "<img src=\"" + o.img + "\" alt=\"\">", o: o };
        });
        opts.push({ label: Z.unknown, cls: "quiet", o: null });
        const c = await choose(opts, "zu zu" + row.options.length);
        S.asked++;
        setClear(S.asked / TU.suishoToi);
        pulse();
        SND.answer(S.asked);
        if (c.o) {
          addW(c.o.w);
          S.shita[row.id] = c.o.v;
          // 種明かしで取りあげられるように、場面の答えと同じ形で覚えておく
          if (c.o.tell) S.answers.push({ sc: { name: row.name, eye: c.o.eye || row.eye, shita: true }, o: c.o });
        }
        await sleep(160);
      }
      setChip("");
      if (Z.after) { await speak(Z.after, "soft"); await pause(); }
    },
    bamen: async function (st) { await questions(st, nextScene); },
    shibori: async function (st) { await questions(st, pickQuestion); },
    ate: async function (st) {
      for (let i = 0; i < (st.n || 1); i++) await guessOne(st.size || "m", !!st.lead && i === 0);
    },
    // ここまでの体の当てが少なすぎたら、負けを認めて終わる
    shoubu: async function () {
      const got = S.bodyMarks.filter(function (m) { return m === "hit"; }).length + 0.5 * S.bodyMarks.filter(function (m) { return m === "some"; }).length;
      if (S.bodyMarks.length && got < TU.makeMiman) {
        S.phase = "make";
        scene.dataset.face = "hazure";
        await say(D.lose, "soft");
        return "lose";
      }
    },
    nayami: guessNayami,
    nabe: showNabe,
    tane: taneakashi,
    youjou: youjou,
    okuri: async function () {
      S.phase = "okuri";
      await say([D.types[S.type].close].concat(D.sendoff), "soft");
    }
  };

  async function questions(st, pick) {
    if (st.mae) { fx(null); await sayShort(st.mae, "soft", 500); }
    for (let i = 0; i < (st.n || 1); i++) {
      const sc = pick();
      if (!sc) break;
      await askScene(sc);
    }
    setChip("");
    scene.classList.remove("vision");
    if (st.ato) { await speak(st.ato, "soft"); await pause(); }
  }

  async function run(skipIntro) {
    reset();
    const hello = skipIntro ? D.introAgain : D.intro;
    await say(hello.slice(0, -1), "soft");
    await speak(hello[hello.length - 1], "soft");
    await beat(700);
    await askProfile();
    for (const st of D.flow) {
      const r = await STEP[st.do](st);
      if (r === "lose") return finish(true);
    }
    finish(false);
  }

  function finish(lost) {
    // 的中の割合: 体の当ても、悩みの当ても、外れをふくめて全部数える
    const hit = S.marks.filter(function (m) { return m === "hit"; }).length;
    const some = S.marks.filter(function (m) { return m === "some"; }).length;
    S.rate = S.marks.length ? Math.round((hit + 0.5 * some) / S.marks.length * 100) : 0;
    S.lost = lost;
    S.done = true;
    S.phase = "kekka";
    S.times.end = performance.now();
    renderDots($("resDots"), S.marks, S.marks.length);
    $("resKicker").textContent = lost ? "今夜は、占い師の負け" : "今夜の見立て";
    $("potCard").hidden = lost;
    $("actCard").hidden = lost;
    if (!lost) {
      const TY = D.types[S.type];
      $("potArt").innerHTML = potSVG(S.type);
      $("potName").textContent = TY.name;
      $("potTerm").textContent = "中医学のことばでは「" + TY.term + "」";
      $("nayamiLine").textContent =
        S.nayamiHow === "atari" ? "言い当てられた悩み：" + S.nayami :
        S.nayamiHow === "chikai" ? "近かった悩み：" + S.nayami :
        S.nayamiHow === "kiita" ? "教えてもらった悩み：" + S.toldLabel :
        S.nayamiTries ? "悩みは、言い当てられなかった" : "";
      $("actText").textContent = S.act;
    }
    $("revealText").textContent = lost
      ? "ひとつの型におさまらない体もあります。当たらなかったことも、手がかりのひとつです。"
      : D.taneClose;
    $("result").hidden = false;
    $("result").scrollTop = 0;
    // 数えあげる
    const el = $("rateNum"), t0 = performance.now(), dur = FAST ? 1 : 900;
    (function up(now) {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = String(Math.round(S.rate * k));
      if (k < 1) requestAnimationFrame(up);
    })(t0);
  }

  // ---------- 操作 ----------
  $("talk").addEventListener("click", tap);
  scene.addEventListener("click", tap);
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "Enter") {
      if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
      e.preventDefault();
      tap();
    }
  });

  $("startBtn").addEventListener("click", function () {
    SND.init();
    $("cover").hidden = true;
    run(false);
  });

  $("againBtn").addEventListener("click", function () {
    $("result").hidden = true;
    run(true); // 2回めからは、あいさつを飛ばす
  });

  $("mute").addEventListener("click", function (e) {
    e.stopPropagation();
    SND.on = !SND.on;
    if (SND.on) SND.init();
    this.textContent = SND.on ? "音 あり" : "音 なし";
  });

  $("shareBtn").addEventListener("click", function () {
    const lines = S.lost
      ? ["夜の漢方堂で、体を占ってもらった。", "的中 " + S.rate + "%。今夜は、占い師の負け。"]
      : ["夜の漢方堂で、体を言い当てられた。", "的中 " + S.rate + "%。私の体は「" + D.types[S.type].name + "」らしい。"];
    if (/^https?:/.test(location.protocol)) lines.push(location.origin + location.pathname);
    const text = lines.join("\n");
    if (navigator.share) navigator.share({ text: text }).catch(function () { /* やめたときは何もしない */ });
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("コピーしました。LINE などに貼れます"); }, function () { toast("コピーできませんでした"); });
    else toast("この端末では送れませんでした");
  });

  reset();
  S.done = true; // はじまりの画面では、まだ何も進めていない
  // 確かめる用（答えは、この画面の中だけにある。保存しない、どこにも送らない）
  window.URANAI_STATE = function () { return S; };
  window.URANAI_UI = function () { return { typing: T.typing, waiting: !!T.waitTap, fast: FAST, calm: CALM }; };
})();
