/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, Oe = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, De = Symbol(), He = /* @__PURE__ */ new WeakMap();
let pi = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== De) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Oe && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = He.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && He.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ei = (e) => new pi(typeof e == "string" ? e : e + "", void 0, De), V = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, n, o) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[o + 1], e[0]);
  return new pi(i, e, De);
}, Pi = (e, t) => {
  if (Oe) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), n = se.litNonce;
    n !== void 0 && s.setAttribute("nonce", n), s.textContent = i.cssText, e.appendChild(s);
  }
}, Le = Oe ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return Ei(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ci, defineProperty: Mi, getOwnPropertyDescriptor: Oi, getOwnPropertyNames: Di, getOwnPropertySymbols: Ti, getPrototypeOf: ji } = Object, ut = globalThis, Ve = ut.trustedTypes, zi = Ve ? Ve.emptyScript : "", ve = ut.reactiveElementPolyfillSupport, Wt = (e, t) => e, ne = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? zi : null;
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
} }, Te = (e, t) => !Ci(e, t), qe = { attribute: !0, type: String, converter: ne, reflect: !1, useDefault: !1, hasChanged: Te };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ut.litPropertyMetadata ?? (ut.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ct = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = qe) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), n = this.getPropertyDescriptor(t, s, i);
      n !== void 0 && Mi(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: n, set: o } = Oi(this.prototype, t) ?? { get() {
      return this[i];
    }, set(r) {
      this[i] = r;
    } };
    return { get: n, set(r) {
      const l = n == null ? void 0 : n.call(this);
      o == null || o.call(this, r), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? qe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Wt("elementProperties"))) return;
    const t = ji(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Wt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Wt("properties"))) {
      const i = this.properties, s = [...Di(i), ...Ti(i)];
      for (const n of s) this.createProperty(n, i[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [s, n] of i) this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const n = this._$Eu(i, s);
      n !== void 0 && this._$Eh.set(n, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const n of s) i.unshift(Le(n));
    } else t !== void 0 && i.push(Le(t));
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
    return Pi(t, this.constructor.elementStyles), t;
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
    const s = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, s);
    if (n !== void 0 && s.reflect === !0) {
      const r = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : ne).toAttribute(i, s.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, i) {
    var o, r;
    const s = this.constructor, n = s._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const l = s.getPropertyOptions(n), c = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((o = l.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? l.converter : ne;
      this._$Em = n;
      const d = c.fromAttribute(i, l.type);
      this[n] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(n)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, n = !1, o) {
    var r;
    if (t !== void 0) {
      const l = this.constructor;
      if (n === !1 && (o = this[t]), s ?? (s = l.getPropertyOptions(t)), !((s.hasChanged ?? Te)(o, i) || s.useDefault && s.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(l._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: n, wrapped: o }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? i ?? this[t]), o !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), n === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [o, r] of n) {
        const { wrapped: l } = r, c = this[o];
        l !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, r, c);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), (s = this._$EO) == null || s.forEach((n) => {
        var o;
        return (o = n.hostUpdate) == null ? void 0 : o.call(n);
      }), this.update(i)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var i;
    (i = this._$EO) == null || i.forEach((s) => {
      var n;
      return (n = s.hostUpdated) == null ? void 0 : n.call(s);
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
Ct.elementStyles = [], Ct.shadowRootOptions = { mode: "open" }, Ct[Wt("elementProperties")] = /* @__PURE__ */ new Map(), Ct[Wt("finalized")] = /* @__PURE__ */ new Map(), ve == null || ve({ ReactiveElement: Ct }), (ut.reactiveElementVersions ?? (ut.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ft = globalThis, Be = (e) => e, oe = Ft.trustedTypes, Je = oe ? oe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, hi = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, _i = "?" + _t, Ni = `<${_i}>`, kt = document, Rt = () => kt.createComment(""), Ht = (e) => e === null || typeof e != "object" && typeof e != "function", je = Array.isArray, Ii = (e) => je(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", $e = `[ 	
\f\r]`, Ut = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ke = /-->/g, Ge = />/g, gt = RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Xe = /'/g, Ye = /"/g, ui = /^(?:script|style|textarea|title)$/i, mi = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), a = mi(1), vt = mi(2), jt = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Ze = /* @__PURE__ */ new WeakMap(), bt = kt.createTreeWalker(kt, 129);
function fi(e, t) {
  if (!je(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Je !== void 0 ? Je.createHTML(t) : t;
}
const Ui = (e, t) => {
  const i = e.length - 1, s = [];
  let n, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = Ut;
  for (let l = 0; l < i; l++) {
    const c = e[l];
    let d, u, _ = -1, v = 0;
    for (; v < c.length && (r.lastIndex = v, u = r.exec(c), u !== null); ) v = r.lastIndex, r === Ut ? u[1] === "!--" ? r = Ke : u[1] !== void 0 ? r = Ge : u[2] !== void 0 ? (ui.test(u[2]) && (n = RegExp("</" + u[2], "g")), r = gt) : u[3] !== void 0 && (r = gt) : r === gt ? u[0] === ">" ? (r = n ?? Ut, _ = -1) : u[1] === void 0 ? _ = -2 : (_ = r.lastIndex - u[2].length, d = u[1], r = u[3] === void 0 ? gt : u[3] === '"' ? Ye : Xe) : r === Ye || r === Xe ? r = gt : r === Ke || r === Ge ? r = Ut : (r = gt, n = void 0);
    const b = r === gt && e[l + 1].startsWith("/>") ? " " : "";
    o += r === Ut ? c + Ni : _ >= 0 ? (s.push(d), c.slice(0, _) + hi + c.slice(_) + _t + b) : c + _t + (_ === -2 ? l : b);
  }
  return [fi(e, o + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Lt {
  constructor({ strings: t, _$litType$: i }, s) {
    let n;
    this.parts = [];
    let o = 0, r = 0;
    const l = t.length - 1, c = this.parts, [d, u] = Ui(t, i);
    if (this.el = Lt.createElement(d, s), bt.currentNode = this.el.content, i === 2 || i === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (n = bt.nextNode()) !== null && c.length < l; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const _ of n.getAttributeNames()) if (_.endsWith(hi)) {
          const v = u[r++], b = n.getAttribute(_).split(_t), w = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: o, name: w[2], strings: b, ctor: w[1] === "." ? Fi : w[1] === "?" ? Ri : w[1] === "@" ? Hi : ae }), n.removeAttribute(_);
        } else _.startsWith(_t) && (c.push({ type: 6, index: o }), n.removeAttribute(_));
        if (ui.test(n.tagName)) {
          const _ = n.textContent.split(_t), v = _.length - 1;
          if (v > 0) {
            n.textContent = oe ? oe.emptyScript : "";
            for (let b = 0; b < v; b++) n.append(_[b], Rt()), bt.nextNode(), c.push({ type: 2, index: ++o });
            n.append(_[v], Rt());
          }
        }
      } else if (n.nodeType === 8) if (n.data === _i) c.push({ type: 2, index: o });
      else {
        let _ = -1;
        for (; (_ = n.data.indexOf(_t, _ + 1)) !== -1; ) c.push({ type: 7, index: o }), _ += _t.length - 1;
      }
      o++;
    }
  }
  static createElement(t, i) {
    const s = kt.createElement("template");
    return s.innerHTML = t, s;
  }
}
function zt(e, t, i = e, s) {
  var r, l;
  if (t === jt) return t;
  let n = s !== void 0 ? (r = i._$Co) == null ? void 0 : r[s] : i._$Cl;
  const o = Ht(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== o && ((l = n == null ? void 0 : n._$AO) == null || l.call(n, !1), o === void 0 ? n = void 0 : (n = new o(e), n._$AT(e, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = n : i._$Cl = n), n !== void 0 && (t = zt(e, n._$AS(e, t.values), n, s)), t;
}
class Wi {
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
    const { el: { content: i }, parts: s } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? kt).importNode(i, !0);
    bt.currentNode = n;
    let o = bt.nextNode(), r = 0, l = 0, c = s[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let d;
        c.type === 2 ? d = new Jt(o, o.nextSibling, this, t) : c.type === 1 ? d = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (d = new Li(o, this, t)), this._$AV.push(d), c = s[++l];
      }
      r !== (c == null ? void 0 : c.index) && (o = bt.nextNode(), r++);
    }
    return bt.currentNode = kt, n;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class Jt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, i, s, n) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    t = zt(this, t, i), Ht(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== jt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ii(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && Ht(this._$AH) ? this._$AA.nextSibling.data = t : this.T(kt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var o;
    const { values: i, _$litType$: s } = t, n = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Lt.createElement(fi(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === n) this._$AH.p(i);
    else {
      const r = new Wi(n, this), l = r.u(this.options);
      r.p(i), this.T(l), this._$AH = r;
    }
  }
  _$AC(t) {
    let i = Ze.get(t.strings);
    return i === void 0 && Ze.set(t.strings, i = new Lt(t)), i;
  }
  k(t) {
    je(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, n = 0;
    for (const o of t) n === i.length ? i.push(s = new Jt(this.O(Rt()), this.O(Rt()), this, this.options)) : s = i[n], s._$AI(o), n++;
    n < i.length && (this._$AR(s && s._$AB.nextSibling, n), i.length = n);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i); t !== this._$AB; ) {
      const n = Be(t).nextSibling;
      Be(t).remove(), t = n;
    }
  }
  setConnected(t) {
    var i;
    this._$AM === void 0 && (this._$Cv = t, (i = this._$AP) == null || i.call(this, t));
  }
}
class ae {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, n, o) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = i, this._$AM = n, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(t, i = this, s, n) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) t = zt(this, t, i, 0), r = !Ht(t) || t !== this._$AH && t !== jt, r && (this._$AH = t);
    else {
      const l = t;
      let c, d;
      for (t = o[0], c = 0; c < o.length - 1; c++) d = zt(this, l[s + c], i, c), d === jt && (d = this._$AH[c]), r || (r = !Ht(d) || d !== this._$AH[c]), d === p ? t = p : t !== p && (t += (d ?? "") + o[c + 1]), this._$AH[c] = d;
    }
    r && !n && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Fi extends ae {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class Ri extends ae {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Hi extends ae {
  constructor(t, i, s, n, o) {
    super(t, i, s, n, o), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = zt(this, t, i, 0) ?? p) === jt) return;
    const s = this._$AH, n = t === p && s !== p || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== p && (s === p || n);
    n && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Li {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    zt(this, t);
  }
}
const be = Ft.litHtmlPolyfillSupport;
be == null || be(Lt, Jt), (Ft.litHtmlVersions ?? (Ft.litHtmlVersions = [])).push("3.3.3");
const Vi = (e, t, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? t;
  let n = s._$litPart$;
  if (n === void 0) {
    const o = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = n = new Jt(t.insertBefore(Rt(), o), o, void 0, i ?? {});
  }
  return n._$AI(e), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = globalThis;
let D = class extends Ct {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Vi(i, this.renderRoot, this.renderOptions);
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
var di;
D._$litElement$ = !0, D.finalized = !0, (di = wt.litElementHydrateSupport) == null || di.call(wt, { LitElement: D });
const we = wt.litElementPolyfillSupport;
we == null || we({ LitElement: D });
(wt.litElementVersions ?? (wt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const W = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qi = { attribute: !0, type: String, converter: ne, reflect: !1, hasChanged: Te }, Bi = (e = qi, t, i) => {
  const { kind: s, metadata: n } = i;
  let o = globalThis.litPropertyMetadata.get(n);
  if (o === void 0 && globalThis.litPropertyMetadata.set(n, o = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), o.set(i.name, e), s === "accessor") {
    const { name: r } = i;
    return { set(l) {
      const c = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(r, c, e, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, e, l), l;
    } };
  }
  if (s === "setter") {
    const { name: r } = i;
    return function(l) {
      const c = this[r];
      t.call(this, l), this.requestUpdate(r, c, e, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function f(e) {
  return (t, i) => typeof i == "object" ? Bi(e, t, i) : ((s, n, o) => {
    const r = n.hasOwnProperty(o);
    return n.constructor.createProperty(o, s), r ? Object.getOwnPropertyDescriptor(n, o) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function g(e) {
  return f({ ...e, state: !0, attribute: !1 });
}
const U = 5, C = 1440;
function Q(e) {
  const [t, i] = e.split(":").map(Number);
  return t * 60 + i;
}
function Z(e) {
  const t = Math.max(0, Math.min(C, Math.round(e / U) * U));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function xt(e, t) {
  var r, l;
  const i = typeof e == "string" ? new Date(e) : e, s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(i), n = Number(((r = s.find((c) => c.type === "hour")) == null ? void 0 : r.value) ?? 0), o = Number(((l = s.find((c) => c.type === "minute")) == null ? void 0 : l.value) ?? 0);
  return n * 60 + o;
}
function Ae(e, t) {
  const i = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(i);
}
function mt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function Ee(e, t, i) {
  return new Intl.DateTimeFormat(i, { timeZone: t, hour: "2-digit", minute: "2-digit" }).format(
    new Date(e)
  );
}
function M(e) {
  return !e || !("time" in e) ? null : Q(e.time);
}
function Ji(e, t) {
  const i = (t == null ? void 0 : t.start) ?? M(e.start) ?? 0, s = t ? t.end : M(e.end ?? null);
  return s == null ? [[i, Math.min(C, i + U)]] : s > i ? [[i, s]] : [[i, C]];
}
function le(e) {
  const t = [];
  for (const i of e) {
    const s = M(i.start), n = M(i.end ?? null);
    s !== null && n !== null && n <= s && n < 720 && t.push({ slot: i, end: n });
  }
  return t;
}
function Qe(e, t, i, s = /* @__PURE__ */ new Date()) {
  const n = new Date(e), o = mt(n, t) === mt(s, t), r = { timeZone: t, hour: "2-digit", minute: "2-digit" };
  return o || (r.weekday = "short"), new Intl.DateTimeFormat(i, r).format(n);
}
var Ki = Object.defineProperty, Gi = Object.getOwnPropertyDescriptor, Kt = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Gi(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Ki(t, i, n), n;
};
let St = class extends D {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1;
  }
  render() {
    const e = (t) => `${t / C * 100}%`;
    return a`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.spans.map(
      (t) => a`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${!this.thin && t.end - t.start >= 90 ? a`<span>${t.sun ? a`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : p}${t.label}</span>` : p}</div>`
    )}
        ${this.now !== null ? a`<div class="now" style="left:${e(this.now)}"></div>` : p}
      </div>
      ${this.showHours ? a`<div class="hours">${[0, 6, 12, 18, 24].map((t) => a`<span style="left:${e(t * 60)}">${t}h</span>`)}</div>` : p}
    `;
  }
};
St.styles = V`
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
Kt([
  f({ attribute: !1 })
], St.prototype, "spans", 2);
Kt([
  f({ type: Number })
], St.prototype, "now", 2);
Kt([
  f({ type: Boolean })
], St.prototype, "thin", 2);
Kt([
  f({ type: Boolean, attribute: "show-hours" })
], St.prototype, "showHours", 2);
St = Kt([
  W("wp-day-bar")
], St);
var Xi = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, ce = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Yi(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Xi(t, i, n), n;
};
let Nt = class extends D {
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
    var e;
    return this.open ? a`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${(e = document.documentElement.lang) != null && e.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : a``;
  }
};
Nt.styles = V`
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
      border: none; background: none; color: inherit; --mdc-icon-size: 24px; width: 48px; height: 48px;
      display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    button.icon:hover { background: var(--secondary-background-color); }
    @media (max-width: 600px) {
      .panel, .panel.wide {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
ce([
  f()
], Nt.prototype, "heading", 2);
ce([
  f({ type: Boolean, reflect: !0 })
], Nt.prototype, "open", 2);
ce([
  f({ type: Boolean })
], Nt.prototype, "wide", 2);
Nt = ce([
  W("wp-dialog")
], Nt);
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
  sp_auto: "Automatic",
  warn_other_program: "{entity} is also in: {detail} (the higher priority wins)",
  warn_automation: "{entity} is also driven by automations: {detail}",
  warn_scheduler: "{entity} is also driven by Scheduler: {detail}",
  warn_missing: "{entity} does not exist any more",
  warn_vt_follow_underlying: "{entity}: turn off “follow underlying changes” in Versatile Thermostat",
  warn_vt_underlying_scheduled: "{entity} drives {detail}, which is also scheduled",
  warn_vt_locked: "{entity} is locked for automations: setpoints will not be sent"
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
  copy_weekdays: "Lun – Ven",
  copy_mon: "Lun",
  copy_fri: "Ven",
  profile_active: "actif",
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
  sp_auto: "Automatique",
  warn_other_program: "{entity} est aussi dans : {detail} (le plus prioritaire l'emporte)",
  warn_automation: "{entity} est aussi piloté par des automatisations : {detail}",
  warn_scheduler: "{entity} est aussi piloté par Scheduler : {detail}",
  warn_missing: "{entity} n'existe plus",
  warn_vt_follow_underlying: "{entity} : désactivez « suivre les changements du sous-jacent » dans Versatile Thermostat",
  warn_vt_underlying_scheduled: "{entity} pilote {detail}, qui est aussi programmé",
  warn_vt_locked: "{entity} est verrouillé pour les automatisations : les consignes ne seront pas envoyées"
};
function R(e) {
  return e.startsWith("fr") ? Qi : Zi;
}
function E(e, t, i = {}) {
  let s = R(e)[t];
  for (const [n, o] of Object.entries(i)) s = s.replace(`{${n}}`, o);
  return s;
}
var ts = Object.defineProperty, es = Object.getOwnPropertyDescriptor, T = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? es(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && ts(t, i, n), n;
};
const at = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, tt = (e) => e === "input_boolean" ? "switch" : e;
function de(e, t) {
  const i = R(e)[`type_${t}`];
  return typeof i == "string" ? i : t;
}
const is = [
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
], lt = V`
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
    display: inline-flex; align-items: center; justify-content: center; gap: 4px; --mdc-icon-size: 20px;
    min-height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--divider-color);
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
function ze(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
function re(e, t) {
  if (!t) return "";
  const i = t, s = (n) => E(e, `sp_${n}`);
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
      const n = [
        i.brightness !== void 0 ? `${i.brightness} %` : "",
        i.percentage !== void 0 ? `${i.percentage} %` : "",
        i.effect ?? ""
      ].filter(Boolean).join(" · ");
      return n ? `${s("on")} · ${n}` : s("on");
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
let rt = class extends D {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(A(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    ze(this, "wp-change", e);
  }
  render() {
    if (customElements.get("ha-entity-picker")) {
      const t = this.filter;
      return a`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${t ? (i) => t(i.entity_id) : void 0}
        @value-changed=${(i) => {
        i.stopPropagation(), this._emit(i.detail.value ?? "");
      }}></ha-entity-picker>`;
    }
    const e = this._ids().slice(0, 600);
    return a`
      <div class="field">
        ${this.label ? a`<label>${this.label}</label>` : p}
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
          ${e.map((t) => a`<option value=${t}>${H(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
rt.styles = [lt, V`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
T([
  f({ attribute: !1 })
], rt.prototype, "hass", 2);
T([
  f()
], rt.prototype, "value", 2);
T([
  f()
], rt.prototype, "label", 2);
T([
  f({ attribute: !1 })
], rt.prototype, "domains", 2);
T([
  f({ attribute: !1 })
], rt.prototype, "exclude", 2);
T([
  f({ attribute: !1 })
], rt.prototype, "filter", 2);
rt = T([
  W("wp-entity-picker")
], rt);
let Vt = class extends D {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e) {
    return E(this._lang, e);
  }
  _set(e) {
    ze(this, "wp-change", e);
  }
  _patch(e, t) {
    this._set(this.conditions.map((i, s) => s === e ? { ...i, ...t } : i));
  }
  _parse(e, t) {
    const i = e.trim();
    return i !== "" && !Number.isNaN(Number(i)) ? Number(i) : t && i === "true" ? !0 : t && i === "false" ? !1 : e;
  }
  render() {
    return a`
      ${this.conditions.map(
      (e, t) => a`
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
        (i) => a`<option value=${i} ?selected=${(e.op ?? "eq") === i}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[i]}</option>`
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
Vt.styles = lt;
T([
  f({ attribute: !1 })
], Vt.prototype, "hass", 2);
T([
  f({ attribute: !1 })
], Vt.prototype, "conditions", 2);
Vt = T([
  W("wp-conditions-editor")
], Vt);
const yi = {
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
}, ss = ["scene", "script", "action"];
function qt(e, t) {
  const i = yi[A(t)];
  return Pe(e, t, i ? i[0] : "action");
}
function Pe(e, t, i) {
  var n, o, r, l, c, d;
  const s = ((n = e == null ? void 0 : e.states[t]) == null ? void 0 : n.attributes) ?? {};
  switch (i) {
    case "preset":
      return { kind: i, preset: ((o = s.preset_modes) == null ? void 0 : o[0]) ?? "" };
    case "temperature":
      return { kind: i, temperature: Number(s.temperature ?? s.min_temp ?? 20) };
    case "hvac_mode":
      return { kind: i, hvac_mode: ((r = s.hvac_modes) == null ? void 0 : r.find((u) => u !== "off")) ?? "heat" };
    case "position":
      return { kind: i, position: 50 };
    case "tilt":
      return { kind: i, tilt: 50 };
    case "volume":
      return { kind: i, volume: 30 };
    case "source":
      return { kind: i, source: ((l = s.source_list) == null ? void 0 : l[0]) ?? "" };
    case "value":
      return { kind: i, value: Number(s.min ?? 0) };
    case "option":
      return { kind: i, option: ((c = s.options) == null ? void 0 : c[0]) ?? "" };
    case "water_heater":
      return { kind: i, operation_mode: ((d = s.operation_list) == null ? void 0 : d[0]) ?? "", temperature: Number(s.temperature ?? 50) };
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
let et = class extends D {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  get _domain() {
    return A(this.entityId);
  }
  get _attrs() {
    var e, t;
    return ((t = (e = this.hass) == null ? void 0 : e.states[this.entityId]) == null ? void 0 : t.attributes) ?? {};
  }
  _kinds() {
    var n;
    const e = yi[this._domain] ?? [], t = !this.stateOnly && this.admin ? ss : [], i = (n = this.value) == null ? void 0 : n.kind, s = [...e, ...t];
    return i && !s.includes(i) && s.push(i), s;
  }
  _current() {
    return this.value ?? Pe(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [i, s] of Object.entries(e))
      i !== "kind" && s !== void 0 && s !== "" && !(typeof s == "number" && Number.isNaN(s)) && (t[i] = s);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), ze(this, "wp-change", t);
  }
  _patch(e) {
    this._emit({ ...this._current(), ...e });
  }
  _number(e, t, i, s, n = 1, o = "") {
    const r = this._current();
    return a`
      <div class="field">
        <label>${this._tr(e)}${o ? ` (${o})` : ""}</label>
        <input type="number" min=${i} max=${s} step=${n} .value=${r[t] === void 0 ? "" : String(r[t])}
          @change=${(l) => {
      const c = l.target.value;
      this._patch({ [t]: c === "" ? void 0 : Math.min(s, Math.max(i, Number(c))) });
    }} />
      </div>`;
  }
  _choice(e, t, i, s = !1, n = !1) {
    const r = this._current()[t] ?? "";
    if (!(i != null && i.length) && !s && n)
      return a`<div class="field"><label>${this._tr(e)}</label>
        <input type="text" .value=${r} @change=${(c) => this._patch({ [t]: c.target.value })} /></div>`;
    const l = i ?? [];
    return a`
      <div class="field">
        <label>${this._tr(e)}</label>
        <select @change=${(c) => this._patch({ [t]: c.target.value || void 0 })}>
          ${s ? a`<option value="" ?selected=${r === ""}>—</option>` : p}
          ${!l.includes(r) && r ? a`<option value=${r} selected>${r}</option>` : p}
          ${l.map((c) => a`<option value=${c} ?selected=${c === r}>${c}</option>`)}
        </select>
      </div>`;
  }
  _fields(e) {
    const t = this._attrs;
    switch (e.kind) {
      case "preset":
        return a`${this._choice("f_preset", "preset", t.preset_modes, !1, !0)}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
      case "temperature":
        return a`${this._number("f_temperature", "temperature", t.min_temp ?? 5, t.max_temp ?? 35, t.target_temp_step ?? 0.5, "°C")}${this._choice("f_hvac_mode", "hvac_mode", t.hvac_modes, !0)}`;
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
        return this._domain === "light" ? a`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", t.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : p;
      case "auto":
        return a`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(i) => i.startsWith("switch.adaptive_lighting")}
              @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ adaptive_switch: i.detail || void 0 });
        }}></wp-entity-picker>
            ${e.adaptive_switch ? a`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : p}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
              @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ script: i.detail || void 0 });
        }}></wp-entity-picker></div>`;
      case "water_heater":
        return a`${this._choice("f_operation_mode", "operation_mode", t.operation_list, !0)}${this._number("f_temperature", "temperature", t.min_temp ?? 20, t.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return a`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ scene: i.detail });
        }}></wp-entity-picker></div>`;
      case "script":
        return a`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${e.script ?? ""} .domains=${["script"]}
            @wp-change=${(i) => {
          i.stopPropagation(), this._patch({ script: i.detail });
        }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(e);
      default:
        return p;
    }
  }
  _actionFields(e) {
    const t = JSON.stringify(e.data ?? {}, null, 2);
    return this._jsonFor !== this.entityId + t && !this._jsonError && (this._json = t, this._jsonFor = this.entityId + t), a`
      <div class="field"><label>${this._tr("f_action")}</label>
        <input type="text" .value=${e.action ?? ""} placeholder="light.turn_on"
          @change=${(i) => this._patch({ action: i.target.value.trim() })} /></div>
      <div class="field"><label>${this._tr("f_data")}</label>
        <textarea .value=${this._json} spellcheck="false"
          @input=${(i) => {
      const s = i.target.value;
      this._json = s;
      try {
        const n = s.trim() ? JSON.parse(s) : {};
        if (n === null || typeof n != "object" || Array.isArray(n)) throw new Error("object");
        this._jsonError = !1, this._jsonFor = this.entityId + JSON.stringify(n, null, 2), this._patch({ data: n });
      } catch {
        this._jsonError = !0;
      }
    }}></textarea>
        ${this._jsonError ? a`<span class="error">${this._tr("f_json_invalid")}</span>` : p}</div>
      <label class="check"><input type="checkbox" .checked=${e.target_self !== !1}
        @change=${(i) => this._patch({ target_self: i.target.checked ? void 0 : !1 })} />
        ${this._tr("f_target_self")}</label>`;
  }
  render() {
    const e = this._kinds(), t = this._current();
    return a`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(i) => this._emit(Pe(this.hass, this.entityId, i.target.value))}>
          ${e.map((i) => a`<option value=${i} ?selected=${i === t.kind}>${this._tr(`sp_${i}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
et.styles = lt;
T([
  f({ attribute: !1 })
], et.prototype, "hass", 2);
T([
  f({ attribute: "entity-id" })
], et.prototype, "entityId", 2);
T([
  f({ attribute: !1 })
], et.prototype, "value", 2);
T([
  f({ type: Boolean })
], et.prototype, "admin", 2);
T([
  f({ type: Boolean, attribute: "state-only" })
], et.prototype, "stateOnly", 2);
T([
  g()
], et.prototype, "_json", 2);
T([
  g()
], et.prototype, "_jsonError", 2);
et = T([
  W("wp-setpoint-editor")
], et);
let te, $t;
const ee = /* @__PURE__ */ new Set();
function ns(e, t) {
  return ee.add(t), te && t(te), $t || ($t = e.connection.subscribeMessage(
    (i) => {
      te = i, ee.forEach((s) => s(i));
    },
    { type: "weekly_planner/subscribe" }
  ), $t.catch(() => {
    $t = void 0;
  })), () => {
    ee.delete(t), ee.size === 0 && $t && ($t.then((i) => i()).catch(() => {
    }), $t = void 0, te = void 0);
  };
}
const A = (e) => e.split(".")[0];
function Ce(e) {
  var t;
  return e.main_type || A(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function Tt(e, t) {
  var s;
  const i = ((s = t.status[e.id]) == null ? void 0 : s.active_profile) ?? e.active_profile;
  return e.profiles.find((n) => n.id === i) ?? e.profiles[0];
}
function pe(e, t, i) {
  const s = e.actions.by_type[Ce(t)] ?? Object.values(e.actions.by_type)[0];
  return i.find((n) => n.id === s);
}
function ot(e, t, i) {
  var s;
  return e.color || ((s = pe(e, t, i)) == null ? void 0 : s.color) || "var(--secondary-text-color)";
}
function At(e, t, i, s) {
  const n = pe(e, t, i);
  if (n) return n.name;
  const o = t.entities.map((r) => e.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return o.length ? o.length > 1 ? `${re(s, o[0])} +${o.length - 1}` : re(s, o[0]) : "";
}
function H(e, t) {
  var i;
  return ((i = e.states[t]) == null ? void 0 : i.attributes.friendly_name) ?? t;
}
function ti(e, t) {
  var n, o;
  if (t.program) return e.programs.filter((r) => r.id === t.program);
  const i = (n = t.filter) == null ? void 0 : n.types, s = (o = t.filter) == null ? void 0 : o.area;
  return e.programs.filter((r) => !(i != null && i.length) || r.entities.some((l) => i.includes(A(l.entity_id)))).filter((r) => !s || r.area === s).sort((r, l) => r.priority - l.priority || r.name.localeCompare(l.name));
}
function Ot() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
var os = Object.defineProperty, rs = Object.getOwnPropertyDescriptor, Y = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? rs(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && os(t, i, n), n;
};
function ei(e, t) {
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
    var r;
    return Number(((r = i.find((l) => l.type === o)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(e / 1e3) * 1e3;
}
function ii(e, t) {
  const [i, s, n] = e.split("-").map(Number), o = Date.UTC(i, s - 1, n), r = o - ei(o, t);
  return o - ei(r, t);
}
function gi(e, t) {
  const [i, s, n] = e.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, n + t)).toISOString().slice(0, 10);
}
function ie(e, t) {
  return { startMs: ii(e, t), endMs: ii(gi(e, 1), t) };
}
function Mt(e) {
  const [t, i, s] = e.split("-").map(Number);
  return Ae(new Date(Date.UTC(t, i - 1, s, 12)), "UTC");
}
const xe = /* @__PURE__ */ new Map();
function si(e, t, i) {
  const s = xe.get(e);
  if (s && Date.now() - s.at < t) return s.p;
  const n = i();
  return xe.set(e, { at: Date.now(), p: n }), n.catch(() => xe.delete(e)), n;
}
const ni = "var(--disabled-text-color, #9e9e9e)";
function oi(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  let i = {};
  for (const s of e) {
    s.a && (i = s.a);
    const n = s.lu ?? s.lc ?? s.last_updated_ts, o = typeof n == "number" ? n * 1e3 : Date.parse(s.last_updated ?? "");
    Number.isNaN(o) || t.push({ t: o, s: String(s.s ?? s.state ?? ""), a: i });
  }
  return t;
}
const as = (e) => e === "unavailable" || e === "unknown" || e === "", F = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let L = class extends D {
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
    const { startMs: i, endMs: s } = ie(this.date, this._tz), n = Date.now(), r = s > n ? 6e4 : 1 / 0, l = this._windowSensor();
    try {
      const c = i < n ? si(`h|${e}|${l}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(i).toISOString(),
        end_time: new Date(Math.min(s, n)).toISOString(),
        entity_ids: l ? [this.entityId, l] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), d = Math.min(14, Math.max(1, Math.ceil((n - i) / 864e5) + 1)), u = i < n ? si(`j|${this.entityId}|${d}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: d })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [_, v] = await Promise.all([c, u]);
      if (t !== this._token) return;
      this._loaded = {
        hist: oi(_[this.entityId]),
        win: l ? oi(_[l]) : [],
        journal: (v.segments ?? []).filter((b) => b.entity_id === this.entityId)
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
    var s;
    const i = this.data.modes.find((n) => n.id === e);
    return i ? ((s = i.exceptions) == null ? void 0 : s[t]) ?? i.value : null;
  }
  _slotSetpoint(e) {
    return e.actions.by_entity[this.entityId] ?? this._modeSetpoint(e.actions.by_type[A(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(e) {
    if (!e) return null;
    const t = A(this.entityId);
    if (t === "climate") {
      const i = F(e.temperature);
      return i !== null ? i : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? F(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? F(e.brightness) ?? 100 : null : e.kind === "value" ? F(e.value) : null;
  }
  _presetTemperature(e) {
    var l, c;
    const t = ((l = this.hass.states[this.entityId]) == null ? void 0 : l.attributes) ?? {}, i = F((c = t.preset_temperatures) == null ? void 0 : c[e]) ?? F(t[`${e}_temp`]) ?? F(t[`${e}_temperature`]);
    if (i !== null) return i;
    const s = Array.isArray(t.preset_modes) ? t.preset_modes : [], n = s.indexOf(e);
    if (n < 0) return null;
    const o = F(t.min_temp) ?? 5, r = F(t.max_temp) ?? 30;
    return o + (n + 1) / (s.length + 1) * (r - o);
  }
  _live(e) {
    const t = A(this.entityId);
    if (as(e.s)) return { applied: null, measured: null };
    if (t === "climate") return { applied: F(e.a.temperature), measured: F(e.a.current_temperature) };
    if (t === "cover") return { applied: F(e.a.current_position), measured: null };
    if (t === "light") {
      const s = e.s === "on" ? F(e.a.brightness) : 0;
      return { applied: s === null ? e.s === "on" ? 100 : 0 : s / 255 * 100, measured: null };
    }
    const i = Number(e.s);
    return { applied: Number.isFinite(i) ? i : null, measured: null };
  }
  // ---- build ----
  _build(e) {
    var Fe, Re;
    const t = this._tz, { startMs: i, endMs: s } = ie(this.date, t), n = Math.round((s - i) / 6e4), o = Date.now(), r = Math.max(0, Math.min(n, (o - i) / 6e4)), l = (h) => (h - i) / 6e4, c = A(this.entityId), d = this.data.modes, u = Tt(this.program, this.data), _ = /* @__PURE__ */ new Map();
    for (const h of this.program.profiles) for (const y of h.days.flat()) _.set(y.id, y);
    E(this._lang, "override");
    const v = Mt(this.date), b = [];
    for (const { slot: h, end: y } of le(u.days[(v + 6) % 7])) b.push({ s: 0, e: y, slot: h });
    if (this.slots)
      for (const h of this.slots) {
        const y = _.get(h.slot_id);
        if (!y || h.ignored) continue;
        const $ = Math.max(0, l(Date.parse(h.start))), P = h.end ? Math.min(n, l(Date.parse(h.end))) : $ + 5;
        P > $ && b.push({ s: $, e: P, slot: y });
      }
    else
      for (const h of u.days[v]) {
        const y = M(h.start);
        if (y === null) continue;
        const $ = M(h.end ?? null);
        b.push({ s: y, e: $ === null ? y + 5 : $ > y ? $ : n, slot: h });
      }
    b.sort((h, y) => h.s - y.s);
    const w = (Fe = this.program.entities.find((h) => h.entity_id === this.entityId)) == null ? void 0 : Fe.default, nt = w ? w.kind === "mode" ? this._modeSetpoint(String(w.value), this.entityId) : w.kind === "setpoint" ? w.value : null : null, m = (w == null ? void 0 : w.kind) === "mode" ? d.find((h) => h.id === w.value) : void 0, k = (w == null ? void 0 : w.kind) === "previous", S = [];
    let q = 0;
    const Gt = (h) => {
      if (h <= q) return;
      const y = S[S.length - 1];
      S.push(k && y ? { ...y, s: q, e: h } : { s: q, e: h, v: this._value(nt), color: (m == null ? void 0 : m.color) ?? ni, label: (m == null ? void 0 : m.name) ?? E(this._lang, "default_state") }), q = h;
    };
    for (const h of b) {
      const y = Math.max(h.s, q);
      if (h.e <= y) continue;
      Gt(y);
      const $ = this._slotSetpoint(h.slot);
      S.push({
        s: y,
        e: h.e,
        v: this._value($),
        color: ot(h.slot, this.program, d),
        label: At(h.slot, this.program, d, this._lang)
      }), q = h.e;
    }
    Gt(n);
    const N = (h) => S.find((y) => h >= y.s && h < y.e) ?? S[S.length - 1], ht = e.journal.map((h) => ({ m: l(Date.parse(h.at)), e: h })).filter((h) => !Number.isNaN(h.m)).sort((h, y) => h.m - y.m), _e = (h) => {
      let y = null;
      for (const P of ht) if (P.m <= h) y = P;
      else break;
      if (!y) return null;
      const $ = y.e.slot_id ? _.get(y.e.slot_id) : void 0;
      return {
        s: y.m,
        e: y.m,
        v: this._value(y.e.setpoint),
        color: $ ? ot($, this.program, d) : ni,
        label: $ ? At($, this.program, d, this._lang) : ""
      };
    }, Xt = /* @__PURE__ */ new Set([0, n, r]);
    S.forEach((h) => {
      Xt.add(h.s), Xt.add(h.e);
    }), ht.forEach((h) => {
      h.m > 0 && h.m < n && Xt.add(h.m);
    });
    const ue = [...Xt].filter((h) => h >= 0 && h <= n).sort((h, y) => h - y), Yt = [];
    for (let h = 0; h < ue.length - 1; h++) {
      const y = ue[h], $ = ue[h + 1];
      if ($ - y < 0.01) continue;
      const P = (y + $) / 2, yt = (P < r ? _e(P) : null) ?? N(P);
      Yt.push({ s: y, e: $, v: yt.v, color: yt.color, label: yt.label });
    }
    const Et = [], me = [], Ne = [];
    for (const h of e.hist) {
      const y = Math.max(0, l(h.t)), $ = this._live(h);
      Et.push({ m: y, v: $.applied, heating: h.a.hvac_action === "heating" }), me.push({ m: y, v: $.measured });
    }
    const Ie = (h, y) => {
      const $ = [];
      return h.forEach((P, ft) => {
        if (!y(ft)) return;
        const yt = ft + 1 < h.length ? h[ft + 1].m : r;
        if (yt > P.m) {
          const ge = $[$.length - 1];
          ge && Math.abs(ge[1] - P.m) < 0.01 ? ge[1] = yt : $.push([P.m, yt]);
        }
      }), $;
    };
    Ne.push(...Ie(Et, (h) => !!Et[h].heating));
    const Ue = e.win.map((h) => ({ m: Math.max(0, l(h.t)), open: h.s === "on" })), wi = Ie(Ue, (h) => Ue[h].open), xi = (h, y) => {
      let $ = null, P = !1;
      for (const ft of h) if (ft.m <= y)
        $ = ft.v, P = !0;
      else break;
      return P ? $ : null;
    }, ki = (h) => {
      var y;
      return ((y = Yt.find(($) => h >= $.s && h < $.e)) == null ? void 0 : y.v) ?? null;
    }, Si = c === "climate" ? 0.5 : 5, We = [];
    let Pt = null;
    const fe = Math.floor(r);
    for (let h = 0; h <= fe + 1; h++) {
      const y = h <= fe ? ki(h + 0.5) : null, $ = h <= fe ? xi(Et, h + 0.5) : null, P = y !== null && $ !== null && Math.abs(y - $) > Si;
      P && Pt === null && (Pt = h), !P && Pt !== null && (h - Pt > 2 && We.push([Pt, h]), Pt = null);
    }
    const ye = [...Yt.map((h) => h.v), ...Et.map((h) => h.v), ...me.map((h) => h.v)].filter((h) => h !== null);
    let Zt = 0, Qt = 100;
    c !== "cover" && c !== "light" && ye.length && (Zt = Math.floor(Math.min(...ye) - 1), Qt = Math.ceil(Math.max(...ye) + 1), Qt - Zt < 2 && (Qt = Zt + 2));
    const Ai = c === "climate" ? "°C" : c === "cover" || c === "light" ? "%" : ((Re = this.hass.states[this.entityId]) == null ? void 0 : Re.attributes.unit_of_measurement) ?? "";
    return {
      span: n,
      pastEnd: r,
      isToday: i <= o && o < s,
      planned: Yt,
      applied: Et,
      measured: me,
      heat: Ne,
      win: wi,
      over: We,
      lo: Zt,
      hi: Qt,
      unit: Ai
    };
  }
  // ---- interaction ----
  _pointer(e) {
    const t = this._model;
    if (!t) return;
    const i = e.currentTarget.getBoundingClientRect(), s = e.clientX - i.left;
    this._cursor = this._clampM((s - x.l) / (i.width - x.l - x.r) * t.span, t.span);
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
    const { startMs: t } = ie(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t + e * 6e4));
  }
  _valueAt(e, t) {
    let i = null;
    for (const s of e) if (s.m <= t) i = s.v;
    else break;
    return i;
  }
  _path(e, t, i, s, n) {
    let o = "", r = !1;
    return e.forEach((l, c) => {
      const d = c + 1 < e.length ? e[c + 1].m : t.pastEnd;
      if (l.v === null || d < l.m) {
        r = !1;
        return;
      }
      const u = s(l.v);
      n ? o += r ? `V${u.toFixed(1)}H${i(d).toFixed(1)}` : `M${i(l.m).toFixed(1)},${u.toFixed(1)}H${i(d).toFixed(1)}` : (o += `${r ? "L" : "M"}${i(l.m).toFixed(1)},${u.toFixed(1)}`, c + 1 === e.length && (o += `L${i(d).toFixed(1)},${u.toFixed(1)}`)), r = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const e = R(this._lang), t = this._model, i = H(this.hass, this.entityId);
    let s;
    return this._failed ? s = a`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((n) => n.v !== null) && !t.applied.some((n) => n.v !== null) && !t.measured.some((n) => n.v !== null) ? s = a`<div class="note">${e.no_data}</div>` : s = this._renderChart(t, i) : s = a`<div class="note">${e.chart_loading}</div>`, a`<div class="box">${s}</div>${t ? this._legend(t) : p}`;
  }
  _legend(e) {
    const t = R(this._lang), i = (s, n) => a`<span class="key"><i class=${s}></i>${n}</span>`;
    return a`<div class="legend">
      ${i("planned", t.planned)}
      ${e.applied.some((s) => s.v !== null) ? i("applied", t.applied) : p}
      ${e.measured.some((s) => s.v !== null) ? i("measured", t.measured) : p}
      ${e.win.length ? i("zone win", t.window_open) : p}
      ${e.heat.length ? i("zone heat", t.heating) : p}
      ${e.over.length ? i("zone over", t.overridden) : p}
    </div>`;
  }
  _renderChart(e, t) {
    const i = R(this._lang), s = this._width, n = ls, o = (m) => x.l + m / e.span * (s - x.l - x.r), r = (m) => x.t + (1 - (m - e.lo) / (e.hi - e.lo)) * (n - x.t - x.b), { startMs: l } = ie(this.date, this._tz), c = [0, 1, 2, 3].map((m) => e.lo + (e.hi - e.lo) * m / 3), d = [];
    for (let m = 0; m <= e.span; m += 180) d.push(m);
    const u = (m, k) => m.map(([S, q]) => vt`<rect class="z ${k}" x=${o(S)} y=${x.t} width=${Math.max(1, o(q) - o(S))}
        height=${n - x.t - x.b}></rect>`), _ = this._cursor;
    let v = p, b = p, w = "";
    if (_ !== null) {
      const m = e.planned.find((N) => _ >= N.s && _ < N.e), k = [];
      k.push([i.planned, `${this._fmt((m == null ? void 0 : m.v) ?? null, e.unit)}${m != null && m.label ? " · " + m.label : ""}`]), _ <= e.pastEnd && (e.applied.some((N) => N.v !== null) && k.push([i.applied, this._fmt(this._valueAt(e.applied, _), e.unit)]), e.measured.some((N) => N.v !== null) && k.push([i.measured, this._fmt(this._valueAt(e.measured, _), e.unit)]));
      const S = [], q = (N) => N.some(([ht, _e]) => _ >= ht && _ < _e);
      q(e.win) && S.push(i.window_open), q(e.heat) && S.push(i.heating), q(e.over) && S.push(i.overridden), w = `${this._clock(_)} — ${k.map(([N, ht]) => `${N} ${ht}`).join(", ")}${S.length ? ", " + S.join(", ") : ""}`;
      const Gt = Math.min(Math.max(o(_), 70), s - 70);
      b = vt`<line class="cursor" x1=${o(_)} x2=${o(_)} y1=${x.t} y2=${n - x.b}></line>`, v = a`<div class="tip" style="left:${Gt}px">
        <b>${this._clock(_)}</b>
        ${k.map(([N, ht]) => a`<div><span>${N}</span> ${ht}</div>`)}
        ${S.map((N) => a`<div class="flag">${N}</div>`)}
      </div>`;
    }
    const nt = e.isToday ? vt`<line class="now" x1=${o(e.pastEnd)} x2=${o(e.pastEnd)} y1=${x.t} y2=${n - x.b}></line>` : p;
    return a`
      <svg width=${s} height=${n} viewBox="0 0 ${s} ${n}" tabindex="0" role="application"
        aria-label=${E(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(m) => m.pointerType === "mouse" || m.buttons ? this._pointer(m) : void 0}
        @pointerleave=${(m) => {
      m.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${c.map((m) => vt`<line class="grid" x1=${x.l} x2=${s - x.r} y1=${r(m)} y2=${r(m)}></line>
          <text class="ylab" x=${x.l - 4} y=${r(m) + 3} text-anchor="end">${Number(m.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${d.map((m) => vt`<text class="xlab" x=${o(m)} y=${n - 6}
          text-anchor=${m === 0 ? "start" : "middle"}>${Math.floor(xt(new Date(l + m * 6e4), this._tz) / 60)}h</text>`)}
        ${u(e.win, "win")}${u(e.heat, "heat")}${u(e.over, "over")}
        ${e.planned.map((m, k) => {
      const S = e.planned[k - 1];
      return m.v === null ? p : vt`
            ${S && S.v !== null ? vt`<line class="riser" x1=${o(m.s)} x2=${o(m.s)} y1=${r(S.v)} y2=${r(m.v)}></line>` : p}
            <line class="plan" x1=${o(m.s)} x2=${o(m.e)} y1=${r(m.v)} y2=${r(m.v)} style="stroke:${m.color}"></line>`;
    })}
        <path class="applied" d=${this._path(e.applied, e, o, r, !0)}></path>
        <path class="measured" d=${this._path(e.measured, e, o, r, !1)}></path>
        ${nt}${b}
        <rect class="hit" x=${x.l} y=${x.t} width=${s - x.l - x.r} height=${n - x.t - x.b}></rect>
      </svg>
      ${v}
      <div class="sr" aria-live="polite">${w}</div>`;
  }
};
L.styles = V`
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
Y([
  f({ attribute: !1 })
], L.prototype, "hass", 2);
Y([
  f({ attribute: !1 })
], L.prototype, "data", 2);
Y([
  f({ attribute: !1 })
], L.prototype, "program", 2);
Y([
  f({ attribute: "entity-id" })
], L.prototype, "entityId", 2);
Y([
  f()
], L.prototype, "date", 2);
Y([
  f({ attribute: !1 })
], L.prototype, "slots", 2);
Y([
  g()
], L.prototype, "_width", 2);
Y([
  g()
], L.prototype, "_loaded", 2);
Y([
  g()
], L.prototype, "_failed", 2);
Y([
  g()
], L.prototype, "_cursor", 2);
L = Y([
  W("wp-chart")
], L);
const ls = 160, x = { l: 38, r: 10, t: 10, b: 22 };
var cs = Object.defineProperty, ds = Object.getOwnPropertyDescriptor, it = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? ds(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && cs(t, i, n), n;
};
const ri = 7;
let B = class extends D {
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
    return mt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return gi(this._today, this._offset ?? 0);
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
    t < -14 || t > ri || (this._loadedDate = "", this._slots = null, this._offset = t);
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
    var i;
    return e ? ((i = e.exceptions) == null ? void 0 : i[t]) ?? e.value : null;
  }
  _setpointText(e) {
    const t = R(this._lang);
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
    const i = R(this._lang), s = Tt(this.program, this.data), n = this.data.modes, o = Mt(e), r = [];
    for (const { slot: c, end: d } of le(s.days[(o + 6) % 7]))
      r.push({ start: 0, end: d, color: ot(c, this.program, n), label: At(c, this.program, n, this._lang) });
    const l = (c) => i[`reason_${c}`] ?? c;
    for (const c of s.days[o]) {
      const d = t == null ? void 0 : t.find((w) => w.slot_id === c.id);
      let u = M(c.start), _ = M(c.end ?? null);
      if (t) {
        if (!d) continue;
        u = this._minutesOf(d.start, e), _ = d.end ? this._minutesOf(d.end, e) : null;
      }
      if (u === null) continue;
      const v = _ === null ? u + 10 : _ > u ? _ : C, b = At(c, this.program, n, this._lang);
      r.push({
        start: u,
        end: Math.min(C, v),
        color: ot(c, this.program, n),
        label: d != null && d.ignored ? `${b} — ${l(d.ignored)}` : b,
        sun: (d == null ? void 0 : d.sun) ?? ("sun" in c.start || !!(c.end && "sun" in c.end)),
        ignored: (d == null ? void 0 : d.ignored) ?? null
      });
    }
    return r;
  }
  /** Minutes since local midnight of `date`; capped to 1440 when the instant is on a later day. */
  _minutesOf(e, t) {
    return mt(new Date(e), this._tz) > t ? C : xt(e, this._tz);
  }
  _rows(e, t) {
    const i = Tt(this.program, this.data), s = Mt(e), n = [];
    for (const o of i.days[s]) {
      const r = t == null ? void 0 : t.find((d) => d.slot_id === o.id);
      if (t && !r) continue;
      const l = r ? this._minutesOf(r.start, e) : M(o.start) ?? 0, c = (d) => d === null ? "" : `${String(Math.floor(d / 60) % 24).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
      n.push({
        slot: o,
        r,
        startM: l,
        start: r ? Ee(r.start, this._tz, this._lang) : c(M(o.start)),
        end: r ? r.end ? Ee(r.end, this._tz, this._lang) : "" : c(M(o.end ?? null))
      });
    }
    return n.sort((o, r) => o.startM - r.startM);
  }
  _entityTexts(e) {
    const t = this.data.modes;
    return this.program.entities.map((i) => {
      const s = e.actions.by_entity[i.entity_id], n = t.find((r) => r.id === e.actions.by_type[A(i.entity_id)]), o = s ?? this._modeSetpoint(n, i.entity_id);
      return { entityId: i.entity_id, mode: s ? void 0 : n, text: this._setpointText(o) };
    });
  }
  render() {
    if (!this.hass || !this.data || !this.program || this._offset === null) return p;
    const e = R(this._lang), t = this._date, i = Mt(t), [s, n, o] = t.split("-").map(Number), r = new Intl.DateTimeFormat(this._lang, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(s, n - 1, o, 12))), l = this._loadedDate === t, c = l ? this._slots : null, d = this._offset === 0, u = d ? xt(/* @__PURE__ */ new Date(), this._tz) : null, _ = l ? this._rows(t, c) : [];
    return a`
      <wp-dialog wide ?open=${this._open} heading="${e.days[i]} ${r}${d ? " · " + e.today : ""}"
        @closed=${this._closed}>
        <button slot="header-start" class="nav" ?disabled=${this._offset <= -14}
          aria-label=${e.previous_day} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button slot="header-actions" class="nav" ?disabled=${this._offset >= ri}
          aria-label=${e.next_day} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <div class="program">${this.program.name}</div>
        <wp-day-bar show-hours .spans=${l ? this._bars(t, c) : []} .now=${u}></wp-day-bar>
        ${l && !_.length ? a`<p class="empty">${e.no_slot_day}</p>` : p}
        <ul class="slots">
          ${_.map((v) => {
      var b, w, nt;
      return a`
            <li class=${(b = v.r) != null && b.ignored ? "ignored" : ""}>
              <div class="time">${(w = v.r) != null && w.sun ? a`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : p}${v.start}${v.end ? a` <ha-icon icon="mdi:arrow-right"></ha-icon> ${v.end}` : p}</div>
              <div class="what">
                ${this._entityTexts(v.slot).map((m) => a`
                  <div class="line">
                    <span class="name">${H(this.hass, m.entityId)}</span>
                    ${m.mode ? a`<span class="pill" style="background:${v.slot.color || m.mode.color}">${m.mode.name}</span>` : p}
                    <span class="val">${m.text}</span>
                  </div>`)}
                ${(nt = v.r) != null && nt.ignored ? a`<div class="why">${e[`reason_${v.r.ignored}`] ?? v.r.ignored}</div>` : p}
              </div>
            </li>`;
    })}
        </ul>
        ${this.showChart && l ? this.program.entities.map((v) => a`
            <section class="chart">
              <h3>${H(this.hass, v.entity_id)}</h3>
              <wp-chart .hass=${this.hass} .data=${this.data} .program=${this.program}
                .entityId=${v.entity_id} .date=${t} .slots=${c}></wp-chart>
            </section>`) : p}
        ${this.data.can_edit ? a`<button slot="footer" class="primary" @click=${this._edit}><ha-icon icon="mdi:pencil"></ha-icon> ${e.edit}</button>` : p}
      </wp-dialog>
    `;
  }
};
B.styles = V`
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
    .time { min-width: 96px; --mdc-icon-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; }
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
  f({ attribute: !1 })
], B.prototype, "hass", 2);
it([
  f({ attribute: !1 })
], B.prototype, "data", 2);
it([
  f({ attribute: !1 })
], B.prototype, "program", 2);
it([
  f({ type: Number })
], B.prototype, "day", 2);
it([
  f({ type: Boolean })
], B.prototype, "showChart", 2);
it([
  g()
], B.prototype, "_offset", 2);
it([
  g()
], B.prototype, "_open", 2);
it([
  g()
], B.prototype, "_slots", 2);
it([
  g()
], B.prototype, "_loadedDate", 2);
B = it([
  W("wp-day-view")
], B);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ps = (e) => (...t) => ({ _$litDirective$: e, values: t });
let hs = class {
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
const _s = {}, us = (e, t = _s) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ms = ps(class extends hs {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, i]) {
    return t !== this.key && (us(e), this.key = t), i;
  }
});
var fs = Object.defineProperty, ys = Object.getOwnPropertyDescriptor, st = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? ys(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && fs(t, i, n), n;
};
const gs = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, vs = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Bt(e, t) {
  var n;
  if ("time" in t) return Q(t.time);
  const i = (n = e.states["sun.sun"]) == null ? void 0 : n.attributes[gs[t.sun]];
  let s = i ? xt(i, e.config.time_zone) : vs[t.sun];
  return s += t.offset ?? 0, t.earliest && (s = Math.max(s, Q(t.earliest))), t.latest && (s = Math.min(s, Q(t.latest))), Math.max(0, Math.min(C, s));
}
function Me(e) {
  const t = M(e.start);
  if (t === null || !e.end) return null;
  const i = M(e.end);
  return i === null ? null : i > t ? [t, i] : [t, C];
}
function vi(e) {
  const t = e.map((i) => ({ slot: i, iv: Me(i) })).filter((i) => i.iv !== null).sort((i, s) => i.iv[0] - s.iv[0]);
  for (let i = 1; i < t.length; i++)
    if (t[i].iv[0] < t[i - 1].iv[1]) return [t[i - 1].slot, t[i].slot];
  return null;
}
function $i(e, t) {
  return [...t].sort((i, s) => Bt(e, i.start) - Bt(e, s.start));
}
function Dt(e, t, i) {
  const s = (n) => {
    if ("time" in n) return n.time;
    const o = n.offset ? ` ${n.offset > 0 ? "+" : "−"}${Math.abs(n.offset)} min` : "";
    return `${E(i, `sun_${n.sun}`)}${o} (≈${Z(Bt(e, n))})`;
  };
  return t.end ? `${s(t.start)} – ${s(t.end)}` : `${s(t.start)} · ${E(i, "one_shot")}`;
}
function bi(e, t, i, s, n) {
  const o = at(e), r = [];
  n > 0 && r.push({ start: 0, end: n, color: "var(--secondary-text-color)", label: E(o, "previous_day"), ignored: "spill" });
  for (const l of s) {
    const c = Bt(e, l.start), d = l.end ? Bt(e, l.end) : null, [[u, _]] = Ji(l, { start: c, end: d }), v = !("time" in l.start) || !!(l.end && !("time" in l.end));
    r.push({
      start: u,
      end: _,
      sun: v,
      color: ot(l, i, t.modes),
      label: `${At(l, i, t.modes, o)} ${Dt(e, l, o)}`
    });
  }
  return r;
}
let J = class extends D {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "";
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), i = (s, n) => t.set(s, [...t.get(s) ?? [], n]);
    for (const s of e) {
      const n = M(s.start);
      n !== null && i(n, { id: s.id, which: "start" });
      const o = M(s.end ?? null);
      n !== null && o !== null && o > n && i(o, { id: s.id, which: "end" });
    }
    return [...t.entries()].map(([s, n]) => ({ key: n.map((o) => o.id + o.which).join("|"), min: s, refs: n }));
  }
  _bounds(e, t, i) {
    let s = 0, n = C;
    for (const l of t) {
      const c = e.find((v) => v.id === l.id);
      if (!c) continue;
      const d = M(c.start) ?? 0, u = c.end ? M(c.end) : null, _ = u !== null && u <= d;
      l.which === "start" ? (u !== null && !_ ? n = Math.min(n, u - U) : n = Math.min(n, C - U), _ && (s = Math.max(s, u))) : _ ? (s = Math.max(s, U), n = Math.min(n, d)) : s = Math.max(s, d + U);
    }
    const o = new Set(t.map((l) => l.id));
    if (!t.every((l) => {
      const c = e.find((d) => d.id === l.id);
      return l.which === "start" && !(c != null && c.end);
    }))
      for (const l of e) {
        if (o.has(l.id)) continue;
        const c = Me(l);
        c && (c[1] <= i ? s = Math.max(s, c[1]) : c[0] >= i && (n = Math.min(n, c[0])));
      }
    return [s, n];
  }
  _apply(e, t, i) {
    const s = { time: Z(i) };
    return e.map((n) => {
      const o = t.find((r) => r.id === n.id);
      return o ? o.which === "start" ? { ...n, start: s } : { ...n, end: s } : n;
    });
  }
  _emitSlots(e) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _snap(e) {
    return Math.round(e / U) * U;
  }
  /* ---- drag ---- */
  _down(e, t) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [s, n] = this._bounds(this.slots, t.refs, t.min);
    this._drag = { refs: t.refs, lo: s, hi: n, min: t.min, moved: !1 }, this._dragSlots = this.slots, e.preventDefault();
  }
  _move(e) {
    const t = this._drag, i = this.renderRoot.querySelector(".track");
    if (!t || !i) return;
    const s = i.getBoundingClientRect(), n = (e.clientX - s.left) / s.width * C, o = Math.max(t.lo, Math.min(t.hi, this._snap(n)));
    o !== t.min && (this._drag = { ...t, min: o, moved: !0 }, this._dragSlots = this._apply(this.slots, t.refs, o));
  }
  _up(e) {
    var n;
    const t = this._drag, i = e.currentTarget;
    (n = i.hasPointerCapture) != null && n.call(i, e.pointerId) && i.releasePointerCapture(e.pointerId);
    const s = this._dragSlots;
    this._drag = void 0, this._dragSlots = void 0, t != null && t.moved && s && this._emitSlots(s);
  }
  _cancel() {
    this._drag = void 0, this._dragSlots = void 0;
  }
  /* ---- keyboard / buttons ---- */
  _nudge(e, t, i) {
    const [s, n] = this._bounds(this.slots, e, t), o = Math.max(s, Math.min(n, this._snap(t + i)));
    o !== t && (this._notice = "", this._emitSlots(this._apply(this.slots, e, o)));
  }
  _onKey(e, t) {
    const i = e.shiftKey ? 60 : U;
    let s = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") s = -i;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") s = i;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, s);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((n) => n.type === Ce(this.program)), t = this._slots.map(Me).filter((n) => n !== null).sort((n, o) => n[0] - o[0]);
    let i = 480;
    for (const [n, o] of t) i >= n && i < o && (i = o);
    i > C - 60 && (i = C - 60);
    const s = Math.min(C, i + 60);
    return {
      id: Ot(),
      start: { time: Z(i) },
      end: { time: Z(s) },
      conditions: [],
      actions: { by_type: e[0] ? { [Ce(this.program)]: e[0].id } : {}, by_entity: {} }
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
    const t = pe(e, this.program, this.data.modes), i = Object.values(e.actions.by_type).map((n) => {
      var o;
      return (o = this.data.modes.find((r) => r.id === n)) == null ? void 0 : o.name;
    }).filter(Boolean);
    if (i.length) return i.join(" · ");
    const s = Object.keys(e.actions.by_entity).map((n) => H(this.hass, n));
    return (t == null ? void 0 : t.name) ?? (s.length ? s.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, i) {
    if (!i) return a`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in i))
      return a`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${Dt(this.hass, { ...e, start: i, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const s = Q(i.time), n = [{ id: e.id, which: t }], [o, r] = this._bounds(this._slots, n, s), l = this._tr(t === "start" ? "slot_start" : "slot_end");
    return a`
      <span class="stepper">
        <button class="ibtn" ?disabled=${s - U < o} @click=${() => this._nudge(n, s, -U)}
          aria-label=${`${l} −5 min`}>−5</button>
        <span class="time">${i.time}</span>
        <button class="ibtn" ?disabled=${s + U > r} @click=${() => this._nudge(n, s, U)}
          aria-label=${`${l} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = bi(this.hass, this.data, this.program, e, this.spill), i = this._edges(e), s = (r) => `${r / C * 100}%`, n = this._drag, o = $i(this.hass, e);
    return a`
      <div class="wrap">
        <div class="track">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${i.map((r) => {
      const l = n && r.refs.some((_) => n.refs.some((v) => v.id === _.id && v.which === _.which)), [c, d] = this._bounds(e, r.refs, r.min), u = Z(r.min);
      return a`<button class="handle ${l ? "active" : ""}" style="left:${s(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((_) => `${_.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, _.id)}`).join(" / ")}
                aria-valuemin=${c} aria-valuemax=${d} aria-valuenow=${r.min} aria-valuetext=${u}
                @pointerdown=${(_) => this._down(_, r)}
                @pointermove=${(_) => this._move(_)}
                @pointerup=${(_) => this._up(_)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(_) => this._onKey(_, r)}><span class="grip"></span></button>`;
    })}
            ${n ? a`<div class="loupe" style="left:${s(n.min)}" aria-hidden="true">
                  <span>${Z(n.min)}</span></div>` : p}
          </div>
        </div>
      </div>
      ${this.spill > 0 ? a`<p class="hint">${this._tr("spill_hint", { time: Z(this.spill) })}</p>` : p}
      ${this._notice ? a`<p class="error" role="alert">${this._notice}</p>` : p}
      <div class="list">
        ${o.length === 0 ? a`<p class="muted">${this._tr("no_slots")}</p>` : p}
        ${o.map(
      (r) => {
        var l;
        return a`
            <div class="slot">
              <span class="dot" style="background:${ot(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? a`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : a`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(l = r.conditions) != null && l.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${Dt(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${Dt(this.hass, r, this._lang)}`}
                @click=${() => this._emitSlots(this.slots.filter((c) => c.id !== r.id))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
    `;
  }
};
J.styles = [
  lt,
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
      .time.sun { font-weight: 500; text-align: left; display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .action { font-size: 12px; }
    `
];
st([
  f({ attribute: !1 })
], J.prototype, "hass", 2);
st([
  f({ attribute: !1 })
], J.prototype, "data", 2);
st([
  f({ attribute: !1 })
], J.prototype, "program", 2);
st([
  f({ attribute: !1 })
], J.prototype, "slots", 2);
st([
  f({ type: Number })
], J.prototype, "spill", 2);
st([
  f({ type: Number })
], J.prototype, "day", 2);
st([
  g()
], J.prototype, "_drag", 2);
st([
  g()
], J.prototype, "_dragSlots", 2);
st([
  g()
], J.prototype, "_notice", 2);
J = st([
  W("wp-day-editor")
], J);
var $s = Object.defineProperty, bs = Object.getOwnPropertyDescriptor, ct = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? bs(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && $s(t, i, n), n;
};
const ws = ["dawn", "sunrise", "sunset", "dusk"];
let K = class extends D {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  willUpdate(e) {
    var t, i, s, n;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (i = this._s).actions ?? (i.actions = { by_type: {}, by_entity: {} }), (s = this._s.actions).by_type ?? (s.by_type = {}), (n = this._s.actions).by_entity ?? (n.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(tt(A(t.entity_id)));
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
    return a`
      <fieldset>
        <legend>${s}</legend>
        <div class="field">
          <select aria-label=${`${s} — ${this._tr("time_kind")}`}
            @change=${(n) => {
      const o = n.target.value === "sun";
      this._setSpec(e, o ? { sun: "sunset", offset: 0 } : { time: e === "start" ? "08:00" : "09:00" });
    }}>
            <option value="fixed" ?selected=${!i}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${i}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in t ? this._fixedEditor(e, t.time, s) : a`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(n) => this._setSpec(e, { ...t, sun: n.target.value })}>
                    ${ws.map((n) => a`<option value=${n} ?selected=${t.sun === n}>${this._tr(`sun_${n}`)}</option>`)}
                  </select>
                </div>
                <div class="field">
                  <label>${this._tr("sun_offset")}</label>
                  <input type="number" min="-240" max="240" step="5" .value=${String(t.offset ?? 0)}
                    @change=${(n) => {
      const o = Math.max(-240, Math.min(240, Math.round(Number(n.target.value) || 0)));
      this._setSpec(e, { ...t, offset: o });
    }} />
                </div>
              </div>
              <div class="row">
                ${["earliest", "latest"].map(
      (n) => a`
                    <div class="field">
                      <label>${this._tr(n === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${t[n] ?? ""}
                          @change=${(o) => {
        const r = o.target.value, l = { ...t };
        r ? l[n] = Z(Q(r)) : delete l[n], this._setSpec(e, l);
      }} />
                        ${t[n] ? a`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => {
        const o = { ...t };
        delete o[n], this._setSpec(e, o);
      }}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
                      </div>
                    </div>`
    )}
              </div>`}
      </fieldset>`;
  }
  _fixedEditor(e, t, i) {
    const s = e === "end" && t === "24:00";
    return a`
      ${s ? a`<p class="time-big">24:00</p>` : a`<div class="field"><input type="time" step="300" aria-label=${i} .value=${t}
            @change=${(n) => {
      const o = n.target.value;
      o && this._setSpec(e, { time: Z(Q(o)) });
    }} /></div>`}
      ${e === "end" ? a`<label class="check"><input type="checkbox" .checked=${s}
            @change=${(n) => this._setSpec("end", { time: n.target.checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>` : p}`;
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
    return a`${this._types.map((e) => {
      const t = this.data.modes.filter((s) => s.type === e), i = this._s.actions.by_type[e] ?? "";
      return a`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(e) })}</label>
          <select @change=${(s) => this._setMode(e, s.target.value)}>
            <option value="" ?selected=${i === ""}>—</option>
            ${t.map((s) => a`<option value=${s.id} ?selected=${s.id === i}>${s.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }
  _typeName(e) {
    return de(this._lang, e);
  }
  _directEditor() {
    return a`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return a`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(i) => this._setDirect(
        e.entity_id,
        i.target.checked ? qt(this.hass, e.entity_id) : null
      )} />
            <strong>${H(this.hass, e.entity_id)}</strong></label>
          ${t ? a`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${t}
                .admin=${!!this.data.is_admin}
                @wp-change=${(i) => {
        i.stopPropagation(), this._setDirect(e.entity_id, i.detail);
      }}></wp-setpoint-editor>` : p}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(e) => this._update({ color: e.target.value })} />
        ${this._s.color ? a`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : p}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var s;
    const e = this._s, t = "time" in e.start ? Q(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === Q(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= C) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const n of Object.values(e.actions.by_entity)) {
      if (n.kind === "scene" && !n.scene) return this._tr("err_incomplete");
      if (n.kind === "script" && !n.script) return this._tr("err_incomplete");
      if (n.kind === "action" && !n.action) return this._tr("err_incomplete");
    }
    if ((s = e.conditions) != null && s.some((n) => !n.entity_id)) return this._tr("err_incomplete");
    const i = vi([...this.others, e]);
    if (i) {
      const n = i.find((o) => o.id !== e.id) ?? i[0];
      return this._tr("err_overlap", { slot: Dt(this.hass, n, this._lang) });
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
    if (!this._s) return p;
    const e = this._s;
    return a`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", e.start)}
        <label class="check"><input type="checkbox" .checked=${!e.end}
          @change=${(t) => {
      if (t.target.checked) this._setSpec("end", null);
      else {
        const s = "time" in e.start ? Q(e.start.time) : 480;
        this._setSpec("end", { time: Z(Math.min(C, s + 60)) });
      }
    }} /> ${this._tr("one_shot_check")}</label>
        ${e.end ? this._specEditor("end", e.end) : a`<p class="hint">${this._tr("one_shot_hint")}</p>`}

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

        ${this._error ? a`<p class="error" role="alert">${this._error}</p>` : p}
        <button slot="footer" class="btn" @click=${() => {
      var t, i;
      return (i = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
K.styles = [
  lt,
  V`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
ct([
  f({ attribute: !1 })
], K.prototype, "hass", 2);
ct([
  f({ attribute: !1 })
], K.prototype, "data", 2);
ct([
  f({ attribute: !1 })
], K.prototype, "program", 2);
ct([
  f({ attribute: !1 })
], K.prototype, "entry", 2);
ct([
  f({ attribute: !1 })
], K.prototype, "others", 2);
ct([
  g()
], K.prototype, "_s", 2);
ct([
  g()
], K.prototype, "_mode", 2);
ct([
  g()
], K.prototype, "_error", 2);
K = ct([
  W("wp-slot-editor")
], K);
var xs = Object.defineProperty, ks = Object.getOwnPropertyDescriptor, z = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? ks(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && xs(t, i, n), n;
};
const ai = () => [[], [], [], [], [], [], []];
function ke(e) {
  return e.map((t) => ({ ...structuredClone(t), id: Ot() }));
}
let O = class extends D {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  _long(e) {
    return R(this._lang).days[e];
  }
  _short(e) {
    return R(this._lang).days_short[e];
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
          profiles: [{ id: t, name: this._tr("profile_default"), days: ai() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._dayView = this.day, this._tab = this.day !== void 0 ? "week" : "general";
    }
  }
  _activeId() {
    var i, s;
    const e = this._p, t = !this._isNew && ((i = this.data.status[e.id]) == null ? void 0 : i.active_profile) || e.active_profile;
    return ((s = e.profiles.find((n) => n.id === t)) == null ? void 0 : s.id) ?? e.profiles[0].id;
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
    for (const t of this._p.entities) e.add(tt(A(t.entity_id)));
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
    const n = s.days.map((o, r) => r === e ? $i(this.hass, t) : o);
    this._setProfile({ ...s, days: n });
  }
  _spill(e, t) {
    const i = e.days[(t + 6) % 7] ?? [];
    return le(i).reduce((s, n) => Math.max(s, n.end), 0);
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
      const s = this._profile, n = {
        id: Ot(),
        name: t,
        days: e.mode === "copy" ? s.days.map(ke) : ai()
      };
      this._patch({ profiles: [...this._p.profiles, n] }), this._profileId = n.id;
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
        profiles: i.profiles.map((n) => n.id === e.profileId ? { ...n, days: n.days.map((o, r) => r === s ? ke(t) : o) } : n)
      });
    this._p = i, this._copy = void 0;
  }
  _saveSlot(e) {
    const t = this._dayView;
    if (t === void 0) return;
    const i = this._profile.days[t], s = i.some((n) => n.id === e.id);
    this._setDay(t, s ? i.map((n) => n.id === e.id ? e : n) : [...i, e]);
  }
  /* ---- entities ---- */
  _setEntity(e, t) {
    this._patch({ entities: this._p.entities.map((i, s) => s === e ? { ...i, ...t } : i) });
  }
  _addEntity(e) {
    if (!e || this._p.entities.some((o) => o.entity_id === e)) return;
    const t = tt(A(e)), i = this.data.modes.filter((o) => o.type === t), s = i.find((o) => /eco|off|closed/.test(o.id)) ?? i[0], n = s ? { kind: "mode", value: s.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: n, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var o;
    const i = this._p.entities[e], s = tt(A(i.entity_id));
    let n;
    t === "mode" && (n = ((o = this.data.modes.find((r) => r.type === s)) == null ? void 0 : o.id) ?? ""), t === "setpoint" && (n = qt(this.hass, i.entity_id)), this._setEntity(e, { default: n === void 0 ? { kind: t } : { kind: t, value: n } });
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
        if (vi(i.days[s]))
          return this._tr("err_overlap_day", { profile: i.name, day: this._long(s) });
    return "";
  }
  _payload() {
    const e = structuredClone(this._p), t = new Set(e.entities.map((i) => i.entity_id));
    return e.name = e.name.trim(), e.profiles = e.profiles.map((i) => ({
      ...i,
      days: i.days.map((s) => s.map((n) => {
        const o = Object.fromEntries(Object.entries(n.actions.by_entity).filter(([r]) => t.has(r)));
        return { ...n, actions: { ...n.actions, by_entity: o } };
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
    const e = Ot(), t = this._p, i = /* @__PURE__ */ new Map(), s = t.profiles.map((n) => {
      const o = n.id === this._activeId() ? e : Ot();
      return i.set(n.id, o), { ...structuredClone(n), id: o, days: n.days.map(ke) };
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
    return a`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${e.name}
          @input=${(i) => this._patch({ name: i.target.value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${e.icon && customElements.get("ha-icon") ? a`<ha-icon .icon=${e.icon}></ha-icon>` : p}
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
      ${t.length ? a`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(i) => this._patch({ main_type: i.target.value })}>
              ${t.map((i) => a`<option value=${i} ?selected=${i === (e.main_type || t[0])}>${de(this._lang, i)}</option>`)}
            </select></div>` : p}
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
    return a`
      ${e.entities.length === 0 ? a`<p class="muted">${this._tr("pe_no_entity")}</p>` : p}
      ${e.entities.map((t, i) => this._renderEntity(t, i))}
      ${ms(this._pickerKey, a`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${is} .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    var l, c;
    const i = tt(A(e.entity_id)), s = ((l = this.hass.states[e.entity_id]) == null ? void 0 : l.attributes) ?? {}, n = Array.isArray(s.preset_modes) && s.preset_modes.includes("permanent"), o = this.data.modes.filter((d) => d.type === i), r = ((c = e.default) == null ? void 0 : c.kind) ?? "none";
    return a`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${H(this.hass, e.entity_id)}</strong>
            <div class="muted small">${e.entity_id}${this.hass.states[e.entity_id] ? "" : ` · ${this._tr("pe_unknown_entity")}`}</div></div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${H(this.hass, e.entity_id)}`}
            @click=${() => this._patch({ entities: this._p.entities.filter((d, u) => u !== t) })}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(d) => this._setDefaultKind(t, d.target.value)}>
            <option value="none" ?selected=${r === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${r === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${r === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${r === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${r === "mode" ? a`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(d) => this._setEntity(t, { default: { kind: "mode", value: d.target.value } })}>
              ${o.map((d) => a`<option value=${d.id} ?selected=${d.id === e.default.value}>${d.name}</option>`)}
            </select></div>` : p}
        ${r === "setpoint" ? a`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(d) => {
      d.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: d.detail } });
    }}></wp-setpoint-editor>` : p}
        ${n || e.force_permanent ? a`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
              @change=${(d) => this._setEntity(t, { force_permanent: d.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : p}
      </div>`;
  }
  _renderWeek() {
    const e = this._p, t = this._profile, i = this._activeId(), s = this._profileForm;
    return a`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(n) => {
      this._profileId = n.target.value, this._dayView = void 0;
    }}>
            ${e.profiles.map((n) => a`<option value=${n.id} ?selected=${n.id === t.id}>${n.name}${n.id === i ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => this._profileForm = { mode: "add", name: "" }}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => this._profileForm = { mode: "rename", name: t.name }}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => this._profileForm = { mode: "copy", name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 40) }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${e.profiles.length < 2 || t.id === i}
          @click=${() => this._confirm = { text: this._tr("confirm_delete", { name: t.name }), yes: () => this._deleteProfile() }}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${t.id === i ? a`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : p}
      ${s ? a`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(s.mode === "rename" ? "profile_rename" : s.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${s.name}
                @input=${(n) => this._profileForm = { ...s, name: n.target.value }}
                @keydown=${(n) => {
      n.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${s.mode === "rename" ? a`<p class="hint">${this._tr("profile_rename_warning")}</p>` : p}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : p}
      ${this._dayView === void 0 ? this._renderDays(t) : this._renderDayEditor(t, this._dayView)}
    `;
  }
  _renderDays(e) {
    return a`${e.days.map((t, i) => {
      const s = bi(this.hass, this.data, this._p, t, this._spill(e, i)), n = this._long(i);
      return a`
        <div class="dayrow">
          <button class="dname" @click=${() => this._dayView = i} aria-label=${`${this._tr("edit")} ${n}`}>${this._short(i)}</button>
          <div class="grow bar" @click=${() => this._dayView = i}><wp-day-bar .spans=${s}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${n}`} @click=${() => this._dayView = i}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${n}`} title=${this._tr("copy_day")}
            @click=${() => this._copy = { from: i, targets: [], profileId: e.id }}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        </div>`;
    })}`;
  }
  _renderDayEditor(e, t) {
    return a`
      <div class="row daynav">
        <button class="btn" @click=${() => this._dayView = void 0}><ha-icon icon="mdi:arrow-left"></ha-icon> ${this._tr("week")}</button>
        <span class="grow"></span>
        <button class="ibtn" aria-label=${this._tr("previous_day")} @click=${() => this._dayView = (t + 6) % 7}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <strong>${this._long(t)}</strong>
        <button class="ibtn" aria-label=${this._tr("next_day")} @click=${() => this._dayView = (t + 1) % 7}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
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
    if (!e) return p;
    const t = (s) => this._copy = { ...e, targets: s }, i = [0, 1, 2, 3, 4, 5, 6];
    return a`
      <wp-dialog open heading=${`${this._tr("copy_day")} — ${this._long(e.from)}`}
        @closed=${(s) => {
      s.stopPropagation(), this._copy = void 0;
    }}>
        <div class="row">
          <button class="btn" @click=${() => t([0, 1, 2, 3, 4])}>${this._tr("copy_mon")} <ha-icon icon="mdi:arrow-right"></ha-icon> ${this._tr("copy_fri")}</button>
          <button class="btn" @click=${() => t([5, 6])}>${this._tr("copy_weekend")}</button>
          <button class="btn" @click=${() => t(i)}>${this._tr("copy_all")}</button>
        </div>
        <div class="row" role="group" aria-label=${this._tr("copy_choose")}>
          ${i.map((s) => a`<label class="check"><input type="checkbox" .checked=${e.targets.includes(s)}
            @change=${(n) => t(n.target.checked ? [...e.targets, s] : e.targets.filter((o) => o !== s))} />
            ${this._short(s)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(s) => this._copy = { ...e, profileId: s.target.value }}>
            ${this._p.profiles.map((s) => a`<option value=${s.id} ?selected=${s.id === e.profileId}>${s.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr("copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => this._copy = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }
  _renderConfirm() {
    const e = this._confirm;
    return e ? a`
      <wp-dialog open heading=${this._tr("confirm")} @closed=${(t) => {
      t.stopPropagation(), this._confirm = void 0;
    }}>
        <p>${e.text}</p>
        <button slot="footer" class="btn" @click=${() => this._confirm = void 0}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn danger" @click=${() => {
      const t = e.yes;
      this._confirm = void 0, t();
    }}>${this._tr("delete")}</button>
      </wp-dialog>` : p;
  }
  render() {
    if (!this._p) return p;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], t = this._canEdit(), i = this._dayView;
    return a`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? p : a`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist">
          ${e.map(([s, n]) => a`<button role="tab" aria-selected=${this._tab === s} class="tab ${this._tab === s ? "on" : ""}"
            @click=${() => this._tab = s}>${this._tr(n)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? a`<p class="error" role="alert">${this._error}</p>` : p}
        ${this._isNew ? p : a`<button slot="footer" class="btn danger" style="margin-right:auto"
              @click=${() => this._confirm = { text: this._tr("confirm_delete", { name: this._p.name }), yes: () => void this._delete() }}>${this._tr("delete")}</button>
            <button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
      </wp-dialog>
      ${this._renderCopy()}
      ${this._renderConfirm()}
      ${this._slotEdit && i !== void 0 ? a`<wp-slot-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .entry=${this._slotEdit.slot}
            .others=${this._profile.days[i].filter((s) => s.id !== this._slotEdit.slot.id)}
            @wp-save=${(s) => {
      s.stopPropagation(), this._saveSlot(s.detail);
    }}
            @closed=${(s) => {
      s.stopPropagation(), this._slotEdit = void 0;
    }}></wp-slot-editor>` : p}
    `;
  }
};
O.styles = [
  lt,
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
z([
  f({ attribute: !1 })
], O.prototype, "hass", 2);
z([
  f({ attribute: !1 })
], O.prototype, "data", 2);
z([
  f({ attribute: !1 })
], O.prototype, "program", 2);
z([
  f({ attribute: !1 })
], O.prototype, "defaultTypes", 2);
z([
  f({ type: Number })
], O.prototype, "day", 2);
z([
  g()
], O.prototype, "_p", 2);
z([
  g()
], O.prototype, "_isNew", 2);
z([
  g()
], O.prototype, "_tab", 2);
z([
  g()
], O.prototype, "_profileId", 2);
z([
  g()
], O.prototype, "_dayView", 2);
z([
  g()
], O.prototype, "_slotEdit", 2);
z([
  g()
], O.prototype, "_error", 2);
z([
  g()
], O.prototype, "_saving", 2);
z([
  g()
], O.prototype, "_confirm", 2);
z([
  g()
], O.prototype, "_copy", 2);
z([
  g()
], O.prototype, "_profileForm", 2);
O = z([
  W("wp-program-editor")
], O);
var Ss = Object.defineProperty, As = Object.getOwnPropertyDescriptor, I = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? As(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Ss(t, i, n), n;
};
const li = 7 * 24 * 3600 * 1e3;
function Es(e, t) {
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
    var r;
    return Number(((r = i.find((l) => l.type === o)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(s("year"), s("month") - 1, s("day"), s("hour"), s("minute"), s("second")) - Math.floor(e.getTime() / 1e3) * 1e3;
}
function Se(e, t, i) {
  const [s, n, o] = e.split("-").map(Number), [r, l] = t.split(":").map(Number), c = Date.UTC(s, n - 1, o, r, l);
  let d = c;
  for (let u = 0; u < 3; u++) d = c - Es(new Date(d), i);
  return new Date(d);
}
function ci(e, t) {
  const [i, s, n] = e.split("-").map(Number);
  return new Date(Date.UTC(i, s - 1, n + t)).toISOString().slice(0, 10);
}
let j = class extends D {
  constructor() {
    super(...arguments), this._sel = [], this._how = "setpoint", this._sp = null, this._modeId = "", this._dur = "next", this._hours = 1, this._minutes = 0, this._untilTime = "18:00", this._untilDate = "", this._error = "", this._busy = !1, this._init = !1;
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  willUpdate() {
    if (this._init || !this.program) return;
    this._init = !0;
    const e = this.program.entities.map((i) => i.entity_id), t = tt(A(e[0] ?? ""));
    this._sel = e.filter((i) => tt(A(i)) === t);
  }
  get _rep() {
    var e;
    return this._sel[0] ?? ((e = this.program.entities[0]) == null ? void 0 : e.entity_id) ?? "";
  }
  get _sameType() {
    return new Set(this._sel.map((e) => tt(A(e)))).size <= 1;
  }
  get _modes() {
    const e = tt(A(this._rep));
    return this.data.modes.filter((t) => t.type === e);
  }
  _toggle(e, t) {
    this._sel = t ? [...this._sel, e] : this._sel.filter((i) => i !== e), this._sp = null, this._modeId = "", this._error = "";
  }
  _timing() {
    if (this._dur === "next") return {};
    if (this._dur === "for") {
      const s = Math.max(0, Math.floor(this._hours || 0)), n = Math.max(0, Math.floor(this._minutes || 0)), o = (s * 60 + n) * 6e4;
      return o <= 0 ? this._tr("ov_err_duration") : o > li ? this._tr("ov_err_week") : { duration: { hours: s, minutes: n } };
    }
    const e = this.hass.config.time_zone, t = /* @__PURE__ */ new Date();
    let i;
    if (this._untilDate)
      i = Se(this._untilDate, this._untilTime, e);
    else {
      const s = mt(t, e);
      i = Se(s, this._untilTime, e), i <= t && (i = Se(ci(s, 1), this._untilTime, e));
    }
    return i.getTime() <= t.getTime() ? this._tr("ov_err_past") : i.getTime() - t.getTime() > li ? this._tr("ov_err_week") : { until: i.toISOString() };
  }
  async _apply() {
    var i, s, n;
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
      const o = this._modes.find((r) => r.id === this._modeId);
      if (!o) {
        this._error = this._tr("ov_err_no_setpoint");
        return;
      }
      for (const r of this._sel) {
        const l = ((i = o.exceptions) == null ? void 0 : i[r]) ?? o.value, c = JSON.stringify(l), d = t.get(c) ?? { entity_id: [], setpoint: l };
        d.entity_id.push(r), t.set(c, d);
      }
    } else {
      const o = this._sp ?? qt(this.hass, this._rep);
      t.set("sp", { entity_id: [...this._sel], setpoint: o });
    }
    this._busy = !0;
    try {
      for (const o of t.values())
        await this.hass.callService("weekly_planner", "override", { ...o, ...e });
      (n = (s = this.shadowRoot) == null ? void 0 : s.querySelector("wp-dialog")) == null || n.close();
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
    if (!e.length) return p;
    const t = this.hass.config.time_zone;
    return a`
      <h3>${this._tr("ov_current")}</h3>
      ${e.map(({ id: i, o: s }) => a`
        <div class="card row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${H(this.hass, i)}</strong>
            <div class="muted small">${s.origin === "voluntary" && s.until ? this._tr("overridden_until", { time: Ee(s.until, t, this._lang) }) : s.origin === "voluntary" ? this._tr("ov_until_next") : this._tr("overridden")}</div></div>
          <button class="btn" @click=${() => void this._resume(i)}>${this._tr("resume")}</button>
        </div>`)}`;
  }
  render() {
    if (!this.program || !this.data) return p;
    const e = this.data.can_edit && !this.data.read_only, t = this._modes;
    return a`
      <wp-dialog open heading=${`${this._tr("override")} — ${this.program.name}`}>
        ${this._current()}
        <h3>${this._tr("ov_entities")}</h3>
        <div role="group" aria-label=${this._tr("ov_entities")}>
          ${this.program.entities.map((i) => a`
            <label class="check"><input type="checkbox" .checked=${this._sel.includes(i.entity_id)}
              @change=${(s) => this._toggle(i.entity_id, s.target.checked)} />
              ${H(this.hass, i.entity_id)}</label>`)}
        </div>
        ${this._sameType ? p : a`<p class="error">${this._tr("ov_err_mixed")}</p>`}

        <h3>${this._tr("setpoint")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("setpoint")}>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "setpoint"} @change=${() => this._how = "setpoint"} /> ${this._tr("ov_how_setpoint")}</label>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "mode"} ?disabled=${!t.length} @change=${() => this._how = "mode"} /> ${this._tr("ov_how_mode")}</label>
        </div>
        ${this._how === "mode" ? a`<div class="field"><select aria-label=${this._tr("ov_how_mode")} @change=${(i) => this._modeId = i.target.value}>
              <option value="" ?selected=${!this._modeId}>—</option>
              ${t.map((i) => a`<option value=${i.id} ?selected=${i.id === this._modeId}>${i.name}</option>`)}
            </select></div>` : this._rep ? a`<wp-setpoint-editor .hass=${this.hass} entity-id=${this._rep} state-only
                .value=${this._sp ?? qt(this.hass, this._rep)}
                @wp-change=${(i) => {
      i.stopPropagation(), this._sp = i.detail, this._error = "";
    }}></wp-setpoint-editor>` : p}

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
              min=${mt(/* @__PURE__ */ new Date(), this.hass.config.time_zone)}
              max=${ci(mt(/* @__PURE__ */ new Date(), this.hass.config.time_zone), 7)}
              @input=${(i) => {
      this._untilDate = i.target.value, this._dur = "until";
    }} />
          </div>
          ${this._dur === "until" ? a`<p class="hint">${this._tr("ov_until_hint")}</p>` : p}
        </div>
        ${this._error ? a`<p class="error" role="alert">${this._error}</p>` : p}
        <button slot="footer" class="btn" @click=${() => {
      var i, s;
      return (s = (i = this.shadowRoot) == null ? void 0 : i.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!e || this._busy} @click=${() => void this._apply()}>${this._tr("ov_apply")}</button>
      </wp-dialog>`;
  }
};
j.styles = [
  lt,
  V`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
    `
];
I([
  f({ attribute: !1 })
], j.prototype, "hass", 2);
I([
  f({ attribute: !1 })
], j.prototype, "data", 2);
I([
  f({ attribute: !1 })
], j.prototype, "program", 2);
I([
  g()
], j.prototype, "_sel", 2);
I([
  g()
], j.prototype, "_how", 2);
I([
  g()
], j.prototype, "_sp", 2);
I([
  g()
], j.prototype, "_modeId", 2);
I([
  g()
], j.prototype, "_dur", 2);
I([
  g()
], j.prototype, "_hours", 2);
I([
  g()
], j.prototype, "_minutes", 2);
I([
  g()
], j.prototype, "_untilTime", 2);
I([
  g()
], j.prototype, "_untilDate", 2);
I([
  g()
], j.prototype, "_error", 2);
I([
  g()
], j.prototype, "_busy", 2);
j = I([
  W("wp-override-dialog")
], j);
var Ps = Object.defineProperty, Cs = Object.getOwnPropertyDescriptor, dt = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Cs(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Ps(t, i, n), n;
};
const Ms = ["climate", "cover", "light", "switch"];
let G = class extends D {
  constructor() {
    super(...arguments), this._type = "", this._rep = "", this._error = "", this._confirmId = "", this._saving = !1;
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
  }
  _types() {
    const e = new Set(Ms);
    for (const t of this.data.modes) e.add(t.type);
    for (const t of this.data.programs) for (const i of t.entities) e.add(tt(A(i.entity_id)));
    return [...e];
  }
  get _current() {
    return this._type || this._types()[0];
  }
  _users(e) {
    return this.data.programs.filter(
      (t) => t.profiles.some((i) => i.days.some((s) => s.some((n) => Object.values(n.actions.by_type).includes(e)))) || t.entities.some((i) => {
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
    const t = this._domains(e), i = new Set(this.data.programs.flatMap((s) => s.entities.map((n) => n.entity_id)));
    return Object.keys(this.hass.states).filter((s) => t.includes(A(s))).sort((s, n) => Number(i.has(n)) - Number(i.has(s)) || s.localeCompare(n)).slice(0, 300);
  }
  _startEdit(e) {
    const t = this._current;
    this._error = "", this._confirmId = "", e ? (this._edit = structuredClone(e), this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`) : (this._rep = this._candidates(t)[0] ?? `${this._domains(t)[0]}.x`, this._edit = { type: t, name: "", color: "#2196f3", icon: null, value: qt(this.hass, this._rep), exceptions: {} });
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
    return a`
      <div class="tabs" role="tablist">
        ${this._types().map((s) => a`<button role="tab" aria-selected=${s === e} class="tab ${s === e ? "on" : ""}"
          @click=${() => {
      this._type = s, this._error = "", this._confirmId = "";
    }}>${de(this._lang, s)}</button>`)}
      </div>
      ${t.length === 0 ? a`<p class="muted">${this._tr("no_modes")}</p>` : p}
      ${t.map((s) => {
      const n = this._users(s.id);
      return a`
          <div class="mode">
            <span class="dot" style="background:${s.color}"></span>
            <div class="grow">
              <strong>${s.name}</strong>
              <div class="muted small">${re(this._lang, s.value)}${Object.keys(s.exceptions ?? {}).length ? ` · ${this._tr("mode_exceptions_n", { n: String(Object.keys(s.exceptions).length) })}` : ""}</div>
              <div class="muted small">${n === 0 ? this._tr("mode_unused") : this._tr(n === 1 ? "mode_used_one" : "mode_used_many", { n: String(n) })}</div>
            </div>
            ${this._confirmId === s.id ? a`<span class="small">${this._tr("confirm_delete", { name: s.name })}</span>
                  <button class="btn danger" @click=${() => void this._delete(s.id)}>${this._tr("delete")}</button>
                  <button class="btn" @click=${() => this._confirmId = ""}>${this._tr("cancel")}</button>` : a`<button class="ibtn" ?disabled=${!i} aria-label=${`${this._tr("edit")} ${s.name}`} @click=${() => this._startEdit(s)}><ha-icon icon="mdi:pencil"></ha-icon></button>
                  <button class="ibtn" ?disabled=${!i} aria-label=${`${this._tr("delete")} ${s.name}`} @click=${() => {
        this._confirmId = s.id, this._error = "";
      }}><ha-icon icon="mdi:delete"></ha-icon></button>`}
          </div>`;
    })}
      ${this._error ? a`<p class="error" role="alert">${this._error}</p>` : p}
      <button class="btn" ?disabled=${!i} @click=${() => this._startEdit()}>+ ${this._tr("mode_new")}</button>
    `;
  }
  _renderForm(e) {
    const t = e.type, i = this._domains(t), s = this._candidates(t), n = this._rep, o = Object.entries(e.exceptions ?? {});
    return a`
      <div class="field"><label for="m-name">${this._tr("mode_name")}</label>
        <input id="m-name" type="text" maxlength="40" .value=${e.name}
          @input=${(l) => this._patch({ name: l.target.value })} /></div>
      <div class="row">
        <div class="field" style="flex:0 0 auto"><label for="m-color">${this._tr("mode_color")}</label>
          <input id="m-color" type="color" .value=${e.color || "#9e9e9e"}
            @input=${(l) => this._patch({ color: l.target.value })} /></div>
        <div class="field"><label for="m-icon">${this._tr("pe_icon")}</label>
          <input id="m-icon" type="text" placeholder="mdi:sofa" .value=${e.icon ?? ""}
            @input=${(l) => this._patch({ icon: l.target.value.trim() || null })} /></div>
      </div>
      <h3>${this._tr("mode_value")}</h3>
      ${s.length ? a`<div class="field"><label>${this._tr("mode_rep_entity")}</label>
            <select @change=${(l) => this._rep = l.target.value}>
              ${s.map((l) => a`<option value=${l} ?selected=${l === n}>${H(this.hass, l)}</option>`)}
            </select></div>` : p}
      <wp-setpoint-editor .hass=${this.hass} entity-id=${n} .value=${e.value} .admin=${!1} state-only
        @wp-change=${(l) => {
      l.stopPropagation(), this._patch({ value: l.detail });
    }}></wp-setpoint-editor>
      <h3>${this._tr("mode_exceptions")}</h3>
      <p class="hint">${this._tr("mode_exceptions_hint")}</p>
      ${o.map(([l, c]) => a`
        <div class="card">
          <div class="row" style="flex-wrap:nowrap">
            <strong class="grow">${H(this.hass, l)}</strong>
            <button class="ibtn" aria-label=${`${this._tr("delete")} ${H(this.hass, l)}`}
              @click=${() => {
      const d = { ...e.exceptions };
      delete d[l], this._patch({ exceptions: d });
    }}><ha-icon icon="mdi:delete"></ha-icon></button>
          </div>
          <wp-setpoint-editor .hass=${this.hass} entity-id=${l} .value=${c} state-only
            @wp-change=${(d) => {
      d.stopPropagation(), this._patch({ exceptions: { ...e.exceptions, [l]: d.detail } });
    }}></wp-setpoint-editor>
        </div>`)}
      <wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("mode_add_exception")} .domains=${i}
        .exclude=${Object.keys(e.exceptions ?? {})}
        @wp-change=${(l) => {
      l.stopPropagation(), l.detail && this._patch({ exceptions: { ...e.exceptions, [l.detail]: structuredClone(e.value) } });
    }}></wp-entity-picker>
      ${this._error ? a`<p class="error" role="alert">${this._error}</p>` : p}
    `;
  }
  render() {
    if (!this.data) return p;
    const e = this._edit;
    return a`
      <wp-dialog open wide heading=${e ? e.id ? this._tr("mode_edit") : this._tr("mode_new") : this._tr("modes")}>
        ${e ? this._renderForm(e) : this._renderList()}
        ${e ? a`<button slot="footer" class="btn" @click=${() => {
      this._edit = void 0, this._error = "";
    }}>${this._tr("cancel")}</button>
              <button slot="footer" class="btn primary" ?disabled=${this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>` : a`<button slot="footer" class="btn" @click=${() => {
      var t, i;
      return (i = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : i.close();
    }}>${this._tr("close")}</button>`}
      </wp-dialog>`;
  }
};
G.styles = [
  lt,
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
dt([
  f({ attribute: !1 })
], G.prototype, "hass", 2);
dt([
  f({ attribute: !1 })
], G.prototype, "data", 2);
dt([
  g()
], G.prototype, "_type", 2);
dt([
  g()
], G.prototype, "_edit", 2);
dt([
  g()
], G.prototype, "_rep", 2);
dt([
  g()
], G.prototype, "_error", 2);
dt([
  g()
], G.prototype, "_confirmId", 2);
dt([
  g()
], G.prototype, "_saving", 2);
G = dt([
  W("wp-modes-editor")
], G);
var Os = Object.defineProperty, Ds = Object.getOwnPropertyDescriptor, pt = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Ds(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Os(t, i, n), n;
};
let X = class extends D {
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = ns(this.hass, (t) => {
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
  /** Resolved slots (sun times, ignored slots) for the next occurrence of each weekday. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = {}, t = /* @__PURE__ */ new Date(), i = [];
    for (const s of ti(this._data, this._config))
      for (let n = 0; n < 7; n++) {
        const o = new Date(t.getTime() + n * 864e5), r = mt(o, this._tz), l = Ae(o, this._tz);
        i.push(
          this.hass.callWS({ type: "weekly_planner/preview", program_id: s.id, date: r }).then((c) => {
            e[`${s.id}|${l}`] = c.slots;
          }).catch(() => {
          })
        );
      }
    await Promise.all(i), this._preview = e;
  }
  /** Spans of a program for a weekday (0 = Monday); today uses resolved sun times. */
  _spans(e, t, i) {
    const s = this._data, n = Tt(e, s), o = (c) => At(c, e, s.modes, this._lang), r = [];
    for (const { slot: c, end: d } of le(n.days[(t + 6) % 7]))
      r.push({ start: 0, end: d, color: ot(c, e, s.modes), label: o(c) });
    const l = this._preview[`${e.id}|${t}`];
    for (const c of n.days[t]) {
      const d = l == null ? void 0 : l.find((b) => b.slot_id === c.id);
      let u = M(c.start), _ = M(c.end ?? null);
      if (d && (u = xt(d.start, this._tz), _ = d.end ? xt(d.end, this._tz) : null), u === null) continue;
      const v = _ === null ? u + 10 : _ > u ? _ : C;
      r.push({
        start: u,
        end: v,
        color: ot(c, e, s.modes),
        label: o(c),
        sun: "sun" in c.start || !!(c.end && "sun" in c.end),
        ignored: (d == null ? void 0 : d.ignored) ?? null
      });
    }
    return r;
  }
  _summary(e) {
    const t = this._data, i = t.status[e.id], s = Tt(e, t), n = i ? Object.values(i.current_slots)[0] : void 0, o = n ? s.days.flat().find((c) => c.id === n) : void 0, r = o ? pe(o, e, t.modes) : void 0, l = e.entities.filter((c) => {
      var d;
      return (d = t.entities[c.entity_id]) == null ? void 0 : d.override;
    });
    return { status: i, slot: o, mode: r, overridden: l };
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
    if (!this._config || !this.hass) return p;
    const e = this._lang, t = R(e), i = this._data, s = i ? ti(i, this._config) : [], n = Ae(this._now, this._tz), o = xt(this._now, this._tz);
    return a`
      <ha-card>
        <div class="head">
          <h1>${this._config.title ?? t.title}</h1>
          ${i != null && i.vacation ? a`<span class="chip warn"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${t.vacation}</span>` : p}
          ${i != null && i.can_edit && !this._config.program ? a`<button class="ghost" @click=${() => this._dialog = { kind: "modes" }}>${t.modes}</button>
                <button class="ghost" @click=${() => this._dialog = { kind: "program" }}><ha-icon icon="mdi:plus"></ha-icon> ${t.new_program}</button>` : p}
        </div>
        ${this._error ? a`<div class="error">${E(e, "error", { message: this._error })}</div>` : p}
        ${i != null && i.read_only ? a`<div class="error">${t.read_only}</div>` : p}
        ${i ? p : a`<div class="empty">…</div>`}
        ${i && !s.length ? a`<div class="empty">${t.no_program}</div>` : p}
        ${s.map((r) => this._renderProgram(r, n, o))}
        ${s.length && !this._config.program ? a`<button class="link" @click=${() => this._showWeek = !this._showWeek}>
              ${this._showWeek ? t.hide_week : t.show_week}</button>` : p}
      </ha-card>
      ${this._renderDialog()}
    `;
  }
  _renderProgram(e, t, i) {
    var w, nt, m;
    const s = this._lang, n = R(s), o = this._data, { status: r, slot: l, mode: c, overridden: d } = this._summary(e), u = r != null && r.next_change ? Qe(r.next_change, this._tz, s, this._now) : null, _ = this._defaultMode(e), v = this._showWeek || !!this._config.program, b = Tt(e, o);
    return a`
      <section class="program ${e.enabled ? "" : "off"}">
        <div class="row">
          <div class="name">
            <span class="title">${e.name}</span>
            ${e.profiles.length > 1 ? a`<span class="chip">${b.name}</span>` : p}
          </div>
          <label class="switch" title=${e.enabled ? "On" : "Off"}>
            <input type="checkbox" .checked=${e.enabled}
              @change=${(k) => this._toggle(e, k.target.checked)} />
            <span></span>
          </label>
        </div>
        <div class="state">
          ${this._effective(e) ? a`<span class="pill override">${this._effective(e)}</span>` : c ? a`<span class="pill" style="--c:${c.color}">${c.name}</span>` : l ? a`<span class="pill" style="--c:${ot(l, e, o.modes)}">${At(l, e, o.modes, s)}</span>` : _ && e.enabled && !o.vacation ? a`<span class="pill" style="--c:${_.color}">${_.name}</span>` : a`<span class="pill neutral">${e.enabled ? n.off_slot : "—"}</span>`}
          <span class="muted">${u ? E(s, "until", { time: u }) : n.no_change}</span>
          ${r != null && r.skip_next ? a`<span class="chip">${n.skip_planned}</span>` : p}
        </div>
        ${d.length ? a`<div class="warn-row"><ha-icon icon="mdi:alert"></ha-icon> ${d.length > 1 ? `${d.length} × ` : ""}${this._overrideText(d[0].entity_id)}
              <button class="small" @click=${() => this._resume(e)}>${n.resume}</button></div>` : p}
        ${(((w = o.warnings) == null ? void 0 : w[e.id]) ?? []).length && o.can_edit ? a`<details class="warnings"><summary><ha-icon icon="mdi:alert"></ha-icon> ${(((nt = o.warnings) == null ? void 0 : nt[e.id]) ?? []).length}</summary>
              ${(((m = o.warnings) == null ? void 0 : m[e.id]) ?? []).map((k) => a`<div>${this._warning(k)}</div>`)}</details>` : p}
        <wp-day-bar .spans=${this._spans(e, t, !0)} .now=${i} show-hours
          @click=${() => this._dialog = { kind: "day", program: e, day: t }}></wp-day-bar>
        ${v ? a`<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(
      (k) => a`<button class="day" @click=${() => this._dialog = { kind: "day", program: e, day: k }}>
                <span class=${k === t ? "today" : ""}>${n.days_short[k]}</span>
                <wp-day-bar thin .spans=${this._spans(e, k, k === t)}
                  .now=${k === t ? i : null}></wp-day-bar></button>`
    )}</div>` : p}
        <div class="actions">
          <button class="small" @click=${() => this._dialog = { kind: "override", program: e }}>${n.override}</button>
          ${o.can_edit ? a`<button class="small ghost" @click=${() => this._dialog = { kind: "program", program: e }}><ha-icon icon="mdi:pencil"></ha-icon> ${n.edit}</button>` : p}
        </div>
      </section>
    `;
  }
  _warning(e) {
    var n;
    const t = ((n = this.hass.states[e.entity_id]) == null ? void 0 : n.attributes.friendly_name) ?? e.entity_id, i = `warn_${e.code}`;
    return R(this._lang)[i] ? E(this._lang, i, { entity: t, detail: e.detail }) : `${t}: ${e.code}`;
  }
  /** Setpoint of a voluntary override on the program's first entity, shown instead of the plan. */
  _effective(e) {
    var s, n;
    const t = (s = e.entities[0]) == null ? void 0 : s.entity_id, i = t ? (n = this._data.entities[t]) == null ? void 0 : n.override : void 0;
    return (i == null ? void 0 : i.origin) === "voluntary" && i.setpoint ? re(this._lang, i.setpoint) : void 0;
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
    return (t == null ? void 0 : t.origin) === "voluntary" && t.until ? E(this._lang, "overridden_until", { time: Qe(t.until, this._tz, this._lang, this._now) }) : E(this._lang, "overridden");
  }
  _renderDialog() {
    var i;
    const e = this._dialog;
    if (!e || !this._data) return p;
    const t = () => this._dialog = null;
    switch (e.kind) {
      case "day":
        return a`<wp-day-view .hass=${this.hass} .data=${this._data} .program=${e.program} .day=${e.day}
          .showChart=${this._config.show_chart !== !1}
          @closed=${t}
          @edit-day=${(s) => this._dialog = { kind: "program", program: e.program, ...s.detail }}></wp-day-view>`;
      case "program":
        return a`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((i = this._config.filter) == null ? void 0 : i.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "override":
        return a`<wp-override-dialog .hass=${this.hass} .data=${this._data} .program=${e.program}
          @closed=${t}></wp-override-dialog>`;
      case "modes":
        return a`<wp-modes-editor .hass=${this.hass} .data=${this._data} @closed=${t}></wp-modes-editor>`;
    }
  }
};
X.styles = V`
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
    .pill.override {
      background: repeating-linear-gradient(135deg, var(--warning-color, #ff9800) 0 6px, #e68900 6px 12px);
    }
    .pill.neutral { background: var(--secondary-background-color); color: var(--primary-text-color); text-shadow: none; }
    .muted { color: var(--secondary-text-color); font-size: 13px; }
    .chip {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px;
      font-size: 12px; padding: 1px 8px; border-radius: 10px; background: var(--secondary-background-color);
    }
    .chip.warn { background: var(--warning-color, #ff9800); color: #fff; }
    .warnings { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px; }
    .warnings summary { cursor: pointer; display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 20px; }
    .warn-row { --mdc-icon-size: 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 8px; }
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
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 20px;
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
pt([
  f({ attribute: !1 })
], X.prototype, "hass", 2);
pt([
  g()
], X.prototype, "_config", 2);
pt([
  g()
], X.prototype, "_data", 2);
pt([
  g()
], X.prototype, "_error", 2);
pt([
  g()
], X.prototype, "_dialog", 2);
pt([
  g()
], X.prototype, "_showWeek", 2);
pt([
  g()
], X.prototype, "_preview", 2);
pt([
  g()
], X.prototype, "_now", 2);
X = pt([
  W("weekly-planner-card")
], X);
var Ts = Object.defineProperty, js = Object.getOwnPropertyDescriptor, he = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? js(t, i) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (s ? r(t, i, n) : r(n)) || n);
  return s && n && Ts(t, i, n), n;
};
const zs = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let It = class extends D {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return at(this.hass);
  }
  _tr(e, t) {
    return E(this._lang, e, t);
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
    return a`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(n) => this._set("title", n.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? a`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(n) => this._set("program", n.target.value)}>
              ${this._programs.length === 0 ? a`<option value="">${this._tr("no_program")}</option>` : p}
              ${!this._programs.some((n) => n.id === e.program) && e.program ? a`<option value=${e.program} selected>${e.program}</option>` : p}
              ${this._programs.map((n) => a`<option value=${n.id} ?selected=${n.id === e.program}>${n.name}</option>`)}
            </select></div>` : a`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${zs.map((n) => a`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(n)}
                @change=${(o) => this._setFilter({ types: o.target.checked ? [...t, n] : t.filter((r) => r !== n) })} />
                ${de(this._lang, n)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((s = e.filter) == null ? void 0 : s.area) ?? ""} placeholder="bureau"
                @input=${(n) => this._setFilter({ area: n.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${!!e.show_week}
        @change=${(n) => this._set("show_week", n.target.checked)} /> ${this._tr("ce_show_week")}</label>
      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(n) => this._set("show_chart", n.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
It.styles = [lt, V`:host { display: block; padding: 4px 0; }`];
he([
  f({ attribute: !1 })
], It.prototype, "hass", 2);
he([
  g()
], It.prototype, "_config", 2);
he([
  g()
], It.prototype, "_programs", 2);
It = he([
  W("weekly-planner-card-editor")
], It);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
