/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const le = globalThis, He = le.ShadowRoot && (le.ShadyCSS === void 0 || le.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, qe = Symbol(), ci = /* @__PURE__ */ new WeakMap();
let Ji = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== qe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (He && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = ci.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ci.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ki = (t) => new Ji(typeof t == "string" ? t : t + "", void 0, qe), U = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[n + 1], t[0]);
  return new Ji(i, t, qe);
}, ws = (t, e) => {
  if (He) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = le.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, di = He ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return Ki(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ks, defineProperty: Ss, getOwnPropertyDescriptor: As, getOwnPropertyNames: Es, getOwnPropertySymbols: Cs, getPrototypeOf: Ps } = Object, ut = globalThis, hi = ut.trustedTypes, Ms = hi ? hi.emptyScript : "", ke = ut.reactiveElementPolyfillSupport, Wt = (t, e) => t, pe = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ms : null;
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
} }, Ve = (t, e) => !ks(t, e), pi = { attribute: !0, type: String, converter: pe, reflect: !1, useDefault: !1, hasChanged: Ve };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ut.litPropertyMetadata ?? (ut.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let It = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = pi) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && Ss(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: n } = As(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? pi;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Wt("elementProperties"))) return;
    const e = Ps(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Wt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Wt("properties"))) {
      const i = this.properties, s = [...Es(i), ...Cs(i)];
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
      for (const r of s) i.unshift(di(r));
    } else e !== void 0 && i.push(di(e));
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
    return ws(e, this.constructor.elementStyles), e;
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
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : pe).toAttribute(i, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : pe;
      this._$Em = r;
      const u = l.fromAttribute(i, a.type);
      this[r] = u ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, n) {
    var o;
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (n = this[e]), s ?? (s = a.getPropertyOptions(e)), !((s.hasChanged ?? Ve)(n, i) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, s)))) return;
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
It.elementStyles = [], It.shadowRootOptions = { mode: "open" }, It[Wt("elementProperties")] = /* @__PURE__ */ new Map(), It[Wt("finalized")] = /* @__PURE__ */ new Map(), ke == null || ke({ ReactiveElement: It }), (ut.reactiveElementVersions ?? (ut.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = globalThis, ui = (t) => t, ue = Ht.trustedTypes, _i = ue ? ue.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Gi = "$lit$", dt = `lit$${Math.random().toFixed(9).slice(2)}$`, Xi = "?" + dt, Os = `<${Xi}>`, Et = document, Vt = () => Et.createComment(""), Jt = (t) => t === null || typeof t != "object" && typeof t != "function", Je = Array.isArray, Ds = (t) => Je(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", Se = `[ 	
\f\r]`, Bt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fi = /-->/g, mi = />/g, bt = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), gi = /'/g, yi = /"/g, Yi = /^(?:script|style|textarea|title)$/i, Qi = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), c = Qi(1), z = Qi(2), Ct = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), bi = /* @__PURE__ */ new WeakMap(), xt = Et.createTreeWalker(Et, 129);
function Zi(t, e) {
  if (!Je(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _i !== void 0 ? _i.createHTML(e) : e;
}
const Is = (t, e) => {
  const i = t.length - 1, s = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = Bt;
  for (let a = 0; a < i; a++) {
    const l = t[a];
    let u, p, g = -1, _ = 0;
    for (; _ < l.length && (o.lastIndex = _, p = o.exec(l), p !== null); ) _ = o.lastIndex, o === Bt ? p[1] === "!--" ? o = fi : p[1] !== void 0 ? o = mi : p[2] !== void 0 ? (Yi.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = bt) : p[3] !== void 0 && (o = bt) : o === bt ? p[0] === ">" ? (o = r ?? Bt, g = -1) : p[1] === void 0 ? g = -2 : (g = o.lastIndex - p[2].length, u = p[1], o = p[3] === void 0 ? bt : p[3] === '"' ? yi : gi) : o === yi || o === gi ? o = bt : o === fi || o === mi ? o = Bt : (o = bt, r = void 0);
    const f = o === bt && t[a + 1].startsWith("/>") ? " " : "";
    n += o === Bt ? l + Os : g >= 0 ? (s.push(u), l.slice(0, g) + Gi + l.slice(g) + dt + f) : l + dt + (g === -2 ? a : f);
  }
  return [Zi(t, n + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class Kt {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [u, p] = Is(e, i);
    if (this.el = Kt.createElement(u, s), xt.currentNode = this.el.content, i === 2 || i === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (r = xt.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const g of r.getAttributeNames()) if (g.endsWith(Gi)) {
          const _ = p[o++], f = r.getAttribute(g).split(dt), b = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: n, name: b[2], strings: f, ctor: b[1] === "." ? Ns : b[1] === "?" ? Ts : b[1] === "@" ? js : ge }), r.removeAttribute(g);
        } else g.startsWith(dt) && (l.push({ type: 6, index: n }), r.removeAttribute(g));
        if (Yi.test(r.tagName)) {
          const g = r.textContent.split(dt), _ = g.length - 1;
          if (_ > 0) {
            r.textContent = ue ? ue.emptyScript : "";
            for (let f = 0; f < _; f++) r.append(g[f], Vt()), xt.nextNode(), l.push({ type: 2, index: ++n });
            r.append(g[_], Vt());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Xi) l.push({ type: 2, index: n });
      else {
        let g = -1;
        for (; (g = r.data.indexOf(dt, g + 1)) !== -1; ) l.push({ type: 7, index: n }), g += dt.length - 1;
      }
      n++;
    }
  }
  static createElement(e, i) {
    const s = Et.createElement("template");
    return s.innerHTML = e, s;
  }
}
function Tt(t, e, i = t, s) {
  var o, a;
  if (e === Ct) return e;
  let r = s !== void 0 ? (o = i._$Co) == null ? void 0 : o[s] : i._$Cl;
  const n = Jt(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (e = Tt(t, r._$AS(t, e.values), r, s)), e;
}
class zs {
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
    const { el: { content: i }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? Et).importNode(i, !0);
    xt.currentNode = r;
    let n = xt.nextNode(), o = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let u;
        l.type === 2 ? u = new Rt(n, n.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (u = new Ls(n, this, e)), this._$AV.push(u), l = s[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = xt.nextNode(), o++);
    }
    return xt.currentNode = Et, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class Rt {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = Tt(this, e, i), Jt(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== Ct && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ds(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && Jt(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Et.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = Kt.createElement(Zi(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(i);
    else {
      const o = new zs(r, this), a = o.u(this.options);
      o.p(i), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = bi.get(e.strings);
    return i === void 0 && bi.set(e.strings, i = new Kt(e)), i;
  }
  k(e) {
    Je(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const n of e) r === i.length ? i.push(s = new Rt(this.O(Vt()), this.O(Vt()), this, this.options)) : s = i[r], s._$AI(n), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); e !== this._$AB; ) {
      const r = ui(e).nextSibling;
      ui(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var i;
    this._$AM === void 0 && (this._$Cv = e, (i = this._$AP) == null || i.call(this, e));
  }
}
class ge {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(e, i = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = Tt(this, e, i, 0), o = !Jt(e) || e !== this._$AH && e !== Ct, o && (this._$AH = e);
    else {
      const a = e;
      let l, u;
      for (e = n[0], l = 0; l < n.length - 1; l++) u = Tt(this, a[s + l], i, l), u === Ct && (u = this._$AH[l]), o || (o = !Jt(u) || u !== this._$AH[l]), u === h ? e = h : e !== h && (e += (u ?? "") + n[l + 1]), this._$AH[l] = u;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ns extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Ts extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class js extends ge {
  constructor(e, i, s, r, n) {
    super(e, i, s, r, n), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = Tt(this, e, i, 0) ?? h) === Ct) return;
    const s = this._$AH, r = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ls {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Tt(this, e);
  }
}
const Rs = { I: Rt }, Ae = Ht.litHtmlPolyfillSupport;
Ae == null || Ae(Kt, Rt), (Ht.litHtmlVersions ?? (Ht.litHtmlVersions = [])).push("3.3.3");
const Us = (t, e, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new Rt(e.insertBefore(Vt(), n), n, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = globalThis;
let O = class extends It {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Us(i, this.renderRoot, this.renderOptions);
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
    return Ct;
  }
};
var Vi;
O._$litElement$ = !0, O.finalized = !0, (Vi = wt.litElementHydrateSupport) == null || Vi.call(wt, { LitElement: O });
const Ee = wt.litElementPolyfillSupport;
Ee == null || Ee({ LitElement: O });
(wt.litElementVersions ?? (wt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bs = { CHILD: 2 }, ts = (t) => (...e) => ({ _$litDirective$: t, values: e });
let es = class {
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
const { I: Fs } = Rs, vi = (t) => t, $i = () => document.createComment(""), Ft = (t, e, i) => {
  var n;
  const s = t._$AA.parentNode, r = e === void 0 ? t._$AB : e._$AA;
  if (i === void 0) {
    const o = s.insertBefore($i(), r), a = s.insertBefore($i(), r);
    i = new Fs(o, a, t, t.options);
  } else {
    const o = i._$AB.nextSibling, a = i._$AM, l = a !== t;
    if (l) {
      let u;
      (n = i._$AQ) == null || n.call(i, t), i._$AM = t, i._$AP !== void 0 && (u = t._$AU) !== a._$AU && i._$AP(u);
    }
    if (o !== r || l) {
      let u = i._$AA;
      for (; u !== o; ) {
        const p = vi(u).nextSibling;
        vi(s).insertBefore(u, r), u = p;
      }
    }
  }
  return i;
}, vt = (t, e, i = t) => (t._$AI(e, i), t), Ws = {}, is = (t, e = Ws) => t._$AH = e, Hs = (t) => t._$AH, Ce = (t) => {
  t._$AR(), t._$AA.remove();
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ss = ts(class extends es {
  constructor() {
    super(...arguments), this.key = h;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, i]) {
    return e !== this.key && (is(t), this.key = e), i;
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
const qs = { attribute: !0, type: String, converter: pe, reflect: !1, hasChanged: Ve }, Vs = (t = qs, e, i) => {
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
  return (e, i) => typeof i == "object" ? Vs(t, e, i) : ((s, r, n) => {
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
const xi = (t, e, i) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = e; r <= i; r++) s.set(t[r], r);
  return s;
}, Js = ts(class extends es {
  constructor(t) {
    if (super(t), t.type !== Bs.CHILD) throw Error("repeat() can only be used in text expressions");
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
    const r = Hs(t), { values: n, keys: o } = this.dt(e, i, s);
    if (!Array.isArray(r)) return this.ut = o, n;
    const a = this.ut ?? (this.ut = []), l = [];
    let u, p, g = 0, _ = r.length - 1, f = 0, b = n.length - 1;
    for (; g <= _ && f <= b; ) if (r[g] === null) g++;
    else if (r[_] === null) _--;
    else if (a[g] === o[f]) l[f] = vt(r[g], n[f]), g++, f++;
    else if (a[_] === o[b]) l[b] = vt(r[_], n[b]), _--, b--;
    else if (a[g] === o[b]) l[b] = vt(r[g], n[b]), Ft(t, l[b + 1], r[g]), g++, b--;
    else if (a[_] === o[f]) l[f] = vt(r[_], n[f]), Ft(t, r[g], r[_]), _--, f++;
    else if (u === void 0 && (u = xi(o, f, b), p = xi(a, g, _)), u.has(a[g])) if (u.has(a[_])) {
      const x = p.get(o[f]), A = x !== void 0 ? r[x] : null;
      if (A === null) {
        const m = Ft(t, r[g]);
        vt(m, n[f]), l[f] = m;
      } else l[f] = vt(A, n[f]), Ft(t, r[g], A), r[x] = null;
      f++;
    } else Ce(r[_]), _--;
    else Ce(r[g]), g++;
    for (; f <= b; ) {
      const x = Ft(t, l[b + 1]);
      vt(x, n[f]), l[f++] = x;
    }
    for (; g <= _; ) {
      const x = r[g++];
      x !== null && Ce(x);
    }
    return this.ut = o, is(t, l), Ct;
  }
}), Ks = {
  edited: "Changed",
  active_key: "Active",
  undo: "Undo",
  cut: "Split",
  copy_to: "Copy to…",
  copy_go: "Copy",
  replace: "Replace",
  skip_day: "Do not copy this day",
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
}, Gs = {
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
function F(t) {
  return t.startsWith("fr") ? Gs : Ks;
}
function d(t, e, i = {}) {
  let s = F(t)[e];
  for (const [r, n] of Object.entries(i)) s = s.replace(`{${r}}`, n);
  return s;
}
const _e = 5, S = 1440;
function kt(t) {
  const [e, i] = t.split(":").map(Number);
  return e * 60 + i;
}
function Gt(t) {
  const e = Math.max(0, Math.min(S, Math.round(t / _e) * _e));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function St(t, e) {
  var o, a;
  const i = typeof t == "string" ? new Date(t) : t, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((o = s.find((l) => l.type === "hour")) == null ? void 0 : o.value) ?? 0), n = Number(((a = s.find((l) => l.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return r * 60 + n;
}
function ce(t, e) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: e, weekday: "short" }).format(t);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function ht(t, e) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: e }).format(t);
}
function mt(t) {
  return !t || !("time" in t) ? null : kt(t.time);
}
function rs(t) {
  const e = [];
  for (const i of t) {
    const s = mt(i.start), r = mt(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && e.push({ slot: i, end: r });
  }
  return e;
}
function Ke(t, e) {
  const i = (Math.round(e) % S + S) % S, s = Math.floor(i / 60), r = i % 60;
  if (t.toLowerCase().startsWith("fr")) return r ? `${s} h ${String(r).padStart(2, "0")}` : `${s} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, s, r)), o = { timeZone: "UTC", hour: "numeric" };
  return r && (o.minute = "2-digit"), new Intl.DateTimeFormat(t, o).format(n).replace(/\s?(AM|PM)/, (a, l) => ` ${l.toLowerCase()}`);
}
function Xs(t, e, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(t), n = ht(r, e) === ht(s, e), o = Ke(i, St(r, e));
  if (n) return o;
  if (ht(new Date(s.getTime() + 864e5), e) === ht(r, e)) return `${new Intl.RelativeTimeFormat(i, { numeric: "auto" }).format(1, "day")} ${o}`;
  const u = r.getTime() - s.getTime() > 6 * 864e5 ? { timeZone: e, weekday: "short", day: "numeric", month: "short" } : { timeZone: e, weekday: "short" };
  return `${new Intl.DateTimeFormat(i, u).format(r)} ${o}`;
}
var Ys = Object.defineProperty, Qs = Object.getOwnPropertyDescriptor, ct = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qs(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Ys(e, i, r), r;
};
function fe(t) {
  return !t || !("sun" in t) ? null : t.sun === "sunrise" || t.sun === "dawn" ? "up" : "down";
}
let Q = class extends O {
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
  /** A label is only drawn when its span is wide enough for it (never cut off). */
  _fits(t) {
    const e = this.now !== null && this.now >= t.start - 20 && this.now <= t.end + 20, i = Math.max(40, t.label.length * 7 + 14);
    return !this.thin && !e && this._width > 0 && (t.end - t.start) / S * this._width >= i;
  }
  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  _sunIcons() {
    const t = [];
    for (const e of this.spans)
      e.startSun && t.push({ m: e.start, dir: e.startSun }), e.endSun && e.end < S && t.push({ m: e.end, dir: e.endSun });
    return t.map((e) => c`<span class="sunic" style="left:clamp(10px, ${e.m / S * 100}%, calc(100% - 10px))"
      data-sun=${e.dir}><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span>`);
  }
  render() {
    const t = (i) => `${i / S * 100}%`, e = this.now;
    return c`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((i) => i.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((i) => c`<i class="tick" style="left:${t(i * 60)}"></i>`) : h}
          ${this.spans.map(
      (i) => c`<div
              class="span ${i.ignored ? "ignored" : ""}"
              style="left:${t(i.start)};width:${t(Math.max(i.end - i.start, 5))};--c:${i.color}"
              title=${i.label}
            >${this._fits(i) ? c`<span>${i.label}</span>` : h}</div>`
    )}
        </div>
        <div class="icons">${this._sunIcons()}</div>
        <slot></slot>
        ${e !== null ? c`<div class="nowline" style="left:${t(e)}">
          <ha-icon class="nowic" icon="mdi:clock-outline" role="img" aria-label=${d(this.lang, "now")}></ha-icon></div>` : h}
      </div>
      ${this.showHours ? c`<div class="hours">${[0, 6, 12, 18, 24].map((i) => c`<span style="left:${t(i * 60)}">${i} h</span>`)}</div>` : h}
    `;
  }
};
Q.styles = U`
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
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .icons { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
    .sunic {
      position: absolute; top: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; --mdc-icon-size: 14px;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    slot { display: contents; }
    /* the "now" line is drawn over everything, outside the clipped bar; the clock sits just above the bar */
    .nowline {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; z-index: 3; pointer-events: none;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .nowic {
      position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); --mdc-icon-size: 13px;
      color: var(--primary-text-color); display: flex; margin-bottom: 0;
    }
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
ct([
  v({ attribute: !1 })
], Q.prototype, "spans", 2);
ct([
  v({ type: Number })
], Q.prototype, "now", 2);
ct([
  v({ type: Boolean })
], Q.prototype, "thin", 2);
ct([
  v({ type: Boolean, attribute: "show-hours" })
], Q.prototype, "showHours", 2);
ct([
  v({ type: Boolean })
], Q.prototype, "notches", 2);
ct([
  v({ type: Boolean })
], Q.prototype, "tall", 2);
ct([
  v()
], Q.prototype, "lang", 2);
ct([
  $()
], Q.prototype, "_width", 2);
Q = ct([
  B("wp-day-bar")
], Q);
var Zs = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, ye = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? tr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Zs(e, i, r), r;
};
let jt = class extends O {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.wide = !1, this._onKey = (t) => {
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
    var t;
    return this.open ? c`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${(t = document.documentElement.lang) != null && t.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : c``;
  }
};
jt.styles = U`
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
ye([
  v()
], jt.prototype, "heading", 2);
ye([
  v({ type: Boolean, reflect: !0 })
], jt.prototype, "open", 2);
ye([
  v({ type: Boolean })
], jt.prototype, "wide", 2);
jt = ye([
  B("wp-dialog")
], jt);
let ee, $t;
const ie = /* @__PURE__ */ new Set();
function er(t, e) {
  return ie.add(e), ee && e(ee), $t || ($t = t.connection.subscribeMessage(
    (i) => {
      ee = i, ie.forEach((s) => s(i));
    },
    { type: "weekly_planner/subscribe" }
  ), $t.catch(() => {
    $t = void 0;
  })), () => {
    ie.delete(e), ie.size === 0 && $t && ($t.then((i) => i()).catch(() => {
    }), $t = void 0, ee = void 0);
  };
}
const zt = (t) => t.split(".")[0];
function ot(t, e) {
  var s;
  const i = ((s = e.status[t.id]) == null ? void 0 : s.active_profile) ?? t.active_profile;
  return t.profiles.find((r) => r.id === i) ?? t.profiles[0];
}
function _t(t, e) {
  var i;
  return ((i = t.states[e]) == null ? void 0 : i.attributes.friendly_name) ?? e;
}
function wi(t, e) {
  var r, n;
  if (e.program) return t.programs.filter((o) => o.id === e.program);
  const i = (r = e.filter) == null ? void 0 : r.types, s = (n = e.filter) == null ? void 0 : n.area;
  return t.programs.filter((o) => !(i != null && i.length) || o.entities.some((a) => i.includes(zt(a.entity_id)))).filter((o) => !s || o.area === s).sort((o, a) => o.priority - a.priority || o.name.localeCompare(a.name));
}
function Y() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function ir(t, e) {
  return new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e);
}
async function ns() {
  var t, e, i;
  if (customElements.get("ha-selector")) return !0;
  try {
    const s = await ((t = window.loadCardHelpers) == null ? void 0 : t.call(window)), r = await (s == null ? void 0 : s.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((i = (e = r == null ? void 0 : r.constructor) == null ? void 0 : e.getConfigElement) == null ? void 0 : i.call(e)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((n) => setTimeout(n, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const sr = (t) => t.split(".")[0], rr = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let je;
const Pe = /* @__PURE__ */ new Set();
async function be(t, e) {
  const i = [...new Set(e)].filter((s) => !Pe.has(s));
  if (!i.length || !t.loadBackendTranslation) return !1;
  i.forEach((s) => Pe.add(s));
  try {
    const s = await Promise.all(i.map((r) => t.loadBackendTranslation("services", r)));
    return je = s[s.length - 1] ?? je, !0;
  } catch {
    return i.forEach((s) => Pe.delete(s)), !1;
  }
}
function os(t, e) {
  for (const i of [t.localize, je]) {
    const s = i == null ? void 0 : i(e);
    if (s) return s;
  }
  return "";
}
const as = (t, e) => {
  var r, n;
  const [i, s] = e.split(".");
  return (n = (r = t.services) == null ? void 0 : r[i]) == null ? void 0 : n[s];
};
function ls(t, e) {
  var r;
  const [i, s] = e.split(".");
  return os(t, `component.${i}.services.${s}.name`) || ((r = as(t, e)) == null ? void 0 : r.name) || e;
}
function nr(t, e, i) {
  const s = Array.isArray(t) ? t : t ? [t] : [], r = Number((e == null ? void 0 : e.attributes.supported_features) ?? 0);
  return s.some((n) => {
    var a;
    return (n.domain === void 0 ? [] : Array.isArray(n.domain) ? n.domain : [n.domain]).includes(i) ? (a = n.supported_features) != null && a.length ? n.supported_features.some((l) => Array.isArray(l) ? l.every((u) => (r & u) === u) : (r & l) === l) : !0 : !1;
  });
}
function Ge(t, e) {
  const i = sr(e), s = t.states[e], r = [];
  for (const [n, o] of Object.entries(t.services ?? {}))
    if (n !== "homeassistant")
      for (const [a, l] of Object.entries(o)) {
        if (!l.target) continue;
        const u = l.target.entity, p = !u || Array.isArray(u) && !u.length;
        if (!nr(u, s, i) && !(n === i && p) || Object.values(l.fields ?? {}).some((f) => f.required && (!f.selector || "text" in f.selector || "object" in f.selector))) continue;
        const _ = `${n}.${a}`;
        r.push({ id: _, domain: n, service: a, label: ls(t, _) });
      }
  return r.sort((n, o) => n.label.localeCompare(o.label));
}
function or(t, e) {
  return [...new Set(Ge(t, e).map((i) => i.domain))];
}
function Xe(t, e) {
  var o;
  const [i, s] = e.split("."), r = [], n = (a) => {
    var l;
    for (const [u, p] of Object.entries(a ?? {})) {
      if (p.fields) {
        n(p.fields);
        continue;
      }
      p.advanced || rr.has(u) || (l = p.selector) != null && l.target || r.push({
        key: u,
        selector: p.selector ?? { text: {} },
        required: !!p.required,
        default: p.default,
        label: os(t, `component.${i}.services.${s}.fields.${u}.name`) || p.name || u
      });
    }
  };
  return n((o = as(t, e)) == null ? void 0 : o.fields), [...r.filter((a) => a.required), ...r.filter((a) => !a.required)];
}
const ar = /* @__PURE__ */ new Set(["avec", "de", "du", "à", "au", "with", "of", "the", "for", "on"]);
function lr(t) {
  if (t.length < 3) return t;
  const e = t.map((n) => n.split(" ")), i = /* @__PURE__ */ new Map();
  for (const n of e) i.set(n[n.length - 1], (i.get(n[n.length - 1]) ?? 0) + 1);
  const [s, r] = [...i.entries()].sort((n, o) => o[1] - n[1])[0];
  return r < Math.ceil(t.length * 0.6) ? t : e.map((n, o) => {
    if (n.length < 2 || n[n.length - 1] !== s) return t[o];
    const a = n.slice(0, -1);
    for (; a.length > 1 && ar.has(a[a.length - 1].toLowerCase()); ) a.pop();
    return a.join(" ");
  });
}
function cr(t, e, i) {
  var n;
  const s = ((n = t.states[i]) == null ? void 0 : n.attributes) ?? {}, r = {};
  for (const o of Xe(t, e)) {
    if (!o.required) continue;
    const a = o.selector.number;
    o.default !== void 0 ? r[o.key] = o.default : o.key === "temperature" ? r[o.key] = typeof s.temperature == "number" ? s.temperature : 19 : a && (r[o.key] = o.key === "position" ? 50 : a.min ?? 0);
  }
  return r;
}
function cs(t, e, i) {
  return Xe(t, e).filter((s) => s.required && ((i == null ? void 0 : i[s.key]) === void 0 || i[s.key] === "" || i[s.key] === null)).map((s) => s.label);
}
const qt = [
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
function dr(t) {
  const e = new Set(t.map((i) => i.color.toLowerCase()));
  return qt.find((i) => !e.has(i)) ?? qt[t.length % qt.length];
}
const W = (t, e) => e ? t.labels.find((i) => i.id === e) : void 0;
function hr(t, e) {
  return Object.values(t.states).filter((i) => i.entity_id.startsWith("scene.") && Array.isArray(i.attributes.entity_id) && i.attributes.entity_id.includes(e)).sort((i, s) => String(i.attributes.friendly_name ?? i.entity_id).localeCompare(String(s.attributes.friendly_name ?? s.entity_id)));
}
function pr(t, e, i) {
  var s;
  if (i.kind === "scene") {
    const r = (s = t.states[i.scene]) == null ? void 0 : s.attributes.entity_id;
    return Array.isArray(r) ? r.includes(e) : !0;
  }
  return i.service.split(".")[0] === e.split(".")[0] ? !0 : Ge(t, e).some((r) => r.id === i.service);
}
function Ye(t, e, i) {
  return e.labels.filter((s) => i.some((r) => pr(t, r, s.action)));
}
function pt(t, e, i) {
  var r, n;
  return i ? ((n = (r = t.entities.find((o) => o.entity_id === e)) == null ? void 0 : r.label_overrides) == null ? void 0 : n[i.id]) ?? i.action : void 0;
}
const ki = (t, e, i) => {
  var s, r;
  return !!((r = (s = t.entities.find((n) => n.entity_id === e)) == null ? void 0 : s.label_overrides) != null && r[i]);
}, Nt = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function Si(t) {
  if (!t || t.kind !== "service") return null;
  const e = t.data ?? {};
  return Nt(e.temperature) ?? Nt(e.position) ?? Nt(e.brightness_pct);
}
function Qe(t, e, i) {
  var r;
  if (!i) return "";
  if (i.kind === "scene") return String(((r = t.states[i.scene]) == null ? void 0 : r.attributes.friendly_name) ?? i.scene);
  const s = i.data ?? {};
  return Nt(s.temperature) !== null ? `${ir(e, Number(s.temperature))} °C` : Nt(s.position) !== null ? `${s.position} %` : Nt(s.brightness_pct) !== null ? `${s.brightness_pct} %` : ls(t, i.service);
}
function de(t, e) {
  return t.programs.filter((i) => i.entities.some((s) => s.default_label === e || e in (s.label_overrides ?? {})) || i.profiles.some((s) => s.days.some((r) => r.some((n) => n.label === e)))).map((i) => i.name);
}
var ur = Object.defineProperty, _r = Object.getOwnPropertyDescriptor, et = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? _r(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && ur(e, i, r), r;
};
const gt = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? (t == null ? void 0 : t.language) ?? "en";
};
function fr(t, e) {
  const i = F(t)[`type_${e}`];
  return typeof i == "string" ? i : e;
}
const it = U`
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
function ds(t, e, i) {
  t.dispatchEvent(new CustomEvent(e, { detail: i, bubbles: !0, composed: !0 }));
}
let lt = class extends O {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var t;
    return Object.keys(((t = this.hass) == null ? void 0 : t.states) ?? {}).filter((e) => !this.domains.length || this.domains.includes(zt(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
  }
  _emit(t) {
    ds(this, "wp-change", t);
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
        ${this.label ? c`<label>${this.label}</label>` : h}
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
          ${t.map((e) => c`<option value=${e}>${_t(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
  }
};
lt.styles = [it, U`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
et([
  v({ attribute: !1 })
], lt.prototype, "hass", 2);
et([
  v()
], lt.prototype, "value", 2);
et([
  v()
], lt.prototype, "label", 2);
et([
  v({ attribute: !1 })
], lt.prototype, "domains", 2);
et([
  v({ attribute: !1 })
], lt.prototype, "exclude", 2);
et([
  v({ attribute: !1 })
], lt.prototype, "filter", 2);
lt = et([
  B("wp-entity-picker")
], lt);
let Xt = class extends O {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return gt(this.hass);
  }
  _tr(t) {
    return d(this._lang, t);
  }
  _set(t) {
    ds(this, "wp-change", t);
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
Xt.styles = it;
et([
  v({ attribute: !1 })
], Xt.prototype, "hass", 2);
et([
  v({ attribute: !1 })
], Xt.prototype, "conditions", 2);
Xt = et([
  B("wp-conditions-editor")
], Xt);
var mr = Object.defineProperty, gr = Object.getOwnPropertyDescriptor, Mt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? gr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && mr(e, i, r), r;
};
let H = class extends O {
  constructor() {
    super(...arguments), this.entityId = "", this.action = null, this.disabled = !1, this._more = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return gt(this.hass);
  }
  updated() {
    !this.hass || !this.entityId || this._loadedFor === this.entityId || (this._loadedFor = this.entityId, be(this.hass, or(this.hass, this.entityId)).then((t) => t && this.requestUpdate()), this._selector || ns().then((t) => this._selector = t));
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
  render() {
    var _, f;
    if (!this.hass || !this.entityId) return h;
    const t = this._lang, e = Ge(this.hass, this.entityId), i = lr(e.map((b) => b.label)), s = e.map((b, x) => ({ ...b, label: i[x] })), r = ((_ = this.action) == null ? void 0 : _.kind) === "service" ? this.action.service : "", n = s.findIndex((b) => b.id === r), o = this._more || n >= H.SHOWN, a = o ? s : s.slice(0, H.SHOWN), l = ((f = this.action) == null ? void 0 : f.kind) === "service" ? this.action.data ?? {} : {}, u = r ? Xe(this.hass, r) : [], p = hr(this.hass, this.entityId), g = (b, x, A, m) => c`
      <button class="chip ${x ? "on" : ""}" role="radio" aria-checked=${x} ?disabled=${this.disabled} @click=${A}>
        ${m ? c`<ha-icon icon=${m}></ha-icon>` : h}<span>${b}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${d(t, "action")}>
        ${a.map((b) => g(b.label, b.id === r, () => this._emit({ kind: "service", service: b.id, data: cr(this.hass, b.id, this.entityId) })))}
        ${!o && s.length > H.SHOWN ? c`<button class="chip add" ?disabled=${this.disabled} @click=${() => this._more = !0}>${d(t, "more_actions")}</button>` : h}
        ${p.map((b) => {
      var x;
      return g(
        String(b.attributes.friendly_name ?? b.entity_id),
        ((x = this.action) == null ? void 0 : x.kind) === "scene" && this.action.scene === b.entity_id,
        () => this._emit({ kind: "scene", scene: b.entity_id }),
        "mdi:palette-outline"
      );
    })}
      </div>
      ${u.map((b) => this._selector ? c`<ha-selector class="fld" .hass=${this.hass} .selector=${b.selector} .value=${l[b.key]} .label=${b.label}
            .required=${b.required} ?disabled=${this.disabled}
            @value-changed=${(x) => {
      x.stopPropagation(), this._setData(b.key, x.detail.value);
    }}></ha-selector>` : c`<div class="field"><label>${b.label}</label><input type="text" .value=${String(l[b.key] ?? "")} ?disabled=${this.disabled}
            @change=${(x) => this._setData(b.key, x.target.value)} /></div>`)}`;
  }
};
H.SHOWN = 8;
H.styles = [it, U`
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
Mt([
  v({ attribute: !1 })
], H.prototype, "hass", 2);
Mt([
  v({ attribute: "entity-id" })
], H.prototype, "entityId", 2);
Mt([
  v({ attribute: !1 })
], H.prototype, "action", 2);
Mt([
  v({ type: Boolean })
], H.prototype, "disabled", 2);
Mt([
  $()
], H.prototype, "_more", 2);
Mt([
  $()
], H.prototype, "_selector", 2);
H = Mt([
  B("wp-action-picker")
], H);
var yr = Object.defineProperty, br = Object.getOwnPropertyDescriptor, N = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? br(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && yr(e, i, r), r;
};
let D = class extends O {
  constructor() {
    super(...arguments), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this._creating = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._error = "", this._saving = !1, this._valueFor = null;
  }
  get _lang() {
    return gt(this.hass);
  }
  _emit(t, e) {
    this.dispatchEvent(new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }));
  }
  /** Edits the chosen label in place: name, colour and action (the label is shared by every program). */
  _startEdit() {
    const t = W(this.data, this.value);
    t && (this._creating = !0, this._editId = t.id, this._name = t.name, this._color = t.color, this._action = structuredClone(t.action), this._error = "");
  }
  _startCreate() {
    this._editId = null, this._creating = !0, this._name = "", this._color = dr(this.data.labels), this._action = null, this._error = "";
  }
  get _formProblem() {
    const t = this._lang;
    return this._name.trim() ? this._action ? this._action.kind === "service" && cs(this.hass, this._action.service, this._action.data).length ? d(t, "lb_err_fields") : "" : d(t, "lb_err_action") : d(t, "lb_err_name");
  }
  async _create() {
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
      this._creating = !1, this._emit("label-change", e.label.id);
    } catch (e) {
      const i = e;
      this._error = (i == null ? void 0 : i.code) === "unauthorized" ? d(this._lang, "err_unauthorized") : d(this._lang, "lb_err_save");
    } finally {
      this._saving = !1;
    }
  }
  _valueEditor(t) {
    const e = this._lang, i = W(this.data, this.value);
    if (!i) return h;
    const s = pt(this.program, t, i) ?? null;
    return c`<div class="valbox">
      <wp-action-picker .hass=${this.hass} entity-id=${t} .action=${s} ?disabled=${this.disabled}
        @action-change=${(r) => {
      r.stopPropagation(), this._emit("override-change", { entityId: t, labelId: i.id, action: r.detail });
    }}></wp-action-picker>
      ${ki(this.program, t, i.id) ? c`<button class="btn" ?disabled=${this.disabled}
            @click=${() => this._emit("override-change", { entityId: t, labelId: i.id, action: null })}>
            <ha-icon icon="mdi:undo"></ha-icon>${d(e, "lb_common_value")}</button>` : h}
    </div>`;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const t = this._lang, e = Ye(this.hass, this.data, this.entityIds), i = W(this.data, this.value), s = (r, n, o, a) => c`
      <button class="chip ${n ? "on" : ""}" role="radio" aria-checked=${n} ?disabled=${this.disabled} @click=${o}>
        ${a ? c`<i class="dot" style="background:${a}"></i>` : h}<span>${r}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${d(t, "action")}>
        ${this.allowNone ? s(d(t, "rest_none"), this.value === null, () => this._emit("label-change", null)) : h}
        ${e.map((r) => s(r.name, r.id === this.value, () => this._emit("label-change", r.id), r.color))}
        ${this.value && !i ? s("?", !0, () => {
    }) : h}
        ${this.compact ? h : c`<button class="chip add" ?disabled=${this.disabled} @click=${() => this._startCreate()}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${d(t, "lb_new")}</span></button>`}
      </div>
      ${i && !this.compact && !this._creating ? c`<div class="edit">
        <button class="pen" aria-label=${d(t, "rename_label")} title=${d(t, "rename_label")} ?disabled=${this.disabled}
          @click=${() => this._startEdit()}><ha-icon icon="mdi:pencil"></ha-icon></button>
        ${de(this.data, i.id).some((r) => r !== this.program.name) ? c`<span class="shared">${d(t, "shared")}</span>` : h}
      </div>` : h}
      ${this._creating ? c`<div class="form">
        <div class="field"><label for="lb-name">${d(t, "lb_name")}</label>
          <input id="lb-name" type="text" maxlength="30" .value=${this._name}
            @input=${(r) => {
      this._name = r.target.value, this._error = "";
    }} /></div>
        <div class="swatches" role="radiogroup" aria-label=${d(t, "lb_color")}>
          ${qt.map((r) => c`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
            aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
        </div>
        <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .action=${this._action}
          @action-change=${(r) => {
      r.stopPropagation(), this._action = r.detail, this._error = "";
    }}></wp-action-picker>
        ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : h}
        <div class="btns">
          <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._create()}>${d(t, "save")}</button>
          <button class="btn" @click=${() => this._creating = !1}>${d(t, "cancel")}</button>
        </div>
      </div>` : h}
      ${i && !this._creating && !this.compact ? c`
        ${this.entityIds.map((r) => {
      const n = this._valueFor === r, o = ki(this.program, r, i.id);
      return c`<div class="dev">
            <div class="sum"><span class="what">${Qe(this.hass, t, pt(this.program, r, i))}</span>
              ${this.entityIds.length > 1 ? c`<span class="who">${_t(this.hass, r)}</span>` : h}</div>
            <button class="link ${o ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${n}
              @click=${() => this._valueFor = n ? null : r}>${d(t, "lb_value_here")}</button>
            ${n ? this._valueEditor(r) : h}
          </div>`;
    })}` : h}`;
  }
};
D.styles = [it, U`
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
    .edit { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .pen {
      width: 48px; height: 48px; border: none; border-radius: 24px; background: none; color: var(--secondary-text-color);
      cursor: pointer; --mdc-icon-size: 20px; display: inline-flex; align-items: center; justify-content: center;
    }
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
N([
  v({ attribute: !1 })
], D.prototype, "hass", 2);
N([
  v({ attribute: !1 })
], D.prototype, "data", 2);
N([
  v({ attribute: !1 })
], D.prototype, "program", 2);
N([
  v({ attribute: !1 })
], D.prototype, "entityIds", 2);
N([
  v({ attribute: !1 })
], D.prototype, "value", 2);
N([
  v({ type: Boolean, attribute: "allow-none" })
], D.prototype, "allowNone", 2);
N([
  v({ type: Boolean })
], D.prototype, "disabled", 2);
N([
  v({ type: Boolean })
], D.prototype, "compact", 2);
N([
  $()
], D.prototype, "_creating", 2);
N([
  $()
], D.prototype, "_editId", 2);
N([
  $()
], D.prototype, "_name", 2);
N([
  $()
], D.prototype, "_color", 2);
N([
  $()
], D.prototype, "_action", 2);
N([
  $()
], D.prototype, "_error", 2);
N([
  $()
], D.prototype, "_saving", 2);
N([
  $()
], D.prototype, "_valueFor", 2);
D = N([
  B("wp-label-picker")
], D);
const hs = " ", Le = (t) => t.replace(/ /g, hs), Me = (t, e) => JSON.stringify(t) === JSON.stringify(e), vr = (t, e) => {
  const i = Math.abs(e), s = i < 60 ? `${i} min` : i % 60 ? `${Math.floor(i / 60)} h ${String(i % 60).padStart(2, "0")}` : `${i / 60} h`;
  return `${e > 0 ? "+" : "−"}${s}`;
};
function Re(t, e, i) {
  if ("time" in e) {
    const [n, o] = e.time.split(":").map(Number);
    return Le(n * 60 + o >= S ? "24 h" : Ke(t, n * 60 + o));
  }
  const s = d(t, e.sun === "sunrise" || e.sun === "sunset" ? `sun_${e.sun}_short` : `sun_${e.sun}`), r = e.offset ? ` ${vr(t, e.offset)}` : "";
  return Le(`${s}${r}`);
}
function Ai(t, e) {
  if ("time" in t) {
    const [i, s] = t.time.split(":").map(Number), r = Math.max(0, Math.min(S, Math.round((i * 60 + s + e) / _e) * _e));
    return { time: r >= S ? "24:00" : `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}` };
  }
  return { ...t, offset: Math.max(-240, Math.min(240, (t.offset ?? 0) + e)) };
}
const ps = [0, 1, 2, 3, 4], us = [5, 6], ve = [0, 1, 2, 3, 4, 5, 6];
function $r(t, e, i) {
  const s = [...i].sort((r, n) => r - n);
  return Me(s, ve) ? d(t, "all_days_text") : Me(s, ps) ? `${e[0]}–${e[4]}` : Me(s, us) ? d(t, "weekend") : s.map((r) => e[r]).join(hs);
}
function Ue(t) {
  if (Array.isArray(t)) return `[${t.map(Ue).join(",")}]`;
  if (t && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((i) => `${JSON.stringify(i)}:${Ue(e[i])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function Be(t) {
  const { id: e, ...i } = t;
  return Ue({ ...i, conditions: t.conditions ?? [], end: t.end ?? null, color: t.color ?? null });
}
function Ze(t, e, i) {
  const s = /* @__PURE__ */ new Map();
  return t.days.forEach((r, n) => {
    for (const o of r) {
      if (!e(o)) continue;
      const a = Be(o);
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
function xr(t, e, i, s) {
  const r = t.days.map((n) => n.filter((o) => !i(o)));
  for (const n of e)
    for (const o of n.days)
      r[o].push({ ...structuredClone(n.slot), id: n.ids[o] ?? Y() });
  return { ...t, days: r.map((n) => n.sort((o, a) => s(o.start) - s(a.start))) };
}
const wr = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, kr = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function he(t, e) {
  var r;
  if ("time" in e) return kt(e.time);
  const i = (r = t.states["sun.sun"]) == null ? void 0 : r.attributes[wr[e.sun]];
  let s = i ? St(i, t.config.time_zone) : kr[e.sun];
  return s += e.offset ?? 0, e.earliest && (s = Math.max(s, kt(e.earliest))), e.latest && (s = Math.min(s, kt(e.latest))), Math.max(0, Math.min(S, s));
}
function Sr(t) {
  const e = mt(t.start);
  if (e === null || !t.end) return null;
  const i = mt(t.end);
  return i === null ? null : i > e ? [e, i] : [e, S];
}
function _s(t) {
  var r, n;
  const e = t.map((o) => ({ slot: o, iv: Sr(o) })).filter((o) => o.iv !== null).sort((o, a) => o.iv[0] - a.iv[0]);
  let i = ((r = e[0]) == null ? void 0 : r.iv[1]) ?? 0, s = (n = e[0]) == null ? void 0 : n.slot;
  for (let o = 1; o < e.length; o++) {
    if (e[o].iv[0] < i) return [s, e[o].slot];
    e[o].iv[1] > i && (i = e[o].iv[1], s = e[o].slot);
  }
  return null;
}
const Ei = (t) => t.ids[t.days[0]], fs = (t, e) => e !== null && Object.values(t.ids).includes(e);
function Ar(t, e, i, s) {
  return Ze(t, e, i).find((r) => fs(r, s)) ?? null;
}
function Er(t, e) {
  return t ? Be(t.slot) !== Be(e.slot) ? "changed" : JSON.stringify(t.days) === JSON.stringify(e.days) && JSON.stringify(t.ids) === JSON.stringify(e.ids) ? "same" : "days" : "gone";
}
function Ci(t, e) {
  const { [e]: i, ...s } = t.ids;
  return {
    draft: { slot: structuredClone(t.slot), days: [e], ids: i ? { [e]: i } : {} },
    rest: { slot: structuredClone(t.slot), days: t.days.filter((r) => r !== e), ids: s }
  };
}
function Cr(t, e) {
  if (!t) return [];
  const i = t.days.filter((r) => !e.includes(r)), s = Object.fromEntries(i.filter((r) => t.ids[r]).map((r) => [r, t.ids[r]]));
  return i.length ? [{ ...t, days: i, ids: s }] : [];
}
function Oe(t, e, i, s) {
  var n;
  const r = Ze(t, e, i).filter((o) => !fs(o, s.openId));
  return r.push(...Cr(s.rest, ((n = s.draft) == null ? void 0 : n.days) ?? [])), s.draft && r.push(s.draft), xr(t, r, e, i);
}
function Pr(t) {
  const e = t.days.findIndex((i) => _s(i));
  return e < 0 ? null : e;
}
function Mr(t, e, i, s, r = ve) {
  const n = [], o = [];
  for (const a of r) {
    const l = { ...s, id: "__new__" };
    (_s([...t.days[a].filter(e), l]) ? o : n).push(a);
  }
  return { free: n, busy: o };
}
const Pi = 5;
function Or(t, e) {
  let i = 480;
  t.length && (i = Math.max(...t.map((r) => e(r.end ?? r.start))), i = Math.ceil(i / Pi) * Pi);
  const s = Math.min(i, S - 60);
  return { start: Gt(s), end: Gt(Math.min(S, s + 60)) };
}
function Mi(t, e, i = { start: "08:00", end: "09:00" }) {
  return { slot: { id: Y(), start: { time: i.start }, end: { time: i.end }, conditions: [], label: t }, days: [...e], ids: {}, fresh: !0 };
}
const ft = 15, ms = (t) => Math.round(t / ft) * ft, ti = (t, e, i) => Math.max(e, Math.min(i, t));
function at(t) {
  const e = ti(Math.round(t), 0, S);
  return { time: `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}` };
}
function L(t, e) {
  const i = e(t.start);
  if (!t.end) return { start: i, end: null, wrap: !1 };
  const s = e(t.end);
  return s > i ? { start: i, end: s, wrap: !1 } : { start: i, end: S, wrap: !0 };
}
function Oi(t, e) {
  const i = t.map((n) => ({ slot: n, e: L(n, e.at) })).filter((n) => n.e.end !== null).sort((n, o) => n.e.start - o.e.start), s = [];
  let r = e.lead ?? 0;
  for (const { slot: n, e: o } of i)
    o.start > r && s.push({ kind: "gap", start: r, end: o.start }), s.push({ kind: "slot", id: n.id, slot: n, start: o.start, end: o.end, wrap: o.wrap }), r = Math.max(r, o.end);
  return r < S && s.push({ kind: "gap", start: r, end: S }), s;
}
function Fe(t, e) {
  const i = [], s = /* @__PURE__ */ new Map();
  for (const r of t) {
    const n = L(r, e.at);
    if (n.end === null) {
      i.push({ m: n.start, refs: [{ id: r.id, edge: "start" }], oneShot: !0 });
      continue;
    }
    const o = [[n.start, { id: r.id, edge: "start" }]];
    n.wrap || o.push([n.end, { id: r.id, edge: "end" }]);
    for (const [a, l] of o) {
      let u = s.get(a);
      u || (u = { m: a, refs: [], oneShot: !1 }, s.set(a, u), i.push(u)), u.refs.push(l);
    }
  }
  return i.sort((r, n) => r.m - n.m);
}
const Di = (t, e) => t.id === e.id && t.edge === e.edge;
function gs(t, e, i) {
  const s = t.find((n) => n.id === e.id);
  if (!s) return null;
  const r = L(s, i.at);
  return e.edge === "start" ? r.start : r.end;
}
function se(t, e, i, s) {
  const r = t.find((_) => _.id === e.id);
  if (!r) return null;
  const n = L(r, s.at);
  let o, a = 0, l = S;
  if (n.end === null) {
    if (e.edge !== "start") return null;
    o = [e], l = S - ft;
  } else {
    if (e.edge === "end" && n.wrap) return null;
    const _ = Fe(t, s).find((b) => !b.oneShot && b.refs.some((x) => Di(x, e)));
    if (!_) return null;
    o = _.refs;
    const f = _.m;
    f >= (s.lead ?? 0) && (a = s.lead ?? 0);
    for (const b of t) {
      const x = L(b, s.at);
      if (x.end === null) continue;
      const A = [[x.start, { id: b.id, edge: "start" }], [x.end, x.wrap ? null : { id: b.id, edge: "end" }]];
      for (const [m, k] of A)
        k && o.some((j) => Di(j, k)) || (m < f ? a = Math.max(a, m) : m > f && (l = Math.min(l, m)));
    }
    for (const b of o) {
      const x = t.find((m) => m.id === b.id), A = L(x, s.at);
      b.edge === "end" ? a = Math.max(a, A.start + ft) : l = Math.min(l, A.end - ft);
    }
  }
  if (a > l) return { slots: t, m: gs(t, e, s) ?? 0 };
  const u = ti(ms(i), a, l), p = at(u);
  return { slots: t.map((_) => {
    const f = o.find((b) => b.id === _.id);
    return f ? f.edge === "start" ? { ..._, start: p } : { ..._, end: p } : _;
  }), m: u };
}
function We(t, e) {
  return e - t < 2 * ft ? null : ti(ms((t + e) / 2), t + ft, e - ft);
}
function Ii(t, e, i) {
  const s = i.newId ?? $e;
  if (e.kind === "gap") {
    const p = We(e.start, e.end);
    if (p === null || !i.defaultLabel) return null;
    const g = { id: s(), start: at(p), end: at(e.end), conditions: [], label: i.defaultLabel };
    return { slots: Yt([...t, g], i), handle: { id: g.id, edge: "start" } };
  }
  const r = t.find((p) => p.id === e.id);
  if (!r || !r.end) return null;
  const n = L(r, i.at), o = We(n.start, n.end);
  if (o === null) return null;
  const a = { ...structuredClone(r), id: s(), start: at(o) }, l = { ...r, end: at(o) }, u = t.flatMap((p) => p.id === r.id ? [l, a] : [p]);
  return { slots: Yt(u, i), handle: { id: a.id, edge: "start" } };
}
function Dr(t, e, i, s) {
  if (e.kind === "slot") return t.map((n) => n.id === e.id ? { ...n, label: i } : n);
  const r = { id: (s.newId ?? $e)(), start: at(e.start), end: at(e.end), conditions: [], label: i };
  return Yt([...t, r], s);
}
function Ir(t, e) {
  return t.filter((i) => i.id !== e);
}
const $e = () => Y();
function Yt(t, e) {
  return [...t].sort((i, s) => e.at(i.start) - e.at(s.start));
}
const zr = (t, e) => t.label === e.label && me(t.conditions ?? []) === me(e.conditions ?? []) && (t.color ?? null) === (e.color ?? null), me = (t) => JSON.stringify(t);
function ys(t, e, i = /* @__PURE__ */ new Set()) {
  const s = [];
  for (const r of Yt(t, e)) {
    const n = s[s.length - 1];
    if (n && n.end && r.end) {
      const o = L(n, e.at), a = L(r, e.at);
      if (!o.wrap && o.end === a.start && zr(n, r) && !i.has(n.id) && !i.has(r.id)) {
        s[s.length - 1] = { ...n, end: r.end };
        continue;
      }
    }
    s.push(r);
  }
  return s;
}
function Nr(t, e, i, s) {
  const r = s.newId ?? $e, n = [];
  for (const o of t) {
    const a = L(o, s.at);
    if (a.end === null || a.end <= e || a.start >= i) {
      n.push(o);
      continue;
    }
    const l = a.start < e, u = a.end > i;
    l && n.push({ ...o, end: at(e) }), u && n.push({ ...structuredClone(o), id: l ? r() : o.id, start: at(i) });
  }
  return n;
}
function Tr(t, e, i, s) {
  var o;
  const r = (o = t[e.day]) == null ? void 0 : o.find((a) => a.id === e.id);
  if (!r) return [];
  const n = L(r, s.at);
  return n.end === null ? [] : i.filter((a) => a !== e.day && t[a].some((l) => {
    const u = L(l, s.at);
    return u.end !== null && u.start < n.end && u.end > n.start;
  }));
}
function jr(t, e, i, s, r = []) {
  var l;
  const n = (l = t[e.day]) == null ? void 0 : l.find((u) => u.id === e.id);
  if (!n) return t;
  const o = s.newId ?? $e, a = L(n, s.at);
  return t.map((u, p) => {
    if (!i.includes(p) || p === e.day || r.includes(p)) return u;
    const g = { ...structuredClone(n), id: o() };
    return a.end === null ? u.some((f) => !f.end && me(f.start) === me(n.start) && f.label === n.label) ? u : Yt([...u, g], s) : ys([...Nr(u, a.start, a.end, s), g], s);
  });
}
var Lr = Object.defineProperty, Rr = Object.getOwnPropertyDescriptor, P = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Rr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Lr(e, i, r), r;
};
const Ur = 450, Br = 22, zi = 8, Fr = 700, De = /* @__PURE__ */ new Map(), Wr = (t, e) => t && t.revision > e.revision ? t : e;
let E = class extends O {
  constructor() {
    super(...arguments), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.lang = "en", this.tz = "UTC", this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._hover = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (t) => "time" in t ? kt(t.time) : this._sun.get(JSON.stringify(t)) ?? he(this.hass, t), this._outside = (t) => {
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
    return Wr(De.get(this.program.id), this.program);
  }
  get _baseDay() {
    return ot(this._live, this.data).days[this.weekday] ?? [];
  }
  get _day() {
    return this._draft ?? this._baseDay;
  }
  get _lead() {
    return Math.max(0, ...this.spans.filter((t) => t.spill).map((t) => t.end));
  }
  _ctx(t) {
    var s;
    const e = this.program.entities.find((r) => r.entity_id === this.entityId), i = (s = Ye(this.hass, this.data, [this.entityId])[0]) == null ? void 0 : s.id;
    return {
      at: this._at,
      lead: this._lead,
      newId: t ?? Y,
      defaultLabel: (e == null ? void 0 : e.default_label) ?? i
    };
  }
  willUpdate(t) {
    var e;
    if (t.has("program") || t.has("preview") || t.has("data")) {
      this._sun = /* @__PURE__ */ new Map();
      for (const i of this._baseDay) {
        const s = (e = this.preview) == null ? void 0 : e.find((r) => r.slot_id === i.id);
        s && ("sun" in i.start && this._sun.set(JSON.stringify(i.start), St(s.start, this.tz)), i.end && "sun" in i.end && s.end && this._sun.set(JSON.stringify(i.end), St(s.end, this.tz)));
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
    }, Ur));
  }
  _zoneMove(t) {
    const e = this._press;
    !e || e.id !== t.pointerId || Math.hypot(t.clientX - e.x, t.clientY - e.y) > zi && (window.clearTimeout(e.timer), this._press = void 0);
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
    return { m: (t - ((e == null ? void 0 : e.left) ?? 0)) / i * S, ppm: i / S };
  }
  _nearest(t, e) {
    let i;
    for (const s of Fe(this._day, this._ctx())) {
      const r = Math.abs(s.m - t) * e;
      r <= Br && (!i || r < i.d) && (i = { b: s, d: r });
    }
    return i == null ? void 0 : i.b;
  }
  _segAt(t) {
    const e = Oi(this._day, this._ctx()).find((i) => t >= i.start && t < i.end);
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
      const s = this._baseDay, r = se(s, e.ref, e.m0 + i / this._minuteAt(0).ppm, this._ctx());
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
          const o = se(n[this.weekday], s, r, this._ctx());
          return o ? this._with(n, this.weekday, o.slots) : null;
        }, [this.weekday]);
      } else {
        const s = this._baseDay.find((r) => r.id === e.ref.id);
        s && !s.end && this._select({ kind: "slot", id: s.id });
      }
      return;
    }
    const i = this._tap;
    i && i.id === t.pointerId && (this._tap = void 0, Math.hypot(t.clientX - i.x, t.clientY - i.y) <= zi && i.target && this._select(i.target));
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
    const i = this._draft ?? this._baseDay, s = ((n = this._nudge) == null ? void 0 : n.m) ?? gs(i, e, this._ctx());
    if (s === null) return;
    const r = se(i, e, s + (t.key === "ArrowRight" ? 15 : -15), this._ctx());
    r && (this._draft = r.slots, this._bubble = { m: r.m }, window.clearTimeout((o = this._nudge) == null ? void 0 : o.timer), this._nudge = { ref: e, m: r.m, timer: window.setTimeout(() => this._flushNudge(), Fr) });
  }
  _flushNudge() {
    const t = this._nudge;
    t && (window.clearTimeout(t.timer), this._nudge = void 0, this._bubble = null, this._commit((e) => {
      const i = se(e[this.weekday], t.ref, t.m, this._ctx());
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
      const o = ot(s, this.data), a = o.days, l = t(a);
      if (!l)
        return this._dropDraft(), !1;
      const u = l.map((_, f) => e.includes(f) && _ !== a[f] ? ys(_, this._ctx(), this._keep) : _), p = u.map((_, f) => f).filter((_) => JSON.stringify(u[_]) !== JSON.stringify(a[_]));
      if (!p.length)
        return this._dropDraft(), !0;
      const g = { ...s, profiles: s.profiles.map((_) => _.id === o.id ? { ..._, days: u } : _) };
      this._draft = u[this.weekday] ?? null;
      try {
        const _ = await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(g) });
        if (_ != null && _.program ? (De.set(_.program.id, _.program), this._awaitRev = _.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= _.program.revision && this._dropDraft()) : this._dropDraft(), !i) {
          const f = p.map((b) => [b, a[b]]);
          this._emit("edited", {
            undo: () => this._commit((b) => b.map((x, A) => {
              var m;
              return ((m = f.find((k) => k[0] === A)) == null ? void 0 : m[1]) ?? x;
            }), p, !0)
          });
        }
        return !0;
      } catch (_) {
        const f = _;
        if ((f == null ? void 0 : f.code) === "conflict" && n === 0)
          try {
            const x = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((A) => A.id === s.id);
            if (x) {
              De.set(x.id, x), s = x;
              continue;
            }
          } catch {
          }
        return this._dropDraft(), this._fail((r = f == null ? void 0 : f.message) != null && r.includes("overlapping_slots") ? d(this.lang, "w_err_overlap") : (f == null ? void 0 : f.code) === "unauthorized" ? d(this.lang, "err_unauthorized") : d(this.lang, "ss_err_save")), !1;
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
      const r = L(s, this._at);
      return { target: t, slot: s, start: r.start, end: r.end };
    }
    const i = Oi(e, this._ctx()).find((s) => s.kind === "gap" && s.start === t.start);
    return i ? { target: { kind: "gap", start: i.start, end: i.end }, start: i.start, end: i.end } : null;
  }
  _pickLabel(t) {
    const e = this._sel;
    if (!e || t === null) return;
    const i = Y(), s = e.target;
    this._commit((r) => this._with(r, this.weekday, Dr(r[this.weekday], s, t, this._ctx(() => i))), [this.weekday]), s.kind === "gap" && (this._selected = { kind: "slot", id: i });
  }
  _nothing() {
    const t = this._sel;
    if (!(t != null && t.slot)) return;
    const e = t.slot.id;
    this._selected = null, this._commit((i) => this._with(i, this.weekday, Ir(i[this.weekday], e)), [this.weekday]);
  }
  _cut() {
    const t = this._sel;
    if (!t) return;
    const e = t.target, i = Y(), s = this._ctx(() => i), r = Ii(this._day, e, s);
    r && (this._keep.add(i), e.kind === "slot" && this._keep.add(e.id), this._hsel = r.handle, this._commit((n) => {
      const o = Ii(n[this.weekday], e, this._ctx(() => i));
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
    const e = t.slot.id, i = [...this._copyDays].sort((n, o) => n - o), s = ot(this._live, this.data).days, r = Tr(s, { day: this.weekday, id: e }, i, this._ctx());
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
      const n = jr(r, { day: this.weekday, id: t }, e, this._ctx(), i);
      return n === r ? null : n;
    }, s);
  }
  /* ---- render ---- */
  _spansNow() {
    if (!this._draft) return this.spans;
    const t = this.spans.filter((e) => e.spill);
    for (const e of this._draft) {
      const i = W(this.data, e.label);
      if (!i || !pt(this.program, this.entityId, i)) continue;
      const s = L(e, this._at);
      t.push({
        start: s.start,
        end: s.end ?? s.start + 10,
        color: i.color,
        label: i.name,
        slotId: e.id,
        marker: s.end === null,
        startSun: fe(e.start),
        endSun: e.end ? fe(e.end) : null
      });
    }
    return t;
  }
  _clock(t) {
    return t >= S ? "24 h" : Ke(this.lang, t);
  }
  _overlay_() {
    const t = this._day, e = this._ctx(), i = (n) => `${n / S * 100}%`, s = this._sel, r = Fe(t, e);
    return c`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${s && s.end !== null ? c`<div class="selbox ${s.slot ? "" : "gap"}"
        style="left:${i(s.start)};width:${i(s.end - s.start)}"></div>` : h}
      ${s != null && s.slot && s.end === null ? c`<div class="selpoint" style="left:${i(s.start)}"></div>` : h}
      ${Js(r, (n) => n.refs.map((o) => `${o.id}:${o.edge}`).join("+"), (n) => {
      const o = n.refs[0], a = this._hsel && n.refs.some((l) => {
        var u, p;
        return l.id === ((u = this._hsel) == null ? void 0 : u.id) && l.edge === ((p = this._hsel) == null ? void 0 : p.edge);
      });
      return c`<button class="hd ${n.oneShot ? "dot" : ""} ${a ? "on" : ""}" style="left:clamp(0px, ${i(n.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${n.m}
          aria-valuetext=${this._clock(n.m)} aria-label=${d(this.lang, "handle", { time: this._clock(n.m) })}
          data-h=${n.refs.map((l) => `${l.id}:${l.edge}`).join(" ")}
          @keydown=${(l) => this._key(l, o)} @focus=${() => this._hsel = o}
          ><i></i></button>`;
    })}
      ${this._bubble ? c`<div class="bubble" style="left:clamp(28px, ${i(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : h}
    </div>`;
  }
  _strip() {
    var n;
    const t = this._sel;
    if (!t) return h;
    const e = this.lang, i = this._ctx(), s = t.end !== null && (t.slot ? !!t.slot.end : !!i.defaultLabel) && We(t.start, t.end) !== null, r = F(e).days_short;
    return c`<div class="strip" role="group">
      <wp-label-picker compact .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
        .value=${((n = t.slot) == null ? void 0 : n.label) ?? null} @label-change=${(o) => {
      o.stopPropagation(), this._pickLabel(o.detail);
    }}></wp-label-picker>
      <div class="acts">
        ${t.slot ? c`<button class="act" @click=${() => this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${d(e, "rest_none_short")}</button>` : h}
        <button class="act" ?disabled=${!s} aria-label=${d(e, "cut")} title=${d(e, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${t.slot ? c`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => {
      this._copyOpen = !this._copyOpen, this._copyDays = [];
    }}><ha-icon icon="mdi:content-copy"></ha-icon>${d(e, "copy_to")}</button>` : h}
      </div>
      ${this._copyOpen && t.slot ? c`<div class="copy">
        ${r.map((o, a) => a === this.weekday ? h : c`<button class="dchip ${this._copyDays.includes(a) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(a)} @click=${() => this._toggleDay(a)}>${o}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${d(e, "copy_go")} title=${d(e, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${d(e, "copy_go")}</button>
      </div>` : h}
    </div>`;
  }
  _conflictDialog() {
    const t = this._conflict;
    if (!t) return h;
    const e = this.lang, i = F(e).days, s = (n, o) => {
      this._conflict = { ...t, skip: o ? [...t.skip.filter((a) => a !== n), n] : t.skip.filter((a) => a !== n) };
    }, r = t.to.every((n) => t.skip.includes(n));
    return c`<wp-dialog open heading=${d(e, "conflict_title")} @closed=${(n) => {
      n.stopPropagation(), this._conflict = null;
    }}>
      <div class="cf">
        ${t.days.map((n) => c`<div class="cfrow"><strong>${i[n]}</strong>
          <div class="seg2" role="radiogroup" aria-label=${i[n]}>
            <button role="radio" aria-checked=${!t.skip.includes(n)} class=${t.skip.includes(n) ? "" : "on"} @click=${() => s(n, !1)}>${d(e, "replace")}</button>
            <button role="radio" aria-checked=${t.skip.includes(n)} class=${t.skip.includes(n) ? "on" : ""} @click=${() => s(n, !0)}>${d(e, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${d(e, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${r} @click=${() => void this._doCopy(t.id, t.to, t.skip)}>${d(e, "copy_go")}</button>
    </wp-dialog>`;
  }
  render() {
    return !this.hass || !this.data || !this.program ? h : c`
      <div class="zone ${this.editing ? "editing" : ""}"
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(t) => {
      this._press && !this._press.mouse && t.preventDefault();
    }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${d(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : h}</wp-day-bar>
      </div>
      ${this.editing ? this._strip() : h}
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : h}
      ${this._conflictDialog()}`;
  }
};
E.styles = [it, U`
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
    .seg2 button {
      flex: 1 1 140px; min-height: 48px; padding: 0 12px; border-radius: 24px; border: 1px solid var(--divider-color); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .seg2 button.on { border: 2px solid var(--primary-color); font-weight: 600; }
  `];
P([
  v({ attribute: !1 })
], E.prototype, "hass", 2);
P([
  v({ attribute: !1 })
], E.prototype, "data", 2);
P([
  v({ attribute: !1 })
], E.prototype, "program", 2);
P([
  v({ attribute: "entity-id" })
], E.prototype, "entityId", 2);
P([
  v({ type: Number })
], E.prototype, "weekday", 2);
P([
  v({ attribute: !1 })
], E.prototype, "spans", 2);
P([
  v({ attribute: !1 })
], E.prototype, "preview", 2);
P([
  v({ type: Number })
], E.prototype, "now", 2);
P([
  v({ type: Boolean })
], E.prototype, "editing", 2);
P([
  v({ type: Boolean })
], E.prototype, "editable", 2);
P([
  v({ type: Boolean })
], E.prototype, "hours", 2);
P([
  v()
], E.prototype, "lang", 2);
P([
  v()
], E.prototype, "tz", 2);
P([
  $()
], E.prototype, "_draft", 2);
P([
  $()
], E.prototype, "_selected", 2);
P([
  $()
], E.prototype, "_hsel", 2);
P([
  $()
], E.prototype, "_bubble", 2);
P([
  $()
], E.prototype, "_copyOpen", 2);
P([
  $()
], E.prototype, "_copyDays", 2);
P([
  $()
], E.prototype, "_conflict", 2);
P([
  $()
], E.prototype, "_error", 2);
P([
  $()
], E.prototype, "_hover", 2);
E = P([
  B("wp-bar-editor")
], E);
var Hr = Object.defineProperty, qr = Object.getOwnPropertyDescriptor, Qt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? qr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Hr(e, i, r), r;
};
let Pt = class extends O {
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
Pt.styles = U`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
Qt([
  v()
], Pt.prototype, "message", 2);
Qt([
  v({ attribute: "confirm-label" })
], Pt.prototype, "confirmLabel", 2);
Qt([
  v({ attribute: "cancel-label" })
], Pt.prototype, "cancelLabel", 2);
Qt([
  v()
], Pt.prototype, "lang", 2);
Pt = Qt([
  B("wp-confirm")
], Pt);
function At(t, e, i, s = "") {
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
var Vr = Object.defineProperty, Jr = Object.getOwnPropertyDescriptor, st = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Jr(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Vr(e, i, r), r;
};
let K = class extends O {
  constructor() {
    super(...arguments), this._open = null, this._name = "", this._color = "", this._action = null, this._entity = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return gt(this.hass);
  }
  firstUpdated() {
    const t = this.data.labels.flatMap((e) => e.action.kind === "service" ? [e.action.service.split(".")[0]] : []);
    be(this.hass, t).then((e) => e && this.requestUpdate());
  }
  /** Devices that can serve to choose an action: those of the programs using the label, else all of them. */
  _entities(t) {
    const e = this.data.programs.filter((s) => de(this.data, t.id).includes(s.name)), i = (s) => [...new Set(s.flatMap((r) => r.entities.map((n) => n.entity_id)))];
    return e.length ? i(e) : i(this.data.programs);
  }
  _expand(t) {
    this._open = t.id, this._name = t.name, this._color = t.color, this._action = structuredClone(t.action), this._entity = this._entities(t)[0] ?? "", this._error = "";
  }
  async _save(t) {
    var i;
    const e = this._lang;
    if (!this._name.trim()) {
      this._error = d(e, "lb_err_name");
      return;
    }
    if (((i = this._action) == null ? void 0 : i.kind) === "service" && cs(this.hass, this._action.service, this._action.data).length) {
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
    const e = this._lang, i = de(this.data, t.id);
    if (i.length) {
      this._error = d(e, "lb_in_use", { programs: i.join(", ") });
      return;
    }
    if (await At(this, d(e, "confirm_delete", { name: t.name }), d(e, "delete"), d(e, "cancel")))
      try {
        await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: t.id }), this._open = null;
      } catch (s) {
        const r = s;
        this._error = (r == null ? void 0 : r.code) === "in_use" ? d(e, "lb_in_use", { programs: r.message ?? "" }) : d(e, "lb_err_save");
      }
  }
  render() {
    if (!this.hass || !this.data) return h;
    const t = this._lang;
    return c`<wp-dialog open heading=${d(t, "labels")}>
      ${this.data.labels.length ? h : c`<p class="muted">${d(t, "lb_none")}</p>`}
      <div class="list">
        ${this.data.labels.map((e) => {
      const i = de(this.data, e.id).length;
      if (this._open !== e.id)
        return c`<button class="row" @click=${() => this._expand(e)}>
              <i class="dot" style="background:${e.color}"></i>
              <span class="txt"><b>${e.name}</b><span class="sub">${Qe(this.hass, t, e.action)} · ${d(t, "lb_uses", { n: String(i) })}</span></span>
              <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
      const s = this._entities(e);
      return c`<div class="editor">
            <div class="field"><label for="lbe-name">${d(t, "lb_name")}</label>
              <input id="lbe-name" type="text" maxlength="30" .value=${this._name}
                @input=${(r) => {
        this._name = r.target.value, this._error = "";
      }} /></div>
            <div class="swatches" role="radiogroup" aria-label=${d(t, "lb_color")}>
              ${qt.map((r) => c`<button class="sw ${r === this._color ? "on" : ""}" role="radio" aria-checked=${r === this._color}
                aria-label=${r} style="background:${r}" @click=${() => this._color = r}></button>`)}
            </div>
            ${s.length > 1 ? c`<div class="field"><label for="lbe-ent">${d(t, "lb_device")}</label>
              <select id="lbe-ent" @change=${(r) => this._entity = r.target.value}>
                ${s.map((r) => c`<option value=${r} ?selected=${r === this._entity}>${_t(this.hass, r)}</option>`)}
              </select></div>` : h}
            <wp-action-picker .hass=${this.hass} entity-id=${this._entity} .action=${this._action}
              @action-change=${(r) => {
        r.stopPropagation(), this._action = r.detail, this._error = "";
      }}></wp-action-picker>
            ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : h}
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
K.styles = [it, U`
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
st([
  v({ attribute: !1 })
], K.prototype, "hass", 2);
st([
  v({ attribute: !1 })
], K.prototype, "data", 2);
st([
  $()
], K.prototype, "_open", 2);
st([
  $()
], K.prototype, "_name", 2);
st([
  $()
], K.prototype, "_color", 2);
st([
  $()
], K.prototype, "_action", 2);
st([
  $()
], K.prototype, "_entity", 2);
st([
  $()
], K.prototype, "_error", 2);
st([
  $()
], K.prototype, "_saving", 2);
K = st([
  B("wp-labels")
], K);
const re = 0.5;
function Kr(t, e, i) {
  const s = t.filter((p) => p.end !== null).map((p) => ({ ...p, end: Math.min(p.end, i), start: Math.max(0, p.start) })).filter((p) => p.end > p.start).sort((p, g) => p.start - g.start);
  s.forEach((p, g) => {
    const _ = s[g + 1];
    _ && p.end > _.start && (p.end = _.start);
  });
  const r = [], n = [], o = (p, g) => {
    e != null && e.active && g - p > re && r.push({ from: p, to: g, value: e.value, color: e.color });
  };
  let a = 0;
  s.forEach((p, g) => {
    o(a, p.start), r.push({ from: p.start, to: p.end, value: p.value, color: p.color });
    const _ = s[g + 1];
    p.end < i - re && (!_ || _.start - p.end > re) && (e != null && e.active) && n.push(p.end), a = p.end;
  }), o(a, i);
  const l = r.flatMap((p) => p.value === null ? [] : [{ from: p.from, to: p.to, value: p.value, color: p.color }]), u = [];
  for (let p = 1; p < l.length; p++) {
    const g = l[p - 1], _ = l[p];
    Math.abs(g.to - _.from) <= re && Math.abs(g.value - _.value) > 1e-9 && u.push({ m: _.from, from: g.value, to: _.value, color: _.color });
  }
  return { zones: r, steps: l, risers: u, returns: n };
}
const Gr = /* @__PURE__ */ new Set(["off", "idle", "unavailable", "unknown", "docked", ""]), Ni = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function Xr(t, e, i) {
  if (e === "unavailable" || e === "unknown") return !1;
  switch (t) {
    case "climate": {
      const s = i.hvac_action;
      if (typeof s == "string" && s !== "") return s !== "idle" && s !== "off";
      if (e === "off") return !1;
      const r = Ni(i.temperature), n = Ni(i.current_temperature);
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
      return !Gr.has(e);
  }
}
function Yr(t, e, i) {
  const s = [...t].sort((n, o) => n.m - o.m), r = [];
  return s.forEach((n, o) => {
    const a = Math.max(0, n.m), l = Math.min(i, o + 1 < s.length ? s[o + 1].m : i);
    if (l - a <= 0 || !Xr(e, n.state, n.attrs)) return;
    const u = r[r.length - 1];
    u && Math.abs(u[1] - a) < 0.01 ? u[1] = l : r.push([a, l]);
  }), r;
}
function Qr(t, e, i) {
  const s = [];
  for (const [r, n] of t)
    for (const o of e) {
      const a = Math.max(r, o.from), l = Math.min(n, o.to, i);
      l - a > 0.01 && s.push({ from: a, to: l, color: o.color, value: o.value });
    }
  return s.sort((r, n) => r.from - n.from);
}
var Zr = Object.defineProperty, tn = Object.getOwnPropertyDescriptor, rt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? tn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Zr(e, i, r), r;
};
function Ti(t, e) {
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
function ji(t, e) {
  const [i, s, r] = t.split("-").map(Number), n = Date.UTC(i, s - 1, r), o = n - Ti(n, e);
  return n - Ti(o, e);
}
function bs(t, e) {
  const [i, s, r] = t.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + e)).toISOString().slice(0, 10);
}
function ne(t, e) {
  return { startMs: ji(t, e), endMs: ji(bs(t, 1), e) };
}
function en(t) {
  const [e, i, s] = t.split("-").map(Number);
  return ce(new Date(Date.UTC(e, i - 1, s, 12)), "UTC");
}
const Li = 6e4, Ie = /* @__PURE__ */ new Map();
function ze(t, e, i) {
  const s = Ie.get(t);
  if (s && Date.now() - s.at < e) return s.p;
  const r = i();
  return Ie.set(t, { at: Date.now(), p: r }), r.catch(() => Ie.delete(t)), r;
}
function sn(t) {
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
function rn(t) {
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
function Ri(t, e) {
  const i = Math.floor((e - 8) / 6);
  return i < 4 ? "" : t.length <= i ? t : `${t.slice(0, i - 1)}…`;
}
const nn = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", oe = (t) => t === "unavailable" || t === "unknown" || t === "", ae = (t) => typeof t == "number" && Number.isFinite(t) ? t : null, on = /* @__PURE__ */ new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);
let G = class extends O {
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
    const { startMs: i, endMs: s } = ne(this.date, this._tz), r = Date.now(), n = s > r ? 6e4 : 1 / 0, o = i < r, a = new Date(Math.min(s, r)).toISOString();
    try {
      const l = o ? ze(`h|${t}`, n, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), u = o ? ze(`l|${t}`, n, () => this.hass.callWS({
        type: "logbook/get_events",
        start_time: new Date(i).toISOString(),
        end_time: a,
        entity_ids: [this.entityId]
      })).catch(() => []) : Promise.resolve([]), p = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), g = o ? ze(`j|${this.entityId}|${p}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: p })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, f, b] = await Promise.all([l, u, g]);
      if (e !== this._token) return;
      this._loaded = {
        hist: sn(_[this.entityId]),
        log: rn(f),
        sent: (b.segments ?? []).filter((x) => x.entity_id === this.entityId).map((x) => Date.parse(x.at))
      };
    } catch {
      e === this._token && (this._failed = !0);
    }
  }
  // ---- values ----
  /** What a history point says as numbers: the curves of the device. */
  _live(t) {
    const e = { measured: null, set: null, main: null };
    if (oe(t.s)) return e;
    switch (zt(this.entityId)) {
      case "climate":
        return { measured: ae(t.a.current_temperature), set: t.s === "off" ? null : ae(t.a.temperature), main: null };
      case "cover":
        return { ...e, main: ae(t.a.current_position) ?? (t.s === "open" ? 100 : t.s === "closed" ? 0 : null) };
      case "light": {
        const i = t.s === "on" ? ae(t.a.brightness) : 0;
        return { ...e, main: i === null ? t.s === "on" ? 100 : 0 : i / 255 * 100 };
      }
      default: {
        const i = Number(t.s);
        return { ...e, main: Number.isFinite(i) ? i : null };
      }
    }
  }
  _numeric(t) {
    const e = zt(this.entityId);
    if (["climate", "cover", "light"].includes(e)) return !0;
    const i = t.filter((s) => !oe(s.s));
    return i.length > 0 && i.every((s) => Number.isFinite(Number(s.s)));
  }
  // ---- build ----
  _build(t) {
    var ri, ni;
    const e = this._tz, { startMs: i, endMs: s } = ne(this.date, e), r = Math.round((s - i) / 6e4), n = Date.now(), o = Math.max(0, Math.min(r, (n - i) / 6e4)), a = (y) => (y - i) / 6e4, l = zt(this.entityId), u = ot(this.program, this.data), p = /* @__PURE__ */ new Map();
    for (const y of this.program.profiles) for (const w of y.days.flat()) p.set(w.id, w);
    const g = en(this.date), _ = [];
    for (const { slot: y, end: w } of rs(u.days[(g + 6) % 7])) _.push({ s: 0, e: w, slot: y, spill: !0 });
    if (this.slots)
      for (const y of this.slots) {
        const w = p.get(y.slot_id);
        !w || y.ignored || _.push({ s: Math.max(0, a(Date.parse(y.start))), e: y.end ? Math.min(r, a(Date.parse(y.end))) : null, slot: w });
      }
    else
      for (const y of u.days[g]) {
        const w = mt(y.start);
        if (w === null) continue;
        const C = mt(y.end ?? null);
        _.push({ s: w, e: C === null ? null : C > w ? C : r, slot: y });
      }
    const f = this.program.entities.find((y) => y.entity_id === this.entityId), b = W(this.data, f == null ? void 0 : f.default_label), x = [], A = (y, w, C) => {
      if (!w || y < 0 || y > r) return;
      const T = pt(this.program, this.entityId, w);
      T && x.push({ m: y, label: w, value: Si(T), end: C });
    };
    for (const y of _)
      y.spill || A(y.s, W(this.data, y.slot.label), !1);
    const m = (y) => Si(pt(this.program, this.entityId, y)), k = Kr(
      _.flatMap((y) => {
        const w = W(this.data, y.slot.label);
        return w && pt(this.program, this.entityId, w) ? [{ start: y.s, end: y.e, color: w.color, value: m(w) }] : [];
      }),
      b ? { color: b.color, value: m(b), active: !!pt(this.program, this.entityId, b) } : null,
      r
    );
    for (const y of k.returns) A(y, b, !0);
    const j = Qr(
      Yr(t.hist.map((y) => ({ m: a(y.t), state: y.s, attrs: y.a })), l, o),
      k.zones,
      o
    );
    x.sort((y, w) => y.m - w.m);
    const Ot = this._numeric(t.hist), tt = [], yt = [];
    if (Ot) {
      const y = { measured: [], set: [], main: [] };
      for (const w of t.hist) {
        const C = Math.max(0, a(w.t)), T = this._live(w);
        y.measured.push({ m: C, v: T.measured }), y.set.push({ m: C, v: T.set }), y.main.push({ m: C, v: T.main });
      }
      for (const w of ["measured", "set", "main"])
        y[w].some((C) => C.v !== null) && tt.push({ key: w, pts: y[w] });
    } else
      t.hist.forEach((y, w) => {
        var ai, li;
        const C = Math.max(0, a(y.t)), T = w + 1 < t.hist.length ? a(t.hist[w + 1].t) : o;
        if (T <= C || oe(y.s)) return;
        const J = yt[yt.length - 1];
        if (J && J.state === y.s && Math.abs(J.e - C) < 0.5) {
          J.e = T;
          return;
        }
        const oi = this.hass.states[this.entityId];
        yt.push({
          s: C,
          e: T,
          state: y.s,
          on: on.has(y.s),
          text: oi ? ((li = (ai = this.hass).formatEntityState) == null ? void 0 : li.call(ai, { ...oi, state: y.s, attributes: y.a }, y.s)) ?? y.s : y.s
        });
      });
    const Ut = (y) => t.sent.some((w) => Math.abs(w - y) <= Li), Dt = [];
    let ei = (ri = t.hist[0]) == null ? void 0 : ri.s;
    for (const y of t.log) {
      if (oe(y.state)) continue;
      const w = y.state === ei;
      ei = y.state, (y.user || !y.context && !w && !Ut(y.t)) && Dt.push(a(y.t));
    }
    const vs = l === "climate" ? "set" : l === "light" ? "main" : null, ii = tt.find((y) => y.key === vs), si = [];
    if (ii) {
      let y = null;
      for (const w of ii.pts) {
        if (w.v !== null && y !== null && Math.abs(w.v - y) > 0.01) {
          const C = i + w.m * 6e4;
          si.push(w.m);
          const T = t.log.some((J) => J.context && !J.user && Math.abs(J.t - C) <= Li);
          !Ut(C) && !T && !Dt.some((J) => Math.abs(J - w.m) <= 1) && Dt.push(w.m);
        }
        w.v !== null && (y = w.v);
      }
    }
    Dt.sort((y, w) => y - w);
    const $s = [
      ...x.map((y) => y.m),
      ...t.sent.map(a),
      ...si,
      ...yt.map((y) => y.s),
      ...Dt
    ], we = [];
    for (const y of Dt) {
      if (y <= 1 || y > o) continue;
      const w = $s.filter((T) => T > y + 0.5).sort((T, J) => T - J)[0], C = Math.min(w ?? o, o);
      C > y ? we.push([y, C]) : we.push([y, Math.min(y + 5, r)]);
    }
    let Zt = 0, te = 100;
    if (Ot && l !== "cover" && l !== "light") {
      const y = [...tt.flatMap((w) => w.pts.map((C) => C.v)), ...x.map((w) => w.value), ...k.steps.map((w) => w.value)].filter((w) => w !== null);
      y.length && (Zt = Math.floor(Math.min(...y) - 1), te = Math.ceil(Math.max(...y) + 1), te - Zt < 2 && (te = Zt + 2));
    }
    const xs = l === "climate" ? "°C" : l === "cover" || l === "light" ? "%" : ((ni = this.hass.states[this.entityId]) == null ? void 0 : ni.attributes.unit_of_measurement) ?? "";
    return {
      span: r,
      pastEnd: o,
      isToday: i <= n && n < s,
      kind: Ot ? "curve" : "band",
      lines: tt,
      bands: yt,
      markers: x,
      planned: k,
      shade: j,
      manual: we,
      lo: Zt,
      hi: te,
      unit: xs
    };
  }
  // ---- interaction ----
  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  get _historyPath() {
    const { startMs: t, endMs: e } = ne(this.date, this._tz);
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
    return t.forEach((l, u) => {
      const p = u + 1 < t.length ? t[u + 1].m : e.pastEnd;
      let g = l.m, _ = p;
      if (n && (g = Math.max(g, n[0]), _ = Math.min(_, n[1]), _ < g)) {
        a = !1;
        return;
      }
      if (l.v === null) {
        a = !1;
        return;
      }
      const f = s(l.v);
      r ? o += a ? `V${f.toFixed(1)}H${i(_).toFixed(1)}` : `M${i(g).toFixed(1)},${f.toFixed(1)}H${i(_).toFixed(1)}` : (o += `${a ? "L" : "M"}${i(g).toFixed(1)},${f.toFixed(1)}`, (u + 1 === t.length || n && _ < p) && (o += `L${i(_).toFixed(1)},${f.toFixed(1)}`)), a = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const t = this._lang, e = this._model;
    let i;
    return this._failed ? i = c`<div class="note">${d(t, "no_data")}</div>` : e ? i = this._renderChart(e) : i = c`<div class="note">${d(t, "chart_loading")}</div>`, c`<div class="box">${i}</div>${e ? this._legend(e) : h}`;
  }
  _legend(t) {
    const e = this._lang, i = (r, n, o) => c`<span class="key"><i class=${r} style=${""}></i>${n}</span>`, s = (r) => t.lines.some((n) => n.key === r);
    return c`<div class="legend">
      ${t.markers.length || t.planned.steps.length ? i("planned", d(e, "planned")) : h}
      ${s("measured") ? i("measured", d(e, "measured")) : h}
      ${s("set") ? i("set", d(e, "ch_set")) : h}
      ${t.shade.length ? i("active", d(e, "active_key")) : h}
      ${t.manual.length ? i("manual", d(e, "manual")) : h}
    </div>`;
  }
  _renderChart(t) {
    const e = this._lang, i = this._width, s = t.kind === "curve", r = s ? 150 : 84, n = { l: s ? 38 : 8, r: 10, t: 22, b: 22 }, o = (m) => n.l + m / t.span * (i - n.l - n.r), a = (m) => n.t + (1 - (m - t.lo) / (t.hi - t.lo)) * (r - n.t - n.b), { startMs: l } = ne(this.date, this._tz), u = (m) => new Intl.DateTimeFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" }).format(new Date(l + m * 6e4)), p = [];
    for (let m = 0; m <= t.span; m += 180) p.push(m);
    const g = [];
    if (s) {
      const m = t.hi - t.lo, k = [1, 2, 5, 10, 20, 25, 50].find((j) => m / j <= 4) ?? 100;
      for (let j = Math.ceil(t.lo / k) * k; j <= t.hi + 1e-9; j += k) g.push(j);
    }
    const _ = n.t - 12, f = n.t, b = r - n.t - n.b, x = (m) => {
      const k = s && m.value !== null ? a(m.value) : _, j = m.label.color;
      return z`
        <line class="drop" x1=${o(m.m)} x2=${o(m.m)} y1=${k} y2=${r - n.b}></line>
        <circle class="mk ${m.end ? "end" : ""}" cx=${o(m.m)} cy=${k} r="5" style="--c:${j}"></circle>
        ${m.value !== null ? z`<text class="val" x=${Math.min(Math.max(o(m.m), 14), i - 14)} y=${Math.max(k - 8, 9)} text-anchor="middle">${Number(m.value.toFixed(1))}</text>` : h}`;
    }, A = t.isToday ? z`<line class="now" x1=${o(t.pastEnd)} x2=${o(t.pastEnd)} y1=${n.t - 4} y2=${r - n.b}></line>
        <g class="nowicon" role="img" aria-label=${d(e, "now")} transform="translate(${o(t.pastEnd) - 6}, ${n.t - 17}) scale(0.5)"><title>${d(e, "now")}</title><path d=${nn}></path></g>` : h;
    return c`
      <svg width=${i} height=${r} viewBox="0 0 ${i} ${r}" tabindex="0" role="button"
        aria-label=${d(e, "chart_open", { name: _t(this.hass, this.entityId) })}
        @click=${() => this._open()}
        @keydown=${(m) => {
      (m.key === "Enter" || m.key === " ") && (m.preventDefault(), this._open());
    }}>
        ${g.map((m) => z`<line class="grid" x1=${n.l} x2=${i - n.r} y1=${a(m)} y2=${a(m)}></line>
          <text class="ylab" x=${n.l - 4} y=${a(m) + 3} text-anchor="end">${Number(m.toFixed(t.unit === "°C" ? 1 : 0))}</text>`)}
        ${p.map((m) => z`<text class="xlab" x=${o(m)} y=${r - 6} text-anchor=${m === 0 ? "start" : "middle"}>${Number(u(m))}h</text>`)}
        ${s ? h : z`
          <rect class="track" x=${n.l} y=${f} width=${i - n.l - n.r} height=${b} rx="6"></rect>
          ${t.bands.map((m) => {
      const k = o(m.e) - o(m.s);
      return z`<rect class="band ${m.on ? "on" : ""}" x=${o(m.s)} y=${f} width=${Math.max(1, k)} height=${b}></rect>
              ${Ri(m.text, k) ? z`<text class="btxt" x=${o(m.s) + k / 2} y=${f + b / 2 + 4} text-anchor="middle">${Ri(m.text, k)}</text>` : h}`;
    })}
          ${t.manual.map(([m, k]) => z`<rect class="red-band" x=${o(m)} y=${f} width=${Math.max(3, o(k) - o(m))} height=${b}></rect>`)}`}
        ${s ? t.lines.map((m) => z`<path class="line ${m.key}" d=${this._path(m.pts, t, o, a, m.key === "set")}></path>`) : h}
        ${s ? t.manual.map((m) => {
      const k = t.lines.find((tt) => tt.key === "set") ?? t.lines.find((tt) => tt.key === "main") ?? t.lines[0], j = k == null ? void 0 : k.pts.find((tt, yt) => {
        var Ut;
        return tt.v !== null && (((Ut = k.pts[yt + 1]) == null ? void 0 : Ut.m) ?? 1 / 0) > m[0];
      }), Ot = (j == null ? void 0 : j.v) ?? null;
      return z`${k ? z`<path class="line red" d=${this._path(k.pts, t, o, a, k.key === "set", m)}></path>` : h}
            ${Ot !== null ? z`<circle class="reddot" cx=${o(m[0])} cy=${a(Ot)} r="3.5"></circle>` : h}`;
    }) : h}
        ${t.shade.map((m) => s ? m.value === null ? h : z`<rect class="shade" x=${o(m.from)} y=${a(m.value)} width=${Math.max(1, o(m.to) - o(m.from))} height=${Math.max(0, r - n.b - a(m.value))} style="--c:${m.color}"></rect>` : z`<rect class="shade" x=${o(m.from)} y=${f} width=${Math.max(1, o(m.to) - o(m.from))} height=${b} style="--c:${m.color}"></rect>`)}
        ${s ? t.planned.steps.map((m) => z`<path class="plan" d="M${o(m.from).toFixed(1)},${a(m.value).toFixed(1)}H${o(m.to).toFixed(1)}" style="--c:${m.color}"></path>`) : h}
        ${s ? t.planned.risers.map((m) => z`<line class="riser" x1=${o(m.m)} x2=${o(m.m)} y1=${a(m.from)} y2=${a(m.to)} style="--c:${m.color}"></line>`) : h}
        ${t.markers.map(x)}
        ${A}
        <rect class="hit" x="0" y="0" width=${i} height=${r}></rect>
      </svg>`;
  }
};
G.styles = U`
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
rt([
  v({ attribute: !1 })
], G.prototype, "hass", 2);
rt([
  v({ attribute: !1 })
], G.prototype, "data", 2);
rt([
  v({ attribute: !1 })
], G.prototype, "program", 2);
rt([
  v({ attribute: "entity-id" })
], G.prototype, "entityId", 2);
rt([
  v()
], G.prototype, "date", 2);
rt([
  v({ attribute: !1 })
], G.prototype, "slots", 2);
rt([
  $()
], G.prototype, "_width", 2);
rt([
  $()
], G.prototype, "_loaded", 2);
rt([
  $()
], G.prototype, "_failed", 2);
G = rt([
  B("wp-chart")
], G);
var an = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, nt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ln(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && an(e, i, r), r;
};
const cn = ["sunrise", "sunset"];
let X = class extends O {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return gt(this.hass);
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
    let i = kt(e);
    t === "end" && i === 0 && (i = S), this._update(t, { time: i >= S ? "24:00" : Gt(i) });
  }
  _timeBlock(t, e) {
    const i = this.group.slot[t];
    if (!i) return h;
    const s = this._lang, r = F(s), n = this.disabled;
    return c`
      <div class="time" role="group" aria-label=${e}>
        <button class="step" ?disabled=${n} aria-label=${d(s, "minus15")} title=${d(s, "minus15")} @click=${() => this._update(t, Ai(i, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in i ? c`<input type="time" step="300" .value=${i.time === "24:00" ? "00:00" : i.time} ?disabled=${n}
              aria-label=${e} @change=${(o) => this._fromInput(t, o.target.value)} />` : c`<output class="sun">${Re(s, i)}</output>`}
        <button class="step" ?disabled=${n} aria-label=${d(s, "plus15")} title=${d(s, "plus15")} @click=${() => this._update(t, Ai(i, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${cn.map((o) => {
      const a = "sun" in i && i.sun === o;
      return c`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${n}
            @click=${() => this._toggleSun(t, o)}><ha-icon icon=${o === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${r[`sun_${o}_short`] ?? o}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(t) {
    if (!t) return this._update("end", null);
    const e = this.group.slot.start, i = "time" in e ? kt(e.time) : 12 * 60;
    this._update("end", { time: Gt(Math.min(S - 5, i + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(t) {
    const e = this.group.days.includes(t) ? this.group.days.filter((i) => i !== t) : [...this.group.days, t];
    this._set({}, e.sort((i, s) => i - s));
  }
  render() {
    if (!this.group || !this.program) return h;
    const t = this._lang, e = F(t), i = this.group.slot, s = this.group.days, r = (o, a) => o.length === a.length && a.every((l) => o.includes(l)), n = (o, a) => c`<button class="chip small ${r(s, a) ? "on" : ""}"
      aria-pressed=${r(s, a)} ?disabled=${this.disabled} @click=${() => this._set({}, [...a])}>${r(s, a) ? c`<ha-icon icon="mdi:check"></ha-icon>` : h}${o}</button>`;
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
        ${i.end ? this._timeBlock("end", d(t, "end")) : h}
      </section>
      <section>
        <h4>${d(t, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && r(s, [this.dayOnly]) ? c`<div class="chips"><span class="only">${e.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${d(t, "apply_other_days")}</button></div>` : c`<div class="days" role="group" aria-label=${d(t, "days_label")}>
          ${e.days_short.map((o, a) => c`<button class="day ${s.includes(a) ? "on" : ""}" aria-pressed=${s.includes(a)}
            aria-label=${e.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${s.includes(a) ? c`<ha-icon icon="mdi:check"></ha-icon>` : h}<span>${o}</span></button>`)}
        </div>
        <div class="chips">
          ${n(d(t, "all_days"), ve)}${n(d(t, "weekdays"), ps)}${n(d(t, "weekend"), us)}
        </div>`}
      </section>
      <section>
        <h4>${d(t, "action")}</h4>
        <wp-label-picker .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${i.label || null} ?disabled=${this.disabled}
          @label-change=${(o) => {
      o.stopPropagation(), this._set({ label: o.detail ?? "" });
    }}></wp-label-picker>
      </section>`;
  }
};
X.styles = [it, U`
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
nt([
  v({ attribute: !1 })
], X.prototype, "hass", 2);
nt([
  v({ attribute: !1 })
], X.prototype, "data", 2);
nt([
  v({ attribute: !1 })
], X.prototype, "program", 2);
nt([
  v({ attribute: !1 })
], X.prototype, "group", 2);
nt([
  v({ attribute: !1 })
], X.prototype, "entityIds", 2);
nt([
  v({ type: Boolean })
], X.prototype, "disabled", 2);
nt([
  v({ type: Number })
], X.prototype, "dayOnly", 2);
nt([
  $()
], X.prototype, "_more", 2);
nt([
  $()
], X.prototype, "_last", 2);
X = nt([
  B("wp-slot-form")
], X);
var dn = Object.defineProperty, hn = Object.getOwnPropertyDescriptor, I = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? hn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && dn(e, i, r), r;
};
const Ui = (t) => t.kind === "device" ? `d:${t.entityId}` : `p:${t.programId}`, Ne = 7;
let M = class extends O {
  constructor() {
    super(...arguments), this.chart = !0, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (t) => !0, this._minutes = (t) => he(this.hass, t);
  }
  get _lang() {
    return gt(this.hass);
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
    return this.scope.kind === "device" ? _t(this.hass, this.scope.entityId) : ((t = this._programs[0]) == null ? void 0 : t.name) ?? "";
  }
  _rows() {
    const t = [];
    for (const e of this._programs) {
      const i = ot(e, this.data);
      for (const s of Ze(i, this._include, this._minutes))
        this._focus !== null && !s.days.includes(this._focus) || t.push({ program: e, group: s, key: `${e.id}|${s.ids[s.days[0]]}` });
    }
    return t;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: t, offset: e } = this.day;
    e >= -14 && e <= Ne && (this._offset = e), this._focus = t, !this._rows().length && this._canEdit && this._add([t]);
  }
  /** Translated service names of the actions of the labels. */
  _loadNames() {
    const t = /* @__PURE__ */ new Set();
    for (const e of this.data.labels) e.action.kind === "service" && t.add(e.action.service.split(".")[0]);
    be(this.hass, [...t]).then((e) => e && this.requestUpdate());
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
    return ht(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return bs(this._today, this._offset);
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
    e < -14 || e > Ne || (this._slots = null, this._offset = e);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(t, e, i, s = {}) {
    this._open = t, this._programId = e.id, this._group = i ? structuredClone(i) : null, this._restLabel = s.restLabel ?? null, this._rest = s.rest ?? null, this._dayOnly = s.dayOnly ?? null, this._openId = s.openId ?? null, this._base = null, this._origin = s.origin ? structuredClone(s.origin) : null, this._overrides = [], this._dropBusy = !1, this._draft = structuredClone(e), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var r;
      return (r = this.renderRoot.querySelector(".editor")) == null ? void 0 : r.scrollIntoView({ block: "start" });
    }));
  }
  /** Opens a slot row: the whole group, or only the focused day of it. */
  _openRow(t, e, i) {
    const s = Ei(i) ?? null;
    if (this._focus !== null && i.days.includes(this._focus)) {
      const { draft: r, rest: n } = Ci(i, this._focus);
      this._expand(t, e, r, { rest: n, dayOnly: this._focus, openId: s, origin: i });
    } else
      this._expand(t, e, i, { openId: s, origin: i });
  }
  _cancel() {
    this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._origin = null, this._overrides = [], this._dropBusy = !1, this._draft = null, this._restLabel = null, this._error = "";
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
  _add(t = this._focus === null ? ve : [this._focus]) {
    const e = this._programs[0], i = this._entities[0];
    if (!e || !i) return;
    const s = Ye(this.hass, this.data, this._entities)[0], r = t.length === 1 ? t[0] : null, n = r === null ? void 0 : Or(ot(e, this.data).days[r], this._minutes);
    this._expand("new", e, Mi((s == null ? void 0 : s.id) ?? "", t, n), { dayOnly: r }), this._dropBusy = r === null;
  }
  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  _duplicate() {
    const t = this._programs.find((_) => _.id === this._programId), e = this._group;
    if (!t || !e) return;
    const i = this._problem(t);
    if (i) {
      this._error = i;
      return;
    }
    const { start: s, end: r } = e.slot, n = he(this.hass, s), o = r ? Math.max(15, he(this.hass, r) - n) : 60, a = (_) => ({ time: Gt(Math.min(S, _)) }), l = { openId: this._openId, rest: this._rest, draft: structuredClone(e) }, u = this._dayOnly, p = Mi(e.slot.label, e.days);
    p.slot = {
      ...structuredClone(e.slot),
      id: p.slot.id,
      start: "time" in s ? a(n + o) : { ...s, offset: (s.offset ?? 0) + o },
      end: r ? "time" in r ? a(n + 2 * o) : { ...r, offset: (r.offset ?? 0) + o } : null
    };
    const g = this._origin;
    this._expand("new", t, p, { dayOnly: u }), this._base = l, this._origin = g;
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
      const n = await this._saveProgram(r.program);
      if (n === "ok") return !0;
      if (n === "error") return !1;
      try {
        i = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((a) => a.id === t), i && (this._saved[t] = i);
      } catch {
        break;
      }
    }
    return this._error = d(this._lang, "ss_err_save"), !1;
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
    return i ? i.days.length ? i.slot.end && JSON.stringify(i.slot.start) === JSON.stringify(i.slot.end) ? d(e, "w_err_same") : W(this.data, i.slot.label) ? "" : d(e, "err_action") : d(e, "err_days") : "";
  }
  /**
   * The group being edited against the current profile: unchanged, merged when only its other days moved,
   * or changed meanwhile (then the editor shows the new version, or closes if it is gone).
   */
  _checkOrigin(t, e) {
    const i = this._origin;
    if (!i || !this._openId) return "ok";
    const s = Ar(t, this._include, this._minutes, this._openId), r = Er(s, i);
    if (r === "same") return "ok";
    if (r === "days" && s && this._dayOnly !== null && s.days.includes(this._dayOnly))
      return this._rest = Ci(s, this._dayOnly).rest, this._origin = structuredClone(s), "ok";
    const n = d(this._lang, "ss_changed");
    if (s) {
      const o = this._open ?? `${e.id}|${Ei(s)}`;
      this._openRow(o, e, s);
    } else
      this._cancel();
    return this._error = s ? n : "", this._note = s ? "" : n, "changed";
  }
  async _saveRow() {
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
      const l = ot(a, this.data);
      if (this._checkOrigin(l, a) === "changed")
        return n = !0, { changed: !0 };
      let u = l;
      this._base && (u = Oe(u, s, this._minutes, this._base));
      let p = t;
      if (r = [], this._dropBusy) {
        const { free: _, busy: f } = Mr(u, s, this._minutes, t.slot, t.days);
        if (!_.length) return { error: d(this._lang, "w_err_overlap") };
        p = { ...t, days: _ }, r = f;
      }
      const g = Oe(u, s, this._minutes, { openId: this._openId, rest: this._rest, draft: p });
      return Pr(g) !== null ? { error: d(this._lang, "w_err_overlap") } : { program: { ...a, entities: this._withOverrides(a), profiles: a.profiles.map((_) => _.id === l.id ? g : _) } };
    }) && !n && (this._cancel(), r.length && (this._note = d(this._lang, "w_dropped", { days: r.map((a) => F(this._lang).days_short[a]).join(" ") })));
  }
  async _deleteRow() {
    const t = this._live(this._programId);
    if (!t || this._open === "new" || !this._openId || !await At(this, d(this._lang, "w_confirm_slot"), d(this._lang, "yes"), d(this._lang, "no"))) return;
    await this._commit(t.id, (i) => {
      const s = ot(i, this.data);
      if (this._checkOrigin(s, i) === "changed") return { changed: !0 };
      const r = Oe(s, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
      return { program: { ...i, profiles: i.profiles.map((n) => n.id === s.id ? r : n) } };
    }) && this._cancel();
  }
  async _saveRest(t) {
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
    if (!t && !await At(this, d(this._lang, "confirm_pause", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no"))) {
      e.checked = !0;
      return;
    }
    try {
      for (const i of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: i.id, enabled: t });
    } catch (i) {
      this._error = d(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    }
  }
  async _deleteAll() {
    if (await At(this, d(this._lang, "confirm_delete_schedule", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no")))
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
  _settings() {
    const t = this._programs[0];
    t && this.dispatchEvent(new CustomEvent("open-settings", { detail: { programId: t.id }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _when(t) {
    const e = this._lang, i = Re(e, t.start);
    return t.end ? `${i}–${Re(e, t.end)}` : i;
  }
  _rowText(t) {
    const e = this._lang, i = W(this.data, t.slot.label), s = $r(e, F(e).days_short, t.days);
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
      <span class="txt"><span class="l1">${r}</span>${this._focus === null ? c`<span class="l2">${n}</span>` : h}${this._programs.length > 1 ? c`<small>${e.name}</small>` : h}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(t, e) {
    const i = this._lang, s = e === "new", r = this._entities.filter((n) => t.entities.some((o) => o.entity_id === n));
    return c`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .group=${this._group} .entityIds=${r}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @override-change=${(n) => {
      n.stopPropagation(), this._onOverride(n.detail);
    }}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : h}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${d(i, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${d(i, "cancel")}</button>
      </div>
      ${s ? h : c`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${d(i, "duplicate")}</button>`}
      ${s ? h : c`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${d(i, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const t = this._lang, e = this._programs[0];
    return e ? this._entities.filter((i) => e.entities.some((s) => s.entity_id === i)).map((i) => {
      const s = e.entities.find((a) => a.entity_id === i), r = `rest:${i}`, n = this._entities.length > 1 ? `${d(t, "rest_of_time")} · ${_t(this.hass, i)}` : d(t, "rest_of_time");
      if (this._open === r)
        return c`<div class="editor"><h4>${n}</h4>
          <wp-label-picker allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .entityIds=${[i]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @override-change=${(a) => {
          a.stopPropagation(), this._onOverride(a.detail);
        }}
            @label-change=${(a) => {
          a.stopPropagation(), this._restLabel = a.detail;
        }}></wp-label-picker>
          ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : h}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(i)}>${d(t, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${d(t, "cancel")}</button>
          </div></div>`;
      const o = W(this.data, s.default_label);
      return c`<button class="row rest" aria-expanded="false" @click=${() => this._expand(r, e, null, { restLabel: s.default_label ?? null })}>
        ${o ? c`<span class="dot" style="background:${o.color}"></span>` : c`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${n} · <b>${o ? o.name : d(t, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : h;
  }
  _renderChart() {
    const t = this._lang, e = this._programs[0];
    if (!this.chart || !e || !this._chartEntity) return h;
    const i = this._date, s = new Intl.DateTimeFormat(t, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${i}T12:00:00Z`));
    return c`<section class="chart">
      ${this._entities.length > 1 ? c`<select aria-label=${d(t, "chart")} @change=${(r) => this._chartEntity = r.target.value}>
        ${this._entities.map((r) => c`<option value=${r} ?selected=${r === this._chartEntity}>${_t(this.hass, r)}</option>`)}</select>` : h}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${d(t, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? d(t, "today") : s}</span>
        <button class="ibtn" ?disabled=${this._offset >= Ne} aria-label=${d(t, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${e} entity-id=${this._chartEntity} date=${i}
        .slots=${this._slots} @open-history=${(r) => this._openHistory(r.detail)}></wp-chart>
    </section>`;
  }
  render() {
    var s;
    if (!this.hass || !this.data || !this.scope) return h;
    const t = this._lang;
    if (!this._programs.length)
      return c`<wp-dialog open heading=${this._title}><p class="muted">${d(t, "no_program")}</p></wp-dialog>`;
    const e = this._rows(), i = !!((s = this.hass.user) != null && s.is_admin) && this.data.can_edit;
    return c`
      <wp-dialog open heading=${this._title}>
        ${i ? c`<button slot="header-actions" class="gear" aria-label=${d(t, "settings")} @click=${() => this._settings()}>
          <ha-icon icon="mdi:cog"></ha-icon></button>` : h}
        ${this._canEdit ? h : c`<p class="err" role="alert">${d(t, "read_only")}</p>`}
        ${this._error && !this._open ? c`<p class="err" role="alert">${this._error}</p>` : h}
        ${this._focus !== null && this._open === null ? c`<div class="focus">
          <button class="chip back" @click=${() => {
      this._focus = null, this._note = "";
    }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${d(t, "w_whole_week")}</button>
          <h3>${F(t).days[this._focus]}</h3></div>` : h}
        ${this._note && this._open === null ? c`<p class="muted note">${this._note}</p>` : h}
        <div class="list">
          ${e.length ? e.map((r) => this._renderRow(r)) : this._open === "new" ? h : c`<p class="muted">${d(t, "w_none")}</p>`}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : h}
          ${this._open === null ? c`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? d(t, "w_add") : d(t, "w_add_day", { day: F(t).days[this._focus].toLocaleLowerCase(t) })}</span></button>` : h}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? h : c`${this._renderChart()}
        <label class="switch">
          <span class="grow">${d(t, "schedule_on")}</span>
          <span class="state">${this._enabled ? d(t, "running") : d(t, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(r) => void this._setEnabled(r.target.checked, r.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${d(t, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
M.styles = [it, U`
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
I([
  v({ attribute: !1 })
], M.prototype, "hass", 2);
I([
  v({ attribute: !1 })
], M.prototype, "data", 2);
I([
  v({ attribute: !1 })
], M.prototype, "scope", 2);
I([
  v({ type: Boolean })
], M.prototype, "chart", 2);
I([
  v({ attribute: !1 })
], M.prototype, "day", 2);
I([
  $()
], M.prototype, "_open", 2);
I([
  $()
], M.prototype, "_group", 2);
I([
  $()
], M.prototype, "_dayOnly", 2);
I([
  $()
], M.prototype, "_focus", 2);
I([
  $()
], M.prototype, "_note", 2);
I([
  $()
], M.prototype, "_draft", 2);
I([
  $()
], M.prototype, "_restLabel", 2);
I([
  $()
], M.prototype, "_programId", 2);
I([
  $()
], M.prototype, "_error", 2);
I([
  $()
], M.prototype, "_saving", 2);
I([
  $()
], M.prototype, "_offset", 2);
I([
  $()
], M.prototype, "_slots", 2);
I([
  $()
], M.prototype, "_chartEntity", 2);
M = I([
  B("wp-schedule")
], M);
function Te(t, e) {
  var r, n;
  const i = (n = (r = t.states[e]) == null ? void 0 : r.attributes) == null ? void 0 : n.friendly_name;
  if (typeof i == "string" && i) return i;
  const s = e.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : e;
}
const Bi = /* @__PURE__ */ new WeakSet();
function pn(t) {
  if (!t || Bi.has(t)) return;
  Bi.add(t);
  const e = () => {
    t.classList.toggle("more-left", t.scrollLeft > 2), t.classList.toggle("more-right", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  };
  t.addEventListener("scroll", e, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(e).observe(t), e();
}
const un = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var _n = Object.defineProperty, fn = Object.getOwnPropertyDescriptor, V = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? fn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && _n(e, i, r), r;
};
const Fi = () => [[], [], [], [], [], [], []];
function Wi(t) {
  return t.map((e) => ({ ...structuredClone(e), id: Y() }));
}
let R = class extends O {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._pickerKey = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this._picker || ns().then((t) => this._picker = t);
  }
  get _lang() {
    return gt(this.hass);
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
  willUpdate(t) {
    if (!(this._ready && !t.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const e = Y();
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
          active_profile: e,
          profiles: [{ id: e, name: this._tr("profile_default"), days: Fi() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._tab = "general";
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
  _patch(t) {
    this._p = { ...this._p, ...t }, this._error = "";
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
        id: Y(),
        name: e,
        days: t.mode === "copy" ? s.days.map(Wi) : Fi()
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
    !t || this._p.entities.some((e) => e.entity_id === t) || (this._pickerKey += 1, this._patch({ entities: [...this._p.entities, { entity_id: t, default_label: null, label_overrides: {} }] }));
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
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: this._payload() }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    } finally {
      this._saving = !1;
    }
  }
  async _askDelete() {
    await At(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(t) {
    await At(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(t) {
    var s;
    const e = (s = this._p.entities[t]) == null ? void 0 : s.entity_id;
    if (!e) return;
    const i = this._tr("confirm_delete", { name: Te(this.hass, e) });
    await At(this, i, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((r, n) => n !== t) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  _duplicate() {
    const t = Y(), e = this._p, i = /* @__PURE__ */ new Map(), s = e.profiles.map((r) => {
      const n = r.id === this._activeId() ? t : Y();
      return i.set(r.id, n), { ...structuredClone(r), id: n, days: r.days.map(Wi) };
    });
    this._p = {
      ...structuredClone(e),
      id: "",
      revision: 0,
      created_at: void 0,
      name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles: s,
      active_profile: i.get(this._activeId()) ?? s[0].id
    }, delete this._p.created_at, this._isNew = !0, this._profileId = this._p.active_profile ?? s[0].id, this._error = "";
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
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? c`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${t.icon ?? ""}
                @value-changed=${(e) => this._patch({ icon: e.detail.value || null })}></ha-selector>` : c`<div class="row" style="flex-wrap:nowrap">
                ${t.icon && customElements.get("ha-icon") ? c`<ha-icon .icon=${t.icon}></ha-icon>` : h}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${t.icon ?? ""}
                  @input=${(e) => this._patch({ icon: e.target.value.trim() || null })} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(t.priority)}
            @change=${(e) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 10))) })} /></div>
      </div>
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
    pn(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const t = this._p;
    return c`
      ${t.entities.length === 0 ? c`<p class="muted">${this._tr("pe_no_entity")}</p>` : h}
      ${t.entities.map((e, i) => this._renderEntity(e, i))}
      ${ss(this._pickerKey, this._picker ? c`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: t.entities.map((e) => e.entity_id) } }}
            .label=${this._tr("pe_add_entity")} .value=${""}
            @value-changed=${(e) => {
      e.stopPropagation(), this._addEntity(e.detail.value ?? "");
    }}></ha-selector>` : c`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .exclude=${t.entities.map((e) => e.entity_id)}
        @wp-change=${(e) => {
      e.stopPropagation(), this._addEntity(e.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(t, e) {
    return c`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Te(this.hass, t.entity_id)}</strong>
            ${this.hass.states[t.entity_id] ? h : c`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Te(this.hass, t.entity_id)}`}
            @click=${() => void this._askDeleteEntity(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
      </div>`;
  }
  _renderSeasons() {
    const t = this._p, e = this._profile, i = this._activeId(), s = this._profileForm;
    return c`
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
      ${e.id === i ? c`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : h}
      ${s ? c`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(r) => this._profileForm = { ...s, name: r.target.value }}
                @keydown=${(r) => {
      r.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${s.mode === "rename" ? c`<p class="hint">${this._tr("profile_rename_warning")}</p>` : h}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : h}
    `;
  }
  render() {
    if (!this._p) return h;
    const t = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]], e = this._canEdit();
    return c`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${e ? h : c`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${t.map(([i, s]) => c`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(s)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>
        ${this._error ? c`<p class="error" role="alert">${this._error}</p>` : h}
        ${this._isNew ? h : c`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? h : c`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!e}
              @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>`}
      </wp-dialog>
    `;
  }
};
R.styles = [
  it,
  U`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${Ki(un)}
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
V([
  v({ attribute: !1 })
], R.prototype, "hass", 2);
V([
  v({ attribute: !1 })
], R.prototype, "data", 2);
V([
  v({ attribute: !1 })
], R.prototype, "program", 2);
V([
  v({ attribute: !1 })
], R.prototype, "defaultTypes", 2);
V([
  $()
], R.prototype, "_p", 2);
V([
  $()
], R.prototype, "_isNew", 2);
V([
  $()
], R.prototype, "_tab", 2);
V([
  $()
], R.prototype, "_profileId", 2);
V([
  $()
], R.prototype, "_error", 2);
V([
  $()
], R.prototype, "_saving", 2);
V([
  $()
], R.prototype, "_picker", 2);
V([
  $()
], R.prototype, "_profileForm", 2);
R = V([
  B("wp-program-editor")
], R);
const Hi = "weekly_planner_reloaded_for";
function mn(t = import.meta.url) {
  try {
    return new URL(t).searchParams.get("v");
  } catch {
    return null;
  }
}
function gn(t, e, i) {
  return !!(t && e && t !== e && i !== e);
}
function qi(t, e) {
  if (!e) return !1;
  let i = null;
  try {
    i = sessionStorage.getItem(Hi);
  } catch {
  }
  if (!gn(mn(), t, i)) return !1;
  try {
    sessionStorage.setItem(Hi, t);
  } catch {
  }
  return location.reload(), !0;
}
var yn = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, Z = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? bn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && yn(e, i, r), r;
};
const vn = {
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
let q = class extends O {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._visible = () => {
      document.hidden || this._pollVersion();
    };
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }
  setConfig(t) {
    this._config = { show_chart: !0, ...t };
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
    qi((t = this._data) == null ? void 0 : t.card_version, this._idle);
  }
  /** Asks the server for the served version (a reload of the integration does not push new data to old subscriptions). */
  async _pollVersion() {
    try {
      const t = await this.hass.callWS({ type: "weekly_planner/get" });
      qi(t.card_version, this._idle);
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
    this._idle && ((e = this._data) != null && e.card_version) && this._checkVersion(), t.has("hass") && this.hass && !this._unsub && (this._unsub = er(this.hass, (i) => {
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
    await be(this.hass, e) && this.requestUpdate();
  }
  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const t = [0, 1, 2, 3, 4, 5, 6].map((r) => ht(this._dateAt(r), this._tz)), e = wi(this._data, this._config), i = `${t[0]}|${e.map((r) => `${r.id}:${r.revision}`).join(",")}`;
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
    const s = this._data, r = this._dateAt(i), n = ce(r, this._tz), o = this._preview[ht(r, this._tz)] ?? {}, a = [];
    for (const l of [...e].reverse()) {
      if (!l.enabled) continue;
      const u = ot(l, s), p = (f) => pt(l, t, W(s, f.label)), g = (f, b, x, A = {}) => {
        const m = W(s, f.label);
        return {
          start: b,
          end: x,
          color: m.color,
          label: m.name,
          slotId: f.id,
          startSun: fe(f.start),
          endSun: f.end ? fe(f.end) : null,
          marker: !f.end,
          ...A
        };
      };
      for (const { slot: f, end: b } of rs(u.days[(n + 6) % 7]))
        p(f) && a.push(g(f, 0, b, { spill: !0, startSun: null }));
      const _ = o[l.id];
      for (const f of u.days[n]) {
        if (!p(f)) continue;
        const b = _ == null ? void 0 : _.find((m) => m.slot_id === f.id);
        let x = mt(f.start), A = mt(f.end ?? null);
        b && (x = St(b.start, this._tz), A = b.end ? St(b.end, this._tz) : null), x !== null && a.push(g(
          f,
          x,
          A === null ? x + 10 : A > x ? A : S,
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
  /* ---- render ---- */
  /** A bar that can be edited in place: today's (`kind` "today") or one of the week's. */
  _bar(t, e, i, s, r) {
    var p, g, _;
    const n = this._dateAt(i), o = ce(n, this._tz), a = ht(n, this._tz), l = `${e.id}|${t}|${s}|${o}`, u = [e];
    return c`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${e} entity-id=${t}
      weekday=${o} .spans=${this._spans(t, u, i)} .preview=${(p = this._preview[a]) == null ? void 0 : p[e.id]}
      .now=${i === 0 ? St(this._now, this._tz) : null} ?hours=${s === "today"}
      ?editing=${this._edit === l} ?editable=${!!((g = this._data) != null && g.can_edit) && !((_ = this._data) != null && _.read_only)}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => this._edit = l} @edit-exit=${() => {
      this._edit === l && (this._edit = null);
    }}
      @open-day=${r} @edited=${(f) => this._showSnack(f.detail.undo)}></wp-bar-editor>`;
  }
  _line(t, e, i) {
    var g, _;
    const s = this._lang, r = this._data, n = this._next(t, e), o = W(r, n == null ? void 0 : n.label), a = e.length > 0 && e.every((f) => !f.enabled), l = this.hass.states[t], u = i.icon ?? (l == null ? void 0 : l.attributes.icon) ?? vn[zt(t)] ?? "mdi:calendar-clock", p = () => this._open(i.open);
    return c`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${u}></ha-icon>
          <div class="info">
            ${i.name ? c`<span class="name">${i.name}</span>` : h}
            <span class="now">
              <span class="nw">${l ? ((_ = (g = this.hass).formatEntityState) == null ? void 0 : _.call(g, l)) ?? l.state : "—"}</span>
              ${n ? c`<span class="next">→ ${(o == null ? void 0 : o.name) ?? Qe(this.hass, s, n.action)}
                <span class="when nw">${Le(Xs(n.at, this._tz, s, this._now))}</span></span>` : h}
            </span>
          </div>
          ${a ? c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(s, "paused")}></ha-icon>` : h}
          ${i.button ? c`<button class="hours" aria-label=${d(s, "hours")} title=${d(s, "hours")} @click=${p}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : h}
        </div>
        <div class="today">
          <span class="wname">${d(s, "today_short")}</span>
          ${this._bar(t, e[0], 0, "today", p)}
        </div>
        ${this._weekRows(`${Ui(i.open)}|${t}`, t, e, i.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(t, e, i, s) {
    const r = this._lang, n = this._week.has(t), o = () => {
      const l = new Set(this._week);
      n ? l.delete(t) : l.add(t), this._week = l;
    }, a = F(r).days_short;
    return c`
      <button class="weekbtn" aria-expanded=${n} @click=${o}>
        <ha-icon icon=${n ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${d(r, "week")}</button>
      ${n ? c`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((l) => {
      const u = (l - ce(this._now, this._tz) + 7) % 7, p = () => this._open(s, { weekday: l, offset: u });
      return c`<div class="wday">
            <button class="wnamebtn" aria-label=${a[l]} @click=${p}>
              <span class="wname ${u === 0 ? "today" : ""}">${a[l]}</span></button>
            ${this._bar(e, i[0], u, "week", p)}</div>`;
    })}
      </div>` : h}`;
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
          ${i.enabled ? h : c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(e, "paused")}></ha-icon>`}
          <button class="hours" aria-label=${d(e, "hours")} title=${d(e, "hours")} @click=${() => this._open(s)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
        </div>
        ${i.entities.map((r) => this._line(r.entity_id, [i], { name: _t(this.hass, r.entity_id), button: null, open: s }))}
      </section>`;
    });
  }
  render() {
    var n;
    if (!this._config || !this.hass) return h;
    const t = this._lang, e = this._data, i = e ? wi(e, this._config) : [], s = !!e && !!((n = this.hass.user) != null && n.is_admin) && !!(e != null && e.can_edit), r = this._config.title !== void 0 && this._config.title !== "";
    return c`
      <ha-card>
        ${r || s || e != null && e.vacation ? c`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${e != null && e.vacation ? c`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${d(t, "vacation")}</span>` : h}
              ${s ? c`<button class="gear" aria-label=${d(t, "all_programs")} @click=${() => this._dialog = { kind: "admin" }}>
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon></button>` : h}
            </div>` : h}
        ${this._error ? c`<div class="error">${d(t, "error", { message: this._error })}</div>` : h}
        ${e != null && e.read_only ? c`<div class="error">${d(t, "read_only")}</div>` : h}
        ${e ? h : c`<div class="empty">…</div>`}
        ${e && !i.length ? c`<div class="empty">${d(t, "no_program")}</div>` : h}
        ${e ? this._bySchedule(i) : h}
      </ha-card>
      ${this._snack ? c`<div class="snack" role="status"><span>${d(t, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${d(t, "undo")}</button></div>` : h}
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    const t = this._dialog;
    if (!t || !this._data) return h;
    const e = () => this._dialog = null;
    switch (t.kind) {
      case "schedule":
        return ss(Ui(t.scope), c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${t.scope} .day=${t.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${e}
          @open-settings=${(i) => {
          const s = this._data.programs.find((r) => r.id === i.detail.programId);
          s && (this._dialog = { kind: "program", program: s });
        }}></wp-schedule>`);
      case "program":
        return c`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${t.program}
          @closed=${e}></wp-program-editor>`;
      case "labels":
        return c`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${e}></wp-labels>`;
      case "admin": {
        const i = this._lang;
        return c`<wp-dialog open heading=${d(i, "all_programs")} @closed=${e}>
          <div class="adm">
            <button class="admrow" @click=${() => this._dialog = { kind: "labels" }}>
              <ha-icon icon="mdi:label-multiple-outline"></ha-icon><span>${d(i, "labels")}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>
            ${this._data.programs.map((s) => c`<button class="admrow" @click=${() => this._dialog = { kind: "program", program: s }}>
              <ha-icon icon=${s.icon ?? "mdi:calendar-clock"}></ha-icon><span>${s.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => this._dialog = { kind: "program" }}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${d(i, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }
};
q.styles = U`
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
    .adm { display: flex; flex-direction: column; gap: 8px; }
    .admrow {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 12px; border-radius: 12px; font: inherit; font-size: 16px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; text-align: left;
    }
    .admrow span { flex: 1; }
    .admrow.add { border-style: dashed; color: var(--primary-color); }
  `;
Z([
  v({ attribute: !1 })
], q.prototype, "hass", 2);
Z([
  $()
], q.prototype, "_config", 2);
Z([
  $()
], q.prototype, "_data", 2);
Z([
  $()
], q.prototype, "_error", 2);
Z([
  $()
], q.prototype, "_dialog", 2);
Z([
  $()
], q.prototype, "_preview", 2);
Z([
  $()
], q.prototype, "_now", 2);
Z([
  $()
], q.prototype, "_week", 2);
Z([
  $()
], q.prototype, "_edit", 2);
Z([
  $()
], q.prototype, "_snack", 2);
q = Z([
  B("weekly-planner-card")
], q);
var $n = Object.defineProperty, xn = Object.getOwnPropertyDescriptor, xe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? xn(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && $n(e, i, r), r;
};
const wn = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let Lt = class extends O {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(t) {
    this._config = { ...t };
  }
  get _lang() {
    return gt(this.hass);
  }
  _tr(t, e) {
    return d(this._lang, t, e);
  }
  updated(t) {
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, this.hass.callWS({ type: "weekly_planner/get" }).then((e) => this._programs = e.programs.map((i) => ({ id: i.id, name: i.name }))).catch(() => this._loaded = !1));
  }
  _emit(t) {
    this._config = t, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 }));
  }
  _set(t, e) {
    const i = { ...this._config };
    e === void 0 || e === "" || e === null ? delete i[t] : i[t] = e, this._emit(i);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(t) {
    var i, s;
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
    var i, s;
    const t = this._config, e = ((i = t.filter) == null ? void 0 : i.types) ?? [];
    return c`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${t.title ?? ""} @input=${(r) => this._set("title", r.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? c`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(r) => this._set("program", r.target.value)}>
              ${this._programs.length === 0 ? c`<option value="">${this._tr("no_program")}</option>` : h}
              ${!this._programs.some((r) => r.id === t.program) && t.program ? c`<option value=${t.program} selected>${t.program}</option>` : h}
              ${this._programs.map((r) => c`<option value=${r.id} ?selected=${r.id === t.program}>${r.name}</option>`)}
            </select></div>` : c`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${wn.map((r) => c`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${e.includes(r)}
                @change=${(n) => this._setFilter({ types: n.target.checked ? [...e, r] : e.filter((o) => o !== r) })} />
                ${fr(this._lang, r)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((s = t.filter) == null ? void 0 : s.area) ?? ""} placeholder="bureau"
                @input=${(r) => this._setFilter({ area: r.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${t.show_chart !== !1}
        @change=${(r) => this._set("show_chart", r.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
Lt.styles = [it, U`:host { display: block; padding: 4px 0; }`];
xe([
  v({ attribute: !1 })
], Lt.prototype, "hass", 2);
xe([
  $()
], Lt.prototype, "_config", 2);
xe([
  $()
], Lt.prototype, "_programs", 2);
Lt = xe([
  B("weekly-planner-card-editor")
], Lt);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
