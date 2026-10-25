/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, Ke = ye.ShadowRoot && (ye.ShadyCSS === void 0 || ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Xe = Symbol(), ls = /* @__PURE__ */ new WeakMap();
let Ts = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Ke && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = ls.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ls.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ye = (t) => new Ts(typeof t == "string" ? t : t + "", void 0, Xe), U = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, n, o) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[o + 1], t[0]);
  return new Ts(s, t, Xe);
}, Zs = (t, e) => {
  if (Ke) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), n = ye.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, t.appendChild(i);
  }
}, cs = Ke ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Ye(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Qs, defineProperty: ti, getOwnPropertyDescriptor: ei, getOwnPropertyNames: si, getOwnPropertySymbols: ii, getPrototypeOf: ni } = Object, xt = globalThis, ds = xt.trustedTypes, oi = ds ? ds.emptyScript : "", Ue = xt.reactiveElementPolyfillSupport, Yt = (t, e) => t, ve = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? oi : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, Ge = (t, e) => !Qs(t, e), hs = { attribute: !0, type: String, converter: ve, reflect: !1, useDefault: !1, hasChanged: Ge };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), xt.litPropertyMetadata ?? (xt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Lt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = hs) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(e, i, s);
      n !== void 0 && ti(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: n, set: o } = ei(this.prototype, e) ?? { get() {
      return this[s];
    }, set(r) {
      this[s] = r;
    } };
    return { get: n, set(r) {
      const a = n == null ? void 0 : n.call(this);
      o == null || o.call(this, r), this.requestUpdate(e, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? hs;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Yt("elementProperties"))) return;
    const e = ni(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Yt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Yt("properties"))) {
      const s = this.properties, i = [...si(s), ...ii(s)];
      for (const n of i) this.createProperty(n, s[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, n] of s) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const n = this._$Eu(s, i);
      n !== void 0 && this._$Eh.set(n, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const n of i) s.unshift(cs(n));
    } else e !== void 0 && s.push(cs(e));
    return s;
  }
  static _$Eu(e, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((s) => this.enableUpdating = s), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((s) => s(this));
  }
  addController(e) {
    var s;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((s = e.hostConnected) == null || s.call(e));
  }
  removeController(e) {
    var s;
    (s = this._$EO) == null || s.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Zs(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((s) => {
      var i;
      return (i = s.hostConnected) == null ? void 0 : i.call(s);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var i;
      return (i = s.hostDisconnected) == null ? void 0 : i.call(s);
    });
  }
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    var o;
    const i = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, i);
    if (n !== void 0 && i.reflect === !0) {
      const r = (((o = i.converter) == null ? void 0 : o.toAttribute) !== void 0 ? i.converter : ve).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    var o, r;
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const a = i.getPropertyOptions(n), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((o = a.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? a.converter : ve;
      this._$Em = n;
      const d = c.fromAttribute(s, a.type);
      this[n] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(n)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, n = !1, o) {
    var r;
    if (e !== void 0) {
      const a = this.constructor;
      if (n === !1 && (o = this[e]), i ?? (i = a.getPropertyOptions(e)), !((i.hasChanged ?? Ge)(o, s) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(e)) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: n, wrapped: o }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? s ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), n === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [o, r] of n) {
        const { wrapped: a } = r, c = this[o];
        a !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, r, c);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), (i = this._$EO) == null || i.forEach((n) => {
        var o;
        return (o = n.hostUpdate) == null ? void 0 : o.call(n);
      }), this.update(s)) : this._$EM();
    } catch (n) {
      throw e = !1, this._$EM(), n;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var s;
    (s = this._$EO) == null || s.forEach((i) => {
      var n;
      return (n = i.hostUpdated) == null ? void 0 : n.call(i);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((s) => this._$ET(s, this[s]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
Lt.elementStyles = [], Lt.shadowRootOptions = { mode: "open" }, Lt[Yt("elementProperties")] = /* @__PURE__ */ new Map(), Lt[Yt("finalized")] = /* @__PURE__ */ new Map(), Ue == null || Ue({ ReactiveElement: Lt }), (xt.reactiveElementVersions ?? (xt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = globalThis, ps = (t) => t, $e = Gt.trustedTypes, _s = $e ? $e.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, zs = "$lit$", bt = `lit$${Math.random().toFixed(9).slice(2)}$`, Os = "?" + bt, ri = `<${Os}>`, It = document, Qt = () => It.createComment(""), te = (t) => t === null || typeof t != "object" && typeof t != "function", Ze = Array.isArray, ai = (t) => Ze(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", Re = `[ 	
\f\r]`, Xt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, us = /-->/g, ms = />/g, Tt = RegExp(`>|${Re}(?:([^\\s"'>=/]+)(${Re}*=${Re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), fs = /'/g, gs = /"/g, Ds = /^(?:script|style|textarea|title)$/i, js = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), l = js(1), zt = js(2), Ht = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ys = /* @__PURE__ */ new WeakMap(), Dt = It.createTreeWalker(It, 129);
function Ns(t, e) {
  if (!Ze(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _s !== void 0 ? _s.createHTML(e) : e;
}
const li = (t, e) => {
  const s = t.length - 1, i = [];
  let n, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = Xt;
  for (let a = 0; a < s; a++) {
    const c = t[a];
    let d, u, _ = -1, y = 0;
    for (; y < c.length && (r.lastIndex = y, u = r.exec(c), u !== null); ) y = r.lastIndex, r === Xt ? u[1] === "!--" ? r = us : u[1] !== void 0 ? r = ms : u[2] !== void 0 ? (Ds.test(u[2]) && (n = RegExp("</" + u[2], "g")), r = Tt) : u[3] !== void 0 && (r = Tt) : r === Tt ? u[0] === ">" ? (r = n ?? Xt, _ = -1) : u[1] === void 0 ? _ = -2 : (_ = r.lastIndex - u[2].length, d = u[1], r = u[3] === void 0 ? Tt : u[3] === '"' ? gs : fs) : r === gs || r === fs ? r = Tt : r === us || r === ms ? r = Xt : (r = Tt, n = void 0);
    const v = r === Tt && t[a + 1].startsWith("/>") ? " " : "";
    o += r === Xt ? c + ri : _ >= 0 ? (i.push(d), c.slice(0, _) + zs + c.slice(_) + bt + v) : c + bt + (_ === -2 ? a : v);
  }
  return [Ns(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ee {
  constructor({ strings: e, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let o = 0, r = 0;
    const a = e.length - 1, c = this.parts, [d, u] = li(e, s);
    if (this.el = ee.createElement(d, i), Dt.currentNode = this.el.content, s === 2 || s === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (n = Dt.nextNode()) !== null && c.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const _ of n.getAttributeNames()) if (_.endsWith(zs)) {
          const y = u[r++], v = n.getAttribute(_).split(bt), b = /([.?@])?(.*)/.exec(y);
          c.push({ type: 1, index: o, name: b[2], strings: v, ctor: b[1] === "." ? di : b[1] === "?" ? hi : b[1] === "@" ? pi : Ce }), n.removeAttribute(_);
        } else _.startsWith(bt) && (c.push({ type: 6, index: o }), n.removeAttribute(_));
        if (Ds.test(n.tagName)) {
          const _ = n.textContent.split(bt), y = _.length - 1;
          if (y > 0) {
            n.textContent = $e ? $e.emptyScript : "";
            for (let v = 0; v < y; v++) n.append(_[v], Qt()), Dt.nextNode(), c.push({ type: 2, index: ++o });
            n.append(_[y], Qt());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Os) c.push({ type: 2, index: o });
      else {
        let _ = -1;
        for (; (_ = n.data.indexOf(bt, _ + 1)) !== -1; ) c.push({ type: 7, index: o }), _ += bt.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const i = It.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Bt(t, e, s = t, i) {
  var r, a;
  if (e === Ht) return e;
  let n = i !== void 0 ? (r = s._$Co) == null ? void 0 : r[i] : s._$Cl;
  const o = te(e) ? void 0 : e._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== o && ((a = n == null ? void 0 : n._$AO) == null || a.call(n, !1), o === void 0 ? n = void 0 : (n = new o(t), n._$AT(t, s, i)), i !== void 0 ? (s._$Co ?? (s._$Co = []))[i] = n : s._$Cl = n), n !== void 0 && (e = Bt(t, n._$AS(t, e.values), n, i)), e;
}
class ci {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: i } = this._$AD, n = ((e == null ? void 0 : e.creationScope) ?? It).importNode(s, !0);
    Dt.currentNode = n;
    let o = Dt.nextNode(), r = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let d;
        c.type === 2 ? d = new re(o, o.nextSibling, this, e) : c.type === 1 ? d = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (d = new _i(o, this, e)), this._$AV.push(d), c = i[++a];
      }
      r !== (c == null ? void 0 : c.index) && (o = Dt.nextNode(), r++);
    }
    return Dt.currentNode = It, n;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class re {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, s, i, n) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = Bt(this, e, s), te(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== Ht && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ai(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && te(this._$AH) ? this._$AA.nextSibling.data = e : this.T(It.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: s, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ee.createElement(Ns(i.h, i.h[0]), this.options)), i);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === n) this._$AH.p(s);
    else {
      const r = new ci(n, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = ys.get(e.strings);
    return s === void 0 && ys.set(e.strings, s = new ee(e)), s;
  }
  k(e) {
    Ze(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const o of e) n === s.length ? s.push(i = new re(this.O(Qt()), this.O(Qt()), this, this.options)) : i = s[n], i._$AI(o), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, s); e !== this._$AB; ) {
      const n = ps(e).nextSibling;
      ps(e).remove(), e = n;
    }
  }
  setConnected(e) {
    var s;
    this._$AM === void 0 && (this._$Cv = e, (s = this._$AP) == null || s.call(this, e));
  }
}
class Ce {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, n, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = s, this._$AM = n, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(e, s = this, i, n) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = Bt(this, e, s, 0), r = !te(e) || e !== this._$AH && e !== Ht, r && (this._$AH = e);
    else {
      const a = e;
      let c, d;
      for (e = o[0], c = 0; c < o.length - 1; c++) d = Bt(this, a[i + c], s, c), d === Ht && (d = this._$AH[c]), r || (r = !te(d) || d !== this._$AH[c]), d === h ? e = h : e !== h && (e += (d ?? "") + o[c + 1]), this._$AH[c] = d;
    }
    r && !n && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class di extends Ce {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class hi extends Ce {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class pi extends Ce {
  constructor(e, s, i, n, o) {
    super(e, s, i, n, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = Bt(this, e, s, 0) ?? h) === Ht) return;
    const i = this._$AH, n = e === h && i !== h || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== h && (i === h || n);
    n && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class _i {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Bt(this, e);
  }
}
const Fe = Gt.litHtmlPolyfillSupport;
Fe == null || Fe(ee, re), (Gt.litHtmlVersions ?? (Gt.litHtmlVersions = [])).push("3.3.3");
const ui = (t, e, s) => {
  const i = (s == null ? void 0 : s.renderBefore) ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const o = (s == null ? void 0 : s.renderBefore) ?? null;
    i._$litPart$ = n = new re(e.insertBefore(Qt(), o), o, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nt = globalThis;
let P = class extends Lt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var s;
    const e = super.createRenderRoot();
    return (s = this.renderOptions).renderBefore ?? (s.renderBefore = e.firstChild), e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ui(s, this.renderRoot, this.renderOptions);
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
    return Ht;
  }
};
var Ps;
P._$litElement$ = !0, P.finalized = !0, (Ps = Nt.litElementHydrateSupport) == null || Ps.call(Nt, { LitElement: P });
const Le = Nt.litElementPolyfillSupport;
Le == null || Le({ LitElement: P });
(Nt.litElementVersions ?? (Nt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const mi = { attribute: !0, type: String, converter: ve, reflect: !1, hasChanged: Ge }, fi = (t = mi, e, s) => {
  const { kind: i, metadata: n } = s;
  let o = globalThis.litPropertyMetadata.get(n);
  if (o === void 0 && globalThis.litPropertyMetadata.set(n, o = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), i === "accessor") {
    const { name: r } = s;
    return { set(a) {
      const c = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(r, c, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, t, a), a;
    } };
  }
  if (i === "setter") {
    const { name: r } = s;
    return function(a) {
      const c = this[r];
      e.call(this, a), this.requestUpdate(r, c, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function f(t) {
  return (e, s) => typeof s == "object" ? fi(t, e, s) : ((i, n, o) => {
    const r = n.hasOwnProperty(o);
    return n.constructor.createProperty(o, i), r ? Object.getOwnPropertyDescriptor(n, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function m(t) {
  return f({ ...t, state: !0, attribute: !1 });
}
const L = 5, x = 1440;
function K(t) {
  const [e, s] = t.split(":").map(Number);
  return e * 60 + s;
}
function Z(t) {
  const e = Math.max(0, Math.min(x, Math.round(t / L) * L));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function _t(t, e) {
  var r, a;
  const s = typeof t == "string" ? new Date(t) : t, i = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(s), n = Number(((r = i.find((c) => c.type === "hour")) == null ? void 0 : r.value) ?? 0), o = Number(((a = i.find((c) => c.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return n * 60 + o;
}
function se(t, e) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: e, weekday: "short" }).format(t);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(s);
}
function kt(t, e) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: e }).format(t);
}
function qe(t, e, s) {
  return new Intl.DateTimeFormat(s, { timeZone: e, hour: "2-digit", minute: "2-digit" }).format(
    new Date(t)
  );
}
function A(t) {
  return !t || !("time" in t) ? null : K(t.time);
}
function gi(t, e) {
  const s = (e == null ? void 0 : e.start) ?? A(t.start) ?? 0, i = e ? e.end : A(t.end ?? null);
  return i == null ? [[s, Math.min(x, s + L)]] : i > s ? [[s, i]] : [[s, x]];
}
function Ae(t) {
  const e = [];
  for (const s of t) {
    const i = A(s.start), n = A(s.end ?? null);
    i !== null && n !== null && n <= i && n < 720 && e.push({ slot: s, end: n });
  }
  return e;
}
function Qe(t, e) {
  const s = (Math.round(e) % x + x) % x, i = Math.floor(s / 60), n = s % 60;
  if (t.toLowerCase().startsWith("fr")) return n ? `${i} h ${String(n).padStart(2, "0")}` : `${i} h`;
  const o = new Date(Date.UTC(2e3, 0, 1, i, n)), r = { timeZone: "UTC", hour: "numeric" };
  return n && (r.minute = "2-digit"), new Intl.DateTimeFormat(t, r).format(o).replace(/\s?(AM|PM)/, (a, c) => ` ${c.toLowerCase()}`);
}
function Zt(t, e, s, i = /* @__PURE__ */ new Date()) {
  const n = new Date(t), o = kt(n, e) === kt(i, e), r = Qe(s, _t(n, e));
  return o ? r : `${new Intl.DateTimeFormat(s, { timeZone: e, weekday: "short" }).format(n)} ${r}`;
}
var yi = Object.defineProperty, vi = Object.getOwnPropertyDescriptor, Kt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vi(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && yi(e, s, n), n;
};
let At = class extends P {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this._width = 0;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this._ro = new ResizeObserver((t) => {
      var s;
      const e = Math.round(((s = t[0]) == null ? void 0 : s.contentRect.width) ?? 0);
      e !== this._width && (this._width = e);
    }), this._ro.observe(this));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._ro) == null || t.disconnect();
  }
  /** A label is only drawn when its span is at least 60 px wide (never cut off). */
  _fits(t) {
    return !this.thin && this._width > 0 && (t.end - t.start) / x * this._width >= 60;
  }
  render() {
    const t = (e) => `${e / x * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((e) => e.label).join(", ")}>
        ${this.spans.map(
      (e) => l`<div
            class="span ${e.ignored ? "ignored" : ""}"
            style="left:${t(e.start)};width:${t(Math.max(e.end - e.start, 5))};--c:${e.color}"
            title=${e.label}
          >${this._fits(e) ? l`<span>${e.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : h}${e.label}</span>` : h}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${t(this.now)}"></div>` : h}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 6, 12, 18, 24].map((e) => l`<span style="left:${t(e * 60)}">${e}h</span>`)}</div>` : h}
    `;
  }
};
At.styles = U`
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
    .now {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .hours { position: relative; height: 16px; font-size: 10px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
Kt([
  f({ attribute: !1 })
], At.prototype, "spans", 2);
Kt([
  f({ type: Number })
], At.prototype, "now", 2);
Kt([
  f({ type: Boolean })
], At.prototype, "thin", 2);
Kt([
  f({ type: Boolean, attribute: "show-hours" })
], At.prototype, "showHours", 2);
Kt([
  m()
], At.prototype, "_width", 2);
At = Kt([
  N("wp-day-bar")
], At);
var $i = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, Me = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bi(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && $i(e, s, n), n;
};
let qt = class extends P {
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
    var e, s;
    !this._isPhone() || t.pointerType === "mouse" || t.composedPath().some((i) => i instanceof HTMLElement && i.tagName === "BUTTON") || (this._sw = { id: t.pointerId, y: t.clientY, x: t.clientX, dy: 0 }, (s = (e = t.currentTarget).setPointerCapture) == null || s.call(e, t.pointerId));
  }
  _hmove(t) {
    const e = this._sw;
    if (!e || t.pointerId !== e.id) return;
    e.dy = Math.max(0, t.clientY - e.y);
    const s = this._panel();
    s && (s.style.transition = "none", s.style.transform = `translateY(${e.dy}px)`);
  }
  _hup(t) {
    const e = this._sw;
    if (!e || t.pointerId !== e.id) return;
    this._sw = void 0;
    const s = this._panel(), i = Math.abs(t.clientX - e.x);
    s && (s.style.transition = "", s.style.transform = ""), e.dy >= 100 && i < e.dy && this.close();
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
    return this.open ? l`
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
    ` : l``;
  }
};
qt.styles = U`
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
    header { display: flex; align-items: center; gap: 8px; padding: 16px 16px 8px 20px; }
    header { touch-action: none; }
    h2 {
      flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .content { padding: 8px 20px 16px; overflow-y: auto; }
    footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 8px 16px 16px; }
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
Me([
  f()
], qt.prototype, "heading", 2);
Me([
  f({ type: Boolean, reflect: !0 })
], qt.prototype, "open", 2);
Me([
  f({ type: Boolean })
], qt.prototype, "wide", 2);
qt = Me([
  N("wp-dialog")
], qt);
const wi = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  days_short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  title: "Schedules",
  vacation: "Vacation",
  vacation_on: "Vacation: programs are paused",
  no_program: "No program yet.",
  new_program: "New program",
  until: "until {time}",
  then: "then {mode}",
  now: "Now",
  off_slot: "Outside the schedule",
  default_state: "Default",
  override: "Change for now",
  overridden: "Set by hand",
  overridden_until: "Set by hand until {time}",
  resume: "Resume",
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
  hide_week: "Hide the week",
  skipped_today: "Not today: {reason}",
  reason_empty: "empty with today's sun times",
  reason_too_short: "shorter than 5 minutes",
  reason_overlap: "overlaps another slot",
  reason_skipped_by_dst: "skipped by the time change",
  reason_sun_event_missing: "no such sun event today",
  next_change: "Next change {time}",
  no_change: "No upcoming change",
  skip_next: "Skip next change",
  skip_planned: "Next change skipped",
  profile: "Season",
  modes: "Modes",
  chart: "Chart",
  planned: "Planned",
  applied: "Applied",
  measured: "Measured",
  window_open: "Window open",
  heating: "Heating",
  previous_day: "Previous day",
  next_day: "Next day",
  error: "Error: {message}",
  entity: "Entity",
  clear: "Clear",
  ok: "OK",
  confirm: "Confirm",
  copy: "Copy",
  copy_suffix: "(copy)",
  setpoint: "Setting",
  sp_preset: "Preset",
  sp_temperature: "Temperature",
  sp_hvac_mode: "HVAC mode",
  sp_position: "Position",
  sp_tilt: "Tilt",
  sp_water_heater: "Water heater",
  sp_volume: "Volume",
  sp_source: "Source",
  sp_value: "Value",
  sp_option: "Option",
  sp_scene: "Scene",
  sp_script: "Script",
  sp_action: "Action (service)",
  f_preset: "Preset",
  f_temperature: "Temperature",
  f_hvac_mode: "HVAC mode (optional)",
  f_brightness: "Brightness",
  f_effect: "Effect",
  f_position: "Position",
  f_tilt: "Tilt",
  f_percentage: "Speed",
  f_volume: "Volume",
  f_source: "Source",
  f_value: "Value",
  f_option: "Option",
  f_operation_mode: "Operation mode",
  f_adaptive_switch: "Adaptive Lighting switch (optional)",
  f_adaptive_warning: "The switch drives every light of its zone.",
  f_script: "Script",
  f_scene: "Scene",
  f_action: "Service (domain.service)",
  f_data: "Data (JSON)",
  f_json_invalid: "Invalid JSON object.",
  f_target_self: "Target the entity",
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
  one_shot: "one-shot",
  add_slot: "Add a slot",
  no_slots: "No slots on this day.",
  slot_start: "Start",
  slot_end: "End",
  slot_conditions: "Conditions",
  slot_direct: "Setpoints",
  spill_hint: "The previous day's last slot runs until {time}.",
  slot_title: "Slot",
  time_kind: "Kind of time",
  time_fixed: "Fixed time",
  time_sun: "Sun",
  until_midnight: "Until midnight (24:00)",
  one_shot_check: "One-shot (no end)",
  one_shot_hint: "The action is sent once, at the start time.",
  slot_action: "Action",
  action_modes: "Modes by type",
  action_direct: "Direct setpoints",
  mode_for_type: "Mode for {type}",
  slot_color: "Color (optional)",
  err_start_equals_end: "The start and the end must differ.",
  err_no_action: "Choose at least one mode or setpoint.",
  err_incomplete: "Some fields are empty.",
  err_overlap: "Overlaps the slot {slot}.",
  tab_general: "General",
  tab_entities: "Devices",
  tab_week: "Week",
  pe_name: "Name",
  pe_icon: "Icon (mdi:…)",
  pe_priority: "Priority (1–100)",
  pe_priority_hint: "When two programs drive the same entity, the lowest number wins.",
  pe_enabled: "Program enabled",
  pe_reapply: "Re-apply the current slot after a restart or a change",
  pe_reapply_hint: "Off: after a restart or an edit, nothing is sent until the next change.",
  pe_main_type: "Main type (color of the slots)",
  pe_conditions: "Program conditions",
  pe_conditions_hint: "The program only runs when all conditions are true.",
  pe_no_entity: "No entity yet: add at least one.",
  pe_add_entity: "Add an entity",
  pe_unknown_entity: "unknown entity",
  pe_default: "Outside the schedule",
  pe_default_none: "Do nothing",
  pe_default_previous: "Previous state",
  pe_default_mode: "A mode",
  pe_default_setpoint: "A setpoint",
  pe_permanent: "Permanent override (Evohome)",
  pe_permanent_hint: "Sends the “permanent” preset before the setpoint.",
  profile_default: "Standard week",
  profile_add: "Add a season",
  profile_rename: "Rename the season",
  profile_copy: "Copy the season",
  profile_delete: "Delete the season",
  profile_active_hint: "Active profile (cannot be deleted).",
  profile_rename_warning: "Automations using the old name must be updated.",
  copy_day: "Copy this day to…",
  copy_weekdays: "Mon – Fri",
  copy_mon: "Mon",
  copy_fri: "Fri",
  profile_active: "active",
  copy_weekend: "Sat + Sun",
  copy_all: "Every day",
  copy_choose: "Days",
  copy_warning: "Existing slots of the chosen days are replaced.",
  err_name: "The name is required.",
  err_no_entity: "Add at least one entity.",
  err_profile_name: "Profile names must be unique and not empty.",
  err_overlap_day: "Overlapping slots: {profile}, {day}.",
  err_overlap_server: "Slots overlap on a day.",
  err_unauthorized: "Reserved to administrators.",
  no_modes: "No mode for this type.",
  mode_new: "New mode",
  mode_edit: "Edit the mode",
  mode_name: "Name",
  mode_color: "Color",
  mode_value: "Common value",
  mode_rep_entity: "Sample entity (to read the choices)",
  mode_exceptions: "Exceptions by entity",
  mode_exceptions_hint: "An entity can have its own value for this mode.",
  mode_exceptions_n: "{n} exception(s)",
  mode_add_exception: "Add an exception",
  mode_unused: "No schedule uses it",
  mode_used_one: "Used by {n} program",
  mode_used_many: "Used by {n} programs",
  mode_in_use: "Still used by: {list}",
  ov_current: "Overrides in progress",
  ov_entities: "Devices",
  ov_how_setpoint: "A setpoint",
  ov_how_mode: "A mode",
  ov_duration: "Duration",
  ov_until_next: "Until the next change",
  ov_for: "For",
  ov_hours: "Hours",
  ov_minutes: "Minutes",
  ov_until: "Until",
  ov_date: "Day (optional)",
  ov_until_hint: "Without a day: the next time this hour comes (7 days at most).",
  ov_apply: "Apply",
  ov_err_duration: "Enter a duration.",
  ov_err_week: "An override lasts 7 days at most.",
  ov_err_past: "This time is already past.",
  ov_err_mixed: "Choose entities of the same type.",
  ov_err_no_entity: "Choose at least one entity.",
  ov_err_no_setpoint: "Choose a mode.",
  ce_title: "Title",
  ce_mode: "Content",
  ce_one_program: "One program",
  ce_filtered: "Filtered list",
  ce_program: "Program",
  ce_types: "Types",
  ce_types_hint: "No type checked: all programs.",
  ce_area: "Area (optional)",
  ce_show_week: "Show the week",
  ce_show_chart: "Show the chart",
  today: "Today",
  no_slot_day: "No slot this day.",
  no_data: "No data for this day.",
  chart_loading: "Loading…",
  chart_aria: "Chart of {name}",
  sp_open: "Open",
  sp_close: "Closed",
  sp_on: "On",
  sp_off: "Off",
  sp_auto: "Automatic",
  warn_other_program: "{entity} is also in: {detail} (the higher priority wins)",
  warn_automation: "{entity} is also driven by automations: {detail}",
  warn_scheduler: "{entity} is also driven by Scheduler: {detail}",
  warn_missing: "{entity} does not exist any more",
  warn_vt_follow_underlying: "{entity}: turn off “follow underlying changes” in Versatile Thermostat",
  warn_vt_underlying_scheduled: "{entity} drives {detail}, which is also scheduled",
  warn_vt_locked: "{entity} is locked for automations: setpoints will not be sent",
  // --- simple mode ---
  sm_cooler: "Cooler",
  sm_warmer: "Warmer",
  sm_open: "Open",
  sm_close: "Close",
  sm_on: "Turn on",
  sm_off: "Turn off",
  sm_dimmer: "Dimmer",
  sm_brighter: "Brighter",
  sm_climate: "It is {current} · set to {target}{until}",
  sm_climate_off: "Off · it is {current}",
  sm_heating: "heating",
  sm_until_part: " until {time}",
  sm_cover_open_at: "Open at {pos} %",
  sm_cover_open: "Open",
  sm_cover_closed: "Closed",
  sm_cover_moving: "Moving",
  sm_is_on_at: "On at {pct} %",
  sm_is_on: "On",
  sm_is_off: "Off",
  sm_unavailable: "Unavailable",
  sm_planned: "change planned at {time}",
  sm_others_one: "and 1 other",
  sm_others: "and {n} others",
  sm_hide_others: "Hide",
  sm_change_duration: "Change until when",
  sm_duration_title: "Until when?",
  sm_1h: "1 hour",
  sm_2h: "2 hours",
  sm_tonight: "This evening ({time})",
  sm_all_day: "All day (midnight)",
  sm_done: "Done: {what}",
  sm_resume: "Cancel my change",
  sm_change_schedule: "Change the schedule",
  sm_more: "More options",
  sm_less: "Fewer options",
  sm_disabled: "This program is turned off.",
  sm_mode: "Mode",
  sm_resume_hint_temp: "Back to the planned temperature",
  sm_resume_hint: "Back to the planned setting",
  sm_next_slot: "Until the next schedule ({time})",
  sm_current: "current choice",
  sm_frost_confirm: "This room will no longer be heated (frost protection only). Continue?",
  sm_frost_do: "Continue",
  sm_active: "Program on",
  ce_show_advanced: "Show “More options”",
  cf_title: "Please confirm",
  preset_eco: "Eco",
  preset_comfort: "Comfort",
  preset_boost: "Boost",
  preset_frost: "Frost protection",
  preset_away: "Away",
  preset_home: "Home",
  preset_sleep: "Night",
  preset_none: "—",
  // --- schedule & gestures ---
  ss_title: "Change the schedule",
  ss_day_pick: "Choose the day",
  ss_from: "From",
  ss_to: "to",
  ss_at: "At",
  ss_earlier: "15 min earlier",
  ss_later: "15 min later",
  ss_earlier_aria: "{when}: 15 minutes earlier",
  ss_later_aria: "{when}: 15 minutes later",
  ss_start_lbl: "Start",
  ss_end_lbl: "End",
  ss_next_day: "(the next day)",
  ss_midnight: "(midnight)",
  ss_from_dawn: "From dawn",
  ss_to_dawn: "to dawn",
  ss_from_sunrise: "From sunrise",
  ss_to_sunrise: "to sunrise",
  ss_from_sunset: "From sunset",
  ss_to_sunset: "to sunset",
  ss_from_dusk: "From dusk",
  ss_to_dusk: "to dusk",
  ss_pick_mode: "Choose…",
  ss_when: "When",
  ss_action: "What to do",
  ss_colon: ": ",
  ss_midnight_word: "midnight",
  ss_kind_time: "Exact time",
  ss_kind_sunrise: "Sunrise",
  ss_kind_sunset: "Sunset",
  ss_kind_dawn: "Dawn",
  ss_kind_dusk: "Dusk",
  ss_at_dawn: "At dawn",
  ss_at_sunrise: "At sunrise",
  ss_at_sunset: "At sunset",
  ss_at_dusk: "At dusk",
  ss_the_dawn: "dawn",
  ss_the_sunrise: "sunrise",
  ss_the_sunset: "sunset",
  ss_the_dusk: "dusk",
  ss_off_zero: "at the exact moment",
  ss_off_after: "{d} after",
  ss_off_before: "{d} before",
  ss_act_open: "Open the shutter",
  ss_act_close: "Close the shutter",
  ss_act_fav: "Set the shutter to its favourite position ({n} %)",
  ss_act_pos: "Set the shutter to {n} %",
  ss_act_on: "Turn on",
  ss_act_on_pct: "Turn on at {n} %",
  ss_act_off: "Turn off",
  ss_add_title: "What do you want to add?",
  ss_add_point: "A single time (at one time)",
  ss_add_range: "A period (from… to…)",
  ss_add: "Add a period",
  ss_remove: "Delete this period",
  ss_confirm_remove: "Delete: {time}?",
  ss_copy_title: "Copy this day to:",
  ss_copy_weekdays: "the weekdays",
  ss_copy_weekend: "the weekend",
  ss_copy_all: "the whole week",
  ss_copy_confirm: "Replace {days} with this day?",
  ss_copy_confirm_all: "Replace the {n} other days with this one?",
  ss_copy_do: "Copy",
  ss_empty: "No schedule on this day.",
  ss_season: "Season: {name}",
  ss_err_overlap: "Two schedules overlap on {day}.",
  ss_err_same: "The start and the end are the same on {day}.",
  ss_err_no_mode: "Choose a mode for every schedule ({day}).",
  ss_err_none_modes: "No mode exists yet: create one in “More options”.",
  ss_conflict: "These schedules were changed elsewhere in the meantime. Reload, then make your changes again.",
  ss_reload: "Reload",
  ss_saved: "Schedule saved",
  ss_err_save: "These schedules could not be saved. Try again.",
  zoom: "Zoom",
  zoom_in: "Zoom in",
  zoom_out: "Zoom out",
  longpress_hint: "Tip: press and hold a time slot for a quick menu.",
  copy_to: "Copy to…",
  confirm_delete_slot: "Delete the time slot {time}?",
  copy_slot: "Copy this time slot to…",
  copy_slot_hint: "The slot is added to the chosen days.",
  copy_slot_overlap: "Not copied (it would overlap another slot): {days}.",
  tab_scroll: "Sections (scroll sideways for more)"
}, xi = {
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  days_short: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  title: "Programmes",
  vacation: "Vacances",
  vacation_on: "Vacances : les programmes sont en pause",
  no_program: "Aucun programme pour l'instant.",
  new_program: "Nouveau programme",
  until: "jusqu'à {time}",
  then: "puis {mode}",
  now: "Maintenant",
  off_slot: "En dehors des horaires",
  default_state: "Par défaut",
  override: "Changer pour l'instant",
  overridden: "Réglé à la main",
  overridden_until: "Réglé à la main jusqu'à {time}",
  resume: "Reprendre",
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
  hide_week: "Masquer la semaine",
  skipped_today: "Pas aujourd'hui : {reason}",
  reason_empty: "vide avec les heures solaires du jour",
  reason_too_short: "moins de 5 minutes",
  reason_overlap: "chevauche une autre plage",
  reason_skipped_by_dst: "sautée par le changement d'heure",
  reason_sun_event_missing: "pas d'événement solaire ce jour-là",
  next_change: "Prochain changement {time}",
  no_change: "Aucun changement prévu",
  skip_next: "Sauter le prochain changement",
  skip_planned: "Prochain changement sauté",
  profile: "Saison",
  modes: "Modes",
  chart: "Graphique",
  planned: "Prévu",
  applied: "Appliqué",
  measured: "Mesuré",
  window_open: "Fenêtre ouverte",
  heating: "Chauffe",
  previous_day: "Jour précédent",
  next_day: "Jour suivant",
  error: "Erreur : {message}",
  entity: "Appareil",
  clear: "Effacer",
  ok: "OK",
  confirm: "Confirmer",
  copy: "Copier",
  copy_suffix: "(copie)",
  setpoint: "Réglage",
  sp_preset: "Préréglage",
  sp_temperature: "Température",
  sp_hvac_mode: "Mode de chauffage",
  sp_position: "Position",
  sp_tilt: "Inclinaison",
  sp_water_heater: "Chauffe-eau",
  sp_volume: "Volume",
  sp_source: "Source",
  sp_value: "Valeur",
  sp_option: "Option",
  sp_scene: "Scène",
  sp_script: "Script",
  sp_action: "Action (service)",
  f_preset: "Préréglage",
  f_temperature: "Température",
  f_hvac_mode: "Mode de chauffage (facultatif)",
  f_brightness: "Luminosité",
  f_effect: "Effet",
  f_position: "Position",
  f_tilt: "Inclinaison",
  f_percentage: "Vitesse",
  f_volume: "Volume",
  f_source: "Source",
  f_value: "Valeur",
  f_option: "Option",
  f_operation_mode: "Mode de fonctionnement",
  f_adaptive_switch: "Interrupteur Adaptive Lighting (facultatif)",
  f_adaptive_warning: "L'interrupteur pilote toutes les lumières de sa zone.",
  f_script: "Script",
  f_scene: "Scène",
  f_action: "Service (domaine.service)",
  f_data: "Données (JSON)",
  f_json_invalid: "Objet JSON invalide.",
  f_target_self: "Cibler l'appareil",
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
  one_shot: "ponctuelle",
  add_slot: "Ajouter une plage",
  no_slots: "Aucune plage ce jour-là.",
  slot_start: "Début",
  slot_end: "Fin",
  slot_conditions: "Conditions",
  slot_direct: "Réglages",
  spill_hint: "La dernière plage de la veille se termine à {time}.",
  slot_title: "Plage",
  time_kind: "Type d'heure",
  time_fixed: "Heure fixe",
  time_sun: "Soleil",
  until_midnight: "Jusqu'à minuit (24:00)",
  one_shot_check: "Ponctuelle (sans fin)",
  one_shot_hint: "L'action est envoyée une seule fois, à l'heure de début.",
  slot_action: "Action",
  action_modes: "Modes par type",
  action_direct: "Réglages directs",
  mode_for_type: "Mode pour {type}",
  slot_color: "Couleur (facultatif)",
  err_start_equals_end: "Le début et la fin doivent être différents.",
  err_no_action: "Choisissez au moins un mode ou un réglage.",
  err_incomplete: "Certains champs sont vides.",
  err_overlap: "Chevauche la plage {slot}.",
  tab_general: "Général",
  tab_entities: "Appareils",
  tab_week: "Semaine",
  pe_name: "Nom",
  pe_icon: "Icône (mdi:…)",
  pe_priority: "Priorité (1–100)",
  pe_priority_hint: "Si deux programmes pilotent le même appareil, le plus petit numéro l'emporte.",
  pe_enabled: "Programme actif",
  pe_reapply: "Réappliquer la plage en cours après un redémarrage ou une modification",
  pe_reapply_hint: "Désactivé : après un redémarrage ou une modification, rien n'est envoyé avant le prochain changement.",
  pe_main_type: "Type principal (couleur des plages)",
  pe_conditions: "Conditions du programme",
  pe_conditions_hint: "Le programme ne s'exécute que si toutes les conditions sont vraies.",
  pe_no_entity: "Aucun appareil : ajoutez-en au moins un.",
  pe_add_entity: "Ajouter un appareil",
  pe_unknown_entity: "appareil inconnu",
  pe_default: "En dehors des horaires",
  pe_default_none: "Ne rien faire",
  pe_default_previous: "État d'avant",
  pe_default_mode: "Un mode",
  pe_default_setpoint: "Un réglage",
  pe_permanent: "Dérogation permanente (Evohome)",
  pe_permanent_hint: "Envoie le préréglage « permanent » avant le réglage.",
  profile_default: "Semaine type",
  profile_add: "Ajouter une saison",
  profile_rename: "Renommer la saison",
  profile_copy: "Copier la saison",
  profile_delete: "Supprimer la saison",
  profile_active_hint: "Saison active (ne peut pas être supprimée).",
  profile_rename_warning: "Les automatisations qui utilisent l'ancien nom sont à mettre à jour.",
  copy_day: "Copier ce jour vers…",
  copy_weekdays: "Lun – Ven",
  copy_mon: "Lun",
  copy_fri: "Ven",
  profile_active: "active",
  copy_weekend: "Sam + Dim",
  copy_all: "Tous les jours",
  copy_choose: "Jours",
  copy_warning: "Les plages existantes des jours choisis sont remplacées.",
  err_name: "Le nom est obligatoire.",
  err_no_entity: "Ajoutez au moins un appareil.",
  err_profile_name: "Les noms de saison doivent être uniques et non vides.",
  err_overlap_day: "Plages qui se chevauchent : {profile}, {day}.",
  err_overlap_server: "Des plages se chevauchent un jour.",
  err_unauthorized: "Réservé aux administrateurs.",
  no_modes: "Aucun mode pour ce type.",
  mode_new: "Nouveau mode",
  mode_edit: "Modifier le mode",
  mode_name: "Nom",
  mode_color: "Couleur",
  mode_value: "Valeur commune",
  mode_rep_entity: "Appareil de référence (pour lire les choix)",
  mode_exceptions: "Exceptions par appareil",
  mode_exceptions_hint: "Un appareil peut avoir sa propre valeur pour ce mode.",
  mode_exceptions_n: "{n} exception(s)",
  mode_add_exception: "Ajouter une exception",
  mode_unused: "Aucun horaire ne l'utilise",
  mode_used_one: "Utilisé par {n} programme",
  mode_used_many: "Utilisé par {n} programmes",
  mode_in_use: "Encore utilisé par : {list}",
  ov_current: "Dérogations en cours",
  ov_entities: "Appareils",
  ov_how_setpoint: "Un réglage",
  ov_how_mode: "Un mode",
  ov_duration: "Durée",
  ov_until_next: "Jusqu'au prochain changement",
  ov_for: "Pendant",
  ov_hours: "Heures",
  ov_minutes: "Minutes",
  ov_until: "Jusqu'à",
  ov_date: "Jour (facultatif)",
  ov_until_hint: "Sans jour : la prochaine fois que cette heure arrive (7 jours au plus).",
  ov_apply: "Appliquer",
  ov_err_duration: "Indiquez une durée.",
  ov_err_week: "Une dérogation dure 7 jours au plus.",
  ov_err_past: "Cette heure est déjà passée.",
  ov_err_mixed: "Choisissez des appareils du même type.",
  ov_err_no_entity: "Choisissez au moins un appareil.",
  ov_err_no_setpoint: "Choisissez un mode.",
  ce_title: "Titre",
  ce_mode: "Contenu",
  ce_one_program: "Un programme",
  ce_filtered: "Liste filtrée",
  ce_program: "Programme",
  ce_types: "Types",
  ce_types_hint: "Aucun type coché : tous les programmes.",
  ce_area: "Zone (facultatif)",
  ce_show_week: "Afficher la semaine",
  ce_show_chart: "Afficher le graphique",
  today: "Aujourd'hui",
  no_slot_day: "Aucune plage ce jour-là.",
  no_data: "Pas de données pour ce jour.",
  chart_loading: "Chargement…",
  chart_aria: "Graphique de {name}",
  sp_open: "Ouvert",
  sp_close: "Fermé",
  sp_on: "Allumé",
  sp_off: "Éteint",
  sp_auto: "Automatique",
  warn_other_program: "{entity} est aussi dans : {detail} (le plus prioritaire l'emporte)",
  warn_automation: "{entity} est aussi piloté par des automatisations : {detail}",
  warn_scheduler: "{entity} est aussi piloté par Scheduler : {detail}",
  warn_missing: "{entity} n'existe plus",
  warn_vt_follow_underlying: "{entity} : désactivez « suivre les changements du sous-jacent » dans Versatile Thermostat",
  warn_vt_underlying_scheduled: "{entity} pilote {detail}, qui est aussi programmé",
  warn_vt_locked: "{entity} est verrouillé pour les automatisations : les réglages ne seront pas envoyés",
  // --- simple mode ---
  sm_cooler: "Moins chaud",
  sm_warmer: "Plus chaud",
  sm_open: "Ouvrir",
  sm_close: "Fermer",
  sm_on: "Allumer",
  sm_off: "Éteindre",
  sm_dimmer: "Moins lumineux",
  sm_brighter: "Plus lumineux",
  sm_climate: "Il fait {current} · réglé sur {target}{until}",
  sm_climate_off: "Éteint · il fait {current}",
  sm_heating: "chauffe",
  sm_until_part: " jusqu'à {time}",
  sm_cover_open_at: "Ouvert à {pos} %",
  sm_cover_open: "Ouvert",
  sm_cover_closed: "Fermé",
  sm_cover_moving: "En mouvement",
  sm_is_on_at: "Allumée à {pct} %",
  sm_is_on: "Allumé",
  sm_is_off: "Éteint",
  sm_unavailable: "Indisponible",
  sm_planned: "changement prévu à {time}",
  sm_others_one: "et 1 autre",
  sm_others: "et {n} autres",
  sm_hide_others: "Masquer",
  sm_change_duration: "Changer jusqu'à quand",
  sm_duration_title: "Jusqu'à quand ?",
  sm_1h: "1 heure",
  sm_2h: "2 heures",
  sm_tonight: "Ce soir ({time})",
  sm_all_day: "Toute la journée (minuit)",
  sm_done: "C'est fait : {what}",
  sm_resume: "Annuler mon changement",
  sm_change_schedule: "Changer les horaires",
  sm_more: "Plus d'options",
  sm_less: "Moins d'options",
  sm_disabled: "Ce programme est arrêté.",
  sm_mode: "Mode",
  sm_resume_hint_temp: "Revenir à la température prévue",
  sm_resume_hint: "Revenir au réglage prévu",
  sm_next_slot: "Jusqu'au prochain horaire ({time})",
  sm_current: "choix actuel",
  sm_frost_confirm: "Cette pièce ne sera plus chauffée (protection contre le gel seulement). Continuer ?",
  sm_frost_do: "Continuer",
  sm_active: "Programme actif",
  ce_show_advanced: "Afficher « Plus d'options »",
  cf_title: "Veuillez confirmer",
  preset_eco: "Éco",
  preset_comfort: "Confort",
  preset_boost: "Boost",
  preset_frost: "Hors-gel",
  preset_away: "Absent",
  preset_home: "Maison",
  preset_sleep: "Nuit",
  preset_none: "—",
  // --- schedule & gestures ---
  ss_title: "Changer les horaires",
  ss_day_pick: "Choisir le jour",
  ss_from: "De",
  ss_to: "à",
  ss_at: "À",
  ss_earlier: "15 min plus tôt",
  ss_later: "15 min plus tard",
  ss_earlier_aria: "{when} : 15 minutes plus tôt",
  ss_later_aria: "{when} : 15 minutes plus tard",
  ss_start_lbl: "Début",
  ss_end_lbl: "Fin",
  ss_next_day: "(le lendemain)",
  ss_midnight: "(minuit)",
  ss_from_dawn: "De l'aube",
  ss_to_dawn: "à l'aube",
  ss_from_sunrise: "Du lever du soleil",
  ss_to_sunrise: "au lever du soleil",
  ss_from_sunset: "Du coucher du soleil",
  ss_to_sunset: "au coucher du soleil",
  ss_from_dusk: "Du crépuscule",
  ss_to_dusk: "au crépuscule",
  ss_pick_mode: "Choisir…",
  ss_when: "Quand",
  ss_action: "Que faire ?",
  ss_colon: " : ",
  ss_midnight_word: "minuit",
  ss_kind_time: "Heure précise",
  ss_kind_sunrise: "Lever du soleil",
  ss_kind_sunset: "Coucher du soleil",
  ss_kind_dawn: "Aube",
  ss_kind_dusk: "Crépuscule",
  ss_at_dawn: "À l'aube",
  ss_at_sunrise: "Au lever du soleil",
  ss_at_sunset: "Au coucher du soleil",
  ss_at_dusk: "Au crépuscule",
  ss_the_dawn: "l'aube",
  ss_the_sunrise: "le lever du soleil",
  ss_the_sunset: "le coucher du soleil",
  ss_the_dusk: "le crépuscule",
  ss_off_zero: "au moment même",
  ss_off_after: "{d} après",
  ss_off_before: "{d} avant",
  ss_act_open: "Ouvrir le volet",
  ss_act_close: "Fermer le volet",
  ss_act_fav: "Mettre le volet en position favorite ({n} %)",
  ss_act_pos: "Mettre le volet à {n} %",
  ss_act_on: "Allumer",
  ss_act_on_pct: "Allumer à {n} %",
  ss_act_off: "Éteindre",
  ss_add_title: "Que voulez-vous ajouter ?",
  ss_add_point: "Un horaire (à une heure)",
  ss_add_range: "Une période (de… à…)",
  ss_add: "Ajouter une période",
  ss_remove: "Supprimer cette période",
  ss_confirm_remove: "Supprimer : {time} ?",
  ss_copy_title: "Copier ce jour sur :",
  ss_copy_weekdays: "les jours de semaine",
  ss_copy_weekend: "le week-end",
  ss_copy_all: "toute la semaine",
  ss_copy_confirm: "Remplacer {days} par celui-ci ?",
  ss_copy_confirm_all: "Remplacer les {n} autres jours par celui-ci ?",
  ss_copy_do: "Copier",
  ss_empty: "Aucun horaire ce jour-là.",
  ss_season: "Saison : {name}",
  ss_err_overlap: "Deux horaires se chevauchent : {day}.",
  ss_err_same: "Le début et la fin sont identiques : {day}.",
  ss_err_no_mode: "Choisissez un mode pour chaque horaire ({day}).",
  ss_err_none_modes: "Aucun mode n'existe encore : créez-en un dans « Plus d'options ».",
  ss_conflict: "Ces horaires ont été modifiés ailleurs entre-temps. Rechargez, puis refaites vos changements.",
  ss_reload: "Recharger",
  ss_saved: "Horaires enregistrés",
  ss_err_save: "Impossible d'enregistrer ces horaires. Réessayez.",
  zoom: "Zoom",
  zoom_in: "Agrandir",
  zoom_out: "Réduire",
  longpress_hint: "Astuce : un appui long sur un horaire ouvre un menu rapide.",
  copy_to: "Copier vers…",
  confirm_delete_slot: "Supprimer la plage {time} ?",
  copy_slot: "Copier cette plage vers…",
  copy_slot_hint: "La plage est ajoutée aux jours choisis.",
  copy_slot_overlap: "Non copiée (elle chevaucherait une autre plage) : {days}.",
  tab_scroll: "Rubriques (faire défiler pour en voir plus)"
};
function T(t) {
  return t.startsWith("fr") ? xi : wi;
}
function C(t, e, s = {}) {
  let i = T(t)[e];
  for (const [n, o] of Object.entries(s)) i = i.replace(`{${n}}`, o);
  return i;
}
var ki = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, D = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Si(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && ki(e, s, n), n;
};
const st = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? (t == null ? void 0 : t.language) ?? "en";
}, W = (t) => t === "input_boolean" ? "switch" : t;
function Ee(t, e) {
  const s = T(t)[`type_${e}`];
  return typeof s == "string" ? s : e;
}
const Ci = [
  "climate",
  "cover",
  "light",
  "switch",
  "input_boolean",
  "fan",
  "water_heater",
  "media_player",
  "input_number",
  "input_select"
], lt = U`
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
  input[type="checkbox"], input[type="radio"] { width: 20px; height: 20px; margin: 0; accent-color: var(--primary-color); }
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
function ts(t, e, s) {
  t.dispatchEvent(new CustomEvent(e, { detail: s, bubbles: !0, composed: !0 }));
}
function be(t, e) {
  if (!e) return "";
  const s = e, i = (n) => C(t, `sp_${n}`);
  switch (e.kind) {
    case "preset":
      return `${es(t, String(s.preset))}${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
    case "temperature":
      return `${s.temperature} °C${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
    case "hvac_mode":
      return `${i("hvac_mode")} ${s.hvac_mode}`;
    case "position":
      return `${i("position")} ${s.position} %`;
    case "tilt":
      return `${i("tilt")} ${s.tilt} %`;
    case "on": {
      const n = [
        s.brightness !== void 0 ? `${s.brightness} %` : "",
        s.percentage !== void 0 ? `${s.percentage} %` : "",
        s.effect ?? ""
      ].filter(Boolean).join(" · ");
      return n ? `${i("on")} · ${n}` : i("on");
    }
    case "volume":
      return `${i("volume")} ${s.volume} %`;
    case "source":
      return `${s.source}`;
    case "value":
      return `${s.value}`;
    case "option":
      return `${s.option}`;
    case "water_heater":
      return [s.operation_mode, s.temperature !== void 0 && s.temperature !== null ? `${s.temperature} °C` : ""].filter(Boolean).join(" · ");
    case "scene":
      return `${i("scene")} ${s.scene ?? ""}`;
    case "script":
      return `${i("script")} ${s.script ?? ""}`;
    case "action":
      return `${s.action ?? ""}`;
    default:
      return i(e.kind);
  }
}
let ft = class extends P {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var t;
    return Object.keys(((t = this.hass) == null ? void 0 : t.states) ?? {}).filter((e) => !this.domains.length || this.domains.includes(k(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
  }
  _emit(t) {
    ts(this, "wp-change", t);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const e = this.filter;
      return l`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${e ? (s) => e(s.entity_id) : void 0}
        @value-changed=${(s) => {
        s.stopPropagation(), this._emit(s.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const t = this._ids().slice(0, 600);
    return l`
      <div class="field">
        ${this.label ? l`<label>${this.label}</label>` : h}
        <input type="text" list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(e) => {
      const s = e.target.value.trim();
      (s === "" || this.hass.states[s]) && this._emit(s);
    }}
          @input=${(e) => {
      const s = e.target.value.trim();
      this.hass.states[s] && s !== this.value && this._emit(s);
    }} />
        <datalist id=${this._listId}>
          ${t.map((e) => l`<option value=${e}>${oe(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
  }
};
ft.styles = [lt, U`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
D([
  f({ attribute: !1 })
], ft.prototype, "hass", 2);
D([
  f()
], ft.prototype, "value", 2);
D([
  f()
], ft.prototype, "label", 2);
D([
  f({ attribute: !1 })
], ft.prototype, "domains", 2);
D([
  f({ attribute: !1 })
], ft.prototype, "exclude", 2);
D([
  f({ attribute: !1 })
], ft.prototype, "filter", 2);
ft = D([
  N("wp-entity-picker")
], ft);
let ie = class extends P {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t) {
    return C(this._lang, t);
  }
  _set(t) {
    ts(this, "wp-change", t);
  }
  _patch(t, e) {
    this._set(this.conditions.map((s, i) => i === t ? { ...s, ...e } : s));
  }
  _parse(t, e) {
    const s = t.trim();
    return s !== "" && !Number.isNaN(Number(s)) ? Number(s) : e && s === "true" ? !0 : e && s === "false" ? !1 : t;
  }
  render() {
    return l`
      ${this.conditions.map(
      (t, e) => l`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${t.entity_id} .label=${this._tr("entity")}
              @wp-change=${(s) => {
        s.stopPropagation(), this._patch(e, { entity_id: s.detail });
      }}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${t.attribute ?? ""} placeholder="—"
                  @change=${(s) => this._patch(e, { attribute: s.target.value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(s) => this._patch(e, { op: s.target.value })}>
                  ${["eq", "ne", "lt", "gt"].map(
        (s) => l`<option value=${s} ?selected=${(t.op ?? "eq") === s}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[s]}</option>`
      )}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(t.value ?? "")}
                  @change=${(s) => this._patch(e, { value: this._parse(s.target.value, !!t.attribute) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((s, i) => i !== e))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`
    )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }
};
ie.styles = lt;
D([
  f({ attribute: !1 })
], ie.prototype, "hass", 2);
D([
  f({ attribute: !1 })
], ie.prototype, "conditions", 2);
ie = D([
  N("wp-conditions-editor")
], ie);
const Is = {
  climate: ["preset", "temperature", "hvac_mode", "off"],
  cover: ["open", "close", "position", "tilt"],
  light: ["on", "off", "auto"],
  switch: ["on", "off"],
  input_boolean: ["on", "off"],
  fan: ["on", "off"],
  water_heater: ["water_heater"],
  media_player: ["on", "off", "volume", "source"],
  input_number: ["value"],
  input_select: ["option"]
}, Ai = ["scene", "script", "action"];
function ne(t, e) {
  const s = Is[k(e)];
  return Ve(t, e, s ? s[0] : "action");
}
function Ve(t, e, s) {
  var n, o, r, a, c, d;
  const i = ((n = t == null ? void 0 : t.states[e]) == null ? void 0 : n.attributes) ?? {};
  switch (s) {
    case "preset":
      return { kind: s, preset: ((o = i.preset_modes) == null ? void 0 : o[0]) ?? "" };
    case "temperature":
      return { kind: s, temperature: Number(i.temperature ?? i.min_temp ?? 20) };
    case "hvac_mode":
      return { kind: s, hvac_mode: ((r = i.hvac_modes) == null ? void 0 : r.find((u) => u !== "off")) ?? "heat" };
    case "position":
      return { kind: s, position: 50 };
    case "tilt":
      return { kind: s, tilt: 50 };
    case "volume":
      return { kind: s, volume: 30 };
    case "source":
      return { kind: s, source: ((a = i.source_list) == null ? void 0 : a[0]) ?? "" };
    case "value":
      return { kind: s, value: Number(i.min ?? 0) };
    case "option":
      return { kind: s, option: ((c = i.options) == null ? void 0 : c[0]) ?? "" };
    case "water_heater":
      return { kind: s, operation_mode: ((d = i.operation_list) == null ? void 0 : d[0]) ?? "", temperature: Number(i.temperature ?? 50) };
    case "scene":
      return { kind: s, scene: "" };
    case "script":
      return { kind: s, script: "" };
    case "action":
      return { kind: s, action: "", data: {} };
    default:
      return { kind: s };
  }
}
let rt = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  get _domain() {
    return k(this.entityId);
  }
  get _attrs() {
    var t, e;
    return ((e = (t = this.hass) == null ? void 0 : t.states[this.entityId]) == null ? void 0 : e.attributes) ?? {};
  }
  _kinds() {
    var n;
    const t = Is[this._domain] ?? [], e = !this.stateOnly && this.admin ? Ai : [], s = (n = this.value) == null ? void 0 : n.kind, i = [...t, ...e];
    return s && !i.includes(s) && i.push(s), i;
  }
  _current() {
    return this.value ?? Ve(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(t) {
    const e = { kind: t.kind };
    for (const [s, i] of Object.entries(t))
      s !== "kind" && i !== void 0 && i !== "" && !(typeof i == "number" && Number.isNaN(i)) && (e[s] = i);
    t.kind === "scene" && (e.scene = t.scene ?? ""), t.kind === "script" && (e.script = t.script ?? ""), t.kind === "action" && (e.action = t.action ?? "", e.data = t.data ?? {}), t.kind === "preset" && (e.preset = t.preset ?? ""), ts(this, "wp-change", e);
  }
  _patch(t) {
    this._emit({ ...this._current(), ...t });
  }
  _number(t, e, s, i, n = 1, o = "") {
    const r = this._current();
    return l`
      <div class="field">
        <label>${this._tr(t)}${o ? ` (${o})` : ""}</label>
        <input type="number" min=${s} max=${i} step=${n} .value=${r[e] === void 0 ? "" : String(r[e])}
          @change=${(a) => {
      const c = a.target.value;
      this._patch({ [e]: c === "" ? void 0 : Math.min(i, Math.max(s, Number(c))) });
    }} />
      </div>`;
  }
  _choice(t, e, s, i = !1, n = !1) {
    const r = this._current()[e] ?? "";
    if (!(s != null && s.length) && !i && n)
      return l`<div class="field"><label>${this._tr(t)}</label>
        <input type="text" .value=${r} @change=${(c) => this._patch({ [e]: c.target.value })} /></div>`;
    const a = s ?? [];
    return l`
      <div class="field">
        <label>${this._tr(t)}</label>
        <select @change=${(c) => this._patch({ [e]: c.target.value || void 0 })}>
          ${i ? l`<option value="" ?selected=${r === ""}>—</option>` : h}
          ${!a.includes(r) && r ? l`<option value=${r} selected>${r}</option>` : h}
          ${a.map((c) => l`<option value=${c} ?selected=${c === r}>${c}</option>`)}
        </select>
      </div>`;
  }
  _fields(t) {
    const e = this._attrs;
    switch (t.kind) {
      case "preset":
        return l`${this._choice("f_preset", "preset", e.preset_modes, !1, !0)}${this._choice("f_hvac_mode", "hvac_mode", e.hvac_modes, !0)}`;
      case "temperature":
        return l`${this._number("f_temperature", "temperature", e.min_temp ?? 5, e.max_temp ?? 35, e.target_temp_step ?? 0.5, "°C")}${this._choice("f_hvac_mode", "hvac_mode", e.hvac_modes, !0)}`;
      case "hvac_mode":
        return this._choice("f_hvac_mode", "hvac_mode", e.hvac_modes, !1, !0);
      case "position":
        return this._number("f_position", "position", 0, 100, 1, "%");
      case "tilt":
        return this._number("f_tilt", "tilt", 0, 100, 1, "%");
      case "volume":
        return this._number("f_volume", "volume", 0, 100, 1, "%");
      case "source":
        return this._choice("f_source", "source", e.source_list, !1, !0);
      case "value":
        return this._number("f_value", "value", e.min ?? -1e6, e.max ?? 1e6, e.step ?? 1);
      case "option":
        return this._choice("f_option", "option", e.options, !1, !0);
      case "on":
        return this._domain === "light" ? l`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", e.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : h;
      case "auto":
        return l`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${t.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(s) => s.startsWith("switch.adaptive_lighting")}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ adaptive_switch: s.detail || void 0 });
        }}></wp-entity-picker>
            ${t.adaptive_switch ? l`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : h}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${t.script ?? ""} .domains=${["script"]}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail || void 0 });
        }}></wp-entity-picker></div>`;
      case "water_heater":
        return l`${this._choice("f_operation_mode", "operation_mode", e.operation_list, !0)}${this._number("f_temperature", "temperature", e.min_temp ?? 20, e.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return l`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${t.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ scene: s.detail });
        }}></wp-entity-picker></div>`;
      case "script":
        return l`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${t.script ?? ""} .domains=${["script"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail });
        }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(t);
      default:
        return h;
    }
  }
  _actionFields(t) {
    const e = JSON.stringify(t.data ?? {}, null, 2);
    return this._jsonFor !== this.entityId + e && !this._jsonError && (this._json = e, this._jsonFor = this.entityId + e), l`
      <div class="field"><label>${this._tr("f_action")}</label>
        <input type="text" .value=${t.action ?? ""} placeholder="light.turn_on"
          @change=${(s) => this._patch({ action: s.target.value.trim() })} /></div>
      <div class="field"><label>${this._tr("f_data")}</label>
        <textarea .value=${this._json} spellcheck="false"
          @input=${(s) => {
      const i = s.target.value;
      this._json = i;
      try {
        const n = i.trim() ? JSON.parse(i) : {};
        if (n === null || typeof n != "object" || Array.isArray(n)) throw new Error("object");
        this._jsonError = !1, this._jsonFor = this.entityId + JSON.stringify(n, null, 2), this._patch({ data: n });
      } catch {
        this._jsonError = !0;
      }
    }}></textarea>
        ${this._jsonError ? l`<span class="error">${this._tr("f_json_invalid")}</span>` : h}</div>
      <label class="check"><input type="checkbox" .checked=${t.target_self !== !1}
        @change=${(s) => this._patch({ target_self: s.target.checked ? void 0 : !1 })} />
        ${this._tr("f_target_self")}</label>`;
  }
  render() {
    const t = this._kinds(), e = this._current();
    return l`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(s) => this._emit(Ve(this.hass, this.entityId, s.target.value))}>
          ${t.map((s) => l`<option value=${s} ?selected=${s === e.kind}>${this._tr(`sp_${s}`)}</option>`)}
        </select>
      </div>
      ${this._fields(e)}
    `;
  }
};
rt.styles = lt;
D([
  f({ attribute: !1 })
], rt.prototype, "hass", 2);
D([
  f({ attribute: "entity-id" })
], rt.prototype, "entityId", 2);
D([
  f({ attribute: !1 })
], rt.prototype, "value", 2);
D([
  f({ type: Boolean })
], rt.prototype, "admin", 2);
D([
  f({ type: Boolean, attribute: "state-only" })
], rt.prototype, "stateOnly", 2);
D([
  m()
], rt.prototype, "_json", 2);
D([
  m()
], rt.prototype, "_jsonError", 2);
rt = D([
  N("wp-setpoint-editor")
], rt);
let _e, Ot;
const ue = /* @__PURE__ */ new Set();
function Mi(t, e) {
  return ue.add(e), _e && e(_e), Ot || (Ot = t.connection.subscribeMessage(
    (s) => {
      _e = s, ue.forEach((i) => i(s));
    },
    { type: "weekly_planner/subscribe" }
  ), Ot.catch(() => {
    Ot = void 0;
  })), () => {
    ue.delete(e), ue.size === 0 && Ot && (Ot.then((s) => s()).catch(() => {
    }), Ot = void 0, _e = void 0);
  };
}
const k = (t) => t.split(".")[0];
function ot(t) {
  var e;
  return t.main_type || k(((e = t.entities[0]) == null ? void 0 : e.entity_id) ?? "climate");
}
function St(t, e) {
  var i;
  const s = ((i = e.status[t.id]) == null ? void 0 : i.active_profile) ?? t.active_profile;
  return t.profiles.find((n) => n.id === s) ?? t.profiles[0];
}
function ae(t, e, s) {
  const i = t.actions.by_type[ot(e)] ?? Object.values(t.actions.by_type)[0];
  return s.find((n) => n.id === i);
}
function ut(t, e, s) {
  var i;
  return t.color || ((i = ae(t, e, s)) == null ? void 0 : i.color) || "var(--secondary-text-color)";
}
function Ut(t, e, s, i) {
  const n = ae(t, e, s);
  if (n) return n.name;
  const o = e.entities.map((r) => t.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return o.length ? o.length > 1 ? `${be(i, o[0])} +${o.length - 1}` : be(i, o[0]) : "";
}
function oe(t, e) {
  var s;
  return ((s = t.states[e]) == null ? void 0 : s.attributes.friendly_name) ?? e;
}
function vs(t, e) {
  var n, o;
  if (e.program) return t.programs.filter((r) => r.id === e.program);
  const s = (n = e.filter) == null ? void 0 : n.types, i = (o = e.filter) == null ? void 0 : o.area;
  return t.programs.filter((r) => !(s != null && s.length) || r.entities.some((a) => s.includes(k(a.entity_id)))).filter((r) => !i || r.area === i).sort((r, a) => r.priority - a.priority || r.name.localeCompare(a.name));
}
function wt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function Us(t, e) {
  return new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e);
}
const we = (t, e) => `${Us(t, e)} °C`;
function es(t, e) {
  const s = T(t)[`preset_${e}`];
  return typeof s == "string" ? s : e;
}
const pt = (t, e) => {
  var s;
  return ((s = t.exceptions) == null ? void 0 : s[e]) ?? t.value;
};
function Ei(t, e, s) {
  var o, r, a;
  const i = ((o = t.states[e]) == null ? void 0 : o.attributes) ?? {}, n = s;
  return s.kind === "preset" ? ((r = i.preset_modes) == null ? void 0 : r.includes(n.preset)) ?? !1 : s.kind === "hvac_mode" ? ((a = i.hvac_modes) == null ? void 0 : a.includes(n.hvac_mode)) ?? !1 : s.kind === "tilt" ? i.current_tilt_position !== void 0 : !0;
}
function xe(t, e, s, i) {
  const n = JSON.stringify(i), o = e.find((c) => JSON.stringify(pt(c, s)) === n);
  if (o) return o.name;
  const r = i, a = T(t);
  switch (i.kind) {
    case "preset":
      return es(t, String(r.preset));
    case "temperature":
      return we(t, Number(r.temperature));
    case "open":
      return a.sp_open;
    case "close":
      return a.sp_close;
    case "off":
      return a.sp_off;
    case "on":
      return r.brightness !== void 0 ? `${a.sp_on} · ${r.brightness} %` : a.sp_on;
    default:
      return be(t, i);
  }
}
function Pi(t, e, s = 7, i = 35) {
  return Math.min(i, Math.max(s, Math.round((t + e * 0.5) * 2) / 2));
}
const jt = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
function Ti(t, e, s) {
  var n, o, r;
  const i = ((n = t.states[e]) == null ? void 0 : n.attributes) ?? {};
  return jt((o = i.preset_temperatures) == null ? void 0 : o[s]) ?? jt((r = i.preset_temperatures) == null ? void 0 : r[`${s}_temp`]) ?? jt(i[`${s}_temp`]) ?? jt(i[`${s}_temperature`]);
}
function Rs(t, e, s) {
  const i = pt(e, s);
  return i.kind === "temperature" ? jt(i.temperature) : i.kind === "preset" ? Ti(t, s, String(i.preset)) : null;
}
function Fs(t, e, s, i) {
  const n = pt(s, i), o = Rs(t, s, i);
  return o !== null ? we(e, o) : n.kind === "position" && jt(n.position) !== null ? `${n.position} %` : n.kind === "on" && jt(n.brightness) !== null ? `${n.brightness} %` : "";
}
function zi(t, e, s) {
  if (k(s) !== "climate") return !1;
  const i = pt(e, s);
  if (i.kind === "preset" && i.preset === "frost") return !0;
  const n = Rs(t, e, s);
  return n !== null && n <= 10;
}
var Oi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, it = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Di(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && Oi(e, s, n), n;
};
function $s(t, e) {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(t)), i = (o) => {
    var r;
    return Number(((r = s.find((a) => a.type === o)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(i("year"), i("month") - 1, i("day"), i("hour"), i("minute"), i("second")) - Math.floor(t / 1e3) * 1e3;
}
function bs(t, e) {
  const [s, i, n] = t.split("-").map(Number), o = Date.UTC(s, i - 1, n), r = o - $s(o, e);
  return o - $s(r, e);
}
function Ls(t, e) {
  const [s, i, n] = t.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, n + e)).toISOString().slice(0, 10);
}
function me(t, e) {
  return { startMs: bs(t, e), endMs: bs(Ls(t, 1), e) };
}
function Wt(t) {
  const [e, s, i] = t.split("-").map(Number);
  return se(new Date(Date.UTC(e, s - 1, i, 12)), "UTC");
}
const We = /* @__PURE__ */ new Map();
function ws(t, e, s) {
  const i = We.get(t);
  if (i && Date.now() - i.at < e) return i.p;
  const n = s();
  return We.set(t, { at: Date.now(), p: n }), n.catch(() => We.delete(t)), n;
}
const xs = "var(--disabled-text-color, #9e9e9e)";
function ks(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  let s = {};
  for (const i of t) {
    i.a && (s = i.a);
    const n = i.lu ?? i.lc ?? i.last_updated_ts, o = typeof n == "number" ? n * 1e3 : Date.parse(i.last_updated ?? "");
    Number.isNaN(o) || e.push({ t: o, s: String(i.s ?? i.state ?? ""), a: s });
  }
  return e;
}
const ji = (t) => t === "unavailable" || t === "unknown" || t === "", B = (t) => typeof t == "number" && Number.isFinite(t) ? t : null;
let q = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._cursor = null, this._model = null, this._token = 0;
  }
  get _lang() {
    var t, e, s;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((s = this.hass) == null ? void 0 : s.language) ?? "en";
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
    this._loaded = null, this._failed = !1, this._cursor = null;
    const { startMs: s, endMs: i } = me(this.date, this._tz), n = Date.now(), r = i > n ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const c = s < n ? ws(`h|${t}|${a}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(s).toISOString(),
        end_time: new Date(Math.min(i, n)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), d = Math.min(14, Math.max(1, Math.ceil((n - s) / 864e5) + 1)), u = s < n ? ws(`j|${this.entityId}|${d}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: d })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, y] = await Promise.all([c, u]);
      if (e !== this._token) return;
      this._loaded = {
        hist: ks(_[this.entityId]),
        win: a ? ks(_[a]) : [],
        journal: (y.segments ?? []).filter((v) => v.entity_id === this.entityId)
      };
    } catch {
      e === this._token && (this._failed = !0);
    }
  }
  /** A window binary sensor of a thermostat (id contains the climate name and "window"). */
  _windowSensor() {
    if (k(this.entityId) !== "climate") return null;
    const t = this.entityId.split(".")[1];
    return Object.keys(this.hass.states).find(
      (e) => e.startsWith("binary_sensor.") && e.includes(t) && e.includes("window")
    ) ?? null;
  }
  // ---- values ----
  _modeSetpoint(t, e) {
    var i;
    const s = this.data.modes.find((n) => n.id === t);
    return s ? ((i = s.exceptions) == null ? void 0 : i[e]) ?? s.value : null;
  }
  _slotSetpoint(t) {
    return t.actions.by_entity[this.entityId] ?? this._modeSetpoint(t.actions.by_type[k(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(t) {
    if (!t) return null;
    const e = k(this.entityId);
    if (e === "climate") {
      const s = B(t.temperature);
      return s !== null ? s : t.kind === "preset" ? this._presetTemperature(String(t.preset)) : null;
    }
    return e === "cover" ? t.kind === "open" ? 100 : t.kind === "close" ? 0 : t.kind === "position" ? B(t.position) : null : e === "light" ? t.kind === "off" ? 0 : t.kind === "on" ? B(t.brightness) ?? 100 : null : t.kind === "value" ? B(t.value) : null;
  }
  _presetTemperature(t) {
    var a, c;
    const e = ((a = this.hass.states[this.entityId]) == null ? void 0 : a.attributes) ?? {}, s = B((c = e.preset_temperatures) == null ? void 0 : c[t]) ?? B(e[`${t}_temp`]) ?? B(e[`${t}_temperature`]);
    if (s !== null) return s;
    const i = Array.isArray(e.preset_modes) ? e.preset_modes : [], n = i.indexOf(t);
    if (n < 0) return null;
    const o = B(e.min_temp) ?? 5, r = B(e.max_temp) ?? 30;
    return o + (n + 1) / (i.length + 1) * (r - o);
  }
  _live(t) {
    const e = k(this.entityId);
    if (ji(t.s)) return { applied: null, measured: null };
    if (e === "climate") return { applied: B(t.a.temperature), measured: B(t.a.current_temperature) };
    if (e === "cover") return { applied: B(t.a.current_position), measured: null };
    if (e === "light") {
      const i = t.s === "on" ? B(t.a.brightness) : 0;
      return { applied: i === null ? t.s === "on" ? 100 : 0 : i / 255 * 100, measured: null };
    }
    const s = Number(t.s);
    return { applied: Number.isFinite(s) ? s : null, measured: null };
  }
  // ---- build ----
  _build(t) {
    var rs, as;
    const e = this._tz, { startMs: s, endMs: i } = me(this.date, e), n = Math.round((i - s) / 6e4), o = Date.now(), r = Math.max(0, Math.min(n, (o - s) / 6e4)), a = (p) => (p - s) / 6e4, c = k(this.entityId), d = this.data.modes, u = St(this.program, this.data), _ = /* @__PURE__ */ new Map();
    for (const p of this.program.profiles) for (const $ of p.days.flat()) _.set($.id, $);
    C(this._lang, "override");
    const y = Wt(this.date), v = [];
    for (const { slot: p, end: $ } of Ae(u.days[(y + 6) % 7])) v.push({ s: 0, e: $, slot: p });
    if (this.slots)
      for (const p of this.slots) {
        const $ = _.get(p.slot_id);
        if (!$ || p.ignored) continue;
        const w = Math.max(0, a(Date.parse(p.start))), z = p.end ? Math.min(n, a(Date.parse(p.end))) : w + 5;
        z > w && v.push({ s: w, e: z, slot: $ });
      }
    else
      for (const p of u.days[y]) {
        const $ = A(p.start);
        if ($ === null) continue;
        const w = A(p.end ?? null);
        v.push({ s: $, e: w === null ? $ + 5 : w > $ ? w : n, slot: p });
      }
    v.sort((p, $) => p.s - $.s);
    const b = (rs = this.program.entities.find((p) => p.entity_id === this.entityId)) == null ? void 0 : rs.default, ht = b ? b.kind === "mode" ? this._modeSetpoint(String(b.value), this.entityId) : b.kind === "setpoint" ? b.value : null : null, g = (b == null ? void 0 : b.kind) === "mode" ? d.find((p) => p.id === b.value) : void 0, M = (b == null ? void 0 : b.kind) === "previous", E = [];
    let J = 0;
    const le = (p) => {
      if (p <= J) return;
      const $ = E[E.length - 1];
      E.push(M && $ ? { ...$, s: J, e: p } : { s: J, e: p, v: this._value(ht), color: (g == null ? void 0 : g.color) ?? xs, label: (g == null ? void 0 : g.name) ?? C(this._lang, "default_state") }), J = p;
    };
    for (const p of v) {
      const $ = Math.max(p.s, J);
      if (p.e <= $) continue;
      le($);
      const w = this._slotSetpoint(p.slot);
      E.push({
        s: $,
        e: p.e,
        v: this._value(w),
        color: ut(p.slot, this.program, d),
        label: Ut(p.slot, this.program, d, this._lang)
      }), J = p.e;
    }
    le(n);
    const I = (p) => E.find(($) => p >= $.s && p < $.e) ?? E[E.length - 1], vt = t.journal.map((p) => ({ m: a(Date.parse(p.at)), e: p })).filter((p) => !Number.isNaN(p.m)).sort((p, $) => p.m - $.m), ze = (p) => {
      let $ = null;
      for (const z of vt) if (z.m <= p) $ = z;
      else break;
      if (!$) return null;
      const w = $.e.slot_id ? _.get($.e.slot_id) : void 0;
      return {
        s: $.m,
        e: $.m,
        v: this._value($.e.setpoint),
        color: w ? ut(w, this.program, d) : xs,
        label: w ? Ut(w, this.program, d, this._lang) : ""
      };
    }, ce = /* @__PURE__ */ new Set([0, n, r]);
    E.forEach((p) => {
      ce.add(p.s), ce.add(p.e);
    }), vt.forEach((p) => {
      p.m > 0 && p.m < n && ce.add(p.m);
    });
    const Oe = [...ce].filter((p) => p >= 0 && p <= n).sort((p, $) => p - $), de = [];
    for (let p = 0; p < Oe.length - 1; p++) {
      const $ = Oe[p], w = Oe[p + 1];
      if (w - $ < 0.01) continue;
      const z = ($ + w) / 2, Pt = (z < r ? ze(z) : null) ?? I(z);
      de.push({ s: $, e: w, v: Pt.v, color: Pt.color, label: Pt.label });
    }
    const Rt = [], De = [], ss = [];
    for (const p of t.hist) {
      const $ = Math.max(0, a(p.t)), w = this._live(p);
      Rt.push({ m: $, v: w.applied, heating: p.a.hvac_action === "heating" }), De.push({ m: $, v: w.measured });
    }
    const is = (p, $) => {
      const w = [];
      return p.forEach((z, Et) => {
        if (!$(Et)) return;
        const Pt = Et + 1 < p.length ? p[Et + 1].m : r;
        if (Pt > z.m) {
          const Ie = w[w.length - 1];
          Ie && Math.abs(Ie[1] - z.m) < 0.01 ? Ie[1] = Pt : w.push([z.m, Pt]);
        }
      }), w;
    };
    ss.push(...is(Rt, (p) => !!Rt[p].heating));
    const ns = t.win.map((p) => ({ m: Math.max(0, a(p.t)), open: p.s === "on" })), Js = is(ns, (p) => ns[p].open), Ks = (p, $) => {
      let w = null, z = !1;
      for (const Et of p) if (Et.m <= $)
        w = Et.v, z = !0;
      else break;
      return z ? w : null;
    }, Xs = (p) => {
      var $;
      return (($ = de.find((w) => p >= w.s && p < w.e)) == null ? void 0 : $.v) ?? null;
    }, Ys = c === "climate" ? 0.5 : 5, os = [];
    let Ft = null;
    const je = Math.floor(r);
    for (let p = 0; p <= je + 1; p++) {
      const $ = p <= je ? Xs(p + 0.5) : null, w = p <= je ? Ks(Rt, p + 0.5) : null, z = $ !== null && w !== null && Math.abs($ - w) > Ys;
      z && Ft === null && (Ft = p), !z && Ft !== null && (p - Ft > 2 && os.push([Ft, p]), Ft = null);
    }
    const Ne = [...de.map((p) => p.v), ...Rt.map((p) => p.v), ...De.map((p) => p.v)].filter((p) => p !== null);
    let he = 0, pe = 100;
    c !== "cover" && c !== "light" && Ne.length && (he = Math.floor(Math.min(...Ne) - 1), pe = Math.ceil(Math.max(...Ne) + 1), pe - he < 2 && (pe = he + 2));
    const Gs = c === "climate" ? "°C" : c === "cover" || c === "light" ? "%" : ((as = this.hass.states[this.entityId]) == null ? void 0 : as.attributes.unit_of_measurement) ?? "";
    return {
      span: n,
      pastEnd: r,
      isToday: s <= o && o < i,
      planned: de,
      applied: Rt,
      measured: De,
      heat: ss,
      win: Js,
      over: os,
      lo: he,
      hi: pe,
      unit: Gs
    };
  }
  // ---- interaction ----
  _pointer(t) {
    const e = this._model;
    if (!e) return;
    const s = t.currentTarget.getBoundingClientRect(), i = t.clientX - s.left;
    this._cursor = this._clampM((i - S.l) / (s.width - S.l - S.r) * e.span, e.span);
  }
  _clampM(t, e) {
    return Math.max(0, Math.min(e - 1, Math.round(t)));
  }
  _key(t) {
    const e = this._model;
    if (!e) return;
    const s = this._cursor ?? Math.round(e.isToday ? e.pastEnd : e.span / 2);
    let i = null;
    if (t.key === "ArrowLeft") i = s - 15;
    else if (t.key === "ArrowRight") i = s + 15;
    else if (t.key === "Home") i = 0;
    else if (t.key === "End") i = e.span - 1;
    else if (t.key === "Escape" && this._cursor !== null) {
      t.stopPropagation(), this._cursor = null;
      return;
    }
    i !== null && (t.preventDefault(), this._cursor = this._clampM(i, e.span));
  }
  // ---- render ----
  _fmt(t, e) {
    return t === null ? "–" : `${Number(t.toFixed(1))}${e ? " " + e : ""}`;
  }
  _clock(t) {
    const { startMs: e } = me(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" }).format(new Date(e + t * 6e4));
  }
  _valueAt(t, e) {
    let s = null;
    for (const i of t) if (i.m <= e) s = i.v;
    else break;
    return s;
  }
  _path(t, e, s, i, n) {
    let o = "", r = !1;
    return t.forEach((a, c) => {
      const d = c + 1 < t.length ? t[c + 1].m : e.pastEnd;
      if (a.v === null || d < a.m) {
        r = !1;
        return;
      }
      const u = i(a.v);
      n ? o += r ? `V${u.toFixed(1)}H${s(d).toFixed(1)}` : `M${s(a.m).toFixed(1)},${u.toFixed(1)}H${s(d).toFixed(1)}` : (o += `${r ? "L" : "M"}${s(a.m).toFixed(1)},${u.toFixed(1)}`, c + 1 === t.length && (o += `L${s(d).toFixed(1)},${u.toFixed(1)}`)), r = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const t = T(this._lang), e = this._model, s = oe(this.hass, this.entityId);
    let i;
    return this._failed ? i = l`<div class="note">${t.no_data}</div>` : e ? !e.planned.some((n) => n.v !== null) && !e.applied.some((n) => n.v !== null) && !e.measured.some((n) => n.v !== null) ? i = l`<div class="note">${t.no_data}</div>` : i = this._renderChart(e, s) : i = l`<div class="note">${t.chart_loading}</div>`, l`<div class="box">${i}</div>${e ? this._legend(e) : h}`;
  }
  _legend(t) {
    const e = T(this._lang), s = (i, n) => l`<span class="key"><i class=${i}></i>${n}</span>`;
    return l`<div class="legend">
      ${s("planned", e.planned)}
      ${t.applied.some((i) => i.v !== null) ? s("applied", e.applied) : h}
      ${t.measured.some((i) => i.v !== null) ? s("measured", e.measured) : h}
      ${t.win.length ? s("zone win", e.window_open) : h}
      ${t.heat.length ? s("zone heat", e.heating) : h}
      ${t.over.length ? s("zone over", e.overridden) : h}
    </div>`;
  }
  _renderChart(t, e) {
    const s = T(this._lang), i = this._width, n = Ni, o = (g) => S.l + g / t.span * (i - S.l - S.r), r = (g) => S.t + (1 - (g - t.lo) / (t.hi - t.lo)) * (n - S.t - S.b), { startMs: a } = me(this.date, this._tz), c = [0, 1, 2, 3].map((g) => t.lo + (t.hi - t.lo) * g / 3), d = [];
    for (let g = 0; g <= t.span; g += 180) d.push(g);
    const u = (g, M) => g.map(([E, J]) => zt`<rect class="z ${M}" x=${o(E)} y=${S.t} width=${Math.max(1, o(J) - o(E))}
        height=${n - S.t - S.b}></rect>`), _ = this._cursor;
    let y = h, v = h, b = "";
    if (_ !== null) {
      const g = t.planned.find((I) => _ >= I.s && _ < I.e), M = [];
      M.push([s.planned, `${this._fmt((g == null ? void 0 : g.v) ?? null, t.unit)}${g != null && g.label ? " · " + g.label : ""}`]), _ <= t.pastEnd && (t.applied.some((I) => I.v !== null) && M.push([s.applied, this._fmt(this._valueAt(t.applied, _), t.unit)]), t.measured.some((I) => I.v !== null) && M.push([s.measured, this._fmt(this._valueAt(t.measured, _), t.unit)]));
      const E = [], J = (I) => I.some(([vt, ze]) => _ >= vt && _ < ze);
      J(t.win) && E.push(s.window_open), J(t.heat) && E.push(s.heating), J(t.over) && E.push(s.overridden), b = `${this._clock(_)} — ${M.map(([I, vt]) => `${I} ${vt}`).join(", ")}${E.length ? ", " + E.join(", ") : ""}`;
      const le = Math.min(Math.max(o(_), 70), i - 70);
      v = zt`<line class="cursor" x1=${o(_)} x2=${o(_)} y1=${S.t} y2=${n - S.b}></line>`, y = l`<div class="tip" style="left:${le}px">
        <b>${this._clock(_)}</b>
        ${M.map(([I, vt]) => l`<div><span>${I}</span> ${vt}</div>`)}
        ${E.map((I) => l`<div class="flag">${I}</div>`)}
      </div>`;
    }
    const ht = t.isToday ? zt`<line class="now" x1=${o(t.pastEnd)} x2=${o(t.pastEnd)} y1=${S.t} y2=${n - S.b}></line>` : h;
    return l`
      <svg width=${i} height=${n} viewBox="0 0 ${i} ${n}" tabindex="0" role="application"
        aria-label=${C(this._lang, "chart_aria", { name: e })}
        @pointerdown=${this._pointer} @pointermove=${(g) => g.pointerType === "mouse" || g.buttons ? this._pointer(g) : void 0}
        @pointerleave=${(g) => {
      g.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${c.map((g) => zt`<line class="grid" x1=${S.l} x2=${i - S.r} y1=${r(g)} y2=${r(g)}></line>
          <text class="ylab" x=${S.l - 4} y=${r(g) + 3} text-anchor="end">${Number(g.toFixed(t.unit === "°C" ? 1 : 0))}</text>`)}
        ${d.map((g) => zt`<text class="xlab" x=${o(g)} y=${n - 6}
          text-anchor=${g === 0 ? "start" : "middle"}>${Math.floor(_t(new Date(a + g * 6e4), this._tz) / 60)}h</text>`)}
        ${u(t.win, "win")}${u(t.heat, "heat")}${u(t.over, "over")}
        ${t.planned.map((g, M) => {
      const E = t.planned[M - 1];
      return g.v === null ? h : zt`
            ${E && E.v !== null ? zt`<line class="riser" x1=${o(g.s)} x2=${o(g.s)} y1=${r(E.v)} y2=${r(g.v)}></line>` : h}
            <line class="plan" x1=${o(g.s)} x2=${o(g.e)} y1=${r(g.v)} y2=${r(g.v)} style="stroke:${g.color}"></line>`;
    })}
        <path class="applied" d=${this._path(t.applied, t, o, r, !0)}></path>
        <path class="measured" d=${this._path(t.measured, t, o, r, !1)}></path>
        ${ht}${v}
        <rect class="hit" x=${S.l} y=${S.t} width=${i - S.l - S.r} height=${n - S.t - S.b}></rect>
      </svg>
      ${y}
      <div class="sr" aria-live="polite">${b}</div>`;
  }
};
q.styles = U`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    svg { display: block; touch-action: pan-y; user-select: none; outline: none; max-width: 100%; }
    svg:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
    .grid { stroke: var(--divider-color, rgba(127, 127, 127, 0.3)); stroke-width: 1; }
    text { fill: var(--secondary-text-color); font-size: 10px; }
    .plan { stroke-width: 4; stroke-linecap: butt; }
    .riser { stroke: var(--divider-color, #999); stroke-width: 1.5; }
    .applied { fill: none; stroke: var(--primary-text-color); stroke-width: 1.6; stroke-dasharray: 5 3; }
    .measured { fill: none; stroke: var(--accent-color, #ff9800); stroke-width: 1.8; }
    .z.win { fill: var(--info-color, #2196f3); opacity: 0.18; }
    .z.heat { fill: var(--warning-color, #ff5722); opacity: 0.14; }
    .z.over { fill: var(--secondary-text-color); opacity: 0.2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1; stroke-dasharray: 2 2; }
    .cursor { stroke: var(--primary-text-color); stroke-width: 1; }
    .hit { fill: transparent; cursor: crosshair; }
    .tip {
      position: absolute; top: 0; transform: translateX(-50%); pointer-events: none; z-index: 1;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      border: 1px solid var(--divider-color); border-radius: 8px; padding: 4px 8px; font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); white-space: nowrap;
    }
    .tip span { color: var(--secondary-text-color); }
    .tip .flag { color: var(--secondary-text-color); font-style: italic; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 11px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.applied { border-top: 2px dashed var(--primary-text-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.zone { height: 10px; border: none; width: 12px; border-radius: 2px; }
    .key i.win { background: var(--info-color, #2196f3); opacity: 0.4; }
    .key i.heat { background: var(--warning-color, #ff5722); opacity: 0.35; }
    .key i.over { background: var(--secondary-text-color); opacity: 0.4; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `;
it([
  f({ attribute: !1 })
], q.prototype, "hass", 2);
it([
  f({ attribute: !1 })
], q.prototype, "data", 2);
it([
  f({ attribute: !1 })
], q.prototype, "program", 2);
it([
  f({ attribute: "entity-id" })
], q.prototype, "entityId", 2);
it([
  f()
], q.prototype, "date", 2);
it([
  f({ attribute: !1 })
], q.prototype, "slots", 2);
it([
  m()
], q.prototype, "_width", 2);
it([
  m()
], q.prototype, "_loaded", 2);
it([
  m()
], q.prototype, "_failed", 2);
it([
  m()
], q.prototype, "_cursor", 2);
q = it([
  N("wp-chart")
], q);
const Ni = 160, S = { l: 38, r: 10, t: 10, b: 22 };
function Q(t, e) {
  var n, o;
  const s = (o = (n = t.states[e]) == null ? void 0 : n.attributes) == null ? void 0 : o.friendly_name;
  if (typeof s == "string" && s) return s;
  const i = e.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return i ? i.charAt(0).toUpperCase() + i.slice(1) : e;
}
const Ws = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);
function Ii(t) {
  return t.composedPath().some((e) => e instanceof HTMLElement && Ws.has(e.tagName));
}
class Hs {
  constructor(e = 60) {
    this.threshold = e, this.id = -1, this.sx = 0, this.sy = 0;
  }
  down(e) {
    e.pointerType === "mouse" || !e.isPrimary || Ii(e) || (this.id = e.pointerId, this.sx = e.clientX, this.sy = e.clientY);
  }
  /** -1 = swiped right (previous), 1 = swiped left (next), 0 = nothing. */
  up(e) {
    if (e.pointerId !== this.id) return 0;
    this.id = -1;
    const s = e.clientX - this.sx, i = e.clientY - this.sy;
    return Math.abs(s) < this.threshold || Math.abs(i) > Math.abs(s) * Math.tan(Math.PI / 6) ? 0 : s < 0 ? 1 : -1;
  }
  cancel() {
    this.id = -1;
  }
}
class Ui {
  constructor(e, s = 500) {
    this.onFire = e, this.delay = s, this.timer = 0, this.sx = 0, this.sy = 0, this.fired = !1;
  }
  down(e) {
    e.pointerType === "mouse" && e.button !== 0 || e.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "BUTTON" || Ws.has(s.tagName))) || (this.cancel(), this.fired = !1, this.sx = e.clientX, this.sy = e.clientY, this.timer = window.setTimeout(() => {
      var s;
      this.timer = 0, this.fired = !0;
      try {
        (s = navigator.vibrate) == null || s.call(navigator, 15);
      } catch {
      }
      this.onFire(e);
    }, this.delay));
  }
  move(e) {
    this.timer && Math.hypot(e.clientX - this.sx, e.clientY - this.sy) > 10 && this.cancel();
  }
  cancel() {
    this.timer && window.clearTimeout(this.timer), this.timer = 0;
  }
}
const Ss = /* @__PURE__ */ new WeakSet();
function Bs(t) {
  if (!t || Ss.has(t)) return;
  Ss.add(t);
  const e = () => {
    t.classList.toggle("more-left", t.scrollLeft > 2), t.classList.toggle("more-right", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  };
  t.addEventListener("scroll", e, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(e).observe(t), e();
}
const qs = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var Ri = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, ct = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Fi(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && Ri(e, s, n), n;
};
const Cs = 7;
let X = class extends P {
  constructor() {
    super(...arguments), this.day = 0, this.showChart = !0, this._offset = null, this._open = !0, this._slots = null, this._loadedDate = "", this._editing = !1, this._token = 0, this._swipe = new Hs(60), this._previews = /* @__PURE__ */ new Map(), this._closed = (t) => {
      t.stopPropagation(), this._open = !1, this._editing || this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0 }));
    };
  }
  get _lang() {
    var t;
    return ((t = this.hass.locale) == null ? void 0 : t.language) ?? this.hass.language ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  get _today() {
    return kt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Ls(this._today, this._offset ?? 0);
  }
  willUpdate(t) {
    this._offset === null && this.hass && (this._offset = (this.day - Wt(this._today) + 7) % 7), this._offset !== null && this.hass && this.program && (t.has("_offset") || t.has("program") || t.has("hass") && !this._loadedDate) && this._loadPreview();
  }
  async _loadPreview() {
    const t = this._date, e = `${this.program.id}|${this.program.revision}|${t}`;
    if (this._previews.has(e)) {
      this._slots = this._previews.get(e) ?? null, this._loadedDate = t;
      return;
    }
    const s = ++this._token;
    try {
      const i = await this.hass.callWS({
        type: "weekly_planner/preview",
        program_id: this.program.id,
        date: t
      });
      if (s !== this._token) return;
      this._previews.set(e, i.slots), this._slots = i.slots;
    } catch {
      if (s !== this._token) return;
      this._slots = null;
    }
    this._loadedDate = t;
  }
  _go(t) {
    const e = (this._offset ?? 0) + t;
    e < -14 || e > Cs || (this._loadedDate = "", this._slots = null, this._offset = e);
  }
  /** Swipe left = next day, swipe right = previous day (buttons in the header do the same). */
  _swiped(t) {
    const e = this._swipe.up(t);
    e && this._go(e);
  }
  _edit() {
    this._editing = !0, this.dispatchEvent(new CustomEvent("edit-day", {
      detail: { day: Wt(this._date) },
      bubbles: !0,
      composed: !0
    })), this._open = !1;
  }
  // ---- content ----
  _modeSetpoint(t, e) {
    var s;
    return t ? ((s = t.exceptions) == null ? void 0 : s[e]) ?? t.value : null;
  }
  _setpointText(t) {
    const e = T(this._lang);
    if (!t) return "–";
    switch (t.kind) {
      case "temperature":
        return `${t.temperature} °C`;
      case "preset":
        return es(this._lang, String(t.preset));
      case "position":
        return `${t.position} %`;
      case "open":
        return e.sp_open;
      case "close":
        return e.sp_close;
      case "on":
        return typeof t.brightness == "number" ? `${t.brightness} %` : e.sp_on;
      case "off":
        return e.sp_off;
      case "auto":
        return e.sp_auto;
      case "value":
        return String(t.value);
      case "option":
        return String(t.option);
      default:
        return t.kind;
    }
  }
  _bars(t, e) {
    const s = T(this._lang), i = St(this.program, this.data), n = this.data.modes, o = Wt(t), r = [];
    for (const { slot: c, end: d } of Ae(i.days[(o + 6) % 7]))
      r.push({ start: 0, end: d, color: ut(c, this.program, n), label: Ut(c, this.program, n, this._lang) });
    const a = (c) => s[`reason_${c}`] ?? c;
    for (const c of i.days[o]) {
      const d = e == null ? void 0 : e.find((b) => b.slot_id === c.id);
      let u = A(c.start), _ = A(c.end ?? null);
      if (e) {
        if (!d) continue;
        u = this._minutesOf(d.start, t), _ = d.end ? this._minutesOf(d.end, t) : null;
      }
      if (u === null) continue;
      const y = _ === null ? u + 10 : _ > u ? _ : x, v = Ut(c, this.program, n, this._lang);
      r.push({
        start: u,
        end: Math.min(x, y),
        color: ut(c, this.program, n),
        label: d != null && d.ignored ? `${v} — ${a(d.ignored)}` : v,
        sun: (d == null ? void 0 : d.sun) ?? ("sun" in c.start || !!(c.end && "sun" in c.end)),
        ignored: (d == null ? void 0 : d.ignored) ?? null
      });
    }
    return r;
  }
  /** Minutes since local midnight of `date`; capped to 1440 when the instant is on a later day. */
  _minutesOf(t, e) {
    return kt(new Date(t), this._tz) > e ? x : _t(t, this._tz);
  }
  _rows(t, e) {
    const s = St(this.program, this.data), i = Wt(t), n = [];
    for (const o of s.days[i]) {
      const r = e == null ? void 0 : e.find((d) => d.slot_id === o.id);
      if (e && !r) continue;
      const a = r ? this._minutesOf(r.start, t) : A(o.start) ?? 0, c = (d) => d === null ? "" : `${String(Math.floor(d / 60) % 24).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
      n.push({
        slot: o,
        r,
        startM: a,
        start: r ? qe(r.start, this._tz, this._lang) : c(A(o.start)),
        end: r ? r.end ? qe(r.end, this._tz, this._lang) : "" : c(A(o.end ?? null))
      });
    }
    return n.sort((o, r) => o.startM - r.startM);
  }
  _entityTexts(t) {
    const e = this.data.modes;
    return this.program.entities.map((s) => {
      const i = t.actions.by_entity[s.entity_id], n = e.find((r) => r.id === t.actions.by_type[k(s.entity_id)]), o = i ?? this._modeSetpoint(n, s.entity_id);
      return { entityId: s.entity_id, mode: i ? void 0 : n, text: this._setpointText(o) };
    });
  }
  render() {
    if (!this.hass || !this.data || !this.program || this._offset === null) return h;
    const t = T(this._lang), e = this._date, s = Wt(e), [i, n, o] = e.split("-").map(Number), r = new Intl.DateTimeFormat(this._lang, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(i, n - 1, o, 12))), a = this._loadedDate === e, c = a ? this._slots : null, d = this._offset === 0, u = d ? _t(/* @__PURE__ */ new Date(), this._tz) : null, _ = a ? this._rows(e, c) : [];
    return l`
      <wp-dialog wide ?open=${this._open} heading="${t.days[s]} ${r}"
        @closed=${this._closed}>
        <button slot="header-start" class="nav" ?disabled=${this._offset <= -14}
          aria-label=${t.previous_day} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button slot="header-actions" class="nav" ?disabled=${this._offset >= Cs}
          aria-label=${t.next_day} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <div class="swipe" @pointerdown=${(y) => this._swipe.down(y)}
          @pointerup=${(y) => this._swiped(y)} @pointercancel=${() => this._swipe.cancel()}>
        <div class="program">${this.program.name}${d ? l` <span class="badge">${t.today}</span>` : h}</div>
        <wp-day-bar show-hours .spans=${a ? this._bars(e, c) : []} .now=${u}></wp-day-bar>
        ${a && !_.length ? l`<p class="empty">${t.no_slot_day}</p>` : h}
        <ul class="slots">
          ${_.map((y) => {
      var v, b, ht;
      return l`
            <li class=${(v = y.r) != null && v.ignored ? "ignored" : ""}>
              <div class="time">${(b = y.r) != null && b.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : h}${y.start}${y.end ? l` <ha-icon icon="mdi:arrow-right"></ha-icon> ${y.end}` : h}</div>
              <div class="what">
                ${this._entityTexts(y.slot).map((g) => l`
                  <div class="line">
                    <span class="name">${Q(this.hass, g.entityId)}</span>
                    ${g.mode ? l`<span class="pill" style="background:${y.slot.color || g.mode.color}">${g.mode.name}</span>` : h}
                    <span class="val">${g.text}</span>
                  </div>`)}
                ${(ht = y.r) != null && ht.ignored ? l`<div class="why">${t[`reason_${y.r.ignored}`] ?? y.r.ignored}</div>` : h}
              </div>
            </li>`;
    })}
        </ul>
        ${this.showChart && a ? this.program.entities.map((y) => l`
            <section class="chart">
              <h3>${Q(this.hass, y.entity_id)}</h3>
              <wp-chart .hass=${this.hass} .data=${this.data} .program=${this.program}
                .entityId=${y.entity_id} .date=${e} .slots=${c}></wp-chart>
            </section>`) : h}
        </div>
        ${this.data.can_edit ? l`<button slot="footer" class="primary wide" @click=${this._edit}><ha-icon icon="mdi:pencil"></ha-icon> ${t.edit}</button>` : h}
      </wp-dialog>
    `;
  }
};
X.styles = U`
    :host { display: contents; }
    .nav {
      border: none; background: none; color: var(--primary-text-color); font-size: 16px;
      min-width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
    }
    .nav:hover:not([disabled]) { background: var(--secondary-background-color); }
    .nav[disabled] { opacity: 0.3; cursor: default; }
    .swipe { touch-action: pan-y; min-height: 40vh; }
    .program { color: var(--secondary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge {
      background: var(--primary-color); color: var(--text-primary-color, #fff); border-radius: 12px;
      padding: 2px 10px; font-size: 13px; font-weight: 600;
    }
    wp-day-bar { margin: 4px 0 8px; }
    .empty { color: var(--secondary-text-color); text-align: center; }
    ul.slots { list-style: none; margin: 8px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    li { display: flex; gap: 12px; padding: 8px 10px; border-radius: 10px; background: var(--secondary-background-color); }
    li.ignored .time, li.ignored .name, li.ignored .val { text-decoration: line-through; opacity: 0.7; }
    .time { min-width: 96px; --mdc-icon-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; }
    .what { flex: 1; min-width: 0; }
    .line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .name { color: var(--secondary-text-color); font-size: 13px; }
    .pill { color: #fff; border-radius: 10px; padding: 1px 8px; font-size: 12px; font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5); }
    .why { font-size: 12px; color: var(--secondary-text-color); font-style: italic; }
    .chart h3 { margin: 16px 0 4px; font-size: 14px; font-weight: 500; }
    button.primary {
      border: none; border-radius: 18px; padding: 8px 18px; min-height: 48px; cursor: pointer;
      background: var(--primary-color); color: var(--text-primary-color, #fff); font-size: 14px;
    }
    button.wide { display: inline-flex; align-items: center; gap: 6px; }
    @media (max-width: 420px) { .time { min-width: 80px; } button.wide { flex: 1; justify-content: center; } }
  `;
ct([
  f({ attribute: !1 })
], X.prototype, "hass", 2);
ct([
  f({ attribute: !1 })
], X.prototype, "data", 2);
ct([
  f({ attribute: !1 })
], X.prototype, "program", 2);
ct([
  f({ type: Number })
], X.prototype, "day", 2);
ct([
  f({ type: Boolean })
], X.prototype, "showChart", 2);
ct([
  m()
], X.prototype, "_offset", 2);
ct([
  m()
], X.prototype, "_open", 2);
ct([
  m()
], X.prototype, "_slots", 2);
ct([
  m()
], X.prototype, "_loadedDate", 2);
X = ct([
  N("wp-day-view")
], X);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Li = (t) => (...e) => ({ _$litDirective$: t, values: e });
let Wi = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, s, i) {
    this._$Ct = e, this._$AM = s, this._$Ci = i;
  }
  _$AS(e, s) {
    return this.update(e, s);
  }
  update(e, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Hi = {}, Bi = (t, e = Hi) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qi = Li(class extends Wi {
  constructor() {
    super(...arguments), this.key = h;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (Bi(t), this.key = e), s;
  }
});
var Vi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, Pe = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ji(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && Vi(e, s, n), n;
};
let Vt = class extends P {
  constructor() {
    super(...arguments), this.message = "", this.confirmLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (t) => {
      t.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
    };
  }
  _choose(t) {
    var e;
    this._result = t, (e = this.renderRoot.querySelector("wp-dialog")) == null || e.close();
  }
  render() {
    const t = T(this.lang);
    return l`
      <wp-dialog open heading=${t.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${t.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }
};
Vt.styles = U`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
Pe([
  f()
], Vt.prototype, "message", 2);
Pe([
  f({ attribute: "confirm-label" })
], Vt.prototype, "confirmLabel", 2);
Pe([
  f()
], Vt.prototype, "lang", 2);
Vt = Pe([
  N("wp-confirm")
], Vt);
function mt(t, e, s) {
  return new Promise((i) => {
    var r;
    const n = document.createElement("wp-confirm");
    n.message = e, n.confirmLabel = s;
    const o = t.hass;
    n.lang = ((r = o == null ? void 0 : o.locale) == null ? void 0 : r.language) ?? (o == null ? void 0 : o.language) ?? (document.documentElement.lang || "en"), n.addEventListener("choice", (a) => {
      n.remove(), i(!!a.detail);
    }), (t.shadowRoot ?? t).appendChild(n);
  });
}
var Ki = Object.defineProperty, Xi = Object.getOwnPropertyDescriptor, G = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Xi(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && Ki(e, s, n), n;
};
const Yi = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Gi = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Ct(t, e) {
  var n;
  if ("time" in e) return K(e.time);
  const s = (n = t.states["sun.sun"]) == null ? void 0 : n.attributes[Yi[e.sun]];
  let i = s ? _t(s, t.config.time_zone) : Gi[e.sun];
  return i += e.offset ?? 0, e.earliest && (i = Math.max(i, K(e.earliest))), e.latest && (i = Math.min(i, K(e.latest))), Math.max(0, Math.min(x, i));
}
function Je(t) {
  const e = A(t.start);
  if (e === null || !t.end) return null;
  const s = A(t.end);
  return s === null ? null : s > e ? [e, s] : [e, x];
}
function ke(t) {
  const e = t.map((s) => ({ slot: s, iv: Je(s) })).filter((s) => s.iv !== null).sort((s, i) => s.iv[0] - i.iv[0]);
  for (let s = 1; s < e.length; s++)
    if (e[s].iv[0] < e[s - 1].iv[1]) return [e[s - 1].slot, e[s].slot];
  return null;
}
function Se(t, e) {
  return [...e].sort((s, i) => Ct(t, s.start) - Ct(t, i.start));
}
function $t(t, e, s) {
  const i = (n) => {
    if ("time" in n) return n.time;
    const o = n.offset ? ` ${n.offset > 0 ? "+" : "−"}${Math.abs(n.offset)} min` : "";
    return `${C(s, `sun_${n.sun}`)}${o} (≈${Z(Ct(t, n))})`;
  };
  return e.end ? `${i(e.start)} – ${i(e.end)}` : `${i(e.start)} · ${C(s, "one_shot")}`;
}
function Vs(t, e, s, i, n) {
  const o = st(t), r = [];
  n > 0 && r.push({ start: 0, end: n, color: "var(--secondary-text-color)", label: C(o, "previous_day"), ignored: "spill" });
  for (const a of i) {
    const c = Ct(t, a.start), d = a.end ? Ct(t, a.end) : null, [[u, _]] = gi(a, { start: c, end: d }), y = !("time" in a.start) || !!(a.end && !("time" in a.end));
    r.push({
      start: u,
      end: _,
      sun: y,
      color: ut(a, s, e.modes),
      label: `${Ut(a, s, e.modes, o)} ${$t(t, a, o)}`
    });
  }
  return r;
}
let H = class extends P {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "", this._zoom = 1, this._lp = new Ui(() => {
      this._lpSlot && (this._menu = this._lpSlot);
    }), this._pts = /* @__PURE__ */ new Map();
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(t) {
    const e = /* @__PURE__ */ new Map(), s = (i, n) => e.set(i, [...e.get(i) ?? [], n]);
    for (const i of t) {
      const n = A(i.start);
      n !== null && s(n, { id: i.id, which: "start" });
      const o = A(i.end ?? null);
      n !== null && o !== null && o > n && s(o, { id: i.id, which: "end" });
    }
    return [...e.entries()].map(([i, n]) => ({ key: n.map((o) => o.id + o.which).join("|"), min: i, refs: n }));
  }
  _bounds(t, e, s) {
    let i = 0, n = x;
    for (const a of e) {
      const c = t.find((y) => y.id === a.id);
      if (!c) continue;
      const d = A(c.start) ?? 0, u = c.end ? A(c.end) : null, _ = u !== null && u <= d;
      a.which === "start" ? (u !== null && !_ ? n = Math.min(n, u - L) : n = Math.min(n, x - L), _ && (i = Math.max(i, u))) : _ ? (i = Math.max(i, L), n = Math.min(n, d)) : i = Math.max(i, d + L);
    }
    const o = new Set(e.map((a) => a.id));
    if (!e.every((a) => {
      const c = t.find((d) => d.id === a.id);
      return a.which === "start" && !(c != null && c.end);
    }))
      for (const a of t) {
        if (o.has(a.id)) continue;
        const c = Je(a);
        c && (c[1] <= s ? i = Math.max(i, c[1]) : c[0] >= s && (n = Math.min(n, c[0])));
      }
    return [i, n];
  }
  _apply(t, e, s) {
    const i = { time: Z(s) };
    return t.map((n) => {
      const o = e.find((r) => r.id === n.id);
      return o ? o.which === "start" ? { ...n, start: i } : { ...n, end: i } : n;
    });
  }
  _emitSlots(t) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: t, bubbles: !0, composed: !0 }));
  }
  _snap(t) {
    return Math.round(t / L) * L;
  }
  /* ---- drag ---- */
  _down(t, e) {
    if (t.button !== 0 && t.pointerType === "mouse") return;
    t.currentTarget.setPointerCapture(t.pointerId);
    const [i, n] = this._bounds(this.slots, e.refs, e.min);
    this._drag = { refs: e.refs, lo: i, hi: n, min: e.min, moved: !1 }, this._dragSlots = this.slots, t.preventDefault();
  }
  _move(t) {
    const e = this._drag, s = this.renderRoot.querySelector(".track");
    if (!e || !s) return;
    const i = s.getBoundingClientRect(), n = (t.clientX - i.left) / i.width * x, o = Math.max(e.lo, Math.min(e.hi, this._snap(n)));
    o !== e.min && (this._drag = { ...e, min: o, moved: !0 }, this._dragSlots = this._apply(this.slots, e.refs, o));
  }
  _up(t) {
    var n;
    const e = this._drag, s = t.currentTarget;
    (n = s.hasPointerCapture) != null && n.call(s, t.pointerId) && s.releasePointerCapture(t.pointerId);
    const i = this._dragSlots;
    this._drag = void 0, this._dragSlots = void 0, e != null && e.moved && i && this._emitSlots(i);
  }
  _cancel() {
    this._drag = void 0, this._dragSlots = void 0;
  }
  /* ---- pinch to zoom (buttons ± do the same) ---- */
  _scroller() {
    return this.renderRoot.querySelector(".wrap");
  }
  async _setZoom(t, e) {
    const s = Math.round(Math.max(1, Math.min(4, t)) * 100) / 100;
    if (s === this._zoom) return;
    const i = this._scroller();
    let n = 0, o = 0;
    if (i) {
      const r = i.getBoundingClientRect();
      o = (e ?? r.left + r.width / 2) - r.left, n = (i.scrollLeft + o) / Math.max(1, i.scrollWidth);
    }
    this._zoom = s, await this.updateComplete, i && (i.scrollLeft = n * i.scrollWidth - o);
  }
  _pdown(t) {
    if (!(t.pointerType === "mouse" || this._drag) && !t.composedPath().some((e) => e instanceof HTMLElement && e.classList.contains("handle")) && (this._pts.set(t.pointerId, { x: t.clientX, y: t.clientY }), this._pts.size === 2)) {
      const [e, s] = [...this._pts.values()];
      this._pinch = { d0: Math.hypot(e.x - s.x, e.y - s.y) || 1, z0: this._zoom };
    }
  }
  _pmove(t) {
    if (this._pts.has(t.pointerId) && (this._pts.set(t.pointerId, { x: t.clientX, y: t.clientY }), this._pinch && this._pts.size === 2 && !this._drag)) {
      const [e, s] = [...this._pts.values()], i = Math.hypot(e.x - s.x, e.y - s.y);
      this._setZoom(this._pinch.z0 * (i / this._pinch.d0), (e.x + s.x) / 2);
    }
  }
  _pup(t) {
    this._pts.delete(t.pointerId), this._pts.size < 2 && (this._pinch = void 0);
  }
  /* ---- long press menu / delete ---- */
  _slotDown(t, e) {
    this._lpSlot = e, this._lp.down(t);
  }
  async _remove(t) {
    const e = this._tr("confirm_delete_slot", { time: $t(this.hass, t, this._lang) });
    await mt(this, e, this._tr("delete")) && this._emitSlots(this.slots.filter((s) => s.id !== t.id));
  }
  _menuDo(t) {
    const e = this._menu;
    this._menu = void 0, e && (t === "edit" ? this._edit(e, !1) : t === "copy" ? this.dispatchEvent(new CustomEvent("copy-slot", { detail: { slot: e }, bubbles: !0, composed: !0 })) : this._remove(e));
  }
  /* ---- keyboard / buttons ---- */
  _nudge(t, e, s) {
    const [i, n] = this._bounds(this.slots, t, e), o = Math.max(i, Math.min(n, this._snap(e + s)));
    o !== e && (this._notice = "", this._emitSlots(this._apply(this.slots, t, o)));
  }
  _onKey(t, e) {
    const s = t.shiftKey ? 60 : L;
    let i = 0;
    if (t.key === "ArrowLeft" || t.key === "ArrowDown") i = -s;
    else if (t.key === "ArrowRight" || t.key === "ArrowUp") i = s;
    else return;
    t.preventDefault(), this._nudge(e.refs, e.min, i);
  }
  /* ---- actions ---- */
  _newSlot() {
    const t = this.data.modes.filter((n) => n.type === ot(this.program)), e = this._slots.map(Je).filter((n) => n !== null).sort((n, o) => n[0] - o[0]);
    let s = 480;
    for (const [n, o] of e) s >= n && s < o && (s = o);
    s > x - 60 && (s = x - 60);
    const i = Math.min(x, s + 60);
    return {
      id: wt(),
      start: { time: Z(s) },
      end: { time: Z(i) },
      conditions: [],
      actions: { by_type: t[0] ? { [ot(this.program)]: t[0].id } : {}, by_entity: {} }
    };
  }
  _edit(t, e) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: t, isNew: e }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(t, e) {
    const s = t.find((i) => i.id === e);
    return s ? $t(this.hass, s, this._lang) : "";
  }
  _actionText(t) {
    const e = ae(t, this.program, this.data.modes), s = Object.values(t.actions.by_type).map((n) => {
      var o;
      return (o = this.data.modes.find((r) => r.id === n)) == null ? void 0 : o.name;
    }).filter(Boolean);
    if (s.length) return s.join(" · ");
    const i = Object.keys(t.actions.by_entity).map((n) => Q(this.hass, n));
    return (e == null ? void 0 : e.name) ?? (i.length ? i.join(", ") : this._tr("slot_direct"));
  }
  _stepper(t, e, s) {
    if (!s) return l`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in s))
      return l`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${$t(this.hass, { ...t, start: s, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const i = K(s.time), n = [{ id: t.id, which: e }], [o, r] = this._bounds(this._slots, n, i), a = this._tr(e === "start" ? "slot_start" : "slot_end");
    return l`
      <span class="stepper">
        <button class="ibtn" ?disabled=${i - L < o} @click=${() => this._nudge(n, i, -L)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${s.time}</span>
        <button class="ibtn" ?disabled=${i + L > r} @click=${() => this._nudge(n, i, L)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const t = this._slots, e = Vs(this.hass, this.data, this.program, t, this.spill), s = this._edges(t), i = (r) => `${r / x * 100}%`, n = this._drag, o = Se(this.hass, t);
    return l`
      <div class="wrap" @pointerdown=${this._pdown} @pointermove=${this._pmove} @pointerup=${this._pup}
        @pointercancel=${this._pup}>
        <div class="track" style="width:${this._zoom * 100}%">
          <wp-day-bar .spans=${e} show-hours></wp-day-bar>
          <div class="handles">
            ${s.map((r) => {
      const a = n && r.refs.some((_) => n.refs.some((y) => y.id === _.id && y.which === _.which)), [c, d] = this._bounds(t, r.refs, r.min), u = Z(r.min);
      return l`<button class="handle ${a ? "active" : ""}" style="left:${i(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((_) => `${_.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(t, _.id)}`).join(" / ")}
                aria-valuemin=${c} aria-valuemax=${d} aria-valuenow=${r.min} aria-valuetext=${u}
                @pointerdown=${(_) => this._down(_, r)}
                @pointermove=${(_) => this._move(_)}
                @pointerup=${(_) => this._up(_)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(_) => this._onKey(_, r)}><span class="grip"></span></button>`;
    })}
            ${n ? l`<div class="loupe" style="left:${i(n.min)}" aria-hidden="true">
                  <span>${Z(n.min)}</span></div>` : h}
          </div>
        </div>
      </div>
      <div class="zoombar">
        <button class="ibtn" ?disabled=${this._zoom <= 1} aria-label=${this._tr("zoom_out")} title=${this._tr("zoom_out")}
          @click=${() => void this._setZoom(Math.ceil(this._zoom - 1))}><ha-icon icon="mdi:magnify-minus-outline"></ha-icon></button>
        <span class="muted">${this._tr("zoom")} ×${Number(this._zoom.toFixed(1))}</span>
        <button class="ibtn" ?disabled=${this._zoom >= 4} aria-label=${this._tr("zoom_in")} title=${this._tr("zoom_in")}
          @click=${() => void this._setZoom(Math.floor(this._zoom + 1))}><ha-icon icon="mdi:magnify-plus-outline"></ha-icon></button>
      </div>
      ${this.spill > 0 ? l`<p class="hint">${this._tr("spill_hint", { time: Z(this.spill) })}</p>` : h}
      ${this._notice ? l`<p class="error" role="alert">${this._notice}</p>` : h}
      <div class="list">
        ${o.length === 0 ? l`<p class="muted">${this._tr("no_slots")}</p>` : h}
        ${o.map(
      (r) => {
        var a;
        return l`
            <div class="slot" @pointerdown=${(c) => this._slotDown(c, r)}
              @pointermove=${(c) => this._lp.move(c)} @pointerup=${() => this._lp.cancel()}
              @pointercancel=${() => this._lp.cancel()} @contextmenu=${(c) => c.preventDefault()}>
              <span class="dot" style="background:${ut(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? l`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : l`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(a = r.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${$t(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${$t(this.hass, r, this._lang)}`}
                @click=${() => void this._remove(r)}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
      <p class="hint"><ha-icon icon="mdi:gesture-tap-hold"></ha-icon> ${this._tr("longpress_hint")}</p>
      ${this._menu ? l`<wp-dialog open heading=${$t(this.hass, this._menu, this._lang)}
            @closed=${(r) => {
      r.stopPropagation(), this._menu = void 0;
    }}>
            <div class="menu">
              <button class="btn" @click=${() => this._menuDo("edit")}><ha-icon icon="mdi:pencil"></ha-icon> ${this._tr("edit")}</button>
              <button class="btn" @click=${() => this._menuDo("copy")}><ha-icon icon="mdi:content-copy"></ha-icon> ${this._tr("copy_to")}</button>
              <button class="btn danger" @click=${() => this._menuDo("delete")}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>
            </div>
          </wp-dialog>` : h}
    `;
  }
};
H.styles = [
  lt,
  U`
      .wrap { padding: 56px 22px 0; overflow-x: auto; touch-action: pan-x pan-y; }
      .zoombar { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
      .menu { display: flex; flex-direction: column; gap: 8px; }
      .menu .btn { justify-content: flex-start; }
      .slot { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
      .track { position: relative; min-width: 100%; }
      .handles { position: absolute; left: 0; right: 0; top: 0; height: 28px; }
      .handle {
        position: absolute; top: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; padding: 0;
        border: none; background: none; cursor: ew-resize; touch-action: none; display: flex;
        align-items: center; justify-content: center;
      }
      .grip {
        width: 6px; height: 34px; border-radius: 3px; background: var(--primary-text-color);
        border: 1px solid var(--card-background-color, #fff); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      }
      .handle.active .grip { background: var(--primary-color); }
      .loupe {
        position: absolute; bottom: 100%; margin-bottom: 14px; transform: translateX(-50%); pointer-events: none;
        background: var(--primary-text-color); color: var(--card-background-color, #fff);
        border-radius: 12px; padding: 6px 14px; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
      .loupe::after {
        content: ""; position: absolute; left: 50%; top: 100%; margin-left: -6px; border: 6px solid transparent;
        border-top-color: var(--primary-text-color);
      }
      .list { margin: 8px 0; }
      .slot {
        display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--divider-color);
      }
      .times { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
      .stepper { display: inline-flex; align-items: center; gap: 2px; }
      .time { font-variant-numeric: tabular-nums; font-weight: 600; min-width: 44px; text-align: center; }
      .time.sun { font-weight: 500; text-align: left; display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .action { font-size: 12px; }
    `
];
G([
  f({ attribute: !1 })
], H.prototype, "hass", 2);
G([
  f({ attribute: !1 })
], H.prototype, "data", 2);
G([
  f({ attribute: !1 })
], H.prototype, "program", 2);
G([
  f({ attribute: !1 })
], H.prototype, "slots", 2);
G([
  f({ type: Number })
], H.prototype, "spill", 2);
G([
  f({ type: Number })
], H.prototype, "day", 2);
G([
  m()
], H.prototype, "_drag", 2);
G([
  m()
], H.prototype, "_dragSlots", 2);
G([
  m()
], H.prototype, "_notice", 2);
G([
  m()
], H.prototype, "_zoom", 2);
G([
  m()
], H.prototype, "_menu", 2);
H = G([
  N("wp-day-editor")
], H);
var Zi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, gt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Qi(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && Zi(e, s, n), n;
};
const tn = ["dawn", "sunrise", "sunset", "dusk"];
let tt = class extends P {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  willUpdate(t) {
    var e, s, i, n;
    t.has("entry") && this.entry && (this._s = structuredClone(this.entry), (e = this._s).conditions ?? (e.conditions = []), (s = this._s).actions ?? (s.actions = { by_type: {}, by_entity: {} }), (i = this._s.actions).by_type ?? (i.by_type = {}), (n = this._s.actions).by_entity ?? (n.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const t = /* @__PURE__ */ new Set();
    this.program.main_type && t.add(this.program.main_type);
    for (const e of this.program.entities) t.add(W(k(e.entity_id)));
    return [...t];
  }
  _update(t) {
    this._s = { ...this._s, ...t }, this._error = "";
  }
  /* ---- time specs ---- */
  _setSpec(t, e) {
    this._update({ [t]: e });
  }
  _specEditor(t, e) {
    const s = !("time" in e), i = this._tr(t === "start" ? "slot_start" : "slot_end");
    return l`
      <fieldset>
        <legend>${i}</legend>
        <div class="field">
          <select aria-label=${`${i} — ${this._tr("time_kind")}`}
            @change=${(n) => {
      const o = n.target.value === "sun";
      this._setSpec(t, o ? { sun: "sunset", offset: 0 } : { time: t === "start" ? "08:00" : "09:00" });
    }}>
            <option value="fixed" ?selected=${!s}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${s}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in e ? this._fixedEditor(t, e.time, i) : l`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(n) => this._setSpec(t, { ...e, sun: n.target.value })}>
                    ${tn.map((n) => l`<option value=${n} ?selected=${e.sun === n}>${this._tr(`sun_${n}`)}</option>`)}
                  </select>
                </div>
                <div class="field">
                  <label>${this._tr("sun_offset")}</label>
                  <input type="number" min="-240" max="240" step="5" .value=${String(e.offset ?? 0)}
                    @change=${(n) => {
      const o = Math.max(-240, Math.min(240, Math.round(Number(n.target.value) || 0)));
      this._setSpec(t, { ...e, offset: o });
    }} />
                </div>
              </div>
              <div class="row">
                ${["earliest", "latest"].map(
      (n) => l`
                    <div class="field">
                      <label>${this._tr(n === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${e[n] ?? ""}
                          @change=${(o) => {
        const r = o.target.value, a = { ...e };
        r ? a[n] = Z(K(r)) : delete a[n], this._setSpec(t, a);
      }} />
                        ${e[n] ? l`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => {
        const o = { ...e };
        delete o[n], this._setSpec(t, o);
      }}><ha-icon icon="mdi:close"></ha-icon></button>` : h}
                      </div>
                    </div>`
    )}
              </div>`}
      </fieldset>`;
  }
  _fixedEditor(t, e, s) {
    const i = t === "end" && e === "24:00";
    return l`
      ${i ? l`<p class="time-big">24:00</p>` : l`<div class="field"><input type="time" step="300" aria-label=${s} .value=${e}
            @change=${(n) => {
      const o = n.target.value;
      o && this._setSpec(t, { time: Z(K(o)) });
    }} /></div>`}
      ${t === "end" ? l`<label class="check"><input type="checkbox" .checked=${i}
            @change=${(n) => this._setSpec("end", { time: n.target.checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>` : h}`;
  }
  /* ---- actions ---- */
  _setMode(t, e) {
    const s = { ...this._s.actions.by_type };
    e ? s[t] = e : delete s[t], this._update({ actions: { ...this._s.actions, by_type: s } });
  }
  _setDirect(t, e) {
    const s = { ...this._s.actions.by_entity };
    e ? s[t] = e : delete s[t], this._update({ actions: { ...this._s.actions, by_entity: s } });
  }
  _switchMode(t) {
    this._mode = t, t === "modes" ? this._update({ actions: { ...this._s.actions, by_entity: {} } }) : this._update({ actions: { ...this._s.actions, by_type: {} } });
  }
  _modesEditor() {
    return l`${this._types.map((t) => {
      const e = this.data.modes.filter((i) => i.type === t), s = this._s.actions.by_type[t] ?? "";
      return l`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(t) })}</label>
          <select @change=${(i) => this._setMode(t, i.target.value)}>
            <option value="" ?selected=${s === ""}>—</option>
            ${e.map((i) => l`<option value=${i.id} ?selected=${i.id === s}>${i.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }
  _typeName(t) {
    return Ee(this._lang, t);
  }
  _directEditor() {
    return l`${this.program.entities.map((t) => {
      const e = this._s.actions.by_entity[t.entity_id];
      return l`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!e}
            @change=${(s) => this._setDirect(
        t.entity_id,
        s.target.checked ? ne(this.hass, t.entity_id) : null
      )} />
            <strong>${Q(this.hass, t.entity_id)}</strong></label>
          ${e ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${t.entity_id} .value=${e}
                .admin=${!!this.data.is_admin}
                @wp-change=${(s) => {
        s.stopPropagation(), this._setDirect(t.entity_id, s.detail);
      }}></wp-setpoint-editor>` : h}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(t) => this._update({ color: t.target.value })} />
        ${this._s.color ? l`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : h}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var i;
    const t = this._s, e = "time" in t.start ? K(t.start.time) : null;
    if (t.end && "time" in t.start && "time" in t.end && e === K(t.end.time)) return this._tr("err_start_equals_end");
    if (e !== null && e >= x) return this._tr("err_start_equals_end");
    if (!Object.keys(t.actions.by_type).length && !Object.keys(t.actions.by_entity).length) return this._tr("err_no_action");
    for (const n of Object.values(t.actions.by_entity)) {
      if (n.kind === "scene" && !n.scene) return this._tr("err_incomplete");
      if (n.kind === "script" && !n.script) return this._tr("err_incomplete");
      if (n.kind === "action" && !n.action) return this._tr("err_incomplete");
    }
    if ((i = t.conditions) != null && i.some((n) => !n.entity_id)) return this._tr("err_incomplete");
    const s = ke([...this.others, t]);
    if (s) {
      const n = s.find((o) => o.id !== t.id) ?? s[0];
      return this._tr("err_overlap", { slot: $t(this.hass, n, this._lang) });
    }
    return "";
  }
  _save() {
    var s, i;
    const t = this._validate();
    if (t) {
      this._error = t;
      return;
    }
    const e = structuredClone(this._s);
    e.color || delete e.color, this.dispatchEvent(new CustomEvent("wp-save", { detail: e, bubbles: !0, composed: !0 })), (i = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null || i.close();
  }
  render() {
    if (!this._s) return h;
    const t = this._s;
    return l`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", t.start)}
        <label class="check"><input type="checkbox" .checked=${!t.end}
          @change=${(e) => {
      if (e.target.checked) this._setSpec("end", null);
      else {
        const i = "time" in t.start ? K(t.start.time) : 480;
        this._setSpec("end", { time: Z(Math.min(x, i + 60)) });
      }
    }} /> ${this._tr("one_shot_check")}</label>
        ${t.end ? this._specEditor("end", t.end) : l`<p class="hint">${this._tr("one_shot_hint")}</p>`}

        <h3>${this._tr("slot_action")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("slot_action")}>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "modes"} @change=${() => this._switchMode("modes")} />
            ${this._tr("action_modes")}</label>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "direct"} @change=${() => this._switchMode("direct")} />
            ${this._tr("action_direct")}</label>
        </div>
        ${this._mode === "modes" ? this._modesEditor() : this._directEditor()}

        <h3>${this._tr("slot_conditions")}</h3>
        <wp-conditions-editor .hass=${this.hass} .conditions=${t.conditions ?? []}
          @wp-change=${(e) => {
      e.stopPropagation(), this._update({ conditions: e.detail });
    }}></wp-conditions-editor>

        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        <button slot="footer" class="btn" @click=${() => {
      var e, s;
      return (s = (e = this.shadowRoot) == null ? void 0 : e.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
tt.styles = [
  lt,
  U`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
gt([
  f({ attribute: !1 })
], tt.prototype, "hass", 2);
gt([
  f({ attribute: !1 })
], tt.prototype, "data", 2);
gt([
  f({ attribute: !1 })
], tt.prototype, "program", 2);
gt([
  f({ attribute: !1 })
], tt.prototype, "entry", 2);
gt([
  f({ attribute: !1 })
], tt.prototype, "others", 2);
gt([
  m()
], tt.prototype, "_s", 2);
gt([
  m()
], tt.prototype, "_mode", 2);
gt([
  m()
], tt.prototype, "_error", 2);
tt = gt([
  N("wp-slot-editor")
], tt);
var en = Object.defineProperty, sn = Object.getOwnPropertyDescriptor, R = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? sn(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && en(e, s, n), n;
};
const As = () => [[], [], [], [], [], [], []];
function fe(t) {
  return t.map((e) => ({ ...structuredClone(e), id: wt() }));
}
let O = class extends P {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  _long(t) {
    return T(this._lang).days[t];
  }
  _short(t) {
    return T(this._lang).days_short[t];
  }
  /* ---- initial state ---- */
  willUpdate(t) {
    if (!(this._ready && !t.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const e = wt();
        this._p = {
          id: "",
          revision: 0,
          name: "",
          icon: "mdi:calendar-clock",
          priority: 10,
          enabled: !0,
          reapply: !0,
          main_type: this.defaultTypes[0] ?? null,
          conditions: [],
          entities: [],
          active_profile: e,
          profiles: [{ id: e, name: this._tr("profile_default"), days: As() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._dayView = this.day, this._tab = this.day !== void 0 ? "week" : "general";
    }
  }
  _activeId() {
    var s, i;
    const t = this._p, e = !this._isNew && ((s = this.data.status[t.id]) == null ? void 0 : s.active_profile) || t.active_profile;
    return ((i = t.profiles.find((n) => n.id === e)) == null ? void 0 : i.id) ?? t.profiles[0].id;
  }
  get _profile() {
    return this._p.profiles.find((t) => t.id === this._profileId) ?? this._p.profiles[0];
  }
  _patch(t) {
    this._p = { ...this._p, ...t }, this._error = "";
  }
  _types() {
    const t = /* @__PURE__ */ new Set();
    this._p.main_type && t.add(this._p.main_type);
    for (const e of this._p.entities) t.add(W(k(e.entity_id)));
    return [...t];
  }
  _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  /* ---- profile / days ---- */
  _setProfile(t) {
    this._patch({ profiles: this._p.profiles.map((e) => e.id === t.id ? t : e) });
  }
  _setDay(t, e, s = this._profileId) {
    const i = this._p.profiles.find((o) => o.id === s);
    if (!i) return;
    const n = i.days.map((o, r) => r === t ? Se(this.hass, e) : o);
    this._setProfile({ ...i, days: n });
  }
  _spill(t, e) {
    const s = t.days[(e + 6) % 7] ?? [];
    return Ae(s).reduce((i, n) => Math.max(i, n.end), 0);
  }
  _submitProfileForm() {
    const t = this._profileForm;
    if (!t) return;
    const e = t.name.trim(), s = this._p.profiles.some((i) => i.name === e && !(t.mode === "rename" && i.id === this._profileId));
    if (!e || s || e.length > 40) {
      this._error = this._tr("err_profile_name");
      return;
    }
    if (t.mode === "rename")
      this._setProfile({ ...this._profile, name: e });
    else {
      const i = this._profile, n = {
        id: wt(),
        name: e,
        days: t.mode === "copy" ? i.days.map(fe) : As()
      };
      this._patch({ profiles: [...this._p.profiles, n] }), this._profileId = n.id;
    }
    this._profileForm = void 0, this._error = "";
  }
  _deleteProfile() {
    const t = this._profile, e = this._p.profiles.filter((s) => s.id !== t.id);
    this._patch({ profiles: e }), this._profileId = this._activeId(), e.some((s) => s.id === this._profileId) || (this._profileId = e[0].id);
  }
  _applyCopy() {
    const t = this._copy;
    if (!t) return;
    const e = this._profile.days[t.from] ?? [], s = t.slotId ? e.find((o) => o.id === t.slotId) : void 0, i = [];
    let n = this._p;
    for (const o of t.targets)
      o === t.from && t.profileId === this._profileId || (n = {
        ...n,
        profiles: n.profiles.map((r) => r.id !== t.profileId ? r : {
          ...r,
          days: r.days.map((a, c) => {
            if (c !== o) return a;
            if (!s) return fe(e);
            const d = Se(this.hass, [...a, ...fe([s])]);
            return ke(d) ? (i.push(o), a) : d;
          })
        })
      });
    this._p = n, this._copy = void 0, this._error = i.length ? this._tr("copy_slot_overlap", { days: i.map((o) => this._long(o)).join(", ") }) : "";
  }
  _saveSlot(t) {
    const e = this._dayView;
    if (e === void 0) return;
    const s = this._profile.days[e], i = s.some((n) => n.id === t.id);
    this._setDay(e, i ? s.map((n) => n.id === t.id ? t : n) : [...s, t]);
  }
  /* ---- entities ---- */
  _setEntity(t, e) {
    this._patch({ entities: this._p.entities.map((s, i) => i === t ? { ...s, ...e } : s) });
  }
  _addEntity(t) {
    if (!t || this._p.entities.some((o) => o.entity_id === t)) return;
    const e = W(k(t)), s = this.data.modes.filter((o) => o.type === e), i = s.find((o) => /eco|off|closed/.test(o.id)) ?? s[0], n = i ? { kind: "mode", value: i.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: t, default: n, force_permanent: !1 }],
      main_type: this._p.main_type || e
    });
  }
  _setDefaultKind(t, e) {
    var o;
    const s = this._p.entities[t], i = W(k(s.entity_id));
    let n;
    e === "mode" && (n = ((o = this.data.modes.find((r) => r.type === i)) == null ? void 0 : o.id) ?? ""), e === "setpoint" && (n = ne(this.hass, s.entity_id)), this._setEntity(t, { default: n === void 0 ? { kind: e } : { kind: e, value: n } });
  }
  /* ---- save / delete ---- */
  _validate() {
    const t = this._p;
    if (!t.name.trim()) return this._tr("err_name");
    if (!t.entities.length) return this._tr("err_no_entity");
    if (t.conditions.some((s) => !s.entity_id)) return this._tr("err_incomplete");
    const e = t.profiles.map((s) => s.name.trim());
    if (new Set(e).size !== e.length) return this._tr("err_profile_name");
    for (const s of t.profiles)
      for (let i = 0; i < 7; i++)
        if (ke(s.days[i]))
          return this._tr("err_overlap_day", { profile: s.name, day: this._long(i) });
    return "";
  }
  _payload() {
    const t = structuredClone(this._p), e = new Set(t.entities.map((s) => s.entity_id));
    return t.name = t.name.trim(), t.profiles = t.profiles.map((s) => ({
      ...s,
      days: s.days.map((i) => i.map((n) => {
        const o = Object.fromEntries(Object.entries(n.actions.by_entity).filter(([r]) => e.has(r)));
        return { ...n, actions: { ...n.actions, by_entity: o } };
      }))
    })), this._isNew && delete t.id, t.main_type || (t.main_type = null), t;
  }
  _errorText(t) {
    const e = t, s = (e == null ? void 0 : e.message) ?? String(t);
    return (e == null ? void 0 : e.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (e == null ? void 0 : e.code) === "unauthorized" ? this._tr("err_unauthorized") : s.includes("overlapping_slots") ? this._tr("err_overlap_server") : s.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: s });
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
    await mt(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(t) {
    await mt(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(t) {
    var i;
    const e = (i = this._p.entities[t]) == null ? void 0 : i.entity_id;
    if (!e) return;
    const s = this._tr("confirm_delete", { name: Q(this.hass, e) });
    await mt(this, s, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((n, o) => o !== t) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  _duplicate() {
    const t = wt(), e = this._p, s = /* @__PURE__ */ new Map(), i = e.profiles.map((n) => {
      const o = n.id === this._activeId() ? t : wt();
      return s.set(n.id, o), { ...structuredClone(n), id: o, days: n.days.map(fe) };
    });
    this._p = {
      ...structuredClone(e),
      id: "",
      revision: 0,
      created_at: void 0,
      name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles: i,
      active_profile: s.get(this._activeId()) ?? i[0].id
    }, delete this._p.created_at, this._isNew = !0, this._profileId = this._p.active_profile ?? i[0].id, this._error = "";
  }
  _close() {
    var t;
    (t = this.renderRoot.querySelector("#main")) == null || t.close();
  }
  /* ---- render: tabs ---- */
  _renderGeneral() {
    const t = this._p, e = this._types();
    return l`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${t.name}
          @input=${(s) => this._patch({ name: s.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${t.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${t.icon}></ha-icon>` : h}
            <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${t.icon ?? ""}
              @input=${(s) => this._patch({ icon: s.target.value.trim() || null })} />
          </div></div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(t.priority)}
            @change=${(s) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(s.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${t.enabled}
        @change=${(s) => this._patch({ enabled: s.target.checked })} /> ${this._tr("pe_enabled")}</label>
      <label class="check"><input type="checkbox" .checked=${t.reapply}
        @change=${(s) => this._patch({ reapply: s.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      ${e.length ? l`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(s) => this._patch({ main_type: s.target.value })}>
              ${e.map((s) => l`<option value=${s} ?selected=${s === (t.main_type || e[0])}>${Ee(this._lang, s)}</option>`)}
            </select></div>` : h}
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${t.conditions}
        @wp-change=${(s) => {
      s.stopPropagation(), this._patch({ conditions: s.detail });
    }}></wp-conditions-editor>
    `;
  }
  updated() {
    Bs(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const t = this._p;
    return l`
      ${t.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : h}
      ${t.entities.map((e, s) => this._renderEntity(e, s))}
      ${qi(this._pickerKey, l`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${Ci} .exclude=${t.entities.map((e) => e.entity_id)}
        @wp-change=${(e) => {
      e.stopPropagation(), this._addEntity(e.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(t, e) {
    var a, c;
    const s = W(k(t.entity_id)), i = ((a = this.hass.states[t.entity_id]) == null ? void 0 : a.attributes) ?? {}, n = Array.isArray(i.preset_modes) && i.preset_modes.includes("permanent"), o = this.data.modes.filter((d) => d.type === s), r = ((c = t.default) == null ? void 0 : c.kind) ?? "none";
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Q(this.hass, t.entity_id)}</strong>
            ${this.hass.states[t.entity_id] ? h : l`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Q(this.hass, t.entity_id)}`}
            @click=${() => void this._askDeleteEntity(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(d) => this._setDefaultKind(e, d.target.value)}>
            <option value="none" ?selected=${r === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${r === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${r === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${r === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${r === "mode" ? l`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(d) => this._setEntity(e, { default: { kind: "mode", value: d.target.value } })}>
              ${o.map((d) => l`<option value=${d.id} ?selected=${d.id === t.default.value}>${d.name}</option>`)}
            </select></div>` : h}
        ${r === "setpoint" ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${t.entity_id} .admin=${!!this.data.is_admin}
              .value=${t.default.value ?? null}
              @wp-change=${(d) => {
      d.stopPropagation(), this._setEntity(e, { default: { kind: "setpoint", value: d.detail } });
    }}></wp-setpoint-editor>` : h}
        ${n || t.force_permanent ? l`<label class="check"><input type="checkbox" .checked=${!!t.force_permanent}
              @change=${(d) => this._setEntity(e, { force_permanent: d.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : h}
      </div>`;
  }
  _renderWeek() {
    const t = this._p, e = this._profile, s = this._activeId(), i = this._profileForm;
    return l`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(n) => {
      this._profileId = n.target.value, this._dayView = void 0;
    }}>
            ${t.profiles.map((n) => l`<option value=${n.id} ?selected=${n.id === e.id}>${n.name}${n.id === s ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: e.name }}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${t.profiles.length < 2 || e.id === s}
          @click=${() => void this._askDeleteProfile(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${e.id === s ? l`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : h}
      ${i ? l`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(i.mode === "rename" ? "profile_rename" : i.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${i.name}
                @input=${(n) => this._profileForm = { ...i, name: n.target.value }}
                @keydown=${(n) => {
      n.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${i.mode === "rename" ? l`<p class="hint">${this._tr("profile_rename_warning")}</p>` : h}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : h}
      ${this._dayView === void 0 ? this._renderDays(e) : this._renderDayEditor(e, this._dayView)}
    `;
  }
  _renderDays(t) {
    return l`${t.days.map((e, s) => {
      const i = Vs(this.hass, this.data, this._p, e, this._spill(t, s)), n = this._long(s);
      return l`
        <div class="dayrow">
          <button class="dname" @click=${() => this._dayView = s} aria-label=${`${this._tr("edit")} ${n}`}>${this._short(s)}</button>
          <div class="grow bar" @click=${() => this._dayView = s}><wp-day-bar .spans=${i}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${n}`} @click=${() => this._dayView = s}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${n}`} title=${this._tr("copy_day")}
            @click=${() => this._copy = { from: s, targets: [], profileId: t.id }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        </div>`;
    })}`;
  }
  _renderDayEditor(t, e) {
    return l`
      <div class="row daynav">
        <button class="btn" @click=${() => this._dayView = void 0}><ha-icon icon="mdi:arrow-left"></ha-icon> ${this._tr("week")}</button>
        <span class="grow"></span>
        <button class="ibtn" aria-label=${this._tr("previous_day")} @click=${() => this._dayView = (e + 6) % 7}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <strong>${this._long(e)}</strong>
        <button class="ibtn" aria-label=${this._tr("next_day")} @click=${() => this._dayView = (e + 1) % 7}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-day-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .day=${e}
        .slots=${t.days[e]} .spill=${this._spill(t, e)}
        @wp-change=${(s) => {
      s.stopPropagation(), this._setDay(e, s.detail);
    }}
        @edit-slot=${(s) => {
      s.stopPropagation(), this._slotEdit = s.detail;
    }}
        @copy-slot=${(s) => {
      s.stopPropagation(), this._copy = { from: e, targets: [], profileId: t.id, slotId: s.detail.slot.id };
    }}></wp-day-editor>
    `;
  }
  /* ---- render: dialogs ---- */
  _renderCopy() {
    const t = this._copy;
    if (!t) return h;
    const e = (i) => this._copy = { ...t, targets: i }, s = [0, 1, 2, 3, 4, 5, 6];
    return l`
      <wp-dialog open heading=${t.slotId ? this._tr("copy_slot") : `${this._tr("copy_day")} — ${this._long(t.from)}`}
        @closed=${(i) => {
      i.stopPropagation(), this._copy = void 0;
    }}>
        <div class="row">
          <button class="btn" @click=${() => e([0, 1, 2, 3, 4])}>${this._tr("copy_mon")} <ha-icon icon="mdi:arrow-right"></ha-icon> ${this._tr("copy_fri")}</button>
          <button class="btn" @click=${() => e([5, 6])}>${this._tr("copy_weekend")}</button>
          <button class="btn" @click=${() => e(s)}>${this._tr("copy_all")}</button>
        </div>
        <div class="row" role="group" aria-label=${this._tr("copy_choose")}>
          ${s.map((i) => l`<label class="check"><input type="checkbox" .checked=${t.targets.includes(i)}
            @change=${(n) => e(n.target.checked ? [...t.targets, i] : t.targets.filter((o) => o !== i))} />
            ${this._short(i)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(i) => this._copy = { ...t, profileId: i.target.value }}>
            ${this._p.profiles.map((i) => l`<option value=${i.id} ?selected=${i.id === t.profileId}>${i.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr(t.slotId ? "copy_slot_hint" : "copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => this._copy = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }
  render() {
    if (!this._p) return h;
    const t = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], e = this._canEdit(), s = this._dayView;
    return l`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${e ? h : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${t.map(([i, n]) => l`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(n)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        ${this._isNew ? h : l`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? h : l`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!e}
              @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>`}
      </wp-dialog>
      ${this._renderCopy()}
      ${this._slotEdit && s !== void 0 ? l`<wp-slot-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .entry=${this._slotEdit.slot}
            .others=${this._profile.days[s].filter((i) => i.id !== this._slotEdit.slot.id)}
            @wp-save=${(i) => {
      i.stopPropagation(), this._saveSlot(i.detail);
    }}
            @closed=${(i) => {
      i.stopPropagation(), this._slotEdit = void 0;
    }}></wp-slot-editor>` : h}
    `;
  }
};
O.styles = [
  lt,
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
      ${Ye(qs)}
      .break { display: none; }
      @media (max-width: 520px) {
        .break { display: block; order: 3; flex: 1 0 100%; height: 0; }
        .del { order: 4; margin-right: auto; }
      }
      @media (min-width: 521px) { .del { order: -1; margin-right: auto; } }
      .profile-bar { align-items: flex-end; gap: 4px; }
      .dayrow { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
      .dname {
        flex: none; width: 44px; min-height: 48px; border: none; background: none; color: inherit;
        font-weight: 600; text-align: left; cursor: pointer;
      }
      .bar { cursor: pointer; }
      .daynav { margin: 8px 0; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `
];
R([
  f({ attribute: !1 })
], O.prototype, "hass", 2);
R([
  f({ attribute: !1 })
], O.prototype, "data", 2);
R([
  f({ attribute: !1 })
], O.prototype, "program", 2);
R([
  f({ attribute: !1 })
], O.prototype, "defaultTypes", 2);
R([
  f({ type: Number })
], O.prototype, "day", 2);
R([
  m()
], O.prototype, "_p", 2);
R([
  m()
], O.prototype, "_isNew", 2);
R([
  m()
], O.prototype, "_tab", 2);
R([
  m()
], O.prototype, "_profileId", 2);
R([
  m()
], O.prototype, "_dayView", 2);
R([
  m()
], O.prototype, "_slotEdit", 2);
R([
  m()
], O.prototype, "_error", 2);
R([
  m()
], O.prototype, "_saving", 2);
R([
  m()
], O.prototype, "_copy", 2);
R([
  m()
], O.prototype, "_profileForm", 2);
O = R([
  N("wp-program-editor")
], O);
var nn = Object.defineProperty, on = Object.getOwnPropertyDescriptor, F = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? on(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && nn(e, s, n), n;
};
const Ms = 7 * 24 * 3600 * 1e3;
function rn(t, e) {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(t), i = (o) => {
    var r;
    return Number(((r = s.find((a) => a.type === o)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(i("year"), i("month") - 1, i("day"), i("hour"), i("minute"), i("second")) - Math.floor(t.getTime() / 1e3) * 1e3;
}
function He(t, e, s) {
  const [i, n, o] = t.split("-").map(Number), [r, a] = e.split(":").map(Number), c = Date.UTC(i, n - 1, o, r, a);
  let d = c;
  for (let u = 0; u < 3; u++) d = c - rn(new Date(d), s);
  return new Date(d);
}
function Es(t, e) {
  const [s, i, n] = t.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, n + e)).toISOString().slice(0, 10);
}
let j = class extends P {
  constructor() {
    super(...arguments), this._sel = [], this._how = "setpoint", this._sp = null, this._modeId = "", this._dur = "next", this._hours = 1, this._minutes = 0, this._untilTime = "18:00", this._untilDate = "", this._error = "", this._busy = !1, this._init = !1;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  willUpdate() {
    if (this._init || !this.program) return;
    this._init = !0;
    const t = this.program.entities.map((s) => s.entity_id), e = W(k(t[0] ?? ""));
    this._sel = t.filter((s) => W(k(s)) === e);
  }
  get _rep() {
    var t;
    return this._sel[0] ?? ((t = this.program.entities[0]) == null ? void 0 : t.entity_id) ?? "";
  }
  get _sameType() {
    return new Set(this._sel.map((t) => W(k(t)))).size <= 1;
  }
  get _modes() {
    const t = W(k(this._rep));
    return this.data.modes.filter((e) => e.type === t);
  }
  _toggle(t, e) {
    this._sel = e ? [...this._sel, t] : this._sel.filter((s) => s !== t), this._sp = null, this._modeId = "", this._error = "";
  }
  _timing() {
    if (this._dur === "next") return {};
    if (this._dur === "for") {
      const i = Math.max(0, Math.floor(this._hours || 0)), n = Math.max(0, Math.floor(this._minutes || 0)), o = (i * 60 + n) * 6e4;
      return o <= 0 ? this._tr("ov_err_duration") : o > Ms ? this._tr("ov_err_week") : { duration: { hours: i, minutes: n } };
    }
    const t = this.hass.config.time_zone, e = /* @__PURE__ */ new Date();
    let s;
    if (this._untilDate)
      s = He(this._untilDate, this._untilTime, t);
    else {
      const i = kt(e, t);
      s = He(i, this._untilTime, t), s <= e && (s = He(Es(i, 1), this._untilTime, t));
    }
    return s.getTime() <= e.getTime() ? this._tr("ov_err_past") : s.getTime() - e.getTime() > Ms ? this._tr("ov_err_week") : { until: s.toISOString() };
  }
  async _apply() {
    var s, i, n;
    if (!this._sel.length) {
      this._error = this._tr("ov_err_no_entity");
      return;
    }
    if (!this._sameType) {
      this._error = this._tr("ov_err_mixed");
      return;
    }
    const t = this._timing();
    if (typeof t == "string") {
      this._error = t;
      return;
    }
    const e = /* @__PURE__ */ new Map();
    if (this._how === "mode") {
      const o = this._modes.find((r) => r.id === this._modeId);
      if (!o) {
        this._error = this._tr("ov_err_no_setpoint");
        return;
      }
      for (const r of this._sel) {
        const a = ((s = o.exceptions) == null ? void 0 : s[r]) ?? o.value, c = JSON.stringify(a), d = e.get(c) ?? { entity_id: [], setpoint: a };
        d.entity_id.push(r), e.set(c, d);
      }
    } else {
      const o = this._sp ?? ne(this.hass, this._rep);
      e.set("sp", { entity_id: [...this._sel], setpoint: o });
    }
    this._busy = !0;
    try {
      for (const o of e.values())
        await this.hass.callService("weekly_planner", "override", { ...o, ...t });
      (n = (i = this.shadowRoot) == null ? void 0 : i.querySelector("wp-dialog")) == null || n.close();
    } catch (o) {
      this._error = this._tr("error", { message: (o == null ? void 0 : o.message) ?? String(o) });
    } finally {
      this._busy = !1;
    }
  }
  async _resume(t) {
    try {
      await this.hass.callService("weekly_planner", "resume", { entity_id: [t] });
    } catch (e) {
      this._error = this._tr("error", { message: (e == null ? void 0 : e.message) ?? String(e) });
    }
  }
  _current() {
    const t = this.program.entities.map((s) => {
      var i;
      return { id: s.entity_id, o: (i = this.data.entities[s.entity_id]) == null ? void 0 : i.override };
    }).filter((s) => s.o);
    if (!t.length) return h;
    const e = this.hass.config.time_zone;
    return l`
      <h3>${this._tr("ov_current")}</h3>
      ${t.map(({ id: s, o: i }) => l`
        <div class="card row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${oe(this.hass, s)}</strong>
            <div class="muted small">${i.origin === "voluntary" && i.until ? this._tr("overridden_until", { time: qe(i.until, e, this._lang) }) : i.origin === "voluntary" ? this._tr("ov_until_next") : this._tr("overridden")}</div></div>
          <button class="btn" @click=${() => void this._resume(s)}>${this._tr("resume")}</button>
        </div>`)}`;
  }
  render() {
    if (!this.program || !this.data) return h;
    const t = this.data.can_edit && !this.data.read_only, e = this._modes;
    return l`
      <wp-dialog open heading=${`${this._tr("override")} — ${this.program.name}`}>
        ${this._current()}
        <h3>${this._tr("ov_entities")}</h3>
        <div role="group" aria-label=${this._tr("ov_entities")}>
          ${this.program.entities.map((s) => l`
            <label class="check"><input type="checkbox" .checked=${this._sel.includes(s.entity_id)}
              @change=${(i) => this._toggle(s.entity_id, i.target.checked)} />
              ${oe(this.hass, s.entity_id)}</label>`)}
        </div>
        ${this._sameType ? h : l`<p class="error">${this._tr("ov_err_mixed")}</p>`}

        <h3>${this._tr("setpoint")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("setpoint")}>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "setpoint"} @change=${() => this._how = "setpoint"} /> ${this._tr("ov_how_setpoint")}</label>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "mode"} ?disabled=${!e.length} @change=${() => this._how = "mode"} /> ${this._tr("ov_how_mode")}</label>
        </div>
        ${this._how === "mode" ? l`<div class="field"><select aria-label=${this._tr("ov_how_mode")} @change=${(s) => this._modeId = s.target.value}>
              <option value="" ?selected=${!this._modeId}>—</option>
              ${e.map((s) => l`<option value=${s.id} ?selected=${s.id === this._modeId}>${s.name}</option>`)}
            </select></div>` : this._rep ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${this._rep} state-only
                .value=${this._sp ?? ne(this.hass, this._rep)}
                @wp-change=${(s) => {
      s.stopPropagation(), this._sp = s.detail, this._error = "";
    }}></wp-setpoint-editor>` : h}

        <h3>${this._tr("ov_duration")}</h3>
        <div role="radiogroup" aria-label=${this._tr("ov_duration")}>
          <label class="check"><input type="radio" name="dur" .checked=${this._dur === "next"} @change=${() => this._dur = "next"} /> ${this._tr("ov_until_next")}</label>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "for"} @change=${() => this._dur = "for"} /> ${this._tr("ov_for")}</label>
            <input type="number" min="0" max="168" style="width:80px" aria-label=${this._tr("ov_hours")} .value=${String(this._hours)}
              @focus=${() => this._dur = "for"} @input=${(s) => this._hours = Number(s.target.value)} /> h
            <input type="number" min="0" max="59" step="5" style="width:80px" aria-label=${this._tr("ov_minutes")} .value=${String(this._minutes)}
              @focus=${() => this._dur = "for"} @input=${(s) => this._minutes = Number(s.target.value)} /> min
          </div>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "until"} @change=${() => this._dur = "until"} /> ${this._tr("ov_until")}</label>
            <input type="time" step="300" style="width:130px" aria-label=${this._tr("ov_until")} .value=${this._untilTime}
              @focus=${() => this._dur = "until"} @input=${(s) => {
      this._untilTime = s.target.value, this._dur = "until";
    }} />
            <input type="date" style="width:160px" aria-label=${this._tr("ov_date")} .value=${this._untilDate}
              min=${kt(/* @__PURE__ */ new Date(), this.hass.config.time_zone)}
              max=${Es(kt(/* @__PURE__ */ new Date(), this.hass.config.time_zone), 7)}
              @input=${(s) => {
      this._untilDate = s.target.value, this._dur = "until";
    }} />
          </div>
          ${this._dur === "until" ? l`<p class="hint">${this._tr("ov_until_hint")}</p>` : h}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        <button slot="footer" class="btn" @click=${() => {
      var s, i;
      return (i = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._busy} @click=${() => void this._apply()}>${this._tr("ov_apply")}</button>
      </wp-dialog>`;
  }
};
j.styles = [
  lt,
  U`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
    `
];
F([
  f({ attribute: !1 })
], j.prototype, "hass", 2);
F([
  f({ attribute: !1 })
], j.prototype, "data", 2);
F([
  f({ attribute: !1 })
], j.prototype, "program", 2);
F([
  m()
], j.prototype, "_sel", 2);
F([
  m()
], j.prototype, "_how", 2);
F([
  m()
], j.prototype, "_sp", 2);
F([
  m()
], j.prototype, "_modeId", 2);
F([
  m()
], j.prototype, "_dur", 2);
F([
  m()
], j.prototype, "_hours", 2);
F([
  m()
], j.prototype, "_minutes", 2);
F([
  m()
], j.prototype, "_untilTime", 2);
F([
  m()
], j.prototype, "_untilDate", 2);
F([
  m()
], j.prototype, "_error", 2);
F([
  m()
], j.prototype, "_busy", 2);
j = F([
  N("wp-override-dialog")
], j);
var an = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, Mt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ln(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && an(e, s, n), n;
};
const cn = ["climate", "cover", "light", "switch"];
let at = class extends P {
  constructor() {
    super(...arguments), this._type = "", this._rep = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  _types() {
    const t = new Set(cn);
    for (const e of this.data.modes) t.add(e.type);
    for (const e of this.data.programs) for (const s of e.entities) t.add(W(k(s.entity_id)));
    return [...t];
  }
  get _current() {
    return this._type || this._types()[0];
  }
  _users(t) {
    return this.data.programs.filter(
      (e) => e.profiles.some((s) => s.days.some((i) => i.some((n) => Object.values(n.actions.by_type).includes(t)))) || e.entities.some((s) => {
        var i;
        return ((i = s.default) == null ? void 0 : i.kind) === "mode" && s.default.value === t;
      })
    ).length;
  }
  _domains(t) {
    return t === "switch" ? ["switch", "input_boolean"] : [t];
  }
  /** Entities of a type, those used by programs first. */
  _candidates(t) {
    const e = this._domains(t), s = new Set(this.data.programs.flatMap((i) => i.entities.map((n) => n.entity_id)));
    return Object.keys(this.hass.states).filter((i) => e.includes(k(i))).sort((i, n) => Number(s.has(n)) - Number(s.has(i)) || i.localeCompare(n)).slice(0, 300);
  }
  _startEdit(t) {
    const e = this._current;
    this._error = "", t ? (this._edit = structuredClone(t), this._rep = this._candidates(e)[0] ?? `${this._domains(e)[0]}.x`) : (this._rep = this._candidates(e)[0] ?? `${this._domains(e)[0]}.x`, this._edit = { type: e, name: "", color: "#2196f3", icon: null, value: ne(this.hass, this._rep), exceptions: {} });
  }
  _patch(t) {
    this._edit && (this._edit = { ...this._edit, ...t }), this._error = "";
  }
  _errorText(t) {
    const e = t;
    return (e == null ? void 0 : e.code) === "in_use" ? this._tr("mode_in_use", { list: e.message ?? "" }) : (e == null ? void 0 : e.code) === "unauthorized" ? this._tr("err_unauthorized") : this._tr("error", { message: (e == null ? void 0 : e.message) ?? String(t) });
  }
  async _save() {
    const t = this._edit;
    if (t) {
      if (!t.name.trim()) {
        this._error = this._tr("err_name");
        return;
      }
      if (["scene", "script", "action"].includes(t.value.kind)) {
        this._error = this._tr("err_incomplete");
        return;
      }
      this._saving = !0;
      try {
        const e = { ...t, name: t.name.trim() };
        e.icon || (e.icon = null), e.id || delete e.id, await this.hass.callWS({ type: "weekly_planner/mode/save", mode: e }), this._edit = void 0;
      } catch (e) {
        this._error = this._errorText(e);
      } finally {
        this._saving = !1;
      }
    }
  }
  async _askDelete(t) {
    await mt(this, this._tr("confirm_delete", { name: t.name }), this._tr("delete")) && await this._delete(t.id);
  }
  async _delete(t) {
    try {
      await this.hass.callWS({ type: "weekly_planner/mode/delete", mode_id: t }), this._error = "";
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  /* ---- render ---- */
  updated() {
    Bs(this.renderRoot.querySelector(".tabs"));
  }
  _renderList() {
    const t = this._current, e = this.data.modes.filter((i) => i.type === t), s = this.data.can_edit && !this.data.read_only;
    return l`
      <div class="tabs" role="tablist">
        ${this._types().map((i) => l`<button role="tab" aria-selected=${i === t} class="tab ${i === t ? "on" : ""}"
          @click=${() => {
      this._type = i, this._error = "";
    }}>${Ee(this._lang, i)}</button>`)}
      </div>
      ${e.length === 0 ? l`<p class="muted">${this._tr("no_modes")}</p>` : h}
      ${e.map((i) => {
      const n = this._users(i.id);
      return l`
          <div class="mode">
            <span class="dot" style="background:${i.color}"></span>
            <div class="grow">
              <strong>${i.name}</strong>
              <div class="muted small">${be(this._lang, i.value)}${Object.keys(i.exceptions ?? {}).length ? ` · ${this._tr("mode_exceptions_n", { n: String(Object.keys(i.exceptions).length) })}` : ""}</div>
              <div class="muted small">${n === 0 ? this._tr("mode_unused") : this._tr(n === 1 ? "mode_used_one" : "mode_used_many", { n: String(n) })}</div>
            </div>
            <button class="ibtn" ?disabled=${!s} aria-label=${`${this._tr("edit")} ${i.name}`} @click=${() => this._startEdit(i)}><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="ibtn" ?disabled=${!s} aria-label=${`${this._tr("delete")} ${i.name}`} @click=${() => {
        this._error = "", this._askDelete(i);
      }}><ha-icon icon="mdi:delete"></ha-icon></button>
          </div>`;
    })}
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
      <button class="btn" ?disabled=${!s} @click=${() => this._startEdit()}>+ ${this._tr("mode_new")}</button>
    `;
  }
  _renderForm(t) {
    const e = t.type, s = this._domains(e), i = this._candidates(e), n = this._rep, o = Object.entries(t.exceptions ?? {});
    return l`
      <div class="field"><label for="m-name">${this._tr("mode_name")}</label>
        <input id="m-name" type="text" maxlength="40" .value=${t.name}
          @input=${(a) => this._patch({ name: a.target.value })} /></div>
      <div class="row">
        <div class="field" style="flex:0 0 auto"><label for="m-color">${this._tr("mode_color")}</label>
          <input id="m-color" type="color" .value=${t.color || "#9e9e9e"}
            @input=${(a) => this._patch({ color: a.target.value })} /></div>
        <div class="field"><label for="m-icon">${this._tr("pe_icon")}</label>
          <input id="m-icon" type="text" placeholder="mdi:sofa" .value=${t.icon ?? ""}
            @input=${(a) => this._patch({ icon: a.target.value.trim() || null })} /></div>
      </div>
      <h3>${this._tr("mode_value")}</h3>
      ${i.length ? l`<div class="field"><label>${this._tr("mode_rep_entity")}</label>
            <select @change=${(a) => this._rep = a.target.value}>
              ${i.map((a) => l`<option value=${a} ?selected=${a === n}>${Q(this.hass, a)}</option>`)}
            </select></div>` : h}
      <wp-setpoint-editor .hass=${this.hass} entity-id=${n} .value=${t.value} .admin=${!1} state-only
        @wp-change=${(a) => {
      a.stopPropagation(), this._patch({ value: a.detail });
    }}></wp-setpoint-editor>
      <h3>${this._tr("mode_exceptions")}</h3>
      <p class="hint">${this._tr("mode_exceptions_hint")}</p>
      ${o.map(([a, c]) => l`
        <div class="card">
          <div class="row" style="flex-wrap:nowrap">
            <strong class="grow">${Q(this.hass, a)}</strong>
            <button class="ibtn" aria-label=${`${this._tr("delete")} ${Q(this.hass, a)}`}
              @click=${async () => {
      if (!await mt(this, this._tr("confirm_delete", { name: Q(this.hass, a) }), this._tr("delete"))) return;
      const d = { ...t.exceptions };
      delete d[a], this._patch({ exceptions: d });
    }}><ha-icon icon="mdi:delete"></ha-icon></button>
          </div>
          <wp-setpoint-editor .hass=${this.hass} entity-id=${a} .value=${c} state-only
            @wp-change=${(d) => {
      d.stopPropagation(), this._patch({ exceptions: { ...t.exceptions, [a]: d.detail } });
    }}></wp-setpoint-editor>
        </div>`)}
      <wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("mode_add_exception")} .domains=${s}
        .exclude=${Object.keys(t.exceptions ?? {})}
        @wp-change=${(a) => {
      a.stopPropagation(), a.detail && this._patch({ exceptions: { ...t.exceptions, [a.detail]: structuredClone(t.value) } });
    }}></wp-entity-picker>
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
    `;
  }
  render() {
    if (!this.data) return h;
    const t = this._edit;
    return l`
      <wp-dialog open wide heading=${t ? t.id ? this._tr("mode_edit") : this._tr("mode_new") : this._tr("modes")}>
        ${t ? this._renderForm(t) : this._renderList()}
        ${t ? l`<button slot="footer" class="btn" @click=${() => {
      this._edit = void 0, this._error = "";
    }}>${this._tr("cancel")}</button>
              <button slot="footer" class="btn primary" ?disabled=${this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>` : l`<button slot="footer" class="btn" @click=${() => {
      var e, s;
      return (s = (e = this.shadowRoot) == null ? void 0 : e.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("close")}</button>`}
      </wp-dialog>`;
  }
};
at.styles = [
  lt,
  U`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      ${Ye(qs)}
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      .mode { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); flex-wrap: wrap; }
      .mode .dot { width: 20px; height: 20px; border-radius: 10px; }
    `
];
Mt([
  f({ attribute: !1 })
], at.prototype, "hass", 2);
Mt([
  f({ attribute: !1 })
], at.prototype, "data", 2);
Mt([
  m()
], at.prototype, "_type", 2);
Mt([
  m()
], at.prototype, "_edit", 2);
Mt([
  m()
], at.prototype, "_rep", 2);
Mt([
  m()
], at.prototype, "_error", 2);
Mt([
  m()
], at.prototype, "_saving", 2);
at = Mt([
  N("wp-modes-editor")
], at);
var dn = Object.defineProperty, hn = Object.getOwnPropertyDescriptor, nt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? hn(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && dn(e, s, n), n;
};
const ge = 15, Be = (t) => t >= x ? "24:00" : Z(t);
let V = class extends P {
  constructor() {
    super(...arguments), this._day = 0, this._error = "", this._conflict = !1, this._saving = !1, this._saved = !1, this._adding = !1, this._swipe = new Hs(60);
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.clearTimeout(this._closeTimer);
  }
  willUpdate() {
    this._p || !this.hass || !this.data || !this.program || (this._p = structuredClone(this.program), this._day = Math.max(0, se(/* @__PURE__ */ new Date(), this.hass.config.time_zone)));
  }
  /* ---- data ---- */
  get _profile() {
    return St(this._p, this.data);
  }
  get _slots() {
    return this._profile.days[this._day] ?? [];
  }
  _setDay(t, e) {
    const s = this._p, i = this._profile.id, n = Se(this.hass, e);
    this._p = {
      ...s,
      profiles: s.profiles.map((o) => o.id === i ? { ...o, days: o.days.map((r, a) => a === t ? n : r) } : o)
    }, this._error = "";
  }
  _patchSlot(t, e) {
    this._setDay(this._day, this._slots.map((s) => s.id === t ? { ...s, ...e } : s));
  }
  _go(t) {
    this._day = (t % 7 + 7) % 7, this._error = "";
  }
  get _modes() {
    return this.data.modes.filter((t) => t.type === ot(this._p));
  }
  /* ---- time editing ---- */
  _setTime(t, e, s) {
    let i = Math.max(0, Math.min(x, Math.round(s / 5) * 5));
    e === "start" ? i = Math.min(i, x - 5) : i === 0 && (i = x), this._patchSlot(t.id, { [e]: { time: Be(i) } });
  }
  _fromInput(t, e, s) {
    const i = s.target.value;
    /^\d{2}:\d{2}$/.test(i) && this._setTime(t, e, K(i));
  }
  _shift(t, e, s) {
    const i = t[e], n = i ? A(i) : null;
    if (n === null) return;
    const o = e === "end" ? Math.max(ge, Math.min(x, n + s)) : Math.max(0, Math.min(x - ge, n + s));
    this._setTime(t, e, o);
  }
  /* ---- slots ---- */
  _mode(t) {
    return t.actions.by_type[ot(this._p)] ?? "";
  }
  _setMode(t, e) {
    const s = ot(this._p);
    this._patchSlot(t.id, { actions: { ...t.actions, by_type: { ...t.actions.by_type, [s]: e } } });
  }
  _add(t) {
    this._adding = !1;
    const e = this._slots;
    let s = 8 * 60;
    e.length && (s = Math.max(...e.map((r) => {
      const a = Ct(this.hass, r.start), c = r.end ? Ct(this.hass, r.end) : a;
      return c > a ? c : x;
    }))), s = Math.min(s, x - 60);
    const i = this._modes, n = i.find((r) => /confort|comfort/i.test(`${r.id} ${r.name}`)) ?? i[0], o = {
      id: wt(),
      start: { time: Be(s) },
      conditions: [],
      actions: { by_type: n ? { [ot(this._p)]: n.id } : {}, by_entity: {} }
    };
    t && (o.end = { time: Be(Math.min(x, s + 60)) }), this._setDay(this._day, [...e, o]);
  }
  async _remove(t) {
    const e = this._tr("ss_confirm_remove", { time: this._sentenceTime(t) });
    await mt(this, e, this._tr("ss_remove")) && this._setDay(this._day, this._slots.filter((s) => s.id !== t.id));
  }
  async _copy(t) {
    const e = (t === "weekdays" ? [0, 1, 2, 3, 4] : t === "weekend" ? [5, 6] : [0, 1, 2, 3, 4, 5, 6]).filter((c) => c !== this._day);
    if (!e.length) return;
    const s = T(this._lang).days.map((c) => this._lang.startsWith("fr") ? c.toLowerCase() : c), i = e.length === 6 ? this._tr("ss_copy_confirm_all", { n: String(e.length) }) : this._tr("ss_copy_confirm", { days: e.map((c) => s[c]).join(", ") });
    if (!await mt(this, i, this._tr("ss_copy_do"))) return;
    const n = this._slots, o = this._profile.id, r = () => n.map((c) => ({ ...structuredClone(c), id: wt() })), a = this._p;
    this._p = {
      ...a,
      profiles: a.profiles.map((c) => c.id === o ? { ...c, days: c.days.map((d, u) => e.includes(u) ? r() : d) } : c)
    }, this._error = "";
  }
  /* ---- save ---- */
  _validate() {
    const t = this._profile, e = T(this._lang).days;
    for (let s = 0; s < 7; s++) {
      const i = t.days[s] ?? [];
      for (const n of i) {
        if (!Object.keys(n.actions.by_type).length && !Object.keys(n.actions.by_entity).length)
          return this._modes.length ? this._tr("ss_err_no_mode", { day: e[s] }) : this._tr("ss_err_none_modes");
        if (n.end && JSON.stringify(n.start) === JSON.stringify(n.end)) return this._tr("ss_err_same", { day: e[s] });
      }
      if (ke(i)) return this._tr("ss_err_overlap", { day: e[s] });
    }
    return "";
  }
  async _save() {
    var e;
    const t = this._validate();
    if (t) {
      this._error = t;
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(this._p) }), this._saved = !0, this._closeTimer = window.setTimeout(() => this._closeDialog(), 1500);
    } catch (s) {
      const i = s;
      this._conflict = (i == null ? void 0 : i.code) === "conflict", this._conflict ? this._error = this._tr("ss_conflict") : (i == null ? void 0 : i.code) === "unauthorized" ? this._error = this._tr("err_unauthorized") : (e = i == null ? void 0 : i.message) != null && e.includes("overlapping_slots") ? this._error = this._tr("err_overlap_server") : this._error = this._tr("ss_err_save");
    } finally {
      this._saving = !1;
    }
  }
  _closeDialog() {
    var t;
    (t = this.renderRoot.querySelector("wp-dialog")) == null || t.close();
  }
  _reload() {
    this._p = structuredClone(this.program), this._conflict = !1, this._error = "";
  }
  /* ---- render ---- */
  _offsetWord(t) {
    const e = Math.abs(t), s = e < 60 ? `${e} min` : e % 60 ? `${Math.floor(e / 60)} h ${String(e % 60).padStart(2, "0")}` : `${e / 60} h`;
    return this._tr(t > 0 ? "ss_off_after" : "ss_off_before", { d: s });
  }
  /** "À 4 h" / "Au coucher du soleil" / "30 min après le coucher du soleil" / "De 8 h" / "à 22 h". */
  _whenText(t, e) {
    if ("time" in t) {
      const n = K(t.time);
      return `${this._tr(`ss_${e}`)} ${n >= x ? this._tr("ss_midnight_word") : Qe(this._lang, n)}`;
    }
    const s = t.offset ?? 0;
    if (!s) return this._tr(`ss_${e}_${t.sun}`);
    const i = `${this._offsetWord(s)} ${this._tr(`ss_the_${t.sun}`)}`;
    return e === "at" ? i : `${this._tr(`ss_${e}`)} ${i}`;
  }
  /** "8 h 45 à 17 h" is built as "De 8 h 45 à 17 h"; a single time as "À 4 h". */
  _sentenceTime(t) {
    return t.end ? `${this._whenText(t.start, "from")} ${this._whenText(t.end, "to")}` : this._whenText(t.start, "at");
  }
  /** Entity the period's mode is read on (first entity of the main type). */
  get _firstEntity() {
    const t = ot(this._p), e = this._p.entities.map((s) => s.entity_id);
    return e.find((s) => s.split(".")[0] === t) ?? e[0] ?? "";
  }
  /** Action of a mode as the user reads it: a verb ("fermer le volet") or a setting ("Confort (19 °C)"). */
  _action(t) {
    const e = this._firstEntity, s = e ? pt(t, e) : t.value, i = String(s.position ?? "");
    switch (s.kind) {
      case "open":
        return { text: this._tr("ss_act_open"), verb: !0 };
      case "close":
        return { text: this._tr("ss_act_close"), verb: !0 };
      case "off":
        return { text: this._tr("ss_act_off"), verb: !0 };
      case "on":
        return typeof s.brightness == "number" ? { text: this._tr("ss_act_on_pct", { n: String(s.brightness) }), verb: !0 } : { text: this._tr("ss_act_on"), verb: !0 };
      case "position":
        return /favori|favorite/i.test(`${t.id} ${t.name}`) ? { text: this._tr("ss_act_fav", { n: i }), verb: !0 } : { text: this._tr("ss_act_pos", { n: i }), verb: !0 };
      default: {
        const n = e ? Fs(this.hass, this._lang, t, e) : "";
        return { text: n ? `${t.name} (${n})` : t.name, verb: !1 };
      }
    }
  }
  /** The whole sentence of a slot: when, then what happens. */
  _title(t) {
    const e = this._sentenceTime(t), s = this._mode(t);
    let i = "", n = !1;
    if (s) {
      const o = this._modes.find((r) => r.id === s);
      o && ({ text: i, verb: n } = this._action(o));
    } else if (Object.keys(t.actions.by_entity).length) {
      const [o, r] = Object.entries(t.actions.by_entity)[0];
      i = xe(this._lang, this.data.modes, o, r);
    }
    return i ? n ? `${e}, ${i.charAt(0).toLowerCase()}${i.slice(1)}` : `${e}${this._tr("ss_colon")}${i}` : e;
  }
  /* ---- time block ("Quand" / "Début" / "Fin") ---- */
  _setKind(t, e, s) {
    const i = t[e];
    if (i)
      if (s === "time") {
        if ("time" in i) return;
        this._setTime(t, e, Math.round(Ct(this.hass, i) / 5) * 5);
      } else {
        const n = s, o = "time" in i ? { sun: n, offset: 0 } : { ...i, sun: n };
        this._patchSlot(t.id, { [e]: o });
      }
  }
  _setOffset(t, e, s) {
    const i = t[e];
    if (!i || "time" in i) return;
    const n = Number(s.target.value);
    this._patchSlot(t.id, { [e]: { ...i, offset: n } });
  }
  _whenBlock(t, e, s) {
    const i = t[e];
    if (!i) return h;
    const n = "time" in i ? "time" : i.sun, o = ["time", "sunrise", "sunset", ...n === "dawn" || n === "dusk" ? [n] : []], r = this._canEdit;
    let a;
    if ("time" in i) {
      const c = A(i) ?? 0;
      a = l`
        <input type="time" step="300" .value=${c >= x ? "00:00" : i.time} aria-label=${s} ?disabled=${!r}
          @change=${(d) => this._fromInput(t, e, d)} />
        <div class="steps">
          <button class="btn step" ?disabled=${!r} aria-label=${this._tr("ss_earlier_aria", { when: s })}
            @click=${() => this._shift(t, e, -ge)}><ha-icon icon="mdi:minus"></ha-icon><span>${this._tr("ss_earlier")}</span></button>
          <button class="btn step" ?disabled=${!r} aria-label=${this._tr("ss_later_aria", { when: s })}
            @click=${() => this._shift(t, e, ge)}><ha-icon icon="mdi:plus"></ha-icon><span>${this._tr("ss_later")}</span></button>
        </div>`;
    } else {
      const c = i.offset ?? 0, d = [0, 15, 30, 60, -15, -30, -60];
      d.includes(c) || d.unshift(c), a = l`<select aria-label=${s} ?disabled=${!r} @change=${(u) => this._setOffset(t, e, u)}>
        ${d.map((u) => l`<option value=${u} ?selected=${u === c}>${u === 0 ? this._tr("ss_off_zero") : this._offsetWord(u)}</option>`)}
      </select>`;
    }
    return l`
      <div class="blk" role="group" aria-label=${s}>
        <div class="blk-t">${s}</div>
        <div class="seg" role="radiogroup" aria-label=${s}>
          ${o.map((c) => l`<button class="segb ${c === n ? "on" : ""}" role="radio" aria-checked=${c === n}
            ?disabled=${!r} @click=${() => this._setKind(t, e, c)}>${this._tr(`ss_kind_${c}`)}</button>`)}
        </div>
        ${a}
      </div>`;
  }
  /* ---- action block ---- */
  _actionBlock(t) {
    const e = this._mode(t), s = !e && Object.keys(t.actions.by_entity).length > 0, i = this._modes;
    if (s) {
      const [o, r] = Object.entries(t.actions.by_entity)[0], a = Object.keys(t.actions.by_entity).length - 1, c = `${xe(this._lang, this.data.modes, o, r)}${a > 0 ? ` +${a}` : ""}`;
      return l`<div class="blk"><div class="blk-t">${this._tr("ss_action")}</div><strong class="custom">${c}</strong></div>`;
    }
    const n = this._canEdit;
    return l`
      <div class="blk" role="radiogroup" aria-label=${this._tr("ss_action")}>
        <div class="blk-t">${this._tr("ss_action")}</div>
        ${i.map((o) => l`
          <label class="opt ${o.id === e ? "on" : ""}">
            <input type="radio" name=${`act-${t.id}`} .checked=${o.id === e} ?disabled=${!n}
              @change=${() => this._setMode(t, o.id)} />
            <span>${this._action(o).text}</span>
          </label>`)}
      </div>`;
  }
  _renderSlot(t) {
    const e = A(t.start), s = A(t.end ?? null), i = e !== null && s !== null && s <= e && s < x;
    return l`
      <div class="slot card">
        <div class="sentence">${this._title(t)}</div>
        ${t.end ? l`${this._whenBlock(t, "start", this._tr("ss_start_lbl"))}${this._whenBlock(t, "end", this._tr("ss_end_lbl"))}` : this._whenBlock(t, "start", this._tr("ss_when"))}
        ${i ? l`<p class="hint"><ha-icon icon="mdi:weather-night"></ha-icon> ${this._tr("ss_next_day")}</p>` : h}
        ${this._actionBlock(t)}
        <div class="actions">
          <button class="textbtn" ?disabled=${!this._canEdit} @click=${() => void this._remove(t)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon> ${this._tr("ss_remove")}</button>
        </div>
      </div>`;
  }
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  render() {
    if (!this._p) return h;
    const t = T(this._lang), e = se(/* @__PURE__ */ new Date(), this.hass.config.time_zone), s = this._slots, i = this._canEdit;
    return l`
      <wp-dialog open wide heading=${this._tr("ss_title")}>
        ${i ? h : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="days" role="group" aria-label=${this._tr("ss_day_pick")}>
          ${t.days_short.map((n, o) => l`
            <button class="day ${o === this._day ? "on" : ""} ${o === e ? "today" : ""}" aria-pressed=${o === this._day}
              aria-label=${t.days[o] + (o === e ? ` (${t.today})` : "")} @click=${() => this._go(o)}>${n}</button>`)}
        </div>
        <div class="body" @pointerdown=${(n) => this._swipe.down(n)}
          @pointerup=${(n) => {
      const o = this._swipe.up(n);
      o && this._go(this._day + o);
    }}
          @pointercancel=${() => this._swipe.cancel()}>
          <h3>${t.days[this._day]}${this._day === e ? l` <span class="badge">${t.today}</span>` : h}</h3>
          ${this._p.profiles.length > 1 ? l`<p class="muted small">${this._tr("ss_season", { name: this._profile.name })}</p>` : h}
          ${s.length === 0 ? l`<p class="muted">${this._tr("ss_empty")}</p>` : h}
          ${s.map((n) => this._renderSlot(n))}
          ${this._adding ? l`<div class="card addbox" role="group" aria-label=${this._tr("ss_add")}>
                <div class="blk-t">${this._tr("ss_add_title")}</div>
                <button class="btn big" @click=${() => this._add(!1)}><ha-icon icon="mdi:clock-outline"></ha-icon> ${this._tr("ss_add_point")}</button>
                <button class="btn big" @click=${() => this._add(!0)}><ha-icon icon="mdi:timer-sand"></ha-icon> ${this._tr("ss_add_range")}</button>
                <button class="textbtn plain" @click=${() => {
      this._adding = !1;
    }}>${t.cancel}</button>
              </div>` : l`<button class="btn" ?disabled=${!i} @click=${() => {
      this._adding = !0;
    }}>
                <ha-icon icon="mdi:plus"></ha-icon> ${this._tr("ss_add")}</button>`}
          <h4>${this._tr("ss_copy_title")}</h4>
          <div class="row">
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("weekdays")}>${this._tr("ss_copy_weekdays")}</button>
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("weekend")}>${this._tr("ss_copy_weekend")}</button>
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("all")}>${this._tr("ss_copy_all")}</button>
          </div>
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}
          ${this._conflict ? l`<button class="btn" @click=${() => this._reload()}>${this._tr("ss_reload")}</button>` : h}</p>` : h}
        ${this._saved ? l`<p class="saved" role="status"><ha-icon icon="mdi:check-circle"></ha-icon> ${this._tr("ss_saved")}</p>` : h}
        <button slot="footer" class="btn primary save" ?disabled=${!i || this._saving || this._saved} @click=${() => void this._save()}>${t.save}</button>
        <button slot="footer" class="textbtn plain cancel" @click=${() => this._closeDialog()}>${t.cancel}</button>
      </wp-dialog>`;
  }
};
V.styles = [
  lt,
  U`
      :host { display: contents; }
      .days { display: grid; grid-template-columns: repeat(7, minmax(48px, 1fr)); gap: 6px; margin-bottom: 8px; }
      .day {
        min-width: 48px; min-height: 48px; padding: 0; border-radius: 12px; border: 1px solid var(--secondary-text-color);
        background: none; color: var(--primary-text-color); cursor: pointer; font-size: 14px;
      }
      .day.today { font-weight: 700; text-decoration: underline; }
      .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      @media (max-width: 480px) { .days { grid-template-columns: repeat(4, 1fr); } }
      .body { touch-action: pan-y; min-height: 40vh; }
      h3 { margin: 8px 0 0; font-size: 20px; font-weight: 600; }
      h4 { margin: 20px 0 8px; font-size: 15px; font-weight: 500; }
      .small { font-size: 14px; margin: 2px 0 8px; }
      .badge {
        background: var(--primary-color); color: var(--text-primary-color, #fff); border-radius: 12px;
        padding: 2px 10px; font-size: 13px; font-weight: 600; vertical-align: middle;
      }
      .slot { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
      .sentence { font-size: 18px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
      .blk { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--divider-color); min-width: 0; }
      .blk-t { font-size: 15px; font-weight: 600; }
      .seg { display: flex; flex-wrap: wrap; gap: 8px; }
      .segb {
        flex: 1 1 96px; min-height: 52px; padding: 6px 8px; border-radius: 12px; font-size: 15px; line-height: 1.2;
        border: 2px solid var(--secondary-text-color); background: none; color: var(--primary-text-color); cursor: pointer;
      }
      .segb.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
      .segb:disabled { opacity: 0.45; cursor: default; }
      .blk input[type="time"] { width: 100%; max-width: 180px; min-height: 52px; font-size: 22px; font-weight: 600; text-align: center; }
      .blk select { font-size: 16px; min-height: 52px; }
      .steps { display: flex; flex-wrap: wrap; gap: 8px; }
      .btn.step { flex: 1 1 100%; min-width: 0; min-height: 52px; padding: 0 12px; font-size: 16px; gap: 6px; border-color: var(--secondary-text-color); }
      @media (min-width: 600px) { .btn.step { flex: 1 1 160px; } }
      .opt {
        display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 14px; border-radius: 12px; cursor: pointer;
        border: 2px solid var(--secondary-text-color); font-size: 16px; line-height: 1.25;
      }
      .opt input { flex: none; }
      .opt.on { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 18%, transparent); font-weight: 600; }
      .custom { font-size: 18px; }
      .btn { border-color: var(--secondary-text-color); }
      .btn.primary { border-color: var(--primary-color); }
      .btn.big { min-height: 56px; font-size: 16px; width: 100%; }
      .addbox { display: flex; flex-direction: column; gap: 8px; }
      .muted, .hint { color: var(--primary-text-color); opacity: 0.8; }
      .actions { display: flex; justify-content: flex-start; padding-top: 4px; }
      .textbtn {
        display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 8px; border: none; background: none;
        cursor: pointer; font-size: 15px; color: var(--error-color, #db4437); text-decoration: underline; --mdc-icon-size: 20px;
      }
      .textbtn.plain { color: var(--primary-text-color); justify-content: center; }
      .textbtn:disabled { opacity: 0.45; cursor: default; }
      .saved { display: flex; align-items: center; gap: 8px; font-size: 16px; color: var(--success-color, #43a047); --mdc-icon-size: 22px; }
      .btn.save { flex: 1 1 100%; min-height: 56px; font-size: 17px; }
      .cancel { flex: 1 1 100%; }
    `
];
nt([
  f({ attribute: !1 })
], V.prototype, "hass", 2);
nt([
  f({ attribute: !1 })
], V.prototype, "data", 2);
nt([
  f({ attribute: !1 })
], V.prototype, "program", 2);
nt([
  m()
], V.prototype, "_p", 2);
nt([
  m()
], V.prototype, "_day", 2);
nt([
  m()
], V.prototype, "_error", 2);
nt([
  m()
], V.prototype, "_conflict", 2);
nt([
  m()
], V.prototype, "_saving", 2);
nt([
  m()
], V.prototype, "_saved", 2);
nt([
  m()
], V.prototype, "_adding", 2);
V = nt([
  N("wp-simple-schedule")
], V);
var pn = Object.defineProperty, _n = Object.getOwnPropertyDescriptor, yt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? _n(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && pn(e, s, n), n;
};
const un = ["scene", "script", "action"], mn = ["switch", "input_boolean", "fan"], fn = 400, gn = 800;
let et = class extends P {
  constructor() {
    super(...arguments), this._expanded = !1, this._pending = {}, this._message = "", this._error = "", this._durationOpen = !1, this._sendTimers = /* @__PURE__ */ new Map(), this._clear = /* @__PURE__ */ new Map(), this._stopHold = () => {
      window.clearInterval(this._repeat), this._repeat = void 0;
    };
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._stopHold(), this._sendTimers.forEach((t) => window.clearTimeout(t)), this._clear.forEach((t) => window.clearTimeout(t)), window.clearTimeout(this._msgTimer);
  }
  willUpdate(t) {
    var e;
    if (t.has("hass") && Object.keys(this._pending).length) {
      const s = { ...this._pending };
      for (const [i, n] of Object.entries(this._pending)) {
        const o = ((e = this.hass.states[i]) == null ? void 0 : e.attributes) ?? {};
        (k(i) === "light" ? this._brightnessPct(i, !1) : o.temperature) === n && !this._sendTimers.has(i) && delete s[i];
      }
      Object.keys(s).length !== Object.keys(this._pending).length && (this._pending = s);
    }
  }
  get _lang() {
    return st(this.hass);
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  get _status() {
    return this.data.status[this.program.id];
  }
  get _next() {
    var e;
    const t = (e = this._status) == null ? void 0 : e.next_change;
    return t ? Zt(t, this._tz, this._lang, /* @__PURE__ */ new Date()) : null;
  }
  /** Entities of the program's main type (the first is shown, the others fold under "and N more"). */
  get _main() {
    const t = W(ot(this.program)), e = this.program.entities.map((i) => i.entity_id), s = e.filter((i) => W(k(i)) === t);
    return s.length ? s : e.slice(0, 1);
  }
  /* ------------------------------------------------------------------ commands */
  async _send(t, e, s = {}) {
    try {
      this._error = "", await this.hass.callService("weekly_planner", "override", { entity_id: t, setpoint: e, ...s }), this._say(this._tr("sm_done", { what: xe(this._lang, this.data.modes, t[0], e) }));
    } catch (i) {
      this._error = C(this._lang, "error", { message: (i == null ? void 0 : i.message) ?? String(i) });
    }
  }
  _say(t) {
    this._message = t, window.clearTimeout(this._msgTimer), this._msgTimer = window.setTimeout(() => this._message = "", 4e3);
  }
  /** Several quick presses become one command, 800 ms after the last one. */
  _queue(t, e) {
    window.clearTimeout(this._sendTimers.get(t)), this._sendTimers.set(t, window.setTimeout(() => {
      this._sendTimers.delete(t), this._send([t], e), this._clear.set(t, window.setTimeout(() => {
        const s = { ...this._pending };
        delete s[t], this._pending = s;
      }, 6e3));
    }, gn));
  }
  _step(t, e) {
    var a, c;
    const s = ((a = this.hass.states[t]) == null ? void 0 : a.attributes) ?? {}, i = this._pending[t] ?? Number(s.temperature ?? s.current_temperature ?? 20), n = Number(s.min_temp ?? 7), o = Number(s.max_temp ?? 35), r = Pi(i, e, n, o);
    r !== i && (window.clearTimeout(this._clear.get(t)), this._pending = { ...this._pending, [t]: r }, (c = navigator.vibrate) == null || c.call(navigator, 10), this._queue(t, { kind: "temperature", temperature: r }));
  }
  _brightnessPct(t, e = !0) {
    if (e && this._pending[t] !== void 0) return this._pending[t];
    const s = this.hass.states[t];
    if ((s == null ? void 0 : s.state) !== "on") return 0;
    const i = s.attributes.brightness;
    return typeof i == "number" ? Math.round(i / 255 * 100) : 100;
  }
  _dim(t, e) {
    var n;
    const s = this._brightnessPct(t), i = Math.min(100, Math.max(10, s + e * 10));
    i === s && s !== 0 || (window.clearTimeout(this._clear.get(t)), this._pending = { ...this._pending, [t]: i }, (n = navigator.vibrate) == null || n.call(navigator, 10), this._queue(t, { kind: "on", brightness: i }));
  }
  _startHold(t, e) {
    t.preventDefault(), this._stopHold(), e(), this._repeat = window.setInterval(e, fn);
  }
  _holdButton(t, e, s) {
    return l`<button class="big" aria-label=${e}
      @pointerdown=${(i) => this._startHold(i, s)}
      @pointerup=${this._stopHold} @pointercancel=${this._stopHold} @pointerleave=${this._stopHold}
      @contextmenu=${(i) => i.preventDefault()}
      @keydown=${(i) => {
      (i.key === "Enter" || i.key === " ") && (i.preventDefault(), s());
    }}>
      <ha-icon icon=${t}></ha-icon><span>${e}</span></button>`;
  }
  _simple(t, e, s, i) {
    return l`<button class="big" @click=${() => this._send([t], i)}><ha-icon icon=${e}></ha-icon><span>${s}</span></button>`;
  }
  async _resume() {
    try {
      await this.hass.callService("weekly_planner", "resume", { program_id: this.program.id });
    } catch (t) {
      this._error = C(this._lang, "error", { message: (t == null ? void 0 : t.message) ?? String(t) });
    }
  }
  async _applyDuration(t) {
    var e;
    this._durationOpen = !1;
    for (const s of this.program.entities) {
      const i = (e = this.data.entities[s.entity_id]) == null ? void 0 : e.override;
      (i == null ? void 0 : i.origin) === "voluntary" && i.setpoint && await this._send([s.entity_id], i.setpoint, t);
    }
  }
  /** The duration choices with their end (server time zone); the default one is the next schedule change. */
  _choices() {
    var y;
    const t = /* @__PURE__ */ new Date(), e = this._lang, s = _t(t, this._tz), i = t.getTime() - t.getSeconds() * 1e3 - t.getMilliseconds(), n = (v) => new Date(i + v * 6e4).toISOString(), o = (v) => ({ label: this._tr(v === 1 ? "sm_1h" : "sm_2h"), timing: { duration: { hours: v } }, end: new Date(t.getTime() + v * 36e5).toISOString() }), r = [o(1), o(2)];
    if (s < 1320) {
      const v = n(1320 - s);
      r.push({ label: this._tr("sm_tonight", { time: Qe(e, 1320) }), timing: { until: v }, end: v });
    }
    const a = n(1440 - s);
    r.push({ label: this._tr("sm_all_day"), timing: { until: a }, end: a });
    const c = (y = this._status) == null ? void 0 : y.next_change;
    c && r.push({ label: this._tr("sm_next_slot", { time: Zt(c, this._tz, e, t) }), timing: {}, end: c });
    const d = this.program.entities.map((v) => {
      var b;
      return (b = this.data.entities[v.entity_id]) == null ? void 0 : b.override;
    }).find((v) => (v == null ? void 0 : v.origin) === "voluntary"), u = d != null && d.until ? new Date(d.until).getTime() : null;
    let _ = -1;
    return u !== null && (_ = r.findIndex((v) => Math.abs(new Date(v.end).getTime() - u) < 9e4)), r.map((v, b) => ({ ...v, current: b === _ }));
  }
  /* ------------------------------------------------------------------ rendering */
  _sentence(t) {
    var r;
    const e = this.hass.states[t];
    if (!e || e.state === "unavailable" || e.state === "unknown") return this._tr("sm_unavailable");
    const s = e.attributes, i = this._lang, n = this._next, o = n ? ` · ${this._tr("sm_planned", { time: n })}` : "";
    switch (k(t)) {
      case "climate": {
        const a = typeof s.current_temperature == "number" ? we(i, s.current_temperature) : "—";
        if (e.state === "off") return this._tr("sm_climate_off", { current: a });
        const c = this._pending[t] ?? s.temperature, d = typeof c == "number" ? we(i, c) : "—", u = (r = this.data.entities[t]) == null ? void 0 : r.override, _ = (u == null ? void 0 : u.origin) === "voluntary" && u.until ? Zt(u.until, this._tz, i, /* @__PURE__ */ new Date()) : n, y = _ ? this._tr("sm_until_part", { time: _ }) : "", v = s.hvac_action === "heating" ? ` · ${this._tr("sm_heating")}` : "";
        return this._tr("sm_climate", { current: a, target: d, until: y }) + v;
      }
      case "cover": {
        let a;
        return e.state === "closed" ? a = this._tr("sm_cover_closed") : e.state === "opening" || e.state === "closing" ? a = this._tr("sm_cover_moving") : typeof s.current_position == "number" && s.current_position < 100 ? a = this._tr("sm_cover_open_at", { pos: Us(i, s.current_position) }) : a = this._tr("sm_cover_open"), a + o;
      }
      case "light": {
        const a = this._brightnessPct(t);
        return e.state !== "on" && this._pending[t] === void 0 ? this._tr("sm_is_off") + o : (a > 0 && a < 100 ? this._tr("sm_is_on_at", { pct: String(a) }) : this._tr("sm_is_on")) + o;
      }
      default:
        return (e.state === "off" ? this._tr("sm_is_off") : this._tr("sm_is_on")) + o;
    }
  }
  _activeModeId(t) {
    var r, a, c;
    const e = (r = this.data.entities[t]) == null ? void 0 : r.override;
    if (e) {
      const d = JSON.stringify(e.setpoint ?? null);
      return (a = this.data.modes.find((u) => JSON.stringify(pt(u, t)) === d)) == null ? void 0 : a.id;
    }
    const s = this.hass.states[t];
    if (s) {
      const d = s.attributes.requested_state, u = (d == null ? void 0 : d.preset) ?? s.attributes.preset_mode, _ = Number((d == null ? void 0 : d.target_temperature) ?? s.attributes.temperature), y = this.data.modes.find((v) => {
        const b = pt(v, t);
        return v.type !== W(k(t)) ? !1 : b.kind === "preset" ? b.preset === u : b.kind === "temperature" ? (!u || u === "none") && Number(b.temperature) === _ : !1;
      });
      if (y) return y.id;
    }
    const i = this._status, n = i ? Object.values(i.current_slots)[0] : void 0, o = n ? St(this.program, this.data).days.flat().find((d) => d.id === n) : void 0;
    return o ? (c = ae(o, this.program, this.data.modes)) == null ? void 0 : c.id : void 0;
  }
  _modes(t) {
    const e = W(k(t)), s = this.data.modes.filter((n) => {
      if (n.type !== e) return !1;
      const o = pt(n, t);
      return !((k(t) === "cover" ? ["open", "close"] : ["on", "off"]).includes(o.kind) && !("brightness" in o) && !("percentage" in o)) && !un.includes(o.kind) && Ei(this.hass, t, o);
    });
    if (!s.length) return h;
    const i = this._activeModeId(t);
    return l`<div class="modes" role="group" aria-label=${this._tr("sm_mode")}>
      ${s.map((n) => {
      const o = n.id === i, r = Fs(this.hass, this._lang, n, t);
      return l`<button class="seg ${o ? "on" : ""}" aria-pressed=${o} @click=${() => void this._chooseMode(t, n)}>
          ${o ? l`<ha-icon icon="mdi:check"></ha-icon>` : h}<span>${r ? `${n.name} · ${r}` : n.name}</span></button>`;
    })}
    </div>`;
  }
  async _chooseMode(t, e) {
    zi(this.hass, e, t) && !await mt(this, this._tr("sm_frost_confirm"), this._tr("sm_frost_do")) || this._send([t], pt(e, t));
  }
  _controls(t) {
    const e = k(t);
    return e === "climate" ? l`<div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_cooler"), () => this._step(t, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_warmer"), () => this._step(t, 1))}</div>` : e === "cover" ? l`<div class="pair">
        ${this._simple(t, "mdi:window-shutter-open", this._tr("sm_open"), { kind: "open" })}
        ${this._simple(t, "mdi:window-shutter", this._tr("sm_close"), { kind: "close" })}</div>` : e === "light" ? l`<div class="pair">
        ${this._simple(t, "mdi:lightbulb-on", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(t, "mdi:lightbulb-off", this._tr("sm_off"), { kind: "off" })}</div>
        <div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_dimmer"), () => this._dim(t, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_brighter"), () => this._dim(t, 1))}</div>` : mn.includes(e) ? l`<div class="pair">
        ${this._simple(t, "mdi:power-plug", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(t, "mdi:power-plug-off", this._tr("sm_off"), { kind: "off" })}</div>` : h;
  }
  _block(t, e) {
    return l`<div class="device">
      ${e ? l`<div class="dname">${oe(this.hass, t)}</div>` : h}
      <p class="sentence">${this._sentence(t)}</p>
      ${this._controls(t)}${this._modes(t)}
    </div>`;
  }
  _overrideLine() {
    const t = this.program.entities.map((i) => {
      var n;
      return (n = this.data.entities[i.entity_id]) == null ? void 0 : n.override;
    }).filter((i) => !!i);
    if (!t.length) return h;
    const e = t.some((i) => i.origin === "voluntary"), s = this._tr(ot(this.program) === "climate" ? "sm_resume_hint_temp" : "sm_resume_hint");
    return l`<div class="actions">
      ${e ? l`<button class="outline" @click=${() => this._durationOpen = !0}>
        <ha-icon icon="mdi:clock-edit-outline"></ha-icon> ${this._tr("sm_change_duration")}</button>` : h}
      <div class="with-hint">
        <button class="outline" @click=${() => this._resume()}><ha-icon icon="mdi:undo-variant"></ha-icon> ${this._tr("sm_resume")}</button>
        <span class="hint">${s}</span>
      </div>
    </div>`;
  }
  render() {
    if (!this.hass || !this.data || !this.program) return h;
    const t = this._main;
    if (!t.length) return h;
    const [e, ...s] = t, i = this._lang;
    return l`
      ${this.program.enabled ? l`
        ${this._block(e, !1)}
        ${s.length ? l`<button class="outline more" aria-expanded=${this._expanded}
              @click=${() => this._expanded = !this._expanded}>
              <ha-icon icon=${this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              ${this._expanded ? this._tr("sm_hide_others") : s.length === 1 ? this._tr("sm_others_one") : this._tr("sm_others", { n: String(s.length) })}</button>
            ${this._expanded ? s.map((n) => this._block(n, !0)) : h}` : h}
        <div class="live" aria-live="polite">${this._message ? l`<div class="done"><ha-icon icon="mdi:check-circle"></ha-icon> ${this._message}</div>` : h}</div>
        ${this._error ? l`<div class="err">${this._error}</div>` : h}
        ${this._overrideLine()}` : l`<p class="sentence muted">${this._tr("sm_disabled")}</p>`}
      ${this.data.can_edit ? l`<button class="outline sched" @click=${() => this.dispatchEvent(new CustomEvent("simple-schedule", { detail: { program: this.program }, bubbles: !0, composed: !0 }))}>
            <ha-icon icon="mdi:calendar-clock"></ha-icon> ${T(i).sm_change_schedule}</button>` : h}
      ${this._durationOpen ? l`<wp-dialog open heading=${this._tr("sm_duration_title")}
            @closed=${(n) => {
      n.stopPropagation(), this._durationOpen = !1;
    }}>
            <div class="choices">${this._choices().map((n) => l`<button class="seg wide ${n.current ? "on" : ""}"
              aria-pressed=${n.current} @click=${() => this._applyDuration(n.timing)}>
              ${n.current ? l`<ha-icon icon="mdi:check"></ha-icon>` : h}<span>${n.label}</span>
              ${n.current ? l`<span class="sr">(${this._tr("sm_current")})</span>` : h}</button>`)}</div>
            <button slot="footer" class="outline close" @click=${(n) => {
      var o;
      return (o = n.currentTarget.closest("wp-dialog")) == null ? void 0 : o.close();
    }}>${T(i).close}</button>
          </wp-dialog>` : h}
    `;
  }
};
et.styles = U`
    :host { display: block; color: var(--primary-text-color); }
    * { box-sizing: border-box; }
    .device + .device { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .dname { font-size: 14px; font-weight: 500; opacity: 0.8; }
    .sentence { font-size: 16px; line-height: 1.4; margin: 4px 0 12px; }
    .muted { opacity: 0.8; }
    .pair { display: flex; gap: 8px; margin-bottom: 8px; }
    button { font: inherit; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    button.big {
      flex: 1 1 0; min-width: 0; min-height: 64px; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 2px; padding: 6px 8px; border-radius: 16px; font-size: 16px; font-weight: 500;
      border: none; cursor: pointer; background: var(--primary-color); color: var(--text-primary-color, #fff);
      --mdc-icon-size: 24px; user-select: none; -webkit-user-select: none;
    }
    button.big:active { filter: brightness(0.9); }
    .modes, .choices { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 8px; }
    button.seg {
      flex: 1 1 96px; min-height: 48px; padding: 4px 12px; border-radius: 24px; font-size: 14px; font-weight: 500;
      border: 1px solid var(--secondary-text-color); background: none; color: var(--primary-text-color); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; --mdc-icon-size: 20px;
    }
    button.seg.on { background: var(--primary-color); border: 2px solid var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 700; }
    button.seg.wide { flex: 1 1 100%; min-height: 56px; font-size: 16px; }
    button.outline {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 4px 16px;
      border: 1px solid var(--primary-color); border-radius: 24px; background: none; color: var(--primary-color);
      font-size: 15px; font-weight: 500; cursor: pointer; --mdc-icon-size: 22px;
    }
    button.outline.more, button.outline.sched { width: 100%; margin-top: 12px; }
    .actions { display: flex; flex-direction: column; align-items: stretch; gap: 12px; margin-top: 12px; }
    .with-hint { display: flex; flex-direction: column; gap: 4px; }
    .hint { font-size: 14px; opacity: 0.8; text-align: center; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .live { min-height: 0; }
    .done {
      display: flex; align-items: center; gap: 8px; font-size: 16px; padding: 10px 12px; margin: 4px 0;
      border-radius: 12px; background: var(--secondary-background-color); --mdc-icon-size: 22px; color: var(--success-color, #43a047);
    }
    .err { color: var(--error-color, #db4437); font-size: 14px; margin: 4px 0; }
  `;
yt([
  f({ attribute: !1 })
], et.prototype, "hass", 2);
yt([
  f({ attribute: !1 })
], et.prototype, "data", 2);
yt([
  f({ attribute: !1 })
], et.prototype, "program", 2);
yt([
  m()
], et.prototype, "_expanded", 2);
yt([
  m()
], et.prototype, "_pending", 2);
yt([
  m()
], et.prototype, "_message", 2);
yt([
  m()
], et.prototype, "_error", 2);
yt([
  m()
], et.prototype, "_durationOpen", 2);
et = yt([
  N("wp-simple-controls")
], et);
var yn = Object.defineProperty, vn = Object.getOwnPropertyDescriptor, dt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vn(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && yn(e, s, n), n;
};
let Y = class extends P {
  constructor() {
    super(...arguments), this._dialog = null, this._showWeek = !1, this._advanced = !1, this._preview = {}, this._now = /* @__PURE__ */ new Date();
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }
  setConfig(t) {
    this._config = { show_week: !1, show_chart: !0, ...t }, this._showWeek = !!this._config.show_week;
  }
  getCardSize() {
    var t;
    return 3 + (((t = this._data) == null ? void 0 : t.programs.length) ?? 1) * 2;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this._clock = window.setInterval(() => this._now = /* @__PURE__ */ new Date(), 6e4);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._unsub) == null || t.call(this), this._unsub = void 0, window.clearInterval(this._clock);
  }
  updated(t) {
    t.has("hass") && this.hass && !this._unsub && (this._unsub = Mi(this.hass, (e) => {
      this._data = e, this._error = void 0, this._loadPreviews();
    }));
  }
  get _lang() {
    var t, e, s;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((s = this.hass) == null ? void 0 : s.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /** Resolved slots (sun times, ignored slots) for the next occurrence of each weekday. */
  async _loadPreviews() {
    if (!this._data) return;
    const t = {}, e = /* @__PURE__ */ new Date(), s = [];
    for (const i of vs(this._data, this._config))
      for (let n = 0; n < 7; n++) {
        const o = new Date(e.getTime() + n * 864e5), r = kt(o, this._tz), a = se(o, this._tz);
        s.push(
          this.hass.callWS({ type: "weekly_planner/preview", program_id: i.id, date: r }).then((c) => {
            t[`${i.id}|${a}`] = c.slots;
          }).catch(() => {
          })
        );
      }
    await Promise.all(s), this._preview = t;
  }
  /** Spans of a program for a weekday (0 = Monday); today uses resolved sun times. */
  _spans(t, e, s) {
    const i = this._data, n = St(t, i), o = (c) => Ut(c, t, i.modes, this._lang), r = [];
    for (const { slot: c, end: d } of Ae(n.days[(e + 6) % 7]))
      r.push({ start: 0, end: d, color: ut(c, t, i.modes), label: o(c) });
    const a = this._preview[`${t.id}|${e}`];
    for (const c of n.days[e]) {
      const d = a == null ? void 0 : a.find((v) => v.slot_id === c.id);
      let u = A(c.start), _ = A(c.end ?? null);
      if (d && (u = _t(d.start, this._tz), _ = d.end ? _t(d.end, this._tz) : null), u === null) continue;
      const y = _ === null ? u + 10 : _ > u ? _ : x;
      r.push({
        start: u,
        end: y,
        color: ut(c, t, i.modes),
        label: o(c),
        sun: "sun" in c.start || !!(c.end && "sun" in c.end),
        ignored: (d == null ? void 0 : d.ignored) ?? null
      });
    }
    return r;
  }
  _summary(t) {
    const e = this._data, s = e.status[t.id], i = St(t, e), n = s ? Object.values(s.current_slots)[0] : void 0, o = n ? i.days.flat().find((c) => c.id === n) : void 0, r = o ? ae(o, t, e.modes) : void 0, a = t.entities.filter((c) => {
      var d;
      return (d = e.entities[c.entity_id]) == null ? void 0 : d.override;
    });
    return { status: s, slot: o, mode: r, overridden: a };
  }
  async _toggle(t, e) {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: t.id, enabled: e });
    } catch (s) {
      this._error = (s == null ? void 0 : s.message) ?? String(s);
    }
  }
  async _resume(t) {
    await this.hass.callService("weekly_planner", "resume", { program_id: t.id });
  }
  render() {
    if (!this._config || !this.hass) return h;
    const t = this._lang, e = T(t), s = this._data, i = s ? vs(s, this._config) : [], n = se(this._now, this._tz), o = _t(this._now, this._tz), r = this._config.show_advanced !== !1, a = r && this._advanced, c = !!s && i.length === 1 && this._config.title === void 0;
    return l`
      <ha-card>
        ${!c || s != null && s.vacation ? l`<div class="head">
              ${c ? l`<span class="grow"></span>` : l`<h1>${this._config.title ?? e.title}</h1>`}
              ${s != null && s.vacation ? l`<span class="chip warn"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${e.vacation}</span>` : h}
            </div>` : h}
        ${this._error ? l`<div class="error">${C(t, "error", { message: this._error })}</div>` : h}
        ${s != null && s.read_only ? l`<div class="error">${e.read_only}</div>` : h}
        ${s ? h : l`<div class="empty">…</div>`}
        ${s && !i.length ? l`<div class="empty">${e.no_program}</div>` : h}
        ${i.map((d) => this._renderProgram(d, n, o, a, c))}
        ${a && i.length && !this._config.program ? l`<button class="link" @click=${() => this._showWeek = !this._showWeek}>
              ${this._showWeek ? e.hide_week : e.show_week}</button>` : h}
        ${a && (s != null && s.can_edit) && !this._config.program ? l`<div class="adv-actions">
              <button class="small" @click=${() => this._dialog = { kind: "modes" }}>${e.modes}</button>
              <button class="small" @click=${() => this._dialog = { kind: "program" }}><ha-icon icon="mdi:plus"></ha-icon> ${e.new_program}</button>
            </div>` : h}
        ${r && i.length ? l`<button class="more" aria-expanded=${a} @click=${() => this._advanced = !this._advanced}>
              <ha-icon icon=${a ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon> ${a ? e.sm_less : e.sm_more}</button>` : h}
      </ha-card>
      ${this._renderDialog()}
    `;
  }
  _renderProgram(t, e, s, i, n = !1) {
    const o = this._data;
    return l`
      <section class="program ${t.enabled ? "" : "off"}">
        <h2 class="ptitle ${n ? "big" : ""}">${t.name}</h2>
        <wp-simple-controls .hass=${this.hass} .data=${o} .program=${t}
          @simple-schedule=${() => this._dialog = { kind: "simple", program: t }}></wp-simple-controls>
        ${i ? this._renderAdvanced(t, e, s) : h}
      </section>
    `;
  }
  _renderAdvanced(t, e, s) {
    var b, ht, g;
    const i = this._lang, n = T(i), o = this._data, { status: r, slot: a, mode: c, overridden: d } = this._summary(t), u = r != null && r.next_change ? Zt(r.next_change, this._tz, i, this._now) : null, _ = this._defaultMode(t), y = this._showWeek || !!this._config.program, v = St(t, o);
    return l`
      <div class="advanced">
        <div class="row">
          <div class="name">
            ${t.profiles.length > 1 ? l`<span class="chip">${v.name}</span>` : h}
          </div>
          <label class="switch">
            <span class="switch-label">${n.sm_active}</span>
            <input type="checkbox" .checked=${t.enabled} aria-label=${n.sm_active}
              @change=${(M) => this._toggle(t, M.target.checked)} />
            <span class="track"></span>
          </label>
        </div>
        <div class="state">
          ${this._effective(t) ? l`<span class="pill override">${this._effective(t)}</span>` : c ? l`<span class="pill" style="--c:${c.color}">${c.name}</span>` : a ? l`<span class="pill" style="--c:${ut(a, t, o.modes)}">${Ut(a, t, o.modes, i)}</span>` : _ && t.enabled && !o.vacation ? l`<span class="pill" style="--c:${_.color}">${_.name}</span>` : l`<span class="pill neutral">${t.enabled ? n.off_slot : "—"}</span>`}
          <span class="muted">${u ? C(i, "until", { time: u }) : n.no_change}</span>
          ${r != null && r.skip_next ? l`<span class="chip">${n.skip_planned}</span>` : h}
        </div>
        ${d.length ? l`<div class="warn-row"><ha-icon icon="mdi:hand-back-right"></ha-icon> ${d.length > 1 ? `${d.length} × ` : ""}${this._overrideText(d[0].entity_id)}
              ${t.enabled ? h : l`<button class="small" @click=${() => this._resume(t)}>${n.resume}</button>`}</div>` : h}
        ${(((b = o.warnings) == null ? void 0 : b[t.id]) ?? []).length && o.can_edit ? l`<details class="warnings"><summary><ha-icon icon="mdi:alert"></ha-icon> ${(((ht = o.warnings) == null ? void 0 : ht[t.id]) ?? []).length}</summary>
              ${(((g = o.warnings) == null ? void 0 : g[t.id]) ?? []).map((M) => l`<div>${this._warning(M)}</div>`)}</details>` : h}
        <wp-day-bar .spans=${this._spans(t, e, !0)} .now=${s} show-hours
          @click=${() => this._dialog = { kind: "day", program: t, day: e }}></wp-day-bar>
        ${y ? l`<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(
      (M) => l`<button class="day" @click=${() => this._dialog = { kind: "day", program: t, day: M }}>
                <span class=${M === e ? "today" : ""}>${n.days_short[M]}</span>
                <wp-day-bar thin .spans=${this._spans(t, M, M === e)}
                  .now=${M === e ? s : null}></wp-day-bar></button>`
    )}</div>` : h}
        <div class="actions">
          <button class="small" @click=${() => this._dialog = { kind: "override", program: t }}>${n.override}</button>
          ${o.can_edit ? l`<button class="small ghost" @click=${() => this._dialog = { kind: "program", program: t }}><ha-icon icon="mdi:pencil"></ha-icon> ${n.edit}</button>` : h}
        </div>
      </div>
    `;
  }
  _warning(t) {
    var n;
    const e = ((n = this.hass.states[t.entity_id]) == null ? void 0 : n.attributes.friendly_name) ?? t.entity_id, s = `warn_${t.code}`;
    return T(this._lang)[s] ? C(this._lang, s, { entity: e, detail: t.detail }) : `${e}: ${t.code}`;
  }
  /** Setpoint of a voluntary override on the program's first entity, shown instead of the plan. */
  _effective(t) {
    var i, n;
    const e = (i = t.entities[0]) == null ? void 0 : i.entity_id, s = e ? (n = this._data.entities[e]) == null ? void 0 : n.override : void 0;
    return (s == null ? void 0 : s.origin) === "voluntary" && s.setpoint ? xe(this._lang, this._data.modes, e, s.setpoint) : void 0;
  }
  /** Mode applied outside slots (default of the first entity), to show instead of "outside slots". */
  _defaultMode(t) {
    var s;
    const e = (s = t.entities[0]) == null ? void 0 : s.default;
    if (!((e == null ? void 0 : e.kind) !== "mode" || typeof e.value != "string"))
      return this._data.modes.find((i) => i.id === e.value);
  }
  _overrideText(t) {
    var s;
    const e = (s = this._data.entities[t]) == null ? void 0 : s.override;
    return (e == null ? void 0 : e.origin) === "voluntary" && e.until ? C(this._lang, "overridden_until", { time: Zt(e.until, this._tz, this._lang, this._now) }) : C(this._lang, "overridden");
  }
  _renderDialog() {
    var s;
    const t = this._dialog;
    if (!t || !this._data) return h;
    const e = () => this._dialog = null;
    switch (t.kind) {
      case "day":
        return l`<wp-day-view .hass=${this.hass} .data=${this._data} .program=${t.program} .day=${t.day}
          .showChart=${this._config.show_chart !== !1}
          @closed=${e}
          @edit-day=${(i) => this._dialog = { kind: "program", program: t.program, ...i.detail }}></wp-day-view>`;
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${t.program}
          .defaultTypes=${((s = this._config.filter) == null ? void 0 : s.types) ?? []} @closed=${e}></wp-program-editor>`;
      case "override":
        return l`<wp-override-dialog .hass=${this.hass} .data=${this._data} .program=${t.program}
          @closed=${e}></wp-override-dialog>`;
      case "simple":
        return l`<wp-simple-schedule .hass=${this.hass} .data=${this._data} .program=${t.program}
          @closed=${e}></wp-simple-schedule>`;
      case "modes":
        return l`<wp-modes-editor .hass=${this.hass} .data=${this._data} @closed=${e}></wp-modes-editor>`;
    }
  }
};
Y.styles = U`
    ha-card { padding: 16px; }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ptitle { margin: 0 0 4px; font-size: 18px; font-weight: 500; overflow-wrap: anywhere; }
    .ptitle.big { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .grow { flex: 1; }
    .advanced { margin-top: 12px; padding-top: 8px; border-top: 1px dashed var(--divider-color); }
    .adv-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    button.more {
      display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; min-height: 48px; margin-top: 8px;
      border: 1px solid var(--primary-color); border-radius: 24px; background: none; color: var(--primary-color);
      font: inherit; font-size: 15px; font-weight: 500; cursor: pointer; --mdc-icon-size: 22px; margin-top: 12px;
    }
    .program { padding: 12px 0; border-top: 1px solid var(--divider-color); }
    .program:first-of-type { border-top: none; }
    .program.off { opacity: 0.55; }
    .row { display: flex; align-items: center; gap: 8px; }
    .name { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
    .title { font-size: 16px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .state { display: flex; align-items: center; gap: 8px; margin: 6px 0 10px; flex-wrap: wrap; }
    .pill {
      background: var(--c); color: #fff; border-radius: 12px; padding: 2px 10px; font-size: 14px;
      font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }
    .pill.override {
      background: repeating-linear-gradient(135deg, var(--warning-color, #ff9800) 0 6px, #e68900 6px 12px);
    }
    .pill.neutral { background: var(--secondary-background-color); color: var(--primary-text-color); text-shadow: none; }
    .muted { color: var(--primary-text-color); opacity: 0.8; font-size: 14px; }
    .chip {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px;
      font-size: 14px; padding: 2px 10px; border-radius: 12px; background: var(--secondary-background-color);
    }
    .chip.warn { background: var(--warning-color, #ff9800); color: #fff; }
    .warnings { font-size: 14px; color: var(--secondary-text-color); margin-bottom: 8px; }
    .warnings summary { cursor: pointer; display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 20px; }
    .warn-row { --mdc-icon-size: 20px; display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 8px; }
    wp-day-bar { cursor: pointer; }
    .week { display: grid; gap: 4px; margin-top: 8px; }
    .day {
      display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px;
      background: none; border: none; padding: 8px 0; min-height: 48px; cursor: pointer; color: inherit; font: inherit;
    }
    .day span { font-size: 14px; opacity: 0.85; text-align: left; }
    .day span.today { color: var(--primary-color); font-weight: 600; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    button.small, button.ghost {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 20px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
      border-radius: 24px; padding: 4px 16px; font: inherit; font-size: 14px; cursor: pointer; min-height: 48px;
    }
    button.ghost { border-color: transparent; color: var(--primary-color); }
    button.link {
      border: none; background: none; color: var(--primary-color); cursor: pointer; padding: 0; min-height: 48px; font: inherit; font-size: 14px;
    }
    .empty { color: var(--primary-text-color); opacity: 0.8; padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 14px; margin-bottom: 8px; }
    .switch { position: relative; min-height: 48px; flex: none; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track {
      position: relative; width: 40px; height: 22px; border-radius: 11px; background: var(--disabled-color, #bdbdbd);
      transition: background 0.2s; flex: none;
    }
    .switch .track::before {
      content: ""; position: absolute; width: 18px; height: 18px; left: 2px; top: 2px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
    }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(18px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
dt([
  f({ attribute: !1 })
], Y.prototype, "hass", 2);
dt([
  m()
], Y.prototype, "_config", 2);
dt([
  m()
], Y.prototype, "_data", 2);
dt([
  m()
], Y.prototype, "_error", 2);
dt([
  m()
], Y.prototype, "_dialog", 2);
dt([
  m()
], Y.prototype, "_showWeek", 2);
dt([
  m()
], Y.prototype, "_advanced", 2);
dt([
  m()
], Y.prototype, "_preview", 2);
dt([
  m()
], Y.prototype, "_now", 2);
Y = dt([
  N("weekly-planner-card")
], Y);
var $n = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, Te = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bn(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (n = (i ? r(e, s, n) : r(n)) || n);
  return i && n && $n(e, s, n), n;
};
const wn = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let Jt = class extends P {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(t) {
    this._config = { ...t };
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(t, e) {
    return C(this._lang, t, e);
  }
  updated(t) {
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, this.hass.callWS({ type: "weekly_planner/get" }).then((e) => this._programs = e.programs.map((s) => ({ id: s.id, name: s.name }))).catch(() => this._loaded = !1));
  }
  _emit(t) {
    this._config = t, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 }));
  }
  _set(t, e) {
    const s = { ...this._config };
    e === void 0 || e === "" || e === null ? delete s[t] : s[t] = e, this._emit(s);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(t) {
    var s, i;
    const e = { ...this._config };
    t ? (delete e.filter, e.program = ((s = this._programs[0]) == null ? void 0 : s.id) ?? "") : (delete e.program, e.filter = { types: ((i = e.filter) == null ? void 0 : i.types) ?? [] }), this._emit(e);
  }
  _setFilter(t) {
    var i;
    const e = { ...this._config.filter ?? {}, ...t };
    (i = e.types) != null && i.length || delete e.types, e.area || delete e.area;
    const s = { ...this._config, filter: e };
    this._emit(s);
  }
  render() {
    var s, i;
    const t = this._config, e = ((s = t.filter) == null ? void 0 : s.types) ?? [];
    return l`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${t.title ?? ""} @input=${(n) => this._set("title", n.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? l`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(n) => this._set("program", n.target.value)}>
              ${this._programs.length === 0 ? l`<option value="">${this._tr("no_program")}</option>` : h}
              ${!this._programs.some((n) => n.id === t.program) && t.program ? l`<option value=${t.program} selected>${t.program}</option>` : h}
              ${this._programs.map((n) => l`<option value=${n.id} ?selected=${n.id === t.program}>${n.name}</option>`)}
            </select></div>` : l`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${wn.map((n) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${e.includes(n)}
                @change=${(o) => this._setFilter({ types: o.target.checked ? [...e, n] : e.filter((r) => r !== n) })} />
                ${Ee(this._lang, n)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((i = t.filter) == null ? void 0 : i.area) ?? ""} placeholder="bureau"
                @input=${(n) => this._setFilter({ area: n.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${!!t.show_week}
        @change=${(n) => this._set("show_week", n.target.checked)} /> ${this._tr("ce_show_week")}</label>
      <label class="check"><input type="checkbox" .checked=${t.show_chart !== !1}
        @change=${(n) => this._set("show_chart", n.target.checked)} /> ${this._tr("ce_show_chart")}</label>
      <label class="check"><input type="checkbox" .checked=${t.show_advanced !== !1}
        @change=${(n) => this._set("show_advanced", n.target.checked ? void 0 : !1)} /> ${this._tr("ce_show_advanced")}</label>
    `;
  }
};
Jt.styles = [lt, U`:host { display: block; padding: 4px 0; }`];
Te([
  f({ attribute: !1 })
], Jt.prototype, "hass", 2);
Te([
  m()
], Jt.prototype, "_config", 2);
Te([
  m()
], Jt.prototype, "_programs", 2);
Jt = Te([
  N("weekly-planner-card-editor")
], Jt);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
