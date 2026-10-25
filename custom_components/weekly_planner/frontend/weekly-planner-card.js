/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe = globalThis, Ve = fe.ShadowRoot && (fe.ShadyCSS === void 0 || fe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Je = Symbol(), os = /* @__PURE__ */ new WeakMap();
let Es = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Je) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Ve && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = os.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && os.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ke = (e) => new Es(typeof e == "string" ? e : e + "", void 0, Je), R = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, o, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[n + 1], e[0]);
  return new Es(s, e, Je);
}, Js = (e, t) => {
  if (Ve) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), o = fe.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, e.appendChild(i);
  }
}, ns = Ve ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Ke(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ks, defineProperty: Xs, getOwnPropertyDescriptor: Ys, getOwnPropertyNames: Gs, getOwnPropertySymbols: Zs, getPrototypeOf: Qs } = Object, $t = globalThis, rs = $t.trustedTypes, ti = rs ? rs.emptyScript : "", je = $t.reactiveElementPolyfillSupport, Kt = (e, t) => e, ye = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ti : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, Xe = (e, t) => !Ks(e, t), as = { attribute: !0, type: String, converter: ye, reflect: !1, useDefault: !1, hasChanged: Xe };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), $t.litPropertyMetadata ?? ($t.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ut = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = as) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, s);
      o !== void 0 && Xs(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: o, set: n } = Ys(this.prototype, t) ?? { get() {
      return this[s];
    }, set(r) {
      this[s] = r;
    } };
    return { get: o, set(r) {
      const a = o == null ? void 0 : o.call(this);
      n == null || n.call(this, r), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? as;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Kt("elementProperties"))) return;
    const t = Qs(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Kt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Kt("properties"))) {
      const s = this.properties, i = [...Gs(s), ...Zs(s)];
      for (const o of i) this.createProperty(o, s[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, o] of s) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const o = this._$Eu(s, i);
      o !== void 0 && this._$Eh.set(o, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const o of i) s.unshift(ns(o));
    } else t !== void 0 && s.push(ns(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((s) => this.enableUpdating = s), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((s) => s(this));
  }
  addController(t) {
    var s;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((s = t.hostConnected) == null || s.call(t));
  }
  removeController(t) {
    var s;
    (s = this._$EO) == null || s.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Js(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((s) => {
      var i;
      return (i = s.hostConnected) == null ? void 0 : i.call(s);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var i;
      return (i = s.hostDisconnected) == null ? void 0 : i.call(s);
    });
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    var n;
    const i = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : ye).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var n, r;
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const a = i.getPropertyOptions(o), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : ye;
      this._$Em = o;
      const h = c.fromAttribute(s, a.type);
      this[o] = h ?? ((r = this._$Ej) == null ? void 0 : r.get(o)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, o = !1, n) {
    var r;
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (n = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Xe)(n, s) || i.useDefault && i.reflect && n === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: o, wrapped: n }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), n !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), o === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [n, r] of o) {
        const { wrapped: a } = r, c = this[n];
        a !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, r, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), (i = this._$EO) == null || i.forEach((o) => {
        var n;
        return (n = o.hostUpdate) == null ? void 0 : n.call(o);
      }), this.update(s)) : this._$EM();
    } catch (o) {
      throw t = !1, this._$EM(), o;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var s;
    (s = this._$EO) == null || s.forEach((i) => {
      var o;
      return (o = i.hostUpdated) == null ? void 0 : o.call(i);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((s) => this._$ET(s, this[s]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ut.elementStyles = [], Ut.shadowRootOptions = { mode: "open" }, Ut[Kt("elementProperties")] = /* @__PURE__ */ new Map(), Ut[Kt("finalized")] = /* @__PURE__ */ new Map(), je == null || je({ ReactiveElement: Ut }), ($t.reactiveElementVersions ?? ($t.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xt = globalThis, ls = (e) => e, ve = Xt.trustedTypes, cs = ve ? ve.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ps = "$lit$", gt = `lit$${Math.random().toFixed(9).slice(2)}$`, As = "?" + gt, ei = `<${As}>`, Dt = document, Gt = () => Dt.createComment(""), Zt = (e) => e === null || typeof e != "object" && typeof e != "function", Ye = Array.isArray, si = (e) => Ye(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", Ne = `[ 	
\f\r]`, Jt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ds = /-->/g, hs = />/g, At = RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ps = /'/g, _s = /"/g, Ms = /^(?:script|style|textarea|title)$/i, Os = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = Os(1), Mt = Os(2), Ft = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), us = /* @__PURE__ */ new WeakMap(), Tt = Dt.createTreeWalker(Dt, 129);
function Ts(e, t) {
  if (!Ye(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return cs !== void 0 ? cs.createHTML(t) : t;
}
const ii = (e, t) => {
  const s = e.length - 1, i = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = Jt;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, m, _ = -1, v = 0;
    for (; v < c.length && (r.lastIndex = v, m = r.exec(c), m !== null); ) v = r.lastIndex, r === Jt ? m[1] === "!--" ? r = ds : m[1] !== void 0 ? r = hs : m[2] !== void 0 ? (Ms.test(m[2]) && (o = RegExp("</" + m[2], "g")), r = At) : m[3] !== void 0 && (r = At) : r === At ? m[0] === ">" ? (r = o ?? Jt, _ = -1) : m[1] === void 0 ? _ = -2 : (_ = r.lastIndex - m[2].length, h = m[1], r = m[3] === void 0 ? At : m[3] === '"' ? _s : ps) : r === _s || r === ps ? r = At : r === ds || r === hs ? r = Jt : (r = At, o = void 0);
    const w = r === At && e[a + 1].startsWith("/>") ? " " : "";
    n += r === Jt ? c + ei : _ >= 0 ? (i.push(h), c.slice(0, _) + Ps + c.slice(_) + gt + w) : c + gt + (_ === -2 ? a : w);
  }
  return [Ts(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Qt {
  constructor({ strings: t, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const a = t.length - 1, c = this.parts, [h, m] = ii(t, s);
    if (this.el = Qt.createElement(h, i), Tt.currentNode = this.el.content, s === 2 || s === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (o = Tt.nextNode()) !== null && c.length < a; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const _ of o.getAttributeNames()) if (_.endsWith(Ps)) {
          const v = m[r++], w = o.getAttribute(_).split(gt), x = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: n, name: x[2], strings: w, ctor: x[1] === "." ? ni : x[1] === "?" ? ri : x[1] === "@" ? ai : xe }), o.removeAttribute(_);
        } else _.startsWith(gt) && (c.push({ type: 6, index: n }), o.removeAttribute(_));
        if (Ms.test(o.tagName)) {
          const _ = o.textContent.split(gt), v = _.length - 1;
          if (v > 0) {
            o.textContent = ve ? ve.emptyScript : "";
            for (let w = 0; w < v; w++) o.append(_[w], Gt()), Tt.nextNode(), c.push({ type: 2, index: ++n });
            o.append(_[v], Gt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === As) c.push({ type: 2, index: n });
      else {
        let _ = -1;
        for (; (_ = o.data.indexOf(gt, _ + 1)) !== -1; ) c.push({ type: 7, index: n }), _ += gt.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const i = Dt.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Ht(e, t, s = e, i) {
  var r, a;
  if (t === Ft) return t;
  let o = i !== void 0 ? (r = s._$Co) == null ? void 0 : r[i] : s._$Cl;
  const n = Zt(t) ? void 0 : t._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== n && ((a = o == null ? void 0 : o._$AO) == null || a.call(o, !1), n === void 0 ? o = void 0 : (o = new n(e), o._$AT(e, s, i)), i !== void 0 ? (s._$Co ?? (s._$Co = []))[i] = o : s._$Cl = o), o !== void 0 && (t = Ht(e, o._$AS(e, t.values), o, i)), t;
}
class oi {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: i } = this._$AD, o = ((t == null ? void 0 : t.creationScope) ?? Dt).importNode(s, !0);
    Tt.currentNode = o;
    let n = Tt.nextNode(), r = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let h;
        c.type === 2 ? h = new oe(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new li(n, this, t)), this._$AV.push(h), c = i[++a];
      }
      r !== (c == null ? void 0 : c.index) && (n = Tt.nextNode(), r++);
    }
    return Tt.currentNode = Dt, o;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class oe {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, s, i, o) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = Ht(this, t, s), Zt(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== Ft && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : si(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && Zt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Dt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: s, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Qt.createElement(Ts(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === o) this._$AH.p(s);
    else {
      const r = new oi(o, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = us.get(t.strings);
    return s === void 0 && us.set(t.strings, s = new Qt(t)), s;
  }
  k(t) {
    Ye(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const n of t) o === s.length ? s.push(i = new oe(this.O(Gt()), this.O(Gt()), this, this.options)) : i = s[o], i._$AI(n), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, s); t !== this._$AB; ) {
      const o = ls(t).nextSibling;
      ls(t).remove(), t = o;
    }
  }
  setConnected(t) {
    var s;
    this._$AM === void 0 && (this._$Cv = t, (s = this._$AP) == null || s.call(this, t));
  }
}
class xe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, o, n) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = s, this._$AM = o, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(t, s = this, i, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = Ht(this, t, s, 0), r = !Zt(t) || t !== this._$AH && t !== Ft, r && (this._$AH = t);
    else {
      const a = t;
      let c, h;
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Ht(this, a[i + c], s, c), h === Ft && (h = this._$AH[c]), r || (r = !Zt(h) || h !== this._$AH[c]), h === d ? t = d : t !== d && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
    }
    r && !o && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ni extends xe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class ri extends xe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class ai extends xe {
  constructor(t, s, i, o, n) {
    super(t, s, i, o, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Ht(this, t, s, 0) ?? d) === Ft) return;
    const i = this._$AH, o = t === d && i !== d || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== d && (i === d || o);
    o && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class li {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ht(this, t);
  }
}
const Ie = Xt.litHtmlPolyfillSupport;
Ie == null || Ie(Qt, oe), (Xt.litHtmlVersions ?? (Xt.litHtmlVersions = [])).push("3.3.3");
const ci = (e, t, s) => {
  const i = (s == null ? void 0 : s.renderBefore) ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const n = (s == null ? void 0 : s.renderBefore) ?? null;
    i._$litPart$ = o = new oe(t.insertBefore(Gt(), n), n, void 0, s ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = globalThis;
let M = class extends Ut {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var s;
    const t = super.createRenderRoot();
    return (s = this.renderOptions).renderBefore ?? (s.renderBefore = t.firstChild), t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ci(s, this.renderRoot, this.renderOptions);
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
    return Ft;
  }
};
var Cs;
M._$litElement$ = !0, M.finalized = !0, (Cs = zt.litElementHydrateSupport) == null || Cs.call(zt, { LitElement: M });
const Re = zt.litElementPolyfillSupport;
Re == null || Re({ LitElement: M });
(zt.litElementVersions ?? (zt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const di = { attribute: !0, type: String, converter: ye, reflect: !1, hasChanged: Xe }, hi = (e = di, t, s) => {
  const { kind: i, metadata: o } = s;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
    const { name: r } = s;
    return { set(a) {
      const c = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(r, c, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, e, a), a;
    } };
  }
  if (i === "setter") {
    const { name: r } = s;
    return function(a) {
      const c = this[r];
      t.call(this, a), this.requestUpdate(r, c, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function f(e) {
  return (t, s) => typeof s == "object" ? hi(e, t, s) : ((i, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function u(e) {
  return f({ ...e, state: !0, attribute: !1 });
}
const F = 5, b = 1440;
function G(e) {
  const [t, s] = e.split(":").map(Number);
  return t * 60 + s;
}
function Y(e) {
  const t = Math.max(0, Math.min(b, Math.round(e / F) * F));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function bt(e, t) {
  var r, a;
  const s = typeof e == "string" ? new Date(e) : e, i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(s), o = Number(((r = i.find((c) => c.type === "hour")) == null ? void 0 : r.value) ?? 0), n = Number(((a = i.find((c) => c.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return o * 60 + n;
}
function te(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(s);
}
function wt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function He(e, t, s) {
  return new Intl.DateTimeFormat(s, { timeZone: t, hour: "2-digit", minute: "2-digit" }).format(
    new Date(e)
  );
}
function E(e) {
  return !e || !("time" in e) ? null : G(e.time);
}
function pi(e, t) {
  const s = (t == null ? void 0 : t.start) ?? E(e.start) ?? 0, i = t ? t.end : E(e.end ?? null);
  return i == null ? [[s, Math.min(b, s + F)]] : i > s ? [[s, i]] : [[s, b]];
}
function ke(e) {
  const t = [];
  for (const s of e) {
    const i = E(s.start), o = E(s.end ?? null);
    i !== null && o !== null && o <= i && o < 720 && t.push({ slot: s, end: o });
  }
  return t;
}
function Yt(e, t, s, i = /* @__PURE__ */ new Date()) {
  const o = new Date(e), n = wt(o, t) === wt(i, t), r = { timeZone: t, hour: "2-digit", minute: "2-digit" };
  return n || (r.weekday = "short"), new Intl.DateTimeFormat(s, r).format(o);
}
var _i = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, Vt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ui(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && _i(t, s, o), o;
};
let St = class extends M {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this._width = 0;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this._ro = new ResizeObserver((e) => {
      var s;
      const t = Math.round(((s = e[0]) == null ? void 0 : s.contentRect.width) ?? 0);
      t !== this._width && (this._width = t);
    }), this._ro.observe(this));
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._ro) == null || e.disconnect();
  }
  /** A label is only drawn when its span is at least 60 px wide (never cut off). */
  _fits(e) {
    return !this.thin && this._width > 0 && (e.end - e.start) / b * this._width >= 60;
  }
  render() {
    const e = (t) => `${t / b * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.spans.map(
      (t) => l`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${this._fits(t) ? l`<span>${t.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : d}${t.label}</span>` : d}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${e(this.now)}"></div>` : d}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 6, 12, 18, 24].map((t) => l`<span style="left:${e(t * 60)}">${t}h</span>`)}</div>` : d}
    `;
  }
};
St.styles = R`
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
Vt([
  f({ attribute: !1 })
], St.prototype, "spans", 2);
Vt([
  f({ type: Number })
], St.prototype, "now", 2);
Vt([
  f({ type: Boolean })
], St.prototype, "thin", 2);
Vt([
  f({ type: Boolean, attribute: "show-hours" })
], St.prototype, "showHours", 2);
Vt([
  u()
], St.prototype, "_width", 2);
St = Vt([
  N("wp-day-bar")
], St);
var mi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, Se = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? fi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && mi(t, s, o), o;
};
let Wt = class extends M {
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
    var t, s;
    !this._isPhone() || e.pointerType === "mouse" || e.composedPath().some((i) => i instanceof HTMLElement && i.tagName === "BUTTON") || (this._sw = { id: e.pointerId, y: e.clientY, x: e.clientX, dy: 0 }, (s = (t = e.currentTarget).setPointerCapture) == null || s.call(t, e.pointerId));
  }
  _hmove(e) {
    const t = this._sw;
    if (!t || e.pointerId !== t.id) return;
    t.dy = Math.max(0, e.clientY - t.y);
    const s = this._panel();
    s && (s.style.transition = "none", s.style.transform = `translateY(${t.dy}px)`);
  }
  _hup(e) {
    const t = this._sw;
    if (!t || e.pointerId !== t.id) return;
    this._sw = void 0;
    const s = this._panel(), i = Math.abs(e.clientX - t.x);
    s && (s.style.transition = "", s.style.transform = ""), t.dy >= 100 && i < t.dy && this.close();
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
Wt.styles = R`
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
Se([
  f()
], Wt.prototype, "heading", 2);
Se([
  f({ type: Boolean, reflect: !0 })
], Wt.prototype, "open", 2);
Se([
  f({ type: Boolean })
], Wt.prototype, "wide", 2);
Wt = Se([
  N("wp-dialog")
], Wt);
const gi = {
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
  overridden: "Changed by hand",
  overridden_until: "Override until {time}",
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
  sm_climate: "It is {current} · wanted {target}{until}",
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
  sm_until_line: "Until {time}",
  sm_until_open: "Until further notice",
  sm_change_duration: "Change the duration",
  sm_duration_title: "For how long?",
  sm_1h: "1 hour",
  sm_2h: "2 hours",
  sm_tonight: "This evening",
  sm_all_day: "All day",
  sm_done: "Done: {what}{until}",
  sm_resume: "Back to the schedule",
  sm_change_schedule: "Change the schedule",
  sm_more: "More options",
  sm_less: "Fewer options",
  sm_disabled: "This program is turned off.",
  sm_mode: "Mode",
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
  ss_earlier: "Earlier",
  ss_later: "Later",
  ss_earlier_aria: "{when}: 15 minutes earlier",
  ss_later_aria: "{when}: 15 minutes later",
  ss_next_day: "(the next day)",
  ss_midnight: "(midnight)",
  ss_sun_note: "Can be changed in “More options”.",
  ss_from_dawn: "From dawn",
  ss_to_dawn: "to dawn",
  ss_from_sunrise: "From sunrise",
  ss_to_sunrise: "to sunrise",
  ss_from_sunset: "From sunset",
  ss_to_sunset: "to sunset",
  ss_from_dusk: "From dusk",
  ss_to_dusk: "to dusk",
  ss_custom: "Custom setting",
  ss_pick_mode: "Choose…",
  ss_add: "Add a time",
  ss_remove: "Remove",
  ss_confirm_remove: "Remove the schedule “{time}”?",
  ss_copy_title: "Copy this day to:",
  ss_copy_weekdays: "the weekdays",
  ss_copy_weekend: "the weekend",
  ss_copy_all: "the whole week",
  ss_copy_confirm: "The schedules of the chosen days will be replaced by this day’s.",
  ss_copy_do: "Copy",
  ss_empty: "No schedule on this day.",
  ss_season: "Season: {name}",
  ss_err_overlap: "Two schedules overlap on {day}.",
  ss_err_same: "The start and the end are the same on {day}.",
  ss_err_no_mode: "Choose a mode for every schedule ({day}).",
  ss_err_none_modes: "No mode exists yet: create one in “More options”.",
  ss_conflict: "These schedules were changed elsewhere in the meantime. Reload, then make your changes again.",
  ss_reload: "Reload",
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
}, yi = {
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
  overridden: "Modifié à la main",
  overridden_until: "Dérogation jusqu'à {time}",
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
  sm_climate: "Il fait {current} · voulu {target}{until}",
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
  sm_until_line: "Jusqu'à {time}",
  sm_until_open: "Jusqu'à nouvel ordre",
  sm_change_duration: "Modifier la durée",
  sm_duration_title: "Pendant combien de temps ?",
  sm_1h: "1 heure",
  sm_2h: "2 heures",
  sm_tonight: "Ce soir",
  sm_all_day: "Toute la journée",
  sm_done: "C'est fait : {what}{until}",
  sm_resume: "Reprendre le programme",
  sm_change_schedule: "Changer les horaires",
  sm_more: "Plus d'options",
  sm_less: "Moins d'options",
  sm_disabled: "Ce programme est arrêté.",
  sm_mode: "Mode",
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
  ss_earlier: "Plus tôt",
  ss_later: "Plus tard",
  ss_earlier_aria: "{when} : 15 minutes plus tôt",
  ss_later_aria: "{when} : 15 minutes plus tard",
  ss_next_day: "(le lendemain)",
  ss_midnight: "(minuit)",
  ss_sun_note: "Réglable dans « Plus d'options ».",
  ss_from_dawn: "De l'aube",
  ss_to_dawn: "à l'aube",
  ss_from_sunrise: "Du lever du soleil",
  ss_to_sunrise: "au lever du soleil",
  ss_from_sunset: "Du coucher du soleil",
  ss_to_sunset: "au coucher du soleil",
  ss_from_dusk: "Du crépuscule",
  ss_to_dusk: "au crépuscule",
  ss_custom: "Réglage personnalisé",
  ss_pick_mode: "Choisir…",
  ss_add: "Ajouter un horaire",
  ss_remove: "Retirer",
  ss_confirm_remove: "Retirer l'horaire « {time} » ?",
  ss_copy_title: "Copier ce jour sur :",
  ss_copy_weekdays: "les jours de semaine",
  ss_copy_weekend: "le week-end",
  ss_copy_all: "toute la semaine",
  ss_copy_confirm: "Les horaires des jours choisis seront remplacés par ceux de ce jour.",
  ss_copy_do: "Copier",
  ss_empty: "Aucun horaire ce jour-là.",
  ss_season: "Saison : {name}",
  ss_err_overlap: "Deux horaires se chevauchent : {day}.",
  ss_err_same: "Le début et la fin sont identiques : {day}.",
  ss_err_no_mode: "Choisissez un mode pour chaque horaire ({day}).",
  ss_err_none_modes: "Aucun mode n'existe encore : créez-en un dans « Plus d'options ».",
  ss_conflict: "Ces horaires ont été modifiés ailleurs entre-temps. Rechargez, puis refaites vos changements.",
  ss_reload: "Recharger",
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
function T(e) {
  return e.startsWith("fr") ? yi : gi;
}
function C(e, t, s = {}) {
  let i = T(e)[t];
  for (const [o, n] of Object.entries(s)) i = i.replace(`{${o}}`, n);
  return i;
}
var vi = Object.defineProperty, $i = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? $i(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && vi(t, s, o), o;
};
const st = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, q = (e) => e === "input_boolean" ? "switch" : e;
function Ce(e, t) {
  const s = T(e)[`type_${t}`];
  return typeof s == "string" ? s : t;
}
const bi = [
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
], rt = R`
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
function Ge(e, t, s) {
  e.dispatchEvent(new CustomEvent(t, { detail: s, bubbles: !0, composed: !0 }));
}
function $e(e, t) {
  if (!t) return "";
  const s = t, i = (o) => C(e, `sp_${o}`);
  switch (t.kind) {
    case "preset":
      return `${s.preset}${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
    case "temperature":
      return `${s.temperature} °C${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
    case "hvac_mode":
      return `${i("hvac_mode")} ${s.hvac_mode}`;
    case "position":
      return `${i("position")} ${s.position} %`;
    case "tilt":
      return `${i("tilt")} ${s.tilt} %`;
    case "on": {
      const o = [
        s.brightness !== void 0 ? `${s.brightness} %` : "",
        s.percentage !== void 0 ? `${s.percentage} %` : "",
        s.effect ?? ""
      ].filter(Boolean).join(" · ");
      return o ? `${i("on")} · ${o}` : i("on");
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
      return i(t.kind);
  }
}
let ht = class extends M {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(k(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Ge(this, "wp-change", e);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const t = this.filter;
      return l`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${t ? (s) => t(s.entity_id) : void 0}
        @value-changed=${(s) => {
        s.stopPropagation(), this._emit(s.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const e = this._ids().slice(0, 600);
    return l`
      <div class="field">
        ${this.label ? l`<label>${this.label}</label>` : d}
        <input type="text" list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(t) => {
      const s = t.target.value.trim();
      (s === "" || this.hass.states[s]) && this._emit(s);
    }}
          @input=${(t) => {
      const s = t.target.value.trim();
      this.hass.states[s] && s !== this.value && this._emit(s);
    }} />
        <datalist id=${this._listId}>
          ${e.map((t) => l`<option value=${t}>${ie(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
ht.styles = [rt, R`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
D([
  f({ attribute: !1 })
], ht.prototype, "hass", 2);
D([
  f()
], ht.prototype, "value", 2);
D([
  f()
], ht.prototype, "label", 2);
D([
  f({ attribute: !1 })
], ht.prototype, "domains", 2);
D([
  f({ attribute: !1 })
], ht.prototype, "exclude", 2);
D([
  f({ attribute: !1 })
], ht.prototype, "filter", 2);
ht = D([
  N("wp-entity-picker")
], ht);
let ee = class extends M {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e) {
    return C(this._lang, e);
  }
  _set(e) {
    Ge(this, "wp-change", e);
  }
  _patch(e, t) {
    this._set(this.conditions.map((s, i) => i === e ? { ...s, ...t } : s));
  }
  _parse(e, t) {
    const s = e.trim();
    return s !== "" && !Number.isNaN(Number(s)) ? Number(s) : t && s === "true" ? !0 : t && s === "false" ? !1 : e;
  }
  render() {
    return l`
      ${this.conditions.map(
      (e, t) => l`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${e.entity_id} .label=${this._tr("entity")}
              @wp-change=${(s) => {
        s.stopPropagation(), this._patch(t, { entity_id: s.detail });
      }}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${e.attribute ?? ""} placeholder="—"
                  @change=${(s) => this._patch(t, { attribute: s.target.value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(s) => this._patch(t, { op: s.target.value })}>
                  ${["eq", "ne", "lt", "gt"].map(
        (s) => l`<option value=${s} ?selected=${(e.op ?? "eq") === s}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[s]}</option>`
      )}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(e.value ?? "")}
                  @change=${(s) => this._patch(t, { value: this._parse(s.target.value, !!e.attribute) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((s, i) => i !== t))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`
    )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }
};
ee.styles = rt;
D([
  f({ attribute: !1 })
], ee.prototype, "hass", 2);
D([
  f({ attribute: !1 })
], ee.prototype, "conditions", 2);
ee = D([
  N("wp-conditions-editor")
], ee);
const zs = {
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
}, wi = ["scene", "script", "action"];
function se(e, t) {
  const s = zs[k(t)];
  return We(e, t, s ? s[0] : "action");
}
function We(e, t, s) {
  var o, n, r, a, c, h;
  const i = ((o = e == null ? void 0 : e.states[t]) == null ? void 0 : o.attributes) ?? {};
  switch (s) {
    case "preset":
      return { kind: s, preset: ((n = i.preset_modes) == null ? void 0 : n[0]) ?? "" };
    case "temperature":
      return { kind: s, temperature: Number(i.temperature ?? i.min_temp ?? 20) };
    case "hvac_mode":
      return { kind: s, hvac_mode: ((r = i.hvac_modes) == null ? void 0 : r.find((m) => m !== "off")) ?? "heat" };
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
      return { kind: s, operation_mode: ((h = i.operation_list) == null ? void 0 : h[0]) ?? "", temperature: Number(i.temperature ?? 50) };
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
let ot = class extends M {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  get _domain() {
    return k(this.entityId);
  }
  get _attrs() {
    var e, t;
    return ((t = (e = this.hass) == null ? void 0 : e.states[this.entityId]) == null ? void 0 : t.attributes) ?? {};
  }
  _kinds() {
    var o;
    const e = zs[this._domain] ?? [], t = !this.stateOnly && this.admin ? wi : [], s = (o = this.value) == null ? void 0 : o.kind, i = [...e, ...t];
    return s && !i.includes(s) && i.push(s), i;
  }
  _current() {
    return this.value ?? We(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [s, i] of Object.entries(e))
      s !== "kind" && i !== void 0 && i !== "" && !(typeof i == "number" && Number.isNaN(i)) && (t[s] = i);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), Ge(this, "wp-change", t);
  }
  _patch(e) {
    this._emit({ ...this._current(), ...e });
  }
  _number(e, t, s, i, o = 1, n = "") {
    const r = this._current();
    return l`
      <div class="field">
        <label>${this._tr(e)}${n ? ` (${n})` : ""}</label>
        <input type="number" min=${s} max=${i} step=${o} .value=${r[t] === void 0 ? "" : String(r[t])}
          @change=${(a) => {
      const c = a.target.value;
      this._patch({ [t]: c === "" ? void 0 : Math.min(i, Math.max(s, Number(c))) });
    }} />
      </div>`;
  }
  _choice(e, t, s, i = !1, o = !1) {
    const r = this._current()[t] ?? "";
    if (!(s != null && s.length) && !i && o)
      return l`<div class="field"><label>${this._tr(e)}</label>
        <input type="text" .value=${r} @change=${(c) => this._patch({ [t]: c.target.value })} /></div>`;
    const a = s ?? [];
    return l`
      <div class="field">
        <label>${this._tr(e)}</label>
        <select @change=${(c) => this._patch({ [t]: c.target.value || void 0 })}>
          ${i ? l`<option value="" ?selected=${r === ""}>—</option>` : d}
          ${!a.includes(r) && r ? l`<option value=${r} selected>${r}</option>` : d}
          ${a.map((c) => l`<option value=${c} ?selected=${c === r}>${c}</option>`)}
        </select>
      </div>`;
  }
  _fields(e) {
    const t = this._attrs;
    switch (e.kind) {
      case "preset":
        return l`${this._choice("f_preset", "preset", t.preset_modes, !1, !0)}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
      case "temperature":
        return l`${this._number("f_temperature", "temperature", t.min_temp ?? 5, t.max_temp ?? 35, t.target_temp_step ?? 0.5, "°C")}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
      case "hvac_mode":
        return this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !1, !0);
      case "position":
        return this._number("f_position", "position", 0, 100, 1, "%");
      case "tilt":
        return this._number("f_tilt", "tilt", 0, 100, 1, "%");
      case "volume":
        return this._number("f_volume", "volume", 0, 100, 1, "%");
      case "source":
        return this._choice("f_source", "source", t.source_list, !1, !0);
      case "value":
        return this._number("f_value", "value", t.min ?? -1e6, t.max ?? 1e6, t.step ?? 1);
      case "option":
        return this._choice("f_option", "option", t.options, !1, !0);
      case "on":
        return this._domain === "light" ? l`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", t.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : d;
      case "auto":
        return l`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(s) => s.startsWith("switch.adaptive_lighting")}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ adaptive_switch: s.detail || void 0 });
        }}></wp-entity-picker>
            ${e.adaptive_switch ? l`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : d}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail || void 0 });
        }}></wp-entity-picker></div>`;
      case "water_heater":
        return l`${this._choice("f_operation_mode", "operation_mode", t.operation_list, !0)}${this._number("f_temperature", "temperature", t.min_temp ?? 20, t.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return l`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ scene: s.detail });
        }}></wp-entity-picker></div>`;
      case "script":
        return l`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail });
        }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(e);
      default:
        return d;
    }
  }
  _actionFields(e) {
    const t = JSON.stringify(e.data ?? {}, null, 2);
    return this._jsonFor !== this.entityId + t && !this._jsonError && (this._json = t, this._jsonFor = this.entityId + t), l`
      <div class="field"><label>${this._tr("f_action")}</label>
        <input type="text" .value=${e.action ?? ""} placeholder="light.turn_on"
          @change=${(s) => this._patch({ action: s.target.value.trim() })} /></div>
      <div class="field"><label>${this._tr("f_data")}</label>
        <textarea .value=${this._json} spellcheck="false"
          @input=${(s) => {
      const i = s.target.value;
      this._json = i;
      try {
        const o = i.trim() ? JSON.parse(i) : {};
        if (o === null || typeof o != "object" || Array.isArray(o)) throw new Error("object");
        this._jsonError = !1, this._jsonFor = this.entityId + JSON.stringify(o, null, 2), this._patch({ data: o });
      } catch {
        this._jsonError = !0;
      }
    }}></textarea>
        ${this._jsonError ? l`<span class="error">${this._tr("f_json_invalid")}</span>` : d}</div>
      <label class="check"><input type="checkbox" .checked=${e.target_self !== !1}
        @change=${(s) => this._patch({ target_self: s.target.checked ? void 0 : !1 })} />
        ${this._tr("f_target_self")}</label>`;
  }
  render() {
    const e = this._kinds(), t = this._current();
    return l`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(s) => this._emit(We(this.hass, this.entityId, s.target.value))}>
          ${e.map((s) => l`<option value=${s} ?selected=${s === t.kind}>${this._tr(`sp_${s}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
ot.styles = rt;
D([
  f({ attribute: !1 })
], ot.prototype, "hass", 2);
D([
  f({ attribute: "entity-id" })
], ot.prototype, "entityId", 2);
D([
  f({ attribute: !1 })
], ot.prototype, "value", 2);
D([
  f({ type: Boolean })
], ot.prototype, "admin", 2);
D([
  f({ type: Boolean, attribute: "state-only" })
], ot.prototype, "stateOnly", 2);
D([
  u()
], ot.prototype, "_json", 2);
D([
  u()
], ot.prototype, "_jsonError", 2);
ot = D([
  N("wp-setpoint-editor")
], ot);
let he, Ot;
const pe = /* @__PURE__ */ new Set();
function xi(e, t) {
  return pe.add(t), he && t(he), Ot || (Ot = e.connection.subscribeMessage(
    (s) => {
      he = s, pe.forEach((i) => i(s));
    },
    { type: "weekly_planner/subscribe" }
  ), Ot.catch(() => {
    Ot = void 0;
  })), () => {
    pe.delete(t), pe.size === 0 && Ot && (Ot.then((s) => s()).catch(() => {
    }), Ot = void 0, he = void 0);
  };
}
const k = (e) => e.split(".")[0];
function yt(e) {
  var t;
  return e.main_type || k(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function xt(e, t) {
  var i;
  const s = ((i = t.status[e.id]) == null ? void 0 : i.active_profile) ?? e.active_profile;
  return e.profiles.find((o) => o.id === s) ?? e.profiles[0];
}
function ne(e, t, s) {
  const i = e.actions.by_type[yt(t)] ?? Object.values(e.actions.by_type)[0];
  return s.find((o) => o.id === i);
}
function dt(e, t, s) {
  var i;
  return e.color || ((i = ne(e, t, s)) == null ? void 0 : i.color) || "var(--secondary-text-color)";
}
function jt(e, t, s, i) {
  const o = ne(e, t, s);
  if (o) return o.name;
  const n = t.entities.map((r) => e.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return n.length ? n.length > 1 ? `${$e(i, n[0])} +${n.length - 1}` : $e(i, n[0]) : "";
}
function ie(e, t) {
  var s;
  return ((s = e.states[t]) == null ? void 0 : s.attributes.friendly_name) ?? t;
}
function ms(e, t) {
  var o, n;
  if (t.program) return e.programs.filter((r) => r.id === t.program);
  const s = (o = t.filter) == null ? void 0 : o.types, i = (n = t.filter) == null ? void 0 : n.area;
  return e.programs.filter((r) => !(s != null && s.length) || r.entities.some((a) => s.includes(k(a.entity_id)))).filter((r) => !i || r.area === i).sort((r, a) => r.priority - a.priority || r.name.localeCompare(a.name));
}
function vt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function Ds(e, t) {
  return new Intl.NumberFormat(e, { maximumFractionDigits: 1 }).format(t);
}
const qe = (e, t) => `${Ds(e, t)} °C`;
function ki(e, t) {
  const s = T(e)[`preset_${t}`];
  return typeof s == "string" ? s : t;
}
const ge = (e, t) => {
  var s;
  return ((s = e.exceptions) == null ? void 0 : s[t]) ?? e.value;
};
function Si(e, t, s) {
  var n, r, a;
  const i = ((n = e.states[t]) == null ? void 0 : n.attributes) ?? {}, o = s;
  return s.kind === "preset" ? ((r = i.preset_modes) == null ? void 0 : r.includes(o.preset)) ?? !1 : s.kind === "hvac_mode" ? ((a = i.hvac_modes) == null ? void 0 : a.includes(o.hvac_mode)) ?? !1 : s.kind === "tilt" ? i.current_tilt_position !== void 0 : !0;
}
function js(e, t, s, i) {
  const o = JSON.stringify(i), n = t.find((c) => JSON.stringify(ge(c, s)) === o);
  if (n) return n.name;
  const r = i, a = T(e);
  switch (i.kind) {
    case "preset":
      return ki(e, String(r.preset));
    case "temperature":
      return qe(e, Number(r.temperature));
    case "open":
      return a.sp_open;
    case "close":
      return a.sp_close;
    case "off":
      return a.sp_off;
    case "on":
      return r.brightness !== void 0 ? `${a.sp_on} · ${r.brightness} %` : a.sp_on;
    default:
      return $e(e, i);
  }
}
function Ci(e, t, s = 7, i = 35) {
  return Math.min(i, Math.max(s, Math.round((e + t * 0.5) * 2) / 2));
}
var Ei = Object.defineProperty, Pi = Object.getOwnPropertyDescriptor, it = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Pi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Ei(t, s, o), o;
};
function fs(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(e)), i = (n) => {
    var r;
    return Number(((r = s.find((a) => a.type === n)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(i("year"), i("month") - 1, i("day"), i("hour"), i("minute"), i("second")) - Math.floor(e / 1e3) * 1e3;
}
function gs(e, t) {
  const [s, i, o] = e.split("-").map(Number), n = Date.UTC(s, i - 1, o), r = n - fs(n, t);
  return n - fs(r, t);
}
function Ns(e, t) {
  const [s, i, o] = e.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, o + t)).toISOString().slice(0, 10);
}
function _e(e, t) {
  return { startMs: gs(e, t), endMs: gs(Ns(e, 1), t) };
}
function Lt(e) {
  const [t, s, i] = e.split("-").map(Number);
  return te(new Date(Date.UTC(t, s - 1, i, 12)), "UTC");
}
const Ue = /* @__PURE__ */ new Map();
function ys(e, t, s) {
  const i = Ue.get(e);
  if (i && Date.now() - i.at < t) return i.p;
  const o = s();
  return Ue.set(e, { at: Date.now(), p: o }), o.catch(() => Ue.delete(e)), o;
}
const vs = "var(--disabled-text-color, #9e9e9e)";
function $s(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  let s = {};
  for (const i of e) {
    i.a && (s = i.a);
    const o = i.lu ?? i.lc ?? i.last_updated_ts, n = typeof o == "number" ? o * 1e3 : Date.parse(i.last_updated ?? "");
    Number.isNaN(n) || t.push({ t: n, s: String(i.s ?? i.state ?? ""), a: s });
  }
  return t;
}
const Ai = (e) => e === "unavailable" || e === "unknown" || e === "", W = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let B = class extends M {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._cursor = null, this._model = null, this._token = 0;
  }
  get _lang() {
    var e, t, s;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((s = this.hass) == null ? void 0 : s.language) ?? "en";
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
    this._loaded = null, this._failed = !1, this._cursor = null;
    const { startMs: s, endMs: i } = _e(this.date, this._tz), o = Date.now(), r = i > o ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const c = s < o ? ys(`h|${e}|${a}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(s).toISOString(),
        end_time: new Date(Math.min(i, o)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), h = Math.min(14, Math.max(1, Math.ceil((o - s) / 864e5) + 1)), m = s < o ? ys(`j|${this.entityId}|${h}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: h })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, v] = await Promise.all([c, m]);
      if (t !== this._token) return;
      this._loaded = {
        hist: $s(_[this.entityId]),
        win: a ? $s(_[a]) : [],
        journal: (v.segments ?? []).filter((w) => w.entity_id === this.entityId)
      };
    } catch {
      t === this._token && (this._failed = !0);
    }
  }
  /** A window binary sensor of a thermostat (id contains the climate name and "window"). */
  _windowSensor() {
    if (k(this.entityId) !== "climate") return null;
    const e = this.entityId.split(".")[1];
    return Object.keys(this.hass.states).find(
      (t) => t.startsWith("binary_sensor.") && t.includes(e) && t.includes("window")
    ) ?? null;
  }
  // ---- values ----
  _modeSetpoint(e, t) {
    var i;
    const s = this.data.modes.find((o) => o.id === e);
    return s ? ((i = s.exceptions) == null ? void 0 : i[t]) ?? s.value : null;
  }
  _slotSetpoint(e) {
    return e.actions.by_entity[this.entityId] ?? this._modeSetpoint(e.actions.by_type[k(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(e) {
    if (!e) return null;
    const t = k(this.entityId);
    if (t === "climate") {
      const s = W(e.temperature);
      return s !== null ? s : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? W(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? W(e.brightness) ?? 100 : null : e.kind === "value" ? W(e.value) : null;
  }
  _presetTemperature(e) {
    var a, c;
    const t = ((a = this.hass.states[this.entityId]) == null ? void 0 : a.attributes) ?? {}, s = W((c = t.preset_temperatures) == null ? void 0 : c[e]) ?? W(t[`${e}_temp`]) ?? W(t[`${e}_temperature`]);
    if (s !== null) return s;
    const i = Array.isArray(t.preset_modes) ? t.preset_modes : [], o = i.indexOf(e);
    if (o < 0) return null;
    const n = W(t.min_temp) ?? 5, r = W(t.max_temp) ?? 30;
    return n + (o + 1) / (i.length + 1) * (r - n);
  }
  _live(e) {
    const t = k(this.entityId);
    if (Ai(e.s)) return { applied: null, measured: null };
    if (t === "climate") return { applied: W(e.a.temperature), measured: W(e.a.current_temperature) };
    if (t === "cover") return { applied: W(e.a.current_position), measured: null };
    if (t === "light") {
      const i = e.s === "on" ? W(e.a.brightness) : 0;
      return { applied: i === null ? e.s === "on" ? 100 : 0 : i / 255 * 100, measured: null };
    }
    const s = Number(e.s);
    return { applied: Number.isFinite(s) ? s : null, measured: null };
  }
  // ---- build ----
  _build(e) {
    var ss, is;
    const t = this._tz, { startMs: s, endMs: i } = _e(this.date, t), o = Math.round((i - s) / 6e4), n = Date.now(), r = Math.max(0, Math.min(o, (n - s) / 6e4)), a = (p) => (p - s) / 6e4, c = k(this.entityId), h = this.data.modes, m = xt(this.program, this.data), _ = /* @__PURE__ */ new Map();
    for (const p of this.program.profiles) for (const y of p.days.flat()) _.set(y.id, y);
    C(this._lang, "override");
    const v = Lt(this.date), w = [];
    for (const { slot: p, end: y } of ke(m.days[(v + 6) % 7])) w.push({ s: 0, e: y, slot: p });
    if (this.slots)
      for (const p of this.slots) {
        const y = _.get(p.slot_id);
        if (!y || p.ignored) continue;
        const $ = Math.max(0, a(Date.parse(p.start))), O = p.end ? Math.min(o, a(Date.parse(p.end))) : $ + 5;
        O > $ && w.push({ s: $, e: O, slot: y });
      }
    else
      for (const p of m.days[v]) {
        const y = E(p.start);
        if (y === null) continue;
        const $ = E(p.end ?? null);
        w.push({ s: y, e: $ === null ? y + 5 : $ > y ? $ : o, slot: p });
      }
    w.sort((p, y) => p.s - y.s);
    const x = (ss = this.program.entities.find((p) => p.entity_id === this.entityId)) == null ? void 0 : ss.default, ct = x ? x.kind === "mode" ? this._modeSetpoint(String(x.value), this.entityId) : x.kind === "setpoint" ? x.value : null : null, g = (x == null ? void 0 : x.kind) === "mode" ? h.find((p) => p.id === x.value) : void 0, P = (x == null ? void 0 : x.kind) === "previous", A = [];
    let V = 0;
    const re = (p) => {
      if (p <= V) return;
      const y = A[A.length - 1];
      A.push(P && y ? { ...y, s: V, e: p } : { s: V, e: p, v: this._value(ct), color: (g == null ? void 0 : g.color) ?? vs, label: (g == null ? void 0 : g.name) ?? C(this._lang, "default_state") }), V = p;
    };
    for (const p of w) {
      const y = Math.max(p.s, V);
      if (p.e <= y) continue;
      re(y);
      const $ = this._slotSetpoint(p.slot);
      A.push({
        s: y,
        e: p.e,
        v: this._value($),
        color: dt(p.slot, this.program, h),
        label: jt(p.slot, this.program, h, this._lang)
      }), V = p.e;
    }
    re(o);
    const I = (p) => A.find((y) => p >= y.s && p < y.e) ?? A[A.length - 1], mt = e.journal.map((p) => ({ m: a(Date.parse(p.at)), e: p })).filter((p) => !Number.isNaN(p.m)).sort((p, y) => p.m - y.m), Ae = (p) => {
      let y = null;
      for (const O of mt) if (O.m <= p) y = O;
      else break;
      if (!y) return null;
      const $ = y.e.slot_id ? _.get(y.e.slot_id) : void 0;
      return {
        s: y.m,
        e: y.m,
        v: this._value(y.e.setpoint),
        color: $ ? dt($, this.program, h) : vs,
        label: $ ? jt($, this.program, h, this._lang) : ""
      };
    }, ae = /* @__PURE__ */ new Set([0, o, r]);
    A.forEach((p) => {
      ae.add(p.s), ae.add(p.e);
    }), mt.forEach((p) => {
      p.m > 0 && p.m < o && ae.add(p.m);
    });
    const Me = [...ae].filter((p) => p >= 0 && p <= o).sort((p, y) => p - y), le = [];
    for (let p = 0; p < Me.length - 1; p++) {
      const y = Me[p], $ = Me[p + 1];
      if ($ - y < 0.01) continue;
      const O = (y + $) / 2, Pt = (O < r ? Ae(O) : null) ?? I(O);
      le.push({ s: y, e: $, v: Pt.v, color: Pt.color, label: Pt.label });
    }
    const It = [], Oe = [], Ze = [];
    for (const p of e.hist) {
      const y = Math.max(0, a(p.t)), $ = this._live(p);
      It.push({ m: y, v: $.applied, heating: p.a.hvac_action === "heating" }), Oe.push({ m: y, v: $.measured });
    }
    const Qe = (p, y) => {
      const $ = [];
      return p.forEach((O, Et) => {
        if (!y(Et)) return;
        const Pt = Et + 1 < p.length ? p[Et + 1].m : r;
        if (Pt > O.m) {
          const De = $[$.length - 1];
          De && Math.abs(De[1] - O.m) < 0.01 ? De[1] = Pt : $.push([O.m, Pt]);
        }
      }), $;
    };
    Ze.push(...Qe(It, (p) => !!It[p].heating));
    const ts = e.win.map((p) => ({ m: Math.max(0, a(p.t)), open: p.s === "on" })), Hs = Qe(ts, (p) => ts[p].open), Ws = (p, y) => {
      let $ = null, O = !1;
      for (const Et of p) if (Et.m <= y)
        $ = Et.v, O = !0;
      else break;
      return O ? $ : null;
    }, qs = (p) => {
      var y;
      return ((y = le.find(($) => p >= $.s && p < $.e)) == null ? void 0 : y.v) ?? null;
    }, Bs = c === "climate" ? 0.5 : 5, es = [];
    let Rt = null;
    const Te = Math.floor(r);
    for (let p = 0; p <= Te + 1; p++) {
      const y = p <= Te ? qs(p + 0.5) : null, $ = p <= Te ? Ws(It, p + 0.5) : null, O = y !== null && $ !== null && Math.abs(y - $) > Bs;
      O && Rt === null && (Rt = p), !O && Rt !== null && (p - Rt > 2 && es.push([Rt, p]), Rt = null);
    }
    const ze = [...le.map((p) => p.v), ...It.map((p) => p.v), ...Oe.map((p) => p.v)].filter((p) => p !== null);
    let ce = 0, de = 100;
    c !== "cover" && c !== "light" && ze.length && (ce = Math.floor(Math.min(...ze) - 1), de = Math.ceil(Math.max(...ze) + 1), de - ce < 2 && (de = ce + 2));
    const Vs = c === "climate" ? "°C" : c === "cover" || c === "light" ? "%" : ((is = this.hass.states[this.entityId]) == null ? void 0 : is.attributes.unit_of_measurement) ?? "";
    return {
      span: o,
      pastEnd: r,
      isToday: s <= n && n < i,
      planned: le,
      applied: It,
      measured: Oe,
      heat: Ze,
      win: Hs,
      over: es,
      lo: ce,
      hi: de,
      unit: Vs
    };
  }
  // ---- interaction ----
  _pointer(e) {
    const t = this._model;
    if (!t) return;
    const s = e.currentTarget.getBoundingClientRect(), i = e.clientX - s.left;
    this._cursor = this._clampM((i - S.l) / (s.width - S.l - S.r) * t.span, t.span);
  }
  _clampM(e, t) {
    return Math.max(0, Math.min(t - 1, Math.round(e)));
  }
  _key(e) {
    const t = this._model;
    if (!t) return;
    const s = this._cursor ?? Math.round(t.isToday ? t.pastEnd : t.span / 2);
    let i = null;
    if (e.key === "ArrowLeft") i = s - 15;
    else if (e.key === "ArrowRight") i = s + 15;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = t.span - 1;
    else if (e.key === "Escape" && this._cursor !== null) {
      e.stopPropagation(), this._cursor = null;
      return;
    }
    i !== null && (e.preventDefault(), this._cursor = this._clampM(i, t.span));
  }
  // ---- render ----
  _fmt(e, t) {
    return e === null ? "–" : `${Number(e.toFixed(1))}${t ? " " + t : ""}`;
  }
  _clock(e) {
    const { startMs: t } = _e(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t + e * 6e4));
  }
  _valueAt(e, t) {
    let s = null;
    for (const i of e) if (i.m <= t) s = i.v;
    else break;
    return s;
  }
  _path(e, t, s, i, o) {
    let n = "", r = !1;
    return e.forEach((a, c) => {
      const h = c + 1 < e.length ? e[c + 1].m : t.pastEnd;
      if (a.v === null || h < a.m) {
        r = !1;
        return;
      }
      const m = i(a.v);
      o ? n += r ? `V${m.toFixed(1)}H${s(h).toFixed(1)}` : `M${s(a.m).toFixed(1)},${m.toFixed(1)}H${s(h).toFixed(1)}` : (n += `${r ? "L" : "M"}${s(a.m).toFixed(1)},${m.toFixed(1)}`, c + 1 === e.length && (n += `L${s(h).toFixed(1)},${m.toFixed(1)}`)), r = !0;
    }), n;
  }
  render() {
    if (!this.hass || !this.data) return d;
    const e = T(this._lang), t = this._model, s = ie(this.hass, this.entityId);
    let i;
    return this._failed ? i = l`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((o) => o.v !== null) && !t.applied.some((o) => o.v !== null) && !t.measured.some((o) => o.v !== null) ? i = l`<div class="note">${e.no_data}</div>` : i = this._renderChart(t, s) : i = l`<div class="note">${e.chart_loading}</div>`, l`<div class="box">${i}</div>${t ? this._legend(t) : d}`;
  }
  _legend(e) {
    const t = T(this._lang), s = (i, o) => l`<span class="key"><i class=${i}></i>${o}</span>`;
    return l`<div class="legend">
      ${s("planned", t.planned)}
      ${e.applied.some((i) => i.v !== null) ? s("applied", t.applied) : d}
      ${e.measured.some((i) => i.v !== null) ? s("measured", t.measured) : d}
      ${e.win.length ? s("zone win", t.window_open) : d}
      ${e.heat.length ? s("zone heat", t.heating) : d}
      ${e.over.length ? s("zone over", t.overridden) : d}
    </div>`;
  }
  _renderChart(e, t) {
    const s = T(this._lang), i = this._width, o = Mi, n = (g) => S.l + g / e.span * (i - S.l - S.r), r = (g) => S.t + (1 - (g - e.lo) / (e.hi - e.lo)) * (o - S.t - S.b), { startMs: a } = _e(this.date, this._tz), c = [0, 1, 2, 3].map((g) => e.lo + (e.hi - e.lo) * g / 3), h = [];
    for (let g = 0; g <= e.span; g += 180) h.push(g);
    const m = (g, P) => g.map(([A, V]) => Mt`<rect class="z ${P}" x=${n(A)} y=${S.t} width=${Math.max(1, n(V) - n(A))}
        height=${o - S.t - S.b}></rect>`), _ = this._cursor;
    let v = d, w = d, x = "";
    if (_ !== null) {
      const g = e.planned.find((I) => _ >= I.s && _ < I.e), P = [];
      P.push([s.planned, `${this._fmt((g == null ? void 0 : g.v) ?? null, e.unit)}${g != null && g.label ? " · " + g.label : ""}`]), _ <= e.pastEnd && (e.applied.some((I) => I.v !== null) && P.push([s.applied, this._fmt(this._valueAt(e.applied, _), e.unit)]), e.measured.some((I) => I.v !== null) && P.push([s.measured, this._fmt(this._valueAt(e.measured, _), e.unit)]));
      const A = [], V = (I) => I.some(([mt, Ae]) => _ >= mt && _ < Ae);
      V(e.win) && A.push(s.window_open), V(e.heat) && A.push(s.heating), V(e.over) && A.push(s.overridden), x = `${this._clock(_)} — ${P.map(([I, mt]) => `${I} ${mt}`).join(", ")}${A.length ? ", " + A.join(", ") : ""}`;
      const re = Math.min(Math.max(n(_), 70), i - 70);
      w = Mt`<line class="cursor" x1=${n(_)} x2=${n(_)} y1=${S.t} y2=${o - S.b}></line>`, v = l`<div class="tip" style="left:${re}px">
        <b>${this._clock(_)}</b>
        ${P.map(([I, mt]) => l`<div><span>${I}</span> ${mt}</div>`)}
        ${A.map((I) => l`<div class="flag">${I}</div>`)}
      </div>`;
    }
    const ct = e.isToday ? Mt`<line class="now" x1=${n(e.pastEnd)} x2=${n(e.pastEnd)} y1=${S.t} y2=${o - S.b}></line>` : d;
    return l`
      <svg width=${i} height=${o} viewBox="0 0 ${i} ${o}" tabindex="0" role="application"
        aria-label=${C(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(g) => g.pointerType === "mouse" || g.buttons ? this._pointer(g) : void 0}
        @pointerleave=${(g) => {
      g.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${c.map((g) => Mt`<line class="grid" x1=${S.l} x2=${i - S.r} y1=${r(g)} y2=${r(g)}></line>
          <text class="ylab" x=${S.l - 4} y=${r(g) + 3} text-anchor="end">${Number(g.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${h.map((g) => Mt`<text class="xlab" x=${n(g)} y=${o - 6}
          text-anchor=${g === 0 ? "start" : "middle"}>${Math.floor(bt(new Date(a + g * 6e4), this._tz) / 60)}h</text>`)}
        ${m(e.win, "win")}${m(e.heat, "heat")}${m(e.over, "over")}
        ${e.planned.map((g, P) => {
      const A = e.planned[P - 1];
      return g.v === null ? d : Mt`
            ${A && A.v !== null ? Mt`<line class="riser" x1=${n(g.s)} x2=${n(g.s)} y1=${r(A.v)} y2=${r(g.v)}></line>` : d}
            <line class="plan" x1=${n(g.s)} x2=${n(g.e)} y1=${r(g.v)} y2=${r(g.v)} style="stroke:${g.color}"></line>`;
    })}
        <path class="applied" d=${this._path(e.applied, e, n, r, !0)}></path>
        <path class="measured" d=${this._path(e.measured, e, n, r, !1)}></path>
        ${ct}${w}
        <rect class="hit" x=${S.l} y=${S.t} width=${i - S.l - S.r} height=${o - S.t - S.b}></rect>
      </svg>
      ${v}
      <div class="sr" aria-live="polite">${x}</div>`;
  }
};
B.styles = R`
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
], B.prototype, "hass", 2);
it([
  f({ attribute: !1 })
], B.prototype, "data", 2);
it([
  f({ attribute: !1 })
], B.prototype, "program", 2);
it([
  f({ attribute: "entity-id" })
], B.prototype, "entityId", 2);
it([
  f()
], B.prototype, "date", 2);
it([
  f({ attribute: !1 })
], B.prototype, "slots", 2);
it([
  u()
], B.prototype, "_width", 2);
it([
  u()
], B.prototype, "_loaded", 2);
it([
  u()
], B.prototype, "_failed", 2);
it([
  u()
], B.prototype, "_cursor", 2);
B = it([
  N("wp-chart")
], B);
const Mi = 160, S = { l: 38, r: 10, t: 10, b: 22 };
function Z(e, t) {
  var o, n;
  const s = (n = (o = e.states[t]) == null ? void 0 : o.attributes) == null ? void 0 : n.friendly_name;
  if (typeof s == "string" && s) return s;
  const i = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return i ? i.charAt(0).toUpperCase() + i.slice(1) : t;
}
const Is = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);
function Oi(e) {
  return e.composedPath().some((t) => t instanceof HTMLElement && Is.has(t.tagName));
}
class Rs {
  constructor(t = 60) {
    this.threshold = t, this.id = -1, this.sx = 0, this.sy = 0;
  }
  down(t) {
    t.pointerType === "mouse" || !t.isPrimary || Oi(t) || (this.id = t.pointerId, this.sx = t.clientX, this.sy = t.clientY);
  }
  /** -1 = swiped right (previous), 1 = swiped left (next), 0 = nothing. */
  up(t) {
    if (t.pointerId !== this.id) return 0;
    this.id = -1;
    const s = t.clientX - this.sx, i = t.clientY - this.sy;
    return Math.abs(s) < this.threshold || Math.abs(i) > Math.abs(s) * Math.tan(Math.PI / 6) ? 0 : s < 0 ? 1 : -1;
  }
  cancel() {
    this.id = -1;
  }
}
class Ti {
  constructor(t, s = 500) {
    this.onFire = t, this.delay = s, this.timer = 0, this.sx = 0, this.sy = 0, this.fired = !1;
  }
  down(t) {
    t.pointerType === "mouse" && t.button !== 0 || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "BUTTON" || Is.has(s.tagName))) || (this.cancel(), this.fired = !1, this.sx = t.clientX, this.sy = t.clientY, this.timer = window.setTimeout(() => {
      var s;
      this.timer = 0, this.fired = !0;
      try {
        (s = navigator.vibrate) == null || s.call(navigator, 15);
      } catch {
      }
      this.onFire(t);
    }, this.delay));
  }
  move(t) {
    this.timer && Math.hypot(t.clientX - this.sx, t.clientY - this.sy) > 10 && this.cancel();
  }
  cancel() {
    this.timer && window.clearTimeout(this.timer), this.timer = 0;
  }
}
const bs = /* @__PURE__ */ new WeakSet();
function Us(e) {
  if (!e || bs.has(e)) return;
  bs.add(e);
  const t = () => {
    e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  };
  e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
const Ls = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var zi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, at = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Di(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && zi(t, s, o), o;
};
const ws = 7;
let J = class extends M {
  constructor() {
    super(...arguments), this.day = 0, this.showChart = !0, this._offset = null, this._open = !0, this._slots = null, this._loadedDate = "", this._editing = !1, this._token = 0, this._swipe = new Rs(60), this._previews = /* @__PURE__ */ new Map(), this._closed = (e) => {
      e.stopPropagation(), this._open = !1, this._editing || this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0 }));
    };
  }
  get _lang() {
    var e;
    return ((e = this.hass.locale) == null ? void 0 : e.language) ?? this.hass.language ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  get _today() {
    return wt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Ns(this._today, this._offset ?? 0);
  }
  willUpdate(e) {
    this._offset === null && this.hass && (this._offset = (this.day - Lt(this._today) + 7) % 7), this._offset !== null && this.hass && this.program && (e.has("_offset") || e.has("program") || e.has("hass") && !this._loadedDate) && this._loadPreview();
  }
  async _loadPreview() {
    const e = this._date, t = `${this.program.id}|${this.program.revision}|${e}`;
    if (this._previews.has(t)) {
      this._slots = this._previews.get(t) ?? null, this._loadedDate = e;
      return;
    }
    const s = ++this._token;
    try {
      const i = await this.hass.callWS({
        type: "weekly_planner/preview",
        program_id: this.program.id,
        date: e
      });
      if (s !== this._token) return;
      this._previews.set(t, i.slots), this._slots = i.slots;
    } catch {
      if (s !== this._token) return;
      this._slots = null;
    }
    this._loadedDate = e;
  }
  _go(e) {
    const t = (this._offset ?? 0) + e;
    t < -14 || t > ws || (this._loadedDate = "", this._slots = null, this._offset = t);
  }
  /** Swipe left = next day, swipe right = previous day (buttons in the header do the same). */
  _swiped(e) {
    const t = this._swipe.up(e);
    t && this._go(t);
  }
  _edit() {
    this._editing = !0, this.dispatchEvent(new CustomEvent("edit-day", {
      detail: { day: Lt(this._date) },
      bubbles: !0,
      composed: !0
    })), this._open = !1;
  }
  // ---- content ----
  _modeSetpoint(e, t) {
    var s;
    return e ? ((s = e.exceptions) == null ? void 0 : s[t]) ?? e.value : null;
  }
  _setpointText(e) {
    const t = T(this._lang);
    if (!e) return "–";
    switch (e.kind) {
      case "temperature":
        return `${e.temperature} °C`;
      case "preset":
        return String(e.preset);
      case "position":
        return `${e.position} %`;
      case "open":
        return t.sp_open;
      case "close":
        return t.sp_close;
      case "on":
        return typeof e.brightness == "number" ? `${e.brightness} %` : t.sp_on;
      case "off":
        return t.sp_off;
      case "auto":
        return t.sp_auto;
      case "value":
        return String(e.value);
      case "option":
        return String(e.option);
      default:
        return e.kind;
    }
  }
  _bars(e, t) {
    const s = T(this._lang), i = xt(this.program, this.data), o = this.data.modes, n = Lt(e), r = [];
    for (const { slot: c, end: h } of ke(i.days[(n + 6) % 7]))
      r.push({ start: 0, end: h, color: dt(c, this.program, o), label: jt(c, this.program, o, this._lang) });
    const a = (c) => s[`reason_${c}`] ?? c;
    for (const c of i.days[n]) {
      const h = t == null ? void 0 : t.find((x) => x.slot_id === c.id);
      let m = E(c.start), _ = E(c.end ?? null);
      if (t) {
        if (!h) continue;
        m = this._minutesOf(h.start, e), _ = h.end ? this._minutesOf(h.end, e) : null;
      }
      if (m === null) continue;
      const v = _ === null ? m + 10 : _ > m ? _ : b, w = jt(c, this.program, o, this._lang);
      r.push({
        start: m,
        end: Math.min(b, v),
        color: dt(c, this.program, o),
        label: h != null && h.ignored ? `${w} — ${a(h.ignored)}` : w,
        sun: (h == null ? void 0 : h.sun) ?? ("sun" in c.start || !!(c.end && "sun" in c.end)),
        ignored: (h == null ? void 0 : h.ignored) ?? null
      });
    }
    return r;
  }
  /** Minutes since local midnight of `date`; capped to 1440 when the instant is on a later day. */
  _minutesOf(e, t) {
    return wt(new Date(e), this._tz) > t ? b : bt(e, this._tz);
  }
  _rows(e, t) {
    const s = xt(this.program, this.data), i = Lt(e), o = [];
    for (const n of s.days[i]) {
      const r = t == null ? void 0 : t.find((h) => h.slot_id === n.id);
      if (t && !r) continue;
      const a = r ? this._minutesOf(r.start, e) : E(n.start) ?? 0, c = (h) => h === null ? "" : `${String(Math.floor(h / 60) % 24).padStart(2, "0")}:${String(h % 60).padStart(2, "0")}`;
      o.push({
        slot: n,
        r,
        startM: a,
        start: r ? He(r.start, this._tz, this._lang) : c(E(n.start)),
        end: r ? r.end ? He(r.end, this._tz, this._lang) : "" : c(E(n.end ?? null))
      });
    }
    return o.sort((n, r) => n.startM - r.startM);
  }
  _entityTexts(e) {
    const t = this.data.modes;
    return this.program.entities.map((s) => {
      const i = e.actions.by_entity[s.entity_id], o = t.find((r) => r.id === e.actions.by_type[k(s.entity_id)]), n = i ?? this._modeSetpoint(o, s.entity_id);
      return { entityId: s.entity_id, mode: i ? void 0 : o, text: this._setpointText(n) };
    });
  }
  render() {
    if (!this.hass || !this.data || !this.program || this._offset === null) return d;
    const e = T(this._lang), t = this._date, s = Lt(t), [i, o, n] = t.split("-").map(Number), r = new Intl.DateTimeFormat(this._lang, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(i, o - 1, n, 12))), a = this._loadedDate === t, c = a ? this._slots : null, h = this._offset === 0, m = h ? bt(/* @__PURE__ */ new Date(), this._tz) : null, _ = a ? this._rows(t, c) : [];
    return l`
      <wp-dialog wide ?open=${this._open} heading="${e.days[s]} ${r}"
        @closed=${this._closed}>
        <button slot="header-start" class="nav" ?disabled=${this._offset <= -14}
          aria-label=${e.previous_day} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button slot="header-actions" class="nav" ?disabled=${this._offset >= ws}
          aria-label=${e.next_day} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <div class="swipe" @pointerdown=${(v) => this._swipe.down(v)}
          @pointerup=${(v) => this._swiped(v)} @pointercancel=${() => this._swipe.cancel()}>
        <div class="program">${this.program.name}${h ? l` <span class="badge">${e.today}</span>` : d}</div>
        <wp-day-bar show-hours .spans=${a ? this._bars(t, c) : []} .now=${m}></wp-day-bar>
        ${a && !_.length ? l`<p class="empty">${e.no_slot_day}</p>` : d}
        <ul class="slots">
          ${_.map((v) => {
      var w, x, ct;
      return l`
            <li class=${(w = v.r) != null && w.ignored ? "ignored" : ""}>
              <div class="time">${(x = v.r) != null && x.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : d}${v.start}${v.end ? l` <ha-icon icon="mdi:arrow-right"></ha-icon> ${v.end}` : d}</div>
              <div class="what">
                ${this._entityTexts(v.slot).map((g) => l`
                  <div class="line">
                    <span class="name">${Z(this.hass, g.entityId)}</span>
                    ${g.mode ? l`<span class="pill" style="background:${v.slot.color || g.mode.color}">${g.mode.name}</span>` : d}
                    <span class="val">${g.text}</span>
                  </div>`)}
                ${(ct = v.r) != null && ct.ignored ? l`<div class="why">${e[`reason_${v.r.ignored}`] ?? v.r.ignored}</div>` : d}
              </div>
            </li>`;
    })}
        </ul>
        ${this.showChart && a ? this.program.entities.map((v) => l`
            <section class="chart">
              <h3>${Z(this.hass, v.entity_id)}</h3>
              <wp-chart .hass=${this.hass} .data=${this.data} .program=${this.program}
                .entityId=${v.entity_id} .date=${t} .slots=${c}></wp-chart>
            </section>`) : d}
        </div>
        ${this.data.can_edit ? l`<button slot="footer" class="primary wide" @click=${this._edit}><ha-icon icon="mdi:pencil"></ha-icon> ${e.edit}</button>` : d}
      </wp-dialog>
    `;
  }
};
J.styles = R`
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
at([
  f({ attribute: !1 })
], J.prototype, "hass", 2);
at([
  f({ attribute: !1 })
], J.prototype, "data", 2);
at([
  f({ attribute: !1 })
], J.prototype, "program", 2);
at([
  f({ type: Number })
], J.prototype, "day", 2);
at([
  f({ type: Boolean })
], J.prototype, "showChart", 2);
at([
  u()
], J.prototype, "_offset", 2);
at([
  u()
], J.prototype, "_open", 2);
at([
  u()
], J.prototype, "_slots", 2);
at([
  u()
], J.prototype, "_loadedDate", 2);
J = at([
  N("wp-day-view")
], J);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ji = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Ni = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, s, i) {
    this._$Ct = t, this._$AM = s, this._$Ci = i;
  }
  _$AS(t, s) {
    return this.update(t, s);
  }
  update(t, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ii = {}, Ri = (e, t = Ii) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ui = ji(class extends Ni {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (Ri(e), this.key = t), s;
  }
});
var Li = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, Ee = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Fi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Li(t, s, o), o;
};
let qt = class extends M {
  constructor() {
    super(...arguments), this.message = "", this.confirmLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (e) => {
      e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
    };
  }
  _choose(e) {
    var t;
    this._result = e, (t = this.renderRoot.querySelector("wp-dialog")) == null || t.close();
  }
  render() {
    const e = T(this.lang);
    return l`
      <wp-dialog open heading=${e.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${e.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }
};
qt.styles = R`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
Ee([
  f()
], qt.prototype, "message", 2);
Ee([
  f({ attribute: "confirm-label" })
], qt.prototype, "confirmLabel", 2);
Ee([
  f()
], qt.prototype, "lang", 2);
qt = Ee([
  N("wp-confirm")
], qt);
function kt(e, t, s) {
  return new Promise((i) => {
    var r;
    const o = document.createElement("wp-confirm");
    o.message = t, o.confirmLabel = s;
    const n = e.hass;
    o.lang = ((r = n == null ? void 0 : n.locale) == null ? void 0 : r.language) ?? (n == null ? void 0 : n.language) ?? (document.documentElement.lang || "en"), o.addEventListener("choice", (a) => {
      o.remove(), i(!!a.detail);
    }), (e.shadowRoot ?? e).appendChild(o);
  });
}
var Hi = Object.defineProperty, Wi = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Wi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Hi(t, s, o), o;
};
const qi = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Bi = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Nt(e, t) {
  var o;
  if ("time" in t) return G(t.time);
  const s = (o = e.states["sun.sun"]) == null ? void 0 : o.attributes[qi[t.sun]];
  let i = s ? bt(s, e.config.time_zone) : Bi[t.sun];
  return i += t.offset ?? 0, t.earliest && (i = Math.max(i, G(t.earliest))), t.latest && (i = Math.min(i, G(t.latest))), Math.max(0, Math.min(b, i));
}
function Be(e) {
  const t = E(e.start);
  if (t === null || !e.end) return null;
  const s = E(e.end);
  return s === null ? null : s > t ? [t, s] : [t, b];
}
function be(e) {
  const t = e.map((s) => ({ slot: s, iv: Be(s) })).filter((s) => s.iv !== null).sort((s, i) => s.iv[0] - i.iv[0]);
  for (let s = 1; s < t.length; s++)
    if (t[s].iv[0] < t[s - 1].iv[1]) return [t[s - 1].slot, t[s].slot];
  return null;
}
function we(e, t) {
  return [...t].sort((s, i) => Nt(e, s.start) - Nt(e, i.start));
}
function ft(e, t, s) {
  const i = (o) => {
    if ("time" in o) return o.time;
    const n = o.offset ? ` ${o.offset > 0 ? "+" : "−"}${Math.abs(o.offset)} min` : "";
    return `${C(s, `sun_${o.sun}`)}${n} (≈${Y(Nt(e, o))})`;
  };
  return t.end ? `${i(t.start)} – ${i(t.end)}` : `${i(t.start)} · ${C(s, "one_shot")}`;
}
function Fs(e, t, s, i, o) {
  const n = st(e), r = [];
  o > 0 && r.push({ start: 0, end: o, color: "var(--secondary-text-color)", label: C(n, "previous_day"), ignored: "spill" });
  for (const a of i) {
    const c = Nt(e, a.start), h = a.end ? Nt(e, a.end) : null, [[m, _]] = pi(a, { start: c, end: h }), v = !("time" in a.start) || !!(a.end && !("time" in a.end));
    r.push({
      start: m,
      end: _,
      sun: v,
      color: dt(a, s, t.modes),
      label: `${jt(a, s, t.modes, n)} ${ft(e, a, n)}`
    });
  }
  return r;
}
let H = class extends M {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "", this._zoom = 1, this._lp = new Ti(() => {
      this._lpSlot && (this._menu = this._lpSlot);
    }), this._pts = /* @__PURE__ */ new Map();
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), s = (i, o) => t.set(i, [...t.get(i) ?? [], o]);
    for (const i of e) {
      const o = E(i.start);
      o !== null && s(o, { id: i.id, which: "start" });
      const n = E(i.end ?? null);
      o !== null && n !== null && n > o && s(n, { id: i.id, which: "end" });
    }
    return [...t.entries()].map(([i, o]) => ({ key: o.map((n) => n.id + n.which).join("|"), min: i, refs: o }));
  }
  _bounds(e, t, s) {
    let i = 0, o = b;
    for (const a of t) {
      const c = e.find((v) => v.id === a.id);
      if (!c) continue;
      const h = E(c.start) ?? 0, m = c.end ? E(c.end) : null, _ = m !== null && m <= h;
      a.which === "start" ? (m !== null && !_ ? o = Math.min(o, m - F) : o = Math.min(o, b - F), _ && (i = Math.max(i, m))) : _ ? (i = Math.max(i, F), o = Math.min(o, h)) : i = Math.max(i, h + F);
    }
    const n = new Set(t.map((a) => a.id));
    if (!t.every((a) => {
      const c = e.find((h) => h.id === a.id);
      return a.which === "start" && !(c != null && c.end);
    }))
      for (const a of e) {
        if (n.has(a.id)) continue;
        const c = Be(a);
        c && (c[1] <= s ? i = Math.max(i, c[1]) : c[0] >= s && (o = Math.min(o, c[0])));
      }
    return [i, o];
  }
  _apply(e, t, s) {
    const i = { time: Y(s) };
    return e.map((o) => {
      const n = t.find((r) => r.id === o.id);
      return n ? n.which === "start" ? { ...o, start: i } : { ...o, end: i } : o;
    });
  }
  _emitSlots(e) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _snap(e) {
    return Math.round(e / F) * F;
  }
  /* ---- drag ---- */
  _down(e, t) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [i, o] = this._bounds(this.slots, t.refs, t.min);
    this._drag = { refs: t.refs, lo: i, hi: o, min: t.min, moved: !1 }, this._dragSlots = this.slots, e.preventDefault();
  }
  _move(e) {
    const t = this._drag, s = this.renderRoot.querySelector(".track");
    if (!t || !s) return;
    const i = s.getBoundingClientRect(), o = (e.clientX - i.left) / i.width * b, n = Math.max(t.lo, Math.min(t.hi, this._snap(o)));
    n !== t.min && (this._drag = { ...t, min: n, moved: !0 }, this._dragSlots = this._apply(this.slots, t.refs, n));
  }
  _up(e) {
    var o;
    const t = this._drag, s = e.currentTarget;
    (o = s.hasPointerCapture) != null && o.call(s, e.pointerId) && s.releasePointerCapture(e.pointerId);
    const i = this._dragSlots;
    this._drag = void 0, this._dragSlots = void 0, t != null && t.moved && i && this._emitSlots(i);
  }
  _cancel() {
    this._drag = void 0, this._dragSlots = void 0;
  }
  /* ---- pinch to zoom (buttons ± do the same) ---- */
  _scroller() {
    return this.renderRoot.querySelector(".wrap");
  }
  async _setZoom(e, t) {
    const s = Math.round(Math.max(1, Math.min(4, e)) * 100) / 100;
    if (s === this._zoom) return;
    const i = this._scroller();
    let o = 0, n = 0;
    if (i) {
      const r = i.getBoundingClientRect();
      n = (t ?? r.left + r.width / 2) - r.left, o = (i.scrollLeft + n) / Math.max(1, i.scrollWidth);
    }
    this._zoom = s, await this.updateComplete, i && (i.scrollLeft = o * i.scrollWidth - n);
  }
  _pdown(e) {
    if (!(e.pointerType === "mouse" || this._drag) && !e.composedPath().some((t) => t instanceof HTMLElement && t.classList.contains("handle")) && (this._pts.set(e.pointerId, { x: e.clientX, y: e.clientY }), this._pts.size === 2)) {
      const [t, s] = [...this._pts.values()];
      this._pinch = { d0: Math.hypot(t.x - s.x, t.y - s.y) || 1, z0: this._zoom };
    }
  }
  _pmove(e) {
    if (this._pts.has(e.pointerId) && (this._pts.set(e.pointerId, { x: e.clientX, y: e.clientY }), this._pinch && this._pts.size === 2 && !this._drag)) {
      const [t, s] = [...this._pts.values()], i = Math.hypot(t.x - s.x, t.y - s.y);
      this._setZoom(this._pinch.z0 * (i / this._pinch.d0), (t.x + s.x) / 2);
    }
  }
  _pup(e) {
    this._pts.delete(e.pointerId), this._pts.size < 2 && (this._pinch = void 0);
  }
  /* ---- long press menu / delete ---- */
  _slotDown(e, t) {
    this._lpSlot = t, this._lp.down(e);
  }
  async _remove(e) {
    const t = this._tr("confirm_delete_slot", { time: ft(this.hass, e, this._lang) });
    await kt(this, t, this._tr("delete")) && this._emitSlots(this.slots.filter((s) => s.id !== e.id));
  }
  _menuDo(e) {
    const t = this._menu;
    this._menu = void 0, t && (e === "edit" ? this._edit(t, !1) : e === "copy" ? this.dispatchEvent(new CustomEvent("copy-slot", { detail: { slot: t }, bubbles: !0, composed: !0 })) : this._remove(t));
  }
  /* ---- keyboard / buttons ---- */
  _nudge(e, t, s) {
    const [i, o] = this._bounds(this.slots, e, t), n = Math.max(i, Math.min(o, this._snap(t + s)));
    n !== t && (this._notice = "", this._emitSlots(this._apply(this.slots, e, n)));
  }
  _onKey(e, t) {
    const s = e.shiftKey ? 60 : F;
    let i = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") i = -s;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") i = s;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, i);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((o) => o.type === yt(this.program)), t = this._slots.map(Be).filter((o) => o !== null).sort((o, n) => o[0] - n[0]);
    let s = 480;
    for (const [o, n] of t) s >= o && s < n && (s = n);
    s > b - 60 && (s = b - 60);
    const i = Math.min(b, s + 60);
    return {
      id: vt(),
      start: { time: Y(s) },
      end: { time: Y(i) },
      conditions: [],
      actions: { by_type: e[0] ? { [yt(this.program)]: e[0].id } : {}, by_entity: {} }
    };
  }
  _edit(e, t) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: e, isNew: t }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(e, t) {
    const s = e.find((i) => i.id === t);
    return s ? ft(this.hass, s, this._lang) : "";
  }
  _actionText(e) {
    const t = ne(e, this.program, this.data.modes), s = Object.values(e.actions.by_type).map((o) => {
      var n;
      return (n = this.data.modes.find((r) => r.id === o)) == null ? void 0 : n.name;
    }).filter(Boolean);
    if (s.length) return s.join(" · ");
    const i = Object.keys(e.actions.by_entity).map((o) => Z(this.hass, o));
    return (t == null ? void 0 : t.name) ?? (i.length ? i.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, s) {
    if (!s) return l`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in s))
      return l`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${ft(this.hass, { ...e, start: s, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const i = G(s.time), o = [{ id: e.id, which: t }], [n, r] = this._bounds(this._slots, o, i), a = this._tr(t === "start" ? "slot_start" : "slot_end");
    return l`
      <span class="stepper">
        <button class="ibtn" ?disabled=${i - F < n} @click=${() => this._nudge(o, i, -F)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${s.time}</span>
        <button class="ibtn" ?disabled=${i + F > r} @click=${() => this._nudge(o, i, F)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = Fs(this.hass, this.data, this.program, e, this.spill), s = this._edges(e), i = (r) => `${r / b * 100}%`, o = this._drag, n = we(this.hass, e);
    return l`
      <div class="wrap" @pointerdown=${this._pdown} @pointermove=${this._pmove} @pointerup=${this._pup}
        @pointercancel=${this._pup}>
        <div class="track" style="width:${this._zoom * 100}%">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${s.map((r) => {
      const a = o && r.refs.some((_) => o.refs.some((v) => v.id === _.id && v.which === _.which)), [c, h] = this._bounds(e, r.refs, r.min), m = Y(r.min);
      return l`<button class="handle ${a ? "active" : ""}" style="left:${i(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((_) => `${_.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, _.id)}`).join(" / ")}
                aria-valuemin=${c} aria-valuemax=${h} aria-valuenow=${r.min} aria-valuetext=${m}
                @pointerdown=${(_) => this._down(_, r)}
                @pointermove=${(_) => this._move(_)}
                @pointerup=${(_) => this._up(_)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(_) => this._onKey(_, r)}><span class="grip"></span></button>`;
    })}
            ${o ? l`<div class="loupe" style="left:${i(o.min)}" aria-hidden="true">
                  <span>${Y(o.min)}</span></div>` : d}
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
      ${this.spill > 0 ? l`<p class="hint">${this._tr("spill_hint", { time: Y(this.spill) })}</p>` : d}
      ${this._notice ? l`<p class="error" role="alert">${this._notice}</p>` : d}
      <div class="list">
        ${n.length === 0 ? l`<p class="muted">${this._tr("no_slots")}</p>` : d}
        ${n.map(
      (r) => {
        var a;
        return l`
            <div class="slot" @pointerdown=${(c) => this._slotDown(c, r)}
              @pointermove=${(c) => this._lp.move(c)} @pointerup=${() => this._lp.cancel()}
              @pointercancel=${() => this._lp.cancel()} @contextmenu=${(c) => c.preventDefault()}>
              <span class="dot" style="background:${dt(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? l`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : l`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(a = r.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${ft(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${ft(this.hass, r, this._lang)}`}
                @click=${() => void this._remove(r)}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
      <p class="hint"><ha-icon icon="mdi:gesture-tap-hold"></ha-icon> ${this._tr("longpress_hint")}</p>
      ${this._menu ? l`<wp-dialog open heading=${ft(this.hass, this._menu, this._lang)}
            @closed=${(r) => {
      r.stopPropagation(), this._menu = void 0;
    }}>
            <div class="menu">
              <button class="btn" @click=${() => this._menuDo("edit")}><ha-icon icon="mdi:pencil"></ha-icon> ${this._tr("edit")}</button>
              <button class="btn" @click=${() => this._menuDo("copy")}><ha-icon icon="mdi:content-copy"></ha-icon> ${this._tr("copy_to")}</button>
              <button class="btn danger" @click=${() => this._menuDo("delete")}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>
            </div>
          </wp-dialog>` : d}
    `;
  }
};
H.styles = [
  rt,
  R`
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
X([
  f({ attribute: !1 })
], H.prototype, "hass", 2);
X([
  f({ attribute: !1 })
], H.prototype, "data", 2);
X([
  f({ attribute: !1 })
], H.prototype, "program", 2);
X([
  f({ attribute: !1 })
], H.prototype, "slots", 2);
X([
  f({ type: Number })
], H.prototype, "spill", 2);
X([
  f({ type: Number })
], H.prototype, "day", 2);
X([
  u()
], H.prototype, "_drag", 2);
X([
  u()
], H.prototype, "_dragSlots", 2);
X([
  u()
], H.prototype, "_notice", 2);
X([
  u()
], H.prototype, "_zoom", 2);
X([
  u()
], H.prototype, "_menu", 2);
H = X([
  N("wp-day-editor")
], H);
var Vi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, pt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ji(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Vi(t, s, o), o;
};
const Ki = ["dawn", "sunrise", "sunset", "dusk"];
let Q = class extends M {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  willUpdate(e) {
    var t, s, i, o;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (s = this._s).actions ?? (s.actions = { by_type: {}, by_entity: {} }), (i = this._s.actions).by_type ?? (i.by_type = {}), (o = this._s.actions).by_entity ?? (o.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(q(k(t.entity_id)));
    return [...e];
  }
  _update(e) {
    this._s = { ...this._s, ...e }, this._error = "";
  }
  /* ---- time specs ---- */
  _setSpec(e, t) {
    this._update({ [e]: t });
  }
  _specEditor(e, t) {
    const s = !("time" in t), i = this._tr(e === "start" ? "slot_start" : "slot_end");
    return l`
      <fieldset>
        <legend>${i}</legend>
        <div class="field">
          <select aria-label=${`${i} — ${this._tr("time_kind")}`}
            @change=${(o) => {
      const n = o.target.value === "sun";
      this._setSpec(e, n ? { sun: "sunset", offset: 0 } : { time: e === "start" ? "08:00" : "09:00" });
    }}>
            <option value="fixed" ?selected=${!s}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${s}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in t ? this._fixedEditor(e, t.time, i) : l`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(o) => this._setSpec(e, { ...t, sun: o.target.value })}>
                    ${Ki.map((o) => l`<option value=${o} ?selected=${t.sun === o}>${this._tr(`sun_${o}`)}</option>`)}
                  </select>
                </div>
                <div class="field">
                  <label>${this._tr("sun_offset")}</label>
                  <input type="number" min="-240" max="240" step="5" .value=${String(t.offset ?? 0)}
                    @change=${(o) => {
      const n = Math.max(-240, Math.min(240, Math.round(Number(o.target.value) || 0)));
      this._setSpec(e, { ...t, offset: n });
    }} />
                </div>
              </div>
              <div class="row">
                ${["earliest", "latest"].map(
      (o) => l`
                    <div class="field">
                      <label>${this._tr(o === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${t[o] ?? ""}
                          @change=${(n) => {
        const r = n.target.value, a = { ...t };
        r ? a[o] = Y(G(r)) : delete a[o], this._setSpec(e, a);
      }} />
                        ${t[o] ? l`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => {
        const n = { ...t };
        delete n[o], this._setSpec(e, n);
      }}><ha-icon icon="mdi:close"></ha-icon></button>` : d}
                      </div>
                    </div>`
    )}
              </div>`}
      </fieldset>`;
  }
  _fixedEditor(e, t, s) {
    const i = e === "end" && t === "24:00";
    return l`
      ${i ? l`<p class="time-big">24:00</p>` : l`<div class="field"><input type="time" step="300" aria-label=${s} .value=${t}
            @change=${(o) => {
      const n = o.target.value;
      n && this._setSpec(e, { time: Y(G(n)) });
    }} /></div>`}
      ${e === "end" ? l`<label class="check"><input type="checkbox" .checked=${i}
            @change=${(o) => this._setSpec("end", { time: o.target.checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>` : d}`;
  }
  /* ---- actions ---- */
  _setMode(e, t) {
    const s = { ...this._s.actions.by_type };
    t ? s[e] = t : delete s[e], this._update({ actions: { ...this._s.actions, by_type: s } });
  }
  _setDirect(e, t) {
    const s = { ...this._s.actions.by_entity };
    t ? s[e] = t : delete s[e], this._update({ actions: { ...this._s.actions, by_entity: s } });
  }
  _switchMode(e) {
    this._mode = e, e === "modes" ? this._update({ actions: { ...this._s.actions, by_entity: {} } }) : this._update({ actions: { ...this._s.actions, by_type: {} } });
  }
  _modesEditor() {
    return l`${this._types.map((e) => {
      const t = this.data.modes.filter((i) => i.type === e), s = this._s.actions.by_type[e] ?? "";
      return l`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(e) })}</label>
          <select @change=${(i) => this._setMode(e, i.target.value)}>
            <option value="" ?selected=${s === ""}>—</option>
            ${t.map((i) => l`<option value=${i.id} ?selected=${i.id === s}>${i.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }
  _typeName(e) {
    return Ce(this._lang, e);
  }
  _directEditor() {
    return l`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return l`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(s) => this._setDirect(
        e.entity_id,
        s.target.checked ? se(this.hass, e.entity_id) : null
      )} />
            <strong>${Z(this.hass, e.entity_id)}</strong></label>
          ${t ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${t}
                .admin=${!!this.data.is_admin}
                @wp-change=${(s) => {
        s.stopPropagation(), this._setDirect(e.entity_id, s.detail);
      }}></wp-setpoint-editor>` : d}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(e) => this._update({ color: e.target.value })} />
        ${this._s.color ? l`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : d}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var i;
    const e = this._s, t = "time" in e.start ? G(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === G(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= b) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const o of Object.values(e.actions.by_entity)) {
      if (o.kind === "scene" && !o.scene) return this._tr("err_incomplete");
      if (o.kind === "script" && !o.script) return this._tr("err_incomplete");
      if (o.kind === "action" && !o.action) return this._tr("err_incomplete");
    }
    if ((i = e.conditions) != null && i.some((o) => !o.entity_id)) return this._tr("err_incomplete");
    const s = be([...this.others, e]);
    if (s) {
      const o = s.find((n) => n.id !== e.id) ?? s[0];
      return this._tr("err_overlap", { slot: ft(this.hass, o, this._lang) });
    }
    return "";
  }
  _save() {
    var s, i;
    const e = this._validate();
    if (e) {
      this._error = e;
      return;
    }
    const t = structuredClone(this._s);
    t.color || delete t.color, this.dispatchEvent(new CustomEvent("wp-save", { detail: t, bubbles: !0, composed: !0 })), (i = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null || i.close();
  }
  render() {
    if (!this._s) return d;
    const e = this._s;
    return l`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", e.start)}
        <label class="check"><input type="checkbox" .checked=${!e.end}
          @change=${(t) => {
      if (t.target.checked) this._setSpec("end", null);
      else {
        const i = "time" in e.start ? G(e.start.time) : 480;
        this._setSpec("end", { time: Y(Math.min(b, i + 60)) });
      }
    }} /> ${this._tr("one_shot_check")}</label>
        ${e.end ? this._specEditor("end", e.end) : l`<p class="hint">${this._tr("one_shot_hint")}</p>`}

        <h3>${this._tr("slot_action")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("slot_action")}>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "modes"} @change=${() => this._switchMode("modes")} />
            ${this._tr("action_modes")}</label>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "direct"} @change=${() => this._switchMode("direct")} />
            ${this._tr("action_direct")}</label>
        </div>
        ${this._mode === "modes" ? this._modesEditor() : this._directEditor()}

        <h3>${this._tr("slot_conditions")}</h3>
        <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions ?? []}
          @wp-change=${(t) => {
      t.stopPropagation(), this._update({ conditions: t.detail });
    }}></wp-conditions-editor>

        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : d}
        <button slot="footer" class="btn" @click=${() => {
      var t, s;
      return (s = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
Q.styles = [
  rt,
  R`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
pt([
  f({ attribute: !1 })
], Q.prototype, "hass", 2);
pt([
  f({ attribute: !1 })
], Q.prototype, "data", 2);
pt([
  f({ attribute: !1 })
], Q.prototype, "program", 2);
pt([
  f({ attribute: !1 })
], Q.prototype, "entry", 2);
pt([
  f({ attribute: !1 })
], Q.prototype, "others", 2);
pt([
  u()
], Q.prototype, "_s", 2);
pt([
  u()
], Q.prototype, "_mode", 2);
pt([
  u()
], Q.prototype, "_error", 2);
Q = pt([
  N("wp-slot-editor")
], Q);
var Xi = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, U = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Yi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Xi(t, s, o), o;
};
const xs = () => [[], [], [], [], [], [], []];
function ue(e) {
  return e.map((t) => ({ ...structuredClone(t), id: vt() }));
}
let z = class extends M {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  _long(e) {
    return T(this._lang).days[e];
  }
  _short(e) {
    return T(this._lang).days_short[e];
  }
  /* ---- initial state ---- */
  willUpdate(e) {
    if (!(this._ready && !e.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const t = vt();
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
          active_profile: t,
          profiles: [{ id: t, name: this._tr("profile_default"), days: xs() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._dayView = this.day, this._tab = this.day !== void 0 ? "week" : "general";
    }
  }
  _activeId() {
    var s, i;
    const e = this._p, t = !this._isNew && ((s = this.data.status[e.id]) == null ? void 0 : s.active_profile) || e.active_profile;
    return ((i = e.profiles.find((o) => o.id === t)) == null ? void 0 : i.id) ?? e.profiles[0].id;
  }
  get _profile() {
    return this._p.profiles.find((e) => e.id === this._profileId) ?? this._p.profiles[0];
  }
  _patch(e) {
    this._p = { ...this._p, ...e }, this._error = "";
  }
  _types() {
    const e = /* @__PURE__ */ new Set();
    this._p.main_type && e.add(this._p.main_type);
    for (const t of this._p.entities) e.add(q(k(t.entity_id)));
    return [...e];
  }
  _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  /* ---- profile / days ---- */
  _setProfile(e) {
    this._patch({ profiles: this._p.profiles.map((t) => t.id === e.id ? e : t) });
  }
  _setDay(e, t, s = this._profileId) {
    const i = this._p.profiles.find((n) => n.id === s);
    if (!i) return;
    const o = i.days.map((n, r) => r === e ? we(this.hass, t) : n);
    this._setProfile({ ...i, days: o });
  }
  _spill(e, t) {
    const s = e.days[(t + 6) % 7] ?? [];
    return ke(s).reduce((i, o) => Math.max(i, o.end), 0);
  }
  _submitProfileForm() {
    const e = this._profileForm;
    if (!e) return;
    const t = e.name.trim(), s = this._p.profiles.some((i) => i.name === t && !(e.mode === "rename" && i.id === this._profileId));
    if (!t || s || t.length > 40) {
      this._error = this._tr("err_profile_name");
      return;
    }
    if (e.mode === "rename")
      this._setProfile({ ...this._profile, name: t });
    else {
      const i = this._profile, o = {
        id: vt(),
        name: t,
        days: e.mode === "copy" ? i.days.map(ue) : xs()
      };
      this._patch({ profiles: [...this._p.profiles, o] }), this._profileId = o.id;
    }
    this._profileForm = void 0, this._error = "";
  }
  _deleteProfile() {
    const e = this._profile, t = this._p.profiles.filter((s) => s.id !== e.id);
    this._patch({ profiles: t }), this._profileId = this._activeId(), t.some((s) => s.id === this._profileId) || (this._profileId = t[0].id);
  }
  _applyCopy() {
    const e = this._copy;
    if (!e) return;
    const t = this._profile.days[e.from] ?? [], s = e.slotId ? t.find((n) => n.id === e.slotId) : void 0, i = [];
    let o = this._p;
    for (const n of e.targets)
      n === e.from && e.profileId === this._profileId || (o = {
        ...o,
        profiles: o.profiles.map((r) => r.id !== e.profileId ? r : {
          ...r,
          days: r.days.map((a, c) => {
            if (c !== n) return a;
            if (!s) return ue(t);
            const h = we(this.hass, [...a, ...ue([s])]);
            return be(h) ? (i.push(n), a) : h;
          })
        })
      });
    this._p = o, this._copy = void 0, this._error = i.length ? this._tr("copy_slot_overlap", { days: i.map((n) => this._long(n)).join(", ") }) : "";
  }
  _saveSlot(e) {
    const t = this._dayView;
    if (t === void 0) return;
    const s = this._profile.days[t], i = s.some((o) => o.id === e.id);
    this._setDay(t, i ? s.map((o) => o.id === e.id ? e : o) : [...s, e]);
  }
  /* ---- entities ---- */
  _setEntity(e, t) {
    this._patch({ entities: this._p.entities.map((s, i) => i === e ? { ...s, ...t } : s) });
  }
  _addEntity(e) {
    if (!e || this._p.entities.some((n) => n.entity_id === e)) return;
    const t = q(k(e)), s = this.data.modes.filter((n) => n.type === t), i = s.find((n) => /eco|off|closed/.test(n.id)) ?? s[0], o = i ? { kind: "mode", value: i.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: o, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var n;
    const s = this._p.entities[e], i = q(k(s.entity_id));
    let o;
    t === "mode" && (o = ((n = this.data.modes.find((r) => r.type === i)) == null ? void 0 : n.id) ?? ""), t === "setpoint" && (o = se(this.hass, s.entity_id)), this._setEntity(e, { default: o === void 0 ? { kind: t } : { kind: t, value: o } });
  }
  /* ---- save / delete ---- */
  _validate() {
    const e = this._p;
    if (!e.name.trim()) return this._tr("err_name");
    if (!e.entities.length) return this._tr("err_no_entity");
    if (e.conditions.some((s) => !s.entity_id)) return this._tr("err_incomplete");
    const t = e.profiles.map((s) => s.name.trim());
    if (new Set(t).size !== t.length) return this._tr("err_profile_name");
    for (const s of e.profiles)
      for (let i = 0; i < 7; i++)
        if (be(s.days[i]))
          return this._tr("err_overlap_day", { profile: s.name, day: this._long(i) });
    return "";
  }
  _payload() {
    const e = structuredClone(this._p), t = new Set(e.entities.map((s) => s.entity_id));
    return e.name = e.name.trim(), e.profiles = e.profiles.map((s) => ({
      ...s,
      days: s.days.map((i) => i.map((o) => {
        const n = Object.fromEntries(Object.entries(o.actions.by_entity).filter(([r]) => t.has(r)));
        return { ...o, actions: { ...o.actions, by_entity: n } };
      }))
    })), this._isNew && delete e.id, e.main_type || (e.main_type = null), e;
  }
  _errorText(e) {
    const t = e, s = (t == null ? void 0 : t.message) ?? String(e);
    return (t == null ? void 0 : t.code) === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : (t == null ? void 0 : t.code) === "unauthorized" ? this._tr("err_unauthorized") : s.includes("overlapping_slots") ? this._tr("err_overlap_server") : s.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: s });
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
    await kt(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(e) {
    await kt(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(e) {
    var i;
    const t = (i = this._p.entities[e]) == null ? void 0 : i.entity_id;
    if (!t) return;
    const s = this._tr("confirm_delete", { name: Z(this.hass, t) });
    await kt(this, s, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((o, n) => n !== e) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = vt(), t = this._p, s = /* @__PURE__ */ new Map(), i = t.profiles.map((o) => {
      const n = o.id === this._activeId() ? e : vt();
      return s.set(o.id, n), { ...structuredClone(o), id: n, days: o.days.map(ue) };
    });
    this._p = {
      ...structuredClone(t),
      id: "",
      revision: 0,
      created_at: void 0,
      name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles: i,
      active_profile: s.get(this._activeId()) ?? i[0].id
    }, delete this._p.created_at, this._isNew = !0, this._profileId = this._p.active_profile ?? i[0].id, this._error = "";
  }
  _close() {
    var e;
    (e = this.renderRoot.querySelector("#main")) == null || e.close();
  }
  /* ---- render: tabs ---- */
  _renderGeneral() {
    const e = this._p, t = this._types();
    return l`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${e.name}
          @input=${(s) => this._patch({ name: s.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${e.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${e.icon}></ha-icon>` : d}
            <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${e.icon ?? ""}
              @input=${(s) => this._patch({ icon: s.target.value.trim() || null })} />
          </div></div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(s) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(s.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${e.enabled}
        @change=${(s) => this._patch({ enabled: s.target.checked })} /> ${this._tr("pe_enabled")}</label>
      <label class="check"><input type="checkbox" .checked=${e.reapply}
        @change=${(s) => this._patch({ reapply: s.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      ${t.length ? l`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(s) => this._patch({ main_type: s.target.value })}>
              ${t.map((s) => l`<option value=${s} ?selected=${s === (e.main_type || t[0])}>${Ce(this._lang, s)}</option>`)}
            </select></div>` : d}
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions}
        @wp-change=${(s) => {
      s.stopPropagation(), this._patch({ conditions: s.detail });
    }}></wp-conditions-editor>
    `;
  }
  updated() {
    Us(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const e = this._p;
    return l`
      ${e.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : d}
      ${e.entities.map((t, s) => this._renderEntity(t, s))}
      ${Ui(this._pickerKey, l`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${bi} .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    var a, c;
    const s = q(k(e.entity_id)), i = ((a = this.hass.states[e.entity_id]) == null ? void 0 : a.attributes) ?? {}, o = Array.isArray(i.preset_modes) && i.preset_modes.includes("permanent"), n = this.data.modes.filter((h) => h.type === s), r = ((c = e.default) == null ? void 0 : c.kind) ?? "none";
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Z(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? d : l`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Z(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(h) => this._setDefaultKind(t, h.target.value)}>
            <option value="none" ?selected=${r === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${r === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${r === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${r === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${r === "mode" ? l`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(h) => this._setEntity(t, { default: { kind: "mode", value: h.target.value } })}>
              ${n.map((h) => l`<option value=${h.id} ?selected=${h.id === e.default.value}>${h.name}</option>`)}
            </select></div>` : d}
        ${r === "setpoint" ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(h) => {
      h.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: h.detail } });
    }}></wp-setpoint-editor>` : d}
        ${o || e.force_permanent ? l`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
              @change=${(h) => this._setEntity(t, { force_permanent: h.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : d}
      </div>`;
  }
  _renderWeek() {
    const e = this._p, t = this._profile, s = this._activeId(), i = this._profileForm;
    return l`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(o) => {
      this._profileId = o.target.value, this._dayView = void 0;
    }}>
            ${e.profiles.map((o) => l`<option value=${o.id} ?selected=${o.id === t.id}>${o.name}${o.id === s ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: t.name }}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${e.profiles.length < 2 || t.id === s}
          @click=${() => void this._askDeleteProfile(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${t.id === s ? l`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : d}
      ${i ? l`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(i.mode === "rename" ? "profile_rename" : i.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${i.name}
                @input=${(o) => this._profileForm = { ...i, name: o.target.value }}
                @keydown=${(o) => {
      o.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${i.mode === "rename" ? l`<p class="hint">${this._tr("profile_rename_warning")}</p>` : d}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : d}
      ${this._dayView === void 0 ? this._renderDays(t) : this._renderDayEditor(t, this._dayView)}
    `;
  }
  _renderDays(e) {
    return l`${e.days.map((t, s) => {
      const i = Fs(this.hass, this.data, this._p, t, this._spill(e, s)), o = this._long(s);
      return l`
        <div class="dayrow">
          <button class="dname" @click=${() => this._dayView = s} aria-label=${`${this._tr("edit")} ${o}`}>${this._short(s)}</button>
          <div class="grow bar" @click=${() => this._dayView = s}><wp-day-bar .spans=${i}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${o}`} @click=${() => this._dayView = s}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${o}`} title=${this._tr("copy_day")}
            @click=${() => this._copy = { from: s, targets: [], profileId: e.id }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        </div>`;
    })}`;
  }
  _renderDayEditor(e, t) {
    return l`
      <div class="row daynav">
        <button class="btn" @click=${() => this._dayView = void 0}><ha-icon icon="mdi:arrow-left"></ha-icon> ${this._tr("week")}</button>
        <span class="grow"></span>
        <button class="ibtn" aria-label=${this._tr("previous_day")} @click=${() => this._dayView = (t + 6) % 7}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <strong>${this._long(t)}</strong>
        <button class="ibtn" aria-label=${this._tr("next_day")} @click=${() => this._dayView = (t + 1) % 7}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-day-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .day=${t}
        .slots=${e.days[t]} .spill=${this._spill(e, t)}
        @wp-change=${(s) => {
      s.stopPropagation(), this._setDay(t, s.detail);
    }}
        @edit-slot=${(s) => {
      s.stopPropagation(), this._slotEdit = s.detail;
    }}
        @copy-slot=${(s) => {
      s.stopPropagation(), this._copy = { from: t, targets: [], profileId: e.id, slotId: s.detail.slot.id };
    }}></wp-day-editor>
    `;
  }
  /* ---- render: dialogs ---- */
  _renderCopy() {
    const e = this._copy;
    if (!e) return d;
    const t = (i) => this._copy = { ...e, targets: i }, s = [0, 1, 2, 3, 4, 5, 6];
    return l`
      <wp-dialog open heading=${e.slotId ? this._tr("copy_slot") : `${this._tr("copy_day")} — ${this._long(e.from)}`}
        @closed=${(i) => {
      i.stopPropagation(), this._copy = void 0;
    }}>
        <div class="row">
          <button class="btn" @click=${() => t([0, 1, 2, 3, 4])}>${this._tr("copy_mon")} <ha-icon icon="mdi:arrow-right"></ha-icon> ${this._tr("copy_fri")}</button>
          <button class="btn" @click=${() => t([5, 6])}>${this._tr("copy_weekend")}</button>
          <button class="btn" @click=${() => t(s)}>${this._tr("copy_all")}</button>
        </div>
        <div class="row" role="group" aria-label=${this._tr("copy_choose")}>
          ${s.map((i) => l`<label class="check"><input type="checkbox" .checked=${e.targets.includes(i)}
            @change=${(o) => t(o.target.checked ? [...e.targets, i] : e.targets.filter((n) => n !== i))} />
            ${this._short(i)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(i) => this._copy = { ...e, profileId: i.target.value }}>
            ${this._p.profiles.map((i) => l`<option value=${i.id} ?selected=${i.id === e.profileId}>${i.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr(e.slotId ? "copy_slot_hint" : "copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => this._copy = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }
  render() {
    if (!this._p) return d;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], t = this._canEdit(), s = this._dayView;
    return l`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? d : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([i, o]) => l`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(o)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : d}
        ${this._isNew ? d : l`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? d : l`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!t}
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
    }}></wp-slot-editor>` : d}
    `;
  }
};
z.styles = [
  rt,
  R`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${Ke(Ls)}
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
U([
  f({ attribute: !1 })
], z.prototype, "hass", 2);
U([
  f({ attribute: !1 })
], z.prototype, "data", 2);
U([
  f({ attribute: !1 })
], z.prototype, "program", 2);
U([
  f({ attribute: !1 })
], z.prototype, "defaultTypes", 2);
U([
  f({ type: Number })
], z.prototype, "day", 2);
U([
  u()
], z.prototype, "_p", 2);
U([
  u()
], z.prototype, "_isNew", 2);
U([
  u()
], z.prototype, "_tab", 2);
U([
  u()
], z.prototype, "_profileId", 2);
U([
  u()
], z.prototype, "_dayView", 2);
U([
  u()
], z.prototype, "_slotEdit", 2);
U([
  u()
], z.prototype, "_error", 2);
U([
  u()
], z.prototype, "_saving", 2);
U([
  u()
], z.prototype, "_copy", 2);
U([
  u()
], z.prototype, "_profileForm", 2);
z = U([
  N("wp-program-editor")
], z);
var Gi = Object.defineProperty, Zi = Object.getOwnPropertyDescriptor, L = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Zi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Gi(t, s, o), o;
};
const ks = 7 * 24 * 3600 * 1e3;
function Qi(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(e), i = (n) => {
    var r;
    return Number(((r = s.find((a) => a.type === n)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(i("year"), i("month") - 1, i("day"), i("hour"), i("minute"), i("second")) - Math.floor(e.getTime() / 1e3) * 1e3;
}
function Le(e, t, s) {
  const [i, o, n] = e.split("-").map(Number), [r, a] = t.split(":").map(Number), c = Date.UTC(i, o - 1, n, r, a);
  let h = c;
  for (let m = 0; m < 3; m++) h = c - Qi(new Date(h), s);
  return new Date(h);
}
function Ss(e, t) {
  const [s, i, o] = e.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, o + t)).toISOString().slice(0, 10);
}
let j = class extends M {
  constructor() {
    super(...arguments), this._sel = [], this._how = "setpoint", this._sp = null, this._modeId = "", this._dur = "next", this._hours = 1, this._minutes = 0, this._untilTime = "18:00", this._untilDate = "", this._error = "", this._busy = !1, this._init = !1;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  willUpdate() {
    if (this._init || !this.program) return;
    this._init = !0;
    const e = this.program.entities.map((s) => s.entity_id), t = q(k(e[0] ?? ""));
    this._sel = e.filter((s) => q(k(s)) === t);
  }
  get _rep() {
    var e;
    return this._sel[0] ?? ((e = this.program.entities[0]) == null ? void 0 : e.entity_id) ?? "";
  }
  get _sameType() {
    return new Set(this._sel.map((e) => q(k(e)))).size <= 1;
  }
  get _modes() {
    const e = q(k(this._rep));
    return this.data.modes.filter((t) => t.type === e);
  }
  _toggle(e, t) {
    this._sel = t ? [...this._sel, e] : this._sel.filter((s) => s !== e), this._sp = null, this._modeId = "", this._error = "";
  }
  _timing() {
    if (this._dur === "next") return {};
    if (this._dur === "for") {
      const i = Math.max(0, Math.floor(this._hours || 0)), o = Math.max(0, Math.floor(this._minutes || 0)), n = (i * 60 + o) * 6e4;
      return n <= 0 ? this._tr("ov_err_duration") : n > ks ? this._tr("ov_err_week") : { duration: { hours: i, minutes: o } };
    }
    const e = this.hass.config.time_zone, t = /* @__PURE__ */ new Date();
    let s;
    if (this._untilDate)
      s = Le(this._untilDate, this._untilTime, e);
    else {
      const i = wt(t, e);
      s = Le(i, this._untilTime, e), s <= t && (s = Le(Ss(i, 1), this._untilTime, e));
    }
    return s.getTime() <= t.getTime() ? this._tr("ov_err_past") : s.getTime() - t.getTime() > ks ? this._tr("ov_err_week") : { until: s.toISOString() };
  }
  async _apply() {
    var s, i, o;
    if (!this._sel.length) {
      this._error = this._tr("ov_err_no_entity");
      return;
    }
    if (!this._sameType) {
      this._error = this._tr("ov_err_mixed");
      return;
    }
    const e = this._timing();
    if (typeof e == "string") {
      this._error = e;
      return;
    }
    const t = /* @__PURE__ */ new Map();
    if (this._how === "mode") {
      const n = this._modes.find((r) => r.id === this._modeId);
      if (!n) {
        this._error = this._tr("ov_err_no_setpoint");
        return;
      }
      for (const r of this._sel) {
        const a = ((s = n.exceptions) == null ? void 0 : s[r]) ?? n.value, c = JSON.stringify(a), h = t.get(c) ?? { entity_id: [], setpoint: a };
        h.entity_id.push(r), t.set(c, h);
      }
    } else {
      const n = this._sp ?? se(this.hass, this._rep);
      t.set("sp", { entity_id: [...this._sel], setpoint: n });
    }
    this._busy = !0;
    try {
      for (const n of t.values())
        await this.hass.callService("weekly_planner", "override", { ...n, ...e });
      (o = (i = this.shadowRoot) == null ? void 0 : i.querySelector("wp-dialog")) == null || o.close();
    } catch (n) {
      this._error = this._tr("error", { message: (n == null ? void 0 : n.message) ?? String(n) });
    } finally {
      this._busy = !1;
    }
  }
  async _resume(e) {
    try {
      await this.hass.callService("weekly_planner", "resume", { entity_id: [e] });
    } catch (t) {
      this._error = this._tr("error", { message: (t == null ? void 0 : t.message) ?? String(t) });
    }
  }
  _current() {
    const e = this.program.entities.map((s) => {
      var i;
      return { id: s.entity_id, o: (i = this.data.entities[s.entity_id]) == null ? void 0 : i.override };
    }).filter((s) => s.o);
    if (!e.length) return d;
    const t = this.hass.config.time_zone;
    return l`
      <h3>${this._tr("ov_current")}</h3>
      ${e.map(({ id: s, o: i }) => l`
        <div class="card row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${ie(this.hass, s)}</strong>
            <div class="muted small">${i.origin === "voluntary" && i.until ? this._tr("overridden_until", { time: He(i.until, t, this._lang) }) : i.origin === "voluntary" ? this._tr("ov_until_next") : this._tr("overridden")}</div></div>
          <button class="btn" @click=${() => void this._resume(s)}>${this._tr("resume")}</button>
        </div>`)}`;
  }
  render() {
    if (!this.program || !this.data) return d;
    const e = this.data.can_edit && !this.data.read_only, t = this._modes;
    return l`
      <wp-dialog open heading=${`${this._tr("override")} — ${this.program.name}`}>
        ${this._current()}
        <h3>${this._tr("ov_entities")}</h3>
        <div role="group" aria-label=${this._tr("ov_entities")}>
          ${this.program.entities.map((s) => l`
            <label class="check"><input type="checkbox" .checked=${this._sel.includes(s.entity_id)}
              @change=${(i) => this._toggle(s.entity_id, i.target.checked)} />
              ${ie(this.hass, s.entity_id)}</label>`)}
        </div>
        ${this._sameType ? d : l`<p class="error">${this._tr("ov_err_mixed")}</p>`}

        <h3>${this._tr("setpoint")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("setpoint")}>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "setpoint"} @change=${() => this._how = "setpoint"} /> ${this._tr("ov_how_setpoint")}</label>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "mode"} ?disabled=${!t.length} @change=${() => this._how = "mode"} /> ${this._tr("ov_how_mode")}</label>
        </div>
        ${this._how === "mode" ? l`<div class="field"><select aria-label=${this._tr("ov_how_mode")} @change=${(s) => this._modeId = s.target.value}>
              <option value="" ?selected=${!this._modeId}>—</option>
              ${t.map((s) => l`<option value=${s.id} ?selected=${s.id === this._modeId}>${s.name}</option>`)}
            </select></div>` : this._rep ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${this._rep} state-only
                .value=${this._sp ?? se(this.hass, this._rep)}
                @wp-change=${(s) => {
      s.stopPropagation(), this._sp = s.detail, this._error = "";
    }}></wp-setpoint-editor>` : d}

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
              min=${wt(/* @__PURE__ */ new Date(), this.hass.config.time_zone)}
              max=${Ss(wt(/* @__PURE__ */ new Date(), this.hass.config.time_zone), 7)}
              @input=${(s) => {
      this._untilDate = s.target.value, this._dur = "until";
    }} />
          </div>
          ${this._dur === "until" ? l`<p class="hint">${this._tr("ov_until_hint")}</p>` : d}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : d}
        <button slot="footer" class="btn" @click=${() => {
      var s, i;
      return (i = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e || this._busy} @click=${() => void this._apply()}>${this._tr("ov_apply")}</button>
      </wp-dialog>`;
  }
};
j.styles = [
  rt,
  R`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
    `
];
L([
  f({ attribute: !1 })
], j.prototype, "hass", 2);
L([
  f({ attribute: !1 })
], j.prototype, "data", 2);
L([
  f({ attribute: !1 })
], j.prototype, "program", 2);
L([
  u()
], j.prototype, "_sel", 2);
L([
  u()
], j.prototype, "_how", 2);
L([
  u()
], j.prototype, "_sp", 2);
L([
  u()
], j.prototype, "_modeId", 2);
L([
  u()
], j.prototype, "_dur", 2);
L([
  u()
], j.prototype, "_hours", 2);
L([
  u()
], j.prototype, "_minutes", 2);
L([
  u()
], j.prototype, "_untilTime", 2);
L([
  u()
], j.prototype, "_untilDate", 2);
L([
  u()
], j.prototype, "_error", 2);
L([
  u()
], j.prototype, "_busy", 2);
j = L([
  N("wp-override-dialog")
], j);
var to = Object.defineProperty, eo = Object.getOwnPropertyDescriptor, Ct = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? eo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && to(t, s, o), o;
};
const so = ["climate", "cover", "light", "switch"];
let nt = class extends M {
  constructor() {
    super(...arguments), this._type = "", this._rep = "", this._error = "", this._saving = !1;
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  _types() {
    const e = new Set(so);
    for (const t of this.data.modes) e.add(t.type);
    for (const t of this.data.programs) for (const s of t.entities) e.add(q(k(s.entity_id)));
    return [...e];
  }
  get _current() {
    return this._type || this._types()[0];
  }
  _users(e) {
    return this.data.programs.filter(
      (t) => t.profiles.some((s) => s.days.some((i) => i.some((o) => Object.values(o.actions.by_type).includes(e)))) || t.entities.some((s) => {
        var i;
        return ((i = s.default) == null ? void 0 : i.kind) === "mode" && s.default.value === e;
      })
    ).length;
  }
  _domains(e) {
    return e === "switch" ? ["switch", "input_boolean"] : [e];
  }
  /** Entities of a type, those used by programs first. */
  _candidates(e) {
    const t = this._domains(e), s = new Set(this.data.programs.flatMap((i) => i.entities.map((o) => o.entity_id)));
    return Object.keys(this.hass.states).filter((i) => t.includes(k(i))).sort((i, o) => Number(s.has(o)) - Number(s.has(i)) || i.localeCompare(o)).slice(0, 300);
  }
  _startEdit(e) {
    const t = this._current;
    this._error = "", e ? (this._edit = structuredClone(e), this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`) : (this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`, this._edit = { type: t, name: "", color: "#2196f3", icon: null, value: se(this.hass, this._rep), exceptions: {} });
  }
  _patch(e) {
    this._edit && (this._edit = { ...this._edit, ...e }), this._error = "";
  }
  _errorText(e) {
    const t = e;
    return (t == null ? void 0 : t.code) === "in_use" ? this._tr("mode_in_use", { list: t.message ?? "" }) : (t == null ? void 0 : t.code) === "unauthorized" ? this._tr("err_unauthorized") : this._tr("error", { message: (t == null ? void 0 : t.message) ?? String(e) });
  }
  async _save() {
    const e = this._edit;
    if (e) {
      if (!e.name.trim()) {
        this._error = this._tr("err_name");
        return;
      }
      if (["scene", "script", "action"].includes(e.value.kind)) {
        this._error = this._tr("err_incomplete");
        return;
      }
      this._saving = !0;
      try {
        const t = { ...e, name: e.name.trim() };
        t.icon || (t.icon = null), t.id || delete t.id, await this.hass.callWS({ type: "weekly_planner/mode/save", mode: t }), this._edit = void 0;
      } catch (t) {
        this._error = this._errorText(t);
      } finally {
        this._saving = !1;
      }
    }
  }
  async _askDelete(e) {
    await kt(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && await this._delete(e.id);
  }
  async _delete(e) {
    try {
      await this.hass.callWS({ type: "weekly_planner/mode/delete", mode_id: e }), this._error = "";
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  /* ---- render ---- */
  updated() {
    Us(this.renderRoot.querySelector(".tabs"));
  }
  _renderList() {
    const e = this._current, t = this.data.modes.filter((i) => i.type === e), s = this.data.can_edit && !this.data.read_only;
    return l`
      <div class="tabs" role="tablist">
        ${this._types().map((i) => l`<button role="tab" aria-selected=${i === e} class="tab ${i === e ? "on" : ""}"
          @click=${() => {
      this._type = i, this._error = "";
    }}>${Ce(this._lang, i)}</button>`)}
      </div>
      ${t.length === 0 ? l`<p class="muted">${this._tr("no_modes")}</p>` : d}
      ${t.map((i) => {
      const o = this._users(i.id);
      return l`
          <div class="mode">
            <span class="dot" style="background:${i.color}"></span>
            <div class="grow">
              <strong>${i.name}</strong>
              <div class="muted small">${$e(this._lang, i.value)}${Object.keys(i.exceptions ?? {}).length ? ` · ${this._tr("mode_exceptions_n", { n: String(Object.keys(i.exceptions).length) })}` : ""}</div>
              <div class="muted small">${o === 0 ? this._tr("mode_unused") : this._tr(o === 1 ? "mode_used_one" : "mode_used_many", { n: String(o) })}</div>
            </div>
            <button class="ibtn" ?disabled=${!s} aria-label=${`${this._tr("edit")} ${i.name}`} @click=${() => this._startEdit(i)}><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="ibtn" ?disabled=${!s} aria-label=${`${this._tr("delete")} ${i.name}`} @click=${() => {
        this._error = "", this._askDelete(i);
      }}><ha-icon icon="mdi:delete"></ha-icon></button>
          </div>`;
    })}
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : d}
      <button class="btn" ?disabled=${!s} @click=${() => this._startEdit()}>+ ${this._tr("mode_new")}</button>
    `;
  }
  _renderForm(e) {
    const t = e.type, s = this._domains(t), i = this._candidates(t), o = this._rep, n = Object.entries(e.exceptions ?? {});
    return l`
      <div class="field"><label for="m-name">${this._tr("mode_name")}</label>
        <input id="m-name" type="text" maxlength="40" .value=${e.name}
          @input=${(a) => this._patch({ name: a.target.value })} /></div>
      <div class="row">
        <div class="field" style="flex:0 0 auto"><label for="m-color">${this._tr("mode_color")}</label>
          <input id="m-color" type="color" .value=${e.color || "#9e9e9e"}
            @input=${(a) => this._patch({ color: a.target.value })} /></div>
        <div class="field"><label for="m-icon">${this._tr("pe_icon")}</label>
          <input id="m-icon" type="text" placeholder="mdi:sofa" .value=${e.icon ?? ""}
            @input=${(a) => this._patch({ icon: a.target.value.trim() || null })} /></div>
      </div>
      <h3>${this._tr("mode_value")}</h3>
      ${i.length ? l`<div class="field"><label>${this._tr("mode_rep_entity")}</label>
            <select @change=${(a) => this._rep = a.target.value}>
              ${i.map((a) => l`<option value=${a} ?selected=${a === o}>${Z(this.hass, a)}</option>`)}
            </select></div>` : d}
      <wp-setpoint-editor .hass=${this.hass} entity-id=${o} .value=${e.value} .admin=${!1} state-only
        @wp-change=${(a) => {
      a.stopPropagation(), this._patch({ value: a.detail });
    }}></wp-setpoint-editor>
      <h3>${this._tr("mode_exceptions")}</h3>
      <p class="hint">${this._tr("mode_exceptions_hint")}</p>
      ${n.map(([a, c]) => l`
        <div class="card">
          <div class="row" style="flex-wrap:nowrap">
            <strong class="grow">${Z(this.hass, a)}</strong>
            <button class="ibtn" aria-label=${`${this._tr("delete")} ${Z(this.hass, a)}`}
              @click=${async () => {
      if (!await kt(this, this._tr("confirm_delete", { name: Z(this.hass, a) }), this._tr("delete"))) return;
      const h = { ...e.exceptions };
      delete h[a], this._patch({ exceptions: h });
    }}><ha-icon icon="mdi:delete"></ha-icon></button>
          </div>
          <wp-setpoint-editor .hass=${this.hass} entity-id=${a} .value=${c} state-only
            @wp-change=${(h) => {
      h.stopPropagation(), this._patch({ exceptions: { ...e.exceptions, [a]: h.detail } });
    }}></wp-setpoint-editor>
        </div>`)}
      <wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("mode_add_exception")} .domains=${s}
        .exclude=${Object.keys(e.exceptions ?? {})}
        @wp-change=${(a) => {
      a.stopPropagation(), a.detail && this._patch({ exceptions: { ...e.exceptions, [a.detail]: structuredClone(e.value) } });
    }}></wp-entity-picker>
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : d}
    `;
  }
  render() {
    if (!this.data) return d;
    const e = this._edit;
    return l`
      <wp-dialog open wide heading=${e ? e.id ? this._tr("mode_edit") : this._tr("mode_new") : this._tr("modes")}>
        ${e ? this._renderForm(e) : this._renderList()}
        ${e ? l`<button slot="footer" class="btn" @click=${() => {
      this._edit = void 0, this._error = "";
    }}>${this._tr("cancel")}</button>
              <button slot="footer" class="btn primary" ?disabled=${this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>` : l`<button slot="footer" class="btn" @click=${() => {
      var t, s;
      return (s = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("close")}</button>`}
      </wp-dialog>`;
  }
};
nt.styles = [
  rt,
  R`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      ${Ke(Ls)}
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      .mode { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); flex-wrap: wrap; }
      .mode .dot { width: 20px; height: 20px; border-radius: 10px; }
    `
];
Ct([
  f({ attribute: !1 })
], nt.prototype, "hass", 2);
Ct([
  f({ attribute: !1 })
], nt.prototype, "data", 2);
Ct([
  u()
], nt.prototype, "_type", 2);
Ct([
  u()
], nt.prototype, "_edit", 2);
Ct([
  u()
], nt.prototype, "_rep", 2);
Ct([
  u()
], nt.prototype, "_error", 2);
Ct([
  u()
], nt.prototype, "_saving", 2);
nt = Ct([
  N("wp-modes-editor")
], nt);
var io = Object.defineProperty, oo = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? oo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && io(t, s, o), o;
};
const me = 15, Fe = (e) => e >= b ? "24:00" : Y(e);
let tt = class extends M {
  constructor() {
    super(...arguments), this._day = 0, this._error = "", this._conflict = !1, this._saving = !1, this._swipe = new Rs(60);
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  willUpdate() {
    this._p || !this.hass || !this.data || !this.program || (this._p = structuredClone(this.program), this._day = Math.max(0, te(/* @__PURE__ */ new Date(), this.hass.config.time_zone)));
  }
  /* ---- data ---- */
  get _profile() {
    return xt(this._p, this.data);
  }
  get _slots() {
    return this._profile.days[this._day] ?? [];
  }
  _setDay(e, t) {
    const s = this._p, i = this._profile.id, o = we(this.hass, t);
    this._p = {
      ...s,
      profiles: s.profiles.map((n) => n.id === i ? { ...n, days: n.days.map((r, a) => a === e ? o : r) } : n)
    }, this._error = "";
  }
  _patchSlot(e, t) {
    this._setDay(this._day, this._slots.map((s) => s.id === e ? { ...s, ...t } : s));
  }
  _go(e) {
    this._day = (e % 7 + 7) % 7, this._error = "";
  }
  get _modes() {
    return this.data.modes.filter((e) => e.type === yt(this._p));
  }
  /* ---- time editing ---- */
  _setTime(e, t, s) {
    let i = Math.max(0, Math.min(b, Math.round(s / 5) * 5));
    t === "start" ? i = Math.min(i, b - 5) : i === 0 && (i = b), this._patchSlot(e.id, { [t]: { time: Fe(i) } });
  }
  _fromInput(e, t, s) {
    const i = s.target.value;
    /^\d{2}:\d{2}$/.test(i) && this._setTime(e, t, G(i));
  }
  _shift(e, t, s) {
    const i = e[t], o = i ? E(i) : null;
    if (o === null) return;
    const n = t === "end" ? Math.max(me, Math.min(b, o + s)) : Math.max(0, Math.min(b - me, o + s));
    this._setTime(e, t, n);
  }
  /* ---- slots ---- */
  _mode(e) {
    return e.actions.by_type[yt(this._p)] ?? "";
  }
  _setMode(e, t) {
    const s = yt(this._p);
    this._patchSlot(e.id, { actions: { ...e.actions, by_type: { ...e.actions.by_type, [s]: t } } });
  }
  _add() {
    const e = this._slots;
    let t = 8 * 60;
    e.length && (t = Math.max(...e.map((n) => {
      const r = Nt(this.hass, n.start), a = n.end ? Nt(this.hass, n.end) : r;
      return a > r ? a : b;
    }))), t = Math.min(t, b - 60);
    const s = this._modes, i = s.find((n) => /confort|comfort/i.test(`${n.id} ${n.name}`)) ?? s[0], o = {
      id: vt(),
      start: { time: Fe(t) },
      end: { time: Fe(Math.min(b, t + 60)) },
      conditions: [],
      actions: { by_type: i ? { [yt(this._p)]: i.id } : {}, by_entity: {} }
    };
    this._setDay(this._day, [...e, o]);
  }
  async _remove(e) {
    const t = this._tr("ss_confirm_remove", { time: this._sentenceTime(e) });
    await kt(this, t, this._tr("ss_remove")) && this._setDay(this._day, this._slots.filter((s) => s.id !== e.id));
  }
  async _copy(e) {
    const t = (e === "weekdays" ? [0, 1, 2, 3, 4] : e === "weekend" ? [5, 6] : [0, 1, 2, 3, 4, 5, 6]).filter((r) => r !== this._day);
    if (!t.length || !await kt(this, this._tr("ss_copy_confirm"), this._tr("ss_copy_do"))) return;
    const s = this._slots, i = this._profile.id, o = () => s.map((r) => ({ ...structuredClone(r), id: vt() })), n = this._p;
    this._p = {
      ...n,
      profiles: n.profiles.map((r) => r.id === i ? { ...r, days: r.days.map((a, c) => t.includes(c) ? o() : a) } : r)
    }, this._error = "";
  }
  /* ---- save ---- */
  _validate() {
    const e = this._profile, t = T(this._lang).days;
    for (let s = 0; s < 7; s++) {
      const i = e.days[s] ?? [];
      for (const o of i) {
        if (!Object.keys(o.actions.by_type).length && !Object.keys(o.actions.by_entity).length)
          return this._modes.length ? this._tr("ss_err_no_mode", { day: t[s] }) : this._tr("ss_err_none_modes");
        if (o.end && JSON.stringify(o.start) === JSON.stringify(o.end)) return this._tr("ss_err_same", { day: t[s] });
      }
      if (be(i)) return this._tr("ss_err_overlap", { day: t[s] });
    }
    return "";
  }
  async _save() {
    var t, s;
    const e = this._validate();
    if (e) {
      this._error = e;
      return;
    }
    this._saving = !0;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(this._p) }), (t = this.renderRoot.querySelector("wp-dialog")) == null || t.close();
    } catch (i) {
      const o = i;
      this._conflict = (o == null ? void 0 : o.code) === "conflict", this._conflict ? this._error = this._tr("ss_conflict") : (o == null ? void 0 : o.code) === "unauthorized" ? this._error = this._tr("err_unauthorized") : (s = o == null ? void 0 : o.message) != null && s.includes("overlapping_slots") ? this._error = this._tr("err_overlap_server") : this._error = this._tr("ss_err_save");
    } finally {
      this._saving = !1;
    }
  }
  _reload() {
    this._p = structuredClone(this.program), this._conflict = !1, this._error = "";
  }
  /* ---- render ---- */
  _sunText(e, t) {
    return this._tr(`ss_${e}_${t}`);
  }
  _sentenceTime(e) {
    const t = (s, i) => s ? "time" in s ? s.time : this._sunText(i, s.sun) : "";
    return e.end ? `${t(e.start, "from")} ${t(e.end, "to")}`.trim() : `${this._tr("ss_at")} ${t(e.start, "from")}`;
  }
  _timeControl(e, t, s) {
    const i = e[t];
    if (!i) return d;
    const n = (E(i) ?? 0) >= b ? "00:00" : i && "time" in i ? i.time : "", r = (a) => this._tr(a, { when: s });
    return l`
      <div class="tc">
        <span class="word">${s}</span>
        <button class="btn step" aria-label=${r("ss_earlier_aria")} @click=${() => this._shift(e, t, -me)}>
          <ha-icon icon="mdi:minus"></ha-icon> ${this._tr("ss_earlier")}</button>
        <input type="time" step="900" .value=${n} aria-label=${s}
          @change=${(a) => this._fromInput(e, t, a)} />
        <button class="btn step" aria-label=${r("ss_later_aria")} @click=${() => this._shift(e, t, me)}>
          <ha-icon icon="mdi:plus"></ha-icon> ${this._tr("ss_later")}</button>
      </div>`;
  }
  _modeControl(e) {
    const t = this._modes, s = this._mode(e);
    return !s && Object.keys(e.actions.by_entity).length > 0 ? l`<span class="muted">${this._tr("ss_custom")}</span>` : l`
      <select aria-label=${this._tr("slot_action")} @change=${(o) => this._setMode(e, o.target.value)}>
        ${s ? d : l`<option value="" selected>${this._tr("ss_pick_mode")}</option>`}
        ${t.map((o) => l`<option value=${o.id} ?selected=${o.id === s}>${o.name}</option>`)}
      </select>`;
  }
  _renderSlot(e) {
    const t = "time" in e.start, s = !e.end || "time" in e.end, i = !t || !s, o = E(e.start), n = E(e.end ?? null), r = o !== null && n !== null && n <= o && n < b;
    return l`
      <div class="slot card">
        ${i ? l`<div class="sentence">
              <strong>${this._sentenceTime(e)}</strong>
              <p class="hint"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${this._tr("ss_sun_note")}</p>
            </div>` : l`
            ${this._timeControl(e, "start", this._tr(e.end ? "ss_from" : "ss_at"))}
            ${e.end ? this._timeControl(e, "end", this._tr("ss_to")) : d}
            ${r ? l`<p class="hint"><ha-icon icon="mdi:weather-night"></ha-icon> ${this._tr("ss_next_day")}</p>` : d}
            ${n === b ? l`<p class="hint">${this._tr("ss_midnight")}</p>` : d}`}
        <div class="tc"><span class="word">:</span><div class="grow">${this._modeControl(e)}</div></div>
        <div class="actions">
          <button class="btn danger" ?disabled=${!this._canEdit} @click=${() => void this._remove(e)}>
            <ha-icon icon="mdi:delete"></ha-icon> ${this._tr("ss_remove")}</button>
        </div>
      </div>`;
  }
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  render() {
    if (!this._p) return d;
    const e = T(this._lang), t = te(/* @__PURE__ */ new Date(), this.hass.config.time_zone), s = this._slots, i = this._canEdit;
    return l`
      <wp-dialog open wide heading=${this._tr("ss_title")}>
        ${i ? d : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="days" role="group" aria-label=${this._tr("ss_day_pick")}>
          ${e.days_short.map((o, n) => l`
            <button class="day ${n === this._day ? "on" : ""} ${n === t ? "today" : ""}" aria-pressed=${n === this._day}
              aria-label=${e.days[n] + (n === t ? ` (${e.today})` : "")} @click=${() => this._go(n)}>${o}</button>`)}
        </div>
        <div class="body" @pointerdown=${(o) => this._swipe.down(o)}
          @pointerup=${(o) => {
      const n = this._swipe.up(o);
      n && this._go(this._day + n);
    }}
          @pointercancel=${() => this._swipe.cancel()}>
          <h3>${e.days[this._day]}${this._day === t ? l` <span class="badge">${e.today}</span>` : d}</h3>
          <p class="muted small">${this._tr("ss_season", { name: this._profile.name })}</p>
          ${s.length === 0 ? l`<p class="muted">${this._tr("ss_empty")}</p>` : d}
          ${s.map((o) => this._renderSlot(o))}
          <button class="btn" ?disabled=${!i} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon> ${this._tr("ss_add")}</button>
          <h4>${this._tr("ss_copy_title")}</h4>
          <div class="row">
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("weekdays")}>${this._tr("ss_copy_weekdays")}</button>
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("weekend")}>${this._tr("ss_copy_weekend")}</button>
            <button class="btn" ?disabled=${!i} @click=${() => void this._copy("all")}>${this._tr("ss_copy_all")}</button>
          </div>
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}
          ${this._conflict ? l`<button class="btn" @click=${() => this._reload()}>${this._tr("ss_reload")}</button>` : d}</p>` : d}
        <button slot="footer" class="btn" @click=${() => {
      var o;
      return (o = this.renderRoot.querySelector("wp-dialog")) == null ? void 0 : o.close();
    }}>${e.cancel}</button>
        <button slot="footer" class="btn primary" ?disabled=${!i || this._saving} @click=${() => void this._save()}>${e.save}</button>
      </wp-dialog>`;
  }
};
tt.styles = [
  rt,
  R`
      :host { display: contents; }
      .days { display: flex; gap: 2px; margin-bottom: 8px; }
      .day {
        flex: 1; min-width: 0; min-height: 48px; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
        background: none; color: var(--primary-text-color); cursor: pointer; font-size: 14px;
      }
      .day.today { font-weight: 700; text-decoration: underline; }
      .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .body { touch-action: pan-y; min-height: 40vh; }
      h3 { margin: 8px 0 0; font-size: 20px; font-weight: 600; }
      h4 { margin: 20px 0 8px; font-size: 15px; font-weight: 500; }
      .small { font-size: 14px; margin: 2px 0 8px; }
      .badge {
        background: var(--primary-color); color: var(--text-primary-color, #fff); border-radius: 12px;
        padding: 2px 10px; font-size: 13px; font-weight: 600; vertical-align: middle;
      }
      .slot { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
      .tc { display: flex; align-items: center; gap: 6px; }
      .tc .word { flex: 0 0 28px; font-size: 16px; }
      .tc input[type="time"] {
        flex: 0 0 104px; width: 104px; min-height: 48px; font-size: 20px; font-weight: 600; text-align: center; padding: 4px;
      }
      .tc .grow select { font-size: 16px; }
      .btn.step { flex: 1; min-width: 0; padding: 0 6px; font-size: 14px; gap: 2px; --mdc-icon-size: 16px; }
      .sentence { font-size: 16px; }
      .actions { display: flex; justify-content: flex-start; }
      @media (max-width: 400px) { .tc .word { flex-basis: 22px; } .tc input[type="time"] { flex-basis: 96px; width: 96px; font-size: 18px; } }
    `
];
_t([
  f({ attribute: !1 })
], tt.prototype, "hass", 2);
_t([
  f({ attribute: !1 })
], tt.prototype, "data", 2);
_t([
  f({ attribute: !1 })
], tt.prototype, "program", 2);
_t([
  u()
], tt.prototype, "_p", 2);
_t([
  u()
], tt.prototype, "_day", 2);
_t([
  u()
], tt.prototype, "_error", 2);
_t([
  u()
], tt.prototype, "_conflict", 2);
_t([
  u()
], tt.prototype, "_saving", 2);
tt = _t([
  N("wp-simple-schedule")
], tt);
var no = Object.defineProperty, ro = Object.getOwnPropertyDescriptor, ut = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ro(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && no(t, s, o), o;
};
const ao = ["scene", "script", "action"], lo = ["switch", "input_boolean", "fan"], co = 400, ho = 800;
let et = class extends M {
  constructor() {
    super(...arguments), this._expanded = !1, this._pending = {}, this._message = "", this._error = "", this._durationOpen = !1, this._sendTimers = /* @__PURE__ */ new Map(), this._clear = /* @__PURE__ */ new Map(), this._stopHold = () => {
      window.clearInterval(this._repeat), this._repeat = void 0;
    };
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._stopHold(), this._sendTimers.forEach((e) => window.clearTimeout(e)), this._clear.forEach((e) => window.clearTimeout(e)), window.clearTimeout(this._msgTimer);
  }
  willUpdate(e) {
    var t;
    if (e.has("hass") && Object.keys(this._pending).length) {
      const s = { ...this._pending };
      for (const [i, o] of Object.entries(this._pending)) {
        const n = ((t = this.hass.states[i]) == null ? void 0 : t.attributes) ?? {};
        (k(i) === "light" ? this._brightnessPct(i, !1) : n.temperature) === o && !this._sendTimers.has(i) && delete s[i];
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
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  get _status() {
    return this.data.status[this.program.id];
  }
  get _next() {
    var t;
    const e = (t = this._status) == null ? void 0 : t.next_change;
    return e ? Yt(e, this._tz, this._lang, /* @__PURE__ */ new Date()) : null;
  }
  /** Entities of the program's main type (the first is shown, the others fold under "and N more"). */
  get _main() {
    const e = q(yt(this.program)), t = this.program.entities.map((i) => i.entity_id), s = t.filter((i) => q(k(i)) === e);
    return s.length ? s : t.slice(0, 1);
  }
  /* ------------------------------------------------------------------ commands */
  async _send(e, t, s = {}, i) {
    try {
      this._error = "", await this.hass.callService("weekly_planner", "override", { entity_id: e, setpoint: t, ...s });
      const o = i ? Yt(i, this._tz, this._lang, /* @__PURE__ */ new Date()) : this._next;
      this._say(this._tr("sm_done", {
        what: js(this._lang, this.data.modes, e[0], t),
        until: o ? this._tr("sm_until_part", { time: o }) : ""
      }));
    } catch (o) {
      this._error = C(this._lang, "error", { message: (o == null ? void 0 : o.message) ?? String(o) });
    }
  }
  _say(e) {
    this._message = e, window.clearTimeout(this._msgTimer), this._msgTimer = window.setTimeout(() => this._message = "", 4e3);
  }
  /** Several quick presses become one command, 800 ms after the last one. */
  _queue(e, t) {
    window.clearTimeout(this._sendTimers.get(e)), this._sendTimers.set(e, window.setTimeout(() => {
      this._sendTimers.delete(e), this._send([e], t), this._clear.set(e, window.setTimeout(() => {
        const s = { ...this._pending };
        delete s[e], this._pending = s;
      }, 6e3));
    }, ho));
  }
  _step(e, t) {
    var a, c;
    const s = ((a = this.hass.states[e]) == null ? void 0 : a.attributes) ?? {}, i = this._pending[e] ?? Number(s.temperature ?? s.current_temperature ?? 20), o = Number(s.min_temp ?? 7), n = Number(s.max_temp ?? 35), r = Ci(i, t, o, n);
    r !== i && (window.clearTimeout(this._clear.get(e)), this._pending = { ...this._pending, [e]: r }, (c = navigator.vibrate) == null || c.call(navigator, 10), this._queue(e, { kind: "temperature", temperature: r }));
  }
  _brightnessPct(e, t = !0) {
    if (t && this._pending[e] !== void 0) return this._pending[e];
    const s = this.hass.states[e];
    if ((s == null ? void 0 : s.state) !== "on") return 0;
    const i = s.attributes.brightness;
    return typeof i == "number" ? Math.round(i / 255 * 100) : 100;
  }
  _dim(e, t) {
    var o;
    const s = this._brightnessPct(e), i = Math.min(100, Math.max(10, s + t * 10));
    i === s && s !== 0 || (window.clearTimeout(this._clear.get(e)), this._pending = { ...this._pending, [e]: i }, (o = navigator.vibrate) == null || o.call(navigator, 10), this._queue(e, { kind: "on", brightness: i }));
  }
  _startHold(e, t) {
    e.preventDefault(), this._stopHold(), t(), this._repeat = window.setInterval(t, co);
  }
  _holdButton(e, t, s) {
    return l`<button class="big" aria-label=${t}
      @pointerdown=${(i) => this._startHold(i, s)}
      @pointerup=${this._stopHold} @pointercancel=${this._stopHold} @pointerleave=${this._stopHold}
      @contextmenu=${(i) => i.preventDefault()}
      @keydown=${(i) => {
      (i.key === "Enter" || i.key === " ") && (i.preventDefault(), s());
    }}>
      <ha-icon icon=${e}></ha-icon><span>${t}</span></button>`;
  }
  _simple(e, t, s, i) {
    return l`<button class="big" @click=${() => this._send([e], i)}><ha-icon icon=${t}></ha-icon><span>${s}</span></button>`;
  }
  async _resume() {
    try {
      await this.hass.callService("weekly_planner", "resume", { program_id: this.program.id });
    } catch (e) {
      this._error = C(this._lang, "error", { message: (e == null ? void 0 : e.message) ?? String(e) });
    }
  }
  async _applyDuration(e, t) {
    var s;
    this._durationOpen = !1;
    for (const i of this.program.entities) {
      const o = (s = this.data.entities[i.entity_id]) == null ? void 0 : s.override;
      (o == null ? void 0 : o.origin) === "voluntary" && o.setpoint && await this._send([i.entity_id], o.setpoint, e, t);
    }
  }
  /** The four duration choices, with their end (server time zone). */
  _choices() {
    const e = /* @__PURE__ */ new Date(), t = bt(e, this._tz), s = e.getTime() - e.getSeconds() * 1e3 - e.getMilliseconds(), i = (a) => new Date(s + a * 6e4).toISOString(), o = (a) => ({ label: this._tr(a === 1 ? "sm_1h" : "sm_2h"), timing: { duration: { hours: a } }, end: new Date(e.getTime() + a * 36e5).toISOString() }), n = i(t < 1320 ? 1320 - t : 1440 - t), r = i(1440 - t);
    return [
      o(1),
      o(2),
      { label: this._tr("sm_tonight"), timing: { until: n }, end: n },
      { label: this._tr("sm_all_day"), timing: { until: r }, end: r }
    ];
  }
  /* ------------------------------------------------------------------ rendering */
  _sentence(e) {
    const t = this.hass.states[e];
    if (!t || t.state === "unavailable" || t.state === "unknown") return this._tr("sm_unavailable");
    const s = t.attributes, i = this._lang, o = this._next, n = o ? ` · ${this._tr("sm_planned", { time: o })}` : "";
    switch (k(e)) {
      case "climate": {
        const r = typeof s.current_temperature == "number" ? qe(i, s.current_temperature) : "—";
        if (t.state === "off") return this._tr("sm_climate_off", { current: r });
        const a = this._pending[e] ?? s.temperature, c = typeof a == "number" ? qe(i, a) : "—", h = o ? this._tr("sm_until_part", { time: o }) : "", m = s.hvac_action === "heating" ? ` · ${this._tr("sm_heating")}` : "";
        return this._tr("sm_climate", { current: r, target: c, until: h }) + m;
      }
      case "cover": {
        let r;
        return t.state === "closed" ? r = this._tr("sm_cover_closed") : t.state === "opening" || t.state === "closing" ? r = this._tr("sm_cover_moving") : typeof s.current_position == "number" && s.current_position < 100 ? r = this._tr("sm_cover_open_at", { pos: Ds(i, s.current_position) }) : r = this._tr("sm_cover_open"), r + n;
      }
      case "light": {
        const r = this._brightnessPct(e);
        return t.state !== "on" && this._pending[e] === void 0 ? this._tr("sm_is_off") + n : (r > 0 && r < 100 ? this._tr("sm_is_on_at", { pct: String(r) }) : this._tr("sm_is_on")) + n;
      }
      default:
        return (t.state === "off" ? this._tr("sm_is_off") : this._tr("sm_is_on")) + n;
    }
  }
  _activeModeId(e) {
    var n, r, a;
    const t = (n = this.data.entities[e]) == null ? void 0 : n.override;
    if (t) {
      const c = JSON.stringify(t.setpoint ?? null);
      return (r = this.data.modes.find((h) => JSON.stringify(ge(h, e)) === c)) == null ? void 0 : r.id;
    }
    const s = this._status, i = s ? Object.values(s.current_slots)[0] : void 0, o = i ? xt(this.program, this.data).days.flat().find((c) => c.id === i) : void 0;
    return o ? (a = ne(o, this.program, this.data.modes)) == null ? void 0 : a.id : void 0;
  }
  _modes(e) {
    const t = q(k(e)), s = this.data.modes.filter((o) => {
      if (o.type !== t) return !1;
      const n = ge(o, e);
      return !ao.includes(n.kind) && Si(this.hass, e, n);
    });
    if (!s.length) return d;
    const i = this._activeModeId(e);
    return l`<div class="modes" role="group" aria-label=${this._tr("sm_mode")}>
      ${s.map((o) => l`<button class="seg ${o.id === i ? "on" : ""}" aria-pressed=${o.id === i}
        @click=${() => this._send([e], ge(o, e))}>${o.name}</button>`)}
    </div>`;
  }
  _controls(e) {
    const t = k(e);
    return t === "climate" ? l`<div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_cooler"), () => this._step(e, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_warmer"), () => this._step(e, 1))}</div>` : t === "cover" ? l`<div class="pair">
        ${this._simple(e, "mdi:blinds-open", this._tr("sm_open"), { kind: "open" })}
        ${this._simple(e, "mdi:blinds-closed", this._tr("sm_close"), { kind: "close" })}</div>` : t === "light" ? l`<div class="pair">
        ${this._simple(e, "mdi:lightbulb-on", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(e, "mdi:lightbulb-off", this._tr("sm_off"), { kind: "off" })}</div>
        <div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_dimmer"), () => this._dim(e, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_brighter"), () => this._dim(e, 1))}</div>` : lo.includes(t) ? l`<div class="pair">
        ${this._simple(e, "mdi:power-plug", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(e, "mdi:power-plug-off", this._tr("sm_off"), { kind: "off" })}</div>` : d;
  }
  _block(e, t) {
    return l`<div class="device">
      ${t ? l`<div class="dname">${ie(this.hass, e)}</div>` : d}
      <p class="sentence">${this._sentence(e)}</p>
      ${this._controls(e)}${this._modes(e)}
    </div>`;
  }
  _overrideLine() {
    const e = this.program.entities.map((i) => {
      var o;
      return (o = this.data.entities[i.entity_id]) == null ? void 0 : o.override;
    }).filter((i) => !!i);
    if (!e.length) return d;
    const t = e.find((i) => i.origin === "voluntary"), s = t != null && t.until ? Yt(t.until, this._tz, this._lang, /* @__PURE__ */ new Date()) : this._next;
    return l`<div class="until">
      <span>${s ? this._tr("sm_until_line", { time: s }) : this._tr("sm_until_open")}</span>
      ${t ? l`<button class="text" @click=${() => this._durationOpen = !0}>${this._tr("sm_change_duration")}</button>` : d}
      <button class="text" @click=${() => this._resume()}><ha-icon icon="mdi:calendar-refresh"></ha-icon> ${this._tr("sm_resume")}</button>
    </div>`;
  }
  render() {
    if (!this.hass || !this.data || !this.program) return d;
    const e = this._main;
    if (!e.length) return d;
    const [t, ...s] = e, i = this._lang;
    return l`
      ${this.program.enabled ? l`
        ${this._block(t, !1)}
        ${s.length ? l`<button class="text more" aria-expanded=${this._expanded}
              @click=${() => this._expanded = !this._expanded}>
              <ha-icon icon=${this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              ${this._expanded ? this._tr("sm_hide_others") : s.length === 1 ? this._tr("sm_others_one") : this._tr("sm_others", { n: String(s.length) })}</button>
            ${this._expanded ? s.map((o) => this._block(o, !0)) : d}` : d}
        <div class="live" aria-live="polite">${this._message ? l`<div class="done"><ha-icon icon="mdi:check-circle"></ha-icon> ${this._message}</div>` : d}</div>
        ${this._error ? l`<div class="err">${this._error}</div>` : d}
        ${this._overrideLine()}` : l`<p class="sentence muted">${this._tr("sm_disabled")}</p>`}
      ${this.data.can_edit ? l`<button class="text" @click=${() => this.dispatchEvent(new CustomEvent("simple-schedule", { detail: { program: this.program }, bubbles: !0, composed: !0 }))}>
            <ha-icon icon="mdi:calendar-clock"></ha-icon> ${T(i).sm_change_schedule}</button>` : d}
      ${this._durationOpen ? l`<wp-dialog open heading=${this._tr("sm_duration_title")}
            @closed=${(o) => {
      o.stopPropagation(), this._durationOpen = !1;
    }}>
            <div class="choices">${this._choices().map((o) => l`<button class="seg wide" @click=${() => this._applyDuration(o.timing, o.end)}>${o.label}</button>`)}</div>
          </wp-dialog>` : d}
    `;
  }
};
et.styles = R`
    :host { display: block; color: var(--primary-text-color); }
    * { box-sizing: border-box; }
    .device + .device { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .dname { font-size: 14px; font-weight: 500; color: var(--secondary-text-color); }
    .sentence { font-size: 16px; line-height: 1.4; margin: 4px 0 12px; }
    .muted { color: var(--secondary-text-color); }
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
      flex: 1 1 96px; min-height: 48px; padding: 0 12px; border-radius: 24px; font-size: 14px; font-weight: 500;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer;
    }
    button.seg.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    button.seg.wide { flex: 1 1 100%; min-height: 56px; font-size: 16px; }
    button.text {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 8px; border: none;
      background: none; color: var(--primary-color); font-size: 14px; font-weight: 500; cursor: pointer; --mdc-icon-size: 20px;
    }
    .until { display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; font-size: 14px; color: var(--secondary-text-color); }
    .live { min-height: 0; }
    .done {
      display: flex; align-items: center; gap: 8px; font-size: 16px; padding: 10px 12px; margin: 4px 0;
      border-radius: 12px; background: var(--secondary-background-color); --mdc-icon-size: 22px; color: var(--success-color, #43a047);
    }
    .err { color: var(--error-color, #db4437); font-size: 14px; margin: 4px 0; }
  `;
ut([
  f({ attribute: !1 })
], et.prototype, "hass", 2);
ut([
  f({ attribute: !1 })
], et.prototype, "data", 2);
ut([
  f({ attribute: !1 })
], et.prototype, "program", 2);
ut([
  u()
], et.prototype, "_expanded", 2);
ut([
  u()
], et.prototype, "_pending", 2);
ut([
  u()
], et.prototype, "_message", 2);
ut([
  u()
], et.prototype, "_error", 2);
ut([
  u()
], et.prototype, "_durationOpen", 2);
et = ut([
  N("wp-simple-controls")
], et);
var po = Object.defineProperty, _o = Object.getOwnPropertyDescriptor, lt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? _o(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && po(t, s, o), o;
};
let K = class extends M {
  constructor() {
    super(...arguments), this._dialog = null, this._showWeek = !1, this._advanced = !1, this._preview = {}, this._now = /* @__PURE__ */ new Date();
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }
  setConfig(e) {
    this._config = { show_week: !1, show_chart: !0, ...e }, this._showWeek = !!this._config.show_week;
  }
  getCardSize() {
    var e;
    return 3 + (((e = this._data) == null ? void 0 : e.programs.length) ?? 1) * 2;
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = xi(this.hass, (t) => {
      this._data = t, this._error = void 0, this._loadPreviews();
    }));
  }
  get _lang() {
    var e, t, s;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((s = this.hass) == null ? void 0 : s.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /** Resolved slots (sun times, ignored slots) for the next occurrence of each weekday. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = {}, t = /* @__PURE__ */ new Date(), s = [];
    for (const i of ms(this._data, this._config))
      for (let o = 0; o < 7; o++) {
        const n = new Date(t.getTime() + o * 864e5), r = wt(n, this._tz), a = te(n, this._tz);
        s.push(
          this.hass.callWS({ type: "weekly_planner/preview", program_id: i.id, date: r }).then((c) => {
            e[`${i.id}|${a}`] = c.slots;
          }).catch(() => {
          })
        );
      }
    await Promise.all(s), this._preview = e;
  }
  /** Spans of a program for a weekday (0 = Monday); today uses resolved sun times. */
  _spans(e, t, s) {
    const i = this._data, o = xt(e, i), n = (c) => jt(c, e, i.modes, this._lang), r = [];
    for (const { slot: c, end: h } of ke(o.days[(t + 6) % 7]))
      r.push({ start: 0, end: h, color: dt(c, e, i.modes), label: n(c) });
    const a = this._preview[`${e.id}|${t}`];
    for (const c of o.days[t]) {
      const h = a == null ? void 0 : a.find((w) => w.slot_id === c.id);
      let m = E(c.start), _ = E(c.end ?? null);
      if (h && (m = bt(h.start, this._tz), _ = h.end ? bt(h.end, this._tz) : null), m === null) continue;
      const v = _ === null ? m + 10 : _ > m ? _ : b;
      r.push({
        start: m,
        end: v,
        color: dt(c, e, i.modes),
        label: n(c),
        sun: "sun" in c.start || !!(c.end && "sun" in c.end),
        ignored: (h == null ? void 0 : h.ignored) ?? null
      });
    }
    return r;
  }
  _summary(e) {
    const t = this._data, s = t.status[e.id], i = xt(e, t), o = s ? Object.values(s.current_slots)[0] : void 0, n = o ? i.days.flat().find((c) => c.id === o) : void 0, r = n ? ne(n, e, t.modes) : void 0, a = e.entities.filter((c) => {
      var h;
      return (h = t.entities[c.entity_id]) == null ? void 0 : h.override;
    });
    return { status: s, slot: n, mode: r, overridden: a };
  }
  async _toggle(e, t) {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: e.id, enabled: t });
    } catch (s) {
      this._error = (s == null ? void 0 : s.message) ?? String(s);
    }
  }
  async _resume(e) {
    await this.hass.callService("weekly_planner", "resume", { program_id: e.id });
  }
  render() {
    if (!this._config || !this.hass) return d;
    const e = this._lang, t = T(e), s = this._data, i = s ? ms(s, this._config) : [], o = te(this._now, this._tz), n = bt(this._now, this._tz), r = this._config.show_advanced !== !1, a = r && this._advanced;
    return l`
      <ha-card>
        <div class="head">
          <h1>${this._config.title ?? t.title}</h1>
          ${s != null && s.vacation ? l`<span class="chip warn"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${t.vacation}</span>` : d}
        </div>
        ${this._error ? l`<div class="error">${C(e, "error", { message: this._error })}</div>` : d}
        ${s != null && s.read_only ? l`<div class="error">${t.read_only}</div>` : d}
        ${s ? d : l`<div class="empty">…</div>`}
        ${s && !i.length ? l`<div class="empty">${t.no_program}</div>` : d}
        ${i.map((c) => this._renderProgram(c, o, n, a))}
        ${a && i.length && !this._config.program ? l`<button class="link" @click=${() => this._showWeek = !this._showWeek}>
              ${this._showWeek ? t.hide_week : t.show_week}</button>` : d}
        ${a && (s != null && s.can_edit) && !this._config.program ? l`<div class="adv-actions">
              <button class="small" @click=${() => this._dialog = { kind: "modes" }}>${t.modes}</button>
              <button class="small" @click=${() => this._dialog = { kind: "program" }}><ha-icon icon="mdi:plus"></ha-icon> ${t.new_program}</button>
            </div>` : d}
        ${r && i.length ? l`<button class="more" aria-expanded=${a} @click=${() => this._advanced = !this._advanced}>
              <ha-icon icon=${a ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon> ${a ? t.sm_less : t.sm_more}</button>` : d}
      </ha-card>
      ${this._renderDialog()}
    `;
  }
  _renderProgram(e, t, s, i) {
    const o = this._data;
    return l`
      <section class="program ${e.enabled ? "" : "off"}">
        <h2 class="ptitle">${e.name}</h2>
        <wp-simple-controls .hass=${this.hass} .data=${o} .program=${e}
          @simple-schedule=${() => this._dialog = { kind: "simple", program: e }}></wp-simple-controls>
        ${i ? this._renderAdvanced(e, t, s) : d}
      </section>
    `;
  }
  _renderAdvanced(e, t, s) {
    var x, ct, g;
    const i = this._lang, o = T(i), n = this._data, { status: r, slot: a, mode: c, overridden: h } = this._summary(e), m = r != null && r.next_change ? Yt(r.next_change, this._tz, i, this._now) : null, _ = this._defaultMode(e), v = this._showWeek || !!this._config.program, w = xt(e, n);
    return l`
      <div class="advanced">
        <div class="row">
          <div class="name">
            ${e.profiles.length > 1 ? l`<span class="chip">${w.name}</span>` : d}
          </div>
          <label class="switch" title=${e.enabled ? "On" : "Off"}>
            <input type="checkbox" .checked=${e.enabled} aria-label=${e.name}
              @change=${(P) => this._toggle(e, P.target.checked)} />
            <span></span>
          </label>
        </div>
        <div class="state">
          ${this._effective(e) ? l`<span class="pill override">${this._effective(e)}</span>` : c ? l`<span class="pill" style="--c:${c.color}">${c.name}</span>` : a ? l`<span class="pill" style="--c:${dt(a, e, n.modes)}">${jt(a, e, n.modes, i)}</span>` : _ && e.enabled && !n.vacation ? l`<span class="pill" style="--c:${_.color}">${_.name}</span>` : l`<span class="pill neutral">${e.enabled ? o.off_slot : "—"}</span>`}
          <span class="muted">${m ? C(i, "until", { time: m }) : o.no_change}</span>
          ${r != null && r.skip_next ? l`<span class="chip">${o.skip_planned}</span>` : d}
        </div>
        ${h.length ? l`<div class="warn-row"><ha-icon icon="mdi:alert"></ha-icon> ${h.length > 1 ? `${h.length} × ` : ""}${this._overrideText(h[0].entity_id)}
              <button class="small" @click=${() => this._resume(e)}>${o.resume}</button></div>` : d}
        ${(((x = n.warnings) == null ? void 0 : x[e.id]) ?? []).length && n.can_edit ? l`<details class="warnings"><summary><ha-icon icon="mdi:alert"></ha-icon> ${(((ct = n.warnings) == null ? void 0 : ct[e.id]) ?? []).length}</summary>
              ${(((g = n.warnings) == null ? void 0 : g[e.id]) ?? []).map((P) => l`<div>${this._warning(P)}</div>`)}</details>` : d}
        <wp-day-bar .spans=${this._spans(e, t, !0)} .now=${s} show-hours
          @click=${() => this._dialog = { kind: "day", program: e, day: t }}></wp-day-bar>
        ${v ? l`<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(
      (P) => l`<button class="day" @click=${() => this._dialog = { kind: "day", program: e, day: P }}>
                <span class=${P === t ? "today" : ""}>${o.days_short[P]}</span>
                <wp-day-bar thin .spans=${this._spans(e, P, P === t)}
                  .now=${P === t ? s : null}></wp-day-bar></button>`
    )}</div>` : d}
        <div class="actions">
          <button class="small" @click=${() => this._dialog = { kind: "override", program: e }}>${o.override}</button>
          ${n.can_edit ? l`<button class="small ghost" @click=${() => this._dialog = { kind: "program", program: e }}><ha-icon icon="mdi:pencil"></ha-icon> ${o.edit}</button>` : d}
        </div>
      </div>
    `;
  }
  _warning(e) {
    var o;
    const t = ((o = this.hass.states[e.entity_id]) == null ? void 0 : o.attributes.friendly_name) ?? e.entity_id, s = `warn_${e.code}`;
    return T(this._lang)[s] ? C(this._lang, s, { entity: t, detail: e.detail }) : `${t}: ${e.code}`;
  }
  /** Setpoint of a voluntary override on the program's first entity, shown instead of the plan. */
  _effective(e) {
    var i, o;
    const t = (i = e.entities[0]) == null ? void 0 : i.entity_id, s = t ? (o = this._data.entities[t]) == null ? void 0 : o.override : void 0;
    return (s == null ? void 0 : s.origin) === "voluntary" && s.setpoint ? js(this._lang, this._data.modes, t, s.setpoint) : void 0;
  }
  /** Mode applied outside slots (default of the first entity), to show instead of "outside slots". */
  _defaultMode(e) {
    var s;
    const t = (s = e.entities[0]) == null ? void 0 : s.default;
    if (!((t == null ? void 0 : t.kind) !== "mode" || typeof t.value != "string"))
      return this._data.modes.find((i) => i.id === t.value);
  }
  _overrideText(e) {
    var s;
    const t = (s = this._data.entities[e]) == null ? void 0 : s.override;
    return (t == null ? void 0 : t.origin) === "voluntary" && t.until ? C(this._lang, "overridden_until", { time: Yt(t.until, this._tz, this._lang, this._now) }) : C(this._lang, "overridden");
  }
  _renderDialog() {
    var s;
    const e = this._dialog;
    if (!e || !this._data) return d;
    const t = () => this._dialog = null;
    switch (e.kind) {
      case "day":
        return l`<wp-day-view .hass=${this.hass} .data=${this._data} .program=${e.program} .day=${e.day}
          .showChart=${this._config.show_chart !== !1}
          @closed=${t}
          @edit-day=${(i) => this._dialog = { kind: "program", program: e.program, ...i.detail }}></wp-day-view>`;
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((s = this._config.filter) == null ? void 0 : s.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "override":
        return l`<wp-override-dialog .hass=${this.hass} .data=${this._data} .program=${e.program}
          @closed=${t}></wp-override-dialog>`;
      case "simple":
        return l`<wp-simple-schedule .hass=${this.hass} .data=${this._data} .program=${e.program}
          @closed=${t}></wp-simple-schedule>`;
      case "modes":
        return l`<wp-modes-editor .hass=${this.hass} .data=${this._data} @closed=${t}></wp-modes-editor>`;
    }
  }
};
K.styles = R`
    ha-card { padding: 16px; }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ptitle { margin: 0 0 4px; font-size: 18px; font-weight: 500; overflow-wrap: anywhere; }
    .advanced { margin-top: 12px; padding-top: 8px; border-top: 1px dashed var(--divider-color); }
    .adv-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    button.more {
      display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; min-height: 48px; margin-top: 8px;
      border: none; background: none; color: var(--primary-color); font: inherit; font-size: 14px; font-weight: 500;
      cursor: pointer; --mdc-icon-size: 22px;
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
    .muted { color: var(--secondary-text-color); font-size: 14px; }
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
    .day span { font-size: 14px; color: var(--secondary-text-color); text-align: left; }
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
    .empty { color: var(--secondary-text-color); padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 14px; margin-bottom: 8px; }
    .switch { position: relative; width: 48px; height: 48px; flex: none; display: flex; align-items: center; }
    .switch span { inset: auto !important; position: relative !important; width: 40px; height: 22px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .switch span {
      position: absolute; inset: 0; border-radius: 11px; background: var(--disabled-color, #bdbdbd);
      transition: background 0.2s; cursor: pointer;
    }
    .switch span::before {
      content: ""; position: absolute; width: 18px; height: 18px; left: 2px; top: 2px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
    }
    .switch input:checked + span { background: var(--primary-color); }
    .switch input:checked + span::before { transform: translateX(18px); }
    .switch input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
lt([
  f({ attribute: !1 })
], K.prototype, "hass", 2);
lt([
  u()
], K.prototype, "_config", 2);
lt([
  u()
], K.prototype, "_data", 2);
lt([
  u()
], K.prototype, "_error", 2);
lt([
  u()
], K.prototype, "_dialog", 2);
lt([
  u()
], K.prototype, "_showWeek", 2);
lt([
  u()
], K.prototype, "_advanced", 2);
lt([
  u()
], K.prototype, "_preview", 2);
lt([
  u()
], K.prototype, "_now", 2);
K = lt([
  N("weekly-planner-card")
], K);
var uo = Object.defineProperty, mo = Object.getOwnPropertyDescriptor, Pe = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? mo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && uo(t, s, o), o;
};
const fo = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let Bt = class extends M {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return st(this.hass);
  }
  _tr(e, t) {
    return C(this._lang, e, t);
  }
  updated(e) {
    e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, this.hass.callWS({ type: "weekly_planner/get" }).then((t) => this._programs = t.programs.map((s) => ({ id: s.id, name: s.name }))).catch(() => this._loaded = !1));
  }
  _emit(e) {
    this._config = e, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 }));
  }
  _set(e, t) {
    const s = { ...this._config };
    t === void 0 || t === "" || t === null ? delete s[e] : s[e] = t, this._emit(s);
  }
  get _isProgram() {
    return this._config.program !== void 0;
  }
  _setMode(e) {
    var s, i;
    const t = { ...this._config };
    e ? (delete t.filter, t.program = ((s = this._programs[0]) == null ? void 0 : s.id) ?? "") : (delete t.program, t.filter = { types: ((i = t.filter) == null ? void 0 : i.types) ?? [] }), this._emit(t);
  }
  _setFilter(e) {
    var i;
    const t = { ...this._config.filter ?? {}, ...e };
    (i = t.types) != null && i.length || delete t.types, t.area || delete t.area;
    const s = { ...this._config, filter: t };
    this._emit(s);
  }
  render() {
    var s, i;
    const e = this._config, t = ((s = e.filter) == null ? void 0 : s.types) ?? [];
    return l`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(o) => this._set("title", o.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? l`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(o) => this._set("program", o.target.value)}>
              ${this._programs.length === 0 ? l`<option value="">${this._tr("no_program")}</option>` : d}
              ${!this._programs.some((o) => o.id === e.program) && e.program ? l`<option value=${e.program} selected>${e.program}</option>` : d}
              ${this._programs.map((o) => l`<option value=${o.id} ?selected=${o.id === e.program}>${o.name}</option>`)}
            </select></div>` : l`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${fo.map((o) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(o)}
                @change=${(n) => this._setFilter({ types: n.target.checked ? [...t, o] : t.filter((r) => r !== o) })} />
                ${Ce(this._lang, o)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((i = e.filter) == null ? void 0 : i.area) ?? ""} placeholder="bureau"
                @input=${(o) => this._setFilter({ area: o.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${!!e.show_week}
        @change=${(o) => this._set("show_week", o.target.checked)} /> ${this._tr("ce_show_week")}</label>
      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(o) => this._set("show_chart", o.target.checked)} /> ${this._tr("ce_show_chart")}</label>
      <label class="check"><input type="checkbox" .checked=${e.show_advanced !== !1}
        @change=${(o) => this._set("show_advanced", o.target.checked ? void 0 : !1)} /> ${this._tr("ce_show_advanced")}</label>
    `;
  }
};
Bt.styles = [rt, R`:host { display: block; padding: 4px 0; }`];
Pe([
  f({ attribute: !1 })
], Bt.prototype, "hass", 2);
Pe([
  u()
], Bt.prototype, "_config", 2);
Pe([
  u()
], Bt.prototype, "_programs", 2);
Bt = Pe([
  N("weekly-planner-card-editor")
], Bt);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
