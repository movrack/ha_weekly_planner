// src/timeline-geometry.ts
var e = {
	label: 36,
	gap: 8,
	right: 0
};
function t(t) {
	let n = e.label + e.gap, r = t - e.right;
	return {
		left: n,
		right: r,
		width: r - n
	};
}
function n(e, n, r, i) {
	let a = t(e);
	return a.left + (n - r) / (i - r) * a.width;
}
// node_modules/@lit/reactive-element/css-tag.js
var r = globalThis, i = r.ShadowRoot && (r.ShadyCSS === void 0 || r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, a = Symbol(), o = /* @__PURE__ */ new WeakMap(), s = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== a) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (i && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = o.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && o.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, c = (e) => new s(typeof e == "string" ? e : e + "", void 0, a), l = (e, ...t) => new s(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, a), u = (e, t) => {
	if (i) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), i = r.litNonce;
		i !== void 0 && t.setAttribute("nonce", i), t.textContent = n.cssText, e.appendChild(t);
	}
}, d = i ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return c(t);
})(e) : e, { is: f, defineProperty: p, getOwnPropertyDescriptor: m, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: h } = Object, ne = globalThis, re = ne.trustedTypes, ie = re ? re.emptyScript : "", ae = ne.reactiveElementPolyfillSupport, oe = (e, t) => e, se = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
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
}, ce = (e, t) => !f(e, t), g = {
	attribute: !0,
	type: String,
	converter: se,
	reflect: !1,
	useDefault: !1,
	hasChanged: ce
};
Symbol.metadata ??= Symbol("metadata"), ne.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = g) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && p(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = m(this.prototype, e) ?? {
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
		return this.elementProperties.get(e) ?? g;
	}
	static _$Ei() {
		if (this.hasOwnProperty(oe("elementProperties"))) return;
		let e = h(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(oe("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(oe("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
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
			for (let e of n) t.unshift(d(e));
		} else e !== void 0 && t.push(d(e));
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
		return u(e, this.constructor.elementStyles), e;
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
			let i = (n.converter?.toAttribute === void 0 ? se : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? se : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ce)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[oe("elementProperties")] = /* @__PURE__ */ new Map(), _[oe("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: _ }), (ne.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var le = globalThis, ue = (e) => e, de = le.trustedTypes, fe = de ? de.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, pe = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + v, he = `<${me}>`, ge = document, _e = () => ge.createComment(""), ve = (e) => e === null || typeof e != "object" && typeof e != "function", ye = Array.isArray, be = (e) => ye(e) || typeof e?.[Symbol.iterator] == "function", xe = "[ 	\n\f\r]", Se = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ce = /-->/g, we = />/g, Te = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ee = /'/g, De = /"/g, Oe = /^(?:script|style|textarea|title)$/i, ke = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), y = ke(1), b = ke(2), Ae = Symbol.for("lit-noChange"), x = Symbol.for("lit-nothing"), je = /* @__PURE__ */ new WeakMap(), Me = ge.createTreeWalker(ge, 129);
function Ne(e, t) {
	if (!ye(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return fe === void 0 ? t : fe.createHTML(t);
}
var Pe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Se;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === Se ? c[1] === "!--" ? o = Ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Te) : (Oe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Te) : o = we : o === Te ? c[0] === ">" ? (o = i ?? Se, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Te : c[3] === "\"" ? De : Ee) : o === De || o === Ee ? o = Te : o === Ce || o === we ? o = Se : (o = Te, i = void 0);
		let d = o === Te && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Se ? n + he : l >= 0 ? (r.push(s), n.slice(0, l) + pe + n.slice(l) + v + d) : n + v + (l === -2 ? t : d);
	}
	return [Ne(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Fe = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Pe(t, n);
		if (this.el = e.createElement(l, r), Me.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = Me.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(pe)) {
					let t = u[o++], n = i.getAttribute(e).split(v), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Be : r[1] === "?" ? Ve : r[1] === "@" ? He : ze
					}), i.removeAttribute(e);
				} else e.startsWith(v) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Oe.test(i.tagName)) {
					let e = i.textContent.split(v), t = e.length - 1;
					if (t > 0) {
						i.textContent = de ? de.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], _e()), Me.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], _e());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === me) c.push({
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
		let n = ge.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Ie(e, t, n = e, r) {
	if (t === Ae) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ve(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Ie(e, i._$AS(e, t.values), i, r)), t;
}
var Le = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? ge).importNode(t, !0);
		Me.currentNode = r;
		let i = Me.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Re(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ue(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = Me.nextNode(), a++);
		}
		return Me.currentNode = ge, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Re = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = x, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Ie(this, e, t), ve(e) ? e === x || e == null || e === "" ? (this._$AH !== x && this._$AR(), this._$AH = x) : e !== this._$AH && e !== Ae && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? be(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== x && ve(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ge.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Fe.createElement(Ne(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Le(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = je.get(e.strings);
		return t === void 0 && je.set(e.strings, t = new Fe(e)), t;
	}
	k(t) {
		ye(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(_e()), this.O(_e()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ue(e).nextSibling;
			ue(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, ze = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = x, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = x;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Ie(this, e, t, 0), a = !ve(e) || e !== this._$AH && e !== Ae, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Ie(this, r[n + o], t, o), s === Ae && (s = this._$AH[o]), a ||= !ve(s) || s !== this._$AH[o], s === x ? e = x : e !== x && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === x ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Be = class extends ze {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === x ? void 0 : e;
	}
}, Ve = class extends ze {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== x);
	}
}, He = class extends ze {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Ie(this, e, t, 0) ?? x) === Ae) return;
		let n = this._$AH, r = e === x && n !== x || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== x && (n === x || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ue = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Ie(this, e);
	}
}, We = {
	M: pe,
	P: v,
	A: me,
	C: 1,
	L: Pe,
	R: Le,
	D: be,
	V: Ie,
	I: Re,
	H: ze,
	N: Ve,
	U: He,
	B: Be,
	F: Ue
}, Ge = le.litHtmlPolyfillSupport;
Ge?.(Fe, Re), (le.litHtmlVersions ??= []).push("3.3.3");
var Ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Re(t.insertBefore(_e(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, qe = globalThis, S = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Ae;
	}
};
S._$litElement$ = !0, S.finalized = !0, qe.litElementHydrateSupport?.({ LitElement: S });
var Je = qe.litElementPolyfillSupport;
Je?.({ LitElement: S }), (qe.litElementVersions ??= []).push("4.2.2");
// src/styles.ts
var Ye = {
	success: {
		color: "var(--success-color, #43a047)",
		icon: "mdi:check-circle-outline"
	},
	warning: {
		color: "var(--warning-color, #ff9800)",
		icon: "mdi:alert-outline"
	},
	error: {
		color: "var(--error-color, #db4437)",
		icon: "mdi:alert-circle-outline"
	},
	info: {
		color: "var(--info-color, #039be5)",
		icon: "mdi:information-outline"
	}
}, Xe = {
	textPct: 55,
	fillPct: 60,
	fillLightness: .55,
	dangerTextPct: 55,
	dangerFillPct: 70,
	dangerBorderPct: 60,
	borderPct: 50,
	iconPct: 60
}, Ze = l`
  :host {
    --wp-primary-text: color-mix(in srgb, var(--primary-color, #03a9f4) ${c(String(Xe.textPct))}%, var(--primary-text-color, #212121));
    --wp-primary-fill: color-mix(in srgb, var(--primary-color, #03a9f4) ${c(String(Xe.fillPct))}%, #000);
    --wp-danger-text: color-mix(in srgb, var(--error-color, #db4437) ${c(String(Xe.dangerTextPct))}%, var(--primary-text-color, #212121));
    --wp-danger-fill: color-mix(in srgb, var(--error-color, #db4437) ${c(String(Xe.dangerFillPct))}%, #000);
    --wp-danger-border: color-mix(in srgb, var(--error-color, #db4437) ${c(String(Xe.dangerBorderPct))}%, var(--primary-text-color, #212121));
    --wp-field-border: color-mix(in srgb, var(--primary-text-color, #212121) ${c(String(Xe.borderPct))}%, transparent);
  }
  @supports (color: oklch(from red l c h)) {
    :host { --wp-primary-fill: oklch(from var(--primary-color, #03a9f4) ${c(String(Xe.fillLightness))} c h); }
  }
  :is(button, input, select, textarea, summary, a[href], [tabindex]:not([tabindex="-1"])):focus-visible {
    outline: 2px solid var(--wp-primary-text); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
  }
`;
function Qe(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim());
	if (!t) return {
		fg: "#fff",
		shadow: "rgba(0, 0, 0, 0.6)"
	};
	let n = t[1].length === 3 ? t[1].replace(/./g, (e) => e + e) : t[1], r = [
		0,
		2,
		4
	].map((e) => {
		let t = parseInt(n.slice(e, e + 2), 16) / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	});
	return .2126 * r[0] + .7152 * r[1] + .0722 * r[2] > .179 ? {
		fg: "#000",
		shadow: "none"
	} : {
		fg: "#fff",
		shadow: "rgba(0, 0, 0, 0.6)"
	};
}
var $e = "10px", et = Object.keys(Ye).map((e) => `.callout.tone-${e} { --co-color: ${Ye[e].color}; }`).join("\n"), tt = String(Xe.iconPct), nt = l`
  ${Ze}
  .callout { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px; padding: 10px 12px; box-sizing: border-box;
    border-radius: ${c($e)}; border: 1px solid var(--co-color, var(--divider-color));
    background: color-mix(in srgb, var(--co-color, var(--divider-color)) ${c("16")}%, transparent);
    color: var(--primary-text-color); --mdc-icon-size: 24px; }
  ${c(et)}
  /* icon: the tone colour mixed towards the text colour so it reaches 3:1 on its own tint, in light and dark */
  .callout > ha-icon { color: color-mix(in srgb, var(--co-color) ${c(tt)}%, var(--primary-text-color, #212121)); flex: none; }
  .callout .co-body { flex: 1; min-width: 0; font-size: 0.875rem; line-height: 1.4; overflow-wrap: anywhere; }
  .callout .co-body b { display: block; font-size: 1rem; }
  .callout .co-body p { margin: 2px 0 0; font-size: 0.875rem; line-height: 1.4; color: var(--primary-text-color); }
  .callout .co-body b:empty, .callout .co-body p:empty { display: none; }
  .callout .co-body > :first-child { margin-top: 0; }
  .callout .btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .callout .btn { max-width: 100%; min-height: 44px; height: auto; white-space: normal; text-align: center; overflow-wrap: anywhere; }
`;
function C(e, t, n, r = {}) {
	return y`<div class="callout tone-${e}" role="${r.role ?? x}">
    <ha-icon icon="${r.icon ?? Ye[e].icon}"></ha-icon>
    <div class="co-body">${t ? y`<b>${t}</b>` : x}${n ? y`<p>${n}</p>` : x}${r.extra ?? x}</div></div>`;
}
// node_modules/lit-html/directive.js
var rt = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, it = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), at = class {
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
}, { I: ot } = We, st = (e) => e, ct = () => document.createComment(""), lt = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new ot(r.insertBefore(ct(), i), r.insertBefore(ct(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = st(e).nextSibling;
				st(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, ut = (e, t, n = e) => (e._$AI(t, n), e), dt = {}, ft = (e, t = dt) => e._$AH = t, pt = (e) => e._$AH, mt = (e) => {
	e._$AR(), e._$AA.remove();
}, ht = it(class extends at {
	constructor() {
		super(...arguments), this.key = x;
	}
	render(e, t) {
		return this.key = e, t;
	}
	update(e, [t, n]) {
		return t !== this.key && (ft(e), this.key = t), n;
	}
}), w = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, gt = {
	attribute: !0,
	type: String,
	converter: se,
	reflect: !1,
	hasChanged: ce
}, _t = (e = gt, t, n) => {
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
function T(e) {
	return (t, n) => typeof n == "object" ? _t(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function E(e) {
	return T({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/lit-html/directives/if-defined.js
var vt = (e) => e ?? x, yt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, bt = it(class extends at {
	constructor(e) {
		if (super(e), e.type !== rt.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = pt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = ut(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = ut(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = ut(i[d], a[m]), lt(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = ut(i[f], a[p]), lt(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = yt(o, p, m), u = yt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = lt(e, i[d]);
					ut(t, a[p]), c[p] = t;
				} else c[p] = ut(n, a[p]), lt(e, i[d], n), i[t] = null;
				p++;
			} else mt(i[f]), f--;
		} else mt(i[d]), d++;
		for (; p <= m;) {
			let t = lt(e, c[m + 1]);
			ut(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && mt(e);
		}
		return this.ut = o, ft(e, c), Ae;
	}
});
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function D(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/components/tip.ts
var xt = 2e3, St = class extends S {
	constructor(...e) {
		super(...e), this.text = "", this.passive = !1, this.through = !1, this.label = "", this.noTab = !1, this._mouse = !1, this._show = !1, this._shift = 0;
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
		this._mouse = e.pointerType === "mouse", this.through && this._mouse || (e.stopPropagation(), e.pointerType !== "mouse" && (this._on(), clearTimeout(this._timer), this._timer = setTimeout(() => this._off(), xt)));
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
		return y`<span class="hit" part="hit" tabindex=${this.noTab ? -1 : 0} role="img" aria-label=${this.label || this.text}
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
      ${this._show && this.text ? y`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : x}`;
	}
	static {
		this.styles = l`
    ${Ze}
    :host { display: inline-flex; position: relative; pointer-events: auto; }
    :host([passive]) { pointer-events: none; }
    .hit {
      min-width: 32px; min-height: 32px; display: inline-flex; align-items: center; justify-content: center;
      outline: none; border-radius: 16px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .hit:focus-visible { outline: 2px solid var(--wp-primary-text); }
    .bubble {
      position: absolute; bottom: calc(100% + 2px); left: 50%; transform: translateX(calc(-50% + var(--shift, 0px)));
      z-index: 10; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 0.75rem; font-weight: 500;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }
  `;
	}
};
D([T()], St.prototype, "text", void 0), D([T({ type: Boolean })], St.prototype, "passive", void 0), D([T({ type: Boolean })], St.prototype, "through", void 0), D([T()], St.prototype, "label", void 0), D([T({
	type: Boolean,
	attribute: "no-tab"
})], St.prototype, "noTab", void 0), D([E()], St.prototype, "_show", void 0), D([E()], St.prototype, "_shift", void 0), St = D([w("wp-tip")], St);
// src/i18n.ts
var Ct = {
	random_too_short: "Reduce the random delay or extend this schedule: at least 5 minutes must remain.",
	random_time: "Random delay",
	sun_limit_option: "Limit the time (not earlier / not later)",
	random_minutes: "Maximum delay (minutes)",
	random_window: "Within the next {n} minutes",
	pe_area: "Program room (optional)",
	pe_area_hint: "Choose an existing name or enter a new one. This groups programs in card filters; the rooms of the devices are not used automatically.",
	ce_all_areas: "All rooms",
	ce_area_hint: "Choose each program’s room in its settings.",
	no_matching_program: "Nothing to show here. Ask the person who set up the card (type, room or program selection in the card settings).",
	chart_no_history: "No history recorded for this day.",
	chart_future_history: "History will appear after the device reports its state.",
	chart_no_planned: "No action planned for this device on this day.",
	chart_history_failed: "History could not be loaded. Planned actions are still shown.",
	pe_add_another_entity: "Add another device (optional)",
	pe_zero_services: "No commands selected. Choose them here or later in Devices.",
	ce_define_schedule: "Set schedules",
	devices_of: "Devices of {name}",
	mode_shown: "Mode: {name}",
	no_schedule_for_mode: "No schedule for this mode",
	mode_edit_hours: "Edit this mode’s schedules",
	mode_not_active: "This mode is not active",
	mode_no_option: "no longer exists",
	mode_copy_from: "Reuse the schedules of another mode",
	mode_options: "Advanced options",
	advanced_options: "Advanced options",
	schedules_legend: "Schedules",
	mode_copy_pick: "Copy the schedules of:",
	mode_copy_confirm: "{to} already has schedules. Replace them with those of {from}?",
	mode_copy_replace: "Replace",
	mode_copy_done: "Schedules copied from {from}.",
	mode_gone: "The mode {old} is no longer in the list of modes.",
	mode_gone_ask: "Did it become…?",
	mode_gone_delete: "Delete its schedules",
	mode_gone_confirm: "Delete the mode {old} and all its schedules?",
	mode_renamed: "The mode {old} was renamed to {new}",
	mode_undo: "Undo",
	mode_active_badge: "Active",
	mode_active_now: "Active mode: these schedules apply now",
	mode_not_active_why: "The active mode is {active}. These schedules will apply when the house goes to mode {mode} (“{selector}”).",
	mode_not_active_why_none: "No mode is active yet. These schedules will apply when the house goes to mode {mode} (“{selector}”).",
	mode_follows_label: "Same schedules as:",
	mode_follows_none: "None",
	mode_follows_short: "same schedules as {source}",
	mode_follows_info: "Same schedules as {source}.",
	mode_followed_by: "Followed by: {modes}",
	mode_follows_confirm: "{mode} already has schedules. They will be deleted and replaced by those of {source}.",
	mode_follows_yes: "Follow {source}",
	mode_follows_edit: "Edit {source} (also applies to this mode)",
	mode_follows_stop: "Stop following",
	mode_follows_edit_ask: "{mode} follows {source}: it has the same schedules.",
	mode_follows_stopped: "{mode} no longer follows {source}: it has its own copy of the schedules. You can edit them now.",
	mode_follow_lost: "{modes} no longer follows {source}, which is gone. It keeps a copy of its last schedules.",
	pe_history: "Draft history",
	pe_undo: "Undo change",
	pe_redo: "Redo",
	pe_unapplied: "Changes not applied yet",
	profile_current: "Active now: {name}",
	pe_shared_save_hint: "Updates this program on every card. Cancelling the dashboard editor will not undo applied changes.",
	pe_other_programs: "Also used by: {programs}. Lower priority numbers take precedence.",
	pe_program_priority: "{name} (priority {priority})",
	profile_explanation: "Each mode has its own weekly schedule: Home, Away, Night, Vacation…",
	pe_icon_hint: "Uses the first device’s icon unless you choose another.",
	sort_other: "Others",
	ce_sort: "List order",
	ce_sort_type: "Type (then A→Z)",
	ce_sort_area: "Room (then A→Z)",
	ce_sort_name: "Name (A→Z)",
	ce_sort_custom: "Custom",
	ce_order_list: "Custom order",
	ce_sort_custom_hint: "Use the arrows to put your programs in the order you want.",
	ce_moved: "{name} moved to position {n} of {total}",
	ce_move_up: "Move {name} up",
	ce_move_down: "Move {name} down",
	ce_drag: "Drag {name}",
	ce_schedule_view: "Day layout",
	ce_bars: "Bars",
	ce_radial: "24-hour dial",
	ce_radial_12h: "Double 12-hour dial",
	radial_rings: "Inner: 0–12 h · Outer: 12–24 h",
	ce_list: "Compact list",
	ce_times: "Daily times",
	times_none: "Nothing planned today",
	times_rest: "The rest of the time: {name}",
	times_loading: "Loading today’s times…",
	times_failed: "Cannot show the times right now. Try again in a moment.",
	times_retry: "Try again",
	times_edit: "Edit the day",
	times_add: "Add a schedule",
	times_until: "until {time}",
	times_until_tomorrow: "until tomorrow {time}",
	times_since_yesterday: "since yesterday {time}",
	times_random: "varies, a few minutes apart",
	times_now: "Now",
	times_around: "around {time}",
	times_done: "done",
	next_then: "Next:",
	times_list_label: "Today’s times",
	times_row_open: "Edit the day, {name}",
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
	action_choose: "What should this setting do?",
	action_no_description: "This integration provides no description for this action.",
	action_scene_description: "Activate this Home Assistant scene and apply its saved settings.",
	edited: "Saved",
	active_key: "On or open",
	undo: "Undo",
	cut: "Split in two",
	cut_hint: "Split this schedule in two parts, one after the other in time",
	copy_to: "Copy to other days",
	copy_pick_days: "Choose at least one day.",
	strip_erase: "Erase",
	slot_delete_yes: "Yes, delete it",
	slot_delete_no: "No, keep it",
	copy_hint: "Copy this schedule to other days",
	grp_time: "In time",
	grp_days: "On other days",
	move_to: "{day} {time}",
	move_err_oneshot: "Use the round handle to move a one-time schedule.",
	move_err_wrap: "A schedule that goes past midnight cannot be moved this way. Move its start with the handle.",
	move_err_sunbound: "A sunrise or sunset time with limits cannot be moved this way. Change it in the schedule screen.",
	copy_go: "Copy",
	replace: "Replace",
	skip_day: "Do not copy this day",
	cf_before: "Before",
	cf_after: "After",
	conflict_title: "Already scheduled",
	rename_label: "Edit setting",
	edit_bar: "Edit the day",
	hold_hint: "Press and hold to edit",
	handle: "Boundary {time}",
	rest_gap: "Rest of the time",
	lb_new: "New setting",
	lb_name: "Name",
	lb_color: "Color (to recognize it on the bars)",
	lb_value_here: "Value for this device",
	lb_common_value: "Back to the common value",
	lb_err_name: "Give it a name.",
	lb_err_action: "Choose what it does.",
	lb_err_fields: "Fill in the required fields.",
	lb_err_save: "Could not save the setting.",
	lb_delete: "Delete the setting",
	lb_delete_ask: "Delete the setting “{name}”? It disappears for every device.",
	lb_delete_used: "“{name}” is still in use: {programs}.",
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
	vacation: "All programs suspended",
	no_program: "No program yet.",
	new_program: "New program",
	then: "then {mode}",
	now: "Now",
	now_time: "Now: {time}",
	time_from: "from {time}",
	time_next_day: "next day",
	override: "Change for now",
	edit: "Edit",
	close: "Close",
	save: "Save",
	cancel: "Cancel",
	delete: "Delete",
	duplicate: "Duplicate",
	confirm_delete: "Delete “{name}” and all its schedules?",
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
	measured: "Measured value",
	previous_day: "Previous day",
	next_day: "Next day",
	error: "Error: {message}",
	err_service: "Something went wrong on our side. Please try again in a moment.",
	expand_dialog: "Enlarge / reduce",
	hours_of: "Schedules, {name}",
	edit_bar_of: "Edit the day, {name}, {day}",
	week_of: "Week, {name}",
	chart_day_of: "Chart of the day, {name}",
	color_custom: "Custom color",
	color_red: "Red",
	color_pink: "Pink",
	color_purple: "Purple",
	color_indigo: "Indigo",
	color_light_blue: "Light blue",
	color_cyan: "Turquoise",
	color_green: "Green",
	color_light_green: "Light green",
	color_yellow: "Yellow",
	color_orange: "Orange",
	color_brown: "Brown",
	color_blue_grey: "Blue-gray",
	entity: "Device",
	ok: "OK",
	confirm: "Confirm",
	copy: "Copy",
	copy_suffix: "(copy)",
	cond_add: "Add a condition",
	cond_attribute: "Detail of the device (optional)",
	cond_op: "Operator",
	cond_value: "Value",
	sun_dawn: "Dawn",
	sun_sunrise: "Sunrise",
	sun_rule_before: "{min} min before {sun}",
	sun_rule_after: "{min} min after {sun}",
	sun_np_dawn: "dawn",
	sun_np_sunrise: "sunrise",
	sun_np_sunset: "sunset",
	sun_np_dusk: "dusk",
	sun_at_dawn: "at dawn",
	sun_at_sunrise: "at sunrise",
	sun_at_sunset: "at sunset",
	sun_at_dusk: "at dusk",
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
	pe_priority_hint: "If two programs want to control the same device at the same time, the one with the smaller number decides (1 is the strongest).",
	pe_icon_name_hint: "Icon name, for example mdi:sofa.",
	pe_reapply: "Re-apply the current setting after a restart or a change",
	pe_reapply_hint: "Off: after a restart or an edit, nothing is sent until the next change.",
	pe_conditions: "Program conditions",
	pe_conditions_hint: "The program only runs when all conditions are true.",
	pe_no_entity: "No device yet: add at least one.",
	pe_add_entity: "Add a device",
	pe_choose_services: "Choose the actions you want to use for this device. You can change them later.",
	pe_no_services: "No actions available yet. You can choose them later in Devices.",
	pe_services: "Offered actions",
	pe_services_all: "All",
	pe_unknown_entity: "unknown device",
	profile_default: "Default mode",
	err_name: "The name is required.",
	err_no_entity: "Add at least one device.",
	err_profile_name: "Mode names must be unique and not empty.",
	err_overlap_server: "Two schedules overlap on the same day.",
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
	chart_preview_failed: "Resolved planned times are unavailable for part of this period.",
	chart_options: "Chart options",
	chart_source_alias: "Display name",
	chart_program_bands: "Planned · named bands",
	chart_program_mixed: "Planned · steps and named bands",
	chart_quantity_planned: "Planned · {quantity}",
	chart_quantity_measured: "Measured · {quantity}",
	chart_quantity_set: "Requested · {quantity}",
	chart_requested_value: "Requested value",
	chart_source_add: "Add an entity",
	chart_source_remove: "Remove {name} from the chart",
	chart_source_missing: "Entity unavailable; saved choices are kept.",
	chart_source_states: "States to highlight",
	chart_source_no_states: "States will appear after the entity reports its state.",
	chart_sources_saving: "Saving…",
	chart_sources_saved: "Saved",
	chart_alias_schema_failed: "Home Assistant rejected the displayed name. Restart Home Assistant after updating the integration, then try again.",
	chart_sources_save_failed: "Chart options could not be saved. Try again.",
	chart_sources_axes_full: "Three units are already displayed. Remove a curve with another unit first.",
	chart_sources_overflow: "More than three units: remove a source to show all curves.",
	chart_source_history_failed: "History unavailable",
	chart_source_no_history: "No recorded history",
	chart_source_gap: "Missing data",
	chart_source_other: "Other states",
	chart_source_binary: "on = 100, off = 0",
	chart_previous: "Previous period",
	chart_next: "Next period",
	chart_return: "Return to selected day",
	chart_zoom_reset: "Reset zoom",
	chart_zoom_window: "{from} – {to}",
	cf_title: "Please confirm",
	cf_choose: "What do you want to do?",
	ss_changed: "This schedule was just changed. Here is the new version.",
	err_time_range: "A time is out of range. Shorten the offset or pick a time.",
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
	action: "Setting",
	more_actions: "More actions",
	hours: "Schedule",
	program_disabled: "Paused",
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
	pause_title: "Pause",
	pause_for: "For a set time",
	pause_1h: "1 hour",
	pause_1d: "1 day",
	pause_7d: "7 days",
	pause_x_days: "Number of days",
	pause_x_hours: "Number of hours",
	pause_hours_unit: "hours",
	pause_hour_unit: "hour",
	pause_day_unit: "day",
	pause_days_unit: "days",
	pause_duration: "Until when?",
	pause_length: "Length of the pause",
	pause_validate: "Confirm",
	pause_none: "Until resumed",
	pause_none_hint: "The schedules stay stopped until you turn them back on.",
	paused_until: "Paused until {when}",
	confirm_delete_schedule: "Delete the schedule of “{name}”?",
	delete_schedule: "Delete",
	schedule_on: "Program on",
	w_add: "Add a schedule",
	w_none: "No schedule.",
	create_setting: "Create a setting",
	w_whole_week: "Whole week",
	w_add_day: "Add a schedule on {day}",
	w_dropped: "Not added on {days}: already busy.",
	yes: "Yes",
	no: "No",
	running: "On",
	admin_zone_hint: "These settings are for the person who installs or manages the card.",
	holiday_title: "Day off",
	holiday_none: "No special setting",
	holiday_copy: "Same schedules as:",
	holiday_own: "Own schedule",
	holiday_clear: "Remove the day-off setting?",
	holiday_clear_yes: "Remove",
	holiday_from: "Day off of {source}: {what}",
	holiday_what_none: "no special setting",
	holiday_what_copy: "like {day}",
	holiday_what_own: "own schedule",
	holiday_midnight: "A day off runs from 00:00 to 24:00: a schedule is cut at midnight.",
	holiday_line_copy: "Day off: like {copied}, not {actual}",
	holiday_line_own: "Day off: own schedule, not {actual}’s",
	then_label: "next:",
	midnight: "midnight",
	noon: "noon",
	at_time: "at {time}",
	range_from_to: "{from}–{to}",
	program_resumed: "{name} is back on.",
	stopped: "Paused",
	rest_none_short: "None",
	who_title: "Change for:",
	who_one: "Only {name}",
	who_all: "All devices ({n})",
	who_some: "{me} and {names}",
	who_keep: "Change nothing",
	who_pick: "Choose which devices this change is for.",
	rest_untouched: "leave as is",
	colon: ": ",
	also_for: "Also for:",
	also_short: "Also: {names}",
	used_by: "Also used by: {names}",
	device_label: "Device",
	confirm_delete_device: "Delete the schedules of “{name}”? The other devices keep theirs.",
	confirm_remove_device_own: "Delete “{name}”? Its {n} own schedules will be deleted too.",
	pe_inherits: "Follows the {n} schedules shared by all devices.",
	pe_incompatible: "{n} schedules of this device use a command that is no longer chosen.",
	pe_incompatible_remove: "Remove them from this device",
	err_slot_entities: "A schedule has no device left. Pick at least one.",
	err_slot_duplicate: "A device is listed twice in a schedule.",
	err_slot_unknown: "A schedule targets a device that is not in this program.",
	err_overlap_device: "Two schedules overlap for {name}.",
	skip_named: "Skipped: {what} · {when}",
	undo_changed: "Cannot undo: this schedule was changed meanwhile."
}, wt = {
	random_too_short: "Réduisez le délai aléatoire ou allongez cet horaire : il doit rester au moins 5 minutes.",
	random_time: "Délai aléatoire",
	sun_limit_option: "Limiter l’heure (au plus tôt / au plus tard)",
	random_minutes: "Délai maximum (minutes)",
	random_window: "Dans les {n} prochaines minutes",
	pe_area: "Pièce du programme (facultatif)",
	pe_area_hint: "Choisissez un nom existant ou saisissez-en un nouveau. Cette pièce regroupe les programmes dans les filtres des cartes ; les pièces des appareils ne sont pas reprises automatiquement.",
	ce_all_areas: "Toutes les pièces",
	ce_area_hint: "Choisissez la pièce de chaque programme dans ses réglages.",
	no_matching_program: "Rien à afficher ici. Demandez à la personne qui a installé la carte (types, pièce ou programmes choisis dans les réglages de la carte).",
	chart_no_history: "Aucun historique enregistré pour cette journée.",
	chart_future_history: "L’historique apparaîtra quand l’appareil aura communiqué son état.",
	chart_no_planned: "Aucun réglage prévu pour cet appareil ce jour-là.",
	chart_history_failed: "Impossible de charger l’historique. Les réglages prévus restent affichés.",
	pe_add_another_entity: "Ajouter un autre appareil (facultatif)",
	pe_zero_services: "Aucune commande sélectionnée. Choisissez-les ici ou plus tard dans Appareils.",
	ce_define_schedule: "Définir les horaires",
	devices_of: "Appareils de {name}",
	mode_shown: "Mode : {name}",
	no_schedule_for_mode: "Aucun horaire pour ce mode",
	mode_edit_hours: "Modifier les horaires de ce mode",
	mode_not_active: "Ce mode n’est pas actif",
	mode_no_option: "n’existe plus",
	mode_copy_from: "Reprendre les horaires d’un autre mode",
	mode_options: "Options avancées",
	advanced_options: "Options avancées",
	schedules_legend: "Horaires",
	mode_copy_pick: "Copier les horaires de :",
	mode_copy_confirm: "{to} a déjà des horaires. Les remplacer par ceux de {from} ?",
	mode_copy_replace: "Remplacer",
	mode_copy_done: "Horaires copiés depuis {from}.",
	mode_gone: "Le mode {old} n’existe plus dans la liste des modes.",
	mode_gone_ask: "Est-ce devenu… ?",
	mode_gone_delete: "Effacer ses horaires",
	mode_gone_confirm: "Supprimer le mode {old} et tous ses horaires ?",
	mode_renamed: "Le mode {old} a été renommé en {new}",
	mode_undo: "Annuler",
	mode_active_badge: "Actif",
	mode_active_now: "Mode actif : ces horaires s’appliquent maintenant",
	mode_not_active_why: "Le mode actif est {active}. Ces horaires s’appliqueront quand la maison passera en mode {mode} (« {selector} »).",
	mode_not_active_why_none: "Aucun mode n’est actif pour l’instant. Ces horaires s’appliqueront quand la maison passera en mode {mode} (« {selector} »).",
	mode_follows_label: "Mêmes horaires que :",
	mode_follows_none: "Aucun",
	mode_follows_short: "mêmes horaires que {source}",
	mode_follows_info: "Mêmes horaires que {source}.",
	mode_followed_by: "Suivi par : {modes}",
	mode_follows_confirm: "{mode} a déjà des horaires. Ils seront supprimés et remplacés par ceux de {source}.",
	mode_follows_yes: "Suivre {source}",
	mode_follows_edit: "Modifier {source} (vaut aussi pour ce mode)",
	mode_follows_stop: "Arrêter de suivre",
	mode_follows_edit_ask: "{mode} suit {source} : il a les mêmes horaires.",
	mode_follows_stopped: "{mode} ne suit plus {source} : il a sa propre copie des horaires. Vous pouvez la modifier maintenant.",
	mode_follow_lost: "{modes} ne suit plus {source}, qui n’existe plus. Il garde une copie de ses derniers horaires.",
	pe_history: "Historique du brouillon",
	pe_undo: "Annuler la modification",
	pe_redo: "Rétablir",
	pe_unapplied: "Modifications non appliquées",
	profile_current: "Actif actuellement : {name}",
	pe_shared_save_hint: "Met à jour ce programme sur toutes les cartes. Annuler l’éditeur du tableau de bord n’annule pas les changements appliqués.",
	pe_other_programs: "Aussi utilisé par : {programs}. Le plus petit numéro de priorité l’emporte.",
	pe_program_priority: "{name} (priorité {priority})",
	profile_explanation: "Chaque mode a sa propre semaine d’horaires : Maison, Absent, Nuit, Vacances…",
	pe_icon_hint: "L’icône du premier appareil est utilisée, sauf si vous en choisissez une autre.",
	sort_other: "Autres",
	ce_sort: "Ordre de la liste",
	ce_sort_type: "Type (puis A→Z)",
	ce_sort_area: "Pièce (puis A→Z)",
	ce_sort_name: "Nom (A→Z)",
	ce_sort_custom: "Personnalisé",
	ce_order_list: "Ordre personnalisé",
	ce_sort_custom_hint: "Utilisez les flèches pour placer vos programmes dans l’ordre que vous voulez.",
	ce_moved: "{name} : position {n} sur {total}",
	ce_move_up: "Monter {name}",
	ce_move_down: "Descendre {name}",
	ce_drag: "Glisser {name}",
	ce_schedule_view: "Présentation de la journée",
	ce_bars: "Barres",
	ce_radial: "Cadran 24 heures",
	ce_radial_12h: "Double cadran 12 heures",
	radial_rings: "Intérieur : 0–12 h · Extérieur : 12–24 h",
	ce_list: "Liste compacte",
	ce_times: "Horaires du jour",
	times_none: "Rien de prévu aujourd’hui",
	times_rest: "Le reste du temps : {name}",
	times_loading: "Chargement des horaires du jour…",
	times_failed: "Impossible d’afficher les horaires pour le moment. Réessayez dans un instant.",
	times_retry: "Réessayer",
	times_edit: "Modifier la journée",
	times_add: "Ajouter un horaire",
	times_until: "jusqu’à {time}",
	times_until_tomorrow: "jusqu’à demain {time}",
	times_since_yesterday: "depuis hier {time}",
	times_random: "heure variable, quelques minutes d’écart",
	times_now: "Maintenant",
	times_around: "vers {time}",
	times_done: "terminé",
	next_then: "Ensuite :",
	times_list_label: "Horaires du jour",
	times_row_open: "Modifier la journée, {name}",
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
	action_choose: "Que doit faire ce réglage ?",
	action_no_description: "Cette intégration ne fournit pas de description pour cette action.",
	action_scene_description: "Activer cette scène Home Assistant et appliquer ses réglages enregistrés.",
	lb_new: "Nouveau réglage",
	lb_name: "Nom",
	lb_color: "Couleur (repère sur les barres)",
	lb_value_here: "Valeur pour cet appareil",
	lb_common_value: "Revenir à la valeur commune",
	lb_err_name: "Donnez-lui un nom.",
	lb_err_action: "Choisissez ce que fait le réglage.",
	lb_err_fields: "Remplissez les champs obligatoires.",
	edited: "Enregistré",
	active_key: "En marche ou ouvert",
	undo: "Annuler",
	cut: "Couper en deux",
	cut_hint: "Coupe cet horaire en deux parties, l’une après l’autre dans le temps",
	copy_to: "Copier sur d’autres jours",
	copy_pick_days: "Choisissez au moins un jour.",
	strip_erase: "Effacer",
	slot_delete_yes: "Oui, supprimer",
	slot_delete_no: "Non, garder",
	copy_hint: "Copie cet horaire sur d’autres jours",
	grp_time: "Dans le temps",
	grp_days: "Sur d’autres jours",
	move_to: "{day} {time}",
	move_err_oneshot: "Utilisez la poignée ronde pour déplacer un horaire ponctuel.",
	move_err_wrap: "Un horaire qui passe minuit ne se déplace pas ainsi. Déplacez son début avec la poignée.",
	move_err_sunbound: "Une heure de lever ou coucher du soleil avec limites ne se déplace pas ainsi. Modifiez-la dans l’écran d’horaires.",
	copy_go: "Copier",
	replace: "Remplacer",
	skip_day: "Ne pas copier ce jour",
	cf_before: "Avant",
	cf_after: "Après",
	conflict_title: "Déjà occupé",
	rename_label: "Modifier le réglage",
	edit_bar: "Modifier la journée",
	hold_hint: "Restez appuyé pour modifier",
	handle: "Limite {time}",
	rest_gap: "Le reste du temps",
	lb_err_save: "Réglage non enregistré.",
	lb_delete: "Supprimer le réglage",
	lb_delete_ask: "Supprimer le réglage « {name} » ? Il disparaît pour tous les appareils.",
	lb_delete_used: "« {name} » sert encore : {programs}.",
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
	title: "Horaires",
	vacation: "Tous les programmes suspendus",
	no_program: "Aucun programme pour l’instant.",
	new_program: "Nouveau programme",
	then: "puis {mode}",
	now: "Maintenant",
	now_time: "Maintenant : {time}",
	time_from: "dès {time}",
	time_next_day: "lendemain",
	override: "Changer pour l’instant",
	edit: "Modifier",
	close: "Fermer",
	save: "Enregistrer",
	cancel: "Annuler",
	delete: "Supprimer",
	duplicate: "Dupliquer",
	confirm_delete: "Supprimer « {name} » et tous ses horaires ?",
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
	measured: "Valeur mesurée",
	previous_day: "Jour précédent",
	next_day: "Jour suivant",
	error: "Erreur : {message}",
	err_service: "Un problème est survenu de notre côté. Réessayez dans un instant.",
	expand_dialog: "Agrandir / réduire",
	hours_of: "Horaires, {name}",
	edit_bar_of: "Modifier la journée, {name}, {day}",
	week_of: "Semaine, {name}",
	chart_day_of: "Graphique du jour, {name}",
	color_custom: "Couleur personnalisée",
	color_red: "Rouge",
	color_pink: "Rose",
	color_purple: "Violet",
	color_indigo: "Indigo",
	color_light_blue: "Bleu clair",
	color_cyan: "Turquoise",
	color_green: "Vert",
	color_light_green: "Vert clair",
	color_yellow: "Jaune",
	color_orange: "Orange",
	color_brown: "Marron",
	color_blue_grey: "Gris bleu",
	entity: "Appareil",
	ok: "OK",
	confirm: "Confirmer",
	copy: "Copier",
	copy_suffix: "(copie)",
	cond_add: "Ajouter une condition",
	cond_attribute: "Détail de l’appareil (facultatif)",
	cond_op: "Opérateur",
	cond_value: "Valeur",
	sun_dawn: "Aube",
	sun_sunrise: "Lever du soleil",
	sun_rule_before: "{min} min avant {sun}",
	sun_rule_after: "{min} min après {sun}",
	sun_np_dawn: "l’aube",
	sun_np_sunrise: "le lever du soleil",
	sun_np_sunset: "le coucher du soleil",
	sun_np_dusk: "le crépuscule",
	sun_at_dawn: "à l’aube",
	sun_at_sunrise: "au lever du soleil",
	sun_at_sunset: "au coucher du soleil",
	sun_at_dusk: "au crépuscule",
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
	pe_priority_hint: "Si deux programmes veulent commander le même appareil en même temps, celui qui a le plus petit numéro décide (1 = le plus fort).",
	pe_icon_name_hint: "Nom d’icône, par exemple mdi:sofa.",
	pe_reapply: "Réappliquer le réglage en cours après un redémarrage ou une modification",
	pe_reapply_hint: "Désactivé : après un redémarrage ou une modification, rien n’est envoyé avant le prochain changement.",
	pe_conditions: "Conditions du programme",
	pe_conditions_hint: "Le programme ne s’exécute que si toutes les conditions sont vraies.",
	pe_no_entity: "Aucun appareil : ajoutez-en au moins un.",
	pe_add_entity: "Ajouter un appareil",
	pe_choose_services: "Cochez les actions utiles pour cet appareil. Vous pourrez les changer ensuite.",
	pe_no_services: "Aucune action disponible pour le moment. Vous pourrez les choisir ensuite dans Appareils.",
	pe_services: "Actions proposées",
	pe_services_all: "Toutes",
	pe_unknown_entity: "appareil inconnu",
	profile_default: "Mode par défaut",
	err_name: "Le nom est obligatoire.",
	err_no_entity: "Ajoutez au moins un appareil.",
	err_profile_name: "Les noms de mode doivent être uniques et non vides.",
	err_overlap_server: "Deux horaires se chevauchent un même jour.",
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
	ce_type_chip: "{type} : tout sélectionner",
	ce_programs_list: "Programmes",
	ce_no_device: "Aucun appareil",
	ce_type_count: "{on} sur {total}",
	ce_type_empty: "Aucun programme de ce type.",
	ce_other_programs: "Autres programmes choisis",
	ce_area: "Pièce (facultatif)",
	ce_show_chart: "Bouton Graphique sous chaque appareil",
	ce_show_chart_hint: "Affiche aussi le graphique dans la fenêtre des horaires. Désactivé : plus de graphique nulle part sur cette carte.",
	ce_chart_open: "Graphique ouvert d’office",
	ce_chart_open_hint: "Chacun peut encore l’ouvrir ou le fermer ; le navigateur retient ce choix.",
	ce_left_all: "Les nouveaux programmes ne s’afficheront plus automatiquement sur cette carte.",
	ce_back_all: "Afficher de nouveau tous les programmes",
	ce_partial: "en partie",
	ce_partial_label: "{name} : en partie ({on} sur {total})",
	ce_of_total: "{on} sur {total}",
	chart_day: "Graphique du jour",
	today: "Aujourd’hui",
	no_data: "Pas de données pour ce jour.",
	chart_loading: "Chargement…",
	chart_preview_failed: "Les horaires prévus exacts sont indisponibles sur une partie de cette période.",
	chart_options: "Options du graphique",
	chart_source_alias: "Nom affiché",
	chart_program_bands: "Prévu · réglages nommés",
	chart_program_mixed: "Prévu · paliers et réglages nommés",
	chart_quantity_planned: "Prévu · {quantity}",
	chart_quantity_measured: "Mesuré · {quantity}",
	chart_quantity_set: "Demandé · {quantity}",
	chart_requested_value: "Valeur demandée",
	chart_source_add: "Ajouter une entité",
	chart_source_remove: "Retirer {name} du graphique",
	chart_source_missing: "Entité indisponible ; les choix sont conservés.",
	chart_source_states: "États à mettre en évidence",
	chart_source_no_states: "Les états apparaîtront quand l’entité aura communiqué son état.",
	chart_sources_saving: "Enregistrement…",
	chart_sources_saved: "Enregistré",
	chart_alias_schema_failed: "Home Assistant refuse le nom affiché. Redémarrez Home Assistant après la mise à jour de l’intégration, puis réessayez.",
	chart_sources_save_failed: "Impossible d’enregistrer les options. Réessayez.",
	chart_sources_axes_full: "Trois unités sont déjà affichées. Retirez d’abord une courbe d’une autre unité.",
	chart_sources_overflow: "Plus de trois unités : retirez une source pour afficher toutes les courbes.",
	chart_source_history_failed: "Historique indisponible",
	chart_source_no_history: "Aucun historique enregistré",
	chart_source_gap: "Données manquantes",
	chart_source_other: "Autres états",
	chart_source_binary: "on = 100, off = 0",
	chart_previous: "Période précédente",
	chart_next: "Période suivante",
	chart_return: "Revenir au jour sélectionné",
	chart_zoom_reset: "Réinitialiser le zoom",
	chart_zoom_window: "{from} – {to}",
	cf_title: "Veuillez confirmer",
	cf_choose: "Que voulez-vous faire ?",
	ss_changed: "Cet horaire vient d’être modifié, voici la nouvelle version.",
	err_time_range: "Une heure est hors limites. Réduisez le délai ou choisissez une heure.",
	ss_err_save: "Impossible d’enregistrer ces horaires. Réessayez.",
	tab_scroll: "Rubriques (faire défiler pour en voir plus)",
	rest_none: "Laisser tel quel",
	rest_of_time: "Le reste du temps",
	all_days_text: "Tous les jours",
	weekend: "Week-end",
	all_days: "Tous les jours",
	weekdays: "En semaine",
	minus15: "15 minutes plus tôt",
	plus15: "15 minutes plus tard",
	start: "Début",
	end: "Fin",
	no_end: "Sans fin",
	with_end: "Jusqu’à…",
	days_label: "Jours",
	action: "Réglage",
	more_actions: "Plus d’actions",
	hours: "Horaires",
	program_disabled: "En pause",
	paused: "En pause",
	settings: "Réglages",
	all_programs: "Tous les horaires",
	today_short: "Auj.",
	apply_other_days: "Appliquer à d’autres jours",
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
	pause_title: "Pause",
	pause_for: "Pour une durée",
	pause_1h: "1 heure",
	pause_1d: "1 jour",
	pause_7d: "7 jours",
	pause_x_days: "Nombre de jours",
	pause_x_hours: "Nombre d’heures",
	pause_hours_unit: "heures",
	pause_hour_unit: "heure",
	pause_day_unit: "jour",
	pause_days_unit: "jours",
	pause_duration: "Jusqu’à quand ?",
	pause_length: "Durée de la pause",
	pause_validate: "Confirmer",
	pause_none: "Jusqu’à la reprise",
	pause_none_hint: "Les horaires restent arrêtés jusqu’à ce que vous les remettiez en marche.",
	paused_until: "Pause jusqu’au {when}",
	confirm_delete_schedule: "Supprimer l’horaire de « {name} » ?",
	delete_schedule: "Supprimer",
	schedule_on: "Programme actif",
	w_add: "Ajouter un horaire",
	w_none: "Aucun horaire.",
	create_setting: "Créer un réglage",
	w_whole_week: "Toute la semaine",
	w_add_day: "Ajouter un horaire le {day}",
	w_dropped: "Pas ajouté {days} : déjà occupé.",
	yes: "Oui",
	no: "Non",
	running: "En marche",
	admin_zone_hint: "Ces réglages sont pour la personne qui installe ou gère la carte.",
	holiday_title: "Jour férié",
	holiday_none: "Aucun réglage spécial",
	holiday_copy: "Mêmes horaires que :",
	holiday_own: "Horaires propres",
	holiday_clear: "Effacer le réglage du jour férié ?",
	holiday_clear_yes: "Effacer",
	holiday_from: "Jour férié de {source} : {what}",
	holiday_what_none: "aucun réglage spécial",
	holiday_what_copy: "comme {day}",
	holiday_what_own: "horaires propres",
	holiday_midnight: "Un jour férié va de 0 h à 24 h : un horaire est coupé à minuit.",
	holiday_line_copy: "Férié : comme {copied}, pas {actual}",
	holiday_line_own: "Férié : horaires propres, pas {actual}",
	then_label: "ensuite :",
	midnight: "minuit",
	noon: "midi",
	at_time: "à {time}",
	range_from_to: "de {from} à {to}",
	program_resumed: "« {name} » est remis en marche.",
	stopped: "En pause",
	rest_none_short: "Rien",
	who_title: "Modifier pour :",
	who_one: "Seulement {name}",
	who_all: "Tous les appareils ({n})",
	who_some: "{me} et {names}",
	who_keep: "Aucun changement",
	who_pick: "Choisissez pour quels appareils vaut ce changement.",
	rest_untouched: "on ne touche à rien",
	colon: " : ",
	also_for: "Aussi pour :",
	also_short: "Aussi : {names}",
	used_by: "Aussi utilisé par : {names}",
	device_label: "Appareil",
	confirm_delete_device: "Supprimer les horaires de « {name} » ? Les autres appareils gardent les leurs.",
	confirm_remove_device_own: "Supprimer « {name} » ? Ses {n} horaires propres seront supprimés aussi.",
	pe_inherits: "Suit les {n} horaires communs à tous les appareils.",
	pe_incompatible: "{n} horaires de cet appareil utilisent une commande qui n’est plus choisie.",
	pe_incompatible_remove: "Les retirer de cet appareil",
	err_slot_entities: "Un horaire n’a plus d’appareil. Choisissez-en au moins un.",
	err_slot_duplicate: "Un appareil est en double dans un horaire.",
	err_slot_unknown: "Un horaire vise un appareil absent de ce programme.",
	err_overlap_device: "Deux horaires se chevauchent pour {name}.",
	skip_named: "Sauté : {what} · {when}",
	undo_changed: "Annulation impossible : cet horaire a changé entre-temps."
};
function O(e) {
	return e.startsWith("fr") ? wt : Ct;
}
function k(e, t, n = {}) {
	let r = O(e)[t];
	for (let [e, t] of Object.entries(n)) r = r.replace(`{${e}}`, t);
	return r;
}
function Tt(e, t, n) {
	if (!t) return null;
	if (t.includes("empty_slot_entities")) return k(e, "err_slot_entities");
	if (t.includes("duplicate_slot_entity")) return k(e, "err_slot_duplicate");
	if (t.includes("unknown_slot_entity")) return k(e, "err_slot_unknown");
	let r = /overlapping_slots:([a-z0-9_]+\.[a-z0-9_]+)/.exec(t)?.[1];
	return r ? k(e, "err_overlap_device", { name: n(r) }) : null;
}
var Et = /unknown[_ ]command|not[_ ]found|not[_ ]loaded|unavailable|service|timeout|timed out|connection|disconnect|failed to fetch|socket|internal|traceback|exception|unknown_error|home_assistant_error/i;
function Dt(e, t) {
	let n = t?.message ?? String(t);
	return Et.test(n) || Et.test(t?.code ?? "") ? (typeof console < "u" && console.warn("weekly_planner:", n), k(e, "err_service")) : k(e, "error", { message: n });
}
// src/time.ts
var Ot = /* @__PURE__ */ new Map();
function A(e, t) {
	let n = `${e}|${JSON.stringify(t)}`, r = Ot.get(n);
	return r || Ot.set(n, r = new Intl.DateTimeFormat(e, t)), r;
}
var kt = "language";
function At(e) {
	let t = e?.locale?.time_format;
	return t === "12" || t === "24" ? t : "language";
}
function jt(e) {
	kt = At(e);
}
function Mt() {
	return kt;
}
function Nt(e, t) {
	let [n, r, i] = e.split("-").map(Number);
	return new Date(Date.UTC(n, r - 1, i + t)).toISOString().slice(0, 10);
}
var j = 1440;
function M(e) {
	let [t, n] = e.split(":").map(Number);
	return t * 60 + n;
}
function Pt(e) {
	let t = Math.max(0, Math.min(j, Math.round(e / 5) * 5));
	return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function Ft(e) {
	let t = Math.max(0, Math.min(j, Math.round(e)));
	return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function N(e, t) {
	let n = typeof e == "string" ? new Date(e) : e, r = A("en-GB", {
		timeZone: t,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(n), i = Number(r.find((e) => e.type === "hour")?.value ?? 0), a = Number(r.find((e) => e.type === "minute")?.value ?? 0);
	return i * 60 + a;
}
function It(e, t) {
	let n = A("en-GB", {
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
	return A("en-CA", { timeZone: t }).format(e);
}
function Lt(e) {
	return !e || !("time" in e) ? null : M(e.time);
}
function Rt(e) {
	let t = [];
	for (let n of e) {
		let e = Lt(n.start), r = Lt(n.end ?? null);
		e !== null && r !== null && r <= e && r < 720 && t.push({
			slot: n,
			end: r
		});
	}
	return t;
}
function F(e, t, n = kt) {
	let r = (Math.round(t) % j + j) % j, i = Math.floor(r / 60), a = r % 60;
	if (e.toLowerCase().startsWith("fr") && n !== "12") return a ? `${i} h ${String(a).padStart(2, "0")}` : `${i} h`;
	if (n === "12" && !a && i % 12 == 0) return k(e, i === 0 ? "midnight" : "noon");
	let o = new Date(Date.UTC(2e3, 0, 1, i, a));
	if (n === "24") return A(e, {
		timeZone: "UTC",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).format(o);
	let s = {
		timeZone: "UTC",
		hour: "numeric"
	};
	return n === "12" && (s.hour12 = !0), a && (s.minute = "2-digit"), A(e, s).format(o).replace(/\s?(AM|PM)/, (e, t) => ` ${t.toLowerCase()}`);
}
function zt(e, t, n = !1, r = "en") {
	return !t && e % 12 == 0 ? k(r, e % 24 == 0 ? "midnight" : "noon") : `${e % 12 || 12}${n ? `:${String(t).padStart(2, "0")}` : ""} ${e % 24 < 12 ? "am" : "pm"}`;
}
function Bt(e, t = kt) {
	return t === "12" ? F(e, 0, t) : "24 h";
}
function Vt(e, t, n, r = /* @__PURE__ */ new Date()) {
	let i = new Date(e), a = P(i, t) === P(r, t), o = F(n, N(i, t));
	return a ? o : Nt(P(r, t), 1) === P(i, t) ? `${new Intl.RelativeTimeFormat(n, { numeric: "auto" }).format(1, "day")} ${o}` : `${A(n, i.getTime() - r.getTime() > 5184e5 ? {
		timeZone: t,
		weekday: "short",
		day: "numeric",
		month: "short"
	} : {
		timeZone: t,
		weekday: "short"
	}).format(i)} ${o}`;
}
function Ht(e, t, n) {
	let r = new Date(e);
	return `${A(n, {
		timeZone: t,
		weekday: "short",
		day: "numeric",
		month: "short"
	}).format(r)}, ${F(n, N(r, t))}`;
}
function Ut(e) {
	return e.filter((e) => !e.enabled && e.paused_until).map((e) => e.paused_until).sort()[0] ?? null;
}
// src/components/day-bar.ts
function Wt(e) {
	return !e || !("sun" in e) ? null : e.sun === "sunrise" || e.sun === "dawn" ? "up" : "down";
}
function Gt(e, t, n) {
	if (!t || !("sun" in t)) return "";
	let r = t.offset ?? 0;
	return `${O(e)[`sun_${t.sun}`] ?? t.sun}${r ? ` ${r > 0 ? "+" : "-"} ${Math.abs(r)} min` : ""} · ${F(e, n)}`;
}
var Kt = (e, t) => `${k(e, "now")} · ${F(e, t)}`, qt = class extends S {
	constructor(...e) {
		super(...e), this.spans = [], this.now = null, this.thin = !1, this.showHours = !1, this.noTab = !1, this.notches = !1, this.tall = !1, this.lang = "en", this.deviceName = "", this._width = 0, this._lastText = null;
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
		return e.map((e) => y`<wp-tip class="sunic" ?passive=${this.tall} ?no-tab=${this.noTab}
      text=${`${e.label ? `${e.label} · ` : ""}${Gt(this.lang, e.spec, e.m)}`}
      style="left:clamp(16px, ${e.m / j * 100}%, calc(100% - 16px))" data-sun=${e.dir}>
      <span class="sunc"><ha-icon icon=${e.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
	}
	_markerTips() {
		return this.spans.filter((e) => e.marker && !e.startSun && !this.thin).map((e) => y`<wp-tip class="mktip" through
      ?passive=${this.tall} ?no-tab=${this.noTab} text=${`${e.label} · ${F(this.lang, e.start)}`}
      style="left:clamp(12px, ${e.start / j * 100}%, calc(100% - 12px))"></wp-tip>`);
	}
	visibleText() {
		return this.spans.filter((e) => this._labelBox(e)).map((e) => e.label).join(" ");
	}
	updated() {
		let e = this.visibleText();
		e !== this._lastText && (this._lastText = e, this.dispatchEvent(new CustomEvent("visible-text", { detail: e })));
	}
	render() {
		let e = (e) => `${e / j * 100}%`, t = this.now;
		return y`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((e) => e.label).join(", ")}>
          ${this.notches ? [
			6,
			12,
			18
		].map((t) => y`<i class="tick" style="left:${e(t * 60)}"></i>`) : x}
          ${this.spans.map((t) => {
			let n = this._labelBox(t);
			return y`<div
              class="span ${t.ignored ? "ignored" : ""}"
              style="left:${e(t.start)};width:${e(Math.max(t.end - t.start, 5))};--c:${t.color};--fg:${Qe(t.color).fg};--sh:${Qe(t.color).shadow}"
              title=${t.label}
            >${n ? y`<span class="name" style="left:${n.left}%;width:${n.width}%">${t.label}</span>` : x}</div>`;
		})}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${t === null ? x : y`<div class="nowline" style="left:${e(t)}">
          <wp-tip class="nowic" no-tab text=${Kt(this.lang, t)} label=${this.deviceName ? `${Kt(this.lang, t)}, ${this.deviceName}` : Kt(this.lang, t)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>`}
      </div>
      ${this.showHours ? y`<div class="hours" aria-hidden="true">${[
			0,
			6,
			12,
			18,
			24
		].map((t) => y`<span style="left:${e(t * 60)}">${t === 24 ? Bt(this.lang) : F(this.lang, t * 60)}</span>`)}</div>` : x}
    `;
	}
	static {
		this.styles = l`
    ${Ze}
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
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px;
      color: var(--fg, #fff); font-size: 0.6875rem; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px var(--sh, rgba(0, 0, 0, 0.6)); padding: 0 6px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
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
    .hours { position: relative; height: 20px; font-size: 0.75rem; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
	}
};
D([T({ attribute: !1 })], qt.prototype, "spans", void 0), D([T({ type: Number })], qt.prototype, "now", void 0), D([T({ type: Boolean })], qt.prototype, "thin", void 0), D([T({
	type: Boolean,
	attribute: "show-hours"
})], qt.prototype, "showHours", void 0), D([T({
	type: Boolean,
	attribute: "no-tab"
})], qt.prototype, "noTab", void 0), D([T({ type: Boolean })], qt.prototype, "notches", void 0), D([T({ type: Boolean })], qt.prototype, "tall", void 0), D([T()], qt.prototype, "lang", void 0), D([T({ attribute: "device-name" })], qt.prototype, "deviceName", void 0), D([E()], qt.prototype, "_width", void 0), qt = D([w("wp-day-bar")], qt);
// src/radial.ts
var Jt = 1440, Yt = Jt / 2;
function Xt(e, t = !1) {
	let n = t ? Yt : Jt, r = [];
	for (let i of e) {
		if (i.ignored || !Number.isFinite(i.start) || !Number.isFinite(i.end)) continue;
		if (i.marker) {
			if (i.start < 0 || i.start >= Jt) continue;
			let e = t && i.start >= Yt ? 1 : 0;
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
		let e = Math.max(0, i.start), a = Math.min(Jt, i.end);
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
function Zt(e, t = !1, n = !1) {
	let r = t ? Yt : Jt, i = t && (e > Yt || e === Yt && !n) ? 1 : 0, a = t && i === 0 ? 78 : 112, o = (e - i * r) / r * 2 * Math.PI - Math.PI / 2;
	return {
		x: 160 + a * Math.cos(o),
		y: 160 + a * Math.sin(o)
	};
}
var Qt = (e, t, n) => ((Math.atan2(t - n.top - n.height / 2, e - n.left - n.width / 2) + Math.PI / 2) / (2 * Math.PI) + 1) % 1;
function $t(e, t, n, r = !1) {
	let i = Math.hypot((e - n.left - n.width / 2) * 320 / n.width, (t - n.top - n.height / 2) * 320 / n.height);
	return Qt(e, t, n) * (r ? Yt : Jt) + (r && i >= 95 ? Yt : 0);
}
function en(e, t, n, r, i, a = !1) {
	let o = Qt(n, r, i) - Qt(e, t, i);
	return (o > .5 ? o - 1 : o < -.5 ? o + 1 : o) * (a ? Yt : Jt);
}
// src/components/radial-day.ts
function tn(e, t, n, r, i, a) {
	let o = (r - a.left) * 320 / a.width - 160, s = (i - a.top) * 320 / a.width - 160, c = Math.hypot(o, s), l = n ? 720 : 1440, u = ((Math.atan2(s, o) + Math.PI / 2) / (2 * Math.PI) + 1) % 1 * l, d = n && c < 95 ? 0 : +!!n, f = n && d === 0 ? 78 : 112, p = n ? 24 : 36;
	if (Math.abs(c - f) > p / 2 + 4) return null;
	if (t !== null && (!n || +(t >= 720) === d)) {
		let e = Math.abs(u - (t - d * l));
		if (Math.min(e, l - e) / l * Math.PI * 2 * f * a.width / 320 <= 8) return "now";
	}
	let m = u + d * l;
	for (let t = e.length - 1; t >= 0; t--) {
		let n = e[t];
		if (!n.ignored && (n.marker ? Math.abs(m - n.start) / l * Math.PI * 2 * f * a.width / 320 <= 8 : m >= n.start && m < n.end)) return t;
	}
	return null;
}
var nn = "var(--divider-color, rgba(127, 127, 127, 0.2))", rn = (e, t) => {
	let n = e * Math.PI * 2 - Math.PI / 2;
	return {
		x: 160 + t * Math.cos(n),
		y: 160 + t * Math.sin(n)
	};
}, an = class extends S {
	constructor(...e) {
		super(...e), this.spans = [], this.now = null, this.double = !1, this.deviceName = "", this.lang = "en", this.rest = "", this.selectedTime = "", this.passive = !1;
	}
	_open() {
		this.passive || this.dispatchEvent(new CustomEvent("open-day", {
			bubbles: !0,
			composed: !0
		}));
	}
	_icon(e, t, n, r, i = !1) {
		let a = rn(e, t);
		return y`<wp-tip text=${r} label=${i && this.deviceName ? `${r}, ${this.deviceName}` : r} ?no-tab=${i} style=${`left:${a.x / 3.2}%;top:${a.y / 3.2}%`}>
      <span class="icon"><ha-icon icon=${n}></ha-icon></span></wp-tip>`;
	}
	render() {
		let e = Xt(this.spans, this.double), t = [...new Set(e.map((e) => e.source))], n = this.double || this.selectedTime.length > 45, r = this.selectedTime ? y`<div class=${n ? "selected-time outside" : "selected-time"}
      title=${this.selectedTime} aria-label=${this.selectedTime} role="status">${this.selectedTime}</div>` : x, i = this.double ? 720 : 1440, a = this.double ? 24 : 36, o = (e) => this.double && e === 0 ? 78 : 112, s = this.now !== null && Number.isFinite(this.now) && this.now >= 0 && this.now < 1440 ? this.now : null, c = this.double && s !== null && s >= 720 ? 1 : 0, l = s === null ? 0 : (s - c * i) / i;
		return y`<div class="dial"><button tabindex=${this.passive ? -1 : 0} @click=${this._open} aria-label=${k(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        ${(this.double ? [0, 1] : [0]).map((e) => b`<circle class="track" cx="160" cy="160" r=${o(e)} fill="none" stroke=${nn} stroke-width=${a} />`)}
        ${e.map((e) => {
			if (e.source.marker) {
				let t = rn(e.offset, o(e.ring));
				return b`<circle cx=${t.x} cy=${t.y} r="7" fill=${e.source.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
			}
			return b`<circle cx="160" cy="160" r=${o(e.ring)} fill="none" stroke=${e.source.color} stroke-width=${a}
            pathLength="100" stroke-dasharray="${e.fraction * 100} ${100 - e.fraction * 100}" stroke-dashoffset=${-e.offset * 100} transform="rotate(-90 160 160)" />`;
		})}
        ${(this.double ? [0, 1] : [0]).map((e) => Array.from({ length: i / 60 }, (t, n) => {
			let r = n % (this.double ? 3 : 6) == 0, s = rn(n * 60 / i, o(e) + a / 2), c = rn(n * 60 / i, o(e) + a / 2 - (r ? a : 6));
			return b`<line class="tick" x1=${s.x} y1=${s.y} x2=${c.x} y2=${c.y} stroke="var(--primary-text-color)" stroke-opacity=".35" stroke-width="1" />`;
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
			let r = rn(n / 4, this.double && e === 0 ? 53 : 145);
			return b`<text class="hour" x=${r.x} y=${r.y + 5} text-anchor="middle">${this.double ? t : String(t).padStart(2, "0")}</text>`;
		}))}
        ${s === null ? x : (() => {
			let e = rn(l, o(c) - a / 2 - 4), t = rn(l, o(c) + a / 2 + 4);
			return b`<line x1=${e.x} y1=${e.y} x2=${t.x} y2=${t.y} stroke="var(--primary-text-color)" stroke-width="3" />`;
		})()}
        ${this.selectedTime ? x : b`<text x="160" y="156" text-anchor="middle">${s === null ? Bt(this.lang) : F(this.lang, s)}</text>
        <text x="160" y="180" text-anchor="middle">${k(this.lang, "hours")}</text>`}
      </svg></button>
      ${n ? x : r}
      ${e.flatMap((e) => {
			let t = [];
			return e.start === e.source.start && e.source.startSun && t.push(this._icon(e.offset, o(e.ring), e.source.startSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", Gt(this.lang, e.source.startSpec, e.start))), !e.source.marker && e.end === e.source.end && e.end < 1440 && e.source.endSun && t.push(this._icon(e.offset + e.fraction, o(e.ring), e.source.endSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", Gt(this.lang, e.source.endSpec, e.end))), t;
		})}
      ${s === null ? x : this._icon(l, o(c) - a / 2 - 12, "mdi:clock-outline", Kt(this.lang, s), !0)}
      </div>
      ${n ? r : x}
      ${this.double ? y`<div class="rings">${k(this.lang, "radial_rings")}</div>` : x}
      <div class="legend">
        ${this.rest ? y`<span><i style=${`background:${nn}`}></i>${k(this.lang, "rest_of_time")}: ${this.rest}</span>` : x}
        ${t.map((e) => y`<span><i style=${`background:${e.color}`}></i>${e.marker ? F(this.lang, e.start) : k(this.lang, "range_from_to", {
			from: F(this.lang, e.start),
			to: F(this.lang, e.end)
		})} · ${e.label}</span>`)}
      </div>`;
	}
	static {
		this.styles = l`
    ${Ze}
    :host { display: block; }
    .dial { position: relative; max-width: 360px; margin: auto; }
    button { display: block; width: 100%; padding: 0; color: inherit; border: 0; background: none; cursor: pointer; border-radius: 50%; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); }
    svg { display: block; width: 100%; } text { fill: var(--primary-text-color); font-size: 14px; }
    wp-tip { position: absolute; transform: translate(-50%, -50%); }
    .icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 0 0 1px var(--divider-color); }
    ha-icon { --mdc-icon-size: 14px; }
    .selected-time {
      position: absolute; left: 34%; top: 50%; transform: translateY(-50%); width: 32%;
      box-sizing: border-box; padding: 3px; border-radius: 8px; text-align: center; pointer-events: none;
      background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121);
      font-size: 0.75rem; font-weight: 600; line-height: 1.25; overflow-wrap: anywhere;
    }
    .selected-time.outside {
      position: static; transform: none; width: 100%; max-width: 360px; margin: 0 auto 8px;
      padding: 6px 10px; border: 1px solid var(--divider-color); font-size: 0.875rem; line-height: 1.4;
    }
    .rings { text-align: center; font-size: 0.75rem; color: var(--secondary-text-color); margin: 0 0 8px; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 0.8125rem; padding: 4px 0 12px; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; } i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  `;
	}
};
D([T({ attribute: !1 })], an.prototype, "spans", void 0), D([T({ type: Number })], an.prototype, "now", void 0), D([T({ type: Boolean })], an.prototype, "double", void 0), D([T({ attribute: "device-name" })], an.prototype, "deviceName", void 0), D([T()], an.prototype, "lang", void 0), D([T()], an.prototype, "rest", void 0), D([T({ attribute: !1 })], an.prototype, "selectedTime", void 0), D([T({ type: Boolean })], an.prototype, "passive", void 0), an = D([w("wp-radial-day")], an);
// src/components/dialog.ts
var on = [];
function sn() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e && e !== document.body ? e : null;
}
var cn = "a[href], button, input:not([type=\"hidden\"]), select, textarea, summary, [tabindex], [contenteditable=\"true\"]", ln = /* @__PURE__ */ new Set([
	"HEAD",
	"SCRIPT",
	"STYLE",
	"LINK",
	"META",
	"TEMPLATE"
]);
function un(e) {
	if (!e.matches(cn) || e.hasAttribute("disabled") || e.hasAttribute("hidden") || e.hasAttribute("inert")) return !1;
	let t = e.getAttribute("tabindex");
	return t !== null && Number(t) < 0 ? !1 : typeof e.checkVisibility != "function" || e.checkVisibility();
}
function dn(e, t = []) {
	for (let n of Array.from(e.children)) if (n instanceof HTMLSlotElement) {
		let e = n.assignedElements({ flatten: !0 });
		for (let r of e.length ? e : Array.from(n.children)) un(r) && t.push(r), dn(r.shadowRoot ?? r, t);
	} else un(n) && t.push(n), dn(n.shadowRoot ?? n, t);
	return t;
}
var fn = /* @__PURE__ */ new Map();
function pn(e) {
	let t = [], n = (e) => {
		if (ln.has(e.tagName)) return;
		let n = fn.get(e);
		if (n) n.n++;
		else {
			let t = !e.hasAttribute("inert");
			t && e.setAttribute("inert", ""), fn.set(e, {
				n: 1,
				own: t
			});
		}
		t.push(e);
	}, r = e;
	for (; r;) {
		let e = r.assignedSlot ?? null;
		if (e) {
			for (let t of e.assignedElements()) t !== r && n(t);
			r = e;
			continue;
		}
		let t = r.parentNode ?? r.host ?? null;
		if (!t) break;
		let i = t.children;
		if (i && r.parentNode) for (let e of Array.from(i)) e !== r && n(e);
		r = t === document ? null : t;
	}
	return t;
}
function mn(e) {
	for (let t of e) {
		let e = fn.get(t);
		e && --e.n <= 0 && (fn.delete(t), e.own && t.removeAttribute("inert"));
	}
}
var hn = class extends S {
	constructor(...e) {
		super(...e), this.heading = "", this.open = !1, this.wide = !1, this.compact = !1, this.columns = !1, this.dialogRole = "dialog", this.description = "", this._expanded = !1, this._opener = null, this._tracked = !1, this._inerted = [], this._onDocKey = (e) => {
			e.key === "Tab" && !e.defaultPrevented && on[on.length - 1] === this && !e.composedPath().includes(this) ? this._trap(e) : e.key !== "Escape" || e.defaultPrevented || on[on.length - 1] !== this || (e.stopPropagation(), this._escape());
		}, this._onKey = (e) => {
			e.key === "Tab" && !e.defaultPrevented && on[on.length - 1] === this ? this._trap(e) : e.key === "Escape" && (e.stopPropagation(), this._escape());
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("keydown", this._onKey);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("keydown", this._onKey), this._release();
	}
	_track() {
		this._tracked || (this._tracked = !0, this._opener = sn(), this._inerted = pn(this), on.push(this), document.addEventListener("keydown", this._onDocKey));
	}
	_release() {
		if (!this._tracked) return;
		this._tracked = !1;
		let e = on.indexOf(this);
		e >= 0 && on.splice(e, 1), on.length || document.removeEventListener("keydown", this._onDocKey), mn(this._inerted), this._inerted = [];
		let t = this._opener;
		this._opener = null, t?.isConnected && (t.focus({ preventScroll: !0 }), sn() !== t && requestAnimationFrame(() => {
			t.isConnected && !sn() && t.focus({ preventScroll: !0 });
		}));
	}
	_escape() {
		let e = new CustomEvent("escape", { cancelable: !0 });
		this.dispatchEvent(e), e.defaultPrevented || this.close();
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
	_trap(e) {
		let t = this._panel();
		if (!t) return;
		let n = dn(t);
		if (e.preventDefault(), !n.length) {
			t.focus();
			return;
		}
		let r = n.indexOf(sn());
		e.shiftKey ? n[r <= 0 ? n.length - 1 : r - 1].focus() : n[r < 0 || r === n.length - 1 ? 0 : r + 1].focus();
	}
	_focusFirst() {
		let e = this._panel();
		if (!e) return;
		let t = e.querySelector(".content");
		((t ? dn(t).find((e) => !(this._isPhone() && e.matches("input:not([type=\"checkbox\"]):not([type=\"radio\"]), textarea"))) : void 0) ?? e).focus();
	}
	updated(e) {
		e.has("open") && (this.open ? (this._track(), requestAnimationFrame(() => {
			this.open && this._focusFirst();
		})) : this._release());
	}
	close() {
		this.open = !1, this._release(), this.dispatchEvent(new CustomEvent("closed", {
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return this.open ? y`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : this.columns ? "columns" : ""}" role=${this.dialogRole} aria-modal="true"
        aria-label=${this.heading} aria-describedby=${this.description ? "wp-desc" : x} tabindex="-1">
        ${this.description ? y`<span id="wp-desc" class="sr-only">${this.description}</span>` : x}
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${document.documentElement.lang?.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
        <button class="expand" aria-expanded=${this._expanded} aria-label=${O(document.documentElement.lang || "en").expand_dialog}
          title=${O(document.documentElement.lang || "en").expand_dialog}
          @click=${() => {
			this._expanded = !this._expanded;
		}}><ha-icon icon=${this._expanded ? "mdi:arrow-collapse-horizontal" : "mdi:arrow-expand-horizontal"}></ha-icon></button>
      </div>
    ` : y``;
	}
	static {
		this.styles = l`
    ${Ze}
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
    .expand {
      position: absolute; top: 16px; right: 68px; width: 48px; height: 48px; border: none; background: none; color: inherit;
      --mdc-icon-size: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    .expand:hover { background: var(--secondary-background-color); }
    .expand:focus-visible, button.icon:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    h2 { padding-right: 52px; }
    header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px 20px; }
    header { touch-action: none; }
    h2 {
      flex: 1; min-width: 0; margin: 0; font-size: 1.25rem; font-weight: 500;
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
      h2 { font-size: 1.125rem; padding-right: 0; }
      .expand { display: none; }
      .panel, .panel.wide, .panel.expanded {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
      /* confirmation / choice: content-sized bottom sheet over the backdrop instead of a full screen */
      :host([compact]) .panel, :host([compact]) .panel.wide, :host([compact]) .panel.expanded {
        left: 0; right: 0; top: auto; bottom: 0; width: 100%; height: auto; max-height: 90vh; max-height: 90dvh;
        border-radius: var(--ha-card-border-radius, 16px) var(--ha-card-border-radius, 16px) 0 0;
      }
    }
  `;
	}
};
D([T()], hn.prototype, "heading", void 0), D([T({
	type: Boolean,
	reflect: !0
})], hn.prototype, "open", void 0), D([T({ type: Boolean })], hn.prototype, "wide", void 0), D([T({
	type: Boolean,
	reflect: !0
})], hn.prototype, "compact", void 0), D([T({ type: Boolean })], hn.prototype, "columns", void 0), D([T({ attribute: "dialog-role" })], hn.prototype, "dialogRole", void 0), D([T()], hn.prototype, "description", void 0), D([E()], hn.prototype, "_expanded", void 0), hn = D([w("wp-dialog")], hn);
// src/holiday.ts
var gn = (e) => e?.holiday ? "copy" in e.holiday ? "copy" : "own" : "none", _n = (e) => e?.holiday && "day" in e.holiday ? e.holiday.day : [], vn = (e) => [...e.days.flat(), ..._n(e)];
function yn(e, t, n) {
	return !t.holiday_today || !n || !e.holiday ? null : "copy" in e.holiday ? e.days[e.holiday.copy] ?? null : e.holiday.day;
}
var bn = (e, t) => !!e?.status[t]?.holiday;
function xn(e, t, n) {
	let r = O(e).days.map((t) => t.toLocaleLowerCase(e));
	return "copy" in t ? t.copy === n ? null : k(e, "holiday_line_copy", {
		copied: r[t.copy],
		actual: r[n]
	}) : k(e, "holiday_line_own", { actual: r[n] });
}
// src/slots.ts
var Sn = {
	dawn: "next_dawn",
	sunrise: "next_rising",
	sunset: "next_setting",
	dusk: "next_dusk"
}, Cn = {
	dawn: 360,
	sunrise: 420,
	sunset: 1140,
	dusk: 1200
};
function wn(e, t) {
	if ("time" in t) return M(t.time);
	let n = e.states["sun.sun"]?.attributes[Sn[t.sun]], r = n ? N(n, e.config.time_zone) : Cn[t.sun];
	return r += t.offset ?? 0, t.earliest && (r = Math.max(r, M(t.earliest))), t.latest && (r = Math.min(r, M(t.latest))), Math.max(0, Math.min(j, r));
}
function Tn(e, t, n) {
	let r = t.random_minutes ? { random_minutes: t.random_minutes } : {};
	if ("time" in t) return {
		...t,
		time: Ft(M(t.time) + n)
	};
	let i = (t.offset ?? 0) + n;
	return Math.abs(i) <= 240 ? {
		...t,
		offset: i
	} : {
		time: Ft(wn(e, t) + n),
		...r
	};
}
function En(e) {
	return !!(e && "sun" in e && e.earliest && e.latest && M(e.earliest) > M(e.latest));
}
function Dn(e) {
	let t = Lt(e.start);
	if (t === null || !e.end) return null;
	let n = Lt(e.end);
	return n === null ? null : n > t ? [t, n] : [t, j];
}
function On(e) {
	let t = e.map((e) => ({
		slot: e,
		iv: Dn(e)
	})).filter((e) => e.iv !== null).sort((e, t) => e.iv[0] - t.iv[0]);
	if (t.some((e) => e.slot.entities !== void 0)) {
		for (let e = 1; e < t.length; e++) {
			let n = null;
			for (let r = 0; r < e; r++) {
				let i = t[r];
				i.iv[1] > t[e].iv[0] && An(i.slot, t[e].slot) && (!n || i.iv[1] > n.iv[1]) && (n = i);
			}
			if (n) return [n.slot, t[e].slot];
		}
		return null;
	}
	let n = t[0]?.iv[1] ?? 0, r = t[0]?.slot;
	for (let e = 1; e < t.length; e++) {
		if (t[e].iv[0] < n) return [r, t[e].slot];
		t[e].iv[1] > n && (n = t[e].iv[1], r = t[e].slot);
	}
	return null;
}
function kn(e, t) {
	return e.entities === void 0 || e.entities.includes(t);
}
function An(e, t) {
	return e.entities === void 0 || t.entities === void 0 || e.entities.some((e) => t.entities.includes(e));
}
function jn(e, t) {
	return e.entities === void 0 ? [...t] : t.filter((t) => e.entities.includes(t));
}
function Mn(e, t) {
	let n = t.filter((t) => e.includes(t));
	if (!(t.length > 0 && n.length === t.length)) return n;
}
function Nn(e, t) {
	if (e.entities === void 0 || t.entities === void 0) return e.entities === t.entities;
	let n = [...e.entities].sort(), r = [...t.entities].sort();
	return n.length === r.length && n.every((e, t) => e === r[t]);
}
// src/preview-cache.ts
var Pn = 6e5, Fn = 400, In = /* @__PURE__ */ new Map(), Ln = /* @__PURE__ */ new Map(), Rn, zn;
function Bn() {
	In.clear(), Ln.clear();
}
function Vn(e) {
	Rn !== void 0 && e.card_version !== Rn && Bn(), Rn = e.card_version, zn !== void 0 && !!e.holiday_today !== zn && Bn(), zn = !!e.holiday_today;
	let t = /* @__PURE__ */ new Set();
	for (let n of e.programs) t.add(n.id), Ln.get(n.id) !== n.revision && Hn(n.id), Ln.set(n.id, n.revision);
	for (let e of [...Ln.keys()]) t.has(e) || (Hn(e), Ln.delete(e));
}
function Hn(e) {
	let t = `${e}\u0000`;
	for (let e of [...In.keys()]) e.startsWith(t) && In.delete(e);
}
function Un(e, t, n, r, i, a = !0) {
	let o = [
		t,
		n,
		r,
		i ?? ""
	].join("\0"), s = Date.now(), c = In.get(o);
	if (c && s - c.at < Pn) return c.promise;
	In.size >= Fn && In.delete(In.keys().next().value);
	let l = e.callWS({
		type: "weekly_planner/preview",
		program_id: t,
		date: r,
		...i && a ? { profile_id: i } : {}
	}).then((e) => ({
		slots: e?.slots ?? [],
		...e?.by_entity ? { by_entity: e.by_entity } : {},
		...e?.holiday ? { holiday: !0 } : {}
	}));
	return In.set(o, {
		at: s,
		promise: l
	}), l.catch(() => {
		In.get(o)?.promise === l && In.delete(o);
	}), l;
}
function Wn(e, t) {
	return e.by_entity ? e.by_entity[t] ?? [] : e.slots.filter((e) => kn(e, t));
}
function Gn(e, t, n) {
	return e?.by_entity ? {
		today: Wn(e, n),
		previous: []
	} : {
		today: e && Wn(e, n),
		previous: t && Wn(t, n)
	};
}
// src/planner.ts
var Kn, qn, Jn = /* @__PURE__ */ new Set(), Yn, Xn = 1e3, Zn = 0;
function Qn(e) {
	if (qn || !Jn.size) return;
	let t = Zn, n = e.connection.subscribeMessage((e) => {
		t === Zn && (Xn = 1e3, Kn = e, Vn(e), Jn.forEach((t) => t(e)));
	}, { type: "weekly_planner/subscribe" });
	qn = n, n.catch(() => {
		qn === n && t === Zn && (qn = void 0, Jn.size && (Yn = setTimeout(() => {
			Yn = void 0, Qn(e);
		}, Xn), Xn = Math.min(Xn * 2, 3e4)));
	});
}
function $n(e, t) {
	return Jn.add(t), Kn && t(Kn), Yn || Qn(e), () => {
		Jn.delete(t), Jn.size || (Zn++, Yn && clearTimeout(Yn), Yn = void 0, Xn = 1e3, qn?.then((e) => e()).catch(() => void 0), qn = void 0, Kn = void 0);
	};
}
var er = (e) => e.split(".")[0], tr = {
	id: "",
	name: "",
	days: [
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	]
};
function I(e, t) {
	let n = nr(e, t);
	return n ? rr(e, n) : tr;
}
function nr(e, t) {
	let n = t.mode?.selector ? t.mode.active : null;
	return n == null ? e.profiles[0] : e.profiles.find((e) => e.name === n);
}
function rr(e, t) {
	if (!t.follows) return t;
	let n = e.profiles.find((e) => e.name === t.follows);
	return n && n !== t && !n.follows ? n : t;
}
function ir(e, t) {
	let n = nr(e, t);
	return n && rr(e, n) !== n ? n.follows ?? null : null;
}
function L(e, t) {
	return e.states[t]?.attributes.friendly_name ?? t;
}
var ar = (e) => e.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
function or(e, t) {
	let n = /* @__PURE__ */ new Set(), r = new Set(e.map((e) => e.id));
	for (let i of t) {
		if (r.has(i)) {
			n.add(i);
			continue;
		}
		let t = ar(String(i));
		if (t) for (let r of e) ar(r.name) === t && n.add(r.id);
	}
	return n;
}
function sr(e, t) {
	if (t.program) {
		let n = or(e.programs, [t.program]);
		return e.programs.filter((e) => n.has(e.id));
	}
	let n = t.filter?.types, r = t.filter?.area, i = t.filter?.programs === void 0 ? void 0 : or(e.programs, t.filter.programs);
	return e.programs.filter((e) => !n?.length || e.entities.some((e) => n.includes(er(e.entity_id)))).filter((e) => !r || e.area === r).filter((e) => !i || i.has(e.id)).sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name));
}
function R() {
	return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}
function cr(e) {
	return e.map((e) => {
		let t = {
			...structuredClone(e),
			id: R()
		};
		return delete t.seed, t;
	});
}
var lr = /* @__PURE__ */ new Map();
function ur(e, t) {
	let n = lr.get(e);
	return n || lr.set(e, n = new Intl.NumberFormat(e, { maximumFractionDigits: 1 })), n.format(t);
}
async function dr() {
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
var fr = /* @__PURE__ */ new Set([
	"entity_id",
	"device_id",
	"area_id",
	"floor_id",
	"label_id"
]), pr, mr = /* @__PURE__ */ new Set(), hr = /* @__PURE__ */ new Set(), gr = 0, _r = () => gr;
function vr(e) {
	return hr.add(e), () => {
		hr.delete(e);
	};
}
async function yr(e, t) {
	let n = [...new Set(t)].filter((e) => !mr.has(e));
	if (!n.length || !e.loadBackendTranslation) return !1;
	n.forEach((e) => mr.add(e));
	try {
		let t = await Promise.all(n.map((t) => e.loadBackendTranslation("services", t)));
		return pr = t[t.length - 1] ?? pr, gr++, hr.forEach((e) => e()), !0;
	} catch {
		return n.forEach((e) => mr.delete(e)), !1;
	}
}
function br(e, t) {
	for (let n of [e.localize, pr]) {
		let e = n?.(t);
		if (e) return e;
	}
	return "";
}
var xr = (e, t) => {
	let [n, r] = t.split(".");
	return e.services?.[n]?.[r];
};
function Sr(e, t) {
	let [n, r] = t.split(".");
	return br(e, `component.${n}.services.${r}.name`) || xr(e, t)?.name || t;
}
function Cr(e, t) {
	let [n, r] = t.split(".");
	return br(e, `component.${n}.services.${r}.description`) || xr(e, t)?.description || "";
}
function wr(e, t, n) {
	let r = Array.isArray(e) ? e : e ? [e] : [], i = Number(t?.attributes.supported_features ?? 0);
	return r.some((e) => (e.domain === void 0 ? [] : Array.isArray(e.domain) ? e.domain : [e.domain]).includes(n) ? !e.supported_features?.length || e.supported_features.some((e) => Array.isArray(e) ? e.every((e) => (i & e) === e) : (i & e) === e) : !1);
}
function Tr(e, t, n) {
	let r = er(t), i = e.states[t], a = [];
	for (let [t, o] of Object.entries(e.services ?? {})) if (t !== "homeassistant") for (let [s, c] of Object.entries(o)) {
		if (!c.target) continue;
		let o = c.target.entity, l = !o || Array.isArray(o) && !o.length;
		if (!wr(o, i, r) && !(t === r && l) || Object.values(c.fields ?? {}).some((e) => e.required && (!e.selector || "text" in e.selector || "object" in e.selector))) continue;
		let u = `${t}.${s}`;
		(n === void 0 || n.includes(u)) && a.push({
			id: u,
			domain: t,
			service: s,
			label: Sr(e, u)
		});
	}
	return a.sort((e, t) => e.label.localeCompare(t.label));
}
function Er(e, t) {
	return [...new Set(Tr(e, t).map((e) => e.domain))];
}
function Dr(e, t) {
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
function Or(e, t, n) {
	let [r, i] = t.split("."), a = n ? e.states[n] : void 0, o = e.services?.[r] ?? {}, s = [], c = (t) => {
		for (let [n, l] of Object.entries(t ?? {})) l.fields ? c(l.fields) : l.advanced || fr.has(n) || l.selector?.target || !Dr(l, a) || !l.required && i !== `set_${n}` && `set_${n}` in o || s.push({
			key: n,
			selector: l.selector ?? { text: {} },
			required: !!l.required || r === "climate" && i === `set_${n}` && n in jr,
			default: l.default,
			label: br(e, `component.${r}.services.${i}.fields.${n}.name`) || l.name || n
		});
	};
	return c(xr(e, t)?.fields), s.length && !s.some((e) => e.required) && (s[0] = {
		...s[0],
		required: !0
	}), [...s.filter((e) => e.required), ...s.filter((e) => !e.required)];
}
function kr(e, t, n) {
	let r = e.states[n]?.attributes ?? {}, i = {};
	for (let a of Or(e, t, n)) {
		if (!a.required) continue;
		let e = a.selector.number;
		a.default === void 0 ? a.key === "temperature" ? i[a.key] = typeof r.temperature == "number" ? r.temperature : 19 : e && (i[a.key] = a.key === "position" ? 50 : e.min ?? 0) : i[a.key] = a.default;
	}
	return i;
}
function Ar(e, t, n, r, i) {
	return Or(e, t, r).filter((e) => i?.[e.key] ? !i[e.key].entity_id : e.required && (n?.[e.key] === void 0 || n[e.key] === "" || n[e.key] === null)).map((e) => e.label);
}
var jr = {
	hvac_mode: "hvac_modes",
	preset_mode: "preset_modes",
	fan_mode: "fan_modes",
	swing_mode: "swing_modes",
	swing_horizontal_mode: "swing_horizontal_modes"
};
function Mr(e, t, n) {
	let r = n.selector, i = r.state;
	if (!i && !r.select) return;
	let a = i?.attribute ?? jr[n.key], o = e.states[t], s = a ? o?.attributes[a] : void 0;
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
var Nr = [
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
], Pr = [
	"color_red",
	"color_orange",
	"color_yellow",
	"color_light_green",
	"color_cyan",
	"color_light_blue",
	"color_indigo",
	"color_purple",
	"color_pink",
	"color_brown",
	"color_blue_grey",
	"color_green"
];
function Fr(e) {
	let t = new Set(e.map((e) => e.color.toLowerCase()));
	return Nr.find((e) => !t.has(e)) ?? Nr[e.length % Nr.length];
}
var z = (e, t) => t ? e.labels.find((e) => e.id === t) : void 0, Ir = /^[a-z0-9_]+\.[a-z0-9_]+$/;
function B(e, t) {
	if (!Ir.test(t.name)) return t.name;
	let n = Sr(e, t.name);
	if (n !== t.name) return n;
	let r = t.name.split(".")[1].replace(/_/g, " ");
	return r.charAt(0).toUpperCase() + r.slice(1);
}
function Lr(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) n.action.kind === "service" && t.add(n.action.service.split(".")[0]), Ir.test(n.name) && t.add(n.name.split(".")[0]);
	return [...t];
}
function Rr(e, t) {
	return Object.values(e.states).filter((e) => e.entity_id.startsWith("scene.") && Array.isArray(e.attributes.entity_id) && e.attributes.entity_id.includes(t)).sort((e, t) => String(e.attributes.friendly_name ?? e.entity_id).localeCompare(String(t.attributes.friendly_name ?? t.entity_id)));
}
var zr = (e, t) => {
	let n = e?.entities.find((e) => e.entity_id === t);
	return n?.restrict_services || n?.allowed_services?.length ? n.allowed_services ?? [] : void 0;
};
function Br(e, t, n, r) {
	if (n.kind === "scene") {
		let r = e.states[n.scene]?.attributes.entity_id;
		return !Array.isArray(r) || r.includes(t);
	}
	if (r !== void 0 && !r.includes(n.service)) return !1;
	let i = n.target_entity_id ?? t;
	return i ? n.service.split(".")[0] === i.split(".")[0] || Tr(e, i).some((e) => e.id === n.service) : !1;
}
function Vr(e, t, n, r) {
	return t.labels.filter((t) => n.some((n) => Br(e, n, t.action, zr(r, n))));
}
function Hr(e, t, n) {
	if (n) return e.entities.find((e) => e.entity_id === t)?.label_overrides?.[n.id] ?? n.action;
}
function Ur(e, t, n, r, i) {
	if (i && !kn(i, n)) return;
	let a = Hr(t, n, r);
	return a && Br(e, n, a, zr(t, n)) ? a : void 0;
}
function Wr(e, t, n, r = "") {
	return n ? t.entities.map((e) => e.entity_id).filter((i) => i !== r && !!Ur(e, t, i, n)) : [];
}
var Gr = (e, t, n) => !!e.entities.find((e) => e.entity_id === t)?.label_overrides?.[n], Kr = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function qr(e) {
	if (!e || e.kind !== "service" || e.target_entity_id) return null;
	let t = e.data ?? {};
	return Kr(e.data_sources?.temperature ? null : t.temperature) ?? Kr(e.data_sources?.position ? null : t.position) ?? Kr(e.data_sources?.brightness_pct ? null : t.brightness_pct);
}
function Jr(e, t, n) {
	if (!n) return "";
	if (n.kind === "scene") return String(e.states[n.scene]?.attributes.friendly_name ?? n.scene);
	if (n.target_entity_id) return `${Sr(e, n.service)} · ${e.states[n.target_entity_id]?.attributes.friendly_name ?? n.target_entity_id}`;
	if (Object.keys(n.data_sources ?? {}).length) return Yr(e, n);
	let r = n.data ?? {};
	return Kr(r.temperature) === null ? Kr(r.position) === null ? Kr(r.brightness_pct) === null ? Sr(e, n.service) : `${r.brightness_pct} %` : `${r.position} %` : `${ur(t, Number(r.temperature))} °C`;
}
function Yr(e, t) {
	return Object.values(t.data_sources ?? {}).map((t) => {
		let n = e.states[t.entity_id], r = String(n?.attributes.friendly_name ?? t.entity_id), i = t.attribute ? n?.attributes[t.attribute] : n?.state, a = n && !["unknown", "unavailable"].includes(n.state) && i != null;
		return `${r}${t.attribute ? ` · ${t.attribute}` : ""}${a && [
			"string",
			"number",
			"boolean"
		].includes(typeof i) ? ` (${i})` : ""}`;
	}).join(" · ");
}
function Xr(e, t, n, r) {
	if (!n) return "";
	if (n.kind === "scene") return Jr(e, t, n);
	let i = [], a = n.target_entity_id ?? r, o = a ? e.states[a] : void 0, s = e.formatEntityState;
	for (let [e, r] of Object.entries(n.data ?? {})) if (!n.data_sources?.[e]) {
		if (typeof r == "number") i.push(e === "temperature" ? `${ur(t, r)} °C` : e === "position" || e === "brightness_pct" ? `${r} %` : ur(t, r));
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
	return Object.keys(n.data_sources ?? {}).length && i.push(Yr(e, n)), [
		Sr(e, n.service),
		...n.target_entity_id ? [String(e.states[n.target_entity_id]?.attributes.friendly_name ?? n.target_entity_id)] : [],
		...i
	].join(" · ");
}
function Zr(e, t) {
	return e.programs.filter((e) => e.entities.some((e) => e.default_label === t || t in (e.label_overrides ?? {})) || e.profiles.some((e) => e.days.some((e) => e.some((e) => e.label === t)) || _n(e).some((e) => e.label === t))).map((e) => e.name);
}
// src/select-value.ts
function Qr(e) {
	for (let t of e.querySelectorAll("select[data-value]")) {
		let e = t.dataset.value ?? "";
		t.value !== e && (t.value = e);
	}
}
// src/editors/shared.ts
var $r = (e) => e?.locale?.language ?? e?.language ?? "en";
function ei(e, t, n, r) {
	return y`<button class="row opts" aria-expanded=${t} @click=${n}>
      <ha-icon icon=${t ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
      <span class="txt">${k(e, "advanced_options")}</span></button>
    ${t ? y`<div class="opts-body">${r}</div>` : x}`;
}
var ti = l`
  ${nt}
  .row.opts { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; margin: 0 0 8px; padding: 0 12px; border-radius: 12px;
    border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem; cursor: pointer; text-align: left; }
  .row.opts .txt { flex: 1; }
  .opts-body { margin: 0 0 12px; padding: 8px 0 0 12px; border-left: 3px solid var(--divider-color); }
  :host { display: block; color: var(--primary-text-color); font-size: 0.875rem; }
  * { box-sizing: border-box; }
  .field { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; min-width: 0; }
  .field > label, .label { font-size: 0.75rem; color: var(--secondary-text-color); }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .row > .field { flex: 1 1 140px; }
  input[type="text"], input[type="number"], input[type="time"], input[type="date"], input:not([type]),
  select, textarea {
    width: 100%; min-height: 48px; padding: 8px 10px; font: inherit; color: var(--primary-text-color);
    background: var(--card-background-color, #fff); border: 1px solid var(--wp-field-border);
    border-radius: 8px;
  }
  textarea { min-height: 72px; font-family: monospace; }
  input[type="color"] { width: 56px; height: 48px; padding: 2px; border: 1px solid var(--wp-field-border);
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
  .btn.primary { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; }
  .btn.danger { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
  .btn:disabled { opacity: 0.45; cursor: default; }
  .ibtn {
    min-width: 48px; min-height: 48px; border-radius: 24px; border: none; background: none; --mdc-icon-size: 20px;
    color: inherit; cursor: pointer; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center;
  }
  .ibtn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .ibtn:disabled { opacity: 0.35; cursor: default; }
  .error { color: var(--wp-danger-text);
    font-size: 1rem; font-weight: 500; margin: 8px 0; }
  .field-error { margin: 2px 0 4px; }
  input[aria-invalid="true"] { border-color: var(--wp-danger-text); border-width: 2px; }
  .hint { display: flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; color: var(--secondary-text-color); font-size: 0.75rem; margin: 4px 0; }
  .card {
    border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 12px; margin: 8px 0;
  }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .grow { flex: 1; min-width: 0; }
`;
function ni(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !0
	}));
}
var ri = class extends S {
	constructor(...e) {
		super(...e), this.value = "", this.label = "", this.disabled = !1, this.required = !1, this.domains = [], this.exclude = [], this._listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;
	}
	_ids() {
		return Object.keys(this.hass?.states ?? {}).filter((e) => !this.domains.length || this.domains.includes(er(e))).filter((e) => !this.exclude.includes(e)).filter((e) => !this.filter || this.filter(e)).sort();
	}
	_emit(e) {
		ni(this, "wp-change", e);
	}
	render() {
		if (customElements.get("ha-entity-picker")) {
			let e = this.filter;
			return y`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label} .disabled=${this.disabled} .required=${this.required}
        .includeDomains=${this.domains.length ? this.domains : void 0}
        .excludeEntities=${this.exclude}
        .entityFilter=${e ? (t) => e(t.entity_id) : void 0}
        @value-changed=${(e) => {
				e.stopPropagation(), this._emit(e.detail.value ?? "");
			}}></ha-entity-picker>`;
		}
		let e = this._ids().slice(0, 600);
		return y`
      <div class="field">
        ${this.label ? y`<label>${this.label}</label>` : x}
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
          ${e.map((e) => y`<option value=${e}>${L(this.hass, e)}</option>`)}
        </datalist>
      </div>`;
	}
	static {
		this.styles = [ti, l`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
	}
};
D([T({ attribute: !1 })], ri.prototype, "hass", void 0), D([T()], ri.prototype, "value", void 0), D([T()], ri.prototype, "label", void 0), D([T({ type: Boolean })], ri.prototype, "disabled", void 0), D([T({ type: Boolean })], ri.prototype, "required", void 0), D([T({ attribute: !1 })], ri.prototype, "domains", void 0), D([T({ attribute: !1 })], ri.prototype, "exclude", void 0), D([T({ attribute: !1 })], ri.prototype, "filter", void 0), ri = D([w("wp-entity-picker")], ri);
var ii = class extends S {
	constructor(...e) {
		super(...e), this.conditions = [];
	}
	get _lang() {
		return $r(this.hass);
	}
	_tr(e) {
		return k(this._lang, e);
	}
	_set(e) {
		ni(this, "wp-change", e);
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
		return y`
      ${this.conditions.map((e, t) => y`
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
		].map((t) => y`<option value=${t} ?selected=${(e.op ?? "eq") === t}>${{
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
		this.styles = ti;
	}
};
D([T({ attribute: !1 })], ii.prototype, "hass", void 0), D([T({ attribute: !1 })], ii.prototype, "conditions", void 0), ii = D([w("wp-conditions-editor")], ii);
// src/components/action-picker.ts
var ai, oi = class extends S {
	static {
		ai = this;
	}
	constructor(...e) {
		super(...e), this.entityId = "", this.action = null, this.disabled = !1, this.advancedOpen = !1, this.noFold = !1, this._advOpen = !1, this._advTouched = !1, this._selector = !!customElements.get("ha-selector"), this._loadedFor = "";
	}
	get _lang() {
		return $r(this.hass);
	}
	static {
		this.ADVANCED_KEYS = /* @__PURE__ */ new Set(["target_temp_high", "target_temp_low"]);
	}
	_isAdvanced(e) {
		return ai.ADVANCED_KEYS.has(e.key) && !e.required;
	}
	_advancedUsed(e, t) {
		let n = this.action?.kind === "service" ? this.action : void 0;
		return t || this.advancedOpen || Object.keys(n?.data_sources ?? {}).length > 0 || e.some((e) => this._isAdvanced(e) && (n?.data?.[e.key] !== void 0 || n?.data_sources?.[e.key] !== void 0));
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
		Qr(this.renderRoot), this.hass && this._targetEntity && this._loadedFor !== this._targetEntity && (this._loadedFor = this._targetEntity, yr(this.hass, Er(this.hass, this._targetEntity)).then((e) => e && this.requestUpdate()), this._selector || dr().then((e) => this._selector = e));
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
	_input(e, t) {
		return this._selector ? y`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(e)} .context=${this._context(e)} .value=${t[e.key]} .label=${e.label}
        .required=${e.required} ?disabled=${this.disabled}
        @value-changed=${(t) => {
			t.stopPropagation(), this._setData(e.key, t.detail.value);
		}}></ha-selector>` : y`<div class="field"><label>${e.label}</label><input type="text" .value=${String(t[e.key] ?? "")} ?disabled=${this.disabled}
        @change=${(t) => this._setData(e.key, t.target.value)} /></div>`;
	}
	_sourceOf(e) {
		return this.action?.kind === "service" ? this.action.data_sources?.[e.key] : void 0;
	}
	_field(e, t) {
		return this._sourceOf(e) ? x : this._input(e, t);
	}
	_sourceBlock(e) {
		let t = this._sourceOf(e), n = t ? this.hass.states[t.entity_id] : void 0, r = t?.attribute ? n?.attributes[t.attribute] : n?.state, i = n && !["unknown", "unavailable"].includes(n.state) && r != null ? typeof r == "object" ? JSON.stringify(r) : String(r) : k(this._lang, "value_unavailable"), a = [.../* @__PURE__ */ new Set([...Object.keys(n?.attributes ?? {}), ...t?.attribute ? [t.attribute] : []])].sort();
		return y`<div class="source-field">
      <div class="field"><label for=${`source-${e.key}`}>${e.label}</label>
        <select id=${`source-${e.key}`} data-value=${t ? "entity" : "fixed"} ?disabled=${this.disabled}
          @change=${(t) => this._setSource(e.key, t.target.value === "entity" ? {
			entity_id: "",
			type: this._sourceType(e)
		} : void 0)}>
          <option value="fixed">${k(this._lang, "value_fixed")}</option>
          <option value="entity">${k(this._lang, "value_entity")}</option>
        </select></div>
      ${t ? y`<wp-entity-picker .hass=${this.hass} .value=${t.entity_id} .label=${k(this._lang, "value_source")}
          .disabled=${this.disabled}
          @wp-change=${(n) => {
			n.stopPropagation(), this._setSource(e.key, {
				...t,
				entity_id: n.detail
			});
		}}></wp-entity-picker>
        <div class="field"><label for=${`attribute-${e.key}`}>${k(this._lang, "value_read")}</label>
          <select id=${`attribute-${e.key}`} data-value=${t.attribute ?? ""} ?disabled=${this.disabled}
            @change=${(n) => {
			let r = n.target.value;
			this._setSource(e.key, {
				entity_id: t.entity_id,
				type: t.type,
				...r ? { attribute: r } : {}
			});
		}}>
            <option value="">${k(this._lang, "value_state")}</option>
            ${a.map((e) => y`<option value=${e}>${e}</option>`)}
          </select></div>
        ${t.entity_id ? y`<p class="hint" role="status">${k(this._lang, "value_current", { value: i })}</p>` : x}
        <p class="hint">${k(this._lang, "value_at_execution")}</p>` : x}
    </div>`;
	}
	_context(e) {
		let t = e.selector.state;
		return {
			filter_entity: [this._targetEntity],
			filter_target: { entity_id: [this._targetEntity] },
			entity_id: this._targetEntity,
			filter_attribute: t?.attribute ?? jr[e.key]
		};
	}
	_selectorOf(e) {
		let t = Mr(this.hass, this._targetEntity, e);
		return t ? { select: {
			options: t,
			mode: "dropdown"
		} } : e.selector;
	}
	render() {
		if (!this.hass) return x;
		let e = this._lang, t = this.action?.kind === "service" && this.action.target_entity_id !== void 0, n = this._targetEntity, r = this.action?.kind === "service" ? this.action.service : "", i = n ? Tr(this.hass, n, this.allowed !== void 0 && r ? [...this.allowed, r] : this.allowed) : [];
		if (r && !i.some((e) => e.id === r)) {
			let [e, t] = r.split(".");
			i.push({
				id: r,
				domain: e,
				service: t,
				label: Sr(this.hass, r)
			});
		}
		let a = this.action?.kind === "service" ? this.action.data ?? {} : {}, o = r ? Or(this.hass, r, n) : [], s = t ? [] : Rr(this.hass, this.entityId), c = this.action?.kind === "scene" ? this.action.scene : r, l = r ? Cr(this.hass, r) || k(e, "action_no_description") : this.action?.kind === "scene" ? k(e, "action_scene_description") : "", u = o.filter((e) => this._isAdvanced(e)), d = this._advancedUsed(u, t);
		d && !this._advTouched && (this._advOpen = !0);
		let f = this._advTouched ? this._advOpen : d || this._advOpen, p = y`
      <div class="field"><label for="action-target-mode">${k(e, "action_target")}</label>
        <select id="action-target-mode" data-value=${t ? "other" : "device"} ?disabled=${this.disabled}
          @change=${(e) => this._setTarget(e.target.value === "other" ? "" : void 0)}>
          <option value="device">${k(e, "action_target_device")}</option>
          <option value="other">${k(e, "action_target_other")}</option>
        </select></div>
      ${t ? y`<wp-entity-picker .hass=${this.hass} .value=${n} .disabled=${this.disabled} .label=${k(e, "action_target_entity")}
        @wp-change=${(e) => {
			e.stopPropagation(), this._setTarget(e.detail);
		}}></wp-entity-picker>
        <p class="hint">${k(e, "action_target_hint")}</p>` : x}
      ${o.filter((e) => !this._isAdvanced(e) && this._sourceOf(e)).map((e) => this._sourceBlock(e))}
      ${u.map((e) => y`${this._sourceOf(e) ? x : this._input(e, a)}${this._sourceBlock(e)}`)}
      ${o.filter((e) => !this._isAdvanced(e) && !this._sourceOf(e)).map((e) => this._sourceBlock(e))}
      <slot name="advanced"></slot>`;
		return y`
      ${this.allowed?.length === 0 ? y`<p class="hint" role="status">${k(e, "action_none_allowed")}</p>` : x}
      <label class="action-label" for="action">${k(e, "action")}</label>
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
				data: kr(this.hass, r, n)
			}));
		}}>
        <option value="" disabled ?selected=${!c}>${k(e, "action_choose")}</option>
        ${i.map((t) => y`<option value=${t.id} ?selected=${t.id === r}
          title=${Cr(this.hass, t.id) || k(e, "action_no_description")}>${t.label}</option>`)}
        ${this.action?.kind === "scene" && !s.some((e) => e.entity_id === c) ? y`<option value=${c} selected>${c}</option>` : x}
        ${s.map((t) => y`<option value=${t.entity_id} ?selected=${t.entity_id === c}
          title=${k(e, "action_scene_description")}>${String(t.attributes.friendly_name ?? t.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${l}</p>
      ${o.filter((e) => !this._isAdvanced(e)).map((e) => this._field(e, a))}
      ${this.noFold ? p : ei(e, f, () => {
			this._advTouched = !0, this._advOpen = !f;
		}, p)}`;
	}
	static {
		this.styles = [ti, l`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 0.875rem; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 0.875rem;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
	}
};
D([T({ attribute: !1 })], oi.prototype, "hass", void 0), D([T({ attribute: "entity-id" })], oi.prototype, "entityId", void 0), D([T({ attribute: !1 })], oi.prototype, "action", void 0), D([T({ type: Boolean })], oi.prototype, "disabled", void 0), D([T({ attribute: !1 })], oi.prototype, "allowed", void 0), D([T({
	type: Boolean,
	attribute: "advanced-open"
})], oi.prototype, "advancedOpen", void 0), D([T({
	type: Boolean,
	attribute: "no-fold"
})], oi.prototype, "noFold", void 0), D([E()], oi.prototype, "_advOpen", void 0), D([E()], oi.prototype, "_selector", void 0), oi = ai = D([w("wp-action-picker")], oi);
// src/components/label-picker.ts
var V = class extends S {
	constructor(...e) {
		super(...e), this.entityIds = [], this.value = null, this.allowNone = !1, this.disabled = !1, this.compact = !1, this.readonlySettings = !1, this.embedded = !1, this._form = !1, this._editId = null, this._name = "", this._color = "", this._action = null, this._ov = {}, this._error = "", this._saving = !1, this._valueFor = null, this._confirmDel = !1, this._delError = "", this._loaded = "";
	}
	get _lang() {
		return $r(this.hass);
	}
	_emit(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	updated() {
		let e = z(this.data, this.value)?.action, t = e?.kind === "service" ? e.service.split(".")[0] : "";
		this.hass && t && this._loaded !== t && (this._loaded = t, yr(this.hass, [t]).then((e) => e && this.requestUpdate()));
	}
	_open(e) {
		let t = e ? z(this.data, this.value) : void 0;
		(!e || t) && (this._form = !0, this._editId = t?.id ?? null, this._name = t?.name ?? "", this._color = t?.color ?? Fr(this.data.labels), this._action = t ? structuredClone(t.action) : null, this._ov = {}, this._valueFor = null, this._error = "", this._changed());
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
		return this._name.trim() ? !this._action || this._action.kind === "service" && (!this._action.service || this._action.target_entity_id === "") ? k(e, "lb_err_action") : this._action.kind === "service" && Ar(this.hass, this._action.service, this._action.data, this._action.target_entity_id ?? this.entityIds[0], this._action.data_sources).length ? k(e, "lb_err_fields") : "" : k(e, "lb_err_name");
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
				this._error = t?.code === "unauthorized" ? k(this._lang, "err_unauthorized") : k(this._lang, "lb_err_save");
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
			this._delError = n?.code === "in_use" ? k(this._lang, "lb_delete_used", {
				name: B(this.hass, e),
				programs: n.message || ""
			}) : n?.code === "unauthorized" ? k(this._lang, "err_unauthorized") : k(this._lang, "lb_err_delete");
		} finally {
			this._saving = !1;
		}
	}
	_renderDelete(e) {
		let t = this._lang, n = B(this.hass, e), r = Zr(this.data, e.id), i = r.length > 0 || !!this._delError, a = this._delError || (r.length ? k(t, "lb_delete_used", {
			name: n,
			programs: r.join(", ")
		}) : k(t, "lb_delete_ask", { name: n }));
		return y`<div class="delbox" role="alert">
      ${i ? C("error", "", a) : y`<p>${a}</p>`}
      <div class="btns">
        ${i ? x : y`<button class="btn danger-line" ?disabled=${this._saving || this.disabled} @click=${() => void this._delete(e)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${k(t, "delete")}</button>`}
        <button class="btn" @click=${() => {
			this._confirmDel = !1, this._delError = "";
		}}>${k(t, i ? "close" : "cancel")}</button>
      </div>
    </div>`;
	}
	_choose(e) {
		this._confirmDel = !1, this._delError = "", this._form && (this._form = !1, this._changed()), this._emit("label-change", e);
	}
	_valueEditor(e, t) {
		let n = this._lang, r = this._ownValue(e, t), i = this._valueFor === e;
		return y`<div class="dev">
      <button class="link ${r ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${i}
        @click=${() => this._valueFor = i ? null : e}>${k(n, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${L(this.hass, e)}` : ""}</button>
      ${i ? y`<div class="valbox">
        <wp-action-picker no-fold .hass=${this.hass} entity-id=${e} .allowed=${zr(this.program, e)}
          .action=${r ?? this._action} ?disabled=${this.disabled}
          @action-change=${(t) => {
			t.stopPropagation(), this._ov = {
				...this._ov,
				[e]: t.detail
			}, this._error = "", this._changed();
		}}></wp-action-picker>
        ${r ? y`<button class="btn" ?disabled=${this.disabled}
          @click=${() => {
			this._ov = {
				...this._ov,
				[e]: null
			}, this._changed();
		}}>
          <ha-icon icon="mdi:undo"></ha-icon>${k(n, "lb_common_value")}</button>` : x}
      </div>` : x}
    </div>`;
	}
	_swatches() {
		let e = this._lang, t = Nr.findIndex((e) => e === this._color.toLowerCase()), n = t < 0 && /^#[0-9a-f]{3,8}$/i.test(this._color.trim()), r = t < 0 ? n ? -1 : 0 : t;
		return y`<div class="swatches" role="radiogroup" aria-label=${k(e, "lb_color")} @keydown=${(e) => {
			let t = Nr.findIndex((e) => e === this._color.toLowerCase()), n = Nr.length, r = e.key === "ArrowRight" || e.key === "ArrowDown" ? (t + 1) % n : e.key === "ArrowLeft" || e.key === "ArrowUp" ? t < 0 ? n - 1 : (t + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
			r < 0 || this.disabled || (e.preventDefault(), this._set({ color: Nr[r] }), e.currentTarget.querySelectorAll("button.sw:not(.custom)")[r]?.focus());
		}}>
      ${Nr.map((n, i) => y`<button class="sw" role="radio" aria-checked=${i === t} tabindex=${i === r ? 0 : -1}
        aria-label=${k(e, Pr[i])} @click=${() => this._set({ color: n })}><i class=${i === t ? "on" : ""} style="background:${n}"></i></button>`)}
      ${n ? y`<button class="sw custom" role="radio" aria-checked="true" tabindex="0" aria-label=${k(e, "color_custom")}
        title=${k(e, "color_custom")}><i class="on" style="background:${this._color}"></i></button>` : x}
    </div>`;
	}
	_renderForm() {
		let e = this._lang;
		return y`<div class="form">
      <div class="field"><label for="lb-name">${k(e, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e) => this._set({ name: e.target.value })} /></div>
      ${this._swatches()}
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${zr(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled} ?advanced-open=${!!this._editId && this.entityIds.some((e) => this._ownValue(e, this._editId))}
        @action-change=${(e) => {
			e.stopPropagation(), this._set({ action: e.detail });
		}}>
        ${this._editId ? y`<div slot="advanced">${this.entityIds.map((e) => this._valueEditor(e, this._editId))}</div>` : x}
      </wp-action-picker>
      ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
      ${this.embedded ? x : y`<div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled} @click=${() => void this._save()}>${k(e, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${k(e, "cancel")}</button>
      </div>`}
    </div>`;
	}
	_renderDetails(e) {
		let t = this._lang;
		return y`
      <!-- framed in the label's colour so it clearly belongs to it -->
      <div class="details" style="--lc:${e.color}">
        <div class="dhead">
          <i class="dot" style="background:${e.color}"></i><b>${B(this.hass, e)}</b>
          ${this.readonlySettings ? x : y`<button class="pen ${this._form ? "on" : ""}" aria-label=${k(t, "rename_label")} title=${k(t, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => this._form && this._editId ? this._close() : this._open(!0)}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="pen ${this._confirmDel ? "on" : ""}" aria-label=${k(t, "lb_delete")} title=${k(t, "lb_delete")}
            aria-expanded=${this._confirmDel} ?disabled=${this.disabled}
            @click=${() => {
			this._confirmDel = !this._confirmDel, this._delError = "";
		}}><ha-icon icon="mdi:delete-outline"></ha-icon></button>`}
        </div>
        ${(() => {
			let n = Zr(this.data, e.id).filter((e) => e !== this.program.name);
			return n.length ? y`<small class="shared">${k(t, "used_by", { names: n.join(", ") })}</small>` : x;
		})()}
        ${this._confirmDel && !this.readonlySettings ? this._renderDelete(e) : x}
        ${this._form && !this.readonlySettings ? x : y`
          <div class="sum"><span class="what">${Xr(this.hass, t, e.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((n) => {
			let r = Gr(this.program, n, e.id) ? Hr(this.program, n, e) : void 0;
			return r ? y`<div class="sum"><span class="k">${k(t, "lb_value_here")} :</span>
              <span class="what">${Jr(this.hass, t, r)}</span>
              ${this.entityIds.length > 1 ? y`<span class="who">${L(this.hass, n)}</span>` : x}</div>` : x;
		})}`}
        ${this._form && this._editId && !this.readonlySettings ? this._renderForm() : x}
      </div>`;
	}
	render() {
		if (!this.hass || !this.data) return x;
		let e = this._lang, t = [...Vr(this.hass, this.data, this.entityIds, this.program)].sort((t, n) => B(this.hass, t).localeCompare(B(this.hass, n), e, {
			numeric: !0,
			sensitivity: "base"
		})), n = z(this.data, this.value), r = (e, t, n, r) => y`
      <button class="chip ${t ? "on" : ""}" role="radio" aria-checked=${t} ?disabled=${this.disabled} @click=${n}>
        ${r ? y`<i class="dot" style="background:${r}"></i>` : x}<span>${e}</span></button>`;
		return y`
      <div class="chips" role="radiogroup" aria-label=${k(e, "action")}>
        ${this.allowNone ? r(k(e, "rest_none"), this.value === null, () => this._choose(null)) : x}
        ${t.map((e) => r(B(this.hass, e), e.id === this.value, () => this._choose(e.id), e.color))}
        ${this.value && !n ? r("?", !0, () => void 0) : x}
        ${this.compact || this.readonlySettings ? x : y`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => this._form && !this._editId ? this._close() : this._open(!1)}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${k(e, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId && !this.readonlySettings ? this._renderForm() : x}
      ${n && (!this._form || this._editId || this.readonlySettings) ? this._renderDetails(n) : x}`;
	}
	static {
		this.styles = [ti, l`
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
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
    .chip.add { border-style: dashed; color: var(--wp-primary-text); }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .edit { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .pen {
      width: 48px; height: 48px; border: none; border-radius: 24px; background: none; color: var(--secondary-text-color);
      cursor: pointer; --mdc-icon-size: 20px; display: inline-flex; align-items: center; justify-content: center;
    }
    .pen.on { background: var(--secondary-background-color); color: var(--wp-primary-text); }
    .pen:hover { background: var(--secondary-background-color); }
    .shared { display: block; margin: -4px 0 4px; font-size: 0.75rem; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .form { margin-top: 12px; padding: 12px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 44px; height: 44px; border: 0; background: none; cursor: pointer; padding: 2px; display: inline-flex; align-items: center; justify-content: center; }
    .sw i { display: block; width: 40px; height: 40px; border-radius: 20px; box-sizing: border-box; border: 2px solid transparent; }
    .sw i.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .sw:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 0; border-radius: 22px; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .delbox p { margin: 4px 0 0; }
    .delbox .btns { margin-top: 8px; }
    .danger-line { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
    .dev { margin-top: 6px; }
    .sum { margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 0.9375rem; }
    .sum .what { font-weight: 600; }
    .sum .who { color: var(--secondary-text-color); font-size: 0.8125rem; }
    .link {
      border: none; background: none; color: var(--wp-primary-text); font: inherit; font-size: 0.875rem; cursor: pointer;
      min-height: 48px; padding: 0; text-align: left;
    }
    .link.own { font-weight: 600; }
    .valbox { padding: 8px 0 4px; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .valbox wp-action-picker { align-self: stretch; }
  `];
	}
};
D([T({ attribute: !1 })], V.prototype, "hass", void 0), D([T({ attribute: !1 })], V.prototype, "data", void 0), D([T({ attribute: !1 })], V.prototype, "program", void 0), D([T({ attribute: !1 })], V.prototype, "entityIds", void 0), D([T({ attribute: !1 })], V.prototype, "value", void 0), D([T({
	type: Boolean,
	attribute: "allow-none"
})], V.prototype, "allowNone", void 0), D([T({ type: Boolean })], V.prototype, "disabled", void 0), D([T({ type: Boolean })], V.prototype, "compact", void 0), D([T({
	type: Boolean,
	attribute: "readonly-settings"
})], V.prototype, "readonlySettings", void 0), D([T({ type: Boolean })], V.prototype, "embedded", void 0), D([E()], V.prototype, "_form", void 0), D([E()], V.prototype, "_editId", void 0), D([E()], V.prototype, "_name", void 0), D([E()], V.prototype, "_color", void 0), D([E()], V.prototype, "_action", void 0), D([E()], V.prototype, "_ov", void 0), D([E()], V.prototype, "_error", void 0), D([E()], V.prototype, "_saving", void 0), D([E()], V.prototype, "_valueFor", void 0), D([E()], V.prototype, "_confirmDel", void 0), D([E()], V.prototype, "_delError", void 0), V = D([w("wp-label-picker")], V);
// src/components/confirm.ts
var si = class extends S {
	constructor(...e) {
		super(...e), this.message = "", this.confirmLabel = "", this.cancelLabel = "", this.lang = document.documentElement.lang || "en", this._result = !1, this._closed = (e) => {
			e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
		};
	}
	_choose(e) {
		this._result = e, this.renderRoot.querySelector("wp-dialog")?.close();
	}
	render() {
		let e = O(this.lang);
		return y`
      <wp-dialog open compact dialog-role="alertdialog" description=${this.message} heading=${e.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(!0)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(!1)}>${this.cancelLabel || e.cancel}</button>
        </div>
      </wp-dialog>
    `;
	}
	static {
		this.styles = l`
    ${Ze}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 1rem; cursor: pointer;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--wp-danger-fill); border-color: var(--wp-danger-border); color: #fff; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
	}
};
D([T()], si.prototype, "message", void 0), D([T({ attribute: "confirm-label" })], si.prototype, "confirmLabel", void 0), D([T({ attribute: "cancel-label" })], si.prototype, "cancelLabel", void 0), D([T()], si.prototype, "lang", void 0), si = D([w("wp-confirm")], si);
function ci(e, t, n, r = "") {
	return new Promise((i) => {
		let a = document.createElement("wp-confirm");
		a.message = t, a.confirmLabel = n, a.cancelLabel = r;
		let o = e.hass;
		a.lang = o?.locale?.language ?? o?.language ?? (document.documentElement.lang || "en"), a.addEventListener("choice", (e) => {
			a.remove(), i(!!e.detail);
		}), (e.shadowRoot ?? e).appendChild(a);
	});
}
var li = class extends S {
	constructor(...e) {
		super(...e), this.message = "", this.options = [], this.lang = document.documentElement.lang || "en", this._result = null, this._closed = (e) => {
			e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
		};
	}
	_choose(e) {
		this._result = e, this.renderRoot.querySelector("wp-dialog")?.close();
	}
	render() {
		let e = O(this.lang);
		return y`
      <wp-dialog open compact description=${this.message} heading=${e.cf_choose} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div class="choices">
          ${this.options.map((e) => y`<button class="choice" @click=${() => this._choose(e.id)}>${e.label}</button>`)}
        </div>
        <div slot="footer" class="foot">
          <button class="cancel" @click=${() => this._choose(null)}>${e.cancel}</button>
        </div>
      </wp-dialog>
    `;
	}
	static {
		this.styles = l`
    ${Ze}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 12px; overflow-wrap: anywhere; }
    .choices { display: grid; gap: 12px; }
    .foot { display: flex; width: 100%; justify-content: flex-end; }
    button {
      min-height: 56px; padding: 8px 16px; border-radius: 28px; font: inherit; font-size: 1rem; cursor: pointer; overflow-wrap: anywhere;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.choice { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
	}
};
D([T()], li.prototype, "message", void 0), D([T({ attribute: !1 })], li.prototype, "options", void 0), D([T()], li.prototype, "lang", void 0), li = D([w("wp-choice")], li);
function ui(e, t, n) {
	return new Promise((r) => {
		let i = document.createElement("wp-choice");
		i.message = t, i.options = n;
		let a = e.hass;
		i.lang = a?.locale?.language ?? a?.language ?? (document.documentElement.lang || "en"), i.addEventListener("choice", (e) => {
			i.remove(), r(e.detail ?? null);
		}), (e.shadowRoot ?? e).appendChild(i);
	});
}
var di = 365, fi = class extends S {
	constructor(...e) {
		super(...e), this.message = "", this.lang = document.documentElement.lang || "en", this._result = null, this._unlimited = !1, this._pick = 1, this._custom = "1", this._hours = "0", this._closed = (e) => {
			e.stopPropagation(), this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
		};
	}
	_singular(e) {
		return this.lang.startsWith("fr") ? e >= 0 && e < 2 : e === 1;
	}
	_finish(e) {
		this._result = e, this.renderRoot.querySelector("wp-dialog")?.close();
	}
	_customHours() {
		let e = Number(this._custom === "" ? "0" : this._custom), t = Number(this._hours === "" ? "0" : this._hours);
		if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || t < 0) return null;
		let n = e * 24 + t;
		return n >= 1 && n <= di * 24 ? n : null;
	}
	_value() {
		return this._unlimited ? "none" : this._pick === "x" ? this._customHours() ?? void 0 : this._pick === "1h" ? 1 : this._pick * 24;
	}
	_confirm() {
		let e = this._value();
		e !== void 0 && this._finish(e);
	}
	render() {
		let e = O(this.lang);
		return y`
      <wp-dialog open description=${this.message} heading=${e.pause_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div class="label" id="dur">${e.pause_duration}</div>
        <div class="switch" role="group" aria-labelledby="dur">
          <button aria-pressed=${String(this._unlimited)} class=${this._unlimited ? "on" : ""}
            @click=${() => {
			this._unlimited = !0;
		}}>${e.pause_none}</button>
          <button aria-pressed=${String(!this._unlimited)} class=${this._unlimited ? "" : "on"}
            @click=${() => {
			this._unlimited = !1;
		}}>${e.pause_for}</button>
        </div>
        ${this._unlimited ? y`<p class="hint">${e.pause_none_hint}</p>` : y`
          <div class="label sub" id="len">${e.pause_length}</div>
          <div class="durations" role="group" aria-labelledby="len">
            <button aria-pressed=${String(this._pick === "1h")} class=${this._pick === "1h" ? "on" : ""}
              @click=${() => {
			this._pick = "1h", this._hours = "1", this._custom = "0";
		}}>${e.pause_1h}</button>
            <button aria-pressed=${String(this._pick === 1)} class=${this._pick === 1 ? "on" : ""}
              @click=${() => {
			this._pick = 1, this._hours = "0", this._custom = "1";
		}}>${e.pause_1d}</button>
            <button aria-pressed=${String(this._pick === 7)} class=${this._pick === 7 ? "on" : ""}
              @click=${() => {
			this._pick = 7, this._hours = "0", this._custom = "7";
		}}>${e.pause_7d}</button>
            <div class="custom ${this._pick === "x" ? "" : "muted"}">
              <input type="number" inputmode="numeric" min="0" max=${di * 24} step="1" aria-label=${e.pause_x_hours}
                .value=${this._hours} @focus=${() => {
			this._pick = "x";
		}}
                @input=${(e) => {
			this._hours = e.target.value, this._pick = "x";
		}}
                @keydown=${(e) => {
			e.key === "Enter" && this._confirm();
		}} />
              <span class="unit">${this._singular(Number(this._hours)) ? e.pause_hour_unit : e.pause_hours_unit}</span>
              <input type="number" inputmode="numeric" min="0" max=${di} step="1" aria-label=${e.pause_x_days}
                .value=${this._custom} @focus=${() => {
			this._pick = "x";
		}}
                @input=${(e) => {
			this._custom = e.target.value, this._pick = "x";
		}}
                @keydown=${(e) => {
			e.key === "Enter" && this._confirm();
		}} />
              <span class="unit">${this._singular(Number(this._custom)) ? e.pause_day_unit : e.pause_days_unit}</span>
            </div>
          </div>`}
        <div class="actions">
          <button class="cancel" @click=${() => this._finish(null)}>${e.cancel}</button>
          <button class="go" ?disabled=${this._value() === void 0} @click=${() => this._confirm()}>${e.pause_validate}</button>
        </div>
      </wp-dialog>
    `;
	}
	static {
		this.styles = l`
    ${Ze}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 12px; overflow-wrap: anywhere; }
    .label { font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); margin: 4px 0 8px; }
    .hint { font-size: 0.875rem; color: var(--secondary-text-color); margin: 12px 0 0; }
    .switch { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .durations { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .label.sub { margin: 16px 0 8px; }
    button {
      min-height: 56px; padding: 0 12px; border-radius: 28px; font: inherit; font-size: 1rem; cursor: pointer;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    .custom.muted { opacity: .75; }
    .custom { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; }
    .custom input {
      flex: none; width: 72px; min-height: 56px; box-sizing: border-box; padding: 0 12px; border-radius: 28px; text-align: center;
      font: inherit; font-size: 1.125rem; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    .custom .unit { font-size: 1rem; margin-right: 8px; }
    .actions { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-top: 20px; }
    button.go { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    button.go:disabled { opacity: .4; cursor: default; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
	}
};
D([T()], fi.prototype, "message", void 0), D([T()], fi.prototype, "lang", void 0), D([E()], fi.prototype, "_unlimited", void 0), D([E()], fi.prototype, "_pick", void 0), D([E()], fi.prototype, "_custom", void 0), D([E()], fi.prototype, "_hours", void 0), fi = D([w("wp-pause-choice")], fi);
function pi(e, t) {
	return new Promise((n) => {
		let r = document.createElement("wp-pause-choice");
		r.message = t;
		let i = e.hass;
		r.lang = i?.locale?.language ?? i?.language ?? (document.documentElement.lang || "en"), r.addEventListener("choice", (e) => {
			r.remove(), n(e.detail);
		}), (e.shadowRoot ?? e).appendChild(r);
	});
}
var mi = (e) => e.replace(/ /g, "\xA0"), hi = (e, t) => JSON.stringify(e) === JSON.stringify(t), gi = (e, t) => {
	let n = Math.abs(t), r = n < 60 ? `${n} min` : n % 60 ? `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, "0")}` : `${n / 60} h`;
	return `${t > 0 ? "+" : "−"}${r}`;
};
function _i(e, t, n) {
	let r = t.random_minutes ? ` · ${k(e, "random_window", { n: String(t.random_minutes) })}` : "";
	if ("time" in t) {
		let [n, i] = t.time.split(":").map(Number);
		return mi((n * 60 + i >= 1440 ? Bt(e) : F(e, n * 60 + i)) + r);
	}
	return mi(`${k(e, t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`)}${t.offset ? ` ${gi(e, t.offset)}` : ""}${r}`);
}
function vi(e, t) {
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
var yi = [
	0,
	1,
	2,
	3,
	4
], bi = [5, 6], xi = [
	0,
	1,
	2,
	3,
	4,
	5,
	6
];
function Si(e, t, n) {
	let r = [...n].sort((e, t) => e - t);
	return hi(r, xi) ? k(e, "all_days_text") : hi(r, yi) ? `${t[0]}–${t[4]}` : hi(r, bi) ? k(e, "weekend") : r.map((e) => t[e]).join("\xA0");
}
function Ci(e) {
	if (Array.isArray(e)) return `[${e.map(Ci).join(",")}]`;
	if (e && typeof e == "object") {
		let t = e;
		return `{${Object.keys(t).sort().map((e) => `${JSON.stringify(e)}:${Ci(t[e])}`).join(",")}}`;
	}
	return JSON.stringify(e);
}
function wi(e) {
	let { id: t, ...n } = e;
	return n.entities === void 0 ? delete n.entities : n.entities = [...n.entities].sort(), Ci({
		...n,
		conditions: e.conditions ?? [],
		end: e.end ?? null,
		color: e.color ?? null
	});
}
function Ti(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	return e.days.forEach((e, n) => {
		for (let i of e) {
			if (!t(i)) continue;
			let e = !!(i.start.random_minutes || i.end?.random_minutes), { seed: a, ...o } = i, s = wi(e ? i : o), c = r.get(s);
			c && c.days.includes(n) ? (c = void 0, r.set(`${s}#${i.id}`, {
				slot: i,
				days: [n],
				ids: { [n]: i.id }
			})) : (c || (c = {
				slot: i,
				days: [],
				ids: {}
			}, r.set(s, c)), c.days.push(n), c.ids[n] = i.id);
		}
	}), [...r.values()].sort((e, t) => n(e.slot.start) - n(t.slot.start) || e.days[0] - t.days[0]);
}
function Ei(e, t, n, r) {
	let i = e.days.map((e) => e.filter((e) => !n(e)));
	for (let e of t) for (let t of e.days) i[t].push({
		...structuredClone(e.slot),
		id: e.ids[t] ?? R()
	});
	return {
		...e,
		days: i.map((e) => e.sort((e, t) => r(e.start) - r(t.start)))
	};
}
// src/edits.ts
var Di = (e) => e.ids[e.days[0]], Oi = (e, t) => t !== null && Object.values(e.ids).includes(t);
function ki(e, t, n, r) {
	return Ti(e, t, n).find((e) => Oi(e, r)) ?? null;
}
function Ai(e, t) {
	return e ? wi(e.slot) === wi(t.slot) ? JSON.stringify(e.days) === JSON.stringify(t.days) && JSON.stringify(e.ids) === JSON.stringify(t.ids) ? "same" : "days" : "changed" : "gone";
}
function ji(e, t) {
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
function Mi(e, t) {
	if (!e) return [];
	let n = e.days.filter((e) => !t.includes(e)), r = Object.fromEntries(n.filter((t) => e.ids[t]).map((t) => [t, e.ids[t]]));
	return n.length ? [{
		...e,
		days: n,
		ids: r
	}] : [];
}
function Ni(e, t, n, r) {
	let i = Ti(e, t, n).filter((e) => !Oi(e, r.openId));
	return i.push(...Mi(r.rest, r.draft?.days ?? [])), r.draft && i.push(r.draft), Ei(e, i, t, n);
}
function Pi(e) {
	for (let t = 0; t < e.days.length; t++) {
		let n = On(e.days[t]);
		if (n) return {
			day: t,
			a: n[0],
			b: n[1]
		};
	}
	return null;
}
function Fi(e, t, n, r, i = xi) {
	let a = [], o = [];
	for (let n of i) {
		let i = {
			...r,
			id: "__new__"
		};
		(On([...e.days[n].filter(t), i]) ? o : a).push(n);
	}
	return {
		free: a,
		busy: o
	};
}
var Ii = 5;
function Li(e, t, n) {
	n !== void 0 && (e = e.filter((e) => kn(e, n)));
	let r = 480;
	e.length && (r = Math.max(...e.map((e) => t(e.end ?? e.start))), r = Math.ceil(r / Ii) * Ii);
	let i = Math.min(r, j - 60);
	return {
		start: Pt(i),
		end: Pt(Math.min(j, i + 60))
	};
}
function Ri(e, t, n = {
	start: "08:00",
	end: "09:00"
}) {
	return {
		slot: {
			id: R(),
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
var zi = (e, t) => {
	let n = t.entity;
	return n === void 0 ? e : e.filter((e) => kn(e, n));
}, Bi = (e, t) => t.newEntities ? {
	...e,
	entities: [...t.newEntities]
} : e, Vi = (e) => Math.round(e / 15) * 15, Hi = (e, t, n) => Math.max(t, Math.min(n, e));
function Ui(e) {
	let t = Hi(Math.round(e), 0, j);
	return { time: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}` };
}
function H(e, t) {
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
function Wi(e, t) {
	let n = zi(e, t).map((e) => ({
		slot: e,
		e: H(e, t.at)
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
function Gi(e, t) {
	let n = [], r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
	for (let a of zi(e, t)) {
		let e = H(a, t.at);
		if (e.end === null) {
			n.push({
				m: e.start,
				refs: [{
					id: a.id,
					edge: "start"
				}],
				oneShot: !0
			});
			continue;
		}
		let o = [[e.start, {
			id: a.id,
			edge: "start"
		}]];
		e.wrap || o.push([e.end, {
			id: a.id,
			edge: "end"
		}]);
		for (let [e, t] of o) {
			let o = r.get(e) ?? [];
			r.set(e, o);
			let s = o.filter((e) => e.slots.some((e) => An(e, a))), c = s[0];
			c || (c = {
				b: {
					m: e,
					refs: [],
					oneShot: !1
				},
				slots: []
			}, o.push(c), n.push(c.b));
			for (let e of s.slice(1)) c.b.refs.push(...e.b.refs), c.slots.push(...e.slots), o.splice(o.indexOf(e), 1), i.add(e.b);
			c.b.refs.push(t), c.slots.push(a);
		}
	}
	return n.filter((e) => !i.has(e)).sort((e, t) => e.m - t.m);
}
var Ki = (e, t) => e.id === t.id && e.edge === t.edge;
function qi(e, t, n) {
	let r = e.find((e) => e.id === t.id);
	if (!r) return null;
	let i = H(r, n.at);
	return t.edge === "start" ? i.start : i.end;
}
function Ji(e, t, n, r) {
	let i = e.find((e) => e.id === t.id);
	if (!i) return null;
	let a = H(i, r.at), o, s = 0, c = j;
	if (a.end === null) {
		if (t.edge !== "start") return null;
		o = [t], c = j - 15;
	} else {
		if (t.edge === "end" && a.wrap) return null;
		let n = Gi(e, r).find((e) => !e.oneShot && e.refs.some((e) => Ki(e, t)));
		if (!n) return null;
		o = n.refs;
		let i = n.m;
		i >= (r.lead ?? 0) && (s = r.lead ?? 0);
		let l = o.map((t) => e.find((e) => e.id === t.id));
		for (let t of e) {
			if (!l.some((e) => An(e, t))) continue;
			let e = H(t, r.at);
			if (e.end === null) continue;
			let n = [[e.start, {
				id: t.id,
				edge: "start"
			}], [e.end, e.wrap ? null : {
				id: t.id,
				edge: "end"
			}]];
			for (let [e, t] of n) t && o.some((e) => Ki(e, t)) || (e < i ? s = Math.max(s, e) : e > i ? c = Math.min(c, e) : t?.edge === "end" ? s = Math.max(s, i) : t && (c = Math.min(c, i)));
		}
		for (let t of o) {
			let n = H(e.find((e) => e.id === t.id), r.at);
			t.edge === "end" ? s = Math.max(s, n.start + 15) : c = Math.min(c, n.end - 15);
		}
	}
	if (s > c) return {
		slots: e,
		m: qi(e, t, r) ?? 0
	};
	let l = Hi(Vi(n), s, c), u = Ui(l);
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
function Yi(e, t) {
	return t - e < 30 ? null : Hi(Vi((e + t) / 2), e + 15, t - 15);
}
function Xi(e, t, n) {
	let r = n.newId ?? $i;
	if (t.kind === "gap") {
		let i = Yi(t.start, t.end);
		if (i === null || !n.defaultLabel) return null;
		let a = Bi({
			id: r(),
			start: Ui(i),
			end: Ui(t.end),
			conditions: [],
			label: n.defaultLabel
		}, n);
		return {
			slots: ea([...e, a], n),
			handle: {
				id: a.id,
				edge: "start"
			}
		};
	}
	let i = e.find((e) => e.id === t.id);
	if (!i || !i.end) return null;
	let a = H(i, n.at), o = Yi(a.start, a.end);
	if (o === null) return null;
	let s = {
		...i,
		end: Ui(o)
	};
	return {
		slots: ea(e.map((e) => e.id === i.id ? s : e), n),
		handle: {
			id: i.id,
			edge: "end"
		}
	};
}
function Zi(e, t, n, r) {
	if (t.kind === "slot") return e.map((e) => e.id === t.id ? {
		...e,
		label: n
	} : e);
	let i = Bi({
		id: (r.newId ?? $i)(),
		start: Ui(t.start),
		end: Ui(t.end),
		conditions: [],
		label: n
	}, r);
	return ea([...e, i], r);
}
function Qi(e, t) {
	return e.filter((e) => e.id !== t);
}
var $i = () => R();
function ea(e, t) {
	return [...e].sort((e, n) => t.at(e.start) - t.at(n.start));
}
var ta = (e, t) => e.label === t.label && Nn(e, t) && na(e.conditions ?? []) === na(t.conditions ?? []) && (e.color ?? null) === (t.color ?? null), na = (e) => JSON.stringify(e);
function ra(e, t, n = /* @__PURE__ */ new Set()) {
	let r = [];
	for (let i of ea(e, t)) {
		let e = r.length - 1;
		for (; e >= 0 && !An(r[e], i);) e--;
		let a = r[e];
		if (a && a.end && i.end) {
			let o = H(a, t.at), s = H(i, t.at);
			if (!o.wrap && o.end === s.start && !a.end.random_minutes && !i.start.random_minutes && ta(a, i) && !n.has(a.id) && !n.has(i.id)) {
				r[e] = {
					...a,
					end: i.end
				};
				continue;
			}
		}
		r.push(i);
	}
	return r;
}
function ia(e, t, n, r, i = {}) {
	let a = r.newId ?? $i, o = [];
	for (let s of e) {
		let e = H(s, r.at);
		if (e.end === null || e.end <= t || e.start >= n || !An(s, i)) {
			o.push(s);
			continue;
		}
		let c = e.start < t, l = e.end > n, u = i.entities, d = u === void 0 ? [] : (s.entities ?? r.devices ?? []).filter((e) => !u.includes(e)), f = [];
		if (c && f.push({
			...s,
			end: Ui(t)
		}), d.length) {
			let e = r.devices ? Mn(d, r.devices) : d, i = {
				...structuredClone(s),
				start: c ? Ui(t) : s.start,
				end: l ? Ui(n) : s.end
			};
			e && (i.entities = e), f.length && (i.seed = s.seed ?? s.id), f.push(i);
		}
		l && f.push({
			...structuredClone(s),
			start: Ui(n)
		}), f.forEach((e, t) => o.push({
			...e,
			id: t === 0 ? s.id : a()
		}));
	}
	return o;
}
function aa(e, t, n, r) {
	let i = e[t.day]?.find((e) => e.id === t.id);
	if (!i) return [];
	let a = H(i, r.at);
	return a.end === null ? [] : n.filter((n) => n !== t.day && e[n].some((e) => {
		if (!An(e, i)) return !1;
		let t = H(e, r.at);
		return t.end !== null && t.start < a.end && t.end > a.start;
	}));
}
function oa(e, t, n, r, i = []) {
	let a = e[t.day]?.find((e) => e.id === t.id);
	if (!a) return e;
	let o = r.newId ?? $i, s = H(a, r.at);
	return e.map((e, c) => {
		if (!n.includes(c) || c === t.day || i.includes(c)) return e;
		let l = {
			...structuredClone(a),
			id: o()
		};
		return s.end === null ? e.some((e) => !e.end && na(e.start) === na(a.start) && e.label === a.label && Nn(e, a)) ? e : ea([...e, l], r) : ra([...ia(e, s.start, s.end, r, a), l], r);
	});
}
function sa(e, t) {
	if (!e.end) return "oneshot";
	if (H(e, t.at).wrap) return "wrap";
	let n = (e) => "sun" in e && !!(e.earliest || e.latest);
	return n(e.start) || n(e.end) ? "sunbound" : null;
}
var ca = (e, t, n) => t === 0 ? e : {
	...e,
	start: n(e.start, t),
	end: e.end ? n(e.end, t) : e.end
};
function la(e, t, n, r, i) {
	let a = e.find((e) => e.id === t);
	if (!a || sa(a, r)) return null;
	let o = H(a, r.at), s = o.end, c = s - o.start, l = o.start >= (r.lead ?? 0) ? r.lead ?? 0 : 0, u = j;
	for (let n of e) {
		if (n.id === t || !An(n, a)) continue;
		let e = H(n, r.at);
		e.end !== null && (e.end <= o.start ? l = Math.max(l, e.end) : e.start >= s && (u = Math.min(u, e.start)));
	}
	if (u - l < c) return null;
	let d = Hi(Vi(o.start + n), l, u - c), f = d - o.start;
	return {
		slots: e.map((e) => e.id === t ? ca(e, f, i) : e),
		start: d,
		end: d + c,
		delta: f
	};
}
function ua(e, t, n, r, i, a) {
	let o = e[t.day]?.find((e) => e.id === t.id);
	if (!o || n === t.day || !e[n]) return { error: "gone" };
	let s = sa(o, i);
	if (s) return { error: s };
	let c = H(o, i.at), l = c.end - c.start, u = Hi(Vi(c.start + r), 0, j - l);
	if (e[n].some((e) => {
		if (!An(e, o)) return !1;
		let t = H(e, i.at);
		return t.end !== null && t.start < u + l && t.end > u;
	})) return { error: "overlap" };
	let d = {
		...ca(structuredClone(o), u - c.start, a),
		id: (i.newId ?? $i)()
	};
	return {
		start: u,
		days: e.map((e, r) => r === t.day ? e.filter((e) => e.id !== t.id) : r === n ? ea([...e, d], i) : e)
	};
}
// src/device-edits.ts
var U = (e) => e.entities.map((e) => e.entity_id), da = (e, t) => jn(e, t).length > 1;
function fa(e, t) {
	let { entities: n, ...r } = e;
	return t ? {
		...r,
		entities: [...t]
	} : r;
}
function pa(e, t) {
	let n = Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0));
	return {
		...e,
		...structuredClone(n)
	};
}
function ma(e, t, n) {
	let r = Mn(t, U(n));
	return r && !r.length ? null : fa(e, r);
}
function ha(e, t) {
	let n = U(e).filter((e) => e !== t), r = (e) => {
		if (e.entities === void 0) return [e];
		let r = Mn(e.entities.filter((e) => e !== t), n);
		return r && !r.length ? [] : [fa(e, r)];
	};
	return {
		...e,
		profiles: e.profiles.map((e) => ({
			...e,
			days: e.days.map((e) => e.flatMap(r))
		}))
	};
}
var ga = (e) => {
	let { entities: t, seed: n, ...r } = e;
	return wi(r);
}, _a = (e) => e.seed ?? e.id, va = (e) => !!(e.start.random_minutes || e.end?.random_minutes);
function ya(e, t) {
	let n = [], r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = ga(i), a = n.findIndex((t) => !An(t, i) && ga(t) === e && (_a(t) === _a(i) || !va(t) && !va(i)));
		if (a < 0) {
			n.push(i);
			continue;
		}
		let o = n[a], [s, c] = o.seed === i.id ? [i, o] : [o, i];
		n[a] = fa(s, Mn([...jn(o, t), ...jn(i, t)], t)), r.set(c.id, s.id);
		for (let [e, t] of r) t === c.id && r.set(e, s.id);
	}
	return {
		day: n,
		absorbed: r
	};
}
function ba(e, t, n, r, i) {
	let a = e.findIndex((e) => e.some((e) => e.id === t));
	if (a < 0) return null;
	let o = e[a].find((e) => e.id === t);
	if (!kn(o, n)) return null;
	let s = o.entities ?? i.devices, c, l = null;
	if (s.length <= 1) c = r ? [pa(o, r)] : [], r && (l = o.id);
	else if (c = [fa(o, Mn(s.filter((e) => e !== n), i.devices))], r) {
		let e = {
			...pa(structuredClone(o), r),
			id: (i.newId ?? R)(),
			seed: _a(o),
			entities: [n]
		};
		c.push(e), l = e.id;
	}
	let u = ya(e[a].flatMap((e) => e.id === t ? c : [e]), i.devices);
	return l && u.absorbed.has(l) && (l = u.absorbed.get(l)), {
		days: e.map((e, t) => t === a ? u.day : e),
		id: l
	};
}
function xa(e, t) {
	let n = U(e), r = (r) => {
		if (!kn(r, t)) return [r];
		let i = ma(r, jn(r, n).filter((e) => e !== t), e);
		return i ? [i] : [];
	};
	return {
		...e,
		profiles: e.profiles.map((e) => ({
			...e,
			days: e.days.map((e) => e.flatMap(r))
		}))
	};
}
function Sa(e, t) {
	let n = U(e);
	return e.profiles.reduce((e, r) => e + r.days.flat().filter((e) => {
		let r = jn(e, n);
		return r.length === 1 && r[0] === t;
	}).length, 0);
}
function Ca(e) {
	return e.profiles.reduce((e, t) => e + t.days.flat().filter((e) => e.entities === void 0).length, 0);
}
function wa(e, t, n, r, i = R) {
	let a = /* @__PURE__ */ new Map();
	return {
		day: e.flatMap((e) => {
			let o = jn(e, n);
			if (!r.includes(e.id) || !o.includes(t) || o.length <= 1) return [e];
			let s = fa(e, Mn(o.filter((e) => e !== t), n)), c = {
				...structuredClone(e),
				id: i(),
				seed: _a(e),
				entities: [t]
			};
			return a.set(e.id, c.id), [s, c];
		}),
		map: a
	};
}
function Ta(e, t, n) {
	let r = (e) => `${e.id}\u0000${wi(e)}`, i = new Set(t.map(r)), a = new Set(n.map(r)), o = new Set(n.filter((e) => !i.has(r(e))).map(r)), s = t.filter((e) => !a.has(r(e))), c = new Set(e.map(r));
	if ([...o].some((e) => !c.has(e))) return null;
	let l = e.filter((e) => !o.has(r(e)));
	if (s.some((e) => l.some((t) => t.id === e.id))) return null;
	let u = [...l, ...structuredClone(s)];
	return On(u) ? null : u;
}
// src/hold-hint.ts
var Ea = "weekly_planner.hold_hint", Da = 2e3;
function Oa() {
	try {
		let e = Number(window.localStorage.getItem(Ea));
		return Number.isFinite(e) && e > 0 ? e : 0;
	} catch {
		return 0;
	}
}
function ka(e) {
	try {
		window.localStorage.setItem(Ea, String(e));
	} catch {}
}
function Aa() {
	let e = Oa();
	return e >= 3 ? !1 : (ka(e + 1), !0);
}
function ja() {
	Oa() < 3 && ka(3);
}
// src/selected-time.ts
function Ma(e, t, n, r, i) {
	let a = (t, n) => {
		let r = t === 1440 ? Bt(e) : F(e, t);
		if (!n || !("sun" in n)) return r;
		let i = O(e)[`sun_${n.sun}`] ?? n.sun, a = n.offset ?? 0;
		return `${r} (${i}${a ? ` ${a > 0 ? "+" : "−"} ${Math.abs(a)} min` : ""})`;
	}, o = a(t, r);
	return n === null ? k(e, "time_from", { time: o }) : `${o} – ${a(n, i)}${n <= t ? ` (${k(e, "time_next_day")})` : ""}`;
}
// src/components/bar-editor.ts
var Na, Pa = 450, Fa = 22, Ia = 8, La = 700, Ra = /* @__PURE__ */ new Map(), za = (e, t) => e && e.revision > t.revision ? e : t, Ba = (e) => e, W = class extends S {
	static {
		Na = this;
	}
	constructor(...e) {
		super(...e), this.entityId = "", this.weekday = 0, this.spans = [], this.now = null, this.editing = !1, this.editable = !1, this.hours = !1, this.deviceName = "", this.lang = "en", this.tz = "UTC", this.view = "bar", this.rest = "", this._pointerY = 0, this.drop = !1, this._draft = null, this._selected = null, this._hsel = null, this._bubble = null, this._copyOpen = !1, this._copyDays = [], this._conflict = null, this._error = "", this._ask = null, this._hover = !1, this._tip = null, this._moving = !1, this._hint = !1, this._kbd = !1, this._sun = /* @__PURE__ */ new Map(), this._keep = /* @__PURE__ */ new Set(), this._awaitRev = null, this._listening = !1, this._at = (e) => "time" in e ? M(e.time) : this._sun.get(JSON.stringify(e)) ?? wn(this.hass, e), this._outside = (e) => {
			let t = e.composedPath();
			t.includes(this) || t.some((e) => e instanceof HTMLElement && e.classList?.contains("snack")) || this._emit("edit-exit");
		}, this._escape = (e) => {
			e.key === "Escape" && !this._conflict && this._emit("edit-exit");
		}, this._shift = (e, t) => Tn(this.hass, e, t), this._barText = "";
	}
	get _radial() {
		return this.view === "radial" || this.view === "radial_12h";
	}
	get _live() {
		return za(Ra.get(this.program.id), this.program);
	}
	get _baseDay() {
		return I(this._live, this.data).days[this.weekday] ?? [];
	}
	get _day() {
		return this._draft ?? this._baseDay;
	}
	get _lead() {
		return Math.max(0, ...this.spans.filter((e) => e.spill).map((e) => e.end));
	}
	_ctx(e) {
		let t = this.program.entities.find((e) => e.entity_id === this.entityId), n = Vr(this.hass, this.data, [this.entityId], this.program)[0]?.id, r = new Map(this._sun), i = U(this.program);
		return {
			at: (e) => "time" in e ? M(e.time) : r.get(JSON.stringify(e)) ?? wn(this.hass, e),
			lead: this._lead,
			newId: e ?? R,
			defaultLabel: t?.default_label ?? n,
			entity: this.entityId || void 0,
			devices: i,
			newEntities: this.entityId ? Mn([this.entityId], i) : void 0
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
		e.has("editing") && (this.editing ? (this._clearHint(), this._listen(!0), this._kbd && this.renderRoot.querySelector(".hd")?.focus()) : (this._listen(!1), this._kbd && this.renderRoot.querySelector(".zone")?.focus(), this._kbd = !1, this._flushNudge(), this._selected = null, this._hsel = null, this._copyOpen = !1, this._conflict = null, this._keep.clear(), this._bubble = null, this._ask && (this._ask = null, this._dropDraft())));
	}
	connectedCallback() {
		super.connectedCallback(), this._offNames = vr(() => this.requestUpdate());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._offNames?.(), this._listen(!1), window.clearTimeout(this._clearTimer), window.clearTimeout(this._errTimer), window.clearTimeout(this._hintTimer), window.clearTimeout(this._press?.timer), window.clearTimeout(this._mvTimer);
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
			this._press && (this._press.fired = !0, navigator.vibrate?.(12), this._clearHint(), ja(), this._emit("edit-request"));
		}, Pa));
	}
	_zoneMove(e) {
		let t = this._press;
		if (t && t.id === e.pointerId) {
			if (t.fired) {
				if (!this._mv && this.editing) {
					this._pointerY = t.y;
					let n = this._segAt(this._minuteAt(t.x).m);
					n?.kind === "slot" && this._mvBegin(e, n.id, t);
				}
				this._mvMove(e);
			} else Math.hypot(e.clientX - t.x, e.clientY - t.y) > Ia && (window.clearTimeout(t.timer), this._press = void 0);
		}
	}
	_zoneUp(e) {
		let t = this._press;
		t && t.id === e.pointerId && (window.clearTimeout(t.timer), this._press = void 0, t.fired ? this._mvUp(e) : t.mouse && this.editable ? this._emit("edit-request") : this.editable && !t.mouse ? this._tapHint() : this._emit("open-day"));
	}
	_tapHint() {
		this._hint ? (this._clearHint(), this._emit("open-day")) : Aa() ? (this._hint = !0, this._hintTimer = window.setTimeout(() => {
			this._hint = !1, this._hintTimer = void 0, this._emit("open-day");
		}, Da)) : this._emit("open-day");
	}
	_clearHint() {
		window.clearTimeout(this._hintTimer), this._hintTimer = void 0, this._hint = !1;
	}
	_zoneKey(e) {
		e.key === "Escape" && (this._tip = null), this.editing || e.target !== e.currentTarget || e.key !== "Enter" && e.key !== " " || (e.preventDefault(), this.editable ? (this._kbd = !0, this._clearHint(), ja(), this._emit("edit-request")) : this._emit("open-day"));
	}
	_zoneCancel() {
		this._press?.fired && this._mvCancel(), window.clearTimeout(this._press?.timer), this._press = void 0;
	}
	get _overlay() {
		return this.renderRoot.querySelector(".ov");
	}
	_minuteAt(e) {
		if (this._radial) {
			let t = this._dialRect();
			return {
				m: $t(e, this._pointerY, t, this.view === "radial_12h"),
				ppm: t.width / 320 * 2 * Math.PI * 112 / (this.view === "radial_12h" ? 720 : j)
			};
		}
		let t = this._overlay?.getBoundingClientRect(), n = t?.width || 1;
		return {
			m: (e - (t?.left ?? 0)) / n * j,
			ppm: n / j
		};
	}
	_dialRect() {
		let e = (this._overlay ?? this.renderRoot.querySelector(".radial-face")).getBoundingClientRect();
		return {
			left: e.left,
			top: e.top,
			width: e.width,
			height: e.width
		};
	}
	_radialMovement(e, t, n, r) {
		let i = this._polarProgress ?? {
			x: n,
			y: r,
			delta: 0
		}, a = i.delta + en(i.x, i.y, e, t, this._dialRect(), this.view === "radial_12h");
		return this._polarProgress = {
			x: e,
			y: t,
			delta: a
		}, a;
	}
	_radialBoundaries() {
		return Gi(this._day, this._ctx()).flatMap((e) => this.view === "radial_12h" && e.m === 720 ? ["end", "start"].flatMap((t) => {
			let n = e.refs.filter((e) => e.edge === t);
			return n.length ? [{
				...e,
				refs: n
			}] : [];
		}) : [e]);
	}
	_radialNearest(e, t) {
		let n = this._dialRect(), r;
		for (let i of this._radialBoundaries()) {
			let a = Zt(i.m, this.view === "radial_12h", i.refs[0].edge === "end"), o = Math.hypot(e - n.left - a.x / 320 * n.width, t - n.top - a.y / 320 * n.height);
			o <= Fa && (!r || o < r.d) && (r = {
				b: i,
				d: o
			});
		}
		return r?.b;
	}
	_radialOverlay() {
		let e = this._sel;
		return y`<div class="ov polar" title=${this._tipText || this._selectedTime} aria-label=${this._selectedTime} @pointerdown=${this._ovDown} @pointermove=${this._ovMove}
      @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}>
      ${e ? y`<svg class="polar-selection" viewBox="0 0 320 320" aria-hidden="true">
        ${Xt([{
			start: e.start,
			end: e.end ?? e.start,
			marker: e.end === null,
			color: "",
			label: ""
		}], this.view === "radial_12h").map((e) => {
			let t = this.view === "radial_12h" && e.ring === 0 ? 78 : 112, n = Zt(e.start, this.view === "radial_12h");
			return e.source.marker ? b`<circle cx=${n.x} cy=${n.y} r="12" fill="none" stroke="var(--primary-text-color)" stroke-width="2" />` : b`<circle cx="160" cy="160" r=${t} fill="none" stroke="var(--primary-text-color)" stroke-width=${this.view === "radial_12h" ? 28 : 40}
                pathLength="100" stroke-dasharray="${e.fraction * 100} ${100 - e.fraction * 100}" stroke-dashoffset=${-e.offset * 100} transform="rotate(-90 160 160)" opacity=".4" />`;
		})}</svg>` : x}
      ${this._radialBoundaries().map((e) => {
			let t = e.refs[0], n = Zt(e.m, this.view === "radial_12h", t.edge === "end");
			return y`<button class="hd dot" style="left:${n.x / 3.2}%;top:${n.y / 3.2}%" role="slider"
          aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${e.m} aria-valuetext=${this._clock(e.m)}
          aria-label=${k(this.lang, "handle", { time: this._clock(e.m) })} data-h=${`${t.id}:${t.edge}`}
          @keydown=${(e) => this._key(e, t)} @focus=${() => {
				this._hsel = t, this._selected = {
					kind: "slot",
					id: t.id
				}, this._focusSlotTip(t.id);
			}} @blur=${() => {
				this._tip = null;
			}}><i></i></button>`;
		})}
      ${!this._selectedTime && this._bubble ? y`<div class="polar-time">${this._bubble.text ?? this._clock(this._bubble.m)}</div>` : x}
    </div>`;
	}
	_nearest(e, t) {
		let n;
		for (let r of Gi(this._day, this._ctx())) {
			let i = Math.abs(r.m - e) * t;
			i <= Fa && (!n || i < n.d) && (n = {
				b: r,
				d: i
			});
		}
		return n?.b;
	}
	_segAt(e) {
		let t = Wi(this._day, this._ctx()).find((t) => e >= t.start && e < t.end);
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
		this._flushNudge(), this._pointerY = e.clientY;
		let { m: t, ppm: n } = this._minuteAt(e.clientX), r = this._radial ? this._radialNearest(e.clientX, e.clientY) : this._nearest(t, n);
		if (this._polarProgress = void 0, this._radial && (this._polarDrag = {
			x: e.clientX,
			y: e.clientY,
			minute: t
		}), r) {
			e.currentTarget.setPointerCapture?.(e.pointerId), this._drag = {
				ref: r.refs[0],
				m0: r.m,
				x0: e.clientX,
				id: e.pointerId,
				moved: !1,
				last: r.m,
				profileId: I(this._live, this.data).id,
				weekday: this.weekday,
				ctx: this._ctx()
			}, this._hsel = r.refs[0], this._selected = {
				kind: "slot",
				id: r.refs[0].id
			}, e.preventDefault();
			let t = {
				x: e.clientX,
				y: e.clientY
			};
			window.clearTimeout(this._mvTimer), this._mvTimer = window.setTimeout(() => {
				let n = this._drag;
				this._pointerY = t.y;
				let r = this._segAt(this._minuteAt(t.x).m);
				n && !n.moved && n.id === e.pointerId && r?.kind === "slot" && (navigator.vibrate?.(12), this._drag = void 0, this._hsel = null, this._mvBegin(e, r.id, t));
			}, Pa);
			return;
		}
		let i = this._segAt(t);
		this._tap = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			target: i
		}, i?.kind === "slot" && (e.currentTarget.setPointerCapture?.(e.pointerId), this._mvBegin(e, i.id));
	}
	_mvBegin(e, t, n = {
		x: e.clientX,
		y: e.clientY
	}) {
		this._polarProgress = void 0;
		let r = this._ctx(), i = this._baseDay.find((e) => e.id === t);
		i && (this._mv = {
			id: e.pointerId,
			x0: n.x,
			y0: n.y,
			slotId: t,
			moved: !1,
			delta: 0,
			to: null,
			profileId: I(this._live, this.data).id,
			weekday: this.weekday,
			ctx: r,
			refused: sa(i, r) !== null
		});
	}
	_barAt(e, t) {
		let n = this.getRootNode().elementsFromPoint?.(e, t).find((e) => e instanceof Na);
		return !n || n === this || n.weekday === this.weekday || n.program?.id !== this.program.id || n.entityId !== this.entityId ? null : n;
	}
	_setDrop(e) {
		this._mv?.to && this._mv.to !== e && (this._mv.to.drop = !1), this._mv && (this._mv.to = e), e && (e.drop = !0);
	}
	_mvMove(e) {
		let t = this._mv;
		if (!t || t.id !== e.pointerId) return !1;
		let n = e.clientX - t.x0;
		if (!t.moved) {
			if (Math.hypot(n, e.clientY - t.y0) < Ia) return !0;
			if (t.moved = !0, this._moving = !0, this._tap = void 0, this._selected = {
				kind: "slot",
				id: t.slotId
			}, t.refused) {
				let e = this._baseDay.find((e) => e.id === t.slotId), n = e ? sa(e, t.ctx) : null;
				n && this._fail(k(this.lang, `move_err_${n}`));
			}
		}
		if (t.refused) return !0;
		let r = this._live.profiles.find((e) => e.id === t.profileId)?.days[t.weekday];
		if (!r) return this._mvCancel(), !0;
		let i = this._radial ? this._radialMovement(e.clientX, e.clientY, t.x0, t.y0) : n / this._minuteAt(0).ppm, a = this._barAt(e.clientX, e.clientY);
		if (this._setDrop(a), a) {
			let e = ua(this._live.profiles.find((e) => e.id === t.profileId)?.days ?? [], {
				day: t.weekday,
				id: t.slotId
			}, a.weekday, i, t.ctx, this._shift);
			return this._draft = null, this._bubble = "start" in e ? {
				m: e.start,
				text: k(this.lang, "move_to", {
					day: O(this.lang).days_short[a.weekday],
					time: this._clock(e.start)
				})
			} : null, t.delta = i, !0;
		}
		let o = la(r, t.slotId, i, t.ctx, this._shift);
		return o && (t.delta = i, this._draft = o.slots, this._bubble = { m: o.start }), !0;
	}
	_mvUp(e) {
		let t = this._mv;
		if (!t || t.id !== e.pointerId) return !1;
		this._mv = void 0, this._moving = !1, this._bubble = null;
		let n = t.to;
		if (n && (n.drop = !1), !t.moved || t.refused) return !0;
		let { slotId: r, delta: i, weekday: a, profileId: o, ctx: s } = t;
		if (n) {
			let e = n.weekday, t = ua(this._live.profiles.find((e) => e.id === o)?.days ?? [], {
				day: a,
				id: r
			}, e, i, s, this._shift);
			if (this._draft = null, "error" in t) return this._fail(t.error === "overlap" ? k(this.lang, "w_err_overlap") : t.error === "gone" ? k(this.lang, "ss_err_save") : k(this.lang, `move_err_${t.error}`)), !0;
			let c = R();
			this._edit((t, n) => {
				let o = ua(t, {
					day: a,
					id: n(r)
				}, e, i, {
					...s,
					newId: () => c
				}, this._shift);
				return "days" in o ? o.days : null;
			}, [a, e], [r], o);
		} else this._edit((e, t) => {
			let n = la(e[a], t(r), i, s, this._shift);
			return n ? this._with(e, a, n.slots) : null;
		}, [a], [r], o);
		return !0;
	}
	_mvCancel() {
		this._mv?.to && (this._mv.to.drop = !1), this._mv?.moved && (this._draft = null), this._mv = void 0, this._moving = !1, this._bubble = null;
	}
	_ovMove(e) {
		if (this._mvMove(e)) return;
		let t = this._drag;
		if (t && t.id === e.pointerId) {
			let n = e.clientX - t.x0;
			if (!t.moved && (this._radial ? Math.hypot(n, e.clientY - (this._polarDrag?.y ?? e.clientY)) : Math.abs(n)) < 3) return;
			t.moved = !0;
			let r = this._live.profiles.find((e) => e.id === t.profileId)?.days[t.weekday];
			if (!r) {
				this._ovCancel();
				return;
			}
			let i = Ji(r, t.ref, t.m0 + (this._radial ? this._radialMovement(e.clientX, e.clientY, this._polarDrag?.x ?? t.x0, this._polarDrag?.y ?? e.clientY) : n / this._minuteAt(0).ppm), t.ctx);
			i && (t.last = i.m, this._draft = i.slots, this._bubble = { m: i.m });
		} else if (!this._tap && !t) {
			this._pointerY = e.clientY;
			let { m: t, ppm: n } = this._minuteAt(e.clientX);
			this._hover = !!(this._radial ? this._radialNearest(e.clientX, e.clientY) : this._nearest(t, n));
		}
	}
	_ovUp(e) {
		if (window.clearTimeout(this._mvTimer), this._mvUp(e)) {
			this._tap?.id === e.pointerId && Math.hypot(e.clientX - this._tap.x, e.clientY - this._tap.y) <= Ia && this._tap.target && this._select(this._tap.target), this._tap = void 0;
			return;
		}
		let t = this._drag;
		if (t && t.id === e.pointerId) {
			if (this._drag = void 0, this._bubble = null, t.moved) {
				let { ref: e, last: n } = t;
				this._edit((r, i) => {
					let a = Ji(r[t.weekday], {
						...e,
						id: i(e.id)
					}, n, t.ctx);
					return a ? this._with(r, t.weekday, a.slots) : null;
				}, [t.weekday], this._boundaryIds(e, t.ctx), t.profileId);
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
		n && n.id === e.pointerId && (this._tap = void 0, Math.hypot(e.clientX - n.x, e.clientY - n.y) <= Ia && n.target && this._select(n.target));
	}
	_ovCancel() {
		window.clearTimeout(this._mvTimer), this._mvCancel(), this._drag?.moved && (this._draft = null), this._drag = void 0, this._tap = void 0, this._bubble = null;
	}
	_select(e) {
		let t = this._selected && JSON.stringify(this._selected) === JSON.stringify(e);
		this._selected = t ? null : e, this._copyOpen = !1, this._copyDays = [];
	}
	_key(e, t) {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		e.preventDefault();
		let n = I(this._live, this.data).id;
		this._nudge && this._nudge.profileId !== n && (this._flushNudge(), this._draft = null);
		let r = this._nudge?.ctx ?? this._ctx(), i = this._draft ?? this._baseDay, a = this._nudge?.m ?? qi(i, t, r);
		if (a === null) return;
		let o = Ji(i, t, a + (e.key === "ArrowRight" ? 15 : -15), r);
		o && (this._draft = o.slots, this._bubble = { m: o.m }, window.clearTimeout(this._nudge?.timer), this._nudge = {
			ref: t,
			m: o.m,
			timer: window.setTimeout(() => this._flushNudge(), La),
			profileId: n,
			weekday: this.weekday,
			ctx: r
		});
	}
	_flushNudge() {
		let e = this._nudge;
		e && (window.clearTimeout(e.timer), this._nudge = void 0, this._bubble = null, this._edit((t, n) => {
			let r = Ji(t[e.weekday], {
				...e.ref,
				id: n(e.ref.id)
			}, e.m, e.ctx);
			return r ? this._with(t, e.weekday, r.slots) : null;
		}, [e.weekday], this._boundaryIds(e.ref, e.ctx), e.profileId));
	}
	_boundaryIds(e, t) {
		let n = Gi(this._baseDay, t).find((t) => t.refs.some((t) => t.id === e.id && t.edge === e.edge));
		return n ? [...new Set(n.refs.map((e) => e.id))] : [e.id];
	}
	_edit(e, t, n, r = I(this._live, this.data).id) {
		let i = U(this._live), a = this._live.profiles.find((e) => e.id === r)?.days ?? [], o = a[this.weekday]?.filter((e) => n.includes(e.id) && da(e, i)) ?? [];
		if (!this.entityId || !o.length) {
			this._commit((t) => e(t, Ba), t, !1, r);
			return;
		}
		let s = e(a, Ba);
		s && (this._draft = s[this.weekday] ?? null);
		let c = jn(o[0], i);
		this._ask = {
			op: e,
			touched: t,
			ids: n,
			profileId: r,
			count: c.length,
			others: c.filter((e) => e !== this.entityId)
		};
	}
	_answer(e) {
		let t = this._ask;
		if (!t) return;
		if (this._ask = null, e === "all") {
			this._commit((e) => t.op(e, Ba), t.touched, !1, t.profileId);
			return;
		}
		let n = this.entityId, r = this.weekday, i = [.../* @__PURE__ */ new Set([...t.touched, r])], a = this._selected;
		this._commit((e) => {
			let o = U(this._live), s = wa(e[r], n, o, t.ids), c = a?.kind === "slot" ? s.map.get(a.id) : void 0;
			c && (this._selected = {
				kind: "slot",
				id: c
			});
			let l = t.op(this._with(e, r, s.day), (e) => s.map.get(e) ?? e);
			return l ? l.map((e, t) => i.includes(t) ? ya(e, o).day : e) : null;
		}, i, !1, t.profileId);
	}
	_askCancel() {
		this._ask = null, this._dropDraft();
	}
	_with(e, t, n) {
		return e.map((e, r) => r === t ? n : e);
	}
	_fail(e) {
		this._error = e, window.clearTimeout(this._errTimer), this._errTimer = window.setTimeout(() => this._error = "", 5e3);
	}
	async _commit(e, t, n = !1, r = I(this._live, this.data).id) {
		let i = this._live;
		for (let a = 0; a < 2; a++) {
			let o = i.profiles.find((e) => e.id === r);
			if (!o) return this._dropDraft(), !1;
			let s = o.days, c = e(s);
			if (!c) return this._dropDraft(), !1;
			let l = U(i), u = /* @__PURE__ */ new Map(), d = c.map((e, n) => {
				if (!t.includes(n) || e === s[n]) return e;
				let r = ya(ra(e, this._ctx(), this._keep), l);
				for (let [e, t] of r.absorbed) u.set(e, t);
				return r.day;
			}), f = this._selected;
			f?.kind === "slot" && u.has(f.id) && (this._selected = {
				kind: "slot",
				id: u.get(f.id)
			});
			let p = d.map((e, t) => t).filter((e) => JSON.stringify(d[e]) !== JSON.stringify(s[e]));
			if (!p.length) return this._dropDraft(), !0;
			let m = {
				...i,
				profiles: i.profiles.map((e) => e.id === o.id ? {
					...e,
					days: d
				} : e)
			};
			this._draft = d[this.weekday] ?? null;
			try {
				let e = await this.hass.callWS({
					type: "weekly_planner/program/save",
					program: structuredClone(m)
				});
				if (e?.program ? (Ra.set(e.program.id, e.program), this._awaitRev = e.program.revision, window.clearTimeout(this._clearTimer), this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500), this.program.revision >= e.program.revision && this._dropDraft()) : this._dropDraft(), !n) {
					let e = this._ctx().at;
					this._emit("edited", { undo: () => this._commit((t) => {
						let n = t.map((e, t) => p.includes(t) ? Ta(e, s[t], d[t]) : e);
						return n.some((e) => e === null) ? (this._fail(k(this.lang, "undo_changed")), null) : n.map((t, n) => p.includes(n) ? [...t].sort((t, n) => e(t.start) - e(n.start)) : t);
					}, p, !0, r) });
				}
				return !0;
			} catch (e) {
				let t = e;
				if (t?.code === "conflict" && a === 0) try {
					let e = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((e) => e.id === i.id);
					if (e) {
						Ra.set(e.id, e), i = e;
						continue;
					}
				} catch {}
				return this._dropDraft(), this._fail(Tt(this.lang, t?.message, (e) => String(this.hass.states[e]?.attributes.friendly_name ?? e)) ?? (t?.message?.includes("overlapping_slots") ? k(this.lang, "w_err_overlap") : t?.code === "unauthorized" ? k(this.lang, "err_unauthorized") : k(this.lang, "ss_err_save"))), !1;
			}
		}
		return !1;
	}
	get _sel() {
		let e = this._selected;
		if (!e) return null;
		let t = this._day;
		if (e.kind === "slot") {
			let n = t.find((t) => t.id === e.id && (!this.entityId || kn(t, this.entityId)));
			if (!n) return null;
			let r = H(n, this._at);
			return {
				target: e,
				slot: n,
				start: r.start,
				end: r.end
			};
		}
		let n = Wi(t, this._ctx()).find((t) => t.kind === "gap" && t.start === e.start);
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
		let n = R(), r = t.target;
		this._edit((t, i) => this._with(t, this.weekday, Zi(t[this.weekday], r.kind === "slot" ? {
			...r,
			id: i(r.id)
		} : r, e, this._ctx(() => n))), [this.weekday], r.kind === "slot" ? [r.id] : []), r.kind === "gap" && (this._selected = {
			kind: "slot",
			id: n
		});
	}
	async _nothing() {
		let e = this._sel;
		if (!e?.slot) return;
		let t = e.slot.id, n = z(this.data, e.slot.label), r = [n ? B(this.hass, n) : "", this._selectedTime].filter(Boolean).join(" · ");
		await ci(this, `${k(this.lang, "w_confirm_slot")}${r ? ` ${r}` : ""}`, k(this.lang, "slot_delete_yes"), k(this.lang, "slot_delete_no")) && (this._selected = null, this._edit((e, n) => this._with(e, this.weekday, Qi(e[this.weekday], n(t))), [this.weekday], [t]));
	}
	_cut() {
		let e = this._sel;
		if (!e) return;
		let t = e.target, n = R(), r = this._ctx(() => n), i = Xi(this._day, t, r);
		i && (t.kind === "gap" && this._keep.add(n), this._hsel = i.handle, this._edit((e, r) => {
			let i = Xi(e[this.weekday], t.kind === "slot" ? {
				...t,
				id: r(t.id)
			} : t, this._ctx(() => n));
			return i ? this._with(e, this.weekday, i.slots) : null;
		}, [this.weekday], t.kind === "slot" ? [t.id] : []), this.updateComplete.then(() => this.renderRoot.querySelector(`[data-h="${i.handle.id}:${i.handle.edge}"]`)?.focus()), t.kind === "gap" && (this._selected = {
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
		let t = e.slot.id, n = [...this._copyDays].sort((e, t) => e - t), r = I(this._live, this.data).days, i = aa(r, {
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
		r.length && this._edit((r, i) => {
			let a = oa(r, {
				day: this.weekday,
				id: i(e)
			}, t, this._ctx(), n);
			return a === r ? null : a;
		}, r, [e]);
	}
	_spansNow() {
		return this._draft ? [...this.spans.filter((e) => e.spill), ...this._spansOf(this._draft)] : this.spans;
	}
	_spansOf(e) {
		let t = [];
		for (let n of e) {
			let e = z(this.data, n.label);
			if (!e || !Ur(this.hass, this.program, this.entityId, e, n)) continue;
			let r = H(n, this._at);
			t.push({
				start: r.start,
				end: r.end ?? r.start + 10,
				color: e.color,
				label: B(this.hass, e),
				slotId: n.id,
				marker: r.end === null,
				startSun: Wt(n.start),
				endSun: n.end ? Wt(n.end) : null,
				startSpec: n.start,
				endSpec: n.end ?? null
			});
		}
		return t;
	}
	get _selectedTime() {
		let e = this._sel;
		if (!e) return "";
		let t = e.slot, n = Ma(this.lang, e.start, t?.end ? this._at(t.end) : e.end, t?.start, t?.end);
		return this._bubble?.text ? `${n} · ${this._bubble.text}` : n;
	}
	_spanTip(e) {
		let t = (e.spill ? I(this._live, this.data).days[(this.weekday + 6) % 7] ?? [] : this._day).find((t) => t.id === e.slotId), n = !this._draft || e.spill ? this.preview?.find((t) => t.slot_id === e.slotId) : void 0, r = t?.start ?? e.startSpec, i = t?.end ?? e.endSpec, a = r && "time" in r ? M(r.time) : n ? N(n.start, this.tz) : t ? this._at(t.start) : e.start, o = e.marker || t && !t.end ? null : i && "time" in i ? M(i.time) : n?.end ? N(n.end, this.tz) : t?.end ? this._at(t.end) : e.end;
		return `${e.label} · ${Ma(this.lang, a, o, t?.start ?? e.startSpec ?? void 0, t?.end ?? e.endSpec)}`;
	}
	get _tipText() {
		if (this._tip === "now") return this.now === null ? "" : k(this.lang, "now_time", { time: F(this.lang, this.now) });
		let e = this._tip === null ? void 0 : this._spansNow()[this._tip];
		return e ? this._spanTip(e) : "";
	}
	_tipMove(e) {
		if (e.pointerType !== "mouse" || e.buttons || this._drag || this._mv) {
			this._tip = null;
			return;
		}
		let t = this._spansNow();
		if (this._radial) {
			let n = this.renderRoot.querySelector(".radial-face");
			n && (this._tip = tn(t, this.now, this.view === "radial_12h", e.clientX, e.clientY, n.getBoundingClientRect()));
			return;
		}
		let n = this.renderRoot.querySelector("wp-day-bar")?.shadowRoot?.querySelector(".bar");
		if (!n) return;
		let r = n.getBoundingClientRect();
		if (e.clientY < r.top - 4 || e.clientY > r.bottom + 4 || e.clientX < r.left || e.clientX > r.right) {
			this._tip = null;
			return;
		}
		let i = (e.clientX - r.left) / r.width * j;
		if (this._tip = this.now !== null && Math.abs(i - this.now) * r.width / 1440 <= 8 ? "now" : null, this._tip !== "now") for (let e = t.length - 1; e >= 0; e--) {
			let n = t[e];
			if (!n.ignored && (n.marker ? Math.abs(i - n.start) * r.width / 1440 <= 8 : i >= n.start && i < n.end)) {
				this._tip = e;
				break;
			}
		}
	}
	_focusSlotTip(e) {
		let t = this._spansNow().findIndex((t) => t.slotId === e && !t.spill);
		this._tip = t < 0 ? null : t;
	}
	_zoneLabel() {
		let e = O(this.lang).days[this.weekday] ?? "", t = this.deviceName ? k(this.lang, "edit_bar_of", {
			name: this.deviceName,
			day: e
		}) : k(this.lang, "edit_bar"), n = this._spansNow().filter((e) => !e.ignored).map((e) => this._spanTip(e));
		this.now !== null && n.push(k(this.lang, "now_time", { time: F(this.lang, this.now) }));
		let r = n.length ? `${t} : ${n.join(" ; ")}` : t;
		return !this._radial && this._barText ? `${this._barText}, ${r}` : r;
	}
	_tipTargets() {
		let e = (e, t, n, r, i) => {
			let a = this._radial ? Zt(n, this.view === "radial_12h") : null;
			return y`<span class="tip-target" aria-hidden="true" title=${t}
        style=${a ? `left:${a.x / 3.2}%;top:${a.y / 3.2}%;width:24px;height:24px;transform:translate(-50%,-50%)` : e === "now" ? `left:${n / j * 100}%;top:-4px;bottom:-4px;width:16px;transform:translateX(-50%)` : `left:${r / j * 100}%;width:${Math.max(i - r, 5) / j * 100}%;top:0;bottom:0`}
></span>`;
		};
		return y`<div class="tip-targets ${this._radial ? "round" : ""}">
      ${this._spansNow().map((t, n) => e(n, this._spanTip(t), t.marker ? t.start : (t.start + t.end) / 2, t.start, t.end))}
      ${this.now === null ? x : e("now", k(this.lang, "now_time", { time: F(this.lang, this.now) }), this.now, this.now, this.now)}
    </div>`;
	}
	_clock(e) {
		return e >= 1440 ? Bt(this.lang) : F(this.lang, e);
	}
	_sunTitle(e, t) {
		let n = this._draft?.find((t) => t.id === e.id), r = e.edge === "start" ? n?.start : n?.end;
		return Gt(this.lang, r, t);
	}
	_overlay_() {
		let e = this._day, t = this._ctx(), n = (e) => `${e / j * 100}%`, r = this._sel, i = Gi(e, t);
		return y`<div class="ov ${this._hover ? "grab" : ""}" title=${this._tipText || this._selectedTime} aria-label=${this._selectedTime}
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => this._hover = !1}>
      ${r && r.end !== null ? y`<div class="selbox ${r.slot ? "" : "gap"}"
        style="left:${n(r.start)};width:${n(r.end - r.start)}"></div>` : x}
      ${r?.slot && r.end === null ? y`<div class="selpoint" style="left:${n(r.start)}"></div>` : x}
      ${bt(i, (e) => e.refs.map((e) => `${e.id}:${e.edge}`).join("+"), (e) => {
			let t = e.refs[0], r = this._hsel && e.refs.some((e) => e.id === this._hsel?.id && e.edge === this._hsel?.edge);
			return y`<button class="hd ${e.oneShot ? "dot" : ""} ${r ? "on" : ""}" style="left:clamp(0px, ${n(e.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${e.m}
          aria-valuetext=${this._clock(e.m)} aria-label=${k(this.lang, "handle", { time: this._clock(e.m) })}
          data-h=${e.refs.map((e) => `${e.id}:${e.edge}`).join(" ")} title=${this._sunTitle(t, e.m)}
          @keydown=${(e) => this._key(e, t)} @focus=${() => {
				this._hsel = t, this._selected = {
					kind: "slot",
					id: t.id
				}, this._focusSlotTip(t.id);
			}} @blur=${() => {
				this._tip = null;
			}}
          ><i></i></button>`;
		})}
      ${!this._selectedTime && this._bubble ? y`<div class="bubble" style="left:clamp(44px, ${n(this._bubble.m)}, calc(100% - 44px))">${this._bubble.text ?? this._clock(this._bubble.m)}</div>` : x}
    </div>`;
	}
	_strip() {
		let e = this._sel;
		if (!e) return x;
		let t = this.lang, n = this._ctx(), r = e.end !== null && (e.slot ? !!e.slot.end : !!n.defaultLabel) && Yi(e.start, e.end) !== null, i = O(t).days_short;
		return y`<div class="strip" role="group">
      <div class="acts">
        ${e.slot ? y`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${k(t, "strip_erase")}</button>` : x}
        <div class="grp" role="group" aria-label=${k(t, "grp_time")}>
          <button class="act" ?disabled=${!r} aria-label=${`${k(t, "cut")}. ${k(t, "cut_hint")}`} title=${k(t, "cut_hint")} @click=${() => this._cut()}>
            <ha-icon icon="mdi:arrow-split-vertical"></ha-icon>${k(t, "cut")}</button>
        </div>
        ${e.slot ? y`<div class="grp" role="group" aria-label=${k(t, "grp_days")}>
          <button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
            aria-label=${`${k(t, "copy_to")} ${k(t, "copy_hint")}`} title=${k(t, "copy_hint")}
            @click=${() => {
			this._copyOpen = !this._copyOpen, this._copyDays = [];
		}}><ha-icon icon="mdi:content-copy"></ha-icon>${k(t, "copy_to")}</button>
        </div>` : x}
      </div>
      ${this._copyOpen && e.slot ? y`<div class="copy">
        ${i.map((e, t) => t === this.weekday ? x : y`<button class="dchip ${this._copyDays.includes(t) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(t)} @click=${() => this._toggleDay(t)}>${e}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${k(t, "copy_go")} title=${k(t, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${k(t, "copy_go")}</button>
        ${this._copyDays.length ? x : y`<span class="copy-hint" role="status">${k(t, "copy_pick_days")}</span>`}
      </div>` : x}
      <div class="pick">
        <wp-label-picker compact readonly-settings .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
          .value=${e.slot?.label ?? null} @label-change=${(e) => {
			e.stopPropagation(), this._pickLabel(e.detail);
		}}></wp-label-picker>
      </div>
    </div>`;
	}
	_askBox() {
		let e = this._ask;
		if (!e) return x;
		let t = this.lang;
		return y`<div class="ask" role="group" aria-label=${k(t, "who_title")}>
      <span>${k(t, "who_title")}</span>
      <div class="acts">
        <button class="act" @click=${() => this._answer("one")}><ha-icon icon="mdi:numeric-1-circle-outline"></ha-icon>${k(t, "who_one", { name: String(this.hass.states[this.entityId]?.attributes.friendly_name ?? this.entityId) })}</button>
        <button class="act" @click=${() => this._answer("all")}><ha-icon icon="mdi:select-all"></ha-icon>${e.count >= U(this._live).length ? k(t, "who_all", { n: String(e.count) }) : k(t, "who_some", {
			me: String(this.hass.states[this.entityId]?.attributes.friendly_name ?? this.entityId),
			names: e.others.map((e) => String(this.hass.states[e]?.attributes.friendly_name ?? e)).join(", ")
		})}</button>
        <button class="act" @click=${() => this._askCancel()}><ha-icon icon="mdi:undo-variant"></ha-icon>${k(t, "who_keep")}</button>
      </div>
    </div>`;
	}
	_conflictDialog() {
		let e = this._conflict;
		if (!e) return x;
		let t = this.lang, n = O(t).days, r = (t, n) => {
			this._conflict = {
				...e,
				skip: n ? [...e.skip.filter((e) => e !== t), t] : e.skip.filter((e) => e !== t)
			};
		}, i = e.to.every((t) => e.skip.includes(t)), a = I(this._live, this.data).days, o = this._ctx(), s = (e, t) => y`<div class="cfbar"><span>${e}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(t)} .now=${null}></wp-day-bar></div>`;
		return y`<wp-dialog open heading=${k(t, "conflict_title")} @closed=${(e) => {
			e.stopPropagation(), this._conflict = null;
		}}>
      <div class="cf">
        ${e.days.map((i) => y`<div class="cfrow"><strong>${n[i]}</strong>
          ${s(k(t, "cf_before"), a[i] ?? [])}
          ${s(k(t, "cf_after"), e.skip.includes(i) ? a[i] ?? [] : oa(a, {
			day: this.weekday,
			id: e.id
		}, [i], o)[i] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${n[i]}>
            <button role="radio" aria-checked=${!e.skip.includes(i)} class=${e.skip.includes(i) ? "" : "on"} @click=${() => r(i, !1)}>${k(t, "replace")}</button>
            <button role="radio" aria-checked=${e.skip.includes(i)} class=${e.skip.includes(i) ? "on" : ""} @click=${() => r(i, !0)}>${k(t, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => this._conflict = null}>${k(t, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${i} @click=${() => void this._doCopy(e.id, e.to, e.skip)}>${k(t, "copy_go")}</button>
    </wp-dialog>`;
	}
	_hoursAxis() {
		return y`<div class="hours" aria-hidden="true">${[
			0,
			6,
			12,
			18,
			24
		].map((e) => y`<span style="left:${e / 24 * 100}%">${e === 24 ? Bt(this.lang) : F(this.lang, e * 60)}</span>`)}</div>`;
	}
	render() {
		return !this.hass || !this.data || !this.program ? x : y`
      <div class="zone ${this.editing ? "editing" : ""}" title=${this._tipText || (this.editing ? this._selectedTime : "")} tabindex=${vt(this.editing ? void 0 : 0)}
        role=${vt(this.editing ? void 0 : "button")} aria-label=${vt(this.editing ? void 0 : this._zoneLabel())}
        @keydown=${this._zoneKey}
        @pointerdown=${(e) => {
			this._tip = null, this._zoneDown(e);
		}}
        @pointermove=${(e) => {
			this._zoneMove(e), this._tipMove(e);
		}} @pointerup=${this._zoneUp}
        @pointerleave=${() => {
			this._tip = null;
		}}
        @pointercancel=${this._zoneCancel} @contextmenu=${(e) => {
			this._press && !this._press.mouse && e.preventDefault();
		}}>
        ${this.editing && !this._radial && this._selectedTime ? y`<div class="selected-time-row" style=${`grid-template-columns:minmax(0, ${Math.max(0, Math.min(j, (this._sel.start + (this._sel.end ?? this._sel.start)) / 2))}fr) auto minmax(0, ${j - Math.max(0, Math.min(j, (this._sel.start + (this._sel.end ?? this._sel.start)) / 2))}fr)`}>
          <div class="selected-time" title=${this._selectedTime} aria-label=${this._selectedTime} role="status">${this._selectedTime}</div></div>` : x}
        ${this._radial ? y`<div class="radial-face"><wp-radial-day passive device-name=${this.deviceName} .spans=${this._spansNow()} .now=${this.now}
          .double=${this.view === "radial_12h"} .selectedTime=${this.editing ? this._selectedTime : ""} lang=${this.lang} rest=${this.rest}></wp-radial-day>
          ${this.editing ? this._radialOverlay() : x}${this._tipTargets()}</div>` : y`<wp-day-bar notches ?no-tab=${!this.editing} lang=${this.lang} device-name=${this.deviceName} @visible-text=${(e) => {
			this._barText = e.detail;
		}} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${k(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : x}${this._tipTargets()}</wp-day-bar>`}
        ${this._tipText ? y`<div id="schedule-tooltip" class="hover-tip ${this._radial ? "round" : ""}" role="tooltip"
          title=${this._tipText} aria-label=${this._tipText}>${this._tipText}</div>` : x}
        <div class="hold-hint" role="status">${this._hint ? k(this.lang, "hold_hint") : x}</div>
      </div>
      ${this.hours && !this._radial ? this._hoursAxis() : x}
      ${this.editing && !this._moving && !this._ask ? this._strip() : x}
      ${this._askBox()}
      ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
      ${this._conflictDialog()}`;
	}
	static {
		this.styles = [ti, l`
    :host { display: block; min-width: 0; }
    .zone { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .hours { position: relative; height: 20px; font-size: 0.75rem; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
    .tip-targets { position: absolute; inset: 0; pointer-events: none; }
    .tip-targets.round { bottom: auto; aspect-ratio: 1; }
    .tip-target { position: absolute; pointer-events: none; border-radius: 8px; }
    .tip-target:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .hover-tip {
      position: absolute; bottom: calc(100% + 4px); left: 0; right: 0; margin: auto; width: max-content;
      max-width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; z-index: 8;
      pointer-events: none; overflow-wrap: anywhere; text-align: center; font-size: 0.8125rem; line-height: 1.4;
      background: var(--primary-text-color, #212121); color: var(--card-background-color, #fff);
      box-shadow: 0 2px 8px rgba(0, 0, 0, .3);
    }
    .hover-tip.round { bottom: auto; top: 12px; }
    .zone::before { content: ""; position: absolute; inset: -10px 0; } /* 28 px bar, 48 px tap area, layout unchanged */
    .zone:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 3px; border-radius: 14px; }
    /* above the "now" line of the bar (z-index 5) */
    .hold-hint {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 6; max-width: 96%;
      padding: 6px 12px; border-radius: 16px; font-size: 0.8125rem; line-height: 1.3; text-align: center; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff);
    }
    .hold-hint:empty { display: none; }
    .selected-time-row { display: grid; margin-bottom: 20px; }
    .selected-time {
      grid-column: 2; min-width: 0; max-width: 100%; box-sizing: border-box;
      padding: 4px 10px; border-radius: 10px; background: var(--primary-text-color, #212121);
      color: var(--card-background-color, #fff); font-size: 0.875rem; font-weight: 600; line-height: 1.4;
      text-align: center; overflow-wrap: anywhere; pointer-events: auto;
    }
    .zone.editing { touch-action: none; cursor: default; }
    .ov { position: absolute; inset: 0; touch-action: none; z-index: 2; }
    .radial-face { position: relative; max-width: 360px; margin: auto; }
    .polar { bottom: auto; aspect-ratio: 1; }
    .polar-selection { position: absolute; inset: 0; width: 100%; pointer-events: none; }
    .polar .hd { width: 44px; height: 44px; bottom: auto; margin: -22px 0 0 -22px; }
    .polar-time { position: absolute; top: 42%; left: 32%; width: 36%; padding: 12px 0; text-align: center; background: var(--card-background-color); pointer-events: none; font-weight: 600; }
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
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 0.875rem; font-weight: 600;
      white-space: nowrap; pointer-events: none; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .ask { margin: 4px 0 8px; padding: 8px; border: 2px solid var(--wp-primary-text); border-radius: 12px; }
    .ask > span { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 6px; }
    .strip { margin: 4px 0 8px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .strip wp-label-picker { --mdc-icon-size: 18px; }
    .acts { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .grp { display: inline-flex; }
    :host([drop]) .zone { outline: 2px dashed var(--wp-primary-text); outline-offset: 3px; border-radius: 14px; }
    .pick { margin-top: 8px; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; min-width: 48px; padding: 0 12px;
      border-radius: 24px; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
      font: inherit; font-size: 0.875rem; cursor: pointer; --mdc-icon-size: 20px;
    }
    .act:hover:not(:disabled) { background: var(--secondary-background-color); }
    .act.on { border: 2px solid var(--wp-primary-text); background: color-mix(in srgb, var(--wp-primary-text) 12%, transparent); }
    .act:disabled { opacity: 0.4; cursor: default; }
    /* edit actions (erase, cut, copy): flat text buttons in a row, not pills, so they differ from the setting chips */
    .strip > .acts { gap: 0; padding-bottom: 6px; border-bottom: 1px solid var(--divider-color); }
    .strip > .acts .act { border: 0; border-radius: 8px; padding: 0 10px; color: var(--wp-primary-text); font-weight: 500; }
    .strip > .acts .act.on { border: 0; }
    .act.go { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; }
    .copy-hint { flex-basis: 100%; font-size: 0.875rem; color: var(--secondary-text-color); }
    .copy { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
    .dchip {
      min-width: 48px; min-height: 48px; padding: 0 10px; border-radius: 24px; border: 1px solid var(--wp-field-border); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 0.875rem; cursor: pointer;
    }
    .dchip.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; }
    .cf { display: flex; flex-direction: column; gap: 12px; }
    .cfrow { display: flex; flex-direction: column; gap: 6px; }
    .seg2 { display: flex; flex-wrap: wrap; gap: 6px; }
    .cfbar { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px; font-size: 0.8125rem; }
    .cfbar span { color: var(--secondary-text-color); }
    .seg2 button {
      flex: 1 1 140px; min-height: 48px; padding: 0 12px; border-radius: 24px; border: 1px solid var(--wp-field-border); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 0.875rem; cursor: pointer;
    }
    .seg2 button.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
  `];
	}
};
D([T({ attribute: !1 })], W.prototype, "hass", void 0), D([T({ attribute: !1 })], W.prototype, "data", void 0), D([T({ attribute: !1 })], W.prototype, "program", void 0), D([T({ attribute: "entity-id" })], W.prototype, "entityId", void 0), D([T({ type: Number })], W.prototype, "weekday", void 0), D([T({ attribute: !1 })], W.prototype, "spans", void 0), D([T({ attribute: !1 })], W.prototype, "preview", void 0), D([T({ type: Number })], W.prototype, "now", void 0), D([T({ type: Boolean })], W.prototype, "editing", void 0), D([T({ type: Boolean })], W.prototype, "editable", void 0), D([T({ type: Boolean })], W.prototype, "hours", void 0), D([T({ attribute: "device-name" })], W.prototype, "deviceName", void 0), D([T()], W.prototype, "lang", void 0), D([T()], W.prototype, "tz", void 0), D([T()], W.prototype, "view", void 0), D([T()], W.prototype, "rest", void 0), D([T({
	type: Boolean,
	reflect: !0
})], W.prototype, "drop", void 0), D([E()], W.prototype, "_draft", void 0), D([E()], W.prototype, "_selected", void 0), D([E()], W.prototype, "_hsel", void 0), D([E()], W.prototype, "_bubble", void 0), D([E()], W.prototype, "_copyOpen", void 0), D([E()], W.prototype, "_copyDays", void 0), D([E()], W.prototype, "_conflict", void 0), D([E()], W.prototype, "_error", void 0), D([E()], W.prototype, "_ask", void 0), D([E()], W.prototype, "_hover", void 0), D([E()], W.prototype, "_tip", void 0), D([E()], W.prototype, "_moving", void 0), D([E()], W.prototype, "_hint", void 0), D([E()], W.prototype, "_barText", void 0), W = Na = D([w("wp-bar-editor")], W);
// src/components/mode-notice.ts
var Va = 6048e5, Ha = class extends S {
	constructor(...e) {
		super(...e), this._busy = !1, this._error = "";
	}
	get _lang() {
		return $r(this.hass);
	}
	async _call(e) {
		if (!this._busy) {
			this._busy = !0, this._error = "";
			try {
				await this.hass.callWS(e);
			} catch (e) {
				this._error = Dt(this._lang, e);
			} finally {
				this._busy = !1;
			}
		}
	}
	_resolve(e, t) {
		return this._call({
			type: "weekly_planner/mode/resolve",
			old: e,
			new: t
		});
	}
	async _delete(e) {
		await ci(this, k(this._lang, "mode_gone_confirm", { old: e }), k(this._lang, "slot_delete_yes"), k(this._lang, "slot_delete_no")) && await this._resolve(e, null);
	}
	_lastRename() {
		let e = this.data.mode?.renamed ?? [], t = e[e.length - 1];
		if (!t) return;
		let n = Date.parse(t.at);
		return Number.isFinite(n) && Date.now() - n <= Va ? t : void 0;
	}
	_followLost() {
		return (this.data.mode?.follow_lost ?? []).filter((e) => {
			let t = Date.parse(e.at);
			return Number.isFinite(t) && Date.now() - t <= Va;
		});
	}
	render() {
		let e = this.data?.mode;
		if (!this.hass || !e?.selector) return x;
		let t = this._lang, n = e.proposals ?? [], r = new Set(n.map((e) => e.old)), i = [...n, ...(e.orphans ?? []).filter((e) => !r.has(e)).map((e) => ({
			old: e,
			candidates: []
		}))], a = this._lastRename(), o = this._followLost();
		return !i.length && !a && !o.length ? x : y`
      ${o.map((e) => C("warning", "", k(t, "mode_follow_lost", {
			modes: e.modes.join(", "),
			source: e.source
		}), { role: "status" }))}
      ${i.map((e) => y`<div class="callout tone-warning" role="status">
        <ha-icon icon="mdi:alert-outline"></ha-icon><div class="co-body">
        <p>${k(t, "mode_gone", { old: e.old })}${e.candidates.length ? y` ${k(t, "mode_gone_ask")}` : x}</p>
        <div class="btns">
          ${e.candidates.map((t) => y`<button class="btn" ?disabled=${this._busy} @click=${() => void this._resolve(e.old, t)}>
            <ha-icon icon="mdi:arrow-right-bold-outline"></ha-icon>${t}</button>`)}
          <button class="btn del" ?disabled=${this._busy} @click=${() => void this._delete(e.old)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>${k(t, "mode_gone_delete")}</button>
        </div></div>
      </div>`)}
      ${a ? C("warning", "", k(t, "mode_renamed", {
			old: a.old,
			new: a.new
		}), {
			role: "status",
			extra: y`
        <div class="btns"><button class="btn" ?disabled=${this._busy}
          @click=${() => void this._call({
				type: "weekly_planner/mode/undo_rename",
				new: a.new
			})}>
          <ha-icon icon="mdi:undo"></ha-icon>${k(t, "mode_undo")}</button>
          <button class="btn" ?disabled=${this._busy}
          @click=${() => void this._call({
				type: "weekly_planner/mode/dismiss_rename",
				new: a.new
			})}>
          <ha-icon icon="mdi:check"></ha-icon>${k(t, "ok")}</button></div>`
		}) : x}
      ${this._error ? C("error", "", this._error, { role: "alert" }) : x}`;
	}
	static {
		this.styles = [nt, l`
    :host { display: block; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 0.9375rem;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .btn.del { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
    .btn:disabled { opacity: 0.5; cursor: default; }
    .btn:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `];
	}
};
D([T({ attribute: !1 })], Ha.prototype, "hass", void 0), D([T({ attribute: !1 })], Ha.prototype, "data", void 0), D([E()], Ha.prototype, "_busy", void 0), D([E()], Ha.prototype, "_error", void 0), Ha = D([w("wp-mode-notice")], Ha);
// src/chart-sources.ts
var Ua = (e) => e === "unknown" || e === "unavailable" || e.trim() === "", Wa = (e) => !Ua(e) && Number.isFinite(Number(e)) ? Number(e) : null, Ga = (e) => e === "on" ? 100 : e === "off" ? 0 : Wa(e);
function Ka(e, t, n = []) {
	return [...n.map((e) => e.s), ...e.states[t] ? [e.states[t].state] : []].filter((e) => !Ua(e)).some((e) => e === "on" || e === "off");
}
var qa = (e, t, n = []) => String(e.states[t]?.attributes.unit_of_measurement ?? n[n.length - 1]?.a.unit_of_measurement ?? "");
function Ja(e, t) {
	let n = e.states[t];
	return !n || Array.isArray(n.attributes.options) ? "states" : qa(e, t) || n.attributes.state_class || Wa(n.state) !== null ? "numeric" : "states";
}
function Ya(e, t = "") {
	let n = 2166136261;
	for (let r of `${e}\0${t}`) n = Math.imul(n ^ r.charCodeAt(0), 16777619);
	return `hsl(${(n >>> 0) % 360} 68% 43%)`;
}
function Xa(e, t, n = []) {
	let r = e.states[t.entity_id], i = Array.isArray(r?.attributes.options) ? r.attributes.options.filter((e) => typeof e == "string") : [];
	return [.../* @__PURE__ */ new Set([
		...i,
		...r && !Ua(r.state) ? [r.state] : [],
		...n.map((e) => e.s).filter((e) => !Ua(e)),
		...t.states ?? []
	])].sort();
}
function Za(e, t, n) {
	let r = e.states[t];
	return r ? e.formatEntityState?.({
		...r,
		state: n
	}, n) ?? n : n;
}
function Qa(e, t, n, r) {
	if (r <= n) return [];
	let i = [...e].sort((e, t) => e.t - t.t), a = [], o = n, s = null, c = (e) => {
		e <= o || (a.push({
			from: o,
			to: e,
			state: s,
			selected: s !== null && t.includes(s),
			missing: s === null || Ua(s)
		}), o = e);
	};
	for (let e of i) if (e.t <= n) s = e.s;
	else {
		if (e.t >= r) break;
		c(e.t), s = e.s;
	}
	return c(r), a;
}
function $a(e, t, n) {
	return [.../* @__PURE__ */ new Set([...n === null ? [] : [n], ...t.filter((t) => t.kind === "numeric" && e.states[t.entity_id]).map((t) => qa(e, t.entity_id))])];
}
function eo(e, t, n, r) {
	let i = r ? [{
		...r,
		color: "var(--primary-color)"
	}] : [], a = !1;
	for (let r of t.filter((e) => e.kind === "numeric")) {
		if (!e.states[r.entity_id] && !(n[r.entity_id] ?? []).some((e) => Ga(e.s) !== null)) continue;
		let t = qa(e, r.entity_id, n[r.entity_id]), o = i.find((e) => e.unit === t);
		if (!o) {
			if (i.length === 3) {
				a = !0;
				continue;
			}
			o = {
				unit: t,
				color: Ya(r.entity_id),
				lo: Infinity,
				hi: -Infinity
			}, i.push(o);
		}
		for (let e of n[r.entity_id] ?? []) {
			let t = Ga(e.s);
			t !== null && (o.lo = Math.min(o.lo, t - 1), o.hi = Math.max(o.hi, t + 1));
		}
	}
	for (let e of i) e.unit === "%" ? (e.lo = 0, e.hi = 100) : Number.isFinite(e.lo) ? (e.lo = Math.floor(e.lo), e.hi = Math.ceil(e.hi)) : (e.lo = 0, e.hi = 1);
	return {
		axes: i,
		overflow: a
	};
}
function to(e, t) {
	let n = t - e;
	if (!(n > 0) || !Number.isFinite(n)) return [e];
	let r = 10 ** Math.floor(Math.log10(n / 4)), i = [
		1,
		2,
		5,
		10
	].map((e) => e * r).find((e) => n / e <= 4) ?? r * 10, a = [];
	for (let n = 0, r = Math.ceil(e / i) * i; n < 6 && r <= t + i * 1e-9; n++, r += i) a.push(r);
	return a;
}
function no(e) {
	let t = [];
	for (let n of e) {
		let e = [...n.history].sort((e, t) => e.t - t.t), r;
		for (let t of e) if (t.t <= n.start) r = t;
		else break;
		t.push(r ? {
			...r,
			t: n.start
		} : {
			t: n.start,
			s: "unknown",
			a: {}
		}), t.push(...e.filter((e) => e.t > n.start && e.t < n.end));
	}
	return [...new Map(t.map((e) => [e.t, e])).values()].sort((e, t) => e.t - t.t);
}
var ro = (e, t) => t.alias?.trim() || L(e, t.entity_id);
function io(e, t, n, r) {
	let i = t.split(".")[0], a = e.states[t]?.attributes.device_class, o = r ? [`component.${i}.entity_component._.state_attributes.${r}.name`] : typeof a == "string" ? [`component.${i}.entity_component.${a}.name`] : [];
	for (let t of o) {
		let r = e.localize?.(t);
		if (r && r !== t) return n ? `${r} (${n})` : r;
	}
	return "";
}
function ao(e, t, n, r, i) {
	let a = e.locale?.language ?? e.language, o = io(e, t, n, i);
	return o ? k(a, `chart_quantity_${r}`, { quantity: o }) : k(a, r === "set" ? "chart_requested_value" : r);
}
// src/sorted-times.ts
function oo(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + Math.floor((r - n) / 2);
		e[i] <= t ? n = i + 1 : r = i;
	}
	return n;
}
function so(e, t, n) {
	let r = oo(e, t + n);
	return r > 0 && e[r - 1] >= t - n;
}
// src/chart-refresh.ts
var co = /* @__PURE__ */ new Set(), lo, uo = () => {
	document.hidden || co.forEach((e) => e());
};
function fo(e) {
	return co.add(e), lo === void 0 && (lo = setInterval(uo, 6e4), document.addEventListener("visibilitychange", uo)), () => {
		co.delete(e), co.size || (clearInterval(lo), lo = void 0, document.removeEventListener("visibilitychange", uo));
	};
}
// src/planned.ts
var po = .5;
function mo(e, t, n) {
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
		t?.active && n - e > po && i.push({
			from: e,
			to: n,
			value: t.value,
			color: t.color,
			name: t.name
		});
	}, s = 0;
	r.forEach((e, c) => {
		o(s, e.start), i.push({
			from: e.start,
			to: e.end,
			value: e.value,
			color: e.color,
			name: e.name
		});
		let l = r[c + 1];
		e.end < n - po && (!l || l.start - e.end > po) && t?.active && a.push(e.end), s = e.end;
	}), o(s, n);
	let c = i.flatMap((e) => e.value === null ? [] : [{
		from: e.from,
		to: e.to,
		value: e.value,
		color: e.color
	}]), l = [];
	for (let e = 1; e < c.length; e++) {
		let t = c[e - 1], n = c[e];
		Math.abs(t.to - n.from) <= po && Math.abs(t.value - n.value) > 1e-9 && l.push({
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
var ho = /* @__PURE__ */ new Set([
	"off",
	"idle",
	"unavailable",
	"unknown",
	"docked",
	""
]), go = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function _o(e, t, n) {
	if (t === "unavailable" || t === "unknown") return !1;
	switch (e) {
		case "climate": {
			let e = n.hvac_action;
			if (typeof e == "string" && e !== "") return e !== "idle" && e !== "off";
			if (t === "off") return !1;
			let r = go(n.temperature), i = go(n.current_temperature);
			return r === null || i === null ? !1 : t === "cool" ? i - r > .3 : r - i > .3;
		}
		case "light":
		case "switch":
		case "fan":
		case "input_boolean": return t === "on";
		case "cover": return t === "open" || t === "opening" || t === "closing";
		case "vacuum": return t === "cleaning" || t === "returning";
		case "media_player": return t === "playing";
		default: return !ho.has(t);
	}
}
function vo(e, t, n) {
	let r = [...e].sort((e, t) => e.m - t.m), i = [];
	return r.forEach((e, a) => {
		let o = Math.max(0, e.m), s = Math.min(n, a + 1 < r.length ? r[a + 1].m : n);
		if (s - o <= 0 || !_o(t, e.state, e.attrs)) return;
		let c = i[i.length - 1];
		c && Math.abs(c[1] - o) < .01 ? c[1] = s : i.push([o, s]);
	}), i;
}
function yo(e, t) {
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
// src/components/chart-options.ts
var G = class extends S {
	constructor(...e) {
		super(...e), this.entityId = "", this.mainUnit = null, this.histories = {}, this._draft = null, this._saved = null, this._saving = 0, this._error = "", this._done = !1, this._queue = Promise.resolve(), this._identity = "", this._generation = 0, this._sequence = 0;
	}
	willUpdate() {
		let e = `${this.program?.id}|${this.entityId}`;
		e !== this._identity && (this._identity = e, this._generation++, this._draft = null, this._saved = null, this._saving = 0, this._error = "", this._done = !1);
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "en";
	}
	get _editable() {
		return this.data?.can_edit && !this.data.read_only;
	}
	get _live() {
		return this._saved && this._saved.id === this.program.id && this._saved.revision > this.program.revision ? this._saved : this.program;
	}
	get _sources() {
		return this._draft ?? this._live.entities.find((e) => e.entity_id === this.entityId)?.chart_sources ?? [];
	}
	_change(e) {
		if (!this._editable) return;
		this._draft = e, this._done = !1, this._error = "";
		let t = ++this._sequence, n = this._generation, r = this.hass, i = this.program.id, a = this.entityId;
		this._saving++, this._queue = this._queue.then(async () => {
			try {
				for (let o = 0; o < 2; o++) {
					let s = await r.callWS({ type: "weekly_planner/get" });
					if (!s.can_edit || s.read_only) throw Error("unauthorized");
					let c = s.programs.find((e) => e.id === i);
					if (!c || !c.entities.some((e) => e.entity_id === a)) throw Error("gone");
					let l = {
						...c,
						entities: c.entities.map((t) => t.entity_id === a ? {
							...t,
							chart_sources: e
						} : t)
					};
					try {
						let e = await r.callWS({
							type: "weekly_planner/program/save",
							program: l
						});
						n === this._generation && this.program.id === i && this.entityId === a && (this._saved = e.program, this.dispatchEvent(new CustomEvent("chart-sources-saved", {
							detail: e.program,
							bubbles: !0,
							composed: !0
						})), t === this._sequence && (this._draft = null, this._done = !0));
						return;
					} catch (e) {
						if (e.code !== "conflict" || o) throw e;
					}
				}
			} catch (r) {
				let i = r, a = i.message?.trim(), o = e.some((e) => e.alias) && ["invalid", "invalid_format"].includes(i.code ?? "") && /alias/.test(a ?? "");
				n === this._generation && t === this._sequence && (this._draft = null, this._error = o ? k(this._lang, "chart_alias_schema_failed") : `${k(this._lang, "chart_sources_save_failed")}${a ? ` ${a}` : ""}`);
			} finally {
				n === this._generation && this._saving--;
			}
		});
	}
	_add(e) {
		if (!e || e === this.entityId || this._sources.some((t) => t.entity_id === e)) return;
		let t = Ja(this.hass, e), n = {
			entity_id: e,
			kind: t,
			...t === "states" ? { states: Ua(this.hass.states[e]?.state ?? "") ? [] : [this.hass.states[e].state] } : {}
		}, r = [...this._sources, n];
		$a(this.hass, r, this.mainUnit).length > 3 ? this._error = k(this._lang, "chart_sources_axes_full") : this._change(r);
	}
	_alias(e, t) {
		let n = t.trim();
		n.length > 60 || this._change(this._sources.map((t) => {
			if (t.entity_id !== e.entity_id) return t;
			let { alias: r, ...i } = t;
			return n ? {
				...i,
				alias: n
			} : i;
		}));
	}
	_toggle(e, t) {
		let n = e.states ?? [];
		this._change(this._sources.map((r) => r.entity_id === e.entity_id ? {
			...r,
			states: n.includes(t) ? n.filter((e) => e !== t) : [...n, t]
		} : r));
	}
	render() {
		if (!this.hass || !this.data || !this.program) return x;
		let e = this._lang;
		return y`<details><summary>${k(e, "chart_options")}</summary>
      ${this._sources.map((t) => y`<section>
        <div class="source"><i style=${`background:${Ya(t.entity_id)}`}></i>
          <span>${L(this.hass, t.entity_id)}${t.kind === "numeric" ? y` <small>${qa(this.hass, t.entity_id)}</small>` : x}</span>
          <button ?disabled=${!this._editable} aria-label=${k(e, "chart_source_remove", { name: L(this.hass, t.entity_id) })}
            @click=${() => this._change(this._sources.filter((e) => e.entity_id !== t.entity_id))}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <label>${k(e, "chart_source_alias")}
          <input type="text" maxlength="60" .value=${t.alias ?? ""}
            placeholder=${L(this.hass, t.entity_id)} ?disabled=${!this._editable}
            @change=${(e) => this._alias(t, e.target.value)}>
        </label>
        ${this.hass.states[t.entity_id] ? x : y`<small>${k(e, "chart_source_missing")}</small>`}
        ${t.kind === "states" ? y`<div class="states" role="group" aria-label=${k(e, "chart_source_states")}>
          ${Xa(this.hass, t, this.histories[t.entity_id]).map((e) => y`<label>
            <input type="checkbox" ?checked=${t.states?.includes(e)} ?disabled=${!this._editable} @change=${() => this._toggle(t, e)}>
            <i style=${`background:${Ya(t.entity_id, e)}`}></i>${Za(this.hass, t.entity_id, e)}</label>`)}
          ${Xa(this.hass, t, this.histories[t.entity_id]).length ? x : y`<small>${k(e, "chart_source_no_states")}</small>`}
        </div>` : x}
      </section>`)}
      ${this._editable ? y`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${k(e, "chart_source_add")}
        .exclude=${[this.entityId, ...this._sources.map((e) => e.entity_id)]}
        @wp-change=${(e) => {
			e.stopPropagation(), this._add(e.detail);
		}}></wp-entity-picker>` : x}
      <p role="status">${this._saving ? k(e, "chart_sources_saving") : this._done ? k(e, "chart_sources_saved") : ""}</p>
      ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
    </details>`;
	}
	static {
		this.styles = l`
    ${nt}
    :host { display:block; margin-top:8px; }
    details { border:1px solid var(--divider-color); border-radius:12px; padding:0 10px; }
    summary { min-height:44px; display:list-item; align-content:center; cursor:pointer; font-size:0.875rem; }
    section { padding:8px 0; border-top:1px solid var(--divider-color); }
    .source { display:flex; gap:8px; align-items:center; } .source span { flex:1; overflow-wrap:anywhere; }
    i { display:inline-block; width:10px; height:10px; border-radius:50%; flex:none; }
    button { min-width:44px; min-height:44px; border:0; background:transparent; color:inherit; cursor:pointer; --mdc-icon-size:20px; }
    button:disabled { opacity:.4; } .states { display:flex; flex-wrap:wrap; gap:4px 12px; }
    label { display:flex; align-items:center; gap:6px; min-height:44px; font-size:0.875rem; }
    input[type="text"] { min-width:0; width:100%; box-sizing:border-box; min-height:44px; color:var(--primary-text-color); background:var(--card-background-color); border:1px solid var(--divider-color); border-radius:4px; padding:8px; }
    small, p { color:var(--secondary-text-color); font-size:0.75rem; } p:empty { display:none; } .callout p { font-size:0.875rem; color:var(--primary-text-color); }
  `;
	}
};
D([T({ attribute: !1 })], G.prototype, "hass", void 0), D([T({ attribute: !1 })], G.prototype, "data", void 0), D([T({ attribute: !1 })], G.prototype, "program", void 0), D([T()], G.prototype, "entityId", void 0), D([T({ attribute: !1 })], G.prototype, "mainUnit", void 0), D([T({ attribute: !1 })], G.prototype, "histories", void 0), D([E()], G.prototype, "_draft", void 0), D([E()], G.prototype, "_saved", void 0), D([E()], G.prototype, "_saving", void 0), D([E()], G.prototype, "_error", void 0), D([E()], G.prototype, "_done", void 0), G = D([w("wp-chart-options")], G);
// src/chart-history.ts
var bo = /* @__PURE__ */ new WeakMap(), xo = 128;
function So(e) {
	let t = {};
	return Array.isArray(e) ? e.flatMap((e) => {
		(e.a ?? e.attributes) && (t = e.a ?? e.attributes);
		let n = e.lu ?? e.lc ?? e.last_updated_ts, r = typeof n == "number" ? n * 1e3 : Date.parse(e.last_updated ?? "");
		return Number.isFinite(r) ? [{
			t: r,
			s: String(e.s ?? e.state ?? ""),
			a: t
		}] : [];
	}) : [];
}
async function Co(e, t, n, r, i) {
	let a = Date.now();
	if (n >= a) return Object.fromEntries(t.map((e) => [e, []]));
	let o = e.connection ?? e, s = bo.get(o);
	s || (s = /* @__PURE__ */ new Map(), bo.set(o, s));
	let c = s, l = r > a ? 6e4 : Infinity, u = (e) => `${e}|${n}|${r}`, d = /* @__PURE__ */ new Map();
	for (let e of t) {
		let t = c.get(u(e));
		t && a - t.at < l && d.set(e, t.promise);
	}
	let f = [...new Set(t)].filter((e) => {
		let t = c.get(u(e));
		return !t || a - t.at >= l;
	});
	if (f.length) {
		let t = e.callWS({
			type: "history/history_during_period",
			start_time: new Date(n).toISOString(),
			end_time: new Date(Math.min(r, a)).toISOString(),
			entity_ids: f,
			minimal_response: !1,
			no_attributes: !1,
			significant_changes_only: !1
		});
		for (let e of f) {
			let n = t.then((t) => So(t[e]).filter((e) => e.t <= Math.min(r, a))), i = {
				at: a,
				promise: n
			};
			d.set(e, n), c.delete(u(e)), c.set(u(e), i), n.catch(() => {
				c.get(u(e)) === i && c.delete(u(e));
			});
		}
		for (; c.size > xo;) c.delete(c.keys().next().value);
	}
	let p = await Promise.all([...new Set(t)].map(async (e) => {
		let t = d.get(e);
		return t ? [e, await t.catch(() => (i?.(e), []))] : [e, []];
	}));
	return Object.fromEntries(p);
}
var wo = 1e-6;
function To(e, t) {
	return e.from + Math.min(1, Math.max(0, t)) * (e.to - e.from);
}
var Eo = [
	5,
	10,
	15,
	30,
	60,
	120,
	180,
	360
];
function Do(e, t = 8.5) {
	return Eo.find((n) => e / n <= t) ?? Eo[Eo.length - 1];
}
function Oo(e, t) {
	let n = [];
	for (let r = Math.ceil(e.from / t - wo) * t + 0; r <= e.to + wo; r += t) n.push(r);
	return n;
}
function ko(e, t) {
	return {
		from: e.from + t,
		to: e.to + t
	};
}
function Ao(e, t, n, r, i) {
	let a = Math.max(30, Math.min(i, (e.to - e.from) / (t > 0 ? t : 1))), o = n - Math.max(0, Math.min(1, r)) * a;
	return {
		from: o,
		to: o + a
	};
}
// src/components/chart.ts
function jo(e, t) {
	let n = A("en-GB", {
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
function Mo(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = Date.UTC(n, r - 1, i);
	return a - jo(a - jo(a, t), t);
}
function K(e, t) {
	return {
		startMs: Mo(e, t),
		endMs: Mo(Nt(e, 1), t)
	};
}
function No(e) {
	let [t, n, r] = e.split("-").map(Number);
	return It(new Date(Date.UTC(t, n - 1, r, 12)), "UTC");
}
var Po = 6e4, Fo = /* @__PURE__ */ new WeakMap();
function Io(e, t, n, r) {
	let i = Fo.get(e);
	i || (i = /* @__PURE__ */ new Map(), Fo.set(e, i));
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
function Lo(e) {
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
function Ro(e) {
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
function zo(e, t) {
	let n = Math.floor((t - 8) / 6);
	return n < 4 ? "" : e.length <= n ? e : `${e.slice(0, n - 1)}…`;
}
var Bo = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", Vo = (e) => e === "unavailable" || e === "unknown" || e === "", Ho = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Uo = 6, Wo = 350, Go = 300, Ko = {
	l: t(0).left,
	r: e.right,
	t: 22,
	b: 22
}, qo = Ko, Jo = /* @__PURE__ */ new Set([
	"on",
	"open",
	"heat",
	"home",
	"playing",
	"cleaning",
	"unlocked",
	"armed_home",
	"armed_away"
]), q = class extends S {
	constructor(...e) {
		super(...e), this.entityId = "", this.showOptions = !1, this.date = "", this.slots = null, this._width = 320, this._loaded = null, this._zoom = null, this._band = null, this._ptrs = /* @__PURE__ */ new Map(), this._gesture = null, this._sourceKey = "", this._sourceHistory = {}, this._sourceFailures = [], this._displayProgram = null, this._dayData = /* @__PURE__ */ new Map(), this._guardUntil = 0, this._failed = !1, this._previewFailed = !1, this._model = null, this._token = 0, this._refresh = () => {
			if (document.hidden || !this.hass || !this.date) return;
			let { startMs: e } = K(this.date, this._tz);
			e + this._win.from * 6e4 <= Date.now() && Date.now() < e + this._win.to * 6e4 && this._load();
		};
	}
	get _sources() {
		return (this._displayProgram?.id === this.program.id && this._displayProgram.revision > this.program.revision ? this._displayProgram : this.program).entities.find((e) => e.entity_id === this.entityId)?.chart_sources ?? [];
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "en";
	}
	get _tz() {
		return this.hass.config.time_zone;
	}
	connectedCallback() {
		super.connectedCallback(), this._stopRefresh = fo(this._refresh), this._observer = new ResizeObserver((e) => {
			let t = e[0].contentRect.width;
			t > 120 && t !== this._width && (this._width = t);
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._observer?.disconnect(), this._stopRefresh?.(), this._stopRefresh = void 0, this._token++, clearTimeout(this._openTimer), clearTimeout(this._panLoadTimer);
	}
	firstUpdated() {
		let e = this.renderRoot.querySelector(".box");
		e && this._observer?.observe(e);
	}
	willUpdate(e) {
		if (jt(this.hass), !this.hass || !this.program || !this.data || !this.date) return;
		let t = `${this.entityId}|${this.date}|${this._tz}|${this.program.id}|${Math.max(this.program.revision, this._displayProgram?.id === this.program.id ? this._displayProgram.revision : 0)}|${I(this.program, this.data).id}`;
		if ((e.has("entityId") || e.has("date")) && (this._zoom = null, this._band = null, this._gesture = null, this._ptrs.clear()), t !== this._sourceKey) this._sourceKey = t, this._dayData.clear(), this._loaded = null, this._sourceHistory = {}, this._sourceFailures = [], clearTimeout(this._panLoadTimer), this._load();
		else if (e.has("slots")) {
			let e = this._dayData.get(this.date);
			e && (e.slots = this.slots);
		}
		(e.has("slots") || e.has("data") || e.has("program") || e.has("entityId") || e.has("date") || e.has("_loaded")) && (this._model = this._loaded ? this._buildVisible() : null);
	}
	updated(e) {
		this.hass && this.program && [
			"hass",
			"program",
			"entityId",
			"_loaded",
			"_sourceHistory"
		].some((t) => e.has(t)) && this.dispatchEvent(new CustomEvent("chart-context", {
			bubbles: !0,
			composed: !0,
			detail: {
				programId: this.program.id,
				entityId: this.entityId,
				mainUnit: this._primaryUnit(),
				histories: this._sourceHistory
			}
		}));
	}
	_visibleDates() {
		let { startMs: e } = K(this.date, this._tz), t = this._win, n = P(new Date(e + t.from * 6e4), this._tz), r = P(/* @__PURE__ */ new Date(e + t.to * 6e4 - 1), this._tz), i = [n];
		for (; i[i.length - 1] !== r && i.length < 3;) i.push(Nt(i[i.length - 1], 1));
		return i;
	}
	async _load() {
		if (!this.hass || !this.entityId || !this.date) return;
		let e = ++this._token;
		this._failed = !1;
		let t = this._visibleDates(), n = I(this.program, this.data).id, r = await Promise.all(t.map(async (e) => {
			let t = K(e, this._tz), r = [], [i, a, o] = await Promise.all([
				this._loadAt(e),
				this._previewAt(e, n).catch(() => null),
				this._sources.length ? Co(this.hass, this._sources.map((e) => e.entity_id), t.startMs, t.endMs, (e) => r.push(e)) : Promise.resolve({})
			]);
			return {
				date: e,
				...i,
				slots: a,
				sources: o,
				failures: r
			};
		}));
		e === this._token && (this._dayData = new Map(r.map((e) => [e.date, {
			loaded: e.loaded,
			slots: e.slots
		}])), this._failed = r.some((e) => e.failed), this._previewFailed = r.some((e) => e.slots === null), this._loaded = r[0]?.loaded ?? {
			hist: [],
			log: [],
			sent: []
		}, this._sourceHistory = Object.fromEntries(this._sources.map((e) => [e.entity_id, no(r.map((t) => {
			let n = K(t.date, this._tz);
			return {
				start: n.startMs,
				end: n.endMs,
				history: t.sources[e.entity_id] ?? []
			};
		}))])), this._sourceFailures = [...new Set(r.flatMap((e) => e.failures))], this._model = this._buildVisible());
	}
	async _previewAt(e, t) {
		if (e === this.date && this.slots !== null) return this.slots;
		let n = await Un(this.hass, this.program.id, this.program.revision, e, t), r = Wn(n, this.entityId);
		if (n.by_entity) return r;
		let i = await Un(this.hass, this.program.id, this.program.revision, Nt(e, -1), t), a = K(e, this._tz).startMs;
		return [...Wn(i, this.entityId).filter((e) => e.end && Date.parse(e.start) < a && Date.parse(e.end) > a), ...r];
	}
	async _loadAt(e) {
		let t = `${this.entityId}|${e}|${this._tz}`, { startMs: n, endMs: r } = K(e, this._tz), i = Date.now(), a = r > i ? 6e4 : Infinity, o = n < i, s = new Date(Math.min(r, i)).toISOString();
		try {
			let e = o ? Io(this.hass.connection ?? this.hass, `h|${t}`, a, () => this.hass.callWS({
				type: "history/history_during_period",
				start_time: new Date(n).toISOString(),
				end_time: s,
				entity_ids: [this.entityId],
				minimal_response: !1,
				no_attributes: !1,
				significant_changes_only: !1
			})) : Promise.resolve({}), c = o ? Io(this.hass.connection ?? this.hass, `l|${t}`, a, () => this.hass.callWS({
				type: "logbook/get_events",
				start_time: new Date(n).toISOString(),
				end_time: s,
				entity_ids: [this.entityId]
			})).catch(() => []) : Promise.resolve([]), l = Math.min(14, Math.max(1, Math.ceil((i - n) / 864e5) + 1)), u = o ? Io(this.hass.connection ?? this.hass, `j|${this.entityId}|${l}`, 6e4, () => this.hass.callWS({
				type: "weekly_planner/journal",
				entity_id: this.entityId,
				days: l
			})).catch(() => ({ segments: [] })) : Promise.resolve({ segments: [] }), [d, f, p] = await Promise.all([
				e,
				c,
				u
			]);
			return {
				loaded: {
					hist: Lo(d[this.entityId]).filter((e) => e.t <= Math.min(r, i)),
					log: Ro(f),
					sent: (p.segments ?? []).filter((e) => e.entity_id === this.entityId).map((e) => Date.parse(e.at))
				},
				failed: !1
			};
		} catch {
			return {
				loaded: {
					hist: [],
					log: [],
					sent: []
				},
				failed: !0
			};
		}
	}
	_live(e) {
		let t = {
			measured: null,
			set: null,
			main: null
		};
		if (Vo(e.s)) return t;
		switch (er(this.entityId)) {
			case "climate": return {
				field: "temperature",
				measuredField: "current_temperature",
				measured: Ho(e.a.current_temperature),
				set: e.s === "off" ? null : Ho(e.a.temperature),
				main: null
			};
			case "cover": return {
				...t,
				field: "current_position",
				main: Ho(e.a.current_position) ?? (e.s === "open" ? 100 : e.s === "closed" ? 0 : null)
			};
			case "light": {
				let n = e.s === "on" ? Ho(e.a.brightness) : 0;
				return {
					...t,
					field: "brightness",
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
		let t = er(this.entityId);
		if ([
			"climate",
			"cover",
			"light"
		].includes(t)) return !0;
		let n = e.filter((e) => !Vo(e.s));
		return n.length > 0 && n.every((e) => Number.isFinite(Number(e.s)));
	}
	_build(e, t = this.date, n = this.slots) {
		let r = this._tz, { startMs: i, endMs: a } = K(t, r), o = Math.round((a - i) / 6e4), s = Date.now(), c = Math.max(0, Math.min(o, (s - i) / 6e4)), l = (e) => (e - i) / 6e4, u = er(this.entityId), d = I(this.program, this.data), f = /* @__PURE__ */ new Map();
		for (let e of this.program.profiles) for (let t of vn(e)) f.set(t.id, t);
		let p = No(t), m = [], ee = (e) => kn(e, this.entityId);
		if (!n) for (let { slot: e, end: t } of Rt(d.days[(p + 6) % 7].filter(ee))) !e.start.random_minutes && !e.end?.random_minutes && m.push({
			s: 0,
			e: t,
			slot: e,
			spill: !0
		});
		if (n) for (let e of n) {
			let t = f.get(e.slot_id);
			if (!t || !ee(t)) continue;
			let n = l(Date.parse(e.start)), r = e.end ? l(Date.parse(e.end)) : null;
			n >= o || (r === null ? n < 0 : r <= 0) || m.push({
				s: Math.max(0, n),
				e: r === null ? null : Math.min(o, r),
				slot: t,
				spill: n < 0,
				ignored: !!e.ignored
			});
		}
		else for (let e of (o === 1440 ? d.days[p] : []).filter(ee)) {
			if (e.start.random_minutes || e.end?.random_minutes) continue;
			let t = Lt(e.start);
			if (t === null) continue;
			let n = Lt(e.end ?? null);
			m.push({
				s: t,
				e: n === null ? null : n > t ? n : o,
				slot: e
			});
		}
		let te = this.program.entities.find((e) => e.entity_id === this.entityId), h = z(this.data, te?.default_label), ne = [], re = (e, t, n, r = {}, i) => {
			if (!t || e < 0 || e > o) return;
			let a = Ur(this.hass, this.program, this.entityId, t, i);
			a && ne.push({
				m: e,
				label: t,
				value: qr(a),
				end: n,
				...r
			});
		};
		for (let e of m) re(e.s, z(this.data, e.slot.label), !1, {
			sun: e.spill ? null : Wt(e.slot.start),
			spec: e.spill ? null : e.slot.start,
			ignored: e.ignored
		}, e.slot);
		let ie = (e) => qr(Ur(this.hass, this.program, this.entityId, e)), ae = mo(m.filter((e) => !e.ignored).flatMap((e) => {
			let t = z(this.data, e.slot.label);
			return t && Ur(this.hass, this.program, this.entityId, t, e.slot) ? [{
				start: e.s,
				end: e.e,
				color: t.color,
				name: t.name,
				value: ie(t)
			}] : [];
		}), h ? {
			color: h.color,
			name: h.name,
			value: ie(h),
			active: !!Ur(this.hass, this.program, this.entityId, h)
		} : null, o);
		ae.zones[0]?.from === 0 && !ne.some((e) => !e.ignored && e.m === 0) && re(0, h, !1);
		for (let e of ae.returns) re(e, h, !0);
		let oe = yo(vo(e.hist.map((e) => ({
			m: l(e.t),
			state: e.s,
			attrs: e.a
		})), u, c), c);
		ne.sort((e, t) => e.m - t.m);
		let se = this._numeric(e.hist), ce = [], g = [];
		if (se) {
			let t = {
				measured: [],
				set: [],
				main: []
			};
			for (let n of e.hist) {
				let e = Math.max(0, l(n.t)), r = this._live(n);
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
			]) t[e].some((e) => e.v !== null) && ce.push({
				key: e,
				pts: t[e]
			});
		} else e.hist.forEach((t, n) => {
			let r = Math.max(0, l(t.t)), i = n + 1 < e.hist.length ? l(e.hist[n + 1].t) : c;
			if (i <= r || Vo(t.s)) return;
			let a = g[g.length - 1];
			if (a && a.state === t.s && Math.abs(a.e - r) < .5) {
				a.e = i;
				return;
			}
			let o = this.hass.states[this.entityId];
			g.push({
				s: r,
				e: i,
				state: t.s,
				on: Jo.has(t.s),
				text: o ? this.hass.formatEntityState?.({
					...o,
					state: t.s,
					attributes: t.a
				}, t.s) ?? t.s : t.s
			});
		});
		let _ = [...e.sent].sort((e, t) => e - t), le = e.log.filter((e) => e.context && !e.user).map((e) => e.t).sort((e, t) => e - t), ue = (e) => so(_, e, Po), de = [], fe = e.hist[0]?.s;
		for (let t of e.log) {
			if (Vo(t.state)) continue;
			let e = t.state === fe;
			fe = t.state, (t.user || !t.context && !e && !ue(t.t)) && de.push(l(t.t));
		}
		let pe = u === "climate" ? "set" : u === "light" ? "main" : null, v = ce.find((e) => e.key === pe), me = [];
		if (v) {
			let e = null;
			for (let t of v.pts) {
				if (t.v !== null && e !== null && Math.abs(t.v - e) > .01) {
					let e = i + t.m * 6e4;
					me.push(t.m);
					let n = so(le, e, Po);
					ue(e) || n || de.some((e) => Math.abs(e - t.m) <= 1) || de.push(t.m);
				}
				t.v !== null && (e = t.v);
			}
		}
		de.sort((e, t) => e - t);
		let he = [
			...ne.map((e) => e.m),
			...e.sent.map(l),
			...me,
			...g.map((e) => e.s),
			...de
		].sort((e, t) => e - t), ge = [];
		for (let e of de) {
			if (e <= 1 || e > c) continue;
			let t = he[oo(he, e + .5)], n = Math.min(t ?? c, c);
			n > e ? ge.push([e, n]) : ge.push([e, Math.min(e + 5, o)]);
		}
		let _e = 0, ve = 100;
		if (se && u !== "cover" && u !== "light") {
			let e = [
				...ce.flatMap((e) => e.pts.map((e) => e.v)),
				...ne.map((e) => e.value),
				...ae.steps.map((e) => e.value)
			].filter((e) => e !== null);
			e.length && (_e = Math.floor(e.reduce((e, t) => Math.min(e, t), Infinity) - 1), ve = Math.ceil(e.reduce((e, t) => Math.max(e, t), -Infinity) + 1), ve - _e < 2 && (ve = _e + 2));
		}
		let ye = String(this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? (u === "climate" ? this.hass.config?.unit_system?.temperature ?? "°C" : u === "cover" || u === "light" ? "%" : ""));
		return {
			span: o,
			pastEnd: c,
			isToday: i <= s && s < a,
			kind: se ? "curve" : "band",
			lines: ce,
			bands: g,
			markers: ne,
			planned: ae,
			shade: oe,
			manual: ge,
			lo: _e,
			hi: ve,
			unit: ye,
			measuredField: this._live({
				t: 0,
				s: "on",
				a: {}
			}).measuredField,
			quantityField: this._live({
				t: 0,
				s: "on",
				a: {}
			}).field
		};
	}
	_buildVisible() {
		if (!this._dayData.size) return this._build(this._loaded);
		let e = K(this.date, this._tz), t = [...this._dayData].sort(([e], [t]) => e.localeCompare(t)).map(([t, n]) => ({
			model: this._build(n.loaded, t, n.slots),
			offset: (K(t, this._tz).startMs - e.startMs) / 6e4
		})), n = t[0].model, r = (Date.now() - e.startMs) / 6e4, i = [];
		for (let e of [
			"main",
			"set",
			"measured"
		]) {
			let n = t.flatMap(({ model: t, offset: n }) => {
				let r = t.lines.find((t) => t.key === e);
				if (!r) return [];
				let i = Math.min(t.span, t.pastEnd), a = r.pts[r.pts.length - 1];
				return [
					...r.pts.filter((e) => e.m <= i).map((e) => ({
						...e,
						m: e.m + n
					})),
					...a && i >= a.m ? [{
						m: i + n,
						v: a.v
					}] : [],
					{
						m: i + n,
						v: null
					}
				];
			});
			n.length && i.push({
				key: e,
				pts: n
			});
		}
		return {
			...n,
			span: (e.endMs - e.startMs) / 6e4,
			pastEnd: r,
			isToday: r >= this._win.from && r <= this._win.to,
			kind: t.some((e) => e.model.kind === "curve") ? "curve" : "band",
			lines: i,
			lo: Math.min(...t.map((e) => e.model.lo)),
			hi: Math.max(...t.map((e) => e.model.hi)),
			bands: t.flatMap(({ model: e, offset: t }) => e.bands.map((e) => ({
				...e,
				s: e.s + t,
				e: e.e + t
			}))),
			markers: t.flatMap(({ model: e, offset: t }) => e.markers.map((e) => ({
				...e,
				m: e.m + t
			}))),
			shade: t.flatMap(({ model: e, offset: t }) => e.shade.map((e) => ({
				...e,
				from: e.from + t,
				to: e.to + t
			}))),
			manual: t.flatMap(({ model: e, offset: t }) => e.manual.map(([e, n]) => [e + t, n + t])),
			planned: {
				zones: t.flatMap(({ model: e, offset: t }) => e.planned.zones.map((e) => ({
					...e,
					from: e.from + t,
					to: e.to + t
				}))),
				steps: t.flatMap(({ model: e, offset: t }) => e.planned.steps.map((e) => ({
					...e,
					from: e.from + t,
					to: e.to + t
				}))),
				risers: t.flatMap(({ model: e, offset: t }) => e.planned.risers.map((e) => ({
					...e,
					m: e.m + t
				}))),
				returns: t.flatMap(({ model: e, offset: t }) => e.planned.returns.map((e) => e + t))
			}
		};
	}
	get _historyPath() {
		let { startMs: e } = K(this.date, this._tz);
		return `/history?${new URLSearchParams({
			entity_id: this.entityId,
			start_date: new Date(e + this._win.from * 6e4).toISOString(),
			end_date: new Date(e + this._win.to * 6e4).toISOString()
		}).toString()}`;
	}
	_open() {
		clearTimeout(this._openTimer), this.dispatchEvent(new CustomEvent("open-history", {
			detail: this._historyPath,
			bubbles: !0,
			composed: !0
		}));
	}
	get _pad() {
		return this._model ? this._plotConfig(this._model).pad : Ko;
	}
	_plotConfig(e) {
		let t = eo(this.hass, this._sources, this._sourceHistory, e.kind === "curve" ? {
			unit: e.unit,
			lo: e.lo,
			hi: e.hi
		} : null);
		e.kind === "curve" && t.axes.length && (t.axes[0].color = e.lines[0]?.key === "measured" ? "var(--accent-color, #ff9800)" : e.lines[0]?.key === "set" ? "var(--primary-text-color)" : "var(--primary-color)");
		let n = e.kind === "curve" || t.axes.length > 0;
		return {
			...t,
			curve: n,
			pad: n ? Ko : qo
		};
	}
	get _span() {
		let e = K(this.date, this._tz);
		return (e.endMs - e.startMs) / 6e4;
	}
	get _win() {
		return this._zoom ?? {
			from: 0,
			to: this._span
		};
	}
	_setZoom(e) {
		this._zoom = e && !(Math.abs(e.from) < 1e-6 && Math.abs(e.to - this._span) < 1e-6) ? e : null, clearTimeout(this._panLoadTimer), this._token++, this._panLoadTimer = setTimeout(() => void this._load(), 120);
	}
	_px(e) {
		let t = this.renderRoot.querySelector("svg")?.getBoundingClientRect();
		return t && t.width > 0 ? (e.clientX - t.left) * this._width / t.width : e.clientX;
	}
	_frac(e) {
		let t = this._pad;
		return (e - t.l) / (this._width - t.l - t.r);
	}
	_down(e) {
		if (!this._model || e.pointerType === "mouse" && e.button !== 0) return;
		let t = this._px(e);
		this._ptrs.set(e.pointerId, {
			x: t,
			y: e.clientY
		});
		try {
			e.currentTarget?.setPointerCapture?.(e.pointerId);
		} catch {}
		if (this._ptrs.size === 2) {
			let [e, t] = [...this._ptrs.values()], n = this._win;
			this._band = null, this._gesture = {
				kind: "pinch",
				win: n,
				dist: Math.hypot(e.x - t.x, e.y - t.y),
				anchor: To(n, this._frac((e.x + t.x) / 2))
			}, this._guardUntil = Date.now() + Wo;
		} else this._ptrs.size === 1 && (this._gesture = e.pointerType === "mouse" && e.shiftKey ? {
			kind: "select",
			x0: t,
			moved: !1
		} : {
			kind: "pan",
			win: this._win,
			x0: t,
			y0: e.clientY,
			moved: !1
		});
	}
	_move(e) {
		let t = this._gesture, n = this._ptrs.get(e.pointerId);
		if (!t || !n || !this._model) return;
		n.x = this._px(e), n.y = e.clientY;
		let r = this._pad, i = this._width - r.l - r.r;
		if (t.kind === "pinch") {
			let [e, n] = [...this._ptrs.values()];
			if (!n) return;
			this._setZoom(Ao(t.win, Math.hypot(e.x - n.x, e.y - n.y) / (t.dist || 1), t.anchor, this._frac((e.x + n.x) / 2), this._span));
		} else if (t.kind === "pan") {
			if (!t.moved && Math.abs(n.y - t.y0) > Math.max(Uo, Math.abs(n.x - t.x0))) {
				this._gesture = null;
				return;
			}
			if (!t.moved && Math.abs(n.x - t.x0) < Uo) return;
			t.moved = !0, this._guardUntil = Date.now() + Wo, this._setZoom(ko(t.win, -(n.x - t.x0) / i * (t.win.to - t.win.from)));
		} else {
			if (!t.moved && Math.abs(n.x - t.x0) < Uo) return;
			t.moved = !0, this._guardUntil = Date.now() + Wo, this._band = {
				a: t.x0,
				b: n.x
			};
		}
	}
	_up(e) {
		let t = this._ptrs.get(e.pointerId);
		if (!t) return;
		this._ptrs.delete(e.pointerId);
		let n = this._gesture;
		if (n?.kind === "select" && n.moved && e.type === "pointerup") {
			let e = this._win, r = Math.abs(t.x - n.x0) / (this._width - this._pad.l - this._pad.r) * (e.to - e.from);
			this._setZoom(Ao(e, (e.to - e.from) / Math.max(30, r), To(e, this._frac((n.x0 + t.x) / 2)), .5, this._span));
		}
		if (n?.kind !== "select" && this._ptrs.size || (this._gesture = null), (n?.kind === "select" || n?.kind === "pan") && (this._guardUntil = n.moved ? Date.now() + Wo : this._guardUntil), this._band = null, n?.kind === "pinch") {
			let e = [...this._ptrs.values()][0];
			this._gesture = e && this._zoom ? {
				kind: "pan",
				win: this._zoom,
				x0: e.x,
				y0: e.y,
				moved: !0
			} : null, this._guardUntil = Date.now() + Wo;
		}
	}
	_wheel(e) {
		if (this._model) {
			if (e.ctrlKey) {
				e.preventDefault();
				let t = this._win;
				this._setZoom(Ao(t, Math.exp(-e.deltaY * .01), To(t, this._frac(this._px(e))), this._frac(this._px(e)), this._span));
			} else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
				e.preventDefault();
				let t = this._win;
				this._setZoom(ko(t, e.deltaX / (this._width - this._pad.l - this._pad.r) * (t.to - t.from)));
			}
		}
	}
	_zoomKey(e) {
		let t = this._win, n = (t.from + t.to) / 2;
		if (e.key === "+" || e.key === "=") this._setZoom(Ao(t, 1.5, n, .5, this._span));
		else if (e.key === "-") this._setZoom(Ao(t, 1 / 1.5, n, .5, this._span));
		else if (e.key === "0") this._setZoom(null);
		else if (e.key === "ArrowLeft" || e.key === "ArrowRight") this._setZoom(ko(t, (e.key === "ArrowLeft" ? -.25 : .25) * (t.to - t.from)));
		else return !1;
		return e.preventDefault(), !0;
	}
	_reset() {
		clearTimeout(this._openTimer), this._setZoom(null);
	}
	_click() {
		Date.now() < this._guardUntil || (clearTimeout(this._openTimer), this._zoom ? this._openTimer = setTimeout(() => this._open(), Go) : this._open());
	}
	_clock(e, t) {
		if (e === t && t === 1440 && this._win.from >= 0 && this._win.to <= t) return Bt(this._lang);
		let { startMs: n } = K(this.date, this._tz), r = this._win.from < 0 || this._win.to > t, i = new Date(n + e * 6e4), a = Mt();
		if (r && a !== "language") {
			let [e, t] = A("en-GB", {
				timeZone: this._tz,
				hour: "2-digit",
				minute: "2-digit",
				hourCycle: "h23"
			}).format(i).split(":").map(Number);
			return `${A(this._lang, {
				timeZone: this._tz,
				day: "numeric",
				month: "numeric"
			}).format(i)} ${F(this._lang, e * 60 + t)}`;
		}
		if (r) return A("en-GB", {
			timeZone: this._tz,
			day: "numeric",
			month: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).format(i);
		let [o, s] = A("en-GB", {
			timeZone: this._tz,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).format(i).split(":").map(Number);
		return F(this._lang, o * 60 + s);
	}
	_windowDate() {
		let e = K(this.date, this._tz).startMs, t = A(this._lang, {
			timeZone: this._tz,
			day: "numeric",
			month: "short",
			year: "numeric"
		}), n = t.format(new Date(e + this._win.from * 6e4)), r = t.format(/* @__PURE__ */ new Date(e + this._win.to * 6e4 - 1));
		return n === r ? n : `${n} – ${r}`;
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
		if (!this.hass || !this.data) return x;
		let e = this._lang, t = this._model, n;
		return n = t ? this._renderChart(t) : y`<div class="note">${k(e, "chart_loading")}</div>`, y`<div class="box">${n}</div>${t ? y`<div class="zoombar">
        <button class="zreset step" aria-label=${`${k(e, "chart_previous")}, ${this._shownName}`} @click=${() => this._setZoom(ko(this._win, -(this._win.to - this._win.from)))}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span class="zdate">${this._windowDate()}</span>
        <button class="zreset step" aria-label=${`${k(e, "chart_next")}, ${this._shownName}`} @click=${() => this._setZoom(ko(this._win, this._win.to - this._win.from))}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        ${this._zoom ? y`
        <span class="zwin">${k(e, "chart_zoom_window", {
			from: this._clock(this._zoom.from, t.span),
			to: this._clock(this._zoom.to, t.span)
		})}</span>
        <button class="zreset return-day" type="button" @click=${() => this._reset()}>
          <ha-icon icon="mdi:magnify-minus-outline"></ha-icon><span>${k(e, "chart_return")}</span></button>` : x}
      </div>` : x}${t ? y`${this._legend(t)}
      <div class="availability" role="status">
        ${this._failed ? y`<p>${k(e, "chart_history_failed")}</p>` : !t.lines.length && !t.bands.length ? y`<p>${k(e, t.pastEnd <= this._win.from ? "chart_future_history" : "chart_no_history")}</p>` : x}
        ${this._previewFailed ? y`<p>${k(e, "chart_preview_failed")}</p>` : x}
        ${!this._previewFailed && !t.markers.some((e) => !e.ignored) && !t.planned.zones.length ? y`<p>${k(e, "chart_no_planned")}</p>` : x}
      </div>` : x}
      ${this.showOptions ? y`<wp-chart-options .hass=${this.hass} .data=${this.data} .program=${this._displayProgram?.id === this.program.id && this._displayProgram.revision > this.program.revision ? this._displayProgram : this.program}
        .entityId=${this.entityId} .mainUnit=${this._primaryUnit()} .histories=${this._sourceHistory}
        @chart-sources-saved=${(e) => {
			e.stopPropagation(), this._displayProgram = e.detail;
		}}></wp-chart-options>` : x}`;
	}
	_primaryUnit() {
		let e = er(this.entityId);
		return [
			"climate",
			"cover",
			"light"
		].includes(e) || this._model?.kind === "curve" || this.hass.states[this.entityId]?.attributes.unit_of_measurement || this.hass.states[this.entityId]?.attributes.state_class || Wa(this.hass.states[this.entityId]?.state ?? "") !== null ? this._model?.unit ?? String(this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? (e === "climate" ? this.hass.config.unit_system?.temperature ?? "°C" : "%")) : null;
	}
	get _shownName() {
		return this.program?.entities.length === 1 ? this.program.name : L(this.hass, this.entityId);
	}
	_legend(e) {
		let t = this._lang, n = (e, t, n) => y`<span class="key"><i class=${e} style=${n ? `--k:${n}` : ""}></i>${t}</span>`, r = e.planned.zones.some((e) => e.value === null), i = (t) => e.lines.some((e) => e.key === t);
		return y`<div class="legend">
      ${e.markers.length || e.planned.zones.length ? n(r ? e.planned.steps.length ? "planned-mixed" : "planned-band" : "planned", r ? k(t, e.planned.steps.length ? "chart_program_mixed" : "chart_program_bands") : ao(this.hass, this.entityId, e.unit, "planned", e.quantityField)) : x}
      ${i("measured") ? n("measured", ao(this.hass, this.entityId, e.unit, "measured", e.measuredField)) : x}
      ${i("main") ? n("main", ao(this.hass, this.entityId, e.unit, "set", e.quantityField)) : x}
      ${i("set") ? n("set", ao(this.hass, this.entityId, e.unit, "set", e.quantityField)) : x}
      ${e.shade.length ? n("active", k(t, "active_key")) : x}
      ${e.manual.length ? n("manual", k(t, "manual")) : x}
      ${this._sources.map((e) => this._sourceLegend(e))}
    </div>`;
	}
	_sourceLegend(e) {
		let t = this._lang, n = e.entity_id, r = this._sourceHistory[n] ?? [], i = ro(this.hass, e);
		if (e.kind === "numeric") return y`<span class="source-key">
      <i style=${`background:${Ya(n)}`}></i>${i} · ${qa(this.hass, n, r)}
      ${Ka(this.hass, n, r) ? y`<small>${k(t, "chart_source_binary")}</small>` : x}
      ${this._sourceFailures.includes(n) ? y`<small>${k(t, "chart_source_history_failed")}</small>` : r.some((e) => Ga(e.s) !== null) ? x : y`<small>${k(t, "chart_source_no_history")}</small>`}
    </span>`;
		let a = K(this.date, this._tz).startMs, o = Qa(r, e.states ?? [], a + this._win.from * 6e4, Math.min(Date.now(), a + this._win.to * 6e4));
		return y`<span class="state-legend">${i}:
      ${(e.states ?? []).map((e) => y`<span><i style=${`background:${Ya(n, e)}`}></i>${Za(this.hass, n, e)}</span>`)}
      <span><i class="neutral"></i>${k(t, "chart_source_other")}</span>
      ${o.some((e) => e.missing) ? y`<span><i class="missing"></i>${k(t, "chart_source_gap")}</span>` : x}
      ${this._sourceFailures.includes(n) ? y`<span>${k(t, "chart_source_history_failed")}</span>` : x}
    </span>`;
	}
	_renderChart(e) {
		let t = this._lang, r = this._width, i = this._plotConfig(e), { curve: a } = i, o = a ? 150 : 84, s = i.pad, c = this._zoom ?? {
			from: 0,
			to: e.span
		}, l = !!this._zoom, u = (e) => n(r, e, c.from, c.to), d = i.axes[0] ?? {
			lo: e.lo,
			hi: e.hi
		}, f = (e, t) => s.t + (1 - (e - t.lo) / (t.hi - t.lo || 1)) * (o - s.t - s.b), p = (e) => f(e, d), { startMs: m } = K(this.date, this._tz), ee = Mt() === "12", te = c.to - c.from, h = ee && te >= 1440 ? 360 : ee && Do(te) < 60 ? Do(te, 6) : Do(te), ne = A("en-GB", {
			timeZone: this._tz,
			hour: "2-digit",
			...h < 60 ? { minute: "2-digit" } : {},
			hourCycle: "h23"
		}), re = (n) => {
			if (Math.abs(n - e.span) < 1e-6 && c.from >= 0 && c.to <= e.span) return ee ? zt(0, 0, !1, t) : h < 60 ? "24:00" : "24 h";
			let r = new Date(m + n * 6e4);
			if (ee) {
				let n = N(r, this._tz), i = zt(Math.floor(n / 60), n % 60, h < 60, t);
				return n === 0 && (c.from < 0 || c.to > e.span) ? `${A(t, {
					timeZone: this._tz,
					day: "numeric",
					month: "numeric"
				}).format(r)} ${i}` : i;
			}
			let i = ne.format(r);
			return N(r, this._tz) === 0 && (c.from < 0 || c.to > e.span) ? `${A(t, {
				timeZone: this._tz,
				day: "numeric",
				month: "numeric"
			}).format(r)} ${i}h` : h < 60 ? i : `${Number(i)}h`;
		}, ie = Oo(c, h), ae = (e) => e >= c.from - 1e-6 && e <= c.to + 1e-6, oe = (t) => {
			if (!l) return t === 0 ? "start" : t === e.span ? "end" : "middle";
			let n = u(t);
			return n - s.l < 16 ? "start" : r - s.r - n < 16 ? "end" : "middle";
		}, se = a ? to(d.lo, d.hi) : [], ce = s.t - 12, g = s.t, _ = o - s.t - s.b, le = e.shade.map((e) => {
			let t = Math.max(3, u(e.to) - u(e.from));
			return b`<rect class="shade" x=${u(e.from)} y=${g} width=${t} height=${_}></rect>
        <rect class="shade-edge" x=${u(e.from)} y=${g + _ - 3} width=${t} height=${3}></rect>`;
		}), ue = (e) => a && e.value !== null ? p(e.value) : ce, de = [], fe = (e, t) => {
			let n = Math.min(Math.max(u(e.m), 14), r - 14), i = Math.max(t - 8, 9);
			return de.some((e) => Math.abs(e.x - n) < 26 && Math.abs(e.y - i) < 12) ? null : (de.push({
				x: n,
				y: i
			}), {
				lx: n,
				ly: i
			});
		}, pe = [], v = [], me = (e) => {
			let n = ue(e), r = e.value === null ? null : fe(e, n), i = e.label.color;
			return b`
        <line class="drop" x1=${u(e.m)} x2=${u(e.m)} y1=${n} y2=${o - s.b}></line>
        ${e.sun ? x : b`<circle class="mk ${e.end ? "end" : ""} ${e.ignored ? "faded" : ""}" cx=${u(e.m)} cy=${n} r="5" style="--c:${i}"></circle>`}
        ${e.value !== null && r && v.push(b`<text class="val" x=${r.lx} y=${r.ly} text-anchor="middle">${ur(t, e.value)}</text>`), x}`;
		}, he = a ? e.lines.find((e) => e.key === "set") ?? e.lines.find((e) => e.key === "main") ?? e.lines[0] : void 0, ge = e.isToday && ae(e.pastEnd) ? b`<line class="now" x1=${u(e.pastEnd)} x2=${u(e.pastEnd)} y1=${s.t - 4} y2=${o - s.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${u(e.pastEnd) - 6}, ${s.t - 17}) scale(0.5)"><path d=${Bo}></path></g>` : x;
		return y`<div class="cwrap">
      <svg width=${r} height=${o} viewBox="0 0 ${r} ${o}" tabindex="0" role="button"
        aria-label=${k(t, "chart_open", { name: this._shownName })}
        @click=${() => this._click()}
        @dblclick=${() => this._reset()}
        @pointerdown=${(e) => this._down(e)}
        @pointermove=${(e) => this._move(e)}
        @pointerup=${(e) => this._up(e)}
        @pointercancel=${(e) => this._up(e)}
        @wheel=${(e) => this._wheel(e)}
        @keydown=${(e) => {
			e.key === "Enter" || e.key === " " ? (e.preventDefault(), this._open()) : this._zoomKey(e);
		}}>
        ${l ? b`<defs><clipPath id="plot"><rect x=${s.l - 3} y="0" width=${r - s.l - s.r + 6} height=${o}></rect></clipPath></defs>` : x}
        <g clip-path=${l ? "url(#plot)" : x}>${a ? le : x}</g>
        ${se.map((e) => (pe.push(b`<text class="ylab" style=${`fill:${i.axes[0]?.color ?? "var(--secondary-text-color)"}`} x=${s.l - 4} y=${p(e) + 3} text-anchor="end">${ur(t, e)}</text>`), b`<line class="grid" x1=${s.l} x2=${r - s.r} y1=${p(e)} y2=${p(e)}></line>`))}
        ${a && pe.push(b`<text class="unit" x="2" y="10" style=${`fill:${i.axes[0]?.color ?? "var(--primary-text-color)"}`}>${i.axes[0]?.unit ?? e.unit}</text>`), x}
        ${i.axes.slice(1).forEach((e, n) => {
			let i = r - s.r - 4 - n * 38, a = to(e.lo, e.hi);
			pe.push(b`<g class="source-axis" text-anchor="end" style=${`fill:${e.color};color:${e.color}`}>
            <text x=${i} y="10" style="fill:inherit">${e.unit}</text>
            ${a.map((n) => b`<text x=${i} y=${f(n, e) + 3} style="fill:inherit">${ur(t, n)}</text>`)}</g>`);
		})}
        ${ie.forEach((e) => pe.push(b`<text class="xlab" x=${u(e)} y=${o - 6} text-anchor=${oe(e)}>${re(e)}</text>`))}
        <g clip-path=${l ? "url(#plot)" : x}>
        ${a ? x : b`
          <rect class="track" x=${s.l} y=${g} width=${r - s.l - s.r} height=${_} rx="6"></rect>
          ${e.bands.map((e) => b`<rect class="band ${e.on ? "on" : ""}" x=${u(e.s)} y=${g} width=${Math.max(1, u(e.e) - u(e.s))} height=${_}></rect>`)}
          ${le}
          ${e.bands.map((e) => {
			let t = Math.max(e.s, c.from), n = Math.min(e.e, c.to), r = u(n) - u(t);
			return n > t && zo(e.text, r) && v.push(b`<text class="btxt" x=${u(t) + r / 2} y=${g + _ / 2 + 4} text-anchor="middle">${zo(e.text, r)}</text>`), x;
		})}
          ${e.manual.map(([e, t]) => b`<rect class="red-band" x=${u(e)} y=${g} width=${Math.max(3, u(t) - u(e))} height=${_}></rect>`)}`}
        ${a ? e.lines.map((t) => b`<path class="line ${t.key}" d=${this._path(t.pts, e, u, p, t.key !== "measured")}></path>`) : x}
        ${a ? e.manual.map((t) => {
			let n = he?.pts.find((e, n) => e.v !== null && (he.pts[n + 1]?.m ?? Infinity) > t[0])?.v ?? null;
			return b`${he ? b`<path class="line red" d=${this._path(he.pts, e, u, p, he.key !== "measured", t)}></path>` : x}
            ${n === null ? x : b`<circle class="reddot" cx=${u(t[0])} cy=${p(n)} r="3.5"></circle>`}`;
		}) : x}
        ${a ? e.planned.steps.map((e) => b`<path class="plan" d="M${u(e.from).toFixed(1)},${p(e.value).toFixed(1)}H${u(e.to).toFixed(1)}" style="--c:${e.color}"></path>`) : x}
        ${a ? e.planned.risers.map((e) => b`<line class="riser" x1=${u(e.m)} x2=${u(e.m)} y1=${p(e.from)} y2=${p(e.to)} style="--c:${e.color}"></line>`) : x}
        ${[...e.markers].filter((e) => !l || ae(e.m)).sort((e, t) => e.m - t.m).map(me)}
        ${this._sources.filter((e) => e.kind === "numeric").map((t) => {
			let n = i.axes.find((e) => e.unit === qa(this.hass, t.entity_id, this._sourceHistory[t.entity_id]));
			if (!n) return x;
			let r = this._sourceHistory[t.entity_id] ?? [], a = m + c.from * 6e4, o = Math.min(Date.now(), m + c.to * 6e4);
			if (o <= a) return x;
			let s;
			for (let e of r) if (e.t <= a) s = e;
			else break;
			let l = [...s ? [{
				...s,
				t: a
			}] : [], ...r.filter((e) => e.t > a && e.t <= o)].map((e) => ({
				m: (e.t - m) / 6e4,
				v: Ga(e.s)
			}));
			return b`<path class="source-line" d=${this._path(l, {
				...e,
				pastEnd: (o - m) / 6e4
			}, u, (e) => f(e, n), Ka(this.hass, t.entity_id, r))}
            style=${`stroke:${Ya(t.entity_id)}`}><title>${ro(this.hass, t)} · ${n.unit}</title></path>`;
		})}
        ${ge}
        </g>
        ${this._band ? b`<rect class="rubber" x=${Math.min(this._band.a, this._band.b)} y=${s.t - 4}
          width=${Math.abs(this._band.b - this._band.a)} height=${o - s.t - s.b + 4}></rect>` : x}
        <rect class="hit" x="0" y="0" width=${r} height=${o}></rect>
      </svg>
      <svg class="txt" width=${r} height=${o} viewBox="0 0 ${r} ${o}" aria-hidden="true" focusable="false">
        ${pe}<g clip-path=${l ? "url(#plot)" : x}>${v}</g>
      </svg>
      ${e.markers.filter((e) => e.sun && (!l || ae(e.m))).map((e) => y`<wp-tip class="suntip ${e.ignored ? "faded" : ""}" no-tab
        style="left:${u(e.m)}px;top:${ue(e)}px;--c:${e.label.color}" text=${Gt(t, e.spec, e.m)}>
        <span class="sunc"><ha-icon icon=${e.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${e.isToday && (!l || ae(e.pastEnd)) ? y`<wp-tip class="nowtip" no-tab label=${`${Kt(t, N(/* @__PURE__ */ new Date(), this._tz))}, ${this._shownName}`} style="left:${u(e.pastEnd)}px;top:${s.t - 11}px"
        text=${Kt(t, N(/* @__PURE__ */ new Date(), this._tz))}></wp-tip>` : x}
    </div>
    ${i.overflow ? y`<p class="source-warning" role="status">${k(t, "chart_sources_overflow")}</p>` : x}
    ${this._renderSourceRows(e, c, s)}
`;
	}
	_renderSourceRows(e, t, n) {
		let r = K(this.date, this._tz).startMs, i = r + t.from * 6e4, a = r + t.to * 6e4, o = Math.min(Date.now(), a), s = (e) => n.l + (e - i) / (a - i) * (this._width - n.l - n.r), c = e.planned.zones.filter((e) => e.value === null && e.to > t.from && e.from < t.to);
		return y`<div class="source-bands">
      ${c.length ? y`<div class="source-row program-row">
        <svg width=${this._width} height="24" viewBox="0 0 ${this._width} 24" role="img" aria-label=${k(this._lang, "chart_program_bands")}
          @pointerdown=${(e) => this._down(e)} @pointermove=${(e) => this._move(e)}
          @pointerup=${(e) => this._up(e)} @pointercancel=${(e) => this._up(e)}
          @wheel=${(e) => this._wheel(e)} @keydown=${(e) => this._zoomKey(e)}>
          ${c.map((e) => {
			let n = s(r + Math.max(e.from, t.from) * 6e4), i = s(r + Math.min(e.to, t.to) * 6e4) - n, a = e.name ?? k(this._lang, "planned");
			return b`<g class="program-band"><title>${a}</title>
              <rect x=${n} y="2" width=${i} height="20" fill=${e.color}></rect>
              ${zo(a, i) ? b`<text class="program-text" x=${n + i / 2} y="16" text-anchor="middle">${zo(a, i)}</text>` : x}
            </g>`;
		})}
        </svg></div>` : x}
      ${this._sources.filter((e) => e.kind === "states").map((e) => {
			let t = Qa(this._sourceHistory[e.entity_id] ?? [], e.states ?? [], i, o);
			return y`<div class="source-row"><div class="source-name">${ro(this.hass, e)}</div>
          <svg width=${this._width} height="22" viewBox="0 0 ${this._width} 22" aria-label=${ro(this.hass, e)}
            @pointerdown=${(e) => this._down(e)} @pointermove=${(e) => this._move(e)}
            @pointerup=${(e) => this._up(e)} @pointercancel=${(e) => this._up(e)} @wheel=${(e) => this._wheel(e)}>
            <rect x=${n.l} y="2" width=${Math.max(0, s(Math.max(i, o)) - n.l)} height="16" fill="var(--divider-color)" opacity=".2"></rect>
            ${t.map((t) => b`<rect class=${t.missing ? "source-gap" : ""} x=${s(t.from)} y="2" width=${Math.max(0, s(t.to) - s(t.from))} height="16"
              fill=${t.missing ? "var(--secondary-text-color)" : t.selected ? Ya(e.entity_id, t.state) : "var(--divider-color)"}
              opacity=${t.missing ? ".16" : t.selected ? "1" : ".4"}
              stroke=${t.missing ? "var(--secondary-text-color)" : "none"} stroke-dasharray=${t.missing ? "2 3" : "none"}>
              <title>${ro(this.hass, e)} · ${t.missing ? k(this._lang, "chart_source_gap") : Za(this.hass, e.entity_id, t.state)}</title></rect>`)}
          </svg>
          </div>`;
		})}
      ${e.kind === "band" && this._sources.some((e) => e.kind === "numeric") ? y`<div class="source-row"><div class="source-name">${this._shownName}</div><svg width=${this._width} height="22">
        ${e.bands.filter((e) => e.e > t.from && e.s < t.to).map((e) => b`<rect x=${s(r + Math.max(e.s, t.from) * 6e4)} y="2" width=${Math.max(0, s(r + Math.min(e.e, t.to) * 6e4) - s(r + Math.max(e.s, t.from) * 6e4))} height="16" fill=${e.on ? "var(--primary-color)" : "var(--divider-color)"}><title>${e.text}</title></rect>`)}
      </svg></div>` : x}
    </div>`;
	}
	static {
		this.styles = l`
    ${Ze}
    :host { display: block; }
    .program-band rect { fill-opacity: .24; stroke: var(--card-background-color); stroke-width: 1; }
    text.program-text { fill: var(--primary-text-color); font-size: 11px; font-weight: 600; }
    .key i.planned-mixed { height: 10px; border-top: 3px solid var(--secondary-text-color); background: var(--divider-color); }
    .key i.planned-band { height: 10px; border: 1px solid var(--secondary-text-color); background: var(--divider-color); }
    .source-axis text { paint-order: stroke; stroke: var(--card-background-color, var(--ha-card-background)); stroke-width: 3px; stroke-linejoin: round; }
    .source-line { fill:none; stroke-width:2; stroke-linejoin:round; }
    .legend, .state-legend { display:flex; gap:4px 12px; flex-wrap:wrap; font-size:0.75rem; color:var(--secondary-text-color); }
    .legend > span, .state-legend span { display:inline-flex; align-items:center; gap:5px; }
    .legend > span:not(.key) i, .state-legend i { display:inline-block; width:10px; height:10px; border-radius:50%; flex:none; }
    .source-key { flex-wrap:wrap; overflow-wrap:anywhere; max-width:100%; }
    .legend small { margin-left:4px; } .source-name { font-size:0.75rem; margin-top:8px; overflow-wrap:anywhere; }
    .neutral { background:var(--divider-color); } .missing { border:1px dashed var(--secondary-text-color); opacity:.5; }
    .source-warning { color:var(--wp-danger-text); font-size:0.8125rem; }
    .box { position: relative; width: 100%; min-height: 40px; }
    .availability { color: var(--secondary-text-color); font-size: 0.8125rem; line-height: 1.5; }
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
    /* vertical scroll of the page stays with the browser; horizontal moves and two fingers are ours (zoom) */
    svg { display: block; user-select: none; outline: none; max-width: 100%; cursor: pointer; touch-action: pan-y; }
    svg.txt { position: absolute; left: 0; top: 0; pointer-events: none; cursor: default; }
    .rubber { fill: var(--primary-color); opacity: 0.2; stroke: var(--primary-color); stroke-width: 1; pointer-events: none; }
    .zoombar { display: flex; align-items: center; justify-content: space-between; gap: 4px 8px; margin-top: 2px; flex-wrap: wrap; }
    .zdate { font-size: 0.8125rem; }
    .zwin { color: var(--secondary-text-color); font-size: 0.875rem; white-space: nowrap; }
    .zreset {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; min-width: 44px; padding: 0 12px;
      border: 1px solid var(--wp-field-border); border-radius: 22px; background: transparent; color: var(--wp-primary-text);
      font: inherit; font-size: 0.875rem; cursor: pointer; white-space: nowrap; --mdc-icon-size: 20px;
    }
    .zreset.step { min-height: 48px; min-width: 48px; padding: 0 10px; justify-content: center; }
    .zreset:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    svg:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; border-radius: 4px; }
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
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 0.8125rem; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 0.875rem; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.main { border-top: 2px solid var(--primary-color); }
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
D([T({ attribute: !1 })], q.prototype, "hass", void 0), D([T({ attribute: !1 })], q.prototype, "data", void 0), D([T({ attribute: !1 })], q.prototype, "program", void 0), D([T({ attribute: "entity-id" })], q.prototype, "entityId", void 0), D([T({
	type: Boolean,
	attribute: "show-options"
})], q.prototype, "showOptions", void 0), D([T()], q.prototype, "date", void 0), D([T({ attribute: !1 })], q.prototype, "slots", void 0), D([E()], q.prototype, "_width", void 0), D([E()], q.prototype, "_loaded", void 0), D([E()], q.prototype, "_zoom", void 0), D([E()], q.prototype, "_band", void 0), D([E()], q.prototype, "_sourceHistory", void 0), D([E()], q.prototype, "_sourceFailures", void 0), D([E()], q.prototype, "_displayProgram", void 0), D([E()], q.prototype, "_failed", void 0), D([E()], q.prototype, "_previewFailed", void 0), q = D([w("wp-chart")], q);
// src/components/slot-form.ts
var Yo = ["sunrise", "sunset"], Xo = {
	dawn: "next_dawn",
	sunrise: "next_rising",
	sunset: "next_setting",
	dusk: "next_dusk"
};
function Zo(e) {
	let t = Math.abs(e);
	return t < 60 ? `${t} min` : t % 60 ? `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, "0")}` : `${t / 60} h`;
}
function Qo(e, t, n) {
	return k(e, n && (t.sun === "sunrise" || t.sun === "sunset") ? `sun_${t.sun}` : t.sun === "sunrise" || t.sun === "sunset" ? `sun_${t.sun}_short` : `sun_${t.sun}`).toLowerCase();
}
function $o(e, t) {
	let n = (t) => {
		let n = M(t);
		return n >= 1440 ? Bt(e) : F(e, n);
	}, r = t.earliest ? n(t.earliest) : "", i = t.latest ? n(t.latest) : "";
	return t.earliest && t.latest ? k(e, "sun_limits_both", {
		a: r,
		b: i
	}) : t.earliest ? k(e, "sun_limits_earliest", { a: r }) : t.latest ? k(e, "sun_limits_latest", { b: i }) : "";
}
function es(e, t) {
	if (!e || !("sun" in t)) return null;
	let n = e.states?.["sun.sun"]?.attributes?.[Xo[t.sun]], r = e.config?.time_zone;
	if (!n || !r || Number.isNaN(new Date(n).getTime()) || P(new Date(n), r) !== P(/* @__PURE__ */ new Date(), r)) return null;
	let i = N(n, r) + (t.offset ?? 0);
	return t.earliest && (i = Math.max(i, M(t.earliest))), t.latest && (i = Math.min(i, M(t.latest))), Math.max(0, Math.min(j, i));
}
function ts(e, t) {
	if (!("sun" in t) || !t.offset && !t.earliest && !t.latest) return "";
	let n = t.offset ? ` ${t.offset > 0 ? "+" : "−"} ${Zo(t.offset)}` : "";
	return k(e, "sun_real", {
		base: `${Qo(e, t, !0)}${n}`,
		limits: $o(e, t)
	});
}
function ns(e, t) {
	let n = F(e, t % j);
	return t >= 1440 ? `${n} (${k(e, "next_day")})` : n;
}
function rs(e, t, n) {
	let r = es(t, n);
	return r === null ? "" : k(e, "sun_today", { time: ns(e, r) });
}
function is(e, t, n = "start", r) {
	let i = t.random_minutes ?? 0, a = n === "end" ? "random_range_end" : "random_range_start";
	if ("time" in t) {
		let n = M(t.time);
		return `${k(e, a, {
			start: ns(e, n),
			end: ns(e, n + i)
		})}.`;
	}
	let o = es(r, t);
	if (o !== null) {
		let n = t.latest ? Math.min(o + i, M(t.latest)) : o + i;
		return `${k(e, a, {
			start: ns(e, o),
			end: ns(e, Math.max(o, n))
		})}.`;
	}
	let s = t.offset ?? 0;
	return `${k(e, a, {
		start: `${Qo(e, t, !1)}${s ? ` ${s > 0 ? "+" : "−"} ${Zo(s)}` : ""}`,
		end: k(e, "random_later", { n: Zo(i) })
	})}${$o(e, t)}.`;
}
var J = class extends S {
	constructor(...e) {
		super(...e), this.entityIds = [], this.disabled = !1, this.device = "", this.also = !0, this.dayOnly = null, this._more = !1, this._advOpen = !1, this._advTouched = !1, this._advSlot = "", this._last = {
			start: "08:00",
			end: "09:00"
		}, this._typed = {}, this._limitOpen = {
			start: !1,
			end: !1
		};
	}
	get _lang() {
		return $r(this.hass);
	}
	get _usesAdvanced() {
		return [this.group?.slot.start, this.group?.slot.end].some((e) => !!(e && ("sun" in e || e.random_minutes)));
	}
	willUpdate() {
		let e = this.group?.slot.id ?? "";
		e !== this._advSlot && (this._advSlot = e, this._advTouched = !1, this._advOpen = !1), !this._advTouched && this._usesAdvanced && (this._advOpen = !0);
	}
	_advIsOpen() {
		return this._advTouched ? this._advOpen : this._advOpen || this._usesAdvanced;
	}
	_set(e, t) {
		let n = {
			...this.group.slot,
			...e
		};
		if (e.label !== void 0 && n.entities && this.device) {
			let e = Wr(this.hass, this.program, z(this.data, n.label), this.device);
			n = ma(n, [this.device, ...n.entities.filter((t) => e.includes(t))], this.program) ?? n;
		}
		let r = {
			...this.group,
			slot: n,
			days: t ?? this.group.days
		};
		this.dispatchEvent(new CustomEvent("group-change", {
			detail: r,
			bubbles: !0,
			composed: !0
		}));
	}
	_update(e, t) {
		(!t || "time" in t) && (this._limitOpen = {
			...this._limitOpen,
			[e]: !1
		}), t && "time" in t && (this._last = {
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
	_hintText(e, t) {
		let n = this._typed[e] ?? t;
		return Mt() !== "12" || !n || !/^\d{1,2}:\d{2}$/.test(n) ? null : F(this._lang, M(n));
	}
	_hintId(e, t) {
		return this._hintText(e, t) === null ? x : `hint12-${e}`;
	}
	_hint(e, t) {
		return this._hintText(e, t) === null ? x : y`<div class="hint12" id=${`hint12-${e}`}>= ${this._hintText(e, t)}</div>`;
	}
	_type(e, t) {
		this._typed = {
			...this._typed,
			[e]: t.target.value
		};
	}
	_typedDone(e) {
		let { [e]: t, ...n } = this._typed;
		this._typed = n;
	}
	_setLimitOption(e, t) {
		let n = this.group.slot[e];
		if (!n || !("sun" in n) || (this._limitOpen = {
			...this._limitOpen,
			[e]: t
		}, t)) return;
		let { earliest: r, latest: i, ...a } = n;
		this._update(e, a);
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
		if (!n) return x;
		let r = this._lang;
		O(r);
		let i = this.disabled;
		return y`
      <div class="time" role="group" aria-label=${t}>
        <button class="step" ?disabled=${i} aria-label=${k(r, "minus15")} title=${k(r, "minus15")} @click=${() => this._update(e, vi(n, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in n ? y`<input type="time" step="60" .value=${n.time === "24:00" ? "00:00" : n.time} ?disabled=${i}
              aria-label=${t} aria-describedby=${this._hintId(e, n.time === "24:00" ? "00:00" : n.time)} @input=${(t) => this._type(e, t)} @change=${(t) => {
			this._typedDone(e), this._fromInput(e, t.target.value);
		}} />` : y`<output class="sun">${_i(r, {
			...n,
			random_minutes: 0
		})}</output>`}
        <button class="step" ?disabled=${i} aria-label=${k(r, "plus15")} title=${k(r, "plus15")} @click=${() => this._update(e, vi(n, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>${"time" in n ? this._hint(e, n.time === "24:00" ? "00:00" : n.time) : x}`;
	}
	_advancedBlock(e, t) {
		let n = this.group.slot[e];
		if (!n) return x;
		let r = this._lang, i = O(r), a = this.disabled;
		return y`
      <h5>${t}</h5>
      <div class="chips">
        ${Yo.map((t) => {
			let r = "sun" in n && n.sun === t;
			return y`<button class="chip ${r ? "on" : ""}" aria-pressed=${r} ?disabled=${a}
            @click=${() => this._toggleSun(e, t)}><ha-icon icon=${t === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${i[`sun_${t}`] ?? t}</button>`;
		})}
      </div>
      ${"sun" in n ? this._limits(e, n, t) : x}
      <div class="random">
        <label><input type="checkbox" aria-describedby=${`random-${e}`} .checked=${!!n.random_minutes} ?disabled=${a}
          @change=${(t) => this._random(e, t.target.checked ? 15 : 0)} />${k(r, "random_time")}</label>
        ${n.random_minutes ? y`<label>${k(r, "random_minutes")}<input type="number" aria-describedby=${`random-${e}`} min="1" max="240" step="1" required
          .value=${String(n.random_minutes)} ?disabled=${a} @change=${(t) => {
			let n = t.target;
			n.validity.valid && this._random(e, Number(n.value));
		}} /></label><small id=${`random-${e}`}>${is(r, n, e, this.hass)}</small>` : x}
      </div>
      `;
	}
	_limits(e, t, n) {
		let r = this._lang, i = (i) => y`<div class="limit">
      <label>${k(r, i === "earliest" ? "sun_earliest" : "sun_latest")}
        <input type="time" step="60" .value=${t[i] === "24:00" ? "00:00" : t[i] ?? ""} ?disabled=${this.disabled}
          aria-label=${`${n}: ${k(r, i === "earliest" ? "sun_earliest" : "sun_latest")}`} aria-describedby=${this._hintId(`${e}-${i}`, t[i])}
          @input=${(t) => this._type(`${e}-${i}`, t)} @change=${(t) => {
			this._typedDone(`${e}-${i}`), this._limit(e, i, t.target.value);
		}} />
        ${this._hint(`${e}-${i}`, t[i])}</label>
      ${t[i] ? y`<button class="clear" ?disabled=${this.disabled} aria-label=${k(r, "sun_limit_clear")} title=${k(r, "sun_limit_clear")}
        @click=${() => this._limit(e, i, "")}><ha-icon icon="mdi:close"></ha-icon></button>` : x}
    </div>`, a = ts(r, t), o = rs(r, this.hass, t), s = this._limitOpen[e] || !!(t.earliest || t.latest);
		return y`<div class="random">
        <label><input type="checkbox" id=${`sun-option-${e}`} .checked=${s} ?disabled=${this.disabled}
          @change=${(t) => this._setLimitOption(e, t.target.checked)} />${k(r, "sun_limit_option")}</label>
      </div>
      ${s ? y`<div class="limits" role="group">${i("earliest")}${i("latest")}</div>` : x}
      ${a || o ? y`<small class="sun-help">${a}${a && o ? " " : ""}${o}</small>` : x}
      ${En(t) ? y`<small class="bad" role="alert">${k(r, "err_sun_bounds")}</small>` : x}`;
	}
	_toggleEnd(e) {
		if (!e) return this._update("end", null);
		let t = this.group.slot.start, n = "time" in t ? M(t.time) : 720;
		this._update("end", { time: Pt(Math.min(j - 5, n + 60)) });
	}
	_toggleDevice(e) {
		let t = U(this.program), n = jn(this.group.slot, t), r = n.includes(e) ? n.filter((t) => t !== e) : [...n, e], i = ma(this.group.slot, [...r, this.device], this.program);
		i && this.dispatchEvent(new CustomEvent("group-change", {
			detail: {
				...this.group,
				slot: i
			},
			bubbles: !0,
			composed: !0
		}));
	}
	_alsoFor() {
		let e = Wr(this.hass, this.program, z(this.data, this.group.slot.label), this.device);
		if (!this.also || !this.device || !e.length) return x;
		let t = jn(this.group.slot, U(this.program));
		return y`<section>
      <h4>${k(this._lang, "also_for")}</h4>
      <div class="chips" role="group" aria-label=${k(this._lang, "also_for")}>
        ${e.map((e) => y`<button class="chip ${t.includes(e) ? "on" : ""}" aria-pressed=${t.includes(e)} ?disabled=${this.disabled}
          @click=${() => this._toggleDevice(e)}>${t.includes(e) ? y`<ha-icon icon="mdi:check"></ha-icon>` : y`<ha-state-icon .hass=${this.hass} .stateObj=${this.hass.states[e]}></ha-state-icon>`}${L(this.hass, e)}</button>`)}
      </div>
    </section>`;
	}
	_toggleDay(e) {
		let t = this.group.days.includes(e) ? this.group.days.filter((t) => t !== e) : [...this.group.days, e];
		this._set({}, t.sort((e, t) => e - t));
	}
	render() {
		if (!this.group || !this.program) return x;
		let e = this._lang, t = O(e), n = this.group.slot, r = this.group.days, i = (e, t) => e.length === t.length && t.every((t) => e.includes(t)), a = (e, t) => y`<button class="chip small ${i(r, t) ? "on" : ""}"
      aria-pressed=${i(r, t)} ?disabled=${this.disabled} @click=${() => this._set({}, t === xi && i(r, t) ? [] : [...t])}>${i(r, t) ? y`<ha-icon icon="mdi:check"></ha-icon>` : x}${e}</button>`;
		return y`
      <section>
        <h4>${k(e, "start")}</h4>
        ${this._timeBlock("start", k(e, "start"))}
      </section>
      <section>
        <h4>${k(e, "end")}</h4>
        <div class="chips">
          <button class="chip ${n.end ? "" : "on"}" aria-pressed=${!n.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!1)}>${k(e, "no_end")}</button>
          <button class="chip ${n.end ? "on" : ""}" aria-pressed=${!!n.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(!0)}>${k(e, "with_end")}</button>
        </div>
        ${n.end ? this._timeBlock("end", k(e, "end")) : x}
      </section>
      <section>
        <h4>${k(e, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && i(r, [this.dayOnly]) ? y`<div class="chips"><span class="only">${t.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => this._more = !0}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${k(e, "apply_other_days")}</button></div>` : y`<div class="days" role="group" aria-label=${k(e, "days_label")}>
          ${t.days_short.map((e, n) => y`<button class="day ${r.includes(n) ? "on" : ""}" aria-pressed=${r.includes(n)}
            aria-label=${t.days[n]} ?disabled=${this.disabled} @click=${() => this._toggleDay(n)}>${r.includes(n) ? y`<ha-icon icon="mdi:check"></ha-icon>` : x}<span>${e}</span></button>`)}
        </div>
        <div class="chips">
          ${a(k(e, "all_days"), xi)}${a(k(e, "weekdays"), yi)}${a(k(e, "weekend"), bi)}
        </div>`}
      </section>
      <section>
        <h4>${k(e, "action")}</h4>
        <wp-label-picker embedded .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${n.label || null} ?disabled=${this.disabled}
          @label-change=${(e) => {
			e.stopPropagation(), this._set({ label: e.detail ?? "" });
		}}></wp-label-picker>
      </section>
      ${this._alsoFor()}
      ${ei(e, this._advIsOpen(), () => {
			let e = this._advIsOpen();
			this._advTouched = !0, this._advOpen = !e;
		}, y`${this._advancedBlock("start", k(e, "start"))}${n.end ? this._advancedBlock("end", k(e, "end")) : x}`)}`;
	}
	static {
		this.styles = [ti, l`
    :host { display: block; }
    section { margin: 0 0 14px; }
    h5 { margin: 8px 0 6px; font-size: 0.8125rem; font-weight: 600; color: var(--secondary-text-color); }
    h4 { margin: 0 0 6px; font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); }
    /* One field: [ − | time | + ], the steps (15 min) are part of the field. */
    .time {
      display: flex; align-items: stretch; margin-bottom: 8px; min-height: 56px; overflow: hidden;
      border: 1px solid var(--wp-field-border); border-radius: 12px; background: var(--card-background-color);
    }
    .time:focus-within { border-color: var(--wp-primary-text); }
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
      text-align: center; font-size: 1.5rem; font-weight: 600; min-height: 56px; color: var(--primary-text-color);
    }
    .hint12 { text-align: center; font-size: 1rem; color: var(--primary-text-color); margin-top: 2px; }
    .limit .hint12 { text-align: start; }
    .time output.sun { flex: 1; min-width: 0; align-self: center; text-align: center; font-size: 1.25rem; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); min-width: 64px; font-weight: 600; }
    .limits { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 8px; margin: 8px 0; } /* one column on a phone: a time needs about 7 rem plus its clear button */
    .limit { display: flex; align-items: flex-end; gap: 4px; min-width: 0; }
    .limit label { flex: 1; min-width: 0; display: grid; gap: 2px; font-size: 0.8125rem; color: var(--secondary-text-color); }
    .limit input[type="time"] {
      width: 100%; min-width: 0; box-sizing: border-box; min-height: 44px; font: inherit; font-size: 1rem;
      color: var(--primary-text-color); background: var(--card-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 8px;
    }
    .limit .clear {
      flex: none; width: 44px; height: 44px; border: none; background: none; color: var(--secondary-text-color);
      cursor: pointer; display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 20px;
    }
    .limit .clear:disabled { opacity: 0.4; cursor: default; }
    .sun-help { display: block; margin-bottom: 8px; color: var(--secondary-text-color); }
    small.bad { color: var(--wp-danger-text); display: block; margin-bottom: 8px; }
    .random { display: grid; gap: 6px; margin: 8px 0; }
    .random label { display: flex; align-items: center; gap: 8px; min-height: 44px; }
    .random input[type="checkbox"] { width: 20px; height: 20px; }
    .random input[type="number"] { width: 76px; min-height: 44px; box-sizing: border-box; }
    .random small { color: var(--secondary-text-color); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips + .time { margin-top: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 0.9375rem;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    .day.on { border-color: transparent; background-clip: padding-box; box-shadow: inset 0 0 0 1px var(--wp-primary-fill); }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 1rem; font-weight: 500; margin-right: 8px; }
    /* 7 x 44 px = 308 px at 360 px: the row borrows 8 px of the editor's side padding (it wraps on narrower screens); the pill is drawn inside a transparent 2 px border so the touch target stays 44 px wide */
    .days { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 0; margin: 0 -8px 8px; }
    .day {
      min-height: 48px; min-width: 44px; padding: 0; border-radius: 14px; border: 2px solid transparent; background-clip: padding-box;
      box-shadow: inset 0 0 0 1px var(--divider-color);
      background-color: transparent; color: var(--primary-text-color); font: inherit; font-size: 0.875rem; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
  `];
	}
};
D([T({ attribute: !1 })], J.prototype, "hass", void 0), D([T({ attribute: !1 })], J.prototype, "data", void 0), D([T({ attribute: !1 })], J.prototype, "program", void 0), D([T({ attribute: !1 })], J.prototype, "group", void 0), D([T({ attribute: !1 })], J.prototype, "entityIds", void 0), D([T({ type: Boolean })], J.prototype, "disabled", void 0), D([T({ attribute: !1 })], J.prototype, "device", void 0), D([T({ attribute: !1 })], J.prototype, "also", void 0), D([T({ type: Number })], J.prototype, "dayOnly", void 0), D([E()], J.prototype, "_more", void 0), D([E()], J.prototype, "_advOpen", void 0), D([E()], J.prototype, "_last", void 0), D([E()], J.prototype, "_typed", void 0), D([E()], J.prototype, "_limitOpen", void 0), J = D([w("wp-slot-form")], J);
// src/components/holiday-section.ts
var as = (e, t) => !!t.end && wn(e, t.end) <= wn(e, t.start), Y = class extends S {
	constructor(...e) {
		super(...e), this.source = null, this.canEdit = !1, this._open = !1, this._error = "", this._busy = !1, this._editing = null, this._group = null;
	}
	get _lang() {
		return $r(this.hass);
	}
	get _shown() {
		return this.source ?? this.profile;
	}
	get _readOnly() {
		return !this.canEdit || this.source !== null;
	}
	async _write(e) {
		if (this._busy) return !1;
		this._busy = !0;
		try {
			let t = await this.hass.callWS({
				type: "weekly_planner/program/holiday",
				program_id: this.program.id,
				profile_id: this.profile.id,
				holiday: e,
				revision: this.program.revision
			});
			return this._error = "", t?.program && this.dispatchEvent(new CustomEvent("holiday-saved", {
				detail: t.program,
				bubbles: !0,
				composed: !0
			})), !0;
		} catch (e) {
			return this._error = Dt(this._lang, e), !1;
		} finally {
			this._busy = !1;
		}
	}
	async _choose(e) {
		if (!(e === gn(this._shown) || this._readOnly)) {
			if (this._editing = null, this._group = null, e === "none") {
				if (!await ci(this, k(this._lang, "holiday_clear"), k(this._lang, "holiday_clear_yes"), k(this._lang, "no"))) return;
				await this._write(null);
			} else await this._write(e === "copy" ? { copy: 0 } : { day: [] });
		}
	}
	_own() {
		return _n(this.profile);
	}
	_edit(e) {
		this._editing = e.id, this._group = {
			slot: structuredClone(e),
			days: [0],
			ids: { 0: e.id }
		};
	}
	_add() {
		this._editing = "new", this._group = Ri(this.data.labels[0]?.id ?? "", [0]);
	}
	async _save() {
		let e = this._group;
		if (!e) return;
		let t = e.slot, n = this._own(), r = n.some((e) => e.id === t.id) ? n.map((e) => e.id === t.id ? t : e) : [...n, t];
		await this._write({ day: r }) && (this._editing = null, this._group = null);
	}
	async _delete(e) {
		await this._write({ day: this._own().filter((t) => t.id !== e.id) });
	}
	_row(e) {
		let t = this._lang, n = z(this.data, e.label), r = n ? B(this.hass, n) : e.label, i = `${_i(t, e.start)}${e.end ? `–${_i(t, e.end)}` : ""}`;
		return y`<li class="hrow">
      <button class="open" ?disabled=${this._readOnly || this._busy} @click=${() => this._edit(e)}>
        <span class="dot" style="background:${n?.color ?? "transparent"}" aria-hidden="true"></span><span class="txt">${i} · ${r}</span></button>
      <button class="del" ?disabled=${this._readOnly || this._busy} aria-label=${`${k(t, "delete")} ${i}`} title=${k(t, "delete")}
        @click=${() => void this._delete(e)}><ha-icon icon="mdi:delete-outline"></ha-icon></button></li>`;
	}
	_ownDay() {
		let e = this._lang, t = this._shown.holiday && "day" in this._shown.holiday ? this._shown.holiday.day : [], n = this.program.entities.map((e) => e.entity_id), r = this._group ? y`<div class="form">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this.program} .group=${this._group} .entityIds=${n}
        .device=${n[0] ?? ""} ?disabled=${this._busy}
        @group-change=${(e) => {
			e.stopPropagation(), this._group = e.detail, this._error = "";
		}}></wp-slot-form>
      ${as(this.hass, this._group.slot) ? y`<p class="warn" role="status">${k(e, "holiday_midnight")}</p>` : x}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._busy} @click=${() => void this._save()}>${k(e, "save")}</button>
        <button class="btn" @click=${() => {
			this._editing = null, this._group = null;
		}}>${k(e, "cancel")}</button></div></div>` : x;
		return y`<ul class="hlist">${t.map((e) => this._row(e))}</ul>${r}
      ${!this._group && !this._readOnly ? y`<button class="btn add" ?disabled=${this._busy} @click=${() => this._add()}>
        <ha-icon icon="mdi:plus"></ha-icon>${k(e, "w_add")}</button>` : x}
      ${t.length === 0 && !this._group ? y`<p class="muted">${k(e, "w_none")}</p>` : x}`;
	}
	_summary(e) {
		let t = this._lang;
		return e ? "copy" in e ? k(t, "holiday_what_copy", { day: O(t).days[e.copy].toLocaleLowerCase(t) }) : k(t, "holiday_what_own") : k(t, "holiday_what_none");
	}
	render() {
		let e = this._lang, t = this._shown, n = gn(t), r = `holiday-${this.program.id}`, i = (e, t) => y`<label class="opt"><input type="radio" name=${r} .checked=${n === e}
      ?disabled=${this._readOnly || this._busy} @change=${() => void this._choose(e)} />${t}</label>`;
		return y`<section class="holiday">
      <button class="head" aria-expanded=${this._open} aria-controls=${r} @click=${() => {
			this._open = !this._open;
		}}>
        <span class="grow">${k(e, "holiday_title")}</span>
        <span class="state">${this._summary(t.holiday)}</span>
        <ha-icon icon=${this._open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>
      <div id=${r} role="group" aria-label=${k(e, "holiday_title")} ?hidden=${!this._open}>
        ${this.source ? y`<p class="muted">${k(e, "holiday_from", {
			source: this.source.name,
			what: this._summary(t.holiday)
		})}</p>` : x}
        <div class="opts" role="radiogroup" aria-label=${k(e, "holiday_title")}>
          ${i("none", k(e, "holiday_none"))}
          ${i("copy", k(e, "holiday_copy"))}
          ${n === "copy" ? y`<select class="day" aria-label=${k(e, "holiday_copy")} ?disabled=${this._readOnly || this._busy}
            @change=${(e) => void this._write({ copy: Number(e.target.value) })}>
            ${O(e).days.map((e, n) => y`<option value=${n} ?selected=${t.holiday && "copy" in t.holiday && t.holiday.copy === n}>${e}</option>`)}</select>` : x}
          ${i("own", k(e, "holiday_own"))}
        </div>
        ${n === "own" ? this._ownDay() : x}
        ${this._error ? y`<p class="err" role="alert">${this._error}</p>` : x}
      </div>
    </section>`;
	}
	static {
		this.styles = [ti, l`
    :host { display: block; }
    .holiday { border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 12px; margin: 0 0 12px; }
    .head { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; border: 0; background: none; color: var(--primary-text-color);
      font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
    .head .grow { flex: 1; }
    .head .state { font-weight: 400; font-size: 0.875rem; color: var(--secondary-text-color); }
    [hidden] { display: none; }
    .opts { display: flex; flex-direction: column; gap: 0; }
    .opt { display: flex; align-items: center; gap: 10px; min-height: 48px; cursor: pointer; }
    .day { min-height: 48px; margin: 0 0 8px 34px; max-width: calc(100% - 34px); }
    .hlist { list-style: none; margin: 8px 0; padding: 0; }
    .hrow { display: flex; align-items: center; gap: 4px; border-top: 1px solid var(--divider-color); }
    .hrow .open { flex: 1; display: flex; align-items: center; gap: 8px; min-height: 48px; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
    .hrow .del { flex: none; width: 48px; height: 48px; border: 0; background: none; color: var(--secondary-text-color); cursor: pointer; }
    .dot { flex: none; width: 14px; height: 14px; border-radius: 7px; box-shadow: 0 0 0 1px var(--divider-color); }
    .warn, .err, .muted { margin: 8px 0; font-size: 0.875rem; }
    .err { color: var(--wp-danger-text); }
    .muted { color: var(--secondary-text-color); }
    .btns { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .add { margin: 4px 0 12px; }
  `];
	}
};
D([T({ attribute: !1 })], Y.prototype, "hass", void 0), D([T({ attribute: !1 })], Y.prototype, "data", void 0), D([T({ attribute: !1 })], Y.prototype, "program", void 0), D([T({ attribute: !1 })], Y.prototype, "profile", void 0), D([T({ attribute: !1 })], Y.prototype, "source", void 0), D([T({ type: Boolean })], Y.prototype, "canEdit", void 0), D([E()], Y.prototype, "_open", void 0), D([E()], Y.prototype, "_error", void 0), D([E()], Y.prototype, "_busy", void 0), D([E()], Y.prototype, "_editing", void 0), D([E()], Y.prototype, "_group", void 0), Y = D([w("wp-holiday")], Y);
// src/components/schedule-dialog.ts
var os = (e, t) => e.some((e) => e.id === t.id) ? e.map((e) => e.id === t.id ? t : e) : [...e, t], ss = (e) => e.kind === "device" ? `d:${e.entityId}` : `p:${e.programId}`, cs = 7, X = class extends S {
	constructor(...e) {
		super(...e), this.chart = !0, this._viewMode = null, this._copyOpen = !1, this._optsOpen = !1, this._editProfileId = null, this._editMode = null, this.day = null, this.create = !1, this._chartContext = null, this._chartProgram = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._dropBusy = !1, this._focus = null, this._note = "", this._origin = null, this._overrides = [], this._saved = {}, this._draft = null, this._restLabel = null, this._labelDraft = null, this._pickerKey = 0, this._fresh = /* @__PURE__ */ new Set(), this._programId = "", this._error = "", this._saving = !1, this._toggling = !1, this._offset = 0, this._resp = null, this._pick = "", this._who = null, this._shared = !1, this._token = 0, this._loaded = "", this._include = (e) => {
			let t = this._eid;
			if (!t) return !0;
			if (!kn(e, t)) return !1;
			let n = z(this.data, e.label), r = this._programs.find((e) => e.id === this._programId) ?? this._programs[0];
			return !n?.action || !r || !!Ur(this.hass, r, t, n, e);
		}, this._minutes = (e) => wn(this.hass, e);
	}
	_chartOwner() {
		let e = this._programs[0];
		return e && this._chartProgram?.id === e.id && this._chartProgram.revision > e.revision ? this._chartProgram : e;
	}
	_renderChartOptions() {
		let e = this._chartOwner();
		if (!this.chart || !e || !this._eid || this._modeOnly || this._open !== null) return x;
		let t = this._chartContext?.programId === e.id && this._chartContext.entityId === this._eid ? this._chartContext : null;
		return y`<wp-chart-options .hass=${this.hass} .data=${this.data} .program=${e} .entityId=${this._eid}
      .mainUnit=${t?.mainUnit ?? null} .histories=${t?.histories ?? {}}
      @chart-sources-saved=${(e) => {
			this._chartProgram = e.detail;
		}}></wp-chart-options>`;
	}
	get _lang() {
		return $r(this.hass);
	}
	get _tz() {
		return this.hass.config.time_zone;
	}
	get _programs() {
		let e = this.data.programs;
		return [...this.scope.kind === "device" ? e.filter((e) => e.entities.some((e) => e.entity_id === this.scope.entityId)) : e.filter((e) => e.id === this.scope.programId)].sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name));
	}
	_modes() {
		let e = this.data.mode;
		if (!e?.selector) return [];
		let t = e.options.map((e) => ({
			name: e,
			orphan: !1
		}));
		for (let e of this._programs) for (let n of e.profiles) t.some((e) => e.name === n.name) || t.push({
			name: n.name,
			orphan: !0
		});
		return t;
	}
	get _openMode() {
		let e = this.data.mode;
		return e?.selector ? this._viewMode !== null && this._modes().some((e) => e.name === this._viewMode) ? this._viewMode : e.active ?? e.default ?? e.options[0] ?? null : null;
	}
	_ownProfile(e) {
		let t = this._openMode;
		return t === null ? e.profiles[0] : e.profiles.find((e) => e.name === t);
	}
	_modeProfile(e) {
		let t = this._ownProfile(e);
		return t ? rr(e, t) : void 0;
	}
	_followOf(e) {
		let t = this._ownProfile(e);
		return t && rr(e, t) !== t ? t.follows ?? null : null;
	}
	get _modeOnly() {
		let e = this.data.mode;
		return !!e?.selector && this._openMode !== null && this._openMode !== e.active;
	}
	_editProfile(e) {
		if (this._editProfileId === null) return;
		let t = e.profiles.find((e) => e.id === this._editProfileId);
		return t || this._editMode === null ? t : e.profiles.find((e) => e.name === this._editMode) ?? {
			id: this._editProfileId,
			name: this._editMode,
			days: [
				[],
				[],
				[],
				[],
				[],
				[],
				[]
			]
		};
	}
	get _entities() {
		if (this.scope.kind === "device") return [this.scope.entityId];
		let e = this._programs[0];
		return e ? e.entities.map((e) => e.entity_id) : [];
	}
	get _eid() {
		let e = this._entities;
		if (this._pick && e.includes(this._pick)) return this._pick;
		let t = this.scope?.entityId;
		return t && e.includes(t) ? t : e[0] ?? "";
	}
	_devices(e = this._programs.find((e) => e.id === this._programId) ?? this._programs[0]) {
		return e ? U(e) : [];
	}
	get _slots() {
		if (!this._resp) return null;
		let { today: e, previous: t } = Gn(this._resp[1], this._resp[0], this._eid);
		return [...t ?? [], ...e ?? []];
	}
	get _title() {
		return this.scope.kind === "device" ? L(this.hass, this.scope.entityId) : this._programs[0]?.name ?? "";
	}
	_rows() {
		let e = [];
		for (let t of this._programs) {
			let n = this._open && t.id === this._programId ? this._editProfile(t) : this._modeProfile(t);
			if (n) for (let r of Ti(n, this._include, this._minutes)) (this._focus === null || r.days.includes(this._focus)) && e.push({
				program: t,
				group: r,
				key: `${t.id}|${r.ids[r.days[0]]}`
			});
		}
		return e;
	}
	firstUpdated() {
		if (this._loadNames(), this.create && !this.day) {
			!this._rows().length && this._canEdit && this._add();
			return;
		}
		if (!this.day) return;
		let { weekday: e, offset: t } = this.day;
		t >= -14 && t <= cs && (this._offset = t), this._focus = e, !this._rows().length && this._canEdit && this._add([e]);
	}
	_loadNames() {
		yr(this.hass, Lr(this.data.labels)).then((e) => e && this.requestUpdate());
	}
	willUpdate(e) {
		e.has("scope") && e.get("scope") !== void 0 && (this._pick = "");
		let t = this._programs[0];
		if (this.chart && t && this.hass && !this._modeOnly) {
			let e = `${t.id}|${t.revision}|${this._modeProfile(t)?.id}|${this._date}|${this.data.holiday_today ? "off" : ""}`;
			e !== this._loaded && (this._loaded = e, this._loadPreview(t.id, t.revision, this._date, e, this._modeProfile(t)?.id));
		}
	}
	get _today() {
		return P(/* @__PURE__ */ new Date(), this._tz);
	}
	get _date() {
		return Nt(this._today, this._offset);
	}
	async _loadPreview(e, t, n, r, i) {
		let a = ++this._token;
		try {
			let o = await Promise.all([Nt(n, -1), n].map((n) => Un(this.hass, e, t, n, i)));
			a === this._token && r === this._loaded && (this._resp = [o[0], o[1]]);
		} catch {
			a === this._token && (this._resp = null);
		}
	}
	_go(e) {
		let t = this._offset + e;
		t < -14 || t > cs || (this._resp = null, this._offset = t);
	}
	get _canEdit() {
		return this.data.can_edit && !this.data.read_only;
	}
	_expand(e, t, n, r = {}) {
		this._editMode = this._openMode, this._editProfileId = this._modeProfile(t)?.id ?? R(), this._open = e, this._programId = t.id, this._group = n ? structuredClone(n) : null, this._restLabel = r.restLabel ?? null, this._rest = r.rest ?? null, this._dayOnly = r.dayOnly ?? null, this._openId = r.openId ?? null, this._base = null, this._origin = r.origin ? structuredClone(r.origin) : null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._who = null, this._shared = !!(n && r.openId && this._eid && da(n.slot, U(t))), this._draft = structuredClone(t), this._error = "", this._note = "", this.updateComplete.then(() => requestAnimationFrame(() => {
			this._revealEditor(), this._focusEditor();
		}));
	}
	_focusEditor() {
		let e = this.renderRoot.querySelector(".editor");
		e && (dn(e)[0] ?? e).focus({ preventScroll: !0 });
	}
	_focusRow(e) {
		this.updateComplete.then(() => requestAnimationFrame(() => {
			let t = this.renderRoot;
			((e && e !== "new" ? Array.from(t.querySelectorAll("button.row[data-key]")).find((t) => t.dataset.key === e) : void 0) ?? t.querySelector("button.row.add"))?.focus({ preventScroll: !0 });
		}));
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
		this._followOf(t) ? this._askFollow(t, () => this._openRowNow(e, t, n)) : this._openRowNow(e, t, n);
	}
	_openRowNow(e, t, n) {
		let r = Di(n) ?? null;
		if (this._focus !== null && n.days.includes(this._focus)) {
			let { draft: i, rest: a } = ji(n, this._focus);
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
	_onEscape(e) {
		this._open !== null && (e.preventDefault(), this._cancel());
	}
	_cancel() {
		let e = this._open;
		e !== null && this._focusRow(e), this._editProfileId = null, this._editMode = null, this._open = null, this._group = null, this._dayOnly = null, this._rest = null, this._openId = null, this._base = null, this._origin = null, this._overrides = [], this._labelDraft = null, this._dropBusy = !1, this._who = null, this._shared = !1, this._draft = null, this._restLabel = null, this._error = "";
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
	_add(e = this._focus === null ? xi : [this._focus]) {
		let t = this._programs[0];
		t && this._followOf(t) ? this._askFollow(t, () => this._addNow(e)) : this._addNow(e);
	}
	_addNow(e) {
		let t = this._programs[0], n = this._eid;
		if (!t || !n) return;
		let r = Vr(this.hass, this.data, [n], t)[0], i = e.length === 1 ? e[0] : null, a = i === null ? void 0 : Li(this._modeProfile(t)?.days[i] ?? [], this._minutes, n), o = Ri(r?.id ?? "", e, a), s = Mn([n], U(t));
		s && (o.slot.entities = s), this._expand("new", t, o, { dayOnly: i }), this._dropBusy = i === null;
	}
	_duplicate() {
		let e = this._programs.find((e) => e.id === this._programId), t = this._group;
		if (!e || !t) return;
		let n = this._problem(e);
		if (n) {
			this._error = n;
			return;
		}
		let { start: r, end: i } = t.slot, a = wn(this.hass, r), o = i ? Math.max(15, wn(this.hass, i) - a) : 60, s = {
			openId: this._openId,
			rest: this._rest,
			draft: structuredClone(t)
		}, c = this._dayOnly, l = Ri(t.slot.label, t.days);
		l.slot = {
			...structuredClone(t.slot),
			id: l.slot.id,
			start: Tn(this.hass, r, o),
			end: i ? Tn(this.hass, i, o) : null
		}, l.slot.end && wn(this.hass, l.slot.start) >= wn(this.hass, l.slot.end) && (l.slot.start = { time: Pt(Math.max(0, j - o)) }, l.slot.end = { time: Pt(j) });
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
			return t?.code === "conflict" ? "conflict" : (this._error = t?.code === "unauthorized" ? k(this._lang, "err_unauthorized") : t?.message?.includes("unknown_label") ? k(this._lang, "err_label") : t?.message?.includes("earliest_after_latest") ? k(this._lang, "err_sun_bounds") : t?.message?.includes("random_window_too_short") ? k(this._lang, "random_too_short") : Tt(this._lang, t?.message, (e) => L(this.hass, e)) ? Tt(this._lang, t?.message, (e) => L(this.hass, e)) : t?.message?.includes("overlapping_slots") ? k(this._lang, "w_err_overlap") : /offset|invalid_random_minutes|at most|at least|out of range|invalid_time|invalid_clock/i.test(t?.message ?? "") ? k(this._lang, "err_time_range") : k(this._lang, "ss_err_save"), "error");
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
		return this._error = k(this._lang, "ss_err_save"), !1;
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
		let t = this._lang, n = Pi(e);
		if (!n) return k(t, "w_err_overlap");
		let r = (e) => {
			let n = z(this.data, e.label);
			return n ? B(this.hass, n) : k(t, "w_err_overlap_slot");
		}, i = (e) => `${_i(t, e.start)}${e.end ? ` → ${_i(t, e.end)}` : ""}`;
		return k(t, "w_err_overlap_detail", {
			day: O(t).days_short[n.day],
			a: r(n.a),
			a_time: i(n.a),
			b: r(n.b),
			b_time: i(n.b)
		});
	}
	_problem(e) {
		let t = this._lang, n = this._group;
		return n ? n.days.length ? En(n.slot.start) || En(n.slot.end) ? k(t, "err_sun_bounds") : n.slot.end && JSON.stringify(n.slot.start) === JSON.stringify(n.slot.end) ? k(t, "w_err_same") : !z(this.data, n.slot.label) && !this._fresh.has(n.slot.label) ? k(t, "err_action") : this._shared && this._who === null && this._contentChanged() ? k(t, "who_pick") : "" : k(t, "err_days") : "";
	}
	_contentChanged() {
		let e = this._origin, t = this._group;
		if (!e || !t) return !1;
		let n = (e) => wi({
			...e,
			entities: void 0,
			seed: void 0
		}), r = [...this._dayOnly === null ? e.days : [this._dayOnly]].sort();
		return n(t.slot) !== n(e.slot) || JSON.stringify([...t.days].sort()) !== JSON.stringify(r);
	}
	_pickWho(e) {
		this._who = e, this._error = "";
		let t = this._group, n = this._origin;
		if (e === "one" && t && n) {
			let { entities: e, ...r } = t.slot;
			this._group = {
				...t,
				slot: n.slot.entities ? {
					...r,
					entities: [...n.slot.entities]
				} : r
			};
		}
	}
	_patch(e) {
		let t = {
			start: e.start,
			end: e.end ?? null,
			label: e.label
		};
		return e.conditions !== void 0 && (t.conditions = e.conditions), e.color !== void 0 && (t.color = e.color), t;
	}
	_forDevice(e, t, n, r) {
		let i = this._eid, a = this._dayOnly === null ? t.days : [this._dayOnly], o = n?.days ?? [];
		for (let s of /* @__PURE__ */ new Set([...a, ...o])) {
			let c = t.ids[s];
			if (c) {
				if (!a.includes(s) && !o.includes(s)) continue;
				let t = ba(e, c, i, n && o.includes(s) ? this._patch(n.slot) : null, { devices: r });
				if (!t) return null;
				e = t.days;
			} else if (n && o.includes(s)) {
				let { seed: t, ...r } = structuredClone(n.slot);
				e = e.map((e, t) => t === s ? [...e, {
					...r,
					id: R(),
					entities: [i]
				}] : e);
			}
		}
		return e.map((e) => [...e].sort((e, t) => this._minutes(e.start) - this._minutes(t.start)));
	}
	_checkOrigin(e, t) {
		let n = this._origin;
		if (!n || !this._openId) return "ok";
		let r = ki(e, this._include, this._minutes, this._openId), i = Ai(r, n);
		if (i === "same") return "ok";
		if (i === "days" && r && this._dayOnly !== null && r.days.includes(this._dayOnly)) return this._rest = ji(r, this._dayOnly).rest, this._origin = structuredClone(r), "ok";
		let a = k(this._lang, "ss_changed");
		if (r) {
			let e = this._open ?? `${t.id}|${Di(r)}`, n = this._editProfileId;
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
			return this._error = e?.code === "unauthorized" ? k(this._lang, "err_unauthorized") : k(this._lang, "lb_err_save"), !1;
		} finally {
			this._saving = !1;
		}
	}
	async _saveRow() {
		let e = this._live(this._programId);
		if (!e || !this._editProfile(e)) {
			this._error = k(this._lang, "ss_changed");
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
		if (this._shared && this._who === "one" && this._contentChanged()) {
			let e = !1;
			await this._commit(n.id, (n) => {
				let r = this._editProfile(n);
				if (!r) return { error: k(this._lang, "ss_changed") };
				if (this._checkOrigin(r, n) === "changed" || !this._origin) return e = !0, { changed: !0 };
				let i = this._forDevice(r.days, this._origin, t, U(n));
				if (!i) return { error: k(this._lang, "ss_changed") };
				let a = {
					...r,
					days: i
				};
				return Pi(a) ? { error: this._overlapText(a) } : { program: {
					...n,
					entities: this._withOverrides(n),
					profiles: os(n.profiles, a)
				} };
			}) && !e && this._cancel();
			return;
		}
		let i = this._include, a = [], o = !1;
		await this._commit(n.id, (e) => {
			let n = this._editProfile(e);
			if (!n) return { error: k(this._lang, "ss_changed") };
			if (this._checkOrigin(n, e) === "changed") return o = !0, { changed: !0 };
			let r = n;
			this._base && (r = Ni(r, i, this._minutes, this._base));
			let s = t;
			if (a = [], this._dropBusy) {
				let { free: e, busy: n } = Fi(r, i, this._minutes, t.slot, t.days);
				if (!e.length) return { error: this._overlapText(Ni(r, i, this._minutes, {
					openId: this._openId,
					rest: this._rest,
					draft: t
				})) };
				s = {
					...t,
					days: e
				}, a = n;
			}
			let c = Ni(r, i, this._minutes, {
				openId: this._openId,
				rest: this._rest,
				draft: s
			}), l = {
				...c,
				days: c.days.map((t) => ya(t, U(e)).day)
			};
			return Pi(l) ? { error: this._overlapText(l) } : { program: {
				...e,
				entities: this._withOverrides(e),
				profiles: os(e.profiles, l)
			} };
		}) && !o && (this._cancel(), a.length && (this._note = k(this._lang, "w_dropped", { days: a.map((e) => O(this._lang).days_short[e]).join(" ") })));
	}
	async _deleteRow() {
		if (!this._canEdit || this._saving) return;
		if (this._open === "new") {
			this._cancel();
			return;
		}
		let e = this._live(this._programId);
		if (!e || !this._openId) return;
		if (this._shared && this._who === null) {
			this._error = k(this._lang, "who_pick");
			return;
		}
		let t = this._group ? this._rowText(this._group).text : "";
		if (!await ci(this, `${k(this._lang, "w_confirm_slot")}${t ? ` ${t}` : ""}`, k(this._lang, "slot_delete_yes"), k(this._lang, "slot_delete_no"))) return;
		let n = this._shared && this._who === "one";
		await this._commit(e.id, (e) => {
			let t = this._editProfile(e);
			if (!t) return { error: k(this._lang, "ss_changed") };
			if (this._checkOrigin(t, e) === "changed") return { changed: !0 };
			if (n && this._origin) {
				let n = this._forDevice(t.days, this._origin, null, U(e));
				return n ? { program: {
					...e,
					profiles: os(e.profiles, {
						...t,
						days: n
					})
				} } : { error: k(this._lang, "ss_changed") };
			}
			let r = Ni(t, this._include, this._minutes, {
				openId: this._openId,
				rest: this._rest,
				draft: null
			});
			return { program: {
				...e,
				profiles: os(e.profiles, r)
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
	_stateText() {
		if (this._enabled) return k(this._lang, "running");
		let e = Ut(this._programs);
		return e ? k(this._lang, "paused_until", { when: Ht(e, this._tz, this._lang) }) : k(this._lang, "stopped");
	}
	async _setEnabled(e, t) {
		if (this._toggling) t.checked = this._enabled;
		else {
			this._toggling = !0;
			try {
				let n = e ? "none" : await pi(this, this._title);
				if (n === null) {
					t.checked = !0;
					return;
				}
				for (let t of this._programs) typeof n == "number" ? await this.hass.callWS({
					type: "weekly_planner/program/pause",
					program_id: t.id,
					hours: n
				}) : await this.hass.callWS({
					type: "weekly_planner/program/set_enabled",
					program_id: t.id,
					enabled: e
				});
			} catch (e) {
				this._error = Dt(this._lang, e);
			} finally {
				this._toggling = !1, t.checked = this._enabled, this.updateComplete.then(() => {
					t.isConnected && t.focus({ preventScroll: !0 });
				});
			}
		}
	}
	async _deleteAll() {
		let e = this._programs[0];
		if (this.scope.kind === "program" && e && e.entities.length > 1 && this._eid) {
			let t = this._eid;
			if (!await ci(this, k(this._lang, "confirm_delete_device", { name: L(this.hass, t) }), k(this._lang, "slot_delete_yes"), k(this._lang, "slot_delete_no"))) return;
			await this._commit(e.id, (e) => ({ program: xa(e, t) })) && this._closeDialog();
		} else if (await ci(this, k(this._lang, "confirm_delete_schedule", { name: this._title }), k(this._lang, "slot_delete_yes"), k(this._lang, "slot_delete_no"))) try {
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
			this._error = Dt(this._lang, e);
		}
	}
	_openHistory(e) {
		this._closeDialog(), window.history.pushState(null, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
	}
	_closeDialog() {
		this.renderRoot.querySelector("wp-dialog")?.close();
	}
	_when(e) {
		let t = this._lang, n = _i(t, e.start);
		return e.end ? `${n}–${_i(t, e.end)}` : n;
	}
	_rowText(e, t) {
		let n = this._lang, r = z(this.data, e.slot.label), i = Si(n, O(n).days_short, e.days), a = t ? jn(e.slot, U(t)).filter((e) => e !== this._eid) : [];
		return {
			text: [r ? B(this.hass, r) : "", this._when(e.slot)].filter(Boolean).join(" · "),
			days: i,
			color: r?.color ?? "var(--disabled-text-color)",
			also: a.length ? k(n, "also_short", { names: a.map((e) => L(this.hass, e)).join(", ") }) : ""
		};
	}
	_renderRow(e) {
		let { program: t, group: n, key: r } = e;
		if (this._open === r && this._group) return this._renderEditor(t, r);
		let { text: i, days: a, color: o, also: s } = this._rowText(n, t);
		return y`<button class="row" data-key=${r} aria-expanded="false" @click=${() => this._openRow(r, t, n)}>
      <span class="dot" style="background:${o}"></span>
      <span class="txt"><span class="l1">${i}</span>${this._focus === null ? y`<span class="l2">${a}</span>` : x}${s ? y`<small>${s}</small>` : x}${this._programs.length > 1 ? y`<small>${t.name}</small>` : x}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
	}
	_whoAll(e, t) {
		if (e >= t.length) return k(this._lang, "who_all", { n: String(e) });
		let n = this._origin ? jn(this._origin.slot, t).filter((e) => e !== this._eid) : [];
		return k(this._lang, "who_some", {
			me: L(this.hass, this._eid),
			names: n.map((e) => L(this.hass, e)).join(", ")
		});
	}
	_renderEditor(e, t) {
		let n = this._lang, r = t === "new", i = this._devices(e), a = this._origin ? jn(this._origin.slot, i).length : i.length;
		return y`<div class="editor">
      ${ht(this._pickerKey, y`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? e} .group=${this._group} .entityIds=${[this._eid]}
        .device=${this._eid} .also=${!this._shared}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(e) => {
			e.stopPropagation(), this._labelDraft = e.detail, this._error = "";
		}}
        @group-change=${(e) => {
			e.stopPropagation(), this._group = e.detail, this._error = "";
		}}></wp-slot-form>`)}
      ${this._shared && !r ? y`<div class="who" role="radiogroup" aria-label=${k(n, "who_title")}>
        <span>${k(n, "who_title")}</span>
        <div class="seg">
          <button role="radio" aria-checked=${this._who === "one"} class=${this._who === "one" ? "on" : ""} ?disabled=${!this._canEdit}
            @click=${() => this._pickWho("one")}><ha-icon icon="mdi:numeric-1-circle-outline"></ha-icon>${k(n, "who_one", { name: L(this.hass, this._eid) })}</button>
          <button role="radio" aria-checked=${this._who === "all"} class=${this._who === "all" ? "on" : ""} ?disabled=${!this._canEdit}
            @click=${() => this._pickWho("all")}><ha-icon icon="mdi:select-all"></ha-icon>${this._whoAll(a, i)}</button>
        </div></div>` : x}
      ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${k(n, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${k(n, "cancel")}</button>
      </div>
      ${r || this._labelDraft ? x : y`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${k(n, "duplicate")}</button>`}
      <button class="btn danger-line alone" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${k(n, "delete")}</button>
    </div>`;
	}
	_renderRest() {
		let e = this._lang, t = this._programs[0];
		return t ? [this._eid].filter((e) => t.entities.some((t) => t.entity_id === e)).map((n) => {
			let r = t.entities.find((e) => e.entity_id === n), i = `rest:${n}`, a = k(e, "rest_of_time");
			if (this._open === i) return y`<div class="editor"><h4>${a}</h4>
          ${ht(this._pickerKey, y`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? t} .entityIds=${[n]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(e) => {
				e.stopPropagation(), this._labelDraft = e.detail, this._error = "";
			}}
            @label-change=${(e) => {
				e.stopPropagation(), this._restLabel = e.detail;
			}}></wp-label-picker>`)}
          ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(n)}>${k(e, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${k(e, "cancel")}</button>
          </div></div>`;
			let o = z(this.data, r.default_label);
			return y`<button class="row rest" data-key=${i} aria-expanded="false" @click=${() => this._expand(i, t, null, { restLabel: r.default_label ?? null })}>
        ${o ? y`<span class="dot" style="background:${o.color}"></span>` : y`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${a}${k(e, "colon")}<b>${o ? B(this.hass, o) : k(e, "rest_untouched")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
		}) : x;
	}
	_renderDevices() {
		return this._entities.length < 2 ? x : y`<div class="devices" role="radiogroup" aria-label=${k(this._lang, "device_label")}>
      ${this._entities.map((e) => {
			let t = e === this._eid;
			return y`<button class="devchip ${t ? "on" : ""}" role="radio" aria-checked=${t} ?disabled=${this._open !== null}
          @click=${() => {
				this._pick = e, this._error = "", this._note = "";
			}}>
          <ha-state-icon .hass=${this.hass} .stateObj=${this.hass.states[e]}></ha-state-icon><span>${L(this.hass, e)}</span></button>`;
		})}
    </div>`;
	}
	async _askFollow(e, t) {
		let n = this._followOf(e), r = this._openMode;
		if (!n || r === null) {
			t();
			return;
		}
		let i = this._lang, a = await ui(this, k(i, "mode_follows_edit_ask", {
			mode: r,
			source: n
		}), [{
			id: "source",
			label: k(i, "mode_follows_edit", { source: n })
		}, {
			id: "stop",
			label: k(i, "mode_follows_stop")
		}]);
		a === "source" ? t() : a === "stop" && await this._setFollow(e, r, null) && (this._note = k(i, "mode_follows_stopped", {
			mode: r,
			source: n
		}));
	}
	async _setFollow(e, t, n) {
		if (this._saving) return !1;
		this._saving = !0;
		try {
			let r = await this.hass.callWS({
				type: "weekly_planner/program/mode_follow",
				program_id: e.id,
				mode: t,
				follows: n
			});
			return r?.program && (this._saved[e.id] = r.program), this._error = "", !0;
		} catch (e) {
			return this._error = Dt(this._lang, e), !1;
		} finally {
			this._saving = !1;
		}
	}
	_followSources(e) {
		let t = this._openMode;
		return t === null || e.profiles.some((e) => e.follows === t) ? [] : this._modes().filter((n) => !n.orphan && n.name !== t && e.profiles.some((e) => e.name === n.name && !e.follows)).map((e) => e.name);
	}
	async _onFollowChange(e, t) {
		let n = t.target, r = this._openMode, i = this._ownProfile(e), a = i?.follows ?? "", o = n.value;
		if (r === null || o === a) return;
		let s = this._lang;
		o === "" ? await this._setFollow(e, r, null) ? this._note = k(s, "mode_follows_stopped", {
			mode: r,
			source: a
		}) : n.value = a : i?.days.some((e) => e.length) && !await ci(this, k(s, "mode_follows_confirm", {
			mode: r,
			source: o
		}), k(s, "mode_follows_yes", { source: o }), k(s, "no")) ? n.value = a : await this._setFollow(e, r, o) ? this._note = "" : n.value = a;
	}
	_renderHoliday() {
		return this.data.holiday_entity ? this._programs.map((e) => {
			let t = this._ownProfile(e);
			if (!t) return x;
			let n = this._live(e.id) ?? e, r = (e) => n.profiles.find((t) => t.id === e.id) ?? e, i = r(t), a = this._modeProfile(e);
			return y`<wp-holiday .hass=${this.hass} .data=${this.data} .program=${n} .profile=${i} .source=${a && a !== t ? r(a) : null} ?canEdit=${this._canEdit}
        @holiday-saved=${(t) => {
				t.stopPropagation(), this._saved[e.id] = t.detail, this.requestUpdate(), this.dispatchEvent(new CustomEvent("schedule-program-saved", {
					detail: t.detail,
					bubbles: !0,
					composed: !0
				}));
			}}></wp-holiday>`;
		}) : x;
	}
	_renderFollow() {
		let e = this._openMode;
		if (e === null || this._open !== null) return x;
		let t = this._lang, n = this._programs.length > 1;
		return this._programs.map((r) => {
			let i = this._ownProfile(r)?.follows ?? "", a = r.profiles.filter((t) => t.follows === e).map((e) => e.name), o = n ? ` (${r.name})` : "";
			if (a.length) return y`<p class="muted note">${k(t, "mode_followed_by", { modes: a.join(", ") })}${o}</p>`;
			if (!this._canEdit) return i ? y`<p class="muted note">${k(t, "mode_follows_info", { source: i })}${o}</p>` : x;
			let s = this._followSources(r);
			if (!s.length && !i) return x;
			let c = i && !s.includes(i) ? [i, ...s] : s;
			return y`<label class="follow"><span>${k(t, "mode_follows_label")}${o}</span>
        <select ?disabled=${this._saving} @change=${(e) => void this._onFollowChange(r, e)}>
          <option value="" ?selected=${i === ""}>${k(t, "mode_follows_none")}</option>
          ${c.map((e) => y`<option value=${e} ?selected=${e === i}>${e}</option>`)}
        </select></label>`;
		});
	}
	_renderModeOptions() {
		if (!this._modes().length || this._open !== null || this._openMode === null) return x;
		let e = this._lang, t = this._programs.map((e) => this._followOf(e)).find(Boolean);
		return y`<button class="row opts" aria-expanded=${this._optsOpen} @click=${() => {
			this._optsOpen = !this._optsOpen;
		}}>
        <ha-icon icon=${this._optsOpen ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        <span class="txt">${k(e, "advanced_options")}</span>
        ${t ? y`<small>${k(e, "mode_follows_short", { source: t })}</small>` : x}</button>
      ${this._optsOpen ? y`<div class="opts-body">${this._renderFollow()}${this._renderCopy()}</div>` : x}`;
	}
	_renderInactive() {
		let e = this._lang, t = this.data.mode, n = this._openMode ?? "", r = t.active ? k(e, "mode_not_active_why", {
			active: t.active,
			selector: L(this.hass, t.selector ?? ""),
			mode: n
		}) : k(e, "mode_not_active_why_none", {
			selector: L(this.hass, t.selector ?? ""),
			mode: n
		});
		return C("info", k(e, "mode_not_active"), r, { role: "status" });
	}
	_pickMode(e) {
		this._open === null && e !== this._openMode && (this._viewMode = e, this._copyOpen = !1, this._resp = null, this._error = "", this._note = "", this._focus = null);
	}
	_renderModes() {
		let e = this._modes();
		if (!e.length) return x;
		let t = this._lang, n = this._openMode;
		return y`<select class="modesel" aria-label=${k(t, "profile")} ?disabled=${this._open !== null}
        @change=${(e) => this._pickMode(e.target.value)}>
        ${e.map((e) => {
			let r = this._programs.map((t) => t.profiles.find((t) => t.name === e.name)?.follows).find(Boolean), i = [
				e.name === this.data.mode?.active ? k(t, "mode_active_badge") : "",
				e.orphan ? k(t, "mode_no_option") : "",
				r ? k(t, "mode_follows_short", { source: r }) : ""
			].filter(Boolean), a = i.length ? `${e.name} (${i.join(", ")})` : e.name;
			return y`<option value=${e.name} ?selected=${e.name === n}>${a}</option>`;
		})}
      </select>
      ${n !== null && n === this.data.mode?.active ? C("success", k(t, "mode_active_now"), void 0, {
			role: "status",
			icon: "mdi:play-circle-outline"
		}) : x}`;
	}
	_copySources() {
		let e = this._openMode;
		return e === null ? [] : this._modes().map((e) => e.name).filter((t) => t !== e && this._programs.some((e) => e.profiles.some((e) => e.name === t && e.days.some((e) => e.length))));
	}
	_renderCopy() {
		let e = this._copySources();
		if (this._open !== null || !e.length || !this._canEdit || this._programs.some((e) => this._followOf(e))) return x;
		let t = this._lang;
		return y`<button class="row copy" aria-expanded=${this._copyOpen} ?disabled=${this._saving}
        @click=${() => {
			this._copyOpen = !this._copyOpen;
		}}>
        <ha-icon icon="mdi:content-copy"></ha-icon><span class="txt">${k(t, "mode_copy_from")}</span></button>
      ${this._copyOpen ? y`<div class="copy-from" role="group" aria-label=${k(t, "mode_copy_pick")}>
        <span>${k(t, "mode_copy_pick")}</span>
        ${e.map((e) => y`<button class="modechip" ?disabled=${this._saving} @click=${() => void this._copyFrom(e)}>${e}</button>`)}
      </div>` : x}`;
	}
	async _copyFrom(e) {
		let t = this._openMode;
		if (t === null || t === e || !this._canEdit || this._saving) return;
		let n = this._lang;
		if (this._programs.some((e) => this._modeProfile(e)?.days.some((e) => e.length)) && !await ci(this, k(n, "mode_copy_confirm", {
			to: t,
			from: e
		}), k(n, "mode_copy_replace"), k(n, "no"))) return;
		let r = !0;
		for (let i of this._programs) i.profiles.some((t) => t.name === e) && (r = await this._commit(i.id, (r) => {
			let i = r.profiles.find((t) => t.name === e);
			if (!i) return { error: k(n, "ss_changed") };
			let a = r.profiles.find((e) => e.name === t);
			return { program: {
				...r,
				profiles: os(r.profiles, {
					id: a?.id ?? R(),
					name: t,
					days: i.days.map(cr)
				})
			} };
		}) && r);
		this._copyOpen = !1, this._resp = null, r && (this._error = "", this._note = k(n, "mode_copy_done", { from: e }));
	}
	_renderWeek() {
		let e = this._lang;
		return y`<section class="schematic" aria-label=${k(e, "week")}>
      ${[this._eid].map((t) => y`
        ${O(e).days_short.map((n, r) => {
			let i = [];
			for (let e of [...this._programs].reverse()) {
				let n = this._live(e.id) ?? e;
				if (!n.entities.some((e) => e.entity_id === t)) continue;
				let a = n.id === this._programId && this._open ? this._editProfile(n) : this._modeProfile(n);
				if (a) {
					n.id === this._programId && this._group && (this._base && (a = Ni(a, this._include, this._minutes, this._base)), a = Ni(a, this._include, this._minutes, {
						openId: this._openId,
						rest: this._rest,
						draft: this._group
					}));
					for (let e of [(r + 6) % 7, r]) for (let o of a.days[e]) {
						let a = z(this.data, o.label);
						if (!a || !Ur(this.hass, n, t, a, o)) continue;
						let s = this._minutes(o.start), c = o.end ? this._minutes(o.end) : null, l = c !== null && c < s && c < 720;
						e !== r && !l || c !== null && c <= s && !l || i.push({
							start: e === r ? s : 0,
							end: e === r ? l ? j : c ?? s + 10 : c,
							color: a.color,
							label: B(this.hass, a),
							marker: c === null,
							startSun: e === r ? Wt(o.start) : null,
							endSun: l && e === r ? null : Wt(o.end),
							startSpec: o.start,
							endSpec: o.end
						});
					}
				}
			}
			return y`<div class="schema-day"><span>${n}</span>
            <wp-day-bar lang=${e} notches ?show-hours=${r === 6} .spans=${i}></wp-day-bar>
          </div>`;
		})}
      `)}
    </section>`;
	}
	_renderChart() {
		let e = this._lang, t = this._chartOwner();
		if (!this.chart || !t || !this._eid || this._modeOnly) return x;
		let n = this._date, r = new Intl.DateTimeFormat(e, {
			timeZone: "UTC",
			weekday: "short",
			day: "numeric",
			month: "short"
		}).format(/* @__PURE__ */ new Date(`${n}T12:00:00Z`));
		return y`<section class="chart">
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -14} aria-label=${k(e, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? k(e, "today") : r}</span>
        <button class="ibtn" ?disabled=${this._offset >= cs} aria-label=${k(e, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${t} entity-id=${this._eid} date=${n}
        .slots=${this._slots} @chart-context=${(e) => {
			this._chartContext = e.detail;
		}} @open-history=${(e) => this._openHistory(e.detail)}></wp-chart>
    </section>`;
	}
	connectedCallback() {
		super.connectedCallback(), this._offNames = vr(() => this.requestUpdate());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._offNames?.();
	}
	render() {
		if (!this.hass || !this.data || !this.scope) return x;
		let e = this._lang;
		if (!this._programs.length) return y`<wp-dialog open heading=${this._title}><p class="muted">${k(e, "no_program")}</p></wp-dialog>`;
		let t = this._rows(), n = !t.length && this._focus === null && !this._modeOnly, r = this._modes().length > 0, i = (e, t, n) => r ? y`<fieldset class="box ${e}"><legend>${t}</legend>${n}</fieldset>` : n;
		return y`
      <wp-dialog open columns heading=${this._title} @escape=${(e) => this._onEscape(e)}>
        <div class="cols">
        <div class="params">
        ${this._open !== null || this._modeOnly ? x : y`<label class="switch">
          <span class="grow">${k(e, "schedule_on")}</span>
          <span class="state">${this._stateText()}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit || this._toggling}
            @change=${(e) => void this._setEnabled(e.target.checked, e.target)} />
          <span class="track"></span>
        </label>`}
        ${i("modebox", k(e, "profile"), y`${this._renderModes()}
          ${this._modeOnly ? this._renderInactive() : x}
          ${this._renderModeOptions()}
          <wp-mode-notice .hass=${this.hass} .data=${this.data}></wp-mode-notice>`)}
        ${this._canEdit ? x : y`${C("error", "", k(e, "read_only"), { role: "alert" })}`}
        ${this._error && !this._open ? y`${C("error", "", this._error, { role: "alert" })}` : x}
        ${i("schedbox", k(e, "schedules_legend"), y`
        ${this._renderDevices()}
        ${this._modeOnly ? x : y`<div class="rests">${this._renderRest()}</div>`}
        ${this._focus !== null && this._open === null ? y`<div class="focus">
          <button class="chip back" @click=${() => {
			this._focus = null, this._note = "";
		}}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${k(e, "w_whole_week")}</button>
          <h3>${O(e).days[this._focus]}</h3></div>` : x}
        ${this._note && this._open === null ? y`<p class="muted note">${this._note}</p>` : x}
        <div class="list">
          ${t.length ? t.map((e) => this._renderRow(e)) : this._open === "new" ? x : y`<p class="muted">${k(e, "w_none")}</p>`}
          ${this._group && (this._open === "new" || this._open !== null && !t.some((e) => e.key === this._open)) ? this._renderEditor(this._programs.find((e) => e.id === this._programId) ?? this._programs[0], this._open) : x}
          ${this._open === null ? y`<button class="row add ${n ? "first" : ""}" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${n ? k(e, "create_setting") : this._focus === null ? k(e, "w_add") : k(e, "w_add_day", { day: O(e).days[this._focus].toLocaleLowerCase(e) })}</span></button>` : x}
        </div>`)}
        </div>
        ${this._open === null && !this._modeOnly ? this._renderHoliday() : x}
        <div class="area-week">${this._renderWeek()}</div>
        <div class="area-chart">${this._open === null ? this._renderChart() : x}</div>
        <div class="area-options">${this._renderChartOptions()}</div>
        <div class="area-delete">${this._open !== null || this._modeOnly ? x : y`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${k(e, "delete_schedule")}</button>`}</div>
        </div>
      </wp-dialog>`;
	}
	static {
		this.styles = [ti, l`
    :host { display: contents; }
    /* One DOM order (the phone order of section 24.2 = keyboard order). From 768 px the same order is laid out in two
       columns by the grid alone: parameters (and Delete) on the left, the 7-day schematic then the day chart on the right. */
    .cols, .params { display: block; }
    @media (min-width: 768px) {
      .cols {
        display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 24px; row-gap: 0; align-items: start;
        grid-template-rows: auto auto 1fr auto;
        grid-template-areas: "params week" "params chart" "options chart" "delete chart";
      }
      .params { grid-area: params; min-width: 0; }
      .area-week { grid-area: week; min-width: 0; }
      .area-chart { grid-area: chart; min-width: 0; }
      .area-options { grid-area: options; min-width: 0; }
      .area-delete { grid-area: delete; min-width: 0; }
      .area-delete .btn.alone { margin-top: 0; }
      /* Hidden while a slot editor is open (nothing rendered): no empty grid cell. */
      .area-chart:empty, .area-options:empty, .area-delete:empty { display: none; }
    }
    .devices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .devchip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px; max-width: 100%; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem; cursor: pointer;
      --mdc-icon-size: 20px;
    }
    .devchip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .devchip.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
    .devchip:disabled:not(.on) { opacity: 0.5; cursor: default; }
    .who { margin-top: 8px; }
    .who > span { display: block; font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 6px; }
    .who .seg { display: flex; flex-wrap: wrap; gap: 8px; }
    .who button {
      flex: 1 1 200px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; padding: 4px 12px;
      text-align: left;
      border-radius: 24px; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit;
      font-size: 0.9375rem; cursor: pointer; --mdc-icon-size: 20px;
    }
    .who button.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
    fieldset.box { border: 1px solid var(--divider-color); border-radius: 12px; padding: 4px 12px 12px; margin: 0 0 12px; min-width: 0; }
    fieldset.box legend { padding: 0 6px; font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); }
    .modesel { display: block; margin: 0 0 10px; width: 100%; min-height: 48px; box-sizing: border-box; padding: 0 12px; border-radius: 24px; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 1rem; }
    .copy-from { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .row.opts { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; margin: 0 0 8px; padding: 0 12px; border-radius: 12px;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem; cursor: pointer; text-align: left; }
    .row.opts .txt { flex: 1; }
    .row.opts small { color: var(--secondary-text-color); font-size: 0.75rem; }
    .opts-body { margin: 0 0 12px; padding: 8px 0 0 12px; border-left: 3px solid var(--divider-color); }
    .modechip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; max-width: 100%; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem; cursor: pointer;
      --mdc-icon-size: 20px;
    }
    .modechip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .follow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 0.9375rem; }
    .follow select {
      min-height: 48px; max-width: 100%; padding: 0 12px; border-radius: 24px; font: inherit; font-size: 0.9375rem;
      border: 1px solid var(--wp-field-border); background: var(--card-background-color, transparent); color: var(--primary-text-color);
    }
    .follow select:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .modechip:disabled:not(.on) { opacity: 0.5; cursor: default; }
    .modechip:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .copy-from { align-items: center; margin: 0; }
    .copy-from > span { flex-basis: 100%; font-size: 0.875rem; color: var(--secondary-text-color); }
    .row.copy { border-style: dashed; color: var(--wp-primary-text); font-weight: 500; }
    .schematic { margin-bottom: 16px; }
    .schematic h4 { margin: 8px 0; }
    .schema-day { display: grid; grid-template-columns: ${e.label}px minmax(0, 1fr); gap: ${e.gap}px; align-items: center; min-height: 32px; }
    .schema-day > span { font-size: 0.75rem; color: var(--secondary-text-color); }
    .schema-day wp-day-bar { min-width: 0; }
    .list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests:empty { display: none; }
    .row {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; text-align: left;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 1rem;
      cursor: pointer; width: 100%; --mdc-icon-size: 22px;
    }
    .row .txt { flex: 1; min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
    .row .txt .l1, .row .txt .l2 { display: block; }
    .row .txt .l2 { color: var(--secondary-text-color); font-size: 0.875rem; }
    .row.rest .txt { font-size: 0.9375rem; }
    .row .txt small { display: block; color: var(--secondary-text-color); font-size: 0.75rem; }
    .row.add { border-style: dashed; color: var(--wp-primary-text); font-weight: 500; }
    .row.add.first:not(:disabled) { border-style: solid; background: var(--wp-primary-fill); color: #fff; }
    .row.rest { background: var(--secondary-background-color); }
    .row:disabled { opacity: 0.5; cursor: default; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .editor { border: 2px solid var(--wp-primary-text); border-radius: 12px; padding: 12px; }
    .editor h4 { margin: 0 0 8px; font-size: 0.9375rem; }
    .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .btns .btn { flex: 1 1 120px; }
    .btn.alone { width: 100%; margin-top: 32px; }
    .btn.dup { width: 100%; margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; --mdc-icon-size: 20px; }
    .editor { scroll-margin-top: 8px; }
    .btn.danger-line { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
    .btn.danger { background: var(--wp-danger-fill); border-color: var(--wp-danger-border); color: #fff; }
    .muted { color: var(--secondary-text-color); }
    .note { margin: 0 0 8px; font-size: 0.875rem; }
    .focus { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .focus h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .chip.back {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 0.9375rem;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chart { margin-top: 16px; }
    .chart .nav { display: flex; align-items: center; justify-content: space-between; font-size: 0.9375rem; font-weight: 500; }
    .chart select { margin-bottom: 4px; }
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-bottom: 8px; font-size: 1rem; }
    .switch .grow { flex: 0 0 auto; margin-right: auto; }
    .switch .state { flex: 0 1 auto; min-width: 0; text-align: right; overflow-wrap: anywhere; font-size: 0.875rem; color: var(--secondary-text-color); }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--wp-primary-fill); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `];
	}
};
D([T({ attribute: !1 })], X.prototype, "hass", void 0), D([T({ attribute: !1 })], X.prototype, "data", void 0), D([T({ attribute: !1 })], X.prototype, "scope", void 0), D([T({ type: Boolean })], X.prototype, "chart", void 0), D([E()], X.prototype, "_viewMode", void 0), D([E()], X.prototype, "_copyOpen", void 0), D([E()], X.prototype, "_optsOpen", void 0), D([T({ attribute: !1 })], X.prototype, "day", void 0), D([T({ type: Boolean })], X.prototype, "create", void 0), D([E()], X.prototype, "_chartContext", void 0), D([E()], X.prototype, "_chartProgram", void 0), D([E()], X.prototype, "_open", void 0), D([E()], X.prototype, "_group", void 0), D([E()], X.prototype, "_dayOnly", void 0), D([E()], X.prototype, "_focus", void 0), D([E()], X.prototype, "_note", void 0), D([E()], X.prototype, "_draft", void 0), D([E()], X.prototype, "_restLabel", void 0), D([E()], X.prototype, "_labelDraft", void 0), D([E()], X.prototype, "_pickerKey", void 0), D([E()], X.prototype, "_programId", void 0), D([E()], X.prototype, "_error", void 0), D([E()], X.prototype, "_saving", void 0), D([E()], X.prototype, "_toggling", void 0), D([E()], X.prototype, "_offset", void 0), D([E()], X.prototype, "_resp", void 0), D([E()], X.prototype, "_pick", void 0), D([E()], X.prototype, "_who", void 0), D([E()], X.prototype, "_shared", void 0), X = D([w("wp-schedule")], X);
// src/chart-state.ts
var ls = "weekly-planner:chart-choices", us = "weekly-planner:open-charts";
function ds() {
	let e = /* @__PURE__ */ new Map();
	try {
		let t = JSON.parse(localStorage.getItem(ls) ?? "null");
		if (t && typeof t == "object" && !Array.isArray(t)) {
			for (let [n, r] of Object.entries(t)) typeof r == "boolean" && e.set(n, r);
			return e;
		}
		let n = JSON.parse(localStorage.getItem(us) ?? "[]");
		if (Array.isArray(n)) for (let t of n) typeof t == "string" && e.set(t, !0);
	} catch {}
	return e;
}
function fs(e) {
	try {
		localStorage.setItem(ls, JSON.stringify(Object.fromEntries(e)));
	} catch {}
}
function ps(e) {
	let t = JSON.stringify([
		e.title ?? "",
		e.program ?? null,
		e.program === void 0 ? e.filter ?? null : null
	]), n = 5381;
	for (let e = 0; e < t.length; e++) n = (n * 33 ^ t.charCodeAt(e)) >>> 0;
	return n.toString(36);
}
var ms = (e, t, n) => `${e}|${t}|${n}`;
function hs(e, t, n) {
	return e.get(t) ?? !n;
}
function gs(e) {
	window.history.pushState(null, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: !1 } }));
}
// src/update.ts
var _s = "weekly_planner_reloaded_for";
function vs(e = import.meta.url) {
	try {
		return new URL(e).searchParams.get("v");
	} catch {
		return null;
	}
}
function ys(e, t, n) {
	return !!(e && t && e !== t && n !== t);
}
function bs(e, t) {
	if (!t) return !1;
	let n = null;
	try {
		n = sessionStorage.getItem(_s);
	} catch {}
	if (!ys(vs(), e, n)) return !1;
	try {
		sessionStorage.setItem(_s, e);
	} catch {}
	return location.reload(), !0;
}
// src/times-list.ts
var xs = (e) => e.marker ? e.start : e.end;
function Ss(e, t) {
	return e.marker ? !1 : e.startMs !== void 0 && t.startMs !== void 0 && e.endMs != null && (t.marker || t.endMs != null) ? e.startMs <= t.startMs && e.endMs >= (t.marker ? t.startMs : t.endMs) : e.start <= t.start && e.end >= xs(t);
}
function Cs(e, t) {
	return e.marker || t.nowMin === null ? !1 : t.nowMs != null && e.startMs !== void 0 && e.endMs != null ? e.startMs <= t.nowMs && t.nowMs < e.endMs : e.start <= t.nowMin && t.nowMin < e.end;
}
function ws(e, t) {
	let n = e.filter((e) => !e.ignored), r = (e) => `${e.slotId ?? ""}|${e.startMs ?? e.start}`, i = /* @__PURE__ */ new Set(), a = [];
	n.forEach((e, o) => {
		let s = r(e);
		if (i.has(s) || (i.add(s), n.slice(o + 1).some((t) => r(t) !== s && Ss(t, e)))) return;
		let c = e.spill ? "from_yesterday" : null, l = e.start;
		c && (l = e.startMs === void 0 ? Lt(e.startSpec) ?? 0 : N(new Date(e.startMs), t.tz));
		let u = null;
		if (!e.marker) {
			if (e.end >= 1440) {
				let n = e.endMs == null ? Lt(e.endSpec) : N(new Date(e.endMs), t.tz);
				u = n === 0 ? {
					day: "today",
					min: j
				} : {
					day: "tomorrow",
					min: n
				};
			} else u = {
				day: "today",
				min: e.end
			};
		}
		let d = e.startSpec;
		a.push({
			span: e,
			row: {
				key: s,
				startMin: l,
				startMs: e.startMs,
				endMs: e.endMs,
				labelId: e.labelId,
				color: e.color,
				label: e.label,
				slotId: e.slotId,
				carry: c,
				until: u,
				oneShot: !!e.marker,
				sun: c ? null : e.startSun ?? null,
				rule: !c && e.startSun && d && "sun" in d ? d : null,
				random: !!d?.random_minutes,
				now: !1,
				done: !1
			}
		});
	});
	let o = (e) => e.carry ? -1 : e.startMin;
	a.sort((e, t) => e.row.startMs !== void 0 && t.row.startMs !== void 0 && e.row.startMs !== t.row.startMs ? e.row.startMs - t.row.startMs : o(e.row) - o(t.row));
	let s = a.filter((e) => Cs(e.span, t)).pop();
	return s && (s.row.now = !0), Ds(a.map((e) => e.row)).map((e) => ({
		...e,
		done: Ts(e, t)
	}));
}
function Ts(e, t) {
	return t.nowMin === null || e.now || !e.until || e.until.day !== "today" || e.until.min === null ? !1 : t.nowMs != null && e.endMs != null ? e.endMs <= t.nowMs : e.until.min <= t.nowMin;
}
function Es(e, t) {
	return t.carry || e.oneShot || t.oneShot || !e.until || e.until.day !== "today" || e.until.min === null || e.labelId === void 0 || e.labelId !== t.labelId ? !1 : e.endMs != null && t.startMs !== void 0 ? e.endMs === t.startMs : e.until.min === t.startMin;
}
function Ds(e) {
	let t = [];
	for (let n of e) {
		let e = t[t.length - 1];
		e && Es(e, n) ? t[t.length - 1] = {
			...e,
			until: n.until,
			endMs: n.endMs,
			now: e.now || n.now
		} : t.push(n);
	}
	return t;
}
function Os(e, t) {
	if (!("sun" in t)) return "";
	let n = t.offset ?? 0, r = [
		"dawn",
		"sunrise",
		"sunset",
		"dusk"
	].includes(t.sun) ? t.sun : "sunset";
	if (!n) return k(e, `sun_at_${r}`);
	let i = k(e, `sun_np_${r}`);
	return k(e, n < 0 ? "sun_rule_before" : "sun_rule_after", {
		min: String(Math.abs(n)),
		sun: i
	});
}
// src/list-order.ts
var ks = [
	"type",
	"area",
	"name",
	"custom"
], As = "type", js = (e) => ks.includes(e) ? e : As, Ms = /* @__PURE__ */ new Map(), Ns = (e, t, n) => {
	let r = Ms.get(n);
	return r || Ms.set(n, r = new Intl.Collator(n)), r.compare(e, t);
}, Ps = (e) => (t, n) => Ns(t.name, n.name, e) || Ns(t.id, n.id), Fs = (e, t) => e.type ? t.typeLabel?.(e.type) || e.type : "", Is = (e) => (t, n) => t === n ? 0 : t === "" ? 1 : n === "" ? -1 : Ns(t, n, e);
function Ls(e, t) {
	let n = /* @__PURE__ */ new Map(), r = (e) => {
		let r = n.get(e.type);
		return r === void 0 && n.set(e.type, r = Fs(e, t)), r;
	}, i = Is(t.lang), a = Ps(t.lang);
	return [...e].sort((e, t) => i(r(e), r(t)) || Ns(e.type, t.type) || a(e, t));
}
function Rs(e, t, n = {}) {
	switch (t) {
		case "name": return [...e].sort(Ps(n.lang));
		case "area": return [...e].sort((e, t) => Is(n.lang)(e.area ?? "", t.area ?? "") || Ps(n.lang)(e, t));
		case "custom": {
			let t = new Map(e.map((e) => [e.id, e])), r = /* @__PURE__ */ new Set(), i = [];
			for (let e of n.order ?? []) {
				let n = t.get(e);
				n && !r.has(e) && (r.add(e), i.push(n));
			}
			return [...i, ...Ls(e.filter((e) => !r.has(e.id)), n)];
		}
		default: return Ls(e, n);
	}
}
function zs(e, t, n = {}) {
	let r = Rs(e, t, n);
	if (t !== "type" && t !== "area") return [{
		key: "",
		header: !1,
		items: r
	}];
	let i = [];
	for (let e of r) {
		let n = t === "type" ? e.type : e.area ?? "", r = i[i.length - 1];
		r && r.key === n ? r.items.push(e) : i.push({
			key: n,
			header: !0,
			items: [e]
		});
	}
	return i;
}
function Bs(e, t, n) {
	if (t < 0 || t >= e.length) return e;
	let r = [...e], [i] = r.splice(t, 1);
	return r.splice(Math.max(0, Math.min(r.length, n)), 0, i), r;
}
// src/config.ts
var Vs = [
	"bars",
	"radial",
	"radial_12h",
	"list",
	"times"
], Hs = (e) => typeof e == "string" ? e ? [e] : [] : Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : void 0;
function Us(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("Weekly Planner card: the configuration must be a YAML mapping.");
	let t = { ...e };
	for (let e of ["title", "program"]) t[e] !== void 0 && typeof t[e] != "string" && (typeof t[e] == "number" ? t[e] = String(t[e]) : delete t[e]);
	for (let e of ["show_chart", "chart_collapsed"]) t[e] !== void 0 && typeof t[e] != "boolean" && delete t[e];
	if (t.schedule_view !== void 0 && !Vs.includes(t.schedule_view) && delete t.schedule_view, t.sort !== void 0 && !ks.includes(t.sort) && delete t.sort, t.order !== void 0) {
		let e = Hs(t.order);
		e ? t.order = e : delete t.order;
	}
	if (t.filter !== void 0) {
		if (!t.filter || typeof t.filter != "object" || Array.isArray(t.filter)) delete t.filter;
		else {
			let e = { ...t.filter };
			for (let t of ["types", "programs"]) if (e[t] !== void 0) {
				let n = Hs(e[t]);
				n ? e[t] = n : delete e[t];
			}
			e.area !== void 0 && typeof e.area != "string" && delete e.area, t.filter = e;
		}
	}
	return t;
}
function Ws() {
	return {
		schedule_view: "bars",
		show_chart: !0,
		chart_collapsed: !0
	};
}
function Gs(e) {
	let t = {
		...Ws(),
		...e
	};
	return t.program === void 0 && t.filter === void 0 && (t.filter = {}), t;
}
// src/weekly-planner-card.ts
var Ks = 8e3, Z = class extends S {
	constructor(...e) {
		super(...e), this._dialog = null, this._preview = {}, this._now = /* @__PURE__ */ new Date(), this._week = /* @__PURE__ */ new Set(), this._expandedProgram = null, this._deviceOf = /* @__PURE__ */ new Map(), this._charts = ds(), this._edit = null, this._snack = null, this._ticks = 0, this._previewKey = "", this._toggling = /* @__PURE__ */ new Set(), this._domainKey = "", this._typeLabel = (e) => this.hass?.localize?.(`component.${e}.title`) || this._domainLocalize?.(`component.${e}.title`) || e, this._visible = () => {
			document.hidden || this._pollVersion();
		}, this._failedPreviewKey = "", this._previewRetryAt = 0, this._spanCache = /* @__PURE__ */ new Map(), this._spanInputs = [];
	}
	static getConfigElement() {
		return document.createElement("weekly-planner-card-editor");
	}
	static getStubConfig() {
		return {
			filter: {},
			...Ws()
		};
	}
	setConfig(e) {
		this._config = {
			show_chart: !0,
			...Us(e)
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
	_loadDomainNames() {
		if (!this._data || !this.hass?.loadBackendTranslation) return;
		let e = [...new Set(this._data.programs.map((e) => er(e.entities[0]?.entity_id ?? "")).filter(Boolean))].sort(), t = `${this._lang}|${e.join(",")}`;
		t !== this._domainKey && e.length && (this._domainKey = t, this.hass.loadBackendTranslation("title", e).then((e) => {
			t === this._domainKey && (this._domainLocalize = e, this.requestUpdate());
		}).catch(() => {
			t === this._domainKey && (this._domainKey = "");
		}));
	}
	_list(e) {
		let t = js(this._config.sort), n = e.map((e) => ({
			id: e.id,
			name: e.name,
			type: er(e.entities[0]?.entity_id ?? ""),
			area: e.area,
			p: e
		})), r = t === "type" || t === "area", i = (e) => this._config.schedule_view === "list" ? this._compactList(e) : this._bySchedule(e, r);
		return zs(n, t, {
			order: this._config.order,
			typeLabel: this._typeLabel,
			lang: this._lang
		}).map((e) => {
			let n = e.key === "" ? k(this._lang, "sort_other") : t === "type" ? this._typeLabel(e.key) : e.key;
			return y`${e.header ? y`<h2 class="group">${n}</h2>` : x}${i(e.items.map((e) => e.p))}`;
		});
	}
	connectedCallback() {
		super.connectedCallback(), this._offNames = vr(() => this.requestUpdate()), this.requestUpdate(), this._clock = window.setInterval(() => {
			this._now = /* @__PURE__ */ new Date(), this._loadPreviews(), this._checkVersion(), ++this._ticks % 5 == 0 && this._pollVersion();
		}, 6e4), document.addEventListener("visibilitychange", this._visible);
	}
	get _idle() {
		return !this._dialog && this._edit === null && !this._snack;
	}
	_checkVersion() {
		bs(this._data?.card_version, this._idle);
	}
	async _pollVersion() {
		try {
			bs((await this.hass.callWS({ type: "weekly_planner/get" })).card_version, this._idle);
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
		super.disconnectedCallback(), this._offNames?.(), window.clearTimeout(this._snackTimer), document.removeEventListener("visibilitychange", this._visible), this._unsub?.(), this._unsub = void 0, window.clearInterval(this._clock);
	}
	willUpdate() {
		jt(this.hass);
	}
	updated() {
		this._loadDomainNames(), this._idle && this._data?.card_version && this._checkVersion(), this.isConnected && this.hass && !this._unsub && (this._unsub = $n(this.hass, (e) => {
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
		return new Date(K(Nt(P(this._now, this._tz), e), this._tz).startMs + 432e5);
	}
	async _loadNames(e) {
		await yr(this.hass, Lr(e.labels)) && this.requestUpdate();
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
		].map((e) => P(this._dateAt(e), this._tz)), t = sr(this._data, this._config), n = `${e[0]}|${this._data.holiday_today ? "off" : ""}|${t.map((e) => `${e.id}:${e.revision}:${I(e, this._data).id}`).join(",")}`;
		if (n === this._previewKey || n === this._failedPreviewKey && Date.now() < this._previewRetryAt) return;
		this._previewKey = n;
		let r = !1, i = {};
		await Promise.all(e.flatMap((e) => t.map((t) => Un(this.hass, t.id, t.revision, e, I(t, this._data).id, !1).then((n) => {
			(i[e] ??= {})[t.id] = n;
		}).catch(() => {
			r = !0;
		})))), n === this._previewKey && (this._preview = i, r ? (this._previewKey = "", this._failedPreviewKey = n, this._previewRetryAt = Date.now() + 5e3) : this._failedPreviewKey = "");
	}
	_retryPreviews() {
		this._previewRetryAt = 0, this._failedPreviewKey = "", this.requestUpdate(), this._loadPreviews();
	}
	_spans(e, t, n = 0) {
		let r = [
			this._data,
			this._preview,
			this._now,
			this._config,
			_r()
		];
		r.some((e, t) => e !== this._spanInputs[t]) && (this._spanCache.clear(), this._spanInputs = r);
		let i = `${e}|${n}|${t.map((e) => e.id).join(",")}`, a = this._spanCache.get(i);
		return a || this._spanCache.set(i, a = this._computeSpans(e, t, n)), a;
	}
	_computeSpans(e, t, n) {
		let r = this._data, i = this._dateAt(n), a = It(i, this._tz), o = [];
		for (let s of [...t].reverse()) {
			if (!s.enabled) continue;
			let t = I(s, r), c = (t) => Ur(this.hass, s, e, z(r, t.label), t), l = (e, t, n, i = {}) => {
				let a = z(r, e.label);
				return {
					start: t,
					end: n,
					color: a.color,
					label: B(this.hass, a),
					labelId: a.id,
					slotId: e.id,
					startSun: Wt(e.start),
					endSun: e.end ? Wt(e.end) : null,
					startSpec: e.start,
					endSpec: e.end ?? null,
					marker: !e.end,
					...i
				};
			}, u = P(i, this._tz), { today: d, previous: f } = this._deviceDays(s.id, u, e), p = new Map(vn(t).map((e) => [e.id, e])), m = K(u, this._tz), ee = /* @__PURE__ */ new Set();
			for (let e of [...f ?? [], ...d ?? []]) {
				let t = p.get(e.slot_id);
				if (ee.has(`${e.slot_id}|${e.start}`) || (ee.add(`${e.slot_id}|${e.start}`), !t || !c(t))) continue;
				let n = Date.parse(e.start), r = e.end ? Date.parse(e.end) : null;
				if (n >= m.endMs || (r === null ? n < m.startMs : r <= m.startMs)) continue;
				let i = n < m.startMs, a = i ? 0 : N(e.start, this._tz), s = r === null ? null : r >= m.endMs ? j : N(e.end, this._tz);
				o.push(l(t, a, s === null ? Math.min(j, a + 10) : s, {
					spill: i,
					startSun: i ? null : Wt(t.start),
					ignored: e.ignored ?? null,
					sun: "sun" in t.start || !!(t.end && "sun" in t.end),
					startMs: n,
					endMs: r
				}));
			}
			if (!f) for (let { slot: e, end: n } of Rt(t.days[(a + 6) % 7])) !e.start.random_minutes && !e.end?.random_minutes && c(e) && o.push(l(e, 0, n, {
				spill: !0,
				startSun: null
			}));
			let te = n === 0 ? yn(t, r, bn(r, s.id)) : null;
			if (!d) for (let e of te ?? t.days[a]) {
				if (!c(e) || e.start.random_minutes || e.end?.random_minutes) continue;
				let t = Lt(e.start), n = Lt(e.end ?? null);
				t !== null && o.push(l(e, t, n === null ? t + 10 : n > t ? n : j));
			}
		}
		return o;
	}
	_deviceDays(e, t, n) {
		return Gn(this._preview[t]?.[e], this._preview[Nt(t, -1)]?.[e], n);
	}
	_skipped(e, t) {
		let n = this._data;
		for (let r of t) {
			let t = n.status[r.id], i = t?.skip_next ? t.skip_next_targets?.find((t) => t.entity_id === e) : void 0;
			if (!i || !t?.skip_next) continue;
			let a = z(n, i.label), o = a ? B(this.hass, a) : i.action ? Jr(this.hass, this._lang, i.action) : k(this._lang, "rest_none_short");
			return y`<span class="skip"><ha-icon icon="mdi:skip-next"></ha-icon>${k(this._lang, "skip_named", {
				what: o,
				when: mi(Vt(t.skip_next, this._tz, this._lang, this._now))
			})}</span>`;
		}
		return x;
	}
	_next(e, t) {
		let n = this._data;
		for (let r of t) {
			if (!r.enabled) continue;
			let t = n.status[r.id]?.next_actions?.[e];
			if (t) return t;
		}
	}
	_open(e, t, n = !1) {
		this._dialog = {
			kind: "schedule",
			scope: e,
			day: t,
			create: n
		};
	}
	_noSlots(e, t) {
		let n = this._data ? I(e, this._data) : void 0, r = (n) => {
			let r = z(this._data, n.label);
			return !r || !!Ur(this.hass, e, t, r, n);
		};
		return !!n && n.days.every((e) => !e.some((e) => kn(e, t) && r(e)));
	}
	_needsCreate(e, t) {
		return !!this._data?.can_edit && !this._data?.read_only && this._noSlots(e, t);
	}
	_createButton(e) {
		return y`<button class="create" @click=${() => this._open(e, void 0, !0)}>
      <ha-icon icon="mdi:plus"></ha-icon>${k(this._lang, "create_setting")}</button>`;
	}
	_say(e) {
		this._info = e, clearTimeout(this._infoTimer), this._infoTimer = setTimeout(() => {
			this._info = void 0;
		}, Ks);
	}
	_holdInfo(e) {
		this._info && (clearTimeout(this._infoTimer), e || (this._infoTimer = setTimeout(() => {
			this._info = void 0;
		}, Ks)));
	}
	async _toggleProgram(e) {
		if (this._toggling.has(e.id)) return;
		this._toggling = new Set(this._toggling).add(e.id);
		let t = !e.enabled;
		try {
			if (t) await this.hass.callWS({
				type: "weekly_planner/program/set_enabled",
				program_id: e.id,
				enabled: t
			}), this._say(k(this._lang, "program_resumed", { name: e.name }));
			else {
				let n = await pi(this, e.name);
				if (n === null) return;
				n === "none" ? await this.hass.callWS({
					type: "weekly_planner/program/set_enabled",
					program_id: e.id,
					enabled: t
				}) : await this.hass.callWS({
					type: "weekly_planner/program/pause",
					program_id: e.id,
					hours: n
				});
			}
		} catch (e) {
			this._error = Dt(this._lang, e);
		} finally {
			let t = new Set(this._toggling);
			t.delete(e.id), this._toggling = t, this.updateComplete.then(() => this._focusSwitch(e.id));
		}
	}
	_focusSwitch(e) {
		Array.from(this.renderRoot.querySelectorAll("button.hours[role=switch]")).find((t) => t.dataset.program === e)?.focus({ preventScroll: !0 });
	}
	_programToggle(e) {
		return y`<button class="hours" role="switch" aria-checked=${e.enabled} data-program=${e.id}
      aria-label=${e.name}
      ?disabled=${this._data?.read_only || this._toggling.has(e.id)}
      @click=${() => void this._toggleProgram(e)}>
      <ha-icon icon=${e.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
	}
	_holidayLine(e) {
		let t = this._data;
		if (!t?.holiday_today) return x;
		let n = It(this._now, this._tz), r = e.flatMap((e) => {
			let r = t.status[e.id]?.holiday, i = r ? xn(this._lang, r, n) : null;
			return i ? [{
				name: e.name,
				text: i
			}] : [];
		});
		return r.length ? y`<div class="mode-line holiday-line">${r.every((e) => e.text === r[0].text) ? y`<p>${r[0].text}</p>` : r.map((e) => y`<p>${e.name} : ${e.text}</p>`)}</div>` : x;
	}
	_modeLine() {
		let e = this._data?.mode;
		return e?.selector && e.options.length && e.active ? y`<p class="mode-line">${k(this._lang, "mode_shown", { name: e.active })}</p>` : x;
	}
	_noSchedule(e) {
		return this._data?.status[e.id]?.no_schedule_for_mode ? y`<span class="no-schedule">${k(this._lang, "no_schedule_for_mode")}</span>` : x;
	}
	_shownDevice(e) {
		let t = this._deviceOf.get(e.id);
		return e.entities.some((e) => e.entity_id === t) ? t : e.entities[0].entity_id;
	}
	_pickDevice(e, t) {
		this._deviceOf = new Map(this._deviceOf).set(e.id, t);
	}
	_deviceTabs(e) {
		if (e.entities.length < 2) return x;
		let t = this._shownDevice(e), n = e.entities.map((e) => e.entity_id);
		return y`<div class="devtabs" role="tablist" aria-label=${k(this._lang, "devices_of", { name: e.name })} @keydown=${(r) => {
			let i = n.indexOf(t), a = r.key === "ArrowRight" || r.key === "ArrowDown" ? (i + 1) % n.length : r.key === "ArrowLeft" || r.key === "ArrowUp" ? (i + n.length - 1) % n.length : r.key === "Home" ? 0 : r.key === "End" ? n.length - 1 : -1;
			a < 0 || (r.preventDefault(), this._pickDevice(e, n[a]), this.updateComplete.then(() => Array.from(this.renderRoot.querySelectorAll(".devtab[aria-selected=\"true\"]")).find((t) => t.dataset.tab === e.id)?.focus()));
		}}>
      ${n.map((n) => y`<button class="devtab" role="tab" data-tab=${e.id} aria-selected=${n === t}
        tabindex=${n === t ? 0 : -1} @click=${() => this._pickDevice(e, n)}>
        ${n === t ? y`<ha-icon icon="mdi:check"></ha-icon>` : x}<span>${L(this.hass, n)}</span></button>`)}
    </div>`;
	}
	_disabledBadge(e, t = []) {
		let n = Ut(t), r = n ? k(this._lang, "paused_until", { when: mi(Ht(n, this._tz, this._lang)) }) : k(this._lang, "program_disabled");
		return e ? y`<span class="badge-row"><span class="disabled-badge" role="status">${r}</span></span>` : x;
	}
	_deviceLabel(e, t) {
		return e.entities.length > 1 ? `${e.name}, ${L(this.hass, t)}` : e.name;
	}
	_bar(e, t, n, r, i) {
		let a = this._dateAt(n), o = It(a, this._tz), s = P(a, this._tz), c = `${t.id}|${e}|${r}|${o}`, l = [t];
		return y`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${t} entity-id=${e}
      weekday=${o} .spans=${this._spans(e, l, n)} .preview=${this._deviceDays(t.id, s, e).today}
      .now=${n === 0 ? N(this._now, this._tz) : null} ?hours=${r === "today"}
      ?editing=${this._edit === c} ?editable=${this._barEditable(t, n)}
      device-name=${this._deviceLabel(t, e)} lang=${this._lang} tz=${this._tz} view=${r === "today" ? this._config.schedule_view ?? "bar" : "bar"}
      .rest=${(() => {
			let n = z(this._data, t.entities.find((t) => t.entity_id === e)?.default_label);
			return n ? B(this.hass, n) : k(this._lang, "rest_none");
		})()}
      @edit-request=${() => this._edit = c} @edit-exit=${() => {
			this._edit === c && (this._edit = null);
		}}
      @open-day=${i} @edited=${(e) => this._showSnack(e.detail.undo)}></wp-bar-editor>`;
	}
	_barEditable(e, t) {
		return !!this._data?.can_edit && !this._data?.read_only && !ir(e, this._data) && !(t === 0 && bn(this._data, e.id));
	}
	_previewState(e, t) {
		let n = P(this._now, this._tz);
		return this._deviceDays(e.id, n, t).today === void 0 ? this._failedPreviewKey ? "failed" : "loading" : "ready";
	}
	_todayBlock(e, t, n) {
		let r = this._previewState(t, e), i = !!this._data?.can_edit && !this._data?.read_only && !ir(t, this._data), a = r === "ready" ? ws(this._spans(e, [t], 0), {
			tz: this._tz,
			nowMin: N(this._now, this._tz),
			nowMs: this._now.getTime()
		}) : [], o = z(this._data, t.entities.find((t) => t.entity_id === e)?.default_label);
		return y`<wp-times-day .rows=${a} state=${r} .rest=${o ? B(this.hass, o) : k(this._lang, "rest_none")}
      ?editable=${i} ?locked=${bn(this._data, t.id)} lang=${this._lang} device-name=${this._deviceLabel(t, e)}
      @open-day=${n} @retry=${() => this._retryPreviews()}></wp-times-day>`;
	}
	_whenText(e) {
		let t = Vt(e, this._tz, this._lang, this._now), n = P(new Date(e), this._tz) === P(this._now, this._tz);
		return Mt() === "12" && n ? k(this._lang, "at_time", { time: t }) : t;
	}
	_line(e, t, n) {
		let r = this._lang, i = this._data, a = this._next(e, t), o = z(i, a?.label), s = t.length > 0 && t.every((e) => !e.enabled), c = this.hass.states[e], l = n.icon ?? c?.attributes.icon ?? "mdi:calendar-clock", u = () => this._open(n.open), d = this._needsCreate(t[0], e), f = this._config.schedule_view === "times" && !d && !!this._data?.can_edit && !this._data?.read_only && !ir(t[0], i) && this._previewState(t[0], e) === "ready";
		return y`
      <div class="block">
        <div class="line">
          ${!n.icon && !c?.attributes.icon && c ? y`<ha-state-icon class="dev" .hass=${this.hass} .stateObj=${c}></ha-state-icon>` : y`<ha-icon class="dev" icon=${l}></ha-icon>`}
          <div class="info">
            ${n.name ? y`<span class="name">${n.name}</span>` : x}
            ${n.button && t.length === 1 ? this._noSchedule(t[0]) : x}
            ${n.button ? this._disabledBadge(s, t) : x}
            <span class="now">
              <span class="state">${c ? this.hass.formatEntityState?.(c) ?? c.state : "—"}</span>
              ${a ? y`<span class="next"><span class="arrow">${k(r, "next_then")}</span> <span class="lbl">${o ? B(this.hass, o) : Jr(this.hass, r, a.action)}</span>
                <span class="when nw">${mi(this._whenText(a.at))}</span></span>` : x}
            </span>
            ${this._skipped(e, t)}
          </div>
          ${n.button ? y`<div class="header-actions"><div class="header-icons">
            ${t.length === 1 ? this._programToggle(t[0]) : x}
            ${f ? x : y`<button class="hours" aria-label=${k(r, "hours_of", { name: n.name ?? L(this.hass, e) })} title=${k(r, "hours")} @click=${u}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>`}
          </div></div>` : x}
        </div>
        ${d ? this._createButton(n.open) : this._config.schedule_view === "times" ? this._todayBlock(e, t[0], u) : this._config.schedule_view === "radial" || this._config.schedule_view === "radial_12h" ? this._bar(e, t[0], 0, "today", u) : y`<div class="today">
          <span class="wname" title=${k(r, "today")}>${k(r, "today_short")}</span>
          ${this._bar(e, t[0], 0, "today", u)}
        </div>`}
        ${d ? x : this._extras(n.open, e, t)}
      </div>`;
	}
	_extras(e, t, n) {
		let r = this._lang, i = `${ss(e)}|${t}`, a = this._week.has(i), o = () => {
			let e = new Set(this._week);
			a ? e.delete(i) : e.add(i), this._week = e;
		}, s = O(r).days_short, c = this._config.show_chart !== !1 && !!this._data, l = ms(ps(this._config), ss(e), t), u = c && hs(this._charts, l, this._config.chart_collapsed !== !1), d = () => {
			let e = new Map(this._charts);
			e.set(l, !u), this._charts = e, fs(e);
		}, f = n[0], p = this._deviceLabel(f, t), m = P(this._now, this._tz), { today: ee, previous: te } = this._deviceDays(f.id, m, t);
		return y`
      <div class="toggles">
        <button class="weekbtn" aria-label=${k(r, "week_of", { name: p })} aria-expanded=${a} @click=${o}>
          <ha-icon icon="mdi:calendar-week"></ha-icon>${k(r, "week")}<ha-icon class="after" icon=${a ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>
        ${c ? y`<button class="weekbtn chartbtn" aria-label=${k(r, "chart_day_of", { name: p })} aria-expanded=${u} @click=${d}>
          <ha-icon icon="mdi:chart-line"></ha-icon>${k(r, "chart_day")}<ha-icon class="after" icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>` : x}
      </div>
      ${a ? y`<div class="week">
        ${[
			0,
			1,
			2,
			3,
			4,
			5,
			6
		].map((n) => {
			let r = (n - It(this._now, this._tz) + 7) % 7, i = () => this._open(e, {
				weekday: n,
				offset: r
			});
			return y`<div class="wday">
            <button class="wnamebtn" aria-label=${s[n]} @click=${i}>
              <span class="wname ${r === 0 ? "today" : ""}">${s[n]}</span></button>
            ${this._bar(t, f, r, "week", i)}</div>`;
		})}
      </div>` : x}
      ${u ? y`<div class="chartbox"><wp-chart .hass=${this.hass} .data=${this._data} .program=${f}
        entity-id=${t} date=${m} .slots=${ee ? [...te ?? [], ...ee] : null}
        @open-history=${(e) => gs(e.detail)}></wp-chart></div>` : x}`;
	}
	_bySchedule(e, t = !1) {
		let n = this._lang;
		return e.map((e) => {
			let r = {
				kind: "program",
				programId: e.id
			};
			return e.entities.length === 1 ? this._line(e.entities[0].entity_id, [e], {
				name: e.name,
				icon: e.icon ?? void 0,
				button: r,
				open: r
			}) : y`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
          ${t ? y`<h3>${e.name}${this._noSchedule(e)}${this._disabledBadge(!e.enabled, [e])}</h3>` : y`<h2>${e.name}${this._noSchedule(e)}${this._disabledBadge(!e.enabled, [e])}</h2>`}
          <div class="header-actions"><div class="header-icons">${this._programToggle(e)}
            <button class="hours" aria-label=${k(n, "hours_of", { name: e.name })} title=${k(n, "hours")} @click=${() => this._open(r)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div></div>
        </div>
        ${this._deviceTabs(e)}
        ${this._line(this._shownDevice(e), [e], {
				name: null,
				button: null,
				open: {
					...r,
					entityId: this._shownDevice(e)
				}
			})}
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
			return y`<section class="compact-program"><div class="compact-row">
        <ha-icon icon=${e.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" aria-expanded=${r} aria-controls=${`compact-${e.id}`}
          @click=${() => {
				this._expandedProgram = r ? null : e.id, this._edit = null;
			}}>
          <strong>${e.name}<ha-icon icon=${r ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></strong>${this._noSchedule(e)}${this._disabledBadge(!e.enabled, [e])}
          ${n.length ? y`<span>${(() => {
				let e = z(this._data, n[0].next.label);
				return e ? B(this.hass, e) : Jr(this.hass, this._lang, n[0].next.action);
			})()} · ${k(this._lang, "then_label")} ${mi(Vt(n[0].next.at, this._tz, this._lang, this._now))}</span>` : y`${e.enabled ? y`<span>${k(this._lang, "hours")}</span>` : x}`}
        </button><div class="header-actions"><div class="header-icons">${this._programToggle(e)}
        ${r ? y`<button class="hours" aria-label=${k(this._lang, "hours_of", { name: e.name })} title=${k(this._lang, "hours")}
          @click=${() => this._open(t)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : x}</div></div></div>
        ${r ? y`<div id=${`compact-${e.id}`} class="compact-details" role="region" aria-label=${e.name}>
          ${this._deviceTabs(e)}
          ${e.entities.filter((t) => e.entities.length < 2 || t.entity_id === this._shownDevice(e)).map((n) => {
				let r = e.entities.length > 1 ? {
					...t,
					entityId: n.entity_id
				} : t;
				return y`
            ${this._needsCreate(e, n.entity_id) ? this._createButton(r) : this._config.schedule_view === "times" ? y`${this._todayBlock(n.entity_id, e, () => this._open(r))}${this._extras(r, n.entity_id, [e])}` : y`<div class="today"><span class="wname" title=${k(this._lang, "today")}>${k(this._lang, "today_short")}</span>
              ${this._bar(n.entity_id, e, 0, "today", () => this._open(r))}</div>
            ${this._extras(r, n.entity_id, [e])}`}`;
			})}
        </div>` : x}</section>`;
		});
	}
	render() {
		if (!this._config || !this.hass) return x;
		let e = this._lang, t = this._data, n = t ? sr(t, this._config) : [];
		return y`
      <ha-card>
        ${this._config.title !== void 0 && this._config.title !== "" || t?.vacation ? y`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${t?.vacation ? y`<span class="chip"><ha-icon icon="mdi:pause-circle-outline"></ha-icon> ${k(e, "vacation")}</span>` : x}
            </div>` : x}
        ${this._modeLine()}
        ${this._holidayLine(n)}
        ${this._info ? y`<div class="info" @pointerenter=${() => this._holdInfo(!0)} @pointerleave=${() => this._holdInfo(!1)}
          @focusin=${() => this._holdInfo(!0)} @focusout=${() => this._holdInfo(!1)}>${C("success", "", this._info, { role: "status" })}</div>` : x}
        ${this._error ? y`${C("error", "", this._error, { role: "alert" })}` : x}
        ${t?.read_only ? y`${C("error", "", k(e, "read_only"))}` : x}
        ${t ? x : y`<div class="empty">…</div>`}
        ${t && !n.length ? y`<div class="empty" role="status">${k(e, t.programs.length && this._config.program === void 0 ? "no_matching_program" : "no_program")}</div>` : x}
        ${t ? this._list(n) : x}
      </ha-card>
      ${this._snack ? y`<div class="snack" role="status"><span>${k(e, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${k(e, "undo")}</button></div>` : x}
      ${this._renderDialog()}`;
	}
	_renderDialog() {
		let e = this._dialog;
		if (!e || !this._data) return x;
		let t = () => this._dialog = null;
		if (e.kind === "schedule") return ht(`${ss(e.scope)}|${e.scope.kind === "program" ? e.scope.entityId ?? "" : ""}`, y`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${e.scope} .day=${e.day ?? null} ?create=${!!e.create}
          .chart=${this._config.show_chart !== !1} @closed=${t}></wp-schedule>`);
	}
	static {
		this.styles = [nt, l`
    .compact-program { border-top: 1px solid var(--divider-color); }
    .compact-program:first-of-type { border-top: 0; }
    .compact-row { display: flex; align-items: center; gap: 8px; min-height: 72px; }
    .summary strong { display: flex; align-items: center; gap: 4px; overflow-wrap: anywhere; }
    .summary ha-icon { --mdc-icon-size: 18px; flex: none; }
    .compact-details { padding-bottom: 8px; }
    .devtabs { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 8px; }
    .devtab {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; max-width: 100%; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem;
      text-align: left; cursor: pointer; --mdc-icon-size: 20px;
    }
    .devtab span { min-width: 0; overflow-wrap: anywhere; }
    .devtab[aria-selected="true"] { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    .devtab:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .summary { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 4px; text-align: left; background: none; border: 0; color: inherit; font: inherit; cursor: pointer; }
    .summary span { font-size: 0.875rem; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    button:disabled { opacity: .5; cursor: default; }
    ha-card { padding: 8px 16px 12px; }
    .head { display: flex; align-items: center; gap: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 1.25rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; font-size: 0.875rem; padding: 2px 10px; border-radius: 12px; background: var(--warning-color, #ff9800); color: #000; }
    .block { padding: 8px 0; border-top: 1px solid var(--divider-color); }
    .block:first-of-type, .head + .block { border-top: none; }
    .line { display: flex; align-items: flex-start; gap: 10px; min-height: 28px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); margin-top: -1px; }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .holiday-line p { margin: 0; color: var(--primary-text-color); }
    .mode-line { margin: 0; padding: 4px 0 8px; font-size: 0.875rem; line-height: 20px; color: var(--secondary-text-color); }
    .no-schedule { display: block; flex-basis: 100%; font-size: 0.8125rem; font-weight: 400; color: var(--secondary-text-color); line-height: 20px; }
    .name { font-size: 1.0625rem; font-weight: 600; }
    .skip { flex-basis: 100%; display: inline-flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
    .now { font-size: 0.9375rem; display: flex; flex-wrap: wrap; min-width: 0; max-width: 100%; align-items: baseline; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .state { min-width: 0; overflow-wrap: anywhere; }
    .next { min-width: 0; max-width: 100%; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 4px; }
    .next .lbl { min-width: 0; overflow-wrap: anywhere; }
    .when { opacity: 0.8; }
    .header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
    .header-icons { display: flex; align-items: center; }
    .badge-row { display: block; flex-basis: 100%; min-width: 0; margin-top: 2px; }
    .disabled-badge { display: inline-block; max-width: 100%; padding: 0 8px; border-radius: 10px; background: #b3261e; color: #fff; font-size: 0.75rem; font-weight: 600; line-height: 20px; }
    .line .header-actions { margin-top: -12px; }
    .name, .now { line-height: 24px; }
    button.hours {
      flex: none; width: 48px; height: 48px; padding: 0; border-radius: 24px; border: none;
      background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 24px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.create {
      display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 48px; margin-top: 8px;
      padding: 0 16px; border: none; border-radius: 24px; font: inherit; font-size: 1rem; font-weight: 500; cursor: pointer;
      background: var(--wp-primary-fill); color: #fff; --mdc-icon-size: 22px;
    }
    button.create:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    button.hours:hover { background: var(--secondary-background-color); }
    button.hours:disabled { opacity: 0.4; cursor: default; }
    button.hours:disabled:hover { background: none; }
    wp-bar-editor { margin-top: 2px; }
    .toggles { display: flex; flex-wrap: wrap; align-items: center; gap: 0 16px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; min-width: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--wp-primary-text); font: inherit; font-size: 1rem; cursor: pointer; --mdc-icon-size: 22px;
    }
    .weekbtn .after { --mdc-icon-size: 20px; }
    .chartbox { padding: 4px 0 8px; }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday { display: flex; align-items: flex-start; gap: ${e.gap}px; min-height: 48px; width: 100%; }
    .wnamebtn {
      flex: none; width: ${e.label + e.gap}px; margin-right: -${e.gap}px; height: 48px; padding: 0; border: none; border-radius: 8px; background: none; color: inherit;
      font: inherit; cursor: pointer; text-align: left; display: flex; align-items: center;
    }
    .wday .wnamebtn { margin-top: 6px; }
    .wnamebtn:hover .wname { text-decoration: underline; }
    .wday wp-bar-editor { margin: 16px 0 10px; }
    .wname { flex: none; width: ${e.label}px; font-size: 0.875rem; color: var(--secondary-text-color); }
    .wday wp-bar-editor, .today wp-bar-editor { flex: 1; min-width: 0; }
    .wname.today { color: var(--primary-text-color); font-weight: 600; }
    .today { display: flex; align-items: flex-start; gap: ${e.gap}px; padding-top: 20px; } /* room for the "now" clock above the bar */
    .today .wname { line-height: 28px; margin-top: 2px; }
    .prog { padding: 8px 0 4px; border-top: 1px solid var(--divider-color); }
    .prog:first-of-type, .head + .prog { border-top: none; }
    .prog .block { border-top: none; padding: 2px 0 4px; }
    .phead { display: flex; align-items: center; gap: 10px; min-height: 48px; --mdc-icon-size: 24px; }
    .phead h2, .phead h3 { flex: 1; min-width: 0; margin: 0; font-size: 1.125rem; font-weight: 600; overflow-wrap: anywhere; }
    .snack {
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 8; display: flex; align-items: center; gap: 12px;
      min-height: 48px; padding: 0 8px 0 16px; border-radius: 24px; font-size: 0.9375rem; white-space: nowrap;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .snack button {
      min-height: 48px; padding: 0 12px; border: none; background: none; font: inherit; font-weight: 600; cursor: pointer;
      color: inherit; text-decoration: underline; border-radius: 24px;
    }
    .group { margin: 12px 0 0; padding: 0 0 4px; font-size: 1rem; font-weight: 700; color: var(--primary-text-color); overflow-wrap: anywhere; }
    .empty { color: var(--primary-text-color); opacity: 0.8; padding: 16px 0; text-align: center; }
  `];
	}
};
D([T({ attribute: !1 })], Z.prototype, "hass", void 0), D([E()], Z.prototype, "_config", void 0), D([E()], Z.prototype, "_data", void 0), D([E()], Z.prototype, "_error", void 0), D([E()], Z.prototype, "_info", void 0), D([E()], Z.prototype, "_dialog", void 0), D([E()], Z.prototype, "_preview", void 0), D([E()], Z.prototype, "_now", void 0), D([E()], Z.prototype, "_week", void 0), D([E()], Z.prototype, "_expandedProgram", void 0), D([E()], Z.prototype, "_deviceOf", void 0), D([E()], Z.prototype, "_charts", void 0), D([E()], Z.prototype, "_edit", void 0), D([E()], Z.prototype, "_snack", void 0), D([E()], Z.prototype, "_toggling", void 0), Z = D([w("weekly-planner-card")], Z);
// src/draft-history.ts
var qs = 50, Js = 700, Ys = class {
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
		JSON.stringify(e) !== JSON.stringify(t) && (n && n === this._group && this._recordedAt !== void 0 && r >= this._recordedAt && r - this._recordedAt <= Js || this._push(this._past, e), this._future = [], this._group = n || void 0, this._recordedAt = r);
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
		e.push(structuredClone(t)), e.length > qs && e.shift();
	}
	_resetGroup() {
		this._group = void 0, this._recordedAt = void 0;
	}
}, Xs = /* @__PURE__ */ new WeakMap();
async function Zs(e, t) {
	let n = e.states[t], r = n?.attributes.icon;
	if (typeof r == "string" && r.startsWith("mdi:")) return r;
	let i = t.split(".")[0], a = Xs.get(e.connection);
	a || Xs.set(e.connection, a = /* @__PURE__ */ new Map());
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
var Qs = (e, t) => JSON.stringify(e) === JSON.stringify(t), $s = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function ec(e, t, n) {
	if (Qs(e, t)) return n;
	if (Qs(e, n) || Qs(t, n)) return t;
	if ($s(e) && $s(t) && $s(n)) {
		let r = {};
		for (let i of /* @__PURE__ */ new Set([
			...Object.keys(e),
			...Object.keys(t),
			...Object.keys(n)
		])) {
			let a = ec(e[i], t[i], n[i]);
			a !== void 0 && (r[i] = a);
		}
		return r;
	}
	if (Array.isArray(e) && Array.isArray(t) && Array.isArray(n)) {
		let r = [
			...e,
			...t,
			...n
		], i = ["id", "entity_id"].find((e) => r.length && r.every((t) => $s(t) && typeof t[e] == "string"));
		if (i) {
			let r = (e) => new Map(e.map((e) => [e[i], e])), a = r(e), o = r(t), s = r(n);
			return [.../* @__PURE__ */ new Set([
				...o.keys(),
				...s.keys(),
				...a.keys()
			])].map((e) => ec(a.get(e), o.get(e), s.get(e))).filter((e) => e !== void 0);
		}
	}
	throw Error("settings_conflict");
}
function tc(e, t, n) {
	return {
		...ec(e, {
			...t,
			revision: e.revision
		}, n),
		revision: n.revision
	};
}
// src/components/gestures.ts
function nc(e, t) {
	let n = e.states[t]?.attributes?.friendly_name;
	if (typeof n == "string" && n) return n;
	let r = t.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
	return r ? r.charAt(0).toUpperCase() + r.slice(1) : t;
}
var rc = /* @__PURE__ */ new WeakSet();
function ic(e) {
	if (!e || rc.has(e)) return;
	rc.add(e);
	let t = () => {
		e.classList.toggle("more-left", e.scrollLeft > 2), e.classList.toggle("more-right", e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
	};
	e.addEventListener("scroll", t, { passive: !0 }), typeof ResizeObserver < "u" && new ResizeObserver(t).observe(e), t();
}
var ac = "\n  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }\n  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }\n  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }\n", oc = () => [
	[],
	[],
	[],
	[],
	[],
	[],
	[]
];
function sc(e) {
	return e.map((e) => ({
		...structuredClone(e),
		id: R()
	}));
}
var Q = class extends S {
	constructor(...e) {
		super(...e), this.embedded = !1, this._iconCustomized = !1, this._applied = !1, this.defaultTypes = [], this._isNew = !0, this._tab = "general", this._error = "", this._nameError = "", this._entitiesError = "", this._saving = !1, this._scheduleOpen = !1, this._hoursRevision = 0, this._picker = !!customElements.get("ha-selector"), this._ready = !1, this._history = new Ys(), this._editingHistory = !1, this._iconEpoch = 0, this._historyKey = (e) => {
			if (e.defaultPrevented || e.altKey || !(e.ctrlKey || e.metaKey) || !this._p || this._saving || !this._canEdit() || e.composedPath().some((e) => e instanceof HTMLElement && (e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable))) return;
			let t = e.key.toLowerCase(), n = t === "z" && e.shiftKey || t === "y";
			(t === "z" || t === "y") && (e.preventDefault(), e.stopPropagation(), n ? this._redoDraft() : this._undoDraft());
		}, this._pickerKey = 0, this._servicesOpen = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("keydown", this._historyKey), this._picker || dr().then((e) => this._picker = e);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("keydown", this._historyKey), this._applied = !1;
	}
	_snapshot() {
		return structuredClone({
			program: this._p,
			origin: this._origin,
			isNew: this._isNew,
			iconCustomized: this._iconCustomized
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
		this._p = e.program, this._origin = e.origin, this._isNew = e.isNew, this._iconCustomized = e.iconCustomized, this._error = "", this._nameError = "", this._entitiesError = "", this._applied = !1, this._refreshIcon();
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
	_refreshIcon() {
		let e = ++this._iconEpoch, t = this._p.entities[0]?.entity_id;
		!this._iconCustomized && t && Zs(this.hass, t).then((n) => {
			e !== this._iconEpoch || this._iconCustomized || this._p.entities[0]?.entity_id !== t || (this._p = {
				...this._p,
				icon: n
			});
		});
	}
	get _lang() {
		return $r(this.hass);
	}
	_tr(e, t) {
		return k(this._lang, e, t);
	}
	willUpdate() {
		if (!this._ready && this.hass && this.data) {
			if (this._ready = !0, this._origin = this.program ? structuredClone(this.program) : void 0, this.program) this._p = structuredClone(this.program), this._isNew = !1;
			else {
				let e = R();
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
					profiles: [{
						id: e,
						name: this.data.mode?.selector ? this.data.mode.default ?? this.data.mode.active ?? this._tr("profile_default") : this._tr("profile_default"),
						days: oc()
					}]
				}, this._isNew = !0;
			}
			this._iconCustomized = !!(this.program?.icon && this.program.icon !== this._deviceIcon(this.program.entities[0]?.entity_id)), this._tab = "general";
		}
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
		return t?.code === "conflict" ? `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}` : t?.code === "unauthorized" ? this._tr("err_unauthorized") : n.includes("random_window_too_short") ? this._tr("random_too_short") : Tt(this._lang, n, (e) => nc(this.hass, e)) || (n.includes("overlapping_slots") ? this._tr("err_overlap_server") : n.includes("duplicate_profile_name") ? this._tr("err_profile_name") : Dt(this._lang, e));
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
		return y`<div class="field"><label for="f-name">${this._tr("pe_name")}</label>
      <input id="f-name" type="text" maxlength="60" .value=${this._p.name} aria-invalid=${e ? "true" : "false"}
        aria-describedby=${e ? "f-name-error" : x}
        @input=${(e) => this._patch({ name: e.target.value }, "name")} />
      ${e ? y`<p id="f-name-error" class="error field-error" role="alert">${this._nameError}</p>` : x}</div>`;
	}
	async _save() {
		if (!this._canEdit() || this._saving) return;
		let e = this._problem();
		if (e) this._error = "", this._nameError = "", this._entitiesError = "", e.field === "name" ? this._nameError = e.message : e.field === "entities" ? this._entitiesError = e.message : this._error = e.message, e.field !== "form" && this._showField(e.field);
		else {
			this._error = "", this._saving = !0;
			try {
				let e = this._payload(), t;
				for (let n = 0; n < 2; n++) {
					let r = (await this.hass.callWS({ type: "weekly_planner/get" })).programs.find((t) => t.id === e.id);
					if (this._origin && !r) throw { code: "conflict" };
					let i = e;
					if (this._origin && r) {
						try {
							i = tc(this._origin, e, r);
						} catch {
							throw { code: "conflict" };
						}
						for (let e of U(this._origin)) i.entities.some((t) => t.entity_id === e) || (i = ha(i, e));
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
		await ci(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("slot_delete_yes"), this._tr("slot_delete_no")) && await this._delete();
	}
	async _askDeleteEntity(e) {
		let t = this._p.entities[e]?.entity_id;
		if (!t) return;
		let n = this._p.entities.length > 1 ? Sa(this._p, t) : 0, r = n ? this._tr("confirm_remove_device_own", {
			name: nc(this.hass, t),
			n: String(n)
		}) : this._tr("confirm_delete", { name: nc(this.hass, t) });
		if (await ci(this, r, this._tr("slot_delete_yes"), this._tr("slot_delete_no"))) {
			let n = ha(this._p, t);
			this._patch({
				entities: this._p.entities.filter((t, n) => n !== e),
				profiles: n.profiles
			});
		}
	}
	_incompatible(e) {
		let t = [];
		for (let n of this._p.profiles) for (let r of n.days.flat()) {
			let i = z(this.data, r.label), a = this._origin?.entities.some((t) => t.entity_id === e) ? this._origin : null;
			i && kn(r, e) && !Ur(this.hass, this._p, e, i, r) && (!a || Ur(this.hass, a, e, i, r)) && t.push({
				profileId: n.id,
				slotId: r.id
			});
		}
		return t;
	}
	_dropIncompatible(e) {
		let t = this._incompatible(e), n = U(this._p);
		this._patch({ profiles: this._p.profiles.map((r) => {
			let i = r.days;
			for (let a of t.filter((e) => e.profileId === r.id)) i = ba(i, a.slotId, e, null, { devices: n })?.days ?? i;
			return {
				...r,
				days: i
			};
		}) });
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
			let e = this._p, t = e.profiles.map((e) => ({
				...structuredClone(e),
				id: R(),
				days: e.days.map(sc)
			}));
			this._p = {
				...structuredClone(e),
				id: "",
				revision: 0,
				created_at: void 0,
				name: `${e.name} ${this._tr("copy_suffix")}`.slice(0, 60),
				profiles: t
			}, delete this._p.created_at, this._isNew = !0, this._origin = void 0, this._applied = !1, this._error = "";
		});
	}
	_revert() {
		this._origin && (this._p = structuredClone(this._origin), this._history.clear(), this._error = "");
	}
	_close() {
		this.renderRoot.querySelector("#main")?.close();
	}
	_renderGeneral() {
		let e = this._p;
		return y`
      ${this._nameField()}
      <div class="field"><label for="f-area">${this._tr("pe_area")}</label>
        <input id="f-area" type="text" list="program-areas" .value=${e.area ?? ""} aria-describedby="program-area-help"
          @change=${(e) => this._patch({ area: e.target.value.trim() || null })} />
        <datalist id="program-areas">${[...new Set(this.data.programs.flatMap((e) => e.area ? [e.area] : []))].sort().map((e) => y`<option value=${e}></option>`)}</datalist>
        <p id="program-area-help" class="hint">${this._tr("pe_area_hint")}</p></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker ? y`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${e.icon ?? ""}
                @value-changed=${(e) => this._setIcon(e.detail.value || null)}></ha-selector>` : y`<div class="row" style="flex-wrap:nowrap">
                ${e.icon && customElements.get("ha-icon") ? y`<ha-icon .icon=${e.icon}></ha-icon>` : x}
                <input id="f-icon" type="text" aria-describedby="icon-name-hint" .value=${e.icon ?? ""}
                  @input=${(e) => this._setIcon(e.target.value.trim() || null)} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(e.priority)}
            @change=${(e) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_icon_hint")}</p>
      ${this._picker ? x : y`<p id="icon-name-hint" class="hint">${this._tr("pe_icon_name_hint")}</p>`}
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
		Qr(this.renderRoot), ic(this.renderRoot.querySelector(".tabs"));
	}
	_renderEntities(e = !1) {
		let t = this._p;
		return y`
      ${t.entities.length === 0 ? y`<p class="muted">${this._tr("pe_no_entity")}</p>` : x}
      ${t.entities.map((t, n) => this._renderEntity(t, n, e))}
      ${ht(this._pickerKey, this._picker ? y`<ha-selector id="pe-entity-add" aria-invalid=${this._entitiesError ? "true" : "false"} aria-describedby=${this._entitiesError ? "pe-entities-error" : x} .hass=${this.hass} .selector=${{ entity: { exclude_entities: t.entities.map((e) => e.entity_id) } }}
            .label=${this._tr(t.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .value=${""} .required=${!t.entities.length}
            @value-changed=${(e) => {
			e.stopPropagation(), this._addEntity(e.detail.value ?? "");
		}}></ha-selector>` : y`<wp-entity-picker id="pe-entity-add" aria-describedby=${this._entitiesError ? "pe-entities-error" : x} .hass=${this.hass} .value=${""} .label=${this._tr(t.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .required=${!t.entities.length}
        .exclude=${t.entities.map((e) => e.entity_id)}
        @wp-change=${(e) => {
			e.stopPropagation(), this._addEntity(e.detail);
		}}></wp-entity-picker>`)}
      ${this._entitiesError ? y`<p id="pe-entities-error" class="error field-error" role="alert">${this._entitiesError}</p>` : x}
    `;
	}
	_renderServices(e, t) {
		let n = new Map(Tr(this.hass, e.entity_id).map((e) => [e.id, e])), r = [...this.data.labels.map((e) => e.action), ...Object.values(e.label_overrides ?? {})], i = [...e.allowed_services ?? [], ...r.flatMap((e) => e.kind === "service" && e.target_entity_id ? [e.service] : [])];
		for (let e of i) if (!n.has(e)) {
			let [t, r] = e.split(".");
			n.set(e, {
				id: e,
				domain: t,
				service: r,
				label: Sr(this.hass, e)
			});
		}
		let a = [...n.values()].sort((e, t) => e.label.localeCompare(t.label));
		if (!a.length) return y`<p class="hint">${this._tr("pe_no_services")}</p>`;
		let o = e.allowed_services ?? [], s = !e.restrict_services && !o.length, c = (e) => s || o.includes(e), l = a.filter((e) => c(e.id)).length, u = this._isNew || this._servicesOpen === e.entity_id, d = (e, n) => {
			let r = new Set(s ? a.map((e) => e.id) : o);
			n ? r.add(e) : r.delete(e), this._setEntity(t, {
				allowed_services: [...r],
				restrict_services: !0
			});
		};
		return y`
      ${this._isNew ? y`<h3>${this._tr("pe_services")} · ${l}/${a.length}</h3>` : y`
        <button class="link" aria-expanded=${u} @click=${() => this._servicesOpen = u ? "" : e.entity_id}>
          <ha-icon icon=${u ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${l === a.length ? this._tr("pe_services_all") : `${l}/${a.length}`}</button>`}
      ${l === 0 && e.restrict_services ? y`<p class="hint" role="status">${this._tr("pe_zero_services")}</p>` : x}
      ${u ? y`<p class="hint">${this._tr("pe_choose_services")}</p><div class="svc">${a.map((e) => {
			let n = Cr(this.hass, e.id), r = `svc-name-${t}-${e.id}`, i = `svc-description-${t}-${e.id}`;
			return y`<label class="check svc-choice"><input type="checkbox" .checked=${c(e.id)}
          aria-labelledby=${r} aria-describedby=${n ? i : x}
          @change=${(t) => d(e.id, t.target.checked)} />
          <span class="svc-copy"><span id=${r}>${e.label}</span>
            ${n ? y`<span id=${i} class="svc-description">${n}</span>` : x}
          </span></label>`;
		})}</div>` : x}`;
	}
	_renderEntity(e, t, n = !1) {
		yr(this.hass, Er(this.hass, e.entity_id)).then((e) => e && this.requestUpdate());
		let r = this.data.programs.filter((t) => t.id !== this._p.id && t.entities.some((t) => t.entity_id === e.entity_id)).sort((e, t) => e.priority - t.priority || e.name.localeCompare(t.name)).map((e) => this._tr("pe_program_priority", {
			name: e.name,
			priority: String(e.priority)
		}));
		return y`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${nc(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? x : y`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${nc(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(t)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${r.length ? y`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: r.join(", ") })}</p>` : x}
        ${this._renderInherit(e)}
        ${this._renderServices(e, t)}
        ${this._renderIncompatible(e)}
      </div>`;
	}
	_renderInherit(e) {
		let t = this._origin;
		if (!t || t.entities.some((t) => t.entity_id === e.entity_id) || this._p.entities.length < 2) return x;
		let n = Ca(this._p);
		return n ? y`<p class="hint" role="status">${this._tr("pe_inherits", { n: String(n) })}</p>` : x;
	}
	_renderIncompatible(e) {
		let t = this._origin?.entities.find((t) => t.entity_id === e.entity_id);
		if (!t || JSON.stringify(t.allowed_services ?? []) === JSON.stringify(e.allowed_services ?? []) && !!t.restrict_services == !!e.restrict_services) return x;
		let n = this._incompatible(e.entity_id).length;
		return n ? y`<div class="notice" role="status"><p class="hint">${this._tr("pe_incompatible", { n: String(n) })}</p>
      <button class="btn" ?disabled=${!this._canEdit()} @click=${() => this._dropIncompatible(e.entity_id)}>
        <ha-icon icon="mdi:link-off"></ha-icon>${this._tr("pe_incompatible_remove")}</button></div>` : x;
	}
	_closeModeSchedule() {
		this._scheduleOpen = !1;
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
	_renderSeasons() {
		let e = this.data.mode?.selector ? this.data.mode.active : null;
		return y`
      <p class="hint">${this._tr("profile_explanation")}</p>
      ${e ? y`<p class="active-profile" role="status"><ha-icon icon="mdi:star"></ha-icon>
        ${this._tr("profile_current", { name: e })}</p>` : x}
      <button class="btn" ?disabled=${this._isNew} @click=${() => {
			this._scheduleOpen = !0;
		}}>
        <ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("mode_edit_hours")}</button>
    `;
	}
	_tabKey(e, t) {
		let n = t.findIndex(([e]) => e === this._tab), r = e.key === "ArrowRight" ? (n + 1) % t.length : e.key === "ArrowLeft" ? (n + t.length - 1) % t.length : e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : -1;
		r < 0 || (e.preventDefault(), this._tab = t[r][0], this.updateComplete.then(() => this.renderRoot.querySelector(`#pe-tab-${this._tab}`)?.focus()));
	}
	render() {
		if (!this._p) return x;
		let e = [
			["general", "tab_general"],
			["entities", "tab_entities"],
			["seasons", "tab_seasons"]
		], t = this._canEdit(), n = y`
      ${t ? x : y`${C("error", "", this._tr("read_only"), { role: "alert" })}`}
      <p class="hint">${this._tr("admin_zone_hint")}</p>
      <fieldset ?disabled=${!t || this._saving}>
        <div class="history" role="group" aria-label=${this._tr("pe_history")}>
          <button class="btn" aria-label=${this._tr("pe_undo")} title=${this._tr("pe_undo")} ?disabled=${!this._history.canUndo} @click=${() => this._undoDraft()}>
            <ha-icon icon="mdi:undo"></ha-icon>${this._isNew ? x : this._tr("pe_undo")}</button>
          <button class="btn" aria-label=${this._tr("pe_redo")} title=${this._tr("pe_redo")} ?disabled=${!this._history.canRedo} @click=${() => this._redoDraft()}>
            <ha-icon icon="mdi:redo"></ha-icon>${this._isNew ? x : this._tr("pe_redo")}</button>
        </div>
        ${this._isNew ? y`<p class="hint">${this._tr("pe_create_hint")}</p>
          ${this._nameField()}
          <h3>${this._tr("tab_entities")}</h3>${this._renderEntities(!0)}` : y`
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${e.map(([t, n]) => y`<button id=${`pe-tab-${t}`} role="tab" aria-controls="pe-panel" tabindex=${this._tab === t ? 0 : -1} aria-selected=${this._tab === t} class="tab ${this._tab === t ? "on" : ""}"
            @keydown=${(t) => this._tabKey(t, e)} @click=${() => this._tab = t}>${this._tr(n)}</button>`)}
        </div>
        <div id="pe-panel" role="tabpanel" aria-labelledby=${`pe-tab-${this._tab}`}>
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>`}
      </fieldset>`, r = this._error ? C("error", "", this._error, { role: "alert" }) : x, i = y`
      <button class="btn primary" ?disabled=${!t || this._saving} @click=${() => void this._save()}>
        ${this._tr(this._isNew ? "pe_create" : "save")}</button>
      ${this.embedded ? !this._isNew && this._origin && JSON.stringify(this._p) !== JSON.stringify(this._origin) ? y`<button class="btn" ?disabled=${this._saving} @click=${() => this._revert()}>${this._tr("cancel")}</button>` : x : y`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>`}`, a = y`
      ${this._isNew ? x : y`<button class="btn" ?disabled=${!t || this._saving} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`}
      ${this._isNew ? x : y`<button class="btn danger" ?disabled=${!t || this._saving}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>`}`, o = this._origin ? JSON.stringify(this._p) !== JSON.stringify(this._origin) : !!(this._p.name || this._p.entities.length);
		return this.embedded ? y`<section class="embedded">${n}
      ${o && !this._isNew ? y`<p role="status" class="hint">${this._tr("pe_unapplied")}</p>` : x}
      <p class="hint">${this._tr(this._isNew ? "pe_create_save_hint" : "pe_shared_save_hint")}</p>
      ${r}
      <div class="actions apply-bar">${i}</div><div class="actions secondary-actions">${a}</div>
      ${this._applied ? y`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : x}
      ${this._scheduleOpen ? y`<wp-schedule .hass=${this.hass} .data=${this.data}
        .scope=${{
			kind: "program",
			programId: this._p.id
		}} .chart=${!1}
        @schedule-program-saved=${(e) => {
			e.stopPropagation(), this._adoptModeSchedule(e.detail);
		}}
        @closed=${(e) => {
			e.stopPropagation(), this._closeModeSchedule();
		}}></wp-schedule>` : x}
    </section>` : y`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${n}${r}<div slot="footer" class="actions">${i}${a}</div>
    </wp-dialog>`;
	}
	static {
		this.styles = [ti, l`
      :host { display: block; }
      fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
      .history { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .history .btn { font-size: 0.875rem; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .apply-bar { position: sticky; bottom: 0; z-index: 2; background: var(--card-background-color, #fff); padding: 8px 0; border-top: 1px solid var(--divider-color); }
      .embedded { padding-bottom: 72px; } /* room for the sticky bar (48 px button + 2 x 8 px padding + border) so it never covers text */
      .apply-bar .primary { flex: 1; }
      .mode-live { margin: 12px 0; padding: 8px 12px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .mode-associations { margin: 8px 0 12px; }
      .mode-associations summary { min-height: 44px; display: list-item; align-content: center; cursor: pointer; color: var(--wp-primary-text); }
      .actions .danger { margin-left: auto; }
      h3 { margin: 16px 0 4px; font-size: 0.9375rem; font-weight: 500; }
      .small { font-size: 0.75rem; }
      .svc-choice { align-items: flex-start; padding: 8px 0; }
      .svc-choice input { margin-top: 2px; }
      .svc-copy { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
      .svc-description { color: var(--secondary-text-color); font-size: 0.75rem; line-height: 1.45; margin-top: 3px; white-space: pre-line; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--wp-primary-text); border-bottom-color: var(--wp-primary-text); font-weight: 600; }
      ${c(ac)}
      .link {
        display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0; border: none; background: none;
        color: var(--wp-primary-text); font: inherit; font-size: 0.875rem; cursor: pointer; --mdc-icon-size: 20px;
      }
      .svc { display: flex; flex-direction: column; padding-left: 8px; }
      .active-profile { display: flex; align-items: center; gap: 8px; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `];
	}
};
D([T({ attribute: !1 })], Q.prototype, "hass", void 0), D([T({ attribute: !1 })], Q.prototype, "data", void 0), D([T({ attribute: !1 })], Q.prototype, "program", void 0), D([T({ type: Boolean })], Q.prototype, "embedded", void 0), D([E()], Q.prototype, "_applied", void 0), D([T({ attribute: !1 })], Q.prototype, "defaultTypes", void 0), D([E()], Q.prototype, "_p", void 0), D([E()], Q.prototype, "_isNew", void 0), D([E()], Q.prototype, "_tab", void 0), D([E()], Q.prototype, "_error", void 0), D([E()], Q.prototype, "_nameError", void 0), D([E()], Q.prototype, "_entitiesError", void 0), D([E()], Q.prototype, "_saving", void 0), D([E()], Q.prototype, "_scheduleOpen", void 0), D([E()], Q.prototype, "_picker", void 0), D([E()], Q.prototype, "_servicesOpen", void 0), Q = D([w("wp-program-editor")], Q);
// src/program-areas.ts
function cc(e, t) {
	return [...new Set([...e.map((e) => e.area), t].filter((e) => typeof e == "string" && e.length > 0))].sort((e, t) => e.localeCompare(t));
}
// src/domains.ts
function lc(e, t = []) {
	return [.../* @__PURE__ */ new Set([...e.flatMap((e) => e.entities.map((e) => e.entity_id.split(".")[0])), ...t])].filter(Boolean).sort();
}
var uc = /* @__PURE__ */ new Map();
function dc(e, t, n = "mdi:shape-outline") {
	let r = uc.get(t);
	return r || (r = Promise.resolve().then(() => e.callWS({
		type: "frontend/get_icons",
		category: "entity_component",
		integration: t
	})).then((e) => e?.resources?.[t]?._?.default ?? n).catch(() => (uc.delete(t), n)), uc.set(t, r)), r;
}
// src/filter-editor.ts
var fc = (e) => [...new Set(e.entities.map((e) => er(e.entity_id)))];
function pc(e, t, n = [e]) {
	let r = t?.types;
	return (!r?.length || fc(e).some((e) => r.includes(e))) && (t?.programs === void 0 || or(n, t.programs).has(e.id));
}
function mc(e, t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = (e) => {
		let t = i.get(e);
		return t || i.set(e, t = {
			type: e,
			label: n(e) || e,
			programs: []
		}), t;
	};
	for (let t of e) for (let e of fc(t)) a(e).programs.push({
		id: t.id,
		name: t.name
	});
	for (let e of t?.types ?? []) e && a(e);
	let o = [...i.values()].sort((e, t) => e.label.localeCompare(t.label, r) || e.type.localeCompare(t.type));
	for (let e of o) e.programs.sort((e, t) => e.name.localeCompare(t.name, r) || e.id.localeCompare(t.id));
	return {
		groups: o,
		orphans: gc(e, t)
	};
}
function hc(e, t, n) {
	return e.map((e) => ({
		id: e.id,
		name: e.name,
		domains: fc(e),
		devices: e.entities.map((e) => t(e.entity_id))
	})).sort((e, t) => e.name.localeCompare(t.name, n) || e.id.localeCompare(t.id));
}
var gc = (e, t) => (t?.programs ?? []).filter((t) => !or(e, [t]).size);
function _c(e, t, n) {
	if (!e.programs.length) return !n?.types?.length || n.types.includes(e.type) ? "on" : "off";
	let r = new Map(t.map((e) => [e.id, e])), i = e.programs.filter((e) => r.get(e.id) && pc(r.get(e.id), n, t)).length;
	return i === 0 ? "off" : i === e.programs.length ? "on" : "partial";
}
function vc(e, t, n, r) {
	let i = gc(e, t), a = t?.types ?? [], o = { programs: [...e.map((e) => e.id).filter((e) => n.has(e)), ...i] };
	return a.length && (o.types = [.../* @__PURE__ */ new Set([...a, ...r])]), o;
}
var yc = (e, t) => new Set(e.filter((n) => pc(n, t, e)).map((e) => e.id));
function bc(e, t, n, r) {
	let i = yc(e, t), a = e.find((e) => e.id === n);
	return r ? i.add(n) : i.delete(n), vc(e, t, i, r && a ? fc(a) : []);
}
function xc(e, t, n, r) {
	let i = yc(e, t), a = e.filter((e) => fc(e).includes(n));
	for (let e of a) r ? i.add(e.id) : i.delete(e.id);
	let o = vc(e, t, i, r ? [n] : []);
	return !r && !a.length && o.types && (o.types = o.types.filter((e) => e !== n)), o;
}
var Sc = () => ({
	types: void 0,
	programs: void 0
});
function Cc(e, t) {
	return vc(e, t, /* @__PURE__ */ new Set(), []);
}
function wc(e, t, n) {
	if (e.program !== void 0) {
		let { filter: t, ...r } = e;
		return {
			...r,
			program: n.id
		};
	}
	let r = t.some((e) => e.id === n.id) ? t : [...t, n], i = { ...e.filter ?? {} };
	return i.area && n.area !== i.area && delete i.area, pc(n, i, r) || (i = {
		...i,
		...bc(r, i, n.id, !0)
	}), {
		...e,
		filter: i
	};
}
// src/card-editor.ts
var Tc = 1500, Ec = (e) => JSON.stringify(e, (e, t) => t && typeof t == "object" && !Array.isArray(t) ? Object.fromEntries(Object.entries(t).sort(([e], [t]) => e.localeCompare(t))) : t), $ = class extends S {
	constructor(...e) {
		super(...e), this._config = { type: "custom:weekly-planner-card" }, this._programs = [], this._section = "display", this._editing = null, this._leftAll = !1, this._typeIcons = /* @__PURE__ */ new Map(), this._iconKey = "", this._createdName = "", this._createdProgramId = null, this._scheduleProgramId = null, this._editors = /* @__PURE__ */ new Map(), this._domainLoadKey = "", this._moved = "", this._announce = "", this._tabKey = (e) => {
			[
				"ArrowLeft",
				"ArrowRight",
				"Home",
				"End"
			].includes(e.key) && (e.preventDefault(), this._section = e.key === "Home" ? "display" : e.key === "End" || this._section === "display" ? "programs" : "display", this.updateComplete.then(() => this.renderRoot.querySelector(`#ce-tab-${this._section}`)?.focus()));
		};
	}
	setConfig(e) {
		let t = Us(e), n = this._sent;
		if (n && Date.now() < n.until) {
			let e = Ec(t);
			if (e === n.config) return;
			if (e === n.previous && n.resent < 5) {
				n.resent += 1, this._dispatch(this._config);
				return;
			}
		}
		this._sent = void 0, this._config.program !== t.program && (this._editing = null, this._createdName = "", this._createdProgramId = null), this._config = { ...t };
	}
	get _lang() {
		return $r(this.hass);
	}
	_tr(e, t) {
		return k(this._lang, e, t);
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate();
	}
	willUpdate() {
		jt(this.hass);
	}
	updated() {
		Qr(this.renderRoot), this._loadDomainNames(), this.isConnected && this.hass && !this._unsub && (this._unsub = $n(this.hass, (e) => this._setData(e)));
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
		if (this.hass && this._data && this._loadDomainIcons(lc(this._data.programs, this._config.filter?.types)), !this.hass?.loadBackendTranslation || !this._data) return;
		let e = lc(this._data.programs, this._config.filter?.types), t = `${this._lang}|${e.join(",")}`;
		t !== this._domainLoadKey && (this._domainLoadKey = t, this._domainLocalize = void 0, e.length && this.hass.loadBackendTranslation("title", e).then((e) => {
			t === this._domainLoadKey && (this._domainLocalize = e, this.requestUpdate());
		}).catch(() => {
			t === this._domainLoadKey && (this._domainLoadKey = "");
		}));
	}
	_loadDomainIcons(e) {
		let t = e.join(",");
		t !== this._iconKey && e.length && (this._iconKey = t, Promise.all(e.map(async (e) => [e, await dc(this.hass, e)])).then((e) => {
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
		}), o && (this._justCreated = t), o) this._emit(wc(this._config, this._data?.programs ?? [t], t));
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
		if (!e || !this.hass?.user?.is_admin || !e.can_edit || e.read_only) return x;
		let t = e.programs, n = this._editing ?? (this._isProgram && this._config.program ? this._config.program : ""), r = e.programs.find((e) => e.id === n);
		return y`<section class="program-settings">
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
          ${t.map((e) => y`<option value=${e.id} ?selected=${n === e.id}>${e.name}</option>`)}
        </select>
      </div>
      ${n === "new" || r ? this._programEditor(n, r) : x}
    </section>`;
	}
	get _canManage() {
		return !!(this.hass?.user?.is_admin && this._data?.can_edit && !this._data?.read_only);
	}
	_newProgram() {
		this._createdName = "", this._createdProgramId = null, this._editing = "new", this._section = "programs", this.updateComplete.then(() => this.renderRoot.querySelector("#ce-settings-program")?.focus());
	}
	_emit(e) {
		let t = Gs(e);
		this._sent = {
			config: Ec(t),
			previous: Ec(this._config),
			until: Date.now() + Tc,
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
		return y`<ha-switch class=${r ? "partial" : ""} .checked=${e} .disabled=${i} aria-label=${t}
      @change=${(e) => n(e.target.checked)}></ha-switch>`;
	}
	_treeChange(e) {
		let t = this._config.filter, n = t?.programs === void 0 && !t?.types?.length;
		e.programs === void 0 ? this._leftAll = !1 : n && (this._leftAll = !0), this._setFilter(e);
	}
	_displayPrograms() {
		let e = this._config.filter, t = this._data?.programs ?? [], n = e?.programs === void 0 && !e?.types?.length, { groups: r, orphans: i } = mc(t, e, (e) => this._typeLabel(e), this._lang), a = new Map(t.map((e) => [e.id, e])), o = hc(t, (e) => this.hass ? L(this.hass, e) : e, this._lang), s = n ? this._tr("ce_all_programs") : this._tr("ce_of_total", {
			on: String(t.filter((n) => pc(n, e, t)).length + i.length),
			total: String(t.length + i.length)
		});
		return y`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${s}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_all_programs")}</span>
        ${this._switch(n, this._tr("ce_all_programs"), (n) => this._treeChange(n ? Sc() : Cc(t, e)))}</div>
      ${!n && this._leftAll ? C("info", "", this._tr("ce_left_all"), {
			role: "status",
			extra: y`<div class="btns">
          <button class="btn" @click=${() => this._treeChange(Sc())}><ha-icon icon="mdi:restore"></ha-icon>${this._tr("ce_back_all")}</button></div>`
		}) : x}
      ${!o.length && !i.length ? y`<p class="hint">${this._tr("ce_no_types")}</p>` : x}
      ${r.length ? y`<div class="quick" role="group" aria-label=${this._tr("ce_quick_types")}>
        <div class="label">${this._tr("ce_quick_types")}</div>
        <p class="hint">${this._tr("ce_quick_types_hint")}</p>
        <div class="chips">${r.map((n) => {
			let r = _c(n, t, e), i = n.programs.filter((n) => pc(a.get(n.id), e, t)).length, o = n.programs.length ? String(this._tr("ce_type_count", {
				on: String(i),
				total: String(n.programs.length)
			})) : "", s = this._tr("ce_type_chip", { type: n.label });
			return y`<button class="chip ${r}" data-type=${n.type} aria-pressed=${r === "on" ? "true" : r === "partial" ? "mixed" : "false"}
            aria-label=${o ? `${s} (${o})` : s}
            @click=${() => this._treeChange(xc(t, e, n.type, r === "off"))}>
            ${r === "on" ? y`<ha-icon class="check-on" icon="mdi:check"></ha-icon>` : x}
            <ha-icon icon=${this._typeIcons.get(n.type) ?? "mdi:shape-outline"}></ha-icon>${n.label}${o ? y` <span class="count">${o}</span>` : x}</button>`;
		})}</div>
      </div>` : x}
      <div class="label">${this._tr("ce_programs_list")}</div>
      <div class="program-list" role="group" aria-label=${this._tr("ce_display_programs")}>
        ${o.map((n) => y`<div class="switch-row program-row" data-program=${n.id}>
          <span class="grow titles"><span class="type-title">${n.name}</span>
            <span class="type-names">${n.domains.map((e) => y`<ha-icon class="mini" icon=${this._typeIcons.get(e) ?? "mdi:shape-outline"}></ha-icon>`)}${n.devices.length ? n.devices.join(", ") : this._tr("ce_no_device")}</span></span>
          ${this._switch(pc(a.get(n.id), e, t), n.name, (r) => this._treeChange(bc(t, e, n.id, r)))}</div>`)}
        ${i.length ? y`<div class="label">${this._tr("ce_other_programs")}</div>${i.map((t) => y`<div class="switch-row"><span class="grow">${t}</span>
          ${this._switch(!0, t, () => this._treeChange({ programs: (e?.programs ?? []).filter((e) => e !== t) }))}</div>`)}` : x}
      </div>
    </details>`;
	}
	_customRows() {
		return Rs((this._data ? sr(this._data, this._config) : []).map((e) => ({
			id: e.id,
			name: e.name,
			type: er(e.entities[0]?.entity_id ?? ""),
			area: e.area
		})), "custom", {
			order: this._config.order,
			typeLabel: (e) => this._typeLabel(e),
			lang: this._lang
		});
	}
	_setOrder(e) {
		let t = (this._config.order ?? []).filter((t) => !e.includes(t));
		this._set("order", [...e, ...t]);
	}
	_move(e, t, n) {
		if (n < 0 || n >= e.length || n === t) return;
		this._moved = e[t], clearTimeout(this._movedTimer), this._movedTimer = setTimeout(() => this._moved = "", 1e3), this._setOrder(Bs(e, t, n));
		let r = this._customRows().find((n) => n.id === e[t])?.name ?? "";
		this._announce = this._tr("ce_moved", {
			name: r,
			n: String(n + 1),
			total: String(e.length)
		}), setTimeout(() => this._announce = "", 3e3), this.updateComplete.then(() => this.renderRoot.querySelector(`[data-order="${e[t]}"] .move:not([disabled])`)?.focus());
	}
	_drag(e, t, n) {
		let r = e.currentTarget, i = r.closest(".order-list");
		e.preventDefault(), r.setPointerCapture(e.pointerId);
		let a = n, o = () => Array.from(i.querySelectorAll(".order-row")), s = () => o().forEach((e, t) => e.classList.toggle("target", t === a && a !== n)), c = (e) => {
			let t = o().findIndex((t) => {
				let n = t.getBoundingClientRect();
				return e.clientY >= n.top && e.clientY <= n.bottom;
			});
			t >= 0 && (a = t, s());
		}, l = () => {
			r.removeEventListener("pointermove", c), r.removeEventListener("pointerup", l), r.removeEventListener("pointercancel", u), o().forEach((e) => e.classList.remove("target")), a !== n && this._setOrder(Bs(t, n, a));
		}, u = () => {
			a = n, l();
		};
		r.addEventListener("pointermove", c), r.addEventListener("pointerup", l), r.addEventListener("pointercancel", u);
	}
	_sortField() {
		let e = js(this._config.sort), t = e === "custom" ? this._customRows() : [], n = t.map((e) => e.id);
		return y`<div class="field"><label class="big" for="ce-sort">${this._tr("ce_sort")}</label>
        <select id="ce-sort" data-value=${e} @change=${(e) => this._set("sort", e.target.value)}>
          ${ks.map((t) => y`<option value=${t} ?selected=${t === e}>${this._tr(`ce_sort_${t}`)}</option>`)}
        </select></div>
      ${e === "custom" ? y`<p class="hint">${this._tr("ce_sort_custom_hint")}</p><ol class="order-list" aria-label=${this._tr("ce_order_list")}>
        ${bt(t, (e) => e.id, (e, t) => y`<li class="order-row ${e.id === this._moved ? "moved" : ""}" data-order=${e.id}>
          <button class="handle" tabindex="-1" aria-hidden="true" aria-label=${this._tr("ce_drag", { name: e.name })} @pointerdown=${(e) => this._drag(e, n, t)}><ha-icon icon="mdi:drag"></ha-icon></button>
          <span class="grow titles"><span class="type-title">${e.name}</span>
            <span class="type-names"><ha-icon class="mini" icon=${this._typeIcons.get(e.type) ?? "mdi:shape-outline"}></ha-icon>${e.type ? this._typeLabel(e.type) : this._tr("sort_other")}</span></span>
          <button class="move up" aria-label=${this._tr("ce_move_up", { name: e.name })} ?disabled=${t === 0} @click=${() => this._move(n, t, t - 1)}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
          <button class="move down" aria-label=${this._tr("ce_move_down", { name: e.name })} ?disabled=${t === n.length - 1} @click=${() => this._move(n, t, t + 1)}><ha-icon icon="mdi:arrow-down"></ha-icon></button></li>`)}
      </ol><p class="sr-only" role="status">${this._announce}</p>` : x}`;
	}
	render() {
		let e = this._config, t = cc(this._data?.programs ?? [], e.filter?.area), n = y`
      ${this._createdName ? y`<div class="created-next-step"><p class="hint" role="status">${this._tr("ce_created", { name: this._createdName })}</p>
        <button class="btn primary" @click=${() => {
			this._scheduleProgramId = this._createdProgramId;
		}}><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_define_schedule")}</button></div>` : x}
      <p class="hint">${this._tr("admin_zone_hint")}</p>
      ${this._editors.has("new") ? y`<p class="hint" role="status">${this._tr("ce_draft_kept")}</p>` : x}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${e.title ?? ""} @input=${(e) => this._set("title", e.target.value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(!0)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(!1)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram ? y`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${e.program ?? ""} @change=${(e) => this._set("program", e.target.value)}>
              ${this._programs.length === 0 ? y`<option value="">${this._tr("no_program")}</option>` : x}
              ${!this._programs.some((t) => t.id === e.program) && e.program ? y`<option value=${e.program} selected>${e.program}</option>` : x}
              ${this._programs.map((t) => y`<option value=${t.id} ?selected=${t.id === e.program}>${t.name}</option>`)}
            </select>
            ${this._canManage ? y`<div class="program-actions">
              <button class="btn" @click=${this._newProgram}><ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>
              ${e.program ? y`<button class="btn" @click=${() => {
			this._editing = e.program, this._section = "programs";
		}}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("ce_edit_selected")}</button>` : x}
            </div>` : x}</div>` : y`
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <select id="ce-area" data-value=${e.filter?.area ?? ""} aria-describedby="ce-area-help"
                @change=${(e) => this._setFilter({ area: e.target.value })}>
                <option value="">${this._tr("ce_all_areas")}</option>
                ${t.map((e) => y`<option value=${e}>${e}</option>`)}
              </select><p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>
            ${this._displayPrograms()}`}

      ${this._isProgram ? x : this._sortField()}
      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${e.schedule_view ?? "bars"} @change=${(e) => this._set("schedule_view", e.target.value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
          <option value="times">${this._tr("ce_times")}</option>
        </select>
      </div>
      <div class="switch-row"><span class="grow">${this._tr("ce_show_chart")}</span>
        ${this._switch(e.show_chart !== !1, this._tr("ce_show_chart"), (e) => this._set("show_chart", e))}</div>
      <p class="hint">${this._tr("ce_show_chart_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_chart_open")}</span>
        ${this._switch(e.chart_collapsed === !1, this._tr("ce_chart_open"), (e) => this._set("chart_collapsed", !e), !1, e.show_chart === !1)}</div>
      <p class="hint">${this._tr("ce_chart_open_hint")}</p>
    `, r = this._canManage;
		return y`
      ${r ? y`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button id="ce-tab-display" role="tab" aria-controls="ce-panel" tabindex=${this._section === "display" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "display"} @click=${() => {
			this._section = "display";
		}}>${this._tr("ce_display")}</button>
        <button id="ce-tab-programs" role="tab" aria-controls="ce-panel" tabindex=${this._section === "programs" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "programs"} @click=${() => {
			this._section = "programs";
		}}>${this._tr("ce_program_settings")}</button>
      </nav>` : x}
      <div id="ce-panel" role="tabpanel" aria-labelledby=${r ? `ce-tab-${this._section}` : x}>${r && this._section === "programs" ? this._settings() : n}</div>
      ${this._scheduleProgramId && this._data?.programs.some((e) => e.id === this._scheduleProgramId) ? y`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${{
			kind: "program",
			programId: this._scheduleProgramId
		}} .chart=${!1}
        @closed=${(e) => {
			e.stopPropagation(), this._scheduleProgramId = null;
		}}></wp-schedule>` : x}`;
	}
	static {
		this.styles = [ti, l`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 1rem; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--wp-primary-text); border-bottom-color: var(--wp-primary-text); font-weight: 600; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--wp-field-border); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .switch-row { display: flex; align-items: center; gap: 8px; min-height: 48px; overflow-wrap: anywhere; } .type-head { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; min-height: 48px; border: 0; background: none; color: inherit; text-align: start; cursor: pointer; } .type-body[hidden] { display: none; } ha-switch { padding: 12px 8px; margin: -12px -8px; flex: none; } ha-switch.partial { --mdc-theme-secondary: var(--warning-color, #ffa600); } .type-icon { flex: none; color: var(--secondary-text-color); } .titles { display: flex; flex-direction: column; flex: 1 1 0; min-width: 0; } .type-title { font-size: 1rem; overflow-wrap: normal; word-break: keep-all; } .type-names { font-size: 0.875rem; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .mini { --mdc-icon-size: 16px; vertical-align: -3px; margin-inline-end: 4px; } .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; } .chip { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px; border: 1px solid var(--wp-field-border); border-radius: 22px; background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; } .chip.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; } .chip.partial { border: 2px dashed var(--wp-primary-text); } .chip .count { font-size: 0.8125rem; opacity: .85; color: inherit; } .chip.on .count { opacity: 1; color: #fff; } .quick .hint { margin: 0; } .count { font-size: 0.875rem; color: var(--secondary-text-color); } .count b { color: var(--primary-text-color); } .type-head.static { cursor: default; } .chev-space { flex: none; width: 24px; } .order-list { list-style: none; margin: 0 0 12px; padding: 0; } .order-row { display: flex; align-items: center; gap: 4px; min-height: 56px; border-bottom: 1px solid var(--divider-color); } .order-row.target { border-top: 2px solid var(--wp-primary-text); } .field > label.big { font-size: 1rem; } .order-row.moved { background: var(--wp-field-border); box-shadow: inset 4px 0 0 var(--wp-primary-text); } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; } .order-row button.move { width: 48px; height: 48px; } .order-row button { flex: none; width: 44px; height: 48px; display: inline-flex; align-items: center; justify-content: center; border: 0; background: none; color: var(--primary-text-color); cursor: pointer; } .order-row button[disabled] { opacity: .35; cursor: default; } .order-row .handle { touch-action: none; cursor: grab; } .order-row .grow { flex: 1 1 0; min-width: 0; } .program-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }`];
	}
};
D([T({ attribute: !1 })], $.prototype, "hass", void 0), D([E()], $.prototype, "_config", void 0), D([E()], $.prototype, "_programs", void 0), D([E()], $.prototype, "_data", void 0), D([E()], $.prototype, "_section", void 0), D([E()], $.prototype, "_editing", void 0), D([E()], $.prototype, "_leftAll", void 0), D([E()], $.prototype, "_typeIcons", void 0), D([E()], $.prototype, "_createdName", void 0), D([E()], $.prototype, "_createdProgramId", void 0), D([E()], $.prototype, "_scheduleProgramId", void 0), D([E()], $.prototype, "_moved", void 0), D([E()], $.prototype, "_announce", void 0), $ = D([w("weekly-planner-card-editor")], $);
// src/components/times-day.ts
var Dc = class extends S {
	constructor(...e) {
		super(...e), this.rows = [], this.state = "ready", this.rest = "", this.editable = !1, this.locked = !1, this.lang = "en", this.deviceName = "";
	}
	_open() {
		this.editable && this.dispatchEvent(new CustomEvent("open-day", {
			bubbles: !0,
			composed: !0
		}));
	}
	_retry() {
		this.dispatchEvent(new CustomEvent("retry", {
			bubbles: !0,
			composed: !0
		})), this.renderRoot?.querySelector(".status")?.focus();
	}
	_button(e, t, n) {
		return y`<button class="action" @click=${n}><ha-icon icon=${t}></ha-icon>${e}</button>`;
	}
	_primary(e) {
		let t = F(this.lang, e.startMin);
		return e.carry ? k(this.lang, "times_since_yesterday", { time: t }) : e.random ? k(this.lang, "times_around", { time: t }) : t;
	}
	_details(e) {
		let t = [];
		if (e.done && t.push(k(this.lang, "times_done")), e.until) {
			let n = e.until.min === null ? "" : F(this.lang, e.until.min);
			t.push(e.until.day === "tomorrow" ? k(this.lang, "times_until_tomorrow", { time: n }) : k(this.lang, "times_until", { time: n }));
		}
		return e.rule && e.sun && t.push(y`<span class="sun"><ha-icon icon=${e.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${Os(this.lang, e.rule)}</span>`), e.random && t.push(k(this.lang, "times_random")), t.length ? y`<span class="more">${t.map((e) => y`<span>${e}</span>`)}</span>` : x;
	}
	_row(e) {
		let t = y`
      <span class="dot" style="background:${e.color}" aria-hidden="true"></span>
      <span class="text">
        <span class="main"><span class="time">${this._primary(e)}</span><span class="label">${e.label}</span>
          ${e.now ? y`<span class="now"><ha-icon icon="mdi:clock-outline"></ha-icon>${k(this.lang, "times_now")}</span>` : x}</span>
        ${this._details(e)}
      </span>`, n = this.deviceName ? `${this.deviceName}, ${e.label}` : e.label;
		return y`<li class=${e.now ? "current" : e.done ? "done" : ""} aria-current=${e.now ? "time" : x}>${this.editable && !this.locked ? y`<button class="row" title=${k(this.lang, "times_row_open", { name: n })} @click=${() => this._open()}>${t}</button>` : y`<div class="row">${t}</div>`}</li>`;
	}
	_message() {
		return this.state === "loading" ? y`<p class="msg">${k(this.lang, "times_loading")}</p>` : this.state === "failed" ? y`<p class="msg">${k(this.lang, "times_failed")}</p>` : this.rows.length ? x : y`<p class="msg"><strong>${k(this.lang, "times_none")}</strong>
        ${this.rest ? y`<span>${k(this.lang, "times_rest", { name: this.rest })}</span>` : x}</p>`;
	}
	render() {
		let e = this.state === "ready" && this.rows.length > 0;
		return y`<div class="status" role="status" aria-live="polite" tabindex="-1">${this._message()}</div>
      ${e ? y`<ul role="list" aria-label=${k(this.lang, "times_list_label")}>${this.rows.map((e) => this._row(e))}</ul>
        ${this.editable ? this._button(k(this.lang, "times_edit"), "mdi:calendar-edit", () => this._open()) : x}` : this.state === "failed" ? this._button(k(this.lang, "times_retry"), "mdi:refresh", () => this._retry()) : this.state === "ready" && this.editable ? this._button(k(this.lang, "times_add"), "mdi:plus", () => this._open()) : x}`;
	}
	static {
		this.styles = l`
    ${Ze}
    :host { display: block; --wp-times-detail: color-mix(in srgb, var(--primary-text-color) 75%, var(--card-background-color, transparent)); }
    ul { list-style: none; margin: 0; padding: 0; }
    li + li { border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2)); }
    .row {
      display: flex; align-items: flex-start; gap: 12px; width: 100%; min-height: 44px; box-sizing: border-box; padding: 8px 4px;
      margin: 0; border: 0; background: none; color: var(--primary-text-color); font: inherit; text-align: left;
    }
    button.row { cursor: pointer; border-radius: 8px; }
    button.row:hover { background: var(--secondary-background-color); }
    button.row:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .dot { flex: none; width: 14px; height: 14px; margin-top: 5px; border-radius: 7px; box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5)); }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .main { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 10px; line-height: 1.5; font-size: 1rem; }
    .time { font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
    .label { min-width: 0; overflow-wrap: anywhere; }
    .more { display: flex; flex-wrap: wrap; column-gap: 12px; font-size: 1rem; line-height: 1.5; color: var(--wp-times-detail); overflow-wrap: anywhere; }
    .sun { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
    .now {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; padding: 0 8px; border-radius: 10px;
      background: var(--wp-primary-fill); color: #fff; font-size: 1rem; font-weight: 600; line-height: 1.5;
    }
    /* a finished row: lighter weight and a softer grey (still >= 4.5:1), and the word "done" says it, so colour is never the only cue */
    li.done .main { color: color-mix(in srgb, var(--primary-text-color) 68%, var(--card-background-color, transparent)); }
    li.done .more { color: color-mix(in srgb, var(--primary-text-color) 68%, var(--card-background-color, transparent)); }
    li.done button.row:hover { background: none; }
    .status { outline: none; }
    li.done .time { font-weight: 400; }
    li.current { background: color-mix(in srgb, var(--wp-primary-fill) 16%, transparent); border-radius: 8px; box-shadow: inset 4px 0 0 var(--wp-primary-fill); }
    .msg { margin: 0; padding: 12px 4px; display: flex; flex-direction: column; gap: 2px; color: var(--primary-text-color); }
    .msg span { font-size: 1rem; color: var(--wp-times-detail); }
    .action {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; max-width: 100%; min-height: 48px; margin: 8px 0 0;
      padding: 8px 16px; border: 1px solid var(--wp-field-border); border-radius: 8px; background: none; color: var(--wp-primary-text);
      font: inherit; font-weight: 600; text-align: center; overflow-wrap: anywhere; cursor: pointer; --mdc-icon-size: 20px;
    }
    .action:hover { background: var(--secondary-background-color); }
  `;
	}
};
D([T({ attribute: !1 })], Dc.prototype, "rows", void 0), D([T()], Dc.prototype, "state", void 0), D([T()], Dc.prototype, "rest", void 0), D([T({ type: Boolean })], Dc.prototype, "editable", void 0), D([T({ type: Boolean })], Dc.prototype, "locked", void 0), D([T()], Dc.prototype, "lang", void 0), D([T({ attribute: "device-name" })], Dc.prototype, "deviceName", void 0), Dc = D([w("wp-times-day")], Dc), window.customCards = window.customCards || [], window.customCards.some((e) => e.type === "weekly-planner-card") || window.customCards.push({
	type: "weekly-planner-card",
	name: "Weekly Planner",
	description: "Weekly schedules for thermostats, covers, lights and more.",
	preview: !1
});
