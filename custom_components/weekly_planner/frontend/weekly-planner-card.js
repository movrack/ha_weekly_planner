/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xe = globalThis, ri = xe.ShadowRoot && (xe.ShadyCSS === void 0 || xe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ni = Symbol(), Si = /* @__PURE__ */ new WeakMap();
let ps = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== ni) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (ri && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = Si.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Si.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const us = (t) => new ps(typeof t == "string" ? t : t + "", void 0, ni), R = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[n + 1], t[0]);
  return new ps(i, t, ni);
}, Ws = (t, e) => {
  if (ri) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = xe.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, Ai = ri ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return us(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qs, defineProperty: Fs, getOwnPropertyDescriptor: Hs, getOwnPropertyNames: Vs, getOwnPropertySymbols: Ks, getPrototypeOf: Js } = Object, vt = globalThis, Ci = vt.trustedTypes, Xs = Ci ? Ci.emptyScript : "", Ne = vt.reactiveElementPolyfillSupport, Gt = (t, e) => t, Ae = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Xs : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, oi = (t, e) => !qs(t, e), Ei = { attribute: !0, type: String, converter: Ae, reflect: !1, useDefault: !1, hasChanged: oi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), vt.litPropertyMetadata ?? (vt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Bt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = Ei) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && Fs(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: n } = Hs(this.prototype, e) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const a = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ei;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Gt("elementProperties"))) return;
    const e = Js(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Gt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Gt("properties"))) {
      const i = this.properties, s = [...Vs(i), ...Ks(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) i.unshift(Ai(r));
    } else e !== void 0 && i.push(Ai(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((i) => this.enableUpdating = i), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((i) => i(this));
  }
  addController(e) {
    var i;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((i = e.hostConnected) == null || i.call(e));
  }
  removeController(e) {
    var i;
    (i = this._$EO) == null || i.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ws(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((i) => {
      var s;
      return (s = i.hostConnected) == null ? void 0 : s.call(i);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var s;
      return (s = i.hostDisconnected) == null ? void 0 : s.call(i);
    });
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    var n;
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : Ae).toAttribute(i, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : Ae;
      this._$Em = r;
      const p = l.fromAttribute(i, a.type);
      this[r] = p ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? p, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, n) {
    var o;
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (n = this[e]), s ?? (s = a.getPropertyOptions(e)), !((s.hasChanged ?? oi)(n, i) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? i ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
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
        const { wrapped: a } = o, l = this[n];
        a !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, o, l);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (s = this._$EO) == null || s.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(i)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var i;
    (i = this._$EO) == null || i.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((i) => this._$ET(i, this[i]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
Bt.elementStyles = [], Bt.shadowRootOptions = { mode: "open" }, Bt[Gt("elementProperties")] = /* @__PURE__ */ new Map(), Bt[Gt("finalized")] = /* @__PURE__ */ new Map(), Ne == null || Ne({ ReactiveElement: Bt }), (vt.reactiveElementVersions ?? (vt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = globalThis, Pi = (t) => t, Ce = Yt.trustedTypes, Mi = Ce ? Ce.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, _s = "$lit$", gt = `lit$${Math.random().toFixed(9).slice(2)}$`, fs = "?" + gt, Gs = `<${fs}>`, It = document, te = () => It.createComment(""), ee = (t) => t === null || typeof t != "object" && typeof t != "function", ai = Array.isArray, Ys = (t) => ai(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", je = `[ 	
\f\r]`, Kt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Oi = /-->/g, Di = />/g, Ct = RegExp(`>|${je}(?:([^\\s"'>=/]+)(${je}*=${je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ii = /'/g, zi = /"/g, ms = /^(?:script|style|textarea|title)$/i, gs = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), c = gs(1), D = gs(2), zt = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), Ti = /* @__PURE__ */ new WeakMap(), Mt = It.createTreeWalker(It, 129);
function ys(t, e) {
  if (!ai(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Mi !== void 0 ? Mi.createHTML(e) : e;
}
const Qs = (t, e) => {
  const i = t.length - 1, s = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = Kt;
  for (let a = 0; a < i; a++) {
    const l = t[a];
    let p, u, m = -1, d = 0;
    for (; d < l.length && (o.lastIndex = d, u = o.exec(l), u !== null); ) d = o.lastIndex, o === Kt ? u[1] === "!--" ? o = Oi : u[1] !== void 0 ? o = Di : u[2] !== void 0 ? (ms.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = Ct) : u[3] !== void 0 && (o = Ct) : o === Ct ? u[0] === ">" ? (o = r ?? Kt, m = -1) : u[1] === void 0 ? m = -2 : (m = o.lastIndex - u[2].length, p = u[1], o = u[3] === void 0 ? Ct : u[3] === '"' ? zi : Ii) : o === zi || o === Ii ? o = Ct : o === Oi || o === Di ? o = Kt : (o = Ct, r = void 0);
    const f = o === Ct && t[a + 1].startsWith("/>") ? " " : "";
    n += o === Kt ? l + Gs : m >= 0 ? (s.push(p), l.slice(0, m) + _s + l.slice(m) + gt + f) : l + gt + (m === -2 ? a : f);
  }
  return [ys(t, n + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class ie {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [p, u] = Qs(e, i);
    if (this.el = ie.createElement(p, s), Mt.currentNode = this.el.content, i === 2 || i === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (r = Mt.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const m of r.getAttributeNames()) if (m.endsWith(_s)) {
          const d = u[o++], f = r.getAttribute(m).split(gt), b = /([.?@])?(.*)/.exec(d);
          l.push({ type: 1, index: n, name: b[2], strings: f, ctor: b[1] === "." ? tr : b[1] === "?" ? er : b[1] === "@" ? ir : De }), r.removeAttribute(m);
        } else m.startsWith(gt) && (l.push({ type: 6, index: n }), r.removeAttribute(m));
        if (ms.test(r.tagName)) {
          const m = r.textContent.split(gt), d = m.length - 1;
          if (d > 0) {
            r.textContent = Ce ? Ce.emptyScript : "";
            for (let f = 0; f < d; f++) r.append(m[f], te()), Mt.nextNode(), l.push({ type: 2, index: ++n });
            r.append(m[d], te());
          }
        }
      } else if (r.nodeType === 8) if (r.data === fs) l.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = r.data.indexOf(gt, m + 1)) !== -1; ) l.push({ type: 7, index: n }), m += gt.length - 1;
      }
      n++;
    }
  }
  static createElement(e, i) {
    const s = It.createElement("template");
    return s.innerHTML = e, s;
  }
}
function Wt(t, e, i = t, s) {
  var o, a;
  if (e === zt) return e;
  let r = s !== void 0 ? (o = i._$Co) == null ? void 0 : o[s] : i._$Cl;
  const n = ee(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (e = Wt(t, r._$AS(t, e.values), r, s)), e;
}
class Zs {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? It).importNode(i, !0);
    Mt.currentNode = r;
    let n = Mt.nextNode(), o = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let p;
        l.type === 2 ? p = new qt(n, n.nextSibling, this, e) : l.type === 1 ? p = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (p = new sr(n, this, e)), this._$AV.push(p), l = s[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = Mt.nextNode(), o++);
    }
    return Mt.currentNode = It, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class qt {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = Wt(this, e, i), ee(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== zt && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ys(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== _ && ee(this._$AH) ? this._$AA.nextSibling.data = e : this.T(It.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = ie.createElement(ys(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(i);
    else {
      const o = new Zs(r, this), a = o.u(this.options);
      o.p(i), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = Ti.get(e.strings);
    return i === void 0 && Ti.set(e.strings, i = new ie(e)), i;
  }
  k(e) {
    ai(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const n of e) r === i.length ? i.push(s = new qt(this.O(te()), this.O(te()), this, this.options)) : s = i[r], s._$AI(n), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); e !== this._$AB; ) {
      const r = Pi(e).nextSibling;
      Pi(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var i;
    this._$AM === void 0 && (this._$Cv = e, (i = this._$AP) == null || i.call(this, e));
  }
}
class De {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, n) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = _;
  }
  _$AI(e, i = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = Wt(this, e, i, 0), o = !ee(e) || e !== this._$AH && e !== zt, o && (this._$AH = e);
    else {
      const a = e;
      let l, p;
      for (e = n[0], l = 0; l < n.length - 1; l++) p = Wt(this, a[s + l], i, l), p === zt && (p = this._$AH[l]), o || (o = !ee(p) || p !== this._$AH[l]), p === _ ? e = _ : e !== _ && (e += (p ?? "") + n[l + 1]), this._$AH[l] = p;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class tr extends De {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === _ ? void 0 : e;
  }
}
class er extends De {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _);
  }
}
class ir extends De {
  constructor(e, i, s, r, n) {
    super(e, i, s, r, n), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = Wt(this, e, i, 0) ?? _) === zt) return;
    const s = this._$AH, r = e === _ && s !== _ || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== _ && (s === _ || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class sr {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Wt(this, e);
  }
}
const rr = { I: qt }, Le = Yt.litHtmlPolyfillSupport;
Le == null || Le(ie, qt), (Yt.litHtmlVersions ?? (Yt.litHtmlVersions = [])).push("3.3.3");
const nr = (t, e, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new qt(e.insertBefore(te(), n), n, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = globalThis;
let I = class extends Bt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var i;
    const e = super.createRenderRoot();
    return (i = this.renderOptions).renderBefore ?? (i.renderBefore = e.firstChild), e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = nr(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return zt;
  }
};
var hs;
I._$litElement$ = !0, I.finalized = !0, (hs = Ot.litElementHydrateSupport) == null || hs.call(Ot, { LitElement: I });
const Re = Ot.litElementPolyfillSupport;
Re == null || Re({ LitElement: I });
(Ot.litElementVersions ?? (Ot.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const or = { CHILD: 2 }, bs = (t) => (...e) => ({ _$litDirective$: t, values: e });
let vs = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, i, s) {
    this._$Ct = e, this._$AM = i, this._$Ci = s;
  }
  _$AS(e, i) {
    return this.update(e, i);
  }
  update(e, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: ar } = rr, Ni = (t) => t, ji = () => document.createComment(""), Jt = (t, e, i) => {
  var n;
  const s = t._$AA.parentNode, r = e === void 0 ? t._$AB : e._$AA;
  if (i === void 0) {
    const o = s.insertBefore(ji(), r), a = s.insertBefore(ji(), r);
    i = new ar(o, a, t, t.options);
  } else {
    const o = i._$AB.nextSibling, a = i._$AM, l = a !== t;
    if (l) {
      let p;
      (n = i._$AQ) == null || n.call(i, t), i._$AM = t, i._$AP !== void 0 && (p = t._$AU) !== a._$AU && i._$AP(p);
    }
    if (o !== r || l) {
      let p = i._$AA;
      for (; p !== o; ) {
        const u = Ni(p).nextSibling;
        Ni(s).insertBefore(p, r), p = u;
      }
    }
  }
  return i;
}, Et = (t, e, i = t) => (t._$AI(e, i), t), lr = {}, $s = (t, e = lr) => t._$AH = e, cr = (t) => t._$AH, Be = (t) => {
  t._$AR(), t._$AA.remove();
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = bs(class extends vs {
  constructor() {
    super(...arguments), this.key = _;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, i]) {
    return e !== this.key && ($s(t), this.key = e), i;
  }
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dr = { attribute: !0, type: String, converter: Ae, reflect: !1, hasChanged: oi }, hr = (t = dr, e, i) => {
  const { kind: s, metadata: r } = i;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(i.name, t), s === "accessor") {
    const { name: o } = i;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, t, a), a;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function v(t) {
  return (e, i) => typeof i == "object" ? hr(t, e, i) : ((s, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, s), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(t) {
  return v({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Li = (t, e, i) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = e; r <= i; r++) s.set(t[r], r);
  return s;
}, pr = bs(class extends vs {
  constructor(t) {
    if (super(t), t.type !== or.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(t, e, i) {
    let s;
    i === void 0 ? i = e : e !== void 0 && (s = e);
    const r = [], n = [];
    let o = 0;
    for (const a of t) r[o] = s ? s(a, o) : o, n[o] = i(a, o), o++;
    return { values: n, keys: r };
  }
  render(t, e, i) {
    return this.dt(t, e, i).values;
  }
  update(t, [e, i, s]) {
    const r = cr(t), { values: n, keys: o } = this.dt(e, i, s);
    if (!Array.isArray(r)) return this.ut = o, n;
    const a = this.ut ?? (this.ut = []), l = [];
    let p, u, m = 0, d = r.length - 1, f = 0, b = n.length - 1;
    for (; m <= d && f <= b; ) if (r[m] === null) m++;
    else if (r[d] === null) d--;
    else if (a[m] === o[f]) l[f] = Et(r[m], n[f]), m++, f++;
    else if (a[d] === o[b]) l[b] = Et(r[d], n[b]), d--, b--;
    else if (a[m] === o[b]) l[b] = Et(r[m], n[b]), Jt(t, l[b + 1], r[m]), m++, b--;
    else if (a[d] === o[f]) l[f] = Et(r[d], n[f]), Jt(t, r[m], r[d]), d--, f++;
    else if (p === void 0 && (p = Li(o, f, b), u = Li(a, m, d)), p.has(a[m])) if (p.has(a[d])) {
      const w = u.get(o[f]), A = w !== void 0 ? r[w] : null;
      if (A === null) {
        const S = Jt(t, r[m]);
        Et(S, n[f]), l[f] = S;
      } else l[f] = Et(A, n[f]), Jt(t, r[m], A), r[w] = null;
      f++;
    } else Be(r[d]), d--;
    else Be(r[m]), m++;
    for (; f <= b; ) {
      const w = Jt(t, l[b + 1]);
      Et(w, n[f]), l[f++] = w;
    }
    for (; m <= d; ) {
      const w = r[m++];
      w !== null && Be(w);
    }
    return this.ut = o, $s(t, l), zt;
  }
});
var ur = Object.defineProperty, _r = Object.getOwnPropertyDescriptor, Ft = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? _r(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && ur(e, i, r), r;
};
const fr = 2e3;
let xt = class extends I {
  constructor() {
    super(...arguments), this.text = "", this.passive = !1, this.through = !1, this._mouse = !1, this._show = !1, this._shift = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), clearTimeout(this._timer);
  }
  _on() {
    this._show = !0;
  }
  _off() {
    clearTimeout(this._timer), this._show = !1;
  }
  _down(t) {
    this._mouse = t.pointerType === "mouse", !(this.through && this._mouse) && (t.stopPropagation(), t.pointerType !== "mouse" && (this._on(), clearTimeout(this._timer), this._timer = setTimeout(() => this._off(), fr)));
  }
  /** Keeps the bubble inside the window. */
  updated() {
    if (!this._show) {
      this._shift && (this._shift = 0);
      return;
    }
    const t = this.renderRoot.querySelector(".bubble");
    if (!t) return;
    const e = t.getBoundingClientRect(), i = e.left - this._shift, s = e.right - this._shift, r = i < 4 ? 4 - i : s > window.innerWidth - 4 ? window.innerWidth - 4 - s : 0;
    Math.abs(r - this._shift) > 0.5 && (this._shift = r);
  }
  render() {
    return c`<span class="hit" part="hit" tabindex="0" role="img" aria-label=${this.text}
        @pointerenter=${(t) => {
      t.pointerType === "mouse" && this._on();
    }}
        @pointerleave=${(t) => {
      t.pointerType === "mouse" && this._off();
    }}
        @focus=${() => this._on()} @blur=${() => this._off()}
        @pointerdown=${(t) => this._down(t)}
        @pointerup=${(t) => {
      this.through && this._mouse || t.stopPropagation();
    }}
        @click=${(t) => {
      this.through && this._mouse || t.stopPropagation();
    }}
        @contextmenu=${(t) => t.preventDefault()}
        @keydown=${(t) => {
      t.key === "Escape" && this._off();
    }}>
        <slot></slot></span>
      ${this._show && this.text ? c`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : _}`;
  }
};
xt.styles = R`
    :host { display: inline-flex; position: relative; pointer-events: auto; }
    :host([passive]) { pointer-events: none; }
    .hit {
      min-width: 32px; min-height: 32px; display: inline-flex; align-items: center; justify-content: center;
      outline: none; border-radius: 16px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .hit:focus-visible { outline: 2px solid var(--primary-color); }
    .bubble {
      position: absolute; bottom: calc(100% + 2px); left: 50%; transform: translateX(calc(-50% + var(--shift, 0px)));
      z-index: 10; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 12px; font-weight: 500;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }
  `;
Ft([
  v()
], xt.prototype, "text", 2);
Ft([
  v({ type: Boolean })
], xt.prototype, "passive", 2);
Ft([
  v({ type: Boolean })
], xt.prototype, "through", 2);
Ft([
  $()
], xt.prototype, "_show", 2);
Ft([
  $()
], xt.prototype, "_shift", 2);
xt = Ft([
  B("wp-tip")
], xt);
const mr = {
  pe_other_programs: "Also used by: {programs}. Lower priority numbers take precedence.",
  pe_program_priority: "{name} (priority {priority})",
  profile_explanation: "A season stores a different weekly schedule. This list selects the season to edit. Activate it with the program’s Profile entity in Home Assistant; seasons do not follow calendar dates automatically.",
  pe_icon_hint: "Uses the first device’s icon unless you choose another.",
  ce_schedule_view: "Schedule view",
  ce_bars: "Bars",
  ce_radial: "24-hour dial",
  ce_list: "Compact list",
  ce_back_program: "Back to selected program",
  ce_display: "Card appearance",
  ce_program_settings: "Program settings",
  ce_choose_program: "Choose a program…",
  ce_shared_settings: "These settings are shared by all cards. Apply them to the program separately; cancelling the card editor will not undo applied changes.",
  ce_apply_program: "Apply to program",
  ce_program_applied: "Program settings applied.",
  action_choose: "Choose an action…",
  action_no_description: "This integration provides no description for this action.",
  action_scene_description: "Activate this Home Assistant scene and apply its saved settings.",
  edited: "Changed",
  active_key: "Active",
  undo: "Undo",
  cut: "Split",
  copy_to: "Copy to…",
  copy_go: "Copy",
  replace: "Replace",
  skip_day: "Do not copy this day",
  cf_before: "Before",
  cf_after: "After",
  conflict_title: "Already scheduled",
  shared: "Shared",
  rename_label: "Edit label",
  edit_bar: "Edit the day",
  handle: "Boundary {time}",
  rest_gap: "Rest of the time",
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
  pe_services: "Offered actions",
  pe_services_all: "All",
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
  ce_no_types: "Types appear when devices are added to programs.",
  ce_area: "Area (optional)",
  ce_show_chart: "Show the chart",
  today: "Today",
  no_data: "No data for this day.",
  chart_loading: "Loading…",
  // --- simple mode ---
  cf_title: "Please confirm",
  // --- schedule & gestures ---
  ss_changed: "This schedule was just changed. Here is the new version.",
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
  w_whole_week: "Whole week",
  w_add_day: "Add a schedule on {day}",
  w_dropped: "Not added on {days}: already busy.",
  yes: "Yes",
  no: "No",
  running: "On",
  stopped: "Off",
  rest_none_short: "None"
}, gr = {
  pe_other_programs: "Déjà utilisé par : {programs}. Le plus petit numéro de priorité l’emporte.",
  pe_program_priority: "{name} (priorité {priority})",
  profile_explanation: "Une saison contient une autre semaine d’horaires. Cette liste choisit la saison à modifier. Activez-la avec l’entité Profil du programme dans Home Assistant ; les saisons ne suivent pas les dates automatiquement.",
  pe_icon_hint: "L’icône du premier appareil est utilisée, sauf si vous en choisissez une autre.",
  ce_schedule_view: "Vue des horaires",
  ce_bars: "Barres",
  ce_radial: "Cadran 24 heures",
  ce_list: "Liste compacte",
  ce_back_program: "Revenir au programme sélectionné",
  ce_display: "Affichage de la carte",
  ce_program_settings: "Réglages des programmes",
  ce_choose_program: "Choisir un programme…",
  ce_shared_settings: "Ces réglages sont partagés entre les cartes. Appliquez-les au programme séparément : annuler l’édition de la carte n’annule pas les changements déjà appliqués.",
  ce_apply_program: "Appliquer au programme",
  ce_program_applied: "Réglages du programme appliqués.",
  action_choose: "Choisir une action…",
  action_no_description: "Cette intégration ne fournit pas de description pour cette action.",
  action_scene_description: "Activer cette scène Home Assistant et appliquer ses réglages enregistrés.",
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
  edited: "Modifié",
  active_key: "Actif",
  undo: "Annuler",
  cut: "Couper",
  copy_to: "Copier vers…",
  copy_go: "Copier",
  replace: "Remplacer",
  skip_day: "Ne pas copier ce jour",
  cf_before: "Avant",
  cf_after: "Après",
  conflict_title: "Déjà occupé",
  shared: "Partagé",
  rename_label: "Modifier l'étiquette",
  edit_bar: "Modifier la journée",
  handle: "Limite {time}",
  rest_gap: "Le reste du temps",
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
  pe_services: "Actions proposées",
  pe_services_all: "Toutes",
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
  ce_no_types: "Les types apparaissent après l’ajout d’appareils aux programmes.",
  ce_area: "Zone (facultatif)",
  ce_show_chart: "Afficher le graphique",
  today: "Aujourd'hui",
  no_data: "Pas de données pour ce jour.",
  chart_loading: "Chargement…",
  // --- simple mode ---
  cf_title: "Veuillez confirmer",
  // --- schedule & gestures ---
  ss_changed: "Cet horaire vient d'être modifié, voici la nouvelle version.",
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
  w_whole_week: "Toute la semaine",
  w_add_day: "Ajouter un horaire le {day}",
  w_dropped: "Pas ajouté {days} : déjà occupé.",
  yes: "Oui",
  no: "Non",
  running: "En marche",
  stopped: "À l'arrêt",
  rest_none_short: "Rien"
};
function H(t) {
  return t.startsWith("fr") ? gr : mr;
}
function h(t, e, i = {}) {
  let s = H(t)[e];
  for (const [r, n] of Object.entries(i)) s = s.replace(`{${r}}`, n);
  return s;
}
const Ee = 5, k = 1440;
function Dt(t) {
  const [e, i] = t.split(":").map(Number);
  return e * 60 + i;
}
function re(t) {
  const e = Math.max(0, Math.min(k, Math.round(t / Ee) * Ee));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function ct(t, e) {
  var o, a;
  const i = typeof t == "string" ? new Date(t) : t, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((o = s.find((l) => l.type === "hour")) == null ? void 0 : o.value) ?? 0), n = Number(((a = s.find((l) => l.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return r * 60 + n;
}
function we(t, e) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: e, weekday: "short" }).format(t);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function yt(t, e) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: e }).format(t);
}
function wt(t) {
  return !t || !("time" in t) ? null : Dt(t.time);
}
function xs(t) {
  const e = [];
  for (const i of t) {
    const s = wt(i.start), r = wt(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && e.push({ slot: i, end: r });
  }
  return e;
}
function ht(t, e) {
  const i = (Math.round(e) % k + k) % k, s = Math.floor(i / 60), r = i % 60;
  if (t.toLowerCase().startsWith("fr")) return r ? `${s} h ${String(r).padStart(2, "0")}` : `${s} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, s, r)), o = { timeZone: "UTC", hour: "numeric" };
  return r && (o.minute = "2-digit"), new Intl.DateTimeFormat(t, o).format(n).replace(/\s?(AM|PM)/, (a, l) => ` ${l.toLowerCase()}`);
}
function Ri(t, e, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(t), n = yt(r, e) === yt(s, e), o = ht(i, ct(r, e));
  if (n) return o;
  if (yt(new Date(s.getTime() + 864e5), e) === yt(r, e)) return `${new Intl.RelativeTimeFormat(i, { numeric: "auto" }).format(1, "day")} ${o}`;
  const p = r.getTime() - s.getTime() > 6 * 864e5 ? { timeZone: e, weekday: "short", day: "numeric", month: "short" } : { timeZone: e, weekday: "short" };
  return `${new Intl.DateTimeFormat(i, p).format(r)} ${o}`;
}
var yr = Object.defineProperty, br = Object.getOwnPropertyDescriptor, mt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? br(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && yr(e, i, r), r;
};
function Tt(t) {
  return !t || !("sun" in t) ? null : t.sun === "sunrise" || t.sun === "dawn" ? "up" : "down";
}
function li(t, e, i) {
  if (!e || !("sun" in e)) return "";
  const s = e.offset ?? 0, r = H(t)[`sun_${e.sun}`] ?? e.sun, n = s ? ` ${s > 0 ? "+" : "-"} ${Math.abs(s)} min` : "";
  return `${r}${n} · ${ht(t, i)}`;
}
const ws = (t, e) => `${h(t, "now")} · ${ht(t, e)}`;
let tt = class extends I {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this.notches = !1, this.tall = !1, this.lang = "en", this._width = 0;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this._ro = new ResizeObserver((t) => {
      var i;
      const e = Math.round(((i = t[0]) == null ? void 0 : i.contentRect.width) ?? 0);
      e !== this._width && (this._width = e);
    }), this._ro.observe(this));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._ro) == null || t.disconnect();
  }
  /**
   * Where the label of a span is drawn (left and width in % of the span), or null when it does not fit (never cut
   * off). Crossed by the "now" line, it goes in the wider side of the span, if that side is wide enough.
   */
  _labelBox(t) {
    if (this.thin || this._width <= 0) return null;
    let e = t.start, i = t.end;
    const s = this.now;
    s !== null && s > t.start - 20 && s < t.end + 20 && (s - t.start >= t.end - s ? i = Math.min(t.end, s - 20) : e = Math.max(t.start, s + 20));
    const r = Math.max(40, t.label.length * 7 + 14);
    if ((i - e) / k * this._width < r) return null;
    const n = Math.max(t.end - t.start, 1);
    return { left: (e - t.start) / n * 100, width: (i - e) / n * 100 };
  }
  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  _sunIcons() {
    const t = [];
    for (const e of this.spans)
      e.startSun && t.push({ m: e.start, dir: e.startSun, spec: e.startSpec, label: e.marker ? e.label : void 0 }), e.endSun && e.end < k && t.push({ m: e.end, dir: e.endSun, spec: e.endSpec });
    return t.map((e) => c`<wp-tip class="sunic" ?passive=${this.tall}
      text=${`${e.label ? `${e.label} · ` : ""}${li(this.lang, e.spec, e.m)}`}
      style="left:clamp(16px, ${e.m / k * 100}%, calc(100% - 16px))" data-sun=${e.dir}>
      <span class="sunc"><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
  }
  /** A one-shot is a thin line: a wider invisible target over it shows its label and time. */
  _markerTips() {
    return this.spans.filter((t) => t.marker && !t.startSun && !this.thin).map((t) => c`<wp-tip class="mktip" through
      ?passive=${this.tall} text=${`${t.label} · ${ht(this.lang, t.start)}`}
      style="left:clamp(12px, ${t.start / k * 100}%, calc(100% - 12px))"></wp-tip>`);
  }
  render() {
    const t = (i) => `${i / k * 100}%`, e = this.now;
    return c`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((i) => i.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((i) => c`<i class="tick" style="left:${t(i * 60)}"></i>`) : _}
          ${this.spans.map((i) => {
      const s = this._labelBox(i);
      return c`<div
              class="span ${i.ignored ? "ignored" : ""}"
              style="left:${t(i.start)};width:${t(Math.max(i.end - i.start, 5))};--c:${i.color}"
              title=${i.label}
            >${s ? c`<span class="name" style="left:${s.left}%;width:${s.width}%">${i.label}</span>` : _}</div>`;
    })}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${e !== null ? c`<div class="nowline" style="left:${t(e)}">
          <wp-tip class="nowic" text=${ws(this.lang, e)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>` : _}
      </div>
      ${this.showHours ? c`<div class="hours">${[0, 6, 12, 18, 24].map((i) => c`<span style="left:${t(i * 60)}">${i} h</span>`)}</div>` : _}
    `;
  }
};
tt.styles = R`
    :host { display: block; }
    .wrap { position: relative; }
    .bar {
      position: relative; height: 28px; border-radius: 14px; overflow: hidden;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .bar.thin { height: 10px; border-radius: 5px; }
    .bar.tall { height: 44px; border-radius: 12px; transition: height 0.12s; }
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
    .span .name { position: absolute; top: 0; bottom: 0; justify-content: center; box-sizing: border-box; }
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .icons { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
    .sunic { position: absolute; top: 50%; transform: translate(-50%, -50%); }
    .mktip { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 28px; }
    .sunc {
      width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; --mdc-icon-size: 14px;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    slot { display: contents; }
    /* the "now" line is drawn over everything, outside the clipped bar; the clock sits just above the bar */
    .nowline {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; z-index: 5; pointer-events: none;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .nowic {
      position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); --mdc-icon-size: 13px;
      color: var(--primary-text-color); margin-bottom: 0; align-items: flex-end;
    }
    .nowic::part(hit) { align-items: flex-end; }
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
mt([
  v({ attribute: !1 })
], tt.prototype, "spans", 2);
mt([
  v({ type: Number })
], tt.prototype, "now", 2);
mt([
  v({ type: Boolean })
], tt.prototype, "thin", 2);
mt([
  v({ type: Boolean, attribute: "show-hours" })
], tt.prototype, "showHours", 2);
mt([
  v({ type: Boolean })
], tt.prototype, "notches", 2);
mt([
  v({ type: Boolean })
], tt.prototype, "tall", 2);
mt([
  v()
], tt.prototype, "lang", 2);
mt([
  $()
], tt.prototype, "_width", 2);
tt = mt([
  B("wp-day-bar")
], tt);
var vr = Object.defineProperty, $r = Object.getOwnPropertyDescriptor, ce = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? $r(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && vr(e, i, r), r;
};
let Nt = class extends I {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.wide = !1, this._expanded = !1, this._onKey = (t) => {
      t.key === "Escape" && (t.stopPropagation(), this.close());
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
  _hdown(t) {
    var e, i;
    !this._isPhone() || t.pointerType === "mouse" || t.composedPath().some((s) => s instanceof HTMLElement && s.tagName === "BUTTON") || (this._sw = { id: t.pointerId, y: t.clientY, x: t.clientX, dy: 0 }, (i = (e = t.currentTarget).setPointerCapture) == null || i.call(e, t.pointerId));
  }
  _hmove(t) {
    const e = this._sw;
    if (!e || t.pointerId !== e.id) return;
    e.dy = Math.max(0, t.clientY - e.y);
    const i = this._panel();
    i && (i.style.transition = "none", i.style.transform = `translateY(${e.dy}px)`);
  }
  _hup(t) {
    const e = this._sw;
    if (!e || t.pointerId !== e.id) return;
    this._sw = void 0;
    const i = this._panel(), s = Math.abs(t.clientX - e.x);
    i && (i.style.transition = "", i.style.transform = ""), e.dy >= 100 && s < e.dy && this.close();
  }
  _hcancel() {
    this._sw = void 0;
    const t = this._panel();
    t && (t.style.transition = "", t.style.transform = "");
  }
  updated(t) {
    t.has("open") && this.open && requestAnimationFrame(() => {
      var e;
      return (e = this.renderRoot.querySelector(".panel")) == null ? void 0 : e.focus();
    });
  }
  close() {
    this.open = !1, this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0 }));
  }
  render() {
    var t, e;
    return this.open ? c`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2><button class="heading" aria-expanded=${this._expanded}
            title=${(t = document.documentElement.lang) != null && t.startsWith("fr") ? "Agrandir / réduire" : "Expand / reduce"}
            @click=${() => {
      this._expanded = !this._expanded;
    }}>${this.heading}</button></h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${(e = document.documentElement.lang) != null && e.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : c``;
  }
};
Nt.styles = R`
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
    .panel.expanded { width: min(1400px, calc(100vw - 32px)); }
    .heading { display: block; width: 100%; min-height: 44px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
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
      .panel, .panel.wide, .panel.expanded {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
ce([
  v()
], Nt.prototype, "heading", 2);
ce([
  v({ type: Boolean, reflect: !0 })
], Nt.prototype, "open", 2);
ce([
  v({ type: Boolean })
], Nt.prototype, "wide", 2);
ce([
  $()
], Nt.prototype, "_expanded", 2);
Nt = ce([
  B("wp-dialog")
], Nt);
let _e, Pt;
const fe = /* @__PURE__ */ new Set();
function ks(t, e) {
  return fe.add(e), _e && e(_e), Pt || (Pt = t.connection.subscribeMessage(
    (i) => {
      _e = i, fe.forEach((s) => s(i));
    },
    { type: "weekly_planner/subscribe" }
  ), Pt.catch(() => {
    Pt = void 0;
  })), () => {
    fe.delete(e), fe.size === 0 && Pt && (Pt.then((i) => i()).catch(() => {
    }), Pt = void 0, _e = void 0);
  };
}
const Qt = (t) => t.split(".")[0];
function Q(t, e) {
  var s;
  const i = ((s = e.status[t.id]) == null ? void 0 : s.active_profile) ?? t.active_profile;
  return t.profiles.find((r) => r.id === i) ?? t.profiles[0];
}
function it(t, e) {
  var i;
  return ((i = t.states[e]) == null ? void 0 : i.attributes.friendly_name) ?? e;
}
function Xe(t, e) {
  var r, n;
  if (e.program) return t.programs.filter((o) => o.id === e.program);
  const i = (r = e.filter) == null ? void 0 : r.types, s = (n = e.filter) == null ? void 0 : n.area;
  return t.programs.filter((o) => !(i != null && i.length) || o.entities.some((a) => i.includes(Qt(a.entity_id)))).filter((o) => !s || o.area === s).sort((o, a) => o.priority - a.priority || o.name.localeCompare(a.name));
}
function Z() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function Ge(t, e) {
  return new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e);
}
async function Ss() {
  var t, e, i;
  if (customElements.get("ha-selector")) return !0;
  try {
    const s = await ((t = window.loadCardHelpers) == null ? void 0 : t.call(window)), r = await (s == null ? void 0 : s.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((i = (e = r == null ? void 0 : r.constructor) == null ? void 0 : e.getConfigElement) == null ? void 0 : i.call(e)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((n) => setTimeout(n, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const xr = (t) => t.split(".")[0], wr = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let Ye;
const Ue = /* @__PURE__ */ new Set();
async function Ht(t, e) {
  const i = [...new Set(e)].filter((s) => !Ue.has(s));
  if (!i.length || !t.loadBackendTranslation) return !1;
  i.forEach((s) => Ue.add(s));
  try {
    const s = await Promise.all(i.map((r) => t.loadBackendTranslation("services", r)));
    return Ye = s[s.length - 1] ?? Ye, !0;
  } catch {
    return i.forEach((s) => Ue.delete(s)), !1;
  }
}
function ci(t, e) {
  for (const i of [t.localize, Ye]) {
    const s = i == null ? void 0 : i(e);
    if (s) return s;
  }
  return "";
}
const di = (t, e) => {
  var r, n;
  const [i, s] = e.split(".");
  return (n = (r = t.services) == null ? void 0 : r[i]) == null ? void 0 : n[s];
};
function hi(t, e) {
  var r;
  const [i, s] = e.split(".");
  return ci(t, `component.${i}.services.${s}.name`) || ((r = di(t, e)) == null ? void 0 : r.name) || e;
}
function Bi(t, e) {
  var r;
  const [i, s] = e.split(".");
  return ci(t, `component.${i}.services.${s}.description`) || ((r = di(t, e)) == null ? void 0 : r.description) || "";
}
function kr(t, e, i) {
  const s = Array.isArray(t) ? t : t ? [t] : [], r = Number((e == null ? void 0 : e.attributes.supported_features) ?? 0);
  return s.some((n) => {
    var a;
    return (n.domain === void 0 ? [] : Array.isArray(n.domain) ? n.domain : [n.domain]).includes(i) ? (a = n.supported_features) != null && a.length ? n.supported_features.some((l) => Array.isArray(l) ? l.every((p) => (r & p) === p) : (r & l) === l) : !0 : !1;
  });
}
function Ie(t, e, i) {
  const s = xr(e), r = t.states[e], n = [];
  for (const [o, a] of Object.entries(t.services ?? {}))
    if (o !== "homeassistant")
      for (const [l, p] of Object.entries(a)) {
        if (!p.target) continue;
        const u = p.target.entity, m = !u || Array.isArray(u) && !u.length;
        if (!kr(u, r, s) && !(o === s && m) || Object.values(p.fields ?? {}).some((b) => b.required && (!b.selector || "text" in b.selector || "object" in b.selector))) continue;
        const f = `${o}.${l}`;
        i != null && i.length && !i.includes(f) || n.push({ id: f, domain: o, service: l, label: hi(t, f) });
      }
  return n.sort((o, a) => o.label.localeCompare(a.label));
}
function As(t, e) {
  return [...new Set(Ie(t, e).map((i) => i.domain))];
}
function Sr(t, e) {
  var r;
  const i = t.filter;
  if (!i || !e) return !0;
  const s = Number(e.attributes.supported_features ?? 0);
  if ((r = i.supported_features) != null && r.length && !i.supported_features.some((n) => (s & n) === n)) return !1;
  for (const [n, o] of Object.entries(i.attribute ?? {})) {
    const a = e.attributes[n];
    if (!(Array.isArray(a) ? a : [a]).some((p) => o.includes(p))) return !1;
  }
  return !0;
}
function pi(t, e, i) {
  var p, u;
  const [s, r] = e.split("."), n = i ? t.states[i] : void 0, o = ((p = t.services) == null ? void 0 : p[s]) ?? {}, a = [], l = (m) => {
    var d;
    for (const [f, b] of Object.entries(m ?? {})) {
      if (b.fields) {
        l(b.fields);
        continue;
      }
      b.advanced || wr.has(f) || (d = b.selector) != null && d.target || !Sr(b, n) || !b.required && r !== `set_${f}` && `set_${f}` in o || a.push({
        key: f,
        selector: b.selector ?? { text: {} },
        // The mode of a "set mode" service is always needed, whatever the description says.
        required: !!b.required || s === "climate" && r === `set_${f}` && f in ui,
        default: b.default,
        label: ci(t, `component.${s}.services.${r}.fields.${f}.name`) || b.name || f
      });
    }
  };
  return l((u = di(t, e)) == null ? void 0 : u.fields), a.length && !a.some((m) => m.required) && (a[0] = { ...a[0], required: !0 }), [...a.filter((m) => m.required), ...a.filter((m) => !m.required)];
}
function Ar(t, e, i) {
  var n;
  const s = ((n = t.states[i]) == null ? void 0 : n.attributes) ?? {}, r = {};
  for (const o of pi(t, e, i)) {
    if (!o.required) continue;
    const a = o.selector.number;
    o.default !== void 0 ? r[o.key] = o.default : o.key === "temperature" ? r[o.key] = typeof s.temperature == "number" ? s.temperature : 19 : a && (r[o.key] = o.key === "position" ? 50 : a.min ?? 0);
  }
  return r;
}
function Cs(t, e, i, s) {
  return pi(t, e, s).filter((r) => r.required && ((i == null ? void 0 : i[r.key]) === void 0 || i[r.key] === "" || i[r.key] === null)).map((r) => r.label);
}
const ui = {
  hvac_mode: "hvac_modes",
  preset_mode: "preset_modes",
  fan_mode: "fan_modes",
  swing_mode: "swing_modes",
  swing_horizontal_mode: "swing_horizontal_modes"
};
function Cr(t, e, i) {
  const s = i.selector, r = s.state;
  if (!r && !s.select) return;
  const n = (r == null ? void 0 : r.attribute) ?? ui[i.key], o = t.states[e], a = n ? o == null ? void 0 : o.attributes[n] : void 0;
  if (!Array.isArray(a) || !a.length) return;
  const l = t, p = n.replace(/_list$/, "").replace(/s$/, "");
  return a.map((u) => {
    var f, b;
    const m = String(u);
    let d = "";
    try {
      d = i.key === "hvac_mode" ? ((f = l.formatEntityState) == null ? void 0 : f.call(l, o, m)) ?? "" : ((b = l.formatEntityAttributeValue) == null ? void 0 : b.call(l, o, p, m)) ?? "";
    } catch {
      d = "";
    }
    return { value: m, label: d || m };
  });
}
const Zt = [
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
function Er(t) {
  const e = new Set(t.map((i) => i.color.toLowerCase()));
  return Zt.find((i) => !e.has(i)) ?? Zt[t.length % Zt.length];
}
const L = (t, e) => e ? t.labels.find((i) => i.id === e) : void 0;
function Pr(t, e) {
  return Object.values(t.states).filter((i) => i.entity_id.startsWith("scene.") && Array.isArray(i.attributes.entity_id) && i.attributes.entity_id.includes(e)).sort((i, s) => String(i.attributes.friendly_name ?? i.entity_id).localeCompare(String(s.attributes.friendly_name ?? s.entity_id)));
}
const Pe = (t, e) => {
  var i;
  return ((i = t == null ? void 0 : t.entities.find((s) => s.entity_id === e)) == null ? void 0 : i.allowed_services) ?? [];
};
function Es(t, e, i, s = []) {
  var r;
  if (i.kind === "scene") {
    const n = (r = t.states[i.scene]) == null ? void 0 : r.attributes.entity_id;
    return Array.isArray(n) ? n.includes(e) : !0;
  }
  return s.length && !s.includes(i.service) ? !1 : i.service.split(".")[0] === e.split(".")[0] ? !0 : Ie(t, e).some((n) => n.id === i.service);
}
function _i(t, e, i, s) {
  return e.labels.filter((r) => i.some((n) => Es(t, n, r.action, Pe(s, n))));
}
function bt(t, e, i) {
  var r, n;
  return i ? ((n = (r = t.entities.find((o) => o.entity_id === e)) == null ? void 0 : r.label_overrides) == null ? void 0 : n[i.id]) ?? i.action : void 0;
}
const Mr = (t, e, i) => {
  var s, r;
  return !!((r = (s = t.entities.find((n) => n.entity_id === e)) == null ? void 0 : s.label_overrides) != null && r[i]);
}, Ut = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function Ui(t) {
  if (!t || t.kind !== "service") return null;
  const e = t.data ?? {};
  return Ut(e.temperature) ?? Ut(e.position) ?? Ut(e.brightness_pct);
}
function ne(t, e, i) {
  var r;
  if (!i) return "";
  if (i.kind === "scene") return String(((r = t.states[i.scene]) == null ? void 0 : r.attributes.friendly_name) ?? i.scene);
  const s = i.data ?? {};
  return Ut(s.temperature) !== null ? `${Ge(e, Number(s.temperature))} °C` : Ut(s.position) !== null ? `${s.position} %` : Ut(s.brightness_pct) !== null ? `${s.brightness_pct} %` : hi(t, i.service);
}
function Or(t, e, i, s) {
  if (!i) return "";
  if (i.kind === "scene") return ne(t, e, i);
  const r = [], n = s ? t.states[s] : void 0, o = t.formatEntityState;
  for (const [a, l] of Object.entries(i.data ?? {}))
    if (typeof l == "number")
      r.push(a === "temperature" ? `${Ge(e, l)} °C` : a === "position" || a === "brightness_pct" ? `${l} %` : Ge(e, l));
    else if (typeof l == "string" && l) {
      let p = l;
      try {
        a === "hvac_mode" && n && o && (p = o(n, l) || l);
      } catch {
        p = l;
      }
      r.push(p);
    }
  return [hi(t, i.service), ...r].join(" · ");
}
function ke(t, e) {
  return t.programs.filter((i) => i.entities.some((s) => s.default_label === e || e in (s.label_overrides ?? {})) || i.profiles.some((s) => s.days.some((r) => r.some((n) => n.label === e)))).map((i) => i.name);
}
var Dr = Object.defineProperty, Ir = Object.getOwnPropertyDescriptor, st = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ir(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Dr(e, i, r), r;
};
const St = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? (t == null ? void 0 : t.language) ?? "en";
}, rt = R`
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
function Ps(t, e, i) {
  t.dispatchEvent(new CustomEvent(e, { detail: i, bubbles: !0, composed: !0 }));
}
let ut = class extends I {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var t;
    return Object.keys(((t = this.hass) == null ? void 0 : t.states) ?? {}).filter((e) => !this.domains.length || this.domains.includes(Qt(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
  }
  _emit(t) {
    Ps(this, "wp-change", t);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const e = this.filter;
      return c`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${e ? (i) => e(i.entity_id) : void 0}
        @value-changed=${(i) => {
        i.stopPropagation(), this._emit(i.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const t = this._ids().slice(0, 600);
    return c`
      <div class="field">
        ${this.label ? c`<label>${this.label}</label>` : _}
        <input type="text" list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(e) => {
      const i = e.target.value.trim();
      (i === "" || this.hass.states[i]) && this._emit(i);
    }}
          @input=${(e) => {
      const i = e.target.value.trim();
      this.hass.states[i] && i !== this.value && this._emit(i);
    }} />
        <datalist id=${this._listId}>
          ${t.map((e) => c`<option value=${e}>${it(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
  }
};
ut.styles = [rt, R`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
st([
  v({ attribute: !1 })
], ut.prototype, "hass", 2);
st([
  v()
], ut.prototype, "value", 2);
st([
  v()
], ut.prototype, "label", 2);
st([
  v({ attribute: !1 })
], ut.prototype, "domains", 2);
st([
  v({ attribute: !1 })
], ut.prototype, "exclude", 2);
st([
  v({ attribute: !1 })
], ut.prototype, "filter", 2);
ut = st([
  B("wp-entity-picker")
], ut);
let oe = class extends I {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return St(this.hass);
  }
  _tr(t) {
    return h(this._lang, t);
  }
  _set(t) {
    Ps(this, "wp-change", t);
  }
  _patch(t, e) {
    this._set(this.conditions.map((i, s) => s === t ? { ...i, ...e } : i));
  }
  _parse(t, e) {
    const i = t.trim();
    return i !== "" && !Number.isNaN(Number(i)) ? Number(i) : e && i === "true" ? !0 : e && i === "false" ? !1 : t;
  }
  render() {
    return c`
      ${this.conditions.map(
      (t, e) => c`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${t.entity_id} .label=${this._tr("entity")}
              @wp-change=${(i) => {
        i.stopPropagation(), this._patch(e, { entity_id: i.detail });
      }}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${t.attribute ?? ""} placeholder="—"
                  @change=${(i) => this._patch(e, { attribute: i.target.value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(i) => this._patch(e, { op: i.target.value })}>
                  ${["eq", "ne", "lt", "gt"].map(
        (i) => c`<option value=${i} ?selected=${(t.op ?? "eq") === i}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[i]}</option>`
      )}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(t.value ?? "")}
                  @change=${(i) => this._patch(e, { value: this._parse(i.target.value, !!t.attribute) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((i, s) => s !== e))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`
    )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }
};
oe.styles = rt;
st([
  v({ attribute: !1 })
], oe.prototype, "hass", 2);
st([
  v({ attribute: !1 })
], oe.prototype, "conditions", 2);
oe = st([
  B("wp-conditions-editor")
], oe);
var zr = Object.defineProperty, Tr = Object.getOwnPropertyDescriptor, Lt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Tr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && zr(e, i, r), r;
};
let _t = class extends I {
  constructor() {
    super(...arguments), this.entityId = "", this.action = null, this.disabled = !1, this.allowed = [], this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return St(this.hass);
  }
  updated() {
    !this.hass || !this.entityId || this._loadedFor === this.entityId || (this._loadedFor = this.entityId, Ht(this.hass, As(this.hass, this.entityId)).then((t) => t && this.requestUpdate()), this._selector || Ss().then((t) => this._selector = t));
  }
  _emit(t) {
    this.dispatchEvent(new CustomEvent("action-change", { detail: t, bubbles: !0, composed: !0 }));
  }
  _setData(t, e) {
    var r;
    if (((r = this.action) == null ? void 0 : r.kind) !== "service") return;
    const i = { ...this.action.data ?? {} };
    e == null || e === "" || Array.isArray(e) && !e.length ? delete i[t] : i[t] = e, this._emit({ ...this.action, data: i });
  }
  /** Context of Home Assistant's service control: the entity the field is about, and the attribute to list. */
  _context(t) {
    const e = t.selector.state;
    return {
      filter_entity: [this.entityId],
      filter_target: { entity_id: [this.entityId] },
      entity_id: this.entityId,
      filter_attribute: (e == null ? void 0 : e.attribute) ?? ui[t.key]
    };
  }
  /** Selector of a field; a list of the device (modes, presets…) is built from its attribute when it has one. */
  _selectorOf(t) {
    const e = Cr(this.hass, this.entityId, t);
    return e ? { select: { options: e, mode: "dropdown" } } : t.selector;
  }
  render() {
    var l, p, u, m;
    if (!this.hass || !this.entityId) return _;
    const t = this._lang, e = ((l = this.action) == null ? void 0 : l.kind) === "service" ? this.action.service : "", i = Ie(this.hass, this.entityId, this.allowed.length && e ? [...this.allowed, e] : this.allowed), s = ((p = this.action) == null ? void 0 : p.kind) === "service" ? this.action.data ?? {} : {}, r = e ? pi(this.hass, e, this.entityId) : [], n = Pr(this.hass, this.entityId), o = ((u = this.action) == null ? void 0 : u.kind) === "scene" ? this.action.scene : e, a = e ? Bi(this.hass, e) || h(t, "action_no_description") : ((m = this.action) == null ? void 0 : m.kind) === "scene" ? h(t, "action_scene_description") : "";
    return c`
      <label class="action-label" for="action">${h(t, "action")}</label>
      <select id="action" .value=${o || ""} aria-describedby="action-description" ?disabled=${this.disabled}
        @change=${(d) => {
      const f = d.target.value;
      f && (f.startsWith("scene.") ? this._emit({ kind: "scene", scene: f }) : this._emit({ kind: "service", service: f, data: Ar(this.hass, f, this.entityId) }));
    }}>
        <option value="" disabled ?selected=${!o}>${h(t, "action_choose")}</option>
        ${i.map((d) => c`<option value=${d.id} ?selected=${d.id === e}
          title=${Bi(this.hass, d.id) || h(t, "action_no_description")}>${d.label}</option>`)}
        ${n.map((d) => c`<option value=${d.entity_id} ?selected=${d.entity_id === o}
          title=${h(t, "action_scene_description")}>${String(d.attributes.friendly_name ?? d.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${a}</p>
      ${r.map((d) => this._selector ? c`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(d)} .context=${this._context(d)} .value=${s[d.key]} .label=${d.label}
            .required=${d.required} ?disabled=${this.disabled}
            @value-changed=${(f) => {
      f.stopPropagation(), this._setData(d.key, f.detail.value);
    }}></ha-selector>` : c`<div class="field"><label>${d.label}</label><input type="text" .value=${String(s[d.key] ?? "")} ?disabled=${this.disabled}
            @change=${(f) => this._setData(d.key, f.target.value)} /></div>`)}`;
  }
};
_t.styles = [rt, R`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 14px; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 14px;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
Lt([
  v({ attribute: !1 })
], _t.prototype, "hass", 2);
Lt([
  v({ attribute: "entity-id" })
], _t.prototype, "entityId", 2);
Lt([
  v({ attribute: !1 })
], _t.prototype, "action", 2);
Lt([
  v({ type: Boolean })
], _t.prototype, "disabled", 2);
Lt([
  v({ attribute: !1 })
], _t.prototype, "allowed", 2);
Lt([
  $()
], _t.prototype, "_selector", 2);
_t = Lt([
  B("wp-action-picker")
], _t);
var Nr = Object.defineProperty, jr = Object.getOwnPropertyDescriptor, N = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? jr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Nr(e, i, r), r;
};
let z = class extends I {
  constructor() {
    super(...arguments), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this.embedded = !1, this._form = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._ov = {}, this._error = "", this._saving = !1, this._valueFor = null, this._loaded = "";
  }
  get _lang() {
    return St(this.hass);
  }
  _emit(t, e) {
    this.dispatchEvent(new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }));
  }
  updated() {
    var i;
    const t = (i = L(this.data, this.value)) == null ? void 0 : i.action, e = (t == null ? void 0 : t.kind) === "service" ? t.service.split(".")[0] : "";
    !this.hass || !e || this._loaded === e || (this._loaded = e, Ht(this.hass, [e]).then((s) => s && this.requestUpdate()));
  }
  /** Opens the form on the chosen label (a pencil), or on a new one. */
  _open(t) {
    const e = t ? L(this.data, this.value) : void 0;
    t && !e || (this._form = !0, this._editId = (e == null ? void 0 : e.id) ?? null, this._name = (e == null ? void 0 : e.name) ?? "", this._color = (e == null ? void 0 : e.color) ?? Er(this.data.labels), this._action = e ? structuredClone(e.action) : null, this._ov = {}, this._valueFor = null, this._error = "", this._changed());
  }
  _close() {
    this._form = !1, this._error = "", this._changed();
  }
  /** The form changed: an embedding form is told. */
  _changed() {
    this.embedded && this._emit("label-draft", this._form ? this._draft() : null);
  }
  _draft() {
    return {
      id: this._editId,
      name: this._name.trim(),
      color: this._color,
      action: this._action,
      overrides: Object.entries(this._ov).map(([t, e]) => ({ entityId: t, action: e })),
      problem: this._formProblem
    };
  }
  get _formProblem() {
    const t = this._lang;
    return this._name.trim() ? this._action ? this._action.kind === "service" && Cs(this.hass, this._action.service, this._action.data, this.entityIds[0]).length ? h(t, "lb_err_fields") : "" : h(t, "lb_err_action") : h(t, "lb_err_name");
  }
  _set(t) {
    t.name !== void 0 && (this._name = t.name), t.color !== void 0 && (this._color = t.color), t.action !== void 0 && (this._action = t.action), this._error = "", this._changed();
  }
  /** The value of the label for a device as the form shows it: changed in the form, else the saved one. */
  _ownValue(t, e) {
    var i, s;
    return t in this._ov ? this._ov[t] : ((s = (i = this.program.entities.find((r) => r.entity_id === t)) == null ? void 0 : i.label_overrides) == null ? void 0 : s[e]) ?? null;
  }
  /** Writes the changed values for a device on the live program (own Save only). */
  async _saveOverrides(t) {
    const e = Object.entries(this._ov);
    if (e.length)
      for (let i = 0; i < 2; i++) {
        const r = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((o) => o.id === this.program.id);
        if (!r) return;
        const n = {
          ...r,
          entities: r.entities.map((o) => {
            const a = e.filter(([p]) => p === o.entity_id);
            if (!a.length) return o;
            const l = { ...o.label_overrides ?? {} };
            for (const [, p] of a)
              p ? l[t] = p : delete l[t];
            return { ...o, label_overrides: l };
          })
        };
        try {
          await this.hass.callWS({ type: "weekly_planner/program/save", program: n });
          return;
        } catch (o) {
          if ((o == null ? void 0 : o.code) !== "conflict") throw o;
        }
      }
  }
  async _save() {
    const t = this._formProblem;
    if (t) {
      this._error = t;
      return;
    }
    this._saving = !0;
    try {
      const e = await this.hass.callWS({
        type: "weekly_planner/label/save",
        label: { ...this._editId ? { id: this._editId } : {}, name: this._name.trim(), color: this._color, action: this._action }
      });
      await this._saveOverrides(e.label.id), this._form = !1, this._emit("label-change", e.label.id);
    } catch (e) {
      const i = e;
      this._error = (i == null ? void 0 : i.code) === "unauthorized" ? h(this._lang, "err_unauthorized") : h(this._lang, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  _choose(t) {
    this._form && (this._form = !1, this._changed()), this._emit("label-change", t);
  }
  /** "Value for this device" inside the form: the action of the label for this device only. */
  _valueEditor(t, e) {
    const i = this._lang, s = this._ownValue(t, e), r = this._valueFor === t;
    return c`<div class="dev">
      <button class="link ${s ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${r}
        @click=${() => this._valueFor = r ? null : t}>${h(i, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${it(this.hass, t)}` : ""}</button>
      ${r ? c`<div class="valbox">
        <wp-action-picker .hass=${this.hass} entity-id=${t} .allowed=${Pe(this.program, t)}
          .action=${s ?? this._action} ?disabled=${this.disabled}
          @action-change=${(n) => {
      n.stopPropagation(), this._ov = { ...this._ov, [t]: n.detail }, this._error = "", this._changed();
    }}></wp-action-picker>
        ${s ? c`<button class="btn" ?disabled=${this.disabled}
          @click=${() => {
      this._ov = { ...this._ov, [t]: null }, this._changed();
    }}>
          <ha-icon icon="mdi:undo"></ha-icon>${h(i, "lb_common_value")}</button>` : _}
      </div>` : _}
    </div>`;
  }
  _renderForm() {
    const t = this._lang;
    return c`<div class="form">
      <div class="field"><label for="lb-name">${h(t, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e) => this._set({ name: e.target.value })} /></div>
      <div class="swatches" role="radiogroup" aria-label=${h(t, "lb_color")}>
        ${Zt.map((e) => c`<button class="sw ${e === this._color ? "on" : ""}" role="radio" aria-checked=${e === this._color}
          aria-label=${e} style="background:${e}" @click=${() => this._set({ color: e })}></button>`)}
      </div>
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${Pe(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled}
        @action-change=${(e) => {
      e.stopPropagation(), this._set({ action: e.detail });
    }}></wp-action-picker>
      ${this._editId ? this.entityIds.map((e) => this._valueEditor(e, this._editId)) : _}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : _}
      ${this.embedded ? _ : c`<div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled} @click=${() => void this._save()}>${h(t, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${h(t, "cancel")}</button>
      </div>`}
    </div>`;
  }
  /** The chosen label, read-only: colour, name, what it does, the value for a device when there is one. */
  _renderDetails(t) {
    const e = this._lang;
    return c`
      <!-- framed in the label's colour so it clearly belongs to it -->
      <div class="details" style="--lc:${t.color}">
        <div class="dhead">
          <i class="dot" style="background:${t.color}"></i><b>${t.name}</b>
          ${ke(this.data, t.id).some((i) => i !== this.program.name) ? c`<span class="shared">${h(e, "shared")}</span>` : _}
          <button class="pen ${this._form ? "on" : ""}" aria-label=${h(e, "rename_label")} title=${h(e, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => this._form && this._editId ? this._close() : this._open(!0)}><ha-icon icon="mdi:pencil"></ha-icon></button>
        </div>
        ${this._form ? _ : c`
          <div class="sum"><span class="what">${Or(this.hass, e, t.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((i) => {
      const s = Mr(this.program, i, t.id) ? bt(this.program, i, t) : void 0;
      return s ? c`<div class="sum"><span class="k">${h(e, "lb_value_here")} :</span>
              <span class="what">${ne(this.hass, e, s)}</span>
              ${this.entityIds.length > 1 ? c`<span class="who">${it(this.hass, i)}</span>` : _}</div>` : _;
    })}`}
        ${this._form && this._editId ? this._renderForm() : _}
      </div>`;
  }
  render() {
    if (!this.hass || !this.data) return _;
    const t = this._lang, e = _i(this.hass, this.data, this.entityIds, this.program), i = L(this.data, this.value), s = (r, n, o, a) => c`
      <button class="chip ${n ? "on" : ""}" role="radio" aria-checked=${n} ?disabled=${this.disabled} @click=${o}>
        ${a ? c`<i class="dot" style="background:${a}"></i>` : _}<span>${r}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${h(t, "action")}>
        ${this.allowNone ? s(h(t, "rest_none"), this.value === null, () => this._choose(null)) : _}
        ${e.map((r) => s(r.name, r.id === this.value, () => this._choose(r.id), r.color))}
        ${this.value && !i ? s("?", !0, () => {
    }) : _}
        ${this.compact ? _ : c`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => this._form && !this._editId ? this._close() : this._open(!1)}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${h(t, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId ? this._renderForm() : _}
      ${i && !(this._form && !this._editId) ? this._renderDetails(i) : _}`;
  }
};
z.styles = [rt, R`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .details {
      margin-top: 10px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--lc);
      border-left-width: 4px; background: color-mix(in srgb, var(--lc) 10%, transparent);
    }
    .dhead { display: flex; align-items: center; gap: 8px; min-height: 40px; }
    .dhead b { flex: 1; min-width: 0; }
    .details .k { color: var(--secondary-text-color); }
    .chip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { border: 2px solid var(--primary-color); font-weight: 600; }
    .chip.add { border-style: dashed; color: var(--primary-color); }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .edit { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .pen {
      width: 48px; height: 48px; border: none; border-radius: 24px; background: none; color: var(--secondary-text-color);
      cursor: pointer; --mdc-icon-size: 20px; display: inline-flex; align-items: center; justify-content: center;
    }
    .pen.on { background: var(--secondary-background-color); color: var(--primary-color); }
    .pen:hover { background: var(--secondary-background-color); }
    .shared { font-size: 12px; color: var(--secondary-text-color); }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .form { margin-top: 12px; padding: 12px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 40px; height: 40px; border-radius: 20px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .sw.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .err { color: var(--error-color, #db4437); margin: 8px 0 0; }
    .dev { margin-top: 6px; }
    .sum { margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 15px; }
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
N([
  v({ attribute: !1 })
], z.prototype, "hass", 2);
N([
  v({ attribute: !1 })
], z.prototype, "data", 2);
N([
  v({ attribute: !1 })
], z.prototype, "program", 2);
N([
  v({ attribute: !1 })
], z.prototype, "entityIds", 2);
N([
  v({ attribute: !1 })
], z.prototype, "value", 2);
N([
  v({ type: Boolean, attribute: "allow-none" })
], z.prototype, "allowNone", 2);
N([
  v({ type: Boolean })
], z.prototype, "disabled", 2);
N([
  v({ type: Boolean })
], z.prototype, "compact", 2);
N([
  v({ type: Boolean })
], z.prototype, "embedded", 2);
N([
  $()
], z.prototype, "_form", 2);
N([
  $()
], z.prototype, "_editId", 2);
N([
  $()
], z.prototype, "_name", 2);
N([
  $()
], z.prototype, "_color", 2);
N([
  $()
], z.prototype, "_action", 2);
N([
  $()
], z.prototype, "_ov", 2);
N([
  $()
], z.prototype, "_error", 2);
N([
  $()
], z.prototype, "_saving", 2);
N([
  $()
], z.prototype, "_valueFor", 2);
z = N([
  B("wp-label-picker")
], z);
var Lr = Object.defineProperty, Rr = Object.getOwnPropertyDescriptor, de = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Rr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Lr(e, i, r), r;
};
let jt = class extends I {
  constructor() {
    super(...arguments), this.message = "", this.confirmLabel = "", this.cancelLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (t) => {
      t.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
    };
  }
  _choose(t) {
    var e;
    this._result = t, (e = this.renderRoot.querySelector("wp-dialog")) == null || e.close();
  }
  render() {
    const t = H(this.lang);
    return c`
      <wp-dialog open heading=${t.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${this.cancelLabel || t.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }
};
jt.styles = R`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
de([
  v()
], jt.prototype, "message", 2);
de([
  v({ attribute: "confirm-label" })
], jt.prototype, "confirmLabel", 2);
de([
  v({ attribute: "cancel-label" })
], jt.prototype, "cancelLabel", 2);
de([
  v()
], jt.prototype, "lang", 2);
jt = de([
  B("wp-confirm")
], jt);
function pt(t, e, i, s = "") {
  return new Promise((r) => {
    var a;
    const n = document.createElement("wp-confirm");
    n.message = e, n.confirmLabel = i, n.cancelLabel = s;
    const o = t.hass;
    n.lang = ((a = o == null ? void 0 : o.locale) == null ? void 0 : a.language) ?? (o == null ? void 0 : o.language) ?? (document.documentElement.lang || "en"), n.addEventListener("choice", (l) => {
      n.remove(), r(!!l.detail);
    }), (t.shadowRoot ?? t).appendChild(n);
  });
}
const Ms = " ", Me = (t) => t.replace(/ /g, Ms), We = (t, e) => JSON.stringify(t) === JSON.stringify(e), Br = (t, e) => {
  const i = Math.abs(e), s = i < 60 ? `${i} min` : i % 60 ? `${Math.floor(i / 60)} h ${String(i % 60).padStart(2, "0")}` : `${i / 60} h`;
  return `${e > 0 ? "+" : "−"}${s}`;
};
function Qe(t, e, i) {
  if ("time" in e) {
    const [n, o] = e.time.split(":").map(Number);
    return Me(n * 60 + o >= k ? "24 h" : ht(t, n * 60 + o));
  }
  const s = h(t, e.sun === "sunrise" || e.sun === "sunset" ? `sun_${e.sun}_short` : `sun_${e.sun}`), r = e.offset ? ` ${Br(t, e.offset)}` : "";
  return Me(`${s}${r}`);
}
function Wi(t, e) {
  if ("time" in t) {
    const [i, s] = t.time.split(":").map(Number), r = Math.max(0, Math.min(k, Math.round((i * 60 + s + e) / Ee) * Ee));
    return { time: r >= k ? "24:00" : `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}` };
  }
  return { ...t, offset: Math.max(-240, Math.min(240, (t.offset ?? 0) + e)) };
}
const Os = [0, 1, 2, 3, 4], Ds = [5, 6], ae = [0, 1, 2, 3, 4, 5, 6];
function Ur(t, e, i) {
  const s = [...i].sort((r, n) => r - n);
  return We(s, ae) ? h(t, "all_days_text") : We(s, Os) ? `${e[0]}–${e[4]}` : We(s, Ds) ? h(t, "weekend") : s.map((r) => e[r]).join(Ms);
}
function Ze(t) {
  if (Array.isArray(t)) return `[${t.map(Ze).join(",")}]`;
  if (t && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((i) => `${JSON.stringify(i)}:${Ze(e[i])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function ti(t) {
  const { id: e, ...i } = t;
  return Ze({ ...i, conditions: t.conditions ?? [], end: t.end ?? null, color: t.color ?? null });
}
function fi(t, e, i) {
  const s = /* @__PURE__ */ new Map();
  return t.days.forEach((r, n) => {
    for (const o of r) {
      if (!e(o)) continue;
      const a = ti(o);
      let l = s.get(a);
      if (l && l.days.includes(n)) {
        l = void 0, s.set(`${a}#${o.id}`, { slot: o, days: [n], ids: { [n]: o.id } });
        continue;
      }
      l || (l = { slot: o, days: [], ids: {} }, s.set(a, l)), l.days.push(n), l.ids[n] = o.id;
    }
  }), [...s.values()].sort(
    (r, n) => i(r.slot.start) - i(n.slot.start) || r.days[0] - n.days[0]
  );
}
function Wr(t, e, i, s) {
  const r = t.days.map((n) => n.filter((o) => !i(o)));
  for (const n of e)
    for (const o of n.days)
      r[o].push({ ...structuredClone(n.slot), id: n.ids[o] ?? Z() });
  return { ...t, days: r.map((n) => n.sort((o, a) => s(o.start) - s(a.start))) };
}
const qr = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Fr = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Se(t, e) {
  var r;
  if ("time" in e) return Dt(e.time);
  const i = (r = t.states["sun.sun"]) == null ? void 0 : r.attributes[qr[e.sun]];
  let s = i ? ct(i, t.config.time_zone) : Fr[e.sun];
  return s += e.offset ?? 0, e.earliest && (s = Math.max(s, Dt(e.earliest))), e.latest && (s = Math.min(s, Dt(e.latest))), Math.max(0, Math.min(k, s));
}
function Hr(t) {
  const e = wt(t.start);
  if (e === null || !t.end) return null;
  const i = wt(t.end);
  return i === null ? null : i > e ? [e, i] : [e, k];
}
function Is(t) {
  var r, n;
  const e = t.map((o) => ({ slot: o, iv: Hr(o) })).filter((o) => o.iv !== null).sort((o, a) => o.iv[0] - a.iv[0]);
  let i = ((r = e[0]) == null ? void 0 : r.iv[1]) ?? 0, s = (n = e[0]) == null ? void 0 : n.slot;
  for (let o = 1; o < e.length; o++) {
    if (e[o].iv[0] < i) return [s, e[o].slot];
    e[o].iv[1] > i && (i = e[o].iv[1], s = e[o].slot);
  }
  return null;
}
const qi = (t) => t.ids[t.days[0]], zs = (t, e) => e !== null && Object.values(t.ids).includes(e);
function Vr(t, e, i, s) {
  return fi(t, e, i).find((r) => zs(r, s)) ?? null;
}
function Kr(t, e) {
  return t ? ti(t.slot) !== ti(e.slot) ? "changed" : JSON.stringify(t.days) === JSON.stringify(e.days) && JSON.stringify(t.ids) === JSON.stringify(e.ids) ? "same" : "days" : "gone";
}
function Fi(t, e) {
  const { [e]: i, ...s } = t.ids;
  return {
    draft: { slot: structuredClone(t.slot), days: [e], ids: i ? { [e]: i } : {} },
    rest: { slot: structuredClone(t.slot), days: t.days.filter((r) => r !== e), ids: s }
  };
}
function Jr(t, e) {
  if (!t) return [];
  const i = t.days.filter((r) => !e.includes(r)), s = Object.fromEntries(i.filter((r) => t.ids[r]).map((r) => [r, t.ids[r]]));
  return i.length ? [{ ...t, days: i, ids: s }] : [];
}
function Xt(t, e, i, s) {
  var n;
  const r = fi(t, e, i).filter((o) => !zs(o, s.openId));
  return r.push(...Jr(s.rest, ((n = s.draft) == null ? void 0 : n.days) ?? [])), s.draft && r.push(s.draft), Wr(t, r, e, i);
}
function Xr(t) {
  const e = t.days.findIndex((i) => Is(i));
  return e < 0 ? null : e;
}
function Gr(t, e, i, s, r = ae) {
  const n = [], o = [];
  for (const a of r) {
    const l = { ...s, id: "__new__" };
    (Is([...t.days[a].filter(e), l]) ? o : n).push(a);
  }
  return { free: n, busy: o };
}
const Hi = 5;
function Yr(t, e) {
  let i = 480;
  t.length && (i = Math.max(...t.map((r) => e(r.end ?? r.start))), i = Math.ceil(i / Hi) * Hi);
  const s = Math.min(i, k - 60);
  return { start: re(s), end: re(Math.min(k, s + 60)) };
}
function Vi(t, e, i = { start: "08:00", end: "09:00" }) {
  return { slot: { id: Z(), start: { time: i.start }, end: { time: i.end }, conditions: [], label: t }, days: [...e], ids: {}, fresh: !0 };
}
const $t = 15, Ts = (t) => Math.round(t / $t) * $t, mi = (t, e, i) => Math.max(e, Math.min(i, t));
function dt(t) {
  const e = mi(Math.round(t), 0, k);
  return { time: `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}` };
}
function V(t, e) {
  const i = e(t.start);
  if (!t.end) return { start: i, end: null, wrap: !1 };
  const s = e(t.end);
  return s > i ? { start: i, end: s, wrap: !1 } : { start: i, end: k, wrap: !0 };
}
function Ki(t, e) {
  const i = t.map((n) => ({ slot: n, e: V(n, e.at) })).filter((n) => n.e.end !== null).sort((n, o) => n.e.start - o.e.start), s = [];
  let r = e.lead ?? 0;
  for (const { slot: n, e: o } of i)
    o.start > r && s.push({ kind: "gap", start: r, end: o.start }), s.push({ kind: "slot", id: n.id, slot: n, start: o.start, end: o.end, wrap: o.wrap }), r = Math.max(r, o.end);
  return r < k && s.push({ kind: "gap", start: r, end: k }), s;
}
function ei(t, e) {
  const i = [], s = /* @__PURE__ */ new Map();
  for (const r of t) {
    const n = V(r, e.at);
    if (n.end === null) {
      i.push({ m: n.start, refs: [{ id: r.id, edge: "start" }], oneShot: !0 });
      continue;
    }
    const o = [[n.start, { id: r.id, edge: "start" }]];
    n.wrap || o.push([n.end, { id: r.id, edge: "end" }]);
    for (const [a, l] of o) {
      let p = s.get(a);
      p || (p = { m: a, refs: [], oneShot: !1 }, s.set(a, p), i.push(p)), p.refs.push(l);
    }
  }
  return i.sort((r, n) => r.m - n.m);
}
const Ji = (t, e) => t.id === e.id && t.edge === e.edge;
function Ns(t, e, i) {
  const s = t.find((n) => n.id === e.id);
  if (!s) return null;
  const r = V(s, i.at);
  return e.edge === "start" ? r.start : r.end;
}
function me(t, e, i, s) {
  const r = t.find((d) => d.id === e.id);
  if (!r) return null;
  const n = V(r, s.at);
  let o, a = 0, l = k;
  if (n.end === null) {
    if (e.edge !== "start") return null;
    o = [e], l = k - $t;
  } else {
    if (e.edge === "end" && n.wrap) return null;
    const d = ei(t, s).find((b) => !b.oneShot && b.refs.some((w) => Ji(w, e)));
    if (!d) return null;
    o = d.refs;
    const f = d.m;
    f >= (s.lead ?? 0) && (a = s.lead ?? 0);
    for (const b of t) {
      const w = V(b, s.at);
      if (w.end === null) continue;
      const A = [[w.start, { id: b.id, edge: "start" }], [w.end, w.wrap ? null : { id: b.id, edge: "end" }]];
      for (const [S, g] of A)
        g && o.some((C) => Ji(C, g)) || (S < f ? a = Math.max(a, S) : S > f && (l = Math.min(l, S)));
    }
    for (const b of o) {
      const w = t.find((S) => S.id === b.id), A = V(w, s.at);
      b.edge === "end" ? a = Math.max(a, A.start + $t) : l = Math.min(l, A.end - $t);
    }
  }
  if (a > l) return { slots: t, m: Ns(t, e, s) ?? 0 };
  const p = mi(Ts(i), a, l), u = dt(p);
  return { slots: t.map((d) => {
    const f = o.find((b) => b.id === d.id);
    return f ? f.edge === "start" ? { ...d, start: u } : { ...d, end: u } : d;
  }), m: p };
}
function ii(t, e) {
  return e - t < 2 * $t ? null : mi(Ts((t + e) / 2), t + $t, e - $t);
}
function Xi(t, e, i) {
  const s = i.newId ?? ze;
  if (e.kind === "gap") {
    const u = ii(e.start, e.end);
    if (u === null || !i.defaultLabel) return null;
    const m = { id: s(), start: dt(u), end: dt(e.end), conditions: [], label: i.defaultLabel };
    return { slots: le([...t, m], i), handle: { id: m.id, edge: "start" } };
  }
  const r = t.find((u) => u.id === e.id);
  if (!r || !r.end) return null;
  const n = V(r, i.at), o = ii(n.start, n.end);
  if (o === null) return null;
  const a = { ...structuredClone(r), id: s(), start: dt(o) }, l = { ...r, end: dt(o) }, p = t.flatMap((u) => u.id === r.id ? [l, a] : [u]);
  return { slots: le(p, i), handle: { id: a.id, edge: "start" } };
}
function Qr(t, e, i, s) {
  if (e.kind === "slot") return t.map((n) => n.id === e.id ? { ...n, label: i } : n);
  const r = { id: (s.newId ?? ze)(), start: dt(e.start), end: dt(e.end), conditions: [], label: i };
  return le([...t, r], s);
}
function Zr(t, e) {
  return t.filter((i) => i.id !== e);
}
const ze = () => Z();
function le(t, e) {
  return [...t].sort((i, s) => e.at(i.start) - e.at(s.start));
}
const tn = (t, e) => t.label === e.label && Oe(t.conditions ?? []) === Oe(e.conditions ?? []) && (t.color ?? null) === (e.color ?? null), Oe = (t) => JSON.stringify(t);
function js(t, e, i = /* @__PURE__ */ new Set()) {
  const s = [];
  for (const r of le(t, e)) {
    const n = s[s.length - 1];
    if (n && n.end && r.end) {
      const o = V(n, e.at), a = V(r, e.at);
      if (!o.wrap && o.end === a.start && tn(n, r) && !i.has(n.id) && !i.has(r.id)) {
        s[s.length - 1] = { ...n, end: r.end };
        continue;
      }
    }
    s.push(r);
  }
  return s;
}
function en(t, e, i, s) {
  const r = s.newId ?? ze, n = [];
  for (const o of t) {
    const a = V(o, s.at);
    if (a.end === null || a.end <= e || a.start >= i) {
      n.push(o);
      continue;
    }
    const l = a.start < e, p = a.end > i;
    l && n.push({ ...o, end: dt(e) }), p && n.push({ ...structuredClone(o), id: l ? r() : o.id, start: dt(i) });
  }
  return n;
}
function sn(t, e, i, s) {
  var o;
  const r = (o = t[e.day]) == null ? void 0 : o.find((a) => a.id === e.id);
  if (!r) return [];
  const n = V(r, s.at);
  return n.end === null ? [] : i.filter((a) => a !== e.day && t[a].some((l) => {
    const p = V(l, s.at);
    return p.end !== null && p.start < n.end && p.end > n.start;
  }));
}
function Gi(t, e, i, s, r = []) {
  var l;
  const n = (l = t[e.day]) == null ? void 0 : l.find((p) => p.id === e.id);
  if (!n) return t;
  const o = s.newId ?? ze, a = V(n, s.at);
  return t.map((p, u) => {
    if (!i.includes(u) || u === e.day || r.includes(u)) return p;
    const m = { ...structuredClone(n), id: o() };
    return a.end === null ? p.some((f) => !f.end && Oe(f.start) === Oe(n.start) && f.label === n.label) ? p : le([...p, m], s) : js([...en(p, a.start, a.end, s), m], s);
  });
}
var rn = Object.defineProperty, nn = Object.getOwnPropertyDescriptor, O = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? nn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && rn(e, i, r), r;
};
const on = 450, an = 22, Yi = 8, ln = 700, qe = /* @__PURE__ */ new Map(), cn = (t, e) => t && t.revision > e.revision ? t : e;
let E = class extends I {
  constructor() {
    super(...arguments), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.lang = "en", this.tz = "UTC", this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._hover = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (t) => "time" in t ? Dt(t.time) : this._sun.get(JSON.stringify(t)) ?? Se(this.hass, t), this._outside = (t) => {
      const e = t.composedPath();
      e.includes(this) || e.some((i) => {
        var s;
        return i instanceof HTMLElement && ((s = i.classList) == null ? void 0 : s.contains("snack"));
      }) || this._emit("edit-exit");
    }, this._escape = (t) => {
      t.key === "Escape" && !this._conflict && this._emit("edit-exit");
    };
  }
  get _live() {
    return cn(qe.get(this.program.id), this.program);
  }
  get _baseDay() {
    return Q(this._live, this.data).days[this.weekday] ?? [];
  }
  get _day() {
    return this._draft ?? this._baseDay;
  }
  get _lead() {
    return Math.max(0, ...this.spans.filter((t) => t.spill).map((t) => t.end));
  }
  _ctx(t) {
    var s;
    const e = this.program.entities.find((r) => r.entity_id === this.entityId), i = (s = _i(this.hass, this.data, [this.entityId])[0]) == null ? void 0 : s.id;
    return {
      at: this._at,
      lead: this._lead,
      newId: t ?? Z,
      defaultLabel: (e == null ? void 0 : e.default_label) ?? i
    };
  }
  willUpdate(t) {
    var e;
    if (t.has("program") || t.has("preview") || t.has("data")) {
      this._sun = /* @__PURE__ */ new Map();
      for (const i of this._baseDay) {
        const s = (e = this.preview) == null ? void 0 : e.find((r) => r.slot_id === i.id);
        s && ("sun" in i.start && this._sun.set(JSON.stringify(i.start), ct(s.start, this.tz)), i.end && "sun" in i.end && s.end && this._sun.set(JSON.stringify(i.end), ct(s.end, this.tz)));
      }
      this._awaitRev !== null && this.program.revision >= this._awaitRev && this._dropDraft();
    }
  }
  updated(t) {
    t.has("editing") && (this.editing ? this._listen(!0) : (this._listen(!1), this._flushNudge(), this._selected = null, this._hsel = null, this._copyOpen = !1, this._conflict = null, this._keep.clear(), this._bubble = null));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), this._listen(!1), window.clearTimeout(this._clearTimer), window.clearTimeout(this._errTimer), window.clearTimeout((t = this._press) == null ? void 0 : t.timer);
  }
  _dropDraft() {
    this._draft = null, this._awaitRev = null, window.clearTimeout(this._clearTimer);
  }
  _listen(t) {
    if (t === this._listening) return;
    this._listening = t;
    const e = t ? document.addEventListener.bind(document) : document.removeEventListener.bind(document);
    e("pointerdown", this._outside, !0), e("keydown", this._escape);
  }
  _emit(t, e) {
    this.dispatchEvent(new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }));
  }
  /* ---- entering the edit mode (long press / click) ---- */
  _zoneDown(t) {
    if (this.editing || t.button !== 0) return;
    const e = t.pointerType === "mouse";
    this._press = { id: t.pointerId, x: t.clientX, y: t.clientY, fired: !1, mouse: e }, this.editable && !e && (this._press.timer = window.setTimeout(() => {
      var i;
      this._press && (this._press.fired = !0, (i = navigator.vibrate) == null || i.call(navigator, 12), this._emit("edit-request"));
    }, on));
  }
  _zoneMove(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || Math.hypot(t.clientX - e.x, t.clientY - e.y) > Yi && (window.clearTimeout(e.timer), this._press = void 0);
  }
  _zoneUp(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || (window.clearTimeout(e.timer), this._press = void 0, !e.fired && (e.mouse && this.editable ? this._emit("edit-request") : this._emit("open-day")));
  }
  _zoneCancel() {
    var t;
    window.clearTimeout((t = this._press) == null ? void 0 : t.timer), this._press = void 0;
  }
  /* ---- pointer in the edit mode ---- */
  get _overlay() {
    return this.renderRoot.querySelector(".ov");
  }
  _minuteAt(t) {
    var s;
    const e = (s = this._overlay) == null ? void 0 : s.getBoundingClientRect(), i = (e == null ? void 0 : e.width) || 1;
    return { m: (t - ((e == null ? void 0 : e.left) ?? 0)) / i * k, ppm: i / k };
  }
  _nearest(t, e) {
    let i;
    for (const s of ei(this._day, this._ctx())) {
      const r = Math.abs(s.m - t) * e;
      r <= an && (!i || r < i.d) && (i = { b: s, d: r });
    }
    return i == null ? void 0 : i.b;
  }
  _segAt(t) {
    const e = Ki(this._day, this._ctx()).find((i) => t >= i.start && t < i.end);
    return e ? e.kind === "slot" ? { kind: "slot", id: e.id } : { kind: "gap", start: e.start, end: e.end } : null;
  }
  _ovDown(t) {
    var r, n;
    if (t.button !== 0) return;
    this._flushNudge();
    const { m: e, ppm: i } = this._minuteAt(t.clientX), s = this._nearest(e, i);
    if (s) {
      (n = (r = t.currentTarget).setPointerCapture) == null || n.call(r, t.pointerId), this._drag = { ref: s.refs[0], m0: s.m, x0: t.clientX, id: t.pointerId, moved: !1, last: s.m }, this._hsel = s.refs[0], t.preventDefault();
      return;
    }
    this._tap = { id: t.pointerId, x: t.clientX, y: t.clientY, target: this._segAt(e) };
  }
  _ovMove(t) {
    const e = this._drag;
    if (e && e.id === t.pointerId) {
      const i = t.clientX - e.x0;
      if (!e.moved && Math.abs(i) < 3) return;
      e.moved = !0;
      const s = this._baseDay, r = me(s, e.ref, e.m0 + i / this._minuteAt(0).ppm, this._ctx());
      r && (e.last = r.m, this._draft = r.slots, this._bubble = { m: r.m });
      return;
    }
    if (!this._tap && !e) {
      const { m: i, ppm: s } = this._minuteAt(t.clientX);
      this._hover = !!this._nearest(i, s);
    }
  }
  _ovUp(t) {
    const e = this._drag;
    if (e && e.id === t.pointerId) {
      if (this._drag = void 0, this._bubble = null, e.moved) {
        const { ref: s, last: r } = e;
        this._commit((n) => {
          const o = me(n[this.weekday], s, r, this._ctx());
          return o ? this._with(n, this.weekday, o.slots) : null;
        }, [this.weekday]);
      } else {
        const s = this._baseDay.find((r) => r.id === e.ref.id);
        s && !s.end && this._select({ kind: "slot", id: s.id });
      }
      return;
    }
    const i = this._tap;
    i && i.id === t.pointerId && (this._tap = void 0, Math.hypot(t.clientX - i.x, t.clientY - i.y) <= Yi && i.target && this._select(i.target));
  }
  _ovCancel() {
    var t;
    (t = this._drag) != null && t.moved && (this._draft = null), this._drag = void 0, this._tap = void 0, this._bubble = null;
  }
  _select(t) {
    const e = this._selected && JSON.stringify(this._selected) === JSON.stringify(t);
    this._selected = e ? null : t, this._copyOpen = !1, this._copyDays = [];
  }
  /* ---- keyboard ---- */
  _key(t, e) {
    var n, o;
    if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
    t.preventDefault();
    const i = this._draft ?? this._baseDay, s = ((n = this._nudge) == null ? void 0 : n.m) ?? Ns(i, e, this._ctx());
    if (s === null) return;
    const r = me(i, e, s + (t.key === "ArrowRight" ? 15 : -15), this._ctx());
    r && (this._draft = r.slots, this._bubble = { m: r.m }, window.clearTimeout((o = this._nudge) == null ? void 0 : o.timer), this._nudge = { ref: e, m: r.m, timer: window.setTimeout(() => this._flushNudge(), ln) });
  }
  _flushNudge() {
    const t = this._nudge;
    t && (window.clearTimeout(t.timer), this._nudge = void 0, this._bubble = null, this._commit((e) => {
      const i = me(e[this.weekday], t.ref, t.m, this._ctx());
      return i ? this._with(e, this.weekday, i.slots) : null;
    }, [this.weekday]));
  }
  /* ---- saving ---- */
  _with(t, e, i) {
    return t.map((s, r) => r === e ? i : s);
  }
  _fail(t) {
    this._error = t, window.clearTimeout(this._errTimer), this._errTimer = window.setTimeout(() => this._error = "", 5e3);
  }
  /**
   * Builds the change on the CURRENT program (`op` is applied to the days of its active profile) and saves it.
   * A revision conflict is retried once on the fresh data; the user is never asked to reload.
   */
  async _commit(t, e, i = !1) {
    var r;
    let s = this._live;
    for (let n = 0; n < 2; n++) {
      const o = Q(s, this.data), a = o.days, l = t(a);
      if (!l)
        return this._dropDraft(), !1;
      const p = l.map((d, f) => e.includes(f) && d !== a[f] ? js(d, this._ctx(), this._keep) : d), u = p.map((d, f) => f).filter((d) => JSON.stringify(p[d]) !== JSON.stringify(a[d]));
      if (!u.length)
        return this._dropDraft(), !0;
      const m = { ...s, profiles: s.profiles.map((d) => d.id === o.id ? { ...d, days: p } : d) };
      this._draft = p[this.weekday] ?? null;
      try {
        const d = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(m) });
        if (d != null && d.program ? (qe.set(d.program.id, d.program), this._awaitRev = d.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= d.program.revision && this._dropDraft()) : this._dropDraft(), !i) {
          const f = u.map((b) => [b, a[b]]);
          this._emit("edited", {
            undo: () => this._commit((b) => b.map((w, A) => {
              var S;
              return ((S = f.find((g) => g[0] === A)) == null ? void 0 : S[1]) ?? w;
            }), u, !0)
          });
        }
        return !0;
      } catch (d) {
        const f = d;
        if ((f == null ? void 0 : f.code) === "conflict" && n === 0)
          try {
            const w = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((A) => A.id === s.id);
            if (w) {
              qe.set(w.id, w), s = w;
              continue;
            }
          } catch {
          }
        return this._dropDraft(), this._fail((r = f == null ? void 0 : f.message) != null && r.includes("overlapping_slots") ? h(this.lang, "w_err_overlap") : (f == null ? void 0 : f.code) === "unauthorized" ? h(this.lang, "err_unauthorized") : h(this.lang, "ss_err_save")), !1;
      }
    }
    return !1;
  }
  /* ---- actions of the strip ---- */
  get _sel() {
    const t = this._selected;
    if (!t) return null;
    const e = this._day;
    if (t.kind === "slot") {
      const s = e.find((n) => n.id === t.id);
      if (!s) return null;
      const r = V(s, this._at);
      return { target: t, slot: s, start: r.start, end: r.end };
    }
    const i = Ki(e, this._ctx()).find((s) => s.kind === "gap" && s.start === t.start);
    return i ? { target: { kind: "gap", start: i.start, end: i.end }, start: i.start, end: i.end } : null;
  }
  _pickLabel(t) {
    const e = this._sel;
    if (!e || t === null) return;
    const i = Z(), s = e.target;
    this._commit((r) => this._with(r, this.weekday, Qr(r[this.weekday], s, t, this._ctx(() => i))), [this.weekday]), s.kind === "gap" && (this._selected = { kind: "slot", id: i });
  }
  async _nothing() {
    const t = this._sel;
    if (!(t != null && t.slot)) return;
    const e = t.slot.id;
    await pt(this, h(this.lang, "w_confirm_slot"), h(this.lang, "yes"), h(this.lang, "no")) && (this._selected = null, this._commit((i) => this._with(i, this.weekday, Zr(i[this.weekday], e)), [this.weekday]));
  }
  _cut() {
    const t = this._sel;
    if (!t) return;
    const e = t.target, i = Z(), s = this._ctx(() => i), r = Xi(this._day, e, s);
    r && (this._keep.add(i), e.kind === "slot" && this._keep.add(e.id), this._hsel = r.handle, this._commit((n) => {
      const o = Xi(n[this.weekday], e, this._ctx(() => i));
      return o ? this._with(n, this.weekday, o.slots) : null;
    }, [this.weekday]).then(() => {
      this.updateComplete.then(() => {
        var n;
        return (n = this.renderRoot.querySelector(`[data-h="${i}:start"]`)) == null ? void 0 : n.focus();
      });
    }), e.kind === "gap" && (this._selected = { kind: "slot", id: i }));
  }
  _toggleDay(t) {
    this._copyDays = this._copyDays.includes(t) ? this._copyDays.filter((e) => e !== t) : [...this._copyDays, t];
  }
  _copyGo() {
    const t = this._sel;
    if (!(t != null && t.slot) || !this._copyDays.length) return;
    const e = t.slot.id, i = [...this._copyDays].sort((n, o) => n - o), s = Q(this._live, this.data).days, r = sn(s, { day: this.weekday, id: e }, i, this._ctx());
    if (r.length) {
      this._conflict = { to: i, days: r, skip: [], id: e };
      return;
    }
    this._doCopy(e, i, []);
  }
  async _doCopy(t, e, i) {
    this._conflict = null, this._copyOpen = !1, this._copyDays = [];
    const s = e.filter((r) => !i.includes(r));
    s.length && await this._commit((r) => {
      const n = Gi(r, { day: this.weekday, id: t }, e, this._ctx(), i);
      return n === r ? null : n;
    }, s);
  }
  /* ---- render ---- */
  _spansNow() {
    return this._draft ? [...this.spans.filter((t) => t.spill), ...this._spansOf(this._draft)] : this.spans;
  }
  /** Bar spans of the slots of a day (the labels that do nothing for this device are left out). */
  _spansOf(t) {
    const e = [];
    for (const i of t) {
      const s = L(this.data, i.label);
      if (!s || !bt(this.program, this.entityId, s)) continue;
      const r = V(i, this._at);
      e.push({
        start: r.start,
        end: r.end ?? r.start + 10,
        color: s.color,
        label: s.name,
        slotId: i.id,
        marker: r.end === null,
        startSun: Tt(i.start),
        endSun: i.end ? Tt(i.end) : null,
        startSpec: i.start,
        endSpec: i.end ?? null
      });
    }
    return e;
  }
  _clock(t) {
    return t >= k ? "24 h" : ht(this.lang, t);
  }
  /** Text of a handle on a sun boundary (the icon under it does not catch the pointer while editing). */
  _sunTitle(t, e) {
    var r;
    const i = (r = this._draft) == null ? void 0 : r.find((n) => n.id === t.id), s = t.edge === "start" ? i == null ? void 0 : i.start : i == null ? void 0 : i.end;
    return li(this.lang, s, e);
  }
  _overlay_() {
    const t = this._day, e = this._ctx(), i = (n) => `${n / k * 100}%`, s = this._sel, r = ei(t, e);
    return c`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${s && s.end !== null ? c`<div class="selbox ${s.slot ? "" : "gap"}"
        style="left:${i(s.start)};width:${i(s.end - s.start)}"></div>` : _}
      ${s != null && s.slot && s.end === null ? c`<div class="selpoint" style="left:${i(s.start)}"></div>` : _}
      ${pr(r, (n) => n.refs.map((o) => `${o.id}:${o.edge}`).join("+"), (n) => {
      const o = n.refs[0], a = this._hsel && n.refs.some((l) => {
        var p, u;
        return l.id === ((p = this._hsel) == null ? void 0 : p.id) && l.edge === ((u = this._hsel) == null ? void 0 : u.edge);
      });
      return c`<button class="hd ${n.oneShot ? "dot" : ""} ${a ? "on" : ""}" style="left:clamp(0px, ${i(n.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${n.m}
          aria-valuetext=${this._clock(n.m)} aria-label=${h(this.lang, "handle", { time: this._clock(n.m) })}
          data-h=${n.refs.map((l) => `${l.id}:${l.edge}`).join(" ")} title=${this._sunTitle(o, n.m)}
          @keydown=${(l) => this._key(l, o)} @focus=${() => this._hsel = o}
          ><i></i></button>`;
    })}
      ${this._bubble ? c`<div class="bubble" style="left:clamp(28px, ${i(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : _}
    </div>`;
  }
  _strip() {
    var n;
    const t = this._sel;
    if (!t) return _;
    const e = this.lang, i = this._ctx(), s = t.end !== null && (t.slot ? !!t.slot.end : !!i.defaultLabel) && ii(t.start, t.end) !== null, r = H(e).days_short;
    return c`<div class="strip" role="group">
      <wp-label-picker compact .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
        .value=${((n = t.slot) == null ? void 0 : n.label) ?? null} @label-change=${(o) => {
      o.stopPropagation(), this._pickLabel(o.detail);
    }}></wp-label-picker>
      <div class="acts">
        ${t.slot ? c`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${h(e, "rest_none_short")}</button>` : _}
        <button class="act" ?disabled=${!s} aria-label=${h(e, "cut")} title=${h(e, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${t.slot ? c`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => {
      this._copyOpen = !this._copyOpen, this._copyDays = [];
    }}><ha-icon icon="mdi:content-copy"></ha-icon>${h(e, "copy_to")}</button>` : _}
      </div>
      ${this._copyOpen && t.slot ? c`<div class="copy">
        ${r.map((o, a) => a === this.weekday ? _ : c`<button class="dchip ${this._copyDays.includes(a) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(a)} @click=${() => this._toggleDay(a)}>${o}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${h(e, "copy_go")} title=${h(e, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${h(e, "copy_go")}</button>
      </div>` : _}
    </div>`;
  }
  _conflictDialog() {
    const t = this._conflict;
    if (!t) return _;
    const e = this.lang, i = H(e).days, s = (l, p) => {
      this._conflict = { ...t, skip: p ? [...t.skip.filter((u) => u !== l), l] : t.skip.filter((u) => u !== l) };
    }, r = t.to.every((l) => t.skip.includes(l)), n = Q(this._live, this.data).days, o = this._ctx(), a = (l, p) => c`<div class="cfbar"><span>${l}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(p)} .now=${null}></wp-day-bar></div>`;
    return c`<wp-dialog open heading=${h(e, "conflict_title")} @closed=${(l) => {
      l.stopPropagation(), this._conflict = null;
    }}>
      <div class="cf">
        ${t.days.map((l) => c`<div class="cfrow"><strong>${i[l]}</strong>
          ${a(h(e, "cf_before"), n[l] ?? [])}
          ${a(h(e, "cf_after"), t.skip.includes(l) ? n[l] ?? [] : Gi(n, { day: this.weekday, id: t.id }, [l], o)[l] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${i[l]}>
            <button role="radio" aria-checked=${!t.skip.includes(l)} class=${t.skip.includes(l) ? "" : "on"} @click=${() => s(l, !1)}>${h(e, "replace")}</button>
            <button role="radio" aria-checked=${t.skip.includes(l)} class=${t.skip.includes(l) ? "on" : ""} @click=${() => s(l, !0)}>${h(e, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${h(e, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${r} @click=${() => void this._doCopy(t.id, t.to, t.skip)}>${h(e, "copy_go")}</button>
    </wp-dialog>`;
  }
  render() {
    return !this.hass || !this.data || !this.program ? _ : c`
      <div class="zone ${this.editing ? "editing" : ""}"
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(t) => {
      this._press && !this._press.mouse && t.preventDefault();
    }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${h(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : _}</wp-day-bar>
      </div>
      ${this.editing ? this._strip() : _}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : _}
      ${this._conflictDialog()}`;
  }
};
E.styles = [rt, R`
    :host { display: block; min-width: 0; }
    .zone { touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .zone.editing { touch-action: none; cursor: default; }
    .ov { position: absolute; inset: 0; touch-action: none; z-index: 2; }
    .ov.grab { cursor: ew-resize; }
    .selbox {
      position: absolute; top: 0; bottom: 0; border: 2px solid var(--primary-text-color); border-radius: 10px;
      box-shadow: 0 0 0 1px var(--card-background-color); pointer-events: none;
    }
    .selbox.gap { border-style: dashed; }
    .selpoint {
      position: absolute; top: 4px; bottom: 4px; width: 24px; margin-left: -12px; border: 2px solid var(--primary-text-color);
      border-radius: 12px; pointer-events: none;
    }
    .hd {
      position: absolute; top: 0; bottom: 0; width: 44px; margin: 0 0 0 -22px; padding: 0; border: none; background: none;
      pointer-events: none; display: flex; align-items: center; justify-content: center; outline: none;
    }
    .hd i {
      display: block; width: 8px; height: 32px; border-radius: 4px; background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.55); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
    }
    .hd.dot i { width: 18px; height: 18px; border-radius: 9px; }
    .hd.on i, .hd:focus-visible i { background: var(--primary-color); border-color: #fff; box-shadow: 0 0 0 2px var(--primary-color); }
    .bubble {
      position: absolute; bottom: calc(100% + 8px); transform: translateX(-50%); padding: 4px 10px; border-radius: 10px;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 14px; font-weight: 600;
      white-space: nowrap; pointer-events: none; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .strip { margin: 4px 0 8px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .strip wp-label-picker { --mdc-icon-size: 18px; }
    .acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; min-width: 48px; padding: 0 14px;
      border-radius: 24px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
      font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .act:hover:not(:disabled) { background: var(--secondary-background-color); }
    .act.on { border: 2px solid var(--primary-color); }
    .act:disabled { opacity: 0.4; cursor: default; }
    .act.go { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .copy { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
    .dchip {
      min-width: 48px; min-height: 48px; padding: 0 10px; border-radius: 24px; border: 1px solid var(--divider-color); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .dchip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .err { color: var(--error-color, #db4437); font-size: 13px; margin: 4px 0; }
    .cf { display: flex; flex-direction: column; gap: 12px; }
    .cfrow { display: flex; flex-direction: column; gap: 6px; }
    .seg2 { display: flex; flex-wrap: wrap; gap: 6px; }
    .cfbar { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px; font-size: 13px; }
    .cfbar span { color: var(--secondary-text-color); }
    .seg2 button {
      flex: 1 1 140px; min-height: 48px; padding: 0 12px; border-radius: 24px; border: 1px solid var(--divider-color); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .seg2 button.on { border: 2px solid var(--primary-color); font-weight: 600; }
  `];
O([
  v({ attribute: !1 })
], E.prototype, "hass", 2);
O([
  v({ attribute: !1 })
], E.prototype, "data", 2);
O([
  v({ attribute: !1 })
], E.prototype, "program", 2);
O([
  v({ attribute: "entity-id" })
], E.prototype, "entityId", 2);
O([
  v({ type: Number })
], E.prototype, "weekday", 2);
O([
  v({ attribute: !1 })
], E.prototype, "spans", 2);
O([
  v({ attribute: !1 })
], E.prototype, "preview", 2);
O([
  v({ type: Number })
], E.prototype, "now", 2);
O([
  v({ type: Boolean })
], E.prototype, "editing", 2);
O([
  v({ type: Boolean })
], E.prototype, "editable", 2);
O([
  v({ type: Boolean })
], E.prototype, "hours", 2);
O([
  v()
], E.prototype, "lang", 2);
O([
  v()
], E.prototype, "tz", 2);
O([
  $()
], E.prototype, "_draft", 2);
O([
  $()
], E.prototype, "_selected", 2);
O([
  $()
], E.prototype, "_hsel", 2);
O([
  $()
], E.prototype, "_bubble", 2);
O([
  $()
], E.prototype, "_copyOpen", 2);
O([
  $()
], E.prototype, "_copyDays", 2);
O([
  $()
], E.prototype, "_conflict", 2);
O([
  $()
], E.prototype, "_error", 2);
O([
  $()
], E.prototype, "_hover", 2);
E = O([
  B("wp-bar-editor")
], E);
var dn = Object.defineProperty, hn = Object.getOwnPropertyDescriptor, Vt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? hn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && dn(e, i, r), r;
};
let kt = class extends I {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.lang = "en", this.rest = "", this.restColor = "var(--divider-color, #888)";
  }
  _open() {
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: !0, composed: !0 }));
  }
  render() {
    const t = this.spans.filter((e) => !e.ignored);
    return c`<button @click=${this._open} aria-label=${h(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <circle cx="160" cy="160" r="112" fill="none" stroke=${this.restColor} stroke-width="36" />
        ${t.map((e) => {
      const i = Math.max(0, Math.min(1440, e.end) - Math.max(0, e.start)) / 1440 * 100;
      if (e.marker) {
        const s = e.start / 1440 * Math.PI * 2 - Math.PI / 2;
        return D`<circle cx=${160 + 112 * Math.cos(s)} cy=${160 + 112 * Math.sin(s)} r="7" fill=${e.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
      }
      return D`<circle cx="160" cy="160" r="112" fill="none" stroke=${e.color} stroke-width="36"
            pathLength="100" stroke-dasharray="${i} ${100 - i}" stroke-dashoffset=${-e.start / 1440 * 100} transform="rotate(-90 160 160)" />`;
    })}
        ${[0, 6, 12, 18].map((e) => {
      const i = e / 24 * Math.PI * 2 - Math.PI / 2;
      return D`<text x=${160 + 145 * Math.cos(i)} y=${165 + 145 * Math.sin(i)} text-anchor="middle">${String(e).padStart(2, "0")}</text>`;
    })}
        ${this.now === null ? _ : (() => {
      const e = this.now / 1440 * Math.PI * 2 - Math.PI / 2;
      return D`<line x1=${160 + 90 * Math.cos(e)} y1=${160 + 90 * Math.sin(e)} x2=${160 + 134 * Math.cos(e)} y2=${160 + 134 * Math.sin(e)} stroke="var(--primary-text-color)" stroke-width="3" />`;
    })()}
        <text x="160" y="156" text-anchor="middle">${this.now === null ? "24 h" : ht(this.lang, this.now)}</text>
        <text x="160" y="180" text-anchor="middle">${h(this.lang, "hours")}</text>
      </svg></button>
      <div class="legend">
        ${this.rest ? c`<span><i style=${`background:${this.restColor}`}></i>${h(this.lang, "rest_of_time")}: ${this.rest}</span>` : _}
        ${t.map((e) => c`<span><i style=${`background:${e.color}`}></i>${ht(this.lang, e.start)}${e.marker ? "" : `–${ht(this.lang, e.end)}`} · ${e.label}</span>`)}
      </div>`;
  }
};
kt.styles = R`
    :host { display: block; }
    button { display: block; max-width: 360px; width: 100%; margin: auto; padding: 0; color: inherit; border: 0; background: none; cursor: pointer; border-radius: 50%; }
    svg { display: block; width: 100%; } text { fill: var(--primary-text-color); font-size: 14px; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; padding: 4px 0 12px; }
    span { display: inline-flex; align-items: center; gap: 6px; } i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  `;
Vt([
  v({ attribute: !1 })
], kt.prototype, "spans", 2);
Vt([
  v({ type: Number })
], kt.prototype, "now", 2);
Vt([
  v()
], kt.prototype, "lang", 2);
Vt([
  v()
], kt.prototype, "rest", 2);
Vt([
  v()
], kt.prototype, "restColor", 2);
kt = Vt([
  B("wp-radial-day")
], kt);
var pn = Object.defineProperty, un = Object.getOwnPropertyDescriptor, nt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? un(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && pn(e, i, r), r;
};
let J = class extends I {
  constructor() {
    super(...arguments), this._open = null, this._name = "", this._color = "", this._action = null, this._entity = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return St(this.hass);
  }
  firstUpdated() {
    const t = this.data.labels.flatMap((e) => e.action.kind === "service" ? [e.action.service.split(".")[0]] : []);
    Ht(this.hass, t).then((e) => e && this.requestUpdate());
  }
  /** Devices that can serve to choose an action: those of the programs using the label, else all of them. */
  _entities(t) {
    const e = this.data.programs.filter((s) => ke(this.data, t.id).includes(s.name)), i = (s) => [...new Set(s.flatMap((r) => r.entities.map((n) => n.entity_id)))];
    return e.length ? i(e) : i(this.data.programs);
  }
  _expand(t) {
    this._open = t.id, this._name = t.name, this._color = t.color, this._action = structuredClone(t.action), this._entity = this._entities(t)[0] ?? "", this._error = "";
  }
  async _save(t) {
    var i;
    const e = this._lang;
    if (!this._name.trim()) {
      this._error = h(e, "lb_err_name");
      return;
    }
    if (((i = this._action) == null ? void 0 : i.kind) === "service" && Cs(this.hass, this._action.service, this._action.data).length) {
      this._error = h(e, "lb_err_fields");
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/save", label: { id: t.id, name: this._name.trim(), color: this._color, action: this._action } }), this._open = null;
    } catch {
      this._error = h(e, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  async _delete(t) {
    const e = this._lang, i = ke(this.data, t.id);
    if (i.length) {
      this._error = h(e, "lb_in_use", { programs: i.join(", ") });
      return;
    }
    if (await pt(this, h(e, "confirm_delete", { name: t.name }), h(e, "delete"), h(e, "cancel")))
      try {
        await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: t.id }), this._open = null;
      } catch (s) {
        const r = s;
        this._error = (r == null ? void 0 : r.code) === "in_use" ? h(e, "lb_in_use", { programs: r.message ?? "" }) : h(e, "lb_err_save");
      }
  }
  render() {
    if (!this.hass || !this.data) return _;
    const t = this._lang;
    return c`<wp-dialog open heading=${h(t, "labels")}>
      ${this.data.labels.length ? _ : c`<p class="muted">${h(t, "lb_none")}</p>`}
      <div class="list">
        ${this.data.labels.map((e) => {
      const i = ke(this.data, e.id).length;
      if (this._open !== e.id)
        return c`<button class="row" @click=${() => this._expand(e)}>
              <i class="dot" style="background:${e.color}"></i>
              <span class="txt"><b>${e.name}</b><span class="sub">${ne(this.hass, t, e.action)} · ${h(t, "lb_uses", { n: String(i) })}</span></span>
              <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
      const s = this._entities(e);
      return c`<div class="editor">
            <div class="field"><label for="lbe-name">${h(t, "lb_name")}</label>
              <input id="lbe-name" type="text" maxlength="30" .value=${this._name}
                @input=${(r) => {
        this._name = r.target.value, this._error = "";
      }} /></div>
            <div class="swatches" role="radiogroup" aria-label=${h(t, "lb_color")}>
              ${Zt.map((r) => c`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
                aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
            </div>
            ${s.length > 1 ? c`<div class="field"><label for="lbe-ent">${h(t, "lb_device")}</label>
              <select id="lbe-ent" @change=${(r) => this._entity = r.target.value}>
                ${s.map((r) => c`<option value=${r} ?selected=${r === this._entity}>${it(this.hass, r)}</option>`)}
              </select></div>` : _}
            <wp-action-picker .hass=${this.hass} entity-id=${this._entity} .action=${this._action}
              @action-change=${(r) => {
        r.stopPropagation(), this._action = r.detail, this._error = "";
      }}></wp-action-picker>
            ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : _}
            <div class="btns">
              <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._save(e)}>${h(t, "save")}</button>
              <button class="btn" @click=${() => this._open = null}>${h(t, "cancel")}</button>
            </div>
            <button class="btn danger-line alone" @click=${() => void this._delete(e)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${h(t, "delete")}</button>
          </div>`;
    })}
      </div>
    </wp-dialog>`;
  }
};
J.styles = [rt, R`
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
nt([
  v({ attribute: !1 })
], J.prototype, "hass", 2);
nt([
  v({ attribute: !1 })
], J.prototype, "data", 2);
nt([
  $()
], J.prototype, "_open", 2);
nt([
  $()
], J.prototype, "_name", 2);
nt([
  $()
], J.prototype, "_color", 2);
nt([
  $()
], J.prototype, "_action", 2);
nt([
  $()
], J.prototype, "_entity", 2);
nt([
  $()
], J.prototype, "_error", 2);
nt([
  $()
], J.prototype, "_saving", 2);
J = nt([
  B("wp-labels")
], J);
const ge = 0.5;
function _n(t, e, i) {
  const s = t.filter((u) => u.end !== null).map((u) => ({ ...u, end: Math.min(u.end, i), start: Math.max(0, u.start) })).filter((u) => u.end > u.start).sort((u, m) => u.start - m.start);
  s.forEach((u, m) => {
    const d = s[m + 1];
    d && u.end > d.start && (u.end = d.start);
  });
  const r = [], n = [], o = (u, m) => {
    e != null && e.active && m - u > ge && r.push({ from: u, to: m, value: e.value, color: e.color });
  };
  let a = 0;
  s.forEach((u, m) => {
    o(a, u.start), r.push({ from: u.start, to: u.end, value: u.value, color: u.color });
    const d = s[m + 1];
    u.end < i - ge && (!d || d.start - u.end > ge) && (e != null && e.active) && n.push(u.end), a = u.end;
  }), o(a, i);
  const l = r.flatMap((u) => u.value === null ? [] : [{ from: u.from, to: u.to, value: u.value, color: u.color }]), p = [];
  for (let u = 1; u < l.length; u++) {
    const m = l[u - 1], d = l[u];
    Math.abs(m.to - d.from) <= ge && Math.abs(m.value - d.value) > 1e-9 && p.push({ m: d.from, from: m.value, to: d.value, color: d.color });
  }
  return { zones: r, steps: l, risers: p, returns: n };
}
const fn = /* @__PURE__ */ new Set(["off", "idle", "unavailable", "unknown", "docked", ""]), Qi = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function mn(t, e, i) {
  if (e === "unavailable" || e === "unknown") return !1;
  switch (t) {
    case "climate": {
      const s = i.hvac_action;
      if (typeof s == "string" && s !== "") return s !== "idle" && s !== "off";
      if (e === "off") return !1;
      const r = Qi(i.temperature), n = Qi(i.current_temperature);
      return r === null || n === null ? !1 : e === "cool" ? n - r > 0.3 : r - n > 0.3;
    }
    case "light":
    case "switch":
    case "fan":
    case "input_boolean":
      return e === "on";
    case "cover":
      return e === "opening" || e === "closing";
    case "vacuum":
      return e === "cleaning" || e === "returning";
    case "media_player":
      return e === "playing";
    default:
      return !fn.has(e);
  }
}
function gn(t, e, i) {
  const s = [...t].sort((n, o) => n.m - o.m), r = [];
  return s.forEach((n, o) => {
    const a = Math.max(0, n.m), l = Math.min(i, o + 1 < s.length ? s[o + 1].m : i);
    if (l - a <= 0 || !mn(e, n.state, n.attrs)) return;
    const p = r[r.length - 1];
    p && Math.abs(p[1] - a) < 0.01 ? p[1] = l : r.push([a, l]);
  }), r;
}
function yn(t, e, i) {
  const s = [];
  for (const [r, n] of t)
    for (const o of e) {
      const a = Math.max(r, o.from), l = Math.min(n, o.to, i);
      l - a > 0.01 && s.push({ from: a, to: l, color: o.color, value: o.value });
    }
  return s.sort((r, n) => r.from - n.from);
}
var bn = Object.defineProperty, vn = Object.getOwnPropertyDescriptor, ot = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? vn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && bn(e, i, r), r;
};
function Zi(t, e) {
  const i = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(t)), s = (n) => {
    var o;
    return Number(((o = i.find((a) => a.type === n)) == null ? void 0 : o.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(t / 1e3) * 1e3;
}
function ts(t, e) {
  const [i, s, r] = t.split("-").map(Number), n = Date.UTC(i, s - 1, r), o = n - Zi(n, e);
  return n - Zi(o, e);
}
function Ls(t, e) {
  const [i, s, r] = t.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + e)).toISOString().slice(0, 10);
}
function ye(t, e) {
  return { startMs: ts(t, e), endMs: ts(Ls(t, 1), e) };
}
function $n(t) {
  const [e, i, s] = t.split("-").map(Number);
  return we(new Date(Date.UTC(e, i - 1, s, 12)), "UTC");
}
const es = 6e4, Fe = /* @__PURE__ */ new Map();
function He(t, e, i) {
  const s = Fe.get(t);
  if (s && Date.now() - s.at < e) return s.p;
  const r = i();
  return Fe.set(t, { at: Date.now(), p: r }), r.catch(() => Fe.delete(t)), r;
}
function xn(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  let i = {};
  for (const s of t) {
    s.a && (i = s.a);
    const r = s.lu ?? s.lc ?? s.last_updated_ts, n = typeof r == "number" ? r * 1e3 : Date.parse(s.last_updated ?? "");
    Number.isNaN(n) || e.push({ t: n, s: String(s.s ?? s.state ?? ""), a: i });
  }
  return e;
}
function wn(t) {
  return Array.isArray(t) ? t.map((e) => {
    const i = Number(e.when);
    return {
      t: i > 1e12 ? i : i * 1e3,
      state: String(e.state ?? ""),
      user: !!e.context_user_id,
      // an automation, a script or a service call of an integration: not a person
      context: !!(e.context_event_type || e.context_domain || e.context_service || e.context_entity_id || e.context_message)
    };
  }).filter((e) => !Number.isNaN(e.t)) : [];
}
function is(t, e) {
  const i = Math.floor((e - 8) / 6);
  return i < 4 ? "" : t.length <= i ? t : `${t.slice(0, i - 1)}…`;
}
const kn = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", be = (t) => t === "unavailable" || t === "unknown" || t === "", ve = (t) => typeof t == "number" && Number.isFinite(t) ? t : null, Sn = /* @__PURE__ */ new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);
let X = class extends I {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._model = null, this._token = 0;
  }
  get _lang() {
    var t, e, i;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  connectedCallback() {
    super.connectedCallback(), this._observer = new ResizeObserver((t) => {
      const e = Math.floor(t[0].contentRect.width);
      e > 120 && e !== this._width && (this._width = e);
    });
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._observer) == null || t.disconnect();
  }
  firstUpdated() {
    var e;
    const t = this.renderRoot.querySelector(".box");
    t && ((e = this._observer) == null || e.observe(t));
  }
  willUpdate(t) {
    (t.has("entityId") || t.has("date")) && this._load(), (t.has("slots") || t.has("data") || t.has("program") || t.has("entityId") || t.has("date") || t.has("_loaded")) && (this._model = this._loaded ? this._build(this._loaded) : null);
  }
  async _load() {
    if (!this.hass || !this.entityId || !this.date) return;
    const t = `${this.entityId}|${this.date}`, e = ++this._token;
    this._loaded = null, this._failed = !1;
    const { startMs: i, endMs: s } = ye(this.date, this._tz), r = Date.now(), n = s > r ? 6e4 : 1 / 0, o = i < r, a = new Date(Math.min(s, r)).toISOString();
    try {
      const l = o ? He(`h|${t}`, n, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), p = o ? He(`l|${t}`, n, () => this.hass.callWS({
        type: "logbook/get_events",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId]
      })).catch(() => []) : Promise.resolve([]), u = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), m = o ? He(`j|${this.entityId}|${u}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: u })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [d, f, b] = await Promise.all([l, p, m]);
      if (e !== this._token) return;
      this._loaded = {
        hist: xn(d[this.entityId]),
        log: wn(f),
        sent: (b.segments ?? []).filter((w) => w.entity_id === this.entityId).map((w) => Date.parse(w.at))
      };
    } catch {
      e === this._token && (this._failed = !0);
    }
  }
  // ---- values ----
  /** What a history point says as numbers: the curves of the device. */
  _live(t) {
    const e = { measured: null, set: null, main: null };
    if (be(t.s)) return e;
    switch (Qt(this.entityId)) {
      case "climate":
        return { measured: ve(t.a.current_temperature), set: t.s === "off" ? null : ve(t.a.temperature), main: null };
      case "cover":
        return { ...e, main: ve(t.a.current_position) ?? (t.s === "open" ? 100 : t.s === "closed" ? 0 : null) };
      case "light": {
        const i = t.s === "on" ? ve(t.a.brightness) : 0;
        return { ...e, main: i === null ? t.s === "on" ? 100 : 0 : i / 255 * 100 };
      }
      default: {
        const i = Number(t.s);
        return { ...e, main: Number.isFinite(i) ? i : null };
      }
    }
  }
  _numeric(t) {
    const e = Qt(this.entityId);
    if (["climate", "cover", "light"].includes(e)) return !0;
    const i = t.filter((s) => !be(s.s));
    return i.length > 0 && i.every((s) => Number.isFinite(Number(s.s)));
  }
  // ---- build ----
  _build(t) {
    var vi, $i;
    const e = this._tz, { startMs: i, endMs: s } = ye(this.date, e), r = Math.round((s - i) / 6e4), n = Date.now(), o = Math.max(0, Math.min(r, (n - i) / 6e4)), a = (y) => (y - i) / 6e4, l = Qt(this.entityId), p = Q(this.program, this.data), u = /* @__PURE__ */ new Map();
    for (const y of this.program.profiles) for (const x of y.days.flat()) u.set(x.id, x);
    const m = $n(this.date), d = [];
    for (const { slot: y, end: x } of xs(p.days[(m + 6) % 7])) d.push({ s: 0, e: x, slot: y, spill: !0 });
    if (this.slots)
      for (const y of this.slots) {
        const x = u.get(y.slot_id);
        x && d.push({
          s: Math.max(0, a(Date.parse(y.start))),
          e: y.end ? Math.min(r, a(Date.parse(y.end))) : null,
          slot: x,
          ignored: !!y.ignored
        });
      }
    else
      for (const y of p.days[m]) {
        const x = wt(y.start);
        if (x === null) continue;
        const P = wt(y.end ?? null);
        d.push({ s: x, e: P === null ? null : P > x ? P : r, slot: y });
      }
    const f = this.program.entities.find((y) => y.entity_id === this.entityId), b = L(this.data, f == null ? void 0 : f.default_label), w = [], A = (y, x, P, q = {}) => {
      if (!x || y < 0 || y > r) return;
      const F = bt(this.program, this.entityId, x);
      F && w.push({ m: y, label: x, value: Ui(F), end: P, ...q });
    };
    for (const y of d)
      y.spill || A(
        y.s,
        L(this.data, y.slot.label),
        !1,
        { sun: Tt(y.slot.start), spec: y.slot.start, ignored: y.ignored }
      );
    const S = (y) => Ui(bt(this.program, this.entityId, y)), g = _n(
      d.filter((y) => !y.ignored).flatMap((y) => {
        const x = L(this.data, y.slot.label);
        return x && bt(this.program, this.entityId, x) ? [{ start: y.s, end: y.e, color: x.color, value: S(x) }] : [];
      }),
      b ? { color: b.color, value: S(b), active: !!bt(this.program, this.entityId, b) } : null,
      r
    );
    for (const y of g.returns) A(y, b, !0);
    const C = yn(
      gn(t.hist.map((y) => ({ m: a(y.t), state: y.s, attrs: y.a })), l, o),
      g.zones,
      o
    );
    w.sort((y, x) => y.m - x.m);
    const W = this._numeric(t.hist), At = [], Y = [];
    if (W) {
      const y = { measured: [], set: [], main: [] };
      for (const x of t.hist) {
        const P = Math.max(0, a(x.t)), q = this._live(x);
        y.measured.push({ m: P, v: q.measured }), y.set.push({ m: P, v: q.set }), y.main.push({ m: P, v: q.main });
      }
      for (const x of ["measured", "set", "main"])
        y[x].some((P) => P.v !== null) && At.push({ key: x, pts: y[x] });
    } else
      t.hist.forEach((y, x) => {
        var wi, ki;
        const P = Math.max(0, a(y.t)), q = x + 1 < t.hist.length ? a(t.hist[x + 1].t) : o;
        if (q <= P || be(y.s)) return;
        const F = Y[Y.length - 1];
        if (F && F.state === y.s && Math.abs(F.e - P) < 0.5) {
          F.e = q;
          return;
        }
        const xi = this.hass.states[this.entityId];
        Y.push({
          s: P,
          e: q,
          state: y.s,
          on: Sn.has(y.s),
          text: xi ? ((ki = (wi = this.hass).formatEntityState) == null ? void 0 : ki.call(wi, { ...xi, state: y.s, attributes: y.a }, y.s)) ?? y.s : y.s
        });
      });
    const he = (y) => t.sent.some((x) => Math.abs(x - y) <= es), lt = [];
    let gi = (vi = t.hist[0]) == null ? void 0 : vi.s;
    for (const y of t.log) {
      if (be(y.state)) continue;
      const x = y.state === gi;
      gi = y.state, (y.user || !y.context && !x && !he(y.t)) && lt.push(a(y.t));
    }
    const Rs = l === "climate" ? "set" : l === "light" ? "main" : null, yi = At.find((y) => y.key === Rs), bi = [];
    if (yi) {
      let y = null;
      for (const x of yi.pts) {
        if (x.v !== null && y !== null && Math.abs(x.v - y) > 0.01) {
          const P = i + x.m * 6e4;
          bi.push(x.m);
          const q = t.log.some((F) => F.context && !F.user && Math.abs(F.t - P) <= es);
          !he(P) && !q && !lt.some((F) => Math.abs(F - x.m) <= 1) && lt.push(x.m);
        }
        x.v !== null && (y = x.v);
      }
    }
    lt.sort((y, x) => y - x);
    const Bs = [
      ...w.map((y) => y.m),
      ...t.sent.map(a),
      ...bi,
      ...Y.map((y) => y.s),
      ...lt
    ], Te = [];
    for (const y of lt) {
      if (y <= 1 || y > o) continue;
      const x = Bs.filter((q) => q > y + 0.5).sort((q, F) => q - F)[0], P = Math.min(x ?? o, o);
      P > y ? Te.push([y, P]) : Te.push([y, Math.min(y + 5, r)]);
    }
    let pe = 0, ue = 100;
    if (W && l !== "cover" && l !== "light") {
      const y = [...At.flatMap((x) => x.pts.map((P) => P.v)), ...w.map((x) => x.value), ...g.steps.map((x) => x.value)].filter((x) => x !== null);
      y.length && (pe = Math.floor(Math.min(...y) - 1), ue = Math.ceil(Math.max(...y) + 1), ue - pe < 2 && (ue = pe + 2));
    }
    const Us = l === "climate" ? "°C" : l === "cover" || l === "light" ? "%" : (($i = this.hass.states[this.entityId]) == null ? void 0 : $i.attributes.unit_of_measurement) ?? "";
    return {
      span: r,
      pastEnd: o,
      isToday: i <= n && n < s,
      kind: W ? "curve" : "band",
      lines: At,
      bands: Y,
      markers: w,
      planned: g,
      shade: C,
      manual: Te,
      lo: pe,
      hi: ue,
      unit: Us
    };
  }
  // ---- interaction ----
  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  get _historyPath() {
    const { startMs: t, endMs: e } = ye(this.date, this._tz);
    return `/history?${new URLSearchParams({
      entity_id: this.entityId,
      start_date: new Date(t).toISOString(),
      end_date: new Date(e).toISOString()
    }).toString()}`;
  }
  _open() {
    this.dispatchEvent(new CustomEvent("open-history", { detail: this._historyPath, bubbles: !0, composed: !0 }));
  }
  // ---- render ----
  _path(t, e, i, s, r, n) {
    let o = "", a = !1;
    return t.forEach((l, p) => {
      const u = p + 1 < t.length ? t[p + 1].m : e.pastEnd;
      let m = l.m, d = u;
      if (n && (m = Math.max(m, n[0]), d = Math.min(d, n[1]), d < m)) {
        a = !1;
        return;
      }
      if (l.v === null) {
        a = !1;
        return;
      }
      const f = s(l.v);
      r ? o += a ? `V${f.toFixed(1)}H${i(d).toFixed(1)}` : `M${i(m).toFixed(1)},${f.toFixed(1)}H${i(d).toFixed(1)}` : (o += `${a ? "L" : "M"}${i(m).toFixed(1)},${f.toFixed(1)}`, (p + 1 === t.length || n && d < u) && (o += `L${i(d).toFixed(1)},${f.toFixed(1)}`)), a = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return _;
    const t = this._lang, e = this._model;
    let i;
    return this._failed ? i = c`<div class="note">${h(t, "no_data")}</div>` : e ? i = this._renderChart(e) : i = c`<div class="note">${h(t, "chart_loading")}</div>`, c`<div class="box">${i}</div>${e ? this._legend(e) : _}`;
  }
  _legend(t) {
    const e = this._lang, i = (r, n, o) => c`<span class="key"><i class=${r} style=${""}></i>${n}</span>`, s = (r) => t.lines.some((n) => n.key === r);
    return c`<div class="legend">
      ${t.markers.length || t.planned.steps.length ? i("planned", h(e, "planned")) : _}
      ${s("measured") ? i("measured", h(e, "measured")) : _}
      ${s("set") ? i("set", h(e, "ch_set")) : _}
      ${t.shade.length ? i("active", h(e, "active_key")) : _}
      ${t.manual.length ? i("manual", h(e, "manual")) : _}
    </div>`;
  }
  _renderChart(t) {
    const e = this._lang, i = this._width, s = t.kind === "curve", r = s ? 150 : 84, n = { l: s ? 38 : 8, r: 10, t: 22, b: 22 }, o = (g) => n.l + g / t.span * (i - n.l - n.r), a = (g) => n.t + (1 - (g - t.lo) / (t.hi - t.lo)) * (r - n.t - n.b), { startMs: l } = ye(this.date, this._tz), p = (g) => new Intl.DateTimeFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" }).format(new Date(l + g * 6e4)), u = [];
    for (let g = 0; g <= t.span; g += 180) u.push(g);
    const m = [];
    if (s) {
      const g = t.hi - t.lo, C = [1, 2, 5, 10, 20, 25, 50].find((W) => g / W <= 4) ?? 100;
      for (let W = Math.ceil(t.lo / C) * C; W <= t.hi + 1e-9; W += C) m.push(W);
    }
    const d = n.t - 12, f = n.t, b = r - n.t - n.b, w = (g) => s && g.value !== null ? a(g.value) : d, A = (g) => {
      const C = w(g), W = g.label.color;
      return D`
        <line class="drop" x1=${o(g.m)} x2=${o(g.m)} y1=${C} y2=${r - n.b}></line>
        ${g.sun ? _ : D`<circle class="mk ${g.end ? "end" : ""} ${g.ignored ? "faded" : ""}" cx=${o(g.m)} cy=${C} r="5" style="--c:${W}"></circle>`}
        ${g.value !== null ? D`<text class="val" x=${Math.min(Math.max(o(g.m), 14), i - 14)} y=${Math.max(C - 8, 9)} text-anchor="middle">${Number(g.value.toFixed(1))}</text>` : _}`;
    }, S = t.isToday ? D`<line class="now" x1=${o(t.pastEnd)} x2=${o(t.pastEnd)} y1=${n.t - 4} y2=${r - n.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${o(t.pastEnd) - 6}, ${n.t - 17}) scale(0.5)"><path d=${kn}></path></g>` : _;
    return c`<div class="cwrap">
      <svg width=${i} height=${r} viewBox="0 0 ${i} ${r}" tabindex="0" role="button"
        aria-label=${h(e, "chart_open", { name: it(this.hass, this.entityId) })}
        @click=${() => this._open()}
        @keydown=${(g) => {
      (g.key === "Enter" || g.key === " ") && (g.preventDefault(), this._open());
    }}>
        ${m.map((g) => D`<line class="grid" x1=${n.l} x2=${i - n.r} y1=${a(g)} y2=${a(g)}></line>
          <text class="ylab" x=${n.l - 4} y=${a(g) + 3} text-anchor="end">${Number(g.toFixed(t.unit === "°C" ? 1 : 0))}</text>`)}
        ${u.map((g) => D`<text class="xlab" x=${o(g)} y=${r - 6} text-anchor=${g === 0 ? "start" : "middle"}>${Number(p(g))}h</text>`)}
        ${s ? _ : D`
          <rect class="track" x=${n.l} y=${f} width=${i - n.l - n.r} height=${b} rx="6"></rect>
          ${t.bands.map((g) => {
      const C = o(g.e) - o(g.s);
      return D`<rect class="band ${g.on ? "on" : ""}" x=${o(g.s)} y=${f} width=${Math.max(1, C)} height=${b}></rect>
              ${is(g.text, C) ? D`<text class="btxt" x=${o(g.s) + C / 2} y=${f + b / 2 + 4} text-anchor="middle">${is(g.text, C)}</text>` : _}`;
    })}
          ${t.manual.map(([g, C]) => D`<rect class="red-band" x=${o(g)} y=${f} width=${Math.max(3, o(C) - o(g))} height=${b}></rect>`)}`}
        ${s ? t.lines.map((g) => D`<path class="line ${g.key}" d=${this._path(g.pts, t, o, a, g.key === "set")}></path>`) : _}
        ${s ? t.manual.map((g) => {
      const C = t.lines.find((Y) => Y.key === "set") ?? t.lines.find((Y) => Y.key === "main") ?? t.lines[0], W = C == null ? void 0 : C.pts.find((Y, he) => {
        var lt;
        return Y.v !== null && (((lt = C.pts[he + 1]) == null ? void 0 : lt.m) ?? 1 / 0) > g[0];
      }), At = (W == null ? void 0 : W.v) ?? null;
      return D`${C ? D`<path class="line red" d=${this._path(C.pts, t, o, a, C.key === "set", g)}></path>` : _}
            ${At !== null ? D`<circle class="reddot" cx=${o(g[0])} cy=${a(At)} r="3.5"></circle>` : _}`;
    }) : _}
        ${t.shade.map((g) => s ? g.value === null ? _ : D`<rect class="shade" x=${o(g.from)} y=${a(g.value)} width=${Math.max(1, o(g.to) - o(g.from))} height=${Math.max(0, r - n.b - a(g.value))} style="--c:${g.color}"></rect>` : D`<rect class="shade" x=${o(g.from)} y=${f} width=${Math.max(1, o(g.to) - o(g.from))} height=${b} style="--c:${g.color}"></rect>`)}
        ${s ? t.planned.steps.map((g) => D`<path class="plan" d="M${o(g.from).toFixed(1)},${a(g.value).toFixed(1)}H${o(g.to).toFixed(1)}" style="--c:${g.color}"></path>`) : _}
        ${s ? t.planned.risers.map((g) => D`<line class="riser" x1=${o(g.m)} x2=${o(g.m)} y1=${a(g.from)} y2=${a(g.to)} style="--c:${g.color}"></line>`) : _}
        ${t.markers.map(A)}
        ${S}
        <rect class="hit" x="0" y="0" width=${i} height=${r}></rect>
      </svg>
      ${t.markers.filter((g) => g.sun).map((g) => c`<wp-tip class="suntip ${g.ignored ? "faded" : ""}"
        style="left:${o(g.m)}px;top:${w(g)}px;--c:${g.label.color}" text=${li(e, g.spec, g.m)}>
        <span class="sunc"><ha-icon icon=${g.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${t.isToday ? c`<wp-tip class="nowtip" style="left:${o(t.pastEnd)}px;top:${n.t - 11}px"
        text=${ws(e, ct(/* @__PURE__ */ new Date(), this._tz))}></wp-tip>` : _}
    </div>`;
  }
};
X.styles = R`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    .cwrap { position: relative; width: fit-content; max-width: 100%; }
    .nowtip { position: absolute; transform: translate(-50%, -50%); }
    .suntip { position: absolute; transform: translate(-50%, -50%); }
    .sunc {
      width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
      --mdc-icon-size: 14px; background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 2px var(--c);
    }
    .faded { opacity: 0.45; }
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
    .shade { fill: var(--c); opacity: 0.25; }
    .key i.active { width: 14px; height: 10px; border-radius: 2px; background: var(--secondary-text-color); opacity: 0.35; }
    .plan { fill: none; stroke: var(--c); stroke-width: 3; stroke-linecap: butt; }
    .riser { stroke: var(--c); stroke-width: 1.2; opacity: 0.8; }
    .drop { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 1 3; opacity: 0.6; }
    .mk { fill: var(--c); stroke: var(--card-background-color); stroke-width: 1.5; }
    .mk.end { fill: var(--card-background-color); stroke: var(--c); stroke-width: 2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
    .nowicon path { fill: var(--primary-text-color); }
    .hit { fill: transparent; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 12px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.set { border-top: 2px dashed var(--primary-text-color); }
    .key i.planned { width: 16px; height: 0; border-top: 3px solid var(--secondary-text-color); border-radius: 2px; }

    .key i.manual { border-top: 3px solid var(--error-color, #db4437); }
  `;
ot([
  v({ attribute: !1 })
], X.prototype, "hass", 2);
ot([
  v({ attribute: !1 })
], X.prototype, "data", 2);
ot([
  v({ attribute: !1 })
], X.prototype, "program", 2);
ot([
  v({ attribute: "entity-id" })
], X.prototype, "entityId", 2);
ot([
  v()
], X.prototype, "date", 2);
ot([
  v({ attribute: !1 })
], X.prototype, "slots", 2);
ot([
  $()
], X.prototype, "_width", 2);
ot([
  $()
], X.prototype, "_loaded", 2);
ot([
  $()
], X.prototype, "_failed", 2);
X = ot([
  B("wp-chart")
], X);
var An = Object.defineProperty, Cn = Object.getOwnPropertyDescriptor, at = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Cn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && An(e, i, r), r;
};
const En = ["sunrise", "sunset"];
let G = class extends I {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return St(this.hass);
  }
  _set(t, e) {
    const i = { ...this.group, slot: { ...this.group.slot, ...t }, days: e ?? this.group.days };
    this.dispatchEvent(new CustomEvent("group-change", { detail: i, bubbles: !0, composed: !0 }));
  }
  /* ---- time ---- */
  _update(t, e) {
    e && "time" in e && (this._last = { ...this._last, [t]: e.time }), this._set({ [t]: e });
  }
  _toggleSun(t, e) {
    const i = this.group.slot[t];
    i && ("sun" in i && i.sun === e ? this._update(t, { time: this._last[t] }) : ("time" in i && (this._last = { ...this._last, [t]: i.time }), this._update(t, { sun: e, offset: "sun" in i ? i.offset ?? 0 : 0 })));
  }
  _fromInput(t, e) {
    if (!/^\d{2}:\d{2}$/.test(e)) return;
    let i = Dt(e);
    t === "end" && i === 0 && (i = k), this._update(t, { time: i >= k ? "24:00" : re(i) });
  }
  _timeBlock(t, e) {
    const i = this.group.slot[t];
    if (!i) return _;
    const s = this._lang, r = H(s), n = this.disabled;
    return c`
      <div class="time" role="group" aria-label=${e}>
        <button class="step" ?disabled=${n} aria-label=${h(s, "minus15")} title=${h(s, "minus15")} @click=${() => this._update(t, Wi(i, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in i ? c`<input type="time" step="60" .value=${i.time === "24:00" ? "00:00" : i.time} ?disabled=${n}
              aria-label=${e} @change=${(o) => this._fromInput(t, o.target.value)} />` : c`<output class="sun">${Qe(s, i)}</output>`}
        <button class="step" ?disabled=${n} aria-label=${h(s, "plus15")} title=${h(s, "plus15")} @click=${() => this._update(t, Wi(i, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${En.map((o) => {
      const a = "sun" in i && i.sun === o;
      return c`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${n}
            @click=${() => this._toggleSun(t, o)}><ha-icon icon=${o === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${r[`sun_${o}_short`] ?? o}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(t) {
    if (!t) return this._update("end", null);
    const e = this.group.slot.start, i = "time" in e ? Dt(e.time) : 12 * 60;
    this._update("end", { time: re(Math.min(k - 5, i + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(t) {
    const e = this.group.days.includes(t) ? this.group.days.filter((i) => i !== t) : [...this.group.days, t];
    this._set({}, e.sort((i, s) => i - s));
  }
  render() {
    if (!this.group || !this.program) return _;
    const t = this._lang, e = H(t), i = this.group.slot, s = this.group.days, r = (o, a) => o.length === a.length && a.every((l) => o.includes(l)), n = (o, a) => c`<button class="chip small ${r(s, a) ? "on" : ""}"
      aria-pressed=${r(s, a)} ?disabled=${this.disabled} @click=${() => this._set({}, a === ae && r(s, a) ? [] : [...a])}>${r(s, a) ? c`<ha-icon icon="mdi:check"></ha-icon>` : _}${o}</button>`;
    return c`
      <section>
        <h4>${h(t, "start")}</h4>
        ${this._timeBlock("start", h(t, "start"))}
      </section>
      <section>
        <h4>${h(t, "end")}</h4>
        <div class="chips">
          <button class="chip ${i.end ? "" : "on"}" aria-pressed=${!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${h(t, "no_end")}</button>
          <button class="chip ${i.end ? "on" : ""}" aria-pressed=${!!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${h(t, "with_end")}</button>
        </div>
        ${i.end ? this._timeBlock("end", h(t, "end")) : _}
      </section>
      <section>
        <h4>${h(t, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && r(s, [this.dayOnly]) ? c`<div class="chips"><span class="only">${e.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${h(t, "apply_other_days")}</button></div>` : c`<div class="days" role="group" aria-label=${h(t, "days_label")}>
          ${e.days_short.map((o, a) => c`<button class="day ${s.includes(a) ? "on" : ""}" aria-pressed=${s.includes(a)}
            aria-label=${e.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${s.includes(a) ? c`<ha-icon icon="mdi:check"></ha-icon>` : _}<span>${o}</span></button>`)}
        </div>
        <div class="chips">
          ${n(h(t, "all_days"), ae)}${n(h(t, "weekdays"), Os)}${n(h(t, "weekend"), Ds)}
        </div>`}
      </section>
      <section>
        <h4>${h(t, "action")}</h4>
        <wp-label-picker embedded .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${i.label || null} ?disabled=${this.disabled}
          @label-change=${(o) => {
      o.stopPropagation(), this._set({ label: o.detail ?? "" });
    }}></wp-label-picker>
      </section>`;
  }
};
G.styles = [rt, R`
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
at([
  v({ attribute: !1 })
], G.prototype, "hass", 2);
at([
  v({ attribute: !1 })
], G.prototype, "data", 2);
at([
  v({ attribute: !1 })
], G.prototype, "program", 2);
at([
  v({ attribute: !1 })
], G.prototype, "group", 2);
at([
  v({ attribute: !1 })
], G.prototype, "entityIds", 2);
at([
  v({ type: Boolean })
], G.prototype, "disabled", 2);
at([
  v({ type: Number })
], G.prototype, "dayOnly", 2);
at([
  $()
], G.prototype, "_more", 2);
at([
  $()
], G.prototype, "_last", 2);
G = at([
  B("wp-slot-form")
], G);
var Pn = Object.defineProperty, Mn = Object.getOwnPropertyDescriptor, T = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Mn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Pn(e, i, r), r;
};
const ss = (t) => t.kind === "device" ? `d:${t.entityId}` : `p:${t.programId}`, Ve = 7;
let M = class extends I {
  constructor() {
    super(...arguments), this.chart = !0, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._labelDraft = null, this._pickerKey = 0, this._fresh = /* @__PURE__ */ new Set(), this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (t) => !0, this._minutes = (t) => Se(this.hass, t);
  }
  get _lang() {
    return St(this.hass);
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /* ---- scope ---- */
  get _programs() {
    const t = this.data.programs;
    return [...this.scope.kind === "device" ? t.filter((i) => i.entities.some((s) => s.entity_id === this.scope.entityId)) : t.filter((i) => i.id === this.scope.programId)].sort((i, s) => i.priority - s.priority || i.name.localeCompare(s.name));
  }
  get _entities() {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const t = this._programs[0];
    return t ? t.entities.map((e) => e.entity_id) : [];
  }
  get _title() {
    var t;
    return this.scope.kind === "device" ? it(this.hass, this.scope.entityId) : ((t = this._programs[0]) == null ? void 0 : t.name) ?? "";
  }
  _rows() {
    const t = [];
    for (const e of this._programs) {
      const i = Q(e, this.data);
      for (const s of fi(i, this._include, this._minutes))
        this._focus !== null && !s.days.includes(this._focus) || t.push({ program: e, group: s, key: `${e.id}|${s.ids[s.days[0]]}` });
    }
    return t;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: t, offset: e } = this.day;
    e >= -14 && e <= Ve && (this._offset = e), this._focus = t, !this._rows().length && this._canEdit && this._add([t]);
  }
  /** Translated service names of the actions of the labels. */
  _loadNames() {
    const t = /* @__PURE__ */ new Set();
    for (const e of this.data.labels) e.action.kind === "service" && t.add(e.action.service.split(".")[0]);
    Ht(this.hass, [...t]).then((e) => e && this.requestUpdate());
  }
  willUpdate(t) {
    (!this._chartEntity || t.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const e = this._programs[0];
    if (this.chart && e && this.hass) {
      const i = `${e.id}|${e.revision}|${this._date}`;
      i !== this._loaded && (this._loaded = i, this._loadPreview(e.id, this._date, i));
    }
  }
  get _today() {
    return yt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Ls(this._today, this._offset);
  }
  async _loadPreview(t, e, i) {
    const s = ++this._token;
    try {
      const r = await this.hass.callWS({ type: "weekly_planner/preview", program_id: t, date: e });
      s === this._token && i === this._loaded && (this._slots = r.slots);
    } catch {
      s === this._token && (this._slots = null);
    }
  }
  _go(t) {
    const e = this._offset + t;
    e < -14 || e > Ve || (this._slots = null, this._offset = e);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(t, e, i, s = {}) {
    this._open = t, this._programId = e.id, this._group = i ? structuredClone(i) : null, this._restLabel = s.restLabel ?? null, this._rest = s.rest ?? null, this._dayOnly = s.dayOnly ?? null, this._openId = s.openId ?? null, this._base = null, this._origin = s.origin ? structuredClone(s.origin) : null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = structuredClone(e), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var r;
      return (r = this.renderRoot.querySelector(".editor")) == null ? void 0 : r.scrollIntoView({ block: "start" });
    }));
  }
  /** Opens a slot row: the whole group, or only the focused day of it. */
  _openRow(t, e, i) {
    const s = qi(i) ?? null;
    if (this._focus !== null && i.days.includes(this._focus)) {
      const { draft: r, rest: n } = Fi(i, this._focus);
      this._expand(t, e, r, { rest: n, dayOnly: this._focus, openId: s, origin: i });
    } else
      this._expand(t, e, i, { openId: s, origin: i });
  }
  _cancel() {
    this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._origin = null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = null, this._restLabel = null, this._error = "";
  }
  _onOverride(t) {
    const e = this._draft;
    e && (this._overrides = [...this._overrides.filter((i) => i.entityId !== t.entityId || i.labelId !== t.labelId), t], this._draft = {
      ...e,
      entities: e.entities.map((i) => {
        if (i.entity_id !== t.entityId) return i;
        const s = { ...i.label_overrides ?? {} };
        return t.action ? s[t.labelId] = t.action : delete s[t.labelId], { ...i, label_overrides: s };
      })
    });
  }
  /** A new slot: all days from the full screen, one day when focused (starting after that day's last slot). */
  _add(t = this._focus === null ? ae : [this._focus]) {
    const e = this._programs[0], i = this._entities[0];
    if (!e || !i) return;
    const s = _i(this.hass, this.data, this._entities)[0], r = t.length === 1 ? t[0] : null, n = r === null ? void 0 : Yr(Q(e, this.data).days[r], this._minutes);
    this._expand("new", e, Vi((s == null ? void 0 : s.id) ?? "", t, n), { dayOnly: r }), this._dropBusy = r === null;
  }
  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  _duplicate() {
    const t = this._programs.find((d) => d.id === this._programId), e = this._group;
    if (!t || !e) return;
    const i = this._problem(t);
    if (i) {
      this._error = i;
      return;
    }
    const { start: s, end: r } = e.slot, n = Se(this.hass, s), o = r ? Math.max(15, Se(this.hass, r) - n) : 60, a = (d) => ({ time: re(Math.min(k, d)) }), l = { openId: this._openId, rest: this._rest, draft: structuredClone(e) }, p = this._dayOnly, u = Vi(e.slot.label, e.days);
    u.slot = {
      ...structuredClone(e.slot),
      id: u.slot.id,
      start: "time" in s ? a(n + o) : { ...s, offset: (s.offset ?? 0) + o },
      end: r ? "time" in r ? a(n + 2 * o) : { ...r, offset: (r.offset ?? 0) + o } : null
    };
    const m = this._origin;
    this._expand("new", t, u, { dayOnly: p }), this._base = l, this._origin = m;
  }
  /* ---- saving ---- */
  /** The newest known version of a program: the pushed data, or what this screen saved last. */
  _live(t) {
    const e = this.data.programs.find((s) => s.id === t), i = this._saved[t];
    return i && (!e || i.revision > e.revision) ? i : e;
  }
  async _saveProgram(t) {
    var e, i;
    this._saving = !0;
    try {
      const s = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(t) });
      return s != null && s.program && (this._saved[t.id] = s.program), "ok";
    } catch (s) {
      const r = s;
      return (r == null ? void 0 : r.code) === "conflict" ? "conflict" : ((r == null ? void 0 : r.code) === "unauthorized" ? this._error = h(this._lang, "err_unauthorized") : (e = r == null ? void 0 : r.message) != null && e.includes("unknown_label") ? this._error = h(this._lang, "err_label") : (i = r == null ? void 0 : r.message) != null && i.includes("overlapping_slots") ? this._error = h(this._lang, "w_err_overlap") : this._error = h(this._lang, "ss_err_save"), "error");
    } finally {
      this._saving = !1;
    }
  }
  /**
   * Builds the change on the CURRENT program and saves it. A revision mismatch is retried once on top of
   * the fresh data, then reported. `build` returns the program to save, or a message / a changed group.
   */
  async _commit(t, e) {
    let i = this._live(t);
    for (let s = 0; s < 2; s++) {
      if (!i) return !1;
      const r = e(i);
      if ("error" in r)
        return this._error = r.error, !1;
      if ("changed" in r) return !1;
      const n = await this._saveProgram(r.program);
      if (n === "ok") return !0;
      if (n === "error") return !1;
      try {
        i = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((a) => a.id === t), i && (this._saved[t] = i);
      } catch {
        break;
      }
    }
    return this._error = h(this._lang, "ss_err_save"), !1;
  }
  /** The entities of the current program with the label values set on this screen. */
  _withOverrides(t, e = t.entities) {
    return e.map((i) => {
      const s = this._overrides.filter((n) => n.entityId === i.entity_id);
      if (!s.length) return i;
      const r = { ...i.label_overrides ?? {} };
      for (const n of s)
        n.action ? r[n.labelId] = n.action : delete r[n.labelId];
      return { ...i, label_overrides: r };
    });
  }
  _problem(t) {
    const e = this._lang, i = this._group;
    return i ? i.days.length ? i.slot.end && JSON.stringify(i.slot.start) === JSON.stringify(i.slot.end) ? h(e, "w_err_same") : !L(this.data, i.slot.label) && !this._fresh.has(i.slot.label) ? h(e, "err_action") : "" : h(e, "err_days") : "";
  }
  /**
   * The group being edited against the current profile: unchanged, merged when only its other days moved,
   * or changed meanwhile (then the editor shows the new version, or closes if it is gone).
   */
  _checkOrigin(t, e) {
    const i = this._origin;
    if (!i || !this._openId) return "ok";
    const s = Vr(t, this._include, this._minutes, this._openId), r = Kr(s, i);
    if (r === "same") return "ok";
    if (r === "days" && s && this._dayOnly !== null && s.days.includes(this._dayOnly))
      return this._rest = Fi(s, this._dayOnly).rest, this._origin = structuredClone(s), "ok";
    const n = h(this._lang, "ss_changed");
    if (s) {
      const o = this._open ?? `${e.id}|${qi(s)}`;
      this._openRow(o, e, s);
    } else
      this._cancel();
    return this._error = s ? n : "", this._note = s ? "" : n, "changed";
  }
  /**
   * The label form of the open row is part of the row: saved first (then its values for a device become part
   * of the row's draft). False: stop, the error is shown.
   */
  async _saveLabelDraft() {
    var e;
    const t = this._labelDraft;
    if (!t) return !0;
    if (t.problem)
      return this._error = t.problem, !1;
    this._saving = !0;
    try {
      const i = await this.hass.callWS({
        type: "weekly_planner/label/save",
        label: { ...t.id ? { id: t.id } : {}, name: t.name, color: t.color, action: t.action }
      });
      for (const s of t.overrides) this._onOverride({ entityId: s.entityId, labelId: i.label.id, action: s.action });
      return t.id || ((e = this._open) != null && e.startsWith("rest:") ? this._restLabel = i.label.id : this._group && (this._group = { ...this._group, slot: { ...this._group.slot, label: i.label.id } })), this._fresh.add(i.label.id), this._labelDraft = null, this._pickerKey += 1, !0;
    } catch (i) {
      return this._error = (i == null ? void 0 : i.code) === "unauthorized" ? h(this._lang, "err_unauthorized") : h(this._lang, "lb_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  async _saveRow() {
    if (!await this._saveLabelDraft()) return;
    const t = this._group, e = this._live(this._programId);
    if (!e || !t) return;
    const i = this._problem(e);
    if (i) {
      this._error = i;
      return;
    }
    const s = this._include;
    let r = [], n = !1;
    await this._commit(e.id, (a) => {
      const l = Q(a, this.data);
      if (this._checkOrigin(l, a) === "changed")
        return n = !0, { changed: !0 };
      let p = l;
      this._base && (p = Xt(p, s, this._minutes, this._base));
      let u = t;
      if (r = [], this._dropBusy) {
        const { free: d, busy: f } = Gr(p, s, this._minutes, t.slot, t.days);
        if (!d.length) return { error: h(this._lang, "w_err_overlap") };
        u = { ...t, days: d }, r = f;
      }
      const m = Xt(p, s, this._minutes, { openId: this._openId, rest: this._rest, draft: u });
      return Xr(m) !== null ? { error: h(this._lang, "w_err_overlap") } : { program: { ...a, entities: this._withOverrides(a), profiles: a.profiles.map((d) => d.id === l.id ? m : d) } };
    }) && !n && (this._cancel(), r.length && (this._note = h(this._lang, "w_dropped", { days: r.map((a) => H(this._lang).days_short[a]).join(" ") })));
  }
  async _deleteRow() {
    const t = this._live(this._programId);
    if (!t || this._open === "new" || !this._openId || !await pt(this, h(this._lang, "w_confirm_slot"), h(this._lang, "yes"), h(this._lang, "no"))) return;
    await this._commit(t.id, (i) => {
      const s = Q(i, this.data);
      if (this._checkOrigin(s, i) === "changed") return { changed: !0 };
      const r = Xt(s, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
      return { program: { ...i, profiles: i.profiles.map((n) => n.id === s.id ? r : n) } };
    }) && this._cancel();
  }
  async _saveRest(t) {
    if (!await this._saveLabelDraft()) return;
    const e = this._live(this._programId) ?? this._programs[0];
    if (!e) return;
    await this._commit(e.id, (s) => ({
      program: {
        ...s,
        entities: this._withOverrides(s, s.entities.map((r) => r.entity_id === t ? { ...r, default_label: this._restLabel } : r))
      }
    })) && this._cancel();
  }
  /* ---- pause / delete ---- */
  get _enabled() {
    return this._programs.some((t) => t.enabled);
  }
  async _setEnabled(t, e) {
    if (!t && !await pt(this, h(this._lang, "confirm_pause", { name: this._title }), h(this._lang, "yes"), h(this._lang, "no"))) {
      e.checked = !0;
      return;
    }
    try {
      for (const i of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: i.id, enabled: t });
    } catch (i) {
      this._error = h(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    }
  }
  async _deleteAll() {
    if (await pt(this, h(this._lang, "confirm_delete_schedule", { name: this._title }), h(this._lang, "yes"), h(this._lang, "no")))
      try {
        for (const t of this._programs) {
          const e = this.scope.kind === "device" ? this.scope.entityId : null;
          if (!e || t.entities.length <= 1) {
            await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: t.id });
            continue;
          }
          const i = structuredClone(t);
          i.entities = i.entities.filter((s) => s.entity_id !== e), await this.hass.callWS({ type: "weekly_planner/program/save", program: i });
        }
        this._closeDialog();
      } catch (t) {
        this._error = h(this._lang, "error", { message: (t == null ? void 0 : t.message) ?? String(t) });
      }
  }
  /** Leave the screen and open the Home Assistant history of the device (navigate: pushState + location-changed). */
  _openHistory(t) {
    this._closeDialog(), window.history.pushState(null, "", t), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
  }
  _closeDialog() {
    var t;
    (t = this.renderRoot.querySelector("wp-dialog")) == null || t.close();
  }
  /* ---- render ---- */
  _when(t) {
    const e = this._lang, i = Qe(e, t.start);
    return t.end ? `${i}–${Qe(e, t.end)}` : i;
  }
  _rowText(t) {
    const e = this._lang, i = L(this.data, t.slot.label), s = Ur(e, H(e).days_short, t.days);
    return {
      text: [(i == null ? void 0 : i.name) ?? "", this._when(t.slot)].filter(Boolean).join(" · "),
      days: s,
      color: (i == null ? void 0 : i.color) ?? "var(--disabled-text-color)"
    };
  }
  _renderRow(t) {
    const { program: e, group: i, key: s } = t;
    if (this._open === s && this._group) return this._renderEditor(e, s);
    const { text: r, days: n, color: o } = this._rowText(i);
    return c`<button class="row" aria-expanded="false" @click=${() => this._openRow(s, e, i)}>
      <span class="dot" style="background:${o}"></span>
      <span class="txt"><span class="l1">${r}</span>${this._focus === null ? c`<span class="l2">${n}</span>` : _}${this._programs.length > 1 ? c`<small>${e.name}</small>` : _}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(t, e) {
    const i = this._lang, s = e === "new", r = this._entities.filter((n) => t.entities.some((o) => o.entity_id === n));
    return c`<div class="editor">
      ${se(this._pickerKey, c`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .group=${this._group} .entityIds=${r}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(n) => {
      n.stopPropagation(), this._labelDraft = n.detail, this._error = "";
    }}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>`)}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : _}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${h(i, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${h(i, "cancel")}</button>
      </div>
      ${s || this._labelDraft ? _ : c`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${h(i, "duplicate")}</button>`}
      ${s || this._labelDraft ? _ : c`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${h(i, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const t = this._lang, e = this._programs[0];
    return e ? this._entities.filter((i) => e.entities.some((s) => s.entity_id === i)).map((i) => {
      const s = e.entities.find((a) => a.entity_id === i), r = `rest:${i}`, n = this._entities.length > 1 ? `${h(t, "rest_of_time")} · ${it(this.hass, i)}` : h(t, "rest_of_time");
      if (this._open === r)
        return c`<div class="editor"><h4>${n}</h4>
          ${se(this._pickerKey, c`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .entityIds=${[i]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(a) => {
          a.stopPropagation(), this._labelDraft = a.detail, this._error = "";
        }}
            @label-change=${(a) => {
          a.stopPropagation(), this._restLabel = a.detail;
        }}></wp-label-picker>`)}
          ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : _}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(i)}>${h(t, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${h(t, "cancel")}</button>
          </div></div>`;
      const o = L(this.data, s.default_label);
      return c`<button class="row rest" aria-expanded="false" @click=${() => this._expand(r, e, null, { restLabel: s.default_label ?? null })}>
        ${o ? c`<span class="dot" style="background:${o.color}"></span>` : c`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${n} · <b>${o ? o.name : h(t, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : _;
  }
  /** Keep the whole week visible, including the unsaved slot being edited. */
  _renderWeek() {
    const t = this._lang;
    return c`<section class="schematic" aria-label=${h(t, "week")}>
      ${this._entities.map((e) => c`
        ${this._entities.length > 1 ? c`<h4>${it(this.hass, e)}</h4>` : _}
        ${H(t).days_short.map((i, s) => {
      const r = [];
      for (const n of [...this._programs].reverse()) {
        const o = this._live(n.id) ?? n;
        if (!o.entities.some((l) => l.entity_id === e)) continue;
        let a = Q(o, this.data);
        o.id === this._programId && this._group && (this._base && (a = Xt(a, this._include, this._minutes, this._base)), a = Xt(a, this._include, this._minutes, {
          openId: this._openId,
          rest: this._rest,
          draft: this._group
        }));
        for (const l of [(s + 6) % 7, s])
          for (const p of a.days[l]) {
            const u = L(this.data, p.label);
            if (!u || !Es(this.hass, e, bt(o, e, u), Pe(o, e))) continue;
            const m = this._minutes(p.start), d = p.end ? this._minutes(p.end) : null, f = d !== null && d < m && d < k / 2;
            l !== s && !f || d !== null && d <= m && !f || r.push({
              start: l === s ? m : 0,
              end: l !== s ? d : f ? k : d ?? m + 10,
              color: u.color,
              label: u.name,
              marker: d === null,
              startSun: l === s ? Tt(p.start) : null,
              endSun: f && l === s ? null : Tt(p.end),
              startSpec: p.start,
              endSpec: p.end
            });
          }
      }
      return c`<div class="schema-day"><span>${i}</span>
            <wp-day-bar lang=${t} notches ?show-hours=${s === 6} .spans=${r}></wp-day-bar>
          </div>`;
    })}
      `)}
    </section>`;
  }
  _renderChart() {
    const t = this._lang, e = this._programs[0];
    if (!this.chart || !e || !this._chartEntity) return _;
    const i = this._date, s = new Intl.DateTimeFormat(t, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${i}T12:00:00Z`));
    return c`<section class="chart">
      ${this._entities.length > 1 ? c`<select aria-label=${h(t, "chart")} @change=${(r) => this._chartEntity = r.target.value}>
        ${this._entities.map((r) => c`<option value=${r} ?selected=${r === this._chartEntity}>${it(this.hass, r)}</option>`)}</select>` : _}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${h(t, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? h(t, "today") : s}</span>
        <button class="ibtn" ?disabled=${this._offset >= Ve} aria-label=${h(t, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${e} entity-id=${this._chartEntity} date=${i}
        .slots=${this._slots} @open-history=${(r) => this._openHistory(r.detail)}></wp-chart>
    </section>`;
  }
  render() {
    if (!this.hass || !this.data || !this.scope) return _;
    const t = this._lang;
    if (!this._programs.length)
      return c`<wp-dialog open heading=${this._title}><p class="muted">${h(t, "no_program")}</p></wp-dialog>`;
    const e = this._rows();
    return c`
      <wp-dialog open heading=${this._title}>
        ${this._canEdit ? _ : c`<p class="err" role="alert">${h(t, "read_only")}</p>`}
        ${this._error && !this._open ? c`<p class="err" role="alert">${this._error}</p>` : _}
        ${this._focus !== null && this._open === null ? c`<div class="focus">
          <button class="chip back" @click=${() => {
      this._focus = null, this._note = "";
    }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${h(t, "w_whole_week")}</button>
          <h3>${H(t).days[this._focus]}</h3></div>` : _}
        ${this._note && this._open === null ? c`<p class="muted note">${this._note}</p>` : _}
        ${this._renderWeek()}
        <div class="list">
          ${e.length ? e.map((i) => this._renderRow(i)) : this._open === "new" ? _ : c`<p class="muted">${h(t, "w_none")}</p>`}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : _}
          ${this._open === null ? c`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? h(t, "w_add") : h(t, "w_add_day", { day: H(t).days[this._focus].toLocaleLowerCase(t) })}</span></button>` : _}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? _ : c`${this._renderChart()}
        <label class="switch">
          <span class="grow">${h(t, "schedule_on")}</span>
          <span class="state">${this._enabled ? h(t, "running") : h(t, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(i) => void this._setEnabled(i.target.checked, i.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${h(t, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
M.styles = [rt, R`
    :host { display: contents; }
    .schematic { margin-bottom: 16px; }
    .schematic h4 { margin: 8px 0; }
    .schema-day { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 8px; align-items: center; min-height: 32px; }
    .schema-day > span { font-size: 12px; color: var(--secondary-text-color); }
    .schema-day wp-day-bar { min-width: 0; }
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
    .note { margin: 0 0 8px; font-size: 14px; }
    .focus { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .focus h3 { margin: 0; font-size: 20px; font-weight: 600; }
    .chip.back {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chart { margin-top: 16px; }
    .chart .nav { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 500; }
    .chart select { margin-bottom: 4px; }
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-top: 12px; font-size: 16px; }
    .switch .state { font-size: 14px; color: var(--secondary-text-color); }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `];
T([
  v({ attribute: !1 })
], M.prototype, "hass", 2);
T([
  v({ attribute: !1 })
], M.prototype, "data", 2);
T([
  v({ attribute: !1 })
], M.prototype, "scope", 2);
T([
  v({ type: Boolean })
], M.prototype, "chart", 2);
T([
  v({ attribute: !1 })
], M.prototype, "day", 2);
T([
  $()
], M.prototype, "_open", 2);
T([
  $()
], M.prototype, "_group", 2);
T([
  $()
], M.prototype, "_dayOnly", 2);
T([
  $()
], M.prototype, "_focus", 2);
T([
  $()
], M.prototype, "_note", 2);
T([
  $()
], M.prototype, "_draft", 2);
T([
  $()
], M.prototype, "_restLabel", 2);
T([
  $()
], M.prototype, "_labelDraft", 2);
T([
  $()
], M.prototype, "_pickerKey", 2);
T([
  $()
], M.prototype, "_programId", 2);
T([
  $()
], M.prototype, "_error", 2);
T([
  $()
], M.prototype, "_saving", 2);
T([
  $()
], M.prototype, "_offset", 2);
T([
  $()
], M.prototype, "_slots", 2);
T([
  $()
], M.prototype, "_chartEntity", 2);
M = T([
  B("wp-schedule")
], M);
const rs = "weekly_planner_reloaded_for";
function On(t = import.meta.url) {
  try {
    return new URL(t).searchParams.get("v");
  } catch {
    return null;
  }
}
function Dn(t, e, i) {
  return !!(t && e && t !== e && i !== e);
}
function ns(t, e) {
  if (!e) return !1;
  let i = null;
  try {
    i = sessionStorage.getItem(rs);
  } catch {
  }
  if (!Dn(On(), t, i)) return !1;
  try {
    sessionStorage.setItem(rs, t);
  } catch {
  }
  return location.reload(), !0;
}
var In = Object.defineProperty, zn = Object.getOwnPropertyDescriptor, et = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? zn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && In(e, i, r), r;
};
let K = class extends I {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._visible = () => {
      document.hidden || this._pollVersion();
    };
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: {} };
  }
  setConfig(t) {
    this._config = { show_chart: !0, ...t }, this._data && this._loadPreviews();
  }
  getCardSize() {
    var t;
    return 2 + (((t = this._data) == null ? void 0 : t.programs.length) ?? 1) * 2;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this._clock = window.setInterval(() => {
      this._now = /* @__PURE__ */ new Date(), this._checkVersion(), ++this._ticks % 5 === 0 && this._pollVersion();
    }, 6e4), document.addEventListener("visibilitychange", this._visible);
  }
  /** Page at rest: nothing open and no edit in progress. */
  get _idle() {
    return !this._dialog && this._edit === null && !this._snack;
  }
  /** The integration serves a newer card: reload by itself once the page is idle (never in a loop). */
  _checkVersion() {
    var t;
    ns((t = this._data) == null ? void 0 : t.card_version, this._idle);
  }
  /** Asks the server for the served version (a reload of the integration does not push new data to old subscriptions). */
  async _pollVersion() {
    try {
      const t = await this.hass.callWS({ type: "weekly_planner/get" });
      ns(t.card_version, this._idle);
    } catch {
    }
  }
  _showSnack(t) {
    this._snack = { undo: t }, window.clearTimeout(this._snackTimer), this._snackTimer = window.setTimeout(() => this._snack = null, 6e3);
  }
  async _undo() {
    const t = this._snack;
    window.clearTimeout(this._snackTimer), this._snack = null, await (t == null ? void 0 : t.undo());
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), window.clearTimeout(this._snackTimer), document.removeEventListener("visibilitychange", this._visible), (t = this._unsub) == null || t.call(this), this._unsub = void 0, window.clearInterval(this._clock);
  }
  updated(t) {
    var e;
    this._idle && ((e = this._data) != null && e.card_version) && this._checkVersion(), t.has("hass") && this.hass && !this._unsub && (this._unsub = ks(this.hass, (i) => {
      this._data = i, this._error = void 0, this._loadNames(i), this._loadPreviews();
    }));
  }
  get _lang() {
    var t, e, i;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /** The moment `offset` days from now (only its local date and weekday are used). */
  _dateAt(t) {
    return new Date(this._now.getTime() + t * 864e5);
  }
  /** Translated names of the services used by the labels. */
  async _loadNames(t) {
    const e = t.labels.flatMap((i) => i.action.kind === "service" ? [i.action.service.split(".")[0]] : []);
    await Ht(this.hass, e) && this.requestUpdate();
  }
  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const t = [0, 1, 2, 3, 4, 5, 6].map((r) => yt(this._dateAt(r), this._tz)), e = Xe(this._data, this._config), i = `${t[0]}|${e.map((r) => `${r.id}:${r.revision}`).join(",")}`;
    if (i === this._previewKey) return;
    this._previewKey = i;
    const s = {};
    await Promise.all(t.flatMap((r) => e.map((n) => this.hass.callWS({ type: "weekly_planner/preview", program_id: n.id, date: r }).then((o) => {
      (s[r] ?? (s[r] = {}))[n.id] = o.slots;
    }).catch(() => {
    })))), i === this._previewKey && (this._preview = s);
  }
  /* ---- blocks ---- */
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  _spans(t, e, i = 0) {
    const s = this._data, r = this._dateAt(i), n = we(r, this._tz), o = this._preview[yt(r, this._tz)] ?? {}, a = [];
    for (const l of [...e].reverse()) {
      if (!l.enabled) continue;
      const p = Q(l, s), u = (f) => bt(l, t, L(s, f.label)), m = (f, b, w, A = {}) => {
        const S = L(s, f.label);
        return {
          start: b,
          end: w,
          color: S.color,
          label: S.name,
          slotId: f.id,
          startSun: Tt(f.start),
          endSun: f.end ? Tt(f.end) : null,
          startSpec: f.start,
          endSpec: f.end ?? null,
          marker: !f.end,
          ...A
        };
      };
      for (const { slot: f, end: b } of xs(p.days[(n + 6) % 7]))
        u(f) && a.push(m(f, 0, b, { spill: !0, startSun: null }));
      const d = o[l.id];
      for (const f of p.days[n]) {
        if (!u(f)) continue;
        const b = d == null ? void 0 : d.find((S) => S.slot_id === f.id);
        let w = wt(f.start), A = wt(f.end ?? null);
        b && (w = ct(b.start, this._tz), A = b.end ? ct(b.end, this._tz) : null), w !== null && a.push(m(
          f,
          w,
          A === null ? w + 10 : A > w ? A : k,
          { sun: "sun" in f.start || !!(f.end && "sun" in f.end), ignored: (b == null ? void 0 : b.ignored) ?? null }
        ));
      }
    }
    return a;
  }
  _next(t, e) {
    var s, r;
    const i = this._data;
    for (const n of e) {
      if (!n.enabled) continue;
      const o = (r = (s = i.status[n.id]) == null ? void 0 : s.next_actions) == null ? void 0 : r[t];
      if (o) return o;
    }
  }
  /* ---- actions ---- */
  _open(t, e) {
    this._dialog = { kind: "schedule", scope: t, day: e };
  }
  async _toggleProgram(t) {
    const e = !t.enabled;
    if (!(!e && !await pt(this, h(this._lang, "confirm_pause", { name: t.name }), h(this._lang, "yes"), h(this._lang, "no"))))
      try {
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: t.id, enabled: e });
      } catch (i) {
        this._error = String(i.message ?? i);
      }
  }
  _programToggle(t) {
    var e;
    return c`<button class="hours" role="switch" aria-checked=${t.enabled}
      aria-label=${`${t.name}: ${h(this._lang, t.enabled ? "running" : "stopped")}`}
      ?disabled=${(e = this._data) == null ? void 0 : e.read_only}
      @click=${() => void this._toggleProgram(t)}>
      <ha-icon icon=${t.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
  }
  /* ---- render ---- */
  /** A bar that can be edited in place: today's (`kind` "today") or one of the week's. */
  _bar(t, e, i, s, r) {
    var u, m, d;
    const n = this._dateAt(i), o = we(n, this._tz), a = yt(n, this._tz), l = `${e.id}|${t}|${s}|${o}`, p = [e];
    return c`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${e} entity-id=${t}
      weekday=${o} .spans=${this._spans(t, p, i)} .preview=${(u = this._preview[a]) == null ? void 0 : u[e.id]}
      .now=${i === 0 ? ct(this._now, this._tz) : null} ?hours=${s === "today"}
      ?editing=${this._edit === l} ?editable=${!!((m = this._data) != null && m.can_edit) && !((d = this._data) != null && d.read_only)}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => this._edit = l} @edit-exit=${() => {
      this._edit === l && (this._edit = null);
    }}
      @open-day=${r} @edited=${(f) => this._showSnack(f.detail.undo)}></wp-bar-editor>`;
  }
  _line(t, e, i) {
    var m, d, f, b, w, A;
    const s = this._lang, r = this._data, n = this._next(t, e), o = L(r, n == null ? void 0 : n.label), a = e.length > 0 && e.every((S) => !S.enabled), l = this.hass.states[t], p = i.icon ?? (l == null ? void 0 : l.attributes.icon) ?? "mdi:calendar-clock", u = () => this._open(i.open);
    return c`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${p}></ha-icon>
          <div class="info">
            ${i.name ? c`<span class="name">${i.name}</span>` : _}
            <span class="now">
              <span class="nw">${l ? ((d = (m = this.hass).formatEntityState) == null ? void 0 : d.call(m, l)) ?? l.state : "—"}</span>
              ${n ? c`<span class="next">→ ${(o == null ? void 0 : o.name) ?? ne(this.hass, s, n.action)}
                <span class="when nw">${Me(Ri(n.at, this._tz, s, this._now))}</span></span>` : _}
            </span>
          </div>
          ${e.length === 1 && i.button ? this._programToggle(e[0]) : _}
          ${a ? c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${h(s, "paused")}></ha-icon>` : _}
          ${i.button ? c`<button class="hours" aria-label=${h(s, "hours")} title=${h(s, "hours")} @click=${u}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : _}
        </div>
        ${this._config.schedule_view === "radial" && this._config.program ? c`<wp-radial-day
          .spans=${this._spans(t, e)} .now=${ct(this._now, this._tz)} lang=${s}
          .rest=${((b = L(r, (f = e[0].entities.find((S) => S.entity_id === t)) == null ? void 0 : f.default_label)) == null ? void 0 : b.name) ?? h(s, "rest_none")}
          .restColor=${((A = L(r, (w = e[0].entities.find((S) => S.entity_id === t)) == null ? void 0 : w.default_label)) == null ? void 0 : A.color) ?? "var(--divider-color)"}
          @open-day=${u}></wp-radial-day>` : c`<div class="today">
          <span class="wname">${h(s, "today_short")}</span>
          ${this._bar(t, e[0], 0, "today", u)}
        </div>`}
        ${this._weekRows(`${ss(i.open)}|${t}`, t, e, i.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(t, e, i, s) {
    const r = this._lang, n = this._week.has(t), o = () => {
      const l = new Set(this._week);
      n ? l.delete(t) : l.add(t), this._week = l;
    }, a = H(r).days_short;
    return c`
      <button class="weekbtn" aria-expanded=${n} @click=${o}>
        <ha-icon icon=${n ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${h(r, "week")}</button>
      ${n ? c`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((l) => {
      const p = (l - we(this._now, this._tz) + 7) % 7, u = () => this._open(s, { weekday: l, offset: p });
      return c`<div class="wday">
            <button class="wnamebtn" aria-label=${a[l]} @click=${u}>
              <span class="wname ${p === 0 ? "today" : ""}">${a[l]}</span></button>
            ${this._bar(e, i[0], p, "week", u)}</div>`;
    })}
      </div>` : _}`;
  }
  _bySchedule(t) {
    const e = this._lang;
    return t.map((i) => {
      const s = { kind: "program", programId: i.id };
      return i.entities.length === 1 ? this._line(i.entities[0].entity_id, [i], { name: i.name, icon: i.icon ?? void 0, button: s, open: s }) : c`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${i.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${i.name}</h2>
          ${this._programToggle(i)}
          ${i.enabled ? _ : c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${h(e, "paused")}></ha-icon>`}
          <button class="hours" aria-label=${h(e, "hours")} title=${h(e, "hours")} @click=${() => this._open(s)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
        </div>
        ${i.entities.map((r) => this._line(r.entity_id, [i], { name: it(this.hass, r.entity_id), button: null, open: s }))}
      </section>`;
    });
  }
  _compactList(t) {
    return t.map((e) => {
      var r;
      const i = { kind: "program", programId: e.id }, s = e.entities.map((n) => ({ entity: n.entity_id, next: this._next(n.entity_id, [e]) })).filter((n) => n.next).sort((n, o) => Date.parse(n.next.at) - Date.parse(o.next.at));
      return c`<div class="compact-row">
        <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" @click=${() => this._open(i)}><strong>${e.name}</strong>
          ${s.length ? c`<span>${((r = L(this._data, s[0].next.label)) == null ? void 0 : r.name) ?? ne(this.hass, this._lang, s[0].next.action)} · ${Me(Ri(s[0].next.at, this._tz, this._lang, this._now))}</span>` : c`<span>${h(this._lang, e.enabled ? "hours" : "stopped")}</span>`}
        </button>${this._programToggle(e)}</div>`;
    });
  }
  render() {
    var o;
    if (!this._config || !this.hass) return _;
    const t = this._lang, e = this._data, i = e ? Xe(e, this._config) : [], r = !!e && !!((o = this.hass.user) != null && o.is_admin) && !!(e != null && e.can_edit) && this._config.program === void 0, n = this._config.title !== void 0 && this._config.title !== "";
    return c`
      <ha-card>
        ${n || r || e != null && e.vacation ? c`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${e != null && e.vacation ? c`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${h(t, "vacation")}</span>` : _}
              ${r ? c`<button class="gear" aria-label=${h(t, "labels")} @click=${() => this._dialog = { kind: "labels" }}>
                <ha-icon icon="mdi:label-multiple-outline"></ha-icon></button>` : _}
            </div>` : _}
        ${this._error ? c`<div class="error">${h(t, "error", { message: this._error })}</div>` : _}
        ${e != null && e.read_only ? c`<div class="error">${h(t, "read_only")}</div>` : _}
        ${e ? _ : c`<div class="empty">…</div>`}
        ${e && !i.length ? c`<div class="empty">${h(t, "no_program")}</div>` : _}
        ${e ? this._config.schedule_view === "list" ? this._compactList(i) : this._bySchedule(i) : _}
      </ha-card>
      ${this._snack ? c`<div class="snack" role="status"><span>${h(t, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${h(t, "undo")}</button></div>` : _}
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    const t = this._dialog;
    if (!t || !this._data) return _;
    const e = () => this._dialog = null;
    switch (t.kind) {
      case "schedule":
        return se(ss(t.scope), c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${t.scope} .day=${t.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${e}></wp-schedule>`);
      case "labels":
        return c`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${e}></wp-labels>`;
    }
  }
};
K.styles = R`
    .compact-row { display: flex; align-items: center; gap: 10px; min-height: 72px; border-top: 1px solid var(--divider-color); }
    .compact-row:first-of-type { border-top: 0; }
    .summary { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 4px; text-align: left; background: none; border: 0; color: inherit; font: inherit; cursor: pointer; }
    .summary span { font-size: 14px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    button:disabled { opacity: .5; cursor: default; }
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
    wp-bar-editor { margin-top: 2px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday { display: flex; align-items: flex-start; gap: 8px; min-height: 48px; width: 100%; }
    .wnamebtn {
      flex: none; width: 36px; height: 48px; padding: 0; border: none; border-radius: 8px; background: none; color: inherit;
      font: inherit; cursor: pointer; text-align: left; display: flex; align-items: center;
    }
    .wnamebtn:hover .wname { text-decoration: underline; }
    .wday wp-bar-editor { margin: 10px 0; }
    .wname { flex: none; width: 36px; font-size: 14px; color: var(--secondary-text-color); }
    .wday wp-bar-editor, .today wp-bar-editor { flex: 1; min-width: 0; }
    .wname.today { color: var(--primary-text-color); font-weight: 600; }
    .today { display: flex; align-items: flex-start; gap: 8px; padding-top: 12px; }
    .today .wname { line-height: 28px; margin-top: 2px; }
    .prog { padding: 8px 0 4px; border-top: 1px solid var(--divider-color); }
    .prog:first-of-type, .head + .prog { border-top: none; }
    .prog .block { border-top: none; padding: 2px 0 4px; }
    .phead { display: flex; align-items: center; gap: 10px; min-height: 48px; --mdc-icon-size: 24px; }
    .phead h2 { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; overflow-wrap: anywhere; }
    .snack {
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 8; display: flex; align-items: center; gap: 12px;
      min-height: 48px; padding: 0 8px 0 16px; border-radius: 24px; font-size: 15px; white-space: nowrap;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .snack button {
      min-height: 48px; padding: 0 12px; border: none; background: none; font: inherit; font-weight: 600; cursor: pointer;
      color: inherit; text-decoration: underline; border-radius: 24px;
    }
    .empty { color: var(--primary-text-color); opacity: 0.8; padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 14px; margin: 8px 0; }
  `;
et([
  v({ attribute: !1 })
], K.prototype, "hass", 2);
et([
  $()
], K.prototype, "_config", 2);
et([
  $()
], K.prototype, "_data", 2);
et([
  $()
], K.prototype, "_error", 2);
et([
  $()
], K.prototype, "_dialog", 2);
et([
  $()
], K.prototype, "_preview", 2);
et([
  $()
], K.prototype, "_now", 2);
et([
  $()
], K.prototype, "_week", 2);
et([
  $()
], K.prototype, "_edit", 2);
et([
  $()
], K.prototype, "_snack", 2);
K = et([
  B("weekly-planner-card")
], K);
const os = /* @__PURE__ */ new WeakMap();
async function Tn(t, e) {
  var a, l;
  const i = t.states[e], s = i == null ? void 0 : i.attributes.icon;
  if (typeof s == "string" && s.startsWith("mdi:")) return s;
  const r = e.split(".")[0];
  let n = os.get(t.connection);
  n || os.set(t.connection, n = /* @__PURE__ */ new Map());
  let o = n.get(r);
  o || (o = t.callWS({ type: "frontend/get_icons", category: "entity_component", integration: r }).then((p) => {
    var u;
    return ((u = p.resources) == null ? void 0 : u[r]) ?? {};
  }), n.set(r, o));
  try {
    const p = await o, u = ((a = p[String(i == null ? void 0 : i.attributes.device_class)]) == null ? void 0 : a.default) ?? ((l = p._) == null ? void 0 : l.default);
    return u != null && u.startsWith("mdi:") ? u : "mdi:calendar-clock";
  } catch {
    return n.delete(r), "mdi:calendar-clock";
  }
}
const Ke = (t, e) => JSON.stringify(t) === JSON.stringify(e), $e = (t) => t !== null && typeof t == "object" && !Array.isArray(t);
function si(t, e, i) {
  if (Ke(t, e)) return i;
  if (Ke(t, i) || Ke(e, i)) return e;
  if ($e(t) && $e(e) && $e(i)) {
    const s = {};
    for (const r of /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e), ...Object.keys(i)])) {
      const n = si(t[r], e[r], i[r]);
      n !== void 0 && (s[r] = n);
    }
    return s;
  }
  if (Array.isArray(t) && Array.isArray(e) && Array.isArray(i)) {
    const s = [...t, ...e, ...i], r = ["id", "entity_id"].find((n) => s.length && s.every((o) => $e(o) && typeof o[n] == "string"));
    if (r) {
      const n = (p) => new Map(p.map((u) => [u[r], u])), o = n(t), a = n(e), l = n(i);
      return [.../* @__PURE__ */ new Set([...a.keys(), ...l.keys(), ...o.keys()])].map((p) => si(o.get(p), a.get(p), l.get(p))).filter((p) => p !== void 0);
    }
  }
  throw new Error("settings_conflict");
}
function Nn(t, e, i) {
  return { ...si(t, { ...e, revision: t.revision }, i), revision: i.revision };
}
function Je(t, e) {
  var r, n;
  const i = (n = (r = t.states[e]) == null ? void 0 : r.attributes) == null ? void 0 : n.friendly_name;
  if (typeof i == "string" && i) return i;
  const s = e.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : e;
}
const as = /* @__PURE__ */ new WeakSet();
function jn(t) {
  if (!t || as.has(t)) return;
  as.add(t);
  const e = () => {
    t.classList.toggle("more-left", t.scrollLeft > 2), t.classList.toggle("more-right", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  };
  t.addEventListener("scroll", e, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(e).observe(t), e();
}
const Ln = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var Rn = Object.defineProperty, Bn = Object.getOwnPropertyDescriptor, U = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Bn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Rn(e, i, r), r;
};
const ls = () => [[], [], [], [], [], [], []];
function cs(t) {
  return t.map((e) => ({ ...structuredClone(e), id: Z() }));
}
let j = class extends I {
  constructor() {
    super(...arguments), this.embedded = !1, this._iconCustomized = !1, this._applied = !1, this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._pickerKey = 0, this._servicesOpen = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._picker || Ss().then((t) => this._picker = t);
  }
  get _lang() {
    return St(this.hass);
  }
  _tr(t, e) {
    return h(this._lang, t, e);
  }
  _long(t) {
    return H(this._lang).days[t];
  }
  _short(t) {
    return H(this._lang).days_short[t];
  }
  /* ---- initial state ---- */
  willUpdate() {
    var t, e;
    if (!this._ready && !(!this.hass || !this.data)) {
      if (this._ready = !0, this._origin = this.program ? structuredClone(this.program) : void 0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const i = Z();
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
          active_profile: i,
          profiles: [{ id: i, name: this._tr("profile_default"), days: ls() }]
        }, this._isNew = !0;
      }
      this._iconCustomized = !!((t = this.program) != null && t.icon && this.program.icon !== this._deviceIcon((e = this.program.entities[0]) == null ? void 0 : e.entity_id)), this._profileId = this._activeId(), this._tab = "general";
    }
  }
  _activeId() {
    var i, s;
    const t = this._p, e = !this._isNew && ((i = this.data.status[t.id]) == null ? void 0 : i.active_profile) || t.active_profile;
    return ((s = t.profiles.find((r) => r.id === e)) == null ? void 0 : s.id) ?? t.profiles[0].id;
  }
  get _profile() {
    return this._p.profiles.find((t) => t.id === this._profileId) ?? this._p.profiles[0];
  }
  _deviceIcon(t) {
    var i;
    const e = t ? (i = this.hass.states[t]) == null ? void 0 : i.attributes.icon : void 0;
    return typeof e == "string" && e.startsWith("mdi:") ? e : "mdi:calendar-clock";
  }
  _setIcon(t) {
    var e;
    this._iconCustomized = !!t, this._patch({ icon: t || this._deviceIcon((e = this._p.entities[0]) == null ? void 0 : e.entity_id) });
  }
  _patch(t) {
    var e;
    if (t.entities && !this._iconCustomized && (t = { ...t, icon: this._deviceIcon((e = t.entities[0]) == null ? void 0 : e.entity_id) }), this._p = { ...this._p, ...t }, this._error = "", this._applied = !1, t.entities && !this._iconCustomized && t.entities[0]) {
      const i = t.entities[0].entity_id;
      Tn(this.hass, i).then((s) => {
        var r;
        !this.isConnected || this._iconCustomized || ((r = this._p.entities[0]) == null ? void 0 : r.entity_id) !== i || this._patch({ icon: s });
      });
    }
  }
  _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  /* ---- profile / days ---- */
  _setProfile(t) {
    this._patch({ profiles: this._p.profiles.map((e) => e.id === t.id ? t : e) });
  }
  _submitProfileForm() {
    const t = this._profileForm;
    if (!t) return;
    const e = t.name.trim(), i = this._p.profiles.some((s) => s.name === e && !(t.mode === "rename" && s.id === this._profileId));
    if (!e || i || e.length > 40) {
      this._error = this._tr("err_profile_name");
      return;
    }
    if (t.mode === "rename")
      this._setProfile({ ...this._profile, name: e });
    else {
      const s = this._profile, r = {
        id: Z(),
        name: e,
        days: t.mode === "copy" ? s.days.map(cs) : ls()
      };
      this._patch({ profiles: [...this._p.profiles, r] }), this._profileId = r.id;
    }
    this._profileForm = void 0, this._error = "";
  }
  _deleteProfile() {
    const t = this._profile, e = this._p.profiles.filter((i) => i.id !== t.id);
    this._patch({ profiles: e }), this._profileId = this._activeId(), e.some((i) => i.id === this._profileId) || (this._profileId = e[0].id);
  }
  /* ---- entities ---- */
  _setEntity(t, e) {
    this._patch({ entities: this._p.entities.map((i, s) => s === t ? { ...i, ...e } : i) });
  }
  _addEntity(t) {
    !t || this._p.entities.some((e) => e.entity_id === t) || (this._pickerKey += 1, this._patch({ entities: [...this._p.entities, { entity_id: t, default_label: null, label_overrides: {}, allowed_services: [] }] }));
  }
  /* ---- save / delete ---- */
  _validate() {
    const t = this._p;
    if (!t.name.trim()) return this._tr("err_name");
    if (!t.entities.length) return this._tr("err_no_entity");
    if (t.conditions.some((i) => !i.entity_id)) return this._tr("err_incomplete");
    const e = t.profiles.map((i) => i.name.trim());
    return new Set(e).size !== e.length ? this._tr("err_profile_name") : "";
  }
  _payload() {
    const t = structuredClone(this._p), e = new Set(t.entities.map((i) => i.entity_id));
    return t.name = t.name.trim(), t.entities = t.entities.filter((i) => e.has(i.entity_id)), this._isNew && delete t.id, t;
  }
  _errorText(t) {
    const e = t, i = (e == null ? void 0 : e.message) ?? String(t);
    return (e == null ? void 0 : e.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (e == null ? void 0 : e.code) === "unauthorized" ? this._tr("err_unauthorized") : i.includes("overlapping_slots") ? this._tr("err_overlap_server") : i.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: i });
  }
  async _save() {
    const t = this._validate();
    if (t) {
      this._error = t;
      return;
    }
    if (!(!this._canEdit() || this._saving)) {
      this._saving = !0;
      try {
        const e = this._payload();
        let i;
        for (let s = 0; s < 2; s++) {
          const n = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((a) => a.id === e.id);
          if (this._origin && !n) throw { code: "conflict" };
          let o = e;
          if (this._origin && n)
            try {
              o = Nn(this._origin, e, n);
            } catch {
              throw { code: "conflict" };
            }
          try {
            i = (await this.hass.callWS({ type: "weekly_planner/program/save", program: o })).program;
            break;
          } catch (a) {
            if (s || a.code !== "conflict") throw a;
          }
        }
        i && (this._p = structuredClone(i), this._origin = structuredClone(i), this._isNew = !1, this._applied = !0, this.dispatchEvent(new CustomEvent("program-saved", { detail: i, bubbles: !0, composed: !0 }))), this.embedded || this._close();
      } catch (e) {
        this._error = this._errorText(e);
      } finally {
        this._saving = !1;
      }
    }
  }
  async _askDelete() {
    await pt(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(t) {
    await pt(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(t) {
    var s;
    const e = (s = this._p.entities[t]) == null ? void 0 : s.entity_id;
    if (!e) return;
    const i = this._tr("confirm_delete", { name: Je(this.hass, e) });
    await pt(this, i, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((r, n) => n !== t) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this.dispatchEvent(new CustomEvent("program-deleted", { detail: this._p.id, bubbles: !0, composed: !0 })), this._close();
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  _duplicate() {
    const t = Z(), e = this._p, i = /* @__PURE__ */ new Map(), s = e.profiles.map((r) => {
      const n = r.id === this._activeId() ? t : Z();
      return i.set(r.id, n), { ...structuredClone(r), id: n, days: r.days.map(cs) };
    });
    this._p = {
      ...structuredClone(e),
      id: "",
      revision: 0,
      created_at: void 0,
      name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles: s,
      active_profile: i.get(this._activeId()) ?? s[0].id
    }, delete this._p.created_at, this._isNew = !0, this._origin = void 0, this._applied = !1, this._profileId = this._p.active_profile ?? s[0].id, this._error = "";
  }
  _close() {
    var t;
    (t = this.renderRoot.querySelector("#main")) == null || t.close();
  }
  /* ---- render: tabs ---- */
  _renderGeneral() {
    const t = this._p;
    return c`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${t.name}
          @input=${(e) => this._patch({ name: e.target.value })} /></div>
      <h3>${this._tr("tab_entities")}</h3>
      ${this._renderEntities(!0)}
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? c`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${t.icon ?? ""}
                @value-changed=${(e) => this._setIcon(e.detail.value || null)}></ha-selector>` : c`<div class="row" style="flex-wrap:nowrap">
                ${t.icon && customElements.get("ha-icon") ? c`<ha-icon .icon=${t.icon}></ha-icon>` : _}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${t.icon ?? ""}
                  @input=${(e) => this._setIcon(e.target.value.trim() || null)} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(t.priority)}
            @change=${(e) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_icon_hint")}</p>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${t.reapply}
        @change=${(e) => this._patch({ reapply: e.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${t.conditions}
        @wp-change=${(e) => {
      e.stopPropagation(), this._patch({ conditions: e.detail });
    }}></wp-conditions-editor>
    `;
  }
  updated() {
    jn(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities(t = !1) {
    const e = this._p;
    return c`
      ${e.entities.length === 0 ? c`<p class="muted">${this._tr("pe_no_entity")}</p>` : _}
      ${e.entities.map((i, s) => this._renderEntity(i, s, t))}
      ${se(this._pickerKey, this._picker ? c`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: e.entities.map((i) => i.entity_id) } }}
            .label=${this._tr("pe_add_entity")} .value=${""}
            @value-changed=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail.value ?? "");
    }}></ha-selector>` : c`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .exclude=${e.entities.map((i) => i.entity_id)}
        @wp-change=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  /** Checklist of the services offered for a device (all checked or none: all are offered). */
  _renderServices(t, e) {
    const i = Ie(this.hass, t.entity_id);
    if (!i.length) return _;
    const s = t.allowed_services ?? [], r = (l) => !s.length || s.includes(l), n = i.filter((l) => r(l.id)).length, o = this._servicesOpen === t.entity_id, a = (l, p) => {
      const u = i.map((m) => m.id).filter((m) => m === l ? p : r(m));
      u.length && this._setEntity(e, { allowed_services: u.length === i.length ? [] : u });
    };
    return c`
      <button class="link" aria-expanded=${o} @click=${() => this._servicesOpen = o ? "" : t.entity_id}>
        <ha-icon icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${n === i.length ? this._tr("pe_services_all") : `${n}/${i.length}`}</button>
      ${o ? c`<div class="svc">${i.map((l) => c`<label class="check"><input type="checkbox" .checked=${r(l.id)}
        ?disabled=${r(l.id) && n === 1} @change=${(p) => a(l.id, p.target.checked)} /> ${l.label}</label>`)}</div>` : _}`;
  }
  _renderEntity(t, e, i = !1) {
    i || Ht(this.hass, As(this.hass, t.entity_id)).then((r) => r && this.requestUpdate());
    const s = this.data.programs.filter((r) => r.id !== this._p.id && r.entities.some((n) => n.entity_id === t.entity_id)).sort((r, n) => r.priority - n.priority || r.name.localeCompare(n.name)).map((r) => this._tr("pe_program_priority", { name: r.name, priority: String(r.priority) }));
    return c`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Je(this.hass, t.entity_id)}</strong>
            ${this.hass.states[t.entity_id] ? _ : c`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Je(this.hass, t.entity_id)}`}
            @click=${() => void this._askDeleteEntity(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${s.length ? c`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: s.join(", ") })}</p>` : _}
        ${i ? _ : this._renderServices(t, e)}
      </div>`;
  }
  _renderSeasons() {
    const t = this._p, e = this._profile, i = this._activeId(), s = this._profileForm;
    return c`
      <p class="hint">${this._tr("profile_explanation")}</p>
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(r) => {
      this._profileId = r.target.value;
    }}>
            ${t.profiles.map((r) => c`<option value=${r.id} ?selected=${r.id === e.id}>${r.name}${r.id === i ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: e.name }}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${t.profiles.length < 2 || e.id === i}
          @click=${() => void this._askDeleteProfile(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${e.id === i ? c`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : _}
      ${s ? c`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(r) => this._profileForm = { ...s, name: r.target.value }}
                @keydown=${(r) => {
      r.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${s.mode === "rename" ? c`<p class="hint">${this._tr("profile_rename_warning")}</p>` : _}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr(this.embedded ? "close" : "cancel")}</button></div>
          </div>` : _}
    `;
  }
  render() {
    if (!this._p) return _;
    const t = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]], e = this._canEdit(), i = c`
      ${e ? _ : c`<p class="error" role="alert">${this._tr("read_only")}</p>`}
      <fieldset ?disabled=${!e || this._saving}>
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${t.map(([r, n]) => c`<button role="tab" aria-selected=${this._tab === r} class="tab ${this._tab === r ? "on" : ""}"
            @click=${() => this._tab = r}>${this._tr(n)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>
      </fieldset>
      ${this._error ? c`<p class="error" role="alert">${this._error}</p>` : _}`, s = c`
      <button class="btn primary" ?disabled=${!e || this._saving} @click=${() => void this._save()}>
        ${this._tr(this.embedded ? "ce_apply_program" : "save")}</button>
      ${this.embedded ? _ : c`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>`}
      ${this._isNew ? _ : c`<button class="btn" ?disabled=${!e || this._saving} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
      ${this._isNew ? _ : c`<button class="btn danger" ?disabled=${!e || this._saving}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>`}`;
    return this.embedded ? c`<section class="embedded">${i}
      <div class="actions">${s}</div>
      ${this._applied ? c`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : _}
    </section>` : c`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${i}<div slot="footer" class="actions">${s}</div>
    </wp-dialog>`;
  }
};
j.styles = [
  rt,
  R`
      :host { display: block; }
      fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .actions .danger { margin-left: auto; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${us(Ln)}
      .link {
        display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0; border: none; background: none;
        color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
      }
      .svc { display: flex; flex-direction: column; padding-left: 8px; }
      .profile-bar { align-items: flex-end; gap: 4px; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `
];
U([
  v({ attribute: !1 })
], j.prototype, "hass", 2);
U([
  v({ attribute: !1 })
], j.prototype, "data", 2);
U([
  v({ attribute: !1 })
], j.prototype, "program", 2);
U([
  v({ type: Boolean })
], j.prototype, "embedded", 2);
U([
  $()
], j.prototype, "_applied", 2);
U([
  v({ attribute: !1 })
], j.prototype, "defaultTypes", 2);
U([
  $()
], j.prototype, "_p", 2);
U([
  $()
], j.prototype, "_isNew", 2);
U([
  $()
], j.prototype, "_tab", 2);
U([
  $()
], j.prototype, "_profileId", 2);
U([
  $()
], j.prototype, "_error", 2);
U([
  $()
], j.prototype, "_saving", 2);
U([
  $()
], j.prototype, "_picker", 2);
U([
  $()
], j.prototype, "_profileForm", 2);
U([
  $()
], j.prototype, "_servicesOpen", 2);
j = U([
  B("wp-program-editor")
], j);
function ds(t, e = []) {
  return [.../* @__PURE__ */ new Set([
    ...t.flatMap((i) => i.entities.map((s) => s.entity_id.split(".")[0])),
    ...e
  ])].filter(Boolean).sort();
}
function Un(t, e, i) {
  return t.map((s) => ({ id: s, label: (i == null ? void 0 : i(`component.${s}.title`)) || s })).sort((s, r) => s.label.localeCompare(r.label, e) || s.id.localeCompare(r.id));
}
var Wn = Object.defineProperty, qn = Object.getOwnPropertyDescriptor, Rt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? qn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Wn(e, i, r), r;
};
let ft = class extends I {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._section = "display", this._editing = null, this._domainLoadKey = "";
  }
  setConfig(t) {
    this._config.program !== t.program && (this._editing = null), this._config = { ...t };
  }
  get _lang() {
    return St(this.hass);
  }
  _tr(t, e) {
    return h(this._lang, t, e);
  }
  updated() {
    this._loadDomainNames(), this.hass && !this._unsub && (this._unsub = ks(this.hass, (t) => {
      this._data = t, this._programs = t.programs.map((e) => ({ id: e.id, name: e.name }));
    }));
  }
  /** HA owns domain names and their translations, including domains unknown to this card. */
  _loadDomainNames() {
    var i, s;
    if (!((i = this.hass) != null && i.loadBackendTranslation) || !this._data) return;
    const t = ds(this._data.programs, (s = this._config.filter) == null ? void 0 : s.types), e = `${this._lang}|${t.join(",")}`;
    e !== this._domainLoadKey && (this._domainLoadKey = e, this._domainLocalize = void 0, t.length && this.hass.loadBackendTranslation("title", t).then((r) => {
      e === this._domainLoadKey && (this._domainLocalize = r, this.requestUpdate());
    }).catch(() => {
      e === this._domainLoadKey && (this._domainLoadKey = "");
    }));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._unsub) == null || t.call(this), this._unsub = void 0;
  }
  _saved(t) {
    var i;
    t.stopPropagation();
    const e = t.detail;
    if (this._data && (this._data = { ...this._data, programs: [...this._data.programs.filter((s) => s.id !== e.id), e] }), this._programs = ((i = this._data) == null ? void 0 : i.programs.map((s) => ({ id: s.id, name: s.name }))) ?? [], this._editing === "new" || this._editing && this._editing !== e.id) {
      const s = { ...this._config, program: e.id };
      delete s.filter, this._emit(s);
    }
    this._editing = e.id;
  }
  _settings() {
    var r, n;
    const t = this._data;
    if (!t || !((n = (r = this.hass) == null ? void 0 : r.user) != null && n.is_admin) || !t.can_edit || t.read_only) return _;
    const e = Xe(t, this._config), i = this._editing ?? (this._isProgram && this._config.program ? this._config.program : ""), s = t.programs.find((o) => o.id === i);
    return c`<section class="program-settings">
      <h3>${this._tr("ce_program_settings")}</h3>
      <p class="hint">${this._tr("ce_shared_settings")}</p>
      ${this._isProgram ? c`<button class="btn" @click=${() => {
      this._editing = i === "new" ? null : "new";
    }}>
        ${this._tr(i === "new" ? "ce_back_program" : "new_program")}</button>` : c`<div class="field"><label for="ce-settings-program">${this._tr("ce_program")}</label>
        <select id="ce-settings-program" .value=${i} @change=${(o) => {
      this._editing = o.target.value;
    }}>
          <option value="" ?selected=${!i}>${this._tr("ce_choose_program")}</option>
          <hr />
          <option value="new" ?selected=${i === "new"}>${this._tr("new_program")}</option>
          <hr />
          ${e.map((o) => c`<option value=${o.id} ?selected=${i === o.id}>${o.name}</option>`)}
          ${s && !e.some((o) => o.id === s.id) ? c`<option value=${s.id} selected>${s.name}</option>` : _}
        </select>
      </div>`}
      ${i === "new" || s ? se(i, c`<wp-program-editor embedded .hass=${this.hass} .data=${t} .program=${s}
        @program-saved=${(o) => this._saved(o)}
        @program-deleted=${(o) => {
      o.stopPropagation(), this._editing = "", this._config.program === o.detail && this._setMode(!1);
    }}></wp-program-editor>`) : _}
    </section>`;
  }
  _emit(t) {
    this._config = t, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 }));
  }
  _set(t, e) {
    const i = { ...this._config };
    e === void 0 || e === "" || e === null ? delete i[t] : i[t] = e, t === "program" && (this._editing = null), this._emit(i);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(t) {
    var i, s;
    this._editing = null;
    const e = { ...this._config };
    t ? (delete e.filter, e.program = ((i = this._programs[0]) == null ? void 0 : i.id) ?? "") : (delete e.program, e.filter = { types: ((s = e.filter) == null ? void 0 : s.types) ?? [] }), this._emit(e);
  }
  _setFilter(t) {
    var s;
    const e = { ...this._config.filter ?? {}, ...t };
    (s = e.types) != null && s.length || delete e.types, e.area || delete e.area;
    const i = { ...this._config, filter: e };
    this._emit(i);
  }
  render() {
    var n, o, a, l, p, u, m;
    const t = this._config, e = ((n = t.filter) == null ? void 0 : n.types) ?? [], i = Un(
      ds(((o = this._data) == null ? void 0 : o.programs) ?? [], e),
      this._lang,
      (d) => {
        var f, b, w;
        return ((b = (f = this.hass) == null ? void 0 : f.localize) == null ? void 0 : b.call(f, d)) || ((w = this._domainLocalize) == null ? void 0 : w.call(this, d)) || "";
      }
    ), s = c`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${t.title ?? ""} @input=${(d) => this._set("title", d.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? c`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(d) => this._set("program", d.target.value)}>
              ${this._programs.length === 0 ? c`<option value="">${this._tr("no_program")}</option>` : _}
              ${!this._programs.some((d) => d.id === t.program) && t.program ? c`<option value=${t.program} selected>${t.program}</option>` : _}
              ${this._programs.map((d) => c`<option value=${d.id} ?selected=${d.id === t.program}>${d.name}</option>`)}
            </select></div>` : c`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${i.map(({ id: d, label: f }) => c`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${e.includes(d)}
                @change=${(b) => this._setFilter({ types: b.target.checked ? [...e, d] : e.filter((w) => w !== d) })} />
                ${f}</label>`)}
            </div>
            ${i.length ? _ : c`<p class="hint">${this._tr("ce_no_types")}</p>`}
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((a = t.filter) == null ? void 0 : a.area) ?? ""} placeholder="bureau"
                @input=${(d) => this._setFilter({ area: d.target.value.trim() })} /></div>`}

      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" .value=${t.schedule_view ?? "bars"} @change=${(d) => this._set("schedule_view", d.target.value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          ${this._isProgram ? c`<option value="radial">${this._tr("ce_radial")}</option>` : _}
          <option value="list">${this._tr("ce_list")}</option>
        </select></div>
      <label class="check"><input type="checkbox" .checked=${t.show_chart !== !1}
        @change=${(d) => this._set("show_chart", d.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `, r = !!((p = (l = this.hass) == null ? void 0 : l.user) != null && p.is_admin && ((u = this._data) != null && u.can_edit) && !((m = this._data) != null && m.read_only));
    return c`
      ${r ? c`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button role="tab" aria-selected=${this._section === "display"} @click=${() => {
      this._section = "display";
    }}>${this._tr("ce_display")}</button>
        <button role="tab" aria-selected=${this._section === "programs"} @click=${() => {
      this._section = "programs";
    }}>${this._tr("ce_program_settings")}</button>
      </nav>` : _}
      <div role="tabpanel">${r && this._section === "programs" ? this._settings() : s}</div>`;
  }
};
ft.styles = [rt, R`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 16px; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; } .hint { line-height: 1.5; }`];
Rt([
  v({ attribute: !1 })
], ft.prototype, "hass", 2);
Rt([
  $()
], ft.prototype, "_config", 2);
Rt([
  $()
], ft.prototype, "_programs", 2);
Rt([
  $()
], ft.prototype, "_data", 2);
Rt([
  $()
], ft.prototype, "_section", 2);
Rt([
  $()
], ft.prototype, "_editing", 2);
ft = Rt([
  B("weekly-planner-card-editor")
], ft);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
