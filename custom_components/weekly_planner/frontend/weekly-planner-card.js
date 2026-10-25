/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis, Je = _e.ShadowRoot && (_e.ShadyCSS === void 0 || _e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ke = Symbol(), ds = /* @__PURE__ */ new WeakMap();
let Ns = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Ke) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Je && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = ds.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ds.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Is = (e) => new Ns(typeof e == "string" ? e : e + "", void 0, Ke), H = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, o, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[n + 1], e[0]);
  return new Ns(s, e, Ke);
}, ci = (e, t) => {
  if (Je) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), o = _e.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, e.appendChild(i);
  }
}, ps = Je ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Is(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: di, defineProperty: pi, getOwnPropertyDescriptor: hi, getOwnPropertyNames: ui, getOwnPropertySymbols: _i, getPrototypeOf: mi } = Object, ft = globalThis, hs = ft.trustedTypes, fi = hs ? hs.emptyScript : "", Pe = ft.reactiveElementPolyfillSupport, Kt = (e, t) => e, me = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? fi : null;
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
} }, Ge = (e, t) => !di(e, t), us = { attribute: !0, type: String, converter: me, reflect: !1, useDefault: !1, hasChanged: Ge };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ft.litPropertyMetadata ?? (ft.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let zt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = us) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, s);
      o !== void 0 && pi(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: o, set: n } = hi(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? us;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Kt("elementProperties"))) return;
    const t = mi(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Kt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Kt("properties"))) {
      const s = this.properties, i = [...ui(s), ..._i(s)];
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
      for (const o of i) s.unshift(ps(o));
    } else t !== void 0 && s.push(ps(t));
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
    return ci(t, this.constructor.elementStyles), t;
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
      const r = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : me).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var n, r;
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const a = i.getPropertyOptions(o), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : me;
      this._$Em = o;
      const h = c.fromAttribute(s, a.type);
      this[o] = h ?? ((r = this._$Ej) == null ? void 0 : r.get(o)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, o = !1, n) {
    var r;
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (n = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Ge)(n, s) || i.useDefault && i.reflect && n === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
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
zt.elementStyles = [], zt.shadowRootOptions = { mode: "open" }, zt[Kt("elementProperties")] = /* @__PURE__ */ new Map(), zt[Kt("finalized")] = /* @__PURE__ */ new Map(), Pe == null || Pe({ ReactiveElement: zt }), (ft.reactiveElementVersions ?? (ft.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = globalThis, _s = (e) => e, fe = Gt.trustedTypes, ms = fe ? fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Rs = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, Us = "?" + _t, yi = `<${Us}>`, Pt = document, Xt = () => Pt.createComment(""), Zt = (e) => e === null || typeof e != "object" && typeof e != "function", Ye = Array.isArray, gi = (e) => Ye(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", Me = `[ 	
\f\r]`, Bt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fs = /-->/g, ys = />/g, vt = RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), gs = /'/g, vs = /"/g, Fs = /^(?:script|style|textarea|title)$/i, Ls = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = Ls(1), ot = Ls(2), Rt = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), bs = /* @__PURE__ */ new WeakMap(), $t = Pt.createTreeWalker(Pt, 129);
function qs(e, t) {
  if (!Ye(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ms !== void 0 ? ms.createHTML(t) : t;
}
const vi = (e, t) => {
  const s = e.length - 1, i = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = Bt;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, u, m = -1, b = 0;
    for (; b < c.length && (r.lastIndex = b, u = r.exec(c), u !== null); ) b = r.lastIndex, r === Bt ? u[1] === "!--" ? r = fs : u[1] !== void 0 ? r = ys : u[2] !== void 0 ? (Fs.test(u[2]) && (o = RegExp("</" + u[2], "g")), r = vt) : u[3] !== void 0 && (r = vt) : r === vt ? u[0] === ">" ? (r = o ?? Bt, m = -1) : u[1] === void 0 ? m = -2 : (m = r.lastIndex - u[2].length, h = u[1], r = u[3] === void 0 ? vt : u[3] === '"' ? vs : gs) : r === vs || r === gs ? r = vt : r === fs || r === ys ? r = Bt : (r = vt, o = void 0);
    const g = r === vt && e[a + 1].startsWith("/>") ? " " : "";
    n += r === Bt ? c + yi : m >= 0 ? (i.push(h), c.slice(0, m) + Rs + c.slice(m) + _t + g) : c + _t + (m === -2 ? a : g);
  }
  return [qs(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Qt {
  constructor({ strings: t, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const a = t.length - 1, c = this.parts, [h, u] = vi(t, s);
    if (this.el = Qt.createElement(h, i), $t.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (o = $t.nextNode()) !== null && c.length < a; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const m of o.getAttributeNames()) if (m.endsWith(Rs)) {
          const b = u[r++], g = o.getAttribute(m).split(_t), f = /([.?@])?(.*)/.exec(b);
          c.push({ type: 1, index: n, name: f[2], strings: g, ctor: f[1] === "." ? $i : f[1] === "?" ? wi : f[1] === "@" ? xi : be }), o.removeAttribute(m);
        } else m.startsWith(_t) && (c.push({ type: 6, index: n }), o.removeAttribute(m));
        if (Fs.test(o.tagName)) {
          const m = o.textContent.split(_t), b = m.length - 1;
          if (b > 0) {
            o.textContent = fe ? fe.emptyScript : "";
            for (let g = 0; g < b; g++) o.append(m[g], Xt()), $t.nextNode(), c.push({ type: 2, index: ++n });
            o.append(m[b], Xt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Us) c.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = o.data.indexOf(_t, m + 1)) !== -1; ) c.push({ type: 7, index: n }), m += _t.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const i = Pt.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Ut(e, t, s = e, i) {
  var r, a;
  if (t === Rt) return t;
  let o = i !== void 0 ? (r = s._$Co) == null ? void 0 : r[i] : s._$Cl;
  const n = Zt(t) ? void 0 : t._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== n && ((a = o == null ? void 0 : o._$AO) == null || a.call(o, !1), n === void 0 ? o = void 0 : (o = new n(e), o._$AT(e, s, i)), i !== void 0 ? (s._$Co ?? (s._$Co = []))[i] = o : s._$Cl = o), o !== void 0 && (t = Ut(e, o._$AS(e, t.values), o, i)), t;
}
class bi {
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
    const { el: { content: s }, parts: i } = this._$AD, o = ((t == null ? void 0 : t.creationScope) ?? Pt).importNode(s, !0);
    $t.currentNode = o;
    let n = $t.nextNode(), r = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let h;
        c.type === 2 ? h = new ie(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new ki(n, this, t)), this._$AV.push(h), c = i[++a];
      }
      r !== (c == null ? void 0 : c.index) && (n = $t.nextNode(), r++);
    }
    return $t.currentNode = Pt, o;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class ie {
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
    t = Ut(this, t, s), Zt(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== Rt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : gi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && Zt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Pt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: s, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Qt.createElement(qs(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === o) this._$AH.p(s);
    else {
      const r = new bi(o, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = bs.get(t.strings);
    return s === void 0 && bs.set(t.strings, s = new Qt(t)), s;
  }
  k(t) {
    Ye(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const n of t) o === s.length ? s.push(i = new ie(this.O(Xt()), this.O(Xt()), this, this.options)) : i = s[o], i._$AI(n), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, s); t !== this._$AB; ) {
      const o = _s(t).nextSibling;
      _s(t).remove(), t = o;
    }
  }
  setConnected(t) {
    var s;
    this._$AM === void 0 && (this._$Cv = t, (s = this._$AP) == null || s.call(this, t));
  }
}
class be {
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
    if (n === void 0) t = Ut(this, t, s, 0), r = !Zt(t) || t !== this._$AH && t !== Rt, r && (this._$AH = t);
    else {
      const a = t;
      let c, h;
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Ut(this, a[i + c], s, c), h === Rt && (h = this._$AH[c]), r || (r = !Zt(h) || h !== this._$AH[c]), h === p ? t = p : t !== p && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
    }
    r && !o && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class $i extends be {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class wi extends be {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class xi extends be {
  constructor(t, s, i, o, n) {
    super(t, s, i, o, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Ut(this, t, s, 0) ?? p) === Rt) return;
    const i = this._$AH, o = t === p && i !== p || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== p && (i === p || o);
    o && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ki {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ut(this, t);
  }
}
const Oe = Gt.litHtmlPolyfillSupport;
Oe == null || Oe(Qt, ie), (Gt.litHtmlVersions ?? (Gt.litHtmlVersions = [])).push("3.3.3");
const Si = (e, t, s) => {
  const i = (s == null ? void 0 : s.renderBefore) ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const n = (s == null ? void 0 : s.renderBefore) ?? null;
    i._$litPart$ = o = new ie(t.insertBefore(Xt(), n), n, void 0, s ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = globalThis;
let M = class extends zt {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Si(s, this.renderRoot, this.renderOptions);
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
    return Rt;
  }
};
var js;
M._$litElement$ = !0, M.finalized = !0, (js = kt.litElementHydrateSupport) == null || js.call(kt, { LitElement: M });
const De = kt.litElementPolyfillSupport;
De == null || De({ LitElement: M });
(kt.litElementVersions ?? (kt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ai = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Ei = class {
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
const Ci = {}, Pi = (e, t = Ci) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ws = Ai(class extends Ei {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (Pi(e), this.key = t), s;
  }
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Mi = { attribute: !0, type: String, converter: me, reflect: !1, hasChanged: Ge }, Oi = (e = Mi, t, s) => {
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
function y(e) {
  return (t, s) => typeof s == "object" ? Oi(e, t, s) : ((i, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(e) {
  return y({ ...e, state: !0, attribute: !1 });
}
const I = 5, A = 1440;
function K(e) {
  const [t, s] = e.split(":").map(Number);
  return t * 60 + s;
}
function J(e) {
  const t = Math.max(0, Math.min(A, Math.round(e / I) * I));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function Nt(e, t) {
  var r, a;
  const s = typeof e == "string" ? new Date(e) : e, i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(s), o = Number(((r = i.find((c) => c.type === "hour")) == null ? void 0 : r.value) ?? 0), n = Number(((a = i.find((c) => c.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return o * 60 + n;
}
function Ie(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(s);
}
function wt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function L(e) {
  return !e || !("time" in e) ? null : K(e.time);
}
function Di(e, t) {
  const s = (t == null ? void 0 : t.start) ?? L(e.start) ?? 0, i = t ? t.end : L(e.end ?? null);
  return i == null ? [[s, Math.min(A, s + I)]] : i > s ? [[s, i]] : [[s, A]];
}
function Xe(e) {
  const t = [];
  for (const s of e) {
    const i = L(s.start), o = L(s.end ?? null);
    i !== null && o !== null && o <= i && o < 720 && t.push({ slot: s, end: o });
  }
  return t;
}
function Hs(e, t) {
  const s = (Math.round(t) % A + A) % A, i = Math.floor(s / 60), o = s % 60;
  if (e.toLowerCase().startsWith("fr")) return o ? `${i} h ${String(o).padStart(2, "0")}` : `${i} h`;
  const n = new Date(Date.UTC(2e3, 0, 1, i, o)), r = { timeZone: "UTC", hour: "numeric" };
  return o && (r.minute = "2-digit"), new Intl.DateTimeFormat(e, r).format(n).replace(/\s?(AM|PM)/, (a, c) => ` ${c.toLowerCase()}`);
}
function $s(e, t, s, i = /* @__PURE__ */ new Date()) {
  const o = new Date(e), n = wt(o, t) === wt(i, t), r = Hs(s, Nt(o, t));
  return n ? r : wt(new Date(i.getTime() + 864e5), t) === wt(o, t) ? `${new Intl.RelativeTimeFormat(s, { numeric: "auto" }).format(1, "day")} ${r}` : `${new Intl.DateTimeFormat(s, { timeZone: t, weekday: "short" }).format(o)} ${r}`;
}
var Ti = Object.defineProperty, zi = Object.getOwnPropertyDescriptor, Ot = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? zi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Ti(t, s, o), o;
};
let nt = class extends M {
  constructor() {
    super(...arguments), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this.notches = !1, this._width = 0;
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
  /** A label is only drawn when its span is wide enough for it (never cut off). */
  _fits(e) {
    const t = this.now !== null && this.now >= e.start - 20 && this.now <= e.end + 20, s = Math.max(40, e.label.length * 7 + (e.sun ? 18 : 0) + 14);
    return !this.thin && !t && this._width > 0 && (e.end - e.start) / A * this._width >= s;
  }
  render() {
    const e = (t) => `${t / A * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.notches ? [6, 12, 18].map((t) => l`<i class="tick" style="left:${e(t * 60)}"></i>`) : p}
        ${this.spans.map(
      (t) => l`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${this._fits(t) ? l`<span>${t.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : p}${t.label}</span>` : p}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${e(this.now)}"></div>` : p}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 6, 12, 18, 24].map((t) => l`<span style="left:${e(t * 60)}">${t} h</span>`)}</div>` : p}
    `;
  }
};
nt.styles = H`
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
Ot([
  y({ attribute: !1 })
], nt.prototype, "spans", 2);
Ot([
  y({ type: Number })
], nt.prototype, "now", 2);
Ot([
  y({ type: Boolean })
], nt.prototype, "thin", 2);
Ot([
  y({ type: Boolean, attribute: "show-hours" })
], nt.prototype, "showHours", 2);
Ot([
  y({ type: Boolean })
], nt.prototype, "notches", 2);
Ot([
  w()
], nt.prototype, "_width", 2);
nt = Ot([
  F("wp-day-bar")
], nt);
var ji = Object.defineProperty, Ni = Object.getOwnPropertyDescriptor, $e = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ni(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && ji(t, s, o), o;
};
let Ft = class extends M {
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
Ft.styles = H`
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
$e([
  y()
], Ft.prototype, "heading", 2);
$e([
  y({ type: Boolean, reflect: !0 })
], Ft.prototype, "open", 2);
$e([
  y({ type: Boolean })
], Ft.prototype, "wide", 2);
Ft = $e([
  F("wp-dialog")
], Ft);
const Ii = {
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
  pe_icon: "Icon",
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
  err_service_end: "This action runs once: it has no end.",
  hours: "Schedule",
  paused: "Paused",
  cancel_manual: "Cancel the manual setting",
  settings: "Settings",
  all_programs: "All schedules",
  today_short: "Today",
  apply_other_days: "Apply to other days",
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
  yes: "Yes",
  no: "No",
  running: "On",
  stopped: "Off",
  rest_none_short: "None",
  rest_previous_short: "Before",
  add_param: "+ {name}"
}, Ri = {
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
  pe_icon: "Icône",
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
  err_service_end: "Cette action se fait une fois : elle n'a pas de fin.",
  hours: "Horaires",
  paused: "En pause",
  cancel_manual: "Annuler le réglage manuel",
  settings: "Réglages",
  all_programs: "Tous les horaires",
  today_short: "Auj.",
  apply_other_days: "Appliquer à d'autres jours",
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
  yes: "Oui",
  no: "Non",
  running: "En marche",
  stopped: "À l'arrêt",
  rest_none_short: "Rien",
  rest_previous_short: "Avant",
  add_param: "+ {name}"
};
function B(e) {
  return e.startsWith("fr") ? Ri : Ii;
}
function d(e, t, s = {}) {
  let i = B(e)[t];
  for (const [o, n] of Object.entries(s)) i = i.replace(`{${o}}`, n);
  return i;
}
var Ui = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Fi(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Ui(t, s, o), o;
};
const et = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, Jt = (e) => e === "input_boolean" ? "switch" : e;
function Ze(e, t) {
  const s = B(e)[`type_${t}`];
  return typeof s == "string" ? s : t;
}
const st = H`
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
function Qe(e, t, s) {
  e.dispatchEvent(new CustomEvent(t, { detail: s, bubbles: !0, composed: !0 }));
}
function ws(e, t) {
  if (!t) return "";
  const s = t, i = (o) => d(e, `sp_${o}`);
  switch (t.kind) {
    case "preset":
      return `${Le(e, String(s.preset))}${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
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
let rt = class extends M {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(E(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Qe(this, "wp-change", e);
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
        ${this.label ? l`<label>${this.label}</label>` : p}
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
          ${e.map((t) => l`<option value=${t}>${St(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
rt.styles = [st, H`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
z([
  y({ attribute: !1 })
], rt.prototype, "hass", 2);
z([
  y()
], rt.prototype, "value", 2);
z([
  y()
], rt.prototype, "label", 2);
z([
  y({ attribute: !1 })
], rt.prototype, "domains", 2);
z([
  y({ attribute: !1 })
], rt.prototype, "exclude", 2);
z([
  y({ attribute: !1 })
], rt.prototype, "filter", 2);
rt = z([
  F("wp-entity-picker")
], rt);
let te = class extends M {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e) {
    return d(this._lang, e);
  }
  _set(e) {
    Qe(this, "wp-change", e);
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
te.styles = st;
z([
  y({ attribute: !1 })
], te.prototype, "hass", 2);
z([
  y({ attribute: !1 })
], te.prototype, "conditions", 2);
te = z([
  F("wp-conditions-editor")
], te);
const Bs = {
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
}, Li = ["scene", "script", "action"];
function Vs(e, t) {
  const s = Bs[E(t)];
  return Re(e, t, s ? s[0] : "action");
}
function Re(e, t, s) {
  var o, n, r, a, c, h;
  const i = ((o = e == null ? void 0 : e.states[t]) == null ? void 0 : o.attributes) ?? {};
  switch (s) {
    case "preset":
      return { kind: s, preset: ((n = i.preset_modes) == null ? void 0 : n[0]) ?? "" };
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
let tt = class extends M {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
  }
  get _domain() {
    return E(this.entityId);
  }
  get _attrs() {
    var e, t;
    return ((t = (e = this.hass) == null ? void 0 : e.states[this.entityId]) == null ? void 0 : t.attributes) ?? {};
  }
  _kinds() {
    var o;
    const e = Bs[this._domain] ?? [], t = !this.stateOnly && this.admin ? Li : [], s = (o = this.value) == null ? void 0 : o.kind, i = [...e, ...t];
    return s && !i.includes(s) && i.push(s), i;
  }
  _current() {
    return this.value ?? Re(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [s, i] of Object.entries(e))
      s !== "kind" && i !== void 0 && i !== "" && !(typeof i == "number" && Number.isNaN(i)) && (t[s] = i);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), Qe(this, "wp-change", t);
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
          ${i ? l`<option value="" ?selected=${r === ""}>—</option>` : p}
          ${!a.includes(r) && r ? l`<option value=${r} selected>${r}</option>` : p}
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
        return this._domain === "light" ? l`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", t.effect_list, !0)}` : this._domain === "fan" ? this._number("f_percentage", "percentage", 1, 100, 1, "%") : p;
      case "auto":
        return l`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${e.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(s) => s.startsWith("switch.adaptive_lighting")}
              @wp-change=${(s) => {
          s.stopPropagation(), this._patch({ adaptive_switch: s.detail || void 0 });
        }}></wp-entity-picker>
            ${e.adaptive_switch ? l`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : p}</div>
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
        return p;
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
        ${this._jsonError ? l`<span class="error">${this._tr("f_json_invalid")}</span>` : p}</div>
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
          @change=${(s) => this._emit(Re(this.hass, this.entityId, s.target.value))}>
          ${e.map((s) => l`<option value=${s} ?selected=${s === t.kind}>${this._tr(`sp_${s}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
tt.styles = st;
z([
  y({ attribute: !1 })
], tt.prototype, "hass", 2);
z([
  y({ attribute: "entity-id" })
], tt.prototype, "entityId", 2);
z([
  y({ attribute: !1 })
], tt.prototype, "value", 2);
z([
  y({ type: Boolean })
], tt.prototype, "admin", 2);
z([
  y({ type: Boolean, attribute: "state-only" })
], tt.prototype, "stateOnly", 2);
z([
  w()
], tt.prototype, "_json", 2);
z([
  w()
], tt.prototype, "_jsonError", 2);
tt = z([
  F("wp-setpoint-editor")
], tt);
let de, bt;
const pe = /* @__PURE__ */ new Set();
function qi(e, t) {
  return pe.add(t), de && t(de), bt || (bt = e.connection.subscribeMessage(
    (s) => {
      de = s, pe.forEach((i) => i(s));
    },
    { type: "weekly_planner/subscribe" }
  ), bt.catch(() => {
    bt = void 0;
  })), () => {
    pe.delete(t), pe.size === 0 && bt && (bt.then((s) => s()).catch(() => {
    }), bt = void 0, de = void 0);
  };
}
const E = (e) => e.split(".")[0];
function Ue(e) {
  var t;
  return e.main_type || E(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function jt(e, t) {
  var i;
  const s = ((i = t.status[e.id]) == null ? void 0 : i.active_profile) ?? e.active_profile;
  return e.profiles.find((o) => o.id === s) ?? e.profiles[0];
}
function ts(e, t, s) {
  const i = e.actions.by_type[Ue(t)] ?? Object.values(e.actions.by_type)[0];
  return s.find((o) => o.id === i);
}
function ye(e, t, s) {
  var i;
  return e.color || ((i = ts(e, t, s)) == null ? void 0 : i.color) || "var(--secondary-text-color)";
}
function Fe(e, t, s, i) {
  const o = ts(e, t, s);
  if (o) return o.name;
  const n = t.entities.map((r) => e.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return n.length ? n.length > 1 ? `${ws(i, n[0])} +${n.length - 1}` : ws(i, n[0]) : "";
}
function St(e, t) {
  var s;
  return ((s = e.states[t]) == null ? void 0 : s.attributes.friendly_name) ?? t;
}
function xs(e, t) {
  var o, n;
  if (t.program) return e.programs.filter((r) => r.id === t.program);
  const s = (o = t.filter) == null ? void 0 : o.types, i = (n = t.filter) == null ? void 0 : n.area;
  return e.programs.filter((r) => !(s != null && s.length) || r.entities.some((a) => s.includes(E(a.entity_id)))).filter((r) => !i || r.area === i).sort((r, a) => r.priority - a.priority || r.name.localeCompare(a.name));
}
function mt() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function ee(e, t) {
  return new Intl.NumberFormat(e, { maximumFractionDigits: 1 }).format(t);
}
const Wi = (e, t) => `${ee(e, t)} °C`;
function Le(e, t) {
  const s = B(e)[`preset_${t}`];
  return typeof s == "string" ? s : t;
}
const Ht = (e, t) => {
  var s;
  return ((s = e.exceptions) == null ? void 0 : s[t]) ?? e.value;
}, xt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function es(e, t, s) {
  var o, n, r;
  const i = ((o = e.states[t]) == null ? void 0 : o.attributes) ?? {};
  return xt((n = i.preset_temperatures) == null ? void 0 : n[s]) ?? xt((r = i.preset_temperatures) == null ? void 0 : r[`${s}_temp`]) ?? xt(i[`${s}_temp`]) ?? xt(i[`${s}_temperature`]);
}
function Hi(e, t, s) {
  const i = Ht(t, s);
  return i.kind === "temperature" ? xt(i.temperature) : i.kind === "preset" ? es(e, s, String(i.preset)) : null;
}
function Bi(e, t, s, i) {
  const o = Ht(s, i), n = Hi(e, s, i);
  return n !== null ? Wi(t, n) : o.kind === "position" && xt(o.position) !== null ? `${o.position} %` : o.kind === "on" && xt(o.brightness) !== null ? `${o.brightness} %` : "";
}
async function Js() {
  var e, t, s;
  if (customElements.get("ha-selector")) return !0;
  try {
    const i = await ((e = window.loadCardHelpers) == null ? void 0 : e.call(window)), o = await (i == null ? void 0 : i.createCardElement({ type: "button", entity: "sun.sun" }));
    await ((s = (t = o == null ? void 0 : o.constructor) == null ? void 0 : t.getConfigElement) == null ? void 0 : s.call(t)), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((n) => setTimeout(n, 3e3))]);
  } catch {
  }
  return !!customElements.get("ha-selector");
}
const Vi = ["climate", "cover", "light", "switch", "input_boolean", "fan"], Ji = (e) => !Vi.includes(e), Lt = (e) => Ji(E(e)), Ki = /* @__PURE__ */ new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let qe;
const Te = /* @__PURE__ */ new Set();
async function ss(e, t) {
  const s = [...new Set(t)].filter((i) => !Te.has(i));
  if (!s.length || !e.loadBackendTranslation) return !1;
  s.forEach((i) => Te.add(i));
  try {
    const i = await Promise.all(s.map((o) => e.loadBackendTranslation("services", o)));
    return qe = i[i.length - 1] ?? qe, !0;
  } catch {
    return s.forEach((i) => Te.delete(i)), !1;
  }
}
function Ks(e, t) {
  for (const s of [e.localize, qe]) {
    const i = s == null ? void 0 : s(t);
    if (i) return i;
  }
  return "";
}
const Gs = (e, t) => {
  var o, n;
  const [s, i] = t.split(".");
  return (n = (o = e.services) == null ? void 0 : o[s]) == null ? void 0 : n[i];
};
function Ys(e, t) {
  var o;
  const [s, i] = t.split(".");
  return Ks(e, `component.${s}.services.${i}.name`) || ((o = Gs(e, t)) == null ? void 0 : o.name) || t;
}
function Gi(e, t, s) {
  const i = Array.isArray(e) ? e : e ? [e] : [], o = Number((t == null ? void 0 : t.attributes.supported_features) ?? 0);
  return i.some((n) => {
    var a;
    return (n.domain === void 0 ? [] : Array.isArray(n.domain) ? n.domain : [n.domain]).includes(s) ? (a = n.supported_features) != null && a.length ? n.supported_features.some((c) => Array.isArray(c) ? c.every((h) => (o & h) === h) : (o & c) === c) : !0 : !1;
  });
}
function Xs(e, t) {
  const s = E(t), i = e.states[t], o = [];
  for (const [n, r] of Object.entries(e.services ?? {}))
    if (n !== "homeassistant")
      for (const [a, c] of Object.entries(r)) {
        if (!c.target) continue;
        const h = c.target.entity, u = !h || Array.isArray(h) && !h.length;
        if (!Gi(h, i, s) && !(n === s && u) || Object.values(c.fields ?? {}).some((g) => g.required && (!g.selector || "text" in g.selector || "object" in g.selector))) continue;
        const b = `${n}.${a}`;
        o.push({ id: b, domain: n, service: a, label: Ys(e, b) });
      }
  return o.sort((n, r) => n.label.localeCompare(r.label));
}
function Yi(e, t) {
  return [...new Set(Xs(e, t).map((s) => s.domain))];
}
function Xi(e, t) {
  var r;
  const [s, i] = t.split("."), o = [], n = (a) => {
    var c;
    for (const [h, u] of Object.entries(a ?? {})) {
      if (u.fields) {
        n(u.fields);
        continue;
      }
      u.advanced || Ki.has(h) || (c = u.selector) != null && c.target || o.push({
        key: h,
        selector: u.selector ?? { text: {} },
        required: !!u.required,
        label: Ks(e, `component.${s}.services.${i}.fields.${h}.name`) || u.name || h
      });
    }
  };
  return n((r = Gs(e, t)) == null ? void 0 : r.fields), [...o.filter((a) => a.required), ...o.filter((a) => !a.required)];
}
const Zi = /* @__PURE__ */ new Set(["avec", "de", "du", "à", "au", "with", "of", "the", "for", "on"]);
function Qi(e) {
  if (e.length < 3) return e;
  const t = e.map((n) => n.split(" ")), s = /* @__PURE__ */ new Map();
  for (const n of t) s.set(n[n.length - 1], (s.get(n[n.length - 1]) ?? 0) + 1);
  const [i, o] = [...s.entries()].sort((n, r) => r[1] - n[1])[0];
  return o < Math.ceil(e.length * 0.6) ? e : t.map((n, r) => {
    if (n.length < 2 || n[n.length - 1] !== i) return e[r];
    const a = n.slice(0, -1);
    for (; a.length > 1 && Zi.has(a[a.length - 1].toLowerCase()); ) a.pop();
    return a.join(" ");
  });
}
const Zs = " ", ge = (e) => e.replace(/ /g, Zs), At = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function It(e, t, s) {
  const i = e.actions.by_entity[t];
  if (i)
    return { sp: i };
  const o = e.actions.by_type[E(t)], n = s.find((r) => r.id === o);
  return n ? { sp: Ht(n, t), modeId: n.id } : null;
}
function to(e, t, s, i) {
  const o = E(s), n = { ...e.actions.by_type }, r = { ...e.actions.by_entity }, a = t.entities.filter((c) => E(c.entity_id) === o).length <= 1;
  return i.modeId && a ? (n[o] = i.modeId, delete r[s]) : (r[s] = i.sp, a && delete n[o]), { ...e, actions: { by_type: n, by_entity: r } };
}
function eo(e, t) {
  const s = e.default ?? { kind: "none" };
  if (s.kind === "mode") {
    const i = t.find((o) => o.id === s.value);
    if (i) return { sp: Ht(i, e.entity_id), modeId: i.id };
  }
  return s.kind === "setpoint" && s.value && typeof s.value == "object" ? { sp: s.value } : { sp: { kind: "off" }, special: s.kind === "previous" ? "previous" : "none" };
}
function so(e) {
  return e.special ? { kind: e.special } : e.modeId ? { kind: "mode", value: e.modeId } : { kind: "setpoint", value: e.sp };
}
const Et = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function se(e, t, s, i, o) {
  var h;
  const n = "sp" in o ? o : { sp: o }, r = n.sp, a = n.modeId ? s.find((u) => u.id === n.modeId) : void 0, c = E(i);
  switch (r.kind) {
    case "scene":
      return String(((h = e.states[String(r.scene)]) == null ? void 0 : h.attributes.friendly_name) ?? r.scene);
    case "service":
      return Ys(e, String(r.service));
    case "temperature":
      return `${ee(t, Number(r.temperature))} °C`;
    case "preset": {
      if (a) return a.name;
      const u = es(e, i, String(r.preset));
      return u !== null ? `${Le(t, String(r.preset))} ${ee(t, u)} °C` : Le(t, String(r.preset));
    }
    case "open":
      return d(t, "act_open");
    case "close":
      return d(t, "act_close");
    case "position":
      return `${r.position} %`;
    case "off":
      return c === "climate" ? d(t, "sp_off") : d(t, "act_off");
    case "on": {
      const u = [d(t, "act_on")];
      return Et(r.brightness) !== null && u.push(`${r.brightness} %`), r.effect && u.push(String(r.effect)), Et(r.color_temp_kelvin) !== null && u.push(`${r.color_temp_kelvin} K`), u.join(" ");
    }
    default:
      return (a == null ? void 0 : a.name) ?? String(r.kind);
  }
}
function io(e, t, s) {
  var n;
  const i = e.states[s];
  if (!i) return "?";
  if (i.state === "unavailable" || i.state === "unknown") return "—";
  const o = i.attributes;
  switch (E(s)) {
    case "climate": {
      if (i.state === "off") return d(t, "sp_off");
      const r = Et(o.temperature);
      return r !== null ? `${ee(t, r)} °C` : i.state;
    }
    case "cover": {
      const r = Et(o.current_position);
      return i.state === "open" && r !== null && r < 100 ? `${r} %` : i.state === "open" ? d(t, "sp_open") : i.state === "closed" ? d(t, "sp_close") : `${r ?? ""} %`;
    }
    case "light": {
      if (i.state !== "on") return d(t, "sp_off");
      const r = Et(o.brightness);
      return r !== null ? `${d(t, "sp_on")} ${Math.round(r / 255 * 100)} %` : d(t, "sp_on");
    }
    default:
      return Lt(s) ? ((n = e.formatEntityState) == null ? void 0 : n.call(e, i)) ?? i.state : i.state === "on" ? d(t, "sp_on") : i.state === "off" ? d(t, "sp_off") : i.state;
  }
}
const ks = (e) => (e == null ? void 0 : e.sp.kind) === "service";
function Qs(e, t, s) {
  if (!s) return "var(--disabled-text-color, #9e9e9e)";
  const i = s.modeId ? e.find((n) => n.id === s.modeId) : e.find((n) => At(Ht(n, t), s.sp));
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
    case "service":
      return "#26a69a";
    default:
      return "var(--secondary-text-color)";
  }
}
const oo = (e, t) => {
  const s = Math.abs(t), i = s < 60 ? `${s} min` : s % 60 ? `${Math.floor(s / 60)} h ${String(s % 60).padStart(2, "0")}` : `${s / 60} h`;
  return `${t > 0 ? "+" : "−"}${i}`;
};
function We(e, t, s) {
  if ("time" in t) {
    const [n, r] = t.time.split(":").map(Number);
    return ge(n * 60 + r >= A ? "24 h" : Hs(e, n * 60 + r));
  }
  const i = d(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`), o = t.offset ? ` ${oo(e, t.offset)}` : "";
  return ge(`${i}${o}`);
}
function Ss(e, t) {
  if ("time" in e) {
    const [s, i] = e.time.split(":").map(Number), o = Math.max(0, Math.min(A, Math.round((s * 60 + i + t) / I) * I));
    return { time: o >= A ? "24:00" : `${String(Math.floor(o / 60)).padStart(2, "0")}:${String(o % 60).padStart(2, "0")}` };
  }
  return { ...e, offset: Math.max(-240, Math.min(240, (e.offset ?? 0) + t)) };
}
const ti = [0, 1, 2, 3, 4], ei = [5, 6], is = [0, 1, 2, 3, 4, 5, 6];
function no(e, t, s) {
  const i = [...s].sort((o, n) => o - n);
  return At(i, is) ? d(e, "all_days_text") : At(i, ti) ? `${t[0]}–${t[4]}` : At(i, ei) ? d(e, "weekend") : i.map((o) => t[o]).join(Zs);
}
function He(e) {
  if (Array.isArray(e)) return `[${e.map(He).join(",")}]`;
  if (e && typeof e == "object") {
    const t = e;
    return `{${Object.keys(t).sort().map((s) => `${JSON.stringify(s)}:${He(t[s])}`).join(",")}}`;
  }
  return JSON.stringify(e);
}
function ro(e) {
  const { id: t, ...s } = e;
  return He({ ...s, conditions: e.conditions ?? [], end: e.end ?? null, color: e.color ?? null });
}
function ze(e, t, s) {
  const i = /* @__PURE__ */ new Map();
  return e.days.forEach((o, n) => {
    for (const r of o) {
      if (!t(r)) continue;
      const a = ro(r);
      let c = i.get(a);
      if (c && c.days.includes(n)) {
        c = void 0, i.set(`${a}#${r.id}`, { slot: r, days: [n], ids: { [n]: r.id } });
        continue;
      }
      c || (c = { slot: r, days: [], ids: {} }, i.set(a, c)), c.days.push(n), c.ids[n] = r.id;
    }
  }), [...i.values()].sort(
    (o, n) => s(o.slot.start) - s(n.slot.start) || o.days[0] - n.days[0]
  );
}
function As(e, t, s, i) {
  const o = e.days.map((n) => n.filter((r) => !s(r)));
  for (const n of t)
    for (const r of n.days)
      o[r].push({ ...structuredClone(n.slot), id: n.ids[r] ?? mt() });
  return { ...e, days: o.map((n) => n.sort((r, a) => i(r.start) - i(a.start))) };
}
const ao = /* @__PURE__ */ new Set(["none", "temporary", "permanent"]);
function lo(e, t) {
  return Object.values(e.states).filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(t)).map((s) => ({ id: s.entity_id, name: String(s.attributes.friendly_name ?? s.entity_id) })).sort((s, i) => s.name.localeCompare(i.name));
}
function co(e, t, s, i, o = !0) {
  var b;
  const n = E(i), r = ((b = e.states[i]) == null ? void 0 : b.attributes) ?? {}, a = [], c = (g) => {
    a.some((f) => f.id === g.id || g.group === "common" && At(f.act.sp, g.act.sp)) || a.push(g);
  }, h = (g, f, k, v) => c({ id: g, label: f, act: { sp: k }, group: "basic", param: v });
  if (n === "climate") {
    h("temperature", d(t, "act_temp"), { kind: "temperature", temperature: Et(r.temperature) ?? 19 }, "temperature");
    for (const g of r.preset_modes ?? [])
      ao.has(g) || c({
        id: `preset:${g}`,
        label: se(e, t, [], i, { kind: "preset", preset: g }),
        group: "own",
        act: { sp: { kind: "preset", preset: g } }
      });
    (r.hvac_modes ?? []).includes("off") && h("off", d(t, "sp_off"), { kind: "off" });
  } else n === "cover" ? (h("open", d(t, "act_open"), { kind: "open" }), h("close", d(t, "act_close"), { kind: "close" }), h("position", d(t, "act_pos"), { kind: "position", position: Et(r.current_position) ?? 50 }, "position")) : n === "light" ? (h("on", d(t, "act_on"), { kind: "on" }, "light"), h("off", d(t, "act_off"), { kind: "off" })) : ["switch", "input_boolean", "fan"].includes(n) && (h("on", d(t, "act_on"), { kind: "on" }), h("off", d(t, "act_off"), { kind: "off" }));
  if (o)
    for (const g of lo(e, i))
      c({ id: g.id, label: g.name, group: "scene", act: { sp: { kind: "scene", scene: g.id } } });
  const u = n === "input_boolean" ? "switch" : n, m = (g) => g.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(" ")[0];
  for (const g of s.filter((f) => f.type === u)) {
    if (a.some((k) => k.group === "own" && m(k.label) === m(g.name))) continue;
    const f = Bi(e, t, g, i);
    c({ id: `mode:${g.id}`, label: f ? `${g.name} ${f}` : g.name, group: "common", act: { sp: Ht(g, i), modeId: g.id } });
  }
  return a;
}
function po(e, t) {
  if (!t) return;
  const s = t.modeId ? e.find((o) => o.act.modeId === t.modeId) : void 0;
  if (s) return s;
  const i = t.sp.kind;
  return e.find((o) => o.param && o.act.sp.kind === i && !o.act.modeId) ?? e.find((o) => !o.act.modeId && At(o.act.sp, t.sp)) ?? e.find((o) => At(o.act.sp, t.sp));
}
var ho = Object.defineProperty, uo = Object.getOwnPropertyDescriptor, at = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? uo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && ho(t, s, o), o;
};
const pt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Vt = (e, t, s) => Math.min(s, Math.max(t, e));
let U = class extends M {
  constructor() {
    super(...arguments), this.entityId = "", this.act = null, this.rest = !1, this.disabled = !1, this._more = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
  }
  get _lang() {
    return et(this.hass);
  }
  updated() {
    !this.hass || !this.entityId || this.rest || !Lt(this.entityId) || this._loadedFor === this.entityId || (this._loadedFor = this.entityId, ss(this.hass, Yi(this.hass, this.entityId)).then((e) => e && this.requestUpdate()), this._selector || Js().then((e) => this._selector = e));
  }
  _setData(e, t) {
    var n;
    const s = (n = this.act) == null ? void 0 : n.sp;
    if (!s) return;
    const i = { ...s.data ?? {} };
    t == null || t === "" || Array.isArray(t) && !t.length ? delete i[e] : i[e] = t, this._emit({ sp: { ...s, data: i } });
  }
  /** Generic actions: the services accepting the entity, then the inputs of the chosen one. */
  _services() {
    var m, b, g;
    const e = this._lang, t = Xs(this.hass, this.entityId), s = Qi(t.map((f) => f.label)), i = t.map((f, k) => ({ ...f, label: s[k] })), o = ((m = this.act) == null ? void 0 : m.sp.kind) === "service" ? String(this.act.sp.service) : "", n = i.findIndex((f) => f.id === o), r = this._more || n >= U.SHOWN, a = r ? i : i.slice(0, U.SHOWN), c = ((g = (b = this.act) == null ? void 0 : b.sp) == null ? void 0 : g.data) ?? {}, h = o ? Xi(this.hass, o) : [], u = (f, k, v) => l`
      <button class="chip ${k ? "on" : ""}" role="radio" aria-checked=${k} ?disabled=${this.disabled} @click=${v}><span>${f}</span></button>`;
    return l`
      <div class="chips" role="radiogroup" aria-label=${d(e, "action")}>
        ${a.map((f) => u(f.label, f.id === o, () => this._emit({ sp: { kind: "service", service: f.id, data: {} } })))}
        ${!r && i.length > U.SHOWN ? l`<button class="chip add" ?disabled=${this.disabled} @click=${() => this._more = !0}>${d(e, "more_actions")}</button>` : p}
      </div>
      ${h.map((f) => this._selector ? l`<ha-selector class="fld" .hass=${this.hass} .selector=${f.selector} .value=${c[f.key]} .label=${f.label}
            .required=${f.required} ?disabled=${this.disabled}
            @value-changed=${(k) => {
      k.stopPropagation(), this._setData(f.key, k.detail.value);
    }}></ha-selector>` : l`<div class="field"><label>${f.label}</label><input type="text" .value=${String(c[f.key] ?? "")} ?disabled=${this.disabled}
            @change=${(k) => this._setData(f.key, k.target.value)} /></div>`)}`;
  }
  _emit(e) {
    this.dispatchEvent(new CustomEvent("act-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _choices() {
    return co(this.hass, this._lang, this.data.modes, this.entityId, !this.rest);
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
    return l`<div class="stepper" role="group" aria-label=${e}>
      <span class="lbl">${e}</span>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="−" @click=${s}><ha-icon icon="mdi:minus"></ha-icon></button>
      <output>${t}</output>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="+" @click=${i}><ha-icon icon="mdi:plus"></ha-icon></button>
      ${o ? l`<button class="ibtn round" ?disabled=${this.disabled} aria-label=${d(this._lang, "clear")} @click=${o}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
    </div>`;
  }
  _params(e) {
    var h;
    if (!(e != null && e.param) || !this.act) return p;
    const t = this._lang, s = ((h = this.hass.states[this.entityId]) == null ? void 0 : h.attributes) ?? {}, i = this.act.sp;
    if (e.param === "temperature") {
      const u = pt(s.min_temp) ?? 5, m = pt(s.max_temp) ?? 35, b = pt(i.temperature) ?? 19, g = (f) => this._patch({ temperature: Vt(Math.round(f * 2) / 2, u, m) });
      return this._stepper(d(t, "act_temp"), `${ee(t, b)} °C`, () => g(b - 0.5), () => g(b + 0.5));
    }
    if (e.param === "position") {
      const u = pt(i.position) ?? 50, m = (b) => this._patch({ position: Vt(Math.round(b / 5) * 5, 0, 100) });
      return l`${this._stepper(d(t, "act_pos"), `${u} %`, () => m(u - 10), () => m(u + 10))}
        <input type="range" min="0" max="100" step="5" .value=${String(u)} ?disabled=${this.disabled}
          aria-label=${d(t, "act_pos")} @change=${(b) => m(Number(b.target.value))} />`;
    }
    const o = s.supported_color_modes ?? [], n = (s.effect_list ?? []).filter((u) => u !== "off"), r = [], a = [], c = (u, m) => a.push(l`
      <button class="chip add" ?disabled=${this.disabled} @click=${() => this._patch(m)}>${d(t, "add_param", { name: u })}</button>`);
    if (o.some((u) => u !== "onoff")) {
      const u = pt(i.brightness), m = (b) => this._patch({ brightness: Vt(Math.round(b / 5) * 5, 5, 100) });
      u === null ? c(d(t, "act_brightness"), { brightness: 80 }) : r.push(this._stepper(d(t, "act_brightness"), `${u} %`, () => m(u - 10), () => m(u + 10), () => this._patch({}, ["brightness"])));
    }
    if (o.includes("color_temp")) {
      const u = pt(s.min_color_temp_kelvin) ?? 2e3, m = pt(s.max_color_temp_kelvin) ?? 6500, b = pt(i.color_temp_kelvin), g = (f) => this._patch({ color_temp_kelvin: Vt(Math.round(f / 100) * 100, u, m) });
      b === null ? c(d(t, "act_kelvin"), { color_temp_kelvin: Vt(2700, u, m) }) : r.push(this._stepper(d(t, "act_kelvin"), `${b} K`, () => g(b - 200), () => g(b + 200), () => this._patch({}, ["color_temp_kelvin"])));
    }
    return n.length && (i.effect ? r.push(l`<div class="stepper"><span class="lbl">${d(t, "act_effect")}</span>
        <select class="grow" ?disabled=${this.disabled} aria-label=${d(t, "act_effect")}
          @change=${(u) => this._patch({ effect: u.target.value })}>
          ${n.map((u) => l`<option value=${u} ?selected=${u === i.effect}>${u}</option>`)}
        </select>
        <button class="ibtn round" ?disabled=${this.disabled} aria-label=${d(t, "clear")} @click=${() => this._patch({}, ["effect"])}><ha-icon icon="mdi:close"></ha-icon></button></div>`) : c(d(t, "act_effect"), { effect: n[0] })), l`${r}${a.length ? l`<div class="chips adders">${a}</div>` : p}`;
  }
  render() {
    var a, c, h;
    if (!this.hass || !this.data || !this.entityId) return p;
    const e = this._lang, t = this._choices(), s = (a = this.act) != null && a.special ? void 0 : po(t, this.act), i = this.act && !this.act.special && !s, o = E(this.entityId), n = !this.rest && Lt(this.entityId);
    if (n && !t.length) return this._services();
    const r = (u, m, b, g) => l`
      <button class="chip ${m ? "on" : ""}" role="radio" aria-checked=${m} ?disabled=${this.disabled} @click=${b}>
        ${g ? l`<ha-icon icon=${g}></ha-icon>` : p}<span>${u}</span></button>`;
    return l`
      <div class="chips" role="radiogroup" aria-label=${d(e, "action")}>
        ${i ? r(d(e, "act_custom"), !0, () => {
    }) : p}
        ${t.map((u) => r(
      u.label,
      (s == null ? void 0 : s.id) === u.id,
      () => this._pick(u),
      u.group === "scene" ? "mdi:palette-outline" : void 0
    ))}
        ${this.rest ? l`
          ${r(d(e, "rest_none"), ((c = this.act) == null ? void 0 : c.special) === "none", () => this._emit({ sp: { kind: "off" }, special: "none" }))}
          ${r(d(e, "rest_previous"), ((h = this.act) == null ? void 0 : h.special) === "previous", () => this._emit({ sp: { kind: "off" }, special: "previous" }))}` : p}
      </div>
      ${o ? this._params(s) : p}
      ${n ? this._services() : p}`;
  }
};
U.SHOWN = 8;
U.styles = [st, H`
    .chip span { white-space: normal; text-align: left; overflow-wrap: anywhere; }
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
    .adders { margin-top: 8px; }
    .chip.add { border-style: dashed; color: var(--primary-color); min-height: 48px; }
    .stepper select { flex: 1; min-width: 0; }
    .fld { display: block; margin-top: 8px; }
  `];
at([
  y({ attribute: !1 })
], U.prototype, "hass", 2);
at([
  y({ attribute: !1 })
], U.prototype, "data", 2);
at([
  y({ attribute: "entity-id" })
], U.prototype, "entityId", 2);
at([
  y({ attribute: !1 })
], U.prototype, "act", 2);
at([
  y({ type: Boolean })
], U.prototype, "rest", 2);
at([
  y({ type: Boolean })
], U.prototype, "disabled", 2);
at([
  w()
], U.prototype, "_more", 2);
at([
  w()
], U.prototype, "_selector", 2);
U = at([
  F("wp-action-picker")
], U);
var _o = Object.defineProperty, mo = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? mo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && _o(t, s, o), o;
};
function Es(e, t) {
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
function Cs(e, t) {
  const [s, i, o] = e.split("-").map(Number), n = Date.UTC(s, i - 1, o), r = n - Es(n, t);
  return n - Es(r, t);
}
function si(e, t) {
  const [s, i, o] = e.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, o + t)).toISOString().slice(0, 10);
}
function he(e, t) {
  return { startMs: Cs(e, t), endMs: Cs(si(e, 1), t) };
}
function fo(e) {
  const [t, s, i] = e.split("-").map(Number);
  return Ie(new Date(Date.UTC(t, s - 1, i, 12)), "UTC");
}
const je = /* @__PURE__ */ new Map();
function Ps(e, t, s) {
  const i = je.get(e);
  if (i && Date.now() - i.at < t) return i.p;
  const o = s();
  return je.set(e, { at: Date.now(), p: o }), o.catch(() => je.delete(e)), o;
}
const Ms = "var(--disabled-text-color, #9e9e9e)";
function Os(e) {
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
const yo = (e) => e === "unavailable" || e === "unknown" || e === "", ht = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let q = class extends M {
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
    const { startMs: s, endMs: i } = he(this.date, this._tz), o = Date.now(), r = i > o ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const c = s < o ? Ps(`h|${e}|${a}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(s).toISOString(),
        end_time: new Date(Math.min(i, o)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), h = Math.min(14, Math.max(1, Math.ceil((o - s) / 864e5) + 1)), u = s < o ? Ps(`j|${this.entityId}|${h}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: h })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [m, b] = await Promise.all([c, u]);
      if (t !== this._token) return;
      this._loaded = {
        hist: Os(m[this.entityId]),
        win: a ? Os(m[a]) : [],
        journal: (b.segments ?? []).filter((g) => g.entity_id === this.entityId)
      };
    } catch {
      t === this._token && (this._failed = !0);
    }
  }
  /** A window binary sensor of a thermostat (id contains the climate name and "window"). */
  _windowSensor() {
    if (E(this.entityId) !== "climate") return null;
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
    return e.actions.by_entity[this.entityId] ?? this._modeSetpoint(e.actions.by_type[E(this.entityId)], this.entityId);
  }
  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  _value(e) {
    if (!e) return null;
    const t = E(this.entityId);
    if (t === "climate") {
      const s = ht(e.temperature);
      return s !== null ? s : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? ht(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? ht(e.brightness) ?? 100 : null : e.kind === "value" ? ht(e.value) : null;
  }
  _presetTemperature(e) {
    return es(this.hass, this.entityId, e);
  }
  _live(e) {
    const t = E(this.entityId);
    if (yo(e.s)) return { applied: null, measured: null };
    if (t === "climate") return { applied: ht(e.a.temperature), measured: ht(e.a.current_temperature) };
    if (t === "cover") return { applied: ht(e.a.current_position), measured: null };
    if (t === "light") {
      const i = e.s === "on" ? ht(e.a.brightness) : 0;
      return { applied: i === null ? e.s === "on" ? 100 : 0 : i / 255 * 100, measured: null };
    }
    const s = Number(e.s);
    return { applied: Number.isFinite(s) ? s : null, measured: null };
  }
  // ---- build ----
  _build(e) {
    var ls, cs;
    const t = this._tz, { startMs: s, endMs: i } = he(this.date, t), o = Math.round((i - s) / 6e4), n = Date.now(), r = Math.max(0, Math.min(o, (n - s) / 6e4)), a = (_) => (_ - s) / 6e4, c = E(this.entityId), h = this.data.modes, u = jt(this.program, this.data), m = /* @__PURE__ */ new Map();
    for (const _ of this.program.profiles) for (const $ of _.days.flat()) m.set($.id, $);
    d(this._lang, "override");
    const b = fo(this.date), g = [];
    for (const { slot: _, end: $ } of Xe(u.days[(b + 6) % 7])) g.push({ s: 0, e: $, slot: _ });
    if (this.slots)
      for (const _ of this.slots) {
        const $ = m.get(_.slot_id);
        if (!$ || _.ignored) continue;
        const x = Math.max(0, a(Date.parse(_.start))), P = _.end ? Math.min(o, a(Date.parse(_.end))) : x + 5;
        P > x && g.push({ s: x, e: P, slot: $ });
      }
    else
      for (const _ of u.days[b]) {
        const $ = L(_.start);
        if ($ === null) continue;
        const x = L(_.end ?? null);
        g.push({ s: $, e: x === null ? $ + 5 : x > $ ? x : o, slot: _ });
      }
    g.sort((_, $) => _.s - $.s);
    const f = (ls = this.program.entities.find((_) => _.entity_id === this.entityId)) == null ? void 0 : ls.default, k = f ? f.kind === "mode" ? this._modeSetpoint(String(f.value), this.entityId) : f.kind === "setpoint" ? f.value : null : null, v = (f == null ? void 0 : f.kind) === "mode" ? h.find((_) => _.id === f.value) : void 0, D = (f == null ? void 0 : f.kind) === "previous", S = [];
    let V = 0;
    const ne = (_) => {
      if (_ <= V) return;
      const $ = S[S.length - 1];
      S.push(D && $ ? { ...$, s: V, e: _ } : { s: V, e: _, v: this._value(k), color: (v == null ? void 0 : v.color) ?? Ms, label: (v == null ? void 0 : v.name) ?? d(this._lang, "default_state") }), V = _;
    };
    for (const _ of g) {
      const $ = Math.max(_.s, V);
      if (_.e <= $) continue;
      ne($);
      const x = this._slotSetpoint(_.slot);
      S.push({
        s: $,
        e: _.e,
        v: this._value(x),
        color: ye(_.slot, this.program, h),
        label: Fe(_.slot, this.program, h, this._lang)
      }), V = _.e;
    }
    ne(o);
    const N = (_) => S.find(($) => _ >= $.s && _ < $.e) ?? S[S.length - 1], dt = e.journal.map((_) => ({ m: a(Date.parse(_.at)), e: _ })).filter((_) => !Number.isNaN(_.m)).sort((_, $) => _.m - $.m), xe = (_) => {
      let $ = null;
      for (const P of dt) if (P.m <= _) $ = P;
      else break;
      if (!$) return null;
      const x = $.e.slot_id ? m.get($.e.slot_id) : void 0;
      return {
        s: $.m,
        e: $.m,
        v: this._value($.e.setpoint),
        color: x ? ye(x, this.program, h) : Ms,
        label: x ? Fe(x, this.program, h, this._lang) : ""
      };
    }, re = /* @__PURE__ */ new Set([0, o, r]);
    S.forEach((_) => {
      re.add(_.s), re.add(_.e);
    }), dt.forEach((_) => {
      _.m > 0 && _.m < o && re.add(_.m);
    });
    const ke = [...re].filter((_) => _ >= 0 && _ <= o).sort((_, $) => _ - $), ae = [];
    for (let _ = 0; _ < ke.length - 1; _++) {
      const $ = ke[_], x = ke[_ + 1];
      if (x - $ < 0.01) continue;
      const P = ($ + x) / 2, gt = (P < r ? xe(P) : null) ?? N(P);
      ae.push({ s: $, e: x, v: gt.v, color: gt.color, label: gt.label });
    }
    const Dt = [], Se = [], os = [];
    for (const _ of e.hist) {
      const $ = Math.max(0, a(_.t)), x = this._live(_);
      Dt.push({ m: $, v: x.applied, heating: _.a.hvac_action === "heating" }), Se.push({ m: $, v: x.measured });
    }
    const ns = (_, $) => {
      const x = [];
      return _.forEach((P, yt) => {
        if (!$(yt)) return;
        const gt = yt + 1 < _.length ? _[yt + 1].m : r;
        if (gt > P.m) {
          const Ce = x[x.length - 1];
          Ce && Math.abs(Ce[1] - P.m) < 0.01 ? Ce[1] = gt : x.push([P.m, gt]);
        }
      }), x;
    };
    os.push(...ns(Dt, (_) => !!Dt[_].heating));
    const rs = e.win.map((_) => ({ m: Math.max(0, a(_.t)), open: _.s === "on" })), oi = ns(rs, (_) => rs[_].open), ni = (_, $) => {
      let x = null, P = !1;
      for (const yt of _) if (yt.m <= $)
        x = yt.v, P = !0;
      else break;
      return P ? x : null;
    }, ri = (_) => {
      var $;
      return (($ = ae.find((x) => _ >= x.s && _ < x.e)) == null ? void 0 : $.v) ?? null;
    }, ai = c === "climate" ? 0.5 : 5, as = [];
    let Tt = null;
    const Ae = Math.floor(r);
    for (let _ = 0; _ <= Ae + 1; _++) {
      const $ = _ <= Ae ? ri(_ + 0.5) : null, x = _ <= Ae ? ni(Dt, _ + 0.5) : null, P = $ !== null && x !== null && Math.abs($ - x) > ai;
      P && Tt === null && (Tt = _), !P && Tt !== null && (_ - Tt > 2 && as.push([Tt, _]), Tt = null);
    }
    const Ee = [...ae.map((_) => _.v), ...Dt.map((_) => _.v), ...Se.map((_) => _.v)].filter((_) => _ !== null);
    let le = 0, ce = 100;
    c !== "cover" && c !== "light" && Ee.length && (le = Math.floor(Math.min(...Ee) - 1), ce = Math.ceil(Math.max(...Ee) + 1), ce - le < 2 && (ce = le + 2));
    const li = c === "climate" ? "°C" : c === "cover" || c === "light" ? "%" : ((cs = this.hass.states[this.entityId]) == null ? void 0 : cs.attributes.unit_of_measurement) ?? "";
    return {
      span: o,
      pastEnd: r,
      isToday: s <= n && n < i,
      planned: ae,
      applied: Dt,
      measured: Se,
      heat: os,
      win: oi,
      over: as,
      lo: le,
      hi: ce,
      unit: li
    };
  }
  // ---- interaction ----
  _pointer(e) {
    const t = this._model;
    if (!t) return;
    const s = e.currentTarget.getBoundingClientRect(), i = e.clientX - s.left;
    this._cursor = this._clampM((i - C.l) / (s.width - C.l - C.r) * t.span, t.span);
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
    const { startMs: t } = he(this.date, this._tz);
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
      const u = i(a.v);
      o ? n += r ? `V${u.toFixed(1)}H${s(h).toFixed(1)}` : `M${s(a.m).toFixed(1)},${u.toFixed(1)}H${s(h).toFixed(1)}` : (n += `${r ? "L" : "M"}${s(a.m).toFixed(1)},${u.toFixed(1)}`, c + 1 === e.length && (n += `L${s(h).toFixed(1)},${u.toFixed(1)}`)), r = !0;
    }), n;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const e = B(this._lang), t = this._model, s = St(this.hass, this.entityId);
    let i;
    return this._failed ? i = l`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((o) => o.v !== null) && !t.applied.some((o) => o.v !== null) && !t.measured.some((o) => o.v !== null) ? i = l`<div class="note">${e.no_data}</div>` : i = this._renderChart(t, s) : i = l`<div class="note">${e.chart_loading}</div>`, l`<div class="box">${i}</div>${t ? this._legend(t) : p}`;
  }
  _legend(e) {
    const t = B(this._lang), s = (i, o) => l`<span class="key"><i class=${i}></i>${o}</span>`;
    return l`<div class="legend">
      ${s("planned", t.planned)}
      ${!this.simple && e.applied.some((i) => i.v !== null) ? s("applied", t.applied) : p}
      ${e.measured.some((i) => i.v !== null) ? s("measured", t.measured) : p}
      ${!this.simple && e.win.length ? s("zone win", t.window_open) : p}
      ${!this.simple && e.heat.length ? s("zone heat", t.heating) : p}
      ${!this.simple && e.over.length ? s("zone over", t.overridden) : p}
    </div>`;
  }
  _renderChart(e, t) {
    const s = B(this._lang), i = this._width, o = go, n = (v) => C.l + v / e.span * (i - C.l - C.r), r = (v) => C.t + (1 - (v - e.lo) / (e.hi - e.lo)) * (o - C.t - C.b), { startMs: a } = he(this.date, this._tz), c = [0, 1, 2, 3].map((v) => e.lo + (e.hi - e.lo) * v / 3), h = [];
    for (let v = 0; v <= e.span; v += 180) h.push(v);
    const u = (v, D) => v.map(([S, V]) => ot`<rect class="z ${D}" x=${n(S)} y=${C.t} width=${Math.max(1, n(V) - n(S))}
        height=${o - C.t - C.b}></rect>`), m = this._cursor;
    let b = p, g = p, f = "";
    if (m !== null) {
      const v = e.planned.find((N) => m >= N.s && m < N.e), D = [];
      D.push([s.planned, `${this._fmt((v == null ? void 0 : v.v) ?? null, e.unit)}${v != null && v.label ? " · " + v.label : ""}`]), m <= e.pastEnd && (!this.simple && e.applied.some((N) => N.v !== null) && D.push([s.applied, this._fmt(this._valueAt(e.applied, m), e.unit)]), e.measured.some((N) => N.v !== null) && D.push([s.measured, this._fmt(this._valueAt(e.measured, m), e.unit)]));
      const S = [], V = (N) => N.some(([dt, xe]) => m >= dt && m < xe);
      V(e.win) && S.push(s.window_open), V(e.heat) && S.push(s.heating), V(e.over) && S.push(s.overridden), f = `${this._clock(m)} — ${D.map(([N, dt]) => `${N} ${dt}`).join(", ")}${S.length ? ", " + S.join(", ") : ""}`;
      const ne = Math.min(Math.max(n(m), 70), i - 70);
      g = ot`<line class="cursor" x1=${n(m)} x2=${n(m)} y1=${C.t} y2=${o - C.b}></line>`, b = l`<div class="tip" style="left:${ne}px">
        <b>${this._clock(m)}</b>
        ${D.map(([N, dt]) => l`<div><span>${N}</span> ${dt}</div>`)}
        ${S.map((N) => l`<div class="flag">${N}</div>`)}
      </div>`;
    }
    const k = e.isToday ? ot`<line class="now" x1=${n(e.pastEnd)} x2=${n(e.pastEnd)} y1=${C.t} y2=${o - C.b}></line>` : p;
    return l`
      <svg width=${i} height=${o} viewBox="0 0 ${i} ${o}" tabindex="0" role="application"
        aria-label=${d(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(v) => v.pointerType === "mouse" || v.buttons ? this._pointer(v) : void 0}
        @pointerleave=${(v) => {
      v.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${c.map((v) => ot`<line class="grid" x1=${C.l} x2=${i - C.r} y1=${r(v)} y2=${r(v)}></line>
          <text class="ylab" x=${C.l - 4} y=${r(v) + 3} text-anchor="end">${Number(v.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${h.map((v) => ot`<text class="xlab" x=${n(v)} y=${o - 6}
          text-anchor=${v === 0 ? "start" : "middle"}>${Math.floor(Nt(new Date(a + v * 6e4), this._tz) / 60)}h</text>`)}
        ${this.simple ? p : ot`${u(e.win, "win")}${u(e.heat, "heat")}${u(e.over, "over")}`}
        ${e.planned.map((v, D) => {
      const S = e.planned[D - 1];
      return v.v === null ? p : ot`
            ${S && S.v !== null ? ot`<line class="riser" x1=${n(v.s)} x2=${n(v.s)} y1=${r(S.v)} y2=${r(v.v)}></line>` : p}
            <line class="plan" x1=${n(v.s)} x2=${n(v.e)} y1=${r(v.v)} y2=${r(v.v)} style="stroke:${this.simple ? "var(--primary-color)" : v.color}"></line>`;
    })}
        ${this.simple ? p : ot`<path class="applied" d=${this._path(e.applied, e, n, r, !0)}></path>`}
        <path class="measured" d=${this._path(e.measured, e, n, r, !1)}></path>
        ${k}${g}
        <rect class="hit" x=${C.l} y=${C.t} width=${i - C.l - C.r} height=${o - C.t - C.b}></rect>
      </svg>
      ${b}
      <div class="sr" aria-live="polite">${f}</div>`;
  }
};
q.styles = H`
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
  y({ attribute: !1 })
], q.prototype, "hass", 2);
Y([
  y({ attribute: !1 })
], q.prototype, "data", 2);
Y([
  y({ attribute: !1 })
], q.prototype, "program", 2);
Y([
  y({ attribute: "entity-id" })
], q.prototype, "entityId", 2);
Y([
  y()
], q.prototype, "date", 2);
Y([
  y({ type: Boolean })
], q.prototype, "simple", 2);
Y([
  y({ attribute: !1 })
], q.prototype, "slots", 2);
Y([
  w()
], q.prototype, "_width", 2);
Y([
  w()
], q.prototype, "_loaded", 2);
Y([
  w()
], q.prototype, "_failed", 2);
Y([
  w()
], q.prototype, "_cursor", 2);
q = Y([
  F("wp-chart")
], q);
const go = 160, C = { l: 38, r: 10, t: 10, b: 22 };
var vo = Object.defineProperty, bo = Object.getOwnPropertyDescriptor, it = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? bo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && vo(t, s, o), o;
};
const $o = ["sunrise", "sunset"];
let G = class extends M {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
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
    let s = K(t);
    e === "end" && s === 0 && (s = A), this._update(e, { time: s >= A ? "24:00" : J(s) });
  }
  _timeBlock(e, t) {
    const s = this.group.slot[e];
    if (!s) return p;
    const i = this._lang, o = B(i), n = this.disabled;
    return l`
      <div class="time" role="group" aria-label=${t}>
        <button class="step" ?disabled=${n} aria-label=${d(i, "minus15")} title=${d(i, "minus15")} @click=${() => this._update(e, Ss(s, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in s ? l`<input type="time" step="300" .value=${s.time === "24:00" ? "00:00" : s.time} ?disabled=${n}
              aria-label=${t} @change=${(r) => this._fromInput(e, r.target.value)} />` : l`<output class="sun">${We(i, s)}</output>`}
        <button class="step" ?disabled=${n} aria-label=${d(i, "plus15")} title=${d(i, "plus15")} @click=${() => this._update(e, Ss(s, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${$o.map((r) => {
      const a = "sun" in s && s.sun === r;
      return l`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${n}
            @click=${() => this._toggleSun(e, r)}><ha-icon icon=${r === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${o[`sun_${r}_short`] ?? r}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(e) {
    if (!e) return this._update("end", null);
    const t = this.group.slot.start, s = "time" in t ? K(t.time) : 12 * 60;
    this._update("end", { time: J(Math.min(A - 5, s + 60)) });
  }
  /* ---- days ---- */
  _toggleDay(e) {
    const t = this.group.days.includes(e) ? this.group.days.filter((s) => s !== e) : [...this.group.days, e];
    this._set({}, t.sort((s, i) => s - i));
  }
  /* ---- action ---- */
  _setAct(e, t) {
    const s = to(this.group.slot, this.program, e, t);
    this._set(ks(t) ? { ...s, end: null } : { ...s });
  }
  /** A slot with a service action has no end. */
  _oneShot() {
    return this.entityIds.some((e) => ks(It(this.group.slot, e, this.data.modes)));
  }
  render() {
    if (!this.group || !this.program) return p;
    const e = this._lang, t = B(e), s = this.group.slot, i = this.group.days, o = (r, a) => r.length === a.length && a.every((c) => r.includes(c)), n = (r, a) => l`<button class="chip small ${o(i, a) ? "on" : ""}"
      aria-pressed=${o(i, a)} ?disabled=${this.disabled} @click=${() => this._set({}, [...a])}>${o(i, a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : p}${r}</button>`;
    return l`
      <section>
        <h4>${d(e, "start")}</h4>
        ${this._timeBlock("start", d(e, "start"))}
      </section>
      ${this._oneShot() ? p : l`<section>
        <h4>${d(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${s.end ? "" : "on"}" aria-pressed=${!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${d(e, "no_end")}</button>
          <button class="chip ${s.end ? "on" : ""}" aria-pressed=${!!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${d(e, "with_end")}</button>
        </div>
        ${s.end ? this._timeBlock("end", d(e, "end")) : p}
      </section>`}
      <section>
        <h4>${d(e, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && o(i, [this.dayOnly]) ? l`<div class="chips"><span class="only">${t.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${d(e, "apply_other_days")}</button></div>` : l`<div class="days" role="group" aria-label=${d(e, "days_label")}>
          ${t.days_short.map((r, a) => l`<button class="day ${i.includes(a) ? "on" : ""}" aria-pressed=${i.includes(a)}
            aria-label=${t.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${i.includes(a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : p}<span>${r}</span></button>`)}
        </div>
        <div class="chips">
          ${n(d(e, "all_days"), is)}${n(d(e, "weekdays"), ti)}${n(d(e, "weekend"), ei)}
        </div>`}
      </section>
      <section>
        <h4>${d(e, "action")}</h4>
        ${this.entityIds.map((r) => {
      var a;
      return l`
          ${this.entityIds.length > 1 ? l`<div class="dev"><ha-icon icon=${((a = this.hass.states[r]) == null ? void 0 : a.attributes.icon) ?? `mdi:${E(r) === "climate" ? "thermostat" : "devices"}`}></ha-icon>${St(this.hass, r)}</div>` : p}
          <wp-action-picker .hass=${this.hass} .data=${this.data} entity-id=${r} ?disabled=${this.disabled}
            .act=${It(s, r, this.data.modes)}
            @act-change=${(c) => {
        c.stopPropagation(), this._setAct(r, c.detail);
      }}></wp-action-picker>`;
    })}
      </section>`;
  }
};
G.styles = [st, H`
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
    .dev { display: flex; align-items: center; gap: 8px; margin: 8px 0 4px; font-weight: 600; --mdc-icon-size: 20px; }
  `];
it([
  y({ attribute: !1 })
], G.prototype, "hass", 2);
it([
  y({ attribute: !1 })
], G.prototype, "data", 2);
it([
  y({ attribute: !1 })
], G.prototype, "program", 2);
it([
  y({ attribute: !1 })
], G.prototype, "group", 2);
it([
  y({ attribute: !1 })
], G.prototype, "entityIds", 2);
it([
  y({ type: Boolean })
], G.prototype, "disabled", 2);
it([
  y({ type: Number })
], G.prototype, "dayOnly", 2);
it([
  w()
], G.prototype, "_more", 2);
it([
  w()
], G.prototype, "_last", 2);
G = it([
  F("wp-slot-form")
], G);
var wo = Object.defineProperty, xo = Object.getOwnPropertyDescriptor, oe = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? xo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && wo(t, s, o), o;
};
let Mt = class extends M {
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
    const e = B(this.lang);
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
Mt.styles = H`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
oe([
  y()
], Mt.prototype, "message", 2);
oe([
  y({ attribute: "confirm-label" })
], Mt.prototype, "confirmLabel", 2);
oe([
  y({ attribute: "cancel-label" })
], Mt.prototype, "cancelLabel", 2);
oe([
  y()
], Mt.prototype, "lang", 2);
Mt = oe([
  F("wp-confirm")
], Mt);
function Ct(e, t, s, i = "") {
  return new Promise((o) => {
    var a;
    const n = document.createElement("wp-confirm");
    n.message = t, n.confirmLabel = s, n.cancelLabel = i;
    const r = e.hass;
    n.lang = ((a = r == null ? void 0 : r.locale) == null ? void 0 : a.language) ?? (r == null ? void 0 : r.language) ?? (document.documentElement.lang || "en"), n.addEventListener("choice", (c) => {
      n.remove(), o(!!c.detail);
    }), (e.shadowRoot ?? e).appendChild(n);
  });
}
function Yt(e, t) {
  var o, n;
  const s = (n = (o = e.states[t]) == null ? void 0 : o.attributes) == null ? void 0 : n.friendly_name;
  if (typeof s == "string" && s) return s;
  const i = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return i ? i.charAt(0).toUpperCase() + i.slice(1) : t;
}
const ko = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);
class So {
  constructor(t, s = 500) {
    this.onFire = t, this.delay = s, this.timer = 0, this.sx = 0, this.sy = 0, this.fired = !1;
  }
  down(t) {
    t.pointerType === "mouse" && t.button !== 0 || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "BUTTON" || ko.has(s.tagName))) || (this.cancel(), this.fired = !1, this.sx = t.clientX, this.sy = t.clientY, this.timer = window.setTimeout(() => {
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
const Ds = /* @__PURE__ */ new WeakSet();
function Ao(e) {
  if (!e || Ds.has(e)) return;
  Ds.add(e);
  const t = () => {
    e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  };
  e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
const Eo = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var Co = Object.defineProperty, Po = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Po(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Co(t, s, o), o;
};
const Mo = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, Oo = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function qt(e, t) {
  var o;
  if ("time" in t) return K(t.time);
  const s = (o = e.states["sun.sun"]) == null ? void 0 : o.attributes[Mo[t.sun]];
  let i = s ? Nt(s, e.config.time_zone) : Oo[t.sun];
  return i += t.offset ?? 0, t.earliest && (i = Math.max(i, K(t.earliest))), t.latest && (i = Math.min(i, K(t.latest))), Math.max(0, Math.min(A, i));
}
function Be(e) {
  const t = L(e.start);
  if (t === null || !e.end) return null;
  const s = L(e.end);
  return s === null ? null : s > t ? [t, s] : [t, A];
}
function ve(e) {
  const t = e.map((s) => ({ slot: s, iv: Be(s) })).filter((s) => s.iv !== null).sort((s, i) => s.iv[0] - i.iv[0]);
  for (let s = 1; s < t.length; s++)
    if (t[s].iv[0] < t[s - 1].iv[1]) return [t[s - 1].slot, t[s].slot];
  return null;
}
function Ve(e, t) {
  return [...t].sort((s, i) => qt(e, s.start) - qt(e, i.start));
}
function ut(e, t, s) {
  const i = (o) => {
    if ("time" in o) return o.time;
    const n = o.offset ? ` ${o.offset > 0 ? "+" : "−"}${Math.abs(o.offset)} min` : "";
    return `${d(s, `sun_${o.sun}`)}${n} (≈${J(qt(e, o))})`;
  };
  return t.end ? `${i(t.start)} – ${i(t.end)}` : `${i(t.start)} · ${d(s, "one_shot")}`;
}
function ii(e, t, s, i, o) {
  const n = et(e), r = [];
  o > 0 && r.push({ start: 0, end: o, color: "var(--secondary-text-color)", label: d(n, "previous_day"), ignored: "spill" });
  for (const a of i) {
    const c = qt(e, a.start), h = a.end ? qt(e, a.end) : null, [[u, m]] = Di(a, { start: c, end: h }), b = !("time" in a.start) || !!(a.end && !("time" in a.end));
    r.push({
      start: u,
      end: m,
      sun: b,
      color: ye(a, s, t.modes),
      label: `${Fe(a, s, t.modes, n)} ${ut(e, a, n)}`
    });
  }
  return r;
}
let W = class extends M {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "", this._zoom = 1, this._lp = new So(() => {
      this._lpSlot && (this._menu = this._lpSlot);
    }), this._pts = /* @__PURE__ */ new Map();
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), s = (i, o) => t.set(i, [...t.get(i) ?? [], o]);
    for (const i of e) {
      const o = L(i.start);
      o !== null && s(o, { id: i.id, which: "start" });
      const n = L(i.end ?? null);
      o !== null && n !== null && n > o && s(n, { id: i.id, which: "end" });
    }
    return [...t.entries()].map(([i, o]) => ({ key: o.map((n) => n.id + n.which).join("|"), min: i, refs: o }));
  }
  _bounds(e, t, s) {
    let i = 0, o = A;
    for (const a of t) {
      const c = e.find((b) => b.id === a.id);
      if (!c) continue;
      const h = L(c.start) ?? 0, u = c.end ? L(c.end) : null, m = u !== null && u <= h;
      a.which === "start" ? (u !== null && !m ? o = Math.min(o, u - I) : o = Math.min(o, A - I), m && (i = Math.max(i, u))) : m ? (i = Math.max(i, I), o = Math.min(o, h)) : i = Math.max(i, h + I);
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
    const i = { time: J(s) };
    return e.map((o) => {
      const n = t.find((r) => r.id === o.id);
      return n ? n.which === "start" ? { ...o, start: i } : { ...o, end: i } : o;
    });
  }
  _emitSlots(e) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _snap(e) {
    return Math.round(e / I) * I;
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
    const i = s.getBoundingClientRect(), o = (e.clientX - i.left) / i.width * A, n = Math.max(t.lo, Math.min(t.hi, this._snap(o)));
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
    const t = this._tr("confirm_delete_slot", { time: ut(this.hass, e, this._lang) });
    await Ct(this, t, this._tr("delete")) && this._emitSlots(this.slots.filter((s) => s.id !== e.id));
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
    const s = e.shiftKey ? 60 : I;
    let i = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") i = -s;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") i = s;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, i);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((o) => o.type === Ue(this.program)), t = this._slots.map(Be).filter((o) => o !== null).sort((o, n) => o[0] - n[0]);
    let s = 480;
    for (const [o, n] of t) s >= o && s < n && (s = n);
    s > A - 60 && (s = A - 60);
    const i = Math.min(A, s + 60);
    return {
      id: mt(),
      start: { time: J(s) },
      end: { time: J(i) },
      conditions: [],
      actions: { by_type: e[0] ? { [Ue(this.program)]: e[0].id } : {}, by_entity: {} }
    };
  }
  _edit(e, t) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: e, isNew: t }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(e, t) {
    const s = e.find((i) => i.id === t);
    return s ? ut(this.hass, s, this._lang) : "";
  }
  _actionText(e) {
    const t = ts(e, this.program, this.data.modes), s = Object.values(e.actions.by_type).map((o) => {
      var n;
      return (n = this.data.modes.find((r) => r.id === o)) == null ? void 0 : n.name;
    }).filter(Boolean);
    if (s.length) return s.join(" · ");
    const i = Object.keys(e.actions.by_entity).map((o) => Yt(this.hass, o));
    return (t == null ? void 0 : t.name) ?? (i.length ? i.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, s) {
    if (!s) return l`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in s))
      return l`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${ut(this.hass, { ...e, start: s, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const i = K(s.time), o = [{ id: e.id, which: t }], [n, r] = this._bounds(this._slots, o, i), a = this._tr(t === "start" ? "slot_start" : "slot_end");
    return l`
      <span class="stepper">
        <button class="ibtn" ?disabled=${i - I < n} @click=${() => this._nudge(o, i, -I)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${s.time}</span>
        <button class="ibtn" ?disabled=${i + I > r} @click=${() => this._nudge(o, i, I)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = ii(this.hass, this.data, this.program, e, this.spill), s = this._edges(e), i = (r) => `${r / A * 100}%`, o = this._drag, n = Ve(this.hass, e);
    return l`
      <div class="wrap" @pointerdown=${this._pdown} @pointermove=${this._pmove} @pointerup=${this._pup}
        @pointercancel=${this._pup}>
        <div class="track" style="width:${this._zoom * 100}%">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${s.map((r) => {
      const a = o && r.refs.some((m) => o.refs.some((b) => b.id === m.id && b.which === m.which)), [c, h] = this._bounds(e, r.refs, r.min), u = J(r.min);
      return l`<button class="handle ${a ? "active" : ""}" style="left:${i(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((m) => `${m.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, m.id)}`).join(" / ")}
                aria-valuemin=${c} aria-valuemax=${h} aria-valuenow=${r.min} aria-valuetext=${u}
                @pointerdown=${(m) => this._down(m, r)}
                @pointermove=${(m) => this._move(m)}
                @pointerup=${(m) => this._up(m)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(m) => this._onKey(m, r)}><span class="grip"></span></button>`;
    })}
            ${o ? l`<div class="loupe" style="left:${i(o.min)}" aria-hidden="true">
                  <span>${J(o.min)}</span></div>` : p}
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
      ${this.spill > 0 ? l`<p class="hint">${this._tr("spill_hint", { time: J(this.spill) })}</p>` : p}
      ${this._notice ? l`<p class="error" role="alert">${this._notice}</p>` : p}
      <div class="list">
        ${n.length === 0 ? l`<p class="muted">${this._tr("no_slots")}</p>` : p}
        ${n.map(
      (r) => {
        var a;
        return l`
            <div class="slot" @pointerdown=${(c) => this._slotDown(c, r)}
              @pointermove=${(c) => this._lp.move(c)} @pointerup=${() => this._lp.cancel()}
              @pointercancel=${() => this._lp.cancel()} @contextmenu=${(c) => c.preventDefault()}>
              <span class="dot" style="background:${ye(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? l`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : l`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(a = r.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${ut(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${ut(this.hass, r, this._lang)}`}
                @click=${() => void this._remove(r)}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
      <p class="hint"><ha-icon icon="mdi:gesture-tap-hold"></ha-icon> ${this._tr("longpress_hint")}</p>
      ${this._menu ? l`<wp-dialog open heading=${ut(this.hass, this._menu, this._lang)}
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
W.styles = [
  st,
  H`
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
  y({ attribute: !1 })
], W.prototype, "hass", 2);
X([
  y({ attribute: !1 })
], W.prototype, "data", 2);
X([
  y({ attribute: !1 })
], W.prototype, "program", 2);
X([
  y({ attribute: !1 })
], W.prototype, "slots", 2);
X([
  y({ type: Number })
], W.prototype, "spill", 2);
X([
  y({ type: Number })
], W.prototype, "day", 2);
X([
  w()
], W.prototype, "_drag", 2);
X([
  w()
], W.prototype, "_dragSlots", 2);
X([
  w()
], W.prototype, "_notice", 2);
X([
  w()
], W.prototype, "_zoom", 2);
X([
  w()
], W.prototype, "_menu", 2);
W = X([
  F("wp-day-editor")
], W);
var Do = Object.defineProperty, To = Object.getOwnPropertyDescriptor, R = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? To(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Do(t, s, o), o;
};
const Ts = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, Ne = 7;
let T = class extends M {
  constructor() {
    super(...arguments), this.chart = !0, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._act = null, this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._minutes = (e) => qt(this.hass, e);
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
    return this.scope.kind === "device" ? St(this.hass, this.scope.entityId) : ((e = this._programs[0]) == null ? void 0 : e.name) ?? "";
  }
  _include(e) {
    const t = this._entities.filter((s) => e.entities.some((i) => i.entity_id === s));
    return (s) => t.some((i) => It(s, i, this.data.modes) !== null);
  }
  _rows() {
    const e = [];
    for (const t of this._programs) {
      const s = jt(t, this.data);
      for (const i of ze(s, this._include(t), this._minutes))
        e.push({ program: t, group: i, key: `${t.id}|${i.ids[i.days[0]]}` });
    }
    return e;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (this._loadNames(), !this.day) return;
    const { weekday: e, offset: t } = this.day;
    t >= -14 && t <= Ne && (this._offset = t);
    const s = this._rows().filter((i) => i.group.days.includes(e));
    if (s.length === 1) {
      const { key: i, program: o, group: n } = s[0], { [e]: r, ...a } = n.ids;
      this._expand(i, o, { slot: n.slot, days: [e], ids: r ? { [e]: r } : {} }), this._rest = { slot: structuredClone(n.slot), days: n.days.filter((c) => c !== e), ids: a }, this._dayOnly = e;
    } else !s.length && this._canEdit && (this._add([e]), this._dayOnly = e);
  }
  /** Translated service names of the generic actions of this scope. */
  _loadNames() {
    const e = /* @__PURE__ */ new Set();
    for (const t of this._programs)
      for (const s of jt(t, this.data).days)
        for (const i of s)
          for (const o of Object.values(i.actions.by_entity))
            o.kind === "service" && e.add(String(o.service).split(".")[0]);
    ss(this.hass, [...e]).then((t) => t && this.requestUpdate());
  }
  willUpdate(e) {
    (!this._chartEntity || e.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
    const t = this._programs[0];
    if (this.chart && t && this.hass) {
      const s = `${t.id}|${t.revision}|${this._date}`;
      s !== this._loaded && (this._loaded = s, this._loadPreview(t.id, this._date, s));
    }
  }
  get _today() {
    return wt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return si(this._today, this._offset);
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
    t < -14 || t > Ne || (this._slots = null, this._offset = t);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(e, t, s, i = null) {
    this._open = e, this._programId = t.id, this._group = s ? structuredClone(s) : null, this._act = i, this._error = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var o;
      return (o = this.renderRoot.querySelector(".editor")) == null ? void 0 : o.scrollIntoView({ block: "start" });
    }));
  }
  _cancel() {
    this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._act = null, this._error = "";
  }
  _add(e = is) {
    const t = this._programs[0], s = this._entities[0];
    if (!t || !s) return;
    const i = {
      id: mt(),
      start: { time: "08:00" },
      end: this._entities.every(Lt) ? null : { time: "09:00" },
      conditions: [],
      actions: { by_type: {}, by_entity: {} }
    };
    this._expand("new", t, { slot: i, days: [...e], ids: {}, fresh: !0 });
  }
  /* ---- saving ---- */
  async _saveProgram(e) {
    var t, s;
    this._saving = !0;
    try {
      return await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(e) }), !0;
    } catch (i) {
      const o = i;
      return (o == null ? void 0 : o.code) === "conflict" ? this._error = d(this._lang, "ss_conflict") : (o == null ? void 0 : o.code) === "unauthorized" ? this._error = d(this._lang, "err_unauthorized") : (t = o == null ? void 0 : o.message) != null && t.includes("service_has_no_end") ? this._error = d(this._lang, "err_service_end") : (s = o == null ? void 0 : o.message) != null && s.includes("overlapping_slots") ? this._error = d(this._lang, "w_err_overlap") : this._error = d(this._lang, "ss_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  _problem(e) {
    const t = this._lang, s = this._group;
    return s ? s.days.length ? s.slot.end && JSON.stringify(s.slot.start) === JSON.stringify(s.slot.end) ? d(t, "w_err_same") : this._entities.some((i) => e.entities.some((o) => o.entity_id === i) && It(s.slot, i, this.data.modes)) ? "" : d(t, "err_action") : d(t, "err_days") : "";
  }
  /** The rest of a group edited from one day, minus the days the edit now covers. */
  _kept(e) {
    const t = this._rest;
    if (!t) return [];
    const s = t.days.filter((o) => !e.includes(o)), i = Object.fromEntries(s.filter((o) => t.ids[o]).map((o) => [o, t.ids[o]]));
    return s.length ? [{ ...t, days: s, ids: i }] : [];
  }
  async _saveRow() {
    const e = this._programs.find((c) => c.id === this._programId), t = this._group;
    if (!e || !t) return;
    const s = this._problem(e);
    if (s) {
      this._error = s;
      return;
    }
    const i = jt(e, this.data), o = this._include(e), n = ze(i, o, this._minutes).filter((c) => `${e.id}|${c.ids[c.days[0]]}` !== this._open);
    n.push(...this._kept(t.days), t);
    const r = As(i, n, o, this._minutes);
    for (const c of r.days)
      if (ve(c)) {
        this._error = d(this._lang, "w_err_overlap");
        return;
      }
    await this._saveProgram({ ...e, profiles: e.profiles.map((c) => c.id === i.id ? r : c) }) && this._cancel();
  }
  async _deleteRow() {
    const e = this._programs.find((n) => n.id === this._programId);
    if (!e || this._open === "new" || !await Ct(this, d(this._lang, "w_confirm_slot"), d(this._lang, "yes"), d(this._lang, "no"))) return;
    const t = jt(e, this.data), s = this._include(e), i = ze(t, s, this._minutes).filter((n) => `${e.id}|${n.ids[n.days[0]]}` !== this._open);
    i.push(...this._kept([]));
    const o = As(t, i, s, this._minutes);
    await this._saveProgram({ ...e, profiles: e.profiles.map((n) => n.id === t.id ? o : n) }) && this._cancel();
  }
  async _saveRest(e) {
    const t = this._programs[0], s = this._act;
    if (!t || !s) return;
    const i = t.entities.map((o) => o.entity_id === e ? { ...o, default: so(s) } : o);
    await this._saveProgram({ ...t, entities: i }) && this._cancel();
  }
  /* ---- pause / delete ---- */
  get _enabled() {
    return this._programs.some((e) => e.enabled);
  }
  async _setEnabled(e, t) {
    if (!e && !await Ct(this, d(this._lang, "confirm_pause", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no"))) {
      t.checked = !0;
      return;
    }
    try {
      for (const s of this._programs)
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: s.id, enabled: e });
    } catch (s) {
      this._error = d(this._lang, "error", { message: (s == null ? void 0 : s.message) ?? String(s) });
    }
  }
  async _deleteAll() {
    if (await Ct(this, d(this._lang, "confirm_delete_schedule", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no")))
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
        this._error = d(this._lang, "error", { message: (e == null ? void 0 : e.message) ?? String(e) });
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
    const t = this._lang, s = We(t, e.start);
    return e.end ? `${s}–${We(t, e.end)}` : s;
  }
  _rowText(e, t) {
    const s = this._lang, o = this._entities.filter((h) => e.entities.some((u) => u.entity_id === h)).map((h) => ({ e: h, act: It(t.slot, h, this.data.modes) })).filter((h) => h.act), n = o[0], r = n ? se(this.hass, s, this.data.modes, n.e, n.act) : "", a = o.length > 1 ? ` +${o.length - 1}` : "", c = no(s, B(s).days_short, t.days);
    return {
      text: [`${r}${a}`, this._when(t.slot)].filter(Boolean).join(" · "),
      days: c,
      color: n ? Qs(this.data.modes, n.e, n.act) : "var(--disabled-text-color)"
    };
  }
  _renderRow(e) {
    const { program: t, group: s, key: i } = e;
    if (this._open === i && this._group) return this._renderEditor(t, i);
    const { text: o, days: n, color: r } = this._rowText(t, s);
    return l`<button class="row" aria-expanded="false" @click=${() => this._expand(i, t, s)}>
      <span class="dot" style="background:${r}"></span>
      <span class="txt"><span class="l1">${o}</span><span class="l2">${n}</span>${this._programs.length > 1 ? l`<small>${t.name}</small>` : p}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(e, t) {
    const s = this._lang, i = t === "new", o = this._entities.filter((n) => e.entities.some((r) => r.entity_id === n));
    return l`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${e} .group=${this._group} .entityIds=${o}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @group-change=${(n) => {
      n.stopPropagation(), this._group = n.detail, this._error = "";
    }}></wp-slot-form>
      ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : p}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${d(s, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${d(s, "cancel")}</button>
      </div>
      ${i ? p : l`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${d(s, "delete")}</button>`}
    </div>`;
  }
  _renderRest() {
    const e = this._lang, t = this._programs[0];
    return t ? this._entities.filter((s) => !Lt(s) && t.entities.some((i) => i.entity_id === s)).map((s) => {
      const i = t.entities.find((c) => c.entity_id === s), o = eo(i, this.data.modes), n = `rest:${s}`, r = this._entities.length > 1 ? `${d(e, "rest_of_time")} · ${St(this.hass, s)}` : d(e, "rest_of_time");
      if (this._open === n)
        return l`<div class="editor"><h4>${r}</h4>
          <wp-action-picker rest .hass=${this.hass} .data=${this.data} entity-id=${s} .act=${this._act} ?disabled=${!this._canEdit}
            @act-change=${(c) => {
          c.stopPropagation(), this._act = c.detail;
        }}></wp-action-picker>
          ${this._error ? l`<p class="err" role="alert">${this._error}</p>` : p}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(s)}>${d(e, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${d(e, "cancel")}</button>
          </div></div>`;
      const a = o.special === "none" ? d(e, "rest_none_short") : o.special === "previous" ? d(e, "rest_previous_short") : se(this.hass, e, this.data.modes, s, o);
      return l`<button class="row rest" aria-expanded="false" @click=${() => this._expand(n, t, null, o)}>
        <ha-icon icon="mdi:update"></ha-icon>
        <span class="txt">${r} · <b>${a}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : p;
  }
  _renderChart() {
    const e = this._lang, t = this._programs[0];
    if (!this.chart || !t || !this._chartEntity) return p;
    const s = this._date, i = new Intl.DateTimeFormat(e, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${s}T12:00:00Z`));
    return l`<section class="chart">
      ${this._entities.length > 1 ? l`<select aria-label=${d(e, "chart")} @change=${(o) => this._chartEntity = o.target.value}>
        ${this._entities.map((o) => l`<option value=${o} ?selected=${o === this._chartEntity}>${St(this.hass, o)}</option>`)}</select>` : p}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${d(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? d(e, "today") : i}</span>
        <button class="ibtn" ?disabled=${this._offset >= Ne} aria-label=${d(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
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
      return l`<wp-dialog open heading=${this._title}><p class="muted">${d(e, "no_program")}</p></wp-dialog>`;
    const t = this._rows(), s = !!((i = this.hass.user) != null && i.is_admin) && this.data.can_edit;
    return l`
      <wp-dialog open heading=${this._title}>
        ${s ? l`<button slot="header-actions" class="gear" aria-label=${d(e, "settings")} @click=${() => this._settings()}>
          <ha-icon icon="mdi:cog"></ha-icon></button>` : p}
        ${this._canEdit ? p : l`<p class="err" role="alert">${d(e, "read_only")}</p>`}
        ${this._error && !this._open ? l`<p class="err" role="alert">${this._error}</p>` : p}
        <div class="list">
          ${t.length ? t.map((o) => this._renderRow(o)) : this._open === "new" ? p : l`<p class="muted">${d(e, "w_none")}</p>`}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : p}
          ${this._open === null ? l`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${d(e, "w_add")}</span></button>` : p}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? p : l`${this._renderChart()}
        <label class="switch">
          <span class="grow">${d(e, "schedule_on")}</span>
          <span class="state">${this._enabled ? d(e, "running") : d(e, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(o) => void this._setEnabled(o.target.checked, o.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${d(e, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
T.styles = [st, H`
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
R([
  y({ attribute: !1 })
], T.prototype, "hass", 2);
R([
  y({ attribute: !1 })
], T.prototype, "data", 2);
R([
  y({ attribute: !1 })
], T.prototype, "scope", 2);
R([
  y({ type: Boolean })
], T.prototype, "chart", 2);
R([
  y({ attribute: !1 })
], T.prototype, "day", 2);
R([
  w()
], T.prototype, "_open", 2);
R([
  w()
], T.prototype, "_group", 2);
R([
  w()
], T.prototype, "_dayOnly", 2);
R([
  w()
], T.prototype, "_act", 2);
R([
  w()
], T.prototype, "_programId", 2);
R([
  w()
], T.prototype, "_error", 2);
R([
  w()
], T.prototype, "_saving", 2);
R([
  w()
], T.prototype, "_offset", 2);
R([
  w()
], T.prototype, "_slots", 2);
R([
  w()
], T.prototype, "_chartEntity", 2);
T = R([
  F("wp-schedule")
], T);
var zo = Object.defineProperty, jo = Object.getOwnPropertyDescriptor, lt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? jo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && zo(t, s, o), o;
};
const No = ["dawn", "sunrise", "sunset", "dusk"];
let Z = class extends M {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
  }
  willUpdate(e) {
    var t, s, i, o;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (s = this._s).actions ?? (s.actions = { by_type: {}, by_entity: {} }), (i = this._s.actions).by_type ?? (i.by_type = {}), (o = this._s.actions).by_entity ?? (o.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(Jt(E(t.entity_id)));
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
                    ${No.map((o) => l`<option value=${o} ?selected=${t.sun === o}>${this._tr(`sun_${o}`)}</option>`)}
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
        r ? a[o] = J(K(r)) : delete a[o], this._setSpec(e, a);
      }} />
                        ${t[o] ? l`<button class="ibtn" aria-label=${this._tr("clear")}
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
    return l`
      ${i ? l`<p class="time-big">24:00</p>` : l`<div class="field"><input type="time" step="300" aria-label=${s} .value=${t}
            @change=${(o) => {
      const n = o.target.value;
      n && this._setSpec(e, { time: J(K(n)) });
    }} /></div>`}
      ${e === "end" ? l`<label class="check"><input type="checkbox" .checked=${i}
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
    return Ze(this._lang, e);
  }
  _directEditor() {
    return l`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return l`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(s) => this._setDirect(
        e.entity_id,
        s.target.checked ? Vs(this.hass, e.entity_id) : null
      )} />
            <strong>${Yt(this.hass, e.entity_id)}</strong></label>
          ${t ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${t}
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
        ${this._s.color ? l`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : p}
      </div>
    </div>`;
  }
  /* ---- validation / save ---- */
  _validate() {
    var i;
    const e = this._s, t = "time" in e.start ? K(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === K(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= A) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const o of Object.values(e.actions.by_entity)) {
      if (o.kind === "scene" && !o.scene) return this._tr("err_incomplete");
      if (o.kind === "script" && !o.script) return this._tr("err_incomplete");
      if (o.kind === "action" && !o.action) return this._tr("err_incomplete");
    }
    if ((i = e.conditions) != null && i.some((o) => !o.entity_id)) return this._tr("err_incomplete");
    const s = ve([...this.others, e]);
    if (s) {
      const o = s.find((n) => n.id !== e.id) ?? s[0];
      return this._tr("err_overlap", { slot: ut(this.hass, o, this._lang) });
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
    return l`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", e.start)}
        <label class="check"><input type="checkbox" .checked=${!e.end}
          @change=${(t) => {
      if (t.target.checked) this._setSpec("end", null);
      else {
        const i = "time" in e.start ? K(e.start.time) : 480;
        this._setSpec("end", { time: J(Math.min(A, i + 60)) });
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

        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : p}
        <button slot="footer" class="btn" @click=${() => {
      var t, s;
      return (s = (t = this.shadowRoot) == null ? void 0 : t.querySelector("wp-dialog")) == null ? void 0 : s.close();
    }}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }
};
Z.styles = [
  st,
  H`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
lt([
  y({ attribute: !1 })
], Z.prototype, "hass", 2);
lt([
  y({ attribute: !1 })
], Z.prototype, "data", 2);
lt([
  y({ attribute: !1 })
], Z.prototype, "program", 2);
lt([
  y({ attribute: !1 })
], Z.prototype, "entry", 2);
lt([
  y({ attribute: !1 })
], Z.prototype, "others", 2);
lt([
  w()
], Z.prototype, "_s", 2);
lt([
  w()
], Z.prototype, "_mode", 2);
lt([
  w()
], Z.prototype, "_error", 2);
Z = lt([
  F("wp-slot-editor")
], Z);
var Io = Object.defineProperty, Ro = Object.getOwnPropertyDescriptor, j = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ro(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Io(t, s, o), o;
};
const zs = () => [[], [], [], [], [], [], []];
function ue(e) {
  return e.map((t) => ({ ...structuredClone(t), id: mt() }));
}
let O = class extends M {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._pickerKey = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this._picker || Js().then((e) => this._picker = e);
  }
  get _lang() {
    return et(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
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
        const t = mt();
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
          profiles: [{ id: t, name: this._tr("profile_default"), days: zs() }]
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
    for (const t of this._p.entities) e.add(Jt(E(t.entity_id)));
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
    const o = i.days.map((n, r) => r === e ? Ve(this.hass, t) : n);
    this._setProfile({ ...i, days: o });
  }
  _spill(e, t) {
    const s = e.days[(t + 6) % 7] ?? [];
    return Xe(s).reduce((i, o) => Math.max(i, o.end), 0);
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
        id: mt(),
        name: t,
        days: e.mode === "copy" ? i.days.map(ue) : zs()
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
            const h = Ve(this.hass, [...a, ...ue([s])]);
            return ve(h) ? (i.push(n), a) : h;
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
    const t = Jt(E(e)), s = this.data.modes.filter((n) => n.type === t), i = s.find((n) => /eco|off|closed/.test(n.id)) ?? s[0], o = i ? { kind: "mode", value: i.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: o, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var n;
    const s = this._p.entities[e], i = Jt(E(s.entity_id));
    let o;
    t === "mode" && (o = ((n = this.data.modes.find((r) => r.type === i)) == null ? void 0 : n.id) ?? ""), t === "setpoint" && (o = Vs(this.hass, s.entity_id)), this._setEntity(e, { default: o === void 0 ? { kind: t } : { kind: t, value: o } });
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
        if (ve(s.days[i]))
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
    await Ct(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
  }
  async _askDeleteProfile(e) {
    await Ct(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && this._deleteProfile();
  }
  async _askDeleteEntity(e) {
    var i;
    const t = (i = this._p.entities[e]) == null ? void 0 : i.entity_id;
    if (!t) return;
    const s = this._tr("confirm_delete", { name: Yt(this.hass, t) });
    await Ct(this, s, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((o, n) => n !== e) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = mt(), t = this._p, s = /* @__PURE__ */ new Map(), i = t.profiles.map((o) => {
      const n = o.id === this._activeId() ? e : mt();
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
          ${this._picker ? l`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${e.icon ?? ""}
                @value-changed=${(s) => this._patch({ icon: s.detail.value || null })}></ha-selector>` : l`<div class="row" style="flex-wrap:nowrap">
                ${e.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${e.icon}></ha-icon>` : p}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${e.icon ?? ""}
                  @input=${(s) => this._patch({ icon: s.target.value.trim() || null })} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(s) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(s.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${e.reapply}
        @change=${(s) => this._patch({ reapply: s.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      ${t.length ? l`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(s) => this._patch({ main_type: s.target.value })}>
              ${t.map((s) => l`<option value=${s} ?selected=${s === (e.main_type || t[0])}>${Ze(this._lang, s)}</option>`)}
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
    Ao(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const e = this._p;
    return l`
      ${e.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : p}
      ${e.entities.map((t, s) => this._renderEntity(t, s))}
      ${Ws(this._pickerKey, this._picker ? l`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: e.entities.map((t) => t.entity_id) } }}
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
    var a, c;
    const s = Jt(E(e.entity_id)), i = ((a = this.hass.states[e.entity_id]) == null ? void 0 : a.attributes) ?? {}, o = Array.isArray(i.preset_modes) && i.preset_modes.includes("permanent"), n = this.data.modes.filter((h) => h.type === s), r = ((c = e.default) == null ? void 0 : c.kind) ?? "none";
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Yt(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? p : l`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Yt(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${Lt(e.entity_id) ? p : l`<div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(h) => this._setDefaultKind(t, h.target.value)}>
            <option value="none" ?selected=${r === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${r === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${r === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${r === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>`}
        ${r === "mode" ? l`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(h) => this._setEntity(t, { default: { kind: "mode", value: h.target.value } })}>
              ${n.map((h) => l`<option value=${h.id} ?selected=${h.id === e.default.value}>${h.name}</option>`)}
            </select></div>` : p}
        ${r === "setpoint" ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(h) => {
      h.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: h.detail } });
    }}></wp-setpoint-editor>` : p}
        ${o || e.force_permanent ? l`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
              @change=${(h) => this._setEntity(t, { force_permanent: h.target.checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>` : p}
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
      ${t.id === s ? l`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : p}
      ${i ? l`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(i.mode === "rename" ? "profile_rename" : i.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${i.name}
                @input=${(o) => this._profileForm = { ...i, name: o.target.value }}
                @keydown=${(o) => {
      o.key === "Enter" && this._submitProfileForm();
    }} /></div>
            ${i.mode === "rename" ? l`<p class="hint">${this._tr("profile_rename_warning")}</p>` : p}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => this._profileForm = void 0}>${this._tr("cancel")}</button></div>
          </div>` : p}
      ${this._dayView === void 0 ? this._renderDays(t) : this._renderDayEditor(t, this._dayView)}
    `;
  }
  _renderDays(e) {
    return l`${e.days.map((t, s) => {
      const i = ii(this.hass, this.data, this._p, t, this._spill(e, s)), o = this._long(s);
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
    if (!e) return p;
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
    if (!this._p) return p;
    const e = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]], t = this._canEdit(), s = this._dayView;
    return l`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${t ? p : l`<p class="error" role="alert">${this._tr("read_only")}</p>`}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([i, o]) => l`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(o)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
        </div>
        ${this._error ? l`<p class="error" role="alert">${this._error}</p>` : p}
        ${this._isNew ? p : l`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${this._isNew ? p : l`<span slot="footer" class="break" aria-hidden="true"></span>
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
    }}></wp-slot-editor>` : p}
    `;
  }
};
O.styles = [
  st,
  H`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${Is(Eo)}
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
  y({ attribute: !1 })
], O.prototype, "hass", 2);
j([
  y({ attribute: !1 })
], O.prototype, "data", 2);
j([
  y({ attribute: !1 })
], O.prototype, "program", 2);
j([
  y({ attribute: !1 })
], O.prototype, "defaultTypes", 2);
j([
  y({ type: Number })
], O.prototype, "day", 2);
j([
  w()
], O.prototype, "_p", 2);
j([
  w()
], O.prototype, "_isNew", 2);
j([
  w()
], O.prototype, "_tab", 2);
j([
  w()
], O.prototype, "_profileId", 2);
j([
  w()
], O.prototype, "_dayView", 2);
j([
  w()
], O.prototype, "_slotEdit", 2);
j([
  w()
], O.prototype, "_error", 2);
j([
  w()
], O.prototype, "_saving", 2);
j([
  w()
], O.prototype, "_picker", 2);
j([
  w()
], O.prototype, "_copy", 2);
j([
  w()
], O.prototype, "_profileForm", 2);
O = j([
  F("wp-program-editor")
], O);
var Uo = Object.defineProperty, Fo = Object.getOwnPropertyDescriptor, ct = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Fo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && Uo(t, s, o), o;
};
const Lo = {
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
let Q = class extends M {
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = qi(this.hass, (t) => {
      this._data = t, this._error = void 0, this._loadNames(t), this._loadPreviews();
    }));
  }
  get _lang() {
    var e, t, s;
    return ((t = (e = this.hass) == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? ((s = this.hass) == null ? void 0 : s.language) ?? "en";
  }
  get _tz() {
    return this.hass.config.time_zone;
  }
  /** The moment `offset` days from now (only its local date and weekday are used). */
  _dateAt(e) {
    return new Date(this._now.getTime() + e * 864e5);
  }
  /** Translated names of the services used by the programs. */
  async _loadNames(e) {
    const t = /* @__PURE__ */ new Set();
    for (const s of e.programs)
      for (const i of s.profiles)
        for (const o of i.days)
          for (const n of o)
            for (const r of Object.values(n.actions.by_entity))
              r.kind === "service" && t.add(String(r.service).split(".")[0]);
    await ss(this.hass, [...t]) && this.requestUpdate();
  }
  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = [0, 1, 2, 3, 4, 5, 6].map((o) => wt(this._dateAt(o), this._tz)), t = xs(this._data, this._config), s = `${e[0]}|${t.map((o) => `${o.id}:${o.revision}`).join(",")}`;
    if (s === this._previewKey) return;
    this._previewKey = s;
    const i = {};
    await Promise.all(e.flatMap((o) => t.map((n) => this.hass.callWS({ type: "weekly_planner/preview", program_id: n.id, date: o }).then((r) => {
      (i[o] ?? (i[o] = {}))[n.id] = r.slots;
    }).catch(() => {
    })))), this._preview = i;
  }
  /* ---- blocks ---- */
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  _spans(e, t, s = 0) {
    const i = this._data, o = this._lang, n = this._dateAt(s), r = Ie(n, this._tz), a = this._preview[wt(n, this._tz)] ?? {}, c = [], h = (u) => It(u, e, i.modes);
    for (const u of [...t].reverse()) {
      if (!u.enabled) continue;
      const m = jt(u, i), b = (f, k, v, D = {}) => {
        const S = h(f);
        return { start: k, end: v, color: Qs(i.modes, e, S), label: se(this.hass, o, i.modes, e, S), ...D };
      };
      for (const { slot: f, end: k } of Xe(m.days[(r + 6) % 7]))
        h(f) && c.push(b(f, 0, k));
      const g = a[u.id];
      for (const f of m.days[r]) {
        if (!h(f)) continue;
        const k = g == null ? void 0 : g.find((S) => S.slot_id === f.id);
        let v = L(f.start), D = L(f.end ?? null);
        k && (v = Nt(k.start, this._tz), D = k.end ? Nt(k.end, this._tz) : null), v !== null && c.push(b(
          f,
          v,
          D === null ? v + 10 : D > v ? D : A,
          { sun: "sun" in f.start || !!(f.end && "sun" in f.end), ignored: (k == null ? void 0 : k.ignored) ?? null }
        ));
      }
    }
    return c;
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
  _open(e, t) {
    this._dialog = { kind: "schedule", scope: e, day: t };
  }
  /* ---- render ---- */
  _line(e, t, s) {
    var m, b;
    const i = this._lang, o = this._data, n = this._next(e, t), r = t.length > 0 && t.every((g) => !g.enabled), a = (m = o.entities[e]) == null ? void 0 : m.override, c = s.icon ?? ((b = this.hass.states[e]) == null ? void 0 : b.attributes.icon) ?? Lo[E(e)] ?? "mdi:calendar-clock", h = () => this._open(s.open), u = a ? a.origin === "voluntary" && a.until ? d(i, "overridden_until", { time: ge($s(a.until, this._tz, i, this._now)) }) : d(i, "overridden") : "";
    return l`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${c}></ha-icon>
          <div class="info">
            ${s.name ? l`<span class="name">${s.name}</span>` : p}
            <span class="now">
              <span class="nw">${io(this.hass, i, e)}</span>
              ${n ? l`<span class="nw">→ ${se(this.hass, i, o.modes, e, n.setpoint)}
                <span class="when">${ge($s(n.at, this._tz, i, this._now))}</span></span>` : p}
            </span>
          </div>
          ${r ? l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(i, "paused")}></ha-icon>` : p}
          ${s.button ? l`<button class="hours" aria-label=${d(i, "hours")} title=${d(i, "hours")} @click=${h}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : p}
        </div>
        <div class="today">
          <span class="wname">${d(i, "today_short")}</span>
          <wp-day-bar show-hours notches .spans=${this._spans(e, t)} .now=${Nt(this._now, this._tz)}
            @click=${h}></wp-day-bar>
        </div>
        ${a ? l`<div class="manual"><ha-icon icon="mdi:hand-back-right"></ha-icon><span>${u}</span>
          <button class="x" aria-label=${d(i, "cancel_manual")} @click=${() => void this._cancelOverride(e)}>
            <ha-icon icon="mdi:close"></ha-icon></button></div>` : p}
        ${this._weekRows(`${Ts(s.open)}|${e}`, e, t, s.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(e, t, s, i) {
    const o = this._lang, n = this._week.has(e), r = () => {
      const c = new Set(this._week);
      n ? c.delete(e) : c.add(e), this._week = c;
    }, a = B(o).days_short;
    return l`
      <button class="weekbtn" aria-expanded=${n} @click=${r}>
        <ha-icon icon=${n ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${d(o, "week")}</button>
      ${n ? l`<div class="week">
        ${[1, 2, 3, 4, 5, 6].map((c) => {
      const h = Ie(this._dateAt(c), this._tz);
      return l`<button class="wday" aria-label=${a[h]} @click=${() => this._open(i, { weekday: h, offset: c })}>
            <span class="wname">${a[h]}</span>
            <wp-day-bar notches .spans=${this._spans(t, s, c)}></wp-day-bar></button>`;
    })}
      </div>` : p}`;
  }
  _bySchedule(e) {
    const t = this._lang;
    return e.map((s) => {
      const i = { kind: "program", programId: s.id };
      return s.entities.length === 1 ? this._line(s.entities[0].entity_id, [s], { name: s.name, icon: s.icon ?? void 0, button: i, open: i }) : l`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${s.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${s.name}</h2>
          ${s.enabled ? p : l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(t, "paused")}></ha-icon>`}
          <button class="hours" aria-label=${d(t, "hours")} title=${d(t, "hours")} @click=${() => this._open(i)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
        </div>
        ${s.entities.map((o) => this._line(o.entity_id, [s], { name: St(this.hass, o.entity_id), button: null, open: i }))}
      </section>`;
    });
  }
  render() {
    var n;
    if (!this._config || !this.hass) return p;
    const e = this._lang, t = this._data, s = t ? xs(t, this._config) : [], i = !!t && !!((n = this.hass.user) != null && n.is_admin) && !!(t != null && t.can_edit), o = this._config.title !== void 0 && this._config.title !== "";
    return l`
      <ha-card>
        ${o || i || t != null && t.vacation ? l`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t != null && t.vacation ? l`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${d(e, "vacation")}</span>` : p}
              ${i ? l`<button class="gear" aria-label=${d(e, "all_programs")} @click=${() => this._dialog = { kind: "admin" }}>
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon></button>` : p}
            </div>` : p}
        ${this._error ? l`<div class="error">${d(e, "error", { message: this._error })}</div>` : p}
        ${t != null && t.read_only ? l`<div class="error">${d(e, "read_only")}</div>` : p}
        ${t ? p : l`<div class="empty">…</div>`}
        ${t && !s.length ? l`<div class="empty">${d(e, "no_program")}</div>` : p}
        ${t ? this._bySchedule(s) : p}
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
        return Ws(Ts(e.scope), l`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope} .day=${e.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${t}
          @open-settings=${(i) => {
          const o = this._data.programs.find((n) => n.id === i.detail.programId);
          o && (this._dialog = { kind: "program", program: o });
        }}></wp-schedule>`);
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((s = this._config.filter) == null ? void 0 : s.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "admin": {
        const i = this._lang;
        return l`<wp-dialog open heading=${d(i, "all_programs")} @closed=${t}>
          <div class="adm">
            ${this._data.programs.map((o) => l`<button class="admrow" @click=${() => this._dialog = { kind: "program", program: o }}>
              <ha-icon icon=${o.icon ?? "mdi:calendar-clock"}></ha-icon><span>${o.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => this._dialog = { kind: "program" }}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${d(i, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }
};
Q.styles = H`
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
    .line { display: flex; align-items: flex-start; gap: 10px; min-height: 28px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); margin-top: -1px; }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
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
    .today { display: flex; align-items: flex-start; gap: 8px; }
    .today .wname { line-height: 28px; margin-top: 2px; }
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
ct([
  y({ attribute: !1 })
], Q.prototype, "hass", 2);
ct([
  w()
], Q.prototype, "_config", 2);
ct([
  w()
], Q.prototype, "_data", 2);
ct([
  w()
], Q.prototype, "_error", 2);
ct([
  w()
], Q.prototype, "_dialog", 2);
ct([
  w()
], Q.prototype, "_preview", 2);
ct([
  w()
], Q.prototype, "_now", 2);
ct([
  w()
], Q.prototype, "_week", 2);
Q = ct([
  F("weekly-planner-card")
], Q);
var qo = Object.defineProperty, Wo = Object.getOwnPropertyDescriptor, we = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Wo(t, s) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (o = (i ? r(t, s, o) : r(o)) || o);
  return i && o && qo(t, s, o), o;
};
const Ho = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let Wt = class extends M {
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
    return d(this._lang, e, t);
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
              ${this._programs.length === 0 ? l`<option value="">${this._tr("no_program")}</option>` : p}
              ${!this._programs.some((o) => o.id === e.program) && e.program ? l`<option value=${e.program} selected>${e.program}</option>` : p}
              ${this._programs.map((o) => l`<option value=${o.id} ?selected=${o.id === e.program}>${o.name}</option>`)}
            </select></div>` : l`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${Ho.map((o) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(o)}
                @change=${(n) => this._setFilter({ types: n.target.checked ? [...t, o] : t.filter((r) => r !== o) })} />
                ${Ze(this._lang, o)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((i = e.filter) == null ? void 0 : i.area) ?? ""} placeholder="bureau"
                @input=${(o) => this._setFilter({ area: o.target.value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(o) => this._set("show_chart", o.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
Wt.styles = [st, H`:host { display: block; padding: 4px 0; }`];
we([
  y({ attribute: !1 })
], Wt.prototype, "hass", 2);
we([
  w()
], Wt.prototype, "_config", 2);
we([
  w()
], Wt.prototype, "_programs", 2);
Wt = we([
  F("weekly-planner-card-editor")
], Wt);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
