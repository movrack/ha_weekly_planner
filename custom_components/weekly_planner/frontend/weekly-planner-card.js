/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = globalThis, ke = Gt.ShadowRoot && (Gt.ShadyCSS === void 0 || Gt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Se = Symbol(), Le = /* @__PURE__ */ new WeakMap();
let ci = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== Se) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (ke && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = Le.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Le.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const di = (e) => new ci(typeof e == "string" ? e : e + "", void 0, Se), T = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[n + 1], e[0]);
  return new ci(i, e, Se);
}, Di = (e, t) => {
  if (ke) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), r = Gt.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, e.appendChild(s);
  }
}, Ue = ke ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return di(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ni, defineProperty: zi, getOwnPropertyDescriptor: Ti, getOwnPropertyNames: Ii, getOwnPropertySymbols: ji, getPrototypeOf: Ri } = Object, nt = globalThis, Fe = nt.trustedTypes, Li = Fe ? Fe.emptyScript : "", oe = nt.reactiveElementPolyfillSupport, Ct = (e, t) => e, Yt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Li : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, Ae = (e, t) => !Ni(e, t), We = { attribute: !0, type: String, converter: Yt, reflect: !1, useDefault: !1, hasChanged: Ae };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), nt.litPropertyMetadata ?? (nt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let bt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = We) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, i);
      r !== void 0 && zi(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: r, set: n } = Ti(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const a = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? We;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ct("elementProperties"))) return;
    const t = Ri(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ct("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ct("properties"))) {
      const i = this.properties, s = [...Ii(i), ...ji(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) i.unshift(Ue(r));
    } else t !== void 0 && i.push(Ue(t));
    return i;
  }
  static _$Eu(t, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((i) => this.enableUpdating = i), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((i) => i(this));
  }
  addController(t) {
    var i;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) == null || i.call(t));
  }
  removeController(t) {
    var i;
    (i = this._$EO) == null || i.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Di(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((i) => {
      var s;
      return (s = i.hostConnected) == null ? void 0 : s.call(i);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var s;
      return (s = i.hostDisconnected) == null ? void 0 : s.call(i);
    });
  }
  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }
  _$ET(t, i) {
    var n;
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : Yt).toAttribute(i, s.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, i) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), d = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : Yt;
      this._$Em = r;
      const _ = d.fromAttribute(i, a.type);
      this[r] = _ ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? _, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, r = !1, n) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (r === !1 && (n = this[t]), s ?? (s = a.getPropertyOptions(t)), !((s.hasChanged ?? Ae)(n, i) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? i ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: a } = o, d = this[n];
        a !== !0 || this._$AL.has(n) || d === void 0 || this.C(n, void 0, o, d);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), (s = this._$EO) == null || s.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(i)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var i;
    (i = this._$EO) == null || i.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((i) => this._$ET(i, this[i]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
bt.elementStyles = [], bt.shadowRootOptions = { mode: "open" }, bt[Ct("elementProperties")] = /* @__PURE__ */ new Map(), bt[Ct("finalized")] = /* @__PURE__ */ new Map(), oe == null || oe({ ReactiveElement: bt }), (nt.reactiveElementVersions ?? (nt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = globalThis, He = (e) => e, Xt = Ot.trustedTypes, qe = Xt ? Xt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, hi = "$lit$", st = `lit$${Math.random().toFixed(9).slice(2)}$`, pi = "?" + st, Ui = `<${pi}>`, mt = document, zt = () => mt.createComment(""), Tt = (e) => e === null || typeof e != "object" && typeof e != "function", Ee = Array.isArray, Fi = (e) => Ee(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", ae = `[ 	
\f\r]`, Pt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, Ve = />/g, ct = RegExp(`>|${ae}(?:([^\\s"'>=/]+)(${ae}*=${ae}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ke = /'/g, Je = /"/g, ui = /^(?:script|style|textarea|title)$/i, _i = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = _i(1), R = _i(2), wt = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Ge = /* @__PURE__ */ new WeakMap(), ht = mt.createTreeWalker(mt, 129);
function mi(e, t) {
  if (!Ee(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qe !== void 0 ? qe.createHTML(t) : t;
}
const Wi = (e, t) => {
  const i = e.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Pt;
  for (let a = 0; a < i; a++) {
    const d = e[a];
    let _, f, v = -1, x = 0;
    for (; x < d.length && (o.lastIndex = x, f = o.exec(d), f !== null); ) x = o.lastIndex, o === Pt ? f[1] === "!--" ? o = Be : f[1] !== void 0 ? o = Ve : f[2] !== void 0 ? (ui.test(f[2]) && (r = RegExp("</" + f[2], "g")), o = ct) : f[3] !== void 0 && (o = ct) : o === ct ? f[0] === ">" ? (o = r ?? Pt, v = -1) : f[1] === void 0 ? v = -2 : (v = o.lastIndex - f[2].length, _ = f[1], o = f[3] === void 0 ? ct : f[3] === '"' ? Je : Ke) : o === Je || o === Ke ? o = ct : o === Be || o === Ve ? o = Pt : (o = ct, r = void 0);
    const y = o === ct && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Pt ? d + Ui : v >= 0 ? (s.push(_), d.slice(0, v) + hi + d.slice(v) + st + y) : d + st + (v === -2 ? a : y);
  }
  return [mi(e, n + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class It {
  constructor({ strings: t, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, d = this.parts, [_, f] = Wi(t, i);
    if (this.el = It.createElement(_, s), ht.currentNode = this.el.content, i === 2 || i === 3) {
      const v = this.el.content.firstChild;
      v.replaceWith(...v.childNodes);
    }
    for (; (r = ht.nextNode()) !== null && d.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const v of r.getAttributeNames()) if (v.endsWith(hi)) {
          const x = f[o++], y = r.getAttribute(v).split(st), g = /([.?@])?(.*)/.exec(x);
          d.push({ type: 1, index: n, name: g[2], strings: y, ctor: g[1] === "." ? qi : g[1] === "?" ? Bi : g[1] === "@" ? Vi : ee }), r.removeAttribute(v);
        } else v.startsWith(st) && (d.push({ type: 6, index: n }), r.removeAttribute(v));
        if (ui.test(r.tagName)) {
          const v = r.textContent.split(st), x = v.length - 1;
          if (x > 0) {
            r.textContent = Xt ? Xt.emptyScript : "";
            for (let y = 0; y < x; y++) r.append(v[y], zt()), ht.nextNode(), d.push({ type: 2, index: ++n });
            r.append(v[x], zt());
          }
        }
      } else if (r.nodeType === 8) if (r.data === pi) d.push({ type: 2, index: n });
      else {
        let v = -1;
        for (; (v = r.data.indexOf(st, v + 1)) !== -1; ) d.push({ type: 7, index: n }), v += st.length - 1;
      }
      n++;
    }
  }
  static createElement(t, i) {
    const s = mt.createElement("template");
    return s.innerHTML = t, s;
  }
}
function kt(e, t, i = e, s) {
  var o, a;
  if (t === wt) return t;
  let r = s !== void 0 ? (o = i._$Co) == null ? void 0 : o[s] : i._$Cl;
  const n = Tt(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (t = kt(e, r._$AS(e, t.values), r, s)), t;
}
class Hi {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: s } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? mt).importNode(i, !0);
    ht.currentNode = r;
    let n = ht.nextNode(), o = 0, a = 0, d = s[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let _;
        d.type === 2 ? _ = new Rt(n, n.nextSibling, this, t) : d.type === 1 ? _ = new d.ctor(n, d.name, d.strings, this, t) : d.type === 6 && (_ = new Ki(n, this, t)), this._$AV.push(_), d = s[++a];
      }
      o !== (d == null ? void 0 : d.index) && (n = ht.nextNode(), o++);
    }
    return ht.currentNode = mt, r;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class Rt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, i, s, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = kt(this, t, i), Tt(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== wt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Fi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && Tt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(mt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: i, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = It.createElement(mi(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(i);
    else {
      const o = new Hi(r, this), a = o.u(this.options);
      o.p(i), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let i = Ge.get(t.strings);
    return i === void 0 && Ge.set(t.strings, i = new It(t)), i;
  }
  k(t) {
    Ee(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const n of t) r === i.length ? i.push(s = new Rt(this.O(zt()), this.O(zt()), this, this.options)) : s = i[r], s._$AI(n), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); t !== this._$AB; ) {
      const r = He(t).nextSibling;
      He(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var i;
    this._$AM === void 0 && (this._$Cv = t, (i = this._$AP) == null || i.call(this, t));
  }
}
class ee {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, r, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, i = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = kt(this, t, i, 0), o = !Tt(t) || t !== this._$AH && t !== wt, o && (this._$AH = t);
    else {
      const a = t;
      let d, _;
      for (t = n[0], d = 0; d < n.length - 1; d++) _ = kt(this, a[s + d], i, d), _ === wt && (_ = this._$AH[d]), o || (o = !Tt(_) || _ !== this._$AH[d]), _ === h ? t = h : t !== h && (t += (_ ?? "") + n[d + 1]), this._$AH[d] = _;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class qi extends ee {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Bi extends ee {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Vi extends ee {
  constructor(t, i, s, r, n) {
    super(t, i, s, r, n), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = kt(this, t, i, 0) ?? h) === wt) return;
    const s = this._$AH, r = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ki {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    kt(this, t);
  }
}
const le = Ot.litHtmlPolyfillSupport;
le == null || le(It, Rt), (Ot.litHtmlVersions ?? (Ot.litHtmlVersions = [])).push("3.3.3");
const Ji = (e, t, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new Rt(t.insertBefore(zt(), n), n, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = globalThis;
let E = class extends bt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var i;
    const t = super.createRenderRoot();
    return (i = this.renderOptions).renderBefore ?? (i.renderBefore = t.firstChild), t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ji(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return wt;
  }
};
var li;
E._$litElement$ = !0, E.finalized = !0, (li = ut.litElementHydrateSupport) == null || li.call(ut, { LitElement: E });
const ce = ut.litElementPolyfillSupport;
ce == null || ce({ LitElement: E });
(ut.litElementVersions ?? (ut.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gi = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Yi = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, s) {
    this._$Ct = t, this._$AM = i, this._$Ci = s;
  }
  _$AS(t, i) {
    return this.update(t, i);
  }
  update(t, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xi = {}, Qi = (e, t = Xi) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fi = Gi(class extends Yi {
  constructor() {
    super(...arguments), this.key = h;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, i]) {
    return t !== this.key && (Qi(e), this.key = t), i;
  }
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Zi = { attribute: !0, type: String, converter: Yt, reflect: !1, hasChanged: Ae }, ts = (e = Zi, t, i) => {
  const { kind: s, metadata: r } = i;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(i.name, e), s === "accessor") {
    const { name: o } = i;
    return { set(a) {
      const d = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, d, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(a) {
      const d = this[o];
      t.call(this, a), this.requestUpdate(o, d, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function m(e) {
  return (t, i) => typeof i == "object" ? ts(e, t, i) : ((s, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, s), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(e) {
  return m({ ...e, state: !0, attribute: !1 });
}
const Qt = 5, D = 1440;
function $t(e) {
  const [t, i] = e.split(":").map(Number);
  return t * 60 + i;
}
function Ye(e) {
  const t = Math.max(0, Math.min(D, Math.round(e / Qt) * Qt));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function Mt(e, t) {
  var o, a;
  const i = typeof e == "string" ? new Date(e) : e, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((o = s.find((d) => d.type === "hour")) == null ? void 0 : o.value) ?? 0), n = Number(((a = s.find((d) => d.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return r * 60 + n;
}
function be(e, t) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function pt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function at(e) {
  return !e || !("time" in e) ? null : $t(e.time);
}
function gi(e) {
  const t = [];
  for (const i of e) {
    const s = at(i.start), r = at(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && t.push({ slot: i, end: r });
  }
  return t;
}
function yi(e, t) {
  const i = (Math.round(t) % D + D) % D, s = Math.floor(i / 60), r = i % 60;
  if (e.toLowerCase().startsWith("fr")) return r ? `${s} h ${String(r).padStart(2, "0")}` : `${s} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, s, r)), o = { timeZone: "UTC", hour: "numeric" };
  return r && (o.minute = "2-digit"), new Intl.DateTimeFormat(e, o).format(n).replace(/\s?(AM|PM)/, (a, d) => ` ${d.toLowerCase()}`);
}
function es(e, t, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(e), n = pt(r, t) === pt(s, t), o = yi(i, Mt(r, t));
  if (n) return o;
  if (pt(new Date(s.getTime() + 864e5), t) === pt(r, t)) return `${new Intl.RelativeTimeFormat(i, { numeric: "auto" }).format(1, "day")} ${o}`;
  const _ = r.getTime() - s.getTime() > 6 * 864e5 ? { timeZone: t, weekday: "short", day: "numeric", month: "short" } : { timeZone: t, weekday: "short" };
  return `${new Intl.DateTimeFormat(i, _).format(r)} ${o}`;
}
var is = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, gt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ss(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && is(t, i, r), r;
};
let Q = class extends E {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this.notches = !1, this._width = 0;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this._ro = new ResizeObserver((e) => {
      var i;
      const t = Math.round(((i = e[0]) == null ? void 0 : i.contentRect.width) ?? 0);
      t !== this._width && (this._width = t);
    }), this._ro.observe(this));
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._ro) == null || e.disconnect();
  }
  /** A label is only drawn when its span is wide enough for it (never cut off). */
  _fits(e) {
    const t = this.now !== null && this.now >= e.start - 20 && this.now <= e.end + 20, i = Math.max(40, e.label.length * 7 + (e.sun ? 18 : 0) + 14);
    return !this.thin && !t && this._width > 0 && (e.end - e.start) / D * this._width >= i;
  }
  render() {
    const e = (t) => `${t / D * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.notches ? [6, 12, 18].map((t) => l`<i class="tick" style="left:${e(t * 60)}"></i>`) : h}
        ${this.spans.map(
      (t) => l`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${this._fits(t) ? l`<span>${t.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : h}${t.label}</span>` : h}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${e(this.now)}"></div>` : h}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 6, 12, 18, 24].map((t) => l`<span style="left:${e(t * 60)}">${t} h</span>`)}</div>` : h}
    `;
  }
};
Q.styles = T`
    :host { display: block; }
    .bar {
      position: relative; height: 28px; border-radius: 14px; overflow: hidden;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .bar.thin { height: 10px; border-radius: 5px; }
    .span {
      position: absolute; top: 0; bottom: 0; background: var(--c);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .span.ignored {
      background: repeating-linear-gradient(135deg, var(--c) 0 4px, transparent 4px 8px);
      opacity: 0.5;
    }
    .span span {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; color: #fff;
      color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); padding: 0 6px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .now {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
gt([
  m({ attribute: !1 })
], Q.prototype, "spans", 2);
gt([
  m({ type: Number })
], Q.prototype, "now", 2);
gt([
  m({ type: Boolean })
], Q.prototype, "thin", 2);
gt([
  m({ type: Boolean, attribute: "show-hours" })
], Q.prototype, "showHours", 2);
gt([
  m({ type: Boolean })
], Q.prototype, "notches", 2);
gt([
  $()
], Q.prototype, "_width", 2);
Q = gt([
  I("wp-day-bar")
], Q);
var rs = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, ie = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ns(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && rs(t, i, r), r;
};
let St = class extends E {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.wide = !1, this._onKey = (e) => {
      e.key === "Escape" && (e.stopPropagation(), this.close());
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("keydown", this._onKey);
  }
  _isPhone() {
    return typeof matchMedia == "function" && matchMedia("(max-width: 600px)").matches;
  }
  _panel() {
    return this.renderRoot.querySelector(".panel");
  }
  _hdown(e) {
    var t, i;
    !this._isPhone() || e.pointerType === "mouse" || e.composedPath().some((s) => s instanceof HTMLElement && s.tagName === "BUTTON") || (this._sw = { id: e.pointerId, y: e.clientY, x: e.clientX, dy: 0 }, (i = (t = e.currentTarget).setPointerCapture) == null || i.call(t, e.pointerId));
  }
  _hmove(e) {
    const t = this._sw;
    if (!t || e.pointerId !== t.id) return;
    t.dy = Math.max(0, e.clientY - t.y);
    const i = this._panel();
    i && (i.style.transition = "none", i.style.transform = `translateY(${t.dy}px)`);
  }
  _hup(e) {
    const t = this._sw;
    if (!t || e.pointerId !== t.id) return;
    this._sw = void 0;
    const i = this._panel(), s = Math.abs(e.clientX - t.x);
    i && (i.style.transition = "", i.style.transform = ""), t.dy >= 100 && s < t.dy && this.close();
  }
  _hcancel() {
    this._sw = void 0;
    const e = this._panel();
    e && (e.style.transition = "", e.style.transform = "");
  }
  updated(e) {
    e.has("open") && this.open && requestAnimationFrame(() => {
      var t;
      return (t = this.renderRoot.querySelector(".panel")) == null ? void 0 : t.focus();
    });
  }
  close() {
    this.open = !1, this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0 }));
  }
  render() {
    var e;
    return this.open ? l`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${(e = document.documentElement.lang) != null && e.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : l``;
  }
};
St.styles = T`
    :host { position: fixed; inset: 0; z-index: 9; pointer-events: none; }
    :host([open]) { pointer-events: auto; }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); }
    .panel {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 64px);
      display: flex; flex-direction: column; outline: none;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      border-radius: var(--ha-card-border-radius, 16px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    .panel.wide { width: min(880px, calc(100vw - 32px)); }
    header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px 20px; }
    header { touch-action: none; }
    h2 {
      flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .content { padding: 8px 20px 16px; overflow-y: auto; }
    footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 8px 20px 20px; }
    footer:empty { display: none; }
    button.icon {
      border: none; background: none; color: inherit; --mdc-icon-size: 24px; width: 48px; height: 48px;
      display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    button.icon:hover { background: var(--secondary-background-color); }
    @media (max-width: 600px) {
      h2 { font-size: 18px; }
      .panel, .panel.wide {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
ie([
  m()
], St.prototype, "heading", 2);
ie([
  m({ type: Boolean, reflect: !0 })
], St.prototype, "open", 2);
ie([
  m({ type: Boolean })
], St.prototype, "wide", 2);
St = ie([
  I("wp-dialog")
], St);
let qt, dt;
const Bt = /* @__PURE__ */ new Set();
function os(e, t) {
  return Bt.add(t), qt && t(qt), dt || (dt = e.connection.subscribeMessage(
    (i) => {
      qt = i, Bt.forEach((s) => s(i));
    },
    { type: "weekly_planner/subscribe" }
  ), dt.catch(() => {
    dt = void 0;
  })), () => {
    Bt.delete(t), Bt.size === 0 && dt && (dt.then((i) => i()).catch(() => {
    }), dt = void 0, qt = void 0);
  };
}
const vt = (e) => e.split(".")[0];
function Dt(e, t) {
  var s;
  const i = ((s = t.status[e.id]) == null ? void 0 : s.active_profile) ?? e.active_profile;
  return e.profiles.find((r) => r.id === i) ?? e.profiles[0];
}
function ot(e, t) {
  var i;
  return ((i = e.states[t]) == null ? void 0 : i.attributes.friendly_name) ?? t;
}
function Xe(e, t) {
  var r, n;
  if (t.program) return e.programs.filter((o) => o.id === t.program);
  const i = (r = t.filter) == null ? void 0 : r.types, s = (n = t.filter) == null ? void 0 : n.area;
  return e.programs.filter((o) => !(i != null && i.length) || o.entities.some((a) => i.includes(vt(a.entity_id)))).filter((o) => !s || o.area === s).sort((o, a) => o.priority - a.priority || o.name.localeCompare(a.name));
}
function rt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function as(e, t) {
  return new Intl.NumberFormat(e, { maximumFractionDigits: 1 }).format(t);
}
async function bi() {
  var e, t, i;
  if (customElements.get("ha-selector")) return !0;
  try {
    const s = await ((e = window.loadCardHelpers) == null ? void 0 : e.call(window)), r = await (s == null ? void 0 : s.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((i = (t = r == null ? void 0 : r.constructor) == null ? void 0 : t.getConfigElement) == null ? void 0 : i.call(t)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((n) => setTimeout(n, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const ls = (e) => e.split(".")[0], cs = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let $e;
const de = /* @__PURE__ */ new Set();
async function se(e, t) {
  const i = [...new Set(t)].filter((s) => !de.has(s));
  if (!i.length || !e.loadBackendTranslation) return !1;
  i.forEach((s) => de.add(s));
  try {
    const s = await Promise.all(i.map((r) => e.loadBackendTranslation("services", r)));
    return $e = s[s.length - 1] ?? $e, !0;
  } catch {
    return i.forEach((s) => de.delete(s)), !1;
  }
}
function $i(e, t) {
  for (const i of [e.localize, $e]) {
    const s = i == null ? void 0 : i(t);
    if (s) return s;
  }
  return "";
}
const vi = (e, t) => {
  var r, n;
  const [i, s] = t.split(".");
  return (n = (r = e.services) == null ? void 0 : r[i]) == null ? void 0 : n[s];
};
function xi(e, t) {
  var r;
  const [i, s] = t.split(".");
  return $i(e, `component.${i}.services.${s}.name`) || ((r = vi(e, t)) == null ? void 0 : r.name) || t;
}
function ds(e, t, i) {
  const s = Array.isArray(e) ? e : e ? [e] : [], r = Number((t == null ? void 0 : t.attributes.supported_features) ?? 0);
  return s.some((n) => {
    var a;
    return (n.domain === void 0 ? [] : Array.isArray(n.domain) ? n.domain : [n.domain]).includes(i) ? (a = n.supported_features) != null && a.length ? n.supported_features.some((d) => Array.isArray(d) ? d.every((_) => (r & _) === _) : (r & d) === d) : !0 : !1;
  });
}
function Pe(e, t) {
  const i = ls(t), s = e.states[t], r = [];
  for (const [n, o] of Object.entries(e.services ?? {}))
    if (n !== "homeassistant")
      for (const [a, d] of Object.entries(o)) {
        if (!d.target) continue;
        const _ = d.target.entity, f = !_ || Array.isArray(_) && !_.length;
        if (!ds(_, s, i) && !(n === i && f) || Object.values(d.fields ?? {}).some((y) => y.required && (!y.selector || "text" in y.selector || "object" in y.selector))) continue;
        const x = `${n}.${a}`;
        r.push({ id: x, domain: n, service: a, label: xi(e, x) });
      }
  return r.sort((n, o) => n.label.localeCompare(o.label));
}
function hs(e, t) {
  return [...new Set(Pe(e, t).map((i) => i.domain))];
}
function Ce(e, t) {
  var o;
  const [i, s] = t.split("."), r = [], n = (a) => {
    var d;
    for (const [_, f] of Object.entries(a ?? {})) {
      if (f.fields) {
        n(f.fields);
        continue;
      }
      f.advanced || cs.has(_) || (d = f.selector) != null && d.target || r.push({
        key: _,
        selector: f.selector ?? { text: {} },
        required: !!f.required,
        default: f.default,
        label: $i(e, `component.${i}.services.${s}.fields.${_}.name`) || f.name || _
      });
    }
  };
  return n((o = vi(e, t)) == null ? void 0 : o.fields), [...r.filter((a) => a.required), ...r.filter((a) => !a.required)];
}
const ps = /* @__PURE__ */ new Set(["avec", "de", "du", "à", "au", "with", "of", "the", "for", "on"]);
function us(e) {
  if (e.length < 3) return e;
  const t = e.map((n) => n.split(" ")), i = /* @__PURE__ */ new Map();
  for (const n of t) i.set(n[n.length - 1], (i.get(n[n.length - 1]) ?? 0) + 1);
  const [s, r] = [...i.entries()].sort((n, o) => o[1] - n[1])[0];
  return r < Math.ceil(e.length * 0.6) ? e : t.map((n, o) => {
    if (n.length < 2 || n[n.length - 1] !== s) return e[o];
    const a = n.slice(0, -1);
    for (; a.length > 1 && ps.has(a[a.length - 1].toLowerCase()); ) a.pop();
    return a.join(" ");
  });
}
function _s(e, t, i) {
  var n;
  const s = ((n = e.states[i]) == null ? void 0 : n.attributes) ?? {}, r = {};
  for (const o of Ce(e, t)) {
    if (!o.required) continue;
    const a = o.selector.number;
    o.default !== void 0 ? r[o.key] = o.default : o.key === "temperature" ? r[o.key] = typeof s.temperature == "number" ? s.temperature : 19 : a && (r[o.key] = o.key === "position" ? 50 : a.min ?? 0);
  }
  return r;
}
function wi(e, t, i) {
  return Ce(e, t).filter((s) => s.required && ((i == null ? void 0 : i[s.key]) === void 0 || i[s.key] === "" || i[s.key] === null)).map((s) => s.label);
}
const Nt = [
  "#f44336",
  "#ff9800",
  "#ffc107",
  "#8bc34a",
  "#26a69a",
  "#03a9f4",
  "#3f51b2",
  "#9c27b0",
  "#e91e63",
  "#795548",
  "#607d8b",
  "#009688"
];
function ms(e) {
  const t = new Set(e.map((i) => i.color.toLowerCase()));
  return Nt.find((i) => !t.has(i)) ?? Nt[e.length % Nt.length];
}
const K = (e, t) => t ? e.labels.find((i) => i.id === t) : void 0;
function fs(e, t) {
  return Object.values(e.states).filter((i) => i.entity_id.startsWith("scene.") && Array.isArray(i.attributes.entity_id) && i.attributes.entity_id.includes(t)).sort((i, s) => String(i.attributes.friendly_name ?? i.entity_id).localeCompare(String(s.attributes.friendly_name ?? s.entity_id)));
}
function gs(e, t, i) {
  var s;
  if (i.kind === "scene") {
    const r = (s = e.states[i.scene]) == null ? void 0 : s.attributes.entity_id;
    return Array.isArray(r) ? r.includes(t) : !0;
  }
  return i.service.split(".")[0] === t.split(".")[0] ? !0 : Pe(e, t).some((r) => r.id === i.service);
}
function ki(e, t, i) {
  return t.labels.filter((s) => i.some((r) => gs(e, r, s.action)));
}
function Zt(e, t, i) {
  var r, n;
  return i ? ((n = (r = e.entities.find((o) => o.entity_id === t)) == null ? void 0 : r.label_overrides) == null ? void 0 : n[i.id]) ?? i.action : void 0;
}
const Qe = (e, t, i) => {
  var s, r;
  return !!((r = (s = e.entities.find((n) => n.entity_id === t)) == null ? void 0 : s.label_overrides) != null && r[i]);
}, xt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function ys(e) {
  if (!e || e.kind !== "service") return null;
  const t = e.data ?? {};
  return xt(t.temperature) ?? xt(t.position) ?? xt(t.brightness_pct);
}
function Oe(e, t, i) {
  var r;
  if (!i) return "";
  if (i.kind === "scene") return String(((r = e.states[i.scene]) == null ? void 0 : r.attributes.friendly_name) ?? i.scene);
  const s = i.data ?? {};
  return xt(s.temperature) !== null ? `${as(t, Number(s.temperature))} °C` : xt(s.position) !== null ? `${s.position} %` : xt(s.brightness_pct) !== null ? `${s.brightness_pct} %` : xi(e, i.service);
}
function he(e, t) {
  return e.programs.filter((i) => i.entities.some((s) => s.default_label === t || t in (s.label_overrides ?? {})) || i.profiles.some((s) => s.days.some((r) => r.some((n) => n.label === t)))).map((i) => i.name);
}
const bs = {
  // --- labels (0.6) ---
  labels: "Labels",
  lb_new: "New label",
  lb_name: "Name",
  lb_color: "Color",
  lb_device: "Device",
  lb_none: "No label yet.",
  lb_uses: "{n} use(s)",
  lb_in_use: "Used by: {programs}",
  lb_value_here: "Value for this device",
  lb_common_value: "Back to the common value",
  lb_err_name: "Give it a name.",
  lb_err_action: "Choose what it does.",
  lb_err_fields: "Fill in the required fields.",
  lb_err_save: "Could not save the label.",
  err_label: "Choose a label.",
  tab_seasons: "Seasons",
  ch_set: "Set",
  manual: "Manual",
  chart_open: "History of {name}",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  days_short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  title: "Schedules",
  vacation: "Vacation",
  no_program: "No program yet.",
  new_program: "New program",
  then: "then {mode}",
  now: "Now",
  override: "Change for now",
  edit: "Edit",
  close: "Close",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  duplicate: "Duplicate",
  confirm_delete: "Delete “{name}”?",
  conflict: "Conflict",
  modified_elsewhere: "Modified elsewhere: reload and try again.",
  read_only: "Read only",
  week: "Week",
  show_week: "Show the week",
  next_change: "Next change {time}",
  skip_next: "Skip next change",
  profile: "Season",
  chart: "Chart",
  planned: "Planned",
  applied: "Applied",
  measured: "Measured",
  previous_day: "Previous day",
  next_day: "Next day",
  error: "Error: {message}",
  entity: "Entity",
  ok: "OK",
  confirm: "Confirm",
  copy: "Copy",
  copy_suffix: "(copy)",
  cond_add: "Add a condition",
  cond_attribute: "Attribute (optional)",
  cond_op: "Operator",
  cond_value: "Value",
  type_climate: "Thermostats",
  type_cover: "Covers",
  type_light: "Lights",
  type_switch: "Switches",
  type_input_boolean: "Input booleans",
  type_fan: "Fans",
  type_water_heater: "Water heaters",
  type_media_player: "Media players",
  type_input_number: "Numbers",
  type_input_select: "Selections",
  sun_dawn: "Dawn",
  sun_sunrise: "Sunrise",
  sun_sunset: "Sunset",
  sun_dusk: "Dusk",
  sun_event: "Sun event",
  sun_offset: "Offset (minutes)",
  sun_earliest: "Not before",
  sun_latest: "Not after",
  err_incomplete: "Some fields are empty.",
  tab_general: "General",
  tab_entities: "Devices",
  pe_name: "Name",
  pe_icon: "Icon",
  pe_priority: "Priority (1–100)",
  pe_priority_hint: "When two programs drive the same entity, the lowest number wins.",
  pe_reapply: "Re-apply the current slot after a restart or a change",
  pe_reapply_hint: "Off: after a restart or an edit, nothing is sent until the next change.",
  pe_conditions: "Program conditions",
  pe_conditions_hint: "The program only runs when all conditions are true.",
  pe_no_entity: "No entity yet: add at least one.",
  pe_add_entity: "Add an entity",
  pe_unknown_entity: "unknown entity",
  profile_default: "Standard week",
  profile_add: "Add a season",
  profile_rename: "Rename the season",
  profile_copy: "Copy the season",
  profile_delete: "Delete the season",
  profile_active_hint: "Active profile (cannot be deleted).",
  profile_rename_warning: "Automations using the old name must be updated.",
  profile_active: "active",
  err_name: "The name is required.",
  err_no_entity: "Add at least one entity.",
  err_profile_name: "Profile names must be unique and not empty.",
  err_overlap_server: "Slots overlap on a day.",
  err_unauthorized: "Reserved to administrators.",
  ce_title: "Title",
  ce_mode: "Content",
  ce_one_program: "One program",
  ce_filtered: "Filtered list",
  ce_program: "Program",
  ce_types: "Types",
  ce_types_hint: "No type checked: all programs.",
  ce_area: "Area (optional)",
  ce_show_chart: "Show the chart",
  today: "Today",
  no_data: "No data for this day.",
  chart_loading: "Loading…",
  // --- simple mode ---
  cf_title: "Please confirm",
  // --- schedule & gestures ---
  ss_conflict: "These schedules were changed elsewhere in the meantime. Reload, then make your changes again.",
  ss_err_save: "These schedules could not be saved. Try again.",
  tab_scroll: "Sections (scroll sideways for more)",
  rest_none: "Leave as is",
  rest_of_time: "The rest of the time",
  all_days_text: "Every day",
  weekend: "Weekend",
  all_days: "Every day",
  weekdays: "Weekdays",
  minus15: "15 minutes earlier",
  plus15: "15 minutes later",
  start: "Start",
  end: "End",
  no_end: "No end",
  with_end: "Until…",
  days_label: "Days",
  action: "Action",
  more_actions: "More actions",
  hours: "Schedule",
  paused: "Paused",
  settings: "Settings",
  all_programs: "All schedules",
  today_short: "Today",
  apply_other_days: "Apply to other days",
  sun_sunrise_short: "Sunrise",
  sun_sunset_short: "Sunset",
  w_err_overlap: "Two schedules overlap.",
  err_days: "Pick at least one day.",
  err_action: "Pick a label.",
  w_err_same: "Start and end are the same.",
  w_confirm_slot: "Delete this schedule?",
  confirm_pause: "Stop the schedules of “{name}”?",
  confirm_delete_schedule: "Delete the schedule of “{name}”?",
  delete_schedule: "Delete",
  schedule_on: "Schedule on",
  w_add: "Add a schedule",
  w_none: "No schedule.",
  yes: "Yes",
  no: "No",
  running: "On",
  stopped: "Off",
  rest_none_short: "None"
}, $s = {
  // --- étiquettes (0.6) ---
  labels: "Étiquettes",
  lb_new: "Nouvelle étiquette",
  lb_name: "Nom",
  lb_color: "Couleur",
  lb_device: "Appareil",
  lb_none: "Aucune étiquette.",
  lb_uses: "{n} usage(s)",
  lb_in_use: "Utilisée par : {programs}",
  lb_value_here: "Valeur pour cet appareil",
  lb_common_value: "Revenir à la valeur commune",
  lb_err_name: "Donnez-lui un nom.",
  lb_err_action: "Choisissez l'action.",
  lb_err_fields: "Remplissez les champs obligatoires.",
  lb_err_save: "Étiquette non enregistrée.",
  err_label: "Choisissez une étiquette.",
  tab_seasons: "Saisons",
  ch_set: "Réglé",
  manual: "Manuel",
  chart_open: "Historique de {name}",
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  days_short: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  title: "Programmes",
  vacation: "Vacances",
  no_program: "Aucun programme pour l'instant.",
  new_program: "Nouveau programme",
  then: "puis {mode}",
  now: "Maintenant",
  override: "Changer pour l'instant",
  edit: "Modifier",
  close: "Fermer",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  duplicate: "Dupliquer",
  confirm_delete: "Supprimer « {name} » ?",
  conflict: "Conflit",
  modified_elsewhere: "Modifié ailleurs : rechargez puis recommencez.",
  read_only: "Lecture seule",
  week: "Semaine",
  show_week: "Voir la semaine",
  next_change: "Prochain changement {time}",
  skip_next: "Sauter le prochain changement",
  profile: "Saison",
  chart: "Graphique",
  planned: "Prévu",
  applied: "Appliqué",
  measured: "Mesuré",
  previous_day: "Jour précédent",
  next_day: "Jour suivant",
  error: "Erreur : {message}",
  entity: "Appareil",
  ok: "OK",
  confirm: "Confirmer",
  copy: "Copier",
  copy_suffix: "(copie)",
  cond_add: "Ajouter une condition",
  cond_attribute: "Attribut (facultatif)",
  cond_op: "Opérateur",
  cond_value: "Valeur",
  type_climate: "Thermostats",
  type_cover: "Volets",
  type_light: "Lumières",
  type_switch: "Prises",
  type_input_boolean: "Interrupteurs virtuels",
  type_fan: "Ventilateurs",
  type_water_heater: "Chauffe-eau",
  type_media_player: "Lecteurs",
  type_input_number: "Nombres",
  type_input_select: "Listes",
  sun_dawn: "Aube",
  sun_sunrise: "Lever du soleil",
  sun_sunset: "Coucher du soleil",
  sun_dusk: "Crépuscule",
  sun_event: "Événement solaire",
  sun_offset: "Décalage (minutes)",
  sun_earliest: "Pas avant",
  sun_latest: "Pas après",
  err_incomplete: "Certains champs sont vides.",
  tab_general: "Général",
  tab_entities: "Appareils",
  pe_name: "Nom",
  pe_icon: "Icône",
  pe_priority: "Priorité (1–100)",
  pe_priority_hint: "Si deux programmes pilotent le même appareil, le plus petit numéro l'emporte.",
  pe_reapply: "Réappliquer la plage en cours après un redémarrage ou une modification",
  pe_reapply_hint: "Désactivé : après un redémarrage ou une modification, rien n'est envoyé avant le prochain changement.",
  pe_conditions: "Conditions du programme",
  pe_conditions_hint: "Le programme ne s'exécute que si toutes les conditions sont vraies.",
  pe_no_entity: "Aucun appareil : ajoutez-en au moins un.",
  pe_add_entity: "Ajouter un appareil",
  pe_unknown_entity: "appareil inconnu",
  profile_default: "Semaine type",
  profile_add: "Ajouter une saison",
  profile_rename: "Renommer la saison",
  profile_copy: "Copier la saison",
  profile_delete: "Supprimer la saison",
  profile_active_hint: "Saison active (ne peut pas être supprimée).",
  profile_rename_warning: "Les automatisations qui utilisent l'ancien nom sont à mettre à jour.",
  profile_active: "active",
  err_name: "Le nom est obligatoire.",
  err_no_entity: "Ajoutez au moins un appareil.",
  err_profile_name: "Les noms de saison doivent être uniques et non vides.",
  err_overlap_server: "Des plages se chevauchent un jour.",
  err_unauthorized: "Réservé aux administrateurs.",
  ce_title: "Titre",
  ce_mode: "Contenu",
  ce_one_program: "Un programme",
  ce_filtered: "Liste filtrée",
  ce_program: "Programme",
  ce_types: "Types",
  ce_types_hint: "Aucun type coché : tous les programmes.",
  ce_area: "Zone (facultatif)",
  ce_show_chart: "Afficher le graphique",
  today: "Aujourd'hui",
  no_data: "Pas de données pour ce jour.",
  chart_loading: "Chargement…",
  // --- simple mode ---
  cf_title: "Veuillez confirmer",
  // --- schedule & gestures ---
  ss_conflict: "Ces horaires ont été modifiés ailleurs entre-temps. Rechargez, puis refaites vos changements.",
  ss_err_save: "Impossible d'enregistrer ces horaires. Réessayez.",
  tab_scroll: "Rubriques (faire défiler pour en voir plus)",
  rest_none: "Ne rien changer",
  rest_of_time: "Le reste du temps",
  all_days_text: "Tous les jours",
  weekend: "Week-end",
  all_days: "Tous les jours",
  weekdays: "Semaine",
  minus15: "15 minutes plus tôt",
  plus15: "15 minutes plus tard",
  start: "Début",
  end: "Fin",
  no_end: "Sans fin",
  with_end: "Jusqu'à…",
  days_label: "Jours",
  action: "Action",
  more_actions: "Plus d'actions",
  hours: "Horaires",
  paused: "En pause",
  settings: "Réglages",
  all_programs: "Tous les horaires",
  today_short: "Auj.",
  apply_other_days: "Appliquer à d'autres jours",
  sun_sunrise_short: "Lever",
  sun_sunset_short: "Coucher",
  w_err_overlap: "Deux horaires se chevauchent.",
  err_days: "Choisissez au moins un jour.",
  err_action: "Choisissez une étiquette.",
  w_err_same: "Le début et la fin sont identiques.",
  w_confirm_slot: "Supprimer cet horaire ?",
  confirm_pause: "Arrêter les horaires de « {name} » ?",
  confirm_delete_schedule: "Supprimer l'horaire de « {name} » ?",
  delete_schedule: "Supprimer",
  schedule_on: "Horaires actifs",
  w_add: "Ajouter un horaire",
  w_none: "Aucun horaire.",
  yes: "Oui",
  no: "Non",
  running: "En marche",
  stopped: "À l'arrêt",
  rest_none_short: "Rien"
};
function Z(e) {
  return e.startsWith("fr") ? $s : bs;
}
function c(e, t, i = {}) {
  let s = Z(e)[t];
  for (const [r, n] of Object.entries(i)) s = s.replace(`{${r}}`, n);
  return s;
}
var vs = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, J = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? xs(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && vs(t, i, r), r;
};
const lt = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
};
function ws(e, t) {
  const i = Z(e)[`type_${t}`];
  return typeof i == "string" ? i : t;
}
const et = T`
  :host { display: block; color: var(--primary-text-color); font-size: 14px; }
  * { box-sizing: border-box; }
  .field { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; min-width: 0; }
  .field > label, .label { font-size: 12px; color: var(--secondary-text-color); }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .row > .field { flex: 1 1 140px; }
  input[type="text"], input[type="number"], input[type="time"], input[type="date"], input:not([type]),
  select, textarea {
    width: 100%; min-height: 48px; padding: 8px 10px; font: inherit; color: var(--primary-text-color);
    background: var(--card-background-color, #fff); border: 1px solid var(--divider-color);
    border-radius: 8px;
  }
  textarea { min-height: 72px; font-family: monospace; }
  input[type="color"] { width: 56px; height: 48px; padding: 2px; border: 1px solid var(--divider-color);
    border-radius: 8px; background: none; }
  input[type="checkbox"], input[type="radio"] { width: 20px; height: 20px; min-width: 20px; flex: none; margin: 0; accent-color: var(--primary-color); }
  label.check { display: flex; align-items: center; gap: 10px; min-height: 48px; cursor: pointer; }
  button { font: inherit; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px; --mdc-icon-size: 20px;
    min-height: 48px; padding: 0 16px; border-radius: 24px; border: 1px solid var(--divider-color);
    background: none; color: var(--primary-text-color); cursor: pointer;
  }
  .btn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .btn.primary { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
  .btn.danger { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
  .btn:disabled { opacity: 0.45; cursor: default; }
  .ibtn {
    min-width: 48px; min-height: 48px; border-radius: 24px; border: none; background: none; --mdc-icon-size: 20px;
    color: inherit; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center;
  }
  .ibtn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .ibtn:disabled { opacity: 0.35; cursor: default; }
  :is(button, input, select, textarea, [tabindex]):focus-visible {
    outline: 2px solid var(--primary-color); outline-offset: 2px;
  }
  .error { color: var(--error-color, #db4437); margin: 8px 0; }
  .hint { display: flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; color: var(--secondary-text-color); font-size: 12px; margin: 4px 0; }
  .card {
    border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 12px; margin: 8px 0;
  }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .grow { flex: 1; min-width: 0; }
`;
function Si(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
let tt = class extends E {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(vt(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Si(this, "wp-change", e);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const t = this.filter;
      return l`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${t ? (i) => t(i.entity_id) : void 0}
        @value-changed=${(i) => {
        i.stopPropagation(), this._emit(i.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const e = this._ids().slice(0, 600);
    return l`
      <div class="field">
        ${this.label ? l`<label>${this.label}</label>` : h}
        <input type="text" list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(t) => {
      const i = t.target.value.trim();
      (i === "" || this.hass.states[i]) && this._emit(i);
    }}
          @input=${(t) => {
      const i = t.target.value.trim();
      this.hass.states[i] && i !== this.value && this._emit(i);
    }} />
        <datalist id=${this._listId}>
          ${e.map((t) => l`<option value=${t}>${ot(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
tt.styles = [et, T`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
J([
  m({ attribute: !1 })
], tt.prototype, "hass", 2);
J([
  m()
], tt.prototype, "value", 2);
J([
  m()
], tt.prototype, "label", 2);
J([
  m({ attribute: !1 })
], tt.prototype, "domains", 2);
J([
  m({ attribute: !1 })
], tt.prototype, "exclude", 2);
J([
  m({ attribute: !1 })
], tt.prototype, "filter", 2);
tt = J([
  I("wp-entity-picker")
], tt);
let jt = class extends E {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return lt(this.hass);
  }
  _tr(e) {
    return c(this._lang, e);
  }
  _set(e) {
    Si(this, "wp-change", e);
  }
  _patch(e, t) {
    this._set(this.conditions.map((i, s) => s === e ? { ...i, ...t } : i));
  }
  _parse(e, t) {
    const i = e.trim();
    return i !== "" && !Number.isNaN(Number(i)) ? Number(i) : t && i === "true" ? !0 : t && i === "false" ? !1 : e;
  }
  render() {
    return l`
      ${this.conditions.map(
      (e, t) => l`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${e.entity_id} .label=${this._tr("entity")}
              @wp-change=${(i) => {
        i.stopPropagation(), this._patch(t, { entity_id: i.detail });
      }}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${e.attribute ?? ""} placeholder="—"
                  @change=${(i) => this._patch(t, { attribute: i.target.value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(i) => this._patch(t, { op: i.target.value })}>
                  ${["eq", "ne", "lt", "gt"].map(
        (i) => l`<option value=${i} ?selected=${(e.op ?? "eq") === i}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[i]}</option>`
      )}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(e.value ?? "")}
                  @change=${(i) => this._patch(t, { value: this._parse(i.target.value, !!e.attribute) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((i, s) => s !== t))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`
    )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }
};
jt.styles = et;
J([
  m({ attribute: !1 })
], jt.prototype, "hass", 2);
J([
  m({ attribute: !1 })
], jt.prototype, "conditions", 2);
jt = J([
  I("wp-conditions-editor")
], jt);
var ks = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, yt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ss(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && ks(t, i, r), r;
};
let L = class extends E {
  constructor() {
    super(...arguments), this.entityId = "", this.action = null, this.disabled = !1, this._more = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return lt(this.hass);
  }
  updated() {
    !this.hass || !this.entityId || this._loadedFor === this.entityId || (this._loadedFor = this.entityId, se(this.hass, hs(this.hass, this.entityId)).then((e) => e && this.requestUpdate()), this._selector || bi().then((e) => this._selector = e));
  }
  _emit(e) {
    this.dispatchEvent(new CustomEvent("action-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _setData(e, t) {
    var r;
    if (((r = this.action) == null ? void 0 : r.kind) !== "service") return;
    const i = { ...this.action.data ?? {} };
    t == null || t === "" || Array.isArray(t) && !t.length ? delete i[e] : i[e] = t, this._emit({ ...this.action, data: i });
  }
  render() {
    var x, y;
    if (!this.hass || !this.entityId) return h;
    const e = this._lang, t = Pe(this.hass, this.entityId), i = us(t.map((g) => g.label)), s = t.map((g, w) => ({ ...g, label: i[w] })), r = ((x = this.action) == null ? void 0 : x.kind) === "service" ? this.action.service : "", n = s.findIndex((g) => g.id === r), o = this._more || n >= L.SHOWN, a = o ? s : s.slice(0, L.SHOWN), d = ((y = this.action) == null ? void 0 : y.kind) === "service" ? this.action.data ?? {} : {}, _ = r ? Ce(this.hass, r) : [], f = fs(this.hass, this.entityId), v = (g, w, j, u) => l`
      <button class="chip ${w ? "on" : ""}" role="radio" aria-checked=${w} ?disabled=${this.disabled} @click=${j}>
        ${u ? l`<ha-icon icon=${u}></ha-icon>` : h}<span>${g}</span></button>`;
    return l`
      <div class="chips" role="radiogroup" aria-label=${c(e, "action")}>
        ${a.map((g) => v(g.label, g.id === r, () => this._emit({ kind: "service", service: g.id, data: _s(this.hass, g.id, this.entityId) })))}
        ${!o && s.length > L.SHOWN ? l`<button class="chip add" ?disabled=${this.disabled} @click=${() => this._more = !0}>${c(e, "more_actions")}</button>` : h}
        ${f.map((g) => {
      var w;
      return v(
        String(g.attributes.friendly_name ?? g.entity_id),
        ((w = this.action) == null ? void 0 : w.kind) === "scene" && this.action.scene === g.entity_id,
        () => this._emit({ kind: "scene", scene: g.entity_id }),
        "mdi:palette-outline"
      );
    })}
      </div>
      ${_.map((g) => this._selector ? l`<ha-selector class="fld" .hass=${this.hass} .selector=${g.selector} .value=${d[g.key]} .label=${g.label}
            .required=${g.required} ?disabled=${this.disabled}
            @value-changed=${(w) => {
      w.stopPropagation(), this._setData(g.key, w.detail.value);
    }}></ha-selector>` : l`<div class="field"><label>${g.label}</label><input type="text" .value=${String(d[g.key] ?? "")} ?disabled=${this.disabled}
            @change=${(w) => this._setData(g.key, w.target.value)} /></div>`)}`;
  }
};
L.SHOWN = 8;
L.styles = [et, T`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .chip.add { border-style: dashed; color: var(--primary-color); }
    .fld { display: block; margin-top: 8px; }
  `];
yt([
  m({ attribute: !1 })
], L.prototype, "hass", 2);
yt([
  m({ attribute: "entity-id" })
], L.prototype, "entityId", 2);
yt([
  m({ attribute: !1 })
], L.prototype, "action", 2);
yt([
  m({ type: Boolean })
], L.prototype, "disabled", 2);
yt([
  $()
], L.prototype, "_more", 2);
yt([
  $()
], L.prototype, "_selector", 2);
L = yt([
  I("wp-action-picker")
], L);
var As = Object.defineProperty, Es = Object.getOwnPropertyDescriptor, Lt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Es(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && As(t, i, r), r;
};
let ft = class extends E {
  constructor() {
    super(...arguments), this.message = "", this.confirmLabel = "", this.cancelLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (e) => {
      e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
    };
  }
  _choose(e) {
    var t;
    this._result = e, (t = this.renderRoot.querySelector("wp-dialog")) == null || t.close();
  }
  render() {
    const e = Z(this.lang);
    return l`
      <wp-dialog open heading=${e.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${this.cancelLabel || e.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }
};
ft.styles = T`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
Lt([
  m()
], ft.prototype, "message", 2);
Lt([
  m({ attribute: "confirm-label" })
], ft.prototype, "confirmLabel", 2);
Lt([
  m({ attribute: "cancel-label" })
], ft.prototype, "cancelLabel", 2);
Lt([
  m()
], ft.prototype, "lang", 2);
ft = Lt([
  I("wp-confirm")
], ft);
function _t(e, t, i, s = "") {
  return new Promise((r) => {
    var a;
    const n = document.createElement("wp-confirm");
    n.message = t, n.confirmLabel = i, n.cancelLabel = s;
    const o = e.hass;
    n.lang = ((a = o == null ? void 0 : o.locale) == null ? void 0 : a.language) ?? (o == null ? void 0 : o.language) ?? (document.documentElement.lang || "en"), n.addEventListener("choice", (d) => {
      n.remove(), r(!!d.detail);
    }), (e.shadowRoot ?? e).appendChild(n);
  });
}
var Ps = Object.defineProperty, Cs = Object.getOwnPropertyDescriptor, G = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Cs(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Ps(t, i, r), r;
};
let H = class extends E {
  constructor() {
    super(...arguments), this._open = null, this._name = "", this._color = "", this._action = null, this._entity = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return lt(this.hass);
  }
  firstUpdated() {
    const e = this.data.labels.flatMap((t) => t.action.kind === "service" ? [t.action.service.split(".")[0]] : []);
    se(this.hass, e).then((t) => t && this.requestUpdate());
  }
  /** Devices that can serve to choose an action: those of the programs using the label, else all of them. */
  _entities(e) {
    const t = this.data.programs.filter((s) => he(this.data, e.id).includes(s.name)), i = (s) => [...new Set(s.flatMap((r) => r.entities.map((n) => n.entity_id)))];
    return t.length ? i(t) : i(this.data.programs);
  }
  _expand(e) {
    this._open = e.id, this._name = e.name, this._color = e.color, this._action = structuredClone(e.action), this._entity = this._entities(e)[0] ?? "", this._error = "";
  }
  async _save(e) {
    var i;
    const t = this._lang;
    if (!this._name.trim()) {
      this._error = c(t, "lb_err_name");
      return;
    }
    if (((i = this._action) == null ? void 0 : i.kind) === "service" && wi(this.hass, this._action.service, this._action.data).length) {
      this._error = c(t, "lb_err_fields");
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/save", label: { id: e.id, name: this._name.trim(), color: this._color, action: this._action } }), this._open = null;
    } catch {
      this._error = c(t, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  async _delete(e) {
    const t = this._lang, i = he(this.data, e.id);
    if (i.length) {
      this._error = c(t, "lb_in_use", { programs: i.join(", ") });
      return;
    }
    if (await _t(this, c(t, "confirm_delete", { name: e.name }), c(t, "delete"), c(t, "cancel")))
      try {
        await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: e.id }), this._open = null;
      } catch (s) {
        const r = s;
        this._error = (r == null ? void 0 : r.code) === "in_use" ? c(t, "lb_in_use", { programs: r.message ?? "" }) : c(t, "lb_err_save");
      }
  }
  render() {
    if (!this.hass || !this.data) return h;
    const e = this._lang;
    return l`<wp-dialog open heading=${c(e, "labels")}>
      ${this.data.labels.length ? h : l`<p class="muted">${c(e, "lb_none")}</p>`}
      <div class="list">
        ${this.data.labels.map((t) => {
      const i = he(this.data, t.id).length;
      if (this._open !== t.id)
        return l`<button class="row" @click=${() => this._expand(t)}>
              <i class="dot" style="background:${t.color}"></i>
              <span class="txt"><b>${t.name}</b><span class="sub">${Oe(this.hass, e, t.action)} · ${c(e, "lb_uses", { n: String(i) })}</span></span>
              <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
      const s = this._entities(t);
      return l`<div class="editor">
            <div class="field"><label for="lbe-name">${c(e, "lb_name")}</label>
              <input id="lbe-name" type="text" maxlength="30" .value=${this._name}
                @input=${(r) => {
        this._name = r.target.value, this._error = "";
      }} /></div>
            <div class="swatches" role="radiogroup" aria-label=${c(e, "lb_color")}>
              ${Nt.map((r) => l`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
                aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
            </div>
            ${s.length > 1 ? l`<div class="field"><label for="lbe-ent">${c(e, "lb_device")}</label>
              <select id="lbe-ent" @change=${(r) => this._entity = r.target.value}>
                ${s.map((r) => l`<option value=${r} ?selected=${r === this._entity}>${ot(this.hass, r)}</option>`)}
              </select></div>` : h}
            <wp-action-picker .hass=${this.hass} entity-id=${this._entity} .action=${this._action}
              @action-change=${(r) => {
        r.stopPropagation(), this._action = r.detail, this._error = "";
      }}></wp-action-picker>
            ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : h}
            <div class="btns">
              <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._save(t)}>${c(e, "save")}</button>
              <button class="btn" @click=${() => this._open = null}>${c(e, "cancel")}</button>
            </div>
            <button class="btn danger-line alone" @click=${() => void this._delete(t)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${c(e, "delete")}</button>
          </div>`;
    })}
      </div>
    </wp-dialog>`;
  }
};
H.styles = [et, T`
    :host { display: contents; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; text-align: left;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 16px;
      cursor: pointer; width: 100%; --mdc-icon-size: 22px;
    }
    .row .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
    .row .sub { color: var(--secondary-text-color); font-size: 14px; }
    .dot { width: 16px; height: 16px; border-radius: 8px; flex: none; }
    .editor { border: 2px solid var(--primary-color); border-radius: 12px; padding: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 40px; height: 40px; border-radius: 20px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .sw.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .btn.alone { width: 100%; margin-top: 32px; }
    .btn.danger-line { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
    .err { color: var(--error-color, #db4437); margin: 8px 0 0; }
    .muted { color: var(--secondary-text-color); }
  `];
G([
  m({ attribute: !1 })
], H.prototype, "hass", 2);
G([
  m({ attribute: !1 })
], H.prototype, "data", 2);
G([
  $()
], H.prototype, "_open", 2);
G([
  $()
], H.prototype, "_name", 2);
G([
  $()
], H.prototype, "_color", 2);
G([
  $()
], H.prototype, "_action", 2);
G([
  $()
], H.prototype, "_entity", 2);
G([
  $()
], H.prototype, "_error", 2);
G([
  $()
], H.prototype, "_saving", 2);
H = G([
  I("wp-labels")
], H);
var Os = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, Y = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ms(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Os(t, i, r), r;
};
function Ze(e, t) {
  const i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(e)), s = (n) => {
    var o;
    return Number(((o = i.find((a) => a.type === n)) == null ? void 0 : o.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(e / 1e3) * 1e3;
}
function ti(e, t) {
  const [i, s, r] = e.split("-").map(Number), n = Date.UTC(i, s - 1, r), o = n - Ze(n, t);
  return n - Ze(o, t);
}
function Ai(e, t) {
  const [i, s, r] = e.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + t)).toISOString().slice(0, 10);
}
function Vt(e, t) {
  return { startMs: ti(e, t), endMs: ti(Ai(e, 1), t) };
}
function Ds(e) {
  const [t, i, s] = e.split("-").map(Number);
  return be(new Date(Date.UTC(t, i - 1, s, 12)), "UTC");
}
const ei = 6e4, pe = /* @__PURE__ */ new Map();
function ue(e, t, i) {
  const s = pe.get(e);
  if (s && Date.now() - s.at < t) return s.p;
  const r = i();
  return pe.set(e, { at: Date.now(), p: r }), r.catch(() => pe.delete(e)), r;
}
function Ns(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  let i = {};
  for (const s of e) {
    s.a && (i = s.a);
    const r = s.lu ?? s.lc ?? s.last_updated_ts, n = typeof r == "number" ? r * 1e3 : Date.parse(s.last_updated ?? "");
    Number.isNaN(n) || t.push({ t: n, s: String(s.s ?? s.state ?? ""), a: i });
  }
  return t;
}
function zs(e) {
  return Array.isArray(e) ? e.map((t) => {
    const i = Number(t.when);
    return {
      t: i > 1e12 ? i : i * 1e3,
      state: String(t.state ?? ""),
      user: !!t.context_user_id,
      // an automation, a script or a service call of an integration: not a person
      context: !!(t.context_event_type || t.context_domain || t.context_service || t.context_entity_id || t.context_message)
    };
  }).filter((t) => !Number.isNaN(t.t)) : [];
}
function ii(e, t) {
  const i = Math.floor((t - 8) / 6);
  return i < 4 ? "" : e.length <= i ? e : `${e.slice(0, i - 1)}…`;
}
const Kt = (e) => e === "unavailable" || e === "unknown" || e === "", Jt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Ts = /* @__PURE__ */ new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);
let q = class extends E {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._model = null, this._token = 0;
  }
  get _lang() {
    var e, t, i;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  connectedCallback() {
    super.connectedCallback(), this._observer = new ResizeObserver((e) => {
      const t = Math.floor(e[0].contentRect.width);
      t > 120 && t !== this._width && (this._width = t);
    });
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._observer) == null || e.disconnect();
  }
  firstUpdated() {
    var t;
    const e = this.renderRoot.querySelector(".box");
    e && ((t = this._observer) == null || t.observe(e));
  }
  willUpdate(e) {
    (e.has("entityId") || e.has("date")) && this._load(), (e.has("slots") || e.has("data") || e.has("program") || e.has("entityId") || e.has("date") || e.has("_loaded")) && (this._model = this._loaded ? this._build(this._loaded) : null);
  }
  async _load() {
    if (!this.hass || !this.entityId || !this.date) return;
    const e = `${this.entityId}|${this.date}`, t = ++this._token;
    this._loaded = null, this._failed = !1;
    const { startMs: i, endMs: s } = Vt(this.date, this._tz), r = Date.now(), n = s > r ? 6e4 : 1 / 0, o = i < r, a = new Date(Math.min(s, r)).toISOString();
    try {
      const d = o ? ue(`h|${e}`, n, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), _ = o ? ue(`l|${e}`, n, () => this.hass.callWS({
        type: "logbook/get_events",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId]
      })).catch(() => []) : Promise.resolve([]), f = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), v = o ? ue(`j|${this.entityId}|${f}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: f })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [x, y, g] = await Promise.all([d, _, v]);
      if (t !== this._token) return;
      this._loaded = {
        hist: Ns(x[this.entityId]),
        log: zs(y),
        sent: (g.segments ?? []).filter((w) => w.entity_id === this.entityId).map((w) => Date.parse(w.at))
      };
    } catch {
      t === this._token && (this._failed = !0);
    }
  }
  // ---- values ----
  /** What a history point says as numbers: the curves of the device. */
  _live(e) {
    const t = { measured: null, set: null, main: null };
    if (Kt(e.s)) return t;
    switch (vt(this.entityId)) {
      case "climate":
        return { measured: Jt(e.a.current_temperature), set: e.s === "off" ? null : Jt(e.a.temperature), main: null };
      case "cover":
        return { ...t, main: Jt(e.a.current_position) ?? (e.s === "open" ? 100 : e.s === "closed" ? 0 : null) };
      case "light": {
        const i = e.s === "on" ? Jt(e.a.brightness) : 0;
        return { ...t, main: i === null ? e.s === "on" ? 100 : 0 : i / 255 * 100 };
      }
      default: {
        const i = Number(e.s);
        return { ...t, main: Number.isFinite(i) ? i : null };
      }
    }
  }
  _numeric(e) {
    const t = vt(this.entityId);
    if (["climate", "cover", "light"].includes(t)) return !0;
    const i = e.filter((s) => !Kt(s.s));
    return i.length > 0 && i.every((s) => Number.isFinite(Number(s.s)));
  }
  // ---- build ----
  _build(e) {
    var ze, Te;
    const t = this._tz, { startMs: i, endMs: s } = Vt(this.date, t), r = Math.round((s - i) / 6e4), n = Date.now(), o = Math.max(0, Math.min(r, (n - i) / 6e4)), a = (p) => (p - i) / 6e4, d = vt(this.entityId), _ = Dt(this.program, this.data), f = /* @__PURE__ */ new Map();
    for (const p of this.program.profiles) for (const b of p.days.flat()) f.set(b.id, b);
    const v = Ds(this.date), x = [];
    for (const { slot: p, end: b } of gi(_.days[(v + 6) % 7])) x.push({ s: 0, e: b, slot: p, spill: !0 });
    if (this.slots)
      for (const p of this.slots) {
        const b = f.get(p.slot_id);
        !b || p.ignored || x.push({ s: Math.max(0, a(Date.parse(p.start))), e: p.end ? Math.min(r, a(Date.parse(p.end))) : null, slot: b });
      }
    else
      for (const p of _.days[v]) {
        const b = at(p.start);
        if (b === null) continue;
        const S = at(p.end ?? null);
        x.push({ s: b, e: S === null ? null : S > b ? S : r, slot: p });
      }
    const y = this.program.entities.find((p) => p.entity_id === this.entityId), g = K(this.data, y == null ? void 0 : y.default_label), w = [], j = (p, b, S) => {
      if (!b || p < 0 || p > r) return;
      const M = Zt(this.program, this.entityId, b);
      M && w.push({ m: p, label: b, value: ys(M), end: S });
    };
    for (const p of x)
      p.spill || j(p.s, K(this.data, p.slot.label), !1), p.e !== null && j(p.e, g, !0);
    w.sort((p, b) => p.m - b.m);
    const u = this._numeric(e.hist), k = [], P = [];
    if (u) {
      const p = { measured: [], set: [], main: [] };
      for (const b of e.hist) {
        const S = Math.max(0, a(b.t)), M = this._live(b);
        p.measured.push({ m: S, v: M.measured }), p.set.push({ m: S, v: M.set }), p.main.push({ m: S, v: M.main });
      }
      for (const b of ["measured", "set", "main"])
        p[b].some((S) => S.v !== null) && k.push({ key: b, pts: p[b] });
    } else
      e.hist.forEach((p, b) => {
        var je, Re;
        const S = Math.max(0, a(p.t)), M = b + 1 < e.hist.length ? a(e.hist[b + 1].t) : o;
        if (M <= S || Kt(p.s)) return;
        const W = P[P.length - 1];
        if (W && W.state === p.s && Math.abs(W.e - S) < 0.5) {
          W.e = M;
          return;
        }
        const Ie = this.hass.states[this.entityId];
        P.push({
          s: S,
          e: M,
          state: p.s,
          on: Ts.has(p.s),
          text: Ie ? ((Re = (je = this.hass).formatEntityState) == null ? void 0 : Re.call(je, { ...Ie, state: p.s, attributes: p.a }, p.s)) ?? p.s : p.s
        });
      });
    const Et = (p) => e.sent.some((b) => Math.abs(b - p) <= ei), F = [];
    let Ut = (ze = e.hist[0]) == null ? void 0 : ze.s;
    for (const p of e.log) {
      if (Kt(p.state)) continue;
      const b = p.state === Ut;
      Ut = p.state, (p.user || !p.context && !b && !Et(p.t)) && F.push(a(p.t));
    }
    const Ft = d === "climate" ? "set" : d === "light" ? "main" : null, De = k.find((p) => p.key === Ft), Ne = [];
    if (De) {
      let p = null;
      for (const b of De.pts) {
        if (b.v !== null && p !== null && Math.abs(b.v - p) > 0.01) {
          const S = i + b.m * 6e4;
          Ne.push(b.m);
          const M = e.log.some((W) => W.context && !W.user && Math.abs(W.t - S) <= ei);
          !Et(S) && !M && !F.some((W) => Math.abs(W - b.m) <= 1) && F.push(b.m);
        }
        b.v !== null && (p = b.v);
      }
    }
    F.sort((p, b) => p - b);
    const Oi = [
      ...w.map((p) => p.m),
      ...e.sent.map(a),
      ...Ne,
      ...P.map((p) => p.s),
      ...F
    ], ne = [];
    for (const p of F) {
      if (p <= 1 || p > o) continue;
      const b = Oi.filter((M) => M > p + 0.5).sort((M, W) => M - W)[0], S = Math.min(b ?? o, o);
      S > p ? ne.push([p, S]) : ne.push([p, Math.min(p + 5, r)]);
    }
    let Wt = 0, Ht = 100;
    if (u && d !== "cover" && d !== "light") {
      const p = [...k.flatMap((b) => b.pts.map((S) => S.v)), ...w.map((b) => b.value)].filter((b) => b !== null);
      p.length && (Wt = Math.floor(Math.min(...p) - 1), Ht = Math.ceil(Math.max(...p) + 1), Ht - Wt < 2 && (Ht = Wt + 2));
    }
    const Mi = d === "climate" ? "°C" : d === "cover" || d === "light" ? "%" : ((Te = this.hass.states[this.entityId]) == null ? void 0 : Te.attributes.unit_of_measurement) ?? "";
    return {
      span: r,
      pastEnd: o,
      isToday: i <= n && n < s,
      kind: u ? "curve" : "band",
      lines: k,
      bands: P,
      markers: w,
      manual: ne,
      lo: Wt,
      hi: Ht,
      unit: Mi
    };
  }
  // ---- interaction ----
  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  get _historyPath() {
    const { startMs: e, endMs: t } = Vt(this.date, this._tz);
    return `/history?${new URLSearchParams({
      entity_id: this.entityId,
      start_date: new Date(e).toISOString(),
      end_date: new Date(t).toISOString()
    }).toString()}`;
  }
  _open() {
    this.dispatchEvent(new CustomEvent("open-history", { detail: this._historyPath, bubbles: !0, composed: !0 }));
  }
  // ---- render ----
  _path(e, t, i, s, r, n) {
    let o = "", a = !1;
    return e.forEach((d, _) => {
      const f = _ + 1 < e.length ? e[_ + 1].m : t.pastEnd;
      let v = d.m, x = f;
      if (n && (v = Math.max(v, n[0]), x = Math.min(x, n[1]), x < v)) {
        a = !1;
        return;
      }
      if (d.v === null) {
        a = !1;
        return;
      }
      const y = s(d.v);
      r ? o += a ? `V${y.toFixed(1)}H${i(x).toFixed(1)}` : `M${i(v).toFixed(1)},${y.toFixed(1)}H${i(x).toFixed(1)}` : (o += `${a ? "L" : "M"}${i(v).toFixed(1)},${y.toFixed(1)}`, (_ + 1 === e.length || n && x < f) && (o += `L${i(x).toFixed(1)},${y.toFixed(1)}`)), a = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const e = this._lang, t = this._model;
    let i;
    return this._failed ? i = l`<div class="note">${c(e, "no_data")}</div>` : t ? i = this._renderChart(t) : i = l`<div class="note">${c(e, "chart_loading")}</div>`, l`<div class="box">${i}</div>${t ? this._legend(t) : h}`;
  }
  _legend(e) {
    const t = this._lang, i = (r, n, o) => l`<span class="key"><i class=${r} style=${""}></i>${n}</span>`, s = (r) => e.lines.some((n) => n.key === r);
    return l`<div class="legend">
      ${e.markers.length ? i("planned", c(t, "planned")) : h}
      ${s("measured") ? i("measured", c(t, "measured")) : h}
      ${s("set") ? i("set", c(t, "ch_set")) : h}
      ${e.manual.length ? i("manual", c(t, "manual")) : h}
    </div>`;
  }
  _renderChart(e) {
    const t = this._lang, i = this._width, s = e.kind === "curve", r = s ? 150 : 84, n = { l: s ? 38 : 8, r: 10, t: 22, b: 22 }, o = (u) => n.l + u / e.span * (i - n.l - n.r), a = (u) => n.t + (1 - (u - e.lo) / (e.hi - e.lo)) * (r - n.t - n.b), { startMs: d } = Vt(this.date, this._tz), _ = (u) => new Intl.DateTimeFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" }).format(new Date(d + u * 6e4)), f = [];
    for (let u = 0; u <= e.span; u += 180) f.push(u);
    const v = [];
    if (s) {
      const u = e.hi - e.lo, k = [1, 2, 5, 10, 20, 25, 50].find((P) => u / P <= 4) ?? 100;
      for (let P = Math.ceil(e.lo / k) * k; P <= e.hi + 1e-9; P += k) v.push(P);
    }
    const x = n.t - 12, y = n.t, g = r - n.t - n.b, w = (u) => {
      const k = s && u.value !== null ? a(u.value) : x, P = u.label.color;
      return R`
        <line class="drop" x1=${o(u.m)} x2=${o(u.m)} y1=${k} y2=${r - n.b}></line>
        <circle class="mk ${u.end ? "end" : ""}" cx=${o(u.m)} cy=${k} r="5" style="--c:${P}"></circle>
        ${u.value !== null ? R`<text class="val" x=${Math.min(Math.max(o(u.m), 14), i - 14)} y=${Math.max(k - 8, 9)} text-anchor="middle">${Number(u.value.toFixed(1))}</text>` : h}`;
    }, j = e.isToday ? R`<line class="now" x1=${o(e.pastEnd)} x2=${o(e.pastEnd)} y1=${n.t - 4} y2=${r - n.b}></line>` : h;
    return l`
      <svg width=${i} height=${r} viewBox="0 0 ${i} ${r}" tabindex="0" role="button"
        aria-label=${c(t, "chart_open", { name: ot(this.hass, this.entityId) })}
        @click=${() => this._open()}
        @keydown=${(u) => {
      (u.key === "Enter" || u.key === " ") && (u.preventDefault(), this._open());
    }}>
        ${v.map((u) => R`<line class="grid" x1=${n.l} x2=${i - n.r} y1=${a(u)} y2=${a(u)}></line>
          <text class="ylab" x=${n.l - 4} y=${a(u) + 3} text-anchor="end">${Number(u.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${f.map((u) => R`<text class="xlab" x=${o(u)} y=${r - 6} text-anchor=${u === 0 ? "start" : "middle"}>${Number(_(u))}h</text>`)}
        ${s ? h : R`
          <rect class="track" x=${n.l} y=${y} width=${i - n.l - n.r} height=${g} rx="6"></rect>
          ${e.bands.map((u) => {
      const k = o(u.e) - o(u.s);
      return R`<rect class="band ${u.on ? "on" : ""}" x=${o(u.s)} y=${y} width=${Math.max(1, k)} height=${g}></rect>
              ${ii(u.text, k) ? R`<text class="btxt" x=${o(u.s) + k / 2} y=${y + g / 2 + 4} text-anchor="middle">${ii(u.text, k)}</text>` : h}`;
    })}
          ${e.manual.map(([u, k]) => R`<rect class="red-band" x=${o(u)} y=${y} width=${Math.max(3, o(k) - o(u))} height=${g}></rect>`)}`}
        ${s ? e.lines.map((u) => R`<path class="line ${u.key}" d=${this._path(u.pts, e, o, a, u.key === "set")}></path>`) : h}
        ${s ? e.manual.map((u) => {
      const k = e.lines.find((F) => F.key === "set") ?? e.lines.find((F) => F.key === "main") ?? e.lines[0], P = k == null ? void 0 : k.pts.find((F, Ut) => {
        var Ft;
        return F.v !== null && (((Ft = k.pts[Ut + 1]) == null ? void 0 : Ft.m) ?? 1 / 0) > u[0];
      }), Et = (P == null ? void 0 : P.v) ?? null;
      return R`${k ? R`<path class="line red" d=${this._path(k.pts, e, o, a, k.key === "set", u)}></path>` : h}
            ${Et !== null ? R`<circle class="reddot" cx=${o(u[0])} cy=${a(Et)} r="3.5"></circle>` : h}`;
    }) : h}
        ${e.markers.map(w)}
        ${j}
        <rect class="hit" x="0" y="0" width=${i} height=${r}></rect>
      </svg>`;
  }
};
q.styles = T`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    svg { display: block; user-select: none; outline: none; max-width: 100%; cursor: pointer; }
    svg:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
    .grid { stroke: var(--divider-color, rgba(127, 127, 127, 0.3)); stroke-width: 1; }
    text { fill: var(--secondary-text-color); font-size: 10px; }
    text.val { fill: var(--primary-text-color); font-weight: 600; }
    text.btxt { fill: var(--primary-text-color); font-size: 11px; }
    .line { fill: none; stroke-width: 1.8; stroke-linejoin: round; }
    .line.measured { stroke: var(--accent-color, #ff9800); }
    .line.set { stroke: var(--primary-text-color); stroke-width: 1.6; stroke-dasharray: 5 3; }
    .line.main { stroke: var(--primary-color); stroke-width: 2; }
    .line.red { stroke: var(--error-color, #db4437); stroke-width: 3; stroke-dasharray: none; }
    .reddot { fill: var(--error-color, #db4437); }
    .track { fill: var(--divider-color, rgba(127, 127, 127, 0.2)); opacity: 0.5; }
    .band { fill: var(--secondary-text-color); opacity: 0.35; stroke: var(--card-background-color); stroke-width: 1; }
    .band.on { fill: var(--primary-color); opacity: 0.4; }
    .red-band { fill: var(--error-color, #db4437); opacity: 0.55; }
    .drop { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 1 3; opacity: 0.6; }
    .mk { fill: var(--c); stroke: var(--card-background-color); stroke-width: 1.5; }
    .mk.end { fill: var(--card-background-color); stroke: var(--c); stroke-width: 2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
    .hit { fill: transparent; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 12px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.set { border-top: 2px dashed var(--primary-text-color); }
    .key i.planned { width: 10px; height: 10px; border: 2px solid var(--secondary-text-color); border-radius: 50%; }
    .key i.manual { border-top: 3px solid var(--error-color, #db4437); }
  `;
Y([
  m({ attribute: !1 })
], q.prototype, "hass", 2);
Y([
  m({ attribute: !1 })
], q.prototype, "data", 2);
Y([
  m({ attribute: !1 })
], q.prototype, "program", 2);
Y([
  m({ attribute: "entity-id" })
], q.prototype, "entityId", 2);
Y([
  m()
], q.prototype, "date", 2);
Y([
  m({ attribute: !1 })
], q.prototype, "slots", 2);
Y([
  $()
], q.prototype, "_width", 2);
Y([
  $()
], q.prototype, "_loaded", 2);
Y([
  $()
], q.prototype, "_failed", 2);
q = Y([
  I("wp-chart")
], q);
var Is = Object.defineProperty, js = Object.getOwnPropertyDescriptor, z = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? js(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Is(t, i, r), r;
};
let C = class extends E {
  constructor() {
    super(...arguments), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this._creating = !1, this._name = "", this._color = "", this._action = null, this._error = "", this._saving = !1, this._valueFor = null;
  }
  get _lang() {
    return lt(this.hass);
  }
  _emit(e, t) {
    this.dispatchEvent(new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }));
  }
  _startCreate() {
    this._creating = !0, this._name = "", this._color = ms(this.data.labels), this._action = null, this._error = "";
  }
  get _formProblem() {
    const e = this._lang;
    return this._name.trim() ? this._action ? this._action.kind === "service" && wi(this.hass, this._action.service, this._action.data).length ? c(e, "lb_err_fields") : "" : c(e, "lb_err_action") : c(e, "lb_err_name");
  }
  async _create() {
    const e = this._formProblem;
    if (e) {
      this._error = e;
      return;
    }
    this._saving = !0;
    try {
      const t = await this.hass.callWS({
        type: "weekly_planner/label/save",
        label: { name: this._name.trim(), color: this._color, action: this._action }
      });
      this._creating = !1, this._emit("label-change", t.label.id);
    } catch (t) {
      const i = t;
      this._error = (i == null ? void 0 : i.code) === "unauthorized" ? c(this._lang, "err_unauthorized") : c(this._lang, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  _valueEditor(e) {
    const t = this._lang, i = K(this.data, this.value);
    if (!i) return h;
    const s = Zt(this.program, e, i) ?? null;
    return l`<div class="valbox">
      <wp-action-picker .hass=${this.hass} entity-id=${e} .action=${s} ?disabled=${this.disabled}
        @action-change=${(r) => {
      r.stopPropagation(), this._emit("override-change", { entityId: e, labelId: i.id, action: r.detail });
    }}></wp-action-picker>
      ${Qe(this.program, e, i.id) ? l`<button class="btn" ?disabled=${this.disabled}
            @click=${() => this._emit("override-change", { entityId: e, labelId: i.id, action: null })}>
            <ha-icon icon="mdi:undo"></ha-icon>${c(t, "lb_common_value")}</button>` : h}
    </div>`;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const e = this._lang, t = ki(this.hass, this.data, this.entityIds), i = K(this.data, this.value), s = (r, n, o, a) => l`
      <button class="chip ${n ? "on" : ""}" role="radio" aria-checked=${n} ?disabled=${this.disabled} @click=${o}>
        ${a ? l`<i class="dot" style="background:${a}"></i>` : h}<span>${r}</span></button>`;
    return l`
      <div class="chips" role="radiogroup" aria-label=${c(e, "action")}>
        ${this.allowNone ? s(c(e, "rest_none"), this.value === null, () => this._emit("label-change", null)) : h}
        ${t.map((r) => s(r.name, r.id === this.value, () => this._emit("label-change", r.id), r.color))}
        ${this.value && !i ? s("?", !0, () => {
    }) : h}
        <button class="chip add" ?disabled=${this.disabled} @click=${() => this._startCreate()}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${c(e, "lb_new")}</span></button>
      </div>
      ${this._creating ? l`<div class="form">
        <div class="field"><label for="lb-name">${c(e, "lb_name")}</label>
          <input id="lb-name" type="text" maxlength="30" .value=${this._name}
            @input=${(r) => {
      this._name = r.target.value, this._error = "";
    }} /></div>
        <div class="swatches" role="radiogroup" aria-label=${c(e, "lb_color")}>
          ${Nt.map((r) => l`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
            aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
        </div>
        <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .action=${this._action}
          @action-change=${(r) => {
      r.stopPropagation(), this._action = r.detail, this._error = "";
    }}></wp-action-picker>
        ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : h}
        <div class="btns">
          <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._create()}>${c(e, "save")}</button>
          <button class="btn" @click=${() => this._creating = !1}>${c(e, "cancel")}</button>
        </div>
      </div>` : h}
      ${i && !this._creating ? l`
        ${this.entityIds.map((r) => {
      const n = this._valueFor === r, o = Qe(this.program, r, i.id);
      return l`<div class="dev">
            <div class="sum"><span class="what">${Oe(this.hass, e, Zt(this.program, r, i))}</span>
              ${this.entityIds.length > 1 ? l`<span class="who">${ot(this.hass, r)}</span>` : h}</div>
            <button class="link ${o ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${n}
              @click=${() => this._valueFor = n ? null : r}>${c(e, "lb_value_here")}</button>
            ${n ? this._valueEditor(r) : h}
          </div>`;
    })}` : h}`;
  }
};
C.styles = [et, T`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { border: 2px solid var(--primary-color); font-weight: 600; }
    .chip.add { border-style: dashed; color: var(--primary-color); }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .form { margin-top: 12px; padding: 12px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 40px; height: 40px; border-radius: 20px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .sw.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .err { color: var(--error-color, #db4437); margin: 8px 0 0; }
    .dev { margin-top: 10px; }
    .sum { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 15px; }
    .sum .what { font-weight: 600; }
    .sum .who { color: var(--secondary-text-color); font-size: 13px; }
    .link {
      border: none; background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer;
      min-height: 48px; padding: 0; text-align: left;
    }
    .link.own { font-weight: 600; }
    .valbox { padding: 8px 0 4px; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .valbox wp-action-picker { align-self: stretch; }
  `];
z([
  m({ attribute: !1 })
], C.prototype, "hass", 2);
z([
  m({ attribute: !1 })
], C.prototype, "data", 2);
z([
  m({ attribute: !1 })
], C.prototype, "program", 2);
z([
  m({ attribute: !1 })
], C.prototype, "entityIds", 2);
z([
  m({ attribute: !1 })
], C.prototype, "value", 2);
z([
  m({ type: Boolean, attribute: "allow-none" })
], C.prototype, "allowNone", 2);
z([
  m({ type: Boolean })
], C.prototype, "disabled", 2);
z([
  $()
], C.prototype, "_creating", 2);
z([
  $()
], C.prototype, "_name", 2);
z([
  $()
], C.prototype, "_color", 2);
z([
  $()
], C.prototype, "_action", 2);
z([
  $()
], C.prototype, "_error", 2);
z([
  $()
], C.prototype, "_saving", 2);
z([
  $()
], C.prototype, "_valueFor", 2);
C = z([
  I("wp-label-picker")
], C);
const Ei = " ", ve = (e) => e.replace(/ /g, Ei), _e = (e, t) => JSON.stringify(e) === JSON.stringify(t), Rs = (e, t) => {
  const i = Math.abs(t), s = i < 60 ? `${i} min` : i % 60 ? `${Math.floor(i / 60)} h ${String(i % 60).padStart(2, "0")}` : `${i / 60} h`;
  return `${t > 0 ? "+" : "−"}${s}`;
};
function xe(e, t, i) {
  if ("time" in t) {
    const [n, o] = t.time.split(":").map(Number);
    return ve(n * 60 + o >= D ? "24 h" : yi(e, n * 60 + o));
  }
  const s = c(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`), r = t.offset ? ` ${Rs(e, t.offset)}` : "";
  return ve(`${s}${r}`);
}
function te(e, t) {
  if ("time" in e) {
    const [i, s] = e.time.split(":").map(Number), r = Math.max(0, Math.min(D, Math.round((i * 60 + s + t) / Qt) * Qt));
    return { time: r >= D ? "24:00" : `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}` };
  }
  return { ...e, offset: Math.max(-240, Math.min(240, (e.offset ?? 0) + t)) };
}
const Pi = [0, 1, 2, 3, 4], Ci = [5, 6], Me = [0, 1, 2, 3, 4, 5, 6];
function Ls(e, t, i) {
  const s = [...i].sort((r, n) => r - n);
  return _e(s, Me) ? c(e, "all_days_text") : _e(s, Pi) ? `${t[0]}–${t[4]}` : _e(s, Ci) ? c(e, "weekend") : s.map((r) => t[r]).join(Ei);
}
function we(e) {
  if (Array.isArray(e)) return `[${e.map(we).join(",")}]`;
  if (e && typeof e == "object") {
    const t = e;
    return `{${Object.keys(t).sort().map((i) => `${JSON.stringify(i)}:${we(t[i])}`).join(",")}}`;
  }
  return JSON.stringify(e);
}
function Us(e) {
  const { id: t, ...i } = e;
  return we({ ...i, conditions: e.conditions ?? [], end: e.end ?? null, color: e.color ?? null });
}
function me(e, t, i) {
  const s = /* @__PURE__ */ new Map();
  return e.days.forEach((r, n) => {
    for (const o of r) {
      if (!t(o)) continue;
      const a = Us(o);
      let d = s.get(a);
      if (d && d.days.includes(n)) {
        d = void 0, s.set(`${a}#${o.id}`, { slot: o, days: [n], ids: { [n]: o.id } });
        continue;
      }
      d || (d = { slot: o, days: [], ids: {} }, s.set(a, d)), d.days.push(n), d.ids[n] = o.id;
    }
  }), [...s.values()].sort(
    (r, n) => i(r.slot.start) - i(n.slot.start) || r.days[0] - n.days[0]
  );
}
function si(e, t, i, s) {
  const r = e.days.map((n) => n.filter((o) => !i(o)));
  for (const n of t)
    for (const o of n.days)
      r[o].push({ ...structuredClone(n.slot), id: n.ids[o] ?? rt() });
  return { ...e, days: r.map((n) => n.sort((o, a) => s(o.start) - s(a.start))) };
}
var Fs = Object.defineProperty, Ws = Object.getOwnPropertyDescriptor, X = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ws(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Fs(t, i, r), r;
};
const Hs = ["sunrise", "sunset"];
let B = class extends E {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return lt(this.hass);
  }
  _set(e, t) {
    const i = { ...this.group, slot: { ...this.group.slot, ...e }, days: t ?? this.group.days };
    this.dispatchEvent(new CustomEvent("group-change", { detail: i, bubbles: !0, composed: !0 }));
  }
  /* ---- time ---- */
  _update(e, t) {
    t && "time" in t && (this._last = { ...this._last, [e]: t.time }), this._set({ [e]: t });
  }
  _toggleSun(e, t) {
    const i = this.group.slot[e];
    i && ("sun" in i && i.sun === t ? this._update(e, { time: this._last[e] }) : ("time" in i && (this._last = { ...this._last, [e]: i.time }), this._update(e, { sun: t, offset: "sun" in i ? i.offset ?? 0 : 0 })));
  }
  _fromInput(e, t) {
    if (!/^\d{2}:\d{2}$/.test(t)) return;
    let i = $t(t);
    e === "end" && i === 0 && (i = D), this._update(e, { time: i >= D ? "24:00" : Ye(i) });
  }
  _timeBlock(e, t) {
    const i = this.group.slot[e];
    if (!i) return h;
    const s = this._lang, r = Z(s), n = this.disabled;
    return l`
      <div class="time" role="group" aria-label=${t}>
        <button class="step" ?disabled=${n} aria-label=${c(s, "minus15")} title=${c(s, "minus15")} @click=${() => this._update(e, te(i, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in i ? l`<input type="time" step="300" .value=${i.time === "24:00" ? "00:00" : i.time} ?disabled=${n}
              aria-label=${t} @change=${(o) => this._fromInput(e, o.target.value)} />` : l`<output class="sun">${xe(s, i)}</output>`}
        <button class="step" ?disabled=${n} aria-label=${c(s, "plus15")} title=${c(s, "plus15")} @click=${() => this._update(e, te(i, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${Hs.map((o) => {
      const a = "sun" in i && i.sun === o;
      return l`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${n}
            @click=${() => this._toggleSun(e, o)}><ha-icon icon=${o === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${r[`sun_${o}_short`] ?? o}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(e) {
    if (!e) return this._update("end", null);
    const t = this.group.slot.start, i = "time" in t ? $t(t.time) : 12 * 60;
    this._update("end", { time: Ye(Math.min(D - 5, i + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(e) {
    const t = this.group.days.includes(e) ? this.group.days.filter((i) => i !== e) : [...this.group.days, e];
    this._set({}, t.sort((i, s) => i - s));
  }
  render() {
    if (!this.group || !this.program) return h;
    const e = this._lang, t = Z(e), i = this.group.slot, s = this.group.days, r = (o, a) => o.length === a.length && a.every((d) => o.includes(d)), n = (o, a) => l`<button class="chip small ${r(s, a) ? "on" : ""}"
      aria-pressed=${r(s, a)} ?disabled=${this.disabled} @click=${() => this._set({}, [...a])}>${r(s, a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : h}${o}</button>`;
    return l`
      <section>
        <h4>${c(e, "start")}</h4>
        ${this._timeBlock("start", c(e, "start"))}
      </section>
      <section>
        <h4>${c(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${i.end ? "" : "on"}" aria-pressed=${!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${c(e, "no_end")}</button>
          <button class="chip ${i.end ? "on" : ""}" aria-pressed=${!!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${c(e, "with_end")}</button>
        </div>
        ${i.end ? this._timeBlock("end", c(e, "end")) : h}
      </section>
      <section>
        <h4>${c(e, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && r(s, [this.dayOnly]) ? l`<div class="chips"><span class="only">${t.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${c(e, "apply_other_days")}</button></div>` : l`<div class="days" role="group" aria-label=${c(e, "days_label")}>
          ${t.days_short.map((o, a) => l`<button class="day ${s.includes(a) ? "on" : ""}" aria-pressed=${s.includes(a)}
            aria-label=${t.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${s.includes(a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : h}<span>${o}</span></button>`)}
        </div>
        <div class="chips">
          ${n(c(e, "all_days"), Me)}${n(c(e, "weekdays"), Pi)}${n(c(e, "weekend"), Ci)}
        </div>`}
      </section>
      <section>
        <h4>${c(e, "action")}</h4>
        <wp-label-picker .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${i.label || null} ?disabled=${this.disabled}
          @label-change=${(o) => {
      o.stopPropagation(), this._set({ label: o.detail ?? "" });
    }}></wp-label-picker>
      </section>`;
  }
};
B.styles = [et, T`
    :host { display: block; }
    section { margin: 0 0 14px; }
    h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); }
    /* One field: [ − | time | + ], the steps (15 min) are part of the field. */
    .time {
      display: flex; align-items: stretch; margin-bottom: 8px; min-height: 56px; overflow: hidden;
      border: 1px solid var(--divider-color); border-radius: 12px; background: var(--card-background-color);
    }
    .time:focus-within { border-color: var(--primary-color); }
    .time .step {
      flex: none; width: 56px; border: none; background: none; color: var(--primary-text-color); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 22px;
    }
    .time .step:first-child { border-right: 1px solid var(--divider-color); }
    .time .step:last-child { border-left: 1px solid var(--divider-color); }
    .time .step:hover:not(:disabled) { background: var(--secondary-background-color); }
    .time .step:disabled { opacity: 0.4; cursor: default; }
    .time input[type="time"] {
      flex: 1; min-width: 0; border: none; border-radius: 0; background: none; outline: none;
      text-align: center; font-size: 24px; font-weight: 600; min-height: 56px; color: var(--primary-text-color);
    }
    .time output.sun { flex: 1; min-width: 0; align-self: center; text-align: center; font-size: 20px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); min-width: 64px; font-weight: 600; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips + .time { margin-top: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 16px; font-weight: 500; margin-right: 8px; }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px; }
    .day {
      min-height: 48px; min-width: 0; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
      background: none; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
  `];
X([
  m({ attribute: !1 })
], B.prototype, "hass", 2);
X([
  m({ attribute: !1 })
], B.prototype, "data", 2);
X([
  m({ attribute: !1 })
], B.prototype, "program", 2);
X([
  m({ attribute: !1 })
], B.prototype, "group", 2);
X([
  m({ attribute: !1 })
], B.prototype, "entityIds", 2);
X([
  m({ type: Boolean })
], B.prototype, "disabled", 2);
X([
  m({ type: Number })
], B.prototype, "dayOnly", 2);
X([
  $()
], B.prototype, "_more", 2);
X([
  $()
], B.prototype, "_last", 2);
B = X([
  I("wp-slot-form")
], B);
const qs = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Bs = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function fe(e, t) {
  var r;
  if ("time" in t) return $t(t.time);
  const i = (r = e.states["sun.sun"]) == null ? void 0 : r.attributes[qs[t.sun]];
  let s = i ? Mt(i, e.config.time_zone) : Bs[t.sun];
  return s += t.offset ?? 0, t.earliest && (s = Math.max(s, $t(t.earliest))), t.latest && (s = Math.min(s, $t(t.latest))), Math.max(0, Math.min(D, s));
}
function Vs(e) {
  const t = at(e.start);
  if (t === null || !e.end) return null;
  const i = at(e.end);
  return i === null ? null : i > t ? [t, i] : [t, D];
}
function Ks(e) {
  const t = e.map((i) => ({ slot: i, iv: Vs(i) })).filter((i) => i.iv !== null).sort((i, s) => i.iv[0] - s.iv[0]);
  for (let i = 1; i < t.length; i++)
    if (t[i].iv[0] < t[i - 1].iv[1]) return [t[i - 1].slot, t[i].slot];
  return null;
}
var Js = Object.defineProperty, Gs = Object.getOwnPropertyDescriptor, O = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Gs(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Js(t, i, r), r;
};
const ri = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, ge = 7;
let A = class extends E {
  constructor() {
    super(...arguments), this.chart = !0, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._draft = null, this._restLabel = null, this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (e) => !0, this._minutes = (e) => fe(this.hass, e);
  }
  get _lang() {
    return lt(this.hass);
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /* ---- scope ---- */
  get _programs() {
    const e = this.data.programs;
    return [...this.scope.kind === "device" ? e.filter((i) => i.entities.some((s) => s.entity_id === this.scope.entityId)) : e.filter((i) => i.id === this.scope.programId)].sort((i, s) => i.priority - s.priority || i.name.localeCompare(s.name));
  }
  get _entities() {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const e = this._programs[0];
    return e ? e.entities.map((t) => t.entity_id) : [];
  }
  get _title() {
    var e;
    return this.scope.kind === "device" ? ot(this.hass, this.scope.entityId) : ((e = this._programs[0]) == null ? void 0 : e.name) ?? "";
  }
  _rows() {
    const e = [];
    for (const t of this._programs) {
      const i = Dt(t, this.data);
      for (const s of me(i, this._include, this._minutes))
        e.push({ program: t, group: s, key: `${t.id}|${s.ids[s.days[0]]}` });
    }
    return e;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: e, offset: t } = this.day;
    t >= -14 && t <= ge && (this._offset = t);
    const i = this._rows().filter((s) => s.group.days.includes(e));
    if (i.length === 1) {
      const { key: s, program: r, group: n } = i[0], { [e]: o, ...a } = n.ids;
      this._expand(s, r, { slot: n.slot, days: [e], ids: o ? { [e]: o } : {} }), this._rest = { slot: structuredClone(n.slot), days: n.days.filter((d) => d !== e), ids: a }, this._dayOnly = e;
    } else !i.length && this._canEdit && (this._add([e]), this._dayOnly = e);
  }
  /** Translated service names of the actions of the labels. */
  _loadNames() {
    const e = /* @__PURE__ */ new Set();
    for (const t of this.data.labels) t.action.kind === "service" && e.add(t.action.service.split(".")[0]);
    se(this.hass, [...e]).then((t) => t && this.requestUpdate());
  }
  willUpdate(e) {
    (!this._chartEntity || e.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const t = this._programs[0];
    if (this.chart && t && this.hass) {
      const i = `${t.id}|${t.revision}|${this._date}`;
      i !== this._loaded && (this._loaded = i, this._loadPreview(t.id, this._date, i));
    }
  }
  get _today() {
    return pt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Ai(this._today, this._offset);
  }
  async _loadPreview(e, t, i) {
    const s = ++this._token;
    try {
      const r = await this.hass.callWS({ type: "weekly_planner/preview", program_id: e, date: t });
      s === this._token && i === this._loaded && (this._slots = r.slots);
    } catch {
      s === this._token && (this._slots = null);
    }
  }
  _go(e) {
    const t = this._offset + e;
    t < -14 || t > ge || (this._slots = null, this._offset = t);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(e, t, i, s = null) {
    this._open = e, this._programId = t.id, this._group = i ? structuredClone(i) : null, this._restLabel = s, this._draft = structuredClone(t), this._error = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var r;
      return (r = this.renderRoot.querySelector(".editor")) == null ? void 0 : r.scrollIntoView({ block: "start" });
    }));
  }
  _cancel() {
    this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._draft = null, this._restLabel = null, this._error = "";
  }
  _onOverride(e) {
    const t = this._draft;
    t && (this._draft = {
      ...t,
      entities: t.entities.map((i) => {
        if (i.entity_id !== e.entityId) return i;
        const s = { ...i.label_overrides ?? {} };
        return e.action ? s[e.labelId] = e.action : delete s[e.labelId], { ...i, label_overrides: s };
      })
    });
  }
  _add(e = Me) {
    const t = this._programs[0], i = this._entities[0];
    if (!t || !i) return;
    const s = ki(this.hass, this.data, this._entities)[0], r = { id: rt(), start: { time: "08:00" }, end: { time: "09:00" }, conditions: [], label: (s == null ? void 0 : s.id) ?? "" };
    this._expand("new", t, { slot: r, days: [...e], ids: {}, fresh: !0 });
  }
  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  _duplicate() {
    const e = this._programs.find((o) => o.id === this._programId), t = this._group;
    if (!e || !t) return;
    const { start: i, end: s } = t.slot, r = s ? Math.max(15, fe(this.hass, s) - fe(this.hass, i)) : 60, n = {
      ...structuredClone(t.slot),
      id: rt(),
      start: te(i, r),
      end: s ? te(s, r) : null
    };
    this._expand("new", e, { slot: n, days: [...t.days], ids: {}, fresh: !0 }), this._rest = null;
  }
  /* ---- saving ---- */
  async _saveProgram(e) {
    var t, i;
    this._saving = !0;
    try {
      return await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(e) }), !0;
    } catch (s) {
      const r = s;
      return (r == null ? void 0 : r.code) === "conflict" ? this._error = c(this._lang, "ss_conflict") : (r == null ? void 0 : r.code) === "unauthorized" ? this._error = c(this._lang, "err_unauthorized") : (t = r == null ? void 0 : r.message) != null && t.includes("unknown_label") ? this._error = c(this._lang, "err_label") : (i = r == null ? void 0 : r.message) != null && i.includes("overlapping_slots") ? this._error = c(this._lang, "w_err_overlap") : this._error = c(this._lang, "ss_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  _problem(e) {
    const t = this._lang, i = this._group;
    return i ? i.days.length ? i.slot.end && JSON.stringify(i.slot.start) === JSON.stringify(i.slot.end) ? c(t, "w_err_same") : K(this.data, i.slot.label) ? "" : c(t, "err_action") : c(t, "err_days") : "";
  }
  /** The rest of a group edited from one day, minus the days the edit now covers. */
  _kept(e) {
    const t = this._rest;
    if (!t) return [];
    const i = t.days.filter((r) => !e.includes(r)), s = Object.fromEntries(i.filter((r) => t.ids[r]).map((r) => [r, t.ids[r]]));
    return i.length ? [{ ...t, days: i, ids: s }] : [];
  }
  async _saveRow() {
    var _;
    const e = this._programs.find((f) => f.id === this._programId), t = this._group;
    if (!e || !t) return;
    const i = this._problem(e);
    if (i) {
      this._error = i;
      return;
    }
    const s = Dt(e, this.data), r = this._include, n = me(s, r, this._minutes).filter((f) => `${e.id}|${f.ids[f.days[0]]}` !== this._open);
    n.push(...this._kept(t.days), t);
    const o = si(s, n, r, this._minutes);
    for (const f of o.days)
      if (Ks(f)) {
        this._error = c(this._lang, "w_err_overlap");
        return;
      }
    const a = ((_ = this._draft) == null ? void 0 : _.entities) ?? e.entities;
    await this._saveProgram({ ...e, entities: a, profiles: e.profiles.map((f) => f.id === s.id ? o : f) }) && this._cancel();
  }
  async _deleteRow() {
    const e = this._programs.find((n) => n.id === this._programId);
    if (!e || this._open === "new" || !await _t(this, c(this._lang, "w_confirm_slot"), c(this._lang, "yes"), c(this._lang, "no"))) return;
    const t = Dt(e, this.data), i = this._include, s = me(t, i, this._minutes).filter((n) => `${e.id}|${n.ids[n.days[0]]}` !== this._open);
    s.push(...this._kept([]));
    const r = si(t, s, i, this._minutes);
    await this._saveProgram({ ...e, profiles: e.profiles.map((n) => n.id === t.id ? r : n) }) && this._cancel();
  }
  async _saveRest(e) {
    const t = this._programs[0];
    if (!t) return;
    const i = (this._draft ?? t).entities.map((s) => s.entity_id === e ? { ...s, default_label: this._restLabel } : s);
    await this._saveProgram({ ...t, entities: i }) && this._cancel();
  }
  /* ---- pause / delete ---- */
  get _enabled() {
    return this._programs.some((e) => e.enabled);
  }
  async _setEnabled(e, t) {
    if (!e && !await _t(this, c(this._lang, "confirm_pause", { name: this._title }), c(this._lang, "yes"), c(this._lang, "no"))) {
      t.checked = !0;
      return;
    }
    try {
      for (const i of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: i.id, enabled: e });
    } catch (i) {
      this._error = c(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    }
  }
  async _deleteAll() {
    if (await _t(this, c(this._lang, "confirm_delete_schedule", { name: this._title }), c(this._lang, "yes"), c(this._lang, "no")))
      try {
        for (const e of this._programs) {
          const t = this.scope.kind === "device" ? this.scope.entityId : null;
          if (!t || e.entities.length <= 1) {
            await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: e.id });
            continue;
          }
          const i = structuredClone(e);
          i.entities = i.entities.filter((s) => s.entity_id !== t), await this.hass.callWS({ type: "weekly_planner/program/save", program: i });
        }
        this._closeDialog();
      } catch (e) {
        this._error = c(this._lang, "error", { message: (e == null ? void 0 : e.message) ?? String(e) });
      }
  }
  /** Leave the screen and open the Home Assistant history of the device (navigate: pushState + location-changed). */
  _openHistory(e) {
    this._closeDialog(), window.history.pushState(null, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
  }
  _closeDialog() {
    var e;
    (e = this.renderRoot.querySelector("wp-dialog")) == null || e.close();
  }
  _settings() {
    const e = this._programs[0];
    e && this.dispatchEvent(new CustomEvent("open-settings", { detail: { programId: e.id }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _when(e) {
    const t = this._lang, i = xe(t, e.start);
    return e.end ? `${i}–${xe(t, e.end)}` : i;
  }
  _rowText(e) {
    const t = this._lang, i = K(this.data, e.slot.label), s = Ls(t, Z(t).days_short, e.days);
    return {
      text: [(i == null ? void 0 : i.name) ?? "", this._when(e.slot)].filter(Boolean).join(" · "),
      days: s,
      color: (i == null ? void 0 : i.color) ?? "var(--disabled-text-color)"
    };
  }
  _renderRow(e) {
    const { program: t, group: i, key: s } = e;
    if (this._open === s && this._group) return this._renderEditor(t, s);
    const { text: r, days: n, color: o } = this._rowText(i);
    return l`<button class="row" aria-expanded="false" @click=${() => this._expand(s, t, i)}>
      <span class="dot" style="background:${o}"></span>
      <span class="txt"><span class="l1">${r}</span><span class="l2">${n}</span>${this._programs.length > 1 ? l`<small>${t.name}</small>` : h}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(e, t) {
    const i = this._lang, s = t === "new", r = this._entities.filter((n) => e.entities.some((o) => o.entity_id === n));
    return l`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .group=${this._group} .entityIds=${r}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @override-change=${(n) => {
      n.stopPropagation(), this._onOverride(n.detail);
    }}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>
      ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : h}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${c(i, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${c(i, "cancel")}</button>
      </div>
      ${s ? h : l`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${c(i, "duplicate")}</button>`}
      ${s ? h : l`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${c(i, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const e = this._lang, t = this._programs[0];
    return t ? this._entities.filter((i) => t.entities.some((s) => s.entity_id === i)).map((i) => {
      const s = t.entities.find((a) => a.entity_id === i), r = `rest:${i}`, n = this._entities.length > 1 ? `${c(e, "rest_of_time")} · ${ot(this.hass, i)}` : c(e, "rest_of_time");
      if (this._open === r)
        return l`<div class="editor"><h4>${n}</h4>
          <wp-label-picker allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .entityIds=${[i]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @override-change=${(a) => {
          a.stopPropagation(), this._onOverride(a.detail);
        }}
            @label-change=${(a) => {
          a.stopPropagation(), this._restLabel = a.detail;
        }}></wp-label-picker>
          ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : h}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(i)}>${c(e, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${c(e, "cancel")}</button>
          </div></div>`;
      const o = K(this.data, s.default_label);
      return l`<button class="row rest" aria-expanded="false" @click=${() => this._expand(r, t, null, s.default_label ?? null)}>
        ${o ? l`<span class="dot" style="background:${o.color}"></span>` : l`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${n} · <b>${o ? o.name : c(e, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : h;
  }
  _renderChart() {
    const e = this._lang, t = this._programs[0];
    if (!this.chart || !t || !this._chartEntity) return h;
    const i = this._date, s = new Intl.DateTimeFormat(e, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${i}T12:00:00Z`));
    return l`<section class="chart">
      ${this._entities.length > 1 ? l`<select aria-label=${c(e, "chart")} @change=${(r) => this._chartEntity = r.target.value}>
        ${this._entities.map((r) => l`<option value=${r} ?selected=${r === this._chartEntity}>${ot(this.hass, r)}</option>`)}</select>` : h}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${c(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? c(e, "today") : s}</span>
        <button class="ibtn" ?disabled=${this._offset >= ge} aria-label=${c(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${t} entity-id=${this._chartEntity} date=${i}
        .slots=${this._slots} @open-history=${(r) => this._openHistory(r.detail)}></wp-chart>
    </section>`;
  }
  render() {
    var s;
    if (!this.hass || !this.data || !this.scope) return h;
    const e = this._lang;
    if (!this._programs.length)
      return l`<wp-dialog open heading=${this._title}><p class="muted">${c(e, "no_program")}</p></wp-dialog>`;
    const t = this._rows(), i = !!((s = this.hass.user) != null && s.is_admin) && this.data.can_edit;
    return l`
      <wp-dialog open heading=${this._title}>
        ${i ? l`<button slot="header-actions" class="gear" aria-label=${c(e, "settings")} @click=${() => this._settings()}>
          <ha-icon icon="mdi:cog"></ha-icon></button>` : h}
        ${this._canEdit ? h : l`<p class="err" role="alert">${c(e, "read_only")}</p>`}
        ${this._error && !this._open ? l`<p class="err" role="alert">${this._error}</p>` : h}
        <div class="list">
          ${t.length ? t.map((r) => this._renderRow(r)) : this._open === "new" ? h : l`<p class="muted">${c(e, "w_none")}</p>`}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : h}
          ${this._open === null ? l`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${c(e, "w_add")}</span></button>` : h}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? h : l`${this._renderChart()}
        <label class="switch">
          <span class="grow">${c(e, "schedule_on")}</span>
          <span class="state">${this._enabled ? c(e, "running") : c(e, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(r) => void this._setEnabled(r.target.checked, r.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${c(e, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
A.styles = [et, T`
    :host { display: contents; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; text-align: left;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 16px;
      cursor: pointer; width: 100%; --mdc-icon-size: 22px;
    }
    .row .txt { flex: 1; min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
    .row .txt .l1, .row .txt .l2 { display: block; }
    .row .txt .l2 { color: var(--secondary-text-color); font-size: 14px; }
    .row.rest .txt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
    .row .txt small { display: block; color: var(--secondary-text-color); font-size: 12px; }
    .row.add { border-style: dashed; color: var(--primary-color); font-weight: 500; }
    .row.rest { background: var(--secondary-background-color); }
    .row:disabled { opacity: 0.5; cursor: default; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .editor { border: 2px solid var(--primary-color); border-radius: 12px; padding: 12px; }
    .editor h4 { margin: 0 0 8px; font-size: 15px; }
    .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .btns .btn { flex: 1 1 120px; }
    .btn.alone { width: 100%; margin-top: 32px; }
    .btn.dup { width: 100%; margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; --mdc-icon-size: 20px; }
    .editor { scroll-margin-top: 8px; }
    .btn.danger-line { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
    .btn.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    .err { color: var(--error-color, #db4437); margin: 8px 0; }
    .muted { color: var(--secondary-text-color); }
    .chart { margin-top: 16px; }
    .chart .nav { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 500; }
    .chart select { margin-bottom: 4px; }
    .gear {
      border: none; background: none; color: inherit; width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 24px;
    }
    .gear:hover { background: var(--secondary-background-color); }
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-top: 12px; font-size: 16px; }
    .switch .state { font-size: 14px; color: var(--secondary-text-color); }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `];
O([
  m({ attribute: !1 })
], A.prototype, "hass", 2);
O([
  m({ attribute: !1 })
], A.prototype, "data", 2);
O([
  m({ attribute: !1 })
], A.prototype, "scope", 2);
O([
  m({ type: Boolean })
], A.prototype, "chart", 2);
O([
  m({ attribute: !1 })
], A.prototype, "day", 2);
O([
  $()
], A.prototype, "_open", 2);
O([
  $()
], A.prototype, "_group", 2);
O([
  $()
], A.prototype, "_dayOnly", 2);
O([
  $()
], A.prototype, "_draft", 2);
O([
  $()
], A.prototype, "_restLabel", 2);
O([
  $()
], A.prototype, "_programId", 2);
O([
  $()
], A.prototype, "_error", 2);
O([
  $()
], A.prototype, "_saving", 2);
O([
  $()
], A.prototype, "_offset", 2);
O([
  $()
], A.prototype, "_slots", 2);
O([
  $()
], A.prototype, "_chartEntity", 2);
A = O([
  I("wp-schedule")
], A);
function ye(e, t) {
  var r, n;
  const i = (n = (r = e.states[t]) == null ? void 0 : r.attributes) == null ? void 0 : n.friendly_name;
  if (typeof i == "string" && i) return i;
  const s = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : t;
}
const ni = /* @__PURE__ */ new WeakSet();
function Ys(e) {
  if (!e || ni.has(e)) return;
  ni.add(e);
  const t = () => {
    e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  };
  e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
const Xs = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var Qs = Object.defineProperty, Zs = Object.getOwnPropertyDescriptor, U = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Zs(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Qs(t, i, r), r;
};
const oi = () => [[], [], [], [], [], [], []];
function ai(e) {
  return e.map((t) => ({ ...structuredClone(t), id: rt() }));
}
let N = class extends E {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._pickerKey = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this._picker || bi().then((e) => this._picker = e);
  }
  get _lang() {
    return lt(this.hass);
  }
  _tr(e, t) {
    return c(this._lang, e, t);
  }
  _long(e) {
    return Z(this._lang).days[e];
  }
  _short(e) {
    return Z(this._lang).days_short[e];
  }
  /* ---- initial state ---- */
  willUpdate(e) {
    if (!(this._ready && !e.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const t = rt();
        this._p = {
          id: "",
          revision: 0,
          name: "",
          icon: "mdi:calendar-clock",
          priority: 10,
          enabled: !0,
          reapply: !0,
          conditions: [],
          entities: [],
          active_profile: t,
          profiles: [{ id: t, name: this._tr("profile_default"), days: oi() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._tab = "general";
    }
  }
  _activeId() {
    var i, s;
    const e = this._p, t = !this._isNew && ((i = this.data.status[e.id]) == null ? void 0 : i.active_profile) || e.active_profile;
    return ((s = e.profiles.find((r) => r.id === t)) == null ? void 0 : s.id) ?? e.profiles[0].id;
  }
  get _profile() {
    return this._p.profiles.find((e) => e.id === this._profileId) ?? this._p.profiles[0];
  }
  _patch(e) {
    this._p = { ...this._p, ...e }, this._error = "";
  }
  _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  /* ---- profile / days ---- */
  _setProfile(e) {
    this._patch({ profiles: this._p.profiles.map((t) => t.id === e.id ? e : t) });
  }
  _submitProfileForm() {
    const e = this._profileForm;
    if (!e) return;
    const t = e.name.trim(), i = this._p.profiles.some((s) => s.name === t && !(e.mode === "rename" && s.id === this._profileId));
    if (!t || i || t.length > 40) {
      this._error = this._tr("err_profile_name");
      return;
    }
    if (e.mode === "rename")
      this._setProfile({ ...this._profile, name: t });
    else {
      const s = this._profile, r = {
        id: rt(),
        name: t,
        days: e.mode === "copy" ? s.days.map(ai) : oi()
      };
      this._patch({ profiles: [...this._p.profiles, r] }), this._profileId = r.id;
    }
    this._profileForm = void 0, this._error = "";
  }
  _deleteProfile() {
    const e = this._profile, t = this._p.profiles.filter((i) => i.id !== e.id);
    this._patch({ profiles: t }), this._profileId = this._activeId(), t.some((i) => i.id === this._profileId) || (this._profileId = t[0].id);
  }
  /* ---- entities ---- */
  _setEntity(e, t) {
    this._patch({ entities: this._p.entities.map((i, s) => s === e ? { ...i, ...t } : i) });
  }
  _addEntity(e) {
    !e || this._p.entities.some((t) => t.entity_id === e) || (this._pickerKey += 1, this._patch({ entities: [...this._p.entities, { entity_id: e, default_label: null, label_overrides: {} }] }));
  }
  /* ---- save / delete ---- */
  _validate() {
    const e = this._p;
    if (!e.name.trim()) return this._tr("err_name");
    if (!e.entities.length) return this._tr("err_no_entity");
    if (e.conditions.some((i) => !i.entity_id)) return this._tr("err_incomplete");
    const t = e.profiles.map((i) => i.name.trim());
    return new Set(t).size !== t.length ? this._tr("err_profile_name") : "";
  }
  _payload() {
    const e = structuredClone(this._p), t = new Set(e.entities.map((i) => i.entity_id));
    return e.name = e.name.trim(), e.entities = e.entities.filter((i) => t.has(i.entity_id)), this._isNew && delete e.id, e;
  }
  _errorText(e) {
    const t = e, i = (t == null ? void 0 : t.message) ?? String(e);
    return (t == null ? void 0 : t.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (t == null ? void 0 : t.code) === "unauthorized" ? this._tr("err_unauthorized") : i.includes("overlapping_slots") ? this._tr("err_overlap_server") : i.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: i });
  }
  async _save() {
    const e = this._validate();
    if (e) {
      this._error = e;
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: this._payload() }), this._close();
    } catch (t) {
      this._error = this._errorText(t);
    } finally {
      this._saving = !1;
    }
  }
  async _askDelete() {
    await _t(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(e) {
    await _t(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(e) {
    var s;
    const t = (s = this._p.entities[e]) == null ? void 0 : s.entity_id;
    if (!t) return;
    const i = this._tr("confirm_delete", { name: ye(this.hass, t) });
    await _t(this, i, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((r, n) => n !== e) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = rt(), t = this._p, i = /* @__PURE__ */ new Map(), s = t.profiles.map((r) => {
      const n = r.id === this._activeId() ? e : rt();
      return i.set(r.id, n), { ...structuredClone(r), id: n, days: r.days.map(ai) };
    });
    this._p = {
      ...structuredClone(t),
      id: "",
      revision: 0,
      created_at: void 0,
      name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles: s,
      active_profile: i.get(this._activeId()) ?? s[0].id
    }, delete this._p.created_at, this._isNew = !0, this._profileId = this._p.active_profile ?? s[0].id, this._error = "";
  }
  _close() {
    var e;
    (e = this.renderRoot.querySelector("#main")) == null || e.close();
  }
  /* ---- render: tabs ---- */
  _renderGeneral() {
    const e = this._p;
    return l`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${e.name}
          @input=${(t) => this._patch({ name: t.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? l`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${e.icon ?? ""}
                @value-changed=${(t) => this._patch({ icon: t.detail.value || null })}></ha-selector>` : l`<div class="row" style="flex-wrap:nowrap">
                ${e.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${e.icon}></ha-icon>` : h}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${e.icon ?? ""}
                  @input=${(t) => this._patch({ icon: t.target.value.trim() || null })} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(t) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(t.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${e.reapply}
        @change=${(t) => this._patch({ reapply: t.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions}
        @wp-change=${(t) => {
      t.stopPropagation(), this._patch({ conditions: t.detail });
    }}></wp-conditions-editor>
    `;
  }
  updated() {
    Ys(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const e = this._p;
    return l`
      ${e.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : h}
      ${e.entities.map((t, i) => this._renderEntity(t, i))}
      ${fi(this._pickerKey, this._picker ? l`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: e.entities.map((t) => t.entity_id) } }}
            .label=${this._tr("pe_add_entity")} .value=${""}
            @value-changed=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail.value ?? "");
    }}></ha-selector>` : l`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${ye(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? h : l`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${ye(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
      </div>`;
  }
  _renderSeasons() {
    const e = this._p, t = this._profile, i = this._activeId(), s = this._profileForm;
    return l`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(r) => {
      this._profileId = r.target.value;
    }}>
            ${e.profiles.map((r) => l`<option value=${r.id} ?selected=${r.id === t.id}>${r.name}${r.id === i ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: t.name }}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${e.profiles.length < 2 || t.id === i}
          @click=${() => void this._askDeleteProfile(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${t.id === i ? l`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : h}
      ${s ? l`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(r) => this._profileForm = { ...s, name: r.target.value }}
                @keydown=${(r) => {
      r.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${s.mode === "rename" ? l`<p class="hint">${this._tr("profile_rename_warning")}</p>` : h}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : h}
    `;
  }
  render() {
    if (!this._p) return h;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]], t = this._canEdit();
    return l`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? h : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([i, s]) => l`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(s)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        ${this._isNew ? h : l`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? h : l`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!t}
              @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>`}
      </wp-dialog>
    `;
  }
};
N.styles = [
  et,
  T`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${di(Xs)}
      .break { display: none; }
      @media (max-width: 520px) {
        .break { display: block; order: 3; flex: 1 0 100%; height: 0; }
        .del { order: 4; margin-right: auto; }
      }
      @media (min-width: 521px) { .del { order: -1; margin-right: auto; } }
      .profile-bar { align-items: flex-end; gap: 4px; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `
];
U([
  m({ attribute: !1 })
], N.prototype, "hass", 2);
U([
  m({ attribute: !1 })
], N.prototype, "data", 2);
U([
  m({ attribute: !1 })
], N.prototype, "program", 2);
U([
  m({ attribute: !1 })
], N.prototype, "defaultTypes", 2);
U([
  $()
], N.prototype, "_p", 2);
U([
  $()
], N.prototype, "_isNew", 2);
U([
  $()
], N.prototype, "_tab", 2);
U([
  $()
], N.prototype, "_profileId", 2);
U([
  $()
], N.prototype, "_error", 2);
U([
  $()
], N.prototype, "_saving", 2);
U([
  $()
], N.prototype, "_picker", 2);
U([
  $()
], N.prototype, "_profileForm", 2);
N = U([
  I("wp-program-editor")
], N);
var tr = Object.defineProperty, er = Object.getOwnPropertyDescriptor, it = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? er(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && tr(t, i, r), r;
};
const ir = {
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  light: "mdi:lightbulb",
  switch: "mdi:power-plug",
  input_boolean: "mdi:toggle-switch",
  fan: "mdi:fan",
  vacuum: "mdi:robot-vacuum",
  water_heater: "mdi:water-boiler",
  media_player: "mdi:play-box",
  lock: "mdi:lock",
  button: "mdi:gesture-tap-button"
};
let V = class extends E {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._previewKey = "";
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }
  setConfig(e) {
    this._config = { show_chart: !0, ...e };
  }
  getCardSize() {
    var e;
    return 2 + (((e = this._data) == null ? void 0 : e.programs.length) ?? 1) * 2;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this._clock = window.setInterval(() => this._now = /* @__PURE__ */ new Date(), 6e4);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._unsub) == null || e.call(this), this._unsub = void 0, window.clearInterval(this._clock);
  }
  updated(e) {
    e.has("hass") && this.hass && !this._unsub && (this._unsub = os(this.hass, (t) => {
      this._data = t, this._error = void 0, this._loadNames(t), this._loadPreviews();
    }));
  }
  get _lang() {
    var e, t, i;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /** The moment `offset` days from now (only its local date and weekday are used). */
  _dateAt(e) {
    return new Date(this._now.getTime() + e * 864e5);
  }
  /** Translated names of the services used by the labels. */
  async _loadNames(e) {
    const t = e.labels.flatMap((i) => i.action.kind === "service" ? [i.action.service.split(".")[0]] : []);
    await se(this.hass, t) && this.requestUpdate();
  }
  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = [0, 1, 2, 3, 4, 5, 6].map((r) => pt(this._dateAt(r), this._tz)), t = Xe(this._data, this._config), i = `${e[0]}|${t.map((r) => `${r.id}:${r.revision}`).join(",")}`;
    if (i === this._previewKey) return;
    this._previewKey = i;
    const s = {};
    await Promise.all(e.flatMap((r) => t.map((n) => this.hass.callWS({ type: "weekly_planner/preview", program_id: n.id, date: r }).then((o) => {
      (s[r] ?? (s[r] = {}))[n.id] = o.slots;
    }).catch(() => {
    })))), i === this._previewKey && (this._preview = s);
  }
  /* ---- blocks ---- */
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  _spans(e, t, i = 0) {
    const s = this._data, r = this._dateAt(i), n = be(r, this._tz), o = this._preview[pt(r, this._tz)] ?? {}, a = [];
    for (const d of [...t].reverse()) {
      if (!d.enabled) continue;
      const _ = Dt(d, s), f = (y) => Zt(d, e, K(s, y.label)), v = (y, g, w, j = {}) => {
        const u = K(s, y.label);
        return { start: g, end: w, color: u.color, label: u.name, ...j };
      };
      for (const { slot: y, end: g } of gi(_.days[(n + 6) % 7]))
        f(y) && a.push(v(y, 0, g));
      const x = o[d.id];
      for (const y of _.days[n]) {
        if (!f(y)) continue;
        const g = x == null ? void 0 : x.find((u) => u.slot_id === y.id);
        let w = at(y.start), j = at(y.end ?? null);
        g && (w = Mt(g.start, this._tz), j = g.end ? Mt(g.end, this._tz) : null), w !== null && a.push(v(
          y,
          w,
          j === null ? w + 10 : j > w ? j : D,
          { sun: "sun" in y.start || !!(y.end && "sun" in y.end), ignored: (g == null ? void 0 : g.ignored) ?? null }
        ));
      }
    }
    return a;
  }
  _next(e, t) {
    var s, r;
    const i = this._data;
    for (const n of t) {
      if (!n.enabled) continue;
      const o = (r = (s = i.status[n.id]) == null ? void 0 : s.next_actions) == null ? void 0 : r[e];
      if (o) return o;
    }
  }
  /* ---- actions ---- */
  _open(e, t) {
    this._dialog = { kind: "schedule", scope: e, day: t };
  }
  /* ---- render ---- */
  _line(e, t, i) {
    var v, x;
    const s = this._lang, r = this._data, n = this._next(e, t), o = K(r, n == null ? void 0 : n.label), a = t.length > 0 && t.every((y) => !y.enabled), d = this.hass.states[e], _ = i.icon ?? (d == null ? void 0 : d.attributes.icon) ?? ir[vt(e)] ?? "mdi:calendar-clock", f = () => this._open(i.open);
    return l`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${_}></ha-icon>
          <div class="info">
            ${i.name ? l`<span class="name">${i.name}</span>` : h}
            <span class="now">
              <span class="nw">${d ? ((x = (v = this.hass).formatEntityState) == null ? void 0 : x.call(v, d)) ?? d.state : "—"}</span>
              ${n ? l`<span class="next">→ ${(o == null ? void 0 : o.name) ?? Oe(this.hass, s, n.action)}
                <span class="when nw">${ve(es(n.at, this._tz, s, this._now))}</span></span>` : h}
            </span>
          </div>
          ${a ? l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${c(s, "paused")}></ha-icon>` : h}
          ${i.button ? l`<button class="hours" aria-label=${c(s, "hours")} title=${c(s, "hours")} @click=${f}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : h}
        </div>
        <div class="today">
          <span class="wname">${c(s, "today_short")}</span>
          <wp-day-bar show-hours notches .spans=${this._spans(e, t)} .now=${Mt(this._now, this._tz)}
            @click=${f}></wp-day-bar>
        </div>
        ${this._weekRows(`${ri(i.open)}|${e}`, e, t, i.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(e, t, i, s) {
    const r = this._lang, n = this._week.has(e), o = () => {
      const d = new Set(this._week);
      n ? d.delete(e) : d.add(e), this._week = d;
    }, a = Z(r).days_short;
    return l`
      <button class="weekbtn" aria-expanded=${n} @click=${o}>
        <ha-icon icon=${n ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${c(r, "week")}</button>
      ${n ? l`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((d) => {
      const _ = (d - be(this._now, this._tz) + 7) % 7;
      return l`<button class="wday" aria-label=${a[d]} @click=${() => this._open(s, { weekday: d, offset: _ })}>
            <span class="wname ${_ === 0 ? "today" : ""}">${a[d]}</span>
            <wp-day-bar notches .spans=${this._spans(t, i, _)}></wp-day-bar></button>`;
    })}
      </div>` : h}`;
  }
  _bySchedule(e) {
    const t = this._lang;
    return e.map((i) => {
      const s = { kind: "program", programId: i.id };
      return i.entities.length === 1 ? this._line(i.entities[0].entity_id, [i], { name: i.name, icon: i.icon ?? void 0, button: s, open: s }) : l`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${i.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${i.name}</h2>
          ${i.enabled ? h : l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${c(t, "paused")}></ha-icon>`}
          <button class="hours" aria-label=${c(t, "hours")} title=${c(t, "hours")} @click=${() => this._open(s)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
        </div>
        ${i.entities.map((r) => this._line(r.entity_id, [i], { name: ot(this.hass, r.entity_id), button: null, open: s }))}
      </section>`;
    });
  }
  render() {
    var n;
    if (!this._config || !this.hass) return h;
    const e = this._lang, t = this._data, i = t ? Xe(t, this._config) : [], s = !!t && !!((n = this.hass.user) != null && n.is_admin) && !!(t != null && t.can_edit), r = this._config.title !== void 0 && this._config.title !== "";
    return l`
      <ha-card>
        ${r || s || t != null && t.vacation ? l`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t != null && t.vacation ? l`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${c(e, "vacation")}</span>` : h}
              ${s ? l`<button class="gear" aria-label=${c(e, "all_programs")} @click=${() => this._dialog = { kind: "admin" }}>
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon></button>` : h}
            </div>` : h}
        ${this._error ? l`<div class="error">${c(e, "error", { message: this._error })}</div>` : h}
        ${t != null && t.read_only ? l`<div class="error">${c(e, "read_only")}</div>` : h}
        ${t ? h : l`<div class="empty">…</div>`}
        ${t && !i.length ? l`<div class="empty">${c(e, "no_program")}</div>` : h}
        ${t ? this._bySchedule(i) : h}
      </ha-card>
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    const e = this._dialog;
    if (!e || !this._data) return h;
    const t = () => this._dialog = null;
    switch (e.kind) {
      case "schedule":
        return fi(ri(e.scope), l`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope} .day=${e.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${t}
          @open-settings=${(i) => {
          const s = this._data.programs.find((r) => r.id === i.detail.programId);
          s && (this._dialog = { kind: "program", program: s });
        }}></wp-schedule>`);
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          @closed=${t}></wp-program-editor>`;
      case "labels":
        return l`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${t}></wp-labels>`;
      case "admin": {
        const i = this._lang;
        return l`<wp-dialog open heading=${c(i, "all_programs")} @closed=${t}>
          <div class="adm">
            <button class="admrow" @click=${() => this._dialog = { kind: "labels" }}>
              <ha-icon icon="mdi:label-multiple-outline"></ha-icon><span>${c(i, "labels")}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>
            ${this._data.programs.map((s) => l`<button class="admrow" @click=${() => this._dialog = { kind: "program", program: s }}>
              <ha-icon icon=${s.icon ?? "mdi:calendar-clock"}></ha-icon><span>${s.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => this._dialog = { kind: "program" }}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${c(i, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }
};
V.styles = T`
    ha-card { padding: 8px 16px 12px; }
    .head { display: flex; align-items: center; gap: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; font-size: 14px; padding: 2px 10px; border-radius: 12px; background: var(--warning-color, #ff9800); color: #fff; }
    .gear {
      border: none; background: none; color: inherit; width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 22px; flex: none;
    }
    .gear:hover { background: var(--secondary-background-color); }
    .block { padding: 8px 0; border-top: 1px solid var(--divider-color); }
    .block:first-of-type, .head + .block { border-top: none; }
    .line { display: flex; align-items: flex-start; gap: 10px; min-height: 28px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); margin-top: -1px; }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .next { min-width: 0; overflow-wrap: anywhere; }
    .when { opacity: 0.8; }
    .pause { --mdc-icon-size: 20px; color: var(--secondary-text-color); flex: none; margin-top: 2px; }
    .name, .now { line-height: 24px; }
    button.hours {
      flex: none; width: 48px; height: 48px; padding: 0; border-radius: 24px; border: none;
      background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 24px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.hours:hover { background: var(--secondary-background-color); }
    .line button.hours { margin: -12px 0; }
    wp-day-bar { cursor: pointer; margin-top: 2px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday {
      display: flex; align-items: center; gap: 8px; min-height: 48px; width: 100%; padding: 0; border: none; border-radius: 8px;
      background: none; color: inherit; font: inherit; cursor: pointer; text-align: left;
    }
    .wday:hover { background: var(--secondary-background-color); }
    .wname { flex: none; width: 36px; font-size: 14px; color: var(--secondary-text-color); }
    .wday wp-day-bar, .today wp-day-bar { flex: 1; min-width: 0; }
    .wname.today { color: var(--primary-text-color); font-weight: 600; }
    .today { display: flex; align-items: flex-start; gap: 8px; }
    .today .wname { line-height: 28px; margin-top: 2px; }
    .prog { padding: 8px 0 4px; border-top: 1px solid var(--divider-color); }
    .prog:first-of-type, .head + .prog { border-top: none; }
    .prog .block { border-top: none; padding: 2px 0 4px; }
    .phead { display: flex; align-items: center; gap: 10px; min-height: 48px; --mdc-icon-size: 24px; }
    .phead h2 { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; overflow-wrap: anywhere; }
    .empty { color: var(--primary-text-color); opacity: 0.8; padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 14px; margin: 8px 0; }
    .adm { display: flex; flex-direction: column; gap: 8px; }
    .admrow {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 12px; border-radius: 12px; font: inherit; font-size: 16px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; text-align: left;
    }
    .admrow span { flex: 1; }
    .admrow.add { border-style: dashed; color: var(--primary-color); }
  `;
it([
  m({ attribute: !1 })
], V.prototype, "hass", 2);
it([
  $()
], V.prototype, "_config", 2);
it([
  $()
], V.prototype, "_data", 2);
it([
  $()
], V.prototype, "_error", 2);
it([
  $()
], V.prototype, "_dialog", 2);
it([
  $()
], V.prototype, "_preview", 2);
it([
  $()
], V.prototype, "_now", 2);
it([
  $()
], V.prototype, "_week", 2);
V = it([
  I("weekly-planner-card")
], V);
var sr = Object.defineProperty, rr = Object.getOwnPropertyDescriptor, re = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? rr(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && sr(t, i, r), r;
};
const nr = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let At = class extends E {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return lt(this.hass);
  }
  _tr(e, t) {
    return c(this._lang, e, t);
  }
  updated(e) {
    e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, this.hass.callWS({ type: "weekly_planner/get" }).then((t) => this._programs = t.programs.map((i) => ({ id: i.id, name: i.name }))).catch(() => this._loaded = !1));
  }
  _emit(e) {
    this._config = e, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 }));
  }
  _set(e, t) {
    const i = { ...this._config };
    t === void 0 || t === "" || t === null ? delete i[e] : i[e] = t, this._emit(i);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(e) {
    var i, s;
    const t = { ...this._config };
    e ? (delete t.filter, t.program = ((i = this._programs[0]) == null ? void 0 : i.id) ?? "") : (delete t.program, t.filter = { types: ((s = t.filter) == null ? void 0 : s.types) ?? [] }), this._emit(t);
  }
  _setFilter(e) {
    var s;
    const t = { ...this._config.filter ?? {}, ...e };
    (s = t.types) != null && s.length || delete t.types, t.area || delete t.area;
    const i = { ...this._config, filter: t };
    this._emit(i);
  }
  render() {
    var i, s;
    const e = this._config, t = ((i = e.filter) == null ? void 0 : i.types) ?? [];
    return l`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(r) => this._set("title", r.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? l`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(r) => this._set("program", r.target.value)}>
              ${this._programs.length === 0 ? l`<option value="">${this._tr("no_program")}</option>` : h}
              ${!this._programs.some((r) => r.id === e.program) && e.program ? l`<option value=${e.program} selected>${e.program}</option>` : h}
              ${this._programs.map((r) => l`<option value=${r.id} ?selected=${r.id === e.program}>${r.name}</option>`)}
            </select></div>` : l`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${nr.map((r) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(r)}
                @change=${(n) => this._setFilter({ types: n.target.checked ? [...t, r] : t.filter((o) => o !== r) })} />
                ${ws(this._lang, r)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((s = e.filter) == null ? void 0 : s.area) ?? ""} placeholder="bureau"
                @input=${(r) => this._setFilter({ area: r.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(r) => this._set("show_chart", r.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
At.styles = [et, T`:host { display: block; padding: 4px 0; }`];
re([
  m({ attribute: !1 })
], At.prototype, "hass", 2);
re([
  $()
], At.prototype, "_config", 2);
re([
  $()
], At.prototype, "_programs", 2);
At = re([
  I("weekly-planner-card-editor")
], At);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
