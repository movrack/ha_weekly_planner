/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pe = globalThis, Be = pe.ShadowRoot && (pe.ShadyCSS === void 0 || pe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, qe = Symbol(), os = /* @__PURE__ */ new WeakMap();
let Ms = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== qe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Be && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = os.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && os.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Os = (e) => new Ms(typeof e == "string" ? e : e + "", void 0, qe), H = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, n, o) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[o + 1], e[0]);
  return new Ms(s, e, qe);
}, Qs = (e, t) => {
  if (Be) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), n = pe.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, e.appendChild(i);
  }
}, rs = Be ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Os(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ti, defineProperty: ei, getOwnPropertyDescriptor: si, getOwnPropertyNames: ii, getOwnPropertySymbols: ni, getPrototypeOf: oi } = Object, _t = globalThis, as = _t.trustedTypes, ri = as ? as.emptyScript : "", Ce = _t.reactiveElementPolyfillSupport, Wt = (e, t) => e, he = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ri : null;
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
} }, Ve = (e, t) => !ti(e, t), ls = { attribute: !0, type: String, converter: he, reflect: !1, useDefault: !1, hasChanged: Ve };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), _t.litPropertyMetadata ?? (_t.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ot = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = ls) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, s);
      n !== void 0 && ei(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: n, set: o } = si(this.prototype, t) ?? { get() {
      return this[s];
    }, set(r) {
      this[s] = r;
    } };
    return { get: n, set(r) {
      const a = n == null ? void 0 : n.call(this);
      o == null || o.call(this, r), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ls;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Wt("elementProperties"))) return;
    const t = oi(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Wt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Wt("properties"))) {
      const s = this.properties, i = [...ii(s), ...ni(s)];
      for (const n of i) this.createProperty(n, s[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, n] of s) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const n = this._$Eu(s, i);
      n !== void 0 && this._$Eh.set(n, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const n of i) s.unshift(rs(n));
    } else t !== void 0 && s.push(rs(t));
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
    return Qs(t, this.constructor.elementStyles), t;
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
    var o;
    const i = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const r = (((o = i.converter) == null ? void 0 : o.toAttribute) !== void 0 ? i.converter : he).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var o, r;
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const a = i.getPropertyOptions(n), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((o = a.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? a.converter : he;
      this._$Em = n;
      const h = c.fromAttribute(s, a.type);
      this[n] = h ?? ((r = this._$Ej) == null ? void 0 : r.get(n)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, n = !1, o) {
    var r;
    if (t !== void 0) {
      const a = this.constructor;
      if (n === !1 && (o = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Ve)(o, s) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: n, wrapped: o }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), o !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), n === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [o, r] of n) {
        const { wrapped: a } = r, c = this[o];
        a !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, r, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), (i = this._$EO) == null || i.forEach((n) => {
        var o;
        return (o = n.hostUpdate) == null ? void 0 : o.call(n);
      }), this.update(s)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var s;
    (s = this._$EO) == null || s.forEach((i) => {
      var n;
      return (n = i.hostUpdated) == null ? void 0 : n.call(i);
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
Ot.elementStyles = [], Ot.shadowRootOptions = { mode: "open" }, Ot[Wt("elementProperties")] = /* @__PURE__ */ new Map(), Ot[Wt("finalized")] = /* @__PURE__ */ new Map(), Ce == null || Ce({ ReactiveElement: Ot }), (_t.reactiveElementVersions ?? (_t.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = globalThis, cs = (e) => e, ue = Ht.trustedTypes, ds = ue ? ue.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ds = "$lit$", ht = `lit$${Math.random().toFixed(9).slice(2)}$`, zs = "?" + ht, ai = `<${zs}>`, At = document, Jt = () => At.createComment(""), Kt = (e) => e === null || typeof e != "object" && typeof e != "function", Je = Array.isArray, li = (e) => Je(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", Pe = `[ 	
\f\r]`, Ut = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ps = /-->/g, hs = />/g, gt = RegExp(`>|${Pe}(?:([^\\s"'>=/]+)(${Pe}*=${Pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), us = /'/g, _s = /"/g, Ts = /^(?:script|style|textarea|title)$/i, js = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = js(1), it = js(2), zt = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), ms = /* @__PURE__ */ new WeakMap(), bt = At.createTreeWalker(At, 129);
function Ns(e, t) {
  if (!Je(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ds !== void 0 ? ds.createHTML(t) : t;
}
const ci = (e, t) => {
  const s = e.length - 1, i = [];
  let n, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = Ut;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, _, m = -1, f = 0;
    for (; f < c.length && (r.lastIndex = f, _ = r.exec(c), _ !== null); ) f = r.lastIndex, r === Ut ? _[1] === "!--" ? r = ps : _[1] !== void 0 ? r = hs : _[2] !== void 0 ? (Ts.test(_[2]) && (n = RegExp("</" + _[2], "g")), r = gt) : _[3] !== void 0 && (r = gt) : r === gt ? _[0] === ">" ? (r = n ?? Ut, m = -1) : _[1] === void 0 ? m = -2 : (m = r.lastIndex - _[2].length, h = _[1], r = _[3] === void 0 ? gt : _[3] === '"' ? _s : us) : r === _s || r === us ? r = gt : r === ps || r === hs ? r = Ut : (r = gt, n = void 0);
    const w = r === gt && e[a + 1].startsWith("/>") ? " " : "";
    o += r === Ut ? c + ai : m >= 0 ? (i.push(h), c.slice(0, m) + Ds + c.slice(m) + ht + w) : c + ht + (m === -2 ? a : w);
  }
  return [Ns(e, o + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Yt {
  constructor({ strings: t, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let o = 0, r = 0;
    const a = t.length - 1, c = this.parts, [h, _] = ci(t, s);
    if (this.el = Yt.createElement(h, i), bt.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (n = bt.nextNode()) !== null && c.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const m of n.getAttributeNames()) if (m.endsWith(Ds)) {
          const f = _[r++], w = n.getAttribute(m).split(ht), $ = /([.?@])?(.*)/.exec(f);
          c.push({ type: 1, index: o, name: $[2], strings: w, ctor: $[1] === "." ? pi : $[1] === "?" ? hi : $[1] === "@" ? ui : ge }), n.removeAttribute(m);
        } else m.startsWith(ht) && (c.push({ type: 6, index: o }), n.removeAttribute(m));
        if (Ts.test(n.tagName)) {
          const m = n.textContent.split(ht), f = m.length - 1;
          if (f > 0) {
            n.textContent = ue ? ue.emptyScript : "";
            for (let w = 0; w < f; w++) n.append(m[w], Jt()), bt.nextNode(), c.push({ type: 2, index: ++o });
            n.append(m[f], Jt());
          }
        }
      } else if (n.nodeType === 8) if (n.data === zs) c.push({ type: 2, index: o });
      else {
        let m = -1;
        for (; (m = n.data.indexOf(ht, m + 1)) !== -1; ) c.push({ type: 7, index: o }), m += ht.length - 1;
      }
      o++;
    }
  }
  static createElement(t, s) {
    const i = At.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Tt(e, t, s = e, i) {
  var r, a;
  if (t === zt) return t;
  let n = i !== void 0 ? (r = s._$Co) == null ? void 0 : r[i] : s._$Cl;
  const o = Kt(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== o && ((a = n == null ? void 0 : n._$AO) == null || a.call(n, !1), o === void 0 ? n = void 0 : (n = new o(e), n._$AT(e, s, i)), i !== void 0 ? (s._$Co ?? (s._$Co = []))[i] = n : s._$Cl = n), n !== void 0 && (t = Tt(e, n._$AS(e, t.values), n, i)), t;
}
class di {
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
    const { el: { content: s }, parts: i } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? At).importNode(s, !0);
    bt.currentNode = n;
    let o = bt.nextNode(), r = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let h;
        c.type === 2 ? h = new Qt(o, o.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (h = new _i(o, this, t)), this._$AV.push(h), c = i[++a];
      }
      r !== (c == null ? void 0 : c.index) && (o = bt.nextNode(), r++);
    }
    return bt.currentNode = At, n;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Qt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, s, i, n) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    t = Tt(this, t, s), Kt(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== zt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : li(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && Kt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(At.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var o;
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Yt.createElement(Ns(i.h, i.h[0]), this.options)), i);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === n) this._$AH.p(s);
    else {
      const r = new di(n, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = ms.get(t.strings);
    return s === void 0 && ms.set(t.strings, s = new Yt(t)), s;
  }
  k(t) {
    Je(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const o of t) n === s.length ? s.push(i = new Qt(this.O(Jt()), this.O(Jt()), this, this.options)) : i = s[n], i._$AI(o), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, s); t !== this._$AB; ) {
      const n = cs(t).nextSibling;
      cs(t).remove(), t = n;
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
  constructor(t, s, i, n, o) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = s, this._$AM = n, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(t, s = this, i, n) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) t = Tt(this, t, s, 0), r = !Kt(t) || t !== this._$AH && t !== zt, r && (this._$AH = t);
    else {
      const a = t;
      let c, h;
      for (t = o[0], c = 0; c < o.length - 1; c++) h = Tt(this, a[i + c], s, c), h === zt && (h = this._$AH[c]), r || (r = !Kt(h) || h !== this._$AH[c]), h === p ? t = p : t !== p && (t += (h ?? "") + o[c + 1]), this._$AH[c] = h;
    }
    r && !n && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class pi extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class hi extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class ui extends ge {
  constructor(t, s, i, n, o) {
    super(t, s, i, n, o), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Tt(this, t, s, 0) ?? p) === zt) return;
    const i = this._$AH, n = t === p && i !== p || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== p && (i === p || n);
    n && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class _i {
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
const Me = Ht.litHtmlPolyfillSupport;
Me == null || Me(Yt, Qt), (Ht.litHtmlVersions ?? (Ht.litHtmlVersions = [])).push("3.3.3");
const mi = (e, t, s) => {
  const i = (s == null ? void 0 : s.renderBefore) ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const o = (s == null ? void 0 : s.renderBefore) ?? null;
    i._$litPart$ = n = new Qt(t.insertBefore(Jt(), o), o, void 0, s ?? {});
  }
  return n._$AI(e), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $t = globalThis;
let P = class extends Ot {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = mi(s, this.renderRoot, this.renderOptions);
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
    return zt;
  }
};
var Ps;
P._$litElement$ = !0, P.finalized = !0, (Ps = $t.litElementHydrateSupport) == null || Ps.call($t, { LitElement: P });
const Oe = $t.litElementPolyfillSupport;
Oe == null || Oe({ LitElement: P });
($t.litElementVersions ?? ($t.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fi = (e) => (...t) => ({ _$litDirective$: e, values: t });
let yi = class {
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
const gi = {}, vi = (e, t = gi) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Is = fi(class extends yi {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (vi(e), this.key = t), s;
  }
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bi = { attribute: !0, type: String, converter: he, reflect: !1, hasChanged: Ve }, $i = (e = bi, t, s) => {
  const { kind: i, metadata: n } = s;
  let o = globalThis.litPropertyMetadata.get(n);
  if (o === void 0 && globalThis.litPropertyMetadata.set(n, o = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), o.set(s.name, e), i === "accessor") {
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
  return (t, s) => typeof s == "object" ? $i(e, t, s) : ((i, n, o) => {
    const r = n.hasOwnProperty(o);
    return n.constructor.createProperty(o, i), r ? Object.getOwnPropertyDescriptor(n, o) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function b(e) {
  return y({ ...e, state: !0, attribute: !1 });
}
const N = 5, S = 1440;
function J(e) {
  const [t, s] = e.split(":").map(Number);
  return t * 60 + s;
}
function V(e) {
  const t = Math.max(0, Math.min(S, Math.round(e / N) * N));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function Dt(e, t) {
  var r, a;
  const s = typeof e == "string" ? new Date(e) : e, i = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(s), n = Number(((r = i.find((c) => c.type === "hour")) == null ? void 0 : r.value) ?? 0), o = Number(((a = i.find((c) => c.type === "minute")) == null ? void 0 : a.value) ?? 0);
  return n * 60 + o;
}
function je(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: t, weekday: "short" }).format(e);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(s);
}
function Xt(e, t) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(e);
}
function L(e) {
  return !e || !("time" in e) ? null : J(e.time);
}
function wi(e, t) {
  const s = (t == null ? void 0 : t.start) ?? L(e.start) ?? 0, i = t ? t.end : L(e.end ?? null);
  return i == null ? [[s, Math.min(S, s + N)]] : i > s ? [[s, i]] : [[s, S]];
}
function Ke(e) {
  const t = [];
  for (const s of e) {
    const i = L(s.start), n = L(s.end ?? null);
    i !== null && n !== null && n <= i && n < 720 && t.push({ slot: s, end: n });
  }
  return t;
}
function Rs(e, t) {
  const s = (Math.round(t) % S + S) % S, i = Math.floor(s / 60), n = s % 60;
  if (e.toLowerCase().startsWith("fr")) return n ? `${i} h ${String(n).padStart(2, "0")}` : `${i} h`;
  const o = new Date(Date.UTC(2e3, 0, 1, i, n)), r = { timeZone: "UTC", hour: "numeric" };
  return n && (r.minute = "2-digit"), new Intl.DateTimeFormat(e, r).format(o).replace(/\s?(AM|PM)/, (a, c) => ` ${c.toLowerCase()}`);
}
function fs(e, t, s, i = /* @__PURE__ */ new Date()) {
  const n = new Date(e), o = Xt(n, t) === Xt(i, t), r = Rs(s, Dt(n, t));
  return o ? r : `${new Intl.DateTimeFormat(s, { timeZone: t, weekday: "short" }).format(n)} ${r}`;
}
var xi = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, Rt = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ki(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && xi(t, s, n), n;
};
let mt = class extends P {
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
    const t = this.now !== null && this.now >= e.start - 20 && this.now <= e.end + 20;
    return !this.thin && !t && this._width > 0 && (e.end - e.start) / S * this._width >= 60;
  }
  render() {
    const e = (t) => `${t / S * 100}%`;
    return l`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((t) => t.label).join(", ")}>
        ${this.spans.map(
      (t) => l`<div
            class="span ${t.ignored ? "ignored" : ""}"
            style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
            title=${t.label}
          >${this._fits(t) ? l`<span>${t.sun ? l`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : p}${t.label}</span>` : p}</div>`
    )}
        ${this.now !== null ? l`<div class="now" style="left:${e(this.now)}"></div>` : p}
      </div>
      ${this.showHours ? l`<div class="hours">${[0, 12, 24].map((t) => l`<span style="left:${e(t * 60)}">${t} h</span>`)}</div>` : p}
    `;
  }
};
mt.styles = H`
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
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
Rt([
  y({ attribute: !1 })
], mt.prototype, "spans", 2);
Rt([
  y({ type: Number })
], mt.prototype, "now", 2);
Rt([
  y({ type: Boolean })
], mt.prototype, "thin", 2);
Rt([
  y({ type: Boolean, attribute: "show-hours" })
], mt.prototype, "showHours", 2);
Rt([
  b()
], mt.prototype, "_width", 2);
mt = Rt([
  U("wp-day-bar")
], mt);
var Si = Object.defineProperty, Ai = Object.getOwnPropertyDescriptor, ve = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ai(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && Si(t, s, n), n;
};
let jt = class extends P {
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
jt.styles = H`
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
ve([
  y()
], jt.prototype, "heading", 2);
ve([
  y({ type: Boolean, reflect: !0 })
], jt.prototype, "open", 2);
ve([
  y({ type: Boolean })
], jt.prototype, "wide", 2);
jt = ve([
  U("wp-dialog")
], jt);
const Ei = {
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
  weekend: "Weekend",
  all_days: "Every day",
  weekdays: "Weekdays",
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
  all_programs: "All schedules",
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
  ce_display: "Display",
  ce_display_device: "By device",
  ce_display_schedule: "By schedule",
  yes: "Yes",
  no: "No",
  running: "On",
  stopped: "Off",
  rest_none_short: "None",
  rest_previous_short: "Before",
  add_param: "+ {name}"
}, Ci = {
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
  weekend: "Week-end",
  all_days: "Tous les jours",
  weekdays: "Semaine",
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
  all_programs: "Tous les horaires",
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
  ce_display: "Affichage",
  ce_display_device: "Par appareil",
  ce_display_schedule: "Par horaire",
  yes: "Oui",
  no: "Non",
  running: "En marche",
  stopped: "À l'arrêt",
  rest_none_short: "Rien",
  rest_previous_short: "Avant",
  add_param: "+ {name}"
};
function B(e) {
  return e.startsWith("fr") ? Ci : Ei;
}
function d(e, t, s = {}) {
  let i = B(e)[t];
  for (const [n, o] of Object.entries(s)) i = i.replace(`{${n}}`, o);
  return i;
}
var Pi = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Mi(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && Pi(t, s, n), n;
};
const tt = (e) => {
  var t;
  return ((t = e == null ? void 0 : e.locale) == null ? void 0 : t.language) ?? (e == null ? void 0 : e.language) ?? "en";
}, Ft = (e) => e === "input_boolean" ? "switch" : e;
function Ye(e, t) {
  const s = B(e)[`type_${t}`];
  return typeof s == "string" ? s : t;
}
const Oi = [
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
], et = H`
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
function Xe(e, t, s) {
  e.dispatchEvent(new CustomEvent(t, { detail: s, bubbles: !0, composed: !0 }));
}
function ys(e, t) {
  if (!t) return "";
  const s = t, i = (n) => d(e, `sp_${n}`);
  switch (t.kind) {
    case "preset":
      return `${Ue(e, String(s.preset))}${s.hvac_mode ? ` · ${s.hvac_mode}` : ""}`;
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
      return i(t.kind);
  }
}
let nt = class extends P {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
  }
  _ids() {
    var e;
    return Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((t) => !this.domains.length || this.domains.includes(E(t))).filter((t) => !this.exclude.includes(t)).filter((t) => !this.filter || this.filter(t)).sort();
  }
  _emit(e) {
    Xe(this, "wp-change", e);
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
          ${e.map((t) => l`<option value=${t}>${wt(this.hass, t)}</option>`)}
        </datalist>
      </div>`;
  }
};
nt.styles = [et, H`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
z([
  y({ attribute: !1 })
], nt.prototype, "hass", 2);
z([
  y()
], nt.prototype, "value", 2);
z([
  y()
], nt.prototype, "label", 2);
z([
  y({ attribute: !1 })
], nt.prototype, "domains", 2);
z([
  y({ attribute: !1 })
], nt.prototype, "exclude", 2);
z([
  y({ attribute: !1 })
], nt.prototype, "filter", 2);
nt = z([
  U("wp-entity-picker")
], nt);
let Gt = class extends P {
  constructor() {
    super(...arguments), this.conditions = [];
  }
  get _lang() {
    return tt(this.hass);
  }
  _tr(e) {
    return d(this._lang, e);
  }
  _set(e) {
    Xe(this, "wp-change", e);
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
Gt.styles = et;
z([
  y({ attribute: !1 })
], Gt.prototype, "hass", 2);
z([
  y({ attribute: !1 })
], Gt.prototype, "conditions", 2);
Gt = z([
  U("wp-conditions-editor")
], Gt);
const Us = {
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
}, Di = ["scene", "script", "action"];
function Ls(e, t) {
  const s = Us[E(t)];
  return Ne(e, t, s ? s[0] : "action");
}
function Ne(e, t, s) {
  var n, o, r, a, c, h;
  const i = ((n = e == null ? void 0 : e.states[t]) == null ? void 0 : n.attributes) ?? {};
  switch (s) {
    case "preset":
      return { kind: s, preset: ((o = i.preset_modes) == null ? void 0 : o[0]) ?? "" };
    case "temperature":
      return { kind: s, temperature: Number(i.temperature ?? i.min_temp ?? 20) };
    case "hvac_mode":
      return { kind: s, hvac_mode: ((r = i.hvac_modes) == null ? void 0 : r.find((_) => _ !== "off")) ?? "heat" };
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
let Q = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.value = null, this.admin = !1, this.stateOnly = !1, this._json = "", this._jsonError = !1, this._jsonFor = "";
  }
  get _lang() {
    return tt(this.hass);
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
    var n;
    const e = Us[this._domain] ?? [], t = !this.stateOnly && this.admin ? Di : [], s = (n = this.value) == null ? void 0 : n.kind, i = [...e, ...t];
    return s && !i.includes(s) && i.push(s), i;
  }
  _current() {
    return this.value ?? Ne(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }
  _emit(e) {
    const t = { kind: e.kind };
    for (const [s, i] of Object.entries(e))
      s !== "kind" && i !== void 0 && i !== "" && !(typeof i == "number" && Number.isNaN(i)) && (t[s] = i);
    e.kind === "scene" && (t.scene = e.scene ?? ""), e.kind === "script" && (t.script = e.script ?? ""), e.kind === "action" && (t.action = e.action ?? "", t.data = e.data ?? {}), e.kind === "preset" && (t.preset = e.preset ?? ""), Xe(this, "wp-change", t);
  }
  _patch(e) {
    this._emit({ ...this._current(), ...e });
  }
  _number(e, t, s, i, n = 1, o = "") {
    const r = this._current();
    return l`
      <div class="field">
        <label>${this._tr(e)}${o ? ` (${o})` : ""}</label>
        <input type="number" min=${s} max=${i} step=${n} .value=${r[t] === void 0 ? "" : String(r[t])}
          @change=${(a) => {
      const c = a.target.value;
      this._patch({ [t]: c === "" ? void 0 : Math.min(i, Math.max(s, Number(c))) });
    }} />
      </div>`;
  }
  _choice(e, t, s, i = !1, n = !1) {
    const r = this._current()[t] ?? "";
    if (!(s != null && s.length) && !i && n)
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
        const n = i.trim() ? JSON.parse(i) : {};
        if (n === null || typeof n != "object" || Array.isArray(n)) throw new Error("object");
        this._jsonError = !1, this._jsonFor = this.entityId + JSON.stringify(n, null, 2), this._patch({ data: n });
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
          @change=${(s) => this._emit(Ne(this.hass, this.entityId, s.target.value))}>
          ${e.map((s) => l`<option value=${s} ?selected=${s === t.kind}>${this._tr(`sp_${s}`)}</option>`)}
        </select>
      </div>
      ${this._fields(t)}
    `;
  }
};
Q.styles = et;
z([
  y({ attribute: !1 })
], Q.prototype, "hass", 2);
z([
  y({ attribute: "entity-id" })
], Q.prototype, "entityId", 2);
z([
  y({ attribute: !1 })
], Q.prototype, "value", 2);
z([
  y({ type: Boolean })
], Q.prototype, "admin", 2);
z([
  y({ type: Boolean, attribute: "state-only" })
], Q.prototype, "stateOnly", 2);
z([
  b()
], Q.prototype, "_json", 2);
z([
  b()
], Q.prototype, "_jsonError", 2);
Q = z([
  U("wp-setpoint-editor")
], Q);
let re, vt;
const ae = /* @__PURE__ */ new Set();
function zi(e, t) {
  return ae.add(t), re && t(re), vt || (vt = e.connection.subscribeMessage(
    (s) => {
      re = s, ae.forEach((i) => i(s));
    },
    { type: "weekly_planner/subscribe" }
  ), vt.catch(() => {
    vt = void 0;
  })), () => {
    ae.delete(t), ae.size === 0 && vt && (vt.then((s) => s()).catch(() => {
    }), vt = void 0, re = void 0);
  };
}
const E = (e) => e.split(".")[0];
function Ie(e) {
  var t;
  return e.main_type || E(((t = e.entities[0]) == null ? void 0 : t.entity_id) ?? "climate");
}
function Bt(e, t) {
  var i;
  const s = ((i = t.status[e.id]) == null ? void 0 : i.active_profile) ?? e.active_profile;
  return e.profiles.find((n) => n.id === s) ?? e.profiles[0];
}
function Ge(e, t, s) {
  const i = e.actions.by_type[Ie(t)] ?? Object.values(e.actions.by_type)[0];
  return s.find((n) => n.id === i);
}
function _e(e, t, s) {
  var i;
  return e.color || ((i = Ge(e, t, s)) == null ? void 0 : i.color) || "var(--secondary-text-color)";
}
function Re(e, t, s, i) {
  const n = Ge(e, t, s);
  if (n) return n.name;
  const o = t.entities.map((r) => e.actions.by_entity[r.entity_id]).filter((r) => !!r);
  return o.length ? o.length > 1 ? `${ys(i, o[0])} +${o.length - 1}` : ys(i, o[0]) : "";
}
function wt(e, t) {
  var s;
  return ((s = e.states[t]) == null ? void 0 : s.attributes.friendly_name) ?? t;
}
function gs(e, t) {
  var n, o;
  if (t.program) return e.programs.filter((r) => r.id === t.program);
  const s = (n = t.filter) == null ? void 0 : n.types, i = (o = t.filter) == null ? void 0 : o.area;
  return e.programs.filter((r) => !(s != null && s.length) || r.entities.some((a) => s.includes(E(a.entity_id)))).filter((r) => !i || r.area === i).sort((r, a) => r.priority - a.priority || r.name.localeCompare(a.name));
}
function ut() {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function me(e, t) {
  return new Intl.NumberFormat(e, { maximumFractionDigits: 1 }).format(t);
}
function Ue(e, t) {
  const s = B(e)[`preset_${t}`];
  return typeof s == "string" ? s : t;
}
const be = (e, t) => {
  var s;
  return ((s = e.exceptions) == null ? void 0 : s[t]) ?? e.value;
}, le = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Fs(e, t, s) {
  var n, o, r;
  const i = ((n = e.states[t]) == null ? void 0 : n.attributes) ?? {};
  return le((o = i.preset_temperatures) == null ? void 0 : o[s]) ?? le((r = i.preset_temperatures) == null ? void 0 : r[`${s}_temp`]) ?? le(i[`${s}_temp`]) ?? le(i[`${s}_temperature`]);
}
const Ws = " ", fe = (e) => e.replace(/ /g, Ws), xt = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function qt(e, t, s) {
  const i = e.actions.by_entity[t];
  if (i)
    return { sp: i };
  const n = e.actions.by_type[E(t)], o = s.find((r) => r.id === n);
  return o ? { sp: be(o, t), modeId: o.id } : null;
}
function Ti(e, t, s, i) {
  const n = E(s), o = { ...e.actions.by_type }, r = { ...e.actions.by_entity }, a = t.entities.filter((c) => E(c.entity_id) === n).length <= 1;
  return i.modeId && a ? (o[n] = i.modeId, delete r[s]) : (r[s] = i.sp, a && delete o[n]), { ...e, actions: { by_type: o, by_entity: r } };
}
function ji(e, t) {
  const s = e.default ?? { kind: "none" };
  if (s.kind === "mode") {
    const i = t.find((n) => n.id === s.value);
    if (i) return { sp: be(i, e.entity_id), modeId: i.id };
  }
  return s.kind === "setpoint" && s.value && typeof s.value == "object" ? { sp: s.value } : { sp: { kind: "off" }, special: s.kind === "previous" ? "previous" : "none" };
}
function Ni(e) {
  return e.special ? { kind: e.special } : e.modeId ? { kind: "mode", value: e.modeId } : { kind: "setpoint", value: e.sp };
}
const kt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Zt(e, t, s, i, n) {
  var h;
  const o = "sp" in n ? n : { sp: n }, r = o.sp, a = o.modeId ? s.find((_) => _.id === o.modeId) : void 0, c = E(i);
  switch (r.kind) {
    case "scene":
      return String(((h = e.states[String(r.scene)]) == null ? void 0 : h.attributes.friendly_name) ?? r.scene);
    case "temperature":
      return `${me(t, Number(r.temperature))} °C`;
    case "preset": {
      if (a) return a.name;
      const _ = Fs(e, i, String(r.preset));
      return _ !== null ? `${Ue(t, String(r.preset))} ${me(t, _)} °C` : Ue(t, String(r.preset));
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
      const _ = [d(t, "act_on")];
      return kt(r.brightness) !== null && _.push(`${r.brightness} %`), r.effect && _.push(String(r.effect)), kt(r.color_temp_kelvin) !== null && _.push(`${r.color_temp_kelvin} K`), _.join(" ");
    }
    default:
      return (a == null ? void 0 : a.name) ?? String(r.kind);
  }
}
function Ii(e, t, s) {
  const i = e.states[s];
  if (!i) return "?";
  if (i.state === "unavailable" || i.state === "unknown") return "—";
  const n = i.attributes;
  switch (E(s)) {
    case "climate": {
      if (i.state === "off") return d(t, "sp_off");
      const o = kt(n.temperature);
      return o !== null ? `${me(t, o)} °C` : i.state;
    }
    case "cover": {
      const o = kt(n.current_position);
      return i.state === "open" && o !== null && o < 100 ? `${o} %` : i.state === "open" ? d(t, "sp_open") : i.state === "closed" ? d(t, "sp_close") : `${o ?? ""} %`;
    }
    case "light": {
      if (i.state !== "on") return d(t, "sp_off");
      const o = kt(n.brightness);
      return o !== null ? `${d(t, "sp_on")} ${Math.round(o / 255 * 100)} %` : d(t, "sp_on");
    }
    default:
      return i.state === "on" ? d(t, "sp_on") : i.state === "off" ? d(t, "sp_off") : i.state;
  }
}
function Hs(e, t, s) {
  if (!s) return "var(--disabled-text-color, #9e9e9e)";
  const i = s.modeId ? e.find((o) => o.id === s.modeId) : e.find((o) => xt(be(o, t), s.sp));
  if (i) return i.color;
  const n = s.sp;
  switch (n.kind) {
    case "temperature": {
      const o = Math.max(10, Math.min(24, Number(n.temperature)));
      return `hsl(${Math.round(210 - (o - 10) / 14 * 180)}, 70%, 48%)`;
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
const Ri = (e, t) => {
  const s = Math.abs(t), i = s < 60 ? `${s} min` : s % 60 ? `${Math.floor(s / 60)} h ${String(s % 60).padStart(2, "0")}` : `${s / 60} h`;
  return `${t > 0 ? "+" : "−"}${i}`;
};
function Le(e, t, s) {
  if ("time" in t) {
    const [o, r] = t.time.split(":").map(Number);
    return fe(o * 60 + r >= S ? "24 h" : Rs(e, o * 60 + r));
  }
  const i = d(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`), n = t.offset ? ` ${Ri(e, t.offset)}` : "";
  return fe(`${i}${n}`);
}
function vs(e, t) {
  if ("time" in e) {
    const [s, i] = e.time.split(":").map(Number), n = Math.max(0, Math.min(S, Math.round((s * 60 + i + t) / N) * N));
    return { time: n >= S ? "24:00" : `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}` };
  }
  return { ...e, offset: Math.max(-240, Math.min(240, (e.offset ?? 0) + t)) };
}
const Bs = [0, 1, 2, 3, 4], qs = [5, 6], Ze = [0, 1, 2, 3, 4, 5, 6];
function Ui(e, t, s) {
  const i = [...s].sort((n, o) => n - o);
  return xt(i, Ze) ? d(e, "all_days_text") : xt(i, Bs) ? `${t[0]}–${t[4]}` : xt(i, qs) ? d(e, "weekend") : i.map((n) => t[n]).join(Ws);
}
function Fe(e) {
  if (Array.isArray(e)) return `[${e.map(Fe).join(",")}]`;
  if (e && typeof e == "object") {
    const t = e;
    return `{${Object.keys(t).sort().map((s) => `${JSON.stringify(s)}:${Fe(t[s])}`).join(",")}}`;
  }
  return JSON.stringify(e);
}
function Li(e) {
  const { id: t, ...s } = e;
  return Fe({ ...s, conditions: e.conditions ?? [], end: e.end ?? null, color: e.color ?? null });
}
function De(e, t, s) {
  const i = /* @__PURE__ */ new Map();
  return e.days.forEach((n, o) => {
    for (const r of n) {
      if (!t(r)) continue;
      const a = Li(r);
      let c = i.get(a);
      if (c && c.days.includes(o)) {
        c = void 0, i.set(`${a}#${r.id}`, { slot: r, days: [o], ids: { [o]: r.id } });
        continue;
      }
      c || (c = { slot: r, days: [], ids: {} }, i.set(a, c)), c.days.push(o), c.ids[o] = r.id;
    }
  }), [...i.values()].sort(
    (n, o) => s(n.slot.start) - s(o.slot.start) || n.days[0] - o.days[0]
  );
}
function bs(e, t, s, i) {
  const n = e.days.map((o) => o.filter((r) => !s(r)));
  for (const o of t)
    for (const r of o.days)
      n[r].push({ ...structuredClone(o.slot), id: o.ids[r] ?? ut() });
  return { ...e, days: n.map((o) => o.sort((r, a) => i(r.start) - i(a.start))) };
}
const Fi = /* @__PURE__ */ new Set(["none", "temporary", "permanent"]);
function Wi(e, t) {
  return Object.values(e.states).filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(t)).map((s) => ({ id: s.entity_id, name: String(s.attributes.friendly_name ?? s.entity_id) })).sort((s, i) => s.name.localeCompare(i.name));
}
function Hi(e, t, s, i, n = !0) {
  var m;
  const o = E(i), r = ((m = e.states[i]) == null ? void 0 : m.attributes) ?? {}, a = [], c = (f) => {
    a.some((w) => w.id === f.id || f.group === "common" && xt(w.act.sp, f.act.sp)) || a.push(f);
  }, h = (f, w, $, T) => c({ id: f, label: w, act: { sp: $ }, group: "basic", param: T });
  if (o === "climate") {
    h("temperature", d(t, "act_temp"), { kind: "temperature", temperature: kt(r.temperature) ?? 19 }, "temperature");
    for (const f of r.preset_modes ?? [])
      Fi.has(f) || c({
        id: `preset:${f}`,
        label: Zt(e, t, [], i, { kind: "preset", preset: f }),
        group: "own",
        act: { sp: { kind: "preset", preset: f } }
      });
    (r.hvac_modes ?? []).includes("off") && h("off", d(t, "sp_off"), { kind: "off" });
  } else o === "cover" ? (h("open", d(t, "act_open"), { kind: "open" }), h("close", d(t, "act_close"), { kind: "close" }), h("position", d(t, "act_pos"), { kind: "position", position: kt(r.current_position) ?? 50 }, "position")) : o === "light" ? (h("on", d(t, "act_on"), { kind: "on" }, "light"), h("off", d(t, "act_off"), { kind: "off" })) : ["switch", "input_boolean", "fan"].includes(o) && (h("on", d(t, "act_on"), { kind: "on" }), h("off", d(t, "act_off"), { kind: "off" }));
  if (n)
    for (const f of Wi(e, i))
      c({ id: f.id, label: f.name, group: "scene", act: { sp: { kind: "scene", scene: f.id } } });
  const _ = o === "input_boolean" ? "switch" : o;
  for (const f of s.filter((w) => w.type === _))
    c({ id: `mode:${f.id}`, label: f.name, group: "common", act: { sp: be(f, i), modeId: f.id } });
  return a;
}
function Bi(e, t) {
  if (!t) return;
  const s = t.modeId ? e.find((n) => n.act.modeId === t.modeId) : void 0;
  if (s) return s;
  const i = t.sp.kind;
  return e.find((n) => n.param && n.act.sp.kind === i && !n.act.modeId) ?? e.find((n) => !n.act.modeId && xt(n.act.sp, t.sp)) ?? e.find((n) => xt(n.act.sp, t.sp));
}
var qi = Object.defineProperty, Vi = Object.getOwnPropertyDescriptor, Ct = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Vi(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && qi(t, s, n), n;
};
const ct = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Lt = (e, t, s) => Math.min(s, Math.max(t, e));
let ot = class extends P {
  constructor() {
    super(...arguments), this.entityId = "", this.act = null, this.rest = !1, this.disabled = !1;
  }
  get _lang() {
    return tt(this.hass);
  }
  _emit(e) {
    this.dispatchEvent(new CustomEvent("act-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _choices() {
    return Hi(this.hass, this._lang, this.data.modes, this.entityId, !this.rest);
  }
  _pick(e) {
    this._emit({ ...e.act, sp: structuredClone(e.act.sp) });
  }
  _patch(e, t = []) {
    var i;
    const s = { ...((i = this.act) == null ? void 0 : i.sp) ?? { kind: "on" }, ...e };
    for (const n of t) delete s[n];
    this._emit({ sp: s });
  }
  _stepper(e, t, s, i, n) {
    return l`<div class="stepper" role="group" aria-label=${e}>
      <span class="lbl">${e}</span>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="−" @click=${s}><ha-icon icon="mdi:minus"></ha-icon></button>
      <output>${t}</output>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="+" @click=${i}><ha-icon icon="mdi:plus"></ha-icon></button>
      ${n ? l`<button class="ibtn round" ?disabled=${this.disabled} aria-label=${d(this._lang, "clear")} @click=${n}><ha-icon icon="mdi:close"></ha-icon></button>` : p}
    </div>`;
  }
  _params(e) {
    var h;
    if (!(e != null && e.param) || !this.act) return p;
    const t = this._lang, s = ((h = this.hass.states[this.entityId]) == null ? void 0 : h.attributes) ?? {}, i = this.act.sp;
    if (e.param === "temperature") {
      const _ = ct(s.min_temp) ?? 5, m = ct(s.max_temp) ?? 35, f = ct(i.temperature) ?? 19, w = ($) => this._patch({ temperature: Lt(Math.round($ * 2) / 2, _, m) });
      return this._stepper(d(t, "act_temp"), `${me(t, f)} °C`, () => w(f - 0.5), () => w(f + 0.5));
    }
    if (e.param === "position") {
      const _ = ct(i.position) ?? 50, m = (f) => this._patch({ position: Lt(Math.round(f / 5) * 5, 0, 100) });
      return l`${this._stepper(d(t, "act_pos"), `${_} %`, () => m(_ - 10), () => m(_ + 10))}
        <input type="range" min="0" max="100" step="5" .value=${String(_)} ?disabled=${this.disabled}
          aria-label=${d(t, "act_pos")} @change=${(f) => m(Number(f.target.value))} />`;
    }
    const n = s.supported_color_modes ?? [], o = (s.effect_list ?? []).filter((_) => _ !== "off"), r = [], a = [], c = (_, m) => a.push(l`
      <button class="chip add" ?disabled=${this.disabled} @click=${() => this._patch(m)}>${d(t, "add_param", { name: _ })}</button>`);
    if (n.some((_) => _ !== "onoff")) {
      const _ = ct(i.brightness), m = (f) => this._patch({ brightness: Lt(Math.round(f / 5) * 5, 5, 100) });
      _ === null ? c(d(t, "act_brightness"), { brightness: 80 }) : r.push(this._stepper(d(t, "act_brightness"), `${_} %`, () => m(_ - 10), () => m(_ + 10), () => this._patch({}, ["brightness"])));
    }
    if (n.includes("color_temp")) {
      const _ = ct(s.min_color_temp_kelvin) ?? 2e3, m = ct(s.max_color_temp_kelvin) ?? 6500, f = ct(i.color_temp_kelvin), w = ($) => this._patch({ color_temp_kelvin: Lt(Math.round($ / 100) * 100, _, m) });
      f === null ? c(d(t, "act_kelvin"), { color_temp_kelvin: Lt(2700, _, m) }) : r.push(this._stepper(d(t, "act_kelvin"), `${f} K`, () => w(f - 200), () => w(f + 200), () => this._patch({}, ["color_temp_kelvin"])));
    }
    return o.length && (i.effect ? r.push(l`<div class="stepper"><span class="lbl">${d(t, "act_effect")}</span>
        <select class="grow" ?disabled=${this.disabled} aria-label=${d(t, "act_effect")}
          @change=${(_) => this._patch({ effect: _.target.value })}>
          ${o.map((_) => l`<option value=${_} ?selected=${_ === i.effect}>${_}</option>`)}
        </select>
        <button class="ibtn round" ?disabled=${this.disabled} aria-label=${d(t, "clear")} @click=${() => this._patch({}, ["effect"])}><ha-icon icon="mdi:close"></ha-icon></button></div>`) : c(d(t, "act_effect"), { effect: o[0] })), l`${r}${a.length ? l`<div class="chips adders">${a}</div>` : p}`;
  }
  render() {
    var r, a, c;
    if (!this.hass || !this.data || !this.entityId) return p;
    const e = this._lang, t = this._choices(), s = (r = this.act) != null && r.special ? void 0 : Bi(t, this.act), i = this.act && !this.act.special && !s, n = E(this.entityId), o = (h, _, m, f) => l`
      <button class="chip ${_ ? "on" : ""}" role="radio" aria-checked=${_} ?disabled=${this.disabled} @click=${m}>
        ${f ? l`<ha-icon icon=${f}></ha-icon>` : p}<span>${h}</span></button>`;
    return l`
      <div class="chips" role="radiogroup" aria-label=${d(e, "action")}>
        ${i ? o(d(e, "act_custom"), !0, () => {
    }) : p}
        ${t.map((h) => o(
      h.label,
      (s == null ? void 0 : s.id) === h.id,
      () => this._pick(h),
      h.group === "scene" ? "mdi:palette-outline" : void 0
    ))}
        ${this.rest ? l`
          ${o(d(e, "rest_none"), ((a = this.act) == null ? void 0 : a.special) === "none", () => this._emit({ sp: { kind: "off" }, special: "none" }))}
          ${o(d(e, "rest_previous"), ((c = this.act) == null ? void 0 : c.special) === "previous", () => this._emit({ sp: { kind: "off" }, special: "previous" }))}` : p}
      </div>
      ${n ? this._params(s) : p}`;
  }
};
ot.styles = [et, H`
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
  `];
Ct([
  y({ attribute: !1 })
], ot.prototype, "hass", 2);
Ct([
  y({ attribute: !1 })
], ot.prototype, "data", 2);
Ct([
  y({ attribute: "entity-id" })
], ot.prototype, "entityId", 2);
Ct([
  y({ attribute: !1 })
], ot.prototype, "act", 2);
Ct([
  y({ type: Boolean })
], ot.prototype, "rest", 2);
Ct([
  y({ type: Boolean })
], ot.prototype, "disabled", 2);
ot = Ct([
  U("wp-action-picker")
], ot);
var Ji = Object.defineProperty, Ki = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ki(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && Ji(t, s, n), n;
};
function $s(e, t) {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: t,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(e)), i = (o) => {
    var r;
    return Number(((r = s.find((a) => a.type === o)) == null ? void 0 : r.value) ?? 0);
  };
  return Date.UTC(i("year"), i("month") - 1, i("day"), i("hour"), i("minute"), i("second")) - Math.floor(e / 1e3) * 1e3;
}
function ws(e, t) {
  const [s, i, n] = e.split("-").map(Number), o = Date.UTC(s, i - 1, n), r = o - $s(o, t);
  return o - $s(r, t);
}
function Vs(e, t) {
  const [s, i, n] = e.split("-").map(Number);
  return new Date(Date.UTC(s, i - 1, n + t)).toISOString().slice(0, 10);
}
function ce(e, t) {
  return { startMs: ws(e, t), endMs: ws(Vs(e, 1), t) };
}
function Yi(e) {
  const [t, s, i] = e.split("-").map(Number);
  return je(new Date(Date.UTC(t, s - 1, i, 12)), "UTC");
}
const ze = /* @__PURE__ */ new Map();
function xs(e, t, s) {
  const i = ze.get(e);
  if (i && Date.now() - i.at < t) return i.p;
  const n = s();
  return ze.set(e, { at: Date.now(), p: n }), n.catch(() => ze.delete(e)), n;
}
const ks = "var(--disabled-text-color, #9e9e9e)";
function Ss(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  let s = {};
  for (const i of e) {
    i.a && (s = i.a);
    const n = i.lu ?? i.lc ?? i.last_updated_ts, o = typeof n == "number" ? n * 1e3 : Date.parse(i.last_updated ?? "");
    Number.isNaN(o) || t.push({ t: o, s: String(i.s ?? i.state ?? ""), a: s });
  }
  return t;
}
const Xi = (e) => e === "unavailable" || e === "unknown" || e === "", dt = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let F = class extends P {
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
    const { startMs: s, endMs: i } = ce(this.date, this._tz), n = Date.now(), r = i > n ? 6e4 : 1 / 0, a = this._windowSensor();
    try {
      const c = s < n ? xs(`h|${e}|${a}`, r, () => this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(s).toISOString(),
        end_time: new Date(Math.min(i, n)).toISOString(),
        entity_ids: a ? [this.entityId, a] : [this.entityId],
        minimal_response: !1,
        no_attributes: !1,
        significant_changes_only: !1
      })) : Promise.resolve({}), h = Math.min(14, Math.max(1, Math.ceil((n - s) / 864e5) + 1)), _ = s < n ? xs(`j|${this.entityId}|${h}`, 6e4, () => this.hass.callWS({ type: "weekly_planner/journal", entity_id: this.entityId, days: h })).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [m, f] = await Promise.all([c, _]);
      if (t !== this._token) return;
      this._loaded = {
        hist: Ss(m[this.entityId]),
        win: a ? Ss(m[a]) : [],
        journal: (f.segments ?? []).filter((w) => w.entity_id === this.entityId)
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
    const s = this.data.modes.find((n) => n.id === e);
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
      const s = dt(e.temperature);
      return s !== null ? s : e.kind === "preset" ? this._presetTemperature(String(e.preset)) : null;
    }
    return t === "cover" ? e.kind === "open" ? 100 : e.kind === "close" ? 0 : e.kind === "position" ? dt(e.position) : null : t === "light" ? e.kind === "off" ? 0 : e.kind === "on" ? dt(e.brightness) ?? 100 : null : e.kind === "value" ? dt(e.value) : null;
  }
  _presetTemperature(e) {
    return Fs(this.hass, this.entityId, e);
  }
  _live(e) {
    const t = E(this.entityId);
    if (Xi(e.s)) return { applied: null, measured: null };
    if (t === "climate") return { applied: dt(e.a.temperature), measured: dt(e.a.current_temperature) };
    if (t === "cover") return { applied: dt(e.a.current_position), measured: null };
    if (t === "light") {
      const i = e.s === "on" ? dt(e.a.brightness) : 0;
      return { applied: i === null ? e.s === "on" ? 100 : 0 : i / 255 * 100, measured: null };
    }
    const s = Number(e.s);
    return { applied: Number.isFinite(s) ? s : null, measured: null };
  }
  // ---- build ----
  _build(e) {
    var is, ns;
    const t = this._tz, { startMs: s, endMs: i } = ce(this.date, t), n = Math.round((i - s) / 6e4), o = Date.now(), r = Math.max(0, Math.min(n, (o - s) / 6e4)), a = (u) => (u - s) / 6e4, c = E(this.entityId), h = this.data.modes, _ = Bt(this.program, this.data), m = /* @__PURE__ */ new Map();
    for (const u of this.program.profiles) for (const v of u.days.flat()) m.set(v.id, v);
    d(this._lang, "override");
    const f = Yi(this.date), w = [];
    for (const { slot: u, end: v } of Ke(_.days[(f + 6) % 7])) w.push({ s: 0, e: v, slot: u });
    if (this.slots)
      for (const u of this.slots) {
        const v = m.get(u.slot_id);
        if (!v || u.ignored) continue;
        const x = Math.max(0, a(Date.parse(u.start))), C = u.end ? Math.min(n, a(Date.parse(u.end))) : x + 5;
        C > x && w.push({ s: x, e: C, slot: v });
      }
    else
      for (const u of _.days[f]) {
        const v = L(u.start);
        if (v === null) continue;
        const x = L(u.end ?? null);
        w.push({ s: v, e: x === null ? v + 5 : x > v ? x : n, slot: u });
      }
    w.sort((u, v) => u.s - v.s);
    const $ = (is = this.program.entities.find((u) => u.entity_id === this.entityId)) == null ? void 0 : is.default, T = $ ? $.kind === "mode" ? this._modeSetpoint(String($.value), this.entityId) : $.kind === "setpoint" ? $.value : null : null, g = ($ == null ? void 0 : $.kind) === "mode" ? h.find((u) => u.id === $.value) : void 0, M = ($ == null ? void 0 : $.kind) === "previous", k = [];
    let q = 0;
    const ee = (u) => {
      if (u <= q) return;
      const v = k[k.length - 1];
      k.push(M && v ? { ...v, s: q, e: u } : { s: q, e: u, v: this._value(T), color: (g == null ? void 0 : g.color) ?? ks, label: (g == null ? void 0 : g.name) ?? d(this._lang, "default_state") }), q = u;
    };
    for (const u of w) {
      const v = Math.max(u.s, q);
      if (u.e <= v) continue;
      ee(v);
      const x = this._slotSetpoint(u.slot);
      k.push({
        s: v,
        e: u.e,
        v: this._value(x),
        color: _e(u.slot, this.program, h),
        label: Re(u.slot, this.program, h, this._lang)
      }), q = u.e;
    }
    ee(n);
    const j = (u) => k.find((v) => u >= v.s && u < v.e) ?? k[k.length - 1], lt = e.journal.map((u) => ({ m: a(Date.parse(u.at)), e: u })).filter((u) => !Number.isNaN(u.m)).sort((u, v) => u.m - v.m), we = (u) => {
      let v = null;
      for (const C of lt) if (C.m <= u) v = C;
      else break;
      if (!v) return null;
      const x = v.e.slot_id ? m.get(v.e.slot_id) : void 0;
      return {
        s: v.m,
        e: v.m,
        v: this._value(v.e.setpoint),
        color: x ? _e(x, this.program, h) : ks,
        label: x ? Re(x, this.program, h, this._lang) : ""
      };
    }, se = /* @__PURE__ */ new Set([0, n, r]);
    k.forEach((u) => {
      se.add(u.s), se.add(u.e);
    }), lt.forEach((u) => {
      u.m > 0 && u.m < n && se.add(u.m);
    });
    const xe = [...se].filter((u) => u >= 0 && u <= n).sort((u, v) => u - v), ie = [];
    for (let u = 0; u < xe.length - 1; u++) {
      const v = xe[u], x = xe[u + 1];
      if (x - v < 0.01) continue;
      const C = (v + x) / 2, yt = (C < r ? we(C) : null) ?? j(C);
      ie.push({ s: v, e: x, v: yt.v, color: yt.color, label: yt.label });
    }
    const Pt = [], ke = [], Qe = [];
    for (const u of e.hist) {
      const v = Math.max(0, a(u.t)), x = this._live(u);
      Pt.push({ m: v, v: x.applied, heating: u.a.hvac_action === "heating" }), ke.push({ m: v, v: x.measured });
    }
    const ts = (u, v) => {
      const x = [];
      return u.forEach((C, ft) => {
        if (!v(ft)) return;
        const yt = ft + 1 < u.length ? u[ft + 1].m : r;
        if (yt > C.m) {
          const Ee = x[x.length - 1];
          Ee && Math.abs(Ee[1] - C.m) < 0.01 ? Ee[1] = yt : x.push([C.m, yt]);
        }
      }), x;
    };
    Qe.push(...ts(Pt, (u) => !!Pt[u].heating));
    const es = e.win.map((u) => ({ m: Math.max(0, a(u.t)), open: u.s === "on" })), Ks = ts(es, (u) => es[u].open), Ys = (u, v) => {
      let x = null, C = !1;
      for (const ft of u) if (ft.m <= v)
        x = ft.v, C = !0;
      else break;
      return C ? x : null;
    }, Xs = (u) => {
      var v;
      return ((v = ie.find((x) => u >= x.s && u < x.e)) == null ? void 0 : v.v) ?? null;
    }, Gs = c === "climate" ? 0.5 : 5, ss = [];
    let Mt = null;
    const Se = Math.floor(r);
    for (let u = 0; u <= Se + 1; u++) {
      const v = u <= Se ? Xs(u + 0.5) : null, x = u <= Se ? Ys(Pt, u + 0.5) : null, C = v !== null && x !== null && Math.abs(v - x) > Gs;
      C && Mt === null && (Mt = u), !C && Mt !== null && (u - Mt > 2 && ss.push([Mt, u]), Mt = null);
    }
    const Ae = [...ie.map((u) => u.v), ...Pt.map((u) => u.v), ...ke.map((u) => u.v)].filter((u) => u !== null);
    let ne = 0, oe = 100;
    c !== "cover" && c !== "light" && Ae.length && (ne = Math.floor(Math.min(...Ae) - 1), oe = Math.ceil(Math.max(...Ae) + 1), oe - ne < 2 && (oe = ne + 2));
    const Zs = c === "climate" ? "°C" : c === "cover" || c === "light" ? "%" : ((ns = this.hass.states[this.entityId]) == null ? void 0 : ns.attributes.unit_of_measurement) ?? "";
    return {
      span: n,
      pastEnd: r,
      isToday: s <= o && o < i,
      planned: ie,
      applied: Pt,
      measured: ke,
      heat: Qe,
      win: Ks,
      over: ss,
      lo: ne,
      hi: oe,
      unit: Zs
    };
  }
  // ---- interaction ----
  _pointer(e) {
    const t = this._model;
    if (!t) return;
    const s = e.currentTarget.getBoundingClientRect(), i = e.clientX - s.left;
    this._cursor = this._clampM((i - A.l) / (s.width - A.l - A.r) * t.span, t.span);
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
    const { startMs: t } = ce(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t + e * 6e4));
  }
  _valueAt(e, t) {
    let s = null;
    for (const i of e) if (i.m <= t) s = i.v;
    else break;
    return s;
  }
  _path(e, t, s, i, n) {
    let o = "", r = !1;
    return e.forEach((a, c) => {
      const h = c + 1 < e.length ? e[c + 1].m : t.pastEnd;
      if (a.v === null || h < a.m) {
        r = !1;
        return;
      }
      const _ = i(a.v);
      n ? o += r ? `V${_.toFixed(1)}H${s(h).toFixed(1)}` : `M${s(a.m).toFixed(1)},${_.toFixed(1)}H${s(h).toFixed(1)}` : (o += `${r ? "L" : "M"}${s(a.m).toFixed(1)},${_.toFixed(1)}`, c + 1 === e.length && (o += `L${s(h).toFixed(1)},${_.toFixed(1)}`)), r = !0;
    }), o;
  }
  render() {
    if (!this.hass || !this.data) return p;
    const e = B(this._lang), t = this._model, s = wt(this.hass, this.entityId);
    let i;
    return this._failed ? i = l`<div class="note">${e.no_data}</div>` : t ? !t.planned.some((n) => n.v !== null) && !t.applied.some((n) => n.v !== null) && !t.measured.some((n) => n.v !== null) ? i = l`<div class="note">${e.no_data}</div>` : i = this._renderChart(t, s) : i = l`<div class="note">${e.chart_loading}</div>`, l`<div class="box">${i}</div>${t ? this._legend(t) : p}`;
  }
  _legend(e) {
    const t = B(this._lang), s = (i, n) => l`<span class="key"><i class=${i}></i>${n}</span>`;
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
    const s = B(this._lang), i = this._width, n = Gi, o = (g) => A.l + g / e.span * (i - A.l - A.r), r = (g) => A.t + (1 - (g - e.lo) / (e.hi - e.lo)) * (n - A.t - A.b), { startMs: a } = ce(this.date, this._tz), c = [0, 1, 2, 3].map((g) => e.lo + (e.hi - e.lo) * g / 3), h = [];
    for (let g = 0; g <= e.span; g += 180) h.push(g);
    const _ = (g, M) => g.map(([k, q]) => it`<rect class="z ${M}" x=${o(k)} y=${A.t} width=${Math.max(1, o(q) - o(k))}
        height=${n - A.t - A.b}></rect>`), m = this._cursor;
    let f = p, w = p, $ = "";
    if (m !== null) {
      const g = e.planned.find((j) => m >= j.s && m < j.e), M = [];
      M.push([s.planned, `${this._fmt((g == null ? void 0 : g.v) ?? null, e.unit)}${g != null && g.label ? " · " + g.label : ""}`]), m <= e.pastEnd && (!this.simple && e.applied.some((j) => j.v !== null) && M.push([s.applied, this._fmt(this._valueAt(e.applied, m), e.unit)]), e.measured.some((j) => j.v !== null) && M.push([s.measured, this._fmt(this._valueAt(e.measured, m), e.unit)]));
      const k = [], q = (j) => j.some(([lt, we]) => m >= lt && m < we);
      q(e.win) && k.push(s.window_open), q(e.heat) && k.push(s.heating), q(e.over) && k.push(s.overridden), $ = `${this._clock(m)} — ${M.map(([j, lt]) => `${j} ${lt}`).join(", ")}${k.length ? ", " + k.join(", ") : ""}`;
      const ee = Math.min(Math.max(o(m), 70), i - 70);
      w = it`<line class="cursor" x1=${o(m)} x2=${o(m)} y1=${A.t} y2=${n - A.b}></line>`, f = l`<div class="tip" style="left:${ee}px">
        <b>${this._clock(m)}</b>
        ${M.map(([j, lt]) => l`<div><span>${j}</span> ${lt}</div>`)}
        ${k.map((j) => l`<div class="flag">${j}</div>`)}
      </div>`;
    }
    const T = e.isToday ? it`<line class="now" x1=${o(e.pastEnd)} x2=${o(e.pastEnd)} y1=${A.t} y2=${n - A.b}></line>` : p;
    return l`
      <svg width=${i} height=${n} viewBox="0 0 ${i} ${n}" tabindex="0" role="application"
        aria-label=${d(this._lang, "chart_aria", { name: t })}
        @pointerdown=${this._pointer} @pointermove=${(g) => g.pointerType === "mouse" || g.buttons ? this._pointer(g) : void 0}
        @pointerleave=${(g) => {
      g.pointerType === "mouse" && (this._cursor = null);
    }}
        @keydown=${this._key}>
        ${c.map((g) => it`<line class="grid" x1=${A.l} x2=${i - A.r} y1=${r(g)} y2=${r(g)}></line>
          <text class="ylab" x=${A.l - 4} y=${r(g) + 3} text-anchor="end">${Number(g.toFixed(e.unit === "°C" ? 1 : 0))}</text>`)}
        ${h.map((g) => it`<text class="xlab" x=${o(g)} y=${n - 6}
          text-anchor=${g === 0 ? "start" : "middle"}>${Math.floor(Dt(new Date(a + g * 6e4), this._tz) / 60)}h</text>`)}
        ${this.simple ? p : it`${_(e.win, "win")}${_(e.heat, "heat")}${_(e.over, "over")}`}
        ${e.planned.map((g, M) => {
      const k = e.planned[M - 1];
      return g.v === null ? p : it`
            ${k && k.v !== null ? it`<line class="riser" x1=${o(g.s)} x2=${o(g.s)} y1=${r(k.v)} y2=${r(g.v)}></line>` : p}
            <line class="plan" x1=${o(g.s)} x2=${o(g.e)} y1=${r(g.v)} y2=${r(g.v)} style="stroke:${this.simple ? "var(--primary-color)" : g.color}"></line>`;
    })}
        ${this.simple ? p : it`<path class="applied" d=${this._path(e.applied, e, o, r, !0)}></path>`}
        <path class="measured" d=${this._path(e.measured, e, o, r, !1)}></path>
        ${T}${w}
        <rect class="hit" x=${A.l} y=${A.t} width=${i - A.l - A.r} height=${n - A.t - A.b}></rect>
      </svg>
      ${f}
      <div class="sr" aria-live="polite">${$}</div>`;
  }
};
F.styles = H`
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
], F.prototype, "hass", 2);
Y([
  y({ attribute: !1 })
], F.prototype, "data", 2);
Y([
  y({ attribute: !1 })
], F.prototype, "program", 2);
Y([
  y({ attribute: "entity-id" })
], F.prototype, "entityId", 2);
Y([
  y()
], F.prototype, "date", 2);
Y([
  y({ type: Boolean })
], F.prototype, "simple", 2);
Y([
  y({ attribute: !1 })
], F.prototype, "slots", 2);
Y([
  b()
], F.prototype, "_width", 2);
Y([
  b()
], F.prototype, "_loaded", 2);
Y([
  b()
], F.prototype, "_failed", 2);
Y([
  b()
], F.prototype, "_cursor", 2);
F = Y([
  U("wp-chart")
], F);
const Gi = 160, A = { l: 38, r: 10, t: 10, b: 22 };
var Zi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, st = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Qi(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && Zi(t, s, n), n;
};
const tn = ["sunrise", "sunset"];
let K = class extends P {
  constructor() {
    super(...arguments), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = { start: "08:00", end: "09:00" };
  }
  get _lang() {
    return tt(this.hass);
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
    let s = J(t);
    e === "end" && s === 0 && (s = S), this._update(e, { time: s >= S ? "24:00" : V(s) });
  }
  _timeBlock(e, t) {
    const s = this.group.slot[e];
    if (!s) return p;
    const i = this._lang, n = B(i), o = this.disabled;
    return l`
      <div class="time" role="group" aria-label=${t}>
        <button class="ibtn round" ?disabled=${o} aria-label=${d(i, "minus15")} @click=${() => this._update(e, vs(s, -15))}>−15</button>
        ${"time" in s ? l`<input type="time" step="300" .value=${s.time === "24:00" ? "00:00" : s.time} ?disabled=${o}
              aria-label=${t} @change=${(r) => this._fromInput(e, r.target.value)} />` : l`<output class="sun">${Le(i, s)}</output>`}
        <button class="ibtn round" ?disabled=${o} aria-label=${d(i, "plus15")} @click=${() => this._update(e, vs(s, 15))}>+15</button>
      </div>
      <div class="chips">
        ${tn.map((r) => {
      const a = "sun" in s && s.sun === r;
      return l`<button class="chip ${a ? "on" : ""}" aria-pressed=${a} ?disabled=${o}
            @click=${() => this._toggleSun(e, r)}><ha-icon icon=${r === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${n[`sun_${r}_short`] ?? r}</button>`;
    })}
      </div>`;
  }
  _toggleEnd(e) {
    if (!e) return this._update("end", null);
    const t = this.group.slot.start, s = "time" in t ? J(t.time) : 12 * 60;
    this._update("end", { time: V(Math.min(S - 5, s + 60)) });
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
    const e = this._lang, t = B(e), s = this.group.slot, i = this.group.days, n = (r, a) => r.length === a.length && a.every((c) => r.includes(c)), o = (r, a) => l`<button class="chip small ${n(i, a) ? "on" : ""}"
      aria-pressed=${n(i, a)} ?disabled=${this.disabled} @click=${() => this._set({}, [...a])}>${n(i, a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : p}${r}</button>`;
    return l`
      <section>
        <h4>${d(e, "start")}</h4>
        ${this._timeBlock("start", d(e, "start"))}
      </section>
      <section>
        <h4>${d(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${s.end ? "" : "on"}" aria-pressed=${!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${d(e, "no_end")}</button>
          <button class="chip ${s.end ? "on" : ""}" aria-pressed=${!!s.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${d(e, "with_end")}</button>
        </div>
        ${s.end ? this._timeBlock("end", d(e, "end")) : p}
      </section>
      <section>
        <h4>${d(e, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && n(i, [this.dayOnly]) ? l`<div class="chips"><span class="only">${t.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${d(e, "apply_other_days")}</button></div>` : l`<div class="days" role="group" aria-label=${d(e, "days_label")}>
          ${t.days_short.map((r, a) => l`<button class="day ${i.includes(a) ? "on" : ""}" aria-pressed=${i.includes(a)}
            aria-label=${t.days[a]} ?disabled=${this.disabled} @click=${() => this._toggleDay(a)}>${i.includes(a) ? l`<ha-icon icon="mdi:check"></ha-icon>` : p}<span>${r}</span></button>`)}
        </div>
        <div class="chips">
          ${o(d(e, "all_days"), Ze)}${o(d(e, "weekdays"), Bs)}${o(d(e, "weekend"), qs)}
        </div>`}
      </section>
      <section>
        <h4>${d(e, "action")}</h4>
        ${this.entityIds.map((r) => {
      var a;
      return l`
          ${this.entityIds.length > 1 ? l`<div class="dev"><ha-icon icon=${((a = this.hass.states[r]) == null ? void 0 : a.attributes.icon) ?? `mdi:${E(r) === "climate" ? "thermostat" : "devices"}`}></ha-icon>${wt(this.hass, r)}</div>` : p}
          <wp-action-picker .hass=${this.hass} .data=${this.data} entity-id=${r} ?disabled=${this.disabled}
            .act=${qt(s, r, this.data.modes)}
            @act-change=${(c) => {
        c.stopPropagation(), this._setAct(r, c.detail);
      }}></wp-action-picker>`;
    })}
      </section>`;
  }
};
K.styles = [et, H`
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
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 16px; font-weight: 500; margin-right: 8px; }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px; }
    .day {
      min-height: 48px; min-width: 0; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
      background: none; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
    .dev { display: flex; align-items: center; gap: 8px; margin: 8px 0 4px; font-weight: 600; --mdc-icon-size: 20px; }
  `];
st([
  y({ attribute: !1 })
], K.prototype, "hass", 2);
st([
  y({ attribute: !1 })
], K.prototype, "data", 2);
st([
  y({ attribute: !1 })
], K.prototype, "program", 2);
st([
  y({ attribute: !1 })
], K.prototype, "group", 2);
st([
  y({ attribute: !1 })
], K.prototype, "entityIds", 2);
st([
  y({ type: Boolean })
], K.prototype, "disabled", 2);
st([
  y({ type: Number })
], K.prototype, "dayOnly", 2);
st([
  b()
], K.prototype, "_more", 2);
st([
  b()
], K.prototype, "_last", 2);
K = st([
  U("wp-slot-form")
], K);
var en = Object.defineProperty, sn = Object.getOwnPropertyDescriptor, te = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? sn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && en(t, s, n), n;
};
let Et = class extends P {
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
Et.styles = H`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
te([
  y()
], Et.prototype, "message", 2);
te([
  y({ attribute: "confirm-label" })
], Et.prototype, "confirmLabel", 2);
te([
  y({ attribute: "cancel-label" })
], Et.prototype, "cancelLabel", 2);
te([
  y()
], Et.prototype, "lang", 2);
Et = te([
  U("wp-confirm")
], Et);
function St(e, t, s, i = "") {
  return new Promise((n) => {
    var a;
    const o = document.createElement("wp-confirm");
    o.message = t, o.confirmLabel = s, o.cancelLabel = i;
    const r = e.hass;
    o.lang = ((a = r == null ? void 0 : r.locale) == null ? void 0 : a.language) ?? (r == null ? void 0 : r.language) ?? (document.documentElement.lang || "en"), o.addEventListener("choice", (c) => {
      o.remove(), n(!!c.detail);
    }), (e.shadowRoot ?? e).appendChild(o);
  });
}
function Vt(e, t) {
  var n, o;
  const s = (o = (n = e.states[t]) == null ? void 0 : n.attributes) == null ? void 0 : o.friendly_name;
  if (typeof s == "string" && s) return s;
  const i = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return i ? i.charAt(0).toUpperCase() + i.slice(1) : t;
}
const nn = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);
class on {
  constructor(t, s = 500) {
    this.onFire = t, this.delay = s, this.timer = 0, this.sx = 0, this.sy = 0, this.fired = !1;
  }
  down(t) {
    t.pointerType === "mouse" && t.button !== 0 || t.composedPath().some((s) => s instanceof HTMLElement && (s.tagName === "BUTTON" || nn.has(s.tagName))) || (this.cancel(), this.fired = !1, this.sx = t.clientX, this.sy = t.clientY, this.timer = window.setTimeout(() => {
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
const As = /* @__PURE__ */ new WeakSet();
function rn(e) {
  if (!e || As.has(e)) return;
  As.add(e);
  const t = () => {
    e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  };
  e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
const an = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
var ln = Object.defineProperty, cn = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? cn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && ln(t, s, n), n;
};
const dn = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" }, pn = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 };
function Nt(e, t) {
  var n;
  if ("time" in t) return J(t.time);
  const s = (n = e.states["sun.sun"]) == null ? void 0 : n.attributes[dn[t.sun]];
  let i = s ? Dt(s, e.config.time_zone) : pn[t.sun];
  return i += t.offset ?? 0, t.earliest && (i = Math.max(i, J(t.earliest))), t.latest && (i = Math.min(i, J(t.latest))), Math.max(0, Math.min(S, i));
}
function We(e) {
  const t = L(e.start);
  if (t === null || !e.end) return null;
  const s = L(e.end);
  return s === null ? null : s > t ? [t, s] : [t, S];
}
function ye(e) {
  const t = e.map((s) => ({ slot: s, iv: We(s) })).filter((s) => s.iv !== null).sort((s, i) => s.iv[0] - i.iv[0]);
  for (let s = 1; s < t.length; s++)
    if (t[s].iv[0] < t[s - 1].iv[1]) return [t[s - 1].slot, t[s].slot];
  return null;
}
function He(e, t) {
  return [...t].sort((s, i) => Nt(e, s.start) - Nt(e, i.start));
}
function pt(e, t, s) {
  const i = (n) => {
    if ("time" in n) return n.time;
    const o = n.offset ? ` ${n.offset > 0 ? "+" : "−"}${Math.abs(n.offset)} min` : "";
    return `${d(s, `sun_${n.sun}`)}${o} (≈${V(Nt(e, n))})`;
  };
  return t.end ? `${i(t.start)} – ${i(t.end)}` : `${i(t.start)} · ${d(s, "one_shot")}`;
}
function Js(e, t, s, i, n) {
  const o = tt(e), r = [];
  n > 0 && r.push({ start: 0, end: n, color: "var(--secondary-text-color)", label: d(o, "previous_day"), ignored: "spill" });
  for (const a of i) {
    const c = Nt(e, a.start), h = a.end ? Nt(e, a.end) : null, [[_, m]] = wi(a, { start: c, end: h }), f = !("time" in a.start) || !!(a.end && !("time" in a.end));
    r.push({
      start: _,
      end: m,
      sun: f,
      color: _e(a, s, t.modes),
      label: `${Re(a, s, t.modes, o)} ${pt(e, a, o)}`
    });
  }
  return r;
}
let W = class extends P {
  constructor() {
    super(...arguments), this.slots = [], this.spill = 0, this.day = 0, this._notice = "", this._zoom = 1, this._lp = new on(() => {
      this._lpSlot && (this._menu = this._lpSlot);
    }), this._pts = /* @__PURE__ */ new Map();
  }
  get _lang() {
    return tt(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
  }
  get _slots() {
    return this._dragSlots ?? this.slots;
  }
  /* ---- geometry ---- */
  _edges(e) {
    const t = /* @__PURE__ */ new Map(), s = (i, n) => t.set(i, [...t.get(i) ?? [], n]);
    for (const i of e) {
      const n = L(i.start);
      n !== null && s(n, { id: i.id, which: "start" });
      const o = L(i.end ?? null);
      n !== null && o !== null && o > n && s(o, { id: i.id, which: "end" });
    }
    return [...t.entries()].map(([i, n]) => ({ key: n.map((o) => o.id + o.which).join("|"), min: i, refs: n }));
  }
  _bounds(e, t, s) {
    let i = 0, n = S;
    for (const a of t) {
      const c = e.find((f) => f.id === a.id);
      if (!c) continue;
      const h = L(c.start) ?? 0, _ = c.end ? L(c.end) : null, m = _ !== null && _ <= h;
      a.which === "start" ? (_ !== null && !m ? n = Math.min(n, _ - N) : n = Math.min(n, S - N), m && (i = Math.max(i, _))) : m ? (i = Math.max(i, N), n = Math.min(n, h)) : i = Math.max(i, h + N);
    }
    const o = new Set(t.map((a) => a.id));
    if (!t.every((a) => {
      const c = e.find((h) => h.id === a.id);
      return a.which === "start" && !(c != null && c.end);
    }))
      for (const a of e) {
        if (o.has(a.id)) continue;
        const c = We(a);
        c && (c[1] <= s ? i = Math.max(i, c[1]) : c[0] >= s && (n = Math.min(n, c[0])));
      }
    return [i, n];
  }
  _apply(e, t, s) {
    const i = { time: V(s) };
    return e.map((n) => {
      const o = t.find((r) => r.id === n.id);
      return o ? o.which === "start" ? { ...n, start: i } : { ...n, end: i } : n;
    });
  }
  _emitSlots(e) {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: e, bubbles: !0, composed: !0 }));
  }
  _snap(e) {
    return Math.round(e / N) * N;
  }
  /* ---- drag ---- */
  _down(e, t) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [i, n] = this._bounds(this.slots, t.refs, t.min);
    this._drag = { refs: t.refs, lo: i, hi: n, min: t.min, moved: !1 }, this._dragSlots = this.slots, e.preventDefault();
  }
  _move(e) {
    const t = this._drag, s = this.renderRoot.querySelector(".track");
    if (!t || !s) return;
    const i = s.getBoundingClientRect(), n = (e.clientX - i.left) / i.width * S, o = Math.max(t.lo, Math.min(t.hi, this._snap(n)));
    o !== t.min && (this._drag = { ...t, min: o, moved: !0 }, this._dragSlots = this._apply(this.slots, t.refs, o));
  }
  _up(e) {
    var n;
    const t = this._drag, s = e.currentTarget;
    (n = s.hasPointerCapture) != null && n.call(s, e.pointerId) && s.releasePointerCapture(e.pointerId);
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
    let n = 0, o = 0;
    if (i) {
      const r = i.getBoundingClientRect();
      o = (t ?? r.left + r.width / 2) - r.left, n = (i.scrollLeft + o) / Math.max(1, i.scrollWidth);
    }
    this._zoom = s, await this.updateComplete, i && (i.scrollLeft = n * i.scrollWidth - o);
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
    const t = this._tr("confirm_delete_slot", { time: pt(this.hass, e, this._lang) });
    await St(this, t, this._tr("delete")) && this._emitSlots(this.slots.filter((s) => s.id !== e.id));
  }
  _menuDo(e) {
    const t = this._menu;
    this._menu = void 0, t && (e === "edit" ? this._edit(t, !1) : e === "copy" ? this.dispatchEvent(new CustomEvent("copy-slot", { detail: { slot: t }, bubbles: !0, composed: !0 })) : this._remove(t));
  }
  /* ---- keyboard / buttons ---- */
  _nudge(e, t, s) {
    const [i, n] = this._bounds(this.slots, e, t), o = Math.max(i, Math.min(n, this._snap(t + s)));
    o !== t && (this._notice = "", this._emitSlots(this._apply(this.slots, e, o)));
  }
  _onKey(e, t) {
    const s = e.shiftKey ? 60 : N;
    let i = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") i = -s;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") i = s;
    else return;
    e.preventDefault(), this._nudge(t.refs, t.min, i);
  }
  /* ---- actions ---- */
  _newSlot() {
    const e = this.data.modes.filter((n) => n.type === Ie(this.program)), t = this._slots.map(We).filter((n) => n !== null).sort((n, o) => n[0] - o[0]);
    let s = 480;
    for (const [n, o] of t) s >= n && s < o && (s = o);
    s > S - 60 && (s = S - 60);
    const i = Math.min(S, s + 60);
    return {
      id: ut(),
      start: { time: V(s) },
      end: { time: V(i) },
      conditions: [],
      actions: { by_type: e[0] ? { [Ie(this.program)]: e[0].id } : {}, by_entity: {} }
    };
  }
  _edit(e, t) {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot: e, isNew: t }, bubbles: !0, composed: !0 }));
  }
  /* ---- render ---- */
  _slotText(e, t) {
    const s = e.find((i) => i.id === t);
    return s ? pt(this.hass, s, this._lang) : "";
  }
  _actionText(e) {
    const t = Ge(e, this.program, this.data.modes), s = Object.values(e.actions.by_type).map((n) => {
      var o;
      return (o = this.data.modes.find((r) => r.id === n)) == null ? void 0 : o.name;
    }).filter(Boolean);
    if (s.length) return s.join(" · ");
    const i = Object.keys(e.actions.by_entity).map((n) => Vt(this.hass, n));
    return (t == null ? void 0 : t.name) ?? (i.length ? i.join(", ") : this._tr("slot_direct"));
  }
  _stepper(e, t, s) {
    if (!s) return l`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in s))
      return l`<span class="time sun"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${pt(this.hass, { ...e, start: s, end: null }, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    const i = J(s.time), n = [{ id: e.id, which: t }], [o, r] = this._bounds(this._slots, n, i), a = this._tr(t === "start" ? "slot_start" : "slot_end");
    return l`
      <span class="stepper">
        <button class="ibtn" ?disabled=${i - N < o} @click=${() => this._nudge(n, i, -N)}
          aria-label=${`${a} −5 min`}>−5</button>
        <span class="time">${s.time}</span>
        <button class="ibtn" ?disabled=${i + N > r} @click=${() => this._nudge(n, i, N)}
          aria-label=${`${a} +5 min`}>+5</button>
      </span>`;
  }
  render() {
    const e = this._slots, t = Js(this.hass, this.data, this.program, e, this.spill), s = this._edges(e), i = (r) => `${r / S * 100}%`, n = this._drag, o = He(this.hass, e);
    return l`
      <div class="wrap" @pointerdown=${this._pdown} @pointermove=${this._pmove} @pointerup=${this._pup}
        @pointercancel=${this._pup}>
        <div class="track" style="width:${this._zoom * 100}%">
          <wp-day-bar .spans=${t} show-hours></wp-day-bar>
          <div class="handles">
            ${s.map((r) => {
      const a = n && r.refs.some((m) => n.refs.some((f) => f.id === m.id && f.which === m.which)), [c, h] = this._bounds(e, r.refs, r.min), _ = V(r.min);
      return l`<button class="handle ${a ? "active" : ""}" style="left:${i(r.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${r.refs.map((m) => `${m.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(e, m.id)}`).join(" / ")}
                aria-valuemin=${c} aria-valuemax=${h} aria-valuenow=${r.min} aria-valuetext=${_}
                @pointerdown=${(m) => this._down(m, r)}
                @pointermove=${(m) => this._move(m)}
                @pointerup=${(m) => this._up(m)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(m) => this._onKey(m, r)}><span class="grip"></span></button>`;
    })}
            ${n ? l`<div class="loupe" style="left:${i(n.min)}" aria-hidden="true">
                  <span>${V(n.min)}</span></div>` : p}
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
      ${this.spill > 0 ? l`<p class="hint">${this._tr("spill_hint", { time: V(this.spill) })}</p>` : p}
      ${this._notice ? l`<p class="error" role="alert">${this._notice}</p>` : p}
      <div class="list">
        ${o.length === 0 ? l`<p class="muted">${this._tr("no_slots")}</p>` : p}
        ${o.map(
      (r) => {
        var a;
        return l`
            <div class="slot" @pointerdown=${(c) => this._slotDown(c, r)}
              @pointermove=${(c) => this._lp.move(c)} @pointerup=${() => this._lp.cancel()}
              @pointercancel=${() => this._lp.cancel()} @contextmenu=${(c) => c.preventDefault()}>
              <span class="dot" style="background:${_e(r, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(r, "start", r.start)}
                  ${r.end ? l`<span class="muted"><ha-icon icon="mdi:arrow-right"></ha-icon></span>${this._stepper(r, "end", r.end)}` : l`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(r)}${(a = r.conditions) != null && a.length ? ` · ${this._tr("slot_conditions")}: ${r.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${pt(this.hass, r, this._lang)}`}
                @click=${() => this._edit(r, !1)}><ha-icon icon="mdi:pencil"></ha-icon></button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${pt(this.hass, r, this._lang)}`}
                @click=${() => void this._remove(r)}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>`;
      }
    )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), !0)}>+ ${this._tr("add_slot")}</button>
      <p class="hint"><ha-icon icon="mdi:gesture-tap-hold"></ha-icon> ${this._tr("longpress_hint")}</p>
      ${this._menu ? l`<wp-dialog open heading=${pt(this.hass, this._menu, this._lang)}
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
  et,
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
  b()
], W.prototype, "_drag", 2);
X([
  b()
], W.prototype, "_dragSlots", 2);
X([
  b()
], W.prototype, "_notice", 2);
X([
  b()
], W.prototype, "_zoom", 2);
X([
  b()
], W.prototype, "_menu", 2);
W = X([
  U("wp-day-editor")
], W);
var hn = Object.defineProperty, un = Object.getOwnPropertyDescriptor, I = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? un(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && hn(t, s, n), n;
};
const Es = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, Te = 7;
let O = class extends P {
  constructor() {
    super(...arguments), this.chart = !0, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._act = null, this._programId = "", this._error = "", this._saving = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._minutes = (e) => Nt(this.hass, e);
  }
  get _lang() {
    return tt(this.hass);
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
    return (s) => t.some((i) => qt(s, i, this.data.modes) !== null);
  }
  _rows() {
    const e = [];
    for (const t of this._programs) {
      const s = Bt(t, this.data);
      for (const i of De(s, this._include(t), this._minutes))
        e.push({ program: t, group: i, key: `${t.id}|${i.ids[i.days[0]]}` });
    }
    return e;
  }
  /* ---- lifecycle / chart ---- */
  firstUpdated() {
    if (!this.day) return;
    const { weekday: e, offset: t } = this.day;
    t >= -14 && t <= Te && (this._offset = t);
    const s = this._rows().filter((i) => i.group.days.includes(e));
    if (s.length === 1) {
      const { key: i, program: n, group: o } = s[0], { [e]: r, ...a } = o.ids;
      this._expand(i, n, { slot: o.slot, days: [e], ids: r ? { [e]: r } : {} }), this._rest = { slot: structuredClone(o.slot), days: o.days.filter((c) => c !== e), ids: a }, this._dayOnly = e;
    } else !s.length && this._canEdit && (this._add([e]), this._dayOnly = e);
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
    return Xt(/* @__PURE__ */ new Date(), this._tz);
  }
  get _date() {
    return Vs(this._today, this._offset);
  }
  async _loadPreview(e, t, s) {
    const i = ++this._token;
    try {
      const n = await this.hass.callWS({ type: "weekly_planner/preview", program_id: e, date: t });
      i === this._token && s === this._loaded && (this._slots = n.slots);
    } catch {
      i === this._token && (this._slots = null);
    }
  }
  _go(e) {
    const t = this._offset + e;
    t < -14 || t > Te || (this._slots = null, this._offset = t);
  }
  /* ---- editing state ---- */
  get _canEdit() {
    return this.data.can_edit && !this.data.read_only;
  }
  _expand(e, t, s, i = null) {
    this._open = e, this._programId = t.id, this._group = s ? structuredClone(s) : null, this._act = i, this._error = "", this.updateComplete.then(() => requestAnimationFrame(() => {
      var n;
      return (n = this.renderRoot.querySelector(".editor")) == null ? void 0 : n.scrollIntoView({ block: "start" });
    }));
  }
  _cancel() {
    this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._act = null, this._error = "";
  }
  _add(e = Ze) {
    const t = this._programs[0], s = this._entities[0];
    if (!t || !s) return;
    const i = {
      id: ut(),
      start: { time: "08:00" },
      end: { time: "09:00" },
      conditions: [],
      actions: { by_type: {}, by_entity: {} }
    };
    this._expand("new", t, { slot: i, days: [...e], ids: {}, fresh: !0 });
  }
  /* ---- saving ---- */
  async _saveProgram(e) {
    var t;
    this._saving = !0;
    try {
      return await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(e) }), !0;
    } catch (s) {
      const i = s;
      return (i == null ? void 0 : i.code) === "conflict" ? this._error = d(this._lang, "ss_conflict") : (i == null ? void 0 : i.code) === "unauthorized" ? this._error = d(this._lang, "err_unauthorized") : (t = i == null ? void 0 : i.message) != null && t.includes("overlapping_slots") ? this._error = d(this._lang, "w_err_overlap") : this._error = d(this._lang, "ss_err_save"), !1;
    } finally {
      this._saving = !1;
    }
  }
  _problem(e) {
    const t = this._lang, s = this._group;
    return s ? s.days.length ? s.slot.end && JSON.stringify(s.slot.start) === JSON.stringify(s.slot.end) ? d(t, "w_err_same") : this._entities.some((i) => e.entities.some((n) => n.entity_id === i) && qt(s.slot, i, this.data.modes)) ? "" : d(t, "err_action") : d(t, "err_days") : "";
  }
  /** The rest of a group edited from one day, minus the days the edit now covers. */
  _kept(e) {
    const t = this._rest;
    if (!t) return [];
    const s = t.days.filter((n) => !e.includes(n)), i = Object.fromEntries(s.filter((n) => t.ids[n]).map((n) => [n, t.ids[n]]));
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
    const i = Bt(e, this.data), n = this._include(e), o = De(i, n, this._minutes).filter((c) => `${e.id}|${c.ids[c.days[0]]}` !== this._open);
    o.push(...this._kept(t.days), t);
    const r = bs(i, o, n, this._minutes);
    for (const c of r.days)
      if (ye(c)) {
        this._error = d(this._lang, "w_err_overlap");
        return;
      }
    await this._saveProgram({ ...e, profiles: e.profiles.map((c) => c.id === i.id ? r : c) }) && this._cancel();
  }
  async _deleteRow() {
    const e = this._programs.find((o) => o.id === this._programId);
    if (!e || this._open === "new" || !await St(this, d(this._lang, "w_confirm_slot"), d(this._lang, "yes"), d(this._lang, "no"))) return;
    const t = Bt(e, this.data), s = this._include(e), i = De(t, s, this._minutes).filter((o) => `${e.id}|${o.ids[o.days[0]]}` !== this._open);
    i.push(...this._kept([]));
    const n = bs(t, i, s, this._minutes);
    await this._saveProgram({ ...e, profiles: e.profiles.map((o) => o.id === t.id ? n : o) }) && this._cancel();
  }
  async _saveRest(e) {
    const t = this._programs[0], s = this._act;
    if (!t || !s) return;
    const i = t.entities.map((n) => n.entity_id === e ? { ...n, default: Ni(s) } : n);
    await this._saveProgram({ ...t, entities: i }) && this._cancel();
  }
  /* ---- pause / delete ---- */
  get _enabled() {
    return this._programs.some((e) => e.enabled);
  }
  async _setEnabled(e, t) {
    if (!e && !await St(this, d(this._lang, "confirm_pause", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no"))) {
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
    if (await St(this, d(this._lang, "confirm_delete_schedule", { name: this._title }), d(this._lang, "yes"), d(this._lang, "no")))
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
            for (const n of i.days)
              for (const o of n) delete o.actions.by_entity[t];
            i.days = i.days.map((n) => n.filter((o) => Object.keys(o.actions.by_entity).length || Object.keys(o.actions.by_type).length));
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
    const t = this._lang, s = Le(t, e.start);
    return e.end ? `${s}–${Le(t, e.end)}` : s;
  }
  _rowText(e, t) {
    const s = this._lang, n = this._entities.filter((h) => e.entities.some((_) => _.entity_id === h)).map((h) => ({ e: h, act: qt(t.slot, h, this.data.modes) })).filter((h) => h.act), o = n[0], r = o ? Zt(this.hass, s, this.data.modes, o.e, o.act) : "", a = n.length > 1 ? ` +${n.length - 1}` : "", c = Ui(s, B(s).days_short, t.days);
    return {
      text: [`${r}${a}`, this._when(t.slot)].filter(Boolean).join(" · "),
      days: c,
      color: o ? Hs(this.data.modes, o.e, o.act) : "var(--disabled-text-color)"
    };
  }
  _renderRow(e) {
    const { program: t, group: s, key: i } = e;
    if (this._open === i && this._group) return this._renderEditor(t, i);
    const { text: n, days: o, color: r } = this._rowText(t, s);
    return l`<button class="row" aria-expanded="false" @click=${() => this._expand(i, t, s)}>
      <span class="dot" style="background:${r}"></span>
      <span class="txt"><span class="l1">${n}</span><span class="l2">${o}</span>${this._programs.length > 1 ? l`<small>${t.name}</small>` : p}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }
  _renderEditor(e, t) {
    const s = this._lang, i = t === "new", n = this._entities.filter((o) => e.entities.some((r) => r.entity_id === o));
    return l`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${e} .group=${this._group} .entityIds=${n}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @group-change=${(o) => {
      o.stopPropagation(), this._group = o.detail, this._error = "";
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
    return t ? this._entities.filter((s) => t.entities.some((i) => i.entity_id === s)).map((s) => {
      const i = t.entities.find((c) => c.entity_id === s), n = ji(i, this.data.modes), o = `rest:${s}`, r = this._entities.length > 1 ? `${d(e, "rest_of_time")} · ${wt(this.hass, s)}` : d(e, "rest_of_time");
      if (this._open === o)
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
      const a = n.special === "none" ? d(e, "rest_none_short") : n.special === "previous" ? d(e, "rest_previous_short") : Zt(this.hass, e, this.data.modes, s, n);
      return l`<button class="row rest" aria-expanded="false" @click=${() => this._expand(o, t, null, n)}>
        <ha-icon icon="mdi:update"></ha-icon>
        <span class="txt">${r} · <b>${a}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    }) : p;
  }
  _renderChart() {
    const e = this._lang, t = this._programs[0];
    if (!this.chart || !t || !this._chartEntity) return p;
    const s = this._date, i = new Intl.DateTimeFormat(e, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(/* @__PURE__ */ new Date(`${s}T12:00:00Z`));
    return l`<section class="chart">
      ${this._entities.length > 1 ? l`<select aria-label=${d(e, "chart")} @change=${(n) => this._chartEntity = n.target.value}>
        ${this._entities.map((n) => l`<option value=${n} ?selected=${n === this._chartEntity}>${wt(this.hass, n)}</option>`)}</select>` : p}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${d(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? d(e, "today") : i}</span>
        <button class="ibtn" ?disabled=${this._offset >= Te} aria-label=${d(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
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
          ${t.length ? t.map((n) => this._renderRow(n)) : this._open === "new" ? p : l`<p class="muted">${d(e, "w_none")}</p>`}
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
            @change=${(n) => void this._setEnabled(n.target.checked, n.target)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${d(e, "delete_schedule")}</button>`}
      </wp-dialog>`;
  }
};
O.styles = [et, H`
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
I([
  y({ attribute: !1 })
], O.prototype, "hass", 2);
I([
  y({ attribute: !1 })
], O.prototype, "data", 2);
I([
  y({ attribute: !1 })
], O.prototype, "scope", 2);
I([
  y({ type: Boolean })
], O.prototype, "chart", 2);
I([
  y({ attribute: !1 })
], O.prototype, "day", 2);
I([
  b()
], O.prototype, "_open", 2);
I([
  b()
], O.prototype, "_group", 2);
I([
  b()
], O.prototype, "_dayOnly", 2);
I([
  b()
], O.prototype, "_act", 2);
I([
  b()
], O.prototype, "_programId", 2);
I([
  b()
], O.prototype, "_error", 2);
I([
  b()
], O.prototype, "_saving", 2);
I([
  b()
], O.prototype, "_offset", 2);
I([
  b()
], O.prototype, "_slots", 2);
I([
  b()
], O.prototype, "_chartEntity", 2);
O = I([
  U("wp-schedule")
], O);
var _n = Object.defineProperty, mn = Object.getOwnPropertyDescriptor, rt = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? mn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && _n(t, s, n), n;
};
const fn = ["dawn", "sunrise", "sunset", "dusk"];
let G = class extends P {
  constructor() {
    super(...arguments), this.others = [], this._mode = "modes", this._error = "";
  }
  get _lang() {
    return tt(this.hass);
  }
  _tr(e, t) {
    return d(this._lang, e, t);
  }
  willUpdate(e) {
    var t, s, i, n;
    e.has("entry") && this.entry && (this._s = structuredClone(this.entry), (t = this._s).conditions ?? (t.conditions = []), (s = this._s).actions ?? (s.actions = { by_type: {}, by_entity: {} }), (i = this._s.actions).by_type ?? (i.by_type = {}), (n = this._s.actions).by_entity ?? (n.by_entity = {}), this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes");
  }
  get _types() {
    const e = /* @__PURE__ */ new Set();
    this.program.main_type && e.add(this.program.main_type);
    for (const t of this.program.entities) e.add(Ft(E(t.entity_id)));
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
            @change=${(n) => {
      const o = n.target.value === "sun";
      this._setSpec(e, o ? { sun: "sunset", offset: 0 } : { time: e === "start" ? "08:00" : "09:00" });
    }}>
            <option value="fixed" ?selected=${!s}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${s}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in t ? this._fixedEditor(e, t.time, i) : l`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(n) => this._setSpec(e, { ...t, sun: n.target.value })}>
                    ${fn.map((n) => l`<option value=${n} ?selected=${t.sun === n}>${this._tr(`sun_${n}`)}</option>`)}
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
      (n) => l`
                    <div class="field">
                      <label>${this._tr(n === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${t[n] ?? ""}
                          @change=${(o) => {
        const r = o.target.value, a = { ...t };
        r ? a[n] = V(J(r)) : delete a[n], this._setSpec(e, a);
      }} />
                        ${t[n] ? l`<button class="ibtn" aria-label=${this._tr("clear")}
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
  _fixedEditor(e, t, s) {
    const i = e === "end" && t === "24:00";
    return l`
      ${i ? l`<p class="time-big">24:00</p>` : l`<div class="field"><input type="time" step="300" aria-label=${s} .value=${t}
            @change=${(n) => {
      const o = n.target.value;
      o && this._setSpec(e, { time: V(J(o)) });
    }} /></div>`}
      ${e === "end" ? l`<label class="check"><input type="checkbox" .checked=${i}
            @change=${(n) => this._setSpec("end", { time: n.target.checked ? "24:00" : "23:55" })} />
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
    return Ye(this._lang, e);
  }
  _directEditor() {
    return l`${this.program.entities.map((e) => {
      const t = this._s.actions.by_entity[e.entity_id];
      return l`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${!!t}
            @change=${(s) => this._setDirect(
        e.entity_id,
        s.target.checked ? Ls(this.hass, e.entity_id) : null
      )} />
            <strong>${Vt(this.hass, e.entity_id)}</strong></label>
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
    const e = this._s, t = "time" in e.start ? J(e.start.time) : null;
    if (e.end && "time" in e.start && "time" in e.end && t === J(e.end.time)) return this._tr("err_start_equals_end");
    if (t !== null && t >= S) return this._tr("err_start_equals_end");
    if (!Object.keys(e.actions.by_type).length && !Object.keys(e.actions.by_entity).length) return this._tr("err_no_action");
    for (const n of Object.values(e.actions.by_entity)) {
      if (n.kind === "scene" && !n.scene) return this._tr("err_incomplete");
      if (n.kind === "script" && !n.script) return this._tr("err_incomplete");
      if (n.kind === "action" && !n.action) return this._tr("err_incomplete");
    }
    if ((i = e.conditions) != null && i.some((n) => !n.entity_id)) return this._tr("err_incomplete");
    const s = ye([...this.others, e]);
    if (s) {
      const n = s.find((o) => o.id !== e.id) ?? s[0];
      return this._tr("err_overlap", { slot: pt(this.hass, n, this._lang) });
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
        const i = "time" in e.start ? J(e.start.time) : 480;
        this._setSpec("end", { time: V(Math.min(S, i + 60)) });
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
G.styles = [
  et,
  H`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `
];
rt([
  y({ attribute: !1 })
], G.prototype, "hass", 2);
rt([
  y({ attribute: !1 })
], G.prototype, "data", 2);
rt([
  y({ attribute: !1 })
], G.prototype, "program", 2);
rt([
  y({ attribute: !1 })
], G.prototype, "entry", 2);
rt([
  y({ attribute: !1 })
], G.prototype, "others", 2);
rt([
  b()
], G.prototype, "_s", 2);
rt([
  b()
], G.prototype, "_mode", 2);
rt([
  b()
], G.prototype, "_error", 2);
G = rt([
  U("wp-slot-editor")
], G);
var yn = Object.defineProperty, gn = Object.getOwnPropertyDescriptor, R = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? gn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && yn(t, s, n), n;
};
const Cs = () => [[], [], [], [], [], [], []];
function de(e) {
  return e.map((t) => ({ ...structuredClone(t), id: ut() }));
}
let D = class extends P {
  constructor() {
    super(...arguments), this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._saving = !1, this._ready = !1, this._pickerKey = 0;
  }
  get _lang() {
    return tt(this.hass);
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
        const t = ut();
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
          profiles: [{ id: t, name: this._tr("profile_default"), days: Cs() }]
        }, this._isNew = !0;
      }
      this._profileId = this._activeId(), this._dayView = this.day, this._tab = this.day !== void 0 ? "week" : "general";
    }
  }
  _activeId() {
    var s, i;
    const e = this._p, t = !this._isNew && ((s = this.data.status[e.id]) == null ? void 0 : s.active_profile) || e.active_profile;
    return ((i = e.profiles.find((n) => n.id === t)) == null ? void 0 : i.id) ?? e.profiles[0].id;
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
    for (const t of this._p.entities) e.add(Ft(E(t.entity_id)));
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
    const i = this._p.profiles.find((o) => o.id === s);
    if (!i) return;
    const n = i.days.map((o, r) => r === e ? He(this.hass, t) : o);
    this._setProfile({ ...i, days: n });
  }
  _spill(e, t) {
    const s = e.days[(t + 6) % 7] ?? [];
    return Ke(s).reduce((i, n) => Math.max(i, n.end), 0);
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
      const i = this._profile, n = {
        id: ut(),
        name: t,
        days: e.mode === "copy" ? i.days.map(de) : Cs()
      };
      this._patch({ profiles: [...this._p.profiles, n] }), this._profileId = n.id;
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
    const t = this._profile.days[e.from] ?? [], s = e.slotId ? t.find((o) => o.id === e.slotId) : void 0, i = [];
    let n = this._p;
    for (const o of e.targets)
      o === e.from && e.profileId === this._profileId || (n = {
        ...n,
        profiles: n.profiles.map((r) => r.id !== e.profileId ? r : {
          ...r,
          days: r.days.map((a, c) => {
            if (c !== o) return a;
            if (!s) return de(t);
            const h = He(this.hass, [...a, ...de([s])]);
            return ye(h) ? (i.push(o), a) : h;
          })
        })
      });
    this._p = n, this._copy = void 0, this._error = i.length ? this._tr("copy_slot_overlap", { days: i.map((o) => this._long(o)).join(", ") }) : "";
  }
  _saveSlot(e) {
    const t = this._dayView;
    if (t === void 0) return;
    const s = this._profile.days[t], i = s.some((n) => n.id === e.id);
    this._setDay(t, i ? s.map((n) => n.id === e.id ? e : n) : [...s, e]);
  }
  /* ---- entities ---- */
  _setEntity(e, t) {
    this._patch({ entities: this._p.entities.map((s, i) => i === e ? { ...s, ...t } : s) });
  }
  _addEntity(e) {
    if (!e || this._p.entities.some((o) => o.entity_id === e)) return;
    const t = Ft(E(e)), s = this.data.modes.filter((o) => o.type === t), i = s.find((o) => /eco|off|closed/.test(o.id)) ?? s[0], n = i ? { kind: "mode", value: i.id } : { kind: "none" };
    this._pickerKey += 1, this._patch({
      entities: [...this._p.entities, { entity_id: e, default: n, force_permanent: !1 }],
      main_type: this._p.main_type || t
    });
  }
  _setDefaultKind(e, t) {
    var o;
    const s = this._p.entities[e], i = Ft(E(s.entity_id));
    let n;
    t === "mode" && (n = ((o = this.data.modes.find((r) => r.type === i)) == null ? void 0 : o.id) ?? ""), t === "setpoint" && (n = Ls(this.hass, s.entity_id)), this._setEntity(e, { default: n === void 0 ? { kind: t } : { kind: t, value: n } });
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
        if (ye(s.days[i]))
          return this._tr("err_overlap_day", { profile: s.name, day: this._long(i) });
    return "";
  }
  _payload() {
    const e = structuredClone(this._p), t = new Set(e.entities.map((s) => s.entity_id));
    return e.name = e.name.trim(), e.profiles = e.profiles.map((s) => ({
      ...s,
      days: s.days.map((i) => i.map((n) => {
        const o = Object.fromEntries(Object.entries(n.actions.by_entity).filter(([r]) => t.has(r)));
        return { ...n, actions: { ...n.actions, by_entity: o } };
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
    const s = this._tr("confirm_delete", { name: Vt(this.hass, t) });
    await St(this, s, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((n, o) => o !== e) });
  }
  async _delete() {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id }), this._close();
    } catch (e) {
      this._error = this._errorText(e);
    }
  }
  _duplicate() {
    const e = ut(), t = this._p, s = /* @__PURE__ */ new Map(), i = t.profiles.map((n) => {
      const o = n.id === this._activeId() ? e : ut();
      return s.set(n.id, o), { ...structuredClone(n), id: o, days: n.days.map(de) };
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
            ${e.icon && customElements.get("ha-icon") ? l`<ha-icon .icon=${e.icon}></ha-icon>` : p}
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
              ${t.map((s) => l`<option value=${s} ?selected=${s === (e.main_type || t[0])}>${Ye(this._lang, s)}</option>`)}
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
    rn(this.renderRoot.querySelector(".tabs"));
  }
  _renderEntities() {
    const e = this._p;
    return l`
      ${e.entities.length === 0 ? l`<p class="muted">${this._tr("pe_no_entity")}</p>` : p}
      ${e.entities.map((t, s) => this._renderEntity(t, s))}
      ${Is(this._pickerKey, l`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${Oi} .exclude=${e.entities.map((t) => t.entity_id)}
        @wp-change=${(t) => {
      t.stopPropagation(), this._addEntity(t.detail);
    }}></wp-entity-picker>`)}
    `;
  }
  _renderEntity(e, t) {
    var a, c;
    const s = Ft(E(e.entity_id)), i = ((a = this.hass.states[e.entity_id]) == null ? void 0 : a.attributes) ?? {}, n = Array.isArray(i.preset_modes) && i.preset_modes.includes("permanent"), o = this.data.modes.filter((h) => h.type === s), r = ((c = e.default) == null ? void 0 : c.kind) ?? "none";
    return l`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${Vt(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? p : l`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${Vt(this.hass, e.entity_id)}`}
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
              ${o.map((h) => l`<option value=${h.id} ?selected=${h.id === e.default.value}>${h.name}</option>`)}
            </select></div>` : p}
        ${r === "setpoint" ? l`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${!!this.data.is_admin}
              .value=${e.default.value ?? null}
              @wp-change=${(h) => {
      h.stopPropagation(), this._setEntity(t, { default: { kind: "setpoint", value: h.detail } });
    }}></wp-setpoint-editor>` : p}
        ${n || e.force_permanent ? l`<label class="check"><input type="checkbox" .checked=${!!e.force_permanent}
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
          <select id="f-profile" @change=${(n) => {
      this._profileId = n.target.value, this._dayView = void 0;
    }}>
            ${e.profiles.map((n) => l`<option value=${n.id} ?selected=${n.id === t.id}>${n.name}${n.id === s ? ` (${this._tr("profile_active")})` : ""}</option>`)}
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
                @input=${(n) => this._profileForm = { ...i, name: n.target.value }}
                @keydown=${(n) => {
      n.key === "Enter" && this._submitProfileForm();
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
      const i = Js(this.hass, this.data, this._p, t, this._spill(e, s)), n = this._long(s);
      return l`
        <div class="dayrow">
          <button class="dname" @click=${() => this._dayView = s} aria-label=${`${this._tr("edit")} ${n}`}>${this._short(s)}</button>
          <div class="grow bar" @click=${() => this._dayView = s}><wp-day-bar .spans=${i}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${n}`} @click=${() => this._dayView = s}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${n}`} title=${this._tr("copy_day")}
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
            @change=${(n) => t(n.target.checked ? [...e.targets, i] : e.targets.filter((o) => o !== i))} />
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
          ${e.map(([i, n]) => l`<button role="tab" aria-selected=${this._tab === i} class="tab ${this._tab === i ? "on" : ""}"
            @click=${() => this._tab = i}>${this._tr(n)}</button>`)}
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
D.styles = [
  et,
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
      ${Os(an)}
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
  y({ attribute: !1 })
], D.prototype, "hass", 2);
R([
  y({ attribute: !1 })
], D.prototype, "data", 2);
R([
  y({ attribute: !1 })
], D.prototype, "program", 2);
R([
  y({ attribute: !1 })
], D.prototype, "defaultTypes", 2);
R([
  y({ type: Number })
], D.prototype, "day", 2);
R([
  b()
], D.prototype, "_p", 2);
R([
  b()
], D.prototype, "_isNew", 2);
R([
  b()
], D.prototype, "_tab", 2);
R([
  b()
], D.prototype, "_profileId", 2);
R([
  b()
], D.prototype, "_dayView", 2);
R([
  b()
], D.prototype, "_slotEdit", 2);
R([
  b()
], D.prototype, "_error", 2);
R([
  b()
], D.prototype, "_saving", 2);
R([
  b()
], D.prototype, "_copy", 2);
R([
  b()
], D.prototype, "_profileForm", 2);
D = R([
  U("wp-program-editor")
], D);
var vn = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, at = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && vn(t, s, n), n;
};
const $n = {
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  light: "mdi:lightbulb",
  switch: "mdi:power-plug",
  input_boolean: "mdi:toggle-switch",
  fan: "mdi:fan"
};
let Z = class extends P {
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
    e.has("hass") && this.hass && !this._unsub && (this._unsub = zi(this.hass, (t) => {
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
  /** The moment `offset` days from now (only its local date and weekday are used). */
  _dateAt(e) {
    return new Date(this._now.getTime() + e * 864e5);
  }
  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  async _loadPreviews() {
    if (!this._data) return;
    const e = [0, 1, 2, 3, 4, 5, 6].map((n) => Xt(this._dateAt(n), this._tz)), t = gs(this._data, this._config), s = `${e[0]}|${t.map((n) => `${n.id}:${n.revision}`).join(",")}`;
    if (s === this._previewKey) return;
    this._previewKey = s;
    const i = {};
    await Promise.all(e.flatMap((n) => t.map((o) => this.hass.callWS({ type: "weekly_planner/preview", program_id: o.id, date: n }).then((r) => {
      (i[n] ?? (i[n] = {}))[o.id] = r.slots;
    }).catch(() => {
    })))), this._preview = i;
  }
  /* ---- blocks ---- */
  /** Entities shown in "device" mode, in program order. */
  _entities(e) {
    var i;
    const t = (i = this._config.filter) == null ? void 0 : i.types, s = /* @__PURE__ */ new Set();
    for (const n of e)
      for (const o of n.entities)
        (!(t != null && t.length) || t.includes(E(o.entity_id))) && s.add(o.entity_id);
    return [...s];
  }
  _programsOf(e) {
    return this._data.programs.filter((t) => t.entities.some((s) => s.entity_id === e)).sort((t, s) => t.priority - s.priority);
  }
  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  _spans(e, t, s = 0) {
    const i = this._data, n = this._lang, o = this._dateAt(s), r = je(o, this._tz), a = this._preview[Xt(o, this._tz)] ?? {}, c = [], h = (_) => qt(_, e, i.modes);
    for (const _ of [...t].reverse()) {
      if (!_.enabled) continue;
      const m = Bt(_, i), f = ($, T, g, M = {}) => {
        const k = h($);
        return { start: T, end: g, color: Hs(i.modes, e, k), label: Zt(this.hass, n, i.modes, e, k), ...M };
      };
      for (const { slot: $, end: T } of Ke(m.days[(r + 6) % 7]))
        h($) && c.push(f($, 0, T));
      const w = a[_.id];
      for (const $ of m.days[r]) {
        if (!h($)) continue;
        const T = w == null ? void 0 : w.find((k) => k.slot_id === $.id);
        let g = L($.start), M = L($.end ?? null);
        T && (g = Dt(T.start, this._tz), M = T.end ? Dt(T.end, this._tz) : null), g !== null && c.push(f(
          $,
          g,
          M === null ? g + 10 : M > g ? M : S,
          { sun: "sun" in $.start || !!($.end && "sun" in $.end), ignored: (T == null ? void 0 : T.ignored) ?? null }
        ));
      }
    }
    return c;
  }
  _next(e, t) {
    var i, n;
    const s = this._data;
    for (const o of t) {
      if (!o.enabled) continue;
      const r = (n = (i = s.status[o.id]) == null ? void 0 : i.next_actions) == null ? void 0 : n[e];
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
    var m, f;
    const i = this._lang, n = this._data, o = this._next(e, t), r = t.length > 0 && t.every((w) => !w.enabled), a = (m = n.entities[e]) == null ? void 0 : m.override, c = ((f = this.hass.states[e]) == null ? void 0 : f.attributes.icon) ?? $n[E(e)] ?? "mdi:calendar-clock", h = () => this._open(s.open), _ = a ? a.origin === "voluntary" && a.until ? d(i, "overridden_until", { time: fe(fs(a.until, this._tz, i, this._now)) }) : d(i, "overridden") : "";
    return l`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${c}></ha-icon>
          <div class="info">
            ${s.name ? l`<span class="name">${wt(this.hass, e)}</span>` : p}
            <span class="now">
              <span class="nw">${Ii(this.hass, i, e)}</span>
              ${o ? l`<span class="nw">→ ${Zt(this.hass, i, n.modes, e, o.setpoint)}
                <span class="when">${fe(fs(o.at, this._tz, i, this._now))}</span></span>` : p}
            </span>
          </div>
          ${r ? l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(i, "paused")}></ha-icon>` : p}
          ${s.button ? l`<button class="hours" @click=${h}>${d(i, "hours")}</button>` : p}
        </div>
        <wp-day-bar show-hours .spans=${this._spans(e, t)} .now=${Dt(this._now, this._tz)}
          @click=${h}></wp-day-bar>
        ${a ? l`<div class="manual"><ha-icon icon="mdi:hand-back-right"></ha-icon><span>${_}</span>
          <button class="x" aria-label=${d(i, "cancel_manual")} @click=${() => void this._cancelOverride(e)}>
            <ha-icon icon="mdi:close"></ha-icon></button></div>` : p}
        ${this._weekRows(`${Es(s.open)}|${e}`, e, t, s.open)}
      </div>`;
  }
  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  _weekRows(e, t, s, i) {
    const n = this._lang, o = this._week.has(e), r = () => {
      const c = new Set(this._week);
      o ? c.delete(e) : c.add(e), this._week = c;
    }, a = B(n).days_short;
    return l`
      <button class="weekbtn" aria-expanded=${o} @click=${r}>
        <ha-icon icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${d(n, "week")}</button>
      ${o ? l`<div class="week">
        ${[1, 2, 3, 4, 5, 6].map((c) => {
      const h = je(this._dateAt(c), this._tz);
      return l`<button class="wday" aria-label=${a[h]} @click=${() => this._open(i, { weekday: h, offset: c })}>
            <span class="wname">${a[h]}</span>
            <wp-day-bar .spans=${this._spans(t, s, c)}></wp-day-bar></button>`;
    })}
      </div>` : p}`;
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
      return l`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${s.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${s.name}</h2>
          ${s.enabled ? p : l`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${d(t, "paused")}></ha-icon>`}
          <button class="hours" @click=${() => this._open(i)}>${d(t, "hours")}</button>
        </div>
        ${s.entities.map((n) => this._line(n.entity_id, [s], { name: s.entities.length > 1, button: null, open: i }))}
      </section>`;
    });
  }
  render() {
    var o;
    if (!this._config || !this.hass) return p;
    const e = this._lang, t = this._data, s = t ? gs(t, this._config) : [], i = !!t && !!((o = this.hass.user) != null && o.is_admin) && !!(t != null && t.can_edit), n = this._config.title !== void 0 && this._config.title !== "";
    return l`
      <ha-card>
        ${n || i || t != null && t.vacation ? l`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t != null && t.vacation ? l`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${d(e, "vacation")}</span>` : p}
              ${i ? l`<button class="gear" aria-label=${d(e, "all_programs")} @click=${() => this._dialog = { kind: "admin" }}>
                <ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : p}
            </div>` : p}
        ${this._error ? l`<div class="error">${d(e, "error", { message: this._error })}</div>` : p}
        ${t != null && t.read_only ? l`<div class="error">${d(e, "read_only")}</div>` : p}
        ${t ? p : l`<div class="empty">…</div>`}
        ${t && !s.length ? l`<div class="empty">${d(e, "no_program")}</div>` : p}
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
        return Is(Es(e.scope), l`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope} .day=${e.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${t}
          @open-settings=${(i) => {
          const n = this._data.programs.find((o) => o.id === i.detail.programId);
          n && (this._dialog = { kind: "program", program: n });
        }}></wp-schedule>`);
      case "program":
        return l`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${e.program}
          .defaultTypes=${((s = this._config.filter) == null ? void 0 : s.types) ?? []} @closed=${t}></wp-program-editor>`;
      case "admin": {
        const i = this._lang;
        return l`<wp-dialog open heading=${d(i, "all_programs")} @closed=${t}>
          <div class="adm">
            ${this._data.programs.map((n) => l`<button class="admrow" @click=${() => this._dialog = { kind: "program", program: n }}>
              <ha-icon icon=${n.icon ?? "mdi:calendar-clock"}></ha-icon><span>${n.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => this._dialog = { kind: "program" }}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${d(i, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }
};
Z.styles = H`
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
    .wday wp-day-bar { flex: 1; min-width: 0; }
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
at([
  y({ attribute: !1 })
], Z.prototype, "hass", 2);
at([
  b()
], Z.prototype, "_config", 2);
at([
  b()
], Z.prototype, "_data", 2);
at([
  b()
], Z.prototype, "_error", 2);
at([
  b()
], Z.prototype, "_dialog", 2);
at([
  b()
], Z.prototype, "_preview", 2);
at([
  b()
], Z.prototype, "_now", 2);
at([
  b()
], Z.prototype, "_week", 2);
Z = at([
  U("weekly-planner-card")
], Z);
var wn = Object.defineProperty, xn = Object.getOwnPropertyDescriptor, $e = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? xn(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (n = (i ? r(t, s, n) : r(n)) || n);
  return i && n && wn(t, s, n), n;
};
const kn = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];
let It = class extends P {
  constructor() {
    super(...arguments), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._loaded = !1;
  }
  setConfig(e) {
    this._config = { ...e };
  }
  get _lang() {
    return tt(this.hass);
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
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(n) => this._set("title", n.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? l`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(n) => this._set("program", n.target.value)}>
              ${this._programs.length === 0 ? l`<option value="">${this._tr("no_program")}</option>` : p}
              ${!this._programs.some((n) => n.id === e.program) && e.program ? l`<option value=${e.program} selected>${e.program}</option>` : p}
              ${this._programs.map((n) => l`<option value=${n.id} ?selected=${n.id === e.program}>${n.name}</option>`)}
            </select></div>` : l`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${kn.map((n) => l`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${t.includes(n)}
                @change=${(o) => this._setFilter({ types: o.target.checked ? [...t, n] : t.filter((r) => r !== n) })} />
                ${Ye(this._lang, n)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${((i = e.filter) == null ? void 0 : i.area) ?? ""} placeholder="bureau"
                @input=${(n) => this._setFilter({ area: n.target.value.trim() })} /></div>`}

      <div class="label">${this._tr("ce_display")}</div>
      <div class="row" role="radiogroup" aria-label=${this._tr("ce_display")}>
        <label class="check"><input type="radio" name="ce-display" .checked=${e.display !== "schedule"}
          @change=${() => this._set("display", void 0)} /> ${this._tr("ce_display_device")}</label>
        <label class="check"><input type="radio" name="ce-display" .checked=${e.display === "schedule"}
          @change=${() => this._set("display", "schedule")} /> ${this._tr("ce_display_schedule")}</label>
      </div>
      <label class="check"><input type="checkbox" .checked=${e.show_chart !== !1}
        @change=${(n) => this._set("show_chart", n.target.checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
  }
};
It.styles = [et, H`:host { display: block; padding: 4px 0; }`];
$e([
  y({ attribute: !1 })
], It.prototype, "hass", 2);
$e([
  b()
], It.prototype, "_config", 2);
$e([
  b()
], It.prototype, "_programs", 2);
It = $e([
  U("weekly-planner-card-editor")
], It);
window.customCards = window.customCards || [];
window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
  type: "weekly-planner-card",
  name: "Weekly Planner",
  description: "Weekly schedules for thermostats, covers, lights and more.",
  preview: !1
});
