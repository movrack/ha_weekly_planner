/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce = globalThis, We = ce.ShadowRoot && (ce.ShadyCSS === void 0 || ce.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, He = Symbol(), is = /* @__PURE__ */ new WeakMap();
let Cs = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== He) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (We && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = is.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && is.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ps = (e) => new Cs(typeof e == "string" ? e : e + "", void 0, He), F = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, o, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[n + 1], e[0]);
  return new Cs(s, e, He);
}, Gs = (e, t) => {
  if (We) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), o = ce.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, e.appendChild(i);
  }
}, os = We ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Ps(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Zs, defineProperty: Qs, getOwnPropertyDescriptor: ti, getOwnPropertyNames: ei, getOwnPropertySymbols: si, getPrototypeOf: ii } = Object, ht = globalThis, ns = ht.trustedTypes, oi = ns ? ns.emptyScript : "", Ce = ht.reactiveElementPolyfillSupport, Lt = (e, t) => e, de = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? oi : null;
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
} }, Be = (e, t) => !Zs(e, t), rs = { attribute: !0, type: String, converter: de, reflect: !1, useDefault: !1, hasChanged: Be };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ht.litPropertyMetadata ?? (ht.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Mt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = rs) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, s);
      o !== void 0 && Qs(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: o, set: n } = ti(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? rs;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Lt("elementProperties"))) return;
    const t = ii(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Lt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Lt("properties"))) {
      const s = this.properties, i = [...ei(s), ...si(s)];
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
      for (const o of i) s.unshift(os(o));
    } else t !== void 0 && s.push(os(t));
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
    return Gs(t, this.constructor.elementStyles), t;
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
      const r = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : de).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var n, r;
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const a = i.getPropertyOptions(o), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : de;
      this._$Em = o;
      const d = l.fromAttribute(s, a.type);
      this[o] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(o)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, o = !1, n) {
    var r;
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (n = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Be)(n, s) || i.useDefault && i.reflect && n === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
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
        const { wrapped: a } = r, l = this[n];
        a !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, r, l);
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
Mt.elementStyles = [], Mt.shadowRootOptions = { mode: "open" }, Mt[Lt("elementProperties")] = /* @__PURE__ */ new Map(), Mt[Lt("finalized")] = /* @__PURE__ */ new Map(), Ce == null || Ce({ ReactiveElement: Mt }), (ht.reactiveElementVersions ?? (ht.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = globalThis, as = (e) => e, pe = Wt.trustedTypes, ls = pe ? pe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ms = "$lit$", dt = `lit$${Math.random().toFixed(9).slice(2)}$`, Os = "?" + dt, ni = `<${Os}>`, At = document, Vt = () => At.createComment(""), Jt = (e) => e === null || typeof e != "object" && typeof e != "function", qe = Array.isArray, ri = (e) => qe(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", Pe = `[ 	
\f\r]`, Ut = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, cs = /-->/g, ds = />/g, yt = RegExp(`>|${Pe}(?:([^\\s"'>=/]+)(${Pe}*=${Pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ps = /'/g, hs = /"/g, Ds = /^(?:script|style|textarea|title)$/i, Ts = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = Ts(1), it = Ts(2), Dt = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), us = /* @__PURE__ */ new WeakMap(), $t = At.createTreeWalker(At, 129);
function zs(e, t) {
  if (!qe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ls !== void 0 ? ls.createHTML(t) : t;
}
const ai = (e, t) => {
  const s = e.length - 1, i = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = Ut;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let d, m, _ = -1, f = 0;
    for (; f < l.length && (r.lastIndex = f, m = r.exec(l), m !== null); ) f = r.lastIndex, r === Ut ? m[1] === "!--" ? r = cs : m[1] !== void 0 ? r = ds : m[2] !== void 0 ? (Ds.test(m[2]) && (o = RegExp("</" + m[2], "g")), r = yt) : m[3] !== void 0 && (r = yt) : r === yt ? m[0] === ">" ? (r = o ?? Ut, _ = -1) : m[1] === void 0 ? _ = -2 : (_ = r.lastIndex - m[2].length, d = m[1], r = m[3] === void 0 ? yt : m[3] === '"' ? hs : ps) : r === hs || r === ps ? r = yt : r === cs || r === ds ? r = Ut : (r = yt, o = void 0);
    const b = r === yt && e[a + 1].startsWith("/>") ? " " : "";
    n += r === Ut ? l + ni : _ >= 0 ? (i.push(d), l.slice(0, _) + Ms + l.slice(_) + dt + b) : l + dt + (_ === -2 ? a : b);
  }
  return [zs(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Kt {
  constructor({ strings: t, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const a = t.length - 1, l = this.parts, [d, m] = ai(t, s);
    if (this.el = Kt.createElement(d, i), $t.currentNode = this.el.content, s === 2 || s === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (o = $t.nextNode()) !== null && l.length < a; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const _ of o.getAttributeNames()) if (_.endsWith(Ms)) {
          const f = m[r++], b = o.getAttribute(_).split(dt), x = /([.?@])?(.*)/.exec(f);
          l.push({ type: 1, index: n, name: x[2], strings: b, ctor: x[1] === "." ? ci : x[1] === "?" ? di : x[1] === "@" ? pi : ge }), o.removeAttribute(_);
        } else _.startsWith(dt) && (l.push({ type: 6, index: n }), o.removeAttribute(_));
        if (Ds.test(o.tagName)) {
          const _ = o.textContent.split(dt), f = _.length - 1;
          if (f > 0) {
            o.textContent = pe ? pe.emptyScript : "";
            for (let b = 0; b < f; b++) o.append(_[b], Vt()), $t.nextNode(), l.push({ type: 2, index: ++n });
            o.append(_[f], Vt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Os) l.push({ type: 2, index: n });
      else {
        let _ = -1;
        for (; (_ = o.data.indexOf(dt, _ + 1)) !== -1; ) l.push({ type: 7, index: n }), _ += dt.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const i = At.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Tt(e, t, s = e, i) {
  var r, a;
  if (t === Dt) return t;
  let o = i !== void 0 ? (r = s._$Co) == null ? void 0 : r[i] : s._$Cl;
  const n = Jt(t) ? void 0 : t._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== n && ((a = o == null ? void 0 : o._$AO) == null || a.call(o, !1), n === void 0 ? o = void 0 : (o = new n(e), o._$AT(e, s, i)), i !== void 0 ? (s._$Co ?? (s._$Co = []))[i] = o : s._$Cl = o), o !== void 0 && (t = Tt(e, o._$AS(e, t.values), o, i)), t;
}
class li {
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
    const { el: { content: s }, parts: i } = this._$AD, o = ((t == null ? void 0 : t.creationScope) ?? At).importNode(s, !0);
    $t.currentNode = o;
    let n = $t.nextNode(), r = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let d;
        l.type === 2 ? d = new Gt(n, n.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(n, l.name, l.strings, this, t) : l.type === 6 && (d = new hi(n, this, t)), this._$AV.push(d), l = i[++a];
      }
      r !== (l == null ? void 0 : l.index) && (n = $t.nextNode(), r++);
    }
    return $t.currentNode = At, o;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Gt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, s, i, o) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
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
    t = Tt(this, t, s), Jt(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== Dt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ri(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && Jt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(At.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: s, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Kt.createElement(zs(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === o) this._$AH.p(s);
    else {
      const r = new li(o, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = us.get(t.strings);
    return s === void 0 && us.set(t.strings, s = new Kt(t)), s;
  }
  k(t) {
    qe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const n of t) o === s.length ? s.push(i = new Gt(this.O(Vt()), this.O(Vt()), this, this.options)) : i = s[o], i._$AI(n), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, s); t !== this._$AB; ) {
      const o = as(t).nextSibling;
      as(t).remove(), t = o;
    }
  }
  setConnected(t) {
    var s;
    this._$AM === void 0 && (this._$Cv = t, (s = this._$AP) == null || s.call(this, t));
  }
}
class ge {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, o, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = s, this._$AM = o, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(t, s = this, i, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = Tt(this, t, s, 0), r = !Jt(t) || t !== this._$AH && t !== Dt, r && (this._$AH = t);
    else {
      const a = t;
      let l, d;
      for (t = n[0], l = 0; l < n.length - 1; l++) d = Tt(this, a[i + l], s, l), d === Dt && (d = this._$AH[l]), r || (r = !Jt(d) || d !== this._$AH[l]), d === p ? t = p : t !== p && (t += (d ?? "") + n[l + 1]), this._$AH[l] = d;
    }
    r && !o && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ci extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class di extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class pi extends ge {
  constructor(t, s, i, o, n) {
    super(t, s, i, o, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Tt(this, t, s, 0) ?? p) === Dt) return;
    const i = this._$AH, o = t === p && i !== p || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== p && (i === p || o);
    o && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class hi {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Tt(this, t);
  }
}
const Me = Wt.litHtmlPolyfillSupport;
Me == null || Me(Kt, Gt), (Wt.litHtmlVersions ?? (Wt.litHtmlVersions = [])).push("3.3.3");
const ui = (e, t, s) => {
  const i = (s == null ? void 0 : s.renderBefore) ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const n = (s == null ? void 0 : s.renderBefore) ?? null;
    i._$litPart$ = o = new Gt(t.insertBefore(Vt(), n), n, void 0, s ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bt = globalThis;
let P = class extends Mt {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ui(s, this.renderRoot, this.renderOptions);
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
    return Dt;
  }
};
var Es;
P._$litElement$ = !0, P.finalized = !0, (Es = bt.litElementHydrateSupport) == null || Es.call(bt, { LitElement: P });
const Oe = bt.litElementPolyfillSupport;
Oe == null || Oe({ LitElement: P });
(bt.litElementVersions ?? (bt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _i = (e) => (...t) => ({ _$litDirective$: e, values: t });
let mi = class {
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
const fi = {}, gi = (e, t = fi) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const js = _i(class extends mi {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (gi(e), this.key = t), s;
  }
});
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
const yi = { attribute: !0, type: String, converter: de, reflect: !1, hasChanged: Be }, vi = (e = yi, t, s) => {
  const { kind: i, metadata: o } = s;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
    const { name: r } = s;
    return { set(a) {
      const l = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(r, l, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, e, a), a;
    } };
  }
  if (i === "setter") {
    const { name: r } = s;
    return function(a) {
      const l = this[r];
      t.call(this, a), this.requestUpdate(r, l, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function g(e) {
  return (t, s) => typeof s == "object" ? vi(e, t, s) : ((i, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(e) {
  return g({ ...e, state: !0, attribute: !1 });
}
const T = 5, k = 1440;
function q(e) {
  const [t, s] = e.split(":").map(Number);
  return t * 60 + s;
}
function B(e) {
  const t = Math.max(0, Math.min(k, Math.round(e / T) * T));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function Ot(e, t) {
  var r, a;
  const s = typeof e == "string" ? new Date(e) : e, i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(s), o = Number(((r = i.find((l) => l.type === "hour")) == null ? void 0 : r.value) ?? 0), n = Number(((a = i.find((l) => l.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return o * 60 + n;
}
function Ns(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(s);
}
function he(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function I(e) {
  return !e || !("time" in e) ? null : q(e.time);
}
function $i(e, t) {
  const s = (t == null ? void 0 : t.start) ?? I(e.start) ?? 0, i = t ? t.end : I(e.end ?? null);
  return i == null ? [[s, Math.min(k, s + T)]] : i > s ? [[s, i]] : [[s, k]];
}
function Ve(e) {
  const t = [];
  for (const s of e) {
    const i = I(s.start), o = I(s.end ?? null);
    i !== null && o !== null && o <= i && o < 720 && t.push({ slot: s, end: o });
  }
  return t;
}
function Is(e, t) {
  const s = (Math.round(t) % k + k) % k, i = Math.floor(s / 60), o = s % 60;
  if (e.toLowerCase().startsWith("fr")) return o ? `${i} h ${String(o).padStart(2, "0")}` : `${i} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, i, o)), r = { timeZone: "UTC", hour: "numeric" };
  return o && (r.minute = "2-digit"), new Intl.DateTimeFormat(e, r).format(n).replace(/\s?(AM|PM)/, (a, l) => ` ${l.toLowerCase()}`);
}
function _s(e, t, s, i = /* @__PURE__ */ new Date()) {
  const o = new Date(e), n = he(o, t) === he(i, t), r = Is(s, Ot(o, t));
  return n ? r : `${new Intl.DateTimeFormat(s, { timeZone: t, weekday: "short" }).format(o)} ${r}`;
}
var bi = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, Rt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? wi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && bi(t, s, o), o;
};
let ut = class extends P {
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
    return !this.thin && this._width > 0 && (e.end - e.start) / k * this._width >= 60;
  }
  render() {
    const e = (t) => `${t / k * 100}%`;
    return c`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.spans.map(
      (t) => c`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${this._fits(t) ? c`<span>${t.sun ? c`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : p}${t.label}</span>` : p}</div>`
    )}
        ${this.now !== null ? c`<div class="now" style="left:${e(this.now)}"></div>` : p}
      </div>
      ${this.showHours ? c`<div class="hours">${[0, 6, 12, 18, 24].map((t) => c`<span style="left:${e(t * 60)}">${t}h</span>`)}</div>` : p}
    `;
  }
};
ut.styles = F`
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
Rt([
  g({ attribute: !1 })
], ut.prototype, "spans", 2);
Rt([
  g({ type: Number })
], ut.prototype, "now", 2);
Rt([
  g({ type: Boolean })
], ut.prototype, "thin", 2);
Rt([
  g({ type: Boolean, attribute: "show-hours" })
], ut.prototype, "showHours", 2);
Rt([
  $()
], ut.prototype, "_width", 2);
ut = Rt([
  N("wp-day-bar")
], ut);
var xi = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, ye = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ki(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && xi(t, s, o), o;
};
let zt = class extends P {
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
    return this.open ? c`
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
    ` : c``;
  }
};
zt.styles = F`
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
ye([
  g()
], zt.prototype, "heading", 2);
ye([
  g({ type: Boolean, reflect: !0 })
], zt.prototype, "open", 2);
ye([
  g({ type: Boolean })
], zt.prototype, "wide", 2);
zt = ye([
  N("wp-dialog")
], zt);
const Si = {
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
  tab_scroll: "Sections (scroll sideways for more)",
  act_open: "Open",
  act_close: "Close",
  act_on: "Turn on",
  act_off: "Turn off",
  act_temp: "Temperature",
  act_pos: "Position",
  act_brightness: "Brightness",
  act_kelvin: "White tone",
  act_effect: "Effect",
  act_custom: "Other",
  rest_none: "Leave as is",
  rest_previous: "Previous state",
  rest_of_time: "The rest of the time",
  all_days_text: "Every day",
  weekend: "Wknd",
  all_days: "All",
  weekdays: "Mon–Fri",
  minus15: "15 minutes earlier",
  plus15: "15 minutes later",
  start: "Start",
  end: "End",
  no_end: "No end",
  with_end: "End",
  days_label: "Days",
  action: "Action",
  hours: "Schedule",
  paused: "Paused",
  cancel_manual: "Cancel the manual setting",
  settings: "Settings",
  sun_sunrise_short: "Sunrise",
  sun_sunset_short: "Sunset",
  w_err_overlap: "Two schedules overlap.",
  err_days: "Pick at least one day.",
  err_action: "Pick an action.",
  w_err_same: "Start and end are the same.",
  w_confirm_slot: "Delete this schedule?",
  confirm_pause: "Stop the schedules of “{name}”?",
  pause_do: "Stop",
  confirm_delete_schedule: "Delete the schedule of “{name}”?",
  delete_schedule: "Delete",
  schedule_on: "Schedule on",
  w_add: "Add a schedule",
  w_none: "No schedule.",
  ce_display: "Display",
  ce_display_device: "By device",
  ce_display_schedule: "By schedule"
}, Ai = {
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
  tab_scroll: "Rubriques (faire défiler pour en voir plus)",
  act_open: "Ouvrir",
  act_close: "Fermer",
  act_on: "Allumer",
  act_off: "Éteindre",
  act_temp: "Température",
  act_pos: "Position",
  act_brightness: "Luminosité",
  act_kelvin: "Ton du blanc",
  act_effect: "Effet",
  act_custom: "Autre",
  rest_none: "Ne rien changer",
  rest_previous: "État d'avant",
  rest_of_time: "Le reste du temps",
  all_days_text: "Tous les jours",
  weekend: "W-E",
  all_days: "Tous",
  weekdays: "Lun–Ven",
  minus15: "15 minutes plus tôt",
  plus15: "15 minutes plus tard",
  start: "Début",
  end: "Fin",
  no_end: "Sans fin",
  with_end: "Fin",
  days_label: "Jours",
  action: "Action",
  hours: "Horaires",
  paused: "En pause",
  cancel_manual: "Annuler le réglage manuel",
  settings: "Réglages",
  sun_sunrise_short: "Lever",
  sun_sunset_short: "Coucher",
  w_err_overlap: "Deux horaires se chevauchent.",
  err_days: "Choisissez au moins un jour.",
  err_action: "Choisissez une action.",
  w_err_same: "Le début et la fin sont identiques.",
  w_confirm_slot: "Supprimer cet horaire ?",
  confirm_pause: "Arrêter les horaires de « {name} » ?",
  pause_do: "Arrêter",
  confirm_delete_schedule: "Supprimer l'horaire de « {name} » ?",
  delete_schedule: "Supprimer",
  schedule_on: "Horaires actifs",
  w_add: "Ajouter un horaire",
  w_none: "Aucun horaire.",
  ce_display: "Affichage",
  ce_display_device: "Par appareil",
  ce_display_schedule: "Par horaire"
};
function V(e) {
  return e.startsWith("fr") ? Ai : Si;
}
function h(e, t, s = {}) {
  let i = V(e)[t];
  for (const [o, n] of Object.entries(s)) i = i.replace(`{${o}}`, n);
  return i;
}
var Ei = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, O = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ci(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Ei(t, s, o), o;
};
const et = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, Ft = (e) => e === "input_boolean" ? "switch" : e;
function Je(e, t) {
  const s = V(e)[`type_${t}`];
  return typeof s == "string" ? s : t;
}
const Pi = [
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
], st = F`
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
function Ke(e, t, s) {
  e.dispatchEvent(new CustomEvent(t, { detail: s, bubbles: !0, composed: !0 }));
}
function ms(e, t) {
  if (!t) return "";
  const s = t, i = (o) => h(e, `sp_${o}`);
  switch (t.kind) {
    case "preset":
      return `${Ie(e, String(s.preset))}${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
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
let ot = class extends P {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(A(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Ke(this, "wp-change", e);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const t = this.filter;
      return c`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${t ? (s) => t(s.entity_id) : void 0}
        @value-changed=${(s) => {
        s.stopPropagation(), this._emit(s.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const e = this._ids().slice(0, 600);
    return c`
      <div class="field">
        ${this.label ? c`<label>${this.label}</label>` : p}
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
          ${e.map((t) => c`<option value=${t}>${wt(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
ot.styles = [st, F`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
O([
  g({ attribute: !1 })
], ot.prototype, "hass", 2);
O([
  g()
], ot.prototype, "value", 2);
O([
  g()
], ot.prototype, "label", 2);
O([
  g({ attribute: !1 })
], ot.prototype, "domains", 2);
O([
  g({ attribute: !1 })
], ot.prototype, "exclude", 2);
O([
  g({ attribute: !1 })
], ot.prototype, "filter", 2);
ot = O([
  N("wp-entity-picker")
], ot);
let Xt = class extends P {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e) {
    return h(this._lang, e);
  }
  _set(e) {
    Ke(this, "wp-change", e);
  }
  _patch(e, t) {
    this._set(this.conditions.map((s, i) => i === e ? { ...s, ...t } : s));
  }
  _parse(e, t) {
    const s = e.trim();
    return s !== "" && !Number.isNaN(Number(s)) ? Number(s) : t && s === "true" ? !0 : t && s === "false" ? !1 : e;
  }
  render() {
    return c`
      ${this.conditions.map(
      (e, t) => c`
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
        (s) => c`<option value=${s} ?selected=${(e.op ?? "eq") === s}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[s]}</option>`
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
Xt.styles = st;
O([
  g({ attribute: !1 })
], Xt.prototype, "hass", 2);
O([
  g({ attribute: !1 })
], Xt.prototype, "conditions", 2);
Xt = O([
  N("wp-conditions-editor")
], Xt);
const Rs = {
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
}, Mi = ["scene", "script", "action"];
function Us(e, t) {
  const s = Rs[A(t)];
  return ze(e, t, s ? s[0] : "action");
}
function ze(e, t, s) {
  var o, n, r, a, l, d;
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
      return { kind: s, option: ((l = i.options) == null ? void 0 : l[0]) ?? "" };
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
let Z = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return h(this._lang, e, t);
  }
  get _domain() {
    return A(this.entityId);
  }
  get _attrs() {
    var e, t;
    return ((t = (e = this.hass) == null ? void 0 : e.states[this.entityId]) == null ? void 0 : t.attributes) ?? {};
  }
  _kinds() {
    var o;
    const e = Rs[this._domain] ?? [], t = !this.stateOnly && this.admin ? Mi : [], s = (o = this.value) == null ? void 0 : o.kind, i = [...e, ...t];
    return s && !i.includes(s) && i.push(s), i;
  }
  _current() {
    return this.value ?? ze(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [s, i] of Object.entries(e))
      s !== "kind" && i !== void 0 && i !== "" && !(typeof i == "number" && Number.isNaN(i)) && (t[s] = i);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), Ke(this, "wp-change", t);
  }
  _patch(e) {
    this._emit({ ...this._current(), ...e });
  }
  _number(e, t, s, i, o = 1, n = "") {
    const r = this._current();
    return c`
      <div class="field">
        <label>${this._tr(e)}${n ? ` (${n})` : ""}</label>
        <input type="number" min=${s} max=${i} step=${o} .value=${r[t] === void 0 ? "" : String(r[t])}
          @change=${(a) => {
      const l = a.target.value;
      this._patch({ [t]: l === "" ? void 0 : Math.min(i, Math.max(s, Number(l))) });
    }} />
      </div>`;
  }
  _choice(e, t, s, i = !1, o = !1) {
    const r = this._current()[t] ?? "";
    if (!(s != null && s.length) && !i && o)
      return c`<div class="field"><label>${this._tr(e)}</label>
        <input type="text" .value=${r} @change=${(l) => this._patch({ [t]: l.target.value })} /></div>`;
    const a = s ?? [];
    return c`
      <div class="field">
        <label>${this._tr(e)}</label>
        <select @change=${(l) => this._patch({ [t]: l.target.value || void 0 })}>
          ${i ? c`<option value="" ?selected=${r === ""}>—</option>` : p}
          ${!a.includes(r) && r ? c`<option value=${r} selected>${r}</option>` : p}
          ${a.map((l) => c`<option value=${l} ?selected=${l === r}>${l}</option>`)}
        </select>
      </div>`;
  }
  _fields(e) {
    const t = this._attrs;
    switch (e.kind) {
      case "preset":
        return c`${this._choice("f_preset", "preset", t.preset_modes, !1, !0)}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
      case "temperature":
        return c`${this._number("f_temperature", "temperature", t.min_temp ?? 5, t.max_temp ?? 35, t.target_temp_step ?? 0.5, "°C")}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
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
        return this._domain === "light" ? c`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", t.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : p;
      case "auto":
        return c`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(s) => s.startsWith("switch.adaptive_lighting")}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ adaptive_switch: s.detail || void 0 });
        }}></wp-entity-picker>
            ${e.adaptive_switch ? c`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : p}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail || void 0 });
        }}></wp-entity-picker></div>`;
      case "water_heater":
        return c`${this._choice("f_operation_mode", "operation_mode", t.operation_list, !0)}${this._number("f_temperature", "temperature", t.min_temp ?? 20, t.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return c`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ scene: s.detail });
        }}></wp-entity-picker></div>`;
      case "script":
        return c`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
            @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ script: s.detail });
        }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(e);
      default:
        return p;
    }
  }
  _actionFields(e) {
    const t = JSON.stringify(e.data ?? {}, null, 2);
    return this._jsonFor !== this.entityId + t && !this._jsonError && (this._json = t, this._jsonFor = this.entityId + t), c`
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
        ${this._jsonError ? c`<span class="error">${this._tr("f_json_invalid")}</span>` : p}</div>
      <label class="check"><input type="checkbox" .checked=${e.target_self !== !1}
        @change=${(s) => this._patch({ target_self: s.target.checked ? void 0 : !1 })} />
        ${this._tr("f_target_self")}</label>`;
  }
  render() {
    const e = this._kinds(), t = this._current();
    return c`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(s) => this._emit(ze(this.hass, this.entityId, s.target.value))}>
          ${e.map((s) => c`<option value=${s} ?selected=${s === t.kind}>${this._tr(`sp_${s}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
Z.styles = st;
O([
  g({ attribute: !1 })
], Z.prototype, "hass", 2);
O([
  g({ attribute: "entity-id" })
], Z.prototype, "entityId", 2);
O([
  g({ attribute: !1 })
], Z.prototype, "value", 2);
O([
  g({ type: Boolean })
], Z.prototype, "admin", 2);
O([
  g({ type: Boolean, attribute: "state-only" })
], Z.prototype, "stateOnly", 2);
O([
  $()
], Z.prototype, "_json", 2);
O([
  $()
], Z.prototype, "_jsonError", 2);
Z = O([
  N("wp-setpoint-editor")
], Z);
let ie, vt;
const oe = /* @__PURE__ */ new Set();
function Oi(e, t) {
  return oe.add(t), ie && t(ie), vt || (vt = e.connection.subscribeMessage(
    (s) => {
      ie = s, oe.forEach((i) => i(s));
    },
    { type: "weekly_planner/subscribe" }
  ), vt.catch(() => {
    vt = void 0;
  })), () => {
    oe.delete(t), oe.size === 0 && vt && (vt.then((s) => s()).catch(() => {
    }), vt = void 0, ie = void 0);
  };
}
const A = (e) => e.split(".")[0];
function je(e) {
  var t;
  return e.main_type || A(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function Ht(e, t) {
  var i;
  const s = ((i = t.status[e.id]) == null ? void 0 : i.active_profile) ?? e.active_profile;
  return e.profiles.find((o) => o.id === s) ?? e.profiles[0];
}
function Xe(e, t, s) {
  const i = e.actions.by_type[je(t)] ?? Object.values(e.actions.by_type)[0];
  return s.find((o) => o.id === i);
}
function ue(e, t, s) {
  var i;
  return e.color || ((i = Xe(e, t, s)) == null ? void 0 : i.color) || "var(--secondary-text-color)";
}
function Ne(e, t, s, i) {
  const o = Xe(e, t, s);
  if (o) return o.name;
  const n = t.entities.map((r) => e.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return n.length ? n.length > 1 ? `${ms(i, n[0])} +${n.length - 1}` : ms(i, n[0]) : "";
}
function wt(e, t) {
  var s;
  return ((s = e.states[t]) == null ? void 0 : s.attributes.friendly_name) ?? t;
}
function fs(e, t) {
  var o, n;
  if (t.program) return e.programs.filter((r) => r.id === t.program);
  const s = (o = t.filter) == null ? void 0 : o.types, i = (n = t.filter) == null ? void 0 : n.area;
  return e.programs.filter((r) => !(s != null && s.length) || r.entities.some((a) => s.includes(A(a.entity_id)))).filter((r) => !i || r.area === i).sort((r, a) => r.priority - a.priority || r.name.localeCompare(a.name));
}
function pt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function _e(e, t) {
  return new Intl.NumberFormat(e, { maximumFractionDigits: 1 }).format(t);
}
function Ie(e, t) {
  const s = V(e)[`preset_${t}`];
  return typeof s == "string" ? s : t;
}
const ve = (e, t) => {
  var s;
  return ((s = e.exceptions) == null ? void 0 : s[t]) ?? e.value;
}, ne = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Di(e, t, s) {
  var o, n, r;
  const i = ((o = e.states[t]) == null ? void 0 : o.attributes) ?? {};
  return ne((n = i.preset_temperatures) == null ? void 0 : n[s]) ?? ne((r = i.preset_temperatures) == null ? void 0 : r[`${s}_temp`]) ?? ne(i[`${s}_temp`]) ?? ne(i[`${s}_temperature`]);
}
const Fs = " ", me = (e) => e.replace(/ /g, Fs), xt = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function Bt(e, t, s) {
  const i = e.actions.by_entity[t];
  if (i)
    return { sp: i };
  const o = e.actions.by_type[A(t)], n = s.find((r) => r.id === o);
  return n ? { sp: ve(n, t), modeId: n.id } : null;
}
function Ti(e, t, s, i) {
  const o = A(s), n = { ...e.actions.by_type }, r = { ...e.actions.by_entity }, a = t.entities.filter((l) => A(l.entity_id) === o).length <= 1;
  return i.modeId && a ? (n[o] = i.modeId, delete r[s]) : (r[s] = i.sp, a && delete n[o]), { ...e, actions: { by_type: n, by_entity: r } };
}
function zi(e, t) {
  const s = e.default ?? { kind: "none" };
  if (s.kind === "mode") {
    const i = t.find((o) => o.id === s.value);
    if (i) return { sp: ve(i, e.entity_id), modeId: i.id };
  }
  return s.kind === "setpoint" && s.value && typeof s.value == "object" ? { sp: s.value } : { sp: { kind: "off" }, special: s.kind === "previous" ? "previous" : "none" };
}
function ji(e) {
  return e.special ? { kind: e.special } : e.modeId ? { kind: "mode", value: e.modeId } : { kind: "setpoint", value: e.sp };
}
const kt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Yt(e, t, s, i, o) {
  var d;
  const n = "sp" in o ? o : { sp: o }, r = n.sp, a = n.modeId ? s.find((m) => m.id === n.modeId) : void 0, l = A(i);
  switch (r.kind) {
    case "scene":
      return String(((d = e.states[String(r.scene)]) == null ? void 0 : d.attributes.friendly_name) ?? r.scene);
    case "temperature":
      return `${_e(t, Number(r.temperature))} °C`;
    case "preset": {
      if (a) return a.name;
      const m = Di(e, i, String(r.preset));
      return m !== null ? `${Ie(t, String(r.preset))} ${_e(t, m)} °C` : Ie(t, String(r.preset));
    }
    case "open":
      return h(t, "act_open");
    case "close":
      return h(t, "act_close");
    case "position":
      return `${r.position} %`;
    case "off":
      return l === "climate" ? h(t, "sp_off") : h(t, "act_off");
    case "on": {
      const m = [h(t, "act_on")];
      return kt(r.brightness) !== null && m.push(`${r.brightness} %`), r.effect && m.push(String(r.effect)), kt(r.color_temp_kelvin) !== null && m.push(`${r.color_temp_kelvin} K`), m.join(" ");
    }
    default:
      return (a == null ? void 0 : a.name) ?? String(r.kind);
  }
}
function Ni(e, t, s) {
  const i = e.states[s];
  if (!i) return "?";
  if (i.state === "unavailable" || i.state === "unknown") return "—";
  const o = i.attributes;
  switch (A(s)) {
    case "climate": {
      if (i.state === "off") return h(t, "sp_off");
      const n = kt(o.temperature);
      return n !== null ? `${_e(t, n)} °C` : i.state;
    }
    case "cover": {
      const n = kt(o.current_position);
      return i.state === "open" && n !== null && n < 100 ? `${n} %` : i.state === "open" ? h(t, "sp_open") : i.state === "closed" ? h(t, "sp_close") : `${n ?? ""} %`;
    }
    case "light": {
      if (i.state !== "on") return h(t, "sp_off");
      const n = kt(o.brightness);
      return n !== null ? `${h(t, "sp_on")} ${Math.round(n / 255 * 100)} %` : h(t, "sp_on");
    }
    default:
      return i.state === "on" ? h(t, "sp_on") : i.state === "off" ? h(t, "sp_off") : i.state;
  }
}
function Ls(e, t, s) {
  if (!s) return "var(--disabled-text-color, #9e9e9e)";
  const i = s.modeId ? e.find((n) => n.id === s.modeId) : e.find((n) => xt(ve(n, t), s.sp));
  if (i) return i.color;
  const o = s.sp;
  switch (o.kind) {
    case "temperature": {
      const n = Math.max(10, Math.min(24, Number(o.temperature)));
      return `hsl(${Math.round(210 - (n - 10) / 14 * 180)}, 70%, 48%)`;
    }
    case "preset":
      return "#ff9800";
    case "open":
      return "#ffc107";
    case "close":
      return "#455a64";
    case "position":
      return "#8bc34a";
    case "on":
      return "#ffb300";
    case "off":
      return "#616161";
    case "scene":
      return "#7e57c2";
    default:
      return "var(--secondary-text-color)";
  }
}
const Ii = (e, t) => {
  const s = Math.abs(t), i = s < 60 ? `${s} min` : s % 60 ? `${Math.floor(s / 60)} h ${String(s % 60).padStart(2, "0")}` : `${s / 60} h`;
  return `${t > 0 ? "+" : "−"}${i}`;
};
function Re(e, t, s) {
  if ("time" in t) {
    const [n, r] = t.time.split(":").map(Number);
    return me(n * 60 + r >= k ? "24 h" : Is(e, n * 60 + r));
  }
  const i = h(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`), o = t.offset ? ` ${Ii(e, t.offset)}` : "";
  return me(`${i}${o}`);
}
function gs(e, t) {
  if ("time" in e) {
    const [s, i] = e.time.split(":").map(Number), o = Math.max(0, Math.min(k, Math.round((s * 60 + i + t) / T) * T));
    return { time: o >= k ? "24:00" : `${String(Math.floor(o / 60)).padStart(2, "0")}:${String(o % 60).padStart(2, "0")}` };
  }
  return { ...e, offset: Math.max(-240, Math.min(240, (e.offset ?? 0) + t)) };
}
const Ws = [0, 1, 2, 3, 4], Hs = [5, 6], Ye = [0, 1, 2, 3, 4, 5, 6];
function Ri(e, t, s) {
  const i = [...s].sort((o, n) => o - n);
  return xt(i, Ye) ? h(e, "all_days_text") : xt(i, Ws) ? `${t[0]}–${t[4]}` : xt(i, Hs) ? h(e, "weekend") : i.map((o) => t[o]).join(Fs);
}
function Ue(e) {
  if (Array.isArray(e)) return `[${e.map(Ue).join(",")}]`;
  if (e && typeof e == "object") {
    const t = e;
    return `{${Object.keys(t).sort().map((s) => `${JSON.stringify(s)}:${Ue(t[s])}`).join(",")}}`;
  }
  return JSON.stringify(e);
}
function Ui(e) {
  const { id: t, ...s } = e;
  return Ue({ ...s, conditions: e.conditions ?? [], end: e.end ?? null, color: e.color ?? null });
}
function De(e, t, s) {
  const i = /* @__PURE__ */ new Map();
  return e.days.forEach((o, n) => {
    for (const r of o) {
      if (!t(r)) continue;
      const a = Ui(r);
      let l = i.get(a);
      if (l && l.days.includes(n)) {
        l = void 0, i.set(`${a}#${r.id}`, { slot: r, days: [n], ids: { [n]: r.id } });
        continue;
      }
      l || (l = { slot: r, days: [], ids: {} }, i.set(a, l)), l.days.push(n), l.ids[n] = r.id;
    }
  }), [...i.values()].sort(
    (o, n) => s(o.slot.start) - s(n.slot.start) || o.days[0] - n.days[0]
  );
}
function ys(e, t, s, i) {
  const o = e.days.map((n) => n.filter((r) => !s(r)));
  for (const n of t)
    for (const r of n.days)
      o[r].push({ ...structuredClone(n.slot), id: n.ids[r] ?? pt() });
  return { ...e, days: o.map((n) => n.sort((r, a) => i(r.start) - i(a.start))) };
}
const Fi = /* @__PURE__ */ new Set(["none", "temporary", "permanent"]);
function Li(e, t) {
  return Object.values(e.states).filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(t)).map((s) => ({ id: s.entity_id, name: String(s.attributes.friendly_name ?? s.entity_id) })).sort((s, i) => s.name.localeCompare(i.name));
}
function Wi(e, t, s, i, o = !0) {
  var _;
  const n = A(i), r = ((_ = e.states[i]) == null ? void 0 : _.attributes) ?? {}, a = [], l = (f) => {
    a.some((b) => b.id === f.id || f.group === "common" && xt(b.act.sp, f.act.sp)) || a.push(f);
  }, d = (f, b, x, G) => l({ id: f, label: b, act: { sp: x }, group: "basic", param: G });
  if (n === "climate") {
    d("temperature", h(t, "act_temp"), { kind: "temperature", temperature: kt(r.temperature) ?? 19 }, "temperature");
    for (const f of r.preset_modes ?? [])
      Fi.has(f) || l({
        id: `preset:${f}`,
        label: Yt(e, t, [], i, { kind: "preset", preset: f }),
        group: "own",
        act: { sp: { kind: "preset", preset: f } }
      });
    (r.hvac_modes ?? []).includes("off") && d("off", h(t, "sp_off"), { kind: "off" });
  } else n === "cover" ? (d("open", h(t, "act_open"), { kind: "open" }), d("close", h(t, "act_close"), { kind: "close" }), d("position", h(t, "act_pos"), { kind: "position", position: kt(r.current_position) ?? 50 }, "position")) : n === "light" ? (d("on", h(t, "act_on"), { kind: "on" }, "light"), d("off", h(t, "act_off"), { kind: "off" })) : ["switch", "input_boolean", "fan"].includes(n) && (d("on", h(t, "act_on"), { kind: "on" }), d("off", h(t, "act_off"), { kind: "off" }));
  if (o)
    for (const f of Li(e, i))
      l({ id: f.id, label: f.name, group: "scene", act: { sp: { kind: "scene", scene: f.id } } });
  const m = n === "input_boolean" ? "switch" : n;
  for (const f of s.filter((b) => b.type === m))
    l({ id: `mode:${f.id}`, label: f.name, group: "common", act: { sp: ve(f, i), modeId: f.id } });
  return a;
}
function Hi(e, t) {
  if (!t) return;
  const s = t.modeId ? e.find((o) => o.act.modeId === t.modeId) : void 0;
  if (s) return s;
  const i = t.sp.kind;
  return e.find((o) => o.param && o.act.sp.kind === i && !o.act.modeId) ?? e.find((o) => !o.act.modeId && xt(o.act.sp, t.sp)) ?? e.find((o) => xt(o.act.sp, t.sp));
}
var Bi = Object.defineProperty, qi = Object.getOwnPropertyDescriptor, Et = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? qi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Bi(t, s, o), o;
};
const lt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, re = (e, t, s) => Math.min(s, Math.max(t, e));
let nt = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.act = null, this.rest = !1, this.disabled = !1;
  }
  get _lang() {
    return et(this.hass);
  }
  _emit(e) {
    this.dispatchEvent(new CustomEvent("act-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _choices() {
    return Wi(this.hass, this._lang, this.data.modes, this.entityId, !this.rest);
  }
  _pick(e) {
    this._emit({ ...e.act, sp: structuredClone(e.act.sp) });
  }
  _patch(e, t = []) {
    var i;
    const s = { ...((i = this.act) == null ? void 0 : i.sp) ?? { kind: "on" }, ...e };
    for (const o of t) delete s[o];
    this._emit({ sp: s });
  }
  _stepper(e, t, s, i, o) {
    return c`<div class="stepper" role="group" aria-label=${e}>
      <span class="lbl">${e}</span>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="−" @click=${s}><ha-icon icon="mdi:minus"></ha-icon></button>
      <output>${t}</output>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="+" @click=${i}><ha-icon icon="mdi:plus"></ha-icon></button>
      ${o ? c`<button class="ibtn round" ?disabled=${this.disabled} aria-label=${h(this._lang, "clear")} @click=${o}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
    </div>`;
  }
  _params(e) {
    var a;
    if (!(e != null && e.param) || !this.act) return p;
    const t = this._lang, s = ((a = this.hass.states[this.entityId]) == null ? void 0 : a.attributes) ?? {}, i = this.act.sp;
    if (e.param === "temperature") {
      const l = lt(s.min_temp) ?? 5, d = lt(s.max_temp) ?? 35, m = lt(i.temperature) ?? 19, _ = (f) => this._patch({ temperature: re(Math.round(f * 2) / 2, l, d) });
      return this._stepper(h(t, "act_temp"), `${_e(t, m)} °C`, () => _(m - 0.5), () => _(m + 0.5));
    }
    if (e.param === "position") {
      const l = lt(i.position) ?? 50, d = (m) => this._patch({ position: re(Math.round(m / 5) * 5, 0, 100) });
      return c`${this._stepper(h(t, "act_pos"), `${l} %`, () => d(l - 10), () => d(l + 10))}
        <input type="range" min="0" max="100" step="5" .value=${String(l)} ?disabled=${this.disabled}
          aria-label=${h(t, "act_pos")} @change=${(m) => d(Number(m.target.value))} />`;
    }
    const o = s.supported_color_modes ?? [], n = s.effect_list ?? [], r = [];
    if (o.some((l) => l !== "onoff")) {
      const l = lt(i.brightness), d = (m) => this._patch({ brightness: re(Math.round(m / 5) * 5, 5, 100) });
      r.push(this._stepper(
        h(t, "act_brightness"),
        l === null ? "—" : `${l} %`,
        () => d((l ?? 100) - 10),
        () => d((l ?? 90) + 10),
        l === null ? void 0 : () => this._patch({}, ["brightness"])
      ));
    }
    if (o.includes("color_temp")) {
      const l = lt(s.min_color_temp_kelvin) ?? 2e3, d = lt(s.max_color_temp_kelvin) ?? 6500, m = lt(i.color_temp_kelvin), _ = (f) => this._patch({ color_temp_kelvin: re(Math.round(f / 100) * 100, l, d) });
      r.push(this._stepper(
        h(t, "act_kelvin"),
        m === null ? "—" : `${m} K`,
        () => _((m ?? 3e3) - 200),
        () => _((m ?? 2800) + 200),
        m === null ? void 0 : () => this._patch({}, ["color_temp_kelvin"])
      ));
    }
    return n.length && r.push(c`<label class="eff"><span class="lbl">${h(t, "act_effect")}</span>
        <select ?disabled=${this.disabled} @change=${(l) => {
      const d = l.target.value;
      d ? this._patch({ effect: d }) : this._patch({}, ["effect"]);
    }}>
          <option value="">—</option>
          ${n.map((l) => c`<option value=${l} ?selected=${l === i.effect}>${l}</option>`)}
        </select></label>`), c`${r}`;
  }
  render() {
    var r, a, l;
    if (!this.hass || !this.data || !this.entityId) return p;
    const e = this._lang, t = this._choices(), s = (r = this.act) != null && r.special ? void 0 : Hi(t, this.act), i = this.act && !this.act.special && !s, o = A(this.entityId), n = (d, m, _, f) => c`
      <button class="chip ${m ? "on" : ""}" role="radio" aria-checked=${m} ?disabled=${this.disabled} @click=${_}>
        ${f ? c`<ha-icon icon=${f}></ha-icon>` : p}<span>${d}</span></button>`;
    return c`
      <div class="chips" role="radiogroup" aria-label=${h(e, "action")}>
        ${i ? n(h(e, "act_custom"), !0, () => {
    }) : p}
        ${t.map((d) => n(
      d.label,
      (s == null ? void 0 : s.id) === d.id,
      () => this._pick(d),
      d.group === "scene" ? "mdi:palette-outline" : void 0
    ))}
        ${this.rest ? c`
          ${n(h(e, "rest_none"), ((a = this.act) == null ? void 0 : a.special) === "none", () => this._emit({ sp: { kind: "off" }, special: "none" }))}
          ${n(h(e, "rest_previous"), ((l = this.act) == null ? void 0 : l.special) === "previous", () => this._emit({ sp: { kind: "off" }, special: "previous" }))}` : p}
      </div>
      ${o ? this._params(s) : p}`;
  }
};
nt.styles = [st, F`
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
    .stepper { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .stepper .lbl { flex: 1 1 100%; font-size: 13px; color: var(--secondary-text-color); }
    .stepper output { min-width: 84px; text-align: center; font-size: 22px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); }
    input[type="range"] { width: 100%; min-height: 48px; margin: 4px 0 0; accent-color: var(--primary-color); }
    .eff { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .eff .lbl { font-size: 13px; color: var(--secondary-text-color); }
  `];
Et([
  g({ attribute: !1 })
], nt.prototype, "hass", 2);
Et([
  g({ attribute: !1 })
], nt.prototype, "data", 2);
Et([
  g({ attribute: "entity-id" })
], nt.prototype, "entityId", 2);
Et([
  g({ attribute: !1 })
], nt.prototype, "act", 2);
Et([
  g({ type: Boolean })
], nt.prototype, "rest", 2);
Et([
  g({ type: Boolean })
], nt.prototype, "disabled", 2);
nt = Et([
  N("wp-action-picker")
], nt);
var Vi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, J = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ji(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Vi(t, s, o), o;
};
function vs(e, t) {
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
function $s(e, t) {
  const [s, i, o] = e.split("-").map(Number), n = Date.UTC(s, i - 1, o), r = n - vs(n, t);
  return n - vs(r, t);
}
function Bs(e, t) {
  const [s, i, o] = e.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, o + t)).toISOString().slice(0, 10);
}
function ae(e, t) {
  return { startMs: $s(e, t), endMs: $s(Bs(e, 1), t) };
}
function Ki(e) {
  const [t, s, i] = e.split("-").map(Number);
  return Ns(new Date(Date.UTC(t, s - 1, i, 12)), "UTC");
}
const Te = /* @__PURE__ */ new Map();
function bs(e, t, s) {
  const i = Te.get(e);
  if (i && Date.now() - i.at < t) return i.p;
  const o = s();
  return Te.set(e, { at: Date.now(), p: o }), o.catch(() => Te.delete(e)), o;
}
const ws = "var(--disabled-text-color, #9e9e9e)";
function xs(e) {
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
const Xi = (e) => e === "unavailable" || e === "unknown" || e === "", W = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let R = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.simple = !1, this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._cursor = null, this._model = null, this._token = 0;
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
    const { startMs: s, endMs: i } = ae(this.date, this._tz), o = Date.now(), r = i > o ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const l = s < o ? bs(`h|${e}|${a}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(s).toISOString(),
        end_time: new Date(Math.min(i, o)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), d = Math.min(14, Math.max(1, Math.ceil((o - s) / 864e5) + 1)), m = s < o ? bs(`j|${this.entityId}|${d}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: d })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, f] = await Promise.all([l, m]);
      if (t !== this._token) return;
      this._loaded = {
        hist: xs(_[this.entityId]),
        win: a ? xs(_[a]) : [],
        journal: (f.segments ?? []).filter((b) => b.entity_id === this.entityId)
      };
    } catch {
      t === this._token && (this._failed = !0);
    }
  }
  /** A window binary sensor of a thermostat (id contains the climate name and "window"). */
  _windowSensor() {
    if (A(this.entityId) !== "climate") return null;
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
    return e.actions.by_entity[this.entityId] ?? this._modeSetpoint(e.actions.by_type[A(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(e) {
    if (!e) return null;
    const t = A(this.entityId);
    if (t === "climate") {
      const s = W(e.temperature);
      return s !== null ? s : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? W(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? W(e.brightness) ?? 100 : null : e.kind === "value" ? W(e.value) : null;
  }
  _presetTemperature(e) {
    var a, l;
    const t = ((a = this.hass.states[this.entityId]) == null ? void 0 : a.attributes) ?? {}, s = W((l = t.preset_temperatures) == null ? void 0 : l[e]) ?? W(t[`${e}_temp`]) ?? W(t[`${e}_temperature`]);
    if (s !== null) return s;
    const i = Array.isArray(t.preset_modes) ? t.preset_modes : [], o = i.indexOf(e);
    if (o < 0) return null;
    const n = W(t.min_temp) ?? 5, r = W(t.max_temp) ?? 30;
    return n + (o + 1) / (i.length + 1) * (r - n);
  }
  _live(e) {
    const t = A(this.entityId);
    if (Xi(e.s)) return { applied: null, measured: null };
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
    var es, ss;
    const t = this._tz, { startMs: s, endMs: i } = ae(this.date, t), o = Math.round((i - s) / 6e4), n = Date.now(), r = Math.max(0, Math.min(o, (n - s) / 6e4)), a = (u) => (u - s) / 6e4, l = A(this.entityId), d = this.data.modes, m = Ht(this.program, this.data), _ = /* @__PURE__ */ new Map();
    for (const u of this.program.profiles) for (const y of u.days.flat()) _.set(y.id, y);
    h(this._lang, "override");
    const f = Ki(this.date), b = [];
    for (const { slot: u, end: y } of Ve(m.days[(f + 6) % 7])) b.push({ s: 0, e: y, slot: u });
    if (this.slots)
      for (const u of this.slots) {
        const y = _.get(u.slot_id);
        if (!y || u.ignored) continue;
        const w = Math.max(0, a(Date.parse(u.start))), C = u.end ? Math.min(o, a(Date.parse(u.end))) : w + 5;
        C > w && b.push({ s: w, e: C, slot: y });
      }
    else
      for (const u of m.days[f]) {
        const y = I(u.start);
        if (y === null) continue;
        const w = I(u.end ?? null);
        b.push({ s: y, e: w === null ? y + 5 : w > y ? w : o, slot: u });
      }
    b.sort((u, y) => u.s - y.s);
    const x = (es = this.program.entities.find((u) => u.entity_id === this.entityId)) == null ? void 0 : es.default, G = x ? x.kind === "mode" ? this._modeSetpoint(String(x.value), this.entityId) : x.kind === "setpoint" ? x.value : null : null, v = (x == null ? void 0 : x.kind) === "mode" ? d.find((u) => u.id === x.value) : void 0, X = (x == null ? void 0 : x.kind) === "previous", E = [];
    let H = 0;
    const Zt = (u) => {
      if (u <= H) return;
      const y = E[E.length - 1];
      E.push(X && y ? { ...y, s: H, e: u } : { s: H, e: u, v: this._value(G), color: (v == null ? void 0 : v.color) ?? ws, label: (v == null ? void 0 : v.name) ?? h(this._lang, "default_state") }), H = u;
    };
    for (const u of b) {
      const y = Math.max(u.s, H);
      if (u.e <= y) continue;
      Zt(y);
      const w = this._slotSetpoint(u.slot);
      E.push({
        s: y,
        e: u.e,
        v: this._value(w),
        color: ue(u.slot, this.program, d),
        label: Ne(u.slot, this.program, d, this._lang)
      }), H = u.e;
    }
    Zt(o);
    const D = (u) => E.find((y) => u >= y.s && u < y.e) ?? E[E.length - 1], at = e.journal.map((u) => ({ m: a(Date.parse(u.at)), e: u })).filter((u) => !Number.isNaN(u.m)).sort((u, y) => u.m - y.m), we = (u) => {
      let y = null;
      for (const C of at) if (C.m <= u) y = C;
      else break;
      if (!y) return null;
      const w = y.e.slot_id ? _.get(y.e.slot_id) : void 0;
      return {
        s: y.m,
        e: y.m,
        v: this._value(y.e.setpoint),
        color: w ? ue(w, this.program, d) : ws,
        label: w ? Ne(w, this.program, d, this._lang) : ""
      };
    }, Qt = /* @__PURE__ */ new Set([0, o, r]);
    E.forEach((u) => {
      Qt.add(u.s), Qt.add(u.e);
    }), at.forEach((u) => {
      u.m > 0 && u.m < o && Qt.add(u.m);
    });
    const xe = [...Qt].filter((u) => u >= 0 && u <= o).sort((u, y) => u - y), te = [];
    for (let u = 0; u < xe.length - 1; u++) {
      const y = xe[u], w = xe[u + 1];
      if (w - y < 0.01) continue;
      const C = (y + w) / 2, gt = (C < r ? we(C) : null) ?? D(C);
      te.push({ s: y, e: w, v: gt.v, color: gt.color, label: gt.label });
    }
    const Ct = [], ke = [], Ge = [];
    for (const u of e.hist) {
      const y = Math.max(0, a(u.t)), w = this._live(u);
      Ct.push({ m: y, v: w.applied, heating: u.a.hvac_action === "heating" }), ke.push({ m: y, v: w.measured });
    }
    const Ze = (u, y) => {
      const w = [];
      return u.forEach((C, ft) => {
        if (!y(ft)) return;
        const gt = ft + 1 < u.length ? u[ft + 1].m : r;
        if (gt > C.m) {
          const Ee = w[w.length - 1];
          Ee && Math.abs(Ee[1] - C.m) < 0.01 ? Ee[1] = gt : w.push([C.m, gt]);
        }
      }), w;
    };
    Ge.push(...Ze(Ct, (u) => !!Ct[u].heating));
    const Qe = e.win.map((u) => ({ m: Math.max(0, a(u.t)), open: u.s === "on" })), Vs = Ze(Qe, (u) => Qe[u].open), Js = (u, y) => {
      let w = null, C = !1;
      for (const ft of u) if (ft.m <= y)
        w = ft.v, C = !0;
      else break;
      return C ? w : null;
    }, Ks = (u) => {
      var y;
      return ((y = te.find((w) => u >= w.s && u < w.e)) == null ? void 0 : y.v) ?? null;
    }, Xs = l === "climate" ? 0.5 : 5, ts = [];
    let Pt = null;
    const Se = Math.floor(r);
    for (let u = 0; u <= Se + 1; u++) {
      const y = u <= Se ? Ks(u + 0.5) : null, w = u <= Se ? Js(Ct, u + 0.5) : null, C = y !== null && w !== null && Math.abs(y - w) > Xs;
      C && Pt === null && (Pt = u), !C && Pt !== null && (u - Pt > 2 && ts.push([Pt, u]), Pt = null);
    }
    const Ae = [...te.map((u) => u.v), ...Ct.map((u) => u.v), ...ke.map((u) => u.v)].filter((u) => u !== null);
    let ee = 0, se = 100;
    l !== "cover" && l !== "light" && Ae.length && (ee = Math.floor(Math.min(...Ae) - 1), se = Math.ceil(Math.max(...Ae) + 1), se - ee < 2 && (se = ee + 2));
    const Ys = l === "climate" ? "°C" : l === "cover" || l === "light" ? "%" : ((ss = this.hass.states[this.entityId]) == null ? void 0 : ss.attributes.unit_of_measurement) ?? "";
    return {
      span: o,
      pastEnd: r,
      isToday: s <= n && n < i,
      planned: te,
      applied: Ct,
      measured: ke,
      heat: Ge,
      win: Vs,
      over: ts,
      lo: ee,
      hi: se,
      unit: Ys
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
    const { startMs: t } = ae(this.date, this._tz);
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
    return e.forEach((a, l) => {
      const d = l + 1 < e.length ? e[l + 1].m : t.pastEnd;
      if (a.v === null || d < a.m) {
        r = !1;
        return;
      }
      const m = i(a.v);
      o ? n += r ? `V${m.toFixed(1)}H${s(d).toFixed(1)}` : `M${s(a.m).toFixed(1)},${m.toFixed(1)}H${s(d).toFixed(1)}` : (n += `${r ? "L" : "M"}${s(a.m).toFixed(1)},${m.toFixed(1)}`, l + 1 === e.length && (n += `L${s(d).toFixed(1)},${m.toFixed(1)}`)), r = !0;
    }), n;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const e = V(this._lang), t = this._model, s = wt(this.hass, this.entityId);
    let i;
    return this._failed ? i = c`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((o) => o.v !== null) && !t.applied.some((o) => o.v !== null) && !t.measured.some((o) => o.v !== null) ? i = c`<div class="note">${e.no_data}</div>` : i = this._renderChart(t, s) : i = c`<div class="note">${e.chart_loading}</div>`, c`<div class="box">${i}</div>${t ? this._legend(t) : p}`;
  }
  _legend(e) {
    const t = V(this._lang), s = (i, o) => c`<span class="key"><i class=${i}></i>${o}</span>`;
    return c`<div class="legend">
      ${s("planned", t.planned)}
      ${!this.simple && e.applied.some((i) => i.v !== null) ? s("applied", t.applied) : p}
      ${e.measured.some((i) => i.v !== null) ? s("measured", t.measured) : p}
      ${!this.simple && e.win.length ? s("zone win", t.window_open) : p}
      ${!this.simple && e.heat.length ? s("zone heat", t.heating) : p}
      ${!this.simple && e.over.length ? s("zone over", t.overridden) : p}
    </div>`;
  }
  _renderChart(e, t) {
    const s = V(this._lang), i = this._width, o = Yi, n = (v) => S.l + v / e.span * (i - S.l - S.r), r = (v) => S.t + (1 - (v - e.lo) / (e.hi - e.lo)) * (o - S.t - S.b), { startMs: a } = ae(this.date, this._tz), l = [0, 1, 2, 3].map((v) => e.lo + (e.hi - e.lo) * v / 3), d = [];
    for (let v = 0; v <= e.span; v += 180) d.push(v);
    const m = (v, X) => v.map(([E, H]) => it`<rect class="z ${X}" x=${n(E)} y=${S.t} width=${Math.max(1, n(H) - n(E))}
        height=${o - S.t - S.b}></rect>`), _ = this._cursor;
    let f = p, b = p, x = "";
    if (_ !== null) {
      const v = e.planned.find((D) => _ >= D.s && _ < D.e), X = [];
      X.push([s.planned, `${this._fmt((v == null ? void 0 : v.v) ?? null, e.unit)}${v != null && v.label ? " · " + v.label : ""}`]), _ <= e.pastEnd && (!this.simple && e.applied.some((D) => D.v !== null) && X.push([s.applied, this._fmt(this._valueAt(e.applied, _), e.unit)]), e.measured.some((D) => D.v !== null) && X.push([s.measured, this._fmt(this._valueAt(e.measured, _), e.unit)]));
      const E = [], H = (D) => D.some(([at, we]) => _ >= at && _ < we);
      H(e.win) && E.push(s.window_open), H(e.heat) && E.push(s.heating), H(e.over) && E.push(s.overridden), x = `${this._clock(_)} — ${X.map(([D, at]) => `${D} ${at}`).join(", ")}${E.length ? ", " + E.join(", ") : ""}`;
      const Zt = Math.min(Math.max(n(_), 70), i - 70);
      b = it`<line class="cursor" x1=${n(_)} x2=${n(_)} y1=${S.t} y2=${o - S.b}></line>`, f = c`<div class="tip" style="left:${Zt}px">
        <b>${this._clock(_)}</b>
        ${X.map(([D, at]) => c`<div><span>${D}</span> ${at}</div>`)}
        ${E.map((D) => c`<div class="flag">${D}</div>`)}
      </div>`;
    }
    const G = e.isToday ? it`<line class="now" x1=${n(e.pastEnd)} x2=${n(e.pastEnd)} y1=${S.t} y2=${o - S.b}></line>` : p;
    return c`
      <svg width=${i} height=${o} viewBox="0 0 ${i} ${o}" tabindex="0" role="application"
        aria-label=${h(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(v) => v.pointerType === "mouse" || v.buttons ? this._pointer(v) : void 0}
        @pointerleave=${(v) => {
      v.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${l.map((v) => it`<line class="grid" x1=${S.l} x2=${i - S.r} y1=${r(v)} y2=${r(v)}></line>
          <text class="ylab" x=${S.l - 4} y=${r(v) + 3} text-anchor="end">${Number(v.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${d.map((v) => it`<text class="xlab" x=${n(v)} y=${o - 6}
          text-anchor=${v === 0 ? "start" : "middle"}>${Math.floor(Ot(new Date(a + v * 6e4), this._tz) / 60)}h</text>`)}
        ${this.simple ? p : it`${m(e.win, "win")}${m(e.heat, "heat")}${m(e.over, "over")}`}
        ${e.planned.map((v, X) => {
      const E = e.planned[X - 1];
      return v.v === null ? p : it`
            ${E && E.v !== null ? it`<line class="riser" x1=${n(v.s)} x2=${n(v.s)} y1=${r(E.v)} y2=${r(v.v)}></line>` : p}
            <line class="plan" x1=${n(v.s)} x2=${n(v.e)} y1=${r(v.v)} y2=${r(v.v)} style="stroke:${v.color}"></line>`;
    })}
        ${this.simple ? p : it`<path class="applied" d=${this._path(e.applied, e, n, r, !0)}></path>`}
        <path class="measured" d=${this._path(e.measured, e, n, r, !1)}></path>
        ${G}${b}
        <rect class="hit" x=${S.l} y=${S.t} width=${i - S.l - S.r} height=${o - S.t - S.b}></rect>
      </svg>
      ${f}
      <div class="sr" aria-live="polite">${x}</div>`;
  }
};
R.styles = F`
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
J([
  g({ attribute: !1 })
], R.prototype, "hass", 2);
J([
  g({ attribute: !1 })
], R.prototype, "data", 2);
J([
  g({ attribute: !1 })
], R.prototype, "program", 2);
J([
  g({ attribute: "entity-id" })
], R.prototype, "entityId", 2);
J([
  g()
], R.prototype, "date", 2);
J([
  g({ type: Boolean })
], R.prototype, "simple", 2);
J([
  g({ attribute: !1 })
], R.prototype, "slots", 2);
J([
  $()
], R.prototype, "_width", 2);
J([
  $()
], R.prototype, "_loaded", 2);
J([
  $()
], R.prototype, "_failed", 2);
J([
  $()
], R.prototype, "_cursor", 2);
R = J([
  N("wp-chart")
], R);
const Yi = 160, S = { l: 38, r: 10, t: 10, b: 22 };
var Gi = Object.defineProperty, Zi = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Zi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Gi(t, s, o), o;
};
const Qi = ["sunrise", "sunset"];
let Q = class extends P {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return et(this.hass);
  }
  _set(e, t) {
    const s = { ...this.group, slot: { ...this.group.slot, ...e }, days: t ?? this.group.days };
    this.dispatchEvent(new CustomEvent("group-change", { detail: s, bubbles: !0, composed: !0 }));
  }
  /* ---- time ---- */
  _update(e, t) {
    t && "time" in t && (this._last = { ...this._last, [e]: t.time }), this._set({ [e]: t });
  }
  _toggleSun(e, t) {
    const s = this.group.slot[e];
    s && ("sun" in s && s.sun === t ? this._update(e, { time: this._last[e] }) : ("time" in s && (this._last = { ...this._last, [e]: s.time }), this._update(e, { sun: t, offset: "sun" in s ? s.offset ?? 0 : 0 })));
  }
  _fromInput(e, t) {
    if (!/^\d{2}:\d{2}$/.test(t)) return;
    let s = q(t);
    e === "end" && s === 0 && (s = k), this._update(e, { time: s >= k ? "24:00" : B(s) });
  }
  _timeBlock(e, t) {
    const s = this.group.slot[e];
    if (!s) return p;
    const i = this._lang, o = V(i), n = this.disabled;
    return c`
      <div class="time" role="group" aria-label=${t}>
        <button class="ibtn round" ?disabled=${n} aria-label=${h(i, "minus15")} @click=${() => this._update(e, gs(s, -15))}>−15</button>
        ${"time" in s ? c`<input type="time" step="300" .value=${s.time === "24:00" ? "00:00" : s.time} ?disabled=${n}
              aria-label=${t} @change=${(r) => this._fromInput(e, r.target.value)} />` : c`<output class="sun">${Re(i, s)}</output>`}
        <button class="ibtn round" ?disabled=${n} aria-label=${h(i, "plus15")} @click=${() => this._update(e, gs(s, 15))}>+15</button>
      </div>
      <div class="chips">
        ${Qi.map((r) => {
      const a = "sun" in s && s.sun === r;
      return c`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${n}
            @click=${() => this._toggleSun(e, r)}><ha-icon icon=${r === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${o[`sun_${r}_short`] ?? r}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(e) {
    if (!e) return this._update("end", null);
    const t = this.group.slot.start, s = "time" in t ? q(t.time) : 12 * 60;
    this._update("end", { time: B(Math.min(k - 5, s + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(e) {
    const t = this.group.days.includes(e) ? this.group.days.filter((s) => s !== e) : [...this.group.days, e];
    this._set({}, t.sort((s, i) => s - i));
  }
  /* ---- action ---- */
  _setAct(e, t) {
    this._set({ ...Ti(this.group.slot, this.program, e, t) });
  }
  render() {
    if (!this.group || !this.program) return p;
    const e = this._lang, t = V(e), s = this.group.slot, i = this.group.days, o = (r, a) => r.length === a.length && a.every((l) => r.includes(l)), n = (r, a) => c`<button class="chip small ${o(i, a) ? "on" : ""}"
      aria-pressed=${o(i, a)} ?disabled=${this.disabled} @click=${() => this._set({}, [...a])}>${r}</button>`;
    return c`
      <section>
        <h4>${h(e, "start")}</h4>
        ${this._timeBlock("start", h(e, "start"))}
      </section>
      <section>
        <h4>${h(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${s.end ? "" : "on"}" aria-pressed=${!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${h(e, "no_end")}</button>
          <button class="chip ${s.end ? "on" : ""}" aria-pressed=${!!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${h(e, "with_end")}</button>
        </div>
        ${s.end ? this._timeBlock("end", h(e, "end")) : p}
      </section>
      <section>
        <h4>${h(e, "days_label")}</h4>
        <div class="days" role="group" aria-label=${h(e, "days_label")}>
          ${t.days_short.map((r, a) => c`<button class="day ${i.includes(a) ? "on" : ""}" aria-pressed=${i.includes(a)}
            aria-label=${t.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${r}</button>`)}
        </div>
        <div class="chips">
          ${n(h(e, "all_days"), Ye)}${n(h(e, "weekdays"), Ws)}${n(h(e, "weekend"), Hs)}
        </div>
      </section>
      <section>
        <h4>${h(e, "action")}</h4>
        ${this.entityIds.map((r) => {
      var a;
      return c`
          ${this.entityIds.length > 1 ? c`<div class="dev"><ha-icon icon=${((a = this.hass.states[r]) == null ? void 0 : a.attributes.icon) ?? `mdi:${A(r) === "climate" ? "thermostat" : "devices"}`}></ha-icon>${wt(this.hass, r)}</div>` : p}
          <wp-action-picker .hass=${this.hass} .data=${this.data} entity-id=${r} ?disabled=${this.disabled}
            .act=${Bt(s, r, this.data.modes)}
            @act-change=${(l) => {
        l.stopPropagation(), this._setAct(r, l.detail);
      }}></wp-action-picker>`;
    })}
      </section>`;
  }
};
Q.styles = [st, F`
    :host { display: block; }
    section { margin: 0 0 14px; }
    h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); }
    .time { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
    .time input[type="time"] { width: 150px; text-align: center; font-size: 24px; font-weight: 600; min-height: 56px; }
    .time output.sun { min-width: 150px; text-align: center; font-size: 20px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); min-width: 64px; font-weight: 600; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px; }
    .day {
      min-height: 48px; min-width: 0; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
      background: none; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .dev { display: flex; align-items: center; gap: 8px; margin: 8px 0 4px; font-weight: 600; --mdc-icon-size: 20px; }
  `];
_t([
  g({ attribute: !1 })
], Q.prototype, "hass", 2);
_t([
  g({ attribute: !1 })
], Q.prototype, "data", 2);
_t([
  g({ attribute: !1 })
], Q.prototype, "program", 2);
_t([
  g({ attribute: !1 })
], Q.prototype, "group", 2);
_t([
  g({ attribute: !1 })
], Q.prototype, "entityIds", 2);
_t([
  g({ type: Boolean })
], Q.prototype, "disabled", 2);
_t([
  $()
], Q.prototype, "_last", 2);
Q = _t([
  N("wp-slot-form")
], Q);
var to = Object.defineProperty, eo = Object.getOwnPropertyDescriptor, $e = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? eo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && to(t, s, o), o;
};
let jt = class extends P {
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
    const e = V(this.lang);
    return c`
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
jt.styles = F`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
$e([
  g()
], jt.prototype, "message", 2);
$e([
  g({ attribute: "confirm-label" })
], jt.prototype, "confirmLabel", 2);
$e([
  g()
], jt.prototype, "lang", 2);
jt = $e([
  N("wp-confirm")
], jt);
function St(e, t, s) {
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
function qt(e, t) {
  var o, n;
  const s = (n = (o = e.states[t]) == null ? void 0 : o.attributes) == null ? void 0 : n.friendly_name;
  if (typeof s == "string" && s) return s;
  const i = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return i ? i.charAt(0).toUpperCase() + i.slice(1) : t;
}
const so = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);
class io {
  constructor(t, s = 500) {
    this.onFire = t, this.delay = s, this.timer = 0, this.sx = 0, this.sy = 0, this.fired = !1;
  }
  down(t) {
    t.pointerType === "mouse" && t.button !== 0 || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "BUTTON" || so.has(s.tagName))) || (this.cancel(), this.fired = !1, this.sx = t.clientX, this.sy = t.clientY, this.timer = window.setTimeout(() => {
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
const ks = /* @__PURE__ */ new WeakSet();
function oo(e) {
  if (!e || ks.has(e)) return;
  ks.add(e);
  const t = () => {
    e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  };
  e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
const no = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var ro = Object.defineProperty, ao = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ao(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && ro(t, s, o), o;
};
const lo = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, co = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Nt(e, t) {
  var o;
  if ("time" in t) return q(t.time);
  const s = (o = e.states["sun.sun"]) == null ? void 0 : o.attributes[lo[t.sun]];
  let i = s ? Ot(s, e.config.time_zone) : co[t.sun];
  return i += t.offset ?? 0, t.earliest && (i = Math.max(i, q(t.earliest))), t.latest && (i = Math.min(i, q(t.latest))), Math.max(0, Math.min(k, i));
}
function Fe(e) {
  const t = I(e.start);
  if (t === null || !e.end) return null;
  const s = I(e.end);
  return s === null ? null : s > t ? [t, s] : [t, k];
}
function fe(e) {
  const t = e.map((s) => ({ slot: s, iv: Fe(s) })).filter((s) => s.iv !== null).sort((s, i) => s.iv[0] - i.iv[0]);
  for (let s = 1; s < t.length; s++)
    if (t[s].iv[0] < t[s - 1].iv[1]) return [t[s - 1].slot, t[s].slot];
  return null;
}
function Le(e, t) {
  return [...t].sort((s, i) => Nt(e, s.start) - Nt(e, i.start));
}
function ct(e, t, s) {
  const i = (o) => {
    if ("time" in o) return o.time;
    const n = o.offset ? ` ${o.offset > 0 ? "+" : "−"}${Math.abs(o.offset)} min` : "";
    return `${h(s, `sun_${o.sun}`)}${n} (≈${B(Nt(e, o))})`;
  };
  return t.end ? `${i(t.start)} – ${i(t.end)}` : `${i(t.start)} · ${h(s, "one_shot")}`;
}
function qs(e, t, s, i, o) {
  const n = et(e), r = [];
  o > 0 && r.push({ start: 0, end: o, color: "var(--secondary-text-color)", label: h(n, "previous_day"), ignored: "spill" });
  for (const a of i) {
    const l = Nt(e, a.start), d = a.end ? Nt(e, a.end) : null, [[m, _]] = $i(a, { start: l, end: d }), f = !("time" in a.start) || !!(a.end && !("time" in a.end));
    r.push({
      start: m,
      end: _,
      sun: f,
      color: ue(a, s, t.modes),
      label: `${Ne(a, s, t.modes, n)} ${ct(e, a, n)}`
    });
  }
  return r;
}
let U = class extends P {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "", this._zoom = 1, this._lp = new io(() => {
      this._lpSlot && (this._menu = this._lpSlot);
    }), this._pts = /* @__PURE__ */ new Map();
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return h(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), s = (i, o) => t.set(i, [...t.get(i) ?? [], o]);
    for (const i of e) {
      const o = I(i.start);
      o !== null && s(o, { id: i.id, which: "start" });
      const n = I(i.end ?? null);
      o !== null && n !== null && n > o && s(n, { id: i.id, which: "end" });
    }
    return [...t.entries()].map(([i, o]) => ({ key: o.map((n) => n.id + n.which).join("|"), min: i, refs: o }));
  }
  _bounds(e, t, s) {
    let i = 0, o = k;
    for (const a of t) {
      const l = e.find((f) => f.id === a.id);
      if (!l) continue;
      const d = I(l.start) ?? 0, m = l.end ? I(l.end) : null, _ = m !== null && m <= d;
      a.which === "start" ? (m !== null && !_ ? o = Math.min(o, m - T) : o = Math.min(o, k - T), _ && (i = Math.max(i, m))) : _ ? (i = Math.max(i, T), o = Math.min(o, d)) : i = Math.max(i, d + T);
    }
    const n = new Set(t.map((a) => a.id));
    if (!t.every((a) => {
      const l = e.find((d) => d.id === a.id);
      return a.which === "start" && !(l != null && l.end);
    }))
      for (const a of e) {
        if (n.has(a.id)) continue;
        const l = Fe(a);
        l && (l[1] <= s ? i = Math.max(i, l[1]) : l[0] >= s && (o = Math.min(o, l[0])));
      }
    return [i, o];
  }
  _apply(e, t, s) {
    const i = { time: B(s) };
    return e.map((o) => {
      const n = t.find((r) => r.id === o.id);
      return n ? n.which === "start" ? { ...o, start: i } : { ...o, end: i } : o;
    });
  }
  _emitSlots(e) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _snap(e) {
    return Math.round(e / T) * T;
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
    const i = s.getBoundingClientRect(), o = (e.clientX - i.left) / i.width * k, n = Math.max(t.lo, Math.min(t.hi, this._snap(o)));
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
    const t = this._tr("confirm_delete_slot", { time: ct(this.hass, e, this._lang) });
    await St(this, t, this._tr("delete")) && this._emitSlots(this.slots.filter((s) => s.id !== e.id));
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
    const s = e.shiftKey ? 60 : T;
    let i = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") i = -s;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") i = s;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, i);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((o) => o.type === je(this.program)), t = this._slots.map(Fe).filter((o) => o !== null).sort((o, n) => o[0] - n[0]);
    let s = 480;
    for (const [o, n] of t) s >= o && s < n && (s = n);
    s > k - 60 && (s = k - 60);
    const i = Math.min(k, s + 60);
    return {
      id: pt(),
      start: { time: B(s) },
      end: { time: B(i) },
      conditions: [],
      actions: { by_type: e[0] ? { [je(this.program)]: e[0].id } : {}, by_entity: {} }
    };
  }
  _edit(e, t) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: e, isNew: t }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(e, t) {
    const s = e.find((i) => i.id === t);
    return s ? ct(this.hass, s, this._lang) : "";
  }
  _actionText(e) {
    const t = Xe(e, this.program, this.data.modes), s = Object.values(e.actions.by_type).map((o) => {
      var n;
      return (n = this.data.modes.find((r) => r.id === o)) == null ? void 0 : n.name;
    }).filter(Boolean);
    if (s.length) return s.join(" · ");
    const i = Object.keys(e.actions.by_entity).map((o) => qt(this.hass, o));
    return (t == null ? void 0 : t.name) ?? (i.length ? i.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, s) {
    if (!s) return c`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in s))
      return c`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${ct(this.hass, { ...e, start: s, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const i = q(s.time), o = [{ id: e.id, which: t }], [n, r] = this._bounds(this._slots, o, i), a = this._tr(t === "start" ? "slot_start" : "slot_end");
    return c`
      <span class="stepper">
        <button class="ibtn" ?disabled=${i - T < n} @click=${() => this._nudge(o, i, -T)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${s.time}</span>
        <button class="ibtn" ?disabled=${i + T > r} @click=${() => this._nudge(o, i, T)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = qs(this.hass, this.data, this.program, e, this.spill), s = this._edges(e), i = (r) => `${r / k * 100}%`, o = this._drag, n = Le(this.hass, e);
    return c`
      <div class="wrap" @pointerdown=${this._pdown} @pointermove=${this._pmove} @pointerup=${this._pup}
        @pointercancel=${this._pup}>
        <div class="track" style="width:${this._zoom * 100}%">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${s.map((r) => {
      const a = o && r.refs.some((_) => o.refs.some((f) => f.id === _.id && f.which === _.which)), [l, d] = this._bounds(e, r.refs, r.min), m = B(r.min);
      return c`<button class="handle ${a ? "active" : ""}" style="left:${i(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((_) => `${_.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, _.id)}`).join(" / ")}
                aria-valuemin=${l} aria-valuemax=${d} aria-valuenow=${r.min} aria-valuetext=${m}
                @pointerdown=${(_) => this._down(_, r)}
                @pointermove=${(_) => this._move(_)}
                @pointerup=${(_) => this._up(_)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(_) => this._onKey(_, r)}><span class="grip"></span></button>`;
    })}
            ${o ? c`<div class="loupe" style="left:${i(o.min)}" aria-hidden="true">
                  <span>${B(o.min)}</span></div>` : p}
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
      ${this.spill > 0 ? c`<p class="hint">${this._tr("spill_hint", { time: B(this.spill) })}</p>` : p}
      ${this._notice ? c`<p class="error" role="alert">${this._notice}</p>` : p}
      <div class="list">
        ${n.length === 0 ? c`<p class="muted">${this._tr("no_slots")}</p>` : p}
        ${n.map(
      (r) => {
        var a;
        return c`
            <div class="slot" @pointerdown=${(l) => this._slotDown(l, r)}
              @pointermove=${(l) => this._lp.move(l)} @pointerup=${() => this._lp.cancel()}
              @pointercancel=${() => this._lp.cancel()} @contextmenu=${(l) => l.preventDefault()}>
              <span class="dot" style="background:${ue(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? c`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : c`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(a = r.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${ct(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${ct(this.hass, r, this._lang)}`}
                @click=${() => void this._remove(r)}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
      <p class="hint"><ha-icon icon="mdi:gesture-tap-hold"></ha-icon> ${this._tr("longpress_hint")}</p>
      ${this._menu ? c`<wp-dialog open heading=${ct(this.hass, this._menu, this._lang)}
            @closed=${(r) => {
      r.stopPropagation(), this._menu = void 0;
    }}>
            <div class="menu">
              <button class="btn" @click=${() => this._menuDo("edit")}><ha-icon icon="mdi:pencil"></ha-icon> ${this._tr("edit")}</button>
              <button class="btn" @click=${() => this._menuDo("copy")}><ha-icon icon="mdi:content-copy"></ha-icon> ${this._tr("copy_to")}</button>
              <button class="btn danger" @click=${() => this._menuDo("delete")}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>
            </div>
          </wp-dialog>` : p}
    `;
  }
};
U.styles = [
  st,
  F`
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
K([
  g({ attribute: !1 })
], U.prototype, "hass", 2);
K([
  g({ attribute: !1 })
], U.prototype, "data", 2);
K([
  g({ attribute: !1 })
], U.prototype, "program", 2);
K([
  g({ attribute: !1 })
], U.prototype, "slots", 2);
K([
  g({ type: Number })
], U.prototype, "spill", 2);
K([
  g({ type: Number })
], U.prototype, "day", 2);
K([
  $()
], U.prototype, "_drag", 2);
K([
  $()
], U.prototype, "_dragSlots", 2);
K([
  $()
], U.prototype, "_notice", 2);
K([
  $()
], U.prototype, "_zoom", 2);
K([
  $()
], U.prototype, "_menu", 2);
U = K([
  N("wp-day-editor")
], U);
var po = Object.defineProperty, ho = Object.getOwnPropertyDescriptor, L = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ho(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && po(t, s, o), o;
};
const uo = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, Ss = 7;
let z = class extends P {
  constructor() {
    super(...arguments), this.chart = !0, this._open = null, this._group = null, this._act = null, this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._minutes = (e) => Nt(this.hass, e);
  }
  get _lang() {
    return et(this.hass);
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /* ---- scope ---- */
  get _programs() {
    const e = this.data.programs;
    return [...this.scope.kind === "device" ? e.filter((s) => s.entities.some((i) => i.entity_id === this.scope.entityId)) : e.filter((s) => s.id === this.scope.programId)].sort((s, i) => s.priority - i.priority || s.name.localeCompare(i.name));
  }
  get _entities() {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const e = this._programs[0];
    return e ? e.entities.map((t) => t.entity_id) : [];
  }
  get _title() {
    var e;
    return this.scope.kind === "device" ? wt(this.hass, this.scope.entityId) : ((e = this._programs[0]) == null ? void 0 : e.name) ?? "";
  }
  _include(e) {
    const t = this._entities.filter((s) => e.entities.some((i) => i.entity_id === s));
    return (s) => t.some((i) => Bt(s, i, this.data.modes) !== null);
  }
  _rows() {
    const e = [];
    for (const t of this._programs) {
      const s = Ht(t, this.data);
      for (const i of De(s, this._include(t), this._minutes))
        e.push({ program: t, group: i, key: `${t.id}|${i.ids[i.days[0]]}` });
    }
    return e;
  }
  /* ---- lifecycle / chart ---- */
  willUpdate(e) {
    (!this._chartEntity || e.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const t = this._programs[0];
    if (this.chart && t && this.hass) {
      const s = `${t.id}|${t.revision}|${this._date}`;
      s !== this._loaded && (this._loaded = s, this._loadPreview(t.id, this._date, s));
    }
  }
  get _today() {
    return he(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Bs(this._today, this._offset);
  }
  async _loadPreview(e, t, s) {
    const i = ++this._token;
    try {
      const o = await this.hass.callWS({ type: "weekly_planner/preview", program_id: e, date: t });
      i === this._token && s === this._loaded && (this._slots = o.slots);
    } catch {
      i === this._token && (this._slots = null);
    }
  }
  _go(e) {
    const t = this._offset + e;
    t < -14 || t > Ss || (this._slots = null, this._offset = t);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(e, t, s, i = null) {
    this._open = e, this._programId = t.id, this._group = s ? structuredClone(s) : null, this._act = i, this._error = "";
  }
  _cancel() {
    this._open = null, this._group = null, this._act = null, this._error = "";
  }
  _add() {
    const e = this._programs[0], t = this._entities[0];
    if (!e || !t) return;
    const s = {
      id: pt(),
      start: { time: "08:00" },
      end: { time: "09:00" },
      conditions: [],
      actions: { by_type: {}, by_entity: {} }
    };
    this._expand("new", e, { slot: s, days: [...Ye], ids: {}, fresh: !0 });
  }
  /* ---- saving ---- */
  async _saveProgram(e) {
    var t;
    this._saving = !0;
    try {
      return await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(e) }), !0;
    } catch (s) {
      const i = s;
      return (i == null ? void 0 : i.code) === "conflict" ? this._error = h(this._lang, "ss_conflict") : (i == null ? void 0 : i.code) === "unauthorized" ? this._error = h(this._lang, "err_unauthorized") : (t = i == null ? void 0 : i.message) != null && t.includes("overlapping_slots") ? this._error = h(this._lang, "w_err_overlap") : this._error = h(this._lang, "ss_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  _problem(e) {
    const t = this._lang, s = this._group;
    return s ? s.days.length ? s.slot.end && JSON.stringify(s.slot.start) === JSON.stringify(s.slot.end) ? h(t, "w_err_same") : this._entities.some((i) => e.entities.some((o) => o.entity_id === i) && Bt(s.slot, i, this.data.modes)) ? "" : h(t, "err_action") : h(t, "err_days") : "";
  }
  async _saveRow() {
    const e = this._programs.find((l) => l.id === this._programId), t = this._group;
    if (!e || !t) return;
    const s = this._problem(e);
    if (s) {
      this._error = s;
      return;
    }
    const i = Ht(e, this.data), o = this._include(e), n = De(i, o, this._minutes).filter((l) => `${e.id}|${l.ids[l.days[0]]}` !== this._open);
    n.push(t);
    const r = ys(i, n, o, this._minutes);
    for (const l of r.days)
      if (fe(l)) {
        this._error = h(this._lang, "w_err_overlap");
        return;
      }
    await this._saveProgram({ ...e, profiles: e.profiles.map((l) => l.id === i.id ? r : l) }) && this._cancel();
  }
  async _deleteRow() {
    const e = this._programs.find((n) => n.id === this._programId);
    if (!e || this._open === "new" || !await St(this, h(this._lang, "w_confirm_slot"), h(this._lang, "delete"))) return;
    const t = Ht(e, this.data), s = this._include(e), i = De(t, s, this._minutes).filter((n) => `${e.id}|${n.ids[n.days[0]]}` !== this._open), o = ys(t, i, s, this._minutes);
    await this._saveProgram({ ...e, profiles: e.profiles.map((n) => n.id === t.id ? o : n) }) && this._cancel();
  }
  async _saveRest(e) {
    const t = this._programs[0], s = this._act;
    if (!t || !s) return;
    const i = t.entities.map((o) => o.entity_id === e ? { ...o, default: ji(s) } : o);
    await this._saveProgram({ ...t, entities: i }) && this._cancel();
  }
  /* ---- pause / delete ---- */
  get _enabled() {
    return this._programs.some((e) => e.enabled);
  }
  async _setEnabled(e, t) {
    if (!e && !await St(this, h(this._lang, "confirm_pause", { name: this._title }), h(this._lang, "pause_do"))) {
      t.checked = !0;
      return;
    }
    try {
      for (const s of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: s.id, enabled: e });
    } catch (s) {
      this._error = h(this._lang, "error", { message: (s == null ? void 0 : s.message) ?? String(s) });
    }
  }
  async _deleteAll() {
    if (await St(this, h(this._lang, "confirm_delete_schedule", { name: this._title }), h(this._lang, "delete")))
      try {
        for (const e of this._programs) {
          const t = this.scope.kind === "device" ? this.scope.entityId : null;
          if (!t || e.entities.length <= 1) {
            await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: e.id });
            continue;
          }
          const s = structuredClone(e);
          s.entities = s.entities.filter((i) => i.entity_id !== t);
          for (const i of s.profiles) {
            for (const o of i.days)
              for (const n of o) delete n.actions.by_entity[t];
            i.days = i.days.map((o) => o.filter((n) => Object.keys(n.actions.by_entity).length || Object.keys(n.actions.by_type).length));
          }
          await this.hass.callWS({ type: "weekly_planner/program/save", program: s });
        }
        this._closeDialog();
      } catch (e) {
        this._error = h(this._lang, "error", { message: (e == null ? void 0 : e.message) ?? String(e) });
      }
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
    const t = this._lang, s = Re(t, e.start);
    return e.end ? `${s}–${Re(t, e.end)}` : s;
  }
  _rowText(e, t) {
    const s = this._lang, o = this._entities.filter((d) => e.entities.some((m) => m.entity_id === d)).map((d) => ({ e: d, act: Bt(t.slot, d, this.data.modes) })).filter((d) => d.act), n = o[0], r = n ? Yt(this.hass, s, this.data.modes, n.e, n.act) : "", a = o.length > 1 ? ` +${o.length - 1}` : "", l = Ri(s, V(s).days_short, t.days);
    return {
      text: [`${r}${a}`, this._when(t.slot), l].filter(Boolean).join(" · "),
      color: n ? Ls(this.data.modes, n.e, n.act) : "var(--disabled-text-color)"
    };
  }
  _renderRow(e) {
    const { program: t, group: s, key: i } = e;
    if (this._open === i && this._group) return this._renderEditor(t, i);
    const { text: o, color: n } = this._rowText(t, s);
    return c`<button class="row" aria-expanded="false" @click=${() => this._expand(i, t, s)}>
      <span class="dot" style="background:${n}"></span>
      <span class="txt">${o}${this._programs.length > 1 ? c`<small>${t.name}</small>` : p}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(e, t) {
    const s = this._lang, i = t === "new", o = this._entities.filter((n) => e.entities.some((r) => r.entity_id === n));
    return c`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${e} .group=${this._group} .entityIds=${o}
        ?disabled=${!this._canEdit}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>
      ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${h(s, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${h(s, "cancel")}</button>
      </div>
      ${i ? p : c`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${h(s, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const e = this._lang, t = this._programs[0];
    return t ? this._entities.filter((s) => t.entities.some((i) => i.entity_id === s)).map((s) => {
      const i = t.entities.find((l) => l.entity_id === s), o = zi(i, this.data.modes), n = `rest:${s}`, r = this._entities.length > 1 ? `${h(e, "rest_of_time")} · ${wt(this.hass, s)}` : h(e, "rest_of_time");
      if (this._open === n)
        return c`<div class="editor"><h4>${r}</h4>
          <wp-action-picker rest .hass=${this.hass} .data=${this.data} entity-id=${s} .act=${this._act} ?disabled=${!this._canEdit}
            @act-change=${(l) => {
          l.stopPropagation(), this._act = l.detail;
        }}></wp-action-picker>
          ${this._error ? c`<p class="err" role="alert">${this._error}</p>` : p}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(s)}>${h(e, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${h(e, "cancel")}</button>
          </div></div>`;
      const a = o.special === "none" ? h(e, "rest_none") : o.special === "previous" ? h(e, "rest_previous") : Yt(this.hass, e, this.data.modes, s, o);
      return c`<button class="row rest" aria-expanded="false" @click=${() => this._expand(n, t, null, o)}>
        <ha-icon icon="mdi:update"></ha-icon>
        <span class="txt">${r} <b>${a}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : p;
  }
  _renderChart() {
    const e = this._lang, t = this._programs[0];
    if (!this.chart || !t || !this._chartEntity) return p;
    const s = this._date, i = new Intl.DateTimeFormat(e, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${s}T12:00:00Z`));
    return c`<section class="chart">
      ${this._entities.length > 1 ? c`<select aria-label=${h(e, "chart")} @change=${(o) => this._chartEntity = o.target.value}>
        ${this._entities.map((o) => c`<option value=${o} ?selected=${o === this._chartEntity}>${wt(this.hass, o)}</option>`)}</select>` : p}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${h(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? h(e, "today") : i}</span>
        <button class="ibtn" ?disabled=${this._offset >= Ss} aria-label=${h(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart simple .hass=${this.hass} .data=${this.data} .program=${t} entity-id=${this._chartEntity} date=${s}
        .slots=${this._slots}></wp-chart>
    </section>`;
  }
  render() {
    var i;
    if (!this.hass || !this.data || !this.scope) return p;
    const e = this._lang;
    if (!this._programs.length)
      return c`<wp-dialog open heading=${this._title}><p class="muted">${h(e, "no_program")}</p></wp-dialog>`;
    const t = this._rows(), s = !!((i = this.hass.user) != null && i.is_admin) && this.data.can_edit;
    return c`
      <wp-dialog open heading=${this._title}>
        ${s ? c`<button slot="header-actions" class="gear" aria-label=${h(e, "settings")} @click=${() => this._settings()}>
          <ha-icon icon="mdi:cog"></ha-icon></button>` : p}
        ${this._canEdit ? p : c`<p class="err" role="alert">${h(e, "read_only")}</p>`}
        ${this._error && !this._open ? c`<p class="err" role="alert">${this._error}</p>` : p}
        <div class="list">
          ${t.length ? t.map((o) => this._renderRow(o)) : this._open === "new" ? p : c`<p class="muted">${h(e, "w_none")}</p>`}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : p}
          ${this._open === null ? c`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${h(e, "w_add")}</span></button>` : p}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? p : c`${this._renderChart()}
        <label class="switch">
          <span>${h(e, "schedule_on")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(o) => void this._setEnabled(o.target.checked, o.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${h(e, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
z.styles = [st, F`
    :host { display: contents; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; text-align: left;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 16px;
      cursor: pointer; width: 100%; --mdc-icon-size: 22px;
    }
    .row .txt { flex: 1; min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
    .row .txt small { display: block; color: var(--secondary-text-color); font-size: 12px; }
    .row.add { border-style: dashed; color: var(--primary-color); font-weight: 500; }
    .row.rest { background: var(--secondary-background-color); }
    .row:disabled { opacity: 0.5; cursor: default; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .editor { border: 2px solid var(--primary-color); border-radius: 12px; padding: 12px; }
    .editor h4 { margin: 0 0 8px; font-size: 15px; }
    .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .btns .btn { flex: 1 1 120px; }
    .btn.alone { width: 100%; margin-top: 16px; }
    .editor .btn.alone { margin-top: 12px; }
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
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `];
L([
  g({ attribute: !1 })
], z.prototype, "hass", 2);
L([
  g({ attribute: !1 })
], z.prototype, "data", 2);
L([
  g({ attribute: !1 })
], z.prototype, "scope", 2);
L([
  g({ type: Boolean })
], z.prototype, "chart", 2);
L([
  $()
], z.prototype, "_open", 2);
L([
  $()
], z.prototype, "_group", 2);
L([
  $()
], z.prototype, "_act", 2);
L([
  $()
], z.prototype, "_programId", 2);
L([
  $()
], z.prototype, "_error", 2);
L([
  $()
], z.prototype, "_saving", 2);
L([
  $()
], z.prototype, "_offset", 2);
L([
  $()
], z.prototype, "_slots", 2);
L([
  $()
], z.prototype, "_chartEntity", 2);
z = L([
  N("wp-schedule")
], z);
var _o = Object.defineProperty, mo = Object.getOwnPropertyDescriptor, rt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? mo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && _o(t, s, o), o;
};
const fo = ["dawn", "sunrise", "sunset", "dusk"];
let Y = class extends P {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return h(this._lang, e, t);
  }
  willUpdate(e) {
    var t, s, i, o;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (s = this._s).actions ?? (s.actions = { by_type: {}, by_entity: {} }), (i = this._s.actions).by_type ?? (i.by_type = {}), (o = this._s.actions).by_entity ?? (o.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(Ft(A(t.entity_id)));
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
    return c`
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
        ${"time" in t ? this._fixedEditor(e, t.time, i) : c`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(o) => this._setSpec(e, { ...t, sun: o.target.value })}>
                    ${fo.map((o) => c`<option value=${o} ?selected=${t.sun === o}>${this._tr(`sun_${o}`)}</option>`)}
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
      (o) => c`
                    <div class="field">
                      <label>${this._tr(o === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${t[o] ?? ""}
                          @change=${(n) => {
        const r = n.target.value, a = { ...t };
        r ? a[o] = B(q(r)) : delete a[o], this._setSpec(e, a);
      }} />
                        ${t[o] ? c`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => {
        const n = { ...t };
        delete n[o], this._setSpec(e, n);
      }}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
                      </div>
                    </div>`
    )}
              </div>`}
      </fieldset>`;
  }
  _fixedEditor(e, t, s) {
    const i = e === "end" && t === "24:00";
    return c`
      ${i ? c`<p class="time-big">24:00</p>` : c`<div class="field"><input type="time" step="300" aria-label=${s} .value=${t}
            @change=${(o) => {
      const n = o.target.value;
      n && this._setSpec(e, { time: B(q(n)) });
    }} /></div>`}
      ${e === "end" ? c`<label class="check"><input type="checkbox" .checked=${i}
            @change=${(o) => this._setSpec("end", { time: o.target.checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>` : p}`;
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
    return c`${this._types.map((e) => {
      const t = this.data.modes.filter((i) => i.type === e), s = this._s.actions.by_type[e] ?? "";
      return c`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(e) })}</label>
          <select @change=${(i) => this._setMode(e, i.target.value)}>
            <option value="" ?selected=${s === ""}>—</option>
            ${t.map((i) => c`<option value=${i.id} ?selected=${i.id === s}>${i.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }
  _typeName(e) {
    return Je(this._lang, e);
  }
  _directEditor() {
    return c`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return c`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(s) => this._setDirect(
        e.entity_id,
        s.target.checked ? Us(this.hass, e.entity_id) : null
      )} />
            <strong>${qt(this.hass, e.entity_id)}</strong></label>
          ${t ? c`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${t}
                .admin=${!!this.data.is_admin}
                @wp-change=${(s) => {
        s.stopPropagation(), this._setDirect(e.entity_id, s.detail);
      }}></wp-setpoint-editor>` : p}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(e) => this._update({ color: e.target.value })} />
        ${this._s.color ? c`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : p}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var i;
    const e = this._s, t = "time" in e.start ? q(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === q(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= k) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const o of Object.values(e.actions.by_entity)) {
      if (o.kind === "scene" && !o.scene) return this._tr("err_incomplete");
      if (o.kind === "script" && !o.script) return this._tr("err_incomplete");
      if (o.kind === "action" && !o.action) return this._tr("err_incomplete");
    }
    if ((i = e.conditions) != null && i.some((o) => !o.entity_id)) return this._tr("err_incomplete");
    const s = fe([...this.others, e]);
    if (s) {
      const o = s.find((n) => n.id !== e.id) ?? s[0];
      return this._tr("err_overlap", { slot: ct(this.hass, o, this._lang) });
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
    if (!this._s) return p;
    const e = this._s;
    return c`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", e.start)}
        <label class="check"><input type="checkbox" .checked=${!e.end}
          @change=${(t) => {
      if (t.target.checked) this._setSpec("end", null);
      else {
        const i = "time" in e.start ? q(e.start.time) : 480;
        this._setSpec("end", { time: B(Math.min(k, i + 60)) });
      }
    }} /> ${this._tr("one_shot_check")}</label>
        ${e.end ? this._specEditor("end", e.end) : c`<p class="hint">${this._tr("one_shot_hint")}</p>`}

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

        ${this._error ? c`<p class="error" role="alert">${this._error}</p>` : p}
        <button slot="footer" class="btn" @click=${() => {
      var t, s;
      return (s = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
Y.styles = [
  st,
  F`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
rt([
  g({ attribute: !1 })
], Y.prototype, "hass", 2);
rt([
  g({ attribute: !1 })
], Y.prototype, "data", 2);
rt([
  g({ attribute: !1 })
], Y.prototype, "program", 2);
rt([
  g({ attribute: !1 })
], Y.prototype, "entry", 2);
rt([
  g({ attribute: !1 })
], Y.prototype, "others", 2);
rt([
  $()
], Y.prototype, "_s", 2);
rt([
  $()
], Y.prototype, "_mode", 2);
rt([
  $()
], Y.prototype, "_error", 2);
Y = rt([
  N("wp-slot-editor")
], Y);
var go = Object.defineProperty, yo = Object.getOwnPropertyDescriptor, j = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? yo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && go(t, s, o), o;
};
const As = () => [[], [], [], [], [], [], []];
function le(e) {
  return e.map((t) => ({ ...structuredClone(t), id: pt() }));
}
let M = class extends P {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return h(this._lang, e, t);
  }
  _long(e) {
    return V(this._lang).days[e];
  }
  _short(e) {
    return V(this._lang).days_short[e];
  }
  /* ---- initial state ---- */
  willUpdate(e) {
    if (!(this._ready && !e.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const t = pt();
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
          profiles: [{ id: t, name: this._tr("profile_default"), days: As() }]
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
    for (const t of this._p.entities) e.add(Ft(A(t.entity_id)));
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
    const o = i.days.map((n, r) => r === e ? Le(this.hass, t) : n);
    this._setProfile({ ...i, days: o });
  }
  _spill(e, t) {
    const s = e.days[(t + 6) % 7] ?? [];
    return Ve(s).reduce((i, o) => Math.max(i, o.end), 0);
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
        id: pt(),
        name: t,
        days: e.mode === "copy" ? i.days.map(le) : As()
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
          days: r.days.map((a, l) => {
            if (l !== n) return a;
            if (!s) return le(t);
            const d = Le(this.hass, [...a, ...le([s])]);
            return fe(d) ? (i.push(n), a) : d;
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
    const t = Ft(A(e)), s = this.data.modes.filter((n) => n.type === t), i = s.find((n) => /eco|off|closed/.test(n.id)) ?? s[0], o = i ? { kind: "mode", value: i.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: o, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var n;
    const s = this._p.entities[e], i = Ft(A(s.entity_id));
    let o;
    t === "mode" && (o = ((n = this.data.modes.find((r) => r.type === i)) == null ? void 0 : n.id) ?? ""), t === "setpoint" && (o = Us(this.hass, s.entity_id)), this._setEntity(e, { default: o === void 0 ? { kind: t } : { kind: t, value: o } });
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
        if (fe(s.days[i]))
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
    await St(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(e) {
    await St(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(e) {
    var i;
    const t = (i = this._p.entities[e]) == null ? void 0 : i.entity_id;
    if (!t) return;
    const s = this._tr("confirm_delete", { name: qt(this.hass, t) });
    await St(this, s, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((o, n) => n !== e) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = pt(), t = this._p, s = /* @__PURE__ */ new Map(), i = t.profiles.map((o) => {
      const n = o.id === this._activeId() ? e : pt();
      return s.set(o.id, n), { ...structuredClone(o), id: n, days: o.days.map(le) };
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
    return c`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${e.name}
          @input=${(s) => this._patch({ name: s.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${e.icon && customElements.get("ha-icon") ? c`<ha-icon .icon=${e.icon}></ha-icon>` : p}
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
      ${t.length ? c`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(s) => this._patch({ main_type: s.target.value })}>
              ${t.map((s) => c`<option value=${s} ?selected=${s === (e.main_type || t[0])}>${Je(this._lang, s)}</option>`)}
            </select></div>` : p}
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions}
        @wp-change=${(s) => {
      s.stopPropagation(), this._patch({ conditions: s.detail });
    }}></wp-conditions-editor>
    `;
  }
  updated() {
    oo(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const e = this._p;
    return c`
      ${e.entities.length === 0 ? c`<p class="muted">${this._tr("pe_no_entity")}</p>` : p}
      ${e.entities.map((t, s) => this._renderEntity(t, s))}
      ${js(this._pickerKey, c`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${Pi} .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    var a, l;
    const s = Ft(A(e.entity_id)), i = ((a = this.hass.states[e.entity_id]) == null ? void 0 : a.attributes) ?? {}, o = Array.isArray(i.preset_modes) && i.preset_modes.includes("permanent"), n = this.data.modes.filter((d) => d.type === s), r = ((l = e.default) == null ? void 0 : l.kind) ?? "none";
    return c`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${qt(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? p : c`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${qt(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(d) => this._setDefaultKind(t, d.target.value)}>
            <option value="none" ?selected=${r === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${r === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${r === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${r === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${r === "mode" ? c`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(d) => this._setEntity(t, { default: { kind: "mode", value: d.target.value } })}>
              ${n.map((d) => c`<option value=${d.id} ?selected=${d.id === e.default.value}>${d.name}</option>`)}
            </select></div>` : p}
        ${r === "setpoint" ? c`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(d) => {
      d.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: d.detail } });
    }}></wp-setpoint-editor>` : p}
        ${o || e.force_permanent ? c`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
              @change=${(d) => this._setEntity(t, { force_permanent: d.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : p}
      </div>`;
  }
  _renderWeek() {
    const e = this._p, t = this._profile, s = this._activeId(), i = this._profileForm;
    return c`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(o) => {
      this._profileId = o.target.value, this._dayView = void 0;
    }}>
            ${e.profiles.map((o) => c`<option value=${o.id} ?selected=${o.id === t.id}>${o.name}${o.id === s ? ` (${this._tr("profile_active")})` : ""}</option>`)}
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
      ${t.id === s ? c`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : p}
      ${i ? c`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(i.mode === "rename" ? "profile_rename" : i.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${i.name}
                @input=${(o) => this._profileForm = { ...i, name: o.target.value }}
                @keydown=${(o) => {
      o.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${i.mode === "rename" ? c`<p class="hint">${this._tr("profile_rename_warning")}</p>` : p}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : p}
      ${this._dayView === void 0 ? this._renderDays(t) : this._renderDayEditor(t, this._dayView)}
    `;
  }
  _renderDays(e) {
    return c`${e.days.map((t, s) => {
      const i = qs(this.hass, this.data, this._p, t, this._spill(e, s)), o = this._long(s);
      return c`
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
    return c`
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
    if (!e) return p;
    const t = (i) => this._copy = { ...e, targets: i }, s = [0, 1, 2, 3, 4, 5, 6];
    return c`
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
          ${s.map((i) => c`<label class="check"><input type="checkbox" .checked=${e.targets.includes(i)}
            @change=${(o) => t(o.target.checked ? [...e.targets, i] : e.targets.filter((n) => n !== i))} />
            ${this._short(i)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(i) => this._copy = { ...e, profileId: i.target.value }}>
            ${this._p.profiles.map((i) => c`<option value=${i.id} ?selected=${i.id === e.profileId}>${i.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr(e.slotId ? "copy_slot_hint" : "copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => this._copy = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }
  render() {
    if (!this._p) return p;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], t = this._canEdit(), s = this._dayView;
    return c`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? p : c`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([i, o]) => c`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(o)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? c`<p class="error" role="alert">${this._error}</p>` : p}
        ${this._isNew ? p : c`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? p : c`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!t}
              @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>`}
      </wp-dialog>
      ${this._renderCopy()}
      ${this._slotEdit && s !== void 0 ? c`<wp-slot-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .entry=${this._slotEdit.slot}
            .others=${this._profile.days[s].filter((i) => i.id !== this._slotEdit.slot.id)}
            @wp-save=${(i) => {
      i.stopPropagation(), this._saveSlot(i.detail);
    }}
            @closed=${(i) => {
      i.stopPropagation(), this._slotEdit = void 0;
    }}></wp-slot-editor>` : p}
    `;
  }
};
M.styles = [
  st,
  F`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${Ps(no)}
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
j([
  g({ attribute: !1 })
], M.prototype, "hass", 2);
j([
  g({ attribute: !1 })
], M.prototype, "data", 2);
j([
  g({ attribute: !1 })
], M.prototype, "program", 2);
j([
  g({ attribute: !1 })
], M.prototype, "defaultTypes", 2);
j([
  g({ type: Number })
], M.prototype, "day", 2);
j([
  $()
], M.prototype, "_p", 2);
j([
  $()
], M.prototype, "_isNew", 2);
j([
  $()
], M.prototype, "_tab", 2);
j([
  $()
], M.prototype, "_profileId", 2);
j([
  $()
], M.prototype, "_dayView", 2);
j([
  $()
], M.prototype, "_slotEdit", 2);
j([
  $()
], M.prototype, "_error", 2);
j([
  $()
], M.prototype, "_saving", 2);
j([
  $()
], M.prototype, "_copy", 2);
j([
  $()
], M.prototype, "_profileForm", 2);
M = j([
  N("wp-program-editor")
], M);
var vo = Object.defineProperty, $o = Object.getOwnPropertyDescriptor, mt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? $o(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && vo(t, s, o), o;
};
const bo = {
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  light: "mdi:lightbulb",
  switch: "mdi:power-plug",
  input_boolean: "mdi:toggle-switch",
  fan: "mdi:fan"
};
let tt = class extends P {
  constructor() {
    super(...arguments), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._previewKey = "";
  }
  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }
  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }
  setConfig(e) {
    this._config = { show_chart: !0, display: "device", ...e };
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = Oi(this.hass, (t) => {
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
  /** Resolved slots of today (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = he(/* @__PURE__ */ new Date(), this._tz), t = fs(this._data, this._config), s = `${e}|${t.map((o) => `${o.id}:${o.revision}`).join(",")}`;
    if (s === this._previewKey) return;
    this._previewKey = s;
    const i = {};
    await Promise.all(t.map((o) => this.hass.callWS({ type: "weekly_planner/preview", program_id: o.id, date: e }).then((n) => {
      i[o.id] = n.slots;
    }).catch(() => {
    }))), this._preview = i;
  }
  /* ---- blocks ---- */
  /** Entities shown in "device" mode, in program order. */
  _entities(e) {
    var i;
    const t = (i = this._config.filter) == null ? void 0 : i.types, s = /* @__PURE__ */ new Set();
    for (const o of e)
      for (const n of o.entities)
        (!(t != null && t.length) || t.includes(A(n.entity_id))) && s.add(n.entity_id);
    return [...s];
  }
  _programsOf(e) {
    return this._data.programs.filter((t) => t.entities.some((s) => s.entity_id === e)).sort((t, s) => t.priority - s.priority);
  }
  /** Spans of today for a device, from every program that schedules it. */
  _spans(e, t) {
    const s = this._data, i = this._lang, o = Ns(this._now, this._tz), n = [], r = (a) => Bt(a, e, s.modes);
    for (const a of [...t].reverse()) {
      if (!a.enabled) continue;
      const l = Ht(a, s), d = (_, f, b, x = {}) => {
        const G = r(_);
        return { start: f, end: b, color: Ls(s.modes, e, G), label: Yt(this.hass, i, s.modes, e, G), ...x };
      };
      for (const { slot: _, end: f } of Ve(l.days[(o + 6) % 7]))
        r(_) && n.push(d(_, 0, f));
      const m = this._preview[a.id];
      for (const _ of l.days[o]) {
        if (!r(_)) continue;
        const f = m == null ? void 0 : m.find((G) => G.slot_id === _.id);
        let b = I(_.start), x = I(_.end ?? null);
        f && (b = Ot(f.start, this._tz), x = f.end ? Ot(f.end, this._tz) : null), b !== null && n.push(d(
          _,
          b,
          x === null ? b + 10 : x > b ? x : k,
          { sun: "sun" in _.start || !!(_.end && "sun" in _.end), ignored: (f == null ? void 0 : f.ignored) ?? null }
        ));
      }
    }
    return n;
  }
  _next(e, t) {
    var i, o;
    const s = this._data;
    for (const n of t) {
      if (!n.enabled) continue;
      const r = (o = (i = s.status[n.id]) == null ? void 0 : i.next_actions) == null ? void 0 : o[e];
      if (r) return r;
    }
  }
  /* ---- actions ---- */
  async _cancelOverride(e) {
    try {
      await this.hass.callService("weekly_planner", "resume", { entity_id: [e] });
    } catch (t) {
      this._error = (t == null ? void 0 : t.message) ?? String(t);
    }
  }
  _open(e) {
    this._dialog = { kind: "schedule", scope: e };
  }
  /* ---- render ---- */
  _line(e, t, s) {
    var _, f;
    const i = this._lang, o = this._data, n = this._next(e, t), r = t.length > 0 && t.every((b) => !b.enabled), a = (_ = o.entities[e]) == null ? void 0 : _.override, l = ((f = this.hass.states[e]) == null ? void 0 : f.attributes.icon) ?? bo[A(e)] ?? "mdi:calendar-clock", d = () => this._open(s.open), m = a ? a.origin === "voluntary" && a.until ? h(i, "overridden_until", { time: me(_s(a.until, this._tz, i, this._now)) }) : h(i, "overridden") : "";
    return c`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${l}></ha-icon>
          <div class="info">
            ${s.name ? c`<span class="name">${wt(this.hass, e)}</span>` : p}
            <span class="now">
              <span class="nw">${Ni(this.hass, i, e)}</span>
              ${n ? c`<span class="nw">→ ${Yt(this.hass, i, o.modes, e, n.setpoint)}
                <span class="when">${me(_s(n.at, this._tz, i, this._now))}</span></span>` : p}
            </span>
          </div>
          ${r ? c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${h(i, "paused")}></ha-icon>` : p}
          ${s.button ? c`<button class="hours" @click=${d}>${h(i, "hours")}</button>` : p}
        </div>
        <wp-day-bar .spans=${this._spans(e, t)} .now=${Ot(this._now, this._tz)}
          @click=${d}></wp-day-bar>
        ${a ? c`<div class="manual"><ha-icon icon="mdi:hand-back-right"></ha-icon><span>${m}</span>
          <button class="x" aria-label=${h(i, "cancel_manual")} @click=${() => void this._cancelOverride(e)}>
            <ha-icon icon="mdi:close"></ha-icon></button></div>` : p}
      </div>`;
  }
  _byDevice(e) {
    return this._entities(e).map((t) => {
      const s = { kind: "device", entityId: t };
      return this._line(t, this._programsOf(t), { name: !0, button: s, open: s });
    });
  }
  _bySchedule(e) {
    const t = this._lang;
    return e.map((s) => {
      const i = { kind: "program", programId: s.id };
      return c`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${s.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${s.name}</h2>
          ${s.enabled ? p : c`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${h(t, "paused")}></ha-icon>`}
          <button class="hours" @click=${() => this._open(i)}>${h(t, "hours")}</button>
        </div>
        ${s.entities.map((o) => this._line(o.entity_id, [s], { name: s.entities.length > 1, button: null, open: i }))}
      </section>`;
    });
  }
  render() {
    var n;
    if (!this._config || !this.hass) return p;
    const e = this._lang, t = this._data, s = t ? fs(t, this._config) : [], i = !!t && !!((n = this.hass.user) != null && n.is_admin) && !!(t != null && t.can_edit), o = this._config.title !== void 0 && this._config.title !== "";
    return c`
      <ha-card>
        ${o || i || t != null && t.vacation ? c`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t != null && t.vacation ? c`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${h(e, "vacation")}</span>` : p}
              ${i ? c`<button class="gear" aria-label=${h(e, "settings")} @click=${() => this._dialog = { kind: "admin" }}>
                <ha-icon icon="mdi:cog"></ha-icon></button>` : p}
            </div>` : p}
        ${this._error ? c`<div class="error">${h(e, "error", { message: this._error })}</div>` : p}
        ${t != null && t.read_only ? c`<div class="error">${h(e, "read_only")}</div>` : p}
        ${t ? p : c`<div class="empty">…</div>`}
        ${t && !s.length ? c`<div class="empty">${h(e, "no_program")}</div>` : p}
        ${t ? this._config.display === "schedule" ? this._bySchedule(s) : this._byDevice(s) : p}
      </ha-card>
      ${this._renderDialog()}`;
  }
  _renderDialog() {
    var s;
    const e = this._dialog;
    if (!e || !this._data) return p;
    const t = () => this._dialog = null;
    switch (e.kind) {
      case "schedule":
        return js(uo(e.scope), c`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope}
          .chart=${this._config.show_chart !== !1} @closed=${t}
          @open-settings=${(i) => {
          const o = this._data.programs.find((n) => n.id === i.detail.programId);
          o && (this._dialog = { kind: "program", program: o });
        }}></wp-schedule>`);
      case "program":
        return c`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((s = this._config.filter) == null ? void 0 : s.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "admin": {
        const i = this._lang;
        return c`<wp-dialog open heading=${h(i, "settings")} @closed=${t}>
          <div class="adm">
            ${this._data.programs.map((o) => c`<button class="admrow" @click=${() => this._dialog = { kind: "program", program: o }}>
              <ha-icon icon=${o.icon ?? "mdi:calendar-clock"}></ha-icon><span>${o.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => this._dialog = { kind: "program" }}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${h(i, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }
};
tt.styles = F`
    ha-card { padding: 8px 16px 12px; }
    .head { display: flex; align-items: center; gap: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; font-size: 14px; padding: 2px 10px; border-radius: 12px; background: var(--warning-color, #ff9800); color: #fff; }
    .gear, .x {
      border: none; background: none; color: inherit; width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 22px; flex: none;
    }
    .gear:hover, .x:hover { background: var(--secondary-background-color); }
    .block { padding: 8px 0; border-top: 1px solid var(--divider-color); }
    .block:first-of-type, .head + .block { border-top: none; }
    .line { display: flex; align-items: center; gap: 10px; min-height: 48px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .when { opacity: 0.8; }
    .pause { --mdc-icon-size: 20px; color: var(--secondary-text-color); flex: none; }
    button.hours {
      flex: none; min-height: 48px; padding: 0 14px; border-radius: 24px; border: 1px solid var(--primary-color);
      background: none; color: var(--primary-color); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
    }
    wp-day-bar { cursor: pointer; margin-top: 2px; }
    .manual { display: flex; align-items: center; gap: 8px; font-size: 14px; --mdc-icon-size: 20px; margin-top: 2px; }
    .manual span { flex: 1; min-width: 0; }
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
mt([
  g({ attribute: !1 })
], tt.prototype, "hass", 2);
mt([
  $()
], tt.prototype, "_config", 2);
mt([
  $()
], tt.prototype, "_data", 2);
mt([
  $()
], tt.prototype, "_error", 2);
mt([
  $()
], tt.prototype, "_dialog", 2);
mt([
  $()
], tt.prototype, "_preview", 2);
mt([
  $()
], tt.prototype, "_now", 2);
tt = mt([
  N("weekly-planner-card")
], tt);
var wo = Object.defineProperty, xo = Object.getOwnPropertyDescriptor, be = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? xo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && wo(t, s, o), o;
};
const ko = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let It = class extends P {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return h(this._lang, e, t);
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
    return c`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(o) => this._set("title", o.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? c`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(o) => this._set("program", o.target.value)}>
              ${this._programs.length === 0 ? c`<option value="">${this._tr("no_program")}</option>` : p}
              ${!this._programs.some((o) => o.id === e.program) && e.program ? c`<option value=${e.program} selected>${e.program}</option>` : p}
              ${this._programs.map((o) => c`<option value=${o.id} ?selected=${o.id === e.program}>${o.name}</option>`)}
            </select></div>` : c`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${ko.map((o) => c`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(o)}
                @change=${(n) => this._setFilter({ types: n.target.checked ? [...t, o] : t.filter((r) => r !== o) })} />
                ${Je(this._lang, o)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((i = e.filter) == null ? void 0 : i.area) ?? ""} placeholder="bureau"
                @input=${(o) => this._setFilter({ area: o.target.value.trim() })} /></div>`}

      <div class="label">${this._tr("ce_display")}</div>
      <div class="row" role="radiogroup" aria-label=${this._tr("ce_display")}>
        <label class="check"><input type="radio" name="ce-display" .checked=${e.display !== "schedule"}
          @change=${() => this._set("display", void 0)} /> ${this._tr("ce_display_device")}</label>
        <label class="check"><input type="radio" name="ce-display" .checked=${e.display === "schedule"}
          @change=${() => this._set("display", "schedule")} /> ${this._tr("ce_display_schedule")}</label>
      </div>
      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(o) => this._set("show_chart", o.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
It.styles = [st, F`:host { display: block; padding: 4px 0; }`];
be([
  g({ attribute: !1 })
], It.prototype, "hass", 2);
be([
  $()
], It.prototype, "_config", 2);
be([
  $()
], It.prototype, "_programs", 2);
It = be([
  N("weekly-planner-card-editor")
], It);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
