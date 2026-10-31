/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = globalThis, Mi = Te.ShadowRoot && (Te.ShadyCSS === void 0 || Te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Oi = Symbol(), is = /* @__PURE__ */ new WeakMap();
let ir = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== Oi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (Mi && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = is.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && is.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const sr = (t) => new ir(typeof t == "string" ? t : t + "", void 0, Oi), V = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[n + 1], t[0]);
  return new ir(i, t, Oi);
}, Fr = (t, e) => {
  if (Mi) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = Te.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, ss = Mi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return sr(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Wr, defineProperty: Kr, getOwnPropertyDescriptor: Vr, getOwnPropertyNames: Jr, getOwnPropertySymbols: Gr, getPrototypeOf: Yr } = Object, At = globalThis, rs = At.trustedTypes, Xr = rs ? rs.emptyScript : "", ii = At.reactiveElementPolyfillSupport, fe = (t, e) => t, Ue = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Xr : null;
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
} }, zi = (t, e) => !Wr(t, e), ns = { attribute: !0, type: String, converter: Ue, reflect: !1, useDefault: !1, hasChanged: zi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Zt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = ns) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && Kr(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: n } = Vr(this.prototype, e) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const l = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ns;
  }
  static _$Ei() {
    if (this.hasOwnProperty(fe("elementProperties"))) return;
    const e = Yr(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(fe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(fe("properties"))) {
      const i = this.properties, s = [...Jr(i), ...Gr(i)];
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
      for (const r of s) i.unshift(ss(r));
    } else e !== void 0 && i.push(ss(e));
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
    return Fr(e, this.constructor.elementStyles), e;
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
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : Ue).toAttribute(i, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const l = s.getPropertyOptions(r), a = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((n = l.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? l.converter : Ue;
      this._$Em = r;
      const d = a.fromAttribute(i, l.type);
      this[r] = d ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, n) {
    var o;
    if (e !== void 0) {
      const l = this.constructor;
      if (r === !1 && (n = this[e]), s ?? (s = l.getPropertyOptions(e)), !((s.hasChanged ?? zi)(n, i) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(l._$Eu(e, s)))) return;
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
        const { wrapped: l } = o, a = this[n];
        l !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, o, a);
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
Zt.elementStyles = [], Zt.shadowRootOptions = { mode: "open" }, Zt[fe("elementProperties")] = /* @__PURE__ */ new Map(), Zt[fe("finalized")] = /* @__PURE__ */ new Map(), ii == null || ii({ ReactiveElement: Zt }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge = globalThis, os = (t) => t, He = ge.trustedTypes, as = He ? He.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, rr = "$lit$", wt = `lit$${Math.random().toFixed(9).slice(2)}$`, nr = "?" + wt, Qr = `<${nr}>`, Ht = document, ye = () => Ht.createComment(""), be = (t) => t === null || typeof t != "object" && typeof t != "function", Ii = Array.isArray, Zr = (t) => Ii(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", si = `[ 	
\f\r]`, ce = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ls = /-->/g, ds = />/g, Tt = RegExp(`>|${si}(?:([^\\s"'>=/]+)(${si}*=${si}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), cs = /'/g, hs = /"/g, or = /^(?:script|style|textarea|title)$/i, ar = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), c = ar(1), D = ar(2), Ft = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), ps = /* @__PURE__ */ new WeakMap(), Lt = Ht.createTreeWalker(Ht, 129);
function lr(t, e) {
  if (!Ii(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return as !== void 0 ? as.createHTML(e) : e;
}
const tn = (t, e) => {
  const i = t.length - 1, s = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ce;
  for (let l = 0; l < i; l++) {
    const a = t[l];
    let d, u, _ = -1, m = 0;
    for (; m < a.length && (o.lastIndex = m, u = o.exec(a), u !== null); ) m = o.lastIndex, o === ce ? u[1] === "!--" ? o = ls : u[1] !== void 0 ? o = ds : u[2] !== void 0 ? (or.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = Tt) : u[3] !== void 0 && (o = Tt) : o === Tt ? u[0] === ">" ? (o = r ?? ce, _ = -1) : u[1] === void 0 ? _ = -2 : (_ = o.lastIndex - u[2].length, d = u[1], o = u[3] === void 0 ? Tt : u[3] === '"' ? hs : cs) : o === hs || o === cs ? o = Tt : o === ls || o === ds ? o = ce : (o = Tt, r = void 0);
    const f = o === Tt && t[l + 1].startsWith("/>") ? " " : "";
    n += o === ce ? a + Qr : _ >= 0 ? (s.push(d), a.slice(0, _) + rr + a.slice(_) + wt + f) : a + wt + (_ === -2 ? l : f);
  }
  return [lr(t, n + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class ve {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = e.length - 1, a = this.parts, [d, u] = tn(e, i);
    if (this.el = ve.createElement(d, s), Lt.currentNode = this.el.content, i === 2 || i === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (r = Lt.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const _ of r.getAttributeNames()) if (_.endsWith(rr)) {
          const m = u[o++], f = r.getAttribute(_).split(wt), b = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: b[2], strings: f, ctor: b[1] === "." ? sn : b[1] === "?" ? rn : b[1] === "@" ? nn : Xe }), r.removeAttribute(_);
        } else _.startsWith(wt) && (a.push({ type: 6, index: n }), r.removeAttribute(_));
        if (or.test(r.tagName)) {
          const _ = r.textContent.split(wt), m = _.length - 1;
          if (m > 0) {
            r.textContent = He ? He.emptyScript : "";
            for (let f = 0; f < m; f++) r.append(_[f], ye()), Lt.nextNode(), a.push({ type: 2, index: ++n });
            r.append(_[m], ye());
          }
        }
      } else if (r.nodeType === 8) if (r.data === nr) a.push({ type: 2, index: n });
      else {
        let _ = -1;
        for (; (_ = r.data.indexOf(wt, _ + 1)) !== -1; ) a.push({ type: 7, index: n }), _ += wt.length - 1;
      }
      n++;
    }
  }
  static createElement(e, i) {
    const s = Ht.createElement("template");
    return s.innerHTML = e, s;
  }
}
function re(t, e, i = t, s) {
  var o, l;
  if (e === Ft) return e;
  let r = s !== void 0 ? (o = i._$Co) == null ? void 0 : o[s] : i._$Cl;
  const n = be(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((l = r == null ? void 0 : r._$AO) == null || l.call(r, !1), n === void 0 ? r = void 0 : (r = new n(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (e = re(t, r._$AS(t, e.values), r, s)), e;
}
class en {
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
    const { el: { content: i }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? Ht).importNode(i, !0);
    Lt.currentNode = r;
    let n = Lt.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let d;
        a.type === 2 ? d = new ne(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new on(n, this, e)), this._$AV.push(d), a = s[++l];
      }
      o !== (a == null ? void 0 : a.index) && (n = Lt.nextNode(), o++);
    }
    return Lt.currentNode = Ht, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class ne {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = re(this, e, i), be(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== Ft && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Zr(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && be(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Ht.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = ve.createElement(lr(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(i);
    else {
      const o = new en(r, this), l = o.u(this.options);
      o.p(i), this.T(l), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = ps.get(e.strings);
    return i === void 0 && ps.set(e.strings, i = new ve(e)), i;
  }
  k(e) {
    Ii(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const n of e) r === i.length ? i.push(s = new ne(this.O(ye()), this.O(ye()), this, this.options)) : s = i[r], s._$AI(n), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); e !== this._$AB; ) {
      const r = os(e).nextSibling;
      os(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var i;
    this._$AM === void 0 && (this._$Cv = e, (i = this._$AP) == null || i.call(this, e));
  }
}
class Xe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(e, i = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = re(this, e, i, 0), o = !be(e) || e !== this._$AH && e !== Ft, o && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++) d = re(this, l[s + a], i, a), d === Ft && (d = this._$AH[a]), o || (o = !be(d) || d !== this._$AH[a]), d === p ? e = p : e !== p && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class sn extends Xe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class rn extends Xe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class nn extends Xe {
  constructor(e, i, s, r, n) {
    super(e, i, s, r, n), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = re(this, e, i, 0) ?? p) === Ft) return;
    const s = this._$AH, r = e === p && s !== p || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== p && (s === p || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class on {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    re(this, e);
  }
}
const an = { I: ne }, ri = ge.litHtmlPolyfillSupport;
ri == null || ri(ve, ne), (ge.litHtmlVersions ?? (ge.litHtmlVersions = [])).push("3.3.3");
const ln = (t, e, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new ne(e.insertBefore(ye(), n), n, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = globalThis;
let U = class extends Zt {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ln(i, this.renderRoot, this.renderOptions);
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
    return Ft;
  }
};
var er;
U._$litElement$ = !0, U.finalized = !0, (er = Bt.litElementHydrateSupport) == null || er.call(Bt, { LitElement: U });
const ni = Bt.litElementPolyfillSupport;
ni == null || ni({ LitElement: U });
(Bt.litElementVersions ?? (Bt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dn = { CHILD: 2 }, dr = (t) => (...e) => ({ _$litDirective$: t, values: e });
let cr = class {
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
const { I: cn } = an, us = (t) => t, _s = () => document.createComment(""), he = (t, e, i) => {
  var n;
  const s = t._$AA.parentNode, r = e === void 0 ? t._$AB : e._$AA;
  if (i === void 0) {
    const o = s.insertBefore(_s(), r), l = s.insertBefore(_s(), r);
    i = new cn(o, l, t, t.options);
  } else {
    const o = i._$AB.nextSibling, l = i._$AM, a = l !== t;
    if (a) {
      let d;
      (n = i._$AQ) == null || n.call(i, t), i._$AM = t, i._$AP !== void 0 && (d = t._$AU) !== l._$AU && i._$AP(d);
    }
    if (o !== r || a) {
      let d = i._$AA;
      for (; d !== o; ) {
        const u = us(d).nextSibling;
        us(s).insertBefore(d, r), d = u;
      }
    }
  }
  return i;
}, Nt = (t, e, i = t) => (t._$AI(e, i), t), hn = {}, hr = (t, e = hn) => t._$AH = e, pn = (t) => t._$AH, oi = (t) => {
  t._$AR(), t._$AA.remove();
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Fe = dr(class extends cr {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, i]) {
    return e !== this.key && (hr(t), this.key = e), i;
  }
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const un = { attribute: !0, type: String, converter: Ue, reflect: !1, hasChanged: zi }, _n = (t = un, e, i) => {
  const { kind: s, metadata: r } = i;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(i.name, t), s === "accessor") {
    const { name: o } = i;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(o, a, t, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, t, l), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(l) {
      const a = this[o];
      e.call(this, l), this.requestUpdate(o, a, t, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function v(t) {
  return (e, i) => typeof i == "object" ? _n(t, e, i) : ((s, r, n) => {
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
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ai = (t) => t ?? p;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ms = (t, e, i) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = e; r <= i; r++) s.set(t[r], r);
  return s;
}, mn = dr(class extends cr {
  constructor(t) {
    if (super(t), t.type !== dn.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(t, e, i) {
    let s;
    i === void 0 ? i = e : e !== void 0 && (s = e);
    const r = [], n = [];
    let o = 0;
    for (const l of t) r[o] = s ? s(l, o) : o, n[o] = i(l, o), o++;
    return { values: n, keys: r };
  }
  render(t, e, i) {
    return this.dt(t, e, i).values;
  }
  update(t, [e, i, s]) {
    const r = pn(t), { values: n, keys: o } = this.dt(e, i, s);
    if (!Array.isArray(r)) return this.ut = o, n;
    const l = this.ut ?? (this.ut = []), a = [];
    let d, u, _ = 0, m = r.length - 1, f = 0, b = n.length - 1;
    for (; _ <= m && f <= b; ) if (r[_] === null) _++;
    else if (r[m] === null) m--;
    else if (l[_] === o[f]) a[f] = Nt(r[_], n[f]), _++, f++;
    else if (l[m] === o[b]) a[b] = Nt(r[m], n[b]), m--, b--;
    else if (l[_] === o[b]) a[b] = Nt(r[_], n[b]), he(t, a[b + 1], r[_]), _++, b--;
    else if (l[m] === o[f]) a[f] = Nt(r[m], n[f]), he(t, r[_], r[m]), m--, f++;
    else if (d === void 0 && (d = ms(o, f, b), u = ms(l, _, m)), d.has(l[_])) if (d.has(l[m])) {
      const x = u.get(o[f]), E = x !== void 0 ? r[x] : null;
      if (E === null) {
        const k = he(t, r[_]);
        Nt(k, n[f]), a[f] = k;
      } else a[f] = Nt(E, n[f]), he(t, r[_], E), r[x] = null;
      f++;
    } else oi(r[m]), m--;
    else oi(r[_]), _++;
    for (; f <= b; ) {
      const x = he(t, a[b + 1]);
      Nt(x, n[f]), a[f++] = x;
    }
    for (; _ <= m; ) {
      const x = r[_++];
      x !== null && oi(x);
    }
    return this.ut = o, hr(t, a), Ft;
  }
});
var fn = Object.defineProperty, gn = Object.getOwnPropertyDescriptor, oe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? gn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && fn(e, i, r), r;
};
const yn = 2e3;
let Ot = class extends U {
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
    this._mouse = t.pointerType === "mouse", !(this.through && this._mouse) && (t.stopPropagation(), t.pointerType !== "mouse" && (this._on(), clearTimeout(this._timer), this._timer = setTimeout(() => this._off(), yn)));
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
      ${this._show && this.text ? c`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : p}`;
  }
};
Ot.styles = V`
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
oe([
  v()
], Ot.prototype, "text", 2);
oe([
  v({ type: Boolean })
], Ot.prototype, "passive", 2);
oe([
  v({ type: Boolean })
], Ot.prototype, "through", 2);
oe([
  $()
], Ot.prototype, "_show", 2);
oe([
  $()
], Ot.prototype, "_shift", 2);
Ot = oe([
  J("wp-tip")
], Ot);
const bn = {
  random_too_short: "Reduce the random delay or extend this schedule: at least 5 minutes must remain.",
  random_time: "Random delay",
  random_minutes: "Maximum delay (minutes)",
  random_window: "Within the next {n} minutes",
  pe_area: "Program room (optional)",
  pe_area_hint: "Choose an existing name or enter a new one. This groups programs in card filters; the rooms of the devices are not used automatically.",
  ce_all_areas: "All rooms",
  ce_area_hint: "Set each program’s room in Program settings > General.",
  no_matching_program: "No programs match this card’s filters. Check the type, room and program selection in the card settings.",
  chart_no_history: "No history recorded for this day.",
  chart_future_history: "History will appear after the device reports its state.",
  chart_no_planned: "No action planned for this device on this day.",
  chart_history_failed: "History could not be loaded. Planned actions are still shown.",
  mode_source_loop: "Choose an entity outside Weekly Planner to avoid a circular mode selection.",
  mode_source_locked: "This program follows an external entity. Apply manual selection first to change its mode here.",
  mode_removed: "This mode was deleted. Return to mode settings.",
  mode_active_immediate: "Active mode — changes immediately",
  mode_active_immediate_hint: "Takes effect immediately, without Apply. Undo change does not restore the active mode.",
  mode_association_count: "Associated states: {n}",
  pe_add_another_entity: "Add another device (optional)",
  pe_zero_services: "No commands selected. Choose them here or later in Devices.",
  ce_define_schedule: "Set schedules",
  mode_control: "Choose mode",
  mode_manual: "Manually",
  mode_external: "From an entity",
  mode_source_entity: "Mode selector or source entity",
  mode_source_hint: "Associate the source states with program modes. If unavailable or unmapped, keep the last active mode.",
  mode_source_current: "Current state: {state}",
  mode_source_state: "Source state",
  mode_source_target: "Program mode",
  mode_remove_mapping: "Remove association",
  mode_add_mapping: "Add association",
  mode_source_kept: "Source unavailable or state not associated. Mode kept: {name}.",
  mode_active_select: "Active mode",
  mode_edit_hours: "Edit this mode’s schedules",
  mode_schedule_hint: "Editing these schedules does not activate this mode.",
  mode_duplicate_state: "This state is already associated with a mode.",
  mode_incomplete: "Choose a source and associate at least one state with a mode. Complete or remove unfinished associations.",
  pe_history: "Draft history",
  pe_undo: "Undo change",
  pe_redo: "Redo",
  pe_unapplied: "Changes not applied yet",
  profile_manage: "Mode to edit",
  profile_current: "Active now: {name}",
  profile_draft_hint: "Choose a mode to edit its schedules. Choosing it here does not activate it.",
  profile_discard_edit: "Discard name change",
  pe_shared_save_hint: "Updates this program on every card. Cancelling the dashboard editor will not undo applied changes.",
  profile_change_active: "Change active mode",
  profile_selector_missing: "The program’s Home Assistant mode selector is unavailable.",
  profile_apply_first: "Apply your mode changes first.",
  pe_other_programs: "Also used by: {programs}. Lower priority numbers take precedence.",
  pe_program_priority: "{name} (priority {priority})",
  profile_explanation: "Each mode has its own weekly schedule: Home, Away, Night, Vacation…",
  pe_icon_hint: "Uses the first device’s icon unless you choose another.",
  ce_schedule_view: "Day layout",
  ce_bars: "Bars",
  ce_radial: "24-hour dial",
  ce_radial_12h: "Double 12-hour dial",
  radial_rings: "Inner: 0–12 h · Outer: 12–24 h",
  ce_list: "Compact list",
  ce_back_program: "Back to selected program",
  ce_display: "Card appearance",
  ce_program_settings: "Program settings",
  ce_choose_program: "Choose a program…",
  ce_shared_settings: "These settings are shared by all cards. Apply them to the program separately; cancelling the card editor will not undo applied changes.",
  ce_apply_program: "Apply to program",
  ce_program_applied: "Program updated on every card.",
  value_current: "Current value: {value}",
  value_unavailable: "Unavailable",
  value_fixed: "Fixed value",
  value_entity: "Value from an entity",
  value_source: "Source entity or helper",
  value_read: "Value to read",
  value_state: "Entity state",
  value_at_execution: "Read when the schedule runs. If unavailable, the action is not sent.",
  action_none_allowed: "Choose the actions to offer first in Program settings → Devices.",
  action_target: "Apply action to",
  action_target_device: "Program device",
  action_target_other: "Another entity",
  action_target_entity: "Entity to control",
  action_target_hint: "This setting acts on the selected entity, for example a favorite-position button or a script.",
  action_choose: "Choose an action…",
  action_no_description: "This integration provides no description for this action.",
  action_scene_description: "Activate this Home Assistant scene and apply its saved settings.",
  edited: "Changed",
  active_key: "On or open",
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
  rename_label: "Edit setting",
  edit_bar: "Edit the day",
  hold_hint: "Press and hold to edit",
  handle: "Boundary {time}",
  rest_gap: "Rest of the time",
  // --- settings (0.6) ---
  lb_new: "New setting",
  lb_name: "Name",
  lb_color: "Color",
  lb_value_here: "Value for this device",
  lb_common_value: "Back to the common value",
  lb_err_name: "Give it a name.",
  lb_err_action: "Choose what it does.",
  lb_err_fields: "Fill in the required fields.",
  lb_err_save: "Could not save the setting.",
  lb_delete: "Delete the setting",
  lb_delete_ask: "Delete the setting “{name}”? It disappears for every device.",
  lb_delete_used: "“{name}” is still used by: {programs}. Change those schedules first, then delete it.",
  lb_err_delete: "Could not delete the setting.",
  err_label: "Choose a setting.",
  tab_seasons: "Modes",
  ch_set: "Requested from device",
  manual: "Manual",
  chart_open: "History of {name}",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  days_short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  title: "Schedules",
  vacation: "All programs paused",
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
  profile: "Mode",
  chart: "Chart",
  planned: "Schedule",
  applied: "Applied",
  measured: "Measured value",
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
  sun_earliest: "Not earlier than",
  sun_latest: "Not later than",
  sun_real: "Actual time: {base}{limits}.",
  sun_limits_both: ", but not earlier than {a} nor later than {b}",
  sun_limits_earliest: ", but not earlier than {a}",
  sun_limits_latest: ", but not later than {b}",
  sun_today: "Today: {time}",
  random_range_start: "Every day, starts at a random time between {start} and {end}",
  random_range_end: "Every day, ends at a random time between {start} and {end}",
  random_later: "{n} later",
  sun_limit_clear: "Remove the limit",
  err_sun_bounds: "“Not earlier than” must come before “Not later than”.",
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
  pe_choose_services: "Choose the actions you want to use for this device. You can change them later.",
  pe_no_services: "No actions available yet. You can choose them later in Devices.",
  pe_services: "Offered actions",
  pe_services_all: "All",
  pe_unknown_entity: "unknown entity",
  profile_default: "Standard week",
  profile_add: "Add a mode",
  profile_rename: "Rename the mode",
  profile_copy: "Copy the mode",
  profile_delete: "Delete the mode",
  profile_active_hint: "Active mode (cannot be deleted).",
  profile_rename_warning: "Automations using the old name must be updated.",
  profile_active: "active",
  err_name: "The name is required.",
  err_no_entity: "Add at least one entity.",
  err_profile_name: "Mode names must be unique and not empty.",
  err_overlap_server: "Slots overlap on a day.",
  err_unauthorized: "Reserved to administrators.",
  ce_title: "Title",
  ce_mode: "Content",
  ce_one_program: "One program only",
  ce_filtered: "Several devices",
  ce_program: "Program",
  ce_edit_program: "Program to edit",
  ce_edit_selected: "Edit this program",
  ce_resume_creation: "Continue creating program",
  ce_draft_kept: "Your new program draft is kept. Continue creating it when ready.",
  ce_created: "“{name}” created and selected for this card. Now add its schedules.",
  pe_create: "Create program",
  pe_create_hint: "Choose a name, add the devices and select the actions to offer.",
  pe_create_save_hint: "Create program saves it in Home Assistant. Then save the card to keep its display settings.",
  ce_display_programs: "Programs to display",
  ce_all_programs: "All programs",
  ce_display_programs_hint: "Choose what this card shows. Other cards are not changed.",
  ce_no_types: "Types appear when devices are added to programs.",
  ce_type_switch: "All {type} programs",
  ce_type_count: "{on} of {total}",
  ce_type_empty: "No program of this type.",
  ce_other_programs: "Other selected programs",
  ce_area: "Room (optional)",
  ce_show_chart: "Chart button under each device",
  ce_show_chart_hint: "Also shows the chart in the schedule window. Turn off to hide the chart everywhere on this card.",
  ce_chart_open: "Chart open by default",
  ce_chart_open_hint: "Each person can still open or close it; the browser remembers that choice.",
  ce_left_all: "New programs will no longer appear automatically on this card.",
  ce_back_all: "Show all programs again",
  ce_partial: "partly",
  ce_partial_label: "{name}: partly on ({on} of {total})",
  ce_of_total: "{on} of {total}",
  chart_day: "Today’s chart",
  today: "Today",
  no_data: "No data for this day.",
  chart_loading: "Loading…",
  // --- simple mode ---
  cf_title: "Please confirm",
  // --- schedule & gestures ---
  ss_changed: "This schedule was just changed. Here is the new version.",
  err_time_range: "A time is out of range. Shorten the delay or pick a time.",
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
  program_disabled: "Disabled",
  paused: "Paused",
  settings: "Settings",
  all_programs: "All schedules",
  today_short: "Today",
  apply_other_days: "Apply to other days",
  sun_sunrise_short: "Sunrise",
  sun_sunset_short: "Sunset",
  w_err_overlap: "Two schedules overlap.",
  w_err_overlap_slot: "a schedule",
  w_err_overlap_detail: "{day}: {a} ({a_time}) overlaps {b} ({b_time}). Change a time or a day.",
  err_days: "Pick at least one day.",
  err_action: "Pick a setting.",
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
}, vn = {
  random_too_short: "Réduisez le délai aléatoire ou allongez cet horaire : il doit rester au moins 5 minutes.",
  random_time: "Délai aléatoire",
  random_minutes: "Délai maximum (minutes)",
  random_window: "Dans les {n} prochaines minutes",
  pe_area: "Pièce du programme (facultatif)",
  pe_area_hint: "Choisissez un nom existant ou saisissez-en un nouveau. Cette pièce regroupe les programmes dans les filtres des cartes ; les pièces des appareils ne sont pas reprises automatiquement.",
  ce_all_areas: "Toutes les pièces",
  ce_area_hint: "Définissez la pièce de chaque programme dans Réglages des programmes > Général.",
  no_matching_program: "Aucun programme ne correspond aux filtres de cette carte. Vérifiez les types, la pièce et les programmes sélectionnés dans les réglages de la carte.",
  chart_no_history: "Aucun historique enregistré pour cette journée.",
  chart_future_history: "L’historique apparaîtra quand l’appareil aura communiqué son état.",
  chart_no_planned: "Aucune action prévue pour cet appareil ce jour-là.",
  chart_history_failed: "Impossible de charger l’historique. Les actions prévues restent affichées.",
  mode_source_loop: "Choisissez une entité extérieure à Weekly Planner pour éviter une sélection circulaire des modes.",
  mode_source_locked: "Ce programme suit une entité externe. Appliquez d’abord le choix manuel pour changer son mode ici.",
  mode_removed: "Ce mode a été supprimé. Revenez aux réglages des modes.",
  mode_active_immediate: "Mode actif — changement immédiat",
  mode_active_immediate_hint: "Effet immédiat, sans Appliquer. Annuler la modification ne rétablit pas le mode actif.",
  mode_association_count: "États associés : {n}",
  pe_add_another_entity: "Ajouter un autre appareil (facultatif)",
  pe_zero_services: "Aucune commande sélectionnée. Choisissez-les ici ou plus tard dans Appareils.",
  ce_define_schedule: "Définir les horaires",
  mode_control: "Choisir le mode",
  mode_manual: "Manuellement",
  mode_external: "Depuis une entité",
  mode_source_entity: "Sélecteur de mode ou entité à suivre",
  mode_source_hint: "Associez les états de l’entité aux modes du programme. Si l’entité est indisponible ou l’état sans association, le dernier mode reste actif.",
  mode_source_current: "État actuel : {state}",
  mode_source_state: "État de l’entité",
  mode_source_target: "Mode du programme",
  mode_remove_mapping: "Retirer l’association",
  mode_add_mapping: "Ajouter une association",
  mode_source_kept: "Entité indisponible ou état sans association. Mode conservé : {name}.",
  mode_active_select: "Mode actif",
  mode_edit_hours: "Modifier les horaires de ce mode",
  mode_schedule_hint: "Modifier ces horaires n’active pas ce mode.",
  mode_duplicate_state: "Cet état est déjà associé à un mode.",
  mode_incomplete: "Choisissez une entité et associez au moins un état à un mode. Complétez ou retirez les associations incomplètes.",
  pe_history: "Historique du brouillon",
  pe_undo: "Annuler la modification",
  pe_redo: "Rétablir",
  pe_unapplied: "Modifications non appliquées",
  profile_manage: "Mode à modifier",
  profile_current: "Actif actuellement : {name}",
  profile_draft_hint: "Choisissez le mode dont vous voulez modifier les horaires. Ce choix ne l’active pas.",
  profile_discard_edit: "Abandonner ce nom",
  pe_shared_save_hint: "Met à jour ce programme sur toutes les cartes. Annuler l’éditeur du tableau de bord n’annule pas les changements appliqués.",
  profile_change_active: "Changer le mode actif",
  profile_selector_missing: "Le sélecteur de mode Home Assistant de ce programme est indisponible.",
  profile_apply_first: "Appliquez d’abord vos changements de mode.",
  pe_other_programs: "Déjà utilisé par : {programs}. Le plus petit numéro de priorité l’emporte.",
  pe_program_priority: "{name} (priorité {priority})",
  profile_explanation: "Chaque mode a sa propre semaine d’horaires : Maison, Absent, Nuit, Vacances…",
  pe_icon_hint: "L’icône du premier appareil est utilisée, sauf si vous en choisissez une autre.",
  ce_schedule_view: "Présentation de la journée",
  ce_bars: "Barres",
  ce_radial: "Cadran 24 heures",
  ce_radial_12h: "Double cadran 12 heures",
  radial_rings: "Intérieur : 0–12 h · Extérieur : 12–24 h",
  ce_list: "Liste compacte",
  ce_back_program: "Revenir au programme sélectionné",
  ce_display: "Affichage de la carte",
  ce_program_settings: "Réglages des programmes",
  ce_choose_program: "Choisir un programme…",
  ce_shared_settings: "Ces réglages sont partagés entre les cartes. Appliquez-les au programme séparément : annuler l’édition de la carte n’annule pas les changements déjà appliqués.",
  ce_apply_program: "Appliquer au programme",
  ce_program_applied: "Programme mis à jour sur toutes les cartes.",
  value_current: "Valeur actuelle : {value}",
  value_unavailable: "Indisponible",
  value_fixed: "Valeur fixe",
  value_entity: "Valeur d’une entité",
  value_source: "Entité ou entrée à utiliser",
  value_read: "Valeur à lire",
  value_state: "État de l’entité",
  value_at_execution: "Lue à l’exécution de l’horaire. Si indisponible, l’action n’est pas envoyée.",
  action_none_allowed: "Choisissez d’abord les actions à proposer dans Réglages des programmes → Appareils.",
  action_target: "Appliquer l’action à",
  action_target_device: "L’appareil du programme",
  action_target_other: "Une autre entité",
  action_target_entity: "Entité à commander",
  action_target_hint: "Ce réglage agit sur l’entité choisie, par exemple un bouton de position favorite ou un script.",
  action_choose: "Choisir une action…",
  action_no_description: "Cette intégration ne fournit pas de description pour cette action.",
  action_scene_description: "Activer cette scène Home Assistant et appliquer ses réglages enregistrés.",
  // --- réglages (0.6) ---
  lb_new: "Nouveau réglage",
  lb_name: "Nom",
  lb_color: "Couleur",
  lb_value_here: "Valeur pour cet appareil",
  lb_common_value: "Revenir à la valeur commune",
  lb_err_name: "Donnez-lui un nom.",
  lb_err_action: "Choisissez l'action.",
  lb_err_fields: "Remplissez les champs obligatoires.",
  edited: "Modifié",
  active_key: "En marche ou ouvert",
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
  rename_label: "Modifier le réglage",
  edit_bar: "Modifier la journée",
  hold_hint: "Restez appuyé pour modifier",
  handle: "Limite {time}",
  rest_gap: "Le reste du temps",
  lb_err_save: "Réglage non enregistré.",
  lb_delete: "Supprimer le réglage",
  lb_delete_ask: "Supprimer le réglage « {name} » ? Il disparaît pour tous les appareils.",
  lb_delete_used: "« {name} » est encore utilisé par : {programs}. Modifiez d’abord ces horaires, puis supprimez-le.",
  lb_err_delete: "Réglage non supprimé.",
  err_label: "Choisissez un réglage.",
  tab_seasons: "Modes",
  ch_set: "Demandé à l’appareil",
  manual: "Manuel",
  chart_open: "Historique de {name}",
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  days_short: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  title: "Programmes",
  vacation: "Tous les programmes suspendus",
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
  profile: "Mode",
  chart: "Graphique",
  planned: "Programme",
  applied: "Appliqué",
  measured: "Valeur mesurée",
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
  sun_earliest: "Au plus tôt à",
  sun_latest: "Au plus tard à",
  sun_real: "Heure réelle : {base}{limits}.",
  sun_limits_both: ", mais pas avant {a} ni après {b}",
  sun_limits_earliest: ", mais pas avant {a}",
  sun_limits_latest: ", mais pas après {b}",
  sun_today: "Aujourd’hui : {time}",
  random_range_start: "Chaque jour, démarre au hasard entre {start} et {end}",
  random_range_end: "Chaque jour, se termine au hasard entre {start} et {end}",
  random_later: "{n} plus tard",
  sun_limit_clear: "Retirer la limite",
  err_sun_bounds: "« Au plus tôt » doit précéder « Au plus tard ».",
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
  pe_choose_services: "Cochez les actions utiles pour cet appareil. Vous pourrez les changer ensuite.",
  pe_no_services: "Aucune action disponible pour le moment. Vous pourrez les choisir ensuite dans Appareils.",
  pe_services: "Actions proposées",
  pe_services_all: "Toutes",
  pe_unknown_entity: "appareil inconnu",
  profile_default: "Semaine type",
  profile_add: "Ajouter un mode",
  profile_rename: "Renommer le mode",
  profile_copy: "Copier le mode",
  profile_delete: "Supprimer le mode",
  profile_active_hint: "Mode actif (ne peut pas être supprimé).",
  profile_rename_warning: "Les automatisations qui utilisent l'ancien nom sont à mettre à jour.",
  profile_active: "active",
  err_name: "Le nom est obligatoire.",
  err_no_entity: "Ajoutez au moins un appareil.",
  err_profile_name: "Les noms de mode doivent être uniques et non vides.",
  err_overlap_server: "Des plages se chevauchent un jour.",
  err_unauthorized: "Réservé aux administrateurs.",
  ce_title: "Titre",
  ce_mode: "Contenu",
  ce_one_program: "Un seul programme",
  ce_filtered: "Plusieurs appareils",
  ce_program: "Programme",
  ce_edit_program: "Programme à modifier",
  ce_edit_selected: "Modifier ce programme",
  ce_resume_creation: "Continuer la création",
  ce_draft_kept: "Votre nouveau programme est conservé en brouillon. Vous pouvez continuer sa création.",
  ce_created: "« {name} » créé et sélectionné pour cette carte. Ajoutez maintenant ses horaires.",
  pe_create: "Créer le programme",
  pe_create_hint: "Donnez un nom, ajoutez les appareils et cochez les actions à proposer.",
  pe_create_save_hint: "Créer le programme l’enregistre dans Home Assistant. Enregistrez ensuite la carte pour conserver son affichage.",
  ce_display_programs: "Programmes à afficher",
  ce_all_programs: "Tous les programmes",
  ce_display_programs_hint: "Choisissez ce que cette carte montre. Les autres cartes ne changent pas.",
  ce_no_types: "Les types apparaissent après l’ajout d’appareils aux programmes.",
  ce_type_switch: "Tous les programmes {type}",
  ce_type_count: "{on} sur {total}",
  ce_type_empty: "Aucun programme de ce type.",
  ce_other_programs: "Autres programmes choisis",
  ce_area: "Pièce (facultatif)",
  ce_show_chart: "Bouton Graphique sous chaque appareil",
  ce_show_chart_hint: "Affiche aussi le graphique dans la fenêtre des horaires. Éteint : plus de graphique nulle part sur cette carte.",
  ce_chart_open: "Graphique ouvert d’office",
  ce_chart_open_hint: "Chacun peut encore l’ouvrir ou le fermer ; le navigateur retient ce choix.",
  ce_left_all: "Les nouveaux programmes ne s’afficheront plus automatiquement sur cette carte.",
  ce_back_all: "Afficher de nouveau tous les programmes",
  ce_partial: "en partie",
  ce_partial_label: "{name} : en partie ({on} sur {total})",
  ce_of_total: "{on} sur {total}",
  chart_day: "Graphique du jour",
  today: "Aujourd'hui",
  no_data: "Pas de données pour ce jour.",
  chart_loading: "Chargement…",
  // --- simple mode ---
  cf_title: "Veuillez confirmer",
  // --- schedule & gestures ---
  ss_changed: "Cet horaire vient d'être modifié, voici la nouvelle version.",
  err_time_range: "Une heure est hors limites. Réduisez le décalage ou choisissez une heure.",
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
  program_disabled: "Désactivé",
  paused: "En pause",
  settings: "Réglages",
  all_programs: "Tous les horaires",
  today_short: "Auj.",
  apply_other_days: "Appliquer à d'autres jours",
  sun_sunrise_short: "Lever",
  sun_sunset_short: "Coucher",
  w_err_overlap: "Deux horaires se chevauchent.",
  w_err_overlap_slot: "un horaire",
  w_err_overlap_detail: "{day} : {a} ({a_time}) chevauche {b} ({b_time}). Changez une heure ou un jour.",
  err_days: "Choisissez au moins un jour.",
  err_action: "Choisissez un réglage.",
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
function Z(t) {
  return t.startsWith("fr") ? vn : bn;
}
function h(t, e, i = {}) {
  let s = Z(t)[e];
  for (const [r, n] of Object.entries(i)) s = s.replace(`{${r}}`, n);
  return s;
}
const fs = /* @__PURE__ */ new Map();
function Jt(t, e) {
  const i = `${t}|${JSON.stringify(e)}`;
  let s = fs.get(i);
  return s || fs.set(i, s = new Intl.DateTimeFormat(t, e)), s;
}
function qt(t, e) {
  const [i, s, r] = t.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + e)).toISOString().slice(0, 10);
}
const We = 5, C = 1440;
function G(t) {
  const [e, i] = t.split(":").map(Number);
  return e * 60 + i;
}
function Wt(t) {
  const e = Math.max(0, Math.min(C, Math.round(t / We) * We));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function ut(t, e) {
  var o, l;
  const i = typeof t == "string" ? new Date(t) : t, s = Jt("en-GB", {
    timeZone: e,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((o = s.find((a) => a.type === "hour")) == null ? void 0 : o.value) ?? 0), n = Number(((l = s.find((a) => a.type === "minute")) == null ? void 0 : l.value) ?? 0);
  return r * 60 + n;
}
function Ne(t, e) {
  const i = Jt("en-GB", { timeZone: e, weekday: "short" }).format(t);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function it(t, e) {
  return Jt("en-CA", { timeZone: e }).format(t);
}
function zt(t) {
  return !t || !("time" in t) ? null : G(t.time);
}
function pr(t) {
  const e = [];
  for (const i of t) {
    const s = zt(i.start), r = zt(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && e.push({ slot: i, end: r });
  }
  return e;
}
function mt(t, e) {
  const i = (Math.round(e) % C + C) % C, s = Math.floor(i / 60), r = i % 60;
  if (t.toLowerCase().startsWith("fr")) return r ? `${s} h ${String(r).padStart(2, "0")}` : `${s} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, s, r)), o = { timeZone: "UTC", hour: "numeric" };
  return r && (o.minute = "2-digit"), Jt(t, o).format(n).replace(/\s?(AM|PM)/, (l, a) => ` ${a.toLowerCase()}`);
}
function gs(t, e, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(t), n = it(r, e) === it(s, e), o = mt(i, ut(r, e));
  if (n) return o;
  if (qt(it(s, e), 1) === it(r, e)) return `${new Intl.RelativeTimeFormat(i, { numeric: "auto" }).format(1, "day")} ${o}`;
  const d = r.getTime() - s.getTime() > 6 * 864e5 ? { timeZone: e, weekday: "short", day: "numeric", month: "short" } : { timeZone: e, weekday: "short" };
  return `${Jt(i, d).format(r)} ${o}`;
}
var $n = Object.defineProperty, wn = Object.getOwnPropertyDescriptor, vt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? wn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && $n(e, i, r), r;
};
function Ct(t) {
  return !t || !("sun" in t) ? null : t.sun === "sunrise" || t.sun === "dawn" ? "up" : "down";
}
function $e(t, e, i) {
  if (!e || !("sun" in e)) return "";
  const s = e.offset ?? 0, r = Z(t)[`sun_${e.sun}`] ?? e.sun, n = s ? ` ${s > 0 ? "+" : "-"} ${Math.abs(s)} min` : "";
  return `${r}${n} · ${mt(t, i)}`;
}
const Di = (t, e) => `${h(t, "now")} · ${mt(t, e)}`;
let ct = class extends U {
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
    if ((i - e) / C * this._width < r) return null;
    const n = Math.max(t.end - t.start, 1);
    return { left: (e - t.start) / n * 100, width: (i - e) / n * 100 };
  }
  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  _sunIcons() {
    const t = [];
    for (const e of this.spans)
      e.startSun && t.push({ m: e.start, dir: e.startSun, spec: e.startSpec, label: e.marker ? e.label : void 0 }), e.endSun && e.end < C && t.push({ m: e.end, dir: e.endSun, spec: e.endSpec });
    return t.map((e) => c`<wp-tip class="sunic" ?passive=${this.tall}
      text=${`${e.label ? `${e.label} · ` : ""}${$e(this.lang, e.spec, e.m)}`}
      style="left:clamp(16px, ${e.m / C * 100}%, calc(100% - 16px))" data-sun=${e.dir}>
      <span class="sunc"><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
  }
  /** A one-shot is a thin line: a wider invisible target over it shows its label and time. */
  _markerTips() {
    return this.spans.filter((t) => t.marker && !t.startSun && !this.thin).map((t) => c`<wp-tip class="mktip" through
      ?passive=${this.tall} text=${`${t.label} · ${mt(this.lang, t.start)}`}
      style="left:clamp(12px, ${t.start / C * 100}%, calc(100% - 12px))"></wp-tip>`);
  }
  render() {
    const t = (i) => `${i / C * 100}%`, e = this.now;
    return c`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((i) => i.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((i) => c`<i class="tick" style="left:${t(i * 60)}"></i>`) : p}
          ${this.spans.map((i) => {
      const s = this._labelBox(i);
      return c`<div
              class="span ${i.ignored ? "ignored" : ""}"
              style="left:${t(i.start)};width:${t(Math.max(i.end - i.start, 5))};--c:${i.color}"
              title=${i.label}
            >${s ? c`<span class="name" style="left:${s.left}%;width:${s.width}%">${i.label}</span>` : p}</div>`;
    })}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${e !== null ? c`<div class="nowline" style="left:${t(e)}">
          <wp-tip class="nowic" text=${Di(this.lang, e)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>` : p}
      </div>
      ${this.showHours ? c`<div class="hours">${[0, 6, 12, 18, 24].map((i) => c`<span style="left:${t(i * 60)}">${mt(this.lang, i * 60)}</span>`)}</div>` : p}
    `;
  }
};
ct.styles = V`
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
vt([
  v({ attribute: !1 })
], ct.prototype, "spans", 2);
vt([
  v({ type: Number })
], ct.prototype, "now", 2);
vt([
  v({ type: Boolean })
], ct.prototype, "thin", 2);
vt([
  v({ type: Boolean, attribute: "show-hours" })
], ct.prototype, "showHours", 2);
vt([
  v({ type: Boolean })
], ct.prototype, "notches", 2);
vt([
  v({ type: Boolean })
], ct.prototype, "tall", 2);
vt([
  v()
], ct.prototype, "lang", 2);
vt([
  $()
], ct.prototype, "_width", 2);
ct = vt([
  J("wp-day-bar")
], ct);
var xn = Object.defineProperty, kn = Object.getOwnPropertyDescriptor, ae = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? kn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && xn(e, i, r), r;
};
const Xt = [];
function Sn() {
  var e;
  let t = document.activeElement;
  for (; (e = t == null ? void 0 : t.shadowRoot) != null && e.activeElement; ) t = t.shadowRoot.activeElement;
  return t && t !== document.body ? t : null;
}
let It = class extends U {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.wide = !1, this.columns = !1, this._expanded = !1, this._opener = null, this._tracked = !1, this._onDocKey = (t) => {
      t.key !== "Escape" || t.defaultPrevented || Xt[Xt.length - 1] !== this || (t.stopPropagation(), this.close());
    }, this._onKey = (t) => {
      t.key === "Escape" && (t.stopPropagation(), this.close());
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("keydown", this._onKey), this._release();
  }
  _track() {
    this._tracked || (this._tracked = !0, this._opener = Sn(), Xt.push(this), document.addEventListener("keydown", this._onDocKey));
  }
  /** Stops listening and gives the focus back to the element that opened the dialog. */
  _release() {
    if (!this._tracked) return;
    this._tracked = !1;
    const t = Xt.indexOf(this);
    t >= 0 && Xt.splice(t, 1), Xt.length || document.removeEventListener("keydown", this._onDocKey);
    const e = this._opener;
    this._opener = null, e != null && e.isConnected && e.focus({ preventScroll: !0 });
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
    t.has("open") && (this.open ? (this._track(), requestAnimationFrame(() => {
      var e;
      return (e = this.renderRoot.querySelector(".panel")) == null ? void 0 : e.focus();
    })) : this._release());
  }
  close() {
    this.open = !1, this._release(), this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0 }));
  }
  render() {
    var t, e;
    return this.open ? c`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : this.columns ? "columns" : ""}" role="dialog" aria-modal="true"
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
It.styles = V`
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
    @media (min-width: 768px) { .panel.columns { width: min(960px, calc(100vw - 32px)); } }
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
ae([
  v()
], It.prototype, "heading", 2);
ae([
  v({ type: Boolean, reflect: !0 })
], It.prototype, "open", 2);
ae([
  v({ type: Boolean })
], It.prototype, "wide", 2);
ae([
  v({ type: Boolean })
], It.prototype, "columns", 2);
ae([
  $()
], It.prototype, "_expanded", 2);
It = ae([
  J("wp-dialog")
], It);
const An = 10 * 6e4, Cn = 400, pt = /* @__PURE__ */ new Map(), pe = /* @__PURE__ */ new Map();
let li;
function En() {
  pt.clear(), pe.clear();
}
function Pn(t) {
  li !== void 0 && t.card_version !== li && En(), li = t.card_version;
  const e = /* @__PURE__ */ new Set();
  for (const i of t.programs)
    e.add(i.id), pe.get(i.id) !== i.revision && ys(i.id), pe.set(i.id, i.revision);
  for (const i of [...pe.keys()]) e.has(i) || (ys(i), pe.delete(i));
}
function ys(t) {
  const e = `${t}\0`;
  for (const i of [...pt.keys()]) i.startsWith(e) && pt.delete(i);
}
function ur(t, e, i, s, r, n = !0) {
  const o = [e, i, s, r ?? ""].join("\0"), l = Date.now(), a = pt.get(o);
  if (a && l - a.at < An) return a.promise;
  pt.size >= Cn && pt.delete(pt.keys().next().value);
  const d = t.callWS({
    type: "weekly_planner/preview",
    program_id: e,
    date: s,
    ...r && n ? { profile_id: r } : {}
  }).then((u) => u.slots);
  return pt.set(o, { at: l, promise: d }), d.catch(() => {
    var u;
    ((u = pt.get(o)) == null ? void 0 : u.promise) === d && pt.delete(o);
  }), d;
}
let je, kt;
const ee = /* @__PURE__ */ new Set();
let te, ue = 1e3, Re = 0;
function _r(t) {
  if (kt || !ee.size) return;
  const e = Re, i = t.connection.subscribeMessage((s) => {
    e === Re && (ue = 1e3, je = s, Pn(s), ee.forEach((r) => r(s)));
  }, { type: "weekly_planner/subscribe" });
  kt = i, i.catch(() => {
    kt !== i || e !== Re || (kt = void 0, ee.size && (te = setTimeout(() => {
      te = void 0, _r(t);
    }, ue), ue = Math.min(ue * 2, 3e4)));
  });
}
function mr(t, e) {
  return ee.add(e), je && e(je), te || _r(t), () => {
    ee.delete(e), !ee.size && (Re++, te && clearTimeout(te), te = void 0, ue = 1e3, kt == null || kt.then((i) => i()).catch(() => {
    }), kt = void 0, je = void 0);
  };
}
const Ut = (t) => t.split(".")[0];
function st(t, e) {
  var s;
  const i = ((s = e.status[t.id]) == null ? void 0 : s.active_profile) ?? t.active_profile;
  return t.profiles.find((r) => r.id === i) ?? t.profiles[0];
}
function _t(t, e) {
  var i;
  return ((i = t.states[e]) == null ? void 0 : i.attributes.friendly_name) ?? e;
}
const bs = (t) => t.normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").trim().toLowerCase();
function Ke(t, e) {
  const i = /* @__PURE__ */ new Set(), s = new Set(t.map((r) => r.id));
  for (const r of e) {
    if (s.has(r)) {
      i.add(r);
      continue;
    }
    const n = bs(String(r));
    if (n)
      for (const o of t) bs(o.name) === n && i.add(o.id);
  }
  return i;
}
function vs(t, e) {
  var n, o, l;
  if (e.program) {
    const a = Ke(t.programs, [e.program]);
    return t.programs.filter((d) => a.has(d.id));
  }
  const i = (n = e.filter) == null ? void 0 : n.types, s = (o = e.filter) == null ? void 0 : o.area, r = ((l = e.filter) == null ? void 0 : l.programs) === void 0 ? void 0 : Ke(t.programs, e.filter.programs);
  return t.programs.filter((a) => !(i != null && i.length) || a.entities.some((d) => i.includes(Ut(d.entity_id)))).filter((a) => !s || a.area === s).filter((a) => !r || r.has(a.id)).sort((a, d) => a.priority - d.priority || a.name.localeCompare(d.name));
}
function dt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
const $s = /* @__PURE__ */ new Map();
function bi(t, e) {
  let i = $s.get(t);
  return i || $s.set(t, i = new Intl.NumberFormat(t, { maximumFractionDigits: 1 })), i.format(e);
}
async function fr() {
  var t, e, i;
  if (customElements.get("ha-selector")) return !0;
  try {
    const s = await ((t = window.loadCardHelpers) == null ? void 0 : t.call(window)), r = await (s == null ? void 0 : s.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((i = (e = r == null ? void 0 : r.constructor) == null ? void 0 : e.getConfigElement) == null ? void 0 : i.call(e)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((n) => setTimeout(n, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const Mn = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let vi;
const di = /* @__PURE__ */ new Set();
async function Se(t, e) {
  const i = [...new Set(e)].filter((s) => !di.has(s));
  if (!i.length || !t.loadBackendTranslation) return !1;
  i.forEach((s) => di.add(s));
  try {
    const s = await Promise.all(i.map((r) => t.loadBackendTranslation("services", r)));
    return vi = s[s.length - 1] ?? vi, !0;
  } catch {
    return i.forEach((s) => di.delete(s)), !1;
  }
}
function Ti(t, e) {
  for (const i of [t.localize, vi]) {
    const s = i == null ? void 0 : i(e);
    if (s) return s;
  }
  return "";
}
const Ni = (t, e) => {
  var r, n;
  const [i, s] = e.split(".");
  return (n = (r = t.services) == null ? void 0 : r[i]) == null ? void 0 : n[s];
};
function Kt(t, e) {
  var r;
  const [i, s] = e.split(".");
  return Ti(t, `component.${i}.services.${s}.name`) || ((r = Ni(t, e)) == null ? void 0 : r.name) || e;
}
function $i(t, e) {
  var r;
  const [i, s] = e.split(".");
  return Ti(t, `component.${i}.services.${s}.description`) || ((r = Ni(t, e)) == null ? void 0 : r.description) || "";
}
function On(t, e, i) {
  const s = Array.isArray(t) ? t : t ? [t] : [], r = Number((e == null ? void 0 : e.attributes.supported_features) ?? 0);
  return s.some((n) => {
    var l;
    return (n.domain === void 0 ? [] : Array.isArray(n.domain) ? n.domain : [n.domain]).includes(i) ? (l = n.supported_features) != null && l.length ? n.supported_features.some((a) => Array.isArray(a) ? a.every((d) => (r & d) === d) : (r & a) === a) : !0 : !1;
  });
}
function Qe(t, e, i) {
  const s = Ut(e), r = t.states[e], n = [];
  for (const [o, l] of Object.entries(t.services ?? {}))
    if (o !== "homeassistant")
      for (const [a, d] of Object.entries(l)) {
        if (!d.target) continue;
        const u = d.target.entity, _ = !u || Array.isArray(u) && !u.length;
        if (!On(u, r, s) && !(o === s && _) || Object.values(d.fields ?? {}).some((b) => b.required && (!b.selector || "text" in b.selector || "object" in b.selector))) continue;
        const f = `${o}.${a}`;
        i !== void 0 && !i.includes(f) || n.push({ id: f, domain: o, service: a, label: Kt(t, f) });
      }
  return n.sort((o, l) => o.label.localeCompare(l.label));
}
function gr(t, e) {
  return [...new Set(Qe(t, e).map((i) => i.domain))];
}
function zn(t, e) {
  var r;
  const i = t.filter;
  if (!i || !e) return !0;
  const s = Number(e.attributes.supported_features ?? 0);
  if ((r = i.supported_features) != null && r.length && !i.supported_features.some((n) => (s & n) === n)) return !1;
  for (const [n, o] of Object.entries(i.attribute ?? {})) {
    const l = e.attributes[n];
    if (!(Array.isArray(l) ? l : [l]).some((d) => o.includes(d))) return !1;
  }
  return !0;
}
function ji(t, e, i) {
  var d, u;
  const [s, r] = e.split("."), n = i ? t.states[i] : void 0, o = ((d = t.services) == null ? void 0 : d[s]) ?? {}, l = [], a = (_) => {
    var m;
    for (const [f, b] of Object.entries(_ ?? {})) {
      if (b.fields) {
        a(b.fields);
        continue;
      }
      b.advanced || Mn.has(f) || (m = b.selector) != null && m.target || !zn(b, n) || !b.required && r !== `set_${f}` && `set_${f}` in o || l.push({
        key: f,
        selector: b.selector ?? { text: {} },
        // The mode of a "set mode" service is always needed, whatever the description says.
        required: !!b.required || s === "climate" && r === `set_${f}` && f in Ri,
        default: b.default,
        label: Ti(t, `component.${s}.services.${r}.fields.${f}.name`) || b.name || f
      });
    }
  };
  return a((u = Ni(t, e)) == null ? void 0 : u.fields), l.length && !l.some((_) => _.required) && (l[0] = { ...l[0], required: !0 }), [...l.filter((_) => _.required), ...l.filter((_) => !_.required)];
}
function In(t, e, i) {
  var n;
  const s = ((n = t.states[i]) == null ? void 0 : n.attributes) ?? {}, r = {};
  for (const o of ji(t, e, i)) {
    if (!o.required) continue;
    const l = o.selector.number;
    o.default !== void 0 ? r[o.key] = o.default : o.key === "temperature" ? r[o.key] = typeof s.temperature == "number" ? s.temperature : 19 : l && (r[o.key] = o.key === "position" ? 50 : l.min ?? 0);
  }
  return r;
}
function Dn(t, e, i, s, r) {
  return ji(t, e, s).filter((n) => r != null && r[n.key] ? !r[n.key].entity_id : n.required && ((i == null ? void 0 : i[n.key]) === void 0 || i[n.key] === "" || i[n.key] === null)).map((n) => n.label);
}
const Ri = {
  hvac_mode: "hvac_modes",
  preset_mode: "preset_modes",
  fan_mode: "fan_modes",
  swing_mode: "swing_modes",
  swing_horizontal_mode: "swing_horizontal_modes"
};
function Tn(t, e, i) {
  const s = i.selector, r = s.state;
  if (!r && !s.select) return;
  const n = (r == null ? void 0 : r.attribute) ?? Ri[i.key], o = t.states[e], l = n ? o == null ? void 0 : o.attributes[n] : void 0;
  if (!Array.isArray(l) || !l.length) return;
  const a = t, d = n.replace(/_list$/, "").replace(/s$/, "");
  return l.map((u) => {
    var f, b;
    const _ = String(u);
    let m = "";
    try {
      m = i.key === "hvac_mode" ? ((f = a.formatEntityState) == null ? void 0 : f.call(a, o, _)) ?? "" : ((b = a.formatEntityAttributeValue) == null ? void 0 : b.call(a, o, d, _)) ?? "";
    } catch {
      m = "";
    }
    return { value: _, label: m || _ };
  });
}
const Le = [
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
function Nn(t) {
  const e = new Set(t.map((i) => i.color.toLowerCase()));
  return Le.find((i) => !e.has(i)) ?? Le[t.length % Le.length];
}
const F = (t, e) => e ? t.labels.find((i) => i.id === e) : void 0, jn = /^[a-z0-9_]+\.[a-z0-9_]+$/;
function rt(t, e) {
  if (!jn.test(e.name)) return e.name;
  const i = Kt(t, e.name);
  if (i !== e.name) return i;
  const s = e.name.split(".")[1].replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function Rn(t, e) {
  return Object.values(t.states).filter((i) => i.entity_id.startsWith("scene.") && Array.isArray(i.attributes.entity_id) && i.attributes.entity_id.includes(e)).sort((i, s) => String(i.attributes.friendly_name ?? i.entity_id).localeCompare(String(s.attributes.friendly_name ?? s.entity_id)));
}
const Ve = (t, e) => {
  var s;
  const i = t == null ? void 0 : t.entities.find((r) => r.entity_id === e);
  return i != null && i.restrict_services || (s = i == null ? void 0 : i.allowed_services) != null && s.length ? i.allowed_services ?? [] : void 0;
};
function yr(t, e, i, s) {
  var n;
  if (i.kind === "scene") {
    const o = (n = t.states[i.scene]) == null ? void 0 : n.attributes.entity_id;
    return Array.isArray(o) ? o.includes(e) : !0;
  }
  if (s !== void 0 && !s.includes(i.service)) return !1;
  const r = i.target_entity_id ?? e;
  return r ? i.service.split(".")[0] === r.split(".")[0] ? !0 : Qe(t, r).some((o) => o.id === i.service) : !1;
}
function Li(t, e, i, s) {
  return e.labels.filter((r) => i.some((n) => yr(t, n, r.action, Ve(s, n))));
}
function St(t, e, i) {
  var r, n;
  return i ? ((n = (r = t.entities.find((o) => o.entity_id === e)) == null ? void 0 : r.label_overrides) == null ? void 0 : n[i.id]) ?? i.action : void 0;
}
const Ln = (t, e, i) => {
  var s, r;
  return !!((r = (s = t.entities.find((n) => n.entity_id === e)) == null ? void 0 : s.label_overrides) != null && r[i]);
}, ie = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function ws(t) {
  var i, s, r;
  if (!t || t.kind !== "service" || t.target_entity_id) return null;
  const e = t.data ?? {};
  return ie((i = t.data_sources) != null && i.temperature ? null : e.temperature) ?? ie((s = t.data_sources) != null && s.position ? null : e.position) ?? ie((r = t.data_sources) != null && r.brightness_pct ? null : e.brightness_pct);
}
function Je(t, e, i) {
  var r, n;
  if (!i) return "";
  if (i.kind === "scene") return String(((r = t.states[i.scene]) == null ? void 0 : r.attributes.friendly_name) ?? i.scene);
  if (i.target_entity_id) return `${Kt(t, i.service)} · ${((n = t.states[i.target_entity_id]) == null ? void 0 : n.attributes.friendly_name) ?? i.target_entity_id}`;
  if (Object.keys(i.data_sources ?? {}).length) return br(t, i);
  const s = i.data ?? {};
  return ie(s.temperature) !== null ? `${bi(e, Number(s.temperature))} °C` : ie(s.position) !== null ? `${s.position} %` : ie(s.brightness_pct) !== null ? `${s.brightness_pct} %` : Kt(t, i.service);
}
function br(t, e) {
  return Object.values(e.data_sources ?? {}).map((i) => {
    const s = t.states[i.entity_id], r = String((s == null ? void 0 : s.attributes.friendly_name) ?? i.entity_id), n = i.attribute ? s == null ? void 0 : s.attributes[i.attribute] : s == null ? void 0 : s.state, o = s && !["unknown", "unavailable"].includes(s.state) && n !== void 0 && n !== null;
    return `${r}${i.attribute ? ` · ${i.attribute}` : ""}${o && ["string", "number", "boolean"].includes(typeof n) ? ` (${n})` : ""}`;
  }).join(" · ");
}
function Bn(t, e, i, s) {
  var a, d;
  if (!i) return "";
  if (i.kind === "scene") return Je(t, e, i);
  const r = [], n = i.target_entity_id ?? s, o = n ? t.states[n] : void 0, l = t.formatEntityState;
  for (const [u, _] of Object.entries(i.data ?? {}))
    if (!((a = i.data_sources) != null && a[u])) {
      if (typeof _ == "number")
        r.push(u === "temperature" ? `${bi(e, _)} °C` : u === "position" || u === "brightness_pct" ? `${_} %` : bi(e, _));
      else if (typeof _ == "string" && _) {
        let m = _;
        try {
          u === "hvac_mode" && o && l && (m = l(o, _) || _);
        } catch {
          m = _;
        }
        r.push(m);
      }
    }
  return Object.keys(i.data_sources ?? {}).length && r.push(br(t, i)), [Kt(t, i.service), ...i.target_entity_id ? [String(((d = t.states[i.target_entity_id]) == null ? void 0 : d.attributes.friendly_name) ?? i.target_entity_id)] : [], ...r].join(" · ");
}
function xs(t, e) {
  return t.programs.filter((i) => i.entities.some((s) => s.default_label === e || e in (s.label_overrides ?? {})) || i.profiles.some((s) => s.days.some((r) => r.some((n) => n.label === e)))).map((i) => i.name);
}
function Bi(t) {
  for (const e of t.querySelectorAll("select[data-value]")) {
    const i = e.dataset.value ?? "";
    e.value !== i && (e.value = i);
  }
}
var qn = Object.defineProperty, Un = Object.getOwnPropertyDescriptor, lt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Un(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && qn(e, i, r), r;
};
const Gt = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? (t == null ? void 0 : t.language) ?? "en";
}, $t = V`
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
  .error { color: var(--error-color, #db4437); color: color-mix(in srgb, var(--error-color, #db4437) 65%, var(--primary-text-color, #000));
    font-size: 16px; font-weight: 500; margin: 8px 0; }
  .field-error { margin: 2px 0 4px; }
  input[aria-invalid="true"] { border-color: var(--error-color, #db4437); border-width: 2px; }
  .hint { display: flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; color: var(--secondary-text-color); font-size: 12px; margin: 4px 0; }
  .card {
    border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 12px; margin: 8px 0;
  }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .grow { flex: 1; min-width: 0; }
`;
function vr(t, e, i) {
  t.dispatchEvent(new CustomEvent(e, { detail: i, bubbles: !0, composed: !0 }));
}
let ht = class extends U {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.disabled = !1, this.required = !1, this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var t;
    return Object.keys(((t = this.hass) == null ? void 0 : t.states) ?? {}).filter((e) => !this.domains.length || this.domains.includes(Ut(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
  }
  _emit(t) {
    vr(this, "wp-change", t);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const e = this.filter;
      return c`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label} .disabled=${this.disabled} .required=${this.required}
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
        ${this.label ? c`<label>${this.label}</label>` : p}
        <input type="text" ?disabled=${this.disabled} ?required=${this.required} list=${this._listId} .value=${this.value} autocomplete="off"
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
          ${t.map((e) => c`<option value=${e}>${_t(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
  }
};
ht.styles = [$t, V`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
lt([
  v({ attribute: !1 })
], ht.prototype, "hass", 2);
lt([
  v()
], ht.prototype, "value", 2);
lt([
  v()
], ht.prototype, "label", 2);
lt([
  v({ type: Boolean })
], ht.prototype, "disabled", 2);
lt([
  v({ type: Boolean })
], ht.prototype, "required", 2);
lt([
  v({ attribute: !1 })
], ht.prototype, "domains", 2);
lt([
  v({ attribute: !1 })
], ht.prototype, "exclude", 2);
lt([
  v({ attribute: !1 })
], ht.prototype, "filter", 2);
ht = lt([
  J("wp-entity-picker")
], ht);
let we = class extends U {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return Gt(this.hass);
  }
  _tr(t) {
    return h(this._lang, t);
  }
  _set(t) {
    vr(this, "wp-change", t);
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
we.styles = $t;
lt([
  v({ attribute: !1 })
], we.prototype, "hass", 2);
lt([
  v({ attribute: !1 })
], we.prototype, "conditions", 2);
we = lt([
  J("wp-conditions-editor")
], we);
var Hn = Object.defineProperty, Fn = Object.getOwnPropertyDescriptor, Yt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Fn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Hn(e, i, r), r;
};
let bt = class extends U {
  constructor() {
    super(...arguments), this.entityId = "", this.action = null, this.disabled = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return Gt(this.hass);
  }
  get _targetEntity() {
    var t;
    return ((t = this.action) == null ? void 0 : t.kind) === "service" ? this.action.target_entity_id ?? this.entityId : this.entityId;
  }
  _setTarget(t) {
    var e;
    ((e = this.action) == null ? void 0 : e.kind) === "service" && this.action.target_entity_id === t || this._emit({ kind: "service", service: "", ...t !== void 0 ? { target_entity_id: t } : {} });
  }
  updated() {
    Bi(this.renderRoot), !(!this.hass || !this._targetEntity || this._loadedFor === this._targetEntity) && (this._loadedFor = this._targetEntity, Se(this.hass, gr(this.hass, this._targetEntity)).then((t) => t && this.requestUpdate()), this._selector || fr().then((t) => this._selector = t));
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
  _sourceType(t) {
    var i;
    const e = (i = t.selector.select) == null ? void 0 : i.multiple;
    return t.selector.number ? "number" : t.selector.boolean ? "boolean" : e ? "native" : t.selector.text || t.selector.select ? "string" : "native";
  }
  _setSource(t, e) {
    var r;
    if (((r = this.action) == null ? void 0 : r.kind) !== "service") return;
    const i = { ...this.action.data_sources }, s = { ...this.action.data };
    e ? (i[t] = e, delete s[t]) : delete i[t], this._emit({ ...this.action, data: s, data_sources: i });
  }
  _field(t, e) {
    var a, d;
    const i = ((a = this.action) == null ? void 0 : a.kind) === "service" ? (d = this.action.data_sources) == null ? void 0 : d[t.key] : void 0, s = i ? this.hass.states[i.entity_id] : void 0, r = i != null && i.attribute ? s == null ? void 0 : s.attributes[i.attribute] : s == null ? void 0 : s.state, o = s && !["unknown", "unavailable"].includes(s.state) && r !== void 0 && r !== null ? typeof r == "object" ? JSON.stringify(r) : String(r) : h(this._lang, "value_unavailable"), l = [.../* @__PURE__ */ new Set([...Object.keys((s == null ? void 0 : s.attributes) ?? {}), ...i != null && i.attribute ? [i.attribute] : []])].sort();
    return c`<div class="source-field">
      <div class="field"><label for=${`source-${t.key}`}>${t.label}</label>
        <select id=${`source-${t.key}`} data-value=${i ? "entity" : "fixed"} ?disabled=${this.disabled}
          @change=${(u) => this._setSource(t.key, u.target.value === "entity" ? { entity_id: "", type: this._sourceType(t) } : void 0)}>
          <option value="fixed">${h(this._lang, "value_fixed")}</option>
          <option value="entity">${h(this._lang, "value_entity")}</option>
        </select></div>
      ${i ? c`<wp-entity-picker .hass=${this.hass} .value=${i.entity_id} .label=${h(this._lang, "value_source")}
          .disabled=${this.disabled}
          @wp-change=${(u) => {
      u.stopPropagation(), this._setSource(t.key, { ...i, entity_id: u.detail });
    }}></wp-entity-picker>
        <div class="field"><label for=${`attribute-${t.key}`}>${h(this._lang, "value_read")}</label>
          <select id=${`attribute-${t.key}`} data-value=${i.attribute ?? ""} ?disabled=${this.disabled}
            @change=${(u) => {
      const _ = u.target.value;
      this._setSource(t.key, { entity_id: i.entity_id, type: i.type, ..._ ? { attribute: _ } : {} });
    }}>
            <option value="">${h(this._lang, "value_state")}</option>
            ${l.map((u) => c`<option value=${u}>${u}</option>`)}
          </select></div>
        ${i.entity_id ? c`<p class="hint" role="status">${h(this._lang, "value_current", { value: o })}</p>` : p}
        <p class="hint">${h(this._lang, "value_at_execution")}</p>` : this._selector ? c`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(t)} .context=${this._context(t)} .value=${e[t.key]} .label=${t.label}
            .required=${t.required} ?disabled=${this.disabled}
            @value-changed=${(u) => {
      u.stopPropagation(), this._setData(t.key, u.detail.value);
    }}></ha-selector>` : c`<div class="field"><label>${t.label}</label><input type="text" .value=${String(e[t.key] ?? "")} ?disabled=${this.disabled}
            @change=${(u) => this._setData(t.key, u.target.value)} /></div>`}
    </div>`;
  }
  /** Context of Home Assistant's service control: the entity the field is about, and the attribute to list. */
  _context(t) {
    const e = t.selector.state;
    return {
      filter_entity: [this._targetEntity],
      filter_target: { entity_id: [this._targetEntity] },
      entity_id: this._targetEntity,
      filter_attribute: (e == null ? void 0 : e.attribute) ?? Ri[t.key]
    };
  }
  /** Selector of a field; a list of the device (modes, presets…) is built from its attribute when it has one. */
  _selectorOf(t) {
    const e = Tn(this.hass, this._targetEntity, t);
    return e ? { select: { options: e, mode: "dropdown" } } : t.selector;
  }
  render() {
    var u, _, m, f, b, x, E;
    if (!this.hass) return p;
    const t = this._lang, e = ((u = this.action) == null ? void 0 : u.kind) === "service" && this.action.target_entity_id !== void 0, i = this._targetEntity, s = ((_ = this.action) == null ? void 0 : _.kind) === "service" ? this.action.service : "", r = i ? Qe(this.hass, i, this.allowed !== void 0 && s ? [...this.allowed, s] : this.allowed) : [];
    if (s && !r.some((k) => k.id === s)) {
      const [k, A] = s.split(".");
      r.push({ id: s, domain: k, service: A, label: Kt(this.hass, s) });
    }
    const n = ((m = this.action) == null ? void 0 : m.kind) === "service" ? this.action.data ?? {} : {}, o = s ? ji(this.hass, s, i) : [], l = e ? [] : Rn(this.hass, this.entityId), a = ((f = this.action) == null ? void 0 : f.kind) === "scene" ? this.action.scene : s, d = s ? $i(this.hass, s) || h(t, "action_no_description") : ((b = this.action) == null ? void 0 : b.kind) === "scene" ? h(t, "action_scene_description") : "";
    return c`
      <div class="field"><label for="action-target-mode">${h(t, "action_target")}</label>
        <select id="action-target-mode" data-value=${e ? "other" : "device"} ?disabled=${this.disabled}
          @change=${(k) => this._setTarget(k.target.value === "other" ? "" : void 0)}>
          <option value="device">${h(t, "action_target_device")}</option>
          <option value="other">${h(t, "action_target_other")}</option>
        </select></div>
      ${e ? c`<wp-entity-picker .hass=${this.hass} .value=${i} .disabled=${this.disabled} .label=${h(t, "action_target_entity")}
        @wp-change=${(k) => {
      k.stopPropagation(), this._setTarget(k.detail);
    }}></wp-entity-picker>
        <p class="hint">${h(t, "action_target_hint")}</p>` : p}
      ${((x = this.allowed) == null ? void 0 : x.length) === 0 ? c`<p class="hint" role="status">${h(t, "action_none_allowed")}</p>` : p}
      <label class="action-label" for="action">${h(t, "action")}</label>
      <select id="action" data-value=${a || ""} aria-describedby="action-description" ?disabled=${this.disabled || !i}
        @change=${(k) => {
      const A = k.target.value;
      A && (A.startsWith("scene.") ? this._emit({ kind: "scene", scene: A }) : this._emit({ kind: "service", service: A, ...e ? { target_entity_id: i } : {}, data: In(this.hass, A, i) }));
    }}>
        <option value="" disabled ?selected=${!a}>${h(t, "action_choose")}</option>
        ${r.map((k) => c`<option value=${k.id} ?selected=${k.id === s}
          title=${$i(this.hass, k.id) || h(t, "action_no_description")}>${k.label}</option>`)}
        ${((E = this.action) == null ? void 0 : E.kind) === "scene" && !l.some((k) => k.entity_id === a) ? c`<option value=${a} selected>${a}</option>` : p}
        ${l.map((k) => c`<option value=${k.entity_id} ?selected=${k.entity_id === a}
          title=${h(t, "action_scene_description")}>${String(k.attributes.friendly_name ?? k.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${d}</p>
      ${o.map((k) => this._field(k, n))}`;
  }
};
bt.styles = [$t, V`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 14px; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 14px;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
Yt([
  v({ attribute: !1 })
], bt.prototype, "hass", 2);
Yt([
  v({ attribute: "entity-id" })
], bt.prototype, "entityId", 2);
Yt([
  v({ attribute: !1 })
], bt.prototype, "action", 2);
Yt([
  v({ type: Boolean })
], bt.prototype, "disabled", 2);
Yt([
  v({ attribute: !1 })
], bt.prototype, "allowed", 2);
Yt([
  $()
], bt.prototype, "_selector", 2);
bt = Yt([
  J("wp-action-picker")
], bt);
var Wn = Object.defineProperty, Kn = Object.getOwnPropertyDescriptor, B = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Kn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Wn(e, i, r), r;
};
let T = class extends U {
  constructor() {
    super(...arguments), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this.readonlySettings = !1, this.embedded = !1, this._form = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._ov = {}, this._error = "", this._saving = !1, this._valueFor = null, this._confirmDel = !1, this._delError = "", this._loaded = "";
  }
  get _lang() {
    return Gt(this.hass);
  }
  _emit(t, e) {
    this.dispatchEvent(new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }));
  }
  updated() {
    var i;
    const t = (i = F(this.data, this.value)) == null ? void 0 : i.action, e = (t == null ? void 0 : t.kind) === "service" ? t.service.split(".")[0] : "";
    !this.hass || !e || this._loaded === e || (this._loaded = e, Se(this.hass, [e]).then((s) => s && this.requestUpdate()));
  }
  /** Opens the form on the chosen label (a pencil), or on a new one. */
  _open(t) {
    const e = t ? F(this.data, this.value) : void 0;
    t && !e || (this._form = !0, this._editId = (e == null ? void 0 : e.id) ?? null, this._name = (e == null ? void 0 : e.name) ?? "", this._color = (e == null ? void 0 : e.color) ?? Nn(this.data.labels), this._action = e ? structuredClone(e.action) : null, this._ov = {}, this._valueFor = null, this._error = "", this._changed());
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
    return this._name.trim() ? !this._action || this._action.kind === "service" && (!this._action.service || this._action.target_entity_id === "") ? h(t, "lb_err_action") : this._action.kind === "service" && Dn(this.hass, this._action.service, this._action.data, this._action.target_entity_id ?? this.entityIds[0], this._action.data_sources).length ? h(t, "lb_err_fields") : "" : h(t, "lb_err_name");
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
            const l = e.filter(([d]) => d === o.entity_id);
            if (!l.length) return o;
            const a = { ...o.label_overrides ?? {} };
            for (const [, d] of l)
              d ? a[t] = d : delete a[t];
            return { ...o, label_overrides: a };
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
  /** Deletes the chosen label for everyone (the server refuses while a program uses it). */
  async _delete(t) {
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: t.id }), this._confirmDel = !1, this._delError = "", this._form = !1, this._changed(), this._emit("label-change", null);
    } catch (e) {
      const i = e;
      this._delError = (i == null ? void 0 : i.code) === "in_use" ? h(this._lang, "lb_delete_used", { name: rt(this.hass, t), programs: i.message || "" }) : (i == null ? void 0 : i.code) === "unauthorized" ? h(this._lang, "err_unauthorized") : h(this._lang, "lb_err_delete");
    } finally {
      this._saving = !1;
    }
  }
  _renderDelete(t) {
    const e = this._lang, i = rt(this.hass, t), s = xs(this.data, t.id), r = s.length > 0 || !!this._delError, n = this._delError || (s.length ? h(e, "lb_delete_used", { name: i, programs: s.join(", ") }) : h(e, "lb_delete_ask", { name: i }));
    return c`<div class="delbox" role="alert">
      <p class="${r ? "err" : ""}">${n}</p>
      <div class="btns">
        ${r ? p : c`<button class="btn danger-line" ?disabled=${this._saving || this.disabled} @click=${() => void this._delete(t)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${h(e, "delete")}</button>`}
        <button class="btn" @click=${() => {
      this._confirmDel = !1, this._delError = "";
    }}>${h(e, r ? "close" : "cancel")}</button>
      </div>
    </div>`;
  }
  _choose(t) {
    this._confirmDel = !1, this._delError = "", this._form && (this._form = !1, this._changed()), this._emit("label-change", t);
  }
  /** "Value for this device" inside the form: the action of the label for this device only. */
  _valueEditor(t, e) {
    const i = this._lang, s = this._ownValue(t, e), r = this._valueFor === t;
    return c`<div class="dev">
      <button class="link ${s ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${r}
        @click=${() => this._valueFor = r ? null : t}>${h(i, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${_t(this.hass, t)}` : ""}</button>
      ${r ? c`<div class="valbox">
        <wp-action-picker .hass=${this.hass} entity-id=${t} .allowed=${Ve(this.program, t)}
          .action=${s ?? this._action} ?disabled=${this.disabled}
          @action-change=${(n) => {
      n.stopPropagation(), this._ov = { ...this._ov, [t]: n.detail }, this._error = "", this._changed();
    }}></wp-action-picker>
        ${s ? c`<button class="btn" ?disabled=${this.disabled}
          @click=${() => {
      this._ov = { ...this._ov, [t]: null }, this._changed();
    }}>
          <ha-icon icon="mdi:undo"></ha-icon>${h(i, "lb_common_value")}</button>` : p}
      </div>` : p}
    </div>`;
  }
  _renderForm() {
    const t = this._lang;
    return c`<div class="form">
      <div class="field"><label for="lb-name">${h(t, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e) => this._set({ name: e.target.value })} /></div>
      <div class="swatches" role="radiogroup" aria-label=${h(t, "lb_color")}>
        ${Le.map((e) => c`<button class="sw ${e === this._color ? "on" : ""}" role="radio" aria-checked=${e === this._color}
          aria-label=${e} style="background:${e}" @click=${() => this._set({ color: e })}></button>`)}
      </div>
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${Ve(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled}
        @action-change=${(e) => {
      e.stopPropagation(), this._set({ action: e.detail });
    }}></wp-action-picker>
      ${this._editId ? this.entityIds.map((e) => this._valueEditor(e, this._editId)) : p}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
      ${this.embedded ? p : c`<div class="btns">
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
          <i class="dot" style="background:${t.color}"></i><b>${rt(this.hass, t)}</b>
          ${xs(this.data, t.id).some((i) => i !== this.program.name) ? c`<span class="shared">${h(e, "shared")}</span>` : p}
          ${this.readonlySettings ? p : c`<button class="pen ${this._form ? "on" : ""}" aria-label=${h(e, "rename_label")} title=${h(e, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => this._form && this._editId ? this._close() : this._open(!0)}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="pen ${this._confirmDel ? "on" : ""}" aria-label=${h(e, "lb_delete")} title=${h(e, "lb_delete")}
            aria-expanded=${this._confirmDel} ?disabled=${this.disabled}
            @click=${() => {
      this._confirmDel = !this._confirmDel, this._delError = "";
    }}><ha-icon icon="mdi:delete-outline"></ha-icon></button>`}
        </div>
        ${this._confirmDel && !this.readonlySettings ? this._renderDelete(t) : p}
        ${this._form && !this.readonlySettings ? p : c`
          <div class="sum"><span class="what">${Bn(this.hass, e, t.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((i) => {
      const s = Ln(this.program, i, t.id) ? St(this.program, i, t) : void 0;
      return s ? c`<div class="sum"><span class="k">${h(e, "lb_value_here")} :</span>
              <span class="what">${Je(this.hass, e, s)}</span>
              ${this.entityIds.length > 1 ? c`<span class="who">${_t(this.hass, i)}</span>` : p}</div>` : p;
    })}`}
        ${this._form && this._editId && !this.readonlySettings ? this._renderForm() : p}
      </div>`;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const t = this._lang, e = Li(this.hass, this.data, this.entityIds, this.program), i = F(this.data, this.value), s = (r, n, o, l) => c`
      <button class="chip ${n ? "on" : ""}" role="radio" aria-checked=${n} ?disabled=${this.disabled} @click=${o}>
        ${l ? c`<i class="dot" style="background:${l}"></i>` : p}<span>${r}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${h(t, "action")}>
        ${this.allowNone ? s(h(t, "rest_none"), this.value === null, () => this._choose(null)) : p}
        ${e.map((r) => s(rt(this.hass, r), r.id === this.value, () => this._choose(r.id), r.color))}
        ${this.value && !i ? s("?", !0, () => {
    }) : p}
        ${this.compact || this.readonlySettings ? p : c`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => this._form && !this._editId ? this._close() : this._open(!1)}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${h(t, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId && !this.readonlySettings ? this._renderForm() : p}
      ${i && !(this._form && !this._editId && !this.readonlySettings) ? this._renderDetails(i) : p}`;
  }
};
T.styles = [$t, V`
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
    .delbox p { margin: 4px 0 0; }
    .delbox .btns { margin-top: 8px; }
    .danger-line { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
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
B([
  v({ attribute: !1 })
], T.prototype, "hass", 2);
B([
  v({ attribute: !1 })
], T.prototype, "data", 2);
B([
  v({ attribute: !1 })
], T.prototype, "program", 2);
B([
  v({ attribute: !1 })
], T.prototype, "entityIds", 2);
B([
  v({ attribute: !1 })
], T.prototype, "value", 2);
B([
  v({ type: Boolean, attribute: "allow-none" })
], T.prototype, "allowNone", 2);
B([
  v({ type: Boolean })
], T.prototype, "disabled", 2);
B([
  v({ type: Boolean })
], T.prototype, "compact", 2);
B([
  v({ type: Boolean, attribute: "readonly-settings" })
], T.prototype, "readonlySettings", 2);
B([
  v({ type: Boolean })
], T.prototype, "embedded", 2);
B([
  $()
], T.prototype, "_form", 2);
B([
  $()
], T.prototype, "_editId", 2);
B([
  $()
], T.prototype, "_name", 2);
B([
  $()
], T.prototype, "_color", 2);
B([
  $()
], T.prototype, "_action", 2);
B([
  $()
], T.prototype, "_ov", 2);
B([
  $()
], T.prototype, "_error", 2);
B([
  $()
], T.prototype, "_saving", 2);
B([
  $()
], T.prototype, "_valueFor", 2);
B([
  $()
], T.prototype, "_confirmDel", 2);
B([
  $()
], T.prototype, "_delError", 2);
T = B([
  J("wp-label-picker")
], T);
var Vn = Object.defineProperty, Jn = Object.getOwnPropertyDescriptor, Ae = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Jn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Vn(e, i, r), r;
};
let Vt = class extends U {
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
    const t = Z(this.lang);
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
Vt.styles = V`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
Ae([
  v()
], Vt.prototype, "message", 2);
Ae([
  v({ attribute: "confirm-label" })
], Vt.prototype, "confirmLabel", 2);
Ae([
  v({ attribute: "cancel-label" })
], Vt.prototype, "cancelLabel", 2);
Ae([
  v()
], Vt.prototype, "lang", 2);
Vt = Ae([
  J("wp-confirm")
], Vt);
function Et(t, e, i, s = "") {
  return new Promise((r) => {
    var l;
    const n = document.createElement("wp-confirm");
    n.message = e, n.confirmLabel = i, n.cancelLabel = s;
    const o = t.hass;
    n.lang = ((l = o == null ? void 0 : o.locale) == null ? void 0 : l.language) ?? (o == null ? void 0 : o.language) ?? (document.documentElement.lang || "en"), n.addEventListener("choice", (a) => {
      n.remove(), r(!!a.detail);
    }), (t.shadowRoot ?? t).appendChild(n);
  });
}
const $r = " ", Ge = (t) => t.replace(/ /g, $r), ci = (t, e) => JSON.stringify(t) === JSON.stringify(e), Gn = (t, e) => {
  const i = Math.abs(e), s = i < 60 ? `${i} min` : i % 60 ? `${Math.floor(i / 60)} h ${String(i % 60).padStart(2, "0")}` : `${i / 60} h`;
  return `${e > 0 ? "+" : "−"}${s}`;
};
function _e(t, e, i) {
  const s = e.random_minutes ? ` · ${h(t, "random_window", { n: String(e.random_minutes) })}` : "";
  if ("time" in e) {
    const [o, l] = e.time.split(":").map(Number);
    return Ge((o * 60 + l >= C ? "24 h" : mt(t, o * 60 + l)) + s);
  }
  const r = h(t, e.sun === "sunrise" || e.sun === "sunset" ? `sun_${e.sun}_short` : `sun_${e.sun}`), n = e.offset ? ` ${Gn(t, e.offset)}` : "";
  return Ge(`${r}${n}${s}`);
}
function ks(t, e) {
  if ("time" in t) {
    const [i, s] = t.time.split(":").map(Number), r = Math.max(0, Math.min(C, Math.round((i * 60 + s + e) / We) * We));
    return { ...t, time: r >= C ? "24:00" : `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}` };
  }
  return { ...t, offset: Math.max(-240, Math.min(240, (t.offset ?? 0) + e)) };
}
const wr = [0, 1, 2, 3, 4], xr = [5, 6], xe = [0, 1, 2, 3, 4, 5, 6];
function Yn(t, e, i) {
  const s = [...i].sort((r, n) => r - n);
  return ci(s, xe) ? h(t, "all_days_text") : ci(s, wr) ? `${e[0]}–${e[4]}` : ci(s, xr) ? h(t, "weekend") : s.map((r) => e[r]).join($r);
}
function wi(t) {
  if (Array.isArray(t)) return `[${t.map(wi).join(",")}]`;
  if (t && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((i) => `${JSON.stringify(i)}:${wi(e[i])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function xi(t) {
  const { id: e, ...i } = t;
  return wi({ ...i, conditions: t.conditions ?? [], end: t.end ?? null, color: t.color ?? null });
}
function qi(t, e, i) {
  const s = /* @__PURE__ */ new Map();
  return t.days.forEach((r, n) => {
    for (const o of r) {
      if (!e(o)) continue;
      const l = xi(o);
      let a = s.get(l);
      if (a && a.days.includes(n)) {
        a = void 0, s.set(`${l}#${o.id}`, { slot: o, days: [n], ids: { [n]: o.id } });
        continue;
      }
      a || (a = { slot: o, days: [], ids: {} }, s.set(l, a)), a.days.push(n), a.ids[n] = o.id;
    }
  }), [...s.values()].sort(
    (r, n) => i(r.slot.start) - i(n.slot.start) || r.days[0] - n.days[0]
  );
}
function Xn(t, e, i, s) {
  const r = t.days.map((n) => n.filter((o) => !i(o)));
  for (const n of e)
    for (const o of n.days)
      r[o].push({ ...structuredClone(n.slot), id: n.ids[o] ?? dt() });
  return { ...t, days: r.map((n) => n.sort((o, l) => s(o.start) - s(l.start))) };
}
const Qn = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Zn = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function xt(t, e) {
  var r;
  if ("time" in e) return G(e.time);
  const i = (r = t.states["sun.sun"]) == null ? void 0 : r.attributes[Qn[e.sun]];
  let s = i ? ut(i, t.config.time_zone) : Zn[e.sun];
  return s += e.offset ?? 0, e.earliest && (s = Math.max(s, G(e.earliest))), e.latest && (s = Math.min(s, G(e.latest))), Math.max(0, Math.min(C, s));
}
const to = 240;
function Ss(t, e, i) {
  const s = e.random_minutes ? { random_minutes: e.random_minutes } : {};
  if ("time" in e) return { ...e, time: Wt(Math.max(0, Math.min(C, G(e.time) + i))) };
  const r = (e.offset ?? 0) + i;
  return Math.abs(r) <= to ? { ...e, offset: r } : { time: Wt(Math.max(0, Math.min(C, xt(t, e) + i))), ...s };
}
function ki(t) {
  return !!(t && "sun" in t && t.earliest && t.latest && G(t.earliest) > G(t.latest));
}
function eo(t) {
  const e = zt(t.start);
  if (e === null || !t.end) return null;
  const i = zt(t.end);
  return i === null ? null : i > e ? [e, i] : [e, C];
}
function kr(t) {
  var r, n;
  const e = t.map((o) => ({ slot: o, iv: eo(o) })).filter((o) => o.iv !== null).sort((o, l) => o.iv[0] - l.iv[0]);
  let i = ((r = e[0]) == null ? void 0 : r.iv[1]) ?? 0, s = (n = e[0]) == null ? void 0 : n.slot;
  for (let o = 1; o < e.length; o++) {
    if (e[o].iv[0] < i) return [s, e[o].slot];
    e[o].iv[1] > i && (i = e[o].iv[1], s = e[o].slot);
  }
  return null;
}
const As = (t) => t.ids[t.days[0]], Sr = (t, e) => e !== null && Object.values(t.ids).includes(e);
function io(t, e, i, s) {
  return qi(t, e, i).find((r) => Sr(r, s)) ?? null;
}
function so(t, e) {
  return t ? xi(t.slot) !== xi(e.slot) ? "changed" : JSON.stringify(t.days) === JSON.stringify(e.days) && JSON.stringify(t.ids) === JSON.stringify(e.ids) ? "same" : "days" : "gone";
}
function Cs(t, e) {
  const { [e]: i, ...s } = t.ids;
  return {
    draft: { slot: structuredClone(t.slot), days: [e], ids: i ? { [e]: i } : {} },
    rest: { slot: structuredClone(t.slot), days: t.days.filter((r) => r !== e), ids: s }
  };
}
function ro(t, e) {
  if (!t) return [];
  const i = t.days.filter((r) => !e.includes(r)), s = Object.fromEntries(i.filter((r) => t.ids[r]).map((r) => [r, t.ids[r]]));
  return i.length ? [{ ...t, days: i, ids: s }] : [];
}
function Qt(t, e, i, s) {
  var n;
  const r = qi(t, e, i).filter((o) => !Sr(o, s.openId));
  return r.push(...ro(s.rest, ((n = s.draft) == null ? void 0 : n.days) ?? [])), s.draft && r.push(s.draft), Xn(t, r, e, i);
}
function Es(t) {
  for (let e = 0; e < t.days.length; e++) {
    const i = kr(t.days[e]);
    if (i) return { day: e, a: i[0], b: i[1] };
  }
  return null;
}
function no(t, e, i, s, r = xe) {
  const n = [], o = [];
  for (const l of r) {
    const a = { ...s, id: "__new__" };
    (kr([...t.days[l].filter(e), a]) ? o : n).push(l);
  }
  return { free: n, busy: o };
}
const Ps = 5;
function oo(t, e) {
  let i = 480;
  t.length && (i = Math.max(...t.map((r) => e(r.end ?? r.start))), i = Math.ceil(i / Ps) * Ps);
  const s = Math.min(i, C - 60);
  return { start: Wt(s), end: Wt(Math.min(C, s + 60)) };
}
function Ms(t, e, i = { start: "08:00", end: "09:00" }) {
  return { slot: { id: dt(), start: { time: i.start }, end: { time: i.end }, conditions: [], label: t }, days: [...e], ids: {}, fresh: !0 };
}
const Pt = 15, Ar = (t) => Math.round(t / Pt) * Pt, Ui = (t, e, i) => Math.max(e, Math.min(i, t));
function Mt(t) {
  const e = Ui(Math.round(t), 0, C);
  return { time: `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}` };
}
function Y(t, e) {
  const i = e(t.start);
  if (!t.end) return { start: i, end: null, wrap: !1 };
  const s = e(t.end);
  return s > i ? { start: i, end: s, wrap: !1 } : { start: i, end: C, wrap: !0 };
}
function Os(t, e) {
  const i = t.map((n) => ({ slot: n, e: Y(n, e.at) })).filter((n) => n.e.end !== null).sort((n, o) => n.e.start - o.e.start), s = [];
  let r = e.lead ?? 0;
  for (const { slot: n, e: o } of i)
    o.start > r && s.push({ kind: "gap", start: r, end: o.start }), s.push({ kind: "slot", id: n.id, slot: n, start: o.start, end: o.end, wrap: o.wrap }), r = Math.max(r, o.end);
  return r < C && s.push({ kind: "gap", start: r, end: C }), s;
}
function Si(t, e) {
  const i = [], s = /* @__PURE__ */ new Map();
  for (const r of t) {
    const n = Y(r, e.at);
    if (n.end === null) {
      i.push({ m: n.start, refs: [{ id: r.id, edge: "start" }], oneShot: !0 });
      continue;
    }
    const o = [[n.start, { id: r.id, edge: "start" }]];
    n.wrap || o.push([n.end, { id: r.id, edge: "end" }]);
    for (const [l, a] of o) {
      let d = s.get(l);
      d || (d = { m: l, refs: [], oneShot: !1 }, s.set(l, d), i.push(d)), d.refs.push(a);
    }
  }
  return i.sort((r, n) => r.m - n.m);
}
const zs = (t, e) => t.id === e.id && t.edge === e.edge;
function Cr(t, e, i) {
  const s = t.find((n) => n.id === e.id);
  if (!s) return null;
  const r = Y(s, i.at);
  return e.edge === "start" ? r.start : r.end;
}
function Pe(t, e, i, s) {
  const r = t.find((m) => m.id === e.id);
  if (!r) return null;
  const n = Y(r, s.at);
  let o, l = 0, a = C;
  if (n.end === null) {
    if (e.edge !== "start") return null;
    o = [e], a = C - Pt;
  } else {
    if (e.edge === "end" && n.wrap) return null;
    const m = Si(t, s).find((b) => !b.oneShot && b.refs.some((x) => zs(x, e)));
    if (!m) return null;
    o = m.refs;
    const f = m.m;
    f >= (s.lead ?? 0) && (l = s.lead ?? 0);
    for (const b of t) {
      const x = Y(b, s.at);
      if (x.end === null) continue;
      const E = [[x.start, { id: b.id, edge: "start" }], [x.end, x.wrap ? null : { id: b.id, edge: "end" }]];
      for (const [k, A] of E)
        A && o.some((H) => zs(H, A)) || (k < f ? l = Math.max(l, k) : k > f && (a = Math.min(a, k)));
    }
    for (const b of o) {
      const x = t.find((k) => k.id === b.id), E = Y(x, s.at);
      b.edge === "end" ? l = Math.max(l, E.start + Pt) : a = Math.min(a, E.end - Pt);
    }
  }
  if (l > a) return { slots: t, m: Cr(t, e, s) ?? 0 };
  const d = Ui(Ar(i), l, a), u = Mt(d);
  return { slots: t.map((m) => {
    const f = o.find((b) => b.id === m.id);
    return f ? f.edge === "start" ? { ...m, start: u } : { ...m, end: u } : m;
  }), m: d };
}
function Ai(t, e) {
  return e - t < 2 * Pt ? null : Ui(Ar((t + e) / 2), t + Pt, e - Pt);
}
function Is(t, e, i) {
  const s = i.newId ?? Ze;
  if (e.kind === "gap") {
    const d = Ai(e.start, e.end);
    if (d === null || !i.defaultLabel) return null;
    const u = { id: s(), start: Mt(d), end: Mt(e.end), conditions: [], label: i.defaultLabel };
    return { slots: ke([...t, u], i), handle: { id: u.id, edge: "start" } };
  }
  const r = t.find((d) => d.id === e.id);
  if (!r || !r.end) return null;
  const n = Y(r, i.at), o = Ai(n.start, n.end);
  if (o === null) return null;
  const l = { ...r, end: Mt(o) }, a = t.map((d) => d.id === r.id ? l : d);
  return { slots: ke(a, i), handle: { id: r.id, edge: "end" } };
}
function ao(t, e, i, s) {
  if (e.kind === "slot") return t.map((n) => n.id === e.id ? { ...n, label: i } : n);
  const r = { id: (s.newId ?? Ze)(), start: Mt(e.start), end: Mt(e.end), conditions: [], label: i };
  return ke([...t, r], s);
}
function lo(t, e) {
  return t.filter((i) => i.id !== e);
}
const Ze = () => dt();
function ke(t, e) {
  return [...t].sort((i, s) => e.at(i.start) - e.at(s.start));
}
const co = (t, e) => t.label === e.label && Ye(t.conditions ?? []) === Ye(e.conditions ?? []) && (t.color ?? null) === (e.color ?? null), Ye = (t) => JSON.stringify(t);
function Er(t, e, i = /* @__PURE__ */ new Set()) {
  const s = [];
  for (const r of ke(t, e)) {
    const n = s[s.length - 1];
    if (n && n.end && r.end) {
      const o = Y(n, e.at), l = Y(r, e.at);
      if (!o.wrap && o.end === l.start && !n.end.random_minutes && !r.start.random_minutes && co(n, r) && !i.has(n.id) && !i.has(r.id)) {
        s[s.length - 1] = { ...n, end: r.end };
        continue;
      }
    }
    s.push(r);
  }
  return s;
}
function ho(t, e, i, s) {
  const r = s.newId ?? Ze, n = [];
  for (const o of t) {
    const l = Y(o, s.at);
    if (l.end === null || l.end <= e || l.start >= i) {
      n.push(o);
      continue;
    }
    const a = l.start < e, d = l.end > i;
    a && n.push({ ...o, end: Mt(e) }), d && n.push({ ...structuredClone(o), id: a ? r() : o.id, start: Mt(i) });
  }
  return n;
}
function po(t, e, i, s) {
  var o;
  const r = (o = t[e.day]) == null ? void 0 : o.find((l) => l.id === e.id);
  if (!r) return [];
  const n = Y(r, s.at);
  return n.end === null ? [] : i.filter((l) => l !== e.day && t[l].some((a) => {
    const d = Y(a, s.at);
    return d.end !== null && d.start < n.end && d.end > n.start;
  }));
}
function Ds(t, e, i, s, r = []) {
  var a;
  const n = (a = t[e.day]) == null ? void 0 : a.find((d) => d.id === e.id);
  if (!n) return t;
  const o = s.newId ?? Ze, l = Y(n, s.at);
  return t.map((d, u) => {
    if (!i.includes(u) || u === e.day || r.includes(u)) return d;
    const _ = { ...structuredClone(n), id: o() };
    return l.end === null ? d.some((f) => !f.end && Ye(f.start) === Ye(n.start) && f.label === n.label) ? d : ke([...d, _], s) : Er([...ho(d, l.start, l.end, s), _], s);
  });
}
const Pr = "weekly_planner.hold_hint", Ci = 3, uo = 2e3;
function Mr() {
  try {
    const t = Number(window.localStorage.getItem(Pr));
    return Number.isFinite(t) && t > 0 ? t : 0;
  } catch {
    return 0;
  }
}
function Or(t) {
  try {
    window.localStorage.setItem(Pr, String(t));
  } catch {
  }
}
function _o() {
  const t = Mr();
  return t >= Ci ? !1 : (Or(t + 1), !0);
}
function Ts() {
  Mr() < Ci && Or(Ci);
}
var mo = Object.defineProperty, fo = Object.getOwnPropertyDescriptor, N = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? fo(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && mo(e, i, r), r;
};
const go = 450, yo = 22, Ns = 8, bo = 700, hi = /* @__PURE__ */ new Map(), vo = (t, e) => t && t.revision > e.revision ? t : e;
let O = class extends U {
  constructor() {
    super(...arguments), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.lang = "en", this.tz = "UTC", this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._hover = !1, this._hint = !1, this._kbd = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (t) => "time" in t ? G(t.time) : this._sun.get(JSON.stringify(t)) ?? xt(this.hass, t), this._outside = (t) => {
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
    return vo(hi.get(this.program.id), this.program);
  }
  get _baseDay() {
    return st(this._live, this.data).days[this.weekday] ?? [];
  }
  get _day() {
    return this._draft ?? this._baseDay;
  }
  get _lead() {
    return Math.max(0, ...this.spans.filter((t) => t.spill).map((t) => t.end));
  }
  _ctx(t) {
    var r;
    const e = this.program.entities.find((n) => n.entity_id === this.entityId), i = (r = Li(this.hass, this.data, [this.entityId])[0]) == null ? void 0 : r.id, s = new Map(this._sun);
    return {
      at: (n) => "time" in n ? G(n.time) : s.get(JSON.stringify(n)) ?? xt(this.hass, n),
      lead: this._lead,
      newId: t ?? dt,
      defaultLabel: (e == null ? void 0 : e.default_label) ?? i
    };
  }
  willUpdate(t) {
    var e;
    if (t.has("program") || t.has("preview") || t.has("data")) {
      this._sun = /* @__PURE__ */ new Map();
      for (const i of this._baseDay) {
        const s = (e = this.preview) == null ? void 0 : e.find((r) => r.slot_id === i.id);
        s && ("sun" in i.start && this._sun.set(JSON.stringify(i.start), ut(s.start, this.tz)), i.end && "sun" in i.end && s.end && this._sun.set(JSON.stringify(i.end), ut(s.end, this.tz)));
      }
      this._awaitRev !== null && this.program.revision >= this._awaitRev && this._dropDraft();
    }
  }
  updated(t) {
    var e, i;
    t.has("editing") && (this.editing ? (this._clearHint(), this._listen(!0), this._kbd && ((e = this.renderRoot.querySelector(".hd")) == null || e.focus())) : (this._listen(!1), this._kbd && ((i = this.renderRoot.querySelector(".zone")) == null || i.focus()), this._kbd = !1, this._flushNudge(), this._selected = null, this._hsel = null, this._copyOpen = !1, this._conflict = null, this._keep.clear(), this._bubble = null));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), this._listen(!1), window.clearTimeout(this._clearTimer), window.clearTimeout(this._errTimer), window.clearTimeout(this._hintTimer), window.clearTimeout((t = this._press) == null ? void 0 : t.timer);
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
      this._press && (this._press.fired = !0, (i = navigator.vibrate) == null || i.call(navigator, 12), this._clearHint(), Ts(), this._emit("edit-request"));
    }, go));
  }
  _zoneMove(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || Math.hypot(t.clientX - e.x, t.clientY - e.y) > Ns && (window.clearTimeout(e.timer), this._press = void 0);
  }
  _zoneUp(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || (window.clearTimeout(e.timer), this._press = void 0, !e.fired && (e.mouse && this.editable ? this._emit("edit-request") : this.editable && !e.mouse ? this._tapHint() : this._emit("open-day")));
  }
  /** A plain touch on an editable bar: tell how to edit for 2 s, then open the day screen as before (a second tap opens it at once). */
  _tapHint() {
    if (this._hint) {
      this._clearHint(), this._emit("open-day");
      return;
    }
    if (!_o()) {
      this._emit("open-day");
      return;
    }
    this._hint = !0, this._hintTimer = window.setTimeout(() => {
      this._hint = !1, this._hintTimer = void 0, this._emit("open-day");
    }, uo);
  }
  _clearHint() {
    window.clearTimeout(this._hintTimer), this._hintTimer = void 0, this._hint = !1;
  }
  /** Keyboard: Enter or Space on the focused bar does what a click does. */
  _zoneKey(t) {
    this.editing || t.target !== t.currentTarget || t.key !== "Enter" && t.key !== " " || (t.preventDefault(), this.editable ? (this._kbd = !0, this._clearHint(), Ts(), this._emit("edit-request")) : this._emit("open-day"));
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
    return { m: (t - ((e == null ? void 0 : e.left) ?? 0)) / i * C, ppm: i / C };
  }
  _nearest(t, e) {
    let i;
    for (const s of Si(this._day, this._ctx())) {
      const r = Math.abs(s.m - t) * e;
      r <= yo && (!i || r < i.d) && (i = { b: s, d: r });
    }
    return i == null ? void 0 : i.b;
  }
  _segAt(t) {
    const e = Os(this._day, this._ctx()).find((i) => t >= i.start && t < i.end);
    return e ? e.kind === "slot" ? { kind: "slot", id: e.id } : { kind: "gap", start: e.start, end: e.end } : null;
  }
  _ovDown(t) {
    var r, n;
    if (t.button !== 0) return;
    this._flushNudge();
    const { m: e, ppm: i } = this._minuteAt(t.clientX), s = this._nearest(e, i);
    if (s) {
      (n = (r = t.currentTarget).setPointerCapture) == null || n.call(r, t.pointerId), this._drag = {
        ref: s.refs[0],
        m0: s.m,
        x0: t.clientX,
        id: t.pointerId,
        moved: !1,
        last: s.m,
        profileId: st(this._live, this.data).id,
        weekday: this.weekday,
        ctx: this._ctx()
      }, this._hsel = s.refs[0], t.preventDefault();
      return;
    }
    this._tap = { id: t.pointerId, x: t.clientX, y: t.clientY, target: this._segAt(e) };
  }
  _ovMove(t) {
    var i;
    const e = this._drag;
    if (e && e.id === t.pointerId) {
      const s = t.clientX - e.x0;
      if (!e.moved && Math.abs(s) < 3) return;
      e.moved = !0;
      const r = (i = this._live.profiles.find((o) => o.id === e.profileId)) == null ? void 0 : i.days[e.weekday];
      if (!r) {
        this._ovCancel();
        return;
      }
      const n = Pe(r, e.ref, e.m0 + s / this._minuteAt(0).ppm, e.ctx);
      n && (e.last = n.m, this._draft = n.slots, this._bubble = { m: n.m });
      return;
    }
    if (!this._tap && !e) {
      const { m: s, ppm: r } = this._minuteAt(t.clientX);
      this._hover = !!this._nearest(s, r);
    }
  }
  _ovUp(t) {
    const e = this._drag;
    if (e && e.id === t.pointerId) {
      if (this._drag = void 0, this._bubble = null, e.moved) {
        const { ref: s, last: r } = e;
        this._commit((n) => {
          const o = Pe(n[e.weekday], s, r, e.ctx);
          return o ? this._with(n, e.weekday, o.slots) : null;
        }, [e.weekday], !1, e.profileId);
      } else {
        const s = this._baseDay.find((r) => r.id === e.ref.id);
        s && !s.end && this._select({ kind: "slot", id: s.id });
      }
      return;
    }
    const i = this._tap;
    i && i.id === t.pointerId && (this._tap = void 0, Math.hypot(t.clientX - i.x, t.clientY - i.y) <= Ns && i.target && this._select(i.target));
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
    var l, a, d;
    if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
    t.preventDefault();
    const i = st(this._live, this.data).id;
    this._nudge && this._nudge.profileId !== i && (this._flushNudge(), this._draft = null);
    const s = ((l = this._nudge) == null ? void 0 : l.ctx) ?? this._ctx(), r = this._draft ?? this._baseDay, n = ((a = this._nudge) == null ? void 0 : a.m) ?? Cr(r, e, s);
    if (n === null) return;
    const o = Pe(r, e, n + (t.key === "ArrowRight" ? 15 : -15), s);
    o && (this._draft = o.slots, this._bubble = { m: o.m }, window.clearTimeout((d = this._nudge) == null ? void 0 : d.timer), this._nudge = { ref: e, m: o.m, timer: window.setTimeout(() => this._flushNudge(), bo), profileId: i, weekday: this.weekday, ctx: s });
  }
  _flushNudge() {
    const t = this._nudge;
    t && (window.clearTimeout(t.timer), this._nudge = void 0, this._bubble = null, this._commit((e) => {
      const i = Pe(e[t.weekday], t.ref, t.m, t.ctx);
      return i ? this._with(e, t.weekday, i.slots) : null;
    }, [t.weekday], !1, t.profileId));
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
  async _commit(t, e, i = !1, s = st(this._live, this.data).id) {
    var n;
    let r = this._live;
    for (let o = 0; o < 2; o++) {
      const l = r.profiles.find((f) => f.id === s);
      if (!l)
        return this._dropDraft(), !1;
      const a = l.days, d = t(a);
      if (!d)
        return this._dropDraft(), !1;
      const u = d.map((f, b) => e.includes(b) && f !== a[b] ? Er(f, this._ctx(), this._keep) : f), _ = u.map((f, b) => b).filter((f) => JSON.stringify(u[f]) !== JSON.stringify(a[f]));
      if (!_.length)
        return this._dropDraft(), !0;
      const m = { ...r, profiles: r.profiles.map((f) => f.id === l.id ? { ...f, days: u } : f) };
      this._draft = u[this.weekday] ?? null;
      try {
        const f = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(m) });
        if (f != null && f.program ? (hi.set(f.program.id, f.program), this._awaitRev = f.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= f.program.revision && this._dropDraft()) : this._dropDraft(), !i) {
          const b = _.map((x) => [x, a[x]]);
          this._emit("edited", {
            undo: () => this._commit((x) => _.some((E) => JSON.stringify(x[E]) !== JSON.stringify(u[E])) ? null : x.map((E, k) => {
              var A;
              return ((A = b.find((H) => H[0] === k)) == null ? void 0 : A[1]) ?? E;
            }), _, !0, s)
          });
        }
        return !0;
      } catch (f) {
        const b = f;
        if ((b == null ? void 0 : b.code) === "conflict" && o === 0)
          try {
            const E = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((k) => k.id === r.id);
            if (E) {
              hi.set(E.id, E), r = E;
              continue;
            }
          } catch {
          }
        return this._dropDraft(), this._fail((n = b == null ? void 0 : b.message) != null && n.includes("overlapping_slots") ? h(this.lang, "w_err_overlap") : (b == null ? void 0 : b.code) === "unauthorized" ? h(this.lang, "err_unauthorized") : h(this.lang, "ss_err_save")), !1;
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
      const r = Y(s, this._at);
      return { target: t, slot: s, start: r.start, end: r.end };
    }
    const i = Os(e, this._ctx()).find((s) => s.kind === "gap" && s.start === t.start);
    return i ? { target: { kind: "gap", start: i.start, end: i.end }, start: i.start, end: i.end } : null;
  }
  _pickLabel(t) {
    const e = this._sel;
    if (!e || t === null) return;
    const i = dt(), s = e.target;
    this._commit((r) => this._with(r, this.weekday, ao(r[this.weekday], s, t, this._ctx(() => i))), [this.weekday]), s.kind === "gap" && (this._selected = { kind: "slot", id: i });
  }
  async _nothing() {
    const t = this._sel;
    if (!(t != null && t.slot)) return;
    const e = t.slot.id;
    await Et(this, h(this.lang, "w_confirm_slot"), h(this.lang, "yes"), h(this.lang, "no")) && (this._selected = null, this._commit((i) => this._with(i, this.weekday, lo(i[this.weekday], e)), [this.weekday]));
  }
  _cut() {
    const t = this._sel;
    if (!t) return;
    const e = t.target, i = dt(), s = this._ctx(() => i), r = Is(this._day, e, s);
    r && (e.kind === "gap" && this._keep.add(i), this._hsel = r.handle, this._commit((n) => {
      const o = Is(n[this.weekday], e, this._ctx(() => i));
      return o ? this._with(n, this.weekday, o.slots) : null;
    }, [this.weekday]).then(() => {
      this.updateComplete.then(() => {
        var n;
        return (n = this.renderRoot.querySelector(`[data-h="${r.handle.id}:${r.handle.edge}"]`)) == null ? void 0 : n.focus();
      });
    }), e.kind === "gap" && (this._selected = { kind: "slot", id: i }));
  }
  _toggleDay(t) {
    this._copyDays = this._copyDays.includes(t) ? this._copyDays.filter((e) => e !== t) : [...this._copyDays, t];
  }
  _copyGo() {
    const t = this._sel;
    if (!(t != null && t.slot) || !this._copyDays.length) return;
    const e = t.slot.id, i = [...this._copyDays].sort((n, o) => n - o), s = st(this._live, this.data).days, r = po(s, { day: this.weekday, id: e }, i, this._ctx());
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
      const n = Ds(r, { day: this.weekday, id: t }, e, this._ctx(), i);
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
      const s = F(this.data, i.label);
      if (!s || !St(this.program, this.entityId, s)) continue;
      const r = Y(i, this._at);
      e.push({
        start: r.start,
        end: r.end ?? r.start + 10,
        color: s.color,
        label: rt(this.hass, s),
        slotId: i.id,
        marker: r.end === null,
        startSun: Ct(i.start),
        endSun: i.end ? Ct(i.end) : null,
        startSpec: i.start,
        endSpec: i.end ?? null
      });
    }
    return e;
  }
  _clock(t) {
    return t >= C ? "24 h" : mt(this.lang, t);
  }
  /** Text of a handle on a sun boundary (the icon under it does not catch the pointer while editing). */
  _sunTitle(t, e) {
    var r;
    const i = (r = this._draft) == null ? void 0 : r.find((n) => n.id === t.id), s = t.edge === "start" ? i == null ? void 0 : i.start : i == null ? void 0 : i.end;
    return $e(this.lang, s, e);
  }
  _overlay_() {
    const t = this._day, e = this._ctx(), i = (n) => `${n / C * 100}%`, s = this._sel, r = Si(t, e);
    return c`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${s && s.end !== null ? c`<div class="selbox ${s.slot ? "" : "gap"}"
        style="left:${i(s.start)};width:${i(s.end - s.start)}"></div>` : p}
      ${s != null && s.slot && s.end === null ? c`<div class="selpoint" style="left:${i(s.start)}"></div>` : p}
      ${mn(r, (n) => n.refs.map((o) => `${o.id}:${o.edge}`).join("+"), (n) => {
      const o = n.refs[0], l = this._hsel && n.refs.some((a) => {
        var d, u;
        return a.id === ((d = this._hsel) == null ? void 0 : d.id) && a.edge === ((u = this._hsel) == null ? void 0 : u.edge);
      });
      return c`<button class="hd ${n.oneShot ? "dot" : ""} ${l ? "on" : ""}" style="left:clamp(0px, ${i(n.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${n.m}
          aria-valuetext=${this._clock(n.m)} aria-label=${h(this.lang, "handle", { time: this._clock(n.m) })}
          data-h=${n.refs.map((a) => `${a.id}:${a.edge}`).join(" ")} title=${this._sunTitle(o, n.m)}
          @keydown=${(a) => this._key(a, o)} @focus=${() => this._hsel = o}
          ><i></i></button>`;
    })}
      ${this._bubble ? c`<div class="bubble" style="left:clamp(28px, ${i(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : p}
    </div>`;
  }
  _strip() {
    var n;
    const t = this._sel;
    if (!t) return p;
    const e = this.lang, i = this._ctx(), s = t.end !== null && (t.slot ? !!t.slot.end : !!i.defaultLabel) && Ai(t.start, t.end) !== null, r = Z(e).days_short;
    return c`<div class="strip" role="group">
      <div class="acts">
        ${t.slot ? c`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${h(e, "rest_none_short")}</button>` : p}
        <button class="act" ?disabled=${!s} aria-label=${h(e, "cut")} title=${h(e, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${t.slot ? c`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => {
      this._copyOpen = !this._copyOpen, this._copyDays = [];
    }}><ha-icon icon="mdi:content-copy"></ha-icon>${h(e, "copy_to")}</button>` : p}
      </div>
      ${this._copyOpen && t.slot ? c`<div class="copy">
        ${r.map((o, l) => l === this.weekday ? p : c`<button class="dchip ${this._copyDays.includes(l) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(l)} @click=${() => this._toggleDay(l)}>${o}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${h(e, "copy_go")} title=${h(e, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${h(e, "copy_go")}</button>
      </div>` : p}
      <div class="pick">
        <wp-label-picker compact readonly-settings .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
          .value=${((n = t.slot) == null ? void 0 : n.label) ?? null} @label-change=${(o) => {
      o.stopPropagation(), this._pickLabel(o.detail);
    }}></wp-label-picker>
      </div>
    </div>`;
  }
  _conflictDialog() {
    const t = this._conflict;
    if (!t) return p;
    const e = this.lang, i = Z(e).days, s = (a, d) => {
      this._conflict = { ...t, skip: d ? [...t.skip.filter((u) => u !== a), a] : t.skip.filter((u) => u !== a) };
    }, r = t.to.every((a) => t.skip.includes(a)), n = st(this._live, this.data).days, o = this._ctx(), l = (a, d) => c`<div class="cfbar"><span>${a}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(d)} .now=${null}></wp-day-bar></div>`;
    return c`<wp-dialog open heading=${h(e, "conflict_title")} @closed=${(a) => {
      a.stopPropagation(), this._conflict = null;
    }}>
      <div class="cf">
        ${t.days.map((a) => c`<div class="cfrow"><strong>${i[a]}</strong>
          ${l(h(e, "cf_before"), n[a] ?? [])}
          ${l(h(e, "cf_after"), t.skip.includes(a) ? n[a] ?? [] : Ds(n, { day: this.weekday, id: t.id }, [a], o)[a] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${i[a]}>
            <button role="radio" aria-checked=${!t.skip.includes(a)} class=${t.skip.includes(a) ? "" : "on"} @click=${() => s(a, !1)}>${h(e, "replace")}</button>
            <button role="radio" aria-checked=${t.skip.includes(a)} class=${t.skip.includes(a) ? "on" : ""} @click=${() => s(a, !0)}>${h(e, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${h(e, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${r} @click=${() => void this._doCopy(t.id, t.to, t.skip)}>${h(e, "copy_go")}</button>
    </wp-dialog>`;
  }
  render() {
    return !this.hass || !this.data || !this.program ? p : c`
      <div class="zone ${this.editing ? "editing" : ""}" tabindex=${ai(this.editing ? void 0 : 0)}
        role=${ai(this.editing ? void 0 : "button")} aria-label=${ai(this.editing ? void 0 : h(this.lang, "edit_bar"))}
        @keydown=${this._zoneKey}
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(t) => {
      this._press && !this._press.mouse && t.preventDefault();
    }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${h(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : p}</wp-day-bar>
        <div class="hint" role="status">${this._hint ? h(this.lang, "hold_hint") : p}</div>
      </div>
      ${this.editing ? this._strip() : p}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
      ${this._conflictDialog()}`;
  }
};
O.styles = [$t, V`
    :host { display: block; min-width: 0; }
    .zone { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .zone:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; border-radius: 14px; }
    /* above the "now" line of the bar (z-index 5) */
    .hint {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 6; max-width: 96%;
      padding: 6px 12px; border-radius: 16px; font-size: 13px; line-height: 1.3; text-align: center; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff);
    }
    .hint:empty { display: none; }
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
    .acts { display: flex; flex-wrap: wrap; gap: 8px; }
    .pick { margin-top: 8px; }
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
N([
  v({ attribute: !1 })
], O.prototype, "hass", 2);
N([
  v({ attribute: !1 })
], O.prototype, "data", 2);
N([
  v({ attribute: !1 })
], O.prototype, "program", 2);
N([
  v({ attribute: "entity-id" })
], O.prototype, "entityId", 2);
N([
  v({ type: Number })
], O.prototype, "weekday", 2);
N([
  v({ attribute: !1 })
], O.prototype, "spans", 2);
N([
  v({ attribute: !1 })
], O.prototype, "preview", 2);
N([
  v({ type: Number })
], O.prototype, "now", 2);
N([
  v({ type: Boolean })
], O.prototype, "editing", 2);
N([
  v({ type: Boolean })
], O.prototype, "editable", 2);
N([
  v({ type: Boolean })
], O.prototype, "hours", 2);
N([
  v()
], O.prototype, "lang", 2);
N([
  v()
], O.prototype, "tz", 2);
N([
  $()
], O.prototype, "_draft", 2);
N([
  $()
], O.prototype, "_selected", 2);
N([
  $()
], O.prototype, "_hsel", 2);
N([
  $()
], O.prototype, "_bubble", 2);
N([
  $()
], O.prototype, "_copyOpen", 2);
N([
  $()
], O.prototype, "_copyDays", 2);
N([
  $()
], O.prototype, "_conflict", 2);
N([
  $()
], O.prototype, "_error", 2);
N([
  $()
], O.prototype, "_hover", 2);
N([
  $()
], O.prototype, "_hint", 2);
O = N([
  J("wp-bar-editor")
], O);
const Be = 1440, js = Be / 2;
function $o(t, e = !1) {
  const i = e ? js : Be, s = [];
  for (const r of t) {
    if (r.ignored || !Number.isFinite(r.start) || !Number.isFinite(r.end)) continue;
    if (r.marker) {
      if (r.start < 0 || r.start >= Be) continue;
      const a = e && r.start >= js ? 1 : 0;
      s.push({
        source: r,
        start: r.start,
        end: r.start,
        offset: (r.start - a * i) / i,
        fraction: 0,
        ring: a
      });
      continue;
    }
    const n = Math.max(0, r.start), o = Math.min(Be, r.end);
    if (o <= n) continue;
    const l = e ? [0, 1] : [0];
    for (const a of l) {
      const d = a * i, u = Math.max(n, d), _ = Math.min(o, d + i);
      _ <= u || s.push({
        source: r,
        start: u,
        end: _,
        offset: (u - d) / i,
        fraction: (_ - u) / i,
        ring: a
      });
    }
  }
  return s;
}
var wo = Object.defineProperty, xo = Object.getOwnPropertyDescriptor, le = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? xo(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && wo(e, i, r), r;
};
const Rs = "var(--divider-color, rgba(127, 127, 127, 0.2))", jt = (t, e) => {
  const i = t * Math.PI * 2 - Math.PI / 2;
  return { x: 160 + e * Math.cos(i), y: 160 + e * Math.sin(i) };
};
let Dt = class extends U {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.double = !1, this.lang = "en", this.rest = "";
  }
  _open() {
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: !0, composed: !0 }));
  }
  _icon(t, e, i, s) {
    const r = jt(t, e);
    return c`<wp-tip text=${s} style=${`left:${r.x / 3.2}%;top:${r.y / 3.2}%`}>
      <span class="icon"><ha-icon icon=${i}></ha-icon></span></wp-tip>`;
  }
  render() {
    const t = $o(this.spans, this.double), e = [...new Set(t.map((a) => a.source))], i = this.double ? 720 : 1440, s = this.double ? 24 : 36, r = (a) => this.double && a === 0 ? 78 : 112, n = this.now !== null && Number.isFinite(this.now) && this.now >= 0 && this.now < 1440 ? this.now : null, o = this.double && n !== null && n >= 720 ? 1 : 0, l = n === null ? 0 : (n - o * i) / i;
    return c`<div class="dial"><button @click=${this._open} aria-label=${h(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        ${(this.double ? [0, 1] : [0]).map((a) => D`<circle class="track" cx="160" cy="160" r=${r(a)} fill="none" stroke=${Rs} stroke-width=${s} />`)}
        ${t.map((a) => {
      if (a.source.marker) {
        const d = jt(a.offset, r(a.ring));
        return D`<circle cx=${d.x} cy=${d.y} r="7" fill=${a.source.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
      }
      return D`<circle cx="160" cy="160" r=${r(a.ring)} fill="none" stroke=${a.source.color} stroke-width=${s}
            pathLength="100" stroke-dasharray="${a.fraction * 100} ${100 - a.fraction * 100}" stroke-dashoffset=${-a.offset * 100} transform="rotate(-90 160 160)" />`;
    })}
        ${(this.double ? [0, 1] : [0]).map((a) => Array.from({ length: i / 60 }, (d, u) => {
      const _ = u % (this.double ? 3 : 6) === 0, m = jt(u * 60 / i, r(a) + s / 2), f = jt(u * 60 / i, r(a) + s / 2 - (_ ? s : 6));
      return D`<line class="tick" x1=${m.x} y1=${m.y} x2=${f.x} y2=${f.y} stroke="var(--primary-text-color)" stroke-opacity=".35" stroke-width="1" />`;
    }))}
        ${(this.double ? [0, 1] : [0]).map((a) => (this.double ? a === 0 ? [12, 3, 6, 9] : [24, 15, 18, 21] : [0, 6, 12, 18]).map((d, u) => {
      const _ = jt(u / 4, this.double && a === 0 ? 53 : 145);
      return D`<text class="hour" x=${_.x} y=${_.y + 5} text-anchor="middle">${this.double ? d : String(d).padStart(2, "0")}</text>`;
    }))}
        ${n === null ? p : (() => {
      const a = jt(l, r(o) - s / 2 - 4), d = jt(l, r(o) + s / 2 + 4);
      return D`<line x1=${a.x} y1=${a.y} x2=${d.x} y2=${d.y} stroke="var(--primary-text-color)" stroke-width="3" />`;
    })()}
        <text x="160" y="156" text-anchor="middle">${n === null ? "24 h" : mt(this.lang, n)}</text>
        <text x="160" y="180" text-anchor="middle">${h(this.lang, "hours")}</text>
      </svg></button>
      ${t.flatMap((a) => {
      const d = [];
      return a.start === a.source.start && a.source.startSun && d.push(this._icon(
        a.offset,
        r(a.ring),
        a.source.startSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down",
        $e(this.lang, a.source.startSpec, a.start)
      )), !a.source.marker && a.end === a.source.end && a.end < 1440 && a.source.endSun && d.push(this._icon(
        a.offset + a.fraction,
        r(a.ring),
        a.source.endSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down",
        $e(this.lang, a.source.endSpec, a.end)
      )), d;
    })}
      ${n === null ? p : this._icon(l, r(o) - s / 2 - 12, "mdi:clock-outline", Di(this.lang, n))}
      </div>
      ${this.double ? c`<div class="rings">${h(this.lang, "radial_rings")}</div>` : p}
      <div class="legend">
        ${this.rest ? c`<span><i style=${`background:${Rs}`}></i>${h(this.lang, "rest_of_time")}: ${this.rest}</span>` : p}
        ${e.map((a) => c`<span><i style=${`background:${a.color}`}></i>${mt(this.lang, a.start)}${a.marker ? "" : `–${mt(this.lang, a.end)}`} · ${a.label}</span>`)}
      </div>`;
  }
};
Dt.styles = V`
    :host { display: block; }
    .dial { position: relative; max-width: 360px; margin: auto; }
    button { display: block; width: 100%; padding: 0; color: inherit; border: 0; background: none; cursor: pointer; border-radius: 50%; }
    button:focus-visible { outline: 2px solid var(--primary-color); }
    svg { display: block; width: 100%; } text { fill: var(--primary-text-color); font-size: 14px; }
    wp-tip { position: absolute; transform: translate(-50%, -50%); }
    .icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 0 0 1px var(--divider-color); }
    ha-icon { --mdc-icon-size: 14px; }
    .rings { text-align: center; font-size: 12px; color: var(--secondary-text-color); margin: 0 0 8px; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; padding: 4px 0 12px; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; } i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  `;
le([
  v({ attribute: !1 })
], Dt.prototype, "spans", 2);
le([
  v({ type: Number })
], Dt.prototype, "now", 2);
le([
  v({ type: Boolean })
], Dt.prototype, "double", 2);
le([
  v()
], Dt.prototype, "lang", 2);
le([
  v()
], Dt.prototype, "rest", 2);
Dt = le([
  J("wp-radial-day")
], Dt);
function zr(t, e) {
  let i = 0, s = t.length;
  for (; i < s; ) {
    const r = i + Math.floor((s - i) / 2);
    t[r] <= e ? i = r + 1 : s = r;
  }
  return i;
}
function Ls(t, e, i) {
  const s = zr(t, e + i);
  return s > 0 && t[s - 1] >= e - i;
}
const qe = /* @__PURE__ */ new Set();
let Me;
const pi = () => {
  document.hidden || qe.forEach((t) => t());
};
function ko(t) {
  return qe.add(t), Me === void 0 && (Me = setInterval(pi, 6e4), document.addEventListener("visibilitychange", pi)), () => {
    qe.delete(t), qe.size || (clearInterval(Me), Me = void 0, document.removeEventListener("visibilitychange", pi));
  };
}
const Oe = 0.5;
function So(t, e, i) {
  const s = t.filter((u) => u.end !== null).map((u) => ({ ...u, end: Math.min(u.end, i), start: Math.max(0, u.start) })).filter((u) => u.end > u.start).sort((u, _) => u.start - _.start);
  s.forEach((u, _) => {
    const m = s[_ + 1];
    m && u.end > m.start && (u.end = m.start);
  });
  const r = [], n = [], o = (u, _) => {
    e != null && e.active && _ - u > Oe && r.push({ from: u, to: _, value: e.value, color: e.color });
  };
  let l = 0;
  s.forEach((u, _) => {
    o(l, u.start), r.push({ from: u.start, to: u.end, value: u.value, color: u.color });
    const m = s[_ + 1];
    u.end < i - Oe && (!m || m.start - u.end > Oe) && (e != null && e.active) && n.push(u.end), l = u.end;
  }), o(l, i);
  const a = r.flatMap((u) => u.value === null ? [] : [{ from: u.from, to: u.to, value: u.value, color: u.color }]), d = [];
  for (let u = 1; u < a.length; u++) {
    const _ = a[u - 1], m = a[u];
    Math.abs(_.to - m.from) <= Oe && Math.abs(_.value - m.value) > 1e-9 && d.push({ m: m.from, from: _.value, to: m.value, color: m.color });
  }
  return { zones: r, steps: a, risers: d, returns: n };
}
const Ao = /* @__PURE__ */ new Set(["off", "idle", "unavailable", "unknown", "docked", ""]), Bs = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function Co(t, e, i) {
  if (e === "unavailable" || e === "unknown") return !1;
  switch (t) {
    case "climate": {
      const s = i.hvac_action;
      if (typeof s == "string" && s !== "") return s !== "idle" && s !== "off";
      if (e === "off") return !1;
      const r = Bs(i.temperature), n = Bs(i.current_temperature);
      return r === null || n === null ? !1 : e === "cool" ? n - r > 0.3 : r - n > 0.3;
    }
    case "light":
    case "switch":
    case "fan":
    case "input_boolean":
      return e === "on";
    case "cover":
      return e === "open" || e === "opening" || e === "closing";
    case "vacuum":
      return e === "cleaning" || e === "returning";
    case "media_player":
      return e === "playing";
    default:
      return !Ao.has(e);
  }
}
function Eo(t, e, i) {
  const s = [...t].sort((n, o) => n.m - o.m), r = [];
  return s.forEach((n, o) => {
    const l = Math.max(0, n.m), a = Math.min(i, o + 1 < s.length ? s[o + 1].m : i);
    if (a - l <= 0 || !Co(e, n.state, n.attrs)) return;
    const d = r[r.length - 1];
    d && Math.abs(d[1] - l) < 0.01 ? d[1] = a : r.push([l, a]);
  }), r;
}
function Po(t, e) {
  const i = [];
  for (const [s, r] of t) {
    const n = Math.max(0, s), o = Math.min(r, e);
    o - n > 0.01 && i.push({ from: n, to: o });
  }
  return i.sort((s, r) => s.from - r.from);
}
var Mo = Object.defineProperty, Oo = Object.getOwnPropertyDescriptor, ft = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Oo(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Mo(e, i, r), r;
};
function qs(t, e) {
  const i = Jt("en-GB", {
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
    return Number(((o = i.find((l) => l.type === n)) == null ? void 0 : o.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(t / 1e3) * 1e3;
}
function Us(t, e) {
  const [i, s, r] = t.split("-").map(Number), n = Date.UTC(i, s - 1, r), o = n - qs(n, e);
  return n - qs(o, e);
}
function Rt(t, e) {
  return { startMs: Us(t, e), endMs: Us(qt(t, 1), e) };
}
function zo(t) {
  const [e, i, s] = t.split("-").map(Number);
  return Ne(new Date(Date.UTC(e, i - 1, s, 12)), "UTC");
}
const Hs = 6e4, Fs = /* @__PURE__ */ new WeakMap();
function ui(t, e, i, s) {
  let r = Fs.get(t);
  r || (r = /* @__PURE__ */ new Map(), Fs.set(t, r));
  const n = r, o = r.get(e);
  if (o && Date.now() - o.at < i)
    return r.delete(e), r.set(e, o), o.p;
  const l = s();
  for (r.set(e, { at: Date.now(), p: l }); r.size > 64; ) r.delete(r.keys().next().value);
  return l.catch(() => {
    var a;
    ((a = n.get(e)) == null ? void 0 : a.p) === l && n.delete(e);
  }), l;
}
function Io(t) {
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
function Do(t) {
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
function Ws(t, e) {
  const i = Math.floor((e - 8) / 6);
  return i < 4 ? "" : t.length <= i ? t : `${t.slice(0, i - 1)}…`;
}
const To = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", ze = (t) => t === "unavailable" || t === "unknown" || t === "", Ie = (t) => typeof t == "number" && Number.isFinite(t) ? t : null, No = 3, Ks = 3, jo = /* @__PURE__ */ new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);
let ot = class extends U {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._model = null, this._token = 0, this._refresh = () => {
      if (document.hidden || !this.hass || !this.date) return;
      const { startMs: t, endMs: e } = Rt(this.date, this._tz);
      t <= Date.now() && Date.now() < e && this._load();
    };
  }
  get _lang() {
    var t, e, i;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  connectedCallback() {
    super.connectedCallback(), this._stopRefresh = ko(this._refresh), this._observer = new ResizeObserver((t) => {
      const e = Math.floor(t[0].contentRect.width);
      e > 120 && e !== this._width && (this._width = e);
    });
  }
  disconnectedCallback() {
    var t, e;
    super.disconnectedCallback(), (t = this._observer) == null || t.disconnect(), (e = this._stopRefresh) == null || e.call(this), this._stopRefresh = void 0, this._token++;
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
    const { startMs: i, endMs: s } = Rt(this.date, this._tz), r = Date.now(), n = s > r ? 6e4 : 1 / 0, o = i < r, l = new Date(Math.min(s, r)).toISOString();
    try {
      const a = o ? ui(this.hass.connection ?? this.hass, `h|${t}`, n, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: l,
        entity_ids: [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), d = o ? ui(this.hass.connection ?? this.hass, `l|${t}`, n, () => this.hass.callWS({
        type: "logbook/get_events",
        start_time: new Date(i).toISOString(),
        end_time: l,
        entity_ids: [this.entityId]
      })).catch(() => []) : Promise.resolve([]), u = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), _ = o ? ui(this.hass.connection ?? this.hass, `j|${this.entityId}|${u}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: u })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [m, f, b] = await Promise.all([a, d, _]);
      if (e !== this._token) return;
      this._loaded = {
        hist: Io(m[this.entityId]),
        log: Do(f),
        sent: (b.segments ?? []).filter((x) => x.entity_id === this.entityId).map((x) => Date.parse(x.at))
      };
    } catch {
      e === this._token && (this._failed = !0, this._loaded = { hist: [], log: [], sent: [] });
    }
  }
  // ---- values ----
  /** What a history point says as numbers: the curves of the device. */
  _live(t) {
    const e = { measured: null, set: null, main: null };
    if (ze(t.s)) return e;
    switch (Ut(this.entityId)) {
      case "climate":
        return { measured: Ie(t.a.current_temperature), set: t.s === "off" ? null : Ie(t.a.temperature), main: null };
      case "cover":
        return { ...e, main: Ie(t.a.current_position) ?? (t.s === "open" ? 100 : t.s === "closed" ? 0 : null) };
      case "light": {
        const i = t.s === "on" ? Ie(t.a.brightness) : 0;
        return { ...e, main: i === null ? t.s === "on" ? 100 : 0 : i / 255 * 100 };
      }
      default: {
        const i = Number(t.s);
        return { ...e, main: Number.isFinite(i) ? i : null };
      }
    }
  }
  _numeric(t) {
    const e = Ut(this.entityId);
    if (["climate", "cover", "light"].includes(e)) return !0;
    const i = t.filter((s) => !ze(s.s));
    return i.length > 0 && i.every((s) => Number.isFinite(Number(s.s)));
  }
  // ---- build ----
  _build(t) {
    var Vi, Ji, Gi, Yi, Xi, Qi;
    const e = this._tz, { startMs: i, endMs: s } = Rt(this.date, e), r = Math.round((s - i) / 6e4), n = Date.now(), o = Math.max(0, Math.min(r, (n - i) / 6e4)), l = (y) => (y - i) / 6e4, a = Ut(this.entityId), d = st(this.program, this.data), u = /* @__PURE__ */ new Map();
    for (const y of this.program.profiles) for (const w of y.days.flat()) u.set(w.id, w);
    const _ = zo(this.date), m = [];
    if (!this.slots) for (const { slot: y, end: w } of pr(d.days[(_ + 6) % 7]))
      !y.start.random_minutes && !((Vi = y.end) != null && Vi.random_minutes) && m.push({ s: 0, e: w, slot: y, spill: !0 });
    if (this.slots)
      for (const y of this.slots) {
        const w = u.get(y.slot_id);
        if (!w) continue;
        const M = l(Date.parse(y.start)), W = y.end ? l(Date.parse(y.end)) : null;
        M >= r || (W === null ? M < 0 : W <= 0) || m.push({
          s: Math.max(0, M),
          e: W === null ? null : Math.min(r, W),
          slot: w,
          spill: M < 0,
          ignored: !!y.ignored
        });
      }
    else
      for (const y of d.days[_]) {
        if (y.start.random_minutes || (Ji = y.end) != null && Ji.random_minutes) continue;
        const w = zt(y.start);
        if (w === null) continue;
        const M = zt(y.end ?? null);
        m.push({ s: w, e: M === null ? null : M > w ? M : r, slot: y });
      }
    const f = this.program.entities.find((y) => y.entity_id === this.entityId), b = F(this.data, f == null ? void 0 : f.default_label), x = [], E = (y, w, M, W = {}) => {
      if (!w || y < 0 || y > r) return;
      const yt = St(this.program, this.entityId, w);
      yt && x.push({ m: y, label: w, value: ws(yt), end: M, ...W });
    };
    for (const y of m)
      y.spill || E(
        y.s,
        F(this.data, y.slot.label),
        !1,
        { sun: Ct(y.slot.start), spec: y.slot.start, ignored: y.ignored }
      );
    const k = (y) => ws(St(this.program, this.entityId, y)), A = So(
      m.filter((y) => !y.ignored).flatMap((y) => {
        const w = F(this.data, y.slot.label);
        return w && St(this.program, this.entityId, w) ? [{ start: y.s, end: y.e, color: w.color, value: k(w) }] : [];
      }),
      b ? { color: b.color, value: k(b), active: !!St(this.program, this.entityId, b) } : null,
      r
    );
    for (const y of A.returns) E(y, b, !0);
    const H = Po(
      Eo(t.hist.map((y) => ({ m: l(y.t), state: y.s, attrs: y.a })), a, o),
      o
    );
    x.sort((y, w) => y.m - w.m);
    const S = this._numeric(t.hist), R = [], g = [];
    if (S) {
      const y = { measured: [], set: [], main: [] };
      for (const w of t.hist) {
        const M = Math.max(0, l(w.t)), W = this._live(w);
        y.measured.push({ m: M, v: W.measured }), y.set.push({ m: M, v: W.set }), y.main.push({ m: M, v: W.main });
      }
      for (const w of ["measured", "set", "main"])
        y[w].some((M) => M.v !== null) && R.push({ key: w, pts: y[w] });
    } else
      t.hist.forEach((y, w) => {
        var ts, es;
        const M = Math.max(0, l(y.t)), W = w + 1 < t.hist.length ? l(t.hist[w + 1].t) : o;
        if (W <= M || ze(y.s)) return;
        const yt = g[g.length - 1];
        if (yt && yt.state === y.s && Math.abs(yt.e - M) < 0.5) {
          yt.e = W;
          return;
        }
        const Zi = this.hass.states[this.entityId];
        g.push({
          s: M,
          e: W,
          state: y.s,
          on: jo.has(y.s),
          text: Zi ? ((es = (ts = this.hass).formatEntityState) == null ? void 0 : es.call(ts, { ...Zi, state: y.s, attributes: y.a }, y.s)) ?? y.s : y.s
        });
      });
    const P = [...t.sent].sort((y, w) => y - w), I = t.log.filter((y) => y.context && !y.user).map((y) => y.t).sort((y, w) => y - w), et = (y) => Ls(P, y, Hs), Q = [];
    let de = (Gi = t.hist[0]) == null ? void 0 : Gi.s;
    for (const y of t.log) {
      if (ze(y.state)) continue;
      const w = y.state === de;
      de = y.state, (y.user || !y.context && !w && !et(y.t)) && Q.push(l(y.t));
    }
    const Ur = a === "climate" ? "set" : a === "light" ? "main" : null, Fi = R.find((y) => y.key === Ur), Wi = [];
    if (Fi) {
      let y = null;
      for (const w of Fi.pts) {
        if (w.v !== null && y !== null && Math.abs(w.v - y) > 0.01) {
          const M = i + w.m * 6e4;
          Wi.push(w.m);
          const W = Ls(I, M, Hs);
          !et(M) && !W && !Q.some((yt) => Math.abs(yt - w.m) <= 1) && Q.push(w.m);
        }
        w.v !== null && (y = w.v);
      }
    }
    Q.sort((y, w) => y - w);
    const Ki = [
      ...x.map((y) => y.m),
      ...t.sent.map(l),
      ...Wi,
      ...g.map((y) => y.s),
      ...Q
    ].sort((y, w) => y - w), ei = [];
    for (const y of Q) {
      if (y <= 1 || y > o) continue;
      const w = Ki[zr(Ki, y + 0.5)], M = Math.min(w ?? o, o);
      M > y ? ei.push([y, M]) : ei.push([y, Math.min(y + 5, r)]);
    }
    let Ce = 0, Ee = 100;
    if (S && a !== "cover" && a !== "light") {
      const y = [...R.flatMap((w) => w.pts.map((M) => M.v)), ...x.map((w) => w.value), ...A.steps.map((w) => w.value)].filter((w) => w !== null);
      y.length && (Ce = Math.floor(y.reduce((w, M) => Math.min(w, M), 1 / 0) - 1), Ee = Math.ceil(y.reduce((w, M) => Math.max(w, M), -1 / 0) + 1), Ee - Ce < 2 && (Ee = Ce + 2));
    }
    const Hr = String(((Yi = this.hass.states[this.entityId]) == null ? void 0 : Yi.attributes.unit_of_measurement) ?? (a === "climate" ? ((Qi = (Xi = this.hass.config) == null ? void 0 : Xi.unit_system) == null ? void 0 : Qi.temperature) ?? "°C" : a === "cover" || a === "light" ? "%" : ""));
    return {
      span: r,
      pastEnd: o,
      isToday: i <= n && n < s,
      kind: S ? "curve" : "band",
      lines: R,
      bands: g,
      markers: x,
      planned: A,
      shade: H,
      manual: ei,
      lo: Ce,
      hi: Ee,
      unit: Hr
    };
  }
  // ---- interaction ----
  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  get _historyPath() {
    const { startMs: t, endMs: e } = Rt(this.date, this._tz);
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
    let o = "", l = !1;
    return t.forEach((a, d) => {
      const u = d + 1 < t.length ? t[d + 1].m : e.pastEnd;
      let _ = a.m, m = u;
      if (n && (_ = Math.max(_, n[0]), m = Math.min(m, n[1]), m < _)) {
        l = !1;
        return;
      }
      if (a.v === null) {
        l = !1;
        return;
      }
      const f = s(a.v);
      r ? o += l ? `V${f.toFixed(1)}H${i(m).toFixed(1)}` : `M${i(_).toFixed(1)},${f.toFixed(1)}H${i(m).toFixed(1)}` : (o += `${l ? "L" : "M"}${i(_).toFixed(1)},${f.toFixed(1)}`, (d + 1 === t.length || n && m < u) && (o += `L${i(m).toFixed(1)},${f.toFixed(1)}`)), l = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const t = this._lang, e = this._model;
    let i;
    return e ? i = this._renderChart(e) : i = c`<div class="note">${h(t, "chart_loading")}</div>`, c`<div class="box">${i}</div>${e ? c`${this._legend(e)}
      <div class="availability" role="status">
        ${this._failed ? c`<p>${h(t, "chart_history_failed")}</p>` : !e.lines.length && !e.bands.length ? c`<p>${h(t, e.pastEnd === 0 ? "chart_future_history" : "chart_no_history")}</p>` : p}
        ${!e.markers.some((s) => !s.ignored) && !e.planned.zones.length ? c`<p>${h(t, "chart_no_planned")}</p>` : p}
      </div>` : p}`;
  }
  /** Name the person sees on the card for this chart: the program's own name for a one-device program. */
  get _shownName() {
    var t;
    return ((t = this.program) == null ? void 0 : t.entities.length) === 1 ? this.program.name : _t(this.hass, this.entityId);
  }
  _legend(t) {
    const e = this._lang, i = (r, n, o) => c`<span class="key"><i class=${r} style=${""}></i>${n}</span>`, s = (r) => t.lines.some((n) => n.key === r);
    return c`<div class="legend">
      ${t.markers.length || t.planned.steps.length ? i("planned", h(e, "planned")) : p}
      ${s("measured") ? i("measured", h(e, "measured")) : p}
      ${s("set") ? i("set", h(e, "ch_set")) : p}
      ${t.shade.length ? i("active", h(e, "active_key")) : p}
      ${t.manual.length ? i("manual", h(e, "manual")) : p}
    </div>`;
  }
  _renderChart(t) {
    const e = this._lang, i = this._width, s = t.kind === "curve", r = s ? 150 : 84, n = { l: s ? 38 : 8, r: 10, t: 22, b: 22 }, o = (g) => n.l + g / t.span * (i - n.l - n.r), l = (g) => n.t + (1 - (g - t.lo) / (t.hi - t.lo)) * (r - n.t - n.b), { startMs: a } = Rt(this.date, this._tz), d = (g) => Jt("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" }).format(new Date(a + g * 6e4)), u = [];
    for (let g = 0; g <= t.span; g += 180) u.push(g);
    const _ = [];
    if (s) {
      const g = t.hi - t.lo, P = [1, 2, 5, 10, 20, 25, 50].find((I) => g / I <= 4) ?? 100;
      for (let I = Math.ceil(t.lo / P) * P; I <= t.hi + 1e-9; I += P) _.push(I);
    }
    const m = n.t - 12, f = n.t, b = r - n.t - n.b, x = t.shade.map((g) => {
      const P = Math.max(No, o(g.to) - o(g.from));
      return D`<rect class="shade" x=${o(g.from)} y=${f} width=${P} height=${b}></rect>
        <rect class="shade-edge" x=${o(g.from)} y=${f + b - Ks} width=${P} height=${Ks}></rect>`;
    }), E = (g) => s && g.value !== null ? l(g.value) : m, k = [], A = (g, P) => {
      const I = Math.min(Math.max(o(g.m), 14), i - 14), et = Math.max(P - 8, 9);
      return k.some((Q) => Math.abs(Q.x - I) < 26 && Math.abs(Q.y - et) < 12) ? null : (k.push({ x: I, y: et }), { lx: I, ly: et });
    }, H = (g) => {
      const P = E(g), I = g.value !== null ? A(g, P) : null, et = g.label.color;
      return D`
        <line class="drop" x1=${o(g.m)} x2=${o(g.m)} y1=${P} y2=${r - n.b}></line>
        ${g.sun ? p : D`<circle class="mk ${g.end ? "end" : ""} ${g.ignored ? "faded" : ""}" cx=${o(g.m)} cy=${P} r="5" style="--c:${et}"></circle>`}
        ${g.value !== null && I ? D`<text class="val" x=${I.lx} y=${I.ly} text-anchor="middle">${Number(g.value.toFixed(1))}</text>` : p}`;
    }, S = s ? t.lines.find((g) => g.key === "set") ?? t.lines.find((g) => g.key === "main") ?? t.lines[0] : void 0, R = t.isToday ? D`<line class="now" x1=${o(t.pastEnd)} x2=${o(t.pastEnd)} y1=${n.t - 4} y2=${r - n.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${o(t.pastEnd) - 6}, ${n.t - 17}) scale(0.5)"><path d=${To}></path></g>` : p;
    return c`<div class="cwrap">
      <svg width=${i} height=${r} viewBox="0 0 ${i} ${r}" tabindex="0" role="button"
        aria-label=${h(e, "chart_open", { name: this._shownName })}
        @click=${() => this._open()}
        @keydown=${(g) => {
      (g.key === "Enter" || g.key === " ") && (g.preventDefault(), this._open());
    }}>
        ${s ? x : p}
        ${_.map((g) => D`<line class="grid" x1=${n.l} x2=${i - n.r} y1=${l(g)} y2=${l(g)}></line>
          <text class="ylab" x=${n.l - 4} y=${l(g) + 3} text-anchor="end">${Number(g.toFixed(1))}</text>`)}
        ${s && t.unit ? D`<text class="unit" x="2" y="10">${t.unit}</text>` : p}
        ${u.map((g) => D`<text class="xlab" x=${o(g)} y=${r - 6} text-anchor=${g === 0 ? "start" : "middle"}>${Number(d(g))}h</text>`)}
        ${s ? p : D`
          <rect class="track" x=${n.l} y=${f} width=${i - n.l - n.r} height=${b} rx="6"></rect>
          ${t.bands.map((g) => D`<rect class="band ${g.on ? "on" : ""}" x=${o(g.s)} y=${f} width=${Math.max(1, o(g.e) - o(g.s))} height=${b}></rect>`)}
          ${x}
          ${t.bands.map((g) => {
      const P = o(g.e) - o(g.s);
      return Ws(g.text, P) ? D`<text class="btxt" x=${o(g.s) + P / 2} y=${f + b / 2 + 4} text-anchor="middle">${Ws(g.text, P)}</text>` : p;
    })}
          ${t.manual.map(([g, P]) => D`<rect class="red-band" x=${o(g)} y=${f} width=${Math.max(3, o(P) - o(g))} height=${b}></rect>`)}`}
        ${s ? t.lines.map((g) => D`<path class="line ${g.key}" d=${this._path(g.pts, t, o, l, g.key === "set")}></path>`) : p}
        ${s ? t.manual.map((g) => {
      const P = S == null ? void 0 : S.pts.find((et, Q) => {
        var de;
        return et.v !== null && (((de = S.pts[Q + 1]) == null ? void 0 : de.m) ?? 1 / 0) > g[0];
      }), I = (P == null ? void 0 : P.v) ?? null;
      return D`${S ? D`<path class="line red" d=${this._path(S.pts, t, o, l, S.key === "set", g)}></path>` : p}
            ${I !== null ? D`<circle class="reddot" cx=${o(g[0])} cy=${l(I)} r="3.5"></circle>` : p}`;
    }) : p}
        ${s ? t.planned.steps.map((g) => D`<path class="plan" d="M${o(g.from).toFixed(1)},${l(g.value).toFixed(1)}H${o(g.to).toFixed(1)}" style="--c:${g.color}"></path>`) : p}
        ${s ? t.planned.risers.map((g) => D`<line class="riser" x1=${o(g.m)} x2=${o(g.m)} y1=${l(g.from)} y2=${l(g.to)} style="--c:${g.color}"></line>`) : p}
        ${[...t.markers].sort((g, P) => g.m - P.m).map(H)}
        ${R}
        <rect class="hit" x="0" y="0" width=${i} height=${r}></rect>
      </svg>
      ${t.markers.filter((g) => g.sun).map((g) => c`<wp-tip class="suntip ${g.ignored ? "faded" : ""}"
        style="left:${o(g.m)}px;top:${E(g)}px;--c:${g.label.color}" text=${$e(e, g.spec, g.m)}>
        <span class="sunc"><ha-icon icon=${g.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${t.isToday ? c`<wp-tip class="nowtip" style="left:${o(t.pastEnd)}px;top:${n.t - 11}px"
        text=${Di(e, ut(/* @__PURE__ */ new Date(), this._tz))}></wp-tip>` : p}
    </div>`;
  }
};
ot.styles = V`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    .availability { color: var(--secondary-text-color); font-size: 13px; line-height: 1.5; }
    .availability p { margin: 4px 0; }
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
    text.unit { font-size: 11px; }
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
    /* active periods: same colour in light and dark themes, translucent so the curve stays readable on top */
    .shade { fill: var(--wp-active-color, var(--primary-color)); opacity: 0.28; }
    .shade-edge { fill: var(--wp-active-color, var(--primary-color)); }
    .plan { fill: none; stroke: var(--c); stroke-width: 3; stroke-linecap: butt; }
    .riser { stroke: var(--c); stroke-width: 1.2; opacity: 0.8; }
    .drop { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 1 3; opacity: 0.6; }
    .mk { fill: var(--c); stroke: var(--card-background-color); stroke-width: 1.5; }
    .mk.end { fill: var(--card-background-color); stroke: var(--c); stroke-width: 2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
    .nowicon path { fill: var(--primary-text-color); }
    .hit { fill: transparent; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 14px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.set { border-top: 2px dashed var(--primary-text-color); }
    /* a filled dot at the left, like the marker drawn at the start of each planned step (.mk, r=5), then the line */
    .key i.planned { position: relative; width: 24px; height: 0; border-top: 3px solid var(--secondary-text-color); border-radius: 2px; }
    .key i.planned::before {
      content: ""; position: absolute; left: 0; top: -6.5px; width: 10px; height: 10px; box-sizing: border-box; border-radius: 50%;
      background: var(--secondary-text-color); border: 1.5px solid var(--card-background-color);
    }

    /* the band of the chart in small: translucent block with the solid strip at its foot */
    .key i.active { position: relative; width: 16px; height: 12px; box-sizing: border-box; border-top: 0;
      border-bottom: 3px solid var(--wp-active-color, var(--primary-color)); }
    .key i.active::before {
      content: ""; position: absolute; inset: 0; background: var(--wp-active-color, var(--primary-color)); opacity: 0.28;
    }
    .key i.manual { border-top: 3px solid var(--error-color, #db4437); }
  `;
ft([
  v({ attribute: !1 })
], ot.prototype, "hass", 2);
ft([
  v({ attribute: !1 })
], ot.prototype, "data", 2);
ft([
  v({ attribute: !1 })
], ot.prototype, "program", 2);
ft([
  v({ attribute: "entity-id" })
], ot.prototype, "entityId", 2);
ft([
  v()
], ot.prototype, "date", 2);
ft([
  v({ attribute: !1 })
], ot.prototype, "slots", 2);
ft([
  $()
], ot.prototype, "_width", 2);
ft([
  $()
], ot.prototype, "_loaded", 2);
ft([
  $()
], ot.prototype, "_failed", 2);
ot = ft([
  J("wp-chart")
], ot);
var Ro = Object.defineProperty, Lo = Object.getOwnPropertyDescriptor, gt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Lo(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Ro(e, i, r), r;
};
const Bo = ["sunrise", "sunset"], qo = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" };
function Ei(t) {
  const e = Math.abs(t);
  return e < 60 ? `${e} min` : `${Math.floor(e / 60)}h${e % 60 ? String(e % 60).padStart(2, "0") : ""}`;
}
function Ir(t, e, i) {
  const s = i && (e.sun === "sunrise" || e.sun === "sunset") ? `sun_${e.sun}` : e.sun === "sunrise" || e.sun === "sunset" ? `sun_${e.sun}_short` : `sun_${e.sun}`;
  return h(t, s).toLowerCase();
}
function Dr(t, e) {
  return e.earliest && e.latest ? h(t, "sun_limits_both", { a: e.earliest, b: e.latest }) : e.earliest ? h(t, "sun_limits_earliest", { a: e.earliest }) : e.latest ? h(t, "sun_limits_latest", { b: e.latest }) : "";
}
function Tr(t, e) {
  var n, o, l, a;
  if (!t || !("sun" in e)) return null;
  const i = (l = (o = (n = t.states) == null ? void 0 : n["sun.sun"]) == null ? void 0 : o.attributes) == null ? void 0 : l[qo[e.sun]], s = (a = t.config) == null ? void 0 : a.time_zone;
  if (!i || !s || Number.isNaN(new Date(i).getTime()) || it(new Date(i), s) !== it(/* @__PURE__ */ new Date(), s)) return null;
  let r = ut(i, s) + (e.offset ?? 0);
  return e.earliest && (r = Math.max(r, G(e.earliest))), e.latest && (r = Math.min(r, G(e.latest))), Math.max(0, Math.min(C, r));
}
function Uo(t, e) {
  if (!("sun" in e) || !e.offset && !e.earliest && !e.latest) return "";
  const i = e.offset ? ` ${e.offset > 0 ? "+" : "−"} ${Ei(e.offset)}` : "";
  return h(t, "sun_real", { base: `${Ir(t, e, !0)}${i}`, limits: Dr(t, e) });
}
function me(t, e) {
  const i = e % C, s = `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`;
  return e >= C ? `${s} (${h(t, "next_day")})` : s;
}
function Ho(t, e, i) {
  const s = Tr(e, i);
  return s === null ? "" : h(t, "sun_today", { time: me(t, s) });
}
function Fo(t, e, i = "start", s) {
  const r = e.random_minutes ?? 0, n = i === "end" ? "random_range_end" : "random_range_start";
  if ("time" in e) {
    const d = G(e.time);
    return `${h(t, n, { start: me(t, d), end: me(t, d + r) })}.`;
  }
  const o = Tr(s, e);
  if (o !== null) {
    const d = e.latest ? Math.min(o + r, G(e.latest)) : o + r;
    return `${h(t, n, { start: me(t, o), end: me(t, Math.max(o, d)) })}.`;
  }
  const l = e.offset ?? 0, a = `${Ir(t, e, !1)}${l ? ` ${l > 0 ? "+" : "−"} ${Ei(l)}` : ""}`;
  return `${h(t, n, { start: a, end: h(t, "random_later", { n: Ei(r) }) })}${Dr(t, e)}.`;
}
let at = class extends U {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return Gt(this.hass);
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
    if (i)
      if ("sun" in i && i.sun === e) this._update(t, { time: this._last[t], random_minutes: i.random_minutes });
      else {
        "time" in i && (this._last = { ...this._last, [t]: i.time });
        const s = "sun" in i ? { offset: i.offset ?? 0, earliest: i.earliest, latest: i.latest } : { offset: 0 };
        this._update(t, this._clean({ sun: e, ...s, random_minutes: i.random_minutes }));
      }
  }
  _fromInput(t, e) {
    var s;
    if (!/^\d{2}:\d{2}$/.test(e)) return;
    let i = G(e);
    t === "end" && i === 0 && (i = C), this._update(t, { time: i >= C ? "24:00" : e, random_minutes: (s = this.group.slot[t]) == null ? void 0 : s.random_minutes });
  }
  /** Drops absent optional keys so saved specs stay minimal. */
  _clean(t) {
    return Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
  }
  /** Sets or clears (empty value) the "not before" / "not after" limit of a solar time. */
  _limit(t, e, i) {
    const s = this.group.slot[t];
    if (!s || !("sun" in s) || i && !/^\d{2}:\d{2}$/.test(i)) return;
    const { [e]: r, ...n } = s;
    this._update(t, i ? { ...n, [e]: i } : n);
  }
  _random(t, e) {
    const i = this.group.slot[t];
    if (!i || !Number.isInteger(e) || e < 0 || e > 240) return;
    const { random_minutes: s, ...r } = i;
    this._update(t, e ? { ...r, random_minutes: e } : r);
  }
  _timeBlock(t, e) {
    const i = this.group.slot[t];
    if (!i) return p;
    const s = this._lang, r = Z(s), n = this.disabled;
    return c`
      <div class="time" role="group" aria-label=${e}>
        <button class="step" ?disabled=${n} aria-label=${h(s, "minus15")} title=${h(s, "minus15")} @click=${() => this._update(t, ks(i, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in i ? c`<input type="time" step="60" .value=${i.time === "24:00" ? "00:00" : i.time} ?disabled=${n}
              aria-label=${e} @change=${(o) => this._fromInput(t, o.target.value)} />` : c`<output class="sun">${_e(s, { ...i, random_minutes: 0 })}</output>`}
        <button class="step" ?disabled=${n} aria-label=${h(s, "plus15")} title=${h(s, "plus15")} @click=${() => this._update(t, ks(i, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${Bo.map((o) => {
      const l = "sun" in i && i.sun === o;
      return c`<button class="chip ${l ? "on" : ""}" aria-pressed=${l} ?disabled=${n}
            @click=${() => this._toggleSun(t, o)}><ha-icon icon=${o === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${r[`sun_${o}_short`] ?? o}</button>`;
    })}
      </div>
      ${"sun" in i ? this._limits(t, i, e) : p}
      <div class="random">
        <label><input type="checkbox" aria-describedby=${`random-${t}`} .checked=${!!i.random_minutes} ?disabled=${n}
          @change=${(o) => this._random(t, o.target.checked ? 15 : 0)} />${h(s, "random_time")}</label>
        ${i.random_minutes ? c`<label>${h(s, "random_minutes")}<input type="number" aria-describedby=${`random-${t}`} min="1" max="240" step="1" required
          .value=${String(i.random_minutes)} ?disabled=${n} @change=${(o) => {
      const l = o.target;
      l.validity.valid && this._random(t, Number(l.value));
    }} /></label><small id=${`random-${t}`}>${Fo(s, i, t, this.hass)}</small>` : p}
      </div>
      `;
  }
  _limits(t, e, i) {
    const s = this._lang, r = (l) => c`<div class="limit">
      <label>${h(s, l === "earliest" ? "sun_earliest" : "sun_latest")}
        <input type="time" step="60" .value=${e[l] === "24:00" ? "00:00" : e[l] ?? ""} ?disabled=${this.disabled}
          aria-label=${`${i}: ${h(s, l === "earliest" ? "sun_earliest" : "sun_latest")}`}
          @change=${(a) => this._limit(t, l, a.target.value)} /></label>
      ${e[l] ? c`<button class="clear" ?disabled=${this.disabled} aria-label=${h(s, "sun_limit_clear")} title=${h(s, "sun_limit_clear")}
        @click=${() => this._limit(t, l, "")}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
    </div>`, n = Uo(s, e), o = Ho(s, this.hass, e);
    return c`<div class="limits" role="group">${r("earliest")}${r("latest")}</div>
      ${n || o ? c`<small class="sun-help">${n}${n && o ? " " : ""}${o}</small>` : p}
      ${ki(e) ? c`<small class="bad" role="alert">${h(s, "err_sun_bounds")}</small>` : p}`;
  }
  _toggleEnd(t) {
    if (!t) return this._update("end", null);
    const e = this.group.slot.start, i = "time" in e ? G(e.time) : 12 * 60;
    this._update("end", { time: Wt(Math.min(C - 5, i + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(t) {
    const e = this.group.days.includes(t) ? this.group.days.filter((i) => i !== t) : [...this.group.days, t];
    this._set({}, e.sort((i, s) => i - s));
  }
  render() {
    if (!this.group || !this.program) return p;
    const t = this._lang, e = Z(t), i = this.group.slot, s = this.group.days, r = (o, l) => o.length === l.length && l.every((a) => o.includes(a)), n = (o, l) => c`<button class="chip small ${r(s, l) ? "on" : ""}"
      aria-pressed=${r(s, l)} ?disabled=${this.disabled} @click=${() => this._set({}, l === xe && r(s, l) ? [] : [...l])}>${r(s, l) ? c`<ha-icon icon="mdi:check"></ha-icon>` : p}${o}</button>`;
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
        ${i.end ? this._timeBlock("end", h(t, "end")) : p}
      </section>
      <section>
        <h4>${h(t, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && r(s, [this.dayOnly]) ? c`<div class="chips"><span class="only">${e.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${h(t, "apply_other_days")}</button></div>` : c`<div class="days" role="group" aria-label=${h(t, "days_label")}>
          ${e.days_short.map((o, l) => c`<button class="day ${s.includes(l) ? "on" : ""}" aria-pressed=${s.includes(l)}
            aria-label=${e.days[l]} ?disabled=${this.disabled} @click=${() => this._toggleDay(l)}>${s.includes(l) ? c`<ha-icon icon="mdi:check"></ha-icon>` : p}<span>${o}</span></button>`)}
        </div>
        <div class="chips">
          ${n(h(t, "all_days"), xe)}${n(h(t, "weekdays"), wr)}${n(h(t, "weekend"), xr)}
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
at.styles = [$t, V`
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
    .limits { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
    .limit { display: flex; align-items: flex-end; gap: 4px; min-width: 0; }
    .limit label { flex: 1; min-width: 0; display: grid; gap: 2px; font-size: 13px; color: var(--secondary-text-color); }
    .limit input[type="time"] {
      width: 100%; min-width: 0; box-sizing: border-box; min-height: 44px; font: inherit; font-size: 16px;
      color: var(--primary-text-color); background: var(--card-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 8px;
    }
    .limit .clear {
      flex: none; width: 44px; height: 44px; border: none; background: none; color: var(--secondary-text-color);
      cursor: pointer; display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 20px;
    }
    .limit .clear:disabled { opacity: 0.4; cursor: default; }
    .sun-help { display: block; margin-bottom: 8px; color: var(--secondary-text-color); }
    small.bad { color: var(--error-color, #db4437); display: block; margin-bottom: 8px; }
    .random { display: grid; gap: 6px; margin: 8px 0; }
    .random label { display: flex; align-items: center; gap: 8px; min-height: 44px; }
    .random input[type="checkbox"] { width: 20px; height: 20px; }
    .random input[type="number"] { width: 76px; min-height: 44px; box-sizing: border-box; }
    .random small { color: var(--secondary-text-color); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips + .time { margin-top: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .day.on { border-color: transparent; background-clip: padding-box; box-shadow: inset 0 0 0 1px var(--primary-color); }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 16px; font-weight: 500; margin-right: 8px; }
    /* 7 x 44 px at 360 px: the row borrows the editor's side padding; the pill is drawn inside a transparent 2 px border so the touch target stays 44 px wide */
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; margin: 0 -8px 8px; }
    .day {
      min-height: 48px; min-width: 44px; padding: 0; border-radius: 14px; border: 2px solid transparent; background-clip: padding-box;
      box-shadow: inset 0 0 0 1px var(--divider-color);
      background-color: transparent; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
  `];
gt([
  v({ attribute: !1 })
], at.prototype, "hass", 2);
gt([
  v({ attribute: !1 })
], at.prototype, "data", 2);
gt([
  v({ attribute: !1 })
], at.prototype, "program", 2);
gt([
  v({ attribute: !1 })
], at.prototype, "group", 2);
gt([
  v({ attribute: !1 })
], at.prototype, "entityIds", 2);
gt([
  v({ type: Boolean })
], at.prototype, "disabled", 2);
gt([
  v({ type: Number })
], at.prototype, "dayOnly", 2);
gt([
  $()
], at.prototype, "_more", 2);
gt([
  $()
], at.prototype, "_last", 2);
at = gt([
  J("wp-slot-form")
], at);
var Wo = Object.defineProperty, Ko = Object.getOwnPropertyDescriptor, j = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ko(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Wo(e, i, r), r;
};
const _i = (t) => t.kind === "device" ? `d:${t.entityId}` : `p:${t.programId}`, mi = 7;
let z = class extends U {
  constructor() {
    super(...arguments), this.chart = !0, this.profileId = null, this._viewProfileId = null, this._editProfileId = null, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._labelDraft = null, this._pickerKey = 0, this._fresh = /* @__PURE__ */ new Set(), this._programId = "", this._error = "", this._saving = !1, this._toggling = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (t) => !0, this._minutes = (t) => xt(this.hass, t);
  }
  get _lang() {
    return Gt(this.hass);
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /* ---- scope ---- */
  get _programs() {
    const t = this.data.programs;
    return [...this.scope.kind === "device" ? t.filter((i) => i.entities.some((s) => s.entity_id === this.scope.entityId)) : t.filter((i) => i.id === this.scope.programId)].sort((i, s) => i.priority - s.priority || i.name.localeCompare(s.name));
  }
  _modeProfile(t) {
    const e = this._open && t.id === this._programId ? this._editProfileId : this.profileId ?? (this.scope.kind === "program" ? this._viewProfileId : null);
    return e === null ? st(t, this.data) : t.profiles.find((i) => i.id === e);
  }
  get _modeOnly() {
    return this.profileId !== null || this._programs.some((t) => {
      var e, i;
      return ((e = this._modeProfile(t)) == null ? void 0 : e.id) !== ((i = st(t, this.data)) == null ? void 0 : i.id);
    });
  }
  _editProfile(t) {
    return t.profiles.find((e) => e.id === this._editProfileId);
  }
  get _entities() {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const t = this._programs[0];
    return t ? t.entities.map((e) => e.entity_id) : [];
  }
  get _title() {
    var t;
    return this.scope.kind === "device" ? _t(this.hass, this.scope.entityId) : ((t = this._programs[0]) == null ? void 0 : t.name) ?? "";
  }
  _rows() {
    const t = [];
    for (const e of this._programs) {
      const i = this._open && e.id === this._programId ? this._editProfile(e) : this._modeProfile(e);
      if (i)
        for (const s of qi(i, this._include, this._minutes))
          this._focus !== null && !s.days.includes(this._focus) || t.push({ program: e, group: s, key: `${e.id}|${s.ids[s.days[0]]}` });
    }
    return t;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: t, offset: e } = this.day;
    e >= -14 && e <= mi && (this._offset = e), this._focus = t, !this._rows().length && this._canEdit && this._add([t]);
  }
  /** Translated service names of the actions of the labels. */
  _loadNames() {
    const t = /* @__PURE__ */ new Set();
    for (const e of this.data.labels) e.action.kind === "service" && t.add(e.action.service.split(".")[0]);
    Se(this.hass, [...t]).then((e) => e && this.requestUpdate());
  }
  willUpdate(t) {
    var i, s;
    (!this._chartEntity || t.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const e = this._programs[0];
    if (this.chart && e && this.hass && !this._modeOnly) {
      const r = `${e.id}|${e.revision}|${(i = this._modeProfile(e)) == null ? void 0 : i.id}|${this._date}`;
      r !== this._loaded && (this._loaded = r, this._loadPreview(e.id, e.revision, this._date, r, (s = this._modeProfile(e)) == null ? void 0 : s.id));
    }
  }
  get _today() {
    return it(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return qt(this._today, this._offset);
  }
  async _loadPreview(t, e, i, s, r) {
    const n = ++this._token;
    try {
      const o = await Promise.all([qt(i, -1), i].map((l) => ur(this.hass, t, e, l, r)));
      n === this._token && s === this._loaded && (this._slots = o.flat());
    } catch {
      n === this._token && (this._slots = null);
    }
  }
  _go(t) {
    const e = this._offset + t;
    e < -14 || e > mi || (this._slots = null, this._offset = e);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(t, e, i, s = {}) {
    var r;
    this._editProfileId = ((r = this._modeProfile(e)) == null ? void 0 : r.id) ?? null, this._open = t, this._programId = e.id, this._group = i ? structuredClone(i) : null, this._restLabel = s.restLabel ?? null, this._rest = s.rest ?? null, this._dayOnly = s.dayOnly ?? null, this._openId = s.openId ?? null, this._base = null, this._origin = s.origin ? structuredClone(s.origin) : null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = structuredClone(e), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => this._revealEditor()));
  }
  /** Brings the opened editor into view. In two columns the schematic sits beside it: scroll only if the editor's top is out of view. */
  _revealEditor() {
    var n, o;
    const t = this.renderRoot.querySelector(".editor");
    if (!t) return;
    const e = typeof matchMedia == "function" && matchMedia("(min-width: 768px)").matches, i = (o = (n = this.renderRoot.querySelector("wp-dialog")) == null ? void 0 : n.shadowRoot) == null ? void 0 : o.querySelector(".content");
    if (!e || !i) {
      t.scrollIntoView({ block: "start" });
      return;
    }
    const s = t.getBoundingClientRect(), r = i.getBoundingClientRect();
    s.top >= r.top && s.top < r.bottom || (i.scrollTop += s.top - r.top);
  }
  /** Opens a slot row: the whole group, or only the focused day of it. */
  _openRow(t, e, i) {
    const s = As(i) ?? null;
    if (this._focus !== null && i.days.includes(this._focus)) {
      const { draft: r, rest: n } = Cs(i, this._focus);
      this._expand(t, e, r, { rest: n, dayOnly: this._focus, openId: s, origin: i });
    } else
      this._expand(t, e, i, { openId: s, origin: i });
  }
  _cancel() {
    this._editProfileId = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._origin = null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = null, this._restLabel = null, this._error = "";
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
  _add(t = this._focus === null ? xe : [this._focus]) {
    const e = this._programs[0], i = this._entities[0];
    if (!e || !i) return;
    const s = Li(this.hass, this.data, this._entities)[0], r = t.length === 1 ? t[0] : null, n = this._modeProfile(e);
    if (!n) return;
    const o = r === null ? void 0 : oo(n.days[r], this._minutes);
    this._expand("new", e, Ms((s == null ? void 0 : s.id) ?? "", t, o), { dayOnly: r }), this._dropBusy = r === null;
  }
  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  _duplicate() {
    const t = this._programs.find((m) => m.id === this._programId), e = this._group;
    if (!t || !e) return;
    const i = this._problem(t);
    if (i) {
      this._error = i;
      return;
    }
    const { start: s, end: r } = e.slot, n = xt(this.hass, s), o = r ? Math.max(15, xt(this.hass, r) - n) : 60, l = { openId: this._openId, rest: this._rest, draft: structuredClone(e) }, a = this._dayOnly, d = Ms(e.slot.label, e.days);
    d.slot = {
      ...structuredClone(e.slot),
      id: d.slot.id,
      start: Ss(this.hass, s, o),
      end: r ? Ss(this.hass, r, o) : null
    }, d.slot.end && xt(this.hass, d.slot.start) >= xt(this.hass, d.slot.end) && (d.slot.start = { time: Wt(Math.max(0, C - o)) }, d.slot.end = { time: Wt(C) });
    const u = this._origin, _ = this._editProfileId;
    this._expand("new", t, d, { dayOnly: a }), this._editProfileId = _, this._base = l, this._origin = u;
  }
  /* ---- saving ---- */
  /** The newest known version of a program: the pushed data, or what this screen saved last. */
  _live(t) {
    const e = this.data.programs.find((s) => s.id === t), i = this._saved[t];
    return i && (!e || i.revision > e.revision) ? i : e;
  }
  async _saveProgram(t) {
    var e, i, s, r;
    this._saving = !0;
    try {
      const n = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(t) });
      return n != null && n.program && (this._saved[t.id] = n.program, this.dispatchEvent(new CustomEvent("schedule-program-saved", { detail: n.program, bubbles: !0, composed: !0 }))), "ok";
    } catch (n) {
      const o = n;
      return (o == null ? void 0 : o.code) === "conflict" ? "conflict" : ((o == null ? void 0 : o.code) === "unauthorized" ? this._error = h(this._lang, "err_unauthorized") : (e = o == null ? void 0 : o.message) != null && e.includes("unknown_label") ? this._error = h(this._lang, "err_label") : (i = o == null ? void 0 : o.message) != null && i.includes("earliest_after_latest") ? this._error = h(this._lang, "err_sun_bounds") : (s = o == null ? void 0 : o.message) != null && s.includes("random_window_too_short") ? this._error = h(this._lang, "random_too_short") : (r = o == null ? void 0 : o.message) != null && r.includes("overlapping_slots") ? this._error = h(this._lang, "w_err_overlap") : /offset|invalid_random_minutes|at most|at least|out of range|invalid_time|invalid_clock/i.test((o == null ? void 0 : o.message) ?? "") ? this._error = h(this._lang, "err_time_range") : this._error = h(this._lang, "ss_err_save"), "error");
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
        i = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((l) => l.id === t), i && (this._saved[t] = i);
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
  /** Names the two colliding slots, the day and their times (the generic sentence when nothing is found). */
  _overlapText(t) {
    const e = this._lang, i = Es(t);
    if (!i) return h(e, "w_err_overlap");
    const s = (n) => {
      const o = F(this.data, n.label);
      return o ? rt(this.hass, o) : h(e, "w_err_overlap_slot");
    }, r = (n) => `${_e(e, n.start)}${n.end ? ` → ${_e(e, n.end)}` : ""}`;
    return h(e, "w_err_overlap_detail", {
      day: Z(e).days_short[i.day],
      a: s(i.a),
      a_time: r(i.a),
      b: s(i.b),
      b_time: r(i.b)
    });
  }
  _problem(t) {
    const e = this._lang, i = this._group;
    return i ? i.days.length ? ki(i.slot.start) || ki(i.slot.end) ? h(e, "err_sun_bounds") : i.slot.end && JSON.stringify(i.slot.start) === JSON.stringify(i.slot.end) ? h(e, "w_err_same") : !F(this.data, i.slot.label) && !this._fresh.has(i.slot.label) ? h(e, "err_action") : "" : h(e, "err_days") : "";
  }
  /**
   * The group being edited against the current profile: unchanged, merged when only its other days moved,
   * or changed meanwhile (then the editor shows the new version, or closes if it is gone).
   */
  _checkOrigin(t, e) {
    const i = this._origin;
    if (!i || !this._openId) return "ok";
    const s = io(t, this._include, this._minutes, this._openId), r = so(s, i);
    if (r === "same") return "ok";
    if (r === "days" && s && this._dayOnly !== null && s.days.includes(this._dayOnly))
      return this._rest = Cs(s, this._dayOnly).rest, this._origin = structuredClone(s), "ok";
    const n = h(this._lang, "ss_changed");
    if (s) {
      const o = this._open ?? `${e.id}|${As(s)}`, l = this._editProfileId;
      this._openRow(o, e, s), this._editProfileId = l;
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
    const t = this._live(this._programId);
    if (!t || !this._editProfile(t)) {
      this._error = h(this._lang, "ss_changed");
      return;
    }
    if (!await this._saveLabelDraft()) return;
    const e = this._group, i = this._live(this._programId);
    if (!i || !e) return;
    const s = this._problem(i);
    if (s) {
      this._error = s;
      return;
    }
    const r = this._include;
    let n = [], o = !1;
    await this._commit(i.id, (a) => {
      const d = this._editProfile(a);
      if (!d) return { error: h(this._lang, "ss_changed") };
      if (this._checkOrigin(d, a) === "changed")
        return o = !0, { changed: !0 };
      let u = d;
      this._base && (u = Qt(u, r, this._minutes, this._base));
      let _ = e;
      if (n = [], this._dropBusy) {
        const { free: f, busy: b } = no(u, r, this._minutes, e.slot, e.days);
        if (!f.length) return { error: this._overlapText(Qt(u, r, this._minutes, { openId: this._openId, rest: this._rest, draft: e })) };
        _ = { ...e, days: f }, n = b;
      }
      const m = Qt(u, r, this._minutes, { openId: this._openId, rest: this._rest, draft: _ });
      return Es(m) ? { error: this._overlapText(m) } : { program: { ...a, entities: this._withOverrides(a), profiles: a.profiles.map((f) => f.id === d.id ? m : f) } };
    }) && !o && (this._cancel(), n.length && (this._note = h(this._lang, "w_dropped", { days: n.map((a) => Z(this._lang).days_short[a]).join(" ") })));
  }
  async _deleteRow() {
    if (!this._canEdit || this._saving) return;
    if (this._open === "new") {
      this._cancel();
      return;
    }
    const t = this._live(this._programId);
    if (!t || !this._openId || !await Et(this, h(this._lang, "w_confirm_slot"), h(this._lang, "yes"), h(this._lang, "no"))) return;
    await this._commit(t.id, (i) => {
      const s = this._editProfile(i);
      if (!s) return { error: h(this._lang, "ss_changed") };
      if (this._checkOrigin(s, i) === "changed") return { changed: !0 };
      const r = Qt(s, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
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
    if (this._toggling) {
      e.checked = this._enabled;
      return;
    }
    this._toggling = !0;
    try {
      if (!t && !await Et(this, h(this._lang, "confirm_pause", { name: this._title }), h(this._lang, "yes"), h(this._lang, "no"))) {
        e.checked = !0;
        return;
      }
      for (const i of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: i.id, enabled: t });
    } catch (i) {
      this._error = h(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    } finally {
      this._toggling = !1, e.checked = this._enabled;
    }
  }
  async _deleteAll() {
    if (await Et(this, h(this._lang, "confirm_delete_schedule", { name: this._title }), h(this._lang, "yes"), h(this._lang, "no")))
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
    const e = this._lang, i = _e(e, t.start);
    return t.end ? `${i}–${_e(e, t.end)}` : i;
  }
  _rowText(t) {
    const e = this._lang, i = F(this.data, t.slot.label), s = Yn(e, Z(e).days_short, t.days);
    return {
      text: [i ? rt(this.hass, i) : "", this._when(t.slot)].filter(Boolean).join(" · "),
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
      <span class="txt"><span class="l1">${r}</span>${this._focus === null ? c`<span class="l2">${n}</span>` : p}${this._programs.length > 1 ? c`<small>${e.name}</small>` : p}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(t, e) {
    const i = this._lang, s = e === "new", r = this._entities.filter((n) => t.entities.some((o) => o.entity_id === n));
    return c`<div class="editor">
      ${Fe(this._pickerKey, c`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .group=${this._group} .entityIds=${r}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(n) => {
      n.stopPropagation(), this._labelDraft = n.detail, this._error = "";
    }}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>`)}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${h(i, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${h(i, "cancel")}</button>
      </div>
      ${s || this._labelDraft ? p : c`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${h(i, "duplicate")}</button>`}
      <button class="btn danger-line alone" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${h(i, "delete")}</button>
    </div>`;
  }
  _renderRest() {
    const t = this._lang, e = this._programs[0];
    return e ? this._entities.filter((i) => e.entities.some((s) => s.entity_id === i)).map((i) => {
      const s = e.entities.find((l) => l.entity_id === i), r = `rest:${i}`, n = this._entities.length > 1 ? `${h(t, "rest_of_time")} · ${_t(this.hass, i)}` : h(t, "rest_of_time");
      if (this._open === r)
        return c`<div class="editor"><h4>${n}</h4>
          ${Fe(this._pickerKey, c`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .entityIds=${[i]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(l) => {
          l.stopPropagation(), this._labelDraft = l.detail, this._error = "";
        }}
            @label-change=${(l) => {
          l.stopPropagation(), this._restLabel = l.detail;
        }}></wp-label-picker>`)}
          ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(i)}>${h(t, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${h(t, "cancel")}</button>
          </div></div>`;
      const o = F(this.data, s.default_label);
      return c`<button class="row rest" aria-expanded="false" @click=${() => this._expand(r, e, null, { restLabel: s.default_label ?? null })}>
        ${o ? c`<span class="dot" style="background:${o.color}"></span>` : c`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${n} · <b>${o ? rt(this.hass, o) : h(t, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : p;
  }
  /** Keep the whole week visible, including the unsaved slot being edited. */
  _renderWeek() {
    const t = this._lang;
    return c`<section class="schematic" aria-label=${h(t, "week")}>
      ${this._entities.map((e) => c`
        ${this._entities.length > 1 ? c`<h4>${_t(this.hass, e)}</h4>` : p}
        ${Z(t).days_short.map((i, s) => {
      const r = [];
      for (const n of [...this._programs].reverse()) {
        const o = this._live(n.id) ?? n;
        if (!o.entities.some((a) => a.entity_id === e)) continue;
        let l = o.id === this._programId && this._open ? this._editProfile(o) : this._modeProfile(o);
        if (l) {
          o.id === this._programId && this._group && (this._base && (l = Qt(l, this._include, this._minutes, this._base)), l = Qt(l, this._include, this._minutes, {
            openId: this._openId,
            rest: this._rest,
            draft: this._group
          }));
          for (const a of [(s + 6) % 7, s])
            for (const d of l.days[a]) {
              const u = F(this.data, d.label);
              if (!u || !yr(this.hass, e, St(o, e, u), Ve(o, e))) continue;
              const _ = this._minutes(d.start), m = d.end ? this._minutes(d.end) : null, f = m !== null && m < _ && m < C / 2;
              a !== s && !f || m !== null && m <= _ && !f || r.push({
                start: a === s ? _ : 0,
                end: a !== s ? m : f ? C : m ?? _ + 10,
                color: u.color,
                label: rt(this.hass, u),
                marker: m === null,
                startSun: a === s ? Ct(d.start) : null,
                endSun: f && a === s ? null : Ct(d.end),
                startSpec: d.start,
                endSpec: d.end
              });
            }
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
    if (!this.chart || !e || !this._chartEntity || this._modeOnly) return p;
    const i = this._date, s = new Intl.DateTimeFormat(t, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${i}T12:00:00Z`));
    return c`<section class="chart">
      ${this._entities.length > 1 ? c`<select aria-label=${h(t, "chart")} @change=${(r) => this._chartEntity = r.target.value}>
        ${this._entities.map((r) => c`<option value=${r} ?selected=${r === this._chartEntity}>${_t(this.hass, r)}</option>`)}</select>` : p}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${h(t, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? h(t, "today") : s}</span>
        <button class="ibtn" ?disabled=${this._offset >= mi} aria-label=${h(t, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${e} entity-id=${this._chartEntity} date=${i}
        .slots=${this._slots} @open-history=${(r) => this._openHistory(r.detail)}></wp-chart>
    </section>`;
  }
  render() {
    var s;
    if (!this.hass || !this.data || !this.scope) return p;
    const t = this._lang;
    if (!this._programs.length)
      return c`<wp-dialog open heading=${this._title}><p class="muted">${h(t, "no_program")}</p></wp-dialog>`;
    const e = this._rows(), i = this.scope.kind === "program" && !this._modeProfile(this._programs[0]);
    return c`
      <wp-dialog open columns heading=${this._title}>
        <div class="cols">
        <div class="params">
        ${i ? c`<p class="err" role="alert">${h(t, "mode_removed")}</p>` : p}
        ${this._canEdit ? p : c`<p class="err" role="alert">${h(t, "read_only")}</p>`}
        ${this._error && !this._open ? c`<p class="err" role="alert">${this._error}</p>` : p}
        ${this._open !== null || this._modeOnly ? p : c`<label class="switch">
          <span class="grow">${h(t, "schedule_on")}</span>
          <span class="state">${this._enabled ? h(t, "running") : h(t, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit || this._toggling}
            @change=${(r) => void this._setEnabled(r.target.checked, r.target)} />
          <span class="track"></span>
        </label>`}
        ${this.scope.kind === "program" ? c`<label class="mode-select">${h(t, "profile")}
          <select .value=${((s = this._modeProfile(this._programs[0])) == null ? void 0 : s.id) ?? ""} ?disabled=${this.profileId !== null || this._open !== null}
            @change=${(r) => {
      this._viewProfileId = r.target.value, this._slots = null, this._error = "";
    }}>
            ${i ? c`<option value="" selected>${h(t, "mode_removed")}</option>` : p}
            ${this._programs[0].profiles.map((r) => {
      var n;
      return c`<option value=${r.id} ?selected=${r.id === ((n = this._modeProfile(this._programs[0])) == null ? void 0 : n.id)}>${r.name}</option>`;
    })}
          </select></label>` : p}
        ${this._modeOnly ? c`<p class="muted note">${h(t, "mode_schedule_hint")}</p>` : p}
        ${this._modeOnly ? p : c`<div class="rests">${this._renderRest()}</div>`}
        ${this._focus !== null && this._open === null ? c`<div class="focus">
          <button class="chip back" @click=${() => {
      this._focus = null, this._note = "";
    }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${h(t, "w_whole_week")}</button>
          <h3>${Z(t).days[this._focus]}</h3></div>` : p}
        ${this._note && this._open === null ? c`<p class="muted note">${this._note}</p>` : p}
        <div class="list">
          ${e.length ? e.map((r) => this._renderRow(r)) : this._open === "new" ? p : c`<p class="muted">${h(t, "w_none")}</p>`}
          ${this._group && (this._open === "new" || this._open !== null && !e.some((r) => r.key === this._open)) ? this._renderEditor(this._programs.find((r) => r.id === this._programId) ?? this._programs[0], this._open) : p}
          ${this._open === null ? c`<button class="row add" ?disabled=${!this._canEdit || i} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? h(t, "w_add") : h(t, "w_add_day", { day: Z(t).days[this._focus].toLocaleLowerCase(t) })}</span></button>` : p}
        </div>
        </div>
        <div class="area-week">${this._renderWeek()}</div>
        <div class="area-chart">${this._open !== null ? p : this._renderChart()}</div>
        <div class="area-delete">${this._open !== null || this._modeOnly ? p : c`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${h(t, "delete_schedule")}</button>`}</div>
        </div>
      </wp-dialog>`;
  }
};
z.styles = [$t, V`
    :host { display: contents; }
    /* One DOM order (the phone order of section 24.2 = keyboard order). From 768 px the same order is laid out in two
       columns by the grid alone: parameters (and Delete) on the left, the 7-day schematic then the day chart on the right. */
    .cols, .params { display: block; }
    @media (min-width: 768px) {
      .cols {
        display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 24px; row-gap: 0; align-items: start;
        grid-template-rows: auto 1fr auto;
        grid-template-areas: "params week" "params chart" "delete chart";
      }
      .params { grid-area: params; min-width: 0; }
      .area-week { grid-area: week; min-width: 0; }
      .area-chart { grid-area: chart; min-width: 0; }
      .area-delete { grid-area: delete; min-width: 0; }
      .area-delete .btn.alone { margin-top: 0; }
      /* Hidden while a slot editor is open (nothing rendered): no empty grid cell. */
      .area-chart:empty, .area-delete:empty { display: none; }
    }
    .mode-select { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .mode-select select { flex: 1; min-width: 0; min-height: 44px; }
    .schematic { margin-bottom: 16px; }
    .schematic h4 { margin: 8px 0; }
    .schema-day { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 8px; align-items: center; min-height: 32px; }
    .schema-day > span { font-size: 12px; color: var(--secondary-text-color); }
    .schema-day wp-day-bar { min-width: 0; }
    .list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests:empty { display: none; }
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
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-bottom: 8px; font-size: 16px; }
    .switch .state { font-size: 14px; color: var(--secondary-text-color); }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `];
j([
  v({ attribute: !1 })
], z.prototype, "hass", 2);
j([
  v({ attribute: !1 })
], z.prototype, "data", 2);
j([
  v({ attribute: !1 })
], z.prototype, "scope", 2);
j([
  v({ type: Boolean })
], z.prototype, "chart", 2);
j([
  v({ attribute: !1 })
], z.prototype, "profileId", 2);
j([
  $()
], z.prototype, "_viewProfileId", 2);
j([
  v({ attribute: !1 })
], z.prototype, "day", 2);
j([
  $()
], z.prototype, "_open", 2);
j([
  $()
], z.prototype, "_group", 2);
j([
  $()
], z.prototype, "_dayOnly", 2);
j([
  $()
], z.prototype, "_focus", 2);
j([
  $()
], z.prototype, "_note", 2);
j([
  $()
], z.prototype, "_draft", 2);
j([
  $()
], z.prototype, "_restLabel", 2);
j([
  $()
], z.prototype, "_labelDraft", 2);
j([
  $()
], z.prototype, "_pickerKey", 2);
j([
  $()
], z.prototype, "_programId", 2);
j([
  $()
], z.prototype, "_error", 2);
j([
  $()
], z.prototype, "_saving", 2);
j([
  $()
], z.prototype, "_toggling", 2);
j([
  $()
], z.prototype, "_offset", 2);
j([
  $()
], z.prototype, "_slots", 2);
j([
  $()
], z.prototype, "_chartEntity", 2);
z = j([
  J("wp-schedule")
], z);
const Nr = "weekly-planner:chart-choices", Vo = "weekly-planner:open-charts";
function Jo() {
  const t = /* @__PURE__ */ new Map();
  try {
    const e = JSON.parse(localStorage.getItem(Nr) ?? "null");
    if (e && typeof e == "object" && !Array.isArray(e)) {
      for (const [s, r] of Object.entries(e)) typeof r == "boolean" && t.set(s, r);
      return t;
    }
    const i = JSON.parse(localStorage.getItem(Vo) ?? "[]");
    if (Array.isArray(i))
      for (const s of i) typeof s == "string" && t.set(s, !0);
  } catch {
  }
  return t;
}
function Go(t) {
  try {
    localStorage.setItem(Nr, JSON.stringify(Object.fromEntries(t)));
  } catch {
  }
}
function Yo(t) {
  const e = JSON.stringify([t.title ?? "", t.program ?? null, t.program === void 0 ? t.filter ?? null : null]);
  let i = 5381;
  for (let s = 0; s < e.length; s++) i = (i * 33 ^ e.charCodeAt(s)) >>> 0;
  return i.toString(36);
}
const Xo = (t, e, i) => `${t}|${e}|${i}`;
function Qo(t, e, i) {
  return t.get(e) ?? !i;
}
function Zo(t) {
  window.history.pushState(null, "", t), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
}
const Vs = "weekly_planner_reloaded_for";
function ta(t = import.meta.url) {
  try {
    return new URL(t).searchParams.get("v");
  } catch {
    return null;
  }
}
function ea(t, e, i) {
  return !!(t && e && t !== e && i !== e);
}
function Js(t, e) {
  if (!e) return !1;
  let i = null;
  try {
    i = sessionStorage.getItem(Vs);
  } catch {
  }
  if (!ea(ta(), t, i)) return !1;
  try {
    sessionStorage.setItem(Vs, t);
  } catch {
  }
  return location.reload(), !0;
}
const ia = ["bars", "radial", "radial_12h", "list"], sa = (t) => typeof t == "string" ? t ? [t] : [] : Array.isArray(t) ? t.filter((e) => typeof e == "string" && e !== "") : void 0;
function jr(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Weekly Planner card: the configuration must be a YAML mapping.");
  const e = { ...t };
  for (const i of ["title", "program"]) e[i] !== void 0 && typeof e[i] != "string" && (typeof e[i] == "number" ? e[i] = String(e[i]) : delete e[i]);
  for (const i of ["show_chart", "chart_collapsed"]) e[i] !== void 0 && typeof e[i] != "boolean" && delete e[i];
  if (e.schedule_view !== void 0 && !ia.includes(e.schedule_view) && delete e.schedule_view, e.filter !== void 0)
    if (!e.filter || typeof e.filter != "object" || Array.isArray(e.filter)) delete e.filter;
    else {
      const i = { ...e.filter };
      for (const s of ["types", "programs"]) if (i[s] !== void 0) {
        const r = sa(i[s]);
        r ? i[s] = r : delete i[s];
      }
      i.area !== void 0 && typeof i.area != "string" && delete i.area, e.filter = i;
    }
  return e;
}
function Rr() {
  return { schedule_view: "bars", show_chart: !0, chart_collapsed: !0 };
}
function ra(t) {
  const e = { ...Rr(), ...t };
  return e.program === void 0 && e.filter === void 0 && (e.filter = {}), e;
}
var na = Object.defineProperty, oa = Object.getOwnPropertyDescriptor, tt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? oa(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && na(e, i, r), r;
};
let K = class extends U {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._expandedProgram = null, this._charts = Jo(), this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._toggling = /* @__PURE__ */ new Set(), this._visible = () => {
      document.hidden || this._pollVersion();
    }, this._failedPreviewKey = "", this._previewRetryAt = 0, this._spanCache = /* @__PURE__ */ new Map(), this._spanInputs = [];
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: {}, ...Rr() };
  }
  setConfig(t) {
    this._config = { show_chart: !0, ...jr(t) }, this._data && this._loadPreviews();
  }
  getCardSize() {
    var t;
    return 2 + (((t = this._data) == null ? void 0 : t.programs.length) ?? 1) * 2;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this.requestUpdate(), this._clock = window.setInterval(() => {
      this._now = /* @__PURE__ */ new Date(), this._loadPreviews(), this._checkVersion(), ++this._ticks % 5 === 0 && this._pollVersion();
    }, 6e4), document.addEventListener("visibilitychange", this._visible);
  }
  /** Page at rest: nothing open and no edit in progress. */
  get _idle() {
    return !this._dialog && this._edit === null && !this._snack;
  }
  /** The integration serves a newer card: reload by itself once the page is idle (never in a loop). */
  _checkVersion() {
    var t;
    Js((t = this._data) == null ? void 0 : t.card_version, this._idle);
  }
  /** Asks the server for the served version (a reload of the integration does not push new data to old subscriptions). */
  async _pollVersion() {
    try {
      const t = await this.hass.callWS({ type: "weekly_planner/get" });
      Js(t.card_version, this._idle);
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
  updated() {
    var t;
    this._idle && ((t = this._data) != null && t.card_version) && this._checkVersion(), this.isConnected && this.hass && !this._unsub && (this._unsub = mr(this.hass, (e) => {
      this._data = e, this._error = void 0, this._loadNames(e), this._loadPreviews();
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
    return new Date(Rt(qt(it(this._now, this._tz), t), this._tz).startMs + 12 * 36e5);
  }
  /** Translated names of the services used by the labels. */
  async _loadNames(t) {
    const e = t.labels.flatMap((i) => i.action.kind === "service" ? [i.action.service.split(".")[0]] : []);
    await Se(this.hass, e) && this.requestUpdate();
  }
  async _loadPreviews() {
    if (!this._data) return;
    const t = [-1, 0, 1, 2, 3, 4, 5, 6].map((n) => it(this._dateAt(n), this._tz)), e = vs(this._data, this._config), i = `${t[0]}|${e.map((n) => `${n.id}:${n.revision}:${st(n, this._data).id}`).join(",")}`;
    if (i === this._previewKey || i === this._failedPreviewKey && Date.now() < this._previewRetryAt) return;
    this._previewKey = i;
    let s = !1;
    const r = {};
    await Promise.all(t.flatMap((n) => e.map((o) => ur(this.hass, o.id, o.revision, n, st(o, this._data).id, !1).then((l) => {
      (r[n] ?? (r[n] = {}))[o.id] = l;
    }).catch(() => {
      s = !0;
    })))), i === this._previewKey && (this._preview = r, s ? (this._previewKey = "", this._failedPreviewKey = i, this._previewRetryAt = Date.now() + 5e3) : this._failedPreviewKey = "");
  }
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it (memoized until an input is replaced). */
  _spans(t, e, i = 0) {
    const s = [this._data, this._preview, this._now, this._config];
    s.some((o, l) => o !== this._spanInputs[l]) && (this._spanCache.clear(), this._spanInputs = s);
    const r = `${t}|${i}|${e.map((o) => o.id).join(",")}`;
    let n = this._spanCache.get(r);
    return n || this._spanCache.set(r, n = this._computeSpans(t, e, i)), n;
  }
  _computeSpans(t, e, i) {
    var a, d, u;
    const s = this._data, r = this._dateAt(i), n = Ne(r, this._tz), o = this._preview[it(r, this._tz)] ?? {}, l = [];
    for (const _ of [...e].reverse()) {
      if (!_.enabled) continue;
      const m = st(_, s), f = (S) => St(_, t, F(s, S.label)), b = (S, R, g, P = {}) => {
        const I = F(s, S.label);
        return {
          start: R,
          end: g,
          color: I.color,
          label: rt(this.hass, I),
          slotId: S.id,
          startSun: Ct(S.start),
          endSun: S.end ? Ct(S.end) : null,
          startSpec: S.start,
          endSpec: S.end ?? null,
          marker: !S.end,
          ...P
        };
      }, x = it(r, this._tz), E = (a = this._preview[qt(x, -1)]) == null ? void 0 : a[_.id], k = o[_.id], A = new Map(m.days.flat().map((S) => [S.id, S])), H = Rt(x, this._tz);
      for (const S of [...E ?? [], ...k ?? []]) {
        const R = A.get(S.slot_id);
        if (!R || !f(R)) continue;
        const g = Date.parse(S.start), P = S.end ? Date.parse(S.end) : null;
        if (g >= H.endMs || (P === null ? g < H.startMs : P <= H.startMs)) continue;
        const I = g < H.startMs, et = I ? 0 : ut(S.start, this._tz), Q = P === null ? null : P >= H.endMs ? C : ut(S.end, this._tz);
        l.push(b(R, et, Q === null ? Math.min(C, et + 10) : Q, {
          spill: I,
          startSun: I ? null : Ct(R.start),
          ignored: S.ignored ?? null,
          sun: "sun" in R.start || !!(R.end && "sun" in R.end)
        }));
      }
      if (!E) for (const { slot: S, end: R } of pr(m.days[(n + 6) % 7]))
        !S.start.random_minutes && !((d = S.end) != null && d.random_minutes) && f(S) && l.push(b(S, 0, R, { spill: !0, startSun: null }));
      if (!k) for (const S of m.days[n]) {
        if (!f(S) || S.start.random_minutes || (u = S.end) != null && u.random_minutes) continue;
        const R = zt(S.start), g = zt(S.end ?? null);
        R !== null && l.push(b(S, R, g === null ? R + 10 : g > R ? g : C));
      }
    }
    return l;
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
    if (this._toggling.has(t.id)) return;
    this._toggling = new Set(this._toggling).add(t.id);
    const e = !t.enabled;
    try {
      if (!e && !await Et(this, h(this._lang, "confirm_pause", { name: t.name }), h(this._lang, "yes"), h(this._lang, "no"))) return;
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: t.id, enabled: e });
    } catch (i) {
      this._error = String(i.message ?? i);
    } finally {
      const i = new Set(this._toggling);
      i.delete(t.id), this._toggling = i;
    }
  }
  _programToggle(t) {
    var e;
    return c`<button class="hours" role="switch" aria-checked=${t.enabled}
      aria-label=${`${t.name}: ${h(this._lang, t.enabled ? "running" : "stopped")}`}
      ?disabled=${((e = this._data) == null ? void 0 : e.read_only) || this._toggling.has(t.id)}
      @click=${() => void this._toggleProgram(t)}>
      <ha-icon icon=${t.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
  }
  _modeName(t) {
    const e = this._data ? st(t, this._data) : void 0;
    return e && (t.profiles.length > 1 || t.mode_source) ? c`<span class="mode-name">${h(this._lang, "profile")}: ${e.name}</span>` : p;
  }
  _disabledBadge(t) {
    return t ? c`<span class="disabled-badge" role="status">${h(this._lang, "program_disabled")}</span>` : p;
  }
  /* ---- render ---- */
  /** A bar that can be edited in place: today's (`kind` "today") or one of the week's. */
  _bar(t, e, i, s, r) {
    var u, _, m;
    const n = this._dateAt(i), o = Ne(n, this._tz), l = it(n, this._tz), a = `${e.id}|${t}|${s}|${o}`, d = [e];
    return c`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${e} entity-id=${t}
      weekday=${o} .spans=${this._spans(t, d, i)} .preview=${(u = this._preview[l]) == null ? void 0 : u[e.id]}
      .now=${i === 0 ? ut(this._now, this._tz) : null} ?hours=${s === "today"}
      ?editing=${this._edit === a} ?editable=${!!((_ = this._data) != null && _.can_edit) && !((m = this._data) != null && m.read_only)}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => this._edit = a} @edit-exit=${() => {
      this._edit === a && (this._edit = null);
    }}
      @open-day=${r} @edited=${(f) => this._showSnack(f.detail.undo)}></wp-bar-editor>`;
  }
  _line(t, e, i) {
    var _, m;
    const s = this._lang, r = this._data, n = this._next(t, e), o = F(r, n == null ? void 0 : n.label), l = e.length > 0 && e.every((f) => !f.enabled), a = this.hass.states[t], d = i.icon ?? (a == null ? void 0 : a.attributes.icon) ?? "mdi:calendar-clock", u = () => this._open(i.open);
    return c`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${d}></ha-icon>
          <div class="info">
            ${i.name ? c`<span class="name">${i.name}</span>` : p}
            ${i.button && e.length === 1 ? this._modeName(e[0]) : p}
            <span class="now">
              <span class="nw">${a ? ((m = (_ = this.hass).formatEntityState) == null ? void 0 : m.call(_, a)) ?? a.state : "—"}</span>
              ${n ? c`<span class="next">→ ${o ? rt(this.hass, o) : Je(this.hass, s, n.action)}
                <span class="when nw">${Ge(gs(n.at, this._tz, s, this._now))}</span></span>` : p}
            </span>
          </div>
          ${i.button ? c`<div class="header-actions"><div class="header-icons">
            ${e.length === 1 ? this._programToggle(e[0]) : p}
            <button class="hours" aria-label=${h(s, "hours")} title=${h(s, "hours")} @click=${u}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(l)}</div>` : p}
        </div>
        ${this._config.schedule_view === "radial" || this._config.schedule_view === "radial_12h" ? c`<wp-radial-day
          .spans=${this._spans(t, e)} .now=${ut(this._now, this._tz)} lang=${s}
          .rest=${(() => {
      var b;
      const f = F(r, (b = e[0].entities.find((x) => x.entity_id === t)) == null ? void 0 : b.default_label);
      return f ? rt(this.hass, f) : h(s, "rest_none");
    })()}
          .double=${this._config.schedule_view === "radial_12h"}
          @open-day=${u}></wp-radial-day>` : c`<div class="today">
          <span class="wname">${h(s, "today_short")}</span>
          ${this._bar(t, e[0], 0, "today", u)}
        </div>`}
        ${this._extras(i.open, t, e)}
      </div>`;
  }
  /**
   * The two collapsible parts under today's bar: the next 6 days (one thin bar each) and, unless `show_chart` is off,
   * the chart of today (same component as the schedule screen; no history is fetched while it is collapsed).
   * The buttons sit on one row, 16 px apart; the panels open below. The chart choice is remembered per card and device.
   */
  _extras(t, e, i) {
    var E, k;
    const s = this._lang, r = `${_i(t)}|${e}`, n = this._week.has(r), o = () => {
      const A = new Set(this._week);
      n ? A.delete(r) : A.add(r), this._week = A;
    }, l = Z(s).days_short, a = this._config.show_chart !== !1 && !!this._data, d = Xo(Yo(this._config), _i(t), e), u = a && Qo(this._charts, d, this._config.chart_collapsed !== !1), _ = () => {
      const A = new Map(this._charts);
      A.set(d, !u), this._charts = A, Go(A);
    }, m = i[0], f = it(this._now, this._tz), b = (E = this._preview[f]) == null ? void 0 : E[m.id], x = (k = this._preview[qt(f, -1)]) == null ? void 0 : k[m.id];
    return c`
      <div class="toggles">
        <button class="weekbtn" aria-expanded=${n} @click=${o}>
          <ha-icon icon=${n ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${h(s, "week")}</button>
        ${a ? c`<button class="weekbtn chartbtn" aria-expanded=${u} @click=${_}>
          <ha-icon icon="mdi:chart-line"></ha-icon>${h(s, "chart_day")}<ha-icon class="after" icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>` : p}
      </div>
      ${n ? c`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((A) => {
      const H = (A - Ne(this._now, this._tz) + 7) % 7, S = () => this._open(t, { weekday: A, offset: H });
      return c`<div class="wday">
            <button class="wnamebtn" aria-label=${l[A]} @click=${S}>
              <span class="wname ${H === 0 ? "today" : ""}">${l[A]}</span></button>
            ${this._bar(e, m, H, "week", S)}</div>`;
    })}
      </div>` : p}
      ${u ? c`<div class="chartbox"><wp-chart .hass=${this.hass} .data=${this._data} .program=${m}
        entity-id=${e} date=${f} .slots=${b ? [...x ?? [], ...b] : null}
        @open-history=${(A) => Zo(A.detail)}></wp-chart></div>` : p}`;
  }
  _bySchedule(t) {
    const e = this._lang;
    return t.map((i) => {
      const s = { kind: "program", programId: i.id };
      return i.entities.length === 1 ? this._line(i.entities[0].entity_id, [i], { name: i.name, icon: i.icon ?? void 0, button: s, open: s }) : c`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${i.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${i.name}${this._modeName(i)}</h2>
          <div class="header-actions"><div class="header-icons">${this._programToggle(i)}
            <button class="hours" aria-label=${h(e, "hours")} title=${h(e, "hours")} @click=${() => this._open(s)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(!i.enabled)}</div>
        </div>
        ${i.entities.map((r) => this._line(r.entity_id, [i], { name: _t(this.hass, r.entity_id), button: null, open: s }))}
      </section>`;
    });
  }
  _compactList(t) {
    return t.map((e) => {
      const i = { kind: "program", programId: e.id }, s = e.entities.map((n) => ({ entity: n.entity_id, next: this._next(n.entity_id, [e]) })).filter((n) => n.next).sort((n, o) => Date.parse(n.next.at) - Date.parse(o.next.at)), r = this._expandedProgram === e.id;
      return c`<section class="compact-program"><div class="compact-row">
        <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" aria-expanded=${r} aria-controls=${`compact-${e.id}`}
          @click=${() => {
        this._expandedProgram = r ? null : e.id, this._edit = null;
      }}>
          <strong>${e.name}<ha-icon icon=${r ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></strong>${this._modeName(e)}
          ${s.length ? c`<span>${(() => {
        const n = F(this._data, s[0].next.label);
        return n ? rt(this.hass, n) : Je(this.hass, this._lang, s[0].next.action);
      })()} · ${Ge(gs(s[0].next.at, this._tz, this._lang, this._now))}</span>` : c`${e.enabled ? c`<span>${h(this._lang, "hours")}</span>` : p}`}
        </button><div class="header-actions"><div class="header-icons">${this._programToggle(e)}
        ${r ? c`<button class="hours" aria-label=${h(this._lang, "hours")} title=${h(this._lang, "hours")}
          @click=${() => this._open(i)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : p}</div>
          ${this._disabledBadge(!e.enabled)}</div></div>
        ${r ? c`<div id=${`compact-${e.id}`} class="compact-details" role="region" aria-label=${e.name}>
          ${e.entities.map((n) => c`
            ${e.entities.length > 1 ? c`<strong class="compact-device">${_t(this.hass, n.entity_id)}</strong>` : p}
            <div class="today"><span class="wname">${h(this._lang, "today_short")}</span>
              ${this._bar(n.entity_id, e, 0, "today", () => this._open(i))}</div>
            ${this._extras(i, n.entity_id, [e])}
          `)}
        </div>` : p}</section>`;
    });
  }
  render() {
    if (!this._config || !this.hass) return p;
    const t = this._lang, e = this._data, i = e ? vs(e, this._config) : [], s = this._config.title !== void 0 && this._config.title !== "";
    return c`
      <ha-card>
        ${s || e != null && e.vacation ? c`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${e != null && e.vacation ? c`<span class="chip"><ha-icon icon="mdi:pause-circle-outline"></ha-icon> ${h(t, "vacation")}</span>` : p}
            </div>` : p}
        ${this._error ? c`<div class="error">${h(t, "error", { message: this._error })}</div>` : p}
        ${e != null && e.read_only ? c`<div class="error">${h(t, "read_only")}</div>` : p}
        ${e ? p : c`<div class="empty">…</div>`}
        ${e && !i.length ? c`<div class="empty" role="status">${h(t, e.programs.length && this._config.program === void 0 ? "no_matching_program" : "no_program")}</div>` : p}
        ${e ? this._config.schedule_view === "list" ? this._compactList(i) : this._bySchedule(i) : p}
      </ha-card>
      ${this._snack ? c`<div class="snack" role="status"><span>${h(t, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${h(t, "undo")}</button></div>` : p}
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    const t = this._dialog;
    if (!t || !this._data) return p;
    const e = () => this._dialog = null;
    switch (t.kind) {
      case "schedule":
        return Fe(_i(t.scope), c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${t.scope} .day=${t.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${e}></wp-schedule>`);
    }
  }
};
K.styles = V`
    .compact-program { border-top: 1px solid var(--divider-color); }
    .compact-program:first-of-type { border-top: 0; }
    .compact-row { display: flex; align-items: center; gap: 8px; min-height: 72px; }
    .summary strong { display: flex; align-items: center; gap: 4px; overflow-wrap: anywhere; }
    .summary ha-icon { --mdc-icon-size: 18px; flex: none; }
    .compact-details { padding-bottom: 8px; }
    .compact-device { display: block; margin-top: 12px; }
    .summary { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 4px; text-align: left; background: none; border: 0; color: inherit; font: inherit; cursor: pointer; }
    .summary span { font-size: 14px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    button:disabled { opacity: .5; cursor: default; }
    ha-card { padding: 8px 16px 12px; }
    .head { display: flex; align-items: center; gap: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; font-size: 14px; padding: 2px 10px; border-radius: 12px; background: var(--warning-color, #ff9800); color: #fff; }
    .block { padding: 8px 0; border-top: 1px solid var(--divider-color); }
    .block:first-of-type, .head + .block { border-top: none; }
    .line { display: flex; align-items: flex-start; gap: 10px; min-height: 28px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); margin-top: -1px; }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .mode-name { display: block; flex-basis: 100%; font-size: 13px; font-weight: 400; color: var(--secondary-text-color); line-height: 20px; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .next { min-width: 0; overflow-wrap: anywhere; }
    .when { opacity: 0.8; }
    .header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
    .header-icons { display: flex; align-items: center; }
    .disabled-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; background: #b3261e; color: #fff; font-size: 13px; font-weight: 600; line-height: 20px; }
    .line .header-actions { margin-top: -12px; }
    .name, .now { line-height: 24px; }
    button.hours {
      flex: none; width: 48px; height: 48px; padding: 0; border-radius: 24px; border: none;
      background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 24px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.hours:hover { background: var(--secondary-background-color); }
    wp-bar-editor { margin-top: 2px; }
    .toggles { display: flex; flex-wrap: wrap; align-items: center; gap: 0 16px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; min-width: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--primary-color); font: inherit; font-size: 16px; cursor: pointer; --mdc-icon-size: 22px;
    }
    .chartbtn .after { --mdc-icon-size: 20px; }
    .chartbox { padding: 4px 0 8px; }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday { display: flex; align-items: flex-start; gap: 8px; min-height: 48px; width: 100%; }
    .wnamebtn {
      flex: none; width: 44px; margin-right: -8px; height: 48px; padding: 0; border: none; border-radius: 8px; background: none; color: inherit;
      font: inherit; cursor: pointer; text-align: left; display: flex; align-items: center;
    }
    .wday .wnamebtn { margin-top: 6px; }
    .wnamebtn:hover .wname { text-decoration: underline; }
    .wday wp-bar-editor { margin: 16px 0 10px; }
    .wname { flex: none; width: 36px; font-size: 14px; color: var(--secondary-text-color); }
    .wday wp-bar-editor, .today wp-bar-editor { flex: 1; min-width: 0; }
    .wname.today { color: var(--primary-text-color); font-weight: 600; }
    .today { display: flex; align-items: flex-start; gap: 8px; padding-top: 20px; } /* room for the "now" clock above the bar */
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
tt([
  v({ attribute: !1 })
], K.prototype, "hass", 2);
tt([
  $()
], K.prototype, "_config", 2);
tt([
  $()
], K.prototype, "_data", 2);
tt([
  $()
], K.prototype, "_error", 2);
tt([
  $()
], K.prototype, "_dialog", 2);
tt([
  $()
], K.prototype, "_preview", 2);
tt([
  $()
], K.prototype, "_now", 2);
tt([
  $()
], K.prototype, "_week", 2);
tt([
  $()
], K.prototype, "_expandedProgram", 2);
tt([
  $()
], K.prototype, "_charts", 2);
tt([
  $()
], K.prototype, "_edit", 2);
tt([
  $()
], K.prototype, "_snack", 2);
tt([
  $()
], K.prototype, "_toggling", 2);
K = tt([
  J("weekly-planner-card")
], K);
const aa = 50, la = 700;
class da {
  constructor() {
    this._past = [], this._future = [];
  }
  get canUndo() {
    return this._past.length > 0;
  }
  get canRedo() {
    return this._future.length > 0;
  }
  /** Adjacent edits with a named group share one undo step during a short typing burst. */
  record(e, i, s, r = Date.now()) {
    if (JSON.stringify(e) === JSON.stringify(i)) return;
    !!s && s === this._group && this._recordedAt !== void 0 && r >= this._recordedAt && r - this._recordedAt <= la || this._push(this._past, e), this._future = [], this._group = s || void 0, this._recordedAt = r;
  }
  undo(e) {
    if (this._resetGroup(), !!this.canUndo)
      return this._push(this._future, e), this._past.pop();
  }
  redo(e) {
    if (this._resetGroup(), !!this.canRedo)
      return this._push(this._past, e), this._future.pop();
  }
  clear() {
    this._past = [], this._future = [], this._resetGroup();
  }
  _push(e, i) {
    e.push(structuredClone(i)), e.length > aa && e.shift();
  }
  _resetGroup() {
    this._group = void 0, this._recordedAt = void 0;
  }
}
const Gs = /* @__PURE__ */ new WeakMap();
async function ca(t, e) {
  var l, a;
  const i = t.states[e], s = i == null ? void 0 : i.attributes.icon;
  if (typeof s == "string" && s.startsWith("mdi:")) return s;
  const r = e.split(".")[0];
  let n = Gs.get(t.connection);
  n || Gs.set(t.connection, n = /* @__PURE__ */ new Map());
  let o = n.get(r);
  o || (o = t.callWS({ type: "frontend/get_icons", category: "entity_component", integration: r }).then((d) => {
    var u;
    return ((u = d.resources) == null ? void 0 : u[r]) ?? {};
  }), n.set(r, o));
  try {
    const d = await o, u = ((l = d[String(i == null ? void 0 : i.attributes.device_class)]) == null ? void 0 : l.default) ?? ((a = d._) == null ? void 0 : a.default);
    return u != null && u.startsWith("mdi:") ? u : "mdi:calendar-clock";
  } catch {
    return n.delete(r), "mdi:calendar-clock";
  }
}
const fi = (t, e) => JSON.stringify(t) === JSON.stringify(e), De = (t) => t !== null && typeof t == "object" && !Array.isArray(t);
function Pi(t, e, i) {
  if (fi(t, e)) return i;
  if (fi(t, i) || fi(e, i)) return e;
  if (De(t) && De(e) && De(i)) {
    const s = {};
    for (const r of /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e), ...Object.keys(i)])) {
      const n = Pi(t[r], e[r], i[r]);
      n !== void 0 && (s[r] = n);
    }
    return s;
  }
  if (Array.isArray(t) && Array.isArray(e) && Array.isArray(i)) {
    const s = [...t, ...e, ...i], r = ["id", "entity_id"].find((n) => s.length && s.every((o) => De(o) && typeof o[n] == "string"));
    if (r) {
      const n = (d) => new Map(d.map((u) => [u[r], u])), o = n(t), l = n(e), a = n(i);
      return [.../* @__PURE__ */ new Set([...l.keys(), ...a.keys(), ...o.keys()])].map((d) => Pi(o.get(d), l.get(d), a.get(d))).filter((d) => d !== void 0);
    }
  }
  throw new Error("settings_conflict");
}
function ha(t, e, i) {
  return { ...Pi(t, { ...e, revision: t.revision }, i), revision: i.revision };
}
function gi(t, e) {
  var r, n;
  const i = (n = (r = t.states[e]) == null ? void 0 : r.attributes) == null ? void 0 : n.friendly_name;
  if (typeof i == "string" && i) return i;
  const s = e.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : e;
}
const Ys = /* @__PURE__ */ new WeakSet();
function pa(t) {
  if (!t || Ys.has(t)) return;
  Ys.add(t);
  const e = () => {
    t.classList.toggle("more-left", t.scrollLeft > 2), t.classList.toggle("more-right", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  };
  t.addEventListener("scroll", e, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(e).observe(t), e();
}
const ua = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var _a = Object.defineProperty, ma = Object.getOwnPropertyDescriptor, q = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ma(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && _a(e, i, r), r;
};
const Xs = () => [[], [], [], [], [], [], []];
function Qs(t) {
  return t.map((e) => ({ ...structuredClone(e), id: dt() }));
}
let L = class extends U {
  constructor() {
    super(...arguments), this.embedded = !1, this._iconCustomized = !1, this._applied = !1, this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._nameError = "", this._entitiesError = "", this._saving = !1, this._changingMode = !1, this._associationsOpen = !1, this._scheduleProfileId = null, this._hoursRevision = 0, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._history = new da(), this._editingHistory = !1, this._iconEpoch = 0, this._historyKey = (t) => {
      if (t.defaultPrevented || t.altKey || !(t.ctrlKey || t.metaKey) || !this._p || this._saving || !this._canEdit() || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "INPUT" || s.tagName === "TEXTAREA" || s.isContentEditable))) return;
      const e = t.key.toLowerCase(), i = e === "z" && t.shiftKey || e === "y";
      (e === "z" || e === "y") && (t.preventDefault(), t.stopPropagation(), i ? this._redoDraft() : this._undoDraft());
    }, this._pickerKey = 0, this._servicesOpen = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("keydown", this._historyKey), this._picker || fr().then((t) => this._picker = t);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("keydown", this._historyKey);
  }
  _snapshot() {
    return structuredClone({
      program: this._p,
      origin: this._origin,
      isNew: this._isNew,
      iconCustomized: this._iconCustomized,
      profileId: this._profileId,
      profileForm: this._profileForm
    });
  }
  /** One semantic edit can update several fields without creating partial undo steps. */
  _edit(t, e) {
    if (this._editingHistory) {
      t();
      return;
    }
    const i = this._snapshot();
    this._editingHistory = !0;
    try {
      t();
    } finally {
      this._editingHistory = !1;
    }
    this._history.record(i, this._snapshot(), e), this.requestUpdate();
  }
  _restore(t) {
    this._p = t.program, this._origin = t.origin, this._isNew = t.isNew, this._iconCustomized = t.iconCustomized, this._profileId = t.profileId, this._profileForm = t.profileForm, this._error = "", this._nameError = "", this._entitiesError = "", this._applied = !1, this._refreshIcon();
  }
  _undoDraft() {
    if (!this._canEdit() || this._saving) return;
    const t = this._history.undo(this._snapshot());
    t && this._restore(t);
  }
  _redoDraft() {
    if (!this._canEdit() || this._saving) return;
    const t = this._history.redo(this._snapshot());
    t && this._restore(t);
  }
  _changeProfileForm(t, e) {
    this._edit(() => {
      this._profileForm = t, this._applied = !1, this._error = "";
    }, e);
  }
  _refreshIcon() {
    var i;
    const t = ++this._iconEpoch, e = (i = this._p.entities[0]) == null ? void 0 : i.entity_id;
    this._iconCustomized || !e || ca(this.hass, e).then((s) => {
      var r;
      t !== this._iconEpoch || this._iconCustomized || ((r = this._p.entities[0]) == null ? void 0 : r.entity_id) !== e || (this._p = { ...this._p, icon: s });
    });
  }
  get _lang() {
    return Gt(this.hass);
  }
  _tr(t, e) {
    return h(this._lang, t, e);
  }
  /* ---- initial state ---- */
  willUpdate() {
    var t, e, i, s;
    if (!this._ready && !(!this.hass || !this.data)) {
      if (this._ready = !0, this._origin = this.program ? structuredClone(this.program) : void 0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const r = dt();
        this._p = {
          id: "",
          revision: 0,
          name: "",
          icon: "mdi:calendar-clock",
          priority: ((t = this.data.defaults) == null ? void 0 : t.priority) ?? 10,
          enabled: !0,
          reapply: ((e = this.data.defaults) == null ? void 0 : e.reapply) ?? !0,
          conditions: [],
          entities: [],
          active_profile: r,
          profiles: [{ id: r, name: this._tr("profile_default"), days: Xs() }]
        }, this._isNew = !0;
      }
      this._iconCustomized = !!((i = this.program) != null && i.icon && this.program.icon !== this._deviceIcon((s = this.program.entities[0]) == null ? void 0 : s.entity_id)), this._profileId = this._activeId(), this._tab = "general";
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
    this._edit(() => {
      var e;
      this._iconCustomized = !!t, this._patch({ icon: t || this._deviceIcon((e = this._p.entities[0]) == null ? void 0 : e.entity_id) });
    }, "icon"), this._refreshIcon();
  }
  _patch(t, e) {
    this._edit(() => {
      var i;
      t.entities && !this._iconCustomized && (t = { ...t, icon: this._deviceIcon((i = t.entities[0]) == null ? void 0 : i.entity_id) }), this._p = { ...this._p, ...t }, this._error = "", "name" in t && (this._nameError = ""), t.entities && (this._entitiesError = ""), this._applied = !1;
    }, e), t.entities && this._refreshIcon();
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
    if (!t) return !0;
    const e = t.name.trim(), i = this._p.profiles.some((s) => s.name === e && !(t.mode === "rename" && s.id === this._profileId));
    return !e || i || e.length > 40 ? (this._error = this._tr("err_profile_name"), !1) : (this._edit(() => {
      if (t.mode === "rename")
        this._setProfile({ ...this._profile, name: e });
      else {
        const s = this._profile, r = {
          id: dt(),
          name: e,
          days: t.mode === "copy" ? s.days.map(Qs) : Xs()
        };
        this._patch({ profiles: [...this._p.profiles, r] }), this._profileId = r.id;
      }
      this._profileForm = void 0, this._error = "";
    }), !0);
  }
  _deleteProfile() {
    this._edit(() => {
      const t = this._profile, e = this._p.profiles.filter((s) => s.id !== t.id), i = this._p.mode_source;
      this._patch({ profiles: e, ...i ? { mode_source: { ...i, mappings: Object.fromEntries(Object.entries(i.mappings).filter(([, s]) => s !== t.id)) } } : {} }), this._profileId = this._activeId(), e.some((s) => s.id === this._profileId) || (this._profileId = e[0].id);
    });
  }
  /* ---- entities ---- */
  _setEntity(t, e) {
    this._patch({ entities: this._p.entities.map((i, s) => s === t ? { ...i, ...e } : i) });
  }
  _addEntity(t) {
    !t || this._p.entities.some((e) => e.entity_id === t) || (this._pickerKey += 1, this._servicesOpen = t, this._patch({ entities: [...this._p.entities, { entity_id: t, default_label: null, label_overrides: {}, allowed_services: [], restrict_services: !0 }] }));
  }
  /* ---- save / delete ---- */
  _validate() {
    var t;
    return ((t = this._problem()) == null ? void 0 : t.message) ?? "";
  }
  /** First problem with the draft, and the field it belongs to (`form` = no single field). */
  _problem() {
    const t = this._p;
    if (!t.name.trim()) return { field: "name", message: this._tr("err_name") };
    if (!t.entities.length) return { field: "entities", message: this._tr("err_no_entity") };
    const e = this._validateRest();
    return e ? { field: "form", message: e } : void 0;
  }
  _validateRest() {
    const t = this._p;
    if (t.mode_source && (!t.mode_source.entity_id || !Object.keys(t.mode_source.mappings).length || Object.entries(t.mode_source.mappings).some(([i, s]) => !i.trim() || !t.profiles.some((r) => r.id === s)))) return this._tr("mode_incomplete");
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
    return (e == null ? void 0 : e.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (e == null ? void 0 : e.code) === "unauthorized" ? this._tr("err_unauthorized") : i.includes("random_window_too_short") ? this._tr("random_too_short") : i.includes("overlapping_slots") ? this._tr("err_overlap_server") : i.includes("circular_mode_source") ? this._tr("mode_source_loop") : i.includes("controlled by an external") ? this._tr("mode_source_locked") : i.includes("unknown_mode_profile") ? this._tr("mode_incomplete") : i.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: i });
  }
  /** Brings the field a refused save is about into view and focuses it. */
  _showField(t) {
    this._isNew || (this._tab = t === "name" ? "general" : "entities"), this.updateComplete.then(() => {
      var i, s, r;
      const e = (i = this.renderRoot) == null ? void 0 : i.querySelector(t === "name" ? "#f-name" : "#pe-entity-add");
      e && ((s = e.scrollIntoView) == null || s.call(e, { block: "center", behavior: "smooth" }), (r = e.focus) == null || r.call(e));
    });
  }
  _nameField() {
    const t = !!this._nameError;
    return c`<div class="field"><label for="f-name">${this._tr("pe_name")}</label>
      <input id="f-name" type="text" maxlength="60" .value=${this._p.name} aria-invalid=${t ? "true" : "false"}
        aria-describedby=${t ? "f-name-error" : p}
        @input=${(e) => this._patch({ name: e.target.value }, "name")} />
      ${t ? c`<p id="f-name-error" class="error field-error" role="alert">${this._nameError}</p>` : p}</div>`;
  }
  async _save() {
    if (!this._canEdit() || this._saving || !this._submitProfileForm()) return;
    const t = this._problem();
    if (t) {
      this._p.mode_source && (this._associationsOpen = !0), this._error = "", this._nameError = "", this._entitiesError = "", t.field === "name" ? this._nameError = t.message : t.field === "entities" ? this._entitiesError = t.message : this._error = t.message, t.field !== "form" && this._showField(t.field);
      return;
    }
    this._error = "", this._saving = !0;
    try {
      const e = this._payload();
      let i;
      for (let s = 0; s < 2; s++) {
        const n = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((l) => l.id === e.id);
        if (this._origin && !n) throw { code: "conflict" };
        let o = e;
        if (this._origin && n)
          try {
            o = ha(this._origin, e, n);
          } catch {
            throw { code: "conflict" };
          }
        try {
          i = (await this.hass.callWS({ type: "weekly_planner/program/save", program: o })).program;
          break;
        } catch (l) {
          if (s || l.code !== "conflict") throw l;
        }
      }
      i && (this._p = structuredClone(i), this._origin = structuredClone(i), this._isNew = !1, this._applied = !0, ++this._iconEpoch, this._history.clear(), this.dispatchEvent(new CustomEvent("program-saved", { detail: i, bubbles: !0, composed: !0 }))), this.embedded || this._close();
    } catch (e) {
      this._error = this._errorText(e);
    } finally {
      this._saving = !1;
    }
  }
  async _askDelete() {
    await Et(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(t) {
    await Et(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(t) {
    var s;
    const e = (s = this._p.entities[t]) == null ? void 0 : s.entity_id;
    if (!e) return;
    const i = this._tr("confirm_delete", { name: gi(this.hass, e) });
    await Et(this, i, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((r, n) => n !== t) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this.dispatchEvent(new CustomEvent("program-deleted", { detail: this._p.id, bubbles: !0, composed: !0 })), this._close();
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  _duplicate() {
    this._edit(() => {
      const t = dt(), e = this._p, i = /* @__PURE__ */ new Map(), s = e.profiles.map((r) => {
        const n = r.id === this._activeId() ? t : dt();
        return i.set(r.id, n), { ...structuredClone(r), id: n, days: r.days.map(Qs) };
      });
      this._p = {
        ...structuredClone(e),
        id: "",
        revision: 0,
        created_at: void 0,
        name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
        profiles: s,
        active_profile: i.get(this._activeId()) ?? s[0].id,
        ...e.mode_source ? { mode_source: { ...e.mode_source, mappings: Object.fromEntries(Object.entries(e.mode_source.mappings).map(([r, n]) => [r, i.get(n) ?? n])) } } : {}
      }, delete this._p.created_at, this._isNew = !0, this._origin = void 0, this._applied = !1, this._profileId = this._p.active_profile ?? s[0].id, this._error = "";
    });
  }
  _close() {
    var t;
    (t = this.renderRoot.querySelector("#main")) == null || t.close();
  }
  /* ---- render: tabs ---- */
  _renderGeneral() {
    const t = this._p;
    return c`
      ${this._nameField()}
      <div class="field"><label for="f-area">${this._tr("pe_area")}</label>
        <input id="f-area" type="text" list="program-areas" .value=${t.area ?? ""} aria-describedby="program-area-help"
          @change=${(e) => this._patch({ area: e.target.value.trim() || null })} />
        <datalist id="program-areas">${[...new Set(this.data.programs.flatMap((e) => e.area ? [e.area] : []))].sort().map((e) => c`<option value=${e}></option>`)}</datalist>
        <p id="program-area-help" class="hint">${this._tr("pe_area_hint")}</p></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? c`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${t.icon ?? ""}
                @value-changed=${(e) => this._setIcon(e.detail.value || null)}></ha-selector>` : c`<div class="row" style="flex-wrap:nowrap">
                ${t.icon && customElements.get("ha-icon") ? c`<ha-icon .icon=${t.icon}></ha-icon>` : p}
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
    Bi(this.renderRoot), pa(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities(t = !1) {
    const e = this._p;
    return c`
      ${e.entities.length === 0 ? c`<p class="muted">${this._tr("pe_no_entity")}</p>` : p}
      ${e.entities.map((i, s) => this._renderEntity(i, s, t))}
      ${Fe(this._pickerKey, this._picker ? c`<ha-selector id="pe-entity-add" aria-invalid=${this._entitiesError ? "true" : "false"} aria-describedby=${this._entitiesError ? "pe-entities-error" : p} .hass=${this.hass} .selector=${{ entity: { exclude_entities: e.entities.map((i) => i.entity_id) } }}
            .label=${this._tr(e.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .value=${""} .required=${!e.entities.length}
            @value-changed=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail.value ?? "");
    }}></ha-selector>` : c`<wp-entity-picker id="pe-entity-add" aria-describedby=${this._entitiesError ? "pe-entities-error" : p} .hass=${this.hass} .value=${""} .label=${this._tr(e.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .required=${!e.entities.length}
        .exclude=${e.entities.map((i) => i.entity_id)}
        @wp-change=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail);
    }}></wp-entity-picker>`)}
      ${this._entitiesError ? c`<p id="pe-entities-error" class="error field-error" role="alert">${this._entitiesError}</p>` : p}
    `;
  }
  /** New devices require an explicit choice; legacy unrestricted devices keep their existing behavior. */
  _renderServices(t, e) {
    const i = new Map(Qe(this.hass, t.entity_id).map((m) => [m.id, m])), s = [...this.data.labels.map((m) => m.action), ...Object.values(t.label_overrides ?? {})], r = [...t.allowed_services ?? [], ...s.flatMap((m) => m.kind === "service" && m.target_entity_id ? [m.service] : [])];
    for (const m of r) if (!i.has(m)) {
      const [f, b] = m.split(".");
      i.set(m, { id: m, domain: f, service: b, label: Kt(this.hass, m) });
    }
    const n = [...i.values()].sort((m, f) => m.label.localeCompare(f.label));
    if (!n.length) return c`<p class="hint">${this._tr("pe_no_services")}</p>`;
    const o = t.allowed_services ?? [], l = !t.restrict_services && !o.length, a = (m) => l || o.includes(m), d = n.filter((m) => a(m.id)).length, u = this._isNew || this._servicesOpen === t.entity_id, _ = (m, f) => {
      const b = new Set(l ? n.map((x) => x.id) : o);
      f ? b.add(m) : b.delete(m), this._setEntity(e, { allowed_services: [...b], restrict_services: !0 });
    };
    return c`
      ${this._isNew ? c`<h3>${this._tr("pe_services")} · ${d}/${n.length}</h3>` : c`
        <button class="link" aria-expanded=${u} @click=${() => this._servicesOpen = u ? "" : t.entity_id}>
          <ha-icon icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${d === n.length ? this._tr("pe_services_all") : `${d}/${n.length}`}</button>`}
      ${d === 0 && t.restrict_services ? c`<p class="hint" role="status">${this._tr("pe_zero_services")}</p>` : p}
      ${u ? c`<p class="hint">${this._tr("pe_choose_services")}</p><div class="svc">${n.map((m) => {
      const f = $i(this.hass, m.id), b = `svc-name-${e}-${m.id}`, x = `svc-description-${e}-${m.id}`;
      return c`<label class="check svc-choice"><input type="checkbox" .checked=${a(m.id)}
          aria-labelledby=${b} aria-describedby=${f ? x : p}
          @change=${(E) => _(m.id, E.target.checked)} />
          <span class="svc-copy"><span id=${b}>${m.label}</span>
            ${f ? c`<span id=${x} class="svc-description">${f}</span>` : p}
          </span></label>`;
    })}</div>` : p}`;
  }
  _renderEntity(t, e, i = !1) {
    Se(this.hass, gr(this.hass, t.entity_id)).then((r) => r && this.requestUpdate());
    const s = this.data.programs.filter((r) => r.id !== this._p.id && r.entities.some((n) => n.entity_id === t.entity_id)).sort((r, n) => r.priority - n.priority || r.name.localeCompare(n.name)).map((r) => this._tr("pe_program_priority", { name: r.name, priority: String(r.priority) }));
    return c`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${gi(this.hass, t.entity_id)}</strong>
            ${this.hass.states[t.entity_id] ? p : c`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${gi(this.hass, t.entity_id)}`}
            @click=${() => void this._askDeleteEntity(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${s.length ? c`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: s.join(", ") })}</p>` : p}
        ${this._renderServices(t, e)}
      </div>`;
  }
  get _seasonsUnapplied() {
    return !!this._profileForm || !this._origin || JSON.stringify(this._p.profiles) !== JSON.stringify(this._origin.profiles) || JSON.stringify(this._p.mode_source) !== JSON.stringify(this._origin.mode_source);
  }
  async _changeActiveMode(t, e) {
    var i;
    if (!(this._changingMode || this._seasonsUnapplied || (i = this._origin) != null && i.mode_source)) {
      this._changingMode = !0, this._error = "";
      try {
        await this.hass.callWS({ type: "weekly_planner/program/set_profile", program_id: this._p.id, profile_id: t });
      } catch (s) {
        this._error = this._errorText(s);
      } finally {
        this._changingMode = !1, e && (e.value = this._activeId());
      }
    }
  }
  _closeModeSchedule() {
    this._scheduleProfileId = null;
    const t = this.data.programs.find((e) => e.id === this._p.id);
    t && this._adoptModeSchedule(t);
  }
  _adoptModeSchedule(t) {
    t.id !== this._p.id || t.revision < this._hoursRevision || (this._hoursRevision = t.revision, this._p = { ...this._p, profiles: structuredClone(t.profiles) }, this._origin && (this._origin = { ...this._origin, profiles: structuredClone(t.profiles) }));
  }
  _sourceState(t, e) {
    const i = this._p.mode_source;
    if (!i || t === e) return;
    if (Object.prototype.hasOwnProperty.call(i.mappings, e)) {
      this._error = this._tr("mode_duplicate_state");
      return;
    }
    const s = Object.fromEntries(Object.entries(i.mappings).map(([r, n]) => [r === t ? e : r, n]));
    this._patch({ mode_source: { ...i, mappings: s } });
  }
  _renderModeSource() {
    var n, o, l;
    const t = this._p.mode_source, e = t ? this.hass.states[t.entity_id] : void 0, i = this.data.status[this._p.id], s = ((n = this._p.profiles.find((a) => a.id === this._activeId())) == null ? void 0 : n.name) ?? "", r = [.../* @__PURE__ */ new Set([
      ...Array.isArray(e == null ? void 0 : e.attributes.options) ? e.attributes.options : [],
      ...e && !["unknown", "unavailable"].includes(e.state) ? [e.state] : [],
      ...Object.keys((t == null ? void 0 : t.mappings) ?? {})
    ])];
    return c`<div class="field"><label for="mode-control">${this._tr("mode_control")}</label>
      <select id="mode-control" .value=${t ? "external" : "manual"}
        @change=${(a) => {
      this._associationsOpen = !0, this._patch({ mode_source: a.target.value === "external" ? { entity_id: "", mappings: {} } : void 0 });
    }}>
        <option value="manual">${this._tr("mode_manual")}</option><option value="external">${this._tr("mode_external")}</option>
      </select></div>
      ${t ? c`<wp-entity-picker .hass=${this.hass} .value=${t.entity_id} .label=${this._tr("mode_source_entity")}
        @wp-change=${(a) => {
      a.stopPropagation(), a.detail !== t.entity_id && (this._associationsOpen = !0, this._patch({ mode_source: { entity_id: a.detail, mappings: {} } }));
    }}></wp-entity-picker>
        <p class="hint">${this._tr("mode_source_hint")}</p>
        ${t.entity_id ? c`
          <p class="hint">${this._tr("mode_source_current", { state: e ? ((l = (o = this.hass).formatEntityState) == null ? void 0 : l.call(o, e)) ?? e.state : this._tr("value_unavailable") })}</p>
          <details class="mode-associations" .open=${this._associationsOpen}
            @toggle=${(a) => {
      this._associationsOpen = a.currentTarget.open;
    }}>
            <summary>${this._tr("mode_association_count", { n: String(Object.keys(t.mappings).length) })}</summary>
          ${Object.entries(t.mappings).map(([a, d], u) => c`<div class="card mode-mapping">
            ${this._picker ? c`<ha-selector .hass=${this.hass} .selector=${{ state: { entity_id: t.entity_id } }}
              .value=${a || void 0} .label=${this._tr("mode_source_state")}
              @value-changed=${(_) => {
      _.stopPropagation(), this._sourceState(a, _.detail.value ?? "");
    }}></ha-selector>` : c`<div class="field"><label for=${`mode-state-${u}`}>${this._tr("mode_source_state")}</label>
                <input id=${`mode-state-${u}`} list="mode-state-values" .value=${a}
                  @change=${(_) => this._sourceState(a, _.target.value)} /></div>`}
            <div class="field"><label for=${`mode-target-${u}`}>${this._tr("mode_source_target")}</label>
              <select id=${`mode-target-${u}`} data-value=${d} @change=${(_) => this._patch({ mode_source: { ...t, mappings: { ...t.mappings, [a]: _.target.value } } })}>
                ${this._p.profiles.some((_) => _.id === d) ? p : c`<option value=${d}>${this._tr("mode_removed")}</option>`}
                ${this._p.profiles.map((_) => c`<option value=${_.id}>${_.name}</option>`)}
              </select></div>
            <button class="btn danger" aria-label=${this._tr("mode_remove_mapping")} @click=${() => this._patch({ mode_source: { ...t, mappings: Object.fromEntries(Object.entries(t.mappings).filter(([_]) => _ !== a)) } })}>
              <ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>
          </div>`)}
          <datalist id="mode-state-values">${r.map((a) => c`<option value=${a}></option>`)}</datalist>
          <button class="btn" ?disabled=${Object.prototype.hasOwnProperty.call(t.mappings, "")} @click=${() => this._patch({ mode_source: { ...t, mappings: { ...t.mappings, "": this._profileId } } })}>
            <ha-icon icon="mdi:plus"></ha-icon>${this._tr("mode_add_mapping")}</button>
          </details>
        ` : p}
        ${!this._seasonsUnapplied && (i != null && i.mode_source_status) && i.mode_source_status !== "matched" ? c`<p class="hint" role="status">${this._tr("mode_source_kept", { name: s })}</p>` : p}
      ` : this._isNew ? p : c`<section class="mode-live"><div class="field"><label for="mode-active">${this._tr("mode_active_immediate")}</label>
        <select id="mode-active" data-value=${this._activeId()} aria-describedby="mode-live-help" ?disabled=${this._seasonsUnapplied || this._changingMode}
          @change=${(a) => void this._changeActiveMode(a.target.value, a.target)}>
          ${this._p.profiles.map((a) => c`<option value=${a.id}>${a.name}</option>`)}
        </select></div><p id="mode-live-help" class="hint">${this._tr("mode_active_immediate_hint")}</p></section>`}`;
  }
  _renderSeasons() {
    var r, n;
    const t = this._p, e = this._profile, i = this._activeId(), s = this._profileForm;
    return c`
      <p class="hint">${this._tr("profile_explanation")}</p>
      ${this._isNew ? p : c`<p class="active-profile" role="status"><ha-icon icon="mdi:star"></ha-icon>
        ${this._tr("profile_current", { name: ((n = (r = this._origin) == null ? void 0 : r.profiles.find((o) => o.id === i)) == null ? void 0 : n.name) ?? e.name })}</p>`}
      ${this._renderModeSource()}
      ${this._seasonsUnapplied ? c`<p class="hint">${this._tr("profile_apply_first")}</p>` : p}
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile_manage")}</label>
          <select id="f-profile" data-value=${e.id} ?disabled=${!!s} @change=${(o) => {
      this._profileId = o.target.value;
    }}>
            ${t.profiles.map((o) => c`<option value=${o.id} ?selected=${o.id === e.id}>${o.name}${o.id === i ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
      </div>
      <p class="hint">${this._tr("profile_draft_hint")}</p>
      <button class="btn" ?disabled=${this._seasonsUnapplied} @click=${() => {
      this._scheduleProfileId = e.id;
    }}>
        <ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("mode_edit_hours")}</button>
      <div class="row season-actions">
        <button class="btn" ?disabled=${!!s}
          @click=${() => this._changeProfileForm({ mode: "add", name: "" })}><ha-icon icon="mdi:plus"></ha-icon>${this._tr("profile_add")}</button>
        <button class="btn" ?disabled=${!!s}
          @click=${() => this._changeProfileForm({ mode: "rename", name: e.name })}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("profile_rename")}</button>
        <button class="btn" ?disabled=${!!s}
          @click=${() => this._changeProfileForm({ mode: "copy", name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 40) })}><ha-icon icon="mdi:content-copy"></ha-icon>${this._tr("profile_copy")}</button>
      </div>
      ${e.id === i ? c`<p class="hint">${this._tr("profile_active_hint")}</p>` : p}
      ${s ? c`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(o) => this._changeProfileForm({ ...s, name: o.target.value }, "season-name")}
                @keydown=${(o) => {
      o.key === "Enter" && (o.preventDefault(), this._save());
    }} /></div>
            ${s.mode === "rename" ? c`<p class="hint">${this._tr("profile_rename_warning")}</p>` : p}
            <button class="btn" @click=${() => this._changeProfileForm(void 0)}>${this._tr("profile_discard_edit")}</button>
          </div>` : p}
      <div class="season-delete"><button class="btn danger"
        ?disabled=${!!s || t.profiles.length < 2 || e.id === i}
        @click=${() => void this._askDeleteProfile(e)}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("profile_delete")}</button></div>
    `;
  }
  _tabKey(t, e) {
    const i = e.findIndex(([r]) => r === this._tab), s = t.key === "ArrowRight" ? (i + 1) % e.length : t.key === "ArrowLeft" ? (i + e.length - 1) % e.length : t.key === "Home" ? 0 : t.key === "End" ? e.length - 1 : -1;
    s < 0 || (t.preventDefault(), this._tab = e[s][0], this.updateComplete.then(() => {
      var r;
      return (r = this.renderRoot.querySelector(`#pe-tab-${this._tab}`)) == null ? void 0 : r.focus();
    }));
  }
  render() {
    if (!this._p) return p;
    const t = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]], e = this._canEdit(), i = c`
      ${e ? p : c`<p class="error" role="alert">${this._tr("read_only")}</p>`}
      <fieldset ?disabled=${!e || this._saving}>
        <div class="history" role="group" aria-label=${this._tr("pe_history")}>
          <button class="btn" aria-label=${this._tr("pe_undo")} title=${this._tr("pe_undo")} ?disabled=${!this._history.canUndo} @click=${() => this._undoDraft()}>
            <ha-icon icon="mdi:undo"></ha-icon>${this._isNew ? p : this._tr("pe_undo")}</button>
          <button class="btn" aria-label=${this._tr("pe_redo")} title=${this._tr("pe_redo")} ?disabled=${!this._history.canRedo} @click=${() => this._redoDraft()}>
            <ha-icon icon="mdi:redo"></ha-icon>${this._isNew ? p : this._tr("pe_redo")}</button>
        </div>
        ${this._isNew ? c`<p class="hint">${this._tr("pe_create_hint")}</p>
          ${this._nameField()}
          <h3>${this._tr("tab_entities")}</h3>${this._renderEntities(!0)}` : c`
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${t.map(([l, a]) => c`<button id=${`pe-tab-${l}`} role="tab" aria-controls="pe-panel" tabindex=${this._tab === l ? 0 : -1} aria-selected=${this._tab === l} class="tab ${this._tab === l ? "on" : ""}"
            @keydown=${(d) => this._tabKey(d, t)} @click=${() => this._tab = l}>${this._tr(a)}</button>`)}
        </div>
        <div id="pe-panel" role="tabpanel" aria-labelledby=${`pe-tab-${this._tab}`}>
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>`}
      </fieldset>`, s = this._error ? c`<p class="error" role="alert">${this._error}</p>` : p, r = c`
      <button class="btn primary" ?disabled=${!e || this._saving} @click=${() => void this._save()}>
        ${this._tr(this._isNew ? "pe_create" : this.embedded ? "ce_apply_program" : "save")}</button>
      ${this.embedded ? p : c`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>`}`, n = c`
      ${this._isNew ? p : c`<button class="btn" ?disabled=${!e || this._saving || !!this._profileForm} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
      ${this._isNew ? p : c`<button class="btn danger" ?disabled=${!e || this._saving || !!this._profileForm}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>`}`, o = !!this._profileForm || (this._origin ? JSON.stringify(this._p) !== JSON.stringify(this._origin) : !!(this._p.name || this._p.entities.length));
    return this.embedded ? c`<section class="embedded">${i}
      ${o && !this._isNew ? c`<p role="status" class="hint">${this._tr("pe_unapplied")}</p>` : p}
      <p class="hint">${this._tr(this._isNew ? "pe_create_save_hint" : "pe_shared_save_hint")}</p>
      ${s}
      <div class="actions apply-bar">${r}</div><div class="actions secondary-actions">${n}</div>
      ${this._applied ? c`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : p}
      ${this._scheduleProfileId ? c`<wp-schedule .hass=${this.hass} .data=${this.data}
        .scope=${{ kind: "program", programId: this._p.id }} .profileId=${this._scheduleProfileId} .chart=${!1}
        @schedule-program-saved=${(l) => {
      l.stopPropagation(), this._adoptModeSchedule(l.detail);
    }}
        @closed=${(l) => {
      l.stopPropagation(), this._closeModeSchedule();
    }}></wp-schedule>` : p}
    </section>` : c`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${i}${s}<div slot="footer" class="actions">${r}${n}</div>
    </wp-dialog>`;
  }
};
L.styles = [
  $t,
  V`
      :host { display: block; }
      fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
      .history { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .history .btn { font-size: 14px; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .apply-bar { position: sticky; bottom: 0; z-index: 2; background: var(--card-background-color, #fff); padding: 8px 0; border-top: 1px solid var(--divider-color); }
      .apply-bar .primary { flex: 1; }
      .mode-live { margin: 12px 0; padding: 8px 12px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .mode-associations { margin: 8px 0 12px; }
      .mode-associations summary { min-height: 44px; display: list-item; align-content: center; cursor: pointer; color: var(--primary-color); }
      .actions .danger { margin-left: auto; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .svc-choice { align-items: flex-start; padding: 8px 0; }
      .svc-choice input { margin-top: 2px; }
      .svc-copy { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
      .svc-description { color: var(--secondary-text-color); font-size: 12px; line-height: 1.45; margin-top: 3px; white-space: pre-line; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${sr(ua)}
      .link {
        display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0; border: none; background: none;
        color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
      }
      .svc { display: flex; flex-direction: column; padding-left: 8px; }
      .profile-bar { align-items: flex-end; gap: 4px; }
      .active-profile { display: flex; align-items: center; gap: 8px; }
      .season-actions { margin: 12px 0; }
      .season-delete { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `
];
q([
  v({ attribute: !1 })
], L.prototype, "hass", 2);
q([
  v({ attribute: !1 })
], L.prototype, "data", 2);
q([
  v({ attribute: !1 })
], L.prototype, "program", 2);
q([
  v({ type: Boolean })
], L.prototype, "embedded", 2);
q([
  $()
], L.prototype, "_applied", 2);
q([
  v({ attribute: !1 })
], L.prototype, "defaultTypes", 2);
q([
  $()
], L.prototype, "_p", 2);
q([
  $()
], L.prototype, "_isNew", 2);
q([
  $()
], L.prototype, "_tab", 2);
q([
  $()
], L.prototype, "_profileId", 2);
q([
  $()
], L.prototype, "_error", 2);
q([
  $()
], L.prototype, "_nameError", 2);
q([
  $()
], L.prototype, "_entitiesError", 2);
q([
  $()
], L.prototype, "_saving", 2);
q([
  $()
], L.prototype, "_changingMode", 2);
q([
  $()
], L.prototype, "_associationsOpen", 2);
q([
  $()
], L.prototype, "_scheduleProfileId", 2);
q([
  $()
], L.prototype, "_picker", 2);
q([
  $()
], L.prototype, "_profileForm", 2);
q([
  $()
], L.prototype, "_servicesOpen", 2);
L = q([
  J("wp-program-editor")
], L);
function fa(t, e) {
  return [...new Set([...t.map((i) => i.area), e].filter((i) => typeof i == "string" && i.length > 0))].sort((i, s) => i.localeCompare(s));
}
function Zs(t, e = []) {
  return [.../* @__PURE__ */ new Set([
    ...t.flatMap((i) => i.entities.map((s) => s.entity_id.split(".")[0])),
    ...e
  ])].filter(Boolean).sort();
}
const yi = /* @__PURE__ */ new Map();
function ga(t, e, i = "mdi:shape-outline") {
  let s = yi.get(e);
  return s || (s = Promise.resolve().then(() => t.callWS({ type: "frontend/get_icons", category: "entity_component", integration: e })).then((r) => {
    var n, o, l;
    return ((l = (o = (n = r == null ? void 0 : r.resources) == null ? void 0 : n[e]) == null ? void 0 : o._) == null ? void 0 : l.default) ?? i;
  }).catch(() => (yi.delete(e), i)), yi.set(e, s)), s;
}
const ti = (t) => [...new Set(t.entities.map((e) => Ut(e.entity_id)))];
function se(t, e, i = [t]) {
  const s = e == null ? void 0 : e.types;
  return (!(s != null && s.length) || ti(t).some((n) => s.includes(n))) && ((e == null ? void 0 : e.programs) === void 0 || Ke(i, e.programs).has(t.id));
}
function ya(t, e, i, s) {
  const r = /* @__PURE__ */ new Map(), n = (l) => {
    let a = r.get(l);
    return a || r.set(l, a = { type: l, label: i(l) || l, programs: [] }), a;
  };
  for (const l of t) for (const a of ti(l)) n(a).programs.push({ id: l.id, name: l.name });
  for (const l of (e == null ? void 0 : e.types) ?? []) l && n(l);
  const o = [...r.values()].sort((l, a) => l.label.localeCompare(a.label, s) || l.type.localeCompare(a.type));
  for (const l of o) l.programs.sort((a, d) => a.name.localeCompare(d.name, s) || a.id.localeCompare(d.id));
  return { groups: o, orphans: Lr(t, e) };
}
const Lr = (t, e) => ((e == null ? void 0 : e.programs) ?? []).filter((i) => !Ke(t, [i]).size);
function ba(t, e, i) {
  var n;
  if (!t.programs.length) return !((n = i == null ? void 0 : i.types) != null && n.length) || i.types.includes(t.type) ? "on" : "off";
  const s = new Map(e.map((o) => [o.id, o])), r = t.programs.filter((o) => s.get(o.id) && se(s.get(o.id), i, e)).length;
  return r === 0 ? "off" : r === t.programs.length ? "on" : "partial";
}
function Hi(t, e, i, s) {
  const r = Lr(t, e), n = (e == null ? void 0 : e.types) ?? [], o = { programs: [...t.map((l) => l.id).filter((l) => i.has(l)), ...r] };
  return n.length && (o.types = [.../* @__PURE__ */ new Set([...n, ...s])]), o;
}
const Br = (t, e) => new Set(t.filter((i) => se(i, e, t)).map((i) => i.id));
function qr(t, e, i, s) {
  const r = Br(t, e), n = t.find((o) => o.id === i);
  return s ? r.add(i) : r.delete(i), Hi(t, e, r, s && n ? ti(n) : []);
}
function va(t, e, i, s) {
  const r = Br(t, e), n = t.filter((l) => ti(l).includes(i));
  for (const l of n)
    s ? r.add(l.id) : r.delete(l.id);
  const o = Hi(t, e, r, s ? [i] : []);
  return !s && !n.length && o.types && (o.types = o.types.filter((l) => l !== i)), o;
}
const tr = () => ({ types: void 0, programs: void 0 });
function $a(t, e) {
  return Hi(t, e, /* @__PURE__ */ new Set(), []);
}
function wa(t, e, i) {
  if (t.program !== void 0) {
    const { filter: n, ...o } = t;
    return { ...o, program: i.id };
  }
  const s = e.some((n) => n.id === i.id) ? e : [...e, i];
  let r = { ...t.filter ?? {} };
  return r.area && i.area !== r.area && delete r.area, se(i, r, s) || (r = { ...r, ...qr(s, r, i.id, !0) }), { ...t, filter: r };
}
var xa = Object.defineProperty, ka = Object.getOwnPropertyDescriptor, nt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ka(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && xa(e, i, r), r;
};
let X = class extends U {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._section = "display", this._editing = null, this._openTypes = /* @__PURE__ */ new Set(), this._leftAll = !1, this._typeIcons = /* @__PURE__ */ new Map(), this._iconKey = "", this._createdName = "", this._createdProgramId = null, this._scheduleProgramId = null, this._editors = /* @__PURE__ */ new Map(), this._domainLoadKey = "", this._tabKey = (t) => {
      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(t.key) && (t.preventDefault(), this._section = t.key === "Home" ? "display" : t.key === "End" || this._section === "display" ? "programs" : "display", this.updateComplete.then(() => {
        var e;
        return (e = this.renderRoot.querySelector(`#ce-tab-${this._section}`)) == null ? void 0 : e.focus();
      }));
    };
  }
  setConfig(t) {
    this._config.program !== t.program && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._config = { ...jr(t) };
  }
  get _lang() {
    return Gt(this.hass);
  }
  _tr(t, e) {
    return h(this._lang, t, e);
  }
  connectedCallback() {
    super.connectedCallback(), this.requestUpdate();
  }
  updated() {
    Bi(this.renderRoot), this._loadDomainNames(), this.isConnected && this.hass && !this._unsub && (this._unsub = mr(this.hass, (t) => this._setData(t)));
  }
  _setData(t) {
    const e = this._justCreated;
    e && (t.programs.some((i) => i.id === e.id) ? this._justCreated = void 0 : t = { ...t, programs: [...t.programs, e] }), this._data = t, this._programs = t.programs.map((i) => ({ id: i.id, name: i.name }));
  }
  /** HA owns domain names and their translations, including domains unknown to this card. */
  _loadDomainNames() {
    var i, s, r;
    if (this.hass && this._data && this._loadDomainIcons(Zs(this._data.programs, (i = this._config.filter) == null ? void 0 : i.types)), !((s = this.hass) != null && s.loadBackendTranslation) || !this._data) return;
    const t = Zs(this._data.programs, (r = this._config.filter) == null ? void 0 : r.types), e = `${this._lang}|${t.join(",")}`;
    e !== this._domainLoadKey && (this._domainLoadKey = e, this._domainLocalize = void 0, t.length && this.hass.loadBackendTranslation("title", t).then((n) => {
      e === this._domainLoadKey && (this._domainLocalize = n, this.requestUpdate());
    }).catch(() => {
      e === this._domainLoadKey && (this._domainLoadKey = "");
    }));
  }
  _loadDomainIcons(t) {
    const e = t.join(",");
    e === this._iconKey || !t.length || (this._iconKey = e, Promise.all(t.map(async (i) => [i, await ga(this.hass, i)])).then((i) => {
      this._typeIcons = new Map(i);
    }));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._unsub) == null || t.call(this), this._unsub = void 0;
  }
  _saved(t) {
    var l, a;
    t.stopPropagation();
    const e = t.detail, i = t.currentTarget, s = (l = [...this._editors].find(([, d]) => d === i)) == null ? void 0 : l[0], r = this._editing ?? this._config.program ?? "", n = s === r;
    s !== void 0 && (this._editors.delete(s), this._editors.set(e.id, i));
    const o = n && r === "new";
    if (this._data && this._setData({ ...this._data, programs: [...this._data.programs.filter((d) => d.id !== e.id), e] }), o && (this._justCreated = e), o)
      this._emit(wa(this._config, ((a = this._data) == null ? void 0 : a.programs) ?? [e], e));
    else if (n && r !== e.id) {
      const d = { ...this._config, program: e.id };
      delete d.filter, this._emit(d);
    }
    n && (this._editing = e.id), n && r === "new" && (this._createdName = e.name, this._createdProgramId = e.id, this._section = "display");
  }
  _programEditor(t, e) {
    let i = this._editors.get(t);
    return i || (i = document.createElement("wp-program-editor"), i.embedded = !0, i.addEventListener("program-saved", (s) => this._saved(s)), i.addEventListener("program-deleted", (s) => {
      var n;
      s.stopPropagation();
      const r = s.detail;
      this._editors.delete(r), ((n = this._justCreated) == null ? void 0 : n.id) === r && (this._justCreated = void 0), this._editing = "", this._config.program === r && this._setMode(!1);
    }), this._editors.set(t, i)), i.hass = this.hass, i.data = this._data, i.program = e, i;
  }
  _settings() {
    var r, n;
    const t = this._data;
    if (!t || !((n = (r = this.hass) == null ? void 0 : r.user) != null && n.is_admin) || !t.can_edit || t.read_only) return p;
    const e = t.programs, i = this._editing ?? (this._isProgram && this._config.program ? this._config.program : ""), s = t.programs.find((o) => o.id === i);
    return c`<section class="program-settings">
      <h3>${this._tr(i === "new" ? "new_program" : "ce_program_settings")}</h3>
      <div class="field"><label for="ce-settings-program">${this._tr("ce_edit_program")}</label>
        <select id="ce-settings-program" data-value=${i} @change=${(o) => {
      const l = o.target.value;
      l === "new" ? this._newProgram() : this._editing = l;
    }}>
          <option value="" ?selected=${!i}>${this._tr("ce_choose_program")}</option>
          <hr />
          <option value="new" ?selected=${i === "new"}>${this._tr(this._editors.has("new") && i !== "new" ? "ce_resume_creation" : "new_program")}</option>
          <hr />
          ${e.map((o) => c`<option value=${o.id} ?selected=${i === o.id}>${o.name}</option>`)}
        </select>
      </div>
      ${i === "new" || s ? this._programEditor(i, s) : p}
    </section>`;
  }
  get _canManage() {
    var t, e, i, s;
    return !!((e = (t = this.hass) == null ? void 0 : t.user) != null && e.is_admin && ((i = this._data) != null && i.can_edit) && !((s = this._data) != null && s.read_only));
  }
  _newProgram() {
    this._createdName = "", this._createdProgramId = null, this._editing = "new", this._section = "programs", this.updateComplete.then(() => {
      var t;
      return (t = this.renderRoot.querySelector("#ce-settings-program")) == null ? void 0 : t.focus();
    });
  }
  _emit(t) {
    const e = ra(t);
    this._config = e, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 }));
  }
  _set(t, e) {
    const i = { ...this._config };
    e === void 0 || e === "" || e === null ? delete i[t] : i[t] = e, t === "program" && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._emit(i);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(t) {
    var i, s;
    this._editing = null, this._leftAll = !1;
    const e = { ...this._config };
    t ? (delete e.filter, e.program = ((i = this._programs[0]) == null ? void 0 : i.id) ?? "") : (delete e.program, e.filter = { ...e.filter, types: ((s = e.filter) == null ? void 0 : s.types) ?? [] }), this._emit(e);
  }
  _setFilter(t) {
    var s;
    const e = { ...this._config.filter ?? {}, ...t };
    for (const r of ["types", "programs"]) e[r] === void 0 && delete e[r];
    (s = e.types) != null && s.length || delete e.types, e.area || delete e.area;
    const i = { ...this._config, filter: e };
    this._emit(i);
  }
  _typeLabel(t) {
    var e, i, s;
    return ((i = (e = this.hass) == null ? void 0 : e.localize) == null ? void 0 : i.call(e, `component.${t}.title`)) || ((s = this._domainLocalize) == null ? void 0 : s.call(this, `component.${t}.title`)) || t;
  }
  _switch(t, e, i, s = !1, r = !1) {
    return c`<ha-switch class=${s ? "partial" : ""} .checked=${t} .disabled=${r} aria-label=${e}
      @change=${(n) => i(n.target.checked)}></ha-switch>`;
  }
  /** A change in the "programs to display" tree; leaving "All programs" is flagged so the card can say what it means. */
  _treeChange(t) {
    var s;
    const e = this._config.filter, i = (e == null ? void 0 : e.programs) === void 0 && !((s = e == null ? void 0 : e.types) != null && s.length);
    t.programs === void 0 ? this._leftAll = !1 : i && (this._leftAll = !0), this._setFilter(t);
  }
  _toggleType(t) {
    const e = new Set(this._openTypes);
    e.delete(t) || e.add(t), this._openTypes = e;
  }
  _displayPrograms() {
    var l, a;
    const t = this._config.filter, e = ((l = this._data) == null ? void 0 : l.programs) ?? [], i = (t == null ? void 0 : t.programs) === void 0 && !((a = t == null ? void 0 : t.types) != null && a.length), { groups: s, orphans: r } = ya(e, t, (d) => this._typeLabel(d), this._lang), n = new Map(e.map((d) => [d.id, d])), o = i ? this._tr("ce_all_programs") : this._tr("ce_of_total", { on: String(e.filter((d) => se(d, t, e)).length + r.length), total: String(e.length + r.length) });
    return c`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${o}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_all_programs")}</span>
        ${this._switch(i, this._tr("ce_all_programs"), (d) => this._treeChange(d ? tr() : $a(e, t)))}</div>
      ${!i && this._leftAll ? c`<div class="notice" role="status"><ha-icon icon="mdi:information-outline"></ha-icon>
        <span class="grow">${this._tr("ce_left_all")}</span>
        <button class="btn" @click=${() => this._treeChange(tr())}><ha-icon icon="mdi:restore"></ha-icon>${this._tr("ce_back_all")}</button></div>` : p}
      ${!s.length && !r.length ? c`<p class="hint">${this._tr("ce_no_types")}</p>` : p}
      <div role="group" aria-label=${this._tr("ce_display_programs")}>
        ${s.map((d) => {
      const u = ba(d, e, t), _ = d.programs.length >= 2, m = _ && this._openTypes.has(d.type), f = d.programs.filter((A) => se(n.get(A.id), t, e)).length, b = u === "partial", x = String(this._tr("ce_type_count", { on: String(f), total: String(d.programs.length) })), E = c`<ha-icon class="type-icon" icon=${this._typeIcons.get(d.type) ?? "mdi:shape-outline"}></ha-icon>
            <span class="grow titles"><span class="type-title">${d.label}</span>
              ${_ ? c`<span class="count">${x}${b ? c` · <b>${this._tr("ce_partial")}</b>` : p}</span>` : p}
              <span class="type-names">${d.programs.length ? d.programs.map((A) => A.name).join(", ") : this._tr("ce_type_empty")}</span></span>`, k = b ? this._tr("ce_partial_label", { name: this._tr("ce_type_switch", { type: d.label }), on: String(f), total: String(d.programs.length) }) : this._tr("ce_type_switch", { type: d.label });
      return c`<div class="type-group" data-type=${d.type}>
            <div class="switch-row">
              ${_ ? c`<button class="type-head" aria-expanded=${m} aria-controls=${`ce-type-${d.type}`} @click=${() => this._toggleType(d.type)}>
                    <ha-icon icon=${m ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>${E}</button>` : c`<div class="type-head static"><span class="chev-space"></span>${E}</div>`}
              ${this._switch(u !== "off", k, (A) => this._treeChange(va(e, t, d.type, A)), b)}
            </div>
            ${_ ? c`<div id=${`ce-type-${d.type}`} class="type-body" ?hidden=${!m}>
              ${d.programs.map((A) => c`<div class="switch-row sub"><span class="grow">${A.name}</span>
                ${this._switch(se(n.get(A.id), t, e), A.name, (H) => this._treeChange(qr(e, t, A.id, H)))}</div>`)}
            </div>` : p}
          </div>`;
    })}
        ${r.length ? c`<div class="label">${this._tr("ce_other_programs")}</div>${r.map((d) => c`<div class="switch-row sub"><span class="grow">${d}</span>
          ${this._switch(!0, d, () => this._treeChange({ programs: ((t == null ? void 0 : t.programs) ?? []).filter((u) => u !== d) }))}</div>`)}` : p}
      </div>
    </details>`;
  }
  render() {
    var r, n, o, l;
    const t = this._config, e = fa(((r = this._data) == null ? void 0 : r.programs) ?? [], (n = t.filter) == null ? void 0 : n.area), i = c`
      ${this._createdName ? c`<div class="created-next-step"><p class="hint" role="status">${this._tr("ce_created", { name: this._createdName })}</p>
        <button class="btn primary" @click=${() => {
      this._scheduleProgramId = this._createdProgramId;
    }}><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_define_schedule")}</button></div>` : p}
      ${this._editors.has("new") ? c`<p class="hint" role="status">${this._tr("ce_draft_kept")}</p>` : p}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${t.title ?? ""} @input=${(a) => this._set("title", a.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? c`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${t.program ?? ""} @change=${(a) => this._set("program", a.target.value)}>
              ${this._programs.length === 0 ? c`<option value="">${this._tr("no_program")}</option>` : p}
              ${!this._programs.some((a) => a.id === t.program) && t.program ? c`<option value=${t.program} selected>${t.program}</option>` : p}
              ${this._programs.map((a) => c`<option value=${a.id} ?selected=${a.id === t.program}>${a.name}</option>`)}
            </select>
            ${this._canManage ? c`<div class="program-actions">
              <button class="btn" @click=${this._newProgram}><ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>
              ${t.program ? c`<button class="btn" @click=${() => {
      this._editing = t.program, this._section = "programs";
    }}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("ce_edit_selected")}</button>` : p}
            </div>` : p}</div>` : c`
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <select id="ce-area" data-value=${((o = t.filter) == null ? void 0 : o.area) ?? ""} aria-describedby="ce-area-help"
                @change=${(a) => this._setFilter({ area: a.target.value })}>
                <option value="">${this._tr("ce_all_areas")}</option>
                ${e.map((a) => c`<option value=${a}>${a}</option>`)}
              </select><p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>
            ${this._displayPrograms()}`}

      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${t.schedule_view ?? "bars"} @change=${(a) => this._set("schedule_view", a.target.value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
        </select>
      </div>
      <div class="switch-row"><span class="grow">${this._tr("ce_show_chart")}</span>
        ${this._switch(t.show_chart !== !1, this._tr("ce_show_chart"), (a) => this._set("show_chart", a))}</div>
      <p class="hint">${this._tr("ce_show_chart_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_chart_open")}</span>
        ${this._switch(t.chart_collapsed === !1, this._tr("ce_chart_open"), (a) => this._set("chart_collapsed", !a), !1, t.show_chart === !1)}</div>
      <p class="hint">${this._tr("ce_chart_open_hint")}</p>
    `, s = this._canManage;
    return c`
      ${s ? c`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button id="ce-tab-display" role="tab" aria-controls="ce-panel" tabindex=${this._section === "display" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "display"} @click=${() => {
      this._section = "display";
    }}>${this._tr("ce_display")}</button>
        <button id="ce-tab-programs" role="tab" aria-controls="ce-panel" tabindex=${this._section === "programs" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "programs"} @click=${() => {
      this._section = "programs";
    }}>${this._tr("ce_program_settings")}</button>
      </nav>` : p}
      <div id="ce-panel" role="tabpanel" aria-labelledby=${s ? `ce-tab-${this._section}` : p}>${s && this._section === "programs" ? this._settings() : i}</div>
      ${this._scheduleProgramId && ((l = this._data) != null && l.programs.some((a) => a.id === this._scheduleProgramId)) ? c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${{ kind: "program", programId: this._scheduleProgramId }} .chart=${!1}
        @closed=${(a) => {
      a.stopPropagation(), this._scheduleProgramId = null;
    }}></wp-schedule>` : p}`;
  }
};
X.styles = [$t, V`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 16px; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .switch-row { display: flex; align-items: center; gap: 8px; min-height: 48px; overflow-wrap: anywhere; } .switch-row.sub { padding-left: 28px; } .type-head { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; min-height: 48px; border: 0; background: none; color: inherit; text-align: start; cursor: pointer; } .type-body[hidden] { display: none; } ha-switch { padding: 12px 8px; margin: -12px -8px; flex: none; } ha-switch.partial { --mdc-theme-secondary: var(--warning-color, #ffa600); } .type-icon { flex: none; color: var(--secondary-text-color); } .titles { display: flex; flex-direction: column; flex: 1 1 0; min-width: 0; } .type-title { font-size: 16px; overflow-wrap: normal; word-break: keep-all; } .type-names { font-size: 14px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .count { font-size: 14px; color: var(--secondary-text-color); } .count b { color: var(--primary-text-color); } .type-head.static { cursor: default; } .chev-space { flex: none; width: 24px; } .notice { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 8px 0; padding: 8px 12px; border-radius: 8px; background: var(--secondary-background-color); border-inline-start: 4px solid var(--warning-color, #ffa600); line-height: 1.5; } .notice .grow { flex: 1 1 10em; min-width: 10em; } .notice .btn { flex: 1 1 100%; box-sizing: border-box; min-width: 0; max-width: 100%; min-height: 44px; height: auto; white-space: normal; text-align: center; overflow-wrap: anywhere; } .program-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }`];
nt([
  v({ attribute: !1 })
], X.prototype, "hass", 2);
nt([
  $()
], X.prototype, "_config", 2);
nt([
  $()
], X.prototype, "_programs", 2);
nt([
  $()
], X.prototype, "_data", 2);
nt([
  $()
], X.prototype, "_section", 2);
nt([
  $()
], X.prototype, "_editing", 2);
nt([
  $()
], X.prototype, "_openTypes", 2);
nt([
  $()
], X.prototype, "_leftAll", 2);
nt([
  $()
], X.prototype, "_typeIcons", 2);
nt([
  $()
], X.prototype, "_createdName", 2);
nt([
  $()
], X.prototype, "_createdProgramId", 2);
nt([
  $()
], X.prototype, "_scheduleProgramId", 2);
X = nt([
  J("weekly-planner-card-editor")
], X);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
