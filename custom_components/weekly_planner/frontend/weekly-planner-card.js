// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, te = ee ? ee.emptyScript : "", ne = h.reactiveElementPolyfillSupport, re = (e, t) => e, g = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ie = (e, t) => !l(e, t), ae = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	useDefault: !1,
	hasChanged: ie
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var oe = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ae) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? ae;
	}
	static _$Ei() {
		if (this.hasOwnProperty(re("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(re("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(re("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? g : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? g : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ie)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
oe.elementStyles = [], oe.shadowRootOptions = { mode: "open" }, oe[re("elementProperties")] = /* @__PURE__ */ new Map(), oe[re("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: oe }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, _ = se.trustedTypes, le = _ ? _.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ue = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + v, fe = `<${de}>`, y = document, b = () => y.createComment(""), pe = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", ge = "[ 	\n\f\r]", _e = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, ye = />/g, be = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), xe = /'/g, Se = /"/g, Ce = /^(?:script|style|textarea|title)$/i, we = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), x = we(1), S = we(2), Te = Symbol.for("lit-noChange"), C = Symbol.for("lit-nothing"), Ee = /* @__PURE__ */ new WeakMap(), De = y.createTreeWalker(y, 129);
function Oe(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return le === void 0 ? t : le.createHTML(t);
}
var ke = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = _e;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === _e ? c[1] === "!--" ? o = ve : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = be) : (Ce.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = be) : o = ye : o === be ? c[0] === ">" ? (o = i ?? _e, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? be : c[3] === "\"" ? Se : xe) : o === Se || o === xe ? o = be : o === ve || o === ye ? o = _e : (o = be, i = void 0);
		let d = o === be && e[t + 1].startsWith("/>") ? " " : "";
		a += o === _e ? n + fe : l >= 0 ? (r.push(s), n.slice(0, l) + ue + n.slice(l) + v + d) : n + v + (l === -2 ? t : d);
	}
	return [Oe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ae = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ke(t, n);
		if (this.el = e.createElement(l, r), De.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = De.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ue)) {
					let t = u[o++], n = i.getAttribute(e).split(v), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Fe : r[1] === "?" ? Ie : r[1] === "@" ? Le : Pe
					}), i.removeAttribute(e);
				} else e.startsWith(v) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Ce.test(i.tagName)) {
					let e = i.textContent.split(v), t = e.length - 1;
					if (t > 0) {
						i.textContent = _ ? _.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], b()), De.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], b());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === de) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(v, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += v.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = y.createElement("template");
		return n.innerHTML = e, n;
	}
};
function je(e, t, n = e, r) {
	if (t === Te) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = pe(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = je(e, i._$AS(e, t.values), i, r)), t;
}
var Me = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? y).importNode(t, !0);
		De.currentNode = r;
		let i = De.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ne(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Re(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = De.nextNode(), a++);
		}
		return De.currentNode = y, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Ne = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = C, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = je(this, e, t), pe(e) ? e === C || e == null || e === "" ? (this._$AH !== C && this._$AR(), this._$AH = C) : e !== this._$AH && e !== Te && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== C && pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(y.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ae.createElement(Oe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Me(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ee.get(e.strings);
		return t === void 0 && Ee.set(e.strings, t = new Ae(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(b()), this.O(b()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Pe = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = C, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = C;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = je(this, e, t, 0), a = !pe(e) || e !== this._$AH && e !== Te, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = je(this, r[n + o], t, o), s === Te && (s = this._$AH[o]), a ||= !pe(s) || s !== this._$AH[o], s === C ? e = C : e !== C && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === C ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Fe = class extends Pe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === C ? void 0 : e;
	}
}, Ie = class extends Pe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== C);
	}
}, Le = class extends Pe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = je(this, e, t, 0) ?? C) === Te) return;
		let n = this._$AH, r = e === C && n !== C || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== C && (n === C || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Re = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		je(this, e);
	}
}, ze = {
	M: ue,
	P: v,
	A: de,
	C: 1,
	L: ke,
	R: Me,
	D: he,
	V: je,
	I: Ne,
	H: Pe,
	N: Ie,
	U: Le,
	B: Fe,
	F: Re
}, Be = se.litHtmlPolyfillSupport;
Be?.(Ae, Ne), (se.litHtmlVersions ??= []).push("3.3.3");
var Ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ne(t.insertBefore(b(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, He = globalThis, w = class extends oe {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Te;
	}
};
w._$litElement$ = !0, w.finalized = !0, He.litElementHydrateSupport?.({ LitElement: w });
var Ue = He.litElementPolyfillSupport;
Ue?.({ LitElement: w }), (He.litElementVersions ??= []).push("4.2.2");
// node_modules/lit-html/directive.js
var We = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Ge = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Ke = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: qe } = ze, Je = (e) => e, Ye = () => document.createComment(""), Xe = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new qe(r.insertBefore(Ye(), i), r.insertBefore(Ye(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Je(e).nextSibling;
				Je(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, Ze = (e, t, n = e) => (e._$AI(t, n), e), Qe = {}, $e = (e, t = Qe) => e._$AH = t, et = (e) => e._$AH, tt = (e) => {
	e._$AR(), e._$AA.remove();
}, nt = Ge(class extends Ke {
	constructor() {
		super(...arguments), this.key = C;
	}
	render(e, t) {
		return this.key = e, t;
	}
	update(e, [t, n]) {
		return t !== this.key && ($e(e), this.key = t), n;
	}
}), T = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, rt = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	hasChanged: ie
}, it = (e = rt, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function E(e) {
	return (t, n) => typeof n == "object" ? it(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function D(e) {
	return E({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/lit-html/directives/if-defined.js
var at = (e) => e ?? C, ot = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, st = Ge(class extends Ke {
	constructor(e) {
		if (super(e), e.type !== We.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = et(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = Ze(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = Ze(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = Ze(i[d], a[m]), Xe(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = Ze(i[f], a[p]), Xe(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = ot(o, p, m), u = ot(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Xe(e, i[d]);
					Ze(t, a[p]), c[p] = t;
				} else c[p] = Ze(n, a[p]), Xe(e, i[d], n), i[t] = null;
				p++;
			} else tt(i[f]), f--;
		} else tt(i[d]), d++;
		for (; p <= m;) {
			let t = Xe(e, c[m + 1]);
			Ze(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && tt(e);
		}
		return this.ut = o, $e(e, c), Te;
	}
});
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function O(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/components/tip.ts
var ct = 2e3, lt = class extends w {
	constructor(...e) {
		super(...e), this.text = "", this.passive = !1, this.through = !1, this._mouse = !1, this._show = !1, this._shift = 0;
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
	_down(e) {
		this._mouse = e.pointerType === "mouse", this.through && this._mouse || (e.stopPropagation(), e.pointerType !== "mouse" && (this._on(), clearTimeout(this._timer), this._timer = setTimeout(() => this._off(), ct)));
	}
	updated() {
		if (!this._show) {
			this._shift &&= 0;
			return;
		}
		let e = this.renderRoot.querySelector(".bubble");
		if (!e) return;
		let t = e.getBoundingClientRect(), n = t.left - this._shift, r = t.right - this._shift, i = n < 4 ? 4 - n : r > window.innerWidth - 4 ? window.innerWidth - 4 - r : 0;
		Math.abs(i - this._shift) > .5 && (this._shift = i);
	}
	render() {
		return x`<span class="hit" part="hit" tabindex="0" role="img" aria-label=${this.text}
        @pointerenter=${(e) => {
			e.pointerType === "mouse" && this._on();
		}}
        @pointerleave=${(e) => {
			e.pointerType === "mouse" && this._off();
		}}
        @focus=${() => this._on()} @blur=${() => this._off()}
        @pointerdown=${(e) => this._down(e)}
        @pointerup=${(e) => {
			this.through && this._mouse || e.stopPropagation();
		}}
        @click=${(e) => {
			this.through && this._mouse || e.stopPropagation();
		}}
        @contextmenu=${(e) => e.preventDefault()}
        @keydown=${(e) => {
			e.key === "Escape" && this._off();
		}}>
        <slot></slot></span>
      ${this._show && this.text ? x`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : C}`;
	}
	static {
		this.styles = o`
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
	}
};
O([E()], lt.prototype, "text", void 0), O([E({ type: Boolean })], lt.prototype, "passive", void 0), O([E({ type: Boolean })], lt.prototype, "through", void 0), O([D()], lt.prototype, "_show", void 0), O([D()], lt.prototype, "_shift", void 0), lt = O([T("wp-tip")], lt);
// src/i18n.ts
var ut = {
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
	days: [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday"
	],
	days_short: [
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
		"Sun"
	],
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
	ce_filtered: "Several programs",
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
	ce_quick_types: "Select all by type",
	ce_quick_types_hint: "Tap a type to select or clear every program that has a device of that type.",
	ce_type_chip: "All {type}",
	ce_programs_list: "Programs",
	ce_no_device: "No device",
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
	cf_title: "Please confirm",
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
}, dt = {
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
	days: [
		"Lundi",
		"Mardi",
		"Mercredi",
		"Jeudi",
		"Vendredi",
		"Samedi",
		"Dimanche"
	],
	days_short: [
		"Lun",
		"Mar",
		"Mer",
		"Jeu",
		"Ven",
		"Sam",
		"Dim"
	],
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
	ce_filtered: "Plusieurs programmes",
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
	ce_quick_types: "Tout sélectionner par type",
	ce_quick_types_hint: "Touchez un type pour choisir ou retirer tous les programmes qui ont un appareil de ce type.",
	ce_type_chip: "Tout {type}",
	ce_programs_list: "Programmes",
	ce_no_device: "Aucun appareil",
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
	cf_title: "Veuillez confirmer",
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
function k(e) {
	return e.startsWith("fr") ? dt : ut;
}
function A(e, t, n = {}) {
	let r = k(e)[t];
	for (let [e, t] of Object.entries(n)) r = r.replace(`{${e}}`, t);
	return r;
}
// src/time.ts
var ft = /* @__PURE__ */ new Map();
function pt(e, t) {
	let n = `${e}|${JSON.stringify(t)}`, r = ft.get(n);
	return r || ft.set(n, r = new Intl.DateTimeFormat(e, t)), r;
}
function mt(e, t) {
	let [n, r, i] = e.split("-").map(Number);
	return new Date(Date.UTC(n, r - 1, i + t)).toISOString().slice(0, 10);
}
var j = 1440;
function M(e) {
	let [t, n] = e.split(":").map(Number);
	return t * 60 + n;
}
function ht(e) {
	let t = Math.max(0, Math.min(j, Math.round(e / 5) * 5));
	return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function N(e, t) {
	let n = typeof e == "string" ? new Date(e) : e, r = pt("en-GB", {
		timeZone: t,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(n), i = Number(r.find((e) => e.type === "hour")?.value ?? 0), a = Number(r.find((e) => e.type === "minute")?.value ?? 0);
	return i * 60 + a;
}
function gt(e, t) {
	let n = pt("en-GB", {
		timeZone: t,
		weekday: "short"
	}).format(e);
	return [
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
		"Sun"
	].indexOf(n);
}
function P(e, t) {
	return pt("en-CA", { timeZone: t }).format(e);
}
function _t(e) {
	return !e || !("time" in e) ? null : M(e.time);
}
function vt(e) {
	let t = [];
	for (let n of e) {
		let e = _t(n.start), r = _t(n.end ?? null);
		e !== null && r !== null && r <= e && r < 720 && t.push({
			slot: n,
			end: r
		});
	}
	return t;
}
function F(e, t) {
	let n = (Math.round(t) % j + j) % j, r = Math.floor(n / 60), i = n % 60;
	if (e.toLowerCase().startsWith("fr")) return i ? `${r} h ${String(i).padStart(2, "0")}` : `${r} h`;
	let a = new Date(Date.UTC(2e3, 0, 1, r, i)), o = {
		timeZone: "UTC",
		hour: "numeric"
	};
	return i && (o.minute = "2-digit"), pt(e, o).format(a).replace(/\s?(AM|PM)/, (e, t) => ` ${t.toLowerCase()}`);
}
function yt(e, t, n, r = /* @__PURE__ */ new Date()) {
	let i = new Date(e), a = P(i, t) === P(r, t), o = F(n, N(i, t));
	return a ? o : mt(P(r, t), 1) === P(i, t) ? `${new Intl.RelativeTimeFormat(n, { numeric: "auto" }).format(1, "day")} ${o}` : `${pt(n, i.getTime() - r.getTime() > 5184e5 ? {
		timeZone: t,
		weekday: "short",
		day: "numeric",
		month: "short"
	} : {
		timeZone: t,
		weekday: "short"
	}).format(i)} ${o}`;
}
// src/components/day-bar.ts
function bt(e) {
	return !e || !("sun" in e) ? null : e.sun === "sunrise" || e.sun === "dawn" ? "up" : "down";
}
function xt(e, t, n) {
	if (!t || !("sun" in t)) return "";
	let r = t.offset ?? 0;
	return `${k(e)[`sun_${t.sun}`] ?? t.sun}${r ? ` ${r > 0 ? "+" : "-"} ${Math.abs(r)} min` : ""} · ${F(e, n)}`;
}
var St = (e, t) => `${A(e, "now")} · ${F(e, t)}`, I = class extends w {
	constructor(...e) {
		super(...e), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this.notches = !1, this.tall = !1, this.lang = "en", this._width = 0;
	}
	connectedCallback() {
		super.connectedCallback(), typeof ResizeObserver < "u" && (this._ro = new ResizeObserver((e) => {
			let t = Math.round(e[0]?.contentRect.width ?? 0);
			t !== this._width && (this._width = t);
		}), this._ro.observe(this));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._ro?.disconnect();
	}
	_labelBox(e) {
		if (this.thin || this._width <= 0) return null;
		let t = e.start, n = e.end, r = this.now;
		r !== null && r > e.start - 20 && r < e.end + 20 && (r - e.start >= e.end - r ? n = Math.min(e.end, r - 20) : t = Math.max(e.start, r + 20));
		let i = Math.max(40, e.label.length * 7 + 14);
		if ((n - t) / 1440 * this._width < i) return null;
		let a = Math.max(e.end - e.start, 1);
		return {
			left: (t - e.start) / a * 100,
			width: (n - t) / a * 100
		};
	}
	_sunIcons() {
		let e = [];
		for (let t of this.spans) t.startSun && e.push({
			m: t.start,
			dir: t.startSun,
			spec: t.startSpec,
			label: t.marker ? t.label : void 0
		}), t.endSun && t.end < 1440 && e.push({
			m: t.end,
			dir: t.endSun,
			spec: t.endSpec
		});
		return e.map((e) => x`<wp-tip class="sunic" ?passive=${this.tall}
      text=${`${e.label ? `${e.label} · ` : ""}${xt(this.lang, e.spec, e.m)}`}
      style="left:clamp(16px, ${e.m / j * 100}%, calc(100% - 16px))" data-sun=${e.dir}>
      <span class="sunc"><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
	}
	_markerTips() {
		return this.spans.filter((e) => e.marker && !e.startSun && !this.thin).map((e) => x`<wp-tip class="mktip" through
      ?passive=${this.tall} text=${`${e.label} · ${F(this.lang, e.start)}`}
      style="left:clamp(12px, ${e.start / j * 100}%, calc(100% - 12px))"></wp-tip>`);
	}
	render() {
		let e = (e) => `${e / j * 100}%`, t = this.now;
		return x`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((e) => e.label).join(", ")}>
          ${this.notches ? [
			6,
			12,
			18
		].map((t) => x`<i class="tick" style="left:${e(t * 60)}"></i>`) : C}
          ${this.spans.map((t) => {
			let n = this._labelBox(t);
			return x`<div
              class="span ${t.ignored ? "ignored" : ""}"
              style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color}"
              title=${t.label}
            >${n ? x`<span class="name" style="left:${n.left}%;width:${n.width}%">${t.label}</span>` : C}</div>`;
		})}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${t === null ? C : x`<div class="nowline" style="left:${e(t)}">
          <wp-tip class="nowic" text=${St(this.lang, t)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>`}
      </div>
      ${this.showHours ? x`<div class="hours">${[
			0,
			6,
			12,
			18,
			24
		].map((t) => x`<span style="left:${e(t * 60)}">${F(this.lang, t * 60)}</span>`)}</div>` : C}
    `;
	}
	static {
		this.styles = o`
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
	}
};
O([E({ attribute: !1 })], I.prototype, "spans", void 0), O([E({ type: Number })], I.prototype, "now", void 0), O([E({ type: Boolean })], I.prototype, "thin", void 0), O([E({
	type: Boolean,
	attribute: "show-hours"
})], I.prototype, "showHours", void 0), O([E({ type: Boolean })], I.prototype, "notches", void 0), O([E({ type: Boolean })], I.prototype, "tall", void 0), O([E()], I.prototype, "lang", void 0), O([D()], I.prototype, "_width", void 0), I = O([T("wp-day-bar")], I);
// src/components/dialog.ts
var Ct = [];
function wt() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e && e !== document.body ? e : null;
}
var Tt = class extends w {
	constructor(...e) {
		super(...e), this.heading = "", this.open = !1, this.wide = !1, this.columns = !1, this._expanded = !1, this._opener = null, this._tracked = !1, this._onDocKey = (e) => {
			e.key !== "Escape" || e.defaultPrevented || Ct[Ct.length - 1] !== this || (e.stopPropagation(), this.close());
		}, this._onKey = (e) => {
			e.key === "Escape" && (e.stopPropagation(), this.close());
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("keydown", this._onKey);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("keydown", this._onKey), this._release();
	}
	_track() {
		this._tracked || (this._tracked = !0, this._opener = wt(), Ct.push(this), document.addEventListener("keydown", this._onDocKey));
	}
	_release() {
		if (!this._tracked) return;
		this._tracked = !1;
		let e = Ct.indexOf(this);
		e >= 0 && Ct.splice(e, 1), Ct.length || document.removeEventListener("keydown", this._onDocKey);
		let t = this._opener;
		this._opener = null, t?.isConnected && t.focus({ preventScroll: !0 });
	}
	_isPhone() {
		return typeof matchMedia == "function" && matchMedia("(max-width: 600px)").matches;
	}
	_panel() {
		return this.renderRoot.querySelector(".panel");
	}
	_hdown(e) {
		this._isPhone() && e.pointerType !== "mouse" && (e.composedPath().some((e) => e instanceof HTMLElement && e.tagName === "BUTTON") || (this._sw = {
			id: e.pointerId,
			y: e.clientY,
			x: e.clientX,
			dy: 0
		}, e.currentTarget.setPointerCapture?.(e.pointerId)));
	}
	_hmove(e) {
		let t = this._sw;
		if (!t || e.pointerId !== t.id) return;
		t.dy = Math.max(0, e.clientY - t.y);
		let n = this._panel();
		n && (n.style.transition = "none", n.style.transform = `translateY(${t.dy}px)`);
	}
	_hup(e) {
		let t = this._sw;
		if (!t || e.pointerId !== t.id) return;
		this._sw = void 0;
		let n = this._panel(), r = Math.abs(e.clientX - t.x);
		n && (n.style.transition = "", n.style.transform = ""), t.dy >= 100 && r < t.dy && this.close();
	}
	_hcancel() {
		this._sw = void 0;
		let e = this._panel();
		e && (e.style.transition = "", e.style.transform = "");
	}
	updated(e) {
		e.has("open") && (this.open ? (this._track(), requestAnimationFrame(() => this.renderRoot.querySelector(".panel")?.focus())) : this._release());
	}
	close() {
		this.open = !1, this._release(), this.dispatchEvent(new CustomEvent("closed", {
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return this.open ? x`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : this.columns ? "columns" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2><button class="heading" aria-expanded=${this._expanded}
            title=${document.documentElement.lang?.startsWith("fr") ? "Agrandir / réduire" : "Expand / reduce"}
            @click=${() => {
			this._expanded = !this._expanded;
		}}>${this.heading}</button></h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${document.documentElement.lang?.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    ` : x``;
	}
	static {
		this.styles = o`
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
	}
};
O([E()], Tt.prototype, "heading", void 0), O([E({
	type: Boolean,
	reflect: !0
})], Tt.prototype, "open", void 0), O([E({ type: Boolean })], Tt.prototype, "wide", void 0), O([E({ type: Boolean })], Tt.prototype, "columns", void 0), O([D()], Tt.prototype, "_expanded", void 0), Tt = O([T("wp-dialog")], Tt);
// src/preview-cache.ts
var Et = 6e5, Dt = 400, L = /* @__PURE__ */ new Map(), Ot = /* @__PURE__ */ new Map(), kt;
function At() {
	L.clear(), Ot.clear();
}
function jt(e) {
	kt !== void 0 && e.card_version !== kt && At(), kt = e.card_version;
	let t = /* @__PURE__ */ new Set();
	for (let n of e.programs) t.add(n.id), Ot.get(n.id) !== n.revision && Mt(n.id), Ot.set(n.id, n.revision);
	for (let e of [...Ot.keys()]) t.has(e) || (Mt(e), Ot.delete(e));
}
function Mt(e) {
	let t = `${e}\u0000`;
	for (let e of [...L.keys()]) e.startsWith(t) && L.delete(e);
}
function Nt(e, t, n, r, i, a = !0) {
	let o = [
		t,
		n,
		r,
		i ?? ""
	].join("\0"), s = Date.now(), c = L.get(o);
	if (c && s - c.at < Et) return c.promise;
	L.size >= Dt && L.delete(L.keys().next().value);
	let l = e.callWS({
		type: "weekly_planner/preview",
		program_id: t,
		date: r,
		...i && a ? { profile_id: i } : {}
	}).then((e) => e.slots);
	return L.set(o, {
		at: s,
		promise: l
	}), l.catch(() => {
		L.get(o)?.promise === l && L.delete(o);
	}), l;
}
// src/planner.ts
var Pt, Ft, It = /* @__PURE__ */ new Set(), Lt, Rt = 1e3, zt = 0;
function Bt(e) {
	if (Ft || !It.size) return;
	let t = zt, n = e.connection.subscribeMessage((e) => {
		t === zt && (Rt = 1e3, Pt = e, jt(e), It.forEach((t) => t(e)));
	}, { type: "weekly_planner/subscribe" });
	Ft = n, n.catch(() => {
		Ft === n && t === zt && (Ft = void 0, It.size && (Lt = setTimeout(() => {
			Lt = void 0, Bt(e);
		}, Rt), Rt = Math.min(Rt * 2, 3e4)));
	});
}
function Vt(e, t) {
	return It.add(t), Pt && t(Pt), Lt || Bt(e), () => {
		It.delete(t), It.size || (zt++, Lt && clearTimeout(Lt), Lt = void 0, Rt = 1e3, Ft?.then((e) => e()).catch(() => void 0), Ft = void 0, Pt = void 0);
	};
}
var Ht = (e) => e.split(".")[0];
function R(e, t) {
	let n = t.status[e.id]?.active_profile ?? e.active_profile;
	return e.profiles.find((e) => e.id === n) ?? e.profiles[0];
}
function z(e, t) {
	return e.states[t]?.attributes.friendly_name ?? t;
}
var Ut = (e) => e.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
function Wt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = new Set(e.map((e) => e.id));
	for (let i of t) {
		if (r.has(i)) {
			n.add(i);
			continue;
		}
		let t = Ut(String(i));
		if (t) for (let r of e) Ut(r.name) === t && n.add(r.id);
	}
	return n;
}
function Gt(e, t) {
	if (t.program) {
		let n = Wt(e.programs, [t.program]);
		return e.programs.filter((e) => n.has(e.id));
	}
	let n = t.filter?.types, r = t.filter?.area, i = t.filter?.programs === void 0 ? void 0 : Wt(e.programs, t.filter.programs);
	return e.programs.filter((e) => !n?.length || e.entities.some((e) => n.includes(Ht(e.entity_id)))).filter((e) => !r || e.area === r).filter((e) => !i || i.has(e.id)).sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name));
}
function B() {
	return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
var Kt = /* @__PURE__ */ new Map();
function qt(e, t) {
	let n = Kt.get(e);
	return n || Kt.set(e, n = new Intl.NumberFormat(e, { maximumFractionDigits: 1 })), n.format(t);
}
async function Jt() {
	if (customElements.get("ha-selector")) return !0;
	try {
		await ((await (await window.loadCardHelpers?.())?.createCardElement({
			type: "button",
			entity: "sun.sun"
		}))?.constructor)?.getConfigElement?.(), await Promise.race([customElements.whenDefined("ha-selector"), new Promise((e) => setTimeout(e, 3e3))]);
	} catch {}
	return !!customElements.get("ha-selector");
}
// src/services.ts
var Yt = /* @__PURE__ */ new Set([
	"entity_id",
	"device_id",
	"area_id",
	"floor_id",
	"label_id"
]), Xt, Zt = /* @__PURE__ */ new Set();
async function Qt(e, t) {
	let n = [...new Set(t)].filter((e) => !Zt.has(e));
	if (!n.length || !e.loadBackendTranslation) return !1;
	n.forEach((e) => Zt.add(e));
	try {
		let t = await Promise.all(n.map((t) => e.loadBackendTranslation("services", t)));
		return Xt = t[t.length - 1] ?? Xt, !0;
	} catch {
		return n.forEach((e) => Zt.delete(e)), !1;
	}
}
function $t(e, t) {
	for (let n of [e.localize, Xt]) {
		let e = n?.(t);
		if (e) return e;
	}
	return "";
}
var en = (e, t) => {
	let [n, r] = t.split(".");
	return e.services?.[n]?.[r];
};
function tn(e, t) {
	let [n, r] = t.split(".");
	return $t(e, `component.${n}.services.${r}.name`) || en(e, t)?.name || t;
}
function nn(e, t) {
	let [n, r] = t.split(".");
	return $t(e, `component.${n}.services.${r}.description`) || en(e, t)?.description || "";
}
function rn(e, t, n) {
	let r = Array.isArray(e) ? e : e ? [e] : [], i = Number(t?.attributes.supported_features ?? 0);
	return r.some((e) => (e.domain === void 0 ? [] : Array.isArray(e.domain) ? e.domain : [e.domain]).includes(n) ? !e.supported_features?.length || e.supported_features.some((e) => Array.isArray(e) ? e.every((e) => (i & e) === e) : (i & e) === e) : !1);
}
function an(e, t, n) {
	let r = Ht(t), i = e.states[t], a = [];
	for (let [t, o] of Object.entries(e.services ?? {})) if (t !== "homeassistant") for (let [s, c] of Object.entries(o)) {
		if (!c.target) continue;
		let o = c.target.entity, l = !o || Array.isArray(o) && !o.length;
		if (!rn(o, i, r) && !(t === r && l) || Object.values(c.fields ?? {}).some((e) => e.required && (!e.selector || "text" in e.selector || "object" in e.selector))) continue;
		let u = `${t}.${s}`;
		(n === void 0 || n.includes(u)) && a.push({
			id: u,
			domain: t,
			service: s,
			label: tn(e, u)
		});
	}
	return a.sort((e, t) => e.label.localeCompare(t.label));
}
function on(e, t) {
	return [...new Set(an(e, t).map((e) => e.domain))];
}
function sn(e, t) {
	let n = e.filter;
	if (!n || !t) return !0;
	let r = Number(t.attributes.supported_features ?? 0);
	if (n.supported_features?.length && !n.supported_features.some((e) => (r & e) === e)) return !1;
	for (let [e, r] of Object.entries(n.attribute ?? {})) {
		let n = t.attributes[e];
		if (!(Array.isArray(n) ? n : [n]).some((e) => r.includes(e))) return !1;
	}
	return !0;
}
function cn(e, t, n) {
	let [r, i] = t.split("."), a = n ? e.states[n] : void 0, o = e.services?.[r] ?? {}, s = [], c = (t) => {
		for (let [n, l] of Object.entries(t ?? {})) l.fields ? c(l.fields) : l.advanced || Yt.has(n) || l.selector?.target || !sn(l, a) || !l.required && i !== `set_${n}` && `set_${n}` in o || s.push({
			key: n,
			selector: l.selector ?? { text: {} },
			required: !!l.required || r === "climate" && i === `set_${n}` && n in dn,
			default: l.default,
			label: $t(e, `component.${r}.services.${i}.fields.${n}.name`) || l.name || n
		});
	};
	return c(en(e, t)?.fields), s.length && !s.some((e) => e.required) && (s[0] = {
		...s[0],
		required: !0
	}), [...s.filter((e) => e.required), ...s.filter((e) => !e.required)];
}
function ln(e, t, n) {
	let r = e.states[n]?.attributes ?? {}, i = {};
	for (let a of cn(e, t, n)) {
		if (!a.required) continue;
		let e = a.selector.number;
		a.default === void 0 ? a.key === "temperature" ? i[a.key] = typeof r.temperature == "number" ? r.temperature : 19 : e && (i[a.key] = a.key === "position" ? 50 : e.min ?? 0) : i[a.key] = a.default;
	}
	return i;
}
function un(e, t, n, r, i) {
	return cn(e, t, r).filter((e) => i?.[e.key] ? !i[e.key].entity_id : e.required && (n?.[e.key] === void 0 || n[e.key] === "" || n[e.key] === null)).map((e) => e.label);
}
var dn = {
	hvac_mode: "hvac_modes",
	preset_mode: "preset_modes",
	fan_mode: "fan_modes",
	swing_mode: "swing_modes",
	swing_horizontal_mode: "swing_horizontal_modes"
};
function fn(e, t, n) {
	let r = n.selector, i = r.state;
	if (!i && !r.select) return;
	let a = i?.attribute ?? dn[n.key], o = e.states[t], s = a ? o?.attributes[a] : void 0;
	if (!Array.isArray(s) || !s.length) return;
	let c = e, l = a.replace(/_list$/, "").replace(/s$/, "");
	return s.map((e) => {
		let t = String(e), r = "";
		try {
			r = n.key === "hvac_mode" ? c.formatEntityState?.(o, t) ?? "" : c.formatEntityAttributeValue?.(o, l, t) ?? "";
		} catch {
			r = "";
		}
		return {
			value: t,
			label: r || t
		};
	});
}
// src/labels.ts
var pn = [
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
function mn(e) {
	let t = new Set(e.map((e) => e.color.toLowerCase()));
	return pn.find((e) => !t.has(e)) ?? pn[e.length % pn.length];
}
var V = (e, t) => t ? e.labels.find((e) => e.id === t) : void 0, hn = /^[a-z0-9_]+\.[a-z0-9_]+$/;
function H(e, t) {
	if (!hn.test(t.name)) return t.name;
	let n = tn(e, t.name);
	if (n !== t.name) return n;
	let r = t.name.split(".")[1].replace(/_/g, " ");
	return r.charAt(0).toUpperCase() + r.slice(1);
}
function gn(e, t) {
	return Object.values(e.states).filter((e) => e.entity_id.startsWith("scene.") && Array.isArray(e.attributes.entity_id) && e.attributes.entity_id.includes(t)).sort((e, t) => String(e.attributes.friendly_name ?? e.entity_id).localeCompare(String(t.attributes.friendly_name ?? t.entity_id)));
}
var _n = (e, t) => {
	let n = e?.entities.find((e) => e.entity_id === t);
	return n?.restrict_services || n?.allowed_services?.length ? n.allowed_services ?? [] : void 0;
};
function vn(e, t, n, r) {
	if (n.kind === "scene") {
		let r = e.states[n.scene]?.attributes.entity_id;
		return !Array.isArray(r) || r.includes(t);
	}
	if (r !== void 0 && !r.includes(n.service)) return !1;
	let i = n.target_entity_id ?? t;
	return i ? n.service.split(".")[0] === i.split(".")[0] || an(e, i).some((e) => e.id === n.service) : !1;
}
function yn(e, t, n, r) {
	return t.labels.filter((t) => n.some((n) => vn(e, n, t.action, _n(r, n))));
}
function bn(e, t, n) {
	if (n) return e.entities.find((e) => e.entity_id === t)?.label_overrides?.[n.id] ?? n.action;
}
var xn = (e, t, n) => !!e.entities.find((e) => e.entity_id === t)?.label_overrides?.[n], Sn = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Cn(e) {
	if (!e || e.kind !== "service" || e.target_entity_id) return null;
	let t = e.data ?? {};
	return Sn(e.data_sources?.temperature ? null : t.temperature) ?? Sn(e.data_sources?.position ? null : t.position) ?? Sn(e.data_sources?.brightness_pct ? null : t.brightness_pct);
}
function wn(e, t, n) {
	if (!n) return "";
	if (n.kind === "scene") return String(e.states[n.scene]?.attributes.friendly_name ?? n.scene);
	if (n.target_entity_id) return `${tn(e, n.service)} · ${e.states[n.target_entity_id]?.attributes.friendly_name ?? n.target_entity_id}`;
	if (Object.keys(n.data_sources ?? {}).length) return Tn(e, n);
	let r = n.data ?? {};
	return Sn(r.temperature) === null ? Sn(r.position) === null ? Sn(r.brightness_pct) === null ? tn(e, n.service) : `${r.brightness_pct} %` : `${r.position} %` : `${qt(t, Number(r.temperature))} °C`;
}
function Tn(e, t) {
	return Object.values(t.data_sources ?? {}).map((t) => {
		let n = e.states[t.entity_id], r = String(n?.attributes.friendly_name ?? t.entity_id), i = t.attribute ? n?.attributes[t.attribute] : n?.state, a = n && !["unknown", "unavailable"].includes(n.state) && i != null;
		return `${r}${t.attribute ? ` · ${t.attribute}` : ""}${a && [
			"string",
			"number",
			"boolean"
		].includes(typeof i) ? ` (${i})` : ""}`;
	}).join(" · ");
}
function En(e, t, n, r) {
	if (!n) return "";
	if (n.kind === "scene") return wn(e, t, n);
	let i = [], a = n.target_entity_id ?? r, o = a ? e.states[a] : void 0, s = e.formatEntityState;
	for (let [e, r] of Object.entries(n.data ?? {})) if (!n.data_sources?.[e]) {
		if (typeof r == "number") i.push(e === "temperature" ? `${qt(t, r)} °C` : e === "position" || e === "brightness_pct" ? `${r} %` : qt(t, r));
		else if (typeof r == "string" && r) {
			let t = r;
			try {
				e === "hvac_mode" && o && s && (t = s(o, r) || r);
			} catch {
				t = r;
			}
			i.push(t);
		}
	}
	return Object.keys(n.data_sources ?? {}).length && i.push(Tn(e, n)), [
		tn(e, n.service),
		...n.target_entity_id ? [String(e.states[n.target_entity_id]?.attributes.friendly_name ?? n.target_entity_id)] : [],
		...i
	].join(" · ");
}
function Dn(e, t) {
	return e.programs.filter((e) => e.entities.some((e) => e.default_label === t || t in (e.label_overrides ?? {})) || e.profiles.some((e) => e.days.some((e) => e.some((e) => e.label === t)))).map((e) => e.name);
}
// src/select-value.ts
function On(e) {
	for (let t of e.querySelectorAll("select[data-value]")) {
		let e = t.dataset.value ?? "";
		t.value !== e && (t.value = e);
	}
}
// src/editors/shared.ts
var kn = (e) => e?.locale?.language ?? e?.language ?? "en", U = o`
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
function An(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !0
	}));
}
var W = class extends w {
	constructor(...e) {
		super(...e), this.value = "", this.label = "", this.disabled = !1, this.required = !1, this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
	}
	_ids() {
		return Object.keys(this.hass?.states ?? {}).filter((e) => !this.domains.length || this.domains.includes(Ht(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
	}
	_emit(e) {
		An(this, "wp-change", e);
	}
	render() {
		if (customElements.get("ha-entity-picker")) {
			let e = this.filter;
			return x`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label} .disabled=${this.disabled} .required=${this.required}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${e ? (t) => e(t.entity_id) : void 0}
        @value-changed=${(e) => {
				e.stopPropagation(), this._emit(e.detail.value ?? "");
			}}></ha-entity-picker>`;
		}
		let e = this._ids().slice(0, 600);
		return x`
      <div class="field">
        ${this.label ? x`<label>${this.label}</label>` : C}
        <input type="text" ?disabled=${this.disabled} ?required=${this.required} list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(e) => {
			let t = e.target.value.trim();
			(t === "" || this.hass.states[t]) && this._emit(t);
		}}
          @input=${(e) => {
			let t = e.target.value.trim();
			this.hass.states[t] && t !== this.value && this._emit(t);
		}} />
        <datalist id=${this._listId}>
          ${e.map((e) => x`<option value=${e}>${z(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
	}
	static {
		this.styles = [U, o`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
	}
};
O([E({ attribute: !1 })], W.prototype, "hass", void 0), O([E()], W.prototype, "value", void 0), O([E()], W.prototype, "label", void 0), O([E({ type: Boolean })], W.prototype, "disabled", void 0), O([E({ type: Boolean })], W.prototype, "required", void 0), O([E({ attribute: !1 })], W.prototype, "domains", void 0), O([E({ attribute: !1 })], W.prototype, "exclude", void 0), O([E({ attribute: !1 })], W.prototype, "filter", void 0), W = O([T("wp-entity-picker")], W);
var jn = class extends w {
	constructor(...e) {
		super(...e), this.conditions = [];
	}
	get _lang() {
		return kn(this.hass);
	}
	_tr(e) {
		return A(this._lang, e);
	}
	_set(e) {
		An(this, "wp-change", e);
	}
	_patch(e, t) {
		this._set(this.conditions.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	_parse(e, t) {
		let n = e.trim();
		return n !== "" && !Number.isNaN(Number(n)) ? Number(n) : t && n === "true" ? !0 : t && n === "false" ? !1 : e;
	}
	render() {
		return x`
      ${this.conditions.map((e, t) => x`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${e.entity_id} .label=${this._tr("entity")}
              @wp-change=${(e) => {
			e.stopPropagation(), this._patch(t, { entity_id: e.detail });
		}}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${e.attribute ?? ""} placeholder="—"
                  @change=${(e) => this._patch(t, { attribute: e.target.value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(e) => this._patch(t, { op: e.target.value })}>
                  ${[
			"eq",
			"ne",
			"lt",
			"gt"
		].map((t) => x`<option value=${t} ?selected=${(e.op ?? "eq") === t}>${{
			eq: "=",
			ne: "≠",
			lt: "<",
			gt: ">"
		}[t]}</option>`)}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(e.value ?? "")}
                  @change=${(n) => this._patch(t, { value: this._parse(n.target.value, !!e.attribute) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((e, n) => n !== t))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`)}
      <button class="btn" @click=${() => this._set([...this.conditions, {
			entity_id: "",
			op: "eq",
			value: "on"
		}])}>
        + ${this._tr("cond_add")}
      </button>
    `;
	}
	static {
		this.styles = U;
	}
};
O([E({ attribute: !1 })], jn.prototype, "hass", void 0), O([E({ attribute: !1 })], jn.prototype, "conditions", void 0), jn = O([T("wp-conditions-editor")], jn);
// src/components/action-picker.ts
var Mn = class extends w {
	constructor(...e) {
		super(...e), this.entityId = "", this.action = null, this.disabled = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
	}
	get _lang() {
		return kn(this.hass);
	}
	get _targetEntity() {
		return this.action?.kind === "service" ? this.action.target_entity_id ?? this.entityId : this.entityId;
	}
	_setTarget(e) {
		(this.action?.kind !== "service" || this.action.target_entity_id !== e) && this._emit({
			kind: "service",
			service: "",
			...e === void 0 ? {} : { target_entity_id: e }
		});
	}
	updated() {
		On(this.renderRoot), this.hass && this._targetEntity && this._loadedFor !== this._targetEntity && (this._loadedFor = this._targetEntity, Qt(this.hass, on(this.hass, this._targetEntity)).then((e) => e && this.requestUpdate()), this._selector || Jt().then((e) => this._selector = e));
	}
	_emit(e) {
		this.dispatchEvent(new CustomEvent("action-change", {
			detail: e,
			bubbles: !0,
			composed: !0
		}));
	}
	_setData(e, t) {
		if (this.action?.kind !== "service") return;
		let n = { ...this.action.data ?? {} };
		t == null || t === "" || Array.isArray(t) && !t.length ? delete n[e] : n[e] = t, this._emit({
			...this.action,
			data: n
		});
	}
	_sourceType(e) {
		let t = e.selector.select?.multiple;
		return e.selector.number ? "number" : e.selector.boolean ? "boolean" : t ? "native" : e.selector.text || e.selector.select ? "string" : "native";
	}
	_setSource(e, t) {
		if (this.action?.kind !== "service") return;
		let n = { ...this.action.data_sources }, r = { ...this.action.data };
		t ? (n[e] = t, delete r[e]) : delete n[e], this._emit({
			...this.action,
			data: r,
			data_sources: n
		});
	}
	_field(e, t) {
		let n = this.action?.kind === "service" ? this.action.data_sources?.[e.key] : void 0, r = n ? this.hass.states[n.entity_id] : void 0, i = n?.attribute ? r?.attributes[n.attribute] : r?.state, a = r && !["unknown", "unavailable"].includes(r.state) && i != null ? typeof i == "object" ? JSON.stringify(i) : String(i) : A(this._lang, "value_unavailable"), o = [.../* @__PURE__ */ new Set([...Object.keys(r?.attributes ?? {}), ...n?.attribute ? [n.attribute] : []])].sort();
		return x`<div class="source-field">
      <div class="field"><label for=${`source-${e.key}`}>${e.label}</label>
        <select id=${`source-${e.key}`} data-value=${n ? "entity" : "fixed"} ?disabled=${this.disabled}
          @change=${(t) => this._setSource(e.key, t.target.value === "entity" ? {
			entity_id: "",
			type: this._sourceType(e)
		} : void 0)}>
          <option value="fixed">${A(this._lang, "value_fixed")}</option>
          <option value="entity">${A(this._lang, "value_entity")}</option>
        </select></div>
      ${n ? x`<wp-entity-picker .hass=${this.hass} .value=${n.entity_id} .label=${A(this._lang, "value_source")}
          .disabled=${this.disabled}
          @wp-change=${(t) => {
			t.stopPropagation(), this._setSource(e.key, {
				...n,
				entity_id: t.detail
			});
		}}></wp-entity-picker>
        <div class="field"><label for=${`attribute-${e.key}`}>${A(this._lang, "value_read")}</label>
          <select id=${`attribute-${e.key}`} data-value=${n.attribute ?? ""} ?disabled=${this.disabled}
            @change=${(t) => {
			let r = t.target.value;
			this._setSource(e.key, {
				entity_id: n.entity_id,
				type: n.type,
				...r ? { attribute: r } : {}
			});
		}}>
            <option value="">${A(this._lang, "value_state")}</option>
            ${o.map((e) => x`<option value=${e}>${e}</option>`)}
          </select></div>
        ${n.entity_id ? x`<p class="hint" role="status">${A(this._lang, "value_current", { value: a })}</p>` : C}
        <p class="hint">${A(this._lang, "value_at_execution")}</p>` : this._selector ? x`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(e)} .context=${this._context(e)} .value=${t[e.key]} .label=${e.label}
            .required=${e.required} ?disabled=${this.disabled}
            @value-changed=${(t) => {
			t.stopPropagation(), this._setData(e.key, t.detail.value);
		}}></ha-selector>` : x`<div class="field"><label>${e.label}</label><input type="text" .value=${String(t[e.key] ?? "")} ?disabled=${this.disabled}
            @change=${(t) => this._setData(e.key, t.target.value)} /></div>`}
    </div>`;
	}
	_context(e) {
		let t = e.selector.state;
		return {
			filter_entity: [this._targetEntity],
			filter_target: { entity_id: [this._targetEntity] },
			entity_id: this._targetEntity,
			filter_attribute: t?.attribute ?? dn[e.key]
		};
	}
	_selectorOf(e) {
		let t = fn(this.hass, this._targetEntity, e);
		return t ? { select: {
			options: t,
			mode: "dropdown"
		} } : e.selector;
	}
	render() {
		if (!this.hass) return C;
		let e = this._lang, t = this.action?.kind === "service" && this.action.target_entity_id !== void 0, n = this._targetEntity, r = this.action?.kind === "service" ? this.action.service : "", i = n ? an(this.hass, n, this.allowed !== void 0 && r ? [...this.allowed, r] : this.allowed) : [];
		if (r && !i.some((e) => e.id === r)) {
			let [e, t] = r.split(".");
			i.push({
				id: r,
				domain: e,
				service: t,
				label: tn(this.hass, r)
			});
		}
		let a = this.action?.kind === "service" ? this.action.data ?? {} : {}, o = r ? cn(this.hass, r, n) : [], s = t ? [] : gn(this.hass, this.entityId), c = this.action?.kind === "scene" ? this.action.scene : r, l = r ? nn(this.hass, r) || A(e, "action_no_description") : this.action?.kind === "scene" ? A(e, "action_scene_description") : "";
		return x`
      <div class="field"><label for="action-target-mode">${A(e, "action_target")}</label>
        <select id="action-target-mode" data-value=${t ? "other" : "device"} ?disabled=${this.disabled}
          @change=${(e) => this._setTarget(e.target.value === "other" ? "" : void 0)}>
          <option value="device">${A(e, "action_target_device")}</option>
          <option value="other">${A(e, "action_target_other")}</option>
        </select></div>
      ${t ? x`<wp-entity-picker .hass=${this.hass} .value=${n} .disabled=${this.disabled} .label=${A(e, "action_target_entity")}
        @wp-change=${(e) => {
			e.stopPropagation(), this._setTarget(e.detail);
		}}></wp-entity-picker>
        <p class="hint">${A(e, "action_target_hint")}</p>` : C}
      ${this.allowed?.length === 0 ? x`<p class="hint" role="status">${A(e, "action_none_allowed")}</p>` : C}
      <label class="action-label" for="action">${A(e, "action")}</label>
      <select id="action" data-value=${c || ""} aria-describedby="action-description" ?disabled=${this.disabled || !n}
        @change=${(e) => {
			let r = e.target.value;
			r && (r.startsWith("scene.") ? this._emit({
				kind: "scene",
				scene: r
			}) : this._emit({
				kind: "service",
				service: r,
				...t ? { target_entity_id: n } : {},
				data: ln(this.hass, r, n)
			}));
		}}>
        <option value="" disabled ?selected=${!c}>${A(e, "action_choose")}</option>
        ${i.map((t) => x`<option value=${t.id} ?selected=${t.id === r}
          title=${nn(this.hass, t.id) || A(e, "action_no_description")}>${t.label}</option>`)}
        ${this.action?.kind === "scene" && !s.some((e) => e.entity_id === c) ? x`<option value=${c} selected>${c}</option>` : C}
        ${s.map((t) => x`<option value=${t.entity_id} ?selected=${t.entity_id === c}
          title=${A(e, "action_scene_description")}>${String(t.attributes.friendly_name ?? t.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${l}</p>
      ${o.map((e) => this._field(e, a))}`;
	}
	static {
		this.styles = [U, o`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 14px; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 14px;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
	}
};
O([E({ attribute: !1 })], Mn.prototype, "hass", void 0), O([E({ attribute: "entity-id" })], Mn.prototype, "entityId", void 0), O([E({ attribute: !1 })], Mn.prototype, "action", void 0), O([E({ type: Boolean })], Mn.prototype, "disabled", void 0), O([E({ attribute: !1 })], Mn.prototype, "allowed", void 0), O([D()], Mn.prototype, "_selector", void 0), Mn = O([T("wp-action-picker")], Mn);
// src/components/label-picker.ts
var G = class extends w {
	constructor(...e) {
		super(...e), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this.readonlySettings = !1, this.embedded = !1, this._form = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._ov = {}, this._error = "", this._saving = !1, this._valueFor = null, this._confirmDel = !1, this._delError = "", this._loaded = "";
	}
	get _lang() {
		return kn(this.hass);
	}
	_emit(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	updated() {
		let e = V(this.data, this.value)?.action, t = e?.kind === "service" ? e.service.split(".")[0] : "";
		this.hass && t && this._loaded !== t && (this._loaded = t, Qt(this.hass, [t]).then((e) => e && this.requestUpdate()));
	}
	_open(e) {
		let t = e ? V(this.data, this.value) : void 0;
		(!e || t) && (this._form = !0, this._editId = t?.id ?? null, this._name = t?.name ?? "", this._color = t?.color ?? mn(this.data.labels), this._action = t ? structuredClone(t.action) : null, this._ov = {}, this._valueFor = null, this._error = "", this._changed());
	}
	_close() {
		this._form = !1, this._error = "", this._changed();
	}
	_changed() {
		this.embedded && this._emit("label-draft", this._form ? this._draft() : null);
	}
	_draft() {
		return {
			id: this._editId,
			name: this._name.trim(),
			color: this._color,
			action: this._action,
			overrides: Object.entries(this._ov).map(([e, t]) => ({
				entityId: e,
				action: t
			})),
			problem: this._formProblem
		};
	}
	get _formProblem() {
		let e = this._lang;
		return this._name.trim() ? !this._action || this._action.kind === "service" && (!this._action.service || this._action.target_entity_id === "") ? A(e, "lb_err_action") : this._action.kind === "service" && un(this.hass, this._action.service, this._action.data, this._action.target_entity_id ?? this.entityIds[0], this._action.data_sources).length ? A(e, "lb_err_fields") : "" : A(e, "lb_err_name");
	}
	_set(e) {
		e.name !== void 0 && (this._name = e.name), e.color !== void 0 && (this._color = e.color), e.action !== void 0 && (this._action = e.action), this._error = "", this._changed();
	}
	_ownValue(e, t) {
		return e in this._ov ? this._ov[e] : this.program.entities.find((t) => t.entity_id === e)?.label_overrides?.[t] ?? null;
	}
	async _saveOverrides(e) {
		let t = Object.entries(this._ov);
		if (t.length) for (let n = 0; n < 2; n++) {
			let n = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((e) => e.id === this.program.id);
			if (!n) return;
			let r = {
				...n,
				entities: n.entities.map((n) => {
					let r = t.filter(([e]) => e === n.entity_id);
					if (!r.length) return n;
					let i = { ...n.label_overrides ?? {} };
					for (let [, t] of r) t ? i[e] = t : delete i[e];
					return {
						...n,
						label_overrides: i
					};
				})
			};
			try {
				await this.hass.callWS({
					type: "weekly_planner/program/save",
					program: r
				});
				return;
			} catch (e) {
				if (e?.code !== "conflict") throw e;
			}
		}
	}
	async _save() {
		let e = this._formProblem;
		if (e) this._error = e;
		else {
			this._saving = !0;
			try {
				let e = await this.hass.callWS({
					type: "weekly_planner/label/save",
					label: {
						...this._editId ? { id: this._editId } : {},
						name: this._name.trim(),
						color: this._color,
						action: this._action
					}
				});
				await this._saveOverrides(e.label.id), this._form = !1, this._emit("label-change", e.label.id);
			} catch (e) {
				let t = e;
				this._error = t?.code === "unauthorized" ? A(this._lang, "err_unauthorized") : A(this._lang, "lb_err_save");
			} finally {
				this._saving = !1;
			}
		}
	}
	async _delete(e) {
		this._saving = !0;
		try {
			await this.hass.callWS({
				type: "weekly_planner/label/delete",
				label_id: e.id
			}), this._confirmDel = !1, this._delError = "", this._form = !1, this._changed(), this._emit("label-change", null);
		} catch (t) {
			let n = t;
			this._delError = n?.code === "in_use" ? A(this._lang, "lb_delete_used", {
				name: H(this.hass, e),
				programs: n.message || ""
			}) : n?.code === "unauthorized" ? A(this._lang, "err_unauthorized") : A(this._lang, "lb_err_delete");
		} finally {
			this._saving = !1;
		}
	}
	_renderDelete(e) {
		let t = this._lang, n = H(this.hass, e), r = Dn(this.data, e.id), i = r.length > 0 || !!this._delError, a = this._delError || (r.length ? A(t, "lb_delete_used", {
			name: n,
			programs: r.join(", ")
		}) : A(t, "lb_delete_ask", { name: n }));
		return x`<div class="delbox" role="alert">
      <p class="${i ? "err" : ""}">${a}</p>
      <div class="btns">
        ${i ? C : x`<button class="btn danger-line" ?disabled=${this._saving || this.disabled} @click=${() => void this._delete(e)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${A(t, "delete")}</button>`}
        <button class="btn" @click=${() => {
			this._confirmDel = !1, this._delError = "";
		}}>${A(t, i ? "close" : "cancel")}</button>
      </div>
    </div>`;
	}
	_choose(e) {
		this._confirmDel = !1, this._delError = "", this._form && (this._form = !1, this._changed()), this._emit("label-change", e);
	}
	_valueEditor(e, t) {
		let n = this._lang, r = this._ownValue(e, t), i = this._valueFor === e;
		return x`<div class="dev">
      <button class="link ${r ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${i}
        @click=${() => this._valueFor = i ? null : e}>${A(n, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${z(this.hass, e)}` : ""}</button>
      ${i ? x`<div class="valbox">
        <wp-action-picker .hass=${this.hass} entity-id=${e} .allowed=${_n(this.program, e)}
          .action=${r ?? this._action} ?disabled=${this.disabled}
          @action-change=${(t) => {
			t.stopPropagation(), this._ov = {
				...this._ov,
				[e]: t.detail
			}, this._error = "", this._changed();
		}}></wp-action-picker>
        ${r ? x`<button class="btn" ?disabled=${this.disabled}
          @click=${() => {
			this._ov = {
				...this._ov,
				[e]: null
			}, this._changed();
		}}>
          <ha-icon icon="mdi:undo"></ha-icon>${A(n, "lb_common_value")}</button>` : C}
      </div>` : C}
    </div>`;
	}
	_renderForm() {
		let e = this._lang;
		return x`<div class="form">
      <div class="field"><label for="lb-name">${A(e, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e) => this._set({ name: e.target.value })} /></div>
      <div class="swatches" role="radiogroup" aria-label=${A(e, "lb_color")}>
        ${pn.map((e) => x`<button class="sw ${e === this._color ? "on" : ""}" role="radio" aria-checked=${e === this._color}
          aria-label=${e} style="background:${e}" @click=${() => this._set({ color: e })}></button>`)}
      </div>
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${_n(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled}
        @action-change=${(e) => {
			e.stopPropagation(), this._set({ action: e.detail });
		}}></wp-action-picker>
      ${this._editId ? this.entityIds.map((e) => this._valueEditor(e, this._editId)) : C}
      ${this._error ? x`<p class="err" role="alert">${this._error}</p>` : C}
      ${this.embedded ? C : x`<div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled} @click=${() => void this._save()}>${A(e, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${A(e, "cancel")}</button>
      </div>`}
    </div>`;
	}
	_renderDetails(e) {
		let t = this._lang;
		return x`
      <!-- framed in the label's colour so it clearly belongs to it -->
      <div class="details" style="--lc:${e.color}">
        <div class="dhead">
          <i class="dot" style="background:${e.color}"></i><b>${H(this.hass, e)}</b>
          ${Dn(this.data, e.id).some((e) => e !== this.program.name) ? x`<span class="shared">${A(t, "shared")}</span>` : C}
          ${this.readonlySettings ? C : x`<button class="pen ${this._form ? "on" : ""}" aria-label=${A(t, "rename_label")} title=${A(t, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => this._form && this._editId ? this._close() : this._open(!0)}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="pen ${this._confirmDel ? "on" : ""}" aria-label=${A(t, "lb_delete")} title=${A(t, "lb_delete")}
            aria-expanded=${this._confirmDel} ?disabled=${this.disabled}
            @click=${() => {
			this._confirmDel = !this._confirmDel, this._delError = "";
		}}><ha-icon icon="mdi:delete-outline"></ha-icon></button>`}
        </div>
        ${this._confirmDel && !this.readonlySettings ? this._renderDelete(e) : C}
        ${this._form && !this.readonlySettings ? C : x`
          <div class="sum"><span class="what">${En(this.hass, t, e.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((n) => {
			let r = xn(this.program, n, e.id) ? bn(this.program, n, e) : void 0;
			return r ? x`<div class="sum"><span class="k">${A(t, "lb_value_here")} :</span>
              <span class="what">${wn(this.hass, t, r)}</span>
              ${this.entityIds.length > 1 ? x`<span class="who">${z(this.hass, n)}</span>` : C}</div>` : C;
		})}`}
        ${this._form && this._editId && !this.readonlySettings ? this._renderForm() : C}
      </div>`;
	}
	render() {
		if (!this.hass || !this.data) return C;
		let e = this._lang, t = yn(this.hass, this.data, this.entityIds, this.program), n = V(this.data, this.value), r = (e, t, n, r) => x`
      <button class="chip ${t ? "on" : ""}" role="radio" aria-checked=${t} ?disabled=${this.disabled} @click=${n}>
        ${r ? x`<i class="dot" style="background:${r}"></i>` : C}<span>${e}</span></button>`;
		return x`
      <div class="chips" role="radiogroup" aria-label=${A(e, "action")}>
        ${this.allowNone ? r(A(e, "rest_none"), this.value === null, () => this._choose(null)) : C}
        ${t.map((e) => r(H(this.hass, e), e.id === this.value, () => this._choose(e.id), e.color))}
        ${this.value && !n ? r("?", !0, () => void 0) : C}
        ${this.compact || this.readonlySettings ? C : x`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => this._form && !this._editId ? this._close() : this._open(!1)}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${A(e, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId && !this.readonlySettings ? this._renderForm() : C}
      ${n && (!this._form || this._editId || this.readonlySettings) ? this._renderDetails(n) : C}`;
	}
	static {
		this.styles = [U, o`
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
	}
};
O([E({ attribute: !1 })], G.prototype, "hass", void 0), O([E({ attribute: !1 })], G.prototype, "data", void 0), O([E({ attribute: !1 })], G.prototype, "program", void 0), O([E({ attribute: !1 })], G.prototype, "entityIds", void 0), O([E({ attribute: !1 })], G.prototype, "value", void 0), O([E({
	type: Boolean,
	attribute: "allow-none"
})], G.prototype, "allowNone", void 0), O([E({ type: Boolean })], G.prototype, "disabled", void 0), O([E({ type: Boolean })], G.prototype, "compact", void 0), O([E({
	type: Boolean,
	attribute: "readonly-settings"
})], G.prototype, "readonlySettings", void 0), O([E({ type: Boolean })], G.prototype, "embedded", void 0), O([D()], G.prototype, "_form", void 0), O([D()], G.prototype, "_editId", void 0), O([D()], G.prototype, "_name", void 0), O([D()], G.prototype, "_color", void 0), O([D()], G.prototype, "_action", void 0), O([D()], G.prototype, "_ov", void 0), O([D()], G.prototype, "_error", void 0), O([D()], G.prototype, "_saving", void 0), O([D()], G.prototype, "_valueFor", void 0), O([D()], G.prototype, "_confirmDel", void 0), O([D()], G.prototype, "_delError", void 0), G = O([T("wp-label-picker")], G);
// src/components/confirm.ts
var Nn = class extends w {
	constructor(...e) {
		super(...e), this.message = "", this.confirmLabel = "", this.cancelLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (e) => {
			e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
		};
	}
	_choose(e) {
		this._result = e, this.renderRoot.querySelector("wp-dialog")?.close();
	}
	render() {
		let e = k(this.lang);
		return x`
      <wp-dialog open heading=${e.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${this.cancelLabel || e.cancel}</button>
        </div>
      </wp-dialog>
    `;
	}
	static {
		this.styles = o`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
	}
};
O([E()], Nn.prototype, "message", void 0), O([E({ attribute: "confirm-label" })], Nn.prototype, "confirmLabel", void 0), O([E({ attribute: "cancel-label" })], Nn.prototype, "cancelLabel", void 0), O([E()], Nn.prototype, "lang", void 0), Nn = O([T("wp-confirm")], Nn);
function Pn(e, t, n, r = "") {
	return new Promise((i) => {
		let a = document.createElement("wp-confirm");
		a.message = t, a.confirmLabel = n, a.cancelLabel = r;
		let o = e.hass;
		a.lang = o?.locale?.language ?? o?.language ?? (document.documentElement.lang || "en"), a.addEventListener("choice", (e) => {
			a.remove(), i(!!e.detail);
		}), (e.shadowRoot ?? e).appendChild(a);
	});
}
var Fn = (e) => e.replace(/ /g, "\xA0"), In = (e, t) => JSON.stringify(e) === JSON.stringify(t), Ln = (e, t) => {
	let n = Math.abs(t), r = n < 60 ? `${n} min` : n % 60 ? `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, "0")}` : `${n / 60} h`;
	return `${t > 0 ? "+" : "−"}${r}`;
};
function Rn(e, t, n) {
	let r = t.random_minutes ? ` · ${A(e, "random_window", { n: String(t.random_minutes) })}` : "";
	if ("time" in t) {
		let [n, i] = t.time.split(":").map(Number);
		return Fn((n * 60 + i >= 1440 ? "24 h" : F(e, n * 60 + i)) + r);
	}
	return Fn(`${A(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`)}${t.offset ? ` ${Ln(e, t.offset)}` : ""}${r}`);
}
function zn(e, t) {
	if ("time" in e) {
		let [n, r] = e.time.split(":").map(Number), i = Math.max(0, Math.min(j, Math.round((n * 60 + r + t) / 5) * 5));
		return {
			...e,
			time: i >= 1440 ? "24:00" : `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`
		};
	}
	return {
		...e,
		offset: Math.max(-240, Math.min(240, (e.offset ?? 0) + t))
	};
}
var Bn = [
	0,
	1,
	2,
	3,
	4
], Vn = [5, 6], Hn = [
	0,
	1,
	2,
	3,
	4,
	5,
	6
];
function Un(e, t, n) {
	let r = [...n].sort((e, t) => e - t);
	return In(r, Hn) ? A(e, "all_days_text") : In(r, Bn) ? `${t[0]}–${t[4]}` : In(r, Vn) ? A(e, "weekend") : r.map((e) => t[e]).join("\xA0");
}
function Wn(e) {
	if (Array.isArray(e)) return `[${e.map(Wn).join(",")}]`;
	if (e && typeof e == "object") {
		let t = e;
		return `{${Object.keys(t).sort().map((e) => `${JSON.stringify(e)}:${Wn(t[e])}`).join(",")}}`;
	}
	return JSON.stringify(e);
}
function Gn(e) {
	let { id: t, ...n } = e;
	return Wn({
		...n,
		conditions: e.conditions ?? [],
		end: e.end ?? null,
		color: e.color ?? null
	});
}
function Kn(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	return e.days.forEach((e, n) => {
		for (let i of e) {
			if (!t(i)) continue;
			let e = Gn(i), a = r.get(e);
			a && a.days.includes(n) ? (a = void 0, r.set(`${e}#${i.id}`, {
				slot: i,
				days: [n],
				ids: { [n]: i.id }
			})) : (a || (a = {
				slot: i,
				days: [],
				ids: {}
			}, r.set(e, a)), a.days.push(n), a.ids[n] = i.id);
		}
	}), [...r.values()].sort((e, t) => n(e.slot.start) - n(t.slot.start) || e.days[0] - t.days[0]);
}
function qn(e, t, n, r) {
	let i = e.days.map((e) => e.filter((e) => !n(e)));
	for (let e of t) for (let t of e.days) i[t].push({
		...structuredClone(e.slot),
		id: e.ids[t] ?? B()
	});
	return {
		...e,
		days: i.map((e) => e.sort((e, t) => r(e.start) - r(t.start)))
	};
}
// src/slots.ts
var Jn = {
	dawn: "next_dawn",
	sunrise: "next_rising",
	sunset: "next_setting",
	dusk: "next_dusk"
}, Yn = {
	dawn: 360,
	sunrise: 420,
	sunset: 1140,
	dusk: 1200
};
function Xn(e, t) {
	if ("time" in t) return M(t.time);
	let n = e.states["sun.sun"]?.attributes[Jn[t.sun]], r = n ? N(n, e.config.time_zone) : Yn[t.sun];
	return r += t.offset ?? 0, t.earliest && (r = Math.max(r, M(t.earliest))), t.latest && (r = Math.min(r, M(t.latest))), Math.max(0, Math.min(j, r));
}
function Zn(e, t, n) {
	let r = t.random_minutes ? { random_minutes: t.random_minutes } : {};
	if ("time" in t) return {
		...t,
		time: ht(Math.max(0, Math.min(j, M(t.time) + n)))
	};
	let i = (t.offset ?? 0) + n;
	return Math.abs(i) <= 240 ? {
		...t,
		offset: i
	} : {
		time: ht(Math.max(0, Math.min(j, Xn(e, t) + n))),
		...r
	};
}
function Qn(e) {
	return !!(e && "sun" in e && e.earliest && e.latest && M(e.earliest) > M(e.latest));
}
function $n(e) {
	let t = _t(e.start);
	if (t === null || !e.end) return null;
	let n = _t(e.end);
	return n === null ? null : n > t ? [t, n] : [t, j];
}
function er(e) {
	let t = e.map((e) => ({
		slot: e,
		iv: $n(e)
	})).filter((e) => e.iv !== null).sort((e, t) => e.iv[0] - t.iv[0]), n = t[0]?.iv[1] ?? 0, r = t[0]?.slot;
	for (let e = 1; e < t.length; e++) {
		if (t[e].iv[0] < n) return [r, t[e].slot];
		t[e].iv[1] > n && (n = t[e].iv[1], r = t[e].slot);
	}
	return null;
}
// src/edits.ts
var tr = (e) => e.ids[e.days[0]], nr = (e, t) => t !== null && Object.values(e.ids).includes(t);
function rr(e, t, n, r) {
	return Kn(e, t, n).find((e) => nr(e, r)) ?? null;
}
function ir(e, t) {
	return e ? Gn(e.slot) === Gn(t.slot) ? JSON.stringify(e.days) === JSON.stringify(t.days) && JSON.stringify(e.ids) === JSON.stringify(t.ids) ? "same" : "days" : "changed" : "gone";
}
function ar(e, t) {
	let { [t]: n, ...r } = e.ids;
	return {
		draft: {
			slot: structuredClone(e.slot),
			days: [t],
			ids: n ? { [t]: n } : {}
		},
		rest: {
			slot: structuredClone(e.slot),
			days: e.days.filter((e) => e !== t),
			ids: r
		}
	};
}
function or(e, t) {
	if (!e) return [];
	let n = e.days.filter((e) => !t.includes(e)), r = Object.fromEntries(n.filter((t) => e.ids[t]).map((t) => [t, e.ids[t]]));
	return n.length ? [{
		...e,
		days: n,
		ids: r
	}] : [];
}
function sr(e, t, n, r) {
	let i = Kn(e, t, n).filter((e) => !nr(e, r.openId));
	return i.push(...or(r.rest, r.draft?.days ?? [])), r.draft && i.push(r.draft), qn(e, i, t, n);
}
function cr(e) {
	for (let t = 0; t < e.days.length; t++) {
		let n = er(e.days[t]);
		if (n) return {
			day: t,
			a: n[0],
			b: n[1]
		};
	}
	return null;
}
function lr(e, t, n, r, i = Hn) {
	let a = [], o = [];
	for (let n of i) {
		let i = {
			...r,
			id: "__new__"
		};
		(er([...e.days[n].filter(t), i]) ? o : a).push(n);
	}
	return {
		free: a,
		busy: o
	};
}
var ur = 5;
function dr(e, t) {
	let n = 480;
	e.length && (n = Math.max(...e.map((e) => t(e.end ?? e.start))), n = Math.ceil(n / ur) * ur);
	let r = Math.min(n, j - 60);
	return {
		start: ht(r),
		end: ht(Math.min(j, r + 60))
	};
}
function fr(e, t, n = {
	start: "08:00",
	end: "09:00"
}) {
	return {
		slot: {
			id: B(),
			start: { time: n.start },
			end: { time: n.end },
			conditions: [],
			label: e
		},
		days: [...t],
		ids: {},
		fresh: !0
	};
}
var pr = (e) => Math.round(e / 15) * 15, mr = (e, t, n) => Math.max(t, Math.min(n, e));
function hr(e) {
	let t = mr(Math.round(e), 0, j);
	return { time: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}` };
}
function K(e, t) {
	let n = t(e.start);
	if (!e.end) return {
		start: n,
		end: null,
		wrap: !1
	};
	let r = t(e.end);
	return r > n ? {
		start: n,
		end: r,
		wrap: !1
	} : {
		start: n,
		end: j,
		wrap: !0
	};
}
function gr(e, t) {
	let n = e.map((e) => ({
		slot: e,
		e: K(e, t.at)
	})).filter((e) => e.e.end !== null).sort((e, t) => e.e.start - t.e.start), r = [], i = t.lead ?? 0;
	for (let { slot: e, e: t } of n) t.start > i && r.push({
		kind: "gap",
		start: i,
		end: t.start
	}), r.push({
		kind: "slot",
		id: e.id,
		slot: e,
		start: t.start,
		end: t.end,
		wrap: t.wrap
	}), i = Math.max(i, t.end);
	return i < 1440 && r.push({
		kind: "gap",
		start: i,
		end: j
	}), r;
}
function _r(e, t) {
	let n = [], r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = K(i, t.at);
		if (e.end === null) {
			n.push({
				m: e.start,
				refs: [{
					id: i.id,
					edge: "start"
				}],
				oneShot: !0
			});
			continue;
		}
		let a = [[e.start, {
			id: i.id,
			edge: "start"
		}]];
		e.wrap || a.push([e.end, {
			id: i.id,
			edge: "end"
		}]);
		for (let [e, t] of a) {
			let i = r.get(e);
			i || (i = {
				m: e,
				refs: [],
				oneShot: !1
			}, r.set(e, i), n.push(i)), i.refs.push(t);
		}
	}
	return n.sort((e, t) => e.m - t.m);
}
var vr = (e, t) => e.id === t.id && e.edge === t.edge;
function yr(e, t, n) {
	let r = e.find((e) => e.id === t.id);
	if (!r) return null;
	let i = K(r, n.at);
	return t.edge === "start" ? i.start : i.end;
}
function br(e, t, n, r) {
	let i = e.find((e) => e.id === t.id);
	if (!i) return null;
	let a = K(i, r.at), o, s = 0, c = j;
	if (a.end === null) {
		if (t.edge !== "start") return null;
		o = [t], c = j - 15;
	} else {
		if (t.edge === "end" && a.wrap) return null;
		let n = _r(e, r).find((e) => !e.oneShot && e.refs.some((e) => vr(e, t)));
		if (!n) return null;
		o = n.refs;
		let i = n.m;
		i >= (r.lead ?? 0) && (s = r.lead ?? 0);
		for (let t of e) {
			let e = K(t, r.at);
			if (e.end === null) continue;
			let n = [[e.start, {
				id: t.id,
				edge: "start"
			}], [e.end, e.wrap ? null : {
				id: t.id,
				edge: "end"
			}]];
			for (let [e, t] of n) t && o.some((e) => vr(e, t)) || (e < i ? s = Math.max(s, e) : e > i && (c = Math.min(c, e)));
		}
		for (let t of o) {
			let n = K(e.find((e) => e.id === t.id), r.at);
			t.edge === "end" ? s = Math.max(s, n.start + 15) : c = Math.min(c, n.end - 15);
		}
	}
	if (s > c) return {
		slots: e,
		m: yr(e, t, r) ?? 0
	};
	let l = mr(pr(n), s, c), u = hr(l);
	return {
		slots: e.map((e) => {
			let t = o.find((t) => t.id === e.id);
			return t ? t.edge === "start" ? {
				...e,
				start: u
			} : {
				...e,
				end: u
			} : e;
		}),
		m: l
	};
}
function xr(e, t) {
	return t - e < 30 ? null : mr(pr((e + t) / 2), e + 15, t - 15);
}
function Sr(e, t, n) {
	let r = n.newId ?? Tr;
	if (t.kind === "gap") {
		let i = xr(t.start, t.end);
		if (i === null || !n.defaultLabel) return null;
		let a = {
			id: r(),
			start: hr(i),
			end: hr(t.end),
			conditions: [],
			label: n.defaultLabel
		};
		return {
			slots: Er([...e, a], n),
			handle: {
				id: a.id,
				edge: "start"
			}
		};
	}
	let i = e.find((e) => e.id === t.id);
	if (!i || !i.end) return null;
	let a = K(i, n.at), o = xr(a.start, a.end);
	if (o === null) return null;
	let s = {
		...i,
		end: hr(o)
	};
	return {
		slots: Er(e.map((e) => e.id === i.id ? s : e), n),
		handle: {
			id: i.id,
			edge: "end"
		}
	};
}
function Cr(e, t, n, r) {
	if (t.kind === "slot") return e.map((e) => e.id === t.id ? {
		...e,
		label: n
	} : e);
	let i = {
		id: (r.newId ?? Tr)(),
		start: hr(t.start),
		end: hr(t.end),
		conditions: [],
		label: n
	};
	return Er([...e, i], r);
}
function wr(e, t) {
	return e.filter((e) => e.id !== t);
}
var Tr = () => B();
function Er(e, t) {
	return [...e].sort((e, n) => t.at(e.start) - t.at(n.start));
}
var Dr = (e, t) => e.label === t.label && Or(e.conditions ?? []) === Or(t.conditions ?? []) && (e.color ?? null) === (t.color ?? null), Or = (e) => JSON.stringify(e);
function kr(e, t, n = /* @__PURE__ */ new Set()) {
	let r = [];
	for (let i of Er(e, t)) {
		let e = r[r.length - 1];
		if (e && e.end && i.end) {
			let a = K(e, t.at), o = K(i, t.at);
			if (!a.wrap && a.end === o.start && !e.end.random_minutes && !i.start.random_minutes && Dr(e, i) && !n.has(e.id) && !n.has(i.id)) {
				r[r.length - 1] = {
					...e,
					end: i.end
				};
				continue;
			}
		}
		r.push(i);
	}
	return r;
}
function Ar(e, t, n, r) {
	let i = r.newId ?? Tr, a = [];
	for (let o of e) {
		let e = K(o, r.at);
		if (e.end === null || e.end <= t || e.start >= n) {
			a.push(o);
			continue;
		}
		let s = e.start < t, c = e.end > n;
		s && a.push({
			...o,
			end: hr(t)
		}), c && a.push({
			...structuredClone(o),
			id: s ? i() : o.id,
			start: hr(n)
		});
	}
	return a;
}
function jr(e, t, n, r) {
	let i = e[t.day]?.find((e) => e.id === t.id);
	if (!i) return [];
	let a = K(i, r.at);
	return a.end === null ? [] : n.filter((n) => n !== t.day && e[n].some((e) => {
		let t = K(e, r.at);
		return t.end !== null && t.start < a.end && t.end > a.start;
	}));
}
function Mr(e, t, n, r, i = []) {
	let a = e[t.day]?.find((e) => e.id === t.id);
	if (!a) return e;
	let o = r.newId ?? Tr, s = K(a, r.at);
	return e.map((e, c) => {
		if (!n.includes(c) || c === t.day || i.includes(c)) return e;
		let l = {
			...structuredClone(a),
			id: o()
		};
		return s.end === null ? e.some((e) => !e.end && Or(e.start) === Or(a.start) && e.label === a.label) ? e : Er([...e, l], r) : kr([...Ar(e, s.start, s.end, r), l], r);
	});
}
// src/hold-hint.ts
var Nr = "weekly_planner.hold_hint", Pr = 2e3;
function Fr() {
	try {
		let e = Number(window.localStorage.getItem(Nr));
		return Number.isFinite(e) && e > 0 ? e : 0;
	} catch {
		return 0;
	}
}
function Ir(e) {
	try {
		window.localStorage.setItem(Nr, String(e));
	} catch {}
}
function Lr() {
	let e = Fr();
	return e >= 3 ? !1 : (Ir(e + 1), !0);
}
function Rr() {
	Fr() < 3 && Ir(3);
}
// src/components/bar-editor.ts
var zr = 450, Br = 22, Vr = 8, Hr = 700, Ur = /* @__PURE__ */ new Map(), Wr = (e, t) => e && e.revision > t.revision ? e : t, q = class extends w {
	constructor(...e) {
		super(...e), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.lang = "en", this.tz = "UTC", this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._hover = !1, this._hint = !1, this._kbd = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (e) => "time" in e ? M(e.time) : this._sun.get(JSON.stringify(e)) ?? Xn(this.hass, e), this._outside = (e) => {
			let t = e.composedPath();
			t.includes(this) || t.some((e) => e instanceof HTMLElement && e.classList?.contains("snack")) || this._emit("edit-exit");
		}, this._escape = (e) => {
			e.key === "Escape" && !this._conflict && this._emit("edit-exit");
		};
	}
	get _live() {
		return Wr(Ur.get(this.program.id), this.program);
	}
	get _baseDay() {
		return R(this._live, this.data).days[this.weekday] ?? [];
	}
	get _day() {
		return this._draft ?? this._baseDay;
	}
	get _lead() {
		return Math.max(0, ...this.spans.filter((e) => e.spill).map((e) => e.end));
	}
	_ctx(e) {
		let t = this.program.entities.find((e) => e.entity_id === this.entityId), n = yn(this.hass, this.data, [this.entityId])[0]?.id, r = new Map(this._sun);
		return {
			at: (e) => "time" in e ? M(e.time) : r.get(JSON.stringify(e)) ?? Xn(this.hass, e),
			lead: this._lead,
			newId: e ?? B,
			defaultLabel: t?.default_label ?? n
		};
	}
	willUpdate(e) {
		if (e.has("program") || e.has("preview") || e.has("data")) {
			this._sun = /* @__PURE__ */ new Map();
			for (let e of this._baseDay) {
				let t = this.preview?.find((t) => t.slot_id === e.id);
				t && ("sun" in e.start && this._sun.set(JSON.stringify(e.start), N(t.start, this.tz)), e.end && "sun" in e.end && t.end && this._sun.set(JSON.stringify(e.end), N(t.end, this.tz)));
			}
			this._awaitRev !== null && this.program.revision >= this._awaitRev && this._dropDraft();
		}
	}
	updated(e) {
		e.has("editing") && (this.editing ? (this._clearHint(), this._listen(!0), this._kbd && this.renderRoot.querySelector(".hd")?.focus()) : (this._listen(!1), this._kbd && this.renderRoot.querySelector(".zone")?.focus(), this._kbd = !1, this._flushNudge(), this._selected = null, this._hsel = null, this._copyOpen = !1, this._conflict = null, this._keep.clear(), this._bubble = null));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._listen(!1), window.clearTimeout(this._clearTimer), window.clearTimeout(this._errTimer), window.clearTimeout(this._hintTimer), window.clearTimeout(this._press?.timer);
	}
	_dropDraft() {
		this._draft = null, this._awaitRev = null, window.clearTimeout(this._clearTimer);
	}
	_listen(e) {
		if (e === this._listening) return;
		this._listening = e;
		let t = e ? document.addEventListener.bind(document) : document.removeEventListener.bind(document);
		t("pointerdown", this._outside, !0), t("keydown", this._escape);
	}
	_emit(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	_zoneDown(e) {
		if (this.editing || e.button !== 0) return;
		let t = e.pointerType === "mouse";
		this._press = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			fired: !1,
			mouse: t
		}, this.editable && !t && (this._press.timer = window.setTimeout(() => {
			this._press && (this._press.fired = !0, navigator.vibrate?.(12), this._clearHint(), Rr(), this._emit("edit-request"));
		}, zr));
	}
	_zoneMove(e) {
		let t = this._press;
		t && t.id === e.pointerId && Math.hypot(e.clientX - t.x, e.clientY - t.y) > Vr && (window.clearTimeout(t.timer), this._press = void 0);
	}
	_zoneUp(e) {
		let t = this._press;
		t && t.id === e.pointerId && (window.clearTimeout(t.timer), this._press = void 0, t.fired || (t.mouse && this.editable ? this._emit("edit-request") : this.editable && !t.mouse ? this._tapHint() : this._emit("open-day")));
	}
	_tapHint() {
		this._hint ? (this._clearHint(), this._emit("open-day")) : Lr() ? (this._hint = !0, this._hintTimer = window.setTimeout(() => {
			this._hint = !1, this._hintTimer = void 0, this._emit("open-day");
		}, Pr)) : this._emit("open-day");
	}
	_clearHint() {
		window.clearTimeout(this._hintTimer), this._hintTimer = void 0, this._hint = !1;
	}
	_zoneKey(e) {
		this.editing || e.target !== e.currentTarget || e.key !== "Enter" && e.key !== " " || (e.preventDefault(), this.editable ? (this._kbd = !0, this._clearHint(), Rr(), this._emit("edit-request")) : this._emit("open-day"));
	}
	_zoneCancel() {
		window.clearTimeout(this._press?.timer), this._press = void 0;
	}
	get _overlay() {
		return this.renderRoot.querySelector(".ov");
	}
	_minuteAt(e) {
		let t = this._overlay?.getBoundingClientRect(), n = t?.width || 1;
		return {
			m: (e - (t?.left ?? 0)) / n * j,
			ppm: n / j
		};
	}
	_nearest(e, t) {
		let n;
		for (let r of _r(this._day, this._ctx())) {
			let i = Math.abs(r.m - e) * t;
			i <= Br && (!n || i < n.d) && (n = {
				b: r,
				d: i
			});
		}
		return n?.b;
	}
	_segAt(e) {
		let t = gr(this._day, this._ctx()).find((t) => e >= t.start && e < t.end);
		return t ? t.kind === "slot" ? {
			kind: "slot",
			id: t.id
		} : {
			kind: "gap",
			start: t.start,
			end: t.end
		} : null;
	}
	_ovDown(e) {
		if (e.button !== 0) return;
		this._flushNudge();
		let { m: t, ppm: n } = this._minuteAt(e.clientX), r = this._nearest(t, n);
		r ? (e.currentTarget.setPointerCapture?.(e.pointerId), this._drag = {
			ref: r.refs[0],
			m0: r.m,
			x0: e.clientX,
			id: e.pointerId,
			moved: !1,
			last: r.m,
			profileId: R(this._live, this.data).id,
			weekday: this.weekday,
			ctx: this._ctx()
		}, this._hsel = r.refs[0], e.preventDefault()) : this._tap = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			target: this._segAt(t)
		};
	}
	_ovMove(e) {
		let t = this._drag;
		if (t && t.id === e.pointerId) {
			let n = e.clientX - t.x0;
			if (!t.moved && Math.abs(n) < 3) return;
			t.moved = !0;
			let r = this._live.profiles.find((e) => e.id === t.profileId)?.days[t.weekday];
			if (!r) {
				this._ovCancel();
				return;
			}
			let i = br(r, t.ref, t.m0 + n / this._minuteAt(0).ppm, t.ctx);
			i && (t.last = i.m, this._draft = i.slots, this._bubble = { m: i.m });
		} else if (!this._tap && !t) {
			let { m: t, ppm: n } = this._minuteAt(e.clientX);
			this._hover = !!this._nearest(t, n);
		}
	}
	_ovUp(e) {
		let t = this._drag;
		if (t && t.id === e.pointerId) {
			if (this._drag = void 0, this._bubble = null, t.moved) {
				let { ref: e, last: n } = t;
				this._commit((r) => {
					let i = br(r[t.weekday], e, n, t.ctx);
					return i ? this._with(r, t.weekday, i.slots) : null;
				}, [t.weekday], !1, t.profileId);
			} else {
				let e = this._baseDay.find((e) => e.id === t.ref.id);
				e && !e.end && this._select({
					kind: "slot",
					id: e.id
				});
			}
			return;
		}
		let n = this._tap;
		n && n.id === e.pointerId && (this._tap = void 0, Math.hypot(e.clientX - n.x, e.clientY - n.y) <= Vr && n.target && this._select(n.target));
	}
	_ovCancel() {
		this._drag?.moved && (this._draft = null), this._drag = void 0, this._tap = void 0, this._bubble = null;
	}
	_select(e) {
		let t = this._selected && JSON.stringify(this._selected) === JSON.stringify(e);
		this._selected = t ? null : e, this._copyOpen = !1, this._copyDays = [];
	}
	_key(e, t) {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		e.preventDefault();
		let n = R(this._live, this.data).id;
		this._nudge && this._nudge.profileId !== n && (this._flushNudge(), this._draft = null);
		let r = this._nudge?.ctx ?? this._ctx(), i = this._draft ?? this._baseDay, a = this._nudge?.m ?? yr(i, t, r);
		if (a === null) return;
		let o = br(i, t, a + (e.key === "ArrowRight" ? 15 : -15), r);
		o && (this._draft = o.slots, this._bubble = { m: o.m }, window.clearTimeout(this._nudge?.timer), this._nudge = {
			ref: t,
			m: o.m,
			timer: window.setTimeout(() => this._flushNudge(), Hr),
			profileId: n,
			weekday: this.weekday,
			ctx: r
		});
	}
	_flushNudge() {
		let e = this._nudge;
		e && (window.clearTimeout(e.timer), this._nudge = void 0, this._bubble = null, this._commit((t) => {
			let n = br(t[e.weekday], e.ref, e.m, e.ctx);
			return n ? this._with(t, e.weekday, n.slots) : null;
		}, [e.weekday], !1, e.profileId));
	}
	_with(e, t, n) {
		return e.map((e, r) => r === t ? n : e);
	}
	_fail(e) {
		this._error = e, window.clearTimeout(this._errTimer), this._errTimer = window.setTimeout(() => this._error = "", 5e3);
	}
	async _commit(e, t, n = !1, r = R(this._live, this.data).id) {
		let i = this._live;
		for (let a = 0; a < 2; a++) {
			let o = i.profiles.find((e) => e.id === r);
			if (!o) return this._dropDraft(), !1;
			let s = o.days, c = e(s);
			if (!c) return this._dropDraft(), !1;
			let l = c.map((e, n) => t.includes(n) && e !== s[n] ? kr(e, this._ctx(), this._keep) : e), u = l.map((e, t) => t).filter((e) => JSON.stringify(l[e]) !== JSON.stringify(s[e]));
			if (!u.length) return this._dropDraft(), !0;
			let d = {
				...i,
				profiles: i.profiles.map((e) => e.id === o.id ? {
					...e,
					days: l
				} : e)
			};
			this._draft = l[this.weekday] ?? null;
			try {
				let e = await this.hass.callWS({
					type: "weekly_planner/program/save",
					program: structuredClone(d)
				});
				if (e?.program ? (Ur.set(e.program.id, e.program), this._awaitRev = e.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= e.program.revision && this._dropDraft()) : this._dropDraft(), !n) {
					let e = u.map((e) => [e, s[e]]);
					this._emit("edited", { undo: () => this._commit((t) => u.some((e) => JSON.stringify(t[e]) !== JSON.stringify(l[e])) ? null : t.map((t, n) => e.find((e) => e[0] === n)?.[1] ?? t), u, !0, r) });
				}
				return !0;
			} catch (e) {
				let t = e;
				if (t?.code === "conflict" && a === 0) try {
					let e = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((e) => e.id === i.id);
					if (e) {
						Ur.set(e.id, e), i = e;
						continue;
					}
				} catch {}
				return this._dropDraft(), this._fail(t?.message?.includes("overlapping_slots") ? A(this.lang, "w_err_overlap") : t?.code === "unauthorized" ? A(this.lang, "err_unauthorized") : A(this.lang, "ss_err_save")), !1;
			}
		}
		return !1;
	}
	get _sel() {
		let e = this._selected;
		if (!e) return null;
		let t = this._day;
		if (e.kind === "slot") {
			let n = t.find((t) => t.id === e.id);
			if (!n) return null;
			let r = K(n, this._at);
			return {
				target: e,
				slot: n,
				start: r.start,
				end: r.end
			};
		}
		let n = gr(t, this._ctx()).find((t) => t.kind === "gap" && t.start === e.start);
		return n ? {
			target: {
				kind: "gap",
				start: n.start,
				end: n.end
			},
			start: n.start,
			end: n.end
		} : null;
	}
	_pickLabel(e) {
		let t = this._sel;
		if (!t || e === null) return;
		let n = B(), r = t.target;
		this._commit((t) => this._with(t, this.weekday, Cr(t[this.weekday], r, e, this._ctx(() => n))), [this.weekday]), r.kind === "gap" && (this._selected = {
			kind: "slot",
			id: n
		});
	}
	async _nothing() {
		let e = this._sel;
		if (!e?.slot) return;
		let t = e.slot.id;
		await Pn(this, A(this.lang, "w_confirm_slot"), A(this.lang, "yes"), A(this.lang, "no")) && (this._selected = null, this._commit((e) => this._with(e, this.weekday, wr(e[this.weekday], t)), [this.weekday]));
	}
	_cut() {
		let e = this._sel;
		if (!e) return;
		let t = e.target, n = B(), r = this._ctx(() => n), i = Sr(this._day, t, r);
		i && (t.kind === "gap" && this._keep.add(n), this._hsel = i.handle, this._commit((e) => {
			let r = Sr(e[this.weekday], t, this._ctx(() => n));
			return r ? this._with(e, this.weekday, r.slots) : null;
		}, [this.weekday]).then(() => {
			this.updateComplete.then(() => this.renderRoot.querySelector(`[data-h="${i.handle.id}:${i.handle.edge}"]`)?.focus());
		}), t.kind === "gap" && (this._selected = {
			kind: "slot",
			id: n
		}));
	}
	_toggleDay(e) {
		this._copyDays = this._copyDays.includes(e) ? this._copyDays.filter((t) => t !== e) : [...this._copyDays, e];
	}
	_copyGo() {
		let e = this._sel;
		if (!e?.slot || !this._copyDays.length) return;
		let t = e.slot.id, n = [...this._copyDays].sort((e, t) => e - t), r = R(this._live, this.data).days, i = jr(r, {
			day: this.weekday,
			id: t
		}, n, this._ctx());
		i.length ? this._conflict = {
			to: n,
			days: i,
			skip: [],
			id: t
		} : this._doCopy(t, n, []);
	}
	async _doCopy(e, t, n) {
		this._conflict = null, this._copyOpen = !1, this._copyDays = [];
		let r = t.filter((e) => !n.includes(e));
		r.length && await this._commit((r) => {
			let i = Mr(r, {
				day: this.weekday,
				id: e
			}, t, this._ctx(), n);
			return i === r ? null : i;
		}, r);
	}
	_spansNow() {
		return this._draft ? [...this.spans.filter((e) => e.spill), ...this._spansOf(this._draft)] : this.spans;
	}
	_spansOf(e) {
		let t = [];
		for (let n of e) {
			let e = V(this.data, n.label);
			if (!e || !bn(this.program, this.entityId, e)) continue;
			let r = K(n, this._at);
			t.push({
				start: r.start,
				end: r.end ?? r.start + 10,
				color: e.color,
				label: H(this.hass, e),
				slotId: n.id,
				marker: r.end === null,
				startSun: bt(n.start),
				endSun: n.end ? bt(n.end) : null,
				startSpec: n.start,
				endSpec: n.end ?? null
			});
		}
		return t;
	}
	_clock(e) {
		return e >= 1440 ? "24 h" : F(this.lang, e);
	}
	_sunTitle(e, t) {
		let n = this._draft?.find((t) => t.id === e.id), r = e.edge === "start" ? n?.start : n?.end;
		return xt(this.lang, r, t);
	}
	_overlay_() {
		let e = this._day, t = this._ctx(), n = (e) => `${e / j * 100}%`, r = this._sel, i = _r(e, t);
		return x`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${r && r.end !== null ? x`<div class="selbox ${r.slot ? "" : "gap"}"
        style="left:${n(r.start)};width:${n(r.end - r.start)}"></div>` : C}
      ${r?.slot && r.end === null ? x`<div class="selpoint" style="left:${n(r.start)}"></div>` : C}
      ${st(i, (e) => e.refs.map((e) => `${e.id}:${e.edge}`).join("+"), (e) => {
			let t = e.refs[0], r = this._hsel && e.refs.some((e) => e.id === this._hsel?.id && e.edge === this._hsel?.edge);
			return x`<button class="hd ${e.oneShot ? "dot" : ""} ${r ? "on" : ""}" style="left:clamp(0px, ${n(e.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${e.m}
          aria-valuetext=${this._clock(e.m)} aria-label=${A(this.lang, "handle", { time: this._clock(e.m) })}
          data-h=${e.refs.map((e) => `${e.id}:${e.edge}`).join(" ")} title=${this._sunTitle(t, e.m)}
          @keydown=${(e) => this._key(e, t)} @focus=${() => this._hsel = t}
          ><i></i></button>`;
		})}
      ${this._bubble ? x`<div class="bubble" style="left:clamp(28px, ${n(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : C}
    </div>`;
	}
	_strip() {
		let e = this._sel;
		if (!e) return C;
		let t = this.lang, n = this._ctx(), r = e.end !== null && (e.slot ? !!e.slot.end : !!n.defaultLabel) && xr(e.start, e.end) !== null, i = k(t).days_short;
		return x`<div class="strip" role="group">
      <div class="acts">
        ${e.slot ? x`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${A(t, "rest_none_short")}</button>` : C}
        <button class="act" ?disabled=${!r} aria-label=${A(t, "cut")} title=${A(t, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${e.slot ? x`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => {
			this._copyOpen = !this._copyOpen, this._copyDays = [];
		}}><ha-icon icon="mdi:content-copy"></ha-icon>${A(t, "copy_to")}</button>` : C}
      </div>
      ${this._copyOpen && e.slot ? x`<div class="copy">
        ${i.map((e, t) => t === this.weekday ? C : x`<button class="dchip ${this._copyDays.includes(t) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(t)} @click=${() => this._toggleDay(t)}>${e}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${A(t, "copy_go")} title=${A(t, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${A(t, "copy_go")}</button>
      </div>` : C}
      <div class="pick">
        <wp-label-picker compact readonly-settings .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
          .value=${e.slot?.label ?? null} @label-change=${(e) => {
			e.stopPropagation(), this._pickLabel(e.detail);
		}}></wp-label-picker>
      </div>
    </div>`;
	}
	_conflictDialog() {
		let e = this._conflict;
		if (!e) return C;
		let t = this.lang, n = k(t).days, r = (t, n) => {
			this._conflict = {
				...e,
				skip: n ? [...e.skip.filter((e) => e !== t), t] : e.skip.filter((e) => e !== t)
			};
		}, i = e.to.every((t) => e.skip.includes(t)), a = R(this._live, this.data).days, o = this._ctx(), s = (e, t) => x`<div class="cfbar"><span>${e}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(t)} .now=${null}></wp-day-bar></div>`;
		return x`<wp-dialog open heading=${A(t, "conflict_title")} @closed=${(e) => {
			e.stopPropagation(), this._conflict = null;
		}}>
      <div class="cf">
        ${e.days.map((i) => x`<div class="cfrow"><strong>${n[i]}</strong>
          ${s(A(t, "cf_before"), a[i] ?? [])}
          ${s(A(t, "cf_after"), e.skip.includes(i) ? a[i] ?? [] : Mr(a, {
			day: this.weekday,
			id: e.id
		}, [i], o)[i] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${n[i]}>
            <button role="radio" aria-checked=${!e.skip.includes(i)} class=${e.skip.includes(i) ? "" : "on"} @click=${() => r(i, !1)}>${A(t, "replace")}</button>
            <button role="radio" aria-checked=${e.skip.includes(i)} class=${e.skip.includes(i) ? "on" : ""} @click=${() => r(i, !0)}>${A(t, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${A(t, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${i} @click=${() => void this._doCopy(e.id, e.to, e.skip)}>${A(t, "copy_go")}</button>
    </wp-dialog>`;
	}
	render() {
		return !this.hass || !this.data || !this.program ? C : x`
      <div class="zone ${this.editing ? "editing" : ""}" tabindex=${at(this.editing ? void 0 : 0)}
        role=${at(this.editing ? void 0 : "button")} aria-label=${at(this.editing ? void 0 : A(this.lang, "edit_bar"))}
        @keydown=${this._zoneKey}
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(e) => {
			this._press && !this._press.mouse && e.preventDefault();
		}}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${A(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : C}</wp-day-bar>
        <div class="hint" role="status">${this._hint ? A(this.lang, "hold_hint") : C}</div>
      </div>
      ${this.editing ? this._strip() : C}
      ${this._error ? x`<p class="err" role="alert">${this._error}</p>` : C}
      ${this._conflictDialog()}`;
	}
	static {
		this.styles = [U, o`
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
	}
};
O([E({ attribute: !1 })], q.prototype, "hass", void 0), O([E({ attribute: !1 })], q.prototype, "data", void 0), O([E({ attribute: !1 })], q.prototype, "program", void 0), O([E({ attribute: "entity-id" })], q.prototype, "entityId", void 0), O([E({ type: Number })], q.prototype, "weekday", void 0), O([E({ attribute: !1 })], q.prototype, "spans", void 0), O([E({ attribute: !1 })], q.prototype, "preview", void 0), O([E({ type: Number })], q.prototype, "now", void 0), O([E({ type: Boolean })], q.prototype, "editing", void 0), O([E({ type: Boolean })], q.prototype, "editable", void 0), O([E({ type: Boolean })], q.prototype, "hours", void 0), O([E()], q.prototype, "lang", void 0), O([E()], q.prototype, "tz", void 0), O([D()], q.prototype, "_draft", void 0), O([D()], q.prototype, "_selected", void 0), O([D()], q.prototype, "_hsel", void 0), O([D()], q.prototype, "_bubble", void 0), O([D()], q.prototype, "_copyOpen", void 0), O([D()], q.prototype, "_copyDays", void 0), O([D()], q.prototype, "_conflict", void 0), O([D()], q.prototype, "_error", void 0), O([D()], q.prototype, "_hover", void 0), O([D()], q.prototype, "_hint", void 0), q = O([T("wp-bar-editor")], q);
// src/radial.ts
var Gr = 1440, Kr = Gr / 2;
function qr(e, t = !1) {
	let n = t ? Kr : Gr, r = [];
	for (let i of e) {
		if (i.ignored || !Number.isFinite(i.start) || !Number.isFinite(i.end)) continue;
		if (i.marker) {
			if (i.start < 0 || i.start >= Gr) continue;
			let e = t && i.start >= Kr ? 1 : 0;
			r.push({
				source: i,
				start: i.start,
				end: i.start,
				offset: (i.start - e * n) / n,
				fraction: 0,
				ring: e
			});
			continue;
		}
		let e = Math.max(0, i.start), a = Math.min(Gr, i.end);
		if (a <= e) continue;
		let o = t ? [0, 1] : [0];
		for (let t of o) {
			let o = t * n, s = Math.max(e, o), c = Math.min(a, o + n);
			c <= s || r.push({
				source: i,
				start: s,
				end: c,
				offset: (s - o) / n,
				fraction: (c - s) / n,
				ring: t
			});
		}
	}
	return r;
}
// src/components/radial-day.ts
var Jr = "var(--divider-color, rgba(127, 127, 127, 0.2))", Yr = (e, t) => {
	let n = e * Math.PI * 2 - Math.PI / 2;
	return {
		x: 160 + t * Math.cos(n),
		y: 160 + t * Math.sin(n)
	};
}, Xr = class extends w {
	constructor(...e) {
		super(...e), this.spans = [], this.now = null, this.double = !1, this.lang = "en", this.rest = "";
	}
	_open() {
		this.dispatchEvent(new CustomEvent("open-day", {
			bubbles: !0,
			composed: !0
		}));
	}
	_icon(e, t, n, r) {
		let i = Yr(e, t);
		return x`<wp-tip text=${r} style=${`left:${i.x / 3.2}%;top:${i.y / 3.2}%`}>
      <span class="icon"><ha-icon icon=${n}></ha-icon></span></wp-tip>`;
	}
	render() {
		let e = qr(this.spans, this.double), t = [...new Set(e.map((e) => e.source))], n = this.double ? 720 : 1440, r = this.double ? 24 : 36, i = (e) => this.double && e === 0 ? 78 : 112, a = this.now !== null && Number.isFinite(this.now) && this.now >= 0 && this.now < 1440 ? this.now : null, o = this.double && a !== null && a >= 720 ? 1 : 0, s = a === null ? 0 : (a - o * n) / n;
		return x`<div class="dial"><button @click=${this._open} aria-label=${A(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        ${(this.double ? [0, 1] : [0]).map((e) => S`<circle class="track" cx="160" cy="160" r=${i(e)} fill="none" stroke=${Jr} stroke-width=${r} />`)}
        ${e.map((e) => {
			if (e.source.marker) {
				let t = Yr(e.offset, i(e.ring));
				return S`<circle cx=${t.x} cy=${t.y} r="7" fill=${e.source.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
			}
			return S`<circle cx="160" cy="160" r=${i(e.ring)} fill="none" stroke=${e.source.color} stroke-width=${r}
            pathLength="100" stroke-dasharray="${e.fraction * 100} ${100 - e.fraction * 100}" stroke-dashoffset=${-e.offset * 100} transform="rotate(-90 160 160)" />`;
		})}
        ${(this.double ? [0, 1] : [0]).map((e) => Array.from({ length: n / 60 }, (t, a) => {
			let o = a % (this.double ? 3 : 6) == 0, s = Yr(a * 60 / n, i(e) + r / 2), c = Yr(a * 60 / n, i(e) + r / 2 - (o ? r : 6));
			return S`<line class="tick" x1=${s.x} y1=${s.y} x2=${c.x} y2=${c.y} stroke="var(--primary-text-color)" stroke-opacity=".35" stroke-width="1" />`;
		}))}
        ${(this.double ? [0, 1] : [0]).map((e) => (this.double ? e === 0 ? [
			12,
			3,
			6,
			9
		] : [
			24,
			15,
			18,
			21
		] : [
			0,
			6,
			12,
			18
		]).map((t, n) => {
			let r = Yr(n / 4, this.double && e === 0 ? 53 : 145);
			return S`<text class="hour" x=${r.x} y=${r.y + 5} text-anchor="middle">${this.double ? t : String(t).padStart(2, "0")}</text>`;
		}))}
        ${a === null ? C : (() => {
			let e = Yr(s, i(o) - r / 2 - 4), t = Yr(s, i(o) + r / 2 + 4);
			return S`<line x1=${e.x} y1=${e.y} x2=${t.x} y2=${t.y} stroke="var(--primary-text-color)" stroke-width="3" />`;
		})()}
        <text x="160" y="156" text-anchor="middle">${a === null ? "24 h" : F(this.lang, a)}</text>
        <text x="160" y="180" text-anchor="middle">${A(this.lang, "hours")}</text>
      </svg></button>
      ${e.flatMap((e) => {
			let t = [];
			return e.start === e.source.start && e.source.startSun && t.push(this._icon(e.offset, i(e.ring), e.source.startSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", xt(this.lang, e.source.startSpec, e.start))), !e.source.marker && e.end === e.source.end && e.end < 1440 && e.source.endSun && t.push(this._icon(e.offset + e.fraction, i(e.ring), e.source.endSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", xt(this.lang, e.source.endSpec, e.end))), t;
		})}
      ${a === null ? C : this._icon(s, i(o) - r / 2 - 12, "mdi:clock-outline", St(this.lang, a))}
      </div>
      ${this.double ? x`<div class="rings">${A(this.lang, "radial_rings")}</div>` : C}
      <div class="legend">
        ${this.rest ? x`<span><i style=${`background:${Jr}`}></i>${A(this.lang, "rest_of_time")}: ${this.rest}</span>` : C}
        ${t.map((e) => x`<span><i style=${`background:${e.color}`}></i>${F(this.lang, e.start)}${e.marker ? "" : `–${F(this.lang, e.end)}`} · ${e.label}</span>`)}
      </div>`;
	}
	static {
		this.styles = o`
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
	}
};
O([E({ attribute: !1 })], Xr.prototype, "spans", void 0), O([E({ type: Number })], Xr.prototype, "now", void 0), O([E({ type: Boolean })], Xr.prototype, "double", void 0), O([E()], Xr.prototype, "lang", void 0), O([E()], Xr.prototype, "rest", void 0), Xr = O([T("wp-radial-day")], Xr);
// src/sorted-times.ts
function Zr(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + Math.floor((r - n) / 2);
		e[i] <= t ? n = i + 1 : r = i;
	}
	return n;
}
function Qr(e, t, n) {
	let r = Zr(e, t + n);
	return r > 0 && e[r - 1] >= t - n;
}
// src/chart-refresh.ts
var $r = /* @__PURE__ */ new Set(), ei, ti = () => {
	document.hidden || $r.forEach((e) => e());
};
function ni(e) {
	return $r.add(e), ei === void 0 && (ei = setInterval(ti, 6e4), document.addEventListener("visibilitychange", ti)), () => {
		$r.delete(e), $r.size || (clearInterval(ei), ei = void 0, document.removeEventListener("visibilitychange", ti));
	};
}
// src/planned.ts
var ri = .5;
function ii(e, t, n) {
	let r = e.filter((e) => e.end !== null).map((e) => ({
		...e,
		end: Math.min(e.end, n),
		start: Math.max(0, e.start)
	})).filter((e) => e.end > e.start).sort((e, t) => e.start - t.start);
	r.forEach((e, t) => {
		let n = r[t + 1];
		n && e.end > n.start && (e.end = n.start);
	});
	let i = [], a = [], o = (e, n) => {
		t?.active && n - e > ri && i.push({
			from: e,
			to: n,
			value: t.value,
			color: t.color
		});
	}, s = 0;
	r.forEach((e, c) => {
		o(s, e.start), i.push({
			from: e.start,
			to: e.end,
			value: e.value,
			color: e.color
		});
		let l = r[c + 1];
		e.end < n - ri && (!l || l.start - e.end > ri) && t?.active && a.push(e.end), s = e.end;
	}), o(s, n);
	let c = i.flatMap((e) => e.value === null ? [] : [{
		from: e.from,
		to: e.to,
		value: e.value,
		color: e.color
	}]), l = [];
	for (let e = 1; e < c.length; e++) {
		let t = c[e - 1], n = c[e];
		Math.abs(t.to - n.from) <= ri && Math.abs(t.value - n.value) > 1e-9 && l.push({
			m: n.from,
			from: t.value,
			to: n.value,
			color: n.color
		});
	}
	return {
		zones: i,
		steps: c,
		risers: l,
		returns: a
	};
}
var ai = /* @__PURE__ */ new Set([
	"off",
	"idle",
	"unavailable",
	"unknown",
	"docked",
	""
]), oi = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function si(e, t, n) {
	if (t === "unavailable" || t === "unknown") return !1;
	switch (e) {
		case "climate": {
			let e = n.hvac_action;
			if (typeof e == "string" && e !== "") return e !== "idle" && e !== "off";
			if (t === "off") return !1;
			let r = oi(n.temperature), i = oi(n.current_temperature);
			return r === null || i === null ? !1 : t === "cool" ? i - r > .3 : r - i > .3;
		}
		case "light":
		case "switch":
		case "fan":
		case "input_boolean": return t === "on";
		case "cover": return t === "open" || t === "opening" || t === "closing";
		case "vacuum": return t === "cleaning" || t === "returning";
		case "media_player": return t === "playing";
		default: return !ai.has(t);
	}
}
function ci(e, t, n) {
	let r = [...e].sort((e, t) => e.m - t.m), i = [];
	return r.forEach((e, a) => {
		let o = Math.max(0, e.m), s = Math.min(n, a + 1 < r.length ? r[a + 1].m : n);
		if (s - o <= 0 || !si(t, e.state, e.attrs)) return;
		let c = i[i.length - 1];
		c && Math.abs(c[1] - o) < .01 ? c[1] = s : i.push([o, s]);
	}), i;
}
function li(e, t) {
	let n = [];
	for (let [r, i] of e) {
		let e = Math.max(0, r), a = Math.min(i, t);
		a - e > .01 && n.push({
			from: e,
			to: a
		});
	}
	return n.sort((e, t) => e.from - t.from);
}
// src/components/chart.ts
function ui(e, t) {
	let n = pt("en-GB", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23"
	}).formatToParts(new Date(e)), r = (e) => Number(n.find((t) => t.type === e)?.value ?? 0);
	return Date.UTC(r("year"), r("month") - 1, r("day"), r("hour"), r("minute"), r("second")) - Math.floor(e / 1e3) * 1e3;
}
function di(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = Date.UTC(n, r - 1, i);
	return a - ui(a - ui(a, t), t);
}
function fi(e, t) {
	return {
		startMs: di(e, t),
		endMs: di(mt(e, 1), t)
	};
}
function pi(e) {
	let [t, n, r] = e.split("-").map(Number);
	return gt(new Date(Date.UTC(t, n - 1, r, 12)), "UTC");
}
var mi = 6e4, hi = /* @__PURE__ */ new WeakMap();
function gi(e, t, n, r) {
	let i = hi.get(e);
	i || (i = /* @__PURE__ */ new Map(), hi.set(e, i));
	let a = i, o = i.get(t);
	if (o && Date.now() - o.at < n) return i.delete(t), i.set(t, o), o.p;
	let s = r();
	for (i.set(t, {
		at: Date.now(),
		p: s
	}); i.size > 64;) i.delete(i.keys().next().value);
	return s.catch(() => {
		a.get(t)?.p === s && a.delete(t);
	}), s;
}
function _i(e) {
	if (!Array.isArray(e)) return [];
	let t = [], n = {};
	for (let r of e) {
		r.a && (n = r.a);
		let e = r.lu ?? r.lc ?? r.last_updated_ts, i = typeof e == "number" ? e * 1e3 : Date.parse(r.last_updated ?? "");
		Number.isNaN(i) || t.push({
			t: i,
			s: String(r.s ?? r.state ?? ""),
			a: n
		});
	}
	return t;
}
function vi(e) {
	return Array.isArray(e) ? e.map((e) => {
		let t = Number(e.when);
		return {
			t: t > 0xe8d4a51000 ? t : t * 1e3,
			state: String(e.state ?? ""),
			user: !!e.context_user_id,
			context: !!(e.context_event_type || e.context_domain || e.context_service || e.context_entity_id || e.context_message)
		};
	}).filter((e) => !Number.isNaN(e.t)) : [];
}
function yi(e, t) {
	let n = Math.floor((t - 8) / 6);
	return n < 4 ? "" : e.length <= n ? e : `${e.slice(0, n - 1)}…`;
}
var bi = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", xi = (e) => e === "unavailable" || e === "unknown" || e === "", Si = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Ci = /* @__PURE__ */ new Set([
	"on",
	"open",
	"heat",
	"home",
	"playing",
	"cleaning",
	"unlocked",
	"armed_home",
	"armed_away"
]), J = class extends w {
	constructor(...e) {
		super(...e), this.entityId = "", this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._failed = !1, this._model = null, this._token = 0, this._refresh = () => {
			if (document.hidden || !this.hass || !this.date) return;
			let { startMs: e, endMs: t } = fi(this.date, this._tz);
			e <= Date.now() && Date.now() < t && this._load();
		};
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "en";
	}
	get _tz() {
		return this.hass.config.time_zone;
	}
	connectedCallback() {
		super.connectedCallback(), this._stopRefresh = ni(this._refresh), this._observer = new ResizeObserver((e) => {
			let t = Math.floor(e[0].contentRect.width);
			t > 120 && t !== this._width && (this._width = t);
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._observer?.disconnect(), this._stopRefresh?.(), this._stopRefresh = void 0, this._token++;
	}
	firstUpdated() {
		let e = this.renderRoot.querySelector(".box");
		e && this._observer?.observe(e);
	}
	willUpdate(e) {
		(e.has("entityId") || e.has("date")) && this._load(), (e.has("slots") || e.has("data") || e.has("program") || e.has("entityId") || e.has("date") || e.has("_loaded")) && (this._model = this._loaded ? this._build(this._loaded) : null);
	}
	async _load() {
		if (!this.hass || !this.entityId || !this.date) return;
		let e = `${this.entityId}|${this.date}`, t = ++this._token;
		this._loaded = null, this._failed = !1;
		let { startMs: n, endMs: r } = fi(this.date, this._tz), i = Date.now(), a = r > i ? 6e4 : Infinity, o = n < i, s = new Date(Math.min(r, i)).toISOString();
		try {
			let r = o ? gi(this.hass.connection ?? this.hass, `h|${e}`, a, () => this.hass.callWS({
				type: "history/history_during_period",
				start_time: new Date(n).toISOString(),
				end_time: s,
				entity_ids: [this.entityId],
				minimal_response: !1,
				no_attributes: !1,
				significant_changes_only: !1
			})) : Promise.resolve({}), c = o ? gi(this.hass.connection ?? this.hass, `l|${e}`, a, () => this.hass.callWS({
				type: "logbook/get_events",
				start_time: new Date(n).toISOString(),
				end_time: s,
				entity_ids: [this.entityId]
			})).catch(() => []) : Promise.resolve([]), l = Math.min(14, Math.max(1, Math.ceil((i - n) / 864e5) + 1)), u = o ? gi(this.hass.connection ?? this.hass, `j|${this.entityId}|${l}`, 6e4, () => this.hass.callWS({
				type: "weekly_planner/journal",
				entity_id: this.entityId,
				days: l
			})).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [d, f, p] = await Promise.all([
				r,
				c,
				u
			]);
			if (t !== this._token) return;
			this._loaded = {
				hist: _i(d[this.entityId]),
				log: vi(f),
				sent: (p.segments ?? []).filter((e) => e.entity_id === this.entityId).map((e) => Date.parse(e.at))
			};
		} catch {
			t === this._token && (this._failed = !0, this._loaded = {
				hist: [],
				log: [],
				sent: []
			});
		}
	}
	_live(e) {
		let t = {
			measured: null,
			set: null,
			main: null
		};
		if (xi(e.s)) return t;
		switch (Ht(this.entityId)) {
			case "climate": return {
				measured: Si(e.a.current_temperature),
				set: e.s === "off" ? null : Si(e.a.temperature),
				main: null
			};
			case "cover": return {
				...t,
				main: Si(e.a.current_position) ?? (e.s === "open" ? 100 : e.s === "closed" ? 0 : null)
			};
			case "light": {
				let n = e.s === "on" ? Si(e.a.brightness) : 0;
				return {
					...t,
					main: n === null ? e.s === "on" ? 100 : 0 : n / 255 * 100
				};
			}
			default: {
				let n = Number(e.s);
				return {
					...t,
					measured: Number.isFinite(n) ? n : null
				};
			}
		}
	}
	_numeric(e) {
		let t = Ht(this.entityId);
		if ([
			"climate",
			"cover",
			"light"
		].includes(t)) return !0;
		let n = e.filter((e) => !xi(e.s));
		return n.length > 0 && n.every((e) => Number.isFinite(Number(e.s)));
	}
	_build(e) {
		let t = this._tz, { startMs: n, endMs: r } = fi(this.date, t), i = Math.round((r - n) / 6e4), a = Date.now(), o = Math.max(0, Math.min(i, (a - n) / 6e4)), s = (e) => (e - n) / 6e4, c = Ht(this.entityId), l = R(this.program, this.data), u = /* @__PURE__ */ new Map();
		for (let e of this.program.profiles) for (let t of e.days.flat()) u.set(t.id, t);
		let d = pi(this.date), f = [];
		if (!this.slots) for (let { slot: e, end: t } of vt(l.days[(d + 6) % 7])) !e.start.random_minutes && !e.end?.random_minutes && f.push({
			s: 0,
			e: t,
			slot: e,
			spill: !0
		});
		if (this.slots) for (let e of this.slots) {
			let t = u.get(e.slot_id);
			if (!t) continue;
			let n = s(Date.parse(e.start)), r = e.end ? s(Date.parse(e.end)) : null;
			n >= i || (r === null ? n < 0 : r <= 0) || f.push({
				s: Math.max(0, n),
				e: r === null ? null : Math.min(i, r),
				slot: t,
				spill: n < 0,
				ignored: !!e.ignored
			});
		}
		else for (let e of l.days[d]) {
			if (e.start.random_minutes || e.end?.random_minutes) continue;
			let t = _t(e.start);
			if (t === null) continue;
			let n = _t(e.end ?? null);
			f.push({
				s: t,
				e: n === null ? null : n > t ? n : i,
				slot: e
			});
		}
		let p = this.program.entities.find((e) => e.entity_id === this.entityId), m = V(this.data, p?.default_label), h = [], ee = (e, t, n, r = {}) => {
			if (!t || e < 0 || e > i) return;
			let a = bn(this.program, this.entityId, t);
			a && h.push({
				m: e,
				label: t,
				value: Cn(a),
				end: n,
				...r
			});
		};
		for (let e of f) e.spill || ee(e.s, V(this.data, e.slot.label), !1, {
			sun: bt(e.slot.start),
			spec: e.slot.start,
			ignored: e.ignored
		});
		let te = (e) => Cn(bn(this.program, this.entityId, e)), ne = ii(f.filter((e) => !e.ignored).flatMap((e) => {
			let t = V(this.data, e.slot.label);
			return t && bn(this.program, this.entityId, t) ? [{
				start: e.s,
				end: e.e,
				color: t.color,
				value: te(t)
			}] : [];
		}), m ? {
			color: m.color,
			value: te(m),
			active: !!bn(this.program, this.entityId, m)
		} : null, i);
		for (let e of ne.returns) ee(e, m, !0);
		let re = li(ci(e.hist.map((e) => ({
			m: s(e.t),
			state: e.s,
			attrs: e.a
		})), c, o), o);
		h.sort((e, t) => e.m - t.m);
		let g = this._numeric(e.hist), ie = [], ae = [];
		if (g) {
			let t = {
				measured: [],
				set: [],
				main: []
			};
			for (let n of e.hist) {
				let e = Math.max(0, s(n.t)), r = this._live(n);
				t.measured.push({
					m: e,
					v: r.measured
				}), t.set.push({
					m: e,
					v: r.set
				}), t.main.push({
					m: e,
					v: r.main
				});
			}
			for (let e of [
				"measured",
				"set",
				"main"
			]) t[e].some((e) => e.v !== null) && ie.push({
				key: e,
				pts: t[e]
			});
		} else e.hist.forEach((t, n) => {
			let r = Math.max(0, s(t.t)), i = n + 1 < e.hist.length ? s(e.hist[n + 1].t) : o;
			if (i <= r || xi(t.s)) return;
			let a = ae[ae.length - 1];
			if (a && a.state === t.s && Math.abs(a.e - r) < .5) {
				a.e = i;
				return;
			}
			let c = this.hass.states[this.entityId];
			ae.push({
				s: r,
				e: i,
				state: t.s,
				on: Ci.has(t.s),
				text: c ? this.hass.formatEntityState?.({
					...c,
					state: t.s,
					attributes: t.a
				}, t.s) ?? t.s : t.s
			});
		});
		let oe = [...e.sent].sort((e, t) => e - t), se = e.log.filter((e) => e.context && !e.user).map((e) => e.t).sort((e, t) => e - t), ce = (e) => Qr(oe, e, mi), _ = [], le = e.hist[0]?.s;
		for (let t of e.log) {
			if (xi(t.state)) continue;
			let e = t.state === le;
			le = t.state, (t.user || !t.context && !e && !ce(t.t)) && _.push(s(t.t));
		}
		let ue = c === "climate" ? "set" : c === "light" ? "main" : null, v = ie.find((e) => e.key === ue), de = [];
		if (v) {
			let e = null;
			for (let t of v.pts) {
				if (t.v !== null && e !== null && Math.abs(t.v - e) > .01) {
					let e = n + t.m * 6e4;
					de.push(t.m);
					let r = Qr(se, e, mi);
					ce(e) || r || _.some((e) => Math.abs(e - t.m) <= 1) || _.push(t.m);
				}
				t.v !== null && (e = t.v);
			}
		}
		_.sort((e, t) => e - t);
		let fe = [
			...h.map((e) => e.m),
			...e.sent.map(s),
			...de,
			...ae.map((e) => e.s),
			..._
		].sort((e, t) => e - t), y = [];
		for (let e of _) {
			if (e <= 1 || e > o) continue;
			let t = fe[Zr(fe, e + .5)], n = Math.min(t ?? o, o);
			n > e ? y.push([e, n]) : y.push([e, Math.min(e + 5, i)]);
		}
		let b = 0, pe = 100;
		if (g && c !== "cover" && c !== "light") {
			let e = [
				...ie.flatMap((e) => e.pts.map((e) => e.v)),
				...h.map((e) => e.value),
				...ne.steps.map((e) => e.value)
			].filter((e) => e !== null);
			e.length && (b = Math.floor(e.reduce((e, t) => Math.min(e, t), Infinity) - 1), pe = Math.ceil(e.reduce((e, t) => Math.max(e, t), -Infinity) + 1), pe - b < 2 && (pe = b + 2));
		}
		let me = String(this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? (c === "climate" ? this.hass.config?.unit_system?.temperature ?? "°C" : c === "cover" || c === "light" ? "%" : ""));
		return {
			span: i,
			pastEnd: o,
			isToday: n <= a && a < r,
			kind: g ? "curve" : "band",
			lines: ie,
			bands: ae,
			markers: h,
			planned: ne,
			shade: re,
			manual: y,
			lo: b,
			hi: pe,
			unit: me
		};
	}
	get _historyPath() {
		let { startMs: e, endMs: t } = fi(this.date, this._tz);
		return `/history?${new URLSearchParams({
			entity_id: this.entityId,
			start_date: new Date(e).toISOString(),
			end_date: new Date(t).toISOString()
		}).toString()}`;
	}
	_open() {
		this.dispatchEvent(new CustomEvent("open-history", {
			detail: this._historyPath,
			bubbles: !0,
			composed: !0
		}));
	}
	_path(e, t, n, r, i, a) {
		let o = "", s = !1;
		return e.forEach((c, l) => {
			let u = l + 1 < e.length ? e[l + 1].m : t.pastEnd, d = c.m, f = u;
			if (a && (d = Math.max(d, a[0]), f = Math.min(f, a[1]), f < d) || c.v === null) {
				s = !1;
				return;
			}
			let p = r(c.v);
			i ? o += s ? `V${p.toFixed(1)}H${n(f).toFixed(1)}` : `M${n(d).toFixed(1)},${p.toFixed(1)}H${n(f).toFixed(1)}` : (o += `${s ? "L" : "M"}${n(d).toFixed(1)},${p.toFixed(1)}`, (l + 1 === e.length || a && f < u) && (o += `L${n(f).toFixed(1)},${p.toFixed(1)}`)), s = !0;
		}), o;
	}
	render() {
		if (!this.hass || !this.data) return C;
		let e = this._lang, t = this._model, n;
		return n = t ? this._renderChart(t) : x`<div class="note">${A(e, "chart_loading")}</div>`, x`<div class="box">${n}</div>${t ? x`${this._legend(t)}
      <div class="availability" role="status">
        ${this._failed ? x`<p>${A(e, "chart_history_failed")}</p>` : !t.lines.length && !t.bands.length ? x`<p>${A(e, t.pastEnd === 0 ? "chart_future_history" : "chart_no_history")}</p>` : C}
        ${!t.markers.some((e) => !e.ignored) && !t.planned.zones.length ? x`<p>${A(e, "chart_no_planned")}</p>` : C}
      </div>` : C}`;
	}
	get _shownName() {
		return this.program?.entities.length === 1 ? this.program.name : z(this.hass, this.entityId);
	}
	_legend(e) {
		let t = this._lang, n = (e, t, n) => x`<span class="key"><i class=${e} style=${n ? `--k:${n}` : ""}></i>${t}</span>`, r = (t) => e.lines.some((e) => e.key === t);
		return x`<div class="legend">
      ${e.markers.length || e.planned.steps.length ? n("planned", A(t, "planned")) : C}
      ${r("measured") ? n("measured", A(t, "measured")) : C}
      ${r("set") ? n("set", A(t, "ch_set")) : C}
      ${e.shade.length ? n("active", A(t, "active_key")) : C}
      ${e.manual.length ? n("manual", A(t, "manual")) : C}
    </div>`;
	}
	_renderChart(e) {
		let t = this._lang, n = this._width, r = e.kind === "curve", i = r ? 150 : 84, a = {
			l: r ? 38 : 8,
			r: 10,
			t: 22,
			b: 22
		}, o = (t) => a.l + t / e.span * (n - a.l - a.r), s = (t) => a.t + (1 - (t - e.lo) / (e.hi - e.lo)) * (i - a.t - a.b), { startMs: c } = fi(this.date, this._tz), l = (e) => pt("en-GB", {
			timeZone: this._tz,
			hour: "2-digit",
			hourCycle: "h23"
		}).format(new Date(c + e * 6e4)), u = [];
		for (let t = 0; t <= e.span; t += 180) u.push(t);
		let d = [];
		if (r) {
			let t = e.hi - e.lo, n = [
				1,
				2,
				5,
				10,
				20,
				25,
				50
			].find((e) => t / e <= 4) ?? 100;
			for (let t = Math.ceil(e.lo / n) * n; t <= e.hi + 1e-9; t += n) d.push(t);
		}
		let f = a.t - 12, p = a.t, m = i - a.t - a.b, h = e.shade.map((e) => {
			let t = Math.max(3, o(e.to) - o(e.from));
			return S`<rect class="shade" x=${o(e.from)} y=${p} width=${t} height=${m}></rect>
        <rect class="shade-edge" x=${o(e.from)} y=${p + m - 3} width=${t} height=${3}></rect>`;
		}), ee = (e) => r && e.value !== null ? s(e.value) : f, te = [], ne = (e, t) => {
			let r = Math.min(Math.max(o(e.m), 14), n - 14), i = Math.max(t - 8, 9);
			return te.some((e) => Math.abs(e.x - r) < 26 && Math.abs(e.y - i) < 12) ? null : (te.push({
				x: r,
				y: i
			}), {
				lx: r,
				ly: i
			});
		}, re = (e) => {
			let t = ee(e), n = e.value === null ? null : ne(e, t), r = e.label.color;
			return S`
        <line class="drop" x1=${o(e.m)} x2=${o(e.m)} y1=${t} y2=${i - a.b}></line>
        ${e.sun ? C : S`<circle class="mk ${e.end ? "end" : ""} ${e.ignored ? "faded" : ""}" cx=${o(e.m)} cy=${t} r="5" style="--c:${r}"></circle>`}
        ${e.value !== null && n ? S`<text class="val" x=${n.lx} y=${n.ly} text-anchor="middle">${Number(e.value.toFixed(1))}</text>` : C}`;
		}, g = r ? e.lines.find((e) => e.key === "set") ?? e.lines.find((e) => e.key === "main") ?? e.lines[0] : void 0, ie = e.isToday ? S`<line class="now" x1=${o(e.pastEnd)} x2=${o(e.pastEnd)} y1=${a.t - 4} y2=${i - a.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${o(e.pastEnd) - 6}, ${a.t - 17}) scale(0.5)"><path d=${bi}></path></g>` : C;
		return x`<div class="cwrap">
      <svg width=${n} height=${i} viewBox="0 0 ${n} ${i}" tabindex="0" role="button"
        aria-label=${A(t, "chart_open", { name: this._shownName })}
        @click=${() => this._open()}
        @keydown=${(e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._open());
		}}>
        ${r ? h : C}
        ${d.map((e) => S`<line class="grid" x1=${a.l} x2=${n - a.r} y1=${s(e)} y2=${s(e)}></line>
          <text class="ylab" x=${a.l - 4} y=${s(e) + 3} text-anchor="end">${Number(e.toFixed(1))}</text>`)}
        ${r && e.unit ? S`<text class="unit" x="2" y="10">${e.unit}</text>` : C}
        ${u.map((e) => S`<text class="xlab" x=${o(e)} y=${i - 6} text-anchor=${e === 0 ? "start" : "middle"}>${Number(l(e))}h</text>`)}
        ${r ? C : S`
          <rect class="track" x=${a.l} y=${p} width=${n - a.l - a.r} height=${m} rx="6"></rect>
          ${e.bands.map((e) => S`<rect class="band ${e.on ? "on" : ""}" x=${o(e.s)} y=${p} width=${Math.max(1, o(e.e) - o(e.s))} height=${m}></rect>`)}
          ${h}
          ${e.bands.map((e) => {
			let t = o(e.e) - o(e.s);
			return yi(e.text, t) ? S`<text class="btxt" x=${o(e.s) + t / 2} y=${p + m / 2 + 4} text-anchor="middle">${yi(e.text, t)}</text>` : C;
		})}
          ${e.manual.map(([e, t]) => S`<rect class="red-band" x=${o(e)} y=${p} width=${Math.max(3, o(t) - o(e))} height=${m}></rect>`)}`}
        ${r ? e.lines.map((t) => S`<path class="line ${t.key}" d=${this._path(t.pts, e, o, s, t.key !== "measured")}></path>`) : C}
        ${r ? e.manual.map((t) => {
			let n = g?.pts.find((e, n) => e.v !== null && (g.pts[n + 1]?.m ?? Infinity) > t[0])?.v ?? null;
			return S`${g ? S`<path class="line red" d=${this._path(g.pts, e, o, s, g.key !== "measured", t)}></path>` : C}
            ${n === null ? C : S`<circle class="reddot" cx=${o(t[0])} cy=${s(n)} r="3.5"></circle>`}`;
		}) : C}
        ${r ? e.planned.steps.map((e) => S`<path class="plan" d="M${o(e.from).toFixed(1)},${s(e.value).toFixed(1)}H${o(e.to).toFixed(1)}" style="--c:${e.color}"></path>`) : C}
        ${r ? e.planned.risers.map((e) => S`<line class="riser" x1=${o(e.m)} x2=${o(e.m)} y1=${s(e.from)} y2=${s(e.to)} style="--c:${e.color}"></line>`) : C}
        ${[...e.markers].sort((e, t) => e.m - t.m).map(re)}
        ${ie}
        <rect class="hit" x="0" y="0" width=${n} height=${i}></rect>
      </svg>
      ${e.markers.filter((e) => e.sun).map((e) => x`<wp-tip class="suntip ${e.ignored ? "faded" : ""}"
        style="left:${o(e.m)}px;top:${ee(e)}px;--c:${e.label.color}" text=${xt(t, e.spec, e.m)}>
        <span class="sunc"><ha-icon icon=${e.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${e.isToday ? x`<wp-tip class="nowtip" style="left:${o(e.pastEnd)}px;top:${a.t - 11}px"
        text=${St(t, N(/* @__PURE__ */ new Date(), this._tz))}></wp-tip>` : C}
    </div>`;
	}
	static {
		this.styles = o`
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
	}
};
O([E({ attribute: !1 })], J.prototype, "hass", void 0), O([E({ attribute: !1 })], J.prototype, "data", void 0), O([E({ attribute: !1 })], J.prototype, "program", void 0), O([E({ attribute: "entity-id" })], J.prototype, "entityId", void 0), O([E()], J.prototype, "date", void 0), O([E({ attribute: !1 })], J.prototype, "slots", void 0), O([D()], J.prototype, "_width", void 0), O([D()], J.prototype, "_loaded", void 0), O([D()], J.prototype, "_failed", void 0), J = O([T("wp-chart")], J);
// src/components/slot-form.ts
var wi = ["sunrise", "sunset"], Ti = {
	dawn: "next_dawn",
	sunrise: "next_rising",
	sunset: "next_setting",
	dusk: "next_dusk"
};
function Ei(e) {
	let t = Math.abs(e);
	return t < 60 ? `${t} min` : `${Math.floor(t / 60)}h${t % 60 ? String(t % 60).padStart(2, "0") : ""}`;
}
function Di(e, t, n) {
	return A(e, n && (t.sun === "sunrise" || t.sun === "sunset") ? `sun_${t.sun}` : t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`).toLowerCase();
}
function Oi(e, t) {
	return t.earliest && t.latest ? A(e, "sun_limits_both", {
		a: t.earliest,
		b: t.latest
	}) : t.earliest ? A(e, "sun_limits_earliest", { a: t.earliest }) : t.latest ? A(e, "sun_limits_latest", { b: t.latest }) : "";
}
function ki(e, t) {
	if (!e || !("sun" in t)) return null;
	let n = e.states?.["sun.sun"]?.attributes?.[Ti[t.sun]], r = e.config?.time_zone;
	if (!n || !r || Number.isNaN(new Date(n).getTime()) || P(new Date(n), r) !== P(/* @__PURE__ */ new Date(), r)) return null;
	let i = N(n, r) + (t.offset ?? 0);
	return t.earliest && (i = Math.max(i, M(t.earliest))), t.latest && (i = Math.min(i, M(t.latest))), Math.max(0, Math.min(j, i));
}
function Ai(e, t) {
	if (!("sun" in t) || !t.offset && !t.earliest && !t.latest) return "";
	let n = t.offset ? ` ${t.offset > 0 ? "+" : "−"} ${Ei(t.offset)}` : "";
	return A(e, "sun_real", {
		base: `${Di(e, t, !0)}${n}`,
		limits: Oi(e, t)
	});
}
function ji(e, t) {
	let n = t % j, r = `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
	return t >= 1440 ? `${r} (${A(e, "next_day")})` : r;
}
function Mi(e, t, n) {
	let r = ki(t, n);
	return r === null ? "" : A(e, "sun_today", { time: ji(e, r) });
}
function Ni(e, t, n = "start", r) {
	let i = t.random_minutes ?? 0, a = n === "end" ? "random_range_end" : "random_range_start";
	if ("time" in t) {
		let n = M(t.time);
		return `${A(e, a, {
			start: ji(e, n),
			end: ji(e, n + i)
		})}.`;
	}
	let o = ki(r, t);
	if (o !== null) {
		let n = t.latest ? Math.min(o + i, M(t.latest)) : o + i;
		return `${A(e, a, {
			start: ji(e, o),
			end: ji(e, Math.max(o, n))
		})}.`;
	}
	let s = t.offset ?? 0;
	return `${A(e, a, {
		start: `${Di(e, t, !1)}${s ? ` ${s > 0 ? "+" : "−"} ${Ei(s)}` : ""}`,
		end: A(e, "random_later", { n: Ei(i) })
	})}${Oi(e, t)}.`;
}
var Y = class extends w {
	constructor(...e) {
		super(...e), this.entityIds = [], this.disabled = !1, this.dayOnly = null, this._more = !1, this._last = {
			start: "08:00",
			end: "09:00"
		};
	}
	get _lang() {
		return kn(this.hass);
	}
	_set(e, t) {
		let n = {
			...this.group,
			slot: {
				...this.group.slot,
				...e
			},
			days: t ?? this.group.days
		};
		this.dispatchEvent(new CustomEvent("group-change", {
			detail: n,
			bubbles: !0,
			composed: !0
		}));
	}
	_update(e, t) {
		t && "time" in t && (this._last = {
			...this._last,
			[e]: t.time
		}), this._set({ [e]: t });
	}
	_toggleSun(e, t) {
		let n = this.group.slot[e];
		if (n) {
			if ("sun" in n && n.sun === t) this._update(e, {
				time: this._last[e],
				random_minutes: n.random_minutes
			});
			else {
				"time" in n && (this._last = {
					...this._last,
					[e]: n.time
				});
				let r = "sun" in n ? {
					offset: n.offset ?? 0,
					earliest: n.earliest,
					latest: n.latest
				} : { offset: 0 };
				this._update(e, this._clean({
					sun: t,
					...r,
					random_minutes: n.random_minutes
				}));
			}
		}
	}
	_fromInput(e, t) {
		if (!/^\d{2}:\d{2}$/.test(t)) return;
		let n = M(t);
		e === "end" && n === 0 && (n = j), this._update(e, {
			time: n >= 1440 ? "24:00" : t,
			random_minutes: this.group.slot[e]?.random_minutes
		});
	}
	_clean(e) {
		return Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0));
	}
	_limit(e, t, n) {
		let r = this.group.slot[e];
		if (!r || !("sun" in r) || n && !/^\d{2}:\d{2}$/.test(n)) return;
		let { [t]: i, ...a } = r;
		this._update(e, n ? {
			...a,
			[t]: n
		} : a);
	}
	_random(e, t) {
		let n = this.group.slot[e];
		if (!n || !Number.isInteger(t) || t < 0 || t > 240) return;
		let { random_minutes: r, ...i } = n;
		this._update(e, t ? {
			...i,
			random_minutes: t
		} : i);
	}
	_timeBlock(e, t) {
		let n = this.group.slot[e];
		if (!n) return C;
		let r = this._lang, i = k(r), a = this.disabled;
		return x`
      <div class="time" role="group" aria-label=${t}>
        <button class="step" ?disabled=${a} aria-label=${A(r, "minus15")} title=${A(r, "minus15")} @click=${() => this._update(e, zn(n, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in n ? x`<input type="time" step="60" .value=${n.time === "24:00" ? "00:00" : n.time} ?disabled=${a}
              aria-label=${t} @change=${(t) => this._fromInput(e, t.target.value)} />` : x`<output class="sun">${Rn(r, {
			...n,
			random_minutes: 0
		})}</output>`}
        <button class="step" ?disabled=${a} aria-label=${A(r, "plus15")} title=${A(r, "plus15")} @click=${() => this._update(e, zn(n, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${wi.map((t) => {
			let r = "sun" in n && n.sun === t;
			return x`<button class="chip ${r ? "on" : ""}" aria-pressed=${r} ?disabled=${a}
            @click=${() => this._toggleSun(e, t)}><ha-icon icon=${t === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${i[`sun_${t}_short`] ?? t}</button>`;
		})}
      </div>
      ${"sun" in n ? this._limits(e, n, t) : C}
      <div class="random">
        <label><input type="checkbox" aria-describedby=${`random-${e}`} .checked=${!!n.random_minutes} ?disabled=${a}
          @change=${(t) => this._random(e, t.target.checked ? 15 : 0)} />${A(r, "random_time")}</label>
        ${n.random_minutes ? x`<label>${A(r, "random_minutes")}<input type="number" aria-describedby=${`random-${e}`} min="1" max="240" step="1" required
          .value=${String(n.random_minutes)} ?disabled=${a} @change=${(t) => {
			let n = t.target;
			n.validity.valid && this._random(e, Number(n.value));
		}} /></label><small id=${`random-${e}`}>${Ni(r, n, e, this.hass)}</small>` : C}
      </div>
      `;
	}
	_limits(e, t, n) {
		let r = this._lang, i = (i) => x`<div class="limit">
      <label>${A(r, i === "earliest" ? "sun_earliest" : "sun_latest")}
        <input type="time" step="60" .value=${t[i] === "24:00" ? "00:00" : t[i] ?? ""} ?disabled=${this.disabled}
          aria-label=${`${n}: ${A(r, i === "earliest" ? "sun_earliest" : "sun_latest")}`}
          @change=${(t) => this._limit(e, i, t.target.value)} /></label>
      ${t[i] ? x`<button class="clear" ?disabled=${this.disabled} aria-label=${A(r, "sun_limit_clear")} title=${A(r, "sun_limit_clear")}
        @click=${() => this._limit(e, i, "")}><ha-icon icon="mdi:close"></ha-icon></button>` : C}
    </div>`, a = Ai(r, t), o = Mi(r, this.hass, t);
		return x`<div class="limits" role="group">${i("earliest")}${i("latest")}</div>
      ${a || o ? x`<small class="sun-help">${a}${a && o ? " " : ""}${o}</small>` : C}
      ${Qn(t) ? x`<small class="bad" role="alert">${A(r, "err_sun_bounds")}</small>` : C}`;
	}
	_toggleEnd(e) {
		if (!e) return this._update("end", null);
		let t = this.group.slot.start, n = "time" in t ? M(t.time) : 720;
		this._update("end", { time: ht(Math.min(j - 5, n + 60)) });
	}
	_toggleDay(e) {
		let t = this.group.days.includes(e) ? this.group.days.filter((t) => t !== e) : [...this.group.days, e];
		this._set({}, t.sort((e, t) => e - t));
	}
	render() {
		if (!this.group || !this.program) return C;
		let e = this._lang, t = k(e), n = this.group.slot, r = this.group.days, i = (e, t) => e.length === t.length && t.every((t) => e.includes(t)), a = (e, t) => x`<button class="chip small ${i(r, t) ? "on" : ""}"
      aria-pressed=${i(r, t)} ?disabled=${this.disabled} @click=${() => this._set({}, t === Hn && i(r, t) ? [] : [...t])}>${i(r, t) ? x`<ha-icon icon="mdi:check"></ha-icon>` : C}${e}</button>`;
		return x`
      <section>
        <h4>${A(e, "start")}</h4>
        ${this._timeBlock("start", A(e, "start"))}
      </section>
      <section>
        <h4>${A(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${n.end ? "" : "on"}" aria-pressed=${!n.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${A(e, "no_end")}</button>
          <button class="chip ${n.end ? "on" : ""}" aria-pressed=${!!n.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${A(e, "with_end")}</button>
        </div>
        ${n.end ? this._timeBlock("end", A(e, "end")) : C}
      </section>
      <section>
        <h4>${A(e, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && i(r, [this.dayOnly]) ? x`<div class="chips"><span class="only">${t.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${A(e, "apply_other_days")}</button></div>` : x`<div class="days" role="group" aria-label=${A(e, "days_label")}>
          ${t.days_short.map((e, n) => x`<button class="day ${r.includes(n) ? "on" : ""}" aria-pressed=${r.includes(n)}
            aria-label=${t.days[n]} ?disabled=${this.disabled} @click=${() => this._toggleDay(n)}>${r.includes(n) ? x`<ha-icon icon="mdi:check"></ha-icon>` : C}<span>${e}</span></button>`)}
        </div>
        <div class="chips">
          ${a(A(e, "all_days"), Hn)}${a(A(e, "weekdays"), Bn)}${a(A(e, "weekend"), Vn)}
        </div>`}
      </section>
      <section>
        <h4>${A(e, "action")}</h4>
        <wp-label-picker embedded .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${n.label || null} ?disabled=${this.disabled}
          @label-change=${(e) => {
			e.stopPropagation(), this._set({ label: e.detail ?? "" });
		}}></wp-label-picker>
      </section>`;
	}
	static {
		this.styles = [U, o`
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
	}
};
O([E({ attribute: !1 })], Y.prototype, "hass", void 0), O([E({ attribute: !1 })], Y.prototype, "data", void 0), O([E({ attribute: !1 })], Y.prototype, "program", void 0), O([E({ attribute: !1 })], Y.prototype, "group", void 0), O([E({ attribute: !1 })], Y.prototype, "entityIds", void 0), O([E({ type: Boolean })], Y.prototype, "disabled", void 0), O([E({ type: Number })], Y.prototype, "dayOnly", void 0), O([D()], Y.prototype, "_more", void 0), O([D()], Y.prototype, "_last", void 0), Y = O([T("wp-slot-form")], Y);
// src/components/schedule-dialog.ts
var Pi = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, Fi = 7, X = class extends w {
	constructor(...e) {
		super(...e), this.chart = !0, this.profileId = null, this._viewProfileId = null, this._editProfileId = null, this.day = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._labelDraft = null, this._pickerKey = 0, this._fresh = /* @__PURE__ */ new Set(), this._programId = "", this._error = "", this._saving = !1, this._toggling = !1, this._offset = 0, this._slots = null, this._chartEntity = "", this._token = 0, this._loaded = "", this._include = (e) => !0, this._minutes = (e) => Xn(this.hass, e);
	}
	get _lang() {
		return kn(this.hass);
	}
	get _tz() {
		return this.hass.config.time_zone;
	}
	get _programs() {
		let e = this.data.programs;
		return [...this.scope.kind === "device" ? e.filter((e) => e.entities.some((e) => e.entity_id === this.scope.entityId)) : e.filter((e) => e.id === this.scope.programId)].sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name));
	}
	_modeProfile(e) {
		let t = this._open && e.id === this._programId ? this._editProfileId : this.profileId ?? (this.scope.kind === "program" ? this._viewProfileId : null);
		return t === null ? R(e, this.data) : e.profiles.find((e) => e.id === t);
	}
	get _modeOnly() {
		return this.profileId !== null || this._programs.some((e) => this._modeProfile(e)?.id !== R(e, this.data)?.id);
	}
	_editProfile(e) {
		return e.profiles.find((e) => e.id === this._editProfileId);
	}
	get _entities() {
		if (this.scope.kind === "device") return [this.scope.entityId];
		let e = this._programs[0];
		return e ? e.entities.map((e) => e.entity_id) : [];
	}
	get _title() {
		return this.scope.kind === "device" ? z(this.hass, this.scope.entityId) : this._programs[0]?.name ?? "";
	}
	_rows() {
		let e = [];
		for (let t of this._programs) {
			let n = this._open && t.id === this._programId ? this._editProfile(t) : this._modeProfile(t);
			if (n) for (let r of Kn(n, this._include, this._minutes)) (this._focus === null || r.days.includes(this._focus)) && e.push({
				program: t,
				group: r,
				key: `${t.id}|${r.ids[r.days[0]]}`
			});
		}
		return e;
	}
	firstUpdated() {
		if (this._loadNames(), !this.day) return;
		let { weekday: e, offset: t } = this.day;
		t >= -14 && t <= Fi && (this._offset = t), this._focus = e, !this._rows().length && this._canEdit && this._add([e]);
	}
	_loadNames() {
		let e = /* @__PURE__ */ new Set();
		for (let t of this.data.labels) t.action.kind === "service" && e.add(t.action.service.split(".")[0]);
		Qt(this.hass, [...e]).then((e) => e && this.requestUpdate());
	}
	willUpdate(e) {
		(!this._chartEntity || e.has("scope")) && (this._chartEntity = this._entities[0] ?? "");
		let t = this._programs[0];
		if (this.chart && t && this.hass && !this._modeOnly) {
			let e = `${t.id}|${t.revision}|${this._modeProfile(t)?.id}|${this._date}`;
			e !== this._loaded && (this._loaded = e, this._loadPreview(t.id, t.revision, this._date, e, this._modeProfile(t)?.id));
		}
	}
	get _today() {
		return P(/* @__PURE__ */ new Date(), this._tz);
	}
	get _date() {
		return mt(this._today, this._offset);
	}
	async _loadPreview(e, t, n, r, i) {
		let a = ++this._token;
		try {
			let o = await Promise.all([mt(n, -1), n].map((n) => Nt(this.hass, e, t, n, i)));
			a === this._token && r === this._loaded && (this._slots = o.flat());
		} catch {
			a === this._token && (this._slots = null);
		}
	}
	_go(e) {
		let t = this._offset + e;
		t < -14 || t > Fi || (this._slots = null, this._offset = t);
	}
	get _canEdit() {
		return this.data.can_edit && !this.data.read_only;
	}
	_expand(e, t, n, r = {}) {
		this._editProfileId = this._modeProfile(t)?.id ?? null, this._open = e, this._programId = t.id, this._group = n ? structuredClone(n) : null, this._restLabel = r.restLabel ?? null, this._rest = r.rest ?? null, this._dayOnly = r.dayOnly ?? null, this._openId = r.openId ?? null, this._base = null, this._origin = r.origin ? structuredClone(r.origin) : null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = structuredClone(t), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => this._revealEditor()));
	}
	_revealEditor() {
		let e = this.renderRoot.querySelector(".editor");
		if (!e) return;
		let t = typeof matchMedia == "function" && matchMedia("(min-width: 768px)").matches, n = this.renderRoot.querySelector("wp-dialog")?.shadowRoot?.querySelector(".content");
		if (!t || !n) {
			e.scrollIntoView({ block: "start" });
			return;
		}
		let r = e.getBoundingClientRect(), i = n.getBoundingClientRect();
		r.top >= i.top && r.top < i.bottom || (n.scrollTop += r.top - i.top);
	}
	_openRow(e, t, n) {
		let r = tr(n) ?? null;
		if (this._focus !== null && n.days.includes(this._focus)) {
			let { draft: i, rest: a } = ar(n, this._focus);
			this._expand(e, t, i, {
				rest: a,
				dayOnly: this._focus,
				openId: r,
				origin: n
			});
		} else this._expand(e, t, n, {
			openId: r,
			origin: n
		});
	}
	_cancel() {
		this._editProfileId = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._origin = null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._draft = null, this._restLabel = null, this._error = "";
	}
	_onOverride(e) {
		let t = this._draft;
		t && (this._overrides = [...this._overrides.filter((t) => t.entityId !== e.entityId || t.labelId !== e.labelId), e], this._draft = {
			...t,
			entities: t.entities.map((t) => {
				if (t.entity_id !== e.entityId) return t;
				let n = { ...t.label_overrides ?? {} };
				return e.action ? n[e.labelId] = e.action : delete n[e.labelId], {
					...t,
					label_overrides: n
				};
			})
		});
	}
	_add(e = this._focus === null ? Hn : [this._focus]) {
		let t = this._programs[0], n = this._entities[0];
		if (!t || !n) return;
		let r = yn(this.hass, this.data, this._entities)[0], i = e.length === 1 ? e[0] : null, a = this._modeProfile(t);
		if (!a) return;
		let o = i === null ? void 0 : dr(a.days[i], this._minutes);
		this._expand("new", t, fr(r?.id ?? "", e, o), { dayOnly: i }), this._dropBusy = i === null;
	}
	_duplicate() {
		let e = this._programs.find((e) => e.id === this._programId), t = this._group;
		if (!e || !t) return;
		let n = this._problem(e);
		if (n) {
			this._error = n;
			return;
		}
		let { start: r, end: i } = t.slot, a = Xn(this.hass, r), o = i ? Math.max(15, Xn(this.hass, i) - a) : 60, s = {
			openId: this._openId,
			rest: this._rest,
			draft: structuredClone(t)
		}, c = this._dayOnly, l = fr(t.slot.label, t.days);
		l.slot = {
			...structuredClone(t.slot),
			id: l.slot.id,
			start: Zn(this.hass, r, o),
			end: i ? Zn(this.hass, i, o) : null
		}, l.slot.end && Xn(this.hass, l.slot.start) >= Xn(this.hass, l.slot.end) && (l.slot.start = { time: ht(Math.max(0, j - o)) }, l.slot.end = { time: ht(j) });
		let u = this._origin, d = this._editProfileId;
		this._expand("new", e, l, { dayOnly: c }), this._editProfileId = d, this._base = s, this._origin = u;
	}
	_live(e) {
		let t = this.data.programs.find((t) => t.id === e), n = this._saved[e];
		return n && (!t || n.revision > t.revision) ? n : t;
	}
	async _saveProgram(e) {
		this._saving = !0;
		try {
			let t = await this.hass.callWS({
				type: "weekly_planner/program/save",
				program: structuredClone(e)
			});
			return t?.program && (this._saved[e.id] = t.program, this.dispatchEvent(new CustomEvent("schedule-program-saved", {
				detail: t.program,
				bubbles: !0,
				composed: !0
			}))), "ok";
		} catch (e) {
			let t = e;
			return t?.code === "conflict" ? "conflict" : (this._error = t?.code === "unauthorized" ? A(this._lang, "err_unauthorized") : t?.message?.includes("unknown_label") ? A(this._lang, "err_label") : t?.message?.includes("earliest_after_latest") ? A(this._lang, "err_sun_bounds") : t?.message?.includes("random_window_too_short") ? A(this._lang, "random_too_short") : t?.message?.includes("overlapping_slots") ? A(this._lang, "w_err_overlap") : /offset|invalid_random_minutes|at most|at least|out of range|invalid_time|invalid_clock/i.test(t?.message ?? "") ? A(this._lang, "err_time_range") : A(this._lang, "ss_err_save"), "error");
		} finally {
			this._saving = !1;
		}
	}
	async _commit(e, t) {
		let n = this._live(e);
		for (let r = 0; r < 2; r++) {
			if (!n) return !1;
			let r = t(n);
			if ("error" in r) return this._error = r.error, !1;
			if ("changed" in r) return !1;
			let i = await this._saveProgram(r.program);
			if (i === "ok") return !0;
			if (i === "error") return !1;
			try {
				n = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((t) => t.id === e), n && (this._saved[e] = n);
			} catch {
				break;
			}
		}
		return this._error = A(this._lang, "ss_err_save"), !1;
	}
	_withOverrides(e, t = e.entities) {
		return t.map((e) => {
			let t = this._overrides.filter((t) => t.entityId === e.entity_id);
			if (!t.length) return e;
			let n = { ...e.label_overrides ?? {} };
			for (let e of t) e.action ? n[e.labelId] = e.action : delete n[e.labelId];
			return {
				...e,
				label_overrides: n
			};
		});
	}
	_overlapText(e) {
		let t = this._lang, n = cr(e);
		if (!n) return A(t, "w_err_overlap");
		let r = (e) => {
			let n = V(this.data, e.label);
			return n ? H(this.hass, n) : A(t, "w_err_overlap_slot");
		}, i = (e) => `${Rn(t, e.start)}${e.end ? ` → ${Rn(t, e.end)}` : ""}`;
		return A(t, "w_err_overlap_detail", {
			day: k(t).days_short[n.day],
			a: r(n.a),
			a_time: i(n.a),
			b: r(n.b),
			b_time: i(n.b)
		});
	}
	_problem(e) {
		let t = this._lang, n = this._group;
		return n ? n.days.length ? Qn(n.slot.start) || Qn(n.slot.end) ? A(t, "err_sun_bounds") : n.slot.end && JSON.stringify(n.slot.start) === JSON.stringify(n.slot.end) ? A(t, "w_err_same") : !V(this.data, n.slot.label) && !this._fresh.has(n.slot.label) ? A(t, "err_action") : "" : A(t, "err_days") : "";
	}
	_checkOrigin(e, t) {
		let n = this._origin;
		if (!n || !this._openId) return "ok";
		let r = rr(e, this._include, this._minutes, this._openId), i = ir(r, n);
		if (i === "same") return "ok";
		if (i === "days" && r && this._dayOnly !== null && r.days.includes(this._dayOnly)) return this._rest = ar(r, this._dayOnly).rest, this._origin = structuredClone(r), "ok";
		let a = A(this._lang, "ss_changed");
		if (r) {
			let e = this._open ?? `${t.id}|${tr(r)}`, n = this._editProfileId;
			this._openRow(e, t, r), this._editProfileId = n;
		} else this._cancel();
		return this._error = r ? a : "", this._note = r ? "" : a, "changed";
	}
	async _saveLabelDraft() {
		let e = this._labelDraft;
		if (!e) return !0;
		if (e.problem) return this._error = e.problem, !1;
		this._saving = !0;
		try {
			let t = await this.hass.callWS({
				type: "weekly_planner/label/save",
				label: {
					...e.id ? { id: e.id } : {},
					name: e.name,
					color: e.color,
					action: e.action
				}
			});
			for (let n of e.overrides) this._onOverride({
				entityId: n.entityId,
				labelId: t.label.id,
				action: n.action
			});
			return e.id || (this._open?.startsWith("rest:") ? this._restLabel = t.label.id : this._group &&= {
				...this._group,
				slot: {
					...this._group.slot,
					label: t.label.id
				}
			}), this._fresh.add(t.label.id), this._labelDraft = null, this._pickerKey += 1, !0;
		} catch (e) {
			return this._error = e?.code === "unauthorized" ? A(this._lang, "err_unauthorized") : A(this._lang, "lb_err_save"), !1;
		} finally {
			this._saving = !1;
		}
	}
	async _saveRow() {
		let e = this._live(this._programId);
		if (!e || !this._editProfile(e)) {
			this._error = A(this._lang, "ss_changed");
			return;
		}
		if (!await this._saveLabelDraft()) return;
		let t = this._group, n = this._live(this._programId);
		if (!n || !t) return;
		let r = this._problem(n);
		if (r) {
			this._error = r;
			return;
		}
		let i = this._include, a = [], o = !1;
		await this._commit(n.id, (e) => {
			let n = this._editProfile(e);
			if (!n) return { error: A(this._lang, "ss_changed") };
			if (this._checkOrigin(n, e) === "changed") return o = !0, { changed: !0 };
			let r = n;
			this._base && (r = sr(r, i, this._minutes, this._base));
			let s = t;
			if (a = [], this._dropBusy) {
				let { free: e, busy: n } = lr(r, i, this._minutes, t.slot, t.days);
				if (!e.length) return { error: this._overlapText(sr(r, i, this._minutes, {
					openId: this._openId,
					rest: this._rest,
					draft: t
				})) };
				s = {
					...t,
					days: e
				}, a = n;
			}
			let c = sr(r, i, this._minutes, {
				openId: this._openId,
				rest: this._rest,
				draft: s
			});
			return cr(c) ? { error: this._overlapText(c) } : { program: {
				...e,
				entities: this._withOverrides(e),
				profiles: e.profiles.map((e) => e.id === n.id ? c : e)
			} };
		}) && !o && (this._cancel(), a.length && (this._note = A(this._lang, "w_dropped", { days: a.map((e) => k(this._lang).days_short[e]).join(" ") })));
	}
	async _deleteRow() {
		if (!this._canEdit || this._saving) return;
		if (this._open === "new") {
			this._cancel();
			return;
		}
		let e = this._live(this._programId);
		e && this._openId && await Pn(this, A(this._lang, "w_confirm_slot"), A(this._lang, "yes"), A(this._lang, "no")) && await this._commit(e.id, (e) => {
			let t = this._editProfile(e);
			if (!t) return { error: A(this._lang, "ss_changed") };
			if (this._checkOrigin(t, e) === "changed") return { changed: !0 };
			let n = sr(t, this._include, this._minutes, {
				openId: this._openId,
				rest: this._rest,
				draft: null
			});
			return { program: {
				...e,
				profiles: e.profiles.map((e) => e.id === t.id ? n : e)
			} };
		}) && this._cancel();
	}
	async _saveRest(e) {
		if (!await this._saveLabelDraft()) return;
		let t = this._live(this._programId) ?? this._programs[0];
		t && await this._commit(t.id, (t) => ({ program: {
			...t,
			entities: this._withOverrides(t, t.entities.map((t) => t.entity_id === e ? {
				...t,
				default_label: this._restLabel
			} : t))
		} })) && this._cancel();
	}
	get _enabled() {
		return this._programs.some((e) => e.enabled);
	}
	async _setEnabled(e, t) {
		if (this._toggling) t.checked = this._enabled;
		else {
			this._toggling = !0;
			try {
				if (!e && !await Pn(this, A(this._lang, "confirm_pause", { name: this._title }), A(this._lang, "yes"), A(this._lang, "no"))) {
					t.checked = !0;
					return;
				}
				for (let t of this._programs) await this.hass.callWS({
					type: "weekly_planner/program/set_enabled",
					program_id: t.id,
					enabled: e
				});
			} catch (e) {
				this._error = A(this._lang, "error", { message: e?.message ?? String(e) });
			} finally {
				this._toggling = !1, t.checked = this._enabled;
			}
		}
	}
	async _deleteAll() {
		if (await Pn(this, A(this._lang, "confirm_delete_schedule", { name: this._title }), A(this._lang, "yes"), A(this._lang, "no"))) try {
			for (let e of this._programs) {
				let t = this.scope.kind === "device" ? this.scope.entityId : null;
				if (!t || e.entities.length <= 1) {
					await this.hass.callWS({
						type: "weekly_planner/program/delete",
						program_id: e.id
					});
					continue;
				}
				let n = structuredClone(e);
				n.entities = n.entities.filter((e) => e.entity_id !== t), await this.hass.callWS({
					type: "weekly_planner/program/save",
					program: n
				});
			}
			this._closeDialog();
		} catch (e) {
			this._error = A(this._lang, "error", { message: e?.message ?? String(e) });
		}
	}
	_openHistory(e) {
		this._closeDialog(), window.history.pushState(null, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
	}
	_closeDialog() {
		this.renderRoot.querySelector("wp-dialog")?.close();
	}
	_when(e) {
		let t = this._lang, n = Rn(t, e.start);
		return e.end ? `${n}–${Rn(t, e.end)}` : n;
	}
	_rowText(e) {
		let t = this._lang, n = V(this.data, e.slot.label), r = Un(t, k(t).days_short, e.days);
		return {
			text: [n ? H(this.hass, n) : "", this._when(e.slot)].filter(Boolean).join(" · "),
			days: r,
			color: n?.color ?? "var(--disabled-text-color)"
		};
	}
	_renderRow(e) {
		let { program: t, group: n, key: r } = e;
		if (this._open === r && this._group) return this._renderEditor(t, r);
		let { text: i, days: a, color: o } = this._rowText(n);
		return x`<button class="row" aria-expanded="false" @click=${() => this._openRow(r, t, n)}>
      <span class="dot" style="background:${o}"></span>
      <span class="txt"><span class="l1">${i}</span>${this._focus === null ? x`<span class="l2">${a}</span>` : C}${this._programs.length > 1 ? x`<small>${t.name}</small>` : C}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
	}
	_renderEditor(e, t) {
		let n = this._lang, r = t === "new", i = this._entities.filter((t) => e.entities.some((e) => e.entity_id === t));
		return x`<div class="editor">
      ${nt(this._pickerKey, x`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .group=${this._group} .entityIds=${i}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(e) => {
			e.stopPropagation(), this._labelDraft = e.detail, this._error = "";
		}}
        @group-change=${(e) => {
			e.stopPropagation(), this._group = e.detail, this._error = "";
		}}></wp-slot-form>`)}
      ${this._error ? x`<p class="err" role="alert">${this._error}</p>` : C}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${A(n, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${A(n, "cancel")}</button>
      </div>
      ${r || this._labelDraft ? C : x`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${A(n, "duplicate")}</button>`}
      <button class="btn danger-line alone" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${A(n, "delete")}</button>
    </div>`;
	}
	_renderRest() {
		let e = this._lang, t = this._programs[0];
		return t ? this._entities.filter((e) => t.entities.some((t) => t.entity_id === e)).map((n) => {
			let r = t.entities.find((e) => e.entity_id === n), i = `rest:${n}`, a = this._entities.length > 1 ? `${A(e, "rest_of_time")} · ${z(this.hass, n)}` : A(e, "rest_of_time");
			if (this._open === i) return x`<div class="editor"><h4>${a}</h4>
          ${nt(this._pickerKey, x`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .entityIds=${[n]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(e) => {
				e.stopPropagation(), this._labelDraft = e.detail, this._error = "";
			}}
            @label-change=${(e) => {
				e.stopPropagation(), this._restLabel = e.detail;
			}}></wp-label-picker>`)}
          ${this._error ? x`<p class="err" role="alert">${this._error}</p>` : C}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(n)}>${A(e, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${A(e, "cancel")}</button>
          </div></div>`;
			let o = V(this.data, r.default_label);
			return x`<button class="row rest" aria-expanded="false" @click=${() => this._expand(i, t, null, { restLabel: r.default_label ?? null })}>
        ${o ? x`<span class="dot" style="background:${o.color}"></span>` : x`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${a} · <b>${o ? H(this.hass, o) : A(e, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
		}) : C;
	}
	_renderWeek() {
		let e = this._lang;
		return x`<section class="schematic" aria-label=${A(e, "week")}>
      ${this._entities.map((t) => x`
        ${this._entities.length > 1 ? x`<h4>${z(this.hass, t)}</h4>` : C}
        ${k(e).days_short.map((n, r) => {
			let i = [];
			for (let e of [...this._programs].reverse()) {
				let n = this._live(e.id) ?? e;
				if (!n.entities.some((e) => e.entity_id === t)) continue;
				let a = n.id === this._programId && this._open ? this._editProfile(n) : this._modeProfile(n);
				if (a) {
					n.id === this._programId && this._group && (this._base && (a = sr(a, this._include, this._minutes, this._base)), a = sr(a, this._include, this._minutes, {
						openId: this._openId,
						rest: this._rest,
						draft: this._group
					}));
					for (let e of [(r + 6) % 7, r]) for (let o of a.days[e]) {
						let a = V(this.data, o.label);
						if (!a || !vn(this.hass, t, bn(n, t, a), _n(n, t))) continue;
						let s = this._minutes(o.start), c = o.end ? this._minutes(o.end) : null, l = c !== null && c < s && c < 720;
						e !== r && !l || c !== null && c <= s && !l || i.push({
							start: e === r ? s : 0,
							end: e === r ? l ? j : c ?? s + 10 : c,
							color: a.color,
							label: H(this.hass, a),
							marker: c === null,
							startSun: e === r ? bt(o.start) : null,
							endSun: l && e === r ? null : bt(o.end),
							startSpec: o.start,
							endSpec: o.end
						});
					}
				}
			}
			return x`<div class="schema-day"><span>${n}</span>
            <wp-day-bar lang=${e} notches ?show-hours=${r === 6} .spans=${i}></wp-day-bar>
          </div>`;
		})}
      `)}
    </section>`;
	}
	_renderChart() {
		let e = this._lang, t = this._programs[0];
		if (!this.chart || !t || !this._chartEntity || this._modeOnly) return C;
		let n = this._date, r = new Intl.DateTimeFormat(e, {
			timeZone: "UTC",
			weekday: "short",
			day: "numeric",
			month: "short"
		}).format(/* @__PURE__ */ new Date(`${n}T12:00:00Z`));
		return x`<section class="chart">
      ${this._entities.length > 1 ? x`<select aria-label=${A(e, "chart")} @change=${(e) => this._chartEntity = e.target.value}>
        ${this._entities.map((e) => x`<option value=${e} ?selected=${e === this._chartEntity}>${z(this.hass, e)}</option>`)}</select>` : C}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${A(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? A(e, "today") : r}</span>
        <button class="ibtn" ?disabled=${this._offset >= Fi} aria-label=${A(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${t} entity-id=${this._chartEntity} date=${n}
        .slots=${this._slots} @open-history=${(e) => this._openHistory(e.detail)}></wp-chart>
    </section>`;
	}
	render() {
		if (!this.hass || !this.data || !this.scope) return C;
		let e = this._lang;
		if (!this._programs.length) return x`<wp-dialog open heading=${this._title}><p class="muted">${A(e, "no_program")}</p></wp-dialog>`;
		let t = this._rows(), n = this.scope.kind === "program" && !this._modeProfile(this._programs[0]);
		return x`
      <wp-dialog open columns heading=${this._title}>
        <div class="cols">
        <div class="params">
        ${n ? x`<p class="err" role="alert">${A(e, "mode_removed")}</p>` : C}
        ${this._canEdit ? C : x`<p class="err" role="alert">${A(e, "read_only")}</p>`}
        ${this._error && !this._open ? x`<p class="err" role="alert">${this._error}</p>` : C}
        ${this._open !== null || this._modeOnly ? C : x`<label class="switch">
          <span class="grow">${A(e, "schedule_on")}</span>
          <span class="state">${this._enabled ? A(e, "running") : A(e, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit || this._toggling}
            @change=${(e) => void this._setEnabled(e.target.checked, e.target)} />
          <span class="track"></span>
        </label>`}
        ${this.scope.kind === "program" ? x`<label class="mode-select">${A(e, "profile")}
          <select .value=${this._modeProfile(this._programs[0])?.id ?? ""} ?disabled=${this.profileId !== null || this._open !== null}
            @change=${(e) => {
			this._viewProfileId = e.target.value, this._slots = null, this._error = "";
		}}>
            ${n ? x`<option value="" selected>${A(e, "mode_removed")}</option>` : C}
            ${this._programs[0].profiles.map((e) => x`<option value=${e.id} ?selected=${e.id === this._modeProfile(this._programs[0])?.id}>${e.name}</option>`)}
          </select></label>` : C}
        ${this._modeOnly ? x`<p class="muted note">${A(e, "mode_schedule_hint")}</p>` : C}
        ${this._modeOnly ? C : x`<div class="rests">${this._renderRest()}</div>`}
        ${this._focus !== null && this._open === null ? x`<div class="focus">
          <button class="chip back" @click=${() => {
			this._focus = null, this._note = "";
		}}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${A(e, "w_whole_week")}</button>
          <h3>${k(e).days[this._focus]}</h3></div>` : C}
        ${this._note && this._open === null ? x`<p class="muted note">${this._note}</p>` : C}
        <div class="list">
          ${t.length ? t.map((e) => this._renderRow(e)) : this._open === "new" ? C : x`<p class="muted">${A(e, "w_none")}</p>`}
          ${this._group && (this._open === "new" || this._open !== null && !t.some((e) => e.key === this._open)) ? this._renderEditor(this._programs.find((e) => e.id === this._programId) ?? this._programs[0], this._open) : C}
          ${this._open === null ? x`<button class="row add" ?disabled=${!this._canEdit || n} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? A(e, "w_add") : A(e, "w_add_day", { day: k(e).days[this._focus].toLocaleLowerCase(e) })}</span></button>` : C}
        </div>
        </div>
        <div class="area-week">${this._renderWeek()}</div>
        <div class="area-chart">${this._open === null ? this._renderChart() : C}</div>
        <div class="area-delete">${this._open !== null || this._modeOnly ? C : x`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${A(e, "delete_schedule")}</button>`}</div>
        </div>
      </wp-dialog>`;
	}
	static {
		this.styles = [U, o`
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
	}
};
O([E({ attribute: !1 })], X.prototype, "hass", void 0), O([E({ attribute: !1 })], X.prototype, "data", void 0), O([E({ attribute: !1 })], X.prototype, "scope", void 0), O([E({ type: Boolean })], X.prototype, "chart", void 0), O([E({ attribute: !1 })], X.prototype, "profileId", void 0), O([D()], X.prototype, "_viewProfileId", void 0), O([E({ attribute: !1 })], X.prototype, "day", void 0), O([D()], X.prototype, "_open", void 0), O([D()], X.prototype, "_group", void 0), O([D()], X.prototype, "_dayOnly", void 0), O([D()], X.prototype, "_focus", void 0), O([D()], X.prototype, "_note", void 0), O([D()], X.prototype, "_draft", void 0), O([D()], X.prototype, "_restLabel", void 0), O([D()], X.prototype, "_labelDraft", void 0), O([D()], X.prototype, "_pickerKey", void 0), O([D()], X.prototype, "_programId", void 0), O([D()], X.prototype, "_error", void 0), O([D()], X.prototype, "_saving", void 0), O([D()], X.prototype, "_toggling", void 0), O([D()], X.prototype, "_offset", void 0), O([D()], X.prototype, "_slots", void 0), O([D()], X.prototype, "_chartEntity", void 0), X = O([T("wp-schedule")], X);
// src/chart-state.ts
var Ii = "weekly-planner:chart-choices", Li = "weekly-planner:open-charts";
function Ri() {
	let e = /* @__PURE__ */ new Map();
	try {
		let t = JSON.parse(localStorage.getItem(Ii) ?? "null");
		if (t && typeof t == "object" && !Array.isArray(t)) {
			for (let [n, r] of Object.entries(t)) typeof r == "boolean" && e.set(n, r);
			return e;
		}
		let n = JSON.parse(localStorage.getItem(Li) ?? "[]");
		if (Array.isArray(n)) for (let t of n) typeof t == "string" && e.set(t, !0);
	} catch {}
	return e;
}
function zi(e) {
	try {
		localStorage.setItem(Ii, JSON.stringify(Object.fromEntries(e)));
	} catch {}
}
function Bi(e) {
	let t = JSON.stringify([
		e.title ?? "",
		e.program ?? null,
		e.program === void 0 ? e.filter ?? null : null
	]), n = 5381;
	for (let e = 0; e < t.length; e++) n = (n * 33 ^ t.charCodeAt(e)) >>> 0;
	return n.toString(36);
}
var Vi = (e, t, n) => `${e}|${t}|${n}`;
function Hi(e, t, n) {
	return e.get(t) ?? !n;
}
function Ui(e) {
	window.history.pushState(null, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
}
// src/update.ts
var Wi = "weekly_planner_reloaded_for";
function Gi(e = import.meta.url) {
	try {
		return new URL(e).searchParams.get("v");
	} catch {
		return null;
	}
}
function Ki(e, t, n) {
	return !!(e && t && e !== t && n !== t);
}
function qi(e, t) {
	if (!t) return !1;
	let n = null;
	try {
		n = sessionStorage.getItem(Wi);
	} catch {}
	if (!Ki(Gi(), e, n)) return !1;
	try {
		sessionStorage.setItem(Wi, e);
	} catch {}
	return location.reload(), !0;
}
// src/config.ts
var Ji = [
	"bars",
	"radial",
	"radial_12h",
	"list"
], Yi = (e) => typeof e == "string" ? e ? [e] : [] : Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : void 0;
function Xi(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("Weekly Planner card: the configuration must be a YAML mapping.");
	let t = { ...e };
	for (let e of ["title", "program"]) t[e] !== void 0 && typeof t[e] != "string" && (typeof t[e] == "number" ? t[e] = String(t[e]) : delete t[e]);
	for (let e of ["show_chart", "chart_collapsed"]) t[e] !== void 0 && typeof t[e] != "boolean" && delete t[e];
	if (t.schedule_view !== void 0 && !Ji.includes(t.schedule_view) && delete t.schedule_view, t.filter !== void 0) {
		if (!t.filter || typeof t.filter != "object" || Array.isArray(t.filter)) delete t.filter;
		else {
			let e = { ...t.filter };
			for (let t of ["types", "programs"]) if (e[t] !== void 0) {
				let n = Yi(e[t]);
				n ? e[t] = n : delete e[t];
			}
			e.area !== void 0 && typeof e.area != "string" && delete e.area, t.filter = e;
		}
	}
	return t;
}
function Zi() {
	return {
		schedule_view: "bars",
		show_chart: !0,
		chart_collapsed: !0
	};
}
function Qi(e) {
	let t = {
		...Zi(),
		...e
	};
	return t.program === void 0 && t.filter === void 0 && (t.filter = {}), t;
}
// src/weekly-planner-card.ts
var Z = class extends w {
	constructor(...e) {
		super(...e), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._expandedProgram = null, this._charts = Ri(), this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._toggling = /* @__PURE__ */ new Set(), this._visible = () => {
			document.hidden || this._pollVersion();
		}, this._failedPreviewKey = "", this._previewRetryAt = 0, this._spanCache = /* @__PURE__ */ new Map(), this._spanInputs = [];
	}
	static getConfigElement() {
		return document.createElement("weekly-planner-card-editor");
	}
	static getStubConfig() {
		return {
			filter: {},
			...Zi()
		};
	}
	setConfig(e) {
		this._config = {
			show_chart: !0,
			...Xi(e)
		}, this._data && this._loadPreviews();
	}
	getCardSize() {
		return 2 + (this._data?.programs.length ?? 1) * 2;
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate(), this._clock = window.setInterval(() => {
			this._now = /* @__PURE__ */ new Date(), this._loadPreviews(), this._checkVersion(), ++this._ticks % 5 == 0 && this._pollVersion();
		}, 6e4), document.addEventListener("visibilitychange", this._visible);
	}
	get _idle() {
		return !this._dialog && this._edit === null && !this._snack;
	}
	_checkVersion() {
		qi(this._data?.card_version, this._idle);
	}
	async _pollVersion() {
		try {
			qi((await this.hass.callWS({ type: "weekly_planner/get" })).card_version, this._idle);
		} catch {}
	}
	_showSnack(e) {
		this._snack = { undo: e }, window.clearTimeout(this._snackTimer), this._snackTimer = window.setTimeout(() => this._snack = null, 6e3);
	}
	async _undo() {
		let e = this._snack;
		window.clearTimeout(this._snackTimer), this._snack = null, await e?.undo();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), window.clearTimeout(this._snackTimer), document.removeEventListener("visibilitychange", this._visible), this._unsub?.(), this._unsub = void 0, window.clearInterval(this._clock);
	}
	updated() {
		this._idle && this._data?.card_version && this._checkVersion(), this.isConnected && this.hass && !this._unsub && (this._unsub = Vt(this.hass, (e) => {
			this._data = e, this._error = void 0, this._loadNames(e), this._loadPreviews();
		}));
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "en";
	}
	get _tz() {
		return this.hass.config.time_zone;
	}
	_dateAt(e) {
		return new Date(fi(mt(P(this._now, this._tz), e), this._tz).startMs + 432e5);
	}
	async _loadNames(e) {
		let t = e.labels.flatMap((e) => e.action.kind === "service" ? [e.action.service.split(".")[0]] : []);
		await Qt(this.hass, t) && this.requestUpdate();
	}
	async _loadPreviews() {
		if (!this._data) return;
		let e = [
			-1,
			0,
			1,
			2,
			3,
			4,
			5,
			6
		].map((e) => P(this._dateAt(e), this._tz)), t = Gt(this._data, this._config), n = `${e[0]}|${t.map((e) => `${e.id}:${e.revision}:${R(e, this._data).id}`).join(",")}`;
		if (n === this._previewKey || n === this._failedPreviewKey && Date.now() < this._previewRetryAt) return;
		this._previewKey = n;
		let r = !1, i = {};
		await Promise.all(e.flatMap((e) => t.map((t) => Nt(this.hass, t.id, t.revision, e, R(t, this._data).id, !1).then((n) => {
			(i[e] ??= {})[t.id] = n;
		}).catch(() => {
			r = !0;
		})))), n === this._previewKey && (this._preview = i, r ? (this._previewKey = "", this._failedPreviewKey = n, this._previewRetryAt = Date.now() + 5e3) : this._failedPreviewKey = "");
	}
	_spans(e, t, n = 0) {
		let r = [
			this._data,
			this._preview,
			this._now,
			this._config
		];
		r.some((e, t) => e !== this._spanInputs[t]) && (this._spanCache.clear(), this._spanInputs = r);
		let i = `${e}|${n}|${t.map((e) => e.id).join(",")}`, a = this._spanCache.get(i);
		return a || this._spanCache.set(i, a = this._computeSpans(e, t, n)), a;
	}
	_computeSpans(e, t, n) {
		let r = this._data, i = this._dateAt(n), a = gt(i, this._tz), o = this._preview[P(i, this._tz)] ?? {}, s = [];
		for (let n of [...t].reverse()) {
			if (!n.enabled) continue;
			let t = R(n, r), c = (t) => bn(n, e, V(r, t.label)), l = (e, t, n, i = {}) => {
				let a = V(r, e.label);
				return {
					start: t,
					end: n,
					color: a.color,
					label: H(this.hass, a),
					slotId: e.id,
					startSun: bt(e.start),
					endSun: e.end ? bt(e.end) : null,
					startSpec: e.start,
					endSpec: e.end ?? null,
					marker: !e.end,
					...i
				};
			}, u = P(i, this._tz), d = this._preview[mt(u, -1)]?.[n.id], f = o[n.id], p = new Map(t.days.flat().map((e) => [e.id, e])), m = fi(u, this._tz);
			for (let e of [...d ?? [], ...f ?? []]) {
				let t = p.get(e.slot_id);
				if (!t || !c(t)) continue;
				let n = Date.parse(e.start), r = e.end ? Date.parse(e.end) : null;
				if (n >= m.endMs || (r === null ? n < m.startMs : r <= m.startMs)) continue;
				let i = n < m.startMs, a = i ? 0 : N(e.start, this._tz), o = r === null ? null : r >= m.endMs ? j : N(e.end, this._tz);
				s.push(l(t, a, o === null ? Math.min(j, a + 10) : o, {
					spill: i,
					startSun: i ? null : bt(t.start),
					ignored: e.ignored ?? null,
					sun: "sun" in t.start || !!(t.end && "sun" in t.end)
				}));
			}
			if (!d) for (let { slot: e, end: n } of vt(t.days[(a + 6) % 7])) !e.start.random_minutes && !e.end?.random_minutes && c(e) && s.push(l(e, 0, n, {
				spill: !0,
				startSun: null
			}));
			if (!f) for (let e of t.days[a]) {
				if (!c(e) || e.start.random_minutes || e.end?.random_minutes) continue;
				let t = _t(e.start), n = _t(e.end ?? null);
				t !== null && s.push(l(e, t, n === null ? t + 10 : n > t ? n : j));
			}
		}
		return s;
	}
	_next(e, t) {
		let n = this._data;
		for (let r of t) {
			if (!r.enabled) continue;
			let t = n.status[r.id]?.next_actions?.[e];
			if (t) return t;
		}
	}
	_open(e, t) {
		this._dialog = {
			kind: "schedule",
			scope: e,
			day: t
		};
	}
	async _toggleProgram(e) {
		if (this._toggling.has(e.id)) return;
		this._toggling = new Set(this._toggling).add(e.id);
		let t = !e.enabled;
		try {
			if (!t && !await Pn(this, A(this._lang, "confirm_pause", { name: e.name }), A(this._lang, "yes"), A(this._lang, "no"))) return;
			await this.hass.callWS({
				type: "weekly_planner/program/set_enabled",
				program_id: e.id,
				enabled: t
			});
		} catch (e) {
			this._error = String(e.message ?? e);
		} finally {
			let t = new Set(this._toggling);
			t.delete(e.id), this._toggling = t;
		}
	}
	_programToggle(e) {
		return x`<button class="hours" role="switch" aria-checked=${e.enabled}
      aria-label=${`${e.name}: ${A(this._lang, e.enabled ? "running" : "stopped")}`}
      ?disabled=${this._data?.read_only || this._toggling.has(e.id)}
      @click=${() => void this._toggleProgram(e)}>
      <ha-icon icon=${e.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
	}
	_modeName(e) {
		let t = this._data ? R(e, this._data) : void 0;
		return t && (e.profiles.length > 1 || e.mode_source) ? x`<span class="mode-name">${A(this._lang, "profile")}: ${t.name}</span>` : C;
	}
	_disabledBadge(e) {
		return e ? x`<span class="disabled-badge" role="status">${A(this._lang, "program_disabled")}</span>` : C;
	}
	_bar(e, t, n, r, i) {
		let a = this._dateAt(n), o = gt(a, this._tz), s = P(a, this._tz), c = `${t.id}|${e}|${r}|${o}`, l = [t];
		return x`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${t} entity-id=${e}
      weekday=${o} .spans=${this._spans(e, l, n)} .preview=${this._preview[s]?.[t.id]}
      .now=${n === 0 ? N(this._now, this._tz) : null} ?hours=${r === "today"}
      ?editing=${this._edit === c} ?editable=${!!this._data?.can_edit && !this._data?.read_only}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => this._edit = c} @edit-exit=${() => {
			this._edit === c && (this._edit = null);
		}}
      @open-day=${i} @edited=${(e) => this._showSnack(e.detail.undo)}></wp-bar-editor>`;
	}
	_line(e, t, n) {
		let r = this._lang, i = this._data, a = this._next(e, t), o = V(i, a?.label), s = t.length > 0 && t.every((e) => !e.enabled), c = this.hass.states[e], l = n.icon ?? c?.attributes.icon ?? "mdi:calendar-clock", u = () => this._open(n.open);
		return x`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${l}></ha-icon>
          <div class="info">
            ${n.name ? x`<span class="name">${n.name}</span>` : C}
            ${n.button && t.length === 1 ? this._modeName(t[0]) : C}
            <span class="now">
              <span class="nw">${c ? this.hass.formatEntityState?.(c) ?? c.state : "—"}</span>
              ${a ? x`<span class="next">→ ${o ? H(this.hass, o) : wn(this.hass, r, a.action)}
                <span class="when nw">${Fn(yt(a.at, this._tz, r, this._now))}</span></span>` : C}
            </span>
          </div>
          ${n.button ? x`<div class="header-actions"><div class="header-icons">
            ${t.length === 1 ? this._programToggle(t[0]) : C}
            <button class="hours" aria-label=${A(r, "hours")} title=${A(r, "hours")} @click=${u}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(s)}</div>` : C}
        </div>
        ${this._config.schedule_view === "radial" || this._config.schedule_view === "radial_12h" ? x`<wp-radial-day
          .spans=${this._spans(e, t)} .now=${N(this._now, this._tz)} lang=${r}
          .rest=${(() => {
			let n = V(i, t[0].entities.find((t) => t.entity_id === e)?.default_label);
			return n ? H(this.hass, n) : A(r, "rest_none");
		})()}
          .double=${this._config.schedule_view === "radial_12h"}
          @open-day=${u}></wp-radial-day>` : x`<div class="today">
          <span class="wname">${A(r, "today_short")}</span>
          ${this._bar(e, t[0], 0, "today", u)}
        </div>`}
        ${this._extras(n.open, e, t)}
      </div>`;
	}
	_extras(e, t, n) {
		let r = this._lang, i = `${Pi(e)}|${t}`, a = this._week.has(i), o = () => {
			let e = new Set(this._week);
			a ? e.delete(i) : e.add(i), this._week = e;
		}, s = k(r).days_short, c = this._config.show_chart !== !1 && !!this._data, l = Vi(Bi(this._config), Pi(e), t), u = c && Hi(this._charts, l, this._config.chart_collapsed !== !1), d = () => {
			let e = new Map(this._charts);
			e.set(l, !u), this._charts = e, zi(e);
		}, f = n[0], p = P(this._now, this._tz), m = this._preview[p]?.[f.id], h = this._preview[mt(p, -1)]?.[f.id];
		return x`
      <div class="toggles">
        <button class="weekbtn" aria-expanded=${a} @click=${o}>
          <ha-icon icon=${a ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${A(r, "week")}</button>
        ${c ? x`<button class="weekbtn chartbtn" aria-expanded=${u} @click=${d}>
          <ha-icon icon="mdi:chart-line"></ha-icon>${A(r, "chart_day")}<ha-icon class="after" icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>` : C}
      </div>
      ${a ? x`<div class="week">
        ${[
			0,
			1,
			2,
			3,
			4,
			5,
			6
		].map((n) => {
			let r = (n - gt(this._now, this._tz) + 7) % 7, i = () => this._open(e, {
				weekday: n,
				offset: r
			});
			return x`<div class="wday">
            <button class="wnamebtn" aria-label=${s[n]} @click=${i}>
              <span class="wname ${r === 0 ? "today" : ""}">${s[n]}</span></button>
            ${this._bar(t, f, r, "week", i)}</div>`;
		})}
      </div>` : C}
      ${u ? x`<div class="chartbox"><wp-chart .hass=${this.hass} .data=${this._data} .program=${f}
        entity-id=${t} date=${p} .slots=${m ? [...h ?? [], ...m] : null}
        @open-history=${(e) => Ui(e.detail)}></wp-chart></div>` : C}`;
	}
	_bySchedule(e) {
		let t = this._lang;
		return e.map((e) => {
			let n = {
				kind: "program",
				programId: e.id
			};
			return e.entities.length === 1 ? this._line(e.entities[0].entity_id, [e], {
				name: e.name,
				icon: e.icon ?? void 0,
				button: n,
				open: n
			}) : x`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${e.name}${this._modeName(e)}</h2>
          <div class="header-actions"><div class="header-icons">${this._programToggle(e)}
            <button class="hours" aria-label=${A(t, "hours")} title=${A(t, "hours")} @click=${() => this._open(n)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(!e.enabled)}</div>
        </div>
        ${e.entities.map((t) => this._line(t.entity_id, [e], {
				name: z(this.hass, t.entity_id),
				button: null,
				open: n
			}))}
      </section>`;
		});
	}
	_compactList(e) {
		return e.map((e) => {
			let t = {
				kind: "program",
				programId: e.id
			}, n = e.entities.map((t) => ({
				entity: t.entity_id,
				next: this._next(t.entity_id, [e])
			})).filter((e) => e.next).sort((e, t) => Date.parse(e.next.at) - Date.parse(t.next.at)), r = this._expandedProgram === e.id;
			return x`<section class="compact-program"><div class="compact-row">
        <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" aria-expanded=${r} aria-controls=${`compact-${e.id}`}
          @click=${() => {
				this._expandedProgram = r ? null : e.id, this._edit = null;
			}}>
          <strong>${e.name}<ha-icon icon=${r ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></strong>${this._modeName(e)}
          ${n.length ? x`<span>${(() => {
				let e = V(this._data, n[0].next.label);
				return e ? H(this.hass, e) : wn(this.hass, this._lang, n[0].next.action);
			})()} · ${Fn(yt(n[0].next.at, this._tz, this._lang, this._now))}</span>` : x`${e.enabled ? x`<span>${A(this._lang, "hours")}</span>` : C}`}
        </button><div class="header-actions"><div class="header-icons">${this._programToggle(e)}
        ${r ? x`<button class="hours" aria-label=${A(this._lang, "hours")} title=${A(this._lang, "hours")}
          @click=${() => this._open(t)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : C}</div>
          ${this._disabledBadge(!e.enabled)}</div></div>
        ${r ? x`<div id=${`compact-${e.id}`} class="compact-details" role="region" aria-label=${e.name}>
          ${e.entities.map((n) => x`
            ${e.entities.length > 1 ? x`<strong class="compact-device">${z(this.hass, n.entity_id)}</strong>` : C}
            <div class="today"><span class="wname">${A(this._lang, "today_short")}</span>
              ${this._bar(n.entity_id, e, 0, "today", () => this._open(t))}</div>
            ${this._extras(t, n.entity_id, [e])}
          `)}
        </div>` : C}</section>`;
		});
	}
	render() {
		if (!this._config || !this.hass) return C;
		let e = this._lang, t = this._data, n = t ? Gt(t, this._config) : [];
		return x`
      <ha-card>
        ${this._config.title !== void 0 && this._config.title !== "" || t?.vacation ? x`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t?.vacation ? x`<span class="chip"><ha-icon icon="mdi:pause-circle-outline"></ha-icon> ${A(e, "vacation")}</span>` : C}
            </div>` : C}
        ${this._error ? x`<div class="error">${A(e, "error", { message: this._error })}</div>` : C}
        ${t?.read_only ? x`<div class="error">${A(e, "read_only")}</div>` : C}
        ${t ? C : x`<div class="empty">…</div>`}
        ${t && !n.length ? x`<div class="empty" role="status">${A(e, t.programs.length && this._config.program === void 0 ? "no_matching_program" : "no_program")}</div>` : C}
        ${t ? this._config.schedule_view === "list" ? this._compactList(n) : this._bySchedule(n) : C}
      </ha-card>
      ${this._snack ? x`<div class="snack" role="status"><span>${A(e, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${A(e, "undo")}</button></div>` : C}
      ${this._renderDialog()}`;
	}
	_renderDialog() {
		let e = this._dialog;
		if (!e || !this._data) return C;
		let t = () => this._dialog = null;
		if (e.kind === "schedule") return nt(Pi(e.scope), x`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope} .day=${e.day ?? null}
          .chart=${this._config.show_chart !== !1} @closed=${t}></wp-schedule>`);
	}
	static {
		this.styles = o`
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
	}
};
O([E({ attribute: !1 })], Z.prototype, "hass", void 0), O([D()], Z.prototype, "_config", void 0), O([D()], Z.prototype, "_data", void 0), O([D()], Z.prototype, "_error", void 0), O([D()], Z.prototype, "_dialog", void 0), O([D()], Z.prototype, "_preview", void 0), O([D()], Z.prototype, "_now", void 0), O([D()], Z.prototype, "_week", void 0), O([D()], Z.prototype, "_expandedProgram", void 0), O([D()], Z.prototype, "_charts", void 0), O([D()], Z.prototype, "_edit", void 0), O([D()], Z.prototype, "_snack", void 0), O([D()], Z.prototype, "_toggling", void 0), Z = O([T("weekly-planner-card")], Z);
// src/draft-history.ts
var $i = 50, ea = 700, ta = class {
	constructor() {
		this._past = [], this._future = [];
	}
	get canUndo() {
		return this._past.length > 0;
	}
	get canRedo() {
		return this._future.length > 0;
	}
	record(e, t, n, r = Date.now()) {
		JSON.stringify(e) !== JSON.stringify(t) && (n && n === this._group && this._recordedAt !== void 0 && r >= this._recordedAt && r - this._recordedAt <= ea || this._push(this._past, e), this._future = [], this._group = n || void 0, this._recordedAt = r);
	}
	undo(e) {
		if (this._resetGroup(), this.canUndo) return this._push(this._future, e), this._past.pop();
	}
	redo(e) {
		if (this._resetGroup(), this.canRedo) return this._push(this._past, e), this._future.pop();
	}
	clear() {
		this._past = [], this._future = [], this._resetGroup();
	}
	_push(e, t) {
		e.push(structuredClone(t)), e.length > $i && e.shift();
	}
	_resetGroup() {
		this._group = void 0, this._recordedAt = void 0;
	}
}, na = /* @__PURE__ */ new WeakMap();
async function ra(e, t) {
	let n = e.states[t], r = n?.attributes.icon;
	if (typeof r == "string" && r.startsWith("mdi:")) return r;
	let i = t.split(".")[0], a = na.get(e.connection);
	a || na.set(e.connection, a = /* @__PURE__ */ new Map());
	let o = a.get(i);
	o || (o = e.callWS({
		type: "frontend/get_icons",
		category: "entity_component",
		integration: i
	}).then((e) => e.resources?.[i] ?? {}), a.set(i, o));
	try {
		let e = await o, t = e[String(n?.attributes.device_class)]?.default ?? e._?.default;
		return t?.startsWith("mdi:") ? t : "mdi:calendar-clock";
	} catch {
		return a.delete(i), "mdi:calendar-clock";
	}
}
// src/program-settings.ts
var ia = (e, t) => JSON.stringify(e) === JSON.stringify(t), aa = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function oa(e, t, n) {
	if (ia(e, t)) return n;
	if (ia(e, n) || ia(t, n)) return t;
	if (aa(e) && aa(t) && aa(n)) {
		let r = {};
		for (let i of /* @__PURE__ */ new Set([
			...Object.keys(e),
			...Object.keys(t),
			...Object.keys(n)
		])) {
			let a = oa(e[i], t[i], n[i]);
			a !== void 0 && (r[i] = a);
		}
		return r;
	}
	if (Array.isArray(e) && Array.isArray(t) && Array.isArray(n)) {
		let r = [
			...e,
			...t,
			...n
		], i = ["id", "entity_id"].find((e) => r.length && r.every((t) => aa(t) && typeof t[e] == "string"));
		if (i) {
			let r = (e) => new Map(e.map((e) => [e[i], e])), a = r(e), o = r(t), s = r(n);
			return [.../* @__PURE__ */ new Set([
				...o.keys(),
				...s.keys(),
				...a.keys()
			])].map((e) => oa(a.get(e), o.get(e), s.get(e))).filter((e) => e !== void 0);
		}
	}
	throw Error("settings_conflict");
}
function sa(e, t, n) {
	return {
		...oa(e, {
			...t,
			revision: e.revision
		}, n),
		revision: n.revision
	};
}
// src/components/gestures.ts
function ca(e, t) {
	let n = e.states[t]?.attributes?.friendly_name;
	if (typeof n == "string" && n) return n;
	let r = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
	return r ? r.charAt(0).toUpperCase() + r.slice(1) : t;
}
var la = /* @__PURE__ */ new WeakSet();
function ua(e) {
	if (!e || la.has(e)) return;
	la.add(e);
	let t = () => {
		e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
	};
	e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
var da = "\n  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }\n  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }\n  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }\n", fa = () => [
	[],
	[],
	[],
	[],
	[],
	[],
	[]
];
function pa(e) {
	return e.map((e) => ({
		...structuredClone(e),
		id: B()
	}));
}
var Q = class extends w {
	constructor(...e) {
		super(...e), this.embedded = !1, this._iconCustomized = !1, this._applied = !1, this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._profileId = "", this._error = "", this._nameError = "", this._entitiesError = "", this._saving = !1, this._changingMode = !1, this._associationsOpen = !1, this._scheduleProfileId = null, this._hoursRevision = 0, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._history = new ta(), this._editingHistory = !1, this._iconEpoch = 0, this._historyKey = (e) => {
			if (e.defaultPrevented || e.altKey || !(e.ctrlKey || e.metaKey) || !this._p || this._saving || !this._canEdit() || e.composedPath().some((e) => e instanceof HTMLElement && (e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable))) return;
			let t = e.key.toLowerCase(), n = t === "z" && e.shiftKey || t === "y";
			(t === "z" || t === "y") && (e.preventDefault(), e.stopPropagation(), n ? this._redoDraft() : this._undoDraft());
		}, this._pickerKey = 0, this._servicesOpen = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("keydown", this._historyKey), this._picker || Jt().then((e) => this._picker = e);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("keydown", this._historyKey), this._applied = !1;
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
	_edit(e, t) {
		if (this._editingHistory) {
			e();
			return;
		}
		let n = this._snapshot();
		this._editingHistory = !0;
		try {
			e();
		} finally {
			this._editingHistory = !1;
		}
		this._history.record(n, this._snapshot(), t), this.requestUpdate();
	}
	_restore(e) {
		this._p = e.program, this._origin = e.origin, this._isNew = e.isNew, this._iconCustomized = e.iconCustomized, this._profileId = e.profileId, this._profileForm = e.profileForm, this._error = "", this._nameError = "", this._entitiesError = "", this._applied = !1, this._refreshIcon();
	}
	_undoDraft() {
		if (!this._canEdit() || this._saving) return;
		let e = this._history.undo(this._snapshot());
		e && this._restore(e);
	}
	_redoDraft() {
		if (!this._canEdit() || this._saving) return;
		let e = this._history.redo(this._snapshot());
		e && this._restore(e);
	}
	_changeProfileForm(e, t) {
		this._edit(() => {
			this._profileForm = e, this._applied = !1, this._error = "";
		}, t);
	}
	_refreshIcon() {
		let e = ++this._iconEpoch, t = this._p.entities[0]?.entity_id;
		!this._iconCustomized && t && ra(this.hass, t).then((n) => {
			e !== this._iconEpoch || this._iconCustomized || this._p.entities[0]?.entity_id !== t || (this._p = {
				...this._p,
				icon: n
			});
		});
	}
	get _lang() {
		return kn(this.hass);
	}
	_tr(e, t) {
		return A(this._lang, e, t);
	}
	willUpdate() {
		if (!this._ready && this.hass && this.data) {
			if (this._ready = !0, this._origin = this.program ? structuredClone(this.program) : void 0, this.program) this._p = structuredClone(this.program), this._isNew = !1;
			else {
				let e = B();
				this._p = {
					id: "",
					revision: 0,
					name: "",
					icon: "mdi:calendar-clock",
					priority: this.data.defaults?.priority ?? 10,
					enabled: !0,
					reapply: this.data.defaults?.reapply ?? !0,
					conditions: [],
					entities: [],
					active_profile: e,
					profiles: [{
						id: e,
						name: this._tr("profile_default"),
						days: fa()
					}]
				}, this._isNew = !0;
			}
			this._iconCustomized = !!(this.program?.icon && this.program.icon !== this._deviceIcon(this.program.entities[0]?.entity_id)), this._profileId = this._activeId(), this._tab = "general";
		}
	}
	_activeId() {
		let e = this._p, t = !this._isNew && this.data.status[e.id]?.active_profile || e.active_profile;
		return e.profiles.find((e) => e.id === t)?.id ?? e.profiles[0].id;
	}
	get _profile() {
		return this._p.profiles.find((e) => e.id === this._profileId) ?? this._p.profiles[0];
	}
	_deviceIcon(e) {
		let t = e ? this.hass.states[e]?.attributes.icon : void 0;
		return typeof t == "string" && t.startsWith("mdi:") ? t : "mdi:calendar-clock";
	}
	_setIcon(e) {
		this._edit(() => {
			this._iconCustomized = !!e, this._patch({ icon: e || this._deviceIcon(this._p.entities[0]?.entity_id) });
		}, "icon"), this._refreshIcon();
	}
	_patch(e, t) {
		this._edit(() => {
			e.entities && !this._iconCustomized && (e = {
				...e,
				icon: this._deviceIcon(e.entities[0]?.entity_id)
			}), this._p = {
				...this._p,
				...e
			}, this._error = "", "name" in e && (this._nameError = ""), e.entities && (this._entitiesError = ""), this._applied = !1;
		}, t), e.entities && this._refreshIcon();
	}
	_canEdit() {
		return this.data.can_edit && !this.data.read_only;
	}
	_setProfile(e) {
		this._patch({ profiles: this._p.profiles.map((t) => t.id === e.id ? e : t) });
	}
	_submitProfileForm() {
		let e = this._profileForm;
		if (!e) return !0;
		let t = e.name.trim(), n = this._p.profiles.some((n) => n.name === t && (e.mode !== "rename" || n.id !== this._profileId));
		return !t || n || t.length > 40 ? (this._error = this._tr("err_profile_name"), !1) : (this._edit(() => {
			if (e.mode === "rename") this._setProfile({
				...this._profile,
				name: t
			});
			else {
				let n = this._profile, r = {
					id: B(),
					name: t,
					days: e.mode === "copy" ? n.days.map(pa) : fa()
				};
				this._patch({ profiles: [...this._p.profiles, r] }), this._profileId = r.id;
			}
			this._profileForm = void 0, this._error = "";
		}), !0);
	}
	_deleteProfile() {
		this._edit(() => {
			let e = this._profile, t = this._p.profiles.filter((t) => t.id !== e.id), n = this._p.mode_source;
			this._patch({
				profiles: t,
				...n ? { mode_source: {
					...n,
					mappings: Object.fromEntries(Object.entries(n.mappings).filter(([, t]) => t !== e.id))
				} } : {}
			}), this._profileId = this._activeId(), t.some((e) => e.id === this._profileId) || (this._profileId = t[0].id);
		});
	}
	_setEntity(e, t) {
		this._patch({ entities: this._p.entities.map((n, r) => r === e ? {
			...n,
			...t
		} : n) });
	}
	_addEntity(e) {
		e && !this._p.entities.some((t) => t.entity_id === e) && (this._pickerKey += 1, this._servicesOpen = e, this._patch({ entities: [...this._p.entities, {
			entity_id: e,
			default_label: null,
			label_overrides: {},
			allowed_services: [],
			restrict_services: !0
		}] }));
	}
	_validate() {
		return this._problem()?.message ?? "";
	}
	_problem() {
		let e = this._p;
		if (!e.name.trim()) return {
			field: "name",
			message: this._tr("err_name")
		};
		if (!e.entities.length) return {
			field: "entities",
			message: this._tr("err_no_entity")
		};
		let t = this._validateRest();
		return t ? {
			field: "form",
			message: t
		} : void 0;
	}
	_validateRest() {
		let e = this._p;
		if (e.mode_source && (!e.mode_source.entity_id || !Object.keys(e.mode_source.mappings).length || Object.entries(e.mode_source.mappings).some(([t, n]) => !t.trim() || !e.profiles.some((e) => e.id === n)))) return this._tr("mode_incomplete");
		if (e.conditions.some((e) => !e.entity_id)) return this._tr("err_incomplete");
		let t = e.profiles.map((e) => e.name.trim());
		return new Set(t).size === t.length ? "" : this._tr("err_profile_name");
	}
	_payload() {
		let e = structuredClone(this._p), t = new Set(e.entities.map((e) => e.entity_id));
		return e.name = e.name.trim(), e.entities = e.entities.filter((e) => t.has(e.entity_id)), this._isNew && delete e.id, e;
	}
	_errorText(e) {
		let t = e, n = t?.message ?? String(e);
		return t?.code === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : t?.code === "unauthorized" ? this._tr("err_unauthorized") : n.includes("random_window_too_short") ? this._tr("random_too_short") : n.includes("overlapping_slots") ? this._tr("err_overlap_server") : n.includes("circular_mode_source") ? this._tr("mode_source_loop") : n.includes("controlled by an external") ? this._tr("mode_source_locked") : n.includes("unknown_mode_profile") ? this._tr("mode_incomplete") : n.includes("duplicate_profile_name") ? this._tr("err_profile_name") : this._tr("error", { message: n });
	}
	_showField(e) {
		this._isNew || (this._tab = e === "name" ? "general" : "entities"), this.updateComplete.then(() => {
			let t = this.renderRoot?.querySelector(e === "name" ? "#f-name" : "#pe-entity-add");
			t && (t.scrollIntoView?.({
				block: "center",
				behavior: "smooth"
			}), t.focus?.());
		});
	}
	_nameField() {
		let e = !!this._nameError;
		return x`<div class="field"><label for="f-name">${this._tr("pe_name")}</label>
      <input id="f-name" type="text" maxlength="60" .value=${this._p.name} aria-invalid=${e ? "true" : "false"}
        aria-describedby=${e ? "f-name-error" : C}
        @input=${(e) => this._patch({ name: e.target.value }, "name")} />
      ${e ? x`<p id="f-name-error" class="error field-error" role="alert">${this._nameError}</p>` : C}</div>`;
	}
	async _save() {
		if (!this._canEdit() || this._saving || !this._submitProfileForm()) return;
		let e = this._problem();
		if (e) this._p.mode_source && (this._associationsOpen = !0), this._error = "", this._nameError = "", this._entitiesError = "", e.field === "name" ? this._nameError = e.message : e.field === "entities" ? this._entitiesError = e.message : this._error = e.message, e.field !== "form" && this._showField(e.field);
		else {
			this._error = "", this._saving = !0;
			try {
				let e = this._payload(), t;
				for (let n = 0; n < 2; n++) {
					let r = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((t) => t.id === e.id);
					if (this._origin && !r) throw { code: "conflict" };
					let i = e;
					if (this._origin && r) try {
						i = sa(this._origin, e, r);
					} catch {
						throw { code: "conflict" };
					}
					try {
						t = (await this.hass.callWS({
							type: "weekly_planner/program/save",
							program: i
						})).program;
						break;
					} catch (e) {
						if (n || e.code !== "conflict") throw e;
					}
				}
				t && (this._p = structuredClone(t), this._origin = structuredClone(t), this._applied = !this._isNew, this._isNew = !1, ++this._iconEpoch, this._history.clear(), this.dispatchEvent(new CustomEvent("program-saved", {
					detail: t,
					bubbles: !0,
					composed: !0
				}))), this.embedded || this._close();
			} catch (e) {
				this._error = this._errorText(e);
			} finally {
				this._saving = !1;
			}
		}
	}
	async _askDelete() {
		await Pn(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete")) && await this._delete();
	}
	async _askDeleteProfile(e) {
		await Pn(this, this._tr("confirm_delete", { name: e.name }), this._tr("delete")) && this._deleteProfile();
	}
	async _askDeleteEntity(e) {
		let t = this._p.entities[e]?.entity_id;
		if (!t) return;
		let n = this._tr("confirm_delete", { name: ca(this.hass, t) });
		await Pn(this, n, this._tr("delete")) && this._patch({ entities: this._p.entities.filter((t, n) => n !== e) });
	}
	async _delete() {
		try {
			await this.hass.callWS({
				type: "weekly_planner/program/delete",
				program_id: this._p.id
			}), this.dispatchEvent(new CustomEvent("program-deleted", {
				detail: this._p.id,
				bubbles: !0,
				composed: !0
			})), this._close();
		} catch (e) {
			this._error = this._errorText(e);
		}
	}
	_duplicate() {
		this._edit(() => {
			let e = B(), t = this._p, n = /* @__PURE__ */ new Map(), r = t.profiles.map((t) => {
				let r = t.id === this._activeId() ? e : B();
				return n.set(t.id, r), {
					...structuredClone(t),
					id: r,
					days: t.days.map(pa)
				};
			});
			this._p = {
				...structuredClone(t),
				id: "",
				revision: 0,
				created_at: void 0,
				name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 60),
				profiles: r,
				active_profile: n.get(this._activeId()) ?? r[0].id,
				...t.mode_source ? { mode_source: {
					...t.mode_source,
					mappings: Object.fromEntries(Object.entries(t.mode_source.mappings).map(([e, t]) => [e, n.get(t) ?? t]))
				} } : {}
			}, delete this._p.created_at, this._isNew = !0, this._origin = void 0, this._applied = !1, this._profileId = this._p.active_profile ?? r[0].id, this._error = "";
		});
	}
	_close() {
		this.renderRoot.querySelector("#main")?.close();
	}
	_renderGeneral() {
		let e = this._p;
		return x`
      ${this._nameField()}
      <div class="field"><label for="f-area">${this._tr("pe_area")}</label>
        <input id="f-area" type="text" list="program-areas" .value=${e.area ?? ""} aria-describedby="program-area-help"
          @change=${(e) => this._patch({ area: e.target.value.trim() || null })} />
        <datalist id="program-areas">${[...new Set(this.data.programs.flatMap((e) => e.area ? [e.area] : []))].sort().map((e) => x`<option value=${e}></option>`)}</datalist>
        <p id="program-area-help" class="hint">${this._tr("pe_area_hint")}</p></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? x`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${e.icon ?? ""}
                @value-changed=${(e) => this._setIcon(e.detail.value || null)}></ha-selector>` : x`<div class="row" style="flex-wrap:nowrap">
                ${e.icon && customElements.get("ha-icon") ? x`<ha-icon .icon=${e.icon}></ha-icon>` : C}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${e.icon ?? ""}
                  @input=${(e) => this._setIcon(e.target.value.trim() || null)} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(e) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_icon_hint")}</p>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${e.reapply}
        @change=${(e) => this._patch({ reapply: e.target.checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${e.conditions}
        @wp-change=${(e) => {
			e.stopPropagation(), this._patch({ conditions: e.detail });
		}}></wp-conditions-editor>
    `;
	}
	updated() {
		On(this.renderRoot), ua(this.renderRoot.querySelector(".tabs"));
	}
	_renderEntities(e = !1) {
		let t = this._p;
		return x`
      ${t.entities.length === 0 ? x`<p class="muted">${this._tr("pe_no_entity")}</p>` : C}
      ${t.entities.map((t, n) => this._renderEntity(t, n, e))}
      ${nt(this._pickerKey, this._picker ? x`<ha-selector id="pe-entity-add" aria-invalid=${this._entitiesError ? "true" : "false"} aria-describedby=${this._entitiesError ? "pe-entities-error" : C} .hass=${this.hass} .selector=${{ entity: { exclude_entities: t.entities.map((e) => e.entity_id) } }}
            .label=${this._tr(t.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .value=${""} .required=${!t.entities.length}
            @value-changed=${(e) => {
			e.stopPropagation(), this._addEntity(e.detail.value ?? "");
		}}></ha-selector>` : x`<wp-entity-picker id="pe-entity-add" aria-describedby=${this._entitiesError ? "pe-entities-error" : C} .hass=${this.hass} .value=${""} .label=${this._tr(t.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .required=${!t.entities.length}
        .exclude=${t.entities.map((e) => e.entity_id)}
        @wp-change=${(e) => {
			e.stopPropagation(), this._addEntity(e.detail);
		}}></wp-entity-picker>`)}
      ${this._entitiesError ? x`<p id="pe-entities-error" class="error field-error" role="alert">${this._entitiesError}</p>` : C}
    `;
	}
	_renderServices(e, t) {
		let n = new Map(an(this.hass, e.entity_id).map((e) => [e.id, e])), r = [...this.data.labels.map((e) => e.action), ...Object.values(e.label_overrides ?? {})], i = [...e.allowed_services ?? [], ...r.flatMap((e) => e.kind === "service" && e.target_entity_id ? [e.service] : [])];
		for (let e of i) if (!n.has(e)) {
			let [t, r] = e.split(".");
			n.set(e, {
				id: e,
				domain: t,
				service: r,
				label: tn(this.hass, e)
			});
		}
		let a = [...n.values()].sort((e, t) => e.label.localeCompare(t.label));
		if (!a.length) return x`<p class="hint">${this._tr("pe_no_services")}</p>`;
		let o = e.allowed_services ?? [], s = !e.restrict_services && !o.length, c = (e) => s || o.includes(e), l = a.filter((e) => c(e.id)).length, u = this._isNew || this._servicesOpen === e.entity_id, d = (e, n) => {
			let r = new Set(s ? a.map((e) => e.id) : o);
			n ? r.add(e) : r.delete(e), this._setEntity(t, {
				allowed_services: [...r],
				restrict_services: !0
			});
		};
		return x`
      ${this._isNew ? x`<h3>${this._tr("pe_services")} · ${l}/${a.length}</h3>` : x`
        <button class="link" aria-expanded=${u} @click=${() => this._servicesOpen = u ? "" : e.entity_id}>
          <ha-icon icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${l === a.length ? this._tr("pe_services_all") : `${l}/${a.length}`}</button>`}
      ${l === 0 && e.restrict_services ? x`<p class="hint" role="status">${this._tr("pe_zero_services")}</p>` : C}
      ${u ? x`<p class="hint">${this._tr("pe_choose_services")}</p><div class="svc">${a.map((e) => {
			let n = nn(this.hass, e.id), r = `svc-name-${t}-${e.id}`, i = `svc-description-${t}-${e.id}`;
			return x`<label class="check svc-choice"><input type="checkbox" .checked=${c(e.id)}
          aria-labelledby=${r} aria-describedby=${n ? i : C}
          @change=${(t) => d(e.id, t.target.checked)} />
          <span class="svc-copy"><span id=${r}>${e.label}</span>
            ${n ? x`<span id=${i} class="svc-description">${n}</span>` : C}
          </span></label>`;
		})}</div>` : C}`;
	}
	_renderEntity(e, t, n = !1) {
		Qt(this.hass, on(this.hass, e.entity_id)).then((e) => e && this.requestUpdate());
		let r = this.data.programs.filter((t) => t.id !== this._p.id && t.entities.some((t) => t.entity_id === e.entity_id)).sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name)).map((e) => this._tr("pe_program_priority", {
			name: e.name,
			priority: String(e.priority)
		}));
		return x`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${ca(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? C : x`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${ca(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${r.length ? x`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: r.join(", ") })}</p>` : C}
        ${this._renderServices(e, t)}
      </div>`;
	}
	get _seasonsUnapplied() {
		return !!this._profileForm || !this._origin || JSON.stringify(this._p.profiles) !== JSON.stringify(this._origin.profiles) || JSON.stringify(this._p.mode_source) !== JSON.stringify(this._origin.mode_source);
	}
	async _changeActiveMode(e, t) {
		if (!(this._changingMode || this._seasonsUnapplied || this._origin?.mode_source)) {
			this._changingMode = !0, this._error = "";
			try {
				await this.hass.callWS({
					type: "weekly_planner/program/set_profile",
					program_id: this._p.id,
					profile_id: e
				});
			} catch (e) {
				this._error = this._errorText(e);
			} finally {
				this._changingMode = !1, t && (t.value = this._activeId());
			}
		}
	}
	_closeModeSchedule() {
		this._scheduleProfileId = null;
		let e = this.data.programs.find((e) => e.id === this._p.id);
		e && this._adoptModeSchedule(e);
	}
	_adoptModeSchedule(e) {
		e.id !== this._p.id || e.revision < this._hoursRevision || (this._hoursRevision = e.revision, this._p = {
			...this._p,
			profiles: structuredClone(e.profiles)
		}, this._origin &&= {
			...this._origin,
			profiles: structuredClone(e.profiles)
		});
	}
	_sourceState(e, t) {
		let n = this._p.mode_source;
		if (!n || e === t) return;
		if (Object.prototype.hasOwnProperty.call(n.mappings, t)) {
			this._error = this._tr("mode_duplicate_state");
			return;
		}
		let r = Object.fromEntries(Object.entries(n.mappings).map(([n, r]) => [n === e ? t : n, r]));
		this._patch({ mode_source: {
			...n,
			mappings: r
		} });
	}
	_renderModeSource() {
		let e = this._p.mode_source, t = e ? this.hass.states[e.entity_id] : void 0, n = this.data.status[this._p.id], r = this._p.profiles.find((e) => e.id === this._activeId())?.name ?? "", i = [.../* @__PURE__ */ new Set([
			...Array.isArray(t?.attributes.options) ? t.attributes.options : [],
			...t && !["unknown", "unavailable"].includes(t.state) ? [t.state] : [],
			...Object.keys(e?.mappings ?? {})
		])];
		return x`<div class="field"><label for="mode-control">${this._tr("mode_control")}</label>
      <select id="mode-control" .value=${e ? "external" : "manual"}
        @change=${(e) => {
			this._associationsOpen = !0, this._patch({ mode_source: e.target.value === "external" ? {
				entity_id: "",
				mappings: {}
			} : void 0 });
		}}>
        <option value="manual">${this._tr("mode_manual")}</option><option value="external">${this._tr("mode_external")}</option>
      </select></div>
      ${e ? x`<wp-entity-picker .hass=${this.hass} .value=${e.entity_id} .label=${this._tr("mode_source_entity")}
        @wp-change=${(t) => {
			t.stopPropagation(), t.detail !== e.entity_id && (this._associationsOpen = !0, this._patch({ mode_source: {
				entity_id: t.detail,
				mappings: {}
			} }));
		}}></wp-entity-picker>
        <p class="hint">${this._tr("mode_source_hint")}</p>
        ${e.entity_id ? x`
          <p class="hint">${this._tr("mode_source_current", { state: t ? this.hass.formatEntityState?.(t) ?? t.state : this._tr("value_unavailable") })}</p>
          <details class="mode-associations" .open=${this._associationsOpen}
            @toggle=${(e) => {
			this._associationsOpen = e.currentTarget.open;
		}}>
            <summary>${this._tr("mode_association_count", { n: String(Object.keys(e.mappings).length) })}</summary>
          ${Object.entries(e.mappings).map(([t, n], r) => x`<div class="card mode-mapping">
            ${this._picker ? x`<ha-selector .hass=${this.hass} .selector=${{ state: { entity_id: e.entity_id } }}
              .value=${t || void 0} .label=${this._tr("mode_source_state")}
              @value-changed=${(e) => {
			e.stopPropagation(), this._sourceState(t, e.detail.value ?? "");
		}}></ha-selector>` : x`<div class="field"><label for=${`mode-state-${r}`}>${this._tr("mode_source_state")}</label>
                <input id=${`mode-state-${r}`} list="mode-state-values" .value=${t}
                  @change=${(e) => this._sourceState(t, e.target.value)} /></div>`}
            <div class="field"><label for=${`mode-target-${r}`}>${this._tr("mode_source_target")}</label>
              <select id=${`mode-target-${r}`} data-value=${n} @change=${(n) => this._patch({ mode_source: {
			...e,
			mappings: {
				...e.mappings,
				[t]: n.target.value
			}
		} })}>
                ${this._p.profiles.some((e) => e.id === n) ? C : x`<option value=${n}>${this._tr("mode_removed")}</option>`}
                ${this._p.profiles.map((e) => x`<option value=${e.id}>${e.name}</option>`)}
              </select></div>
            <button class="btn danger" aria-label=${this._tr("mode_remove_mapping")} @click=${() => this._patch({ mode_source: {
			...e,
			mappings: Object.fromEntries(Object.entries(e.mappings).filter(([e]) => e !== t))
		} })}>
              <ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>
          </div>`)}
          <datalist id="mode-state-values">${i.map((e) => x`<option value=${e}></option>`)}</datalist>
          <button class="btn" ?disabled=${Object.prototype.hasOwnProperty.call(e.mappings, "")} @click=${() => this._patch({ mode_source: {
			...e,
			mappings: {
				...e.mappings,
				"": this._profileId
			}
		} })}>
            <ha-icon icon="mdi:plus"></ha-icon>${this._tr("mode_add_mapping")}</button>
          </details>
        ` : C}
        ${!this._seasonsUnapplied && n?.mode_source_status && n.mode_source_status !== "matched" ? x`<p class="hint" role="status">${this._tr("mode_source_kept", { name: r })}</p>` : C}
      ` : this._isNew ? C : x`<section class="mode-live"><div class="field"><label for="mode-active">${this._tr("mode_active_immediate")}</label>
        <select id="mode-active" data-value=${this._activeId()} aria-describedby="mode-live-help" ?disabled=${this._seasonsUnapplied || this._changingMode}
          @change=${(e) => void this._changeActiveMode(e.target.value, e.target)}>
          ${this._p.profiles.map((e) => x`<option value=${e.id}>${e.name}</option>`)}
        </select></div><p id="mode-live-help" class="hint">${this._tr("mode_active_immediate_hint")}</p></section>`}`;
	}
	_renderSeasons() {
		let e = this._p, t = this._profile, n = this._activeId(), r = this._profileForm;
		return x`
      <p class="hint">${this._tr("profile_explanation")}</p>
      ${this._isNew ? C : x`<p class="active-profile" role="status"><ha-icon icon="mdi:star"></ha-icon>
        ${this._tr("profile_current", { name: this._origin?.profiles.find((e) => e.id === n)?.name ?? t.name })}</p>`}
      ${this._renderModeSource()}
      ${this._seasonsUnapplied ? x`<p class="hint">${this._tr("profile_apply_first")}</p>` : C}
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile_manage")}</label>
          <select id="f-profile" data-value=${t.id} ?disabled=${!!r} @change=${(e) => {
			this._profileId = e.target.value;
		}}>
            ${e.profiles.map((e) => x`<option value=${e.id} ?selected=${e.id === t.id}>${e.name}${e.id === n ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
      </div>
      <p class="hint">${this._tr("profile_draft_hint")}</p>
      <button class="btn" ?disabled=${this._seasonsUnapplied} @click=${() => {
			this._scheduleProfileId = t.id;
		}}>
        <ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("mode_edit_hours")}</button>
      <div class="row season-actions">
        <button class="btn" ?disabled=${!!r}
          @click=${() => this._changeProfileForm({
			mode: "add",
			name: ""
		})}><ha-icon icon="mdi:plus"></ha-icon>${this._tr("profile_add")}</button>
        <button class="btn" ?disabled=${!!r}
          @click=${() => this._changeProfileForm({
			mode: "rename",
			name: t.name
		})}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("profile_rename")}</button>
        <button class="btn" ?disabled=${!!r}
          @click=${() => this._changeProfileForm({
			mode: "copy",
			name: `${t.name} ${this._tr("copy_suffix")}`.slice(0, 40)
		})}><ha-icon icon="mdi:content-copy"></ha-icon>${this._tr("profile_copy")}</button>
      </div>
      ${t.id === n ? x`<p class="hint">${this._tr("profile_active_hint")}</p>` : C}
      ${r ? x`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(r.mode === "rename" ? "profile_rename" : r.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${r.name}
                @input=${(e) => this._changeProfileForm({
			...r,
			name: e.target.value
		}, "season-name")}
                @keydown=${(e) => {
			e.key === "Enter" && (e.preventDefault(), this._save());
		}} /></div>
            ${r.mode === "rename" ? x`<p class="hint">${this._tr("profile_rename_warning")}</p>` : C}
            <button class="btn" @click=${() => this._changeProfileForm(void 0)}>${this._tr("profile_discard_edit")}</button>
          </div>` : C}
      <div class="season-delete"><button class="btn danger"
        ?disabled=${!!r || e.profiles.length < 2 || t.id === n}
        @click=${() => void this._askDeleteProfile(t)}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("profile_delete")}</button></div>
    `;
	}
	_tabKey(e, t) {
		let n = t.findIndex(([e]) => e === this._tab), r = e.key === "ArrowRight" ? (n + 1) % t.length : e.key === "ArrowLeft" ? (n + t.length - 1) % t.length : e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : -1;
		r < 0 || (e.preventDefault(), this._tab = t[r][0], this.updateComplete.then(() => this.renderRoot.querySelector(`#pe-tab-${this._tab}`)?.focus()));
	}
	render() {
		if (!this._p) return C;
		let e = [
			["general", "tab_general"],
			["entities", "tab_entities"],
			["seasons", "tab_seasons"]
		], t = this._canEdit(), n = x`
      ${t ? C : x`<p class="error" role="alert">${this._tr("read_only")}</p>`}
      <fieldset ?disabled=${!t || this._saving}>
        <div class="history" role="group" aria-label=${this._tr("pe_history")}>
          <button class="btn" aria-label=${this._tr("pe_undo")} title=${this._tr("pe_undo")} ?disabled=${!this._history.canUndo} @click=${() => this._undoDraft()}>
            <ha-icon icon="mdi:undo"></ha-icon>${this._isNew ? C : this._tr("pe_undo")}</button>
          <button class="btn" aria-label=${this._tr("pe_redo")} title=${this._tr("pe_redo")} ?disabled=${!this._history.canRedo} @click=${() => this._redoDraft()}>
            <ha-icon icon="mdi:redo"></ha-icon>${this._isNew ? C : this._tr("pe_redo")}</button>
        </div>
        ${this._isNew ? x`<p class="hint">${this._tr("pe_create_hint")}</p>
          ${this._nameField()}
          <h3>${this._tr("tab_entities")}</h3>${this._renderEntities(!0)}` : x`
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([t, n]) => x`<button id=${`pe-tab-${t}`} role="tab" aria-controls="pe-panel" tabindex=${this._tab === t ? 0 : -1} aria-selected=${this._tab === t} class="tab ${this._tab === t ? "on" : ""}"
            @keydown=${(t) => this._tabKey(t, e)} @click=${() => this._tab = t}>${this._tr(n)}</button>`)}
        </div>
        <div id="pe-panel" role="tabpanel" aria-labelledby=${`pe-tab-${this._tab}`}>
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>`}
      </fieldset>`, r = this._error ? x`<p class="error" role="alert">${this._error}</p>` : C, i = x`
      <button class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>
        ${this._tr(this._isNew ? "pe_create" : this.embedded ? "ce_apply_program" : "save")}</button>
      ${this.embedded ? C : x`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>`}`, a = x`
      ${this._isNew ? C : x`<button class="btn" ?disabled=${!t || this._saving || !!this._profileForm} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
      ${this._isNew ? C : x`<button class="btn danger" ?disabled=${!t || this._saving || !!this._profileForm}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>`}`, o = !!this._profileForm || (this._origin ? JSON.stringify(this._p) !== JSON.stringify(this._origin) : !!(this._p.name || this._p.entities.length));
		return this.embedded ? x`<section class="embedded">${n}
      ${o && !this._isNew ? x`<p role="status" class="hint">${this._tr("pe_unapplied")}</p>` : C}
      <p class="hint">${this._tr(this._isNew ? "pe_create_save_hint" : "pe_shared_save_hint")}</p>
      ${r}
      <div class="actions apply-bar">${i}</div><div class="actions secondary-actions">${a}</div>
      ${this._applied ? x`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : C}
      ${this._scheduleProfileId ? x`<wp-schedule .hass=${this.hass} .data=${this.data}
        .scope=${{
			kind: "program",
			programId: this._p.id
		}} .profileId=${this._scheduleProfileId} .chart=${!1}
        @schedule-program-saved=${(e) => {
			e.stopPropagation(), this._adoptModeSchedule(e.detail);
		}}
        @closed=${(e) => {
			e.stopPropagation(), this._closeModeSchedule();
		}}></wp-schedule>` : C}
    </section>` : x`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${n}${r}<div slot="footer" class="actions">${i}${a}</div>
    </wp-dialog>`;
	}
	static {
		this.styles = [U, o`
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
      ${a(da)}
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
    `];
	}
};
O([E({ attribute: !1 })], Q.prototype, "hass", void 0), O([E({ attribute: !1 })], Q.prototype, "data", void 0), O([E({ attribute: !1 })], Q.prototype, "program", void 0), O([E({ type: Boolean })], Q.prototype, "embedded", void 0), O([D()], Q.prototype, "_applied", void 0), O([E({ attribute: !1 })], Q.prototype, "defaultTypes", void 0), O([D()], Q.prototype, "_p", void 0), O([D()], Q.prototype, "_isNew", void 0), O([D()], Q.prototype, "_tab", void 0), O([D()], Q.prototype, "_profileId", void 0), O([D()], Q.prototype, "_error", void 0), O([D()], Q.prototype, "_nameError", void 0), O([D()], Q.prototype, "_entitiesError", void 0), O([D()], Q.prototype, "_saving", void 0), O([D()], Q.prototype, "_changingMode", void 0), O([D()], Q.prototype, "_associationsOpen", void 0), O([D()], Q.prototype, "_scheduleProfileId", void 0), O([D()], Q.prototype, "_picker", void 0), O([D()], Q.prototype, "_profileForm", void 0), O([D()], Q.prototype, "_servicesOpen", void 0), Q = O([T("wp-program-editor")], Q);
// src/program-areas.ts
function ma(e, t) {
	return [...new Set([...e.map((e) => e.area), t].filter((e) => typeof e == "string" && e.length > 0))].sort((e, t) => e.localeCompare(t));
}
// src/domains.ts
function ha(e, t = []) {
	return [.../* @__PURE__ */ new Set([...e.flatMap((e) => e.entities.map((e) => e.entity_id.split(".")[0])), ...t])].filter(Boolean).sort();
}
var ga = /* @__PURE__ */ new Map();
function _a(e, t, n = "mdi:shape-outline") {
	let r = ga.get(t);
	return r || (r = Promise.resolve().then(() => e.callWS({
		type: "frontend/get_icons",
		category: "entity_component",
		integration: t
	})).then((e) => e?.resources?.[t]?._?.default ?? n).catch(() => (ga.delete(t), n)), ga.set(t, r)), r;
}
// src/filter-editor.ts
var va = (e) => [...new Set(e.entities.map((e) => Ht(e.entity_id)))];
function ya(e, t, n = [e]) {
	let r = t?.types;
	return (!r?.length || va(e).some((e) => r.includes(e))) && (t?.programs === void 0 || Wt(n, t.programs).has(e.id));
}
function ba(e, t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = (e) => {
		let t = i.get(e);
		return t || i.set(e, t = {
			type: e,
			label: n(e) || e,
			programs: []
		}), t;
	};
	for (let t of e) for (let e of va(t)) a(e).programs.push({
		id: t.id,
		name: t.name
	});
	for (let e of t?.types ?? []) e && a(e);
	let o = [...i.values()].sort((e, t) => e.label.localeCompare(t.label, r) || e.type.localeCompare(t.type));
	for (let e of o) e.programs.sort((e, t) => e.name.localeCompare(t.name, r) || e.id.localeCompare(t.id));
	return {
		groups: o,
		orphans: Sa(e, t)
	};
}
function xa(e, t, n) {
	return e.map((e) => ({
		id: e.id,
		name: e.name,
		domains: va(e),
		devices: e.entities.map((e) => t(e.entity_id))
	})).sort((e, t) => e.name.localeCompare(t.name, n) || e.id.localeCompare(t.id));
}
var Sa = (e, t) => (t?.programs ?? []).filter((t) => !Wt(e, [t]).size);
function Ca(e, t, n) {
	if (!e.programs.length) return !n?.types?.length || n.types.includes(e.type) ? "on" : "off";
	let r = new Map(t.map((e) => [e.id, e])), i = e.programs.filter((e) => r.get(e.id) && ya(r.get(e.id), n, t)).length;
	return i === 0 ? "off" : i === e.programs.length ? "on" : "partial";
}
function wa(e, t, n, r) {
	let i = Sa(e, t), a = t?.types ?? [], o = { programs: [...e.map((e) => e.id).filter((e) => n.has(e)), ...i] };
	return a.length && (o.types = [.../* @__PURE__ */ new Set([...a, ...r])]), o;
}
var Ta = (e, t) => new Set(e.filter((n) => ya(n, t, e)).map((e) => e.id));
function Ea(e, t, n, r) {
	let i = Ta(e, t), a = e.find((e) => e.id === n);
	return r ? i.add(n) : i.delete(n), wa(e, t, i, r && a ? va(a) : []);
}
function Da(e, t, n, r) {
	let i = Ta(e, t), a = e.filter((e) => va(e).includes(n));
	for (let e of a) r ? i.add(e.id) : i.delete(e.id);
	let o = wa(e, t, i, r ? [n] : []);
	return !r && !a.length && o.types && (o.types = o.types.filter((e) => e !== n)), o;
}
var Oa = () => ({
	types: void 0,
	programs: void 0
});
function ka(e, t) {
	return wa(e, t, /* @__PURE__ */ new Set(), []);
}
function Aa(e, t, n) {
	if (e.program !== void 0) {
		let { filter: t, ...r } = e;
		return {
			...r,
			program: n.id
		};
	}
	let r = t.some((e) => e.id === n.id) ? t : [...t, n], i = { ...e.filter ?? {} };
	return i.area && n.area !== i.area && delete i.area, ya(n, i, r) || (i = {
		...i,
		...Ea(r, i, n.id, !0)
	}), {
		...e,
		filter: i
	};
}
// src/card-editor.ts
var ja = 1500, Ma = (e) => JSON.stringify(e, (e, t) => t && typeof t == "object" && !Array.isArray(t) ? Object.fromEntries(Object.entries(t).sort(([e], [t]) => e.localeCompare(t))) : t), $ = class extends w {
	constructor(...e) {
		super(...e), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._section = "display", this._editing = null, this._leftAll = !1, this._typeIcons = /* @__PURE__ */ new Map(), this._iconKey = "", this._createdName = "", this._createdProgramId = null, this._scheduleProgramId = null, this._editors = /* @__PURE__ */ new Map(), this._domainLoadKey = "", this._tabKey = (e) => {
			[
				"ArrowLeft",
				"ArrowRight",
				"Home",
				"End"
			].includes(e.key) && (e.preventDefault(), this._section = e.key === "Home" ? "display" : e.key === "End" || this._section === "display" ? "programs" : "display", this.updateComplete.then(() => this.renderRoot.querySelector(`#ce-tab-${this._section}`)?.focus()));
		};
	}
	setConfig(e) {
		let t = Xi(e), n = this._sent;
		if (n && Date.now() < n.until) {
			let e = Ma(t);
			if (e === n.config) return;
			if (e === n.previous && n.resent < 5) {
				n.resent += 1, this._dispatch(this._config);
				return;
			}
		}
		this._sent = void 0, this._config.program !== t.program && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._config = { ...t };
	}
	get _lang() {
		return kn(this.hass);
	}
	_tr(e, t) {
		return A(this._lang, e, t);
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate();
	}
	updated() {
		On(this.renderRoot), this._loadDomainNames(), this.isConnected && this.hass && !this._unsub && (this._unsub = Vt(this.hass, (e) => this._setData(e)));
	}
	_setData(e) {
		let t = this._justCreated;
		t && (e.programs.some((e) => e.id === t.id) ? this._justCreated = void 0 : e = {
			...e,
			programs: [...e.programs, t]
		}), this._data = e, this._programs = e.programs.map((e) => ({
			id: e.id,
			name: e.name
		}));
	}
	_loadDomainNames() {
		if (this.hass && this._data && this._loadDomainIcons(ha(this._data.programs, this._config.filter?.types)), !this.hass?.loadBackendTranslation || !this._data) return;
		let e = ha(this._data.programs, this._config.filter?.types), t = `${this._lang}|${e.join(",")}`;
		t !== this._domainLoadKey && (this._domainLoadKey = t, this._domainLocalize = void 0, e.length && this.hass.loadBackendTranslation("title", e).then((e) => {
			t === this._domainLoadKey && (this._domainLocalize = e, this.requestUpdate());
		}).catch(() => {
			t === this._domainLoadKey && (this._domainLoadKey = "");
		}));
	}
	_loadDomainIcons(e) {
		let t = e.join(",");
		t !== this._iconKey && e.length && (this._iconKey = t, Promise.all(e.map(async (e) => [e, await _a(this.hass, e)])).then((e) => {
			this._typeIcons = new Map(e);
		}));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsub?.(), this._unsub = void 0;
	}
	_saved(e) {
		e.stopPropagation();
		let t = e.detail, n = e.currentTarget, r = [...this._editors].find(([, e]) => e === n)?.[0], i = this._editing ?? this._config.program ?? "", a = r === i;
		r !== void 0 && (this._editors.delete(r), this._editors.set(t.id, n));
		let o = a && i === "new";
		if (this._data && this._setData({
			...this._data,
			programs: [...this._data.programs.filter((e) => e.id !== t.id), t]
		}), o && (this._justCreated = t), o) this._emit(Aa(this._config, this._data?.programs ?? [t], t));
		else if (a && i !== t.id) {
			let e = {
				...this._config,
				program: t.id
			};
			delete e.filter, this._emit(e);
		}
		a && (this._editing = t.id), a && i === "new" && (this._createdName = t.name, this._createdProgramId = t.id, this._section = "display");
	}
	_programEditor(e, t) {
		let n = this._editors.get(e);
		return n || (n = document.createElement("wp-program-editor"), n.embedded = !0, n.addEventListener("program-saved", (e) => this._saved(e)), n.addEventListener("program-deleted", (e) => {
			e.stopPropagation();
			let t = e.detail;
			this._editors.delete(t), this._justCreated?.id === t && (this._justCreated = void 0), this._editing = "", this._config.program === t && this._setMode(!1);
		}), this._editors.set(e, n)), n.hass = this.hass, n.data = this._data, n.program = t, n;
	}
	_settings() {
		let e = this._data;
		if (!e || !this.hass?.user?.is_admin || !e.can_edit || e.read_only) return C;
		let t = e.programs, n = this._editing ?? (this._isProgram && this._config.program ? this._config.program : ""), r = e.programs.find((e) => e.id === n);
		return x`<section class="program-settings">
      <h3>${this._tr(n === "new" ? "new_program" : "ce_program_settings")}</h3>
      <div class="field"><label for="ce-settings-program">${this._tr("ce_edit_program")}</label>
        <select id="ce-settings-program" data-value=${n} @change=${(e) => {
			let t = e.target.value;
			t === "new" ? this._newProgram() : this._editing = t;
		}}>
          <option value="" ?selected=${!n}>${this._tr("ce_choose_program")}</option>
          <hr />
          <option value="new" ?selected=${n === "new"}>${this._tr(this._editors.has("new") && n !== "new" ? "ce_resume_creation" : "new_program")}</option>
          <hr />
          ${t.map((e) => x`<option value=${e.id} ?selected=${n === e.id}>${e.name}</option>`)}
        </select>
      </div>
      ${n === "new" || r ? this._programEditor(n, r) : C}
    </section>`;
	}
	get _canManage() {
		return !!(this.hass?.user?.is_admin && this._data?.can_edit && !this._data?.read_only);
	}
	_newProgram() {
		this._createdName = "", this._createdProgramId = null, this._editing = "new", this._section = "programs", this.updateComplete.then(() => this.renderRoot.querySelector("#ce-settings-program")?.focus());
	}
	_emit(e) {
		let t = Qi(e);
		this._sent = {
			config: Ma(t),
			previous: Ma(this._config),
			until: Date.now() + ja,
			resent: 0
		}, this._config = t, this._dispatch(t);
	}
	_dispatch(e) {
		this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: e },
			bubbles: !0,
			composed: !0
		}));
	}
	_set(e, t) {
		let n = { ...this._config };
		t === void 0 || t === "" || t === null ? delete n[e] : n[e] = t, e === "program" && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._emit(n);
	}
	get _isProgram() {
		return this._config.program !== void 0;
	}
	_setMode(e) {
		this._editing = null, this._leftAll = !1;
		let t = { ...this._config };
		e ? (delete t.filter, t.program = this._programs[0]?.id ?? "") : (delete t.program, t.filter = {
			...t.filter,
			types: t.filter?.types ?? []
		}), this._emit(t);
	}
	_setFilter(e) {
		let t = {
			...this._config.filter ?? {},
			...e
		};
		for (let e of ["types", "programs"]) t[e] === void 0 && delete t[e];
		t.types?.length || delete t.types, t.area || delete t.area;
		let n = {
			...this._config,
			filter: t
		};
		this._emit(n);
	}
	_typeLabel(e) {
		return this.hass?.localize?.(`component.${e}.title`) || this._domainLocalize?.(`component.${e}.title`) || e;
	}
	_switch(e, t, n, r = !1, i = !1) {
		return x`<ha-switch class=${r ? "partial" : ""} .checked=${e} .disabled=${i} aria-label=${t}
      @change=${(e) => n(e.target.checked)}></ha-switch>`;
	}
	_treeChange(e) {
		let t = this._config.filter, n = t?.programs === void 0 && !t?.types?.length;
		e.programs === void 0 ? this._leftAll = !1 : n && (this._leftAll = !0), this._setFilter(e);
	}
	_displayPrograms() {
		let e = this._config.filter, t = this._data?.programs ?? [], n = e?.programs === void 0 && !e?.types?.length, { groups: r, orphans: i } = ba(t, e, (e) => this._typeLabel(e), this._lang), a = new Map(t.map((e) => [e.id, e])), o = xa(t, (e) => this.hass ? z(this.hass, e) : e, this._lang), s = n ? this._tr("ce_all_programs") : this._tr("ce_of_total", {
			on: String(t.filter((n) => ya(n, e, t)).length + i.length),
			total: String(t.length + i.length)
		});
		return x`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${s}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_all_programs")}</span>
        ${this._switch(n, this._tr("ce_all_programs"), (n) => this._treeChange(n ? Oa() : ka(t, e)))}</div>
      ${!n && this._leftAll ? x`<div class="notice" role="status"><ha-icon icon="mdi:information-outline"></ha-icon>
        <span class="grow">${this._tr("ce_left_all")}</span>
        <button class="btn" @click=${() => this._treeChange(Oa())}><ha-icon icon="mdi:restore"></ha-icon>${this._tr("ce_back_all")}</button></div>` : C}
      ${!o.length && !i.length ? x`<p class="hint">${this._tr("ce_no_types")}</p>` : C}
      ${r.length ? x`<div class="quick" role="group" aria-label=${this._tr("ce_quick_types")}>
        <div class="label">${this._tr("ce_quick_types")}</div>
        <p class="hint">${this._tr("ce_quick_types_hint")}</p>
        <div class="chips">${r.map((n) => {
			let r = Ca(n, t, e), i = n.programs.filter((n) => ya(a.get(n.id), e, t)).length, o = n.programs.length ? String(this._tr("ce_type_count", {
				on: String(i),
				total: String(n.programs.length)
			})) : "", s = this._tr("ce_type_chip", { type: n.label });
			return x`<button class="chip ${r}" data-type=${n.type} aria-pressed=${r === "on" ? "true" : r === "partial" ? "mixed" : "false"}
            aria-label=${o ? `${s} (${o})` : s}
            @click=${() => this._treeChange(Da(t, e, n.type, r === "off"))}>
            <ha-icon icon=${this._typeIcons.get(n.type) ?? "mdi:shape-outline"}></ha-icon>${n.label}${o ? x` <span class="count">${o}</span>` : C}</button>`;
		})}</div>
      </div>` : C}
      <div class="label">${this._tr("ce_programs_list")}</div>
      <div class="program-list" role="group" aria-label=${this._tr("ce_display_programs")}>
        ${o.map((n) => x`<div class="switch-row program-row" data-program=${n.id}>
          <span class="grow titles"><span class="type-title">${n.name}</span>
            <span class="type-names">${n.domains.map((e) => x`<ha-icon class="mini" icon=${this._typeIcons.get(e) ?? "mdi:shape-outline"}></ha-icon>`)}${n.devices.length ? n.devices.join(", ") : this._tr("ce_no_device")}</span></span>
          ${this._switch(ya(a.get(n.id), e, t), n.name, (r) => this._treeChange(Ea(t, e, n.id, r)))}</div>`)}
        ${i.length ? x`<div class="label">${this._tr("ce_other_programs")}</div>${i.map((t) => x`<div class="switch-row"><span class="grow">${t}</span>
          ${this._switch(!0, t, () => this._treeChange({ programs: (e?.programs ?? []).filter((e) => e !== t) }))}</div>`)}` : C}
      </div>
    </details>`;
	}
	render() {
		let e = this._config, t = ma(this._data?.programs ?? [], e.filter?.area), n = x`
      ${this._createdName ? x`<div class="created-next-step"><p class="hint" role="status">${this._tr("ce_created", { name: this._createdName })}</p>
        <button class="btn primary" @click=${() => {
			this._scheduleProgramId = this._createdProgramId;
		}}><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_define_schedule")}</button></div>` : C}
      ${this._editors.has("new") ? x`<p class="hint" role="status">${this._tr("ce_draft_kept")}</p>` : C}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(e) => this._set("title", e.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? x`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${e.program ?? ""} @change=${(e) => this._set("program", e.target.value)}>
              ${this._programs.length === 0 ? x`<option value="">${this._tr("no_program")}</option>` : C}
              ${!this._programs.some((t) => t.id === e.program) && e.program ? x`<option value=${e.program} selected>${e.program}</option>` : C}
              ${this._programs.map((t) => x`<option value=${t.id} ?selected=${t.id === e.program}>${t.name}</option>`)}
            </select>
            ${this._canManage ? x`<div class="program-actions">
              <button class="btn" @click=${this._newProgram}><ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>
              ${e.program ? x`<button class="btn" @click=${() => {
			this._editing = e.program, this._section = "programs";
		}}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("ce_edit_selected")}</button>` : C}
            </div>` : C}</div>` : x`
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <select id="ce-area" data-value=${e.filter?.area ?? ""} aria-describedby="ce-area-help"
                @change=${(e) => this._setFilter({ area: e.target.value })}>
                <option value="">${this._tr("ce_all_areas")}</option>
                ${t.map((e) => x`<option value=${e}>${e}</option>`)}
              </select><p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>
            ${this._displayPrograms()}`}

      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${e.schedule_view ?? "bars"} @change=${(e) => this._set("schedule_view", e.target.value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
        </select>
      </div>
      <div class="switch-row"><span class="grow">${this._tr("ce_show_chart")}</span>
        ${this._switch(e.show_chart !== !1, this._tr("ce_show_chart"), (e) => this._set("show_chart", e))}</div>
      <p class="hint">${this._tr("ce_show_chart_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_chart_open")}</span>
        ${this._switch(e.chart_collapsed === !1, this._tr("ce_chart_open"), (e) => this._set("chart_collapsed", !e), !1, e.show_chart === !1)}</div>
      <p class="hint">${this._tr("ce_chart_open_hint")}</p>
    `, r = this._canManage;
		return x`
      ${r ? x`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button id="ce-tab-display" role="tab" aria-controls="ce-panel" tabindex=${this._section === "display" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "display"} @click=${() => {
			this._section = "display";
		}}>${this._tr("ce_display")}</button>
        <button id="ce-tab-programs" role="tab" aria-controls="ce-panel" tabindex=${this._section === "programs" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "programs"} @click=${() => {
			this._section = "programs";
		}}>${this._tr("ce_program_settings")}</button>
      </nav>` : C}
      <div id="ce-panel" role="tabpanel" aria-labelledby=${r ? `ce-tab-${this._section}` : C}>${r && this._section === "programs" ? this._settings() : n}</div>
      ${this._scheduleProgramId && this._data?.programs.some((e) => e.id === this._scheduleProgramId) ? x`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${{
			kind: "program",
			programId: this._scheduleProgramId
		}} .chart=${!1}
        @closed=${(e) => {
			e.stopPropagation(), this._scheduleProgramId = null;
		}}></wp-schedule>` : C}`;
	}
	static {
		this.styles = [U, o`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 16px; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .switch-row { display: flex; align-items: center; gap: 8px; min-height: 48px; overflow-wrap: anywhere; } .type-head { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; min-height: 48px; border: 0; background: none; color: inherit; text-align: start; cursor: pointer; } .type-body[hidden] { display: none; } ha-switch { padding: 12px 8px; margin: -12px -8px; flex: none; } ha-switch.partial { --mdc-theme-secondary: var(--warning-color, #ffa600); } .type-icon { flex: none; color: var(--secondary-text-color); } .titles { display: flex; flex-direction: column; flex: 1 1 0; min-width: 0; } .type-title { font-size: 16px; overflow-wrap: normal; word-break: keep-all; } .type-names { font-size: 14px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .mini { --mdc-icon-size: 16px; vertical-align: -3px; margin-inline-end: 4px; } .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; } .chip { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 22px; background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; } .chip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); } .chip.partial { border: 2px dashed var(--primary-color); } .chip .count { font-size: 13px; opacity: .85; } .chip.on .count { opacity: 1; } .quick .hint { margin: 0; } .count { font-size: 14px; color: var(--secondary-text-color); } .count b { color: var(--primary-text-color); } .type-head.static { cursor: default; } .chev-space { flex: none; width: 24px; } .notice { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 8px 0; padding: 8px 12px; border-radius: 8px; background: var(--secondary-background-color); border-inline-start: 4px solid var(--warning-color, #ffa600); line-height: 1.5; } .notice .grow { flex: 1 1 10em; min-width: 10em; } .notice .btn { flex: 1 1 100%; box-sizing: border-box; min-width: 0; max-width: 100%; min-height: 44px; height: auto; white-space: normal; text-align: center; overflow-wrap: anywhere; } .program-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }`];
	}
};
O([E({ attribute: !1 })], $.prototype, "hass", void 0), O([D()], $.prototype, "_config", void 0), O([D()], $.prototype, "_programs", void 0), O([D()], $.prototype, "_data", void 0), O([D()], $.prototype, "_section", void 0), O([D()], $.prototype, "_editing", void 0), O([D()], $.prototype, "_leftAll", void 0), O([D()], $.prototype, "_typeIcons", void 0), O([D()], $.prototype, "_createdName", void 0), O([D()], $.prototype, "_createdProgramId", void 0), O([D()], $.prototype, "_scheduleProgramId", void 0), $ = O([T("weekly-planner-card-editor")], $), window.customCards = window.customCards || [], window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
	type: "weekly-planner-card",
	name: "Weekly Planner",
	description: "Weekly schedules for thermostats, covers, lights and more.",
	preview: !1
});
