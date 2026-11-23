/*! fflate
MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function Je(e, t) {
  const n = [0];
  for (let i = 1; i < e.length; i++) n.push(n.at(-1) + Math.hypot(e[i][0] - e[i - 1][0], e[i][1] - e[i - 1][1]));
  const r = Math.max(0, Math.min(1, t)) * n.at(-1);
  let o = 1;
  for (; o < e.length - 1 && n[o] < r; ) o++;
  const s = (r - n[o - 1]) / Math.max(1e-9, n[o] - n[o - 1]);
  return e[o - 1].map((i, u) => i + (e[o][u] - i) * s);
}
const Pt = (e) => e.slice(1).reduce((t, n, r) => t + Math.hypot(n[0] - e[r][0], n[1] - e[r][1]), 0);
function Jn(e, t) {
  let n = 0;
  const r = Pt(e), o = [];
  for (let i = 1; i < e.length; i++) {
    const u = e[i - 1], v = e[i], y = v[0] - u[0], m = v[1] - u[1], l = Math.hypot(y, m);
    for (let h = 1; h < t.length; h++) {
      const f = t[h - 1], c = t[h], p = c[0] - f[0], d = c[1] - f[1], w = y * d - m * p;
      if (Math.abs(w) < 1e-9) continue;
      const a = ((f[0] - u[0]) * d - (f[1] - u[1]) * p) / w, g = ((f[0] - u[0]) * m - (f[1] - u[1]) * y) / w;
      a >= -1e-8 && a <= 1 + 1e-8 && g >= -1e-8 && g <= 1 + 1e-8 && o.push((n + a * l) / r);
    }
    n += l;
  }
  const s = o.filter((i, u) => o.findIndex((v) => Math.abs(i - v) < 1e-7) === u);
  if (s.length !== 1) throw new RangeError("Each tier must cross every column exactly once");
  return s[0];
}
function kn(e) {
  const t = !!(e.seams?.length || e.tiers?.length), n = e.seams?.length || (e.columns ?? 8), r = e.seams?.length ? e.seams : Array.from({ length: n }, (m, l) => [Je(e.waist, l / (n - 1)), Je(e.hem, l / (n - 1))]);
  if (t && r.some((m) => Pt(m) < 1)) throw new RangeError("Columns must have nonzero source length");
  const o = r.map((m) => [0, ...e.tiers?.length ? e.tiers.map((l) => Jn(m, l)) : [0.5], 1]);
  for (const m of o) if (m.some((l, h) => h > 0 && l - m[h - 1] < 1e-3)) throw new RangeError("Tier intersections must be ordered from waist to hem, with nonzero links");
  const s = o[0].length - 1, i = t ? Math.max(2, Math.ceil(((e.rows ?? 5) - 1) / s)) : 0, u = t ? s * i + 1 : e.rows ?? 5, v = new Float64Array(u * n * 2), y = [];
  for (let m = 0; m < n; m++) {
    y[m] = [];
    for (let l = 0; l < u; l++) {
      const h = t ? Math.min(s - 1, Math.floor(l / i)) : 0, f = t ? (l - h * i) / i : l / (u - 1), c = t ? o[m][h] + (o[m][h + 1] - o[m][h]) * f : f;
      y[m].push(c), v.set(Je(r[m], c), (l * n + m) * 2);
    }
  }
  if (t) for (let m = 0; m < u - 1; m++) for (let l = 0; l < n - 1; l++) {
    const h = (m * n + l) * 2, f = h + 2, c = h + n * 2, p = c + 2, d = (w, a, g) => (v[a] - v[w]) * (v[g + 1] - v[w + 1]) - (v[a + 1] - v[w + 1]) * (v[g] - v[w]);
    if (d(h, f, p) <= 1e-6 || d(h, p, c) <= 1e-6) throw new RangeError("Columns must be ordered left to right without crossing");
  }
  return { custom: t, cols: n, rows: u, rest: v, seams: r, joints: o, fractions: y, lengths: r.map(Pt), top: r.map((m) => m[0]) };
}
const he = (e, t, n) => {
  (typeof e != "number" || !Number.isFinite(e)) && n.push(`${t}: expected a finite number`);
}, we = (e, t, n) => {
  he(e, t, n), typeof e == "number" && e <= 0 && n.push(`${t}: must be positive`);
}, De = (e, t, n) => {
  he(e, t, n), typeof e == "number" && e < 0 && n.push(`${t}: must be nonnegative`);
}, Kn = (e, t, n) => {
  De(e, t, n), typeof e == "number" && (!Number.isInteger(e) || e > 8) && n.push(`${t}: expected an integer from 0 to 8`);
}, Fe = (e, t, n) => {
  we(e, t, n), typeof e == "number" && !Number.isInteger(e) && n.push(`${t}: expected an integer`);
}, st = (e, t, n) => {
  he(e, t, n), typeof e == "number" && !Number.isInteger(e) && n.push(`${t}: expected an integer`);
}, yt = (e, t, n) => {
  (typeof e != "string" || !e.trim()) && n.push(`${t}: expected a non-empty string`);
}, Re = (e, t = 0, n = 1 / 0) => (r, o, s) => {
  if (!Array.isArray(r)) {
    s.push(`${o}: expected an array`);
    return;
  }
  (r.length < t || r.length > n) && s.push(`${o}: expected ${t}..${n} items`), r.forEach((i, u) => e(i, `${o}[${u}]`, s));
}, de = Re(he, 2, 2), Se = (e, t, n) => {
  de(e, t, n), Array.isArray(e) && e.length === 2 && e[0] >= e[1] && n.push(`${t}: start must be less than end`);
}, ue = (e, t = []) => (n, r, o) => {
  if (!n || typeof n != "object" || Array.isArray(n)) {
    o.push(`${r}: expected an object`);
    return;
  }
  const s = n;
  for (const [i, u] of Object.entries(e))
    s[i] === void 0 && t.includes(i) || u(s[i], `${r}.${i}`, o);
}, ft = { cx: he, cy: he, rx: we, ry: we }, Ye = ue(ft), Ke = Re(de, 3), Xe = Re(de, 2), Qe = (e, t, n) => {
  he(e, t, n), typeof e == "number" && (e < 0 || e > 1) && n.push(`${t}: must be between 0 and 1`);
}, Qn = (e) => ue({
  version: (t, n, r) => {
    t !== 1 && r.push(`${n}: only version 1 is supported`);
  },
  image: ue({ width: Fe, height: Fe }),
  head: ue({
    ...ft,
    shiftX: he,
    shiftY: he,
    pivotX: he,
    pivotY: he,
    maxRoll: he,
    weightBand: Se,
    turnBand: Se,
    weightOutline: Ke,
    weightFeather: we
  }, ["weightOutline", "weightFeather"]),
  body: ue({
    pivotX: he,
    pivotY: he,
    maxRoll: he,
    breathBand: Se,
    rollBand: Se,
    chest: Ye,
    shoulders: Re(Ye),
    hip: ue({ shift: he, band: Se })
  }, ["hip"]),
  face: ue({
    nose: Ye,
    mouth: Ye,
    eyeA: Ye,
    eyeB: Ye,
    earL: Ye,
    earR: Ye,
    brow: ue({ ...ft, band: Se }),
    jaw: ue({ ...ft, band: Se })
  }),
  buns: ue({ bunL: Ye, bunR: Ye }, ["bunL", "bunR"]),
  eyes: Re(ue({
    opening: Ke,
    roi: Ke,
    x0: he,
    x1: he,
    top: Re(he, 24, 24),
    bot: Re(he, 24, 24)
  }, e ? ["x0", "x1", "top", "bot"] : []), 2, 2),
  mouth: ue({
    cx: he,
    cy: he,
    angle: he,
    halfLen: we,
    bow: he,
    area: ue({ ...ft, angle: he })
  }),
  cheeks: Re(de, 2, 2),
  strands: Re(ue({ name: yt, nodes: Xe, sigma: we, k: we, max: we })),
  accessories: Re(ue({
    name: yt,
    pivot: de,
    tip: de,
    split: Qe,
    box: Re(st, 4, 4),
    color: ue({ redness: Qe, minRed: he })
  })),
  hand: ue({
    outline: Ke,
    jaw: Xe,
    jawRange: Se,
    background: Ke,
    elbow: de,
    wrist: de,
    knuckle: de,
    contact: de,
    forearmShare: Qe,
    armBand: Se,
    wristBand: Se,
    handBand: Se,
    fingerXBand: Se,
    fingerYBand: Se,
    pinBand: Se
  }),
  cloth: Re(ue({
    name: yt,
    outline: Ke,
    waist: Xe,
    hem: Xe,
    columns: Fe,
    rows: Fe,
    stiffness: we,
    damping: we,
    max: we,
    tierGain: we,
    highModeDamping: we,
    responseGain: we,
    swing: we,
    follow: Qe,
    cohesion: Kn,
    wind: De,
    behind: (t, n, r) => {
      typeof t != "boolean" && r.push(`${n}: expected a boolean`);
    },
    parent: yt,
    scale: we,
    seams: Re(Xe, 0, 64),
    tiers: Re(Xe, 0, 8)
  }, ["tierGain", "highModeDamping", "seams", "tiers", "responseGain", "columns", "rows", "stiffness", "damping", "max", "swing", "follow", "cohesion", "wind", "behind", "parent", "scale"])),
  legs: ue({
    spine: Qe,
    bob: De,
    twist: De,
    pelvis: de,
    shift: De,
    tilt: De,
    bend: De,
    band: Se,
    split: Xe,
    left: ue({ hip: de, knee: de, ankle: de }),
    right: ue({ hip: de, knee: de, ankle: de })
  }, ["spine", "bob", "twist"]),
  arms: ue({
    swing: De,
    bend: De,
    inward: Qe,
    left: ue({ shoulder: de, elbow: de, wrist: de, split: Xe }),
    right: ue({ shoulder: de, elbow: de, wrist: de, split: Xe })
  }, ["swing", "bend", "inward"]),
  mesh: ue({
    baseCell: Fe,
    fine: ue({
      x0: st,
      x1: st,
      y0: st,
      y1: st,
      cell: Fe
    }),
    handCell: Fe,
    tasselCell: Fe,
    eyeBallCell: Fe,
    eyeCell: Fe,
    spriteCell: Fe,
    clothCell: Fe
  }, ["clothCell"]),
  view: ue({ padTop: he, padSide: he, gazeCenter: de, irisTravel: we }, ["gazeCenter", "irisTravel"])
}, ["buns", "strands", "accessories", "hand", "cloth", "legs", "arms"]);
function Ln(e, t = {}) {
  const n = [];
  if (Qn(t.draft ?? !1)(e, "rig", n), n.length) return n;
  const r = e;
  r.eyes.forEach((s, i) => {
    const u = ["x0", "x1", "top", "bot"];
    if (!(t.draft && u.every((v) => s[v] === void 0))) {
      if (u.some((v) => s[v] === void 0)) {
        n.push(`rig.eyes[${i}]: supply all x0/x1/top/bot fields or omit all in a draft`);
        return;
      }
      s.x0 >= s.x1 && n.push(`rig.eyes[${i}].x1: must exceed x0`), s.top.some((v, y) => v > s.bot[y]) && n.push(`rig.eyes[${i}].top: must not exceed bottom curve`);
    }
  }), (r.mesh.fine.x0 >= r.mesh.fine.x1 || r.mesh.fine.y0 >= r.mesh.fine.y1) && n.push("rig.mesh.fine: rectangle must have positive area"), (r.view.padTop <= -1 || r.view.padTop >= 1 || r.view.padSide <= -0.5) && n.push("rig.view: margins must leave a positive viewport");
  for (const [s, i] of (r.strands ?? []).entries())
    i.nodes.some((u, v) => v > 0 && u[0] === i.nodes[v - 1][0] && u[1] === i.nodes[v - 1][1]) && n.push(`rig.strands[${s}].nodes: consecutive nodes must differ`);
  for (const [s, i] of (r.accessories ?? []).entries())
    (i.box[0] < 0 || i.box[1] < 0 || i.box[2] > r.image.width || i.box[3] > r.image.height) && n.push(`rig.accessories[${s}].box: rectangle must stay inside the image`), (i.split <= 0 || i.split >= 1) && n.push(`rig.accessories[${s}].split: must be strictly between 0 and 1`), i.pivot.every((u, v) => u === i.tip[v]) && n.push(`rig.accessories[${s}].tip: must differ from pivot`), (i.box[0] >= i.box[2] || i.box[1] >= i.box[3]) && n.push(`rig.accessories[${s}].box: rectangle must have positive area`);
  const o = /* @__PURE__ */ new Set();
  if (r.legs) {
    (r.legs.twist ?? 0) > 15 && n.push("rig.legs.twist: must be between 0 and 15 degrees");
    const s = r.legs;
    for (const i of ["left", "right"]) {
      const u = s[i];
      s.band[0] < u.hip[1] && u.hip[1] < u.knee[1] && u.knee[1] < u.ankle[1] || n.push(`rig.legs.${i}: require band start < hip y < knee y < ankle y`);
    }
    s.split.some((i, u) => u > 0 && i[1] <= s.split[u - 1][1]) && n.push("rig.legs.split: y coordinates must increase");
  }
  if (r.arms) {
    (r.arms.swing ?? 4) > 10 && n.push("rig.arms.swing: must be between 0 and 10 degrees"), (r.arms.bend ?? 6) > 12 && n.push("rig.arms.bend: must be between 0 and 12 degrees");
    for (const s of ["left", "right"]) {
      const i = r.arms[s], u = `rig.arms.${s}`;
      i.shoulder[1] < i.elbow[1] && i.elbow[1] < i.wrist[1] || n.push(`${u}: require shoulder y < elbow y < wrist y`);
      for (const [v, y] of Object.entries({ shoulder: [i.shoulder], elbow: [i.elbow], wrist: [i.wrist], split: i.split }))
        y.some(([m, l]) => m < 0 || l < 0 || m >= r.image.width || l >= r.image.height) && n.push(`${u}.${v}: points must stay inside the image`);
      if (i.split.some((v, y) => y > 0 && v[1] <= i.split[y - 1][1]))
        n.push(`${u}.split: y coordinates must increase`);
      else {
        const v = (y) => {
          let m = 0;
          for (; m < i.split.length - 2 && y > i.split[m + 1][1]; ) m++;
          const l = i.split[m], h = i.split[m + 1], f = Math.max(0, Math.min(1, (y - l[1]) / (h[1] - l[1])));
          return l[0] + (h[0] - l[0]) * f;
        };
        [i.elbow, i.wrist].some(([y, m]) => s === "left" ? v(m) <= y : v(m) >= y) && n.push(`${u}.split: must lie on the body side of elbow and wrist`);
      }
    }
  }
  for (const [s, i] of (r.cloth ?? []).entries()) {
    if ((!/^[A-Za-z0-9_-]+$/.test(i.name) || o.has(i.name)) && n.push(`rig.cloth[${s}].name: must be a unique layer-safe name`), i.parent !== void 0 && !o.has(i.parent) && n.push(`rig.cloth[${s}].parent: must name an earlier cloth entry`), ((i.columns ?? 2) < 2 || (i.rows ?? 2) < 2) && n.push(`rig.cloth[${s}]: columns and rows must be at least 2`), i.seams?.length === 1 && n.push(`rig.cloth[${s}].seams: at least two columns required`), i.seams?.length || i.tiers?.length) {
      i.seams?.some((u) => u.some((v, y) => y > 0 && v[1] <= u[y - 1][1])) && n.push(`rig.cloth[${s}].seams: y must increase from waist to hem`);
      try {
        kn(i);
      } catch (u) {
        n.push(`rig.cloth[${s}]: ${u instanceof Error ? u.message : String(u)}`);
      }
    }
    o.add(i.name);
  }
  return n;
}
function en(e) {
  const t = Ln(e);
  if (t.length) throw new Error(`Invalid rig:
${t.join(`
`)}`);
  return structuredClone(e);
}
const er = (e, t, n) => {
  const r = Math.min(1, Math.max(0, (n - e) / (t - e)));
  return r * r * (3 - 2 * r);
}, tr = 16;
function _n(e) {
  const t = e?.weightOutline;
  if (!Array.isArray(t) || t.length < 3) return null;
  const n = Number.isFinite(e.weightFeather) && e.weightFeather > 0 ? e.weightFeather : tr;
  function r(o, s) {
    let i = !1, u = 1 / 0;
    for (let v = 0, y = t.length - 1; v < t.length; y = v++) {
      const [m, l] = t[y], [h, f] = t[v];
      l > s != f > s && o < m + (s - l) * (h - m) / (f - l) && (i = !i);
      const c = h - m, p = f - l, d = Math.min(1, Math.max(0, ((o - m) * c + (s - l) * p) / (c * c + p * p || 1)));
      u = Math.min(u, Math.hypot(o - m - c * d, s - l - p * d));
    }
    return i ? 0 : u;
  }
  return (o, s) => 1 - er(0, n, r(o, s));
}
const et = (e, t, n) => Math.max(t, Math.min(n, e)), Be = (e, t, n) => {
  const r = et((n - e) / (t - e), 0, 1);
  return r * r * (3 - 2 * r);
}, At = (e, t) => Math.hypot(e[0] - t[0], e[1] - t[1]), vt = (e, t, n) => {
  const r = e[0] - t[0], o = e[1] - t[1], s = Math.cos(n), i = Math.sin(n);
  return [t[0] + r * s - o * i, t[1] + r * i + o * s];
};
function cn(e, t, n, r) {
  const o = At(e, t), s = At(n, r), i = (t[0] - e[0]) / o, u = (t[1] - e[1]) / o, v = (r[0] - n[0]) / s, y = (r[1] - n[1]) / s, m = s / o, l = [
    v * m * i + y * u,
    v * m * u - y * i,
    y * m * i - v * u,
    y * m * u + v * i
  ];
  return [...l, n[0] - l[0] * e[0] - l[1] * e[1], n[1] - l[2] * e[0] - l[3] * e[1]];
}
const hn = (e, t) => [t[0] * e[0] + t[1] * e[1] + t[4], t[2] * e[0] + t[3] * e[1] + t[5]], kt = Object.freeze({ spine: 0.7, bob: 2, twist: 0 });
function nr(e, t, n = null) {
  if (!e) return null;
  const r = [e.left, e.right].map((j, I) => {
    const F = At(j.hip, j.knee), N = At(j.knee, j.ankle), C = Math.min(F, N) * 0.05, V = Math.hypot(F, C), oe = Math.hypot(N, C), K = j.ankle[0] - j.hip[0], U = j.ankle[1] - j.hip[1], Q = K * (j.knee[1] - j.hip[1]) - U * (j.knee[0] - j.hip[0]);
    return { ...j, u: V, v: oe, depth: C, lateral: Q / Math.hypot(K, U), side: Math.sign(Q) || (I ? 1 : -1) };
  }), o = _n(n), s = (e.twist ?? 0) > 0, i = (e.twist ?? 0) * Math.PI / 180, u = Math.max(1, ...r.map((j) => Math.abs(j.hip[0] - e.pelvis[0]) * 1.35)), v = Math.max(t.chest.rx, ...t.shoulders.map((j) => Math.abs(j.cx - t.chest.cx) + j.rx)), y = [0, 0], m = [0, 0];
  let l = 0;
  const h = (j, I, F, N) => {
    const C = j - I, V = Math.max(0, 1 - (C / F) ** 2);
    return C * (Math.cos(N) - 1) + F * 0.75 * V * V * Math.sin(N);
  }, f = [0, 0, 0], c = [0, 0, 0];
  let p = 0, d = 0, w = 0, a = 0, g;
  function x(j, I) {
    const F = et(j.weightShift ?? 0, -1, 1), N = Math.min(Math.max(I, 0), 0.05), C = m[0], V = s ? i * et(0.4 * F + (N ? 0.6 * Math.tanh((F - w) / N) : 0), -1, 1) : 0;
    if (!N)
      s && (y.fill(V), m.fill(0), l = 0), f.fill(F), c.fill(0), p = 0, d = 0;
    else {
      const oe = (e.bob ?? kt.bob) * Math.min(1, Math.abs(F - w) / N / 1.5), K = Math.ceil(N * 240), U = N / K;
      for (let Q = 0; Q < K; Q++) {
        for (let q = 0; q < 3; q++) {
          const Z = q ? f[q - 1] : F;
          c[q] += (576 * (Z - f[q]) - 2 * 0.9 * 24 * c[q]) * U, f[q] += c[q] * U;
        }
        if (s) for (let q = 0; q < 2; q++) {
          const Z = q ? y[0] : V;
          m[q] += (196 * (Z - y[q]) - 2 * 0.95 * 14 * m[q]) * U, y[q] += m[q] * U;
        }
        d += (576 * (oe - p) - 2 * 0.9 * 24 * d) * U, p += d * U;
      }
    }
    s && N && (l = (m[0] - C) / N), w = F, a++;
  }
  const b = Math.min(...r.map((j) => j.ankle[1]));
  let E, _, X;
  function $(j) {
    const I = et(j.weightShift ?? 0, -1, 1), F = et(j.bodyAngleX ?? 0, -10, 10);
    if (I === E && F === _ && a === g) return X;
    E = I, _ = F, g = a;
    const N = -e.tilt * I, C = e.shift * I + F / 10 * (t.hip?.shift ?? e.shift), V = s ? a ? y[0] : i * 0.4 * I : 0, oe = s ? -(1 - (e.spine ?? kt.spine)) * (a ? y[1] : V) : 0, K = (P) => {
      const M = vt(P, e.pelvis, N);
      return s && (M[0] += h(P[0], e.pelvis[0], u, V)), M[0] += C, M;
    }, U = r.map((P) => K(P.hip)), Q = r.map((P, M) => P.lateral + P.side * e.bend * Math.max(0, M ? -I : I) ** 2), q = I * I + (F / 10) ** 2, Z = e.bend ** 2 / Math.min(...r.map((P) => P.u + P.v)) * q, se = (P) => (P + Math.hypot(P, Z)) / 2;
    let ne = p + e.bend ** 2 / Math.min(...r.map((P) => P.u + P.v)) * I * I;
    for (let P = 0; P < r.length; P++) {
      const M = r[P], S = U[P], R = S[0] - M.ankle[0], O = Math.sqrt(Math.max(0, M.u * M.u - Q[P] ** 2)) + Math.sqrt(Math.max(0, M.v * M.v - Q[P] ** 2)), B = M.ankle[1] - Math.sqrt(Math.max(0, O * O - R * R)) - S[1];
      ne += se(B - ne);
    }
    const ae = r.map((P, M) => {
      const S = [U[M][0], U[M][1] + ne], R = P.ankle;
      if (!I && !F && !p && !V) return {
        hip: P.hip,
        knee: P.knee,
        ankle: R,
        hip3: [...P.hip, 0],
        knee3: [...P.knee, P.depth],
        ankle3: [...R, 0],
        upper: [1, 0, 0, 1, 0, 0],
        lower: [1, 0, 0, 1, 0, 0]
      };
      const O = R[0] - S[0], B = R[1] - S[1], z = Math.hypot(O, B), L = (P.u * P.u - P.v * P.v + z * z) / (2 * z), J = Math.sqrt(Math.max(0, P.u * P.u - L * L)), W = [
        S[0] + O / z * L - B / z * Q[M],
        S[1] + B / z * L + O / z * Q[M]
      ], re = Math.sqrt(Math.max(0, J * J - Q[M] ** 2));
      return {
        hip: S,
        knee: W,
        ankle: R,
        hip3: [...S, 0],
        knee3: [...W, re],
        ankle3: [...R, 0],
        upper: cn(P.hip, P.knee, S, W),
        lower: cn(P.knee, P.ankle, W, R)
      };
    });
    return X = {
      ws: I,
      bx: F,
      angle: N,
      shift: C,
      drop: ne,
      bones: ae,
      ...s && { twist: { pelvis: V, shoulder: oe, head: 0, acceleration: l } },
      trunk: { spine: f[0], chest: f[1], head: f[2], bob: p }
    }, X;
  }
  function Y(j) {
    const I = e.split;
    let F = 0;
    for (; F < I.length - 2 && j > I[F + 1][1]; ) F++;
    const N = I[F], C = I[F + 1], V = et((j - N[1]) / (C[1] - N[1]), 0, 1);
    return N[0] + (C[0] - N[0]) * V;
  }
  function D(j, I) {
    const F = I >= e.split[0][1] ? +(j >= Y(I)) : Be(Y(I) - 4, Y(I) + 4, j), N = r.map((C) => ({
      leg: Be(e.band[0], C.hip[1], I),
      shin: Be(C.knee[1] - 45, C.knee[1] + 45, I),
      pin: 1 - Be(C.ankle[1] - 55, C.ankle[1], I)
    }));
    return o ? { right: F, perBone: N, headSide: o(j, I) } : { right: F, perBone: N };
  }
  function T(j, I, F, N, C) {
    const V = $(C);
    if (!V.ws && !V.bx && !V.trunk.chest && !V.trunk.head && !p && !V.twist?.pelvis && !V.twist?.shoulder) return;
    const oe = [e.pelvis[0] + V.shift, e.pelvis[1] + V.drop], K = 1 - Be(Math.min(t.chest.cy, e.pelvis[1] - 1), e.pelvis[1], F), U = 1 - Be(...e.band, F), Q = e.spine ?? kt.spine, q = e.tilt * (1 - Q) * V.trunk.chest, Z = e.shift * (1.12 * V.trunk.chest - V.ws) + Math.sin(q) * Math.max(0, e.pelvis[1] - t.chest.cy), se = (S) => {
      const R = vt(S, e.pelvis, V.angle);
      R[0] += V.shift, R[1] += V.drop;
      const O = vt(R, oe, (q - V.angle) * U);
      return O[0] += Z * K, O;
    }, ne = se(j), ae = N.headSide ?? 1;
    if (n) {
      const S = (1 - Be(...n.weightBand, F)) * ae, R = se([n.pivotX, n.pivotY]), O = -e.tilt * (1 - Q) * V.trunk.head * S, B = vt(ne, R, O);
      ne[0] = B[0] + e.shift * 1.12 * (V.trunk.head - V.trunk.chest) * S, ne[1] = B[1];
    }
    if (s) {
      const S = t.chest.cy + Math.max(40, (e.pelvis[1] - t.chest.cy) * 0.5), R = Be(t.chest.cy, S, F), O = V.twist.shoulder + (V.twist.pelvis - V.twist.shoulder) * R, B = t.chest.cx + (e.pelvis[0] - t.chest.cx) * R, z = v + (u - v) * R, L = n ? ae === 1 ? Be(...n.weightBand, F) : 1 - (1 - Be(...n.weightBand, F)) * ae : 1;
      ne[0] += h(I, B, z, O) * L;
    }
    let P = 0, M = 0;
    r.forEach((S, R) => {
      const O = V.bones[R], B = N.perBone[R], z = hn(j, O.upper), L = hn(j, O.lower), J = z[0] + (L[0] - z[0]) * B.shin, W = z[1] + (L[1] - z[1]) * B.shin, re = R ? N.right : 1 - N.right;
      P += ((ne[0] - j[0]) * (1 - B.leg) + (J - j[0]) * B.leg) * B.pin * re, M += ((ne[1] - j[1]) * (1 - B.leg) + (W - j[1]) * B.leg) * B.pin * re;
    }), j[0] += P, j[1] += M;
  }
  function H(j) {
    return 1 - Be(b - 55, b, j);
  }
  return { frame: $, weights: D, apply: T, pin: H, step: x };
}
const qe = (e, t, n) => Math.max(t, Math.min(n, e)), at = (e, t = 0) => Number.isFinite(e) ? e : t, it = (e, t, n) => {
  const r = qe((n - e) / Math.max(1e-6, t - e), 0, 1);
  return r * r * (3 - 2 * r);
}, Lt = (e, t, n) => {
  const r = e[0] - t[0], o = e[1] - t[1], s = Math.cos(n), i = Math.sin(n);
  return [t[0] + r * s - o * i, t[1] + r * i + o * s];
}, mt = Object.freeze({ swing: 4, bend: 6, inward: 0.4 });
function rr(e, t, n = null) {
  if (!e) return null;
  const r = qe(at(e.swing, mt.swing), 0, 10) * Math.PI / 180, o = qe(at(e.bend, mt.bend), 0, 12) * Math.PI / 180, s = qe(at(e.inward, mt.inward), 0, 1), i = [e.left, e.right];
  function u(l, h) {
    let f = 0;
    for (; f < l.length - 2 && h > l[f + 1][1]; ) f++;
    const c = l[f], p = l[f + 1], d = qe((h - c[1]) / Math.max(1e-6, p[1] - c[1]), 0, 1);
    return c[0] + (p[0] - c[0]) * d;
  }
  function v(l, h) {
    return i.map((f, c) => {
      const p = Math.max(1, f.elbow[1] - f.shoulder[1]), d = Math.max(1, f.wrist[1] - f.elbow[1]), w = Math.max(1, Math.min(p, d, t.chest.ry) * 0.2), a = u(f.split, h), g = c ? l - a : a - l, x = +(g >= 0), b = it(-w, w, g), E = it(f.split[0][1] - w, f.split[0][1], h);
      return {
        arm: (b + (x - b) * E) * it(f.shoulder[1], f.shoulder[1] + p * 0.55, h) * (1 - it(f.split.at(-1)[1], f.split.at(-1)[1] + w, h)),
        forearm: it(f.elbow[1] - w, f.elbow[1] + w, h)
      };
    });
  }
  function y(l, h = (f) => [...f]) {
    return i.map((f, c) => {
      const p = c ? "R" : "L", d = c ? -1 : 1, w = qe(at(l[`armSwing${p}`]), -1, 1);
      return {
        shoulder: h(f.shoulder),
        elbow: h(f.elbow),
        swing: d * r * w * (w < 0 ? s : 1),
        // Flex inward; negative values never hyper-extend the elbow.
        bend: -d * o * qe(at(l[`elbowBend${p}`]), 0, 1)
      };
    });
  }
  function m(l, h, f, c, p, d = y(p)) {
    const w = [...l];
    d.forEach((a, g) => {
      if (!c[g].arm || !a.swing && !a.bend) return;
      const x = a.swing ? Lt(w, a.shoulder, a.swing) : w, b = a.swing ? Lt(a.elbow, a.shoulder, a.swing) : a.elbow, E = a.bend ? Lt(x, b, a.bend) : x;
      l[0] += (x[0] - w[0] + (E[0] - x[0]) * c[g].forearm) * c[g].arm, l[1] += (x[1] - w[1] + (E[1] - x[1]) * c[g].forearm) * c[g].arm;
    });
  }
  return { weights: v, frame: y, apply: m };
}
const bt = [
  { id: "angleX", label: "Face angle X", min: -30, max: 30, def: 0, group: "Head and body" },
  { id: "angleY", label: "Face angle Y", min: -30, max: 30, def: 0, group: "Head and body" },
  { id: "angleZ", label: "Face roll", min: -30, max: 30, def: 0, group: "Head and body" },
  { id: "bodyAngleX", label: "Body angle X", min: -10, max: 10, def: 0, group: "Head and body" },
  { id: "bodyAngleZ", label: "Body roll", min: -10, max: 10, def: 0, group: "Head and body" },
  { id: "breath", label: "Breath", min: 0, max: 1, def: 0, group: "Head and body" },
  { id: "eyeLOpen", label: "Left eye open", min: 0, max: 1.25, def: 1, group: "Eyes and brows" },
  { id: "eyeROpen", label: "Right eye open", min: 0, max: 1.25, def: 1, group: "Eyes and brows" },
  { id: "eyeSmile", label: "Eye smile", min: 0, max: 1, def: 0, group: "Eyes and brows" },
  { id: "gazeX", label: "Gaze X", min: -1, max: 1, def: 0, group: "Eyes and brows" },
  { id: "gazeY", label: "Gaze Y", min: -1, max: 1, def: 0, group: "Eyes and brows" },
  { id: "browY", label: "Brow Y", min: -1, max: 1, def: 0, group: "Eyes and brows" },
  { id: "browAngle", label: "Brow angle", min: -1, max: 1, def: 0, group: "Eyes and brows" },
  { id: "mouthOpen", label: "Mouth open", min: 0, max: 1, def: 0, group: "Mouth and cheeks" },
  { id: "mouthForm", label: "Mouth form (i to o)", min: -1, max: 1, def: 0, group: "Mouth and cheeks" },
  { id: "blush", label: "Blush", min: 0, max: 1, def: 0, group: "Mouth and cheeks" },
  { id: "armAngle", label: "Arm angle", min: -10, max: 10, def: 0, group: "Hand" },
  { id: "handAngle", label: "Wrist angle", min: -10, max: 10, def: 0, group: "Hand" },
  { id: "fingerTap", label: "Finger tap", min: 0, max: 1, def: 0, group: "Hand" },
  { id: "weightShift", label: "Weight shift", min: -1, max: 1, def: 0, group: "Legs" },
  ...["L", "R"].flatMap((e) => [
    { id: `armSwing${e}`, label: `Arm swing ${e}`, min: -1, max: 1, def: 0, group: "Arms" },
    { id: `elbowBend${e}`, label: `Elbow bend ${e}`, min: 0, max: 1, def: 0, group: "Arms" }
  ])
];
function or(e) {
  const t = { w: e.image.width, h: e.image.height }, n = (M, S, R) => R ? Math.exp(-(((M - R.cx) / R.rx) ** 2 + ((S - R.cy) / R.ry) ** 2)) : 0, r = 24, o = e.eyes;
  function s(M, S) {
    const R = Math.min(1, Math.max(0, S)) * (r - 1), O = Math.min(Math.floor(R), r - 2), B = R - O;
    return M[O] + (M[O + 1] - M[O]) * B;
  }
  function i(M, S, R, O) {
    S = Math.min(1, Math.max(0, S));
    const B = s(M.top, S), z = s(M.bot, S), L = 1 - R, J = 4 * S * (1 - S), W = s(M.bot, 0.5) - s(M.top, 0.5), re = M.top[0] + (M.top[r - 1] - M.top[0]) * S - 0.3 * W * J, te = Math.max(B, z + 1 + (re - z - 1) * O);
    return [(te - B) * Math.max(L, -0.07), L > 0 ? (te - z) * L * O : 0];
  }
  const u = [[-2, 1], [-1, 2], [0, 3], [1, 2], [2, 1]], v = 5;
  function y(M, S, R, O) {
    let B = 0, z = 0;
    for (const [re, te] of u) {
      const [A, k] = i(M, (S + re * v - M.x0) / (M.x1 - M.x0), R, O);
      B += A * te / 9, z += k * te / 9;
    }
    const L = Math.min(1, Math.max(0, (S - M.x0) / (M.x1 - M.x0))), J = s(M.top, L), W = s(M.bot, L);
    return { top: J, bot: W, b: 1 - R, lid: J + B, bc: W + z };
  }
  function m(M, S, R, O, B, z) {
    const L = y(M, R, B, z);
    return S === "lash" ? L.lid - (L.top - O) * (1 - 0.3 * Math.min(1, Math.max(0, L.b))) : S === "low" ? O + (L.bc - L.bot) : S === "crease" ? O + (L.lid - L.top) * 0.22 : O;
  }
  function l(M, S, R) {
    const O = Math.min(1, Math.max(0, 1 - S));
    return M === "low" ? 1 - Math.min(1, O * R * 1.2) : M === "crease" ? 1 - 0.45 * O : 1;
  }
  const h = e.mouth, f = e.cheeks, c = e.head, p = e.body, d = nr(e.legs, p, c), w = rr(e.arms, p, e.legs), a = (M, S, R) => {
    const O = Math.min(1, Math.max(0, (R - M) / (S - M)));
    return O * O * (3 - 2 * O);
  }, g = _n(c) ?? (() => 1);
  function x(M, S) {
    return (1 - a(...c.weightBand, S)) * g(M, S);
  }
  function b(M, S) {
    return (1 - a(...c.turnBand, S)) * g(M, S);
  }
  const E = e.strands ?? [];
  function _(M, S, R) {
    let O = 1 / 0, B = 0;
    const z = R.length - 1;
    for (let L = 0; L < z; L++) {
      const [J, W] = R[L], [re, te] = R[L + 1], A = re - J, k = te - W, G = Math.min(1, Math.max(0, ((M - J) * A + (S - W) * k) / (A * A + k * k))), ie = Math.hypot(M - J - A * G, S - W - k * G);
      ie < O && (O = ie, B = (L + G) / z);
    }
    return [O, B];
  }
  function X(M, S, R) {
    if (R < 0.02) return [];
    const O = [];
    let B = 0;
    E.forEach((L, J) => {
      const [W, re] = _(M, S, L.nodes), te = Math.exp(-((W / L.sigma) ** 2));
      te < 0.02 || (O.push([J, te, re]), B += te);
    });
    const z = Math.max(1, B);
    return O.map(([L, J, W]) => [L, R * J / z * a(0.04, 0.55, W), W]);
  }
  function $(M, S, R = 1) {
    return {
      head: x(M, S),
      turn: b(M, S),
      strands: X(M, S, R),
      bunL: n(M, S, e.buns?.bunL),
      bunR: n(M, S, e.buns?.bunR),
      brow: n(M, S, e.face.brow) * (1 - a(...e.face.brow.band, S)),
      // chin below the mouth line drops a little when the mouth opens
      jaw: n(M, S, e.face.jaw) * a(...e.face.jaw.band, S),
      // per-feature depth for head turns (nose sticks out most, ears sit at the back)
      nose: n(M, S, e.face.nose),
      mouth: n(M, S, e.face.mouth),
      eyeA: n(M, S, e.face.eyeA),
      eyeB: n(M, S, e.face.eyeB),
      earR: n(M, S, e.face.earR),
      earL: n(M, S, e.face.earL),
      chest: n(M, S, p.chest),
      breath: 1 - a(...p.breathBand, S),
      shoulder: p.shoulders.reduce((O, B) => O + n(M, S, B), 0),
      ...d && { legs: d.weights(M, S) },
      ...w && { arms: w.weights(M, S) }
    };
  }
  function Y(M, S, R, O) {
    const B = (M - c.cx) / c.rx, z = (S - c.cy) / c.ry, L = 1 - B * B - z * z;
    if (L <= 0) return [0, 0];
    const J = a(0, 0.84, L);
    return [R * c.shiftX * J, -O * c.shiftY * J];
  }
  function D(M, S, R, O) {
    const B = Math.cos(O), z = Math.sin(O), L = M[0] - S, J = M[1] - R;
    M[0] = S + L * B - J * z, M[1] = R + L * z + J * B;
  }
  function T(M, S, R, O = S) {
    const B = Y(M[0], M[1], R.angleX / 30, R.angleY / 30);
    M[0] += B[0] * O, M[1] += B[1] * O, !(S <= 0) && D(M, c.pivotX, c.pivotY, -R.angleZ / 30 * c.maxRoll * S);
  }
  function H(M, S, R, O = 0, B = 1, z = 0, L) {
    d && d.apply(M, M[0], S, L ?? d.weights(M[0], S), R);
    const J = M[0], W = M[1], re = R.breath;
    M[1] -= re * (5 * B + 4 * z), M[0] += (M[0] - p.chest.cx) * 0.012 * re * O;
    const te = p.hip;
    if (d || (M[0] += R.bodyAngleX / 10 * (te ? te.shift * (1 - a(...te.band, S)) : 7 + 9 * O)), D(M, p.pivotX, p.pivotY, -R.bodyAngleZ / 10 * p.maxRoll * (1 - a(...p.rollBand, S))), d) {
      const A = d.pin(S);
      M[0] = J + (M[0] - J) * A, M[1] = W + (M[1] - W) * A;
    }
  }
  let j, I;
  function F(M, S, R, O, B, z) {
    const L = z;
    if (L[0] = M, L[1] = S, d && !d.pin(S)) return L;
    const J = B.gain;
    for (const [te, A, k] of R.strands) {
      const G = B.strands?.[te];
      if (!G) continue;
      const ie = k * 3, le = Math.min(2, Math.floor(ie)), ge = ie - le;
      L[0] += (G[le][0] + (G[le + 1][0] - G[le][0]) * ge) * A * J, L[1] += (G[le][1] + (G[le + 1][1] - G[le][1]) * ge) * A * J;
    }
    if (L[0] += (B.bunL[0] * R.bunL + B.bunR[0] * R.bunR) * J, L[1] += (B.bunL[1] * R.bunL + B.bunR[1] * R.bunR) * J, L[1] -= O.browY * 7 * R.brow, R.brow > 0.01) {
      const te = O.browAngle * 0.12 * R.brow;
      L[1] += (M - e.face.brow.cx) * Math.sin(te);
    }
    L[1] += O.mouthOpen * 3.5 * R.jaw;
    const W = O.angleX / 30, re = O.angleY / 30;
    if (L[0] += W * (8 * R.nose + 5 * R.mouth) + (M - e.face.eyeA.cx) * 0.12 * W * R.eyeA - (M - e.face.eyeB.cx) * 0.12 * W * R.eyeB - W * 9 * R.earR + W * 4 * R.earL - W * 10 * (R.bunL + R.bunR), L[1] -= re * (6 * R.nose + 3 * R.mouth), L[1] += (S - e.face.eyeA.cy) * -0.06 * Math.abs(re) * R.eyeA + (S - e.face.eyeB.cy) * -0.06 * Math.abs(re) * R.eyeB, T(L, R.head, O, R.turn), H(L, S, O, R.chest, R.breath, R.shoulder, R.legs), w && R.arms.some((te) => te.arm > 0)) {
      const te = [
        O.angleX,
        O.angleY,
        O.angleZ,
        O.bodyAngleX,
        O.bodyAngleZ,
        O.breath,
        O.armSwingL,
        O.armSwingR,
        O.elbowBendL,
        O.elbowBendR,
        d?.frame(O)
      ];
      (!j || te.some((A, k) => A !== j[k])) && (j = te, I = w.frame(O, (A) => {
        const k = [...A], G = $(...A, 0);
        return T(k, G.head, O, G.turn), H(k, A[1], O, G.chest, G.breath, G.shoulder, G.legs), k;
      })), w.apply(L, M, S, R.arms, O, I);
    }
    return L;
  }
  const N = e.hand, C = N?.elbow ?? [0, 0], V = N?.wrist ?? [0, 0], oe = N?.knuckle ?? [0, 0], K = N?.contact ?? [0, 0], U = N?.forearmShare ?? 0;
  function Q(M, S) {
    return N ? {
      arm: 1 - a(...N.armBand, S),
      wrist: 1 - a(...N.wristBand, S),
      hand: 1 - a(...N.handBand, S),
      finger: a(...N.fingerXBand, M) * (1 - a(...N.fingerYBand, S)),
      pinBottom: a(...N.pinBand, S)
    } : { arm: 0, wrist: 0, hand: 0, finger: 0, pinBottom: 0 };
  }
  const q = (M, S, R, O) => {
    const B = M[0] - S[0], z = M[1] - S[1];
    return [S[0] + B * R - z * O, S[1] + B * O + z * R];
  }, Z = (M) => Math.atan2(M[1], M[0]);
  function se(M) {
    const S = [...K];
    T(S, x(...K), M, b(...K)), H(S, K[1], M, 0, 1, 0);
    const R = [...C];
    H(R, C[1], M, 0, 0, 0);
    const B = (Z([S[0] - R[0], S[1] - R[1]]) - Z([K[0] - C[0], K[1] - C[1]])) * U, z = Math.cos(B), L = Math.sin(B), J = (k) => {
      const G = q(k, C, z, L);
      return [G[0] + R[0] - C[0], G[1] + R[1] - C[1]];
    }, W = J(V), re = J(K), te = Z([S[0] - W[0], S[1] - W[1]]) - Z([re[0] - W[0], re[1] - W[1]]), A = Math.min(1.03, Math.max(0.97, Math.hypot(S[0] - W[0], S[1] - W[1]) / Math.hypot(re[0] - W[0], re[1] - W[1])));
    return { tr: J, w: W, b: te, k: A };
  }
  function ne(M, S, R, O, B, z) {
    let L = [M, S];
    L = q(L, oe, Math.cos(O.fingerTap * 0.07 * R.finger), Math.sin(O.fingerTap * 0.07 * R.finger));
    const J = -O.handAngle / 10 * 0.045 * R.wrist, W = -O.armAngle / 10 * 0.015 * R.arm;
    L = q(L, V, Math.cos(J), Math.sin(J)), L = q(L, C, Math.cos(W), Math.sin(W)), L = B.tr(L);
    const re = B.b * R.hand, te = 1 + (B.k - 1) * R.hand;
    return L = q(L, B.w, Math.cos(re) * te, Math.sin(re) * te), L[1] += (S - L[1]) * R.pinBottom, z[0] = L[0], z[1] = L[1], z;
  }
  const ae = e.accessories ?? [];
  function P(M, S, R, O) {
    const B = $(M.pivot[0], M.pivot[1]);
    return F(M.pivot[0], M.pivot[1], B, S, R, O);
  }
  return { legs: d, stepBody: (M, S) => d?.step(M, S), IMG: t, EYES: o, MOUTH: h, CHEEKS: f, STRANDS: E, TASSELS: ae, headWeight: x, turnWeight: b, baseWeights: $, deformBase: F, applyHead: T, applyBody: H, handWeights: Q, handFrame: se, deformHand: ne, eyePartY: m, eyePartAlpha: l, tasselAnchor: P };
}
function sr(e, t, n, r = !1) {
  const o = r ? Math.max(t, n) * 2 : 1, s = new Float32Array(e.length), i = Math.SQRT2;
  for (let u = 0; u < n; u++) for (let v = 0; v < t; v++) {
    const y = u * t + v;
    e[y] <= 3 || (s[y] = Math.min(
      v ? s[y - 1] + 1 : o,
      u ? s[y - t] + 1 : o,
      v && u ? s[y - t - 1] + i : o,
      u && v + 1 < t ? s[y - t + 1] + i : o
    ));
  }
  for (let u = n - 1; u >= 0; u--) for (let v = t - 1; v >= 0; v--) {
    const y = u * t + v;
    !e[y] || e[y] <= 3 || (s[y] = Math.min(
      s[y],
      v + 1 < t ? s[y + 1] + 1 : o,
      u + 1 < n ? s[y + t] + 1 : o,
      v && u + 1 < n ? s[y + t - 1] + i : o,
      v + 1 < t && u + 1 < n ? s[y + t + 1] + i : o
    ));
  }
  return s;
}
function _t(e, t, n) {
  return Math.exp(-(((e - n.cx) / n.rx) ** 2 + ((t - n.cy) / n.ry) ** 2));
}
function ar(e, t, n) {
  const r = ((e - n.head.cx) / n.head.rx) ** 2 + ((t - n.head.cy) / n.head.ry) ** 2;
  let o = n.head.rx * 0.8 * Math.sqrt(Math.max(0, 1 - r)) + n.body.chest.rx * 0.23 * _t(e, t, n.body.chest);
  o += n.face.nose.rx * 0.2 * _t(e, t, n.face.nose);
  for (const [s, i] of n.cheeks) o += n.head.rx * 0.012 * _t(e, t, { cx: s, cy: i, rx: n.head.rx * 0.3, ry: n.head.ry * 0.16 });
  return o;
}
function Et(e, t, n, r) {
  const o = new Float32Array(e.length), s = new Float32Array(e.length), i = (u, v, y, m, l, h) => {
    for (let f = 0; f < m; f++) {
      const c = f * h;
      let p = 0, d = 0;
      for (let w = 0; w < Math.min(r, y - 1) + 1; w++)
        p += u[c + w * l], d++;
      for (let w = 0; w < y; w++) {
        v[c + w * l] = p / d;
        const a = w + r + 1, g = w - r;
        a < y && (p += u[c + a * l], d++), g >= 0 && (p -= u[c + g * l], d--);
      }
    }
  };
  return i(e, o, t, n, 1, t), i(o, s, n, t, t, 1), s;
}
function ir(e, t, n, r) {
  const o = Et(e, n, r, 1), s = Et(e, n, r, 6), i = new Float32Array(e.length);
  for (let y = 0; y < i.length; y++) i[y] = t[y] > 128 ? o[y] - s[y] : 0;
  const u = new Float32Array(e.length * 2), v = (y, m) => i[Math.max(0, Math.min(r - 1, m)) * n + Math.max(0, Math.min(n - 1, y))];
  for (let y = 0; y < r; y++) for (let m = 0; m < n; m++) {
    const l = y * n + m;
    t[l] <= 128 || (u[2 * l] = Math.max(-1, Math.min(1, -(v(m + 1, y) - v(m - 1, y)) * 4)), u[2 * l + 1] = Math.max(-1, Math.min(1, -(v(m, y + 1) - v(m, y - 1)) * 4)));
  }
  return u;
}
function lr(e, t, n, r, o, s = !0, i) {
  const u = !!o && r[0] === 0 && r[1] === 0 && r[2] === o.image.width && r[3] === o.image.height, v = sr(e, t, n, u), y = new Float32Array(e.length), m = r[2] / t, l = r[3] / n, h = Math.min(m, l), f = Math.min(r[2], r[3]) * 0.08;
  for (let a = 0; a < n; a++) for (let g = 0; g < t; g++) {
    const x = a * t + g;
    y[x] = (s ? Math.sqrt(v[x] * h * f) * 0.55 : 0) + (o ? ar(r[0] + (g + 0.5) * m, r[1] + (a + 0.5) * l, o) : 0);
  }
  const c = Math.max(1, Math.round(Math.min(t, n) * 0.02));
  y.set(Et(Et(y, t, n, c), t, n, c));
  const p = i ? ir(i, e, t, n) : null, d = new Uint8Array(t * n * 4), w = (a, g) => y[Math.max(0, Math.min(n - 1, g)) * t + Math.max(0, Math.min(t - 1, a))];
  for (let a = 0; a < n; a++) for (let g = 0; g < t; g++) {
    const x = -(w(g + 2, a) - w(g - 2, a)) / (4 * m), b = -(w(g, a + 2) - w(g, a - 2)) / (4 * l), E = Math.hypot(x, b, 1), _ = (a * t + g) * 4, X = a * t + g;
    d[_] = Math.round((x / E * 0.5 + 0.5) * 255), d[_ + 1] = Math.round((b / E * 0.5 + 0.5) * 255), d[_ + 2] = Math.round(((p?.[2 * X] ?? 0) * 0.5 + 0.5) * 255), d[_ + 3] = Math.round(((p?.[2 * X + 1] ?? 0) * 0.5 + 0.5) * 255);
  }
  return d;
}
const un = /* @__PURE__ */ new WeakMap();
function cr(e, t, n, r) {
  const o = JSON.stringify([t, n.head, n.body.chest, n.face.nose, n.cheeks, r]), s = un.get(e);
  if (s?.key === o) return { ...s, computed: !1, ms: 0 };
  const i = performance.now(), u = Math.min(1, 512 / Math.max(e.width, e.height)), v = Math.max(1, Math.round(e.width * u)), y = Math.max(1, Math.round(e.height * u)), m = document.createElement("canvas");
  m.width = v, m.height = y;
  const l = m.getContext("2d", { willReadFrequently: !0 });
  l.drawImage(e, 0, 0, v, y);
  const h = l.getImageData(0, 0, v, y).data, f = new Uint8Array(v * y), c = new Float32Array(v * y);
  for (let d = 0; d < f.length; d++)
    f[d] = h[4 * d + 3], c[d] = (0.2126 * h[4 * d] + 0.7152 * h[4 * d + 1] + 0.0722 * h[4 * d + 2]) / 255;
  const p = { key: o, data: lr(f, v, y, t, n, r, r ? c : void 0), width: v, height: y };
  return un.set(e, p), { ...p, computed: !0, ms: performance.now() - i };
}
const nt = Object.freeze({
  enabled: !1,
  x: 0.2,
  y: 0.2,
  z: 0.45,
  color: 16777215,
  strength: 0.8,
  intensity: 0.8,
  ambient: 0.4,
  mode: "soft",
  shadow: !1,
  reach: 1.2,
  ambientColor: 15659256,
  softness: 0.45,
  specular: 0.12,
  rim: 0.3,
  detail: 0.4
}), fn = {
  x: [0, 1],
  y: [0, 1],
  z: [0.1, 2],
  color: [0, 16777215],
  strength: [0, 1],
  intensity: [0, 2],
  ambient: [0, 1],
  reach: [0.2, 3],
  ambientColor: [0, 16777215],
  softness: [0, 1],
  specular: [0, 1],
  rim: [0, 1],
  detail: [0, 1]
}, hr = /* @__PURE__ */ new Set(["color", "ambientColor"]);
function ur(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e;
  if (Object.keys(t).length !== Object.keys(nt).length || Object.keys(t).some((r) => !(r in nt)) || ![!0, !1].includes(t.enabled) || ![!0, !1].includes(t.shadow) || !["soft", "cel"].includes(t.mode)) return null;
  const n = { ...nt, enabled: t.enabled, shadow: t.shadow, mode: t.mode };
  for (const r of Object.keys(fn)) {
    const o = t[r], [s, i] = fn[r];
    if (typeof o != "number" || !Number.isFinite(o) || hr.has(r) && !Number.isInteger(o)) return null;
    n[r] = Math.max(s, Math.min(i, o));
  }
  return n;
}
function To(e) {
  return `#${e.toString(16).padStart(6, "0")}`;
}
const wt = -0.1, fr = 0.9, mr = 1, pr = 1.06;
function dr(e, t) {
  return [(0.5 - e) * 0.12, (0.5 - t) * 0.12];
}
function gr(e, t, n, r) {
  const o = e * Math.PI / 180, s = t * Math.PI / 180, i = -n / 30 * r, u = Math.cos(o), v = Math.sin(o), y = Math.cos(s), m = Math.sin(s), l = Math.cos(i), h = Math.sin(i);
  return [
    l * u,
    h * u,
    -v,
    l * v * m - h * y,
    h * v * m + l * y,
    u * m,
    l * v * y + h * m,
    h * v * y - l * m,
    u * y
  ];
}
class yr {
  constructor(t, n) {
    this.gl = t, this.program = n(t, `#version 300 es
      out vec2 vUv;
      void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p * 2.0 - 1.0, 0, 1); }`, `#version 300 es
      precision highp float; in vec2 vUv; out vec4 o;
      uniform sampler2D uTex; uniform vec2 uStep; uniform vec2 uShift; uniform int uPass;
      float alphaAt(vec2 p) { if (any(lessThan(p, vec2(0))) || any(greaterThan(p, vec2(1)))) return 0.0; return texture(uTex, p).a; }
      void main() {
        if (uPass == 2) { o = texture(uTex, vUv); return; }
        vec2 p = vUv - uShift;
        float a = alphaAt(p) * 0.227027;
        a += (alphaAt(p + uStep * 1.384615) + alphaAt(p - uStep * 1.384615)) * 0.316216;
        a += (alphaAt(p + uStep * 3.230769) + alphaAt(p - uStep * 3.230769)) * 0.070270;
        o = uPass == 0 ? vec4(0, 0, 0, a) : vec4(vec3(0.035, 0.045, 0.065) * a * 0.28, a * 0.28);
      }`), this.vao = t.createVertexArray(), this.targets = [];
  }
  target(t, n) {
    const r = this.gl, o = r.createTexture(), s = r.createFramebuffer();
    if (r.bindTexture(r.TEXTURE_2D, o), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, t, n, 0, r.RGBA, r.UNSIGNED_BYTE, null), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), r.bindFramebuffer(r.FRAMEBUFFER, s), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, o, 0), r.checkFramebufferStatus(r.FRAMEBUFFER) !== r.FRAMEBUFFER_COMPLETE) throw new Error("Shadow framebuffer unavailable");
    return { texture: o, framebuffer: s };
  }
  begin(t, n) {
    const r = this.gl;
    (this.width !== t || this.height !== n) && (this.clearTargets(), this.width = t, this.height = n, this.targets = [this.target(t, n), this.target(Math.ceil(t / 2), Math.ceil(n / 2))]), r.bindFramebuffer(r.FRAMEBUFFER, this.targets[0].framebuffer), r.viewport(0, 0, t, n), r.clearColor(0, 0, 0, 0), r.clear(r.COLOR_BUFFER_BIT);
  }
  composite(t) {
    const n = this.gl, { prog: r, u: o } = this.program, s = this.width, i = this.height;
    n.useProgram(r), n.bindVertexArray(this.vao), n.activeTexture(n.TEXTURE0), n.uniform1i(o.uTex, 0), n.disable(n.BLEND), n.bindFramebuffer(n.FRAMEBUFFER, this.targets[1].framebuffer), n.viewport(0, 0, Math.ceil(s / 2), Math.ceil(i / 2)), n.bindTexture(n.TEXTURE_2D, this.targets[0].texture), n.uniform1i(o.uPass, 0), n.uniform2f(o.uShift, 0, 0), n.uniform2f(o.uStep, 3 / s, 0), n.drawArrays(n.TRIANGLES, 0, 3), n.bindFramebuffer(n.FRAMEBUFFER, null), n.viewport(0, 0, s, i), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.enable(n.BLEND), n.bindTexture(n.TEXTURE_2D, this.targets[1].texture);
    const u = dr(t.x, t.y);
    n.uniform1i(o.uPass, 1), n.uniform2f(o.uShift, u[0], -u[1]), n.uniform2f(o.uStep, 0, 3 / i), n.drawArrays(n.TRIANGLES, 0, 3), n.bindTexture(n.TEXTURE_2D, this.targets[0].texture), n.uniform1i(o.uPass, 2), n.drawArrays(n.TRIANGLES, 0, 3), n.bindVertexArray(null);
  }
  clearTargets() {
    for (const t of this.targets)
      this.gl.deleteTexture(t.texture), this.gl.deleteFramebuffer(t.framebuffer);
    this.targets = [];
  }
  destroy() {
    this.clearTargets(), this.gl.deleteProgram(this.program.prog), this.gl.deleteVertexArray(this.vao);
  }
}
function vr(e, t) {
  const { IMG: n, EYES: r, MOUTH: o, CHEEKS: s } = e, i = `#version 300 es
  in vec2 aPos; in vec2 aUv;
  uniform vec2 uScale; uniform vec2 uOffset;
  out vec2 vUv;
  void main() { vUv = aUv; gl_Position = vec4(aPos * uScale + uOffset, 0.0, 1.0); }`, u = `#version 300 es
  precision highp float;
  in vec2 vUv; out vec4 outColor;
  uniform sampler2D uTex;
  uniform vec4 uRect;        // layer rect in source px
  uniform int uFace;
  uniform float uAlpha;
  uniform vec4 uEyeBox[2];   // x0, x1, -, -
  uniform float uEyeTop[48]; // 2 eyes x EYE_N samples
  uniform float uEyeBot[48];
  uniform vec4 uEyeState[2]; // open, smile, ballX(px), ballY(px)
  uniform vec4 uMouth;       // cx, cy, angle, halfLen
  uniform vec4 uMouthState;  // open, form, bow, -
  uniform vec4 uCheeks;      // x0, y0, x1, y1
  uniform float uCheek;

  const int EYE_N = 24;
  float crv(int e, bool top, float u) {
    float f = clamp(u, 0.0, 1.0) * float(EYE_N - 1);
    int i = min(int(floor(f)), EYE_N - 2);
    float t = f - float(i);
    int k = e * EYE_N + i;
    return top ? mix(uEyeTop[k], uEyeTop[k + 1], t) : mix(uEyeBot[k], uEyeBot[k + 1], t);
  }

  // Upper lid line and lower lid line of eye e at column u, for the current open/smile state.
  // Must match eyeLids() in rig.js, which moves the lash meshes to the same lines.
  // Must match eyeLidsRaw() / eyeLids() in rig.js.
  vec2 eyeLidsRaw(int e, float u) {
    u = clamp(u, 0.0, 1.0);
    vec4 st = uEyeState[e];
    float top = crv(e, true, u), bot = crv(e, false, u);
    float b = 1.0 - st.x, smile = st.y, hump = 4.0 * u * (1.0 - u);
    float H = crv(e, false, 0.5) - crv(e, true, 0.5);
    float arc = mix(uEyeTop[e * EYE_N], uEyeTop[e * EYE_N + EYE_N - 1], u) - 0.3 * H * hump;
    float closed = max(top, bot + 1.0 + (arc - bot - 1.0) * smile);
    return vec2((closed - top) * max(b, -0.07), b > 0.0 ? (closed - bot) * b * smile : 0.0);
  }

  vec2 eyeLids(int e, float u, float top, float bot) {
    vec4 box = uEyeBox[e];
    float du = 5.0 / (box.y - box.x);
    vec2 raw = eyeLidsRaw(e, u);
    vec2 d = (eyeLidsRaw(e, u - 2.0 * du) + 2.0 * eyeLidsRaw(e, u - du) + 3.0 * raw
            + 2.0 * eyeLidsRaw(e, u + du) + eyeLidsRaw(e, u + 2.0 * du)) / 9.0;
    // for hiding the ball take whichever closes more: the smoothed lash can sit a little
    // above the raw lid near the corners, and the gap must show lid skin, not eye white
    return vec2(top + max(d.x, raw.x), bot + min(d.y, raw.y));
  }

  vec4 texAt(vec2 p) { return texture(uTex, (p - uRect.xy) / uRect.zw); }

  // Half-eye sprites share the open eye's rig curves. Use the middle of that
  // opening for gaze, tapering travel near the painted lids and corners.
  vec2 halfEyeUv(int e, vec2 p) {
    vec2 gaze = uEyeState[e].zw;
    vec2 box = uEyeBox[e].xy;
    float span = box.y - box.x;
    float u = (p.x - box.x) / span;
    if (all(equal(gaze, vec2(0.0))) || u <= 0.0 || u >= 1.0) return vUv;
    float top = crv(e, true, u), bottom = crv(e, false, u);
    float height = bottom - top;
    if (height < 2.0) return vUv;
    float v = (p.y - top) / height;
    float w = smoothstep(0.18, 0.34, v) * (1.0 - smoothstep(0.70, 0.85, v))
            * smoothstep(0.0, 0.23, min(u, 1.0 - u));
    if (w == 0.0) return vUv;
    float x = p.x - clamp(gaze.x * 0.8, -0.08 * span, 0.08 * span) * w;
    float sourceU = (x - box.x) / span;
    float dy = clamp(gaze.y / height, -0.05, 0.05) * w;
    float y = mix(crv(e, true, sourceU), crv(e, false, sourceU), v - dy);
    return (vec2(x, y) - uRect.xy) / uRect.zw;
  }

  // Eye white + iris layer: shown only between the lids (the lids cover it, it never squashes);
  // the iris slides inside the opening for the gaze.
  vec4 eyeBall(int e, vec2 p) {
    vec4 box = uEyeBox[e]; vec4 st = uEyeState[e];
    float u = clamp((p.x - box.x) / (box.y - box.x), 0.0, 1.0);
    float top = crv(e, true, u), bot = crv(e, false, u);
    vec2 lids = eyeLids(e, u, top, bot);
    float v = clamp((p.y - top) / max(bot - top, 1.0), 0.0, 1.0);
    float w = sqrt(4.0 * u * (1.0 - u)) * sqrt(4.0 * v * (1.0 - v));
    vec4 c = texAt(p - vec2(st.z, st.w) * w);
      // the lash covers ~2px of the ball's upper edge, so the cut can sit under it (no seam)
    return c * smoothstep(lids.x - 1.0, lids.x + 0.5, p.y) * (1.0 - smoothstep(lids.y - 0.9, lids.y + 0.6, p.y));
  }

  vec4 mouth(vec2 p, vec4 base) {
    float open = uMouthState.x;
    if (open < 0.01) return base;
    vec2 d = vec2(cos(uMouth.z), sin(uMouth.z)), n = vec2(-d.y, d.x);
    vec2 r = p - uMouth.xy;
    float s = dot(r, d) / uMouth.w, t = dot(r, n);
    float form = uMouthState.y;                       // -1 wide "i" .. +1 round "o"
    float wf = mix(0.78, 0.46, clamp(form * 0.5 + 0.5, 0.0, 1.0));
    float k = 1.0 - (s / wf) * (s / wf);
    if (k <= 0.0) return base;
    float line = uMouthState.z * (1.0 - s * s);
    float hk = pow(k, mix(0.55, 0.85, clamp(form, 0.0, 1.0)));
    float H = mix(20.0, 26.0, clamp(form, 0.0, 1.0));
    float up = line - 0.6 - open * 2.5 * hk;
    float lo = line + open * H * hk;
    float cov = smoothstep(-0.7, 0.7, t - up) * smoothstep(-0.7, 0.7, lo - t);
    if (cov <= 0.0) return base;
    float tv = clamp((t - up) / max(lo - up, 1.0), 0.0, 1.0);
    vec3 col = mix(vec3(0.24, 0.05, 0.08), vec3(0.48, 0.15, 0.19), tv);
    float tongue = smoothstep(0.5, 0.78, tv) * (1.0 - smoothstep(0.45, 0.8, abs(s) / wf));
    col = mix(col, vec3(0.86, 0.44, 0.47), tongue * 0.9);
    float teeth = (1.0 - smoothstep(0.12, 0.22, tv)) * smoothstep(0.25, 0.45, open) * (1.0 - smoothstep(0.55, 0.85, abs(s) / wf));
    col = mix(col, vec3(0.99, 0.96, 0.94), teeth);
    float rim = 1.0 - smoothstep(0.6, 1.8, lo - t);
    col = mix(col, vec3(0.36, 0.09, 0.11), rim * 0.85);
    return vec4(mix(base.rgb, col, cov), 1.0);
  }

  void main() {
    vec2 p = uRect.xy + vUv * uRect.zw;
    vec2 materialUv = vUv;
    vec4 c;
    if (uFace == 1) {
      c = mouth(p, texAt(p));
      float blush = exp(-dot((p - uCheeks.xy) / vec2(48.0, 22.0), (p - uCheeks.xy) / vec2(48.0, 22.0)))
                  + exp(-dot((p - uCheeks.zw) / vec2(40.0, 20.0), (p - uCheeks.zw) / vec2(40.0, 20.0)));
      c.rgb = mix(c.rgb, c.rgb * vec3(1.0, 0.62, 0.64) , clamp(blush * uCheek * 0.55, 0.0, 1.0) * c.a);
    } else if (uFace >= 4) {
      materialUv = halfEyeUv(uFace - 4, p);
      c = texture(uTex, materialUv);
    } else if (uFace >= 2) {
      c = eyeBall(uFace - 2, p);
    } else {
      c = texAt(p);
    }
    outColor = c * uAlpha;
  }`, v = i.replace("out vec2 vUv;", "in float aHeadWeight; out float vHeadWeight; out vec2 vScreen; out vec2 vUv;").replace("vUv = aUv;", "vHeadWeight = aHeadWeight; vScreen = vec2((aPos.x * uScale.x + uOffset.x + 1.0) * 0.5, (1.0 - aPos.y * uScale.y - uOffset.y) * 0.5); vUv = aUv;"), y = u.replace("uniform sampler2D uTex;", `uniform sampler2D uTex;
    uniform sampler2D uNormal; in float vHeadWeight; in vec2 vScreen;
    uniform mat3 uHeadRotation; uniform vec3 uLight; uniform vec3 uLightColor; uniform vec3 uAmbientColor;
    uniform vec4 uLighting; uniform vec4 uSurface; uniform float uAspect; uniform int uCel;`).replace("outColor = c * uAlpha;", `
      // RG hold the smooth surface normal, BA the painting's relief (see lighting/normals.ts).
      vec4 encoded = texture(uNormal, materialUv);
      vec2 base = encoded.rg * 2.0 - 1.0;
      vec3 n = vec3(base, sqrt(max(0.0, 1.0 - dot(base, base))));
      n = normalize(n + vec3((encoded.ba * 2.0 - 1.0) * uSurface.w * ${fr.toFixed(3)}, 0.0));
      n = normalize(mix(n, uHeadRotation * n, vHeadWeight));
      vec2 toLight = (uLight.xy - vScreen) * vec2(uAspect, 1.0);
      vec3 light = normalize(vec3(toLight, uLight.z));
      float ndl = dot(n, light);
      float diffuse;
      if (uCel == 1) {
        float w = 0.01 + uSurface.x * 0.08;
        diffuse = 0.2 + 0.45 * smoothstep(${wt.toFixed(3)} - w, ${wt.toFixed(3)} + w, ndl) + 0.35 * smoothstep(0.55 - w, 0.55 + w, ndl);
      } else {
        float s = 0.05 + uSurface.x * 0.5;
        diffuse = smoothstep(${wt.toFixed(3)} - s, ${wt.toFixed(3)} + s, ndl) * (0.35 + 0.65 * max(0.0, ndl));
      }
      float reach = dot(toLight, toLight) / (uLighting.w * uLighting.w);
      float attenuation = 1.0 / (1.0 + reach);
      vec3 radiance = uLightColor * uLighting.y * attenuation;
      // A light close to the surface may brighten a little, but must not bleach painted colours.
      vec3 irradiance = min(uAmbientColor * uLighting.z + radiance * diffuse, vec3(${pr.toFixed(3)}));
      // Painted shadows are deeper versions of the base colour, not grey: multiply by the colour
      // itself as the surface turns away from the light.
      vec3 albedo = c.rgb / max(c.a, 1e-4);
      float dark = 1.0 - clamp(dot(irradiance, vec3(0.3333)), 0.0, 1.0);
      vec3 shaded = c.rgb * mix(vec3(1.0), albedo, dark * ${mr.toFixed(3)}) * irradiance;
      float specular = pow(max(dot(n, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 60.0) * uSurface.y;
      if (uCel == 1) specular = smoothstep(0.3, 0.35, specular) * uSurface.y;
      vec2 side = length(n.xy) > 0.001 ? normalize(n.xy) : vec2(0.0);
      float rim = pow(1.0 - max(n.z, 0.0), 4.0) * smoothstep(-0.2, 0.7, dot(side, normalize(toLight + vec2(1e-4)))) * uSurface.z;
      shaded += radiance * (specular * max(0.0, ndl) + rim) * c.a;
      // Strength blends between the original painting and the relit result; alpha is unchanged.
      c.rgb = clamp(mix(c.rgb, shaded, uLighting.x), vec3(0.0), vec3(c.a));
      outColor = c * uAlpha;`), m = `#version 300 es
  in vec2 aPos; uniform vec2 uScale; uniform vec2 uOffset;
  void main() { gl_Position = vec4(aPos * uScale + uOffset, 0.0, 1.0); gl_PointSize = 7.0; }`, l = `#version 300 es
  precision mediump float; uniform vec4 uColor; out vec4 o; void main() { o = uColor; }`;
  function h(d, w, a) {
    const g = d.createProgram();
    for (const [E, _] of [[d.VERTEX_SHADER, w], [d.FRAGMENT_SHADER, a]]) {
      const X = d.createShader(E);
      if (d.shaderSource(X, _), d.compileShader(X), !d.getShaderParameter(X, d.COMPILE_STATUS)) throw new Error(d.getShaderInfoLog(X));
      d.attachShader(g, X), d.deleteShader(X);
    }
    if (d.bindAttribLocation(g, 0, "aPos"), d.bindAttribLocation(g, 1, "aUv"), d.bindAttribLocation(g, 2, "aHeadWeight"), d.linkProgram(g), !d.getProgramParameter(g, d.LINK_STATUS)) throw new Error(d.getProgramInfoLog(g));
    const x = {}, b = d.getProgramParameter(g, d.ACTIVE_UNIFORMS);
    for (let E = 0; E < b; E++) {
      const _ = d.getActiveUniform(g, E).name.replace("[0]", "");
      x[_] = d.getUniformLocation(g, _);
    }
    return { prog: g, u: x };
  }
  function f(d, w, a, g) {
    const x = [d];
    let b = d;
    for (; b < d + w - 0.5; ) {
      const E = g && b >= g.from && b < g.to ? g.cell : a;
      b = Math.min(d + w, b + E), x.push(b);
    }
    return x;
  }
  function c(d, w, a, g, x = null) {
    const [b, E, _, X] = d, $ = f(b, _, w, x && { from: x.x0, to: x.x1, cell: x.cell }), Y = f(E, X, w, x && { from: x.y0, to: x.y1, cell: x.cell }), D = $.length - 1, T = Y.length - 1, H = (D + 1) * (T + 1), j = new Float32Array(H * 2), I = new Float32Array(H * 2);
    for (let oe = 0; oe <= T; oe++) for (let K = 0; K <= D; K++) {
      const U = oe * (D + 1) + K;
      j[U * 2] = $[K], j[U * 2 + 1] = Y[oe], I[U * 2] = ($[K] - b) / _, I[U * 2 + 1] = (Y[oe] - E) / X;
    }
    const F = [], N = [], C = a.length / g, V = g === 1 ? 0 : 1;
    for (let oe = 0; oe < T; oe++) for (let K = 0; K < D; K++) {
      const U = Math.floor($[K] - b) * V - 2, Q = Math.ceil($[K + 1] - b) * V + 2, q = Math.floor(Y[oe] - E) * V - 2, Z = Math.ceil(Y[oe + 1] - E) * V + 2;
      let se = !1;
      for (let S = Math.max(0, q); S < Math.min(C, Z) && !se; S += 1)
        for (let R = Math.max(0, U); R < Math.min(g, Q); R += 1)
          if (a[S * g + R] > 3) {
            se = !0;
            break;
          }
      if (!se) continue;
      const ne = oe * (D + 1) + K, ae = ne + 1, P = ne + D + 1, M = P + 1;
      F.push(ne, ae, P, ae, M, P), N.push(ne, ae, ne, P, ae, P), K === D - 1 && N.push(ae, M), oe === T - 1 && N.push(P, M);
    }
    return { rect: d, cols: D, rows: T, rest: j, uv: I, pos: new Float32Array(j), tris: new Uint32Array(F), lines: new Uint32Array(N) };
  }
  class p {
    // padTop / padSide: margin around the image, as a share of its height / width. A negative
    // padTop pushes the top of the image above the canvas (hides a cut-off top edge).
    constructor(w, { padTop: a = 0, padSide: g = 0, fit: x = "contain" } = {}) {
      this.pad = { top: a, side: g }, this.fit = x;
      const b = w.getContext("webgl2", { premultipliedAlpha: !0, antialias: !0, alpha: !0, preserveDrawingBuffer: !0 });
      if (!b) throw new Error("WebGL2 is not available");
      this.gl = b, this.canvas = w, this.main = h(b, i, u), this.line = h(b, m, l), this.layers = [], this.lighting = nt, this.lightingStats = { normalMs: 0, computedLayers: 0, cachedLayers: 0 }, b.enable(b.BLEND), b.blendFunc(b.ONE, b.ONE_MINUS_SRC_ALPHA);
    }
    texture(w) {
      const a = this.gl, g = a.createTexture();
      return a.bindTexture(a.TEXTURE_2D, g), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, w), a.generateMipmap(a.TEXTURE_2D), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), g;
    }
    addLayer(w, a, g, x = {}) {
      const b = this.gl, E = b.createVertexArray();
      b.bindVertexArray(E);
      const _ = b.createBuffer();
      b.bindBuffer(b.ARRAY_BUFFER, _), b.bufferData(b.ARRAY_BUFFER, g.pos, b.DYNAMIC_DRAW);
      for (const j of [this.main, this.line]) {
        const I = b.getAttribLocation(j.prog, "aPos");
        b.enableVertexAttribArray(I), b.vertexAttribPointer(I, 2, b.FLOAT, !1, 0, 0);
      }
      const X = b.createBuffer();
      b.bindBuffer(b.ARRAY_BUFFER, X), b.bufferData(b.ARRAY_BUFFER, g.uv, b.STATIC_DRAW);
      const $ = b.getAttribLocation(this.main.prog, "aUv");
      b.enableVertexAttribArray($), b.vertexAttribPointer($, 2, b.FLOAT, !1, 0, 0);
      const Y = b.createBuffer();
      b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, Y), b.bufferData(b.ELEMENT_ARRAY_BUFFER, g.tris, b.STATIC_DRAW), b.bindVertexArray(null);
      const D = b.createBuffer();
      b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, D), b.bufferData(b.ELEMENT_ARRAY_BUFFER, g.lines, b.STATIC_DRAW);
      let T = x.face ? 1 : 0;
      x.eyeBall !== void 0 && (T = 2 + x.eyeBall), x.halfEye !== void 0 && (T = 4 + x.halfEye);
      const H = { name: w, image: a, mesh: g, tex: this.texture(a), vao: E, posBuf: _, uvBuf: X, triBuf: Y, lineBuf: D, visible: !0, faceMode: T, color: x.color || [1, 1, 1, 1] };
      return this.layers.push(H), H;
    }
    destroy() {
      const w = this.gl;
      for (const a of this.layers) {
        w.deleteTexture(a.tex), a.normal && w.deleteTexture(a.normal), a.headBuf && w.deleteBuffer(a.headBuf), w.deleteVertexArray(a.vao);
        for (const g of [a.posBuf, a.uvBuf, a.triBuf, a.lineBuf]) w.deleteBuffer(g);
      }
      w.deleteProgram(this.main.prog), w.deleteProgram(this.line.prog), this.lit && w.deleteProgram(this.lit.prog), this.shadow?.destroy(), this.layers.length = 0;
    }
    setLighting(w) {
      if (this.lighting = ur({ ...nt, ...w }) ?? nt, !this.lighting.enabled) return;
      const a = this.gl;
      this.lit || (this.lit = h(a, v, y));
      for (const g of this.layers) {
        if (g.normal || g.overlay) continue;
        const x = cr(g.image, g.mesh.rect, t, !/^(eye|mouth)/.test(g.name));
        this.lightingStats.normalMs += x.ms, this.lightingStats[x.computed ? "computedLayers" : "cachedLayers"]++, g.normal = a.createTexture(), a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, g.normal), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, x.width, x.height, 0, a.RGBA, a.UNSIGNED_BYTE, x.data), a.generateMipmap(a.TEXTURE_2D), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE);
        const b = new Float32Array(g.mesh.rest.length / 2);
        for (let E = 0; E < b.length; E++) b[E] = e.headWeight(g.mesh.rest[E * 2], g.mesh.rest[E * 2 + 1]);
        g.headBuf = a.createBuffer(), a.bindVertexArray(g.vao), a.bindBuffer(a.ARRAY_BUFFER, g.headBuf), a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW), a.enableVertexAttribArray(2), a.vertexAttribPointer(2, 1, a.FLOAT, !1, 0, 0);
      }
      a.bindVertexArray(null), this.lighting.shadow && !this.shadow && (this.shadow = new yr(a, h));
    }
    resize() {
      const w = this.canvas, a = Math.min(window.devicePixelRatio || 1, 2), g = Math.round(w.clientWidth * a), x = Math.round(w.clientHeight * a);
      (w.width !== g || w.height !== x) && (w.width = g, w.height = x);
      const b = (this.fit === "cover" ? Math.max : Math.min)(g / (n.w * (1 + 2 * this.pad.side)), x / (n.h * (1 + this.pad.top))), E = (g - n.w * b) / 2, _ = (x - n.h * b) / (this.fit === "cover" ? 2 : 1);
      this.scale = [2 * b / g, -2 * b / x], this.offset = [-1 + 2 * E / g, 1 - 2 * _ / x], this.pxScale = b, this.pxOff = [E, _];
    }
    draw(w) {
      const a = this.gl;
      this.resize(), a.viewport(0, 0, this.canvas.width, this.canvas.height), a.clearColor(0, 0, 0, 0), a.clear(a.COLOR_BUFFER_BIT);
      const g = this.lighting.enabled, x = g && this.lighting.shadow;
      x && this.shadow.begin(this.canvas.width, this.canvas.height);
      const b = g ? this.lit : this.main;
      if (this.current = b, a.useProgram(b.prog), g) {
        const E = this.lighting;
        a.uniform1i(b.u.uNormal, 1), a.uniform3f(b.u.uLight, E.x, E.y, E.z), a.uniform3f(b.u.uLightColor, (E.color >> 16 & 255) / 255, (E.color >> 8 & 255) / 255, (E.color & 255) / 255), a.uniform3f(b.u.uAmbientColor, (E.ambientColor >> 16 & 255) / 255, (E.ambientColor >> 8 & 255) / 255, (E.ambientColor & 255) / 255), a.uniform4f(b.u.uLighting, E.strength, E.intensity, E.ambient, E.reach), a.uniform4f(b.u.uSurface, E.softness, E.specular, E.rim, E.detail), a.uniform1f(b.u.uAspect, this.canvas.width / this.canvas.height), a.uniform1i(b.u.uCel, E.mode === "cel" ? 1 : 0), a.uniformMatrix3fv(b.u.uHeadRotation, !1, gr(w.angleX ?? 0, w.angleY ?? 0, w.angleZ ?? 0, t.head.maxRoll));
      }
      a.uniform2fv(b.u.uScale, this.scale), a.uniform2fv(b.u.uOffset, this.offset), a.uniform1i(b.u.uTex, 0), a.uniform4fv(b.u.uEyeBox, r.flatMap((E) => [E.x0, E.x1, 0, 0])), a.uniform1fv(b.u.uEyeTop, r.flatMap((E) => E.top)), a.uniform1fv(b.u.uEyeBot, r.flatMap((E) => E.bot)), a.uniform4fv(b.u.uEyeState, w.eyes), a.uniform4f(b.u.uMouth, o.cx, o.cy, o.angle, o.halfLen), a.uniform4f(b.u.uMouthState, w.mouthOpen, w.mouthForm, o.bow, 0), a.uniform4f(b.u.uCheeks, s[0][0], s[0][1], s[1][0], s[1][1]), a.uniform1f(b.u.uCheek, w.cheek), a.activeTexture(a.TEXTURE0);
      for (const E of this.layers)
        !E.visible || E.overlay || this.drawLayer(E, E.alpha ?? 1);
      if (this.original && w.originalAlpha > 0 && this.drawLayer(this.original, w.originalAlpha), x && this.shadow.composite(this.lighting), w.showMesh) {
        const E = this.line;
        a.useProgram(E.prog), a.uniform2fv(E.u.uScale, this.scale), a.uniform2fv(E.u.uOffset, this.offset);
        for (const _ of this.layers)
          !_.visible || _.overlay || (a.bindVertexArray(_.vao), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, _.lineBuf), a.uniform4fv(E.u.uColor, _.color), a.drawElements(a.LINES, _.mesh.lines.length, a.UNSIGNED_INT, 0), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, _.triBuf));
        w.joints?.length && this.drawPoints(w.joints), a.bindVertexArray(null);
      }
    }
    drawLayer(w, a) {
      const g = this.gl, x = this.current;
      g.useProgram(x.prog), g.bindVertexArray(w.vao), g.bindBuffer(g.ARRAY_BUFFER, w.posBuf), g.bufferSubData(g.ARRAY_BUFFER, 0, w.mesh.pos), this.lighting.enabled && (g.activeTexture(g.TEXTURE1), g.bindTexture(g.TEXTURE_2D, w.normal), g.activeTexture(g.TEXTURE0)), g.bindTexture(g.TEXTURE_2D, w.tex), g.uniform4fv(x.u.uRect, w.mesh.rect), g.uniform1i(x.u.uFace, w.faceMode), g.uniform1f(x.u.uAlpha, a), g.drawElements(g.TRIANGLES, w.mesh.tris.length, g.UNSIGNED_INT, 0);
    }
    drawPoints(w) {
      const a = this.gl, g = this.line;
      if (!this.pointBuf) {
        this.pointBuf = a.createBuffer(), this.pointVao = a.createVertexArray(), a.bindVertexArray(this.pointVao), a.bindBuffer(a.ARRAY_BUFFER, this.pointBuf);
        const x = a.getAttribLocation(g.prog, "aPos");
        a.enableVertexAttribArray(x), a.vertexAttribPointer(x, 2, a.FLOAT, !1, 0, 0);
      }
      a.bindVertexArray(this.pointVao), a.bindBuffer(a.ARRAY_BUFFER, this.pointBuf), a.bufferData(a.ARRAY_BUFFER, new Float32Array(w.flat()), a.DYNAMIC_DRAW), a.uniform4f(g.u.uColor, 1, 0.85, 0.2, 1), a.drawArrays(a.POINTS, 0, w.length);
    }
    // canvas CSS px -> source image px
    toImage(w, a) {
      if (!this.pxOff) return null;
      const g = this.canvas.width / this.canvas.clientWidth;
      return [(w * g - this.pxOff[0]) / this.pxScale, (a * g - this.pxOff[1]) / this.pxScale];
    }
  }
  return { Renderer: p, buildGrid: c };
}
function br(e, t) {
  const { applyHead: n, applyBody: r, TASSELS: o, tasselAnchor: s } = e, i = (t.strands ?? []).map((a) => {
    if (a.nodes.length === 4) return a;
    const g = Array.from({ length: 4 }, (x, b) => {
      const E = b / 3 * (a.nodes.length - 1), _ = Math.min(a.nodes.length - 2, Math.floor(E)), X = E - _;
      return [0, 1].map(($) => a.nodes[_][$] + (a.nodes[_ + 1][$] - a.nodes[_][$]) * X);
    });
    return { ...a, nodes: g };
  }), u = [0, 300, 200, 140], v = 0.9, y = 7, m = { stiff: 1.7, damp: 1.6, couple: 0.85, reach: 0.9, bind: 4 }, l = Math.min(6, i.filter((a) => a.name.startsWith("bang")).length), h = { freq: 0.7, zeta: 0.22, hang: 0.85, inertia: 0.32, wind: 0.03, max: 0.55, smooth: 6 }, f = (a, g) => [a[0] * Math.cos(g) - a[1] * Math.sin(g), a[0] * Math.sin(g) + a[1] * Math.cos(g)], c = (a, g) => {
    const x = Math.hypot(a[0], a[1]);
    if (x < 1e-6) return a;
    const b = g * Math.tanh(x / g) / x;
    return [a[0] * b, a[1] * b];
  }, p = Object.fromEntries(Object.entries(t.buns ?? {}).map(([a, g]) => [a, { at: [g.cx, g.cy], k: 260, c: 11, hang: 3, max: 4 }])), d = (a, g) => {
    const x = Math.hypot(a[0], a[1]);
    x > g && (a[0] *= g / x, a[1] *= g / x);
  };
  class w {
    constructor() {
      this.gain = 1, this.out = { gain: 1, bunL: [0, 0], bunR: [0, 0] }, this.hair = {};
      for (const g of Object.keys(p))
        this.hair[g] = { p: null, v: [0, 0] }, this.out[g] = [0, 0];
      this.strands = i.map(() => ({ p: null, v: [[0, 0], [0, 0], [0, 0], [0, 0]] })), this.out.strands = i.map(() => [[0, 0], [0, 0], [0, 0], [0, 0]]), this.chains = o.map((g) => {
        const x = g.tip[0] - g.pivot[0], b = g.tip[1] - g.pivot[1], E = Math.hypot(x, b), _ = [x / E, b / E];
        return { t: g, dir: _, L1: E * g.split, L2: E * (1 - g.split), pts: null, prev: null, phi: [0, 0], anchor: [0, 0] };
      }), this.time = 0;
    }
    hairAnchor(g, x) {
      const b = [g[0], g[1]];
      return n(b, 1, x), r(b, g[1], x), b;
    }
    step(g, x) {
      e.stepBody?.(g, x);
      const b = Math.max(1, Math.ceil(x / (1 / 240))), E = Math.min(x, 0.05) / b, _ = -g.angleZ / 30 * t.head.maxRoll - g.bodyAngleZ / 10 * t.body.maxRoll, X = this.gain;
      i.forEach((Y, D) => {
        const T = this.strands[D], H = this.out.strands[D], j = Y.nodes.map((F) => this.hairAnchor(F, g));
        T.p || (T.p = j.map((F) => [...F]));
        const I = D * 1.7;
        for (let F = 0; F < b; F++) {
          const N = this.time + F * E;
          for (let C = 1; C < 4; C++) {
            const V = Math.hypot(Y.nodes[C][0] - Y.nodes[0][0], Y.nodes[C][1] - Y.nodes[0][1]), oe = (Math.sin(N * 1.3) * 0.5 + Math.sin(N * 3.1) * 0.3 + Math.sin(N * 4.7 + I) * 0.2) * Y.max * 0.1 * C / 3, K = [T.p[C - 1][0] - j[C - 1][0], T.p[C - 1][1] - j[C - 1][1]], U = j[C][0] + K[0] * v * m.couple - Math.sin(_) * V * 0.12 + oe, Q = j[C][1] + K[1] * v * m.couple, q = u[C] * Y.k * m.stiff / Math.max(0.35, X), Z = y * m.damp * Math.sqrt(m.stiff) / Math.max(0.5, Math.sqrt(X)), se = T.v[C], ne = T.p[C];
            se[0] += (q * (U - ne[0]) - Z * se[0]) * E, se[1] += (q * (Q - ne[1]) - Z * se[1]) * E, ne[0] += se[0] * E, ne[1] += se[1] * E;
          }
          T.p[0] = [...j[0]];
        }
        for (let F = 0; F < 4; F++) {
          const N = [T.p[F][0] - j[F][0], T.p[F][1] - j[F][1]];
          H[F] = c(N, Math.max(0.5, Y.max * m.reach * Math.max(1, X) * F / 3));
        }
      });
      for (const [Y, D] of Object.entries(p)) {
        const T = this.hair[Y], H = this.hairAnchor(D.at, g), j = Math.sin(this.time * 1.3 + D.at[0] * 0.01) * 0.6 + Math.sin(this.time * 2.9 + D.at[1] * 0.02) * 0.4, I = H[0] - Math.sin(_) * D.hang + j * D.max * 0.12, F = H[1];
        T.p || (T.p = [I, F]);
        const N = D.k / Math.max(0.35, X), C = D.c / Math.max(0.5, Math.sqrt(X));
        for (let oe = 0; oe < b; oe++)
          T.v[0] += (N * (I - T.p[0]) - C * T.v[0]) * E, T.v[1] += (N * (F - T.p[1]) - C * T.v[1]) * E, T.p[0] += T.v[0] * E, T.p[1] += T.v[1] * E;
        const V = [T.p[0] - H[0], T.p[1] - H[1]];
        d(V, D.max * Math.max(1, X)), this.out[Y] = V;
      }
      this.out.gain = 1;
      const $ = this.out.strands;
      for (let Y = 0; Y < m.bind; Y++) for (let D = 1; D < 4; D++) {
        const T = $.slice(0, l).map((H) => [...H[D]]);
        for (let H = 0; H < l; H++) {
          const j = T[Math.max(0, H - 1)], I = T[Math.min(l - 1, H + 1)];
          for (const F of [0, 1]) $[H][D][F] = T[H][F] * 0.5 + (j[F] + I[F]) * 0.25;
        }
      }
      for (const Y of this.chains) {
        const D = s(Y.t, g, this.out, [0, 0]);
        Y.st || (Y.st = { th: [0, 0], w: [0, 0], pos: [...D], vel: [0, 0], acc: [0, 0] });
        const T = Y.st, H = h, j = [(D[0] - T.pos[0]) / Math.max(x, 1e-3), (D[1] - T.pos[1]) / Math.max(x, 1e-3)], I = 1 - Math.exp(-x * H.smooth), F = [(j[0] - T.vel[0]) / Math.max(x, 1e-3), (j[1] - T.vel[1]) / Math.max(x, 1e-3)];
        T.acc = [T.acc[0] + (F[0] - T.acc[0]) * I, T.acc[1] + (F[1] - T.acc[1]) * I], T.vel = [T.vel[0] + (j[0] - T.vel[0]) * I, T.vel[1] + (j[1] - T.vel[1]) * I], T.pos = [...D];
        const N = [-Y.dir[1], Y.dir[0]], C = -(T.acc[0] * N[0] + T.acc[1] * N[1]) / (Y.L1 + Y.L2) * H.inertia, V = (Math.sin(this.time * 0.9 + Y.t.pivot[0]) * 0.6 + Math.sin(this.time * 0.37 + Y.t.pivot[1]) * 0.4) * H.wind, oe = -_ * H.hang + V, K = 2 * Math.PI * H.freq / Math.sqrt(Math.max(0.4, X)), U = K * 1.35;
        for (let se = 0; se < b; se++) {
          const ne = -K * K * (T.th[0] - oe) - 2 * H.zeta * K * T.w[0] + C;
          T.w[0] += ne * E, T.th[0] += T.w[0] * E;
          const ae = -U * U * (T.th[1] - T.th[0]) - 2 * H.zeta * U * T.w[1] + C * 0.4 + ne * 0.5;
          T.w[1] += ae * E, T.th[1] += T.w[1] * E;
        }
        T.th[0] = Math.max(-0.55, Math.min(H.max, T.th[0])), T.th[1] = Math.max(-0.55 * 1.4, Math.min(H.max * 1.4, T.th[1])), Y.phi = [T.th[0], T.th[1]];
        const Q = f(Y.dir, T.th[0]), q = f(Y.dir, T.th[1]), Z = [D[0] + Q[0] * Y.L1, D[1] + Q[1] * Y.L1];
        Y.pts = [[...D], Z, [Z[0] + q[0] * Y.L2, Z[1] + q[1] * Y.L2]], Y.anchor = D;
      }
      return this.time += x, this.out;
    }
  }
  return { Physics: w };
}
const Fn = (e, t) => e.reduce((n, r, o) => n + r * t[o], 0);
function wr(e, t) {
  const n = t.length, r = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let u = 0; u <= i; u++) {
    let v = e[i][u];
    for (let y = 0; y < u; y++) v -= r[i][y] * r[u][y];
    r[i][u] = i === u ? Math.sqrt(Math.max(1e-18, v)) : v / r[u][u];
  }
  const o = [], s = [];
  for (let i = 0; i < n; i++) o[i] = (t[i] - Fn(r[i].slice(0, i), o)) / r[i][i];
  for (let i = n - 1; i >= 0; i--) {
    let u = o[i];
    for (let v = i + 1; v < n; v++) u -= r[v][i] * s[v];
    s[i] = u / r[i][i];
  }
  return s;
}
function xr(e) {
  const t = e.map((o) => [...o]), n = t.length, r = t.map((o, s) => t.map((i, u) => +(s === u)));
  for (let o = 0; o < 100 * n * n; o++) {
    let s = 0, i = 1, u = 0;
    for (let c = 0; c < n; c++) for (let p = c + 1; p < n; p++) Math.abs(t[c][p]) > u && (u = Math.abs(t[c][p]), s = c, i = p);
    if (u < 1e-12) break;
    const v = 0.5 * Math.atan2(2 * t[s][i], t[i][i] - t[s][s]), y = Math.cos(v), m = Math.sin(v), l = t[s][s], h = t[i][i], f = t[s][i];
    for (let c = 0; c < n; c++) if (c !== s && c !== i) {
      const p = t[c][s], d = t[c][i];
      t[c][s] = t[s][c] = y * p - m * d, t[c][i] = t[i][c] = m * p + y * d;
    }
    t[s][s] = y * y * l - 2 * m * y * f + m * m * h, t[i][i] = m * m * l + 2 * m * y * f + y * y * h, t[s][i] = t[i][s] = 0;
    for (let c = 0; c < n; c++) {
      const p = r[c][s], d = r[c][i];
      r[c][s] = y * p - m * d, r[c][i] = m * p + y * d;
    }
  }
  return { values: t.map((o, s) => o[s]), vectors: r };
}
function Mr(e, t, n, r = 1) {
  const o = e.map((l, h) => e.slice(h).reduce((f, c) => f + c, 0)), s = e.map((l, h) => e.map((f, c) => o[Math.max(h, c)] * l * f)), i = e.map((l, h) => t * o[h] * l), u = i.map(Math.sqrt), v = xr(s.map((l, h) => l.map((f, c) => f / u[h] / u[c]))), y = v.values.indexOf(Math.max(...v.values)), m = e.map((l, h) => e.map((f, c) => u[h] * u[c] * v.values.reduce((p, d, w) => p + v.vectors[h][w] * v.vectors[c][w] * 2 * n * Math.sqrt(d) * (w === y ? 1 : r), 0)));
  return { lengths: e, mass: o, coefficient: s, stiffness: i, damping: m, frequencies: v.values.map((l) => 1 / Math.sqrt(l) / (2 * Math.PI)).sort((l, h) => l - h), angles: e.map(() => 0), velocities: e.map(() => 0) };
}
function Ft(e, t = e.angles, n = e.velocities) {
  let r = e.stiffness.reduce((o, s, i) => o + s * (1 - Math.cos(t[i])), 0);
  for (let o = 0; o < t.length; o++) for (let s = 0; s < t.length; s++) r += 0.5 * e.coefficient[o][s] * Math.cos(t[o] - t[s]) * n[o] * n[s];
  return r;
}
function Ar(e, t, n = 0, r = 1) {
  const o = e.angles, s = e.velocities, i = e.coefficient.map((m, l) => m.map((h, f) => h * Math.cos(o[l] - o[f]))), u = o.map((m, l) => Fn(i[l], s) + t * (-e.stiffness[l] * r * Math.sin(m) - n * e.mass[l] * e.lengths[l] * Math.cos(m) - e.coefficient[l].reduce((h, f, c) => h + f * Math.sin(m - o[c]) * s[c] * s[c], 0)));
  let v = wr(i.map((m, l) => m.map((h, f) => h + t * e.damping[l][f])), u), y = o.map((m, l) => m + t * v[l]);
  if (n === 0 && r === 1) {
    const m = Ft(e), l = Ft(e, y, v.map(() => 0)), h = Ft(e, y, v);
    if (h > m)
      if (l > m)
        y = [...o], v = s.map((f) => f * 0.999);
      else {
        const f = Math.sqrt(Math.max(0, (m - l) / Math.max(1e-30, h - l)));
        v = v.map((c) => c * f);
      }
  }
  e.angles = y, e.velocities = v;
}
const jn = Object.freeze({
  responseGain: 1,
  swing: 1,
  stiffness: 1,
  damping: 1,
  follow: 0.85,
  cohesion: 3,
  wind: 0.05,
  max: 20
}), Un = Object.freeze({ tierGain: 1, highModeDamping: 1 });
function Er(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) throw new TypeError("Expected cloth tuning");
  for (const [t, n] of Object.entries(e)) {
    if (!Object.hasOwn(jn, t) && !Object.hasOwn(Un, t)) throw new RangeError(`Unknown cloth tuning: ${t}`);
    if (typeof n != "number" || !Number.isFinite(n)) throw new RangeError(`${t}: expected a finite number`);
    if (["tierGain", "highModeDamping", "responseGain", "swing", "stiffness", "damping", "max"].includes(t) && n <= 0) throw new RangeError(`${t}: must be positive`);
    if (["follow", "wind"].includes(t) && (n < 0 || t === "follow" && n > 1)) throw new RangeError(`${t}: out of range`);
    if (t === "cohesion" && (!Number.isInteger(n) || n < 0 || n > 8)) throw new RangeError("cohesion: expected an integer from 0 to 8");
  }
}
function mn(e, t) {
  const n = [0];
  for (let o = 1; o < e.length; o++)
    n.push(n[o - 1] + Math.hypot(e[o][0] - e[o - 1][0], e[o][1] - e[o - 1][1]));
  const r = n.at(-1);
  return Array.from({ length: t }, (o, s) => {
    const i = r * s / (t - 1);
    let u = 1;
    for (; u < e.length - 1 && n[u] < i; ) u++;
    const v = (i - n[u - 1]) / Math.max(1e-9, n[u] - n[u - 1]);
    return [0, 1].map((y) => e[u - 1][y] + (e[u][y] - e[u - 1][y]) * v);
  });
}
function Sr(e, t) {
  const { baseWeights: n, deformBase: r } = e, o = { bounceHz: 2.6, zeta: 0.25 }, s = t.legs ? 0.8 / ((Math.hypot(...t.legs.left.ankle.map((h, f) => h - t.legs.left.hip[f])) + Math.hypot(...t.legs.right.ankle.map((h, f) => h - t.legs.right.hip[f]))) / 2) : 1.6 / t.image.height, i = 0.8, u = (t.cloth ?? []).map((h) => {
    const f = kn(h), c = f.custom ? f.cols : h.columns ?? 8, p = f.custom ? f.rows : h.rows ?? 5, d = mn(h.waist, c), w = mn(h.hem, c), a = new Float64Array(p * c * 2);
    for (let x = 0; x < p; x++) for (let b = 0; b < c; b++) {
      const E = x / (p - 1), _ = (x * c + b) * 2;
      a[_] = d[b][0] + (w[b][0] - d[b][0]) * E, a[_ + 1] = d[b][1] + (w[b][1] - d[b][1]) * E;
    }
    f.custom && a.set(f.rest);
    const g = Array.from({ length: c }, (x, b) => {
      const E = b * 2, _ = ((p - 1) * c + b) * 2;
      return !f.custom && Math.hypot(a[_] - a[E], a[_ + 1] - a[E + 1]) <= 1;
    });
    return {
      grid: f,
      pinned: g,
      pendulums: (
        /** @type {ReturnType<typeof pendulumSystem>[]} */
        []
      ),
      systemKey: null,
      c: h,
      gravity: 9.80665 / (h.scale === void 0 ? s : h.scale / 1e3),
      tuning: Object.fromEntries(Object.entries({ ...jn, ...Un }).map(([x, b]) => [x, h[x] ?? b])),
      cols: c,
      rows: p,
      rest: a,
      top: f.custom ? f.top : d,
      weights: (f.custom ? f.top : d).map(([x, b]) => n(x, b, 0)),
      target: new Float64Array(a.length),
      previous: null,
      pivotVelocity: new Float64Array(c * 2),
      angle: new Float64Array(c),
      angularVelocity: new Float64Array(c),
      lowerAngle: new Float64Array(c),
      lowerAngularVelocity: new Float64Array(c),
      bounce: new Float64Array(c),
      bounceVelocity: new Float64Array(c),
      out: Float64Array.from(a),
      physicalOut: Float64Array.from(a),
      parent: null,
      parentLoc: null,
      meshes: []
    };
  }), v = Object.fromEntries(u.map((h) => [h.c.name, h]));
  function y(h, f, c) {
    const p = h.grid.custom || h.pinned.some(Boolean);
    let d = null;
    for (let w = 0; w < h.rows - 1; w++) for (let a = 0; a < h.cols - 1; a++) {
      const g = [(w * h.cols + a) * 2, (w * h.cols + a + 1) * 2, ((w + 1) * h.cols + a + 1) * 2, ((w + 1) * h.cols + a) * 2], [x, b, E, _, X, $, Y, D] = g.flatMap((I) => [h.rest[I], h.rest[I + 1]]);
      let T = 0.5, H = 0.5;
      for (let I = 0; I < 10; I++) {
        const F = x * (1 - T) * (1 - H) + E * T * (1 - H) + X * T * H + Y * (1 - T) * H - f, N = b * (1 - T) * (1 - H) + _ * T * (1 - H) + $ * T * H + D * (1 - T) * H - c, C = (E - x) * (1 - H) + (X - Y) * H, V = (_ - b) * (1 - H) + ($ - D) * H, oe = (Y - x) * (1 - T) + (X - E) * T, K = (D - b) * (1 - T) + ($ - _) * T, U = C * K - V * oe;
        if (Math.abs(U) < 1e-9) break;
        T -= (F * K - N * oe) / U, H -= (C * N - V * F) / U;
      }
      let j = Math.max(0, -T, T - 1) + Math.max(0, -H, H - 1);
      if (p) {
        const I = Math.max(0, Math.min(1, T)), F = Math.max(0, Math.min(1, H)), N = x * (1 - I) * (1 - F) + E * I * (1 - F) + X * I * F + Y * (1 - I) * F, C = b * (1 - I) * (1 - F) + _ * I * (1 - F) + $ * I * F + D * (1 - I) * F;
        j = Math.hypot(N - f, C - c);
      }
      (!d || j < d.miss) && (d = { q: g, s: T, t: H, miss: j });
    }
    if (d.s = Math.min(p ? 1 : 4, Math.max(p ? 0 : -3, d.s)), d.t = Math.min(p ? 1 : 4, Math.max(p ? 0 : -3, d.t)), p) {
      const w = [0, 0];
      m(h.rest, d, w), d.offset = [f - w[0], c - w[1]];
    }
    return d;
  }
  function m(h, f, c) {
    const { q: p, s: d, t: w } = f, a = [(1 - d) * (1 - w), d * (1 - w), d * w, (1 - d) * w];
    c[0] = f.offset?.[0] ?? 0, c[1] = f.offset?.[1] ?? 0;
    for (let g = 0; g < 4; g++)
      c[0] += h[p[g]] * a[g], c[1] += h[p[g] + 1] * a[g];
    return c;
  }
  for (const h of u) h.c.parent && (h.parent = v[h.c.parent], h.parentLoc = h.top.map(([f, c]) => y(h.parent, f, c)));
  class l {
    constructor() {
      this.gain = 1, this.time = 0;
    }
    setTuning(f, c) {
      if (Er(c), f !== null && !Object.hasOwn(v, f)) throw new RangeError(`Unknown cloth: ${f}`);
      for (const p of u) (f === null || p.c.name === f) && Object.assign(p.tuning, c);
    }
    /** Skin a layer mesh (rest/pos arrays in source px) to the named garment. */
    attach(f, c) {
      const p = v[f], d = [];
      for (let w = 0; w < c.rest.length; w += 2) d.push(y(p, c.rest[w], c.rest[w + 1]));
      p.meshes.push({ mesh: c, locs: d });
    }
    step(f, c, p) {
      if (c < 0) return;
      const d = Math.min(c, 0.05), w = Math.max(1, Math.ceil(d * 240)), a = d / w, g = [0, 0];
      for (const x of u) {
        const { cols: b, rows: E, rest: _, target: X, out: $, angle: Y, angularVelocity: D, lowerAngle: T, lowerAngularVelocity: H, bounce: j, bounceVelocity: I } = x, { stiffness: F, damping: N, max: C, swing: V, follow: oe, cohesion: K, wind: U, responseGain: Q, tierGain: q, highModeDamping: Z } = x.tuning, se = this.gain * (Q ?? 1), ne = new Float64Array(b * 2), ae = new Float64Array(b * 2), P = new Float64Array(b * 2);
        for (let O = 0; O < b; O++) {
          x.parent ? m(x.parent.physicalOut, x.parentLoc[O], g) : r(x.top[O][0], x.top[O][1], x.weights[O], f, p, g), ne[O * 2] = g[0], ne[O * 2 + 1] = g[1], x.parent && m(x.parent.out, x.parentLoc[O], g), ae[O * 2] = g[0], ae[O * 2 + 1] = g[1];
          for (let B = 0; B < 2; B++) {
            const z = O * 2 + B, L = x.previous && d > 0 ? (ne[z] - x.previous[z]) / d : 0;
            P[z] = d > 0 ? (L - x.pivotVelocity[z]) / d : 0, x.pivotVelocity[z] = L;
          }
          for (let B = 0; B < E; B++) {
            const z = (B * b + O) * 2;
            X[z] = _[z] + g[0] - x.top[O][0], X[z + 1] = _[z + 1] + g[1] - x.top[O][1];
          }
        }
        x.previous = ne;
        const M = V * Math.sqrt(F), S = 2 * Math.PI * o.bounceHz;
        if (x.grid.custom) {
          const O = `${M}:${N}:${Z}`;
          if (x.systemKey !== O) {
            const W = x.pendulums;
            x.pendulums = x.grid.lengths.map((re, te) => {
              const A = x.grid.joints[te], k = Mr(A.slice(1).map((G, ie) => (G - A[ie]) * re * i), x.gravity * M ** 2, o.zeta * N, Z);
              return W[te] && (k.angles = W[te].angles, k.velocities = W[te].velocities), k;
            }), x.systemKey = O;
          }
          const B = Math.max(...x.pendulums.flatMap((W) => W.frequencies)), z = Math.max(w, Math.ceil(d * B * 32)), L = d / z;
          for (let W = 0; W < z; W++) {
            const re = this.time + (W + 1) * L, te = (Math.sin(re * 1.1) * 0.6 + Math.sin(re * 2.3) * 0.4) * C * U;
            for (let A = 0; A < b; A++) {
              const k = P[A * 2 + 1], G = Math.max(x.gravity * 0.1, x.gravity - k), ie = Math.max(-8 * x.gravity, Math.min(8 * x.gravity, P[A * 2])) - G * te / x.grid.lengths[A];
              Ar(x.pendulums[A], L, ie, G / x.gravity), I[A] += (-(S ** 2) * j[A] - 2 * S * I[A] - k * 0.15) * L, j[A] += I[A] * L;
            }
          }
          for (let W = 0; d > 0 && W < K; W++) for (const re of ["angles", "velocities"]) {
            const te = x.pendulums.map((A) => [...A[re]]);
            x.pendulums.forEach((A, k) => {
              A[re] = te[k].map((G, ie) => 0.5 * G + 0.25 * (te[Math.max(0, k - 1)][ie] + te[Math.min(b - 1, k + 1)][ie]));
            });
          }
          const J = (W, re, te, A = 1) => {
            for (let k = 0; k < b; k++) {
              const G = x.grid.joints[k], ie = x.grid.seams[k], le = x.grid.lengths[k], ge = C * 0.1 * Math.tanh(j[k] * te / (C * 0.1)), Me = 2 * Math.asin(Math.min(0.95, (C - Math.abs(ge)) / (2 * le))), Ee = x.pendulums[k].angles[0], ve = x.pendulums[k].angles.map((fe) => {
                const ee = A === 1 ? fe : Ee + (fe - Ee) * A;
                return Me * Math.tanh(ee * te / Me);
              }), pe = [Array.from(re.slice(k * 2, k * 2 + 2))];
              for (let fe = 0; fe < ve.length; fe++) {
                const ee = Je(ie, G[fe]), ce = Je(ie, G[fe + 1]), _e = ce[0] - ee[0], Oe = ce[1] - ee[1], Te = ve[fe];
                pe.push([pe[fe][0] + _e * Math.cos(Te) + Oe * Math.sin(Te), pe[fe][1] - _e * Math.sin(Te) + Oe * Math.cos(Te)]);
              }
              for (let fe = 0; fe < E; fe++) {
                const ee = x.grid.fractions[k][fe];
                let ce = 0;
                for (; ce < ve.length - 1 && ee > G[ce + 1] + 1e-9; ) ce++;
                const _e = Je(ie, G[ce]), Oe = Je(ie, ee), Te = (ee - G[ce]) / (G[ce + 1] - G[ce]), be = ve[ce] * (1 - 0.1 * (1 - oe) * (1 - Te)), Ue = Oe[0] - _e[0], Ze = Oe[1] - _e[1], ot = (fe * b + k) * 2;
                W[ot] = pe[ce][0] + Ue * Math.cos(be) + Ze * Math.sin(be), W[ot + 1] = pe[ce][1] - Ue * Math.sin(be) + Ze * Math.cos(be) + ge * ee;
              }
            }
          };
          J(x.physicalOut, ne, 1), J($, ae, se, q);
          continue;
        }
        for (let O = 0; O < w; O++) {
          const B = this.time + (O + 1) * a, z = (Math.sin(B * 1.1) * 0.6 + Math.sin(B * 2.3) * 0.4) * C * U;
          for (let L = 0; L < b; L++) {
            if (x.pinned[L]) continue;
            const J = L * 2, W = ((E - 1) * b + L) * 2, re = Math.max(1, Math.hypot(_[W] - _[J], _[W + 1] - _[J + 1])), te = Math.max(x.gravity * 0.1, x.gravity - P[J + 1]), A = i * re / 2, k = te / A * M * M, G = Math.sqrt(k), ie = o.zeta * N, le = G * Math.sqrt(2 - Math.SQRT2), ge = G * Math.sqrt(2 + Math.SQRT2), Me = 2 * ie * le * ge / (le + ge), Ee = 2 * ie / (le + ge), ve = Y[L] - T[L], pe = Math.cos(ve), fe = Math.sin(ve), ee = D[L], ce = H[L], Oe = (Math.max(-8 * x.gravity, Math.min(8 * x.gravity, P[J])) - te * z / re) / A, Te = Me * (2 * ee + pe * ce) + Ee * 2 * k * ee, be = Me * (pe * ee + ce) + Ee * k * ce, Ue = -2 * k * Math.sin(Y[L]) - fe * ce * ce - 2 * Oe * Math.cos(Y[L]) - Te, Ze = -k * Math.sin(T[L]) + fe * ee * ee - Oe * Math.cos(T[L]) - be, ot = 2 - pe * pe;
            D[L] += (Ue - pe * Ze) / ot * a, H[L] += (2 * Ze - pe * Ue) / ot * a, Y[L] += D[L] * a, T[L] += H[L] * a, I[L] += (-S * S * j[L] - 2 * S * I[L] - P[J + 1] * 0.15) * a, j[L] += I[L] * a;
          }
        }
        for (let O = 0; d > 0 && O < K; O++) for (const B of [Y, D, T, H]) {
          const z = B.slice();
          for (let L = 0; L < b; L++) B[L] = x.pinned[L] ? 0 : z[L] * 0.5 + (z[Math.max(0, L - 1)] + z[Math.min(b - 1, L + 1)]) * 0.25;
        }
        const R = (O, B, z) => {
          for (let L = 0; L < b; L++) {
            const J = L * 2, W = ((E - 1) * b + L) * 2;
            if (x.pinned[L]) {
              for (let ve = 0; ve < E; ve++) {
                const pe = (ve * b + L) * 2;
                O[pe] = _[pe] + B[J] - _[J], O[pe + 1] = _[pe + 1] + B[J + 1] - _[J + 1];
              }
              continue;
            }
            const re = Math.max(1, Math.hypot(_[W] - _[J], _[W + 1] - _[J + 1])), te = C * 0.1 * Math.tanh(j[L] * z / (C * 0.1)), A = 2 * Math.asin(Math.min(0.95, (C - Math.abs(te)) / (2 * re))), k = A * Math.tanh(Y[L] * z / A), G = A * Math.tanh(T[L] * z / A), ie = 0.1 * (1 - oe), le = (_[W] - _[J]) / 2, ge = (_[W + 1] - _[J + 1]) / 2, Me = B[J] + le * Math.cos(k) + ge * Math.sin(k), Ee = B[J + 1] - le * Math.sin(k) + ge * Math.cos(k);
            for (let ve = 0; ve < E; ve++) {
              const pe = ve / (E - 1), fe = (ve * b + L) * 2, ee = pe <= 0.5, ce = ee ? pe * 2 : (pe - 0.5) * 2, _e = (ee ? k : G) * (1 - ie + ie * ce), Oe = Math.cos(_e), Te = Math.sin(_e), be = le * ce, Ue = ge * ce;
              O[fe] = (ee ? B[J] : Me) + be * Oe + Ue * Te, O[fe + 1] = (ee ? B[J + 1] : Ee) - be * Te + Ue * Oe + te * pe;
            }
          }
        };
        R(x.physicalOut, ne, 1), R($, ae, se);
      }
      this.time += d;
    }
    deform() {
      const f = [0, 0];
      for (const c of u) for (const { mesh: p, locs: d } of c.meshes)
        for (let w = 0; w < d.length; w++)
          m(c.out, d[w], f), p.pos[w * 2] = f[0], p.pos[w * 2 + 1] = f[1];
    }
    /** Grid nodes per garment, for debug overlays. */
    get grids() {
      return u.map((f) => ({ name: f.c.name, cols: f.cols, rows: f.rows, nodes: f.out }));
    }
  }
  return { Cloth: l, garments: u };
}
function Or(e, t) {
  const { baseWeights: n, deformBase: r, MOUTH: o } = e, s = (b, E, _) => {
    const X = Math.min(1, Math.max(0, (_ - b) / (E - b)));
    return X * X * (3 - 2 * X);
  }, i = t.mouth.area, u = {
    a: { sprite: "mouth_a", ref: 0.9, width: 1 },
    aHalf: { sprite: "mouth_a_half", ref: 0.55, width: 1 },
    i: { sprite: "mouth_i", ref: 0.55, width: 1 },
    e: { sprite: "mouth_a_half", ref: 0.65, width: 1.06 },
    o: { sprite: "mouth_o", ref: 0.75, width: 1 },
    u: { sprite: "mouth_o", ref: 0.75, width: 0.78 }
  }, v = 0.16, y = ["angry", "sad"];
  function m(b, E) {
    const X = (D, T, H) => D >= T - (E ? 0.07 : 0) && D < H + (E ? 0.07 : 0), $ = [["i", -9, -0.55], ["e", -0.55, -0.2], ["a", -0.2, 0.35], ["o", 0.35, 0.75], ["u", 0.75, 9]], Y = E && $.find((D) => D[0] === E || E === "aHalf" && D[0] === "a");
    return Y && X(b, Y[1], Y[2]) ? Y[0] : $.find((D) => b >= D[1] && b < D[2])[0];
  }
  const l = 0.75, h = 0.3, f = 0.06, c = ["sad", "surprise"];
  function p(b, E, _ = null) {
    return _ && b >= h ? _ : b >= l ? null : b < h ? E >= 0.5 ? "eyes_smile" : "eyes_closed" : "eyes_half";
  }
  function d(b, E, _ = null) {
    if (b < v) return null;
    const X = m(E, _);
    return X === "a" ? b >= 0.6 ? "a" : "aHalf" : X;
  }
  function w(b) {
    return o.cy + (b - o.cx) * Math.tan(o.angle);
  }
  function a() {
    return i.cx;
  }
  function g(b, E) {
    const _ = Math.cos(-i.angle), X = Math.sin(-i.angle), $ = b - i.cx, Y = E - i.cy, D = ($ * _ - Y * X) / i.rx, T = ($ * X + Y * _) / i.ry;
    return 1 - s(0.55, 0.95, Math.hypot(D, T));
  }
  function x(b, E, _, X, $) {
    const Y = {}, D = (U) => U.startsWith("eyes_closed") || U.startsWith("eyes_smile"), T = (U) => y.some((Q) => U === `mouth_${Q}`), H = (U) => D(U) ? 1 : U.startsWith("eyes_") ? 0 : T(U) ? 2 : 3, j = Object.entries(E.layers).sort((U, Q) => H(U[0]) - H(Q[0]));
    for (const [U, Q] of j) {
      const q = X(Q, t.mesh.spriteCell, $(_[U]), _[U].width), Z = [], se = [];
      for (let P = 0; P < q.rest.length / 2; P++) {
        const M = q.rest[P * 2], S = q.rest[P * 2 + 1];
        Z.push(n(M, S, 0)), se.push(U.startsWith("mouth") ? g(M, S) : 0);
      }
      const ne = U === "eyes_half_0" ? 0 : U === "eyes_half_1" ? 1 : void 0, ae = b.addLayer(U, _[U], q, { color: [0.4, 1, 0.8, 0.6], halfEye: ne });
      ae.visible = !1, Y[U] = { mesh: q, W: Z, inner: se, layer: ae };
    }
    const I = [0, 1].map((U) => !!(Y[`eyes_closed_${U}`] && Y[`eyes_half_${U}`])), F = Object.values(u).some((U) => Y[U.sprite]), N = (U, Q) => (U === "eyes_smile" && !Y[`eyes_smile_${Q}`] && (U = "eyes_closed"), U === "open" || Y[`${U}_${Q}`] ? U : "open"), C = [0, 0];
    let V = null;
    const oe = [0, 1].map(() => ({ cur: "open", prev: "open", t: 1 }));
    function K(U, Q, q, Z, se = 1) {
      const ne = U.mesh.rest, ae = U.mesh.pos;
      for (let P = 0; P < U.W.length; P++) {
        let M = ne[P * 2], S = ne[P * 2 + 1];
        const R = U.inner[P];
        if (R > 0) {
          const O = w(M);
          S = O + (S - O) * (1 + (Z - 1) * R), M = a() + (M - a()) * (1 + (se - 1) * R);
        }
        r(M, S, U.W[P], Q, q, C), ae[P * 2] = C[0], ae[P * 2 + 1] = C[1];
      }
    }
    return {
      /**
       * Show / hide and deform the sprites for this frame.
       * Returns which eyes are covered by a sprite, so the layered eye parts can be hidden, and
       * whether a drawing shows the mouth, so the shader mouth can be left out.
       * `mood` (angry / sad / surprise) picks drawn expression eyes (sad, surprise) and closed
       * mouths (angry, sad) when the avatar has them.
       */
      update(U, Q, q = 1 / 60, Z = null) {
        for (const R of Object.values(Y)) R.layer.visible = !1;
        const se = [!1, !1];
        [
          [U.eyeROpen, U.eyeSmile],
          [U.eyeLOpen, U.eyeSmileL ?? U.eyeSmile]
        ].forEach(([R, O], B) => {
          const z = oe[B], L = c.includes(Z) && Y[`eyes_${Z}_${B}`] ? `eyes_${Z}` : null, J = N(p(R, O, L) ?? "open", B);
          J !== z.cur && (z.prev = z.cur, z.cur = J, z.t = 0), z.t = q > 0 ? Math.min(1, z.t + q / f) : 1;
          const W = s(0, 1, z.t), re = (A, k) => {
            if (A === "open" || k <= 1e-3) return;
            const G = Y[`${A}_${B}`];
            G && (G.layer.visible = !0, G.layer.alpha = k, K(G, U, Q, 1));
          }, te = (A) => A === "open" ? -1 : D(A) ? 1 : 0;
          z.t >= 1 ? re(z.cur, 1) : te(z.cur) > te(z.prev) ? (re(z.prev, 1), re(z.cur, W)) : (re(z.cur, 1), re(z.prev, 1 - W)), se[B] = z.cur !== "open" && W >= 0.999;
        });
        const ae = d(U.mouthOpen, U.mouthForm, V);
        V = ae;
        const P = ae && u[ae], M = P && Y[P.sprite], S = y.includes(Z) && Y[`mouth_${Z}`];
        if (S && (!M || U.mouthOpen < v + 0.04) && (S.layer.visible = !0, S.layer.alpha = 1, K(S, U, Q, 1)), M) {
          M.layer.visible = !0, M.layer.alpha = s(v, v + 0.04, U.mouthOpen);
          const R = Math.min(1.1, Math.max(0.5, U.mouthOpen / P.ref));
          K(M, U, Q, R, P.width);
        }
        return { eyes: se, mouth: ae, mouthDrawn: F && (!P || !!M) };
      },
      /** Whether each eye has the closed and half-closed drawings, so the layered eye stays open. */
      eyesDrawn: I
    };
  }
  return { createSprites: x, mouthShape: d, eyeSprite: p };
}
const pn = { angry: "angry", angryTalk: "angry", sad: "sad", sadTalk: "sad", surprise: "surprise", surprisedTalk: "surprise" };
function Tr(e, t) {
  return e && e !== "neutral" ? pn[e] ?? null : (t && pn[t]) ?? null;
}
function Rr(e, t, n, r = 6) {
  let o = t, s = n, i = -1, u = -1;
  for (let m = 0; m < n; m++) {
    const l = m * t;
    for (let h = 0; h < t; h++)
      e[l + h] > 3 && (h < o && (o = h), h > i && (i = h), m < s && (s = m), m > u && (u = m));
  }
  if (i < 0) return null;
  const v = Math.max(0, o - r), y = Math.max(0, s - r);
  return [v, y, Math.min(t, i + 1 + r) - v, Math.min(n, u + 1 + r) - y];
}
function kr(e, t, n, r, o, s, i = 16, u, v, y) {
  const m = /* @__PURE__ */ new Map();
  for (const l of t.overlays) {
    const h = n[l.name];
    if (u !== void 0 && h.width !== u || v !== void 0 && h.height !== v)
      throw new Error(`overlay ${l.name}: image size does not match base.png`);
    const f = o(h), c = Rr(f, h.width, h.height);
    if (!c) continue;
    const [p, d, w, a] = c, g = new Uint8Array(w * a);
    for (let _ = 0; _ < a; _++) g.set(f.subarray((d + _) * h.width + p, (d + _) * h.width + p + w), _ * w);
    const x = r(c, i, g, w), b = [];
    for (let _ = 0; _ < x.rest.length; _ += 2) {
      const X = s(x.rest[_], x.rest[_ + 1], 0);
      b.push({ ...X, brow: 0, jaw: 0 });
    }
    const E = e.addLayer(`overlay_${l.name}`, y(h, c), x);
    E.visible = !1, m.set(l.name, { mesh: x, weights: b, layer: E });
  }
  return {
    /** Shows the named overlays and hides the rest. Unknown names are ignored. */
    set(l) {
      const h = new Set(l);
      for (const [f, c] of m) c.layer.visible = h.has(f);
    },
    update(l, h, f, c) {
      for (const { mesh: p, weights: d, layer: w } of m.values())
        if (w.visible)
          for (let a = 0; a < d.length; a++)
            f(p.rest[a * 2], p.rest[a * 2 + 1], d[a], l, h, c), p.pos[a * 2] = c[0], p.pos[a * 2 + 1] = c[1];
    }
  };
}
function tn(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) throw new TypeError("lipSync: expected an object");
  const t = e, n = {};
  for (const r of ["granularity", "openness", "closeSpeed"]) {
    const o = t[r];
    if (o !== void 0) {
      if (typeof o != "number" || !Number.isFinite(o) || o < 0 || o > 1)
        throw new RangeError(`lipSync.${r}: expected 0–1`);
      n[r] = o;
    }
  }
  if (t.preset !== void 0) {
    if (!["calm", "default", "lively", "subtle", "big", "custom"].includes(t.preset))
      throw new RangeError("lipSync.preset: expected calm, default, lively, subtle, big or custom");
    n.preset = t.preset;
  }
  return n;
}
function dn(e = {}, t = {
  granularity: 0.5,
  openness: 0.5,
  closeSpeed: 0.5
}) {
  const n = tn(e);
  return {
    granularity: n.granularity ?? t.granularity,
    openness: n.openness ?? t.openness,
    closeSpeed: n.closeSpeed ?? t.closeSpeed
  };
}
const Pe = (e, t, n, r) => e === 0.5 ? n : e < 0.5 ? t + (n - t) * e * 2 : n + (r - n) * (e - 0.5) * 2;
function gn(e) {
  return {
    arm: Pe(e.granularity, 0.2, 0.6, 0.9),
    trigger: Pe(e.granularity, 0.65, 0.8, 0.95),
    relax: Pe(e.granularity, 1.5, 5, 12),
    range: Pe(e.granularity, 0.7, 0.3, 0.05),
    risePower: Pe(e.granularity, 0.05, 0.3, 0.8),
    openness: Pe(e.openness, 0.55, 1, 1.25),
    audioRelease: Pe(e.closeSpeed, 6, 32, 45),
    kanaRelease: Pe(e.closeSpeed, 6, 22, 45)
  };
}
const Lr = /* @__PURE__ */ new Set([
  "angleX",
  "angleY",
  "angleZ",
  "bodyAngleX",
  "bodyAngleZ",
  "armAngle",
  "handAngle",
  "gazeX",
  "gazeY"
]), nn = {
  nod: {
    label: "Nod",
    dur: 1.7,
    tracks: {
      angleY: [[0, 0], [0.32, -13], [0.62, 2], [0.95, -9], [1.3, 1], [1.7, 0]],
      angleZ: [[0, 0], [0.4, -2], [1, -1], [1.7, 0]],
      bodyAngleX: [[0, 0], [0.5, -1.5], [1.7, 0]],
      eyeSmile: [[0, 0], [0.3, 0.45], [1.3, 0.45], [1.7, 0]],
      eyeOpen: [[0, 1], [0.3, 0.72], [1.3, 0.72], [1.7, 1]],
      mouthOpen: [[0, 0], [0.3, 0.12], [1.3, 0.12], [1.7, 0]],
      mouthForm: [[0, 0], [0.3, -0.6], [1.7, -0.3]]
    }
  },
  tilt: {
    label: "Head tilt",
    dur: 2.6,
    tracks: {
      angleZ: [[0, 0], [0.55, 17], [2, 15], [2.6, 0]],
      angleX: [[0, 0], [0.6, 8], [2, 7], [2.6, 0]],
      angleY: [[0, 0], [0.6, 4], [2.6, 0]],
      bodyAngleZ: [[0, 0], [0.8, 3], [2, 3], [2.6, 0]],
      gazeX: [[0, 0], [0.4, 0.5], [2.1, 0.4], [2.6, 0]],
      gazeY: [[0, 0], [0.4, 0.35], [2.1, 0.3], [2.6, 0]],
      browAngle: [[0, 0], [0.5, -0.7], [2.1, -0.6], [2.6, 0]],
      browY: [[0, 0], [0.5, 0.35], [2.1, 0.3], [2.6, 0]]
      // closed mouth: a barely open round mouth read as a squashed blob
    }
  },
  think: {
    label: "Thinking",
    dur: 3.6,
    tracks: {
      angleX: [[0, 0], [0.7, -11], [3, -9], [3.6, 0]],
      angleY: [[0, 0], [0.7, 9], [3, 8], [3.6, 0]],
      angleZ: [[0, 0], [0.8, 6], [3, 5], [3.6, 0]],
      gazeX: [[0, 0], [0.35, -0.8], [3.1, -0.7], [3.6, 0]],
      gazeY: [[0, 0], [0.35, 0.7], [3.1, 0.6], [3.6, 0]],
      handAngle: [[0, 0], [0.6, 3], [3, 3], [3.6, 0]],
      fingerTap: [
        [0, 0],
        [0.9, 0],
        [1.05, 1],
        [1.2, 0],
        [1.4, 1],
        [1.55, 0],
        [1.75, 1],
        [1.9, 0],
        [2.3, 0],
        [2.45, 1],
        [2.6, 0],
        [3.6, 0]
      ],
      browY: [[0, 0], [0.6, 0.25], [3, 0.2], [3.6, 0]],
      browAngle: [[0, 0], [0.6, -0.3], [3, -0.3], [3.6, 0]],
      mouthForm: [[0, 0], [0.6, 0.4], [3.6, 0]]
    }
  },
  giggle: {
    label: "Chuckle",
    dur: 2.2,
    tracks: {
      eyeOpen: [[0, 1], [0.2, 0], [1.8, 0], [2.2, 1]],
      eyeSmile: [[0, 0], [0.2, 1], [1.8, 1], [2.2, 0]],
      mouthOpen: [[0, 0], [0.2, 0.5], [0.45, 0.32], [0.7, 0.55], [0.95, 0.34], [1.2, 0.5], [1.8, 0.3], [2.1, 0]],
      mouthForm: [[0, 0], [0.2, -0.8], [2.2, -0.2]],
      blush: [[0, 0], [0.3, 0.7], [1.8, 0.7], [2.2, 0.1]],
      angleY: [[0, 0], [0.2, -5], [0.45, -1], [0.7, -6], [0.95, -2], [1.2, -5], [1.6, -2], [2.2, 0]],
      angleZ: [[0, 0], [0.3, -6], [1.8, -5], [2.2, 0]],
      bodyAngleZ: [[0, 0], [0.25, 2], [0.5, -1], [0.75, 2], [1, -1], [1.3, 1.5], [2.2, 0]],
      browY: [[0, 0], [0.3, 0.3], [1.8, 0.3], [2.2, 0]]
    }
  },
  surprise: {
    label: "Surprise",
    dur: 2,
    tracks: {
      angleY: [[0, 0], [0.12, 10], [0.5, 6], [1.5, 5], [2, 0]],
      angleX: [[0, 0], [0.12, -4], [2, 0]],
      bodyAngleX: [[0, 0], [0.15, -4], [1.5, -3], [2, 0]],
      eyeOpen: [[0, 1], [0.1, 1.25], [1.5, 1.2], [2, 1]],
      browY: [[0, 0], [0.1, 1], [1.5, 0.9], [2, 0]],
      mouthOpen: [[0, 0], [0.12, 0.6], [1.4, 0.45], [2, 0]],
      mouthForm: [[0, 0], [0.12, 0.6], [1.5, 0.55], [2, 0]],
      // o
      armAngle: [[0, 0], [0.15, -4], [1.5, -3], [2, 0]]
    }
  },
  shy: {
    label: "Shy",
    dur: 3.2,
    tracks: {
      angleX: [[0, 0], [0.6, 14], [2.6, 12], [3.2, 0]],
      angleY: [[0, 0], [0.6, -9], [2.6, -8], [3.2, 0]],
      angleZ: [[0, 0], [0.7, -8], [2.6, -7], [3.2, 0]],
      gazeX: [[0, 0], [0.3, 0.8], [1.6, 0.8], [1.9, -0.3], [2.2, 0.8], [2.8, 0.6], [3.2, 0]],
      gazeY: [[0, 0], [0.3, -0.5], [2.8, -0.4], [3.2, 0]],
      eyeOpen: [[0, 1], [0.5, 0.75], [2.7, 0.75], [3.2, 1]],
      eyeSmile: [[0, 0], [0.5, 0.5], [2.7, 0.5], [3.2, 0]],
      blush: [[0, 0], [0.8, 1], [2.7, 1], [3.2, 0]],
      browAngle: [[0, 0], [0.5, -0.6], [2.7, -0.5], [3.2, 0]],
      mouthForm: [[0, 0], [0.5, -0.4], [3.2, 0]],
      handAngle: [[0, 0], [0.8, 4], [2.6, 4], [3.2, 0]]
    }
  },
  no: {
    label: "Shake head",
    dur: 1.9,
    tracks: {
      angleX: [[0, 0], [0.2, 13], [0.45, -13], [0.7, 12], [0.95, -10], [1.2, 5], [1.5, 0]],
      angleY: [[0, 0], [0.2, -3], [1.3, -3], [1.9, 0]],
      bodyAngleX: [[0, 0], [0.3, 1.5], [0.6, -1.5], [0.9, 1], [1.3, 0]],
      eyeOpen: [[0, 1], [0.15, 0], [1.4, 0], [1.9, 1]],
      eyeSmile: [[0, 0], [0.15, 1], [1.4, 1], [1.9, 0]],
      // closed mouth while shaking the head
      browAngle: [[0, 0], [0.2, -0.5], [1.4, -0.5], [1.9, 0]]
    }
  },
  wink: {
    label: "Wink",
    dur: 2,
    tracks: {
      angleZ: [[0, 0], [0.35, -13], [1.5, -12], [2, 0]],
      angleX: [[0, 0], [0.35, 9], [1.5, 8], [2, 0]],
      bodyAngleZ: [[0, 0], [0.5, -2], [1.5, -2], [2, 0]],
      eyeOpenL: [[0, 1], [0.25, 1], [0.4, 0], [1.4, 0], [1.6, 1]],
      eyeSmileL: [[0, 0], [0.3, 1], [1.5, 1], [1.7, 0]],
      mouthOpen: [[0, 0], [2, 0]],
      // wink with a closed smile
      mouthForm: [[0, 0], [0.35, -0.8], [2, 0]],
      blush: [[0, 0], [0.4, 0.5], [1.6, 0.5], [2, 0]]
    }
  },
  greet: {
    label: "Greeting",
    dur: 2.6,
    tracks: {
      angleY: [[0, 0], [0.7, -18], [1.2, -17], [1.9, 2], [2.6, 0]],
      bodyAngleX: [[0, 0], [0.8, 2], [1.8, 0]],
      bodyAngleZ: [[0, 0], [0.8, 1.5], [2, 0]],
      armAngle: [[0, 0], [0.8, 3], [2, 0]],
      eyeOpen: [[0, 1], [0.5, 0], [1.4, 0], [1.8, 1]],
      eyeSmile: [[0, 0], [0.5, 1], [1.6, 1], [2.3, 0.4], [2.6, 0]],
      mouthOpen: [[0, 0], [1.6, 0], [1.8, 0.3], [2.3, 0.2], [2.6, 0]],
      mouthForm: [[0, 0], [1.6, -0.8], [2.6, -0.3]],
      blush: [[0, 0], [1.6, 0.3], [2.6, 0]]
    }
  }
}, rn = {
  lookAround: {
    label: "Look around",
    dur: 5.2,
    idle: !0,
    tracks: {
      gazeX: [[0, 0], [0.25, -0.85], [1.5, -0.8], [1.8, 0.1], [2.1, 0.85], [3.4, 0.8], [3.7, 0], [5.2, 0]],
      gazeY: [[0, 0], [0.25, 0.15], [1.8, 0.25], [2.1, 0.1], [3.7, 0], [5.2, 0]],
      angleX: [[0, 0], [0.7, -20], [1.6, -18], [2.5, 19], [3.5, 17], [4.4, 0], [5.2, 0]],
      angleY: [[0, 0], [0.7, 3], [1.8, 5], [2.5, 3], [4.4, 0]],
      angleZ: [[0, 0], [0.8, 4], [1.8, 0], [2.6, -4], [4.4, 0]],
      bodyAngleX: [[0, 0], [1, -4], [2.8, 4], [4.6, 0]],
      bodyAngleZ: [[0, 0], [1, 1.5], [2.8, -1.5], [4.6, 0]],
      handAngle: [[0, 0], [1, -2], [2.8, 2], [4.6, 0]],
      browY: [[0, 0], [0.5, 0.35], [3.6, 0.3], [4.4, 0]],
      // curious: a quick inhale, held while looking, let out at the end
      breath: [[0, 0.2], [0.6, 0.85], [3.6, 0.7], [4.6, 0], [5.2, 0.1]]
    }
  },
  glance: {
    label: "Side glance",
    dur: 4.6,
    idle: !0,
    tracks: {
      gazeX: [[0, 0], [0.18, 0.9], [2.6, 0.85], [2.9, 0.15], [3.2, 0], [4.6, 0]],
      gazeY: [[0, 0], [0.18, 0.4], [2.6, 0.35], [3.2, 0]],
      angleX: [[0, 0], [0.6, 13], [2.6, 11], [3.6, 0]],
      angleY: [[0, 0], [0.6, 6], [2.6, 5], [3.6, 0]],
      angleZ: [[0, 0], [0.7, -5], [2.6, -4], [3.6, 0]],
      bodyAngleX: [[0, 0], [1, 2.5], [2.8, 2], [4, 0]],
      eyeOpen: [[0, 1], [0.3, 1.06], [2.5, 1.05], [2.8, 0.85], [3.4, 1]],
      browY: [[0, 0], [0.4, 0.4], [2.5, 0.35], [3.4, 0]],
      browAngle: [[0, 0], [0.4, -0.2], [2.5, -0.2], [3.4, 0]],
      breath: [[0, 0], [0.5, 0.6], [2.6, 0.55], [3.8, 0], [4.6, 0.3]]
    }
  },
  sway: {
    label: "Sway",
    dur: 7,
    idle: !0,
    tracks: {
      bodyAngleZ: [[0, 0], [1.6, 6], [3.4, -6], [5.2, 5], [7, 0]],
      bodyAngleX: [[0, 0], [1.6, 3], [3.4, -3], [5.2, 2.5], [7, 0]],
      angleZ: [[0, 0], [1.8, -10], [3.6, 10], [5.4, -8], [7, 0]],
      angleX: [[0, 0], [1.8, 6], [3.6, -6], [5.4, 5], [7, 0]],
      angleY: [[0, 0], [0.9, 3], [1.8, 0], [2.7, 3], [3.6, 0], [4.5, 3], [5.4, 0], [7, 0]],
      armAngle: [[0, 0], [1.6, 3], [3.4, -3], [5.2, 2], [7, 0]],
      handAngle: [[0, 0], [1.8, -4], [3.6, 4], [5.4, -3], [7, 0]],
      gazeX: [[0, 0], [1.8, -0.3], [3.6, 0.3], [5.4, -0.2], [7, 0]],
      eyeOpen: [[0, 1], [0.8, 0.82], [6.2, 0.82], [7, 1]],
      eyeSmile: [[0, 0], [0.8, 0.35], [6.2, 0.35], [7, 0]],
      // slow, even breaths in time with the sway
      breath: [[0, 0], [0.9, 1], [1.8, 0], [2.7, 1], [3.6, 0], [4.5, 1], [5.4, 0], [6.3, 0.8], [7, 0]]
    }
  },
  sigh: {
    label: "Sigh",
    dur: 5.6,
    idle: !0,
    tracks: {
      breath: [[0, 0], [1.3, 1.25], [1.9, 1.25], [3.6, 0], [5.6, 0]],
      angleY: [[0, 0], [1.3, 9], [1.9, 9], [3.3, -9], [4.6, -6], [5.6, 0]],
      angleZ: [[0, 0], [1.3, -3], [3.3, 5], [5.6, 0]],
      bodyAngleX: [[0, 0], [1.3, -2.5], [3.3, 2.5], [5.6, 0]],
      bodyAngleZ: [[0, 0], [1.9, 1], [3.3, -1.5], [5.6, 0]],
      armAngle: [[0, 0], [1.3, -2.5], [3.3, 2], [5.6, 0]],
      gazeY: [[0, 0], [1.2, 0.4], [2, 0.3], [3.2, -0.4], [4.8, -0.2], [5.6, 0]],
      eyeOpen: [[0, 1], [1, 0.95], [1.9, 0.6], [3.4, 0.6], [4.6, 0.78], [5.6, 1]],
      browY: [[0, 0], [1.3, 0.35], [3.2, -0.2], [5.6, 0]],
      browAngle: [[0, 0], [1.9, -0.4], [4.6, -0.35], [5.6, 0]]
    }
  },
  doze: {
    label: "Drowsy",
    dur: 7.2,
    idle: !0,
    tracks: {
      eyeOpen: [[0, 1], [1.8, 0.78], [3.2, 0.62], [4.5, 0.55], [4.75, 1.1], [5.6, 1.05], [7.2, 1]],
      angleY: [[0, 0], [1.8, -6], [3.2, -9], [4.5, -17], [4.75, 5], [5.6, 2], [7.2, 0]],
      angleZ: [[0, 0], [2, 4], [4.5, 10], [4.75, -2], [7.2, 0]],
      angleX: [[0, 0], [4.5, -4], [4.75, 3], [5.4, -6], [6.2, 5], [7.2, 0]],
      bodyAngleZ: [[0, 0], [4.5, 3], [4.8, -2], [7.2, 0]],
      bodyAngleX: [[0, 0], [4.5, 2], [4.8, -1.5], [7.2, 0]],
      armAngle: [[0, 0], [4.5, 3], [4.8, -2], [7.2, 0]],
      handAngle: [[0, 0], [4.5, 5], [4.8, -1], [7.2, 0]],
      gazeY: [[0, 0], [4.5, -0.4], [4.75, 0.2], [7.2, 0]],
      gazeX: [[0, 0], [4.8, 0], [5.3, -0.6], [6.1, 0.6], [6.8, 0]],
      browY: [[0, 0], [4.5, -0.35], [4.75, 0.8], [5.8, 0.3], [7.2, 0]],
      // long, slow, deepening breaths; a sharp inhale on waking
      breath: [[0, 0], [1.1, 0.7], [2.6, 0], [3.8, 0.6], [4.5, 0.2], [4.8, 1.1], [6, 0.2], [7.2, 0]]
    }
  },
  stretch: {
    label: "Stretch",
    dur: 6.2,
    idle: !0,
    tracks: {
      angleZ: [[0, 0], [1.3, -22], [2.3, -21], [3.8, 20], [4.8, 19], [6.2, 0]],
      angleY: [[0, 0], [1.3, 5], [2.3, 7], [3.1, -3], [3.8, 5], [4.8, 6], [6.2, 0]],
      angleX: [[0, 0], [1.3, -5], [3.8, 5], [6.2, 0]],
      bodyAngleZ: [[0, 0], [1.3, 4], [3.8, -4], [6.2, 0]],
      bodyAngleX: [[0, 0], [1.3, -2], [3.8, 2], [6.2, 0]],
      armAngle: [[0, 0], [1.3, 2], [3.8, -2], [6.2, 0]],
      eyeOpen: [[0, 1], [0.8, 0.62], [4.9, 0.62], [5.6, 1]],
      browAngle: [[0, 0], [1, -0.3], [4.9, -0.3], [5.8, 0]],
      breath: [[0, 0], [1.3, 1.1], [2.3, 0.9], [3.1, 0.2], [3.8, 1.1], [4.8, 0.9], [6.2, 0]]
    }
  },
  lean: {
    label: "Peek",
    dur: 4.8,
    idle: !0,
    tracks: {
      bodyAngleX: [[0, 0], [0.9, 6], [3.4, 6], [4.4, 0]],
      bodyAngleZ: [[0, 0], [0.9, -3], [3.4, -3], [4.4, 0]],
      angleX: [[0, 0], [0.9, 9], [2, 7], [2.6, 10], [3.4, 8], [4.4, 0]],
      angleY: [[0, 0], [0.9, -6], [3.4, -5], [4.4, 0]],
      angleZ: [[0, 0], [0.9, 10], [2.2, 12], [3.4, 9], [4.4, 0]],
      armAngle: [[0, 0], [0.9, -3], [3.4, -3], [4.4, 0]],
      handAngle: [[0, 0], [0.9, 3], [3.4, 3], [4.4, 0]],
      gazeY: [[0, 0], [0.6, 0.45], [3.4, 0.4], [4.2, 0]],
      gazeX: [[0, 0], [1.5, 0], [1.8, -0.3], [2.3, 0.2], [2.8, 0], [4.2, 0]],
      eyeOpen: [[0, 1], [0.6, 1.1], [3.4, 1.08], [4.2, 1]],
      browY: [[0, 0], [0.6, 0.45], [3.4, 0.4], [4.2, 0]],
      browAngle: [[0, 0], [0.6, -0.3], [3.4, -0.3], [4.2, 0]],
      blush: [[0, 0], [1.2, 0.25], [3.4, 0.25], [4.4, 0]],
      breath: [[0, 0], [0.8, 0.8], [3.4, 0.6], [4.4, 0], [4.8, 0.2]]
    }
  },
  hum: {
    label: "Listen",
    dur: 5.6,
    idle: !0,
    tracks: {
      angleY: [[0, 0], [0.45, -5], [0.9, 2], [1.35, -5], [1.8, 2], [2.25, -5], [2.7, 2], [3.15, -5], [3.6, 2], [4.05, -4], [4.8, 0]],
      angleZ: [[0, 0], [0.9, 8], [1.8, -8], [2.7, 8], [3.6, -8], [4.6, 0]],
      angleX: [[0, 0], [0.9, 4], [1.8, -4], [2.7, 4], [3.6, -4], [4.6, 0]],
      bodyAngleZ: [[0, 0], [0.9, -3], [1.8, 3], [2.7, -3], [3.6, 3], [4.6, 0]],
      bodyAngleX: [[0, 0], [1.8, 2], [3.6, -2], [4.8, 0]],
      handAngle: [[0, 0], [0.9, 3], [1.8, -3], [2.7, 3], [3.6, -3], [4.6, 0]],
      fingerTap: [[0, 0], [0.45, 1], [0.9, 0], [1.35, 1], [1.8, 0], [2.25, 1], [2.7, 0], [3.15, 1], [3.6, 0], [5.6, 0]],
      gazeX: [[0, 0], [0.9, 0.3], [1.8, -0.3], [2.7, 0.3], [3.6, -0.3], [4.6, 0]],
      eyeOpen: [[0, 1], [0.4, 0.72], [4.6, 0.72], [5.3, 1]],
      eyeSmile: [[0, 0], [0.4, 0.55], [4.6, 0.55], [5.3, 0]],
      blush: [[0, 0], [0.8, 0.3], [4.6, 0.3], [5.6, 0]],
      browY: [[0, 0], [0.5, 0.25], [4.6, 0.25], [5.4, 0]],
      breath: [[0, 0], [0.9, 0.9], [1.8, 0.2], [2.7, 0.9], [3.6, 0.2], [4.6, 0.8], [5.6, 0]]
    }
  },
  tap: {
    label: "Tap",
    dur: 5,
    idle: !0,
    tracks: {
      gazeX: [[0, 0], [0.3, -0.6], [2.2, -0.5], [2.5, -0.1], [2.8, -0.6], [4.2, -0.5], [4.7, 0]],
      gazeY: [[0, 0], [0.3, 0.55], [4.2, 0.5], [4.7, 0]],
      angleX: [[0, 0], [0.8, -11], [2.4, -9], [3, -12], [4.2, -10], [5, 0]],
      angleY: [[0, 0], [0.8, 8], [4.2, 7], [5, 0]],
      angleZ: [[0, 0], [0.8, 6], [2.4, 4], [3, 7], [4.2, 5], [5, 0]],
      bodyAngleX: [[0, 0], [1, -2], [4.2, -2], [5, 0]],
      handAngle: [[0, 0], [0.8, 3], [4.2, 3], [5, 0]],
      fingerTap: [
        [0, 0],
        [0.9, 0],
        [1.05, 1],
        [1.2, 0],
        [1.4, 1],
        [1.55, 0],
        [1.75, 1],
        [1.9, 0],
        [2.6, 0],
        [2.75, 1],
        [2.9, 0],
        [3.1, 1],
        [3.25, 0],
        [5, 0]
      ],
      browY: [[0, 0], [0.6, 0.3], [4.2, 0.25], [5, 0]],
      browAngle: [[0, 0], [0.6, -0.35], [4.2, -0.3], [5, 0]],
      eyeOpen: [[0, 1], [0.6, 0.9], [4.2, 0.9], [5, 1]],
      breath: [[0, 0], [0.8, 0.7], [2.2, 0.4], [3.2, 0.8], [4.4, 0], [5, 0.2]]
    }
  },
  readNote: {
    label: "Read script",
    dur: 2.6,
    idle: !0,
    tracks: {
      // a quick look down at the notes on the desk and back to the camera
      gazeY: [[0, 0], [0.2, -0.85], [1.5, -0.8], [1.75, 0], [2.6, 0]],
      gazeX: [[0, 0], [0.2, -0.15], [1.5, -0.1], [1.75, 0]],
      angleY: [[0, 0], [0.45, -9], [1.5, -8], [2, 1], [2.6, 0]],
      angleZ: [[0, 0], [0.5, 2], [1.6, 2], [2.6, 0]],
      eyeOpen: [[0, 1], [0.3, 0.78], [1.5, 0.78], [1.75, 1]],
      breath: [[0, 0.3], [0.8, 0.5], [1.8, 0.2], [2.6, 0.4]]
    }
  },
  waiting: {
    label: "Fidget",
    dur: 6.4,
    idle: !0,
    tracks: {
      // shifts her weight, checks the viewer, looks away, shifts back
      bodyAngleZ: [[0, 0], [0.9, 5], [2.4, 4], [3.3, -5], [5.2, -4], [6.4, 0]],
      bodyAngleX: [[0, 0], [0.9, 3], [3.3, -3], [5.2, -2], [6.4, 0]],
      angleZ: [[0, 0], [1, -6], [2.4, -4], [3.4, 6], [5.2, 5], [6.4, 0]],
      angleX: [[0, 0], [1.2, -8], [2.2, 2], [3.6, 12], [5, 10], [6.2, 0]],
      angleY: [[0, 0], [1.2, -3], [2.2, 2], [3.6, -2], [6.2, 0]],
      armAngle: [[0, 0], [0.9, 3], [3.3, -3], [5.2, -2], [6.4, 0]],
      handAngle: [[0, 0], [1.2, 3], [3.4, -3], [6.4, 0]],
      fingerTap: [[0, 0], [4.2, 0], [4.35, 1], [4.5, 0], [4.7, 1], [4.85, 0], [6.4, 0]],
      gazeX: [[0, 0], [0.9, -0.7], [1.9, -0.6], [2.1, 0], [2.7, 0], [2.9, 0.8], [5, 0.7], [5.4, 0], [6.4, 0]],
      gazeY: [[0, 0], [0.9, -0.2], [2.1, 0], [2.9, 0.3], [5.4, 0]],
      eyeOpen: [[0, 1], [2, 1], [2.2, 1.06], [2.8, 1.05], [3.1, 0.85], [5.4, 0.85], [6.2, 1]],
      browAngle: [[0, 0], [0.9, -0.35], [2, -0.35], [2.3, 0], [3.1, -0.4], [5.4, -0.35], [6.4, 0]],
      browY: [[0, 0], [2.2, 0.4], [2.8, 0.35], [3.2, 0], [6.4, 0]],
      breath: [[0, 0.3], [0.9, 0.8], [2, 0.3], [2.6, 0.9], [3.4, 0.2], [4.4, 0.8], [5.6, 0], [6.4, 0.2]]
    }
  },
  spaceOut: {
    label: "Daydream",
    dur: 7.4,
    idle: !0,
    tracks: {
      // gaze drifts up and away, breaths get slow and long, one slow blink
      gazeX: [[0, 0], [1.4, -0.55], [4.8, -0.6], [5.6, 0.1], [7, 0]],
      gazeY: [[0, 0], [1.4, 0.6], [4.8, 0.55], [5.6, 0], [7, 0]],
      angleX: [[0, 0], [2, -9], [4.8, -10], [6, 2], [7.4, 0]],
      angleY: [[0, 0], [2, 7], [4.8, 8], [6, -2], [7.4, 0]],
      angleZ: [[0, 0], [2, 9], [4.8, 11], [6, 2], [7.4, 0]],
      bodyAngleZ: [[0, 0], [2.2, 3], [4.8, 3.5], [6.4, 0]],
      bodyAngleX: [[0, 0], [2.2, -2], [4.8, -2], [6.4, 0]],
      handAngle: [[0, 0], [2.2, 4], [4.8, 5], [6.4, 0]],
      armAngle: [[0, 0], [2.2, 2], [4.8, 2], [6.4, 0]],
      eyeOpen: [[0, 1], [1.4, 0.8], [3, 0.8], [3.35, 0.56], [3.8, 0.8], [4.8, 0.8], [5.6, 1.04], [6.4, 1]],
      browY: [[0, 0], [1.6, 0.15], [4.8, 0.15], [5.6, 0.35], [6.6, 0]],
      breath: [[0, 0], [1.6, 0.9], [3.4, 0], [5, 0.9], [6.2, 0.1], [7.4, 0]]
    }
  }
};
function _r(e, t) {
  if (t <= e[0][0]) return e[0][1];
  const n = e.length - 1;
  if (t >= e[n][0]) return e[n][1];
  let r = 0;
  for (; t > e[r + 1][0]; ) r++;
  const [o, s] = e[r], [i, u] = e[r + 1], v = (p) => p <= 0 || p >= n ? 0 : (e[p + 1][1] - e[p - 1][1]) / (e[p + 1][0] - e[p - 1][0]), y = i - o, m = (t - o) / y, l = v(r) * y, h = v(r + 1) * y, f = m * m, c = f * m;
  return (2 * c - 3 * f + 1) * s + (c - 2 * f + m) * l + (-2 * c + 3 * f) * u + (c - f) * h;
}
const pt = {
  a: { open: 0.9, form: 0, label: "あ" },
  i: { open: 0.5, form: -0.85, label: "い" },
  u: { open: 0.4, form: 0.9, label: "う" },
  e: { open: 0.62, form: -0.4, label: "え" },
  o: { open: 0.75, form: 0.6, label: "お" },
  n: { open: 0, form: null, label: "ん" }
  // closes with the previous shape
}, Fr = {
  a: "あかさたなはまやらわがざだばぱぁ",
  i: "いきしちにひみりぎじぢびぴぃ",
  u: "うくすつぬふむゆるぐずづぶぷぅゔ",
  e: "えけせてねへめれげぜでべぺぇ",
  o: "おこそとのほもよろをごぞどぼぽぉ"
}, Bn = {};
for (const [e, t] of Object.entries(Fr)) for (const n of t) Bn[n] = e;
const jr = /* @__PURE__ */ new Set([..."まみむめもばびぶべぼぱぴぷぺぽ"]), Ur = /* @__PURE__ */ new Set([..."あいうえおぁぃぅぇぉ"]), yn = { ゃ: "a", ゅ: "u", ょ: "o" }, Br = /* @__PURE__ */ new Set([..."、。，．,.！？!? 　…"]), $r = (e) => e.replace(/[ァ-ヶ]/g, (t) => String.fromCharCode(t.charCodeAt(0) - 96));
function Yr(e, t = 0.14) {
  const n = [];
  for (const r of $r(e)) {
    const o = n[n.length - 1];
    if (yn[r] && o) {
      o.vowel = yn[r];
      continue;
    }
    if (r === "ー" && o) {
      o.dur += t;
      continue;
    }
    if (r === "っ") {
      n.push({ vowel: "n", dur: t * 0.8, onset: null });
      continue;
    }
    if (r === "ん") {
      n.push({ vowel: "n", dur: t, onset: null });
      continue;
    }
    if (Br.has(r)) {
      n.push({ vowel: "n", dur: t * 2.2, onset: null });
      continue;
    }
    const s = Bn[r];
    s && n.push({ vowel: s, dur: t, onset: jr.has(r) ? "lips" : Ur.has(r) ? null : "consonant" });
  }
  return n;
}
function Ir(e, t, n = 0.5) {
  if (n !== 0.5) return Nr(e, t, n);
  let r = 0;
  for (const o of e) {
    if (t < r + o.dur) {
      const s = (t - r) / o.dur, i = pt[o.vowel], u = o.onset === "lips" ? 0.05 : o.onset === "consonant" ? 0.45 : 1, v = s < 0.35 ? u + (1 - u) * (s / 0.35) : 1;
      return { open: i.open * v, form: i.form, vowel: o.vowel };
    }
    r += o.dur;
  }
  return null;
}
function Nr(e, t, n) {
  const r = n < 0.5 ? (0.5 - n) * 0.72 : 0;
  let o = 0, s = 0, i = null;
  for (const u of e) {
    let v = u.vowel;
    if (u.vowel === "n" ? r && u.dur <= 0.2 && i ? v = i : (s = 0, i = null) : ((!i || s >= r) && (i = u.vowel, s = 0), s += u.dur, r && (v = i)), t < o + u.dur) {
      const y = pt[v], m = u.onset === "lips" ? 0.05 : u.onset === "consonant" ? 0.45 : 1, l = n < 0.5 ? 1 - (1 - m) * n * 2 : m * (2 - n * 2), h = Math.min(u.dur * 0.35, 0.05), f = (t - o) / h;
      return { open: y.open * (f < 1 ? l + (1 - l) * f : 1), form: y.form, vowel: v };
    }
    o += u.dur;
  }
  return null;
}
const jt = { ...nn, ...rn }, vn = { amp: 1, stiff: 1.8 }, Xr = /^(angle|bodyAngle|armAngle|handAngle)/, zr = /* @__PURE__ */ new Set([
  "eyeOpen",
  "eyeOpenL",
  "eyeSmileL",
  "eyeSmile",
  "mouthOpen",
  "mouthForm",
  "blush",
  "browY",
  "browAngle"
]), xt = (e, t, n) => {
  const r = Math.min(1, Math.max(0, (n - e) / (t - e)));
  return r * r * (3 - 2 * r);
};
function bn(e, t) {
  const n = Math.floor(e), r = e - n, o = (i) => {
    const u = Math.sin((i + t * 57.3) * 127.1) * 43758.5453;
    return u - Math.floor(u);
  }, s = r * r * (3 - 2 * r);
  return (o(n) * (1 - s) + o(n + 1) * s) * 2 - 1;
}
const ze = (e, t) => bn(e, t) * 0.7 + bn(e * 2.3, t + 9) * 0.3, ke = (e, t, n) => Math.max(t, Math.min(n, e)), $n = {
  normal: { label: "Neutral", p: {} },
  smile: { label: "Smile", p: { eyeOpen: 0, eyeSmile: 1, blush: 0.35, browY: 0.2 } },
  shy: { label: "Blush", p: { eyeOpen: 0.78, eyeSmile: 0.5, blush: 1, browAngle: -0.5, browY: -0.1, glance: [0.7, 0.35] } },
  jito: { label: "Half-lidded", p: { eyeOpen: 0.5, browY: -0.5, browAngle: 0.6 } },
  surprise: { label: "Surprise", p: { eyeOpen: 1.22, browY: 1, mouthOpen: 0.6, mouthForm: 0.6 } },
  wink: { label: "Wink", p: { eyeOpenL: 0, eyeSmileL: 1, blush: 0.3 } },
  // talking faces for AITuber OnAir emotion tags: eyes stay mostly open (closed / ^^ eyes are
  // what a single image fakes worst, and they would stay shut for a whole sentence)
  happyTalk: { label: "happy", p: { eyeOpen: 0.8, eyeSmile: 0.45, blush: 0.35, browY: 0.25, mouthForm: -0.5 } },
  sadTalk: { label: "sad", p: { eyeOpen: 0.78, browAngle: -0.8, browY: -0.2, mouthForm: 0.3, glance: [0, -0.35] } },
  angryTalk: { label: "angry", p: { eyeOpen: 0.72, browAngle: 0.85, browY: -0.55, mouthForm: 0.2 } },
  surprisedTalk: { label: "surprised", p: { eyeOpen: 1.18, browY: 0.9, mouthForm: 0.9 } },
  relaxedTalk: { label: "relaxed", p: { eyeOpen: 0.82, eyeSmile: 0.35, blush: 0.15, browY: 0.1 } }
}, wn = {
  happy: ["happyTalk", "nod"],
  sad: ["sadTalk", "sigh"],
  angry: ["angryTalk", "no"],
  surprised: ["surprisedTalk", "surprise"],
  relaxed: ["relaxedTalk", "sway"],
  neutral: ["normal", null]
}, Cr = {
  gazeX: [260, 0.9],
  gazeY: [260, 0.9],
  angleX: [55, 0.72],
  angleY: [55, 0.72],
  angleZ: [45, 0.75],
  bodyAngleX: [14, 0.9],
  bodyAngleZ: [12, 0.9],
  weightShift: [14, 0.9],
  armAngle: [20, 0.85],
  handAngle: [30, 0.8]
};
function Dr(e) {
  const n = (e + 0.45) % 5, r = n < 2.5 ? -0.7 : 0.7, o = -r, s = n % 2.5;
  if (s >= 0.9) return o;
  const i = s / 0.9, u = i * i * i * (10 + i * (-15 + 6 * i));
  return r + (o - r) * u;
}
class Pr {
  /** @param {number[]} gazeCenter @param {boolean} [planted] @param {import('../rig/types').Rig|null} [armRig] */
  constructor(t, n = !1, r = null) {
    this.armRig = r, this.armFollow = 0, this.armVelocity = 0, this.planted = n, this.mode = "auto", this.P = Object.fromEntries(bt.map((o) => [o.id, o.def])), this.manual = { ...this.P }, this.cur = { ...this.P }, this.vel = Object.fromEntries(bt.map((o) => [o.id, 0])), this.expr = "normal", this.exprMix = {}, this.t = 0, this.blink = { t: 0, start: 1.5, double: !1 }, this.gaze = { x: 0, y: 0, next: 0 }, this.tap = { next: 4, until: -1 }, this.pointer = null, this.faceCenter = [...t], this.lipOpen = null, this.lipForm = 0, this.speaking = !1, this.voice = 0, this.mouth = 0, this.vowel = "a", this.vowelForm = 0, this.lipSync = dn(), this.lipMotion = gn(this.lipSync), this.syllableArmed = !0, this.voicePeak = 0, this.voiceTrough = 0, this.kana = null, this.lipHold = null, this.emotionUntil = 0, this.talkGain = 1, this.play = null, this.autoMotion = !0, this.nextAuto = 14, this.autoIdle = !0, this.nextIdle = 3, this.lastAuto = null, this.onMotion = null;
  }
  setExpression(t) {
    this.expr = t;
  }
  hasMotion(t) {
    return t in jt;
  }
  // ---- speech (driven from outside, e.g. by the TTS audio analyser) ----
  setVoiceLevel(t) {
    this.voice = Math.min(1, Math.max(0, Number(t) || 0));
  }
  setLipSync(t) {
    this.lipSync = dn(t, this.lipSync), this.lipMotion = gn(this.lipSync);
  }
  setSpeaking(t) {
    t !== this.speaking && (this.speaking = !!t, t || (this.emotionUntil = this.t + 1.2, this.voice = 0));
  }
  /** `playMotion: false` changes only the face (a caller that picks motions itself). */
  setEmotion(t, { playMotion: n = !0 } = {}) {
    const r = wn[t] ?? wn.neutral;
    this.expr = r[0], this.emotionUntil = 1 / 0, r[1] && n && this.playMotion(r[1]);
  }
  /** Mouth shapes from kana text, without audio (preview / tuning). */
  /** @param {string} text @param {{ speed?: number, loop?: boolean }} [options] */
  speakKana(t, { speed: n, loop: r = !1 } = {}) {
    this.lipHold = null;
    const o = Yr(t, n === void 0 ? 0.14 : 1 / ke(Number(n) || 7, 4, 12));
    this.kana = o.length ? { moras: o, t: 0, loop: r, duration: o.reduce((s, i) => s + i.dur, 0) } : null;
  }
  holdMouth(t) {
    this.kana = null, this.lipHold = Object.hasOwn(pt, t) ? t : null;
  }
  stopLipSync() {
    this.kana = null, this.lipHold = null, this.lipOpen = null, this.mouth = 0;
  }
  getLipSyncState() {
    return { active: this.kana !== null || this.lipHold !== null, open: this.P.mouthOpen, form: this.P.mouthForm };
  }
  // Mouth from the TTS loudness. A volume signal has no vowel information, so each syllable
  // (the voice dipping and rising again) gets one vowel at random, weighted towards a, and
  // keeps it until the next syllable: the drawn mouths must not change shape mid-syllable.
  // Syllables are found relative to the recent peak (not an absolute level), and the mouth
  // is scaled by where the voice sits between the recent trough and peak, so it closes in
  // the dip before each mora even when a loud voice never gets quiet.
  speechMouth(t) {
    if (this.kana || this.lipHold) {
      let h;
      if (this.lipHold ? h = pt[this.lipHold] : (this.kana.t += t, this.kana.loop && (this.kana.t %= this.kana.duration), h = Ir(this.kana.moras, this.kana.t, this.lipSync.granularity)), !h)
        return this.kana = null, this.mouth > 0.01 ? [this.mouth *= this.lipSync.closeSpeed === 0.5 ? 0.6 : Math.exp(-t * this.lipMotion.kanaRelease), this.vowelForm] : null;
      const f = this.lipMotion.openness === 1 ? h.open : Math.min(1, h.open * this.lipMotion.openness), c = f > this.mouth ? 1 - Math.exp(-t * 30) : 1 - Math.exp(-t * this.lipMotion.kanaRelease);
      return this.mouth += (f - this.mouth) * c, h.form !== null && (this.vowelForm = h.form), [this.mouth, this.vowelForm];
    }
    const n = this.speaking ? this.voice : 0, r = 1 - Math.exp(-t * this.lipMotion.relax);
    this.voicePeak = n > this.voicePeak ? n : this.voicePeak + (n - this.voicePeak) * r, this.voiceTrough = n < this.voiceTrough ? n : this.voiceTrough + (n - this.voiceTrough) * r;
    const o = Math.max(this.voicePeak, 0.05);
    if (n < o * this.lipMotion.arm) this.syllableArmed = !0;
    else if (this.syllableArmed && n > o * this.lipMotion.trigger && n > 0.1) {
      this.syllableArmed = !1;
      const h = Math.random();
      this.vowel = h < 0.4 ? "a" : h < 0.58 ? "o" : h < 0.74 ? "e" : h < 0.88 ? "i" : "u";
    }
    const s = this.voicePeak - this.voiceTrough, i = s < o * this.lipMotion.range ? 1 : Math.max(0, (n - this.voiceTrough) / s), u = pt[this.vowel ?? "a"], v = Math.min(1, Math.pow(n, 0.7) * 1.15) * Math.pow(i, this.lipMotion.risePower), y = this.speaking ? Math.min(0.95, v) * (0.45 + 0.55 * u.open / 0.9) : 0, m = this.lipMotion.openness === 1 ? y : Math.min(1, y * this.lipMotion.openness), l = m > this.mouth ? 1 - Math.exp(-t * 40) : 1 - Math.exp(-t * this.lipMotion.audioRelease);
    return this.mouth += (m - this.mouth) * l, this.speaking && (this.vowelForm = u.form), this.speaking || this.mouth > 0.01 ? [this.mouth, this.vowelForm] : null;
  }
  // Breathing: inhale ~40% of the cycle, a slower exhale, a short pause at the bottom,
  // and a period that drifts between ~3.2 and 4.6 s so it never looks metronomic.
  breathValue(t) {
    this.breathPhase = (this.breathPhase ?? 0) + t / (this.breathPeriod ?? 3.8), this.breathPhase >= 1 && (this.breathPhase -= 1, this.breathPeriod = 3.2 + Math.random() * 1.4);
    const n = this.breathPhase;
    return n < 0.4 ? xt(0, 0.4, n) : n < 0.88 ? 1 - xt(0.4, 0.88, n) : 0;
  }
  // pick one at random, never the one that just played
  playRandom(t) {
    const n = t.filter((r) => r !== this.lastAuto);
    this.playMotion(n[Math.floor(Math.random() * n.length)]);
  }
  playMotion(t) {
    this.lastAuto = t, this.play = { id: t, t: 0 }, this.onMotion?.(t);
  }
  blinkValue(t) {
    const n = this.blink;
    if (n.t += t, n.t < n.start) return 1;
    const r = (n.t - n.start) / 0.17;
    return r >= 1 ? (n.double ? (n.double = !1, n.start = n.t + 0.07) : (n.start = n.t + 1.8 + Math.random() * 4.2, n.double = Math.random() < 0.18), 1) : r < 0.45 ? 1 - r / 0.45 : (r - 0.45) / 0.55;
  }
  update(t) {
    this.t += t;
    const n = this.t, r = {};
    for (const c of bt) r[c.id] = c.def;
    if (this.mode === "manual")
      Object.assign(r, this.manual);
    else if (this.mode === "auto") {
      if (r.angleX = ze(n * 0.18, 1) * 10 + this.gaze.x * 11, r.angleY = ze(n * 0.15, 2) * 6 - 1 + this.gaze.y * 7, r.angleZ = ze(n * 0.12, 3) * 10, r.bodyAngleX = ze(n * 0.1, 4) * 5 * (this.planted ? 0.35 : 1), r.bodyAngleZ = ze(n * 0.09, 5) * 4 * (this.planted ? 0.35 : 1), r.weightShift = this.planted ? Dr(n) : 0.7 * Math.sin(n * Math.PI * 2 / 5), r.armAngle = ze(n * 0.14, 6) * 5, r.handAngle = ze(n * 0.21, 7) * 5, n > this.gaze.next) {
        const c = Math.random();
        this.gaze.x = c < 0.45 ? 0 : (Math.random() * 2 - 1) * 0.8, this.gaze.y = c < 0.45 ? 0 : (Math.random() * 2 - 1) * 0.5, this.gaze.next = n + 0.8 + Math.random() * 2.5;
      }
      if (r.gazeX = this.gaze.x + r.angleX / 60, r.gazeY = this.gaze.y + r.angleY / 60, n > this.tap.next && (this.tap.until = n + 1.1, this.tap.next = n + 5 + Math.random() * 6), this.speaking) {
        this.nextIdle = Math.max(this.nextIdle, n + 2.5), this.nextAuto = Math.max(this.nextAuto, n + 6);
        const c = this.talkGain;
        this.talkNod = (this.talkNod ?? 0) + (this.voice * 7 * c - (this.talkNod ?? 0)) * Math.min(1, t * 6), r.angleY -= this.talkNod, r.angleX += ze(n * 0.6, 11) * 5 * c, r.angleZ += ze(n * 0.5, 12) * 4 * c;
      }
      !this.speaking && n > this.emotionUntil && (this.expr = "normal", this.emotionUntil = 1 / 0), this.speaking || (!this.play && this.autoMotion && n > this.nextAuto ? (this.playRandom(Object.keys(nn).filter((c) => c !== "surprise")), this.nextAuto = n + 15 + Math.random() * 10, this.nextIdle = Math.max(this.nextIdle, n + 5)) : !this.play && this.autoIdle && n > this.nextIdle && (this.playRandom(Object.keys(rn)), this.nextIdle = n + 5 + Math.random() * 5));
    } else if (this.mode === "mouse" && this.pointer) {
      const c = (this.pointer[0] - this.faceCenter[0]) / 500, p = (this.pointer[1] - this.faceCenter[1]) / 500;
      r.angleX = ke(c * 30, -30, 30), r.angleY = ke(-p * 30, -30, 30), r.angleZ = ke(-c * p * 25, -12, 12), r.bodyAngleX = ke(c * 10, -10, 10) * 0.6, r.gazeX = ke(c * 1.4, -1, 1), r.gazeY = ke(-p * 1.4, -1, 1), r.handAngle = ke(c * 4, -5, 5);
    }
    this.mode !== "manual" && (r.breath = this.breathValue(t), n < this.tap.until && (r.fingerTap = Math.max(0, Math.sin((this.tap.until - n) * Math.PI * 3.6)) ** 2));
    let o = null, s = 0;
    if (this.play) {
      const c = jt[this.play.id];
      if (this.play.t += t, this.play.t >= c.dur)
        this.play = null, this.onMotion?.(null);
      else {
        o = {};
        for (const [p, d] of Object.entries(c.tracks))
          o[p] = _r(d, this.play.t) * (c.idle && Xr.test(p) ? vn.amp : 1);
        s = xt(0, 0.15, this.play.t) * (1 - xt(c.dur - 0.25, c.dur, this.play.t));
        for (const [p, d] of Object.entries(o))
          Lr.has(p) ? r[p] += d : p === "breath" ? r[p] += (d - r[p]) * s : zr.has(p) || (r[p] = Math.max(r[p], Math.max(0, d)));
      }
    }
    if (this.mode !== "manual" && (r.angleY += r.breath * 1.6), this.armRig?.arms && this.mode !== "manual") {
      const { arms: c, body: p, legs: d } = this.armRig, w = -r.bodyAngleZ / 10 * p.maxRoll + (d ? d.tilt * (1 - (d.spine ?? 0.7)) * r.weightShift : 0), a = ke(t, 0, 0.05), g = Math.ceil(a * 240);
      for (let E = 0; E < g; E++) {
        const _ = a / g;
        this.armVelocity += (100 * (-w * 0.65 - this.armFollow) - 18 * this.armVelocity) * _, this.armFollow += this.armVelocity * _;
      }
      const x = (c.swing ?? mt.swing) * Math.PI / 180, b = c.inward ?? mt.inward;
      for (const [E, _] of [["L", 1], ["R", -1]]) {
        const X = _ * this.armFollow, $ = x * (X < 0 ? b : 1);
        r[`armSwing${E}`] = ke(($ > 0 ? X / $ : 0) + (r.breath - 0.5) * 0.06, -1, 1), r[`elbowBend${E}`] = r.breath * 0.025;
      }
    }
    const i = $n[this.expr].p, u = ["eyeOpen", "eyeOpenL", "eyeSmileL", "eyeSmile", "mouthOpen", "mouthForm", "blush", "browY", "browAngle", "gx", "gy"], v = {
      eyeOpen: i.eyeOpen ?? 1,
      eyeOpenL: i.eyeOpenL ?? i.eyeOpen ?? 1,
      eyeSmileL: i.eyeSmileL ?? i.eyeSmile ?? 0,
      eyeSmile: i.eyeSmile ?? 0,
      mouthOpen: i.mouthOpen ?? 0,
      mouthForm: i.mouthForm ?? 0,
      blush: i.blush ?? 0,
      browY: i.browY ?? 0,
      browAngle: i.browAngle ?? 0,
      gx: i.glance?.[0] ?? 0,
      gy: i.glance?.[1] ?? 0
    }, y = 1 - Math.exp(-t * 9);
    for (const c of u)
      this.exprMix[c] === void 0 && (this.exprMix[c] = v[c]), this.exprMix[c] += (v[c] - this.exprMix[c]) * y;
    const m = this.exprMix, l = {};
    for (const c of bt) {
      const p = c.id;
      if (this.mode === "manual" && !o) {
        l[p] = r[p], this.cur[p] = r[p], this.vel[p] = 0;
        continue;
      }
      let [d, w] = Cr[p] ?? [120, 0.95];
      o && /^angle|^body/.test(p) && (jt[this.play?.id ?? ""]?.idle ? (d *= vn.stiff, w = 0.8) : /^angle/.test(p) && (d *= 4.5, w = 0.75));
      const a = 2 * Math.sqrt(d) * w;
      this.vel[p] += (d * (r[p] - this.cur[p]) - a * this.vel[p]) * t, this.cur[p] += this.vel[p] * t, l[p] = this.cur[p];
    }
    let h = 1;
    if (this.mode !== "manual" ? (h = this.blinkValue(t), l.eyeROpen = m.eyeOpen * h, l.eyeLOpen = m.eyeOpenL * h, l.eyeSmile = m.eyeSmile, l.eyeSmileL = m.eyeSmileL, l.mouthOpen = m.mouthOpen, l.mouthForm = m.mouthForm, l.blush = m.blush, l.browY = m.browY + (l.angleY > 0 ? l.angleY / 60 : 0) - (1 - h) * 0.18, l.browAngle = m.browAngle, l.gazeX = ke(l.gazeX + m.gx, -1, 1), l.gazeY = ke(l.gazeY + m.gy, -1, 1)) : l.eyeSmileL = l.eyeSmile, o) {
      const c = (d, w) => {
        l[d] += (w - l[d]) * s;
      }, p = (d) => Math.min(1.3, Math.max(0, d));
      "eyeOpen" in o && (c("eyeROpen", p(o.eyeOpen) * h), "eyeOpenL" in o || c("eyeLOpen", p(o.eyeOpen) * h)), "eyeOpenL" in o && c("eyeLOpen", p(o.eyeOpenL) * h), "eyeSmile" in o && (c("eyeSmile", o.eyeSmile), "eyeSmileL" in o || c("eyeSmileL", o.eyeSmile)), "eyeSmileL" in o && c("eyeSmileL", o.eyeSmileL);
      for (const d of ["mouthOpen", "mouthForm", "blush", "browY", "browAngle"])
        d in o && c(d, d === "mouthOpen" || d === "blush" ? Math.max(0, o[d]) : o[d]);
    }
    const f = this.speechMouth(t);
    return f ? (this.lipOpen = f[0], this.lipForm = f[1]) : this.lipOpen !== null && !this.speaking && !this.kana && (this.lipOpen = null), this.lipOpen !== null && (l.mouthOpen = Math.max(l.mouthOpen * 0.3, this.lipOpen), l.mouthForm = ke(this.lipForm, -1, 1)), this.P = l, l;
  }
}
const Ot = {
  neutral: "normal",
  smile: "smile",
  shy: "shy",
  surprise: "surprise",
  halfLidded: "jito",
  angry: "angryTalk",
  sad: "sadTalk",
  wink: "wink"
}, Hr = { sad: { pitch: -6, gy: -0.45 } }, lt = (e, t, n) => Math.max(t, Math.min(n, e)), ct = Object.freeze({ eyeOpen: 1, eyeOpenL: 1, eyeSmile: 0, eyeSmileL: 0, blush: 0, browY: 0, browAngle: 0, mouthOpen: 0, mouthForm: 0, gx: 0, gy: 0, pitch: 0 });
function Vr(e, t = {}) {
  const n = $n[Ot[e]]?.p ?? {}, r = Hr[e] ?? {}, o = e === "neutral" ? void 0 : t[e]?.mouthOpen;
  return {
    eyeOpen: n.eyeOpen ?? 1,
    eyeOpenL: n.eyeOpenL ?? n.eyeOpen ?? 1,
    eyeSmile: n.eyeSmile ?? 0,
    eyeSmileL: n.eyeSmileL ?? n.eyeSmile ?? 0,
    blush: n.blush ?? 0,
    browY: n.browY ?? 0,
    browAngle: n.browAngle ?? 0,
    mouthOpen: o ?? n.mouthOpen ?? 0,
    mouthForm: n.mouthForm ?? 0,
    gx: n.glance?.[0] ?? 0,
    gy: r.gy ?? n.glance?.[1] ?? 0,
    pitch: r.pitch ?? 0
  };
}
function Zr(e, t) {
  const n = { ...e };
  return n.eyeROpen = (e.eyeROpen ?? 1) * t.eyeOpen, n.eyeLOpen = (e.eyeLOpen ?? 1) * t.eyeOpenL, n.eyeSmile = Math.max(e.eyeSmile ?? 0, t.eyeSmile), n.eyeSmileL = Math.max(e.eyeSmileL ?? e.eyeSmile ?? 0, t.eyeSmileL), n.blush = Math.max(e.blush ?? 0, t.blush), n.browY = lt((e.browY ?? 0) + t.browY, -1, 1), n.browAngle = lt((e.browAngle ?? 0) + t.browAngle, -1, 1), n.mouthOpen = Math.max(e.mouthOpen ?? 0, t.mouthOpen), t.mouthOpen > (e.mouthOpen ?? 0) && (n.mouthForm = t.mouthForm), n.gazeX = lt((e.gazeX ?? 0) + t.gx, -1, 1), n.gazeY = lt((e.gazeY ?? 0) + t.gy, -1, 1), n.angleY = lt((e.angleY ?? 0) + t.pitch, -30, 30), n;
}
class Wr {
  /** @type {keyof typeof OVERLAY_EXPRESSIONS} */
  name = "neutral";
  mix = { ...ct };
  /** @param {Record<string, { mouthOpen?: number }>} [settings] parsed per-expression settings */
  constructor(t = {}) {
    this.settings = t;
  }
  /** @param {string} name */
  set(t) {
    this.name = Object.hasOwn(Ot, t) ? (
      /** @type {keyof typeof OVERLAY_EXPRESSIONS} */
      t
    ) : "neutral";
  }
  /** True while an expression is shown or still fading out. */
  get active() {
    return this.name !== "neutral" || Object.keys(ct).some((t) => Math.abs(this.mix[t] - ct[t]) > 1e-3);
  }
  apply(t, n) {
    if (!this.active)
      return this.mix = { ...ct }, t;
    const r = Vr(this.name, this.settings), o = 1 - Math.exp(-Math.max(0, n) * 12);
    for (const s of Object.keys(ct)) this.mix[s] += (r[s] - this.mix[s]) * o;
    return Zr(t, this.mix);
  }
}
const xn = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function on(e) {
  if (!xn(e)) throw new TypeError("expressions: expected an object");
  const t = {};
  for (const [n, r] of Object.entries(e)) {
    if (n === "neutral" || !Object.hasOwn(Ot, n)) continue;
    if (!xn(r)) throw new TypeError(`expressions.${n}: expected an object`);
    const o = {}, s = r.mouthOpen;
    if (s !== void 0) {
      if (typeof s != "number" || !Number.isFinite(s) || s < 0 || s > 1)
        throw new RangeError(`expressions.${n}.mouthOpen: expected 0–1`);
      o.mouthOpen = s;
    }
    t[n] = o;
  }
  return t;
}
function Gr(e = {}, t = {}) {
  const n = {};
  for (const r of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)]))
    n[r] = { ...e[r], ...t[r] };
  return n;
}
const Mn = ["ball", "low", "crease", "lash"], Ut = /* @__PURE__ */ new Map(), Bt = /* @__PURE__ */ new Map();
async function $t(e) {
  return Bt.has(e) || Bt.set(e, fetch(e).then((t) => {
    if (!t.ok) throw new Error(`failed to load ${e}`);
    return t.json();
  })), Bt.get(e);
}
function Yt(e) {
  if (Ut.has(e)) return Ut.get(e);
  const t = new Promise((n, r) => {
    const o = new Image();
    o.onload = () => n(o), o.onerror = () => r(new Error(`failed to load ${e}`)), o.src = e;
  });
  return Ut.set(e, t), t;
}
function Yn(e, t) {
  const n = document.createElement("canvas");
  n.width = e.width, n.height = e.height;
  const r = n.getContext("2d");
  r.drawImage(e, 0, 0);
  const o = r.getImageData(0, 0, n.width, n.height).data, s = new Uint8Array(n.width * n.height);
  for (let i = 0; i < s.length; i++) s[i] = o[i * 4 + t];
  return s;
}
const We = (e) => Yn(e, 3);
function qr(e, [t, n, r, o]) {
  const s = document.createElement("canvas");
  return s.width = r, s.height = o, s.getContext("2d").drawImage(e, t, n, r, o, 0, 0, r, o), s;
}
function Jr(e, t) {
  const [n, r] = e.t.pivot, o = e.dir, s = e.pts, i = (f, c, p) => {
    const d = Math.min(1, Math.max(0, (p - f) / (c - f)));
    return d * d * (3 - 2 * d);
  }, u = Math.cos(e.phi[0]), v = Math.sin(e.phi[0]), y = Math.cos(e.phi[1]), m = Math.sin(e.phi[1]), l = t.rest, h = t.pos;
  for (let f = 0; f < l.length; f += 2) {
    const c = l[f] - n, p = l[f + 1] - r, d = c * o[0] + p * o[1], w = s[0][0] + c * u - p * v, a = s[0][1] + c * v + p * u, g = c - o[0] * e.L1, x = p - o[1] * e.L1, b = s[1][0] + g * y - x * m, E = s[1][1] + g * m + x * y, _ = i(e.L1 * 0.55, e.L1 * 1.35, d);
    h[f] = w + (b - w) * _, h[f + 1] = a + (E - a) * _;
  }
}
async function Kr(e, t) {
  if (!t.assets && t.assetsBase === void 0)
    throw new Error("createMeshAvatar requires assets or assetsBase.");
  const n = t.rig, r = or(n), {
    IMG: o,
    EYES: s,
    baseWeights: i,
    deformBase: u,
    eyePartY: v,
    eyePartAlpha: y,
    handWeights: m,
    handFrame: l,
    deformHand: h,
    TASSELS: f
  } = r, { Renderer: c, buildGrid: p } = vr(r, n), { Physics: d } = br(r, n), { Cloth: w } = Sr(r, n), a = n.cloth ?? [], { createSprites: g } = Or(r, n), x = (t.assetsBase ?? "").replace(/\/?$/, "/"), b = (A, k) => {
    if (t.assets) {
      if (!t.assets[A]) throw new Error(`Missing project asset: ${A}`);
      return t.assets[A];
    }
    return `${x}${A}${k === void 0 ? "" : `?b=${k}`}`;
  }, E = await $t(b("layers.json")), X = [a.length ? "base_cloth" : "base", ...n.hand ? ["hand"] : [], ...f.map((A) => A.name), ...a.map((A) => `cloth_${A.name}`), ...[0, 1].flatMap((A) => Mn.map((k) => `eye${A}_${k}`)), "hairmask"], $ = Object.fromEntries(await Promise.all(X.map(async (A) => [A, await Yt(b(`${A}.png`, E.build))])));
  a.length && ($.base = $.base_cloth);
  const Y = Yn($.hairmask, 0), D = (A, k) => Y[Math.min(o.h - 1, Math.max(0, Math.round(k))) * o.w + Math.min(o.w - 1, Math.max(0, Math.round(A)))] / 255, T = new c(e, { padTop: t.padTop ?? n.view.padTop, padSide: t.padSide ?? n.view.padSide, fit: t.fit }), H = { base: [0, 0, o.w, o.h], ...E.layers }, j = new w(), I = (A) => {
    const k = `cloth_${A.name}`, G = p(H[k], n.mesh.clothCell ?? 8, We($[k]), $[k].width);
    j.attach(A.name, G), T.addLayer(k, $[k], G);
  };
  a.filter((A) => A.behind).forEach(I);
  const F = p(H.base, n.mesh.baseCell, We($.base), $.base.width, n.mesh.fine), N = [];
  for (let A = 0; A < F.rest.length / 2; A++) {
    const k = F.rest[A * 2], G = F.rest[A * 2 + 1];
    N.push(i(k, G, D(k, G)));
  }
  T.addLayer("base", $.base, F, { face: !0 });
  const C = [];
  s.forEach((A, k) => {
    for (const G of Mn) {
      const ie = `eye${k}_${G}`, le = p(H[ie], G === "ball" ? n.mesh.eyeBallCell : n.mesh.eyeCell, We($[ie]), $[ie].width), ge = [];
      for (let Ee = 0; Ee < le.rest.length / 2; Ee++) ge.push(i(le.rest[Ee * 2], le.rest[Ee * 2 + 1], 0));
      const Me = T.addLayer(ie, $[ie], le, { eyeBall: G === "ball" ? k : void 0 });
      C.push({ e: A, eye: k, part: G, mesh: le, W: ge, layer: Me });
    }
  });
  let V = null;
  try {
    {
      const A = await $t(b("sprites/sprites.json")), k = Object.fromEntries(await Promise.all(Object.keys(A.layers).map(async (G) => [G, await Yt(b(`sprites/${G}.png`, A.build))])));
      V = g(T, A, k, p, We);
    }
  } catch (A) {
    console.warn("eye / mouth sprites not loaded:", A);
  }
  a.filter((A) => !A.behind).forEach(I);
  let oe = null;
  try {
    const A = await $t(b("overlays/overlays.json")), k = Object.fromEntries(await Promise.all(A.overlays.map(async (G) => [G.name, await Yt(b(`overlays/${G.file}`))])));
    oe = kr(T, A, k, p, We, i, n.mesh.spriteCell, o.w, o.h, qr);
  } catch (A) {
    t.assets?.["overlays/overlays.json"] && console.warn("overlay layers not loaded:", A);
  }
  const K = f.map((A) => {
    const k = p(H[A.name], n.mesh.tasselCell, We($[A.name]), $[A.name].width);
    return T.addLayer(A.name, $[A.name], k);
  }), U = n.hand ? p(H.hand, n.mesh.handCell, We($.hand), $.hand.width) : { rest: [], pos: [] }, Q = [];
  for (let A = 0; A < U.rest.length / 2; A++) Q.push(m(U.rest[A * 2], U.rest[A * 2 + 1]));
  n.hand && T.addLayer("hand", $.hand, U);
  const q = new d(), Z = new Pr(n.view.gazeCenter ?? [n.head.cx, n.head.cy], !!n.legs, n.arms ? n : null);
  t.lipSync !== void 0 && Z.setLipSync(t.lipSync);
  const se = /* @__PURE__ */ new Set();
  Z.onMotion = (A) => {
    for (const k of se) k(A);
  };
  let ne = {}, ae = 1, P = {}, M = {};
  const S = new Wr(t.expressions === void 0 ? void 0 : on(t.expressions));
  let R = !0;
  const O = [0, 0];
  function B(A) {
    const k = { ...Z.update(A) };
    for (const [le, ge] of Object.entries(ne)) {
      const Me = ae * (P[le] ?? 1);
      k[le] = Me === 1 ? ge : (k[le] ?? 0) + (ge - (k[le] ?? 0)) * Me;
    }
    Z.lipOpen !== null && (k.mouthOpen = Z.P.mouthOpen, (!t.preserveMouthForm || ne.mouthForm === void 0) && (k.mouthForm = Z.P.mouthForm));
    const G = S.apply(k, A), ie = R ? G : k;
    return M = ie, ie;
  }
  function z(A) {
    const k = B(A), G = q.step(k, A), ie = F.pos, le = F.rest;
    for (let ee = 0; ee < N.length; ee++)
      u(le[ee * 2], le[ee * 2 + 1], N[ee], k, G, O), ie[ee * 2] = O[0], ie[ee * 2 + 1] = O[1];
    const ge = (ee, ce) => V?.eyesDrawn[ce] ? 1 : ee;
    for (const ee of C) {
      const ce = ge(ee.eye === 0 ? k.eyeROpen : k.eyeLOpen, ee.eye), _e = ee.eye === 0 ? k.eyeSmile : k.eyeSmileL ?? k.eyeSmile;
      ee.layer.alpha = y(ee.part, ce, _e);
      const Oe = ee.mesh.rest, Te = ee.mesh.pos;
      for (let be = 0; be < ee.W.length; be++) {
        const Ue = Oe[be * 2], Ze = Oe[be * 2 + 1];
        u(Ue, v(ee.e, ee.part, Ue, Ze, ce, _e), ee.W[be], k, G, O), Te[be * 2] = O[0], Te[be * 2 + 1] = O[1];
      }
    }
    const Me = V?.update(k, G, A, Tr(S.name, Z.mode === "manual" ? null : Z.expr));
    if (Me) for (const ee of C) Me.eyes[ee.eye] && (ee.layer.alpha = 0);
    oe?.update(k, G, u, O);
    const Ee = U.pos, ve = U.rest, pe = l(k);
    for (let ee = 0; ee < Q.length; ee++)
      h(ve[ee * 2], ve[ee * 2 + 1], Q[ee], k, pe, O), Ee[ee * 2] = O[0], Ee[ee * 2 + 1] = O[1];
    q.chains.forEach((ee, ce) => Jr(ee, K[ce].mesh)), a.length && (j.step(k, A, G), j.deform());
    const fe = n.view.irisTravel ?? 7;
    T.draw({
      angleX: k.angleX,
      angleY: k.angleY,
      angleZ: k.angleZ,
      eyes: [
        ge(k.eyeROpen, 0),
        k.eyeSmile,
        k.gazeX * fe,
        -k.gazeY * fe * 0.6,
        ge(k.eyeLOpen, 1),
        k.eyeSmileL ?? k.eyeSmile,
        k.gazeX * fe * 0.85,
        -k.gazeY * fe * 0.6
      ],
      // with sprites the drawn mouths replace the shader-painted one
      mouthOpen: Me?.mouthDrawn ? 0 : k.mouthOpen,
      mouthForm: k.mouthForm,
      cheek: k.blush,
      showMesh: !1,
      originalAlpha: 0,
      joints: []
    });
  }
  let L = 0, J = performance.now(), W = !1;
  const re = (A) => {
    const k = Math.min(0.05, (A - J) / 1e3);
    J = A, z(k), L = requestAnimationFrame(re);
  };
  return t.manual || (L = requestAnimationFrame(re)), {
    motions: [
      ...Object.entries(nn).map(([A, k]) => ({ id: A, label: k.label, idle: !1 })),
      ...Object.entries(rn).map(([A, k]) => ({ id: A, label: k.label, idle: !0 }))
    ],
    setParameters(A, k = 1, G = {}) {
      ne = { ...A }, ae = Math.min(1, Math.max(0, Number(k) || 0)), P = Object.fromEntries(Object.entries(G ?? {}).map(([ie, le]) => [ie, Math.min(1, Math.max(0, Number(le) || 0))]));
    },
    getParameters() {
      return { ...M };
    },
    /** 0..1 loudness of the voice being played (e.g. normalised RMS). */
    setVoiceLevel(A) {
      Z.setVoiceLevel(A);
    },
    /** Partial mouth-movement settings; omitted fields retain their current values. */
    setLipSync(A) {
      Z.setLipSync(A);
    },
    /** true while TTS audio is playing: idle motions pause and the head nods along. */
    setSpeaking(A) {
      Z.setSpeaking(A);
    },
    /** AITuber OnAir emotion tag: happy / sad / angry / surprised / relaxed / neutral (or null). */
    setEmotion(A, k) {
      Z.setEmotion(A, k);
    },
    /** Live expression layered over tracking (see OVERLAY_EXPRESSIONS); 'neutral' clears it. */
    // parameters:false selects drawn expression sprites without changing numeric parameters.
    setExpression(A, { parameters: k = !0 } = {}) {
      S.set(A), R = k;
    },
    /** Show the named overlay layers (built/overlays/overlays.json) and hide the others. */
    setOverlays(A) {
      oe?.set(A);
    },
    getExpression() {
      return { name: S.name, active: S.active };
    },
    /** How much the head moves with the voice while speaking (1 = default, calmer below). */
    setTalkGain(A) {
      Z.talkGain = Math.max(0, Number(A) || 0);
    },
    /** Play a motion or idle motion by id (see `motions`). */
    play(A) {
      Z.hasMotion(A) && Z.playMotion(A);
    },
    /** Move the mouth through the vowels of kana text (no audio; for previews). */
    speakKana(A, k) {
      Z.speakKana(String(A ?? ""), k);
    },
    holdMouth(A) {
      Z.holdMouth(A);
    },
    stopLipSync() {
      Z.stopLipSync();
    },
    getLipSyncState() {
      return Z.getLipSyncState();
    },
    setAutoIdle(A) {
      Z.autoIdle = !!A;
    },
    setLighting(A) {
      T.setLighting(A);
    },
    getLightingStats() {
      return { ...T.lightingStats };
    },
    setAutoMotion(A) {
      Z.autoMotion = !!A;
    },
    /** Hair / tassel sway multiplier (1 = default). */
    setSwayGain(A) {
      q.gain = A, j.gain = A;
    },
    setClothTuning(A, k) {
      j.setTuning(A, k);
    },
    /** Called with the motion id when a motion starts and with null when it ends. */
    onMotion(A) {
      return se.add(A), () => se.delete(A);
    },
    /** Advance the simulation by `sec` and draw (for tests / hidden tabs). */
    advance(A, k = 60) {
      if (!W)
        if (A === 0) z(0);
        else for (let G = 0; G < Math.round(A * k); G++) z(1 / k);
    },
    /** Update motion and lip sync without drawing a hidden preview. */
    advanceParameters(A) {
      W || B(A);
    },
    destroy() {
      W || (W = !0, cancelAnimationFrame(L), se.clear(), T.destroy());
    }
  };
}
const Ro = Object.keys(Ot);
async function Qr(e, t) {
  return Kr(e, { ...t, rig: en(t.rig) });
}
function rt(e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new Error("avatar.json: expected an object");
  const t = e, n = [];
  t.format !== "mesh-avatar" && n.push('avatar.json.format: expected "mesh-avatar"'), t.version !== 1 && n.push(`avatar.json.version: unsupported version ${JSON.stringify(t.version) ?? "missing"} (expected 1)`), (typeof t.name != "string" || !t.name.trim()) && n.push("avatar.json.name: expected a non-empty string");
  const r = { format: "mesh-avatar", version: 1, name: t.name };
  for (const o of ["author", "license", "thumbnail", "source"])
    t[o] !== void 0 && (typeof t[o] != "string" ? n.push(`avatar.json.${o}: expected a string`) : r[o] = t[o]);
  if (t.studio !== void 0) {
    const o = t.studio;
    !o || typeof o != "object" || Array.isArray(o) || !("version" in o) || typeof o.version != "string" || !o.version.trim() ? n.push("avatar.json.studio.version: expected a non-empty string") : r.studio = { version: o.version };
  }
  if (t.lipSync !== void 0)
    try {
      r.lipSync = tn(t.lipSync);
    } catch (o) {
      n.push(`avatar.json.lipSync: ${o instanceof Error ? o.message : String(o)}`);
    }
  if (t.expressions !== void 0)
    try {
      r.expressions = on(t.expressions);
    } catch (o) {
      n.push(`avatar.json.expressions: ${o instanceof Error ? o.message : String(o)}`);
    }
  if (n.length) throw new Error(n.join(`
`));
  return r;
}
function In(e) {
  return rt({ format: "mesh-avatar", version: 1, name: e });
}
const Mt = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ge = (e, t) => Array.isArray(e) && e.length === t && e.every((n) => typeof n == "number" && Number.isFinite(n)), It = (e, t) => Object.hasOwn(e, t);
function Nn(e) {
  const t = [];
  function n(f, c = !0) {
    if (!It(e, f)) {
      c && t.push(`${f}: missing file`);
      return;
    }
    const p = e[f];
    if (!(p instanceof Uint8Array)) {
      t.push(`${f}: JSON bytes are required`);
      return;
    }
    let d;
    try {
      d = JSON.parse(new TextDecoder("utf-8", { fatal: !0 }).decode(p));
    } catch {
      t.push(`${f}: invalid UTF-8 JSON`);
      return;
    }
    if (!Mt(d)) {
      t.push(`${f}: expected an object`);
      return;
    }
    return d;
  }
  function r(f, c, p = !0) {
    return f.version === 1 || p && f.version === void 0 ? !0 : (t.push(`${c}.version: unsupported version ${JSON.stringify(f.version) ?? "missing"} (expected 1)`), !1);
  }
  function o(f) {
    if (!It(e, f)) {
      t.push(`${f}: missing file`);
      return;
    }
    const c = e[f], p = c instanceof Uint8Array ? c.byteLength : c?.size;
    (!Number.isSafeInteger(p) || p <= 0) && t.push(`${f}: expected a non-empty file`);
  }
  function s(f, c, p, d) {
    if (!Mt(f)) {
      t.push(`${c}.layers: expected a layer rectangle map`);
      return;
    }
    for (const [w, a] of Object.entries(f)) {
      const g = `${c}.layers.${w}`;
      if (!/^[A-Za-z0-9_-]+$/.test(w)) {
        t.push(`${g}: expected a safe layer name (letters, digits, hyphens or underscores)`);
        continue;
      }
      !Ge(a, 4) || !a.every(Number.isInteger) || a[0] < 0 || a[1] < 0 || a[2] <= 0 || a[3] <= 0 ? t.push(`${g}: expected [x, y, width, height] with non-negative integer origins and positive integer dimensions`) : d && (a[0] + a[2] > d[0] || a[1] + a[3] > d[1]) && t.push(`${g}: rectangle must stay inside the image`), o(`${p}/${w}.png`);
    }
    return f;
  }
  function i(f, c) {
    (typeof f.build != "string" || !f.build.trim()) && t.push(`${c}.build: expected a non-empty string`);
  }
  const u = n("avatar.json", !1);
  if (u)
    try {
      rt(u);
    } catch (f) {
      t.push(f.message);
    }
  const v = n("rig.json");
  let y;
  if (v && r(v, "rig.json", !1)) {
    const f = Ln(v);
    t.push(...f.map((c) => `rig.json: ${c}`)), f.length || (y = v);
  }
  o("built/base.png"), o("built/hairmask.png"), y?.cloth?.length && o("built/base_cloth.png");
  const m = n("built/layers.json");
  if (m && r(m, "built/layers.json")) {
    i(m, "built/layers.json");
    let f;
    !Ge(m.size, 2) || !m.size.every((p) => Number.isInteger(p) && p > 0) ? t.push("built/layers.json.size: expected [width, height] with positive integer dimensions") : (f = m.size, y && (f[0] !== y.image.width || f[1] !== y.image.height) && t.push("built/layers.json.size: must match rig.json.image"));
    const c = s(m.layers, "built/layers.json", "built", f);
    if (y && c) {
      const p = [
        ...y.eyes.flatMap((d, w) => ["ball", "low", "crease", "lash"].map((a) => `eye${w}_${a}`)),
        ...y.hand ? ["hand"] : [],
        ...(y.accessories ?? []).map((d) => d.name),
        ...(y.cloth ?? []).map((d) => `cloth_${d.name}`)
      ];
      for (const d of p) It(c, d) || t.push(`built/layers.json.layers.${d}: missing required layer`);
    }
    !Array.isArray(m.eyes) || m.eyes.length !== 2 ? t.push("built/layers.json.eyes: expected two eye curves") : m.eyes.forEach((p, d) => {
      const w = `built/layers.json.eyes[${d}]`;
      if (!Mt(p)) {
        t.push(`${w}: expected an object`);
        return;
      }
      Ge([p.x0, p.x1], 2) && p.x0 < p.x1 || t.push(`${w}: expected finite x0 < x1`);
      for (const g of ["top", "bot"])
        Ge(p[g], 24) || t.push(`${w}.${g}: expected 24 finite numbers`);
      if (Ge(p.top, 24) && Ge(p.bot, 24) && p.top.some((g, x) => g > p.bot[x]) && t.push(`${w}.top: must not exceed bottom curve`), y) for (const g of ["x0", "x1", "top", "bot"]) {
        const x = p[g], b = y.eyes[d][g];
        (Array.isArray(b) ? Ge(x, b.length) && x.every((_, X) => _ === b[X]) : x === b) || t.push(`${w}.${g}: must match rig.json.eyes[${d}].${g}`);
      }
    });
  }
  const l = n("built/sprites/sprites.json", !1);
  l && r(l, "built/sprites/sprites.json") && (i(l, "built/sprites/sprites.json"), s(l.layers, "built/sprites/sprites.json", "built/sprites", y ? [y.image.width, y.image.height] : void 0));
  const h = n("built/overlays/overlays.json", !1);
  if (h && r(h, "built/overlays/overlays.json"))
    if (!Array.isArray(h.overlays)) t.push("built/overlays/overlays.json.overlays: expected an array");
    else {
      const f = /* @__PURE__ */ new Set();
      for (const [c, p] of h.overlays.entries()) {
        const d = `built/overlays/overlays.json.overlays[${c}]`;
        if (!Mt(p) || typeof p.name != "string" || !/^[A-Za-z0-9_-]+$/.test(p.name) || typeof p.file != "string" || !/^[A-Za-z0-9_-]+\.png$/.test(p.file)) {
          t.push(`${d}: expected { name, file } with safe names`);
          continue;
        }
        f.has(p.name) && t.push(`${d}.name: duplicate overlay name`), f.add(p.name), o(`built/overlays/${p.file}`);
      }
    }
  return t;
}
var ye = Uint8Array, Le = Uint16Array, sn = Int32Array, Tt = new ye([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), Rt = new ye([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), Ht = new ye([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Xn = function(e, t) {
  for (var n = new Le(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new sn(n[30]), r = 1; r < 30; ++r)
    for (var s = n[r]; s < n[r + 1]; ++s)
      o[s] = s - n[r] << 5 | r;
  return { b: n, r: o };
}, zn = Xn(Tt, 2), Cn = zn.b, Vt = zn.r;
Cn[28] = 258, Vt[258] = 28;
var Dn = Xn(Rt, 0), eo = Dn.b, An = Dn.r, Zt = new Le(32768);
for (var me = 0; me < 32768; ++me) {
  var He = (me & 43690) >> 1 | (me & 21845) << 1;
  He = (He & 52428) >> 2 | (He & 13107) << 2, He = (He & 61680) >> 4 | (He & 3855) << 4, Zt[me] = ((He & 65280) >> 8 | (He & 255) << 8) >> 1;
}
var Ne = (function(e, t, n) {
  for (var r = e.length, o = 0, s = new Le(t); o < r; ++o)
    e[o] && ++s[e[o] - 1];
  var i = new Le(t);
  for (o = 1; o < t; ++o)
    i[o] = i[o - 1] + s[o - 1] << 1;
  var u;
  if (n) {
    u = new Le(1 << t);
    var v = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var y = o << 4 | e[o], m = t - e[o], l = i[e[o] - 1]++ << m, h = l | (1 << m) - 1; l <= h; ++l)
          u[Zt[l] >> v] = y;
  } else
    for (u = new Le(r), o = 0; o < r; ++o)
      e[o] && (u[o] = Zt[i[e[o] - 1]++] >> 15 - e[o]);
  return u;
}), Ve = new ye(288);
for (var me = 0; me < 144; ++me)
  Ve[me] = 8;
for (var me = 144; me < 256; ++me)
  Ve[me] = 9;
for (var me = 256; me < 280; ++me)
  Ve[me] = 7;
for (var me = 280; me < 288; ++me)
  Ve[me] = 8;
var dt = new ye(32);
for (var me = 0; me < 32; ++me)
  dt[me] = 5;
var to = /* @__PURE__ */ Ne(Ve, 9, 0), no = /* @__PURE__ */ Ne(Ve, 9, 1), ro = /* @__PURE__ */ Ne(dt, 5, 0), oo = /* @__PURE__ */ Ne(dt, 5, 1), Nt = function(e) {
  for (var t = e[0], n = 1; n < e.length; ++n)
    e[n] > t && (t = e[n]);
  return t;
}, $e = function(e, t, n) {
  var r = t / 8 | 0;
  return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Xt = function(e, t) {
  var n = t / 8 | 0;
  return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, an = function(e) {
  return (e + 7) / 8 | 0;
}, gt = function(e, t, n) {
  return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new ye(e.subarray(t, n));
}, so = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], Ae = function(e, t, n) {
  var r = new Error(t || so[e]);
  if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, Ae), !n)
    throw r;
  return r;
}, ao = function(e, t, n, r) {
  var o = e.length, s = r ? r.length : 0;
  if (!o || t.f && !t.l)
    return n || new ye(0);
  var i = !n, u = i || t.i != 2, v = t.i;
  i && (n = new ye(o * 3));
  var y = function(S) {
    var R = n.length;
    if (S > R) {
      var O = new ye(Math.max(R * 2, S));
      O.set(n), n = O;
    }
  }, m = t.f || 0, l = t.p || 0, h = t.b || 0, f = t.l, c = t.d, p = t.m, d = t.n, w = o * 8;
  do {
    if (!f) {
      m = $e(e, l, 1);
      var a = $e(e, l + 1, 3);
      if (l += 3, a)
        if (a == 1)
          f = no, c = oo, p = 9, d = 5;
        else if (a == 2) {
          var E = $e(e, l, 31) + 257, _ = $e(e, l + 10, 15) + 4, X = E + $e(e, l + 5, 31) + 1;
          l += 14;
          for (var $ = new ye(X), Y = new ye(19), D = 0; D < _; ++D)
            Y[Ht[D]] = $e(e, l + D * 3, 7);
          l += _ * 3;
          for (var T = Nt(Y), H = (1 << T) - 1, j = Ne(Y, T, 1), D = 0; D < X; ) {
            var I = j[$e(e, l, H)];
            l += I & 15;
            var g = I >> 4;
            if (g < 16)
              $[D++] = g;
            else {
              var F = 0, N = 0;
              for (g == 16 ? (N = 3 + $e(e, l, 3), l += 2, F = $[D - 1]) : g == 17 ? (N = 3 + $e(e, l, 7), l += 3) : g == 18 && (N = 11 + $e(e, l, 127), l += 7); N--; )
                $[D++] = F;
            }
          }
          var C = $.subarray(0, E), V = $.subarray(E);
          p = Nt(C), d = Nt(V), f = Ne(C, p, 1), c = Ne(V, d, 1);
        } else
          Ae(1);
      else {
        var g = an(l) + 4, x = e[g - 4] | e[g - 3] << 8, b = g + x;
        if (b > o) {
          v && Ae(0);
          break;
        }
        u && y(h + x), n.set(e.subarray(g, b), h), t.b = h += x, t.p = l = b * 8, t.f = m;
        continue;
      }
      if (l > w) {
        v && Ae(0);
        break;
      }
    }
    u && y(h + 131072);
    for (var oe = (1 << p) - 1, K = (1 << d) - 1, U = l; ; U = l) {
      var F = f[Xt(e, l) & oe], Q = F >> 4;
      if (l += F & 15, l > w) {
        v && Ae(0);
        break;
      }
      if (F || Ae(2), Q < 256)
        n[h++] = Q;
      else if (Q == 256) {
        U = l, f = null;
        break;
      } else {
        var q = Q - 254;
        if (Q > 264) {
          var D = Q - 257, Z = Tt[D];
          q = $e(e, l, (1 << Z) - 1) + Cn[D], l += Z;
        }
        var se = c[Xt(e, l) & K], ne = se >> 4;
        se || Ae(3), l += se & 15;
        var V = eo[ne];
        if (ne > 3) {
          var Z = Rt[ne];
          V += Xt(e, l) & (1 << Z) - 1, l += Z;
        }
        if (l > w) {
          v && Ae(0);
          break;
        }
        u && y(h + 131072);
        var ae = h + q;
        if (h < V) {
          var P = s - V, M = Math.min(V, ae);
          for (P + h < 0 && Ae(3); h < M; ++h)
            n[h] = r[P + h];
        }
        for (; h < ae; ++h)
          n[h] = n[h - V];
      }
    }
    t.l = f, t.p = U, t.b = h, t.f = m, f && (m = 1, t.m = p, t.d = c, t.n = d);
  } while (!m);
  return h != n.length && i ? gt(n, 0, h) : n.subarray(0, h);
}, Ce = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, ht = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, zt = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, s = n.slice();
  if (!o)
    return { t: Hn, l: 0 };
  if (o == 1) {
    var i = new ye(n[0].s + 1);
    return i[n[0].s] = 1, { t: i, l: 1 };
  }
  n.sort(function(b, E) {
    return b.f - E.f;
  }), n.push({ s: -1, f: 25001 });
  var u = n[0], v = n[1], y = 0, m = 1, l = 2;
  for (n[0] = { s: -1, f: u.f + v.f, l: u, r: v }; m != o - 1; )
    u = n[n[y].f < n[l].f ? y++ : l++], v = n[y != m && n[y].f < n[l].f ? y++ : l++], n[m++] = { s: -1, f: u.f + v.f, l: u, r: v };
  for (var h = s[0].s, r = 1; r < o; ++r)
    s[r].s > h && (h = s[r].s);
  var f = new Le(h + 1), c = Wt(n[m - 1], f, 0);
  if (c > t) {
    var r = 0, p = 0, d = c - t, w = 1 << d;
    for (s.sort(function(E, _) {
      return f[_.s] - f[E.s] || E.f - _.f;
    }); r < o; ++r) {
      var a = s[r].s;
      if (f[a] > t)
        p += w - (1 << c - f[a]), f[a] = t;
      else
        break;
    }
    for (p >>= d; p > 0; ) {
      var g = s[r].s;
      f[g] < t ? p -= 1 << t - f[g]++ - 1 : ++r;
    }
    for (; r >= 0 && p; --r) {
      var x = s[r].s;
      f[x] == t && (--f[x], ++p);
    }
    c = t;
  }
  return { t: new ye(f), l: c };
}, Wt = function(e, t, n) {
  return e.s == -1 ? Math.max(Wt(e.l, t, n + 1), Wt(e.r, t, n + 1)) : t[e.s] = n;
}, En = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new Le(++t), r = 0, o = e[0], s = 1, i = function(v) {
    n[r++] = v;
  }, u = 1; u <= t; ++u)
    if (e[u] == o && u != t)
      ++s;
    else {
      if (!o && s > 2) {
        for (; s > 138; s -= 138)
          i(32754);
        s > 2 && (i(s > 10 ? s - 11 << 5 | 28690 : s - 3 << 5 | 12305), s = 0);
      } else if (s > 3) {
        for (i(o), --s; s > 6; s -= 6)
          i(8304);
        s > 2 && (i(s - 3 << 5 | 8208), s = 0);
      }
      for (; s--; )
        i(o);
      s = 1, o = e[u];
    }
  return { c: n.subarray(0, r), n: t };
}, ut = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, Pn = function(e, t, n) {
  var r = n.length, o = an(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var s = 0; s < r; ++s)
    e[o + s + 4] = n[s];
  return (o + 4 + r) * 8;
}, Sn = function(e, t, n, r, o, s, i, u, v, y, m) {
  Ce(t, m++, n), ++o[256];
  for (var l = zt(o, 15), h = l.t, f = l.l, c = zt(s, 15), p = c.t, d = c.l, w = En(h), a = w.c, g = w.n, x = En(p), b = x.c, E = x.n, _ = new Le(19), X = 0; X < a.length; ++X)
    ++_[a[X] & 31];
  for (var X = 0; X < b.length; ++X)
    ++_[b[X] & 31];
  for (var $ = zt(_, 7), Y = $.t, D = $.l, T = 19; T > 4 && !Y[Ht[T - 1]]; --T)
    ;
  var H = y + 5 << 3, j = ut(o, Ve) + ut(s, dt) + i, I = ut(o, h) + ut(s, p) + i + 14 + 3 * T + ut(_, Y) + 2 * _[16] + 3 * _[17] + 7 * _[18];
  if (v >= 0 && H <= j && H <= I)
    return Pn(t, m, e.subarray(v, v + y));
  var F, N, C, V;
  if (Ce(t, m, 1 + (I < j)), m += 2, I < j) {
    F = Ne(h, f, 0), N = h, C = Ne(p, d, 0), V = p;
    var oe = Ne(Y, D, 0);
    Ce(t, m, g - 257), Ce(t, m + 5, E - 1), Ce(t, m + 10, T - 4), m += 14;
    for (var X = 0; X < T; ++X)
      Ce(t, m + 3 * X, Y[Ht[X]]);
    m += 3 * T;
    for (var K = [a, b], U = 0; U < 2; ++U)
      for (var Q = K[U], X = 0; X < Q.length; ++X) {
        var q = Q[X] & 31;
        Ce(t, m, oe[q]), m += Y[q], q > 15 && (Ce(t, m, Q[X] >> 5 & 127), m += Q[X] >> 12);
      }
  } else
    F = to, N = Ve, C = ro, V = dt;
  for (var X = 0; X < u; ++X) {
    var Z = r[X];
    if (Z > 255) {
      var q = Z >> 18 & 31;
      ht(t, m, F[q + 257]), m += N[q + 257], q > 7 && (Ce(t, m, Z >> 23 & 31), m += Tt[q]);
      var se = Z & 31;
      ht(t, m, C[se]), m += V[se], se > 3 && (ht(t, m, Z >> 5 & 8191), m += Rt[se]);
    } else
      ht(t, m, F[Z]), m += N[Z];
  }
  return ht(t, m, F[256]), m + N[256];
}, io = /* @__PURE__ */ new sn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Hn = /* @__PURE__ */ new ye(0), lo = function(e, t, n, r, o, s) {
  var i = s.z || e.length, u = new ye(r + i + 5 * (1 + Math.ceil(i / 7e3)) + o), v = u.subarray(r, u.length - o), y = s.l, m = (s.r || 0) & 7;
  if (t) {
    m && (v[0] = s.r >> 3);
    for (var l = io[t - 1], h = l >> 13, f = l & 8191, c = (1 << n) - 1, p = s.p || new Le(32768), d = s.h || new Le(c + 1), w = Math.ceil(n / 3), a = 2 * w, g = function(B) {
      return (e[B] ^ e[B + 1] << w ^ e[B + 2] << a) & c;
    }, x = new sn(25e3), b = new Le(288), E = new Le(32), _ = 0, X = 0, $ = s.i || 0, Y = 0, D = s.w || 0, T = 0; $ + 2 < i; ++$) {
      var H = g($), j = $ & 32767, I = d[H];
      if (p[j] = I, d[H] = j, D <= $) {
        var F = i - $;
        if ((_ > 7e3 || Y > 24576) && (F > 423 || !y)) {
          m = Sn(e, v, 0, x, b, E, X, Y, T, $ - T, m), Y = _ = X = 0, T = $;
          for (var N = 0; N < 286; ++N)
            b[N] = 0;
          for (var N = 0; N < 30; ++N)
            E[N] = 0;
        }
        var C = 2, V = 0, oe = f, K = j - I & 32767;
        if (F > 2 && H == g($ - K))
          for (var U = Math.min(h, F) - 1, Q = Math.min(32767, $), q = Math.min(258, F); K <= Q && --oe && j != I; ) {
            if (e[$ + C] == e[$ + C - K]) {
              for (var Z = 0; Z < q && e[$ + Z] == e[$ + Z - K]; ++Z)
                ;
              if (Z > C) {
                if (C = Z, V = K, Z > U)
                  break;
                for (var se = Math.min(K, Z - 2), ne = 0, N = 0; N < se; ++N) {
                  var ae = $ - K + N & 32767, P = p[ae], M = ae - P & 32767;
                  M > ne && (ne = M, I = ae);
                }
              }
            }
            j = I, I = p[j], K += j - I & 32767;
          }
        if (V) {
          x[Y++] = 268435456 | Vt[C] << 18 | An[V];
          var S = Vt[C] & 31, R = An[V] & 31;
          X += Tt[S] + Rt[R], ++b[257 + S], ++E[R], D = $ + C, ++_;
        } else
          x[Y++] = e[$], ++b[e[$]];
      }
    }
    for ($ = Math.max($, D); $ < i; ++$)
      x[Y++] = e[$], ++b[e[$]];
    m = Sn(e, v, y, x, b, E, X, Y, T, $ - T, m), y || (s.r = m & 7 | v[m / 8 | 0] << 3, m -= 7, s.h = d, s.p = p, s.i = $, s.w = D);
  } else {
    for (var $ = s.w || 0; $ < i + y; $ += 65535) {
      var O = $ + 65535;
      O >= i && (v[m / 8 | 0] = y, O = i), m = Pn(v, m + 1, e.subarray($, O));
    }
    s.i = i;
  }
  return gt(u, 0, r + an(m) + o);
}, co = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ho = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = co[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, uo = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var s = t.dictionary.subarray(-32768), i = new ye(s.length + e.length);
    i.set(s), i.set(e, s.length), e = i, o.w = s.length;
  }
  return lo(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Vn = function(e, t) {
  var n = {};
  for (var r in e)
    n[r] = e[r];
  for (var r in t)
    n[r] = t[r];
  return n;
}, Ie = function(e, t) {
  return e[t] | e[t + 1] << 8;
}, je = function(e, t) {
  return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Ct = function(e, t) {
  return je(e, t) + je(e, t + 4) * 4294967296;
}, xe = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
};
function fo(e, t) {
  return uo(e, t || {}, 0, 0);
}
function mo(e, t) {
  return ao(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var Zn = function(e, t, n, r) {
  for (var o in e) {
    var s = e[o], i = t + o, u = r;
    Array.isArray(s) && (u = Vn(r, s[1]), s = s[0]), ArrayBuffer.isView(s) ? n[i] = [s, u] : (n[i += "/"] = [new ye(0), u], Zn(s, i, n, r));
  }
}, On = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Gt = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), po = 0;
try {
  Gt.decode(Hn, { stream: !0 }), po = 1;
} catch {
}
var go = function(e) {
  for (var t = "", n = 0; ; ) {
    var r = e[n++], o = (r > 127) + (r > 223) + (r > 239);
    if (n + o > e.length)
      return { s: t, r: gt(e, n - 1) };
    o ? o == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : o & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
  }
};
function Tn(e, t) {
  var n;
  if (On)
    return On.encode(e);
  for (var r = e.length, o = new ye(e.length + (e.length >> 1)), s = 0, i = function(y) {
    o[s++] = y;
  }, n = 0; n < r; ++n) {
    if (s + 5 > o.length) {
      var u = new ye(s + 8 + (r - n << 1));
      u.set(o), o = u;
    }
    var v = e.charCodeAt(n);
    v < 128 || t ? i(v) : v < 2048 ? (i(192 | v >> 6), i(128 | v & 63)) : v > 55295 && v < 57344 ? (v = 65536 + (v & 1047552) | e.charCodeAt(++n) & 1023, i(240 | v >> 18), i(128 | v >> 12 & 63), i(128 | v >> 6 & 63), i(128 | v & 63)) : (i(224 | v >> 12), i(128 | v >> 6 & 63), i(128 | v & 63));
  }
  return gt(o, 0, s);
}
function yo(e, t) {
  if (t) {
    for (var n = "", r = 0; r < e.length; r += 16384)
      n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
    return n;
  } else {
    if (Gt)
      return Gt.decode(e);
    var o = go(e), s = o.s, n = o.r;
    return n.length && Ae(8), s;
  }
}
var vo = function(e, t) {
  return t + 30 + Ie(e, t + 26) + Ie(e, t + 28);
}, bo = function(e, t, n) {
  var r = Ie(e, t + 28), o = Ie(e, t + 30), s = yo(e.subarray(t + 46, t + 46 + r), !(Ie(e, t + 8) & 2048)), i = t + 46 + r, u = wo(e, i, o, n, je(e, t + 20), je(e, t + 24), je(e, t + 42)), v = u[0], y = u[1], m = u[2];
  return [Ie(e, t + 10), v, y, s, i + o + Ie(e, t + 32), m];
}, wo = function(e, t, n, r, o, s, i) {
  var u = o == 4294967295, v = s == 4294967295, y = i == 4294967295, m = t + n, l = u + v + y;
  if (r && l) {
    for (; t + 4 < m; t += 4 + Ie(e, t + 2))
      if (Ie(e, t) == 1)
        return [
          u ? Ct(e, t + 4 + 8 * v) : o,
          v ? Ct(e, t + 4) : s,
          y ? Ct(e, t + 4 + 8 * (v + u)) : i,
          1
        ];
    r < 2 && Ae(13);
  }
  return [o, s, i, 0];
}, qt = function(e) {
  var t = 0;
  if (e)
    for (var n in e) {
      var r = e[n].length;
      r > 65535 && Ae(9), t += r + 4;
    }
  return t;
}, Rn = function(e, t, n, r, o, s, i, u) {
  var v = r.length, y = n.extra, m = u && u.length, l = qt(y);
  xe(e, t, i != null ? 33639248 : 67324752), t += 4, i != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (s < 0 && 8), e[t++] = o && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
  var h = new Date(n.mtime == null ? Date.now() : n.mtime), f = h.getFullYear() - 1980;
  if ((f < 0 || f > 119) && Ae(10), xe(e, t, f << 25 | h.getMonth() + 1 << 21 | h.getDate() << 16 | h.getHours() << 11 | h.getMinutes() << 5 | h.getSeconds() >> 1), t += 4, s != -1 && (xe(e, t, n.crc), xe(e, t + 4, s < 0 ? -s - 2 : s), xe(e, t + 8, n.size)), xe(e, t + 12, v), xe(e, t + 14, l), t += 16, i != null && (xe(e, t, m), xe(e, t + 6, n.attrs), xe(e, t + 10, i), t += 14), e.set(r, t), t += v, l)
    for (var c in y) {
      var p = y[c], d = p.length;
      xe(e, t, +c), xe(e, t + 2, d), e.set(p, t + 4), t += 4 + d;
    }
  return m && (e.set(u, t), t += m), t;
}, xo = function(e, t, n, r, o) {
  xe(e, t, 101010256), xe(e, t + 8, n), xe(e, t + 10, n), xe(e, t + 12, r), xe(e, t + 16, o);
};
function Mo(e, t) {
  t || (t = {});
  var n = {}, r = [];
  Zn(e, "", n, t);
  var o = 0, s = 0;
  for (var i in n) {
    var u = n[i], v = u[0], y = u[1], m = y.level == 0 ? 0 : 8, l = Tn(i), h = l.length, f = y.comment, c = f && Tn(f), p = c && c.length, d = qt(y.extra);
    h > 65535 && Ae(11);
    var w = m ? fo(v, y) : v, a = w.length, g = ho();
    g.p(v), r.push(Vn(y, {
      size: v.length,
      crc: g.d(),
      c: w,
      f: l,
      m: c,
      u: h != i.length || c && f.length != p,
      o,
      compression: m
    })), o += 30 + h + d + a, s += 76 + 2 * (h + d) + (p || 0) + a;
  }
  for (var x = new ye(s + 22), b = o, E = s - o, _ = 0; _ < r.length; ++_) {
    var l = r[_];
    Rn(x, l.o, l, l.f, l.u, l.c.length);
    var X = 30 + l.f.length + qt(l.extra);
    x.set(l.c, l.o + X), Rn(x, o, l, l.f, l.u, l.c.length, l.o, l.m), o += 16 + X + (l.m ? l.m.length : 0);
  }
  return xo(x, o, r.length, E, b), x;
}
function Ao(e, t) {
  for (var n = {}, r = e.length - 22; je(e, r) != 101010256; --r)
    (!r || e.length - r > 65558) && Ae(13);
  var o = Ie(e, r + 8);
  if (!o)
    return {};
  var s = je(e, r + 16), i = je(e, r - 20) == 117853008;
  if (i) {
    var u = je(e, r - 12);
    i = je(e, u) == 101075792, i && (o = je(e, u + 32), s = je(e, u + 48));
  }
  for (var v = t && t.filter, y = 0; y < o; ++y) {
    var m = bo(e, s, i), l = m[0], h = m[1], f = m[2], c = m[3], p = m[4], d = m[5], w = vo(e, d);
    s = p, (!v || v({
      name: c,
      size: h,
      originalSize: f,
      compression: l
    })) && (l ? l == 8 ? n[c] = mo(e.subarray(w, w + h), { out: new ye(f) }) : Ae(14, "unknown compression type " + l) : n[c] = gt(e, w, w + h));
  }
  return n;
}
const St = 200, Jt = 64 * 1024 * 1024, Kt = new TextDecoder("utf-8", { fatal: !0 });
function ln(e) {
  if (!e || e.startsWith("/") || /^[A-Za-z]:/.test(e) || e.includes("\\") || e.includes("\0") || e.split("/").includes(".."))
    throw new Error(`ZIP entry ${JSON.stringify(e)}: path must be relative, without .. or backslashes`);
}
function Qt(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = (h = "(archive)") => {
    throw new Error(`ZIP entry ${JSON.stringify(h)}: invalid or truncated ZIP`);
  }, r = (h) => h >= 0 && h + 2 <= e.length ? t.getUint16(h, !0) : n(), o = (h) => h >= 0 && h + 4 <= e.length ? t.getUint32(h, !0) : n();
  let s = e.length - 22;
  for (; s >= Math.max(0, e.length - 65557) && !(o(s) === 101010256 && s + 22 + r(s + 20) === e.length); s--)
    ;
  (s < 0 || s < e.length - 65557) && n(), (r(s + 4) || r(s + 6) || r(s + 8) !== r(s + 10)) && n();
  const i = r(s + 10), u = o(s + 16), v = u + o(s + 12);
  v !== s && n();
  const y = [], m = /* @__PURE__ */ new Set();
  let l = u;
  for (let h = 0; h < i; h++) {
    (l + 46 > v || o(l) !== 33639248) && n();
    const f = r(l + 28), c = l + 46 + f + r(l + 30) + r(l + 32);
    c > v && n();
    let p;
    try {
      p = Kt.decode(e.subarray(l + 46, l + 46 + f));
    } catch {
      throw new Error("ZIP entry (invalid UTF-8 name): invalid filename");
    }
    if (ln(p), h >= St) throw new Error(`ZIP entry ${JSON.stringify(p)}: more than ${St} entries`);
    if (m.has(p)) throw new Error(`ZIP entry ${JSON.stringify(p)}: duplicate entry`);
    m.add(p);
    const d = o(l + 24), w = o(l + 20), a = o(l + 42);
    if (d > Jt || w > Jt) throw new Error(`ZIP entry ${JSON.stringify(p)}: exceeds 64 MB`);
    if (r(l + 10) !== 0) throw new Error(`ZIP entry ${JSON.stringify(p)}: expected stored compression (method 0)`);
    if (r(l + 8) & 1) throw new Error(`ZIP entry ${JSON.stringify(p)}: encrypted entries are not supported`);
    (w !== d || a + 30 > u || o(a) !== 67324752) && n(p);
    const g = a + 30 + r(a + 26) + r(a + 28);
    (g + d > u || r(a + 8) !== 0 || r(a + 6) !== r(l + 8)) && n(p);
    let x;
    try {
      x = Kt.decode(e.subarray(a + 30, a + 30 + r(a + 26)));
    } catch {
      n(p);
    }
    x !== p && n(p), y.push({ name: p, offset: a, start: g, size: d, central: l }), l = c;
  }
  return l !== v && n(), { files: y };
}
function Eo(e) {
  const t = e instanceof Uint8Array ? e : new Uint8Array(e), n = Qt(t), r = Ao(t, { filter: (s) => s.name !== "__proto__" }), o = /* @__PURE__ */ Object.create(null);
  for (const s of n.files) {
    const i = s.name === "__proto__" ? t.slice(s.start, s.start + s.size) : r[s.name];
    if (!(i instanceof Uint8Array) || i.length !== s.size) throw new Error(`ZIP entry ${JSON.stringify(s.name)}: invalid size`);
    o[s.name] = i;
  }
  return o;
}
function ko(e, t = {}) {
  const n = Object.hasOwn(e, "avatar.json") ? e["avatar.json"] : void 0, r = n ? rt(JSON.parse(Kt.decode(n))) : In("Avatar"), o = n && !t.manifest ? n : new TextEncoder().encode(JSON.stringify(rt({ ...r, ...t.manifest }), null, 2) + `
`), s = /* @__PURE__ */ Object.create(null);
  s["avatar.json"] = o;
  for (const [h, f] of Object.entries(e)) h !== "avatar.json" && (s[h] = f);
  for (const [h, [f, c]] of Object.entries(s).entries()) {
    if (ln(f), h >= St) throw new Error(`ZIP entry ${JSON.stringify(f)}: more than ${St} entries`);
    if (c.byteLength > Jt) throw new Error(`ZIP entry ${JSON.stringify(f)}: exceeds 64 MB`);
  }
  const i = Nn(s);
  if (i.length) throw new Error(i.join(`
`));
  let u = "proto0000";
  for (let h = 0; Object.hasOwn(s, u); h++) u = `proto${String(h + 1).padStart(4, "0")}`;
  const v = Object.fromEntries(Object.entries(s).map(([h, f]) => [h === "__proto__" ? u : h, f])), y = Mo(v, { level: 0 });
  if (Object.hasOwn(s, "__proto__")) {
    const h = Qt(y).files.find((c) => c.name === u), f = new TextEncoder().encode("__proto__");
    y.set(f, h.offset + 30), y.set(f, h.central + 46);
  }
  const m = Qt(y), l = m.files.find((h) => h.name === "avatar.json");
  if (l.offset !== 0) {
    const h = l.start + l.size - l.offset, f = new Uint8Array(y.length);
    f.set(y.subarray(l.offset, l.offset + h)), f.set(y.subarray(0, l.offset), h), f.set(y.subarray(l.offset + h), l.offset + h);
    const c = new DataView(f.buffer);
    for (const p of m.files) c.setUint32(p.central + 42, p === l ? 0 : p.offset < l.offset ? p.offset + h : p.offset, !0);
    return f;
  }
  return y;
}
const So = (e) => JSON.parse(new TextDecoder("utf-8", { fatal: !0 }).decode(e));
function tt(e, t) {
  try {
    return So(e);
  } catch {
    throw new Error(`${t}: invalid UTF-8 JSON`);
  }
}
function Wn(e, t, n, r) {
  return [
    "layers.json",
    "base.png",
    "hairmask.png",
    ...r?.cloth?.length ? ["base_cloth.png"] : [],
    ...Object.keys(e?.layers ?? {}).map((o) => `${o}.png`),
    ...t ? ["sprites/sprites.json", ...Object.keys(t.layers ?? {}).map((o) => `sprites/${o}.png`)] : [],
    // malformed entries are left to validateAvatarFiles, which reports them
    ...n ? ["overlays/overlays.json", ...(Array.isArray(n.overlays) ? n.overlays : []).flatMap((o) => typeof o?.file == "string" ? [`overlays/${o.file}`] : [])] : []
  ];
}
function Gn(e) {
  const t = Nn(e);
  if (t.length) throw new Error(t.join(`
`));
}
function qn(e) {
  return !!e && typeof e == "object" && "manifest" in e && "rig" in e && "assets" in e && "release" in e;
}
function Dt(e) {
  const t = Eo(e);
  if (!Object.hasOwn(t, "avatar.json")) throw new Error("avatar.json: missing file in .mavatar archive");
  Gn(t);
  const n = rt(tt(t["avatar.json"], "avatar.json")), r = en(tt(t["rig.json"], "rig.json")), o = t["built/overlays/overlays.json"] ? tt(t["built/overlays/overlays.json"], "built/overlays/overlays.json") : void 0, s = Wn(
    tt(t["built/layers.json"], "built/layers.json"),
    t["built/sprites/sprites.json"] ? tt(t["built/sprites/sprites.json"], "built/sprites/sprites.json") : void 0,
    o,
    r
  ), i = {}, u = [], v = () => {
    u.splice(0).forEach((y) => URL.revokeObjectURL(y));
  };
  try {
    for (const y of new Set(s)) {
      const m = URL.createObjectURL(new Blob([new Uint8Array(t[`built/${y}`])], { type: y.endsWith(".json") ? "application/json" : "image/png" }));
      u.push(m), i[y] = m;
    }
  } catch (y) {
    throw v(), y;
  }
  return { manifest: n, rig: r, assets: i, release: v };
}
async function Oo(e, t = {}) {
  if (qn(e)) return e;
  if (e instanceof Blob) return Dt(await e.arrayBuffer());
  if (e instanceof ArrayBuffer || e instanceof Uint8Array) return Dt(e);
  const n = new URL(e, typeof location > "u" ? void 0 : location.href);
  if (/\.mavatar$/i.test(n.pathname)) {
    const d = await fetch(n);
    if (!d.ok) throw new Error(`.mavatar: could not load (${d.status})`);
    return Dt(await d.arrayBuffer());
  }
  n.pathname.endsWith("/") || (n.pathname += "/");
  const r = (d) => {
    const w = new URL(n);
    return w.pathname += d.split("/").map(encodeURIComponent).join("/"), t.version !== void 0 && w.searchParams.set("v", String(t.version)), w.href;
  }, o = {};
  async function s(d, w = !1) {
    const a = await fetch(r(d));
    if (w && (a.status === 404 || a.ok && a.headers.get("content-type")?.includes("text/html"))) return;
    if (!a.ok) throw new Error(`${d}: could not load (${a.status})`);
    const g = new Uint8Array(await a.arrayBuffer());
    return o[d] = g, tt(g, d);
  }
  const i = t.rigFile ?? "rig.json";
  ln(i);
  const [u, v, y, m, l] = await Promise.all([
    s(i),
    s("built/layers.json"),
    s("avatar.json", !0),
    s("built/sprites/sprites.json", !0),
    s("built/overlays/overlays.json", !0)
  ]);
  Array.isArray(u?.eyes) && Array.isArray(v?.eyes) && (u.eyes = u.eyes.map((d, w) => {
    if (!d || typeof d != "object") return d;
    const a = { ...d };
    for (const g of ["x0", "x1", "top", "bot"]) a[g] === void 0 && (a[g] = v.eyes[w]?.[g]);
    return a;
  })), o["rig.json"] = new TextEncoder().encode(JSON.stringify(u));
  const h = Wn(v, m, l, u);
  for (const d of h) d.endsWith(".png") && (o[`built/${d}`] = { size: 1 });
  Gn(o);
  const f = en(u), c = Object.fromEntries(h.map((d) => [d, r(`built/${d}`)])), p = decodeURIComponent(n.pathname.split("/").filter(Boolean).at(-1) ?? "Avatar");
  return { manifest: y === void 0 ? In(p) : rt(y), rig: f, assets: c, release() {
  } };
}
async function Lo(e, t, n = {}) {
  const r = !qn(t), o = await Oo(t);
  try {
    const s = n.lipSync === void 0 ? o.manifest.lipSync : { ...o.manifest.lipSync, ...tn(n.lipSync) }, i = n.expressions === void 0 ? o.manifest.expressions : Gr(o.manifest.expressions, on(n.expressions)), u = await Qr(e, {
      ...n,
      ...s === void 0 ? {} : { lipSync: s },
      ...i === void 0 ? {} : { expressions: i },
      rig: o.rig,
      assets: o.assets
    }), v = u.destroy.bind(u);
    let y = !1;
    return Object.assign(u, { package: o, destroy() {
      if (!y) {
        y = !0;
        try {
          v();
        } finally {
          r && o.release();
        }
      }
    } });
  } catch (s) {
    throw r && o.release(), s;
  }
}
export {
  mt as ARM_DEFAULTS,
  nt as DEFAULT_LIGHTING,
  Ro as LIVE_EXPRESSIONS,
  bt as PARAMS,
  To as colorHex,
  Qr as createMeshAvatar,
  Lo as loadMeshAvatar,
  Oo as openAvatar,
  ko as packAvatar,
  ur as parseLighting,
  rt as parseManifest,
  en as parseRig,
  Eo as unpackAvatar,
  Nn as validateAvatarFiles,
  Ln as validateRig
};
