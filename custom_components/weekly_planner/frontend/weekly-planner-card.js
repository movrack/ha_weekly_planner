/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const re = globalThis, Ce = re.ShadowRoot && (re.ShadyCSS === void 0 || re.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Me = Symbol(), Fe = /* @__PURE__ */ new WeakMap();
let li = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== Me) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Ce && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = Fe.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Fe.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ai = (e) => new li(typeof e == "string" ? e : e + "", void 0, Me), V = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, r, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[o + 1], e[0]);
  return new li(i, e, Me);
}, Ei = (e, t) => {
  if (Ce) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), r = re.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, e.appendChild(s);
  }
}, Re = Ce ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return Ai(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Pi, defineProperty: Ci, getOwnPropertyDescriptor: Mi, getOwnPropertyNames: Oi, getOwnPropertySymbols: Di, getPrototypeOf: Ti } = Object, _t = globalThis, He = _t.trustedTypes, ji = He ? He.emptyScript : "", $e = _t.reactiveElementPolyfillSupport, Ft = (e, t) => e, oe = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ji : null;
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
} }, Oe = (e, t) => !Pi(e, t), Le = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: Oe };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), _t.litPropertyMetadata ?? (_t.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ct = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = Le) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, i);
      r !== void 0 && Ci(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: r, set: o } = Mi(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const a = r == null ? void 0 : r.call(this);
      o == null || o.call(this, n), this.requestUpdate(t, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Le;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ft("elementProperties"))) return;
    const t = Ti(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ft("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ft("properties"))) {
      const i = this.properties, s = [...Oi(i), ...Di(i)];
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
      for (const r of s) i.unshift(Re(r));
    } else t !== void 0 && i.push(Re(t));
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
    return Ei(t, this.constructor.elementStyles), t;
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
    var o;
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : oe).toAttribute(i, s.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, i) {
    var o, n;
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), d = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((o = a.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? a.converter : oe;
      this._$Em = r;
      const c = d.fromAttribute(i, a.type);
      this[r] = c ?? ((n = this._$Ej) == null ? void 0 : n.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, r = !1, o) {
    var n;
    if (t !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[t]), s ?? (s = a.getPropertyOptions(t)), !((s.hasChanged ?? Oe)(o, i) || s.useDefault && s.reflect && o === ((n = this._$Ej) == null ? void 0 : n.get(t)) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: r, wrapped: o }, n) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [o, n] of this._$Ep) this[o] = n;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, n] of r) {
        const { wrapped: a } = n, d = this[o];
        a !== !0 || this._$AL.has(o) || d === void 0 || this.C(o, void 0, n, d);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), (s = this._$EO) == null || s.forEach((r) => {
        var o;
        return (o = r.hostUpdate) == null ? void 0 : o.call(r);
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
Ct.elementStyles = [], Ct.shadowRootOptions = { mode: "open" }, Ct[Ft("elementProperties")] = /* @__PURE__ */ new Map(), Ct[Ft("finalized")] = /* @__PURE__ */ new Map(), $e == null || $e({ ReactiveElement: Ct }), (_t.reactiveElementVersions ?? (_t.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Rt = globalThis, qe = (e) => e, ne = Rt.trustedTypes, Ve = ne ? ne.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, di = "$lit$", pt = `lit$${Math.random().toFixed(9).slice(2)}$`, ci = "?" + pt, Ni = `<${ci}>`, St = document, Ht = () => St.createComment(""), Lt = (e) => e === null || typeof e != "object" && typeof e != "function", De = Array.isArray, Ii = (e) => De(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", ve = `[ 	
\f\r]`, Wt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, Je = />/g, gt = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ke = /'/g, Ge = /"/g, pi = /^(?:script|style|textarea|title)$/i, hi = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = hi(1), $t = hi(2), jt = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Xe = /* @__PURE__ */ new WeakMap(), bt = St.createTreeWalker(St, 129);
function _i(e, t) {
  if (!De(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ve !== void 0 ? Ve.createHTML(t) : t;
}
const zi = (e, t) => {
  const i = e.length - 1, s = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = Wt;
  for (let a = 0; a < i; a++) {
    const d = e[a];
    let c, u, _ = -1, $ = 0;
    for (; $ < d.length && (n.lastIndex = $, u = n.exec(d), u !== null); ) $ = n.lastIndex, n === Wt ? u[1] === "!--" ? n = Be : u[1] !== void 0 ? n = Je : u[2] !== void 0 ? (pi.test(u[2]) && (r = RegExp("</" + u[2], "g")), n = gt) : u[3] !== void 0 && (n = gt) : n === gt ? u[0] === ">" ? (n = r ?? Wt, _ = -1) : u[1] === void 0 ? _ = -2 : (_ = n.lastIndex - u[2].length, c = u[1], n = u[3] === void 0 ? gt : u[3] === '"' ? Ge : Ke) : n === Ge || n === Ke ? n = gt : n === Be || n === Je ? n = Wt : (n = gt, r = void 0);
    const b = n === gt && e[a + 1].startsWith("/>") ? " " : "";
    o += n === Wt ? d + Ni : _ >= 0 ? (s.push(c), d.slice(0, _) + di + d.slice(_) + pt + b) : d + pt + (_ === -2 ? a : b);
  }
  return [_i(e, o + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class qt {
  constructor({ strings: t, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const a = t.length - 1, d = this.parts, [c, u] = zi(t, i);
    if (this.el = qt.createElement(c, s), bt.currentNode = this.el.content, i === 2 || i === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (r = bt.nextNode()) !== null && d.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const _ of r.getAttributeNames()) if (_.endsWith(di)) {
          const $ = u[n++], b = r.getAttribute(_).split(pt), S = /([.?@])?(.*)/.exec($);
          d.push({ type: 1, index: o, name: S[2], strings: b, ctor: S[1] === "." ? Wi : S[1] === "?" ? Fi : S[1] === "@" ? Ri : le }), r.removeAttribute(_);
        } else _.startsWith(pt) && (d.push({ type: 6, index: o }), r.removeAttribute(_));
        if (pi.test(r.tagName)) {
          const _ = r.textContent.split(pt), $ = _.length - 1;
          if ($ > 0) {
            r.textContent = ne ? ne.emptyScript : "";
            for (let b = 0; b < $; b++) r.append(_[b], Ht()), bt.nextNode(), d.push({ type: 2, index: ++o });
            r.append(_[$], Ht());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ci) d.push({ type: 2, index: o });
      else {
        let _ = -1;
        for (; (_ = r.data.indexOf(pt, _ + 1)) !== -1; ) d.push({ type: 7, index: o }), _ += pt.length - 1;
      }
      o++;
    }
  }
  static createElement(t, i) {
    const s = St.createElement("template");
    return s.innerHTML = t, s;
  }
}
function Nt(e, t, i = e, s) {
  var n, a;
  if (t === jt) return t;
  let r = s !== void 0 ? (n = i._$Co) == null ? void 0 : n[s] : i._$Cl;
  const o = Lt(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== o && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), o === void 0 ? r = void 0 : (r = new o(e), r._$AT(e, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = r : i._$Cl = r), r !== void 0 && (t = Nt(e, r._$AS(e, t.values), r, s)), t;
}
class Ui {
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
    const { el: { content: i }, parts: s } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? St).importNode(i, !0);
    bt.currentNode = r;
    let o = bt.nextNode(), n = 0, a = 0, d = s[0];
    for (; d !== void 0; ) {
      if (n === d.index) {
        let c;
        d.type === 2 ? c = new Kt(o, o.nextSibling, this, t) : d.type === 1 ? c = new d.ctor(o, d.name, d.strings, this, t) : d.type === 6 && (c = new Hi(o, this, t)), this._$AV.push(c), d = s[++a];
      }
      n !== (d == null ? void 0 : d.index) && (o = bt.nextNode(), n++);
    }
    return bt.currentNode = St, r;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class Kt {
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
    t = Nt(this, t, i), Lt(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== jt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ii(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && Lt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(St.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var o;
    const { values: i, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = qt.createElement(_i(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === r) this._$AH.p(i);
    else {
      const n = new Ui(r, this), a = n.u(this.options);
      n.p(i), this.T(a), this._$AH = n;
    }
  }
  _$AC(t) {
    let i = Xe.get(t.strings);
    return i === void 0 && Xe.set(t.strings, i = new qt(t)), i;
  }
  k(t) {
    De(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const o of t) r === i.length ? i.push(s = new Kt(this.O(Ht()), this.O(Ht()), this, this.options)) : s = i[r], s._$AI(o), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); t !== this._$AB; ) {
      const r = qe(t).nextSibling;
      qe(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var i;
    this._$AM === void 0 && (this._$Cv = t, (i = this._$AP) == null || i.call(this, t));
  }
}
class le {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, r, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, i = this, s, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = Nt(this, t, i, 0), n = !Lt(t) || t !== this._$AH && t !== jt, n && (this._$AH = t);
    else {
      const a = t;
      let d, c;
      for (t = o[0], d = 0; d < o.length - 1; d++) c = Nt(this, a[s + d], i, d), c === jt && (c = this._$AH[d]), n || (n = !Lt(c) || c !== this._$AH[d]), c === h ? t = h : t !== h && (t += (c ?? "") + o[d + 1]), this._$AH[d] = c;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Wi extends le {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Fi extends le {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Ri extends le {
  constructor(t, i, s, r, o) {
    super(t, i, s, r, o), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = Nt(this, t, i, 0) ?? h) === jt) return;
    const s = this._$AH, r = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Hi {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Nt(this, t);
  }
}
const be = Rt.litHtmlPolyfillSupport;
be == null || be(qt, Kt), (Rt.litHtmlVersions ?? (Rt.litHtmlVersions = [])).push("3.3.3");
const Li = (e, t, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = r = new Kt(t.insertBefore(Ht(), o), o, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = globalThis;
let O = class extends Ct {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Li(i, this.renderRoot, this.renderOptions);
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
    return jt;
  }
};
var ai;
O._$litElement$ = !0, O.finalized = !0, (ai = wt.litElementHydrateSupport) == null || ai.call(wt, { LitElement: O });
const we = wt.litElementPolyfillSupport;
we == null || we({ LitElement: O });
(wt.litElementVersions ?? (wt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qi = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: Oe }, Vi = (e = qi, t, i) => {
  const { kind: s, metadata: r } = i;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), o.set(i.name, e), s === "accessor") {
    const { name: n } = i;
    return { set(a) {
      const d = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(n, d, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(n, void 0, e, a), a;
    } };
  }
  if (s === "setter") {
    const { name: n } = i;
    return function(a) {
      const d = this[n];
      t.call(this, a), this.requestUpdate(n, d, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function m(e) {
  return (t, i) => typeof i == "object" ? Vi(e, t, i) : ((s, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(e) {
  return m({ ...e, state: !0, attribute: !1 });
}
const F = 5, P = 1440;
function tt(e) {
  const [t, i] = e.split(":").map(Number);
  return t * 60 + i;
}
function Q(e) {
  const t = Math.max(0, Math.min(P, Math.round(e / F) * F));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function xt(e, t) {
  var n, a;
  const i = typeof e == "string" ? new Date(e) : e, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), r = Number(((n = s.find((d) => d.type === "hour")) == null ? void 0 : n.value) ?? 0), o = Number(((a = s.find((d) => d.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return r * 60 + o;
}
function ui(e, t) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function kt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function ae(e, t, i) {
  return new Intl.DateTimeFormat(i, { timeZone: t, hour: "2-digit", minute: "2-digit" }).format(
    new Date(e)
  );
}
function C(e) {
  return !e || !("time" in e) ? null : tt(e.time);
}
function Bi(e, t) {
  const i = (t == null ? void 0 : t.start) ?? C(e.start) ?? 0, s = t ? t.end : C(e.end ?? null);
  return s == null ? [[i, Math.min(P, i + F)]] : s > i ? [[i, s]] : [[i, P]];
}
function de(e) {
  const t = [];
  for (const i of e) {
    const s = C(i.start), r = C(i.end ?? null);
    s !== null && r !== null && r <= s && r < 720 && t.push({ slot: i, end: r });
  }
  return t;
}
function Ji(e, t, i, s = /* @__PURE__ */ new Date()) {
  const r = new Date(e), o = kt(r, t) === kt(s, t), n = { timeZone: t, hour: "2-digit", minute: "2-digit" };
  return o || (n.weekday = "short"), new Intl.DateTimeFormat(i, n).format(r);
}
var Ki = Object.defineProperty, Gi = Object.getOwnPropertyDescriptor, Gt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Gi(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ki(t, i, r), r;
};
let At = class extends O {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1;
  }
  render() {
    const e = (t) => `${t / P * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.spans.map(
      (t) => l`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${!this.thin && t.end - t.start >= 90 ? l`<span>${t.sun ? "☀️ " : ""}${t.label}</span>` : h}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${e(this.now)}"></div>` : h}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 6, 12, 18, 24].map((t) => l`<span style="left:${e(t * 60)}">${t}h</span>`)}</div>` : h}
    `;
  }
};
At.styles = V`
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
      color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); padding: 0 6px;
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
Gt([
  m({ attribute: !1 })
], At.prototype, "spans", 2);
Gt([
  m({ type: Number })
], At.prototype, "now", 2);
Gt([
  m({ type: Boolean })
], At.prototype, "thin", 2);
Gt([
  m({ type: Boolean, attribute: "show-hours" })
], At.prototype, "showHours", 2);
At = Gt([
  R("wp-day-bar")
], At);
var Xi = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, ce = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yi(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Xi(t, i, r), r;
};
let It = class extends O {
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
    return this.open ? l`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label="Close">✕</button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : l``;
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
    header { display: flex; align-items: center; gap: 8px; padding: 16px 16px 8px 20px; }
    h2 { flex: 1; margin: 0; font-size: 20px; font-weight: 500; }
    .content { padding: 8px 20px 16px; overflow-y: auto; }
    footer { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 16px 16px; }
    footer:empty { display: none; }
    button.icon {
      border: none; background: none; color: inherit; font-size: 18px; width: 40px; height: 40px;
      border-radius: 20px; cursor: pointer;
    }
    button.icon:hover { background: var(--secondary-background-color); }
    @media (max-width: 600px) {
      .panel, .panel.wide {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
ce([
  m()
], It.prototype, "heading", 2);
ce([
  m({ type: Boolean, reflect: !0 })
], It.prototype, "open", 2);
ce([
  m({ type: Boolean })
], It.prototype, "wide", 2);
It = ce([
  R("wp-dialog")
], It);
const Zi = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  days_short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  title: "Weekly Planner",
  vacation: "Vacation",
  vacation_on: "Vacation: programs are paused",
  no_program: "No program yet.",
  new_program: "New program",
  until: "until {time}",
  then: "then {mode}",
  now: "Now",
  off_slot: "Outside slots",
  default_state: "Default",
  override: "Override",
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
  profile: "Profile",
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
  setpoint: "Setpoint",
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
  tab_entities: "Entities",
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
  pe_default: "Outside slots",
  pe_default_none: "Do nothing",
  pe_default_previous: "Previous state",
  pe_default_mode: "A mode",
  pe_default_setpoint: "A setpoint",
  pe_permanent: "Permanent override (Evohome)",
  pe_permanent_hint: "Sends the “permanent” preset before the setpoint.",
  profile_default: "Standard week",
  profile_add: "Add a profile",
  profile_rename: "Rename the profile",
  profile_copy: "Copy the profile",
  profile_delete: "Delete the profile",
  profile_active_hint: "Active profile (cannot be deleted).",
  profile_rename_warning: "Automations using the old name must be updated.",
  copy_day: "Copy this day to…",
  copy_weekdays: "Mon → Fri",
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
  mode_unused: "Not used",
  mode_used_one: "Used by {n} program",
  mode_used_many: "Used by {n} programs",
  mode_in_use: "Still used by: {list}",
  ov_current: "Overrides in progress",
  ov_entities: "Entities",
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
  sp_auto: "Automatic"
}, Qi = {
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  days_short: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  title: "Weekly Planner",
  vacation: "Vacances",
  vacation_on: "Vacances : les programmes sont en pause",
  no_program: "Aucun programme pour l'instant.",
  new_program: "Nouveau programme",
  until: "jusqu'à {time}",
  then: "puis {mode}",
  now: "Maintenant",
  off_slot: "Hors plage",
  default_state: "Par défaut",
  override: "Déroger…",
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
  profile: "Profil",
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
  entity: "Entité",
  clear: "Effacer",
  ok: "OK",
  confirm: "Confirmer",
  copy: "Copier",
  copy_suffix: "(copie)",
  setpoint: "Consigne",
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
  f_target_self: "Cibler l'entité",
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
  slot_direct: "Consignes",
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
  action_direct: "Consignes directes",
  mode_for_type: "Mode pour {type}",
  slot_color: "Couleur (facultatif)",
  err_start_equals_end: "Le début et la fin doivent être différents.",
  err_no_action: "Choisissez au moins un mode ou une consigne.",
  err_incomplete: "Certains champs sont vides.",
  err_overlap: "Chevauche la plage {slot}.",
  tab_general: "Général",
  tab_entities: "Entités",
  tab_week: "Semaine",
  pe_name: "Nom",
  pe_icon: "Icône (mdi:…)",
  pe_priority: "Priorité (1–100)",
  pe_priority_hint: "Si deux programmes pilotent la même entité, le plus petit numéro l'emporte.",
  pe_enabled: "Programme actif",
  pe_reapply: "Réappliquer la plage en cours après un redémarrage ou une modification",
  pe_reapply_hint: "Désactivé : après un redémarrage ou une modification, rien n'est envoyé avant le prochain changement.",
  pe_main_type: "Type principal (couleur des plages)",
  pe_conditions: "Conditions du programme",
  pe_conditions_hint: "Le programme ne s'exécute que si toutes les conditions sont vraies.",
  pe_no_entity: "Aucune entité : ajoutez-en au moins une.",
  pe_add_entity: "Ajouter une entité",
  pe_unknown_entity: "entité inconnue",
  pe_default: "Hors plage",
  pe_default_none: "Ne rien faire",
  pe_default_previous: "État d'avant",
  pe_default_mode: "Un mode",
  pe_default_setpoint: "Une consigne",
  pe_permanent: "Dérogation permanente (Evohome)",
  pe_permanent_hint: "Envoie le préréglage « permanent » avant la consigne.",
  profile_default: "Semaine type",
  profile_add: "Ajouter un profil",
  profile_rename: "Renommer le profil",
  profile_copy: "Copier le profil",
  profile_delete: "Supprimer le profil",
  profile_active_hint: "Profil actif (ne peut pas être supprimé).",
  profile_rename_warning: "Les automatisations qui utilisent l'ancien nom sont à mettre à jour.",
  copy_day: "Copier ce jour vers…",
  copy_weekdays: "Lun → Ven",
  copy_weekend: "Sam + Dim",
  copy_all: "Tous les jours",
  copy_choose: "Jours",
  copy_warning: "Les plages existantes des jours choisis sont remplacées.",
  err_name: "Le nom est obligatoire.",
  err_no_entity: "Ajoutez au moins une entité.",
  err_profile_name: "Les noms de profil doivent être uniques et non vides.",
  err_overlap_day: "Plages qui se chevauchent : {profile}, {day}.",
  err_overlap_server: "Des plages se chevauchent un jour.",
  err_unauthorized: "Réservé aux administrateurs.",
  no_modes: "Aucun mode pour ce type.",
  mode_new: "Nouveau mode",
  mode_edit: "Modifier le mode",
  mode_name: "Nom",
  mode_color: "Couleur",
  mode_value: "Valeur commune",
  mode_rep_entity: "Entité de référence (pour lire les choix)",
  mode_exceptions: "Exceptions par entité",
  mode_exceptions_hint: "Une entité peut avoir sa propre valeur pour ce mode.",
  mode_exceptions_n: "{n} exception(s)",
  mode_add_exception: "Ajouter une exception",
  mode_unused: "Non utilisé",
  mode_used_one: "Utilisé par {n} programme",
  mode_used_many: "Utilisé par {n} programmes",
  mode_in_use: "Encore utilisé par : {list}",
  ov_current: "Dérogations en cours",
  ov_entities: "Entités",
  ov_how_setpoint: "Une consigne",
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
  ov_err_mixed: "Choisissez des entités du même type.",
  ov_err_no_entity: "Choisissez au moins une entité.",
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
  sp_auto: "Automatique"
};
function B(e) {
  return e.startsWith("fr") ? Qi : Zi;
}
function x(e, t, i = {}) {
  let s = B(e)[t];
  for (const [r, o] of Object.entries(i)) s = s.replace(`{${r}}`, o);
  return s;
}
let ee, vt;
const ie = /* @__PURE__ */ new Set();
function ts(e, t) {
  return ie.add(t), ee && t(ee), vt || (vt = e.connection.subscribeMessage(
    (i) => {
      ee = i, ie.forEach((s) => s(i));
    },
    { type: "weekly_planner/subscribe" }
  ), vt.catch(() => {
    vt = void 0;
  })), () => {
    ie.delete(t), ie.size === 0 && vt && (vt.then((i) => i()).catch(() => {
    }), vt = void 0, ee = void 0);
  };
}
const k = (e) => e.split(".")[0];
function Ae(e) {
  var t;
  return e.main_type || k(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function Tt(e, t) {
  var s;
  const i = ((s = t.status[e.id]) == null ? void 0 : s.active_profile) ?? e.active_profile;
  return e.profiles.find((r) => r.id === i) ?? e.profiles[0];
}
function pe(e, t, i) {
  const s = e.actions.by_type[Ae(t)] ?? Object.values(e.actions.by_type)[0];
  return i.find((r) => r.id === s);
}
function ut(e, t, i) {
  var s;
  return e.color || ((s = pe(e, t, i)) == null ? void 0 : s.color) || "var(--secondary-text-color)";
}
function zt(e, t, i, s) {
  const r = pe(e, t, i);
  if (r) return r.name;
  const o = Object.keys(e.actions.by_entity).length;
  return o ? `${s} (${o})` : s;
}
function L(e, t) {
  var i;
  return ((i = e.states[t]) == null ? void 0 : i.attributes.friendly_name) ?? t;
}
function Ye(e, t) {
  var r, o;
  if (t.program) return e.programs.filter((n) => n.id === t.program);
  const i = (r = t.filter) == null ? void 0 : r.types, s = (o = t.filter) == null ? void 0 : o.area;
  return e.programs.filter((n) => !(i != null && i.length) || n.entities.some((a) => i.includes(k(a.entity_id)))).filter((n) => !s || n.area === s).sort((n, a) => n.priority - a.priority || n.name.localeCompare(a.name));
}
function Ot() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
var es = Object.defineProperty, is = Object.getOwnPropertyDescriptor, Z = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? is(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && es(t, i, r), r;
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
  }).formatToParts(new Date(e)), s = (o) => {
    var n;
    return Number(((n = i.find((a) => a.type === o)) == null ? void 0 : n.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(e / 1e3) * 1e3;
}
function Qe(e, t) {
  const [i, s, r] = e.split("-").map(Number), o = Date.UTC(i, s - 1, r), n = o - Ze(o, t);
  return o - Ze(n, t);
}
function mi(e, t) {
  const [i, s, r] = e.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + t)).toISOString().slice(0, 10);
}
function se(e, t) {
  return { startMs: Qe(e, t), endMs: Qe(mi(e, 1), t) };
}
function Mt(e) {
  const [t, i, s] = e.split("-").map(Number);
  return ui(new Date(Date.UTC(t, i - 1, s, 12)), "UTC");
}
const xe = /* @__PURE__ */ new Map();
function ti(e, t, i) {
  const s = xe.get(e);
  if (s && Date.now() - s.at < t) return s.p;
  const r = i();
  return xe.set(e, { at: Date.now(), p: r }), r.catch(() => xe.delete(e)), r;
}
const ei = "var(--disabled-text-color, #9e9e9e)";
function ii(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  let i = {};
  for (const s of e) {
    s.a && (i = s.a);
    const r = s.lu ?? s.lc ?? s.last_updated_ts, o = typeof r == "number" ? r * 1e3 : Date.parse(s.last_updated ?? "");
    Number.isNaN(o) || t.push({ t: o, s: String(s.s ?? s.state ?? ""), a: i });
  }
  return t;
}
const ss = (e) => e === "unavailable" || e === "unknown" || e === "", H = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let q = class extends O {
  constructor() {
    super(...arguments), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._cursor = null, this._model = null, this._token = 0;
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
    this._loaded = null, this._failed = !1, this._cursor = null;
    const { startMs: i, endMs: s } = se(this.date, this._tz), r = Date.now(), n = s > r ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const d = i < r ? ti(`h|${e}|${a}`, n, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: new Date(Math.min(s, r)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), c = Math.min(14, Math.max(1, Math.ceil((r - i) / 864e5) + 1)), u = i < r ? ti(`j|${this.entityId}|${c}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: c })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, $] = await Promise.all([d, u]);
      if (t !== this._token) return;
      this._loaded = {
        hist: ii(_[this.entityId]),
        win: a ? ii(_[a]) : [],
        journal: ($.segments ?? []).filter((b) => b.entity_id === this.entityId)
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
    const i = this.data.modes.find((s) => s.id === e);
    return i ? i.exceptions[t] ?? i.value : null;
  }
  _slotSetpoint(e) {
    return e.actions.by_entity[this.entityId] ?? this._modeSetpoint(e.actions.by_type[k(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(e) {
    if (!e) return null;
    const t = k(this.entityId);
    if (t === "climate") {
      const i = H(e.temperature);
      return i !== null ? i : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? H(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? H(e.brightness) ?? 100 : null : e.kind === "value" ? H(e.value) : null;
  }
  _presetTemperature(e) {
    var a, d;
    const t = ((a = this.hass.states[this.entityId]) == null ? void 0 : a.attributes) ?? {}, i = H((d = t.preset_temperatures) == null ? void 0 : d[e]) ?? H(t[`${e}_temp`]) ?? H(t[`${e}_temperature`]);
    if (i !== null) return i;
    const s = Array.isArray(t.preset_modes) ? t.preset_modes : [], r = s.indexOf(e);
    if (r < 0) return null;
    const o = H(t.min_temp) ?? 5, n = H(t.max_temp) ?? 30;
    return o + (r + 1) / (s.length + 1) * (n - o);
  }
  _live(e) {
    const t = k(this.entityId);
    if (ss(e.s)) return { applied: null, measured: null };
    if (t === "climate") return { applied: H(e.a.temperature), measured: H(e.a.current_temperature) };
    if (t === "cover") return { applied: H(e.a.current_position), measured: null };
    if (t === "light") {
      const s = e.s === "on" ? H(e.a.brightness) : 0;
      return { applied: s === null ? e.s === "on" ? 100 : 0 : s / 255 * 100, measured: null };
    }
    const i = Number(e.s);
    return { applied: Number.isFinite(i) ? i : null, measured: null };
  }
  // ---- build ----
  _build(e) {
    var Ue, We;
    const t = this._tz, { startMs: i, endMs: s } = se(this.date, t), r = Math.round((s - i) / 6e4), o = Date.now(), n = Math.max(0, Math.min(r, (o - i) / 6e4)), a = (p) => (p - i) / 6e4, d = k(this.entityId), c = this.data.modes, u = Tt(this.program, this.data), _ = /* @__PURE__ */ new Map();
    for (const p of this.program.profiles) for (const f of p.days.flat()) _.set(f.id, f);
    const $ = x(this._lang, "override"), b = Mt(this.date), S = [];
    for (const { slot: p, end: f } of de(u.days[(b + 6) % 7])) S.push({ s: 0, e: f, slot: p });
    if (this.slots)
      for (const p of this.slots) {
        const f = _.get(p.slot_id);
        if (!f || p.ignored) continue;
        const v = Math.max(0, a(Date.parse(p.start))), E = p.end ? Math.min(r, a(Date.parse(p.end))) : v + 5;
        E > v && S.push({ s: v, e: E, slot: f });
      }
    else
      for (const p of u.days[b]) {
        const f = C(p.start);
        if (f === null) continue;
        const v = C(p.end ?? null);
        S.push({ s: f, e: v === null ? f + 5 : v > f ? v : r, slot: p });
      }
    S.sort((p, f) => p.s - f.s);
    const A = (Ue = this.program.entities.find((p) => p.entity_id === this.entityId)) == null ? void 0 : Ue.default, g = A ? A.kind === "mode" ? this._modeSetpoint(String(A.value), this.entityId) : A.kind === "setpoint" ? A.value : null : null, I = (A == null ? void 0 : A.kind) === "mode" ? c.find((p) => p.id === A.value) : void 0, z = (A == null ? void 0 : A.kind) === "previous", W = [];
    let ct = 0;
    const T = (p) => {
      if (p <= ct) return;
      const f = W[W.length - 1];
      W.push(z && f ? { ...f, s: ct, e: p } : { s: ct, e: p, v: this._value(g), color: (I == null ? void 0 : I.color) ?? ei, label: (I == null ? void 0 : I.name) ?? x(this._lang, "default_state") }), ct = p;
    };
    for (const p of S) {
      const f = Math.max(p.s, ct);
      if (p.e <= f) continue;
      T(f);
      const v = this._slotSetpoint(p.slot);
      W.push({
        s: f,
        e: p.e,
        v: this._value(v),
        color: ut(p.slot, this.program, c),
        label: zt(p.slot, this.program, c, $)
      }), ct = p.e;
    }
    T(r);
    const mt = (p) => W.find((f) => p >= f.s && p < f.e) ?? W[W.length - 1], Xt = e.journal.map((p) => ({ m: a(Date.parse(p.at)), e: p })).filter((p) => !Number.isNaN(p.m)).sort((p, f) => p.m - f.m), vi = (p) => {
      let f = null;
      for (const E of Xt) if (E.m <= p) f = E;
      else break;
      if (!f) return null;
      const v = f.e.slot_id ? _.get(f.e.slot_id) : void 0;
      return {
        s: f.m,
        e: f.m,
        v: this._value(f.e.setpoint),
        color: v ? ut(v, this.program, c) : ei,
        label: v ? zt(v, this.program, c, $) : ""
      };
    }, Yt = /* @__PURE__ */ new Set([0, r, n]);
    W.forEach((p) => {
      Yt.add(p.s), Yt.add(p.e);
    }), Xt.forEach((p) => {
      p.m > 0 && p.m < r && Yt.add(p.m);
    });
    const ue = [...Yt].filter((p) => p >= 0 && p <= r).sort((p, f) => p - f), Zt = [];
    for (let p = 0; p < ue.length - 1; p++) {
      const f = ue[p], v = ue[p + 1];
      if (v - f < 0.01) continue;
      const E = (f + v) / 2, yt = (E < n ? vi(E) : null) ?? mt(E);
      Zt.push({ s: f, e: v, v: yt.v, color: yt.color, label: yt.label });
    }
    const Et = [], me = [], je = [];
    for (const p of e.hist) {
      const f = Math.max(0, a(p.t)), v = this._live(p);
      Et.push({ m: f, v: v.applied, heating: p.a.hvac_action === "heating" }), me.push({ m: f, v: v.measured });
    }
    const Ne = (p, f) => {
      const v = [];
      return p.forEach((E, ft) => {
        if (!f(ft)) return;
        const yt = ft + 1 < p.length ? p[ft + 1].m : n;
        if (yt > E.m) {
          const ge = v[v.length - 1];
          ge && Math.abs(ge[1] - E.m) < 0.01 ? ge[1] = yt : v.push([E.m, yt]);
        }
      }), v;
    };
    je.push(...Ne(Et, (p) => !!Et[p].heating));
    const Ie = e.win.map((p) => ({ m: Math.max(0, a(p.t)), open: p.s === "on" })), bi = Ne(Ie, (p) => Ie[p].open), wi = (p, f) => {
      let v = null, E = !1;
      for (const ft of p) if (ft.m <= f)
        v = ft.v, E = !0;
      else break;
      return E ? v : null;
    }, xi = (p) => {
      var f;
      return ((f = Zt.find((v) => p >= v.s && p < v.e)) == null ? void 0 : f.v) ?? null;
    }, ki = d === "climate" ? 0.5 : 5, ze = [];
    let Pt = null;
    const fe = Math.floor(n);
    for (let p = 0; p <= fe + 1; p++) {
      const f = p <= fe ? xi(p + 0.5) : null, v = p <= fe ? wi(Et, p + 0.5) : null, E = f !== null && v !== null && Math.abs(f - v) > ki;
      E && Pt === null && (Pt = p), !E && Pt !== null && (p - Pt > 2 && ze.push([Pt, p]), Pt = null);
    }
    const ye = [...Zt.map((p) => p.v), ...Et.map((p) => p.v), ...me.map((p) => p.v)].filter((p) => p !== null);
    let Qt = 0, te = 100;
    d !== "cover" && d !== "light" && ye.length && (Qt = Math.floor(Math.min(...ye) - 1), te = Math.ceil(Math.max(...ye) + 1), te - Qt < 2 && (te = Qt + 2));
    const Si = d === "climate" ? "°C" : d === "cover" || d === "light" ? "%" : ((We = this.hass.states[this.entityId]) == null ? void 0 : We.attributes.unit_of_measurement) ?? "";
    return {
      span: r,
      pastEnd: n,
      isToday: i <= o && o < s,
      planned: Zt,
      applied: Et,
      measured: me,
      heat: je,
      win: bi,
      over: ze,
      lo: Qt,
      hi: te,
      unit: Si
    };
  }
  // ---- interaction ----
  _pointer(e) {
    const t = this._model;
    if (!t) return;
    const i = e.currentTarget.getBoundingClientRect(), s = e.clientX - i.left;
    this._cursor = this._clampM((s - w.l) / (i.width - w.l - w.r) * t.span, t.span);
  }
  _clampM(e, t) {
    return Math.max(0, Math.min(t - 1, Math.round(e)));
  }
  _key(e) {
    const t = this._model;
    if (!t) return;
    const i = this._cursor ?? Math.round(t.isToday ? t.pastEnd : t.span / 2);
    let s = null;
    if (e.key === "ArrowLeft") s = i - 15;
    else if (e.key === "ArrowRight") s = i + 15;
    else if (e.key === "Home") s = 0;
    else if (e.key === "End") s = t.span - 1;
    else if (e.key === "Escape" && this._cursor !== null) {
      e.stopPropagation(), this._cursor = null;
      return;
    }
    s !== null && (e.preventDefault(), this._cursor = this._clampM(s, t.span));
  }
  // ---- render ----
  _fmt(e, t) {
    return e === null ? "–" : `${Number(e.toFixed(1))}${t ? " " + t : ""}`;
  }
  _clock(e) {
    const { startMs: t } = se(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t + e * 6e4));
  }
  _valueAt(e, t) {
    let i = null;
    for (const s of e) if (s.m <= t) i = s.v;
    else break;
    return i;
  }
  _path(e, t, i, s, r) {
    let o = "", n = !1;
    return e.forEach((a, d) => {
      const c = d + 1 < e.length ? e[d + 1].m : t.pastEnd;
      if (a.v === null || c < a.m) {
        n = !1;
        return;
      }
      const u = s(a.v);
      r ? o += n ? `V${u.toFixed(1)}H${i(c).toFixed(1)}` : `M${i(a.m).toFixed(1)},${u.toFixed(1)}H${i(c).toFixed(1)}` : (o += `${n ? "L" : "M"}${i(a.m).toFixed(1)},${u.toFixed(1)}`, d + 1 === e.length && (o += `L${i(c).toFixed(1)},${u.toFixed(1)}`)), n = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return h;
    const e = B(this._lang), t = this._model, i = L(this.hass, this.entityId);
    let s;
    return this._failed ? s = l`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((r) => r.v !== null) && !t.applied.some((r) => r.v !== null) && !t.measured.some((r) => r.v !== null) ? s = l`<div class="note">${e.no_data}</div>` : s = this._renderChart(t, i) : s = l`<div class="note">${e.chart_loading}</div>`, l`<div class="box">${s}</div>${t ? this._legend(t) : h}`;
  }
  _legend(e) {
    const t = B(this._lang), i = (s, r) => l`<span class="key"><i class=${s}></i>${r}</span>`;
    return l`<div class="legend">
      ${i("planned", t.planned)}
      ${e.applied.some((s) => s.v !== null) ? i("applied", t.applied) : h}
      ${e.measured.some((s) => s.v !== null) ? i("measured", t.measured) : h}
      ${e.win.length ? i("zone win", t.window_open) : h}
      ${e.heat.length ? i("zone heat", t.heating) : h}
      ${e.over.length ? i("zone over", t.overridden) : h}
    </div>`;
  }
  _renderChart(e, t) {
    const i = B(this._lang), s = this._width, r = rs, o = (g) => w.l + g / e.span * (s - w.l - w.r), n = (g) => w.t + (1 - (g - e.lo) / (e.hi - e.lo)) * (r - w.t - w.b), { startMs: a } = se(this.date, this._tz), d = [0, 1, 2, 3].map((g) => e.lo + (e.hi - e.lo) * g / 3), c = [];
    for (let g = 0; g <= e.span; g += 180) c.push(g);
    const u = (g, I) => g.map(([z, W]) => $t`<rect class="z ${I}" x=${o(z)} y=${w.t} width=${Math.max(1, o(W) - o(z))}
        height=${r - w.t - w.b}></rect>`), _ = this._cursor;
    let $ = h, b = h, S = "";
    if (_ !== null) {
      const g = e.planned.find((T) => _ >= T.s && _ < T.e), I = [];
      I.push([i.planned, `${this._fmt((g == null ? void 0 : g.v) ?? null, e.unit)}${g != null && g.label ? " · " + g.label : ""}`]), _ <= e.pastEnd && (e.applied.some((T) => T.v !== null) && I.push([i.applied, this._fmt(this._valueAt(e.applied, _), e.unit)]), e.measured.some((T) => T.v !== null) && I.push([i.measured, this._fmt(this._valueAt(e.measured, _), e.unit)]));
      const z = [], W = (T) => T.some(([mt, Xt]) => _ >= mt && _ < Xt);
      W(e.win) && z.push(i.window_open), W(e.heat) && z.push(i.heating), W(e.over) && z.push(i.overridden), S = `${this._clock(_)} — ${I.map(([T, mt]) => `${T} ${mt}`).join(", ")}${z.length ? ", " + z.join(", ") : ""}`;
      const ct = Math.min(Math.max(o(_), 70), s - 70);
      b = $t`<line class="cursor" x1=${o(_)} x2=${o(_)} y1=${w.t} y2=${r - w.b}></line>`, $ = l`<div class="tip" style="left:${ct}px">
        <b>${this._clock(_)}</b>
        ${I.map(([T, mt]) => l`<div><span>${T}</span> ${mt}</div>`)}
        ${z.map((T) => l`<div class="flag">${T}</div>`)}
      </div>`;
    }
    const A = e.isToday ? $t`<line class="now" x1=${o(e.pastEnd)} x2=${o(e.pastEnd)} y1=${w.t} y2=${r - w.b}></line>` : h;
    return l`
      <svg width=${s} height=${r} viewBox="0 0 ${s} ${r}" tabindex="0" role="application"
        aria-label=${x(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(g) => g.pointerType === "mouse" || g.buttons ? this._pointer(g) : void 0}
        @pointerleave=${(g) => {
      g.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${d.map((g) => $t`<line class="grid" x1=${w.l} x2=${s - w.r} y1=${n(g)} y2=${n(g)}></line>
          <text class="ylab" x=${w.l - 4} y=${n(g) + 3} text-anchor="end">${Number(g.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${c.map((g) => $t`<text class="xlab" x=${o(g)} y=${r - 6}
          text-anchor=${g === 0 ? "start" : "middle"}>${Math.floor(xt(new Date(a + g * 6e4), this._tz) / 60)}h</text>`)}
        ${u(e.win, "win")}${u(e.heat, "heat")}${u(e.over, "over")}
        ${e.planned.map((g, I) => {
      const z = e.planned[I - 1];
      return g.v === null ? h : $t`
            ${z && z.v !== null ? $t`<line class="riser" x1=${o(g.s)} x2=${o(g.s)} y1=${n(z.v)} y2=${n(g.v)}></line>` : h}
            <line class="plan" x1=${o(g.s)} x2=${o(g.e)} y1=${n(g.v)} y2=${n(g.v)} style="stroke:${g.color}"></line>`;
    })}
        <path class="applied" d=${this._path(e.applied, e, o, n, !0)}></path>
        <path class="measured" d=${this._path(e.measured, e, o, n, !1)}></path>
        ${A}${b}
        <rect class="hit" x=${w.l} y=${w.t} width=${s - w.l - w.r} height=${r - w.t - w.b}></rect>
      </svg>
      ${$}
      <div class="sr" aria-live="polite">${S}</div>`;
  }
};
q.styles = V`
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
Z([
  m({ attribute: !1 })
], q.prototype, "hass", 2);
Z([
  m({ attribute: !1 })
], q.prototype, "data", 2);
Z([
  m({ attribute: !1 })
], q.prototype, "program", 2);
Z([
  m({ attribute: "entity-id" })
], q.prototype, "entityId", 2);
Z([
  m()
], q.prototype, "date", 2);
Z([
  m({ attribute: !1 })
], q.prototype, "slots", 2);
Z([
  y()
], q.prototype, "_width", 2);
Z([
  y()
], q.prototype, "_loaded", 2);
Z([
  y()
], q.prototype, "_failed", 2);
Z([
  y()
], q.prototype, "_cursor", 2);
q = Z([
  R("wp-chart")
], q);
const rs = 160, w = { l: 38, r: 10, t: 10, b: 22 };
var os = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, it = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ns(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && os(t, i, r), r;
};
const si = 7;
let J = class extends O {
  constructor() {
    super(...arguments), this.day = 0, this.showChart = !0, this._offset = null, this._open = !0, this._slots = null, this._loadedDate = "", this._editing = !1, this._token = 0, this._previews = /* @__PURE__ */ new Map(), this._closed = (e) => {
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
    return kt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return mi(this._today, this._offset ?? 0);
  }
  willUpdate(e) {
    this._offset === null && this.hass && (this._offset = (this.day - Mt(this._today) + 7) % 7), this._offset !== null && this.hass && this.program && (e.has("_offset") || e.has("program") || e.has("hass") && !this._loadedDate) && this._loadPreview();
  }
  async _loadPreview() {
    const e = this._date, t = `${this.program.id}|${this.program.revision}|${e}`;
    if (this._previews.has(t)) {
      this._slots = this._previews.get(t) ?? null, this._loadedDate = e;
      return;
    }
    const i = ++this._token;
    try {
      const s = await this.hass.callWS({
        type: "weekly_planner/preview",
        program_id: this.program.id,
        date: e
      });
      if (i !== this._token) return;
      this._previews.set(t, s.slots), this._slots = s.slots;
    } catch {
      if (i !== this._token) return;
      this._slots = null;
    }
    this._loadedDate = e;
  }
  _go(e) {
    const t = (this._offset ?? 0) + e;
    t < -14 || t > si || (this._loadedDate = "", this._slots = null, this._offset = t);
  }
  _edit() {
    this._editing = !0, this.dispatchEvent(new CustomEvent("edit-day", {
      detail: { day: Mt(this._date) },
      bubbles: !0,
      composed: !0
    })), this._open = !1;
  }
  // ---- content ----
  _modeSetpoint(e, t) {
    return e ? e.exceptions[t] ?? e.value : null;
  }
  _setpointText(e) {
    const t = B(this._lang);
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
    const i = B(this._lang), s = Tt(this.program, this.data), r = this.data.modes, o = Mt(e), n = i.override, a = [];
    for (const { slot: c, end: u } of de(s.days[(o + 6) % 7]))
      a.push({ start: 0, end: u, color: ut(c, this.program, r), label: zt(c, this.program, r, n) });
    const d = (c) => i[`reason_${c}`] ?? c;
    for (const c of s.days[o]) {
      const u = t == null ? void 0 : t.find((A) => A.slot_id === c.id);
      let _ = C(c.start), $ = C(c.end ?? null);
      if (t) {
        if (!u) continue;
        _ = this._minutesOf(u.start, e), $ = u.end ? this._minutesOf(u.end, e) : null;
      }
      if (_ === null) continue;
      const b = $ === null ? _ + 10 : $ > _ ? $ : P, S = zt(c, this.program, r, n);
      a.push({
        start: _,
        end: Math.min(P, b),
        color: ut(c, this.program, r),
        label: u != null && u.ignored ? `${S} — ${d(u.ignored)}` : S,
        sun: (u == null ? void 0 : u.sun) ?? ("sun" in c.start || !!(c.end && "sun" in c.end)),
        ignored: (u == null ? void 0 : u.ignored) ?? null
      });
    }
    return a;
  }
  /** Minutes since local midnight of `date`; capped to 1440 when the instant is on a later day. */
  _minutesOf(e, t) {
    return kt(new Date(e), this._tz) > t ? P : xt(e, this._tz);
  }
  _rows(e, t) {
    const i = Tt(this.program, this.data), s = Mt(e), r = [];
    for (const o of i.days[s]) {
      const n = t == null ? void 0 : t.find((c) => c.slot_id === o.id);
      if (t && !n) continue;
      const a = n ? this._minutesOf(n.start, e) : C(o.start) ?? 0, d = (c) => c === null ? "" : `${String(Math.floor(c / 60) % 24).padStart(2, "0")}:${String(c % 60).padStart(2, "0")}`;
      r.push({
        slot: o,
        r: n,
        startM: a,
        start: n ? ae(n.start, this._tz, this._lang) : d(C(o.start)),
        end: n ? n.end ? ae(n.end, this._tz, this._lang) : "" : d(C(o.end ?? null))
      });
    }
    return r.sort((o, n) => o.startM - n.startM);
  }
  _entityTexts(e) {
    const t = this.data.modes;
    return this.program.entities.map((i) => {
      const s = e.actions.by_entity[i.entity_id], r = t.find((n) => n.id === e.actions.by_type[k(i.entity_id)]), o = s ?? this._modeSetpoint(r, i.entity_id);
      return { entityId: i.entity_id, mode: s ? void 0 : r, text: this._setpointText(o) };
    });
  }
  render() {
    if (!this.hass || !this.data || !this.program || this._offset === null) return h;
    const e = B(this._lang), t = this._date, i = Mt(t), [s, r, o] = t.split("-").map(Number), n = new Intl.DateTimeFormat(this._lang, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(s, r - 1, o, 12))), a = this._loadedDate === t, d = a ? this._slots : null, c = this._offset === 0, u = c ? xt(/* @__PURE__ */ new Date(), this._tz) : null, _ = a ? this._rows(t, d) : [];
    return l`
      <wp-dialog wide ?open=${this._open} heading="${e.days[i]} ${n}${c ? " · " + e.today : ""}"
        @closed=${this._closed}>
        <button slot="header-start" class="nav" ?disabled=${this._offset <= -14}
          aria-label=${e.previous_day} @click=${() => this._go(-1)}>◀</button>
        <button slot="header-actions" class="nav" ?disabled=${this._offset >= si}
          aria-label=${e.next_day} @click=${() => this._go(1)}>▶</button>
        <div class="program">${this.program.name}</div>
        <wp-day-bar show-hours .spans=${a ? this._bars(t, d) : []} .now=${u}></wp-day-bar>
        ${a && !_.length ? l`<p class="empty">${e.no_slot_day}</p>` : h}
        <ul class="slots">
          ${_.map(($) => {
      var b, S, A;
      return l`
            <li class=${(b = $.r) != null && b.ignored ? "ignored" : ""}>
              <div class="time">${(S = $.r) != null && S.sun ? "☀️ " : ""}${$.start}${$.end ? ` → ${$.end}` : ""}</div>
              <div class="what">
                ${this._entityTexts($.slot).map((g) => l`
                  <div class="line">
                    <span class="name">${L(this.hass, g.entityId)}</span>
                    ${g.mode ? l`<span class="pill" style="background:${$.slot.color || g.mode.color}">${g.mode.name}</span>` : h}
                    <span class="val">${g.text}</span>
                  </div>`)}
                ${(A = $.r) != null && A.ignored ? l`<div class="why">${e[`reason_${$.r.ignored}`] ?? $.r.ignored}</div>` : h}
              </div>
            </li>`;
    })}
        </ul>
        ${this.showChart && a ? this.program.entities.map(($) => l`
            <section class="chart">
              <h3>${L(this.hass, $.entity_id)}</h3>
              <wp-chart .hass=${this.hass} .data=${this.data} .program=${this.program}
                .entityId=${$.entity_id} .date=${t} .slots=${d}></wp-chart>
            </section>`) : h}
        ${this.data.can_edit ? l`<button slot="footer" class="primary" @click=${this._edit}>✏️ ${e.edit}</button>` : h}
      </wp-dialog>
    `;
  }
};
J.styles = V`
    :host { display: contents; }
    .nav {
      border: none; background: none; color: var(--primary-text-color); font-size: 16px;
      min-width: 40px; height: 40px; border-radius: 20px; cursor: pointer;
    }
    .nav:hover:not([disabled]) { background: var(--secondary-background-color); }
    .nav[disabled] { opacity: 0.3; cursor: default; }
    .program { color: var(--secondary-text-color); margin-bottom: 8px; }
    wp-day-bar { margin: 4px 0 8px; }
    .empty { color: var(--secondary-text-color); text-align: center; }
    ul.slots { list-style: none; margin: 8px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    li { display: flex; gap: 12px; padding: 8px 10px; border-radius: 10px; background: var(--secondary-background-color); }
    li.ignored .time, li.ignored .name, li.ignored .val { text-decoration: line-through; opacity: 0.7; }
    .time { min-width: 96px; font-weight: 500; font-variant-numeric: tabular-nums; }
    .what { flex: 1; min-width: 0; }
    .line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .name { color: var(--secondary-text-color); font-size: 13px; }
    .pill { color: #fff; border-radius: 10px; padding: 1px 8px; font-size: 12px; font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5); }
    .why { font-size: 12px; color: var(--secondary-text-color); font-style: italic; }
    .chart h3 { margin: 16px 0 4px; font-size: 14px; font-weight: 500; }
    button.primary {
      border: none; border-radius: 18px; padding: 8px 18px; min-height: 40px; cursor: pointer;
      background: var(--primary-color); color: var(--text-primary-color, #fff); font-size: 14px;
    }
    @media (max-width: 420px) { .time { min-width: 80px; } }
  `;
it([
  m({ attribute: !1 })
], J.prototype, "hass", 2);
it([
  m({ attribute: !1 })
], J.prototype, "data", 2);
it([
  m({ attribute: !1 })
], J.prototype, "program", 2);
it([
  m({ type: Number })
], J.prototype, "day", 2);
it([
  m({ type: Boolean })
], J.prototype, "showChart", 2);
it([
  y()
], J.prototype, "_offset", 2);
it([
  y()
], J.prototype, "_open", 2);
it([
  y()
], J.prototype, "_slots", 2);
it([
  y()
], J.prototype, "_loadedDate", 2);
J = it([
  R("wp-day-view")
], J);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const as = (e) => (...t) => ({ _$litDirective$: e, values: t });
let ls = class {
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
const ds = {}, cs = (e, t = ds) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ps = as(class extends ls {
  constructor() {
    super(...arguments), this.key = h;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, i]) {
    return t !== this.key && (cs(e), this.key = t), i;
  }
});
var hs = Object.defineProperty, _s = Object.getOwnPropertyDescriptor, D = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? _s(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && hs(t, i, r), r;
};
const ot = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, ht = (e) => e === "input_boolean" ? "switch" : e;
function he(e, t) {
  const i = B(e)[`type_${t}`];
  return typeof i == "string" ? i : t;
}
const us = [
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
], nt = V`
  :host { display: block; color: var(--primary-text-color); font-size: 14px; }
  * { box-sizing: border-box; }
  .field { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; min-width: 0; }
  .field > label, .label { font-size: 12px; color: var(--secondary-text-color); }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .row > .field { flex: 1 1 140px; }
  input[type="text"], input[type="number"], input[type="time"], input[type="date"], input:not([type]),
  select, textarea {
    width: 100%; min-height: 40px; padding: 8px 10px; font: inherit; color: var(--primary-text-color);
    background: var(--card-background-color, #fff); border: 1px solid var(--divider-color);
    border-radius: 8px;
  }
  textarea { min-height: 72px; font-family: monospace; }
  input[type="color"] { width: 56px; height: 40px; padding: 2px; border: 1px solid var(--divider-color);
    border-radius: 8px; background: none; }
  input[type="checkbox"], input[type="radio"] { width: 20px; height: 20px; margin: 0; accent-color: var(--primary-color); }
  label.check { display: flex; align-items: center; gap: 10px; min-height: 40px; cursor: pointer; }
  button { font: inherit; }
  .btn {
    min-height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--divider-color);
    background: none; color: var(--primary-text-color); cursor: pointer;
  }
  .btn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .btn.primary { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
  .btn.danger { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
  .btn:disabled { opacity: 0.45; cursor: default; }
  .ibtn {
    min-width: 40px; min-height: 40px; border-radius: 20px; border: none; background: none;
    color: inherit; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center;
  }
  .ibtn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .ibtn:disabled { opacity: 0.35; cursor: default; }
  :is(button, input, select, textarea, [tabindex]):focus-visible {
    outline: 2px solid var(--primary-color); outline-offset: 2px;
  }
  .error { color: var(--error-color, #db4437); margin: 8px 0; }
  .hint { color: var(--secondary-text-color); font-size: 12px; margin: 4px 0; }
  .card {
    border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 12px; margin: 8px 0;
  }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .grow { flex: 1; min-width: 0; }
`;
function Te(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
function ms(e, t) {
  if (!t) return "";
  const i = t, s = (r) => x(e, `sp_${r}`);
  switch (t.kind) {
    case "preset":
      return `${i.preset}${i.hvac_mode ? ` · ${i.hvac_mode}` : ""}`;
    case "temperature":
      return `${i.temperature} °C${i.hvac_mode ? ` · ${i.hvac_mode}` : ""}`;
    case "hvac_mode":
      return `${s("hvac_mode")} ${i.hvac_mode}`;
    case "position":
      return `${s("position")} ${i.position} %`;
    case "tilt":
      return `${s("tilt")} ${i.tilt} %`;
    case "on": {
      const r = [
        i.brightness !== void 0 ? `${i.brightness} %` : "",
        i.percentage !== void 0 ? `${i.percentage} %` : "",
        i.effect ?? ""
      ].filter(Boolean).join(" · ");
      return r ? `${s("on")} · ${r}` : s("on");
    }
    case "volume":
      return `${s("volume")} ${i.volume} %`;
    case "source":
      return `${i.source}`;
    case "value":
      return `${i.value}`;
    case "option":
      return `${i.option}`;
    case "water_heater":
      return [i.operation_mode, i.temperature !== void 0 && i.temperature !== null ? `${i.temperature} °C` : ""].filter(Boolean).join(" · ");
    case "scene":
      return `${s("scene")} ${i.scene ?? ""}`;
    case "script":
      return `${s("script")} ${i.script ?? ""}`;
    case "action":
      return `${i.action ?? ""}`;
    default:
      return s(t.kind);
  }
}
let rt = class extends O {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(k(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Te(this, "wp-change", e);
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
          ${e.map((t) => l`<option value=${t}>${L(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
rt.styles = [nt, V`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
D([
  m({ attribute: !1 })
], rt.prototype, "hass", 2);
D([
  m()
], rt.prototype, "value", 2);
D([
  m()
], rt.prototype, "label", 2);
D([
  m({ attribute: !1 })
], rt.prototype, "domains", 2);
D([
  m({ attribute: !1 })
], rt.prototype, "exclude", 2);
D([
  m({ attribute: !1 })
], rt.prototype, "filter", 2);
rt = D([
  R("wp-entity-picker")
], rt);
let Vt = class extends O {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e) {
    return x(this._lang, e);
  }
  _set(e) {
    Te(this, "wp-change", e);
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
                @click=${() => this._set(this.conditions.filter((i, s) => s !== t))}>🗑</button>
            </div>
          </div>`
    )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }
};
Vt.styles = nt;
D([
  m({ attribute: !1 })
], Vt.prototype, "hass", 2);
D([
  m({ attribute: !1 })
], Vt.prototype, "conditions", 2);
Vt = D([
  R("wp-conditions-editor")
], Vt);
const fi = {
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
}, fs = ["scene", "script", "action"];
function Bt(e, t) {
  const i = fi[k(t)];
  return Ee(e, t, i ? i[0] : "action");
}
function Ee(e, t, i) {
  var r, o, n, a, d, c;
  const s = ((r = e == null ? void 0 : e.states[t]) == null ? void 0 : r.attributes) ?? {};
  switch (i) {
    case "preset":
      return { kind: i, preset: ((o = s.preset_modes) == null ? void 0 : o[0]) ?? "" };
    case "temperature":
      return { kind: i, temperature: Number(s.temperature ?? s.min_temp ?? 20) };
    case "hvac_mode":
      return { kind: i, hvac_mode: ((n = s.hvac_modes) == null ? void 0 : n.find((u) => u !== "off")) ?? "heat" };
    case "position":
      return { kind: i, position: 50 };
    case "tilt":
      return { kind: i, tilt: 50 };
    case "volume":
      return { kind: i, volume: 30 };
    case "source":
      return { kind: i, source: ((a = s.source_list) == null ? void 0 : a[0]) ?? "" };
    case "value":
      return { kind: i, value: Number(s.min ?? 0) };
    case "option":
      return { kind: i, option: ((d = s.options) == null ? void 0 : d[0]) ?? "" };
    case "water_heater":
      return { kind: i, operation_mode: ((c = s.operation_list) == null ? void 0 : c[0]) ?? "", temperature: Number(s.temperature ?? 50) };
    case "scene":
      return { kind: i, scene: "" };
    case "script":
      return { kind: i, script: "" };
    case "action":
      return { kind: i, action: "", data: {} };
    default:
      return { kind: i };
  }
}
let et = class extends O {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  get _domain() {
    return k(this.entityId);
  }
  get _attrs() {
    var e, t;
    return ((t = (e = this.hass) == null ? void 0 : e.states[this.entityId]) == null ? void 0 : t.attributes) ?? {};
  }
  _kinds() {
    var r;
    const e = fi[this._domain] ?? [], t = !this.stateOnly && this.admin ? fs : [], i = (r = this.value) == null ? void 0 : r.kind, s = [...e, ...t];
    return i && !s.includes(i) && s.push(i), s;
  }
  _current() {
    return this.value ?? Ee(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [i, s] of Object.entries(e))
      i !== "kind" && s !== void 0 && s !== "" && !(typeof s == "number" && Number.isNaN(s)) && (t[i] = s);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), Te(this, "wp-change", t);
  }
  _patch(e) {
    this._emit({ ...this._current(), ...e });
  }
  _number(e, t, i, s, r = 1, o = "") {
    const n = this._current();
    return l`
      <div class="field">
        <label>${this._tr(e)}${o ? ` (${o})` : ""}</label>
        <input type="number" min=${i} max=${s} step=${r} .value=${n[t] === void 0 ? "" : String(n[t])}
          @change=${(a) => {
      const d = a.target.value;
      this._patch({ [t]: d === "" ? void 0 : Math.min(s, Math.max(i, Number(d))) });
    }} />
      </div>`;
  }
  _choice(e, t, i, s = !1, r = !1) {
    const n = this._current()[t] ?? "";
    if (!(i != null && i.length) && !s && r)
      return l`<div class="field"><label>${this._tr(e)}</label>
        <input type="text" .value=${n} @change=${(d) => this._patch({ [t]: d.target.value })} /></div>`;
    const a = i ?? [];
    return l`
      <div class="field">
        <label>${this._tr(e)}</label>
        <select @change=${(d) => this._patch({ [t]: d.target.value || void 0 })}>
          ${s ? l`<option value="" ?selected=${n === ""}>—</option>` : h}
          ${!a.includes(n) && n ? l`<option value=${n} selected>${n}</option>` : h}
          ${a.map((d) => l`<option value=${d} ?selected=${d === n}>${d}</option>`)}
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
        return this._domain === "light" ? l`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", t.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : h;
      case "auto":
        return l`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(i) => i.startsWith("switch.adaptive_lighting")}
              @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ adaptive_switch: i.detail || void 0 });
        }}></wp-entity-picker>
            ${e.adaptive_switch ? l`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : h}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
              @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ script: i.detail || void 0 });
        }}></wp-entity-picker></div>`;
      case "water_heater":
        return l`${this._choice("f_operation_mode", "operation_mode", t.operation_list, !0)}${this._number("f_temperature", "temperature", t.min_temp ?? 20, t.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return l`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ scene: i.detail });
        }}></wp-entity-picker></div>`;
      case "script":
        return l`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
            @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ script: i.detail });
        }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(e);
      default:
        return h;
    }
  }
  _actionFields(e) {
    const t = JSON.stringify(e.data ?? {}, null, 2);
    return this._jsonFor !== this.entityId + t && !this._jsonError && (this._json = t, this._jsonFor = this.entityId + t), l`
      <div class="field"><label>${this._tr("f_action")}</label>
        <input type="text" .value=${e.action ?? ""} placeholder="light.turn_on"
          @change=${(i) => this._patch({ action: i.target.value.trim() })} /></div>
      <div class="field"><label>${this._tr("f_data")}</label>
        <textarea .value=${this._json} spellcheck="false"
          @input=${(i) => {
      const s = i.target.value;
      this._json = s;
      try {
        const r = s.trim() ? JSON.parse(s) : {};
        if (r === null || typeof r != "object" || Array.isArray(r)) throw new Error("object");
        this._jsonError = !1, this._jsonFor = this.entityId + JSON.stringify(r, null, 2), this._patch({ data: r });
      } catch {
        this._jsonError = !0;
      }
    }}></textarea>
        ${this._jsonError ? l`<span class="error">${this._tr("f_json_invalid")}</span>` : h}</div>
      <label class="check"><input type="checkbox" .checked=${e.target_self !== !1}
        @change=${(i) => this._patch({ target_self: i.target.checked ? void 0 : !1 })} />
        ${this._tr("f_target_self")}</label>`;
  }
  render() {
    const e = this._kinds(), t = this._current();
    return l`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(i) => this._emit(Ee(this.hass, this.entityId, i.target.value))}>
          ${e.map((i) => l`<option value=${i} ?selected=${i === t.kind}>${this._tr(`sp_${i}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
et.styles = nt;
D([
  m({ attribute: !1 })
], et.prototype, "hass", 2);
D([
  m({ attribute: "entity-id" })
], et.prototype, "entityId", 2);
D([
  m({ attribute: !1 })
], et.prototype, "value", 2);
D([
  m({ type: Boolean })
], et.prototype, "admin", 2);
D([
  m({ type: Boolean, attribute: "state-only" })
], et.prototype, "stateOnly", 2);
D([
  y()
], et.prototype, "_json", 2);
D([
  y()
], et.prototype, "_jsonError", 2);
et = D([
  R("wp-setpoint-editor")
], et);
var ys = Object.defineProperty, gs = Object.getOwnPropertyDescriptor, st = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? gs(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ys(t, i, r), r;
};
const $s = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, vs = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Jt(e, t) {
  var r;
  if ("time" in t) return tt(t.time);
  const i = (r = e.states["sun.sun"]) == null ? void 0 : r.attributes[$s[t.sun]];
  let s = i ? xt(i, e.config.time_zone) : vs[t.sun];
  return s += t.offset ?? 0, t.earliest && (s = Math.max(s, tt(t.earliest))), t.latest && (s = Math.min(s, tt(t.latest))), Math.max(0, Math.min(P, s));
}
function Pe(e) {
  const t = C(e.start);
  if (t === null || !e.end) return null;
  const i = C(e.end);
  return i === null ? null : i > t ? [t, i] : [t, P];
}
function yi(e) {
  const t = e.map((i) => ({ slot: i, iv: Pe(i) })).filter((i) => i.iv !== null).sort((i, s) => i.iv[0] - s.iv[0]);
  for (let i = 1; i < t.length; i++)
    if (t[i].iv[0] < t[i - 1].iv[1]) return [t[i - 1].slot, t[i].slot];
  return null;
}
function gi(e, t) {
  return [...t].sort((i, s) => Jt(e, i.start) - Jt(e, s.start));
}
function Dt(e, t, i) {
  const s = (r) => {
    if ("time" in r) return r.time;
    const o = r.offset ? ` ${r.offset > 0 ? "+" : "−"}${Math.abs(r.offset)} min` : "";
    return `☀️ ${x(i, `sun_${r.sun}`)}${o} (≈${Q(Jt(e, r))})`;
  };
  return t.end ? `${s(t.start)} → ${s(t.end)}` : `${s(t.start)} · ${x(i, "one_shot")}`;
}
function $i(e, t, i, s, r) {
  const o = ot(e), n = [];
  r > 0 && n.push({ start: 0, end: r, color: "var(--secondary-text-color)", label: x(o, "previous_day"), ignored: "spill" });
  for (const a of s) {
    const d = Jt(e, a.start), c = a.end ? Jt(e, a.end) : null, [[u, _]] = Bi(a, { start: d, end: c }), $ = !("time" in a.start) || !!(a.end && !("time" in a.end));
    n.push({
      start: u,
      end: _,
      sun: $,
      color: ut(a, i, t.modes),
      label: `${zt(a, i, t.modes, x(o, "slot_direct"))} ${Dt(e, a, o)}`
    });
  }
  return n;
}
let K = class extends O {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "";
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), i = (s, r) => t.set(s, [...t.get(s) ?? [], r]);
    for (const s of e) {
      const r = C(s.start);
      r !== null && i(r, { id: s.id, which: "start" });
      const o = C(s.end ?? null);
      r !== null && o !== null && o > r && i(o, { id: s.id, which: "end" });
    }
    return [...t.entries()].map(([s, r]) => ({ key: r.map((o) => o.id + o.which).join("|"), min: s, refs: r }));
  }
  _bounds(e, t, i) {
    let s = 0, r = P;
    for (const a of t) {
      const d = e.find(($) => $.id === a.id);
      if (!d) continue;
      const c = C(d.start) ?? 0, u = d.end ? C(d.end) : null, _ = u !== null && u <= c;
      a.which === "start" ? (u !== null && !_ ? r = Math.min(r, u - F) : r = Math.min(r, P - F), _ && (s = Math.max(s, u))) : _ ? (s = Math.max(s, F), r = Math.min(r, c)) : s = Math.max(s, c + F);
    }
    const o = new Set(t.map((a) => a.id));
    if (!t.every((a) => {
      const d = e.find((c) => c.id === a.id);
      return a.which === "start" && !(d != null && d.end);
    }))
      for (const a of e) {
        if (o.has(a.id)) continue;
        const d = Pe(a);
        d && (d[1] <= i ? s = Math.max(s, d[1]) : d[0] >= i && (r = Math.min(r, d[0])));
      }
    return [s, r];
  }
  _apply(e, t, i) {
    const s = { time: Q(i) };
    return e.map((r) => {
      const o = t.find((n) => n.id === r.id);
      return o ? o.which === "start" ? { ...r, start: s } : { ...r, end: s } : r;
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
    const [s, r] = this._bounds(this.slots, t.refs, t.min);
    this._drag = { refs: t.refs, lo: s, hi: r, min: t.min, moved: !1 }, this._dragSlots = this.slots, e.preventDefault();
  }
  _move(e) {
    const t = this._drag, i = this.renderRoot.querySelector(".track");
    if (!t || !i) return;
    const s = i.getBoundingClientRect(), r = (e.clientX - s.left) / s.width * P, o = Math.max(t.lo, Math.min(t.hi, this._snap(r)));
    o !== t.min && (this._drag = { ...t, min: o, moved: !0 }, this._dragSlots = this._apply(this.slots, t.refs, o));
  }
  _up(e) {
    var r;
    const t = this._drag, i = e.currentTarget;
    (r = i.hasPointerCapture) != null && r.call(i, e.pointerId) && i.releasePointerCapture(e.pointerId);
    const s = this._dragSlots;
    this._drag = void 0, this._dragSlots = void 0, t != null && t.moved && s && this._emitSlots(s);
  }
  _cancel() {
    this._drag = void 0, this._dragSlots = void 0;
  }
  /* ---- keyboard / buttons ---- */
  _nudge(e, t, i) {
    const [s, r] = this._bounds(this.slots, e, t), o = Math.max(s, Math.min(r, this._snap(t + i)));
    o !== t && (this._notice = "", this._emitSlots(this._apply(this.slots, e, o)));
  }
  _onKey(e, t) {
    const i = e.shiftKey ? 60 : F;
    let s = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") s = -i;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") s = i;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, s);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((r) => r.type === Ae(this.program)), t = this._slots.map(Pe).filter((r) => r !== null).sort((r, o) => r[0] - o[0]);
    let i = 480;
    for (const [r, o] of t) i >= r && i < o && (i = o);
    i > P - 60 && (i = P - 60);
    const s = Math.min(P, i + 60);
    return {
      id: Ot(),
      start: { time: Q(i) },
      end: { time: Q(s) },
      conditions: [],
      actions: { by_type: e[0] ? { [Ae(this.program)]: e[0].id } : {}, by_entity: {} }
    };
  }
  _edit(e, t) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: e, isNew: t }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(e, t) {
    const i = e.find((s) => s.id === t);
    return i ? Dt(this.hass, i, this._lang) : "";
  }
  _actionText(e) {
    const t = pe(e, this.program, this.data.modes), i = Object.values(e.actions.by_type).map((r) => {
      var o;
      return (o = this.data.modes.find((n) => n.id === r)) == null ? void 0 : o.name;
    }).filter(Boolean);
    if (i.length) return i.join(" · ");
    const s = Object.keys(e.actions.by_entity).map((r) => L(this.hass, r));
    return (t == null ? void 0 : t.name) ?? (s.length ? s.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, i) {
    if (!i) return l`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in i))
      return l`<span class="time sun">${Dt(this.hass, { ...e, start: i, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const s = tt(i.time), r = [{ id: e.id, which: t }], [o, n] = this._bounds(this._slots, r, s), a = this._tr(t === "start" ? "slot_start" : "slot_end");
    return l`
      <span class="stepper">
        <button class="ibtn" ?disabled=${s - F < o} @click=${() => this._nudge(r, s, -F)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${i.time}</span>
        <button class="ibtn" ?disabled=${s + F > n} @click=${() => this._nudge(r, s, F)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = $i(this.hass, this.data, this.program, e, this.spill), i = this._edges(e), s = (n) => `${n / P * 100}%`, r = this._drag, o = gi(this.hass, e);
    return l`
      <div class="wrap">
        <div class="track">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${i.map((n) => {
      const a = r && n.refs.some((_) => r.refs.some(($) => $.id === _.id && $.which === _.which)), [d, c] = this._bounds(e, n.refs, n.min), u = Q(n.min);
      return l`<button class="handle ${a ? "active" : ""}" style="left:${s(n.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${n.refs.map((_) => `${_.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, _.id)}`).join(" / ")}
                aria-valuemin=${d} aria-valuemax=${c} aria-valuenow=${n.min} aria-valuetext=${u}
                @pointerdown=${(_) => this._down(_, n)}
                @pointermove=${(_) => this._move(_)}
                @pointerup=${(_) => this._up(_)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(_) => this._onKey(_, n)}><span class="grip"></span></button>`;
    })}
            ${r ? l`<div class="loupe" style="left:${s(r.min)}" aria-hidden="true">
                  <span>${Q(r.min)}</span></div>` : h}
          </div>
        </div>
      </div>
      ${this.spill > 0 ? l`<p class="hint">${this._tr("spill_hint", { time: Q(this.spill) })}</p>` : h}
      ${this._notice ? l`<p class="error" role="alert">${this._notice}</p>` : h}
      <div class="list">
        ${o.length === 0 ? l`<p class="muted">${this._tr("no_slots")}</p>` : h}
        ${o.map(
      (n) => {
        var a;
        return l`
            <div class="slot">
              <span class="dot" style="background:${ut(n, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(n, "start", n.start)}
                  ${n.end ? l`<span class="muted">→</span>${this._stepper(n, "end", n.end)}` : l`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(n)}${(a = n.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${n.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${Dt(this.hass, n, this._lang)}`}
                @click=${() => this._edit(n, !1)}>✏️</button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${Dt(this.hass, n, this._lang)}`}
                @click=${() => this._emitSlots(this.slots.filter((d) => d.id !== n.id))}>🗑</button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
    `;
  }
};
K.styles = [
  nt,
  V`
      .wrap { padding: 56px 22px 0; }
      .track { position: relative; }
      .handles { position: absolute; left: 0; right: 0; top: 0; height: 28px; }
      .handle {
        position: absolute; top: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; padding: 0;
        border: none; background: none; cursor: ew-resize; touch-action: none; display: flex;
        align-items: center; justify-content: center;
      }
      .grip {
        width: 8px; height: 36px; border-radius: 4px; background: var(--card-background-color, #fff);
        border: 2px solid var(--primary-text-color); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
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
      .time.sun { font-weight: 500; text-align: left; }
      .action { font-size: 12px; }
    `
];
st([
  m({ attribute: !1 })
], K.prototype, "hass", 2);
st([
  m({ attribute: !1 })
], K.prototype, "data", 2);
st([
  m({ attribute: !1 })
], K.prototype, "program", 2);
st([
  m({ attribute: !1 })
], K.prototype, "slots", 2);
st([
  m({ type: Number })
], K.prototype, "spill", 2);
st([
  m({ type: Number })
], K.prototype, "day", 2);
st([
  y()
], K.prototype, "_drag", 2);
st([
  y()
], K.prototype, "_dragSlots", 2);
st([
  y()
], K.prototype, "_notice", 2);
K = st([
  R("wp-day-editor")
], K);
var bs = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, at = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ws(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && bs(t, i, r), r;
};
const xs = ["dawn", "sunrise", "sunset", "dusk"];
let G = class extends O {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  willUpdate(e) {
    var t, i, s, r;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (i = this._s).actions ?? (i.actions = { by_type: {}, by_entity: {} }), (s = this._s.actions).by_type ?? (s.by_type = {}), (r = this._s.actions).by_entity ?? (r.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(ht(k(t.entity_id)));
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
    const i = !("time" in t), s = this._tr(e === "start" ? "slot_start" : "slot_end");
    return l`
      <fieldset>
        <legend>${s}</legend>
        <div class="field">
          <select aria-label=${`${s} — ${this._tr("time_kind")}`}
            @change=${(r) => {
      const o = r.target.value === "sun";
      this._setSpec(e, o ? { sun: "sunset", offset: 0 } : { time: e === "start" ? "08:00" : "09:00" });
    }}>
            <option value="fixed" ?selected=${!i}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${i}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in t ? this._fixedEditor(e, t.time, s) : l`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(r) => this._setSpec(e, { ...t, sun: r.target.value })}>
                    ${xs.map((r) => l`<option value=${r} ?selected=${t.sun === r}>${this._tr(`sun_${r}`)}</option>`)}
                  </select>
                </div>
                <div class="field">
                  <label>${this._tr("sun_offset")}</label>
                  <input type="number" min="-240" max="240" step="5" .value=${String(t.offset ?? 0)}
                    @change=${(r) => {
      const o = Math.max(-240, Math.min(240, Math.round(Number(r.target.value) || 0)));
      this._setSpec(e, { ...t, offset: o });
    }} />
                </div>
              </div>
              <div class="row">
                ${["earliest", "latest"].map(
      (r) => l`
                    <div class="field">
                      <label>${this._tr(r === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${t[r] ?? ""}
                          @change=${(o) => {
        const n = o.target.value, a = { ...t };
        n ? a[r] = Q(tt(n)) : delete a[r], this._setSpec(e, a);
      }} />
                        ${t[r] ? l`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => {
        const o = { ...t };
        delete o[r], this._setSpec(e, o);
      }}>✕</button>` : h}
                      </div>
                    </div>`
    )}
              </div>`}
      </fieldset>`;
  }
  _fixedEditor(e, t, i) {
    const s = e === "end" && t === "24:00";
    return l`
      ${s ? l`<p class="time-big">24:00</p>` : l`<div class="field"><input type="time" step="300" aria-label=${i} .value=${t}
            @change=${(r) => {
      const o = r.target.value;
      o && this._setSpec(e, { time: Q(tt(o)) });
    }} /></div>`}
      ${e === "end" ? l`<label class="check"><input type="checkbox" .checked=${s}
            @change=${(r) => this._setSpec("end", { time: r.target.checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>` : h}`;
  }
  /* ---- actions ---- */
  _setMode(e, t) {
    const i = { ...this._s.actions.by_type };
    t ? i[e] = t : delete i[e], this._update({ actions: { ...this._s.actions, by_type: i } });
  }
  _setDirect(e, t) {
    const i = { ...this._s.actions.by_entity };
    t ? i[e] = t : delete i[e], this._update({ actions: { ...this._s.actions, by_entity: i } });
  }
  _switchMode(e) {
    this._mode = e, e === "modes" ? this._update({ actions: { ...this._s.actions, by_entity: {} } }) : this._update({ actions: { ...this._s.actions, by_type: {} } });
  }
  _modesEditor() {
    return l`${this._types.map((e) => {
      const t = this.data.modes.filter((s) => s.type === e), i = this._s.actions.by_type[e] ?? "";
      return l`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(e) })}</label>
          <select @change=${(s) => this._setMode(e, s.target.value)}>
            <option value="" ?selected=${i === ""}>—</option>
            ${t.map((s) => l`<option value=${s.id} ?selected=${s.id === i}>${s.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }
  _typeName(e) {
    return he(this._lang, e);
  }
  _directEditor() {
    return l`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return l`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(i) => this._setDirect(
        e.entity_id,
        i.target.checked ? Bt(this.hass, e.entity_id) : null
      )} />
            <strong>${L(this.hass, e.entity_id)}</strong></label>
          ${t ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${t}
                .admin=${!!this.data.is_admin}
                @wp-change=${(i) => {
        i.stopPropagation(), this._setDirect(e.entity_id, i.detail);
      }}></wp-setpoint-editor>` : h}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(e) => this._update({ color: e.target.value })} />
        ${this._s.color ? l`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : h}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var s;
    const e = this._s, t = "time" in e.start ? tt(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === tt(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= P) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const r of Object.values(e.actions.by_entity)) {
      if (r.kind === "scene" && !r.scene) return this._tr("err_incomplete");
      if (r.kind === "script" && !r.script) return this._tr("err_incomplete");
      if (r.kind === "action" && !r.action) return this._tr("err_incomplete");
    }
    if ((s = e.conditions) != null && s.some((r) => !r.entity_id)) return this._tr("err_incomplete");
    const i = yi([...this.others, e]);
    if (i) {
      const r = i.find((o) => o.id !== e.id) ?? i[0];
      return this._tr("err_overlap", { slot: Dt(this.hass, r, this._lang) });
    }
    return "";
  }
  _save() {
    var i, s;
    const e = this._validate();
    if (e) {
      this._error = e;
      return;
    }
    const t = structuredClone(this._s);
    t.color || delete t.color, this.dispatchEvent(new CustomEvent("wp-save", { detail: t, bubbles: !0, composed: !0 })), (s = (i = this.shadowRoot) == null ? void 0 : i.querySelector("wp-dialog")) == null || s.close();
  }
  render() {
    if (!this._s) return h;
    const e = this._s;
    return l`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", e.start)}
        <label class="check"><input type="checkbox" .checked=${!e.end}
          @change=${(t) => {
      if (t.target.checked) this._setSpec("end", null);
      else {
        const s = "time" in e.start ? tt(e.start.time) : 480;
        this._setSpec("end", { time: Q(Math.min(P, s + 60)) });
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

        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        <button slot="footer" class="btn" @click=${() => {
      var t, i;
      return (i = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
G.styles = [
  nt,
  V`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
at([
  m({ attribute: !1 })
], G.prototype, "hass", 2);
at([
  m({ attribute: !1 })
], G.prototype, "data", 2);
at([
  m({ attribute: !1 })
], G.prototype, "program", 2);
at([
  m({ attribute: !1 })
], G.prototype, "entry", 2);
at([
  m({ attribute: !1 })
], G.prototype, "others", 2);
at([
  y()
], G.prototype, "_s", 2);
at([
  y()
], G.prototype, "_mode", 2);
at([
  y()
], G.prototype, "_error", 2);
G = at([
  R("wp-slot-editor")
], G);
var ks = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, N = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ss(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ks(t, i, r), r;
};
const ri = () => [[], [], [], [], [], [], []];
function ke(e) {
  return e.map((t) => ({ ...structuredClone(t), id: Ot() }));
}
let M = class extends O {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  _long(e) {
    return B(this._lang).days[e];
  }
  _short(e) {
    return B(this._lang).days_short[e];
  }
  /* ---- initial state ---- */
  willUpdate(e) {
    if (!(this._ready && !e.has("program")) && !(!this.hass || !this.data)) {
      if (this._ready = !0, this.program)
        this._p = structuredClone(this.program), this._isNew = !1;
      else {
        const t = Ot();
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
          profiles: [{ id: t, name: this._tr("profile_default"), days: ri() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._dayView = this.day, this._tab = this.day !== void 0 ? "week" : "general";
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
  _types() {
    const e = /* @__PURE__ */ new Set();
    this._p.main_type && e.add(this._p.main_type);
    for (const t of this._p.entities) e.add(ht(k(t.entity_id)));
    return [...e];
  }
  _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  /* ---- profile / days ---- */
  _setProfile(e) {
    this._patch({ profiles: this._p.profiles.map((t) => t.id === e.id ? e : t) });
  }
  _setDay(e, t, i = this._profileId) {
    const s = this._p.profiles.find((o) => o.id === i);
    if (!s) return;
    const r = s.days.map((o, n) => n === e ? gi(this.hass, t) : o);
    this._setProfile({ ...s, days: r });
  }
  _spill(e, t) {
    const i = e.days[(t + 6) % 7] ?? [];
    return de(i).reduce((s, r) => Math.max(s, r.end), 0);
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
        id: Ot(),
        name: t,
        days: e.mode === "copy" ? s.days.map(ke) : ri()
      };
      this._patch({ profiles: [...this._p.profiles, r] }), this._profileId = r.id;
    }
    this._profileForm = void 0, this._error = "";
  }
  _deleteProfile() {
    const e = this._profile, t = this._p.profiles.filter((i) => i.id !== e.id);
    this._patch({ profiles: t }), this._profileId = this._activeId(), t.some((i) => i.id === this._profileId) || (this._profileId = t[0].id);
  }
  _applyCopy() {
    const e = this._copy;
    if (!e) return;
    const t = this._profile.days[e.from] ?? [];
    let i = this._p;
    for (const s of e.targets)
      s === e.from && e.profileId === this._profileId || (i = {
        ...i,
        profiles: i.profiles.map((r) => r.id === e.profileId ? { ...r, days: r.days.map((o, n) => n === s ? ke(t) : o) } : r)
      });
    this._p = i, this._copy = void 0;
  }
  _saveSlot(e) {
    const t = this._dayView;
    if (t === void 0) return;
    const i = this._profile.days[t], s = i.some((r) => r.id === e.id);
    this._setDay(t, s ? i.map((r) => r.id === e.id ? e : r) : [...i, e]);
  }
  /* ---- entities ---- */
  _setEntity(e, t) {
    this._patch({ entities: this._p.entities.map((i, s) => s === e ? { ...i, ...t } : i) });
  }
  _addEntity(e) {
    if (!e || this._p.entities.some((o) => o.entity_id === e)) return;
    const t = ht(k(e)), i = this.data.modes.filter((o) => o.type === t), s = i.find((o) => /eco|off|closed/.test(o.id)) ?? i[0], r = s ? { kind: "mode", value: s.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: r, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var o;
    const i = this._p.entities[e], s = ht(k(i.entity_id));
    let r;
    t === "mode" && (r = ((o = this.data.modes.find((n) => n.type === s)) == null ? void 0 : o.id) ?? ""), t === "setpoint" && (r = Bt(this.hass, i.entity_id)), this._setEntity(e, { default: r === void 0 ? { kind: t } : { kind: t, value: r } });
  }
  /* ---- save / delete ---- */
  _validate() {
    const e = this._p;
    if (!e.name.trim()) return this._tr("err_name");
    if (!e.entities.length) return this._tr("err_no_entity");
    if (e.conditions.some((i) => !i.entity_id)) return this._tr("err_incomplete");
    const t = e.profiles.map((i) => i.name.trim());
    if (new Set(t).size !== t.length) return this._tr("err_profile_name");
    for (const i of e.profiles)
      for (let s = 0; s < 7; s++)
        if (yi(i.days[s]))
          return this._tr("err_overlap_day", { profile: i.name, day: this._long(s) });
    return "";
  }
  _payload() {
    const e = structuredClone(this._p), t = new Set(e.entities.map((i) => i.entity_id));
    return e.name = e.name.trim(), e.profiles = e.profiles.map((i) => ({
      ...i,
      days: i.days.map((s) => s.map((r) => {
        const o = Object.fromEntries(Object.entries(r.actions.by_entity).filter(([n]) => t.has(n)));
        return { ...r, actions: { ...r.actions, by_entity: o } };
      }))
    })), this._isNew && delete e.id, e.main_type || (e.main_type = null), e;
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
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = Ot(), t = this._p, i = /* @__PURE__ */ new Map(), s = t.profiles.map((r) => {
      const o = r.id === this._activeId() ? e : Ot();
      return i.set(r.id, o), { ...structuredClone(r), id: o, days: r.days.map(ke) };
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
    const e = this._p, t = this._types();
    return l`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${e.name}
          @input=${(i) => this._patch({ name: i.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${e.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${e.icon}></ha-icon>` : h}
            <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${e.icon ?? ""}
              @input=${(i) => this._patch({ icon: i.target.value.trim() || null })} />
          </div></div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(i) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(i.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${e.enabled}
        @change=${(i) => this._patch({ enabled: i.target.checked })} /> ${this._tr("pe_enabled")}</label>
      <label class="check"><input type="checkbox" .checked=${e.reapply}
        @change=${(i) => this._patch({ reapply: i.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      ${t.length ? l`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(i) => this._patch({ main_type: i.target.value })}>
              ${t.map((i) => l`<option value=${i} ?selected=${i === (e.main_type || t[0])}>${he(this._lang, i)}</option>`)}
            </select></div>` : h}
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions}
        @wp-change=${(i) => {
      i.stopPropagation(), this._patch({ conditions: i.detail });
    }}></wp-conditions-editor>
    `;
  }
  _renderEntities() {
    const e = this._p;
    return l`
      ${e.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : h}
      ${e.entities.map((t, i) => this._renderEntity(t, i))}
      ${ps(this._pickerKey, l`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${us} .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    var a, d;
    const i = ht(k(e.entity_id)), s = ((a = this.hass.states[e.entity_id]) == null ? void 0 : a.attributes) ?? {}, r = Array.isArray(s.preset_modes) && s.preset_modes.includes("permanent"), o = this.data.modes.filter((c) => c.type === i), n = ((d = e.default) == null ? void 0 : d.kind) ?? "none";
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${L(this.hass, e.entity_id)}</strong>
            <div class="muted small">${e.entity_id}${this.hass.states[e.entity_id] ? "" : ` · ${this._tr("pe_unknown_entity")}`}</div></div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${L(this.hass, e.entity_id)}`}
            @click=${() => this._patch({ entities: this._p.entities.filter((c, u) => u !== t) })}>🗑</button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(c) => this._setDefaultKind(t, c.target.value)}>
            <option value="none" ?selected=${n === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${n === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${n === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${n === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${n === "mode" ? l`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(c) => this._setEntity(t, { default: { kind: "mode", value: c.target.value } })}>
              ${o.map((c) => l`<option value=${c.id} ?selected=${c.id === e.default.value}>${c.name}</option>`)}
            </select></div>` : h}
        ${n === "setpoint" ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(c) => {
      c.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: c.detail } });
    }}></wp-setpoint-editor>` : h}
        ${r || e.force_permanent ? l`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
              @change=${(c) => this._setEntity(t, { force_permanent: c.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : h}
      </div>`;
  }
  _renderWeek() {
    const e = this._p, t = this._profile, i = this._activeId(), s = this._profileForm;
    return l`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(r) => {
      this._profileId = r.target.value, this._dayView = void 0;
    }}>
            ${e.profiles.map((r) => l`<option value=${r.id} ?selected=${r.id === t.id}>${r.name}${r.id === i ? " ★" : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}>＋</button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: t.name }}>✏️</button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}>⧉</button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${e.profiles.length < 2 || t.id === i}
          @click=${() => this._confirm = { text: this._tr("confirm_delete", { name: t.name }), yes: () => this._deleteProfile() }}>🗑</button>
      </div>
      ${t.id === i ? l`<p class="hint">★ ${this._tr("profile_active_hint")}</p>` : h}
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
      ${this._dayView === void 0 ? this._renderDays(t) : this._renderDayEditor(t, this._dayView)}
    `;
  }
  _renderDays(e) {
    return l`${e.days.map((t, i) => {
      const s = $i(this.hass, this.data, this._p, t, this._spill(e, i)), r = this._long(i);
      return l`
        <div class="dayrow">
          <button class="dname" @click=${() => this._dayView = i} aria-label=${`${this._tr("edit")} ${r}`}>${this._short(i)}</button>
          <div class="grow bar" @click=${() => this._dayView = i}><wp-day-bar .spans=${s}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${r}`} @click=${() => this._dayView = i}>✏️</button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${r}`} title=${this._tr("copy_day")}
            @click=${() => this._copy = { from: i, targets: [], profileId: e.id }}>⧉</button>
        </div>`;
    })}`;
  }
  _renderDayEditor(e, t) {
    return l`
      <div class="row daynav">
        <button class="btn" @click=${() => this._dayView = void 0}>← ${this._tr("week")}</button>
        <span class="grow"></span>
        <button class="ibtn" aria-label=${this._tr("previous_day")} @click=${() => this._dayView = (t + 6) % 7}>◀</button>
        <strong>${this._long(t)}</strong>
        <button class="ibtn" aria-label=${this._tr("next_day")} @click=${() => this._dayView = (t + 1) % 7}>▶</button>
      </div>
      <wp-day-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .day=${t}
        .slots=${e.days[t]} .spill=${this._spill(e, t)}
        @wp-change=${(i) => {
      i.stopPropagation(), this._setDay(t, i.detail);
    }}
        @edit-slot=${(i) => {
      i.stopPropagation(), this._slotEdit = i.detail;
    }}></wp-day-editor>
    `;
  }
  /* ---- render: dialogs ---- */
  _renderCopy() {
    const e = this._copy;
    if (!e) return h;
    const t = (s) => this._copy = { ...e, targets: s }, i = [0, 1, 2, 3, 4, 5, 6];
    return l`
      <wp-dialog open heading=${`${this._tr("copy_day")} — ${this._long(e.from)}`}
        @closed=${(s) => {
      s.stopPropagation(), this._copy = void 0;
    }}>
        <div class="row">
          <button class="btn" @click=${() => t([0, 1, 2, 3, 4])}>${this._tr("copy_weekdays")}</button>
          <button class="btn" @click=${() => t([5, 6])}>${this._tr("copy_weekend")}</button>
          <button class="btn" @click=${() => t(i)}>${this._tr("copy_all")}</button>
        </div>
        <div class="row" role="group" aria-label=${this._tr("copy_choose")}>
          ${i.map((s) => l`<label class="check"><input type="checkbox" .checked=${e.targets.includes(s)}
            @change=${(r) => t(r.target.checked ? [...e.targets, s] : e.targets.filter((o) => o !== s))} />
            ${this._short(s)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(s) => this._copy = { ...e, profileId: s.target.value }}>
            ${this._p.profiles.map((s) => l`<option value=${s.id} ?selected=${s.id === e.profileId}>${s.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr("copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => this._copy = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }
  _renderConfirm() {
    const e = this._confirm;
    return e ? l`
      <wp-dialog open heading=${this._tr("confirm")} @closed=${(t) => {
      t.stopPropagation(), this._confirm = void 0;
    }}>
        <p>${e.text}</p>
        <button slot="footer" class="btn" @click=${() => this._confirm = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn danger" @click=${() => {
      const t = e.yes;
      this._confirm = void 0, t();
    }}>${this._tr("delete")}</button>
      </wp-dialog>` : h;
  }
  render() {
    if (!this._p) return h;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], t = this._canEdit(), i = this._dayView;
    return l`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? h : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist">
          ${e.map(([s, r]) => l`<button role="tab" aria-selected=${this._tab === s} class="tab ${this._tab === s ? "on" : ""}"
            @click=${() => this._tab = s}>${this._tr(r)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        ${this._isNew ? h : l`<button slot="footer" class="btn danger" style="margin-right:auto"
              @click=${() => this._confirm = { text: this._tr("confirm_delete", { name: this._p.name }), yes: () => void this._delete() }}>${this._tr("delete")}</button>
            <button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
      </wp-dialog>
      ${this._renderCopy()}
      ${this._renderConfirm()}
      ${this._slotEdit && i !== void 0 ? l`<wp-slot-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .entry=${this._slotEdit.slot}
            .others=${this._profile.days[i].filter((s) => s.id !== this._slotEdit.slot.id)}
            @wp-save=${(s) => {
      s.stopPropagation(), this._saveSlot(s.detail);
    }}
            @closed=${(s) => {
      s.stopPropagation(), this._slotEdit = void 0;
    }}></wp-slot-editor>` : h}
    `;
  }
};
M.styles = [
  nt,
  V`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 44px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      .profile-bar { align-items: flex-end; gap: 4px; }
      .dayrow { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
      .dname {
        flex: none; width: 40px; min-height: 40px; border: none; background: none; color: inherit;
        font-weight: 600; text-align: left; cursor: pointer;
      }
      .bar { cursor: pointer; }
      .daynav { margin: 8px 0; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `
];
N([
  m({ attribute: !1 })
], M.prototype, "hass", 2);
N([
  m({ attribute: !1 })
], M.prototype, "data", 2);
N([
  m({ attribute: !1 })
], M.prototype, "program", 2);
N([
  m({ attribute: !1 })
], M.prototype, "defaultTypes", 2);
N([
  m({ type: Number })
], M.prototype, "day", 2);
N([
  y()
], M.prototype, "_p", 2);
N([
  y()
], M.prototype, "_isNew", 2);
N([
  y()
], M.prototype, "_tab", 2);
N([
  y()
], M.prototype, "_profileId", 2);
N([
  y()
], M.prototype, "_dayView", 2);
N([
  y()
], M.prototype, "_slotEdit", 2);
N([
  y()
], M.prototype, "_error", 2);
N([
  y()
], M.prototype, "_saving", 2);
N([
  y()
], M.prototype, "_confirm", 2);
N([
  y()
], M.prototype, "_copy", 2);
N([
  y()
], M.prototype, "_profileForm", 2);
M = N([
  R("wp-program-editor")
], M);
var As = Object.defineProperty, Es = Object.getOwnPropertyDescriptor, U = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Es(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && As(t, i, r), r;
};
const oi = 7 * 24 * 3600 * 1e3;
function Ps(e, t) {
  const i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(e), s = (o) => {
    var n;
    return Number(((n = i.find((a) => a.type === o)) == null ? void 0 : n.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(e.getTime() / 1e3) * 1e3;
}
function Se(e, t, i) {
  const [s, r, o] = e.split("-").map(Number), [n, a] = t.split(":").map(Number), d = Date.UTC(s, r - 1, o, n, a);
  let c = d;
  for (let u = 0; u < 3; u++) c = d - Ps(new Date(c), i);
  return new Date(c);
}
function ni(e, t) {
  const [i, s, r] = e.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, r + t)).toISOString().slice(0, 10);
}
let j = class extends O {
  constructor() {
    super(...arguments), this._sel = [], this._how = "setpoint", this._sp = null, this._modeId = "", this._dur = "next", this._hours = 1, this._minutes = 0, this._untilTime = "18:00", this._untilDate = "", this._error = "", this._busy = !1, this._init = !1;
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  willUpdate() {
    this._init || !this.program || (this._init = !0, this._sel = this.program.entities.map((e) => e.entity_id));
  }
  get _rep() {
    var e;
    return this._sel[0] ?? ((e = this.program.entities[0]) == null ? void 0 : e.entity_id) ?? "";
  }
  get _sameType() {
    return new Set(this._sel.map((e) => ht(k(e)))).size <= 1;
  }
  get _modes() {
    const e = ht(k(this._rep));
    return this.data.modes.filter((t) => t.type === e);
  }
  _toggle(e, t) {
    this._sel = t ? [...this._sel, e] : this._sel.filter((i) => i !== e), this._sp = null, this._modeId = "", this._error = "";
  }
  _timing() {
    if (this._dur === "next") return {};
    if (this._dur === "for") {
      const s = Math.max(0, Math.floor(this._hours || 0)), r = Math.max(0, Math.floor(this._minutes || 0)), o = (s * 60 + r) * 6e4;
      return o <= 0 ? this._tr("ov_err_duration") : o > oi ? this._tr("ov_err_week") : { duration: { hours: s, minutes: r } };
    }
    const e = this.hass.config.time_zone, t = /* @__PURE__ */ new Date();
    let i;
    if (this._untilDate)
      i = Se(this._untilDate, this._untilTime, e);
    else {
      const s = kt(t, e);
      i = Se(s, this._untilTime, e), i <= t && (i = Se(ni(s, 1), this._untilTime, e));
    }
    return i.getTime() <= t.getTime() ? this._tr("ov_err_past") : i.getTime() - t.getTime() > oi ? this._tr("ov_err_week") : { until: i.toISOString() };
  }
  async _apply() {
    var i, s, r;
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
      const o = this._modes.find((n) => n.id === this._modeId);
      if (!o) {
        this._error = this._tr("ov_err_no_setpoint");
        return;
      }
      for (const n of this._sel) {
        const a = ((i = o.exceptions) == null ? void 0 : i[n]) ?? o.value, d = JSON.stringify(a), c = t.get(d) ?? { entity_id: [], setpoint: a };
        c.entity_id.push(n), t.set(d, c);
      }
    } else {
      const o = this._sp ?? Bt(this.hass, this._rep);
      t.set("sp", { entity_id: [...this._sel], setpoint: o });
    }
    this._busy = !0;
    try {
      for (const o of t.values())
        await this.hass.callService("weekly_planner", "override", { ...o, ...e });
      (r = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null || r.close();
    } catch (o) {
      this._error = this._tr("error", { message: (o == null ? void 0 : o.message) ?? String(o) });
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
    const e = this.program.entities.map((i) => {
      var s;
      return { id: i.entity_id, o: (s = this.data.entities[i.entity_id]) == null ? void 0 : s.override };
    }).filter((i) => i.o);
    if (!e.length) return h;
    const t = this.hass.config.time_zone;
    return l`
      <h3>${this._tr("ov_current")}</h3>
      ${e.map(({ id: i, o: s }) => l`
        <div class="card row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${L(this.hass, i)}</strong>
            <div class="muted small">${s.origin === "voluntary" && s.until ? this._tr("overridden_until", { time: ae(s.until, t, this._lang) }) : s.origin === "voluntary" ? this._tr("ov_until_next") : this._tr("overridden")}</div></div>
          <button class="btn" @click=${() => void this._resume(i)}>${this._tr("resume")}</button>
        </div>`)}`;
  }
  render() {
    if (!this.program || !this.data) return h;
    const e = this.data.can_edit && !this.data.read_only, t = this._modes;
    return l`
      <wp-dialog open heading=${`${this._tr("override")} — ${this.program.name}`}>
        ${this._current()}
        <h3>${this._tr("ov_entities")}</h3>
        <div role="group" aria-label=${this._tr("ov_entities")}>
          ${this.program.entities.map((i) => l`
            <label class="check"><input type="checkbox" .checked=${this._sel.includes(i.entity_id)}
              @change=${(s) => this._toggle(i.entity_id, s.target.checked)} />
              ${L(this.hass, i.entity_id)}</label>`)}
        </div>
        ${this._sameType ? h : l`<p class="error">${this._tr("ov_err_mixed")}</p>`}

        <h3>${this._tr("setpoint")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("setpoint")}>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "setpoint"} @change=${() => this._how = "setpoint"} /> ${this._tr("ov_how_setpoint")}</label>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "mode"} ?disabled=${!t.length} @change=${() => this._how = "mode"} /> ${this._tr("ov_how_mode")}</label>
        </div>
        ${this._how === "mode" ? l`<div class="field"><select aria-label=${this._tr("ov_how_mode")} @change=${(i) => this._modeId = i.target.value}>
              <option value="" ?selected=${!this._modeId}>—</option>
              ${t.map((i) => l`<option value=${i.id} ?selected=${i.id === this._modeId}>${i.name}</option>`)}
            </select></div>` : this._rep ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${this._rep} state-only
                .value=${this._sp ?? Bt(this.hass, this._rep)}
                @wp-change=${(i) => {
      i.stopPropagation(), this._sp = i.detail, this._error = "";
    }}></wp-setpoint-editor>` : h}

        <h3>${this._tr("ov_duration")}</h3>
        <div role="radiogroup" aria-label=${this._tr("ov_duration")}>
          <label class="check"><input type="radio" name="dur" .checked=${this._dur === "next"} @change=${() => this._dur = "next"} /> ${this._tr("ov_until_next")}</label>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "for"} @change=${() => this._dur = "for"} /> ${this._tr("ov_for")}</label>
            <input type="number" min="0" max="168" style="width:80px" aria-label=${this._tr("ov_hours")} .value=${String(this._hours)}
              @focus=${() => this._dur = "for"} @input=${(i) => this._hours = Number(i.target.value)} /> h
            <input type="number" min="0" max="59" step="5" style="width:80px" aria-label=${this._tr("ov_minutes")} .value=${String(this._minutes)}
              @focus=${() => this._dur = "for"} @input=${(i) => this._minutes = Number(i.target.value)} /> min
          </div>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "until"} @change=${() => this._dur = "until"} /> ${this._tr("ov_until")}</label>
            <input type="time" step="300" style="width:130px" aria-label=${this._tr("ov_until")} .value=${this._untilTime}
              @focus=${() => this._dur = "until"} @input=${(i) => {
      this._untilTime = i.target.value, this._dur = "until";
    }} />
            <input type="date" style="width:160px" aria-label=${this._tr("ov_date")} .value=${this._untilDate}
              min=${kt(/* @__PURE__ */ new Date(), this.hass.config.time_zone)}
              max=${ni(kt(/* @__PURE__ */ new Date(), this.hass.config.time_zone), 7)}
              @input=${(i) => {
      this._untilDate = i.target.value, this._dur = "until";
    }} />
          </div>
          ${this._dur === "until" ? l`<p class="hint">${this._tr("ov_until_hint")}</p>` : h}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
        <button slot="footer" class="btn" @click=${() => {
      var i, s;
      return (s = (i = this.shadowRoot) == null ? void 0 : i.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e || this._busy} @click=${() => void this._apply()}>${this._tr("ov_apply")}</button>
      </wp-dialog>`;
  }
};
j.styles = [
  nt,
  V`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
    `
];
U([
  m({ attribute: !1 })
], j.prototype, "hass", 2);
U([
  m({ attribute: !1 })
], j.prototype, "data", 2);
U([
  m({ attribute: !1 })
], j.prototype, "program", 2);
U([
  y()
], j.prototype, "_sel", 2);
U([
  y()
], j.prototype, "_how", 2);
U([
  y()
], j.prototype, "_sp", 2);
U([
  y()
], j.prototype, "_modeId", 2);
U([
  y()
], j.prototype, "_dur", 2);
U([
  y()
], j.prototype, "_hours", 2);
U([
  y()
], j.prototype, "_minutes", 2);
U([
  y()
], j.prototype, "_untilTime", 2);
U([
  y()
], j.prototype, "_untilDate", 2);
U([
  y()
], j.prototype, "_error", 2);
U([
  y()
], j.prototype, "_busy", 2);
j = U([
  R("wp-override-dialog")
], j);
var Cs = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, lt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ms(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Cs(t, i, r), r;
};
const Os = ["climate", "cover", "light", "switch"];
let X = class extends O {
  constructor() {
    super(...arguments), this._type = "", this._rep = "", this._error = "", this._confirmId = "", this._saving = !1;
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
  }
  _types() {
    const e = new Set(Os);
    for (const t of this.data.modes) e.add(t.type);
    for (const t of this.data.programs) for (const i of t.entities) e.add(ht(k(i.entity_id)));
    return [...e];
  }
  get _current() {
    return this._type || this._types()[0];
  }
  _users(e) {
    return this.data.programs.filter(
      (t) => t.profiles.some((i) => i.days.some((s) => s.some((r) => Object.values(r.actions.by_type).includes(e)))) || t.entities.some((i) => {
        var s;
        return ((s = i.default) == null ? void 0 : s.kind) === "mode" && i.default.value === e;
      })
    ).length;
  }
  _domains(e) {
    return e === "switch" ? ["switch", "input_boolean"] : [e];
  }
  /** Entities of a type, those used by programs first. */
  _candidates(e) {
    const t = this._domains(e), i = new Set(this.data.programs.flatMap((s) => s.entities.map((r) => r.entity_id)));
    return Object.keys(this.hass.states).filter((s) => t.includes(k(s))).sort((s, r) => Number(i.has(r)) - Number(i.has(s)) || s.localeCompare(r)).slice(0, 300);
  }
  _startEdit(e) {
    const t = this._current;
    this._error = "", this._confirmId = "", e ? (this._edit = structuredClone(e), this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`) : (this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`, this._edit = { type: t, name: "", color: "#2196f3", icon: null, value: Bt(this.hass, this._rep), exceptions: {} });
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
  async _delete(e) {
    this._confirmId = "";
    try {
      await this.hass.callWS({ type: "weekly_planner/mode/delete", mode_id: e }), this._error = "";
    } catch (t) {
      this._error = this._errorText(t);
    }
  }
  /* ---- render ---- */
  _renderList() {
    const e = this._current, t = this.data.modes.filter((s) => s.type === e), i = this.data.can_edit && !this.data.read_only;
    return l`
      <div class="tabs" role="tablist">
        ${this._types().map((s) => l`<button role="tab" aria-selected=${s === e} class="tab ${s === e ? "on" : ""}"
          @click=${() => {
      this._type = s, this._error = "", this._confirmId = "";
    }}>${he(this._lang, s)}</button>`)}
      </div>
      ${t.length === 0 ? l`<p class="muted">${this._tr("no_modes")}</p>` : h}
      ${t.map((s) => {
      const r = this._users(s.id);
      return l`
          <div class="mode">
            <span class="dot" style="background:${s.color}"></span>
            <div class="grow">
              <strong>${s.name}</strong>
              <div class="muted small">${ms(this._lang, s.value)}${Object.keys(s.exceptions ?? {}).length ? ` · ${this._tr("mode_exceptions_n", { n: String(Object.keys(s.exceptions).length) })}` : ""}</div>
              <div class="muted small">${r === 0 ? this._tr("mode_unused") : this._tr(r === 1 ? "mode_used_one" : "mode_used_many", { n: String(r) })}</div>
            </div>
            ${this._confirmId === s.id ? l`<span class="small">${this._tr("confirm_delete", { name: s.name })}</span>
                  <button class="btn danger" @click=${() => void this._delete(s.id)}>${this._tr("delete")}</button>
                  <button class="btn" @click=${() => this._confirmId = ""}>${this._tr("cancel")}</button>` : l`<button class="ibtn" ?disabled=${!i} aria-label=${`${this._tr("edit")} ${s.name}`} @click=${() => this._startEdit(s)}>✏️</button>
                  <button class="ibtn" ?disabled=${!i} aria-label=${`${this._tr("delete")} ${s.name}`} @click=${() => {
        this._confirmId = s.id, this._error = "";
      }}>🗑</button>`}
          </div>`;
    })}
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
      <button class="btn" ?disabled=${!i} @click=${() => this._startEdit()}>+ ${this._tr("mode_new")}</button>
    `;
  }
  _renderForm(e) {
    const t = e.type, i = this._domains(t), s = this._candidates(t), r = this._rep, o = Object.entries(e.exceptions ?? {});
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
      ${s.length ? l`<div class="field"><label>${this._tr("mode_rep_entity")}</label>
            <select @change=${(a) => this._rep = a.target.value}>
              ${s.map((a) => l`<option value=${a} ?selected=${a === r}>${L(this.hass, a)}</option>`)}
            </select></div>` : h}
      <wp-setpoint-editor .hass=${this.hass} entity-id=${r} .value=${e.value} .admin=${!1} state-only
        @wp-change=${(a) => {
      a.stopPropagation(), this._patch({ value: a.detail });
    }}></wp-setpoint-editor>
      <h3>${this._tr("mode_exceptions")}</h3>
      <p class="hint">${this._tr("mode_exceptions_hint")}</p>
      ${o.map(([a, d]) => l`
        <div class="card">
          <div class="row" style="flex-wrap:nowrap">
            <strong class="grow">${L(this.hass, a)}</strong>
            <button class="ibtn" aria-label=${`${this._tr("delete")} ${L(this.hass, a)}`}
              @click=${() => {
      const c = { ...e.exceptions };
      delete c[a], this._patch({ exceptions: c });
    }}>🗑</button>
          </div>
          <wp-setpoint-editor .hass=${this.hass} entity-id=${a} .value=${d} state-only
            @wp-change=${(c) => {
      c.stopPropagation(), this._patch({ exceptions: { ...e.exceptions, [a]: c.detail } });
    }}></wp-setpoint-editor>
        </div>`)}
      <wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("mode_add_exception")} .domains=${i}
        .exclude=${Object.keys(e.exceptions ?? {})}
        @wp-change=${(a) => {
      a.stopPropagation(), a.detail && this._patch({ exceptions: { ...e.exceptions, [a.detail]: structuredClone(e.value) } });
    }}></wp-entity-picker>
      ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : h}
    `;
  }
  render() {
    if (!this.data) return h;
    const e = this._edit;
    return l`
      <wp-dialog open wide heading=${e ? e.id ? this._tr("mode_edit") : this._tr("mode_new") : this._tr("modes")}>
        ${e ? this._renderForm(e) : this._renderList()}
        ${e ? l`<button slot="footer" class="btn" @click=${() => {
      this._edit = void 0, this._error = "";
    }}>${this._tr("cancel")}</button>
              <button slot="footer" class="btn primary" ?disabled=${this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>` : l`<button slot="footer" class="btn" @click=${() => {
      var t, i;
      return (i = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("close")}</button>`}
      </wp-dialog>`;
  }
};
X.styles = [
  nt,
  V`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 44px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      .mode { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); flex-wrap: wrap; }
      .mode .dot { width: 20px; height: 20px; border-radius: 10px; }
    `
];
lt([
  m({ attribute: !1 })
], X.prototype, "hass", 2);
lt([
  m({ attribute: !1 })
], X.prototype, "data", 2);
lt([
  y()
], X.prototype, "_type", 2);
lt([
  y()
], X.prototype, "_edit", 2);
lt([
  y()
], X.prototype, "_rep", 2);
lt([
  y()
], X.prototype, "_error", 2);
lt([
  y()
], X.prototype, "_confirmId", 2);
lt([
  y()
], X.prototype, "_saving", 2);
X = lt([
  R("wp-modes-editor")
], X);
var Ds = Object.defineProperty, Ts = Object.getOwnPropertyDescriptor, dt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ts(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ds(t, i, r), r;
};
let Y = class extends O {
  constructor() {
    super(...arguments), this._dialog = null, this._showWeek = !1, this._preview = {}, this._now = /* @__PURE__ */ new Date();
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = ts(this.hass, (t) => {
      this._data = t, this._error = void 0, this._loadPreviews();
    }));
  }
  get _lang() {
    var e, t, i;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  async _loadPreviews() {
    if (!this._data) return;
    const e = {};
    await Promise.all(
      Ye(this._data, this._config).map(async (t) => {
        try {
          const i = await this.hass.callWS({
            type: "weekly_planner/preview",
            program_id: t.id
          });
          e[t.id] = i.slots;
        } catch {
        }
      })
    ), this._preview = e;
  }
  /** Spans of a program for a weekday (0 = Monday); today uses resolved sun times. */
  _spans(e, t, i) {
    const s = this._data, r = Tt(e, s), o = (d) => zt(d, e, s.modes, x(this._lang, "override")), n = [];
    for (const { slot: d, end: c } of de(r.days[(t + 6) % 7]))
      n.push({ start: 0, end: c, color: ut(d, e, s.modes), label: o(d) });
    const a = i ? this._preview[e.id] : void 0;
    for (const d of r.days[t]) {
      const c = a == null ? void 0 : a.find((b) => b.slot_id === d.id);
      let u = C(d.start), _ = C(d.end ?? null);
      if (c && (u = xt(c.start, this._tz), _ = c.end ? xt(c.end, this._tz) : null), u === null) continue;
      const $ = _ === null ? u + 10 : _ > u ? _ : P;
      n.push({
        start: u,
        end: $,
        color: ut(d, e, s.modes),
        label: o(d),
        sun: "sun" in d.start || !!(d.end && "sun" in d.end),
        ignored: (c == null ? void 0 : c.ignored) ?? null
      });
    }
    return n;
  }
  _summary(e) {
    const t = this._data, i = t.status[e.id], s = Tt(e, t), r = i ? Object.values(i.current_slots)[0] : void 0, o = r ? s.days.flat().find((d) => d.id === r) : void 0, n = o ? pe(o, e, t.modes) : void 0, a = e.entities.filter((d) => {
      var c;
      return (c = t.entities[d.entity_id]) == null ? void 0 : c.override;
    });
    return { status: i, slot: o, mode: n, overridden: a };
  }
  async _toggle(e, t) {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: e.id, enabled: t });
    } catch (i) {
      this._error = (i == null ? void 0 : i.message) ?? String(i);
    }
  }
  async _resume(e) {
    await this.hass.callService("weekly_planner", "resume", { program_id: e.id });
  }
  render() {
    if (!this._config || !this.hass) return h;
    const e = this._lang, t = B(e), i = this._data, s = i ? Ye(i, this._config) : [], r = ui(this._now, this._tz), o = xt(this._now, this._tz);
    return l`
      <ha-card>
        <div class="head">
          <h1>${this._config.title ?? t.title}</h1>
          ${i != null && i.vacation ? l`<span class="chip warn">🧳 ${t.vacation}</span>` : h}
          ${i != null && i.can_edit && !this._config.program ? l`<button class="ghost" @click=${() => this._dialog = { kind: "modes" }}>${t.modes}</button>
                <button class="ghost" @click=${() => this._dialog = { kind: "program" }}>＋ ${t.new_program}</button>` : h}
        </div>
        ${this._error ? l`<div class="error">${x(e, "error", { message: this._error })}</div>` : h}
        ${i != null && i.read_only ? l`<div class="error">${t.read_only}</div>` : h}
        ${i ? h : l`<div class="empty">…</div>`}
        ${i && !s.length ? l`<div class="empty">${t.no_program}</div>` : h}
        ${s.map((n) => this._renderProgram(n, r, o))}
        ${s.length && !this._config.program ? l`<button class="link" @click=${() => this._showWeek = !this._showWeek}>
              ${this._showWeek ? t.hide_week : t.show_week}</button>` : h}
      </ha-card>
      ${this._renderDialog()}
    `;
  }
  _renderProgram(e, t, i) {
    const s = this._lang, r = B(s), o = this._data, { status: n, mode: a, overridden: d } = this._summary(e), c = n != null && n.next_change ? Ji(n.next_change, this._tz, s, this._now) : null, u = this._defaultMode(e), _ = this._showWeek || !!this._config.program, $ = Tt(e, o);
    return l`
      <section class="program ${e.enabled ? "" : "off"}">
        <div class="row">
          <div class="name">
            <span class="title">${e.name}</span>
            ${e.profiles.length > 1 ? l`<span class="chip">${$.name}</span>` : h}
          </div>
          <label class="switch" title=${e.enabled ? "On" : "Off"}>
            <input type="checkbox" .checked=${e.enabled}
              @change=${(b) => this._toggle(e, b.target.checked)} />
            <span></span>
          </label>
        </div>
        <div class="state">
          ${a ? l`<span class="pill" style="--c:${a.color}">${a.name}</span>` : u && e.enabled && !o.vacation ? l`<span class="pill" style="--c:${u.color}">${u.name}</span>` : l`<span class="pill neutral">${e.enabled ? r.off_slot : "—"}</span>`}
          <span class="muted">${c ? x(s, "until", { time: c }) : r.no_change}</span>
          ${n != null && n.skip_next ? l`<span class="chip">${r.skip_planned}</span>` : h}
        </div>
        ${d.length ? l`<div class="warn-row">⚠️ ${d.length > 1 ? `${d.length} × ` : ""}${this._overrideText(d[0].entity_id)}
              <button class="small" @click=${() => this._resume(e)}>${r.resume}</button></div>` : h}
        <wp-day-bar .spans=${this._spans(e, t, !0)} .now=${i} show-hours
          @click=${() => this._dialog = { kind: "day", program: e, day: t }}></wp-day-bar>
        ${_ ? l`<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(
      (b) => l`<button class="day" @click=${() => this._dialog = { kind: "day", program: e, day: b }}>
                <span class=${b === t ? "today" : ""}>${r.days_short[b]}</span>
                <wp-day-bar thin .spans=${this._spans(e, b, b === t)}
                  .now=${b === t ? i : null}></wp-day-bar></button>`
    )}</div>` : h}
        <div class="actions">
          <button class="small" @click=${() => this._dialog = { kind: "override", program: e }}>${r.override}</button>
          ${o.can_edit ? l`<button class="small ghost" @click=${() => this._dialog = { kind: "program", program: e }}>✏️ ${r.edit}</button>` : h}
        </div>
      </section>
    `;
  }
  /** Mode applied outside slots (default of the first entity), to show instead of "outside slots". */
  _defaultMode(e) {
    var i;
    const t = (i = e.entities[0]) == null ? void 0 : i.default;
    if (!((t == null ? void 0 : t.kind) !== "mode" || typeof t.value != "string"))
      return this._data.modes.find((s) => s.id === t.value);
  }
  _overrideText(e) {
    var i;
    const t = (i = this._data.entities[e]) == null ? void 0 : i.override;
    return (t == null ? void 0 : t.origin) === "voluntary" && t.until ? x(this._lang, "overridden_until", { time: ae(t.until, this._tz, this._lang) }) : x(this._lang, "overridden");
  }
  _renderDialog() {
    var i;
    const e = this._dialog;
    if (!e || !this._data) return h;
    const t = () => this._dialog = null;
    switch (e.kind) {
      case "day":
        return l`<wp-day-view .hass=${this.hass} .data=${this._data} .program=${e.program} .day=${e.day}
          .showChart=${this._config.show_chart !== !1}
          @closed=${t}
          @edit-day=${(s) => this._dialog = { kind: "program", program: e.program, ...s.detail }}></wp-day-view>`;
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((i = this._config.filter) == null ? void 0 : i.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "override":
        return l`<wp-override-dialog .hass=${this.hass} .data=${this._data} .program=${e.program}
          @closed=${t}></wp-override-dialog>`;
      case "modes":
        return l`<wp-modes-editor .hass=${this.hass} .data=${this._data} @closed=${t}></wp-modes-editor>`;
    }
  }
};
Y.styles = V`
    ha-card { padding: 16px; }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    h1 { flex: 1; margin: 0; font-size: 20px; font-weight: 500; }
    .program { padding: 12px 0; border-top: 1px solid var(--divider-color); }
    .program:first-of-type { border-top: none; }
    .program.off { opacity: 0.55; }
    .row { display: flex; align-items: center; gap: 8px; }
    .name { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
    .title { font-size: 16px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .state { display: flex; align-items: center; gap: 8px; margin: 6px 0 10px; flex-wrap: wrap; }
    .pill {
      background: var(--c); color: #fff; border-radius: 12px; padding: 2px 10px; font-size: 13px;
      font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }
    .pill.neutral { background: var(--secondary-background-color); color: var(--primary-text-color); text-shadow: none; }
    .muted { color: var(--secondary-text-color); font-size: 13px; }
    .chip {
      font-size: 12px; padding: 1px 8px; border-radius: 10px; background: var(--secondary-background-color);
    }
    .chip.warn { background: var(--warning-color, #ff9800); color: #fff; }
    .warn-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 8px; }
    wp-day-bar { cursor: pointer; }
    .week { display: grid; gap: 4px; margin-top: 8px; }
    .day {
      display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 8px;
      background: none; border: none; padding: 2px 0; cursor: pointer; color: inherit; font: inherit;
    }
    .day span { font-size: 12px; color: var(--secondary-text-color); text-align: left; }
    .day span.today { color: var(--primary-color); font-weight: 600; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    button.small, button.ghost {
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
      border-radius: 16px; padding: 4px 12px; font: inherit; font-size: 13px; cursor: pointer; min-height: 32px;
    }
    button.ghost { border-color: transparent; color: var(--primary-color); }
    button.link {
      border: none; background: none; color: var(--primary-color); cursor: pointer; padding: 8px 0 0; font: inherit;
    }
    .empty { color: var(--secondary-text-color); padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 13px; margin-bottom: 8px; }
    .switch { position: relative; width: 40px; height: 22px; flex: none; }
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
dt([
  m({ attribute: !1 })
], Y.prototype, "hass", 2);
dt([
  y()
], Y.prototype, "_config", 2);
dt([
  y()
], Y.prototype, "_data", 2);
dt([
  y()
], Y.prototype, "_error", 2);
dt([
  y()
], Y.prototype, "_dialog", 2);
dt([
  y()
], Y.prototype, "_showWeek", 2);
dt([
  y()
], Y.prototype, "_preview", 2);
dt([
  y()
], Y.prototype, "_now", 2);
Y = dt([
  R("weekly-planner-card")
], Y);
var js = Object.defineProperty, Ns = Object.getOwnPropertyDescriptor, _e = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ns(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && js(t, i, r), r;
};
const Is = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let Ut = class extends O {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return ot(this.hass);
  }
  _tr(e, t) {
    return x(this._lang, e, t);
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
              ${Is.map((r) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(r)}
                @change=${(o) => this._setFilter({ types: o.target.checked ? [...t, r] : t.filter((n) => n !== r) })} />
                ${he(this._lang, r)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((s = e.filter) == null ? void 0 : s.area) ?? ""} placeholder="bureau"
                @input=${(r) => this._setFilter({ area: r.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${!!e.show_week}
        @change=${(r) => this._set("show_week", r.target.checked)} /> ${this._tr("ce_show_week")}</label>
      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(r) => this._set("show_chart", r.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
Ut.styles = [nt, V`:host { display: block; padding: 4px 0; }`];
_e([
  m({ attribute: !1 })
], Ut.prototype, "hass", 2);
_e([
  y()
], Ut.prototype, "_config", 2);
_e([
  y()
], Ut.prototype, "_programs", 2);
Ut = _e([
  R("weekly-planner-card-editor")
], Ut);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
