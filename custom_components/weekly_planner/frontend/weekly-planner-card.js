/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pe = globalThis, fi = Pe.ShadowRoot && (Pe.ShadyCSS === void 0 || Pe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, gi = Symbol(), Ri = /* @__PURE__ */ new WeakMap();
let Es = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== gi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (fi && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = Ri.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Ri.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ms = (t) => new Es(typeof t == "string" ? t : t + "", void 0, gi), R = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new Es(i, t, gi);
}, or = (t, e) => {
  if (fi) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = Pe.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, Bi = fi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return Ms(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: nr, defineProperty: ar, getOwnPropertyDescriptor: lr, getOwnPropertyNames: cr, getOwnPropertySymbols: dr, getPrototypeOf: hr } = Object, $t = globalThis, qi = $t.trustedTypes, pr = qi ? qi.emptyScript : "", Ve = $t.reactiveElementPolyfillSupport, ie = (t, e) => t, De = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? pr : null;
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
} }, yi = (t, e) => !nr(t, e), Ui = { attribute: !0, type: String, converter: De, reflect: !1, useDefault: !1, hasChanged: yi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), $t.litPropertyMetadata ?? ($t.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let qt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = Ui) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && ar(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: o } = lr(this.prototype, e) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const l = r == null ? void 0 : r.call(this);
      o == null || o.call(this, n), this.requestUpdate(e, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ui;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ie("elementProperties"))) return;
    const e = hr(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ie("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
      const i = this.properties, s = [...cr(i), ...dr(i)];
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
      for (const r of s) i.unshift(Bi(r));
    } else e !== void 0 && i.push(Bi(e));
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
    return or(e, this.constructor.elementStyles), e;
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
    var o;
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : De).toAttribute(i, s.type);
      this._$Em = e, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(e, i) {
    var o, n;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const l = s.getPropertyOptions(r), a = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((o = l.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? l.converter : De;
      this._$Em = r;
      const p = a.fromAttribute(i, l.type);
      this[r] = p ?? ((n = this._$Ej) == null ? void 0 : n.get(r)) ?? p, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, o) {
    var n;
    if (e !== void 0) {
      const l = this.constructor;
      if (r === !1 && (o = this[e]), s ?? (s = l.getPropertyOptions(e)), !((s.hasChanged ?? yi)(o, i) || s.useDefault && s.reflect && o === ((n = this._$Ej) == null ? void 0 : n.get(e)) && !this.hasAttribute(l._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: r, wrapped: o }, n) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, n ?? i ?? this[e]), o !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [o, n] of this._$Ep) this[o] = n;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, n] of r) {
        const { wrapped: l } = n, a = this[o];
        l !== !0 || this._$AL.has(o) || a === void 0 || this.C(o, void 0, n, a);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (s = this._$EO) == null || s.forEach((r) => {
        var o;
        return (o = r.hostUpdate) == null ? void 0 : o.call(r);
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
qt.elementStyles = [], qt.shadowRootOptions = { mode: "open" }, qt[ie("elementProperties")] = /* @__PURE__ */ new Map(), qt[ie("finalized")] = /* @__PURE__ */ new Map(), Ve == null || Ve({ ReactiveElement: qt }), ($t.reactiveElementVersions ?? ($t.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, Fi = (t) => t, Ne = se.trustedTypes, Wi = Ne ? Ne.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Os = "$lit$", yt = `lit$${Math.random().toFixed(9).slice(2)}$`, Is = "?" + yt, ur = `<${Is}>`, Dt = document, ae = () => Dt.createComment(""), le = (t) => t === null || typeof t != "object" && typeof t != "function", bi = Array.isArray, _r = (t) => bi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", Je = `[ 	
\f\r]`, Zt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Hi = /-->/g, Ki = />/g, Et = RegExp(`>|${Je}(?:([^\\s"'>=/]+)(${Je}*=${Je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Vi = /'/g, Ji = /"/g, zs = /^(?:script|style|textarea|title)$/i, Ds = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), c = Ds(1), O = Ds(2), Nt = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), Gi = /* @__PURE__ */ new WeakMap(), It = Dt.createTreeWalker(Dt, 129);
function Ns(t, e) {
  if (!bi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Wi !== void 0 ? Wi.createHTML(e) : e;
}
const mr = (t, e) => {
  const i = t.length - 1, s = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = Zt;
  for (let l = 0; l < i; l++) {
    const a = t[l];
    let p, h, f = -1, _ = 0;
    for (; _ < a.length && (n.lastIndex = _, h = n.exec(a), h !== null); ) _ = n.lastIndex, n === Zt ? h[1] === "!--" ? n = Hi : h[1] !== void 0 ? n = Ki : h[2] !== void 0 ? (zs.test(h[2]) && (r = RegExp("</" + h[2], "g")), n = Et) : h[3] !== void 0 && (n = Et) : n === Et ? h[0] === ">" ? (n = r ?? Zt, f = -1) : h[1] === void 0 ? f = -2 : (f = n.lastIndex - h[2].length, p = h[1], n = h[3] === void 0 ? Et : h[3] === '"' ? Ji : Vi) : n === Ji || n === Vi ? n = Et : n === Hi || n === Ki ? n = Zt : (n = Et, r = void 0);
    const m = n === Et && t[l + 1].startsWith("/>") ? " " : "";
    o += n === Zt ? a + ur : f >= 0 ? (s.push(p), a.slice(0, f) + Os + a.slice(f) + yt + m) : a + yt + (f === -2 ? l : m);
  }
  return [Ns(t, o + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class ce {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const l = e.length - 1, a = this.parts, [p, h] = mr(e, i);
    if (this.el = ce.createElement(p, s), It.currentNode = this.el.content, i === 2 || i === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = It.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(Os)) {
          const _ = h[n++], m = r.getAttribute(f).split(yt), g = /([.?@])?(.*)/.exec(_);
          a.push({ type: 1, index: o, name: g[2], strings: m, ctor: g[1] === "." ? gr : g[1] === "?" ? yr : g[1] === "@" ? br : qe }), r.removeAttribute(f);
        } else f.startsWith(yt) && (a.push({ type: 6, index: o }), r.removeAttribute(f));
        if (zs.test(r.tagName)) {
          const f = r.textContent.split(yt), _ = f.length - 1;
          if (_ > 0) {
            r.textContent = Ne ? Ne.emptyScript : "";
            for (let m = 0; m < _; m++) r.append(f[m], ae()), It.nextNode(), a.push({ type: 2, index: ++o });
            r.append(f[_], ae());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Is) a.push({ type: 2, index: o });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(yt, f + 1)) !== -1; ) a.push({ type: 7, index: o }), f += yt.length - 1;
      }
      o++;
    }
  }
  static createElement(e, i) {
    const s = Dt.createElement("template");
    return s.innerHTML = e, s;
  }
}
function Kt(t, e, i = t, s) {
  var n, l;
  if (e === Nt) return e;
  let r = s !== void 0 ? (n = i._$Co) == null ? void 0 : n[s] : i._$Cl;
  const o = le(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== o && ((l = r == null ? void 0 : r._$AO) == null || l.call(r, !1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (e = Kt(t, r._$AS(t, e.values), r, s)), e;
}
class fr {
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
    const { el: { content: i }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? Dt).importNode(i, !0);
    It.currentNode = r;
    let o = It.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let p;
        a.type === 2 ? p = new Jt(o, o.nextSibling, this, e) : a.type === 1 ? p = new a.ctor(o, a.name, a.strings, this, e) : a.type === 6 && (p = new vr(o, this, e)), this._$AV.push(p), a = s[++l];
      }
      n !== (a == null ? void 0 : a.index) && (o = It.nextNode(), n++);
    }
    return It.currentNode = Dt, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class Jt {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = Kt(this, e, i), le(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== Nt && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : _r(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && le(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Dt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = ce.createElement(Ns(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === r) this._$AH.p(i);
    else {
      const n = new fr(r, this), l = n.u(this.options);
      n.p(i), this.T(l), this._$AH = n;
    }
  }
  _$AC(e) {
    let i = Gi.get(e.strings);
    return i === void 0 && Gi.set(e.strings, i = new ce(e)), i;
  }
  k(e) {
    bi(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const o of e) r === i.length ? i.push(s = new Jt(this.O(ae()), this.O(ae()), this, this.options)) : s = i[r], s._$AI(o), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); e !== this._$AB; ) {
      const r = Fi(e).nextSibling;
      Fi(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var i;
    this._$AM === void 0 && (this._$Cv = e, (i = this._$AP) == null || i.call(this, e));
  }
}
class qe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(e, i = this, s, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) e = Kt(this, e, i, 0), n = !le(e) || e !== this._$AH && e !== Nt, n && (this._$AH = e);
    else {
      const l = e;
      let a, p;
      for (e = o[0], a = 0; a < o.length - 1; a++) p = Kt(this, l[s + a], i, a), p === Nt && (p = this._$AH[a]), n || (n = !le(p) || p !== this._$AH[a]), p === u ? e = u : e !== u && (e += (p ?? "") + o[a + 1]), this._$AH[a] = p;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class gr extends qe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class yr extends qe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class br extends qe {
  constructor(e, i, s, r, o) {
    super(e, i, s, r, o), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = Kt(this, e, i, 0) ?? u) === Nt) return;
    const s = this._$AH, r = e === u && s !== u || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== u && (s === u || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class vr {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Kt(this, e);
  }
}
const $r = { I: Jt }, Ge = se.litHtmlPolyfillSupport;
Ge == null || Ge(ce, Jt), (se.litHtmlVersions ?? (se.litHtmlVersions = [])).push("3.3.3");
const xr = (t, e, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new Jt(e.insertBefore(ae(), o), o, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = globalThis;
let D = class extends qt {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = xr(i, this.renderRoot, this.renderOptions);
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
    return Nt;
  }
};
var Cs;
D._$litElement$ = !0, D.finalized = !0, (Cs = zt.litElementHydrateSupport) == null || Cs.call(zt, { LitElement: D });
const Ye = zt.litElementPolyfillSupport;
Ye == null || Ye({ LitElement: D });
(zt.litElementVersions ?? (zt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wr = { CHILD: 2 }, Ts = (t) => (...e) => ({ _$litDirective$: t, values: e });
let js = class {
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
const { I: kr } = $r, Yi = (t) => t, Xi = () => document.createComment(""), Qt = (t, e, i) => {
  var o;
  const s = t._$AA.parentNode, r = e === void 0 ? t._$AB : e._$AA;
  if (i === void 0) {
    const n = s.insertBefore(Xi(), r), l = s.insertBefore(Xi(), r);
    i = new kr(n, l, t, t.options);
  } else {
    const n = i._$AB.nextSibling, l = i._$AM, a = l !== t;
    if (a) {
      let p;
      (o = i._$AQ) == null || o.call(i, t), i._$AM = t, i._$AP !== void 0 && (p = t._$AU) !== l._$AU && i._$AP(p);
    }
    if (n !== r || a) {
      let p = i._$AA;
      for (; p !== n; ) {
        const h = Yi(p).nextSibling;
        Yi(s).insertBefore(p, r), p = h;
      }
    }
  }
  return i;
}, Mt = (t, e, i = t) => (t._$AI(e, i), t), Sr = {}, Ls = (t, e = Sr) => t._$AH = e, Ar = (t) => t._$AH, Xe = (t) => {
  t._$AR(), t._$AA.remove();
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = Ts(class extends js {
  constructor() {
    super(...arguments), this.key = u;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, i]) {
    return e !== this.key && (Ls(t), this.key = e), i;
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
const Pr = { attribute: !0, type: String, converter: De, reflect: !1, hasChanged: yi }, Cr = (t = Pr, e, i) => {
  const { kind: s, metadata: r } = i;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(i.name, t), s === "accessor") {
    const { name: n } = i;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(n, a, t, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, t, l), l;
    } };
  }
  if (s === "setter") {
    const { name: n } = i;
    return function(l) {
      const a = this[n];
      e.call(this, l), this.requestUpdate(n, a, t, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function v(t) {
  return (e, i) => typeof i == "object" ? Cr(t, e, i) : ((s, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
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
const Zi = (t, e, i) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = e; r <= i; r++) s.set(t[r], r);
  return s;
}, Er = Ts(class extends js {
  constructor(t) {
    if (super(t), t.type !== wr.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(t, e, i) {
    let s;
    i === void 0 ? i = e : e !== void 0 && (s = e);
    const r = [], o = [];
    let n = 0;
    for (const l of t) r[n] = s ? s(l, n) : n, o[n] = i(l, n), n++;
    return { values: o, keys: r };
  }
  render(t, e, i) {
    return this.dt(t, e, i).values;
  }
  update(t, [e, i, s]) {
    const r = Ar(t), { values: o, keys: n } = this.dt(e, i, s);
    if (!Array.isArray(r)) return this.ut = n, o;
    const l = this.ut ?? (this.ut = []), a = [];
    let p, h, f = 0, _ = r.length - 1, m = 0, g = o.length - 1;
    for (; f <= _ && m <= g; ) if (r[f] === null) f++;
    else if (r[_] === null) _--;
    else if (l[f] === n[m]) a[m] = Mt(r[f], o[m]), f++, m++;
    else if (l[_] === n[g]) a[g] = Mt(r[_], o[g]), _--, g--;
    else if (l[f] === n[g]) a[g] = Mt(r[f], o[g]), Qt(t, a[g + 1], r[f]), f++, g--;
    else if (l[_] === n[m]) a[m] = Mt(r[_], o[m]), Qt(t, r[f], r[_]), _--, m++;
    else if (p === void 0 && (p = Zi(n, m, g), h = Zi(l, f, _)), p.has(l[f])) if (p.has(l[_])) {
      const w = h.get(n[m]), S = w !== void 0 ? r[w] : null;
      if (S === null) {
        const k = Qt(t, r[f]);
        Mt(k, o[m]), a[m] = k;
      } else a[m] = Mt(S, o[m]), Qt(t, r[f], S), r[w] = null;
      m++;
    } else Xe(r[_]), _--;
    else Xe(r[f]), f++;
    for (; m <= g; ) {
      const w = Qt(t, a[g + 1]);
      Mt(w, o[m]), a[m++] = w;
    }
    for (; f <= _; ) {
      const w = r[f++];
      w !== null && Xe(w);
    }
    return this.ut = n, Ls(t, a), Nt;
  }
});
var Mr = Object.defineProperty, Or = Object.getOwnPropertyDescriptor, Gt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Or(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Mr(e, i, r), r;
};
const Ir = 2e3;
let kt = class extends D {
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
    this._mouse = t.pointerType === "mouse", !(this.through && this._mouse) && (t.stopPropagation(), t.pointerType !== "mouse" && (this._on(), clearTimeout(this._timer), this._timer = setTimeout(() => this._off(), Ir)));
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
      ${this._show && this.text ? c`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : u}`;
  }
};
kt.styles = R`
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
Gt([
  v()
], kt.prototype, "text", 2);
Gt([
  v({ type: Boolean })
], kt.prototype, "passive", 2);
Gt([
  v({ type: Boolean })
], kt.prototype, "through", 2);
Gt([
  $()
], kt.prototype, "_show", 2);
Gt([
  $()
], kt.prototype, "_shift", 2);
kt = Gt([
  B("wp-tip")
], kt);
const zr = {
  pe_area: "Program area (optional)",
  pe_area_hint: "Choose an existing name or enter a new one. This groups programs in card filters; device rooms are not used automatically.",
  ce_all_areas: "All areas",
  ce_area_hint: "Set each program’s area in its General settings. Device rooms are not used automatically.",
  no_matching_program: "No programs match this card’s filters. Check the type, area and program selection in the card settings.",
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
  ce_schedule_view: "Schedule view",
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
  action_target_hint: "This label acts on the selected entity, for example a favorite-position button or a script.",
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
  tab_seasons: "Modes",
  ch_set: "Set",
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
  ce_one_program: "One program",
  ce_filtered: "Filtered list",
  ce_program: "Program",
  ce_edit_program: "Program to edit",
  ce_edit_selected: "Edit this program",
  ce_resume_creation: "Continue creating program",
  ce_draft_kept: "Your new program draft is kept. Continue creating it when ready.",
  ce_created: "“{name}” created and selected for this card. Now add its schedules.",
  pe_create: "Create program",
  pe_create_hint: "Choose a name, add the devices and select the actions to offer.",
  pe_create_save_hint: "Create program saves it in Home Assistant. Then save the card to keep its display settings.",
  ce_types: "Types",
  ce_types_hint: "No type checked: all types.",
  ce_display_programs: "Programs to display",
  ce_all_programs: "All programs",
  ce_display_programs_hint: "Only affects this card. Type and area filters also apply. All programs includes future programs.",
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
  program_disabled: "Disabled",
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
}, Dr = {
  pe_area: "Zone du programme (facultatif)",
  pe_area_hint: "Choisissez un nom existant ou saisissez-en un nouveau. Cette zone regroupe les programmes dans les filtres des cartes ; les pièces des appareils ne sont pas reprises automatiquement.",
  ce_all_areas: "Toutes les zones",
  ce_area_hint: "Définissez la zone de chaque programme dans Général. Les pièces des appareils ne sont pas reprises automatiquement.",
  no_matching_program: "Aucun programme ne correspond aux filtres de cette carte. Vérifiez les types, la zone et les programmes sélectionnés dans les réglages de la carte.",
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
  ce_schedule_view: "Vue des horaires",
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
  action_target_hint: "Cette étiquette agit sur l’entité choisie, par exemple un bouton de position favorite ou un script.",
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
  tab_seasons: "Modes",
  ch_set: "Réglé",
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
  ce_one_program: "Un programme",
  ce_filtered: "Liste filtrée",
  ce_program: "Programme",
  ce_edit_program: "Programme à modifier",
  ce_edit_selected: "Modifier ce programme",
  ce_resume_creation: "Continuer la création",
  ce_draft_kept: "Votre nouveau programme est conservé en brouillon. Vous pouvez continuer sa création.",
  ce_created: "« {name} » créé et sélectionné pour cette carte. Ajoutez maintenant ses horaires.",
  pe_create: "Créer le programme",
  pe_create_hint: "Donnez un nom, ajoutez les appareils et cochez les actions à proposer.",
  pe_create_save_hint: "Créer le programme l’enregistre dans Home Assistant. Enregistrez ensuite la carte pour conserver son affichage.",
  ce_types: "Types",
  ce_types_hint: "Aucun type coché : tous les types.",
  ce_display_programs: "Programmes à afficher",
  ce_all_programs: "Tous les programmes",
  ce_display_programs_hint: "Concerne uniquement cette carte. Les filtres de type et de zone s’appliquent aussi. Tous les programmes inclut les futurs programmes.",
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
  program_disabled: "Désactivé",
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
function F(t) {
  return t.startsWith("fr") ? Dr : zr;
}
function d(t, e, i = {}) {
  let s = F(t)[e];
  for (const [r, o] of Object.entries(i)) s = s.replace(`{${r}}`, o);
  return s;
}
function Ue(t, e) {
  const [i, s, r] = t.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + e)).toISOString().slice(0, 10);
}
const je = 5, A = 1440;
function xt(t) {
  const [e, i] = t.split(":").map(Number);
  return e * 60 + i;
}
function de(t) {
  const e = Math.max(0, Math.min(A, Math.round(t / je) * je));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function ht(t, e) {
  var n, l;
  const i = typeof t == "string" ? new Date(t) : t, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((n = s.find((a) => a.type === "hour")) == null ? void 0 : n.value) ?? 0), o = Number(((l = s.find((a) => a.type === "minute")) == null ? void 0 : l.value) ?? 0);
  return r * 60 + o;
}
function Ce(t, e) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: e, weekday: "short" }).format(t);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function pt(t, e) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: e }).format(t);
}
function St(t) {
  return !t || !("time" in t) ? null : xt(t.time);
}
function Rs(t) {
  const e = [];
  for (const i of t) {
    const s = St(i.start), r = St(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && e.push({ slot: i, end: r });
  }
  return e;
}
function _t(t, e) {
  const i = (Math.round(e) % A + A) % A, s = Math.floor(i / 60), r = i % 60;
  if (t.toLowerCase().startsWith("fr")) return r ? `${s} h ${String(r).padStart(2, "0")}` : `${s} h`;
  const o = new Date(Date.UTC(2e3, 0, 1, s, r)), n = { timeZone: "UTC", hour: "numeric" };
  return r && (n.minute = "2-digit"), new Intl.DateTimeFormat(t, n).format(o).replace(/\s?(AM|PM)/, (l, a) => ` ${a.toLowerCase()}`);
}
function Qi(t, e, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(t), o = pt(r, e) === pt(s, e), n = _t(i, ht(r, e));
  if (o) return n;
  if (Ue(pt(s, e), 1) === pt(r, e)) return `${new Intl.RelativeTimeFormat(i, { numeric: "auto" }).format(1, "day")} ${n}`;
  const p = r.getTime() - s.getTime() > 6 * 864e5 ? { timeZone: e, weekday: "short", day: "numeric", month: "short" } : { timeZone: e, weekday: "short" };
  return `${new Intl.DateTimeFormat(i, p).format(r)} ${n}`;
}
var Nr = Object.defineProperty, Tr = Object.getOwnPropertyDescriptor, gt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Tr(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Nr(e, i, r), r;
};
function Tt(t) {
  return !t || !("sun" in t) ? null : t.sun === "sunrise" || t.sun === "dawn" ? "up" : "down";
}
function he(t, e, i) {
  if (!e || !("sun" in e)) return "";
  const s = e.offset ?? 0, r = F(t)[`sun_${e.sun}`] ?? e.sun, o = s ? ` ${s > 0 ? "+" : "-"} ${Math.abs(s)} min` : "";
  return `${r}${o} · ${_t(t, i)}`;
}
const vi = (t, e) => `${d(t, "now")} · ${_t(t, e)}`;
let st = class extends D {
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
    if ((i - e) / A * this._width < r) return null;
    const o = Math.max(t.end - t.start, 1);
    return { left: (e - t.start) / o * 100, width: (i - e) / o * 100 };
  }
  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  _sunIcons() {
    const t = [];
    for (const e of this.spans)
      e.startSun && t.push({ m: e.start, dir: e.startSun, spec: e.startSpec, label: e.marker ? e.label : void 0 }), e.endSun && e.end < A && t.push({ m: e.end, dir: e.endSun, spec: e.endSpec });
    return t.map((e) => c`<wp-tip class="sunic" ?passive=${this.tall}
      text=${`${e.label ? `${e.label} · ` : ""}${he(this.lang, e.spec, e.m)}`}
      style="left:clamp(16px, ${e.m / A * 100}%, calc(100% - 16px))" data-sun=${e.dir}>
      <span class="sunc"><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
  }
  /** A one-shot is a thin line: a wider invisible target over it shows its label and time. */
  _markerTips() {
    return this.spans.filter((t) => t.marker && !t.startSun && !this.thin).map((t) => c`<wp-tip class="mktip" through
      ?passive=${this.tall} text=${`${t.label} · ${_t(this.lang, t.start)}`}
      style="left:clamp(12px, ${t.start / A * 100}%, calc(100% - 12px))"></wp-tip>`);
  }
  render() {
    const t = (i) => `${i / A * 100}%`, e = this.now;
    return c`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((i) => i.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((i) => c`<i class="tick" style="left:${t(i * 60)}"></i>`) : u}
          ${this.spans.map((i) => {
      const s = this._labelBox(i);
      return c`<div
              class="span ${i.ignored ? "ignored" : ""}"
              style="left:${t(i.start)};width:${t(Math.max(i.end - i.start, 5))};--c:${i.color}"
              title=${i.label}
            >${s ? c`<span class="name" style="left:${s.left}%;width:${s.width}%">${i.label}</span>` : u}</div>`;
    })}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${e !== null ? c`<div class="nowline" style="left:${t(e)}">
          <wp-tip class="nowic" text=${vi(this.lang, e)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>` : u}
      </div>
      ${this.showHours ? c`<div class="hours">${[0, 6, 12, 18, 24].map((i) => c`<span style="left:${t(i * 60)}">${i} h</span>`)}</div>` : u}
    `;
  }
};
st.styles = R`
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
gt([
  v({ attribute: !1 })
], st.prototype, "spans", 2);
gt([
  v({ type: Number })
], st.prototype, "now", 2);
gt([
  v({ type: Boolean })
], st.prototype, "thin", 2);
gt([
  v({ type: Boolean, attribute: "show-hours" })
], st.prototype, "showHours", 2);
gt([
  v({ type: Boolean })
], st.prototype, "notches", 2);
gt([
  v({ type: Boolean })
], st.prototype, "tall", 2);
gt([
  v()
], st.prototype, "lang", 2);
gt([
  $()
], st.prototype, "_width", 2);
st = gt([
  B("wp-day-bar")
], st);
var jr = Object.defineProperty, Lr = Object.getOwnPropertyDescriptor, fe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Lr(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && jr(e, i, r), r;
};
let jt = class extends D {
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
jt.styles = R`
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
fe([
  v()
], jt.prototype, "heading", 2);
fe([
  v({ type: Boolean, reflect: !0 })
], jt.prototype, "open", 2);
fe([
  v({ type: Boolean })
], jt.prototype, "wide", 2);
fe([
  $()
], jt.prototype, "_expanded", 2);
jt = fe([
  B("wp-dialog")
], jt);
let Ee, bt;
const Wt = /* @__PURE__ */ new Set();
let Ft, ee = 1e3, Me = 0;
function Bs(t) {
  if (bt || !Wt.size) return;
  const e = Me, i = t.connection.subscribeMessage((s) => {
    e === Me && (ee = 1e3, Ee = s, Wt.forEach((r) => r(s)));
  }, { type: "weekly_planner/subscribe" });
  bt = i, i.catch(() => {
    bt !== i || e !== Me || (bt = void 0, Wt.size && (Ft = setTimeout(() => {
      Ft = void 0, Bs(t);
    }, ee), ee = Math.min(ee * 2, 3e4)));
  });
}
function qs(t, e) {
  return Wt.add(e), Ee && e(Ee), Ft || Bs(t), () => {
    Wt.delete(e), !Wt.size && (Me++, Ft && clearTimeout(Ft), Ft = void 0, ee = 1e3, bt == null || bt.then((i) => i()).catch(() => {
    }), bt = void 0, Ee = void 0);
  };
}
const re = (t) => t.split(".")[0];
function V(t, e) {
  var s;
  const i = ((s = e.status[t.id]) == null ? void 0 : s.active_profile) ?? t.active_profile;
  return t.profiles.find((r) => r.id === i) ?? t.profiles[0];
}
function et(t, e) {
  var i;
  return ((i = t.states[e]) == null ? void 0 : i.attributes.friendly_name) ?? e;
}
function ts(t, e) {
  var r, o;
  if (e.program) return t.programs.filter((n) => n.id === e.program);
  const i = (r = e.filter) == null ? void 0 : r.types, s = (o = e.filter) == null ? void 0 : o.area;
  return t.programs.filter((n) => !(i != null && i.length) || n.entities.some((l) => i.includes(re(l.entity_id)))).filter((n) => !s || n.area === s).filter((n) => {
    var l;
    return ((l = e.filter) == null ? void 0 : l.programs) === void 0 || e.filter.programs.includes(n.id);
  }).sort((n, l) => n.priority - l.priority || n.name.localeCompare(l.name));
}
function it() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function ai(t, e) {
  return new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e);
}
async function Us() {
  var t, e, i;
  if (customElements.get("ha-selector")) return !0;
  try {
    const s = await ((t = window.loadCardHelpers) == null ? void 0 : t.call(window)), r = await (s == null ? void 0 : s.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((i = (e = r == null ? void 0 : r.constructor) == null ? void 0 : e.getConfigElement) == null ? void 0 : i.call(e)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((o) => setTimeout(o, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const Rr = (t) => t.split(".")[0], Br = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let li;
const Ze = /* @__PURE__ */ new Set();
async function Yt(t, e) {
  const i = [...new Set(e)].filter((s) => !Ze.has(s));
  if (!i.length || !t.loadBackendTranslation) return !1;
  i.forEach((s) => Ze.add(s));
  try {
    const s = await Promise.all(i.map((r) => t.loadBackendTranslation("services", r)));
    return li = s[s.length - 1] ?? li, !0;
  } catch {
    return i.forEach((s) => Ze.delete(s)), !1;
  }
}
function $i(t, e) {
  for (const i of [t.localize, li]) {
    const s = i == null ? void 0 : i(e);
    if (s) return s;
  }
  return "";
}
const xi = (t, e) => {
  var r, o;
  const [i, s] = e.split(".");
  return (o = (r = t.services) == null ? void 0 : r[i]) == null ? void 0 : o[s];
};
function Vt(t, e) {
  var r;
  const [i, s] = e.split(".");
  return $i(t, `component.${i}.services.${s}.name`) || ((r = xi(t, e)) == null ? void 0 : r.name) || e;
}
function ci(t, e) {
  var r;
  const [i, s] = e.split(".");
  return $i(t, `component.${i}.services.${s}.description`) || ((r = xi(t, e)) == null ? void 0 : r.description) || "";
}
function qr(t, e, i) {
  const s = Array.isArray(t) ? t : t ? [t] : [], r = Number((e == null ? void 0 : e.attributes.supported_features) ?? 0);
  return s.some((o) => {
    var l;
    return (o.domain === void 0 ? [] : Array.isArray(o.domain) ? o.domain : [o.domain]).includes(i) ? (l = o.supported_features) != null && l.length ? o.supported_features.some((a) => Array.isArray(a) ? a.every((p) => (r & p) === p) : (r & a) === a) : !0 : !1;
  });
}
function Fe(t, e, i) {
  const s = Rr(e), r = t.states[e], o = [];
  for (const [n, l] of Object.entries(t.services ?? {}))
    if (n !== "homeassistant")
      for (const [a, p] of Object.entries(l)) {
        if (!p.target) continue;
        const h = p.target.entity, f = !h || Array.isArray(h) && !h.length;
        if (!qr(h, r, s) && !(n === s && f) || Object.values(p.fields ?? {}).some((g) => g.required && (!g.selector || "text" in g.selector || "object" in g.selector))) continue;
        const m = `${n}.${a}`;
        i !== void 0 && !i.includes(m) || o.push({ id: m, domain: n, service: a, label: Vt(t, m) });
      }
  return o.sort((n, l) => n.label.localeCompare(l.label));
}
function Fs(t, e) {
  return [...new Set(Fe(t, e).map((i) => i.domain))];
}
function Ur(t, e) {
  var r;
  const i = t.filter;
  if (!i || !e) return !0;
  const s = Number(e.attributes.supported_features ?? 0);
  if ((r = i.supported_features) != null && r.length && !i.supported_features.some((o) => (s & o) === o)) return !1;
  for (const [o, n] of Object.entries(i.attribute ?? {})) {
    const l = e.attributes[o];
    if (!(Array.isArray(l) ? l : [l]).some((p) => n.includes(p))) return !1;
  }
  return !0;
}
function wi(t, e, i) {
  var p, h;
  const [s, r] = e.split("."), o = i ? t.states[i] : void 0, n = ((p = t.services) == null ? void 0 : p[s]) ?? {}, l = [], a = (f) => {
    var _;
    for (const [m, g] of Object.entries(f ?? {})) {
      if (g.fields) {
        a(g.fields);
        continue;
      }
      g.advanced || Br.has(m) || (_ = g.selector) != null && _.target || !Ur(g, o) || !g.required && r !== `set_${m}` && `set_${m}` in n || l.push({
        key: m,
        selector: g.selector ?? { text: {} },
        // The mode of a "set mode" service is always needed, whatever the description says.
        required: !!g.required || s === "climate" && r === `set_${m}` && m in ki,
        default: g.default,
        label: $i(t, `component.${s}.services.${r}.fields.${m}.name`) || g.name || m
      });
    }
  };
  return a((h = xi(t, e)) == null ? void 0 : h.fields), l.length && !l.some((f) => f.required) && (l[0] = { ...l[0], required: !0 }), [...l.filter((f) => f.required), ...l.filter((f) => !f.required)];
}
function Fr(t, e, i) {
  var o;
  const s = ((o = t.states[i]) == null ? void 0 : o.attributes) ?? {}, r = {};
  for (const n of wi(t, e, i)) {
    if (!n.required) continue;
    const l = n.selector.number;
    n.default !== void 0 ? r[n.key] = n.default : n.key === "temperature" ? r[n.key] = typeof s.temperature == "number" ? s.temperature : 19 : l && (r[n.key] = n.key === "position" ? 50 : l.min ?? 0);
  }
  return r;
}
function Ws(t, e, i, s, r) {
  return wi(t, e, s).filter((o) => r != null && r[o.key] ? !r[o.key].entity_id : o.required && ((i == null ? void 0 : i[o.key]) === void 0 || i[o.key] === "" || i[o.key] === null)).map((o) => o.label);
}
const ki = {
  hvac_mode: "hvac_modes",
  preset_mode: "preset_modes",
  fan_mode: "fan_modes",
  swing_mode: "swing_modes",
  swing_horizontal_mode: "swing_horizontal_modes"
};
function Wr(t, e, i) {
  const s = i.selector, r = s.state;
  if (!r && !s.select) return;
  const o = (r == null ? void 0 : r.attribute) ?? ki[i.key], n = t.states[e], l = o ? n == null ? void 0 : n.attributes[o] : void 0;
  if (!Array.isArray(l) || !l.length) return;
  const a = t, p = o.replace(/_list$/, "").replace(/s$/, "");
  return l.map((h) => {
    var m, g;
    const f = String(h);
    let _ = "";
    try {
      _ = i.key === "hvac_mode" ? ((m = a.formatEntityState) == null ? void 0 : m.call(a, n, f)) ?? "" : ((g = a.formatEntityAttributeValue) == null ? void 0 : g.call(a, n, p, f)) ?? "";
    } catch {
      _ = "";
    }
    return { value: f, label: _ || f };
  });
}
const oe = [
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
function Hr(t) {
  const e = new Set(t.map((i) => i.color.toLowerCase()));
  return oe.find((i) => !e.has(i)) ?? oe[t.length % oe.length];
}
const q = (t, e) => e ? t.labels.find((i) => i.id === e) : void 0;
function Kr(t, e) {
  return Object.values(t.states).filter((i) => i.entity_id.startsWith("scene.") && Array.isArray(i.attributes.entity_id) && i.attributes.entity_id.includes(e)).sort((i, s) => String(i.attributes.friendly_name ?? i.entity_id).localeCompare(String(s.attributes.friendly_name ?? s.entity_id)));
}
const Le = (t, e) => {
  var s;
  const i = t == null ? void 0 : t.entities.find((r) => r.entity_id === e);
  return i != null && i.restrict_services || (s = i == null ? void 0 : i.allowed_services) != null && s.length ? i.allowed_services ?? [] : void 0;
};
function Hs(t, e, i, s) {
  var o;
  if (i.kind === "scene") {
    const n = (o = t.states[i.scene]) == null ? void 0 : o.attributes.entity_id;
    return Array.isArray(n) ? n.includes(e) : !0;
  }
  if (s !== void 0 && !s.includes(i.service)) return !1;
  const r = i.target_entity_id ?? e;
  return r ? i.service.split(".")[0] === r.split(".")[0] ? !0 : Fe(t, r).some((n) => n.id === i.service) : !1;
}
function Si(t, e, i, s) {
  return e.labels.filter((r) => i.some((o) => Hs(t, o, r.action, Le(s, o))));
}
function vt(t, e, i) {
  var r, o;
  return i ? ((o = (r = t.entities.find((n) => n.entity_id === e)) == null ? void 0 : r.label_overrides) == null ? void 0 : o[i.id]) ?? i.action : void 0;
}
const Vr = (t, e, i) => {
  var s, r;
  return !!((r = (s = t.entities.find((o) => o.entity_id === e)) == null ? void 0 : s.label_overrides) != null && r[i]);
}, Ht = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function es(t) {
  var i, s, r;
  if (!t || t.kind !== "service" || t.target_entity_id) return null;
  const e = t.data ?? {};
  return Ht((i = t.data_sources) != null && i.temperature ? null : e.temperature) ?? Ht((s = t.data_sources) != null && s.position ? null : e.position) ?? Ht((r = t.data_sources) != null && r.brightness_pct ? null : e.brightness_pct);
}
function pe(t, e, i) {
  var r, o;
  if (!i) return "";
  if (i.kind === "scene") return String(((r = t.states[i.scene]) == null ? void 0 : r.attributes.friendly_name) ?? i.scene);
  if (i.target_entity_id) return `${Vt(t, i.service)} · ${((o = t.states[i.target_entity_id]) == null ? void 0 : o.attributes.friendly_name) ?? i.target_entity_id}`;
  if (Object.keys(i.data_sources ?? {}).length) return Ks(t, i);
  const s = i.data ?? {};
  return Ht(s.temperature) !== null ? `${ai(e, Number(s.temperature))} °C` : Ht(s.position) !== null ? `${s.position} %` : Ht(s.brightness_pct) !== null ? `${s.brightness_pct} %` : Vt(t, i.service);
}
function Ks(t, e) {
  return Object.values(e.data_sources ?? {}).map((i) => {
    const s = t.states[i.entity_id], r = String((s == null ? void 0 : s.attributes.friendly_name) ?? i.entity_id), o = i.attribute ? s == null ? void 0 : s.attributes[i.attribute] : s == null ? void 0 : s.state, n = s && !["unknown", "unavailable"].includes(s.state) && o !== void 0 && o !== null;
    return `${r}${i.attribute ? ` · ${i.attribute}` : ""}${n && ["string", "number", "boolean"].includes(typeof o) ? ` (${o})` : ""}`;
  }).join(" · ");
}
function Jr(t, e, i, s) {
  var a, p;
  if (!i) return "";
  if (i.kind === "scene") return pe(t, e, i);
  const r = [], o = i.target_entity_id ?? s, n = o ? t.states[o] : void 0, l = t.formatEntityState;
  for (const [h, f] of Object.entries(i.data ?? {}))
    if (!((a = i.data_sources) != null && a[h])) {
      if (typeof f == "number")
        r.push(h === "temperature" ? `${ai(e, f)} °C` : h === "position" || h === "brightness_pct" ? `${f} %` : ai(e, f));
      else if (typeof f == "string" && f) {
        let _ = f;
        try {
          h === "hvac_mode" && n && l && (_ = l(n, f) || f);
        } catch {
          _ = f;
        }
        r.push(_);
      }
    }
  return Object.keys(i.data_sources ?? {}).length && r.push(Ks(t, i)), [Vt(t, i.service), ...i.target_entity_id ? [String(((p = t.states[i.target_entity_id]) == null ? void 0 : p.attributes.friendly_name) ?? i.target_entity_id)] : [], ...r].join(" · ");
}
function Oe(t, e) {
  return t.programs.filter((i) => i.entities.some((s) => s.default_label === e || e in (s.label_overrides ?? {})) || i.profiles.some((s) => s.days.some((r) => r.some((o) => o.label === e)))).map((i) => i.name);
}
function Ai(t) {
  for (const e of t.querySelectorAll("select[data-value]")) {
    const i = e.dataset.value ?? "";
    e.value !== i && (e.value = i);
  }
}
var Gr = Object.defineProperty, Yr = Object.getOwnPropertyDescriptor, Z = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yr(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Gr(e, i, r), r;
};
const Pt = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? (t == null ? void 0 : t.language) ?? "en";
}, ot = R`
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
function Vs(t, e, i) {
  t.dispatchEvent(new CustomEvent(e, { detail: i, bubbles: !0, composed: !0 }));
}
let rt = class extends D {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.disabled = !1, this.required = !1, this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var t;
    return Object.keys(((t = this.hass) == null ? void 0 : t.states) ?? {}).filter((e) => !this.domains.length || this.domains.includes(re(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
  }
  _emit(t) {
    Vs(this, "wp-change", t);
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
        ${this.label ? c`<label>${this.label}</label>` : u}
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
          ${t.map((e) => c`<option value=${e}>${et(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
  }
};
rt.styles = [ot, R`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
Z([
  v({ attribute: !1 })
], rt.prototype, "hass", 2);
Z([
  v()
], rt.prototype, "value", 2);
Z([
  v()
], rt.prototype, "label", 2);
Z([
  v({ type: Boolean })
], rt.prototype, "disabled", 2);
Z([
  v({ type: Boolean })
], rt.prototype, "required", 2);
Z([
  v({ attribute: !1 })
], rt.prototype, "domains", 2);
Z([
  v({ attribute: !1 })
], rt.prototype, "exclude", 2);
Z([
  v({ attribute: !1 })
], rt.prototype, "filter", 2);
rt = Z([
  B("wp-entity-picker")
], rt);
let ue = class extends D {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return Pt(this.hass);
  }
  _tr(t) {
    return d(this._lang, t);
  }
  _set(t) {
    Vs(this, "wp-change", t);
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
ue.styles = ot;
Z([
  v({ attribute: !1 })
], ue.prototype, "hass", 2);
Z([
  v({ attribute: !1 })
], ue.prototype, "conditions", 2);
ue = Z([
  B("wp-conditions-editor")
], ue);
var Xr = Object.defineProperty, Zr = Object.getOwnPropertyDescriptor, Rt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Zr(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Xr(e, i, r), r;
};
let ft = class extends D {
  constructor() {
    super(...arguments), this.entityId = "", this.action = null, this.disabled = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return Pt(this.hass);
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
    Ai(this.renderRoot), !(!this.hass || !this._targetEntity || this._loadedFor === this._targetEntity) && (this._loadedFor = this._targetEntity, Yt(this.hass, Fs(this.hass, this._targetEntity)).then((t) => t && this.requestUpdate()), this._selector || Us().then((t) => this._selector = t));
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
    var a, p;
    const i = ((a = this.action) == null ? void 0 : a.kind) === "service" ? (p = this.action.data_sources) == null ? void 0 : p[t.key] : void 0, s = i ? this.hass.states[i.entity_id] : void 0, r = i != null && i.attribute ? s == null ? void 0 : s.attributes[i.attribute] : s == null ? void 0 : s.state, n = s && !["unknown", "unavailable"].includes(s.state) && r !== void 0 && r !== null ? typeof r == "object" ? JSON.stringify(r) : String(r) : d(this._lang, "value_unavailable"), l = [.../* @__PURE__ */ new Set([...Object.keys((s == null ? void 0 : s.attributes) ?? {}), ...i != null && i.attribute ? [i.attribute] : []])].sort();
    return c`<div class="source-field">
      <div class="field"><label for=${`source-${t.key}`}>${t.label}</label>
        <select id=${`source-${t.key}`} data-value=${i ? "entity" : "fixed"} ?disabled=${this.disabled}
          @change=${(h) => this._setSource(t.key, h.target.value === "entity" ? { entity_id: "", type: this._sourceType(t) } : void 0)}>
          <option value="fixed">${d(this._lang, "value_fixed")}</option>
          <option value="entity">${d(this._lang, "value_entity")}</option>
        </select></div>
      ${i ? c`<wp-entity-picker .hass=${this.hass} .value=${i.entity_id} .label=${d(this._lang, "value_source")}
          .disabled=${this.disabled}
          @wp-change=${(h) => {
      h.stopPropagation(), this._setSource(t.key, { ...i, entity_id: h.detail });
    }}></wp-entity-picker>
        <div class="field"><label for=${`attribute-${t.key}`}>${d(this._lang, "value_read")}</label>
          <select id=${`attribute-${t.key}`} data-value=${i.attribute ?? ""} ?disabled=${this.disabled}
            @change=${(h) => {
      const f = h.target.value;
      this._setSource(t.key, { entity_id: i.entity_id, type: i.type, ...f ? { attribute: f } : {} });
    }}>
            <option value="">${d(this._lang, "value_state")}</option>
            ${l.map((h) => c`<option value=${h}>${h}</option>`)}
          </select></div>
        ${i.entity_id ? c`<p class="hint" role="status">${d(this._lang, "value_current", { value: n })}</p>` : u}
        <p class="hint">${d(this._lang, "value_at_execution")}</p>` : this._selector ? c`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(t)} .context=${this._context(t)} .value=${e[t.key]} .label=${t.label}
            .required=${t.required} ?disabled=${this.disabled}
            @value-changed=${(h) => {
      h.stopPropagation(), this._setData(t.key, h.detail.value);
    }}></ha-selector>` : c`<div class="field"><label>${t.label}</label><input type="text" .value=${String(e[t.key] ?? "")} ?disabled=${this.disabled}
            @change=${(h) => this._setData(t.key, h.target.value)} /></div>`}
    </div>`;
  }
  /** Context of Home Assistant's service control: the entity the field is about, and the attribute to list. */
  _context(t) {
    const e = t.selector.state;
    return {
      filter_entity: [this._targetEntity],
      filter_target: { entity_id: [this._targetEntity] },
      entity_id: this._targetEntity,
      filter_attribute: (e == null ? void 0 : e.attribute) ?? ki[t.key]
    };
  }
  /** Selector of a field; a list of the device (modes, presets…) is built from its attribute when it has one. */
  _selectorOf(t) {
    const e = Wr(this.hass, this._targetEntity, t);
    return e ? { select: { options: e, mode: "dropdown" } } : t.selector;
  }
  render() {
    var h, f, _, m, g, w, S;
    if (!this.hass) return u;
    const t = this._lang, e = ((h = this.action) == null ? void 0 : h.kind) === "service" && this.action.target_entity_id !== void 0, i = this._targetEntity, s = ((f = this.action) == null ? void 0 : f.kind) === "service" ? this.action.service : "", r = i ? Fe(this.hass, i, this.allowed !== void 0 && s ? [...this.allowed, s] : this.allowed) : [];
    if (s && !r.some((k) => k.id === s)) {
      const [k, y] = s.split(".");
      r.push({ id: s, domain: k, service: y, label: Vt(this.hass, s) });
    }
    const o = ((_ = this.action) == null ? void 0 : _.kind) === "service" ? this.action.data ?? {} : {}, n = s ? wi(this.hass, s, i) : [], l = e ? [] : Kr(this.hass, this.entityId), a = ((m = this.action) == null ? void 0 : m.kind) === "scene" ? this.action.scene : s, p = s ? ci(this.hass, s) || d(t, "action_no_description") : ((g = this.action) == null ? void 0 : g.kind) === "scene" ? d(t, "action_scene_description") : "";
    return c`
      <div class="field"><label for="action-target-mode">${d(t, "action_target")}</label>
        <select id="action-target-mode" data-value=${e ? "other" : "device"} ?disabled=${this.disabled}
          @change=${(k) => this._setTarget(k.target.value === "other" ? "" : void 0)}>
          <option value="device">${d(t, "action_target_device")}</option>
          <option value="other">${d(t, "action_target_other")}</option>
        </select></div>
      ${e ? c`<wp-entity-picker .hass=${this.hass} .value=${i} .disabled=${this.disabled} .label=${d(t, "action_target_entity")}
        @wp-change=${(k) => {
      k.stopPropagation(), this._setTarget(k.detail);
    }}></wp-entity-picker>
        <p class="hint">${d(t, "action_target_hint")}</p>` : u}
      ${((w = this.allowed) == null ? void 0 : w.length) === 0 ? c`<p class="hint" role="status">${d(t, "action_none_allowed")}</p>` : u}
      <label class="action-label" for="action">${d(t, "action")}</label>
      <select id="action" data-value=${a || ""} aria-describedby="action-description" ?disabled=${this.disabled || !i}
        @change=${(k) => {
      const y = k.target.value;
      y && (y.startsWith("scene.") ? this._emit({ kind: "scene", scene: y }) : this._emit({ kind: "service", service: y, ...e ? { target_entity_id: i } : {}, data: Fr(this.hass, y, i) }));
    }}>
        <option value="" disabled ?selected=${!a}>${d(t, "action_choose")}</option>
        ${r.map((k) => c`<option value=${k.id} ?selected=${k.id === s}
          title=${ci(this.hass, k.id) || d(t, "action_no_description")}>${k.label}</option>`)}
        ${((S = this.action) == null ? void 0 : S.kind) === "scene" && !l.some((k) => k.entity_id === a) ? c`<option value=${a} selected>${a}</option>` : u}
        ${l.map((k) => c`<option value=${k.entity_id} ?selected=${k.entity_id === a}
          title=${d(t, "action_scene_description")}>${String(k.attributes.friendly_name ?? k.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${p}</p>
      ${n.map((k) => this._field(k, o))}`;
  }
};
ft.styles = [ot, R`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 14px; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 14px;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
Rt([
  v({ attribute: !1 })
], ft.prototype, "hass", 2);
Rt([
  v({ attribute: "entity-id" })
], ft.prototype, "entityId", 2);
Rt([
  v({ attribute: !1 })
], ft.prototype, "action", 2);
Rt([
  v({ type: Boolean })
], ft.prototype, "disabled", 2);
Rt([
  v({ attribute: !1 })
], ft.prototype, "allowed", 2);
Rt([
  $()
], ft.prototype, "_selector", 2);
ft = Rt([
  B("wp-action-picker")
], ft);
var Qr = Object.defineProperty, to = Object.getOwnPropertyDescriptor, j = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? to(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Qr(e, i, r), r;
};
let N = class extends D {
  constructor() {
    super(...arguments), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this.embedded = !1, this._form = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._ov = {}, this._error = "", this._saving = !1, this._valueFor = null, this._loaded = "";
  }
  get _lang() {
    return Pt(this.hass);
  }
  _emit(t, e) {
    this.dispatchEvent(new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }));
  }
  updated() {
    var i;
    const t = (i = q(this.data, this.value)) == null ? void 0 : i.action, e = (t == null ? void 0 : t.kind) === "service" ? t.service.split(".")[0] : "";
    !this.hass || !e || this._loaded === e || (this._loaded = e, Yt(this.hass, [e]).then((s) => s && this.requestUpdate()));
  }
  /** Opens the form on the chosen label (a pencil), or on a new one. */
  _open(t) {
    const e = t ? q(this.data, this.value) : void 0;
    t && !e || (this._form = !0, this._editId = (e == null ? void 0 : e.id) ?? null, this._name = (e == null ? void 0 : e.name) ?? "", this._color = (e == null ? void 0 : e.color) ?? Hr(this.data.labels), this._action = e ? structuredClone(e.action) : null, this._ov = {}, this._valueFor = null, this._error = "", this._changed());
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
    return this._name.trim() ? !this._action || this._action.kind === "service" && (!this._action.service || this._action.target_entity_id === "") ? d(t, "lb_err_action") : this._action.kind === "service" && Ws(this.hass, this._action.service, this._action.data, this._action.target_entity_id ?? this.entityIds[0], this._action.data_sources).length ? d(t, "lb_err_fields") : "" : d(t, "lb_err_name");
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
        const r = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((n) => n.id === this.program.id);
        if (!r) return;
        const o = {
          ...r,
          entities: r.entities.map((n) => {
            const l = e.filter(([p]) => p === n.entity_id);
            if (!l.length) return n;
            const a = { ...n.label_overrides ?? {} };
            for (const [, p] of l)
              p ? a[t] = p : delete a[t];
            return { ...n, label_overrides: a };
          })
        };
        try {
          await this.hass.callWS({ type: "weekly_planner/program/save", program: o });
          return;
        } catch (n) {
          if ((n == null ? void 0 : n.code) !== "conflict") throw n;
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
      this._error = (i == null ? void 0 : i.code) === "unauthorized" ? d(this._lang, "err_unauthorized") : d(this._lang, "lb_err_save");
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
        @click=${() => this._valueFor = r ? null : t}>${d(i, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${et(this.hass, t)}` : ""}</button>
      ${r ? c`<div class="valbox">
        <wp-action-picker .hass=${this.hass} entity-id=${t} .allowed=${Le(this.program, t)}
          .action=${s ?? this._action} ?disabled=${this.disabled}
          @action-change=${(o) => {
      o.stopPropagation(), this._ov = { ...this._ov, [t]: o.detail }, this._error = "", this._changed();
    }}></wp-action-picker>
        ${s ? c`<button class="btn" ?disabled=${this.disabled}
          @click=${() => {
      this._ov = { ...this._ov, [t]: null }, this._changed();
    }}>
          <ha-icon icon="mdi:undo"></ha-icon>${d(i, "lb_common_value")}</button>` : u}
      </div>` : u}
    </div>`;
  }
  _renderForm() {
    const t = this._lang;
    return c`<div class="form">
      <div class="field"><label for="lb-name">${d(t, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e) => this._set({ name: e.target.value })} /></div>
      <div class="swatches" role="radiogroup" aria-label=${d(t, "lb_color")}>
        ${oe.map((e) => c`<button class="sw ${e === this._color ? "on" : ""}" role="radio" aria-checked=${e === this._color}
          aria-label=${e} style="background:${e}" @click=${() => this._set({ color: e })}></button>`)}
      </div>
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${Le(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled}
        @action-change=${(e) => {
      e.stopPropagation(), this._set({ action: e.detail });
    }}></wp-action-picker>
      ${this._editId ? this.entityIds.map((e) => this._valueEditor(e, this._editId)) : u}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : u}
      ${this.embedded ? u : c`<div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled} @click=${() => void this._save()}>${d(t, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${d(t, "cancel")}</button>
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
          ${Oe(this.data, t.id).some((i) => i !== this.program.name) ? c`<span class="shared">${d(e, "shared")}</span>` : u}
          <button class="pen ${this._form ? "on" : ""}" aria-label=${d(e, "rename_label")} title=${d(e, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => this._form && this._editId ? this._close() : this._open(!0)}><ha-icon icon="mdi:pencil"></ha-icon></button>
        </div>
        ${this._form ? u : c`
          <div class="sum"><span class="what">${Jr(this.hass, e, t.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((i) => {
      const s = Vr(this.program, i, t.id) ? vt(this.program, i, t) : void 0;
      return s ? c`<div class="sum"><span class="k">${d(e, "lb_value_here")} :</span>
              <span class="what">${pe(this.hass, e, s)}</span>
              ${this.entityIds.length > 1 ? c`<span class="who">${et(this.hass, i)}</span>` : u}</div>` : u;
    })}`}
        ${this._form && this._editId ? this._renderForm() : u}
      </div>`;
  }
  render() {
    if (!this.hass || !this.data) return u;
    const t = this._lang, e = Si(this.hass, this.data, this.entityIds, this.program), i = q(this.data, this.value), s = (r, o, n, l) => c`
      <button class="chip ${o ? "on" : ""}" role="radio" aria-checked=${o} ?disabled=${this.disabled} @click=${n}>
        ${l ? c`<i class="dot" style="background:${l}"></i>` : u}<span>${r}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${d(t, "action")}>
        ${this.allowNone ? s(d(t, "rest_none"), this.value === null, () => this._choose(null)) : u}
        ${e.map((r) => s(r.name, r.id === this.value, () => this._choose(r.id), r.color))}
        ${this.value && !i ? s("?", !0, () => {
    }) : u}
        ${this.compact ? u : c`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => this._form && !this._editId ? this._close() : this._open(!1)}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${d(t, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId ? this._renderForm() : u}
      ${i && !(this._form && !this._editId) ? this._renderDetails(i) : u}`;
  }
};
N.styles = [ot, R`
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
j([
  v({ attribute: !1 })
], N.prototype, "hass", 2);
j([
  v({ attribute: !1 })
], N.prototype, "data", 2);
j([
  v({ attribute: !1 })
], N.prototype, "program", 2);
j([
  v({ attribute: !1 })
], N.prototype, "entityIds", 2);
j([
  v({ attribute: !1 })
], N.prototype, "value", 2);
j([
  v({ type: Boolean, attribute: "allow-none" })
], N.prototype, "allowNone", 2);
j([
  v({ type: Boolean })
], N.prototype, "disabled", 2);
j([
  v({ type: Boolean })
], N.prototype, "compact", 2);
j([
  v({ type: Boolean })
], N.prototype, "embedded", 2);
j([
  $()
], N.prototype, "_form", 2);
j([
  $()
], N.prototype, "_editId", 2);
j([
  $()
], N.prototype, "_name", 2);
j([
  $()
], N.prototype, "_color", 2);
j([
  $()
], N.prototype, "_action", 2);
j([
  $()
], N.prototype, "_ov", 2);
j([
  $()
], N.prototype, "_error", 2);
j([
  $()
], N.prototype, "_saving", 2);
j([
  $()
], N.prototype, "_valueFor", 2);
N = j([
  B("wp-label-picker")
], N);
var eo = Object.defineProperty, io = Object.getOwnPropertyDescriptor, ge = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? io(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && eo(e, i, r), r;
};
let Lt = class extends D {
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
    const t = F(this.lang);
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
Lt.styles = R`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
ge([
  v()
], Lt.prototype, "message", 2);
ge([
  v({ attribute: "confirm-label" })
], Lt.prototype, "confirmLabel", 2);
ge([
  v({ attribute: "cancel-label" })
], Lt.prototype, "cancelLabel", 2);
ge([
  v()
], Lt.prototype, "lang", 2);
Lt = ge([
  B("wp-confirm")
], Lt);
function mt(t, e, i, s = "") {
  return new Promise((r) => {
    var l;
    const o = document.createElement("wp-confirm");
    o.message = e, o.confirmLabel = i, o.cancelLabel = s;
    const n = t.hass;
    o.lang = ((l = n == null ? void 0 : n.locale) == null ? void 0 : l.language) ?? (n == null ? void 0 : n.language) ?? (document.documentElement.lang || "en"), o.addEventListener("choice", (a) => {
      o.remove(), r(!!a.detail);
    }), (t.shadowRoot ?? t).appendChild(o);
  });
}
const Js = " ", Re = (t) => t.replace(/ /g, Js), Qe = (t, e) => JSON.stringify(t) === JSON.stringify(e), so = (t, e) => {
  const i = Math.abs(e), s = i < 60 ? `${i} min` : i % 60 ? `${Math.floor(i / 60)} h ${String(i % 60).padStart(2, "0")}` : `${i / 60} h`;
  return `${e > 0 ? "+" : "−"}${s}`;
};
function di(t, e, i) {
  if ("time" in e) {
    const [o, n] = e.time.split(":").map(Number);
    return Re(o * 60 + n >= A ? "24 h" : _t(t, o * 60 + n));
  }
  const s = d(t, e.sun === "sunrise" || e.sun === "sunset" ? `sun_${e.sun}_short` : `sun_${e.sun}`), r = e.offset ? ` ${so(t, e.offset)}` : "";
  return Re(`${s}${r}`);
}
function is(t, e) {
  if ("time" in t) {
    const [i, s] = t.time.split(":").map(Number), r = Math.max(0, Math.min(A, Math.round((i * 60 + s + e) / je) * je));
    return { time: r >= A ? "24:00" : `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}` };
  }
  return { ...t, offset: Math.max(-240, Math.min(240, (t.offset ?? 0) + e)) };
}
const Gs = [0, 1, 2, 3, 4], Ys = [5, 6], _e = [0, 1, 2, 3, 4, 5, 6];
function ro(t, e, i) {
  const s = [...i].sort((r, o) => r - o);
  return Qe(s, _e) ? d(t, "all_days_text") : Qe(s, Gs) ? `${e[0]}–${e[4]}` : Qe(s, Ys) ? d(t, "weekend") : s.map((r) => e[r]).join(Js);
}
function hi(t) {
  if (Array.isArray(t)) return `[${t.map(hi).join(",")}]`;
  if (t && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((i) => `${JSON.stringify(i)}:${hi(e[i])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function pi(t) {
  const { id: e, ...i } = t;
  return hi({ ...i, conditions: t.conditions ?? [], end: t.end ?? null, color: t.color ?? null });
}
function Pi(t, e, i) {
  const s = /* @__PURE__ */ new Map();
  return t.days.forEach((r, o) => {
    for (const n of r) {
      if (!e(n)) continue;
      const l = pi(n);
      let a = s.get(l);
      if (a && a.days.includes(o)) {
        a = void 0, s.set(`${l}#${n.id}`, { slot: n, days: [o], ids: { [o]: n.id } });
        continue;
      }
      a || (a = { slot: n, days: [], ids: {} }, s.set(l, a)), a.days.push(o), a.ids[o] = n.id;
    }
  }), [...s.values()].sort(
    (r, o) => i(r.slot.start) - i(o.slot.start) || r.days[0] - o.days[0]
  );
}
function oo(t, e, i, s) {
  const r = t.days.map((o) => o.filter((n) => !i(n)));
  for (const o of e)
    for (const n of o.days)
      r[n].push({ ...structuredClone(o.slot), id: o.ids[n] ?? it() });
  return { ...t, days: r.map((o) => o.sort((n, l) => s(n.start) - s(l.start))) };
}
const no = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, ao = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function ne(t, e) {
  var r;
  if ("time" in e) return xt(e.time);
  const i = (r = t.states["sun.sun"]) == null ? void 0 : r.attributes[no[e.sun]];
  let s = i ? ht(i, t.config.time_zone) : ao[e.sun];
  return s += e.offset ?? 0, e.earliest && (s = Math.max(s, xt(e.earliest))), e.latest && (s = Math.min(s, xt(e.latest))), Math.max(0, Math.min(A, s));
}
function lo(t) {
  const e = St(t.start);
  if (e === null || !t.end) return null;
  const i = St(t.end);
  return i === null ? null : i > e ? [e, i] : [e, A];
}
function Xs(t) {
  var r, o;
  const e = t.map((n) => ({ slot: n, iv: lo(n) })).filter((n) => n.iv !== null).sort((n, l) => n.iv[0] - l.iv[0]);
  let i = ((r = e[0]) == null ? void 0 : r.iv[1]) ?? 0, s = (o = e[0]) == null ? void 0 : o.slot;
  for (let n = 1; n < e.length; n++) {
    if (e[n].iv[0] < i) return [s, e[n].slot];
    e[n].iv[1] > i && (i = e[n].iv[1], s = e[n].slot);
  }
  return null;
}
const ss = (t) => t.ids[t.days[0]], Zs = (t, e) => e !== null && Object.values(t.ids).includes(e);
function co(t, e, i, s) {
  return Pi(t, e, i).find((r) => Zs(r, s)) ?? null;
}
function ho(t, e) {
  return t ? pi(t.slot) !== pi(e.slot) ? "changed" : JSON.stringify(t.days) === JSON.stringify(e.days) && JSON.stringify(t.ids) === JSON.stringify(e.ids) ? "same" : "days" : "gone";
}
function rs(t, e) {
  const { [e]: i, ...s } = t.ids;
  return {
    draft: { slot: structuredClone(t.slot), days: [e], ids: i ? { [e]: i } : {} },
    rest: { slot: structuredClone(t.slot), days: t.days.filter((r) => r !== e), ids: s }
  };
}
function po(t, e) {
  if (!t) return [];
  const i = t.days.filter((r) => !e.includes(r)), s = Object.fromEntries(i.filter((r) => t.ids[r]).map((r) => [r, t.ids[r]]));
  return i.length ? [{ ...t, days: i, ids: s }] : [];
}
function te(t, e, i, s) {
  var o;
  const r = Pi(t, e, i).filter((n) => !Zs(n, s.openId));
  return r.push(...po(s.rest, ((o = s.draft) == null ? void 0 : o.days) ?? [])), s.draft && r.push(s.draft), oo(t, r, e, i);
}
function uo(t) {
  const e = t.days.findIndex((i) => Xs(i));
  return e < 0 ? null : e;
}
function _o(t, e, i, s, r = _e) {
  const o = [], n = [];
  for (const l of r) {
    const a = { ...s, id: "__new__" };
    (Xs([...t.days[l].filter(e), a]) ? n : o).push(l);
  }
  return { free: o, busy: n };
}
const os = 5;
function mo(t, e) {
  let i = 480;
  t.length && (i = Math.max(...t.map((r) => e(r.end ?? r.start))), i = Math.ceil(i / os) * os);
  const s = Math.min(i, A - 60);
  return { start: de(s), end: de(Math.min(A, s + 60)) };
}
function ns(t, e, i = { start: "08:00", end: "09:00" }) {
  return { slot: { id: it(), start: { time: i.start }, end: { time: i.end }, conditions: [], label: t }, days: [...e], ids: {}, fresh: !0 };
}
const wt = 15, Qs = (t) => Math.round(t / wt) * wt, Ci = (t, e, i) => Math.max(e, Math.min(i, t));
function ut(t) {
  const e = Ci(Math.round(t), 0, A);
  return { time: `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}` };
}
function W(t, e) {
  const i = e(t.start);
  if (!t.end) return { start: i, end: null, wrap: !1 };
  const s = e(t.end);
  return s > i ? { start: i, end: s, wrap: !1 } : { start: i, end: A, wrap: !0 };
}
function as(t, e) {
  const i = t.map((o) => ({ slot: o, e: W(o, e.at) })).filter((o) => o.e.end !== null).sort((o, n) => o.e.start - n.e.start), s = [];
  let r = e.lead ?? 0;
  for (const { slot: o, e: n } of i)
    n.start > r && s.push({ kind: "gap", start: r, end: n.start }), s.push({ kind: "slot", id: o.id, slot: o, start: n.start, end: n.end, wrap: n.wrap }), r = Math.max(r, n.end);
  return r < A && s.push({ kind: "gap", start: r, end: A }), s;
}
function ui(t, e) {
  const i = [], s = /* @__PURE__ */ new Map();
  for (const r of t) {
    const o = W(r, e.at);
    if (o.end === null) {
      i.push({ m: o.start, refs: [{ id: r.id, edge: "start" }], oneShot: !0 });
      continue;
    }
    const n = [[o.start, { id: r.id, edge: "start" }]];
    o.wrap || n.push([o.end, { id: r.id, edge: "end" }]);
    for (const [l, a] of n) {
      let p = s.get(l);
      p || (p = { m: l, refs: [], oneShot: !1 }, s.set(l, p), i.push(p)), p.refs.push(a);
    }
  }
  return i.sort((r, o) => r.m - o.m);
}
const ls = (t, e) => t.id === e.id && t.edge === e.edge;
function tr(t, e, i) {
  const s = t.find((o) => o.id === e.id);
  if (!s) return null;
  const r = W(s, i.at);
  return e.edge === "start" ? r.start : r.end;
}
function $e(t, e, i, s) {
  const r = t.find((_) => _.id === e.id);
  if (!r) return null;
  const o = W(r, s.at);
  let n, l = 0, a = A;
  if (o.end === null) {
    if (e.edge !== "start") return null;
    n = [e], a = A - wt;
  } else {
    if (e.edge === "end" && o.wrap) return null;
    const _ = ui(t, s).find((g) => !g.oneShot && g.refs.some((w) => ls(w, e)));
    if (!_) return null;
    n = _.refs;
    const m = _.m;
    m >= (s.lead ?? 0) && (l = s.lead ?? 0);
    for (const g of t) {
      const w = W(g, s.at);
      if (w.end === null) continue;
      const S = [[w.start, { id: g.id, edge: "start" }], [w.end, w.wrap ? null : { id: g.id, edge: "end" }]];
      for (const [k, y] of S)
        y && n.some((P) => ls(P, y)) || (k < m ? l = Math.max(l, k) : k > m && (a = Math.min(a, k)));
    }
    for (const g of n) {
      const w = t.find((k) => k.id === g.id), S = W(w, s.at);
      g.edge === "end" ? l = Math.max(l, S.start + wt) : a = Math.min(a, S.end - wt);
    }
  }
  if (l > a) return { slots: t, m: tr(t, e, s) ?? 0 };
  const p = Ci(Qs(i), l, a), h = ut(p);
  return { slots: t.map((_) => {
    const m = n.find((g) => g.id === _.id);
    return m ? m.edge === "start" ? { ..._, start: h } : { ..._, end: h } : _;
  }), m: p };
}
function _i(t, e) {
  return e - t < 2 * wt ? null : Ci(Qs((t + e) / 2), t + wt, e - wt);
}
function cs(t, e, i) {
  const s = i.newId ?? We;
  if (e.kind === "gap") {
    const h = _i(e.start, e.end);
    if (h === null || !i.defaultLabel) return null;
    const f = { id: s(), start: ut(h), end: ut(e.end), conditions: [], label: i.defaultLabel };
    return { slots: me([...t, f], i), handle: { id: f.id, edge: "start" } };
  }
  const r = t.find((h) => h.id === e.id);
  if (!r || !r.end) return null;
  const o = W(r, i.at), n = _i(o.start, o.end);
  if (n === null) return null;
  const l = { ...structuredClone(r), id: s(), start: ut(n) }, a = { ...r, end: ut(n) }, p = t.flatMap((h) => h.id === r.id ? [a, l] : [h]);
  return { slots: me(p, i), handle: { id: l.id, edge: "start" } };
}
function fo(t, e, i, s) {
  if (e.kind === "slot") return t.map((o) => o.id === e.id ? { ...o, label: i } : o);
  const r = { id: (s.newId ?? We)(), start: ut(e.start), end: ut(e.end), conditions: [], label: i };
  return me([...t, r], s);
}
function go(t, e) {
  return t.filter((i) => i.id !== e);
}
const We = () => it();
function me(t, e) {
  return [...t].sort((i, s) => e.at(i.start) - e.at(s.start));
}
const yo = (t, e) => t.label === e.label && Be(t.conditions ?? []) === Be(e.conditions ?? []) && (t.color ?? null) === (e.color ?? null), Be = (t) => JSON.stringify(t);
function er(t, e, i = /* @__PURE__ */ new Set()) {
  const s = [];
  for (const r of me(t, e)) {
    const o = s[s.length - 1];
    if (o && o.end && r.end) {
      const n = W(o, e.at), l = W(r, e.at);
      if (!n.wrap && n.end === l.start && yo(o, r) && !i.has(o.id) && !i.has(r.id)) {
        s[s.length - 1] = { ...o, end: r.end };
        continue;
      }
    }
    s.push(r);
  }
  return s;
}
function bo(t, e, i, s) {
  const r = s.newId ?? We, o = [];
  for (const n of t) {
    const l = W(n, s.at);
    if (l.end === null || l.end <= e || l.start >= i) {
      o.push(n);
      continue;
    }
    const a = l.start < e, p = l.end > i;
    a && o.push({ ...n, end: ut(e) }), p && o.push({ ...structuredClone(n), id: a ? r() : n.id, start: ut(i) });
  }
  return o;
}
function vo(t, e, i, s) {
  var n;
  const r = (n = t[e.day]) == null ? void 0 : n.find((l) => l.id === e.id);
  if (!r) return [];
  const o = W(r, s.at);
  return o.end === null ? [] : i.filter((l) => l !== e.day && t[l].some((a) => {
    const p = W(a, s.at);
    return p.end !== null && p.start < o.end && p.end > o.start;
  }));
}
function ds(t, e, i, s, r = []) {
  var a;
  const o = (a = t[e.day]) == null ? void 0 : a.find((p) => p.id === e.id);
  if (!o) return t;
  const n = s.newId ?? We, l = W(o, s.at);
  return t.map((p, h) => {
    if (!i.includes(h) || h === e.day || r.includes(h)) return p;
    const f = { ...structuredClone(o), id: n() };
    return l.end === null ? p.some((m) => !m.end && Be(m.start) === Be(o.start) && m.label === o.label) ? p : me([...p, f], s) : er([...bo(p, l.start, l.end, s), f], s);
  });
}
var $o = Object.defineProperty, xo = Object.getOwnPropertyDescriptor, z = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? xo(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && $o(e, i, r), r;
};
const wo = 450, ko = 22, hs = 8, So = 700, ti = /* @__PURE__ */ new Map(), Ao = (t, e) => t && t.revision > e.revision ? t : e;
let M = class extends D {
  constructor() {
    super(...arguments), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.lang = "en", this.tz = "UTC", this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._hover = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (t) => "time" in t ? xt(t.time) : this._sun.get(JSON.stringify(t)) ?? ne(this.hass, t), this._outside = (t) => {
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
    return Ao(ti.get(this.program.id), this.program);
  }
  get _baseDay() {
    return V(this._live, this.data).days[this.weekday] ?? [];
  }
  get _day() {
    return this._draft ?? this._baseDay;
  }
  get _lead() {
    return Math.max(0, ...this.spans.filter((t) => t.spill).map((t) => t.end));
  }
  _ctx(t) {
    var r;
    const e = this.program.entities.find((o) => o.entity_id === this.entityId), i = (r = Si(this.hass, this.data, [this.entityId])[0]) == null ? void 0 : r.id, s = new Map(this._sun);
    return {
      at: (o) => "time" in o ? xt(o.time) : s.get(JSON.stringify(o)) ?? ne(this.hass, o),
      lead: this._lead,
      newId: t ?? it,
      defaultLabel: (e == null ? void 0 : e.default_label) ?? i
    };
  }
  willUpdate(t) {
    var e;
    if (t.has("program") || t.has("preview") || t.has("data")) {
      this._sun = /* @__PURE__ */ new Map();
      for (const i of this._baseDay) {
        const s = (e = this.preview) == null ? void 0 : e.find((r) => r.slot_id === i.id);
        s && ("sun" in i.start && this._sun.set(JSON.stringify(i.start), ht(s.start, this.tz)), i.end && "sun" in i.end && s.end && this._sun.set(JSON.stringify(i.end), ht(s.end, this.tz)));
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
    }, wo));
  }
  _zoneMove(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || Math.hypot(t.clientX - e.x, t.clientY - e.y) > hs && (window.clearTimeout(e.timer), this._press = void 0);
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
    return { m: (t - ((e == null ? void 0 : e.left) ?? 0)) / i * A, ppm: i / A };
  }
  _nearest(t, e) {
    let i;
    for (const s of ui(this._day, this._ctx())) {
      const r = Math.abs(s.m - t) * e;
      r <= ko && (!i || r < i.d) && (i = { b: s, d: r });
    }
    return i == null ? void 0 : i.b;
  }
  _segAt(t) {
    const e = as(this._day, this._ctx()).find((i) => t >= i.start && t < i.end);
    return e ? e.kind === "slot" ? { kind: "slot", id: e.id } : { kind: "gap", start: e.start, end: e.end } : null;
  }
  _ovDown(t) {
    var r, o;
    if (t.button !== 0) return;
    this._flushNudge();
    const { m: e, ppm: i } = this._minuteAt(t.clientX), s = this._nearest(e, i);
    if (s) {
      (o = (r = t.currentTarget).setPointerCapture) == null || o.call(r, t.pointerId), this._drag = {
        ref: s.refs[0],
        m0: s.m,
        x0: t.clientX,
        id: t.pointerId,
        moved: !1,
        last: s.m,
        profileId: V(this._live, this.data).id,
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
      const r = (i = this._live.profiles.find((n) => n.id === e.profileId)) == null ? void 0 : i.days[e.weekday];
      if (!r) {
        this._ovCancel();
        return;
      }
      const o = $e(r, e.ref, e.m0 + s / this._minuteAt(0).ppm, e.ctx);
      o && (e.last = o.m, this._draft = o.slots, this._bubble = { m: o.m });
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
        this._commit((o) => {
          const n = $e(o[e.weekday], s, r, e.ctx);
          return n ? this._with(o, e.weekday, n.slots) : null;
        }, [e.weekday], !1, e.profileId);
      } else {
        const s = this._baseDay.find((r) => r.id === e.ref.id);
        s && !s.end && this._select({ kind: "slot", id: s.id });
      }
      return;
    }
    const i = this._tap;
    i && i.id === t.pointerId && (this._tap = void 0, Math.hypot(t.clientX - i.x, t.clientY - i.y) <= hs && i.target && this._select(i.target));
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
    var l, a, p;
    if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
    t.preventDefault();
    const i = V(this._live, this.data).id;
    this._nudge && this._nudge.profileId !== i && (this._flushNudge(), this._draft = null);
    const s = ((l = this._nudge) == null ? void 0 : l.ctx) ?? this._ctx(), r = this._draft ?? this._baseDay, o = ((a = this._nudge) == null ? void 0 : a.m) ?? tr(r, e, s);
    if (o === null) return;
    const n = $e(r, e, o + (t.key === "ArrowRight" ? 15 : -15), s);
    n && (this._draft = n.slots, this._bubble = { m: n.m }, window.clearTimeout((p = this._nudge) == null ? void 0 : p.timer), this._nudge = { ref: e, m: n.m, timer: window.setTimeout(() => this._flushNudge(), So), profileId: i, weekday: this.weekday, ctx: s });
  }
  _flushNudge() {
    const t = this._nudge;
    t && (window.clearTimeout(t.timer), this._nudge = void 0, this._bubble = null, this._commit((e) => {
      const i = $e(e[t.weekday], t.ref, t.m, t.ctx);
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
  async _commit(t, e, i = !1, s = V(this._live, this.data).id) {
    var o;
    let r = this._live;
    for (let n = 0; n < 2; n++) {
      const l = r.profiles.find((m) => m.id === s);
      if (!l)
        return this._dropDraft(), !1;
      const a = l.days, p = t(a);
      if (!p)
        return this._dropDraft(), !1;
      const h = p.map((m, g) => e.includes(g) && m !== a[g] ? er(m, this._ctx(), this._keep) : m), f = h.map((m, g) => g).filter((m) => JSON.stringify(h[m]) !== JSON.stringify(a[m]));
      if (!f.length)
        return this._dropDraft(), !0;
      const _ = { ...r, profiles: r.profiles.map((m) => m.id === l.id ? { ...m, days: h } : m) };
      this._draft = h[this.weekday] ?? null;
      try {
        const m = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(_) });
        if (m != null && m.program ? (ti.set(m.program.id, m.program), this._awaitRev = m.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= m.program.revision && this._dropDraft()) : this._dropDraft(), !i) {
          const g = f.map((w) => [w, a[w]]);
          this._emit("edited", {
            undo: () => this._commit((w) => f.some((S) => JSON.stringify(w[S]) !== JSON.stringify(h[S])) ? null : w.map((S, k) => {
              var y;
              return ((y = g.find((P) => P[0] === k)) == null ? void 0 : y[1]) ?? S;
            }), f, !0, s)
          });
        }
        return !0;
      } catch (m) {
        const g = m;
        if ((g == null ? void 0 : g.code) === "conflict" && n === 0)
          try {
            const S = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((k) => k.id === r.id);
            if (S) {
              ti.set(S.id, S), r = S;
              continue;
            }
          } catch {
          }
        return this._dropDraft(), this._fail((o = g == null ? void 0 : g.message) != null && o.includes("overlapping_slots") ? d(this.lang, "w_err_overlap") : (g == null ? void 0 : g.code) === "unauthorized" ? d(this.lang, "err_unauthorized") : d(this.lang, "ss_err_save")), !1;
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
      const s = e.find((o) => o.id === t.id);
      if (!s) return null;
      const r = W(s, this._at);
      return { target: t, slot: s, start: r.start, end: r.end };
    }
    const i = as(e, this._ctx()).find((s) => s.kind === "gap" && s.start === t.start);
    return i ? { target: { kind: "gap", start: i.start, end: i.end }, start: i.start, end: i.end } : null;
  }
  _pickLabel(t) {
    const e = this._sel;
    if (!e || t === null) return;
    const i = it(), s = e.target;
    this._commit((r) => this._with(r, this.weekday, fo(r[this.weekday], s, t, this._ctx(() => i))), [this.weekday]), s.kind === "gap" && (this._selected = { kind: "slot", id: i });
  }
  async _nothing() {
    const t = this._sel;
    if (!(t != null && t.slot)) return;
    const e = t.slot.id;
    await mt(this, d(this.lang, "w_confirm_slot"), d(this.lang, "yes"), d(this.lang, "no")) && (this._selected = null, this._commit((i) => this._with(i, this.weekday, go(i[this.weekday], e)), [this.weekday]));
  }
  _cut() {
    const t = this._sel;
    if (!t) return;
    const e = t.target, i = it(), s = this._ctx(() => i), r = cs(this._day, e, s);
    r && (this._keep.add(i), e.kind === "slot" && this._keep.add(e.id), this._hsel = r.handle, this._commit((o) => {
      const n = cs(o[this.weekday], e, this._ctx(() => i));
      return n ? this._with(o, this.weekday, n.slots) : null;
    }, [this.weekday]).then(() => {
      this.updateComplete.then(() => {
        var o;
        return (o = this.renderRoot.querySelector(`[data-h="${i}:start"]`)) == null ? void 0 : o.focus();
      });
    }), e.kind === "gap" && (this._selected = { kind: "slot", id: i }));
  }
  _toggleDay(t) {
    this._copyDays = this._copyDays.includes(t) ? this._copyDays.filter((e) => e !== t) : [...this._copyDays, t];
  }
  _copyGo() {
    const t = this._sel;
    if (!(t != null && t.slot) || !this._copyDays.length) return;
    const e = t.slot.id, i = [...this._copyDays].sort((o, n) => o - n), s = V(this._live, this.data).days, r = vo(s, { day: this.weekday, id: e }, i, this._ctx());
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
      const o = ds(r, { day: this.weekday, id: t }, e, this._ctx(), i);
      return o === r ? null : o;
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
      const s = q(this.data, i.label);
      if (!s || !vt(this.program, this.entityId, s)) continue;
      const r = W(i, this._at);
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
    return t >= A ? "24 h" : _t(this.lang, t);
  }
  /** Text of a handle on a sun boundary (the icon under it does not catch the pointer while editing). */
  _sunTitle(t, e) {
    var r;
    const i = (r = this._draft) == null ? void 0 : r.find((o) => o.id === t.id), s = t.edge === "start" ? i == null ? void 0 : i.start : i == null ? void 0 : i.end;
    return he(this.lang, s, e);
  }
  _overlay_() {
    const t = this._day, e = this._ctx(), i = (o) => `${o / A * 100}%`, s = this._sel, r = ui(t, e);
    return c`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${s && s.end !== null ? c`<div class="selbox ${s.slot ? "" : "gap"}"
        style="left:${i(s.start)};width:${i(s.end - s.start)}"></div>` : u}
      ${s != null && s.slot && s.end === null ? c`<div class="selpoint" style="left:${i(s.start)}"></div>` : u}
      ${Er(r, (o) => o.refs.map((n) => `${n.id}:${n.edge}`).join("+"), (o) => {
      const n = o.refs[0], l = this._hsel && o.refs.some((a) => {
        var p, h;
        return a.id === ((p = this._hsel) == null ? void 0 : p.id) && a.edge === ((h = this._hsel) == null ? void 0 : h.edge);
      });
      return c`<button class="hd ${o.oneShot ? "dot" : ""} ${l ? "on" : ""}" style="left:clamp(0px, ${i(o.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${o.m}
          aria-valuetext=${this._clock(o.m)} aria-label=${d(this.lang, "handle", { time: this._clock(o.m) })}
          data-h=${o.refs.map((a) => `${a.id}:${a.edge}`).join(" ")} title=${this._sunTitle(n, o.m)}
          @keydown=${(a) => this._key(a, n)} @focus=${() => this._hsel = n}
          ><i></i></button>`;
    })}
      ${this._bubble ? c`<div class="bubble" style="left:clamp(28px, ${i(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : u}
    </div>`;
  }
  _strip() {
    var o;
    const t = this._sel;
    if (!t) return u;
    const e = this.lang, i = this._ctx(), s = t.end !== null && (t.slot ? !!t.slot.end : !!i.defaultLabel) && _i(t.start, t.end) !== null, r = F(e).days_short;
    return c`<div class="strip" role="group">
      <wp-label-picker compact .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
        .value=${((o = t.slot) == null ? void 0 : o.label) ?? null} @label-change=${(n) => {
      n.stopPropagation(), this._pickLabel(n.detail);
    }}></wp-label-picker>
      <div class="acts">
        ${t.slot ? c`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${d(e, "rest_none_short")}</button>` : u}
        <button class="act" ?disabled=${!s} aria-label=${d(e, "cut")} title=${d(e, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${t.slot ? c`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => {
      this._copyOpen = !this._copyOpen, this._copyDays = [];
    }}><ha-icon icon="mdi:content-copy"></ha-icon>${d(e, "copy_to")}</button>` : u}
      </div>
      ${this._copyOpen && t.slot ? c`<div class="copy">
        ${r.map((n, l) => l === this.weekday ? u : c`<button class="dchip ${this._copyDays.includes(l) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(l)} @click=${() => this._toggleDay(l)}>${n}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${d(e, "copy_go")} title=${d(e, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${d(e, "copy_go")}</button>
      </div>` : u}
    </div>`;
  }
  _conflictDialog() {
    const t = this._conflict;
    if (!t) return u;
    const e = this.lang, i = F(e).days, s = (a, p) => {
      this._conflict = { ...t, skip: p ? [...t.skip.filter((h) => h !== a), a] : t.skip.filter((h) => h !== a) };
    }, r = t.to.every((a) => t.skip.includes(a)), o = V(this._live, this.data).days, n = this._ctx(), l = (a, p) => c`<div class="cfbar"><span>${a}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(p)} .now=${null}></wp-day-bar></div>`;
    return c`<wp-dialog open heading=${d(e, "conflict_title")} @closed=${(a) => {
      a.stopPropagation(), this._conflict = null;
    }}>
      <div class="cf">
        ${t.days.map((a) => c`<div class="cfrow"><strong>${i[a]}</strong>
          ${l(d(e, "cf_before"), o[a] ?? [])}
          ${l(d(e, "cf_after"), t.skip.includes(a) ? o[a] ?? [] : ds(o, { day: this.weekday, id: t.id }, [a], n)[a] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${i[a]}>
            <button role="radio" aria-checked=${!t.skip.includes(a)} class=${t.skip.includes(a) ? "" : "on"} @click=${() => s(a, !1)}>${d(e, "replace")}</button>
            <button role="radio" aria-checked=${t.skip.includes(a)} class=${t.skip.includes(a) ? "on" : ""} @click=${() => s(a, !0)}>${d(e, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${d(e, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${r} @click=${() => void this._doCopy(t.id, t.to, t.skip)}>${d(e, "copy_go")}</button>
    </wp-dialog>`;
  }
  render() {
    return !this.hass || !this.data || !this.program ? u : c`
      <div class="zone ${this.editing ? "editing" : ""}"
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(t) => {
      this._press && !this._press.mouse && t.preventDefault();
    }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${d(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : u}</wp-day-bar>
      </div>
      ${this.editing ? this._strip() : u}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : u}
      ${this._conflictDialog()}`;
  }
};
M.styles = [ot, R`
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
z([
  v({ attribute: !1 })
], M.prototype, "hass", 2);
z([
  v({ attribute: !1 })
], M.prototype, "data", 2);
z([
  v({ attribute: !1 })
], M.prototype, "program", 2);
z([
  v({ attribute: "entity-id" })
], M.prototype, "entityId", 2);
z([
  v({ type: Number })
], M.prototype, "weekday", 2);
z([
  v({ attribute: !1 })
], M.prototype, "spans", 2);
z([
  v({ attribute: !1 })
], M.prototype, "preview", 2);
z([
  v({ type: Number })
], M.prototype, "now", 2);
z([
  v({ type: Boolean })
], M.prototype, "editing", 2);
z([
  v({ type: Boolean })
], M.prototype, "editable", 2);
z([
  v({ type: Boolean })
], M.prototype, "hours", 2);
z([
  v()
], M.prototype, "lang", 2);
z([
  v()
], M.prototype, "tz", 2);
z([
  $()
], M.prototype, "_draft", 2);
z([
  $()
], M.prototype, "_selected", 2);
z([
  $()
], M.prototype, "_hsel", 2);
z([
  $()
], M.prototype, "_bubble", 2);
z([
  $()
], M.prototype, "_copyOpen", 2);
z([
  $()
], M.prototype, "_copyDays", 2);
z([
  $()
], M.prototype, "_conflict", 2);
z([
  $()
], M.prototype, "_error", 2);
z([
  $()
], M.prototype, "_hover", 2);
M = z([
  B("wp-bar-editor")
], M);
const Ie = 1440, ps = Ie / 2;
function Po(t, e = !1) {
  const i = e ? ps : Ie, s = [];
  for (const r of t) {
    if (r.ignored || !Number.isFinite(r.start) || !Number.isFinite(r.end)) continue;
    if (r.marker) {
      if (r.start < 0 || r.start >= Ie) continue;
      const a = e && r.start >= ps ? 1 : 0;
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
    const o = Math.max(0, r.start), n = Math.min(Ie, r.end);
    if (n <= o) continue;
    const l = e ? [0, 1] : [0];
    for (const a of l) {
      const p = a * i, h = Math.max(o, p), f = Math.min(n, p + i);
      f <= h || s.push({
        source: r,
        start: h,
        end: f,
        offset: (h - p) / i,
        fraction: (f - h) / i,
        ring: a
      });
    }
  }
  return s;
}
var Co = Object.defineProperty, Eo = Object.getOwnPropertyDescriptor, Xt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Eo(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Co(e, i, r), r;
};
const us = "var(--divider-color, rgba(127, 127, 127, 0.2))", Ot = (t, e) => {
  const i = t * Math.PI * 2 - Math.PI / 2;
  return { x: 160 + e * Math.cos(i), y: 160 + e * Math.sin(i) };
};
let At = class extends D {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.double = !1, this.lang = "en", this.rest = "";
  }
  _open() {
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: !0, composed: !0 }));
  }
  _icon(t, e, i, s) {
    const r = Ot(t, e);
    return c`<wp-tip text=${s} style=${`left:${r.x / 3.2}%;top:${r.y / 3.2}%`}>
      <span class="icon"><ha-icon icon=${i}></ha-icon></span></wp-tip>`;
  }
  render() {
    const t = Po(this.spans, this.double), e = [...new Set(t.map((a) => a.source))], i = this.double ? 720 : 1440, s = this.double ? 24 : 36, r = (a) => this.double && a === 0 ? 78 : 112, o = this.now !== null && Number.isFinite(this.now) && this.now >= 0 && this.now < 1440 ? this.now : null, n = this.double && o !== null && o >= 720 ? 1 : 0, l = o === null ? 0 : (o - n * i) / i;
    return c`<div class="dial"><button @click=${this._open} aria-label=${d(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        ${(this.double ? [0, 1] : [0]).map((a) => O`<circle class="track" cx="160" cy="160" r=${r(a)} fill="none" stroke=${us} stroke-width=${s} />`)}
        ${t.map((a) => {
      if (a.source.marker) {
        const p = Ot(a.offset, r(a.ring));
        return O`<circle cx=${p.x} cy=${p.y} r="7" fill=${a.source.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
      }
      return O`<circle cx="160" cy="160" r=${r(a.ring)} fill="none" stroke=${a.source.color} stroke-width=${s}
            pathLength="100" stroke-dasharray="${a.fraction * 100} ${100 - a.fraction * 100}" stroke-dashoffset=${-a.offset * 100} transform="rotate(-90 160 160)" />`;
    })}
        ${(this.double ? [0, 1] : [0]).map((a) => Array.from({ length: i / 60 }, (p, h) => {
      const f = h % (this.double ? 3 : 6) === 0, _ = Ot(h * 60 / i, r(a) + s / 2), m = Ot(h * 60 / i, r(a) + s / 2 - (f ? s : 6));
      return O`<line class="tick" x1=${_.x} y1=${_.y} x2=${m.x} y2=${m.y} stroke="var(--primary-text-color)" stroke-opacity=".35" stroke-width="1" />`;
    }))}
        ${(this.double ? [0, 1] : [0]).map((a) => (this.double ? a === 0 ? [12, 3, 6, 9] : [24, 15, 18, 21] : [0, 6, 12, 18]).map((p, h) => {
      const f = Ot(h / 4, this.double && a === 0 ? 53 : 145);
      return O`<text class="hour" x=${f.x} y=${f.y + 5} text-anchor="middle">${this.double ? p : String(p).padStart(2, "0")}</text>`;
    }))}
        ${o === null ? u : (() => {
      const a = Ot(l, r(n) - s / 2 - 4), p = Ot(l, r(n) + s / 2 + 4);
      return O`<line x1=${a.x} y1=${a.y} x2=${p.x} y2=${p.y} stroke="var(--primary-text-color)" stroke-width="3" />`;
    })()}
        <text x="160" y="156" text-anchor="middle">${o === null ? "24 h" : _t(this.lang, o)}</text>
        <text x="160" y="180" text-anchor="middle">${d(this.lang, "hours")}</text>
      </svg></button>
      ${t.flatMap((a) => {
      const p = [];
      return a.start === a.source.start && a.source.startSun && p.push(this._icon(
        a.offset,
        r(a.ring),
        a.source.startSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down",
        he(this.lang, a.source.startSpec, a.start)
      )), !a.source.marker && a.end === a.source.end && a.end < 1440 && a.source.endSun && p.push(this._icon(
        a.offset + a.fraction,
        r(a.ring),
        a.source.endSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down",
        he(this.lang, a.source.endSpec, a.end)
      )), p;
    })}
      ${o === null ? u : this._icon(l, r(n) - s / 2 - 12, "mdi:clock-outline", vi(this.lang, o))}
      </div>
      ${this.double ? c`<div class="rings">${d(this.lang, "radial_rings")}</div>` : u}
      <div class="legend">
        ${this.rest ? c`<span><i style=${`background:${us}`}></i>${d(this.lang, "rest_of_time")}: ${this.rest}</span>` : u}
        ${e.map((a) => c`<span><i style=${`background:${a.color}`}></i>${_t(this.lang, a.start)}${a.marker ? "" : `–${_t(this.lang, a.end)}`} · ${a.label}</span>`)}
      </div>`;
  }
};
At.styles = R`
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
Xt([
  v({ attribute: !1 })
], At.prototype, "spans", 2);
Xt([
  v({ type: Number })
], At.prototype, "now", 2);
Xt([
  v({ type: Boolean })
], At.prototype, "double", 2);
Xt([
  v()
], At.prototype, "lang", 2);
Xt([
  v()
], At.prototype, "rest", 2);
At = Xt([
  B("wp-radial-day")
], At);
var Mo = Object.defineProperty, Oo = Object.getOwnPropertyDescriptor, nt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Oo(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Mo(e, i, r), r;
};
let J = class extends D {
  constructor() {
    super(...arguments), this._open = null, this._name = "", this._color = "", this._action = null, this._entity = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return Pt(this.hass);
  }
  firstUpdated() {
    const t = this.data.labels.flatMap((e) => e.action.kind === "service" ? [e.action.service.split(".")[0]] : []);
    Yt(this.hass, t).then((e) => e && this.requestUpdate());
  }
  /** Devices that can serve to choose an action: those of the programs using the label, else all of them. */
  _entities(t) {
    const e = this.data.programs.filter((s) => Oe(this.data, t.id).includes(s.name)), i = (s) => [...new Set(s.flatMap((r) => r.entities.map((o) => o.entity_id)))];
    return e.length ? i(e) : i(this.data.programs);
  }
  _expand(t) {
    this._open = t.id, this._name = t.name, this._color = t.color, this._action = structuredClone(t.action), this._entity = this._entities(t)[0] ?? "", this._error = "";
  }
  async _save(t) {
    var i, s;
    const e = this._lang;
    if (!this._name.trim()) {
      this._error = d(e, "lb_err_name");
      return;
    }
    if (((i = this._action) == null ? void 0 : i.kind) === "service" && (!this._action.service || this._action.target_entity_id === "")) {
      this._error = d(e, "lb_err_action");
      return;
    }
    if (((s = this._action) == null ? void 0 : s.kind) === "service" && Ws(this.hass, this._action.service, this._action.data, this._action.target_entity_id, this._action.data_sources).length) {
      this._error = d(e, "lb_err_fields");
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/save", label: { id: t.id, name: this._name.trim(), color: this._color, action: this._action } }), this._open = null;
    } catch {
      this._error = d(e, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  async _delete(t) {
    const e = this._lang, i = Oe(this.data, t.id);
    if (i.length) {
      this._error = d(e, "lb_in_use", { programs: i.join(", ") });
      return;
    }
    if (await mt(this, d(e, "confirm_delete", { name: t.name }), d(e, "delete"), d(e, "cancel")))
      try {
        await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: t.id }), this._open = null;
      } catch (s) {
        const r = s;
        this._error = (r == null ? void 0 : r.code) === "in_use" ? d(e, "lb_in_use", { programs: r.message ?? "" }) : d(e, "lb_err_save");
      }
  }
  render() {
    if (!this.hass || !this.data) return u;
    const t = this._lang;
    return c`<wp-dialog open heading=${d(t, "labels")}>
      ${this.data.labels.length ? u : c`<p class="muted">${d(t, "lb_none")}</p>`}
      <div class="list">
        ${this.data.labels.map((e) => {
      const i = Oe(this.data, e.id).length;
      if (this._open !== e.id)
        return c`<button class="row" @click=${() => this._expand(e)}>
              <i class="dot" style="background:${e.color}"></i>
              <span class="txt"><b>${e.name}</b><span class="sub">${pe(this.hass, t, e.action)} · ${d(t, "lb_uses", { n: String(i) })}</span></span>
              <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
      const s = this._entities(e);
      return c`<div class="editor">
            <div class="field"><label for="lbe-name">${d(t, "lb_name")}</label>
              <input id="lbe-name" type="text" maxlength="30" .value=${this._name}
                @input=${(r) => {
        this._name = r.target.value, this._error = "";
      }} /></div>
            <div class="swatches" role="radiogroup" aria-label=${d(t, "lb_color")}>
              ${oe.map((r) => c`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
                aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
            </div>
            ${s.length > 1 ? c`<div class="field"><label for="lbe-ent">${d(t, "lb_device")}</label>
              <select id="lbe-ent" @change=${(r) => this._entity = r.target.value}>
                ${s.map((r) => c`<option value=${r} ?selected=${r === this._entity}>${et(this.hass, r)}</option>`)}
              </select></div>` : u}
            <wp-action-picker .hass=${this.hass} entity-id=${this._entity} .action=${this._action}
              @action-change=${(r) => {
        r.stopPropagation(), this._action = r.detail, this._error = "";
      }}></wp-action-picker>
            ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : u}
            <div class="btns">
              <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._save(e)}>${d(t, "save")}</button>
              <button class="btn" @click=${() => this._open = null}>${d(t, "cancel")}</button>
            </div>
            <button class="btn danger-line alone" @click=${() => void this._delete(e)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${d(t, "delete")}</button>
          </div>`;
    })}
      </div>
    </wp-dialog>`;
  }
};
J.styles = [ot, R`
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
function ir(t, e) {
  let i = 0, s = t.length;
  for (; i < s; ) {
    const r = i + Math.floor((s - i) / 2);
    t[r] <= e ? i = r + 1 : s = r;
  }
  return i;
}
function _s(t, e, i) {
  const s = ir(t, e + i);
  return s > 0 && t[s - 1] >= e - i;
}
const ze = /* @__PURE__ */ new Set();
let xe;
const ei = () => {
  document.hidden || ze.forEach((t) => t());
};
function Io(t) {
  return ze.add(t), xe === void 0 && (xe = setInterval(ei, 6e4), document.addEventListener("visibilitychange", ei)), () => {
    ze.delete(t), ze.size || (clearInterval(xe), xe = void 0, document.removeEventListener("visibilitychange", ei));
  };
}
const we = 0.5;
function zo(t, e, i) {
  const s = t.filter((h) => h.end !== null).map((h) => ({ ...h, end: Math.min(h.end, i), start: Math.max(0, h.start) })).filter((h) => h.end > h.start).sort((h, f) => h.start - f.start);
  s.forEach((h, f) => {
    const _ = s[f + 1];
    _ && h.end > _.start && (h.end = _.start);
  });
  const r = [], o = [], n = (h, f) => {
    e != null && e.active && f - h > we && r.push({ from: h, to: f, value: e.value, color: e.color });
  };
  let l = 0;
  s.forEach((h, f) => {
    n(l, h.start), r.push({ from: h.start, to: h.end, value: h.value, color: h.color });
    const _ = s[f + 1];
    h.end < i - we && (!_ || _.start - h.end > we) && (e != null && e.active) && o.push(h.end), l = h.end;
  }), n(l, i);
  const a = r.flatMap((h) => h.value === null ? [] : [{ from: h.from, to: h.to, value: h.value, color: h.color }]), p = [];
  for (let h = 1; h < a.length; h++) {
    const f = a[h - 1], _ = a[h];
    Math.abs(f.to - _.from) <= we && Math.abs(f.value - _.value) > 1e-9 && p.push({ m: _.from, from: f.value, to: _.value, color: _.color });
  }
  return { zones: r, steps: a, risers: p, returns: o };
}
const Do = /* @__PURE__ */ new Set(["off", "idle", "unavailable", "unknown", "docked", ""]), ms = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function No(t, e, i) {
  if (e === "unavailable" || e === "unknown") return !1;
  switch (t) {
    case "climate": {
      const s = i.hvac_action;
      if (typeof s == "string" && s !== "") return s !== "idle" && s !== "off";
      if (e === "off") return !1;
      const r = ms(i.temperature), o = ms(i.current_temperature);
      return r === null || o === null ? !1 : e === "cool" ? o - r > 0.3 : r - o > 0.3;
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
      return !Do.has(e);
  }
}
function To(t, e, i) {
  const s = [...t].sort((o, n) => o.m - n.m), r = [];
  return s.forEach((o, n) => {
    const l = Math.max(0, o.m), a = Math.min(i, n + 1 < s.length ? s[n + 1].m : i);
    if (a - l <= 0 || !No(e, o.state, o.attrs)) return;
    const p = r[r.length - 1];
    p && Math.abs(p[1] - l) < 0.01 ? p[1] = a : r.push([l, a]);
  }), r;
}
function jo(t, e, i) {
  const s = [];
  for (const [r, o] of t)
    for (const n of e) {
      const l = Math.max(r, n.from), a = Math.min(o, n.to, i);
      a - l > 0.01 && s.push({ from: l, to: a, color: n.color, value: n.value });
    }
  return s.sort((r, o) => r.from - o.from);
}
var Lo = Object.defineProperty, Ro = Object.getOwnPropertyDescriptor, at = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ro(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Lo(e, i, r), r;
};
function fs(t, e) {
  const i = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(t)), s = (o) => {
    var n;
    return Number(((n = i.find((l) => l.type === o)) == null ? void 0 : n.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(t / 1e3) * 1e3;
}
function gs(t, e) {
  const [i, s, r] = t.split("-").map(Number), o = Date.UTC(i, s - 1, r), n = o - fs(o, e);
  return o - fs(n, e);
}
function Ut(t, e) {
  return { startMs: gs(t, e), endMs: gs(Ue(t, 1), e) };
}
function Bo(t) {
  const [e, i, s] = t.split("-").map(Number);
  return Ce(new Date(Date.UTC(e, i - 1, s, 12)), "UTC");
}
const ys = 6e4, bs = /* @__PURE__ */ new WeakMap();
function ii(t, e, i, s) {
  let r = bs.get(t);
  r || (r = /* @__PURE__ */ new Map(), bs.set(t, r));
  const o = r, n = r.get(e);
  if (n && Date.now() - n.at < i)
    return r.delete(e), r.set(e, n), n.p;
  const l = s();
  for (r.set(e, { at: Date.now(), p: l }); r.size > 64; ) r.delete(r.keys().next().value);
  return l.catch(() => {
    var a;
    ((a = o.get(e)) == null ? void 0 : a.p) === l && o.delete(e);
  }), l;
}
function qo(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  let i = {};
  for (const s of t) {
    s.a && (i = s.a);
    const r = s.lu ?? s.lc ?? s.last_updated_ts, o = typeof r == "number" ? r * 1e3 : Date.parse(s.last_updated ?? "");
    Number.isNaN(o) || e.push({ t: o, s: String(s.s ?? s.state ?? ""), a: i });
  }
  return e;
}
function Uo(t) {
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
function vs(t, e) {
  const i = Math.floor((e - 8) / 6);
  return i < 4 ? "" : t.length <= i ? t : `${t.slice(0, i - 1)}…`;
}
const Fo = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", ke = (t) => t === "unavailable" || t === "unknown" || t === "", Se = (t) => typeof t == "number" && Number.isFinite(t) ? t : null, Wo = /* @__PURE__ */ new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);
let G = class extends D {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._model = null, this._token = 0, this._refresh = () => {
      if (document.hidden || !this.hass || !this.date) return;
      const { startMs: t, endMs: e } = Ut(this.date, this._tz);
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
    super.connectedCallback(), this._stopRefresh = Io(this._refresh), this._observer = new ResizeObserver((t) => {
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
    const { startMs: i, endMs: s } = Ut(this.date, this._tz), r = Date.now(), o = s > r ? 6e4 : 1 / 0, n = i < r, l = new Date(Math.min(s, r)).toISOString();
    try {
      const a = n ? ii(this.hass.connection ?? this.hass, `h|${t}`, o, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: l,
        entity_ids: [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), p = n ? ii(this.hass.connection ?? this.hass, `l|${t}`, o, () => this.hass.callWS({
        type: "logbook/get_events",
        start_time: new Date(i).toISOString(),
        end_time: l,
        entity_ids: [this.entityId]
      })).catch(() => []) : Promise.resolve([]), h = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), f = n ? ii(this.hass.connection ?? this.hass, `j|${this.entityId}|${h}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: h })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, m, g] = await Promise.all([a, p, f]);
      if (e !== this._token) return;
      this._loaded = {
        hist: qo(_[this.entityId]),
        log: Uo(m),
        sent: (g.segments ?? []).filter((w) => w.entity_id === this.entityId).map((w) => Date.parse(w.at))
      };
    } catch {
      e === this._token && (this._failed = !0, this._loaded = { hist: [], log: [], sent: [] });
    }
  }
  // ---- values ----
  /** What a history point says as numbers: the curves of the device. */
  _live(t) {
    const e = { measured: null, set: null, main: null };
    if (ke(t.s)) return e;
    switch (re(this.entityId)) {
      case "climate":
        return { measured: Se(t.a.current_temperature), set: t.s === "off" ? null : Se(t.a.temperature), main: null };
      case "cover":
        return { ...e, main: Se(t.a.current_position) ?? (t.s === "open" ? 100 : t.s === "closed" ? 0 : null) };
      case "light": {
        const i = t.s === "on" ? Se(t.a.brightness) : 0;
        return { ...e, main: i === null ? t.s === "on" ? 100 : 0 : i / 255 * 100 };
      }
      default: {
        const i = Number(t.s);
        return { ...e, main: Number.isFinite(i) ? i : null };
      }
    }
  }
  _numeric(t) {
    const e = re(this.entityId);
    if (["climate", "cover", "light"].includes(e)) return !0;
    const i = t.filter((s) => !ke(s.s));
    return i.length > 0 && i.every((s) => Number.isFinite(Number(s.s)));
  }
  // ---- build ----
  _build(t) {
    var Di, Ni;
    const e = this._tz, { startMs: i, endMs: s } = Ut(this.date, e), r = Math.round((s - i) / 6e4), o = Date.now(), n = Math.max(0, Math.min(r, (o - i) / 6e4)), l = (b) => (b - i) / 6e4, a = re(this.entityId), p = V(this.program, this.data), h = /* @__PURE__ */ new Map();
    for (const b of this.program.profiles) for (const x of b.days.flat()) h.set(x.id, x);
    const f = Bo(this.date), _ = [];
    for (const { slot: b, end: x } of Rs(p.days[(f + 6) % 7])) _.push({ s: 0, e: x, slot: b, spill: !0 });
    if (this.slots)
      for (const b of this.slots) {
        const x = h.get(b.slot_id);
        x && _.push({
          s: Math.max(0, l(Date.parse(b.start))),
          e: b.end ? Math.min(r, l(Date.parse(b.end))) : null,
          slot: x,
          ignored: !!b.ignored
        });
      }
    else
      for (const b of p.days[f]) {
        const x = St(b.start);
        if (x === null) continue;
        const C = St(b.end ?? null);
        _.push({ s: x, e: C === null ? null : C > x ? C : r, slot: b });
      }
    const m = this.program.entities.find((b) => b.entity_id === this.entityId), g = q(this.data, m == null ? void 0 : m.default_label), w = [], S = (b, x, C, tt = {}) => {
      if (!x || b < 0 || b > r) return;
      const dt = vt(this.program, this.entityId, x);
      dt && w.push({ m: b, label: x, value: es(dt), end: C, ...tt });
    };
    for (const b of _)
      b.spill || S(
        b.s,
        q(this.data, b.slot.label),
        !1,
        { sun: Tt(b.slot.start), spec: b.slot.start, ignored: b.ignored }
      );
    const k = (b) => es(vt(this.program, this.entityId, b)), y = zo(
      _.filter((b) => !b.ignored).flatMap((b) => {
        const x = q(this.data, b.slot.label);
        return x && vt(this.program, this.entityId, x) ? [{ start: b.s, end: b.e, color: x.color, value: k(x) }] : [];
      }),
      g ? { color: g.color, value: k(g), active: !!vt(this.program, this.entityId, g) } : null,
      r
    );
    for (const b of y.returns) S(b, g, !0);
    const P = jo(
      To(t.hist.map((b) => ({ m: l(b.t), state: b.s, attrs: b.a })), a, n),
      y.zones,
      n
    );
    w.sort((b, x) => b.m - x.m);
    const U = this._numeric(t.hist), Ct = [], Q = [];
    if (U) {
      const b = { measured: [], set: [], main: [] };
      for (const x of t.hist) {
        const C = Math.max(0, l(x.t)), tt = this._live(x);
        b.measured.push({ m: C, v: tt.measured }), b.set.push({ m: C, v: tt.set }), b.main.push({ m: C, v: tt.main });
      }
      for (const x of ["measured", "set", "main"])
        b[x].some((C) => C.v !== null) && Ct.push({ key: x, pts: b[x] });
    } else
      t.hist.forEach((b, x) => {
        var ji, Li;
        const C = Math.max(0, l(b.t)), tt = x + 1 < t.hist.length ? l(t.hist[x + 1].t) : n;
        if (tt <= C || ke(b.s)) return;
        const dt = Q[Q.length - 1];
        if (dt && dt.state === b.s && Math.abs(dt.e - C) < 0.5) {
          dt.e = tt;
          return;
        }
        const Ti = this.hass.states[this.entityId];
        Q.push({
          s: C,
          e: tt,
          state: b.s,
          on: Wo.has(b.s),
          text: Ti ? ((Li = (ji = this.hass).formatEntityState) == null ? void 0 : Li.call(ji, { ...Ti, state: b.s, attributes: b.a }, b.s)) ?? b.s : b.s
        });
      });
    const He = [...t.sent].sort((b, x) => b - x), ye = t.log.filter((b) => b.context && !b.user).map((b) => b.t).sort((b, x) => b - x), Ei = (b) => _s(He, b, ys), Bt = [];
    let Mi = (Di = t.hist[0]) == null ? void 0 : Di.s;
    for (const b of t.log) {
      if (ke(b.state)) continue;
      const x = b.state === Mi;
      Mi = b.state, (b.user || !b.context && !x && !Ei(b.t)) && Bt.push(l(b.t));
    }
    const sr = a === "climate" ? "set" : a === "light" ? "main" : null, Oi = Ct.find((b) => b.key === sr), Ii = [];
    if (Oi) {
      let b = null;
      for (const x of Oi.pts) {
        if (x.v !== null && b !== null && Math.abs(x.v - b) > 0.01) {
          const C = i + x.m * 6e4;
          Ii.push(x.m);
          const tt = _s(ye, C, ys);
          !Ei(C) && !tt && !Bt.some((dt) => Math.abs(dt - x.m) <= 1) && Bt.push(x.m);
        }
        x.v !== null && (b = x.v);
      }
    }
    Bt.sort((b, x) => b - x);
    const zi = [
      ...w.map((b) => b.m),
      ...t.sent.map(l),
      ...Ii,
      ...Q.map((b) => b.s),
      ...Bt
    ].sort((b, x) => b - x), Ke = [];
    for (const b of Bt) {
      if (b <= 1 || b > n) continue;
      const x = zi[ir(zi, b + 0.5)], C = Math.min(x ?? n, n);
      C > b ? Ke.push([b, C]) : Ke.push([b, Math.min(b + 5, r)]);
    }
    let be = 0, ve = 100;
    if (U && a !== "cover" && a !== "light") {
      const b = [...Ct.flatMap((x) => x.pts.map((C) => C.v)), ...w.map((x) => x.value), ...y.steps.map((x) => x.value)].filter((x) => x !== null);
      b.length && (be = Math.floor(b.reduce((x, C) => Math.min(x, C), 1 / 0) - 1), ve = Math.ceil(b.reduce((x, C) => Math.max(x, C), -1 / 0) + 1), ve - be < 2 && (ve = be + 2));
    }
    const rr = a === "climate" ? "°C" : a === "cover" || a === "light" ? "%" : ((Ni = this.hass.states[this.entityId]) == null ? void 0 : Ni.attributes.unit_of_measurement) ?? "";
    return {
      span: r,
      pastEnd: n,
      isToday: i <= o && o < s,
      kind: U ? "curve" : "band",
      lines: Ct,
      bands: Q,
      markers: w,
      planned: y,
      shade: P,
      manual: Ke,
      lo: be,
      hi: ve,
      unit: rr
    };
  }
  // ---- interaction ----
  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  get _historyPath() {
    const { startMs: t, endMs: e } = Ut(this.date, this._tz);
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
  _path(t, e, i, s, r, o) {
    let n = "", l = !1;
    return t.forEach((a, p) => {
      const h = p + 1 < t.length ? t[p + 1].m : e.pastEnd;
      let f = a.m, _ = h;
      if (o && (f = Math.max(f, o[0]), _ = Math.min(_, o[1]), _ < f)) {
        l = !1;
        return;
      }
      if (a.v === null) {
        l = !1;
        return;
      }
      const m = s(a.v);
      r ? n += l ? `V${m.toFixed(1)}H${i(_).toFixed(1)}` : `M${i(f).toFixed(1)},${m.toFixed(1)}H${i(_).toFixed(1)}` : (n += `${l ? "L" : "M"}${i(f).toFixed(1)},${m.toFixed(1)}`, (p + 1 === t.length || o && _ < h) && (n += `L${i(_).toFixed(1)},${m.toFixed(1)}`)), l = !0;
    }), n;
  }
  render() {
    if (!this.hass || !this.data) return u;
    const t = this._lang, e = this._model;
    let i;
    return e ? i = this._renderChart(e) : i = c`<div class="note">${d(t, "chart_loading")}</div>`, c`<div class="box">${i}</div>${e ? c`${this._legend(e)}
      <div class="availability" role="status">
        ${this._failed ? c`<p>${d(t, "chart_history_failed")}</p>` : !e.lines.length && !e.bands.length ? c`<p>${d(t, e.pastEnd === 0 ? "chart_future_history" : "chart_no_history")}</p>` : u}
        ${!e.markers.some((s) => !s.ignored) && !e.planned.zones.length ? c`<p>${d(t, "chart_no_planned")}</p>` : u}
      </div>` : u}`;
  }
  _legend(t) {
    const e = this._lang, i = (r, o, n) => c`<span class="key"><i class=${r} style=${""}></i>${o}</span>`, s = (r) => t.lines.some((o) => o.key === r);
    return c`<div class="legend">
      ${t.markers.length || t.planned.steps.length ? i("planned", d(e, "planned")) : u}
      ${s("measured") ? i("measured", d(e, "measured")) : u}
      ${s("set") ? i("set", d(e, "ch_set")) : u}
      ${t.shade.length ? i("active", d(e, "active_key")) : u}
      ${t.manual.length ? i("manual", d(e, "manual")) : u}
    </div>`;
  }
  _renderChart(t) {
    const e = this._lang, i = this._width, s = t.kind === "curve", r = s ? 150 : 84, o = { l: s ? 38 : 8, r: 10, t: 22, b: 22 }, n = (y) => o.l + y / t.span * (i - o.l - o.r), l = (y) => o.t + (1 - (y - t.lo) / (t.hi - t.lo)) * (r - o.t - o.b), { startMs: a } = Ut(this.date, this._tz), p = (y) => new Intl.DateTimeFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" }).format(new Date(a + y * 6e4)), h = [];
    for (let y = 0; y <= t.span; y += 180) h.push(y);
    const f = [];
    if (s) {
      const y = t.hi - t.lo, P = [1, 2, 5, 10, 20, 25, 50].find((U) => y / U <= 4) ?? 100;
      for (let U = Math.ceil(t.lo / P) * P; U <= t.hi + 1e-9; U += P) f.push(U);
    }
    const _ = o.t - 12, m = o.t, g = r - o.t - o.b, w = (y) => s && y.value !== null ? l(y.value) : _, S = (y) => {
      const P = w(y), U = y.label.color;
      return O`
        <line class="drop" x1=${n(y.m)} x2=${n(y.m)} y1=${P} y2=${r - o.b}></line>
        ${y.sun ? u : O`<circle class="mk ${y.end ? "end" : ""} ${y.ignored ? "faded" : ""}" cx=${n(y.m)} cy=${P} r="5" style="--c:${U}"></circle>`}
        ${y.value !== null ? O`<text class="val" x=${Math.min(Math.max(n(y.m), 14), i - 14)} y=${Math.max(P - 8, 9)} text-anchor="middle">${Number(y.value.toFixed(1))}</text>` : u}`;
    }, k = t.isToday ? O`<line class="now" x1=${n(t.pastEnd)} x2=${n(t.pastEnd)} y1=${o.t - 4} y2=${r - o.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${n(t.pastEnd) - 6}, ${o.t - 17}) scale(0.5)"><path d=${Fo}></path></g>` : u;
    return c`<div class="cwrap">
      <svg width=${i} height=${r} viewBox="0 0 ${i} ${r}" tabindex="0" role="button"
        aria-label=${d(e, "chart_open", { name: et(this.hass, this.entityId) })}
        @click=${() => this._open()}
        @keydown=${(y) => {
      (y.key === "Enter" || y.key === " ") && (y.preventDefault(), this._open());
    }}>
        ${f.map((y) => O`<line class="grid" x1=${o.l} x2=${i - o.r} y1=${l(y)} y2=${l(y)}></line>
          <text class="ylab" x=${o.l - 4} y=${l(y) + 3} text-anchor="end">${Number(y.toFixed(t.unit === "°C" ? 1 : 0))}</text>`)}
        ${h.map((y) => O`<text class="xlab" x=${n(y)} y=${r - 6} text-anchor=${y === 0 ? "start" : "middle"}>${Number(p(y))}h</text>`)}
        ${s ? u : O`
          <rect class="track" x=${o.l} y=${m} width=${i - o.l - o.r} height=${g} rx="6"></rect>
          ${t.bands.map((y) => {
      const P = n(y.e) - n(y.s);
      return O`<rect class="band ${y.on ? "on" : ""}" x=${n(y.s)} y=${m} width=${Math.max(1, P)} height=${g}></rect>
              ${vs(y.text, P) ? O`<text class="btxt" x=${n(y.s) + P / 2} y=${m + g / 2 + 4} text-anchor="middle">${vs(y.text, P)}</text>` : u}`;
    })}
          ${t.manual.map(([y, P]) => O`<rect class="red-band" x=${n(y)} y=${m} width=${Math.max(3, n(P) - n(y))} height=${g}></rect>`)}`}
        ${s ? t.lines.map((y) => O`<path class="line ${y.key}" d=${this._path(y.pts, t, n, l, y.key === "set")}></path>`) : u}
        ${s ? t.manual.map((y) => {
      const P = t.lines.find((Q) => Q.key === "set") ?? t.lines.find((Q) => Q.key === "main") ?? t.lines[0], U = P == null ? void 0 : P.pts.find((Q, He) => {
        var ye;
        return Q.v !== null && (((ye = P.pts[He + 1]) == null ? void 0 : ye.m) ?? 1 / 0) > y[0];
      }), Ct = (U == null ? void 0 : U.v) ?? null;
      return O`${P ? O`<path class="line red" d=${this._path(P.pts, t, n, l, P.key === "set", y)}></path>` : u}
            ${Ct !== null ? O`<circle class="reddot" cx=${n(y[0])} cy=${l(Ct)} r="3.5"></circle>` : u}`;
    }) : u}
        ${t.shade.map((y) => s ? y.value === null ? u : O`<rect class="shade" x=${n(y.from)} y=${l(y.value)} width=${Math.max(1, n(y.to) - n(y.from))} height=${Math.max(0, r - o.b - l(y.value))} style="--c:${y.color}"></rect>` : O`<rect class="shade" x=${n(y.from)} y=${m} width=${Math.max(1, n(y.to) - n(y.from))} height=${g} style="--c:${y.color}"></rect>`)}
        ${s ? t.planned.steps.map((y) => O`<path class="plan" d="M${n(y.from).toFixed(1)},${l(y.value).toFixed(1)}H${n(y.to).toFixed(1)}" style="--c:${y.color}"></path>`) : u}
        ${s ? t.planned.risers.map((y) => O`<line class="riser" x1=${n(y.m)} x2=${n(y.m)} y1=${l(y.from)} y2=${l(y.to)} style="--c:${y.color}"></line>`) : u}
        ${t.markers.map(S)}
        ${k}
        <rect class="hit" x="0" y="0" width=${i} height=${r}></rect>
      </svg>
      ${t.markers.filter((y) => y.sun).map((y) => c`<wp-tip class="suntip ${y.ignored ? "faded" : ""}"
        style="left:${n(y.m)}px;top:${w(y)}px;--c:${y.label.color}" text=${he(e, y.spec, y.m)}>
        <span class="sunc"><ha-icon icon=${y.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${t.isToday ? c`<wp-tip class="nowtip" style="left:${n(t.pastEnd)}px;top:${o.t - 11}px"
        text=${vi(e, ht(/* @__PURE__ */ new Date(), this._tz))}></wp-tip>` : u}
    </div>`;
  }
};
G.styles = R`
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
  v({ attribute: "entity-id" })
], G.prototype, "entityId", 2);
at([
  v()
], G.prototype, "date", 2);
at([
  v({ attribute: !1 })
], G.prototype, "slots", 2);
at([
  $()
], G.prototype, "_width", 2);
at([
  $()
], G.prototype, "_loaded", 2);
at([
  $()
], G.prototype, "_failed", 2);
G = at([
  B("wp-chart")
], G);
var Ho = Object.defineProperty, Ko = Object.getOwnPropertyDescriptor, lt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ko(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Ho(e, i, r), r;
};
const Vo = ["sunrise", "sunset"];
let Y = class extends D {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return Pt(this.hass);
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
    let i = xt(e);
    t === "end" && i === 0 && (i = A), this._update(t, { time: i >= A ? "24:00" : de(i) });
  }
  _timeBlock(t, e) {
    const i = this.group.slot[t];
    if (!i) return u;
    const s = this._lang, r = F(s), o = this.disabled;
    return c`
      <div class="time" role="group" aria-label=${e}>
        <button class="step" ?disabled=${o} aria-label=${d(s, "minus15")} title=${d(s, "minus15")} @click=${() => this._update(t, is(i, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in i ? c`<input type="time" step="60" .value=${i.time === "24:00" ? "00:00" : i.time} ?disabled=${o}
              aria-label=${e} @change=${(n) => this._fromInput(t, n.target.value)} />` : c`<output class="sun">${di(s, i)}</output>`}
        <button class="step" ?disabled=${o} aria-label=${d(s, "plus15")} title=${d(s, "plus15")} @click=${() => this._update(t, is(i, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${Vo.map((n) => {
      const l = "sun" in i && i.sun === n;
      return c`<button class="chip ${l ? "on" : ""}" aria-pressed=${l} ?disabled=${o}
            @click=${() => this._toggleSun(t, n)}><ha-icon icon=${n === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${r[`sun_${n}_short`] ?? n}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(t) {
    if (!t) return this._update("end", null);
    const e = this.group.slot.start, i = "time" in e ? xt(e.time) : 12 * 60;
    this._update("end", { time: de(Math.min(A - 5, i + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(t) {
    const e = this.group.days.includes(t) ? this.group.days.filter((i) => i !== t) : [...this.group.days, t];
    this._set({}, e.sort((i, s) => i - s));
  }
  render() {
    if (!this.group || !this.program) return u;
    const t = this._lang, e = F(t), i = this.group.slot, s = this.group.days, r = (n, l) => n.length === l.length && l.every((a) => n.includes(a)), o = (n, l) => c`<button class="chip small ${r(s, l) ? "on" : ""}"
      aria-pressed=${r(s, l)} ?disabled=${this.disabled} @click=${() => this._set({}, l === _e && r(s, l) ? [] : [...l])}>${r(s, l) ? c`<ha-icon icon="mdi:check"></ha-icon>` : u}${n}</button>`;
    return c`
      <section>
        <h4>${d(t, "start")}</h4>
        ${this._timeBlock("start", d(t, "start"))}
      </section>
      <section>
        <h4>${d(t, "end")}</h4>
        <div class="chips">
          <button class="chip ${i.end ? "" : "on"}" aria-pressed=${!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${d(t, "no_end")}</button>
          <button class="chip ${i.end ? "on" : ""}" aria-pressed=${!!i.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${d(t, "with_end")}</button>
        </div>
        ${i.end ? this._timeBlock("end", d(t, "end")) : u}
      </section>
      <section>
        <h4>${d(t, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && r(s, [this.dayOnly]) ? c`<div class="chips"><span class="only">${e.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${d(t, "apply_other_days")}</button></div>` : c`<div class="days" role="group" aria-label=${d(t, "days_label")}>
          ${e.days_short.map((n, l) => c`<button class="day ${s.includes(l) ? "on" : ""}" aria-pressed=${s.includes(l)}
            aria-label=${e.days[l]} ?disabled=${this.disabled} @click=${() => this._toggleDay(l)}>${s.includes(l) ? c`<ha-icon icon="mdi:check"></ha-icon>` : u}<span>${n}</span></button>`)}
        </div>
        <div class="chips">
          ${o(d(t, "all_days"), _e)}${o(d(t, "weekdays"), Gs)}${o(d(t, "weekend"), Ys)}
        </div>`}
      </section>
      <section>
        <h4>${d(t, "action")}</h4>
        <wp-label-picker embedded .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${i.label || null} ?disabled=${this.disabled}
          @label-change=${(n) => {
      n.stopPropagation(), this._set({ label: n.detail ?? "" });
    }}></wp-label-picker>
      </section>`;
  }
};
Y.styles = [ot, R`
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
lt([
  v({ attribute: !1 })
], Y.prototype, "hass", 2);
lt([
  v({ attribute: !1 })
], Y.prototype, "data", 2);
lt([
  v({ attribute: !1 })
], Y.prototype, "program", 2);
lt([
  v({ attribute: !1 })
], Y.prototype, "group", 2);
lt([
  v({ attribute: !1 })
], Y.prototype, "entityIds", 2);
lt([
  v({ type: Boolean })
], Y.prototype, "disabled", 2);
lt([
  v({ type: Number })
], Y.prototype, "dayOnly", 2);
lt([
  $()
], Y.prototype, "_more", 2);
lt([
  $()
], Y.prototype, "_last", 2);
Y = lt([
  B("wp-slot-form")
], Y);
var Jo = Object.defineProperty, Go = Object.getOwnPropertyDescriptor, I = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Go(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Jo(e, i, r), r;
};
const si = (t) => t.kind === "device" ? `d:${t.entityId}` : `p:${t.programId}`, ri = 7;
let E = class extends D {
  constructor() {
    super(...arguments), this.chart = !0, this.profileId = null, this._viewProfileId = null, this._editProfileId = null, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._labelDraft = null, this._pickerKey = 0, this._fresh = /* @__PURE__ */ new Set(), this._programId = "", this._error = "", this._saving = !1, this._toggling = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (t) => !0, this._minutes = (t) => ne(this.hass, t);
  }
  get _lang() {
    return Pt(this.hass);
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
    return e === null ? V(t, this.data) : t.profiles.find((i) => i.id === e);
  }
  get _modeOnly() {
    return this.profileId !== null || this._programs.some((t) => {
      var e, i;
      return ((e = this._modeProfile(t)) == null ? void 0 : e.id) !== ((i = V(t, this.data)) == null ? void 0 : i.id);
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
    return this.scope.kind === "device" ? et(this.hass, this.scope.entityId) : ((t = this._programs[0]) == null ? void 0 : t.name) ?? "";
  }
  _rows() {
    const t = [];
    for (const e of this._programs) {
      const i = this._open && e.id === this._programId ? this._editProfile(e) : this._modeProfile(e);
      if (i)
        for (const s of Pi(i, this._include, this._minutes))
          this._focus !== null && !s.days.includes(this._focus) || t.push({ program: e, group: s, key: `${e.id}|${s.ids[s.days[0]]}` });
    }
    return t;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: t, offset: e } = this.day;
    e >= -14 && e <= ri && (this._offset = e), this._focus = t, !this._rows().length && this._canEdit && this._add([t]);
  }
  /** Translated service names of the actions of the labels. */
  _loadNames() {
    const t = /* @__PURE__ */ new Set();
    for (const e of this.data.labels) e.action.kind === "service" && t.add(e.action.service.split(".")[0]);
    Yt(this.hass, [...t]).then((e) => e && this.requestUpdate());
  }
  willUpdate(t) {
    var i, s;
    (!this._chartEntity || t.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const e = this._programs[0];
    if (this.chart && e && this.hass && !this._modeOnly) {
      const r = `${e.id}|${e.revision}|${(i = this._modeProfile(e)) == null ? void 0 : i.id}|${this._date}`;
      r !== this._loaded && (this._loaded = r, this._loadPreview(e.id, this._date, r, (s = this._modeProfile(e)) == null ? void 0 : s.id));
    }
  }
  get _today() {
    return pt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Ue(this._today, this._offset);
  }
  async _loadPreview(t, e, i, s) {
    const r = ++this._token;
    try {
      const o = await this.hass.callWS({ type: "weekly_planner/preview", program_id: t, date: e, profile_id: s });
      r === this._token && i === this._loaded && (this._slots = o.slots);
    } catch {
      r === this._token && (this._slots = null);
    }
  }
  _go(t) {
    const e = this._offset + t;
    e < -14 || e > ri || (this._slots = null, this._offset = e);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(t, e, i, s = {}) {
    var r;
    this._editProfileId = ((r = this._modeProfile(e)) == null ? void 0 : r.id) ?? null, this._open = t, this._programId = e.id, this._group = i ? structuredClone(i) : null, this._restLabel = s.restLabel ?? null, this._rest = s.rest ?? null, this._dayOnly = s.dayOnly ?? null, this._openId = s.openId ?? null, this._base = null, this._origin = s.origin ? structuredClone(s.origin) : null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = structuredClone(e), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var o;
      return (o = this.renderRoot.querySelector(".editor")) == null ? void 0 : o.scrollIntoView({ block: "start" });
    }));
  }
  /** Opens a slot row: the whole group, or only the focused day of it. */
  _openRow(t, e, i) {
    const s = ss(i) ?? null;
    if (this._focus !== null && i.days.includes(this._focus)) {
      const { draft: r, rest: o } = rs(i, this._focus);
      this._expand(t, e, r, { rest: o, dayOnly: this._focus, openId: s, origin: i });
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
  _add(t = this._focus === null ? _e : [this._focus]) {
    const e = this._programs[0], i = this._entities[0];
    if (!e || !i) return;
    const s = Si(this.hass, this.data, this._entities)[0], r = t.length === 1 ? t[0] : null, o = this._modeProfile(e);
    if (!o) return;
    const n = r === null ? void 0 : mo(o.days[r], this._minutes);
    this._expand("new", e, ns((s == null ? void 0 : s.id) ?? "", t, n), { dayOnly: r }), this._dropBusy = r === null;
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
    const { start: s, end: r } = e.slot, o = ne(this.hass, s), n = r ? Math.max(15, ne(this.hass, r) - o) : 60, l = (m) => ({ time: de(Math.min(A, m)) }), a = { openId: this._openId, rest: this._rest, draft: structuredClone(e) }, p = this._dayOnly, h = ns(e.slot.label, e.days);
    h.slot = {
      ...structuredClone(e.slot),
      id: h.slot.id,
      start: "time" in s ? l(o + n) : { ...s, offset: (s.offset ?? 0) + n },
      end: r ? "time" in r ? l(o + 2 * n) : { ...r, offset: (r.offset ?? 0) + n } : null
    };
    const f = this._origin, _ = this._editProfileId;
    this._expand("new", t, h, { dayOnly: p }), this._editProfileId = _, this._base = a, this._origin = f;
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
      return s != null && s.program && (this._saved[t.id] = s.program, this.dispatchEvent(new CustomEvent("schedule-program-saved", { detail: s.program, bubbles: !0, composed: !0 }))), "ok";
    } catch (s) {
      const r = s;
      return (r == null ? void 0 : r.code) === "conflict" ? "conflict" : ((r == null ? void 0 : r.code) === "unauthorized" ? this._error = d(this._lang, "err_unauthorized") : (e = r == null ? void 0 : r.message) != null && e.includes("unknown_label") ? this._error = d(this._lang, "err_label") : (i = r == null ? void 0 : r.message) != null && i.includes("overlapping_slots") ? this._error = d(this._lang, "w_err_overlap") : this._error = d(this._lang, "ss_err_save"), "error");
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
      const o = await this._saveProgram(r.program);
      if (o === "ok") return !0;
      if (o === "error") return !1;
      try {
        i = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((l) => l.id === t), i && (this._saved[t] = i);
      } catch {
        break;
      }
    }
    return this._error = d(this._lang, "ss_err_save"), !1;
  }
  /** The entities of the current program with the label values set on this screen. */
  _withOverrides(t, e = t.entities) {
    return e.map((i) => {
      const s = this._overrides.filter((o) => o.entityId === i.entity_id);
      if (!s.length) return i;
      const r = { ...i.label_overrides ?? {} };
      for (const o of s)
        o.action ? r[o.labelId] = o.action : delete r[o.labelId];
      return { ...i, label_overrides: r };
    });
  }
  _problem(t) {
    const e = this._lang, i = this._group;
    return i ? i.days.length ? i.slot.end && JSON.stringify(i.slot.start) === JSON.stringify(i.slot.end) ? d(e, "w_err_same") : !q(this.data, i.slot.label) && !this._fresh.has(i.slot.label) ? d(e, "err_action") : "" : d(e, "err_days") : "";
  }
  /**
   * The group being edited against the current profile: unchanged, merged when only its other days moved,
   * or changed meanwhile (then the editor shows the new version, or closes if it is gone).
   */
  _checkOrigin(t, e) {
    const i = this._origin;
    if (!i || !this._openId) return "ok";
    const s = co(t, this._include, this._minutes, this._openId), r = ho(s, i);
    if (r === "same") return "ok";
    if (r === "days" && s && this._dayOnly !== null && s.days.includes(this._dayOnly))
      return this._rest = rs(s, this._dayOnly).rest, this._origin = structuredClone(s), "ok";
    const o = d(this._lang, "ss_changed");
    if (s) {
      const n = this._open ?? `${e.id}|${ss(s)}`, l = this._editProfileId;
      this._openRow(n, e, s), this._editProfileId = l;
    } else
      this._cancel();
    return this._error = s ? o : "", this._note = s ? "" : o, "changed";
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
      return this._error = (i == null ? void 0 : i.code) === "unauthorized" ? d(this._lang, "err_unauthorized") : d(this._lang, "lb_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  async _saveRow() {
    const t = this._live(this._programId);
    if (!t || !this._editProfile(t)) {
      this._error = d(this._lang, "ss_changed");
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
    let o = [], n = !1;
    await this._commit(i.id, (a) => {
      const p = this._editProfile(a);
      if (!p) return { error: d(this._lang, "ss_changed") };
      if (this._checkOrigin(p, a) === "changed")
        return n = !0, { changed: !0 };
      let h = p;
      this._base && (h = te(h, r, this._minutes, this._base));
      let f = e;
      if (o = [], this._dropBusy) {
        const { free: m, busy: g } = _o(h, r, this._minutes, e.slot, e.days);
        if (!m.length) return { error: d(this._lang, "w_err_overlap") };
        f = { ...e, days: m }, o = g;
      }
      const _ = te(h, r, this._minutes, { openId: this._openId, rest: this._rest, draft: f });
      return uo(_) !== null ? { error: d(this._lang, "w_err_overlap") } : { program: { ...a, entities: this._withOverrides(a), profiles: a.profiles.map((m) => m.id === p.id ? _ : m) } };
    }) && !n && (this._cancel(), o.length && (this._note = d(this._lang, "w_dropped", { days: o.map((a) => F(this._lang).days_short[a]).join(" ") })));
  }
  async _deleteRow() {
    const t = this._live(this._programId);
    if (!t || this._open === "new" || !this._openId || !await mt(this, d(this._lang, "w_confirm_slot"), d(this._lang, "yes"), d(this._lang, "no"))) return;
    await this._commit(t.id, (i) => {
      const s = this._editProfile(i);
      if (!s) return { error: d(this._lang, "ss_changed") };
      if (this._checkOrigin(s, i) === "changed") return { changed: !0 };
      const r = te(s, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
      return { program: { ...i, profiles: i.profiles.map((o) => o.id === s.id ? r : o) } };
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
      if (!t && !await mt(this, d(this._lang, "confirm_pause", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no"))) {
        e.checked = !0;
        return;
      }
      for (const i of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: i.id, enabled: t });
    } catch (i) {
      this._error = d(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    } finally {
      this._toggling = !1, e.checked = this._enabled;
    }
  }
  async _deleteAll() {
    if (await mt(this, d(this._lang, "confirm_delete_schedule", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no")))
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
        this._error = d(this._lang, "error", { message: (t == null ? void 0 : t.message) ?? String(t) });
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
    const e = this._lang, i = di(e, t.start);
    return t.end ? `${i}–${di(e, t.end)}` : i;
  }
  _rowText(t) {
    const e = this._lang, i = q(this.data, t.slot.label), s = ro(e, F(e).days_short, t.days);
    return {
      text: [(i == null ? void 0 : i.name) ?? "", this._when(t.slot)].filter(Boolean).join(" · "),
      days: s,
      color: (i == null ? void 0 : i.color) ?? "var(--disabled-text-color)"
    };
  }
  _renderRow(t) {
    const { program: e, group: i, key: s } = t;
    if (this._open === s && this._group) return this._renderEditor(e, s);
    const { text: r, days: o, color: n } = this._rowText(i);
    return c`<button class="row" aria-expanded="false" @click=${() => this._openRow(s, e, i)}>
      <span class="dot" style="background:${n}"></span>
      <span class="txt"><span class="l1">${r}</span>${this._focus === null ? c`<span class="l2">${o}</span>` : u}${this._programs.length > 1 ? c`<small>${e.name}</small>` : u}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(t, e) {
    const i = this._lang, s = e === "new", r = this._entities.filter((o) => t.entities.some((n) => n.entity_id === o));
    return c`<div class="editor">
      ${Te(this._pickerKey, c`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .group=${this._group} .entityIds=${r}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(o) => {
      o.stopPropagation(), this._labelDraft = o.detail, this._error = "";
    }}
        @group-change=${(o) => {
      o.stopPropagation(), this._group = o.detail, this._error = "";
    }}></wp-slot-form>`)}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : u}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${d(i, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${d(i, "cancel")}</button>
      </div>
      ${s || this._labelDraft ? u : c`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${d(i, "duplicate")}</button>`}
      ${s || this._labelDraft ? u : c`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${d(i, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const t = this._lang, e = this._programs[0];
    return e ? this._entities.filter((i) => e.entities.some((s) => s.entity_id === i)).map((i) => {
      const s = e.entities.find((l) => l.entity_id === i), r = `rest:${i}`, o = this._entities.length > 1 ? `${d(t, "rest_of_time")} · ${et(this.hass, i)}` : d(t, "rest_of_time");
      if (this._open === r)
        return c`<div class="editor"><h4>${o}</h4>
          ${Te(this._pickerKey, c`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .entityIds=${[i]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(l) => {
          l.stopPropagation(), this._labelDraft = l.detail, this._error = "";
        }}
            @label-change=${(l) => {
          l.stopPropagation(), this._restLabel = l.detail;
        }}></wp-label-picker>`)}
          ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : u}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(i)}>${d(t, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${d(t, "cancel")}</button>
          </div></div>`;
      const n = q(this.data, s.default_label);
      return c`<button class="row rest" aria-expanded="false" @click=${() => this._expand(r, e, null, { restLabel: s.default_label ?? null })}>
        ${n ? c`<span class="dot" style="background:${n.color}"></span>` : c`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${o} · <b>${n ? n.name : d(t, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : u;
  }
  /** Keep the whole week visible, including the unsaved slot being edited. */
  _renderWeek() {
    const t = this._lang;
    return c`<section class="schematic" aria-label=${d(t, "week")}>
      ${this._entities.map((e) => c`
        ${this._entities.length > 1 ? c`<h4>${et(this.hass, e)}</h4>` : u}
        ${F(t).days_short.map((i, s) => {
      const r = [];
      for (const o of [...this._programs].reverse()) {
        const n = this._live(o.id) ?? o;
        if (!n.entities.some((a) => a.entity_id === e)) continue;
        let l = n.id === this._programId && this._open ? this._editProfile(n) : this._modeProfile(n);
        if (l) {
          n.id === this._programId && this._group && (this._base && (l = te(l, this._include, this._minutes, this._base)), l = te(l, this._include, this._minutes, {
            openId: this._openId,
            rest: this._rest,
            draft: this._group
          }));
          for (const a of [(s + 6) % 7, s])
            for (const p of l.days[a]) {
              const h = q(this.data, p.label);
              if (!h || !Hs(this.hass, e, vt(n, e, h), Le(n, e))) continue;
              const f = this._minutes(p.start), _ = p.end ? this._minutes(p.end) : null, m = _ !== null && _ < f && _ < A / 2;
              a !== s && !m || _ !== null && _ <= f && !m || r.push({
                start: a === s ? f : 0,
                end: a !== s ? _ : m ? A : _ ?? f + 10,
                color: h.color,
                label: h.name,
                marker: _ === null,
                startSun: a === s ? Tt(p.start) : null,
                endSun: m && a === s ? null : Tt(p.end),
                startSpec: p.start,
                endSpec: p.end
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
    if (!this.chart || !e || !this._chartEntity || this._modeOnly) return u;
    const i = this._date, s = new Intl.DateTimeFormat(t, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${i}T12:00:00Z`));
    return c`<section class="chart">
      ${this._entities.length > 1 ? c`<select aria-label=${d(t, "chart")} @change=${(r) => this._chartEntity = r.target.value}>
        ${this._entities.map((r) => c`<option value=${r} ?selected=${r === this._chartEntity}>${et(this.hass, r)}</option>`)}</select>` : u}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${d(t, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? d(t, "today") : s}</span>
        <button class="ibtn" ?disabled=${this._offset >= ri} aria-label=${d(t, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${e} entity-id=${this._chartEntity} date=${i}
        .slots=${this._slots} @open-history=${(r) => this._openHistory(r.detail)}></wp-chart>
    </section>`;
  }
  render() {
    var s;
    if (!this.hass || !this.data || !this.scope) return u;
    const t = this._lang;
    if (!this._programs.length)
      return c`<wp-dialog open heading=${this._title}><p class="muted">${d(t, "no_program")}</p></wp-dialog>`;
    const e = this._rows(), i = this.scope.kind === "program" && !this._modeProfile(this._programs[0]);
    return c`
      <wp-dialog open heading=${this._title}>
        ${i ? c`<p class="err" role="alert">${d(t, "mode_removed")}</p>` : u}
        ${this._canEdit ? u : c`<p class="err" role="alert">${d(t, "read_only")}</p>`}
        ${this._error && !this._open ? c`<p class="err" role="alert">${this._error}</p>` : u}
        ${this._focus !== null && this._open === null ? c`<div class="focus">
          <button class="chip back" @click=${() => {
      this._focus = null, this._note = "";
    }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${d(t, "w_whole_week")}</button>
          <h3>${F(t).days[this._focus]}</h3></div>` : u}
        ${this._note && this._open === null ? c`<p class="muted note">${this._note}</p>` : u}
        ${this.scope.kind === "program" ? c`<label class="mode-select">${d(t, "profile")}
          <select .value=${((s = this._modeProfile(this._programs[0])) == null ? void 0 : s.id) ?? ""} ?disabled=${this.profileId !== null || this._open !== null}
            @change=${(r) => {
      this._viewProfileId = r.target.value, this._slots = null, this._error = "";
    }}>
            ${i ? c`<option value="" selected>${d(t, "mode_removed")}</option>` : u}
            ${this._programs[0].profiles.map((r) => {
      var o;
      return c`<option value=${r.id} ?selected=${r.id === ((o = this._modeProfile(this._programs[0])) == null ? void 0 : o.id)}>${r.name}</option>`;
    })}
          </select></label>` : u}
        ${this._modeOnly ? c`<p class="muted note">${d(t, "mode_schedule_hint")}</p>` : u}
        ${this._renderWeek()}
        <div class="list">
          ${e.length ? e.map((r) => this._renderRow(r)) : this._open === "new" ? u : c`<p class="muted">${d(t, "w_none")}</p>`}
          ${this._group && (this._open === "new" || this._open !== null && !e.some((r) => r.key === this._open)) ? this._renderEditor(this._programs.find((r) => r.id === this._programId) ?? this._programs[0], this._open) : u}
          ${this._open === null ? c`<button class="row add" ?disabled=${!this._canEdit || i} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? d(t, "w_add") : d(t, "w_add_day", { day: F(t).days[this._focus].toLocaleLowerCase(t) })}</span></button>` : u}
          ${this._modeOnly ? u : this._renderRest()}
        </div>
        ${this._open !== null ? u : c`${this._renderChart()}
        ${this._modeOnly ? u : c`<label class="switch">
          <span class="grow">${d(t, "schedule_on")}</span>
          <span class="state">${this._enabled ? d(t, "running") : d(t, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit || this._toggling}
            @change=${(r) => void this._setEnabled(r.target.checked, r.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${d(t, "delete_schedule")}</button>`}`}
      </wp-dialog>`;
  }
};
E.styles = [ot, R`
    :host { display: contents; }
    .mode-select { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .mode-select select { flex: 1; min-width: 0; min-height: 44px; }
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
I([
  v({ attribute: !1 })
], E.prototype, "hass", 2);
I([
  v({ attribute: !1 })
], E.prototype, "data", 2);
I([
  v({ attribute: !1 })
], E.prototype, "scope", 2);
I([
  v({ type: Boolean })
], E.prototype, "chart", 2);
I([
  v({ attribute: !1 })
], E.prototype, "profileId", 2);
I([
  $()
], E.prototype, "_viewProfileId", 2);
I([
  v({ attribute: !1 })
], E.prototype, "day", 2);
I([
  $()
], E.prototype, "_open", 2);
I([
  $()
], E.prototype, "_group", 2);
I([
  $()
], E.prototype, "_dayOnly", 2);
I([
  $()
], E.prototype, "_focus", 2);
I([
  $()
], E.prototype, "_note", 2);
I([
  $()
], E.prototype, "_draft", 2);
I([
  $()
], E.prototype, "_restLabel", 2);
I([
  $()
], E.prototype, "_labelDraft", 2);
I([
  $()
], E.prototype, "_pickerKey", 2);
I([
  $()
], E.prototype, "_programId", 2);
I([
  $()
], E.prototype, "_error", 2);
I([
  $()
], E.prototype, "_saving", 2);
I([
  $()
], E.prototype, "_toggling", 2);
I([
  $()
], E.prototype, "_offset", 2);
I([
  $()
], E.prototype, "_slots", 2);
I([
  $()
], E.prototype, "_chartEntity", 2);
E = I([
  B("wp-schedule")
], E);
const $s = "weekly_planner_reloaded_for";
function Yo(t = import.meta.url) {
  try {
    return new URL(t).searchParams.get("v");
  } catch {
    return null;
  }
}
function Xo(t, e, i) {
  return !!(t && e && t !== e && i !== e);
}
function xs(t, e) {
  if (!e) return !1;
  let i = null;
  try {
    i = sessionStorage.getItem($s);
  } catch {
  }
  if (!Xo(Yo(), t, i)) return !1;
  try {
    sessionStorage.setItem($s, t);
  } catch {
  }
  return location.reload(), !0;
}
var Zo = Object.defineProperty, Qo = Object.getOwnPropertyDescriptor, K = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qo(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && Zo(e, i, r), r;
};
let H = class extends D {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._expandedProgram = null, this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._toggling = /* @__PURE__ */ new Set(), this._visible = () => {
      document.hidden || this._pollVersion();
    }, this._failedPreviewKey = "", this._previewRetryAt = 0;
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
    xs((t = this._data) == null ? void 0 : t.card_version, this._idle);
  }
  /** Asks the server for the served version (a reload of the integration does not push new data to old subscriptions). */
  async _pollVersion() {
    try {
      const t = await this.hass.callWS({ type: "weekly_planner/get" });
      xs(t.card_version, this._idle);
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
    this._idle && ((t = this._data) != null && t.card_version) && this._checkVersion(), this.isConnected && this.hass && !this._unsub && (this._unsub = qs(this.hass, (e) => {
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
    return new Date(Ut(Ue(pt(this._now, this._tz), t), this._tz).startMs + 12 * 36e5);
  }
  /** Translated names of the services used by the labels. */
  async _loadNames(t) {
    const e = t.labels.flatMap((i) => i.action.kind === "service" ? [i.action.service.split(".")[0]] : []);
    await Yt(this.hass, e) && this.requestUpdate();
  }
  async _loadPreviews() {
    if (!this._data) return;
    const t = [0, 1, 2, 3, 4, 5, 6].map((o) => pt(this._dateAt(o), this._tz)), e = ts(this._data, this._config), i = `${t[0]}|${e.map((o) => `${o.id}:${o.revision}:${V(o, this._data).id}`).join(",")}`;
    if (i === this._previewKey || i === this._failedPreviewKey && Date.now() < this._previewRetryAt) return;
    this._previewKey = i;
    let s = !1;
    const r = {};
    await Promise.all(t.flatMap((o) => e.map((n) => this.hass.callWS({ type: "weekly_planner/preview", program_id: n.id, date: o }).then((l) => {
      (r[o] ?? (r[o] = {}))[n.id] = l.slots;
    }).catch(() => {
      s = !0;
    })))), i === this._previewKey && (this._preview = r, s ? (this._previewKey = "", this._failedPreviewKey = i, this._previewRetryAt = Date.now() + 5e3) : this._failedPreviewKey = "");
  }
  /* ---- blocks ---- */
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  _spans(t, e, i = 0) {
    const s = this._data, r = this._dateAt(i), o = Ce(r, this._tz), n = this._preview[pt(r, this._tz)] ?? {}, l = [];
    for (const a of [...e].reverse()) {
      if (!a.enabled) continue;
      const p = V(a, s), h = (m) => vt(a, t, q(s, m.label)), f = (m, g, w, S = {}) => {
        const k = q(s, m.label);
        return {
          start: g,
          end: w,
          color: k.color,
          label: k.name,
          slotId: m.id,
          startSun: Tt(m.start),
          endSun: m.end ? Tt(m.end) : null,
          startSpec: m.start,
          endSpec: m.end ?? null,
          marker: !m.end,
          ...S
        };
      };
      for (const { slot: m, end: g } of Rs(p.days[(o + 6) % 7]))
        h(m) && l.push(f(m, 0, g, { spill: !0, startSun: null }));
      const _ = n[a.id];
      for (const m of p.days[o]) {
        if (!h(m)) continue;
        const g = _ == null ? void 0 : _.find((k) => k.slot_id === m.id);
        let w = St(m.start), S = St(m.end ?? null);
        g && (w = ht(g.start, this._tz), S = g.end ? ht(g.end, this._tz) : null), w !== null && l.push(f(
          m,
          w,
          S === null ? w + 10 : S > w ? S : A,
          { sun: "sun" in m.start || !!(m.end && "sun" in m.end), ignored: (g == null ? void 0 : g.ignored) ?? null }
        ));
      }
    }
    return l;
  }
  _next(t, e) {
    var s, r;
    const i = this._data;
    for (const o of e) {
      if (!o.enabled) continue;
      const n = (r = (s = i.status[o.id]) == null ? void 0 : s.next_actions) == null ? void 0 : r[t];
      if (n) return n;
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
      if (!e && !await mt(this, d(this._lang, "confirm_pause", { name: t.name }), d(this._lang, "yes"), d(this._lang, "no"))) return;
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
      aria-label=${`${t.name}: ${d(this._lang, t.enabled ? "running" : "stopped")}`}
      ?disabled=${((e = this._data) == null ? void 0 : e.read_only) || this._toggling.has(t.id)}
      @click=${() => void this._toggleProgram(t)}>
      <ha-icon icon=${t.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
  }
  _modeName(t) {
    const e = this._data ? V(t, this._data) : void 0;
    return e && (t.profiles.length > 1 || t.mode_source) ? c`<span class="mode-name">${d(this._lang, "profile")}: ${e.name}</span>` : u;
  }
  _disabledBadge(t) {
    return t ? c`<span class="disabled-badge" role="status">${d(this._lang, "program_disabled")}</span>` : u;
  }
  /* ---- render ---- */
  /** A bar that can be edited in place: today's (`kind` "today") or one of the week's. */
  _bar(t, e, i, s, r) {
    var h, f, _;
    const o = this._dateAt(i), n = Ce(o, this._tz), l = pt(o, this._tz), a = `${e.id}|${t}|${s}|${n}`, p = [e];
    return c`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${e} entity-id=${t}
      weekday=${n} .spans=${this._spans(t, p, i)} .preview=${(h = this._preview[l]) == null ? void 0 : h[e.id]}
      .now=${i === 0 ? ht(this._now, this._tz) : null} ?hours=${s === "today"}
      ?editing=${this._edit === a} ?editable=${!!((f = this._data) != null && f.can_edit) && !((_ = this._data) != null && _.read_only)}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => this._edit = a} @edit-exit=${() => {
      this._edit === a && (this._edit = null);
    }}
      @open-day=${r} @edited=${(m) => this._showSnack(m.detail.undo)}></wp-bar-editor>`;
  }
  _line(t, e, i) {
    var f, _, m, g;
    const s = this._lang, r = this._data, o = this._next(t, e), n = q(r, o == null ? void 0 : o.label), l = e.length > 0 && e.every((w) => !w.enabled), a = this.hass.states[t], p = i.icon ?? (a == null ? void 0 : a.attributes.icon) ?? "mdi:calendar-clock", h = () => this._open(i.open);
    return c`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${p}></ha-icon>
          <div class="info">
            ${i.name ? c`<span class="name">${i.name}</span>` : u}
            ${i.button && e.length === 1 ? this._modeName(e[0]) : u}
            <span class="now">
              <span class="nw">${a ? ((_ = (f = this.hass).formatEntityState) == null ? void 0 : _.call(f, a)) ?? a.state : "—"}</span>
              ${o ? c`<span class="next">→ ${(n == null ? void 0 : n.name) ?? pe(this.hass, s, o.action)}
                <span class="when nw">${Re(Qi(o.at, this._tz, s, this._now))}</span></span>` : u}
            </span>
          </div>
          ${i.button ? c`<div class="header-actions"><div class="header-icons">
            ${e.length === 1 ? this._programToggle(e[0]) : u}
            <button class="hours" aria-label=${d(s, "hours")} title=${d(s, "hours")} @click=${h}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(l)}</div>` : u}
        </div>
        ${this._config.schedule_view === "radial" || this._config.schedule_view === "radial_12h" ? c`<wp-radial-day
          .spans=${this._spans(t, e)} .now=${ht(this._now, this._tz)} lang=${s}
          .rest=${((g = q(r, (m = e[0].entities.find((w) => w.entity_id === t)) == null ? void 0 : m.default_label)) == null ? void 0 : g.name) ?? d(s, "rest_none")}
          .double=${this._config.schedule_view === "radial_12h"}
          @open-day=${h}></wp-radial-day>` : c`<div class="today">
          <span class="wname">${d(s, "today_short")}</span>
          ${this._bar(t, e[0], 0, "today", h)}
        </div>`}
        ${this._weekRows(`${si(i.open)}|${t}`, t, e, i.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(t, e, i, s) {
    const r = this._lang, o = this._week.has(t), n = () => {
      const a = new Set(this._week);
      o ? a.delete(t) : a.add(t), this._week = a;
    }, l = F(r).days_short;
    return c`
      <button class="weekbtn" aria-expanded=${o} @click=${n}>
        <ha-icon icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${d(r, "week")}</button>
      ${o ? c`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((a) => {
      const p = (a - Ce(this._now, this._tz) + 7) % 7, h = () => this._open(s, { weekday: a, offset: p });
      return c`<div class="wday">
            <button class="wnamebtn" aria-label=${l[a]} @click=${h}>
              <span class="wname ${p === 0 ? "today" : ""}">${l[a]}</span></button>
            ${this._bar(e, i[0], p, "week", h)}</div>`;
    })}
      </div>` : u}`;
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
            <button class="hours" aria-label=${d(e, "hours")} title=${d(e, "hours")} @click=${() => this._open(s)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(!i.enabled)}</div>
        </div>
        ${i.entities.map((r) => this._line(r.entity_id, [i], { name: et(this.hass, r.entity_id), button: null, open: s }))}
      </section>`;
    });
  }
  _compactList(t) {
    return t.map((e) => {
      var o;
      const i = { kind: "program", programId: e.id }, s = e.entities.map((n) => ({ entity: n.entity_id, next: this._next(n.entity_id, [e]) })).filter((n) => n.next).sort((n, l) => Date.parse(n.next.at) - Date.parse(l.next.at)), r = this._expandedProgram === e.id;
      return c`<section class="compact-program"><div class="compact-row">
        <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" aria-expanded=${r} aria-controls=${`compact-${e.id}`}
          @click=${() => {
        this._expandedProgram = r ? null : e.id, this._edit = null;
      }}>
          <strong>${e.name}<ha-icon icon=${r ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></strong>${this._modeName(e)}
          ${s.length ? c`<span>${((o = q(this._data, s[0].next.label)) == null ? void 0 : o.name) ?? pe(this.hass, this._lang, s[0].next.action)} · ${Re(Qi(s[0].next.at, this._tz, this._lang, this._now))}</span>` : c`${e.enabled ? c`<span>${d(this._lang, "hours")}</span>` : u}`}
        </button><div class="header-actions"><div class="header-icons">${this._programToggle(e)}
        ${r ? c`<button class="hours" aria-label=${d(this._lang, "hours")} title=${d(this._lang, "hours")}
          @click=${() => this._open(i)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : u}</div>
          ${this._disabledBadge(!e.enabled)}</div></div>
        ${r ? c`<div id=${`compact-${e.id}`} class="compact-details" role="region" aria-label=${e.name}>
          ${e.entities.map((n) => c`
            ${e.entities.length > 1 ? c`<strong class="compact-device">${et(this.hass, n.entity_id)}</strong>` : u}
            <div class="today"><span class="wname">${d(this._lang, "today_short")}</span>
              ${this._bar(n.entity_id, e, 0, "today", () => this._open(i))}</div>
            ${this._weekRows(`${si(i)}|${n.entity_id}`, n.entity_id, [e], i)}
          `)}
        </div>` : u}</section>`;
    });
  }
  render() {
    var n;
    if (!this._config || !this.hass) return u;
    const t = this._lang, e = this._data, i = e ? ts(e, this._config) : [], r = !!e && !!((n = this.hass.user) != null && n.is_admin) && !!(e != null && e.can_edit) && this._config.program === void 0, o = this._config.title !== void 0 && this._config.title !== "";
    return c`
      <ha-card>
        ${o || r || e != null && e.vacation ? c`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${e != null && e.vacation ? c`<span class="chip"><ha-icon icon="mdi:pause-circle-outline"></ha-icon> ${d(t, "vacation")}</span>` : u}
              ${r ? c`<button class="gear" aria-label=${d(t, "labels")} @click=${() => this._dialog = { kind: "labels" }}>
                <ha-icon icon="mdi:label-multiple-outline"></ha-icon></button>` : u}
            </div>` : u}
        ${this._error ? c`<div class="error">${d(t, "error", { message: this._error })}</div>` : u}
        ${e != null && e.read_only ? c`<div class="error">${d(t, "read_only")}</div>` : u}
        ${e ? u : c`<div class="empty">…</div>`}
        ${e && !i.length ? c`<div class="empty" role="status">${d(t, e.programs.length && this._config.program === void 0 ? "no_matching_program" : "no_program")}</div>` : u}
        ${e ? this._config.schedule_view === "list" ? this._compactList(i) : this._bySchedule(i) : u}
      </ha-card>
      ${this._snack ? c`<div class="snack" role="status"><span>${d(t, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${d(t, "undo")}</button></div>` : u}
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    const t = this._dialog;
    if (!t || !this._data) return u;
    const e = () => this._dialog = null;
    switch (t.kind) {
      case "schedule":
        return Te(si(t.scope), c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${t.scope} .day=${t.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${e}></wp-schedule>`);
      case "labels":
        return c`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${e}></wp-labels>`;
    }
  }
};
H.styles = R`
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
K([
  v({ attribute: !1 })
], H.prototype, "hass", 2);
K([
  $()
], H.prototype, "_config", 2);
K([
  $()
], H.prototype, "_data", 2);
K([
  $()
], H.prototype, "_error", 2);
K([
  $()
], H.prototype, "_dialog", 2);
K([
  $()
], H.prototype, "_preview", 2);
K([
  $()
], H.prototype, "_now", 2);
K([
  $()
], H.prototype, "_week", 2);
K([
  $()
], H.prototype, "_expandedProgram", 2);
K([
  $()
], H.prototype, "_edit", 2);
K([
  $()
], H.prototype, "_snack", 2);
K([
  $()
], H.prototype, "_toggling", 2);
H = K([
  B("weekly-planner-card")
], H);
const tn = 50, en = 700;
class sn {
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
    !!s && s === this._group && this._recordedAt !== void 0 && r >= this._recordedAt && r - this._recordedAt <= en || this._push(this._past, e), this._future = [], this._group = s || void 0, this._recordedAt = r;
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
    e.push(structuredClone(i)), e.length > tn && e.shift();
  }
  _resetGroup() {
    this._group = void 0, this._recordedAt = void 0;
  }
}
const ws = /* @__PURE__ */ new WeakMap();
async function rn(t, e) {
  var l, a;
  const i = t.states[e], s = i == null ? void 0 : i.attributes.icon;
  if (typeof s == "string" && s.startsWith("mdi:")) return s;
  const r = e.split(".")[0];
  let o = ws.get(t.connection);
  o || ws.set(t.connection, o = /* @__PURE__ */ new Map());
  let n = o.get(r);
  n || (n = t.callWS({ type: "frontend/get_icons", category: "entity_component", integration: r }).then((p) => {
    var h;
    return ((h = p.resources) == null ? void 0 : h[r]) ?? {};
  }), o.set(r, n));
  try {
    const p = await n, h = ((l = p[String(i == null ? void 0 : i.attributes.device_class)]) == null ? void 0 : l.default) ?? ((a = p._) == null ? void 0 : a.default);
    return h != null && h.startsWith("mdi:") ? h : "mdi:calendar-clock";
  } catch {
    return o.delete(r), "mdi:calendar-clock";
  }
}
const oi = (t, e) => JSON.stringify(t) === JSON.stringify(e), Ae = (t) => t !== null && typeof t == "object" && !Array.isArray(t);
function mi(t, e, i) {
  if (oi(t, e)) return i;
  if (oi(t, i) || oi(e, i)) return e;
  if (Ae(t) && Ae(e) && Ae(i)) {
    const s = {};
    for (const r of /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e), ...Object.keys(i)])) {
      const o = mi(t[r], e[r], i[r]);
      o !== void 0 && (s[r] = o);
    }
    return s;
  }
  if (Array.isArray(t) && Array.isArray(e) && Array.isArray(i)) {
    const s = [...t, ...e, ...i], r = ["id", "entity_id"].find((o) => s.length && s.every((n) => Ae(n) && typeof n[o] == "string"));
    if (r) {
      const o = (p) => new Map(p.map((h) => [h[r], h])), n = o(t), l = o(e), a = o(i);
      return [.../* @__PURE__ */ new Set([...l.keys(), ...a.keys(), ...n.keys()])].map((p) => mi(n.get(p), l.get(p), a.get(p))).filter((p) => p !== void 0);
    }
  }
  throw new Error("settings_conflict");
}
function on(t, e, i) {
  return { ...mi(t, { ...e, revision: t.revision }, i), revision: i.revision };
}
function ni(t, e) {
  var r, o;
  const i = (o = (r = t.states[e]) == null ? void 0 : r.attributes) == null ? void 0 : o.friendly_name;
  if (typeof i == "string" && i) return i;
  const s = e.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : e;
}
const ks = /* @__PURE__ */ new WeakSet();
function nn(t) {
  if (!t || ks.has(t)) return;
  ks.add(t);
  const e = () => {
    t.classList.toggle("more-left", t.scrollLeft > 2), t.classList.toggle("more-right", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  };
  t.addEventListener("scroll", e, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(e).observe(t), e();
}
const an = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var ln = Object.defineProperty, cn = Object.getOwnPropertyDescriptor, L = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? cn(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && ln(e, i, r), r;
};
const Ss = () => [[], [], [], [], [], [], []];
function As(t) {
  return t.map((e) => ({ ...structuredClone(e), id: it() }));
}
let T = class extends D {
  constructor() {
    super(...arguments), this.embedded = !1, this._iconCustomized = !1, this._applied = !1, this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._changingMode = !1, this._associationsOpen = !1, this._scheduleProfileId = null, this._hoursRevision = 0, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._history = new sn(), this._editingHistory = !1, this._iconEpoch = 0, this._historyKey = (t) => {
      if (t.defaultPrevented || t.altKey || !(t.ctrlKey || t.metaKey) || !this._p || this._saving || !this._canEdit() || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "INPUT" || s.tagName === "TEXTAREA" || s.isContentEditable))) return;
      const e = t.key.toLowerCase(), i = e === "z" && t.shiftKey || e === "y";
      (e === "z" || e === "y") && (t.preventDefault(), t.stopPropagation(), i ? this._redoDraft() : this._undoDraft());
    }, this._pickerKey = 0, this._servicesOpen = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("keydown", this._historyKey), this._picker || Us().then((t) => this._picker = t);
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
    this._p = t.program, this._origin = t.origin, this._isNew = t.isNew, this._iconCustomized = t.iconCustomized, this._profileId = t.profileId, this._profileForm = t.profileForm, this._error = "", this._applied = !1, this._refreshIcon();
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
    this._iconCustomized || !e || rn(this.hass, e).then((s) => {
      var r;
      t !== this._iconEpoch || this._iconCustomized || ((r = this._p.entities[0]) == null ? void 0 : r.entity_id) !== e || (this._p = { ...this._p, icon: s });
    });
  }
  get _lang() {
    return Pt(this.hass);
  }
  _tr(t, e) {
    return d(this._lang, t, e);
  }
  _long(t) {
    return F(this._lang).days[t];
  }
  _short(t) {
    return F(this._lang).days_short[t];
  }
  /* ---- initial state ---- */
  willUpdate() {
    var t, e;
    if (!this._ready && !(!this.hass || !this.data)) {
      if (this._ready = !0, this._origin = this.program ? structuredClone(this.program) : void 0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const i = it();
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
          profiles: [{ id: i, name: this._tr("profile_default"), days: Ss() }]
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
    this._edit(() => {
      var e;
      this._iconCustomized = !!t, this._patch({ icon: t || this._deviceIcon((e = this._p.entities[0]) == null ? void 0 : e.entity_id) });
    }, "icon"), this._refreshIcon();
  }
  _patch(t, e) {
    this._edit(() => {
      var i;
      t.entities && !this._iconCustomized && (t = { ...t, icon: this._deviceIcon((i = t.entities[0]) == null ? void 0 : i.entity_id) }), this._p = { ...this._p, ...t }, this._error = "", this._applied = !1;
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
          id: it(),
          name: e,
          days: t.mode === "copy" ? s.days.map(As) : Ss()
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
    const t = this._p;
    if (!t.name.trim()) return this._tr("err_name");
    if (!t.entities.length) return this._tr("err_no_entity");
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
    return (e == null ? void 0 : e.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (e == null ? void 0 : e.code) === "unauthorized" ? this._tr("err_unauthorized") : i.includes("overlapping_slots") ? this._tr("err_overlap_server") : i.includes("circular_mode_source") ? this._tr("mode_source_loop") : i.includes("controlled by an external") ? this._tr("mode_source_locked") : i.includes("unknown_mode_profile") ? this._tr("mode_incomplete") : i.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: i });
  }
  async _save() {
    if (!this._canEdit() || this._saving || !this._submitProfileForm()) return;
    const t = this._validate();
    if (t) {
      this._p.mode_source && (this._associationsOpen = !0), this._error = t;
      return;
    }
    this._saving = !0;
    try {
      const e = this._payload();
      let i;
      for (let s = 0; s < 2; s++) {
        const o = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((l) => l.id === e.id);
        if (this._origin && !o) throw { code: "conflict" };
        let n = e;
        if (this._origin && o)
          try {
            n = on(this._origin, e, o);
          } catch {
            throw { code: "conflict" };
          }
        try {
          i = (await this.hass.callWS({ type: "weekly_planner/program/save", program: n })).program;
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
    await mt(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(t) {
    await mt(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(t) {
    var s;
    const e = (s = this._p.entities[t]) == null ? void 0 : s.entity_id;
    if (!e) return;
    const i = this._tr("confirm_delete", { name: ni(this.hass, e) });
    await mt(this, i, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((r, o) => o !== t) });
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
      const t = it(), e = this._p, i = /* @__PURE__ */ new Map(), s = e.profiles.map((r) => {
        const o = r.id === this._activeId() ? t : it();
        return i.set(r.id, o), { ...structuredClone(r), id: o, days: r.days.map(As) };
      });
      this._p = {
        ...structuredClone(e),
        id: "",
        revision: 0,
        created_at: void 0,
        name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
        profiles: s,
        active_profile: i.get(this._activeId()) ?? s[0].id,
        ...e.mode_source ? { mode_source: { ...e.mode_source, mappings: Object.fromEntries(Object.entries(e.mode_source.mappings).map(([r, o]) => [r, i.get(o) ?? o])) } } : {}
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
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${t.name}
          @input=${(e) => this._patch({ name: e.target.value }, "name")} /></div>
      <div class="field"><label for="f-area">${this._tr("pe_area")}</label>
        <input id="f-area" type="text" list="program-areas" .value=${t.area ?? ""} aria-describedby="program-area-help"
          @change=${(e) => this._patch({ area: e.target.value.trim() || null })} />
        <datalist id="program-areas">${[...new Set(this.data.programs.flatMap((e) => e.area ? [e.area] : []))].sort().map((e) => c`<option value=${e}></option>`)}</datalist>
        <p id="program-area-help" class="hint">${this._tr("pe_area_hint")}</p></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? c`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${t.icon ?? ""}
                @value-changed=${(e) => this._setIcon(e.detail.value || null)}></ha-selector>` : c`<div class="row" style="flex-wrap:nowrap">
                ${t.icon && customElements.get("ha-icon") ? c`<ha-icon .icon=${t.icon}></ha-icon>` : u}
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
    Ai(this.renderRoot), nn(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities(t = !1) {
    const e = this._p;
    return c`
      ${e.entities.length === 0 ? c`<p class="muted">${this._tr("pe_no_entity")}</p>` : u}
      ${e.entities.map((i, s) => this._renderEntity(i, s, t))}
      ${Te(this._pickerKey, this._picker ? c`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: e.entities.map((i) => i.entity_id) } }}
            .label=${this._tr(e.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .value=${""} .required=${!e.entities.length}
            @value-changed=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail.value ?? "");
    }}></ha-selector>` : c`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr(e.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .required=${!e.entities.length}
        .exclude=${e.entities.map((i) => i.entity_id)}
        @wp-change=${(i) => {
      i.stopPropagation(), this._addEntity(i.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  /** New devices require an explicit choice; legacy unrestricted devices keep their existing behavior. */
  _renderServices(t, e) {
    const i = new Map(Fe(this.hass, t.entity_id).map((_) => [_.id, _])), s = [...this.data.labels.map((_) => _.action), ...Object.values(t.label_overrides ?? {})], r = [...t.allowed_services ?? [], ...s.flatMap((_) => _.kind === "service" && _.target_entity_id ? [_.service] : [])];
    for (const _ of r) if (!i.has(_)) {
      const [m, g] = _.split(".");
      i.set(_, { id: _, domain: m, service: g, label: Vt(this.hass, _) });
    }
    const o = [...i.values()].sort((_, m) => _.label.localeCompare(m.label));
    if (!o.length) return c`<p class="hint">${this._tr("pe_no_services")}</p>`;
    const n = t.allowed_services ?? [], l = !t.restrict_services && !n.length, a = (_) => l || n.includes(_), p = o.filter((_) => a(_.id)).length, h = this._isNew || this._servicesOpen === t.entity_id, f = (_, m) => {
      const g = new Set(l ? o.map((w) => w.id) : n);
      m ? g.add(_) : g.delete(_), this._setEntity(e, { allowed_services: [...g], restrict_services: !0 });
    };
    return c`
      ${this._isNew ? c`<h3>${this._tr("pe_services")} · ${p}/${o.length}</h3>` : c`
        <button class="link" aria-expanded=${h} @click=${() => this._servicesOpen = h ? "" : t.entity_id}>
          <ha-icon icon=${h ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${p === o.length ? this._tr("pe_services_all") : `${p}/${o.length}`}</button>`}
      ${p === 0 && t.restrict_services ? c`<p class="hint" role="status">${this._tr("pe_zero_services")}</p>` : u}
      ${h ? c`<p class="hint">${this._tr("pe_choose_services")}</p><div class="svc">${o.map((_) => {
      const m = ci(this.hass, _.id), g = `svc-name-${e}-${_.id}`, w = `svc-description-${e}-${_.id}`;
      return c`<label class="check svc-choice"><input type="checkbox" .checked=${a(_.id)}
          aria-labelledby=${g} aria-describedby=${m ? w : u}
          @change=${(S) => f(_.id, S.target.checked)} />
          <span class="svc-copy"><span id=${g}>${_.label}</span>
            ${m ? c`<span id=${w} class="svc-description">${m}</span>` : u}
          </span></label>`;
    })}</div>` : u}`;
  }
  _renderEntity(t, e, i = !1) {
    Yt(this.hass, Fs(this.hass, t.entity_id)).then((r) => r && this.requestUpdate());
    const s = this.data.programs.filter((r) => r.id !== this._p.id && r.entities.some((o) => o.entity_id === t.entity_id)).sort((r, o) => r.priority - o.priority || r.name.localeCompare(o.name)).map((r) => this._tr("pe_program_priority", { name: r.name, priority: String(r.priority) }));
    return c`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${ni(this.hass, t.entity_id)}</strong>
            ${this.hass.states[t.entity_id] ? u : c`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${ni(this.hass, t.entity_id)}`}
            @click=${() => void this._askDeleteEntity(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${s.length ? c`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: s.join(", ") })}</p>` : u}
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
    const s = Object.fromEntries(Object.entries(i.mappings).map(([r, o]) => [r === t ? e : r, o]));
    this._patch({ mode_source: { ...i, mappings: s } });
  }
  _renderModeSource() {
    var o, n, l;
    const t = this._p.mode_source, e = t ? this.hass.states[t.entity_id] : void 0, i = this.data.status[this._p.id], s = ((o = this._p.profiles.find((a) => a.id === this._activeId())) == null ? void 0 : o.name) ?? "", r = [.../* @__PURE__ */ new Set([
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
          <p class="hint">${this._tr("mode_source_current", { state: e ? ((l = (n = this.hass).formatEntityState) == null ? void 0 : l.call(n, e)) ?? e.state : this._tr("value_unavailable") })}</p>
          <details class="mode-associations" .open=${this._associationsOpen}
            @toggle=${(a) => {
      this._associationsOpen = a.currentTarget.open;
    }}>
            <summary>${this._tr("mode_association_count", { n: String(Object.keys(t.mappings).length) })}</summary>
          ${Object.entries(t.mappings).map(([a, p], h) => c`<div class="card mode-mapping">
            ${this._picker ? c`<ha-selector .hass=${this.hass} .selector=${{ state: { entity_id: t.entity_id } }}
              .value=${a || void 0} .label=${this._tr("mode_source_state")}
              @value-changed=${(f) => {
      f.stopPropagation(), this._sourceState(a, f.detail.value ?? "");
    }}></ha-selector>` : c`<div class="field"><label for=${`mode-state-${h}`}>${this._tr("mode_source_state")}</label>
                <input id=${`mode-state-${h}`} list="mode-state-values" .value=${a}
                  @change=${(f) => this._sourceState(a, f.target.value)} /></div>`}
            <div class="field"><label for=${`mode-target-${h}`}>${this._tr("mode_source_target")}</label>
              <select id=${`mode-target-${h}`} data-value=${p} @change=${(f) => this._patch({ mode_source: { ...t, mappings: { ...t.mappings, [a]: f.target.value } } })}>
                ${this._p.profiles.some((f) => f.id === p) ? u : c`<option value=${p}>${this._tr("mode_removed")}</option>`}
                ${this._p.profiles.map((f) => c`<option value=${f.id}>${f.name}</option>`)}
              </select></div>
            <button class="btn danger" aria-label=${this._tr("mode_remove_mapping")} @click=${() => this._patch({ mode_source: { ...t, mappings: Object.fromEntries(Object.entries(t.mappings).filter(([f]) => f !== a)) } })}>
              <ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>
          </div>`)}
          <datalist id="mode-state-values">${r.map((a) => c`<option value=${a}></option>`)}</datalist>
          <button class="btn" ?disabled=${Object.prototype.hasOwnProperty.call(t.mappings, "")} @click=${() => this._patch({ mode_source: { ...t, mappings: { ...t.mappings, "": this._profileId } } })}>
            <ha-icon icon="mdi:plus"></ha-icon>${this._tr("mode_add_mapping")}</button>
          </details>
        ` : u}
        ${!this._seasonsUnapplied && (i != null && i.mode_source_status) && i.mode_source_status !== "matched" ? c`<p class="hint" role="status">${this._tr("mode_source_kept", { name: s })}</p>` : u}
      ` : this._isNew ? u : c`<section class="mode-live"><div class="field"><label for="mode-active">${this._tr("mode_active_immediate")}</label>
        <select id="mode-active" data-value=${this._activeId()} aria-describedby="mode-live-help" ?disabled=${this._seasonsUnapplied || this._changingMode}
          @change=${(a) => void this._changeActiveMode(a.target.value, a.target)}>
          ${this._p.profiles.map((a) => c`<option value=${a.id}>${a.name}</option>`)}
        </select></div><p id="mode-live-help" class="hint">${this._tr("mode_active_immediate_hint")}</p></section>`}`;
  }
  _renderSeasons() {
    var r, o;
    const t = this._p, e = this._profile, i = this._activeId(), s = this._profileForm;
    return c`
      <p class="hint">${this._tr("profile_explanation")}</p>
      ${this._isNew ? u : c`<p class="active-profile" role="status"><ha-icon icon="mdi:star"></ha-icon>
        ${this._tr("profile_current", { name: ((o = (r = this._origin) == null ? void 0 : r.profiles.find((n) => n.id === i)) == null ? void 0 : o.name) ?? e.name })}</p>`}
      ${this._renderModeSource()}
      ${this._seasonsUnapplied ? c`<p class="hint">${this._tr("profile_apply_first")}</p>` : u}
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile_manage")}</label>
          <select id="f-profile" data-value=${e.id} ?disabled=${!!s} @change=${(n) => {
      this._profileId = n.target.value;
    }}>
            ${t.profiles.map((n) => c`<option value=${n.id} ?selected=${n.id === e.id}>${n.name}${n.id === i ? ` (${this._tr("profile_active")})` : ""}</option>`)}
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
      ${e.id === i ? c`<p class="hint">${this._tr("profile_active_hint")}</p>` : u}
      ${s ? c`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(n) => this._changeProfileForm({ ...s, name: n.target.value }, "season-name")}
                @keydown=${(n) => {
      n.key === "Enter" && (n.preventDefault(), this._save());
    }} /></div>
            ${s.mode === "rename" ? c`<p class="hint">${this._tr("profile_rename_warning")}</p>` : u}
            <button class="btn" @click=${() => this._changeProfileForm(void 0)}>${this._tr("profile_discard_edit")}</button>
          </div>` : u}
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
    if (!this._p) return u;
    const t = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]], e = this._canEdit(), i = c`
      ${e ? u : c`<p class="error" role="alert">${this._tr("read_only")}</p>`}
      <fieldset ?disabled=${!e || this._saving}>
        <div class="history" role="group" aria-label=${this._tr("pe_history")}>
          <button class="btn" aria-label=${this._tr("pe_undo")} title=${this._tr("pe_undo")} ?disabled=${!this._history.canUndo} @click=${() => this._undoDraft()}>
            <ha-icon icon="mdi:undo"></ha-icon>${this._isNew ? u : this._tr("pe_undo")}</button>
          <button class="btn" aria-label=${this._tr("pe_redo")} title=${this._tr("pe_redo")} ?disabled=${!this._history.canRedo} @click=${() => this._redoDraft()}>
            <ha-icon icon="mdi:redo"></ha-icon>${this._isNew ? u : this._tr("pe_redo")}</button>
        </div>
        ${this._isNew ? c`<p class="hint">${this._tr("pe_create_hint")}</p>
          <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
            <input id="f-name" type="text" maxlength="60" .value=${this._p.name}
              @input=${(n) => this._patch({ name: n.target.value }, "name")} /></div>
          <h3>${this._tr("tab_entities")}</h3>${this._renderEntities(!0)}` : c`
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${t.map(([n, l]) => c`<button id=${`pe-tab-${n}`} role="tab" aria-controls="pe-panel" tabindex=${this._tab === n ? 0 : -1} aria-selected=${this._tab === n} class="tab ${this._tab === n ? "on" : ""}"
            @keydown=${(a) => this._tabKey(a, t)} @click=${() => this._tab = n}>${this._tr(l)}</button>`)}
        </div>
        <div id="pe-panel" role="tabpanel" aria-labelledby=${`pe-tab-${this._tab}`}>
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>`}
      </fieldset>
      ${this._error ? c`<p class="error" role="alert">${this._error}</p>` : u}`, s = c`
      <button class="btn primary" ?disabled=${!e || this._saving} @click=${() => void this._save()}>
        ${this._tr(this._isNew ? "pe_create" : this.embedded ? "ce_apply_program" : "save")}</button>
      ${this.embedded ? u : c`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>`}`, r = c`
      ${this._isNew ? u : c`<button class="btn" ?disabled=${!e || this._saving || !!this._profileForm} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
      ${this._isNew ? u : c`<button class="btn danger" ?disabled=${!e || this._saving || !!this._profileForm}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>`}`, o = !!this._profileForm || (this._origin ? JSON.stringify(this._p) !== JSON.stringify(this._origin) : !!(this._p.name || this._p.entities.length));
    return this.embedded ? c`<section class="embedded">${i}
      ${o && !this._isNew ? c`<p role="status" class="hint">${this._tr("pe_unapplied")}</p>` : u}
      <p class="hint">${this._tr(this._isNew ? "pe_create_save_hint" : "pe_shared_save_hint")}</p>
      <div class="actions apply-bar">${s}</div><div class="actions secondary-actions">${r}</div>
      ${this._applied ? c`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : u}
      ${this._scheduleProfileId ? c`<wp-schedule .hass=${this.hass} .data=${this.data}
        .scope=${{ kind: "program", programId: this._p.id }} .profileId=${this._scheduleProfileId} .chart=${!1}
        @schedule-program-saved=${(n) => {
      n.stopPropagation(), this._adoptModeSchedule(n.detail);
    }}
        @closed=${(n) => {
      n.stopPropagation(), this._closeModeSchedule();
    }}></wp-schedule>` : u}
    </section>` : c`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${i}<div slot="footer" class="actions">${s}${r}</div>
    </wp-dialog>`;
  }
};
T.styles = [
  ot,
  R`
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
      ${Ms(an)}
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
L([
  v({ attribute: !1 })
], T.prototype, "hass", 2);
L([
  v({ attribute: !1 })
], T.prototype, "data", 2);
L([
  v({ attribute: !1 })
], T.prototype, "program", 2);
L([
  v({ type: Boolean })
], T.prototype, "embedded", 2);
L([
  $()
], T.prototype, "_applied", 2);
L([
  v({ attribute: !1 })
], T.prototype, "defaultTypes", 2);
L([
  $()
], T.prototype, "_p", 2);
L([
  $()
], T.prototype, "_isNew", 2);
L([
  $()
], T.prototype, "_tab", 2);
L([
  $()
], T.prototype, "_profileId", 2);
L([
  $()
], T.prototype, "_error", 2);
L([
  $()
], T.prototype, "_saving", 2);
L([
  $()
], T.prototype, "_changingMode", 2);
L([
  $()
], T.prototype, "_associationsOpen", 2);
L([
  $()
], T.prototype, "_scheduleProfileId", 2);
L([
  $()
], T.prototype, "_picker", 2);
L([
  $()
], T.prototype, "_profileForm", 2);
L([
  $()
], T.prototype, "_servicesOpen", 2);
T = L([
  B("wp-program-editor")
], T);
function dn(t, e) {
  return [...new Set([...t.map((i) => i.area), e].filter((i) => typeof i == "string" && i.length > 0))].sort((i, s) => i.localeCompare(s));
}
function Ps(t, e = []) {
  return [.../* @__PURE__ */ new Set([
    ...t.flatMap((i) => i.entities.map((s) => s.entity_id.split(".")[0])),
    ...e
  ])].filter(Boolean).sort();
}
function hn(t, e, i) {
  return t.map((s) => ({ id: s, label: (i == null ? void 0 : i(`component.${s}.title`)) || s })).sort((s, r) => s.label.localeCompare(r.label, e) || s.id.localeCompare(r.id));
}
var pn = Object.defineProperty, un = Object.getOwnPropertyDescriptor, ct = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? un(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (r = (s ? n(e, i, r) : n(r)) || r);
  return s && r && pn(e, i, r), r;
};
let X = class extends D {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._section = "display", this._editing = null, this._createdName = "", this._createdProgramId = null, this._scheduleProgramId = null, this._editors = /* @__PURE__ */ new Map(), this._domainLoadKey = "", this._tabKey = (t) => {
      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(t.key) && (t.preventDefault(), this._section = t.key === "Home" ? "display" : t.key === "End" || this._section === "display" ? "programs" : "display", this.updateComplete.then(() => {
        var e;
        return (e = this.renderRoot.querySelector(`#ce-tab-${this._section}`)) == null ? void 0 : e.focus();
      }));
    };
  }
  setConfig(t) {
    this._config.program !== t.program && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._config = { ...t };
  }
  get _lang() {
    return Pt(this.hass);
  }
  _tr(t, e) {
    return d(this._lang, t, e);
  }
  connectedCallback() {
    super.connectedCallback(), this.requestUpdate();
  }
  updated() {
    Ai(this.renderRoot), this._loadDomainNames(), this.isConnected && this.hass && !this._unsub && (this._unsub = qs(this.hass, (t) => {
      this._data = t, this._programs = t.programs.map((e) => ({ id: e.id, name: e.name }));
    }));
  }
  /** HA owns domain names and their translations, including domains unknown to this card. */
  _loadDomainNames() {
    var i, s;
    if (!((i = this.hass) != null && i.loadBackendTranslation) || !this._data) return;
    const t = Ps(this._data.programs, (s = this._config.filter) == null ? void 0 : s.types), e = `${this._lang}|${t.join(",")}`;
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
    var n, l;
    t.stopPropagation();
    const e = t.detail, i = t.currentTarget, s = (n = [...this._editors].find(([, a]) => a === i)) == null ? void 0 : n[0], r = this._editing ?? this._config.program ?? "", o = s === r;
    if (s !== void 0 && (this._editors.delete(s), this._editors.set(e.id, i)), this._data && (this._data = { ...this._data, programs: [...this._data.programs.filter((a) => a.id !== e.id), e] }), this._programs = ((l = this._data) == null ? void 0 : l.programs.map((a) => ({ id: a.id, name: a.name }))) ?? [], o && (r === "new" || r !== e.id)) {
      const a = { ...this._config, program: e.id };
      delete a.filter, this._emit(a);
    }
    o && (this._editing = e.id), o && r === "new" && (this._createdName = e.name, this._createdProgramId = e.id, this._section = "display");
  }
  _programEditor(t, e) {
    let i = this._editors.get(t);
    return i || (i = document.createElement("wp-program-editor"), i.embedded = !0, i.addEventListener("program-saved", (s) => this._saved(s)), i.addEventListener("program-deleted", (s) => {
      s.stopPropagation();
      const r = s.detail;
      this._editors.delete(r), this._editing = "", this._config.program === r && this._setMode(!1);
    }), this._editors.set(t, i)), i.hass = this.hass, i.data = this._data, i.program = e, i;
  }
  _settings() {
    var r, o;
    const t = this._data;
    if (!t || !((o = (r = this.hass) == null ? void 0 : r.user) != null && o.is_admin) || !t.can_edit || t.read_only) return u;
    const e = t.programs, i = this._editing ?? (this._isProgram && this._config.program ? this._config.program : ""), s = t.programs.find((n) => n.id === i);
    return c`<section class="program-settings">
      <h3>${this._tr(i === "new" ? "new_program" : "ce_program_settings")}</h3>
      <div class="field"><label for="ce-settings-program">${this._tr("ce_edit_program")}</label>
        <select id="ce-settings-program" data-value=${i} @change=${(n) => {
      this._editing = n.target.value;
    }}>
          <option value="" ?selected=${!i}>${this._tr("ce_choose_program")}</option>
          ${i === "new" ? c`<option value="new" selected>${this._tr("new_program")}</option>` : u}
          ${e.map((n) => c`<option value=${n.id} ?selected=${i === n.id}>${n.name}</option>`)}
        </select>
      </div>
      ${i !== "new" ? c`<button class="btn" @click=${this._newProgram}>
        <ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>` : u}
      ${i === "new" || s ? this._programEditor(i, s) : u}
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
    this._config = t, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 }));
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
    this._editing = null;
    const e = { ...this._config };
    t ? (delete e.filter, e.program = ((i = this._programs[0]) == null ? void 0 : i.id) ?? "") : (delete e.program, e.filter = { ...e.filter, types: ((s = e.filter) == null ? void 0 : s.types) ?? [] }), this._emit(e);
  }
  _setFilter(t) {
    var s;
    const e = { ...this._config.filter ?? {}, ...t };
    (s = e.types) != null && s.length || delete e.types, e.area || delete e.area;
    const i = { ...this._config, filter: e };
    this._emit(i);
  }
  _displayPrograms() {
    var i;
    const t = (i = this._config.filter) == null ? void 0 : i.programs, e = [...this._programs];
    for (const s of t ?? [])
      e.some((r) => r.id === s) || e.push({ id: s, name: s });
    return c`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${t === void 0 ? this._tr("ce_all_programs") : t.length}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${t === void 0}
        @change=${(s) => this._setFilter({ programs: s.target.checked ? void 0 : e.map((r) => r.id) })} />${this._tr("ce_all_programs")}</label>
      <div role="group" aria-label=${this._tr("ce_display_programs")}>
        ${e.map((s) => c`<label class="check"><input type="checkbox" .checked=${t === void 0 || t.includes(s.id)}
          @change=${(r) => {
      const o = t ?? e.map((n) => n.id);
      this._setFilter({ programs: r.target.checked ? [.../* @__PURE__ */ new Set([...o, s.id])] : o.filter((n) => n !== s.id) });
    }} />${s.name}</label>`)}
      </div>
    </details>`;
  }
  render() {
    var n, l, a, p, h, f;
    const t = this._config, e = ((n = t.filter) == null ? void 0 : n.types) ?? [], i = dn(((l = this._data) == null ? void 0 : l.programs) ?? [], (a = t.filter) == null ? void 0 : a.area), s = hn(
      Ps(((p = this._data) == null ? void 0 : p.programs) ?? [], e),
      this._lang,
      (_) => {
        var m, g, w;
        return ((g = (m = this.hass) == null ? void 0 : m.localize) == null ? void 0 : g.call(m, _)) || ((w = this._domainLocalize) == null ? void 0 : w.call(this, _)) || "";
      }
    ), r = c`
      ${this._createdName ? c`<div class="created-next-step"><p class="hint" role="status">${this._tr("ce_created", { name: this._createdName })}</p>
        <button class="btn primary" @click=${() => {
      this._scheduleProgramId = this._createdProgramId;
    }}><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_define_schedule")}</button></div>` : u}
      ${this._editors.has("new") ? c`<p class="hint" role="status">${this._tr("ce_draft_kept")}</p>` : u}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${t.title ?? ""} @input=${(_) => this._set("title", _.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? c`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${t.program ?? ""} @change=${(_) => this._set("program", _.target.value)}>
              ${this._programs.length === 0 ? c`<option value="">${this._tr("no_program")}</option>` : u}
              ${!this._programs.some((_) => _.id === t.program) && t.program ? c`<option value=${t.program} selected>${t.program}</option>` : u}
              ${this._programs.map((_) => c`<option value=${_.id} ?selected=${_.id === t.program}>${_.name}</option>`)}
            </select>
            ${this._canManage ? c`<div class="program-actions">
              <button class="btn" @click=${this._newProgram}><ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>
              ${t.program ? c`<button class="btn" @click=${() => {
      this._editing = t.program, this._section = "programs";
    }}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("ce_edit_selected")}</button>` : u}
            </div>` : u}</div>` : c`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${s.map(({ id: _, label: m }) => c`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${e.includes(_)}
                @change=${(g) => this._setFilter({ types: g.target.checked ? [...e, _] : e.filter((w) => w !== _) })} />
                ${m}</label>`)}
            </div>
            ${s.length ? u : c`<p class="hint">${this._tr("ce_no_types")}</p>`}
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <select id="ce-area" data-value=${((h = t.filter) == null ? void 0 : h.area) ?? ""} aria-describedby="ce-area-help"
                @change=${(_) => this._setFilter({ area: _.target.value })}>
                <option value="">${this._tr("ce_all_areas")}</option>
                ${i.map((_) => c`<option value=${_}>${_}</option>`)}
              </select><p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>
            ${this._displayPrograms()}`}

      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${t.schedule_view ?? "bars"} @change=${(_) => this._set("schedule_view", _.target.value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
        </select>
      </div>
      <label class="check"><input type="checkbox" .checked=${t.show_chart !== !1}
        @change=${(_) => this._set("show_chart", _.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `, o = this._canManage;
    return c`
      ${o ? c`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button id="ce-tab-display" role="tab" aria-controls="ce-panel" tabindex=${this._section === "display" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "display"} @click=${() => {
      this._section = "display";
    }}>${this._tr("ce_display")}</button>
        <button id="ce-tab-programs" role="tab" aria-controls="ce-panel" tabindex=${this._section === "programs" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "programs"} @click=${() => {
      this._section = "programs";
    }}>${this._tr("ce_program_settings")}</button>
      </nav>` : u}
      <div id="ce-panel" role="tabpanel" aria-labelledby=${o ? `ce-tab-${this._section}` : u}>${o && this._section === "programs" ? this._settings() : r}</div>
      ${this._scheduleProgramId && ((f = this._data) != null && f.programs.some((_) => _.id === this._scheduleProgramId)) ? c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${{ kind: "program", programId: this._scheduleProgramId }} .chart=${!1}
        @closed=${(_) => {
      _.stopPropagation(), this._scheduleProgramId = null;
    }}></wp-schedule>` : u}`;
  }
};
X.styles = [ot, R`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 16px; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .program-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }`];
ct([
  v({ attribute: !1 })
], X.prototype, "hass", 2);
ct([
  $()
], X.prototype, "_config", 2);
ct([
  $()
], X.prototype, "_programs", 2);
ct([
  $()
], X.prototype, "_data", 2);
ct([
  $()
], X.prototype, "_section", 2);
ct([
  $()
], X.prototype, "_editing", 2);
ct([
  $()
], X.prototype, "_createdName", 2);
ct([
  $()
], X.prototype, "_createdProgramId", 2);
ct([
  $()
], X.prototype, "_scheduleProgramId", 2);
X = ct([
  B("weekly-planner-card-editor")
], X);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
