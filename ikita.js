// 部屋となつめ君を「生きた絵」にする（くわしくは docs/27）。
// 絵はそのまま使い、足すのは、光と動きだけ:
//   部屋: つるした花がゆれる / ろうそくの火と、まわりの明るさがゆれる / 床に、明かりと、なつめ君の影がうつる
//   なつめ君: そで・すそ・腰や肩にさげたものが、ゆれる / ろうそくのがわのふちが、あたたかく光る
//   水晶: 絵の玉の上に、立体の玉を重ねる（ゲームの、くもり・光・輪は、そのまま上にのる）
// 動かせない端末や、うまく動かないときは、何もしない（いままでどおりの絵になる）。
// URL に ?noikita をつけると、動かさない。?ikita=miru をつけると、動かす場所に色がつく（場所合わせ用）。
// 外には、何も送らない。
(function () {
  "use strict";
  const Q = new URLSearchParams(location.search);
  // いまは、ためしの入り口だけ: URL に ?ikita=1 をつけたときだけ動かす（スマホで、うまく出ないことがあったので。2026-11-28）
  const MODE = Q.get("ikita");
  if (!MODE || Q.has("noikita")) return;
  const scene = document.getElementById("scene"), chara = document.getElementById("chara"), orb = document.getElementById("orb"), avatar = document.getElementById("avatar");
  const bg = scene && scene.querySelector(".bg");
  if (!scene || !chara || !orb || !bg) return;
  const calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const MIRU = MODE === "miru" ? 1 : 0;
  // ためしの形（スマホで、どこが重いか・こわれるかを、分けて見るため）
  //   ?ikita=1     ぜんぶ
  //   ?ikita=e     ぜんぶ。ただし「待つ」の絵は、動く人形をうつしとらず、止まった絵を使う（まばたきは、しない）
  //   ?ikita=karui 部屋と水晶だけ。なつめ君は、いままでどおり（ゆれと光は、なし）
  const HITO = MODE !== "karui", LIVE = MODE !== "e";
  const yubi = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches); // 指でさわる端末（スマホなど）

  // ---------- 調整するところ ----------
  const TUNE = {
    tamaMawaru: 0.5,            // 指で動かしたとき、玉の中が回る大きさ
    sumi: 0.6,                  // 水晶の澄みぐあい（0〜1）
    // 花（部屋の絵の中。絵の幅・高さを 1 として）
    hanaShita: 0.19,            // これより上を、花として、ゆらす
    hanaTemae: 0.07,            // 奥行きの地図で、これより手前（白い）ところを、花とみなす
    hanaYure: 0.0075,           // ゆれる大きさ
    hanaYubi: 0.006,            // 指で動かしたとき、ずれる大きさ
    // ろうそくと行灯（部屋の絵の中の場所）
    hiX: 0.0655, hiY: 0.343,    // ろうそくの火の、根もと
    andonX: 0.916, andonY: 0.44,
    // なつめ君（絵のピクセルで書く。絵は 470×724）。ゆれる大きさ
    sodeYure: 0.011,            // そで（角度）
    susoYure: 1.6,              // すそ（ピクセル）
    koshiYure: 1.0,             // 腰や肩にさげたもの（1 がふつう）
    hikari: 0.24,               // 光のあたり方の強さ
    kage: 0.55,                 // かげの深さ（0〜1）
    nameraka: 0.08              // 指についてくる、なめらかさ
  };
  // 絵ごとの場所（絵のピクセル。470×724）
  //   tama: 水晶のまんなか x, y と、半径 / ko: 腰にさげたもの（巾着・房・小箱）が、「待つ」の絵から、どれだけずれているか
  //   kata: 肩の房2つの、まんなか（左 x, y, 右 x, y） / kataOn: 肩の房をゆらすか（うでにかくれている絵では 0）
  const FACE = {
    matsu:   { tama: [223.7, 276.6, 43], ko: [0, 0],  kata: [160, 268, 297, 266], kataOn: [1, 1], oku: "img/ikita/matsu_okuyuki.png" },
    miru:    { tama: [229, 249, 41],     ko: [4, 6],  kata: [160, 270, 297, 270], kataOn: [1, 1] },
    atari:   { tama: [233, 279, 39],     ko: [1, 6],  kata: [167, 270, 301, 276], kataOn: [1, 1] },
    hazure:  { tama: [247, 327, 35],     ko: [8, 10], kata: [180, 266, 312, 278], kataOn: [1, 1] },
    tere:    { tama: [228, 287, 38],     ko: [1, 6],  kata: [165, 276, 298, 281], kataOn: [1, 1] },
    naisho:  { tama: [258, 305, 39],     ko: [8, 10], kata: [175, 262, 300, 281], kataOn: [0, 1] },
    minai:   { tama: [256, 305.5, 39],   ko: [7, 10], kata: [182, 271, 302, 284], kataOn: [1, 1] },
    miokuri: { tama: [255, 305.5, 39],   ko: [7, 10], kata: [181, 271, 302, 284], kataOn: [1, 1] }
  };

  const VS = "attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }";
  const NOISE = [
    "float h3(vec3 p){ p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }",
    "float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),",
    "             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }",
    "float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }"
  ].join("\n");
  const FLICK = [
    "float flick(float t){ float f = n3(vec3(t*3.1,0.0,0.0))*0.5 + n3(vec3(t*9.0,4.0,0.0))*0.3 + n3(vec3(t*17.0,8.0,0.0))*0.2;",
    "  f = smoothstep(0.18, 0.82, f); float dip = smoothstep(0.60, 0.88, n3(vec3(t*0.8,11.0,0.0))); return mix(0.5, f*(1.0 - 0.25*dip), 0.5); }"
  ].join("\n");

  // 部屋: 絵はそのまま塗る。花のところだけ、ずらして塗る。火と明かりを、足す
  const FS_HEYA = [
    "precision highp float; varying vec2 uv;",
    "uniform sampler2D img, dep; uniform vec2 res; uniform float t, onHana, onHi, bri, tsuya; uniform vec2 ptr;",
    "uniform vec4 hana; uniform vec4 hi;", NOISE, FLICK,
    "float hm(vec2 q){ return smoothstep(hana.y-0.03, hana.y+0.03, texture2D(dep,q).r) * (1.0-smoothstep(hana.x-0.02, hana.x+0.02, q.y)) * (1.0-smoothstep(0.045, 0.065, texture2D(dep, vec2(q.x, hana.x+0.05)).r)); }", // 花の下まで手前のもの（本だな）は、花ではないので、ゆらさない
    "void main(){",
    "  float ca = res.x/res.y, ia = 1024.0/1536.0; vec2 s = vec2(uv.x, 1.0-uv.y); vec2 q;",
    "  if (ca < ia) q = vec2(0.5 + (s.x-0.5)*ca/ia, s.y); else { float f = ia/ca; q = vec2(s.x, 0.22*(1.0-f) + s.y*f); }",
    // 花: 上（ひも）は動かず、下ほど大きくゆれる。たばごとに、ゆれる時がずれる
    "  float k = clamp(q.y/hana.x, 0.0, 1.0); k = k*k;",
    "  float sw = sin(t*0.9 + q.x*13.0)*0.7 + sin(t*1.7 + q.x*29.0)*0.3;",
    "  vec2 off = vec2((sw*hana.z + ptr.x*hana.w)*k, 0.0) * onHana;",
    "  float m = max(hm(q), hm(q-off));",
    "  vec3 c = texture2D(img, q - off*m).rgb;",
    // ろうそくと行灯: まわりの明るさが、ゆれる
    "  float f1 = flick(t);",
    "  float f2 = n3(vec3(t*1.3, 7.0, 0.0));",
    "  vec2 d1 = (q - hi.xy)*vec2(1.0,1.5), d2 = (q - hi.zw)*vec2(1.0,1.5);",
    "  float g1 = exp(-dot(d1,d1)/0.05), g2 = exp(-dot(d2,d2)/0.045);",
    "  float gb = exp(-dot(d1,d1)/0.55);",
    "  c *= 1.0 + onHi*((f1-0.5)*1.0*g1 + (f1-0.5)*0.30*gb + (f2-0.5)*0.32*g2);",
    // 床のつや: 火と行灯の明かりが、板の上に、たてにのびてうつる。なつめ君の影が、火と反対へ落ちて、火といっしょにゆれる
    "  float yuka = smoothstep(0.55, 0.63, q.y) * tsuya * onHi; float oku = exp(-(q.y-0.58)*2.2);",
    "  float wob = (n3(vec3(q.y*46.0, t*1.4, 3.0))-0.5)*0.03;",
    "  float a1 = (q.x - hi.x + wob)/0.17, a2 = (q.x - hi.z + wob)/0.085; float s1 = exp(-a1*a1), s2 = exp(-a2*a2);",
    "  c += yuka*oku*(vec3(1.0,0.58,0.26)*s1*(0.05+0.20*f1) + vec3(1.0,0.66,0.34)*s2*(0.07+0.07*f2));",
    "  c *= 1.0 + yuka*(f1-0.5)*0.45*exp(-q.x*2.4);",
    "  vec2 k1 = (q - vec2(0.60 + 0.035*(f1-0.5), 1.0))/vec2(0.40, 0.17), k2 = (q - vec2(0.42, 1.0))/vec2(0.34, 0.13);",
    "  c *= 1.0 - yuka*(0.50*exp(-dot(k1,k1))*(0.45+0.55*f1) + 0.22*exp(-dot(k2,k2)));",
    "  c += onHi*vec3(1.0,0.62,0.25)*(0.05*g1*f1 + 0.03*g2*f2);",
    // ろうそくの火: 絵の火の上に、ゆれる火を重ねる
    "  float fy = (hi.y - q.y)*1.5/0.05; float lean = (n3(vec3(t*2.3,2.0,0.0))-0.5)*0.014 + (n3(vec3(t*6.5,5.0,0.0))-0.5)*0.004 + ptr.x*-0.003;",
    "  float fx = (q.x - hi.x - lean*fy*fy)/0.0095;",
    "  float hgt = 0.80 + 0.24*f1; float y1 = fy/hgt;",
    "  float wid = sqrt(max(y1,0.0))*(1.0-y1)*1.9 + 0.02;",
    "  float fl = (y1>0.0 && y1<1.0) ? 1.0 - smoothstep(0.35, 1.0, abs(fx)/wid) : 0.0;",
    "  vec3 fc = mix(vec3(1.0,0.5,0.12), vec3(1.0,0.96,0.78), smoothstep(0.2,0.9,fl)*(1.0-0.5*y1));",
    "  fc = mix(fc, vec3(0.35,0.45,1.0), (1.0-smoothstep(0.0,0.16,y1))*0.5);",
    "  c = mix(c, fc*1.15, fl*onHi);",
    "  vec2 d3 = d1 + vec2(0.0,0.03);",
    "  c += onHi*vec3(1.0,0.7,0.3)*exp(-dot(d3,d3)/0.0016)*0.35*f1;",
    "  gl_FragColor = vec4(c*bri, 1.0);",
    "}"
  ].join("\n");

  // 水晶: 立体の玉
  const FS_TAMA = [
    "precision highp float; varying vec2 uv;",
    "uniform sampler2D mask; uniform float t, sumi; uniform vec2 ptr;", NOISE,
    "mat3 rot(float a, float b){ float ca=cos(a), sa=sin(a), cb=cos(b), sb=sin(b); return mat3(ca,0.,-sa, 0.,1.,0., sa,0.,ca) * mat3(1.,0.,0., 0.,cb,sb, 0.,-sb,cb); }",
    "void main(){",
    "  vec2 p = (uv-0.5)/0.28; float r = length(p); float mk = texture2D(mask, uv).r;",
    "  vec3 lav = vec3(0.78,0.66,1.0);",
    "  float halo = exp(-max(r-1.0,0.0)*5.0) * (0.10 + 0.34*sumi) * (0.85+0.15*sin(t*2.1));",
    "  if (r >= 1.0) { float fd = 1.0 - smoothstep(1.2,1.78,r); float kg = exp(-(r-1.0)*3.4)*0.46*mk*fd*(0.75+0.25*p.y*-1.0/max(r,0.001)); gl_FragColor = vec4(lav*halo*0.55*fd, kg); return; } // 玉のまわりの着物を、うすく暗くする（玉が、着物から浮く）",
    "  float z = sqrt(1.0 - r*r); vec3 n = vec3(p.x, p.y, z);",
    "  mat3 R = rot(ptr.x*MAWARU + t*0.07, -ptr.y*MAWARU*0.6);",
    // 中のもや: 手前の面と、奥の面の、2か所で見る（奥行きが出る）
    "  vec3 a = R*(n*0.95), b = R*(vec3(p.x,p.y,-z)*0.95);",
    "  float c1 = fbm(a*2.1 + vec3(0.0,t*0.05,0.0)), c2 = fbm(b*1.6 + vec3(4.0,-t*0.04,2.0));",
    "  float cl = smoothstep(0.32,0.78, c1*0.6 + c2*0.55);",
    "  vec3 deep = mix(vec3(0.04,0.02,0.10), vec3(0.15,0.08,0.34), sumi);",
    "  vec3 col = mix(deep, mix(vec3(0.38,0.34,0.80), vec3(0.80,0.82,1.0), sumi), cl);",
    "  col *= 0.42 + 0.58*z;", // ふちに向かって暗くする（丸みが出る）
    "  //",
    "  col += vec3(1.0,0.93,1.0) * exp(-r*r*2.6) * sumi * (0.78 + 0.25*sin(t*1.3)) * (0.6+0.6*c1);",
    // 中の光の粒: 玉の中の、いろいろな深さに置いて、いっしょに回す
    "  for (int i=0;i<14;i++){ float fi=float(i);",
    "    vec3 s = vec3(h3(vec3(fi,1.,2.)), h3(vec3(fi,5.,3.)), h3(vec3(fi,9.,7.)))*2.0-1.0; s = normalize(s)*(0.25+0.6*h3(vec3(fi,3.,3.)));",
    "    s = s*R; float tw = 0.5+0.5*sin(t*(1.0+fi*0.37)+fi*2.1);",
    "    float d = length(p - s.xy*0.92); col += vec3(1.0,0.95,1.0)*exp(-d*d*(380.0 - 160.0*s.z))*tw*(0.25+0.75*sumi)*(0.6+0.4*s.z); }",
    // ふちの光と、てかり
    "  float fres = pow(1.0-z, 3.2); col += lav*fres*(0.55+0.5*sumi); col += vec3(0.95,0.94,1.0)*pow(1.0-z, 6.0)*0.55;",
    "  vec3 L = normalize(vec3(-0.45+ptr.x*0.15, 0.62+ptr.y*-0.1, 0.65));",
    "  float sp = pow(max(dot(reflect(vec3(0.,0.,-1.), n), L),0.0), 70.0); col += vec3(1.0)*sp*1.2; col += vec3(0.9,0.85,1.0)*pow(max(dot(n, L),0.0), 6.0)*0.16;",
    "  col += vec3(1.0,0.58,0.22)*pow(max(dot(n, normalize(vec3(0.8,-0.3,0.5))),0.0), 5.0)*0.30;", // 行灯の明かりが、右下にうつる
    "  //",
    "  vec3 L2 = normalize(vec3(0.5,0.45,0.75)); col += vec3(1.0,0.9,0.8)*pow(max(dot(reflect(vec3(0.,0.,-1.), n), L2),0.0), 90.0)*0.5;",
    "  col += vec3(0.9,0.75,1.0)*pow(max(dot(n.xy, -L.xy),0.0),3.0)*fres*0.9;", // 光が玉をぬけて、反対がわのふちに集まる
    "  float al = 0.94 * (1.0 - smoothstep(0.9, 1.0, r)) * mk;", // ふちは、もとの絵の線を残す。指のところは、塗らない
    "  gl_FragColor = vec4(col*al + lav*halo*(1.0-al)*0.6*mk, al);",
    "}"
  ].join("\n").replace(/MAWARU/g, TUNE.tamaMawaru.toFixed(3));

  // なつめ君: 絵はそのまま。場所ごとに、少しずつ、ずらして塗る。ふちに、光とかげを足す
  const FS_HITO = [
    "precision highp float; varying vec2 uv;",
    "uniform sampler2D img, fuku; uniform vec4 karada; uniform float t, onKami, onKimono, onKoshi, miru, kage, tsuya; uniform vec2 ptr; uniform vec4 yure; uniform vec2 ko, kataOn; uniform vec4 kata;", NOISE, FLICK,
    "float ell(vec2 p, vec2 c, vec2 r){ return 1.0 - smoothstep(0.62, 1.0, length((p-c)/r)); }",
    // つけ根 piv を軸に、ang だけ回したときの、ずれ
    "vec2 furi(vec2 p, vec2 piv, float ang){ vec2 d = p - piv; float c = cos(ang), s = sin(ang); return vec2(d.x*c - d.y*s, d.x*s + d.y*c) - d; }",
    "void main(){",
    "  vec2 p = vec2(uv.x, 1.0-uv.y)*vec2(470.0, 724.0); vec2 o = vec2(0.0); vec3 dbg = vec3(0.0);",
    // 体ぜんたい: ふくらみ（前に出ている所ほど白い）に合わせて、ずらす。前に出た所ほど、指のほうへ大きく動く
    "  float fd = texture2D(fuku, p/vec2(470.0,724.0)).r;",
    "  o += vec2(ptr.x, ptr.y*0.4) * karada.x * (fd - karada.y) * karada.z;",
    // 髪（顔のところは、動かさない）
    "  float kao = 1.0 - smoothstep(0.8, 1.15, length((p-vec2(222.0,130.0))/vec2(46.0,50.0)));",
    "  float wk = ell(p, vec2(221.0,98.0), vec2(108.0,100.0)) * (1.0-kao) * smoothstep(18.0, 75.0, length(p-vec2(222.0,112.0))) * onKami;",
    "  o.x += (sin(t*1.2 + p.y*0.05 + p.x*0.03) + 0.5*sin(t*2.3 + p.x*0.08) - ptr.x*1.3) * yure.x * wk;",
    "  o.y += 0.4*sin(t*1.6 + p.x*0.06) * yure.x * wk; dbg.r += wk;",
    // そで（左と右。肩を軸に）
    "  float wl = ell(p, vec2(104.0,405.0), vec2(72.0,190.0)) * onKimono, wr = ell(p, vec2(372.0,405.0), vec2(72.0,190.0)) * onKimono;",
    "  o += furi(p, vec2(150.0,225.0), (sin(t*0.7) + ptr.x*0.9) * yure.y) * wl;",
    "  o += furi(p, vec2(300.0,225.0), (sin(t*0.7 + 0.9) + ptr.x*0.9) * yure.y) * wr;",
    "  o.x += sin(t*1.1 + p.y*0.035) * 0.9 * (wl+wr) * smoothstep(260.0, 560.0, p.y);",
    // すそ
    "  float ws = smoothstep(560.0, 710.0, p.y) * onKimono;",
    "  o.x += (sin(t*0.8 + p.x*0.022) - ptr.x*0.8) * yure.z * ws; dbg.g += wl + wr + ws;",
    // さげたもの（巾着 / まんなかの房 / 小さい箪笥 / 肩の房2つ）
    "  float k = yure.w * onKoshi;",
    "  vec2 pk = p - ko, pl = p - kata.xy, pr = p - kata.zw;", // 絵ごとの、ずれ
    "  float w1 = ell(pk, vec2(153.0,515.0), vec2(50.0,70.0)), w2 = ell(pk, vec2(240.0,520.0), vec2(26.0,82.0));",
    "  float w3 = ell(pk, vec2(277.0,488.0), vec2(42.0,60.0)) * (1.0 - w2), w4 = ell(pl, vec2(0.0), vec2(17.0,40.0)) * kataOn.x, w5 = ell(pr, vec2(0.0), vec2(17.0,40.0)) * kataOn.y;",
    "  o += furi(pk, vec2(165.0,440.0), (0.040*sin(t*1.3) + ptr.x*0.050)*k) * w1;",
    "  o += furi(pk, vec2(240.0,440.0), (0.055*sin(t*1.5 + 1.0) + ptr.x*0.070)*k) * w2;",
    "  o += furi(pk, vec2(268.0,430.0), (0.022*sin(t*1.1 + 2.0) + ptr.x*0.030)*k) * w3;",
    "  o += furi(pl, vec2(3.0,-32.0), (0.050*sin(t*1.7 + 0.5) + ptr.x*0.060)*k) * w4;",
    "  o += furi(pr, vec2(-2.0,-32.0), (0.050*sin(t*1.7 + 2.2) + ptr.x*0.060)*k) * w5;",
    "  dbg.b += (w1+w2+w3+w4+w5) * onKoshi;",
    "  vec2 q = (p - o)/vec2(470.0, 724.0);",
    "  vec4 c = texture2D(img, q);",
    // 光: ふくらみの、かたむきを見て、光のほうを向いた面を明るく、反対を暗くする。光は、指のほうから来る
    "  vec2 e = vec2(7.0/470.0, 0.0), e2 = vec2(0.0, 7.0/724.0);",
    "  vec2 g = vec2(texture2D(fuku, q+e).r - texture2D(fuku, q-e).r, texture2D(fuku, q+e2).r - texture2D(fuku, q-e2).r);",
    "  vec2 L = normalize(vec2(ptr.x*1.3 + 0.35, ptr.y*0.6 - 0.45));",
    "  float sh = clamp(-dot(g, L)*7.0, -1.0, 1.0) * karada.w;",
    // かげを深く、明るい所はひかえめに。体ぜんたいも少し落として、下ほど暗くする（夜の部屋の明かりに合わせる）
    "  float on = step(0.001, karada.w);",
    "  c.rgb *= 1.0 + (sh < 0.0 ? sh*(1.0 + 1.6*kage) : sh*(1.0 - 0.6*kage));",
    "  c.rgb += vec3(1.0,0.72,0.42) * max(sh, 0.0) * 0.22 * c.a;",
    "  c.rgb *= mix(vec3(1.0), vec3(0.80,0.74,0.76) - 0.16*smoothstep(0.35, 1.0, q.y), kage*on);",
    // つや: 左のろうそくの明かりが、体のふちを、ゆれながら、あたためる。反対がわは、紫がかった影に沈む。右からは、行灯の、うすい明かり
    "  float f1 = flick(t);",
    "  float sc = clamp(-dot(g, normalize(vec2(-1.0,-0.25)))*8.0, -1.0, 1.0), sa = clamp(-dot(g, normalize(vec2(1.0,0.1)))*8.0, -1.0, 1.0);",
    "  c.rgb *= mix(vec3(1.0), vec3(0.70,0.62,0.78), clamp(max(-sc,0.0)*(0.30+0.40*f1), 0.0, 1.0)*tsuya);",
    "  c.rgb *= 1.0 + tsuya*((f1-0.5)*0.16 + 0.10*(0.5-q.x));",
    "  c.rgb += (vec3(1.0,0.60,0.28)*max(sc,0.0)*(0.08+0.30*f1) + vec3(1.0,0.70,0.42)*max(sa,0.0)*0.09) * c.a * tsuya;",
    "  if (miru > 1.5) c = vec4(vec3(texture2D(fuku, q).r)*c.a, c.a);",
    "  c.rgb = mix(c.rgb, c.rgb*0.4 + dbg*c.a*0.8, miru > 0.5 && miru < 1.5 ? 1.0 : 0.0);",
    "  gl_FragColor = c;",
    "}"
  ].join("\n");

  function load(src) { return new Promise(function (res, rej) { const im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { rej(new Error(src)); }; im.src = src; }); }
  function prog(gl, fs) {
    function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(p, "p"); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    return function (name) { return gl.getUniformLocation(p, name); };
  }
  // 絵を、計算に使える形（テクスチャ）にする。src がないときは、からのものを作る
  function mkTex(gl, unit, src, flip, pre) {
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (src) put(gl, src, flip, pre);
    return tx;
  }
  function put(gl, src, flip, pre) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip ? 1 : 0); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, pre ? 1 : 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  }

  // 体のふくらみを作る（前に出ている所ほど白い、白黒の絵）。光のあたり方を決めるのに使う
  function fukurami(im, dep, tx, ty) { // tx, ty: 水晶のまんなか（絵の幅・高さを 1 として）。dep: 奥行きの地図（ないときは、絵の形だけで作る）
    const W = 235, H = 362, N = W * H;
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true });
    function read(src, ch) { x.clearRect(0, 0, W, H); x.drawImage(src, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data, o = new Float32Array(N); for (let i = 0; i < N; i++) o[i] = d[i * 4 + ch] / 255; return o; }
    function blur(a, r) { // 箱のぼかしを3回（なめらかな、ぼかしになる）
      let s = a, t = new Float32Array(N);
      for (let k = 0; k < 3; k++) {
        for (let y = 0; y < H; y++) { let acc = 0; const row = y * W; for (let i = -r; i <= r; i++) acc += s[row + Math.min(W - 1, Math.max(0, i))]; for (let i = 0; i < W; i++) { t[row + i] = acc / (2 * r + 1); acc += s[row + Math.min(W - 1, i + r + 1)] - s[row + Math.max(0, i - r)]; } }
        const u = new Float32Array(N);
        for (let i = 0; i < W; i++) { let acc = 0; for (let y = -r; y <= r; y++) acc += t[Math.min(H - 1, Math.max(0, y)) * W + i]; for (let y = 0; y < H; y++) { u[y * W + i] = acc / (2 * r + 1); acc += t[Math.min(H - 1, y + r + 1) * W + i] - t[Math.max(0, y - r) * W + i]; } }
        s = u;
      }
      return s;
    }
    const al = read(im, 3), d = dep ? read(dep, 0) : new Float32Array(N);
    const f1 = blur(al, 8), f2 = blur(al, 26), fu = new Float32Array(N), db = blur(d, 7), ds = blur(d, 1);
    for (let i = 0; i < N; i++) fu[i] = Math.min(f1[i], 0.35 * f1[i] + 0.65 * f2[i] * 1.25); // 小さいぼかし（ふちの形）と、大きいぼかし（体の丸み）を合わせる
    const out = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const naka = Math.min(1, Math.max(0, (fu[i] - 0.62) / 0.3)); // ふちでは、こまかい出っぱりを足さない
      out[i] = Math.min(1, Math.max(0, fu[i] * 0.8 + (ds[i] - db[i]) * 2.4 * naka));
    }
    // 水晶と手: まんなかの高さにそろえる
    const bx = tx * W, by = (ty * 724 + 14) / 724 * H, base = out[Math.round(ty * H) * W + Math.round(bx)];
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      const r = Math.hypot((i - bx) / 40, (y - by) / 37), w = 1 - Math.min(1, Math.max(0, (r - 0.6) / 0.4));
      out[y * W + i] += (base - out[y * W + i]) * w * w * (3 - 2 * w);
    }
    const fin = blur(out, 1), id = x.createImageData(W, H);
    for (let i = 0; i < N; i++) { const v = Math.round(fin[i] * 255); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    return { canvas: c, tama: base };
  }

  // 水晶を持つ指のところは塗らないように、絵の色から「指」を見分けて、ぬく形を作る
  function yubiMask(im, n, T) {
    const c = document.createElement("canvas"); c.width = c.height = n; const x = c.getContext("2d");
    const half = T[2] / 0.28 * 0.5; // わくの半分（絵のピクセル）
    x.drawImage(im, T[0] - half, T[1] - half, half * 2, half * 2, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n), a = d.data;
    for (let i = 0; i < a.length; i += 4) {
      const r = a[i], g = a[i + 1], b = a[i + 2];
      const hada = r > 150 && r - b > 28 && g > b; // はだ色（赤みがあり、青が少ない）
      const v = hada ? 0 : 255; a[i] = a[i + 1] = a[i + 2] = v; a[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    const c2 = document.createElement("canvas"); c2.width = c2.height = n; const x2 = c2.getContext("2d");
    x2.filter = "blur(" + (n / 110).toFixed(1) + "px)"; x2.drawImage(c, 0, 0); // ふちを、少しぼかす
    return c2;
  }

  // ---------- 画面に足すもの ----------
  const css = document.createElement("style");
  css.textContent = [
    "#ikitaHeya { width: 100%; background: none; }",
    "#ikitaHito { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 1; pointer-events: none; }",
    "#ikitaTama { position: absolute; inset: auto; height: auto; aspect-ratio: 1; transform: translate(-50%, -50%); opacity: 1; pointer-events: none; }",
    ".scene.ikita .chara img, .scene.ikita #avatar { opacity: 0 !important; }",
    ".scene:not(.ikita) #ikitaHito, .scene:not(.ikita-t) #ikitaTama { visibility: hidden; }"
  ].join("\n");
  const heya = document.createElement("canvas"); heya.id = "ikitaHeya"; heya.className = "bg"; heya.setAttribute("aria-hidden", "true");
  const hito = document.createElement("canvas"); hito.id = "ikitaHito"; hito.setAttribute("aria-hidden", "true");
  const tama = document.createElement("canvas"); tama.id = "ikitaTama"; tama.setAttribute("aria-hidden", "true");
  let dead = false;
  function yameru(e) { // うまく動かないときは、足したものを全部外して、いままでどおりの絵にもどす
    dead = true; scene.classList.remove("ikita", "ikita-t");
    [css, heya, hito, tama].forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    if (e) console.warn("ikita:", e);
  }

  // 指（マウス）の場所。-1〜1
  let target = [0, 0], cur = [0, 0], touching = false, lastTouch = -1e9, fixed = false;
  function at(e) {
    if (fixed) return;
    const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
    target = [Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)), Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))];
    lastTouch = performance.now();
  }
  window.addEventListener("pointerdown", function (e) { touching = true; at(e); }, { passive: true });
  window.addEventListener("pointermove", function (e) { if (touching || e.pointerType === "mouse") at(e); }, { passive: true });
  window.addEventListener("pointerup", function () { touching = false; }, { passive: true });
  window.addEventListener("pointercancel", function () { touching = false; }, { passive: true });

  Promise.all([load("img/heya.jpg"), load("img/ikita/heya_okuyuki.png"), load(FACE.matsu.oku)]).then(function (im) {
    const g1 = heya.getContext("webgl", { antialias: false, alpha: false }), g2 = tama.getContext("webgl", { premultipliedAlpha: true, alpha: true }), g3 = hito.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!g1 || !g2 || !g3) throw new Error("webgl");
    const u1 = prog(g1, FS_HEYA); mkTex(g1, 0, im[0], false, false); mkTex(g1, 1, im[1], false, false);
    g1.uniform1i(u1("img"), 0); g1.uniform1i(u1("dep"), 1);
    g1.uniform4f(u1("hana"), TUNE.hanaShita, TUNE.hanaTemae, TUNE.hanaYure, TUNE.hanaYubi);
    g1.uniform4f(u1("hi"), TUNE.hiX, TUNE.hiY, TUNE.andonX, TUNE.andonY);
    g1.uniform1f(u1("onHana"), 1); g1.uniform1f(u1("onHi"), 1); g1.uniform1f(u1("tsuya"), 1);
    g1.uniform1f(u1("bri"), 1); // 明るさは、ゲームの CSS（.bg の filter）にまかせる
    const u2 = prog(g2, FS_TAMA); g2.uniform1i(u2("mask"), 0); g2.uniform1f(u2("sumi"), TUNE.sumi);
    const u3 = prog(g3, FS_HITO); g3.uniform1i(u3("img"), 0); g3.uniform1i(u3("fuku"), 1);
    g3.uniform4f(u3("yure"), 0, TUNE.sodeYure, TUNE.susoYure, TUNE.koshiYure); g3.uniform1f(u3("miru"), MIRU);
    g3.uniform4f(u3("karada"), 0, 0, 0, TUNE.hikari); g3.uniform1f(u3("kage"), TUNE.kage); g3.uniform1f(u3("tsuya"), 1);
    g3.uniform1f(u3("onKami"), 0); g3.uniform1f(u3("onKimono"), 1); g3.uniform1f(u3("onKoshi"), 1);
    const liveTex = mkTex(g3, 0, null); let liveNg = false; // 動く人形（まばたきなど）を、毎回うつしとる先

    // 端末が、絵を描く場所を取り上げたとき（重いときに起きる）は、足したものを外して、いままでどおりの絵にもどす
    [heya, hito, tama].forEach(function (c) { c.addEventListener("webglcontextlost", function () { yameru(new Error("contextlost")); }); });
    document.head.appendChild(css);
    bg.parentNode.insertBefore(heya, bg.nextSibling);
    chara.insertBefore(hito, orb); chara.insertBefore(tama, orb);

    // 絵ごとの用意（その絵が読みこまれてから、はじめて使うときに作る）
    const res = {};
    function youi(face) {
      if (res[face]) return res[face];
      const F = FACE[face], el = chara.querySelector('img[data-f="' + face + '"]');
      if (!F || !el || !el.getAttribute("src") || !el.complete || !el.naturalWidth) return null;
      const fk = fukurami(el, face === "matsu" ? im[2] : null, F.tama[0] / 470, F.tama[1] / 724);
      const r = { F: F, el: el, img: mkTex(g3, 0, el, false, true), fuku: mkTex(g3, 1, fk.canvas, false, false), mask: mkTex(g2, 0, yubiMask(el, 256, F.tama), true, false) };
      res[face] = r; return r;
    }

    let dprCap = yubi ? 1.5 : 2; // スマホは、はじめから、少し粗くする（軽くするため）
    function fit(c, gl) {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); } // 端末が、たのんだ大きさより小さい画面しかくれないことがあるので、じっさいの大きさを使う
    }

    let now0 = performance.now(), faceNow = "", frames = 0, fpsT = 0, fpsN = 0, fps = 0;
    function tick(now) {
      if (dead) return;
      requestAnimationFrame(tick);
      if (document.hidden) return;
      try {
        const t = (now - now0) / 1000, move = calm ? 0 : t;
        let tx = target;
        if (!fixed && !calm && !touching && now - lastTouch > 2500) tx = [Math.sin(t * 0.5) * 0.6, Math.sin(t * 0.37) * 0.3]; // さわっていないときは、ひとりでに、ゆっくり動く
        if (calm && !fixed) tx = [0, 0];
        cur[0] += (tx[0] - cur[0]) * TUNE.nameraka; cur[1] += (tx[1] - cur[1]) * TUNE.nameraka;

        // 部屋
        fit(heya, g1);
        g1.uniform2f(u1("res"), heya.width, heya.height); g1.uniform1f(u1("t"), move); g1.uniform2f(u1("ptr"), cur[0], cur[1]);
        g1.drawArrays(g1.TRIANGLE_STRIP, 0, 4);

        // なつめ君と水晶（いま出ている顔の絵に合わせる）
        const face = scene.dataset.face || "", r = youi(face);
        if (!r) { scene.classList.remove("ikita", "ikita-t"); faceNow = ""; }
        else {
          const F = r.F;
          if (face !== faceNow) {
            faceNow = face;
            tama.style.left = (F.tama[0] / 470 * 100) + "%"; tama.style.top = (F.tama[1] / 724 * 100) + "%"; tama.style.width = (F.tama[2] / 0.28 / 470 * 100) + "%";
            g2.activeTexture(g2.TEXTURE0); g2.bindTexture(g2.TEXTURE_2D, r.mask);
            g3.activeTexture(g3.TEXTURE1); g3.bindTexture(g3.TEXTURE_2D, r.fuku);
            g3.uniform2f(u3("ko"), F.ko[0], F.ko[1]); g3.uniform4f(u3("kata"), F.kata[0], F.kata[1], F.kata[2], F.kata[3]); g3.uniform2f(u3("kataOn"), F.kataOn[0], F.kataOn[1]);
          }
          fit(tama, g2);
          if (HITO) {
          fit(hito, g3);
          // 「待つ」の絵は、動く人形（まばたき、口、うなずき）が出ているときは、その絵をうつしとって使う
          g3.activeTexture(g3.TEXTURE0);
          let live = false;
          if (LIVE && face === "matsu" && !liveNg && avatar && scene.classList.contains("live") && avatar.width > 1) {
            try { g3.bindTexture(g3.TEXTURE_2D, liveTex); put(g3, avatar, false, true); live = true; } catch (e) { liveNg = true; }
          }
          if (!live) g3.bindTexture(g3.TEXTURE_2D, r.img);
          g3.uniform1f(u3("t"), move); g3.uniform2f(u3("ptr"), cur[0], cur[1]);
          g3.clearColor(0, 0, 0, 0); g3.clear(g3.COLOR_BUFFER_BIT); g3.drawArrays(g3.TRIANGLE_STRIP, 0, 4);
          scene.classList.add("ikita");
          }
          g2.uniform1f(u2("t"), move); g2.uniform2f(u2("ptr"), cur[0], cur[1]);
          g2.clearColor(0, 0, 0, 0); g2.clear(g2.COLOR_BUFFER_BIT); g2.drawArrays(g2.TRIANGLE_STRIP, 0, 4);
          scene.classList.add("ikita-t");
        }

        // 重い端末では、画面の細かさを下げる
        frames++; fpsN++;
        if (now - fpsT > 3000) { if (fpsT) { fps = fpsN / ((now - fpsT) / 1000); if (fps < 20 && dprCap > 1 && t > 5) dprCap = 1; } fpsT = now; fpsN = 0; }
      } catch (e) { yameru(e); }
    }
    // 確かめる用: IKITA.set(x, y) で、指の場所を止める。IKITA.info() で、いまのようす
    window.IKITA = {
      set: function (x, y) { fixed = true; target = [x, y]; },
      free: function () { fixed = false; },
      info: function () { return { frames: frames, fps: Math.round(fps), face: faceNow, dpr: dprCap, live: LIVE && !liveNg, mode: MODE, hito: [hito.width, hito.height, g3.drawingBufferWidth, g3.drawingBufferHeight], heya: [heya.width, heya.height, g1.drawingBufferWidth, g1.drawingBufferHeight] }; }
    };
    requestAnimationFrame(tick);
  }).catch(yameru);
})();
